
<script lang="ts">
  import { onMount } from 'svelte';
  import ChallengeLayout from '$lib/components/Challenge/ChallengeLayout.svelte';
  
  let challenge: any = null;
  let loading = true;

  onMount(async () => {
    try {
      // Get challenge ID from URL params if exists
      const params = new URLSearchParams(window.location.search);
      const challengeId = params.get('id');
      
      let url = '/api/challenges';
      if (challengeId) {
        url += `?id=${challengeId}`;
      } else {
        url += '?limit=1&is_global=true';
      }

      const response = await fetch(url);
      const data = await response.json();
      
      if (data.challenges && data.challenges.length > 0) {
        challenge = data.challenges[0];
      }
    } catch (error) {
      console.error('Failed to load challenge:', error);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{challenge?.title || 'Challenge'} - CodeOut App</title>
</svelte:head>

{#if loading}
  <div class="h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-600">Loading challenge...</p>
    </div>
  </div>
{:else}
  <ChallengeLayout {challenge} />
{/if}