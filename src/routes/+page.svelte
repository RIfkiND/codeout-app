<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>CodeOut App - Online Code Editor</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="text-center">
			<h1 class="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
				<span class="block">Welcome to</span>
				<span class="block text-indigo-600">CodeOut App</span>
			</h1>
			<p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
				Your online code editor with real-time execution. Write, test, and share code instantly.
			</p>
			
			<div class="mt-10 flex justify-center">
				{#if data.session}
					<!-- User is authenticated -->
					<div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
						<a
							href="/dashboard"
							class="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
						>
							Go to Dashboard
						</a>
					</div>
				{:else}
					<!-- User is not authenticated -->
					<div class="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
						<a
							href="/auth/login"
							class="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
						>
							Sign in with Google
						</a>
						<a
							href="#features"
							class="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
						>
							Learn more
						</a>
					</div>
				{/if}
			</div>
		</div>

		<!-- Features section -->
		<div id="features" class="mt-20">
			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
				<div class="pt-6">
					<div class="flow-root bg-white rounded-lg px-6 pb-8">
						<div class="-mt-6">
							<div class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
								</svg>
							</div>
							<h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Code Editor</h3>
							<p class="mt-5 text-base text-gray-500">
								Write code with syntax highlighting and auto-completion features.
							</p>
						</div>
					</div>
				</div>

				<div class="pt-6">
					<div class="flow-root bg-white rounded-lg px-6 pb-8">
						<div class="-mt-6">
							<div class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Real-time Execution</h3>
							<p class="mt-5 text-base text-gray-500">
								Run your code instantly and see results in real-time.
							</p>
						</div>
					</div>
				</div>

				<div class="pt-6">
					<div class="flow-root bg-white rounded-lg px-6 pb-8">
						<div class="-mt-6">
							<div class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
								</svg>
							</div>
							<h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">Share & Collaborate</h3>
							<p class="mt-5 text-base text-gray-500">
								Share your code snippets and collaborate with others seamlessly.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
