<script lang="ts">
  export let variant: 'gold' | 'ghost' = 'gold';
  export let type: 'button' | 'submit' = 'button';
  export let disabled = false;
  export let className = '';
</script>

<button
  type={type}
  class={`button button--${variant} ${className}`}
  disabled={disabled}
>
  <slot />
</button>

<style>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.15rem;
  border-radius: 0.6rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: background 0.18s, color 0.18s, border 0.18s;
  cursor: pointer;
  border: none;
}
.button--gold {
  background: #d4a017;
  color: #fff;
}
.button--gold:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.button--ghost {
  border: 1px solid rgba(255,255,255,0.16);
  color: #f0f2f5;
  background: transparent;
}
.button--ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
