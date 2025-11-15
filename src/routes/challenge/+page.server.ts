import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Get user and profile if authenticated, but don't require authentication
	const { session } = await locals.safeGetSession();
	
	if (!session) {
		// Return null values for unauthenticated users
		return {
			user: null,
			profile: null
		};
	}

	try {
		// Get user profile for authenticated users
		const { data: profile } = await locals.supabase
			.from('users')
			.select('*')
			.eq('id', session.user.id)
			.single();

		return {
			user: session.user,
			profile: profile || null
		};
	} catch (error) {
		console.error('Error loading user profile:', error);
		return {
			user: session.user,
			profile: null
		};
	}
};