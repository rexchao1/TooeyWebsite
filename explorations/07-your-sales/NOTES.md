# 07 · Your sales already know

## 1. Positioning in one sentence

Your POS already holds a full record of what your guests order, and Tooey reads
it every night so you don't have to, starting with how much of each dish to
prep tomorrow.

## 2. The core message, and why

**"Everything your guests have ordered is on record. Tooey reads it every
night."**

The owner already has the data. They don't need to start collecting
anything, and they don't need to learn a tool. What they lack is time to read
what they have. That puts Tooey in the role of a reader, not another system,
and it leaves room for the company to grow: reading the same record can lead
to more decisions later. The lead sentence then names the one decision that
exists today (the morning prep count) and how it arrives (email, before prep).

I tried and dropped headlines about forecasting ("Your sales already know
what tomorrow needs") because they make prediction sound like the whole
company. That is one of the founder's recorded objections, and it also
undersells this brief.

## 3. What the visitor understands first, and the journey

1. **Hero: one calendar page.** The week (MON to SUN) runs across the top of
   the page, and its columns are ruled down through the headline, the lead,
   and a calendar of one dish's nightly sales at a sample restaurant, printed
   large into the same columns. On load, the past Tuesdays are underlined one
   at a time, then the next Tuesday is circled: "Tuesday: we expect 15.
   Prep 17." Within a few seconds an owner sees the input (my sales), the
   output (a number to prep), and who does the reading.
2. **What your sales already know.** The emotional turn, on a night band in
   the site's ink. A full year of one dish, one number a night, folded in two
   like a long printout: October to April on top, April to October
   underneath, so winter sits directly above summer. Four readings change
   only which numbers stand out: the day of the week (Friday and Saturday turn
   bold), the time of year (the winter half gets brighter), holidays
   (circled and labelled), and each dish's own sales (the record switches to
   fish tacos, which climb all year). These four are exactly the inputs the
   forecast uses today, so the section shows the method without claiming any
   analytics. The closing line says it plainly: all of it goes into one count
   per dish, and weather, events, and reservations don't.
3. **What arrives in the morning.** The product, printed straight onto the
   page rather than shown on a card: a sample list for Tuesday, grouped by
   category, with Predicted, Prep, and vs. last Tue, and two hatched blank
   rows with their reasons. Tooey's notes sit above the columns they explain,
   and the blank rule sits under the blank rows. The pilot line says the
   owner checks the counts against what sold.
4. **What it takes to start / Your sales stay yours.** One section, two
   columns. Left: five weeks of sales, a nightly download, about a week of
   setup, and "Free for now, while we're in a pilot." (the only place "free"
   appears). Right: a short paragraph and a small account of where the sales
   go (used for, sold, shared, published, seen by, stopped or deleted), with
   the three "No"s in the mark colour.
5. **The same record holds more.** Says first that only the prep count
   exists. The four questions that aren't built (which dishes make money,
   staffing, bringing guests back, signals beyond sales) sit in dashed empty
   cells with the same dot as the hero's empty days still to come.
6. **Tell us about your restaurant.** The contact form on the night band,
   with the students line and the email address.

The nav has Your sales, The morning list, How to start, Your data, and a
Talk to us button.

## 4. How it builds trust

- Every number on the site is labelled as a sample or an example: "Example
  from a sample restaurant", "Sample restaurant", "Example values".
- It is honest about being early: "We're early: a small team, running a
  pilot" sits beside the hero buttons, and the vision section says "None of
  them is built yet."
