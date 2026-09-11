# Tooey website

The public site at the root domain. Static HTML at the repo root. Vercel
ships those files. It is not the Svelte one-pager under `src/`.

The operator console is a separate repository (TooeyApp).

## Run it

```
python3 -m http.server 5173
```

Then open http://localhost:5173

`npm run build` copies the live HTML, CSS, JS, logo, favicon, and fonts
into `dist/`, which is what Vercel publishes.

## Layout

| Path | Holds |
| --- | --- |
| `index.html` | Home. |
| `how.html` | How Tooey works. |
| `about.html` | Who we are. |
| `privacy.html` | What the contact form (and partner data) is for. |
| `styles.css` | Shared type, color, and layout. |
| `site.js` | Nav, motion, contact form. |
| `logo.png` | The Tooey wordmark. |
| `src/` | An unused one-page Svelte draft. Editing it does not change the live site. |
