# Tooey website

The public landing page at the root domain: what Tooey is, who it is for, and
the free backtest offer. One page, prerendered to static files, no backend.

It is not the operator console. That is a separate repository (TooeyApp),
which holds the product, the API and the signed-in console. Nothing here
talks to it; `LOGIN_URL` in `src/lib/config/site.js` is still a placeholder.

## Run it

```
npm ci
npm run dev      # http://localhost:5173
npm run build    # static site into build/
npm run preview  # serve build/ as it will be served
```

Node 22.12 or later (20.19 also works). Vite 8 sets that floor. There is
no test suite and no linter configured.

## Layout

| Path | Holds |
| --- | --- |
| `src/routes/+page.svelte` | The page: seven sections in order, and nothing else. |
| `src/lib/components/` | One component per section — `Nav`, `Hero`, `Credibility`, `Features`, `Hook`, `Faq`, `Footer` — plus `CalculatorModal` and `Wordmark`. |
| `src/lib/config/site.js` | Every word on the page. Copy changes happen here. |
| `src/lib/config/calculator.js` | The over-prep calculator's assumptions and arithmetic. |
| `src/app.css` | Fonts, custom properties, and the shared type scale. |
| `static/` | Served verbatim at the root: fonts, favicon, screenshot. |

The page is prerendered (`src/routes/+layout.js` sets `prerender = true`) and
built by `@sveltejs/adapter-static`, so `build/` is plain files any static
host can serve.
