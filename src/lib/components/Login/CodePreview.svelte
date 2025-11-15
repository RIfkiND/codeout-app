<script lang="ts">
	import { createHighlighter } from 'shiki';
	import { ShikiMagicMove } from 'shiki-magic-move/svelte';
	import { slide } from 'svelte/transition';

	import 'shiki-magic-move/dist/style.css';

	const highlighter = createHighlighter({
		themes: ['one-dark-pro'],
		langs: ['javascript', 'typescript']
	});

	const codeList = [
		'',
		`function solution(nums, target)\n    let map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        let complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [] // No solution found\nend`,
		`function solution(s)\n    let left = 0;\n    let right = s.length - 1;\n    while (left < right) {\n        if (s[left] !== s[right]) {\n            return false;\n        }\n        left++;\n        right--;\n    }\n    return true\nend`,
		`function solution(n)\n    if (n <= 1) {\n        return n;\n    }\n    let a = 0, b = 1;\n    for (let i = 2; i <= n; i++) {\n        let temp = b;\n        b = a + b;\n        a = temp;\n    }\n    return b\nend`
	];
	const problemList = ['Two Sum', 'Two Sum', 'Palindrome Check', 'Nth Fibonacci Number'];
	const problemDescList = [
		'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
		'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
		'Given a string s, return true if it is a palindrome (reads the same forwards and backward), and false otherwise.',
		'Calculate the Nth Fibonacci number, where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2).'
	];
	let current = $state(0);

	let code = $state('');
	let problem = $derived(problemList[current]);
	let problemDesc = $derived(problemDescList[current]);

	let stagger = $state(30);
	let debounce = false;

	async function sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
	async function animate() {
		if (debounce) {
			return;
		}

		debounce = true;

		if (code.length > 0) {
			await sleep(10000);
			stagger = 0;
			code = '';
		} else {
			await sleep(500);
			stagger = 30;
			current++;
			if (current >= problemList.length) {
				current = 1;
			}

			code = codeList[current];
		}

		debounce = false;
	}

	animate();
</script>

<div class="flex w-lg flex-col gap-1 rounded-lg bg-[rgb(40,44,52)] p-1">
	<div class="p-4">
		{#key current}
			<div class="font-bold text-emerald-400" transition:slide={{ delay: 500, duration: 1000 }}>
				{problem}
			</div>
			<div class="text-xs" transition:slide={{ delay: 500, duration: 1000 }}>
				{problemDesc}
			</div>
		{/key}
	</div>
	{#await highlighter}
		<div class="flex animate-pulse items-center gap-3 rounded-lg p-2">
			<div class="h-4 w-4 rounded bg-neutral-700"></div>
			<div class="flex-1">
				<div class="mb-1 h-3 rounded bg-neutral-700"></div>
				<div class="h-2 w-1/4 rounded bg-neutral-800"></div>
			</div>
		</div>
	{:then highlighter}
		<ShikiMagicMove
			lang="ts"
			theme="one-dark-pro"
			{highlighter}
			{code}
			options={{ duration: 500, stagger: stagger, lineNumbers: true }}
			class="shiki-code border-t-2 border-neutral-600 p-4"
			onEnd={() => animate()}
		/>
	{/await}
</div>
