import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// GET /api/profile - Get current user's profile
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.supabase || !locals.session) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const { data: profile, error } = await locals.supabase
			.from('user_profiles')
			.select(`
				*,
				users!inner(*)
			`)
			.eq('user_id', locals.session.user.id)
			.single();

		if (error) {
			console.error('Error fetching profile:', error);
			return json({ error: 'Failed to fetch profile' }, { status: 500 });
		}

		return json({ profile });
	} catch (error) {
		console.error('Profile fetch error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// PUT /api/profile - Update current user's profile
export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.supabase || !locals.session) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const updates = await request.json();
		const allowedFields = [
			'username', 
			'bio', 
			'github_username', 
			'preferred_language',
			'avatar_url'
		];

		// Filter to only allow specific fields
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([key]) => allowedFields.includes(key))
		);

		// Validate username if provided
		if (filteredUpdates.username) {
			const username = (filteredUpdates.username as string).toLowerCase().trim();
			
			// Check username format
			if (!/^[a-z0-9_-]+$/.test(username)) {
				return json({ 
					error: 'Username can only contain lowercase letters, numbers, underscores, and hyphens' 
				}, { status: 400 });
			}

			if (username.length < 3 || username.length > 30) {
				return json({ 
					error: 'Username must be between 3 and 30 characters' 
				}, { status: 400 });
			}

			// Check if username is already taken
			const { data: existingUser, error: checkError } = await locals.supabase
				.from('user_profiles')
				.select('user_id')
				.eq('username', username)
				.neq('user_id', locals.session.user.id)
				.single();

			if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows found"
				console.error('Error checking username:', checkError);
				return json({ error: 'Failed to validate username' }, { status: 500 });
			}

			if (existingUser) {
				return json({ error: 'Username is already taken' }, { status: 400 });
			}

			filteredUpdates.username = username;
		}

		// Update profile
		const { data: updatedProfile, error: updateError } = await (locals.supabase
			.from('user_profiles') as unknown as { update: (data: Record<string, unknown>) => { eq: (field: string, value: string) => { select: () => { single: () => Promise<{ data: unknown; error?: unknown }> } } } })
			.update(filteredUpdates)
			.eq('user_id', locals.session.user.id)
			.select()
			.single();

		if (updateError) {
			console.error('Error updating profile:', updateError);
			return json({ error: 'Failed to update profile' }, { status: 500 });
		}

		return json({ profile: updatedProfile });
	} catch (error) {
		console.error('Profile update error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};