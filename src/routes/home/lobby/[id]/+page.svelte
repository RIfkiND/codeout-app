<script lang="ts">
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { page } from '$app/state';

	let { data }: PageProps = $props();
</script>

{#snippet cardMenu(href: string, text: string)}
	<a
		href={page.url.pathname + `/?p=${href}`}
		class="h-full {page.url.searchParams.has('p', href) ? 'border-b-2 border-cyan-300' : ''}"
	>
		<div class="h-full w-full px-4 py-4 duration-100 ease-out hover:-translate-y-0.5">
			{text}
		</div>
	</a>
{/snippet}

<Card.Root class="w-full pt-0">
	<Card.Header class="flex h-fit gap-0 border-b-2 border-slate-50/20 px-16">
		{@render cardMenu('overview', 'Overview')}
		{@render cardMenu('participants', 'Participants')}
		{@render cardMenu('chat', 'Chat')}
		{@render cardMenu('leaderboard', 'Leaderboard')}
	</Card.Header>
	<Card.Content class="px-16">
		{#if page.url.searchParams.has('p', 'overview')}
			<Card.Title>Description</Card.Title>
			<div class="grid h-64 grid-cols-7 grid-rows-[2fr_3fr] gap-8 py-4">
				<div class="col-span-2 row-span-2 rounded-xl bg-red-500"></div>
				<div class="bg-green-300"></div>
				<div class="bg-green-300"></div>
				<div class="bg-green-300"></div>
				<div class="col-span-2 bg-green-300"></div>
				<div class="bg-blue-300"></div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
