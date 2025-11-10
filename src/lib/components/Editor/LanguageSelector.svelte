<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchLanguages, type ProgrammingLanguage } from './LanguageTemplates';

	export let selected: string = 'javascript';
	export let onChange: (language: string) => void = () => {};

	let languages: ProgrammingLanguage[] = [];
	let loading = true;

	onMount(async () => {
		languages = await fetchLanguages();
		loading = false;
	});

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selected = target.value;
		onChange(selected);
	}
</script>

<div class="flex flex-col gap-2">
	<label for="language-select" class="text-sm font-medium text-gray-300">
		Programming Language
	</label>
	
	{#if loading}
		<div class="w-32 h-8 bg-neutral-800/50 animate-pulse rounded"></div>
	{:else}
		<select 
			id="language-select"
			bind:value={selected}
			on:change={handleChange}
			class="px-3 py-2 border border-gray-600 rounded-lg bg-neutral-800/50 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
		>
			{#each languages as lang}
				<option value={lang.name} class="bg-neutral-800 text-white">
					{lang.display_name}
				</option>
			{/each}
		</select>
	{/if}
</div>