import type { PageServerLoad } from './$types';

interface LobbyUser {
	joined_at: string;
	users: {
		id: string;
		name?: string;
		email?: string;
	};
}

interface LobbyCreator {
	id: string;
	name?: string;
	email?: string;
}

interface LobbyData {
	id: string;
	name: string;
	status: string;
	lobby_users?: LobbyUser[];
	users?: LobbyCreator;
	[key: string]: unknown;
}

export const load = (async ({ locals }) => {
	try {
		// Get authenticated user (secure method)
		const { data: { user } } = await locals.supabase.auth.getUser();

		// Fetch lobbies with user count and creator info
		const { data: lobbies, error } = await locals.supabase
			.from('lobbies')
			.select(
				`
				*,
				lobby_users (
					joined_at,
					users (
						id,
						name,
						email
					)
				),
				users:created_by (
					id,
					name,
					email
				)
			`
			)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error loading lobbies:', error);
			return {
				lobbies: [],
				stats: {
					totalLobbies: 0,
					activeLobbies: 0,
					totalParticipants: 0
				}
			};
		}

		// Calculate stats
		const typedLobbies = lobbies as LobbyData[];
		const stats = {
			totalLobbies: typedLobbies?.length || 0,
			activeLobbies:
				typedLobbies?.filter((l) => l.status === 'active' || l.status === 'waiting').length || 0,
			totalParticipants:
				typedLobbies?.reduce((sum, l) => sum + (l.lobby_users?.length || 0), 0) || 0
		};

		return {
			lobbies: typedLobbies || [],
			stats,
			user: user || null
		};
	} catch (error) {
		console.error('Failed to load lobbies:', error);
		return {
			lobbies: [],
			stats: {
				totalLobbies: 0,
				activeLobbies: 0,
				totalParticipants: 0
			},
			user: null
		};
	}
}) satisfies PageServerLoad;
