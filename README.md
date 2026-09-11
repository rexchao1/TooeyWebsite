# Tooey website

The public landing page at the root domain. The live page is the single
file `index.html` (headline: “Know what your restaurant will sell before
the day begins.”). Vercel ships that file. It is not the Svelte one-pager
under `src/`.

The operator console is a separate repository (TooeyApp).

## Run it

```
python3 -m http.server 5173
```

Then open http://localhost:5173

`npm run build` copies `index.html` into `dist/`, which is what Vercel
publishes.

## Layout

| Path | Holds |
| --- | --- |
| `index.html` | The live page. Copy, layout, and styles all live here. |
| `src/` | An unused one-page Svelte draft. Editing it does not change the live site. |
