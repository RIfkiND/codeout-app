<script lang="ts">
import { onMount } from 'svelte';
import { Search, Filter, Code2, Clock, Users, Trophy, ArrowRight, Star, Zap } from 'lucide-svelte';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
import type { Challenge } from '$lib/models/challenge';

interface Props {
  challenges?: Challenge[];
}

let { challenges = [] }: Props = $props();

let filteredChallenges = $state(challenges);
let searchQuery = $state('');
let selectedDifficulty = $state('all');
let isLoading = $state(false);

const difficultyOptions = [
  { value: 'all', label: 'All Levels', color: 'bg-neutral-500/20 text-neutral-400' },
  { value: 'easy', label: 'Easy', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/20 text-amber-400' },
  { value: 'hard', label: 'Hard', color: 'bg-rose-500/20 text-rose-400' }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'medium':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'hard':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    default:
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  }
};

const filterChallenges = () => {
  let filtered = [...challenges];

  // Filter by search query
  if (searchQuery.trim()) {
    filtered = filtered.filter(challenge =>
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by difficulty
  if (selectedDifficulty !== 'all') {
    filtered = filtered.filter(challenge => challenge.difficulty === selectedDifficulty);
  }

  filteredChallenges = filtered;
};

const handleSearch = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchQuery = target.value;
  filterChallenges();
};

const handleDifficultyFilter = (difficulty: string) => {
  selectedDifficulty = difficulty;
  filterChallenges();
};

const formatViewCount = (count: number | null) => {
  if (!count) return '0';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count.toString();
};

const getSuccessRate = (rate: number | null) => {
  if (!rate) return 0;
  return Math.round(rate * 100);
};

// Reactive updates
$effect(() => {
  filterChallenges();
});

onMount(() => {
  filterChallenges();
});
</script>

<section class="w-full py-16 bg-neutral-950 text-neutral-100 border-t border-neutral-900">
  <div class="max-w-7xl mx-auto px-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
      <div class="mb-6 lg:mb-0">
        <h2 class="text-3xl md:text-4xl font-bold mb-3">
          Featured <span class="text-emerald-400">Challenges</span>
        </h2>
        <p class="text-lg text-neutral-300 max-w-2xl">
          Practice with our curated collection of coding challenges. From beginner-friendly problems to expert-level algorithms.
        </p>
      </div>
      <div class="flex gap-3">
        <Button 
          variant="outline"
          class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          onclick={() => window.location.href = '/challenge'}
        >
          <Code2 class="w-4 h-4 mr-2" />
          All Challenges
        </Button>
        <Button 
          class="bg-emerald-600 hover:bg-emerald-700"
          onclick={() => window.location.href = '/home/lobby'}
        >
          <Users class="w-4 h-4 mr-2" />
          Join Lobby
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search challenges by title or description..."
            value={searchQuery}
            oninput={handleSearch}
            class="pl-10 bg-neutral-800 border-neutral-700 text-neutral-100 focus:border-emerald-500 transition-colors"
          />
        </div>
        
        <!-- Difficulty Filter -->
        <div class="flex gap-2 flex-wrap">
          {#each difficultyOptions as option}
            <Button
              variant={selectedDifficulty === option.value ? "default" : "outline"}
              size="sm"
              onclick={() => handleDifficultyFilter(option.value)}
              class={selectedDifficulty === option.value 
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25" 
                : "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
              }
            >
              {option.label}
            </Button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Challenges Grid -->
    {#if isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    {:else if filteredChallenges.length === 0}
      <div class="text-center py-12">
        <div class="text-neutral-400 mb-4">
          {challenges.length === 0 ? 'No challenges available yet' : 'No challenges match your filters'}
        </div>
        {#if challenges.length === 0}
          <Button
            onclick={() => window.location.href = '/challenge'}
            class="bg-emerald-600 hover:bg-emerald-700"
          >
            <Code2 class="w-4 h-4 mr-2" />
            Browse All Challenges
          </Button>
        {/if}
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each filteredChallenges.slice(0, 6) as challenge (challenge.id)}
          <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 group">
            <CardHeader class="pb-4">
              <div class="flex items-start justify-between mb-2">
                <CardTitle class="text-lg font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {challenge.title}
                </CardTitle>
                <Badge class={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
              </div>
              <p class="text-neutral-400 text-sm leading-relaxed line-clamp-3">
                {challenge.description}
              </p>
            </CardHeader>
            
            <CardContent class="pt-0">
              <!-- Stats -->
              <div class="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div class="flex items-center gap-1 text-neutral-400">
                  <Clock class="w-4 h-4" />
                  <span>{challenge.time_limit}m</span>
                </div>
                <div class="flex items-center gap-1 text-neutral-400">
                  <Star class="w-4 h-4" />
                  <span>{formatViewCount(challenge.view_count)} views</span>
                </div>
                <div class="flex items-center gap-1 text-neutral-400">
                  <Trophy class="w-4 h-4" />
                  <span>{challenge.max_score} pts</span>
                </div>
              </div>

              <!-- Success Rate -->
              {#if challenge.success_rate !== null}
                <div class="mb-4">
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-neutral-400">Success Rate</span>
                    <span class="text-neutral-200 font-medium">{getSuccessRate(challenge.success_rate)}%</span>
                  </div>
                  <div class="w-full bg-neutral-800 rounded-full h-2">
                    <div 
                      class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                      style="width: {getSuccessRate(challenge.success_rate)}%"
                    ></div>
                  </div>
                </div>
              {/if}

              <!-- Tags -->
              {#if challenge.tags && challenge.tags.length > 0}
                <div class="flex flex-wrap gap-1 mb-4">
                  {#each challenge.tags.slice(0, 3) as tag}
                    <Badge variant="outline" class="text-xs border-neutral-600 text-neutral-400">
                      {tag}
                    </Badge>
                  {/each}
                  {#if challenge.tags.length > 3}
                    <Badge variant="outline" class="text-xs border-neutral-600 text-neutral-400">
                      +{challenge.tags.length - 3}
                    </Badge>
                  {/if}
                </div>
              {/if}

              <!-- Action Button -->
              <Button 
                onclick={() => window.location.href = `/challenge/${challenge.id}`}
                class="w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
              >
                <Zap class="w-4 h-4 mr-2" />
                Start Challenge
              </Button>
            </CardContent>
          </Card>
        {/each}
      </div>

      <!-- View All Button -->
      {#if challenges.length > 6}
        <div class="text-center">
          <Button 
            onclick={() => window.location.href = '/challenge'}
            variant="outline"
            class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
          >
            View All {challenges.length} Challenges
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
        </div>
      {/if}
    {/if}
  </div>
</section>