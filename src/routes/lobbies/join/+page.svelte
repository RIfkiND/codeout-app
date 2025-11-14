<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { showError, showSuccess } from '$lib/stores/toast';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Users, Gamepad2, Clock, Trophy } from 'lucide-svelte';

	let lobbyCode = $state('');
	let isJoining = $state(false);
	let foundLobby: any = $state(null);
	let isSearching = $state(false);

	onMount(() => {
		// Check if there's a code in URL params
		const urlCode = $page.url.searchParams.get('code');
		if (urlCode) {
			lobbyCode = urlCode;
			searchLobby();
		}
	});

	async function searchLobby() {
		if (!lobbyCode.trim()) {
			showError('Invalid Code', 'Please enter a lobby code');
			return;
		}

		isSearching = true;
		foundLobby = null;

		try {
			const response = await fetch('/api/lobbies/join', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					lobby_code: lobbyCode.trim().toUpperCase(),
					preview: true // Just preview, don't actually join yet
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				foundLobby = result.lobby;
			} else {
				const error = await response.json();
				showError('Lobby Not Found', error.error || 'Invalid lobby code');
			}
		} catch (error) {
			console.error('Search error:', error);
			showError('Search Failed', 'Unable to search for lobby');
		} finally {
			isSearching = false;
		}
	}

	async function joinLobby() {
		if (!foundLobby) return;

		isJoining = true;

		try {
			const response = await fetch('/api/lobbies/join', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lobby_code: lobbyCode.trim().toUpperCase() })
			});

			if (response.ok) {
				const result = await response.json();
				showSuccess('Joined Successfully!', result.message);
				goto(`/lobbies/${foundLobby.id}`);
			} else {
				const error = await response.json();
				showError('Join Failed', error.error || 'Unable to join lobby');
			}
		} catch (error) {
			console.error('Join error:', error);
			showError('Join Failed', 'Unable to join lobby');
		} finally {
			isJoining = false;
		}
	}

	function formatParticipants(current: number, max: number): string {
		return `${current || 0}/${max}`;
	}

	function getDifficultyColor(difficulty: string): string {
		switch (difficulty?.toLowerCase()) {
			case 'easy': return 'text-green-400 bg-green-400/10';
			case 'medium': return 'text-yellow-400 bg-yellow-400/10';
			case 'hard': return 'text-red-400 bg-red-400/10';
			default: return 'text-gray-400 bg-gray-400/10';
		}
	}

	function handleCodeInput(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			searchLobby();
		}
	}
</script>

<svelte:head>
	<title>Join Lobby - CodeOut</title>
	<meta name="description" content="Join a coding lobby using an invite code" />
</svelte:head>

