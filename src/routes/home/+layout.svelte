<script lang="ts">
	import MainNavigation from '$lib/components/Header/MainNavigation.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<MainNavigation user={data.user} profile={data.profile} />

{@render children()}
