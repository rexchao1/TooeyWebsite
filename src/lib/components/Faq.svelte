<script>
	import { faq } from '$lib/config/site.js';
</script>

<section class="section" id="faq">
	<div class="container">
		<p class="eyebrow">{faq.eyebrow}</p>
		<h2 class="section-title">{faq.title}</h2>

		<div class="cols">
			<div class="visual">
				<div class="visual-card">
					<img
						src="/app-screenshot.png"
						alt="Tooey prep plan dashboard"
						loading="lazy"
					/>
				</div>
				<p class="caption">{faq.visualCaption}</p>
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

	.visual-card {
		background: var(--sage);
		border-radius: var(--radius-card);
		padding: 1.1rem;
		overflow: hidden;
	}

	.visual-card img {
		width: 100%;
		height: 380px;
		object-fit: cover;
		object-position: 50% 0%;
		border-radius: 12px;
		border: 1px solid var(--line);
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
		padding-block: 1.35rem;
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

	.answer {
		color: var(--muted);
		max-width: 60ch;
		padding-bottom: 1.35rem;
	}
</style>
