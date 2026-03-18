

<script lang="ts">
import Navbar from '$lib/components/Navbar.svelte';
import SearchBar from '$lib/components/SearchBar.svelte';
import Button from '$lib/components/Button.svelte';
import FeaturedTripCard from '$lib/components/FeaturedTripCard.svelte';
import FeaturedAuthorCard from '$lib/components/FeaturedAuthorCard.svelte';
import MembershipOptions from '$lib/components/MembershipOptions.svelte';
import AITripBuilderPromo from '$lib/components/AITripBuilderPromo.svelte';
import Footer from '$lib/components/Footer.svelte';
const stats = [
	{ icon: '📄', value: '2,840', label: 'Documented Trips' },
	{ icon: '👥', value: '1,120', label: 'Registered Members' },
	{ icon: '🌍', value: '147', label: 'Countries Covered' }
];
const trips = [
	{
		title: 'Sustainable Communities of the Peruvian Highlands',
		member: 'DH',
		memberRole: 'Member',
		memberBy: 'Dr. Helena Vasquez',
		country: 'Peru',
		days: '14 days',
		price: '$2,500 – $5,000',
		tags: ['Community-based Tourism', 'Sustainable Tourism', 'Cultural Tourism'],
		avatar: 'DH'
	},
	{
		title: 'Silk Road Heritage: Uzbekistan Corridor',
		member: 'JW',
		memberRole: 'Member',
		memberBy: 'James Worthington',
		country: 'Uzbekistan',
		days: '17 days',
		price: '$2,500 – $5,000',
		tags: ['Heritage Tourism', 'Cultural Tourism', 'Educational Tourism'],
		avatar: 'JW'
	},
	{
		title: 'Culinary Heritage Trail: Northern Spain',
		member: 'AT',
		memberRole: 'Member',
		memberBy: 'Akiko Tanaka',
		country: 'Spain',
		days: '11 days',
		price: '$2,500 – $5,000',
		tags: ['Gastronomy Tourism', 'Cultural Tourism', 'Sustainable Tourism'],
		avatar: 'AT'
	}
];
const authors = [
	{
		initials: 'DH',
		name: 'Dr. Helena Vasquez',
		countries: 'Peru, Colombia, Ecuador +7',
		trips: 24,
		bio: 'Independent travel researcher with over 15 years of experience documenting sustainable tourism practices across South America and Southeast Asia. Specializes in community-based tourism assessment and ecotourism development frameworks.',
		rate: 'USD 45/s',
		tags: ['Community-based Tourism', 'Sustainable Tourism', 'Ecotourism', 'Cultural Tourism', '+2 more'],
		offerType: 'Free & Paid'
	},
	{
		initials: 'JW',
		name: 'James Worthington',
		countries: 'Georgia, Armenia, Azerbaijan +6',
		trips: 18,
		bio: 'Former diplomatic attaché and cultural heritage consultant. Extensive travel documentation across Central Asia and the Caucasus region, with a focus on Silk Road heritage sites and traditional craftsmanship.',
		rate: 'EUR 80/s',
		tags: ['Heritage Tourism', 'Cultural Tourism', 'Educational Tourism'],
		offerType: 'Paid'
	},
	{
		initials: 'AT',
		name: 'Akiko Tanaka',
		countries: 'Japan, South Korea, Taiwan +6',
		trips: 31,
		bio: 'Gastronomy tourism specialist and culinary anthropologist. Documents food traditions, local markets, and culinary heritage across East Asia and the Mediterranean. Published author on sustainable food tourism.',
		rate: 'Free',
		tags: ['Gastronomy Tourism', 'Cultural Tourism', 'Sustainable Tourism', 'Heritage Tourism'],
		offerType: 'Free'
	}
];
const overview = [
	'Structured travel knowledge repository curated by serious travellers and consultants.',
	'Comprehensive trip records with itineraries, logistics, and cost context.',
	'Access to experienced trip authors for practical planning guidance.',
	'Searchable documentation built to support informed travel decisions.'
];
const pillars = [
	'Structured Travel Knowledge Repository',
	'Comprehensive Trip Records',
	'Access to Experienced Travellers',
	'Practical Trip Planning Support',
	'Professional Information Environment'
];
</script>

<svelte:head>
	<title>TourGuide · Home</title>
</svelte:head>

<Navbar />

