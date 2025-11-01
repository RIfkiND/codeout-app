<script lang="ts">
	import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
	import LoginForm from "$lib/components/Login/login-form.svelte";
	import Globe from "$lib/components/Login/Globe.svelte";
</script>

<div class="grid min-h-svh lg:grid-cols-2 bg-black">
	<div class="flex flex-col gap-4 p-6 md:p-10 bg-black">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href="/" class="flex items-center gap-2 font-medium text-white">
				<div class="bg-purple-600 text-white flex size-6 items-center justify-center rounded-md">
					<GalleryVerticalEndIcon class="size-4" />
				</div>
				CodeOut App
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				<LoginForm />
			</div>
		</div>
	</div>
	<div class="bg-gray-900 relative hidden lg:flex items-center justify-center min-h-full border-l border-gray-700">
		<div class="flex items-center justify-center w-full h-full">
			<Globe />
		</div>
	</div>
</div>
