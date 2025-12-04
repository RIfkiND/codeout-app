import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { pistonService } from '$lib/services/pistonService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { code, language = 'javascript' } = await request.json();
		
		// Simple test case for debugging
		const testCase = {
			input: { n: 2 },
			output: 2
		};
		
		console.log('Debug: Testing code execution...');
		console.log('Code:', code);
		
		const result = await pistonService.runTestCases(code, language, [testCase]);
		
		console.log('Debug: Result:', JSON.stringify(result, null, 2));
		
		return json({
			success: true,
			result,
			debug: {
				code,
				language,
				testCase
			}
		});
		
	} catch (error) {
		console.error('Debug error:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		});
	}
};