import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pistonService } from '$lib/services/pistonService';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { language, code, challengeId, lobbyId } = await request.json();

		if (!language || !code || !challengeId) {
			return json({ error: 'Language, code, and challengeId are required' }, { status: 400 });
		}

		// Get challenge test cases from database
		const { data: challenge, error: challengeError } = await locals.supabase
			.from('challenges')
			.select('testcases, title')
			.eq('id', challengeId)
			.single();
		
		if (challengeError || !challenge) {
			return json({ error: 'Challenge not found' }, { status: 404 });
		}

		const challengeData = challenge as { testcases: Array<{ input: Record<string, unknown>; output: unknown }> };
		const testCases = challengeData.testcases;

		// Execute code using Piston service
		try {
			const result = await pistonService.runTestCases(code, language, testCases);
			
			const allTestsPassed = result.test_cases_passed === result.total_test_cases;
			
			// For single player mode, create or get a session ID
			let singlePlayerSessionId = null;
			if (!lobbyId) {
				// Generate a session ID for single player mode
				singlePlayerSessionId = `session_${session.user.id}_${Date.now()}`;
			}
			
			// Save submission to database
			const submissionData = {
				user_id: session.user.id,
				challenge_id: challengeId as string,
				language: language as string,
				code: code as string,
				is_correct: allTestsPassed,
				score: allTestsPassed ? 100 : Math.round((result.test_cases_passed / result.total_test_cases) * 100),
				execution_time: result.execution_time,
				memory_used: result.memory_used,
				test_cases_passed: result.test_cases_passed,
				total_test_cases: result.total_test_cases,
				lobby_id: lobbyId || null,
				single_player_session_id: singlePlayerSessionId
			};
			
			const { error: submissionError } = await (locals.supabase
				.from('submissions') as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error?: unknown }> })
				.insert(submissionData);

			if (submissionError) {
				console.error('Failed to save submission:', submissionError);
			}

			// Check if this is the first solution in a lobby
			let isFirstToSolve = false;
			if (lobbyId && allTestsPassed) {
				const { data: previousSolutions } = await locals.supabase
					.from('submissions')
					.select('id')
					.eq('lobby_id', lobbyId)
					.eq('challenge_id', challengeId)
					.eq('is_correct', true)
					.order('submitted_at', { ascending: true })
					.limit(1);

				// If this is the only accepted solution, they're the first to solve
				isFirstToSolve = previousSolutions?.length === 1;
			}
			
			return json({
				success: true,
				output: result.test_cases.map(tc => `Test ${tc.id}: ${tc.passed ? 'PASSED' : 'FAILED'} (${tc.time})\n${tc.passed ? '' : `Expected: ${tc.expected}, Got: ${tc.actual}`}`).join('\n'),
				error: result.error_message,
				executionTime: result.execution_time,
				memory: result.memory_used,
				testResults: result.test_cases,
				allTestsPassed,
				passedCount: result.test_cases_passed,
				totalCount: result.total_test_cases,
				isFirstToSolve,
				isMultiplayer: !!lobbyId
			});
			
		} catch (executionError) {
			console.error('Code execution error:', executionError);
			
			// For single player mode, create or get a session ID
			let singlePlayerSessionId = null;
			if (!lobbyId) {
				// Generate a session ID for single player mode
				singlePlayerSessionId = `session_${session.user.id}_${Date.now()}`;
			}
			
			// Save failed submission
			const failedSubmissionData = {
				user_id: session.user.id,
				challenge_id: challengeId as string,
				language: language as string,
				code: code as string,
				is_correct: false,
				score: 0,
				execution_time: null,
				memory_used: null,
				test_cases_passed: 0,
				total_test_cases: testCases.length,
				error_message: executionError instanceof Error ? executionError.message : 'Code execution failed',
				lobby_id: lobbyId || null,
				single_player_session_id: singlePlayerSessionId
			};
			const { error: submissionError } = await (locals.supabase
				.from('submissions') as unknown as { insert: (data: Record<string, unknown>) => Promise<{ error?: unknown }> })
				.insert(failedSubmissionData);

			if (submissionError) {
				console.error('Failed to save failed submission:', submissionError);
			}
			
			return json({
				success: false,
				output: '',
				error: executionError instanceof Error ? executionError.message : 'Code execution failed',
				executionTime: 0,
				memory: 0,
				testResults: [],
				allTestsPassed: false,
				passedCount: 0,
				totalCount: testCases.length,
				isFirstToSolve: false,
				isMultiplayer: !!lobbyId
			});
		}
		
	} catch (error) {
		console.error('API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};