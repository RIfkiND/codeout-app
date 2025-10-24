import type { Database } from './database';

// Challenge types
export type Challenge = Database['public']['Tables']['challenges']['Row'];
export type ChallengeInsert = Database['public']['Tables']['challenges']['Insert'];
export type ChallengeUpdate = Database['public']['Tables']['challenges']['Update'];

// Category types
export type Category = Database['public']['Tables']['categories']['Row'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

// Challenge categories junction
export type ChallengeCategory = Database['public']['Tables']['challenge_categories']['Row'];
export type ChallengeCategoryInsert = Database['public']['Tables']['challenge_categories']['Insert'];
export type ChallengeCategoryUpdate = Database['public']['Tables']['challenge_categories']['Update'];

// Enums
export type DifficultyLevel = Database['public']['Enums']['difficulty_level'];

// Extended challenge type with relations
export interface ChallengeWithCategories extends Challenge {
  challenge_categories?: Array<{
    categories: Category;
  }>;
}

export interface ChallengeWithLobby extends Challenge {
  lobbies?: {
    id: string;
    name: string;
  } | null;
}

// Test case structure
export interface TestCase {
  input: string;
  expected_output: string;
  is_hidden?: boolean;
}