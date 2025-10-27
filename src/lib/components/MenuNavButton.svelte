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

<a {href} class="{selected() ? 'border-b-2 border-blue-400' : ''} relative h-full bg-transparent">
	<div class="h-full w-full px-4 duration-200 ease-out hover:-translate-y-1">
		{@render children?.()}
	</div>
</a>
