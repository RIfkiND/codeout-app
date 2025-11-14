import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const { user } = await locals.safeGetSession();
		
		if (!user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check admin role
		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		if (userData?.role !== 'admin') {
			return json({ error: 'Admin access required' }, { status: 403 });
		}

		const { data: templates, error } = await locals.supabase
			.from('challenge_templates')
			.select(`
				*,
				created_by_user:users!challenge_templates_created_by_fkey (
					id,
					name
				)
			`)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Templates fetch error:', error);
			return json({ error: 'Failed to fetch templates' }, { status: 500 });
		}

		return json({ templates });
	} catch (error) {
		console.error('Templates API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { user } = await locals.safeGetSession();
		
		if (!user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check admin role
		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		if (userData?.role !== 'admin') {
			return json({ error: 'Admin access required' }, { status: 403 });
		}

		const templateData = await request.json();
		const { name, description, language, template_data, is_public } = templateData;

		// Validate required fields
		if (!name?.trim() || !language || !template_data) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const { data: template, error } = await locals.supabase
			.from('challenge_templates')
			.insert({
				name: name.trim(),
				description: description?.trim() || null,
				language,
				template_data,
				is_public: Boolean(is_public),
				created_by: user.id
			} as any)
			.select()
			.single();

		if (error) {
			console.error('Template creation error:', error);
			return json({ error: 'Failed to create template' }, { status: 500 });
		}

		return json({ template }, { status: 201 });
	} catch (error) {
		console.error('Template creation API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};