<script lang="ts">
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data }: PageProps = $props();
</script>

<div class="my-12 flex flex-col gap-4 px-16">
	<div class="flex justify-between">
		<div class="flex justify-start">
			<h1 class="text-4xl font-bold">Code Out!</h1>
		</div>
	</div>
	<div class="flex">
		<Button>Join Lobby</Button>
	</div>
</div>

{#snippet cardMenu(href: string, text: string)}
	<a
		href={page.url.pathname + `/?p=${href}`}
		class="h-full border-b-2 border-cyan-300/0 {page.url.searchParams.has('p', href)
			? 'border-cyan-300/100'
			: ''} duration-100 ease-out"
	>
		<div class="h-full w-full px-4 py-4 duration-500 ease-out hover:-translate-y-0.5">
			{text}
		</div>
	</a>
{/snippet}

<Card.Root class="min-h-[50vh] w-full pt-0">
	<Card.Header class="flex h-fit gap-0 border-b-2 border-slate-50/20 px-16">
		{@render cardMenu('overview', 'Overview')}
		{@render cardMenu('participants', 'Participants')}
		{@render cardMenu('chat', 'Chat')}
		{@render cardMenu('leaderboard', 'Leaderboard')}
	</Card.Header>
	<Card.Content class="flex flex-col gap-4 px-16">
		{#if page.url.searchParams.has('p', 'overview')}
			<Card.Title>Information</Card.Title>
			<div class="grid h-64 grid-cols-7 grid-rows-[4fr_6fr] gap-8">
				<div class="col-span-2 row-span-2 rounded-xl bg-red-500"></div>
				<div class="bg-green-300"></div>
				<div class="bg-green-300"></div>
				<div class="bg-green-300"></div>
				<div class="col-span-2 bg-green-300"></div>
				<div class="bg-blue-300"></div>
			</div>

			<Separator />

			<Card.Title>Description</Card.Title>
			<Card.Description
				>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean erat erat, consequat quis
				arcu sed, eleifend ultrices turpis. Mauris finibus ullamcorper mi, sit amet varius dui
				venenatis a. Donec feugiat est eget turpis vulputate interdum. In eleifend quam magna, et
				maximus ipsum viverra eu. Proin semper mauris vitae dignissim dignissim. Sed nec purus
				convallis, sagittis odio vitae, aliquam eros. In aliquet nisi ut hendrerit congue. Sed
				interdum mollis ultrices. Vivamus a elit ut felis sodales tristique eu quis ipsum. In eget
				mi nec quam facilisis auctor. Nam ultrices vestibulum urna, nec imperdiet nibh eleifend
				tristique. Aliquam consectetur lorem eget libero ullamcorper varius. Nullam facilisis dui
				sit amet lobortis rutrum. Morbi sagittis ornare nulla, sit amet molestie justo bibendum ac.
				Donec ornare scelerisque hendrerit. In velit mauris, accumsan non mauris quis, bibendum
				facilisis arcu.</Card.Description
			>
		{/if}
	</Card.Content>
</Card.Root>
