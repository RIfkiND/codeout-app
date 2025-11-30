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

interface Props {
  challenges?: any[];
  user?: any;
}

let { challenges = [], user = null }: Props = $props();

// Quick action cards
const quickActions = [
  {
    title: "Solo Practice",
    description: "Sharpen your skills with algorithm challenges",
    icon: Brain,
    action: "Start Coding",
    href: "/challenge",
    gradient: "from-blue-500 to-cyan-500",
    stats: "500+ Challenges"
  },
  {
    title: "Join Competition",
    description: "Compete with others in real-time lobbies",
    icon: Trophy,
    action: "Find Lobby",
    href: "/home/lobby",
    gradient: "from-purple-500 to-pink-500", 
    stats: "Live Matches"
  },
  {
    title: "Quick Challenge",
    description: "Jump into a 5-minute coding sprint",
    icon: Trophy,
    action: "Quick Start",
    href: "/challenge?difficulty=easy",
    gradient: "from-emerald-500 to-teal-500",
    stats: "< 5 min"
  }
];

// Difficulty levels with enhanced data
const difficultyLevels = [
  {
    name: "Beginner",
    description: "Perfect for getting started",
    icon: Target,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    count: Math.floor(challenges.length * 0.4) || 15,
    avgTime: "10-20 min"
  },
  {
    name: "Intermediate", 
    description: "Level up your problem solving",
    icon: BarChart3,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    count: Math.floor(challenges.length * 0.45) || 20,
    avgTime: "20-45 min"
  },
  {
    name: "Advanced",
    description: "Master complex algorithms",
    icon: Award,
    color: "text-red-400", 
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    count: Math.floor(challenges.length * 0.15) || 8,
    avgTime: "45+ min"
  }
];
</script>

<section class="w-full py-16 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100">
  <div class="max-w-7xl mx-auto px-4">
    <!-- Sign In Prompt for Non-Authenticated Users -->
    {#if !user}
      <div class="mb-12 text-center">
        <Card class="bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border-emerald-500/30 max-w-2xl mx-auto">
          <CardContent class="p-8">
            <div class="flex items-center justify-center mb-4">
              <div class="p-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500">
                <User class="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 class="text-2xl font-bold mb-3 text-white">
              Sign In to Get Started
            </h3>
            <p class="text-neutral-300 mb-6 leading-relaxed">
              Join our community of developers and start solving coding challenges, compete in lobbies, and track your progress.
            </p>
            <Button 
              onclick={() => window.location.href = '/auth/login'}
              size="lg"
              class="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-3"
            >
              <LogIn class="w-5 h-5 mr-2" />
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    {/if}

    <!-- Header -->
    <div class="text-center mb-12">
      <h2 class="text-4xl md:text-5xl font-bold mb-4">
        Start Your <span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Coding Journey</span>
      </h2>
      <p class="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
        {#if user}
          Choose your path and begin solving challenges that match your skill level and interests
        {:else}
          Discover a world of coding challenges and competitive programming
        {/if}
      </p>
    </div>

    <!-- Quick Actions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      {#each quickActions as action}
        <Card class="bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:shadow-2xl group overflow-hidden relative">
          <!-- Gradient Background -->
          <div class="absolute inset-0 bg-gradient-to-br {action.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
          
          <CardHeader class="pb-4 relative">
            <div class="flex items-center gap-4 mb-3">
              <div class="p-3 rounded-xl bg-gradient-to-br {action.gradient} shadow-lg">
                <action.icon class="w-6 h-6 text-white" />
              </div>
              <Badge variant="outline" class="border-neutral-600 text-neutral-400">
                {action.stats}
              </Badge>
            </div>
            <CardTitle class="text-xl font-bold text-neutral-100 group-hover:text-white transition-colors">
              {action.title}
            </CardTitle>
            <p class="text-neutral-400 text-sm leading-relaxed">
              {action.description}
            </p>
          </CardHeader>
          
          <CardContent class="pt-0 relative">
            <Button 
              onclick={() => window.location.href = user ? action.href : '/auth/login'}
              class="w-full bg-gradient-to-r {action.gradient} hover:shadow-lg transition-all duration-200 border-0"
            >
              <Rocket class="w-4 h-4 mr-2" />
              {user ? action.action : 'Sign In to Start'}
            </Button>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Difficulty Levels -->
    <div class="mb-12">
      <div class="text-center mb-8">
        <h3 class="text-2xl md:text-3xl font-bold mb-3">
          Choose Your <span class="text-emerald-400">Difficulty</span>
        </h3>
        <p class="text-neutral-400">
          Pick the right level of challenge for your current skills
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        {#each difficultyLevels as level}
          <Card class="bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:shadow-xl group {level.borderColor} hover:shadow-{level.color}/5">
            <CardHeader class="text-center pb-4">
              <div class="mx-auto mb-4 p-4 rounded-2xl {level.bgColor} w-fit">
                <level.icon class="w-8 h-8 {level.color}" />
              </div>
              <CardTitle class="text-xl font-bold text-neutral-100 group-hover:text-white transition-colors">
                {level.name}
              </CardTitle>
              <p class="text-neutral-400 text-sm">
                {level.description}
              </p>
            </CardHeader>
            
            <CardContent class="text-center pt-0">
              <div class="space-y-3 mb-6">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-400">Available</span>
                  <span class="font-semibold {level.color}">{level.count} challenges</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-neutral-400">Avg. Time</span>
                  <span class="font-semibold text-neutral-200">{level.avgTime}</span>
                </div>
              </div>
              
              <Button 
                onclick={() => window.location.href = user ? `/challenge?difficulty=${level.name.toLowerCase()}` : '/auth/login'}
                variant="outline"
                class="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-{level.color} hover:text-{level.color} transition-all"
              >
                <Target class="w-4 h-4 mr-2" />
                {user ? `Try ${level.name}` : 'Sign In to Try'}
              </Button>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>

    <!-- Popular Categories -->
    <div class="bg-neutral-900/30 rounded-2xl p-8 border border-neutral-800">
      <div class="text-center mb-8">
        <h3 class="text-2xl font-bold mb-3">
          Popular <span class="text-emerald-400">Categories</span>
        </h3>
        <p class="text-neutral-400">
          Explore trending challenge categories
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {#each [
          { name: 'Arrays', icon: BarChart3, color: 'text-blue-400' },
          { name: 'Algorithms', icon: Brain, color: 'text-purple-400' },
          { name: 'Data Structures', icon: Code2, color: 'text-green-400' },
          { name: 'Dynamic Programming', icon: Zap, color: 'text-yellow-400' }
        ] as category}
          <button 
            onclick={() => window.location.href = user ? `/challenge?category=${category.name.toLowerCase()}` : '/auth/login'}
            class="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800 transition-all duration-200 group text-left"
          >
            <category.icon class="w-5 h-5 {category.color} mb-2" />
            <div class="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
              {category.name}
            </div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Call to Action -->
    <div class="text-center mt-12">
      <Button 
        onclick={() => window.location.href = user ? '/challenge' : '/auth/login'}
        size="lg"
        class="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-8 py-3 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <BookOpen class="w-5 h-5 mr-3" />
        {user ? 'Browse All Challenges' : 'Sign In to Browse'}
      </Button>
    </div>
  </div>
</section>