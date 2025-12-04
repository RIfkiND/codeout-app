import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
		if (userError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const submissionData = await request.json();
		const {
			challenge_id,
			code,
			language,
			lobby_id,
			single_player_session_id
		} = submissionData;

		if (!challenge_id || !code || !language) {
			return json({ 
				error: 'Challenge ID, code, and language are required' 
			}, { status: 400 });
		}

		// Validate that either lobby_id or single_player_session_id is provided, not both
		if (
			(!lobby_id && !single_player_session_id) ||
			(lobby_id && single_player_session_id)
		) {
			return json({
				error: 'Either lobby_id or single_player_session_id must be provided, but not both'
			}, { status: 400 });
		}

		// Execute the code first
		const executionResult = await fetch('/api/code/run', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				language,
				code,
				challengeId: challenge_id
			})
		});

		const execution = await executionResult.json();

		// For now, we'll assume it's correct if there's no error
		// In a real implementation, you'd run this against test cases
		const is_correct = execution.success && !execution.stderr;
		const score = is_correct ? 100 : 0;

		const { data: submission, error } = await locals.supabase
			.from('submissions')
			.insert({
				user_id: user.id,
				challenge_id,
				code,
				language,
				lobby_id: lobby_id || null,
				single_player_session_id: single_player_session_id || null,
				is_correct,
				score,
				execution_time: execution.execution_time || null,
				error_message: execution.stderr || null
			})
			.select()
			.single();

		if (error) {
			console.error('Submission creation error:', error);
			return json({ error: 'Failed to create submission' }, { status: 500 });
		}

		return json({
			submission,
			execution: execution
		});
	} catch (error) {
		console.error('Submission API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to create submission'
		}, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const { data: { user }, error: userError } = await locals.supabase.auth.getUser();
		if (userError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const challenge_id = url.searchParams.get('challenge_id');

		const offset = (page - 1) * limit;

		let query = locals.supabase
			.from('submissions')
			.select(`
				*,
				challenges (
					id,
					title,
					difficulty
				)
			`)
			.eq('user_id', user.id)
			.range(offset, offset + limit - 1)
			.order('submitted_at', { ascending: false });

		if (challenge_id) {
			query = query.eq('challenge_id', challenge_id);
		}

		const { data: submissions, error } = await query;

		if (error) {
			console.error('Submissions fetch error:', error);
			return json({ error: 'Failed to fetch submissions' }, { status: 500 });
		}

		return json({ submissions });
	} catch (error) {
		console.error('Submissions API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to fetch submissions'
		}, { status: 500 });
	}
};