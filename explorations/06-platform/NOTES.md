# Exploration 06: Ink and pencil ("The long view")

Preview: serve the repo root (`python3 -m http.server 5206`) and open
`/explorations/06-platform/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey is taking on the numbers side of running an independent restaurant one
job at a time, and the first job, each morning's prep count, works today.

## 2. Core message and why

The site makes one visual rule and keeps it everywhere: **what works today is
drawn in ink; where Tooey is going is drawn in pencil.** Ink is solid black,
upright type, real (example) numbers. Pencil is graphite italic, dashed
outlines, and no numbers, because nothing in pencil exists to produce one.

The brief's hard problem is showing a big ambition without implying the later
parts exist. Rather than solving it with disclaimers, the site gives the owner
a grammar they already know ("pencil it in" means tentative) and applies it to
every element: the hero picture, the diagram, the plan, even a spec row. A
switch, "Show only what works today", erases the pencil from the whole page,
so the owner can see exactly what day one is with one click.

The argument for the vision is a footing, not a feature list: most of an
owner's weekly calls lean on "how much are we going to sell?" Prep is the first
thing standing on that forecast; ordering, staffing, and marketing would stand
on the same footing. A second reason is given plainly: a prep count can be
checked against what sold every day, so it is the right place to earn trust.

## 3. What the visitor understands first, and the journey

First screen: the headline (the company's scope, in a plain sentence), a lead
that says exactly what works today, two actions, and the ink/pencil legend.
Beside it, the ink prep sheet with four blank pencil sheets stacked behind it
(Order list, Staffing for Friday, What each dish earns, Who's coming back).
The caption says they're blank because they don't exist yet.

Then:
1. **What you get on day one.** The sheet again at full size with numbered
   marks (Predicted, Prep, vs. last Thu, a blank), and a spec list: how it
   arrives, what it's made from, what it doesn't use yet (in pencil), where
   the sales come from, what you need to start, setup, who decides.
2. **Why prep came first.** The footing argument and a drawing: the forecast
   as an ink footing, Prep as an ink post, Ordering/Staffing/Marketing as
   hatched pencil posts on graph paper.
3. **Where Tooey is going.** The aim in one paragraph (no dates, will change),
   a three-step ladder (shows you, suggests, does it if you say so) with the
   prep count marked at step two, and a schedule table: each piece, the
   owner's question it answers, and what it would need from the restaurant.
   Grouped as Works today (ink), Next (pencil, "intent, no dates"), Later
   (pencil, "needs more of your records and more of your trust").
4. **Joining now.** Who the team is, free for now during the pilot, no price
   yet, and the most important line on the page: "Join for the prep count. If
   a better number each morning isn't worth a week of setup to you, nothing in
   pencil on this page should change your mind." Then the form.

Day one comes before the vision on purpose: the owner sees the concrete thing,
then why it is first, then what it is the first of, then the ask.

## 4. How it builds trust

- One consistent, visible rule separating real from intended, plus a switch
  that removes the intended entirely.
- Pencil items carry no numbers, screens, or dates. The plan says what each
  piece *would need* from the restaurant, which explains why it isn't built
  rather than selling it.
- The blank row is shown and explained ("a decline, not a zero").
- Being early is stated as a fact, not dressed up: students, pilot, free for
  now, no price yet. The site tells owners not to join for the vision.
- Every sample value is labelled "Example values" and "Sample restaurant".
- No testimonials, logos, figures, badges, or POS logos.

## 5. Design and interaction rationale

- **Type.** Piazzolla (variable, optical sizes) for headings and anything in
  ink; its italic is the pencil voice. IBM Plex Sans for reading text and UI,
  Plex Mono for the numbers on the sheet. Piazzolla's tight display cut reads
  as an established publication rather than a startup template; Plex has the
  plain, drafted feel of a plan. None of the founder's rejected fonts.
- **Color.** Warm paper (#f5f2ec), warm ink (#1d1a16), graphite (#5d5952),
  and a sheet white. Matches the wordmark's warm grey. One green, used only
  for focus rings. No gradients, glows, or accent splashes.
- **Pencil drawing.** Dashed outlines run through a light SVG displacement
  filter so they look drawn, plus a faint hatch on the diagram's posts.
- **Motion.** Almost none. Only hover/focus transitions and the fade when the
  pencil is hidden. Off under `prefers-reduced-motion`.
- **Layout.** Alternating paper and deeper paper bands, a 1240px measure,
  two-column sections that stack below 1100px. The plan table turns into
  labelled blocks below 820px; the diagram's posts take vertical labels on
  phones. Checked at 1440, 1024, 768, 390, and 320 with no sideways scroll.
- **No JavaScript.** All content reads; the phone nav shows as wrapped links;
  the pencil switch is hidden (it needs JS); the form posts to FormSubmit's
  normal endpoint as a fallback.
- **Form.** JSON POST to `https://formsubmit.co/ajax/tooeyteam@gmail.com`
  with name, restaurant, email, phone, pos, message, `_subject`, `_template`,
  `_captcha`, and a `_honey` honeypot. Inline validation, a sending state, a
  failure message that keeps the text and offers the email address, and a
  focused thank-you. The message field asks "How does prep work in your
  kitchen now?", which gives the team something useful to reply to.

