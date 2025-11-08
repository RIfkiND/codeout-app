import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const status = url.searchParams.get('status') as 'waiting' | 'running' | 'finished' | null;

		const offset = (page - 1) * limit;

		let query = locals.supabase
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
			.range(offset, offset + limit - 1)
			.order('created_at', { ascending: false });

		if (status) {
			query = query.eq('status', status);
		}

		const { data: lobbies, error } = await query;

		if (error) {
			console.error('Lobbies fetch error:', error);
			return json({ error: 'Failed to fetch lobbies' }, { status: 500 });
		}

		// Get total count for pagination
		let countQuery = locals.supabase
			.from('lobbies')
			.select('*', { count: 'exact', head: true });

		if (status) {
			countQuery = countQuery.eq('status', status);
		}

		const { count, error: countError } = await countQuery;

		if (countError) {
			console.error('Count error:', countError);
		}

		return json({
			lobbies,
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit)
			}
		});
	} catch (error) {
		console.error('Lobbies API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to fetch lobbies'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const lobbyData = await request.json();
		const { name, max_participants = 50 } = lobbyData;

		if (!name || name.trim().length === 0) {
			return json({ error: 'Lobby name is required' }, { status: 400 });
		}

		if (max_participants < 1 || max_participants > 100) {
			return json({ error: 'Max participants must be between 1 and 100' }, { status: 400 });
		}

		const { data: lobby, error } = await locals.supabase
			.from('lobbies')
			.insert({
				name: name.trim(),
				max_participants,
				created_by: user.id,
				status: 'waiting'
			} as unknown as never)
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
			console.error('Lobby creation error:', error);
			return json({ error: 'Failed to create lobby' }, { status: 500 });
		}

		// Automatically join the creator to the lobby
		const { error: joinError } = await locals.supabase
			.from('lobby_users')
			.insert({
				lobby_id: (lobby as unknown as { id: string }).id,
				user_id: user.id
			} as unknown as never);

		if (joinError) {
			console.error('Auto-join error:', joinError);
			// Not a critical error, continue
		}

		return json({ lobby });
	} catch (error) {
		console.error('Lobby creation API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to create lobby'
		}, { status: 500 });
	}
};