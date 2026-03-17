<script lang="ts">
	import { goto } from '$app/navigation';

	let username = '';
	let email = '';
	let password = '';
	let message = '';

	async function register() {
		message = '';

		const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, email, password })
		});

		if (response.ok) {
			message = 'Registration successful! Redirecting to login...';
			setTimeout(() => goto('/auth/login'), 1000);
			return;
		}

		const data = await response.json().catch(() => null);
		message = data?.error || 'Registration failed.';
	}
</script>

<style>
	.container {
		max-width: 400px;
		margin: 2rem auto;
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 2px 8px #d90429;
		padding: 2rem;
		border: 2px solid #0033a0;
	}
	h2 {
		color: #0033a0;
		text-align: center;
	}
	label {
		color: #d90429;
		font-weight: bold;
	}
	input {
		width: 100%;
		padding: 0.5rem;
		margin-bottom: 1rem;
		border: 1px solid #0033a0;
		border-radius: 4px;
	}
	button {
		background: #0033a0;
		color: #fff;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}
	.message {
		color: #d90429;
		text-align: center;
		margin-top: 1rem;
	}
</style>

<div class="container">
	<h2>Register</h2>
	<form on:submit|preventDefault={register}>
		<label for="username">Username</label>
		<input id="username" bind:value={username} required />
		<label for="email">Email</label>
		<input id="email" type="email" bind:value={email} required />
		<label for="password">Password</label>
		<input id="password" type="password" bind:value={password} required />
		<button type="submit">Register</button>
	</form>
	{#if message}
		<div class="message">{message}</div>
	{/if}
</div>
