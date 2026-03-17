
<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Compass from 'lucide-svelte/icons/compass';
	import Menu from 'lucide-svelte/icons/menu';
	import User from 'lucide-svelte/icons/user';
	import Bell from 'lucide-svelte/icons/bell';
	import BookMarked from 'lucide-svelte/icons/book-marked';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Settings from 'lucide-svelte/icons/settings';
	import Crown from 'lucide-svelte/icons/crown';

	type LayoutUser = {
		avatar?: string;
		email?: string;
		full_name?: string;
	};

	let user: LayoutUser | null = null;
	let isScrolled = false;
	let currentPageName = $page.url.pathname === '/' ? 'Home' : $page.url.pathname.replace('/', '');

	onMount(() => {
		const unsubscribe = auth.subscribe((state) => {
			user = state.user;
		});
		const handleScroll = () => {
			isScrolled = window.scrollY > 50;
		};
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			unsubscribe();
		};
	});

	const navLinks = [
		{ name: 'Destinations', page: '/' },
		{ name: 'Forum', page: '/' },
		{ name: 'Travel Tools', page: '/' },
		{ name: 'Pricing', page: '/' }
	];

	$: isHome = currentPageName === 'Home';
	$: currentPageName = $page.url.pathname === '/' ? 'Home' : $page.url.pathname.replace('/', '');
	$: headerBg = isHome && !isScrolled ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md shadow-sm';
	$: textColor = isHome && !isScrolled ? 'text-white' : 'text-gray-900';
</script>

<div class="min-h-screen">
	<!-- Header -->
	<header class={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}>
		<div class="max-w-7xl mx-auto px-4">
			<div class="flex items-center justify-between h-20">
				<!-- Logo -->
				<a href="/" class="flex items-center gap-2">
					<div class={`w-10 h-10 rounded-xl flex items-center justify-center ${isHome && !isScrolled ? 'bg-white/20' : 'bg-amber-500'}`}>
						<Compass class={`w-6 h-6 ${isHome && !isScrolled ? 'text-white' : 'text-white'}`} />
					</div>
					<span class={`text-xl font-bold ${textColor}`}>Wanderlust</span>
				</a>
				<!-- Desktop Navigation -->
				<nav class="hidden md:flex items-center gap-8">
					{#each navLinks as link}
						<a href={link.page} class={`text-sm font-medium transition-colors ${isHome && !isScrolled ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{link.name}</a>
					{/each}
				</nav>
				<!-- Right Side -->
				<div class="flex items-center gap-3">
					{#if user}
						<button class={`rounded-full p-2 ${isHome && !isScrolled ? 'text-white hover:bg-white/20' : ''}`}><Bell class="w-5 h-5" /></button>
						<button class={`rounded-full p-2 ${isHome && !isScrolled ? 'text-white hover:bg-white/20' : ''}`}><BookMarked class="w-5 h-5" /></button>
						<!-- User Dropdown (simplified for Svelte) -->
						<div class="relative group">
							<button class="relative h-10 w-10 rounded-full ring-2 ring-amber-200">
								<img src={user.avatar} alt="avatar" class="h-10 w-10 rounded-full" />
							</button>
							<div class="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto z-50">
								<div class="px-3 py-2">
									<p class="text-sm font-medium">{user.full_name || 'Traveler'}</p>
									<p class="text-xs text-gray-500">{user.email}</p>
								</div>
								<div class="border-t my-1"></div>
								<a href="/auth/profile" class="flex items-center px-4 py-2 hover:bg-gray-100"><User class="w-4 h-4 mr-2" />My Profile</a>
								<a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100"><BookMarked class="w-4 h-4 mr-2" />My Bookmarks</a>
								<a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100"><Settings class="w-4 h-4 mr-2" />Settings</a>
								<a href="#" class="flex items-center px-4 py-2 hover:bg-gray-100 text-amber-600"><Crown class="w-4 h-4 mr-2" />Upgrade Plan</a>
								<div class="border-t my-1"></div>
								<button class="flex items-center px-4 py-2 w-full text-red-600 hover:bg-gray-100" on:click={() => auth.logout()}><LogOut class="w-4 h-4 mr-2" />Log Out</button>
							</div>
						</div>
					{:else}
						<button class={`hidden sm:flex rounded-full px-6 ${isHome && !isScrolled ? 'text-white hover:bg-white/20' : ''}`} on:click={() => goto('/auth/login')}>Sign In</button>
						<button class="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6" on:click={() => goto('/auth/login')}>Get Started</button>
					{/if}
					<!-- Mobile Menu (simplified) -->
					<button class={`md:hidden rounded-full p-2 ${isHome && !isScrolled ? 'text-white hover:bg-white/20' : ''}`}><Menu class="w-6 h-6" /></button>
				</div>
			</div>
		</div>
	</header>
	<!-- Main Content -->
	<main class="pt-20"> <slot /> </main>
	<!-- Footer -->
	<footer class="bg-gray-900 text-white py-16 px-4">
		<div class="max-w-7xl mx-auto">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-10">
				<div>
					<div class="flex items-center gap-2 mb-4">
						<div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
							<Compass class="w-6 h-6 text-white" />
						</div>
						<span class="text-xl font-bold">Wanderlust</span>
					</div>
					<p class="text-gray-400 text-sm">Your ultimate travel companion. Plan, explore, and share your adventures with fellow travelers worldwide.</p>
				</div>
				<div>
					<h4 class="font-semibold mb-4">Explore</h4>
					<ul class="space-y-2 text-gray-400 text-sm">
						<li><a href="#" class="hover:text-amber-400">Destinations</a></li>
						<li><a href="#" class="hover:text-amber-400">Forum</a></li>
						<li><a href="#" class="hover:text-amber-400">Travel Guides</a></li>
						<li><a href="#" class="hover:text-amber-400">Inspiration</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-semibold mb-4">Tools</h4>
					<ul class="space-y-2 text-gray-400 text-sm">
						<li><a href="#" class="hover:text-amber-400">Budget Calculator</a></li>
						<li><a href="#" class="hover:text-amber-400">Trip Planner</a></li>
						<li><a href="#" class="hover:text-amber-400">Reminders</a></li>
						<li><a href="#" class="hover:text-amber-400">Travel Notes</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-semibold mb-4">Company</h4>
					<ul class="space-y-2 text-gray-400 text-sm">
						<li><a href="#" class="hover:text-amber-400">About Us</a></li>
						<li><a href="#" class="hover:text-amber-400">Contact</a></li>
						<li><a href="#" class="hover:text-amber-400">Privacy Policy</a></li>
						<li><a href="#" class="hover:text-amber-400">Terms of Service</a></li>
					</ul>
				</div>
			</div>
			<div class="border-t border-gray-800 mt-10 pt-8 text-center text-gray-500 text-sm"></div>
		</div>
	</footer>
</div>
