<script lang="ts">
import type { PageData } from './$types';
import AdminTemplatesList from '$lib/components/admin/AdminTemplatesList.svelte';
import AdminTemplatesStats from '$lib/components/admin/AdminTemplatesStats.svelte';
import CreateTemplateModal from '$lib/components/admin/CreateTemplateModal.svelte';
import { Button } from '$lib/components/ui/button';
import { Plus } from 'lucide-svelte';

let { data }: { data: PageData } = $props();

let showCreateModal = $state(false);

const handleCreateTemplate = async (templateData: any) => {
	try {
		const response = await fetch('/api/admin/templates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(templateData)
		});

		if (response.ok) {
			showCreateModal = false;
			// Reload page to show new template
			window.location.reload();
		} else {
			const error = await response.json();
			console.error('Template creation failed:', error);
		}
	} catch (error) {
		console.error('Template creation error:', error);
	}
};
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<div class="max-w-7xl mx-auto p-6">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold">Challenge Templates</h1>
				<p class="text-neutral-400 mt-2">Manage reusable code templates for challenges</p>
			</div>
			<Button
				onclick={() => showCreateModal = true}
				class="bg-emerald-600 hover:bg-emerald-700"
			>
				<Plus class="w-4 h-4 mr-2" />
				Create Template
			</Button>
		</div>

		<!-- Stats -->
		<AdminTemplatesStats stats={data.stats} />

		<!-- Templates List -->
		<AdminTemplatesList templates={data.templates} languages={data.languages} />

		<!-- Create Template Modal -->
		{#if showCreateModal}
			<CreateTemplateModal
				isOpen={showCreateModal}
				languages={data.languages}
				onClose={() => showCreateModal = false}
				onSubmit={handleCreateTemplate}
			/>
		{/if}
	</div>
</div>