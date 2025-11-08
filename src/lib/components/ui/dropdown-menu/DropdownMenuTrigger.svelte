<script lang="ts">
	import { getContext } from 'svelte';

	interface Props {
		children: any;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();

	const { isOpen } = getContext<{ isOpen: any }>('dropdown-menu');

	function handleClick() {
		isOpen.update((open: boolean) => !open);
	}
</script>

<button
	onclick={handleClick}
	class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 {className}"
	type="button"
>
	{@render children()}
</button>