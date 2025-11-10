<script lang="ts">
	import { Lightbulb, MessageCircle, Settings, GripVertical } from 'lucide-svelte';
	import ProblemPanel from './ProblemPanel.svelte';
	import CodePanel from './CodePanel.svelte';
	import TestResultsPanel from './TestResultsPanel.svelte';
	import ChallengeSelector from './ChallengeSelector.svelte';
	import { onMount } from 'svelte';
	
	export let challengeId: string | null = null;
	export let challenge: any = null;
	export let editable: boolean = false;
	export let lobbyId: string | null = null;
	export let lobby: any = null;
	export let timeRemaining: number = 0;

	let challenges: any[] = [];
	let selectedChallengeId = challengeId;
	let loadingChallenges = false;
	
	let codePanel: CodePanel;
	let testResults: any = null;
	let isRunning = false;
	let isSubmitting = false;
	let sidebarWidth = 50; // Percentage
	let isDragging = false;

	onMount(() => {
		loadChallenges();
	});

	async function loadChallenges() {
		loadingChallenges = true;
		try {
			const response = await fetch('/api/challenges?limit=50');
			const data = await response.json();
			if (response.ok) {
				challenges = data.challenges || [];
			}
		} catch (error) {
			console.error('Failed to load challenges:', error);
		} finally {
			loadingChallenges = false;
		}
	}

	function selectChallenge(event: CustomEvent<string>) {
		selectedChallengeId = event.detail;
	}

	async function handleRun(event: CustomEvent<{ code: string; language: string }>) {
		if (!selectedChallengeId) return;
		
		isRunning = true;
		testResults = null;
		
		try {
			const response = await fetch('/api/code/execute', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					code: event.detail.code,
					language: event.detail.language,
					challengeId: selectedChallengeId
				})
			});
			
			const result = await response.json();
			
			if (response.ok) {
				testResults = {
					success: result.success,
					output: result.output,
					error: result.error,
					executionTime: result.executionTime,
					memory: result.memory,
					test_cases: result.testResults || [],
					allTestsPassed: result.allTestsPassed,
					passedCount: result.passedCount,
					totalCount: result.totalCount,
					total_score: result.allTestsPassed ? '100/100' : `${Math.round((result.passedCount || 0) / (result.totalCount || 1) * 100)}/100`
				};
			} else {
				testResults = {
					success: false,
					error: result.error || 'Code execution failed',
					test_cases: [],
					total_score: '0/100'
				};
			}
		} catch (error) {
			console.error('Failed to execute code:', error);
			testResults = {
				success: false,
				error: 'Failed to connect to execution server',
				test_cases: [],
				total_score: '0/100'
			};
		} finally {
			isRunning = false;
		}
	}

	async function handleSubmit(event: CustomEvent<{ code: string; language: string }>) {
		if (!selectedChallengeId) return;
		
		isSubmitting = true;
		
		try {
			// First run the code to get test results
			const executePayload: any = {
				code: event.detail.code,
				language: event.detail.language,
				challengeId: selectedChallengeId
			};

			// Add lobby context if this is a multiplayer session
			if (lobbyId) {
				executePayload.lobbyId = lobbyId;
				executePayload.isMultiplayer = true;
			}

			const response = await fetch('/api/code/execute', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(executePayload)
			});
			
			const result = await response.json();
			
			if (response.ok) {
				// Update test results
				testResults = {
					success: result.success,
					output: result.output,
					error: result.error,
					executionTime: result.executionTime,
					memory: result.memory,
					test_cases: result.testResults || [],
					allTestsPassed: result.allTestsPassed,
					passedCount: result.passedCount,
					totalCount: result.totalCount,
					total_score: result.allTestsPassed ? '100/100' : `${Math.round((result.passedCount || 0) / (result.totalCount || 1) * 100)}/100`
				};
				
				// Show submission result based on context
				if (lobbyId && lobby) {
					// Multiplayer submission
					if (result.allTestsPassed) {
						alert('🎉 Perfect! All test cases passed in the lobby challenge!');
						
						// Check if this is the winning submission
						if (result.isFirstToSolve) {
							alert('🏆 Congratulations! You are the first to solve this challenge in the lobby!');
						}
					} else {
						alert(`⚠️ ${result.passedCount || 0}/${result.totalCount || 0} test cases passed. Time remaining: ${formatTimeFromMs(timeRemaining)}. Keep trying!`);
					}
				} else {
					// Single player submission
					if (result.allTestsPassed) {
						alert('🎉 Congratulations! All test cases passed. Solution submitted successfully!');
					} else {
						alert(`⚠️ ${result.passedCount || 0}/${result.totalCount || 0} test cases passed. Keep trying!`);
					}
				}
			} else {
				alert('❌ Submission failed: ' + (result.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Failed to submit code:', error);
			alert('❌ Submission failed: Network error');
		} finally {
			isSubmitting = false;
		}
	}

	function formatTimeFromMs(milliseconds: number): string {
		const totalSeconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	function handleMouseDown() {
		isDragging = true;
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		const newWidth = (e.clientX / window.innerWidth) * 100;
		sidebarWidth = Math.max(25, Math.min(75, newWidth));
	}

	function handleMouseUp() {
		isDragging = false;
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}

	export function getCode() {
		return codePanel?.getCode() || '';
	}
	
	export function getLanguage() {
		return codePanel?.getLanguage() || 'javascript';
	}
</script>

<div class="h-screen bg-neutral-900 flex flex-col">
	<!-- Top Navigation Bar -->
	<nav class="bg-neutral-900 border-b border-neutral-700 px-4 py-2 flex items-center justify-between">
		<div class="flex items-center gap-6">
			<a href="/" class="text-lg font-bold text-neutral-100">CodeOut</a>
			<span class="text-neutral-500">|</span>
			
			<!-- Challenge Selector -->
			<ChallengeSelector 
				{challenges} 
				selectedId={selectedChallengeId}
				on:select={selectChallenge}
			/>
		</div>
		
		<div class="flex items-center gap-2">
			<button class="flex items-center gap-1.5 text-gray-300 hover:text-white px-2.5 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
				<Lightbulb size={14} />
				Hint
			</button>
			<button class="flex items-center gap-1.5 text-gray-300 hover:text-white px-2.5 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
				<MessageCircle size={14} />
				Discuss
			</button>
			<button class="flex items-center gap-1.5 text-gray-300 hover:text-white px-2.5 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
				<Settings size={14} />
				Settings
			</button>
		</div>
	</nav>

	<!-- Main Content Area -->
	<div class="flex-1 flex min-h-0 relative">
		<!-- Problem Description Panel -->
		<div class="flex flex-col min-h-0 bg-neutral-900" style="width: {sidebarWidth}%">
			<ProblemPanel challengeId={selectedChallengeId} {challenge} {editable} />
		</div>

		<!-- Resize Handle -->
		<button
			class="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize flex items-center justify-center group transition-colors"
			on:mousedown={handleMouseDown}
			aria-label="Resize panels"
		>
			<GripVertical size={16} class="text-gray-500 group-hover:text-gray-400" />
		</button>

		<!-- Code Editor Panel -->
		<div class="flex flex-col min-h-0 bg-gray-900" style="width: {100 - sidebarWidth}%">
			<!-- Code Editor -->
			<div class="flex-1 min-h-0">
				<CodePanel 
					bind:this={codePanel}
					on:run={handleRun}
					on:submit={handleSubmit}
				/>
			</div>
			
			<!-- Test Results Panel -->
			<TestResultsPanel results={testResults} {isRunning} />
		</div>
	</div>
</div>