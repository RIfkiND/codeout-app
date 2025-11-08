<script lang="ts">
import { ArrowRight, Sparkles, Users, Code2, Trophy } from 'lucide-svelte';
</script>

<section class="w-full py-20 bg-neutral-950 text-neutral-100">
  <div class="max-w-5xl mx-auto px-4 flex flex-col items-center text-center">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 mb-6">
      <Sparkles class="w-5 h-5 text-amber-400" />
      <span class="text-sm font-medium tracking-wide text-amber-300">Level up your coding</span>
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
      Code. Compete. <span class="text-emerald-400">Collaborate.</span>
    </h1>
    <p class="max-w-2xl text-lg md:text-xl text-neutral-300 mb-8">
      Practice coding challenges, join lobbies, and improve your skills in a beautiful, modern playground.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/challenge" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-lg font-semibold shadow transition">
        Start Solving
        <ArrowRight class="w-5 h-5" />
      </a>
      <a href="/dashboard" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-lg font-semibold transition">
        Dashboard
      </a>
    </div>
  </div>
</section>
