# 24 closer

## Concept
Two identical kitchen stations sit side by side and play the same Saturday. One was prepped from a guess and one from Tooey's count. The guess runs out of pizza dough at 8:40, and the 86 ticket goes up. Its leftover risotto goes in the bin at close. Tooey's side gets through the night with a little over. Every number is marked "Example", and there are no percentages or measured figures.

## Realism
- **Engine:** Three.js 0.186 with physically based materials. Reflections come from a generated room environment, so no image files are loaded. There is one warm heat lamp, with shadows.
- **Station:** a brushed steel counter on a lowboy fridge, plus a backsplash and an aluminium ticket rail.
- **Food:** floured dough balls in a white dough box, saffron risotto in clear deli pints, and tiramisu in fluted ramekins.
- **Bin:** a grey bin with a black liner.
- **Textures:** all made on canvas, nothing hand-drawn.
- **Labels:** the pan labels and the 86 ticket are page text set in Chivo, so they stay sharp and get counted.
- **First try, swapped out:** lasagna squares, brisket slices and short ribs read as crackers, salami and candy. Containers and dough read as real, so the food was swapped (the rule from the coordinator).

## Animation (hero, crucial)
The point is made in **4.6 s**, which is under the 5 s limit.

- **0 to 0.4 s:** the lamp comes up.
- **0.4 to 3.4 s:** service runs from 5 pm to 11 pm. The same tickets arrive on both rails, and portions lift out at the same times on both sides.
- **2.23 s (8:40):** the guess side runs out of dough. "86 Pizza" drops onto the rail and its note appears.
- **3.4 to 4.15 s:** the guess side's leftover pints are tossed into the bin.
- **3.8 to 4.1 s:** Tooey's note fades in.

The ambient part is not crucial. The scene holds for 7 s. Then everything dims for 0.4 s, which hides the refill, and Tuesday plays: the guess side is prepped like a Saturday and bins dough and risotto, while Tooey's smaller prep fits. Saturday and Tuesday alternate. A Pause button stops it, and nothing plays while the hero is off screen.

The scene is a pure function of time, so `__hero.goto(night, s)` can draw any frame for checking.

## Still image
"The wall behind the line" is rendered once at build time, from the same kit, into WebP:
- dough and pints with their counts on tape;
- the time clock between two card racks;
- a full ticket spike.

On a phone each object is shown as its own crop.

## Reduced motion and no JavaScript
These show a pre-rendered end state of both stations, with all the notes, labels and the 86 ticket as page text. Three.js is not loaded under reduced motion. The phone nav shows inline when there is no JavaScript.

## Type and colour
- **Type:** Chivo (OFL, variable). Headlines are weight 300, the body is 400 with lining figures that line up in columns, and the labels are 500/700.
- **Colour:** the palette from 21 only. Lamplight is used only for the heat lamp, its glow and the clock.

## Word count
**194** visible words on the home page, counted in the browser with JavaScript off. Nav, form and footer are excluded. That rises to:
- **196** with the two numbers on tape in the still;
- **197** with the Pause button.

The Tuesday loop swaps its notes in place, which peaks at about 199.

## Critique passes
- **Design director:** I took off the steam over the hot pans. It was a cue that didn't explain anything, so that was the accessory removed. I also dimmed the glare on the still's wall. There are no eyebrows, mono labels, arrows or icon grid. The numbers in "How to start" are a real sequence.
- **Owner:**
  - "Lasagna 32 / Brisket 20" looked like a menu of toys, so I swapped the food.
  - I put the H1 on two lines so the whole comparison sits above the fold at 1440x900.
  - "Out of dough at 8:40" is the line an owner feels. The ticket shows it as "86 Pizza".

## Build
```
cd _src && npm install && node build.mjs           # js/
python3 -m http.server 5234 --bind 127.0.0.1 &      # from this folder
node stills.mjs 5234                                # img/*.webp, prints label positions
```
The label positions in `index.html` are the static fallback. They come from the `stills.mjs` output, and at runtime they are recomputed by projection.

## Weaknesses
- **The bin:** it sits at the bottom-left edge of each view and reads mostly as a dark rim. The arcing pints carry the meaning more than the bin does.
- **Size:** the hero script is 605 KB (156 KB gzipped). The animation was only checked in software WebGL, so frame rate on real phones is unmeasured.
- **Load jump:** on a slow connection the end-state still shows first, then jumps to the start of the night.
