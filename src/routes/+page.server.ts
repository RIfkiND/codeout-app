import type { PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }: RequestEvent) => {
	try {
		// Get user session
		const { session } = await locals.safeGetSession();
		const user = session?.user || null;

		// Get platform stats
		const [challengesResult, usersResult, submissionsResult, lobbiesResult] = await Promise.all([
			locals.supabase.from('challenges').select('id', { count: 'exact', head: true }),
			locals.supabase.from('users').select('id', { count: 'exact', head: true }),
			locals.supabase.from('submissions').select('id', { count: 'exact', head: true }),
			locals.supabase.from('lobbies').select('id', { count: 'exact', head: true })
		]);

		// Get featured challenges
		const { data: featuredChallenges } = await locals.supabase
			.from('challenges')
			.select(`
				id,
				title,
				difficulty,
				description,
				tags,
				solved_count,
				total_attempts
			`)
			.order('solved_count', { ascending: false })
			.limit(6);

		// Get active lobbies
		const { data: activeLobbies } = await locals.supabase
			.from('lobbies')
			.select(`
				id,
				name,
				description,
				max_participants,
				status,
				start_time,
				end_time,
				created_at,
				lobby_participants(
					users(
						id,
						name,
						email
					)
				)
			`)
			.in('status', ['pending', 'active'])
			.order('created_at', { ascending: false })
			.limit(5);

		// Get global leaderboard
		const { data: leaderboard } = await locals.supabase
			.from('users')
			.select(`
				id,
				name,
				email
			`)
			.order('created_at', { ascending: false })
			.limit(10);

		// Get quick start challenges (easy ones for beginners)
		const { data: quickStartChallenges } = await locals.supabase
			.from('challenges')
			.select(`
				id,
				title,
				difficulty,
				tags,
				description
			`)
			.eq('difficulty', 'easy')
			.order('solved_count', { ascending: false })
			.limit(4);

		return {
			user,
			stats: {
				challenges: challengesResult.count ?? 0,
				users: usersResult.count ?? 0,
				submissions: submissionsResult.count ?? 0,
				lobbies: lobbiesResult.count ?? 0
			},
			featuredChallenges: featuredChallenges ?? [],
			activeLobbies: activeLobbies ?? [],
			leaderboard: leaderboard ?? [],
			quickStartChallenges: quickStartChallenges ?? []
		};
	} catch (error) {
		console.error('Error loading homepage data:', error);
		
		// Return empty data structure if there's an error
		return {
			user: null,
			stats: {
				challenges: 0,
				users: 0,
				submissions: 0,
				lobbies: 0
			},
			featuredChallenges: [],
			activeLobbies: [],
			leaderboard: [],
			quickStartChallenges: []
		};
	}
};