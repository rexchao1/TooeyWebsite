# 20-bold: notes

Bold and graphic. A direct site with big sign-letter type on a persimmon
ground. Motion lives inside four illustrations, each explaining one thing.

## System
- Colours: persimmon #FF6A1F (ground), taffy #FFA3D7 (live sections), lemon
  #F7EE4F (spot only), plate #FCFCFF (being-built section), ink #14176A (all
  text and line art, no black).
- Text pairs: ink on persimmon 5.4:1, ink on taffy 8.4:1, ink on lemon 12.7:1,
  ink on plate 15:1, white on ink 15.4:1, persimmon on ink 5.4:1.
- Type: Tilt Warp (OFL), with its XROT and YROT axes driving the moving type,
  and Rethink Sans (OFL) for body text. Both are self-hosted in `fonts/`, about
  104 KB together.
- No libraries. Motion uses the Web Animations API, with registered custom
  properties (`--xr`, `--yr`) animating the font axes.

## Live vs being built
- Prep and Getting started sit on taffy, drawn with filled shapes.
- Shifts and growth sit on plate white and are drawn with ink lines only.
- One sentence opens the section: "Prep is live. Shifts and growth are
  drawings of what we're building next."

## Animations
1. Hero: the headline words swing round on XROT. A taffy shelf draws, and three
   counts drop onto it, rolling digits as they fall, then squash and settle. A
   lemon "Too new to call" pill slides in for Tiramisu. On a mouse, the
   headline and counts lean toward the pointer.
2. Prep: an ink bar fills to Predicted 57. A lemon tip grows ("a little over").
   The big number flips on XROT to Prep 61.
3. Shifts (concept): a busy-night curve draws. Staff pills pile in too early,
   then slide right to fit under the curve.
4. Growth (concept): Tuesday comes forward and fills with guests. One regular
   travels back from Thursday along an arc.

Under reduced motion, and without JavaScript, every animation shows its
finished state. On phones the week drawing crops to Monday to Thursday.

## Word count
- 196 words by script (main text, minus form labels, inputs and sr-only text,
  plus the Send button).
- The step numerals 1, 2 and 3 come from CSS counters. Counting them makes 199.

## Tried and changed
- An ultramarine ground was dropped after review: at thumbnail size it matched
  another site's blue.
- The first drop came from above the viewport and fell through the headline.
  Each count is now clipped to a line just above itself.
- The "live" status dot was removed (the accessory test).
- The growth drawing first had the regular coming from Saturday. It now comes
  from Thursday, so the phone crop keeps the whole path.

## Weak spots
- The growth drawing is small at desktop widths.
- The wordmark is typeset in Tilt Warp, not the real logo.
