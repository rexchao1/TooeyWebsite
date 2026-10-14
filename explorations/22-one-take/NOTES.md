# 22, one take

Concept: one continuous camera move through one bistro over one day. Each
section of the page plays one short beat of that take, and the camera travels
from where the last beat ended, often through the pass. People appear the way
a long exposure records them. Anyone who holds still stays sharp, and anyone
working or walking streaks.

## Build
- Three.js 0.180, bundled by esbuild from `_src/` into `take.js` (575 KB, about
  140 KB gzipped). There are no runtime requests.
- The geometry is built by hand. Every texture is painted in canvas at runtime:
  oak planks, quarry tile, subway tile, limewash, walnut, brushed steel, beef,
  thermal paper and a register screen.
- Light comes from practical sources: tungsten pendants, the street light at
  night, a raking morning sun with a real shadow, hood lights and heat lamps.
  Pools of light and contact shadows are cheap decals.
- The film grade is one pass over a half-float target. It applies a lens blur
  from depth (shallow focus), ACES tone mapping, a split tone (slate shadows,
  tungsten highlights), lifted blacks, grain and a vignette.
- People are painted in canvas by body part. Each part is laid down many times
  along its own motion, with the arm turning about the shoulder. Walkers get a
  trail with the person at the front. Cooks have no faces from behind, and
  diners' faces are in shadow.
- People are painted in small slices after the hero starts, so they don't
  block first paint.
- `_src/stills.cjs` renders each beat's last frame from the live scene to
  `stills/` as webp, wide and phone. The stills are used in five places:
  - as the page without JS;
  - under reduced motion;
  - when WebGL is missing;
  - as posters while the take loads;
  - in frames that are not playing.
- Rebuild: `cd _src && npm install && node build.mjs main.js ../take.js && node stills.cjs`.
  The stills step needs the site served on port 5232.

## Beats
| Section | Beat | Length | Point clear at |
|---|---|---|---|
| Hero | Monday night: a dolly in on the bar printer while it prints the day's sales | 3.1 s | 2.6 s |
| Prep | Through the pass to the kitchen at 6 am: the kitchen printer prints the prep counts and 26 steaks land on the sheet tray | 4.3 s | 4.2 s |
| Shifts | A turn to the line. The clock runs from 4:30 to 7. Three cooks walk in, each just before a run of tickets | 4.0 s | 3.0 s |
| Growth | Back out to the dining room at 8 pm: guests stream in through the door and sit, and the room fills | 4.3 s | 3.5 s |
| Closer than a guess | A turn to the pass at 5:30 pm, played twice. On the guessed rota, four cooks stand still and sharp. The film winds back, and on Tooey's rota two cooks are blurred with work. A toggle flips between the two | 3.9 s | 3.3 s |

The whole take is about 20 s, spread over five sections. Nothing is pinned.

## Words
197 words on the home page, counted by script with nav, form labels and
footer left out. That is 181 in the page itself plus 16 printed in the scene
(the receipt and the prep chit).

## Critique
- Design director: I removed the hairline rules over the setup steps. The
  numbers already show the order, so the rules were the one accessory taken
  off. I also dropped the lens colour fringing once depth of field was added,
  because doing both was too much.
- Busy owner: the prep frame first showed the printer from 2.5 m away, too far
  to read the counts. The camera now sits at the printer's shoulder. The
  idle-versus-busy point needed all four guessed cooks in view, so I spread
  them out through the pass.

## Weakness
The people are the weak point up close. Blurred and at a distance they read
as people. Sharp and facing the camera (the guessed rota, the seated diners),
they look like painted mannequins.
