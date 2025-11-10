<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Download } from 'lucide-svelte';
	import { exportToExcel } from '$lib/utils/excelExport';

	interface Props {
		lobbies: Record<string, unknown>[];
		filename?: string;
		variant?: 'default' | 'outline' | 'ghost';
		size?: 'default' | 'sm' | 'lg';
	}

	let { lobbies, filename = 'lobbies-export', variant = 'outline', size = 'sm' }: Props = $props();

	const handleExport = () => {
		if (lobbies.length === 0) {
			alert('No lobby data to export');
			return;
		}
		
		try {
			exportToExcel(lobbies, filename);
		} catch (error) {
			console.error('Export failed:', error);
			alert('Export failed. Please try again.');
		}
	};
</script>

<Button 
	{variant} 
	{size}
	onclick={handleExport}
	class="flex items-center gap-2"
	disabled={lobbies.length === 0}
>
	<Download class="w-4 h-4" />
	Export Excel
</Button>