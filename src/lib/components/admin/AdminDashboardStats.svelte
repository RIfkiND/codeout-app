<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Badge } from '$lib/components/ui/badge';
import { Trophy, Users, FileText, Shield, TrendingUp, Target } from 'lucide-svelte';

interface Stats {
	totalChallenges: number;
	totalUsers: number;
	totalSubmissions: number;
	activeLobbie: number;
	difficultyStats: {
		easy: number;
		medium: number;
		hard: number;
	};
	successRate: number;
}

let { stats }: { stats: Stats } = $props();

const statCards = [
	{
		title: 'Total Challenges',
		value: stats.totalChallenges,
		icon: Trophy,
		color: 'text-emerald-400',
		bgColor: 'bg-emerald-500/20',
		borderColor: 'border-emerald-500/30'
	},
	{
		title: 'Total Users',
		value: stats.totalUsers,
		icon: Users,
		color: 'text-blue-400',
		bgColor: 'bg-blue-500/20',
		borderColor: 'border-blue-500/30'
	},
	{
		title: 'Total Submissions',
		value: stats.totalSubmissions,
		icon: FileText,
		color: 'text-purple-400',
		bgColor: 'bg-purple-500/20',
		borderColor: 'border-purple-500/30'
	},
	{
		title: 'Active Lobbies',
		value: stats.activeLobbie,
		icon: Shield,
		color: 'text-amber-400',
		bgColor: 'bg-amber-500/20',
		borderColor: 'border-amber-500/30'
	},
	{
		title: 'Success Rate',
		value: `${stats.successRate}%`,
		icon: TrendingUp,
		color: 'text-green-400',
		bgColor: 'bg-green-500/20',
		borderColor: 'border-green-500/30'
	},
	{
		title: 'Avg. Difficulty',
		value: 'Medium',
		icon: Target,
		color: 'text-orange-400',
		bgColor: 'bg-orange-500/20',
		borderColor: 'border-orange-500/30'
	}
];
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
	{#each statCards as stat}
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-neutral-400">{stat.title}</p>
					<p class="text-2xl font-bold text-neutral-100 mt-2">{stat.value}</p>
				</div>
				<div class="{stat.bgColor} {stat.borderColor} {stat.color} p-3 rounded-lg border">
					<svelte:component this={stat.icon} class="h-6 w-6" />
				</div>
			</div>
		</Card>
	{/each}
</div>