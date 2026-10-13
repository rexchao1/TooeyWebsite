# 06: One empty cell ("The company", round two)

Preview: serve the repo root (`python3 -m http.server 5216 --bind 127.0.0.1`)
and open `/explorations/06-platform/`. Pages: `index.html`, `privacy.html`.

## Concept

A restaurant's sales history is a big woven field with one empty column on the
right: tomorrow. The company's ambition is in the headline ("Independent
restaurants, run on their own numbers."). What works today is one cell of that
column being filled. The site does not list future modules and has no roadmap.
The scale of the field carries the ambition, and the single number shows how
narrow the product is today.

## Signature motion: Powers of Ten, into one cell

`dive.js` draws on a 2D canvas, with no libraries. A sticky stage is pinned
for 580vh, and scroll progress drives it through a smoothed rAF loop.

1. **Load (1.5s).** An example year of 29 dishes by 366 days is woven in on a
   diagonal like a loom. Each day is a brass bar on a row track. Mondays,
   Thanksgiving, Christmas and a week off in January show as gaps.
2. **Scroll.** The hero copy fades out and the field grows to fill the screen.
   Dish names come in down a gutter on the left. A porcelain read head runs
   down today's column ("Each night, Tooey reads the day's sales.").
3. **Short rib.** The row swells to 30% of the field and the other rows go
   sage. Its Wednesdays stay brass, a bracket marks the same weeks last year,
   and markers drop onto the holidays. The caption lights each phrase as its
   mark appears.
4. **The push.** The camera zooms in log space, per axis, into short rib's
   empty tomorrow cell. The other dishes' tomorrow cells fill on the way in,
   and the blanks stay as outlined cells. The cell fills with brass from the
   bottom until it is the whole screen.
5. **Landing.** Inside the brass cell, an odometer rolls to Prep 34 (the ones
   digit turns three full times and the tens digit carries). Then Predicted
   31, +4 on last Wednesday, and four list rows appear, two of them blank with
   their reasons.

The whole sequence is scrubbed, so it runs backwards when you scroll up.

**Reduced motion and no JavaScript.** The page shows a designed still
(`img/field-still.webp`, plus a 9-week phone crop) rendered by the same
`draw()` code. It shows the year, short rib's row with the weighing marks, and
tomorrow's cell filled and ringed. Below it are the captions as plain text and
the brass landing as a normal section.

## Palette and type

| Name | Hex | Use |
|---|---|---|
| Bottle | #173A2F | ground throughout |
| Deep | #0F2A21 | ink on brass, form fields |
| Brass | #D4AA6F | sales bars, the filled cell, the landing ground, buttons |
| Porcelain | #EEF0EA | text, read head, marks (never a ground) |
| Sage | #A9BDB1 / bars #46685B | quiet text, dimmed rows |
| Leaf | #A7C584 | focus rings and success only |

The type is Encode Sans (OFL, variable weight and width), self-hosted as one
44 KB file. Its width axis does the work: 122–125% for the headline and the
count, 100% for reading, 88% and semi-condensed for dish names and data labels.

## Words

The home page has **141 words** of visible copy, counted from the main element.
That excludes nav, form labels and footer. It includes buttons, sample numbers
and list rows, and counts the duplicated caption once. The canvas also draws
data labels inside the illustration that are not counted: 29 dish names,
month initials and "Tomorrow".

## Illustrative vs factual

- **Illustrative:** every figure and dish. The restaurant, its year, the
  closures, 34, 31, +4, 41, 18, and the blank reasons as wording are all
  invented. The field is labelled "An example restaurant's year".
- **Factual:**
  - nightly read of the day's sales
  - inputs are weekday, time of year and holidays (no weather or events)
  - Prep and Predicted, change on the same weekday last week
  - blanks with a reason for dishes that are too new or too slow
  - emailed each morning
  - pilot free for now
  - nightly POS download that works with most systems
  - about five weeks of past sales and about a week of setup
  - the owner checks the counts against what sold, then decides
  - a small team of university students
  - the privacy page facts

## Weaknesses

- **Dive length.** The dive is long (about 4.8 screens of scroll) before the
  form. The hero button and the nav skip straight to it, but a skimmer on a
  phone still scrolls a lot.
- **Phone view.** On a phone the year is under 1px per day, so the weekday
  highlight reads as texture rather than as distinct Wednesdays.
- **Phone still.** The phone still crops to 9 weeks while the caption still
  says "year".
- **Mid-push frames.** For a moment (about 0.78–0.82 progress) the zoom shows
  large flat blocks before the screen goes fully brass. It reads as abstract
  rather than as a cell.
- **Pilot section.** It is a conventional heading, paragraph and form, kept
  quiet on purpose.
