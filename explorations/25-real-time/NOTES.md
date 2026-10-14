# 25 real time

Concept: one small restaurant, rendered live in the browser and lit like architectural photography. Dawn and daylight come through big windows, the camera sits still as if on a tripod, and steel and tile stay in sharp focus. Every picture on the page is a camera in that same room, and each one shows one thing Tooey does using an object a cook already handles.

Type: Hanken Grotesk (OFL, variable, self-hosted). Headings are weight 500 with tight tracking, and body text is 400. The labels and the clock face inside the renders use the same face.

Colour: the page uses 21's eight tokens and nothing else. Material colour (steel, oak, food, the slate apron canvas) appears only inside the renders.

## How it is built

- `_src/scene/`: the room. The geometry is built in code (lathe plates, extruded food boxes, tube pasta nests, chairs, aprons), and the textures are drawn on canvases (brushed steel, subway tile with grout relief, oak, concrete, parchment, cling film, linen, printed labels). Three.js and esbuild come from npm. `npm run build` bundles everything into `assets/scene.js` (870 KB raw, 270 KB gzipped). The whole published folder is 1.4 MB.
- Light:
  - one shadowing light: the sun at dawn and in the day, an overhead key at night
  - area lights for the window, the storefront and the ceiling fixtures
  - neutral tone mapping
  - reflections captured from inside the room itself, once per lighting, so steel reflects the tile and the window
- One WebGL renderer copies frames into each figure's own canvas. It renders only while a shot is on screen and moving. The hero's tiny drift stops on a device that cannot keep about 10 fps.
- Stills: `_src/stills.mjs` renders the final frame of every shot, in wide and phone framings, from the same scene, and `_src/towebp.py` converts them to WebP (about 410 KB in all). `?still=<shot>&cam=wide|tall&w=&h=&t=` renders any single frame, which is how the frame sequences were made. `?intro=1` forces the hero intro on a slow machine. Those stills are shown in four cases:
  - without JavaScript
  - with reduced motion or Save-Data, where Three.js is never fetched
  - without WebGL
  - while the scene loads
- While the scene loads, the hero shows its own pre-dawn frame. If the hero isn't live 4.5 s after load, it shows the finished still with all its counts. If the scene arrives after about 2 s, the hero starts at its finished frame.

## Animations (each plays once, when the shot is 35% on screen)

| Shot | What happens | Length |
|---|---|---|
| Hero | Dawn comes up through the window over 1.6 s. Printed labels go onto four clear food boxes at 0.75 s, 1.11 s, 1.47 s and 1.83 s: Rigatoni 34, Falafel 30, Caesar 22, Tagliatelle 26. After that the camera drifts a few millimetres, which you can ignore. | 2.1 s |
| Prep | A short push-in on a sheet tray. 24 tagliatelle nests land in a block, two more land set apart, and then the label "Tagliatelle 26" goes on. | 2.4 s |
| Shifts | The wall clock by the back door runs from 3:30 to 7:30. As it does, aprons come off their hooks: 2 by 4:00, 3 by 5:00, 5 by 6:30. One apron stays. | 3.1 s |
| Growth | The dining room in daylight, chairs up on every table. At 9 of the 12 tables, nearest first, the chairs come down and places are laid. | 2.8 s |
| Closer than a guess | Close of service, two trays: "Guess 40" and "Tooey 26". One nest leaves each tray every 0.1 s until 24 have sold. Cling film then goes over the 16 left on the guessed tray. Tooey's tray keeps two. | 3.8 s |

## Home word count

185 words of page text, counted by script, with nav, form, footer and privacy left out. Another 14 words are printed on objects inside the renders: Rigatoni 34, Falafel 30, Caesar 22, Tagliatelle 26 (in the hero and on the prep tray), Guess 40 and Tooey 26. That makes 199 in total.

## Critique passes

- Design director: I removed one accessory, the black pendant shades in the dining room. They cut across the top of the frame and added nothing a daylit room needs. I also dropped the live "24 sold" counter, because the paragraph already says it. Early passes used masking-tape quarts and a half chicken that read as a loaf of bread. Both are gone: the counts are printed labels on clear food boxes, and the dishes are ones whose prep looks like itself.
- Busy owner: on its own, "Example" under the hero did not say what the numbers were, so the caption became "Example: today's counts." "An apron comes off the hook for each cook on" became shorter. The apron changed from white to slate canvas, so it no longer reads as a towel on white tile.

## Weakness

The objects are believable, but the place is a clean render, not a photograph. There is no bounced light, the food is simplified (the pasta nests are a little too regular), and the room has no wear. In this sandbox, the only GPU is software rendering, so I checked live playback by watching frames arrive, not at real frame rates. The hero animates only if the scene is ready within about 2 s; otherwise it shows its finished frame.
