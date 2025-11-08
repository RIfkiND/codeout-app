<script lang="ts">
	interface Props {
		children: any;
		class?: string;
	}

	let { children, class: className = '' }: Props = $props();
</script>

<div
	class="px-2 py-1.5 text-sm font-semibold {className}"
	style="color: rgb(163 163 163);"
>
	{@render children()}
</div>