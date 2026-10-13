# 01 Margin

**Concept.** Every pan of prep sits between two losses: the one you scrape into the bin, and the sale that never prints. Tooey draws the line between them.

**Signature motion.** The pass, seen from directly above: a ticket rail, a steel hotel pan of portion cups, and a bin. On load, one over-prepped service plays by itself. The pan fills, tickets clip onto the rail and lift cups out, and at close the pan tips so the leftovers slide off its lip and drop into the bin. Then it is the visitor's call. They drag the line across the pan (or use the arrow keys on a hidden range input) to set the prep, and start service.
- Prep too little, and the tickets that come in after the pan is empty print blank. They hang for a moment as an embossed impression, then fade away, leaving the rail short.
- What goes into the bin stays there for the rest of the visit. A lost sale leaves no trace.

After the first call, Tooey's count is etched on the pan in green, and "Prep to Tooey's count" runs a service at that line. Demand is random on every run (14 to 17 cups), so no guess wins reliably.

Built on one 2D canvas (`scene.js`) with a small promise-based tween engine and hand-tuned easing: back-out on cups settling, quadratic acceleration for the slide and the fall, and a damped spring on the line. Cup and steel sprites are rendered offscreen at device resolution. No libraries.

Under reduced motion and without JavaScript, a designed still takes its place: three overhead panels (too much, too little, Tooey's line), built by `_src/triptych.mjs` and written into `index.html`.

**Palette.**
- Pass steel #D5DADC
- Well shadow #5E6A70
- Line ink #1F2A33
- Thermal #FAFAF7
- Braise #9C5B32
- Count green #2E6B4F (text in #245740)

**Type.** Big Shoulders Display 800/700 for headlines and captions: stamped, industrial, condensed. IBM Plex Sans Condensed 400/600 for text and controls, in the spirit of equipment labels. Both are OFL and self-hosted.

**Word count.** 134 visible words on the home page, counting every caption state the scene can show. A visitor sees about 125 at once. This excludes nav, form labels, the footer, and form status messages.

**Illustrative vs. factual.** The scene is an example service and is labelled "Example service". Cup counts, demand, and the cushion are made up, and there are no figures anywhere. "Lamb special / too new to call" is an example line. Everything else in the copy states facts from the brief.

**Weaknesses.**
- On phones the pan is tall and sits below the fold.
- Tooey's line always lands where the random demand leaves 1 to 4 cups, so it looks reliable. It is labelled as an example, but it still flatters the product.
- The "how" section is conventional next to the hero.
- The visitor only sees blank tickets if they prep low. The demo shows only the over-prepped side, though the prompt and the still cover both.
