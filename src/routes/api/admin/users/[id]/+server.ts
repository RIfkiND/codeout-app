import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, locals, params }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	// Check if current user is admin
	const { data: currentUser } = await locals.supabase
		.from('users')
		.select('role')
		.eq('id', user.id)
		.single();

	if (!currentUser || currentUser.role !== 'admin') {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const { role } = await request.json();
		const userId = params.id;

		if (!role || !['user', 'admin'].includes(role)) {
			return json({ error: 'Valid role (user/admin) is required' }, { status: 400 });
		}

		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Update user role
		const { data, error } = await locals.supabase
			.from('users')
			.update({ role, updated_at: new Date().toISOString() })
			.eq('id', userId)
			.select()
			.single();

		if (error) {
			console.error('Role update error:', error);
			return json({ error: error.message }, { status: 400 });
		}

		return json({
			message: 'User role updated successfully',
			user: data
		});
	} catch (error) {
		console.error('Admin role update error:', error);
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to update user role'
			},
			{ status: 500 }
		);
	}
};