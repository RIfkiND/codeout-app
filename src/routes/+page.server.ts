import { supabase } from '$lib/supabaseClient';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Get platform stats
		const [challengesResult, usersResult, submissionsResult, lobbiesResult] = await Promise.all([
			supabase.from('challenges').select('id', { count: 'exact', head: true }),
			supabase.from('users').select('id', { count: 'exact', head: true }),
			supabase.from('submissions').select('id', { count: 'exact', head: true }),
			supabase.from('lobbies').select('id', { count: 'exact', head: true })
		]);

		// Get featured challenges
		const { data: featuredChallenges } = await supabase
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
		const { data: activeLobbies } = await supabase
			.from('lobbies')
			.select(`
				id,
				name,
				description,
				max_participants,
				current_participants,
				start_time,
				end_time,
				created_at,
				creator:creator_id(username, avatar_url),
				participants:lobby_participants(
					user:user_id(username, avatar_url)
				)
			`)
			.eq('status', 'active')
			.order('created_at', { ascending: false })
			.limit(5);

		// Get global leaderboard
		const { data: leaderboard } = await supabase
			.from('users')
			.select(`
				id,
				username,
				avatar_url,
				total_score,
				challenges_solved,
				rank
			`)
			.order('total_score', { ascending: false })
			.limit(10);

		// Get quick start challenges (easy ones for beginners)
		const { data: quickStartChallenges } = await supabase
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