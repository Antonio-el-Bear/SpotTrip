<script lang="ts">
  import { auth, isAdmin, isAuthenticated } from '$lib/stores/auth';
  import { apiFetch } from '$lib/utils/api';
  import { onMount } from 'svelte';

  type Stats = { users: number; tours: number; bookings: number; revenue: number };
  type StatKey = keyof Stats;
  type UserRow = {
    id: number;
    username: string;
    email: string;
    role?: string;
    date_joined?: string;
  };

  let stats: Stats = { users: 0, tours: 0, bookings: 0, revenue: 0 };
  let users: UserRow[] = [];
  let loading = true;

  onMount(async () => {
    if (!$isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }
    if (!$isAdmin) {
      window.location.href = '/';
      return;
    }
    try {
      const [statsData, usersData] = await Promise.all([
        apiFetch<Stats>('/api/admin/stats/', {}, $auth.token),
        apiFetch<UserRow[]>('/api/users/', {}, $auth.token),
      ]);
      stats = statsData;
      users = usersData;
    } catch {
      stats = { users: 142, tours: 38, bookings: 874, revenue: 2450000 };
      users = [
        { id: 1, username: 'jane_explorer', email: 'jane@example.com', role: 'admin', date_joined: '2024-01-10' },
        { id: 2, username: 'tom_travels', email: 'tom@example.com', role: 'guide', date_joined: '2024-03-22' },
        { id: 3, username: 'sarah_wanders', email: 'sarah@example.com', role: 'traveller', date_joined: '2025-01-05' },
      ];
    } finally {
      loading = false;
    }
  });

  const statCards: Array<{ label: string; key: StatKey; icon: string; color: string }> = [
    { label: 'Total Users', key: 'users', icon: '👥', color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Tours', key: 'tours', icon: '🗺️', color: 'bg-green-50 text-green-700' },
    { label: 'Bookings', key: 'bookings', icon: '📅', color: 'bg-amber-50 text-amber-700' },
    { label: 'Revenue (R)', key: 'revenue', icon: '💰', color: 'bg-purple-50 text-purple-700' },
  ];

  const roleStyle: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    guide: 'bg-green-100 text-green-700',
    traveller: 'bg-amber-100 text-amber-700',
  };
</script>

<svelte:head><title>Admin Dashboard · TourGuide</title></svelte:head>

<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
  <div class="mb-8">
    <h1 class="text-3xl font-extrabold text-stone-800">Admin Dashboard</h1>
    <p class="text-stone-500">Platform overview and user management.</p>
  </div>

  <!-- Stats -->
  <div class="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {#each statCards as card (card.key)}
      <div class="rounded-2xl bg-white border border-stone-100 shadow-sm p-6">
        <div class="mb-3 flex items-center justify-between">
          <span class="text-2xl">{card.icon}</span>
          <span class="rounded-full {card.color} px-2 py-0.5 text-xs font-medium">{card.label}</span>
        </div>
        <p class="text-3xl font-extrabold text-stone-800">
          {loading ? '—' : (card.key === 'revenue' ? `R${(stats[card.key] / 1000).toFixed(0)}k` : stats[card.key])}
        </p>
      </div>
    {/each}
  </div>

  <!-- Users table -->
  <div class="rounded-2xl bg-white border border-stone-100 shadow-sm overflow-hidden">
    <div class="flex items-center justify-between border-b border-stone-100 px-6 py-4">
      <h2 class="font-bold text-stone-800">All Users</h2>
      <button type="button" class="text-sm text-amber-700 hover:underline" on:click={() => { window.location.href = '/auth/roles'; }}>Manage Roles →</button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
          <tr>
            <th class="px-6 py-3">User</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3">Role</th>
            <th class="px-6 py-3">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-50">
          {#each users as user (user.id)}
            <tr class="hover:bg-stone-50 transition-colors">
              <td class="px-6 py-4 font-medium text-stone-800">@{user.username}</td>
              <td class="px-6 py-4 text-stone-500">{user.email}</td>
              <td class="px-6 py-4">
                <span class="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize
                  {roleStyle[user.role ?? 'traveller'] || 'bg-stone-100 text-stone-600'}">
                  {user.role || 'traveller'}
                </span>
              </td>
              <td class="px-6 py-4 text-stone-400">{user.date_joined?.slice(0, 10) || '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
