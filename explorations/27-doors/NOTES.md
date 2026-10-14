# 27 doors

Concept: thresholds. The page walks through one restaurant. Every move from one room to the next is an opening that follows the scroll. Inside each room the drawing stays still until you arrive, then one short thing plays once.

Ground and palette: site 21's colours. Materials are muted oak, brick, steel, oxblood leather and an awning green. Lamplight is used only as light.

Type: Young Serif for display and Red Hat Text for body. Both are OFL, self-hosted, and come with licences in `fonts/`.

There are no libraries. Each room is a sticky pin. `site.js` reads scroll progress and sets transforms. Door leaves are HTML with CSS 3D. The plays are CSS keyframes, started by a `played` class.

## The walk
1. Street (hero). Plays on load: the sconces, window, menu case and door glass come on, about 2 s.
2. Scroll: the front doors swing in, you push through the doorway, and the host stand slides past as a table rises into view. Dining room play: a quiet Tuesday fills with diners as the lamps come up, about 2.9 s.
3. Scroll: the till drawer slides out from under the counter. Counter play: the day's sales print on a tape, then a thread of light runs off overnight, about 3.5 s.
4. Scroll: the steel kitchen door swings away. Kitchen play: the clock runs from 4 to 7, tickets clip onto the rail, and cooks step onto the line ahead of them, about 3.4 s.
5. Scroll: the prep sheet feeds up out of the printer and the strip grows into the sheet on the steel (a match cut). Prep play: counts print, the guesses are struck through, and what sold is pencilled in, about 3.2 s.
6. Getting started and the form, on the plain ground.

Under reduced motion or without JS, each room is a still screen in normal flow, shown in its end state. The thresholds that are only doors (the kitchen door and the printer) are left out.

## Words
198 visible on the home page, counted by script with nav, form and footer left out. That includes 21 words drawn in the scenes.

## Critique pass
I reviewed it as a director who hates "video pasted on a website":
- The layers had a background that hid the room through the doorway, so I removed it.
- The cornice band read as a nav bar, so I cut it.
- Rooms met at ruled edges, so they now meet in shadow.
- The prep transition was a muddy double exposure, so it is now a match cut from strip to sheet.
- The accessory I removed was the two glasses on the counter, which read as bubbles.

## Weakness
The kitchen shows the night through time passing (clock, tickets, cooks). The end-state still shows a full, busy line, so "matched to how busy" is clear only while the play runs.
