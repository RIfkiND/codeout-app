<script lang="ts">
import type { LayoutData } from './$types';
import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';
import AdminHeader from '$lib/components/admin/AdminHeader.svelte';

let { children, data }: { children: any; data: LayoutData } = $props();
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<AdminHeader user={data.user} />
	
	<div class="flex">
		<AdminSidebar />
		
		<main class="flex-1 p-6">
			{@render children()}
		</main>
	</div>
</div>