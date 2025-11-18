import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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
		const { challengeId, code, language, executionTime, score, testResults } = await request.json();

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
		const { data: lobbyChallenge } = await locals.supabase
			.from('lobby_challenges')
			.select('*')
			.eq('lobby_id', lobbyId)
			.eq('challenge_id', challengeId)
			.eq('status', 'active')
			.single();

		if (!lobbyChallenge) {
			return json({ error: 'This challenge is not currently active' }, { status: 400 });
		}

		// Create submission record first
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: submission, error: submissionError } = await (locals.supabase as any)
			.from('submissions')
			.insert({
				user_id: user.id,
				challenge_id: challengeId,
				language,
				code,
				execution_time: executionTime,
				test_results: testResults,
				score,
				is_correct: score >= 100,
				status: 'completed',
				submitted_at: new Date().toISOString()
			})
			.select()
			.single();

		if (submissionError) {
			console.error('Submission creation error:', submissionError);
			return json({ error: 'Failed to create submission' }, { status: 500 });
		}

		// Create lobby challenge submission
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: lobbySubmission, error: lobbySubmissionError } = await (locals.supabase as any)
			.from('lobby_challenge_submissions')
			.insert({
				lobby_id: lobbyId,
				challenge_id: challengeId,
				user_id: user.id,
				submission_id: submission.id,
				challenge_order: lobbyChallenge.challenge_order,
				completion_time_ms: executionTime,
				score,
				is_completed: score >= 100
			})
			.select()
			.single();

		if (lobbySubmissionError) {
			console.error('Lobby submission error:', lobbySubmissionError);
			return json({ error: 'Failed to record lobby submission' }, { status: 500 });
		}

		return json({
			success: true,
			submission,
			lobbySubmission,
			message: 'Submission recorded successfully'
		});

	} catch (error) {
		console.error('Submit challenge error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};