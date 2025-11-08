<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		value: string;
		class?: string;
		children: Snippet;
	}
	
	let { value, class: className = '', children, ...props }: Props = $props();
</script>

<button 
	class="tabs-trigger {className}"
	data-value={value}
	type="button"
	{...props}
>
	{@render children()}
</button>

<style>
	.tabs-trigger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		border-radius: 0.125rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		transition: all 150ms;
	}
	
	.tabs-trigger:hover {
		background-color: rgb(38 38 38);
	}
	
	.tabs-trigger[data-state="active"] {
		background-color: white;
		color: rgb(10 10 10);
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}
</style>