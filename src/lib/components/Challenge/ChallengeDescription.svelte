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
		<h2 class="text-lg font-semibold text-white">Description</h2>
		{#if editable && !editingDescription}
			<button 
				on:click={startEditDescription}
				class="text-sm text-gray-300 hover:text-white transition-colors"
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
					class="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors"
				>
					Save
				</button>
				<button 
					on:click={cancelEditDescription}
					class="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	{:else}
		<div class="prose prose-invert max-w-none text-neutral-200 
					[&_code]:bg-gray-800/50 [&_code]:text-gray-200 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm [&_code]:border [&_code]:border-gray-600
					[&_pre]:bg-neutral-900 [&_pre]:text-gray-200 [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-gray-600 [&_pre]:my-4
					[&_h3]:text-white [&_h3]:font-semibold [&_h3]:mb-2
					[&_p]:text-neutral-200 [&_p]:leading-relaxed [&_p]:mb-3
					[&_ul]:text-neutral-200 [&_ul]:space-y-1 [&_ul]:ml-4 [&_ul]:list-disc
					[&_ol]:text-neutral-200 [&_ol]:space-y-1 [&_ol]:ml-4 [&_ol]:list-decimal
					[&_li]:text-neutral-200
					[&_strong]:font-semibold [&_strong]:text-white
					[&_em]:italic [&_em]:text-neutral-100">
			{@html challenge?.description || ''}
		</div>
	{/if}
</div>