<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		ArrowLeft, Clock, Timer, Trophy, Users, Zap, 
		Code, Play, Send, CheckCircle, X, Target,
		RotateCcw, Eye, EyeOff
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { showSuccess, showError } from '$lib/stores/toast';
	import Editor from '$lib/components/Editor/Editor.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let lobby = $state(data.lobby);
	let challenge = $state(data.challenge);
	let lobbyChallenge = $state(data.lobbyChallenge);
	let submissions = $state(data.submissions || []);
	let standings = $state(data.standings || []);
	let currentUser = $state(data.user);

	let editor: Editor;
	let code = $state('');
	let language = $state('javascript');
	let isSubmitting = $state(false);
	let isTestRunning = $state(false);
	let showLeaderboard = $state(false);
	let timeRemaining = $state(0);
	let testResults = $state<any>(null);

	const isOwner = $derived(currentUser?.id === lobby.created_by);
	const isParticipant = $derived(lobby.lobby_users?.some((lu: any) => lu.users.id === currentUser?.id));

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

	const runTests = async () => {
		if (!editor || !challenge) {
			showError('Test Error', 'Please write some code before running tests');
			return;
		}

		const currentCode = editor.getValue();
		if (!currentCode?.trim()) {
			showError('Test Error', 'Please write some code before running tests');
			return;
		}

		isTestRunning = true;
		testResults = null;
		
		try {
			const response = await fetch('/api/code/execute', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					language,
					code: currentCode,
					challengeId: challenge.id,
					lobbyId: lobby.id
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				testResults = result;
				
				if (result.success && result.allTestsPassed) {
					showSuccess('All Tests Passed!', 'Your solution works correctly!');
				}
			} else {
				const error = await response.json();
				testResults = {
					success: false,
					error: error.error || 'Failed to run tests',
					testResults: []
				};
			}
		} catch (error) {
			console.error('Failed to run tests:', error);
			testResults = {
				success: false,
				error: 'Network error occurred',
				testResults: []
			};
		} finally {
			isTestRunning = false;
		}
	};

	const submitSolution = async () => {
		if (!editor || !challenge) {
			showError('Submission Error', 'Please write some code before submitting');
			return;
		}

		const currentCode = editor.getValue();
		if (!currentCode?.trim()) {
			showError('Submission Error', 'Please write some code before submitting');
			return;
		}

		if (!testResults || !testResults.success) {
			showError('Submission Error', 'Please run tests successfully before submitting');
			return;
		}

		isSubmitting = true;
		
		try {
			const response = await fetch(`/api/lobbies/${lobby.id}/challenge`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					challengeId: challenge.id,
					language,
					code: currentCode
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				showSuccess('Solution Submitted!', `Score: ${result.score}%`);
				
				// Refresh submissions
				await refreshData();
			} else {
				const error = await response.json();
				showError('Submission Error', error.error || 'Failed to submit solution');
			}
		} catch (error) {
			console.error('Failed to submit solution:', error);
			showError('Submission Error', 'Failed to submit solution');
		} finally {
			isSubmitting = false;
		}
	};

	const refreshData = async () => {
		try {
			// Refresh submissions and standings
			const [submissionsRes, standingsRes] = await Promise.all([
				fetch(`/api/lobbies/${lobby.id}/challenge/${challenge.id}/submissions`),
				fetch(`/api/lobbies/${lobby.id}/standings`)
			]);

			if (submissionsRes.ok) {
				const submissionsData = await submissionsRes.json();
				submissions = submissionsData.submissions || [];
			}

			if (standingsRes.ok) {
				const standingsData = await standingsRes.json();
				standings = standingsData.standings || [];
			}
		} catch (error) {
			console.error('Failed to refresh data:', error);
		}
	};

	onMount(() => {
		// Set up polling for real-time updates (every 10 seconds)
		const pollInterval = setInterval(() => {
			if (document.visibilityState === 'visible') {
				refreshData();
			}
		}, 10000);
		
		return () => {
			if (pollInterval) clearInterval(pollInterval);
		};
	});
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<!-- Header -->
	<div class="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
		<div class="max-w-7xl mx-auto flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button 
					variant="ghost" 
					size="sm" 
					onclick={() => goto(`/home/lobby/${lobby.id}`)}
					class="text-neutral-400 hover:text-neutral-100"
				>
					<ArrowLeft class="w-4 h-4 mr-2" />
					Back to Lobby
				</Button>
				
				<div class="h-6 w-px bg-neutral-700"></div>
				
				<div>
					<h1 class="text-xl font-bold">{challenge.title}</h1>
					<p class="text-sm text-neutral-400">
						{lobby.name} • {lobby.lobby_users?.length || 0} participants
					</p>
				</div>
			</div>
			
			<div class="flex items-center gap-4">
				<Badge class={getDifficultyColor(challenge.difficulty)}>
					{challenge.difficulty}
				</Badge>
				
				{#if challenge.time_limit}
					<div class="flex items-center gap-2 text-neutral-400">
						<Timer class="w-4 h-4" />
						<span>{challenge.time_limit}m</span>
					</div>
				{/if}
				
				<Button
					variant="outline"
					size="sm"
					onclick={() => showLeaderboard = !showLeaderboard}
					class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
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
					{@html (challenge.description || '').replace(/\n/g, '<br>')}
				</div>
				
				{#if challenge.input_example && challenge.output_example}
					<div class="mt-4 grid grid-cols-2 gap-4">
						<div>
							<h4 class="font-semibold text-neutral-200 mb-2">Example Input:</h4>
							<pre class="bg-neutral-800 p-3 rounded text-sm"><code>{challenge.input_example}</code></pre>
						</div>
						<div>
							<h4 class="font-semibold text-neutral-200 mb-2">Example Output:</h4>
							<pre class="bg-neutral-800 p-3 rounded text-sm"><code>{challenge.output_example}</code></pre>
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
						<select 
							bind:value={language}
							class="ml-4 bg-neutral-800 border border-neutral-700 rounded px-3 py-1 text-sm"
						>
							<option value="javascript">JavaScript</option>
							<option value="python">Python</option>
							<option value="java">Java</option>
							<option value="cpp">C++</option>
							<option value="c">C</option>
							<option value="csharp">C#</option>
							<option value="go">Go</option>
							<option value="rust">Rust</option>
						</select>
					</div>

					<div class="flex gap-2">
						<Button
							variant="outline"
							onclick={runTests}
							disabled={isTestRunning}
							class="bg-blue-600 border-blue-500 hover:bg-blue-700 text-white"
						>
							{#if isTestRunning}
								<RotateCcw class="w-4 h-4 mr-2 animate-spin" />
								Running...
							{:else}
								<Play class="w-4 h-4 mr-2" />
								Run Tests
							{/if}
						</Button>

						<Button
							onclick={submitSolution}
							disabled={isSubmitting || !isParticipant}
							class="bg-emerald-600 hover:bg-emerald-700"
						>
							{#if isSubmitting}
								<RotateCcw class="w-4 h-4 mr-2 animate-spin" />
								Submitting...
							{:else}
								<Send class="w-4 h-4 mr-2" />
								Submit Solution
							{/if}
						</Button>
					</div>
				</div>

				<!-- Monaco Code Editor -->
				<div class="flex-1 bg-neutral-950">
					<Editor
						bind:this={editor}
						bind:value={code}
						{language}
						height="100%"
						theme="vs-code-dark"
					/>
				</div>

				<!-- Test Results -->
				{#if testResults}
					<div class="p-4 bg-neutral-900 border-t border-neutral-800 max-h-48 overflow-y-auto">
						<h3 class="font-semibold text-neutral-200 mb-3 flex items-center gap-2">
							<Zap class="w-4 h-4" />
							Test Results
						</h3>
						
						{#if testResults.success}
							<div class="flex items-center gap-2 mb-3">
								<div class="w-3 h-3 rounded-full {testResults.allTestsPassed ? 'bg-emerald-500' : 'bg-yellow-500'}"></div>
								<span class="text-sm font-medium {testResults.allTestsPassed ? 'text-emerald-400' : 'text-yellow-400'}">
									{testResults.passedCount || 0}/{testResults.totalCount || 0} tests passed
								</span>
								{#if testResults.executionTime}
									<span class="text-xs text-neutral-400 ml-auto">
										{testResults.executionTime}ms
									</span>
								{/if}
							</div>
							
							{#if testResults.testResults && testResults.testResults.length > 0}
								<div class="space-y-2">
									{#each testResults.testResults as testCase, i}
										<div class="flex items-start gap-3 p-2 bg-neutral-800 rounded text-xs">
											<div class="w-2 h-2 rounded-full mt-1.5 {testCase.passed ? 'bg-emerald-500' : 'bg-rose-500'}"></div>
											<div class="flex-1">
												<div class="font-medium text-neutral-200">Test {i + 1}</div>
												{#if !testCase.passed}
													<div class="text-rose-400 mt-1">
														Expected: {testCase.expected}
													</div>
													<div class="text-rose-400">
														Got: {testCase.actual}
													</div>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						{:else}
							<div class="flex items-center gap-2 mb-2">
								<div class="w-3 h-3 rounded-full bg-rose-500"></div>
								<span class="text-sm font-medium text-rose-400">Execution Failed</span>
							</div>
							<div class="text-sm text-rose-300 bg-rose-500/10 p-2 rounded">
								{testResults.error}
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Leaderboard Sidebar -->
		{#if showLeaderboard}
			<div class="w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
				<div class="p-4 border-b border-neutral-800">
					<h2 class="font-semibold text-neutral-100 flex items-center gap-2">
						<Trophy class="w-4 h-4 text-yellow-400" />
						Live Leaderboard
					</h2>
				</div>
				
				<div class="flex-1 overflow-y-auto p-4">
					{#if standings.length > 0}
						<div class="space-y-2">
							{#each standings as standing, index}
								<div class="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
									<div class="font-mono text-sm text-neutral-300">#{index + 1}</div>
									<div class="flex-1">
										<div class="font-medium text-neutral-100">
											{standing.users?.name || 'Anonymous'}
										</div>
										<div class="text-xs text-neutral-400">
											{standing.total_score} points
										</div>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8 text-neutral-400">
							<Users class="w-8 h-8 mx-auto mb-2" />
							<p>No scores yet</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>