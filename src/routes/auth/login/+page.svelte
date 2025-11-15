<script lang="ts">
	import { Code2 } from 'lucide-svelte';
	import LoginForm from '$lib/components/Login/login-form.svelte';
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';

	import CodePreview from '$lib/components/Login/CodePreview.svelte';
</script>

<svelte:head>
	<title>Sign In - CodeOut</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-emerald-900/20">
	<div class="grid min-h-screen lg:grid-cols-2">
		<div class="flex flex-col gap-4 p-6 md:p-10">
			<div class="flex justify-center gap-2 md:justify-start">
				<a
					href="/"
					class="flex items-center gap-2 font-medium text-white transition-colors hover:text-emerald-400"
				>
					<div class="flex size-8 items-center justify-center rounded-md bg-emerald-600 text-white">
						<Code2 class="size-5" />
					</div>
					<span class="text-xl font-bold">CodeOut</span>
				</a>
			</div>
			<div class="flex flex-1 items-center justify-center">
				<div class="w-full max-w-md">
					<LoginForm />
				</div>
			</div>
		</div>
		<div
			class="relative hidden min-h-full items-center justify-center border-l border-neutral-700 bg-neutral-800/30 backdrop-blur-sm lg:flex"
		>
			<div class="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-neutral-900/50"></div>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.15),_transparent)] opacity-80"
			></div>
			<div
				class="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(6,78,59,0.2),_transparent)]"
			></div>

			<div
				class="relative flex h-full w-full flex-col items-center justify-center justify-items-center gap-8 p-12"
			>
				<!-- Code snippet visual -->
				<CodePreview />

				<!-- Welcome content -->
				<div class="flex w-lg flex-col items-center justify-center text-center">
					<p class="mb-8 text-lg leading-relaxed text-neutral-300">
						Join thousands of developers solving challenges, competing in live lobbies, and
						improving their coding skills.
					</p>

					<!-- Features -->
					<div class="flex flex-col gap-4 text-left text-xl font-bold">
						<div class="flex items-center gap-3 text-white">
							<div class="h-2 w-2 rounded-full bg-emerald-400"></div>
							<span>Solve coding challenges</span>
						</div>
						<div class="flex items-center gap-3 text-white">
							<div class="h-2 w-2 rounded-full bg-emerald-400"></div>
							<span>Compete in real-time</span>
						</div>
						<div class="flex items-center gap-3 text-white">
							<div class="h-2 w-2 rounded-full bg-emerald-400"></div>
							<span>Learn and grow together</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
