# Exploration 06: Foundation ("The long view")

Preview: serve the repo root (`python3 -m http.server 5206`) and open
`/explorations/06-platform/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey is taking on the numbers side of running an independent restaurant one
job at a time, and the first job, each morning's prep count, works today.

## 2. Core message and why

One visual rule runs through the whole site: **what works today has mass;
what isn't built has none.** Built things are solid blocks of blue with heavy,
wide type. Unbuilt things are set in light type on bare ground, with no box,
no picture, and no number. The legend says it in plain words ("Solid blue and
heavy type: works today. Light type: not built yet."), and a switch, "Show
only what works today", fades every unbuilt thing off the page. What's left is
exactly what an owner gets on day one.

The brief's hard problem is showing a big ambition without implying the later
parts exist. Weight answers it without a disclaimer on every line: you can
see how much of the company is real (one block) and how much is intended (a
wall of light type) at a glance, and the proportion itself is honest.

The argument for the vision is a footing: most of an owner's weekly calls
lean on "how much are we going to sell?" Prep is the first thing standing on
that forecast; ordering, staffing, and marketing would stand on the same
footing. A second reason is given plainly: a prep count can be checked
against what sold every day, so it is the right place to earn trust.

## 3. What the visitor understands first, and the journey

First screen: a large, plain headline (the company's scope in one sentence),
a lead that says what works today, a "Talk to us" button, and then the
**scope band**. On the left, a solid blue block: "Works today. The prep
count. 42: cheeseburgers to make on Thursday, at a sample restaurant. An
example value." On the right, in light type: "Not built yet. No dates, no set
order. Ordering / Staffing / Sharper counts / What makes money / Bringing
people back / The whole picture / Doing it for you."

Then:
1. **What you get on day one.** The only full prep list on the site, set as a
   large table directly on the page with each column explained in its header,
   blanks shown with their reasons, and a list of facts: how it arrives, what
   it's made from, what it doesn't use yet (in light type), where the sales
   come from, what you need to start, setup, who decides.
2. **Why prep came first.** The footing argument, then a full-width drawing:
   a blue slab across the whole page ("Tomorrow's sales, dish by dish. The
   forecast underneath. Works today."), a blue column for Prep standing on
   it, and Ordering, Staffing, and Marketing only *staked out*: a thin line
   with a marker and a light name, the way a building site marks where a wall
   will go before anything is built.
3. **Where Tooey is going.** The aim in one paragraph, a three-step ladder
   (shows you, suggests, does it if you say so) with the first two in blue
   and the prep count marked at step two, and a table of pieces. One blue row
   for what works today; one group, "Not built yet", for the other seven, each
   with the owner's question and what it would need. No dates, no order.
4. **Joining now.** A full blue section, because talking to the team works
   today: students, pilot, free for now, no price yet, "Join for the prep
   count. If a better number each morning isn't worth a week of setup to
   you, nothing that isn't built yet should change your mind." Then the form.

## 4. How it builds trust

- One visible rule separating real from intended, and a switch that removes
  the intended entirely.
- Unbuilt pieces get no pictures, numbers, screens, or dates. The plan says
  what each *would need* from the restaurant, which explains why it isn't
  built instead of selling it.
- The blank rows are shown and explained ("a decline, not a zero").
- Being early is stated as fact: students, pilot, free for now, no price yet.
  The site tells owners not to join for the vision.
- Every sample value is labelled "Sample restaurant" and "Example value(s)".
- No testimonials, logos, figures, badges, or POS logos.

## 5. Design and interaction rationale

- **Type.** Archivo, one variable family (weight 100 to 900, width 62 to
  125%), self-hosted, 90 KB. Built things and headings are set heavy and
  slightly wide (about 780 weight, 112% width): monumental and institutional,
  the voice of a company that means to last. Unbuilt things are set at 220
  weight. Because one family carries both states, the difference is purely
  substance, which is the point. Tabular figures throughout.
- **Color.** Concrete grey ground (#e5e5e0), near-black text, and one
  ultramarine (#2236c4) used only as material: it fills what's built, the
  footing, the call to act, and the Prep numbers in the table. It is never an
  accent sprinkled on decoration, and links stay black. White on the blue is
  8.8:1; the blue on grey is 6.9:1.
- **Composition.** Square corners everywhere, heavy rules (3px under table
  headers and above lists), full-bleed bands for the footing and the closing
  section, and no cards or shadows. The structure reads as built, not
  decorated.
- **The 42.** One huge number in the opening instead of a sample sheet. It
  says "this tells you how many to make" in a second, and leaves the full
  list to Day one, where it does a different job (anatomy).
- **Motion.** Almost none: hover states, the switch, and the fade when
  unbuilt things are hidden. Off under `prefers-reduced-motion`.
- **Responsive.** The scope band stacks below 1100px; the plan table becomes
  labelled blocks below 860px; the drawing's names turn vertical on phones;
  the facts list goes two-up on tablets. Checked at 1440, 1024, 768, 390, and
  320 with no sideways scroll.
- **No JavaScript.** All content reads; the phone nav shows as plain links;
  the switch is hidden (it needs JS); the form posts to FormSubmit's normal
  endpoint as a fallback.
- **Form.** JSON POST to `https://formsubmit.co/ajax/tooeyteam@gmail.com`
  with name, restaurant, email, phone, pos, message, `_subject`, `_template`,
  `_captcha`, and a `_honey` honeypot. Inline validation, a sending state, a
  failure message (white panel, readable on the blue) that keeps the text and
  offers the email address, and a focused thank-you. The message field asks
  "How does prep work in your kitchen now?"

