<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  // Define types for the login response
  interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string; 
    role: 'user' | 'admin';
  }
  
  interface SuccessResponse {
    success: boolean;
    user: User;
  }

  export let form: ActionData;

  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;
  let activeTab: 'user' | 'admin' = 'user';

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function validateEmail(email: string): boolean {
    return emailRegex.test(email);
  }

  function handleSubmit(event: SubmitEvent) {
    error = '';
    if (!validateEmail(email)) {
      error = 'Please enter a valid email address';
      event.preventDefault();
      return;
    }
    
    if (!password) {
      error = 'Password is required';
      event.preventDefault();
      return;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
    <div class="text-center">
      <div class="flex justify-center mb-4">
        <img src="/Logo.png" alt="E-Library Logo" class="h-20 w-auto" />
      </div>
      
    </div>

    <div class="relative">
      <div class="flex rounded-md shadow-sm mb-6" role="group">
        <button
          type="button"
          class="flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border {activeTab === 'user' ? 'bg-[#B5BD36] text-white border-[#B5BD36]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}"
          on:click={() => activeTab = 'user'}
        >
          User
        </button>
        <button
          type="button"
          class="flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border {activeTab === 'admin' ? 'bg-[#B5BD36] text-white border-[#B5BD36]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}"
          on:click={() => activeTab = 'admin'}
        >
          Admin
        </button>
      </div>
      
      <div class="text-center mb-4 text-xs text-gray-600">
        {#if activeTab === 'user'}
          For regular library users only
        {:else}
          For administrators only
        {/if}
      </div>
    </div>

    <form
      method="POST"
      use:enhance={() => {
        isLoading = true;
        error = '';
        
        return async ({ result }) => {
          isLoading = false;
          
          if (result.type === 'success') {
            const data = result.data as Partial<SuccessResponse>;
            if (data?.success && data.user) {
              if (data.user.role === 'admin') {
                window.location.href = '/admin';
              } else {
                window.location.href = '/books';
              }
            }
          } else if (result.type === 'failure') {
            error = typeof result.data?.error === 'string' 
              ? result.data.error 
              : 'Login failed';
          }
        };
      }}
      on:submit={handleSubmit}
      class="mt-4 space-y-6"
    >
      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{error}</span>
        </div>
      {/if}

      {#if form?.error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{form.error}</span>
        </div>
      {/if}

      <input type="hidden" name="type" value={activeTab} />

      <div class="space-y-4">
        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            bind:value={email}
            class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B5BD36] focus:border-[#B5BD36] focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            bind:value={password}
            class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B5BD36] focus:border-[#B5BD36] focus:z-10 sm:text-sm"
            placeholder="Password"
            minlength="8"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#B5BD36] hover:bg-[#9ca22f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B5BD36] disabled:opacity-50"
        >
          {#if isLoading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            Processing...
          {:else}
            {activeTab === 'admin' ? 'Admin Login' : 'User Login'}
          {/if}
        </button>
      </div>

      <div class="text-sm text-center">
        <span class="text-gray-600">Don't have an account?</span>
        <a href="/register" class="font-medium text-[#B5BD36] hover:text-[#9ca22f]">Sign up</a>
      </div>
    </form>
  </div>
</div> 