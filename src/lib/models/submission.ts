import type { Database } from './database';

// Submission types
export type Submission = Database['public']['Tables']['submissions']['Row'];
export type SubmissionInsert = Database['public']['Tables']['submissions']['Insert'];
export type SubmissionUpdate = Database['public']['Tables']['submissions']['Update'];

// Single player session types
export type SinglePlayerSession = Database['public']['Tables']['single_player_sessions']['Row'];
export type SinglePlayerSessionInsert = Database['public']['Tables']['single_player_sessions']['Insert'];
export type SinglePlayerSessionUpdate = Database['public']['Tables']['single_player_sessions']['Update'];

// Enums
export type SessionStatus = Database['public']['Enums']['session_status'];

// Extended submission types with relations
export interface SubmissionWithChallenge extends Submission {
  challenges?: {
    id: string;
    title: string;
    difficulty: string;
    max_score: number;
  };
}

export interface SubmissionWithUser extends Submission {
  users?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export interface SubmissionWithDetails extends Submission {
  challenges?: {
    id: string;
    title: string;
    difficulty: string;
    max_score: number;
  };
  users?: {
    id: string;
    name: string | null;
    email: string | null;
  };
  lobbies?: {
    id: string;
    name: string;
  } | null;
}

// Code execution result
export interface CodeExecutionResult {
  is_correct: boolean;
  score: number;
  execution_time?: number;
  memory_used?: number;
  test_cases_passed: number;
  total_test_cases: number;
  error_message?: string;
  output?: string;
}

// Supported programming languages
export const SUPPORTED_LANGUAGES = [
  'javascript',
  'python',
  'java',
  'cpp',
  'c',
  'csharp',
  'go',
  'rust',
  'typescript'
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];