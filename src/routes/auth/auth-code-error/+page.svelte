<svelte:head>
	<title>Authentication Error - CodeOut App</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div class="text-center">
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
				<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
				</svg>
			</div>
			<h2 class="mt-6 text-3xl font-extrabold text-gray-900">
				Authentication Error
			</h2>
			<p class="mt-2 text-sm text-gray-600">
				Sorry, we couldn't sign you in. This could be due to:
			</p>
			<ul class="mt-4 text-sm text-gray-600 text-left space-y-1">
				<li>• The authentication link has expired</li>
				<li>• There was an error with the Google OAuth process</li>
				<li>• Network connectivity issues</li>
			</ul>
		</div>
		
		<div class="mt-8 space-y-4">
			<a
				href="/auth/login"
				class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				Try Again
			</a>
			
			<a
				href="/"
				class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				Go Home
			</a>
		</div>
	</div>
</div>