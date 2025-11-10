<script lang="ts">
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-svelte';
import { Badge } from '$lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  solved: number;
  country: string;
  trend: 'up' | 'down' | 'same';
}

interface Props {
  users?: any[];
}

// Transform the users data to match our leaderboard format
let { users = [] }: Props = $props();

const topUsers = users.map((user, index) => ({
  rank: user.rank || index + 1,
  name: user.username || 'Anonymous',
  score: user.total_score || 0,
  solved: user.challenges_solved || 0,
  country: 'Unknown',
  trend: (Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'same') as 'up' | 'down' | 'same',
  avatar: user.avatar_url
}));

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return Crown;
    case 2: return Trophy;
    case 3: return Medal;
    default: return Star;
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1: return 'text-yellow-400';
    case 2: return 'text-gray-300';
    case 3: return 'text-amber-600';
    default: return 'text-neutral-400';
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return '↗️';
    case 'down': return '↘️';
    default: return '→';
  }
};

const getCountryFlag = (country: string) => {
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'KR': '🇰🇷', 
    'BR': '🇧🇷',
    'IN': '🇮🇳',
    'DE': '🇩🇪'
  };
  return flags[country] || '🌍';
};
</script>

<section class="w-full py-16 bg-neutral-950 text-neutral-100 border-t border-neutral-900">
  <div class="max-w-4xl mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-10">
      <h2 class="text-3xl md:text-4xl font-bold mb-3">
        Global <span class="text-emerald-400">Leaderboard</span>
      </h2>
      <p class="text-lg text-neutral-300 max-w-2xl mx-auto">
        Top performers competing worldwide. Climb the ranks and showcase your coding prowess!
      </p>
    </div>

    <!-- Leaderboard Card -->
    <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800">
      <CardHeader>
        <CardTitle class="flex items-center gap-3 text-xl">
          <Trophy class="w-6 h-6 text-emerald-400" />
          Top Coders This Week
        </CardTitle>
      </CardHeader>
      
      <CardContent class="space-y-3">
        {#each topUsers as user, index (user.rank)}
          <div class="group flex items-center gap-4 p-4 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-all duration-200 border border-neutral-700/50 hover:border-neutral-600">
            <!-- Rank -->
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700">
              <svelte:component this={getRankIcon(user.rank)} class="w-6 h-6 {getRankColor(user.rank)}" />
            </div>

            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors">
                  {user.name}
                </h3>
                <span class="text-lg">{getCountryFlag(user.country)}</span>
                <Badge class="text-xs bg-neutral-700 text-neutral-300 border-none">
                  #{user.rank}
                </Badge>
              </div>
              <div class="flex items-center gap-4 text-sm text-neutral-400">
                <span>{user.solved} problems solved</span>
                <span class="flex items-center gap-1">
                  {getTrendIcon(user.trend)}
                  <span class={user.trend === 'up' ? 'text-emerald-400' : user.trend === 'down' ? 'text-red-400' : 'text-neutral-400'}>
                    {user.trend === 'up' ? 'Rising' : user.trend === 'down' ? 'Falling' : 'Stable'}
                  </span>
                </span>
              </div>
            </div>

            <!-- Score -->
            <div class="text-right">
              <div class="text-2xl font-bold text-neutral-100 group-hover:text-emerald-400 transition-colors">
                {user.score.toLocaleString()}
              </div>
              <div class="text-sm text-neutral-400">points</div>
            </div>

            <!-- Trend Indicator -->
            <div class="flex items-center justify-center w-8 h-8">
              <TrendingUp class="w-5 h-5 {user.trend === 'up' ? 'text-emerald-400' : 'text-neutral-500'}" />
            </div>
          </div>
        {/each}

        <!-- View Full Leaderboard -->
        <div class="pt-4 text-center border-t border-neutral-700">
          <button 
            onclick={() => window.location.href = '/leaderboard'}
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600 hover:text-neutral-100 transition-all duration-200"
          >
            <Trophy class="w-4 h-4" />
            View Full Leaderboard
          </button>
        </div>
      </CardContent>
    </Card>

    <!-- Call to Action -->
    <div class="mt-10 text-center">
      <div class="inline-flex flex-col items-center gap-4 p-6 rounded-lg bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20">
        <Crown class="w-8 h-8 text-emerald-400" />
        <div>
          <h3 class="text-lg font-semibold text-neutral-100 mb-2">Ready to compete?</h3>
          <p class="text-neutral-400 mb-4">Solve challenges, earn points, and climb the global rankings!</p>
          <button 
            onclick={() => window.location.href = '/challenge'}
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 hover:scale-105"
          >
            <Star class="w-5 h-5" />
            Start Competing
          </button>
        </div>
      </div>
    </div>
  </div>
</section>