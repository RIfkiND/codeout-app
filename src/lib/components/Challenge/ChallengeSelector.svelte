<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let challenges: any[] = [];
	export let loading = false;
	export let selectedId: string | null = null;

	const dispatch = createEventDispatcher<{
		select: string;
	}>();

	let showDropdown = false;

	function selectChallenge(id: string) {
		selectedId = id;
		showDropdown = false;
		dispatch('select', id);
	}

	function handleClickOutside(event: MouseEvent) {
		if (showDropdown && !(event.target as Element)?.closest('.challenge-selector')) {
			showDropdown = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="relative challenge-selector">
	<button 
		on:click={() => showDropdown = !showDropdown}
		class="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
	>
		<span>Challenge</span>
		<ChevronDown size={16} />
	</button>
	
	{#if showDropdown}
		<div class="absolute top-full left-0 mt-1 w-80 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-50">
			<div class="p-3 border-b border-gray-600">
				<input 
					type="search" 
					placeholder="Search challenges..." 
					class="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-md text-sm"
				/>
			</div>
			
			<div class="max-h-64 overflow-y-auto">
				{#if loading}
					<div class="p-4 text-center text-gray-400">
						<div class="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
						Loading...
					</div>
				{:else if challenges.length === 0}
					<div class="p-4 text-center text-gray-400">
						No challenges found
					</div>
				{:else}
					{#each challenges as challenge}
						<button 
							on:click={() => selectChallenge(challenge.id)}
							class="w-full text-left px-4 py-3 hover:bg-gray-600 transition-colors border-b border-gray-600 last:border-b-0"
						>
							<div class="flex items-center justify-between">
								<div>
									<div class="text-white font-medium">{challenge.title}</div>
									<div class="text-sm text-gray-400 capitalize">
										{challenge.difficulty} • {challenge.max_score} pts
									</div>
								</div>
								<div class="text-xs px-2 py-1 rounded-full {challenge.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' : challenge.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-red-900/30 text-red-400'}">
									{challenge.difficulty}
								</div>
							</div>
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>