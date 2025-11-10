<script lang="ts">
	import { User, Save, X, Github, Code, Mail } from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	interface Props {
		profile: any;
		onSave: (updates: any) => Promise<void>;
		onCancel: () => void;
		saving?: boolean;
		error?: string;
	}

	let { profile, onSave, onCancel, saving = false, error = '' }: Props = $props();

	let formData = $state({
		bio: profile?.bio || '',
		github_username: profile?.github_username || '',
		preferred_language: profile?.preferred_language || 'javascript'
	});

	const languages = [
		{ value: 'javascript', label: 'JavaScript' },
		{ value: 'python', label: 'Python' },
		{ value: 'java', label: 'Java' },
		{ value: 'cpp', label: 'C++' },
		{ value: 'c', label: 'C' },
		{ value: 'typescript', label: 'TypeScript' },
		{ value: 'rust', label: 'Rust' },
		{ value: 'go', label: 'Go' }
	];

	async function handleSubmit(event: Event) {
		event.preventDefault();
		await onSave(formData);
	}
</script>

<Card class="border-neutral-700 bg-neutral-800/50">
	<CardHeader>
		<CardTitle class="flex items-center text-white">
			<User class="h-5 w-5 mr-2 text-emerald-400" />
			Edit Profile
		</CardTitle>
	</CardHeader>
	<CardContent>
		<form onsubmit={handleSubmit} class="space-y-6">
			{#if error}
				<div class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
					<p class="text-red-400 text-sm">{error}</p>
				</div>
			{/if}

			<!-- Bio -->
			<div class="space-y-2">
				<Label for="bio" class="text-neutral-300">Bio</Label>
				<textarea
					id="bio"
					bind:value={formData.bio}
					placeholder="Tell us about yourself..."
					class="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none h-20"
					maxlength="200"
				></textarea>
				<p class="text-xs text-neutral-500">{formData.bio.length}/200 characters</p>
			</div>

			<!-- GitHub Username -->
			<div class="space-y-2">
				<Label for="github" class="text-neutral-300 flex items-center">
					<Github class="h-4 w-4 mr-2" />
					GitHub Username
				</Label>
				<Input
					id="github"
					bind:value={formData.github_username}
					placeholder="your-github-username"
					class="bg-neutral-900 border-neutral-700 text-white"
				/>
			</div>

			<!-- Preferred Language -->
			<div class="space-y-2">
				<Label for="language" class="text-neutral-300 flex items-center">
					<Code class="h-4 w-4 mr-2" />
					Preferred Language
				</Label>
				<select
					id="language"
					bind:value={formData.preferred_language}
					class="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
				>
					{#each languages as lang}
						<option value={lang.value}>{lang.label}</option>
					{/each}
				</select>
			</div>

			<!-- Action Buttons -->
			<div class="flex gap-3 pt-4">
				<Button
					type="submit"
					disabled={saving}
					class="bg-emerald-600 hover:bg-emerald-700"
				>
					{#if saving}
						<span class="animate-spin mr-2">⏳</span>
					{:else}
						<Save class="h-4 w-4 mr-2" />
					{/if}
					Save Changes
				</Button>
				<Button
					type="button"
					variant="outline"
					onclick={onCancel}
					disabled={saving}
					class="border-neutral-600 hover:bg-neutral-700"
				>
					<X class="h-4 w-4 mr-2" />
					Cancel
				</Button>
			</div>
		</form>
	</CardContent>
</Card>