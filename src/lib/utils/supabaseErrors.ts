import { showError } from '$lib/stores/toast';

interface SupabaseError {
	code?: string;
	message?: string;
	details?: string;
	hint?: string;
}

export function handleSupabaseError(error: SupabaseError, context: string = 'Operation') {
	console.error(`${context} failed:`, error);
	
	// Handle specific Supabase error codes
	switch (error.code) {
		case 'PGRST204':
			showError(
				'Database Schema Error',
				'A required database column was not found. Please contact support.'
			);
			break;
		case 'PGRST116':
			showError(
				'Authentication Error',
				'Your session has expired. Please log in again.'
			);
			break;
		case 'PGRST301':
			showError(
				'Permission Denied',
				'You do not have permission to perform this action.'
			);
			break;
		case '23505':
			showError(
				'Duplicate Entry',
				'This entry already exists. Please try with different values.'
			);
			break;
		case '23503':
			showError(
				'Invalid Reference',
				'Referenced item does not exist or has been deleted.'
			);
			break;
		case 'AUTH_ERROR':
			showError(
				'Authentication Required',
				'Please log in to continue.'
			);
			break;
		default: {
			// Generic error handling
			const title = `${context} Failed`;
			const description = error.message || 'An unexpected error occurred. Please try again.';
			showError(title, description);
			break;
		}
	}
}

export function handleApiError(response: Response, context: string = 'Request') {
	const title = `${context} Failed`;
	let description = 'An unexpected error occurred. Please try again.';
	
	switch (response.status) {
		case 401:
			description = 'Authentication required. Please log in.';
			break;
		case 403:
			description = 'You do not have permission to perform this action.';
			break;
		case 404:
			description = 'The requested resource was not found.';
			break;
		case 409:
			description = 'A conflict occurred. The resource may already exist.';
			break;
		case 422:
			description = 'Invalid data provided. Please check your input.';
			break;
		case 429:
			description = 'Too many requests. Please wait a moment and try again.';
			break;
		case 500:
		case 502:
		case 503:
		case 504:
			description = 'Server error. Please try again later.';
			break;
	}
	
	showError(title, description);
}