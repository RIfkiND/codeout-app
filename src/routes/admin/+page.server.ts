import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		// Get dashboard statistics
		const [
			{ data: challengesData },
			{ data: usersData },
			{ data: submissionsData },
			{ data: lobbiesData }
		] = await Promise.all([
			locals.supabase.from('challenges').select('id, created_at, difficulty').eq('is_global', true),
			locals.supabase.from('users').select('id, created_at, role'),
			locals.supabase.from('submissions').select('id, created_at, is_correct'),
			locals.supabase.from('lobbies').select('id, created_at, status')
		]);

		// Calculate statistics
		const totalChallenges = challengesData?.length || 0;
		const totalUsers = usersData?.length || 0;
		const totalSubmissions = submissionsData?.length || 0;
		const activeLobbie = lobbiesData?.filter(l => l.status === 'active').length || 0;

		// Calculate difficulty distribution
		const difficultyStats = {
			easy: challengesData?.filter(c => c.difficulty === 'easy').length || 0,
			medium: challengesData?.filter(c => c.difficulty === 'medium').length || 0,
			hard: challengesData?.filter(c => c.difficulty === 'hard').length || 0
		};

		// Calculate success rate
		const correctSubmissions = submissionsData?.filter(s => s.is_correct).length || 0;
		const successRate = totalSubmissions > 0 ? (correctSubmissions / totalSubmissions) * 100 : 0;

		// Recent activities
		const { data: recentActivities } = await locals.supabase
			.from('submissions')
			.select(`
				id,
				created_at,
				is_correct,
				users (username, email),
				challenges (title)
			`)
			.order('created_at', { ascending: false })
			.limit(5);

		return {
			stats: {
				totalChallenges,
				totalUsers,
				totalSubmissions,
				activeLobbie,
				difficultyStats,
				successRate: Math.round(successRate)
			},
			recentActivities: recentActivities || []
		};
	} catch (error) {
		console.error('Admin dashboard load error:', error);
		return {
			stats: {
				totalChallenges: 0,
				totalUsers: 0,
				totalSubmissions: 0,
				activeLobbie: 0,
				difficultyStats: { easy: 0, medium: 0, hard: 0 },
				successRate: 0
			},
			recentActivities: []
		};
	}
};