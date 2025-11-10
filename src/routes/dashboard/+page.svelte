<script lang="ts">
	import { onMount } from 'svelte';
	import { Users, Trophy, Clock, Code2, Target, TrendingUp, Calendar, Activity } from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import MainNavigation from '$lib/components/Header/MainNavigation.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let challenges = $state<any[]>([]);
	let lobbies = $state<any[]>([]);
	let recentSubmissions = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			// Load challenges
			const challengesResponse = await fetch('/api/challenges?limit=6');
			const challengesData = await challengesResponse.json();
			if (challengesResponse.ok) {
				challenges = challengesData.challenges || [];
			}

			// Load lobbies
			const lobbiesResponse = await fetch('/api/lobbies?limit=4');
			const lobbiesData = await lobbiesResponse.json();
			if (lobbiesResponse.ok) {
				lobbies = lobbiesData.lobbies || [];
			}

			// Load recent submissions if user is logged in
			if (data.session) {
				const submissionsResponse = await fetch('/api/submissions?limit=5');
				const submissionsData = await submissionsResponse.json();
				if (submissionsResponse.ok) {
					recentSubmissions = submissionsData.submissions || [];
				}
			}
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		} finally {
			loading = false;
		}
	});

	function getDifficultyColor(difficulty: string) {
		switch (difficulty.toLowerCase()) {
			case 'easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
			case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
			case 'hard': return 'bg-red-500/10 text-red-400 border-red-500/30';
			default: return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30';
		}
	}
</script>

<svelte:head>
	<title>Dashboard - CodeOut</title>
</svelte:head>

<MainNavigation user={data.user} profile={data.profile} />

