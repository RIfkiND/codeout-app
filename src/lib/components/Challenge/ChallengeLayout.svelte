<script lang="ts">
	import { Lightbulb, MessageCircle, Settings, GripVertical } from 'lucide-svelte';
	import ProblemPanel from './ProblemPanel.svelte';
	import CodePanel from './CodePanel.svelte';
	import TestResultsPanel from './TestResultsPanel.svelte';
	import ChallengeSelector from './ChallengeSelector.svelte';
	import { onMount } from 'svelte';
	
	interface ChallengeLayoutProps {
		challengeId?: string | null;
		challenge?: any;
		editable?: boolean;
		lobbyId?: string | null;
		lobby?: any;
		timeRemaining?: number;
	}

	let { 
		challengeId = null,
		challenge = null,
		editable = false,
		lobbyId = null,
		lobby = null,
		timeRemaining = 0
	}: ChallengeLayoutProps = $props();

	let challenges: any[] = $state([]);
	let selectedChallengeId = $state(challengeId);
	let loadingChallenges = $state(false);
	
	let codePanel = $state<CodePanel | null>(null);
	let testResults: any = $state(null);
	let isRunning = $state(false);
	let isSubmitting = $state(false);
	let sidebarWidth = $state(50); // Percentage
	let isDragging = $state(false);

	onMount(() => {
		loadChallenges();
	});

	// Update selectedChallengeId when challengeId prop changes
	$effect(() => {
		console.log('Effect: challengeId prop changed to:', challengeId);
		selectedChallengeId = challengeId;
		
		// If we have a specific challengeId but challenges aren't loaded yet, load them
		if (challengeId && challenges.length === 0 && !loadingChallenges) {
			loadChallenges();
		}
	});

	async function loadChallenges() {
		loadingChallenges = true;
		try {
			const response = await fetch('/api/challenges?limit=50');
			const data = await response.json();
			if (response.ok) {
				challenges = data.challenges || [];
				
				// Auto-select first challenge if none is selected and we're not in a specific challenge context
				if (!selectedChallengeId && challenges.length > 0 && !challengeId) {
					selectedChallengeId = challenges[0].id;
				}
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
		console.log('handleRun called with challengeId:', selectedChallengeId);
		console.log('Available challenges:', challenges.length);
		console.log('Loading challenges:', loadingChallenges);
		
		// Wait for challenges to load if they're currently loading
		if (loadingChallenges) {
			console.log('handleRun: Waiting for challenges to load...');
			testResults = {
				success: false,
				error: 'Loading challenges... Please wait and try again.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		// Prevent API call if no valid challengeId
		if (!selectedChallengeId || selectedChallengeId === 'null' || selectedChallengeId === 'undefined') {
			console.error('handleRun: Invalid challengeId:', selectedChallengeId);
			
			// Try to auto-select first available challenge
			if (challenges.length > 0) {
				selectedChallengeId = challenges[0].id;
				console.log('Auto-selected challenge for run:', selectedChallengeId);
				// Retry with selected challenge after a short delay
				setTimeout(() => handleRun(event), 100);
				return;
			}
			
			// If no challenges available, show error
			testResults = {
				success: false,
				error: 'No challenge available. Please load challenges first or check your connection.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		// Validate code and language
		if (!event.detail.code || !event.detail.code.trim()) {
			testResults = {
				success: false,
				error: 'Please write some code before running tests.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		if (!event.detail.language) {
			testResults = {
				success: false,
				error: 'Programming language not specified.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		const payload = {
			language: event.detail.language,
			code: event.detail.code,
			challengeId: selectedChallengeId
		};
		
		console.log('handleRun: Sending payload to /api/code/run:', {
			language: payload.language || 'MISSING',
			code: payload.code ? `present (${payload.code.length} chars)` : 'MISSING',
			challengeId: payload.challengeId || 'MISSING'
		});
		
		isRunning = true;
		testResults = null;
		
		try {
			const response = await fetch('/api/code/run', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
			
			const result = await response.json();
			
			if (response.ok) {
				testResults = {
					success: result.success,
					output: result.output,
					error: result.error,
					executionTime: result.executionTime,
					memory: result.memory,
					test_cases: result.testResults || result.result?.test_cases || [],
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
			console.error('Failed to run code:', error);
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
		console.log('handleSubmit called with challengeId:', selectedChallengeId);
		console.log('Available challenges:', challenges.length);
		console.log('Loading challenges:', loadingChallenges);
		
		// Wait for challenges to load if they're currently loading
		if (loadingChallenges) {
			console.log('handleSubmit: Waiting for challenges to load...');
			testResults = {
				success: false,
				error: 'Loading challenges... Please wait and try again.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		// SUBMIT requires a valid challenge - no auto-selection for submissions
		if (!selectedChallengeId || selectedChallengeId === 'null' || selectedChallengeId === 'undefined') {
			console.error('handleSubmit: Invalid challengeId for submission:', selectedChallengeId);
			
			testResults = {
				success: false,
				error: 'Cannot submit: No challenge selected. Please select a valid challenge before submitting your solution.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		// Validate code and language for submission
		if (!event.detail.code || !event.detail.code.trim()) {
			testResults = {
				success: false,
				error: 'Cannot submit: Please write some code before submitting.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		if (!event.detail.language) {
			testResults = {
				success: false,
				error: 'Cannot submit: Programming language not specified.',
				test_cases: [],
				total_score: '0/100'
			};
			return;
		}
		
		isSubmitting = true;
		
		try {
			// Submit the code (this will run tests AND save to database)
			const submitPayload: any = {
				code: event.detail.code,
				language: event.detail.language,
				challengeId: selectedChallengeId
			};

			// Add lobby context if this is a multiplayer session
			if (lobbyId) {
				submitPayload.lobbyId = lobbyId;
			}
			
			console.log('handleSubmit: Sending payload to /api/code/submit:', {
				language: submitPayload.language || 'MISSING',
				code: submitPayload.code ? `present (${submitPayload.code.length} chars)` : 'MISSING',
				challengeId: submitPayload.challengeId || 'MISSING',
				lobbyId: submitPayload.lobbyId || 'not provided'
			});

			const response = await fetch('/api/code/submit', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(submitPayload)
			});
			
			const result = await response.json();
			
			if (response.ok) {
				// Update test results with submission result
				testResults = {
					success: result.success,
					submitted: result.submitted,
					output: result.output,
					error: result.error,
					executionTime: result.executionTime,
					memory: result.memory,
					test_cases: result.testResults || result.result?.test_cases || [],
					allTestsPassed: result.allTestsPassed,
					passedCount: result.passedCount,
					totalCount: result.totalCount,
					isFirstToSolve: result.isFirstToSolve,
					isMultiplayer: result.isMultiplayer,
					total_score: result.allTestsPassed ? '100/100' : `${Math.round((result.passedCount || 0) / (result.totalCount || 1) * 100)}/100`
				};
				
				// Show success message
				if (result.success && result.allTestsPassed) {
					alert('🎉 Congratulations! All tests passed and your solution has been submitted!');
				} else if (result.success) {
					alert(`✅ Code submitted! ${result.passedCount}/${result.totalCount} tests passed.`);
				}
			} else {
				testResults = {
					success: false,
					submitted: false,
					error: result.error || 'Code submission failed',
					test_cases: [],
					total_score: '0/100'
				};
				alert('❌ Failed to submit code: ' + (result.error || 'Unknown error'));
			}
		} catch (error) {
			console.error('Failed to submit code:', error);
			testResults = {
				success: false,
				submitted: false,
				error: 'Failed to connect to submission server',
				test_cases: [],
				total_score: '0/100'
			};
			alert('❌ Network error occurred while submitting code');
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
				onselect={selectChallenge}
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
			onmousedown={handleMouseDown}
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
					onrun={handleRun}
					onsubmit={handleSubmit}
					isLoading={loadingChallenges}
					hasChallenge={!!selectedChallengeId && selectedChallengeId !== 'null' && selectedChallengeId !== 'undefined'}
				/>
			</div>
			
		<!-- Test Results Panel -->
		<TestResultsPanel 
			results={testResults} 
			{isRunning} 
			code={codePanel?.getCode() || ''}
			language={codePanel?.getLanguage() || 'javascript'}
			challengeId={selectedChallengeId}
		/>
		</div>
	</div>
</div>