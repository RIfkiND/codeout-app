<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		Clock, Users, Trophy, Zap, CheckCircle, X, Play, 
		Timer, Code, Send, RefreshCcw, Eye, EyeOff, ArrowLeft,
		Target, Award, Crown
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { showSuccess, showError } from '$lib/stores/toast';
	import Editor from '$lib/components/Editor/Editor.svelte';

	interface Challenge {
		id: string;
		title: string;
		description: string;
		difficulty: string;
		time_limit: number | null;
		testcases: unknown;
		input_example: string | null;
		output_example: string | null;
	}

	interface LobbyChallenge {
		id: string;
		challenge_id: string;
		challenge_order: number;
		status: string;
		started_at: string | null;
		challenges: Challenge;
	}

	interface Lobby {
		id: string;
		name: string;
		description: string | null;
		status: string;
		max_participants: number;
		is_private: boolean;
		created_at: string;
		time_limit_minutes: number | null;
		created_by: string;
		end_time: string | null;
		lobby_users: any[] | null;
		lobby_challenges: LobbyChallenge[] | null;
	}

	interface ChallengePageData {
		lobby: Lobby;
		activeChallenge: LobbyChallenge | undefined;
		submissions: any[];
		standings: any[];
		user: any;
		isParticipant: boolean;
		isOwner: boolean;
		session: any;
	}

	interface Props {
		data: ChallengePageData;
	}

	let { data }: Props = $props();

	let currentChallenge = $state(data.activeChallenge?.challenges || null);
	let lobbyData = $state(data.lobby);
	let submissions = $state(data.submissions);
	let standings = $state(data.standings);
	let codeEditor = $state<Editor | null>(null);
	let isSubmitting = $state(false);
	let isTestRunning = $state(false);
	let showLeaderboard = $state(false);
	let timeRemaining = $state(0);
	let interval: NodeJS.Timeout | null = null;
	let testResults = $state<any>(null);
	let currentCode = $state('');
	let selectedLanguage = $state('javascript');

	const fetchLobbyData = async () => {
		try {
			const response = await fetch(`/api/lobbies/${lobbyData.id}`);
			if (response.ok) {
				const updatedData = await response.json();
				lobbyData = updatedData.lobby;
				
				// Update active challenge
				const activeChallenge = lobbyData.lobby_challenges?.find((lc: any) => lc.status === 'active');
				if (activeChallenge) {
					currentChallenge = activeChallenge.challenges;
				}
			}
		} catch (error) {
			console.error('Failed to fetch lobby data:', error);
		}
	};

	const runTests = async () => {
		if (!currentChallenge || !codeEditor) {
			showError('Test Error', 'Please write some code before running tests');
			return;
		}

		const code = codeEditor.getValue();
		if (!code?.trim()) {
			showError('Test Error', 'Please write some code before running tests');
			return;
		}

		isTestRunning = true;
		testResults = null;
		
		try {
			const response = await fetch('/api/code/run', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language: selectedLanguage,
					code,
					challengeId: currentChallenge.id
				})
			});

			if (response.ok) {
				const result = await response.json();
				testResults = result;
				
				if (result.success && result.allTestsPassed) {
					showSuccess('All Tests Passed!', 'Your solution passed all test cases');
				}
			} else {
				const error = await response.json();
				testResults = {
					success: false,
					error: error.error || 'Failed to execute code'
				};
			}
		} catch (error) {
			console.error('Test execution failed:', error);
			testResults = {
				success: false,
				error: 'Network error occurred'
			};
		} finally {
			isTestRunning = false;
		}
	};

	const submitSolution = async () => {
		if (!currentChallenge || !codeEditor) {
			showError('Submission Error', 'Please write some code before submitting');
			return;
		}

		const code = codeEditor.getValue();
		if (!code?.trim()) {
			showError('Submission Error', 'Please write some code before submitting');
			return;
		}

		isSubmitting = true;
		
		try {
			// First execute the code to get test results
			const executeResponse = await fetch('/api/code/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language: selectedLanguage,
					code,
					challengeId: currentChallenge.id,
					lobbyId: lobbyData.id
				})
			});

			if (!executeResponse.ok) {
				const error = await executeResponse.json();
				throw new Error(error.error || 'Failed to execute code');
			}

			const executeResult = await executeResponse.json();
			
			// Then submit to lobby with the execution results
			const submitResponse = await fetch(`/api/lobbies/${lobbyData.id}/challenge`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					challengeId: currentChallenge.id,
					language: selectedLanguage,
					code,
					executionTime: executeResult.executionTime || 0,
					score: executeResult.allTestsPassed ? 100 : Math.round((executeResult.passedCount / executeResult.totalCount) * 100),
					testResults: executeResult.testResults,
					isCorrect: executeResult.allTestsPassed
				})
			});

			if (submitResponse.ok) {
				const result = await submitResponse.json();
				const score = executeResult.allTestsPassed ? 100 : Math.round((executeResult.passedCount / executeResult.totalCount) * 100);
				showSuccess('Solution Submitted!', `Score: ${score}% (${executeResult.passedCount}/${executeResult.totalCount} tests passed)`);
				
				// Update test results display
				testResults = executeResult;
				
				// Refresh lobby data
				await fetchLobbyData();
			} else {
				const error = await submitResponse.json();
				showError('Submission Failed', error.error || 'Failed to submit solution');
			}
		} catch (error) {
			console.error('Submission failed:', error);
			showError('Submission Error', error instanceof Error ? error.message : 'Failed to submit solution');
		} finally {
			isSubmitting = false;
		}
	};

	const updateTimer = () => {
		if (lobbyData?.end_time) {
			const endTime = new Date(lobbyData.end_time).getTime();
			const now = Date.now();
			const remaining = Math.max(0, endTime - now);
			timeRemaining = Math.floor(remaining / 1000);
			
			if (timeRemaining <= 0 && interval) {
				clearInterval(interval);
				interval = null;
				showError('Time Up', 'The challenge time has expired');
			}
		}
	};

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case 'easy': return 'bg-emerald-500/20 text-emerald-400';
			case 'medium': return 'bg-amber-500/20 text-amber-400';
			case 'hard': return 'bg-red-500/20 text-red-400';
			default: return 'bg-neutral-500/20 text-neutral-400';
		}
	};

	onMount(() => {
		// Set up polling for real-time updates every 15 seconds
		const pollInterval = setInterval(fetchLobbyData, 15000);
		
		// Set up timer if lobby has end time
		if (lobbyData?.end_time) {
			interval = setInterval(updateTimer, 1000);
			updateTimer();
		}

		return () => {
			clearInterval(pollInterval);
			if (interval) clearInterval(interval);
		};
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<!-- Header -->
	<div class="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
		<div class="max-w-7xl mx-auto p-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<Button 
						variant="ghost" 
						size="sm" 
						onclick={() => goto('/home/lobby')}
						class="text-neutral-400 hover:text-neutral-100"
					>
						<ArrowLeft class="w-4 h-4 mr-2" />
						Back to Lobbies
					</Button>
					
					<div class="flex items-center gap-3">
						<h1 class="text-xl font-bold">{lobbyData.name}</h1>
						{#if currentChallenge}
							<Badge class={getDifficultyColor(currentChallenge.difficulty)}>
								{currentChallenge.difficulty}
							</Badge>
						{/if}
					</div>
				</div>
				
				<div class="flex items-center gap-4">
					{#if timeRemaining > 0}
						<div class="flex items-center gap-2 text-amber-400">
							<Timer class="w-4 h-4" />
							<span class="font-mono">{formatTime(timeRemaining)}</span>
						</div>
					{/if}
					
					<Button
						variant="outline"
						onclick={() => showLeaderboard = !showLeaderboard}
						class="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
					>
						{#if showLeaderboard}
							<EyeOff class="w-4 h-4 mr-2" />
						{:else}
							<Eye class="w-4 h-4 mr-2" />
						{/if}
						{showLeaderboard ? 'Hide' : 'Show'} Leaderboard
					</Button>
				</div>
			</div>
		</div>
	</div>

	<div class="flex h-[calc(100vh-5rem)]">
		<!-- Main coding area -->
		<div class="flex-1 flex flex-col">
			{#if currentChallenge}
				<!-- Problem description -->
				<div class="p-6 bg-neutral-900 border-b border-neutral-800 max-h-64 overflow-y-auto">
					<h2 class="text-2xl font-bold mb-4">{currentChallenge.title}</h2>
					<div class="prose prose-invert prose-sm max-w-none">
						{@html (currentChallenge.description || '').replace(/\n/g, '<br>')}
					</div>
					
					{#if currentChallenge.input_example && currentChallenge.output_example}
						<div class="mt-4 grid grid-cols-2 gap-4">
							<div>
								<h4 class="font-semibold text-neutral-200 mb-2">Example Input:</h4>
								<pre class="bg-neutral-800 p-3 rounded text-sm"><code>{currentChallenge.input_example}</code></pre>
							</div>
							<div>
								<h4 class="font-semibold text-neutral-200 mb-2">Example Output:</h4>
								<pre class="bg-neutral-800 p-3 rounded text-sm"><code>{currentChallenge.output_example}</code></pre>
							</div>
						</div>
					{/if}
				</div>
				
				<!-- Code editor area -->
				<div class="flex-1 flex flex-col">
					<!-- Header with Run/Submit buttons -->
					<div class="flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
						<div class="flex items-center gap-2">
							<Code class="w-5 h-5 text-emerald-400" />
							<span class="font-semibold text-neutral-100">Code Editor</span>
						</div>

						<div class="flex gap-2">
							<Button
								variant="outline"
								onclick={runTests}
								disabled={isTestRunning}
								class="bg-blue-600 border-blue-500 hover:bg-blue-700 text-white"
							>
								{#if isTestRunning}
									<RefreshCcw class="w-4 h-4 mr-2 animate-spin" />
									Running...
								{:else}
									<Play class="w-4 h-4 mr-2" />
									Run Tests
								{/if}
							</Button>

							<Button
								onclick={submitSolution}
								disabled={isSubmitting}
								class="bg-emerald-600 hover:bg-emerald-700"
							>
								{#if isSubmitting}
									<RefreshCcw class="w-4 h-4 mr-2 animate-spin" />
									Submitting...
								{:else}
									<Send class="w-4 h-4 mr-2" />
									Submit Solution
								{/if}
							</Button>
						</div>
					</div>

					<!-- Monaco Code Editor -->
					<div class="flex-1 p-4 bg-neutral-950">
						<Editor
							bind:this={codeEditor}
							bind:value={currentCode}
							language={selectedLanguage}
							height="100%"
						/>
					</div>

					{#if testResults}
						<div class="p-4 bg-neutral-900 border-t border-neutral-800 max-h-48 overflow-y-auto">
							<h3 class="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
								<Zap class="w-4 h-4" />
								Test Results
							</h3>
							
							{#if testResults.success}
								<div class="space-y-2">
									<div class="flex items-center gap-2">
										<div class="w-3 h-3 rounded-full {testResults.allTestsPassed ? 'bg-emerald-500' : 'bg-amber-500'}"></div>
										<span class="text-sm font-medium {testResults.allTestsPassed ? 'text-emerald-400' : 'text-amber-400'}">
											{testResults.passedCount || 0}/{testResults.totalCount || 0} tests passed
										</span>
									</div>
									
									{#if testResults.testResults && testResults.testResults.length > 0}
										<div class="space-y-1">
											{#each testResults.testResults as result, i}
												<div class="text-xs p-2 bg-neutral-800 rounded">
													<span class="text-neutral-300">Test {i + 1}:</span>
													<span class="{result.passed ? 'text-emerald-400' : 'text-red-400'}">
														{result.passed ? 'PASSED' : 'FAILED'}
													</span>
													{#if !result.passed && result.expected && result.actual}
														<div class="mt-1">
															<div class="text-red-400">Expected: {result.expected}</div>
															<div class="text-red-400">Got: {result.actual}</div>
														</div>
													{/if}
												</div>
											{/each}
										</div>
									{/if}
								</div>
							{:else}
								<div class="text-red-400 text-sm bg-red-500/10 p-3 rounded">
									Error: {testResults.error}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{:else}
				<!-- No active challenge -->
				<div class="flex-1 flex items-center justify-center">
					<div class="text-center">
						<Clock class="w-16 h-16 mx-auto mb-4 text-neutral-500" />
						<h2 class="text-2xl font-bold mb-2">Waiting for Challenge</h2>
						<p class="text-neutral-400 mb-6">
							The lobby owner hasn't started a challenge yet.
						</p>
						<Button onclick={() => goto(`/home/lobby/${lobbyData.id}`)}>
							<ArrowLeft class="w-4 h-4 mr-2" />
							Go to Lobby
						</Button>
					</div>
				</div>
			{/if}
		</div>
		
		<!-- Sidebar (Leaderboard) -->
		{#if showLeaderboard}
			<div class="w-80 bg-neutral-900 border-l border-neutral-800 p-4">
				<h3 class="text-lg font-bold mb-4 flex items-center gap-2">
					<Trophy class="w-5 h-5 text-yellow-400" />
					Leaderboard
				</h3>
				
				{#if standings.length > 0}
					<div class="space-y-2">
						{#each standings as standing, index}
							<div class="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg">
								<div class="text-sm font-mono text-neutral-400">#{index + 1}</div>
								<div class="flex-1">
									<div class="font-medium text-neutral-200">
										{standing.users?.name || standing.users?.email || 'Anonymous'}
										{#if standing.users?.id === data.user?.id}
											<span class="text-emerald-400 text-sm">(You)</span>
										{/if}
									</div>
									<div class="text-xs text-neutral-400">
										{standing.challenges_completed} challenges completed
									</div>
								</div>
								<div class="text-right">
									<div class="font-bold text-emerald-400">{standing.total_score}</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-neutral-400">
						<Trophy class="w-8 h-8 mx-auto mb-2 opacity-50" />
						<p>No scores yet</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>