import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	
	if (!session) {
		throw error(401, 'Authentication required');
	}

	const lobbyId = params.id;

	try {
		// Get lobby details with participants and challenges
		const { data: lobbyData, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select(`
				*,
				created_by_user:users!lobbies_created_by_fkey(id, name, email),
				lobby_participants(
					users(id, name, email)
				),
				lobby_challenges(
					id,
					challenge_order,
					status,
					challenges(
						id,
						title,
						description,
						difficulty,
						input_example,
						output_example,
						testcases
					)
				)
			`)
			.eq('id', lobbyId)
			.single();

		if (lobbyError || !lobbyData) {
			console.error('Lobby fetch error:', lobbyError);
			throw error(404, 'Lobby not found');
		}

		// Check if user is a participant
		const isParticipant = lobbyData.lobby_participants?.some(
			(participant: { users: { id: string } }) => participant.users.id === session.user.id
		);

		const isOwner = lobbyData.created_by === session.user.id;

		if (!isParticipant && !isOwner) {
			throw error(403, 'You are not a participant in this lobby');
		}

		// Get current challenge submissions for this lobby
		const { data: submissions } = await locals.supabase
			.from('submissions')
			.select(`
				*,
				users(id, name, email)
			`)
			.eq('lobby_id', lobbyId)
			.order('submitted_at', { ascending: false });

		// Get lobby standings
		const { data: standings } = await locals.supabase
			.from('lobby_standings')
			.select(`
				*,
				users(id, name, email)
			`)
			.eq('lobby_id', lobbyId)
			.order('final_rank', { ascending: true });

		return {
			lobby: lobbyData,
			submissions: submissions || [],
			standings: standings || [],
			isOwner,
			user: {
				id: session.user.id,
				email: session.user.email,
				name: session.user.user_metadata?.name || session.user.email
			}
		};
	} catch (err) {
		console.error('Lobby page load error:', err);
		if (err instanceof Error && err.message.includes('404')) {
			throw error(404, 'Lobby not found');
		}
		if (err instanceof Error && err.message.includes('403')) {
			throw error(403, 'Access denied');
		}
		throw error(500, 'Failed to load lobby data');
	}
};