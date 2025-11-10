<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div class={`${className}`} role="rowgroup">
  <slot />
</div>
