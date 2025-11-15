import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
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
		if (lobbyData.created_by !== session.user.id) {
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
		const { data: updatedLobby, error: updateError } = await (locals.supabase
			.from('lobbies') as unknown as {
				update: (data: Record<string, unknown>) => {
					eq: (column: string, value: string) => {
						select: () => {
							single: () => Promise<{ data?: unknown; error?: unknown }>;
						};
					};
				};
			})
			.update({
				status: 'running',
				start_time: new Date().toISOString(),
				current_participants: participantCount
			})
			.eq('id', lobbyId)
			.select()
			.single();

		if (updateError) {
			console.error('Failed to start lobby:', updateError);
			return json({ error: 'Failed to start lobby' }, { status: 500 });
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