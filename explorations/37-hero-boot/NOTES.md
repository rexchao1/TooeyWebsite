# 37 the hero boots

Site 35 with a new hero; everything below the hero (wording, sections, dialog, header, snapping, styles) is 35's as it stands, including 35's later phone fix for the closing bar. The only line of 35's CSS changed is the hero drawing's height (95vh to 90vh), so the building's wall clears the headline. New: `hero.js`, the `restaurant()` drawing and `BOOT` data in `scenes.js`, a hero block in `styles.css`, and a few lines in `site.js` that hand the hero to `hero.js`.

## The hero
The drawing is the restaurant cut open like a dollhouse: upstairs the office (a window, the forecast board, binders, a desk with a lamp); downstairs the dining room (two pendants, two tables, empty chairs), the counter with the till, and the kitchen (the prep sheet, the shift board, a range, a fridge). It starts in plain line. Then it boots, joined by one thin lamplight wire with a bright head:
- 0.1 s: the till's screen lights. "Sales in".
- 0.4 to 0.9 s: the wire climbs from the till up the wall to the forecast board. 0.9 s: the week's bars rise, Friday tallest and warmest. "Forecast ready".
- 1.3 to 1.7 s: down through the floor to the prep sheet. The counts are pencilled in (Short rib 27, Risotto 33, Burrata 19, Focaccia 12). "Prep sent".
- 2.2 to 2.3 s: across to the shift board. Shift blocks fill in. "Shifts set".
- 2.8 to 3.6 s: up to the ceiling and along it; each pendant switches on as the wire reaches it (about 3.3 s and 3.6 s), and four guests sit down. 3.8 s: "Open", and the desk lamp upstairs comes on.
- 4.2 s: booted. It rests running: the table candles breathe; nothing else moves. With a mouse, the cursor lamp then works as before.

The tags are small Schibsted Grotesk labels on a porcelain back with a lamplight dot, set beside each thing. "Example" sits under the forecast board. Under reduced motion the scene is drawn finished and lit, and the words are plain.

## The headline effect (for the founder to compare)
- `?text=type`: the headline types in about 1.2 s behind a thin slate caret, the line under it in about 0.9 s, the caret blinks twice and goes (about 3.4 s). The button fades in when the typing ends.
- `?text=flicker` (default): letters stutter on with brief flickers and a faint warm glow, settled by about 1.1 s; the line under it comes on word by word, more quietly.
- The real text stays in the HTML. While animating, the h1 and the line hold the real words in a visually hidden span and show an aria-hidden copy, one span per letter. Until the type has loaded the words wait, and show anyway after 3 s if the script never runs.
- `.review-switch`, bottom left of the hero ("Text: Typed / Flicker"), replays the whole hero with the chosen effect and writes `?text=` to the address. It is a review aid: remove the element and its CSS block before launch.

## Checked (37)
At 1440x900 in Chromium (Playwright), frames at 0.2, 0.6, 1.0, 1.6, 2.4, 3.2 and 4.5 s for both effects; the review switch replaying; the cursor lamp after the boot; reduced motion. At 390: no horizontal scroll in either effect, after the boot. No console errors.

## Weakness (37)
At phone width the drawing is a strip about 280px tall: the tags are about 5px type and unreadable, and the shift board is cropped at the right edge. It needs its own crop there, or the tags dropped below a width.

---

# 35 the operating system

Site 34 (the lit room), revised to the founder's notes in three passes. 34 stays as it was for comparison. The look is unchanged: porcelain ground, slate line drawings, lamplight washes, the cursor lamp, Literata / Source Serif 4 / Schibsted Grotesk, and the hairline four-column grid. `draw.js` is 34's. In `scenes.js`, the street, prep, line and dining drawings are 34's. 34's "same Friday at close" drawing is gone, and a new street of independents (`indies`) takes its place.

## The page, top to bottom
1. **Header.** Fixed at the top at every scroll position, on porcelain with a hairline bottom rule. The column rules carry on through it. It holds "What it does", "Pilot" and the "Try Tooey free" button.
2. **Hero.** "Your new restaurant operating system." Under it: "Tooey runs prep, shifts and slow nights from your own sales, so you make more and manage less." A "Try Tooey free" button follows. The street drawing and its load animation are 34's.
3. **What Tooey does** (`.work`, `#what`). One pinned section. The drawing sits on the left, bleeding off the page edge. On the right is the section's heading, "What Tooey does" (Literata, section-heading size), with its lead line "Every day, from your own sales, Tooey works out three things for you." Under the heading, the three items Prep, Shifts and Growth are stacked as a list.
   - The heading stays visible through the whole pin.
   - The active item is full ink, the other two sit at 30%, and a slate hairline draws along the top of the active one.
   - The drawings cross-fade (0.75s), and each scene replays its own animation when it becomes active: counts pencilled onto the prep sheet; a ticket prints and a third cook steps on; the pendants come on and a guest sits.
   - Clicking an item jumps to it.
   - Pinned only with motion on a screen at least 761×560. Otherwise the heading comes first, then each drawing beside its words, finished.
   - Each step has a resting place: Prep where the pin begins, Shifts half way, Growth where the pin ends. A step is active for the band around its resting place, so snapping never changes which step is showing. The section is 340vh tall, which leaves about 2.4 screens of pinned scroll.
