<script lang="ts">
import { Card } from '$lib/components/ui/card';
import { Badge } from '$lib/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-svelte';

interface Activity {
	id: string;
	created_at: string;
	is_correct: boolean;
	users?: {
		username?: string;
		email?: string;
	};
	challenges?: {
		title: string;
	};
}

let { activities }: { activities: Activity[] } = $props();

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
		hour: '2-digit', 
		minute: '2-digit' 
	});
}

function getUserDisplay(user?: { username?: string; email?: string }): string {
	return user?.username || user?.email || 'Unknown User';
}
</script>

<div class="mb-8">
	<h2 class="text-xl font-semibold text-neutral-100 mb-4">Recent Activity</h2>
	<Card class="bg-neutral-900 border-neutral-800">
		{#if activities.length === 0}
			<div class="p-6 text-center">
				<Clock class="h-8 w-8 text-neutral-400 mx-auto mb-2" />
				<p class="text-neutral-400">No recent activity</p>
			</div>
		{:else}
			<div class="divide-y divide-neutral-800">
				{#each activities as activity}
					<div class="p-4 flex items-center justify-between hover:bg-neutral-800/50 transition-colors">
						<div class="flex items-center space-x-4">
							<div class="flex-shrink-0">
								{#if activity.is_correct}
									<div class="bg-green-500/20 text-green-400 p-2 rounded-full">
										<CheckCircle class="h-4 w-4" />
									</div>
								{:else}
									<div class="bg-red-500/20 text-red-400 p-2 rounded-full">
										<XCircle class="h-4 w-4" />
									</div>
								{/if}
							</div>
							<div>
								<p class="text-sm font-medium text-neutral-100">
									{getUserDisplay(activity.users)} submitted solution
								</p>
								<p class="text-sm text-neutral-400">
									Challenge: {activity.challenges?.title || 'Unknown Challenge'}
								</p>
							</div>
						</div>
						<div class="flex items-center space-x-3">
							<Badge 
								variant={activity.is_correct ? 'default' : 'destructive'}
								class={activity.is_correct 
									? 'bg-green-500/20 text-green-400 border-green-500/30' 
									: 'bg-red-500/20 text-red-400 border-red-500/30'
								}
							>
								{activity.is_correct ? 'Correct' : 'Incorrect'}
							</Badge>
							<span class="text-xs text-neutral-500">
								{formatDate(activity.created_at)}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card>
</div>