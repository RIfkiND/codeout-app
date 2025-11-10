<script lang="ts">
	import { cn } from "$lib/utils";
	import type { VariantProps } from "tailwind-variants";
	import { tv } from "tailwind-variants";

	const alertVariants = tv({
		base: "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
		variants: {
			variant: {
				default: "bg-background text-foreground",
				destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
			}
		},
		defaultVariants: {
			variant: "default"
		}
	});

	type Variant = VariantProps<typeof alertVariants>["variant"];

	export let className: string = "";
	export let variant: Variant = "default";
</script>

<div class={cn(alertVariants({ variant }), className)} role="alert" {...$$restProps}>
	<slot />
</div>