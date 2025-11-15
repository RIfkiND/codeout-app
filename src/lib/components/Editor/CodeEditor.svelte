<script lang="ts">
	import Editor from './Editor.svelte';
	import LanguageSelector from './LanguageSelector.svelte';

	export let initialCode: string = '';

	let editor: Editor;
	let code = initialCode;
	let language = 'javascript';

	async function handleLanguageChange(newLanguage: string) {
		language = newLanguage;
		if (!code || code.trim() === '') {
			await editor?.loadTemplate();
		}
	}

	function handleCodeChange(event: CustomEvent<{ value: string }>) {
		code = event.detail.value;
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

<div class="flex flex-col gap-4 p-4 bg-white rounded-lg border border-gray-200">
	<!-- Language Controls -->
	<div class="flex items-center justify-between">
		<LanguageSelector 
			bind:selected={language} 
			onChange={handleLanguageChange} 
		/>
		
		<div class="flex gap-2">
			<button 
				on:click={resetCode}
				class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
			>
				Reset
			</button>
			<button 
				on:click={runCode}
				class="px-4 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
			>
				▶ Run
			</button>
		</div>
	</div>

	<!-- Code Editor -->
	<Editor
		bind:this={editor}
		bind:value={code}
		{language}
		height="400px"
		on:change={handleCodeChange}
	/>
	
	<!-- Stats -->
	<div class="text-xs text-gray-500 flex justify-between">
		<span>Lines: {code.split('\n').length}</span>
		<span>Characters: {code.length}</span>
		<span>Language: {language.toUpperCase()}</span>
	</div>
</div>