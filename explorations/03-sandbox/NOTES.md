# Exploration 03: "Try it"

Preview: serve the repo root (`python3 -m http.server 5203`) and open
`/explorations/03-sandbox/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey is software for independent restaurants that starts with prep: each
morning, how many of each dish to make, worked out from the restaurant's own
sales. This site lets an owner use a week of those lists for a sample
restaurant before believing a word of it.

## 2. Core message and why

"Here is the list you would get. Use it." An owner judges a prep count the
way they judge a ticket: by looking at one. The headline says what Tooey is
(a company making software for independent restaurants) and what it does
first (the morning prep count). The page then hands over a clipboard with a
working week at The Corner Booth, a sample casual dine-in place (about 80
seats, lunch and dinner). The words around it answer what the sample leaves
open: what it takes to get one, what Tooey is and where it is going, what
isn't proven yet, and how to start.

## 3. What the visitor understands first, and the journey

1. Headline: "Tooey is software for independent restaurants. It starts with
   prep: each morning, how many of each dish to make." The lead says the
   counts are worked out each night from the POS and arrive by email before
   the kitchen starts, and invites the visitor to use the sample. One button:
   Ask about the pilot, with "Free for now" beside it.
2. The sample. A two-item key sets the rule: "Paper is the list Tooey sends.
   Yellow notes are us, explaining the sample." Day-dot stickers pick the
   morning (Monday to Sunday, early May). A yellow note
   says what that morning's counts go by (past sales, day, time of year,
   holiday) and what they don't (weather, local events, reservations). The
   printed list sits on a clipboard, with "Sample · made-up numbers" stuck on
   the clip.
3. A yellow notes pad beside the clipboard explains the columns and blanks
   and offers four shortcuts: fish and chips on Friday (day of the week), a
   salad on Mother's Day (holiday and time of year), wings on Monday (why the
   change column can jump), and the veggie burger's blank.
4. Pick a dish: the row gets a yellow flag and the pad shows Predicted, Prep,
   change against last week and what sold then, a chart of its last six same
   weekdays with today's count and a Prep tick, a sentence or two on what
   moved it, and its Prep for the whole week (click to follow it across
   days). On a phone the note sticks under the row.
5. Right after the clipboard: "Your list would have your own dishes and your
   own counts." with Ask about the pilot and See what it takes.
6. Setup as four numbered steps; About Tooey with Today vs. "Where we want
   to take it"; then the form, with "Not measured yet" and "Your sales stay
   yours" beside it.

## 4. How it builds trust

- The visitor checks the product instead of taking our word for it. Past
  weeks, last week, Predicted and Prep come from one consistent model, so an
  owner who adds things up won't catch the sample out.
- It shows its limits on purpose: blanks are featured, the inputs note names
  what isn't used, one note explains a big swing against last week, and "Not
  measured yet" says accuracy at a live restaurant hasn't been measured,
  which is why the pilot has you check counts against what sold.
- Sample labeling is physical and everywhere: the key, the note on the clip,
  the notes pad header, the inline note header, the printout, the footer.
- Each fact is said once. No testimonials, logos, figures or badges.

## 5. Design and interaction rationale

Identity: two objects you'd find on a pass, on a ground taken from an order pad.
- Ground: the pink copy of a carbonless order pad (#f0d5cb, a shade deeper
  behind the sample), with the oxblood those pads are printed in (#7a1c29)
  for buttons, rules, step numbers and the second line of the headline.
- Two objects carry the meaning, and nothing else is staged: a masonite
  clipboard with a steel clip holding the white printed list, and yellow
  sticky notes for everything we say about it. The day picker uses day-dot
  colors (Monday blue, Tuesday yellow, Wednesday red, Thursday brown, Friday
  green, Saturday orange, Sunday black, as kitchens use them), because they
  name the day, which is what the picker does. Setup is a plain numbered
  list; the form is a plain form.
- Product vs. our notes is a material difference, not a caption: the list
  is white paper and black print and carries only what the real list shows
  (restaurant, day, items by category, Predicted, Prep, change vs. the same
  weekday last week, blanks with reasons). Everything that explains it is a
  yellow sticky note with a marker-written header ("Our notes · not on the
  real list"), and the selected row is flagged in the same yellow. Nothing
  yellow is ever on the list. "Print this list" prints the paper alone, on
  one page.
- Type: Big Shoulders Display (Chicago street-sign lettering, condensed and
  plain-spoken) for headings; Barlow (a grotesk drawn from road and rail
  signage, with tabular figures) for text and for the list; Permanent Marker
  only for the handwritten headers on notes. All self-hosted (OFL / Apache
  2.0), six woff2 files, about 147 KB.
- Contrast: every text pair passes WCAG AA (lowest 5.4:1, white on the Wednesday red; oxblood on the ground is 7.5:1).
- Motion: a short fade when the day or dish changes, and the day dot growing
  when picked. All off under prefers-reduced-motion.
- Keyboard: the days are a tablist (arrows, Home, End); each dish is a
  button with aria-expanded; focus moves sensibly from the week strip and the
  back button; a polite live region announces the dish and its numbers. The
  reading guide is a native disclosure, open beside the list on wide screens
  and folded under it on phones.
- Without JavaScript the page shows Tuesday's full list, the reading guide,
  wrapping navigation, and a form that posts straight to FormSubmit.

## 6. Illustrative vs. factual

Illustrative (made up, labeled as a sample): The Corner Booth, its 13-dish
menu, seat count, every number, the early-May week, the six weeks of history,
and the per-dish stories in the notes (soup slowing in spring, salads
climbing, fish and chips on Fridays, Mother's Day lifts, a big wings Monday,
a slow sundae Thursday). The Prep cushion in the sample is about 8% (at
least one) and is never stated. Last week's sales are held closer to normal
than real item sales would be, so the change column stays readable; two
hand-set days show what large swings look like.

Factual (from the brief, nothing beyond it): the list's columns, grouping and
blanks (under about five weeks on the menu, or under one a day); the four
inputs and the three non-inputs; nightly recompute; morning email before
prep; printable; about five weeks of sales to start; about a week of setup
and what happens in it; a nightly POS download that works with most systems
(Square, Toast, Clover exports recognized, others mapped); free for now
during the pilot; a small team of university students, Tooey LLC; the
privacy facts; the vision, shown only as direction.

## 7. Strengths, weaknesses, open questions

Strengths
- An owner gets it by doing, in under a minute: pick Friday and see fish and
  chips jump; pick Sunday and see Mother's Day; tap a blank and see why.
- The demo can't pass for a product feature: the paper shows only real
  fields, and every explanation is visibly a sticky note.
- It looks like it came from a restaurant rather than a software company,
  without photos and with only two objects.
- Small: hand-written HTML and CSS, about 15 KB of JS plus 24 KB of sample
  data; no framework.

Weaknesses
- A pink ground is an unusual choice for a business tool; it reads warm and
  kitchen-made to us, but the founder may find it too soft.
- Permanent Marker is a recognizable font; it is limited to short headers.
- On a phone the list is still 13 rows long before the way out.
- The sticky notes lean on a convention (yellow = someone's note). The key
  states it, but it's a convention, not a guarantee.

Open questions for the founder
- Does "vs. last Tue" compare today's Predicted with what actually sold last
  Tuesday (as the notes assume, "sold 21") or with last Tuesday's prediction?
- Is it fine to say accuracy hasn't been measured at a live restaurant ("Not
  measured yet")? It's true and builds trust, but it's a new statement.
- What does the real list's header show (date? holiday?). The sample shows
  only the day and keeps holidays off the paper.
- Is "The Corner Booth" fine as the sample's name?

## 8. Stack and rebuilding

Hand-written static site, no framework and no install step.

- `index.html`, `privacy.html`, `styles.css`, `site.js` (ES module: menu,
  sample interactions, form), `sample.js` (pure rendering of the list and
  notes, shared by the browser and the build script), `sample-data.js`
  (generated), `fonts/` (woff2 + licenses), `logo.png`, `favicon.svg`,
  `og.png`.
- `_src/build-sample.mjs` generates the sample data (deterministic, seeded)
  into `sample-data.js` and writes the no-JavaScript list into `index.html`
  between `<!-- sample:start -->` and `<!-- sample:end -->`:

      node explorations/03-sandbox/_src/build-sample.mjs          # rebuild
      node explorations/03-sandbox/_src/build-sample.mjs --print  # also print a summary

  Dishes, base levels, holiday lifts and hand-set stories are at the top of
  that file.
- `_src/og.html` is the source of `og.png`: serve the repo root, open it at
  1200x630, screenshot it, save as `og.png`.
- Big Shoulders is instanced from the variable font to weights 600 to 900
  with fontTools to keep it small.

Verified (after the revision): full-page screenshots of both pages at 1440,
1024, 768, 390 and 320; no horizontal overflow, no console errors or failed
requests; all internal links and anchors resolve; phone menu; tab order and
arrow keys on the days; dish notes beside the list on desktop and inline at
390 and 320; reduced motion; JavaScript disabled at 1440 and 390; form empty,
bad email, sending, success and failure states with FormSubmit intercepted
(never sent); print fits one Letter page; contrast computed.

## Revision

The first version shared a visual family with other explorations (cream
paper, a Besley serif headline, a dark rounded button, a white card for the
list, beige bands), and a second pass on steel grey with blue and Archivo
collided with another exploration. What changed and why:

- Identity rebuilt from the strategy "this is the site where you use the
  thing": the list now sits on a clipboard on a guest-check-green counter,
  day dots are stickers on masking tape, setup steps are tickets on a rail,
  the form is a pilot request slip. New type: Big Shoulders Display and
  Barlow (Besley, Red Hat Text and Archivo removed). Buttons are square-cut
  check green, not dark and rounded.
- "Our notes, not the product" is now a material rule: paper is the list;
  every explanation is a yellow sticky note with a handwritten header, the
  selected row gets a yellow flag, and a key above the sample says so.
  The holiday tag was already off the paper; the notes no longer share any
  styling with it.
- Headline rewritten so the first read says Tooey is a company and prep is
  where it starts: "Tooey is software for independent restaurants. It starts
  with prep: each morning, how many of each dish to make."
- The list is shorter (13 dishes instead of 16; fried pickles, the mushroom
  Swiss burger and mac and cheese removed), the reading guide folds away on
  phones, and "Your list would have your own dishes and your own counts"
  with Ask about the pilot now sits directly after the clipboard.
- Interaction, copy, data model, built-in examples and fact discipline are
  unchanged.
- Second revision: the ground moved off green (two other explorations
  landed on sage) to the pink copy of an order pad, with oxblood for
  buttons and rules. Props that didn't carry meaning are gone: the
  masking-tape strip under the day dots, the ruled background, the ticket
  rail (setup is now a plain numbered list), the tape on the notes pad, and
  the form's slip header. The clipboard and the sticky notes stay, because
  they are what separates the product from our explanation.
