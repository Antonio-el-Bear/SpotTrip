<script lang="ts">
  export let className = '';
</script>
<section class={`section ${className}`}>
  <slot />
</section>
<style>
.section {
  margin: 2rem 0;
  padding: 0 1rem;
  max-width: 900px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
</style>
