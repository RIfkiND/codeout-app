import type { Submission, SubmissionInsert, SubmissionUpdate, SinglePlayerSession, SinglePlayerSessionInsert, SinglePlayerSessionUpdate, SessionStatus } from './database';

// Re-export types for backward compatibility
export type { Submission, SubmissionInsert, SubmissionUpdate, SinglePlayerSession, SinglePlayerSessionInsert, SinglePlayerSessionUpdate, SessionStatus };

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