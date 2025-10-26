<script lang="ts">
	import type { PageProps } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import { page } from '$app/state';

	let { data }: PageProps = $props();
</script>

<Card.Root class="w-full pt-0">
	<Card.Header class="flex h-fit gap-0 border-b-2 border-slate-50/20 px-16">
		<a
			href={page.url.pathname + '/?p=overview'}
			class="h-full {page.url.searchParams.has('p', 'overview')
				? 'border-b-2 border-cyan-300'
				: ''}">asdf</a
		>
		<div class="h-full">asdf</div>
		<div class="h-full">asdf</div>
	</Card.Header>
	<Card.Content><p>Asdf</p></Card.Content>
	<Card.Footer><p>Asdf</p></Card.Footer>
</Card.Root>
