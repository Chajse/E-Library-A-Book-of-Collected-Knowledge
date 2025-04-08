<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { invalidateAll } from '$app/navigation';

  export let data: PageData;

  let searchTerm = '';
  let activeTab = 'All Books';
  let filterBy: 'All Books' | 'By Categories' | 'By Authors' = 'All Books';
  let showDeleteModal = false;
  let bookToDelete: any = null;
  let activeDropdown: number | null = null;

  $: filteredBooks = data.books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleTabClick(tab: 'All Books' | 'By Categories' | 'By Authors') {
    filterBy = tab;
    activeTab = tab;
  }

  function confirmDelete(book: any) {
    bookToDelete = book;
    showDeleteModal = true;
  }

  function cancelDelete() {
    showDeleteModal = false;
    bookToDelete = null;
  }

  function deleteBook() {
    if (!bookToDelete) return;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '?/deleteBook';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'id';
    input.value = bookToDelete.id.toString();
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    
    showDeleteModal = false;
    bookToDelete = null;
  }

  function toggleDropdown(bookId: number) {
    if (activeDropdown === bookId) {
      activeDropdown = null;
    } else {
      activeDropdown = bookId;
    }
  }

  // Close dropdown when clicking outside
  function handleClickOutside(event: MouseEvent) {
    if (activeDropdown !== null) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.dropdown-toggle')) {
        activeDropdown = null;
      }
    }
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

<svelte:window on:click={handleClickOutside} />

<div class="min-h-screen bg-gray-900 text-white">
  {#if showDeleteModal}
    <div class="fixed inset-0 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
        <div class="p-6">
          <div class="flex items-center justify-center mb-4">
            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div class="text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">ARE YOU SURE?</h3>
            <p class="text-sm text-gray-500">Do you want to delete this book?</p>
          </div>
        </div>
        <div class="bg-gray-100 px-4 py-3 flex justify-center gap-4">
          <button 
            type="button" 
            class="py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            on:click={cancelDelete}
          >
            CANCEL
          </button>
          <button 
            type="button" 
            class="py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
            on:click={deleteBook}
          >
            YES
          </button>
        </div>
      </div>
    </div>
  {/if}

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
        <a href="/admin/users" class="block w-full px-4 py-3 text-white hover:bg-[#a5ad26] flex items-center gap-2">
          <span class="material-icons">people</span>
          Users
        </a>
        <a href="/admin/books" class="block w-full px-4 py-3 text-white bg-[#a5ad26] flex items-center gap-2">
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
    <div class="flex-1 bg-[#FAF9E4] h-screen px-8 py-6 overflow-y-auto">
      <h1 class="text-2xl font-bold text-[#B5BD36] mb-6">List of Book</h1>
      
      <div class="flex justify-between items-center mb-6">
        <div class="flex space-x-2 mb-4">
          <button 
            class="px-4 py-2 rounded {activeTab === 'All Books' ? 'bg-[#B5BD36] text-white' : 'bg-gray-200 text-gray-700'}"
            on:click={() => handleTabClick('All Books')}
          >
            All Books
          </button>
          <button 
            class="px-4 py-2 rounded {activeTab === 'By Categories' ? 'bg-[#B5BD36] text-white' : 'bg-gray-200 text-gray-700'}"
            on:click={() => handleTabClick('By Categories')}
          >
            By Categories
          </button>
          <button 
            class="px-4 py-2 rounded {activeTab === 'By Authors' ? 'bg-[#B5BD36] text-white' : 'bg-gray-200 text-gray-700'}"
            on:click={() => handleTabClick('By Authors')}
          >
            By Authors
          </button>
        </div>
        
        <div class="relative">
          <input 
            type="text" 
            placeholder="Search..." 
            bind:value={searchTerm}
            class="px-4 py-2 rounded-md bg-gray-100 text-gray-700 w-60"
          />
        </div>
      </div>

      <div class="max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-hide pr-2">
        <div class="grid gap-6">
          {#each filteredBooks as book}
            <div class="bg-white shadow-md rounded-md overflow-hidden p-4">
              <div class="flex">
                <div class="w-32 h-40 bg-gray-200 mr-4 flex-shrink-0">
                  {#if book.coverImage}
                    <img src={book.coverImage} alt={book.title} class="w-full h-full object-cover" />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                      No Cover
                    </div>
                  {/if}
                </div>
                
                <div class="flex-1">
                  <div class="text-xs text-gray-500 uppercase mb-1">{book.category}</div>
                  <h3 class="text-lg font-bold text-gray-800 mb-1">{book.title}</h3>
                  <div class="text-sm text-gray-600 mb-2">{book.author}</div>
                  <p class="text-sm text-gray-700 mb-4 line-clamp-3">{book.description}</p>
                </div>
                
                <div class="flex-shrink-0 relative">
                  <button 
                    class="text-gray-400 dropdown-toggle"
                    on:click={() => toggleDropdown(book.id)}
                    aria-label="Options menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  {#if activeDropdown === book.id}
                    <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 dropdown-menu">
                      <div class="py-1">
                        <a 
                          href="/admin/books/{book.id}/edit" 
                          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit Details
                        </a>
                        <button 
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Archive Book
                        </button>
                        <button 
                          on:click={() => confirmDelete(book)}
                          class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete Book
                        </button>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
          
          {#if filteredBooks.length === 0}
            <div class="bg-white shadow-md rounded-md p-8 text-center">
              <p class="text-gray-500">No books found. Try a different search term or add a new book.</p>
              <a href="/admin/books/add" class="mt-4 inline-block px-4 py-2 bg-[#B5BD36] text-white rounded-md">
                Add New Book
              </a>
            </div>
          {/if}
        </div>
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