<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		value?: string;
		onValueChange?: (value: string) => void;
		class?: string;
		children: Snippet;
	}
	
	let { value = '', onValueChange, class: className = '', children }: Props = $props();
	
	export { value as currentValue, onValueChange as onChange };
</script>

<div class="tabs {className}" data-value={value}>
	{@render children()}
</div>

<style>
	.tabs {
		width: 100%;
	}
</style>