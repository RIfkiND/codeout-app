import type { Lobby, LobbyInsert, LobbyUpdate, LobbyUser, LobbyUserInsert, LobbyUserUpdate, LobbyStatus, LobbyWithUsers } from './database';

// Re-export types for backward compatibility
export type { Lobby, LobbyInsert, LobbyUpdate, LobbyUser, LobbyUserInsert, LobbyUserUpdate, LobbyStatus, LobbyWithUsers };

// Additional lobby types
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