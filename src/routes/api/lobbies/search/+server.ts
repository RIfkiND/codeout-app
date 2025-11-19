import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// Type definitions for the joined query response
interface LobbyWithCreatorAndUsers {
	id: string;
	name: string;
	description: string | null;
	status: string;
	max_participants: number;
	is_private: boolean;
	created_at: string;
	time_limit_minutes: number | null;
	created_by: string;
	users: {
		name: string | null;
		email: string | null;
	} | null;
	lobby_users: {
		user_id: string;
	}[] | null;
}

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const { supabase } = locals;
		const code = url.searchParams.get('code');

		if (!code) {
			return json({ error: 'Lobby code is required' }, { status: 400 });
		}

		// Get authenticated user
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Search for lobby by ID or name (lobby code can be the ID)
		const { data: lobby, error } = await supabase
			.from('lobbies')
			.select(`
				id,
				name,
				description,
				status,
				max_participants,
				is_private,
				created_at,
				time_limit_minutes,
				created_by,
				users:created_by (
					name,
					email
				),
				lobby_users (
					user_id
				)
			`)
			.or(`id.eq.${code},name.ilike.%${code}%`)
			.single();

		if (error || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		// Type assert the lobby data
		const typedLobby = lobby as LobbyWithCreatorAndUsers;

		// Check if user is already in the lobby
		const isAlreadyMember = typedLobby.lobby_users?.some((lu) => lu.user_id === user.id);

		// Format response
		const lobbyPreview = {
			id: typedLobby.id,
			name: typedLobby.name,
			description: typedLobby.description,
			status: typedLobby.status,
			max_participants: typedLobby.max_participants,
			participant_count: typedLobby.lobby_users?.length || 0,
			is_private: typedLobby.is_private,
			created_at: typedLobby.created_at,
			time_limit_minutes: typedLobby.time_limit_minutes,
			creator_name: typedLobby.users?.name || typedLobby.users?.email || 'Anonymous',
			is_creator: typedLobby.created_by === user.id,
			is_member: isAlreadyMember
		};

		return json({ lobby: lobbyPreview });

	} catch (error) {
		console.error('Search lobby error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};