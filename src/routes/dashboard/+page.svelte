<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard - CodeOut App</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between h-16">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<h1 class="text-xl font-bold text-gray-900">CodeOut App</h1>
					</div>
				</div>
				
				<div class="flex items-center space-x-4">
					<div class="flex items-center space-x-3">
						{#if data.user?.user_metadata?.avatar_url}
							<img 
								class="h-8 w-8 rounded-full" 
								src={data.user.user_metadata.avatar_url} 
								alt={data.user.user_metadata.full_name || 'User avatar'}
							/>
						{/if}
						<span class="text-sm font-medium text-gray-700">
							{data.user?.user_metadata?.full_name || data.user?.email}
						</span>
					</div>
					
					<form method="POST" action="/api/auth/logout">
						<button
							type="submit"
							class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
						>
							Sign out
						</button>
					</form>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main content -->
	<main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<div class="border-4 border-dashed border-gray-200 rounded-lg">
				<div class="p-8 text-center">
					<h1 class="text-3xl font-bold text-gray-900 mb-4">
						Welcome to your Dashboard!
					</h1>
					
					<p class="text-lg text-gray-600 mb-6">
						🎉 You have successfully authenticated with Google OAuth!
					</p>

					<div class="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto">
						<div class="px-4 py-5 sm:px-6">
							<h3 class="text-lg leading-6 font-medium text-gray-900">
								User Information
							</h3>
							<p class="mt-1 max-w-2xl text-sm text-gray-500">
								Your authenticated user details from Google.
							</p>
						</div>
						<div class="border-t border-gray-200">
							<dl>
								<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt class="text-sm font-medium text-gray-500">
										Full name
									</dt>
									<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{data.user?.user_metadata?.full_name || 'Not provided'}
									</dd>
								</div>
								<div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt class="text-sm font-medium text-gray-500">
										Email address
									</dt>
									<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{data.user?.email || 'Not provided'}
									</dd>
								</div>
								<div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt class="text-sm font-medium text-gray-500">
										Provider
									</dt>
									<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										Google OAuth
									</dd>
								</div>
								<div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt class="text-sm font-medium text-gray-500">
										Last sign in
									</dt>
									<dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{new Date(data.user?.last_sign_in_at || '').toLocaleString()}
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>