4. **Built for independent restaurants** (`.indie`, `#who`). This replaces "Closer than a guess". It is laid out differently from the pinned section: the words sit above and the street runs the full width below.
   - The heading and a short paragraph (chains have planning teams, an independent has the owner, Tooey does that planning) take columns 1–2.
   - Two points take columns 3 and 4: "One location or a few" and "Your own sales, nobody else's".
   - The drawing is four independent shopfronts side by side: a brick trattoria with arched windows, a striped awning and a blade sign with a glass on it; a board-fronted café with a cup on its fascia, globe lamps and a guest at a pavement table; a stone bistro with shutters, paned doors and café curtains, with a cloche on its fascia; and a plastered taqueria with a curved parapet, a painted sun, papel picado, string lights, a walk-up window with tiles under the counter, and a cactus. None has a real name.
   - Each shop's washes carry their own threshold (`--s`) on a short ramp (`.w.shop`), so as the street scrolls in the lamps come on shop by shop, scrubbed by scroll. The cursor lamp works here as on every drawing.
   - "No new hardware" (one of the founder's examples) is left out. Nothing on the site supports it yet.
5. **How to start.** 34's three steps and "Free during the pilot."
6. **The close.** A small line, "Free during the pilot. About a week to set up.", over one wide lamplight bar spanning all four columns. The bar reads "Try Tooey free" in Literata at display size, with a drawn arrow. On hover the lamplight deepens and the arrow moves on a little.
7. **Footer.** The slim basalt base from 34.

## The dialog
"Try Tooey free" in the header, the hero and the closing bar opens a `<dialog>` (showModal) on porcelain with a slate hairline border. Its heading is "Try Tooey free". The line under it reads "Tell us about your restaurant and we'll set up your free pilot. We reply by email."

The form is 34's, unchanged: name, restaurant and email required; `_subject`, `_template`, `_captcha` and the `_honey` honeypot; a JSON POST to FormSubmit's ajax endpoint; sending, sent and failed states, with a mailto fallback. The submit button reads "Start my free pilot".

Focus goes to the first empty field. Escape, the close button, or a click on the backdrop closes it, and focus returns to the button that opened it. The page behind it does not scroll. Arriving at `./#talk` (the privacy page's nav button) opens it. Without scripts, every "Try Tooey free" is a mailto link.

## Snapping
Snapping is done in script, not with CSS scroll-snap, so it never fights the visitor:
- **Resting places:** the top of each section (under the header), each pinned step, and the very bottom of the page, so the footer is never trapped.
- **When it eases:** after 150ms with no scrolling and no finger, mouse button or drag held, the page eases (0.6s, cubic ease-out) to the nearest resting place, if that place is within 0.75 of a screen.
- **Interrupts:** any wheel, touch, key or pointer input cancels an ease mid-way.
- **Clicks:** a plain click never moves the page.
- **Off:** under reduced motion, and while the dialog is open.

## Words
Visible words in `main`: 194, not counting the sr-only table, the nav, the footer or the dialog. The prep sheet drawn in the picture adds about 16. The nav and footer add about 10, so the home page shows about 220. The dialog adds 19 when open, not counting form labels.

## Checked
At 1440×900 in Chromium (Playwright), with FormSubmit stubbed:
- **The header** at the top, mid-pin and at the end.
- **The pinned section** with its heading at each step, and the cross-fades.
- **Snapping, after it settled:**
  - between the hero and the pin
  - between Prep and Shifts, past the boundary (lands on Shifts)
  - between Shifts and Growth, before the boundary (eases back to Shifts) and past it (lands on Growth)
  - between the pin and the independents section
  - between the independents and How to start
  - an ease interrupted by a wheel stops at once
  - the bottom of the page stays put
- **The independents street** scrubbing in, shop by shop, and at rest.
- **The closing bar** at rest and on hover.
- **The dialog**, empty and sent.
- **Reduced motion:** no pin and no snapping.

At 390 the only check was overflow, and there is none.

Screenshots taken during an ease show the fixed header a few pixels low. That is a capture artifact: logging the header's position every frame shows it stays at 0.

## Weakness
The pinned section is still long for three short lines, and the snapping makes the long middle step (Shifts) feel slightly sticky to a fast scroller. At phone width the street of shops shrinks to a strip about 130px tall and its detail is lost; it needs its own crop there.
