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
							class: 'bg-neutral-900 text-emerald-300 p-4 rounded-md font-mono text-sm overflow-x-auto border border-neutral-700 my-4'
						}
					},
					code: {
						HTMLAttributes: {
							class: 'bg-emerald-900/20 text-emerald-300 px-2 py-1 rounded font-mono text-sm border border-emerald-800/30'
						}
					},
					heading: {
						levels: [1, 2, 3],
						HTMLAttributes: {
							class: 'text-neutral-100 font-semibold mb-2'
						}
					},
					paragraph: {
						HTMLAttributes: {
							class: 'text-neutral-200 leading-relaxed mb-3'
						}
					},
					bulletList: {
						HTMLAttributes: {
							class: 'text-neutral-200 space-y-1 ml-4 list-disc'
						}
					},
					orderedList: {
						HTMLAttributes: {
							class: 'text-neutral-200 space-y-1 ml-4 list-decimal'
						}
					},
					listItem: {
						HTMLAttributes: {
							class: 'text-neutral-200'
						}
					}
				})
			],
			content,
			editable,
			editorProps: {
				attributes: {
					class: 'prose prose-invert prose-emerald max-w-none focus:outline-none min-h-[200px] p-4 text-neutral-200',
					placeholder
				}
			},
			onTransaction: () => {
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
	<div class="border-b border-neutral-600 bg-neutral-800 p-3 flex flex-wrap gap-2 rounded-t-md">
		<button
			type="button"
			on:click={() => addHeading(1)}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors font-medium"
			class:bg-emerald-600={editor?.isActive('heading', { level: 1 })}
			class:hover:bg-emerald-700={editor?.isActive('heading', { level: 1 })}
		>
			H1
		</button>
		<button
			type="button"
			on:click={() => addHeading(2)}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors font-medium"
			class:bg-emerald-600={editor?.isActive('heading', { level: 2 })}
			class:hover:bg-emerald-700={editor?.isActive('heading', { level: 2 })}
		>
			H2
		</button>
		<button
			type="button"
			on:click={() => addHeading(3)}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors font-medium"
			class:bg-emerald-600={editor?.isActive('heading', { level: 3 })}
			class:hover:bg-emerald-700={editor?.isActive('heading', { level: 3 })}
		>
			H3
		</button>
		
		<div class="w-px h-6 bg-neutral-500 mx-1"></div>
		
		<button
			type="button"
			on:click={toggleBold}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors font-bold"
			class:bg-emerald-600={editor?.isActive('bold')}
			class:hover:bg-emerald-700={editor?.isActive('bold')}
		>
			B
		</button>
		<button
			type="button"
			on:click={toggleItalic}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors italic"
			class:bg-emerald-600={editor?.isActive('italic')}
			class:hover:bg-emerald-700={editor?.isActive('italic')}
		>
			I
		</button>
		<button
			type="button"
			on:click={toggleCode}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors font-mono"
			class:bg-emerald-600={editor?.isActive('code')}
			class:hover:bg-emerald-700={editor?.isActive('code')}
		>
			&lt;/&gt;
		</button>
		
		<div class="w-px h-6 bg-neutral-500 mx-1"></div>
		
		<button
			type="button"
			on:click={toggleBulletList}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors"
			class:bg-emerald-600={editor?.isActive('bulletList')}
			class:hover:bg-emerald-700={editor?.isActive('bulletList')}
		>
			• List
		</button>
		<button
			type="button"
			on:click={toggleOrderedList}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors"
			class:bg-emerald-600={editor?.isActive('orderedList')}
			class:hover:bg-emerald-700={editor?.isActive('orderedList')}
		>
			1. List
		</button>
		
		<div class="w-px h-6 bg-neutral-500 mx-1"></div>
		
		<button
			type="button"
			on:click={toggleCodeBlock}
			class="px-3 py-1.5 text-sm bg-neutral-700 hover:bg-neutral-600 text-neutral-200 rounded transition-colors"
			class:bg-emerald-600={editor?.isActive('codeBlock')}
			class:hover:bg-emerald-700={editor?.isActive('codeBlock')}
		>
			Code Block
		</button>
	</div>
{/if}

<!-- Editor -->
<div 
	class="bg-neutral-900 text-neutral-200 border border-neutral-600 {editable ? 'rounded-b-md' : 'rounded-md'} min-h-[250px]"
	bind:this={element}
></div>