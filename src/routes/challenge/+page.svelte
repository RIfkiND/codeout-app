<script lang="ts">
	import { onMount } from 'svelte';
	import MainNavigation from '$lib/components/Header/MainNavigation.svelte';
	import ChallengeHero from '$lib/components/Challenge/ChallengeHero.svelte';
	import ChallengeFilters from '$lib/components/Challenge/ChallengeFilters.svelte';
	import ChallengeResultsHeader from '$lib/components/Challenge/ChallengeResultsHeader.svelte';
	import ChallengeList from '$lib/components/Challenge/ChallengeList.svelte';
	import ChallengePagination from '$lib/components/Challenge/ChallengePagination.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let challenges = $state<any[]>([]);
	let allChallenges = $state<any[]>([]);
	let loading = $state(true);
	let initialLoad = $state(true);
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
			const response = await fetch('/api/challenges?limit=1000&all=true');
			
			if (response.status === 401) {
				// Handle unauthenticated case - still allow viewing challenges
				console.log('Viewing challenges without authentication');
			}
			
			const responseData = await response.json();
			
			if (response.ok) {
				allChallenges = responseData.challenges || [];
				applyFilters();
			} else {
				console.error('Failed to fetch challenges:', responseData.error);
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

	// Client-side filtering and sorting
	function applyFilters() {
		if (allChallenges.length === 0) return;

		let filtered = [...allChallenges];

		// Search filter
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
		if (!initialLoad) {
			pagination.page = 1;
			applyFilters();
		}
	});

	onMount(async () => {
		await fetchAllChallenges();
	});

	// Filter handlers
	function handleSearchChange(value: string) {
		searchTerm = value;
	}

	function handleDifficultyChange(value: string) {
		selectedDifficulty = value;
	}

	function handleStatusChange(value: string) {
		selectedStatus = value;
	}

	function handleCategoryChange(categories: string[]) {
		selectedCategories = categories;
	}

	function handleTagChange(tags: string[]) {
		selectedTags = tags;
	}

	function handleSortChange(newSortBy: string, newSortOrder: string = sortOrder) {
		sortBy = newSortBy;
		sortOrder = newSortOrder;
	}

	function handleClearAll() {
		searchTerm = '';
		selectedDifficulty = 'all';
		selectedStatus = 'all';
		selectedCategories = [];
		selectedTags = [];
		sortBy = 'created_at';
		sortOrder = 'desc';
	}

	function handlePageChange(page: number) {
		pagination.page = page;
		applyFilters();
	}
</script>

<svelte:head>
	<title>Challenges - CodeOut App</title>
</svelte:head>

<MainNavigation user={data?.user || null} profile={data?.profile || null} />

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<ChallengeHero totalChallenges={pagination.total} />

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
						<ChallengeFilters 
							{searchTerm}
							{selectedDifficulty}
							{selectedCategories}
							{selectedTags}
							onSearchChange={handleSearchChange}
							onDifficultyChange={handleDifficultyChange}
							onCategoryChange={handleCategoryChange}
							onTagChange={handleTagChange}
							onClearAll={handleClearAll}
							totalChallenges={pagination.total}
						/>
					</div>
				</div>

				<!-- Right Content - Challenge List -->
				<div class="flex-1 min-w-0">
					<ChallengeResultsHeader 
						totalResults={pagination.total}
						{sortBy}
						{sortOrder}
						onSortChange={handleSortChange}
					/>

					<ChallengeList {challenges} {loading} />

					<ChallengePagination 
						{pagination}
						onPageChange={handlePageChange}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>