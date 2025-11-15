<script lang="ts">
import { onMount } from 'svelte';
import { Users, Clock, Trophy, TrendingUp, Play, ArrowRight } from 'lucide-svelte';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
import ExportButton from '$lib/components/lobby/ExportButton.svelte';
import type { LobbyWithUsers } from '$lib/models/lobby';

interface Props {
  lobbies?: LobbyWithUsers[];
}

let { lobbies = [] }: Props = $props();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'running':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'waiting':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'finished':
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    default:
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  }
};

const formatDate = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const getParticipantCount = (lobby: LobbyWithUsers) => lobby.lobby_users?.length || 0;
const canJoin = (lobby: LobbyWithUsers) => 
  lobby.status === 'waiting' && getParticipantCount(lobby) < lobby.max_participants;
</script>

<section class="w-full py-16 bg-neutral-950 text-neutral-100 border-t border-neutral-900">
  <div class="max-w-7xl mx-auto px-4">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
      <div class="mb-6 lg:mb-0">
        <h2 class="text-3xl md:text-4xl font-bold mb-3">
          Active <span class="text-emerald-400">Lobbies</span>
        </h2>
        <p class="text-lg text-neutral-300 max-w-2xl">
          Join live competitions or create your own lobby to compete with developers worldwide.
        </p>
      </div>
      <div class="flex gap-3">
        <ExportButton lobbies={lobbies as unknown as Record<string, unknown>[]} filename="active-lobbies" />
        <Button 
          class="bg-emerald-600 hover:bg-emerald-700"
          onclick={() => window.location.href = '/home/lobby'}
        >
          <Users class="w-4 h-4 mr-2" />
          Browse All
        </Button>
      </div>
    </div>

    {#if lobbies.length === 0}
      <div class="text-center py-12">
        <div class="text-neutral-400 mb-6">
          No active lobbies at the moment
        </div>
        <Button
          onclick={() => window.location.href = '/home/lobby'}
          class="bg-emerald-600 hover:bg-emerald-700"
        >
          <Users class="w-4 h-4 mr-2" />
          Create the First Lobby
        </Button>
      </div>
    {:else}
      <!-- Lobbies Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {#each lobbies.slice(0, 6) as lobby (lobby.id)}
          <Card class="bg-gradient-to-br from-neutral-900 to-neutral-950 border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 group">
            <CardHeader class="pb-4">
              <div class="flex items-start justify-between mb-2">
                <CardTitle class="text-lg font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors">
                  {lobby.name}
                </CardTitle>
                <Badge class={getStatusColor(lobby.status)}>
                  {lobby.status}
                </Badge>
              </div>
              {#if lobby.description}
                <p class="text-neutral-400 text-sm leading-relaxed line-clamp-2">
                  {lobby.description}
                </p>
              {/if}
            </CardHeader>
            
            <CardContent class="pt-0">
              <!-- Stats Grid -->
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="flex items-center gap-2 text-sm">
                  <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700">
                    <Users class="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <div class="text-neutral-100 font-medium">{getParticipantCount(lobby)}/{lobby.max_participants}</div>
                    <div class="text-xs text-neutral-500">Players</div>
                  </div>
                </div>
                
                {#if lobby.prize_pool && lobby.prize_pool > 0}
                  <div class="flex items-center gap-2 text-sm">
                    <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                      <Trophy class="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div class="text-neutral-100 font-medium">${lobby.prize_pool}</div>
                      <div class="text-xs text-neutral-500">Prize</div>
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Participants Preview -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex -space-x-2">
                  {#each (lobby.lobby_users?.slice(0, 3) || []) as participant, index}
                    <div 
                      class="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-medium border-2 border-neutral-900 relative z-{10 - index}"
                      title={participant.users.name || participant.users.email || 'Anonymous'}
                    >
                      {participant.users.name?.charAt(0) || participant.users.email?.charAt(0) || 'U'}
                    </div>
                  {/each}
                  {#if getParticipantCount(lobby) > 3}
                    <div class="w-7 h-7 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 text-xs font-medium border-2 border-neutral-900">
                      +{getParticipantCount(lobby) - 3}
                    </div>
                  {:else if getParticipantCount(lobby) === 0}
                    <div class="text-neutral-500 text-sm">No players yet</div>
                  {/if}
                </div>
                
                <div class="text-xs text-neutral-500">
                  {formatDate(lobby.created_at)}
                </div>
              </div>

              <!-- Action Button -->
              <Button 
                onclick={() => window.location.href = `/home/lobby/${lobby.id}`}
                class={canJoin(lobby) 
                  ? "w-full bg-emerald-600 hover:bg-emerald-700 transition-all duration-200"
                  : "w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-200 transition-all duration-200"
                }
              >
                <Play class="w-4 h-4 mr-2" />
                {#if canJoin(lobby)}
                  Join Lobby
                {:else if lobby.status === 'running'}
                  View Live
                {:else if lobby.status === 'finished'}
                  View Results
                {:else if getParticipantCount(lobby) >= lobby.max_participants}
                  Lobby Full
                {:else}
                  Enter Lobby
                {/if}
              </Button>
            </CardContent>
          </Card>
        {/each}
      </div>

      <!-- View All Button -->
      {#if lobbies.length > 6}
        <div class="text-center">
          <Button 
            onclick={() => window.location.href = '/home/lobby'}
            variant="outline"
            class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
          >
            View All {lobbies.length} Lobbies
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
        </div>
      {/if}
    {/if}
  </div>
</section>