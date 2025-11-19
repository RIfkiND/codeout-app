<script lang="ts">
	import { RotateCw, Plus, UserPlus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import ExportButton from '$lib/components/lobby/ExportButton.svelte';

	interface Props {
		onRefresh?: () => void;
		onCreate?: () => void;
		onJoin?: () => void;
		isLoading?: boolean;
		lobbies?: Record<string, unknown>[];
	}

	let { onRefresh, onCreate, onJoin, isLoading = false, lobbies = [] }: Props = $props();
	
	const handleRefresh = () => {
		console.log('Refresh button clicked');
		if (onRefresh) {
			onRefresh();
		}
	};
	
	const handleCreate = () => {
		console.log('Create button clicked');
		if (onCreate) {
			onCreate();
		}
	};
	
	const handleJoin = () => {
		console.log('Join button clicked');
		if (onJoin) {
			onJoin();
		}
	};
</script>

<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
	<div>
		<h1 class="text-3xl font-bold mb-2">Coding Lobbies</h1>
		<p class="text-neutral-400">Join or create lobbies to compete with other developers</p>
	</div>
	<div class="flex gap-2 mt-4 sm:mt-0">
		<ExportButton {lobbies} filename="all-lobbies" />
		
		<!-- HTML Button for testing -->
		<button
			onclick={handleRefresh}
			disabled={isLoading}
			class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-neutral-700 text-neutral-300 hover:bg-neutral-800 h-9 px-4 py-2 disabled:opacity-50"
		>
			<RotateCw class="w-4 h-4 mr-2 {isLoading ? 'animate-spin' : ''}" />
			Refresh
		</button>
		
		<!-- HTML Button for testing -->
		<button
			onclick={handleCreate}
			class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 py-2"
		>
			<Plus class="w-4 h-4 mr-2" />
			Create Lobby
		</button>

		<button
			onclick={handleJoin}
			class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 py-2"
		>
			<UserPlus class="w-4 h-4 mr-2" />
			Join Lobby
		</button>
	</div>
</div>