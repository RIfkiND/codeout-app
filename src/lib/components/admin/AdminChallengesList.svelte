<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';
import { Badge } from '$lib/components/ui/badge';
import { 
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '$lib/components/ui/table';
import { 
	Edit, 
	Trash2, 
	Eye, 
	Calendar,
	TrendingUp,
	Users
} from 'lucide-svelte';

interface Challenge {
	id: string;
	title: string;
	difficulty: string;
	created_at: string;
	view_count?: number;
	attempt_count?: number;
	success_rate?: number;
}

interface Pagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

let { challenges, pagination }: { challenges: Challenge[]; pagination: Pagination } = $props();

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString();
}

function getDifficultyColor(difficulty: string): string {
	switch (difficulty) {
		case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
		case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
		case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
		default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
	}
}

function formatSuccessRate(rate?: number): string {
	return rate ? `${Math.round(rate * 100)}%` : 'N/A';
}
</script>

<Card class="bg-neutral-900 border-neutral-800">
	<div class="p-6">
		<div class="flex items-center justify-between mb-6">
			<h2 class="text-xl font-semibold text-neutral-100">
				All Challenges ({pagination.total})
			</h2>
		</div>
		
		{#if challenges.length === 0}
			<div class="text-center py-12">
				<div class="text-neutral-400 mb-4">No challenges found</div>
				<Button href="/admin/challenges/create" variant="outline" class="border-neutral-700">
					Create your first challenge
				</Button>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow class="border-neutral-800 hover:bg-neutral-800/50">
							<TableHead class="text-neutral-300">Title</TableHead>
							<TableHead class="text-neutral-300">Difficulty</TableHead>
							<TableHead class="text-neutral-300">Created</TableHead>
							<TableHead class="text-neutral-300">Views</TableHead>
							<TableHead class="text-neutral-300">Success Rate</TableHead>
							<TableHead class="text-neutral-300">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each challenges as challenge}
							<TableRow class="border-neutral-800 hover:bg-neutral-800/30">
								<TableCell>
									<div>
										<div class="font-medium text-neutral-100">{challenge.title}</div>
										<div class="text-sm text-neutral-400">ID: {challenge.id.slice(0, 8)}</div>
									</div>
								</TableCell>
								<TableCell>
									<Badge class="{getDifficultyColor(challenge.difficulty)} text-xs">
										{challenge.difficulty}
									</Badge>
								</TableCell>
								<TableCell>
									<div class="flex items-center space-x-1 text-neutral-400">
										<Calendar class="h-3 w-3" />
										<span class="text-sm">{formatDate(challenge.created_at)}</span>
									</div>
								</TableCell>
								<TableCell>
									<div class="flex items-center space-x-1 text-neutral-400">
										<Eye class="h-3 w-3" />
										<span class="text-sm">{challenge.view_count || 0}</span>
									</div>
								</TableCell>
								<TableCell>
									<div class="flex items-center space-x-1 text-neutral-400">
										<TrendingUp class="h-3 w-3" />
										<span class="text-sm">{formatSuccessRate(challenge.success_rate)}</span>
									</div>
								</TableCell>
								<TableCell>
									<div class="flex items-center space-x-2">
										<Button
											variant="ghost"
											size="sm"
											href="/challenge/{challenge.id}"
											class="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
										>
											<Eye class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											href="/admin/challenges/{challenge.id}/edit"
											class="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
										>
											<Edit class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											class="text-red-400 hover:text-red-300 hover:bg-red-500/10"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			</div>
			
			<!-- Pagination -->
			{#if pagination.totalPages > 1}
				<div class="flex items-center justify-between mt-6 pt-6 border-t border-neutral-800">
					<div class="text-sm text-neutral-400">
						Showing {((pagination.page - 1) * pagination.limit) + 1} to 
						{Math.min(pagination.page * pagination.limit, pagination.total)} of 
						{pagination.total} challenges
					</div>
					
					<div class="flex items-center space-x-2">
						<Button
							variant="outline"
							size="sm"
							href="/admin/challenges?page={pagination.page - 1}"
							disabled={pagination.page <= 1}
							class="border-neutral-700 text-neutral-300"
						>
							Previous
						</Button>
						
						<div class="flex items-center space-x-1">
							{#each Array.from({ length: Math.min(5, pagination.totalPages) }) as _, i}
								<Button
									variant={i + 1 === pagination.page ? "default" : "ghost"}
									size="sm"
									href="/admin/challenges?page={i + 1}"
									class={i + 1 === pagination.page 
										? "bg-emerald-600 text-white" 
										: "text-neutral-400 hover:text-neutral-100"
									}
								>
									{i + 1}
								</Button>
							{/each}
						</div>
						
						<Button
							variant="outline"
							size="sm"
							href="/admin/challenges?page={pagination.page + 1}"
							disabled={pagination.page >= pagination.totalPages}
							class="border-neutral-700 text-neutral-300"
						>
							Next
						</Button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</Card>