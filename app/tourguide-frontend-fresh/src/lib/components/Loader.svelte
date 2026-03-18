<script lang="ts">
  export let size: string = '2rem';
  export let color: string = '#d4a017';
</script>
<div class="loader" style="width: {size}; height: {size}; border-color: {color}; border-top-color: transparent;"></div>
<style>
.loader {
  border: 4px solid #d4a017;
  border-top: 4px solid transparent;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
  margin: 1rem auto;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
