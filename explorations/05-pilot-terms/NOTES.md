# 05 · The offer

Preview: serve the repo root (`python3 -m http.server 5205`) and open
`/explorations/05-pilot-terms/`. Pages: `index.html`, `privacy.html`.

## 1. Positioning in one sentence

Tooey is a small, early company offering independent restaurants a place in
its pilot: a prep count for every dish each morning, in exchange for access to
your sales and about a week of your time. Every term, including the ones not
yet decided, is written out in large, plain type.

## 2. Core message, and why

**"Tooey is early, and we're looking for independent restaurants to try our
daily prep count."** One plain sentence carries both the offer and the
product. It leads with the uncomfortable fact (early), presents it as an
invitation rather than an apology, and names a concrete thing the owner can
picture. It calls the prep count "our daily prep count", one product of
Tooey, so it doesn't read as the whole company.

The lead makes the promise that organizes the page: *everything we'd ask of
you in return is on this page, including what we haven't decided yet.*

## 3. What the visitor understands first, and the journey

1. **First screen.** The headline, the lead, two buttons, then the deal in four
   lines as a full-width band: **Free** (cost during the pilot) · **About 5
   weeks** (past sales to start from) · **About a week** (setup with us) ·
   **One email** (to stop).
2. **What arrives each morning.** The example list as a flat printed table,
   not a card. The Prep column is solid ink, and blank rows are hatched with
   the reason on a label. The four definitions sit beside it, then what goes
   into a count and what doesn't yet.
3. **The terms.** The page splits down the middle: **You put in** on a tinted
   left half, **You get back** on the white right half, and each stage (To
   begin, Setup about a week, Every morning after, If you stop) pinned on the
   line between them. Below are two clauses. *Nothing, during the pilot*
   comes with two hatched "Not set" fields (price after the pilot, how long it
   runs). *Used only to forecast for your restaurant* comes with the details.
   Each has an "Ask about…" link that starts a message in the form. "Print the
   terms" prints only this section, on one page.
4. **Prep is the first part of Tooey.** The larger aim, and why joining now
   matters. Prep counts are marked "In the pilot now"; six areas are marked
   "Not built" on hatched fields.
5. **Write to us.** Who you'd be dealing with, the form, and a plain email
   fallback.

## 4. How it builds trust

- **The deal as an exchange.** On wide screens the terms are two halves of
  the page, your side and ours, with nothing tucked into a footnote. Stopping
  is a stage of the deal like any other.
- **A blank, not a guess.** The product leaves a dish blank instead of
  guessing. The company follows the same rule about itself: price after the
  pilot and pilot length are hatched empty fields labeled "Not set", and so
  is everything not built. The page says so outright: "We left these blank
  instead of guessing, the same rule the list follows."
- **No fine print.** Nothing an owner must read is under 15px. The terms are
  the second-largest type on the page.
- **Reachable at the moment of doubt.** The "Ask about…" links jump to the
  form with the message started.
- **Nothing to check up on.** No figures, logos, quotes, counts or badges. The
  footer says "No analytics, no cookies", which is true of this build.

## 5. Design and interaction rationale

