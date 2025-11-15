<script lang="ts">
	export let results: any = null;
	export let isRunning = false;
	
	$: currentResults = results;
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
					<span class="text-neutral-300">Score: <strong class="text-neutral-100">{currentResults.total_score || 'N/A'}</strong></span>
					<span class="text-neutral-300">Time: <strong class="text-neutral-100">{currentResults.executionTime ? `${currentResults.executionTime}ms` : 'N/A'}</strong></span>
					<span class="text-neutral-300">Memory: <strong class="text-neutral-100">{currentResults.memory ? `${Math.round(currentResults.memory / 1024)}KB` : 'N/A'}</strong></span>
				</div>
			</div>

			<!-- Test Cases -->
			<div class="space-y-3">
				{#each currentResults.test_cases as testCase}
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
						
						{#if !testCase.passed}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
								<div>
									<div class="text-neutral-300 mb-1">Expected:</div>
									<pre class="bg-emerald-900/20 border border-emerald-600/30 p-2 rounded font-mono whitespace-pre-wrap text-emerald-300">{testCase.expected}</pre>
								</div>
								<div>
									<div class="text-neutral-300 mb-1">Your Output:</div>
									<pre class="bg-rose-900/20 border border-rose-600/30 p-2 rounded font-mono whitespace-pre-wrap text-rose-300">{testCase.actual}</pre>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="flex items-center justify-center h-32 text-neutral-400">
				<div class="text-center">
					<div class="text-4xl mb-2">🧪</div>
					<p>Run your code to see test results</p>
				</div>
			</div>
		{/if}
	</div>
</div>