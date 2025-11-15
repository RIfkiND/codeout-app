<script lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
import { FileText, Globe, Lock, TrendingUp } from 'lucide-svelte';

interface Props {
	stats: {
		total: number;
		public: number;
		private: number;
	};
}

let { stats }: Props = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
	<Card class="bg-neutral-900 border-neutral-800">
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium text-neutral-200">Total Templates</CardTitle>
			<FileText class="h-4 w-4 text-neutral-400" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-neutral-100">{stats.total}</div>
			<p class="text-xs text-neutral-400">All templates</p>
		</CardContent>
	</Card>

	<Card class="bg-neutral-900 border-neutral-800">
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium text-neutral-200">Public Templates</CardTitle>
			<Globe class="h-4 w-4 text-emerald-400" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-emerald-400">{stats.public}</div>
			<p class="text-xs text-neutral-400">Available to all</p>
		</CardContent>
	</Card>

	<Card class="bg-neutral-900 border-neutral-800">
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium text-neutral-200">Private Templates</CardTitle>
			<Lock class="h-4 w-4 text-amber-400" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-amber-400">{stats.private}</div>
			<p class="text-xs text-neutral-400">Admin only</p>
		</CardContent>
	</Card>

	<Card class="bg-neutral-900 border-neutral-800">
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium text-neutral-200">Usage Rate</CardTitle>
			<TrendingUp class="h-4 w-4 text-blue-400" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold text-blue-400">
				{stats.total > 0 ? Math.round((stats.public / stats.total) * 100) : 0}%
			</div>
			<p class="text-xs text-neutral-400">Public/Total ratio</p>
		</CardContent>
	</Card>
</div>