
<script lang="ts">
	import { onMount } from 'svelte';
	import LobbyCard from '$lib/components/lobby/LobbyCard.svelte';
	import CreateLobbyModal from '$lib/components/lobby/CreateLobbyModal.svelte';
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
	let filteredLobbies: LobbyWithUsers[] = $state([]);
	let isLoading = $state(false);
	let showCreateModal = $state(false);
	let searchQuery = $state('');
	let selectedStatus = $state('all');
	let sortBy = $state('created_at');
	let lobbyStats = $state(data.stats || {
		totalLobbies: 0,
		activeLobbies: 0,
		totalParticipants: 0
	});
	let refreshInterval: NodeJS.Timeout;

	const loadLobbies = async () => {
		isLoading = true;
		try {
			const response = await fetch('/api/lobbies');
			if (response.ok) {
				const data = await response.json();
				lobbies = (data.lobbies || []).map((lobby: any) => ({
					...lobby,
					// Ensure lobby_users exists even if empty
					lobby_users: lobby.lobby_users || []
				}));
				updateStats();
				filterAndSortLobbies();
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
			activeLobbies: lobbies.filter(l => ['pending', 'active', 'running', 'challenge_transition'].includes(l.status)).length,
			totalParticipants: lobbies.reduce((sum, l) => sum + (l.lobby_users?.length || 0), 0)
		};
	};

	const filterAndSortLobbies = () => {
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
				filtered = filtered.filter((lobby) => ['pending', 'active', 'running', 'challenge_transition'].includes(lobby.status));
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
				await loadLobbies();
			}
		} catch (error) {
			console.error('Failed to create lobby:', error);
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

	$effect(() => {
		filterAndSortLobbies();
	});

	onMount(() => {
		filterAndSortLobbies();
		
		// Set up real-time updates every 3 seconds
		refreshInterval = setInterval(async () => {
			await loadLobbies();
		}, 3000);
		
		// Cleanup on unmount
		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
		};
	});
</script>

<div class="min-h-screen bg-neutral-950 p-4 text-neutral-100">
	<div class="mx-auto max-w-7xl">
		<LobbyHeader
			onRefresh={loadLobbies}
			onCreate={() => (showCreateModal = true)}
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
