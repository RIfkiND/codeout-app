
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
	import FeaturedChallenges from '$lib/components/home/FeaturedChallenges.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>CodeOut - Competitive Programming Platform</title>
	<meta name="description" content="Join the ultimate competitive programming platform. Practice coding challenges, compete in real-time lobbies, and improve your skills." />
</svelte:head>

<div class="min-h-screen bg-neutral-950">
	<!-- Hero Section -->
	<HomeHero />
	
	<!-- Platform Statistics -->
	<PlatformStats stats={data.stats} />
	
	<!-- Quick Start for Beginners -->
	<QuickStart challenges={data.quickStartChallenges} />
	
	<!-- Featured Challenges -->
	<FeaturedChallenges challenges={data.featuredChallenges} />
	
	<!-- Skill Badges & Achievements -->
	<SkillBadges />
	
	<!-- Live Lobbies -->
	<LiveLobbies lobbies={data.activeLobbies} />
	
	<!-- Global Leaderboard -->
	<GlobalLeaderboard users={data.leaderboard} />
	
	<!-- Platform Features -->
	<HomeFeatures />
	
	<!-- Call to Action -->
	<HomeCTA />
</div>
