import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const challengeId = url.searchParams.get('challengeId');
		const language = url.searchParams.get('language');

		// If requesting challenge-specific template
		if (challengeId && language) {
			try {
				// Get challenge-specific template from database
			const { data: template, error } = await locals.supabase
				.from('challenge_templates')
				.select('template_code')
				.eq('challenge_id', challengeId)
				.eq('language_name', language)
				.single() as { data: { template_code: string } | null; error: unknown };				if (!error && template) {
					return json({
						success: true,
						template: template?.template_code,
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
				.single() as { data: { template_code: string } | null };

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