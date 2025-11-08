<script lang="ts">
	import { AlertTriangle, Code2 } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent } from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Authentication Error - CodeOut</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-emerald-900/20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full">
		<!-- Header -->
		<div class="text-center mb-8">
			<a href="/" class="inline-flex items-center gap-2 font-medium text-white hover:text-emerald-400 transition-colors">
				<div class="bg-emerald-600 text-white flex size-8 items-center justify-center rounded-md">
					<Code2 class="size-5" />
				</div>
				<span class="text-xl font-bold">CodeOut</span>
			</a>
		</div>

		<Card class="border-neutral-700 bg-neutral-800/50 backdrop-blur-sm">
			<CardContent class="p-8">
				<div class="text-center">
					<div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 mb-6">
						<AlertTriangle class="h-8 w-8 text-red-400" />
					</div>
					<h2 class="text-2xl font-bold text-white mb-4">
						Authentication Error
					</h2>
					<p class="text-neutral-300 mb-6">
						Sorry, we couldn't sign you in. This could be due to:
					</p>
					<div class="text-left bg-neutral-900/50 rounded-lg p-4 mb-8">
						<ul class="text-sm text-neutral-400 space-y-2">
							<li class="flex items-start">
								<span class="text-red-400 mr-2">•</span>
								The authentication link has expired
							</li>
							<li class="flex items-start">
								<span class="text-red-400 mr-2">•</span>
								There was an error with the OAuth process
							</li>
							<li class="flex items-start">
								<span class="text-red-400 mr-2">•</span>
								Network connectivity issues
							</li>
						</ul>
					</div>
				</div>
				
				<div class="space-y-4">
					<Button
						href="/auth/login"
						class="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
					>
						Try Again
					</Button>
					
					<Button
						href="/"
						variant="outline"
						class="w-full border-neutral-600 text-neutral-300 hover:bg-neutral-700/50"
					>
						Go Home
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</div>