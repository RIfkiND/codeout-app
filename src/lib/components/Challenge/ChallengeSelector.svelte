<script lang="ts">
 	import { ChevronRight } from 'lucide-svelte';

	interface ChallengeSelectorProps {
		challenges?: any[];
		selectedId?: string | null;
		onselect?: (event: CustomEvent<string>) => void;
	}

	let { 
		challenges = [],
		selectedId = null,
		onselect
	}: ChallengeSelectorProps = $props();

	let currentChallenge = $derived(challenges.find(c => c.id === selectedId));
</script>

<div class="flex items-center gap-2 text-white">
	<a 
		href="/challenge"
		class="hover:text-gray-300 transition-colors"
	>
		Challenges
	</a>
	{#if currentChallenge}
		<ChevronRight size={16} class="text-gray-400" />
		<span class="text-white font-medium">
			{currentChallenge.title}
		</span>
	{/if}
</div>