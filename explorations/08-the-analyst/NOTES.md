# 08, The department

## Concept
A chain has a department reading its numbers every night. An independent restaurant has the owner. The page draws the chain's demand-planning org chart, collapses all of it into one person (the owner), and then lights Tooey beside them. Tooey's own small chart has dishes as its reports, with tomorrow's prep counts. The tone is dry, not a rant: the joke is the org chart.

## Signature motion
The sequence plays once when the stage comes into view, runs about 5.1 s, and ends with a Replay button. It does not scrub with scroll and uses no Lenis.

| Time | What happens |
|---|---|
| 0–1.6 s | "Demand planning" appears. Org-chart elbows draw down level by level. 88 person glyphs pop in, each with a damped-spring overshoot. |
| 1.6–2.1 s | The chart holds. |
| 2.1–3.1 s | The lines retract toward their parents. Every glyph is pulled into the owner along a curved, vortex-like path. The nearest go first, and each one shrinks, fades and shifts from lilac to espresso. |
| 3.0 s | The owner glyph lands with a spring. "Independents have the owner, after close, if at all." widens word by word, from Hubot Sans width 75 to 125 and weight 380 to 820. |
| 3.5–4.2 s | A wire drops from the owner and Tooey lights up as a tungsten point. |
| 4.1–5.1 s | Wires branch out to the dishes, and the counts tick up. Lamb special stays blank, with "new on the menu". |

**How it's built:**
- Plain SVG plus about 300 lines of vanilla JS, with no libraries.
- Every frame is a pure function of time, so replay and seeking are exact; `window.__tooey.seek(ms)` was used to capture frames.
- Springs are closed-form damped oscillators, and the collapse paths are quadratic Béziers.
- Each word sits in a fixed-width slot, so animating its width never reflows the line.
- Wire geometry is measured from the real HTML layout and rebuilt by a ResizeObserver.

**Fallbacks:**
- **Reduced motion:** a designed still. The full department chart sits above the owner → Tooey → counts, so the comparison reads top to bottom.
- **Without JS:** all the text and the counts render as HTML; only the wires are missing.

## Palette
The corporate cold is the room; Tooey is the only warm thing in it. (The ground was a deli pink until a revision. It moved to lilac because two other explorations had landed on a near-identical pink.)

| Name | Hex | Role |
|---|---|---|
| Memo lilac | `#DCD8EC` | The ground: the department's colour, made into the room |
| Deep lilac | `#46417F` | The department's chart, lines and label (6.5:1 on the ground) |
| Espresso | `#2C1A13` | Type and the owner (11.9:1) |
| Tungsten | `#F4A12E` | Tooey, the one warm light; it glows against the cold and has an espresso ring for contrast |
| Paper lilac | `#F1EFF8` | Input surfaces |
| Cocoa | `#5E3F33` | Secondary text (6.8:1) |

## Type
Hubot Sans variable (OFL, self-hosted, 93 KB, latin subset), and nothing else.
- **Width carries the meaning.** Width 75 is the chain's voice, used in the headline and the chart label. Width 125 is the owner's and Tooey's voice, used in the owner line, Tooey and the counts.
- **Counts** use tabular figures.

## Words
100 visible words on the home page. This counts the headline, lede, CTA, owner line, Tooey, the sample (numerals included), Replay, the pilot heading and paragraph, the form button and "Demand planning". It excludes nav, form labels and footer.

## Illustrative vs. factual
**Illustrative:**
- The org chart. Its 88 people, its four levels and the label "Demand planning" are a picture, not a claim about any chain's headcount.
- The dish names and counts, labelled "(example)".

**Factual (from the brief):**
- nightly POS read, and an email before prep
- blank with a reason for new dishes
- free pilot
- about five weeks of history and a week of setup
- the owner checks the counts against what sold
- the privacy terms

## Weaknesses
- "Chains have a team reading their sales every night" is a general framing, not a measured claim. Some chains do this with software rather than people.
- The narrow-to-wide word morph briefly shows gaps between the narrow words, at around 3.0–3.4 s.
- The hero's top row (headline left, lede and button right) is a conventional split. The stage is where the distinctiveness lives.
- The chart is decorative SVG (aria-hidden). Screen-reader users get the sentences, not the picture.
- The lamb row's blank is a heavy lilac em dash, which could be read as a bar.
