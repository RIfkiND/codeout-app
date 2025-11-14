<script lang="ts">
import { Plus, X, ChevronLeft, ChevronRight, Zap, ChevronUp, ChevronDown } from 'lucide-svelte';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Label } from '$lib/components/ui/label';
import { Badge } from '$lib/components/ui/badge';
import * as Select from '$lib/components/ui/select';
import { showError, showSuccess } from '$lib/stores/toast';
import { goto } from '$app/navigation';
import LobbyBasicInfo from '$lib/components/lobby/LobbyBasicInfo.svelte';
import LobbySettings from '$lib/components/lobby/LobbySettings.svelte';

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (lobbyData: any) => void;
}

let { isOpen = false, onClose, onSubmit }: Props = $props();

let currentStep = $state(0);

// Multi-challenge state
let challengeMode: 'single' | 'multi' = $state('single');
let availableChallenges: any[] = $state([]);
let selectedChallenges: any[] = $state([]);
let loadingChallenges = $state(false);
let isCreating = $state(false);

let lobbyData = $state({
  name: '',
  description: '',
  maxParticipants: 10,
  isPrivate: false,
  timeLimit: 60
});

let challengeData = $state({
  title: '',
  description: '',
  difficulty: 'easy',
  timeLimit: 30,
  testCases: [{ input: '', expected_output: '', explanation: '' }]
});

let createCustomChallenge = $state(false);

const steps = [
  { title: 'Lobby Details', description: 'Basic lobby information' },
  { title: 'Challenge Setup', description: 'Configure or create challenges' }
];

// Load available challenges
const loadChallenges = async () => {
  loadingChallenges = true;
  try {
    const response = await fetch('/api/challenges?limit=100&all=true');
    if (response.ok) {
      const data = await response.json();
      availableChallenges = data.challenges || [];
    }
  } catch (error) {
    console.error('Error loading challenges:', error);
  } finally {
    loadingChallenges = false;
  }
};

// Handle challenge selection for multi-challenge mode
const toggleChallengeSelection = (challenge: any) => {
  const index = selectedChallenges.findIndex(c => c.id === challenge.id);
  if (index === -1) {
    selectedChallenges = [...selectedChallenges, challenge];
  } else {
    selectedChallenges = selectedChallenges.filter(c => c.id !== challenge.id);
  }
};

// Move challenge up/down in order
const moveChallengeUp = (index: number) => {
  if (index > 0) {
    const newOrder = [...selectedChallenges];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    selectedChallenges = newOrder;
  }
};

const moveChallengeDown = (index: number) => {
  if (index < selectedChallenges.length - 1) {
    const newOrder = [...selectedChallenges];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    selectedChallenges = newOrder;
  }
};

const resetForm = () => {
  lobbyData = {
    name: '',
    description: '',
    maxParticipants: 10,
    isPrivate: false,
    timeLimit: 60
  };
  challengeData = {
    title: '',
    description: '',
    difficulty: 'easy',
    timeLimit: 30,
    testCases: [{ input: '', expected_output: '', explanation: '' }]
  };
  createCustomChallenge = false;
  challengeMode = 'single';
  selectedChallenges = [];
  availableChallenges = [];
  loadingChallenges = false;
  currentStep = 0;
  isCreating = false;
};

const addTestCase = () => {
  challengeData.testCases = [...challengeData.testCases, { input: '', expected_output: '', explanation: '' }];
};

