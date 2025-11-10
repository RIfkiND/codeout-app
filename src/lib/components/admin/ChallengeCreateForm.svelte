<script lang="ts">
import { enhance } from '$app/forms';
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Textarea } from '$lib/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
import { Badge } from '$lib/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
import { Plus, Trash2, Save, Eye } from 'lucide-svelte';

interface Language {
	id: string;
	name: string;
	display_name: string;
	template_code?: string;
}

interface TestCase {
	input: string;
	output: string;
	explanation?: string;
}

let { languages }: { languages: Language[] } = $props();

// Form state
let title = $state('');
let description = $state('');
let difficulty = $state('easy');
let tagInput = $state('');
let tags: string[] = $state([]);
let timeLimit = $state(1000);
let memoryLimit = $state(256);
let starterCode = $state('');
let solutionCode = $state('');
let testCases: TestCase[] = $state([
	{ input: '', output: '', explanation: '' }
]);
let submitting = $state(false);

const difficulties = [
	{ value: 'easy', label: 'Easy', color: 'bg-green-500/20 text-green-400' },
	{ value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-400' },
	{ value: 'hard', label: 'Hard', color: 'bg-red-500/20 text-red-400' }
];

function addTag() {
	const tag = tagInput.trim();
	if (tag && !tags.includes(tag)) {
		tags = [...tags, tag];
		tagInput = '';
	}
}

function removeTag(tagToRemove: string) {
	tags = tags.filter(tag => tag !== tagToRemove);
}

function addTestCase() {
	testCases = [...testCases, { input: '', output: '', explanation: '' }];
}

function removeTestCase(index: number) {
	if (testCases.length > 1) {
		testCases = testCases.filter((_, i) => i !== index);
	}
}

function updateTestCase(index: number, field: keyof TestCase, value: string) {
	testCases = testCases.map((tc, i) => 
		i === index ? { ...tc, [field]: value } : tc
	);
}
</script>

<form 
	method="POST"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			submitting = false;
			update();
		};
	}}
