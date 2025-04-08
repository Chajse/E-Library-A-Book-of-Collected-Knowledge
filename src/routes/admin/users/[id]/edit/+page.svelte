<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  export let data: PageData;
  export let form: any;

  let email = data.user.email;
  let firstName = data.user.firstName;
  let lastName = data.user.lastName;
  let role = data.user.role;
  let password = '';
  let active = data.user.active === undefined ? true : data.user.active;
  let loading = false;
  let error = '';

  const isSelf = data.user.id === data.sessionUser?.id;
</script>

<div class="min-h-screen bg-cream-50">
  <div class="flex">
    <!-- Sidebar -->
    <div class="w-48 bg-[#B5BD36] min-h-screen">
      
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
    <div class="flex-1 bg-[#FAF9E4] min-h-screen px-8">
      <div class="flex justify-between items-center mt-6 mb-6">
        <h1 class="text-2xl font-bold text-[#B5BD36]">Edit User</h1>
        <a href="/admin/users" class="px-4 py-2 bg-[#B5BD36] text-white rounded">Back to Users</a>
      </div>
      
      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span class="block sm:inline">{error}</span>
        </div>
      {/if}

      {#if form?.error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span class="block sm:inline">{form.error}</span>
        </div>
      {/if}

      {#if form?.success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <span class="block sm:inline">{form.message}</span>
        </div>
      {/if}
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <form 
          method="POST" 
          use:enhance={() => {
            loading = true;
            error = '';
            
            return async ({ result }) => {
              loading = false;
              
              if (result.type === 'success') {
                // Redirect after a short delay
                setTimeout(() => {
                  goto('/admin/users');
                }, 1500);
              } else if (result.type === 'failure' && result.data?.error) {
                error = String(result.data.error);
              }
            };
          }}
          class="space-y-6"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                bind:value={email}
                required
                class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                bind:value={firstName}
                required
                class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                bind:value={lastName}
                required
                class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                id="role" 
                name="role" 
                bind:value={role}
                required
                disabled={isSelf}
                class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {#if isSelf}
                <p class="text-xs text-gray-500 mt-1">You cannot change your own role</p>
              {/if}
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                Password (leave blank to keep unchanged)
              </label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                bind:value={password}
                minlength="8"
                placeholder="Leave blank to keep unchanged"
                class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            <div class="flex items-center h-full">
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="active" 
                  name="active" 
                  class="h-4 w-4 text-[#B5BD36] focus:ring-[#B5BD36] border-gray-300 rounded"
                  bind:checked={active}
                  disabled={isSelf}
                />
                <label for="active" class="ml-2 block text-sm text-gray-700">
                  Active Account
                </label>
              </div>
              {#if isSelf}
                <p class="text-xs text-gray-500 ml-2">You cannot deactivate your own account</p>
              {/if}
            </div>
          </div>
          
          <div class="flex justify-end">
            <a 
              href="/admin/users" 
              class="mr-3 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B5BD36]"
            >
              Cancel
            </a>
            <button 
              type="submit"
              disabled={loading}
              class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#B5BD36] hover:bg-[#a5ad26] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B5BD36] disabled:opacity-50"
            >
              {#if loading}
                <span class="inline-block mr-2">
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Processing...
              {:else}
                Save Changes
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div> 