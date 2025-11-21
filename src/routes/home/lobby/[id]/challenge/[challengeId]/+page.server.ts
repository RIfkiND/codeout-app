import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params, locals }) => {
	const lobbyId = params.id;
	const challengeId = params.challengeId;

	if (!lobbyId || !challengeId) {
		throw new Error('Missing lobby ID or challenge ID');
	}

	try {
		// Get authenticated user
		const { data: { user } } = await locals.supabase.auth.getUser();
		
		// Fetch lobby with challenge details
		const { data: lobby, error: lobbyError } = await locals.supabase
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
				users:created_by (
					id,
					name,
					email
				)
			`)
			.eq('id', lobbyId)
			.single();

		if (lobbyError || !lobby) {
			console.error('Lobby fetch error:', lobbyError);
			throw new Error('Lobby not found');
		}

		// Fetch specific challenge
		const { data: challenge, error: challengeError } = await locals.supabase
			.from('challenges')
			.select('*')
			.eq('id', challengeId)
			.single();

		if (challengeError || !challenge) {
			console.error('Challenge fetch error:', challengeError);
			throw new Error('Challenge not found');
		}

		// Fetch lobby challenge relationship
		const { data: lobbyChallenge, error: lobbyChallengeError } = await locals.supabase
			.from('lobby_challenges')
			.select('*')
			.eq('lobby_id', lobbyId)
			.eq('challenge_id', challengeId)
			.single();

		if (lobbyChallengeError) {
			console.error('Lobby challenge relationship error:', lobbyChallengeError);
			throw new Error('Challenge not associated with this lobby');
		}

		// Fetch submissions for this specific challenge
		const { data: submissions } = await locals.supabase
			.from('lobby_challenge_submissions')
			.select(`
				*,
				users (
					id,
					name,
					email
				)
			`)
			.eq('lobby_id', lobbyId)
			.eq('challenge_id', challengeId)
			.order('submitted_at', { ascending: false });

		// Fetch current standings
		const { data: standings } = await locals.supabase
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
			challenge,
			lobbyChallenge,
			submissions: submissions || [],
			standings: standings || [],
			user
		};
	} catch (error) {
		console.error('Challenge page load error:', error);
		throw new Error('Failed to load challenge data');
	}
};