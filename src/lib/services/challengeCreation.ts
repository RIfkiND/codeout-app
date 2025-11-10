import { supabase } from '$lib/supabaseClient.js';
import type { Challenge } from '$lib/models/index.js';

export interface CreateChallengeData {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  test_cases: Array<{
    input: string;
    expected_output: string;
    is_hidden: boolean;
    description?: string;
  }>;
  images?: File[];
  video_url?: string;
  hints?: string[];
  solution_explanation?: string;
  starter_code?: Record<string, string>; // language -> code
  tags?: string[];
  time_limit?: number;
  memory_limit?: number;
}

export interface UploadedImage {
  id: string;
  url: string;
  filename: string;
  alt_text?: string;
}

export class ChallengeCreationService {
  /**
   * Upload images to Supabase Storage
   */
  static async uploadImages(files: File[], userId: string): Promise<UploadedImage[]> {
    const uploadedImages: UploadedImage[] = [];

    for (const file of files) {
      try {
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('challenge-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('challenge-images')
          .getPublicUrl(fileName);

        // Store media file record in database
        const { data: mediaFile, error: mediaError } = await supabase
          .from('media_files')
          .insert({
            filename: fileName,
            original_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
            storage_path: uploadData.path,
            uploaded_by: userId
          })
          .select('id')
          .single();

        if (mediaError) throw mediaError;

        uploadedImages.push({
          id: mediaFile.id,
          url: publicUrl,
          filename: file.name,
          alt_text: `Image for challenge: ${file.name}`
        });

      } catch (error) {
        console.error(`Failed to upload image ${file.name}:`, error);
        throw new Error(`Failed to upload image ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return uploadedImages;
  }

  /**
   * Create a new challenge with all features
   */
  static async createChallenge(challengeData: CreateChallengeData, createdBy: string): Promise<Challenge> {
    try {
      // Upload images if provided
      let uploadedImages: UploadedImage[] = [];
      if (challengeData.images && challengeData.images.length > 0) {
        uploadedImages = await this.uploadImages(challengeData.images, createdBy);
      }

      // Prepare challenge data for database
      const challengeRecord = {
        title: challengeData.title,
        description: challengeData.description,
        difficulty: challengeData.difficulty,
        category: challengeData.category,
        test_cases: challengeData.test_cases,
        time_limit: challengeData.time_limit || 5000,
        memory_limit: challengeData.memory_limit || 128,
        created_by: createdBy,
        images: uploadedImages.map(img => ({
          id: img.id,
          url: img.url,
          filename: img.filename,
          alt_text: img.alt_text
        })),
        video_url: challengeData.video_url,
        hints: challengeData.hints || [],
        solution_explanation: challengeData.solution_explanation,
        starter_code: challengeData.starter_code || {},
        tags: challengeData.tags || []
      };

      // Insert challenge into database
      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert(challengeRecord)
        .select(`
          *,
          creator:created_by (
            id,
            username,
            display_name
          )
        `)
        .single();

      if (error) throw error;

      return challenge as Challenge;

    } catch (error) {
      console.error('Failed to create challenge:', error);
      throw new Error(`Failed to create challenge: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Update an existing challenge
   */
  static async updateChallenge(
    challengeId: string, 
    updates: Partial<CreateChallengeData>, 
    userId: string
  ): Promise<Challenge> {
    try {
      // Check if user owns the challenge
      const { data: existingChallenge, error: fetchError } = await supabase
        .from('challenges')
        .select('created_by, images')
        .eq('id', challengeId)
        .single();

      if (fetchError) throw fetchError;
      if (existingChallenge.created_by !== userId) {
        throw new Error('You can only update your own challenges');
      }

      let uploadedImages: UploadedImage[] = [];
      
      // Handle new images
      if (updates.images && updates.images.length > 0) {
        uploadedImages = await this.uploadImages(updates.images, userId);
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.difficulty) updateData.difficulty = updates.difficulty;
      if (updates.category) updateData.category = updates.category;
      if (updates.test_cases) updateData.test_cases = updates.test_cases;
      if (updates.video_url !== undefined) updateData.video_url = updates.video_url;
      if (updates.hints) updateData.hints = updates.hints;
      if (updates.solution_explanation !== undefined) updateData.solution_explanation = updates.solution_explanation;
      if (updates.starter_code) updateData.starter_code = updates.starter_code;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.time_limit) updateData.time_limit = updates.time_limit;
      if (updates.memory_limit) updateData.memory_limit = updates.memory_limit;

      // Handle images - merge with existing if new ones uploaded
      if (uploadedImages.length > 0) {
        const existingImages = Array.isArray(existingChallenge.images) ? existingChallenge.images : [];
        updateData.images = [
          ...existingImages,
          ...uploadedImages.map(img => ({
            id: img.id,
            url: img.url,
            filename: img.filename,
            alt_text: img.alt_text
          }))
        ];
      }

      // Update challenge
      const { data: challenge, error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('id', challengeId)
        .select(`
          *,
          creator:created_by (
            id,
            username,
            display_name
          )
        `)
        .single();

      if (error) throw error;

      return challenge as Challenge;

    } catch (error) {
      console.error('Failed to update challenge:', error);
      throw new Error(`Failed to update challenge: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete an image from a challenge
   */
  static async deleteImage(challengeId: string, imageId: string, userId: string): Promise<void> {
    try {
      // Verify ownership
      const { data: challenge, error: fetchError } = await supabase
        .from('challenges')
        .select('created_by, images')
        .eq('id', challengeId)
        .single();

      if (fetchError) throw fetchError;
      if (challenge.created_by !== userId) {
        throw new Error('You can only modify your own challenges');
      }

      // Get media file info
      const { data: mediaFile, error: mediaError } = await supabase
        .from('media_files')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      if (mediaError) throw mediaError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('challenge-images')
        .remove([mediaFile.storage_path]);

      if (storageError) throw storageError;

      // Delete from media_files table
      const { error: deleteError } = await supabase
        .from('media_files')
        .delete()
        .eq('id', imageId);

      if (deleteError) throw deleteError;

      // Update challenge to remove image reference
      const existingImagesArray = Array.isArray(challenge.images) ? challenge.images : [];
      const updatedImages = existingImagesArray.filter((img) => {
        if (typeof img === 'object' && img !== null && 'id' in img) {
          return (img as { id: string }).id !== imageId;
        }
        return true;
      });
      
      const { error: updateError } = await supabase
        .from('challenges')
        .update({ images: updatedImages })
        .eq('id', challengeId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Failed to delete image:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get default starter code for a language
   */
  static async getStarterCode(language: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('programming_languages')
        .select('template_code')
        .eq('name', language)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data?.template_code || '';

    } catch (error) {
      console.error(`Failed to get starter code for ${language}:`, error);
      return '';
    }
  }

  /**
   * Get all programming languages for challenge creation
   */
  static async getProgrammingLanguages() {
    try {
      const { data, error } = await supabase
        .from('programming_languages')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Failed to fetch programming languages:', error);
      return [];
    }
  }

  /**
   * Validate test cases
   */
  static validateTestCases(testCases: Array<{ input: string; expected_output: string }>): string[] {
    const errors: string[] = [];

    if (!testCases || testCases.length === 0) {
      errors.push('At least one test case is required');
    }

    testCases.forEach((testCase, index) => {
      if (!testCase.input.trim()) {
        errors.push(`Test case ${index + 1}: Input cannot be empty`);
      }
      if (!testCase.expected_output.trim()) {
        errors.push(`Test case ${index + 1}: Expected output cannot be empty`);
      }
    });

    // Check for at least one visible test case (if is_hidden property exists)
    const visibleTestCases = testCases.filter(tc => 
      !('is_hidden' in tc) || !tc.is_hidden
    );
    if (visibleTestCases.length === 0) {
      errors.push('At least one test case must be visible to users');
    }

    return errors;
  }

  /**
   * Validate challenge data before submission
   */
  static validateChallengeData(data: CreateChallengeData): string[] {
    const errors: string[] = [];

    if (!data.title?.trim()) errors.push('Title is required');
    if (!data.description?.trim()) errors.push('Description is required');
    if (!data.difficulty) errors.push('Difficulty is required');
    if (!data.category?.trim()) errors.push('Category is required');

    // Validate test cases
    const testCaseErrors = this.validateTestCases(data.test_cases || []);
    errors.push(...testCaseErrors);

    // Validate time and memory limits
    if (data.time_limit && (data.time_limit < 1000 || data.time_limit > 60000)) {
      errors.push('Time limit must be between 1000ms and 60000ms');
    }

    if (data.memory_limit && (data.memory_limit < 64 || data.memory_limit > 1024)) {
      errors.push('Memory limit must be between 64MB and 1024MB');
    }

    // Validate images
    if (data.images) {
      data.images.forEach((file, index) => {
        if (!file.type.startsWith('image/')) {
          errors.push(`File ${index + 1}: Only image files are allowed`);
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          errors.push(`File ${index + 1}: Image size must be less than 5MB`);
        }
      });
    }

    return errors;
  }
}