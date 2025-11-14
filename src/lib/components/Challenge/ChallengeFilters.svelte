<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, Filter, X, Check, ChevronDown, Tag, Target, Grid3X3 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent } from '$lib/components/ui/card';

	interface FilterProps {
		searchTerm: string;
		selectedDifficulty: string;
		selectedCategories: string[];
		selectedTags: string[];
		onSearchChange: (value: string) => void;
		onDifficultyChange: (value: string) => void;
		onCategoryChange: (categories: string[]) => void;
		onTagChange: (tags: string[]) => void;
		onClearAll: () => void;
		totalChallenges: number;
	}

	let {
		searchTerm = '',
		selectedDifficulty = 'all',
		selectedCategories = [],
		selectedTags = [],
		onSearchChange,
		onDifficultyChange,
		onCategoryChange,
		onTagChange,
		onClearAll,
		totalChallenges = 0
	}: FilterProps = $props();

	// State for categories and tags from database
	let categories = $state<
		Array<{ id: string; name: string; description: string | null; count: number; icon?: string }>
	>([]);
	let tags = $state<Array<{ id: string; name: string; count: number }>>([]);
	let loading = $state(true);

	// Fetch categories and tags from API
	onMount(async () => {
		try {
			const response = await fetch('/api/challenges/filters');
			const data = await response.json();

			if (response.ok) {
				// Add icons to categories (you can customize these)
				const categoryIcons: Record<string, string> = {
					algorithms: '🔀',
					'data-structures': '📊',
					'dynamic-programming': '🎯',
					'graph-theory': '🕸️',
					'string-manipulation': '🔤',
					mathematics: '📐',
					'sorting-searching': '🔍',
					'tree-traversal': '🌳',
					array: '📋',
					'hash-table': '🗂️',
					'linked-list': '🔗',
					'binary-tree': '🌲',
					stack: '📚',
					queue: '📝',
					heap: '⛰️',
					recursion: '🔄',
					backtracking: '↩️',
					greedy: '💡'
				};

				categories = (data.categories || []).map((cat: any) => ({
					...cat,
					icon: categoryIcons[cat.name.toLowerCase().replace(/\s+/g, '-')] || '📁'
				}));
				tags = data.tags || [];
				totalChallenges = data.totalChallenges || 0;
			}
		} catch (error) {
			console.error('Failed to fetch filter data:', error);
		} finally {
			loading = false;
		}
	});

	const difficulties = [
		{ id: 'all', name: 'All Difficulties', icon: '⚪', count: totalChallenges },
		{ id: 'easy', name: 'Easy', icon: '🟢', count: Math.floor(totalChallenges * 0.4) },
		{ id: 'medium', name: 'Medium', icon: '🟡', count: Math.floor(totalChallenges * 0.45) },
		{ id: 'hard', name: 'Hard', icon: '🔴', count: Math.floor(totalChallenges * 0.15) }
	];

	// UI State
	let showCategoryDropdown = $state(false);
	let showTagDropdown = $state(false);
	let showAdvancedFilters = $state(false);

	// Computed values using $derived for Svelte 5 runes mode
	const activeFiltersCount = $derived(
		(selectedDifficulty !== 'all' ? 1 : 0) +
			selectedCategories.length +
			selectedTags.length +
			(searchTerm.length > 0 ? 1 : 0)
	);

	// Category toggle functions
	function toggleCategory(categoryId: string) {
		if (selectedCategories.includes(categoryId)) {
			onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
		} else {
			onCategoryChange([...selectedCategories, categoryId]);
		}
	}

	function toggleTag(tagId: string) {
		if (selectedTags.includes(tagId)) {
			onTagChange(selectedTags.filter((id) => id !== tagId));
		} else {
			onTagChange([...selectedTags, tagId]);
		}
	}

	function clearAllFilters() {
		onClearAll();
		showCategoryDropdown = false;
		showTagDropdown = false;
		showAdvancedFilters = false;
	}
</script>

