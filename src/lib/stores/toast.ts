import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	description?: string;
	duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast(toast: Omit<Toast, 'id'>) {
	const id = Math.random().toString(36).slice(2);
	const newToast: Toast = {
		id,
		duration: 5000,
		...toast
	};

	toasts.update((current) => [...current, newToast]);

	// Auto-remove toast after duration
	setTimeout(() => {
		removeToast(id);
	}, newToast.duration);

	return id;
}

export function removeToast(id: string) {
	toasts.update((current) => current.filter((toast) => toast.id !== id));
}

// Convenience functions
export function showSuccess(title: string, description?: string) {
	return addToast({ type: 'success', title, description });
}

export function showError(title: string, description?: string) {
	return addToast({ type: 'error', title, description, duration: 7000 });
}

export function showWarning(title: string, description?: string) {
	return addToast({ type: 'warning', title, description });
}

export function showInfo(title: string, description?: string) {
	return addToast({ type: 'info', title, description });
}