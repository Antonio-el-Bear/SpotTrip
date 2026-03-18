<script lang="ts">
  export let value: string = '';
  export let placeholder: string = '';
  export let className = '';
  export let rows: number = 3;
  export let disabled = false;
  export let name = '';
  export let bindValue: any = undefined;
</script>
<textarea
  {placeholder}
  {rows}
  {disabled}
  {name}
  class={`textarea ${className}`}
  bind:value={bindValue}
></textarea>
<style>
.textarea {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #d4a017;
  background: #181e2b;
  color: #f0f2f5;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  resize: vertical;
}
.textarea:focus {
  outline: 2px solid #d4a017;
}
.textarea[disabled] {
  opacity: 0.6;
}
</style>
