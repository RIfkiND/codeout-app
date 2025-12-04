import type { ServerLoad } from '@sveltejs/kit';

interface User {
	id: string;
	created_at: string;
	role?: string;
}

interface Challenge {
	id: string;
	title: string;
	difficulty: string;
	created_at: string;
	submissions: Submission[];
}

interface Submission {
	id: string;
	is_correct: boolean;
	language: string;
	created_at: string;
}

interface Lobby {
	id: string;
	created_at: string;
	status: string;
	lobby_users?: unknown[];
}

export const load: ServerLoad = async ({ locals }) => {
	try {
		const { user } = await locals.safeGetSession();
		
		if (!user) {
			throw new Error('Authentication required');
		}

		// Check admin role
		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		if ((userData as { role: string } | null)?.role !== 'admin') {
			throw new Error('Admin access required');
		}

		// Get comprehensive analytics data
		const [
			{ data: userGrowth },
			{ data: challengeStats },
			{ data: submissionTrends },
			{ data: languageUsage },
			{ data: lobbyStats }
		] = await Promise.all([
			// User growth over time
			locals.supabase
				.from('users')
				.select('created_at, role')
				.order('created_at', { ascending: true }),

			// Challenge performance metrics
			locals.supabase
				.from('challenges')
				.select(`
					id, title, difficulty, created_at,
					submissions(is_correct)
				`),

			// Submission trends by day
			locals.supabase
				.from('submissions')
				.select('created_at, is_correct, language')
				.order('created_at', { ascending: true }),

			// Programming language popularity
			locals.supabase
				.from('submissions')
				.select('language')
				.not('language', 'is', null),

			// Lobby activity metrics
			locals.supabase
				.from('lobbies')
				.select(`
					id, status, created_at, 
					lobby_users(user_id)
				`)
				.order('created_at', { ascending: true })
		]);

		// Process user growth data
		const processedUserGrowth = processUserGrowthData(userGrowth || []);

		// Process challenge statistics
		const processedChallengeStats = processChallengeStats(challengeStats || []);

		// Process submission trends
		const processedSubmissionTrends = processSubmissionTrends(submissionTrends || []);

		// Process language usage
		const processedLanguageUsage = processLanguageUsage(languageUsage || []);

		// Process lobby statistics
		const processedLobbyStats = processLobbyStats(lobbyStats || []);

		return {
			userGrowth: processedUserGrowth,
			challengeStats: processedChallengeStats,
			submissionTrends: processedSubmissionTrends,
			languageUsage: processedLanguageUsage,
			lobbyStats: processedLobbyStats
		};
	} catch (error) {
		console.error('Analytics load error:', error);
		return {
			userGrowth: [],
			challengeStats: {},
			submissionTrends: [],
			languageUsage: [],
			lobbyStats: {}
		};
	}
};

function processUserGrowthData(users: User[]) {
	const growth = users.reduce((acc: Record<string, { total: number; admins: number }>, user) => {
		const date = new Date(user.created_at).toISOString().split('T')[0];
		if (!acc[date]) {
			acc[date] = { total: 0, admins: 0 };
		}
		acc[date].total++;
		if (user.role === 'admin') acc[date].admins++;
		return acc;
	}, {});

	return Object.entries(growth)
		.map(([date, stats]) => ({ date, ...stats as Record<string, number> }))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function processChallengeStats(challenges: Challenge[]) {
	return challenges.map(challenge => {
		const submissions = challenge.submissions || [];
		const totalSubmissions = submissions.length;
		const correctSubmissions = submissions.filter((s: Submission) => s.is_correct).length;
		const successRate = totalSubmissions > 0 ? (correctSubmissions / totalSubmissions) * 100 : 0;

		return {
			id: challenge.id,
			title: challenge.title,
			difficulty: challenge.difficulty,
			totalSubmissions,
			correctSubmissions,
			successRate: Math.round(successRate),
			created_at: challenge.created_at
		};
	});
}

function processSubmissionTrends(submissions: Submission[]) {
	const trends = submissions.reduce((acc: Record<string, { total: number; correct: number }>, submission) => {
		const date = new Date(submission.created_at).toISOString().split('T')[0];
		if (!acc[date]) {
			acc[date] = { total: 0, correct: 0 };
		}
		acc[date].total++;
		if (submission.is_correct) acc[date].correct++;
		return acc;
	}, {});

	return Object.entries(trends)
		.map(([date, stats]) => ({
			date,
			...stats as Record<string, number>,
			successRate: (stats as Record<string, number>).total > 0 ? Math.round(((stats as Record<string, number>).correct / (stats as Record<string, number>).total) * 100) : 0
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function processLanguageUsage(submissions: Submission[]) {
	const usage = submissions.reduce((acc: Record<string, number>, submission) => {
		const lang = submission.language || 'unknown';
		acc[lang] = (acc[lang] || 0) + 1;
		return acc;
	}, {});

	return Object.entries(usage)
		.map(([language, count]) => ({ language, count }))
		.sort((a, b) => (b.count as number) - (a.count as number));
}

function processLobbyStats(lobbies: Lobby[]) {
	const stats = {
		total: lobbies.length,
		active: lobbies.filter(l => l.status === 'active').length,
		finished: lobbies.filter(l => l.status === 'finished').length,
		totalParticipants: lobbies.reduce((sum, lobby) => sum + (lobby.lobby_users?.length || 0), 0)
	};

	const trends = lobbies.reduce((acc: Record<string, { count: number; participants: number }>, lobby) => {
		const date = new Date(lobby.created_at).toISOString().split('T')[0];
		if (!acc[date]) {
			acc[date] = { count: 0, participants: 0 };
		}
		acc[date].count++;
		acc[date].participants += lobby.lobby_users?.length || 0;
		return acc;
	}, {});

	return {
		...stats,
		trends: Object.entries(trends)
			.map(([date, data]) => ({ date, ...data as Record<string, number> }))
			.sort((a, b) => a.date.localeCompare(b.date))
	};
}