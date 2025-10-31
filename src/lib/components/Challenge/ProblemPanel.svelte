<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ChallengeDescription from './ChallengeDescription.svelte';
	import ChallengeInfo from './ChallengeInfo.svelte';
	import { onMount } from 'svelte';
	
	export let challengeId: string | null = null;
	export let editable: boolean = false;

	let challenge: any = null;
	let loading = false;
	let error = '';

	// Default challenge for demo/fallback
	const defaultChallenge = {
		id: 'demo',
		title: 'Two Sum',
		difficulty: 'easy',
		description: `<div class="prose prose-invert max-w-none">
			<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
			<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
			<p>You can return the answer in any order.</p>
		</div>`,
		input_example: 'nums = [2,7,11,15], target = 9',
		output_example: '[0,1]',
		testcases: [
			{"input": {"nums": [2,7,11,15], "target": 9}, "output": [0,1]},
			{"input": {"nums": [3,2,4], "target": 6}, "output": [1,2]},
			{"input": {"nums": [3,3], "target": 6}, "output": [0,1]}
		],
		max_score: 100,
		time_limit: 300,
		memory_limit: 128,
		challenge_categories: [
			{ categories: { id: '1', name: 'Array' } },
			{ categories: { id: '2', name: 'Hash Table' } }
		]
	};

	onMount(() => {
		if (challengeId) {
			loadChallenge();
		} else {
			challenge = defaultChallenge;
		}
	});

	async function loadChallenge() {
		if (!challengeId) return;
		loading = true;
		error = '';
		
		try {
			const response = await fetch(`/api/challenges/${challengeId}`);
			const data = await response.json();
			
			if (!response.ok) {
				throw new Error(data.error || 'Failed to load challenge');
			}
			
			challenge = data.challenge;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load challenge';
			console.error('Error loading challenge:', err);
		} finally {
			loading = false;
		}
	}

	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'easy': return 'bg-green-900/30 text-green-400 border-green-500/30';
			case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
			case 'hard': return 'bg-red-900/30 text-red-400 border-red-500/30';
			default: return 'bg-gray-900/30 text-gray-400 border-gray-500/30';
		}
	}

	function handleError(event: CustomEvent<string>) {
		error = event.detail;
	}
</script>

<div class="bg-gray-800 border-r border-gray-700 h-full overflow-y-auto">
	{#if loading}
		<div class="flex items-center justify-center h-full">
			<div class="text-center">
				<div class="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
				<p class="text-gray-300">Loading challenge...</p>
			</div>
		</div>
	{:else if error}
		<div class="p-6">
			<div class="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
				<p class="text-red-400">Error: {error}</p>
				<button 
					on:click={loadChallenge}
					class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
				>
					Retry
				</button>
			</div>
		</div>
	{:else if challenge}
		<div class="p-6">
			<!-- Header -->
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-xl font-bold text-white">{challenge.title}</h1>
				<div class="flex items-center gap-2">
					<Badge variant="secondary" class={getDifficultyColor(challenge.difficulty)}>
						{challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
					</Badge>
					<span class="text-sm text-gray-400">
						{challenge.max_score} pts
					</span>
				</div>
			</div>

			<!-- Categories -->
			{#if challenge.challenge_categories?.length}
				<div class="mb-4 flex flex-wrap gap-2">
					{#each challenge.challenge_categories as category}
						<Badge variant="outline" class="text-xs text-gray-300 border-gray-600">
							{category.categories.name}
						</Badge>
					{/each}
				</div>
			{/if}

			<!-- Error Display -->
			{#if error}
				<div class="mb-4 bg-red-900/20 border border-red-600/30 rounded-lg p-3">
					<p class="text-red-400 text-sm">{error}</p>
				</div>
			{/if}

			<!-- Challenge Content -->
			<ChallengeDescription 
				{challenge} 
				{editable} 
				{challengeId}
				on:error={handleError}
			/>
			
			<ChallengeInfo {challenge} />
		</div>
	{:else}
		<div class="flex items-center justify-center h-full">
			<p class="text-gray-400">No challenge selected</p>
		</div>
	{/if}
</div>