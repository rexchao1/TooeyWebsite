# 18 hospitable

A plain site for Tooey on kraft paper. The motion is hand-inked kitchen
things: deli quarts with masking-tape labels that fill to the morning's count.

## Build

`node _src/build.mjs` writes `index.html` and `privacy.html`. The drawings
are generated there, so the wide and narrow hero share one model. `styles.css`,
`site.js` and `favicon.svg` are edited directly. GSAP 3.13 core is vendored
in `vendor/`. Besley and Shantell Sans (both OFL) are in `fonts/`. Nothing
loads from another host.

## Tokens

- Kraft #D9BD95 (ground)
- Espresso #24180F (text, ink, buttons)
- China marker #AE3317 (counts, focus, link underline)
- Tape #EEDFB4
- Deli white #FCFBF7
- Food fills, only inside the live drawing: braise #93401F, risotto #E3AE4A, soup #7A9443

Type: Besley for everything, Shantell Sans only for labels inside drawings.

## Live vs being built

Prep sits on the counter, inked and coloured in, and its quarts really fill.
Shifts and growth are drawn on order-pad sheets taped to the wall, inked but
not coloured in. One sentence says so. No badges, dates or order.

## Animations

- Hero, on load (about 5s). Tickets drop onto the spike, the moon sets and
  the sun comes up, then each tape is written and its quart fills and
  sloshes. The special gets a dash and "new this week" and stays empty.
  Hovering a quart tips it and sloshes it.
- Prep, on entering view. The quart fills to "expect 17", then a hatched
  cushion tops it up to "make 19". The special's tape gets a dash.
- Shifts sheet. A busy-night hill is drawn, then shift strips slap on
  under it, stacking where the night peaks.
- Growth sheet. Plates appear table by table in a quiet Tuesday room, then
  one table is circled "back again".
- Line boil: the ink filter's seed cycles through three values every 160ms,
  only while a drawing is on screen. It is off under reduced motion, and
  every drawing is authored in its final state, so reduced motion and no-JS
  both show the finished picture.

## Word count

198 visible words on the home page (main content, including drawing labels
and the four stroke-drawn numbers; nav, form and footer excluded).

## Tried and changed

- Cobalt accent dropped for china-marker red-orange (blue is on many sibling sites).
- Pencil-vs-ink for "coming" dropped (another site's device). Replaced with
  taped-up sheets, inked but not coloured in.
- Ticket placement moved into an inner group, because GSAP's y overwrote the
  SVG translate.
- The hero switches to the 2x2 narrow drawing below 900px; at 768 the wide one's labels were too small.
- The form card's offset shadow was removed, as the one accessory to take off.

## Weakness

The PNG wordmark's wooden spoon is tan on tan and nearly disappears on
kraft. A real build would want a one-colour version of the mark.
