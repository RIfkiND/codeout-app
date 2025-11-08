<script lang="ts">
	import { getContext, setContext } from 'svelte';
	import { writable } from 'svelte/store';

	interface Props {
		children: any;
	}

	let { children }: Props = $props();

	const isOpen = writable(false);
	setContext('dropdown-menu', { isOpen });

	let menuElement: HTMLElement;

	function handleClickOutside(event: MouseEvent) {
		if (menuElement && !menuElement.contains(event.target as Node)) {
			isOpen.set(false);
		}
	}

	$effect(() => {
		if ($isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});
</script>

<div bind:this={menuElement} class="relative inline-block">
	{@render children()}
</div>