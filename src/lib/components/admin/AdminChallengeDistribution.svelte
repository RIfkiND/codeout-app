<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Progress } from '$lib/components/ui/progress';
import { Circle } from 'lucide-svelte';

interface Stats {
	totalChallenges: number;
	difficultyStats: {
		easy: number;
		medium: number;
		hard: number;
	};
}

let { stats }: { stats: Stats } = $props();

$: easyPercentage = stats.totalChallenges > 0 ? (stats.difficultyStats.easy / stats.totalChallenges) * 100 : 0;
$: mediumPercentage = stats.totalChallenges > 0 ? (stats.difficultyStats.medium / stats.totalChallenges) * 100 : 0;
$: hardPercentage = stats.totalChallenges > 0 ? (stats.difficultyStats.hard / stats.totalChallenges) * 100 : 0;

const difficulties = [
	{
		name: 'Easy',
		count: stats.difficultyStats.easy,
		percentage: easyPercentage,
		color: 'text-green-400',
		bgColor: 'bg-green-500'
	},
	{
		name: 'Medium',
		count: stats.difficultyStats.medium,
		percentage: mediumPercentage,
		color: 'text-amber-400',
		bgColor: 'bg-amber-500'
	},
	{
		name: 'Hard',
		count: stats.difficultyStats.hard,
		percentage: hardPercentage,
		color: 'text-red-400',
		bgColor: 'bg-red-500'
	}
];
</script>

<div class="mb-8">
	<h2 class="text-xl font-semibold text-neutral-100 mb-4">Challenge Distribution</h2>
	<Card class="bg-neutral-900 border-neutral-800 p-6">
		<div class="space-y-6">
			{#each difficulties as difficulty}
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-2">
							<Circle class="h-3 w-3 {difficulty.color}" />
							<span class="text-sm font-medium text-neutral-100">{difficulty.name}</span>
						</div>
						<div class="text-sm text-neutral-400">
							{difficulty.count} challenges ({Math.round(difficulty.percentage)}%)
						</div>
					</div>
					<Progress 
						value={difficulty.percentage} 
						max={100}
						class="h-2 bg-neutral-800"
					/>
				</div>
			{/each}
		</div>
		
		<div class="mt-6 pt-6 border-t border-neutral-800">
			<div class="text-center">
				<p class="text-lg font-semibold text-neutral-100">{stats.totalChallenges}</p>
				<p class="text-sm text-neutral-400">Total Challenges</p>
			</div>
		</div>
	</Card>
</div>