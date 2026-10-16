# 42 one day at the restaurant, on scroll

Site 40 revised to the founder's notes on it. Everything outside the hero is 40's: the header, all the wording, the sections below, the dialog and the other drawings. The VHS headline is 39's code (the intro, the after-glitches and the aria handling), with its colours turned for type that now sits on the scene.

Changed:
- `hero.js`: rewritten. It draws on a canvas, not SVG.
- `styles.css`: the hero block and the phone hero block.
- `index.html`: the hero's insides are wrapped in a `.hero-pin`.
- `site.js`: a few lines in the snapping, so it knows where the day starts and ends.

No words changed.

## What the founder asked for, and what 42 does
- **No column lines in the hero.** The hero's `.sheet::before` rules are off. Every section below keeps them. The fixed header keeps its own rules, as on every page.
- **A scroll animation.** The hero is the pin height plus 190vh tall (135svh on a phone). Its inner block sticks while the visitor scrolls through the day, then lets go into "What Tooey does". Progress is the hero's scroll over that travel, from 0 to 1. Scrolling back runs the day backwards. Nothing in the day runs on a clock. Only idle things run on time:
  - steam, the burner and the flare's flicker;
  - candle flicker and the pendants' sway;
  - a slight breath of the camera;
  - people breathing, shifting and turning their heads.
- **Smooth mapping.** What is shown eases toward the scroll position with a 0.11 s time constant, frame-rate independent. Wheel steps and trackpad flicks both come out fluid. A stop catches up within about a third of a second.
- **Fast.** The whole day is 1.9 viewport heights of scroll on a desktop, about 17 wheel notches at 1440×900. On a phone it is 1.35 screens.
- **Smoother.** The camera runs on one spline through 12 knots, so it never stops between the first frame and the last. Beats overlap:
  - the fridge door opens while the camera is still coming in;
  - the steak leaves the tray as the camera starts its pan to the range;
  - the plate leaves the range while the camera is already pulling back.
- **Morphs, not flights.** See the beats below:
  - receipt to prep sheet;
  - raw steak to seared steak in the pan;
  - pan to plate, with the steak sliced and the greens and sauce growing on.
- **Food that looks like food, unlabelled.** The fridge has no tubs, no tape, no names and no counts. There are:
  - six clear deli containers of sauces on the top shelf (tomato, salsa verde, aioli, romesco, jus, butter), with flecks and a meniscus;
  - a sheet tray of six ribeyes on parchment on the middle shelf, each with a fat cap, a seam of fat and marbling;
  - a deep tub heaped with pointed, veined leaves, and a tray of four salmon portions with their white lines, on the bottom shelf;
  - bottles on the door's shelves.

  Everything is drawn in 3D, so it turns with the camera. Nothing in the fridge has text.
- **People.** I chose to keep people and redraw them, with the room's other signs of life as well. The reason and the limits are under "The people".

## Also fixed from 40
- **Night is dark.** 40 put a grey wash over the drawing. 42 lights each surface instead: its colour times the light that reaches it. That is the room's ambient light plus every lamp by distance, in that lamp's own room. Pools of lamplight are then added on top (additive).
  - Night ambient is about 10% with a cool cast. Basalt dark, lit by one pendant (over the table by the pass) and the till's screen. The receipt carries a faint glow of its own so it reads.
  - Morning is about 88% neutral. Crisp, with a soft shaft through the kitchen window.
  - Service is about 18% warm in the dining room. Five pendants make pools on tables and floor, with candles on the tables. The kitchen is brighter (heat lamps, strip light), so the pass glows.
  - Light past paper white rolls off instead of clipping. Ink lines turn from slate to ash on dark surfaces, as on the basalt footer, so the drawing still reads at night.
- **No fog over the words.** 40's porcelain scrim is gone. On a desktop the headline and the line under it are porcelain over the scene, with a soft text shadow. A tight radial shade sits right behind the copy block only. It is a CSS layer whose opacity follows the light: about 0.32 at night, 0.56 in the bright morning and 0.42 in service. The scene fills the frame edge to edge. The tape effect's warm and cool channels use `screen` instead of `multiply`, so they glow on the dark instead of vanishing. The intro's noise and scanlines are lightened to match.
- **Frame rate.** The canvas redraws only while the hero is on screen. Glows and pools are blitted from small cached radial sprites. Figures batch their strokes, and arms and the torso avoid clipping. The vignette and the text shade are CSS layers.

