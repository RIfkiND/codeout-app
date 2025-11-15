<script lang="ts">
import { Users, Clock, Trophy, Play, Lock, Zap, Star, Timer } from 'lucide-svelte';
import type { LobbyWithUsers } from '$lib/models/lobby';
import { Badge } from '$lib/components/ui/badge';

interface Props {
  lobby: LobbyWithUsers;
  onJoin?: (lobbyId: string) => void;
}

let { lobby, onJoin }: Props = $props();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'waiting':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'running':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'finished':
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    default:
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
    case 'running':
      return Zap;
    case 'waiting':
      return Clock;
    case 'finished':
      return Trophy;
    default:
      return Clock;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTimeLimit = (minutes: number | null) => {
  if (!minutes) return 'No limit';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const getParticipantCount = () => lobby.lobby_users?.length || 0;
const isFull = () => getParticipantCount() >= lobby.max_participants;
const canJoin = () => lobby.status === 'waiting' && !isFull();

const handleJoinClick = () => {
  if (canJoin() && onJoin) {
    onJoin(lobby.id);
  }
};
</script>

<div class="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-6 hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5 group">
  <!-- Header with status -->
  <div class="flex items-start justify-between mb-4">
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="text-lg font-semibold text-neutral-100 group-hover:text-emerald-400 transition-colors">{lobby.name}</h3>
        {#if lobby.is_private}
          <Lock class="w-4 h-4 text-amber-400" />
        {/if}
      </div>
      {#if lobby.description}
        <p class="text-neutral-400 text-sm leading-relaxed">{lobby.description}</p>
      {/if}
    </div>
    <Badge class={getStatusColor(lobby.status)}>
      <svelte:component this={getStatusIcon(lobby.status)} class="w-3 h-3 mr-1" />
      {lobby.status}
    </Badge>
  </div>

  <!-- Stats Grid -->
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="flex items-center gap-2 text-sm">
      <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700">
        <Users class="w-4 h-4 text-neutral-400" />
      </div>
      <div>
        <div class="text-neutral-100 font-medium">{getParticipantCount()}/{lobby.max_participants}</div>
        <div class="text-xs text-neutral-500">Players</div>
      </div>
    </div>
    
    <div class="flex items-center gap-2 text-sm">
      <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700">
        <Timer class="w-4 h-4 text-neutral-400" />
      </div>
      <div>
        <div class="text-neutral-100 font-medium">{formatTimeLimit(lobby.time_limit_minutes)}</div>
        <div class="text-xs text-neutral-500">Time Limit</div>
      </div>
    </div>

    {#if lobby.prize_pool && lobby.prize_pool > 0}
      <div class="flex items-center gap-2 text-sm col-span-2">
        <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
          <Trophy class="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div class="text-neutral-100 font-medium">${lobby.prize_pool}</div>
          <div class="text-xs text-neutral-500">Prize Pool</div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Participants Preview -->
  <div class="flex items-center justify-between mb-4">
    <div class="flex -space-x-2">
      {#each (lobby.lobby_users?.slice(0, 4) || []) as participant, index}
        <div 
          class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-medium border-2 border-neutral-900 relative z-{10 - index}"
          title={participant.users.name || participant.users.email || 'Anonymous'}
        >
          {participant.users.name?.charAt(0) || participant.users.email?.charAt(0) || 'U'}
        </div>
      {/each}
      {#if getParticipantCount() > 4}
        <div class="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 text-xs font-medium border-2 border-neutral-900">
          +{getParticipantCount() - 4}
        </div>
      {:else if getParticipantCount() === 0}
        <div class="text-neutral-500 text-sm">No players yet</div>
      {/if}
    </div>
    
    <div class="text-xs text-neutral-500">
      {formatDate(lobby.created_at)}
    </div>
  </div>

  <!-- Action Button -->
  <div class="flex gap-2">
    {#if canJoin()}
      <button
        onclick={handleJoinClick}
        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25"
      >
        <Play class="w-4 h-4" />
        Join Lobby
      </button>
    {:else}
      <a 
        href="/home/lobby/{lobby.id}" 
        class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-200 rounded-lg text-sm font-medium transition-all duration-200"
      >
        <Play class="w-4 h-4" />
        {#if lobby.status === 'waiting' && isFull()}
          Lobby Full
        {:else if lobby.status === 'running'}
          View Live
        {:else if lobby.status === 'finished'}
          View Results
        {:else}
          Enter Lobby
        {/if}
      </a>
    {/if}
    
    <a 
      href="/home/lobby/{lobby.id}" 
      class="inline-flex items-center justify-center px-3 py-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-200 rounded-lg transition-all duration-200"
      title="View Details"
    >
      <Star class="w-4 h-4" />
    </a>
  </div>

  {#if isFull() && lobby.status === 'waiting'}
    <div class="mt-3 text-center">
      <div class="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400">
        <Users class="w-3 h-3" />
        Lobby is full
      </div>
    </div>
  {/if}
</div>