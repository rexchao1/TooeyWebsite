/* ---------------------------------------------------------------------------
   All site copy lives here. Edit text, links, FAQ items, and feature cards
   without touching any component.
--------------------------------------------------------------------------- */

// Where "Contact" and the calculator's backtest CTA point. Swap for a real
// address / signup URL when ready.
export const CONTACT_EMAIL = 'team@usetooey.com';
export const SIGNUP_URL = '#hook';
export const LOGIN_URL = '#';
export const SITE_URL = 'https://usetooey.com';

export const meta = {
	title: 'Tooey. Prep the right amount, every day.',
	description:
		'A prep list for tomorrow, written from what you actually sell. Free backtest on your own sales history.'
};

export const nav = {
	links: [
		{ label: 'Product', href: '#features' },
		{ label: 'FAQ', href: '#faq' },
		{ label: 'Contact', href: `mailto:${CONTACT_EMAIL}` }
	],
	cta: 'Free backtest'
};

export const hero = {
	eyebrow: 'For independent restaurants',
	// \n marks the line break in the headline
	headline: 'Prep the right amount.\nEvery day.',
	lede: 'A prep list for tomorrow, written from what you actually sell. How many patties, how many buns, how much batch. Not covers.',
	cta: 'See it on your numbers',
	note: 'Free backtest on your own sales history.'
};

export const integrations = {
	headline: 'Square today. Toast is next.',
	note: 'If you can export sales history, we can run the backtest either way.'
};

export const backtest = {
	eyebrow: 'The free backtest',
	steps: [
		{
			title: 'Send a few months of sales.',
			body: 'A Square export is enough. Another POS: a spreadsheet works.'
		},
		{
			title: 'We replay them.',
			body: 'As if Tooey had been writing the prep list those months.'
		},
		{
			title: 'You see per-item accuracy.',
			body: 'On your menu. If it isn’t convincing, don’t buy.'
		}
	],
	contact: 'Or just email us'
};

export const features = {
	eyebrow: 'For the kitchen',
	title: 'Built for the line.',
	cards: [
		{
			kind: 'compare',
			title: 'Forecasts items, not covers.',
			body: 'Most tools stop at “Friday looks busy.” Your prep list cares how many patties, how many buns, how much batch prep.',
			them: { label: 'Everyone else', quote: '“Friday looks busy. About 180 covers.”' },
			tooey: {
				label: 'Tooey',
				rows: [
					{ item: 'pepperoni pizza', qty: '12 units' },
					{ item: 'draft beer', qty: '11 units' },
					{ item: 'garlic knots', qty: '10 units' }
				]
			}
		},
		{
			kind: 'chips',
			title: 'Sees what’s coming.',
			body: 'Games, concerts, festivals, weather. Tooey reads the calendar around your block before it sets a number.',
			chips: ['Warriors home game', 'Street fair ½ mi away', '78° on Friday']
		},
		{
			kind: 'plain',
			title: 'Lives where your kitchen looks.',
			body: 'Prep lists on a phone at every station, or printed, if that’s how your line runs. No emailed spreadsheets.'
		},
		{
			kind: 'dark',
			title: 'Every number shows its work.',
			quote: 'Concert nearby + warm Friday.',
			body: 'Every forecast says why it moved. Trust what you can read, not a black box.'
		},
		{
			kind: 'plain',
			title: 'Learns your restaurant weekly.',
			body: 'Retrains on your actuals every week. Your menu, your neighborhood, your seasonality. Not a national average.'
		}
	]
};

export const hook = {
	eyebrow: 'The waste you already know',
	headline: 'What’s over-prepping costing you?',
	sub: 'Three numbers from your kitchen. A range in half a minute. Then we measure the real one on your sales history.',
	cta: 'Run the numbers'
};

export const calculator = {
	eyebrow: 'Your kitchen, roughly',
	title: 'Three numbers you already know.',
	resultLead: 'Restaurants like yours typically leave',
	resultTail: 'on the table every month.',
	honest:
		'That’s the industry estimate. Your real number depends on your menu, so we measure it on your own sales history, free, before you pay anything.',
	cta: 'Email us for a free backtest'
};

export const faq = {
	eyebrow: 'Before you send a file',
	title: 'Good questions.',
	ticketEyebrow: 'Today · daily service',
	ticketCaption: 'What the kitchen actually sees.',
	items: [
		{
			q: 'How are you different from every “99% accurate” tool?',
			a: 'Everyone advertises 99%. Ask: 99% of what? Most vendors quote accuracy on total daily sales, a number where per-item errors cancel out and a simple average already scores in the 90s. Predicting each item is the hard part, and it’s the only number your prep list actually depends on. So we publish per-item accuracy, measured on your own history, before you pay anything. If the backtest isn’t convincing, don’t buy.'
		},
		{
			q: 'Which POS do you support?',
			a: 'Square today. Toast is next. If you can export sales history, we can run your backtest either way.'
		},
		{
			q: 'What exactly is the free backtest?',
			a: 'We replay the last months of your restaurant as if Tooey had been running, then show you exactly how accurate it would have been on your menu, item by item, before you commit.'
		},
		{
			q: 'What does my kitchen actually see?',
			a: 'A prep list on a phone (or printed, if that’s how your kitchen runs): each item, how much to prep, and why. Check things off as you go.'
		},
		{
			q: 'Do I need new hardware?',
			a: 'No. Tooey works with the POS you already have. Setup is a data export, not an IT project.'
		},
		{
			q: 'Is my sales data safe?',
			a: 'Yes. Your data is used to build your forecasts and nothing else. Never sold, never shared, and deleted if you walk away.'
		},
		{
			q: 'What happens when the forecast is wrong?',
			a: 'You’ll see it. Every forecast shows its confidence, and Tooey retrains on your actuals weekly, so misses make next week sharper. And we’re in the Bay Area: when something breaks, we show up.'
		}
	]
};

export const footer = {
	links: [
		{ label: 'Product', href: '#features' },
		{ label: 'FAQ', href: '#faq' },
		{ label: 'Contact', href: `mailto:${CONTACT_EMAIL}` }
	],
	note: 'Made in the East Bay. © 2026 Tooey.'
};
