<script lang="ts">
	import WysiwygEditor from '$lib/components/Editor/WysiwygEditor.svelte';
	import { createEventDispatcher } from 'svelte';

	export let challenge: any;
	export let editable: boolean = false;
	export let challengeId: string | null = null;

	const dispatch = createEventDispatcher<{
		error: string;
	}>();

	let editingDescription = false;
	let tempDescription = '';

	function startEditDescription() {
		if (!challenge || !editable) return;
		editingDescription = true;
		tempDescription = challenge.description;
	}

	function cancelEditDescription() {
		editingDescription = false;
		tempDescription = '';
	}

	async function saveDescription() {
		if (!challenge || !challengeId) return;
		
		try {
			const response = await fetch(`/api/challenges/${challengeId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					description: tempDescription
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to update challenge');
			}

			challenge.description = tempDescription;
			editingDescription = false;
			tempDescription = '';
		} catch (err) {
			dispatch('error', err instanceof Error ? err.message : 'Failed to save description');
		}
	}
</script>

<div class="mb-6">
	<div class="flex items-center justify-between mb-3">
		<h2 class="text-lg font-semibold text-gray-200">Description</h2>
		{#if editable && !editingDescription}
			<button 
				on:click={startEditDescription}
				class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
			>
				Edit
			</button>
		{/if}
	</div>
	
	{#if editingDescription}
		<div class="space-y-3">
			<WysiwygEditor 
				bind:content={tempDescription} 
				editable={true} 
				placeholder="Enter challenge description..."
			/>
			<div class="flex gap-2">
				<button 
					on:click={saveDescription}
					class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
				>
					Save
				</button>
				<button 
					on:click={cancelEditDescription}
					class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	{:else}
		<div class="prose prose-invert max-w-none text-gray-300">
			{@html challenge?.description || ''}
		</div>
	{/if}
</div>