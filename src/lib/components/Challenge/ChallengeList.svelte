<script lang="ts">
	import { Play, Users, Target, Circle, CheckCircle } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';

	interface ChallengeListProps {
		challenges: any[];
		loading: boolean;
	}

	let { challenges = [], loading = false }: ChallengeListProps = $props();

	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'easy':
				return 'bg-green-500/20 text-green-400 border-green-500/30';
			case 'medium':
				return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'hard':
				return 'bg-red-500/20 text-red-400 border-red-500/30';
			default:
				return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
		}
	}
</script>

{#if loading}
	<!-- Loading State -->
	<div class="space-y-4">
		{#each Array(6) as _, i}
			<Card
				class="animate-pulse border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950"
			>
				<CardContent class="p-6">
					<div class="flex items-start gap-4">
						<div class="mt-1 h-6 w-6 flex-shrink-0 rounded-full bg-neutral-700"></div>
						<div class="flex-1">
							<div class="mb-2 flex items-start justify-between gap-4">
								<div class="h-6 w-3/4 rounded bg-neutral-700"></div>
								<div class="h-6 w-16 flex-shrink-0 rounded bg-neutral-700"></div>
							</div>
							<div class="mb-4 space-y-2">
								<div class="h-4 w-full rounded bg-neutral-800"></div>
								<div class="h-4 w-2/3 rounded bg-neutral-800"></div>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-6">
									<div class="h-4 w-20 rounded bg-neutral-800"></div>
									<div class="h-4 w-24 rounded bg-neutral-800"></div>
								</div>
								<div class="h-10 w-20 rounded bg-neutral-700"></div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{:else if challenges.length > 0}
	<!-- Challenge Cards -->
	<div class="space-y-4">
		{#each challenges as challenge}
			<Card
				class="group cursor-pointer border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
			>
				<CardContent class="p-6">
					<div class="flex items-start gap-4">
						<!-- Status Indicator -->
						<div class="mt-1 flex-shrink-0">
							<div
								class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral-600"
							>
								<!-- This would be dynamic based on solved status -->
								<div class="h-2 w-2 rounded-full bg-neutral-600"></div>
							</div>
						</div>

						<!-- Challenge Info -->
						<div class="min-w-0 flex-1">
							<div class="mb-2 flex items-start justify-between gap-4">
								<h3
									class="text-lg font-semibold text-neutral-100 transition-colors group-hover:text-emerald-400"
								>
									{challenge.title}
								</h3>
								<Badge
									class="shrink-0 {getDifficultyColor(
										challenge.difficulty
									)} flex items-center gap-1"
								>
									{challenge.difficulty}
								</Badge>
							</div>

							<!-- Stats and Actions -->
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-6 text-sm text-neutral-400">
									<div class="flex items-center gap-1">
										<Users class="h-4 w-4" />
										<span>{challenge.solved_count || 0} solved</span>
									</div>
									<div class="flex items-center gap-1">
										<Target class="h-4 w-4" />
										<span>{challenge.success_percentage || 0}% success</span>
									</div>
								</div>
								<Button
									onclick={() => (window.location.href = `/challenge/${challenge.id}`)}
									class="bg-emerald-600 px-6 text-white hover:bg-emerald-700"
								>
									<Play class="mr-2 h-4 w-4" />
									Solve
								</Button>
							</div>

							<!-- Tags -->
							{#if challenge.tags && challenge.tags.length > 0}
								<div class="mt-4 flex flex-wrap gap-2">
									{#each challenge.tags.slice(0, 4) as tag}
										<span
											class="rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
										>
											{tag}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
{:else}
	<!-- Empty State -->
	<div class="py-16 text-center">
		<div
			class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"
		>
			<Target class="h-12 w-12 text-emerald-400" />
		</div>
		<h3 class="mb-2 text-xl font-semibold text-neutral-100">No challenges found</h3>
		<p class="mb-6 text-neutral-400">Try adjusting your filters or search terms.</p>
		<Button class="bg-emerald-600 hover:bg-emerald-700">Browse All Challenges</Button>
	</div>
{/if}
