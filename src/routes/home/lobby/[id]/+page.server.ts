import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();

	// Get lobby details with participants
	const { data: lobby, error: lobbyError } = await locals.supabase
		.from('lobbies')
		.select(
			`
			*,
			users (name, email),
			lobby_users (
				joined_at,
				users (id, name, email)
			)
		`
		)
		.eq('id', params.id)
		.single();

	if (lobbyError || !lobby) {
		throw error(404, 'Lobby not found');
	}

	// Get submissions for this lobby if it's running or finished
	let submissions: unknown[] = [];
	const lobbyData = lobby as { status: string };
	if (lobby && (lobbyData.status === 'running' || lobbyData.status === 'finished')) {
		const { data: submissionsData } = await locals.supabase
			.from('submissions')
			.select(
				`
				*,
				users (name, email),
				challenges (title)
			`
			)
			.eq('lobby_id', params.id)
			.order('submitted_at', { ascending: false });

		submissions = submissionsData || [];
	}

	return {
		lobby,
		submissions,
		session,
		user: session?.user || null
	};
}) satisfies PageServerLoad;
