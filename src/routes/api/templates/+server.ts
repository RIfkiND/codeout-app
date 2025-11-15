import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const challengeId = url.searchParams.get('challenge_id');
		const language = url.searchParams.get('language');

		let query = locals.supabase
			.from('challenge_templates')
			.select(`
				id,
				name,
				description,
				language,
				template_data,
				is_public,
				created_at,
				created_by_user:users!challenge_templates_created_by_fkey (
					id,
					name
				)
			`)
			.eq('is_public', true)
			.order('created_at', { ascending: false });

		if (language) {
			query = query.eq('language', language);
		}

		const { data: templates, error } = await query;

		if (error) {
			console.error('Templates fetch error:', error);
			return json({ error: 'Failed to fetch templates' }, { status: 500 });
		}

		return json({ templates: templates || [] });
	} catch (error) {
		console.error('Templates API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};