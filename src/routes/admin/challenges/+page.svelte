<script lang="ts">
import type { PageData } from './$types';
import AdminChallengesList from '$lib/components/admin/AdminChallengesList.svelte';
import { Button } from '$lib/components/ui/button';
import { Plus } from 'lucide-svelte';

let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-neutral-950">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold text-neutral-100 mb-2">Challenge Management</h1>
			<p class="text-neutral-400">Manage all platform challenges</p>
		</div>
		
		<Button 
			href="/admin/challenges/create"
			class="bg-emerald-600 hover:bg-emerald-700 text-white"
		>
			<Plus class="h-4 w-4 mr-2" />
			Create Challenge
		</Button>
	</div>
	
	<AdminChallengesList 
		challenges={data.challenges} 
		pagination={data.pagination} 
	/>
</div>