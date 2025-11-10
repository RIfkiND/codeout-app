import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Dashboard should be accessible to both authenticated and non-authenticated users
	// But show different content based on authentication state
	
	let profile = null;
	if (locals.session?.user && locals.supabase) {
		const { data } = await locals.supabase
			.from('user_profiles')
			.select('username, bio, avatar_url')
			.eq('user_id', locals.session.user.id)
			.single();
		profile = data;
	}

	return {
		session: locals.session,
		user: locals.session?.user || null,
		profile
	};
};