<script lang="ts">
import { enhance } from '$app/forms';
import type { PageData, ActionData } from './$types';
import { Button } from '$lib/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
import { Input } from '$lib/components/ui/input';
import { Label } from '$lib/components/ui/label';
import { Alert, AlertDescription } from '$lib/components/ui/alert';
import { Shield, Mail, Lock, AlertTriangle } from 'lucide-svelte';

let { data, form }: { data: PageData; form: ActionData } = $props();

let isSubmitting = $state(false);
let email = $state(form?.email || '');
let password = $state('');
</script>

<svelte:head>
	<title>Admin Login - CodeOut App</title>
</svelte:head>

<div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
	<Card class="w-full max-w-md bg-neutral-900 border-neutral-800">
		<CardHeader class="text-center">
			<div class="flex justify-center mb-4">
				<div class="bg-red-500/20 p-3 rounded-full border border-red-500/30">
					<Shield class="h-8 w-8 text-red-400" />
				</div>
			</div>
			<CardTitle class="text-2xl font-bold text-neutral-100">Admin Access</CardTitle>
			<p class="text-sm text-neutral-400 mt-2">
				Sign in with your administrator account
			</p>
		</CardHeader>
		
		<CardContent class="space-y-6">
			{#if form?.error}
				<Alert variant="destructive" class="bg-red-500/10 border-red-500/30">
					<AlertTriangle class="h-4 w-4 text-red-400" />
					<AlertDescription class="text-red-400">
						{form.error}
					</AlertDescription>
				</Alert>
			{/if}
			
			<form 
				method="POST" 
				action="?/login"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						isSubmitting = false;
						update();
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="redirectTo" value={data.redirectTo} />
				
				<div class="space-y-2">
					<Label for="email" class="text-neutral-300">Email Address</Label>
					<div class="relative">
						<Mail class="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
						<Input
							id="email"
							name="email"
							type="email"
							bind:value={email}
							placeholder="admin@example.com"
							class="pl-10 bg-neutral-800 border-neutral-700 text-neutral-100 focus:border-red-500"
							required
							disabled={isSubmitting}
						/>
					</div>
				</div>
				
				<div class="space-y-2">
					<Label for="password" class="text-neutral-300">Password</Label>
					<div class="relative">
						<Lock class="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
						<Input
							id="password"
							name="password"
							type="password"
							bind:value={password}
							placeholder="Enter your password"
							class="pl-10 bg-neutral-800 border-neutral-700 text-neutral-100 focus:border-red-500"
							required
							disabled={isSubmitting}
						/>
					</div>
				</div>
				
				<Button
					type="submit"
					class="w-full bg-red-600 hover:bg-red-700 text-white"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Signing In...' : 'Sign In as Admin'}
				</Button>
			</form>
			
			<div class="text-center">
				<p class="text-sm text-neutral-400">
					Not an admin? 
					<a 
						href="/auth/login" 
						class="text-blue-400 hover:text-blue-300 underline"
					>
						Regular login
					</a>
				</p>
			</div>
			
			<div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
				<div class="flex items-start space-x-2">
					<AlertTriangle class="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
					<div class="text-sm text-amber-300">
						<p class="font-medium mb-1">Admin Access Only</p>
						<p class="text-xs text-amber-400">
							This login is restricted to administrator accounts. 
							Regular users should use the standard login page.
						</p>
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
</div>