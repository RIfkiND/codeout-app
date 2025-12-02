<script lang="ts">
	import {
		Code2,
		Users,
		Trophy,
		Zap,
		Target,
		BookOpen,
		Timer,
		BarChart3,
		Rocket,
		Brain,
		Award,
		User,
		LogIn
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	// Quick action cards
	const quickActions = [
		{
			title: 'Solo Practice',
			description: 'Sharpen your skills with algorithm challenges',
			icon: Brain,
			action: 'Start Coding',
			href: '/challenge',
			gradient: 'from-blue-500 to-cyan-500',
			stats: '500+ Challenges'
		},
		{
			title: 'Join Competition',
			description: 'Compete with others in real-time lobbies',
			icon: Trophy,
			action: 'Find Lobby',
			href: '/home/lobby',
			gradient: 'from-purple-500 to-pink-500',
			stats: 'Live Matches'
		},
		{
			title: 'Quick Challenge',
			description: 'Jump into a 5-minute coding sprint',
			icon: Trophy,
			action: 'Quick Start',
			href: '/challenge?difficulty=easy',
			gradient: 'from-emerald-500 to-teal-500',
			stats: '< 5 min'
		}
	];
</script>

<section
	class="w-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-16 text-neutral-100"
>
	<div class="mx-auto max-w-7xl px-4">
		<!-- Sign In Prompt for Non-Authenticated Users -->
		<div class="mb-12 text-center">
			<Card
				class="mx-auto max-w-2xl border-emerald-500/30 bg-gradient-to-br from-emerald-900/20 to-cyan-900/20"
			>
				<CardContent class="p-8">
					<div class="mb-4 flex items-center justify-center">
						<div class="rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 p-4">
							<User class="h-8 w-8 text-white" />
						</div>
					</div>
					<h3 class="mb-3 text-2xl font-bold text-white">Sign In to Get Started</h3>
					<p class="mb-6 leading-relaxed text-neutral-300">
						Join our community of developers and start solving coding challenges, compete in
						lobbies, and track your progress.
					</p>
					<Button
						onclick={() => (window.location.href = '/auth/login')}
						size="lg"
						class="bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-3 text-white hover:from-emerald-700 hover:to-cyan-700"
					>
						<LogIn class="mr-2 h-5 w-5" />
						Sign In to Continue
					</Button>
				</CardContent>
			</Card>
		</div>

		<!-- Popular Categories -->
		<div class="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-8">
			<div class="mb-8 text-center">
				<h3 class="mb-3 text-2xl font-bold">
					Popular <span class="text-emerald-400">Categories</span>
				</h3>
				<p class="text-neutral-400">Explore trending challenge categories</p>
			</div>

			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				{#each [{ name: 'Arrays', icon: BarChart3, color: 'text-blue-400' }, { name: 'Algorithms', icon: Brain, color: 'text-purple-400' }, { name: 'Data Structures', icon: Code2, color: 'text-green-400' }, { name: 'Dynamic Programming', icon: Zap, color: 'text-yellow-400' }] as category}
					<button
						onclick={() => (window.location.href = '/auth/login')}
						class="group rounded-xl border border-neutral-700 bg-neutral-800/50 p-4 text-left transition-all duration-200 hover:border-neutral-600 hover:bg-neutral-800"
					>
						<svelte:component this={category.icon} class="h-5 w-5 {category.color} mb-2" />
						<div
							class="text-sm font-medium text-neutral-200 transition-colors group-hover:text-white"
						>
							{category.name}
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Call to Action -->
		<div class="mt-12 text-center">
			<Button
				onclick={() => (window.location.href = '/auth/login')}
				size="lg"
				class="bg-gradient-to-r from-emerald-600 to-cyan-600 px-8 py-3 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-emerald-700 hover:to-cyan-700 hover:shadow-2xl"
			>
				<BookOpen class="mr-3 h-5 w-5" />
				Sign In to Browse
			</Button>
		</div>
	</div>
</section>
