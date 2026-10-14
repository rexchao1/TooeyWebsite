# The rota (12-shifts)

## Concept
The staff rota is the hero. Tonight's rush rises behind it as a tide, and the shifts are recut to match. The page is drawn the way a rota is actually filled in. What Tooey does today is in ink with a highlighter (the prep count). What it is building is pencilled in (shifts, and filling slow nights).

## Motion
The motion is one continuous shot. The headline sits in the rota's empty top rows. On load:
1. The grid draws.
2. Six inked shifts print, all 4pm to 11pm.
3. Tuesday's rush fills and sloshes.
4. Graphite hatch marks the people with nothing to do.
5. Tooey's row gets its highlighter.

As you scroll, the headline leaves, the caption rides up under it, and the board grows into the space. Then, scrubbed by scroll:
- **Saturday:** the board zooms out and the tide surges over the six. The spill is highlighter pink.
- **Pencil:** a pencilled rota is sketched to fit the night. Three extra shifts drop in on springs and bounce as they land. Role labels narrow on Saira's width axis as their shifts get cut.
- **Ink:** the tide drains through the baseline in droplets that fall into Tooey's row. That row zooms in, and its example counts tick from Tuesday's numbers to Saturday's.
- **Tuesday again:** the extra pencilled shifts slide off to the left. A pencilled line shows a fuller Tuesday, and one shift comes back.

How it's built:
- The scene is plain JS rendering SVG strings (`js/core.js`, `js/stage.js`). No libraries.
- The tide is a 1D spring-coupled height field stepped at 120 Hz. Scroll sets its target, and the simulation adds the slosh.
- The falling shifts are damped springs.
- The pencil is SVG turbulence and displacement on doubled strokes.
- The stage pins with `position: sticky`. The pilot section starts about 3.3 screens down.

The form answers with a pencilled shift carrying the restaurant's name: "Pencilled in."

## Palette and type
| Name | Hex | Use |
|---|---|---|
| Copy paper | `#ECEEEA` | Ground, cool and not cream |
| Biro | `#24318C` | All text and the inked rota, never a large fill |
| Highlighter lime | `#DCF24A` | Live things only: the prep column and the pilot buttons |
| Highlighter pink | `#FF6EA9` | The night spilling over the rota |
| Pencil | `#5E636B` | Pencilled shifts, growth, slack hatch |
| Tide | `#CBD2EF` | The rush |

Type is one family: Saira, variable width and weight, OFL, self-hosted at 99 KB.
- Headlines: about weight 740, width 66%.
- Labels: width 58–100%, driven by shift length.

## Word count
**178** visible words on the live home page, counted in the browser: 152 words of HTML text plus 26 words inside the board. The static board shows 179 because it has both day tags. Nav, form labels and footer are excluded.

## Illustrative vs. factual
- **Illustrative:** every shape (the rush, the shifts, the fitted rota, the fuller Tuesday) and the role names. The prep numbers are marked "Example".
- **Factual:**
  - The prep email exists today, with Predicted and Prep columns and a blank plus reason for dishes too new to call.
  - The pilot is free.
  - Setup is a nightly POS download that works with most systems, about five weeks of past sales, and about a week.
  - The owner checks the counts against what sold, then decides.
  - The privacy terms.

## Live vs. coming
- Ink and lime highlighter mean it works today. Lime only ever touches the prep count and the pilot buttons.
- Pencil means it is pencilled in: the fitted shifts and the growth line.
- The captions say it once in plain words: "We're building that, so it's in pencil", "Prep is in ink, today", and "Pencil, for now."
- The form keeps the same vocabulary. A sent inquiry is "Pencilled in."
- There are no badges, dashed boxes, dates or order.

## Reduced motion / no JS
A designed static board, pre-rendered by `_src/build-static.mjs` from the same `core.js`, with a wide and a narrow version. It shows:
- Tuesday and Saturday side by side.
- The inked fixed rota, with slack hatch and pink spill.
- The pencilled fit and the fuller-Tuesday line.
- Tooey's inked prep row.

The five captions sit beside it as a list. The form posts normally without JS.

Rebuild after changing `core.js`: `node explorations/12-shifts/_src/build-static.mjs`.

## Weaknesses
- **Phones:** Tooey's row can't zoom (no room), so the "Prep is in ink" moment is quieter on a phone than on desktop.
- **320×568:** the headline doesn't leave room for the board, so the first screen is text, and the board arrives one scroll later with a moment of empty headroom.
- **Repaint cost:** the board rebuilds the SVG every frame while visible. It is fine on a laptop, but low-end phones may drop frames during the pencil filter.
- **Static board:** the inked role labels sit under the pencilled shifts on the Tuesday panel, which is a little busy.
- **Readability:** a few readers may not decode the hatch as "idle" until the caption appears.
