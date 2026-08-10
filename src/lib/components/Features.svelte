<script>
	import { features } from '$lib/config/site.js';
</script>

<section class="section" id="features">
	<div class="container">
		<p class="eyebrow">{features.eyebrow}</p>
		<h2 class="section-title">{features.title}</h2>

		<div class="grid">
			{#each features.cards as card (card.title)}
				<article class="card" class:dark={card.kind === 'dark'}>
					{#if card.kind === 'compare'}
						<h3>{card.title}</h3>
						<p class="body">{card.body}</p>
						<div class="compare">
							<div class="col them">
								<p class="col-label">{card.them.label}</p>
								<p class="quote">{card.them.quote}</p>
							</div>
							<div class="col tooey">
								<p class="col-label">{card.tooey.label}</p>
								<ul>
									{#each card.tooey.rows as row (row.item)}
										<li><span>{row.item}</span><strong>{row.qty}</strong></li>
									{/each}
								</ul>
							</div>
						</div>
					{:else if card.kind === 'chips'}
						<h3>{card.title}</h3>
						<p class="body">{card.body}</p>
						<div class="chips">
							{#each card.chips as chip (chip)}
								<span class="chip">{chip}</span>
							{/each}
						</div>
					{:else if card.kind === 'dark'}
						<p class="big-quote">{card.quote}</p>
						<h3>{card.title}</h3>
						<p class="body">{card.body}</p>
					{:else}
						<h3>{card.title}</h3>
						<p class="body">{card.body}</p>
					{/if}
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1.1rem;
		margin-top: clamp(2.2rem, 4vw, 3.4rem);
	}

	.card {
		grid-column: span 12;
		background: #fff;
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		padding: clamp(1.5rem, 2.4vw, 2.2rem);
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	@media (min-width: 800px) {
		.card:nth-child(1) {
			grid-column: span 7;
		}

		.card:nth-child(2) {
			grid-column: span 5;
		}

		.card:nth-child(n + 3) {
			grid-column: span 4;
		}
	}

	.card h3 {
		font-size: 1.45rem;
		font-weight: 700;
		letter-spacing: -0.015em;
	}

	.body {
		color: var(--muted);
		font-size: 1rem;
	}

	.card.dark {
		background: var(--moss-dark);
		border-color: transparent;
	}

	.card.dark h3 {
		color: var(--bg);
	}

	.card.dark .body {
		color: color-mix(in srgb, var(--bg) 65%, transparent);
	}

	.big-quote {
		font-family: var(--font-display);
		font-size: 1.35rem;
		font-weight: 500;
		color: var(--sage);
		background: color-mix(in srgb, var(--moss) 30%, transparent);
		border-radius: 12px;
		padding: 0.8rem 1.1rem;
		align-self: flex-start;
	}

	/* covers-vs-items comparison */
	.compare {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.9rem;
		margin-top: auto;
	}

	@media (max-width: 560px) {
		.compare {
			grid-template-columns: 1fr;
		}
	}

	.col {
		border-radius: 14px;
		padding: 1rem 1.1rem;
	}

	.col.them {
		background: var(--bg);
		border: 1px dashed rgba(11, 11, 10, 0.18);
	}

	.col.tooey {
		background: var(--sage);
	}

	.col-label {
		font-family: var(--font-display);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
		margin-bottom: 0.5rem;
	}

	.col.tooey .col-label {
		color: var(--moss);
	}

	.quote {
		color: var(--muted);
		font-style: italic;
		font-size: 0.98rem;
	}

	.col ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.col li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.95rem;
		border-bottom: 1px solid rgba(11, 11, 10, 0.07);
		padding-bottom: 0.35rem;
	}

	.col li:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.col li strong {
		font-family: var(--font-display);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: auto;
	}

	.chip {
		background: var(--sage);
		color: var(--moss-deep);
		font-family: var(--font-display);
		font-size: 0.88rem;
		font-weight: 500;
		padding: 0.45rem 0.95rem;
		border-radius: var(--radius-pill);
	}
</style>
