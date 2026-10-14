# 17, plainspoken

A plain product site. The page is white with true black type, and every figure on it is set type in Atkinson Hyperlegible Next. Colour carries meaning:

- Ledger grey: what sold.
- Teal on Rinse: what Tooey makes today.
- Black type on plain white: what is still being built.

## Files

- `index.html`, `privacy.html`, `styles.css`, `site.js`
- `fonts/` holds the Atkinson Hyperlegible Next variable font (latin, weights 200 to 800) and its OFL licence.
- `vendor/gsap.min.js` is GSAP 3.15 core from npm. No plugins are used.
- There is no build step and nothing is fetched at runtime. The form posts to FormSubmit only when someone sends it.

## Palette

| Name | Hex |
|---|---|
| Plate | #ffffff |
| Ink | #000000 |
| Prep teal | #00766d |
| Rinse | #e4f0ee |
| Ledger grey | #63686b |

## The animations (all type, no charts)

- **Hero.** Plays on load and runs about 2.9 seconds.
  - Monday's sales tally up in grey.
  - Each row lifts off the list and slides across into "Prep for Tuesday", growing to display size.
  - The sold figure rolls, odometer style, into Tuesday's predicted figure.
  - Prep counts in bold teal.
  - Lamb special rolls to a dash, and "New this week" types in under it.
- **Prep.** Plays in view.
  - Short rib on the last five Tuesdays rolls in.
  - Each figure is carried down into Predicted, which keeps a running average (31, 33, 33, 32, 33).
  - Prep then slides out from behind 33 and counts up to 36 as it turns teal and heavy.
- **Shifts** (being built). Every hour starts at the same "4". Each hour then rolls to its own head count and swells or thins in weight and size with the night.
- **Growth** (being built). The week's day names take their weights, Friday and Saturday heavy. Then Tuesday fills in letter by letter.
- **Getting started.** Prep 36 sits still while Sold counts up through the night to 34.

## Behaviour

- Under reduced motion, or without JavaScript, every figure shows its final state from the markup. The final state is the designed static frame, and JavaScript only primes the start states.
- Each animation has an icon-only Replay button once it has played.

## Copy

The home page has 196 visible words, counted from the rendered DOM with the form, nav and footer excluded.

- The count includes every word inside the animations, the three "Example" captions and the email address.
- Bare numerals (36 tokens) are not counted.

## Tried, and not kept

- **Charts.** An earlier plan used bars, a level line, a busy curve and a column of seat dots. Another exploration owns that chart language, so every figure became type.
- **A floating email card in the hero.** It was dropped as a round-one tell. The hero is a table set directly on a full-bleed band.
- **Teal on the header's "Join the free pilot" link.** It was removed so that teal only means live or what to make.

## Known weaknesses

- On phones the hero rows travel vertically, and for about half a second they overlap each other mid-flight.
- The Getting started figure is the plainest of the five.
- The hours in Shifts (4 to 11) rely on the heading to read as evening.
