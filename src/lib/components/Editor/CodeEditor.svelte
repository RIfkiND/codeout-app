<script lang="ts">
	import Editor from './Editor.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import { analyzeCode, type AIAnalysisResult } from '$lib/services/aiService';
	import AIFeedback from '$lib/components/ui/AIFeedback.svelte';
	import { Play, Loader2, Zap, RotateCcw } from 'lucide-svelte';

	interface CodeEditorProps {
		initialCode?: string;
		challengeId?: string;
		lobbyId?: string;
		onExecute?: (result: any) => void;
	}

	let { 
		initialCode = '', 
		challengeId,
		lobbyId,
		onExecute
	}: CodeEditorProps = $props();

	let editor: Editor;
	let code = $state(initialCode);
	let language = $state('javascript');
	let isExecuting = $state(false);
	let lastResult = $state<any>(null);
	let analysis = $state<AIAnalysisResult | null>(null);
	let isAnalyzing = $state(false);
	let showAnalysis = $state(false);
	let activeTab = $state<'output' | 'analysis'>('output');

	async function handleLanguageChange(newLanguage: string) {
		language = newLanguage;
		// Always load template when language changes
		await editor?.loadTemplate();
	}

	function handleCodeChange(value: string) {
		code = value;
	}

	async function runCode() {
		if (!challengeId || isExecuting) return;
		
		isExecuting = true;
		lastResult = null;
		
		try {
			const response = await fetch('/api/code/execute', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					language,
					code,
					challengeId,
					lobbyId
				})
			});
			
			if (response.ok) {
				const result = await response.json();
				lastResult = result;
				onExecute?.(result);
				// Auto-analyze after successful execution
				if (result.success) {
					await analyzeCodeAI();
				}
			} else {
				const error = await response.json();
				lastResult = {
					success: false,
					error: error.error || 'Failed to execute code',
					output: '',
					testResults: []
				};
				onExecute?.(lastResult);
			}
		} catch (error) {
			console.error('Failed to execute code:', error);
			lastResult = {
				success: false,
				error: 'Network error occurred',
				output: '',
				testResults: []
			};
			onExecute?.(lastResult);
		} finally {
			isExecuting = false;
		}
	}

	function resetCode() {
		editor?.loadTemplate();
		lastResult = null;
		analysis = null;
	}

	async function analyzeCodeAI() {
		if (!code.trim()) return;
		
		isAnalyzing = true;
		showAnalysis = true;
		activeTab = 'analysis';
		
		try {
			analysis = await analyzeCode(code, language, challengeId);
		} catch (error) {
			console.error('Analysis failed:', error);
			analysis = null;
		} finally {
			isAnalyzing = false;
		}
	}

	// Public API
	export function getCode() { return code; }
	export function getLanguage() { return language; }
	export function setCode(newCode: string) { 
		code = newCode;
		editor?.setValue(newCode);
	}
	export function getLastResult() { return lastResult; }
	export function getAnalysis() { return analysis; }
	export function triggerAnalysis() { return analyzeCodeAI(); }
</script>

