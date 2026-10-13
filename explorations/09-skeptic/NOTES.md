# 09 Straight talk (round two)

## Concept
Tooey's real sentence starts out buried in an AI sales pitch, and the pitch falls apart while you watch.

## Signature motion
- **How it plays:**
  - The h1 loads as a 29-word pitch. The 15 true words are set in full navy ink. The 14 hype words are in a duller brown, set slightly crooked, and wobble a little, so they read as loose from the first frame.
  - At about 1.4s the commas fade. The hype words then come off in rough reading order, about 62ms apart. Each one becomes a matter-js rigid body sized to its ink: ascenders, x-height and descenders are taken from Archivo's metrics.
  - The words fall under gravity and drift toward their own patch of floor. They pile up on the top edge of the navy band. A word left standing on its end flops over, so the heap stays low.
  - The true words close up around "exactly" using FLIP. "Exactly" shivers by itself, tips, and drops last.
  - The sentence then grows from the pitch size to the display size by tweening its font size. It re-sets line by line, so no words cross each other.
  - Then the subline, "Try it free" and "Undo" appear.
- **Interaction:** with a mouse you can grab and fling the heap words. On touch a tap tosses a word up, and the page still scrolls. "Undo" flies every word back into the pitch and drops it again.
- **Reduced motion:** the same physics runs to rest off screen with a fixed seed, and only the settled heap is drawn. Nothing moves, and the pile is the same on every visit.
- **No JS:** the plain sentence shows above a CSS-only pile of the same words.
- **Files:** `pitch.js` (GSAP 3.15 core, matter-js 0.20, both in `vendor/`).

## Palette
| Name | Hex | Use |
|---|---|---|
| Mustard | #F0C23B | ground |
| Navy | #14213D | ink, and the floor band |
| Dull | #6A5420 | loose hype words |
| Spent | #A27A17 | the heap (decorative, aria-hidden) |
| White | #FFFFFF | form fields |
| Ketchup | #8E1F17 | form errors |
| Pickle | #24502F | form success |

## Type
Archivo variable (OFL, self-hosted, 90 KB, width and weight axes), one family.
- Display: 800 at width 112%, dropping to 100% under 720px.
- Body: 430–500 at width 100%.

## Words
147 visible words on the home page, counted in the browser. That excludes nav, form labels and footer, and includes all 29 words of the pitch, the numbers in the example list, and "Undo".

## Illustrative vs factual
- Illustrative, and labelled "Example email": the dishes and the counts in "Prep for Tuesday".
- Factual:
  - the description of the product
  - the blank for a new dish
  - free pilot, no price
  - POS connection with most systems, about a week of setup
  - the owner checks the counts and decides
  - sales data not sold, shared or published
  - a few university students
  - privacy terms
- No figures, no weather, no testimonials.

## Weaknesses
- **First frame:** for about 1.4 seconds the biggest words on screen are hype. The brown and the tilt help, but a screenshot taken at that moment could still be quoted out of context.
- **Phones:** on short screens (320 to 390 wide) the heap lands below the fold, so most of the fall happens partly out of view.
- **Undo:** the close-up back into the pitch still uses a FLIP, and words cross each other mid-move for about half a second.
- **Example list:** it leaves out the "vs. last week" column and the category grouping to stay under 150 words.
- **No-JS:** the pile there is a tidy CSS wall rather than a real heap.

Page weight is about 350 KB, all local.
