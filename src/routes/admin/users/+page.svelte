<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Search, UserPlus, TrendingUp, Crown, Calendar, Code, Activity } from 'lucide-svelte';
	
	interface UserData {
		id: string;
		name?: string;
		email: string;
		role: string;
		created_at: string;
		profile?: {
			username?: string;
		};
		stats: {
			totalSubmissions: number;
			correctSubmissions: number;
			successRate: number;
			lastActivity: string;
			topLanguage: string;
			languageUsage: Record<string, number>;
		};
	}

	interface PageData {
		users: UserData[];
		stats: {
			totalUsers: number;
			activeUsers: number;
			adminUsers: number;
			inactiveUsers: number;
		};
	}

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedRole = $state('all');
	let sortBy = $state('created_at');

	// Filtered and sorted users
	let filteredUsers = $derived(() => {
		let filtered = data.users;

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(user => 
				user.name?.toLowerCase().includes(query) ||
				user.email?.toLowerCase().includes(query) ||
				user.profile?.username?.toLowerCase().includes(query)
			);
		}

		// Filter by role
		if (selectedRole !== 'all') {
			filtered = filtered.filter(user => user.role === selectedRole);
		}

		// Sort users
		filtered.sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return (a.name || '').localeCompare(b.name || '');
				case 'submissions':
					return b.stats.totalSubmissions - a.stats.totalSubmissions;
				case 'success_rate':
					return b.stats.successRate - a.stats.successRate;
				case 'last_activity':
					return new Date(b.stats.lastActivity).getTime() - new Date(a.stats.lastActivity).getTime();
				default:
					return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
			}
		});

		return filtered;
	});

	const updateUserRole = async (userId: string, newRole: string) => {
		try {
			const response = await fetch('/api/admin/users', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, role: newRole })
			});

			if (response.ok) {
				// Refresh the page to show updated data
				window.location.reload();
			} else {
				console.error('Failed to update user role');
			}
		} catch (error) {
			console.error('Error updating user role:', error);
		}
	};

	const formatLastActivity = (date: string) => {
		const now = new Date();
		const activity = new Date(date);
		const diffMs = now.getTime() - activity.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
		return `${Math.floor(diffDays / 365)} years ago`;
	};

	const getUserActivityStatus = (lastActivity: string) => {
		const daysSince = Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24));
		if (daysSince <= 1) return { status: 'online', color: 'bg-green-500' };
		if (daysSince <= 7) return { status: 'recent', color: 'bg-yellow-500' };
		if (daysSince <= 30) return { status: 'active', color: 'bg-blue-500' };
		return { status: 'inactive', color: 'bg-gray-500' };
	};
