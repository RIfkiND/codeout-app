import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PISTON_API_URL } from '$env/static/private';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Check if user is authenticated
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const response = await fetch(`${PISTON_API_URL}/runtimes`);

		if (!response.ok) {
			throw new Error(`Piston API error: ${response.statusText}`);
		}

		const runtimes = await response.json();

		// Format the response for easier frontend consumption
		const languages = runtimes.map((runtime: {
			language: string;
			version: string;
			aliases?: string[];
			runtime?: string;
		}) => ({
			name: runtime.language,
			version: runtime.version,
			aliases: runtime.aliases || [],
			runtime: runtime.runtime || runtime.language
		}));

		return json({
			success: true,
			languages
		});
	} catch (error) {
		console.error('Languages fetch error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch languages'
			},
			{ status: 500 }
		);
	}
};