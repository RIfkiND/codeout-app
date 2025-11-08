<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		value: string;
		class?: string;
		children: Snippet;
	}
	
	let { value, class: className = '', children, ...props }: Props = $props();
</script>

<div 
	class="tabs-content {className}"
	data-value={value}
	{...props}
>
	{@render children()}
</div>

<style>
	.tabs-content {
		margin-top: 0.5rem;
	}
</style>