<script lang="ts">
	import { page } from '$app/stores';
	import { User, LogOut, Home, Trophy, Code2, Settings, Activity } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		DropdownMenu,
		DropdownMenuTrigger,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuLabel
	} from '$lib/components/ui/dropdown-menu';
	import MenuNavButton from '$lib/components/MenuNavButton.svelte';

	interface Props {
		user?: any;
		profile?: any;
	}

	let { user = null, profile = null }: Props = $props();

	const handleSignOut = async () => {
		try {
			const response = await fetch('/api/auth/logout', { method: 'POST' });
			
			if (response.ok) {
				// Force reload to clear all client-side state
				window.location.href = '/';
			} else {
				console.error('Logout failed');
			}
		} catch (error) {
			console.error('Error during logout:', error);
			// Fallback: redirect anyway to clear state
			window.location.href = '/';
		}
	};

	function getDisplayName() {
		if (profile?.username) {
			return `@${profile.username}`;
		}
		if (user?.user_metadata?.name || user?.user_metadata?.full_name) {
			return user.user_metadata.name || user.user_metadata.full_name;
		}
		return user?.email?.split('@')[0] || 'User';
	}
</script>

<header class="sticky top-0 w-full bg-neutral-950/90 backdrop-blur-lg border-b border-neutral-800 z-50">
	<div class="max-w-7xl mx-auto px-4">
		<div class="flex items-center justify-between py-4">
			<!-- Logo -->
			<div class="flex items-center gap-8">
				<a href="/" class="flex items-center gap-2 text-2xl font-bold text-white hover:text-emerald-400 transition-colors">
					<Code2 class="w-8 h-8 text-emerald-400" />
					CodeOut
				</a>
				
				<!-- Main Navigation -->
				{#if user}
					<nav class="hidden md:flex items-center gap-2">
						<MenuNavButton href="/home">
							<Home class="w-4 h-4 mr-2" />
							Home
						</MenuNavButton>
						<MenuNavButton href="/challenge">
							<Code2 class="w-4 h-4 mr-2" />
							Challenges
						</MenuNavButton>
						<MenuNavButton href="/home/lobby">
							<Trophy class="w-4 h-4 mr-2" />
							Lobbies
						</MenuNavButton>
					</nav>
				{/if}
			</div>

			<!-- User Actions -->
			<div class="flex items-center gap-4">
				{#if user}
					<!-- User Profile Dropdown -->
					<DropdownMenu>
						<DropdownMenuTrigger>
							<div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-neutral-900/50 border border-neutral-700 hover:bg-neutral-800/70 transition-colors cursor-pointer">
								<div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
									<User class="w-4 h-4 text-white" />
								</div>
								<div class="hidden sm:block text-sm">
									<div class="font-medium text-neutral-200">{getDisplayName()}</div>
									<div class="text-xs text-neutral-400">Welcome back!</div>
								</div>
							</div>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" class="w-56">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem href="/profile">
								<User class="w-4 h-4 mr-2" />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem href="/dashboard">
								<Activity class="w-4 h-4 mr-2" />
								Dashboard
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings class="w-4 h-4 mr-2" />
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onclick={handleSignOut}>
								<LogOut class="w-4 h-4 mr-2" />
								Sign Out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				{:else}
					<!-- Sign In Button -->
					<Button
						onclick={() => window.location.href = '/auth/login'}
						class="bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						<User class="w-4 h-4 mr-2" />
						Sign In
					</Button>
				{/if}
			</div>
		</div>
	</div>
</header>