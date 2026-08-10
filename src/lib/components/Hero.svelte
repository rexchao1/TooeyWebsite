<script>
	import { hero, SIGNUP_URL } from '$lib/config/site.js';

	const [line1, line2] = hero.headline.split('\n');
</script>

<section class="hero">
	<div class="container">
		<p class="pill">{hero.eyebrow}</p>
		<h1>{line1}<br />{line2}</h1>
		<p class="lede">{hero.lede}</p>
		<a class="btn btn-moss cta" href={SIGNUP_URL}>{hero.cta} <span class="arrow">&rarr;</span></a>
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
		padding-top: clamp(56px, 7vw, 104px);
	}

	.pill {
		display: inline-block;
		background: var(--sage);
		color: var(--moss);
		font-family: var(--font-display);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 0.55rem 1.2rem;
		border-radius: var(--radius-pill);
	}

	h1 {
		font-size: clamp(2.9rem, 7.2vw, 5.4rem);
		line-height: 1.02;
		letter-spacing: -0.03em;
		margin-top: 1.4rem;
	}

	.lede {
		max-width: 42rem;
		margin: 1.6rem auto 0;
		font-size: clamp(1.05rem, 1.6vw, 1.25rem);
		color: var(--muted);
	}

	.cta {
		margin-top: 2.1rem;
		font-size: 1.08rem;
		padding: 1.05rem 2rem;
	}

	.shot-wrap {
		width: var(--shot-width);
		margin: clamp(48px, 6vw, 80px) auto calc(var(--half-shot) * -1);
		position: relative;
		z-index: 2;
	}

	.shot-wrap img {
		width: 100%;
		height: auto;
		border-radius: 18px;
		border: 1px solid var(--line);
		box-shadow: 0 32px 90px rgba(11, 11, 10, 0.22);
	}
</style>
