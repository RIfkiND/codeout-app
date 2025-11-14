import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { id: lobbyId } = params;

		// Simple query without complex RLS relationships
		const { data: participants, error } = await locals.supabase
			.from('lobby_users')
			.select(`
				user_id,
				joined_at,
				is_ready,
				is_creator
			`)
			.eq('lobby_id', lobbyId);

		if (error) {
			console.error('Participants fetch error:', error);
			return json({ error: 'Failed to fetch participants' }, { status: 500 });
		}

		return json({ participants: participants || [] });
	} catch (error) {
		console.error('Participants API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to fetch participants'
		}, { status: 500 });
	}
};