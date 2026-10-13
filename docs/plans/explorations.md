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
