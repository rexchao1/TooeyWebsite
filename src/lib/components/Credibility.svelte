<script>
	import { integrations, backtest, CONTACT_EMAIL } from '$lib/config/site.js';
</script>

<!-- Dark band the hero screenshot cuts into. -->
<section class="cred">
	<div class="container">
		<p class="kicker">{integrations.headline}</p>
		<p class="note">{integrations.note}</p>

		<p class="offer">{backtest.eyebrow}</p>
		<ol class="steps">
			{#each backtest.steps as step, i (step.title)}
				<li>
					<span class="num">{String(i + 1).padStart(2, '0')}</span>
					<h2>{step.title}</h2>
					<p>{step.body}</p>
				</li>
			{/each}
		</ol>

		<p class="contact">
			<a href="mailto:{CONTACT_EMAIL}">{backtest.contact} <span>{CONTACT_EMAIL}</span></a>
		</p>
	</div>
</section>

<style>
	.cred {
		background: var(--moss-dark);
		color: var(--bg);
		/* room for the overlapping screenshot half, then the band itself */
		padding-top: calc(var(--half-shot) + clamp(40px, 5vw, 64px));
		padding-bottom: clamp(56px, 7vw, 96px);
	}

	.kicker {
		text-align: center;
		font-family: var(--font-display);
		font-size: clamp(1.45rem, 3vw, 2.05rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.note {
		text-align: center;
		margin-top: 0.55rem;
		color: color-mix(in srgb, var(--sage) 88%, transparent);
		font-size: 1.02rem;
	}

	.offer {
		text-align: center;
		margin-top: clamp(2.4rem, 5vw, 3.4rem);
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--sage);
	}

	.steps {
		list-style: none;
		margin: 1.3rem 0 0;
		padding: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.6rem;
	}

	@media (min-width: 800px) {
		.steps {
			grid-template-columns: repeat(3, 1fr);
			gap: 0;
		}

		.steps li {
			padding-inline: 1.8rem;
			border-left: 1px solid color-mix(in srgb, var(--sage) 18%, transparent);
		}

		.steps li:first-child {
			padding-left: 0;
			border-left: none;
		}

		.steps li:last-child {
			padding-right: 0;
		}
	}

	.num {
		display: block;
		font-family: var(--font-display);
		font-size: 0.82rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--sage) 80%, transparent);
		margin-bottom: 0.7rem;
	}

	h2 {
		font-size: 1.28rem;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: var(--bg);
	}

	.steps p {
		margin-top: 0.45rem;
		color: color-mix(in srgb, var(--sage) 86%, transparent);
		font-size: 0.98rem;
	}

	.contact {
		text-align: center;
		margin-top: clamp(2rem, 4vw, 2.8rem);
	}

	.contact a {
		font-family: var(--font-display);
		font-size: 1rem;
		color: color-mix(in srgb, var(--sage) 90%, transparent);
	}

	.contact a:hover {
		color: var(--bg);
	}

	.contact span {
		color: var(--bg);
	}
</style>
