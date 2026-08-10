<script>
	import { integrations } from '$lib/config/site.js';
</script>

<!-- Dark band the hero screenshot cuts into. Thin on purpose: label + marquee. -->
<section class="cred">
	<p class="label">{integrations.label}</p>

	<div class="marquee" aria-label="Point-of-sale systems Tooey integrates with">
		<div class="track">
			{#each integrations.names as name (name)}
				<span class="logo">{name}</span>
			{/each}
			{#each integrations.names as name (`dup-${name}`)}
				<span class="logo" aria-hidden="true">{name}</span>
			{/each}
		</div>
	</div>
</section>

<style>
	.cred {
		background: var(--moss-dark);
		/* room for the overlapping screenshot half, then the thin bar itself */
		padding-top: calc(var(--half-shot) + clamp(40px, 5vw, 64px));
		padding-bottom: clamp(44px, 5vw, 68px);
	}

	.label {
		text-align: center;
		font-family: var(--font-display);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--sage) 70%, transparent);
		margin-bottom: 1.9rem;
	}

	.marquee {
		overflow: hidden;
		mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
		-webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
	}

	.track {
		display: flex;
		width: max-content;
		animation: scroll 30s linear infinite;
	}

	.logo {
		font-family: var(--font-display);
		font-size: 1.45rem;
		font-weight: 700;
		letter-spacing: -0.01em;
		color: var(--bg);
		opacity: 0.55;
		padding-inline: 2.6rem;
		white-space: nowrap;
		transition: opacity 0.2s ease;
	}

	.logo:hover {
		opacity: 1;
	}

	@keyframes scroll {
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
		}

		.marquee {
			overflow-x: auto;
			mask-image: none;
			-webkit-mask-image: none;
		}
	}
</style>
