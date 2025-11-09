import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	try {
		const { session, user } = await locals.safeGetSession();
		
		if (!session || !user) {
			throw redirect(303, '/auth/login?redirect=/admin');
		}

		// Check if user is admin
		const { data: userData } = await locals.supabase
			.from('users')
			.select('role, username, email')
			.eq('id', user.id)
			.single();

		if (!userData || userData.role !== 'admin') {
			throw redirect(303, '/home?error=unauthorized');
		}

		return {
			user: {
				...user,
				...userData
			}
		};
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}
		throw redirect(303, '/auth/login?redirect=/admin');
	}
};