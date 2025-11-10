<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Users, Clock } from 'lucide-svelte';

	interface Props {
		maxParticipants?: number;
		timeLimit?: number;
		isPrivate?: boolean;
		onMaxParticipantsChange?: (value: number) => void;
		onTimeLimitChange?: (value: number) => void;
		onPrivateChange?: (value: boolean) => void;
	}

	let { 
		maxParticipants = 10, 
		timeLimit = 60, 
		isPrivate = false,
		onMaxParticipantsChange,
		onTimeLimitChange,
		onPrivateChange
	}: Props = $props();

	const handleMaxParticipantsChange = (event: Event) => {
		const value = parseInt((event.target as HTMLInputElement).value);
		maxParticipants = value;
		if (onMaxParticipantsChange) onMaxParticipantsChange(value);
	};

	const handleTimeLimitChange = (event: Event) => {
		const value = parseInt((event.target as HTMLInputElement).value);
		timeLimit = value;
		if (onTimeLimitChange) onTimeLimitChange(value);
	};

	const handlePrivateChange = (event: Event) => {
		const value = (event.target as HTMLInputElement).checked;
		isPrivate = value;
		if (onPrivateChange) onPrivateChange(value);
	};
</script>

<div class="space-y-4">
	<div class="grid grid-cols-2 gap-4">
		<div class="space-y-2">
			<Label for="maxParticipants" class="text-neutral-200 flex items-center gap-1">
				<Users class="w-4 h-4" />
				Max Players
			</Label>
			<Input
				id="maxParticipants"
				type="number"
				value={maxParticipants}
				onchange={handleMaxParticipantsChange}
				min="2"
				max="50"
				class="bg-neutral-800 border-neutral-700 text-neutral-100"
			/>
		</div>
		
		<div class="space-y-2">
			<Label for="timeLimit" class="text-neutral-200 flex items-center gap-1">
				<Clock class="w-4 h-4" />
				Time (min)
			</Label>
			<Input
				id="timeLimit"
				type="number"
				value={timeLimit}
				onchange={handleTimeLimitChange}
				min="15"
				max="180"
				class="bg-neutral-800 border-neutral-700 text-neutral-100"
			/>
		</div>
	</div>
	
	<div class="flex items-center space-x-2">
		<input
			id="isPrivate"
			type="checkbox"
			checked={isPrivate}
			onchange={handlePrivateChange}
			class="rounded border-neutral-700 bg-neutral-800"
		/>
		<Label for="isPrivate" class="text-neutral-200">Private Lobby</Label>
	</div>
</div>