## 6. Illustrative vs. factual

Illustrative (labelled as examples): every number and dish on both prep
sheets (Cheeseburger 38/42/+6%, etc.), "Thursday", "Wednesday's sales", the
"Sample restaurant", the two blank reasons as worded, and the ghost sheet
titles in the hero.

Factual (from the brief, nothing added): pilot, free for now, no price or
trial length; small team of university students; Tooey LLC; the per-dish
Predicted / Prep / change vs. same weekday last week, grouped by category;
blanks under about five weeks or about one a day; inputs (past item-level
sales, day of week, time of year, holidays) and the non-inputs (weather,
events, reservations); nightly POS download, Square/Toast/Clover exports
recognised and others mapped; five weeks of history; about a week of setup
and what happens in it; email before prep, printable; the owner checks counts
against sales and decides; every privacy statement.

Vision (always in pencil): ordering, staffing, sharper counts (weather,
events, reservations), what makes money, bringing people back, the whole
picture, doing it for you. The "what it would need" notes are reasoning about
inputs, not product specs.

## 7. Strengths, weaknesses, open questions

Strengths
- The ink/pencil rule makes the today/next/later line obvious at a glance and
  carries the whole visual identity, so honesty is the design, not a footnote.
- "Show only what works today" is a concrete answer to "what do I get on day
  one?"
- The footing argument gives the vision a logic an owner can repeat.

Weaknesses
- The schedule table is still eight rows of intent. It is honest and
  restrained, but a skeptical reader may still feel it's a long list for a
  product that does one thing.
- The prep sheet appears twice (hero and day one). It is deliberate (same
  sheet, then explained), but costs some novelty.
- The pencil roughness filter is subtle; in Safari it may fall back to plain
  dashed lines (still correct, a little more digital).
- Page is long on phones because the plan table stacks.

Open questions for the founder
- **Next vs. Later.** The split (ordering, staffing, sharper counts as Next)
  is my reading of what builds most directly on the forecast. The team has
  not committed to an order. If even a loose grouping is too much, the two
  pencil groups can merge into one "Later" group with no change to the design.
- The "what it would need" column guesses at inputs for unbuilt pieces. Worth
  a check that none of them conflicts with what the team plans.
- "Doing it for you" (acting on the owner's behalf) is the furthest piece. Is
  the founder comfortable naming it on the site at all?
- Headline: "taking on the numbers side" is meant to cover growth and
  marketing too. If that feels narrow, an alternative is "Tooey is building
  help for running an independent restaurant, one job at a time."
- `og:image` uses a relative path (`img/og.png`). Most link previews need an
  absolute URL; set it once the domain is known.

## 8. Stack

Hand-written HTML, CSS, and a small vanilla JS file. No build step.

- `index.html`, `privacy.html`, `styles.css`, `site.js`
- `fonts/`: Piazzolla (roman + italic, variable) and IBM Plex Sans 400/500/600
  and Plex Mono 400/600, latin subsets as woff2 from fontsource, with their
  OFL licence files. About 210 KB total.
- `img/logo.png` (the existing wordmark), `favicon.svg` (a spoon-and-leaf
  mark drawn for this exploration, after the wordmark), `img/favicon-32.png`,
  `img/apple-touch-icon.png`, and `img/og.png` (1200x630, rendered from the
  hero with Playwright).
