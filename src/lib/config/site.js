/* ---------------------------------------------------------------------------
   All site copy lives here. Edit text, links, FAQ items, and feature cards
   without touching any component.
--------------------------------------------------------------------------- */

// Where "Contact Us" and the calculator's backtest CTA point. Swap for a real
// address / signup URL when ready.
export const CONTACT_EMAIL = 'hello@tooey.co';
export const SIGNUP_URL = '#hook';
export const LOGIN_URL = '#';

export const nav = {
	links: [
		{ label: 'Product', href: '#features' },
		{ label: 'Pricing', href: '#hook' },
		{ label: 'Contact Us', href: `mailto:${CONTACT_EMAIL}` }
	]
};

export const hero = {
	eyebrow: 'Built for independent restaurants',
	// \n marks the line break in the headline
	headline: 'Prep the right amount.\nEvery day.',
	lede: 'AI forecasts how much of each item you’ll sell — then hands your kitchen a prep list. More accuracy, greater margins.',
	cta: 'Try for free'
};

export const integrations = {
	label: 'Works with the POS you already have',
	// Rendered as an animated marquee in the dark band
	names: ['Square', 'Toast', 'Clover', 'Lightspeed', 'Revel', 'TouchBistro', 'SpotOn', 'Aloha']
};

export const features = {
	eyebrow: 'What Tooey does',
	title: 'Built for the line.',
	cards: [
		{
			kind: 'compare',
			title: 'Forecasts items, not covers.',
			body: 'Most tools stop at “Friday looks busy.” Your prep list doesn’t care about covers — it cares how many patties, how many buns, how much batch prep.',
			them: { label: 'Everyone else', quote: '“Friday looks busy — about 180 covers.”' },
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
			body: 'Games, concerts, festivals, weather — Tooey reads the calendar around your block before it sets a number.',
			chips: ['Warriors home game', 'Street fair ½ mi away', '78° on Friday']
		},
		{
			kind: 'plain',
			title: 'Lives where your kitchen looks.',
			body: 'Prep lists on a phone at every station — or printed, if that’s how your line runs. No emailed spreadsheets.'
		},
		{
			kind: 'dark',
			title: 'Every number shows its work.',
			quote: '“Concert nearby + warm Friday.”',
			body: 'Every forecast says why it moved. Trust what you can read, not a black box.'
		},
		{
			kind: 'plain',
			title: 'Learns your restaurant weekly.',
			body: 'Retrains on your actuals every week. Your menu, your neighborhood, your seasonality — not a national average.'
		}
	]
};

export const hook = {
	eyebrow: 'Do the math',
	headline: 'What’s over-prepping costing you?',
	sub: 'Most kitchens only find out at close. Get a real answer in 30 seconds.',
	cta: 'Find out in 30 seconds'
};

export const faq = {
	eyebrow: 'Questions, answered',
	title: 'Good questions.',
	visualCaption: 'Today’s prep plan — every number explained.',
	items: [
		{
			q: 'How are you different from every “99% accurate” tool?',
			a: 'Everyone advertises 99%. Ask: 99% of what? Most vendors quote accuracy on total daily sales — a number where per-item errors cancel out and a simple average already scores in the 90s. Predicting each item is the hard part, and it’s the only number your prep list actually depends on. So we publish per-item accuracy, measured on your own history, before you pay anything. If the backtest isn’t convincing, don’t buy.'
		},
		{
			q: 'Which POS do you support?',
			a: 'Square today. Toast is next. If you can export sales history, we can run your backtest either way.'
		},
		{
			q: 'What exactly is the free backtest?',
			a: 'We replay the last months of your restaurant as if Tooey had been running, then show you exactly how accurate it would have been on your menu — item by item, before you commit.'
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
			a: 'Yes. Your data is used to build your forecasts and nothing else — never sold, never shared, and deleted if you walk away.'
		},
		{
			q: 'What happens when the forecast is wrong?',
			a: 'You’ll see it — every forecast shows its confidence, and Tooey retrains on your actuals weekly, so misses make next week sharper. And we’re in the Bay Area: when something breaks, we show up.'
		}
	]
};

export const footer = {
	links: [
		{ label: 'Product', href: '#features' },
		{ label: 'FAQ', href: '#faq' },
		{ label: 'Contact', href: `mailto:${CONTACT_EMAIL}` }
	],
	note: 'Made in the East Bay · © 2026 Tooey.'
};
