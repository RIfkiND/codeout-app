import type { PageServerLoad } from './$types';

// Type definitions for the complex joined query
interface LobbyUser {
	joined_at: string;
	users: {
		id: string;
		name: string | null;
		email: string | null;
	};
}

interface LobbyChallenge {
	id: string;
	challenge_id: string;
	challenge_order: number;
	status: string;
	started_at: string | null;
	challenges: {
		id: string;
		title: string;
		description: string;
		difficulty: string;
		time_limit: number | null;
		testcases: unknown;
		input_example: string | null;
		output_example: string | null;
	};
}

interface LobbyWithRelations {
	id: string;
	name: string;
	description: string | null;
	status: string;
	max_participants: number;
	is_private: boolean;
	created_at: string;
	time_limit_minutes: number | null;
	created_by: string;
	lobby_users: LobbyUser[] | null;
	lobby_challenges: LobbyChallenge[] | null;
	[key: string]: unknown; // For other potential fields
}

export const load = (async ({ locals, params }) => {
	try {
		const { supabase } = locals;
		const { id: lobbyId } = params;

		// Get authenticated user (secure method)
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			throw new Error('Authentication required');
		}

		// Fetch lobby with active challenges
		const { data: lobby, error: lobbyError } = await supabase
			.from('lobbies')
			.select(`
				*,
				lobby_users (
					joined_at,
					users (
						id,
						name,
						email
					)
				),
				lobby_challenges (
					id,
					challenge_id,
					challenge_order,
					status,
					started_at,
					challenges (
						id,
						title,
						description,
						difficulty,
						time_limit,
						testcases,
						input_example,
						output_example
					)
				)
			`)
			.eq('id', lobbyId)
			.single();

		if (lobbyError || !lobby) {
			throw new Error('Lobby not found');
		}

		// Type assert the lobby data
		const typedLobby = lobby as LobbyWithRelations;

		// Check if user is participant or owner
		const isParticipant = typedLobby.lobby_users?.some((lu) => lu.users.id === user.id);
		const isOwner = typedLobby.created_by === user.id;

		if (!isParticipant && !isOwner) {
			throw new Error('You are not a participant of this lobby');
		}

		// Get current active challenge
		const activeChallenge = typedLobby.lobby_challenges?.find((lc) => lc.status === 'active');

		// Get user submissions for this lobby
		const { data: submissions } = await supabase
			.from('lobby_challenge_submissions')
			.select(`
				*,
				challenges (
					title
				)
			`)
			.eq('lobby_id', lobbyId)
			.eq('user_id', user.id)
			.order('submitted_at', { ascending: false });

		// Get leaderboard
		const { data: standings } = await supabase
			.from('lobby_standings')
			.select(`
				*,
				users (
					id,
					name,
					email
				)
			`)
			.eq('lobby_id', lobbyId)
			.order('total_score', { ascending: false });

		return {
			lobby: typedLobby,
			activeChallenge,
			submissions: submissions || [],
			standings: standings || [],
			user,
			isParticipant,
			isOwner
		};
	} catch (error) {
		console.error('Failed to load challenge data:', error);
		throw error;
	}
}) satisfies PageServerLoad;