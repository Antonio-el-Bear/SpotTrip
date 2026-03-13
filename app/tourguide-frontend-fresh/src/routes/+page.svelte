
<style>
	main {
		min-height: 100vh;
		background: linear-gradient(135deg, #0033a0 0%, #fff 60%, #d90429 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 0;
	}
	.container {
		background: #fff;
		margin-top: 3rem;
		border-radius: 16px;
		box-shadow: 0 4px 24px #0033a033;
		padding: 2.5rem 2rem 2rem 2rem;
		max-width: 500px;
		width: 100%;
		border: 2px solid #0033a0;
	}
	h1 {
		color: #0033a0;
		text-align: center;
		margin-bottom: 1.5rem;
		font-size: 2.2rem;
		letter-spacing: 1px;
	}
	nav ul {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
		margin-bottom: 2rem;
		padding: 0;
		list-style: none;
	}
	nav a {
		background: #0033a0;
		color: #fff;
		padding: 0.6rem 1.2rem;
		border-radius: 6px;
		text-decoration: none;
		font-weight: bold;
		transition: background 0.2s;
	}
	nav a:hover {
		background: #d90429;
		color: #fff;
	}
	section {
		margin-top: 1.5rem;
		text-align: center;
	}
	h2 {
		color: #d90429;
		margin-bottom: 0.5rem;
	}
	.desc {
		color: #0033a0;
		margin-bottom: 0.5rem;
	}
</style>

<main>
	<div class="container">
		<h1>Welcome to TourGuide App</h1>
		<nav>
			<ul>
				<li><a href="/dashboard">Dashboard</a></li>
				<li><a href="/tours">Tours</a></li>
				<li><a href="/bookings">Bookings</a></li>
				<li><a href="/about">About</a></li>
				<li><a href="/contact">Contact</a></li>
				<li><a href="/auth/register">Register</a></li>
				<li><a href="/auth/login">Login</a></li>
				<li><a href="/auth/profile">Profile</a></li>
				<li><a href="/auth/roles">User Roles</a></li>
			</ul>
		</nav>
		<section>
			<h2>About</h2>
			<p class="desc">This is a full stack app with Django backend and SvelteKit frontend.</p>
			<p class="desc">Use the navigation above to get started. More features coming soon!</p>
		</section>
	</div>
</main>
