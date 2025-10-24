<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="px-16">
	<header class="sticky top-0 w-full bg-transparent">
		<div class="flex justify-around py-4">
			<div class="flex grow justify-start">
				<div class="text-2xl">CodeOut</div>
			</div>
		</div>
	</header>

	{@render children()}
</div>
