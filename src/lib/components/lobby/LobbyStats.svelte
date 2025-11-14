<script lang="ts">
import { Users, Trophy, TrendingUp, Clock } from 'lucide-svelte';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

interface Props {
  stats?: {
    totalLobbies: number;
    activeLobbies: number;
    totalParticipants: number;
  };
}

let { stats = {
  totalLobbies: 0,
  activeLobbies: 0,
  totalParticipants: 0
}}: Props = $props();


</script>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <Card class="bg-neutral-900 border-neutral-800">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-neutral-200">Total Lobbies</CardTitle>
      <Users class="h-4 w-4 text-emerald-400" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold text-neutral-100">{stats.totalLobbies}</div>
      <p class="text-xs text-neutral-400">All time</p>
    </CardContent>
  </Card>
  
  <Card class="bg-neutral-900 border-neutral-800">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-neutral-200">Active Now</CardTitle>
      <Clock class="h-4 w-4 text-amber-400" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold text-neutral-100">{stats.activeLobbies}</div>
      <p class="text-xs text-neutral-400">Currently running</p>
    </CardContent>
  </Card>
  
  <Card class="bg-neutral-900 border-neutral-800">
    <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle class="text-sm font-medium text-neutral-200">Participants</CardTitle>
      <TrendingUp class="h-4 w-4 text-rose-400" />
    </CardHeader>
    <CardContent>
      <div class="text-2xl font-bold text-neutral-100">{stats.totalParticipants}</div>
      <p class="text-xs text-neutral-400">Total players</p>
    </CardContent>
  </Card>
  

</div>