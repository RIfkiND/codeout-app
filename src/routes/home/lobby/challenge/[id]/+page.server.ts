import type { PageServerLoad } from './$types';

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

		// Check if user is participant or owner
		const isParticipant = lobby.lobby_users?.some((lu: any) => lu.users.id === user.id);
		const isOwner = lobby.created_by === user.id;

		if (!isParticipant && !isOwner) {
			throw new Error('You are not a participant of this lobby');
		}

		// Get current active challenge
		const activeChallenge = lobby.lobby_challenges?.find((lc: any) => lc.status === 'active');

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
			lobby,
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