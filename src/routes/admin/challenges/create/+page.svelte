<script lang="ts">
import type { PageData } from './$types';
import ChallengeCreateForm from '$lib/components/admin/ChallengeCreateForm.svelte';

let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-neutral-950">
	<div class="max-w-4xl mx-auto">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-neutral-100 mb-2">Create New Challenge</h1>
			<p class="text-neutral-400">Add a new coding challenge for the platform</p>
		</div>
		
		<ChallengeCreateForm languages={data.languages} />
	</div>
</div>