// Re-export all model types for easy importing
export * from './database';
export * from './user';
export * from './challenge';
export * from './lobby';
export * from './submission';

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