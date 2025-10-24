<script lang="ts">
	import { page } from '$app/state';
	import { Button } from './ui/button';

	let { href, children } = $props();
	let selected = $derived(() => {
		return page.url.pathname === href;
	});
</script>

<Button {href} variant="ghost" class={selected() ? 'border-b-2 border-blue-400' : ''}>
	{@render children?.()}
</Button>
