<script lang="ts">
	import { Lightbulb, MessageCircle, Settings, GripVertical } from 'lucide-svelte';
	import ProblemPanel from './ProblemPanel.svelte';
	import CodePanel from './CodePanel.svelte';
	import TestResultsPanel from './TestResultsPanel.svelte';
	import ChallengeSelector from './ChallengeSelector.svelte';
	import { onMount } from 'svelte';
	
	export let challengeId: string | null = null;
	export let editable: boolean = false;

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

	function handleRun(event: CustomEvent<{ code: string; language: string }>) {
		isRunning = true;
		console.log('Running code:', event.detail);
		
		setTimeout(() => {
			isRunning = false;
			testResults = {
				success: true,
				test_cases: [
					{ id: 1, passed: true, time: "0.01s" },
					{ id: 2, passed: true, time: "0.02s" },
					{ id: 3, passed: false, time: "0.01s" }
				],
				total_score: "66.67/100"
			};
		}, 2000);
	}

	function handleSubmit(event: CustomEvent<{ code: string; language: string }>) {
		isSubmitting = true;
		console.log('Submitting code:', event.detail);
		
		setTimeout(() => {
			isSubmitting = false;
			alert('Solution submitted successfully!');
		}, 2000);
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

<div class="h-screen bg-gray-900 flex flex-col">
	<!-- Top Navigation Bar -->
	<nav class="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<a href="/" class="text-xl font-bold text-white">CodeOut</a>
			<span class="text-gray-500">|</span>
			
			<!-- Challenge Selector -->
			<ChallengeSelector 
				{challenges} 
				loading={loadingChallenges} 
				selectedId={selectedChallengeId}
				on:select={selectChallenge}
			/>
		</div>
		
		<div class="flex items-center gap-4">
			<button class="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors">
				<Lightbulb size={16} />
				Hint
			</button>
			<button class="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors">
				<MessageCircle size={16} />
				Discuss
			</button>
			<button class="flex items-center gap-2 text-gray-300 hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-700 transition-colors">
				<Settings size={16} />
				Settings
			</button>
		</div>
	</nav>

	<!-- Main Content Area -->
	<div class="flex-1 flex min-h-0 relative">
		<!-- Problem Description Panel -->
		<div class="flex flex-col min-h-0 bg-gray-800" style="width: {sidebarWidth}%">
			<ProblemPanel challengeId={selectedChallengeId} {editable} />
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