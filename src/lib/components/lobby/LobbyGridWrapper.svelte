<script lang="ts">
	import type { LobbyWithUsers } from '$lib/models/lobby';
	import type { Snippet } from 'svelte';

	interface Props {
		filteredLobbies: LobbyWithUsers[];
		isLoading: boolean;
		lobbiesLength: number;
		onCreateLobby?: () => void;
		children: Snippet;
	}

	let { filteredLobbies, isLoading, lobbiesLength, onCreateLobby, children }: Props = $props();
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-12">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
	</div>
{:else if filteredLobbies.length === 0}
	<div class="text-center py-12">
		<div class="text-neutral-400 mb-4">
			{lobbiesLength === 0 ? 'No lobbies created yet' : 'No lobbies match your filters'}
		</div>
		{#if lobbiesLength === 0}
			<button
				onclick={onCreateLobby}
				class="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-md text-white font-medium transition-colors"
			>
				Create the First Lobby
			</button>
		{/if}
	</div>
{:else}
	{@render children()}
{/if}