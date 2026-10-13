# 01 · Margin

Preview: from the repo root, `python3 -m http.server 5201`, then open
http://localhost:5201/explorations/01-margin/

Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey does the arithmetic behind the small daily calls that decide what a
restaurant keeps, from the owner's own sales, starting with how much of each
dish to prep.

## 2. The core message, and why

**A prep count can miss in two directions, and only one of them leaves a
trace.** Too many and the extra lands in the bin and in food cost. Too few and
the dish is 86'd, and the sales you missed never show up anywhere, because a
POS records what you sold, not what you would have sold.

This makes the money argument without a single outside figure. The one rule
on the page is pure arithmetic the owner can check in their head: if a dish
sells for more than twice what it costs to plate, a missed order can cost
more than a portion in the bin. The worksheet then lets the owner run that
on one of their own dishes. The only numbers that carry weight on the site
are the ones the owner types in.

Prep is framed as the first lever, not the company. The headline is about
money and small daily calls; prep is the example inside it.

## 3. What the visitor understands first, and the journey

1. **Top:** the headline (money is made and lost in small daily calls, like
   prep), one lead sentence on what exists today (a count for every dish, in
   email before the kitchen starts), the call to talk, and right below it an
   example prep list with its columns explained in the margin.
2. **The two costs:** why the count matters in money. Bin vs. 86 board, with
   a small dot diagram for each.
3. **Your numbers:** a one-dish worksheet. Plate cost, price, portions
   thrown out, orders missed (a guess). It works out the two losses and the
   ratio between them. One button carries those numbers into the contact
   message, so the conversation starts from the owner's own arithmetic.
4. **What happens between close and the next morning:** the nightly
   download, the recount, the email; what goes into a count; why a line is
   sometimes blank.
5. **What it takes:** five weeks of sales, a week of setup, then checking
   the counts during the pilot.
6. **What we've pencilled in after prep:** the vision, set apart as plans
   (dotted rules, italic, "Not built" on every line).
7. **Talk to us about your numbers:** the form.

## 4. How it builds trust

- **The margin is where the honesty lives.** The page is laid out like a
  ledger: body on the right, a ruled red margin on the left. Every caveat
  sits beside the thing it qualifies: "Example values", "Up to, because a
  guest may order something else", "Not in the count yet: weather, local
  events, reservations", "Free for now", "Nobody counts missed orders". On
  phones the notes drop under their paragraph with the same double red rule.
- No outside figures, testimonials, logos, or badges. The only arithmetic is
  arithmetic the owner can check.
- The blank line is shown on the example list, not hidden: the product
  saying "not enough history" is a trust point.
- The vision is explicitly marked as not built.
- Early and small said plainly: "Tooey is early", "a small team of
  university students".
- The worksheet says nothing typed leaves the page unless it's sent (true:
  it's computed in the browser and only reaches us if the owner submits the
  form).

## 5. Design and interaction rationale

- **Ledger, not dashboard.** Buff paper (`#f4efe4`), blue-green ledger
  hairlines, a double red margin rule, and red used only for money lost.
  Losses are written the accountant's way, in brackets, and the worksheet
  total gets a double underline. It reads like the back office, not like a
  finance pitch, and it avoids the current site's sage counter and paper
  props.
- **Type:** Brygada 1918 (headings and text) has the weight of an old
  account book without being quaint. Archivo at semi-condensed width is for
  figures, labels, notes and forms, with tabular numbers so columns line up.
  Both OFL, self-hosted, about 84 KB for all three files. None are on the
  founder's rejected list or used on the current site.
- **Interaction is kept to what earns it:** the live worksheet (numbers
  flash briefly when they change, not under reduced motion); hovering a
  lettered sheet note lights up the columns it explains; the "Add these to
  my message" button fills the contact message; the phone menu. No scroll
  animations.
- **Without JavaScript:** the nav shows inline, the worksheet shows its
  worked example, and the form posts to FormSubmit's normal endpoint.
