/* ---------------------------------------------------------------------------
   Savings calculator — all assumptions live here so they're easy to tune.

   The model is deliberately honest: it estimates a RANGE from the owner's own
   inputs, and the modal's closing line points at the free backtest for the
   real number. Tweak the constants, defaults, and input bounds freely.
--------------------------------------------------------------------------- */

export const ASSUMPTIONS = {
	WEEKS_PER_MONTH: 4.33,
	// Share of over-prep waste that better forecasting can realistically
	// recover — we never claim all of it.
	RECOVER_LOW: 0.5,
	RECOVER_HIGH: 0.8,
	// Results are rounded to the nearest…
	ROUND_TO: 50
};

export const INPUTS = {
	weeklySales: { label: 'Weekly food sales', min: 0, max: 200000, default: 15000, step: 500 },
	foodCostPct: { label: 'Food cost', min: 20, max: 45, default: 30, step: 1 },
	tossPct: { label: 'Prepped food tossed', min: 0, max: 25, default: 10, step: 1 }
};

/**
 * @param {{ weeklySales: number, foodCostPct: number, tossPct: number }} inputs
 * @returns {{ low: number, high: number, monthlyWaste: number }} dollars per month
 */
export function estimate({ weeklySales, foodCostPct, tossPct }) {
	const { WEEKS_PER_MONTH, RECOVER_LOW, RECOVER_HIGH, ROUND_TO } = ASSUMPTIONS;
	const round = (x) => Math.round(x / ROUND_TO) * ROUND_TO;

	const monthlyFoodCost = (weeklySales || 0) * WEEKS_PER_MONTH * (foodCostPct / 100);
	const monthlyWaste = monthlyFoodCost * (tossPct / 100);

	return {
		low: round(monthlyWaste * RECOVER_LOW),
		high: round(monthlyWaste * RECOVER_HIGH),
		monthlyWaste: round(monthlyWaste)
	};
}

export const fmtUSD = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	maximumFractionDigits: 0
});
