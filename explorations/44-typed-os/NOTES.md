# 44 35, typed

Round fourteen. Rex preferred 35 to 36 through 43, which did too much.
44 is 35 with four small changes; 35 stays as it was for comparison.
Everything not listed here is 35's: see `../35-operating-system/NOTES.md`.

## What changed
1. **The headline types itself out.**
   - On load a block cursor sits where the headline starts and blinks for about half a second.
   - Then the headline types at an uneven hand, in about 1.35s: each key lands at its own pace, now and then two or three come in a quick run, and there is a beat at each space and a longer one at the stop.
   - The cursor drops to the line under it, waits a moment, and types it a little faster, in about 0.95s.
   - At the end the cursor blinks for about two seconds and fades; the button fades in as typing ends.
   - The cursor is a block in the text's own ink (slate for the headline, the lighter ink for the line under it), from cap height to the baseline and a little narrower than a letter.
   - The real words stay in the `h1` and `.lead` the whole time. While typing they are transparent and an aria-hidden copy, one span per letter, shows them as they are set; the copy is removed at the end. Letters are hidden by colour, not by width, so the copy wraps exactly as the real words do.
   - Under reduced motion, or without scripts, the words are there at once. The copy waits at most 3s for fonts before showing.
2. **The header is smooth.** No hairline under it and no column rules through it. A 28px porcelain fade below it lets the page slide under softly.
3. **No column rules in the hero.** They cut through the headline at 1440. They start again at "What Tooey does".
4. **A shorter pin.** "What Tooey does" is 250vh instead of 340vh, about 1.5 screens of pinned scroll instead of 2.4. The three resting places and snapping are unchanged.

## Checked
At 1440×900 in Chromium: the hero part way through the headline, part way through the line under it, and at rest; the header over the independents street and over the line cooks; each of the three pinned steps at its resting place. The copy's letters matched the real words while typing.

Phone views were out of scope this round and were not reviewed.

## Weakness
The headline is blank for about half a second before the first key, which reads as a cursor waiting but leaves the hero quiet on a slow load.
