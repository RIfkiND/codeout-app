<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		class?: string;
		children: Snippet;
	}
	
	let { class: className = '', children }: Props = $props();
</script>

<div class="tabs-list {className}">
	{@render children()}
</div>

<style>
	.tabs-list {
		display: inline-flex;
		height: 2.5rem;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		padding: 0.25rem;
	}
</style>