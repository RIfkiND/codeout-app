<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div class={`px-3 py-2 text-sm ${className}`} role="cell">
  <slot />
</div>
