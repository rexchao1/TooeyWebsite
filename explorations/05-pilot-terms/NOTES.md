# 05 · The offer

Preview: serve the repo root (`python3 -m http.server 5205`) and open
`/explorations/05-pilot-terms/`. Pages: `index.html`, `privacy.html`.

## 1. Positioning in one sentence

Tooey is a small, early company offering independent restaurants a place in
its pilot: a prep count for every dish each morning, in exchange for access to
your sales and about a week of your time, with every term written out in
large print.

## 2. Core message, and why

**"Tooey is early, and we're looking for independent restaurants to work
with."** The headline makes the offer, not a slogan. It says the
uncomfortable thing first (early) and frames it as a reason to talk, not
something to apologize for. It names the company rather than a feature, so it
doesn't make forecasting sound like the whole of Tooey. The lead does the rest
right away: what arrives each morning, and the promise that organizes the
page: *everything we'd ask of you in return is written out on this page.*

The one idea behind the design: **there is no fine print.** The terms are the
largest type on the page after the headline. Nothing an owner needs to read is
set below 15px. A term that hasn't been decided is labeled "Not decided yet",
not left out.

## 3. What the visitor understands first, and the journey

1. **First screen.** The offer (headline), what you get (lead), and the deal in
   four lines set like a printed price list with dotted leaders: *A prep count
   for every dish, each morning ... Free during the pilot · Past sales to start
   from ... About five weeks · Setup ... About a week · To stop ... One
   email.* Beside it is the product itself: an example morning list.
2. **What arrives each morning.** On desktop the example list stays in place
   while a five-part key scrolls past (Predicted, Prep, vs. last Tue, A blank,
   Categories). The part crossing the middle of the screen lights its column
   on the list. Then what goes into a count, and what doesn't yet (weather,
   events, reservations), which is why the owner checks the counts and makes
   the call.
3. **The terms.** A ledger over time, with **You put in** and **You get back**
   side by side for each stage: To begin, Setup (about a week), Every morning
   after, If you stop. Under it, two clauses in big type: *What it costs:
   Nothing, during the pilot*, with "Not decided yet: a price for after the
   pilot · how long the pilot runs", and *Your sales: Used only to forecast
   for your restaurant.* Each clause has an "Ask about this" link. A "Print
   these terms" button prints only this section, for a business partner or
   chef.
4. **Where it's going.** "Prep is the first part of Tooey": the larger aim
   and why joining now matters, then a roadmap where prep counts are the only
   solid card ("In the pilot now"). Six dashed cards are each marked "Not
   built yet", followed by a line saying none of them exist and the order may
   change.
5. **Write to us.** Who they'd be dealing with (a small team of university
   students, Tooey LLC), what to send, the form, and a plain email fallback.

## 4. How it builds trust

- **Terms stated as an exchange.** Every ask sits next to what it buys, in
  the order the owner will meet it. Stopping is a row of the ledger, not a
  footnote.
- **Naming what hasn't been decided.** Price after the pilot and pilot length
  appear as explicit "Not decided yet" items. The terms lead says: "If a term
  isn't written here, it hasn't been decided yet."
- **One visual rule for "not real yet".** A dashed outline means not real yet,
  everywhere on the site: the "Example" badge on the sample list, the
  undecided terms, the parts of Tooey that aren't built. A solid outline means
  it exists today. Owners learn this without being told.
- **The blank.** "We'd rather tell you we don't know than hand you a guess"
  and "A blank is a decline, not a zero" show how the product handles what it
  doesn't know.
- **Reachable at the moment of doubt.** "Ask about cost" and "Ask about your
  data" jump to the form with the message already started ("A question about
  cost: ") and the cursor in place.
- **No claims to check.** No accuracy, savings, logos, quotes, counts, or
  badges. The footer says "This site has no analytics and sets no cookies."
  That is true of this build.

## 5. Design and interaction rationale

- **Type.** Besley (a Clarendon revival, OFL) for headings: the face of old
  printed bills, shopfront signs, and menu boards. It's sturdy and
  plain-spoken without being corporate, and it sits well next to the rounded
  wordmark. Public Sans (OFL) for text and UI: neutral, very legible, and it
  has tabular figures for the counts. Neither font is on the founder's
  rejected list, and neither is used on the current site.
