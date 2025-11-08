<script lang="ts">
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

	// Available categories and tags
	const categories = [
		{ id: 'algorithms', name: 'Algorithms', icon: '🔀', count: 45 },
		{ id: 'data-structures', name: 'Data Structures', icon: '📊', count: 38 },
		{ id: 'dynamic-programming', name: 'Dynamic Programming', icon: '🎯', count: 23 },
		{ id: 'graph-theory', name: 'Graph Theory', icon: '🕸️', count: 19 },
		{ id: 'string-manipulation', name: 'String Manipulation', icon: '🔤', count: 32 },
		{ id: 'mathematics', name: 'Mathematics', icon: '📐', count: 28 },
		{ id: 'sorting-searching', name: 'Sorting & Searching', icon: '🔍', count: 25 },
		{ id: 'tree-traversal', name: 'Tree Traversal', icon: '🌳', count: 21 }
	];

	const tags = [
		{ id: 'array', name: 'Array', count: 56 },
		{ id: 'hash-table', name: 'Hash Table', count: 34 },
		{ id: 'linked-list', name: 'Linked List', count: 22 },
		{ id: 'binary-tree', name: 'Binary Tree', count: 29 },
		{ id: 'stack', name: 'Stack', count: 18 },
		{ id: 'queue', name: 'Queue', count: 15 },
		{ id: 'heap', name: 'Heap', count: 12 },
		{ id: 'recursion', name: 'Recursion', count: 31 },
		{ id: 'two-pointers', name: 'Two Pointers', count: 24 },
		{ id: 'sliding-window', name: 'Sliding Window', count: 16 },
		{ id: 'backtracking', name: 'Backtracking', count: 14 },
		{ id: 'greedy', name: 'Greedy', count: 19 }
	];

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
			onCategoryChange(selectedCategories.filter(id => id !== categoryId));
		} else {
			onCategoryChange([...selectedCategories, categoryId]);
		}
	}

	function toggleTag(tagId: string) {
		if (selectedTags.includes(tagId)) {
			onTagChange(selectedTags.filter(id => id !== tagId));
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

<Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 mb-8">
	<CardContent class="p-6">
		<!-- Main Filter Row -->
		<div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
			<!-- Search -->
			<div class="relative flex-1 max-w-md">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
				<input
					type="text"
					placeholder="Search challenges by title or description..."
					value={searchTerm}
					oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
					class="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
				/>
				{#if searchTerm}
					<button
						onclick={() => onSearchChange('')}
						class="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
					>
						<X class="w-4 h-4" />
					</button>
				{/if}
			</div>
			
			<!-- Quick Filters -->
			<div class="flex items-center gap-3 flex-wrap">
				<!-- Advanced Filters Toggle -->
				<Button 
					variant="outline"
					onclick={() => showAdvancedFilters = !showAdvancedFilters}
					class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-emerald-500 {showAdvancedFilters ? 'bg-neutral-800 border-emerald-500' : ''}"
				>
					<Filter class="w-4 h-4 mr-2" />
					Filters
					{#if activeFiltersCount > 0}
						<Badge class="ml-2 bg-emerald-600 text-white text-xs px-2 py-1">
							{activeFiltersCount}
						</Badge>
					{/if}
				</Button>

				<!-- Results Count -->
				<div class="flex items-center gap-2 px-4 py-2 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
					<Target class="w-4 h-4 text-emerald-400" />
					<span class="text-sm text-neutral-300 font-medium">
						{totalChallenges} challenges
					</span>
				</div>

				<!-- Clear All -->
				{#if activeFiltersCount > 0}
					<Button 
						variant="outline"
						onclick={clearAllFilters}
						class="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
					>
						<X class="w-4 h-4 mr-2" />
						Clear All
					</Button>
				{/if}
			</div>
		</div>

		<!-- Advanced Filters Panel -->
		{#if showAdvancedFilters}
			<div class="border-t border-neutral-700 pt-6">
				<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<!-- Left Column - Status & Difficulty -->
					<div class="space-y-6">
						<!-- Difficulty Filter -->
						<div>
							<h3 class="text-sm font-medium text-neutral-200 mb-3 flex items-center gap-2">
								<Target class="w-4 h-4 text-emerald-400" />
								Difficulty
							</h3>
							<div class="space-y-2">
								{#each difficulties as difficulty}
									<label class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer transition-colors">
										<input
											type="radio"
											name="difficulty"
											value={difficulty.id}
											checked={selectedDifficulty === difficulty.id}
											onchange={() => onDifficultyChange(difficulty.id)}
											class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 focus:ring-emerald-500 focus:ring-2"
										/>
										<span class="text-lg">{difficulty.icon}</span>
										<div class="flex-1">
											<div class="font-medium text-sm text-neutral-200">{difficulty.name}</div>
											<div class="text-xs text-neutral-500">({difficulty.count})</div>
										</div>
									</label>
								{/each}
							</div>
						</div>

						<!-- Status Filter (like HackerRank) -->
						<div>
							<h3 class="text-sm font-medium text-neutral-200 mb-3 flex items-center gap-2">
								<Check class="w-4 h-4 text-emerald-400" />
								Status
							</h3>
							<div class="space-y-2">
								<label class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer transition-colors">
									<input
										type="checkbox"
										class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 rounded focus:ring-emerald-500 focus:ring-2"
									/>
									<span class="text-green-400">●</span>
									<div class="flex-1">
										<div class="font-medium text-sm text-neutral-200">Solved</div>
									</div>
								</label>
								<label class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer transition-colors">
									<input
										type="checkbox"
										class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 rounded focus:ring-emerald-500 focus:ring-2"
									/>
									<span class="text-neutral-400">●</span>
									<div class="flex-1">
										<div class="font-medium text-sm text-neutral-200">Unsolved</div>
									</div>
								</label>
							</div>
						</div>
					</div>

					<!-- Middle Column - Categories -->
					<div>
						<h3 class="text-sm font-medium text-neutral-200 mb-3 flex items-center gap-2">
							<Grid3X3 class="w-4 h-4 text-emerald-400" />
							Categories
						</h3>
						<div class="space-y-2 max-h-64 overflow-y-auto pr-2">
							{#each categories as category}
								<label class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer transition-colors">
									<input
										type="checkbox"
										checked={selectedCategories.includes(category.id)}
										onchange={() => toggleCategory(category.id)}
										class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 rounded focus:ring-emerald-500 focus:ring-2"
									/>
									<span class="text-base">{category.icon}</span>
									<div class="flex-1 min-w-0">
										<div class="font-medium text-sm text-neutral-200 truncate">{category.name}</div>
										<div class="text-xs text-neutral-500">({category.count})</div>
									</div>
								</label>
							{/each}
						</div>
					</div>

					<!-- Right Columns - Tags -->
					<div class="lg:col-span-2">
						<h3 class="text-sm font-medium text-neutral-200 mb-3 flex items-center gap-2">
							<Tag class="w-4 h-4 text-emerald-400" />
							Tags & Topics
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
							<div class="space-y-2 max-h-64 overflow-y-auto pr-2">
								{#each tags.slice(0, Math.ceil(tags.length / 2)) as tag}
									<label class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer transition-colors">
										<input
											type="checkbox"
											checked={selectedTags.includes(tag.id)}
											onchange={() => toggleTag(tag.id)}
											class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 rounded focus:ring-emerald-500 focus:ring-2"
										/>
										<div class="flex-1 min-w-0">
											<div class="font-medium text-sm text-neutral-200 truncate">{tag.name}</div>
											<div class="text-xs text-neutral-500">({tag.count})</div>
										</div>
									</label>
								{/each}
							</div>
							<div class="space-y-2 max-h-64 overflow-y-auto pr-2">
								{#each tags.slice(Math.ceil(tags.length / 2)) as tag}
									<label class="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 cursor-pointer transition-colors">
										<input
											type="checkbox"
											checked={selectedTags.includes(tag.id)}
											onchange={() => toggleTag(tag.id)}
											class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 rounded focus:ring-emerald-500 focus:ring-2"
										/>
										<div class="flex-1 min-w-0">
											<div class="font-medium text-sm text-neutral-200 truncate">{tag.name}</div>
											<div class="text-xs text-neutral-500">({tag.count})</div>
										</div>
									</label>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Active Filters Display -->
		{#if activeFiltersCount > 0}
			<div class="border-t border-neutral-700 pt-4 mt-4">
				<div class="flex items-center gap-2 flex-wrap">
					<span class="text-sm text-neutral-400">Active filters:</span>
					
					{#if searchTerm}
						<Badge class="bg-blue-500/20 text-blue-400 border border-blue-500/30">
							Search: "{searchTerm}"
							<button onclick={() => onSearchChange('')} class="ml-2 hover:text-blue-300">
								<X class="w-3 h-3" />
							</button>
						</Badge>
					{/if}
					
					{#if selectedDifficulty !== 'all'}
						<Badge class="bg-purple-500/20 text-purple-400 border border-purple-500/30">
							Difficulty: {selectedDifficulty}
							<button onclick={() => onDifficultyChange('all')} class="ml-2 hover:text-purple-300">
								<X class="w-3 h-3" />
							</button>
						</Badge>
					{/if}
					
					{#each selectedCategories as categoryId}
						{@const category = categories.find(c => c.id === categoryId)}
						{#if category}
							<Badge class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
								{category.icon} {category.name}
								<button onclick={() => toggleCategory(categoryId)} class="ml-2 hover:text-emerald-300">
									<X class="w-3 h-3" />
								</button>
							</Badge>
						{/if}
					{/each}
					
					{#each selectedTags as tagId}
						{@const tag = tags.find(t => t.id === tagId)}
						{#if tag}
							<Badge class="bg-amber-500/20 text-amber-400 border border-amber-500/30">
								{tag.name}
								<button onclick={() => toggleTag(tagId)} class="ml-2 hover:text-amber-300">
									<X class="w-3 h-3" />
								</button>
							</Badge>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	</CardContent>
</Card>