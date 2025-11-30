<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { X, Trophy, Clock, Zap } from 'lucide-svelte';
	import { showError } from '$lib/stores/toast';

	interface Challenge {
		id: string;
		title: string;
		description: string;
		difficulty: string;
		time_limit: number;
		max_score: number;
	}

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onStart: (challengeIds: string[], mode: string) => Promise<void>;
	}

	let { isOpen, onClose, onStart }: Props = $props();

	let challenges = $state<Challenge[]>([]);
	let selectedChallenges = $state<string[]>([]);
	let challengeMode = $state<'single' | 'multi'>('single');
	let isLoading = $state(true);
	let isStarting = $state(false);

	const loadChallenges = async () => {
		try {
			isLoading = true;
			const response = await fetch('/api/challenges');
			if (response.ok) {
				const data = await response.json();
				challenges = data.challenges || [];
			} else {
				showError('Load Error', 'Failed to load challenges');
			}
		} catch (error) {
			console.error('Failed to load challenges:', error);
			showError('Load Error', 'Failed to load challenges');
		} finally {
			isLoading = false;
		}
	};

	const toggleChallenge = (challengeId: string) => {
		if (challengeMode === 'single') {
			selectedChallenges = [challengeId];
		} else {
			if (selectedChallenges.includes(challengeId)) {
				selectedChallenges = selectedChallenges.filter(id => id !== challengeId);
			} else {
				selectedChallenges = [...selectedChallenges, challengeId];
			}
		}
	};

	const handleModeChange = (mode: 'single' | 'multi') => {
		challengeMode = mode;
		if (mode === 'single') {
			selectedChallenges = selectedChallenges.slice(0, 1);
		}
	};

	const handleStart = async () => {
		if (selectedChallenges.length === 0) {
			showError('Selection Error', 'Please select at least one challenge');
			return;
		}

		if (challengeMode === 'multi' && selectedChallenges.length < 2) {
			showError('Selection Error', 'Multi-challenge mode requires at least 2 challenges');
			return;
		}

		try {
			isStarting = true;
			await onStart(selectedChallenges, challengeMode);
			onClose();
		} catch (error) {
			console.error('Failed to start lobby:', error);
		} finally {
			isStarting = false;
		}
	};

	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty.toLowerCase()) {
			case 'easy': return 'bg-emerald-500/20 text-emerald-400';
			case 'medium': return 'bg-amber-500/20 text-amber-400';
			case 'hard': return 'bg-red-500/20 text-red-400';
			default: return 'bg-neutral-500/20 text-neutral-400';
		}
	};

	const formatTimeLimit = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		return `${minutes} min`;
	};

	$effect(() => {
		if (isOpen) {
			loadChallenges();
		}
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- Backdrop -->
		<button
			class="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-pointer"
			onclick={onClose}
			aria-label="Close modal"
		></button>

		<!-- Modal -->
		<div class="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl">
			<!-- Header -->
			<div class="flex items-center justify-between p-6 border-b border-neutral-800">
				<div>
					<h2 class="text-xl font-semibold text-neutral-100">Select Challenges</h2>
					<p class="text-sm text-neutral-400 mt-1">Choose challenges for your lobby competition</p>
				</div>
				<Button
					variant="ghost"
					onclick={onClose}
					class="text-neutral-400 hover:text-neutral-200"
				>
					<X class="w-5 h-5" />
				</Button>
			</div>

			<!-- Mode Selection -->
			<div class="p-6 border-b border-neutral-800">
				<div class="flex gap-4">
					<Button
						variant={challengeMode === 'single' ? 'default' : 'outline'}
						onclick={() => handleModeChange('single')}
						class="flex-1"
					>
						<Trophy class="w-4 h-4 mr-2" />
						Single Challenge
					</Button>
					<Button
						variant={challengeMode === 'multi' ? 'default' : 'outline'}
						onclick={() => handleModeChange('multi')}
						class="flex-1"
					>
						<Zap class="w-4 h-4 mr-2" />
						Multi-Challenge Tournament
					</Button>
				</div>
				
				{#if challengeMode === 'multi'}
					<p class="text-xs text-neutral-400 mt-2">
						Select 2 or more challenges. Participants will complete them in sequence.
					</p>
				{/if}
			</div>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto max-h-96 p-6">
				{#if isLoading}
					<div class="flex items-center justify-center py-12">
						<div class="text-center">
							<div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
							<p class="text-neutral-400">Loading challenges...</p>
						</div>
					</div>
				{:else if challenges.length === 0}
					<div class="text-center py-12">
						<Trophy class="w-12 h-12 mx-auto mb-4 text-neutral-600" />
						<p class="text-neutral-400">No challenges available</p>
					</div>
				{:else}
					<div class="grid gap-4">
						{#each challenges as challenge}
							<Card
								class="cursor-pointer transition-all duration-200 border-2 {selectedChallenges.includes(challenge.id) 
									? 'border-emerald-500 bg-emerald-500/5' 
									: 'border-neutral-700 hover:border-neutral-600 bg-neutral-800/50'
								}"
								onclick={() => toggleChallenge(challenge.id)}
							>
								<CardContent class="p-4">
									<div class="flex items-start justify-between mb-3">
										<div class="flex-1">
											<h3 class="font-semibold text-neutral-100 mb-1">{challenge.title}</h3>
											<p class="text-sm text-neutral-400 line-clamp-2">{challenge.description}</p>
										</div>
										
										{#if selectedChallenges.includes(challenge.id)}
											<div class="ml-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
												<div class="w-2 h-2 bg-white rounded-full"></div>
											</div>
										{:else}
											<div class="ml-4 w-6 h-6 border-2 border-neutral-600 rounded-full"></div>
										{/if}
									</div>

									<div class="flex items-center justify-between">
										<div class="flex items-center gap-3">
											<Badge class={getDifficultyColor(challenge.difficulty)}>
												{challenge.difficulty}
											</Badge>
											
											<div class="flex items-center gap-1 text-xs text-neutral-400">
												<Clock class="w-3 h-3" />
												{formatTimeLimit(challenge.time_limit)}
											</div>
											
											<div class="flex items-center gap-1 text-xs text-neutral-400">
												<Trophy class="w-3 h-3" />
												{challenge.max_score} pts
											</div>
										</div>

										{#if challengeMode === 'multi' && selectedChallenges.includes(challenge.id)}
											<Badge variant="outline" class="text-xs">
												#{selectedChallenges.indexOf(challenge.id) + 1}
											</Badge>
										{/if}
									</div>
								</CardContent>
							</Card>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="flex items-center justify-between p-6 border-t border-neutral-800">
				<div class="text-sm text-neutral-400">
					{selectedChallenges.length} challenge{selectedChallenges.length !== 1 ? 's' : ''} selected
				</div>

				<div class="flex gap-3">
					<Button
						variant="outline"
						onclick={onClose}
						disabled={isStarting}
					>
						Cancel
					</Button>
					
					<Button
						onclick={handleStart}
						disabled={selectedChallenges.length === 0 || isStarting}
						class="bg-emerald-600 hover:bg-emerald-700"
					>
						{#if isStarting}
							<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
							Starting...
						{:else}
							Start Lobby
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>