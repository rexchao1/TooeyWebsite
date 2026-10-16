# Ten explorations

Rex asked for ten independent redesigns of the public site, each from a
different strategic reading of Tooey, built as working sites, reviewed, and
shown side by side in a local gallery. Nothing here replaces the live site.
None of it is merged or deployed.

## Layout

- The live site at the repo root is not touched.
- Each exploration is a self-contained static site in `explorations/NN-slug/`
  (entry `index.html`, relative links only, any source under `_src/`), with
  a `NOTES.md` that explains its reasoning.
- `explorations/index.html` is the comparison gallery: screenshots, desktop
  and phone previews, the brief, and strengths and weaknesses for each.
- Run `python3 -m http.server 5173` at the repo root and open
  http://localhost:5173/explorations/

## How the work ran

Each site was designed and built by its own agent in its own git worktree,
from one shared fact sheet (what Tooey does today, what is vision only, what
must never be claimed) and one strategic brief. Agents did not see one
another's briefs or work. The orchestrator collected the folders onto this
branch, reviewed each site, sent fixes back where needed, and built the
gallery.

## The ten briefs

| # | Folder | Direction |
|---|---|---|
| 01 | `01-margin` | Money first: margin, food cost, lost sales, without a single invented figure |
| 02 | `02-time-back` | Less time managing: work that happens overnight, little asked of the owner |
| 03 | `03-sandbox` | Show, don't tell: a sample restaurant the visitor can explore |
| 04 | `04-glass-box` | Explainable automation: how each count is made, and when it stays silent |
| 05 | `05-pilot-terms` | Candor: the site is the pilot offer, with plain terms |
| 06 | `06-platform` | The long view: the platform Tooey is building, prep as its first piece |
| 07 | `07-your-sales` | Your POS already knows: reading the data an owner already has |
| 08 | `08-the-analyst` | What the chains have: capability independents never had |
| 09 | `09-skeptic` | Straight answers to a burned-before owner's doubts |
| 10 | `10-quiet` | Radical restraint: fewer things to worry about |

## Claims (bind every exploration)

From `new-site.md`, the live site, and the business context Rex gave:
no accuracy, savings, time, or industry figures; no testimonials, logos, or
integrations; weather and events are vision, not inputs; free during the
pilot with no price or trial length; no team names.

## Steps

- [x] Read the repo, the plans, the live pages, and the product notes
- [x] Write the fact sheet and the ten briefs
- [x] Ten agents build in isolated worktrees
- [x] Collect each exploration onto this branch
- [x] Review each site (desktop and phone, every route, claims) and send fixes back
- [x] Check the ten for overlap; reconsider any pair that converged
- [x] Gallery with screenshots, previews, and summaries
- [x] Commit and push to the working branch (no merge, no deploy)

## What review changed

The first round converged on one look: warm cream paper, a near-black serif
headline, a black button, a white card with a sample prep list, and dashed
marks for anything not built. The strategies and copy were distinct; the
faces were not. 01 (a ledger), 02 (day and night), and 10 (calm) kept paper
because it is their idea. 03, 04, 05, 06, 07, 08, and 09 were sent back to
rethink their visual identity while keeping strategy and copy, with a list
of looks and typefaces already taken. Two second-round collisions followed
(06 and 09 both went royal blue on grey in Archivo; 03 went to the same
sage green as 04) and were sent back once more. Remaining overlaps, judged
acceptable: 07 and 08 share a yellow family (pale lemon with aubergine vs.
saturated ochre with pictograms), and 03 and 09 share a blush note.

## Open for Rex

Each gallery entry ends with a question. Across all ten:
- Several say plainly that accuracy hasn't been measured at a live
  restaurant. That is true and more candid than the live site.
- All promise the morning email and the nightly POS pull, as the live site
  does, on the condition recorded in `new-site.md`.
- Several state "no analytics, no cookies"; true of these builds only.
- Share images use relative paths and need the real domain.

## Round two (2026-10-13)

