import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Get all categories
		const { data: categories, error: categoriesError } = await locals.supabase
			.from('categories')
			.select('id, name, description')
			.order('name');

		if (categoriesError) {
			console.error('Error fetching categories:', categoriesError);
		}

		// Get unique tags from challenges
		const { data: challenges, error: challengesError } = await locals.supabase
			.from('challenges')
			.select('tags')
			.not('tags', 'is', null);

		if (challengesError) {
			console.error('Error fetching challenge tags:', challengesError);
		}

		// Extract and count unique tags
		const tagCounts: Record<string, number> = {};
		challenges?.forEach(challenge => {
			if (challenge.tags && Array.isArray(challenge.tags)) {
				challenge.tags.forEach(tag => {
					if (typeof tag === 'string') {
						tagCounts[tag] = (tagCounts[tag] || 0) + 1;
					}
				});
			}
		});

		// Convert to array format
		const tags = Object.entries(tagCounts).map(([tag, count]) => ({
			id: tag.toLowerCase().replace(/\s+/g, '-'),
			name: tag,
			count
		})).sort((a, b) => b.count - a.count); // Sort by popularity

		// Get challenge counts per category
		const categoriesWithCounts = await Promise.all(
			(categories || []).map(async (category) => {
				const { count } = await locals.supabase
					.from('challenges')
					.select('id', { count: 'exact', head: true })
					.eq('category', category.name);

				return {
					id: category.id,
					name: category.name,
					description: category.description,
					count: count || 0
				};
			})
		);

		// Get total challenge count
		const { count: totalChallenges } = await locals.supabase
			.from('challenges')
			.select('id', { count: 'exact', head: true });

		return json({
			categories: categoriesWithCounts,
			tags,
			totalChallenges: totalChallenges || 0
		});

	} catch (error) {
		console.error('API error:', error);
		return json({ 
			error: 'Failed to fetch filter data',
			categories: [],
			tags: [],
			totalChallenges: 0
		}, { status: 500 });
	}
};