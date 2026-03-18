<script lang="ts">
  export let variant: 'default' | 'secondary' = 'default';
  export let className = '';
</script>

<span class={`badge badge--${variant} ${className}`}>
  <slot />
</span>

<style>
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.83rem;
  font-weight: 600;
  padding: 0.45rem 0.8rem;
  background: rgba(255,255,255,0.06);
  color: rgba(240,242,245,0.84);
  border: 1px solid rgba(255,255,255,0.08);
}
.badge--secondary {
  background: #d4a017;
  color: #fff;
  border: none;
}
</style>