<div class="flex flex-col gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-700">
	<!-- Language Controls -->
	<div class="flex items-center justify-between">
		<LanguageSelector 
			bind:selected={language} 
			onChange={handleLanguageChange} 
		/>
		
		<div class="flex gap-2">
			<button 
				onclick={resetCode}
				class="px-3 py-1.5 text-sm border border-neutral-600 bg-neutral-800 text-neutral-200 rounded-md hover:bg-neutral-700 transition-colors"
				disabled={isExecuting}
			>
				Reset
			</button>
			<button 
				onclick={analyzeCodeAI}
				class="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors"
				disabled={isAnalyzing || !code.trim()}
			>
				{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
			</button>
			<button 
				onclick={runCode}
				disabled={!challengeId || isExecuting}
				class="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if isExecuting}
					<Loader2 class="w-4 h-4 animate-spin" />
					Running...
				{:else}
					<Play class="w-4 h-4" />
					Run Tests
				{/if}
			</button>
		</div>
	</div>

	<!-- Code Editor -->
	<Editor
		bind:this={editor}
		bind:value={code}
		{language}
		{challengeId}
		height="400px"
		onchange={handleCodeChange}
	/>
	
	<!-- Stats -->
	<div class="text-xs text-white flex justify-between font-medium">
		<span>Lines: {code.split('\n').length}</span>
		<span>Chars: {code.length}</span>
		<span>Lang: {language.toUpperCase()}</span>
	</div>
	
	<!-- Test Results -->
	{#if lastResult}
		<div class="mt-4 p-4 bg-neutral-800 rounded-lg border border-neutral-600">
			<h4 class="font-semibold mb-2 text-neutral-100">Test Results</h4>
			
			{#if lastResult.success}
				<div class="flex items-center gap-2 mb-3">
					<div class="w-3 h-3 rounded-full {lastResult.allTestsPassed ? 'bg-emerald-500' : 'bg-yellow-500'}"></div>
					<span class="text-sm font-medium {lastResult.allTestsPassed ? 'text-emerald-400' : 'text-yellow-400'}">
						{lastResult.passedCount}/{lastResult.totalCount} tests passed
					</span>
					{#if lastResult.executionTime}
						<span class="text-xs text-neutral-400 ml-auto">
							{lastResult.executionTime}ms
						</span>
					{/if}
				</div>
				
				{#if lastResult.testResults && lastResult.testResults.length > 0}
					<div class="space-y-2">
						{#each lastResult.testResults as testCase, i}
							<div class="flex items-start gap-3 p-2 bg-neutral-700 rounded text-xs">
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
									{#if testCase.time}
										<div class="text-neutral-500 mt-1">{testCase.time}</div>
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
					{lastResult.error}
				</div>
			{/if}
		</div>
	{/if}

	{#if showAnalysis && analysis}
		<div class="bg-green-900/20 border-l-4 border-green-400 p-4 mb-4 rounded">
			<h3 class="text-green-300 font-semibold mb-2">AI Analysis Results</h3>
			<div class="grid grid-cols-2 gap-4 mb-3">
				<div class="bg-blue-900/30 p-3 rounded">
					<span class="text-blue-300 text-sm">Quality Score</span>
					<div class="text-xl font-bold text-blue-400">{analysis.score}/100</div>
				</div>
				<div class="bg-purple-900/30 p-3 rounded">
					<span class="text-purple-300 text-sm">Readability</span>
					<div class="text-xl font-bold text-purple-400">{analysis.codeQuality.readability}/100</div>
				</div>
			</div>
			{#if analysis.suggestions && analysis.suggestions.filter(s => s.type === 'improvement').length > 0}
				<div class="mb-3">
					<h4 class="text-green-400 text-sm font-semibold mb-2">Improvements</h4>
					<ul class="text-green-300 text-sm space-y-1">
						{#each analysis.suggestions.filter(s => s.type === 'improvement') as suggestion}
							<li class="flex items-start">
								<span class="text-green-400 mr-2">•</span>
								{suggestion.message}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if analysis.suggestions && analysis.suggestions.filter(s => s.type === 'error' || s.type === 'warning').length > 0}
				<div>
					<h4 class="text-red-400 text-sm font-semibold mb-2">Issues Found</h4>
					<ul class="text-red-300 text-sm space-y-1">
						{#each analysis.suggestions.filter(s => s.type === 'error' || s.type === 'warning') as suggestion}
							<li class="flex items-start">
								<span class="text-red-400 mr-2">⚠</span>
								{suggestion.message}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if analysis.summary}
				<div class="mt-3 p-3 bg-neutral-800 rounded">
					<h4 class="text-neutral-300 text-sm font-semibold mb-1">Summary</h4>
					<p class="text-neutral-400 text-sm">{analysis.summary}</p>
				</div>
			{/if}
		</div>
	{/if}
</div>