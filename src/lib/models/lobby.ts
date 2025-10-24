import type { Database } from './database';

// Lobby types
export type Lobby = Database['public']['Tables']['lobbies']['Row'];
export type LobbyInsert = Database['public']['Tables']['lobbies']['Insert'];
export type LobbyUpdate = Database['public']['Tables']['lobbies']['Update'];

// Lobby users junction
export type LobbyUser = Database['public']['Tables']['lobby_users']['Row'];
export type LobbyUserInsert = Database['public']['Tables']['lobby_users']['Insert'];
export type LobbyUserUpdate = Database['public']['Tables']['lobby_users']['Update'];

// Enums
export type LobbyStatus = Database['public']['Enums']['lobby_status'];

// Extended lobby types with relations
export interface LobbyWithUsers extends Lobby {
  lobby_users?: Array<{
    users: {
      id: string;
      name: string | null;
      email: string | null;
    };
    joined_at: string;
  }>;
}

export interface LobbyWithCreator extends Lobby {
  users?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

// Lobby participation info
export interface LobbyParticipant {
  user_id: string;
  user_name: string | null;
  joined_at: string;
  score?: number;
}