<script lang="ts">
	import { cn } from "$lib/utils";

	export let className: string = "";
</script>

<div class={cn("text-sm [&_p]:leading-relaxed", className)} {...$$restProps}>
	<slot />
</div>