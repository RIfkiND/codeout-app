
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

<div class="min-h-screen bg-neutral-950">
	<HomeHero />
	<PlatformStats stats={data.stats} />
	<QuickStart challenges={data.quickStartChallenges} />
	<SkillBadges />
	<LiveLobbies lobbies={data.activeLobbies} />
	<GlobalLeaderboard users={data.leaderboard} />
	<HomeFeatures />
	<HomeCTA />
</div>
