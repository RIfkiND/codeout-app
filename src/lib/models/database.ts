export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
      challenge_categories: {
        Row: {
          id: string
          challenge_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          category_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_categories_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          }
        ]
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          input_example: string | null
          output_example: string | null
          testcases: Json | null
          difficulty: "easy" | "medium" | "hard"
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
        Insert: {
          id?: string
          title: string
          description: string
          input_example?: string | null
          output_example?: string | null
          testcases?: Json | null
          difficulty?: "easy" | "medium" | "hard"
          max_score?: number
          time_limit?: number
          memory_limit?: number
          is_global?: boolean
          lobby_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          images?: Json | null
          video_url?: string | null
          hints?: Json | null
          solution_explanation?: string | null
          starter_code?: Json | null
          tags?: string[] | null
          view_count?: number | null
          attempt_count?: number | null
          success_rate?: number | null
          category?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          input_example?: string | null
          output_example?: string | null
          testcases?: Json | null
          difficulty?: "easy" | "medium" | "hard"
          max_score?: number
          time_limit?: number
          memory_limit?: number
          is_global?: boolean
          lobby_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          images?: Json | null
          video_url?: string | null
          hints?: Json | null
          solution_explanation?: string | null
          starter_code?: Json | null
          tags?: string[] | null
          view_count?: number | null
          attempt_count?: number | null
          success_rate?: number | null
          category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lobbies: {
        Row: {
          id: string
          name: string
          status: "waiting" | "running" | "finished"
          start_time: string | null
          end_time: string | null
          max_participants: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: "waiting" | "running" | "finished"
          start_time?: string | null
          end_time?: string | null
          max_participants?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: "waiting" | "running" | "finished"
          start_time?: string | null
          end_time?: string | null
          max_participants?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobbies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lobby_users: {
        Row: {
          id: string
          lobby_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          lobby_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          lobby_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lobby_users_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobby_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      single_player_sessions: {
        Row: {
          id: string
          user_id: string
          status: "in_progress" | "completed"
          total_score: number
          challenges_completed: number
          start_time: string
          end_time: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: "in_progress" | "completed"
          total_score?: number
          challenges_completed?: number
          start_time?: string
          end_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: "in_progress" | "completed"
          total_score?: number
          challenges_completed?: number
          start_time?: string
          end_time?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "single_player_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      submissions: {
        Row: {
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
          language_version: string | null
          output: string | null
          compilation_error: string | null
          runtime_error: string | null
          test_results: Json | null
          submission_number: number | null
        }
        Insert: {
          id?: string
          user_id: string
          lobby_id?: string | null
          single_player_session_id?: string | null
          challenge_id: string
          code: string
          language: string
          is_correct?: boolean
          score?: number
          execution_time?: number | null
          memory_used?: number | null
          test_cases_passed?: number
          total_test_cases?: number
          error_message?: string | null
          submitted_at?: string
          language_version?: string | null
          output?: string | null
          compilation_error?: string | null
          runtime_error?: string | null
          test_results?: Json | null
          submission_number?: number | null
        }
        Update: {
          id?: string
          user_id?: string
          lobby_id?: string | null
          single_player_session_id?: string | null
          challenge_id?: string
          code?: string
          language?: string
          is_correct?: boolean
          score?: number
          execution_time?: number | null
          memory_used?: number | null
          test_cases_passed?: number
          total_test_cases?: number
          error_message?: string | null
          submitted_at?: string
          language_version?: string | null
          output?: string | null
          compilation_error?: string | null
          runtime_error?: string | null
          test_results?: Json | null
          submission_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_single_player_session_id_fkey"
            columns: ["single_player_session_id"]
            isOneToOne: false
            referencedRelation: "single_player_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          avatar_url: string | null
          bio: string | null
          github_username: string | null
          total_score: number
          challenges_solved: number
          preferred_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          avatar_url?: string | null
          bio?: string | null
          github_username?: string | null
          total_score?: number
          challenges_solved?: number
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          avatar_url?: string | null
          bio?: string | null
          github_username?: string | null
          total_score?: number
          challenges_solved?: number
          preferred_language?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      media_files: {
        Row: {
          id: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          filename: string
          original_name: string
          mime_type: string
          size_bytes: number
          storage_path: string
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          filename?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      programming_languages: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          display_name: string
          file_extension: string
          monaco_language_id?: string | null
          piston_language?: string | null
          piston_version?: string | null
          is_active?: boolean | null
          template_code?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          file_extension?: string
          monaco_language_id?: string | null
          piston_language?: string | null
          piston_version?: string | null
          is_active?: boolean | null
          template_code?: string | null
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: "user" | "admin"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: "user" | "admin"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard"
      lobby_status: "waiting" | "running" | "finished"
      session_status: "in_progress" | "completed"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never