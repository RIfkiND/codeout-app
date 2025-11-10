<script lang="ts">
 	import { ChevronRight } from 'lucide-svelte';

	export let challenges: any[] = [];
	export let selectedId: string | null = null;

	$: currentChallenge = challenges.find(c => c.id === selectedId);
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