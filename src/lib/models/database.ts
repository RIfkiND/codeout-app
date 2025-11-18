// Core database types - simplified and maintainable
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Enums
export type DifficultyLevel = "easy" | "medium" | "hard"
export type LobbyStatus = "waiting" | "selecting_challenge" | "countdown" | "running" | "finished"
export type ConnectionStatus = "connected" | "disconnected" | "finished"
export type MessageType = "chat" | "system" | "announcement"
export type SessionStatus = "in_progress" | "completed"
export type UserRole = "user" | "admin"

// Core table types
export interface User {
  id: string
  name: string | null
  email: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  github_username: string | null
  total_score: number
  challenges_solved: number
  preferred_language: string
  created_at: string
  updated_at: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  input_example: string | null
  output_example: string | null
  testcases: Json | null
  difficulty: DifficultyLevel
  max_score: number
  time_limit: number
  memory_limit: number
  is_global: boolean
  lobby_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  images: Json | null
  video_url: string | null
  hints: Json | null
  solution_explanation: string | null
  starter_code: Json | null
  tags: string[] | null
  view_count: number | null
  attempt_count: number | null
  success_rate: number | null
  category: string | null
}

export interface Lobby {
  id: string
  name: string
  description: string | null
  status: LobbyStatus
  start_time: string | null
  end_time: string | null
  max_participants: number
  is_private: boolean | null
  time_limit_minutes: number | null
  challenge_id: string | null  // Added for multiplayer features
  countdown_start_time: string | null  // Added for multiplayer features
  settings: Json | null  // Added for multiplayer features
  created_by: string
  created_at: string
  updated_at: string
}

export interface LobbyUser {
  id: string
  lobby_id: string
  user_id: string
  joined_at: string
  is_ready: boolean  // Added for multiplayer features
  is_creator: boolean  // Added for multiplayer features
  final_score: number  // Added for multiplayer features
  final_rank: number | null  // Added for multiplayer features
  connection_status: ConnectionStatus  // Added for multiplayer features
}

export interface LobbyMessage {
  id: string
  lobby_id: string
  user_id: string | null
  message: string
  message_type: MessageType
  created_at: string
}



export interface Submission {
  id: string
  user_id: string
  lobby_id: string | null
  single_player_session_id: string | null
  challenge_id: string
  code: string
  language: string
  is_correct: boolean
  score: number
  execution_time: number | null
  memory_used: number | null
  test_cases_passed: number
  total_test_cases: number
  error_message: string | null
  submitted_at: string
  rank: number | null  // Added for multiplayer features
  completion_time_ms: number | null  // Added for multiplayer features
  language_version: string | null
  output: string | null
  compilation_error: string | null
  runtime_error: string | null
  test_results: Json | null
  submission_number: number | null
}

