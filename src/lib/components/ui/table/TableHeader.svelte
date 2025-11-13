<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div class={`bg-transparent ${className}`} role="rowgroup">
  <slot />
</div>
