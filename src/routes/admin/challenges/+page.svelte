<script lang="ts">
import type { PageData } from './$types';
import AdminChallengesList from '$lib/components/admin/AdminChallengesList.svelte';
import { Button } from '$lib/components/ui/button';
import { Plus } from 'lucide-svelte';

let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<div class="max-w-7xl mx-auto p-6">
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold">Challenge Management</h1>
				<p class="text-neutral-400 mt-2">Manage all platform challenges</p>
			</div>
			
			<Button 
				href="/admin/challenges/create"
				class="bg-emerald-600 hover:bg-emerald-700"
			>
				<Plus class="w-4 h-4 mr-2" />
				Create Challenge
			</Button>
		</div>
		
		<AdminChallengesList 
			challenges={data.challenges} 
			pagination={data.pagination} 
		/>
	</div>
</div>