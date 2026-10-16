# 44 35, typed

Round fourteen. Rex preferred 35 to 36 through 43, which did too much.
44 is 35 with five small changes; 35 stays as it was for comparison.
Everything not listed here is 35's: see `../35-operating-system/NOTES.md`.

## What changed
1. **The headline types itself out.**
   - On load a block cursor sits where the headline starts and blinks for about 0.4s.
   - Then the headline types at an uneven hand, in about 1.1s: each key lands at its own pace, now and then two or three come in a quick run, and there is a beat at each space and a longer one at the stop.
   - The cursor drops to the line under it, waits about 0.2s, and rattles it off in about 0.4s.
   - At the end the cursor blinks for about two seconds and fades; the button fades in as typing ends.
   - The cursor is a block in the text's own ink (slate for the headline, the lighter ink for the line under it), from cap height to the baseline and a little narrower than a letter.
   - The real words stay in the `h1` and `.lead` the whole time. While typing they are transparent and an aria-hidden copy, one span per letter, shows them as they are set; the copy is removed at the end. Letters are hidden by colour, not by width, so the copy wraps exactly as the real words do.
   - Under reduced motion, or without scripts, the words are there at once. The copy waits at most 3s for fonts before showing.
2. **The header is smooth.** No hairline under it and no column rules through it.
   - At the very top of the page it is clear, so the street runs up under the logo and the nav. The nav words keep a soft porcelain halo there so they read over the drawing.
   - Once the page scrolls more than 4px it fills with porcelain (0.35s), and a 28px porcelain fade below it lets the page slide under softly. Snapping back to the top clears it again.
3. **No column rules in the hero.** They cut through the headline at 1440. They start again at "What Tooey does".
4. **A bigger street.** The hero drawing is 106vh tall (up to 1165px) instead of 95vh, still anchored to the pavement, so at 1440×900 it starts about 250px from the left edge instead of 371px and its top runs 63px above the page, under the header. Its left fade is shorter (full by 18% instead of 30%) and its top no longer fades.
5. **A shorter pin.** "What Tooey does" is 250vh instead of 340vh, about 1.5 screens of pinned scroll instead of 2.4. The three resting places and snapping are unchanged.

## Checked
At 1440×900 in Chromium: the hero at rest with the clear header and the bigger street; the header filling on scroll and clearing again after snapping back to the top; the hero part way through the headline, part way through the line under it, and at rest; the header over the independents street and over the line cooks; each of the three pinned steps at its resting place. The copy's letters matched the real words while typing.

Phone views were out of scope this round and were not reviewed.

## Weakness
The headline is blank for about 0.4s before the first key, which reads as a cursor waiting but leaves the hero quiet on a slow load.
The upper windows' heads are cut by the top edge of the page.
