import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pistonService } from '$lib/services/pistonService';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { language, code, challengeId } = await request.json();

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

		const testCases = challenge.testcases as Array<{ input: Record<string, unknown>; output: unknown }>;

		// Execute code using Piston service
		try {
			const result = await pistonService.runTestCases(code, language, testCases);
			
			const allTestsPassed = result.test_cases_passed === result.total_test_cases;
			
			// Save submission to database
			const { error: submissionError } = await locals.supabase
				.from('submissions')
				.insert({
					user_id: session.user.id,
					challenge_id: challengeId,
					language: language,
					code: code,
					status: allTestsPassed ? 'accepted' : 'wrong_answer',
					execution_time: result.execution_time,
					memory_usage: result.memory_used,
					passed_test_cases: result.test_cases_passed,
					total_test_cases: result.total_test_cases
				});

			if (submissionError) {
				console.error('Failed to save submission:', submissionError);
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
				totalCount: result.total_test_cases
			});
			
		} catch (executionError) {
			console.error('Code execution error:', executionError);
			
			// Save failed submission
			const { error: submissionError } = await locals.supabase
				.from('submissions')
				.insert({
					user_id: session.user.id,
					challenge_id: challengeId,
					language: language,
					code: code,
					status: 'runtime_error',
					execution_time: null,
					memory_usage: null,
					passed_test_cases: 0,
					total_test_cases: testCases.length
				});

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
				totalCount: testCases.length
			});
		}
		
	} catch (error) {
		console.error('API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};