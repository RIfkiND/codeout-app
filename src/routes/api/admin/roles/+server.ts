import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		
		if (!session || !user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check if current user is admin
		const { data: currentUser } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', user.id)
			.single();

		const typedCurrentUser = currentUser as { role: string } | null;

		if (!typedCurrentUser || typedCurrentUser.role !== 'admin') {
			return json({ error: 'Forbidden - Admin access required' }, { status: 403 });
		}

		const { userId, role } = await request.json();

		if (!userId || !role || !['user', 'admin'].includes(role)) {
			return json({ error: 'Invalid userId or role' }, { status: 400 });
		}

		// Update the target user's role
		const updateData = {
			role: role as string,
			updated_at: new Date().toISOString()
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data, error } = await (locals.supabase as any)
			.from('users')
			.update(updateData)
			.eq('id', userId)
			.select('id, name, email, role, updated_at')
			.single();

		if (error) {
			console.error('Error updating user role:', error);
			return json({ error: 'Failed to update user role' }, { status: 500 });
		}

		return json({ 
			message: 'User role updated successfully',
			user: data
		});

	} catch (error) {
		console.error('Role update API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// Make Kaka ND admin endpoint
export const PATCH: RequestHandler = async ({ locals }) => {
	try {
		const { session } = await locals.safeGetSession();
		
		if (!session) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Update Kaka ND to admin (one-time operation)
		const updateData = {
			role: 'admin' as const,
			updated_at: new Date().toISOString()
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data, error } = await (locals.supabase as any)
			.from('users')
			.update(updateData)
			.eq('email', 'ndkaka04@gmail.com')
			.select('id, name, email, role, updated_at')
			.single();

		if (error) {
			console.error('Error making Kaka ND admin:', error);
			return json({ error: 'Failed to update role' }, { status: 500 });
		}

		return json({ 
			message: 'Kaka ND is now an admin',
			user: data
		});

	} catch (error) {
		console.error('Admin promotion error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};