</script>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<div class="max-w-7xl mx-auto p-6">
		<!-- Header -->
		<div class="flex items-center justify-between mb-8">
			<div>
				<h1 class="text-3xl font-bold">User Management</h1>
				<p class="text-neutral-400 mt-2">Manage users, roles, and monitor platform activity</p>
			</div>
			<Button class="bg-emerald-600 hover:bg-emerald-700">
				<UserPlus class="w-4 h-4 mr-2" />
				Invite User
			</Button>
		</div>

		<!-- Statistics Cards -->
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-blue-600/20">
						<TrendingUp class="w-6 h-6 text-blue-400" />
					</div>
					<div class="ml-4">
						<p class="text-2xl font-bold text-white">{data.stats.totalUsers}</p>
						<p class="text-neutral-400 text-sm">Total Users</p>
					</div>
				</div>
			</div>

			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-green-600/20">
						<div class="w-6 h-6 bg-green-400 rounded-full"></div>
					</div>
					<div class="ml-4">
						<p class="text-2xl font-bold text-white">{data.stats.activeUsers}</p>
						<p class="text-neutral-400 text-sm">Active Users</p>
					</div>
				</div>
			</div>

			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-purple-600/20">
						<Crown class="w-6 h-6 text-purple-400" />
					</div>
					<div class="ml-4">
						<p class="text-2xl font-bold text-white">{data.stats.adminUsers}</p>
						<p class="text-neutral-400 text-sm">Admins</p>
					</div>
				</div>
			</div>

			<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
				<div class="flex items-center">
					<div class="p-3 rounded-full bg-gray-600/20">
						<Calendar class="w-6 h-6 text-gray-400" />
					</div>
					<div class="ml-4">
						<p class="text-2xl font-bold text-white">{data.stats.inactiveUsers}</p>
						<p class="text-neutral-400 text-sm">Inactive</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters and Search -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6">
			<div class="flex flex-col sm:flex-row gap-4 items-center">
				<div class="relative flex-1">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
					<Input
						bind:value={searchQuery}
						placeholder="Search users by name, email, or username..."
						class="pl-10 bg-neutral-800 border-neutral-700"
					/>
				</div>
				
				<select 
					bind:value={selectedRole}
					class="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100"
				>
					<option value="all">All Roles</option>
					<option value="user">Users</option>
					<option value="admin">Admins</option>
				</select>

				<select 
					bind:value={sortBy}
					class="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-neutral-100"
				>
					<option value="created_at">Newest First</option>
					<option value="name">Name</option>
					<option value="submissions">Most Submissions</option>
					<option value="success_rate">Success Rate</option>
					<option value="last_activity">Last Activity</option>
				</select>
			</div>
		</div>

		<!-- Users Table -->
		<div class="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-neutral-800 bg-neutral-800/50">
							<th class="text-left py-4 px-6 font-semibold text-neutral-300">User</th>
							<th class="text-left py-4 px-6 font-semibold text-neutral-300">Role</th>
							<th class="text-left py-4 px-6 font-semibold text-neutral-300">Activity</th>
							<th class="text-right py-4 px-6 font-semibold text-neutral-300">Statistics</th>
							<th class="text-center py-4 px-6 font-semibold text-neutral-300">Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredUsers() as user}
							{@const activityStatus = getUserActivityStatus(user.stats.lastActivity)}
							<tr class="border-b border-neutral-800 hover:bg-neutral-800/30 transition-colors">
								<td class="py-4 px-6">
									<div class="flex items-center">
										<div class="relative">
											<div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
												{(user.name || user.email || 'U').charAt(0).toUpperCase()}
											</div>
											<div class="absolute -bottom-1 -right-1 w-4 h-4 {activityStatus.color} border-2 border-neutral-900 rounded-full"></div>
										</div>
										<div class="ml-4">
											<p class="font-medium text-white">{user.name || 'Unknown'}</p>
											<p class="text-sm text-neutral-400">{user.email}</p>
											{#if user.profile?.username}
												<p class="text-xs text-neutral-500">@{user.profile.username}</p>
											{/if}
										</div>
									</div>
								</td>
								
								<td class="py-4 px-6">
									<Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
										{#if user.role === 'admin'}
											<Crown class="w-3 h-3 mr-1" />
										{/if}
										{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
									</Badge>
								</td>
								
								<td class="py-4 px-6">
									<div class="text-sm">
										<p class="text-neutral-300">{formatLastActivity(user.stats.lastActivity)}</p>
										<p class="text-neutral-500 flex items-center mt-1">
											<Code class="w-3 h-3 mr-1" />
											{user.stats.topLanguage}
										</p>
									</div>
								</td>
								
								<td class="py-4 px-6 text-right">
									<div class="space-y-1">
										<p class="text-sm text-neutral-300">
											{user.stats.totalSubmissions} submissions
										</p>
										<p class="text-sm text-neutral-300">
											{user.stats.successRate}% success rate
										</p>
										<p class="text-xs text-neutral-500">
											{user.stats.correctSubmissions || 0} challenges solved
										</p>
									</div>
								</td>
								
								<td class="py-4 px-6">
									<div class="flex items-center justify-center gap-2">
										{#if user.role === 'user'}
											<Button 
												size="sm" 
												variant="outline"
												onclick={() => updateUserRole(user.id, 'admin')}
											>
												Make Admin
											</Button>
										{:else}
											<Button 
												size="sm" 
												variant="outline"
												onclick={() => updateUserRole(user.id, 'user')}
											>
												Remove Admin
											</Button>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- Pagination Info -->
		<div class="mt-6 text-center text-neutral-400">
			Showing {filteredUsers.length} of {data.users.length} users
		</div>
	</div>
</div>