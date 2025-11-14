<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { initMonaco, getEditorOptions } from './MonacoConfig';
	import { getTemplate, getMonacoLanguage, fetchLanguages } from './LanguageTemplates';
	import type * as Monaco from 'monaco-editor';

	interface EditorProps {
		value?: string;
		language?: string;
		theme?: string;
		height?: string;
		readonly?: boolean;
		onchange?: (value: string) => void;
		onready?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
	}

	let { 
		value = $bindable(''),
		language = 'javascript',
		theme = 'vs-code-dark',
		height = '400px',
		readonly = false,
		onchange,
		onready
	}: EditorProps = $props();

	// Internal state to track value updates
	let internalValue = $state(value);

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
			const initialValue = internalValue || value || await getTemplate(language);
			
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
				internalValue = currentValue;
				value = currentValue;
				dispatch('change', { value: currentValue });
				onchange?.(currentValue);
			});

			// Set the theme after creation
			monaco.editor.setTheme(theme);

			dispatch('ready', { editor });
			onready?.(editor);
		} catch (error) {
			console.error('Editor init failed:', error);
		}
	}

	// Simple language change effect
	$effect(() => {
		if (editor && monaco && mounted && language) {
			console.log('Editor: Language changed to:', language);
			updateLanguageAndTemplate();
		}
	});

	async function updateLanguageAndTemplate() {
		try {
			if (!editor || !monaco) return;
			
			const monacoLang = await getMonacoLanguage(language);
			const model = editor.getModel();
			
			if (model && model.getLanguageId() !== monacoLang) {
				console.log('Editor: Updating Monaco language to:', monacoLang);
				monaco.editor.setModelLanguage(model, monacoLang);
			}
			
			// Load and set template
			const template = await getTemplate(language);
			if (template && template.trim()) {
				console.log('Editor: Setting template for:', language);
				editor.setValue(template);
				internalValue = template;
				value = template;
				dispatch('change', { value: template });
				onchange?.(template);
			}
		} catch (error) {
			console.error('Editor: Failed to update language/template:', error);
		}
	}

	// Reactive value changes
	$effect(() => {
		if (editor && value !== internalValue && mounted) {
			internalValue = value;
			editor.setValue(value);
		}
	});

	// Public API
	export function getEditor() { return editor; }
	export function getValue() { return editor?.getValue() || ''; }
	export function setValue(newValue: string) { 
		console.log('setValue called with:', newValue?.substring(0, 100) + '...');
		if (editor && newValue !== undefined) {
			editor.setValue(newValue);
			console.log('Value set in Monaco editor');
		}
		internalValue = newValue;
		value = newValue;
	}
	export async function loadTemplate() { 
		console.log('loadTemplate called for language:', language);
		try {
			const template = await getTemplate(language);
			console.log('Template fetched for', language, ':', template?.substring(0, 100) + '...');
			if (template && template.trim()) {
				setValue(template);
				console.log('Template set in editor for', language);
			} else {
				console.warn('Empty or invalid template for language:', language);
			}
		} catch (error) {
			console.error('Error in loadTemplate:', error);
		}
	}
	export function focus() { editor?.focus(); }
	export function layout() { editor?.layout(); }

	// Load languages on mount for caching
	onMount(() => fetchLanguages());
</script>

<div class="relative h-full">
	<div
		bind:this={container}
		class="border border-gray-700  overflow-hidden bg-gray-900 h-full"
		style="height: {height === '100%' ? '100%' : height};"
	></div>
</div>

<style>
	:global(.monaco-editor) {
		font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace !important;
	}
</style>