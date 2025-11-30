<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { analyzeCode, executeCodeWithTests, type AIAnalysisResult, type CodeExecutionResult } from '$lib/services/aiService';
	import AIFeedback from '$lib/components/ui/AIFeedback.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Play, Zap, CheckCircle, XCircle } from 'lucide-svelte';
	const dispatch = createEventDispatcher();

	export let initial = `function twoSum(nums, target) {
    // Your solution here
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`;
	export let language = 'javascript';
	export let challengeId: string | null = null;
	
	let code = initial;
	let output = '';
	let running = false;
	let analyzing = false;
	let analysis: AIAnalysisResult | null = null;
	let executionResult: CodeExecutionResult | null = null;
	let activeTab = 'output';

	const run = async () => {
		running = true;
		output = 'Running tests...';
		activeTab = 'output';
		
		try {
			// Execute code with tests
			executionResult = await executeCodeWithTests(code, language, challengeId || undefined);
			
			if (executionResult.success) {
				output = executionResult.output || 'Code executed successfully!';
				
				// Show test results if available
				if (executionResult.testResults && executionResult.testResults.length > 0) {
					const passedTests = executionResult.testResults.filter(t => t.passed).length;
					const totalTests = executionResult.testResults.length;
					output = `Tests: ${passedTests}/${totalTests} passed\n\n` + 
						executionResult.testResults.map(t => 
							`${t.passed ? '✓' : '✗'} ${t.name || 'Test'}: ${t.passed ? 'PASS' : 'FAIL'}`
						).join('\n');
				}
			} else {
				output = executionResult.error || 'Execution failed';
			}
			
			// Auto-analyze after successful run
			if (executionResult.success) {
				await analyzeCodeAI();
			}
			
		} catch (error) {
			output = error instanceof Error ? error.message : 'Execution failed';
			executionResult = { success: false, error: output };
		} finally {
			running = false;
		}
		
		dispatch('run', { code, output, executionResult });
	};
	
	const analyzeCodeAI = async () => {
		analyzing = true;
		activeTab = 'analysis';
		
		try {
			analysis = await analyzeCode(code, language, challengeId || undefined);
		} catch (error) {
			console.error('Analysis failed:', error);
			analysis = null;
		} finally {
			analyzing = false;
		}
		
		dispatch('analyze', { code, analysis });
	};
</script>

<div class="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-4">
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center gap-3">
			<div class="text-sm font-semibold">Live Code Playground</div>
			<Badge variant="outline" class="text-xs">{language}</Badge>
		</div>
		<div class="flex items-center gap-2">
			<Button onclick={analyzeCodeAI} size="sm" variant="outline" disabled={analyzing}>
				<Zap class="w-3 h-3 mr-1" />
				{analyzing ? 'Analyzing...' : 'AI Analysis'}
			</Button>
			<Button onclick={run} size="sm" class="bg-emerald-600 hover:bg-emerald-700" disabled={running}>
				<Play class="w-3 h-3 mr-1" />
				{running ? 'Running...' : 'Run Tests'}
			</Button>
		</div>
	</div>

	<!-- Code Editor -->
	<div class="mb-4">
		<textarea 
			bind:value={code} 
			class="w-full h-64 bg-neutral-950 border border-neutral-800 rounded p-3 text-sm font-mono text-neutral-100 resize-none"
			placeholder="Write your code here..."
		></textarea>
	</div>

	<!-- Results Tabs -->
	<div class="w-full">
		<div class="grid w-full grid-cols-2 border-b border-neutral-700">
			<button 
				class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'output' ? 'bg-neutral-800 text-white border-b-2 border-emerald-500' : 'text-neutral-400 hover:text-neutral-200'}"
				onclick={() => activeTab = 'output'}
			>
				<div class="flex items-center gap-2">
					{#if executionResult?.success === true}
						<CheckCircle class="w-3 h-3 text-emerald-400" />
					{:else if executionResult?.success === false}
						<XCircle class="w-3 h-3 text-red-400" />
					{/if}
					Output
				</div>
			</button>
			<button 
				class="px-4 py-2 text-sm font-medium transition-colors {activeTab === 'analysis' ? 'bg-neutral-800 text-white border-b-2 border-emerald-500' : 'text-neutral-400 hover:text-neutral-200'}"
				onclick={() => activeTab = 'analysis'}
			>
				<div class="flex items-center gap-2">
					<Zap class="w-3 h-3" />
					AI Analysis
					{#if analysis}
						<Badge class="{analysis.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : analysis.score >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'} text-xs ml-1">
							{analysis.score}/100
						</Badge>
					{/if}
				</div>
			</button>
		</div>
		
		
		{#if activeTab === 'output'}
			<div class="mt-4">
				<div class="min-h-[200px] bg-neutral-950 border border-neutral-800 rounded p-3">
					<div class="text-xs font-medium text-neutral-400 mb-2">Execution Output</div>
					<pre class="text-sm text-neutral-100 whitespace-pre-wrap">{output}</pre>
					
					{#if executionResult?.testResults && executionResult.testResults.length > 0}
						<div class="mt-4 space-y-2">
							<div class="text-xs font-medium text-neutral-400">Test Results</div>
							{#each executionResult.testResults as test}
								<div class="flex items-center gap-2 text-sm">
									{#if test.passed}
										<CheckCircle class="w-4 h-4 text-emerald-400" />
									{:else}
										<XCircle class="w-4 h-4 text-red-400" />
									{/if}
									<span class="{test.passed ? 'text-emerald-400' : 'text-red-400'}">
										{test.name || 'Test'}
									</span>
									{#if !test.passed}
										<span class="text-neutral-400 text-xs">
											Expected: {JSON.stringify(test.expected)}, Got: {JSON.stringify(test.actual)}
										</span>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{:else if activeTab === 'analysis'}
			<div class="mt-4">
				<AIFeedback {analysis} isLoading={analyzing} onRetry={analyzeCodeAI} />
			</div>
		{/if}
	</div>
</div>