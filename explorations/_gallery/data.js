// The gallery's content, round two. `brief` is the direction the agent was
// given; the rest is the orchestrator's review. Round one is in git history.
window.EXPLORATIONS = [
  {
    id: '00-original', num: '00', name: 'The current site',
    href: '../index.html',
    line: 'What is live today, untouched. For reference.',
    brief: 'The site at the repo root as merged in PR #7.',
    headline: 'The operations partner for independent restaurants.',
    pages: [
      { label: 'Home', href: '../index.html' },
      { label: 'How it works', href: '../how.html' },
      { label: 'About', href: '../about.html' },
      { label: 'Privacy', href: '../privacy.html' }
    ]
  },
  {
    id: '01-margin', num: '01', name: 'Margin',
    href: '01-margin/', notes: '01-margin/NOTES.md', words: 137, motion: 'Hands-on',
    line: 'You make the prep call. Watch it land in the bin, or as tickets that never print.',
    brief: 'Prep sits between two losses: food in the bin, and sales that never happen. No figures allowed.',
    headline: 'Know how much of each dish to make.',
    concept: 'An overhead view of the pass: a steel pan of copper portion cups, a ticket rail, a bin. Drag the line to set the prep and start service. Too much, and the leftovers tip into the bin. Too little, and late tickets print blank and vanish. Then Tooey’s line is drawn and runs a service: closer, not perfect.',
    look: 'Brushed steel, copper, slate ink, one green. Big Shoulders Display, IBM Plex Sans Condensed.',
    strengths: ['The money argument becomes something you feel, with no number on the page.', 'Honest: Tooey’s runs vary, and the caption says "Closer, not perfect."'],
    weaknesses: ['Tooey looking steadier only shows across several runs; most visitors try one.', 'The section under the scene is conventional.'],
    pages: [{ label: 'Home', href: '01-margin/index.html' }, { label: 'Privacy', href: '01-margin/privacy.html' }]
  },
  {
    id: '02-time-back', num: '02', name: 'Overnight',
    href: '02-time-back/', notes: '02-time-back/NOTES.md', words: 115, motion: 'Scroll',
    line: 'The day’s sales become star trails, and at dawn they straighten into the prep list.',
    brief: 'Tooey works while the restaurant is closed. Make the night, and the turn to morning, the experience.',
    headline: 'Go home. Tooey takes the night shift.',
    concept: 'Each sale is an amber point on the horizon. Scroll, and they rise into stars that trace long-exposure trails while a clock runs from 10:58 pm to 5:41 am. At dawn each ring unrolls into the dot leaders of a menu-style list, and the counts land in morning light.',
    look: 'Indigo night to first light, amber for sales only. Funnel Display and Funnel Sans. Plain canvas, no libraries.',
    strengths: ['The most cinematic of the ten, and every star is a sale, so the beauty means something.', 'Lands on a light page, so it doesn’t read as a dark site.'],
    weaknesses: ['About five screens of night before the form; the buttons jump straight there.', 'Rex earlier declined a dark hero; here the dark is the story, but it’s still dark first.'],
    pages: [{ label: 'Home', href: '02-time-back/index.html' }, { label: 'Privacy', href: '02-time-back/privacy.html' }]
  },
  {
    id: '03-sandbox', num: '03', name: 'Play',
    href: '03-sandbox/', notes: '03-sandbox/NOTES.md', words: 126, motion: 'Hands-on',
    line: 'The menu is the chart: dish names swell with what will sell. Drag through two weeks.',
    brief: 'The visitor understands Tooey by touching it. The interaction is the site.',
    headline: 'Tooey reads your sales every night and tells you what to make in the morning.',
    concept: 'A sample bistro’s menu set in one variable typeface, where each dish name gets wider and heavier the more it will sell. Drag a roll of kitchen day-dot stickers and the menu breathes: big on Friday, small on Monday, brunch ballooning on Mother’s Day. Counts roll like odometers. Two dishes stay hollow outlines with their reasons.',
    look: 'Butcher-paper pink, char brown, day-dot colours on the stickers only. Anybody variable. GSAP Draggable.',
    strengths: ['The most original interaction: data, type, and play are one thing.', 'Kitchen vernacular (day dots, butcher paper) without props.'],
    weaknesses: ['At 1024 and on phones the width swell has to shrink to fit, so the effect is weaker.', 'Nothing hints that a dish can be tapped for its detail.'],
    pages: [{ label: 'Home', href: '03-sandbox/index.html' }, { label: 'Privacy', href: '03-sandbox/privacy.html' }]
  },
  {
    id: '04-glass-box', num: '04', name: 'Nothing hidden',
    href: '04-glass-box/', notes: '04-glass-box/NOTES.md', words: 127, motion: 'Scroll',
    line: 'Every count is built from plates you sold. When there aren’t enough, the line stays blank.',
    brief: 'Owners distrust black boxes. Show the mechanism; make the honesty visible.',
    headline: 'Tomorrow’s prep, counted from your own sales.',
    concept: 'A six-week calendar where each dot is one plate sold. Scroll lights the inputs one at a time (the same weekday, the dates, a holiday), then plates fall into tomorrow’s tray while a dot-matrix counter ticks to 38, and three yolk plates make Prep 41. Then a dish only nine days old: its plates wander toward the tray, can’t settle, and an empty line draws where the number would be.',
    look: 'Kitchen-roll blue, plate white, yolk for the cushion only. Doto (dot-matrix) for numerals, Host Grotesk. No libraries, 108 KB.',
    strengths: ['The clearest explanation of how a count is made, in almost no words.', 'The climax is a refusal, which is the honesty argument made physical.'],
    weaknesses: ['On small phones the calendar is tiny and the "won’t guess" moment is small.', 'The last beat holds on the empty tray without a picture of its own.'],
    pages: [{ label: 'Home', href: '04-glass-box/index.html' }, { label: 'Privacy', href: '04-glass-box/privacy.html' }]
  },
  {
    id: '05-pilot-terms', num: '05', name: 'The invitation',
    href: '05-pilot-terms/', notes: '05-pilot-terms/NOTES.md', words: 106, motion: 'Scroll',
    line: 'A folded card on a red tablecloth. Open it, and the reply card is the form.',
    brief: 'Tooey is early and choosing its first restaurants. An invitation, not a pitch.',
    headline: 'Tooey is choosing its first restaurants.',
    concept: 'One invitation card under a warm light on banquette-red linen. Scrolling swings the cover open on a spring with the weight of heavy stock; its shadow sweeps across the inside, which holds the terms and an example count. The reply card slides out from under it and is the application form. Typing your restaurant’s name rewrites the count’s heading live.',
    look: 'Banquette red, bright white stock, blue-black ink. Ibarra Real Nova throughout; the logo blind-embossed on the cover.',
    strengths: ['The most premium and emotional of the ten; it feels like being chosen.', 'Says everything (free, setup, data, how to decide) in one breath on the inside page.'],
    weaknesses: ['About two screens of scroll to open; the Apply link is the shortcut.', 'At 320 wide the open card’s text is small.'],
    ask: '"Choosing its first restaurants" came from the brief. Is it accurate if pilot restaurants already exist?',
    pages: [{ label: 'Home', href: '05-pilot-terms/index.html' }, { label: 'Privacy', href: '05-pilot-terms/privacy.html' }]
  },
  {
    id: '06-platform', num: '06', name: 'The company',
    href: '06-platform/', notes: '06-platform/NOTES.md', words: 141, motion: 'Scroll',
    line: 'A restaurant’s whole year, woven in brass, then a dive into one empty cell: tomorrow.',
    brief: 'A company with a large ambition, of which the prep count is the first working piece. No roadmap.',
    headline: 'Independent restaurants, run on their own numbers.',
    concept: 'An example restaurant’s year woven like a loom: one row per dish, one brass bar per day, holidays as gaps, an empty column marked Tomorrow. Scroll and a read head runs down today; short rib’s row swells and lights its weekday, season and holidays; then the camera dives into short rib’s empty tomorrow cell until it fills the screen with brass and rolls to Prep 34.',
    look: 'Bottle green and brass throughout, engineered rather than decorative. Encode Sans (width axis for headline, labels, data).',
    strengths: ['Feels like a company with a lot of data behind it, without a single claim about the future.', 'The dive from a year to one number is a powerful "we do the reading" moment.'],
    weaknesses: ['About five screens before the form.', 'On phones a day is under a pixel wide, so the patterns read as texture.'],
    pages: [{ label: 'Home', href: '06-platform/index.html' }, { label: 'Privacy', href: '06-platform/privacy.html' }]
  },
  {
    id: '07-your-sales', num: '07', name: 'The pattern',
    href: '07-your-sales/', notes: '07-your-sales/NOTES.md', motion: 'Hands-on',
    line: 'Turn the dial until a year of sales snaps into a weekly rhythm.',
    brief: 'Every restaurant’s sales hold a rhythm the owner never sees. Make the visitor see it.',
    headline: 'Everything your guests have ordered is on record. Tooey reads it every night.',
    concept: '', look: '', strengths: [], weaknesses: [],
    pages: [{ label: 'Home', href: '07-your-sales/index.html' }, { label: 'Privacy', href: '07-your-sales/privacy.html' }]
  },
  {
    id: '08-the-analyst', num: '08', name: 'The unfair advantage',
    href: '08-the-analyst/', notes: '08-the-analyst/NOTES.md', words: 100, motion: 'Plays itself',
    line: 'A chain’s planning department collapses into one owner. Then Tooey lights up beside them.',
    brief: 'Chains have teams reading their numbers; independents have the owner, after close. A cause, not a product page.',
    headline: 'Chains have a team reading their sales every night.',
    concept: 'A "Demand planning" org chart draws itself level by level, 88 people springing into place. Then every person is pulled along curved paths into one figure, the owner, while "Independents have the owner, after close, if at all." widens word by word. Tooey lights up as a warm point beside the owner and wires out to tomorrow’s example counts, including a blank. About five seconds, with a Replay button.',
    look: 'Pale lilac room, deep lilac department, espresso type, one tungsten light. Hubot Sans: narrow for the chain, wide for the owner.',
    strengths: ['A point of view in two sentences and one animation.', 'The type width carries the argument: corporate narrow, independent wide.'],
    weaknesses: ['The hero’s top row is a conventional headline-and-button split.', '"Chains have a team…" is a framing, not a measured claim.'],
    pages: [{ label: 'Home', href: '08-the-analyst/index.html' }, { label: 'Privacy', href: '08-the-analyst/privacy.html' }]
  },
  {
    id: '09-skeptic', num: '09', name: 'Straight talk',
    href: '09-skeptic/', notes: '09-skeptic/NOTES.md', words: 147, motion: 'Plays itself',
    line: 'The AI pitch falls apart while you watch. Throw the buzzwords around.',
    brief: 'The visitor has been burned by software and AI hype. Disarm them: blunt, brief, a little funny.',
    headline: 'Tooey reads yesterday’s sales and emails you how many of each dish to make today.',
    concept: 'The headline loads as a 29-word AI pitch. The hype words ("revolutionary", "AI-powered", "game-changing", "seamlessly") come loose and fall under gravity into a heap you can grab and fling; "exactly" shivers alone and drops last. The plain 15-word sentence closes up and grows to full size. "For independent restaurants. Yes, there’s AI in it. No, you won’t have to talk to it." Undo drops them again.',
    look: 'Mustard and navy. Archivo, expanded and blunt. matter-js physics.',
    strengths: ['The most memorable of the ten; people will show it to someone.', 'The joke is the honesty: it throws out the claims competitors make.'],
    weaknesses: ['For about a second the biggest words on screen are hype.', 'On short phones most of the fall lands below the fold.'],
    pages: [{ label: 'Home', href: '09-skeptic/index.html' }, { label: 'Privacy', href: '09-skeptic/privacy.html' }]
  },
  {
    id: '10-quiet', num: '10', name: 'Calm',
    href: '10-quiet/', notes: '10-quiet/NOTES.md', words: 92, motion: 'Plays itself',
    line: 'A roar of orders tallies into a few quiet numbers. Then the heat lamp goes off.',
    brief: 'A restaurant is loud; Tooey is the one quiet thing in the day. Few words, one calm moment.',
    headline: 'Service is loud.',
    concept: 'The page opens on heat-lamp red, roaring with real kitchen chatter ("2 short rib", "heard", "fire 12"). The lanes slow, each order line flies into its dish’s row and the counts tick up, the red shrinks into one small dot like a lamp switching off, and "Service is loud." exhales from black to thin on clean white. About ten seconds, nothing to do but watch.',
    look: 'Heat-lamp red to white, char brown type. Mona Sans on the weight axis only. No libraries, 120 KB.',
    strengths: ['The fewest words (92) and the clearest emotional promise.', 'Every motion is the real mechanism: sales lines becoming counts.'],
    weaknesses: ['The white rest state depends on having seen the red.', 'All the craft is in the hero; the sections below are deliberately plain.'],
    pages: [{ label: 'Home', href: '10-quiet/index.html' }, { label: 'Privacy', href: '10-quiet/privacy.html' }]
  }
];
