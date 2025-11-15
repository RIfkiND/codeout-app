<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { createSupabaseLoadClient } from '$lib/supabaseClient';
	import { setMode } from 'mode-watcher';
	import Toaster from '$lib/components/ui/Toaster.svelte';

	let { children, data }: { children: any; data: LayoutData } = $props();

	onMount(() => {
		const supabase = createSupabaseLoadClient();

		const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				invalidate('supabase:auth');
			}
		});

		return () => authListener.subscription.unsubscribe();
	});

	setMode('dark');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
{@render children?.()}
<Toaster />
