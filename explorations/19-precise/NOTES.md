# 19-precise

A direct site. Each figure is an exact motion graphic: the restaurant's own
sales becoming a decision.

## How it is built

- `figures.js` draws every figure as a pure function of time:
  `render(name, variant, t)` returns the SVG for that moment. There is no
  animation library.
- `_src/build.js` renders each figure's final moment into `index.html`, so the
  page reads without JavaScript and under reduced motion. It also checks that
  the fitted shifts cover the busy curve at every point. Run
  `node _src/build.js` after you edit `_src/index.html` or `figures.js`.
- In the browser, `site.js` replays the same function frame by frame. The hero
  plays on load. The other figures play once when they come into view, and
  each has a replay button.
- Hero and prep have wide and narrow layouts. Shifts and growth do too. A
  container query picks one.

## Rules the figures follow

- **Time runs at constant speed.** Anything that stands for time passing moves
  linearly: the night's sales, the busy curve, the scan.
- **Values settle.** Anything that stands for a worked-out value settles on one
  ease-out curve with no bounce.
- **Numbers roll.** They turn digit by digit at a fixed width.
- **Live is filled; concept is outline.** Live work (prep) is filled and sits
  on a tinted plate. Work being built (shifts, growth) is drawn in ink outline
  straight on white. The hero uses the same rule on its three routes.
- **One accent hue.** Orange (#C2410C) marks Tooey's output and nothing else.
  Ink hairlines do the measuring.
- **Examples are labelled.** The hero caption says so, and so does the prep
  caption. Shifts and growth are captioned "Concept".

## Choices after the cross-plan review

- **Accent.** Petrol became orange. Marigold became ink hairlines.
- **Ground.** I tried porcelain #F2F4F3 against white. Porcelain read as another
  grey SaaS page, so the page is white. Porcelain is now the fill of the live
  plates, which makes "filled = live" literal.
- **Grids.** Hairline value grids appear only inside the live charts.
- **Accessory removed.** The hero had a pointer crosshair with no readout. It
  was decoration, so it went.
- **Not used.** GSAP was not needed.

## Word count

199 on the home page, counted conservatively. That includes figure text, the
digits in figures and the four step numerals. Nav, form labels and footer are
left out.
