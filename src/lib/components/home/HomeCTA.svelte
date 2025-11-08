<script lang="ts">
import { ArrowRight } from 'lucide-svelte';
</script>

<section class="w-full py-16 bg-neutral-950 text-neutral-100 border-t border-neutral-900">
  <div class="max-w-3xl mx-auto px-4 flex flex-col items-center text-center">
    <h2 class="text-3xl md:text-4xl font-bold mb-4">
      Ready to <span class="text-emerald-400">start coding</span>?
    </h2>
    <p class="text-lg text-neutral-300 mb-8">
      Jump into a challenge or create a lobby to compete with others. Your journey to mastery starts now.
    </p>
    <a href="/challenge" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-lg font-semibold shadow transition">
      Get Started
      <ArrowRight class="w-5 h-5" />
    </a>
  </div>
</section>
