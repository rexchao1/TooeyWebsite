# 13 Grow: "Room to grow"

## Concept
The home page is one architect's drawing sheet of an example restaurant. Every mark on it stands for a unit:
- a dot is one sale
- a square in a pan is one portion to make
- a diamond is one person on one shift
- a circle in a chair is one cover
- a ring is one return visit

Ink is built and blue is proposed, which is the drafting convention for existing and proposed work. The headline "You didn't open a restaurant to count gnocchi." is answered at the end by "Somebody has to count the gnocchi. It doesn't have to be you."

## Motion and how it's built
The drawing is one inline SVG, generated at build time by `_src/plan.mjs` (run `node _src/build.mjs`), so the full drawing is in the HTML. GSAP 3.15 and ScrollTrigger are saved into `vendor/`. The camera is a single viewBox that moves between seven framing rectangles. Zoom is interpolated geometrically, and the frames are recomputed for each viewport, so a phone gets portrait framings.

**On load (about 4.5 seconds)**
1. The walls draw in and the fixtures and tables appear.
2. Last night's sales pop onto the tables, one dot per dish.
3. The dots drain into the POS stand.
4. An envelope travels up the aisle to the prep table.
5. Four pans fill square by square: the counts tick up to 24, 18 and 31, and the lamb special stays blank with "Too new to call, so we don't."

**On scroll (the scene is 380% of the screen height, pinned)**
1. Close-up on the pans. A line marks the expected count and the lighter squares above it are "a little over".
2. Blue staff diamonds walk in through the back door. The scale bar turns into a 4pm to 11pm hour strip with a busyness curve and four shift bars: "Tuesday: 2 line, 2 floor".
3. Four Tuesdays play on the same room. Ink guests walk in and sit and tables light up, while blue guests fill more empty seats each week. One regular gains a blue ring per return.
4. A blue patio is drawn in, and the caption's own width grows from 68% to 135% on Science Gothic's width axis. The paper unrolls to the right, with a shaded roll travelling along the edge. The camera pans across the street as a second plan draws itself in blue, joined to the first kitchen by one blue line.
5. The camera pulls back to the whole sheet and the closing line appears.

**Responses to the visitor**
- The restaurant field letters your restaurant's name onto the second plan, which is shown in the title-block form.
- A successful send thumps a "Received" stamp onto the plan.

**Reduced motion and no JavaScript**
- The full evening is drawn as a still: full pans, staff, guests, rings, patio and hour strip.
- Numbered tags on the drawing match a numbered list of the captions.
- A second, smaller still shows the whole sheet with the second place.

## Palette and type
| Name | Hex | Role |
|---|---|---|
| Apricot sheet | #F7D4B0 | the drawing paper |
| Table | #EBBD92 | the desk under the paper |
| Plaster | #FCE9D4 | floors and form fields |
| Aubergine ink | #2B1A33 | text and everything built |
| Drafting blue | #2F4FD0 | line work only (outlines, markers, the second plan); no large fills |
| Candle | #FFF4DC | lit tables and their glow |

- **Science Gothic** (variable, free licence) for display, captions, counts and buttons. It follows the squared lettering of Bank Gothic and technical drawings, and its width axis is only used where the restaurant grows.
- **Figtree** for body text and labels. Science Gothic at 420 weight and 19px was too wide and dark for paragraphs, so it stays for display only.
- Fonts are self-hosted in `fonts/`, with their licences.

## Home-page word count
**176 visible words.** This counts the drawing labels, the "Your place" lettering twice and the hero button. Nav, form labels, form states, footer and the privacy page are left out.

## Illustrative versus factual
- **Illustrative**, all under "Example restaurant": every count (24, 18, 31), the sales dots, the hour strip and "Tuesday: 2 line, 2 floor", the guests, the rings and the busyness curve.
- **Factual**:
  - the nightly POS download that works with most systems
  - about five weeks of past sales
  - about a week of setup
  - checking the counts against what sold
  - free during the pilot
  - blanks for dishes too new to call
  - the privacy terms

## How live versus coming is shown
- **Ink means built:** the prep counts and everything that leads to them.
- **Blue means proposed:** shifts, filled slow nights, regulars, the patio and the second place.
- **The key:** a legend on the sheet says "Ink is built. Blue is proposed."
- **The voice:** the shifts caption says "In blue, because we're still drawing it".
- **No roadmap order:** the order comes from the time of day, with no dates and no "next".

## Critique passes
1. **As a design director:**
   - I cut the offset shadows on the buttons; this was the accessory removed.
   - I swapped staff markers that read as eyes for diamonds, and made the hour-strip row markers match.
   - I gave the captions a plate so they stay legible over the drawing.
   - I added the evening candle glow so the Tuesdays read as nights.
   - I tightened the scroll from 600% to 380% of the screen height.
2. **As a busy owner:**
   - I made the hero framing keep the lead text clear of the sheet.
   - I made the button and nav jump straight to the notes and the form.
   - I shortened the dead pan before the second place appears.
   - I fixed the phone hero so the plan sits below the text.
   - I hid the scale bar in the still version.

## Weaknesses
- **Phone:** a landscape plan in a portrait screen leaves empty bands above and below. Pan labels in the whole-sheet frame are too small to read; the pans close-up is where they're legible.
- **Busy middle:** the Tuesdays beat has a lot going on. The difference between the ink and blue guests needs the key.
- **Unscaled timing:** the load sequence (about 4.5s) and the scroll timing are tuned by eye, not tested with owners.
- **"Back end":** the lead uses this phrase. An owner might say "the office side" instead.
