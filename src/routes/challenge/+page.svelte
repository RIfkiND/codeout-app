<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, Filter, Code2, Users, Trophy, Target, Star, Play, Grid3X3, Tag, CheckCircle, Circle, BookOpen, Brain, Database, Zap, Hash, List, TreePine, Calculator, Award, Triangle, ArrowRight, Square, ArrowLeftRight, RotateCcw, Type } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import MainNavigation from '$lib/components/Header/MainNavigation.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let challenges = $state<any[]>([]);
	let allChallenges = $state<any[]>([]); // Store all challenges for client-side filtering
	let loading = $state(true);
	let initialLoad = $state(true); // Track if this is the first load
	let selectedDifficulty = $state('all');
	let selectedStatus = $state('all');
	let selectedCategories = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let searchTerm = $state('');
	let sortBy = $state('created_at');
	let sortOrder = $state('desc');
	let pagination = $state({
		page: 1,
		limit: 20,
		total: 0,
		totalPages: 0
	});

	// Live search functionality
	async function fetchAllChallenges() {
		loading = true;
		try {
			// Fetch all challenges at once for client-side filtering
			const response = await fetch('/api/challenges?limit=1000&all=true'); // Get all challenges
			const data = await response.json();
			
			if (response.ok) {
				allChallenges = data.challenges || [];
				applyFilters(); // Apply initial filters
			} else {
				console.error('Failed to fetch challenges:', data.error);
				challenges = [];
			}
		} catch (error) {
			console.error('Error fetching challenges:', error);
			challenges = [];
		} finally {
			loading = false;
			initialLoad = false;
		}
	}

	// Client-side filtering and sorting (instant, no loading)
	function applyFilters() {
		if (allChallenges.length === 0) return;

		let filtered = [...allChallenges];

		// Search filter (instant)
		if (searchTerm.trim()) {
			const searchLower = searchTerm.toLowerCase();
			filtered = filtered.filter(challenge => 
				challenge.title.toLowerCase().includes(searchLower) ||
				challenge.description.toLowerCase().includes(searchLower) ||
				(challenge.tags && challenge.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
			);
		}

		// Difficulty filter
		if (selectedDifficulty !== 'all') {
			filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty);
		}

		// Status filter (you would need to implement user progress tracking)
		if (selectedStatus !== 'all') {
			// TODO: Filter based on user's solved/attempted challenges
		}

		// Category filter
		if (selectedCategories.length > 0) {
			filtered = filtered.filter(challenge => 
				challenge.category && selectedCategories.includes(challenge.category)
			);
		}

		// Tag filter
		if (selectedTags.length > 0) {
			filtered = filtered.filter(challenge => 
				challenge.tags && challenge.tags.some((tag: string) => selectedTags.includes(tag))
			);
		}

		// Sort
		filtered.sort((a, b) => {
			let aVal, bVal;
			
			switch (sortBy) {
				case 'title':
					aVal = a.title.toLowerCase();
					bVal = b.title.toLowerCase();
					break;
				case 'created_at':
					aVal = new Date(a.created_at).getTime();
					bVal = new Date(b.created_at).getTime();
					break;
				case 'view_count':
					aVal = a.view_count || 0;
					bVal = b.view_count || 0;
					break;
				case 'success_rate':
					aVal = a.success_rate || 0;
					bVal = b.success_rate || 0;
					break;
				default:
					aVal = a.created_at;
					bVal = b.created_at;
			}
			
			if (sortOrder === 'asc') {
				return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			} else {
				return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
			}
		});

		// Update pagination
		pagination.total = filtered.length;
		pagination.totalPages = Math.ceil(filtered.length / pagination.limit);
		pagination.page = Math.min(pagination.page, pagination.totalPages || 1);

		// Apply pagination
		const startIndex = (pagination.page - 1) * pagination.limit;
		const endIndex = startIndex + pagination.limit;
		challenges = filtered.slice(startIndex, endIndex);
	}

	// Reactive updates for instant filtering
	$effect(() => {
		// Watch for changes in filters and apply instantly (only after initial load)
		if (!initialLoad) {
			pagination.page = 1; // Reset to first page when filters change
			applyFilters();
		}
	});

	onMount(async () => {
		await fetchAllChallenges();
	});

	// Instant search handler (no debounce)
	function handleSearch(event: Event) {
		const target = event.target as HTMLInputElement;
		searchTerm = target.value;
		// Filtering happens automatically via $effect
	}

	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
			case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
			default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
		}
	}

	function getDifficultyIcon(difficulty: string) {
		switch (difficulty) {
			case 'easy': return Circle;
			case 'medium': return Circle;
			case 'hard': return Circle;
			default: return Circle;
		}
	}

	// Filter handlers (instant updates via reactive $effect)
	function handleSearchChange(value: string) {
		searchTerm = value;
		// No timeout needed - filtering happens instantly via $effect
	}

	function handleDifficultyChange(value: string) {
		selectedDifficulty = value;
		// Filtering happens automatically via $effect
	}

	function handleStatusChange(value: string) {
		selectedStatus = value;
		// Filtering happens automatically via $effect
	}

	function handleCategoryChange(categories: string[]) {
		selectedCategories = categories;
		// Filtering happens automatically via $effect
	}

	function handleTagChange(tags: string[]) {
		selectedTags = tags;
		// Filtering happens automatically via $effect
	}

	function handleSortChange(newSortBy: string, newSortOrder: string = sortOrder) {
		sortBy = newSortBy;
		sortOrder = newSortOrder;
		// Filtering happens automatically via $effect
	}

	function handleClearAll() {
		searchTerm = '';
		selectedDifficulty = 'all';
		selectedStatus = 'all';
		selectedCategories = [];
		selectedTags = [];
		sortBy = 'created_at';
		sortOrder = 'desc';
		// Filtering happens automatically via $effect
	}
