<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;
  export let form: any;

  let searchTerm = '';
  let activeTab = 'Users';
  let activeFilter = 'all';
  let showDeleteConfirm = false;
  let userToDelete: number | null = null;

  $: filteredUsers = data.users
    .filter(user => 
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeFilter === 'all' || 
       (activeFilter === 'admin' && user.role === 'admin') ||
       (activeFilter === 'user' && user.role === 'user'))
    );

  function confirmDelete(userId: number) {
    showDeleteConfirm = true;
    userToDelete = userId;
  }

  function cancelDelete() {
    showDeleteConfirm = false;
    userToDelete = null;
  }

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

<div class="min-h-screen bg-cream-50">
  <!-- Header -->
  <header class="bg-gray-800 text-white py-2 px-4 sticky top-0 z-50 shadow-md">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-4">
        <img src="/logo.jpg" alt="E-Library Logo" class="h-10 w-auto" />
        <h1 class="text-xl font-bold">E-Library Admin</h1>
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
        <a href="/admin" class="block w-full px-4 py-3 text-white hover:bg-[#a5ad26] flex items-center gap-2">
          <span class="material-icons">dashboard</span>
          Dashboard
        </a>
        <a href="/admin/users" class="block w-full px-4 py-3 text-white bg-[#a5ad26] flex items-center gap-2">
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
    <div class="flex-1 bg-[#FAF9E4] h-screen px-8 overflow-y-auto">
      <h1 class="text-2xl font-bold text-[#B5BD36] mt-6 mb-6">All Users</h1>
      
      {#if form?.message}
        <div class="{form.success ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded mb-4" role="alert">
          <span class="block sm:inline">{form.message}</span>
        </div>
      {/if}
      
      <div class="flex justify-between items-center mb-6">
        <div class="flex gap-2">
          <div class="relative">
            <select 
              bind:value={activeFilter}
              class="px-4 py-2 bg-[#B5BD36] text-white rounded-md appearance-none w-36"
            >
              <option value="all">Users</option>
              <option value="user">User Acc</option>
              <option value="admin">Admin Acc</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg class="w-4 h-4 fill-current text-white" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" fill-rule="evenodd"></path>
              </svg>
            </div>
          </div>
          
          <input 
            type="text" 
            placeholder="Search..." 
            bind:value={searchTerm}
            class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div class="bg-white shadow-md rounded-md overflow-hidden">
        <div class="max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Address
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each filteredUsers as user}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{user.username}</div>
                    <div class="text-xs text-gray-500">{user.role}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <form method="POST" action="?/toggleStatus" use:enhance>
                      <input type="hidden" name="id" value={user.id} />
                      <input type="hidden" name="currentStatus" value={user.active} />
                      <button type="submit" class="focus:outline-none">
                        {#if user.active}
                          <span class="px-4 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Activate
                          </span>
                        {:else}
                          <span class="px-4 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Inactivate
                          </span>
                        {/if}
                      </button>
                    </form>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex space-x-2">
                      <a href="/admin/users/{user.id}/edit" class="text-gray-500 hover:text-gray-700" aria-label="Edit user">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </a>
                      <button 
                        on:click={() => confirmDelete(user.id)} 
                        class="text-red-500 hover:text-red-700" 
                        aria-label="Delete user"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
      <p class="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          on:click={cancelDelete}
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <form 
          method="POST" 
          action="?/deleteUser" 
          use:enhance={() => {
            return async ({ result }) => {
              // Close the modal regardless of result
              showDeleteConfirm = false;
              userToDelete = null;
              
              // Invalidate all data to refresh the list
              await invalidateAll();
            };
          }}
        >
          <input type="hidden" name="id" value={userToDelete} />
          <button
            type="submit"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </form>
      </div>
    </div>
  </div>
{/if}

<style>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style> 