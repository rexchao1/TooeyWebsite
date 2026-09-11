<script>
	import Wordmark from './Wordmark.svelte';
	import { footer, CONTACT_EMAIL } from '$lib/config/site.js';
</script>

<footer>
	<div class="container bar">
		<Wordmark />

		<nav aria-label="Footer">
			{#each footer.links as link (link.label)}
				<a href={link.href}>{link.label}</a>
			{/each}
		</nav>

		<div class="meta">
			<a class="email" href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>
			<p class="note">{footer.note}</p>
		</div>
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

	.meta {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.2rem;
	}

	.email {
		font-family: var(--font-display);
		font-size: 0.95rem;
	}

	.email:hover {
		color: var(--moss);
	}

	.note {
		font-size: 0.9rem;
		color: var(--muted);
	}

	@media (max-width: 640px) {
		.bar {
			align-items: flex-start;
			flex-direction: column;
		}

		.meta {
			align-items: flex-start;
		}
	}
</style>
