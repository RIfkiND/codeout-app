<script lang="ts">
	export let results: any = null;
	export let isRunning = false;
	
	// Mock test results for demo
	const mockResults = {
		success: true,
		test_cases: [
			{ id: 1, passed: true, input: "6\n-4 3 -9 0 4 1", expected: "0.500000\n0.333333\n0.166667", actual: "0.500000\n0.333333\n0.166667", time: "0.01s" },
			{ id: 2, passed: true, input: "8\n1 2 3 -1 -2 -3 0 0", expected: "0.375000\n0.375000\n0.250000", actual: "0.375000\n0.375000\n0.250000", time: "0.02s" },
			{ id: 3, passed: false, input: "5\n0 0 0 0 0", expected: "0.000000\n0.000000\n1.000000", actual: "0.000000\n0.000000\n0.000000", time: "0.01s" }
		],
		total_score: "66.67/100",
		execution_time: "0.045s",
		memory_used: "2.1 MB"
	};
	
	$: currentResults = results || (isRunning ? null : mockResults);
</script>

<div class="bg-gray-800 border-t border-gray-700 h-64 overflow-y-auto">
	<div class="p-4">
		{#if isRunning}
			<!-- Loading State -->
			<div class="flex items-center justify-center h-32">
				<div class="text-center">
					<div class="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
					<p class="text-gray-300">Running test cases...</p>
				</div>
			</div>
		{:else if currentResults}
			<!-- Results Header -->
			<div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-600">
				<h3 class="font-semibold text-white">Test Results</h3>
				<div class="flex items-center gap-4 text-sm">
					<span class="text-gray-300">Score: <strong class="text-white">{currentResults.total_score}</strong></span>
					<span class="text-gray-300">Time: <strong class="text-white">{currentResults.execution_time}</strong></span>
					<span class="text-gray-300">Memory: <strong class="text-white">{currentResults.memory_used}</strong></span>
				</div>
			</div>

			<!-- Test Cases -->
			<div class="space-y-3">
				{#each currentResults.test_cases as testCase}
					<div class="border border-gray-600 rounded-lg p-3 bg-gray-700/30">
						<div class="flex items-center justify-between mb-2">
							<span class="font-medium text-sm text-gray-200">Test Case {testCase.id}</span>
							<div class="flex items-center gap-2">
								<span class="text-xs text-gray-400">{testCase.time}</span>
								{#if testCase.passed}
									<span class="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded-full border border-green-500/30">✓ Passed</span>
								{:else}
									<span class="px-2 py-1 text-xs bg-red-900/30 text-red-400 rounded-full border border-red-500/30">✗ Failed</span>
								{/if}
							</div>
						</div>
						
						{#if !testCase.passed}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
								<div>
									<div class="text-gray-300 mb-1">Expected:</div>
									<pre class="bg-green-900/20 border border-green-600/30 p-2 rounded font-mono whitespace-pre-wrap text-green-300">{testCase.expected}</pre>
								</div>
								<div>
									<div class="text-gray-300 mb-1">Your Output:</div>
									<pre class="bg-red-900/20 border border-red-600/30 p-2 rounded font-mono whitespace-pre-wrap text-red-300">{testCase.actual}</pre>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="flex items-center justify-center h-32 text-gray-400">
				<div class="text-center">
					<div class="text-4xl mb-2">🧪</div>
					<p>Run your code to see test results</p>
				</div>
			</div>
		{/if}
	</div>
</div>