<Card class="mb-8 border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950">
	<CardContent class="flex flex-col gap-6">
		<!-- Main Filter Row -->
		<div class="grid grid-cols-3 gap-3">
			<!-- Search -->
			<div class="relative col-span-3">
				<Search
					class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-neutral-400"
				/>
				<input
					type="text"
					placeholder="Search challenges by title or description..."
					value={searchTerm}
					oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
					class="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-3 pr-4 pl-10 text-sm text-neutral-100 placeholder-neutral-400 transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
				/>
				{#if searchTerm}
					<button
						onclick={() => onSearchChange('')}
						class="absolute top-1/2 right-3 -translate-y-1/2 transform text-neutral-400 transition-colors hover:text-neutral-200"
					>
						<X class="h-4 w-4" />
					</button>
				{/if}
			</div>

			<!-- Quick Filters -->
			<!-- Advanced Filters Toggle -->
			<Button
				variant="outline"
				onclick={() => (showAdvancedFilters = !showAdvancedFilters)}
				class="border-neutral-700 text-neutral-300 hover:border-emerald-500 hover:bg-neutral-800 {showAdvancedFilters
					? 'border-emerald-500 bg-neutral-800'
					: ''} h-max"
			>
				<Filter class="mr-2 h-4 w-4" />
				Filters
				{#if activeFiltersCount > 0}
					<Badge class="ml-2 bg-emerald-600 px-2 py-1 text-xs text-white">
						{activeFiltersCount}
					</Badge>
				{/if}
			</Button>

			<!-- Results Count -->
			<div
				class="col-span-2 flex items-center gap-2 rounded-lg border border-neutral-700/50 bg-neutral-800/50 px-4 py-2"
			>
				<Target class="h-4 w-4 text-emerald-400" />
				<span class="text-sm font-medium text-neutral-300">
					{totalChallenges} challenges
				</span>
			</div>

			<!-- Clear All -->
			{#if activeFiltersCount > 0}
				<Button
					variant="outline"
					onclick={clearAllFilters}
					class="border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-500/10"
				>
					<X class="mr-2 h-4 w-4" />
					Clear All
				</Button>
			{/if}
		</div>

		<!-- Advanced Filters Panel -->
		{#if showAdvancedFilters}
			<div class="border-t border-neutral-700 pt-6">
				<div class="flex flex-col gap-6">
					<!-- Left Column - Status & Difficulty -->
					<div class="space-y-6">
						<!-- Difficulty Filter -->
						<div>
							<h3 class="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
								<Target class="h-4 w-4 text-emerald-400" />
								Difficulty
							</h3>
							<div class="space-y-2">
								{#each difficulties as difficulty}
									<label
										class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/50"
									>
										<input
											type="radio"
											name="difficulty"
											value={difficulty.id}
											checked={selectedDifficulty === difficulty.id}
											onchange={() => onDifficultyChange(difficulty.id)}
											class="h-4 w-4 border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
										/>
										<span class="text-lg">{difficulty.icon}</span>
										<div class="flex-1">
											<div class="text-sm font-medium text-neutral-200">{difficulty.name}</div>
											<div class="text-xs text-neutral-500">({difficulty.count})</div>
										</div>
									</label>
								{/each}
							</div>
						</div>

						<!-- Status Filter (like HackerRank) -->
						<div>
							<h3 class="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
								<Check class="h-4 w-4 text-emerald-400" />
								Status
							</h3>
							<div class="space-y-2">
								<label
									class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/50"
								>
									<input
										type="checkbox"
										class="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
									/>
									<span class="text-green-400">●</span>
									<div class="flex-1">
										<div class="text-sm font-medium text-neutral-200">Solved</div>
									</div>
								</label>
								<label
									class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/50"
								>
									<input
										type="checkbox"
										class="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
									/>
									<span class="text-neutral-400">●</span>
									<div class="flex-1">
										<div class="text-sm font-medium text-neutral-200">Unsolved</div>
									</div>
								</label>
							</div>
						</div>
					</div>

					<!-- Middle Column - Categories -->
					<div>
						<h3 class="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
							<Grid3X3 class="h-4 w-4 text-emerald-400" />
							Categories
						</h3>
						{#if loading}
							<div class="space-y-2">
								{#each Array(6) as _, i}
									<div class="flex animate-pulse items-center gap-3 rounded-lg p-2">
										<div class="h-4 w-4 rounded bg-neutral-700"></div>
										<div class="h-4 w-4 rounded bg-neutral-700"></div>
										<div class="flex-1">
											<div class="mb-1 h-3 rounded bg-neutral-700"></div>
											<div class="h-2 w-1/3 rounded bg-neutral-800"></div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="max-h-64 space-y-2 overflow-y-auto pr-2">
								{#each categories as category}
									<label
										class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/50"
									>
										<input
											type="checkbox"
											checked={selectedCategories.includes(category.id)}
											onchange={() => toggleCategory(category.id)}
											class="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
										/>
										<span class="text-base">{category.icon}</span>
										<div class="min-w-0 flex-1">
											<div class="truncate text-sm font-medium text-neutral-200">
												{category.name}
											</div>
											<div class="text-xs text-neutral-500">({category.count})</div>
										</div>
									</label>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Right Columns - Tags -->
					<div class="lg:col-span-2">
						<h3 class="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
							<Tag class="h-4 w-4 text-emerald-400" />
							Tags & Topics
						</h3>
						{#if loading}
							<div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
								<div class="space-y-2">
									{#each Array(6) as _, i}
										<div class="flex animate-pulse items-center gap-3 rounded-lg p-2">
											<div class="h-4 w-4 rounded bg-neutral-700"></div>
											<div class="flex-1">
												<div class="mb-1 h-3 rounded bg-neutral-700"></div>
												<div class="h-2 w-1/4 rounded bg-neutral-800"></div>
											</div>
										</div>
									{/each}
								</div>
								<div class="space-y-2">
									{#each Array(6) as _, i}
										<div class="flex animate-pulse items-center gap-3 rounded-lg p-2">
											<div class="h-4 w-4 rounded bg-neutral-700"></div>
											<div class="flex-1">
												<div class="mb-1 h-3 rounded bg-neutral-700"></div>
												<div class="h-2 w-1/4 rounded bg-neutral-800"></div>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{:else}
							<div class="grid grid-cols-1 gap-x-4 md:grid-cols-2">
								<div class="max-h-64 space-y-2 overflow-y-auto pr-2">
									{#each tags.slice(0, Math.ceil(tags.length / 2)) as tag}
										<label
											class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/50"
										>
											<input
												type="checkbox"
												checked={selectedTags.includes(tag.id)}
												onchange={() => toggleTag(tag.id)}
												class="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
											/>
											<div class="min-w-0 flex-1">
												<div class="truncate text-sm font-medium text-neutral-200">{tag.name}</div>
												<div class="text-xs text-neutral-500">({tag.count})</div>
											</div>
										</label>
									{/each}
								</div>
								<div class="max-h-64 space-y-2 overflow-y-auto pr-2">
									{#each tags.slice(Math.ceil(tags.length / 2)) as tag}
										<label
											class="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-neutral-800/50"
										>
											<input
												type="checkbox"
												checked={selectedTags.includes(tag.id)}
												onchange={() => toggleTag(tag.id)}
												class="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-emerald-600 focus:ring-2 focus:ring-emerald-500"
											/>
											<div class="min-w-0 flex-1">
												<div class="truncate text-sm font-medium text-neutral-200">{tag.name}</div>
												<div class="text-xs text-neutral-500">({tag.count})</div>
											</div>
										</label>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Active Filters Display -->
		{#if activeFiltersCount > 0}
			<div class="mt-4 border-t border-neutral-700 pt-4">
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-sm text-neutral-400">Active filters:</span>

					{#if searchTerm}
						<Badge class="border border-blue-500/30 bg-blue-500/20 text-blue-400">
							Search: "{searchTerm}"
							<button onclick={() => onSearchChange('')} class="ml-2 hover:text-blue-300">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}

					{#if selectedDifficulty !== 'all'}
						<Badge class="border border-purple-500/30 bg-purple-500/20 text-purple-400">
							Difficulty: {selectedDifficulty}
							<button onclick={() => onDifficultyChange('all')} class="ml-2 hover:text-purple-300">
								<X class="h-3 w-3" />
							</button>
						</Badge>
					{/if}

					{#each selectedCategories as categoryId}
						{@const category = categories.find((c) => c.id === categoryId)}
						{#if category}
							<Badge class="border border-emerald-500/30 bg-emerald-500/20 text-emerald-400">
								{category.icon}
								{category.name}
								<button
									onclick={() => toggleCategory(categoryId)}
									class="ml-2 hover:text-emerald-300"
								>
									<X class="h-3 w-3" />
								</button>
							</Badge>
						{/if}
					{/each}

					{#each selectedTags as tagId}
						{@const tag = tags.find((t) => t.id === tagId)}
						{#if tag}
							<Badge class="border border-amber-500/30 bg-amber-500/20 text-amber-400">
								{tag.name}
								<button onclick={() => toggleTag(tagId)} class="ml-2 hover:text-amber-300">
									<X class="h-3 w-3" />
								</button>
							</Badge>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</CardContent>
</Card>
