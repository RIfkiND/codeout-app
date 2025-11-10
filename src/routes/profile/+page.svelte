<script lang="ts">
	import { User, Trophy, Code, Activity, Calendar, Settings, LogOut, Edit, Check, X } from 'lucide-svelte';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ProfileEditForm from '$lib/components/Profile/ProfileEditForm.svelte';
	import type { PageData } from './$types';

	interface UserProfile {
		username?: string;
		bio?: string;
		github_username?: string;
		preferred_language?: string;
		users?: {
			name?: string;
			email?: string;
		};
	}

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const { user, stats } = data;
	const profile = data.profile as unknown as UserProfile;

	// Edit state
	let isEditingUsername = $state(false);
	let isEditingProfile = $state(false);
	let newUsername = $state(profile?.username || '');
	let usernameError = $state('');
	let usernameChecking = $state(false);
	let usernameSaving = $state(false);
	let profileSaving = $state(false);
	let profileError = $state('');

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getDisplayName() {
		if (profile?.users?.name) {
			return profile.users.name;
		}
		if (profile?.username) {
			return profile.username;
		}
		return user.email?.split('@')[0] || 'User';
	}

	async function checkUsernameAvailability(username: string) {
		if (!username || username.length < 3) {
			usernameError = 'Username must be at least 3 characters';
			return false;
		}

		usernameChecking = true;
		try {
			const response = await fetch(`/api/profile/check-username?username=${encodeURIComponent(username)}`);
			const result = await response.json();
			
			if (!result.available) {
				usernameError = result.error || 'Username is not available';
				return false;
			}
			
			usernameError = '';
			return true;
		} catch (error) {
			usernameError = 'Failed to check username availability';
			return false;
		} finally {
			usernameChecking = false;
		}
	}

	async function saveUsername() {
		if (!newUsername || usernameError) return;

		usernameSaving = true;
		try {
			const response = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: newUsername })
			});

			const result = await response.json();
			
			if (!response.ok) {
				usernameError = result.error || 'Failed to update username';
				return;
			}

			// Update local profile data
			if (result.profile) {
				Object.assign(profile, result.profile);
			}
			
			isEditingUsername = false;
			usernameError = '';
			
			// Refresh the page to update navigation
			window.location.reload();
		} catch (error) {
			usernameError = 'Failed to update username';
		} finally {
			usernameSaving = false;
		}
	}

	function cancelUsernameEdit() {
		newUsername = profile?.username || '';
		usernameError = '';
		isEditingUsername = false;
	}

	async function handleUsernameInput(event: Event) {
		const target = event.target as HTMLInputElement;
		newUsername = target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
		
		if (newUsername && newUsername !== profile?.username) {
			await checkUsernameAvailability(newUsername);
		} else {
			usernameError = '';
		}
	}

	async function saveProfileChanges(updates: any) {
		profileSaving = true;
		profileError = '';
		
		try {
			const response = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates)
			});

			const result = await response.json();
			
			if (!response.ok) {
				profileError = result.error || 'Failed to update profile';
				return;
			}

			// Update local profile data
			if (profile) {
				Object.assign(profile, result.profile);
			}
			
			isEditingProfile = false;
		} catch (error) {
			profileError = 'Failed to update profile';
		} finally {
			profileSaving = false;
		}
	}

	function cancelProfileEdit() {
		isEditingProfile = false;
		profileError = '';
	}
</script>

<svelte:head>
	<title>Profile - CodeOut</title>
</svelte:head>

