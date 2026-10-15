# 35 the operating system

Site 34 (the lit room), revised to the founder's notes. 34 stays as it was for comparison. The look is unchanged: porcelain ground, slate line drawings, lamplight washes, the cursor lamp, Literata / Source Serif 4 / Schibsted Grotesk, and the hairline four-column grid. `draw.js` and `scenes.js` are 34's, untouched apart from their header comments.

## What changed from 34
- Hero: the headline is "Your new restaurant operating system." The line under it is "Tooey runs prep, shifts and slow nights from your own sales, so you make more and manage less." The headline size came down from 6.1vw to 5vw so it sets in three lines at 1440. The street drawing and its load animation are unchanged.
- Header: fixed at the top at every scroll position, on porcelain with the hairline bottom rule. The column rules carry on through it. The pinned blocks stick under it (`top: var(--top)`), and anchored sections have `scroll-margin-top: var(--top)`.
- Prep / Shifts / Growth: one section (`.work`, `#what`). With motion on a screen at least 761px wide and 560px tall, it pins under the header for about three screens (100vh + 3 × 95vh). The drawing is on the left, bleeding off the page edge and fading toward the words. On the right, the three items are stacked between hairlines. The active item is full ink and the other two sit at 30%. A slate hairline along the top of the active item fills as that step is scrolled. The drawings cross-fade (0.75s), and each scene replays its own animation when it becomes active: counts pencilled onto the prep sheet; a ticket prints and a third cook steps on; the pendants come on and a guest sits. Clicking an item, anywhere on it, jumps straight to that step. The section does not move, so the jump reads as a switch.
- Without the pin (reduced motion, no script, narrow screens), `.work-stage` and `.work-list` become `display: contents`, so each drawing pairs with its words in normal flow, finished. The step buttons are only added while the section is pinned.
- Talk to us: now a button in the nav, the hero and the closing section. It opens a `<dialog>` (showModal) on porcelain with a slate hairline border. The dialog holds 34's form with 34's logic: name, restaurant and email required; `_subject`, `_template`, `_captcha` and the `_honey` honeypot; JSON POST to FormSubmit's ajax endpoint; sending, sent and failed states, with a mailto fallback on failure. Focus moves to the first empty field. Escape, the close button, or a click on the backdrop closes it, and focus returns to the button that opened it. Page scroll is locked while it is open. Arriving at `./#talk` (the privacy page's nav button) opens it. Without scripts, each "Talk to us" is a mailto link instead.
- The basalt form band is gone. The page ends on "Tell us about your restaurant." and the button, with a little lamplight on the paper behind the button. The slim basalt footer is kept.

## Structure for later sections
Each section is a `section.sheet` in `main`, in order. The dialog sits after the footer, outside `main`. A new section needs only its markup and a block in `styles.css`. `site.js` draws any `.scene[data-scene]` it finds, and the pinned stepper reads its step count from `.work-item` elements.

## Words
Visible words in `main`: 145, not counting the sr-only tables, the nav, the footer or the dialog. Add the text drawn in the pictures (the prep sheet and the closer's labels, about 36), the nav and the footer, and the home page shows about 190. The dialog adds 17 when it is open, not counting form labels.

## Checked
At 1440×900 in Chromium (Playwright), with FormSubmit stubbed:
- the hero
- the approach to the pinned section
- each of the three steps, at the start and once its animation had played
- both scroll cross-fades, and the cross-fade after a click
- the click jumps (Prep, Shifts)
- the nav anchors ("What it does" lands on step 1, "Pilot" lands below the header)
- the closer, how to start, and the end of the page
- the dialog: empty, invalid, sending, failed, sent
- dialog behaviour: Escape, close button and backdrop all close it; focus goes into it and returns to its button; scroll stays locked; Tab stays inside it
- the privacy page, and its link back opening the dialog
- reduced motion: no pin, three rows, finished

At 390 the only check was overflow, and there is none (scrollWidth 390).

## Weakness
About three screens with the section pinned is long for three short lines of text. A visitor who scrolls fast passes through the cross-fades without seeing each animation finish, and the replays are hard to notice. The closing section is also very spare: one line and a button over a wide empty grid.
