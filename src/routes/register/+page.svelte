<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';
  
  export let form: ActionData;

  let email = '';
  let password = '';
  let confirmPassword = '';
  let firstName = '';
  let lastName = '';
  let error = '';
  let successMessage = '';
  let isLoading = false;
  let activeTab: 'user' | 'admin' = 'user';

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function validateEmail(email: string): boolean {
    return emailRegex.test(email);
  }

  function handleSubmit(event: SubmitEvent) {
    error = '';
    successMessage = '';
    
    if (!firstName.trim()) {
      error = 'First name is required';
      event.preventDefault();
      return;
    }

    if (!lastName.trim()) {
      error = 'Last name is required';
      event.preventDefault();
      return;
    }

    if (!validateEmail(email)) {
      error = 'Please enter a valid email address';
      event.preventDefault();
      return;
    }

    if (password.length < 8) {
      error = 'Password must be at least 8 characters long';
      event.preventDefault();
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      event.preventDefault();
      return;
    }

    if (activeTab === 'admin') {
      error = 'Admin registration is restricted. Please contact system administrator.';
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
          on:click={() => { activeTab = 'user'; error = ''; }}
        >
          User
        </button>
        <button
          type="button"
          class="flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border {activeTab === 'admin' ? 'bg-[#B5BD36] text-white border-[#B5BD36]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}"
          on:click={() => { 
            activeTab = 'admin'; 
            error = 'Admin registration is restricted. Please contact system administrator.';
          }}
        >
          Admin
        </button>
      </div>
      
      <div class="text-center mb-4 text-xs text-gray-600">
        {#if activeTab === 'user'}
          Register as a regular library user
        {:else}
          Admin registration is restricted
        {/if}
      </div>
    </div>

    <form
      method="POST"
      use:enhance={() => {
        isLoading = true;
        error = '';
        successMessage = '';
        
        return async ({ result }) => {
          isLoading = false;
          
          if (result.type === 'success') {
            if (result.data && typeof result.data.message === 'string') {
              successMessage = result.data.message;
            } else {
              successMessage = 'Registration successful! Please login with your credentials.';
            }
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          } else if (result.type === 'failure') {
            const errorMessage = result.data && typeof result.data.message === 'string' 
              ? result.data.message 
              : 'Registration failed';
            error = errorMessage;
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

      {#if successMessage}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{successMessage}</span>
        </div>
      {/if}

      {#if form?.message && !successMessage}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{form.message}</span>
        </div>
      {/if}

      <input type="hidden" name="type" value={activeTab} />

      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="sr-only">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              bind:value={firstName}
              class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B5BD36] focus:border-[#B5BD36] focus:z-10 sm:text-sm"
              placeholder="First Name"
              required
              disabled={activeTab === 'admin'}
            />
          </div>

          <div>
            <label for="lastName" class="sr-only">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              bind:value={lastName}
              class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B5BD36] focus:border-[#B5BD36] focus:z-10 sm:text-sm"
              placeholder="Last Name"
              required
              disabled={activeTab === 'admin'}
            />
          </div>
        </div>

        <div>
          <label for="email" class="sr-only">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            bind:value={email}
            class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B5BD36] focus:border-[#B5BD36] focus:z-10 sm:text-sm"
            placeholder="Email address"
            required
            disabled={activeTab === 'admin'}
          />
        </div>

        <div>
          <label for="password" class="sr-only">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            bind:value={password}
            class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B5BD36] focus:border-[#B5BD36] focus:z-10 sm:text-sm"
            placeholder="Password (min 8 characters)"
            required
            minlength="8"
            disabled={activeTab === 'admin'}
          />
        </div>

        <div>
          <label for="confirmPassword" class="sr-only">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            bind:value={confirmPassword}
            class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#B5BD36] focus:border-[#B5BD36] focus:z-10 sm:text-sm"
            placeholder="Confirm Password"
            required
            disabled={activeTab === 'admin'}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading || successMessage !== '' || activeTab === 'admin'}
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
            {activeTab === 'admin' ? 'Admin Registration Restricted' : 'Register'}
          {/if}
        </button>
      </div>

      <div class="text-sm text-center">
        <span class="text-gray-600">Already have an account?</span>
        <a href="/login" class="font-medium text-[#B5BD36] hover:text-[#9ca22f]">Log in</a>
      </div>
    </form>
  </div>
</div> 