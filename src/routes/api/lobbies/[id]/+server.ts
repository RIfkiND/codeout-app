import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Get lobby details with participants and challenges
		const { data: lobby, error } = await locals.supabase
			.from('lobbies')
			.select(`
				*,
				created_by_user:users!lobbies_created_by_fkey(id, name, email),
				lobby_users(
					users(id, name, email),
					joined_at
				),
				lobby_challenges(
					id,
					challenge_order,
					status,
					challenges(
						id,
						title,
						description,
						difficulty,
						input_example,
						output_example,
						testcases
					)
				)
			`)
			.eq('id', params.id)
			.single();

		if (error) {
			console.error('Lobby fetch error:', error);
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		// Get submissions for this lobby
		const { data: submissions } = await locals.supabase
			.from('submissions')
			.select(`
				*,
				users(id, name, email)
			`)
			.eq('lobby_id', params.id)
			.order('submitted_at', { ascending: false });

		// Get standings
		const { data: standings } = await locals.supabase
			.from('lobby_standings')
			.select(`
				*,
				users(id, name, email)
			`)
			.eq('lobby_id', params.id)
			.order('final_rank', { ascending: true });

		return json({ 
			lobby,
			submissions: submissions || [],
			standings: standings || []
		});
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
			.single() as { data: { created_by: string } | null };

		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single() as { data: { role: string } | null };

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
			// @ts-expect-error Supabase generated types have issues with dynamic updates
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
			.single() as { data: { created_by: string } | null };

		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single() as { data: { role: string } | null };

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