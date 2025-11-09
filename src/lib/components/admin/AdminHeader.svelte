<script lang="ts">
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import { LogOut, Settings, User } from 'lucide-svelte';

interface User {
	id: string;
	username?: string;
	email?: string;
	role: string;
}

let { user }: { user: User } = $props();

async function handleLogout() {
	try {
		const response = await fetch('/api/auth/logout', {
			method: 'POST'
		});
		
		if (response.ok) {
			window.location.href = '/auth/login';
		}
	} catch (error) {
		console.error('Logout error:', error);
	}
}
</script>

<header class="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center space-x-4">
			<h1 class="text-2xl font-bold text-neutral-100">Admin Dashboard</h1>
			<Badge variant="secondary" class="bg-neutral-800 text-neutral-300">
				CodeOut Admin Panel
			</Badge>
		</div>
		
		<div class="flex items-center space-x-4">
			<div class="flex items-center space-x-2">
				<User class="h-4 w-4 text-neutral-400" />
				<span class="text-sm text-neutral-300">{user.username || user.email}</span>
				<Badge variant="outline" class="text-xs border-emerald-500/30 text-emerald-400">
					{user.role}
				</Badge>
			</div>
			
			<Button variant="ghost" size="sm" class="text-neutral-400 hover:text-neutral-100">
				<Settings class="h-4 w-4" />
			</Button>
			
			<Button 
				variant="ghost" 
				size="sm" 
				class="text-red-400 hover:text-red-300 hover:bg-red-500/10"
				onclick={handleLogout}
			>
				<LogOut class="h-4 w-4" />
			</Button>
		</div>
	</div>
</header>