const removeTestCase = (index: number) => {
  challengeData.testCases = challengeData.testCases.filter((_, i) => i !== index);
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  
  if (currentStep === 0) {
    // Validate lobby data
    if (!lobbyData.name.trim()) {
      alert('Please enter a lobby name');
      return;
    }
    
    if (lobbyData.maxParticipants < 2 || lobbyData.maxParticipants > 50) {
      showError('Validation Error', 'Max participants must be between 2 and 50');
      return;
    }
    
    if (lobbyData.timeLimit < 15 || lobbyData.timeLimit > 300) {
      showError('Validation Error', 'Time limit must be between 15 and 300 minutes');
      return;
    }
    
    // Load challenges when moving to challenge setup
    if (availableChallenges.length === 0) {
      await loadChallenges();
    }
    
    currentStep = 1;
    return;
  }
  
  // Final submission
  isCreating = true;
  
  try {
    const submissionData: any = {
      name: lobbyData.name.trim(),
      description: lobbyData.description?.trim() || null,
      max_participants: lobbyData.maxParticipants,
      is_private: lobbyData.isPrivate,
      time_limit_minutes: lobbyData.timeLimit,
      challenge_mode: challengeMode
    };

    // Handle multi-challenge selection
    if (challengeMode === 'multi' && selectedChallenges.length > 0) {
      submissionData.challenge_ids = selectedChallenges.map(c => c.id);
    }

    // If creating custom challenge, include challenge data
    if (createCustomChallenge && challengeData.title.trim()) {
      submissionData.customChallenge = {
        title: challengeData.title.trim(),
        description: challengeData.description.trim(),
        difficulty: challengeData.difficulty,
        time_limit: challengeData.timeLimit,
        test_cases: challengeData.testCases.filter(tc => tc.input && tc.expected_output)
      };
    }

    if (onSubmit) {
      await onSubmit(submissionData);
    }
    
    resetForm();
    onClose?.();
  } catch (error) {
    console.error('Error creating lobby:', error);
    showError('Unexpected Error', 'An error occurred while creating the lobby.');
  } finally {
    isCreating = false;
  }
};

const handleClose = () => {
  resetForm();
  onClose?.();
};

