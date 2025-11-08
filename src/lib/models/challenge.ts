import type { Challenge, ChallengeInsert, ChallengeUpdate, Category, CategoryInsert, CategoryUpdate, ChallengeCategory, ChallengeCategoryInsert, ChallengeCategoryUpdate, DifficultyLevel } from './database';

// Re-export types for backward compatibility
export type { Challenge, ChallengeInsert, ChallengeUpdate, Category, CategoryInsert, CategoryUpdate, ChallengeCategory, ChallengeCategoryInsert, ChallengeCategoryUpdate, DifficultyLevel };

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