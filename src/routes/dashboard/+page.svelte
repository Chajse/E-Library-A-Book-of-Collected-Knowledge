<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-gray-100">
  <div class="flex">
    <!-- Sidebar -->
    <div class="w-64 bg-[#B5BD36] min-h-screen p-4">
      <div class="text-white">
        <h2 class="text-xl font-bold mb-6">User Dashboard</h2>
        <nav class="space-y-2">
          <a href="/dashboard" class="block py-2 px-4 rounded hover:bg-[#9ca22f] {$page.url.pathname === '/dashboard' ? 'bg-[#9ca22f]' : ''}">
            Dashboard
          </a>
          <a href="/dashboard/books" class="block py-2 px-4 rounded hover:bg-[#9ca22f] {$page.url.pathname === '/dashboard/books' ? 'bg-[#9ca22f]' : ''}">
            Browse Books
          </a>
          <a href="/dashboard/loans" class="block py-2 px-4 rounded hover:bg-[#9ca22f] {$page.url.pathname === '/dashboard/loans' ? 'bg-[#9ca22f]' : ''}">
            My Loans
          </a>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Stats Cards -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700">Active Loans</h3>
          <p class="text-3xl font-bold text-[#B5BD36]">0</p>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-700">Books Read</h3>
          <p class="text-3xl font-bold text-[#B5BD36]">0</p>
        </div>
      </div>

      <!-- Reading List -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">My Reading List</h3>
        <div class="text-gray-600">No books in your reading list</div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div class="text-gray-600">No recent activity</div>
      </div>
    </div>
  </div>
</div> 