<div class="min-h-screen bg-neutral-950">
	<div class="container mx-auto px-4 py-8">
		<!-- Profile Header -->
		<div class="mb-8">
			<Card class="border-neutral-700 bg-neutral-800/50">
				<CardContent class="p-6">
					<div class="flex items-start justify-between">
						<div class="flex items-center space-x-6">
							<div class="relative">
								<div class="h-24 w-24 rounded-full bg-emerald-600 flex items-center justify-center">
									<User class="h-12 w-12 text-white" />
								</div>
								<div class="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-emerald-500 border-2 border-neutral-800"></div>
							</div>
							<div>
								<h1 class="text-3xl font-bold text-white mb-2">
									{getDisplayName()}
								</h1>
								
								<!-- Username Section -->
								<div class="mb-2">
									{#if isEditingUsername}
										<div class="flex items-center gap-2">
											<Input
												bind:value={newUsername}
												oninput={handleUsernameInput}
												placeholder="Enter username"
												class="w-48 text-sm"
												disabled={usernameChecking || usernameSaving}
											/>
											<Button 
												onclick={saveUsername}
												disabled={!newUsername || !!usernameError || usernameChecking || usernameSaving}
												size="sm"
												class="p-2"
											>
												{#if usernameSaving}
													<Activity class="h-3 w-3 animate-spin" />
												{:else}
													<Check class="h-3 w-3" />
												{/if}
											</Button>
											<Button 
												onclick={cancelUsernameEdit}
												variant="outline" 
												size="sm"
												class="p-2"
												disabled={usernameSaving}
											>
												<X class="h-3 w-3" />
											</Button>
										</div>
										{#if usernameError}
											<p class="text-red-400 text-xs mt-1">{usernameError}</p>
										{/if}
										{#if usernameChecking}
											<p class="text-neutral-400 text-xs mt-1">Checking availability...</p>
										{/if}
									{:else}
										<div class="flex items-center gap-2">
											<span class="text-emerald-400 font-mono text-sm">
												@{profile?.username || 'No username set'}
											</span>
											<Button
												onclick={() => { 
													isEditingUsername = true; 
													newUsername = profile?.username || '';
												}}
												variant="ghost"
												size="sm"
												class="p-1 h-6 w-6"
											>
												<Edit class="h-3 w-3" />
											</Button>
										</div>
									{/if}
								</div>
								
								<p class="text-neutral-400 mb-2">{user.email}</p>
								<div class="flex items-center text-sm text-neutral-500">
									<Calendar class="h-4 w-4 mr-2" />
									Member since {formatDate(user.created_at)}
								</div>
							</div>
						</div>
						<Button variant="outline" class="border-neutral-600 hover:bg-neutral-700" onclick={() => isEditingProfile = true}>
							<Settings class="h-4 w-4 mr-2" />
							Edit Profile
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
			<!-- Statistics Cards -->
			<div class="lg:col-span-1 space-y-6">
				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardHeader>
						<CardTitle class="flex items-center text-white">
							<Trophy class="h-5 w-5 mr-2 text-emerald-400" />
							Statistics
						</CardTitle>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex justify-between items-center">
							<span class="text-neutral-400">Solved Challenges</span>
							<span class="text-2xl font-bold text-emerald-400">{stats.solvedChallenges}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-neutral-400">Total Submissions</span>
							<span class="text-xl font-semibold text-white">{stats.totalSubmissions}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-neutral-400">Success Rate</span>
							<span class="text-xl font-semibold text-emerald-400">{stats.successRate}%</span>
						</div>
					</CardContent>
				</Card>

				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardHeader>
						<CardTitle class="flex items-center text-white">
							<Activity class="h-5 w-5 mr-2 text-emerald-400" />
							Activity
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center py-8">
							<Activity class="h-12 w-12 text-neutral-600 mx-auto mb-4" />
							<p class="text-neutral-500">Activity chart coming soon</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-6">
				{#if isEditingProfile}
					<!-- Profile Edit Form -->
					<ProfileEditForm 
						{profile}
						onSave={saveProfileChanges}
						onCancel={cancelProfileEdit}
						saving={profileSaving}
						error={profileError}
					/>
				{:else}
					<!-- Profile Information Display -->
					<Card class="border-neutral-700 bg-neutral-800/50">
						<CardHeader>
							<CardTitle class="text-white">Profile Information</CardTitle>
						</CardHeader>
						<CardContent class="space-y-4">
							{#if profile?.bio}
								<div>
									<h4 class="text-sm font-medium text-neutral-300 mb-2">Bio</h4>
									<p class="text-neutral-400">{profile.bio}</p>
								</div>
							{/if}
							
							{#if profile?.github_username}
								<div>
									<h4 class="text-sm font-medium text-neutral-300 mb-2">GitHub</h4>
									<a 
										href="https://github.com/{profile.github_username}" 
										target="_blank"
										class="text-emerald-400 hover:text-emerald-300 flex items-center"
									>
										@{profile.github_username}
									</a>
								</div>
							{/if}
							
							<div>
								<h4 class="text-sm font-medium text-neutral-300 mb-2">Preferred Language</h4>
								<p class="text-neutral-400 capitalize">{profile?.preferred_language || 'JavaScript'}</p>
							</div>
							
							{#if !profile?.bio && !profile?.github_username}
								<div class="text-center py-8">
									<User class="h-12 w-12 text-neutral-600 mx-auto mb-4" />
									<h3 class="text-lg font-semibold text-white mb-2">Complete Your Profile</h3>
									<p class="text-neutral-400 mb-4">Add a bio and connect your GitHub to make your profile stand out</p>
									<Button onclick={() => isEditingProfile = true} class="bg-emerald-600 hover:bg-emerald-700">
										<Edit class="h-4 w-4 mr-2" />
										Complete Profile
									</Button>
								</div>
							{/if}
						</CardContent>
					</Card>
				{/if}
				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardHeader>
						<CardTitle class="flex items-center text-white">
							<Code class="h-5 w-5 mr-2 text-emerald-400" />
							Recent Activity
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center py-12">
							<Code class="h-16 w-16 text-neutral-600 mx-auto mb-4" />
							<h3 class="text-xl font-semibold text-white mb-2">No Recent Activity</h3>
							<p class="text-neutral-400 mb-6">Start solving challenges to see your activity here</p>
							<Button href="/challenge" class="bg-emerald-600 hover:bg-emerald-700">
								<Code class="h-4 w-4 mr-2" />
								Browse Challenges
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card class="border-neutral-700 bg-neutral-800/50">
					<CardHeader>
						<CardTitle class="text-white">Achievements</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="text-center py-12">
							<Trophy class="h-16 w-16 text-neutral-600 mx-auto mb-4" />
							<h3 class="text-xl font-semibold text-white mb-2">No Achievements Yet</h3>
							<p class="text-neutral-400">Complete challenges to unlock achievements</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	</div>
</div>