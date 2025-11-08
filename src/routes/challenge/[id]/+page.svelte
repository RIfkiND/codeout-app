<script lang="ts">
	import ChallengeLayout from '$lib/components/Challenge/ChallengeLayout.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	
	let challengeId = $page.params.id;
	let challenge: any = $state(null);
	let loading = $state(true);
	let error = $state('');

	// Load challenge data on mount
	onMount(async () => {
		if (!challengeId) {
			error = 'No challenge ID provided';
			loading = false;
			return;
		}

		try {
			console.log('Loading challenge:', challengeId);
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
			
		} catch (err) {
			console.error('Error loading challenge:', err);
			error = err instanceof Error ? err.message : 'Failed to load challenge';
		} finally {
			loading = false;
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
	<ChallengeLayout {challengeId} {challenge} editable={false} />
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