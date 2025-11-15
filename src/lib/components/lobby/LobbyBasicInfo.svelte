<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		name?: string;
		description?: string;
		onNameChange?: (value: string) => void;
		onDescriptionChange?: (value: string) => void;
	}

	let { name = '', description = '', onNameChange, onDescriptionChange }: Props = $props();

	const handleNameChange = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;
		name = value;
		if (onNameChange) onNameChange(value);
	};

	const handleDescriptionChange = (event: Event) => {
		const value = (event.target as HTMLInputElement).value;
		description = value;
		if (onDescriptionChange) onDescriptionChange(value);
	};
</script>

<div class="space-y-4">
	<div class="space-y-2">
		<Label for="name" class="text-neutral-200">Lobby Name</Label>
		<Input
			id="name"
			value={name}
			onchange={handleNameChange}
			placeholder="Enter lobby name"
			required
			class="bg-neutral-800 border-neutral-700 text-neutral-100"
		/>
	</div>
	
	<div class="space-y-2">
		<Label for="description" class="text-neutral-200">Description (Optional)</Label>
		<Input
			id="description"
			value={description}
			onchange={handleDescriptionChange}
			placeholder="Brief description of the lobby"
			class="bg-neutral-800 border-neutral-700 text-neutral-100"
		/>
	</div>
</div>