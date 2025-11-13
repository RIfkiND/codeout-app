<script lang="ts">
	import { Target } from 'lucide-svelte';

	interface HeroProps {
		totalChallenges: number;
	}

	let { totalChallenges = 0 }: HeroProps = $props();
</script>

<!-- Hero Header -->
<div class="bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-neutral-800">
	<div class="max-w-7xl mx-auto px-4 py-8">
		<div class="flex items-center justify-between">
			<div>
				<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
					<Target class="w-4 h-4 text-emerald-400" />
					<span class="text-sm font-medium text-emerald-300">Practice & Improve</span>
				</div>
				<h1 class="text-3xl md:text-4xl font-bold mb-2">
					Coding <span class="text-emerald-400">Challenges</span>
				</h1>
				<p class="text-neutral-300 max-w-2xl">
					Sharpen your programming skills with our curated collection of coding challenges.
				</p>
			</div>
			<div class="hidden md:flex items-center gap-4">
				<div class="text-right">
					<div class="text-2xl font-bold text-emerald-400">{totalChallenges}</div>
					<div class="text-sm text-neutral-400">Total Challenges</div>
				</div>
			</div>
		</div>
	</div>
</div>