const goBack = () => {
  if (currentStep > 0) {
    currentStep--;
  }
};
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <Card class="w-full max-w-2xl bg-neutral-900 border-neutral-800 max-h-[90vh] overflow-hidden">
      <CardHeader class="flex flex-row items-center justify-between">
        <div>
          <CardTitle class="text-neutral-100 flex items-center gap-2">
            <Plus class="w-5 h-5 text-emerald-400" />
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription class="text-neutral-400">
            {steps[currentStep].description}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onclick={handleClose} class="text-neutral-400 hover:text-neutral-100">
          <X class="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent class="overflow-y-auto">
        <!-- Progress indicator -->
        <div class="flex items-center justify-center mb-6">
          <div class="flex items-center gap-2">
            {#each steps as step, index}
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors {
                  index === currentStep 
                    ? 'border-emerald-500 bg-emerald-500 text-white' 
                    : index < currentStep 
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-neutral-600 text-neutral-400'
                }">
                  {index + 1}
                </div>
                {#if index < steps.length - 1}
                  <div class="w-12 h-0.5 transition-colors {
                    index < currentStep ? 'bg-emerald-500' : 'bg-neutral-600'
                  }"></div>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <form onsubmit={handleSubmit} class="space-y-6">
          {#if currentStep === 0}
            <!-- Step 1: Lobby Basic Info -->
            <LobbyBasicInfo
              name={lobbyData.name}
              description={lobbyData.description}
              onNameChange={(value) => lobbyData.name = value}
              onDescriptionChange={(value) => lobbyData.description = value}
            />
            
            <LobbySettings
              maxParticipants={lobbyData.maxParticipants}
              timeLimit={lobbyData.timeLimit}
              isPrivate={lobbyData.isPrivate}
              onMaxParticipantsChange={(value) => lobbyData.maxParticipants = value}
              onTimeLimitChange={(value) => lobbyData.timeLimit = value}
              onPrivateChange={(value) => lobbyData.isPrivate = value}
            />
          {:else if currentStep === 1}
            <!-- Step 2: Challenge Setup -->
            <div class="space-y-6">
              <div class="text-center">
                <h3 class="text-lg font-semibold text-neutral-100 mb-2">Challenge Configuration</h3>
                <p class="text-neutral-400 text-sm">Choose how you want to set up challenges for this lobby</p>
              </div>

              <Tabs value={createCustomChallenge ? 'custom' : challengeMode === 'multi' ? 'multi' : 'existing'} onValueChange={(value) => {
                if (value === 'custom') {
                  createCustomChallenge = true;
                  challengeMode = 'single';
                } else if (value === 'multi') {
                  createCustomChallenge = false;
                  challengeMode = 'multi';
                } else {
                  createCustomChallenge = false;
                  challengeMode = 'single';
                }
              }}>
                <TabsList class="grid w-full grid-cols-3 bg-neutral-800">
                  <TabsTrigger value="existing" class="text-neutral-300 data-[state=active]:text-neutral-100">
                    Single Challenge
                  </TabsTrigger>
                  <TabsTrigger value="multi" class="text-neutral-300 data-[state=active]:text-neutral-100">
                    Multi-Challenge
                  </TabsTrigger>
                  <TabsTrigger value="custom" class="text-neutral-300 data-[state=active]:text-neutral-100">
                    Custom Challenge
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="existing" class="space-y-4">
                  <div class="p-6 bg-neutral-800/50 rounded-lg border border-neutral-700">
                    <div class="text-center py-8">
                      <Zap class="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                      <h4 class="text-lg font-medium text-neutral-100 mb-2">Single Challenge Mode</h4>
                      <p class="text-neutral-400 text-sm mb-4">
                        Your lobby will use challenges from the global challenge pool. 
                        Participants can compete on any available challenge.
                      </p>
                      <Badge variant="outline" class="text-emerald-400 border-emerald-500/30">
                        Recommended for quick setup
                      </Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="multi" class="space-y-4">
                  <div class="space-y-4">
                    <div class="text-center">
                      <h4 class="text-lg font-medium text-neutral-100 mb-2">Multi-Challenge Tournament</h4>
                      <p class="text-neutral-400 text-sm">
                        Select multiple challenges that participants will complete in sequence.
                      </p>
                    </div>

                    {#if loadingChallenges}
                      <div class="text-center py-8">
                        <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p class="text-neutral-400 text-sm">Loading challenges...</p>
                      </div>
                    {:else}
                      <div class="grid grid-cols-1 gap-4">
                        <!-- Selected Challenges -->
                        {#if selectedChallenges.length > 0}
                          <div class="space-y-2">
                            <Label class="text-sm font-medium">Selected Challenges ({selectedChallenges.length})</Label>
                            <div class="space-y-2 max-h-48 overflow-y-auto">
                              {#each selectedChallenges as challenge, index}
                                <div class="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                  <div class="flex flex-col gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onclick={() => moveChallengeUp(index)}
                                      disabled={index === 0}
                                      class="h-6 w-6 p-0"
                                    >
                                      <ChevronUp class="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onclick={() => moveChallengeDown(index)}
                                      disabled={index === selectedChallenges.length - 1}
                                      class="h-6 w-6 p-0"
                                    >
                                      <ChevronDown class="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                      <span class="font-mono text-xs bg-neutral-700 px-2 py-1 rounded">#{index + 1}</span>
                                      <span class="font-medium text-neutral-100">{challenge.title}</span>
                                      <Badge variant="outline" class="text-xs">
                                        {challenge.difficulty}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onclick={() => toggleChallengeSelection(challenge)}
                                    class="text-red-400 hover:bg-red-500/20"
                                  >
                                    <X class="w-4 h-4" />
                                  </Button>
                                </div>
                              {/each}
                            </div>
                          </div>
                        {/if}

                        <!-- Available Challenges -->
                        <div class="space-y-2">
                          <Label class="text-sm font-medium">Available Challenges</Label>
                          <div class="max-h-64 overflow-y-auto space-y-2">
                            {#each availableChallenges.filter(c => !selectedChallenges.some(sc => sc.id === c.id)) as challenge}
                              <div 
                                class="flex items-center justify-between p-3 bg-neutral-800/50 border border-neutral-700 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
                                onclick={() => toggleChallengeSelection(challenge)}
                              >
                                <div class="flex-1">
                                  <div class="flex items-center gap-2">
                                    <span class="font-medium text-neutral-100">{challenge.title}</span>
                                    <Badge variant="outline" class="text-xs">
                                      {challenge.difficulty}
                                    </Badge>
                                  </div>
                                  {#if challenge.description}
                                    <p class="text-xs text-neutral-400 mt-1 line-clamp-1">{challenge.description}</p>
                                  {/if}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  class="text-emerald-400 hover:bg-emerald-500/20"
                                >
                                  <Plus class="w-4 h-4" />
                                </Button>
                              </div>
                            {/each}
                          </div>
                        </div>
                      </div>
                    {/if}
                  </div>
                </TabsContent>
                
                <TabsContent value="custom" class="space-y-4">
                  <div class="space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                      <div>
                        <Label for="challengeTitle">Challenge Title *</Label>
                        <Input
                          id="challengeTitle"
                          bind:value={challengeData.title}
                          placeholder="Two Sum Problem"
                          class="mt-1"
                        />
                      </div>

                      <div>
                        <Label for="challengeDescription">Challenge Description *</Label>
                        <Textarea
                          id="challengeDescription"
                          bind:value={challengeData.description}
                          placeholder="Given an array of integers and a target sum, find two numbers that add up to the target..."
                          class="mt-1"
                          rows={4}
                        />
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <Label for="challengeDifficulty">Difficulty</Label>
                          <Select.Root bind:selected={challengeData.difficulty}>
                            <Select.Trigger class="mt-1">
                              <Select.Value placeholder="Select difficulty" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="easy">Easy</Select.Item>
                              <Select.Item value="medium">Medium</Select.Item>
                              <Select.Item value="hard">Hard</Select.Item>
                            </Select.Content>
                          </Select.Root>
                        </div>

                        <div>
                          <Label for="challengeTimeLimit">Time Limit (minutes)</Label>
                          <Input
                            id="challengeTimeLimit"
                            type="number"
                            bind:value={challengeData.timeLimit}
                            min="5"
                            max="120"
                            class="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Test Cases -->
                    <div>
                      <Label class="text-sm font-medium">Test Cases</Label>
                      <div class="space-y-3 mt-2">
                        {#each challengeData.testCases as testCase, index}
                          <Card class="p-4 bg-neutral-800/50">
                            <div class="space-y-3">
                              <div class="flex justify-between items-center">
                                <span class="text-sm font-medium text-neutral-200">Test Case {index + 1}</span>
                                {#if challengeData.testCases.length > 1}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onclick={() => removeTestCase(index)}
                                    class="text-red-400 border-red-400/30 hover:bg-red-500/20"
                                  >
                                    Remove
                                  </Button>
                                {/if}
                              </div>
                              <div class="grid grid-cols-2 gap-3">
                                <div>
                                  <Label class="text-xs">Input</Label>
                                  <Textarea
                                    bind:value={testCase.input}
                                    placeholder="[2,7,11,15], 9"
                                    rows={2}
                                    class="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label class="text-xs">Expected Output</Label>
                                  <Textarea
                                    bind:value={testCase.expected_output}
                                    placeholder="[0,1]"
                                    rows={2}
                                    class="text-sm"
                                  />
                                </div>
                              </div>
                              <div>
                                <Label class="text-xs">Explanation (optional)</Label>
                                <Input
                                  bind:value={testCase.explanation}
                                  placeholder="nums[0] + nums[1] = 2 + 7 = 9"
                                  class="text-sm"
                                />
                              </div>
                            </div>
                          </Card>
                        {/each}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onclick={addTestCase}
                        size="sm"
                        class="mt-3"
                      >
                        <Plus class="w-4 h-4 mr-2" />
                        Add Test Case
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          {/if}
          
          <!-- Navigation Buttons -->
          <div class="flex gap-3 pt-6 border-t border-neutral-800">
            {#if currentStep > 0}
              <Button type="button" variant="outline" onclick={goBack} class="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                <ChevronLeft class="w-4 h-4 mr-2" />
                Back
              </Button>
            {/if}
            
            <Button type="button" variant="outline" onclick={handleClose} class="border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Cancel
            </Button>
            
            <Button 
              type="submit" 
              class="bg-emerald-600 hover:bg-emerald-700 ml-auto"
              disabled={isCreating}
            >
              {#if currentStep === steps.length - 1}
                {#if isCreating}
                  Creating...
                {:else}
                  Create Lobby
                {/if}
              {:else}
                Next
                <ChevronRight class="w-4 h-4 ml-2" />
              {/if}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
{/if}