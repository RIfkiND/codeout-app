/* eslint-disable @typescript-eslint/no-explicit-any */
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface TestCaseInput {
	input: string;
	expected_output: string;
	explanation?: string;
}

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const status = url.searchParams.get('status') as 'waiting' | 'running' | 'finished' | null;

		const offset = (page - 1) * limit;

		let query = locals.supabase
			.from('lobbies')
			.select(`
				*,
				creator:users!lobbies_created_by_fkey (
					id,
					name
				),
				lobby_users (
					joined_at,
					users (
						id,
						name,
						email
					)
				),
				current_challenge:challenges!lobbies_challenge_id_fkey (
					id,
					title,
					description,
					difficulty
				)
			`)
			.range(offset, offset + limit - 1)
			.order('created_at', { ascending: false });

		if (status) {
			query = query.eq('status', status);
		}

		const { data: lobbies, error } = await query;

		if (error) {
			console.error('Lobbies fetch error:', error);
			return json({ error: 'Failed to fetch lobbies' }, { status: 500 });
		}

		// Return lobbies without participants to avoid RLS issues
		// Frontend will fetch participants separately if needed
		const lobbiesWithParticipants = lobbies as any[];

		// Get total count for pagination
		let countQuery = locals.supabase
			.from('lobbies')
			.select('*', { count: 'exact', head: true });

		if (status) {
			countQuery = countQuery.eq('status', status);
		}

		const { count, error: countError } = await countQuery;

		if (countError) {
			console.error('Count error:', countError);
		}

		return json({
			lobbies: lobbiesWithParticipants,
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / limit)
			}
		});
	} catch (error) {
		console.error('Lobbies API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to fetch lobbies'
		}, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const requestData = await request.json();
		const { 
			// Lobby data
			name, 
			description,
			max_participants = 50,
			time_limit_minutes = 30,
			is_private = false,
			challenge_mode = 'single',
			challenge_ids = [],
			// Challenge data
			customChallenge
		} = requestData;

		if (!name || name.trim().length === 0) {
			return json({ error: 'Lobby name is required' }, { status: 400 });
		}

		if (max_participants < 2 || max_participants > 20) {
			return json({ error: 'Max participants must be between 2 and 20' }, { status: 400 });
		}

		if (time_limit_minutes < 5 || time_limit_minutes > 180) {
			return json({ error: 'Time limit must be between 5 and 180 minutes' }, { status: 400 });
		}

		let challengeId: string | null = null;

		// Validate multi-challenge mode
		if (challenge_mode === 'multi') {
			if (!challenge_ids || challenge_ids.length === 0) {
				return json({ error: 'At least one challenge must be selected for multi-challenge mode' }, { status: 400 });
			}

			// Verify all challenge IDs exist
			const { data: challenges, error: challengeError } = await locals.supabase
				.from('challenges')
				.select('id')
				.in('id', challenge_ids);

			if (challengeError || !challenges || challenges.length !== challenge_ids.length) {
				return json({ error: 'One or more selected challenges are invalid' }, { status: 400 });
			}
		}

		// Create custom challenge if requested
		if (customChallenge) {
			const {
				title,
				description: challengeDesc,
				difficulty = 'medium',
				time_limit: timeLimit = 30,
				test_cases = []
			} = customChallenge;

			if (!title || !challengeDesc) {
				return json({ error: 'Challenge title and description are required' }, { status: 400 });
			}

			if (!test_cases || test_cases.length === 0) {
				return json({ error: 'At least one test case is required for custom challenges' }, { status: 400 });
			}

			// Validate test cases
			for (const testCase of test_cases) {
				if (!testCase.input || !testCase.expected_output) {
					return json({ error: 'All test cases must have input and expected output' }, { status: 400 });
				}
			}

			// Format test cases for the JSONB field
			const formattedTestCases = test_cases.map((testCase: TestCaseInput, index: number) => ({
				input: testCase.input,
				expected_output: testCase.expected_output,
				explanation: testCase.explanation || null,
				is_hidden: false,
				order_index: index
			}));

			// Create the challenge
			const { data: challenge, error: challengeError } = await locals.supabase
				.from('challenges')
				.insert({
					title: title.trim(),
					description: challengeDesc.trim(),
					difficulty,
					time_limit: timeLimit,
					created_by: user.id,
					is_global: false, // This is a lobby-specific challenge
					testcases: formattedTestCases,
					max_score: 100,
					memory_limit: 128,
					input_example: test_cases[0]?.input || '',
					output_example: test_cases[0]?.expected_output || ''
				} as any)
				.select()
				.single();

			if (challengeError) {
				console.error('Challenge creation error:', challengeError);
				return json({ error: 'Failed to create custom challenge' }, { status: 500 });
			}

			challengeId = (challenge as any).id;
		}

		// Generate lobby code
		const { data: codeResult, error: codeError } = await locals.supabase.rpc('generate_lobby_code');
		if (codeError) {
			console.error('Failed to generate lobby code:', codeError);
			return json({ error: 'Failed to generate lobby code' }, { status: 500 });
		}

		// Create the lobby
		const { data: lobby, error } = await locals.supabase
			.from('lobbies')
			.insert({
				name: name.trim(),
				description: description?.trim() || null,
				max_participants,
				time_limit_minutes,
				is_private,
				created_by: user.id,
				status: 'waiting',
				challenge_mode,
				challenge_id: challengeId, // Link to custom challenge if created
				lobby_code: codeResult as string
			} as any)
			.select(`
				*,
				creator:users!lobbies_created_by_fkey (
					id,
					name,
					user_profiles (
						avatar_url
					)
				),
				current_challenge:challenges!lobbies_challenge_id_fkey (
					id,
					title,
					description,
					difficulty
				)
			`)
			.single();

		if (error) {
			console.error('Lobby creation error:', error);
			
			// Clean up challenge if lobby creation fails
			if (challengeId) {
				await locals.supabase
					.from('challenges')
					.delete()
					.eq('id', challengeId);
			}
			
			return json({ error: 'Failed to create lobby' }, { status: 500 });
		}

		const lobbyId = (lobby as any).id;

		// Handle multi-challenge setup
		if (challenge_mode === 'multi' && challenge_ids.length > 0) {
			// Insert lobby challenges in order
			const lobbyChallengesToInsert = challenge_ids.map((challengeId: string, index: number) => ({
				lobby_id: lobbyId,
				challenge_id: challengeId,
				challenge_order: index + 1,
				is_active: index === 0, // First challenge is active
				status: index === 0 ? 'pending' : 'waiting'
			}));

			const { error: lobbyChallengesError } = await locals.supabase
				.from('lobby_challenges')
				.insert(lobbyChallengesToInsert as any);

			if (lobbyChallengesError) {
				console.error('Multi-challenge setup error:', lobbyChallengesError);
				
				// Clean up lobby and challenge if setup fails
				await locals.supabase.from('lobbies').delete().eq('id', lobbyId);
				if (challengeId) {
					await locals.supabase.from('challenges').delete().eq('id', challengeId);
				}
				
				return json({ error: 'Failed to setup multi-challenge lobby' }, { status: 500 });
			}
		}

		// SUCCESS: Lobby created successfully
		console.log(`Lobby ${lobbyId} created successfully by user ${user.id}`);

		return json({ 
			lobby,
			message: 'Lobby created successfully'
		});
	} catch (error) {
		console.error('Lobby creation API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to create lobby'
		}, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	try {
		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (authError || !user) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const { lobbyId } = await request.json();

		if (!lobbyId) {
			return json({ error: 'Lobby ID is required' }, { status: 400 });
		}

		// Check if user is the lobby creator
		const { data: lobbyData, error: lobbyError } = await locals.supabase
			.from('lobbies')
			.select('id, created_by, name')
			.eq('id', lobbyId)
			.single();

		const lobby = lobbyData as { id: string; created_by: string; name: string } | null;

		if (lobbyError || !lobby) {
			return json({ error: 'Lobby not found' }, { status: 404 });
		}

		if (lobby.created_by !== user.id) {
			return json({ error: 'Only the lobby creator can delete this lobby' }, { status: 403 });
		}

		// Delete the lobby (CASCADE should handle related data)
		const { error: deleteError } = await locals.supabase
			.from('lobbies')
			.delete()
			.eq('id', lobbyId)
			.eq('created_by', user.id); // Double check ownership

		if (deleteError) {
			console.error('Lobby deletion error:', deleteError);
			return json({ error: 'Failed to delete lobby' }, { status: 500 });
		}

		console.log(`Lobby ${lobbyId} (${lobby.name}) deleted by user ${user.id}`);

		return json({ 
			message: 'Lobby deleted successfully',
			deletedLobby: {
				id: lobbyId,
				name: lobby.name
			}
		});
	} catch (error) {
		console.error('Lobby deletion API error:', error);
		return json({
			error: error instanceof Error ? error.message : 'Failed to delete lobby'
		}, { status: 500 });
	}
};