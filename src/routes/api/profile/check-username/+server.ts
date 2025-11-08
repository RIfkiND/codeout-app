import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/profile/check-username?username=test - Check if username is available
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.supabase || !locals.session) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const username = url.searchParams.get('username');
	
	if (!username) {
		return json({ error: 'Username parameter is required' }, { status: 400 });
	}

	const normalizedUsername = username.toLowerCase().trim();

	// Validate format
	if (!/^[a-z0-9_-]+$/.test(normalizedUsername)) {
		return json({ 
			available: false, 
			error: 'Username can only contain lowercase letters, numbers, underscores, and hyphens' 
		});
	}

	if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
		return json({ 
			available: false, 
			error: 'Username must be between 3 and 30 characters' 
		});
	}

	try {
		// Check if username is already taken (excluding current user)
		const { data: existingUser, error } = await locals.supabase
			.from('user_profiles')
			.select('user_id')
			.eq('username', normalizedUsername)
			.neq('user_id', locals.session.user.id)
			.single();

		if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
			console.error('Error checking username:', error);
			return json({ error: 'Failed to check username availability' }, { status: 500 });
		}

		const available = !existingUser;

		return json({ 
			available, 
			username: normalizedUsername,
			error: available ? null : 'Username is already taken'
		});
	} catch (error) {
		console.error('Username check error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};