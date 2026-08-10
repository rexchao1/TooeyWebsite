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
		<button class="btn btn-light cta" onclick={() => modal.open()}>
			{hook.cta} <span class="arrow">&rarr;</span>
		</button>
	</div>
</section>

<CalculatorModal bind:this={modal} />

<style>
	.hook {
		background: var(--moss);
		text-align: center;
		padding-block: clamp(88px, 11vw, 150px);
	}

	.eyebrow.light {
		color: var(--sage);
	}

	h2 {
		color: #fff;
		font-size: clamp(2.6rem, 6vw, 4.6rem);
		letter-spacing: -0.03em;
		max-width: 20ch;
		margin: 0.6rem auto 0;
	}

	.sub {
		color: color-mix(in srgb, #fff 78%, transparent);
		font-size: clamp(1.02rem, 1.5vw, 1.2rem);
		margin-top: 1.2rem;
	}

	.cta {
		margin-top: 2.3rem;
		font-size: 1.1rem;
		padding: 1.1rem 2.2rem;
	}
</style>
