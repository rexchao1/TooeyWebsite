<script>
	import { hero, SIGNUP_URL } from '$lib/config/site.js';

	const [line1, line2] = hero.headline.split('\n');
</script>

<section class="hero">
	<div class="container">
		<p class="eyebrow">{hero.eyebrow}</p>
		<h1>{line1}<br />{line2}</h1>
		<p class="lede">{hero.lede}</p>
		<a class="btn btn-moss cta" href={SIGNUP_URL}>{hero.cta} <span class="arrow">&rarr;</span></a>
		<p class="note">{hero.note}</p>
	</div>

	<!-- Sits half over the dark band below: see --half-shot in app.css -->
	<div class="shot-wrap">
		<img
			src="/app-screenshot.png"
			alt="Tooey's prep plan dashboard showing today's per-item forecast"
			width="1030"
			height="579"
		/>
	</div>
</section>

<style>
	.hero {
		text-align: center;
		padding-top: clamp(48px, 6vw, 88px);
	}

	h1 {
		font-size: clamp(2.6rem, 6.6vw, 5.1rem);
		line-height: 1.02;
		letter-spacing: -0.03em;
		margin-top: 0.85rem;
	}

	.lede {
		max-width: 38rem;
		margin: 1.35rem auto 0;
		font-size: clamp(1.05rem, 1.6vw, 1.22rem);
		color: var(--muted);
	}

	.cta {
		margin-top: 1.8rem;
		font-size: 1.05rem;
		padding: 0.95rem 1.7rem;
	}

	.note {
		margin-top: 0.85rem;
		font-size: 0.92rem;
		color: var(--muted);
	}

	.shot-wrap {
		width: var(--shot-width);
		margin: clamp(40px, 5vw, 68px) auto calc(var(--half-shot) * -1);
		position: relative;
		z-index: 2;
	}

	.shot-wrap img {
		width: 100%;
		height: auto;
		border-radius: 10px;
		border: 1px solid var(--line);
		box-shadow: 0 18px 40px rgba(11, 11, 10, 0.14);
	}
</style>