- **Color.** Warm paper (#f6f2ea), near-black ink, and one highlight taken
  from the wordmark's wooden spoon (a pale wood tone) that marks the Prep
  column like a highlighter on a printout. The leaf green appears only on "In
  the pilot now" and the sent-message check. No gradients, no glow, nothing
  dark.
- **Composition.** A left-aligned editorial grid. The headline runs full
  width, with text and the example list below it in two columns. The terms
  sit on a whiter sheet under a heavy rule, like a printed document but set
  large. On phones the example list runs edge to edge, like a printout laid
  on the pass.
- **Motion.** Almost none. The column highlight eases in 200ms. Smooth
  scrolling and transitions are off under reduced motion; the highlight still
  works because it's a state, not an animation.
- **Without JavaScript.** Everything reads in full. The nav wraps under the
  logo, the form posts straight to FormSubmit, and the print button is
  hidden because it can't work.
- **Form.** It POSTs JSON to `formsubmit.co/ajax/tooeyteam@gmail.com` with
  `_subject`, `_template`, `_captcha`, and a `_honey` honeypot. There are
  inline errors, a disabled "Sending…" state, a success panel that takes
  focus, and a failure state. On failure, what the owner wrote is kept, and
  a mailto link pre-fills an email with every field.

## 6. Illustrative vs. factual

Illustrative (labeled "Example", with a caption saying the restaurant and
numbers are made up):
- The sample list: dishes, Predicted/Prep values, % changes, "Prep for
  Tuesday", "worked out overnight from sales through Monday", and the two
  blank rows and their reasons.

Factual (from the brief), and nothing beyond it:
- Pilot, free for now, no price and no pilot length set. Small team of
  university students, Tooey LLC, tooeyteam@gmail.com.
- Predicted, Prep a little over Predicted (cushion size not stated), change
  from the same weekday last week, grouped by category.
- Blanks for under about five weeks on the menu or under about one sold a day.
- Inputs: item-level sales, day of week, time of year, holidays. Weather,
  events, and reservations are stated as not used yet.
- Nightly POS download set up by the team. Square, Toast, and Clover exports
  are recognized; others can be mapped. No integrations claimed, no logos.
- About five weeks of past sales. About a week of setup (what matters, how the
  list is laid out, checking it). Email before prep, printable. Owner checks
  counts against what sold, then decides.
- All privacy facts, and stopping or deleting by email.
- The roadmap is the founder's vision, and every item is marked "Not built
  yet".

## 7. Strengths, weaknesses, open questions

Strengths
- The owner can see the whole deal in about ten seconds (price-list lines),
  then read the full terms in large type. Nothing feels hidden.
- The product is visible on the first screen and explained against itself,
  not in an abstract feature list.
- One small visual idea (dashed = not real yet) carries honesty all through
  the site without a word of hedging.

Weaknesses
- The headline is about the offer, so "what Tooey does" comes from the lead
  and the example list, not the H1. An owner who reads only the headline
  learns that Tooey is early, not what it makes.
- The home page is long on phones (about 11,000px at 320 wide). The ledger and
  clauses are the long part. They're the point of the brief, but a skimmer
  may stop at the hero.
- The highlight-on-scroll only plays on screens 960px and wider, where the
  list can stay in view. Phones get the key as plain text.
- `og:image` is not set. Open Graph images need an absolute URL, which this
  exploration doesn't have.

Questions for the founder
- Several lines are reasonable readings of the facts, not quotes. Please
  confirm each:
  - "the people who read them are the people building the counts"
  - "When they're decided, they'll be written here" (a promise to keep this
    page current)
  - "The restaurants in the pilot are the kitchens we'll be learning from
    when we decide what to build next"
- Is "Not decided yet: how long the pilot runs" something you're comfortable
  saying in public?
- "To stop: One email." Is there anything (a notice period, a call) that would
  make that untrue?
- The roadmap's six areas are worded from the vision list. Do you want all six
  shown, or fewer?

## 8. Stack

Hand-written HTML, CSS, and a small vanilla JS file. No build step and no
dependencies.

- `index.html`, `privacy.html`: the pages
- `styles.css`: all styles, including the print stylesheet for "Print these
  terms"
- `site.js`: phone menu, the key-to-list highlight, "Ask about" prefill,
  print, and the form
- `fonts/`: Besley and Public Sans variable woff2 (Latin subset, from
  fontsource), with their OFL licenses
- `logo.png`: copied from the repo root. `favicon.svg`: a new spoon-and-leaf
  mark in the wordmark's colors.
