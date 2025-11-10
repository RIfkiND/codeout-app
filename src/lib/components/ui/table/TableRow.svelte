<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div class={`flex items-center w-full py-2 ${className}`} role="row">
  <slot />
</div>
