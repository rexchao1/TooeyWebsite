# 10-quiet: "Service is loud."

## Concept
A restaurant is loud. Tooey is the one thing that is quiet and already done. The hero plays one service and then goes quiet by itself: the visitor watches the roar of orders turn into a few calm counts, and nothing has to be scrolled, clicked or understood first.

## Signature motion (`service.js`, about 9.4 s, plays on load)
- **Roar, 0 to 2.3 s.** Lanes of real-sounding order lines ("2 short rib", "smash no onion", "heard", "fire 12") stream across a heat-lamp red field. They are drawn on a 2D canvas and set tone on tone, so the headline stays readable. Each lane surges on its own rhythm, like a ticket printer.
- **Coast, 2.3 to 6.4 s.** The lanes slow under friction (speed × (1−p)^2.2) instead of braking. Kitchen chatter fades out line by line.
- **Tally, 3.0 to 7.5 s.** About 30 dish lines leave their lanes in a staggered, shuffled order. Each takes a quadratic arc to its row. Along the way it lifts from lane colour to ink, shrinks and gets lighter, then dissolves into the row's number. The number rolls up toward what has landed. This is the real mechanism: the day's orders become tomorrow's count.
- **Cool, 2.5 to 7.6 s.** The ground is mixed in OKLab from heat-lamp red to "lamp off" pink. The noise is always the ground colour one shade darker, so it never goes muddy. The type flips from light to dark inside a short window, so the headline is never grey on salmon for long.
- **Exhale, 3.3 to 8.0 s.** "Service is loud." goes from Mona Sans 900 to 260, its tracking opens, and it settles 8% smaller. The words stay the same and the voice changes. The width axis is not used.
- **Rest.** The halibut lines land last and leave no number, just "New this week. Too early to count." The caption appears, the animation loop is cancelled and the page is truly still.

**Control.** A small "Quiet now" button skips to the rest state during play (this covers WCAG 2.2.2). At rest the same button reads "Play service again". Its dot glows like a lamp while service plays.

**Waiting on phones.** The tally waits until the list is at least half in view, so on a small phone the roar keeps going until you scroll to the list.

**Reduced motion and no JS.** A designed still: service frozen as a red panel of heavy order lines behind the headline (left on desktop, top on phone), and the finished list already quiet on pink. If `service.js` never runs, the page falls back to this still after 4 s.

## Palette
| Name | Hex | Use |
|---|---|---|
| Heat lamp | #C4381A | the service ground |
| Ticket | #FFF1E4 | type on red (4.8:1) |
| Lamp off | #F0C9BD | the calm ground, the colour of the kitchen after close |
| Char | #4E1A10 | type on pink (9.3:1) |
| Char soft | #7E3A2A | secondary type (5.5:1) |
| Well | #F7DED6 | form field fill |

## Type
Mona Sans (OFL, self-hosted, Latin, weight axis 200–900 only, about 40 KB). It is the only family on the site. Counts use tabular figures. There is no serif and no mono.

## Word count
**92 words** of visible home-page copy, plus 8 example figures. This excludes nav, form labels, footer, screen-reader-only text and the decorative order lines (which are `aria-hidden`). The control is counted at its longer label.

## Illustrative vs. factual
- **Illustrative:** the dish names, the counts, the order lines and the kitchen chatter. The list is labelled "Example list". The animation of orders turning into counts shows the idea, not the real model's arithmetic.
- **Factual, from the brief:**
  - The list comes each night from the day's sales and arrives by email before prep.
  - "Likely" is the prediction and "Make" is the prep count.
  - New dishes get a blank with the reason.
  - Setup takes about a week and starts from about five weeks of past sales.
  - The pilot is free and is for independent restaurants; the owner checks the counts and decides.
  - The privacy terms.
- **Not mentioned:** any figure, any customer and any future feature.

## Weaknesses
- The middle second of the cool (around 4.5–5 s) is the least beautiful frame: salmon ground and a busy tally.
- The decorative order lines are words. A strict reader could count them against the 150-word budget, though they are imagery and hidden from assistive tech.
- On the smallest phones the list is below the fold, so the quiet only starts once you scroll to it.
- The setup lines and the form are deliberately plain. All the craft is in the hero.
- Mona Sans is widely used in tech (it is GitHub's typeface), which slightly dilutes the identity.
