import type { 
	Lobby, 
	Challenge, 
	LobbyChallenge, 
	LobbyChallengeSubmission, 
	LobbyStanding,
	User 
} from '$lib/models/database';

type LobbyWithUsers = Lobby & {
	lobby_users?: Array<{
		joined_at: string;
		users: {
			id: string;
			name: string | null;
			email: string | null;
		};
	}>;
	users?: {
		id: string;
		name: string | null;
		email: string | null;
	};
};

type SubmissionWithUser = LobbyChallengeSubmission & {
	users?: {
		id: string;
		name: string | null;
		email: string | null;
	};
};

type StandingWithUser = LobbyStanding & {
	users?: {
		id: string;
		name: string | null;
		email: string | null;
	};
};

export interface PageData {
	lobby: LobbyWithUsers;
	challenge: Challenge;
	lobbyChallenge: LobbyChallenge;
	submissions: SubmissionWithUser[];
	standings: StandingWithUser[];
	user: User | null;
}