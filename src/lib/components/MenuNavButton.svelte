<script lang="ts">
	import { page } from '$app/state';

	let { href, children, match = false } = $props();
	let selected = $derived(() => {
		if (match) {
			return page.url.pathname.match(href) !== null;
		}
		return page.url.pathname === href;
	});
</script>

<a {href} class="{selected() ? 'border-b-2 border-cyan-300' : ''} relative h-full bg-transparent">
	<div
		class="flex h-full w-full items-center justify-center px-3 py-1.5 align-middle duration-200 ease-out hover:-translate-y-1 text-sm"
	>
		{@render children?.()}
	</div>
</a>
