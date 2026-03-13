<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { apiFetch } from '$lib/utils/api';
  import { onMount } from 'svelte';

  let tours: any[] = [];
  let loading = true;
  let search = '';
  let error = '';

  onMount(async () => {
    try {
      tours = await apiFetch('/api/tours/', {}, $auth.token);
    } catch (e: any) {
      error = e.message;
      // Fallback sample data for UI preview
      tours = [
        { id: 1, title: 'Cape Winelands Day Tour', location: 'Stellenbosch, SA', duration: '8 hrs', price: 1200, rating: 4.9, emoji: '🍷' },
        { id: 2, title: 'Drakensberg Hike', location: 'KwaZulu-Natal, SA', duration: '2 days', price: 3500, emoji: '🏔️', rating: 4.8 },
        { id: 3, title: 'Kruger Safari', location: 'Mpumalanga, SA', duration: '3 days', price: 8900, emoji: '🦁', rating: 5.0 },
        { id: 4, title: 'Garden Route Road Trip', location: 'Western Cape, SA', duration: '5 days', price: 12000, emoji: '🌊', rating: 4.7 },
        { id: 5, title: 'Joburg City & Soweto', location: 'Johannesburg, SA', duration: '6 hrs', price: 950, emoji: '🏙️', rating: 4.6 },
        { id: 6, title: 'Tsitsikamma Canopy Tour', location: 'Eastern Cape, SA', duration: '4 hrs', price: 1800, emoji: '🌲', rating: 4.8 },
      ];
    } finally {
      loading = false;
    }
  });

  $: filtered = tours.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.location?.toLowerCase().includes(search.toLowerCase())
  );
</script>

<svelte:head><title>Explore Tours · TourGuide</title></svelte:head>

<!-- Header -->
<div class="bg-gradient-to-r from-amber-900 to-amber-700 px-4 py-14 text-center sm:px-6">
  <h1 class="mb-3 text-4xl font-extrabold text-white">Explore Tours</h1>
  <p class="mb-8 text-amber-200">Discover handpicked adventures from local experts.</p>
  <div class="mx-auto max-w-lg">
    <input
      type="search"
      bind:value={search}
      placeholder="Search by destination or tour name..."
      class="w-full rounded-xl border-0 bg-white px-5 py-3.5 text-stone-800 shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
    />
  </div>
</div>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
  {#if loading}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each Array(6) as _}
        <div class="h-64 rounded-2xl bg-stone-200 animate-pulse"></div>
      {/each}
    </div>
  {:else}
    <p class="mb-6 text-sm text-stone-500">{filtered.length} tour{filtered.length !== 1 ? 's' : ''} found</p>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each filtered as tour}
        <a href="/tours/{tour.id}"
          class="group rounded-2xl bg-white border border-stone-100 shadow-sm overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
          <div class="flex h-40 items-center justify-center text-6xl"
            style="background: linear-gradient(135deg, #fef3c7, #fde68a);">
            {tour.emoji || '🗺️'}
          </div>
          <div class="p-5">
            <div class="mb-1 flex items-start justify-between">
              <h3 class="font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-tight">
                {tour.title}
              </h3>
              <span class="ml-2 shrink-0 text-xs text-amber-600 font-semibold">⭐ {tour.rating}</span>
            </div>
            <p class="mb-3 text-xs text-stone-500">📍 {tour.location} · ⏱ {tour.duration}</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-extrabold text-amber-800">
                R{tour.price?.toLocaleString()}
              </span>
              <span class="rounded-lg bg-amber-700 px-3 py-1 text-xs font-semibold text-white group-hover:bg-amber-600 transition-colors">
                Book now
              </span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>
