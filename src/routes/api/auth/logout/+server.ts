import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	const { error } = await locals.supabase.auth.signOut();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	// Redirect to home page after successful logout
	redirect(303, '/');
};