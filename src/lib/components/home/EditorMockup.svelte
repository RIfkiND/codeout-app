<script lang="ts">
	export let title = 'VS Code Environment';
	export let challengeId: string | null = null;
	export let challengeData: any = null;
	
	// Dynamic challenge templates based on challengeId
	const getChallengeTemplate = () => {
		if (challengeData) {
			return {
				name: `${challengeData.title}.js`,
				content: challengeData.template || challengeData.description || '// Write your solution here',
				icon: '🧩',
				language: 'javascript'
			};
		}
		
		// Default templates for different challenge types
		switch (challengeId) {
			case 'two-sum':
				return {
					name: 'two-sum.js',
					content: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
    
}

// Test cases
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]
console.log(twoSum([3,2,4], 6));     // Expected: [1,2]`,
					icon: '🔢',
					language: 'javascript'
				};
			case 'reverse-string':
				return {
					name: 'reverse-string.js',
					content: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
    // Your solution here
    
}

// Test cases
let test1 = ['h','e','l','l','o'];
reverseString(test1);
console.log(test1); // Expected: ['o','l','l','e','h']`,
					icon: '🔄',
					language: 'javascript'
				};
			default:
				return {
					name: 'solution.js',
					content: `// Algorithm Challenge\nfunction solve() {\n    // Your solution here\n    \n}\n\n// Test your solution\nconsole.log(solve());`,
					icon: '💡',
					language: 'javascript'
				};
		}
	};
	
	export let files = [
		getChallengeTemplate(),
		{ 
			name: 'test.spec.js', 
			content: `// Test Suite\nimport { solve } from './solution.js';\n\ndescribe('Challenge Tests', () => {\n    test('should pass basic test cases', () => {\n        // Add your test cases here\n        expect(solve()).toBeDefined();\n    });\n});`,
			icon: '🧪',
			language: 'javascript'
		},
		{ 
			name: 'README.md', 
			content: challengeData?.description || `# Coding Challenge\n\n## Problem Description\nSolve the given algorithmic challenge.\n\n## Approach\n- Think about the problem step by step\n- Consider edge cases\n- Optimize for time and space complexity\n\n## Constraints\n- Follow the function signature\n- Handle edge cases appropriately`,
			icon: '📖',
			language: 'markdown'
		}
	];
	let active = 0;
	const select = (i: number) => active = i;
	
	// Mock AI suggestions based on active file
	const getAISuggestions = () => {
		if (active === 0) {
			return [
				'💡 Consider adding type annotations for better TypeScript support',
				'⚡ Good use of HashMap for O(n) solution!',
				'🔍 Add input validation for edge cases'
			];
		}
		return ['✨ File looks good!'];
	};
</script>

<div class="w-full rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden shadow-2xl">
	<!-- Title Bar -->
	<div class="flex items-center justify-between px-4 py-3 bg-neutral-800 border-b border-neutral-700">
		<div class="flex items-center gap-3">
			<div class="flex items-center gap-2">
				<div class="w-3 h-3 rounded-full bg-red-500"></div>
				<div class="w-3 h-3 rounded-full bg-amber-400"></div>
				<div class="w-3 h-3 rounded-full bg-emerald-400"></div>
			</div>
			<div class="ml-2 font-medium text-sm text-neutral-200">{title}</div>
		</div>
		<div class="flex items-center gap-2 text-xs text-neutral-400">
			<span>🤖 Copilot</span>
			<div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
		</div>
	</div>

	<div class="flex min-h-[400px]">
		<!-- File Explorer -->
		<aside class="w-64 border-r border-neutral-700 bg-neutral-850">
			<div class="p-3 border-b border-neutral-700">
				<div class="text-xs font-semibold text-neutral-300 uppercase tracking-wide">Explorer</div>
			</div>
			<div class="p-2">
				<div class="text-xs text-neutral-400 mb-2 px-2">📁 CODEOUT-CHALLENGE</div>
				<ul class="space-y-1">
					{#each files as file, i}
						<button
							type="button"
							class="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors {i === active ? 'bg-neutral-700 text-white' : 'text-neutral-300 hover:bg-neutral-750 hover:text-white'}"
							onclick={() => select(i)}
						>
							<span class="text-base">{file.icon}</span>
							<span class="flex-1 truncate text-left">{file.name}</span>
							{#if i === active}
								<span class="text-emerald-400 text-xs">●</span>
							{/if}
						</button>
					{/each}
				</ul>
			</div>
			
			<!-- AI Suggestions Panel -->
			<div class="mt-4 px-3 py-2 border-t border-neutral-700">
				<div class="text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1">
					🤖 AI Insights
				</div>
				<div class="space-y-2">
					{#each getAISuggestions() as suggestion}
						<div class="text-xs text-neutral-400 bg-neutral-800 p-2 rounded">
							{suggestion}
						</div>
					{/each}
				</div>
			</div>
		</aside>

		<!-- Editor Area -->
		<div class="flex-1 flex flex-col">
			<!-- Tabs -->
			<div class="flex items-center gap-0 bg-neutral-800 border-b border-neutral-700">
				{#each files as file, i}
					<button 
						type="button"
						class="flex items-center gap-2 px-4 py-2 text-sm border-r border-neutral-700 transition-colors {i === active ? 'bg-neutral-900 text-white' : 'text-neutral-300 hover:bg-neutral-750'}"
						onclick={() => select(i)}
					>
						<span>{file.icon}</span>
						<span>{file.name}</span>
						{#if i === active}
							<span class="text-neutral-500 hover:text-neutral-300 ml-2 text-xs">✕</span>
						{/if}
					</button>
				{/each}
			</div>

			<!-- Code Editor -->
			<div class="flex-1 relative">
				<div class="absolute inset-0 bg-neutral-950">
					<div class="h-full p-4 overflow-auto">
						<div class="flex text-xs text-neutral-500 mb-2">
							<span class="w-8">1</span>
							<span class="flex-1"></span>
						</div>
						<pre class="text-sm text-neutral-100 leading-relaxed font-mono whitespace-pre-wrap">{files[active].content}</pre>
					</div>
					
					<!-- AI Copilot Suggestion -->
					<div class="absolute bottom-4 right-4 bg-purple-600/90 text-white px-3 py-2 rounded-lg text-xs shadow-lg">
						💡 Press Ctrl+I for AI assistance
					</div>
				</div>
			</div>

			<!-- Status Bar -->
			<div class="flex items-center justify-between px-4 py-2 bg-neutral-800 border-t border-neutral-700 text-xs">
				<div class="flex items-center gap-4 text-neutral-400">
					<span>🔥 {files[active].language}</span>
					<span>UTF-8</span>
					<span>LF</span>
					<span class="text-emerald-400">✓ Formatted</span>
				</div>
				<div class="flex items-center gap-3">
					<button class="px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-200 text-xs">
						Run Code
					</button>
					<button class="px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs">
						🤖 AI Review
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
