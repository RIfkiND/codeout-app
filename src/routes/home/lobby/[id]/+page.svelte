<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { 
		Users, Clock, Trophy, Play, MessageCircle, Crown, 
		ArrowLeft, Settings, Copy, ExternalLink, User,
		Timer, Calendar, Target, Award, Zap, CheckCircle
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import type { LobbyWithUsers } from '$lib/models/lobby';

	// Extended interface to include creator info
	interface LobbyWithCreator extends LobbyWithUsers {
		users?: {
			name: string | null;
			email: string | null;
		};
	}

	interface SubmissionWithDetails {
		id: string;
		user_id: string;
		challenge_id: string;
		language: string;
		is_correct: boolean;
		score: number;
		test_cases_passed: number;
		total_test_cases: number;
		submitted_at: string;
		users?: {
			name: string | null;
			email: string | null;
		};
		challenges?: {
			title: string;
		};
	}

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	
	let lobby = $state(data.lobby as LobbyWithCreator);
	let submissions = $state(data.submissions as SubmissionWithDetails[] || []);
	let isJoining = $state(false);
	let activeTab = $state('overview');
	let currentUser = $state(data.user); // Get from session data

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
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatTimeLimit = (minutes: number | null) => {
		if (!minutes) return 'No time limit';
		if (minutes < 60) return `${minutes} minutes`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
	};

	const getParticipantCount = () => lobby.lobby_users?.length || 0;
	const isCreator = () => lobby.created_by === currentUser?.id;
	const isParticipant = () => lobby.lobby_users?.some(lu => lu.users.id === currentUser?.id);
	const canJoin = () => lobby.status === 'waiting' && getParticipantCount() < lobby.max_participants && !isParticipant();
	const canStart = () => lobby.status === 'waiting' && isCreator() && getParticipantCount() > 0;

	const handleJoinLobby = async () => {
		if (!currentUser || !canJoin()) return;
		
		isJoining = true;
		try {
			const response = await fetch(`/api/lobbies/${lobby.id}/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			
			if (response.ok) {
				// Refresh lobby data
				location.reload();
			}
		} catch (error) {
			console.error('Failed to join lobby:', error);
		} finally {
			isJoining = false;
		}
	};

	const handleStartLobby = async () => {
		if (!canStart()) return;
		
		try {
			const response = await fetch(`/api/lobbies/${lobby.id}/start`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			
			if (response.ok) {
				location.reload();
			}
		} catch (error) {
			console.error('Failed to start lobby:', error);
		}
	};

	const copyLobbyLink = () => {
		navigator.clipboard.writeText(window.location.href);
		// TODO: Show toast notification
	};
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100 p-4">
	<div class="max-w-7xl mx-auto">
		<!-- Header -->
		<div class="flex items-center gap-4 mb-6">
			<Button 
				variant="ghost" 
				size="sm" 
				onclick={() => goto('/home/lobby')}
				class="text-neutral-400 hover:text-neutral-100"
			>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Back to Lobbies
			</Button>
		</div>

		<!-- Lobby Info Header -->
		<div class="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-6 mb-6">
			<div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
				<div class="flex-1">
					<div class="flex items-center gap-3 mb-2">
						<h1 class="text-3xl font-bold">{lobby.name}</h1>
						<Badge class={getStatusColor(lobby.status)}>
							{#if lobby.status === 'running'}
								<Zap class="w-3 h-3 mr-1" />
							{:else if lobby.status === 'waiting'}
								<Clock class="w-3 h-3 mr-1" />
							{:else if lobby.status === 'finished'}
								<CheckCircle class="w-3 h-3 mr-1" />
							{/if}
							{lobby.status}
						</Badge>
						{#if lobby.is_private}
							<Badge variant="outline" class="border-amber-500/30 text-amber-400">
								Private
							</Badge>
						{/if}
					</div>
					{#if lobby.description}
						<p class="text-neutral-400 text-lg leading-relaxed">{lobby.description}</p>
					{/if}
					<div class="flex items-center gap-4 mt-3 text-sm text-neutral-500">
						<div class="flex items-center gap-1">
							<Calendar class="w-4 h-4" />
							Created {formatDate(lobby.created_at)}
						</div>
						<div class="flex items-center gap-1">
							<Crown class="w-4 h-4" />
							by {(lobby as LobbyWithCreator).users?.name || (lobby as LobbyWithCreator).users?.email || 'Anonymous'}
						</div>
					</div>
				</div>
				
				<div class="flex items-center gap-3">
					<Button
						variant="outline"
						size="sm"
						onclick={copyLobbyLink}
						class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
					>
						<Copy class="w-4 h-4 mr-2" />
						Copy Link
					</Button>
					
					{#if canJoin()}
						<Button
							onclick={handleJoinLobby}
							disabled={isJoining}
							class="bg-emerald-600 hover:bg-emerald-700"
						>
							<Play class="w-4 h-4 mr-2" />
							{isJoining ? 'Joining...' : 'Join Lobby'}
						</Button>
					{:else if canStart()}
						<Button
							onclick={handleStartLobby}
							class="bg-emerald-600 hover:bg-emerald-700"
						>
							<Play class="w-4 h-4 mr-2" />
							Start Lobby
						</Button>
					{:else if lobby.status === 'running' && isParticipant()}
						<Button
							onclick={() => goto(`/challenge`)}
							class="bg-blue-600 hover:bg-blue-700"
						>
							<ExternalLink class="w-4 h-4 mr-2" />
							Enter Challenge
						</Button>
					{/if}
					
					{#if isCreator()}
						<Button
							variant="outline"
							size="sm"
							class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
						>
							<Settings class="w-4 h-4" />
						</Button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Stats Grid -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
			<Card class="bg-neutral-900 border-neutral-800">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-neutral-200">Participants</CardTitle>
					<Users class="h-4 w-4 text-emerald-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-neutral-100">{getParticipantCount()}/{lobby.max_participants}</div>
					<p class="text-xs text-neutral-400">
						{lobby.max_participants - getParticipantCount()} spots remaining
					</p>
				</CardContent>
			</Card>
			
			<Card class="bg-neutral-900 border-neutral-800">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-neutral-200">Time Limit</CardTitle>
					<Timer class="h-4 w-4 text-amber-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-neutral-100">{formatTimeLimit(lobby.time_limit_minutes)}</div>
					<p class="text-xs text-neutral-400">Per challenge</p>
				</CardContent>
			</Card>
			
			{#if lobby.prize_pool && lobby.prize_pool > 0}
				<Card class="bg-neutral-900 border-neutral-800">
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium text-neutral-200">Prize Pool</CardTitle>
						<Trophy class="h-4 w-4 text-orange-400" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold text-neutral-100">${lobby.prize_pool}</div>
						<p class="text-xs text-neutral-400">Total rewards</p>
					</CardContent>
				</Card>
			{/if}
			
			<Card class="bg-neutral-900 border-neutral-800">
				<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-neutral-200">Submissions</CardTitle>
					<Target class="h-4 w-4 text-rose-400" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-neutral-100">{submissions.length}</div>
					<p class="text-xs text-neutral-400">Total attempts</p>
				</CardContent>
			</Card>
		</div>

		<!-- Main Content Tabs -->
		<Tabs value={activeTab} onValueChange={(value: string) => activeTab = value} class="w-full">
			<TabsList class="grid w-full grid-cols-4 bg-neutral-900 border border-neutral-800">
				<TabsTrigger value="overview" class="text-neutral-300 data-[state=active]:text-neutral-100">Overview</TabsTrigger>
				<TabsTrigger value="participants" class="text-neutral-300 data-[state=active]:text-neutral-100">Participants</TabsTrigger>
				<TabsTrigger value="submissions" class="text-neutral-300 data-[state=active]:text-neutral-100">Submissions</TabsTrigger>
				<TabsTrigger value="chat" class="text-neutral-300 data-[state=active]:text-neutral-100">Chat</TabsTrigger>
			</TabsList>
			
			<TabsContent value="overview" class="space-y-6">
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<Card class="bg-neutral-900 border-neutral-800">
						<CardHeader>
							<CardTitle class="text-neutral-100">Lobby Information</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="flex justify-between">
								<span class="text-neutral-400">Status:</span>
								<Badge class={getStatusColor(lobby.status)}>{lobby.status}</Badge>
							</div>
							<div class="flex justify-between">
								<span class="text-neutral-400">Created:</span>
								<span class="text-neutral-200">{formatDate(lobby.created_at)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-neutral-400">Creator:</span>
								<span class="text-neutral-200">{(lobby as LobbyWithCreator).users?.name || (lobby as LobbyWithCreator).users?.email || 'Anonymous'}</span>
							</div>
							{#if lobby.start_time}
								<div class="flex justify-between">
									<span class="text-neutral-400">Started:</span>
									<span class="text-neutral-200">{formatDate(lobby.start_time)}</span>
								</div>
							{/if}
							{#if lobby.end_time}
								<div class="flex justify-between">
									<span class="text-neutral-400">Ended:</span>
									<span class="text-neutral-200">{formatDate(lobby.end_time)}</span>
								</div>
							{/if}
						</CardContent>
					</Card>
					
					<Card class="bg-neutral-900 border-neutral-800">
						<CardHeader>
							<CardTitle class="text-neutral-100">Recent Activity</CardTitle>
						</CardHeader>
						<CardContent>
							{#if submissions.length > 0}
								<div class="space-y-3">
									{#each submissions.slice(0, 5) as submission}
										<div class="flex items-center justify-between py-2 border-b border-neutral-800 last:border-b-0">
											<div class="flex items-center gap-3">
												<div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-medium">
													{submission.users?.name?.charAt(0) || 'U'}
												</div>
												<div>
													<div class="text-sm font-medium text-neutral-200">
														{submission.users?.name || 'Anonymous'}
													</div>
													<div class="text-xs text-neutral-400">
														{submission.challenges?.title || 'Challenge'}
													</div>
												</div>
											</div>
											<div class="text-right">
												<Badge class={submission.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
													{submission.is_correct ? 'Passed' : 'Failed'}
												</Badge>
												<div class="text-xs text-neutral-500 mt-1">
													{formatDate(submission.submitted_at)}
												</div>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<p class="text-neutral-400 text-center py-8">No submissions yet</p>
							{/if}
						</CardContent>
					</Card>
				</div>
			</TabsContent>
			
			<TabsContent value="participants" class="space-y-4">
				<Card class="bg-neutral-900 border-neutral-800">
					<CardHeader>
						<CardTitle class="text-neutral-100">
							Participants ({getParticipantCount()}/{lobby.max_participants})
						</CardTitle>
					</CardHeader>
					<CardContent>
						{#if lobby.lobby_users && lobby.lobby_users.length > 0}
							<div class="grid gap-3">
								{#each lobby.lobby_users as participant, index}
									<div class="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
										<div class="flex items-center gap-3">
											<div class="relative">
												<div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-medium">
													{participant.users.name?.charAt(0) || participant.users.email?.charAt(0) || 'U'}
												</div>
												{#if participant.users.id === lobby.created_by}
													<Crown class="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />
												{/if}
											</div>
											<div>
												<div class="font-medium text-neutral-100">
													{participant.users.name || participant.users.email || 'Anonymous'}
												</div>
												<div class="text-sm text-neutral-400">
													Joined {formatDate(participant.joined_at)}
												</div>
											</div>
										</div>
										<div class="flex items-center gap-2">
											{#if participant.users.id === lobby.created_by}
												<Badge class="bg-amber-500/20 text-amber-400 border-amber-500/30">
													<Crown class="w-3 h-3 mr-1" />
													Creator
												</Badge>
											{/if}
											<Badge variant="outline" class="border-neutral-600 text-neutral-400">
												#{index + 1}
											</Badge>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-neutral-400 text-center py-8">No participants yet</p>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>
			
			<TabsContent value="submissions" class="space-y-4">
				<Card class="bg-neutral-900 border-neutral-800">
					<CardHeader>
						<CardTitle class="text-neutral-100">All Submissions ({submissions.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{#if submissions.length > 0}
							<div class="space-y-3">
								{#each submissions as submission}
									<div class="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
										<div class="flex items-center gap-4">
											<div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-medium">
												{submission.users?.name?.charAt(0) || 'U'}
											</div>
											<div>
												<div class="font-medium text-neutral-100">
													{submission.users?.name || 'Anonymous'}
												</div>
												<div class="text-sm text-neutral-400">
													{submission.challenges?.title || 'Challenge'} • {submission.language}
												</div>
											</div>
										</div>
										<div class="flex items-center gap-4">
											<div class="text-right">
												<div class="font-medium text-neutral-200">{submission.score} pts</div>
												<div class="text-xs text-neutral-400">
													{submission.test_cases_passed}/{submission.total_test_cases} tests
												</div>
											</div>
											<Badge class={submission.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
												{submission.is_correct ? 'Passed' : 'Failed'}
											</Badge>
											<div class="text-xs text-neutral-500">
												{formatDate(submission.submitted_at)}
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-neutral-400 text-center py-8">No submissions yet</p>
						{/if}
					</CardContent>
				</Card>
			</TabsContent>
			
			<TabsContent value="chat" class="space-y-4">
				<Card class="bg-neutral-900 border-neutral-800">
					<CardHeader>
						<CardTitle class="text-neutral-100 flex items-center gap-2">
							<MessageCircle class="w-5 h-5" />
							Lobby Chat
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="h-96 flex items-center justify-center text-neutral-400">
							<div class="text-center">
								<MessageCircle class="w-12 h-12 mx-auto mb-3 opacity-50" />
								<p>Chat feature coming soon!</p>
								<p class="text-sm mt-1">Communicate with other participants in real-time.</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</TabsContent>
		</Tabs>
	</div>
</div>
