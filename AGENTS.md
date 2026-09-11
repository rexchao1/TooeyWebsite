# Working agreement

Read `README.md` first. This is a marketing page, not the product. The
operator console is a separate repository (TooeyApp). Do not import from
it or reach into it from here.

The live site is `index.html`. Vercel publishes that file. The Svelte app
under `src/` is a leftover draft and is not deployed. Do not edit `src/`
expecting the change to go live.

## Commands

| Role | Command |
|---|---|
| run | `python3 -m http.server 5173` — http://localhost:5173 |
| build | `npm run build` — copies `index.html` into `dist/` |

There is no test suite and no linter. Verification is reading the page in
a browser at desktop and phone width.

## Before you write anything

Changing words, layout, or style: edit `index.html`. That file is the page.

## Claims

Everything on this page is a promise to a restaurant owner who has not paid
yet. Do not invent a figure that no measurement supports.

## Scope

One page. If a section needs a second page, that is a decision to take with
the user, not a file to add.

## Git

Work on a branch from `main`, commit when the work is done, push, and open a
pull request against `main` on the GitHub remote this clone tracks. No agent
attribution, session link, or machine name in a commit message or a pull
request body. No secret and no customer record: both reach GitHub verbatim.

## Done

You have looked at what you changed in a browser, at desktop and at phone
width. Say which of those you did. A check that did not run did not pass.
