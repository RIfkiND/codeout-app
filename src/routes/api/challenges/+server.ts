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
		const difficulty = url.searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | null;
		const category = url.searchParams.get('category');
		const lobby_id = url.searchParams.get('lobby_id');
		const is_global = url.searchParams.get('is_global') !== 'false'; // Default to global challenges

		const offset = (page - 1) * limit;

		let query = locals.supabase
			.from('challenges')
			.select(`
				*,
				challenge_categories (
					categories (
						id,
						name
					)
				),
				lobbies (
					id,
					name
				)
			`)
			.range(offset, offset + limit - 1)
			.order('created_at', { ascending: false });

		// Filter by global vs lobby challenges
		if (lobby_id) {
			query = query.eq('lobby_id', lobby_id).eq('is_global', false);
		} else if (is_global) {
			query = query.eq('is_global', true);
		}

		if (difficulty) {
			query = query.eq('difficulty', difficulty);
		}

		if (category) {
			query = query.eq('challenge_categories.categories.name', category);
		}

		const { data: challenges, error } = await query;

		if (error) {
			console.error('Challenges fetch error:', error);
			return json({ error: 'Failed to fetch challenges' }, { status: 500 });
		}

		// Get total count for pagination
		let countQuery = locals.supabase
			.from('challenges')
			.select('*', { count: 'exact', head: true });

		if (difficulty) {
			countQuery = countQuery.eq('difficulty', difficulty);
		}

		const { count, error: countError } = await countQuery;

		if (countError) {
			console.error('Count error:', countError);
		}

		return json({
			challenges,
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit)
			}
		});
	} catch (error) {
		console.error('Challenges API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to fetch challenges'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const challengeData = await request.json();
		const { is_global = true, lobby_id } = challengeData;

		// Validate challenge type
		if (is_global && lobby_id) {
			return json({ error: 'Global challenges cannot have a lobby_id' }, { status: 400 });
		}

		if (!is_global && !lobby_id) {
			return json({ error: 'Lobby challenges must have a lobby_id' }, { status: 400 });
		}

		// Check permissions based on challenge type
		if (is_global) {
			// Only admins can create global challenges
			const { data: userData } = await locals.supabase
				.from('users')
				.select('role')
				.eq('id', user.id)
				.single();

			if (!userData || userData.role !== 'admin') {
				return json({ error: 'Only admins can create global challenges' }, { status: 403 });
			}
		} else {
			// For lobby challenges, verify user owns the lobby
			const { data: lobby } = await locals.supabase
				.from('lobbies')
				.select('created_by')
				.eq('id', lobby_id)
				.single();

			if (!lobby || lobby.created_by !== user.id) {
				return json({ error: 'You can only create challenges for lobbies you own' }, { status: 403 });
			}
		}

		const { data: challenge, error } = await locals.supabase
			.from('challenges')
			.insert({
				...challengeData,
				is_global,
				lobby_id: is_global ? null : lobby_id,
				created_by: user.id
			})
			.select(`
				*,
				lobbies (
					id,
					name
				)
			`)
			.single();

		if (error) {
			console.error('Challenge creation error:', error);
			return json({ error: 'Failed to create challenge' }, { status: 500 });
		}

		return json({ challenge });
	} catch (error) {
		console.error('Challenge creation API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to create challenge'
		}, { status: 500 });
	}
};