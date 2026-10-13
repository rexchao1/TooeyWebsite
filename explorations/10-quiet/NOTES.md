# 10-quiet: "Service is loud."

## Concept
A restaurant is loud. Tooey is the one thing that is quiet and already done. The hero plays one service and then goes quiet by itself. The visitor watches the roar of orders turn into a few calm counts. Then the heat lamp switches off, the red draws back into one small dot, and what is left is a clean white counter. Nobody has to scroll, click or understand anything first.

## Signature motion (`service.js`, about 9.9 s, plays on load)
- **Roar (0–2.0 s).** Lanes of real-sounding order lines ("2 short rib", "smash no onion", "heard", "fire 12") stream across a heat-lamp red field. They are drawn on a 2D canvas, tone on tone, so the headline stays readable. Each lane surges on its own rhythm, like a ticket printer.
- **Coast (2.0–5.6 s).** The lanes slow under friction (speed × (1−p)^2.2) instead of braking. The kitchen chatter fades out line by line.
- **Tally (2.6–6.6 s).** About 30 dish lines leave their lanes in a shuffled stagger and each follows a quadratic arc to its row. On the way it lifts from lane colour to ink, shrinks and gets lighter, then dissolves into the row's number, which rolls up toward what has landed. This is the real mechanism: the day's orders become tomorrow's count. The halibut lines land last and leave no number, only "New this week. Too early to count."
- **Lamp off (6.7–8.0 s).** After a beat of silent red, the whole red field contracts as a circle into the small dot beside the control. The easing is quartic in-out. The dot stays red: it is the lamp, and it is also the "Play service again" button. Replaying opens the red back out of the dot.
- **Exhale (7.6–9.5 s).** On the white, "Service is loud." goes from Mona Sans weight 900 to 260, the tracking opens, and it settles 8% smaller. The words stay the same; the voice changes. Weight, size and spacing only, no width axis.
- **Rest.** The caption appears, the animation loop is cancelled, and the page is truly still.

**How the lamp-off works, and why there is no muddy middle.** The hero is built twice. The real layer is char on white and holds all the links and focus. A JS-made copy in service colours (ticket on heat-lamp red, holding the noise canvas) sits on top. That copy is `aria-hidden`, `inert` and `pointer-events: none`, and clipped by `clip-path: circle()`. So every pixel is either fully red or fully white, and no in-between colour ever exists. The flying lines are drawn on a third canvas above both. Each one is ticket-coloured inside the circle and char outside it. When the real layer has keyboard focus, its ring is mirrored onto the copy.

**Controls and accessibility.** During play the control reads "Quiet now" and skips to the rest state (this covers WCAG 2.2.2). At rest it reads "Play service again". On phones the tally waits until the list is at least half on screen.

**Reduced motion and no JS.** A designed still: the service frozen as a red panel of heavy order lines behind the headline (left on desktop, top on phone), and the finished list already quiet on white. If `service.js` never runs, the page falls back to this still after 4 s. Browsers without `clip-path` get the still as well.

## Palette
| Name | Hex | Use |
|---|---|---|
| Heat lamp | #C4381A | the service ground, the lamp dot, the submit button |
| Ember | #A42C10 | the order lines, tone on tone |
| Ticket | #FFF1E4 | type on red (4.8:1) |
| Counter | #FFFFFF | the calm ground: a wiped counter, a clean plate |
| Char | #4E1A10 | type on white (14:1), burnt from the lamp |
| Char soft | #7E3A2A | secondary type (7.4:1) |
| Well | #F4F2F1 | form field fill, with a char-soft bottom edge |

## Type
Mona Sans (OFL, self-hosted, Latin, weight axis 200–900 only, about 40 KB) is the only family on the site. Counts use tabular figures. There is no serif and no mono.

## Word count
**92 words** of visible home-page copy, plus 8 example figures. This leaves out the nav, form labels, footer, screen-reader-only text, and the decorative order lines (which are `aria-hidden`). The control is counted at its longer label.

## Illustrative vs. factual
- **Illustrative:** the dish names, the counts, the order lines and the chatter. The list is labelled "Example list". The animation of orders turning into counts shows the idea, not the model's real arithmetic.
- **Factual, from the brief:**
  - The list is made each night from the day's sales and arrives by email before prep.
  - "Likely" is the prediction and "Make" is the prep count.
  - New dishes get a blank with the reason.
  - Setup takes about a week from about five weeks of past sales.
  - The pilot is free and is for independent restaurants; the owner checks the counts and decides.
  - The privacy terms.
- **Not used anywhere:** figures, customers, future features.

## Weaknesses
- The service colours come from a copy of the hero built at runtime. It cannot drift from the real markup, but it doubles the hero's DOM while the page is open.
- The white rest state relies on the red that came before it. A visitor who arrives mid-scroll, or with reduced motion on, gets less of the contrast. The still keeps the red panel for that reason.
- The decorative order lines are words. A strict reader could count them against the 150-word budget, though they are imagery and hidden from assistive tech.
- On the smallest phones the list sits below the fold, so the quiet only starts once you scroll to it.
- The setup lines and the form are deliberately plain; all the craft is in the hero. Mona Sans is GitHub's typeface, which slightly dilutes the identity.
