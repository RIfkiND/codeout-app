<script lang="ts">
	import { cn } from '$lib/utils';

	interface Option {
		value: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value?: string;
		placeholder?: string;
		class?: string;
		onchange?: (value: string) => void;
	}

	let { options, value = '', placeholder = 'Select an option', class: className = '', onchange }: Props = $props();

	const handleChange = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		const newValue = target.value;
		value = newValue;
		if (onchange) {
			onchange(newValue);
		}
	};
</script>

<select 
	{value} 
	onchange={handleChange}
	class={cn(
		"flex h-10 w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
>
	<option value="" disabled>{placeholder}</option>
	{#each options as option}
		<option value={option.value}>{option.label}</option>
	{/each}
</select>