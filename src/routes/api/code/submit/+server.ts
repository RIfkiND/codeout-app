import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pistonService } from '$lib/services/pistonService';

// Helper function to get or create single player session
async function getOrCreateSinglePlayerSession(supabase: unknown, userId: string) {
	// Check if there's an existing in-progress session for this user
	const { data: existingSession } = await supabase
		.from('single_player_sessions')
		.select('id')
		.eq('user_id', userId)
		.eq('status', 'in_progress')
		.single();

	if (existingSession) {
		return existingSession.id;
	}

	// Create new session
	const { data: newSession, error } = await supabase
		.from('single_player_sessions')
		.insert({
			user_id: userId,
			status: 'in_progress'
		})
		.select('id')
		.single();

	if (error) {
		console.error('Failed to create single player session:', error);
		return null;
	}

	return newSession.id;
}

// This endpoint runs code AND saves submission to database
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
			console.log('Challenge not found for submission, ID:', challengeId);
			return json({ error: 'Challenge not found' }, { status: 404 });
		}

		// Parse test cases - they can be stored as JSON string or already parsed
		let testCases = challenge.testcases;
		
		// If testcases is a string, parse it
		if (typeof testCases === 'string') {
			try {
				testCases = JSON.parse(testCases);
			} catch (parseError) {
				console.error('Failed to parse testcases:', parseError);
				return json({ error: 'Invalid test cases format' }, { status: 400 });
			}
		}

		// Ensure testCases is an array
		if (!Array.isArray(testCases)) {
			// If it's a single test case object, wrap it in an array
			if (testCases && typeof testCases === 'object' && testCases.input && testCases.output !== undefined) {
				testCases = [testCases];
			} else {
				console.error('Invalid testcases format:', testCases);
				return json({ error: 'Test cases must be an array or valid test case object' }, { status: 400 });
			}
		}

		// Validate and format test cases
		const formattedTestCases = testCases.map((testCase: unknown, index: number) => {
			if (!testCase || typeof testCase !== 'object') {
				throw new Error(`Test case ${index + 1} is invalid`);
			}
			
			const testCaseObj = testCase as Record<string, unknown>;
			if (!('input' in testCaseObj) || !('output' in testCaseObj)) {
				throw new Error(`Test case ${index + 1} must have 'input' and 'output' properties`);
			}

			return {
				input: testCaseObj.input as Record<string, unknown>,
				output: testCaseObj.output
			};
		});

		// Execute code using Piston service
		try {
			const result = await pistonService.runTestCases(code, language, formattedTestCases);
			
			const allTestsPassed = result.test_cases_passed === result.total_test_cases;
			
			// For single player mode, get or create session ID
			let singlePlayerSessionId = null;
			if (!lobbyId) {
				singlePlayerSessionId = await getOrCreateSinglePlayerSession(
					locals.supabase, 
					session.user.id
				);
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
			
			const { error: submissionError } = await locals.supabase
				.from('submissions')
				.insert(submissionData);

			if (submissionError) {
				console.error('Failed to save submission:', submissionError);
				// Don't fail the whole request if submission fails, just log it
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
				submitted: true,
				result: {
					...result,
					score: allTestsPassed ? 100 : Math.round((result.test_cases_passed / result.total_test_cases) * 100)
				},
				testResults: result.test_cases,
				allTestsPassed,
				passedCount: result.test_cases_passed,
				totalCount: result.total_test_cases,
				isFirstToSolve,
				isMultiplayer: !!lobbyId,
				executionTime: result.execution_time,
				memory: result.memory_used,
				output: result.test_cases.map(tc => 
					`Test ${tc.id}: ${tc.passed ? 'PASSED' : 'FAILED'} (${tc.time})\n${tc.passed ? '' : `Expected: ${tc.expected}, Got: ${tc.actual}`}`
				).join('\n')
			});
			
		} catch (executionError) {
			console.error('Code execution error:', executionError);
			
			// For single player mode, get or create session ID
			let singlePlayerSessionId = null;
			if (!lobbyId) {
				singlePlayerSessionId = await getOrCreateSinglePlayerSession(
					locals.supabase, 
					session.user.id
				);
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
				total_test_cases: formattedTestCases.length,
				error_message: executionError instanceof Error ? executionError.message : 'Code execution failed',
				lobby_id: lobbyId || null,
				single_player_session_id: singlePlayerSessionId
			};
			const { error: submissionError } = await locals.supabase
				.from('submissions')
				.insert(failedSubmissionData);

			if (submissionError) {
				console.error('Failed to save failed submission:', submissionError);
			}
			
			return json({
				success: false,
				submitted: true,
				error: executionError instanceof Error ? executionError.message : 'Code execution failed',
				testResults: [],
				allTestsPassed: false,
				passedCount: 0,
				totalCount: formattedTestCases.length,
				isFirstToSolve: false,
				isMultiplayer: !!lobbyId,
				executionTime: 0,
				memory: 0,
				output: `Error: ${executionError instanceof Error ? executionError.message : 'Code execution failed'}`
			});
		}
		
	} catch (error) {
		console.error('API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};