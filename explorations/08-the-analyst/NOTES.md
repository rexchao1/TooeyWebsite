# 08 · The analyst

Brief: "What the chains have." Tooey brings independent restaurants the
nightly analysis that restaurant groups keep people on staff for, starting
with the prep count.

## 1. Positioning in one sentence

Every night, Tooey goes through an independent restaurant's sales the way a
restaurant group's analyst would, and the first thing it hands back is
the day's prep count.

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

1. **Opening (ochre).** The headline, one plain lead (a count per dish,
   worked out overnight, emailed before prep), "Join the pilot". Then Fig. 1,
   full width: the sample list drawn as rows of plate symbols, with the real
   numbers beside each row and a switch to see it "As it arrives".
2. **The gap (blue).** The argument in kitchen terms (ordering, the schedule,
   the walk-in, the pass), and Fig. 2, a pictogram diagram: at a group one
   person per job, at an independent one person with four jobs and the sales
   numbers left with nobody. Ends on where Tooey stands.
3. **The job (grey).** A table of the analyst's work as owner questions. Only
   prep is marked "In the pilot now"; the rest are "Where we're going", with
   no dates.
4. **Between close and prep (grey).** Four steps, a plain statement that the
   nightly work is automated, Fig. 3 (one dish's last eight Tuesdays as rows
   of symbols, then this Tuesday's count), and the inputs used versus not yet.
5. **A blank is a decline, not a zero (red).** The rule for new and slow
   dishes, shown as an empty row, and the admission that accuracy has not been
   measured at a live restaurant.
6. **Joining the pilot (grey).** Free for now, no price set, five weeks of
   sales, about a week of setup, what happens to their sales, who we are.
7. **Contact (ochre).** Form plus a large mailto. The message field asks
   "What do you wish you knew about your numbers?"

Privacy is its own page: an ochre head, then reference rows on grey.

## 4. How it builds trust

- The product is shown with its real numbers, not only described. The picture
  never stands alone: every row of symbols has its Predicted, Prep, and change
  printed next to it, and one click shows the plain list as it arrives.
- Every sample is labelled as made up: in the figure captions, in the table
  caption for screen readers, and in the share image.
- The page says what Tooey does not do: five of six jobs marked as future;
  "Not yet: weather, local events, reservations"; "Nobody at Tooey sits up
  going through your numbers by hand"; "We haven't measured accuracy at a
  live restaurant yet, so you won't find an accuracy figure on this site."
- Fig. 2 is captioned "A diagram of the argument above, not data", so the
  pictograms can't be read as a statistic about chains.
- Small and named plainly: university students, Tooey LLC, a real inbox.
- No logos, testimonials, counts, badges, or figures.

## 5. Design and interaction rationale

**Idea: statistics for the independent.** The identity comes from Isotype,
the picture-statistics method Otto Neurath and Gerd Arntz built in 1920s
Vienna so that working people could read the figures that until then only
officials and firms could read. That is this site's cause: the numbers big
operators take for granted, made readable for one restaurant. So the site
is made of numbered plates and figures where one symbol stands for a fixed
quantity (here, one plate symbol is two plates sold), in flat colour, with a
geometric sans.

- **Colour as plates, not accents.** Ochre is the identity (the opening and
  contact plates, the "now" row, the stance line). Blue carries the argument,
  red carries the decline, a neutral grey carries the reference sections, and
  ink is the type, rules, and buttons. Colour has a job inside the figures
  too: black is Predicted, red is the extra in Prep, blue is past sales.
  Every text pair passes WCAG AA, and the red symbols keep 3.4:1 against
  ochre as graphics.
- **Type.** Jost (an OFL face in the Futura tradition Isotype used) for the
  headings and controls; Commissioner for reading; IBM Plex Mono for numbers,
  captions, and figure labels. No serif anywhere.
- **Rules instead of cards.** Thick 6px ink rules open each figure and table,
  1.5px rules divide rows. Nothing floats on a white card; the list is drawn
  straight onto the plate.
- **Marks.** Solid symbols only: a filled plate, a filled person, task
  glyphs (bars, crate, calendar, snowflake for the walk-in, service bell for
  the pass). "Not yet" is an open ring, and a blank is an empty row.
- **Wordmark.** "tooey" set in Jost with the plate symbol, so the brand and
  the charts share one mark (also the favicon). The repo's PNG wordmark is not
  used: its warm grey and tan disappear on ochre.
- **Interactions (each one earns its place):**
  - Fig. 1 switches between "Drawn" and "As it arrives" (`aria-pressed`
    buttons). The table is the same; the drawn view adds the symbols.
  - The symbols are counted out left to right once when Fig. 1 and Fig. 3
    come into view (a clip reveal, under a second). They stay still under
    `prefers-reduced-motion` and without JavaScript.
  - "Print this example" prints only the list, without the symbols, the way
    the real list goes up on the line.
  - Phone menu: a disclosure button, closes on Escape, outside click, or a
    link; without JavaScript the nav wraps under the wordmark.
  - Form: inline errors with focus on the first bad field, "Sending…",
    success and failure messages (failure keeps the typed text and offers the
    mailto). Without JavaScript it falls back to a plain FormSubmit POST.
- **Phone.** Fig. 1 rows stack: dish, then its symbols at a smaller unit,
  then the three numbers with short labels. Fig. 3 rows put the week and
  count above the symbols. Nothing scrolls sideways at 320.

## 6. Illustrative vs. factual

Illustrative (example values, labelled as such): every dish and number in
Fig. 1 (all even, so each two-plate symbol is whole), the blank-row examples
(Burrata "three weeks on the menu", Whole branzino "sells under one a day"),
all values in Fig. 3, the weekday (Tuesday), the Fig. 2 diagram (a picture of
the argument, not data), and the share image.

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
- It looks like nothing else in the set: ochre plates, pictogram charts, a
  geometric sans, no cream, no serif, no white card.
- The look is the argument: Isotype was made to give ordinary people access
  to statistics, which is the cause the copy states.
- The owner sees the actual list within one scroll, with numbers they can read
  without learning the chart, and can flip to the plain list.
- The vision is present but visibly not promised: one row lit, five plain.

Weaknesses
- The headline is long (14 words). It reads well at desktop and phone, but it
  is a sentence to read, not a glance.
- "The way a restaurant group's analyst would" leans on the vision; the page
  corrects this quickly, but the headline alone suggests more than prep.
- Ochre is a strong, warm colour. It reads as confident and kitchen-like
  to me, but some owners may find a whole yellow plate loud. A paler ochre is
  an easy dial if so.
- The drawn Fig. 1 is a translation of the list, not the email itself; the
  "As it arrives" view and the caption carry that honestly, but it is a step
  removed from the real product.
- The share image path is relative (`og.png`); link previews need an absolute
  URL once the site has a domain.

Open questions for the founder
- Is "analyst" the right word for owners, or would "the numbers person" or
  "back office" land better?
- Is it all right to say on the site that accuracy hasn't been measured at a
  live restaurant?
- Should the job table's order (forecasting, profitability, staffing, guests)
  reflect an intended build order? Right now it implies none.
- Would the real nightly email benefit from the drawn view, or should it stay
  a plain list?

## 8. Stack

Hand-written HTML, CSS, and a small vanilla script (`site.js`). No build step
and no dependencies. Pictogram rows are pure CSS: one element per run of
symbols, with the symbol as a repeating SVG background and the width set to
count × unit, so a whole row is a single element and needs no script.

```
index.html     home (includes an inline SVG sprite for the pictograms)
privacy.html   privacy
styles.css     all styles, including print
site.js        menu, Fig. 1 view switch, print, one-time reveals, form
fonts/         Jost (variable), Commissioner (variable), IBM Plex Mono 400/500; all OFL, from fontsource, latin subset
favicon.svg    the plate symbol on ochre
og.png         1200x630 share card (rendered from HTML with Playwright)
```

Preview from the repo root: `python3 -m http.server 5208`, then open
http://localhost:5208/explorations/08-the-analyst/

## Revision (second pass)

The coordinator's review: keep the strategy and copy, but the look sat in the
same family as other explorations (cream paper, serif headlines, a dark
rectangular button, a white card holding the sample list, dashed or hatched
marks for "not built"). The founder asked for ten fundamentally different
sites. Besley was also in use on two other sites, and a later note listed
looks now taken elsewhere (cream with a serif, cool grey with a royal blue,
navy on white, a deep blue column on grey).

What changed and why:
- **Identity.** The research-brief idea is pushed to its source, Isotype:
  picture statistics made so ordinary people could read the numbers. Ochre is
  the dominant ground; blue, red, and grey are section plates. Blue is one
  plate and the past-sales symbols, not the identity, and the buttons are ink,
  not blue.
- **Type.** Besley and every serif are gone. Jost for headings, Commissioner
  for text, Plex Mono kept for figures.
- **Fig. 1.** No white card. The list is drawn full width on the ochre plate,
  one plate symbol per two plates, black for Predicted and red for the extra
  in Prep, with the numbers beside each row. "As it arrives" shows the plain
  list. This also removes the empty column beside the figure that the review
  flagged: the figure now spans the page, and its key is a three-part legend
  above the rows.
- **Fig. 2 (new).** The "nobody's job" argument as a pictogram diagram,
  captioned as a diagram, not data.
- **Fig. 3.** The eight Tuesdays kept, redrawn as rows of symbols in the same
  language as Fig. 1, with the count printed on each row.
- **Marks.** No dashes or hatching. "In the pilot now" is the ochre row with
  a filled symbol; "Where we're going" is plain grey text; "Not yet" inputs
  are open rings; a blank is an empty row.
- **Example values.** Fig. 1 and Fig. 3 now use even numbers so every
  two-plate symbol is whole (Caesar 24/26, calamari 18/20, chicken 30/32,
  rigatoni 26/28, affogato 8/10; short rib still 38/42).
- **Wordmark and favicon.** Typographic "tooey" with the plate symbol; the
  PNG logo is no longer shipped.
- Copy is unchanged except the figure captions and legend, which describe the
  new figures.
