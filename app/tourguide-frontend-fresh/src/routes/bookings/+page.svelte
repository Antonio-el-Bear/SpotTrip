<script lang="ts">
  import { auth, isAuthenticated } from '$lib/stores/auth';
  import { apiFetch } from '$lib/utils/api';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let bookings: any[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    if (!$isAuthenticated) { goto('/auth/login'); return; }
    try {
      bookings = await apiFetch('/api/bookings/', {}, $auth.token);
    } catch {
      // Preview data
      bookings = [
        { id: 1, tour: { title: 'Cape Winelands Day Tour', emoji: '🍷' }, date: '2025-08-15', status: 'confirmed', guests: 2, total: 2400 },
        { id: 2, tour: { title: 'Kruger Safari', emoji: '🦁' }, date: '2025-09-02', status: 'pending', guests: 4, total: 35600 },
      ];
    } finally {
      loading = false;
    }
  });

  const statusStyle: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
  };
</script>

<svelte:head><title>My Bookings · TourGuide</title></svelte:head>

<div class="mx-auto max-w-4xl px-4 py-12 sm:px-6">
  <div class="mb-8 flex items-center justify-between">
    <h1 class="text-3xl font-extrabold text-stone-800">My Bookings</h1>
    <a href="/tours" class="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
      + Book a Tour
    </a>
  </div>

  {#if loading}
    <div class="space-y-4">
      {#each Array(3) as _}
        <div class="h-24 rounded-2xl bg-stone-200 animate-pulse"></div>
      {/each}
    </div>
  {:else if bookings.length === 0}
    <div class="rounded-2xl bg-white border border-stone-100 py-20 text-center shadow-sm">
      <div class="mb-4 text-5xl">🗺️</div>
      <h2 class="mb-2 text-xl font-bold text-stone-700">No bookings yet</h2>
      <p class="mb-6 text-stone-400">Start your adventure by exploring our tours.</p>
      <a href="/tours" class="rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
        Explore Tours
      </a>
    </div>
  {:else}
    <div class="space-y-4">
      {#each bookings as booking}
        <div class="flex items-center gap-5 rounded-2xl bg-white border border-stone-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl"
            style="background: #fef3c7;">
            {booking.tour?.emoji || '🗺️'}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-stone-800 truncate">{booking.tour?.title}</h3>
            <p class="text-sm text-stone-500">📅 {booking.date} · 👥 {booking.guests} guests</p>
          </div>
          <div class="text-right shrink-0">
            <p class="font-bold text-amber-800">R{booking.total?.toLocaleString()}</p>
            <span class="mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
              {statusStyle[booking.status] || 'bg-stone-100 text-stone-600'}">
              {booking.status}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
