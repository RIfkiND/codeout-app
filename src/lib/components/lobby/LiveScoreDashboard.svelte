<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { 
		Trophy, Users, Clock, Zap, CheckCircle, 
		Timer, Medal, Crown, Target, TrendingUp 
	} from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		lobbyId: string;
		isOwner: boolean;
	}

	interface LiveScore {
		user_id: string;
		username: string;
		avatar_url?: string;
		total_score: number;
		challenges_completed: number;
		fastest_time?: number;
		latest_submission?: string;
		rank: number;
	}

	interface RecentSubmission {
		id: string;
		user_id: string;
		username: string;
		challenge_title: string;
		score: number;
		is_correct: boolean;
		submitted_at: string;
		execution_time: number;
	}

	let { lobbyId, isOwner }: Props = $props();

	let liveScores = $state<LiveScore[]>([]);
	let recentSubmissions = $state<RecentSubmission[]>([]);
	let isLoading = $state(false);
	let refreshInterval: NodeJS.Timeout | null = null;

	const fetchLiveScores = async () => {
		if (isLoading) return;
		
		isLoading = true;
		try {
			const response = await fetch(`/api/lobbies/${lobbyId}/live-scores`);
			if (response.ok) {
				const data = await response.json();
				liveScores = data.scores || [];
				recentSubmissions = data.recentSubmissions || [];
			}
		} catch (error) {
			console.error('Failed to fetch live scores:', error);
		} finally {
			isLoading = false;
		}
	};

	const formatTime = (ms: number) => {
		if (!ms) return '--';
		const seconds = Math.floor(ms / 1000);
		return `${seconds}s`;
	};

	const formatTimeAgo = (timestamp: string) => {
		const now = Date.now();
		const submissionTime = new Date(timestamp).getTime();
		const diff = now - submissionTime;
		const minutes = Math.floor(diff / 60000);
		
		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h ago`;
	};

	const getRankIcon = (rank: number) => {
		switch (rank) {
			case 1: return Crown;
			case 2: return Medal;
			case 3: return Trophy;
			default: return Target;
		}
	};

	const getRankColor = (rank: number) => {
		switch (rank) {
			case 1: return 'text-yellow-400';
			case 2: return 'text-gray-400';
			case 3: return 'text-amber-600';
			default: return 'text-neutral-400';
		}
	};

	onMount(() => {
		if (isOwner) {
			fetchLiveScores();
			// Refresh every 10 seconds for live updates
			refreshInterval = setInterval(fetchLiveScores, 10000);
		}
	});

	onDestroy(() => {
		if (refreshInterval) {
			clearInterval(refreshInterval);
		}
	});
</script>

{#if isOwner}
	<div class="space-y-6">
		<!-- Live Leaderboard -->
		<Card class="bg-neutral-900 border-neutral-800">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-neutral-100">
					<Trophy class="w-5 h-5 text-yellow-400" />
					Live Leaderboard
				</CardTitle>
			</CardHeader>
			<CardContent>
				{#if liveScores.length === 0}
					<div class="text-center py-8 text-neutral-400">
						<Users class="w-8 h-8 mx-auto mb-2" />
						<p>No participants yet</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each liveScores as score, index (score.user_id)}
							{@const RankIcon = getRankIcon(score.rank)}
							<div class="flex items-center gap-4 p-3 bg-neutral-800 rounded-lg border border-neutral-700">
								<div class="flex items-center gap-2">
									<RankIcon class="w-5 h-5 {getRankColor(score.rank)}" />
									<span class="font-mono text-sm text-neutral-300">#{score.rank}</span>
								</div>
								
								<div class="flex items-center gap-3 flex-1">
									{#if score.avatar_url}
										<img 
											src={score.avatar_url} 
											alt={score.username}
											class="w-8 h-8 rounded-full"
										/>
									{:else}
										<div class="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
											<span class="text-xs font-medium text-neutral-300">
												{score.username.charAt(0).toUpperCase()}
											</span>
										</div>
									{/if}
									
									<div class="flex-1">
										<div class="font-medium text-neutral-100">{score.username}</div>
										<div class="text-xs text-neutral-400">
											{score.challenges_completed} challenges completed
										</div>
									</div>
								</div>
								
								<div class="text-right">
									<div class="font-bold text-lg text-emerald-400">
										{score.total_score}
									</div>
									{#if score.fastest_time}
										<div class="text-xs text-neutral-400 flex items-center gap-1">
											<Timer class="w-3 h-3" />
											{formatTime(score.fastest_time)}
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Recent Submissions -->
		<Card class="bg-neutral-900 border-neutral-800">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 text-neutral-100">
					<TrendingUp class="w-5 h-5 text-blue-400" />
					Recent Submissions
				</CardTitle>
			</CardHeader>
			<CardContent>
				{#if recentSubmissions.length === 0}
					<div class="text-center py-8 text-neutral-400">
						<Zap class="w-8 h-8 mx-auto mb-2" />
						<p>No submissions yet</p>
					</div>
				{:else}
					<div class="space-y-2 max-h-64 overflow-y-auto">
						{#each recentSubmissions.slice(0, 10) as submission (submission.id)}
							<div class="flex items-center gap-3 p-2 bg-neutral-800 rounded border border-neutral-700">
								<div class="w-3 h-3 rounded-full {submission.is_correct ? 'bg-emerald-500' : 'bg-red-500'}"></div>
								
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<span class="font-medium text-neutral-200 text-sm">{submission.username}</span>
										<Badge variant="outline" class="text-xs">
											{submission.challenge_title}
										</Badge>
									</div>
									<div class="text-xs text-neutral-400">
										{formatTimeAgo(submission.submitted_at)} • {formatTime(submission.execution_time)}
									</div>
								</div>
								
								<div class="text-right">
									<div class="font-medium {submission.is_correct ? 'text-emerald-400' : 'text-red-400'}">
										{submission.score}%
									</div>
									{#if submission.is_correct}
										<CheckCircle class="w-3 h-3 text-emerald-400 ml-auto" />
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<!-- Quick Stats -->
		<div class="grid grid-cols-3 gap-4">
			<Card class="bg-neutral-900 border-neutral-800">
				<CardContent class="p-4 text-center">
					<Users class="w-6 h-6 mx-auto mb-2 text-blue-400" />
					<div class="text-2xl font-bold text-neutral-100">{liveScores.length}</div>
					<div class="text-xs text-neutral-400">Active Players</div>
				</CardContent>
			</Card>
			
			<Card class="bg-neutral-900 border-neutral-800">
				<CardContent class="p-4 text-center">
					<Zap class="w-6 h-6 mx-auto mb-2 text-emerald-400" />
					<div class="text-2xl font-bold text-neutral-100">{recentSubmissions.length}</div>
					<div class="text-xs text-neutral-400">Total Submissions</div>
				</CardContent>
			</Card>
			
			<Card class="bg-neutral-900 border-neutral-800">
				<CardContent class="p-4 text-center">
					<CheckCircle class="w-6 h-6 mx-auto mb-2 text-yellow-400" />
					<div class="text-2xl font-bold text-neutral-100">
						{recentSubmissions.filter(s => s.is_correct).length}
					</div>
					<div class="text-xs text-neutral-400">Correct Solutions</div>
				</CardContent>
			</Card>
		</div>

		<div class="flex justify-center">
			<Button 
				onclick={fetchLiveScores}
				disabled={isLoading}
				variant="outline"
				class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
			>
				{#if isLoading}
					<Timer class="w-4 h-4 mr-2 animate-spin" />
					Refreshing...
				{:else}
					<TrendingUp class="w-4 h-4 mr-2" />
					Refresh Scores
				{/if}
			</Button>
		</div>
	</div>
{:else}
	<!-- Regular participant view - simplified leaderboard -->
	<Card class="bg-neutral-900 border-neutral-800">
		<CardHeader>
			<CardTitle class="flex items-center gap-2 text-neutral-100">
				<Trophy class="w-5 h-5 text-yellow-400" />
				Leaderboard
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if liveScores.length === 0}
				<div class="text-center py-8 text-neutral-400">
					<Users class="w-8 h-8 mx-auto mb-2" />
					<p>No scores yet</p>
				</div>
			{:else}
				<div class="space-y-2">
					{#each liveScores.slice(0, 5) as score (score.user_id)}
						<div class="flex items-center justify-between p-2 bg-neutral-800 rounded">
							<div class="flex items-center gap-3">
								<span class="font-mono text-sm text-neutral-300">#{score.rank}</span>
								<span class="font-medium text-neutral-200">{score.username}</span>
							</div>
							<div class="font-bold text-emerald-400">{score.total_score}</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
{/if}