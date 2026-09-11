# Working agreement

Read `README.md` first. This is marketing, not the product. The
operator console is a separate repository (TooeyApp). Do not import from
it or reach into it from here.

The live site is static HTML at the repo root: `index.html`, `how.html`,
`about.html`, `privacy.html`, plus `styles.css`, `site.js`, `logo.png`,
`favicon.svg`, and `fonts/`. Vercel copies those into `dist/`. The Svelte
app under `src/` is a leftover draft and is not deployed. Do not edit
`src/` expecting the change to go live.

## Commands

| Role | Command |
|---|---|
| run | `python3 -m http.server 5173` — http://localhost:5173 |
| build | `npm run build` — copies the live HTML, CSS, JS, and assets into `dist/` |

There is no test suite and no linter. Verification is reading the pages in
a browser at desktop and phone width, including every route.

## Before you write anything

Changing words, layout, or style: edit the root HTML and `styles.css`.
Those are the pages.

## Claims

Everything on this site is a promise to a restaurant owner who has not paid
yet. Do not invent a figure that no measurement supports.

## Scope

A small static site. Extra pages only when they earn their keep. No blog,
no changelog, no fake docs, no made-up pricing.

## Git

Work on a branch from `main`, commit when the work is done, push, and open a
pull request against `main` on the GitHub remote this clone tracks. No agent
attribution, session link, or machine name in a commit message or a pull
request body. No secret and no customer record: both reach GitHub verbatim.

## Done

You have looked at what you changed in a browser, at desktop and at phone
width, including new routes. Say which of those you did. A check that did
not run did not pass.
