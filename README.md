# Tooey website

The public site at the root domain. Static HTML at the repo root. Vercel
ships those files. It is not the Svelte one-pager under `src/`.

The operator console is a separate repository (TooeyApp).

## Run it

```
python3 -m http.server 5173
```

Then open http://localhost:5173

`npm run build` copies the live HTML, CSS, JS, art, marks, and fonts
into `dist/`, which is what Vercel publishes. `vercel.json` sends the old
`/how.html` and `/about.html` to the home page.

## Layout

| Path | Holds |
| --- | --- |
| `index.html` | Home: the painted street hero, what Tooey does (forecast, prep, shifts on a pinned board), built for independents, setup, and the contact form. |
| `privacy.html` | What the contact form and a partner's sales are used for. |
| `styles.css` | Type, color, layout, and motion. |
| `site.js` | Nav, the hero typing, the board camera, the scenes, and the contact form. |
| `draw.js`, `scenes.js` | The line drawings under the paintings (`?art=line` shows them). |
| `art/` | The ink and watercolour paintings and the setup sketches (AI-generated with Codex image generation). |
| `plan.svg` | The floor plan behind the board. |
| `mark.svg`, `favicon.svg` | The chef's hat logo. |
| `fonts/` | Self-hosted Literata (headings), Source Serif 4 (text), and Schibsted Grotesk (labels and buttons). |
| `src/` | An unused one-page Svelte draft. Editing it does not change the live site. |

The live design came from exploration 49 ("ink"). The explorations are kept
on the maintainer's machine only: `explorations/` is ignored by git. Their
plan and history are in `docs/plans/explorations.md`.
