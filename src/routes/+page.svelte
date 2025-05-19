<script lang="ts">
  import { page } from '$app/stores';
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Hero Section -->
  <div class="bg-white">
    <div class="container mx-auto px-4 py-16 sm:py-24">
      <div class="text-center">
        <div class="flex justify-center mb-8">
          <img src="/imgbook.png" alt="E-Library Logo" class="h-32 w-auto" />
        </div>
        <h1 class="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to E-Library
        </h1>
        <p class="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Your digital gateway to a world of knowledge. Browse our vast collection of books and start your reading journey today.
        </p>
        <div class="mt-10 flex justify-center gap-4">
          {#if !$page.data.session?.user}
            <a
              href="/login"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#B5BD36] hover:bg-[#9ca22f]"
            >
              Log in
            </a>
            <a
              href="/register"
              class="inline-flex items-center px-6 py-3 border border-[#B5BD36] text-base font-medium rounded-md text-[#B5BD36] bg-white hover:bg-gray-50"
            >
              Sign up
            </a>
          {:else}
            <a
              href={$page.data.session.user.role === 'admin' ? '/admin' : '/books'}
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#B5BD36] hover:bg-[#9ca22f]"
            >
              Go to Dashboard
            </a>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <div class="bg-gray-100 py-16">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Vast Collection</h3>
          <p class="text-gray-600">Access thousands of books across various genres and categories.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Easy Access</h3>
          <p class="text-gray-600">Read your favorite books anytime, anywhere with our digital platform.</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Smart Management</h3>
          <p class="text-gray-600">Keep track of your reading history and manage your book collection effortlessly.</p>
        </div>
      </div>
    </div>
  </div>
</div>
