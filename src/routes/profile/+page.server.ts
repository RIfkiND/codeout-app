import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.supabase || !locals.session) {
		throw redirect(303, '/auth/login');
	}

	// Get user profile information with user data
	const { data: profile, error: profileError } = await locals.supabase
		.from('user_profiles')
		.select(`
			*,
			users!inner(*)
		`)
		.eq('user_id', locals.session.user.id)
		.single();

	if (profileError) {
		console.error('Error fetching user profile:', profileError);
	}

	// Get user statistics
	const { data: stats } = await locals.supabase
		.from('submissions')
		.select('status, challenge_id, is_correct')
		.eq('user_id', locals.session.user.id);

	interface SubmissionStats {
		status: string;
		challenge_id: string;
		is_correct: boolean;
	}

	const totalSubmissions = stats?.length || 0;
	const solvedChallenges = new Set(
		(stats as SubmissionStats[])?.filter(s => s.is_correct === true).map(s => s.challenge_id)
	).size;

	return {
		user: locals.session.user,
		profile,
		stats: {
			totalSubmissions,
			solvedChallenges,
			successRate: totalSubmissions > 0 ? Math.round((solvedChallenges / totalSubmissions) * 100) : 0
		}
	};
};