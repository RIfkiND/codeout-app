<script lang="ts">
	import { onMount } from 'svelte';
	import createGlobe from 'cobe';
	import { spring } from 'svelte/motion';
	import { cn } from '$lib/utils';

	let x = spring(0, {
		stiffness: 0.04,
		damping: 0.4,
		precision: 0.005
	});

	let className = '';
	export { className as class };
	let pointerInteracting: any = null;
	let pointerInteractionMovement = 0;
	let canvas: HTMLCanvasElement;

	let phi = 0;
	let width = 0;
  $: console.log(width, "X");
	let onResize = () => {
		width = canvas.offsetWidth;
	};

	let onRender = (state: any) => {
		if (!pointerInteracting) {
			phi += 0.005;
		}
		state.phi = phi + $x;
		state.width = width * 2;
		state.height = width * 2;
	};

	onMount(() => {
		// Adds the resize event listener when the component is mounted
		window.addEventListener('resize', onResize);
		onResize();

		// Initializes the globe with specific options
		const globe = createGlobe(canvas, {
			devicePixelRatio: 2,
			width: width,
			height: width,
			phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 0.4, // 1.2
      mapSamples: 16000,
      mapBrightness: 1.2, // 6
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1.0],
      glowColor: [1, 1, 1],
			markers: [
				// Asia
				{ location: [35.6762, 139.6503], size: 0.05 }, // Tokyo, Japan
				{ location: [39.9042, 116.4074], size: 0.06 }, // Beijing, China
				{ location: [28.6139, 77.209], size: 0.04 }, // New Delhi, India
				{ location: [1.3521, 103.8198], size: 0.04 }, // Singapore
				{ location: [37.5665, 126.978], size: 0.04 }, // Seoul, South Korea
				
				// Europe
				{ location: [51.5074, -0.1278], size: 0.05 }, // London, UK
				{ location: [48.8566, 2.3522], size: 0.05 }, // Paris, France
				{ location: [52.52, 13.405], size: 0.04 }, // Berlin, Germany
				{ location: [41.9028, 12.4964], size: 0.04 }, // Rome, Italy
				{ location: [55.7558, 37.6176], size: 0.04 }, // Moscow, Russia
				
				// North America
				{ location: [40.7128, -74.006], size: 0.07 }, // New York, USA
				{ location: [34.0522, -118.2437], size: 0.05 }, // Los Angeles, USA
				{ location: [43.6532, -79.3832], size: 0.04 }, // Toronto, Canada
				{ location: [19.4326, -99.1332], size: 0.04 }, // Mexico City, Mexico
				
				// South America
				{ location: [-23.5505, -46.6333], size: 0.05 }, // São Paulo, Brazil
				{ location: [-34.6118, -58.3960], size: 0.04 }, // Buenos Aires, Argentina
				
				// Africa
				{ location: [30.0444, 31.2357], size: 0.04 }, // Cairo, Egypt
				{ location: [-26.2041, 28.0473], size: 0.04 }, // Johannesburg, South Africa
				
				// Oceania
				{ location: [-33.8688, 151.2093], size: 0.04 }, // Sydney, Australia
			],
       // onRender: (state) => {
      //   if (!pointerInteracting) {
      //     // Called on every animation frame.
      //     // `state` will be an empty object, return updated params.
      //     phi += 0.009;
      //   }
      //   state.phi = phi + $x;

      //   // phi += 0.01;
      // },
			onRender: onRender
		});

		// Removes the resize event listener when the component is unmounted to prevent memory leaks
		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<main
  class={cn(
    "w-full h-full flex items-center justify-center",
    className
  )}
>
  <div class="w-full max-w-[600px] aspect-square">
    <canvas
      class="w-full h-full [contain:layout_paint_size]"
      bind:this={canvas}
      on:pointerdown={(e) => {
        pointerInteracting = e.clientX - pointerInteractionMovement;
        canvas.style.cursor = "grabbing";
      }}
      on:pointerup={() => {
        pointerInteracting = null;
        canvas.style.cursor = "grab";
      }}
      on:pointerout={() => {
        pointerInteracting = null;
        canvas.style.cursor = "grab";
      }}
      on:mousemove={(e) => {
        if (pointerInteracting !== null) {
          console.log("working");
          const delta = e.clientX - pointerInteracting;
          pointerInteractionMovement = delta;
          x.set(delta / 200);
        }
      }}
    ></canvas>
  </div>
</main>