- **One ink.** The whole site is ballpoint blue (#1b2a6b) on white, with a
  pale blue tint, like a form filled in by hand in one pen. There is no black
  and no second accent; the logo brings its own wood and leaf. An orange focus
  ring and a red for form errors are the only functional colors.
- **Type: Atkinson Hyperlegible Next, and Mono for the counts** (both OFL).
  The face was drawn for the Braille Institute so letters can't be mistaken
  for each other. That is "no fine print" taken literally, and good for owners
  reading on a phone in a bright kitchen. Headlines are heavy (780–800) and
  tightly spaced. The mono counts have a slashed zero, so 0 and 8 can't be
  confused on a printout.
- **Composition.** A full-width headline with no product card beside it. The
  four-line deal is a band across the page. The example list is a flat
  printed table. The terms are the split page with a spine. The roadmap is a
  ruled list. Headers and sections are separated by 2px ink rules, like
  printed forms.
- **Hatching** marks every blank: blank rows in the list, unset terms, and
  unbuilt areas. Each hatched field carries a white label stating what it is,
  so the pattern never stands in for words.
- **Motion.** None beyond hover color changes, which are off under reduced
  motion, as is smooth scrolling.
- **Without JavaScript.** Everything reads in full. The nav wraps under the
  logo, the form posts straight to FormSubmit, and the print button stays
  hidden.
- **Form.** It POSTs JSON to `formsubmit.co/ajax/tooeyteam@gmail.com` with
  `_subject`, `_template`, `_captcha`, and a `_honey` honeypot. There are
  inline errors, a disabled "Sending…" state, and a success panel that takes
  focus. On failure, what the owner typed is kept and a pre-filled mailto
  link is offered.

## 6. Illustrative vs. factual

Illustrative (labeled "Example", with "A made-up restaurant. Every number
here is illustrative."):
- "Prep for Tuesday", the dishes, Predicted/Prep values, % changes, and the
  two blank rows.

Factual (from the brief), and nothing beyond it:
- Pilot, free for now, no price or pilot length set. A small team of
  university students, Tooey LLC, tooeyteam@gmail.com.
- Predicted, Prep a little over Predicted (cushion size not stated), change
  from the same weekday last week, grouped by category.
- Blanks for under about five weeks on the menu or under about one sold a day.
- Inputs: sales, day of week, time of year, holidays. Weather, events and
  reservations are stated as not used yet.
- Nightly POS download set up by the team. Square, Toast and Clover exports
  are recognized; others can be mapped. No integrations claimed, no logos.
- About five weeks of past sales. About a week of setup. Email before prep,
  printable. Owner checks counts against what sold, then decides.
- All privacy facts, and stopping or deleting by email.
- The roadmap is the founder's vision, with every item marked "Not built".

## 7. Strengths, weaknesses, open questions

Strengths
- The first read gives both the offer and the product. The four-line band
  gives the whole deal at a glance.
- The split page makes "terms" something you can see before you read it:
  your side, our side, and a line between.
- One device, the labeled hatched blank, ties the product's honesty (it
  won't guess) to the company's (it won't invent terms).

Weaknesses
- One ink is calm but cool. A visitor who wants warmth gets it only from the
  logo and the copy.
- The split view is a wide-screen moment. On phones it becomes a vertical
  spine with paired boxes, which is clear but less striking.
- The phone page is still about 8,300px at 390 wide (9,400 at 320), down from
  10,000 and 11,100. The terms are most of that, by design.
- `og:image` is not set. It needs an absolute URL.

Questions for the founder
- Please confirm three lines that are reasonable readings, not quotes:
  - "the people who read them are the people building the counts"
  - "When they're set, they'll be written here"
  - "Restaurants in the pilot are the kitchens we'll learn from when we
    decide what to build next"
- Are you comfortable saying in public that the pilot's length is "Not set"?
- "To stop: One email." Is there anything that would make that untrue?

## 8. Stack

Hand-written HTML, CSS and a small vanilla JS file. No build step, no
dependencies.

- `index.html`, `privacy.html`: the pages
- `styles.css`: all styles, including the one-page print layout for "Print
  the terms"
- `site.js`: phone menu, "Ask about" prefill, print, and the contact form
- `fonts/`: Atkinson Hyperlegible Next and Atkinson Hyperlegible Mono
  (variable woff2, Latin subset, from fontsource), with their OFL licenses
- `logo.png`: copied from the repo root. `favicon.svg`: a spoon-and-leaf
  mark on the site's ink blue.

## Revision

The first version shared a visual family with other explorations: cream
paper, a serif headline in near-black, a black rectangular button, a white
card showing the sample list as the hero, and dashed outlines for "not real
yet". The strategy and copy stayed. The identity was rebuilt from the concept
itself (an offer made in the open, a blank instead of a guess, no fine
print).

- **Palette.** Cream and near-black became one blue ink on white with a pale
  blue tint. The wood highlight is gone; the Prep column is now solid ink.
- **Type.** Besley and Public Sans became Atkinson Hyperlegible Next and
  Mono, chosen for legibility as a principle, not as a style.
- **Composition.** The two-column hero with a product card became a
  full-width headline and a four-cell deal band. The ledger table became the
  split page with a spine, your half tinted and ours white. The product is a
  flat printed table, not a floating card.
- **"Not real yet" device.** Dashed outlines became labeled hatched blanks,
  the product's own rule ("a blank is a decline, not a zero") applied to the
  company's unset terms and unbuilt work.
- **Buttons.** Ink pills instead of black rectangles. The phone menu button
  is a plain "Menu"/"Close" pill.
- **Headline.** It now names the product: "…to try our daily prep count."
- **Length.** The scroll-linked key and its script, the "what goes in" tiles,
  and one sample row were cut. The definitions and the "what goes in" note
  now sit beside the table on wide screens. The roadmap became a compact
  ruled list. Phone padding was reduced. The home page went from 11,132px to
  9,401px tall at 320 wide, and from 6,242px to 5,387px at 1440.
- **Print.** The terms now fit on one page.
