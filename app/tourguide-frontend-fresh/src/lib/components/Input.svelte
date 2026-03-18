<script lang="ts">
  export let type: string = 'text';
  export let value: string = '';
  export let placeholder: string = '';
  export let className = '';
  export let disabled = false;
  export let name = '';
  export let bindValue: any = undefined;
</script>
<input
  {type}
  {placeholder}
  {disabled}
  {name}
  class={`input ${className}`}
  bind:value={bindValue}
/>
<style>
.input {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d4a017;
  background: #181e2b;
  color: #f0f2f5;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}
.input:focus {
  outline: 2px solid #d4a017;
}
.input[disabled] {
  opacity: 0.6;
}
</style>
