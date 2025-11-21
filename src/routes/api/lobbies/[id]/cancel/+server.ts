import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check if user is the lobby creator or admin
		const { data: lobby } = await locals.supabase
			.from('lobbies')
			.select('created_by, status')
			.eq('id', params.id)
			.single() as { data: { created_by: string; status: string } | null };

		if (!lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single() as { data: { role: string } | null };

		const isCreator = lobby.created_by === user.id;
		const isAdmin = userData?.role === 'admin';

		if (!isCreator && !isAdmin) {
			return json({ error: 'Only lobby creator or admin can cancel this lobby' }, { status: 403 });
		}

		// Check if lobby is in a cancellable state
		if (lobby.status !== 'running' && lobby.status !== 'selecting_challenge') {
			return json({ error: 'Lobby is not in a cancellable state' }, { status: 400 });
		}

		// Begin transaction to cancel lobby and clean up
		// 1. Update lobby status to waiting and reset times
		const { error: lobbyUpdateError } = await locals.supabase
			.from('lobbies')
			// @ts-expect-error Supabase generated types have issues with dynamic updates
			.update({
				status: 'waiting',
				start_time: null,
				end_time: null,
				challenge_id: null,
				countdown_start_time: null
			})
			.eq('id', params.id);

		if (lobbyUpdateError) {
			console.error('Lobby cancel update error:', lobbyUpdateError);
			return json({ error: 'Failed to cancel lobby' }, { status: 500 });
		}

		// 2. Update all active lobby challenges to pending status
		const { error: challengesUpdateError } = await locals.supabase
			.from('lobby_challenges')
			// @ts-expect-error Supabase generated types have issues with dynamic updates
			.update({
				status: 'pending',
				started_at: null,
				completed_at: null
			})
			.eq('lobby_id', params.id)
			.in('status', ['active']);

		if (challengesUpdateError) {
			console.error('Lobby challenges cancel error:', challengesUpdateError);
			// Don't fail the request if this fails, lobby is still cancelled
		}

		// 3. Reset lobby user states
		const { error: usersUpdateError } = await locals.supabase
			.from('lobby_users')
			// @ts-expect-error Supabase generated types have issues with dynamic updates
			.update({
				is_ready: false,
				final_score: 0,
				final_rank: null,
				connection_status: 'connected'
			})
			.eq('lobby_id', params.id);

		if (usersUpdateError) {
			console.error('Lobby users cancel error:', usersUpdateError);
			// Don't fail the request if this fails, lobby is still cancelled
		}

		// 4. Reset standings
		const { error: standingsUpdateError } = await locals.supabase
			.from('lobby_standings')
			// @ts-expect-error Supabase generated types have issues with dynamic updates
			.update({
				total_score: 0,
				challenges_completed: 0,
				average_completion_time_ms: null,
				final_rank: null
			})
			.eq('lobby_id', params.id);

		if (standingsUpdateError) {
			console.error('Lobby standings cancel error:', standingsUpdateError);
			// Don't fail the request if this fails, lobby is still cancelled
		}

		return json({ 
			message: 'Lobby cancelled successfully',
			status: 'waiting'
		});

	} catch (error) {
		console.error('Lobby cancel API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to cancel lobby'
		}, { status: 500 });
	}
};