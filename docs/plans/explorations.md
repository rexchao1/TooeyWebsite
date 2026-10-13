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
- [ ] Ten agents build in isolated worktrees
- [ ] Collect each exploration onto this branch
- [ ] Review each site (desktop and phone, every route, claims) and send fixes back
- [ ] Check the ten for overlap; reconsider any pair that converged
- [ ] Gallery with screenshots, previews, and summaries
- [ ] Commit and push to the working branch (no merge, no deploy)
