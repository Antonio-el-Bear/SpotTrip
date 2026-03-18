<script lang="ts">
  export let active: string = '';
</script>
<nav class="navbar">
  <div class="navbar__logo">
    <a href="/">TravelRecord</a>
  </div>
  <ul class="navbar__links">
    <li><a href="/tours" class:active={active === 'tours'}>Search Trips</a></li>
    <li><a href="/ai-trip-builder" class:active={active === 'ai-trip-builder'}>AI Trip Builder</a></li>
    <li><a href="/members" class:active={active === 'members'}>Members</a></li>
    <li><a href="/leaderboard" class:active={active === 'leaderboard'}>Leaderboard</a></li>
    <li><a href="/dashboard" class:active={active === 'dashboard'}>Dashboard</a></li>
    <li><a href="/about" class:active={active === 'about'}>About</a></li>
  </ul>
  <div class="navbar__auth">
    <a href="/login" class="auth-link">Sign In</a>
    <a href="/register" class="auth-link auth-link--primary">Register</a>
  </div>
</nav>
<style>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  background: #181e2b;
  border-bottom: 1px solid #232946;
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar__logo a {
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffe478;
  text-decoration: none;
  letter-spacing: 0.04em;
}
.navbar__links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.navbar__links a {
  color: #f0f2f5;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  transition: background 0.15s;
}
.navbar__links a.active, .navbar__links a:hover {
  background: #232946;
  color: #ffe478;
}
.navbar__auth {
  display: flex;
  gap: 1rem;
}
.auth-link {
  color: #f0f2f5;
  text-decoration: none;
  font-weight: 600;
  padding: 0.3rem 0.9rem;
  border-radius: 0.3rem;
  transition: background 0.15s;
}
.auth-link--primary {
  background: #d4a017;
  color: #fff;
}
.auth-link--primary:hover {
  background: #ffe478;
  color: #232946;
}
</style>
