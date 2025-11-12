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
			case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
			case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
			default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
		}
	}

	function getDifficultyIcon(difficulty: string) {
		switch (difficulty) {
			case 'easy': return Circle;
			case 'medium': return Circle;
			case 'hard': return Circle;
			default: return Circle;
		}
	}
</script>

{#if loading}
	<!-- Loading State -->
	<div class="space-y-4">
		{#each Array(6) as _, i}
			<Card class="bg-gradient-to-r from-neutral-900 to-neutral-950 border-neutral-800 animate-pulse">
				<CardContent class="p-6">
					<div class="flex items-start gap-4">
						<div class="w-6 h-6 bg-neutral-700 rounded-full flex-shrink-0 mt-1"></div>
						<div class="flex-1">
							<div class="flex items-start justify-between gap-4 mb-2">
								<div class="h-6 bg-neutral-700 rounded w-3/4"></div>
								<div class="h-6 bg-neutral-700 rounded w-16 flex-shrink-0"></div>
							</div>
							<div class="space-y-2 mb-4">
								<div class="h-4 bg-neutral-800 rounded w-full"></div>
								<div class="h-4 bg-neutral-800 rounded w-2/3"></div>
							</div>
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-6">
									<div class="h-4 bg-neutral-800 rounded w-20"></div>
									<div class="h-4 bg-neutral-800 rounded w-24"></div>
								</div>
								<div class="h-10 bg-neutral-700 rounded w-20"></div>
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
			<Card class="group bg-gradient-to-r from-neutral-900 to-neutral-950 border-neutral-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer">
				<CardContent class="p-6">
					<div class="flex items-start gap-4">
						<!-- Status Indicator -->
						<div class="flex-shrink-0 mt-1">
							<div class="w-6 h-6 rounded-full border-2 border-neutral-600 flex items-center justify-center">
								<!-- This would be dynamic based on solved status -->
								<div class="w-2 h-2 rounded-full bg-neutral-600"></div>
							</div>
						</div>

						<!-- Challenge Info -->
						<div class="flex-1 min-w-0">
							<div class="flex items-start justify-between gap-4 mb-2">
								<h3 class="font-semibold text-lg text-neutral-100 group-hover:text-emerald-400 transition-colors">
									{challenge.title}
								</h3>
								<Badge class="shrink-0 {getDifficultyColor(challenge.difficulty)} flex items-center gap-1">
									<svelte:component this={getDifficultyIcon(challenge.difficulty)} class="w-3 h-3" />
									{challenge.difficulty}
								</Badge>
							</div>
							
							<div class="text-neutral-400 text-sm mb-4 line-clamp-2 prose prose-invert prose-sm max-w-none">
								{@html challenge.description}
							</div>

							<!-- Stats and Actions -->
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-6 text-sm text-neutral-400">
									<div class="flex items-center gap-1">
										<Users class="w-4 h-4" />
										<span>{challenge.solved_count || 0} solved</span>
									</div>
									<div class="flex items-center gap-1">
										<Target class="w-4 h-4" />
										<span>{challenge.success_percentage || 0}% success</span>
									</div>
								</div>
								<Button 
									onclick={() => window.location.href = `/challenge/${challenge.id}`}
									class="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
								>
									<Play class="w-4 h-4 mr-2" />
									Solve
								</Button>
							</div>

							<!-- Tags -->
							{#if challenge.tags && challenge.tags.length > 0}
								<div class="flex flex-wrap gap-2 mt-4">
									{#each challenge.tags.slice(0, 4) as tag}
										<span class="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
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
	<div class="text-center py-16">
		<div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
			<Target class="w-12 h-12 text-emerald-400" />
		</div>
		<h3 class="text-xl font-semibold text-neutral-100 mb-2">No challenges found</h3>
		<p class="text-neutral-400 mb-6">Try adjusting your filters or search terms.</p>
		<Button class="bg-emerald-600 hover:bg-emerald-700">
			Browse All Challenges
		</Button>
	</div>
{/if}