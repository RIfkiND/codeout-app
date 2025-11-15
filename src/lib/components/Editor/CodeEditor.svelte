<script lang="ts">
	import Editor from './Editor.svelte';
	import LanguageSelector from './LanguageSelector.svelte';
	import { Play } from 'lucide-svelte';

	interface CodeEditorProps {
		initialCode?: string;
	}

	let { initialCode = '' }: CodeEditorProps = $props();

	let editor: Editor;
	let code = $state(initialCode);
	let language = $state('javascript');

	async function handleLanguageChange(newLanguage: string) {
		language = newLanguage;
		// Always load template when language changes
		await editor?.loadTemplate();
	}

	function handleCodeChange(value: string) {
		code = value;
	}

	function runCode() {
		// Emit event or call API
		console.log('Running code:', { language, code });
	}

	function resetCode() {
		editor?.loadTemplate();
	}

	// Public API
	export function getCode() { return code; }
	export function getLanguage() { return language; }
	export function setCode(newCode: string) { 
		code = newCode;
		editor?.setValue(newCode);
	}
</script>

<div class="flex flex-col gap-4 p-4 bg-neutral-900 rounded-lg border border-neutral-700">
	<!-- Language Controls -->
	<div class="flex items-center justify-between">
		<LanguageSelector 
			bind:selected={language} 
			onChange={handleLanguageChange} 
		/>
		
		<div class="flex gap-2">
			<button 
				onclick={resetCode}
				class="px-3 py-1.5 text-sm border border-neutral-600 bg-neutral-800 text-neutral-200 rounded-md hover:bg-neutral-700 transition-colors"
			>
				Reset
			</button>
			<button 
				onclick={runCode}
				class="px-4 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2"
			>
				<Play class="w-4 h-4" />
				Run
			</button>
		</div>
	</div>

	<!-- Code Editor -->
	<Editor
		bind:this={editor}
		bind:value={code}
		{language}
		height="400px"
		onchange={handleCodeChange}
	/>
	
	<!-- Stats -->
	<div class="text-xs text-white flex justify-between font-medium">
		<span>Lines: {code.split('\n').length}</span>
		<span>Chars: {code.length}</span>
		<span>Lang: {language.toUpperCase()}</span>
	</div>
</div>