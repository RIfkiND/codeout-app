import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Type definitions for lobby challenge and submissions
interface LobbyChallenge {
	id: string;
	lobby_id: string;
	challenge_id: string;
	challenge_order: number;
	status: string;
	created_at: string;
	updated_at: string;
}

interface Submission {
	id: string;
	user_id: string;
	challenge_id: string;
	lobby_id: string;
	language: string;
	code: string;
	execution_time: number;
	test_results: unknown[];
	score: number;
	is_completed: boolean;
	test_cases_passed: number;
	total_test_cases: number;
	submitted_at: string;
}

interface LobbyStanding {
	id: string;
	lobby_id: string;
	user_id: string;
	total_score: number;
	challenges_completed: number;
	created_at: string;
	updated_at: string;
}

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const lobbyId = params.id;

		// Verify user is in the lobby
		const { data: membership } = await locals.supabase
			.from('lobby_users')
			.select('id')
			.eq('lobby_id', lobbyId)
			.eq('user_id', user.id)
			.single();

		if (!membership) {
			return json({ error: 'You are not a member of this lobby' }, { status: 403 });
		}

		// Get lobby info with current challenge
		const { data: lobby, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select(`
				*,
				challenges (*),
				lobby_challenges (
					*,
					challenges (*)
				),
				lobby_users (
					*,
					users (
						id,
						name,
						email,
						user_profiles (username, avatar_url)
					)
				)
			`)
			.eq('id', lobbyId)
			.single();

		if (lobbyError || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		// Get current challenge submissions
		const { data: submissions } = await locals.supabase
			.from('lobby_challenge_submissions')
			.select(`
				*,
				users (
					id,
					name,
					email,
					user_profiles (username, avatar_url)
				),
				challenges (
					id,
					title,
					difficulty
				)
			`)
			.eq('lobby_id', lobbyId)
			.order('created_at', { ascending: false });

		// Get lobby standings
		const { data: standings } = await locals.supabase
			.from('lobby_standings')
			.select(`
				*,
				users (
					id,
					name,
					email,
					user_profiles (username, avatar_url)
				)
			`)
			.eq('lobby_id', lobbyId)
			.order('final_rank', { ascending: true });

		return json({
			lobby,
			submissions: submissions || [],
			standings: standings || [],
			currentUserId: user.id
		});

	} catch (error) {
		console.error('Get lobby challenge error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const lobbyId = params.id;
		const { challengeId, code, language, executionTime, score, testResults, isCorrect } = await request.json();

		if (!challengeId || !code || !language || score === undefined) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Verify user is in the lobby
		const { data: membership } = await locals.supabase
			.from('lobby_users')
			.select('id')
			.eq('lobby_id', lobbyId)
			.eq('user_id', user.id)
			.single();

		if (!membership) {
			return json({ error: 'You are not a member of this lobby' }, { status: 403 });
		}

		// Get current lobby challenge info
		const { data: lobbyChallengeData, error: lobbyChallengeError } = await locals.supabase
			.from('lobby_challenges')
			.select('*')
			.eq('lobby_id', lobbyId)
			.eq('challenge_id', challengeId)
			.eq('status', 'active')
			.single();

		const lobbyChallenge = lobbyChallengeData as LobbyChallenge | null;
		if (lobbyChallengeError || !lobbyChallenge) {
			return json({ error: 'This challenge is not currently active in this lobby' }, { status: 400 });
		}

		// Create submission record first
		const { data: submission, error: submissionError } = await locals.supabase
			.from('submissions')
			// @ts-expect-error Supabase generated types have issues with inserts
			.insert({
				user_id: user.id,
				challenge_id: challengeId,
				lobby_id: lobbyId,
				language,
				code,
				execution_time: executionTime || 0,
				test_results: testResults || [],
				score: Math.min(100, Math.max(0, score)),
				is_correct: isCorrect || false,
				test_cases_passed: testResults?.filter((t: { passed: boolean }) => t.passed).length || 0,
				total_test_cases: testResults?.length || 0,
				submitted_at: new Date().toISOString()
			})
			.select()
			.single();

		if (submissionError) {
			console.error('Submission creation error:', submissionError);
			return json({ error: 'Failed to create submission' }, { status: 500 });
		}

		// Create lobby challenge submission
		const { data: lobbySubmission, error: lobbySubmissionError } = await locals.supabase
			.from('lobby_challenge_submissions')
			// @ts-expect-error Supabase generated types have issues with inserts
			.insert({
				lobby_id: lobbyId,
				challenge_id: challengeId,
				user_id: user.id,
				submission_id: (submission as Submission)?.id,
				challenge_order: lobbyChallenge.challenge_order,
				completion_time_ms: executionTime || 0,
				score: Math.min(100, Math.max(0, score)),
				is_completed: isCorrect || false
			})
			.select()
			.single();

		if (lobbySubmissionError) {
			console.error('Lobby submission error:', lobbySubmissionError);
			return json({ error: 'Failed to record lobby submission' }, { status: 500 });
		}

		// Update or create lobby standings
		const { data: existingStanding } = await locals.supabase
			.from('lobby_standings')
			.select('*')
			.eq('lobby_id', lobbyId)
			.eq('user_id', user.id)
			.single();

		if (existingStanding) {
			// Update existing standing
			const newTotalScore = (existingStanding as LobbyStanding).total_score + score;
			const newChallengesCompleted = isCorrect ? (existingStanding as LobbyStanding).challenges_completed + 1 : (existingStanding as LobbyStanding).challenges_completed;
			
			await locals.supabase
				.from('lobby_standings')
				// @ts-expect-error Supabase generated types have issues with dynamic updates
				.update({
					total_score: newTotalScore,
					challenges_completed: newChallengesCompleted,
					updated_at: new Date().toISOString()
				})
				.eq('id', (existingStanding as LobbyStanding).id);
		} else {
			// Create new standing
			await locals.supabase
				.from('lobby_standings')
				// @ts-expect-error Supabase generated types have issues with inserts
				.insert({
					lobby_id: lobbyId,
					user_id: user.id,
					total_score: score,
					challenges_completed: isCorrect ? 1 : 0
				});
		}

		return json({
			success: true,
			submission,
			lobbySubmission,
			score,
			message: 'Submission recorded successfully'
		});

	} catch (error) {
		console.error('Submit challenge error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};