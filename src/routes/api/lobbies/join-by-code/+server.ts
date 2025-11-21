import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { lobbyCode } = await request.json();

		if (!lobbyCode || lobbyCode.length !== 6) {
			return json({ error: 'Valid lobby code is required (6 characters)' }, { status: 400 });
		}

		// Find lobby by code
		const { data: lobby, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select('id, name, status, max_participants, created_by')
			.eq('lobby_code', lobbyCode.toUpperCase())
			.single();

		if (lobbyError || !lobby) {
			return json({ error: 'Invalid lobby code' }, { status: 404 });
		}

		const lobbyData = lobby as {
			id: string;
			name: string;
			status: string;
			max_participants: number;
			created_by: string;
		};

		// Check if lobby is joinable
		if (lobbyData.status !== 'waiting') {
			return json({ error: 'This lobby is no longer accepting new participants' }, { status: 400 });
		}

		// Check if user is already in the lobby
		const { data: existingMembership } = await locals.supabase
			.from('lobby_users')
			.select('id')
			.eq('lobby_id', lobbyData.id)
			.eq('user_id', user.id)
			.single();

		if (existingMembership) {
			return json({ error: 'You are already in this lobby' }, { status: 400 });
		}

		// Check current participant count
		const { count } = await locals.supabase
			.from('lobby_users')
			.select('*', { count: 'exact', head: true })
			.eq('lobby_id', lobbyData.id);

		if (count && count >= lobbyData.max_participants) {
			return json({ error: 'This lobby is full' }, { status: 400 });
		}

		// Join the lobby
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { data: lobbyUser, error: joinError } = await (locals.supabase as any)
			.from('lobby_users')
			.insert({
				lobby_id: lobbyData.id,
				user_id: user.id,
				is_creator: lobbyData.created_by === user.id,
				is_ready: false,
				joined_at: new Date().toISOString()
			})
			.select(`
				*,
				users (
					id,
					name,
					email,
					user_profiles (
						username,
						avatar_url
					)
				)
			`)
			.single();

		if (joinError) {
			console.error('Join lobby error:', joinError);
			return json({ error: 'Failed to join lobby' }, { status: 500 });
		}

		// Return success with lobby and user info
		return json({
			success: true,
			message: `Successfully joined "${lobbyData.name}"`,
			lobby: {
				id: lobbyData.id,
				name: lobbyData.name,
				status: lobbyData.status
			},
			lobbyUser
		});

	} catch (error) {
		console.error('Join by code API error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};