import type { Database } from './database';

// User types
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

// User roles
export type UserRole = Database['public']['Enums']['user_role'];

// Extended user type with profile
export interface UserWithProfile extends User {
  user_profiles?: UserProfile | null;
}