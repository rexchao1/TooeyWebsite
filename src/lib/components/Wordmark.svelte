<script>
	let { href = '/' } = $props();
</script>

<a {href} class="brand" aria-label="Tooey home">tooey<span class="dot">.</span></a>

<style>
	.brand {
		font-family: var(--font-display);
		font-size: 1.55rem;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.dot {
		color: var(--moss);
	}
</style>