- The blank-row rule is shown in the product and explained ("Rather than
  guess, we leave it blank and say why. A blank is not a zero."), because it
  shows restraint better than any claim could.
- The owner stays in charge: "What goes on the line stays your call."
- Data respect is set as a plain account, and the privacy page uses the same
  words.
- There are no figures beyond the sample data, no logos, no testimonials, and
  no badges.

## 5. Design and interaction rationale

- **Idea: the record is the identity.** The site reads as the restaurant's
  own copy of its record. The paper is lemon yellow, like the duplicate copy
  a restaurant keeps. Everything is printed in one ink, aubergine (#2b1a3d).
  Tooey's marks (underlines, circles, the Tuesday note, holiday labels, the
  notes over the list's columns) are the only other colour, a vermilion
  pencil (#a33310 on paper, #ff9a6b on the night band). Eggplant, lemon,
  tomato: kitchen colours, not SaaS colours. There are no cards on a light
  ground, no beige bands, and no black buttons.
- **The week as the page grid.** The hero is laid out on a label column plus
  seven day columns (CSS subgrid), with the day hairlines running behind the
  headline. The sample record is not a picture placed on the page; it *is*
  the page.
- **Night and morning.** The year of sales is read on a band of the ink
  colour with its numbers printed in the paper's yellow, the way Tooey reads
  it after close. The morning list is back on paper.
- **Type.** Mona Sans (variable width and weight): condensed at 75% and
  bold for headlines, normal width for reading text, italic for Tooey's
  notes. Spline Sans Mono for every number in the record and the list. Both
  are OFL, self-hosted, and about 235 KB together. The Mona Sans files are
  used unmodified from fontsource's Latin subset, because its licence
  reserves the name.
- **Not a dashboard.** No charts, axes, or colours by value. The numbers stay
  as the POS would give them. The readings change only their weight (300 to
  700 on a variable font) and brightness. The faintest number is about 6:1
  against the band, so every number passes AA.
- **Responsive record.** From 900px up, the year is folded in two (27 week
  columns per half), which gives about 38px per column at 1180px and 47px at
  1440px. Below 900px the two halves open out into one strip, seven rows
  high (about 250px), that you swipe sideways. The day names stay pinned at
  the left. On phones and tablets, choosing a reading also scrolls the strip
  to the part of the year it's about: January for the seasons, February for
  Valentine's Day, the end of the year for the fish tacos.
- **Motion.** One sequence in the hero (about 2 seconds, once, when the
  calendar is in view). Readings cross-fade in 0.5s. Under reduced motion
  everything shows in its final state and the strip jumps without
  smoothing.
- **Without JavaScript** every word is readable, the record shows the first
  reading (and the strip still scrolls natively), the nav shows as plain
  links, and the form posts straight to FormSubmit.

## 6. What is illustrative and what is factual

Illustrative (invented, labelled as sample or example):
- The sample restaurant, its dishes, and every number in the hero calendar,
  the year record, and the prep list.
- The record is generated by `_src/data.mjs` from a seeded model (weekday
  pattern, a seasonal curve, holidays, noise). The numbers quoted in the
  readings (about 33 vs. 15, about 41 vs. 26, 60 on Valentine's Day, 15 on
  the Fourth, fish tacos 7 to 16) are computed from that data and printed by
  the build, so the words can be checked against it.
- The holidays themselves, and the closed days.

Factual (from the brief, no more):
- Pilot, free for now, no price or trial length, small team of university
  students, Tooey LLC, tooeyteam@gmail.com.
- A per-dish count each night for the next day, with Predicted, Prep (a
  little over Predicted, size not stated), vs. same weekday last week, and
  items grouped by category.
- Blanks for dishes under about five weeks on the menu or selling under about
  one a day, with the reason.
- Inputs: past item-level sales, day of the week, time of year, holidays.
  Not weather, events, or reservations.
- Nightly download from the POS; Square, Toast, and Clover exports read,
  others mapped. About five weeks of history; about a week of setup.
- Email before prep, printable; during the pilot the owner checks the counts
  against what sold.
- Every privacy fact on the privacy page and in the data column.

One statement is about this build, not the company: the privacy page says
the site has no analytics, ads, or tracking cookies and loads fonts and
images from itself. That holds for this folder. It must stay true if
anything is added at deploy.

## 7. Strengths, weaknesses, open questions

Strengths
- The hero says what Tooey is and shows the output within seconds, without a
  slogan, and the week grid makes it look like nobody else's site.
- The folded year makes "your sales already know" something you can see,
  and it maps exactly onto the four real inputs, so it explains the method
  without overclaiming.
- The trust material is specific: the blank rule, the owner's call, and the
  account of where sales go.

Weaknesses
- Lemon yellow across the whole page is a strong choice. It is legible
  (aubergine on it is 13:1), but some owners may find it loud. The fallback
  is a paler yellow on the same tokens.
- On phones the year is a swipe strip. Readings jump it to the right place,
  but an owner who doesn't swipe sees about ten weeks at a time.
- The weekday, season, and holiday patterns in the sample are clean because
  they are modelled. Real sales are noisier. They are labelled as a sample,
  but an owner might still take them as typical.
- The record grid is hidden from screen readers (370 numbers would be noise).
  The scroll region has a label, and its meaning is carried by the four
  reading notes, which are real text.

Open questions for the founder
- Is "on record" the right word for a restaurant owner, or would "in your
  POS" land faster?
- The hero says the count is "in your email before prep starts." That depends
  on email delivery being live before any partner finishes setup (see
  `docs/plans/new-site.md`).
- Should the vision section name staffing and marketing this plainly this
  early, or stay shorter?
- og:image is a relative path (`assets/og.png`). Most link previews need an
  absolute URL, so set it to the real domain when this ships.

## 8. Stack and rebuild

Hand-written HTML, CSS, and JavaScript. No framework and no dependencies.
`index.html` and `privacy.html` at this folder's root are the built output
and are committed, so previewing needs no build.

```
explorations/07-your-sales/
  index.html, privacy.html   built pages (do not edit; edit _src/)
  assets/site.css            all styles
  assets/site.js             menu, hero sequence, readings, strip, list key, form
  assets/fonts/              Mona Sans, Spline Sans Mono (subset), OFL licences
  assets/logo.png            the wordmark from the repo root
  assets/favicon.svg, og.png
  _src/index.html            home page template
  _src/privacy.html          privacy page template
  _src/partials/             shared header and footer
  _src/data.mjs              the seeded sample data
  _src/build.mjs             fills the templates and writes the pages
  _src/og.mjs                renders assets/og.png with Playwright
```

Rebuild (Node 18 or later, from this folder):

```
node _src/build.mjs
```

The build prints the summary numbers quoted in the copy. If `data.mjs`
changes, check the reading notes and the hero note against that output.

Share image (optional, needs Playwright and the folder served):

```
python3 -m http.server 5207 --bind 127.0.0.1    # from the repo root
node _src/og.mjs
```

Preview: serve the repo root and open
http://127.0.0.1:5207/explorations/07-your-sales/

## Revision (second pass)

The first version sat in the visual family several explorations had
converged on: warm cream paper, a near-black serif headline, a black
rectangular button, white cards on a light ground, and beige bands. Its
concept, structure, and copy were kept. The visual identity was rebuilt from
the strategy instead.

- **Palette.** Cream, near-black, and beige were replaced by lemon paper,
  one aubergine ink, and a vermilion mark. I tried navy ink first, then
  bottle green; both were dropped because other explorations had since taken
  blue-on-white and green looks.
- **Type.** Newsreader (also used elsewhere) was replaced by Mona Sans,
  condensed for headlines. I tried Archivo first and dropped it because it was
  taken too.
- **Composition.** The record is no longer a card on a marketing page. The
  hero is a calendar page ruled by the week. The year is staged full width on
  a night band. The prep list is printed onto the page with Tooey's notes
  over its columns. The future questions are empty dashed day cells.
- **Cramped year grid (about 1180 to 1300px).** Fixed by folding the year in
  two: 27 columns instead of 53, so the columns are roughly twice as wide.
- **53-row phone version.** Replaced by a seven-row strip with pinned day
  names (about 250px tall instead of about 1,000px). Choosing a reading moves
  the strip to the relevant weeks.
- **Faded numbers at 3.2:1.** The faintest number is now about 6:1, and the
  emphasis comes mostly from weight.
- **Merged sections.** "What it takes to start" and "Your sales stay yours"
  are now one two-column section. The four vision questions moved off the dark
  band, which now holds the record and the contact form.
- **Copy.** Unchanged, apart from caption wording that described the old
  layout.
