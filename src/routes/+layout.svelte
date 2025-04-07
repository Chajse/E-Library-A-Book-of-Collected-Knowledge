<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	
	const hideHeaderPaths = ['/', '/login', '/register'];
	$: showHeader = !hideHeaderPaths.includes($page.url.pathname);
</script>

{#if showHeader}
	<Header user={data.session?.user} />
{/if}

<main class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<slot />
	</div>
</main>
