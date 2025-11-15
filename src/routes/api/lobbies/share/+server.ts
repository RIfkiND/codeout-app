import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function generateLobbyCode(): string {
	// Generate a 6-character alphanumeric code (like Kahoot/Quizizz)
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars like 0, O, I, 1
	let code = '';
	for (let i = 0; i < 6; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return code;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	
	if (!code) {
		return json({ error: 'Lobby code is required' }, { status: 400 });
	}

	try {
		const { data: lobby, error } = await locals.supabase
			.from('lobbies')
			.select(`
				*,
				creator:users!lobbies_created_by_fkey (
					id,
					name
				),
				current_challenge:challenges!lobbies_challenge_id_fkey (
					id,
					title,
					description,
					difficulty
				)
			`)
			.eq('lobby_code', code.toUpperCase())
			.single();

		if (error || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		return json({ lobby });
	} catch (error) {
		console.error('Share API error:', error);
		return json({ error: 'Failed to fetch lobby' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { lobbyId } = await request.json();
		
		if (!lobbyId) {
			return json({ error: 'Lobby ID is required' }, { status: 400 });
		}

		// Check if lobby exists and user owns it
		const { data: lobby, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select('id, created_by, lobby_code')
			.eq('id', lobbyId)
			.single();

		if (lobbyError || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		if (lobby.created_by !== user.id) {
			return json({ error: 'Only lobby creator can generate share codes' }, { status: 403 });
		}

		// Generate new code if doesn't exist
		let lobbyCode = lobby.lobby_code;
		
		if (!lobbyCode) {
			// Generate unique code
			let attempts = 0;
			while (attempts < 10) {
				lobbyCode = generateLobbyCode();
				
				// Check if code already exists
				const { data: existingLobby } = await locals.supabase
					.from('lobbies')
					.select('id')
					.eq('lobby_code', lobbyCode)
					.single();

				if (!existingLobby) break;
				
				attempts++;
			}

			if (attempts >= 10) {
				return json({ error: 'Failed to generate unique code' }, { status: 500 });
			}

			// Update lobby with new code
			const { error: updateError } = await locals.supabase
				.from('lobbies')
				.update({ lobby_code: lobbyCode })
				.eq('id', lobbyId);

			if (updateError) {
				console.error('Failed to update lobby code:', updateError);
				return json({ error: 'Failed to generate share code' }, { status: 500 });
			}
		}

		const shareUrl = `${url.origin}/lobbies/join?code=${lobbyCode}`;

		return json({ 
			code: lobbyCode,
			shareUrl,
			message: 'Share code generated successfully'
		});
	} catch (error) {
		console.error('Share generation error:', error);
		return json({ error: 'Failed to generate share code' }, { status: 500 });
	}
};