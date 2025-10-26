<script lang="ts">
	import MenuNavButton from '$lib/components/MenuNavButton.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="px-16">
	<header class="sticky top-0 w-full bg-transparent">
		<div class="flex justify-around py-4">
			<div class="flex grow justify-start gap-8">
				<div class="text-2xl">CodeOut</div>
				<MenuNavButton href="/home">Home</MenuNavButton>
				<MenuNavButton href="/home/lobby" match>Lobby</MenuNavButton>
			</div>
		</div>
	</header>

	{@render children()}
</div>
