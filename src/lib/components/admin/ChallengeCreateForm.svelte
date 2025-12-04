<script lang="ts">
import { enhance } from '$app/forms';
import { Button } from '$lib/components/ui/button';
import { Card } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Badge } from '$lib/components/ui/badge';
import { Textarea } from '$lib/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
import WysiwygEditor from '$lib/components/Editor/WysiwygEditor.svelte';
import { Plus, Trash2, Save, Eye, X, Hash, Tag } from 'lucide-svelte';

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
let category = $state('');
let tagInput = $state('');
let tags: string[] = $state([]);
let timeLimit = $state(1000);
let memoryLimit = $state(256);
let maxScore = $state(100);
let inputExample = $state('');
let outputExample = $state('');
let starterCode = $state('');
let solutionExplanation = $state('');
let videoUrl = $state('');
let hints: string[] = $state([]);
let hintInput = $state('');
let images: string[] = $state([]);
let imageInput = $state('');
let testCases: TestCase[] = $state([
	{ input: '', output: '', explanation: '' }
]);
let submitting = $state(false);

// Predefined categories and tags
const categories = [
	'Algorithms',
	'Data Structures',
	'Dynamic Programming',
	'Graph Theory',
	'String Manipulation',
	'Array/List',
	'Tree/Binary Tree',
	'Sorting',
	'Searching',
	'Mathematics',
	'Greedy',
	'Recursion',
	'Bit Manipulation',
	'Hash Table',
	'Stack/Queue',
	'Linked List',
	'Two Pointers',
	'Sliding Window',
	'Binary Search',
	'Backtracking'
];

const commonTags = [
	'beginner-friendly',
	'interview-prep',
	'leetcode-style',
	'optimization',
	'complexity-analysis',
	'edge-cases',
	'mathematical',
	'pattern-matching',
	'problem-solving',
	'competitive-programming',
	'real-world',
	'debugging',
	'implementation',
	'logic-puzzle'
];

