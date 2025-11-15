<script lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import { Edit3, Trash2, Eye, Copy, Globe, Lock } from 'lucide-svelte';

interface Template {
	id: string;
	name: string;
	description: string;
	language: string;
	template_data: any;
	is_public: boolean;
	created_at: string;
	created_by_user?: {
		id: string;
		name: string;
	};
}

interface Language {
	id: string;
	name: string;
	display_name: string;
}

interface Props {
	templates: Template[];
	languages: Language[];
}

let { templates, languages }: Props = $props();

const getLanguageDisplay = (langName: string) => {
	const language = languages.find(l => l.name === langName);
	return language?.display_name || langName;
};

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};

const handleEdit = (template: Template) => {
	// TODO: Implement edit functionality
	console.log('Edit template:', template.id);
};

const handleDelete = async (template: Template) => {
	if (!confirm(`Are you sure you want to delete "${template.name}"?`)) {
		return;
	}

	try {
		const response = await fetch(`/api/admin/templates/${template.id}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			window.location.reload();
		} else {
			console.error('Delete failed');
		}
	} catch (error) {
		console.error('Delete error:', error);
	}
};

const handleViewTemplate = (template: Template) => {
	// TODO: Implement template preview modal
	console.log('View template:', template);
};

const handleDuplicate = async (template: Template) => {
	try {
		const duplicateData = {
			name: `${template.name} (Copy)`,
			description: template.description,
			language: template.language,
			template_data: template.template_data,
			is_public: false
		};

		const response = await fetch('/api/admin/templates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(duplicateData)
		});

		if (response.ok) {
			window.location.reload();
		}
	} catch (error) {
		console.error('Duplicate error:', error);
	}
};
</script>

<Card class="bg-neutral-900 border-neutral-800">
	<CardHeader>
		<CardTitle class="text-neutral-100">Templates ({templates.length})</CardTitle>
	</CardHeader>
	<CardContent>
		{#if templates.length === 0}
			<div class="text-center py-12">
				<div class="text-neutral-400 mb-4">No templates found</div>
				<p class="text-sm text-neutral-500">Create your first template to get started</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each templates as template}
					<div class="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
						<div class="flex-1">
							<div class="flex items-center gap-3 mb-2">
								<h3 class="font-semibold text-neutral-100">{template.name}</h3>
								<Badge variant="outline" class="border-blue-500/30 text-blue-400">
									{getLanguageDisplay(template.language)}
								</Badge>
								{#if template.is_public}
									<Badge class="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
										<Globe class="w-3 h-3 mr-1" />
										Public
									</Badge>
								{:else}
									<Badge variant="outline" class="border-amber-500/30 text-amber-400">
										<Lock class="w-3 h-3 mr-1" />
										Private
									</Badge>
								{/if}
							</div>
							
							{#if template.description}
								<p class="text-sm text-neutral-400 mb-2">{template.description}</p>
							{/if}
							
							<div class="text-xs text-neutral-500">
								Created {formatDate(template.created_at)}
								{#if template.created_by_user}
									by {template.created_by_user.name}
								{/if}
							</div>
						</div>
						
						<div class="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={() => handleViewTemplate(template)}
								class="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
							>
								<Eye class="w-4 h-4" />
							</Button>
							
							<Button
								variant="outline"
								size="sm"
								onclick={() => handleDuplicate(template)}
								class="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
							>
								<Copy class="w-4 h-4" />
							</Button>
							
							<Button
								variant="outline"
								size="sm"
								onclick={() => handleEdit(template)}
								class="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
							>
								<Edit3 class="w-4 h-4" />
							</Button>
							
							<Button
								variant="outline"
								size="sm"
								onclick={() => handleDelete(template)}
								class="border-red-600 text-red-400 hover:bg-red-600/10"
							>
								<Trash2 class="w-4 h-4" />
							</Button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>