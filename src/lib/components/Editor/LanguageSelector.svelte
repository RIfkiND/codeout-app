<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchLanguages, type ProgrammingLanguage } from './LanguageTemplates';

	interface LanguageSelectorProps {
		selected?: string;
		onChange?: (language: string) => void;
		disabled?: boolean;
	}

	let { 
		selected = $bindable('javascript'),
		onChange,
		disabled = false
	}: LanguageSelectorProps = $props();

	let languages: ProgrammingLanguage[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		languages = await fetchLanguages();
		loading = false;
	});

	function handleChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const newValue = target.value;
		console.log('LanguageSelector: handleChange called', { oldValue: selected, newValue });
		if (newValue !== selected) {
			console.log('LanguageSelector: Language changed, updating selected and calling onChange');
			selected = newValue;
			// Call onChange after a small delay to ensure binding is updated
			setTimeout(() => {
				onChange?.(newValue);
				console.log('LanguageSelector: onChange callback completed');
			}, 10);
		} else {
			console.log('LanguageSelector: No change detected, skipping onChange');
		}
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
			value={selected}
			onchange={handleChange}
			disabled={disabled}
			class="px-3 py-2 border border-gray-600 rounded-lg bg-neutral-800/50 text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#each languages as lang}
				<option value={lang.name} class="bg-neutral-800 text-white">
					{lang.display_name}
				</option>
			{/each}
		</select>
	{/if}
</div>