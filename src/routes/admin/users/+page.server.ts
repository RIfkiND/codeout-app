import type { ServerLoad } from '@sveltejs/kit';

interface UserProfile {
	preferred_language?: string;
}

interface UserData {
	id: string;
	created_at: string;
	role?: string;
	user_profiles?: UserProfile[];
}

interface ProcessedUser {
	id: string;
	role: string;
	stats: {
		lastActivity: string;
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

interface UserSubmission {
	user_id: string;
	is_correct: boolean;
	created_at: string;
	language: string;
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

		// Get all users with their profiles and activity
		const { data: users, error: usersError } = await locals.supabase
			.from('users')
			.select(`
				id,
				name,
				email,
				role,
				created_at,
				user_profiles (
					username,
					total_score,
					challenges_solved,
					preferred_language
				)
			`)
			.order('created_at', { ascending: false });

		if (usersError) {
			console.error('Users fetch error:', usersError);
		}

		// Get user activity statistics
		const { data: userStats } = await locals.supabase
			.from('submissions')
			.select(`
				user_id,
				created_at,
				is_correct,
				language
			`);

		// Process user activity data
		const processedUsers = (users || []).map((user: UserData) => {
			const userSubmissions = userStats?.filter((s: UserSubmission) => s.user_id === user.id) || [];
			const totalSubmissions = userSubmissions.length;
			const correctSubmissions = userSubmissions.filter((s: UserSubmission) => s.is_correct).length;
			const successRate = totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0;
			
			// Get last activity
			const lastActivity = userSubmissions.length > 0 
				? new Date(Math.max(...userSubmissions.map((s: UserSubmission) => new Date(s.created_at).getTime())))
				: new Date(user.created_at);

			// Get preferred languages
			const languageUsage = userSubmissions.reduce((acc: Record<string, number>, sub: UserSubmission) => {
				acc[sub.language] = (acc[sub.language] || 0) + 1;
				return acc;
			}, {} as Record<string, number>);

			const topLanguage = Object.entries(languageUsage)
				.sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || user.user_profiles?.[0]?.preferred_language || 'javascript';

			return {
				...user,
				profile: user.user_profiles?.[0] || null,
				stats: {
					totalSubmissions,
					correctSubmissions,
					successRate,
					lastActivity,
					topLanguage,
					languageUsage
				}
			};
		});

		// Get system-wide statistics
		const totalUsers = processedUsers.length;
		const activeUsers = processedUsers.filter((u: ProcessedUser) => {
			const daysSinceActivity = Math.floor((Date.now() - new Date(u.stats.lastActivity).getTime()) / (1000 * 60 * 60 * 24));
			return daysSinceActivity <= 30;
		}).length;

		const adminUsers = processedUsers.filter((u: ProcessedUser) => u.role === 'admin').length;

		return {
			users: processedUsers,
			stats: {
				totalUsers,
				activeUsers,
				adminUsers,
				inactiveUsers: totalUsers - activeUsers
			}
		};
	} catch (error) {
		console.error('Users management load error:', error);
		return {
			users: [],
			stats: {
				totalUsers: 0,
				activeUsers: 0,
				adminUsers: 0,
				inactiveUsers: 0
			}
		};
	}
};