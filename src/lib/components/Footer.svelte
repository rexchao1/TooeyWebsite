<script>
	import Wordmark from './Wordmark.svelte';
	import { footer } from '$lib/config/site.js';
</script>

<footer>
	<div class="container bar">
		<Wordmark />

		<nav aria-label="Footer">
			{#each footer.links as link (link.label)}
				<a href={link.href}>{link.label}</a>
			{/each}
		</nav>

		<p class="note">{footer.note}</p>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line);
		padding-block: 2rem;
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	nav {
		display: flex;
		gap: 1.8rem;
	}

	nav a {
		font-size: 0.95rem;
		color: var(--muted);
	}

	nav a:hover {
		color: var(--ink);
	}

	.note {
		font-size: 0.9rem;
		color: var(--muted);
	}
</style>
