import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params, locals }) => {
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

		const templateId = params.id;

		if (!templateId) {
			return json({ error: 'Template ID required' }, { status: 400 });
		}

		const { error } = await locals.supabase
			.from('challenge_templates')
			.delete()
			.eq('id', templateId);

		if (error) {
			console.error('Template deletion error:', error);
			return json({ error: 'Failed to delete template' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Template deletion API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
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

		const templateId = params.id;
		const updateData = await request.json();

		if (!templateId) {
			return json({ error: 'Template ID required' }, { status: 400 });
		}

		const { data: template, error } = await locals.supabase
			.from('challenge_templates')
			.update(updateData as any)
			.eq('id', templateId)
			.select()
			.single();

		if (error) {
			console.error('Template update error:', error);
			return json({ error: 'Failed to update template' }, { status: 500 });
		}

		return json({ template });
	} catch (error) {
		console.error('Template update API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};