<script lang="ts">
  import { page } from '$app/stores';
  import { apiFetch } from '$lib/utils/api';
  import { onMount } from 'svelte';

  export let params: { id: string };
  let tour: any = null;
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      tour = await apiFetch(`/api/tours/${params.id}/`);
    } catch (e: any) {
      error = e.message;
      // Fallback sample data
      tour = {
        id: params.id,
        title: 'Sample Tour',
        location: 'Unknown',
        duration: '1 day',
        price: 1000,
        rating: 4.8,
        emoji: '🗺️',
        description: 'This is a sample tour description.'
      };
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head><title>{tour ? tour.title : 'Tour Details'} · TourGuide</title></svelte:head>

<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6">
  {#if loading}
    <div class="flex items-center justify-center py-24 text-stone-400">
      <span class="text-4xl animate-spin">⟳</span>
    </div>
  {:else if error}
    <div class="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">⚠️ {error}</div>
  {:else if tour}
    <div class="rounded-2xl bg-white border border-stone-100 shadow-sm overflow-hidden">
      <div class="flex items-center justify-center h-40 text-7xl bg-gradient-to-r from-amber-100 to-amber-200">
        {tour.emoji || '🗺️'}
      </div>
      <div class="p-8">
        <h1 class="mb-2 text-3xl font-extrabold text-stone-800">{tour.title}</h1>
        <p class="mb-4 text-stone-500">📍 {tour.location} · ⏱ {tour.duration} · ⭐ {tour.rating}</p>
        <p class="mb-6 text-stone-700">{tour.description}</p>
        <div class="flex items-center gap-4">
          <span class="text-2xl font-bold text-amber-800">R{tour.price?.toLocaleString()}</span>
          <button class="rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">Book this Tour</button>
        </div>
      </div>
    </div>
  {/if}
</div>
