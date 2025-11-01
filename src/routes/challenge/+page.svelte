<script lang="ts">
	import { onMount } from 'svelte';
	import { Code2, Clock, Users, Trophy } from 'lucide-svelte';

	let challenges: any[] = [];
	let loading = true;
	let selectedDifficulty = 'all';
	let searchTerm = '';

	onMount(async () => {
		try {
			const response = await fetch('/api/challenges?limit=50');
			const data = await response.json();
			
			if (response.ok) {
				challenges = data.challenges || [];
			}
		} catch (error) {
			console.error('Failed to load challenges:', error);
		} finally {
			loading = false;
		}
	});

	$: filteredChallenges = challenges.filter(challenge => {
		const matchesDifficulty = selectedDifficulty === 'all' || challenge.difficulty === selectedDifficulty;
		const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
							  challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesDifficulty && matchesSearch;
	});

	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'easy': return 'bg-green-900/30 text-green-400 border-green-500/30';
			case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
			case 'hard': return 'bg-red-900/30 text-red-400 border-red-500/30';
			default: return 'bg-gray-900/30 text-gray-400 border-gray-500/30';
		}
	}
</script>

<svelte:head>
	<title>Challenges - CodeOut App</title>
</svelte:head>

<div class="min-h-screen bg-black">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-white mb-2">Coding Challenges</h1>
			<p class="text-gray-400">Sharpen your skills with our collection of coding challenges</p>
		</div>

		{#if loading}
			<div class="flex items-center justify-center h-64">
				<div class="text-center">
					<div class="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p class="text-gray-300">Loading challenges...</p>
				</div>
			</div>
		{:else}
			<!-- Filters -->
			<div class="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div class="flex flex-col sm:flex-row gap-4">
					<!-- Search -->
					<div class="relative">
						<input
							type="text"
							placeholder="Search challenges..."
							bind:value={searchTerm}
							class="w-full sm:w-64 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
						/>
					</div>
					
					<!-- Difficulty Filter -->
					<select 
						bind:value={selectedDifficulty}
						class="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
					>
						<option value="all">All Difficulties</option>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
				</div>
				
				<div class="text-sm text-gray-400">
					{filteredChallenges.length} challenges found
				</div>
			</div>

			<!-- Challenges Grid -->
			{#if filteredChallenges.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each filteredChallenges as challenge}
						<div class="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-colors group">
							<div class="flex items-start justify-between mb-4">
								<div class="flex-1">
									<h3 class="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
										{challenge.title}
									</h3>
									<p class="text-gray-400 text-sm line-clamp-2">
										{challenge.description}
									</p>
								</div>
								<span class="px-2 py-1 text-xs rounded-full border {getDifficultyColor(challenge.difficulty)} ml-3">
									{challenge.difficulty}
								</span>
							</div>
							
							<!-- Challenge Stats -->
							<div class="flex items-center gap-4 text-xs text-gray-400 mb-4">
								<div class="flex items-center gap-1">
									<Users class="h-3 w-3" />
									<span>234 solved</span>
								</div>
								<div class="flex items-center gap-1">
									<Trophy class="h-3 w-3" />
									<span>67% rate</span>
								</div>
							</div>
							
							<!-- Action Button -->
							<a
								href="/challenge/{challenge.id}"
								class="block w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-md transition-colors"
							>
								Solve Challenge
							</a>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center py-12">
					<div class="text-6xl mb-4">🔍</div>
					<h2 class="text-xl font-semibold text-white mb-2">No challenges found</h2>
					<p class="text-gray-400">Try adjusting your search or filter criteria</p>
				</div>
			{/if}
		{/if}
	</div>
</div>