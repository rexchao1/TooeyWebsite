# 38 the hero on a string (axonometric)

Site 35 with a new hero. Everything below the hero (wording, sections, dialog, header, snapping, styles) is 35's as it stands. Changed: the hero `<figure>` in `index.html`, the head script, which also adds `hero-wait`, and `hero.js` loaded after `site.js`. In `styles.css`, 35's `.scene-hero` rules are gone, the phone padding under the hero drawing changed, and a hero block is added at the end. `site.js`, `scenes.js` and `draw.js` are 35's, untouched (the street drawing in `scenes.js` is simply not used).

## The drawing
A three-quarter axonometric cutaway (true 30-degree projection, no perspective), drawn in `hero.js` from 3D boxes and cylinders in centimetres:
- A floor slab with 40 cm tiles, and two walls cut at about 2.4 m. The cut tops and the cut ends are a thin slate poche; the slab's front edges are light, with a fine line.
- The kitchen behind: a door with portholes in the left wall; a tall reach-in fridge against it (its door hinged at the back, so it swings open toward the viewer without hiding the shelves); a prep table with a board and a bowl under a shelf of jars; the range with its hood, a stockpot that steams, and a pan on the near burner; a cook in whites and dark trousers, no face.
- The front right: the counter with a wood top, the till (a tilted tablet on a stem) and a receipt printer; two stools.
- Tone: every vertical face is shaded, lighter facing down-left, darker facing down-right, with a soft vertical gradient. Blurred contact shadows under every object. Lamplight pools on the floor and on the counter multiply onto the paper. The pools drift and breathe very slowly (about 13 s and 33 s cycles). The camera never moves.
- No cursor lamp in the hero: the hero is not a `.scene[data-scene]`, so `site.js` never treats it as one.

## The string and the loop (10 s, then again)
One brass-coloured thread with a soft lamplight glow, strung between three small brass eyelets: on top of the till's screen, on top of the fridge, and hanging under the hood at the cook's station. Each span sags as a curve; the low points sway a few units, out of step with the loop. A bead runs round it; the stretch of thread just behind the bead burns brighter, and the span being run is a little brighter for its whole length. Each eyelet glows while its stop is acting.
- 0.0 s: the till's screen flares warm and a receipt curls out of the printer (0.15 to 1.1 s). The bead waits at the till.
- 0.9 to 2.7 s: the bead runs up to the fridge.
- 2.7 s: the fridge door swings open (0.65 s) and the inside lights. 3.05, 3.3 and 3.55 s: three tubs warm up in turn, one per shelf, and notes come in beside them with leader lines: "Example", Short rib 27, Risotto 33, Burrata 19 (the counts of 35's prep sheet).
- 3.9 to 5.5 s: the bead runs to the cook's station.
- 5.5 s: the pan flares (soft tongues and a warm halo, peak at 5.8 s, out by 6.9 s) while the cook tosses it. 6.1 to 6.7 s: the notes fade and the tubs cool. 6.3 to 7.1 s: the fridge door closes. 6.45 s: the cook turns from the range to face the pass (front view, one hand out). 6.8 s: a plate with a little steam sets down on the counter beside the till.
- 7.3 to 9.1 s: the bead runs back to the till; its eyelet glows as it arrives.
- 8.7 s: the cook turns back to the range. 9.3 to 9.9 s: the plate (served) and the receipt fade. 10 s: the next order, and it starts again.
- The loop pauses when the hero is off screen or the tab is hidden. `?t=<ms>` holds the loop at one moment, for review.

## The headline: a tape finding its tracking
"Your new restaurant operating system." and the line under it (220 ms behind, gentler) come in like a VHS tape locking on, about 1.45 s:
- 0 to 0.1 s: static only. Then the words flicker in.
- The colour channels split: a lamplight copy to the left, a slate-teal copy to the right, up to about 9 px, settling to nothing.
- The letters are cut into nine horizontal slices that jump sideways (up to about 35 px), re-cut every 55 ms so it reads as frames of tape.
- Scanlines, short horizontal streaks of static (dark and light), and a bright tracking band that wanders, all with soft edges and no box.
- A short vertical roll in the first 0.6 s that catches; one last small kick at about 1.25 s; then it locks clean. The button fades in at 1.25 to 1.65 s.
- After that, every 7 to 10 s, one small glitch under 250 ms: either a quick colour split or a single slice slipping 8 to 16 px. Measured: the first at about 11.0 s, lasting 160 ms.
- The real words stay in the h1 and the paragraph in a visually hidden span; the animated copies are `aria-hidden`. While the type loads the words wait, and they show anyway after 3 s if the script never runs.

## Fade
The drawing sits right of the headline and runs to the page edge. Its mask is a long ramp from fully clear at the drawing's left edge to fully drawn about a third of the way in, crossed with soft fades top and bottom, so the floor dissolves under and around the headline with no edge. The notes sit in an unmasked layer above the drawing, so they stay crisp. 35's cleared paper behind the words now stops at the words' own column.

## Reduced motion
No loop and no glitch. A still: the till lit with its receipt, the fridge open with the three tubs and notes, the pan gently lit, the cook at the pass, the plate up, the whole thread lit and all three eyelets glowing.

## Phones
The drawing sits above the words at 128 vw, cropping the right end of the range, with a soft fade on the left and the bottom. The notes are set larger there (about 11 to 13 px on screen).

## Checked (38)
At 1440x900 in Chromium (Playwright): the loop held at moments across it (0.6, 3.6, 3.7, 5.85, 6.0, 6.9, 7.4, 9.4 s) with 2x crops of the fridge, the cook and the till; live frames every second for 12 s; the headline at 0.1, 0.3, 0.6, 1.0, 1.5 and 2.5 s after it starts; the small later glitches logged by time. Also 1280x800, 1920x1080, 390x844 (held and live), and reduced motion at 1440 and 390. No console errors; no horizontal scroll at 390.

## Weakness (38)
The thread is a fine line on light paper. At 1440 it reads, but between runs it is quiet, and on a phone it is close to a hairline; the bead carries the story there. The tubs are small at any width, so the notes do the work of saying what lit up.

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
