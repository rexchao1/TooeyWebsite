<script>
	import { faq, features } from '$lib/config/site.js';

	const ticket = features.cards.find((c) => c.kind === 'compare')?.tooey ?? { rows: [] };
	const why = features.cards.find((c) => c.kind === 'dark')?.quote ?? '';
</script>

<section class="section" id="faq">
	<div class="container">
		<p class="eyebrow">{faq.eyebrow}</p>
		<h2 class="section-title">{faq.title}</h2>

		<div class="cols">
			<div class="visual">
				<aside class="ticket" aria-label={faq.ticketCaption}>
					<p class="ticket-head">
						<span>{faq.ticketEyebrow}</span>
						<span>Prep list</span>
					</p>
					<ul>
						{#each ticket.rows as row (row.item)}
							<li>
								<span>{row.item}</span>
								<strong>{row.qty}</strong>
							</li>
						{/each}
					</ul>
					<p class="why">{why}</p>
				</aside>
				<p class="caption">{faq.ticketCaption}</p>
			</div>

			<div class="list">
				{#each faq.items as item, i (item.q)}
					<details open={i === 0}>
						<summary>
							<span>{item.q}</span>
							<span class="icon" aria-hidden="true">+</span>
						</summary>
						<p class="answer">{item.a}</p>
					</details>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
		gap: clamp(2rem, 4vw, 4rem);
		margin-top: clamp(2.2rem, 4vw, 3.4rem);
		align-items: start;
	}

	@media (max-width: 860px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}

	.visual {
		position: sticky;
		top: 96px;
	}

	@media (max-width: 860px) {
		.visual {
			position: static;
		}
	}

	.ticket {
		background: #fff;
		border: 1px solid var(--line);
		border-radius: var(--radius-card);
		padding: 0 0 1.2rem;
		overflow: hidden;
	}

	.ticket-head {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-family: var(--font-display);
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--sage);
		background: var(--moss-dark);
		padding: 0.75rem 1.4rem;
	}

	.ticket ul {
		list-style: none;
		margin: 0.9rem 1.4rem 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.ticket li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: 1.05rem;
		font-variant-numeric: tabular-nums;
		border-bottom: 1px solid var(--line);
		padding-bottom: 0.7rem;
	}

	.ticket li:last-of-type {
		border-bottom: none;
	}

	.ticket strong {
		font-family: var(--font-display);
		font-weight: 700;
	}

	.why {
		margin: 0.4rem 1.4rem 0;
		padding-top: 0.85rem;
		border-top: 1px solid var(--line);
		font-family: var(--font-display);
		font-size: 0.95rem;
		color: var(--moss-deep);
	}

	.caption {
		margin-top: 0.8rem;
		font-size: 0.9rem;
		color: var(--muted);
		text-align: center;
	}

	details {
		border-bottom: 1px solid var(--line);
	}

	summary {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
		padding-block: 1.3rem;
		cursor: pointer;
		list-style: none;
		font-family: var(--font-display);
		font-size: 1.12rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary:hover {
		color: var(--moss);
	}

	.icon {
		font-family: var(--font-body);
		font-weight: 400;
		font-size: 1.4rem;
		color: var(--moss);
		transition: transform 0.2s ease;
		flex-shrink: 0;
	}

	details[open] .icon {
		transform: rotate(45deg);
	}

	@media (prefers-reduced-motion: reduce) {
		.icon {
			transition: none;
		}
	}

	.answer {
		color: var(--muted);
		max-width: 60ch;
		padding-bottom: 1.35rem;
	}
</style>
