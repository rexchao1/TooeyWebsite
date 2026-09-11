# Working agreement

Read `README.md` first: what this site is, how to run it, and where each part
lives. This is a marketing page, not the product — the operator console is a
separate repository (TooeyApp) with its own working agreement and its own
enforced boundaries. Do not import from it or reach into it from here.

## Commands

| Role | Command |
|---|---|
| run | `npm run dev` — http://localhost:5173 |
| build | `npm run build` — static files into `build/` |
| preview | `npm run preview` — serves `build/` as a host will |

Node 22.12 or later (20.19 also works; Vite 8 sets the floor), `npm ci`
once. There is no test suite, no linter, and no
CI. Verification here is reading the page in a browser at desktop and phone
width; there is nothing else to hide behind.

## Before you write anything

- **Changing words** — headline, features, FAQ, footer, contact address,
  calculator labels: edit `src/lib/config/site.js` and nothing else. Every
  section component reads it.
- **Changing the calculator's numbers**: `src/lib/config/calculator.js` holds
  both the assumptions and the arithmetic. The figure it shows a restaurant
  owner is a claim, so change it only with a reason you can state.
- **Changing layout or style**: `src/app.css` holds the fonts, the custom
  properties and the type scale. Use the existing properties rather than a
  new hex value; a one-off colour is how a page stops looking like one page.

## Claims

Everything on this page is a promise to a restaurant owner who has not paid
yet, and some of it is measurable. The accuracy argument in the FAQ — that
per-item accuracy is the hard number and the one worth publishing — is the
product's actual position, backed by measurements in TooeyApp's `evidence/`.
Do not soften it, inflate it, or invent a figure to sit beside it. A number
on this page that no measurement supports is the one kind of change here that
cannot be undone by editing the page later.

The POS list in `site.js` under `integrations` is what the page says works
today. Square is supported; the rest are aspiration, and the FAQ says so.
Keep those two consistent.

## Scope

One page. If a section needs a second page, that is a decision to take with
the user, not a file to add. Placeholders are deliberate and tracked:
`SIGNUP_URL` and `LOGIN_URL` in `site.js` point at an anchor and `#` until
there is something real behind them.

## Git

Work on a branch from `main`, commit when the work is done, push, and open a
pull request against `main` on the GitHub remote this clone tracks. No agent
attribution, session link, or machine name in a commit message or a pull
request body. No secret and no customer record: both reach GitHub verbatim.

## Done

The page builds (`npm run build`) and you have looked at what you changed in
a browser, at desktop and at phone width. Say which of those you did. A check
that did not run did not pass.