- **Print:** nav and form are hidden, so the example sheet prints cleanly.

## 6. Illustrative vs. factual

Illustrative (labelled "Example" on the page):
- Every dish and number on the example prep list (Braised short rib 13/15,
  +8%, and so on), and the two blank lines.
- The dot diagrams (16 prepped, 13 sold; 10 prepped, 4 asked for after).
- The worksheet's starting values (plate cost $7.80, price $29.00, 4 thrown
  out, 6 missed), and therefore its starting results.
- "86'd by quarter past eight" is a scenario, not data.
- `og.png` repeats the headline and two example rows.

Factual (from the brief):
- Pilot with independent restaurants, free for now, no price or trial
  length stated. Small team of university students. Tooey LLC,
  tooeyteam@gmail.com.
- Nightly download from the POS that works with most systems; Square,
  Toast and Clover exports recognized, others mapped. No integrations or
  logos shown.
- Recomputed each night: Predicted and Prep (a little over, cushion not
  sized), change from the same day last week, grouped by category, emailed
  each morning before prep, printable.
- Inputs: past item-level sales, day of the week, time of year, holidays.
  Weather, events and reservations only as "not yet".
- Blank under about five weeks on the menu or under about one a day; a
  blank isn't a zero.
- About five weeks of sales to start; about a week of setup (what matters
  in the kitchen, how the list is set up, checking it first); checking
  counts against actual sales during the pilot.
- Privacy page: all the privacy facts, reworded.

The rule that a missed order can cost more than a binned portion when price
is more than twice plate cost is arithmetic, not a claim about Tooey's
results. The page says Prep sits above Predicted "so a rush doesn't leave
you short", and nothing more about how the cushion is set.

## 7. Strengths, weaknesses, open questions

Strengths
- The money argument holds up without a single invented number, and it
  ends in a conversation about the owner's own numbers, which is the next
  step the brief asks for.
- The worksheet-to-form handoff gives the team a better first email than
  "tell us about your restaurant".
- The margin device is distinctive and it does a job: every caveat sits
  next to its claim.
- Lean: two pages, no framework, about 84 KB of fonts, 33 KB logo.

Weaknesses
- The home page is long, with seven sections. A busy owner gets the point
  from the first screen and the two-costs section; the rest is for the ones
  who keep reading.
- On desktop the margin column is empty for long stretches. That's part of
  the look, but some will read it as wasted space.
- The sheet's margin notes are placed to match fixed row heights in CSS. If
  the example rows change, the offsets in `styles.css` (`.sheet-notes .n-*`)
  need updating.
- The worksheet asks for a guess (orders missed). That's honest, but some
  owners will feel the result is made up. The page says so openly.

Open questions for the founder
- Is the worksheet's "up to $X for this dish last week" comfortable? It's
  the owner's arithmetic, but it's the closest the site comes to a dollar
  figure.
- Is "Restaurants make and lose money on small daily calls" broad enough
  for where Tooey is going, or should it name margin more directly?
- The privacy page could also say "this site sets no cookies and runs no
  analytics", which is true of this build. It isn't on the page because it
  wasn't in the signed-off facts.
- `og:image` uses a relative path (`og.png`). Some link previewers need an
  absolute URL, so set it once the domain is known.

## 8. Stack

Hand-written HTML, CSS and a small vanilla JS file. No build step.

- `index.html`, `privacy.html`: pages
- `styles.css`: all styles (tokens on `:root`)
- `site.js`: phone menu, sheet-note highlighting, worksheet, contact form
  (JSON POST to `https://formsubmit.co/ajax/tooeyteam@gmail.com`, with
  sending, success and failure states, and a mailto fallback)
- `fonts/`: Brygada 1918 (roman and italic, variable 400–700) and Archivo
  semi-condensed (variable 400–700), Latin subsets from Google Fonts, with
  their OFL licence files
- `logo.png`, `favicon.svg`: copied from the repo root
- `og.png`: 1200×630 share image, rendered from the page's own styles
