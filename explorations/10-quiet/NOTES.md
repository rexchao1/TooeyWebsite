# 10 · Quiet ("Less")

Preview: serve the repo root (`python3 -m http.server 5210`) and open
`/explorations/10-quiet/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey does a restaurant's number work overnight, so the owner starts the
morning with fewer questions. Today it answers one of them: how much of each
dish to make.

## 2. Core message, and why

**"Tooey works on tomorrow while you're closed."**

It names the company and how it behaves, not a feature. It doesn't make
forecasting the whole company: "works on tomorrow" has room for staffing,
margins and the rest later. It's also the feeling the brief asks for (steady,
there before you need it) said as a plain sentence, not a two-part slogan. The
lead under it covers today's product exactly: nightly sales from the POS, a
list in your email before prep, how many of each dish to make.

## 3. What the visitor understands first, and the journey

In the first viewport, at every width: what Tooey is (headline), what it does
today (lead), that it's free during the pilot, and how to start (a button). On
desktop the top of the example list also shows.

After that the page takes **one idea at a time**, and most of the ideas zoom
in on one part of that same example list:

1. **The list** (hero): an example prep list, grouped by category, with
   Predicted, Prep and vs. last week, plus one blank row.
2. **One line, explained.** "Prep is a little more than we expect you to
   sell." A single row of the list set large: Predicted, Prep, vs. last week.
3. **What goes in.** "Every count starts from your own sales." Two short
   lists: what goes in, and what doesn't yet (weather, local events,
   reservations).
4. **The blank.** "When there isn't enough to go on, we leave it blank." The
   two blank cases, with an empty slot where the number would be.
5. **Starting.** About five weeks of sales and about a week of setup, and
   what the owner does that week.
6. **Being early.** Students, a pilot, check our counts, you decide.
7. **Where it's going.** The only change of tone on the page, a slightly
   darker paper band. It gives the vision as four questions an owner "carries
   home at night", clearly labeled as what we want, and ends by echoing the
   headline.
8. **Talk to us.** The form.

## 4. How it builds trust

- It says less, and says exactly what's true. Every claim comes from the
  facts sheet. There are no figures, no logos, no quotes.
- The blank row is the centrepiece of the trust argument: a product that
  leaves a line blank rather than guess. It shows up in the hero list before
  it's explained, so the explanation answers a question the owner already has.
- "Not yet" is written out: weather, events and reservations, listed in grey.
- Being early is its own section, with an invitation to check the work.
  "You decide what to make" stays in.
- The example is labeled twice ("Example" on the sheet, and a caption saying
  the dishes and numbers are made up).
- Each fact appears once. "Free" appears once, in the hero.

## 5. Design and interaction rationale

- **One column, one sheet, one colour.** Warm paper (#f3f0e8), warm ink, and
  a single accent: a small blue **pilot light**. It sits in the wordmark, next
  to "Free while we're in a pilot.", and in the favicon. A pilot light is the
  small flame that stays lit in a kitchen so the burners light at once:
  quiet, steady, ready before you need it. It's also the pilot. The page
  never spells out the pun.
- **Type.** Newsreader carries the voice: display cut, light, for headings,
  and text cut for paragraphs. Hanken Grotesk carries anything that is the
  product's own output or UI (the list, labels, buttons, form). That split
  helps the owner tell "what we say" apart from "what you'd get". Neither
  face is on the founder's list of rejected fonts. Both are self-hosted, OFL,
  and subset to Latin. The Newsreader optical sizes are pinned to two static
  cuts to keep the weight down (about 140 KB of fonts in total).
- **Wordmark.** "tooey" is set in Newsreader with the flame, instead of the
  raster `logo.png`, which looks soft on high-density screens and brings in
  colours that clash with the page's one accent. (Open question below.)
- **Rhythm.** The gap between ideas is the same every time, so the page keeps
  a steady pace. Hairlines (black on top, light between rows) carry the
  printed-list look into the exhibits. Exhibits and text-only sections take
  turns, so the stack doesn't read as a template.
- **Motion.** Almost none. The pilot flame breathes very slowly (it is off
  under reduced motion), and anchor scrolling is smooth only when motion is
  allowed.
- **Day-aware example.** The sample sheet is titled for the day the
  visitor's next list would cover: today until 2 pm, tomorrow after that. "vs.
  last Tue" follows the same day. Without JavaScript it reads Tuesday. It's a
  small sign that the thing keeps time, and it isn't a gimmick.
- **Form.** Name, restaurant and email are required. Phone, POS and message
  are optional. Errors are shown inline, in the page's own words, and focus
  moves to the first problem. The button shows "Sending…", then a calm
  success state takes focus. A failure keeps what was typed and gives the
  email address. The honeypot fakes success and sends nothing. Without
  JavaScript the form posts to FormSubmit's standard endpoint.
- **Phone.** The header is just the wordmark and "Talk to us", so it needs
  no menu. On narrow screens the list keeps all four columns, with the "vs.
  last" heading broken over two lines.
- **Print.** A small print stylesheet drops the navigation, buttons, form and footer (not checked on paper).

## 6. Illustrative vs. factual

Illustrative, labeled "Example" and with a caption: every dish name, every
number (42/45, 31/33, 24/26, 18/20, +8% and the rest), the category names,
the two blank dishes (Short rib ragù, Affogato), and the reason wording on
the blank rows. The OG image only repeats the headline and facts.

Factual, from the facts sheet: nightly recompute from the day's sales;
Predicted, Prep (a little over Predicted, cushion size not stated), and change
vs. the same weekday last week; grouping by category; blanks for items under
about five weeks on the menu or under about one sale a day; the inputs and
non-inputs; about five weeks of history; about a week of setup and what
happens in it; a nightly download that works with most POS systems; email
before prep and printable; free during the pilot; small student team; the
owner checks counts and decides; the full privacy text.

Vision, labeled as "Over time we want…": margins, costs, staffing, and
weather-aware forecasts.

## 7. Strengths, weaknesses, open questions

Strengths
- Within a few seconds the owner knows what it is, what it does today, that
  it's free for now, and where to click. There's very little to read.
- It has a real idea behind it (the night shift, the pilot light, the blank)
  rather than just whitespace.
- Honest without apologising. The blank row and "Not yet" do more for trust
  than any badge would.

Weaknesses
- At 1440 px and wider, the single centered column leaves wide empty margins.
  It's deliberate, but a founder who found the old hero "too white" may feel
  the same here.
- The flame is subtle. Most visitors won't connect "pilot light" with
  "pilot", and that's fine. But a flame can also suggest a gas or energy
  company if it's seen without context, for example as a favicon on its own.
- There's no picture of the morning email itself. The sheet stands in for
  it.
- The OG image path is relative (`og.png`). Some scrapers need an absolute
  URL, so set it once the domain is known.

Questions for the founder
- Is a typographic wordmark acceptable, or must `logo.png` (spoon and leaf)
  appear? If it must, it belongs in the footer, and the flame stays the
  accent.
- Is "Tooey works on tomorrow while you're closed." broad enough as the
  company line, given the "not just forecasting" rule?
- The 2 pm cutover for the example's day is arbitrary. Does it match when
  real lists are computed?

## 8. Stack

Hand-written HTML, CSS and a small vanilla JS file (`site.js`, about 3 KB).
There is no build step and nothing to install. The fonts in `fonts/` were
made from the `@fontsource-variable/newsreader` and `hanken-grotesk` packages:
Newsreader was instanced with fontTools (display opsz 56, weights 300–460;
text opsz 16, weights 400–560; italic opsz 16, weight 400) and subset to
Latin. OFL licences are next to the files. `og.png` is a 1200×630 render of
the page's own type.
