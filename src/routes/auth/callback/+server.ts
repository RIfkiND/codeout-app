import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') || '/dashboard';

	if (code) {
		const supabase = locals.supabase;
		
		// Exchange the code for a session
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		
		if (!error) {
			// Redirect to the next page or dashboard
			// Note: User profile creation is handled automatically by the database trigger
			throw redirect(303, next);
		}
	}

	// If there's an error or no code, redirect to login with error
	throw redirect(303, '/auth/login?error=auth_failed');
};