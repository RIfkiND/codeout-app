<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div class={`text-sm font-medium uppercase tracking-wider px-3 py-2 ${className}`} role="columnheader">
  <slot />
</div>
