import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		if (!session) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { data: challenge, error } = await locals.supabase
			.from('challenges')
			.select(`
				*,
				challenge_categories (
					categories (
						id,
						name
					)
				)
			`)
			.eq('id', params.id)
			.single();

		if (error) {
			console.error('Challenge fetch error:', error);
			return json({ error: 'Challenge not found' }, { status: 404 });
		}

		return json({ challenge });
	} catch (error) {
		console.error('Challenge API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to fetch challenge'
		}, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check if user is admin or challenge creator
		const { data: challenge } = await locals.supabase
			.from('challenges')
			.select('created_by')
			.eq('id', params.id)
			.single();

		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		const isCreator = challenge?.created_by === user.id;
		const isAdmin = userData?.role === 'admin';

		if (!isCreator && !isAdmin) {
			return json({ error: 'Only challenge creator or admin can modify this challenge' }, { status: 403 });
		}

		const updateData = await request.json();

		const { data: updatedChallenge, error } = await locals.supabase
			.from('challenges')
			.update(updateData)
			.eq('id', params.id)
			.select()
			.single();

		if (error) {
			console.error('Challenge update error:', error);
			return json({ error: 'Failed to update challenge' }, { status: 500 });
		}

		return json({ challenge: updatedChallenge });
	} catch (error) {
		console.error('Challenge update API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to update challenge'
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		// Check if user is admin or challenge creator
		const { data: challenge } = await locals.supabase
			.from('challenges')
			.select('created_by')
			.eq('id', params.id)
			.single();

		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		const isCreator = challenge?.created_by === user.id;
		const isAdmin = userData?.role === 'admin';

		if (!isCreator && !isAdmin) {
			return json({ error: 'Only challenge creator or admin can delete this challenge' }, { status: 403 });
		}

		const { error } = await locals.supabase
			.from('challenges')
			.delete()
			.eq('id', params.id);

		if (error) {
			console.error('Challenge delete error:', error);
			return json({ error: 'Failed to delete challenge' }, { status: 500 });
		}

		return json({ message: 'Challenge deleted successfully' });
	} catch (error) {
		console.error('Challenge delete API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to delete challenge'
		}, { status: 500 });
	}
};