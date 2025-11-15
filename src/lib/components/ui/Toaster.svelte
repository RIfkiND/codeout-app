<script lang="ts">
	import { onMount } from 'svelte';
	import { toasts, removeToast, type Toast } from '$lib/stores/toast';
	import { CheckCircle2, X, AlertTriangle, Info, XCircle } from 'lucide-svelte';
	
	let toastList: Toast[] = $state([]);
	
	onMount(() => {
		const unsubscribe = toasts.subscribe(value => {
			toastList = value;
		});
		return unsubscribe;
	});

	function getIcon(type: Toast['type']) {
		switch (type) {
			case 'success': return CheckCircle2;
			case 'error': return XCircle;
			case 'warning': return AlertTriangle;
			case 'info': return Info;
			default: return Info;
		}
	}

	function getTypeClasses(type: Toast['type']) {
		switch (type) {
			case 'success':
				return 'bg-green-950/90 border-green-700 text-green-100';
			case 'error':
				return 'bg-red-950/90 border-red-700 text-red-100';
			case 'warning':
				return 'bg-yellow-950/90 border-yellow-700 text-yellow-100';
			case 'info':
				return 'bg-blue-950/90 border-blue-700 text-blue-100';
			default:
				return 'bg-neutral-950/90 border-neutral-700 text-neutral-100';
		}
	}

	function getIconClasses(type: Toast['type']) {
		switch (type) {
			case 'success': return 'text-green-400';
			case 'error': return 'text-red-400';
			case 'warning': return 'text-yellow-400';
			case 'info': return 'text-blue-400';
			default: return 'text-neutral-400';
		}
	}
</script>

<div class="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
	{#each toastList as toast (toast.id)}
		{@const IconComponent = getIcon(toast.type)}
		<div
			class="flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg animate-in slide-in-from-top-2 {getTypeClasses(toast.type)}"
			role="alert"
		>
			<div class="flex-shrink-0 mt-0.5">
				<IconComponent class="h-5 w-5 {getIconClasses(toast.type)}" />
			</div>
			
			<div class="flex-1 min-w-0">
				<div class="font-medium">{toast.title}</div>
				{#if toast.description}
					<div class="text-sm opacity-90 mt-1">{toast.description}</div>
				{/if}
			</div>
			
			<button
				type="button"
				class="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
				onclick={() => removeToast(toast.id)}
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>

<style>
	@keyframes slide-in-from-top-2 {
		from {
			transform: translateY(-8px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.animate-in {
		animation: slide-in-from-top-2 0.2s ease-out;
	}
</style>