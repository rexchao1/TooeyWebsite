# 23 unfold

One small restaurant over one day, shot with a long lens. The page opens tight
on a masking-taped deli quart at dawn and each section pulls the camera further
out: the shelf, the prep kitchen, the line, the dining room. Then it goes back
to the same quart at close to show the count against a guess.

## Build

- `_src/scene/*.js` is the scene: procedural geometry, canvas-made textures,
  physically based materials, one sun through the back window, a fixed pool of
  lights. `post.js` is the lens: depth of field from the depth buffer
  (golden-angle disc), ACES tone mapping, vignette and fine grain.
- `node _src/build.mjs` bundles it with three 0.180 into `scene.js` (esbuild,
  about 540 KB, about 140 KB gzipped). Install `three` and `esbuild` anywhere
  and point `UNFOLD_NODE_MODULES` at that `node_modules`. None is committed.
- `node _src/posters.cjs` renders each shot's last frame from the real scene
  into `posters/` (wide and tall WebP, about 590 KB for all ten), with the
  folder served on port 5233.
- `python3 _src/make-logo.py` makes the porcelain wordmark from `logo.png`.
- Spectral (OFL) and Permanent Marker (Apache 2.0) are self-hosted in `fonts/`.
  Nothing loads from another host.

## Tokens

Basalt #2f2d2a, basalt deep #242220, basalt lift #383632, porcelain #f2f1ec,
text #dcd9d2, ash #aba69e, slate #232a2f, lamplight #f1d2a0 (21's palette).
Lamplight appears only as light inside the renders and as the focus ring on
form fields. Food, steel, tile, wood and the red grease pencil keep their own
colour inside the pictures.

Type: Spectral 300 for headings, 400 for text, 500 for buttons. Permanent
Marker only inside the scene, for tape and grease pencil.

## Animations

Each plays once. The text never animates. Every shot starts where the last
one ended, so the steps read as one camera pulling out.

| Shot | What happens | Length | Point lands |
|---|---|---|---|
| Hero, on load | Dark to dawn in the window light, braise fills the quart, "26" is written on the tape, then the lens pulls back to the shelf: pork belly 26, polenta 30, chowder 16 | 4.2 s | headline at 0 s, the count at 1.8 s |
| Prep | The camera keeps pulling out to the prep kitchen; slaw 20 and aioli 40 fill on the table | 2.6 s | 2.6 s |
| Line | Out and across to the line at dusk; a clock runs 5 pm to 10 pm, tickets fill the rail and thin out, stations light 2, then 4, then 3 | 4.4 s | about 3 s |
| Room | Back through the pass into the dining room ("Tuesday" on the chalkboard); table lamps come on from 3 to 8 of 10, plates land | 3.6 s | about 3 s |
| Close | Cut back to the pork belly quart at night; a red grease pencil line marks the guess at 34, the black tick marks Tooey's 26, the braise drains to one portion, leaving a ring at 26 | 3.8 s | 3.8 s |

A band plays when 35 % of it is on screen. One reached by a jump (nav link)
cuts straight to its framing and only runs its action. Hidden tabs pause.

With motion, the hero opens on the dark before dawn. If the scene is not
ready in 6 s, the finished still shows instead and the canvas holds that same
frame. Under reduced motion, without JavaScript or without WebGL 2, each shot
is its poster: the finished frame of the real scene.

## Accuracy vs guessing

One object read up close (Example). The pork belly quart at close: a red
grease-pencil line near the rim says "GUESS 34", Tooey's black tick sits at 26
under the tape that says 26, and what is left is one portion and a ring of
braise at the morning's line. The line beside it: "A guess would have made 34
pork belly. Tooey said 26, and 25 sold, so one was left at close."

## Word count

195 visible words on the home page: 178 in the page, step numerals included
(nav, form labels and footer excluded), plus 17 drawn in the scenes (tapes,
grease pencil, chalkboard).

## Critique

- Design director: the lexan boxes on the shelf caught the sun as odd white
  L-shapes and were replaced with stacked hotel pans. The light shaft from the
  window read as a hard triangle and was removed. Removed accessory: the
  button's drop shadow and inset highlight.
- Owner: lit stations did not obviously mean "cooks on". The shifts line now
  says it: as tickets build, another cook comes on; as they thin, one goes home.

## Tried and changed

- The first layout had the shelf against the wall, so the macro had no depth;
  the quarts moved to a shelving unit facing down the kitchen toward the line,
  which gives the long-lens background.
- The window moved from the side wall to the back wall over the prep table,
  and the sun rose from 5 to 22 degrees, so the light lands on the table and
  rakes across the tapes.
- The full-height wall between prep and the room became a half wall, so the
  pull-back never passes through a wall.
- Frame time step capped at 250 ms, not 64 ms, so a slow phone does not
  stretch a 4 s shot past 5 s.

## Weakness

The wide shots (line and room) are honest models but still read as rendered;
the macro shots carry the realism. No people are shown, so the shifts picture
leans on its sentence.
