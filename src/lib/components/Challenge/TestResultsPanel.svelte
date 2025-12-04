<script lang="ts">
	import { Play, Brain, Loader2 } from 'lucide-svelte';
	import { analyzeCode, type AIAnalysisResult } from '$lib/services/aiService';
	import AIFeedback from '$lib/components/ui/AIFeedback.svelte';
	
	interface TestCase {
		id: number;
		passed: boolean;
		time: string;
		input: string;
		expected: string;
		actual: string;
		stderr: string;
	}
	
	interface TestResults {
		success: boolean;
		result?: {
			test_cases: TestCase[];
			test_cases_passed: number;
			total_test_cases: number;
			execution_time: number;
			memory_used: number;
			score: number;
		};
		testResults?: TestCase[];
		executionTime?: number;
		memory?: number;
		passedCount?: number;
		totalCount?: number;
		output?: string;
		error?: string;
	}
	
	interface TestResultsPanelProps {
		results?: TestResults | null;
		isRunning?: boolean;
		code?: string;
		language?: string;
		challengeId?: string | null;
	}
	
	let {
		results = null,
		isRunning = false,
		code = '',
		language = 'javascript',
		challengeId = null
	}: TestResultsPanelProps = $props();
	
	let aiAnalysis: AIAnalysisResult | null = $state(null);
	let isAnalyzing = $state(false);
	let showAIAnalysis = $state(false);
	
	let currentResults = $derived(results);
	let testCases = $derived(currentResults?.result?.test_cases || currentResults?.testResults || []);
	let executionTime = $derived(currentResults?.result?.execution_time || currentResults?.executionTime || 0);
	let memoryUsed = $derived(currentResults?.result?.memory_used || currentResults?.memory || 0);
	let score = $derived(currentResults?.result?.score || (currentResults?.passedCount && currentResults?.totalCount ? Math.round((currentResults.passedCount / currentResults.totalCount) * 100) : 0));
	let passedCount = $derived(currentResults?.result?.test_cases_passed || currentResults?.passedCount || 0);
	let totalCount = $derived(currentResults?.result?.total_test_cases || currentResults?.totalCount || 0);

	// Debug logging
	$effect(() => {
		if (currentResults) {
			console.log('TestResultsPanel - Current results:', currentResults);
			console.log('TestResultsPanel - Test cases:', testCases);
			console.log('TestResultsPanel - Test cases count:', testCases.length);
		}
	});

	async function analyzeCodeWithAI() {
		if (!code.trim() || isAnalyzing) return;
		
		isAnalyzing = true;
		try {
			aiAnalysis = await analyzeCode(code, language, challengeId || undefined);
			showAIAnalysis = true;
		} catch (error) {
			console.error('Failed to analyze code with AI:', error);
		} finally {
			isAnalyzing = false;
		}
	}
</script>

