# 05: The invitation

**Concept.** The home page is one folded invitation card lying on a banquette-red tablecloth under a warm overhead light. The cover says Tooey is choosing its first restaurants and what it does. Opening the card shows the terms on the inside left and an example morning count on the inside right. The reply card under it is the form.

**Signature motion.** Scrolling opens the card.
- **How it is built:** the card is real DOM (CSS `preserve-3d`), so its text stays selectable, readable by screen readers, and readable without script.
- **The physics:** scroll only sets a target angle for the cover. A soft, slightly underdamped spring (`invite.js`) carries the cover there, capped at about 430°/s so it turns like heavy stock. The table is a hard stop at 0° and 180°, so the cover lands with a small bounce.
- **Lighting:** each frame computes the face normals against a fixed lamp direction. That shades each face and puts a soft-light sheen on the cover as it passes the light. The cover's shadow is projected along the light: first across the inside page, then across the cloth.
- **Camera:** it settles from a 17° tilt to square-on as the card opens, and the spread slides so it ends centred.
- **Phone (under 700px):** the cover hinges on its top edge and the spread scales to fit.
- **Reply card:** it scrolls up from under the open card's bottom edge and stays tucked under it.
- **Load:** the lamp comes up and the card drops the last few centimetres onto the table with a small bounce.
- **Idle hint:** at the top, if the page sits still, the cover's edge lifts a few degrees every ~6.5s until the visitor first opens it.
- **No libraries:** none were needed, so none are vendored.

**Reduced motion and no JS.** The designed flat state shows the closed card, then the card lying open, then the reply card. It tells the same story with no motion. If the script fails to start within 4s, the page falls back to this layout.

**Live name.** Typing in the form's Restaurant field rewrites "at your restaurant" on the count. The weekday on the count is tomorrow's real weekday.

**Palette.**
- Banquette #6b1e24 (cloth)
- Banquette deep #3a0e12 (footer, shadows)
- Linen #f3eae2 (text on cloth)
- Cotton stock #faf8f4 (card)
- Ink #1d2b4a (all type on the card)
- Spoon #c99a5b (focus rings, from the logo)

**Type.** Ibarra Real Nova (OFL, self-hosted: 400, 400 italic, 500, 600), one family throughout. The headline is set at a size tied to the card width. Italic is used only for the card's handwritten-feeling parts: the day line, the column heads, and "Example". The count uses menu dot leaders. The wordmark on the cover is blind-embossed (the logo used as a mask, with light and dark drop shadows).

**Word count.** 106 visible words on the home page, excluding nav, form labels and footer. Numbers in the example count as words.

**Illustrative vs. factual.**
- **Illustrative:** every dish and number on the count, which the page labels "Example".
- **Factual:** everything else, taken from the brief:
  - Free during the pilot.
  - About a week of setup.
  - Works with most POS systems.
  - The owner checks the counts against what sold, then decides.
  - Sales are used only for that restaurant's counts.
  - Blanks for dishes too new to call.
- **No figures:** there are no accuracy, savings, or "spots left" figures.

**Weaknesses.**
- At 320×568 the open spread is scaled to about 0.85, so the inside text reads at about 13px.
- Text on a 3D-transformed layer is slightly softer while it moves. It is crisp at rest, because the tilt reaches 0°.
- The pinned scroll is about 2.1 screens long. A visitor who only wants the form has to use the Apply link or scroll past it.
- The tablecloth is a CSS texture, not a photograph.
- The cover is rigid (heavy stock), so there is no paper bend.

**Removed in critique.**
- A pointer-follow tilt on the card. It is the generic "3D tilt card" effect.
- A turned-corner icon next to "Open". It read as a checkbox.
- Paper rectangles behind the dish names. The leaders were rebuilt as flex fillers.
- An over-stiff spring. The first version flipped the cover in about 0.2s, with no weight.
