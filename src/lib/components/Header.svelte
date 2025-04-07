<script lang="ts">
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  export let user: {
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
  } | null = null;

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

<header class="bg-gray-800 text-white p-4">
  <nav class="container mx-auto flex justify-between items-center">
    <div class="flex items-center space-x-4">
      <a href="/" class="text-xl font-bold">E-Library</a>
      {#if user}
        {#if user.role === 'admin'}
          <a
            href="/admin"
            class="hover:text-gray-300 {$page.url.pathname.startsWith('/admin') ? 'text-[#B5BD36]' : ''}"
          >
            Admin Dashboard
          </a>
        {:else}
          <a
            href="/dashboard"
            class="hover:text-gray-300 {$page.url.pathname.startsWith('/dashboard') ? 'text-[#B5BD36]' : ''}"
          >
            Dashboard
          </a>
        {/if}
        <a
          href="/books"
          class="hover:text-gray-300 {$page.url.pathname.startsWith('/books') ? 'text-[#B5BD36]' : ''}"
        >
          Books
        </a>
      {/if}
    </div>
    
    <div class="flex items-center space-x-4">
      {#if user}
        <span class="text-sm">{user.firstName} {user.lastName}</span>
        <button
          on:click={handleLogout}
          class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm"
        >
          Logout
        </button>
      {:else}
        <a
          href="/login"
          class="bg-[#B5BD36] hover:bg-[#9ca22f] px-4 py-2 rounded-md text-sm border-2 border-transparent"
          class:border-white={$page.url.pathname === '/login'}
        >
          Login
        </a>
        <a
          href="/register"
          class="bg-[#B5BD36] hover:bg-[#9ca22f] px-4 py-2 rounded-md text-sm border-2 border-transparent"
          class:border-white={$page.url.pathname === '/register'}
        >
          Register
        </a>
      {/if}
    </div>
  </nav>
</header>

<style>
  .active {
    @apply ring-2 ring-white;
  }
</style> 