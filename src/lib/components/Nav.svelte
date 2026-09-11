<script>
	import Wordmark from './Wordmark.svelte';
	import { nav, SIGNUP_URL, LOGIN_URL } from '$lib/config/site.js';

	const showLogin = LOGIN_URL && LOGIN_URL !== '#';
</script>

<header>
	<div class="container bar">
		<Wordmark />

		<nav aria-label="Main">
			{#each nav.links as link (link.label)}
				<a href={link.href}>{link.label}</a>
			{/each}
		</nav>

		<div class="actions">
			{#if showLogin}
				<a class="btn btn-outline login" href={LOGIN_URL}>Login</a>
			{/if}
			<a class="btn btn-moss cta" href={SIGNUP_URL}>{nav.cta}</a>
		</div>
	</div>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: var(--bg);
		border-bottom: 1px solid var(--line);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.25rem;
		padding-block: 0.85rem;
		min-height: var(--header-h);
	}

	nav {
		display: flex;
		gap: 1.8rem;
	}

	nav a {
		font-family: var(--font-display);
		font-weight: 500;
		font-size: 0.98rem;
	}

	nav a:hover {
		color: var(--moss);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-shrink: 0;
	}

	.actions .btn {
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
	}

	@media (max-width: 760px) {
		nav {
			display: none;
		}
	}
</style>
