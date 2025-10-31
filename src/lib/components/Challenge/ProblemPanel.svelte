<script lang="ts">
	export let challenge: any = null;
	
	// Default challenge if none provided
	const defaultChallenge = {
		title: "Plus Minus",
		description: `Given an array of integers, calculate the ratios of its elements that are positive, negative, and zero. Print the decimal value of each fraction on a new line with 6 places after the decimal.

**Note:** This challenge introduces precision problems. The test cases are scaled to six decimal places, though answers with absolute error of up to 10^(-4) are acceptable.`,
		input_example: "arr = [1, 1, 0, -1, -1]",
		output_example: `0.400000
0.400000
0.200000`,
		constraints: [
			"0 < n ≤ 100",
			"-100 ≤ arr[i] ≤ 100"
		],
		sample_input: `6
-4 3 -9 0 4 1`,
		function_description: `Complete the plusMinus function below.
* The function accepts INTEGER_ARRAY arr as parameter.`,
		input_format: `The first line contains an integer, n, the size of the array.
The second line contains n space-separated integers that describe arr[i].`,
		difficulty: "easy"
	};
	
	$: currentChallenge = challenge || defaultChallenge;
</script>

<div class="bg-gray-800 h-full overflow-y-auto">
	<!-- Header -->
	<div class="p-6 border-b border-gray-700">
		<div class="flex items-center justify-between mb-2">
			<h1 class="text-2xl font-bold text-white">{currentChallenge.title}</h1>
			<span class="px-2 py-1 text-xs font-medium bg-green-900/30 text-green-400 rounded-full capitalize border border-green-500/30">
				{currentChallenge.difficulty}
			</span>
		</div>
		<p class="text-gray-400">Problem solving challenge</p>
	</div>

	<!-- Content -->
	<div class="p-6 space-y-6">
		<!-- Problem Description -->
		<section>
			<p class="text-gray-200 leading-relaxed whitespace-pre-line">
				{currentChallenge.description}
			</p>
		</section>

		<!-- Example -->
		{#if currentChallenge.input_example}
			<section>
				<h3 class="font-semibold text-white mb-3">Example</h3>
				<div class="bg-gray-700/50 rounded-lg p-4 space-y-2 border border-gray-600">
					<div>
						<span class="text-sm font-medium text-gray-300">Input:</span>
						<code class="ml-2 text-sm bg-gray-900 text-green-400 px-2 py-1 rounded border border-gray-600">{currentChallenge.input_example}</code>
					</div>
					<div>
						<span class="text-sm font-medium text-gray-300">Output:</span>
						<pre class="ml-2 text-sm bg-gray-900 text-green-400 px-2 py-1 rounded border border-gray-600 mt-1 whitespace-pre">{currentChallenge.output_example}</pre>
					</div>
				</div>
			</section>
		{/if}

		<!-- Function Description -->
		{#if currentChallenge.function_description}
			<section>
				<h3 class="font-semibold text-white mb-3">Function Description</h3>
				<p class="text-gray-300 whitespace-pre-line">{currentChallenge.function_description}</p>
			</section>
		{/if}

		<!-- Input Format -->
		{#if currentChallenge.input_format}
			<section>
				<h3 class="font-semibold text-white mb-3">Input Format</h3>
				<p class="text-gray-300 whitespace-pre-line">{currentChallenge.input_format}</p>
			</section>
		{/if}

		<!-- Constraints -->
		{#if currentChallenge.constraints}
			<section>
				<h3 class="font-semibold text-white mb-3">Constraints</h3>
				<ul class="space-y-1">
					{#each currentChallenge.constraints as constraint}
						<li class="text-gray-300 text-sm">• {constraint}</li>
					{/each}
				</ul>
			</section>
		{/if}

		<!-- Sample Input -->
		{#if currentChallenge.sample_input}
			<section>
				<h3 class="font-semibold text-white mb-3">Sample Input</h3>
				<pre class="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono border border-gray-600">{currentChallenge.sample_input}</pre>
			</section>
		{/if}
	</div>
</div>