Rex: round one was all too cliché and too wordy; he wants anti-cliché, far
fewer words, better motion, and the quality bar of meuze.ai (unreachable
from this environment's network). All ten were rebuilt from scratch by
fresh agents, each following the `frontend-design` skill and a new brief:
at most 150 words on the home page, one signature motion piece, no
round-one tells (cream and serif, prep-list card hero, eyebrows, mono
labels, fade-ups, dashed "not built" marks, roadmap grids).

Each agent sent a plan before building. Across the plans six chose the
same typeface and five the same night-to-morning palette, so each was
given a distinct font, ground, and motion mode before any code was
written: scroll-driven (02, 04, 05, 06), hands-on (01, 03, 07), or
self-playing (08, 09, 10). Three sites still landed on the same pale pink;
08 and 10 moved off it. 01 was sent back because Tooey's line always won
in its demo, which implied unmeasured accuracy; its runs now vary and say
"Closer, not perfect."

- [x] Round two plans, collision review, and go-ahead
- [x] Ten sites rebuilt, reviewed with motion frames, and committed
- [x] Gallery rewritten for round two

## Round three (2026-10-14)

Rex kept round two and asked for more: more animation and creativity, and
copy about Tooey as the operator's back end (prep, shifts, growth) rather
than forecasting. He liked 02, 04, 06 and 09 best, so the brief named what
they do well (the data is the art, one continuous scene, a payoff, a real
voice, one complete world) and asked for better. Cap: 180 words. Shifts
and growth are shown as being built, never as working.

Six plans came in and five were built: 12 (the rota), 13 (a drawing
sheet), 14 (a shopfront through a week), 15 (a mixing desk), 16 (a marble
run). 11 overlapped 13 and 12 and was dropped. Each found its own way to
separate live from coming: ink vs pencil (12), ink vs drafting blue (13),
lit vs reflected (14), patched vs unpatched (15), painted vs white card
(16). 14 moved off blue and concrete, and 16 off cobalt and a shared body
face, before building.

- [x] Plans, collision review, five go-aheads
- [x] Five sites built, reviewed with motion frames, and committed
- [x] Gallery grouped by round

## Round four (2026-10-14)

Rex: less of a theme; a direct website about Tooey with creative animation
inside it. Not cliché, not wordy, not crazy. Cap: 200 words, normal scroll,
no whole-page metaphor. Five briefs by tone: plainspoken (17), hospitable
(18), precise (19), bold (20), refined (21).

Three plans converged on a cool white ground with a teal accent and the
same bar-and-line charts, and two used deli containers. Before building:
17 took the typographic lane (no charts) and kept teal; 19 kept the charts
and moved to orange; 21 dropped teal for stone, smoke glass and lamplight;
18 dropped cobalt and its pencil device; 20 moved its ground off
ultramarine, which matched 04.

- [x] Plans, collision review, five go-aheads
- [x] Five sites built, reviewed with motion frames, committed, and added to the gallery

## Round five (2026-10-14)

Rex narrowed it down: keep 21's colours; he liked the single animation of
16, the moving and expanding hero of 18, and the meaningful animation of 12,
pointed at accuracy against guessing. He asked for realism (a real
restaurant, or an animation of one), Tooey presented as a finished product,
no example item left blank, and nothing that needs more than about five
seconds on one screen. Photo hosts are unreachable from this environment,
so realism is rendered (Three.js, procedural geometry, canvas textures).

All four plans converged on a 3D restaurant with taped quarts, lamps
lighting tables, and a guess-vs-Tooey ending with an 86 and a bin. Before
building, each site was given its own objects: 22 people (blurred) and
staffing, 23 macro quarts and a single-quart comparison, 24 the side-by-side
stations, 25 daylight, aprons and sheet trays.

Claims to settle before any of this ships: these pages present shifts and
growth as working, and say Tooey's counts are closer than a guess (no
figures). Both need to be true first.

- [x] Plans, collision review, four go-aheads
- [x] Four sites built, reviewed from rendered stills and frames, committed, and added to the gallery

## Round six (2026-10-14)

Rex on round five: "little 3D videos pasted into a generic website." He
wants the animation to be part of the page, not realistic for its own sake,
with some scroll-driven motion. His idea: a walk through one casual
restaurant, from outside, through the doors, to a table, behind the POS,
into the back kitchen and onto the prep sheet. Four variations, each in
21's palette, drawn and lit in SVG (no 3D), built without a plan gate and
reviewed at desktop only:

| # | Folder | How the walk moves |
|---|---|---|
| 26 | `26-walk-in` | Forward into depth; walls part as you pass through |
| 27 | `27-doors` | Each room change is an opening you scroll through; rooms play on arrival |
| 28 | `28-side-track` | One side elevation, tracked sideways |
| 29 | `29-follow-the-order` | One sharp order travels through soft, out-of-focus rooms |

- [x] Four sites built, reviewed from scroll frames at 1440, committed, and added to the gallery

## Round seven (2026-10-14)

Rex shared screenshots of meuze.ai: deep but simple, one image treatment
everywhere, a strict frame. We took the decisions, not the answers. A
samples page (`explorations/_samples/`) compared three treatments (tally
hatching, thermal print, light only) on two sources and both grounds; he
chose Light only, both sources, both grounds, and asked that every build
come as one dark and one light. Two deeper sites on one system: Light only,
a prep-sheet hairline grid, Literata / Source Serif 4 / Schibsted Grotesk,
lamplight the only accent, about five screens.

| # | Folder | Ground and source |
|---|---|---|
| 30 | `30-light-basalt` | Basalt, 3D renders |
| 31 | `31-light-porcelain` | Porcelain, drawn rooms in slate line |

