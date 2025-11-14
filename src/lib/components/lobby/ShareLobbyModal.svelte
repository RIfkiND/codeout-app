<script lang="ts">
	import { Copy, Share2, Link, QrCode } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Dialog from '$lib/components/ui/dialog/dialog.svelte';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { showSuccess, showError } from '$lib/stores/toast';

	interface Props {
		lobby: {
			id: string;
			name: string;
			lobby_code?: string;
		};
		isOpen?: boolean;
		onClose?: () => void;
	}

	let { lobby, isOpen = false, onClose }: Props = $props();

	let shareUrl = $state('');

	$effect(() => {
		if (typeof window !== 'undefined' && lobby.lobby_code) {
			shareUrl = `${window.location.origin}/lobbies/join?code=${lobby.lobby_code}`;
		}
	});

	async function copyToClipboard(text: string, label: string) {
		try {
			await navigator.clipboard.writeText(text);
			showSuccess('Copied!', `${label} copied to clipboard`);
		} catch (error) {
			console.error('Copy failed:', error);
			showError('Copy Failed', 'Unable to copy to clipboard');
		}
	}

	async function shareNative() {
		if (!lobby.lobby_code) return;

		if (navigator.share) {
			try {
				await navigator.share({
					title: `Join "${lobby.name}" on CodeOut`,
					text: `Join my coding lobby with code: ${lobby.lobby_code}`,
					url: shareUrl
				});
			} catch (error) {
				console.error('Native share failed:', error);
				// Fallback to copy
				copyToClipboard(shareUrl, 'Share link');
			}
		} else {
			// Fallback to copy
			copyToClipboard(shareUrl, 'Share link');
		}
	}
</script>

<Dialog bind:open={isOpen}>
	<DialogContent class="bg-neutral-900 border-neutral-800 text-white max-w-md">
		<DialogHeader>
			<DialogTitle class="flex items-center gap-2">
				<Share2 class="h-5 w-5 text-emerald-400" />
				Share Lobby
			</DialogTitle>
		</DialogHeader>

		<div class="space-y-6 py-4">
			<!-- Lobby Info -->
			<div class="text-center">
				<h3 class="font-semibold text-lg">{lobby.name}</h3>
				<p class="text-sm text-neutral-400">Share this lobby with friends</p>
			</div>

			{#if lobby.lobby_code}
				<!-- Share Code -->
				<div class="space-y-4">
					<div>
						<label class="block text-sm font-medium mb-2">Lobby Code</label>
						<div class="flex items-center gap-2">
							<Input
								value={lobby.lobby_code}
								readonly
								class="text-center text-xl font-mono tracking-widest bg-neutral-800 border-neutral-700 cursor-text"
							/>
							<Button
								size="sm"
								variant="outline"
								onclick={() => copyToClipboard(lobby.lobby_code!, 'Lobby code')}
								class="border-neutral-700 hover:bg-neutral-800 cursor-pointer"
							>
								<Copy class="h-4 w-4" />
							</Button>
						</div>
						<p class="text-xs text-neutral-500 mt-1">
							Friends can enter this code at codeout.app/lobbies/join
						</p>
					</div>

					<!-- Share URL -->
					<div>
						<label class="block text-sm font-medium mb-2">Direct Link</label>
						<div class="flex items-center gap-2">
							<Input
								value={shareUrl}
								readonly
								class="text-sm bg-neutral-800 border-neutral-700 cursor-text"
							/>
							<Button
								size="sm"
								variant="outline"
								onclick={() => copyToClipboard(shareUrl, 'Share link')}
								class="border-neutral-700 hover:bg-neutral-800 cursor-pointer"
							>
								<Copy class="h-4 w-4" />
							</Button>
						</div>
					</div>

					<!-- Share Actions -->
					<div class="flex gap-2">
						<Button
							onclick={shareNative}
							class="flex-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
						>
							<Share2 class="h-4 w-4 mr-2" />
							Share
						</Button>
						<Button
							variant="outline"
							onclick={() => copyToClipboard(shareUrl, 'Share link')}
							class="border-neutral-700 hover:bg-neutral-800 cursor-pointer"
						>
							<Link class="h-4 w-4" />
						</Button>
					</div>

					<!-- Instructions -->
					<div class="bg-neutral-800/50 rounded-lg p-3 text-sm">
						<p class="font-medium mb-1">How to join:</p>
						<ol class="text-neutral-400 space-y-1">
							<li>1. Go to <span class="font-mono text-emerald-400">codeout.app/lobbies/join</span></li>
							<li>2. Enter code: <span class="font-mono text-white">{lobby.lobby_code}</span></li>
							<li>3. Click "Join Lobby"</li>
						</ol>
					</div>
				</div>
			{:else}
				<div class="text-center py-4">
					<p class="text-neutral-400 mb-4">No share code available for this lobby</p>
				</div>
			{/if}
		</div>

		<!-- Close Button -->
		<div class="flex justify-end">
			<Button
				variant="outline"
				onclick={onClose}
				class="border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
			>
				Close
			</Button>
		</div>
	</DialogContent>
</Dialog>