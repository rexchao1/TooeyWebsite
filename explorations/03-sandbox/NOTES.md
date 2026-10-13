# Exploration 03: "Try it"

Preview: serve the repo root (`python3 -m http.server 5203`) and open
`/explorations/03-sandbox/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Each morning before prep, Tooey tells an independent restaurant how many of
each dish to make, worked out from its own sales, and the site lets an owner
read a week of those lists for a sample restaurant before believing a word of
it.

## 2. Core message and why

"Here is the list you would get. Read it." An owner judges a prep count the
way they judge a ticket: by looking at one. So the headline says plainly what
arrives and when, the lead says it is the first piece of a bigger product, and
the page goes straight into a working week at The Corner Booth, a made-up
casual dine-in place (about 80 seats, lunch and dinner). The words around it
answer what the sample leaves open: what it takes to get one, what Tooey is,
what isn't proven yet, and how to start.

## 3. What the visitor understands first, and the journey

1. Headline: a list of how many of each dish to make, each morning before
   prep. Lead: worked out overnight from your sales, first of what we're
   building, free for now during a pilot. One button: Ask about the pilot.
2. The sample (visible above the fold on a laptop): seven day dots,
   Monday to Sunday of an early-May week. A one-line strip says what that
   morning's counts go by (past sales, day, time of year, holiday) and what
   they don't (weather, local events, reservations). Below it the list.
   Beside it (or under it on a phone), "Reading the list" explains each
   column and what a blank means, with four shortcuts: fish and chips on
   Friday (day of the week), a salad on Mother's Day (holiday plus time of
   year), wings on Monday (why the change column can jump), and the veggie
   burger's blank.
3. Pick a dish and a notes panel opens: Predicted, Prep, change against last
   week and what sold then, a small bar chart of its last six same weekdays
   with today's count and a Prep tick, one or two plain sentences on what
   moved it, and that dish's Prep for the whole week, which you can click to
   follow it across days. On a phone the notes open inline under the row.
4. A bridge line: your list would have your own dishes and counts. Then the
   four setup steps (write to us; nightly POS download; about a week of
   setup; the list each morning, checked against sales during the pilot).
5. About Tooey: the team, the aim, and a Today / Where we want to take it
   box that keeps the vision visibly separate from what exists.
6. Ask about the pilot: two short facts at the point of decision ("Not
   measured yet", "Your sales stay yours") and the form.

## 4. How it builds trust

- The visitor checks the product instead of taking our word for it. The
  numbers hang together: past weeks, last week, Predicted and Prep are
  derived from one consistent model, so a curious owner who adds things up
  won't catch the sample out.
- It shows its limits on purpose. Blanks are featured, not hidden. The inputs
  strip names what isn't used. One note shows a big swing against last week
  and explains it. "Not measured yet" says outright that accuracy at a live
  restaurant hasn't been measured, which is why the pilot asks you to check
  the counts against what sold.
- Labeling is everywhere it needs to be: hero, sample heading, under the
  sheet, the notes panel ("Our notes on the sample. The real list is only the
  sheet."), the printout, the footer.
- Each fact is said once (free appears once in the visible copy). No
  testimonials, logos, figures or badges.

## 5. Design and interaction rationale

- The sheet is the product, and nothing else is on it. It shows only what
  the real list shows: restaurant, day, items grouped by category,
  Predicted, Prep (bold, in a lightly tinted column because it's the number
  the cook acts on), change vs. the same weekday last week, and blanks with
  their reason. Everything explanatory lives outside the sheet in "our
  notes", so the demo can't imply the product explains itself or tags
  holidays. "Print this list" prints the sheet alone on one page, because
  the real one is printed for the line.
- Day dots. Kitchens label prepped food with day-colored stickers (Monday
  blue, Tuesday yellow, Wednesday red, Thursday brown, Friday green, Saturday
  orange, Sunday black). The day picker uses those colors as rings, filled
  when selected. An owner recognizes it without being told; nobody else
  needs it explained.
- Type: Besley (a Clarendon, the face of printed menus and diner signs) for
  headings and the day on the sheet; Red Hat Text for everything else, with
  tabular figures so columns line up. Atkinson Hyperlegible was tried first
  and dropped: its slashed zero turned "0%" into "Ø%" on the list. All
  fonts are OFL and self-hosted (four woff2 files, about 63 KB).
- Color: warm paper (#f6f3ec), a darker band for the sample and the form,
  green from the logo's leaf for actions, and highlighter yellow for "the
  thing you're looking at" (selected row, today's bar). Everything passes
  WCAG AA (lowest pair 4.9:1).
- Motion is limited to a short fade when the day or dish changes and the day
  dot lifting on hover. All of it is off under prefers-reduced-motion.
- Keyboard: the days are a proper tablist (arrow keys, Home and End); every
  dish is a button with aria-expanded; the week strip and "back" button move
  focus sensibly; a polite live region announces the dish and its numbers.
- Without JavaScript the page shows Tuesday's full list, the reading guide,
  plain wrapping navigation, and a form that posts straight to FormSubmit.

## 6. Illustrative vs. factual

Illustrative (made up, labeled as a sample): The Corner Booth, its menu,
seat count, every number, the early-May week, the six weeks of history, the
per-dish stories in the notes (soup slowing in spring, salads climbing, fish
and chips on Fridays, Mother's Day lifts, a big wings Monday, a slow sundae
Thursday). The Prep cushion in the sample is about 8% (minimum one) and is
never stated. Last week's sales are held closer to normal than real item
sales would be so the change column stays readable; three hand-set days show
what large swings look like.

Factual (from the brief, nothing beyond it): the list's columns, grouping and
blanks (under about five weeks on the menu, or under one a day); the four
inputs and the three non-inputs; nightly recompute; morning email before
prep; printable; about five weeks of sales to start; about a week of setup
and what happens in it; nightly POS download that works with most systems
(Square, Toast, Clover exports recognized, others mapped); free for now
during the pilot; small team of university students, Tooey LLC; privacy
facts; the vision, shown only as direction.

## 7. Strengths, weaknesses, open questions

Strengths
- An owner gets it by doing, in under a minute: pick Friday, see fish and
  chips jump; pick Sunday, see Mother's Day; tap a blank, see why it's blank.
- The demo can't overclaim: the sheet carries only real product fields, and
  the explanation is visibly ours.
- It's honest about being early without sounding apologetic.
- Small and fast: hand-written HTML and CSS, about 15 KB of JS plus 24 KB of sample data; no
  framework.

Weaknesses
- The headline is about prep. The lead and About section carry the wider
  company, but Rex has rejected headlines that make forecasting sound like
  the whole company. This brief puts the product first; it's a trade-off.
- The notes' per-dish explanations are written for the sample. A visitor
  might reasonably assume the real product explains its numbers like this.
  The label says otherwise, but it's the main risk of the concept.
- On a phone the list is long (16 dishes) and the reading guide sits under
  it; first-time visitors there rely on the "pick any dish" line.
- The hero is typographically strong but plain; the visual interest starts
  at the sample.

Open questions for the founder
- Does "vs. last Tue" compare today's Predicted with what actually sold last
  Tuesday (as the notes assume, "sold 21") or with last Tuesday's prediction?
- Is it fine to say on the site that accuracy hasn't been measured at a live
  restaurant ("Not measured yet")? It's true and builds trust, but it's a
  new statement.
- What does the real list's header show (date? holiday?). The sample shows
  only the day and leaves holidays off the sheet to be safe.
- Should the sample restaurant have a name? "The Corner Booth" is generic
  and labeled everywhere, but some real place may share it.
- Would a "your restaurant" call to action that pre-fills the form with what
  the visitor explored (e.g. which dishes they looked at) be welcome, or too
  cute?

## 8. Stack and rebuilding

Hand-written static site, no framework and no install step. Files:

- `index.html`, `privacy.html`, `styles.css`, `site.js` (ES module: menu,
  sample interactions, form), `sample.js` (pure rendering of the list and
  notes, shared by the browser and the build script), `sample-data.js`
  (generated), `fonts/` (woff2 + OFL licenses), `logo.png`, `favicon.svg`,
  `og.png`.
- `_src/build-sample.mjs` generates the sample data (deterministic, seeded)
  into `sample-data.js` and writes the no-JavaScript fallback list into
  `index.html` between `<!-- sample:start -->` and `<!-- sample:end -->`:

      node explorations/03-sandbox/_src/build-sample.mjs          # rebuild
      node explorations/03-sandbox/_src/build-sample.mjs --print  # also print a summary table

  Edit dishes, base levels, holiday lifts or hand-set stories at the top of
  that file.
- `_src/og.html` is the source of `og.png`: serve the repo root, open it at
  1200x630, screenshot it, save as `og.png`.

Verified: full-page screenshots of both pages at 1440, 1024, 768, 390 and
320 (plus 1920, 1100 and 770 for the home page), no horizontal overflow, no
console errors or failed requests, all internal links and anchors resolve;
phone menu; keyboard tab order and arrow keys on the days; dish notes on
desktop and inline on phone; reduced motion; JavaScript disabled at 1440 and
390; form empty, invalid-email, sending, success and failure states (with
FormSubmit intercepted, never sent); print preview fits one Letter page;
contrast ratios computed.