</script>

<svelte:head>
	<title>Challenges - CodeOut App</title>
</svelte:head>

<MainNavigation user={data.user} profile={data.profile} />

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<!-- Hero Header -->
	<div class="bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-neutral-800">
		<div class="max-w-7xl mx-auto px-4 py-8">
			<div class="flex items-center justify-between">
				<div>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
						<Target class="w-4 h-4 text-emerald-400" />
						<span class="text-sm font-medium text-emerald-300">Practice & Improve</span>
					</div>
					<h1 class="text-3xl md:text-4xl font-bold mb-2">
						Coding <span class="text-emerald-400">Challenges</span>
					</h1>
					<p class="text-neutral-300 max-w-2xl">
						Sharpen your programming skills with our curated collection of coding challenges.
					</p>
				</div>
				<div class="hidden md:flex items-center gap-4">
					<div class="text-right">
						<div class="text-2xl font-bold text-emerald-400">{challenges.length}</div>
						<div class="text-sm text-neutral-400">Total Challenges</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center h-96">
			<div class="text-center">
				<div class="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
				<p class="text-lg text-neutral-300">Loading challenges...</p>
				<p class="text-sm text-neutral-500">Preparing your coding adventure</p>
			</div>
		</div>
	{:else}
		<!-- Main Content Layout -->
		<div class="max-w-7xl mx-auto px-4 py-6">
			<div class="flex flex-col lg:flex-row gap-6">
				<!-- Left Sidebar - Filters -->
				<div class="w-full lg:w-80 xl:w-96">
					<div class="sticky top-24">
						<!-- Search -->
						<div class="mb-6">
							<div class="relative">
								<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
								<input
									type="text"
									placeholder="Search challenges..."
									value={searchTerm}
									oninput={handleSearch}
									class="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
								/>
								{#if searchTerm}
									<button
										onclick={() => {
											searchTerm = '';
											pagination.page = 1;
											fetchChallenges();
										}}
										class="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
									>
										<Search class="w-4 h-4" />
									</button>
								{/if}
							</div>
						</div>

						<!-- Filter Sections -->
						<div class="space-y-6">
							<!-- Status Filter -->
							<Card class="bg-neutral-900 border-neutral-800">
								<CardHeader class="pb-3">
									<CardTitle class="text-sm font-medium text-neutral-200 flex items-center gap-2">
										<div class="w-2 h-2 rounded-full bg-emerald-400"></div>
										Status
									</CardTitle>
								</CardHeader>
								<CardContent class="space-y-2">
									{#each [
										{ id: 'all', name: 'All', icon: Circle, color: 'text-neutral-400' },
										{ id: 'solved', name: 'Solved', icon: CheckCircle, color: 'text-green-400' },
										{ id: 'attempted', name: 'Attempted', icon: Circle, color: 'text-amber-400' },
										{ id: 'unsolved', name: 'Unsolved', icon: Circle, color: 'text-neutral-400' }
									] as status}
										<label class="flex items-center gap-3 p-2 rounded hover:bg-neutral-800 cursor-pointer transition-colors">
											<input
												type="radio"
												name="status"
												value={status.id}
												checked={selectedStatus === status.id}
												onchange={() => handleStatusChange(status.id)}
											class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 focus:ring-emerald-500"
										/>
										<status.icon class="w-5 h-5 {status.color}" />
										<span class="text-sm text-neutral-200">{status.name}</span>
										</label>
									{/each}
								</CardContent>
							</Card>

							<!-- Difficulty Filter -->
							<Card class="bg-neutral-900 border-neutral-800">
								<CardHeader class="pb-3">
									<CardTitle class="text-sm font-medium text-neutral-200 flex items-center gap-2">
										<Target class="w-4 h-4 text-emerald-400" />
										Difficulty
									</CardTitle>
								</CardHeader>
								<CardContent class="space-y-2">
									{#each [
										{ id: 'all', name: 'All', icon: Circle, count: challenges.length, color: 'text-neutral-400' },
										{ id: 'easy', name: 'Easy', icon: Circle, count: Math.floor(challenges.length * 0.4), color: 'text-green-400' },
										{ id: 'medium', name: 'Medium', icon: Circle, count: Math.floor(challenges.length * 0.45), color: 'text-amber-400' },
										{ id: 'hard', name: 'Hard', icon: Circle, count: Math.floor(challenges.length * 0.15), color: 'text-red-400' }
									] as difficulty}
										<label class="flex items-center gap-3 p-2 rounded hover:bg-neutral-800 cursor-pointer transition-colors">
											<input
												type="radio"
												name="difficulty"
												value={difficulty.id}
												checked={selectedDifficulty === difficulty.id}
												onchange={() => handleDifficultyChange(difficulty.id)}
											class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 focus:ring-emerald-500"
										/>
										<difficulty.icon class="w-5 h-5 {difficulty.color}" />
										<div class="flex-1 flex items-center justify-between">
												<span class="text-sm text-neutral-200">{difficulty.name}</span>
												<span class="text-xs text-neutral-500">({difficulty.count})</span>
											</div>
										</label>
									{/each}
								</CardContent>
							</Card>

							<!-- Categories Filter -->
							<Card class="bg-neutral-900 border-neutral-800">
								<CardHeader class="pb-3">
									<CardTitle class="text-sm font-medium text-neutral-200 flex items-center gap-2">
										<Grid3X3 class="w-4 h-4 text-emerald-400" />
										Categories
									</CardTitle>
								</CardHeader>
								<CardContent class="space-y-2 max-h-64 overflow-y-auto">
									{#each [
										{ id: 'algorithms', name: 'Algorithms', icon: Zap, count: 45 },
										{ id: 'data-structures', name: 'Data Structures', icon: Database, count: 38 },
										{ id: 'dynamic-programming', name: 'Dynamic Programming', icon: Target, count: 23 },
										{ id: 'graph-theory', name: 'Graph Theory', icon: Grid3X3, count: 19 },
										{ id: 'string-manipulation', name: 'String Manipulation', icon: BookOpen, count: 32 },
										{ id: 'mathematics', name: 'Mathematics', icon: Calculator, count: 28 },
										{ id: 'sorting-searching', name: 'Sorting & Searching', icon: Search, count: 25 },
										{ id: 'tree-traversal', name: 'Tree Traversal', icon: TreePine, count: 21 }
									] as category}
										<label class="flex items-center gap-3 p-2 rounded hover:bg-neutral-800 cursor-pointer transition-colors">
											<input
												type="checkbox"
												checked={selectedCategories.includes(category.id)}
												onchange={() => handleCategoryChange(selectedCategories.includes(category.id) 
													? selectedCategories.filter(c => c !== category.id)
													: [...selectedCategories, category.id]
												)}
											class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 rounded focus:ring-emerald-500"
										/>
										<category.icon class="w-4 h-4 text-emerald-400" />
										<div class="flex-1 flex items-center justify-between">
												<span class="text-sm text-neutral-200">{category.name}</span>
												<span class="text-xs text-neutral-500">({category.count})</span>
											</div>
										</label>
									{/each}
								</CardContent>
							</Card>

							<!-- Tags Filter -->
							<Card class="bg-neutral-900 border-neutral-800">
								<CardHeader class="pb-3">
									<CardTitle class="text-sm font-medium text-neutral-200 flex items-center gap-2">
										<Tag class="w-4 h-4 text-emerald-400" />
										Tags
									</CardTitle>
								</CardHeader>
								<CardContent class="space-y-2 max-h-64 overflow-y-auto">
									{#each [
										{ id: 'array', name: 'Array', icon: Grid3X3, count: 56 },
										{ id: 'hash-table', name: 'Hash Table', icon: Hash, count: 34 },
										{ id: 'linked-list', name: 'Linked List', icon: ArrowRight, count: 22 },
										{ id: 'binary-tree', name: 'Binary Tree', icon: TreePine, count: 29 },
										{ id: 'stack', name: 'Stack', icon: Square, count: 18 },
										{ id: 'queue', name: 'Queue', icon: ArrowLeftRight, count: 15 },
										{ id: 'heap', name: 'Heap', icon: Triangle, count: 12 },
										{ id: 'recursion', name: 'Recursion', icon: RotateCcw, count: 31 },
										{ id: 'two-pointers', name: 'Two Pointers', icon: ArrowLeftRight, count: 24 },
										{ id: 'sliding-window', name: 'Sliding Window', icon: Square, count: 16 },
										{ id: 'backtracking', name: 'Backtracking', icon: RotateCcw, count: 14 },
										{ id: 'greedy', name: 'Greedy', icon: Target, count: 19 }
									] as tag}
										<label class="flex items-center gap-3 p-2 rounded hover:bg-neutral-800 cursor-pointer transition-colors">
											<input
												type="checkbox"
												checked={selectedTags.includes(tag.id)}
												onchange={() => handleTagChange(selectedTags.includes(tag.id) 
													? selectedTags.filter(t => t !== tag.id)
													: [...selectedTags, tag.id]
												)}
												class="w-4 h-4 text-emerald-600 bg-neutral-800 border-neutral-600 rounded focus:ring-emerald-500"
										/>
										<tag.icon class="w-4 h-4 text-emerald-400" />
										<div class="flex-1 flex items-center justify-between">
												<span class="text-sm text-neutral-200">{tag.name}</span>
												<span class="text-xs text-neutral-500">({tag.count})</span>
											</div>
										</label>
									{/each}
								</CardContent>
							</Card>

							<!-- Clear Filters -->
							{#if searchTerm || selectedDifficulty !== 'all' || selectedStatus !== 'all' || selectedCategories.length > 0 || selectedTags.length > 0}
								<Button 
									onclick={handleClearAll}
									variant="outline"
									class="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
								>
									Clear All Filters
								</Button>
							{/if}
						</div>
					</div>
				</div>

				<!-- Right Content - Challenge List -->
				<div class="flex-1 min-w-0">
					<!-- Results Header -->
					<div class="flex items-center justify-between mb-6">
						<div class="flex items-center gap-4">
							<h2 class="text-xl font-semibold text-neutral-100">
								Challenges
							</h2>
							<Badge class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
								{pagination.total} total {pagination.total === 1 ? 'result' : 'results'}
							</Badge>
						</div>
						<div class="flex items-center gap-2">
							<span class="text-sm text-neutral-400">Sort by:</span>
							<select 
								value={`${sortBy}-${sortOrder}`}
								onchange={(e) => {
									const target = e.target as HTMLSelectElement;
									const [newSortBy, newSortOrder] = target.value.split('-');
									handleSortChange(newSortBy, newSortOrder);
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

					<!-- Challenge Cards -->
					{#if filteredChallenges.length > 0}
						<div class="space-y-4">
							{#each challenges as challenge}
								<Card class="group bg-gradient-to-r from-neutral-900 to-neutral-950 border-neutral-800 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 cursor-pointer">
									<CardContent class="p-6">
										<div class="flex items-start gap-4">
											<!-- Status Indicator -->
											<div class="flex-shrink-0 mt-1">
												<div class="w-6 h-6 rounded-full border-2 border-neutral-600 flex items-center justify-center">
													<!-- This would be dynamic based on solved status -->
													<div class="w-2 h-2 rounded-full bg-neutral-600"></div>
												</div>
											</div>

											<!-- Challenge Info -->
											<div class="flex-1 min-w-0">
												<div class="flex items-start justify-between gap-4 mb-2">
													<h3 class="font-semibold text-lg text-neutral-100 group-hover:text-emerald-400 transition-colors">
														{challenge.title}
													</h3>
												<Badge class="shrink-0 {getDifficultyColor(challenge.difficulty)} flex items-center gap-1">
													<svelte:component this={getDifficultyIcon(challenge.difficulty)} class="w-3 h-3" />
													{challenge.difficulty}
												</Badge>
												</div>
												
												<div class="text-neutral-400 text-sm mb-4 line-clamp-2 prose prose-invert prose-sm max-w-none">
													{@html challenge.description}
												</div>

												<!-- Stats and Actions -->
												<div class="flex items-center justify-between">
													<div class="flex items-center gap-6 text-sm text-neutral-400">
														<div class="flex items-center gap-1">
															<Users class="w-4 h-4" />
															<span>{challenge.solved_count || 0} solved</span>
														</div>
														<div class="flex items-center gap-1">
															<Target class="w-4 h-4" />
															<span>{challenge.success_percentage || 0}% success</span>
														</div>
													</div>
													<Button 
														onclick={() => window.location.href = `/challenge/${challenge.id}`}
														class="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
													>
														<Play class="w-4 h-4 mr-2" />
														Solve
													</Button>
												</div>

												<!-- Tags -->
												{#if challenge.tags && challenge.tags.length > 0}
													<div class="flex flex-wrap gap-2 mt-4">
														{#each challenge.tags.slice(0, 4) as tag}
															<span class="px-2 py-1 text-xs rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
																{tag}
															</span>
														{/each}
													</div>
												{/if}
											</div>
										</div>
									</CardContent>
								</Card>
							{/each}
						</div>

						<!-- Pagination -->
						{#if pagination.totalPages > 1}
							<div class="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
								<div class="text-sm text-neutral-400">
									Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
								</div>
								<div class="flex items-center gap-2">
									<Button
										onclick={() => {
											pagination.page--;
											fetchChallenges();
										}}
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
												onclick={() => {
													pagination.page = pageNum;
													fetchChallenges();
												}}
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
										onclick={() => {
											pagination.page++;
											fetchChallenges();
										}}
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
					{:else}
						<!-- Empty State -->
						<div class="text-center py-16">
							<div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
								<Search class="w-12 h-12 text-emerald-400" />
							</div>
							<h3 class="text-xl font-semibold text-neutral-100 mb-2">No challenges found</h3>
							<p class="text-neutral-400 mb-6">Try adjusting your filters or search terms.</p>
							<Button onclick={handleClearAll} class="bg-emerald-600 hover:bg-emerald-700">
								Clear Filters
							</Button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>