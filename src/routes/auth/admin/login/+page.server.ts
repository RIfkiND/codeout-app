import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { session } = await locals.safeGetSession();
	
	// If already logged in, check if admin and redirect
	if (session) {
		const { data: userData } = await locals.supabase
			.from('users')
			.select('role')
			.eq('id', session.user.id)
			.single();
			
		// Type assertion for Supabase response
		const typedUserData = userData as { role: string } | null;
			
		if (typedUserData?.role === 'admin') {
			throw redirect(303, '/admin');
		} else {
			// Not an admin, redirect to regular dashboard with error
			throw redirect(303, '/home?error=admin_required');
		}
	}
	
	return {
		redirectTo: url.searchParams.get('redirect') || '/admin'
	};
};

export const actions: Actions = {
	login: async ({ request, locals }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString();
		const password = formData.get('password')?.toString();
		const redirectTo = formData.get('redirectTo')?.toString() || '/admin';

		if (!email || !password) {
			return fail(400, { 
				error: 'Email and password are required',
				email 
			});
		}

		try {
			const { data: authData, error: authError } = await locals.supabase.auth.signInWithPassword({
				email,
				password
			});

			if (authError) {
				return fail(400, { 
					error: authError.message,
					email 
				});
			}

			if (!authData.user) {
				return fail(400, { 
					error: 'Login failed',
					email 
				});
			}

			// Check if user is admin
			const { data: userData, error: userError } = await locals.supabase
				.from('users')
				.select('role')
				.eq('id', authData.user.id)
				.single();

			// Type assertion for Supabase response
			const typedUserData = userData as { role: string } | null;

			if (userError) {
				console.error('User role check error:', userError);
				await locals.supabase.auth.signOut();
				return fail(500, { 
					error: 'Failed to verify admin access',
					email 
				});
			}

			if (!typedUserData || typedUserData.role !== 'admin') {
				// Sign out non-admin user
				await locals.supabase.auth.signOut();
				return fail(403, { 
					error: 'Admin access required. This account does not have admin privileges.',
					email 
				});
			}

			throw redirect(303, redirectTo);
		} catch (error) {
			if (error instanceof Response) {
				throw error;
			}
			console.error('Admin login error:', error);
			return fail(500, { 
				error: 'Login failed. Please try again.',
				email 
			});
		}
	}
};