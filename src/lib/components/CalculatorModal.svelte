<script>
	import { INPUTS, estimate, fmtUSD } from '$lib/config/calculator.js';
	import { CONTACT_EMAIL, calculator } from '$lib/config/site.js';

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

<dialog bind:this={dialog} onclick={onBackdropClick} aria-labelledby="calc-title">
	<div class="inner">
		<button type="button" class="close" onclick={() => dialog.close()} aria-label="Close"
			>&times;</button
		>

		<p class="eyebrow">{calculator.eyebrow}</p>
		<h3 id="calc-title">{calculator.title}</h3>

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
			<p class="result-label">{calculator.resultLead}</p>
			<p class="range">{fmtUSD.format(result.low)}&ndash;{fmtUSD.format(result.high)}</p>
			<p class="result-label">{calculator.resultTail}</p>
		</div>

		<p class="honest">{calculator.honest}</p>

		<a class="btn btn-moss backtest" href={`mailto:${CONTACT_EMAIL}?subject=Free%20backtest`}>
			{calculator.cta} <span class="arrow">&rarr;</span>
		</a>
	</div>
</dialog>

<style>
	dialog {
		border: none;
		border-radius: var(--radius-card);
		padding: 0;
		width: min(520px, 92vw);
		max-height: min(92vh, 760px);
		overflow: auto;
		background: var(--bg);
		color: var(--ink);
		box-shadow: 0 24px 60px rgba(11, 11, 10, 0.28);
	}

	@media (max-width: 560px) {
		dialog {
			width: min(520px, 94vw);
			max-height: calc(100dvh - 1.5rem);
		}

		.inner {
			padding: 1.3rem 1.2rem 1.2rem;
			gap: 0.85rem;
		}
	}

	dialog::backdrop {
		background: rgba(11, 11, 10, 0.55);
	}

	.inner {
		padding: clamp(1.6rem, 4vw, 2.4rem);
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1.05rem;
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
		gap: 1.05rem;
		margin-top: 0.3rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.95rem;
	}

	.label-row strong {
		font-family: var(--font-display);
		font-variant-numeric: tabular-nums;
	}

	input[type='range'] {
		appearance: none;
		width: 100%;
		height: 24px;
		background: transparent;
		accent-color: var(--moss);
	}

	input[type='range']::-webkit-slider-runnable-track {
		height: 2px;
		background: var(--line);
	}

	input[type='range']::-webkit-slider-thumb {
		appearance: none;
		width: 18px;
		height: 18px;
		margin-top: -8px;
		border-radius: 50%;
		background: var(--moss);
		cursor: pointer;
		border: none;
	}

	input[type='range']::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--moss);
		cursor: pointer;
		border: none;
	}

	input[type='range']::-moz-range-track {
		height: 2px;
		background: var(--line);
		border: none;
	}

	.result {
		text-align: center;
		background: var(--sage);
		border-radius: 8px;
		padding: 1.15rem 1rem;
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
		font-variant-numeric: tabular-nums;
	}

	.honest {
		font-size: 0.9rem;
		color: var(--muted);
	}

	.backtest {
		align-self: center;
	}
</style>
