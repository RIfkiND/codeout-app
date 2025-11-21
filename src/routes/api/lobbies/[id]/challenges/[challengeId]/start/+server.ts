import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	const { id: lobbyId, challengeId } = params;
	
	try {
		// Get authenticated user
		const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
		if (userError || !user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = user.id;

		// Check if user is lobby owner
		const { data: lobbyData, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select('created_by, status')
			.eq('id', lobbyId)
			.single();

		if (lobbyError || !lobbyData) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const lobby = lobbyData as any;
		if (lobby.created_by !== userId) {
			return json({ error: 'Only lobby owner can start challenges' }, { status: 403 });
		}

		// Get challenge details
		const { data: challengeData, error: challengeError } = await locals.supabase
			.from('challenges')
			.select('title, difficulty')
			.eq('id', challengeId)
			.single();

		if (challengeError || !challengeData) {
			return json({ error: 'Challenge not found' }, { status: 404 });
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const challenge = challengeData as any;

		// Check if challenge is already in lobby
		const { data: lobbyChallengeData, error: lobbyChallengeError } = await locals.supabase
			.from('lobby_challenges')
			.select('id, status')
			.eq('lobby_id', lobbyId)
			.eq('challenge_id', challengeId)
			.single();

		if (lobbyChallengeError || !lobbyChallengeData) {
			return json({ error: 'Challenge not found in this lobby' }, { status: 404 });
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const lobbyChallenge = lobbyChallengeData as any;

		// Update challenge status to active
		const updateData = { 
			status: 'active' as const,
			started_at: new Date().toISOString()
		};

		const { error: updateError } = await locals.supabase
			.from('lobby_challenges')
			// @ts-expect-error Supabase generated types have issues with dynamic updates
			.update(updateData)
			.eq('id', lobbyChallenge.id);

		if (updateError) {
			console.error('Failed to start challenge:', updateError);
			return json({ error: 'Failed to start challenge' }, { status: 500 });
		}

		// Update lobby status if needed
		if (lobby.status === 'waiting') {
			const lobbyUpdateData = { 
				status: 'running' as const,
				start_time: new Date().toISOString()
			};

			const { error: lobbyUpdateError } = await locals.supabase
				.from('lobbies')
				// @ts-expect-error Supabase generated types have issues with dynamic updates
				.update(lobbyUpdateData)
				.eq('id', lobbyId);

			if (lobbyUpdateError) {
				console.error('Failed to update lobby status:', lobbyUpdateError);
				// Don't fail the request if lobby status update fails
			}
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