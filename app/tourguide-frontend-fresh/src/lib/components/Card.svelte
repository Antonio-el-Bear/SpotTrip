<script lang="ts">
  export let className = '';
</script>
<div class={`card ${className}`}>
  <slot />
</div>
<style>
.card {
  background: #232946;
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.08);
  padding: 2rem;
  margin-bottom: 1.5rem;
  border: 1px solid #d4a017;
}
</style>
