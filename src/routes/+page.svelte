<script lang="ts">
	import type { PageData } from './$types';
	import HomeHero from '$lib/components/home/HomeHero.svelte';
	import PlatformStats from '$lib/components/home/PlatformStats.svelte';
	import QuickStart from '$lib/components/home/QuickStart.svelte';
	import SkillBadges from '$lib/components/home/SkillBadges.svelte';
	import LiveLobbies from '$lib/components/home/LiveLobbies.svelte';
	import CodeEditor from '$lib/components/Editor/CodeEditor.svelte';
	import LiveCode from '$lib/components/home/LiveCode.svelte';
	import HomeFeatures from '$lib/components/home/HomeFeatures.svelte';
	import HomeCTA from '$lib/components/home/HomeCTA.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>CodeOut - Master Coding Through Practice | Online Judge & Challenges</title>
	<meta
		name="description"
		content="Level up your coding skills with CodeOut. Solve algorithmic challenges, compete in real-time coding battles, and track your progress. Join thousands of developers improving daily."
	/>
	<meta
		name="keywords"
		content="coding challenges, algorithm practice, leetcode alternative, programming contests, coding interview preparation"
	/>
</svelte:head>

<div class="min-h-screen bg-neutral-950">
	<HomeHero />
	<PlatformStats stats={data.stats} />
	<QuickStart challenges={data.quickStartChallenges} user={data.user} />
		<SkillBadges />
		<LiveLobbies lobbies={data.activeLobbies} />

	<!-- New: Real Monaco editor + live code playground -->
	<div class="max-w-7xl mx-auto grid grid-cols-2 gap-6 my-8 px-4">
		<div class="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
			<div class="p-4 border-b border-neutral-800">
				<h3 class="text-lg font-semibold text-white">Code Editor</h3>
				<p class="text-sm text-neutral-400">Write and test your solution</p>
			</div>
			<CodeEditor 
				initialCode={`/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
}

// Test cases
console.log(twoSum([2,7,11,15], 9)); // Expected: [0,1]
console.log(twoSum([3,2,4], 6));     // Expected: [1,2]`}
				challengeId="two-sum"
			/>
		</div>
		<LiveCode 
			language="javascript"
			challengeId="two-sum"
			initial={`function twoSum(nums, target) {
    // Brute force approach
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
}`}
		/>
	</div>		<HomeFeatures />
		<HomeCTA />
	<QuickStart />
	<SkillBadges />
	<GlobalLeaderboard users={data.leaderboard} />
	<HomeFeatures />
	<HomeCTA />
</div>
