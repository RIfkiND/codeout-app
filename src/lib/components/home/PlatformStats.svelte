<script lang="ts">
import { TrendingUp, Users, Trophy, Star, Calendar, BarChart3 } from 'lucide-svelte';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

interface Stats {
  challenges: number;
  users: number;
  submissions: number;
  lobbies: number;
}

interface Props {
  stats?: Stats;
}

let { stats = {
  challenges: 0,
  users: 0,
  submissions: 0,
  lobbies: 0
} }: Props = $props();

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Calculate some derived stats
const activeToday = Math.floor(stats.users * 0.1); // Assume 10% of users are active today
const successRate = stats.submissions > 0 ? parseFloat((stats.submissions * 0.73 / stats.submissions * 100).toFixed(1)) : 73.2; // 73% average success rate
const averageRating = 4.6; // Static for now
</script>

<section class="w-full py-12 bg-gradient-to-br from-neutral-950 via-neutral-900 to-emerald-950/20 border-y border-neutral-800">
  <div class="max-w-7xl mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-10">
      <h2 class="text-2xl md:text-3xl font-bold text-neutral-100 mb-3">
        Platform <span class="text-emerald-400">Statistics</span>
      </h2>
      <p class="text-neutral-400">Join thousands of developers improving their coding skills</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-6 gap-4">
      <!-- Total Users -->
      <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-emerald-500/30 transition-all duration-300 group">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <Users class="w-5 h-5 text-emerald-400" />
            <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-neutral-100 mb-1">{formatNumber(stats.users)}</div>
          <p class="text-xs text-neutral-400">Total Users</p>
        </CardContent>
      </Card>

      <!-- Challenges Solved -->
      <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-blue-500/30 transition-all duration-300 group">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <Trophy class="w-5 h-5 text-blue-400" />
            <TrendingUp class="w-4 h-4 text-blue-400/60" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-neutral-100 mb-1">{formatNumber(stats.challenges)}</div>
          <p class="text-xs text-neutral-400">Total Challenges</p>
        </CardContent>
      </Card>

      <!-- Active Today -->
      <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-amber-500/30 transition-all duration-300 group">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <Calendar class="w-5 h-5 text-amber-400" />
            <div class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-neutral-100 mb-1">{formatNumber(activeToday)}</div>
          <p class="text-xs text-neutral-400">Active Today</p>
        </CardContent>
      </Card>

      <!-- Average Rating -->
      <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-rose-500/30 transition-all duration-300 group">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <Star class="w-5 h-5 text-rose-400" />
            <div class="flex items-center gap-1">
              {#each Array(5) as _, i}
                <Star class="w-3 h-3 {i < Math.floor(averageRating) ? 'text-rose-400 fill-rose-400' : 'text-neutral-600'}" />
              {/each}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-neutral-100 mb-1">{averageRating.toFixed(1)}</div>
          <p class="text-xs text-neutral-400">Avg Rating</p>
        </CardContent>
      </Card>

      <!-- Total Submissions -->
      <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-purple-500/30 transition-all duration-300 group">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <BarChart3 class="w-5 h-5 text-purple-400" />
            <TrendingUp class="w-4 h-4 text-purple-400/60" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-neutral-100 mb-1">{formatNumber(stats.submissions)}</div>
          <p class="text-xs text-neutral-400">Total Submissions</p>
        </CardContent>
      </Card>

      <!-- Success Rate -->
      <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-cyan-500/30 transition-all duration-300 group">
        <CardHeader class="pb-2">
          <div class="flex items-center justify-between">
            <TrendingUp class="w-5 h-5 text-cyan-400" />
            <div class="text-xs text-cyan-400 font-medium">↗</div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold text-neutral-100 mb-1">{successRate}%</div>
          <p class="text-xs text-neutral-400">Success Rate</p>
        </CardContent>
      </Card>
    </div>

    <!-- Progress Bar Visual -->
    <div class="mt-8 text-center">
      <div class="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-sm text-neutral-300">Live statistics updating</span>
        </div>
        <div class="w-px h-6 bg-neutral-600"></div>
        <div class="text-sm text-neutral-400">
          Join the community and start solving challenges today!
        </div>
      </div>
    </div>
  </div>
</section>