# 07: Your sales keep time

## Concept
A year of one dish's sales (sample data), drawn as a ribbon as thick as each day's sales. Laid end to end, it is noise. Wound into a coil and tuned by hand to seven days a turn, every weekday stacks into one spoke: Friday and Saturday come out solid, Monday comes out thin. The next stretch of ribbon, in orange, is tomorrow: "26 margheritas to prep tomorrow."

## Signature motion
- **Opening, about 3s.** A pen lays the year down as a flat waveform. The strip then winds up like tape into a coil at 10.6 days a turn. This is done by integrating the ribbon's heading day by day while the curl grows, then blending into the exact spiral.
- **The dial.** The visitor turns it: drag around the centre (or sideways on a phone), mouse wheel over the dial, or arrow, Page and Home/End keys on the focused slider.
- **What turning shows.** The rim rotates with the hand, and the spiral arms swirl and straighten as the period changes.
- **The lock.** A magnetic detent near 7 pulls and holds the dial. On lock the ribbon thickens for a beat, the weekday names set in, and tomorrow's stretch grows on a spring. Then the count rolls up in the caption.
- **Wheel and flicks.** The wheel stops at the detent and then lets the page scroll on. A flick with inertia gets caught by the detent.
- **Auto-tune.** If nobody touches the dial for about 4s after the opening, it turns itself slowly to 7.
- **How it's built.** Plain Canvas 2D, about 350 lines (`dial.js`), no libraries.
- **Shared data.** `sample.js` is shared by the canvas and `_src/build.js`. The build prerenders the still, the four dish rosettes and the favicon as SVG into the HTML. Run it with `node explorations/07-your-sales/_src/build.js`.
- **Reduced motion and no JavaScript.** These get the designed still: the flat strip ("Laid end to end") above the tuned rosette ("Wound to a week"), with tomorrow marked and the full caption.

## Palette and type
- **Colours:**
  - Olive `#5E5A20` (ground)
  - Parchment `#F1EAD2` (ink, ribbon, text)
  - Orange `#FF9446` (tomorrow and buttons only)
  - Dark olive `#4C4818` (pilot band)
  - Pale olive `#D8D1AC` (secondary text)
  - `#24210A` (text on orange)
- **Type:** Big Shoulders Display (OFL) for headlines, numbers and dial labels. Its light, tall strokes echo the ribbon. Brygada 1918 (OFL) is the text face. Both are self-hosted.
- **Logo:** the existing PNG, recoloured to parchment with a CSS filter.

## Words
133 visible words on the home page, excluding nav, form labels, the submit button and the footer. That count includes both the pre-lock prompt and the post-lock caption. The reduced-motion still adds 6 words ("Laid end to end", "Wound to a week").

## Illustrative vs factual
- **Illustrative:** every number in the dial and dish rosettes, each labelled sample data. The forecast in the sample is a stand-in (an average of the last four same weekdays plus 10%), not Tooey's model. The dishes, the closed days and the holiday spikes are invented.
- **Factual:** nightly reading of sales, a per-dish prep count by morning, weekday, season and holidays as inputs, about five weeks of past sales, about a week to the first count, the owner checking counts against sales, a blank for dishes too new, and the free pilot. The privacy page states the privacy facts.

## Weaknesses
- The lock is the payoff, but "Turn the dial to 7" asks for trust before the visitor knows why; the auto-tune covers people who don't try.
- Seasons and holidays show only as texture in the ribbon. Holiday labels were cut because they were illegible over the coil.
- The Short rib rosette (19 days, outer edge only) reads as a bare ring and could be mistaken for a rendering gap.
- On phones, turning means a sideways or circular drag, because vertical swipes scroll the page. Touch was not tested on a real device, only by mouse in Playwright.
- The dark olive ground with one bright accent sits close to the "dark ground plus one accent" default. It is mid-tone and chromatic rather than near-black, and the ink is warm parchment.
