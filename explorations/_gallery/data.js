// The gallery's content: one entry per site. `brief` is the strategic brief
// the agent was given (abridged); `headline`, `concept`, `look`, `strengths`,
// `weaknesses`, and `ask` are the orchestrator's review of what came back.
window.EXPLORATIONS = [
  {
    id: '00-original', num: '00', name: 'The current site',
    href: '../index.html',
    line: 'What is live today, untouched. For reference.',
    brief: 'The site at the repo root as merged in PR #7. Nothing in it was changed by this work.',
    headline: 'The operations partner for independent restaurants.',
    concept: 'A prep sheet prints over a crumpled pencil note on a sage counter; the nightly steps play as a scroll-led list; onboarding is paper on the counter; How it works is a formal reference page.',
    look: 'Light sage ground, Literata headings, Source Serif text, one muted leaf green.',
    strengths: [],
    weaknesses: [],
    pages: [
      { label: 'Home', href: '../index.html' },
      { label: 'How it works', href: '../how.html' },
      { label: 'About', href: '../about.html' },
      { label: 'Privacy', href: '../privacy.html' }
    ]
  },
  {
    id: '01-margin', num: '01', name: 'Margin',
    href: '01-margin/', notes: '01-margin/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'Money first: the two ways a prep count costs you, argued without one invented figure.',
    brief: 'Owners buy margin, not software. Position Tooey around profit: the prep count sits between food thrown out and dishes that run out. Make the financial case credible without quoting any number that is not the owner’s own.',
    headline: 'Restaurants make and lose money on small daily calls, like how much of each dish to prep.',
    concept: 'A prep count can miss in two directions, and only one leaves a trace: too many lands in food cost, too few is a sale the POS never records. One rule falls out of the arithmetic (when a dish sells for more than twice its plate cost, a missed order can cost more than a portion in the bin). A one-dish worksheet runs it on the owner’s own plate cost and price, and can drop those numbers into the contact message.',
    look: 'An accountant’s ledger: buff paper, a double red margin rule, losses in red brackets, every caveat ("Example", "Up to", "Not in the count yet") written in the left margin beside the claim it qualifies. Brygada 1918 and Archivo.',
    strengths: [
      'The most persuasive business case of the ten, and every number on it is either the owner’s own or labeled an example.',
      'The worksheet turns the call to action into a conversation about the owner’s numbers.',
      'Margin notes are an elegant, honest way to carry the qualifiers without cluttering the claims.'
    ],
    weaknesses: [
      'Seven sections; long for a busy owner.',
      'The margin column sits empty for long stretches on desktop.',
      'The worksheet’s "up to $X for this dish last week" is the nearest any site gets to a dollar claim; it needs Rex’s comfort.'
    ],
    ask: 'Is the worksheet’s "up to $X" acceptable?',
    pages: [
      { label: 'Home', href: '01-margin/index.html' },
      { label: 'Privacy', href: '01-margin/privacy.html' }
    ]
  },
  {
    id: '02-time-back', num: '02', name: 'Time back',
    href: '02-time-back/', notes: '02-time-back/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'Less time managing: the work happens while you are closed.',
    brief: 'The owner is chef, buyer, scheduler, and bookkeeper. Every tool so far added work. Position Tooey as the opposite: work done overnight, something useful waiting in the morning, and exactness about how little is asked.',
    headline: 'Tooey does its work while your restaurant is closed.',
    concept: 'The hero is one example day as a strip: your hours (prep, lunch, dinner, close), then a night-blue block of Tooey’s hours, then the email waiting at the next morning’s prep. The page is a timetable: night sections on dark, turning to paper at "Before prep". A time card lists exactly what the owner must do, ending with a crossed-out "Not your job: exports, uploads, typing in sales." Future chores are grouped by how often they come round.',
    look: 'Cream by day and night-navy by night, with a warm amber "now" dot. Besley headlines, Hanken Grotesk, DM Mono for times.',
    strengths: [
      'The day strip explains the whole proposition in one glance, without a word of marketing.',
      'The time card is the most exact statement of "what this asks of you" in any of the ten.',
      'Day and night give the page a natural rhythm and a reason for its color changes.'
    ],
    weaknesses: [
      'Long on phones (about 8,700px at 390 wide).',
      'An empty area left of the email card in the hero on wide screens.',
      'Shares the cream-paper family with 01 and 10, though its night sections set it apart.'
    ],
    ask: '"Nobody types anything in" depends on the nightly pull being live before partners finish setup.',
    pages: [
      { label: 'Home', href: '02-time-back/index.html' },
      { label: 'Privacy', href: '02-time-back/privacy.html' }
    ]
  },
  {
    id: '03-sandbox', num: '03', name: 'Try it',
    href: '03-sandbox/', notes: '03-sandbox/NOTES.md', stack: 'HTML, CSS, JS; sample data generated by _src/build-sample.mjs',
    line: 'Show, don’t tell: a week of lists at a sample restaurant you can click through.',
    brief: 'An owner understands a prep count the moment they see one. Make the centerpiece something to use: a clearly labeled sample restaurant whose counts behave exactly like the real product, with words in a supporting role.',
    headline: 'Tooey is software for independent restaurants. It starts with prep: each morning, how many of each dish to make.',
    concept: 'A week at "The Corner Booth", a made-up casual dine-in. Day-dot stickers pick the morning; the list shows only what the real list shows (Predicted, Prep, vs. last week, blanks with reasons). Click a dish for its last six same weekdays and what moved it. Built-in examples: fish and chips on Friday, salads on Mother’s Day, a big wings Monday, two honest blanks. A print button prints just the list.',
    look: 'Order-pad pink and oxblood. The sample is a white printout on a clipboard; everything that explains it is a yellow sticky note, with a key: "Paper is the list Tooey sends. Yellow notes are us." Big Shoulders Display, Barlow, Permanent Marker for note headers.',
    strengths: [
      'The fastest route to understanding: a visitor is using the product within seconds.',
      'Paper vs. sticky note makes "this is the product" vs. "this is our explanation" impossible to confuse.',
      'The sample data is internally consistent and exercises every real rule, including blanks.'
    ],
    weaknesses: [
      'Pink is an unusual ground for a business tool; Rex may find it soft. It also shares a blush note with 09.',
      'Even with notes clearly marked, a visitor may hope the real email explains each number the way the notes do.'
    ],
    ask: 'Does "vs. last week" compare against what actually sold, as the notes assume?',
    pages: [
      { label: 'Home', href: '03-sandbox/index.html' },
      { label: 'Privacy', href: '03-sandbox/privacy.html' }
    ]
  },
  {
    id: '04-glass-box', num: '04', name: 'Glass box',
    href: '04-glass-box/', notes: '04-glass-box/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'Automation you can see into: what goes into every count, and when it stays silent.',
    brief: 'Owners distrust black-box "AI". Make explainability and honesty the brand: what goes in, how a count is reached in plain terms, and what Tooey deliberately doesn’t do, such as leaving a blank instead of guessing.',
    headline: 'Restaurant software that tells you what goes into every number, and leaves the line blank when it can’t.',
    concept: 'The hero is a wiring diagram: four colored input wires (your sales, day of the week, time of year, holidays) run into a translucent "Tooey, overnight" box; one line comes out and runs down the sample list like a train line, each dish a stop. Weather, events, and reservations hang beside it as unplugged leads. Pick a dish to see exactly what went into its count. A forecast / recommend / act map has one filled stop.',
    look: 'Sea-glass green ground, bottle-green ink, four input colors used only on wires. One mark everywhere: a filled dot is in use, an open ring is left out on purpose. Overpass and Overpass Mono (road-sign lettering).',
    strengths: [
      'Explains the method more clearly than any other site, without a word of jargon.',
      '"A blank is a decline, not a zero" and the unplugged leads make honesty visible rather than claimed.',
      'The one-filled-stop roadmap is the cleanest live-vs-future device of the ten.'
    ],
    weaknesses: [
      'The hero diagram is dense on phones.',
      'Without JavaScript the glass box renders as an empty frame.',
      'Its pale green sits near 09’s celery, though composition and type differ.'
    ],
    ask: 'May the site state plainly that accuracy hasn’t been measured at a live restaurant?',
    pages: [
      { label: 'Home', href: '04-glass-box/index.html' },
      { label: 'Privacy', href: '04-glass-box/privacy.html' }
    ]
  },
  {
    id: '05-pilot-terms', num: '05', name: 'The offer',
    href: '05-pilot-terms/', notes: '05-pilot-terms/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'Candor as trust: the site is the pilot offer, with every term in plain view.',
    brief: 'Be the most candid company an owner has been pitched by. Tooey is early and small; make that the basis of trust. The site is an offer to join the pilot, and its terms (what it does, what it asks, cost, data, how to stop) are unmistakable.',
    headline: 'Tooey is early, and we’re looking for independent restaurants to try our daily prep count.',
    concept: 'The deal fits in four lines under the headline: Free / About 5 weeks / About a week / One email (to stop). The terms are a split page, "You put in" against "You get back", across four stages (To begin, Setup, Every morning after, If you stop). Undecided terms (price after the pilot, pilot length) are hatched blank fields marked "Not set", with the line "We left these blank instead of guessing, the same rule the list follows." "Ask about this" links seed the form; the terms print on one page.',
    look: 'One ballpoint-blue ink on white, like a form filled in with one pen. Atkinson Hyperlegible Next throughout, nothing an owner must read under 15px.',
    strengths: [
      'The clearest answer to "what’s the catch?" of the ten.',
      'Applying the product’s blank rule to the company’s own undecided terms is a genuinely original trust device.',
      'Printable terms suit an owner who wants to show a partner or chef.'
    ],
    weaknesses: [
      'A single blue reads calm but a little cool; warmth comes only from the copy.',
      'Long on phones, mostly the terms (about 8,300px at 390 wide).'
    ],
    ask: 'Confirm "To stop: one email", and publishing that pilot length and price aren’t decided.',
    pages: [
      { label: 'Home', href: '05-pilot-terms/index.html' },
      { label: 'Privacy', href: '05-pilot-terms/privacy.html' }
    ]
  },
  {
    id: '06-platform', num: '06', name: 'The long view',
    href: '06-platform/', notes: '06-platform/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'A company with a large ambition, and prep as its deliberate first piece.',
    brief: 'Introduce Tooey as the place an independent restaurant will understand, run, and grow its business. Today’s prep count is the foundation. The craft is separating live, next, and later so the vision inspires without implying it exists.',
    headline: 'Tooey is taking on the numbers side of running an independent restaurant, one job at a time.',
    concept: 'One rule: anything that works today has weight, anything not built has none. The first screen is a solid blue block ("Works today: the prep count", one example number) beside a wall of light type listing seven unbuilt pieces, "No dates, no set order." "Why prep came first" draws the forecast as a slab with prep standing on it and the rest only staked out. A switch, "Show only what works today", fades everything unbuilt off the page.',
    look: 'Concrete grey, near-black, and one strong blue used only as the fill for what’s built. Archivo at heavy-and-wide vs. thin. Square corners, heavy rules, full-width bands.',
    strengths: [
      'Reads as the most substantial company of the ten, without implying anything exists that doesn’t.',
      'The blue block against the wall of light type shows the ambition and the honest scale of today in one glance.',
      'The "show only what works today" switch lets an owner see day one exactly.'
    ],
    weaknesses: [
      'The plan table is eight rows of intent for a product that does one thing.',
      'The heavy/light contrast depends on the web font; it is briefly weaker before Archivo loads.'
    ],
    ask: 'Is Rex comfortable naming seven future areas, even undated and unordered?',
    pages: [
      { label: 'Home', href: '06-platform/index.html' },
      { label: 'Privacy', href: '06-platform/privacy.html' }
    ]
  },
  {
    id: '07-your-sales', num: '07', name: 'Your sales already know',
    href: '07-your-sales/', notes: '07-your-sales/NOTES.md', stack: 'Static HTML built by _src/build.mjs (Node, no dependencies)',
    line: 'The POS already holds the answers; Tooey reads them every night.',
    brief: 'Every restaurant already records exactly what guests want, and nobody has time to read it. Make the owner see their own sales history differently, and Tooey as its nightly reader, starting with tomorrow’s prep.',
    headline: 'Everything your guests have ordered is on record. Tooey reads it every night.',
    concept: 'The hero is one calendar page: Monday to Sunday ruled down through the headline, with five weeks of one sample dish (spicy rigatoni) printed large in the columns, past Tuesdays underlined and tomorrow\u2019s count circled: "Tuesday: we expect 15. Prep 17." Then a whole sample year of that dish, one plain number a night, folded like a printout so winter sits over summer. Four readings (day of the week, time of year, holidays, each dish\u2019s own sales) only change which numbers stand out; there are no charts. Those four are exactly the real inputs, so the section explains the method while teaching the owner to see their own record.',
    look: 'Lemon-yellow paper printed in one aubergine ink, with Tooey\u2019s marks (underlines, circles, notes) in vermilion pencil. Mona Sans condensed for headlines, Spline Sans Mono for every number. The year is read on an aubergine band.',
    strengths: [
      'The single best data idea of the ten: it makes an owner see their own sales history differently, honestly and without charts.',
      'The readings are exactly the real inputs, so understanding the page means understanding the product.',
      'The calendar hero shows what Tooey does in one picture: the past, read; tomorrow, circled.'
    ],
    weaknesses: [
      'A full lemon-yellow page is a strong choice, and it shares a yellow family with 08 (a paler tint is a one-token change).',
      'On phones the year becomes a sideways-swiping strip; an owner who never swipes sees about ten weeks.',
      'Dense in places; it rewards reading more than skimming.'
    ],
    ask: 'The hero promises the count arrives by email before prep, which depends on email delivery being live.',
    pages: [
      { label: 'Home', href: '07-your-sales/index.html' },
      { label: 'Privacy', href: '07-your-sales/privacy.html' }
    ]
  },
  {
    id: '08-the-analyst', num: '08', name: 'What the chains have',
    href: '08-the-analyst/', notes: '08-the-analyst/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'The analyst an independent restaurant could never hire, drawn as picture statistics.',
    brief: 'Chains have people who study sales, forecast demand, and plan labor. Independents have the owner, after close. Give the site a point of view: Tooey is on the independent’s side and brings that capability to them.',
    headline: 'Every night, Tooey goes through your sales the way a restaurant group’s analyst would.',
    concept: 'Built on Isotype, the 1920s method of drawing statistics as rows of symbols so ordinary people could read figures officials used to keep. Fig. 1 draws the sample list as plates (black for Predicted, red for the extra in Prep), with a "Drawn / As it arrives" switch to the plain list. Fig. 2 is the argument as a pictogram: at a group, one person per job; at an independent, one person with four jobs and "Sales numbers: nobody." A table of the analyst’s job marks only prep "In the pilot now".',
    look: 'Ochre ground with full blue, red, and grey sections; ink for type and buttons. Jost (Futura-like), Commissioner, IBM Plex Mono. A typographic "tooey" with a plate symbol.',
    strengths: [
      'The only site with a cause and a point of view; it gives Tooey a reason to exist beyond a feature.',
      'Isotype is a perfect fit for "numbers made readable for everyone", and nothing like the other nine.',
      'Says plainly that the nightly work is automated and that accuracy is unmeasured.'
    ],
    weaknesses: [
      'Full ochre may feel loud to some owners (a paler ochre is a one-line change).',
      'The drawn list is a translation of the email, one step removed from what actually arrives.',
      '"Analyst" in the headline promises breadth that today is a prep count; the job table carries the correction.'
    ],
    ask: 'Is "analyst" the right word for what Tooey does today?',
    pages: [
      { label: 'Home', href: '08-the-analyst/index.html' },
      { label: 'Privacy', href: '08-the-analyst/privacy.html' }
    ]
  },
  {
    id: '09-skeptic', num: '09', name: 'Straight answers',
    href: '09-skeptic/', notes: '09-skeptic/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'Built for the owner who has been burned by software before.',
    brief: 'Design for a guarded visitor. The site follows the doubts a real owner has, in the order they have them, and answers each one straight, including the uncomfortable ones, without becoming an FAQ page.',
    headline: '“Okay. What is Tooey, exactly?” Tooey works out the numbers an independent restaurant runs on, starting with how much of each dish to prep.',
    concept: 'The page is a two-voice table: the owner’s questions down one side, Tooey’s short answers at headline size on the other, ten exchanges in the order doubts arrive. Read only the big lines and you get the whole story: "We can’t promise that." "One list. That’s all of it, for now." "There’s nothing to chat with." "Not every day, and we haven’t measured how often." "It’s early. That’s the catch." "Send one email." Unbuilt features are answered "Not yet." in the conversation itself. The stop email is pre-written.',
    look: 'Blush for the owner (Gelasio italic, tomato), celery green for Tooey (Bitter slab, the logo’s leaf green). Each question stays in view while its answer scrolls on wide screens.',
    strengths: [
      'The most disarming site of the ten; it treats the visitor’s skepticism as reasonable.',
      'Reads nothing like an FAQ: the short answers work as headlines on their own.',
      'Two voices give the layout a reason and make it instantly scannable.'
    ],
    weaknesses: [
      'Still a long scroll on phones, even after the trim from 14 answers to 10.',
      'Tomato and green could tip festive if either were pushed.',
      'Some candor needs Rex’s sign-off: "Students. Will you still be around in a year?" is answered "We can’t promise that."'
    ],
    ask: 'Is "We can’t promise that" (on still being around in a year) too candid?',
    pages: [
      { label: 'Home', href: '09-skeptic/index.html' },
      { label: 'Privacy', href: '09-skeptic/privacy.html' }
    ]
  },
  {
    id: '10-quiet', num: '10', name: 'Less',
    href: '10-quiet/', notes: '10-quiet/NOTES.md', stack: 'Hand-written HTML, CSS, JS',
    line: 'Radical restraint: fewer things to worry about, said in very few words.',
    brief: 'Running a restaurant is loud; Tooey promises fewer worries. Build the most reductive site that still fully informs, so the visitor feels what having Tooey is like as much as understands what it does.',
    headline: 'Tooey works on tomorrow while you’re closed.',
    concept: 'One centered column, one idea at a time: an example list, then one row of it explained large, what goes in and what doesn’t yet, the blank rows as the trust argument, setup, "We’re early, and we’d like you to check our work", and one change of tone for the vision ("Prep is where we’re starting"). Then the form.',
    look: 'Warm paper and ink, Newsreader and Hanken Grotesk. The only color is a small blue pilot-light flame in the wordmark and beside "Free while we’re in a pilot", breathing slowly.',
    strengths: [
      'The calmest, most confident voice; every line earns its place.',
      'Still answers everything an owner needs in under a minute of reading.',
      'Closest in spirit to the current site’s taste, but more disciplined.'
    ],
    weaknesses: [
      'Wide empty margins on large screens; Rex has found white space "too white" before.',
      'Shares the warm-paper family with 01 and 02.',
      'The pilot-light flame is subtle and, alone, could suggest a gas or energy company.'
    ],
    ask: 'A typed wordmark with a flame instead of logo.png: acceptable?',
    pages: [
      { label: 'Home', href: '10-quiet/index.html' },
      { label: 'Privacy', href: '10-quiet/privacy.html' }
    ]
  }
];
