# 02 · Time back

Preview: serve the repo root (`python3 -m http.server 5202`) and open
`/explorations/02-time-back/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey does its work in the hours your restaurant is closed, so something
useful is waiting before prep and nothing new joins the owner's list of
things to look after.

## 2. Core message, and why

"Tooey does its work while your restaurant is closed." The owner's hours are
already spoken for: chef, buyer, scheduler, bookkeeper, the one who locks up.
Every tool they've been sold asked for more of those hours. The one stretch
of the day nobody is using is the night, so that's where Tooey works. That
promise is broad enough to cover what Tooey intends to become, which keeps
the headline from making forecasting sound like the whole company. It is
also concrete enough to check: the sales come in after close, the counts
are redone overnight, and the list is waiting before prep.

## 3. What the visitor understands first, and the journey

First screen: the headline, a two-sentence lead (what it does today: works
out tomorrow's prep from the day's sales; nobody types anything in), one
button, and the pilot/free line. Under it, the signature picture: one
example restaurant day as a strip. Prep, lunch, dinner, close sit under
"Your hours"; the dark overnight block sits under "Tooey's hours"; the
second morning prep turns amber and an example email of the prep list
hangs from it. On load the night fills with a lamp line, its three marks
appear, morning comes up, and the email lands (about 3 seconds, once).

Then the page reads as a timetable of that night, with times in a left
column instead of eyebrow labels:

1. **After close** (night ground): the day's sales come in through a nightly
   download set up for you. Example POS slip.
2. **Overnight**: tomorrow's counts are worked out again from your own sales,
   day of week, time of year, holidays. One line says weather, events, and
   reservations are not used yet. Example slip showing what it looks at for
   one dish.
3. **Before prep** (the ground turns to paper here, the rail carries
   through): the list in your email, then the full sample sheet with four
   numbered keys: Predicted, Prep, vs. last Tue, and a blank (a decline,
   not a zero).
4. **Everything Tooey needs from you**: a time card with exact asks: about
   five weeks of past sales, about a week of setup, read the list each
   morning, check counts against what sold during the pilot, and one
   crossed-out row of what is not your job (exports, uploads, typing in
   sales).
5. **What's next**: prep counts as the first job off the owner's hands, then
   a chore list by cadence (every day, every week, every month, all year).
   Only the first row is "In the pilot now"; every other row is tagged "Not
   built yet". Closes by asking which chore eats the most of their week.
6. **Join the pilot**: early, small team of university students, accuracy
   not yet measured in a working kitchen, form plus email.

## 4. How it builds trust

- Exactness about the ask. The time card names every piece of owner time,
  including the inconvenient ones (five weeks of history, a setup week,
  checking the counts during the pilot). It says what is not required
  instead of implying nothing is.
- Direction is visibly separated from today: "Not built yet" chips on every
  future chore; "It doesn't use weather, local events, or reservations yet"
  sits right beside the inputs.
- The blank rows are shown, not hidden. A sample sheet that declines to
  guess says more about the product's honesty than a full one.
- Being early is stated once, plainly, at the point of asking: pilot, free
  for now, students, accuracy not measured yet.
- No figures beyond clearly labeled example values; no logos, quotes,
  badges, or partner counts.

## 5. Design and interaction rationale

- **Timetable structure.** Mono time labels (After close, Overnight, Before
  prep, Before you start, Each morning, Every week...) in a left column with
  hairlines. Time is the organizing idea at every scale: a day in the hero,
  a night in the timetable, a week of setup in the time card, a year of
  chores in What's next.
- **Night and morning as color, not gradient.** One night-blue band
  (#172030) holds Tooey's hours. It ends with a hard edge at "Before prep",
  where the page turns back to warm paper and the rail continues across the
  edge. Lamp amber (#e9ae52) marks Tooey's work in progress: the night line,
  the "now" dot, the Prep column, the key pins. Leaf green is used once, for
  "In the pilot now".
- **Type.** Besley (a Clarendon revival, OFL) for headlines: it reads like
  print on a menu board or a time card, warm without the AI-default serif
  look. Hanken Grotesk for text. DM Mono for times, counts, and labels, with
  tabular figures so the sheet reads like a printout. All self-hosted
  (latin subsets, ~100 KB total).
- **Paper objects, not dashboards.** The email, the POS slip (torn edge),
  the prep sheet, and the time card are things an owner already handles.
  Each is small and holds only plausible example values.
- **Interaction, kept few and purposeful.** The hero load sequence (pure
  CSS; final state is the resting style, so reduced motion and no-JS show
  the complete picture). In the overnight timetable, the row at mid-screen
  lights its dot as "now". Hovering a key on the sample sheet lights the
  matching column or the blank rows. Phone menu with Escape and outside
  click to close.
- **Responsive.** Below 900px the day strip turns vertical (segment heights
  keep the day's proportions) and the email card sits under it. The
  timetable collapses to label-above-content with the rail kept on the
  left. The sheet keeps all four columns down to 320px.
- **Accessibility.** Landmarks, one h1 per page, h2/h3 in order, real
  tables with captions and row/column headers, skip link, visible focus
  rings (ink on paper, amber on night), AA contrast checked for every
  text color pair, decorative slips and bracket labels `aria-hidden`, form
  status in a polite live region, invalid fields marked `aria-invalid` and
  focused.

## 6. Illustrative vs. factual

Illustrative (all labeled "Example", "Example values", or "Sample values"):
every dish name and number on the hero email, both overnight slips, and
the sample sheet; "Tuesday", "Monday", "Spring", "Recent Tuesdays 38 41 39
44 40"; the proportions of the day strip (no clock times are shown on
purpose, since the list's delivery time is only "before prep").

Factual, from the brief: pilot, free for now, no price or trial length;
small team of university students; Tooey LLC; nightly download from the
POS, set up by the team, works with most systems; inputs are past item
sales, day of week, time of year, holidays (not weather, events,
reservations); Predicted, Prep (a little over Predicted, cushion size not
stated), change vs. the same weekday last week; blanks for dishes under
about five weeks on the menu or under about one sold a day; about five weeks
of past sales to start; about a week of setup (what matters in your
kitchen, how the list is set up, checking it); email each morning before
prep, printable; check counts against sales during the pilot. Privacy page
facts as given.

## 7. Strengths, weaknesses, open questions

Strengths
- The day strip makes "time back" visible in one glance, without a single
  time figure.
- The time card is an unusually exact statement of the owner's cost, which
  is the most credible way to promise less work.
- The vision section is useful to an owner (it names their chores) while
  staying unmistakably future tense.

Weaknesses
- At wide desktop widths the hero has open space left of the email card,
  under the caption. It reads as editorial whitespace, but a stricter
  director might want it filled or the hero shortened.
- The page is long on phones (about 8,700px at 390 wide), mostly from the
  vertical day strip, the two slips, and the full sample sheet.
- "Tooey's hours" and the night band may read as more machinery than an
  owner needs; the slips are decorative and could be cut if the page must
  be shorter.
- The OG image path is relative (`og.png`); most link-preview crawlers need
  an absolute URL, so set it once the domain is known.

Open questions for the founder
- "We haven't yet measured how close the counts run in a working kitchen"
  is stated in the pilot section. It is true and builds trust, but it is
  more candid than the live site. Keep it?
- The privacy page adds a "This website" row: no analytics, no ad trackers,
  self-hosted fonts. True of this build; it must stay true if Vercel
  Analytics or anything similar is added.
- "The download runs by itself each night" and "nothing for you to keep
  running" imply the team looks after the nightly pull. Is that a promise
  you're comfortable making during the pilot?
- Is "vs. last Tue" a percentage in the real list (the live site shows %),
  or a count? The sample uses %.
- The chores in What's next are ordered by cadence. Would you rather lead
  with the one you intend to build next?

## 8. Stack

Hand-written HTML, CSS, and a small vanilla `site.js` (about 4 KB). No build
step, no dependencies, no third-party requests at runtime except the form's
POST to FormSubmit. Fonts are latin-subset woff2 files from Fontsource,
copied into `fonts/` with their OFL licenses. `og.png` was rendered from the
page's own CSS with Playwright and color-quantized; to change it, re-render
a 1200x630 screenshot and save over it.
