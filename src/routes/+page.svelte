<script lang="ts">
	import type { PageData } from './$types';
	import HomeHero from '$lib/components/home/HomeHero.svelte';
	import PlatformStats from '$lib/components/home/PlatformStats.svelte';
	import QuickStart from '$lib/components/home/QuickStart.svelte';
	import SkillBadges from '$lib/components/home/SkillBadges.svelte';
	import LiveLobbies from '$lib/components/home/LiveLobbies.svelte';
	import GlobalLeaderboard from '$lib/components/home/GlobalLeaderboard.svelte';
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
	<QuickStart />
	<SkillBadges />
	<GlobalLeaderboard users={data.leaderboard} />
	<HomeFeatures />
	<HomeCTA />
</div>
