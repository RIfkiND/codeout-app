import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PISTON_API_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check if user is authenticated
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { language, version, code, input } = await request.json();

		if (!language || !code) {
			return json({ error: 'Language and code are required' }, { status: 400 });
		}

		const response = await fetch(`${PISTON_API_URL}/execute`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				language,
				version: version || 'latest',
				files: [
					{
						content: code
					}
				],
				stdin: input || ''
			})
		});

		if (!response.ok) {
			throw new Error(`Piston API error: ${response.statusText}`);
		}

		const result = await response.json();

		return json({
			success: true,
			output: result.run?.output || '',
			stderr: result.run?.stderr || '',
			stdout: result.run?.stdout || '',
			code: result.run?.code || 0,
			language,
			version: result.version || version
		});
	} catch (error) {
		console.error('Code execution error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			},
			{ status: 500 }
		);
	}
};