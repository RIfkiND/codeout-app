<script lang="ts">
	export let challenge: any;
	
	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'easy': return 'bg-green-900/30 text-green-400 border-green-500/30';
			case 'medium': return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
			case 'hard': return 'bg-red-900/30 text-red-400 border-red-500/30';
			default: return 'bg-gray-900/30 text-gray-400 border-gray-500/30';
		}
	}
</script>

<!-- Input/Output Examples -->
{#if challenge?.input_example && challenge?.output_example}
	<div class="mb-6">
		<h2 class="text-lg font-semibold text-gray-200 mb-3">Example</h2>
		<div class="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
			<div class="space-y-2">
				<div>
					<span class="text-sm text-gray-400">Input:</span>
					<code class="ml-2 text-blue-400 font-mono text-sm bg-gray-900/50 px-2 py-1 rounded">
						{challenge.input_example}
					</code>
				</div>
				<div>
					<span class="text-sm text-gray-400">Output:</span>
					<code class="ml-2 text-green-400 font-mono text-sm bg-gray-900/50 px-2 py-1 rounded">
						{challenge.output_example}
					</code>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Test Cases Preview -->
{#if challenge?.testcases?.length}
	<div class="mb-6">
		<h2 class="text-lg font-semibold text-gray-200 mb-3">
			Test Cases ({challenge.testcases.length} total)
		</h2>
		<div class="space-y-2">
			{#each challenge.testcases.slice(0, 3) as testcase, i}
				<div class="bg-gray-700/30 rounded p-3 border border-gray-600 text-sm">
					<div class="text-gray-400 mb-1">Test {i + 1}:</div>
					<div class="font-mono text-xs text-gray-300">
						Input: {JSON.stringify(testcase.input)}
					</div>
					<div class="font-mono text-xs text-gray-300">
						Expected: {JSON.stringify(testcase.output)}
					</div>
				</div>
			{/each}
			{#if challenge.testcases.length > 3}
				<div class="text-center text-sm text-gray-400">
					... and {challenge.testcases.length - 3} more test cases
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Challenge Info -->
<div class="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
	<h3 class="text-sm font-semibold text-gray-200 mb-3">Challenge Info</h3>
	<div class="grid grid-cols-2 gap-4 text-sm">
		<div>
			<span class="text-gray-400">Time Limit:</span>
			<div class="text-gray-300 font-mono">{challenge?.time_limit || 300}s</div>
		</div>
		<div>
			<span class="text-gray-400">Memory Limit:</span>
			<div class="text-gray-300 font-mono">{challenge?.memory_limit || 128}MB</div>
		</div>
	</div>
</div>