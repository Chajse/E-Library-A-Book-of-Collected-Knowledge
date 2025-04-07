<script lang="ts">
  import { page } from '$app/stores';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="min-h-screen bg-gray-900">
  <div class="flex">
    <!-- Sidebar -->
    <div class="w-48 bg-[#B5BD36] min-h-screen">
      <button class="w-full px-4 py-2 text-white text-left hover:bg-[#a5ad26]">
        <span class="material-icons">arrow_back</span>
      </button>
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
    <div class="flex-1 bg-[#FAF9E4] min-h-screen px-8">
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
      <div class="mt-8 bg-white rounded-lg shadow p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <div class="text-gray-600">No recent activity</div>
      </div>
    </div>
  </div>
</div> 