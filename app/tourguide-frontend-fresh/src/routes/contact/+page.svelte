<script lang="ts">
  const contactChannels = [
    { title: 'General Enquiries', value: 'support@tourguide.com', note: 'Questions about the platform, routes, or account access.' },
    { title: 'Travel Records', value: 'archive@tourguide.com', note: 'Support for documented trips, corrections, and content review.' },
    { title: 'Consultancy & Partnerships', value: 'partners@tourguide.com', note: 'Professional collaborations and expert travel documentation enquiries.' }
  ];
</script>

<svelte:head><title>Contact · TourGuide</title></svelte:head>

<section class="contact-hero">
  <div class="page-shell">
    <p class="eyebrow">Support & Enquiries</p>
    <h1>Contact TourGuide</h1>
    <p class="hero-copy">
      Reach the team for platform questions, travel-record support, or member guidance. TourGuide is
      designed as a structured travel information environment, and support follows the same practical approach.
    </p>
  </div>
</section>

<section class="contact-content">
  <div class="page-shell content-grid">
    <article class="panel">
      <p class="eyebrow">Send a Message</p>
      <h2>We’ll route your enquiry</h2>
      <form class="form-grid">
        <label>
          <span>Name</span>
          <input id="contact-name" type="text" required />
        </label>
        <label>
          <span>Email</span>
          <input id="contact-email" type="email" required />
        </label>
        <label class="full-width">
          <span>Message</span>
          <textarea id="contact-message" rows="6" required></textarea>
        </label>
        <button type="submit">Send Message</button>
      </form>
    </article>

    <article class="panel panel--secondary">
      <p class="eyebrow">Direct Channels</p>
      <h2>How to reach us</h2>
      <div class="channel-list">
        {#each contactChannels as channel}
          <div class="channel-card">
            <strong>{channel.title}</strong>
            <a href={`mailto:${channel.value}`}>{channel.value}</a>
            <span>{channel.note}</span>
          </div>
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

  .contact-hero,
  .contact-content {
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
  .channel-card strong {
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
  .panel,
  .channel-card span,
  label span {
    color: rgba(240, 242, 245, 0.72);
    line-height: 1.7;
  }

  .content-grid,
  .form-grid,
  .channel-list {
    display: grid;
    gap: 1rem;
  }

  .content-grid {
    grid-template-columns: 1.1fr 0.9fr;
  }

  .panel,
  .channel-card {
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(30, 42, 58, 0.94);
  }

  .panel {
    padding: 1.75rem;
  }

  .panel--secondary {
    background: linear-gradient(135deg, rgba(37, 48, 68, 0.96), rgba(26, 34, 51, 0.96));
  }

  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 1rem;
  }

  label {
    display: grid;
    gap: 0.45rem;
  }

  .full-width {
    grid-column: 1 / -1;
  }

  input,
  textarea {
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 0.75rem;
    background: rgba(11, 17, 28, 0.42);
    color: #f0f2f5;
    padding: 0.9rem 1rem;
    font: inherit;
  }

  button {
    grid-column: 1 / -1;
    border: 0;
    border-radius: 0.75rem;
    background: #d4a017;
    color: #fff;
    padding: 0.95rem 1rem;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .channel-card {
    padding: 1rem;
  }

  .channel-card strong,
  .channel-card a {
    display: block;
    margin-bottom: 0.35rem;
  }

  .channel-card a {
    color: #d4a017;
    text-decoration: none;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .content-grid,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .full-width,
    button {
      grid-column: auto;
    }
  }
</style>
