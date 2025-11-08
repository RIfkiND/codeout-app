import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, depends }) => {
	depends('supabase:auth');
	
	const { session, user } = await safeGetSession();
	
	let profile = null;
	if (session?.user && supabase) {
		const { data } = await supabase
			.from('user_profiles')
			.select('username, bio, avatar_url')
			.eq('user_id', session.user.id)
			.single();
		profile = data;
	}

	return {
		session,
		user,
		profile
	};
};