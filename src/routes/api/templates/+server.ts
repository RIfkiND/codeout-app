import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const challengeId = url.searchParams.get('challengeId');
		const language = url.searchParams.get('language');

		// If requesting challenge-specific template
		if (challengeId && language) {
			try {
				// Use the new database function to get challenge-specific template
				const { data, error } = await locals.supabase
					.rpc('get_challenge_template', {
						p_challenge_id: challengeId,
						p_language_name: language
					});

				if (!error && data) {
					return json({
						success: true,
						template: data,
						source: 'challenge-specific'
					});
				}
			} catch (dbError) {
				console.warn('Challenge template fetch failed, using fallback:', dbError);
			}

			// Fallback to default template
			const { data: languageData } = await locals.supabase
				.from('programming_languages')
				.select('template_code')
				.eq('name', language)
				.eq('is_active', true)
				.single();

			return json({
				success: true,
				template: languageData?.template_code || 'function solution() {\n    // Your code here\n    return null;\n}',
				source: 'default'
			});
		}

		// Regular template listing
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