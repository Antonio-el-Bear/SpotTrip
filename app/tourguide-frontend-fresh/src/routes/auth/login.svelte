
<script lang="ts">
  import { goto } from '$app/navigation';
  import { User, Users } from 'lucide-svelte';
  let selectedUser = 'guest';
  const users = [
    { name: 'Guest', icon: User },
    { name: 'Admin', icon: Users },
    { name: 'Traveler', icon: User },
    { name: 'Manager', icon: Users }
  ];
  function switchUser(user) {
    selectedUser = user.name;
  }
</script>

<style>
  .login-container {
    max-width: 400px;
    margin: 4rem auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 24px #0033a033;
    padding: 2.5rem 2rem 2rem 2rem;
    border: 2px solid #0033a0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .login-title {
    color: #0033a0;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .login-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    width: 100%;
    justify-content: center;
  }
  .login-btn {
    background: #0033a0;
    color: #fff;
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .login-btn.signup {
    background: #d90429;
  }
  .user-switcher {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    justify-content: center;
  }
  .user-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border 0.2s;
  }
  .user-icon.selected {
    border-color: #0033a0;
    background: #e0e7ff;
  }
  .user-label {
    font-size: 0.9rem;
    color: #0033a0;
    text-align: center;
    margin-top: 0.25rem;
  }
</style>

<div class="login-container">
  <div class="login-title">Sign In or Sign Up</div>
  <div class="login-actions">
    <button class="login-btn" on:click={() => goto('/')}>Login</button>
    <button class="login-btn signup" on:click={() => goto('/auth/register')}>Sign Up</button>
  </div>
  <div class="user-switcher">
    {#each users as userObj}
      <div class="user-icon {selectedUser === userObj.name ? 'selected' : ''}" on:click={() => switchUser(userObj)}>
        <svelte:component this={userObj.icon} size={28} color="#0033a0" />
      </div>
    {/each}
  </div>
  <div class="user-label">Current: {selectedUser}</div>
</div>
