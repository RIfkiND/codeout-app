import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		
		// Debug logging
		console.log('Admin Layout - Session exists:', !!session);
		console.log('Admin Layout - User exists:', !!user);
		console.log('Admin Layout - User ID:', user?.id);
		console.log('Admin Layout - User email:', user?.email);
		
		if (!session || !user) {
			console.log('Admin Layout - No session/user, redirecting to login');
			throw redirect(303, '/auth/login?redirect=/admin');
		}

		// Check if user is admin
		const { data: userData, error: userError } = await locals.supabase
			.from('users')
			.select('role, name, email')
			.eq('id', user.id)
			.single();

		console.log('Admin Layout - User lookup error:', userError);
		console.log('Admin Layout - User data:', userData);

		// Type assertion for Supabase response
		const typedUserData = userData as { role: string; name: string; email: string } | null;

		if (!typedUserData) {
			console.log('Admin Layout - No user data found in database');
			throw redirect(303, '/home?error=user_not_found');
		}

		if (typedUserData.role !== 'admin') {
			console.log('Admin Layout - User role is not admin:', typedUserData.role);
			throw redirect(303, '/home?error=unauthorized');
		}

		console.log('Admin Layout - Access granted to admin user');
		return {
			user: {
				...user,
				name: typedUserData.name,
				role: typedUserData.role,
				email: typedUserData.email
			}
		};
	} catch (error) {
		console.log('Admin Layout - Error occurred:', error);
		if (error instanceof Response) {
			throw error;
		}
		throw redirect(303, '/auth/login?redirect=/admin');
	}
};