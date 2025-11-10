<script lang="ts">
	import { getContext } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	interface Props {
		children: any;
		class?: string;
		align?: 'start' | 'end' | 'center';
	}

	let { children, class: className = '', align = 'end' }: Props = $props();

	const { isOpen } = getContext<{ isOpen: any }>('dropdown-menu');

	const alignmentClasses = {
		start: 'left-0',
		center: 'left-1/2 -translate-x-1/2',
		end: 'right-0'
	};
</script>

{#if $isOpen}
	<div
		transition:fly={{ y: -10, duration: 200 }}
		class="absolute top-full mt-1 z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md {alignmentClasses[align]} {className}"
		style="background: rgb(23 23 23); border-color: rgb(64 64 64); color: rgb(245 245 245);"
	>
		{@render children()}
	</div>
{/if}