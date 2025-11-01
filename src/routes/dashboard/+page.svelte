<script lang="ts">
	import { onMount } from 'svelte';
	import { Users, Trophy, Clock, Code2 } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let challenges: any[] = [];
	let lobbies: any[] = [];
	let recentSubmissions: any[] = [];
	let loading = true;

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
</script>

<svelte:head>
	<title>Dashboard - CodeOut App</title>
</svelte:head>

<div class="min-h-screen bg-black">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-white mb-2">Dashboard</h1>
			<p class="text-gray-400">Welcome back! Ready to solve some challenges?</p>
		</div>

		{#if loading}
			<div class="flex items-center justify-center h-64">
				<div class="text-center">
					<div class="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p class="text-gray-300">Loading dashboard...</p>
				</div>
			</div>
		{:else}
			<!-- Stats Cards -->
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
					<div class="flex items-center">
						<div class="p-3 bg-purple-600/20 rounded-full">
							<Code2 class="h-6 w-6 text-purple-400" />
						</div>
						<div class="ml-4">
							<h3 class="text-lg font-semibold text-white">24</h3>
							<p class="text-gray-400 text-sm">Problems Solved</p>
						</div>
					</div>
				</div>
				
				<div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
					<div class="flex items-center">
						<div class="p-3 bg-green-600/20 rounded-full">
							<Trophy class="h-6 w-6 text-green-400" />
						</div>
						<div class="ml-4">
							<h3 class="text-lg font-semibold text-white">1,247</h3>
							<p class="text-gray-400 text-sm">Rating</p>
						</div>
					</div>
				</div>
				
				<div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
					<div class="flex items-center">
						<div class="p-3 bg-blue-600/20 rounded-full">
							<Users class="h-6 w-6 text-blue-400" />
						</div>
						<div class="ml-4">
							<h3 class="text-lg font-semibold text-white">3</h3>
							<p class="text-gray-400 text-sm">Active Lobbies</p>
						</div>
					</div>
				</div>
				
				<div class="bg-gray-900 border border-gray-700 rounded-lg p-6">
					<div class="flex items-center">
						<div class="p-3 bg-orange-600/20 rounded-full">
							<Clock class="h-6 w-6 text-orange-400" />
						</div>
						<div class="ml-4">
							<h3 class="text-lg font-semibold text-white">127</h3>
							<p class="text-gray-400 text-sm">Days Streak</p>
						</div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Recent Challenges -->
				<div class="lg:col-span-2">
					<div class="bg-gray-900 border border-gray-700 rounded-lg">
						<div class="p-6 border-b border-gray-700">
							<h2 class="text-xl font-semibold text-white">Recent Challenges</h2>
						</div>
						<div class="p-6">
							{#if challenges.length > 0}
								<div class="space-y-4">
									{#each challenges.slice(0, 4) as challenge}
										<div class="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
											<div>
												<h3 class="font-medium text-white">{challenge.title}</h3>
												<p class="text-sm text-gray-400 mt-1">{challenge.difficulty}</p>
											</div>
											<div class="flex items-center gap-3">
												<span class="px-3 py-1 text-xs bg-purple-600/20 text-purple-400 rounded-full border border-purple-500/30">
													{challenge.difficulty}
												</span>
												<a
													href="/challenge/{challenge.id}"
													class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
												>
													Solve
												</a>
											</div>
										</div>
									{/each}
								</div>
								<div class="mt-6 text-center">
									<a
										href="/challenge"
										class="inline-flex items-center px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
									>
										View All Challenges
									</a>
								</div>
							{:else}
								<p class="text-gray-400 text-center py-8">No challenges available</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Sidebar -->
				<div class="space-y-6">
					<!-- Active Lobbies -->
					<div class="bg-gray-900 border border-gray-700 rounded-lg">
						<div class="p-6 border-b border-gray-700">
							<h2 class="text-xl font-semibold text-white">Active Lobbies</h2>
						</div>
						<div class="p-6">
							{#if lobbies.length > 0}
								<div class="space-y-3">
									{#each lobbies.slice(0, 3) as lobby}
										<div class="p-3 bg-gray-800 rounded-lg border border-gray-700">
											<div class="flex items-center justify-between">
												<div>
													<h4 class="font-medium text-white text-sm">{lobby.name}</h4>
													<p class="text-xs text-gray-400">{lobby.participant_count} participants</p>
												</div>
												<button class="px-3 py-1 bg-green-600/20 text-green-400 rounded text-xs border border-green-500/30">
													Join
												</button>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-gray-400 text-center py-4 text-sm">No active lobbies</p>
							{/if}
						</div>
					</div>

					<!-- Recent Submissions -->
					{#if data.session}
						<div class="bg-gray-900 border border-gray-700 rounded-lg">
							<div class="p-6 border-b border-gray-700">
								<h2 class="text-xl font-semibold text-white">Recent Submissions</h2>
							</div>
							<div class="p-6">
								{#if recentSubmissions.length > 0}
									<div class="space-y-3">
										{#each recentSubmissions.slice(0, 3) as submission}
											<div class="p-3 bg-gray-800 rounded-lg border border-gray-700">
												<div class="flex items-center justify-between">
													<div>
														<h4 class="font-medium text-white text-sm">{submission.challenge?.title || 'Challenge'}</h4>
														<p class="text-xs text-gray-400">{submission.language}</p>
													</div>
													<span class="px-2 py-1 text-xs rounded-full border {submission.status === 'accepted' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}">
														{submission.status}
													</span>
												</div>
											</div>
										{/each}
									</div>
								{:else}
									<p class="text-gray-400 text-center py-4 text-sm">No submissions yet</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>