import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ authenticated: false, user: null }, { status: 401 });
	}

	return json({
		authenticated: true,
		user: {
			id: user.id,
			email: user.email,
			name: user.user_metadata?.full_name || user.user_metadata?.name,
			avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
			provider: user.app_metadata?.provider
		},
		session: {
			access_token: session.access_token,
			expires_at: session.expires_at
		}
	});
};