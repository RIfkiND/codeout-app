<script lang="ts">
	import { Code2 } from 'lucide-svelte';
	import LoginForm from "$lib/components/Login/login-form.svelte";
		import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { cn } from '$lib/utils';
</script>

<svelte:head>
	<title>Sign In - CodeOut</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-emerald-900/20">
	<div class="grid min-h-screen lg:grid-cols-2">
		<div class="flex flex-col gap-4 p-6 md:p-10">
			<div class="flex justify-center gap-2 md:justify-start">
				<a href="/" class="flex items-center gap-2 font-medium text-white hover:text-emerald-400 transition-colors">
					<div class="bg-emerald-600 text-white flex size-8 items-center justify-center rounded-md">
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
		<div class="relative hidden lg:flex items-center justify-center min-h-full border-l border-neutral-700 bg-neutral-800/30 backdrop-blur-sm">
			<div class="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-neutral-900/50"></div>
			<div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.15),_transparent)] opacity-80"></div>
			<div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_rgba(6,78,59,0.2),_transparent)]"></div>
			
			<div class="relative flex flex-col items-center justify-center w-full p-12 max-w-lg">
				<!-- Code snippet visual -->
				<div class="w-full mb-12">
					<div class="bg-neutral-900/80 backdrop-blur-sm rounded-lg border border-emerald-500/20 p-6 shadow-2xl">
						<div class="flex items-center gap-2 mb-4">
							<div class="w-3 h-3 rounded-full bg-red-500"></div>
							<div class="w-3 h-3 rounded-full bg-yellow-500"></div>
							<div class="w-3 h-3 rounded-full bg-green-500"></div>
							<span class="text-neutral-400 text-sm ml-2">solution.js</span>
						</div>
						<div class="space-y-2 text-sm font-mono">
							<div class="text-emerald-400">function <span class="text-blue-400">solve</span><span class="text-white">(</span><span class="text-orange-400">challenge</span><span class="text-white">) {'{'}</span></div>
							<div class="text-neutral-400 ml-4">// Your brilliant solution</div>
							<div class="text-purple-400 ml-4">return <span class="text-emerald-400">result</span>;</div>
							<div class="text-white">{'}'}</div>
						</div>
					</div>
				</div>
				
				<!-- Welcome content -->
				<div class="text-center">
					<h2 class="text-3xl font-bold text-white mb-4">Welcome to CodeOut</h2>
					<p class="text-neutral-300 text-lg leading-relaxed mb-8">
						Join thousands of developers solving challenges, competing in live lobbies, and improving their coding skills.
					</p>
					
					<!-- Features -->
					<div class="grid grid-cols-1 gap-4 text-left">
						<div class="flex items-center gap-3 text-neutral-300">
							<div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
							<span>Solve coding challenges</span>
						</div>
						<div class="flex items-center gap-3 text-neutral-300">
							<div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
							<span>Compete in real-time</span>
						</div>
						<div class="flex items-center gap-3 text-neutral-300">
							<div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
							<span>Learn and grow together</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
