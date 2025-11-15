<script lang="ts">
	import { Search, Filter, SortAsc, Users, Trophy, Clock, Zap } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select/index';

	interface Props {
		searchQuery?: string;
		selectedStatus?: string;
		sortBy?: string;
		onSearchChange?: (query: string) => void;
		onStatusChange?: (status: string) => void;
		onSortChange?: (sort: string) => void;
	}

	let {
		searchQuery = '',
		selectedStatus = 'all',
		sortBy = 'created_at',
		onSearchChange,
		onStatusChange,
		onSortChange
	}: Props = $props();

	const statusOptions = [
		{ value: 'all', label: 'All', icon: Filter },
		{ value: 'waiting', label: 'Waiting', icon: Clock },
		{ value: 'active', label: 'Active', icon: Zap },
		{ value: 'running', label: 'Running', icon: Users },
		{ value: 'finished', label: 'Finished', icon: Trophy }
	];

const sortOptions = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'participants', label: 'Most Players' }
];

	const handleSearch = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (onSearchChange) onSearchChange(target.value);
	};

	const handleStatusFilter = (status: string) => {
		if (onStatusChange) onStatusChange(status);
	};

	const handleSortChange = (e: Event) => {
		const target = e.target as HTMLSelectElement;
		if (onSortChange) onSortChange(target.value);
	};
</script>

<div class="mb-6 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
	<div class="relative flex flex-col items-stretch justify-start gap-4 lg:flex-row">
		<!-- Search -->
		<div class="relative flex-1">
			<Search
				class="absolute top-1/2 left-3 h-full w-4 -translate-y-1/2 transform text-neutral-400"
			/>
			<Input
				type="text"
				placeholder="Search lobbies by name or description..."
				value={searchQuery}
				oninput={handleSearch}
				class="h-full border-neutral-700 bg-neutral-800 pl-10 text-neutral-100 transition-colors focus:border-emerald-500"
			/>
		</div>

		<!-- Status Filter -->
		<div class="flex flex-wrap gap-2">
			{#each statusOptions as option}
				<Button
					variant={selectedStatus === option.value ? 'default' : 'outline'}
					size="sm"
					onclick={() => handleStatusFilter(option.value)}
					class="{selectedStatus === option.value
						? 'bg-emerald-600 shadow-lg shadow-emerald-500/25 hover:bg-emerald-700'
						: 'border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800'} h-full w-28"
				>
					<svelte:component this={option.icon} class="mr-1 h-3 w-3" />
					{option.label}
				</Button>
			{/each}
		</div>

		<!-- Sort -->
		<Select.Root type="single" onValueChange={onSortChange} bind:value={sortBy}>
			<Select.Trigger class="w-40">
				<SortAsc class="h-4 w-4 text-neutral-400" />
				{sortOptions.find((option) => option.value === sortBy)?.label}
			</Select.Trigger>
			<Select.Content>
				{#each sortOptions as { value, label }}
					<Select.Item {value} {label} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
</div>
