<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	export let content: string = '';
	export let editable: boolean = true;
	export let placeholder: string = 'Write your description...';

	const dispatch = createEventDispatcher<{
		update: string;
	}>();

	let element: HTMLElement;
	let editor: Editor;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					codeBlock: {
						HTMLAttributes: {
							class: 'bg-gray-900 text-gray-100 p-3 rounded-md font-mono text-sm overflow-x-auto'
						}
					},
					code: {
						HTMLAttributes: {
							class: 'bg-gray-700 text-gray-100 px-1 py-0.5 rounded font-mono text-sm'
						}
					}
				})
			],
			content,
			editable,
			editorProps: {
				attributes: {
					class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
					placeholder
				}
			},
			onTransaction: () => {
				// Force re-render to update reactive statements
				editor = editor;
			},
			onUpdate: ({ editor }) => {
				const html = editor.getHTML();
				content = html;
				dispatch('update', html);
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});

	// Update content when prop changes
	$: if (editor && content !== editor.getHTML()) {
		editor.commands.setContent(content);
	}

	// Update editable state when prop changes
	$: if (editor) {
		editor.setEditable(editable);
	}

	function toggleBold() {
		editor.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor.chain().focus().toggleItalic().run();
	}

	function toggleCode() {
		editor.chain().focus().toggleCode().run();
	}

	function toggleCodeBlock() {
		editor.chain().focus().toggleCodeBlock().run();
	}

	function addHeading(level: 1 | 2 | 3) {
		editor.chain().focus().toggleHeading({ level }).run();
	}

	function toggleBulletList() {
		editor.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor.chain().focus().toggleOrderedList().run();
	}
</script>

{#if editable}
	<!-- Toolbar -->
	<div class="border-b border-gray-600 bg-gray-700 p-2 flex flex-wrap gap-1 rounded-t-md">
		<button
			type="button"
			on:click={() => addHeading(1)}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
			class:bg-blue-600={editor?.isActive('heading', { level: 1 })}
		>
			H1
		</button>
		<button
			type="button"
			on:click={() => addHeading(2)}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
			class:bg-blue-600={editor?.isActive('heading', { level: 2 })}
		>
			H2
		</button>
		<button
			type="button"
			on:click={() => addHeading(3)}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
			class:bg-blue-600={editor?.isActive('heading', { level: 3 })}
		>
			H3
		</button>
		
		<div class="w-px h-6 bg-gray-500 mx-1"></div>
		
		<button
			type="button"
			on:click={toggleBold}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors font-bold"
			class:bg-blue-600={editor?.isActive('bold')}
		>
			B
		</button>
		<button
			type="button"
			on:click={toggleItalic}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors italic"
			class:bg-blue-600={editor?.isActive('italic')}
		>
			I
		</button>
		<button
			type="button"
			on:click={toggleCode}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors font-mono"
			class:bg-blue-600={editor?.isActive('code')}
		>
			&lt;/&gt;
		</button>
		
		<div class="w-px h-6 bg-gray-500 mx-1"></div>
		
		<button
			type="button"
			on:click={toggleBulletList}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
			class:bg-blue-600={editor?.isActive('bulletList')}
		>
			• List
		</button>
		<button
			type="button"
			on:click={toggleOrderedList}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
			class:bg-blue-600={editor?.isActive('orderedList')}
		>
			1. List
		</button>
		
		<div class="w-px h-6 bg-gray-500 mx-1"></div>
		
		<button
			type="button"
			on:click={toggleCodeBlock}
			class="px-2 py-1 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
			class:bg-blue-600={editor?.isActive('codeBlock')}
		>
			Code Block
		</button>
	</div>
{/if}

<!-- Editor -->
<div 
	class="bg-gray-800 text-gray-100 border border-gray-600 {editable ? 'rounded-b-md' : 'rounded-md'}"
	bind:this={element}
></div>