<section class="hero">
	<div class="page-container hero__inner">
		<p class="eyebrow">Passionate Travel Directory</p>
		<h1>Structured Travel Documentation</h1>
		<p class="hero__copy">
			Not a travel blog or social network — a platform where passionate, serious travelers document their journeys.
		</p>
		<SearchBar />
		<div class="pill-row">
			{#each pillars as pillar}
				<span>{pillar}</span>
			{/each}
		</div>
		<div class="hero__actions">
			<Button variant="gold" className="w-full" on:click={() => window.location.href = '/tours'}>
				Explore Destinations
			</Button>
			<Button variant="ghost" className="w-full" on:click={() => window.location.href = '/dashboard'}>
				Open Member Area
			</Button>
		</div>
	</div>
</section>

<section class="stats-bar">
	<div class="page-container stats-grid">
		{#each stats as stat}
			<div class="stat-card">
				<div class="stat-card__icon">{stat.icon}</div>
				<div class="stat-card__value">{stat.value}</div>
				<div class="stat-card__label">{stat.label}</div>
			</div>
		{/each}
	</div>
</section>

<section class="section">
	<div class="page-container">
		<div class="section__header">
			<div>
				<p class="eyebrow">Recently Documented</p>
				<h2>Featured Trips</h2>
			</div>
			<a href="/tours">View all</a>
		</div>
		<div class="card-grid">
			{#each trips as trip}
				<FeaturedTripCard {...trip} />
			{/each}
		</div>
	</div>
</section>

<section class="section section--alt">
	<div class="page-container">
		<div class="section__header">
			<div>
				<p class="eyebrow">Experienced Authors</p>
				<h2>Featured Trip Authors</h2>
			</div>
			<a href="/dashboard">Member area</a>
		</div>
		<div class="card-grid">
			{#each authors as author}
				<FeaturedAuthorCard {...author} />
			{/each}
		</div>
	</div>
</section>
<MembershipOptions />

<AITripBuilderPromo />

<section class="section">
	<div class="page-container overview">
		<div>
			<p class="eyebrow">What We Offer</p>
			<h2>Platform Overview</h2>
		</div>
		<div class="overview__grid">
			{#each overview as item}
				<div class="overview__item">{item}</div>
			{/each}
		</div>
	</div>
</section>



<Footer />
<style>
	.page-container {
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
	}

	.hero {
		padding: 4.5rem 0 3.5rem;
	}

	.hero__inner {
		max-width: 52rem;
	}

	.eyebrow {
		margin: 0 0 1rem;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: #d4a017;
	}

	h1,
	h2,
	h3 {
		margin: 0;
		font-family: 'Playfair Display', serif;
		color: #f0f2f5;
	}

	h1 {
		font-size: clamp(2.6rem, 6vw, 4.6rem);
		line-height: 1.05;
		margin-bottom: 1rem;
	}

	h2 {
		font-size: clamp(1.8rem, 4vw, 2.3rem);
	}

	.hero__copy,
	.trip-card__body p,
	.author-card p,
	.author-card small,
	.cta p,
	.overview__item {
		color: rgba(240, 242, 245, 0.72);
		line-height: 1.7;
	}

	.pill-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin: 2rem 0;
	}

	.pill-row span {
		padding: 0.45rem 0.8rem;
		border-radius: 999px;
		font-size: 0.83rem;
		color: rgba(240, 242, 245, 0.84);
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.hero__actions,
	.section__header,
	.stats-grid,
	.card-grid,
	.overview__grid {
		display: grid;
		gap: 1rem;
	}

	.hero__actions {
		grid-template-columns: repeat(2, minmax(0, max-content));
		align-items: center;
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

	.stats-bar {
		padding: 0 0 1rem;
	}

	.stats-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.stat-card,
	.trip-card,
	.author-card,
	.cta__inner {
		background: rgba(30, 42, 58, 0.94);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 0.9rem;
	}

	.stat-card {
		padding: 1.5rem;
		text-align: center;
	}

	.stat-card__icon {
		font-size: 1.25rem;
		margin-bottom: 0.45rem;
	}

	.stat-card__value {
		font-family: 'Playfair Display', serif;
		font-size: 2rem;
		font-weight: 700;
	}

	.stat-card__label,
	.trip-card__country {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #d4a017;
	}

	.section {
		padding: 4rem 0;
	}

	.section--alt {
		background: rgba(37, 48, 68, 0.38);
	}

	.section__header {
		grid-template-columns: 1fr auto;
		align-items: end;
		margin-bottom: 1.5rem;
	}

	.section__header a {
		color: rgba(240, 242, 245, 0.68);
		text-decoration: none;
	}

	.card-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	.trip-card {
		overflow: hidden;
		text-decoration: none;
	}

	.trip-card__media {
		display: grid;
		place-items: center;
		height: 10rem;
		font-size: 3.2rem;
		background: linear-gradient(135deg, #2a3a52, #1a2a3e);
	}

	.trip-card__body,
	.author-card {
		padding: 1.25rem;
	}

	.trip-card__body h3,
	.author-card h3 {
		margin: 0.35rem 0;
		font-size: 1.25rem;
	}

	.author-card__avatar {
		display: grid;
		place-items: center;
		width: 3.2rem;
		height: 3.2rem;
		margin-bottom: 1rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #d4a017, #b8860b);
		font-weight: 700;
		color: #fff;
	}

	.overview__grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
		margin-top: 1.5rem;
	}

	.overview__item {
		padding-left: 1rem;
		border-left: 2px solid rgba(212, 160, 23, 0.4);
	}

	.cta {
		padding: 0 0 4rem;
	}

	.cta__inner {
		padding: 2rem;
		text-align: center;
	}

	.cta__inner h2 {
		margin-bottom: 0.75rem;
	}

	.cta__inner p {
		max-width: 40rem;
		margin: 0 auto 1.5rem;
	}

	@media (max-width: 900px) {
		.stats-grid,
		.card-grid,
		.overview__grid {
			grid-template-columns: 1fr;
		}

		.section__header,
		.hero__actions {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.page-container {
			width: min(100% - 1.25rem, 1200px);
		}

		.hero {
			padding-top: 3rem;
		}

		.button {
			width: 100%;
		}
	}
</style>
