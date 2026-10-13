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

1. **Hero.** The headline, a two-sentence lead, and a small calendar of one
   dish's nightly sales at a sample restaurant. On load, the past Tuesdays are
   underlined one at a time, then the next Tuesday is circled and filled in:
   "Tuesday: we expect 15. Prep 17." Within a few seconds an owner sees the
   input (my sales), the output (a number to prep), and who does the reading.
2. **What your sales already know.** The emotional turn. A full year of one
   dish, one number a night, set like a ledger. Four readings change only
   which numbers stand out: the day of the week (Friday and Saturday turn
   bold), the time of year (the winter band gets darker), holidays (circled,
   and labelled on desktop), and each dish's own sales (the ledger switches to
   fish tacos, which climb all year). These four are exactly the inputs the
   forecast uses today, so the section shows the method without claiming any
   analytics. The closing line says it plainly: all of it goes into one count
   per dish, and weather, events, and reservations don't.
3. **What arrives in the morning.** The product: a sample list for Tuesday,
   grouped by category, with Predicted, Prep, and vs. last Tue, plus two blank
   rows with their reasons. A key explains each column and the blank rule.
   The pilot line says the owner checks the counts against what sold.
4. **What it takes to start.** Five weeks of sales, a nightly download, about
   a week of setup. "Free for now, while we're in a pilot." appears only here.
5. **Your sales stay yours.** A short paragraph, plus a small account sheet
   that answers the questions an owner has about their data: used for, sold,
   shared, published, seen by, stopped or deleted.
6. **The same record holds more.** The vision, on a dark band so it reads as
   a different register. It says up front that only the prep count exists,
   then lists four questions that are not built: which dishes make money,
   staffing, bringing guests back, and signals beyond sales.
7. **Tell us about your restaurant.** The contact form, with the students
   line and the email address.

The nav has Your sales, The morning list, How to start, Your data, and a
Talk to us button.

## 4. How it builds trust

- Every number on the site is labelled as a sample or an example: "Example
  from a sample restaurant", "Sample restaurant", "Example values".
- It is honest about being early: "We're early: a small team, running a
  pilot" sits under the hero buttons, and the vision section says "None of
  them is built yet."
- The blank-row rule is shown in the product and explained ("Rather than
  guess, we leave it blank and say why. A blank is not a zero."), because it
  shows restraint better than any claim could.
- The owner stays in charge: "What goes on the line stays your call."
- Data respect gets its own section, set as a small ledger, and the full
  privacy page uses the same plain words.
- There are no figures beyond the sample data, no logos, no testimonials, and
  no badges.

## 5. Design and interaction rationale

- **Idea:** a record and a reader. The POS record is set in a monospace
  (Spline Sans Mono), like a printout. Everything Tooey "says" is in
  Newsreader, a serif made for reading on screens, with an italic in one
  sienna ink (#a3421b) for Tooey's marks: underlines, circles, the Tuesday
  note, holiday labels. That ink is the only accent on the site.
- **Not a dashboard.** The ledger has no charts, axes, or colors by value.
  The numbers stay exactly as the POS would give them. The readings change
  only their weight and darkness (a variable-font weight from 300 to 700 and a
  color mix), so the pattern comes out of the record itself.
- **Layout.** The ledger runs as a horizontal strip (53 weeks across, days
  down) at 1180px and up. Below that it turns on its side into a tall
  calendar (days across, weeks down), using the same cells in the same order
  through a grid-auto-flow switch. Between 640 and 1179px the readings stay
  beside it as a sticky column. On phones the readings sit above it as a
  short list, with only the chosen one expanded.
- **Paper.** Warm off-white ground; record, list, and form on whiter
  "sheets" with a soft shadow; one tan band for the product; one dark band
  for the future.
- **Motion.** One sequence in the hero (about 2 seconds, once, when the card
  is in view). The readings cross-fade weight and color in 0.5s. Under
  reduced motion everything shows in its final state and nothing moves.
- **Without JavaScript** every word is readable, the ledger shows the first
  reading, the nav shows as plain links, and the form posts straight to
  FormSubmit.
- **Fonts:** Newsreader (roman and italic, opsz and wght axes cut down to the
  weights used) and Spline Sans Mono, both OFL. They are subset to Latin and
  self-hosted, about 210 KB in total. Licences are in `assets/fonts/`.

## 6. What is illustrative and what is factual

Illustrative (invented, labelled as sample or example):
- The sample restaurant, its dishes, and every number in the hero calendar,
  the year ledger, and the prep list.
- The ledger data is generated by `_src/data.mjs` from a seeded model
  (weekday pattern, a seasonal curve, holidays, noise). The numbers quoted
  in the readings (about 33 vs. 15, about 41 vs. 26, 60 on Valentine's Day,
  15 on the Fourth, fish tacos 7 to 16) are computed from that data and
  printed by the build, so the words can be checked against it.
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
- Every privacy fact on the privacy page and in the data section.

One statement is about this build, not the company: the privacy page says
the site has no analytics, ads, or tracking cookies and loads fonts and
images from itself. That holds for this folder. It must stay true if
anything is added at deploy.

## 7. Strengths, weaknesses, open questions

Strengths
- The hero says what Tooey is and shows the output within seconds, without a
  slogan.
- The ledger makes "your sales already know" something you can see, and it
  maps exactly onto the four real inputs, so it explains the method without
  overclaiming.
- The trust material is specific: the blank rule, the owner's call, and the
  data sheet.

Weaknesses
- The year ledger is dense. At 1180 to 1300px wide the horizontal numbers are
  tight (11 to 12px), and on a phone it is long (53 rows). Owners who skip it
  still get the point from the reading notes, but it asks for attention.
- The page is long: seven sections. Each one answers a different question,
  but a founder who wants a shorter page could merge "What it takes to
  start" and "Your sales stay yours".
- The weekday, season, and holiday patterns in the sample are clean because
  they are modelled. Real sales are noisier. They are labelled as a sample,
  but an owner might still take them as typical.
- The ledger is hidden from screen readers (370 numbers would be noise).
  Its meaning is carried by the four reading notes, which are real text.
- Faded ledger numbers are about 3.2:1 against the sheet. They are de-emphasis
  inside a figure, and the active ones are full contrast, but they are below
  4.5:1.

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
  assets/site.js             menu, hero sequence, readings, list key, form
  assets/fonts/              subset woff2 files and OFL licences
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
