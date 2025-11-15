<script lang="ts">
import { Plus, X } from 'lucide-svelte';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
import LobbyBasicInfo from '$lib/components/lobby/LobbyBasicInfo.svelte';
import LobbySettings from '$lib/components/lobby/LobbySettings.svelte';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (lobbyData: any) => void;
}

let { isOpen = false, onClose, onSubmit }: Props = $props();

let formData = $state({
  name: '',
  description: '',
  maxParticipants: 10,
  isPrivate: false,
  timeLimit: 60
});

const handleSubmit = (e: Event) => {
  e.preventDefault();
  
  if (!formData.name.trim()) {
    alert('Please enter a lobby name');
    return;
  }
  
  if (formData.maxParticipants < 2 || formData.maxParticipants > 50) {
    alert('Max participants must be between 2 and 50');
    return;
  }
  
  if (formData.timeLimit < 15 || formData.timeLimit > 300) {
    alert('Time limit must be between 15 and 300 minutes');
    return;
  }
  
  if (onSubmit) {
    onSubmit({
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      max_participants: formData.maxParticipants,
      is_private: formData.isPrivate,
      time_limit_minutes: formData.timeLimit
    });
  }
  
  // Reset form
  formData = {
    name: '',
    description: '',
    maxParticipants: 10,
    isPrivate: false,
    timeLimit: 60
  };
};

const handleClose = () => {
  if (onClose) onClose();
};
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <Card class="w-full max-w-md bg-neutral-900 border-neutral-800">
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          <CardTitle class="text-neutral-100 flex items-center gap-2">
            <Plus class="w-5 h-5 text-emerald-400" />
            Create Lobby
          </CardTitle>
          <CardDescription class="text-neutral-400">
            Create a quiz-style lobby where invited participants can join and compete
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onclick={handleClose} class="text-neutral-400 hover:text-neutral-100">
          <X class="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onsubmit={handleSubmit} class="space-y-4">
          <LobbyBasicInfo
            name={formData.name}
            description={formData.description}
            onNameChange={(value) => formData.name = value}
            onDescriptionChange={(value) => formData.description = value}
          />
          
          <LobbySettings
            maxParticipants={formData.maxParticipants}
            timeLimit={formData.timeLimit}
            isPrivate={formData.isPrivate}
            onMaxParticipantsChange={(value) => formData.maxParticipants = value}
            onTimeLimitChange={(value) => formData.timeLimit = value}
            onPrivateChange={(value) => formData.isPrivate = value}
          />
          
          <div class="flex gap-2 pt-4">
            <Button type="button" variant="outline" onclick={handleClose} class="flex-1 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Cancel
            </Button>
            <Button type="submit" class="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Create Lobby
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
{/if}