export interface SinglePlayerSession {
  id: string
  user_id: string
  status: SessionStatus
  total_score: number
  challenges_completed: number
  start_time: string
  end_time: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface ChallengeCategory {
  id: string
  challenge_id: string
  category_id: string
  created_at: string
}

export interface ProgrammingLanguage {
  id: string
  name: string
  display_name: string
  file_extension: string
  monaco_language_id: string | null
  piston_language: string | null
  piston_version: string | null
  is_active: boolean | null
  template_code: string | null
  created_at: string
}

export interface MediaFile {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  storage_path: string
  uploaded_by: string | null
  created_at: string
}

// Multi-challenge lobby tables
export interface LobbyChallenge {
  id: string
  lobby_id: string
  challenge_id: string
  challenge_order: number
  status: 'pending' | 'active' | 'completed'
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface LobbyChallengeSubmission {
  id: string
  lobby_id: string
  challenge_id: string
  user_id: string
  submission_id: string | null
  challenge_order: number
  completion_time_ms: number | null
  score: number
  rank: number | null
  is_completed: boolean
  created_at: string
}

export interface LobbyStanding {
  id: string
  lobby_id: string
  user_id: string
  total_score: number
  challenges_completed: number
  average_completion_time_ms: number | null
  final_rank: number | null
  created_at: string
  updated_at: string
}

// Insert types (optional fields)
export type UserInsert = Omit<User, 'created_at' | 'updated_at'> & {
  created_at?: string
  updated_at?: string
}

export type UserProfileInsert = Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type LobbyInsert = Omit<Lobby, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type LobbyUserInsert = Omit<LobbyUser, 'id' | 'joined_at'> & {
  id?: string
  joined_at?: string
}

export type ChallengeInsert = Omit<Challenge, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ChallengeCategoryInsert = Omit<ChallengeCategory, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type SubmissionInsert = Omit<Submission, 'id' | 'submitted_at'> & {
  id?: string
  submitted_at?: string
}

export type SinglePlayerSessionInsert = Omit<SinglePlayerSession, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ProgrammingLanguageInsert = Omit<ProgrammingLanguage, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type MediaFileInsert = Omit<MediaFile, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type LobbyChallengeInsert = Omit<LobbyChallenge, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type LobbyChallengeSubmissionInsert = Omit<LobbyChallengeSubmission, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type LobbyStandingInsert = Omit<LobbyStanding, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

// Update types (all fields optional)
export type UserUpdate = Partial<User>
export type UserProfileUpdate = Partial<UserProfile>
export type LobbyUpdate = Partial<Lobby>
export type LobbyUserUpdate = Partial<LobbyUser>
export type ChallengeUpdate = Partial<Challenge>
export type CategoryUpdate = Partial<Category>
export type ChallengeCategoryUpdate = Partial<ChallengeCategory>
export type SubmissionUpdate = Partial<Submission>
export type SinglePlayerSessionUpdate = Partial<SinglePlayerSession>
export type ProgrammingLanguageUpdate = Partial<ProgrammingLanguage>
export type MediaFileUpdate = Partial<MediaFile>
export type LobbyChallengeUpdate = Partial<LobbyChallenge>
export type LobbyChallengeSubmissionUpdate = Partial<LobbyChallengeSubmission>
export type LobbyStandingUpdate = Partial<LobbyStanding>

// Extended types with relations
export interface UserWithProfile extends User {
  user_profiles?: UserProfile | null
}

export interface LobbyWithUsers extends Lobby {
  lobby_users?: Array<{
    users: {
      id: string
      name: string | null
      email: string | null
    }
    joined_at: string
  }>
}

export interface ChallengeWithCategories extends Challenge {
  challenge_categories?: Array<{
    categories: Category
  }>
}

// Insert types for new tables
export type LobbyMessageInsert = Omit<LobbyMessage, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type LobbyMessageUpdate = Partial<LobbyMessage>

// Legacy compatibility - maintains the old Database structure for existing imports
export type Database = {
  public: {
    Tables: {
      users: { Row: User, Insert: UserInsert, Update: UserUpdate }
      lobbies: { Row: Lobby, Insert: LobbyInsert, Update: LobbyUpdate }
      lobby_messages: { Row: LobbyMessage, Insert: LobbyMessageInsert, Update: LobbyMessageUpdate }
      challenges: { Row: Challenge, Insert: ChallengeInsert, Update: ChallengeUpdate }
      submissions: { Row: Submission, Insert: SubmissionInsert, Update: SubmissionUpdate }
      lobby_users: { Row: LobbyUser, Insert: LobbyUserInsert, Update: LobbyUserUpdate }
      lobby_challenges: { Row: LobbyChallenge, Insert: LobbyChallengeInsert, Update: LobbyChallengeUpdate }
      lobby_challenge_submissions: { Row: LobbyChallengeSubmission, Insert: LobbyChallengeSubmissionInsert, Update: LobbyChallengeSubmissionUpdate }
      lobby_standings: { Row: LobbyStanding, Insert: LobbyStandingInsert, Update: LobbyStandingUpdate }
      categories: { Row: Category, Insert: CategoryInsert, Update: CategoryUpdate }
      challenge_categories: { Row: ChallengeCategory, Insert: ChallengeCategoryInsert, Update: ChallengeCategoryUpdate }
      user_profiles: { Row: UserProfile, Insert: UserProfileInsert, Update: UserProfileUpdate }
      single_player_sessions: { Row: SinglePlayerSession, Insert: SinglePlayerSessionInsert, Update: SinglePlayerSessionUpdate }
      programming_languages: { Row: ProgrammingLanguage, Insert: ProgrammingLanguageInsert, Update: ProgrammingLanguageUpdate }
      media_files: { Row: MediaFile, Insert: MediaFileInsert, Update: MediaFileUpdate }
    }
    Enums: {
      difficulty_level: DifficultyLevel
      lobby_status: LobbyStatus
      connection_status: ConnectionStatus
      message_type: MessageType
      session_status: SessionStatus
      user_role: UserRole
    }
  }
}