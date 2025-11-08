<script lang="ts">
import { Users, Code2, Trophy, ShieldCheck } from 'lucide-svelte';
</script>

<section class="w-full py-12 bg-neutral-950 text-neutral-100 border-t border-neutral-900">
  <div class="max-w-5xl mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="flex items-start gap-4">
        <Code2 class="w-8 h-8 text-emerald-400" />
        <div>
          <h3 class="text-xl font-bold mb-1">Real Code Execution</h3>
          <p class="text-neutral-300">Run code in multiple languages with instant feedback using the Piston API.</p>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <Users class="w-8 h-8 text-amber-400" />
        <div>
          <h3 class="text-xl font-bold mb-1">Collaborative Lobbies</h3>
          <p class="text-neutral-300">Join or create lobbies to solve challenges together and compete with friends.</p>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <Trophy class="w-8 h-8 text-rose-400" />
        <div>
          <h3 class="text-xl font-bold mb-1">Rankings & Rewards</h3>
          <p class="text-neutral-300">Climb the leaderboard, earn badges, and showcase your achievements.</p>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <ShieldCheck class="w-8 h-8 text-orange-400" />
        <div>
          <h3 class="text-xl font-bold mb-1">Secure & Modern</h3>
          <p class="text-neutral-300">Built with SvelteKit, Supabase, and shadcn/ui for a fast, secure experience.</p>
        </div>
      </div>
    </div>
  </div>
</section>
