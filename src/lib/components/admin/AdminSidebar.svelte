<script lang="ts">
import { page } from '$app/stores';
import { Button } from '$lib/components/ui/button';
import { 
	LayoutDashboard, 
	Users, 
	Trophy, 
	FileText, 
	Settings, 
	BarChart,
	Shield,
	Plus,
	Code
} from 'lucide-svelte';

interface NavItem {
	label: string;
	href: string;
	icon: any;
}

const navItems: NavItem[] = [
	{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
	{ label: 'Create Challenge', href: '/admin/challenges/create', icon: Plus },
	{ label: 'Challenges', href: '/admin/challenges', icon: Trophy },
	{ label: 'Templates', href: '/admin/templates', icon: Code },
	{ label: 'Users', href: '/admin/users', icon: Users },
	{ label: 'Lobbies', href: '/admin/lobbies', icon: Shield },
	{ label: 'Submissions', href: '/admin/submissions', icon: FileText },
	{ label: 'Analytics', href: '/admin/analytics', icon: BarChart },
	{ label: 'Settings', href: '/admin/settings', icon: Settings }
];

$: currentPath = $page.url.pathname;

function isActive(href: string): boolean {
	if (href === '/admin') {
		return currentPath === '/admin';
	}
	return currentPath.startsWith(href);
}
</script>

<aside class="w-64 bg-neutral-900 border-r border-neutral-800 min-h-[calc(100vh-73px)]">
	<nav class="p-4 space-y-2">
		{#each navItems as item}
			<Button
				variant="ghost"
				class="w-full justify-start h-10 {isActive(item.href) 
					? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
					: 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
				}"
				href={item.href}
			>
				<svelte:component this={item.icon} class="h-4 w-4 mr-3" />
				{item.label}
			</Button>
		{/each}
	</nav>
</aside>