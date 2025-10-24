import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	// You can extend this to fetch additional profile data from your database
	const profile = {
		id: user.id,
		email: user.email,
		name: user.user_metadata?.full_name || user.user_metadata?.name || 'Anonymous',
		avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
		provider: user.app_metadata?.provider,
		created_at: user.created_at,
		last_sign_in: user.last_sign_in_at,
		email_verified: user.email_confirmed_at !== null
	};

	return json({ profile });
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	try {
		const { name } = await request.json();

		if (!name) {
			return json({ error: 'Name is required' }, { status: 400 });
		}

		const { data, error } = await locals.supabase.auth.updateUser({
			data: { full_name: name }
		});

		if (error) {
			return json({ error: error.message }, { status: 400 });
		}

		return json({
			message: 'Profile updated successfully',
			user: data.user
		});
	} catch (error) {
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to update profile'
			},
			{ status: 500 }
		);
	}
};