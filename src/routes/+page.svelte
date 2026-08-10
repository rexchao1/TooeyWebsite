<script>
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Credibility from '$lib/components/Credibility.svelte';
	import Features from '$lib/components/Features.svelte';
	import Hook from '$lib/components/Hook.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Tooey — Prep the right amount. Every day.</title>
	<meta
		name="description"
		content="AI forecasts how much of each item you'll sell — then hands your kitchen a prep list. Built for independent restaurants."
	/>
</svelte:head>

<Nav />
<main>
	<Hero />
	<Credibility />
	<Features />
	<Hook />
	<Faq />
</main>
<Footer />
