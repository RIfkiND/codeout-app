<script lang="ts">
	import { X, Users, Lock, Search } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { showError, showSuccess } from '$lib/stores/toast';
	import { goto } from '$app/navigation';

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
	}

	interface LobbyPreview {
		id: string;
		name: string;
		description: string | null;
		status: string;
		max_participants: number;
		participant_count: number;
		is_private: boolean;
		created_at: string;
		time_limit_minutes: number | null;
		creator_name: string;
	}

	let { isOpen = false, onClose }: Props = $props();

	let lobbyCode = $state('');
	let isSearching = $state(false);
	let isJoining = $state(false);
	let lobbyPreview = $state<LobbyPreview | null>(null);
	let searchError = $state('');

	const resetModal = () => {
		lobbyCode = '';
		lobbyPreview = null;
		searchError = '';
		isSearching = false;
		isJoining = false;
	};

	const handleClose = () => {
		resetModal();
		onClose?.();
	};

	const searchLobby = async () => {
		if (!lobbyCode.trim()) {
			searchError = 'Please enter a lobby code';
			return;
		}

		isSearching = true;
		searchError = '';
		lobbyPreview = null;

		try {
			const response = await fetch(`/api/lobbies/search?code=${encodeURIComponent(lobbyCode.trim())}`);
			
			if (response.ok) {
				const data = await response.json();
				lobbyPreview = data.lobby;
			} else {
				const errorData = await response.json();
				searchError = errorData.error || 'Lobby not found';
			}
		} catch (error) {
			console.error('Search error:', error);
			searchError = 'Failed to search for lobby';
		} finally {
			isSearching = false;
		}
	};

	const joinLobby = async () => {
		if (!lobbyPreview) return;

		isJoining = true;
		try {
			const response = await fetch(`/api/lobbies/${lobbyPreview.id}/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				showSuccess('Joined Lobby', `Successfully joined "${lobbyPreview.name}"!`);
				handleClose();
				// Navigate to the lobby
				goto(`/home/lobby/${lobbyPreview.id}`);
			} else {
				const errorData = await response.json();
				searchError = errorData.error || 'Failed to join lobby';
			}
		} catch (error) {
			console.error('Join error:', error);
			searchError = 'Failed to join lobby';
		} finally {
			isJoining = false;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatTimeLimit = (minutes: number | null) => {
		if (!minutes) return 'No limit';
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'running':
				return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
			case 'waiting':
				return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
			case 'selecting_challenge':
			case 'countdown':
				return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
			case 'finished':
				return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
			default:
				return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
		}
	};

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			searchLobby();
		}
	};
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<Card class="w-full max-w-md bg-neutral-900 border-neutral-800">
			<CardHeader class="flex flex-row items-center justify-between">
				<div>
					<CardTitle class="text-neutral-100 flex items-center gap-2">
						<Users class="w-5 h-5 text-blue-400" />
						Join Lobby
					</CardTitle>
					<CardDescription class="text-neutral-400">
						Enter a lobby code to join an existing lobby
					</CardDescription>
				</div>
				<Button variant="ghost" size="sm" onclick={handleClose} class="text-neutral-400 hover:text-neutral-100">
					<X class="w-4 h-4" />
				</Button>
			</CardHeader>
			
			<CardContent class="space-y-4">
				<!-- Lobby Code Input -->
				<div class="space-y-2">
					<Label for="lobbyCode" class="text-sm font-medium text-neutral-200">
						Lobby Code
					</Label>
					<div class="flex gap-2">
						<Input
							id="lobbyCode"
							bind:value={lobbyCode}
							placeholder="Enter lobby code or ID..."
							class="flex-1 bg-neutral-800 border-neutral-700 text-neutral-100"
							onkeypress={handleKeyPress}
							disabled={isSearching}
						/>
						<Button
							onclick={searchLobby}
							disabled={isSearching || !lobbyCode.trim()}
							class="bg-blue-600 hover:bg-blue-700"
						>
							{#if isSearching}
								<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							{:else}
								<Search class="w-4 h-4" />
							{/if}
						</Button>
					</div>
					{#if searchError}
						<p class="text-sm text-red-400">{searchError}</p>
					{/if}
				</div>

				<!-- Lobby Preview -->
				{#if lobbyPreview}
					<div class="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
						<div class="flex items-start justify-between mb-3">
							<div class="flex-1">
								<h3 class="font-semibold text-neutral-100 flex items-center gap-2">
									{lobbyPreview.name}
									{#if lobbyPreview.is_private}
										<Lock class="w-4 h-4 text-amber-400" />
									{/if}
								</h3>
								{#if lobbyPreview.description}
									<p class="text-sm text-neutral-400 mt-1">{lobbyPreview.description}</p>
								{/if}
							</div>
							<Badge class={getStatusColor(lobbyPreview.status)}>
								{lobbyPreview.status}
							</Badge>
						</div>

						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<div class="text-neutral-400">Participants</div>
								<div class="font-medium text-neutral-200">
									{lobbyPreview.participant_count}/{lobbyPreview.max_participants}
								</div>
							</div>
							<div>
								<div class="text-neutral-400">Time Limit</div>
								<div class="font-medium text-neutral-200">
									{formatTimeLimit(lobbyPreview.time_limit_minutes)}
								</div>
							</div>
							<div>
								<div class="text-neutral-400">Creator</div>
								<div class="font-medium text-neutral-200">{lobbyPreview.creator_name}</div>
							</div>
							<div>
								<div class="text-neutral-400">Created</div>
								<div class="font-medium text-neutral-200">{formatDate(lobbyPreview.created_at)}</div>
							</div>
						</div>

						<!-- Join Status -->
						{#if lobbyPreview.status === 'finished'}
							<div class="mt-3 p-2 bg-neutral-500/20 rounded text-sm text-neutral-400 text-center">
								This lobby has finished
							</div>
						{:else if lobbyPreview.participant_count >= lobbyPreview.max_participants}
							<div class="mt-3 p-2 bg-amber-500/20 rounded text-sm text-amber-400 text-center">
								This lobby is full
							</div>
						{:else if lobbyPreview.status === 'waiting'}
							<Button
								onclick={joinLobby}
								disabled={isJoining}
								class="w-full mt-3 bg-emerald-600 hover:bg-emerald-700"
							>
								{#if isJoining}
									<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
									Joining...
								{:else}
									<Users class="w-4 h-4 mr-2" />
									Join Lobby
								{/if}
							</Button>
						{:else}
							<Button
								onclick={joinLobby}
								disabled={isJoining}
								class="w-full mt-3 bg-blue-600 hover:bg-blue-700"
							>
								{#if isJoining}
									<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
									Joining...
								{:else}
									<Users class="w-4 h-4 mr-2" />
									Join Live
								{/if}
							</Button>
						{/if}
					</div>
				{/if}

				<!-- Help Text -->
				{#if !lobbyPreview && !searchError}
					<div class="text-center py-4">
						<Users class="w-8 h-8 mx-auto text-neutral-600 mb-2" />
						<p class="text-sm text-neutral-400">
							Enter a lobby code to find and join a lobby
						</p>
						<p class="text-xs text-neutral-500 mt-1">
							Lobby codes are usually shared by the lobby creator
						</p>
					</div>
				{/if}

				<!-- Cancel Button -->
				<div class="flex justify-end pt-2 border-t border-neutral-800">
					<Button
						variant="outline"
						onclick={handleClose}
						class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
					>
						Cancel
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
{/if}