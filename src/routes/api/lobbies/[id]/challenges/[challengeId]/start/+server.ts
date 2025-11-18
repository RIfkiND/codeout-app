import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { supabase } from '$lib/supabaseClient';

export const POST: RequestHandler = async ({ params, cookies }) => {
	const { id: lobbyId, challengeId } = params;
	
	try {
		// Get user from session
		const sessionToken = cookies.get('session');
		if (!sessionToken) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: session, error: sessionError } = await supabase.auth.getSession();
		if (sessionError || !session.session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.session.user.id;

		// Check if user is lobby owner
		const { data: lobby, error: lobbyError } = await supabase
			.from('lobbies')
			.select('created_by, status')
			.eq('id', lobbyId)
			.single();

		if (lobbyError || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		if (lobby.created_by !== userId) {
			return json({ error: 'Only lobby owner can start challenges' }, { status: 403 });
		}

		// Get challenge details
		const { data: challenge, error: challengeError } = await supabase
			.from('challenges')
			.select('title, difficulty')
			.eq('id', challengeId)
			.single();

		if (challengeError || !challenge) {
			return json({ error: 'Challenge not found' }, { status: 404 });
		}

		// Check if challenge is already in lobby
		const { data: lobbyChallenge, error: lobbyChallengeError } = await supabase
			.from('lobby_challenges')
			.select('id, status')
			.eq('lobby_id', lobbyId)
			.eq('challenge_id', challengeId)
			.single();

		if (lobbyChallengeError || !lobbyChallenge) {
			return json({ error: 'Challenge not found in this lobby' }, { status: 404 });
		}

		// Update challenge status to active
		const { error: updateError } = await supabase
			.from('lobby_challenges')
			.update({ 
				status: 'active',
				started_at: new Date().toISOString()
			})
			.eq('id', lobbyChallenge.id);

		if (updateError) {
			console.error('Failed to start challenge:', updateError);
			return json({ error: 'Failed to start challenge' }, { status: 500 });
		}

		// Update lobby status if needed
		if (lobby.status === 'waiting') {
			await supabase
				.from('lobbies')
				.update({ 
					status: 'running',
					start_time: new Date().toISOString()
				})
				.eq('id', lobbyId);
		}

		return json({ 
			success: true, 
			challengeTitle: challenge.title,
			challengeId,
			message: 'Challenge started successfully'
		});

	} catch (error) {
		console.error('Start challenge error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};