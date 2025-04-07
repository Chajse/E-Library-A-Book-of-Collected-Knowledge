<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	
	const hideHeaderPaths = ['/', '/login', '/register'];
	const adminPaths = ['/admin', '/admin/users', '/admin/books', '/admin/books/add'];
	$: showHeader = !hideHeaderPaths.includes($page.url.pathname);
	$: isAdminPage = $page.url.pathname.startsWith('/admin');
</script>

{#if showHeader}
	<Header user={data.session?.user} />
{/if}

{#if isAdminPage}
	<main class="min-h-screen">
		<slot />
	</main>
{:else}
	<main class="min-h-screen bg-gray-50">
		<div class="container mx-auto px-4 py-8">
			<slot />
		</div>
	</main>
{/if}
