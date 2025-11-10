<script lang="ts">
	import { RefreshCw, Plus } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import ExportButton from '$lib/components/lobby/ExportButton.svelte';

	interface Props {
		onRefresh?: () => void;
		onCreate?: () => void;
		isLoading?: boolean;
		lobbies?: Record<string, unknown>[];
	}

	let { onRefresh, onCreate, isLoading = false, lobbies = [] }: Props = $props();
</script>

<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
	<div>
		<h1 class="text-3xl font-bold mb-2">Coding Lobbies</h1>
		<p class="text-neutral-400">Join or create lobbies to compete with other developers</p>
	</div>
	<div class="flex gap-2 mt-4 sm:mt-0">
		<ExportButton {lobbies} filename="all-lobbies" />
		<Button
			variant="outline"
			onclick={onRefresh}
			disabled={isLoading}
			class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
		>
			<RefreshCw class="w-4 h-4 mr-2 {isLoading ? 'animate-spin' : ''}" />
			Refresh
		</Button>
		<Button
			onclick={onCreate}
			class="bg-emerald-600 hover:bg-emerald-700"
		>
			<Plus class="w-4 h-4 mr-2" />
			Create Lobby
		</Button>
	</div>
</div>