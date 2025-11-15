<script lang="ts">
import { Settings, X, Users, Clock, Lock, Unlock, Trash2, Copy, Share2, Edit3 } from 'lucide-svelte';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Button } from '$lib/components/ui/button';
import { Input } from '$lib/components/ui/input';
import { Textarea } from '$lib/components/ui/textarea';
import { Label } from '$lib/components/ui/label';
import { showSuccess, showError } from '$lib/stores/toast';

interface Props {
	isOpen?: boolean;
	lobby: any;
	onClose?: () => void;
	onUpdate?: (lobbyData: any) => void;
	onDelete?: () => void;
	onStart?: () => void;
}

let { isOpen = false, lobby, onClose, onUpdate, onDelete, onStart }: Props = $props();

let isUpdating = $state(false);
let isDeleting = $state(false);
let editMode = $state(false);

let formData = $state({
	name: '',
	description: '',
	maxParticipants: 10,
	timeLimit: 60,
	isPrivate: false
});

// Update form data when lobby changes
$effect(() => {
	if (lobby) {
		formData = {
			name: lobby.name || '',
			description: lobby.description || '',
			maxParticipants: lobby.max_participants || 10,
			timeLimit: lobby.time_limit_minutes || 60,
			isPrivate: lobby.is_private || false
		};
	}
});

const handleUpdate = async (event: Event) => {
	event.preventDefault();
	
	if (!formData.name.trim()) {
		showError('Validation Error', 'Lobby name is required');
		return;
	}

	if (formData.maxParticipants < 2 || formData.maxParticipants > 50) {
		showError('Validation Error', 'Max participants must be between 2 and 50');
		return;
	}

	if (formData.timeLimit < 15 || formData.timeLimit > 300) {
		showError('Validation Error', 'Time limit must be between 15 and 300 minutes');
		return;
	}

	isUpdating = true;
	try {
		const updateData = {
			name: formData.name.trim(),
			description: formData.description?.trim() || null,
			max_participants: formData.maxParticipants,
			time_limit_minutes: formData.timeLimit,
			is_private: formData.isPrivate
		};

		await onUpdate?.(updateData);
		editMode = false;
		showSuccess('Lobby Updated', 'Lobby settings have been updated successfully');
	} catch (error) {
		console.error('Error updating lobby:', error);
		showError('Update Failed', 'Failed to update lobby settings');
	} finally {
		isUpdating = false;
	}
};

const handleDelete = async () => {
	if (!confirm('Are you sure you want to delete this lobby? This action cannot be undone.')) {
		return;
	}

	isDeleting = true;
	try {
		await onDelete?.();
		showSuccess('Lobby Deleted', 'Lobby has been deleted successfully');
		onClose?.();
	} catch (error) {
		console.error('Error deleting lobby:', error);
		showError('Delete Failed', 'Failed to delete lobby');
	} finally {
		isDeleting = false;
	}
};

const copyLobbyLink = async () => {
	try {
		await navigator.clipboard.writeText(window.location.href);
		showSuccess('Link Copied', 'Lobby link has been copied to clipboard');
	} catch (error) {
		showError('Copy Failed', 'Failed to copy lobby link');
	}
};

const copyLobbyCode = async () => {
	try {
		if (lobby.lobby_code) {
			await navigator.clipboard.writeText(lobby.lobby_code);
			showSuccess('Code Copied', 'Lobby code has been copied to clipboard');
		}
	} catch (error) {
		showError('Copy Failed', 'Failed to copy lobby code');
	}
};

const handleClose = () => {
	editMode = false;
	onClose?.();
};

const canStart = () => {
	return lobby.status === 'waiting' && lobby.lobby_users && lobby.lobby_users.length > 0;
};
</script>

