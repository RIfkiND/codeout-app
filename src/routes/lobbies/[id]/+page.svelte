<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// Redirect old lobby detail routes to home/lobby system
	onMount(() => {
		const lobbyId = $page.params.id;
		goto(`/home/lobby/${lobbyId}`, { replaceState: true });
	});
</script>

<svelte:head>
	<title>Redirecting - CodeOut</title>
</svelte:head>

<div class="min-h-screen bg-neutral-950 flex items-center justify-center">
	<div class="text-center text-neutral-100">
		<div class="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
		<p>Redirecting to lobby...</p>
	</div>
</div>