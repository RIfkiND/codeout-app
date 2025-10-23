import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { data: lobby, error } = await locals.supabase
			.from('lobbies')
			.select(`
				*,
				users!lobbies_created_by_fkey (
					id,
					name,
					user_profiles (
						avatar_url
					)
				),
				lobby_users (
					id,
					user_id,
					joined_at,
					users (
						id,
						name,
						user_profiles (
							avatar_url
						)
					)
				)
			`)
			.eq('id', params.id)
			.single();

		if (error) {
			console.error('Lobby fetch error:', error);
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		return json({ lobby });
	} catch (error) {
		console.error('Lobby API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to fetch lobby'
		}, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check if user is the lobby creator or admin
		const { data: lobby } = await locals.supabase
			.from('lobbies')
			.select('created_by')
			.eq('id', params.id)
			.single();

		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		const isCreator = lobby?.created_by === user.id;
		const isAdmin = userData?.role === 'admin';

		if (!isCreator && !isAdmin) {
			return json({ error: 'Only lobby creator or admin can modify this lobby' }, { status: 403 });
		}

		const updateData = await request.json();
		
		// Validate status transitions
		if (updateData.status) {
			const validStatuses = ['waiting', 'running', 'finished'];
			if (!validStatuses.includes(updateData.status)) {
				return json({ error: 'Invalid lobby status' }, { status: 400 });
			}
		}

		const { data: updatedLobby, error } = await locals.supabase
			.from('lobbies')
			.update(updateData)
			.eq('id', params.id)
			.select(`
				*,
				users!lobbies_created_by_fkey (
					id,
					name,
					user_profiles (
						avatar_url
					)
				)
			`)
			.single();

		if (error) {
			console.error('Lobby update error:', error);
			return json({ error: 'Failed to update lobby' }, { status: 500 });
		}

		return json({ lobby: updatedLobby });
	} catch (error) {
		console.error('Lobby update API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to update lobby'
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check if user is the lobby creator or admin
		const { data: lobby } = await locals.supabase
			.from('lobbies')
			.select('created_by')
			.eq('id', params.id)
			.single();

		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		const isCreator = lobby?.created_by === user.id;
		const isAdmin = userData?.role === 'admin';

		if (!isCreator && !isAdmin) {
			return json({ error: 'Only lobby creator or admin can delete this lobby' }, { status: 403 });
		}

		const { error } = await locals.supabase
			.from('lobbies')
			.delete()
			.eq('id', params.id);

		if (error) {
			console.error('Lobby delete error:', error);
			return json({ error: 'Failed to delete lobby' }, { status: 500 });
		}

		return json({ message: 'Lobby deleted successfully' });
	} catch (error) {
		console.error('Lobby delete API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to delete lobby'
		}, { status: 500 });
	}
};