<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  export let data: PageData;
  export let form: any;

  let title = '';
  let author = '';
  let description = '';
  let category = '';
  let coverImage: File | null = null;
  let coverPreview: string | null = null;
  let loading = false;
  let error = '';

  function handleCoverChange(event: Event) {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      coverImage = file;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        coverPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
</script>

<div class="min-h-screen bg-gray-900 text-white">
  

  <div class="flex">
    <!-- Sidebar -->
    <div class="w-48 bg-[#B5BD36] min-h-screen">
    
      <nav class="py-4">
        <a href="/admin" class="block w-full px-4 py-3 text-white hover:bg-[#a5ad26] flex items-center gap-2">
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
        <a href="/admin/books/add" class="block w-full px-4 py-3 text-white bg-[#a5ad26] flex items-center gap-2">
          <span class="material-icons">add_box</span>
          Add Book
        </a>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 bg-[#FAF9E4] min-h-screen px-8 py-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-[#B5BD36]">Add Book Info</h1>
        <a href="/admin/books" class="px-4 py-2 bg-[#B5BD36] text-white rounded">Cancel</a>
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
          <span class="block sm:inline">Book added successfully!</span>
        </div>
      {/if}
      
      <div class="bg-white p-6 rounded-lg shadow-md">
        <form 
          method="POST" 
          enctype="multipart/form-data" 
          use:enhance={({ formData }) => {
            loading = true;
            error = '';
            
            // Make sure the file is included in the FormData
            if (coverImage) {
              // Remove any existing file input (it might be empty or invalid)
              formData.delete('coverImage');
              // Add the file explicitly
              formData.append('coverImage', coverImage, coverImage.name);
            }
            
            return async ({ result }) => {
              loading = false;
              
              if (result.type === 'success') {
                // Reset form
                title = '';
                author = '';
                description = '';
                category = '';
                coverPreview = null;
                coverImage = null;
                
                // Redirect after a short delay
                setTimeout(() => {
                  goto('/admin/books');
                }, 1500);
              } else if (result.type === 'failure' && result.data?.error) {
                error = String(result.data.error);
              }
            };
          }}
          class="space-y-6"
        >
          <div class="flex gap-6">
            <div class="w-1/3">
              <div class="bg-gray-100 aspect-[3/4] rounded flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden">
                {#if coverPreview}
                  <img src={coverPreview} alt="Cover preview" class="w-full h-full object-cover" />
                  <button 
                    type="button"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    on:click={() => { coverPreview = null; coverImage = null; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                {:else}
                  <div class="text-center p-4">
                    <div class="text-4xl text-gray-300 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span class="text-gray-500 block mb-2">Add Cover</span>
                    <input 
                      type="file" 
                      id="coverImage" 
                      name="coverImage" 
                      accept="image/*"
                      on:change={handleCoverChange} 
                      class="hidden" 
                    />
                    <label 
                      for="coverImage"
                      class="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#B5BD36] hover:bg-[#a5ad26]"
                    >
                      Browse...
                    </label>
                  </div>
                {/if}
              </div>
            </div>
            
            <div class="w-2/3 space-y-4 text-gray-800">
              <h2 class="text-lg font-medium text-[#B5BD36] mb-2">Book Details</h2>
              
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  bind:value={title}
                  required
                  class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter book title"
                />
              </div>
              
              <div>
                <label for="author" class="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input 
                  type="text" 
                  id="author" 
                  name="author" 
                  bind:value={author}
                  required
                  class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter author name"
                />
              </div>
              
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  bind:value={description}
                  rows="5"
                  class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter book description"
                ></textarea>
              </div>
              
              <div>
                <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  id="category" 
                  name="category" 
                  bind:value={category}
                  required
                  class="shadow-sm focus:ring-[#B5BD36] focus:border-[#B5BD36] block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="" disabled selected>Select a Category</option>
                  {#each data.categories as cat}
                    <option value={cat.name}>{cat.name}</option>
                  {/each}
                  <option value="SCIENCE">SCIENCE</option>
                  <option value="NATURE & WILDLIFE">NATURE & WILDLIFE</option>
                  <option value="HISTORY">HISTORY</option>
                  <option value="FICTION">FICTION</option>
                  <option value="TECHNOLOGY">TECHNOLOGY</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              class="px-6 py-2 bg-[#B5BD36] text-white rounded-md hover:bg-[#a5ad26] disabled:opacity-50"
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
                Add Book
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div> 