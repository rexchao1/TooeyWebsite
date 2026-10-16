# 47 Night to morning

Round seventeen. Rex shared the real Tooey console screens and asked whether real photographs, tied together with motion, would look more real than drawing everything.
47 is 46 with the same words. "What Tooey does" becomes five photographs from Monday's close to Tuesday's service, each carrying a piece of the real console.
Everything not listed here is 46's: see `../46-tooey-os/NOTES.md`.

## What changed
1. **Five photographs, one night.** Pinned, the reel holds one photograph per resting place:
   - Monday 11:42pm, a kitchen counter with its POS terminals after close
   - Overnight, an empty dining room
   - Tuesday 6:00am, first light in the kitchen
   - Tuesday 8:30am, a chef at the prep board
   - Tuesday 7:00pm, a full dining room

   The three steps on the right follow the reel: the first two photographs are Forecast, the next two Prep, the last Shifts.
2. **One treatment, the hour's colours.** Every photograph is greyscale, multiplied onto a light tone and lifted to a dark one (CSS blend modes, no canvas), with a little grain.
   The tones run night blue, night blue, dawn amber, morning paper, evening amber.
   The photographs crossfade (0.9s) between stops and push in slowly with the scroll (1.015x to 1.09x).
3. **Cards cut from the real console.** Each photograph carries one card with the console's own layout and words, set in the site's faces:
   - Sales with "POS synced 11:42pm"; the month's line draws in
   - The forecast strip (expected sales and covers vs an average Tuesday, "Built from" rows); the figures count up
   - The morning email ("From Tooey · 6:00am", Have ready); its rows come in
   - The printed prep sheet (Item, Have ready, On hand, Done) on paper; each line is ticked off
   - Busy hours for an average Tuesday; the day fills in, and 7pm is marked

   The figures are the console's demo restaurant (Juniper Kitchen's Monday and Tuesday), with the restaurant's name left off. Every card is tagged Example.
4. **The hero carries the morning email** in place of 46's "Tonight's prep" window, and the notice reads "Tuesday's prep list is in."
5. **Phone.** Each step is followed by its photographs, and each card is tucked up under its photograph. The heat map drops its dollar figures, the sheet drops On hand, and the hero email is hidden because it would cover the headline (46 had the same overlap; fixed there too).

## The photographs
Free Unsplash stand-ins under the Unsplash licence, kept in `photos/` at 1100 and 2000px wide (about 2.6MB for all ten files):

| File | Unsplash photo |
|---|---|
| `close` | https://unsplash.com/photos/y6XtBLUKNYk |
| `night` | https://unsplash.com/photos/6-zEmwjWDCQ |
| `dawn` | https://unsplash.com/photos/apbA9pu34DY |
| `prep` | https://unsplash.com/photos/y-XZf_TNRms (45's photo) |
| `service` | https://unsplash.com/photos/Rpw5dto_LP4 |

They are from five different restaurants; the shared treatment hides most of that but not all.
Photographs from one real restaurant, shot from close to service, drop straight in: same file names, and each shot has `--fx`/`--fy` for its focal point, `--b`/`--c` for exposure and `--lo`/`--hi` for its tones.

## Checked
At 1440×900 in Chromium: the hero at rest; each of the five pinned stops at rest after its card played; a stop mid-crossfade.
At 390×844 (iPhone 12 Pro preset): the hero, the step-then-photographs order, the forecast, sheet and busy-hours cards.
Reduced motion at 1440: the full-page still (all five stacked, every card finished).

## Weakness
Stock photographs from five places; the night and the morning are not the same room.
Shifts has no screen of its own in the console yet; its stop shows Busy hours, which is what shifts would follow.
The photographs weigh more than the drawn rooms did.
