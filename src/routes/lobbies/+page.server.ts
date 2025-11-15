import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		const { session } = await locals.safeGetSession();

		// Get all active lobbies
		const { data: lobbies, error } = await locals.supabase
			.from('lobbies')
			.select(`
				*,
				users!lobbies_created_by_fkey (
					name,
					email
				),
				lobby_users (
					joined_at,
					users (
						id,
						name,
						email
					)
				)
			`)
			.eq('status', 'waiting')
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching lobbies:', error);
			return {
				lobbies: [],
				user: session?.user || null
			};
		}

		return {
			lobbies: lobbies || [],
			user: session?.user || null
		};

	} catch (error) {
		console.error('Lobbies page load error:', error);
		return {
			lobbies: [],
			user: null
		};
	}
};