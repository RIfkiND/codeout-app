import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get available languages for templates
	const { data: languages } = await locals.supabase
		.from('programming_languages')
		.select('id, name, display_name, template_code')
		.eq('is_active', true)
		.order('display_name');

	return {
		languages: languages || []
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		try {
			const { session, user } = await locals.safeGetSession();
			if (!session || !user) {
				return fail(401, { error: 'Authentication required' });
			}

			// Verify admin role
			const { data: userData } = await locals.supabase
				.from('users')
				.select('role')
				.eq('id', user.id)
				.single();

			if (!userData || (userData as { role: string }).role !== 'admin') {
				return fail(403, { error: 'Admin access required' });
			}

			const formData = await request.formData();
			
			// Parse complex field data
			let testCases, hints, images;
			try {
				testCases = JSON.parse(formData.get('test_cases')?.toString() || '[]');
				hints = JSON.parse(formData.get('hints')?.toString() || '[]');
				images = JSON.parse(formData.get('images')?.toString() || '[]');
			} catch {
				return fail(400, { error: 'Invalid JSON data in form fields' });
			}

			// Prepare challenge data for the API
			const challengeData = {
				title: formData.get('title')?.toString(),
				description: formData.get('description')?.toString(),
				difficulty: formData.get('difficulty')?.toString(),
				category: formData.get('category')?.toString() || null,
				time_limit: parseInt(formData.get('time_limit')?.toString() || '1000'),
				memory_limit: parseInt(formData.get('memory_limit')?.toString() || '256'),
				max_score: parseInt(formData.get('max_score')?.toString() || '100'),
				tags: formData.get('tags')?.toString()?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
				starter_code: formData.get('starter_code')?.toString() || '',
				solution_explanation: formData.get('solution_explanation')?.toString() || '',
				input_example: formData.get('input_example')?.toString() || '',
				output_example: formData.get('output_example')?.toString() || '',
				video_url: formData.get('video_url')?.toString() || null,
				testcases: testCases,
				hints: hints,
				images: images,
				is_global: true // Admin creates global challenges
			};

			// Validate required fields
			if (!challengeData.title || !challengeData.description || !challengeData.difficulty) {
				return fail(400, { error: 'Title, description, and difficulty are required' });
			}

		// Use the existing API endpoint
		const response = await fetch(`${url.origin}/api/challenges`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${session.access_token}`
			},
			body: JSON.stringify(challengeData)
		});			const result = await response.json();

			if (!response.ok) {
				return fail(response.status, { error: result.error || 'Failed to create challenge' });
			}

			throw redirect(303, `/admin/challenges`);
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			console.error('Challenge creation error:', error);
			return fail(500, { error: 'Failed to create challenge' });
		}
	}
};