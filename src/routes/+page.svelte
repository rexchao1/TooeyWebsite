<script>
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Credibility from '$lib/components/Credibility.svelte';
	import Features from '$lib/components/Features.svelte';
	import Hook from '$lib/components/Hook.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { meta, SITE_URL } from '$lib/config/site.js';
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content="{SITE_URL}/app-screenshot.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
</svelte:head>

<Nav />
<main id="main">
	<Hero />
	<Credibility />
	<Features />
	<Hook />
	<Faq />
</main>
<Footer />
