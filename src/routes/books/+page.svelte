<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;
  export let form: any;
  
  let searchTerm = '';
  let showCategories = false;
  let selectedCategory = 'all';
  let sortBy: 'Title' | 'Date Published' | 'Author' = 'Title';
  
  // Check if we're viewing a specific book
  $: currentBook = data.book || null;
  $: isBookView = !!currentBook;
  
  // Check if we're viewing a specific section in "See More" mode
  $: activeSection = data.activeSection || null;
  $: showingAll = data.showAll || false;
  
  // Initialize with all books
  let allBooks = data.allBooks || [];
  let filteredBooks = allBooks;
  let sortedBooks = filteredBooks;
  
  // Get all available categories from the data
  $: categories = Object.keys(data.books || {}).map(cat => ({
    id: cat,
    name: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  // Get favorites
  $: favoriteBooks = data.favorites || [];

  // Get bookmarks
  $: bookmarkedBooks = data.bookmarks || [];

  // Get recommended books
  $: recommendedBooks = data.recommended || [];

  // Get popular books
  $: popularBooks = data.popular || [];

  onMount(() => {
    // If we have a success message from form submission
    if (form?.success) {
      // If there's a redirect URL, go to it
      if (form.redirectUrl) {
        goto(form.redirectUrl);
      }
    }
  });

  // Handle user logout
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

  // Filter books based on search term and selected category
  $: {
    // First get books from the selected category or all books
    const booksToFilter = selectedCategory === 'all' 
      ? data.allBooks || []
      : ((data.books && data.books[selectedCategory]) || []);
    
    // Then apply the search filter
    filteredBooks = booksToFilter.filter(book =>
      !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort books based on selected criteria
  $: {
    sortedBooks = [...filteredBooks].sort((a, b) => {
      switch (sortBy) {
        case 'Title':
          return a.title.localeCompare(b.title);
        case 'Author':
          return a.author.localeCompare(b.author);
        case 'Date Published':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }

  function toggleCategories() {
    showCategories = !showCategories;
  }
  
  function selectCategory(category: string) {
    selectedCategory = category;
    showCategories = false;
  }
  
  function viewBookDetails(bookId: number) {
    goto(`/books?id=${bookId}`);
  }
  
  function goBack() {
    goto('/books');
  }
  
  function seeMoreSection(section: string) {
    goto(`/books?section=${section}&showAll=true`);
  }
</script>

{#if isBookView && currentBook}
  <!-- Book Details View -->
  <div class="min-h-screen bg-[#FAF9E4] w-full px-6 py-4">
    <div class="bg-white rounded-lg shadow-md overflow-hidden w-full">
      <div class="flex flex-col md:flex-row relative w-full">
        <!-- Back Button -->
        <button 
          on:click={goBack}
          class="absolute top-4 left-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        <!-- Book Cover -->
        <div class="md:w-1/3 p-8">
          <img 
            src={currentBook.coverImage || '/default-book-cover.jpg'} 
            alt={currentBook.title}
            class="w-full h-auto object-cover rounded-lg shadow-md mx-auto"
            style="max-height: 400px;"
          />
          
          <!-- Action Buttons Container -->
          <div class="mt-6 flex flex-col gap-3">
            <!-- Bookmark Button -->
            <form
              method="POST"
              action="?/toggleBookmark"
              use:enhance
            >
              <input type="hidden" name="bookId" value={currentBook.id} />
              <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
              <button 
                type="submit"
                class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-[#B5BD36] text-white rounded-md hover:bg-[#9ca22f] transition-colors"
              >
                {#if currentBook.isBookmarked}
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                  </svg>
                  Remove Bookmark
                {:else}
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                  Bookmark
                {/if}
              </button>
            </form>
            
            <!-- Continue Reading Button -->
            <button 
              class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-[#B5BD36] text-white rounded-md hover:bg-[#9ca22f] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Continue Reading
            </button>
            
            <!-- Favorite Button -->
            <form
              method="POST"
              action="?/toggleFavorite"
              use:enhance
            >
              <input type="hidden" name="bookId" value={currentBook.id} />
              <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
              <button 
                type="submit"
                class="w-full inline-flex items-center justify-center px-4 py-2.5 bg-white border border-[#B5BD36] text-[#B5BD36] rounded-md hover:bg-gray-50 transition-colors"
              >
                {#if currentBook.isFavorite}
                  <svg class="w-5 h-5 mr-2 text-red-500 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Remove from Favorites
                {:else}
                  <svg class="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to Favorites
                {/if}
              </button>
            </form>
          </div>
        </div>
        
        <!-- Book Details -->
        <div class="md:w-2/3 p-8 flex flex-col">
          <div>
            <div class="text-sm text-gray-500 uppercase mb-1 font-medium">{currentBook.category}</div>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{currentBook.title}</h1>
            <p class="text-lg text-gray-600 mb-6">by {currentBook.author}</p>
            
            <div class="border-t border-b border-gray-200 py-6 my-6">
              <h2 class="text-xl font-semibold text-gray-700 mb-3">Description</h2>
              <p class="text-gray-600 leading-relaxed">
                {currentBook.description || 'No description available.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if activeSection}
  <!-- "See More" View for specific section -->
  <div class="min-h-screen bg-[#FAF9E4] w-full">
    <!-- Header -->
    <header class="bg-[#E8E4C9] py-4 px-6 flex justify-between items-center mb-8 w-full sticky top-0 z-50 shadow-md">
      <div class="flex items-center gap-4">
        <img src="/logo.jpg" alt="E-Library Logo" class="h-10 w-auto" />
        <h1 class="text-xl font-semibold">E-Library</h1>
      </div>
      <div class="flex items-center gap-6">
        <div class="relative">
          <button 
            on:click={toggleCategories}
            class="text-[#B5BD36] hover:text-[#9ca22f] font-medium"
          >
            Browse
            <span class="ml-1">▼</span>
          </button>
          
          {#if showCategories}
            <div class="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
              <div class="space-y-2">
                <button 
                  on:click={() => selectCategory('all')}
                  class="block w-full text-left px-2 py-1 rounded {selectedCategory === 'all' ? 'bg-[#B5BD36] text-white' : 'text-gray-700 hover:bg-gray-100'}"
                >
                  All Books
                </button>
                
                {#each categories as category}
                  <button 
                    on:click={() => selectCategory(category.id)}
                    class="block w-full text-left px-2 py-1 rounded {selectedCategory === category.id ? 'bg-[#B5BD36] text-white' : 'text-gray-700 hover:bg-gray-100'}"
                  >
                    {category.name}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <div class="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            bind:value={searchTerm}
            class="px-4 py-2 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5BD36] w-64"
          />
          <button class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {#if data.session?.user}
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-700">{data.session.user.firstName} {data.session.user.lastName}</span>
            <button
              on:click={handleLogout}
              class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm text-white"
            >
              Logout
            </button>
          </div>
        {/if}
      </div>
    </header>

    <div class="px-6 py-4">
      <!-- Section Header with Back Button -->
      <div class="flex items-center gap-4 mb-8">
      <button 
        on:click={goBack}
          class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
        <h1 class="text-2xl font-bold text-gray-800">
        {#if activeSection === 'favorites'}
          My Favorites
        {:else if activeSection === 'bookmarks'}
          My Bookmarks  
        {:else if activeSection === 'recommended'}
          Recommended For You
        {:else if activeSection === 'popular'}
          Popular Books
        {:else}
          All Books
        {/if}
      </h1>
    </div>
    
      
      
      <!-- Grid of Books -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {#if activeSection === 'favorites' && data.favorites}
        {#each data.favorites as book}
          <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
              <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl bg-white">
              <img 
                src={book.coverImage || '/default-book-cover.jpg'} 
                alt={book.title}
                  class="w-full h-64 object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Favorite Button -->
              <form
                method="POST"
                action="?/toggleFavorite"
                use:enhance
                  class="absolute top-2 right-2"
              >
                <input type="hidden" name="bookId" value={book.id} />
                <button 
                  type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  on:click|stopPropagation
                >
                  <svg 
                      class="h-6 w-6 {book.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg" 
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </form>
                
                <!-- Bookmark Button -->
                <form
                  method="POST"
                  action="?/toggleBookmark"
                  use:enhance
                  class="absolute top-2 right-14"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      class="h-6 w-6 {book.isBookmarked ? 'text-[#B5BD36] fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                    </svg>
                  </button>
                </form>
                
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 truncate">{book.title}</h3>
                  <p class="text-sm text-gray-600 truncate">{book.author}</p>
                  <div class="text-xs uppercase tracking-wider mt-1 text-[#B5BD36]">{book.category}</div>
              </div>
            </div>
          </div>
        {/each}
      {:else if activeSection === 'bookmarks' && data.bookmarks}
        {#each data.bookmarks as book}
          <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
              <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl bg-white">
              <img 
                src={book.coverImage || '/default-book-cover.jpg'} 
                alt={book.title}
                  class="w-full h-64 object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Favorite Button -->
                <form
                  method="POST"
                  action="?/toggleFavorite"
                  use:enhance
                  class="absolute top-2 right-2"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      class="h-6 w-6 {book.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </form>
                
                <!-- Bookmark Button -->
              <form
                method="POST"
                action="?/toggleBookmark"
                use:enhance
                  class="absolute top-2 right-14"
              >
                <input type="hidden" name="bookId" value={book.id} />
                <button 
                  type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                  on:click|stopPropagation
                >
                    <svg 
                      class="h-6 w-6 {book.isBookmarked ? 'text-[#B5BD36] fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                  </svg>
                </button>
              </form>
                
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 truncate">{book.title}</h3>
                  <p class="text-sm text-gray-600 truncate">{book.author}</p>
                  <div class="text-xs uppercase tracking-wider mt-1 text-[#B5BD36]">{book.category}</div>
              </div>
              </div>
            </div>
          {/each}
        {:else if activeSection === 'recommended' && data.recommended}
          {#each data.recommended as book}
            <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
              <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl bg-white">
                <img 
                  src={book.coverImage || '/default-book-cover.jpg'} 
                  alt={book.title}
                  class="w-full h-64 object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Favorite Button -->
                <form
                  method="POST"
                  action="?/toggleFavorite"
                  use:enhance
                  class="absolute top-2 right-2"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      class="h-6 w-6 {book.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg" 
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </button>
                </form>
                
                <!-- Bookmark Button -->
                <form
                  method="POST"
                  action="?/toggleBookmark"
                  use:enhance
                  class="absolute top-2 right-14"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      class="h-6 w-6 {book.isBookmarked ? 'text-[#B5BD36] fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                    </svg>
                  </button>
                </form>
                
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 truncate">{book.title}</h3>
                  <p class="text-sm text-gray-600 truncate">{book.author}</p>
                  <div class="text-xs uppercase tracking-wider mt-1 text-[#B5BD36]">{book.category}</div>
                </div>
              </div>
            </div>
          {/each}
        {:else if activeSection === 'popular' && data.popular}
          {#each data.popular as book}
            <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
              <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl bg-white">
                <img 
                  src={book.coverImage || '/default-book-cover.jpg'} 
                  alt={book.title}
                  class="w-full h-64 object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Favorite Button -->
                <form
                  method="POST"
                  action="?/toggleFavorite"
                  use:enhance
                  class="absolute top-2 right-2"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      class="h-6 w-6 {book.isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg" 
                    >
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                  </button>
                </form>
                
                <!-- Bookmark Button -->
                <form
                  method="POST"
                  action="?/toggleBookmark"
                  use:enhance
                  class="absolute top-2 right-14"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      class="h-6 w-6 {book.isBookmarked ? 'text-[#B5BD36] fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                    </svg>
                  </button>
                </form>
                
                <div class="p-4">
                  <h3 class="font-semibold text-gray-800 truncate">{book.title}</h3>
                  <p class="text-sm text-gray-600 truncate">{book.author}</p>
                  <div class="text-xs uppercase tracking-wider mt-1 text-[#B5BD36]">{book.category}</div>
                </div>
              </div>
            </div>
          {/each}
      {/if}
    </div>
    
    {#if (activeSection === 'favorites' && (!data.favorites || data.favorites.length === 0)) || 
           (activeSection === 'bookmarks' && (!data.bookmarks || data.bookmarks.length === 0)) ||
           (activeSection === 'recommended' && (!data.recommended || data.recommended.length === 0)) ||
           (activeSection === 'popular' && (!data.popular || data.popular.length === 0))}
      <div class="text-center py-12 bg-white rounded-lg shadow-md mt-4">
        <p class="text-gray-500">
            {#if activeSection === 'favorites'}
              You have no favorites yet. Add books to your favorites to see them here.
            {:else if activeSection === 'bookmarks'}
              You have no bookmarks yet. Bookmark books to track your reading progress.
            {:else if activeSection === 'recommended'}
              No recommended books available at the moment.
            {:else if activeSection === 'popular'}
              No popular books available at the moment.
            {/if}
        </p>
      </div>
    {/if}
    </div>
  </div>
{:else}
  <!-- Main Books View -->
  <div class="min-h-screen bg-[#FAF9E4] w-full">
    <!-- Header -->
    <header class="bg-[#E8E4C9] py-4 px-6 flex justify-between items-center mb-8 w-full sticky top-0 z-50 shadow-md">
      <div class="flex items-center gap-4">
        <img src="/logo.jpg" alt="E-Library Logo" class="h-10 w-auto" />
        <h1 class="text-xl font-semibold">E-Library</h1>
      </div>
      <div class="flex items-center gap-6">
        <div class="relative">
          <button 
            on:click={toggleCategories}
            class="text-[#B5BD36] hover:text-[#9ca22f] font-medium"
          >
            Browse
            <span class="ml-1">▼</span>
          </button>
          
          {#if showCategories}
            <div class="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
              <div class="space-y-2">
                <button 
                  on:click={() => selectCategory('all')}
                  class="block w-full text-left px-2 py-1 rounded {selectedCategory === 'all' ? 'bg-[#B5BD36] text-white' : 'text-gray-700 hover:bg-gray-100'}"
                >
                  All Books
                </button>
                
                {#each categories as category}
                  <button 
                    on:click={() => selectCategory(category.id)}
                    class="block w-full text-left px-2 py-1 rounded {selectedCategory === category.id ? 'bg-[#B5BD36] text-white' : 'text-gray-700 hover:bg-gray-100'}"
                  >
                    {category.name}
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <div class="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            bind:value={searchTerm}
            class="px-4 py-2 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#B5BD36] w-64"
          />
          <button class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        {#if data.session?.user}
          <div class="flex items-center gap-4">
            <span class="text-sm text-gray-700">{data.session.user.firstName} {data.session.user.lastName}</span>
            <button
              on:click={handleLogout}
              class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm text-white"
            >
              Logout
            </button>
          </div>
        {/if}
      </div>
    </header>

    <div class="px-6 py-8 w-full">
      
      
      <!-- Favorites Section -->
      {#if favoriteBooks.length > 0}
        <section class="mb-10 bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-[#E8E4C9] p-4 mb-0 flex justify-between items-center">
            <h2 class="text-xl font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              Favorites
            </h2>
            <button 
              on:click={() => seeMoreSection('favorites')}
              class="text-[#B5BD36] hover:text-[#9ca22f]"
            >
              See More
            </button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6">
            {#each favoriteBooks.slice(0, 5) as book}
              <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
                <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  <img 
                    src={book.coverImage || '/default-book-cover.jpg'} 
                    alt={book.title}
                    class="w-full h-56 object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <form
                    method="POST"
                    action="?/toggleFavorite"
                    use:enhance
                  >
                    <input type="hidden" name="bookId" value={book.id} />
                    <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                    <button 
                      type="submit"
                      class="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      on:click|stopPropagation
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-6 w-6 text-red-500 {book.isFavorite ? 'fill-current' : ''}" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                    </button>
                  </form>
                  <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 class="font-semibold truncate">{book.title}</h3>
                    <p class="text-sm truncate">{book.author}</p>
                    <div class="text-xs uppercase tracking-wider mt-1 opacity-70">{book.category}</div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {:else}
        <section class="mb-10 bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-[#E8E4C9] p-4 mb-0 flex justify-between items-center">
            <h2 class="text-xl font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
              Favorites
            </h2>
          </div>
          <div class="p-8 text-center text-gray-600">
            <p>You haven't added any books to your favorites yet.</p>
            <p class="mt-2">Click the heart icon on any book to add it to your favorites.</p>
          </div>
        </section>
      {/if}
      
      <!-- Bookmarks Section -->
      {#if bookmarkedBooks.length > 0}
        <section class="mb-10 bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-[#E8E4C9] p-4 mb-0 flex justify-between items-center">
            <h2 class="text-xl font-semibold flex items-center">
              <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
              </svg>
              Bookmarks
            </h2>
            <button 
              on:click={() => seeMoreSection('bookmarks')}
              class="text-[#B5BD36] hover:text-[#9ca22f]"
            >
              See More
            </button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6">
            {#each bookmarkedBooks.slice(0, 5) as book}
              <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
                <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  <img 
                    src={book.coverImage || '/default-book-cover.jpg'} 
                    alt={book.title}
                    class="w-full h-56 object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <form
                    method="POST"
                    action="?/toggleBookmark"
                    use:enhance
                  >
                    <input type="hidden" name="bookId" value={book.id} />
                    <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                    <button 
                      type="submit"
                      class="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove bookmark"
                      on:click|stopPropagation
                    >
                      <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                      </svg>
                    </button>
                  </form>
                  <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 class="font-semibold truncate">{book.title}</h3>
                    <p class="text-sm truncate">{book.author}</p>
                    <div class="text-xs uppercase tracking-wider mt-1 opacity-70">{book.category}</div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {:else}
        <section class="mb-10 bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-[#E8E4C9] p-4 mb-0 flex justify-between items-center">
            <h2 class="text-xl font-semibold flex items-center">
              <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
              </svg>
              Bookmarks
            </h2>
          </div>
          <div class="p-8 text-center text-gray-600">
            <p>You haven't bookmarked any books yet.</p>
            <p class="mt-2">Click the bookmark icon on any book to track your reading progress.</p>
          </div>
        </section>
      {/if}

      <!-- Recommendation Section -->
      {#if recommendedBooks.length > 0}
        <section class="mb-10 bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-[#E8E4C9] p-4 mb-0 flex justify-between items-center">
            <h2 class="text-xl font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Recommended for You</span>
            </h2>
            <button 
              on:click={() => seeMoreSection('recommended')}
              class="text-[#B5BD36] hover:text-[#9ca22f]"
            >
              See More
            </button>
          </div>
          <div class="px-6 pt-2 pb-0">
            <p class="text-sm text-gray-600 italic">Books suggested based on your reading preferences and favorite categories</p>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6">
            {#each recommendedBooks.slice(0, 5) as book}
              <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
                <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  <img 
                    src={book.coverImage || '/default-book-cover.jpg'} 
                    alt={book.title}
                    class="w-full h-56 object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <!-- Favorite Button -->
                  <form
                    method="POST"
                    action="?/toggleFavorite"
                    use:enhance
                  >
                    <input type="hidden" name="bookId" value={book.id} />
                    <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                    <button 
                      type="submit"
                      class="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      on:click|stopPropagation
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-6 w-6 text-red-500 {book.isFavorite ? 'fill-current' : ''}" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                    </button>
                  </form>
                  
                  <!-- Bookmark Button -->
                  <form
                    method="POST"
                    action="?/toggleBookmark"
                    use:enhance
                    class="absolute top-2 left-2"
                  >
                    <input type="hidden" name="bookId" value={book.id} />
                    <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                    <button 
                      type="submit"
                      class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      on:click|stopPropagation
                    >
                      <svg 
                        class="h-6 w-6 {book.isBookmarked ? 'text-[#B5BD36] fill-current' : 'text-gray-600'}" 
                        viewBox="0 0 20 20" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                      </svg>
                    </button>
                  </form>
                  
                  <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <h3 class="font-semibold truncate">{book.title}</h3>
                    <p class="text-sm truncate">{book.author}</p>
                    <div class="text-xs uppercase tracking-wider mt-1 opacity-70">{book.category}</div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Popular Section -->
      {#if popularBooks.length > 0}
        <section class="mb-10 bg-white shadow-md rounded-lg overflow-hidden">
          <div class="bg-[#E8E4C9] p-4 mb-0 flex justify-between items-center">
            <h2 class="text-xl font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd" />
              </svg>
              <span>Popular Now</span>
            </h2>
            <button 
              on:click={() => seeMoreSection('popular')}
              class="text-[#B5BD36] hover:text-[#9ca22f]"
            >
              See More
            </button>
          </div>
          <div class="px-6 pt-2 pb-0">
            <p class="text-sm text-gray-600 italic">Most favorited and bookmarked books by our community</p>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6">
            {#each popularBooks.slice(0, 5) as book}
              <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
                <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  <img 
                    src={book.coverImage || '/default-book-cover.jpg'} 
                    alt={book.title}
                    class="w-full h-56 object-cover"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <!-- Favorite Button -->
                  <form
                    method="POST"
                    action="?/toggleFavorite"
                    use:enhance
                  >
                    <input type="hidden" name="bookId" value={book.id} />
                    <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                    <button 
                      type="submit"
                      class="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      on:click|stopPropagation
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        class="h-6 w-6 text-red-500 {book.isFavorite ? 'fill-current' : ''}" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          stroke-linecap="round" 
                          stroke-linejoin="round" 
                          stroke-width="2" 
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                      </svg>
                    </button>
                  </form>
                  
                  <!-- Bookmark Button -->
                  <form
                    method="POST"
                    action="?/toggleBookmark"
                    use:enhance
                    class="absolute top-2 left-2"
                  >
                    <input type="hidden" name="bookId" value={book.id} />
                    <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                    <button 
                      type="submit"
                      class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      on:click|stopPropagation
                    >
                      <svg 
                        class="h-6 w-6 {book.isBookmarked ? 'text-[#B5BD36] fill-current' : 'text-gray-600'}" 
                        viewBox="0 0 20 20" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                      </svg>
                    </button>
                  </form>
                  
                  <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 class="font-semibold truncate">{book.title}</h3>
                    <p class="text-sm truncate">{book.author}</p>
                    <div class="text-xs uppercase tracking-wider mt-1 opacity-70">{book.category}</div>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- All Books or Filtered Books Section -->
      <section class="mb-10 bg-white shadow-md rounded-lg overflow-hidden">
        <div class="bg-[#E8E4C9] p-4 mb-0 flex justify-between items-center">
          <h2 class="text-xl font-semibold">
            {selectedCategory === 'all' ? 'All Books' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
          </h2>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">Sort by:</span>
            <select 
              bind:value={sortBy}
              class="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B5BD36] bg-white"
            >
              <option>Title</option>
              <option>Date Published</option>
              <option>Author</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6">
          {#each sortedBooks as book}
            <div class="relative group cursor-pointer" on:click={() => viewBookDetails(book.id)}>
              <div class="overflow-hidden rounded-lg shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                <img 
                  src={book.coverImage || '/default-book-cover.jpg'} 
                  alt={book.title}
                  class="w-full h-56 object-cover"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <!-- Favorite Button -->
                <form
                  method="POST"
                  action="?/toggleFavorite"
                  use:enhance
                  class="absolute top-2 right-2"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      class="h-6 w-6 text-red-500 {book.isFavorite ? 'fill-current' : ''}" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        stroke-width="2" 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  </button>
                </form>
                
                <!-- Bookmark Button -->
                <form
                  method="POST"
                  action="?/toggleBookmark"
                  use:enhance
                  class="absolute top-2 left-2"
                >
                  <input type="hidden" name="bookId" value={book.id} />
                  <input type="hidden" name="redirectUrl" value={$page.url.pathname + $page.url.search} />
                  <button 
                    type="submit"
                    class="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    on:click|stopPropagation
                  >
                    <svg 
                      class="h-6 w-6 {book.isBookmarked ? 'text-[#B5BD36] fill-current' : 'text-gray-600'}" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path>
                    </svg>
                  </button>
                </form>
                
                <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 class="font-semibold truncate">{book.title}</h3>
                  <p class="text-sm truncate">{book.author}</p>
                  <div class="text-xs uppercase tracking-wider mt-1 opacity-70">{book.category}</div>
                </div>
              </div>
            </div>
          {/each}
        </div>

        {#if sortedBooks.length === 0}
          <div class="text-center py-8 bg-white p-6">
            <p class="text-gray-500 py-12">No books found matching your search criteria.</p>
          </div>
        {/if}
      </section>
    </div>
  </div>
{/if} 