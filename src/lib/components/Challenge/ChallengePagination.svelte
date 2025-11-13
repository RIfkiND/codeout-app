<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	interface PaginationProps {
		pagination: {
			page: number;
			limit: number;
			total: number;
			totalPages: number;
		};
		onPageChange: (page: number) => void;
	}

	let { pagination, onPageChange }: PaginationProps = $props();
</script>

{#if pagination.totalPages > 1}
	<div class="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
		<div class="text-sm text-neutral-400">
			Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
		</div>
		<div class="flex items-center gap-2">
			<Button
				onclick={() => onPageChange(pagination.page - 1)}
				disabled={pagination.page <= 1}
				variant="outline"
				size="sm"
				class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Previous
			</Button>
			
			{#each Array.from({length: Math.min(5, pagination.totalPages)}, (_, i) => {
				const start = Math.max(1, pagination.page - 2);
				const end = Math.min(pagination.totalPages, start + 4);
				return start + i;
			}) as pageNum}
				{#if pageNum <= pagination.totalPages}
					<Button
						onclick={() => onPageChange(pageNum)}
						variant={pagination.page === pageNum ? 'default' : 'outline'}
						size="sm"
						class={pagination.page === pageNum 
							? 'bg-emerald-600 hover:bg-emerald-700' 
							: 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
						}
					>
						{pageNum}
					</Button>
				{/if}
			{/each}

			<Button
				onclick={() => onPageChange(pagination.page + 1)}
				disabled={pagination.page >= pagination.totalPages}
				variant="outline"
				size="sm"
				class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				Next
			</Button>
		</div>
	</div>
{/if}