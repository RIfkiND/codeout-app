import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check if lobby exists and is joinable
		const { data: lobby, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select('id, status, max_participants')
			.eq('id', params.id)
			.single();

		if (lobbyError || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		const typedLobby = lobby as { id: string; status: string; max_participants: number };

		if (typedLobby.status !== 'waiting') {
			return json({ error: 'Cannot join lobby that is not waiting' }, { status: 400 });
		}

		// Check current participant count
		const { count } = await locals.supabase
			.from('lobby_users')
			.select('*', { count: 'exact', head: true })
			.eq('lobby_id', params.id);

		if (count && count >= typedLobby.max_participants) {
			return json({ error: 'Lobby is full' }, { status: 400 });
		}

		// Check if user is already in the lobby
		const { data: existingMembership } = await locals.supabase
			.from('lobby_users')
			.select('id')
			.eq('lobby_id', params.id)
			.eq('user_id', user.id)
			.single();

		if (existingMembership) {
			return json({ error: 'Already in this lobby' }, { status: 400 });
		}

		// Join the lobby
		const { data: lobbyUser, error } = await locals.supabase
			.from('lobby_users')
			.insert({
				lobby_id: params.id,
				user_id: user.id,
				is_creator: false,
				is_ready: false
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} as any)
			.select(`
				*,
				users (
					id,
					name
				)
			`)
			.single();

		if (error) {
			console.error('Join lobby error:', error);
			return json({ error: 'Failed to join lobby' }, { status: 500 });
		}

		return json({ 
			message: 'Successfully joined lobby',
			lobbyUser
		});
	} catch (error) {
		console.error('Join lobby API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to join lobby'
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check if user is in the lobby
		const { data: membership } = await locals.supabase
			.from('lobby_users')
			.select('id')
			.eq('lobby_id', params.id)
			.eq('user_id', user.id)
			.single();

		if (!membership) {
			return json({ error: 'Not in this lobby' }, { status: 400 });
		}

		// Leave the lobby
		const { error } = await locals.supabase
			.from('lobby_users')
			.delete()
			.eq('lobby_id', params.id)
			.eq('user_id', user.id);

		if (error) {
			console.error('Leave lobby error:', error);
			return json({ error: 'Failed to leave lobby' }, { status: 500 });
		}

		return json({ message: 'Successfully left lobby' });
	} catch (error) {
		console.error('Leave lobby API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to leave lobby'
		}, { status: 500 });
	}
};