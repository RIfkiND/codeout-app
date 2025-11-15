import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	try {
		// Use more reliable authentication method
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const lobbyId = params.id;

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

		// Update lobby status to running and set start time
		const { data: updatedLobby, error: updateError } = await locals.supabase
			.from('lobbies')
			.update({
				status: 'running' as const,
				start_time: new Date().toISOString()
			})
			.eq('id', lobbyId)
			.select()
			.single();

		if (updateError) {
			console.error('Failed to start lobby:', updateError);
			// Return structured error response
			return json({ 
				error: 'Failed to start lobby',
				details: updateError.message || 'Unknown database error',
				code: updateError.code
			}, { status: 500 });
		}

		return json({
			success: true,
			lobby: updatedLobby,
			message: 'Lobby started successfully'
		});
		
	} catch (error) {
		console.error('Start lobby API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};