- [x] Samples page; treatment chosen
- [x] Two sites built, reviewed from 1440 scroll frames, one fix round on 30, committed, added to the gallery

## Round eight (2026-10-15)

Rex chose 31 and asked for slightly more complexity and better animation.
Three combinations on 31's look (porcelain, slate line, lamplight, the
prep-sheet grid), drawn in SVG:

| # | Folder | Combination |
|---|---|---|
| 32 | `32-walk-through` | One continuous drawing that draws itself, with living details per room |
| 33 | `33-living-sheet` | Scenes draw themselves; lines morph between scenes; numbers write themselves |
| 34 | `34-lit-room` | Fewer, denser scenes; the cursor is a lamp; leftovers glow |

- [x] Three sites built, reviewed at 1440, committed, added to the gallery

## Round nine (2026-10-15)

Rex picked 34. Changes, made as `35-operating-system` (34 kept): headline
"Your new restaurant operating system."; prep, shifts and growth as one
pinned section with the three items stacked on the right and the drawing
cross-fading on the left; Talk to us as a button that opens a dialog with
the form; the header always visible. Next: more informative sections (his
pick pending).

- [x] 35 built, reviewed at 1440, committed, added to the gallery
- [x] 35's wording settled through comments on a static copy
- [x] Hero options: 36 (shop windows as OS windows) and 37 (the
  restaurant boots up), each with typed or flicker headline text

## Round ten (2026-10-15)

37 read too flat. Two looping heroes for 35: a string connecting the POS,
the fridge and the chef; real depth; no cursor lamp; a long fade into the
left; a retro VHS glitch headline.

- [x] 38: axonometric kitchen, brass thread, bead loops every 10 s
- [x] 39: one-point perspective through the pass, pulse runs in depth
- [x] Rex picked 39

## Round eleven (2026-10-15)

39, made grand: full-bleed, a moving camera, and objects travelling
instead of the string (a receipt to the fridge, meat to the chef, the dish
out).

- [x] 40: one day (night close, morning prep, service), the receipt as
  last night's sales becoming this morning's counts
- [x] 41: the relay as described, constant evening light
- [x] Rex picked 40

## Round twelve (2026-10-16)

40 revised as 42: scroll-driven instead of timed, faster, overlapping
beats, morphs (receipt to prep sheet, steak to pan to plate), unlabeled
food, faceless but realistic people, no column lines in the hero.

- [x] 42 built, reviewed at 1440, committed
- [x] Rex reviewed 42 and asked for changes

## Round thirteen (2026-10-15)

42 revised as 43: slower, the "What Tooey does" section moved into the day
(forecast at the till, prep at the fridge, shifts as a server serves the
plate), the headline fades on scroll and its three key words fly up into a
rail, a clear header over the scene.

- [x] 43 built, reviewed at 1440, 1280 and 390, committed
- [x] Rex reviewed; went back to 35 instead (round fourteen)

## Round fourteen (2026-10-16)

Rex prefers 35 to 36 through 43: those did too much.
Back to 35, kept small, built as 44 (`explorations/44-typed-os/`).

Rex's notes:

- [x] Hero headline types itself out, computer feel. 36 already built
  this (`?text=type`: headline in about 1.15s with a thin caret, lead
  after, button fades in). Port it, and push it toward a terminal: block
  caret, slightly uneven key timing, caret keeps blinking a moment at the
  end. Real words stay in the `h1`; reduced motion shows them finished.
- [x] Header smooth, no border: drop the bottom hairline (`.top::after`)
  and the column rules through the header (`.top::before`). Instead of a
  hard edge, a soft porcelain fade at its bottom (or a light blur) as the
  page slides under it.

Seen in 35 at 1440 (2026-10-16). Phone views are out of scope:

- [x] The column rules run through the headline at 1440 (the second rule
  cuts "Your new restaurant"). 42 dropped column lines in the hero; do
  the same here.
- [x] The pin is long for three short lines (340vh) and Shifts feels
  sticky to a fast scroll. Try about 250vh.
- [x] 44 built, reviewed at 1440, committed
- [ ] Rex reviews 44

## Round fifteen (2026-10-16)

Rex wants polished art for a single restaurant building in the hero and a scroll camera through "What Tooey does" (POS, prep sheet, cook), without paying.
Recraft's free plan does not license images for commercial use, so test the free route: a real photo, treated in code.
Built as 45 (`explorations/45-photo-treatments/`), a comparison page, not a site.

- [x] One free Unsplash photo, three animated treatments: engraved lines, typed characters, warm duotone
- [x] A scroll camera through the photo with three held framings
- [x] Reviewed at 1440; gallery entry and shots
- [ ] Rex picks a treatment, and decides on stock or our own photos
