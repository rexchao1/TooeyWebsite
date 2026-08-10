<script>
	import Wordmark from './Wordmark.svelte';
	import { nav, SIGNUP_URL, LOGIN_URL } from '$lib/config/site.js';
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
			<a class="btn btn-outline login" href={LOGIN_URL}>Login</a>
			<a class="btn btn-moss" href={SIGNUP_URL}>Sign up <span class="arrow">&rarr;</span></a>
		</div>
	</div>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 50;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--line);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		padding-block: 0.9rem;
	}

	nav {
		display: flex;
		gap: 2.2rem;
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
	}

	.actions .btn {
		padding: 0.55rem 1.15rem;
		font-size: 0.92rem;
	}

	@media (max-width: 760px) {
		nav,
		.login {
			display: none;
		}
	}
</style>
