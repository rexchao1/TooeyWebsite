# 08 · The analyst

Brief: "What the chains have." Tooey brings independent restaurants the
nightly analysis that restaurant groups keep people on staff for, starting
with the prep count.

## 1. Positioning in one sentence

Every night, Tooey goes through an independent restaurant's sales the way a
restaurant group's analyst would, and the first thing it hands back is
tomorrow's prep count.

## 2. Core message and why

At an independent restaurant nobody's job is reading the numbers. At a group,
someone's is. Tooey is on the independent's side of that gap and is building
software to do that work for one restaurant at a time. Prep is the first part
of the job it has taken on.

Why this message: it gives the owner a reason to care beyond "a forecast".
Prep alone sounds like a small tool. Framing it as the first piece of a job
that groups pay for explains why it matters, makes the vision legible without
promising it, and keeps the headline broad enough for the company to grow into
(the founder rejected headlines that make forecasting sound like the whole
company). The chain comparison describes a role, not a statistic, and never
claims Tooey matches enterprise tools: the headline says "the way an analyst
would", and the rest of the page is careful about how much is done today.

## 3. What the visitor understands first, and the journey

1. **Opening.** The headline (who and why), one plain lead (what exists: a
   count per dish, worked out overnight, emailed before prep), "Join the
   pilot". Directly under it, on a graph-paper desk, the list itself (Fig. 1)
   with a three-item key that lights the matching column.
2. **The gap** (dark band). The point of view, in kitchen terms: ordering,
   the schedule, the walk-in, the pass. Ends on where Tooey stands.
3. **The job.** A ledger of an analyst's work as owner questions (prep,
   forecasting with weather and events, profitability, staffing, guests, the
   whole picture). Only prep is marked "In the pilot now". The rest are
   "Where we're going", with no dates. This is the vision, shown as a list
   that is plainly mostly not done.
4. **Between close and prep.** Four stops (after close, overnight, before
   prep, the next night), a plain statement that the nightly work is
   automated and people come in at setup and on email, Fig. 2 (one dish's
   last eight Tuesdays and this Tuesday's count), and what goes into a count
   versus what does not yet.
5. **A blank is a decline, not a zero.** The rule for new and slow items, and
   the admission that accuracy has not been measured at a live restaurant.
6. **Joining the pilot.** Free for now, no price set, five weeks of sales,
   about a week of setup, what happens to their sales, who we are.
7. **Contact.** Form plus a large mailto. The message field asks "What do you
   wish you knew about your numbers?", which fits the analyst idea and gives
   the team something useful for deciding what to build after prep.

Privacy is its own page, written as a reference in rows.

## 4. How it builds trust

- The product is shown, not described: a full list with categories, a bold
  Prep column, and two rows left blank with their reasons.
- Every sample is labelled as made up, in the figure caption, in the
  table caption for screen readers, and on the printout.
- The page says what Tooey does not do: the ledger marks five of six jobs as
  future; "Not yet: weather, local events, reservations"; "Nobody at Tooey sits
  up going through your numbers by hand"; "We haven't measured accuracy at a
  live restaurant yet, so you won't find an accuracy figure on this site."
- The decline rule is presented as the analyst's discipline: it would rather
  say "not enough history" than invent a number.
- Small and named plainly: university students, Tooey LLC, a real inbox.
- No logos, testimonials, counts, badges, or figures.

## 5. Design and interaction rationale

- **Idea:** an analyst's report on the independent's side. Figures are
  numbered and captioned ("Fig. 1", "Fig. 2") like a research brief; the
  numbers sit in a monospace; the sheet lies on a graph-paper desk.
- **Type:** Besley (a Clarendon revival, the type of old menus, ledgers, and
  shop signs) for headlines, as the voice of the independent restaurant.
  Commissioner for reading, warm and plain. IBM Plex Mono for every number and
  caption, the analyst's hand. All OFL, self-hosted, latin subset (about
  100 KB total). None of the founder's rejected faces.
