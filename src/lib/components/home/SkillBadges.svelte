<script lang="ts">
import { Code2, Brain, Database, Globe, Shield, Zap, Star, Trophy, Target } from 'lucide-svelte';
import { Badge } from '$lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

interface Skill {
  name: string;
  icon: any;
  level: 'Basic' | 'Intermediate' | 'Advanced';
  challenges: number;
  color: string;
  bgColor: string;
}

const skills: Skill[] = [
  {
    name: 'Problem Solving',
    icon: Brain,
    level: 'Intermediate',
    challenges: 150,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20'
  },
  {
    name: 'Algorithms',
    icon: Target,
    level: 'Advanced',
    challenges: 89,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  {
    name: 'Data Structures',
    icon: Database,
    level: 'Intermediate',
    challenges: 76,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/20'
  },
  {
    name: 'Mathematics',
    icon: Zap,
    level: 'Basic',
    challenges: 43,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'Artificial Intelligence',
    icon: Star,
    level: 'Advanced',
    challenges: 32,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10 border-rose-500/20'
  },
  {
    name: 'Java',
    icon: Code2,
    level: 'Intermediate',
    challenges: 124,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/20'
  },
  {
    name: 'Python',
    icon: Code2,
    level: 'Advanced',
    challenges: 98,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 border-green-500/20'
  },
  {
    name: 'C++',
    icon: Code2,
    level: 'Intermediate',
    challenges: 67,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10 border-cyan-500/20'
  }
];

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'Basic': return '🟢';
    case 'Intermediate': return '🟡';
    case 'Advanced': return '🔴';
    default: return '⚪';
  }
};
</script>

<section class="w-full py-16 bg-neutral-900 text-neutral-100">
  <div class="max-w-7xl mx-auto px-4">
    <!-- Header -->
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">
        Practice <span class="text-emerald-400">Skills</span>
      </h2>
      <p class="text-lg text-neutral-300 max-w-2xl mx-auto">
        Master programming concepts through hands-on challenges across various domains and languages
      </p>
    </div>

    <!-- Skills Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {#each skills as skill}
        <Card class="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-{skill.color}/10 {skill.bgColor} border-2">
          <CardHeader class="pb-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-800 border border-neutral-700 group-hover:border-neutral-600 transition-colors">
                <svelte:component this={skill.icon} class="w-5 h-5 {skill.color}" />
              </div>
              <Badge class="text-xs {skill.bgColor} {skill.color} border-none">
                {getLevelIcon(skill.level)} {skill.level}
              </Badge>
            </div>
            <CardTitle class="text-lg font-semibold text-neutral-100 group-hover:{skill.color} transition-colors">
              {skill.name}
            </CardTitle>
          </CardHeader>
          
          <CardContent class="pt-0">
            <div class="flex items-center justify-between">
              <div class="text-sm text-neutral-400">
                {skill.challenges} challenges
              </div>
              <div class="flex items-center gap-1">
                <Trophy class="w-4 h-4 {skill.color}" />
                <span class="text-xs {skill.color} font-medium">Solve</span>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Call to Action -->
    <div class="text-center">
      <p class="text-neutral-400 mb-4">Ready to level up your coding skills?</p>
      <button 
        onclick={() => window.location.href = '/challenge'}
        class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all duration-200 hover:scale-105"
      >
        <Target class="w-5 h-5" />
        Start Practicing
      </button>
    </div>
  </div>
</section>