<div class="bg-neutral-900 border-t border-neutral-700 h-64 overflow-y-auto">
	<div class="p-4">
		{#if isRunning}
			<!-- Loading State -->
			<div class="flex items-center justify-center h-32">
				<div class="text-center">
					<div class="w-8 h-8 border-3 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
					<p class="text-neutral-300">Running test cases...</p>
				</div>
			</div>
		{:else if currentResults}
			<!-- Results Header -->
			<div class="flex items-center justify-between mb-4 pb-3 border-b border-neutral-600">
				<h3 class="font-semibold text-neutral-100">Test Results</h3>
				<div class="flex items-center gap-4 text-sm">
					<span class="text-neutral-300">Score: <strong class="text-neutral-100">{score}%</strong></span>
					<span class="text-neutral-300">Passed: <strong class="text-neutral-100">{passedCount}/{totalCount}</strong></span>
					<span class="text-neutral-300">Time: <strong class="text-neutral-100">{executionTime}ms</strong></span>
					<span class="text-neutral-300">Memory: <strong class="text-neutral-100">{Math.round(memoryUsed / 1024)}KB</strong></span>
				</div>
			</div>

		{#if currentResults && !currentResults.success && currentResults.error}
			<!-- Error Message -->
			<div class="mb-4 p-3 bg-rose-900/30 border border-rose-600/40 rounded-lg">
				<div class="text-rose-300 font-medium mb-1">Execution Error:</div>
				<div class="text-rose-200 text-sm font-mono">{currentResults.error}</div>
			</div>
		{/if}
		
		{#if testCases.length === 0 && currentResults?.output}
			<!-- Raw Output Display for debugging -->
			<div class="mb-4 p-3 bg-blue-900/30 border border-blue-600/40 rounded-lg">
				<div class="text-blue-300 font-medium mb-1">Raw Output:</div>
				<pre class="text-blue-200 text-sm font-mono whitespace-pre-wrap">{currentResults.output}</pre>
			</div>
		{/if}
		
		{#if testCases.length > 0}
			<div class="space-y-3">
				{#each testCases as testCase}
					<div class="border border-neutral-600 rounded-lg p-3 bg-neutral-800/40">
						<div class="flex items-center justify-between mb-2">
							<span class="font-medium text-sm text-neutral-200">Test Case {testCase.id}</span>
							<div class="flex items-center gap-2">
								<span class="text-xs text-neutral-400">{testCase.time}</span>
								{#if testCase.passed}
									<span class="px-2 py-1 text-xs bg-emerald-900/30 text-emerald-300 rounded-full border border-emerald-600/40">✓ Passed</span>
								{:else}
									<span class="px-2 py-1 text-xs bg-rose-900/30 text-rose-300 rounded-full border border-rose-600/40">✗ Failed</span>
								{/if}
							</div>
						</div>

						<!-- Show input for all test cases -->
						<div class="mb-2">
							<div class="text-neutral-300 text-xs mb-1">Input:</div>
							<pre class="bg-neutral-700/50 border border-neutral-600/50 p-2 rounded text-xs font-mono whitespace-pre-wrap text-neutral-300">{testCase.input}</pre>
						</div>
						
						{#if !testCase.passed}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
								<div>
									<div class="text-neutral-300 mb-1">Expected Output:</div>
									<pre class="bg-emerald-900/20 border border-emerald-600/30 p-2 rounded font-mono whitespace-pre-wrap text-emerald-300">{testCase.expected}</pre>
								</div>
								<div>
									<div class="text-neutral-300 mb-1">Your Output:</div>
									<pre class="bg-rose-900/20 border border-rose-600/30 p-2 rounded font-mono whitespace-pre-wrap text-rose-300">{testCase.actual}</pre>
								</div>
							</div>
							{#if testCase.stderr}
								<div class="mt-2">
									<div class="text-neutral-300 text-xs mb-1">Error Output:</div>
									<pre class="bg-orange-900/20 border border-orange-600/30 p-2 rounded text-xs font-mono whitespace-pre-wrap text-orange-300">{testCase.stderr}</pre>
								</div>
							{/if}
						{:else}
							<div>
								<div class="text-neutral-300 text-xs mb-1">Output:</div>
								<pre class="bg-emerald-900/20 border border-emerald-600/30 p-2 rounded text-xs font-mono whitespace-pre-wrap text-emerald-300">{testCase.actual}</pre>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- AI Analysis Section -->
			<div class="mt-6 border-t border-neutral-600 pt-4">
				<div class="flex items-center justify-between mb-3">
					<h4 class="font-semibold text-neutral-100 flex items-center gap-2">
						<Brain class="w-4 h-4 text-purple-400" />
						AI Code Analysis
					</h4>
					<button 
						onclick={analyzeCodeWithAI}
						disabled={!code.trim() || isAnalyzing}
						class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if isAnalyzing}
							<Loader2 class="w-4 h-4 animate-spin" />
							Analyzing...
						{:else}
							<Brain class="w-4 h-4" />
							Analyze Code
						{/if}
					</button>
				</div>

				{#if showAIAnalysis && aiAnalysis}
					<AIFeedback analysis={aiAnalysis} />
				{:else}
					<div class="text-center py-4 text-neutral-400">
						<Brain class="w-8 h-8 mx-auto mb-2 text-neutral-500" />
						<p class="text-sm">Get AI-powered feedback on your code quality and suggestions for improvement</p>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="flex items-center justify-center h-32 text-neutral-400">
				<div class="text-center">
					<Play class="w-8 h-8 mx-auto mb-2 text-neutral-500" />
					<p>Run your code to see test results</p>
				</div>
			</div>
		{/if}
	</div>
</div>