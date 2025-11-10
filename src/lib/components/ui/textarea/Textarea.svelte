<script lang="ts">
  let className: string = '';
  export { className as class };
  export let value: string = '';
  export let placeholder: string = '';
  export let name: string = '';
  export let rows: number = 3;
  export let required: boolean = false;
</script>

<textarea
  {name}
  bind:value
  {placeholder}
  {rows}
  {required}
  class="flex min-h-[80px] w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm ring-offset-neutral-950 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {className}"
  {...$$restProps}
></textarea>
