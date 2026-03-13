<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    if (!$isAuthenticated) goto('/auth/login');
  });
</script>

<svelte:head><title>Dashboard · TourGuide</title></svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
  <h1 class="mb-6 text-3xl font-extrabold text-stone-800">Dashboard</h1>
  <div class="rounded-2xl bg-white border border-stone-100 shadow-sm p-8 text-center">
    <div class="mb-4 text-5xl">🧭</div>
    <h2 class="mb-2 text-xl font-bold text-stone-700">Welcome to your dashboard!</h2>
    <p class="mb-6 text-stone-400">Quick access to your bookings, profile, and recommended tours.</p>
    <div class="flex flex-col gap-4 sm:flex-row sm:justify-center">
      <a href="/bookings" class="rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">My Bookings</a>
      <a href="/tours" class="rounded-lg bg-amber-100 px-6 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-200 transition-colors">Explore Tours</a>
      <a href="/auth/profile" class="rounded-lg border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors">Profile</a>
    </div>
  </div>
</div>
