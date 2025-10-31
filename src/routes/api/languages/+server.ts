import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { data: languages, error } = await locals.supabase
			.from('programming_languages')
			.select('*')
			.eq('is_active', true)
			.order('display_name');

		if (error) {
			console.error('Languages fetch error:', error);
			return json({ error: 'Failed to fetch languages' }, { status: 500 });
		}

		return json({
			success: true,
			languages
		});
	} catch (error) {
		console.error('Languages API error:', error);
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Failed to fetch languages'
			},
			{ status: 500 }
		);
	}
};