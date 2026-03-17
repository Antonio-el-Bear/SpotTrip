<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { apiFetch } from '$lib/utils/api';
  import { onMount } from 'svelte';

  type Tour = {
    id: number;
    title: string;
    location: string;
    duration: string;
    price: number;
    rating: number;
    emoji?: string;
  };

  const fallbackTours: Tour[] = [
    { id: 1, title: 'Cape Winelands Day Tour', location: 'Stellenbosch, SA', duration: '8 hrs', price: 1200, rating: 4.9, emoji: '🍷' },
    { id: 2, title: 'Drakensberg Hike', location: 'KwaZulu-Natal, SA', duration: '2 days', price: 3500, rating: 4.8, emoji: '🏔️' },
    { id: 3, title: 'Kruger Safari', location: 'Mpumalanga, SA', duration: '3 days', price: 8900, rating: 5.0, emoji: '🦁' },
    { id: 4, title: 'Garden Route Road Trip', location: 'Western Cape, SA', duration: '5 days', price: 12000, rating: 4.7, emoji: '🌊' },
    { id: 5, title: 'Joburg City & Soweto', location: 'Johannesburg, SA', duration: '6 hrs', price: 950, rating: 4.6, emoji: '🏙️' },
    { id: 6, title: 'Tsitsikamma Canopy Tour', location: 'Eastern Cape, SA', duration: '4 hrs', price: 1800, rating: 4.8, emoji: '🌲' }
  ];
  const loadingSkeletons = Array.from({ length: 6 }, (_, index) => index);

  let tours: Tour[] = [];
  let loading = true;
  let search = '';

  onMount(async () => {
    try {
      tours = await apiFetch<Tour[]>('/api/tours/', {}, $auth.token);
    } catch {
      tours = fallbackTours;
    } finally {
      loading = false;
    }
  });

  $: filtered = tours.filter((tour) =>
    tour.title.toLowerCase().includes(search.toLowerCase()) ||
    tour.location.toLowerCase().includes(search.toLowerCase())
  );
</script>

<svelte:head><title>Explore Tours · TourGuide</title></svelte:head>

<section class="tours-hero">
  <div class="page-shell hero-inner">
    <p class="eyebrow">Documented Travel Archive</p>
    <h1>Explore Tours</h1>
    <p class="hero-copy">Discover structured travel records, destination routes, and practical trip options from the TourGuide archive.</p>
    <div class="search-shell">
    <input
      type="search"
      bind:value={search}
      placeholder="Search by destination or tour name..."
      class="search-input"
    />
    </div>
  </div>
</section>

<section class="tours-content">
  <div class="page-shell">
  {#if loading}
    <div class="tour-grid">
      {#each loadingSkeletons as skeleton (skeleton)}
        <div class="tour-skeleton"></div>
      {/each}
    </div>
  {:else}
    <p class="results-copy">{filtered.length} tour{filtered.length !== 1 ? 's' : ''} found</p>
    <div class="tour-grid">
      {#each filtered as tour (tour.id)}
        <button type="button" class="tour-card" on:click={() => (window.location.href = `/tours/${tour.id}`)}>
          <div class="tour-card__media">
            {tour.emoji || '🗺️'}
          </div>
          <div class="tour-card__body">
            <div class="tour-card__topline">
              <h3>
                {tour.title}
              </h3>
              <span>⭐ {tour.rating}</span>
            </div>
            <p class="tour-card__meta">📍 {tour.location} · ⏱ {tour.duration}</p>
            <div class="tour-card__footer">
              <span class="tour-card__price">
                R{tour.price?.toLocaleString()}
              </span>
              <span class="tour-card__cta">
                Book now
              </span>
            </div>
          </div>
        </button>
      {/each}
    </div>
  {/if}
  </div>
</section>

<style>
  .page-shell {
    width: min(1200px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .tours-hero,
  .tours-content {
    padding: 2.5rem 0;
  }

  .hero-inner {
    max-width: 58rem;
  }

  .eyebrow {
    margin: 0 0 0.8rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #d4a017;
  }

  h1,
  h3,
  .tour-card__price {
    margin: 0;
    font-family: 'Playfair Display', serif;
    color: #f0f2f5;
  }

  h1 {
    font-size: clamp(2.3rem, 5vw, 3.8rem);
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.35rem;
  }

  .hero-copy,
  .results-copy,
  .tour-card__meta,
  .tour-card__topline span {
    color: rgba(240, 242, 245, 0.72);
    line-height: 1.7;
  }

  .search-shell {
    margin-top: 1.5rem;
    max-width: 34rem;
  }

  .search-input {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.9rem;
    background: rgba(30, 42, 58, 0.94);
    color: #f0f2f5;
    padding: 1rem 1.1rem;
    font: inherit;
  }

  .tour-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tour-card,
  .tour-skeleton {
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(30, 42, 58, 0.94);
    text-decoration: none;
  }

  .tour-card {
    padding: 0;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }

  .tour-skeleton {
    height: 18rem;
    background: linear-gradient(135deg, rgba(37, 48, 68, 0.96), rgba(26, 34, 51, 0.96));
  }

  .tour-card__media {
    display: grid;
    place-items: center;
    height: 10rem;
    font-size: 3.2rem;
    background: linear-gradient(135deg, #2a3a52, #1a2a3e);
  }

  .tour-card__body {
    padding: 1.25rem;
  }

  .tour-card__topline,
  .tour-card__footer {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    align-items: start;
  }

  .tour-card__meta {
    margin: 0.65rem 0 1rem;
  }

  .tour-card__price {
    font-size: 1.45rem;
  }

  .tour-card__cta {
    border-radius: 999px;
    background: #d4a017;
    color: #fff;
    padding: 0.45rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .tour-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