>
	<div class="space-y-8">
		<!-- Basic Information -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6">Basic Information</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div class="md:col-span-2">
					<Label for="title" class="text-neutral-300">Challenge Title</Label>
					<Input
						id="title"
						name="title"
						bind:value={title}
						placeholder="Enter challenge title..."
						class="bg-neutral-800 border-neutral-700 text-neutral-100"
						required
					/>
				</div>
				
				<div>
					<Label for="difficulty" class="text-neutral-300">Difficulty</Label>
					<Select name="difficulty" bind:value={difficulty}>
						<SelectTrigger class="bg-neutral-800 border-neutral-700 text-neutral-100">
							<SelectValue placeholder="Select difficulty" />
						</SelectTrigger>
						<SelectContent class="bg-neutral-800 border-neutral-700">
							{#each difficulties as diff}
								<SelectItem value={diff.value} class="text-neutral-100 hover:bg-neutral-700">
									<div class="flex items-center space-x-2">
										<Badge class="{diff.color} text-xs">{diff.label}</Badge>
									</div>
								</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</div>
				
				<div>
					<Label for="timeLimit" class="text-neutral-300">Time Limit (ms)</Label>
					<Input
						id="timeLimit"
						name="time_limit"
						type="number"
						bind:value={timeLimit}
						min="100"
						max="10000"
						class="bg-neutral-800 border-neutral-700 text-neutral-100"
					/>
				</div>
				
				<div>
					<Label for="memoryLimit" class="text-neutral-300">Memory Limit (MB)</Label>
					<Input
						id="memoryLimit"
						name="memory_limit"
						type="number"
						bind:value={memoryLimit}
						min="64"
						max="1024"
						class="bg-neutral-800 border-neutral-700 text-neutral-100"
					/>
				</div>
			</div>
			
			<!-- Tags -->
			<div class="mt-6">
				<Label for="tags" class="text-neutral-300">Tags</Label>
				<div class="flex space-x-2 mt-2">
					<Input
						bind:value={tagInput}
						placeholder="Add tags..."
						class="bg-neutral-800 border-neutral-700 text-neutral-100"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addTag();
							}
						}}
					/>
					<Button type="button" onclick={addTag} variant="outline" class="border-neutral-700">
						<Plus class="h-4 w-4" />
					</Button>
				</div>
				<input type="hidden" name="tags" value={tags.join(',')} />
				{#if tags.length > 0}
					<div class="flex flex-wrap gap-2 mt-3">
						{#each tags as tag}
							<Badge class="bg-neutral-800 text-neutral-300 border-neutral-600">
								{tag}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class="h-auto p-0 ml-1 text-neutral-400 hover:text-red-400"
									onclick={() => removeTag(tag)}
								>
									<Trash2 class="h-3 w-3" />
								</Button>
							</Badge>
						{/each}
					</div>
				{/if}
			</div>
		</Card>
		
		<!-- Description -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6">Problem Description</h2>
			<Textarea
				name="description"
				bind:value={description}
				placeholder="Describe the problem, constraints, examples..."
				rows={10}
				class="bg-neutral-800 border-neutral-700 text-neutral-100"
				required
			/>
		</Card>
		
		<!-- Code Templates -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6">Code Templates</h2>
			<Tabs defaultValue="starter" class="w-full">
				<TabsList class="bg-neutral-800 border-neutral-700">
					<TabsTrigger value="starter" class="text-neutral-300">Starter Code</TabsTrigger>
					<TabsTrigger value="solution" class="text-neutral-300">Solution Code</TabsTrigger>
				</TabsList>
				<TabsContent value="starter" class="mt-4">
					<Textarea
						name="starter_code"
						bind:value={starterCode}
						placeholder="Enter starter code template..."
						rows={8}
						class="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono"
					/>
				</TabsContent>
				<TabsContent value="solution" class="mt-4">
					<Textarea
						name="solution_code"
						bind:value={solutionCode}
						placeholder="Enter solution code..."
						rows={8}
						class="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono"
					/>
				</TabsContent>
			</Tabs>
		</Card>
		
		<!-- Test Cases -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-semibold text-neutral-100">Test Cases</h2>
				<Button type="button" onclick={addTestCase} variant="outline" size="sm" class="border-neutral-700">
					<Plus class="h-4 w-4 mr-2" />
					Add Test Case
				</Button>
			</div>
			
			<div class="space-y-4">
				{#each testCases as testCase, index}
					<div class="border border-neutral-700 rounded-lg p-4">
						<div class="flex items-center justify-between mb-4">
							<h3 class="font-medium text-neutral-300">Test Case {index + 1}</h3>
							{#if testCases.length > 1}
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class="text-red-400 hover:text-red-300"
									onclick={() => removeTestCase(index)}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							{/if}
						</div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label class="text-neutral-400">Input</Label>
								<Textarea
									value={testCase.input}
									oninput={(e) => updateTestCase(index, 'input', e.target?.value || '')}
									placeholder="Test input..."
									rows={3}
									class="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono text-sm"
								/>
							</div>
							<div>
								<Label class="text-neutral-400">Expected Output</Label>
								<Textarea
									value={testCase.output}
									oninput={(e) => updateTestCase(index, 'output', e.target?.value || '')}
									placeholder="Expected output..."
									rows={3}
									class="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono text-sm"
								/>
							</div>
						</div>
						
						<div class="mt-4">
							<Label class="text-neutral-400">Explanation (Optional)</Label>
							<Textarea
								value={testCase.explanation || ''}
								oninput={(e) => updateTestCase(index, 'explanation', e.target?.value || '')}
								placeholder="Explain this test case..."
								rows={2}
								class="bg-neutral-800 border-neutral-700 text-neutral-100 text-sm"
							/>
						</div>
					</div>
				{/each}
			</div>
			
			<input type="hidden" name="test_cases" value={JSON.stringify(testCases)} />
		</Card>
		
		<!-- Submit Button -->
		<div class="flex justify-end space-x-4">
			<Button type="button" variant="outline" class="border-neutral-700 text-neutral-300">
				<Eye class="h-4 w-4 mr-2" />
				Preview
			</Button>
			<Button 
				type="submit" 
				disabled={submitting}
				class="bg-emerald-600 hover:bg-emerald-700 text-white"
			>
				<Save class="h-4 w-4 mr-2" />
				{submitting ? 'Creating...' : 'Create Challenge'}
			</Button>
		</div>
	</div>
</form>