## The beats, by progress (p; s = 10p in the code)
- **0–0.05, night at the till.** The camera is wide in the dining room, by the host stand (x 0.1, z −3.75, yaw 0.14), and starts moving at once. The till's screen glows over a bar chart of the night. The receipt is 38% out of the printer at p 0 and fully printed by 0.045. Chairs are up on the tables, and one pendant is on.
- **0.036–0.055.** The receipt tears off with a small hop.
- **0.05–0.285, the receipt travels.** Its path is a spline: up off the till, back over the room at head height, through the pass, to the fridge's left side. The camera dollies after it (z −3.75 → −1.0 at 0.14 → 2.65 at 0.245 → 3.95 at 0.315), turning right toward the fridge as it comes through the pass.
- **0.08–0.20, the receipt morphs into a prep sheet**, as one drawing interpolated:
  - the paper widens from 15×32 to 21×27, and its torn top straightens;
  - thermal white warms to cream;
  - the logo bar fades into the title rule as "Example" writes in;
  - the dashed rule closes to a solid one;
  - each line item lengthens into a row, and a checkbox grows out of its start;
  - each price shrinks away as its count writes in (24, 18, 31, 12, 16, 9);
  - the total disappears.
- **0.09–0.27.** Night turns to morning.
- **0.145–0.225.** The chef comes in at the range, a morning's time-lapse.
- **0.245–0.285.** The sheet lands flat on the fridge's side: the billboard transform interpolates to the plane of that side. A magnet clips it on.
- **0.265–0.345, the door opens** while the camera is still arriving. The inside lights cool white and spills on the floor. The food appears.
- **0.33–0.425.** The six boxes on the sheet are ticked in turn.
- **0.335–0.49, the steak goes to the pan.** The front middle ribeye lifts off the tray and arcs low across the kitchen to the pan, darkening a little on the way. From 0.375 the camera pans left (yaw 0.42 → −0.24) and comes in over the range (z 4.55).
- **0.37–0.44.** The dining room's chairs come down and the guests arrive, while it is behind the camera.
- **0.425–0.495.** The fridge door closes.
- **0.43–0.60.** Morning turns to lamplight.
- **0.49–0.57, the steak sears in the pan.** Colour and shape interpolate from raw red to a mottled brown crust with glossy highlights. A flare at 0.495–0.555 (a smaller one at 0.535–0.585) with a burner ring, two tosses, steam.
- **0.555–0.62, the pan becomes a plate.** One vessel interpolates:
  - radius 13 → 15 cm, walls 4.5 → 1.6 cm;
  - steel to porcelain, outside and in;
  - the handle retracts into the rim;
  - the pan's floor becomes the plate's well.

  At 0.575–0.625 the steak splits into three slices that fan apart, showing pink cut faces. Jus spreads under them, five leaves grow on one by one, and a stroke of sauce draws on.
- **0.565–0.665, the camera pulls back.** It moves out over the range and back toward the pass (z 2.95 at 0.64).
- **0.605–0.675.** The plate lifts off the range and lands on the pass under the heat lamps, which flare at 0.65–0.76.
- **0.73–0.875, the plate goes out.** It is carried low across the room to the table front right, with a slight walking bob, and set in front of the woman waiting there. The camera keeps pulling back through the full room (z 1.35 at 0.715, −1.5 at 0.845).
- **0.875–1, the room.** The camera settles wide and a little to the left (x −0.6, z −3.3, yaw 0.1), so the full room sits right of the words. Ending velocity is zero.