- **Color:** warm paper (#f5f1e8), blue-black ink (#18212d), one ledger blue
  for actions (#1f3f66), a rust "red pen" (#9a4719) for annotations and the
  blank-row reasons, butter (#f2e2a6) only as a highlighter. One dark band for
  the point of view, and the footer. All text pairs pass WCAG AA (checked).
- **Rhythm:** paper, desk, night, paper, paper, desk, paper, desk, night. The
  page changes ground at each change of subject, so no section needs an
  eyebrow label.
- **Interactions (each one earns its place):**
  - The key under Fig. 1 lights its column on hover or keyboard focus; click
    pins it (`aria-pressed`).
  - "Print this example" prints only the sheet, because the real list is
    meant to be printed and used on the line. The printout carries a "made up"
    note.
  - The overnight line draws once when it scrolls into view; the bars of
    Fig. 2 rise once. Hovering a bar shows its value. Both are static under
    `prefers-reduced-motion` and without JavaScript.
  - Phone menu: a disclosure button, closes on Escape, outside click, or a
    link; without JavaScript the nav wraps under the logo.
  - Form: inline errors with focus on the first bad field, "Sending…",
    success and failure messages (failure keeps the typed text and offers the
    mailto). Without JavaScript it falls back to a plain FormSubmit POST.
- **Favicon:** three bars with the last one outlined and a line above it,
  the same "predicted and prep" marks as Fig. 2.

## 6. Illustrative vs. factual

Illustrative (example values, labelled as such): every dish name and number
in Fig. 1, the blank-row examples (Burrata "three weeks on the menu",
Whole branzino "sells under one a day"), all values in Fig. 2, the weekday
(Tuesday), and the Open Graph card.

Factual (from the brief, nothing added): nightly recompute from past
item-level sales, day of week, time of year, holidays; not weather, events,
or reservations; Predicted, Prep (a little over Predicted, cushion not
stated), change vs. same weekday last week; grouped by category; blank under
about five weeks or about one a day, with the reason; email before prep,
printable; nightly POS download set up by the team, works with most systems,
Square/Toast/Clover exports recognised, others mapped; about five weeks of
history; about a week of setup; check against what sold, then decide; pilot,
free for now, no price; small team of university students, Tooey LLC,
tooeyteam@gmail.com; the privacy facts.

Statements about restaurant groups (someone studies what sold, compares to
last year and holidays, works out plate margins and staffing) are general
descriptions of the role, with no figures.

## 7. Strengths, weaknesses, open questions

Strengths
- The owner sees the actual product within one scroll, and learns how to read
  it on the spot.
- The vision is present but visibly not promised: one row lit, five dashed.
- A clear point of view without naming or attacking any chain.
- Honest about accuracy and about what is automated, which suits an
  "analyst" brand better than confidence would.

Weaknesses
- The headline is long (14 words). It reads well at desktop and phone, but it
  is a sentence to read, not a glance.
- "The way a restaurant group's analyst would" may still read to some owners
  as more than a prep count. The page corrects this quickly, but the
  headline alone leans on the vision.
- The right column beside Fig. 1 has air at wide desktop widths.
- Fig. 2 could suggest the count is a trend line on one weekday; the caption
  says it is one input of four, but a hurried reader may miss it.
- The OG image path is relative (`og.png`); most link previews need an
  absolute URL once the site has a domain.

Open questions for the founder
- Is "analyst" the right word for owners, or would "the numbers person" or
  "back office" land better?
- Is it all right to say on the site that accuracy hasn't been measured at a
  live restaurant? It is true and builds trust, but it is a choice.
- Should the ledger order (forecasting, profitability, staffing, guests)
  reflect an intended build order? Right now it implies none.
- The contact question "What do you wish you knew about your numbers?" is
  optional. Keep it, or go back to a plain "Anything else?"

## 8. Stack

Hand-written HTML, CSS, and a small vanilla script (`site.js`, about 7 KB).
No build step and no dependencies.

```
index.html     home
privacy.html   privacy
styles.css     all styles, including print
site.js        menu, key highlight, print, reveals, chart hover, form
fonts/         Besley (variable), Commissioner (variable), IBM Plex Mono 400/500, all OFL, from fontsource
logo.png       copied from the repo root
favicon.svg    new mark for this exploration
og.png         1200x630 share card (rendered from HTML with Playwright)
```

Preview from the repo root: `python3 -m http.server 5208`, then open
http://localhost:5208/explorations/08-the-analyst/
