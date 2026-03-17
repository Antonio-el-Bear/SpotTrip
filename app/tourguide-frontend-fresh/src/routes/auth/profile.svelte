<script lang="ts">
  import { onMount } from 'svelte';

  let user: Record<string, unknown> | null = null;
  let error = '';
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/users/me/', {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Not authenticated or error fetching profile.');
      }

      user = await res.json();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Not authenticated or error fetching profile.';
    } finally {
      loading = false;
    }
  });
</script>

{#if user}
  <h2>Profile</h2>
  <pre>{JSON.stringify(user, null, 2)}</pre>
{:else if error}
  <p style="color:red">{error}</p>
{:else if loading}
  <p>Loading...</p>
{:else}
  <p>No profile data available.</p>
{/if}
