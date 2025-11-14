import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { lobby_code, preview = false } = await request.json();

		if (!lobby_code || lobby_code.length !== 6) {
			return json({ error: 'Valid 6-character lobby code is required' }, { status: 400 });
		}

		// Find lobby by code
		const { data: lobby, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select(`
				*,
				creator:users!lobbies_created_by_fkey (
					id,
					name,
					user_profiles (
						avatar_url
					)
				)
			`)
			.eq('lobby_code', lobby_code.toUpperCase())
			.single();

		if (lobbyError || !lobby) {
			return json({ error: 'Lobby not found. Please check the code and try again.' }, { status: 404 });
		}

		const lobbyData = lobby as any;

		// Check if lobby is full
		const { count: participantCount, error: countError } = await locals.supabase
			.from('lobby_users')
			.select('*', { count: 'exact', head: true })
			.eq('lobby_id', lobbyData.id);

		if (countError) {
			console.error('Failed to count participants:', countError);
		}

		if (participantCount && participantCount >= lobbyData.max_participants) {
			return json({ error: 'This lobby is full' }, { status: 400 });
		}

		// Check if lobby is still waiting or running
		if (lobbyData.status === 'finished') {
			return json({ error: 'This lobby has already finished' }, { status: 400 });
		}

		// If this is just a preview request, return lobby info without joining
		if (preview) {
			return json({ 
				success: true,
				lobby: lobbyData,
				message: 'Lobby found'
			});
		}

		// Try to add user to lobby
		try {
			const { error: joinError } = await locals.supabase.rpc('add_lobby_creator', {
				p_lobby_id: lobbyData.id,
				p_user_id: user.id
			});

			if (joinError) {
				console.warn('Could not add user to lobby_users:', joinError.message);
				// Don't fail the entire operation
			}
		} catch (err) {
			console.warn('Join lobby failed:', err);
		}

		return json({ 
			success: true,
			lobby: lobbyData,
			message: `Successfully joined lobby "${lobbyData.name}"!`
		});
	} catch (error) {
		console.error('Join lobby API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to join lobby'
		}, { status: 500 });
	}
};