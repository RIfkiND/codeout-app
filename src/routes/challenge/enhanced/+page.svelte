<script lang="ts">
	import ChallengeLayout from '$lib/components/Challenge/ChallengeLayout.svelte';
	import { onMount } from 'svelte';

	let challengeId: string | null = null;
	let challenges: any[] = [];
	let loading = true;

	onMount(async () => {
		try {
			const response = await fetch('/api/challenges?limit=5');
			const data = await response.json();
			
			if (response.ok && data.challenges?.length > 0) {
				challenges = data.challenges;
				// Load the first challenge by default
				challengeId = challenges[0].id;
			}
		} catch (error) {
			console.error('Failed to load challenges:', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>CodeOut - Enhanced Challenge Interface</title>
</svelte:head>

{#if loading}
	<div class="h-screen bg-gray-900 flex items-center justify-center">
		<div class="text-center">
			<div class="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
			<p class="text-gray-300">Loading challenges...</p>
		</div>
	</div>
{:else}
	<ChallengeLayout {challengeId} editable={false} />
{/if}