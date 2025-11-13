<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';

	interface ResultsHeaderProps {
		totalResults: number;
		sortBy: string;
		sortOrder: string;
		onSortChange: (sortBy: string, sortOrder: string) => void;
	}

	let { 
		totalResults = 0, 
		sortBy = 'created_at',
		sortOrder = 'desc',
		onSortChange 
	}: ResultsHeaderProps = $props();
</script>

<!-- Results Header -->
<div class="flex items-center justify-between mb-6">
	<div class="flex items-center gap-4">
		<h2 class="text-xl font-semibold text-neutral-100">
			Challenges
		</h2>
		<Badge class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
			{totalResults} total {totalResults === 1 ? 'result' : 'results'}
		</Badge>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-sm text-neutral-400">Sort by:</span>
		<select 
			value={`${sortBy}-${sortOrder}`}
			onchange={(e) => {
				const target = e.target as HTMLSelectElement;
				const [newSortBy, newSortOrder] = target.value.split('-');
				onSortChange(newSortBy, newSortOrder);
			}}
			class="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-neutral-200 text-sm focus:outline-none focus:border-emerald-500"
		>
			<option value="created_at-desc">Newest First</option>
			<option value="created_at-asc">Oldest First</option>
			<option value="title-asc">Title A-Z</option>
			<option value="title-desc">Title Z-A</option>
			<option value="view_count-desc">Most Popular</option>
			<option value="success_rate-asc">Hardest First</option>
			<option value="success_rate-desc">Easiest First</option>
		</select>
	</div>
</div>