const difficulties = [
	{ value: 'easy', label: 'Easy', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
	{ value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
	{ value: 'hard', label: 'Hard', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
];

function addTag(tag?: string) {
	const tagToAdd = tag || tagInput.trim();
	if (tagToAdd && !tags.includes(tagToAdd)) {
		tags = [...tags, tagToAdd];
		tagInput = '';
	}
}

function removeTag(tagToRemove: string) {
	tags = tags.filter(tag => tag !== tagToRemove);
}

function addHint() {
	if (hintInput.trim() && !hints.includes(hintInput.trim())) {
		hints = [...hints, hintInput.trim()];
		hintInput = '';
	}
}

function removeHint(hintToRemove: string) {
	hints = hints.filter(hint => hint !== hintToRemove);
}

function addImage() {
	if (imageInput.trim() && !images.includes(imageInput.trim())) {
		images = [...images, imageInput.trim()];
		imageInput = '';
	}
}

function removeImage(imageToRemove: string) {
	images = images.filter(image => image !== imageToRemove);
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
					<select name="difficulty" bind:value={difficulty} class="bg-neutral-800 border-neutral-700 text-neutral-100 w-full rounded-md px-3 py-2">
						{#each difficulties as diff}
							<option value={diff.value}>{diff.label}</option>
						{/each}
					</select>
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
				
				<div class="md:col-span-2">
					<Label for="category" class="text-neutral-300">Category</Label>
					<select 
						name="category" 
						bind:value={category} 
						class="bg-neutral-800 border-neutral-700 text-neutral-100 w-full rounded-md px-3 py-2"
					>
						<option value="">Select a category...</option>
						{#each categories as cat}
							<option value={cat}>{cat}</option>
						{/each}
					</select>
					{#if category === ''}
						<Input
							placeholder="Or enter custom category..."
							class="bg-neutral-800 border-neutral-700 text-neutral-100 mt-2"
							bind:value={category}
						/>
					{/if}
				</div>
			</div>
		</Card>

		<!-- Description -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6 flex items-center gap-2">
				<Eye class="h-5 w-5" />
				Challenge Description
			</h2>
			<div class="space-y-4">
				<Label class="text-neutral-300">
					Write a comprehensive description of the challenge. Include problem statement, constraints, examples, and any special instructions.
				</Label>
				<WysiwygEditor
					bind:content={description}
					placeholder="Describe your challenge in detail..."
				/>
				<input type="hidden" name="description" value={description} />
			</div>
		</Card>

		<!-- Tags Management -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6 flex items-center gap-2">
				<Tag class="h-5 w-5" />
				Tags & Categories
			</h2>
			
			<!-- Tag Input -->
			<div class="space-y-4">
				<div>
					<Label for="tags" class="text-neutral-300">Add Custom Tags</Label>
					<div class="flex space-x-2 mt-2">
						<Input
							bind:value={tagInput}
							placeholder="Enter custom tag..."
							class="bg-neutral-800 border-neutral-700 text-neutral-100"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									addTag();
								}
							}}
						/>
						<Button type="button" onclick={() => addTag()} variant="outline" class="border-neutral-700">
							<Plus class="h-4 w-4" />
						</Button>
					</div>
				</div>

				<!-- Common Tags -->
				<div>
					<Label class="text-neutral-300">Quick Add Tags</Label>
					<div class="flex flex-wrap gap-2 mt-2">
						{#each commonTags as tag}
							<Button
								type="button"
								variant="outline"
								size="sm"
								class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
								onclick={() => addTag(tag)}
								disabled={tags.includes(tag)}
							>
								<Hash class="h-3 w-3 mr-1" />
								{tag}
							</Button>
						{/each}
					</div>
				</div>

				<!-- Selected Tags -->
				<input type="hidden" name="tags" value={tags.join(',')} />
				{#if tags.length > 0}
					<div>
						<Label class="text-neutral-300">Selected Tags ({tags.length})</Label>
						<div class="flex flex-wrap gap-2 mt-2">
							{#each tags as tag}
								<Badge class="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
									{tag}
									<Button
										type="button"
										variant="ghost"
										size="sm"
										class="h-auto p-0 ml-2 text-emerald-400 hover:text-red-400"
										onclick={() => removeTag(tag)}
									>
										<X class="h-3 w-3" />
									</Button>
								</Badge>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Code Templates -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6">Code Templates</h2>
			<Tabs value="starter" class="w-full">
				<TabsList class="bg-neutral-800 border-neutral-700">
					<TabsTrigger value="starter" class="text-neutral-300">Starter Code</TabsTrigger>
					<TabsTrigger value="solution" class="text-neutral-300">Solution Explanation</TabsTrigger>
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
						name="solution_explanation"
						bind:value={solutionExplanation}
						placeholder="Enter detailed solution explanation..."
						rows={8}
						class="bg-neutral-800 border-neutral-700 text-neutral-100"
					/>
				</TabsContent>
			</Tabs>
		</Card>

		<!-- Examples and Media -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6">Examples & Media</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<Label for="inputExample" class="text-neutral-300">Input Example</Label>
					<Textarea
						id="inputExample"
						name="input_example"
						bind:value={inputExample}
						placeholder="Show example input format..."
						rows={4}
						class="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono"
					/>
				</div>
				
				<div>
					<Label for="outputExample" class="text-neutral-300">Output Example</Label>
					<Textarea
						id="outputExample"
						name="output_example"
						bind:value={outputExample}
						placeholder="Show example output format..."
						rows={4}
						class="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono"
					/>
				</div>

				<div>
					<Label for="maxScore" class="text-neutral-300">Maximum Score</Label>
					<Input
						id="maxScore"
						name="max_score"
						type="number"
						bind:value={maxScore}
						min="1"
						max="1000"
						class="bg-neutral-800 border-neutral-700 text-neutral-100"
					/>
				</div>

				<div>
					<Label for="videoUrl" class="text-neutral-300">Video URL (Optional)</Label>
					<Input
						id="videoUrl"
						name="video_url"
						bind:value={videoUrl}
						placeholder="https://youtube.com/watch?v=..."
						class="bg-neutral-800 border-neutral-700 text-neutral-100"
					/>
				</div>
			</div>
		</Card>

		<!-- Hints Section -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6">Hints</h2>
			<div class="space-y-4">
				<div class="flex gap-2">
					<Input
						bind:value={hintInput}
						placeholder="Add a helpful hint for students..."
						class="bg-neutral-800 border-neutral-700 text-neutral-100 flex-1"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addHint();
							}
						}}
					/>
					<Button type="button" onclick={addHint} variant="outline" class="border-neutral-700">
						<Plus class="h-4 w-4" />
					</Button>
				</div>

				<input type="hidden" name="hints" value={JSON.stringify(hints)} />
				{#if hints.length > 0}
					<div>
						<Label class="text-neutral-300">Hints ({hints.length})</Label>
						<div class="space-y-2 mt-2">
							{#each hints as hint, index}
								<div class="flex items-center gap-2 p-3 bg-neutral-800 rounded-lg">
									<span class="text-sm text-neutral-400">#{index + 1}</span>
									<span class="text-neutral-300 flex-1">{hint}</span>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										class="text-red-400 hover:text-red-300"
										onclick={() => removeHint(hint)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Images Section -->
		<Card class="bg-neutral-900 border-neutral-800 p-6">
			<h2 class="text-xl font-semibold text-neutral-100 mb-6">Images</h2>
			<div class="space-y-4">
				<div class="flex gap-2">
					<Input
						bind:value={imageInput}
						placeholder="Add image URL for diagrams, examples, etc..."
						class="bg-neutral-800 border-neutral-700 text-neutral-100 flex-1"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addImage();
							}
						}}
					/>
					<Button type="button" onclick={addImage} variant="outline" class="border-neutral-700">
						<Plus class="h-4 w-4" />
					</Button>
				</div>

				<input type="hidden" name="images" value={JSON.stringify(images)} />
				{#if images.length > 0}
					<div>
						<Label class="text-neutral-300">Images ({images.length})</Label>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
							{#each images as image}
								<div class="relative group">
									<img src={image} alt="Challenge preview" class="w-full h-32 object-cover rounded-lg border border-neutral-700" />
									<Button
										type="button"
										variant="ghost"
										size="sm"
										class="absolute top-2 right-2 bg-black/50 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
										onclick={() => removeImage(image)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
									<p class="text-xs text-neutral-400 mt-1 truncate">{image}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
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
									oninput={(e: Event) => updateTestCase(index, 'input', (e.target as HTMLTextAreaElement)?.value || '')}
									placeholder="Test input..."
									rows={3}
									class="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono text-sm"
								/>
							</div>
							<div>
								<Label class="text-neutral-400">Expected Output</Label>
								<Textarea
									value={testCase.output}
									oninput={(e: Event) => updateTestCase(index, 'output', (e.target as HTMLTextAreaElement)?.value || '')}
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
								oninput={(e: Event) => updateTestCase(index, 'explanation', (e.target as HTMLTextAreaElement)?.value || '')}
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