## How pin and snap work together
- **No snapping inside the day.** In the day's range, from where the pin starts to where it ends, scroll is the scrubber. Wherever the visitor stops, the day holds and eases to that frame. Every frame is designed to be a frame.
- **Resting places.** The day's start and end are resting places in the existing snap system, alongside each section top.
- **The release** (from the end of the day to the next section's top, under the header) snaps by direction:
  - going down and more than 15% into it: on to "What Tooey does";
  - going back up and more than 15% back: to the end of the day;
  - otherwise: the nearer of the two.

  This is also allowed past 40's 0.75-screen limit, so the hero never rests half scrolled away.
- **Tested with the wheel at 1440×900:**
  - stopped mid-day at p 0.526, it stayed;
  - 80 px past the end, it eased back to the end;
  - 250 px past the end, it went on to the next section;
  - 250 px back from that, it returned to the end of the day;
  - 50 px back into the day, it stayed (p 0.971);
  - 30 px from the top, it stayed (p 0.018).
- **No fights.** Any wheel, touch or key input cancels an ease at once, as in 40.

## The people
The guests and the chef are jointed 3D figures. Each joint is a world point projected by the same camera, so a figure turns, foreshortens and scales with the camera. None is a flat card.
- **Bodies:**
  - three builds (a man, a woman, the chef);
  - torso rings whose screen outline is computed each frame, with a sloped trapezius into a rounded shoulder;
  - two-bone arms solved to a hand target, drawn as tapered forms;
  - the shoulders twist a little on the hips; the head turns and nods on the neck.
- **Heads:** the head is an ellipsoid with a jaw, and ears only where they face the camera. Hair comes in short, long (falling over the nape onto the shoulders, with strands), a bun, or short with a nape hairline (the chef).
- **Clothes:** collars, the spine's groove, shoulder-blade and waist folds, a fold inside the elbow, and the chef's crossed apron straps, tie, bow and rolled sleeves.
- **Light:** each face of a figure takes the lamps by how much it turns to them. Each guest sits facing their own table's lamp. We see backs in soft shadow, with warm light along the shoulders, the crown and the arms, from the lamp beyond.
- **Faces:** none. Everyone is seen from behind or three-quarter behind.
- **Poses:** a couple turned to each other, one talking with a hand up, one with a glass raised, a man leaning on his forearms, two friends, and one woman waiting for the plate that arrives.
- **Signs of life too:** a plate and a glass of red at every place, some with food on them, a candle in a glass on each table, coats over chairs, and empty chairs pulled out.

Why people and not only signs of life: at the scale they appear, about 120–260 px tall at 1440, backlit seated figures read as diners. They make the end of the day what it is about, a full room. Seen whole they are believable: proportions, poses and the light are right. Seen close they are stylised illustrations, not realistic portraits. The weakness below says how.

## Reduced motion
There is no pin, no scroll animation, no glitch and no idle motion. The hero is one screen. One designed still: the camera stands just inside the room, in service light. The full room is lit, the chef works at the range through the pass, and the plate sits under the heat lamps.

## Phone (390×844)
The scene takes the top of the pinned screen (the screen less the header and 21.5rem). The words sit below it on porcelain, in slate as before. The pin is shorter: 1.35 screens of scroll. The camera and the beats are the same, with a closer lens centred on the frame. There is no horizontal scroll on the home page or the privacy page.

## Review handles
- `?p=<0..1>` holds the day at that progress. Add `&live` to keep the idle motion running.
- `?freeze=<s>` holds the headline's tape at that second.
- `window.TooeyHero.range()` gives the day's scroll range in page pixels; `progress()` gives the target and the shown progress.

## Checked (42)
All checks ran in Chromium (Playwright), served on 127.0.0.1:5252.
- **1440×900, held:** p = 0, 0.1, 0.2 … 1.0. Also 0.03–0.14 (the receipt and the morph), 0.27–0.33 (the door), 0.40–0.66 (the steak, the sear, the plate) and 0.66–0.90 (the pull-back). At 2× I looked closely at the guests, the chef and the food.
- **1440×900, live wheel:**
  - nine notches stopped mid-day: the pin held, and what is shown caught up within 0.9 s;
  - nine more: the end of the day;
  - on through the release to the next section;
  - back up 16 notches: the day ran backwards;
  - back to the top.
  - Each snap case is listed under "How pin and snap work together".
- **1280×800:** held at 0, 0.2, 0.33, 0.5, 0.7 and 1, and the same live wheel run.
- **390×844:** held at 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.55, 0.7, 0.85 and 1, and the same live wheel run. No horizontal scroll on the home page or the privacy page.
- **The headline:** held at 0.3, 0.8 and 1.5 s. Live at load: intro, settle, button. The real words stay in `.vhs-real`, and the copies are `aria-hidden`.
- **Reduced motion:** at 1440 and 390, no pin (the hero is one screen tall) and the still.
- **The sections below:** "What Tooey does" pinned at Forecast, the independents, How to start and the close are as in 40.
- **No console errors or warnings** in any run.
- **Frame rate, headless Chromium at 1440×900** (software raster, so a laptop GPU should do better), measured live at held points:

| p | frames per second |
|---|---|
| 0 | 60 |
| 0.3 | 55 |
| 0.55 | 59 |
| 0.7 | 60 |
| 0.85 | 52 |
| 1 | 58 |

  Over a whole wheel run: 53–58 on a desktop and 59 on a phone. Scripting costs 1.5–4 ms a frame.

## Weakness (42)
The people. They turn, scale and sit right, and as a lamplit room they read as diners. But they are built from rounded forms (tapered capsule limbs, ellipsoid heads, a computed torso outline). Up close, a near guest's arms are tubes, hands are simple, and hair is one shape with a few strands. They are a good illustration's figures, not the realistic people the founder asked for. If that bar is firm, the next step is to take out the guests nearest the camera and leave their coats, glasses and plates. Second: the busiest moment, the pull-back through the full room at about p 0.85, drops to about 52 frames a second in headless Chromium.

---

# 40 one day at the restaurant

Site 39 with a new hero. Everything outside the hero (header, wording, sections, dialog, snapping, the other drawings) is 39's as it stands. The VHS headline (intro, after-glitches, aria handling) is 39's code, unchanged. Changed: `hero.js` (rewritten), the hero block and the phone hero block in `styles.css`, and one `<div class="pass-scrim">` added to the hero's `<figure>` in `index.html`.

The idea: Tooey works ahead of service. Last night's sales become this morning's plan. The loop is one day, so the receipt reads as "your sales become your plan".

## The set and the camera
- The room from 39 (dining room, the pass, the kitchen) is now a real 3D set, built in metres. Every wall, table, tub and lamp is re-projected through a moving camera on every frame, with near-plane clipping. The planes slide past each other by depth as the camera moves: that is the parallax. Nothing is a flat layer.
- Small things are cards drawn once in centimetres and placed by the same camera: the chef, the guests, tub labels, the receipt, the short rib and the dish.
- The dining room is new. It has an oak floor with boards running to the vanishing point, a beamed ceiling with a long skylight, and four bistro tables with two chairs each and a pendant over each. A host stand with the till (a screen and a receipt printer) is on the right, nearest us. The kitchen is 39's, plus a window on the back wall and a bigger fridge.
- The vocabulary is 39's: porcelain ground, fine slate line (weight falls off with depth), lamplight warmth, tonal shading, a porcelain haze over the kitchen that thins as the camera comes near, and no faces (the chef is seen from behind, guests are plain head-and-shoulder forms).
- The hero is full-bleed. The scene fills the hero under the header, edge to edge, at every width. The SVG's viewBox is the figure's own pixel size, so lines stay one pixel weight at any size. The principal point sits at 62% across, so the subject is right of the words.

## The light
There are three tonal washes on the palette: basalt night, porcelain morning and lamplight service. Their weights always sum to one. Each wash pulls the drawing toward a colour by an amount. The kitchen and the dining room are washed separately (the dining wash has a hole cut for the pass). Furniture and guests are lit by colour (CSS variables) so they sit right against either room.
- **Night:** a cool basalt wash, a dark vignette, and the skylight and window glass in deep slate. One pendant stays on (over the table by the pass). The till's screen glows.
- **Morning:** almost no wash. The skylight and window go pale porcelain, soft shafts of morning light fall through them, and the fridge's inside is cool white.
- **Service:** a light umber wash. All four pendants are on, with pools on the tables. The heat lamps are on over the pass, and the window and skylight turn a dusk grey.
- No blend modes and no filters. Each one cost a compositing layer per frame. The scene and the scrim are on their own compositor layers (`will-change`), so the scrim is never re-rasterised. That took the loop from about 16 to about 60 frames a second in headless Chromium.

## The words over the scene
- The headline, the line under it and the button sit over the scene on the left, in `.pass-scrim`. That is a soft wash of porcelain light: a wide radial ellipse around the text block plus a gentle ramp from the left edge. It has no box and no edge.
- The scrim is strong enough to keep the headline on near-porcelain at night.
- The scene's bottom melts into the next section. Its top melts into the header rule.

## The loop (13 s, a pure function of t, so it has no seam)
The camera moves are eased in and out (smoothstep), and the holds creep, so the camera is never still and never jolts. Peak speed is 2.6 m/s, at 10.3 s. At the wrap the camera's position matches to 1e-7 m.
- **0.0–2.0, close (night).** The camera is at its widest, from the dining-room side (z −3.0, creeping forward). The room is dark and empty, chairs are up on the tables, one lamp is on, and the till's screen glows. 0.35–1.7: the till prints the night's sales receipt (it grows out of the printer). 1.9–2.2: it tears off with a small hop.
- **2.0–5.4, overnight.** The camera dollies in about 5 m, rising 0.2 m mid-move and panning right 0.1 rad, in through the pass. 2.2–5.45: the receipt lifts off the till and drifts up and back through the pass to the fridge, with the camera following it. 2.4–4.8: night turns to morning. The glass goes from basalt to pale porcelain, and the morning shafts come up.
- **5.4–7.1, morning.** The camera holds on the fridge, creeping in. 5.05–5.75: the door's seam glows. 5.4–6.1: the door swings open. 5.55–6.3: the receipt slides into the fridge and fades. 5.75–6.6: "Example" and the four counts appear on tape on the tubs: Short rib 27, Risotto 33, Burrata 19, Focaccia 12. At 1440 the names are about 16 px and the counts about 30 px.
- **7.0–8.6.** Morning turns to lamplight.
- **7.05–8.45.** A piece of short rib lifts out of its tub and flies across the kitchen to the pan. 7.1–8.4: the camera pans left to the chef. 7.95–8.7: the fridge door closes.
- **8.3–9.5, service.** The chef tosses the pan twice: a flare at 8.3 and a smaller one at 8.9, then steam.
- **8.85–9.6.** The dish rises off the pan and lands on the pass under the middle heat lamp. 9.4–10.4: the lamps brighten on it.
- **8.75–11.8.** The camera pulls back out through the pass to the wide view (about 5 m, rising 0.16 m mid-move). The room is now full and warm: guests at all four tables and every pendant on. 9.95–11.0: the dish is carried out to the table in the middle of the room.
- **11.0–12.6, close again.** Lamplight dims to night. 11.3–12.2: the guests leave. 11.45–12.05: the dish fades. 11.95–12.55: the chairs go back up. The pendants go out except one.
- **11.8–13 (to 2.0).** The camera holds wide, creeping forward 0.4 m. At 13 s it is 0 s.
- `?freeze=<seconds>` holds any moment, and the headline under 1.5 s, as in 39.

## Reduced motion
There is no loop, no camera move and no glitch. One designed still: the camera stands in the dining room just short of the pass, in lamplight. The chef is at the range with the pan's flare. The dish sits on the pass under the three heat lamps. The fridge is open on its counts, marked "Example".

## Phone (390)
The scene is cropped to the room (principal point at 36% across, so the till and the pass both fit). It sits above the words in the top 58% of the screen and fades out under the headline. The loop and the camera run as on the desktop. There is no horizontal scroll.

## Checked (40)
All checks ran in Chromium (Playwright), served on 127.0.0.1:5250.
- **1440×900, frozen:** a frame every second from 0 to 13 s, plus 12.5 and 12.95.
- **The seam, pixel-diffed:** 12.999 s against 13 s (= 0 s). Only 401 of 1.18 M pixels move by more than 4 levels, which is one millisecond of the camera's creep. 12.99 s against 13 s moves about 5,500, as ten milliseconds should.
- **1440×900, headline:** captured at 0.3, 0.8 and 1.5 s.
- **1440×900, live:** a frame every second for 8 s. Frame rate holds 58 to 60 per second over three windows of the loop (the push in, the pull back, the close). JavaScript takes about 1 ms a frame.
- **The camera path,** extracted and sampled every 2 ms: continuous in position and velocity, and seamless at the wrap.
- **1280×800:** frozen at 1, 5, 7, 9 and 11 s, plus live.
- **390×844:** frozen at 1, 5, 7, 9 and 11 s, plus live. No horizontal scroll.
- **Privacy page at 390:** no horizontal scroll.
- **Reduced motion:** the still, at 1440 and 390.
- **The section below the hero:** unchanged.
- No console errors or warnings.

## Weakness (40)
The left 40% of the hero is mostly the porcelain scrim. At night that reads as a pale fog bank against a dark room, so the scene takes over the screen in its frame but not quite in feeling. The washes are plain alpha, not multiply, for the frame rate. Night is a cool grey-basalt rather than deep, and service is a warm umber haze with lamp pools rather than true pools of lamplight in shadow. The guests are flat cards, so they don't turn with the camera. At about 10 s on the pull-back, a near guest's head passes large at the bottom edge.

---

# 39 the string, in depth

Site 35 with a new hero. Everything below the hero (wording, sections, dialog, header, snapping, the other drawings) is 35's as it stands. New: `hero.js`; a hero block and a phone block in `styles.css`; the hero's `<figure>` in `index.html` (now `.pass-scene`, not a `data-scene`, so `site.js` neither draws it nor puts the cursor lamp on it). 35's street drawing is still in `scenes.js` but no longer used.

## The view
One-point perspective, standing in the dining room and looking through the pass into the kitchen. Everything is placed in metres in front of a camera and projected (`pr` in `hero.js`), so every receding line runs to one vanishing point. It is built as three planes:
- **Counter (near).** Warm oak, its grain running to the vanishing point. On it, a POS tablet facing us and a ticket printer. Darkest tones, heaviest line.
- **The pass (middle).** The dining-room wall with the opening cut in it; the jambs and soffit in shade; a steel shelf; a ticket rail with a few tickets; three heat lamps with warm cones and pools on the shelf.
- **Kitchen (far).** Tiled back wall, ceiling strip light, a hood with a warm light under it, the range with a stock pot, the chef at the range on the left (seen from behind: toque, hair, jacket, apron bow; no face), an open shelf, and a reach-in fridge on the right. Lighter tones, thinner and fainter line, and a porcelain haze over the whole plane.
- Soft shadows under the POS, printer, plate, fridge and chef. The camera breathes: each plane drifts on a slow ellipse by an amount that falls off with depth (about 7 px near, 3 px at the pass, 2 px in the kitchen), once per loop. No mouse interaction; no cursor lamp in the hero.

## The string
One amber thread, POS → fridge → chef → pass → POS. Each leg is a ribbon that thins with depth (width ∝ 1/z). The thread is cut where it passes the heat lamps: the kitchen part sits behind the pass, so the lamps and shelf hide it as they should. A pulse with a short tail runs along it; legs it has just run glow brighter and fade; each node flashes on arrival. The loop never crosses itself.

## The loop (10 s, a pure function of t, so it has no seam)
- 0.0 s: the pulse reaches the POS. Its screen lights (an order going in: lines, no numbers) and warms the counter. 0.25–1.2 s: a ticket prints.
- 1.35–3.05 s: the ticket lifts away as the pulse runs back into the kitchen to the fridge.
- 2.8 s: the fridge door's seam glows. 3.1–3.85 s: the door swings open, the inside lights cool white, and four tubs show their counts on tape: Short rib 27, Risotto 33, Burrata 19, Focaccia 12, marked "Example". The door closes 5.5–6.35 s.
- 4.4–5.5 s: the pulse runs across the back to the chef.
- 5.5–6.9 s: the chef tosses the pan twice; a warm flare at 5.75 s and a smaller one at 6.4 s; steam rises off the pan.
- 6.4–7.4 s: the pulse runs forward to the pass as a plate slides onto the shelf under the middle lamp (6.7–7.45 s). The heat lamps brighten 7.1–9.2 s.
- 8.5–9.3 s: the plate is taken (slides off right).
- 8.95–10 s: the pulse runs forward to the POS, and it begins again.
- `?freeze=<seconds>` holds the scene (and the headline, under 1.5 s) at that moment, for review.

## The headline: a tape locking in
"Your new restaurant operating system." and the line under it come on as a VHS tape: the real words stay in the HTML (`.vhs-real`, read by screen readers, transparent only while the effect runs), with aria-hidden copies over them: a warm (lamplight amber) and a cool (slate-teal) channel split sideways, and the ink cut into horizontal bands (7 for the headline, 4 for the line under it) that jump sideways in held steps of 50 ms.
- 0–0.1 s: static only. 0.1–0.6 s: heavy: a channel split of up to 15 px, bands jumping up to 35 px, the block rolling vertically, and a tracking bar sweeping down twice. 0.6–1.1 s: settling. 1.1–1.43 s: a fine fringe and one last 3 px snap. 1.5 s: clean, and the button fades in from 1.2 s.
- The static is sparse and its layer is masked to fade toward every side, so there is no box. Scanlines fade out by 1.3 s.
- After: every 7 to 10 s, one small glitch on the headline (a 3 px split, or one band jumping 7 px), 160 ms or less; sometimes the line under it splits slightly too.
- The words wait for the fonts (and show anyway after 3 s if the script never runs). Under reduced motion there is no glitch and no loop: the scene is a designed still frame with the string lit and all three things on (POS lit with its ticket, fridge open with the counts, chef's flare and steam, a plate under the lamps).

## Fade into the page
35's cleared patch behind the words is gone. The drawing is masked with a long ramp from the left (almost clear to 18%, full by 53% of its width), soft top and bottom fades, and a wide radial clearing around the words at the bottom left, so the headline sits on plain porcelain and the scene comes in to the right. On a phone the drawing is cropped to the pass and sits above the words.

## Checked (39)
Chromium (Playwright) at 1440×900:
- frozen frames across the loop (0, 0.6, 1, 2, 2.5, 3, 3.5, 4, 5, 5.8, 6, 6.4, 7, 7.6, 8, 9, 9.5 s);
- a live run, a frame every second for 12 s, where 10 s matches 0 s;
- the headline at 0.1, 0.3, 0.6, 1.0, 1.5 and 2 s;
- the after-glitches over 22 s live: two, 8.3 s apart, 167 ms each;
- about 61 frames a second while it loops;
- reduced motion: the still;
- the pinned section below, unchanged.
At 390×844: the hero (frozen and live) and the privacy page, with no horizontal scroll. No console errors.

## Weakness (39)
The tub labels are small: the counts read, but the dish names on the tape are about 7 px on a laptop and are texture more than words. The tablet and the printer are the darkest, heaviest things in the frame, which is right for depth but pulls the eye to the lower right before the thread does.

---

# 35 the operating system

Site 34 (the lit room), revised to the founder's notes in three passes. 34 stays as it was for comparison. The look is unchanged: porcelain ground, slate line drawings, lamplight washes, the cursor lamp, Literata / Source Serif 4 / Schibsted Grotesk, and the hairline four-column grid. `draw.js` is 34's. In `scenes.js`, the street, prep, line and dining drawings are 34's. 34's "same Friday at close" drawing is gone, and a new street of independents (`indies`) takes its place.

## The page, top to bottom
1. **Header.** Fixed at the top at every scroll position, on porcelain with a hairline bottom rule. The column rules carry on through it. It holds "What it does", "Pilot" and the "Try Tooey free" button.
2. **Hero.** "Your new restaurant operating system." Under it: "Tooey runs prep, shifts and slow nights from your own sales, so you make more and manage less." A "Try Tooey free" button follows. The street drawing and its load animation are 34's.
3. **What Tooey does** (`.work`, `#what`). One pinned section. The drawing sits on the left, bleeding off the page edge. On the right is the section's heading, "What Tooey does" (Literata, section-heading size), with its lead line "Every day, from your own sales, Tooey works out three things for you." Under the heading, the three items Prep, Shifts and Growth are stacked as a list.
   - The heading stays visible through the whole pin.
   - The active item is full ink, the other two sit at 30%, and a slate hairline draws along the top of the active one.
   - The drawings cross-fade (0.75s), and each scene replays its own animation when it becomes active: counts pencilled onto the prep sheet; a ticket prints and a third cook steps on; the pendants come on and a guest sits.
   - Clicking an item jumps to it.
   - Pinned only with motion on a screen at least 761×560. Otherwise the heading comes first, then each drawing beside its words, finished.
   - Each step has a resting place: Prep where the pin begins, Shifts half way, Growth where the pin ends. A step is active for the band around its resting place, so snapping never changes which step is showing. The section is 340vh tall, which leaves about 2.4 screens of pinned scroll.
4. **Built for independent restaurants** (`.indie`, `#who`). This replaces "Closer than a guess". It is laid out differently from the pinned section: the words sit above and the street runs the full width below.
   - The heading and a short paragraph (chains have planning teams, an independent has the owner, Tooey does that planning) take columns 1–2.
   - Two points take columns 3 and 4: "One location or a few" and "Your own sales, nobody else's".
   - The drawing is four independent shopfronts side by side: a brick trattoria with arched windows, a striped awning and a blade sign with a glass on it; a board-fronted café with a cup on its fascia, globe lamps and a guest at a pavement table; a stone bistro with shutters, paned doors and café curtains, with a cloche on its fascia; and a plastered taqueria with a curved parapet, a painted sun, papel picado, string lights, a walk-up window with tiles under the counter, and a cactus. None has a real name.
   - Each shop's washes carry their own threshold (`--s`) on a short ramp (`.w.shop`), so as the street scrolls in the lamps come on shop by shop, scrubbed by scroll. The cursor lamp works here as on every drawing.
   - "No new hardware" (one of the founder's examples) is left out. Nothing on the site supports it yet.
5. **How to start.** 34's three steps and "Free during the pilot."
6. **The close.** A small line, "Free during the pilot. About a week to set up.", over one wide lamplight bar spanning all four columns. The bar reads "Try Tooey free" in Literata at display size, with a drawn arrow. On hover the lamplight deepens and the arrow moves on a little.
7. **Footer.** The slim basalt base from 34.

## The dialog
"Try Tooey free" in the header, the hero and the closing bar opens a `<dialog>` (showModal) on porcelain with a slate hairline border. Its heading is "Try Tooey free". The line under it reads "Tell us about your restaurant and we'll set up your free pilot. We reply by email."

The form is 34's, unchanged: name, restaurant and email required; `_subject`, `_template`, `_captcha` and the `_honey` honeypot; a JSON POST to FormSubmit's ajax endpoint; sending, sent and failed states, with a mailto fallback. The submit button reads "Start my free pilot".

Focus goes to the first empty field. Escape, the close button, or a click on the backdrop closes it, and focus returns to the button that opened it. The page behind it does not scroll. Arriving at `./#talk` (the privacy page's nav button) opens it. Without scripts, every "Try Tooey free" is a mailto link.

## Snapping
Snapping is done in script, not with CSS scroll-snap, so it never fights the visitor:
- **Resting places:** the top of each section (under the header), each pinned step, and the very bottom of the page, so the footer is never trapped.
- **When it eases:** after 150ms with no scrolling and no finger, mouse button or drag held, the page eases (0.6s, cubic ease-out) to the nearest resting place, if that place is within 0.75 of a screen.
- **Interrupts:** any wheel, touch, key or pointer input cancels an ease mid-way.
- **Clicks:** a plain click never moves the page.
- **Off:** under reduced motion, and while the dialog is open.

## Words
Visible words in `main`: 194, not counting the sr-only table, the nav, the footer or the dialog. The prep sheet drawn in the picture adds about 16. The nav and footer add about 10, so the home page shows about 220. The dialog adds 19 when open, not counting form labels.

## Checked
At 1440×900 in Chromium (Playwright), with FormSubmit stubbed:
- **The header** at the top, mid-pin and at the end.
- **The pinned section** with its heading at each step, and the cross-fades.
- **Snapping, after it settled:**
  - between the hero and the pin
  - between Prep and Shifts, past the boundary (lands on Shifts)
  - between Shifts and Growth, before the boundary (eases back to Shifts) and past it (lands on Growth)
  - between the pin and the independents section
  - between the independents and How to start
  - an ease interrupted by a wheel stops at once
  - the bottom of the page stays put
- **The independents street** scrubbing in, shop by shop, and at rest.
- **The closing bar** at rest and on hover.
- **The dialog**, empty and sent.
- **Reduced motion:** no pin and no snapping.

At 390 the only check was overflow, and there is none.

Screenshots taken during an ease show the fixed header a few pixels low. That is a capture artifact: logging the header's position every frame shows it stays at 0.

## Weakness
The pinned section is still long for three short lines, and the snapping makes the long middle step (Shifts) feel slightly sticky to a fast scroller. At phone width the street of shops shrinks to a strip about 130px tall and its detail is lost; it needs its own crop there.
