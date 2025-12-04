<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { 
		Clock, Users, Trophy, Zap, CheckCircle, X, Play, 
		Timer, Code, Send, RefreshCcw, Eye, EyeOff 
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import { showSuccess, showError } from '$lib/stores/toast';
	import CodeEditor from '$lib/components/Editor/CodeEditor.svelte';

	interface Props {
		lobbyId: string;
		initialData?: any;
	}

	interface Challenge {
		id: string;
		title: string;
		description: string;
		difficulty: string;
		input_example?: string;
		output_example?: string;
		testcases?: any[];
	}

	interface TestResult {
		passed: boolean;
		expected?: string;
		actual?: string;
	}

	interface ExecutionResult {
		success: boolean;
		error?: string;
		testResults?: TestResult[];
		executionTime?: number;
		score?: number;
	}

	let { lobbyId, initialData = null }: Props = $props();

	let challengeData = $state(initialData);
	let currentChallenge = $state<Challenge | null>(null);
	let submissions = $state<any[]>([]);
	let standings = $state<any[]>([]);
	let codeEditor = $state<CodeEditor | null>(null);
	let isSubmitting = $state(false);
	let isTestRunning = $state(false);
	let showLeaderboard = $state(false);
	let timeRemaining = $state(0);
	let interval: NodeJS.Timeout | null = null;
	let testResults = $state<ExecutionResult | null>(null);

	let isLoading = $state(false);
	let hasInitialLoad = $state(false);

	const fetchChallengeData = async () => {
		// Prevent concurrent requests
		if (isLoading) return;
		
		isLoading = true;
		try {
			const response = await fetch(`/api/lobbies/${lobbyId}/challenge`);
			if (response.ok) {
				const data = await response.json();
				challengeData = data;
				
				// Set current challenge from lobby data
				if (data.lobby?.challenges) {
					currentChallenge = data.lobby.challenges;
				} else if (data.lobby?.lobby_challenges?.length > 0) {
					// Get current active challenge
					const activeChallenges = data.lobby.lobby_challenges.filter((lc: any) => lc.status === 'active');
					if (activeChallenges.length > 0) {
						currentChallenge = activeChallenges[0].challenges;
					}
				}

				submissions = data.submissions || [];
				standings = data.standings || [];
				hasInitialLoad = true;
			} else {
				if (response.status === 404) {
					console.log('No challenge data available yet');
				} else {
					console.error('Failed to fetch challenge data - HTTP', response.status);
				}
			}
		} catch (error) {
			console.error('Failed to fetch challenge data:', error);
			// Only show error on initial load failure
			if (!hasInitialLoad) {
				showError('Load Error', 'Failed to load challenge data');
			}
		} finally {
			isLoading = false;
		}
	};
 
	const runTests = async () => {
		if (!currentChallenge || !codeEditor) {
			showError('Test Error', 'Please write some code before running tests');
			return;
		}

		const code = codeEditor.getCode();
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
					language: codeEditor.getLanguage(),
					code,
					challengeId: (currentChallenge as Challenge).id
				})
			});

			if (response.ok) {
				const result = await response.json();
				testResults = result;
				
				if (result.success) {
					const passedTests = result.testResults?.filter((tr: any) => tr.passed)?.length || 0;
					const totalTests = result.testResults?.length || 0;
					
					if (passedTests === totalTests) {
						showSuccess('Tests Passed', `All ${totalTests} tests passed!`);
					} else {
						showError('Tests Failed', `${passedTests}/${totalTests} tests passed`);
					}
				} else {
					showError('Execution Error', result.error || 'Failed to run tests');
				}
			} else {
				const errorData = await response.json();
				showError('Test Error', errorData.error || 'Failed to run tests');
			}
		} catch (error) {
			console.error('Test execution error:', error);
			showError('Test Error', 'Failed to execute tests');
		} finally {
			isTestRunning = false;
		}
	};

	const submitSolution = async () => {
		if (!currentChallenge || !codeEditor) {
			showError('Submission Error', 'Please write some code before submitting');
			return;
		}

		const code = codeEditor.getCode();
		if (!code?.trim()) {
			showError('Submission Error', 'Please write some code before submitting');
			return;
		}

		isSubmitting = true;
		
		try {
			const response = await fetch('/api/code/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					language: codeEditor.getLanguage(),
					code,
					challengeId: (currentChallenge as Challenge).id,
					lobbyId
				})
			});

			if (response.ok) {
				const result = await response.json();
				
				// Submit to lobby
				const lobbyResponse = await fetch(`/api/lobbies/${lobbyId}/challenge`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						challengeId: (currentChallenge as Challenge).id,
						code,
						language: codeEditor.getLanguage(),
						executionTime: result.executionTime || 0,
						score: result.score || 0,
						testResults: result.testResults || []
					})
				});

				if (lobbyResponse.ok) {
					const submissionResult = await lobbyResponse.json();
					showSuccess('Solution Submitted', 'Your solution has been submitted successfully!');
					
					// Refresh challenge data to get updated standings
					await fetchChallengeData();
				} else {
					const errorData = await lobbyResponse.json();
					showError('Submission Error', errorData.error || 'Failed to submit solution');
				}
			} else {
				const errorData = await response.json();
				showError('Execution Error', errorData.error || 'Failed to execute code');
			}
		} catch (error) {
			console.error('Submission error:', error);
			showError('Submission Error', 'Failed to submit solution');
		} finally {
			isSubmitting = false;
		}
	};

	const updateTimer = () => {
		if (challengeData?.lobby?.end_time) {
			const endTime = new Date(challengeData.lobby.end_time).getTime();
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
		// Initial load
		fetchChallengeData();
		
		// Set up reduced polling for real-time updates (every 15 seconds instead of 5)
		const pollInterval = setInterval(fetchChallengeData, 15000);
		
		// Set up timer
		if (challengeData?.lobby?.end_time) {
			interval = setInterval(updateTimer, 1000);
			updateTimer();
		}
		
		// Cleanup function
		return () => {
			clearInterval(pollInterval);
			if (interval) clearInterval(interval);
		};
	});

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	});
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	{#if currentChallenge}
		<!-- Header with timer and challenge info -->
		<div class="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<h1 class="text-2xl font-bold text-neutral-100">{(currentChallenge as Challenge)?.title || 'Loading...'}</h1>
					<Badge class={getDifficultyColor((currentChallenge as Challenge)?.difficulty || 'medium')}>
						{(currentChallenge as Challenge)?.difficulty || 'Medium'}
					</Badge>
				</div>				<div class="flex items-center gap-4">
					{#if timeRemaining > 0}
						<div class="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-lg">
							<Timer class="w-4 h-4 text-amber-400" />
							<span class="font-mono text-amber-400">{formatTime(timeRemaining)}</span>
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

		<div class="flex h-[calc(100vh-5rem)]">
			<!-- Main coding area -->
			<div class="flex-1 flex flex-col">
				<!-- Problem description -->
				<div class="p-6 bg-neutral-900 border-b border-neutral-800 max-h-64 overflow-y-auto">
				<div class="prose prose-invert prose-sm max-w-none">
					{#if isLoading && !hasInitialLoad}
						<div class="flex items-center gap-3 text-neutral-400 py-8">
							<div class="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
							<div>
								<p class="text-lg font-medium">Loading Challenge...</p>
								<p class="text-sm">Preparing your coding environment</p>
							</div>
						</div>
					{:else if currentChallenge?.description}
						{@html ((currentChallenge as Challenge)?.description || '').replace(/\n/g, '<br>')}
					{:else if hasInitialLoad}
						<div class="flex items-center gap-2 text-neutral-400 py-4">
							<Zap class="w-4 h-4" />
							<span>No challenge selected yet. Waiting for lobby owner to start a challenge.</span>
						</div>
					{:else}
						<div class="flex items-center gap-2 text-neutral-400 py-4">
							<Clock class="w-4 h-4 animate-pulse" />
							<span>Connecting...</span>
						</div>
					{/if}
				</div>					{#if (currentChallenge as Challenge)?.input_example && (currentChallenge as Challenge)?.output_example}
						<div class="mt-4 grid grid-cols-2 gap-4">
							<div>
								<h4 class="font-semibold text-neutral-200 mb-2">Example Input:</h4>
								<pre class="bg-neutral-800 p-3 rounded text-sm"><code>{(currentChallenge as Challenge)?.input_example}</code></pre>
							</div>
							<div>
								<h4 class="font-semibold text-neutral-200 mb-2">Example Output:</h4>
								<pre class="bg-neutral-800 p-3 rounded text-sm"><code>{(currentChallenge as Challenge)?.output_example}</code></pre>
							</div>
						</div>
					{/if}
				</div>				<!-- Code editor area -->
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
						{#if currentChallenge}
							<CodeEditor
								bind:this={codeEditor}
								challengeId={(currentChallenge as Challenge).id}
								{lobbyId}
								onExecute={(result) => {
									testResults = result;
									if (result.success && result.allTestsPassed) {
										showSuccess('All Tests Passed!', 'Your solution passed all test cases');
									}
								}}
							/>
						{/if}
					</div>

					{#if testResults}
						<div class="p-4 bg-neutral-900 border-t border-neutral-800 max-h-48 overflow-y-auto">
							<h3 class="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
								<Zap class="w-4 h-4" />
								Test Results
							</h3>
							
							{#if (testResults as ExecutionResult)?.success}
								<div class="space-y-2">
									{#each (testResults as ExecutionResult)?.testResults || [] as result, index}
										<div class="flex items-center gap-3 p-2 rounded bg-neutral-800">
											{#if (result as TestResult).passed}
												<CheckCircle class="w-4 h-4 text-emerald-400" />
											{:else}
												<X class="w-4 h-4 text-red-400" />
											{/if}
											
											<span class="text-sm font-medium">Test {index + 1}</span>
											
											{#if !(result as TestResult).passed}
												<div class="text-xs text-red-400 ml-auto">
													<div>Expected: {(result as TestResult).expected}</div>
													<div>Got: {(result as TestResult).actual}</div>
												</div>
											{:else}
												<span class="text-xs text-emerald-400 ml-auto">Passed</span>
											{/if}
										</div>
									{/each}
								</div>
								
								<div class="mt-3 flex items-center justify-between text-xs text-neutral-400">
									<span>
										{(testResults as ExecutionResult)?.testResults?.filter((tr: any) => tr.passed).length || 0} / 
										{(testResults as ExecutionResult)?.testResults?.length || 0} tests passed
									</span>
									{#if (testResults as ExecutionResult)?.executionTime}
										<span>Runtime: {(testResults as ExecutionResult)?.executionTime}ms</span>
									{/if}
								</div>
							{:else}
								<div class="p-3 bg-red-500/10 border border-red-500/20 rounded">
									<div class="flex items-center gap-2 mb-2">
										<X class="w-4 h-4 text-red-400" />
										<span class="font-medium text-red-400">Execution Failed</span>
									</div>
									<p class="text-red-300 text-sm">{(testResults as ExecutionResult)?.error}</p>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<!-- Leaderboard sidebar -->
			{#if showLeaderboard}
				<div class="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
					<div class="p-4 border-b border-neutral-800">
						<h2 class="text-lg font-semibold text-neutral-100 flex items-center gap-2">
							<Trophy class="w-5 h-5 text-amber-400" />
							Live Rankings
						</h2>
					</div>

					<div class="flex-1 overflow-y-auto p-4">
						{#if standings.length > 0}
							<div class="space-y-3">
								{#each standings as standing, index}
									<div class="flex items-center gap-3 p-3 rounded-lg bg-neutral-800 border border-neutral-700">
										<div class="text-lg font-bold text-neutral-400 w-6">
											#{standing.final_rank || index + 1}
										</div>
										
										<div class="flex-1">
											<div class="font-medium text-neutral-200">
												{standing.users?.name || standing.users?.email || 'Anonymous'}
											</div>
											<div class="text-xs text-neutral-400">
												{standing.challenges_completed}/{challengeData?.lobby?.total_challenges || 1} completed
											</div>
										</div>
										
										<div class="text-right">
											<div class="text-sm font-medium text-emerald-400">
												{standing.total_score} pts
											</div>
											{#if standing.average_completion_time_ms}
												<div class="text-xs text-neutral-400">
													{Math.round(standing.average_completion_time_ms / 1000)}s avg
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="text-center text-neutral-400 py-8">
								<Trophy class="w-12 h-12 mx-auto mb-3 opacity-50" />
								<p>No rankings yet</p>
								<p class="text-sm">Complete challenges to see rankings</p>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Loading state -->
		<div class="flex items-center justify-center min-h-screen">
			<div class="text-center">
				<RefreshCcw class="w-12 h-12 mx-auto mb-4 animate-spin text-emerald-400" />
				<h2 class="text-xl font-semibold text-neutral-100">Loading Challenge...</h2>
				<p class="text-neutral-400 mt-2">Preparing your coding environment</p>
			</div>
		</div>
	{/if}
</div>