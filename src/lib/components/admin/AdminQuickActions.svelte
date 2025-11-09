<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Button } from '$lib/components/ui/button';
import { Plus, Trophy, Users, Settings, BarChart } from 'lucide-svelte';

const quickActions = [
	{
		title: 'Create Challenge',
		description: 'Add a new coding challenge',
		href: '/admin/challenges/create',
		icon: Plus,
		color: 'text-emerald-400',
		bgColor: 'bg-emerald-500/20',
		borderColor: 'border-emerald-500/30'
	},
	{
		title: 'Manage Challenges',
		description: 'Edit existing challenges',
		href: '/admin/challenges',
		icon: Trophy,
		color: 'text-blue-400',
		bgColor: 'bg-blue-500/20',
		borderColor: 'border-blue-500/30'
	},
	{
		title: 'User Management',
		description: 'Manage user accounts',
		href: '/admin/users',
		icon: Users,
		color: 'text-purple-400',
		bgColor: 'bg-purple-500/20',
		borderColor: 'border-purple-500/30'
	},
	{
		title: 'View Analytics',
		description: 'Platform statistics',
		href: '/admin/analytics',
		icon: BarChart,
		color: 'text-amber-400',
		bgColor: 'bg-amber-500/20',
		borderColor: 'border-amber-500/30'
	}
];
</script>

<div class="mb-8">
	<h2 class="text-xl font-semibold text-neutral-100 mb-4">Quick Actions</h2>
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each quickActions as action}
			<Card class="bg-neutral-900 border-neutral-800 p-6 hover:bg-neutral-800/50 transition-colors">
				<Button
					variant="ghost"
					class="w-full h-auto p-0 flex flex-col items-start"
					href={action.href}
				>
					<div class="{action.bgColor} {action.borderColor} {action.color} p-3 rounded-lg border mb-3">
						<svelte:component this={action.icon} class="h-6 w-6" />
					</div>
					<h3 class="font-semibold text-neutral-100 text-left mb-1">{action.title}</h3>
					<p class="text-sm text-neutral-400 text-left">{action.description}</p>
				</Button>
			</Card>
		{/each}
	</div>
</div>