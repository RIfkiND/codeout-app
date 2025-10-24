// API client utilities for CodeOut application
import { browser } from '$app/environment';

export interface CodeExecutionRequest {
	language: string;
	version?: string;
	code: string;
	input?: string;
}

export interface CodeExecutionResponse {
	success: boolean;
	output?: string;
	stderr?: string;
	stdout?: string;
	code?: number;
	language?: string;
	version?: string;
	error?: string;
}

export interface Language {
	name: string;
	version: string;
	aliases: string[];
	runtime: string;
}

export interface UserProfile {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	provider: string;
	created_at: string;
	last_sign_in?: string;
	email_verified: boolean;
}

class ApiClient {
	private baseUrl = '/api';

	private async fetchApi<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<{ data?: T; error?: string }> {
		if (!browser) {
			throw new Error('API client can only be used in browser environment');
		}

		try {
			const response = await fetch(`${this.baseUrl}${endpoint}`, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers
				},
				...options
			});

			const data = await response.json();

			if (!response.ok) {
				return { error: data.error || 'Request failed' };
			}

			return { data };
		} catch (error) {
			return {
				error: error instanceof Error ? error.message : 'Network error'
			};
		}
	}

	// Authentication methods
	async loginWithProvider(provider: 'google' | 'github' | 'discord') {
		return this.fetchApi('/auth/login', {
			method: 'POST',
			body: JSON.stringify({ provider })
		});
	}

	async logout() {
		return this.fetchApi('/api/auth/logout', { method: 'POST' });
	}

	async getCurrentUser() {
		return this.fetchApi<{ authenticated: boolean; user: UserProfile }>('/auth/user');
	}

	// Code execution methods
	async executeCode(request: CodeExecutionRequest) {
		return this.fetchApi<CodeExecutionResponse>('/code/execute', {
			method: 'POST',
			body: JSON.stringify(request)
		});
	}

	async getAvailableLanguages() {
		return this.fetchApi<{ languages: Language[] }>('/code/languages');
	}

	// User profile methods
	async getUserProfile() {
		return this.fetchApi<{ profile: UserProfile }>('/user/profile');
	}

	async updateUserProfile(name: string) {
		return this.fetchApi('/user/profile', {
			method: 'PUT',
			body: JSON.stringify({ name })
		});
	}

	// System methods
	async healthCheck() {
		return this.fetchApi<{
			status: string;
			timestamp: string;
			authenticated: boolean;
			environment: string;
		}>('/health');
	}
}

export const api = new ApiClient();