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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const activeLobbie = (lobbiesData as any[])?.filter((l: any) => l.status === 'active').length || 0;

		// Calculate difficulty distribution
		const difficultyStats = {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			easy: (challengesData as any[])?.filter((c: any) => c.difficulty === 'easy').length || 0,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			medium: (challengesData as any[])?.filter((c: any) => c.difficulty === 'medium').length || 0,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			hard: (challengesData as any[])?.filter((c: any) => c.difficulty === 'hard').length || 0
		};

		// Calculate success rate
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const correctSubmissions = (submissionsData as any[])?.filter((s: any) => s.is_correct).length || 0;
		const successRate = totalSubmissions > 0 ? (correctSubmissions / totalSubmissions) * 100 : 0;

		// Recent activities
		const { data: recentActivities } = await locals.supabase
			.from('submissions')
			.select(`
				id,
				created_at,
				is_correct,
				users (name, email),
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