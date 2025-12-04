import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const PATCH: RequestHandler = async ({ request, locals }) => {
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

		if ((userData as { role: string } | null)?.role !== 'admin') {
			return json({ error: 'Admin access required' }, { status: 403 });
		}

		const { userId, role } = await request.json();

		if (!userId || !role) {
			return json({ error: 'userId and role are required' }, { status: 400 });
		}

		if (!['user', 'admin'].includes(role)) {
			return json({ error: 'Invalid role' }, { status: 400 });
		}

		// Update user role
		const { error } = await locals.supabase
			.from('users')
			.update({ role })
			.eq('id', userId);

		if (error) {
			console.error('User role update error:', error);
			return json({ error: 'Failed to update user role' }, { status: 500 });
		}

		return json({ success: true, message: 'User role updated successfully' });
	} catch (error) {
		console.error('User management API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
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

		if ((userData as { role: string } | null)?.role !== 'admin') {
			return json({ error: 'Admin access required' }, { status: 403 });
		}

		const { userId } = await request.json();

		if (!userId) {
			return json({ error: 'userId is required' }, { status: 400 });
		}

		// Don't allow deleting other admin users
		const { data: targetUser } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', userId)
			.single();

		if ((targetUser as { role: string } | null)?.role === 'admin') {
			return json({ error: 'Cannot delete admin users' }, { status: 403 });
		}

		// Delete user (cascades to related tables)
		const { error } = await locals.supabase
			.from('users')
			.delete()
			.eq('id', userId);

		if (error) {
			console.error('User deletion error:', error);
			return json({ error: 'Failed to delete user' }, { status: 500 });
		}

		return json({ success: true, message: 'User deleted successfully' });
	} catch (error) {
		console.error('User deletion API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};