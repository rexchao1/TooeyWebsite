<script>
	import { INPUTS, estimate, fmtUSD } from '$lib/config/calculator.js';
	import { CONTACT_EMAIL } from '$lib/config/site.js';

	let dialog; // <dialog> element

	let weeklySales = $state(INPUTS.weeklySales.default);
	let foodCostPct = $state(INPUTS.foodCostPct.default);
	let tossPct = $state(INPUTS.tossPct.default);

	const result = $derived(estimate({ weeklySales, foodCostPct, tossPct }));

	export function open() {
		dialog.showModal();
	}

	function onBackdropClick(e) {
		if (e.target === dialog) dialog.close();
	}
</script>

<dialog bind:this={dialog} onclick={onBackdropClick}>
	<div class="inner">
		<button class="close" onclick={() => dialog.close()} aria-label="Close">&times;</button>

		<p class="eyebrow">Your kitchen, roughly</p>
		<h3>Three numbers you already know.</h3>

		<form method="dialog">
			<label>
				<span class="label-row">
					<span>{INPUTS.weeklySales.label}</span>
					<strong>{fmtUSD.format(weeklySales)}</strong>
				</span>
				<input
					type="range"
					bind:value={weeklySales}
					min={INPUTS.weeklySales.min}
					max={INPUTS.weeklySales.max}
					step={INPUTS.weeklySales.step}
				/>
			</label>

			<label>
				<span class="label-row">
					<span>{INPUTS.foodCostPct.label}</span>
					<strong>{foodCostPct}%</strong>
				</span>
				<input
					type="range"
					bind:value={foodCostPct}
					min={INPUTS.foodCostPct.min}
					max={INPUTS.foodCostPct.max}
					step={INPUTS.foodCostPct.step}
				/>
			</label>

			<label>
				<span class="label-row">
					<span>{INPUTS.tossPct.label}</span>
					<strong>{tossPct}%</strong>
				</span>
				<input
					type="range"
					bind:value={tossPct}
					min={INPUTS.tossPct.min}
					max={INPUTS.tossPct.max}
					step={INPUTS.tossPct.step}
				/>
			</label>
		</form>

		<div class="result">
			<p class="result-label">Restaurants like yours typically leave</p>
			<p class="range">{fmtUSD.format(result.low)}&ndash;{fmtUSD.format(result.high)}</p>
			<p class="result-label">on the table every month.</p>
		</div>

		<p class="honest">
			That’s the industry estimate. Your real number depends on your menu — so we measure it on
			your own sales history, free, before you pay anything.
		</p>

		<a
			class="btn btn-moss backtest"
			href={`mailto:${CONTACT_EMAIL}?subject=Free%20backtest`}
		>
			Run the free backtest <span class="arrow">&rarr;</span>
		</a>
	</div>
</dialog>

<style>
	dialog {
		border: none;
		border-radius: 24px;
		padding: 0;
		width: min(520px, 92vw);
		background: var(--bg);
		color: var(--ink);
	}

	dialog::backdrop {
		background: rgba(11, 11, 10, 0.55);
		backdrop-filter: blur(3px);
	}

	.inner {
		padding: clamp(1.6rem, 4vw, 2.4rem);
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.close {
		position: absolute;
		top: 1rem;
		right: 1.1rem;
		border: none;
		background: transparent;
		font-size: 1.7rem;
		line-height: 1;
		cursor: pointer;
		color: var(--muted);
	}

	.close:hover {
		color: var(--ink);
	}

	h3 {
		font-size: 1.55rem;
		font-weight: 700;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 0.3rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.95rem;
	}

	.label-row strong {
		font-family: var(--font-display);
	}

	input[type='range'] {
		accent-color: var(--moss);
		width: 100%;
	}

	.result {
		text-align: center;
		background: var(--sage);
		border-radius: 16px;
		padding: 1.2rem 1rem;
	}

	.result-label {
		font-size: 0.92rem;
		color: var(--moss-deep);
	}

	.range {
		font-family: var(--font-display);
		font-size: clamp(2rem, 6vw, 2.7rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--moss-deep);
		line-height: 1.15;
	}

	.honest {
		font-size: 0.9rem;
		color: var(--muted);
	}

	.backtest {
		align-self: center;
	}
</style>
