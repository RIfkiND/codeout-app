import loader from '@monaco-editor/loader';
import type * as Monaco from 'monaco-editor';

let monaco: typeof Monaco | null = null;

export async function initMonaco() {
	if (monaco) return monaco;

	loader.config({
		paths: {
			vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.54.0/min/vs'
		}
	});

	monaco = await loader.init();

	// VS Code Dark+ theme
	monaco.editor.defineTheme('vs-code-dark', {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
			{ token: 'keyword', foreground: '569CD6' },
			{ token: 'string', foreground: 'CE9178' },
			{ token: 'number', foreground: 'B5CEA8' },
			{ token: 'function', foreground: 'DCDCAA' },
			{ token: 'variable', foreground: '9CDCFE' },
			{ token: 'type', foreground: '4EC9B0' }
		],
		colors: {
			'editor.background': '#1E1E1E',
			'editor.foreground': '#D4D4D4',
			'editor.lineHighlightBackground': '#2D2D30',
			'editor.selectionBackground': '#264F78',
			'editorCursor.foreground': '#AEAFAD',
			'editorLineNumber.foreground': '#858585'
		}
	});

	return monaco;
}

export function getEditorOptions(options: Monaco.editor.IStandaloneEditorConstructionOptions = {}): Monaco.editor.IStandaloneEditorConstructionOptions {
	return {
		automaticLayout: true,
		fontSize: 14,
		fontFamily: "'Cascadia Code', 'Fira Code', monospace",
		lineNumbers: 'on' as const,
		minimap: { enabled: true },
		scrollBeyondLastLine: false,
		wordWrap: 'on' as const,
		bracketPairColorization: { enabled: true },
		...options
	};
}