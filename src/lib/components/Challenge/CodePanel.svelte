<script lang="ts">
	import { Play, Send, Upload } from 'lucide-svelte';
	import Editor from '$lib/components/Editor/Editor.svelte';
	import LanguageSelector from '$lib/components/Editor/LanguageSelector.svelte';
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher<{
		submit: { code: string; language: string };
		run: { code: string; language: string };
	}>();

	let editor: Editor;
	let code = '';
	let language = 'javascript';
	let isSubmitting = false;
	let isRunning = false;

	async function handleLanguageChange(newLanguage: string) {
		language = newLanguage;
		if (!code || code.trim() === '') {
			await editor?.loadTemplate();
		}
	}

	function handleCodeChange(event: CustomEvent<{ value: string }>) {
		code = event.detail.value;
	}

	async function runCode() {
		isRunning = true;
		dispatch('run', { code, language });
		setTimeout(() => {
			isRunning = false;
		}, 2000);
	}

	async function submitCode() {
		isSubmitting = true;
		dispatch('submit', { code, language });
		setTimeout(() => {
			isSubmitting = false;
		}, 2000);
	}

	export function getCode() { return code; }
	export function getLanguage() { return language; }
</script>

<div class="bg-gray-900 h-full flex flex-col">
	<!-- Header -->
	<div class="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-800">
		<div class="flex items-center gap-4">
			<LanguageSelector 
				bind:selected={language} 
				onChange={handleLanguageChange} 
			/>
		</div>
		
		<div class="flex items-center gap-2">
			<button 
				on:click={runCode}
				disabled={isRunning}
				class="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				{#if isRunning}
					<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<Play size={16} />
				{/if}
				Run Code
			</button>
			
			<button 
				on:click={submitCode}
				disabled={isSubmitting}
				class="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				{#if isSubmitting}
					<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<Send size={16} />
				{/if}
				Submit Code
			</button>
		</div>
	</div>

	<!-- Editor -->
	<div class="flex-1 min-h-0 bg-gray-900">
		<Editor
			bind:this={editor}
			bind:value={code}
			{language}
			theme="vs-code-dark"
			height="100%"
			on:change={handleCodeChange}
		/>
	</div>

	<!-- Footer -->
	<div class="p-3 border-t border-gray-700 bg-gray-800 flex items-center justify-between text-sm">
		<button class="text-blue-400 hover:text-blue-300 flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 transition-colors">
			<Upload size={16} />
			Upload Code as File
		</button>
		<div class="text-gray-400">
			Lines: <span class="text-white">{code.split('\n').length}</span> | 
			Chars: <span class="text-white">{code.length}</span> |
			Lang: <span class="text-white">{language.toUpperCase()}</span>
		</div>
	</div>
</div>