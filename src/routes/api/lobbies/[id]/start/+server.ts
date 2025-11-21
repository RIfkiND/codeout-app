import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		// Use more reliable authentication method
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const lobbyId = params.id;
		const requestData = await request.json();
		const { challengeIds = [], challengeMode = 'single' } = requestData;

		// Get lobby info and verify user is the creator
		const { data: lobby, error: fetchError } = await locals.supabase
			.from('lobbies')
			.select('*')
			.eq('id', lobbyId)
			.single();

		if (fetchError || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		// Type cast to avoid TypeScript issues
		const lobbyData = lobby as unknown as {
			created_by: string;
			status: string;
			[key: string]: unknown;
		};

		// Check if user is the creator
		if (lobbyData.created_by !== user.id) {
			return json({ error: 'Only the lobby creator can start the lobby' }, { status: 403 });
		}

		// Check if lobby can be started
		if (lobbyData.status !== 'waiting') {
			return json({ error: 'Lobby cannot be started in its current state' }, { status: 400 });
		}

		// Get participant count
		const { count: participantCount } = await locals.supabase
			.from('lobby_users')
			.select('*', { count: 'exact', head: true })
			.eq('lobby_id', lobbyId);

		if (!participantCount || participantCount === 0) {
			return json({ error: 'Cannot start lobby with no participants' }, { status: 400 });
		}

		// Validate challenges
		if (!challengeIds || challengeIds.length === 0) {
			return json({ error: 'At least one challenge must be selected' }, { status: 400 });
		}

		// Verify challenges exist
		const { data: challenges, error: challengeError } = await locals.supabase
			.from('challenges')
			.select('id, title, difficulty')
			.in('id', challengeIds);

		if (challengeError || !challenges || challenges.length !== challengeIds.length) {
			return json({ error: 'One or more challenges not found' }, { status: 400 });
		}

		try {
				if (challengeMode === 'multi' && challengeIds.length > 1) {
					// Use the multi-challenge function
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const { error: startError } = await (locals.supabase as any)
						.rpc('start_multi_challenge_lobby', {
							lobby_id_param: lobbyId,
							challenge_ids: challengeIds
						});

					if (startError) {
						console.error('Multi-challenge start error:', startError);
						return json({ error: 'Failed to start multi-challenge lobby' }, { status: 500 });
					}
			} else {
				// Single challenge mode
				const firstChallengeId = challengeIds[0];
				
					// Update lobby with single challenge
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const { error: updateError } = await (locals.supabase as any)
						.from('lobbies')
						.update({
							status: 'running',
							challenge_id: firstChallengeId,
							challenge_mode: 'single',
							total_challenges: 1,
							current_challenge_order: 1,
							start_time: new Date().toISOString(),
							countdown_start_time: new Date().toISOString()
						})
						.eq('id', lobbyId);

				if (updateError) {
					console.error('Lobby update error:', updateError);
					return json({ error: 'Failed to update lobby' }, { status: 500 });
				}

					// Create lobby_challenge entry
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const { error: challengeError } = await (locals.supabase as any)
						.from('lobby_challenges')
						.insert({
							lobby_id: lobbyId,
							challenge_id: firstChallengeId,
							challenge_order: 1,
							status: 'active',
							started_at: new Date().toISOString()
						});

				if (challengeError) {
					console.error('Challenge creation error:', challengeError);
					return json({ error: 'Failed to create challenge entry' }, { status: 500 });
				}
			}

			// Get updated lobby with challenge info
			const { data: updatedLobby, error: finalFetchError } = await locals.supabase
				.from('lobbies')
				.select(`
					*,
					challenges (*),
					lobby_users (
						*,
						users (id, name, email)
					),
					lobby_challenges (
						*,
						challenges (*)
					)
				`)
				.eq('id', lobbyId)
				.single();

			if (finalFetchError) {
				console.error('Final fetch error:', finalFetchError);
				return json({ error: 'Lobby started but failed to fetch updated data' }, { status: 500 });
			}

			return json({
				success: true,
				lobby: updatedLobby,
				message: `Lobby started successfully with ${challengeIds.length} challenge(s)`,
				challengeMode,
				challengeCount: challengeIds.length
			});

		} catch (dbError) {
			console.error('Database operation error:', dbError);
			return json({ error: 'Failed to start lobby due to database error' }, { status: 500 });
		}
		
	} catch (error) {
		console.error('Start lobby API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};