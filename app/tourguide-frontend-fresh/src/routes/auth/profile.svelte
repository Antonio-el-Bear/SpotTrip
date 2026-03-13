
<script>
  // Add profile logic here
</script>

<script>
  import { onMount } from 'svelte';
  let user = null;
  let error = '';
  onMount(async () => {
    const res = await fetch('http://localhost:8000/api/users/me/', {
      credentials: 'include'
    });
    if (res.ok) {
      user = await res.json();
    } else {
      error = 'Not authenticated or error fetching profile.';
    }
  });
</script>
  if (res.ok) {
    user = await res.json();
  } else {
    error = 'Not authenticated or error fetching profile.';
  }
});
</script>

{#if user}
  <h2>Profile</h2>
  <pre>{JSON.stringify(user, null, 2)}</pre>
{:else if error}
  <p style="color:red">{error}</p>
{:else}
  <p>Loading...</p>
{/if}
