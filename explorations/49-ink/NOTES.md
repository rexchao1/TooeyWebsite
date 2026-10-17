# 49 Ink

Round nineteen. Rex on 48: "This does not look drawn at all. That is a real photo."
He wanted an option that looks drawn but real, a background that does more than plain paper, and the "What Tooey does" words overlaid so the scenes can pass under them, polished like Apple's UI.
49 is 48 with the same words, camera and thread. Everything not listed here is 48's: see `../48-thread/NOTES.md`.

## What changed
1. **Drawn scenes.** The three photographs are redrawn as illustrations: ink linework, watercolour and gouache washes, paper texture, warm interior light. Each keeps its photograph's composition, room and people.
   They are in `art/` at full size and 1100px (about 1.9MB for the six).
2. **The board is the restaurant's floor plan.** Under the scenes is one restaurant drawn as an architect would, faintly in ink: the counter and its stools, the dining room tables, the kitchen line, dish, the walk-in and the pass, with dimension lines, a scale bar, a north arrow and warm pools where the lamps hang.
   Each scene is pinned where it happens: the forecast at the counter, prep in the kitchen, the team at the pass.
   The plan sits a little further back than the scenes (it moves and grows at 86% of their rate), so it reads as depth while the camera moves.
   It is `plan.svg`, written by `plan.py`.
3. **Glass over the board.** Pinned, the board runs the full width of the page and the words float over its right side on a frosted panel (blur and saturation behind, a white hairline, a soft shadow). The scenes slide under it.
   The step in view sits on a raised white tile inside the glass; the other two fade.
   The camera frames each scene in the room left of the panel, not in the middle of the page.

4. **The hero carries the console.** Over the street, the console's own window: its sidebar (Forecast, Upload, Email) and the Forecast page, with the day's expected sales, and for each main what will sell and what to have ready. The 6am notification lands in the top left of the page, under the logo.
   The window and the notification come up while the headline types, not after it.
   Two other takes stay in the page for comparison: `?hero=mail` (the morning email in an inbox) and `?hero=sheet` (the printed sheet taped up), and `?hero=note` (no window: the street and the 6am notification alone, in the top right of the page under the menu).
   The hero window and the three cards in What Tooey does carry no Example tag, at Rex's word. The screen reader captions still say the figures are an example.
   The Will sell figures are not in the demo data: each is set a little under its Have ready amount, as prep is defined.

## The pictures
The illustrations were made with Codex's image generation tool (`image_gen`, its model is not disclosed), from these free Unsplash photographs as references (originals in `photos/raw/`):

| File | Reference photograph |
|---|---|
| `forecast` | https://unsplash.com/photos/X_bbCAYzlTs |
| `prep` | https://unsplash.com/photos/y-XZf_TNRms (the blurry wall on the left cropped off) |
| `shifts` | https://unsplash.com/photos/VUd9yv41hh0 |

They are AI-generated, which is a different promise from a photograph or a commissioned drawing.
Hands and faces were checked at full size; none looked wrong.
At Rex's request the man at the counter in `forecast` has tight curly hair; only his head was regenerated and pasted back, so his face and the rest of the drawing are unchanged.
At Rex's request the man in the back on the left of `forecast` is drawn as East Asian; only his head was regenerated and pasted back.
Generated at a smaller size and enlarged to 1800 and 1600px wide, so they are soft up close.
Before anything like this ships, an illustrator drawing from one real restaurant is the better source.

## Checked
At 1440×900 in Chromium: each of the three resting places after its card played; half way from Forecast to Prep and from Prep to Shifts.
The illustrations at full size: hands, faces and the people behind.
Reduced motion at 1440: the whole board over the plan, thread drawn, cards finished.
Phone was not checked, at Rex's word.

## Weakness
AI-generated art, from photographs of three different places.
The floor plan is invented: it is one restaurant's plan, not Tooey's, and the dimensions are a drawing's, not a measurement.
The panel and the plan make the section heavier to paint than 48's.