<div class="min-h-screen bg-neutral-950">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
			<p class="text-neutral-400">Welcome back! Ready to solve some challenges?</p>
		</div>

		{#if loading}
			<div class="flex items-center justify-center h-64">
				<div class="text-center">
					<div class="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p class="text-neutral-300">Loading dashboard...</p>
				</div>
			</div>
		{:else}
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardContent class="p-6">
						<div class="flex items-center">
							<div class="p-3 bg-emerald-600/20 rounded-full">
								<Code2 class="h-6 w-6 text-emerald-400" />
							</div>
							<div class="ml-4">
								<h3 class="text-2xl font-bold text-white">24</h3>
								<p class="text-neutral-400 text-sm">Problems Solved</p>
							</div>
						</div>
					</CardContent>
				</Card>
				
				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardContent class="p-6">
						<div class="flex items-center">
							<div class="p-3 bg-yellow-600/20 rounded-full">
								<Trophy class="h-6 w-6 text-yellow-400" />
							</div>
							<div class="ml-4">
								<h3 class="text-2xl font-bold text-white">1,247</h3>
								<p class="text-neutral-400 text-sm">Rating Points</p>
							</div>
						</div>
					</CardContent>
				</Card>
				
				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardContent class="p-6">
						<div class="flex items-center">
							<div class="p-3 bg-blue-600/20 rounded-full">
								<Users class="h-6 w-6 text-blue-400" />
							</div>
							<div class="ml-4">
								<h3 class="text-2xl font-bold text-white">3</h3>
								<p class="text-neutral-400 text-sm">Active Lobbies</p>
							</div>
						</div>
					</CardContent>
				</Card>
				
				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardContent class="p-6">
						<div class="flex items-center">
							<div class="p-3 bg-orange-600/20 rounded-full">
								<TrendingUp class="h-6 w-6 text-orange-400" />
							</div>
							<div class="ml-4">
								<h3 class="text-2xl font-bold text-white">127</h3>
								<p class="text-neutral-400 text-sm">Day Streak</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Recent Challenges -->
				<div class="lg:col-span-2">
					<Card class="border-neutral-700 bg-neutral-800/50">
						<CardHeader class="border-b border-neutral-700">
							<CardTitle class="text-xl font-semibold text-white flex items-center">
								<Target class="h-5 w-5 mr-2 text-emerald-400" />
								Recent Challenges
							</CardTitle>
						</CardHeader>
						<CardContent class="p-6">
							{#if challenges.length > 0}
								<div class="space-y-4">
									{#each challenges.slice(0, 4) as challenge}
										<div class="flex items-center justify-between p-4 bg-neutral-900/50 rounded-lg border border-neutral-700 hover:border-emerald-500/50 transition-colors">
											<div class="flex-1">
												<h3 class="font-medium text-white mb-2">{challenge.title}</h3>
												<div class="flex items-center gap-2">
													<Badge class="{getDifficultyColor(challenge.difficulty)} px-2 py-1 text-xs border rounded-full">
														{challenge.difficulty}
													</Badge>
													{#if challenge.tags && challenge.tags.length > 0}
														<div class="flex gap-1">
															{#each challenge.tags.slice(0, 2) as tag}
																<span class="px-2 py-1 text-xs bg-neutral-700 text-neutral-300 rounded">
																	{tag}
																</span>
															{/each}
														</div>
													{/if}
												</div>
											</div>
											<div class="flex items-center gap-3">
												<div class="text-right text-sm text-neutral-400">
													<div>{challenge.view_count || 0} views</div>
													<div>{challenge.success_rate || 0}% success</div>
												</div>
												<Button
													onclick={() => window.location.href = `/challenge/${challenge.id}`}
													class="bg-emerald-600 hover:bg-emerald-700 text-white"
												>
													Solve
												</Button>
											</div>
										</div>
									{/each}
								</div>
								<div class="mt-6 text-center">
									<Button
										href="/challenge"
										variant="outline"
										class="border-neutral-600 text-neutral-300 hover:bg-neutral-700/50"
									>
										View All Challenges
									</Button>
								</div>
							{:else}
								<div class="text-center py-12">
									<Target class="h-16 w-16 text-neutral-600 mx-auto mb-4" />
									<h3 class="text-lg font-semibold text-white mb-2">No Challenges Found</h3>
									<p class="text-neutral-400 mb-4">Check back later for new challenges</p>
								</div>
							{/if}
						</CardContent>
					</Card>
				</div>

				<!-- Sidebar -->
				<div class="space-y-6">
					<!-- Active Lobbies -->
					<Card class="border-neutral-700 bg-neutral-800/50">
						<CardHeader class="border-b border-neutral-700">
							<CardTitle class="text-xl font-semibold text-white flex items-center">
								<Users class="h-5 w-5 mr-2 text-blue-400" />
								Live Lobbies
							</CardTitle>
						</CardHeader>
						<CardContent class="p-6">
							{#if lobbies.length > 0}
								<div class="space-y-3">
									{#each lobbies.slice(0, 3) as lobby}
										<div class="p-4 bg-neutral-900/50 rounded-lg border border-neutral-700 hover:border-blue-500/50 transition-colors">
											<div class="flex items-center justify-between">
												<div class="flex-1">
													<h4 class="font-medium text-white text-sm mb-1">{lobby.name}</h4>
													<div class="flex items-center gap-2 text-xs text-neutral-400">
														<Users class="h-3 w-3" />
														<span>{lobby.participant_count || 0} participants</span>
													</div>
												</div>
												<Button 
													size="sm"
													class="bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30"
												>
													Join
												</Button>
											</div>
										</div>
									{/each}
								</div>
								<div class="mt-4">
									<Button
										href="/home/lobby"
										variant="outline"
										size="sm"
										class="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-700/50"
									>
										View All Lobbies
									</Button>
								</div>
							{:else}
								<div class="text-center py-8">
									<Users class="h-12 w-12 text-neutral-600 mx-auto mb-3" />
									<p class="text-neutral-400 text-sm">No active lobbies</p>
								</div>
							{/if}
						</CardContent>
					</Card>

					<!-- Recent Submissions -->
					{#if data.session}
						<Card class="border-neutral-700 bg-neutral-800/50">
							<CardHeader class="border-b border-neutral-700">
								<CardTitle class="text-xl font-semibold text-white flex items-center">
									<Activity class="h-5 w-5 mr-2 text-orange-400" />
									Recent Activity
								</CardTitle>
							</CardHeader>
							<CardContent class="p-6">
								{#if recentSubmissions.length > 0}
									<div class="space-y-3">
										{#each recentSubmissions.slice(0, 3) as submission}
											<div class="p-3 bg-neutral-900/50 rounded-lg border border-neutral-700">
												<div class="flex items-center justify-between">
													<div class="flex-1">
														<h4 class="font-medium text-white text-sm mb-1">{submission.challenge?.title || 'Challenge'}</h4>
														<p class="text-xs text-neutral-400">{submission.language}</p>
													</div>
													<Badge class="{submission.is_correct ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'} text-xs border">
														{submission.is_correct ? 'Passed' : 'Failed'}
													</Badge>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<div class="text-center py-8">
										<Activity class="h-12 w-12 text-neutral-600 mx-auto mb-3" />
										<p class="text-neutral-400 text-sm mb-2">No submissions yet</p>
										<Button
											href="/challenge"
											size="sm"
											class="bg-emerald-600 hover:bg-emerald-700"
										>
											Start Coding
										</Button>
									</div>
								{/if}
							</CardContent>
						</Card>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>