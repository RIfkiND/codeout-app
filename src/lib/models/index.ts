// Re-export core types without conflicts
export type { 
  // Database
  Database, Json, DifficultyLevel, LobbyStatus, SessionStatus, UserRole,
  
  // Core entities
  User, UserInsert, UserUpdate, UserProfile, UserProfileInsert, UserProfileUpdate,
  Challenge, ChallengeInsert, ChallengeUpdate,
  Lobby, LobbyInsert, LobbyUpdate, LobbyUser, LobbyUserInsert, LobbyUserUpdate,
  Submission, SubmissionInsert, SubmissionUpdate,
  Category, CategoryInsert, CategoryUpdate,
  ChallengeCategory, ChallengeCategoryInsert, ChallengeCategoryUpdate,
  SinglePlayerSession, SinglePlayerSessionInsert, SinglePlayerSessionUpdate,
  ProgrammingLanguage, ProgrammingLanguageInsert, ProgrammingLanguageUpdate,
  MediaFile, MediaFileInsert, MediaFileUpdate,
  
  // Extended types
  UserWithProfile, LobbyWithUsers, ChallengeWithCategories
} from './database';

// Re-export specific types from other files without conflicts
export type { 
  LobbyWithCreator, LobbyParticipant 
} from './lobby';

export type { 
  SubmissionWithUser, SubmissionWithChallenge, SupportedLanguage
} from './submission';

// Common utility types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Filter types
export interface ChallengeFilters {
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  lobby_id?: string;
  is_global?: boolean;
}

export interface LobbyFilters {
  status?: 'waiting' | 'running' | 'finished';
  created_by?: string;
}

export interface SubmissionFilters {
  user_id?: string;
  challenge_id?: string;
  lobby_id?: string;
  language?: string;
  is_correct?: boolean;
}