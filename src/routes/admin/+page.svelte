<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="min-h-screen bg-gray-100">
  <div class="flex">
    <!-- Sidebar -->
    <div class="w-64 bg-[#B5BD36] min-h-screen p-4">
      <div class="text-white">
        <h2 class="text-xl font-bold mb-6">Admin Dashboard</h2>
        <nav class="space-y-2">
          <a
            href="/admin"
            class="block py-2 px-4 rounded hover:bg-[#9ca22f] {$page.url.pathname === '/admin' ? 'bg-[#9ca22f]' : ''}"
          >
            Dashboard
          </a>
          <a
            href="/admin/users"
            class="block py-2 px-4 rounded hover:bg-[#9ca22f] {$page.url.pathname === '/admin/users' ? 'bg-[#9ca22f]' : ''}"
          >
            Users
          </a>
          <a
            href="/admin/books"
            class="block py-2 px-4 rounded hover:bg-[#9ca22f] {$page.url.pathname === '/admin/books' ? 'bg-[#9ca22f]' : ''}"
          >
            Books
          </a>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Stats Cards -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700">Total Users</h3>
          <p class="text-3xl font-bold text-[#B5BD36]">{data.stats.userCount}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700">Total Books</h3>
          <p class="text-3xl font-bold text-[#B5BD36]">{data.stats.bookCount}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700">Active Loans</h3>
          <p class="text-3xl font-bold text-[#B5BD36]">{data.stats.activeLoans}</p>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div class="text-gray-600">No recent activity</div>
      </div>
    </div>
  </div>
</div> 