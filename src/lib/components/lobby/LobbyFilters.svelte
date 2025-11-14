<script lang="ts">
import { Search, Filter, SortAsc, Users, Trophy, Clock, Zap } from 'lucide-svelte';
import { Input } from '$lib/components/ui/input';
import { Button } from '$lib/components/ui/button';
import { Badge } from '$lib/components/ui/badge';

interface Props {
  searchQuery?: string;
  selectedStatus?: string;
  sortBy?: string;
  onSearchChange?: (query: string) => void;
  onStatusChange?: (status: string) => void;
  onSortChange?: (sort: string) => void;
}

let { 
  searchQuery = '',
  selectedStatus = 'all',
  sortBy = 'created_at',
  onSearchChange,
  onStatusChange,
  onSortChange
}: Props = $props();

const statusOptions = [
  { value: 'all', label: 'All Lobbies', icon: Filter },
  { value: 'waiting', label: 'Waiting', icon: Clock },
  { value: 'active', label: 'Active', icon: Zap },
  { value: 'running', label: 'Running', icon: Users },
  { value: 'finished', label: 'Finished', icon: Trophy }
];

const sortOptions = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'participants', label: 'Most Players' }
];

const handleSearch = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (onSearchChange) onSearchChange(target.value);
};

const handleStatusFilter = (status: string) => {
  if (onStatusChange) onStatusChange(status);
};

const handleSortChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  if (onSortChange) onSortChange(target.value);
};
</script>

<div class="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-6">
  <div class="flex flex-col lg:flex-row gap-4">
    <!-- Search -->
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
      <Input
        type="text"
        placeholder="Search lobbies by name or description..."
        value={searchQuery}
        oninput={handleSearch}
        class="pl-10 bg-neutral-800 border-neutral-700 text-neutral-100 focus:border-emerald-500 transition-colors"
      />
    </div>
    
    <!-- Status Filter -->
    <div class="flex gap-2 flex-wrap">
      {#each statusOptions as option}
        <Button
          variant={selectedStatus === option.value ? "default" : "outline"}
          size="sm"
          onclick={() => handleStatusFilter(option.value)}
          class={selectedStatus === option.value 
            ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25" 
            : "border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
          }
        >
          <svelte:component this={option.icon} class="w-3 h-3 mr-1" />
          {option.label}
        </Button>
      {/each}
    </div>
    
    <!-- Sort -->
    <div class="flex items-center gap-2 min-w-fit">
      <div class="flex items-center gap-2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg">
        <SortAsc class="w-4 h-4 text-neutral-400" />
        <select
          value={sortBy}
          onchange={handleSortChange}
          class="bg-transparent text-sm text-neutral-100 border-none outline-none"
        >
          {#each sortOptions as option}
            <option value={option.value} class="bg-neutral-800">{option.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>
</div>