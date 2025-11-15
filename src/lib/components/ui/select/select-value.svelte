<script lang="ts">
	interface Props {
		placeholder?: string;
		class?: string;
	}

	let { placeholder = "Select an option...", class: className = "", ...restProps }: Props = $props();
</script>

<span class="pointer-events-none {className}" {...restProps}>
	{placeholder}
</span>