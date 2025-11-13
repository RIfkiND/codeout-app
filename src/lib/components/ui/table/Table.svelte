<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div class={`w-full overflow-hidden rounded-md border ${className}`}>
  <slot />
</div><!-- Simple table wrapper used across admin lists. For layout and styling we rely on parent markup/classes. -->