<div class="min-h-screen bg-neutral-950 text-white">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
				<Gamepad2 class="h-10 w-10 text-emerald-400" />
				Join Lobby
			</h1>
			<p class="text-neutral-400 text-lg">
				Enter the lobby code to join a coding competition
			</p>
		</div>

		<!-- Join Form -->
		<div class="max-w-md mx-auto mb-8">
			<Card class="bg-neutral-900 border-neutral-800 p-6">
				<div class="space-y-4">
					<div>
						<label for="lobbyCode" class="block text-sm font-medium mb-2">
							Lobby Code
						</label>
						<Input
							id="lobbyCode"
							bind:value={lobbyCode}
							placeholder="Enter 6-digit code (e.g. ABC123)"
							class="text-center text-lg font-mono tracking-wider uppercase bg-neutral-800 border-neutral-700"
							maxlength={6}
							onkeydown={handleCodeInput}
							style="cursor: text"
						/>
						<p class="text-xs text-neutral-500 mt-1">
							Codes are not case-sensitive
						</p>
					</div>
					
					<Button
						onclick={searchLobby}
						disabled={!lobbyCode.trim() || isSearching}
						class="w-full bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
					>
						{isSearching ? 'Searching...' : 'Find Lobby'}
					</Button>
				</div>
			</Card>
		</div>

		<!-- Found Lobby -->
		{#if foundLobby}
			<div class="max-w-2xl mx-auto">
				<Card class="bg-neutral-900 border-neutral-800 p-6">
					<div class="space-y-6">
						<!-- Lobby Info -->
						<div class="text-center">
							<h2 class="text-2xl font-bold mb-2">{foundLobby.name}</h2>
							{#if foundLobby.description}
								<p class="text-neutral-400">{foundLobby.description}</p>
							{/if}
						</div>

						<!-- Lobby Details Grid -->
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div class="text-center p-3 bg-neutral-800/50 rounded-lg">
								<Users class="h-5 w-5 mx-auto mb-1 text-blue-400" />
								<div class="text-sm text-neutral-400">Participants</div>
								<div class="font-semibold">
									{formatParticipants(foundLobby.current_participants, foundLobby.max_participants)}
								</div>
							</div>

							<div class="text-center p-3 bg-neutral-800/50 rounded-lg">
								<Clock class="h-5 w-5 mx-auto mb-1 text-yellow-400" />
								<div class="text-sm text-neutral-400">Time Limit</div>
								<div class="font-semibold">{foundLobby.time_limit_minutes}m</div>
							</div>

							<div class="text-center p-3 bg-neutral-800/50 rounded-lg">
								<Trophy class="h-5 w-5 mx-auto mb-1 text-emerald-400" />
								<div class="text-sm text-neutral-400">Status</div>
								<div class="font-semibold capitalize">{foundLobby.status}</div>
							</div>

							<div class="text-center p-3 bg-neutral-800/50 rounded-lg">
								<Gamepad2 class="h-5 w-5 mx-auto mb-1 text-purple-400" />
								<div class="text-sm text-neutral-400">Mode</div>
								<div class="font-semibold capitalize">{foundLobby.challenge_mode || 'Single'}</div>
							</div>
						</div>

						<!-- Current Challenge -->
						{#if foundLobby.current_challenge}
							<div class="bg-neutral-800/30 rounded-lg p-4">
								<h3 class="font-semibold mb-2">Current Challenge</h3>
								<div class="flex items-center justify-between">
									<div>
										<div class="font-medium">{foundLobby.current_challenge.title}</div>
										<div class="text-sm text-neutral-400">
											{foundLobby.current_challenge.description}
										</div>
									</div>
									<div class="px-3 py-1 rounded-full text-xs font-medium {getDifficultyColor(foundLobby.current_challenge.difficulty)}">
										{foundLobby.current_challenge.difficulty}
									</div>
								</div>
							</div>
						{/if}

						<!-- Creator Info -->
						<div class="flex items-center justify-center text-sm text-neutral-400">
							Created by <span class="font-medium text-white ml-1">{foundLobby.creator?.name}</span>
						</div>

						<!-- Join Button -->
						<div class="text-center">
							{#if foundLobby.status === 'waiting'}
								{#if foundLobby.current_participants >= foundLobby.max_participants}
									<Button disabled class="w-full max-w-xs cursor-not-allowed">
										Lobby Full
									</Button>
								{:else}
									<Button
										onclick={joinLobby}
										disabled={isJoining}
										class="w-full max-w-xs bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
									>
										{isJoining ? 'Joining...' : 'Join Lobby'}
									</Button>
								{/if}
							{:else if foundLobby.status === 'in_progress'}
								<Button disabled class="w-full max-w-xs cursor-not-allowed">
									Game in Progress
								</Button>
							{:else}
								<Button disabled class="w-full max-w-xs cursor-not-allowed">
									Game Ended
								</Button>
							{/if}
						</div>
					</div>
				</Card>
			</div>
		{/if}

		<!-- Back Button -->
		<div class="text-center mt-8">
			<Button
				variant="outline"
				onclick={() => goto('/lobbies')}
				class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
			>
				Back to Lobbies
			</Button>
		</div>
	</div>
</div>