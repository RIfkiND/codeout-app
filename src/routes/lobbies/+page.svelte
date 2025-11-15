<script lang="ts">
	import type { PageData } from './$types';
	import LobbyHeader from '$lib/components/lobby/LobbyHeader.svelte';
	import LobbyCard from '$lib/components/lobby/LobbyCard.svelte';
	import CreateLobbyModal from '$lib/components/lobby/CreateLobbyModal.svelte';
	import LobbyFilters from '$lib/components/lobby/LobbyFilters.svelte';
	import { showError, showSuccess } from '$lib/stores/toast';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	// Modal state
	let createModalOpen = $state(false);
	let selectedFilter = $state('all');

	function handleCreateLobby() {
		createModalOpen = true;
	}

	function handleFilterChange(filter: string) {
		selectedFilter = filter;
	}

	async function handleLobbySubmit(lobbyData: any) {
		try {
			const response = await fetch('/api/lobbies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(lobbyData)
			});

			if (response.ok) {
				const result = await response.json();
				createModalOpen = false;
				showSuccess('Lobby Created!', 'Your lobby has been created successfully.');
				goto(`/lobbies/${result.lobby.id}`);
			} else {
				const error = await response.json();
				showError('Failed to Create Lobby', error.error || 'Please try again later.');
			}
		} catch (error) {
			console.error('Error creating lobby:', error);
			showError('Network Error', 'Unable to connect to the server. Please check your connection.');
		}
	}
</script>

<svelte:head>
	<title>Lobbies - CodeOut</title>
	<meta name="description" content="Join multiplayer coding lobbies and compete with other developers" />
</svelte:head>

<div class="min-h-screen bg-neutral-950">
	<LobbyHeader 
		user={data.user} 
		onCreateLobby={handleCreateLobby} 
	/>
	
	<div class="container mx-auto px-4 py-8">
		<LobbyFilters 
			selectedFilter={selectedFilter}
			onFilterChange={handleFilterChange}
		/>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each (data.lobbies || []) as lobby (lobby.id)}
				<LobbyCard 
					{lobby} 
					currentUserId={data.user?.id}
				/>
			{/each}
		</div>
	</div>
	
	<CreateLobbyModal 
		bind:isOpen={createModalOpen} 
		onSubmit={handleLobbySubmit}
		onClose={() => createModalOpen = false}
	/>
</div>