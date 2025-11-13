<script lang="ts">
	import { Play, Send, Upload } from 'lucide-svelte';
	import Editor from '$lib/components/Editor/Editor.svelte';
	import LanguageSelector from '$lib/components/Editor/LanguageSelector.svelte';
	interface CodePanelProps {
		onsubmit?: (event: CustomEvent<{ code: string; language: string }>) => void;
		onrun?: (event: CustomEvent<{ code: string; language: string }>) => void;
	}

	let { onsubmit, onrun }: CodePanelProps = $props();

	let editor: Editor;
	let code = $state('');
	let language = $state('javascript');
	let isSubmitting = $state(false);
	let isRunning = $state(false);

	async function handleLanguageChange(newLanguage: string) {
		language = newLanguage;
		if (!code || code.trim() === '') {
			await editor?.loadTemplate();
		}
	}



	async function runCode() {
		isRunning = true;
		const event = new CustomEvent('run', { detail: { code, language } });
		onrun?.(event);
		setTimeout(() => {
			isRunning = false;
		}, 2000);
	}

	async function submitCode() {
		isSubmitting = true;
		const event = new CustomEvent('submit', { detail: { code, language } });
		onsubmit?.(event);
		setTimeout(() => {
			isSubmitting = false;
		}, 2000);
	}

	export function getCode() { return code; }
	export function getLanguage() { return language; }
</script>

<div class="bg-neutral-950 h-full flex flex-col">
	<!-- Header -->
	<div class="p-4 border-b border-neutral-700 flex items-center justify-between bg-neutral-900">
		<div class="flex items-center gap-4">
			<LanguageSelector 
				bind:selected={language} 
				onChange={handleLanguageChange} 
			/>
		</div>
		<!-- Actions -->
		<div class="flex items-center gap-3">
			<button 
				onclick={runCode}
				disabled={isRunning}
				class="px-4 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
			>
				{#if isRunning}
					<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
				{:else}
					<Play size={16} />
				{/if}
				Run Code
			</button>
			
			<button 
				onclick={submitCode}
				disabled={isSubmitting}
				class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
			onchange={(value) => { code = value; }}
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