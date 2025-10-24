<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import { createSupabaseLoadClient } from '$lib/supabaseClient';

<<<<<<< HEAD
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
=======
	import { setMode } from 'mode-watcher';
	setMode('dark');

	let { children } = $props();
>>>>>>> 9e4402bebfde05d2208c795560dd705838f391c0
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher />
{@render children?.()}
