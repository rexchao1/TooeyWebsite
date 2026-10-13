# 04 · Glass box

Preview: serve the repo root (`python3 -m http.server 5204`) and open
`/explorations/04-glass-box/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey is restaurant software that tells the owner what goes into every
number, and leaves the line blank when it can't call one.

## 2. Core message, and why

**You can see the wiring.** Owners have heard "AI" too often to trust a
number on the word of a label. So the site never asks for trust. It shows
the four inputs (and says they are the only four), shows the three that are
not plugged in yet, and makes the blank line, Tooey's refusal to guess, its
signature. The line "Software like this gets called AI, which tells you
nothing about what it actually looks at" is the pivot of the page.

The headline names the company's way of working, not a feature, so it
stays true as Tooey grows past prep. The lead then says what exists today:
a count for each dish every morning.

## 3. What the visitor understands first, and the journey

First screen: the headline, a short lead, and the whole machine in one
diagram. Four coloured inputs (your own sales, day of the week, time of
year, holidays) run as wires into a clear box marked "Tooey, overnight".
One line comes out and runs down a sample prep list as a rail. Each dish is
a stop on it: a filled dot where a count came out, an open ring where the
line was left blank on purpose. Weather, local events and reservations sit
beside the inputs as unplugged leads. A numbered key explains Predicted,
Prep, vs. last Tue and the blank. In one look the owner sees what goes in,
what comes out, and what is left out.

Then, as stops on one route down the page (a thin line with a ring at each
heading; the last stop, the start section, is filled):

1. **What goes into a count.** Pick a dish to see its inputs (eight past
   Tuesdays as bars, the day, time of year, holidays) merge into what came
   out. Two dishes come out blank, each for its own reason. One line on
   what isn't plugged in: "Tooey doesn't know there's a game downtown
   tomorrow… You do."
2. **A blank is a decline, not a zero.** The two rules and why a guess would
   be worse.
3. **Each night, and the morning after.** Two tracks, Tooey and You, with a
   stop for each time of day. An open ring marks the honest "Nothing". Then
   "The list is a count, not an order."
4. **Where Tooey is going.** A line map. Four lines (prep and operations,
   staffing, profitability, growth) each run through Forecast, Recommend
   and Act. Only the first stop on the prep line is filled. Every other
   stop is an open ring marked "Not built".
5. **What it takes to start.** A short ledger beside the contact form.

## 4. How it builds trust

- One visual rule, used everywhere: **filled = in use today, open ring =
  left out on purpose.** That covers blank dishes, unplugged inputs, idle
  moments in the night, unbuilt parts of the roadmap, and "Never" on the
  privacy page. There are no decorative marks.
- Every claim can be checked against what the owner will receive. The
  accuracy line says plainly that it hasn't been measured at a live
  restaurant.
- The example values agree with each other. Cheeseburger's last Tuesday is
  39, and 42 against 39 is the +8% on the list. Caesar (26 to 24, −8%) and
  soup (14 to 17, +21%) check out too. Prep is always a little over
  Predicted, by a varying amount.
- Every sample is labelled as one ("Example", "A sample restaurant's list.
  The numbers are illustrations, not results.").
- No figures, testimonials, logos, badges or integrations. "Free" appears
  once.

## 5. Design and interaction rationale

- **Wiring, not paper.** A glass box should show what's inside it, so the
  product is drawn as the path a number takes rather than as a document.
  The input wires stay visible inside the box, softened by its tint, and a
  solid nameplate says what happens there. The input colours appear only
  where an input does: the wires, the colour bars on the worked example's
  input rows, and the sales bars.
- **Palette.** Sea-glass green ground (#d9e7de), the tint you see at the
  edge of a pane of glass, with bottle-green ink (#0f2a20). The four input
  colours are terracotta (sales), cobalt (day of week), plum (time of year)
  and ochre (holidays). Grey is kept for things that are switched off. No
  white cards, cream, black or navy.
- **Type.** Overpass with Overpass Mono for figures (both OFL, about 60 KB).
  Overpass comes from Highway Gothic, the lettering of road signs: type
  built to be read at a glance and to point the way. That fits a diagram
  you follow along a line, and it stays plain for a nontechnical reader.
- **Shapes.** Pill buttons that carry the ring mark, and rounded glass
  panels with hairline edges. The contact card has the same thick outline
  as the glass box.
- **Interactions.** Only where they explain something. JS draws the wires
  from the real layout: left to right on wide screens, top to bottom
  (inputs dropping into the box, the rail running down the list) below
  1180px, redrawn on resize. The dish picker is an ARIA tablist (arrow
  keys, Home and End) whose bars grow in briefly. The phone menu closes on
  Escape or on link tap.
- **Fallbacks.** Without JS the diagram shows its parts without wires, all
  five worked examples show stacked, the nav wraps, and the form posts
  straight to FormSubmit. Under reduced motion all animation is off.

## 6. Illustrative vs. factual

Illustrative (example values for a sample restaurant): every dish name and
number, the eight-Tuesday histories, the per-dish time-of-year remarks,
"Mid-October", and "None this week".

Factual (from the brief): the four inputs and the three not used, the
nightly recompute, Predicted and Prep (a little over, size not stated), the
change against the same weekday last week, grouping by category, the blank
rules and "a blank is a decline, not a zero", the email before prep and
printing, about five weeks of history, about a week of setup and what
happens in it, the pilot and "free for now", the accuracy line, the student
team, Tooey LLC, the contact details, and every privacy statement.

Interpretations to confirm:
- "Tuesdays against Tuesdays" puts the day-of-week input in plain words.
- The worksheet's "last Tuesday: 39" assumes the change column is measured
  against last week's sales.
- The diagram shows all four inputs feeding every dish. That is true of
  the inputs, but it says nothing about how they are weighed, and the
  copy doesn't either.

## 7. Strengths, weaknesses, open questions

Strengths
- The identity comes straight from the idea: what goes in, what comes out
  and what is left out are visible at once, in one diagram an owner can
  follow with a finger.
- One mark (filled or open) carries the honesty through every section.
- Shorter than the first version (about 5,700px tall at 1440 wide, down
  from 6,800).

Weaknesses
- The hero diagram is dense on a phone, with four input chips, the box,
  the list and the key. It reads top to bottom, but it is a lot to take in
  above everything else.
- The wires depend on JS. Without it the glass box is an empty frame
  beside its nameplate.
- The input colours carry meaning, but every one also has a text label, so
  the diagram never relies on colour alone.

Open questions for the founder
- Is it OK to say "Accuracy: not measured yet at a live restaurant"?
- Is the tone of "Software like this gets called AI" right?
- Is the change column against last week's sales or last week's
  prediction?
- Is the forecast / recommend / act line map a framing you want public?
- `og:image` is relative (`assets/og.png`). It needs an absolute URL once a
  domain is chosen.

## 8. Stack

Hand-written static HTML, CSS and JS. No build step and no dependencies.

```
index.html, privacy.html
assets/site.css      all styles
assets/site.js       nav, wire drawing, tabs, contact form
assets/fonts/        Overpass + Overpass Mono, latin, variable (OFL.txt)
assets/logo.png      copied from the repo root
assets/favicon.svg   drawn for this exploration
assets/og.png        1200×630 share image, rendered from the real diagram
```

The fonts came from `@fontsource-variable/overpass` and
`@fontsource-variable/overpass-mono` (latin `wght` files).

## Revision

The first version looked too much like the other explorations: cream
paper, near-black type, a black button, a white prep-list card as the hero,
and hatching for "not built". It now takes its look from the concept
itself.

- **How the product is shown.** It was a printed sheet with notes. Now it
  is the path a number takes: coloured input wires into a clear "glass
  box", and one line out that becomes the rail of the list. The leader-line
  notes became a numbered key under the list. The wiring took over their
  job of connecting things.
- **The "left out on purpose" mark.** Hatching became a filled dot vs. an
  open ring, the same everywhere: blank dishes, unplugged inputs, idle
  moments in the night, the roadmap (now a line map instead of a grid),
  and privacy's "Never".
- **Palette and type.** Cream, black and blue became sea-glass green with
  bottle-green ink and four input colours. Atkinson Hyperlegible became
  Overpass and Overpass Mono. Rectangles became pills and rounded glass
  panels. Sections now hang on one route line with a ring at each heading.
- **Tightened.** I cut the separate four-inputs strip (the hero diagram
  shows them), the "signals" block (folded into one sentence), the
  bordered "count, not an order" box, and the repeated "redone each night"
  footnote. Leads and the blank section are shorter. Spacing between
  sections went down.
- **Unchanged.** The headline, every claim, the worked examples, the two
  blank rules, who does what overnight, the one-live-stop roadmap, the
  terms, the form and its states, and the privacy facts.
