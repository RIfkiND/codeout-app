import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface Challenge {
	id: string;
	title: string;
	description: string;
	difficulty: string;
	attempt_count?: number | null;
	success_rate?: number | null;
	tags?: string[] | null;
	category?: string | null;
	created_at: string;
	[key: string]: unknown;
}

interface EnhancedChallenge extends Challenge {
	solved_count: number;
	success_percentage: number;
	user_status: string;
}

interface Submission {
	challenge_id: string;
	is_correct: boolean;
}

// Helper function to format attempt count for display
function formatSolvedCount(attempt_count?: number | null, success_rate?: number | null): number {
	if (!attempt_count || !success_rate) return 0;
	return Math.round(attempt_count * success_rate);
}

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Parse query parameters
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const difficulty = url.searchParams.get('difficulty');
		const search = url.searchParams.get('search')?.trim() || '';
		const category = url.searchParams.get('category');
		const categories = url.searchParams.get('categories')?.split(',').filter(Boolean) || [];
		const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || [];
		const status = url.searchParams.get('status'); // 'solved', 'unsolved', 'attempted'
		const sortBy = url.searchParams.get('sortBy') || 'created_at';
		const sortOrder = url.searchParams.get('sortOrder') || 'desc';
		const lobby_id = url.searchParams.get('lobby_id');
		const is_global = url.searchParams.get('is_global') !== 'false'; 

		const offset = (page - 1) * limit;

		// Build base query
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
			`);

		// Apply filters
		if (lobby_id) {
			query = query.eq('lobby_id', lobby_id).eq('is_global', false);
		} else if (is_global) {
			query = query.eq('is_global', true);
		}

		if (difficulty && difficulty !== 'all') {
			query = query.eq('difficulty', difficulty);
		}

		if (search) {
			// Search in title and description
			query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
		}

		if (category && categories.length === 0) {
			// Single category filter (backwards compatibility)
			query = query.eq('category', category);
		}

		if (categories.length > 0) {
			// Multiple categories filter
			query = query.in('category', categories);
		}

		if (tags.length > 0) {
			// Tags filter - check if any of the selected tags exist in the tags array
			const tagFilters = tags.map(tag => `tags.cs.{${tag}}`).join(',');
			query = query.or(tagFilters);
		}

		// Apply sorting
		const sortColumn = ['created_at', 'title', 'difficulty', 'view_count', 'success_rate'].includes(sortBy) 
			? sortBy 
			: 'created_at';
		
		query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

		// Apply pagination
		query = query.range(offset, offset + limit - 1);

		const { data: challenges, error } = await query;

		if (error) {
			console.error('Challenges fetch error:', error);
			return json({ error: 'Failed to fetch challenges' }, { status: 500 });
		}

		// Get total count for pagination with same filters
		let countQuery = locals.supabase
			.from('challenges')
			.select('*', { count: 'exact', head: true });

		if (lobby_id) {
			countQuery = countQuery.eq('lobby_id', lobby_id).eq('is_global', false);
		} else if (is_global) {
			countQuery = countQuery.eq('is_global', true);
		}

		if (difficulty && difficulty !== 'all') {
			countQuery = countQuery.eq('difficulty', difficulty);
		}

		if (search) {
			countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
		}

		if (category && categories.length === 0) {
			countQuery = countQuery.eq('category', category);
		}

		if (categories.length > 0) {
			countQuery = countQuery.in('category', categories);
		}

		if (tags.length > 0) {
			const tagFilters = tags.map(tag => `tags.cs.{${tag}}`).join(',');
			countQuery = countQuery.or(tagFilters);
		}

		const { count, error: countError } = await countQuery;

		if (countError) {
			console.error('Count error:', countError);
		}

		// If status filter is applied, we need to filter by user's submission status
		let enhancedChallenges: EnhancedChallenge[] = (challenges as Challenge[])?.map((challenge: Challenge) => ({
			...challenge,
			solved_count: formatSolvedCount(challenge.attempt_count, challenge.success_rate),
			success_percentage: challenge.success_rate ? Math.round(challenge.success_rate) : 0,
			user_status: 'unsolved' // Default status, will be updated if user has submissions
		})) || [];

		// Get user's submission status for these challenges if status filter is requested
		if (status && session.user) {
			const challengeIds = enhancedChallenges.map(c => c.id);
			const { data: submissions } = await locals.supabase
				.from('submissions')
				.select('challenge_id, is_correct')
				.eq('user_id', session.user.id)
				.in('challenge_id', challengeIds);

			// Update user status for each challenge
			enhancedChallenges = enhancedChallenges.map(challenge => {
				const userSubmissions = (submissions as Submission[])?.filter(s => s.challenge_id === challenge.id) || [];
				let userStatus = 'unsolved';
				
				if (userSubmissions.length > 0) {
					userStatus = userSubmissions.some(s => s.is_correct) ? 'solved' : 'attempted';
				}
				
				return { ...challenge, user_status: userStatus };
			});

			// Filter by status if specified
			if (status !== 'all') {
				enhancedChallenges = enhancedChallenges.filter(c => c.user_status === status);
			}
		}

		return json({
			challenges: enhancedChallenges,
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit)
			},
			filters: {
				difficulty,
				search,
				category,
				categories,
				tags,
				status,
				sortBy,
				sortOrder
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

			if (!userData || (userData as { role: string }).role !== 'admin') {
				return json({ error: 'Only admins can create global challenges' }, { status: 403 });
			}
		} else {
			// For lobby challenges, verify user owns the lobby
			const { data: lobby } = await locals.supabase
				.from('lobbies')
				.select('created_by')
				.eq('id', lobby_id)
				.single();

			if (!lobby || (lobby as { created_by: string }).created_by !== user.id) {
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