<script lang="ts">
  import { isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  const quickActions = [
    {
      title: 'Review Documented Trips',
      description: 'Return to the archive, compare documented routes, and shortlist journeys for later review.',
      href: '/tours'
    },
    {
      title: 'Manage Your Bookings',
      description: 'Track current trip requests, confirmations, and itinerary follow-up from one place.',
      href: '/bookings'
    },
    {
      title: 'Update Member Profile',
      description: 'Keep your traveler profile current so the platform can tailor recommendations and support.',
      href: '/auth/profile'
    }
  ];

  const dashboardStats = [
    { value: '12', label: 'Saved Routes' },
    { value: '4', label: 'Active Booking Threads' },
    { value: '27', label: 'Recommended Trip Records' }
  ];

  onMount(() => {
    if (!$isAuthenticated) window.location.href = '/auth/login';
  });
</script>

<svelte:head><title>Dashboard · TourGuide</title></svelte:head>

<section class="dashboard-hero">
  <div class="page-shell">
    <p class="eyebrow">Member Workspace</p>
    <h1>Dashboard</h1>
    <p class="hero-copy">
      Your TourGuide dashboard is the control point for saved routes, booking progress, and curated
      travel records drawn from the structured documentation archive.
    </p>
  </div>
</section>

<section class="dashboard-stats">
  <div class="page-shell stats-grid">
    {#each dashboardStats as stat}
      <article class="stat-card">
        <strong>{stat.value}</strong>
        <span>{stat.label}</span>
      </article>
    {/each}
  </div>
</section>

<section class="dashboard-content">
  <div class="page-shell content-grid">
    <article class="panel panel--primary">
      <p class="eyebrow">Overview</p>
      <h2>Welcome back</h2>
      <p>
        Use this workspace to move from inspiration to planning. Review trip records, monitor booking
        conversations, and keep your traveler profile ready for future trip support.
      </p>
      <div class="panel-actions">
        <a class="button button--gold" href="/bookings">My Bookings</a>
        <a class="button button--ghost" href="/tours">Explore Tours</a>
      </div>
    </article>

    <article class="panel">
      <p class="eyebrow">Next Steps</p>
      <h2>Priority Actions</h2>
      <div class="action-list">
        {#each quickActions as action}
          <a class="action-card" href={action.href}>
            <strong>{action.title}</strong>
            <span>{action.description}</span>
          </a>
        {/each}
      </div>
    </article>
  </div>
</section>

<style>
  .page-shell {
    width: min(1200px, calc(100% - 2rem));
    margin: 0 auto;
  }

  .dashboard-hero,
  .dashboard-stats,
  .dashboard-content {
    padding: 2.5rem 0;
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
  h2,
  .stat-card strong,
  .action-card strong {
    margin: 0;
    font-family: 'Playfair Display', serif;
    color: #f0f2f5;
  }

  h1 {
    font-size: clamp(2.2rem, 5vw, 3.6rem);
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.8rem;
    margin-bottom: 0.8rem;
  }

  .hero-copy,
  .panel p,
  .action-card span,
  .stat-card span {
    color: rgba(240, 242, 245, 0.72);
    line-height: 1.7;
  }

  .stats-grid,
  .content-grid,
  .panel-actions,
  .action-list {
    display: grid;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1.1fr 1fr;
  }

  .stat-card,
  .panel,
  .action-card {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(30, 42, 58, 0.94);
  }

  .stat-card {
    padding: 1.5rem;
    text-align: center;
  }

  .stat-card strong {
    display: block;
    font-size: 2rem;
    margin-bottom: 0.35rem;
  }

  .panel {
    padding: 1.75rem;
  }

  .panel--primary {
    background: linear-gradient(135deg, rgba(37, 48, 68, 0.96), rgba(26, 34, 51, 0.96));
  }

  .panel-actions {
    grid-template-columns: repeat(2, minmax(0, max-content));
    margin-top: 1.25rem;
  }

  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 1.15rem;
    border-radius: 0.6rem;
    text-decoration: none;
    font-weight: 700;
  }

  .button--gold {
    background: #d4a017;
    color: #fff;
  }

  .button--ghost {
    border: 1px solid rgba(255, 255, 255, 0.16);
    color: #f0f2f5;
  }

  .action-card {
    display: block;
    padding: 1rem;
    text-decoration: none;
  }

  .action-card strong {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 1.1rem;
  }

  @media (max-width: 900px) {
    .stats-grid,
    .content-grid,
    .panel-actions {
      grid-template-columns: 1fr;
    }
  }
</style>
