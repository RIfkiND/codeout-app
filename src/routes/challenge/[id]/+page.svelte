<script lang="ts">
	import ChallengeLayout from '$lib/components/Challenge/ChallengeLayout.svelte';
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	
	let challengeId = $page.params.id;
	let lobbyId = $page.url.searchParams.get('lobbyId');
	let challenge: any = $state(null);
	let lobby: any = $state(null);
	let timeRemaining = $state(0);
	let loading = $state(true);
	let error = $state('');
	let timerInterval: NodeJS.Timeout | null = null;

	// Load challenge data on mount
	onMount(async () => {
		if (!challengeId) {
			error = 'No challenge ID provided';
			loading = false;
			return;
		}

		try {
			console.log('Loading challenge:', challengeId);
			
			// Load challenge data
			const response = await fetch(`/api/challenges/${challengeId}`);
			const result = await response.json();
			
			console.log('Challenge API response:', result);
			
			if (!response.ok) {
				throw new Error(result.error || 'Failed to load challenge');
			}

			if (!result.challenge) {
				throw new Error('Challenge not found in response');
			}

			challenge = result.challenge;
			console.log('Challenge loaded successfully:', challenge);
			
			// If this is a lobby-based challenge, load lobby data and set up timer
			if (lobbyId) {
				await loadLobbyData(lobbyId);
			}
			
		} catch (err) {
			console.error('Error loading challenge:', err);
			error = err instanceof Error ? err.message : 'Failed to load challenge';
		} finally {
			loading = false;
		}
	});

	async function loadLobbyData(lobbyId: string) {
		try {
			const response = await fetch(`/api/lobbies/${lobbyId}`);
			const result = await response.json();
			
			if (response.ok && result.lobby) {
				lobby = result.lobby;
				
				// Calculate time remaining if lobby is running
				if (lobby.status === 'running' && lobby.start_time && lobby.time_limit_minutes) {
					const startTime = new Date(lobby.start_time).getTime();
					const timeLimit = lobby.time_limit_minutes * 60 * 1000; // Convert to milliseconds
					const now = Date.now();
					const elapsed = now - startTime;
					timeRemaining = Math.max(0, timeLimit - elapsed);
					
					// Set up timer if there's time remaining
					if (timeRemaining > 0) {
						startTimer();
					}
				}
			}
		} catch (err) {
			console.error('Error loading lobby data:', err);
		}
	}

	function startTimer() {
		if (timerInterval) clearInterval(timerInterval);
		
		timerInterval = setInterval(() => {
			timeRemaining = Math.max(0, timeRemaining - 1000);
			
			if (timeRemaining <= 0) {
				clearInterval(timerInterval!);
				timerInterval = null;
				handleTimeUp();
			}
		}, 1000);
	}

	function handleTimeUp() {
		alert('⏰ Time is up! The lobby session has ended.');
		// You could auto-submit the current code or redirect back to lobby
		window.location.href = `/home/lobby/${lobbyId}`;
	}

	function formatTime(milliseconds: number): string {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	onDestroy(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
		}
	});
</script>

<svelte:head>
	<title>{challenge?.title ? `${challenge.title} - CodeOut Challenge` : 'Challenge - CodeOut App'}</title>
	<meta name="description" content={challenge?.description || 'Solve coding challenges and improve your skills'} />
</svelte:head>

{#if loading}
	<div class="h-screen bg-neutral-950 flex items-center justify-center">
		<div class="text-center">
			<div class="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
			<p class="text-lg text-neutral-300">Loading challenge...</p>
			<p class="text-sm text-neutral-500">Preparing your coding adventure</p>
		</div>
	</div>
{:else if error}
	<div class="h-screen bg-neutral-950 flex items-center justify-center">
		<div class="text-center">
			<div class="text-6xl mb-4">⚠️</div>
			<h1 class="text-2xl font-bold text-neutral-100 mb-2">Error Loading Challenge</h1>
			<p class="text-neutral-400 mb-6">{error}</p>
			<div class="space-x-4">
				<button 
					class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
					onclick={() => window.location.reload()}
				>
					Try Again
				</button>
				<a 
					href="/challenge"
					class="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors"
				>
					Browse Challenges
				</a>
			</div>
		</div>
	</div>
{:else if challenge}
	<!-- Multiplayer Timer Banner (only show if in lobby mode with active timer) -->
	{#if lobbyId && lobby && timeRemaining > 0}
		<div class="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-3 text-center font-medium">
			<div class="flex items-center justify-center gap-4">
				<span class="text-sm">🏆 Lobby Challenge: {lobby.name}</span>
				<div class="flex items-center gap-2">
					<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
					</svg>
					<span class="text-lg font-bold font-mono">{formatTime(timeRemaining)}</span>
					<span class="text-sm opacity-90">remaining</span>
				</div>
			</div>
		</div>
	{/if}
	<ChallengeLayout {challengeId} {challenge} {lobbyId} {lobby} {timeRemaining} editable={false} />
{:else}
	<div class="h-screen bg-neutral-950 flex items-center justify-center">
		<div class="text-center">
			<div class="text-6xl mb-4">🔍</div>
			<h1 class="text-2xl font-bold text-neutral-100 mb-2">Challenge Not Found</h1>
			<p class="text-neutral-400 mb-6">The challenge you're looking for doesn't exist.</p>
			<a 
				href="/challenge"
				class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
			>
				Browse Challenges
			</a>
		</div>
	</div>
{/if}