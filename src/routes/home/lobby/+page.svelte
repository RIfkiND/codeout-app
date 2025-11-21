
<script lang="ts">
	import { onMount } from 'svelte';
	import LobbyCard from '$lib/components/lobby/LobbyCard.svelte';
	import CreateLobbyModal from '$lib/components/lobby/CreateLobbyModal.svelte';
	import JoinLobbyModal from '$lib/components/lobby/JoinLobbyModal.svelte';
	import LobbyFilters from '$lib/components/lobby/LobbyFilters.svelte';
	import LobbyStats from '$lib/components/lobby/LobbyStats.svelte';
	import LobbyHeader from '$lib/components/lobby/LobbyHeader.svelte';
	import LobbyGridWrapper from '$lib/components/lobby/LobbyGridWrapper.svelte';
	import type { LobbyWithUsers } from '$lib/models/lobby';
	import type { PageData } from './$types';
	import { showSuccess, showError } from '$lib/stores/toast';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let lobbies: LobbyWithUsers[] = $state((data.lobbies as unknown as LobbyWithUsers[]) || []);
	let filteredLobbies: LobbyWithUsers[] = $state((data.lobbies as unknown as LobbyWithUsers[]) || []);
	let isLoading = $state(false);
	let showCreateModal = $state(false);
	let showJoinModal = $state(false);
	let searchQuery = $state('');
	let selectedStatus = $state('all');
	let sortBy = $state('created_at');
	let lobbyStats = $state(data.stats || {
		totalLobbies: 0,
		activeLobbies: 0,
		totalParticipants: 0
	});
	let refreshInterval: NodeJS.Timeout;
	let debounceTimeout: NodeJS.Timeout;

	const loadLobbies = async () => {
		// Prevent concurrent requests
		if (isLoading) return;
		
		console.log('loadLobbies called');
		isLoading = true;
		try {
			const response = await fetch('/api/lobbies');
			if (response.ok) {
				const data = await response.json();
				// Update lobbies data
				lobbies = (data.lobbies || []).map((lobby: any) => ({
					...lobby,
					lobby_users: lobby.lobby_users || []
				}));
				updateStats();
				// Don't call filterAndSortLobbies here - let effect handle it
			}
		} catch (error) {
			console.error('Failed to load lobbies:', error);
		} finally {
			isLoading = false;
		}
	};

	const updateStats = () => {
		lobbyStats = {
			totalLobbies: lobbies.length,
			activeLobbies: lobbies.filter(l => ['waiting', 'selecting_challenge', 'countdown', 'running'].includes(l.status)).length,
			totalParticipants: lobbies.reduce((sum, l) => sum + (l.lobby_users?.length || 0), 0)
		};
	};

	const filterAndSortLobbies = () => {
		// Skip filtering if no lobbies to avoid unnecessary work
		if (!lobbies || lobbies.length === 0) {
			filteredLobbies = [];
			return;
		}
		
		let filtered = [...lobbies];

		if (searchQuery.trim()) {
			filtered = filtered.filter(
				(lobby) =>
					lobby.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					lobby.description?.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (selectedStatus !== 'all') {
			if (selectedStatus === 'active') {
				// Match actual database status values: waiting, selecting_challenge, countdown, running
				filtered = filtered.filter((lobby) => ['waiting', 'selecting_challenge', 'countdown', 'running'].includes(lobby.status));
			} else {
				filtered = filtered.filter((lobby) => lobby.status === selectedStatus);
			}
		}

		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name': return a.name.localeCompare(b.name);
				case 'participants': return (b.lobby_users?.length || 0) - (a.lobby_users?.length || 0);
				default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			}
		});

		filteredLobbies = filtered;
	};

	const handleCreateLobby = async (lobbyData: any) => {
		try {
			const response = await fetch('/api/lobbies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(lobbyData)
			});

			if (response.ok) {
				showCreateModal = false;
				// Force immediate refresh without waiting for interval
				setTimeout(() => loadLobbies(), 100);
				showSuccess('Lobby Created', 'Your lobby has been created successfully!');
			} else {
				const errorData = await response.json();
				showError('Creation Failed', errorData.error || 'Failed to create lobby');
			}
		} catch (error) {
			console.error('Failed to create lobby:', error);
			showError('Creation Failed', 'An unexpected error occurred');
		}
	};

	const handleJoinLobby = async (lobbyId: string): Promise<void> => {
		try {
			const response = await fetch(`/api/lobbies/${lobbyId}/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				await loadLobbies();
				showSuccess('Joined Lobby', 'You have successfully joined the lobby!');
				// Navigate to the lobby page after joining
				window.location.href = `/home/lobby/${lobbyId}`;
			} else {
				const errorData = await response.json();
				showError('Join Failed', errorData.error || 'Failed to join lobby');
			}
		} catch (error) {
			console.error('Failed to join lobby:', error);
			showError('Join Failed', 'An unexpected error occurred while joining the lobby');
		}
	};

	const handleDeleteLobby = async (lobbyId: string): Promise<void> => {
		try {
			const response = await fetch(`/api/lobbies/${lobbyId}`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				await loadLobbies();
				showSuccess('Lobby Deleted', 'The lobby has been deleted successfully!');
			} else {
				const errorData = await response.json();
				showError('Delete Failed', errorData.error || 'Failed to delete lobby');
			}
		} catch (error) {
			console.error('Failed to delete lobby:', error);
			showError('Delete Failed', 'An unexpected error occurred while deleting the lobby');
		}
	};

	// Track when initial data is loaded
	let initialLoad = $state(true);
	
	// Only filter when specific dependencies change
	$effect(() => {
		// Track specific dependencies to prevent infinite loops
		const query = searchQuery;
		const status = selectedStatus; 
		const sort = sortBy;
		const currentLobbies = lobbies; // Track lobbies changes
		
		// Run immediately on initial load or when lobbies change
		if (initialLoad || currentLobbies !== lobbies) {
			filterAndSortLobbies();
			if (initialLoad) {
				initialLoad = false;
			}
			return;
		}
		
		// Debounce only search input to improve performance
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			filterAndSortLobbies();
		}, 300); // 300ms debounce for search
	});

	onMount(() => {
		// Set up real-time updates every 10 seconds (reduced frequency to prevent overload)
		refreshInterval = setInterval(async () => {
			if (!isLoading && document.visibilityState === 'visible') { // Only refresh when page is visible
				await loadLobbies();
			}
		}, 10000); // 10 seconds instead of 5
		
		// Cleanup on unmount
		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
			if (debounceTimeout) {
				clearTimeout(debounceTimeout);
			}
		};
	});
</script>

<div class="min-h-screen bg-neutral-950 p-4 text-neutral-100">
	<div class="mx-auto max-w-7xl">
		<LobbyHeader
			onRefresh={() => {
				console.log('Refresh function called from parent');
				loadLobbies();
			}}
			onCreate={() => {
				console.log('Create function called from parent');
				console.log('Current showCreateModal state:', showCreateModal);
				showCreateModal = true;
				console.log('New showCreateModal state:', showCreateModal);
			}}
			onJoin={() => {
				console.log('Join function called from parent');
				showJoinModal = true;
			}}
			{isLoading}
			lobbies={lobbies as unknown as Record<string, unknown>[]}
		/>

		<LobbyStats stats={lobbyStats} />

		<LobbyFilters
			{searchQuery}
			{selectedStatus}
			{sortBy}
			onSearchChange={(query) => (searchQuery = query)}
			onStatusChange={(status) => (selectedStatus = status)}
			onSortChange={(sort) => (sortBy = sort)}
		/>

		<LobbyGridWrapper
			{filteredLobbies}
			{isLoading}
			lobbiesLength={lobbies.length}
			onCreateLobby={() => (showCreateModal = true)}
		>
			{#snippet children()}
				<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each filteredLobbies as lobby (lobby.id)}
						<LobbyCard 
							{lobby} 
							onJoin={handleJoinLobby}
							onDelete={handleDeleteLobby}
							currentUserId={data.user?.id}
						/>
					{/each}
				</div>
			{/snippet}
		</LobbyGridWrapper>
	</div>
</div>

<CreateLobbyModal
	isOpen={showCreateModal}
	onClose={() => (showCreateModal = false)}
	onSubmit={handleCreateLobby}
/>

<JoinLobbyModal
	isOpen={showJoinModal}
	onClose={() => (showJoinModal = false)}
/>
