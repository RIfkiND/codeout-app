<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { initMonaco, getEditorOptions } from './MonacoConfig';
	import { getTemplate, getMonacoLanguage, fetchLanguages } from './LanguageTemplates';
	import type * as Monaco from 'monaco-editor';

	// Props
	export let value: string = '';
	export let language: string = 'javascript';
	export let theme: string = 'vs-code-dark';
	export let height: string = '400px';
	export let readonly: boolean = false;

	const dispatch = createEventDispatcher<{
		change: { value: string };
		ready: { editor: Monaco.editor.IStandaloneCodeEditor };
	}>();

	let container: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
	let monaco: typeof Monaco | null = null;
	let mounted = false;

	onMount(async () => {
		mounted = true;
		await initEditor();
	});

	onDestroy(() => {
		mounted = false;
		editor?.dispose();
	});

	async function initEditor() {
		try {
			// Ensure container is available
			if (!container || !mounted) return;
			
			monaco = await initMonaco();
			if (!monaco || !mounted) return;

			// Small delay to ensure DOM is ready
			await new Promise(resolve => setTimeout(resolve, 100));

			const monacoLang = await getMonacoLanguage(language);
			const initialValue = value || await getTemplate(language);
			
			const editorOptions = getEditorOptions({ 
				minimap: { enabled: false },
				fontSize: 14,
				automaticLayout: true
			});

			editor = monaco.editor.create(container, {
				value: initialValue,
				language: monacoLang,
				theme,
				readOnly: readonly,
				...editorOptions
			});

			editor.onDidChangeModelContent(() => {
				if (!mounted) return;
				const currentValue = editor?.getValue() || '';
				value = currentValue;
				dispatch('change', { value: currentValue });
			});

			// Set the theme after creation
			monaco.editor.setTheme(theme);

			dispatch('ready', { editor });
		} catch (error) {
			console.error('Editor init failed:', error);
		}
	}

	// Reactive language changes
	$: if (editor && monaco && mounted) {
		updateLanguage();
	}

	async function updateLanguage() {
		if (!editor || !monaco) return;
		const monacoLang = await getMonacoLanguage(language);
		const currentLang = editor.getModel()?.getLanguageId();
		
		if (currentLang !== monacoLang) {
			monaco.editor.setModelLanguage(editor.getModel()!, monacoLang);
		}
	}

	// Public API
	export function getEditor() { return editor; }
	export function getValue() { return editor?.getValue() || ''; }
	export function setValue(newValue: string) { editor?.setValue(newValue); }
	export async function loadTemplate() { 
		const template = await getTemplate(language);
		setValue(template);
	}
	export function focus() { editor?.focus(); }
	export function layout() { editor?.layout(); }

	// Load languages on mount for caching
	onMount(() => fetchLanguages());
</script>

<div class="relative h-full">
	<div
		bind:this={container}
		class="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 h-full"
		style="height: {height === '100%' ? '100%' : height};"
	></div>
</div>

<style>
	:global(.monaco-editor) {
		font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace !important;
	}
</style>