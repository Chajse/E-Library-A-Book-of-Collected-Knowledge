<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await invalidateAll();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
</script>

<div class="min-h-screen bg-gray-900">
  <!-- Header -->
  <header class="bg-gray-800 text-white py-2 px-4 sticky top-0 z-50 shadow-md">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <img src="/Logo.png" alt="E-Library Logo" class="h-10 w-auto" />
     
      </div>
      
      <div class="flex items-center space-x-4">
        {#if data.session?.user}
          <span class="text-sm">{data.session.user.firstName} {data.session.user.lastName}</span>
          <button
            on:click={handleLogout}
            class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm"
          >
            Logout
          </button>
        {/if}
      </div>
    </div>
  </header>

  <div class="flex h-full">
    <!-- Sidebar -->
    <div class="w-48 bg-[#B5BD36] min-h-screen sticky top-0 left-0">
      
      <nav class="py-4">
        <a href="/admin" class="block w-full px-4 py-3 text-white bg-[#a5ad26] flex items-center gap-2">
          <span class="material-icons">dashboard</span>
          Dashboard
        </a>
        <a href="/admin/users" class="block w-full px-4 py-3 text-white hover:bg-[#a5ad26] flex items-center gap-2">
          <span class="material-icons">people</span>
          Users
        </a>
        <a href="/admin/books" class="block w-full px-4 py-3 text-white hover:bg-[#a5ad26] flex items-center gap-2">
          <span class="material-icons">menu_book</span>
          List of Book
        </a>
        <a href="/admin/books/add" class="block w-full px-4 py-3 text-white hover:bg-[#a5ad26] flex items-center gap-2">
          <span class="material-icons">add_box</span>
          Add Book
        </a>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-[#FAF9E4] h-screen px-8 overflow-y-auto scrollbar-hide">
      <h1 class="text-2xl font-bold text-[#B5BD36] mt-6 mb-6">Admin Dashboard</h1>
      
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

      <!-- Quick Actions -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/users" class="bg-[#B5BD36] text-white p-4 rounded-lg flex flex-col items-center justify-center hover:bg-[#a5ad26] transition-colors">
            <span class="material-icons text-3xl mb-2">people</span>
            <span>Manage Users</span>
          </a>
          <a href="/admin/books/add" class="bg-[#B5BD36] text-white p-4 rounded-lg flex flex-col items-center justify-center hover:bg-[#a5ad26] transition-colors">
            <span class="material-icons text-3xl mb-2">add_box</span>
            <span>Add New Book</span>
          </a>
          <a href="/admin/books" class="bg-[#B5BD36] text-white p-4 rounded-lg flex flex-col items-center justify-center hover:bg-[#a5ad26] transition-colors">
            <span class="material-icons text-3xl mb-2">menu_book</span>
            <span>View Books</span>
          </a>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8 bg-white rounded-lg shadow p-6 mb-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        {#if data.recentActivity && data.recentActivity.length > 0}
          <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
            {#each data.recentActivity as activity}
              <div class="flex items-start p-3 border-l-4 {activity.type === 'added' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'} rounded-r-md">
                <div class="flex-shrink-0 mr-3">
                  <span class="inline-flex items-center justify-center h-8 w-8 rounded-full {activity.type === 'added' ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500'}">
                    <span class="material-icons text-xl">
                      {activity.type === 'added' ? 'add_circle' : 'edit'}
                    </span>
                  </span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">
                    {activity.type === 'added' ? 'New book added:' : 'Book updated:'} <span class="font-semibold">{activity.title}</span>
                  </div>
                  <div class="text-sm text-gray-600">
                    By {activity.author} in {activity.category}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {activity.timestamp}
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <a href="/admin/books/{activity.id}/edit" class="text-sm text-[#B5BD36] hover:text-[#a5ad26]">
                    View Details
                  </a>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-gray-600">No recent activity</div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style> 