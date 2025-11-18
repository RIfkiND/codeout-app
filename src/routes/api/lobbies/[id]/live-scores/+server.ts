import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// Type definitions for joined queries
interface LobbyStandingWithUser {
	user_id: string;
	total_score: number;
	challenges_completed: number;
	fastest_time: number | null;
	last_updated: string;
	users: {
		id: string;
		name: string | null;
		email: string | null;
		avatar_url: string | null;
	} | null;
}

interface SubmissionWithUserAndChallenge {
	id: string;
	user_id: string;
	score: number;
	is_correct: boolean;
	execution_time: number | null;
	submitted_at: string;
	users: {
		name: string | null;
		email: string | null;
	} | null;
	challenges: {
		title: string;
	} | null;
}

interface LobbyOwnerCheck {
	created_by: string;
}

export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const { supabase } = locals;
		const { id: lobbyId } = params;

		// Get authenticated user
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if user is lobby owner
		const { data: lobbyData } = await supabase
			.from('lobbies')
			.select('created_by')
			.eq('id', lobbyId)
			.single();

		const lobby = lobbyData as LobbyOwnerCheck | null;
		if (!lobby || lobby.created_by !== user.id) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		// Get live scores with user details
		const { data: scoresData, error: scoresError } = await supabase
			.from('lobby_standings')
			.select(`
				user_id,
				total_score,
				challenges_completed,
				fastest_time,
				last_updated,
				users (
					id,
					name,
					email,
					avatar_url
				)
			`)
			.eq('lobby_id', lobbyId)
			.order('total_score', { ascending: false });

		if (scoresError) {
			console.error('Failed to fetch live scores:', scoresError);
			return json({ error: 'Failed to fetch live scores' }, { status: 500 });
		}

		// Transform scores data with ranks
		const typedScoresData = scoresData as LobbyStandingWithUser[] | null;
		const scores = (typedScoresData || []).map((score, index) => ({
			user_id: score.user_id,
			username: score.users?.name || score.users?.email || 'Anonymous',
			avatar_url: score.users?.avatar_url,
			total_score: score.total_score,
			challenges_completed: score.challenges_completed,
			fastest_time: score.fastest_time,
			latest_submission: score.last_updated,
			rank: index + 1
		}));

		// Get recent submissions
		const { data: submissionsData, error: submissionsError } = await supabase
			.from('lobby_challenge_submissions')
			.select(`
				id,
				user_id,
				score,
				is_correct,
				execution_time,
				submitted_at,
				users (
					name,
					email
				),
				challenges (
					title
				)
			`)
			.eq('lobby_id', lobbyId)
			.order('submitted_at', { ascending: false })
			.limit(20);

		if (submissionsError) {
			console.error('Failed to fetch submissions:', submissionsError);
			return json({ error: 'Failed to fetch submissions' }, { status: 500 });
		}

		// Transform submissions data
		const typedSubmissionsData = submissionsData as SubmissionWithUserAndChallenge[] | null;
		const recentSubmissions = (typedSubmissionsData || []).map(submission => ({
			id: submission.id,
			user_id: submission.user_id,
			username: submission.users?.name || submission.users?.email || 'Anonymous',
			challenge_title: submission.challenges?.title || 'Challenge',
			score: submission.score,
			is_correct: submission.is_correct,
			submitted_at: submission.submitted_at,
			execution_time: submission.execution_time || 0
		}));

		return json({
			scores,
			recentSubmissions,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Live scores API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};