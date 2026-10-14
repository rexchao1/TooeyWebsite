# 26 walk-in

Concept: you walk into one casual restaurant at dusk. The restaurant is drawn as flat, lit planes (like stage flats), each at its own depth. Scrolling moves a camera forward. Planes grow as you near them and pass to the sides, and each wall splits at its doorway and parts around you. No frames: the drawing covers the page, and the street at the top and the kitchen floor at the bottom blend into the basalt ground.

Type: Epilogue (OFL, self-hosted variable font). Headings are 600 weight with tight tracking; body text is 400.

Palette: site 21's palette. Lamplight is used only for light (lamps, glows, heat lamps). Material colours (brick, oak, steel, leather, awning green) stay muted.

No libraries. `site.js` does the camera math and the play-once triggers. CSS plays the small details.

## Files
- `_src/build.py` draws every plane and writes `index.html` from `_src/page.tpl.html`. Edit the drawings there and run `python3 _src/build.py`. Do not hand-edit `index.html`.
- `site.js` holds the camera keys (`STOPS`, `KZ`, `KX`, `KY`). Keep `STOPS` in sync with `_src/build.py`.

## The walk (about 5 screens of scroll, then the pilot and the form)
1. Outside at dusk (hero). On load, the street lamp warms up, the three sign lamps flicker on, the windows warm one after another, and light spills onto the pavement. This takes about 2.5 seconds. Scrolling walks you across the street. The double doors swing open, and the facade splits and parts.
2. Dining room. On arrival, lamps come on at the empty tables and diners appear: a quiet night filling up. Moving through the room is scroll-scrubbed: tables, pendants and the banquette pass at their own depths.
3. Behind the counter, at the POS. The camera steps to the server station. On arrival, the printer feeds out the day's sales in steps, its light blinks, and a key on the screen lights up.
4. Swing door. It swings open as you reach it (scrubbed), and the dining wall parts.
5. Kitchen. On arrival, the heat lamps warm, tickets slide onto the rail, and a third and then a fourth cook step onto the line.
6. Prep sheet. The camera walks up to the clipboard on the back wall. On arrival, the prep counts count up, the old pencil guesses are struck through, and what sold is pencilled in beside them. The sheet is labelled Example.

Under reduced motion or without JavaScript, each room is a still in normal flow, showing its end state.

## Home word count
199 words, counted by script. Nav, form labels and footer are left out. Words drawn on the prep sheet are included.

## Critique pass (design director who hates "video on a website")
- Rooms seen through doorways showed hard box edges because the wall halves were clipped to their box. Fixed with negative clip insets, so a far room always runs past the screen edges.
- The dining room showed above the neighbour's roof in the hero. The sky now sits on the facade plane, so the facade acts as one curtain.
- The street reflections were hard rectangles. They are now soft pools of light. The near pavement now fills the empty lower third.
- The kitchen's foreground table was a floating black slab. It is now a steel table on legs. The cooks' heads were hidden by the ticket rail, so the heat-lamp shelf moved up.
- One accessory removed: the third sconce on the left wall, which sat behind the heading.
- The step numerals were lamplight. They are now porcelain, since lamplight is only for light.

## Weakness
At the prep-sheet stop, the kitchen tile is magnified about 7.5 times and reads more like a grey brick wall than tile. The cooks are simple pin shapes. The kitchen is the least lit and least crafted room compared with the street and the dining room.