{#if isOpen}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
		<Card class="w-full max-w-2xl bg-neutral-900 border-neutral-800 max-h-[90vh] overflow-hidden">
			<CardHeader class="flex flex-row items-center justify-between">
				<div>
					<CardTitle class="text-neutral-100 flex items-center gap-2">
						<Settings class="w-5 h-5 text-emerald-400" />
						Lobby Settings
					</CardTitle>
					<CardDescription class="text-neutral-400">
						Manage your lobby configuration and settings
					</CardDescription>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onclick={handleClose}
					class="text-neutral-400 hover:text-neutral-100"
				>
					<X class="w-4 h-4" />
				</Button>
			</CardHeader>
			
			<CardContent class="overflow-y-auto space-y-6">
				<!-- Quick Actions -->
				<div class="grid grid-cols-2 gap-3">
					{#if canStart()}
						<Button
							onclick={onStart}
							class="bg-emerald-600 hover:bg-emerald-700 justify-start"
						>
							<Settings class="w-4 h-4 mr-2" />
							Start Lobby
						</Button>
					{/if}
					
					<Button
						variant="outline"
						onclick={copyLobbyLink}
						class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 justify-start"
					>
						<Copy class="w-4 h-4 mr-2" />
						Copy Link
					</Button>
					
					{#if lobby.lobby_code}
						<Button
							variant="outline"
							onclick={copyLobbyCode}
							class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 justify-start"
						>
							<Share2 class="w-4 h-4 mr-2" />
							Copy Code
						</Button>
					{/if}
					
					<Button
						variant="outline"
						onclick={() => editMode = !editMode}
						class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 justify-start"
					>
						<Edit3 class="w-4 h-4 mr-2" />
						{editMode ? 'Cancel Edit' : 'Edit Settings'}
					</Button>
				</div>

				{#if editMode}
					<!-- Edit Form -->
					<form onsubmit={handleUpdate} class="space-y-4">
						<div class="space-y-2">
							<Label for="lobbyName" class="text-neutral-200">Lobby Name *</Label>
							<Input
								id="lobbyName"
								bind:value={formData.name}
								placeholder="Enter lobby name"
								class="bg-neutral-800 border-neutral-600 text-neutral-100"
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="lobbyDescription" class="text-neutral-200">Description</Label>
							<Textarea
								id="lobbyDescription"
								bind:value={formData.description}
								placeholder="Describe your lobby"
								rows={3}
								class="bg-neutral-800 border-neutral-600 text-neutral-100"
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="maxParticipants" class="text-neutral-200">Max Participants</Label>
								<Input
									id="maxParticipants"
									type="number"
									bind:value={formData.maxParticipants}
									min="2"
									max="50"
									class="bg-neutral-800 border-neutral-600 text-neutral-100"
								/>
							</div>

							<div class="space-y-2">
								<Label for="timeLimit" class="text-neutral-200">Time Limit (minutes)</Label>
								<Input
									id="timeLimit"
									type="number"
									bind:value={formData.timeLimit}
									min="15"
									max="300"
									class="bg-neutral-800 border-neutral-600 text-neutral-100"
								/>
							</div>
						</div>

						<div class="flex items-center space-x-2">
							<input
								type="checkbox"
								id="isPrivate"
								bind:checked={formData.isPrivate}
								class="rounded bg-neutral-800 border-neutral-600"
							/>
							<Label for="isPrivate" class="text-neutral-200 flex items-center gap-2">
								{#if formData.isPrivate}
									<Lock class="w-4 h-4" />
								{:else}
									<Unlock class="w-4 h-4" />
								{/if}
								Make this lobby private
							</Label>
						</div>

						<div class="flex gap-3 pt-4 border-t border-neutral-700">
							<Button
								type="button"
								variant="outline"
								onclick={() => editMode = false}
								class="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isUpdating}
								class="bg-emerald-600 hover:bg-emerald-700"
							>
								{isUpdating ? 'Updating...' : 'Update Lobby'}
							</Button>
						</div>
					</form>
				{:else}
					<!-- View Mode -->
					<div class="space-y-4">
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-1">
								<Label class="text-neutral-400 text-sm">Status</Label>
								<div class="text-neutral-100 font-medium capitalize">{lobby.status}</div>
							</div>
							
							<div class="space-y-1">
								<Label class="text-neutral-400 text-sm">Participants</Label>
								<div class="text-neutral-100 font-medium">
									{lobby.lobby_users?.length || 0}/{lobby.max_participants}
								</div>
							</div>
							
							<div class="space-y-1">
								<Label class="text-neutral-400 text-sm">Time Limit</Label>
								<div class="text-neutral-100 font-medium">{lobby.time_limit_minutes} minutes</div>
							</div>
							
							<div class="space-y-1">
								<Label class="text-neutral-400 text-sm">Privacy</Label>
								<div class="text-neutral-100 font-medium flex items-center gap-2">
									{#if lobby.is_private}
										<Lock class="w-4 h-4" />
										Private
									{:else}
										<Unlock class="w-4 h-4" />
										Public
									{/if}
								</div>
							</div>
						</div>

						{#if lobby.lobby_code}
							<div class="space-y-1">
								<Label class="text-neutral-400 text-sm">Lobby Code</Label>
								<div class="text-neutral-100 font-mono text-lg bg-neutral-800 p-2 rounded border">
									{lobby.lobby_code}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Danger Zone -->
				{#if lobby.status === 'waiting'}
					<div class="pt-6 border-t border-neutral-700">
						<div class="bg-red-950/20 border border-red-800/30 rounded-lg p-4">
							<h4 class="text-red-400 font-medium flex items-center gap-2 mb-2">
								<Trash2 class="w-4 h-4" />
								Danger Zone
							</h4>
							<p class="text-neutral-400 text-sm mb-4">
								Permanently delete this lobby. This action cannot be undone.
							</p>
							<Button
								variant="outline"
								onclick={handleDelete}
								disabled={isDeleting}
								class="border-red-800 text-red-400 hover:bg-red-950/50 hover:text-red-300"
							>
								<Trash2 class="w-4 h-4 mr-2" />
								{isDeleting ? 'Deleting...' : 'Delete Lobby'}
							</Button>
						</div>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
{/if}