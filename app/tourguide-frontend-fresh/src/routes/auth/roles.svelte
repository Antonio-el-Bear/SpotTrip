<script lang="ts">
	import { onMount } from 'svelte';

	type RoleRow = {
		username: string;
		roles: string[];
	};

	let roles: RoleRow[] = [];
	let error = '';

	onMount(async () => {
		const response = await fetch('http://127.0.0.1:8000/api/users/', {
			credentials: 'include'
		});

		if (!response.ok) {
			error = 'Error fetching roles.';
			return;
		}

		const users = (await response.json()) as Array<{ username?: string; roles?: string[]; role?: string }>;
		roles = users.map((user) => ({
			username: user.username || 'unknown',
			roles: user.roles || (user.role ? [user.role] : [])
		}));
	});
</script>

<h2>User Roles</h2>
{#if roles.length}
	<ul>
		{#each roles as roleRow (roleRow.username)}
			<li>{roleRow.username}: {roleRow.roles.join(', ') || 'No roles assigned'}</li>
		{/each}
	</ul>
{:else if error}
	<p style="color:red">{error}</p>
{:else}
	<p>Loading...</p>
{/if}
