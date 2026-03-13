
<script>
  // Add roles logic here
</script>

<script>
  import { onMount } from 'svelte';
  let roles = [];
  let error = '';
  onMount(async () => {
    const res = await fetch('http://localhost:8000/api/users/roles/', {
      credentials: 'include'
    });
    if (res.ok) {
      roles = await res.json();
    } else {
      error = 'Error fetching roles.';
    }
  });
</script>
  <li>Guide</li>
  <li>Tourist</li>
</ul><script lang="ts">
import { onMount } from 'svelte';
let roles = [];
let error = '';

onMount(async () => {
  const res = await fetch('http://localhost:8000/api/users/', {
    credentials: 'include'
  });
  if (res.ok) {
    const users = await res.json();
    roles = users.map(u => ({ username: u.username, roles: u.roles }));
  } else {
    error = 'Error fetching roles.';
  }
});
</script>

<h2>User Roles</h2>
{#if roles.length}
  <ul>
    {#each roles as r}
      <li>{r.username}: {r.roles.join(', ')}</li>
    {/each}
  </ul>
{:else if error}
  <p style="color:red">{error}</p>
{:else}
  <p>Loading...</p>
{/if}
