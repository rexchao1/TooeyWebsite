<script>
	import CalculatorModal from './CalculatorModal.svelte';
	import { hook } from '$lib/config/site.js';

	let modal;
</script>

<section class="hook" id="hook">
	<div class="container">
		<p class="eyebrow light">{hook.eyebrow}</p>
		<h2>{hook.headline}</h2>
		<p class="sub">{hook.sub}</p>
		<button type="button" class="btn btn-light cta" onclick={() => modal.open()}>
			{hook.cta} <span class="arrow">&rarr;</span>
		</button>
	</div>
</section>

<CalculatorModal bind:this={modal} />

<style>
	.hook {
		background: var(--moss);
		text-align: center;
		padding-block: clamp(80px, 10vw, 136px);
		scroll-margin-top: var(--header-h);
	}

	.eyebrow.light {
		color: var(--sage);
	}

	h2 {
		color: #fff;
		font-size: clamp(2.4rem, 5.6vw, 4.2rem);
		letter-spacing: -0.03em;
		max-width: 18ch;
		margin: 0.55rem auto 0;
	}

	.sub {
		color: color-mix(in srgb, #fff 78%, transparent);
		font-size: clamp(1.02rem, 1.5vw, 1.18rem);
		margin-top: 1.1rem;
		max-width: 36rem;
		margin-inline: auto;
	}

	.cta {
		margin-top: 2.1rem;
		font-size: 1.08rem;
		padding: 1rem 1.9rem;
	}
</style>
