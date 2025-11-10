<script lang="ts">
import type { PageData } from './$types';
import AdminDashboardStats from '$lib/components/admin/AdminDashboardStats.svelte';
import AdminRecentActivity from '$lib/components/admin/AdminRecentActivity.svelte';
import AdminQuickActions from '$lib/components/admin/AdminQuickActions.svelte';
import AdminChallengeDistribution from '$lib/components/admin/AdminChallengeDistribution.svelte';

let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-neutral-950">
	<AdminDashboardStats stats={data.stats} />
	<AdminQuickActions />
	<AdminChallengeDistribution stats={data.stats} />
	<AdminRecentActivity activities={data.recentActivities} />
</div>