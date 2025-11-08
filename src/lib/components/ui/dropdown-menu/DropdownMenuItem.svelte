<script lang="ts">
	import { getContext } from 'svelte';

	interface Props {
		children: any;
		class?: string;
		onclick?: () => void;
		href?: string;
	}

	let { children, class: className = '', onclick, href }: Props = $props();

	const { close } = getContext<{ close: () => void }>('dropdown-menu');

	function handleClick() {
		onclick?.();
		close();
	}
</script>

{#if href}
	<a
		{href}
		onclick={handleClick}
		class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 {className}"
		style="color: rgb(245 245 245);"
	>
		{@render children()}
	</a>
{:else}
	<button
		onclick={handleClick}
		class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 {className}"
		style="color: rgb(245 245 245);"
	>
		{@render children()}
	</button>
{/if}