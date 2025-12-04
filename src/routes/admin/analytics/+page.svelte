<script lang="ts">
	// Chart functionality will be implemented when chart.js is available
	interface PageData {
		userGrowth: any[];
		challengeStats: any[];
		submissionTrends: any[];
		languageUsage: any[];
		lobbyStats: any;
	}

	let { data }: { data: PageData } = $props();

	// Chart configurations
	const userGrowthConfig = {
		type: 'line',
		data: {
			labels: data.userGrowth.map(d => d.date),
			datasets: [{
				label: 'New Users',
				data: data.userGrowth.map(d => d.total),
				borderColor: '#10b981',
				backgroundColor: '#10b98120',
				tension: 0.4
			}]
		},
		options: {
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: 'User Growth Over Time',
					color: '#f3f4f6'
				},
				legend: {
					labels: {
						color: '#f3f4f6'
					}
				}
			},
			scales: {
				x: {
					ticks: { color: '#9ca3af' },
					grid: { color: '#374151' }
				},
				y: {
					ticks: { color: '#9ca3af' },
					grid: { color: '#374151' }
				}
			}
		}
	};

	const submissionTrendsConfig = {
		type: 'bar',
		data: {
			labels: data.submissionTrends.slice(-30).map(d => d.date),
			datasets: [{
				label: 'Total Submissions',
				data: data.submissionTrends.slice(-30).map(d => d.total),
				backgroundColor: '#3b82f6',
				borderColor: '#2563eb',
				borderWidth: 1
			}, {
				label: 'Successful Submissions',
				data: data.submissionTrends.slice(-30).map(d => d.correct),
				backgroundColor: '#10b981',
				borderColor: '#059669',
				borderWidth: 1
			}]
		},
		options: {
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: 'Submission Trends (Last 30 Days)',
					color: '#f3f4f6'
				},
				legend: {
					labels: {
						color: '#f3f4f6'
					}
				}
			},
			scales: {
				x: {
					ticks: { color: '#9ca3af' },
					grid: { color: '#374151' }
				},
				y: {
					ticks: { color: '#9ca3af' },
					grid: { color: '#374151' }
				}
			}
		}
	};

	const languageUsageConfig = {
		type: 'doughnut',
		data: {
			labels: data.languageUsage.slice(0, 8).map(d => d.language.charAt(0).toUpperCase() + d.language.slice(1)),
			datasets: [{
				data: data.languageUsage.slice(0, 8).map(d => d.count),
				backgroundColor: [
					'#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
					'#ef4444', '#06b6d4', '#84cc16', '#f97316'
				],
				borderColor: '#1f2937',
				borderWidth: 2
			}]
		},
		options: {
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: 'Programming Language Usage',
					color: '#f3f4f6'
				},
				legend: {
					position: 'bottom',
					labels: {
						color: '#f3f4f6',
						padding: 20
					}
				}
			}
		}
	};

	const challengeDifficultyStats = {
		easy: data.challengeStats.filter((c: any) => c.difficulty === 'easy'),
		medium: data.challengeStats.filter((c: any) => c.difficulty === 'medium'),
		hard: data.challengeStats.filter((c: any) => c.difficulty === 'hard')
	};
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<div class="max-w-7xl mx-auto p-6">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold">Platform Analytics</h1>
			<p class="text-neutral-400 mt-2">Comprehensive insights into platform performance and user behavior</p>
		</div>

		<!-- Key Metrics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<h3 class="text-neutral-400 text-sm font-medium">Total Users</h3>
				<p class="text-3xl font-bold text-white mt-2">{data.userGrowth.reduce((sum: number, d: any) => sum + d.total, 0)}</p>
				<p class="text-green-400 text-sm mt-2">↗ Growing</p>
			</div>

			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<h3 class="text-neutral-400 text-sm font-medium">Total Submissions</h3>
				<p class="text-3xl font-bold text-white mt-2">{data.submissionTrends.reduce((sum: number, d: any) => sum + d.total, 0)}</p>
				<p class="text-blue-400 text-sm mt-2">All time</p>
			</div>

			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<h3 class="text-neutral-400 text-sm font-medium">Success Rate</h3>
				<p class="text-3xl font-bold text-white mt-2">
					{Math.round((data.submissionTrends.reduce((sum: number, d: any) => sum + d.correct, 0) / 
					 data.submissionTrends.reduce((sum: number, d: any) => sum + d.total, 0)) * 100) || 0}%
				</p>
				<p class="text-emerald-400 text-sm mt-2">Average</p>
			</div>

			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<h3 class="text-neutral-400 text-sm font-medium">Active Lobbies</h3>
				<p class="text-3xl font-bold text-white mt-2">{data.lobbyStats.active}</p>
				<p class="text-purple-400 text-sm mt-2">Currently running</p>
			</div>
		</div>

		<!-- Charts Row 1 -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
			<!-- User Growth Chart Placeholder -->
			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<h3 class="text-lg font-semibold mb-4 text-white">User Growth Over Time</h3>
				<div class="h-64 flex items-center justify-center text-neutral-400">
					<p>Chart visualization will be available when chart.js is installed</p>
				</div>
			</div>

			<!-- Language Usage Chart Placeholder -->
			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<h3 class="text-lg font-semibold mb-4 text-white">Programming Language Usage</h3>
				<div class="h-64 flex items-center justify-center text-neutral-400">
					<p>Chart visualization will be available when chart.js is installed</p>
				</div>
			</div>
		</div>

		<!-- Charts Row 2 -->
		<div class="grid grid-cols-1 gap-6 mb-8">
			<!-- Submission Trends Chart Placeholder -->
			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<h3 class="text-lg font-semibold mb-4 text-white">Submission Trends (Last 30 Days)</h3>
				<div class="h-64 flex items-center justify-center text-neutral-400">
					<p>Chart visualization will be available when chart.js is installed</p>
				</div>
			</div>
		</div>

		<!-- Challenge Performance Tables -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
			{#each Object.entries(challengeDifficultyStats) as [difficulty, challenges]}
				<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
					<h3 class="text-lg font-semibold mb-4 capitalize {difficulty === 'easy' ? 'text-green-400' : difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'}">
						{difficulty} Challenges
					</h3>
					<div class="space-y-3">
						{#each challenges.slice(0, 5) as challenge}
							<div class="flex items-center justify-between">
								<div>
									<p class="text-sm font-medium text-white">{challenge.title}</p>
									<p class="text-xs text-neutral-400">{challenge.totalSubmissions} submissions</p>
								</div>
								<div class="text-right">
									<p class="text-sm font-bold {challenge.successRate > 70 ? 'text-green-400' : challenge.successRate > 40 ? 'text-yellow-400' : 'text-red-400'}">
										{challenge.successRate}%
									</p>
									<p class="text-xs text-neutral-500">success rate</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Language Statistics Table -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
			<h3 class="text-lg font-semibold mb-4">Language Usage Statistics</h3>
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-neutral-700">
							<th class="text-left py-3 px-4 font-semibold text-neutral-300">Language</th>
							<th class="text-right py-3 px-4 font-semibold text-neutral-300">Submissions</th>
							<th class="text-right py-3 px-4 font-semibold text-neutral-300">Percentage</th>
							<th class="text-right py-3 px-4 font-semibold text-neutral-300">Trend</th>
						</tr>
					</thead>
					<tbody>
						{#each data.languageUsage.slice(0, 10) as lang, index}
							<tr class="border-b border-neutral-800 hover:bg-neutral-800/50">
								<td class="py-3 px-4">
									<div class="flex items-center">
										<div class="w-3 h-3 rounded-full mr-3" style="background-color: {
											['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'][index] || '#6b7280'
										}"></div>
										<span class="font-medium text-white capitalize">{lang.language}</span>
									</div>
								</td>
								<td class="py-3 px-4 text-right text-neutral-300">{lang.count}</td>
								<td class="py-3 px-4 text-right text-neutral-300">
											{Math.round((lang.count / data.languageUsage.reduce((sum: number, l: any) => sum + l.count, 0)) * 100)}%
								</td>
								<td class="py-3 px-4 text-right">
									<span class="text-green-400">↗</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>