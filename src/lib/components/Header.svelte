<script lang="ts">
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  export let user: {
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
  } | null = null;

  $: isAdminPage = $page.url.pathname.startsWith('/admin');

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


<header class="bg-gray-800 text-white py-2 px-4">
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-4">
      <img src="/logo.jpg" alt="E-Library Logo" class="h-10 w-auto" />
      <h1 class="text-xl font-bold">E-Library</h1>
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

</header> 