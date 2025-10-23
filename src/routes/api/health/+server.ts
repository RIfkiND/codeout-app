import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { session } = await locals.safeGetSession();

	return json({
		status: 'healthy',
		timestamp: new Date().toISOString(),
		authenticated: !!session,
		environment: process.env.NODE_ENV || 'development'
	});
};