## 6. Illustrative vs. factual

Illustrative (labelled as examples): the "42" and its caption, every number
and dish in the Day one table, "Thursday", "Sample restaurant", and the
wording of the two blank reasons.

Factual (from the brief, nothing added): pilot, free for now, no price or
trial length; small team of university students; Tooey LLC; Predicted, Prep,
and change vs. the same weekday last week, grouped by category; blanks under
about five weeks or about one a day; inputs (past item-level sales, day of
week, time of year, holidays) and non-inputs (weather, events, reservations);
nightly POS download, Square/Toast/Clover exports recognised and others
mapped; five weeks of history; about a week of setup and what happens in it;
email before prep, printable; the owner checks counts against sales and
decides; every privacy statement.

Vision (always light type, never a picture): ordering, staffing, sharper
counts (weather, events, reservations), what makes money, bringing people
back, the whole picture, doing it for you. The "what it would need" notes
are reasoning about inputs, not product specs.

## 7. Strengths, weaknesses, open questions

Strengths
- The weight rule shows the today/not-yet line at a glance. The opening
  shows both the size of the ambition and how small the real part is, and
  that honesty is what makes the ambition believable.
- "Show only what works today" answers "what do I get on day one?" in a
  click.
- The footing and the staked-out positions give the vision a logic an owner
  can repeat, drawn in terms a contractor would recognise.
- It reads as a substantial company (scale, rules, full-bleed structure)
  without claiming anything it hasn't built.

Weaknesses
- The plan table is still eight rows of intent. It is restrained, but a
  skeptical reader may feel it's a long list for a product that does one
  thing.
- Light type depends on the font loading. Before Archivo arrives, the
  fallback (Helvetica/Arial) has fewer weights, so the contrast between
  built and unbuilt is weaker for a moment.
- The headline is big; at 320 wide it takes six lines before the lead.
- Blue is a common colour for software. Here it is used as material in large
  fields rather than as a UI accent, but next to other blue sites it would
  need its scale to stand apart.

Open questions for the founder
- The seven unbuilt pieces are listed in a sensible reading order, but the
  site says there is no set order. Is it worth showing them alphabetically to
  make that even more literal?
- The "what it would need" column guesses at inputs for unbuilt pieces. Worth
  a check that none conflicts with what the team plans.
- "Doing it for you" (acting on the owner's behalf) is the furthest piece. Is
  the founder comfortable naming it at all?
- Headline: "taking on the numbers side" is meant to cover growth and
  marketing too. If that feels narrow, an alternative is "Tooey is building
  help for running an independent restaurant, one job at a time."
- `og:image` uses a relative path (`img/og.png`). Most link previews need an
  absolute URL; set it once the domain is known.

## 8. Stack

Hand-written HTML, CSS, and a small vanilla JS file. No build step.

- `index.html`, `privacy.html`, `styles.css`, `site.js`
- `fonts/archivo.woff2`: Archivo variable (weight and width axes), latin
  subset from fontsource, with its OFL licence.
- `img/logo.png` (the existing wordmark), `favicon.svg` (a spoon-and-leaf mark
  on the blue, drawn for this exploration after the wordmark),
  `img/favicon-32.png`, `img/apple-touch-icon.png`, and `img/og.png`
  (1200x630, rendered from the opening with Playwright).

## Revision (after review)

The first version ("Ink and pencil") used warm cream paper, a serif
(Piazzolla) for headings, a black rectangular button, a white card with a
sample prep list as the opening picture, and dashed pencil outlines for
anything not built. Several separate explorations had landed in that same
family, and side by side they couldn't be told apart. The strategy and the
copy were kept; the visual and interactive identity was rebuilt from the
strategy instead of from "paper on a counter":

- **Live vs. intent** went from ink vs. pencil (solid vs. dashed outline) to
  **mass vs. no mass**: solid blue blocks and heavy type for what's built,
  light type on bare ground for what isn't. There are no outlines, no dashed
  borders, and no ghost sheets.
- **Type** went from Piazzolla and IBM Plex to one family, Archivo, with
  weight carrying the meaning. Six font files became one (210 KB to 90 KB).
- **Palette** went from cream, ink, and graphite to concrete grey,
  near-black, and one ultramarine used as material.
- **Composition**: no cards, no shadows, square corners, heavy rules,
  full-bleed bands. The opening is a scope band (one blue block, one wall of
  light type) instead of a sample sheet beside the headline.
- **The prep list now appears once**, in Day one, with each column explained
  in its header. The opening shows a single example number instead.
- **Next and Later are merged** into one "Not built yet" group with "no dates
  and no set order", since the team hasn't committed to an order.
- **The footing drawing** now spans the full page width, and unbuilt pieces
  are staked out (a line and a marker) instead of drawn as hatched boxes.
- The closing section became a full blue band: talking to the team works
  today, so it is built in the same material.
