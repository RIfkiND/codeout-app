import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = 20;
		const offset = (page - 1) * limit;
		
		// Get challenges with pagination
		const { data: challenges, error } = await locals.supabase
			.from('challenges')
			.select(`
				id,
				title,
				difficulty,
				category,
				created_at,
				is_global,
				view_count,
				attempt_count,
				success_rate
			`)
			.eq('is_global', true)
			.order('created_at', { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) {
			console.error('Error fetching challenges:', error);
			return {
				challenges: [],
				pagination: { page, limit, total: 0, totalPages: 0 }
			};
		}

		// Get total count
		const { count } = await locals.supabase
			.from('challenges')
			.select('*', { count: 'exact', head: true })
			.eq('is_global', true);

		return {
			challenges: challenges || [],
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit)
			}
		};
	} catch (error) {
		console.error('Challenge management page load error:', error);
		return {
			challenges: [],
			pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
		};
	}
};