<script lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Label } from '$lib/components/ui/label';
import { X } from 'lucide-svelte';

interface Language {
	id: string;
	name: string;
	display_name: string;
	template_code?: string;
}

interface Props {
	isOpen?: boolean;
	languages: Language[];
	onClose?: () => void;
	onSubmit?: (templateData: any) => void;
}

let { isOpen = false, languages, onClose, onSubmit }: Props = $props();

let formData = $state({
	name: '',
	description: '',
	language: 'javascript',
	templateCode: '',
	isPublic: false,
	category: 'general',
	tags: [] as string[]
});

let isSubmitting = $state(false);
let newTag = $state('');

const predefinedTags = [
	'algorithms', 'data-structures', 'arrays', 'strings', 'trees', 'graphs',
	'dynamic-programming', 'recursion', 'sorting', 'searching', 'math',
	'geometry', 'greedy', 'backtracking', 'two-pointers', 'sliding-window'
];

const categories = [
	'general', 'algorithms', 'data-structures', 'web-development', 
	'system-design', 'mathematics', 'string-manipulation', 'database'
];

const loadLanguageTemplate = () => {
	const selectedLang = languages.find(l => l.name === formData.language);
	if (selectedLang?.template_code) {
		formData.templateCode = selectedLang.template_code;
	}
};

const addTag = () => {
	if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
		formData.tags = [...formData.tags, newTag.trim().toLowerCase()];
		newTag = '';
	}
};

const removeTag = (tagToRemove: string) => {
	formData.tags = formData.tags.filter(tag => tag !== tagToRemove);
};

const addPredefinedTag = (tag: string) => {
	if (!formData.tags.includes(tag)) {
		formData.tags = [...formData.tags, tag];
	}
};

const handleSubmit = async (e: Event) => {
	e.preventDefault();
	
	if (!formData.name.trim() || !formData.language || !formData.templateCode.trim()) {
		alert('Please fill in all required fields');
		return;
	}

	isSubmitting = true;
	
	try {
		const templateData = {
			name: formData.name.trim(),
			description: formData.description.trim() || null,
			language: formData.language,
			category: formData.category,
			tags: formData.tags,
			template_data: {
				code: formData.templateCode,
				metadata: {
					created_at: new Date().toISOString(),
					version: '1.0'
				},
				structure: 'basic'
			},
			is_public: formData.isPublic
		};

		await onSubmit?.(templateData);
		
		// Reset form
		formData = {
			name: '',
			description: '',
			language: '',
			templateCode: '',
			isPublic: false,
			category: '',
			tags: []
		};
	} catch (error) {
		console.error('Template creation error:', error);
	} finally {
		isSubmitting = false;
	}
};

const handleClose = () => {
	formData = {
		name: '',
		description: '',
		language: '',
		templateCode: '',
		isPublic: false,
		category: '',
		tags: []
	};
	onClose?.();
};
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<Card class="w-full max-w-2xl bg-neutral-900 border-neutral-800 max-h-[90vh] overflow-hidden">
			<CardHeader class="flex flex-row items-center justify-between">
				<div>
					<CardTitle class="text-neutral-100">Create Template</CardTitle>
					<CardDescription class="text-neutral-400">
						Create a reusable code template for challenges
					</CardDescription>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onclick={handleClose}
					class="text-neutral-400 hover:text-neutral-100"
				>
					<X class="w-4 h-4" />
				</Button>
			</CardHeader>
			
			<CardContent class="overflow-y-auto">
				<form onsubmit={handleSubmit} class="space-y-6">
					<!-- Template Name -->
					<div class="space-y-2">
						<Label for="name" class="text-neutral-200">Template Name *</Label>
						<Input
							id="name"
							bind:value={formData.name}
							placeholder="e.g., Array Manipulation Template"
							class="bg-neutral-800 border-neutral-600 text-neutral-100"
							required
						/>
					</div>

					<!-- Description -->
					<div class="space-y-2">
						<Label for="description" class="text-neutral-200">Description</Label>
						<Textarea
							id="description"
							bind:value={formData.description}
							placeholder="Describe what this template is for..."
							rows={3}
							class="bg-neutral-800 border-neutral-600 text-neutral-100"
						/>
					</div>

					<!-- Language Selection -->
					<div class="space-y-2">
						<Label for="language" class="text-neutral-200">Programming Language *</Label>
						<select
							id="language"
							bind:value={formData.language}
							onchange={() => {
								const language = languages.find(l => l.name === formData.language);
								if (language?.template_code) {
									formData.templateCode = language.template_code;
								}
							}}
							class="bg-neutral-800 border-neutral-600 text-neutral-100 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 border"
							required
						>
							<option value="">Select a language</option>
							{#each languages as language}
								<option value={language.name}>{language.display_name}</option>
							{/each}
						</select>
					</div>

					<!-- Template Code -->
					<div class="space-y-2">
						<Label for="code" class="text-neutral-200">Template Code *</Label>
						<Textarea
							id="code"
							bind:value={formData.templateCode}
							placeholder="Enter your template code here..."
							rows={12}
							class="bg-neutral-800 border-neutral-600 text-neutral-100 font-mono text-sm"
							required
						/>
						<p class="text-xs text-neutral-500">
							Use placeholders like SOLUTION where users should write their code
						</p>
					</div>

					<!-- Public Checkbox -->
					<div class="flex items-center space-x-2">
						<input
							type="checkbox"
							id="public"
							bind:checked={formData.isPublic}
							class="rounded bg-neutral-800 border-neutral-600"
						/>
						<Label for="public" class="text-neutral-200">Make this template public</Label>
					</div>

					<!-- Actions -->
					<div class="flex justify-end gap-3 pt-4 border-t border-neutral-700">
						<Button
							type="button"
							variant="outline"
							onclick={handleClose}
							class="border-neutral-600 text-neutral-300 hover:bg-neutral-700"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							class="bg-emerald-600 hover:bg-emerald-700"
						>
							{isSubmitting ? 'Creating...' : 'Create Template'}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
{/if}