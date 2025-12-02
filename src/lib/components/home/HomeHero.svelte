<script lang="ts">
	import { Sparkles, LogIn } from 'lucide-svelte';
	import CodePreview from '../Login/CodePreview.svelte';
	import { BackgroundBeams } from '$lib/components/ui/BackgroundBeams';
</script>

<section
	class="px-auto relative grid h-screen w-full grid-cols-1 grid-rows-2 content-center items-center justify-center bg-neutral-950 py-20 text-neutral-100"
>
	<BackgroundBeams />
	<div class="z-10 flex flex-col items-center justify-center text-center">
		<div
			class="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1"
		>
			<Sparkles class="h-5 w-5 text-amber-400" />
			<span class="text-sm font-medium tracking-wide text-amber-300">Level up your coding</span>
		</div>
		<h1 class="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
			Code. Compete. <span class="text-emerald-400">Collaborate.</span>
		</h1>
		<p class="mb-8 max-w-2xl text-lg text-neutral-300 md:text-xl">
			Practice coding challenges, join lobbies, and improve your skills in a beautiful, modern
			playground.
		</p>
		<div class="flex flex-col justify-center gap-4 sm:flex-row">
			<a
				href="/challenge"
				class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-12 py-3 text-lg font-bold shadow-lg shadow-emerald-600/50 transition hover:from-emerald-700 hover:to-cyan-700"
			>
				Start Solving
			</a>
			<a
				href="/auth/login"
				class="text-md inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-6 py-3 font-semibold transition hover:bg-neutral-800"
			>
				Sign In
				<LogIn class="h-5 w-5" />
			</a>
		</div>
	</div>
	<div class="z-10 flex items-center justify-center">
		<div class="rounded-2xl p-0 shadow-lg shadow-emerald-600/50"><CodePreview /></div>
	</div>
</section>
