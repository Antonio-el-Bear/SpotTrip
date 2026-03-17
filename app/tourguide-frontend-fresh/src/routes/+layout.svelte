
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { auth } from '$lib/stores/auth';
	import Compass from 'lucide-svelte/icons/compass';

	type LayoutUser = {
		email?: string;
		first_name?: string;
		last_name?: string;
		full_name?: string;
		username?: string;
	};

	type AuthState = {
		user: LayoutUser | null;
	};

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Destinations', href: '/tours' },
		{ label: 'Members', href: '/dashboard' },
		{ label: 'Bookings', href: '/bookings' },
		{ label: 'About', href: '/about' },
		{ label: 'Contact', href: '/contact' }
	];

	let user: LayoutUser | null = null;
	let isScrolled = false;

	onMount(() => {
		const unsubscribe = auth.subscribe((state: AuthState) => {
			user = state.user;
		});

		const handleScroll = () => {
			isScrolled = window.scrollY > 12;
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
			unsubscribe();
		};
	});

	$: pathname = $page.url.pathname;
	$: isHome = pathname === '/';
	$: headerClass = isHome && !isScrolled ? 'header header--transparent' : 'header header--solid';
	$: displayName = user?.full_name || [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'Guest';
</script>

<svelte:head>
	<title>TourGuide</title>
</svelte:head>

<div class="app-shell">
	<header class={headerClass}>
		<div class="shell-container header__inner">
			<a class="brand" href="/">
				<span class="brand__mark"><Compass size={20} /></span>
				<span>
					<strong>TourGuide</strong>
					<small>Structured Travel Documentation</small>
				</span>
			</a>

			<nav class="nav">
				{#each navLinks as link}
					<a class:nav__link--active={pathname === link.href} class="nav__link" href={link.href}>{link.label}</a>
				{/each}
			</nav>

			<div class="header__actions">
				{#if user}
					<div class="user-chip">
						<span class="user-chip__label">Signed in</span>
						<strong>{displayName}</strong>
					</div>
				{:else}
					<a class="button button--ghost" href="/dashboard">Member Area</a>
					<a class="button button--gold" href="/contact">Get Started</a>
				{/if}
			</div>
		</div>
	</header>

	<main>
		<slot />
	</main>

	<footer class="footer">
		<div class="shell-container footer__grid">
			<div>
				<p class="footer__eyebrow">TourGuide</p>
				<p class="footer__copy">
					A structured platform for documented travel knowledge, experienced trip authors, and
					practical planning support.
				</p>
			</div>
			<div class="footer__links">
				<a href="/about">About</a>
				<a href="/tours">Destinations</a>
				<a href="/dashboard">Dashboard</a>
				<a href="/contact">Contact</a>
			</div>
		</div>
		<div class="shell-container footer__bottom">© 2026 TourGuide · Structured Travel Documentation Platform</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Source Sans 3', sans-serif;
		background: #1a2233;
		color: #f0f2f5;
	}

	:global(a) {
		color: inherit;
	}

	.app-shell {
		min-height: 100vh;
		background:
			radial-gradient(circle at top, rgba(212, 160, 23, 0.14), transparent 24%),
			linear-gradient(180deg, #1a2233 0%, #121927 100%);
	}

	.shell-container {
		width: min(1200px, calc(100% - 2rem));
		margin: 0 auto;
	}

	.header {
		position: sticky;
		top: 0;
		z-index: 20;
		transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.header--transparent {
		background: transparent;
		border-bottom: 1px solid transparent;
	}

	.header--solid {
		background: rgba(18, 25, 39, 0.94);
		backdrop-filter: blur(14px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
	}

	.header__inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 0;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.85rem;
		text-decoration: none;
	}

	.brand__mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #d4a017 0%, #b8860b 100%);
		color: #fff;
		box-shadow: 0 10px 24px rgba(212, 160, 23, 0.28);
	}

	.brand strong {
		display: block;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: 0.03em;
	}

	.brand small,
	.user-chip__label,
	.footer__eyebrow {
		display: block;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: #d4a017;
	}

	.nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.15rem;
	}

	.nav__link {
		text-decoration: none;
		font-size: 0.95rem;
		color: rgba(240, 242, 245, 0.72);
		transition: color 0.2s ease;
	}

	.nav__link:hover,
	.nav__link--active {
		color: #fff;
	}

	.header__actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.7rem 1rem;
		border-radius: 0.55rem;
		text-decoration: none;
		font-size: 0.9rem;
		font-weight: 700;
	}

	.button--ghost {
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: #f0f2f5;
	}

	.button--gold {
		background: #d4a017;
		color: #fff;
	}

	.user-chip {
		padding: 0.7rem 0.9rem;
		border-radius: 0.8rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.footer {
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(11, 17, 28, 0.9);
	}

	.footer__grid {
		display: grid;
		grid-template-columns: 1.6fr 1fr;
		gap: 2rem;
		padding: 2rem 0 1rem;
	}

	.footer__copy,
	.footer__bottom {
		color: rgba(240, 242, 245, 0.62);
		line-height: 1.65;
	}

	.footer__links {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: 1rem;
	}

	.footer__links a {
		text-decoration: none;
		color: rgba(240, 242, 245, 0.72);
	}

	.footer__bottom {
		padding: 0 0 2rem;
		font-size: 0.9rem;
	}

	@media (max-width: 900px) {
		.header__inner,
		.footer__grid {
			grid-template-columns: 1fr;
			flex-direction: column;
			align-items: flex-start;
		}

		.nav,
		.footer__links {
			justify-content: flex-start;
		}
	}

	@media (max-width: 640px) {
		.shell-container {
			width: min(100% - 1.25rem, 1200px);
		}

		.header__actions {
			width: 100%;
			justify-content: space-between;
		}

		.button {
			flex: 1;
		}
	}
</style>
