# 04 · Glass box

Preview: serve the repo root (`python3 -m http.server 5204`) and open
`/explorations/04-glass-box/`. Pages: `index.html` (home) and `privacy.html`.

## 1. Positioning in one sentence

Tooey is restaurant software that tells the owner what goes into every
number, and leaves the line blank when it can't call one.

## 2. Core message, and why

**What goes in is written down, and so is what doesn't.** Owners have heard
"AI" too often to trust a number on the word of a label. So the site never
asks for trust. It shows the four inputs (and says they are the only four),
names the three it does not use yet, and makes the blank line, Tooey's
refusal to guess, its signature. The line "Software like this gets called AI,
which tells you nothing about what it actually looks at" is the pivot of the
page.

The headline names the company's way of working, not a feature, so it
stays true as Tooey grows past prep (the founder rejected headlines that make
forecasting sound like the whole company). The lead then says what exists
today: a count for each dish every morning.

## 3. What the visitor understands first, and the journey

First screen: the headline, a three-sentence lead, and a sample prep list
marked up like a drawing. Four numbered notes, connected by leader lines,
explain Predicted, Prep, vs. last Tue, and a blank row. Within seconds the
owner sees what arrives, what each column means, and that some lines are
left blank on purpose.

The page then answers the owner's questions in order:

1. **What goes into a count.** The four inputs, then a worked example. Pick a
   line from the sample list (Cheeseburger, Caesar salad, Tomato soup, Short
   rib special, Lemon tart) to see eight past Tuesdays as bars, the day,
   time of year, holidays, and what came out. The last two lines come out
   blank, each for its own reason. Under it, the inputs not used yet
   (weather, local events, reservations) appear struck through: "Tooey
   doesn't know there's a game downtown tomorrow... You do."
2. **A blank is a decline, not a zero.** The two rules (under about five
   weeks on the menu, under about one sold a day), why a guess would be
   worse than nothing, and that a blank does not mean "make none".
3. **Each night, and the morning after.** Two lanes, Tooey and You, across
   After close, Overnight, Before prep, and Through the day. Each side has
   one cell that honestly says "Nothing". Then: "The list is a count, not an
   order." This is where "you stay in charge" is said, once.
4. **Where Tooey is going.** A grid of four areas (prep and operations,
   staffing, profitability, growth) against three stages (forecast,
   recommend, act). One dark square is live. The other eleven are hatched
   and say "Not built". Signals: today's four, then weather and local events
   later.
5. **What it takes to start.** A short ledger (cost, sales history, setup,
   accuracy, your data, who we are) beside the contact form.

## 4. How it builds trust

- It says what is not there. The not-used inputs, the "Nothing" cells, the
  hatched roadmap, and the accuracy line ("Not measured yet at a live
  restaurant, so we don't quote a figure") all do this. Every claim on the
  site can be checked against what the owner will actually receive.
- The example values agree with each other. Cheeseburger's last Tuesday in
  the bars is 39, and 42 against 39 is the +8% on the list. Caesar (26 to
  24, −8%) and soup (14 to 17, +21%) also check out. Prep is always a little
  over Predicted, by a varying amount, so no cushion size is implied.
- Every sample is labelled as one: an "Example" stamp on the sheet,
  captions under both pictures, and "A sample restaurant's list. The
  numbers are illustrations, not results."
- No figures, testimonials, logos, badges, or integrations. Each fact is
  said once ("free" appears exactly once).
- Privacy reuses the same in/out ledger as the rest of the site, with the
  "Never" rows hatched.

## 5. Design and interaction rationale

- **Drawing language.** The site borrows from an annotated technical drawing:
  pale green engineering-pad grid panels (the paper people "show their
  work" on), numbered callouts in one annotation ink (blue), thin leader
  lines, and **hatching as the single mark for "deliberately left out"**: the
  blank cells, the blank output, the not-used inputs, the idle lane cells,
  the unbuilt roadmap squares, and the "Never" rows on privacy. Once the
  owner learns the hatch on the first screen, it reads the same way
  everywhere.
- **Type.** Atkinson Hyperlegible Next with Atkinson Hyperlegible Mono for
  figures (both OFL, self-hosted, about 50 KB together). It was drawn so that
  characters can't be mistaken for each other (0/O, 1/l/I). That fits a
  site about trusting numbers, and a list read across a busy line. One
  family keeps the page calm. The mono is used only for counts.
- **Color.** Warm paper, near-black ink with warm grey for secondary text,
  the pad green, and one blue for notes and links. No gradients or glow.
  The wordmark keeps its own spoon and leaf colors.
- **Interactions.** Only where they explain something. On desktop the
  leader lines are drawn by JS from each note to its row; pointing at a
  note or a row lights the other. The worked example is an ARIA tablist
  (arrow keys, Home and End) whose bars grow in briefly. The phone menu
  closes on Escape or on link tap.
- **Fallbacks.** Without JS the notes sit under the sheet as a numbered key,
  all five worked examples show stacked, the nav wraps under the logo, and
  the form posts straight to FormSubmit. Under reduced motion, animation,
  transitions, and smooth scroll are all off.
- Section heads share one pattern (heading left, short lead right) so the
  page reads like a reference document. The blank section breaks it with a
  larger stacked head, because that idea is the brand.

## 6. Illustrative vs. factual

Illustrative (example values for a sample restaurant): every dish name and
number on the sheet and in the worked examples, the eight-Tuesday histories,
the per-dish time-of-year remarks ("Soup here has climbed most weeks since
September"), "Mid-October", and "None this week".

Factual (from the brief): the four inputs and the three not used, the
nightly recompute, Predicted and Prep (a little over, size not stated), the
change against the same weekday last week, grouping by category, the blank
rules and "a blank is a decline, not a zero", the email before prep and
printing, about five weeks of history, about a week of setup and what
happens in it, the pilot and "free for now", the accuracy line, the student
team, Tooey LLC, the contact details, and every privacy statement.

Interpretations to confirm: "Tuesdays compared with Tuesdays" and "Read
against your other Tuesdays" put the day-of-week input in plain words. The
worksheet's "last Tuesday: 39" reads the change column as being against last
week's sales (the brief only says "vs. the same weekday last week"). "Before
the kitchen opens" stands in for "before prep".

## 7. Strengths, weaknesses, open questions

Strengths
- The idea is specific to Tooey: a competitor could not paste "leaves the
  line blank when it can't" or the hatched roadmap onto their site.
- An owner sees the actual output in the first screen and can check the
  logic for themselves.
- Honest about being early without apologising for it.

Weaknesses
- The page is long, with five sections after the hero. Each is short, but a
  hurried owner may stop after the worked example. The hero and start
  section carry enough on their own.
- The two-part headline is long (four lines on desktop, about six on a
  phone).
- On phones the worked example is tall. The picker sits above it, so after
  picking a line the owner has to scroll to see what came out.
- The drawing language (grid, leaders, hatching) could feel technical to
  some owners. It is kept warm with paper tones and plain words, but it is a
  bet.

Open questions for the founder
- Is it OK to say "Accuracy: not measured yet at a live restaurant" in so
  many words? It is the strongest trust line on the site.
- Is "Software like this gets called AI" the right tone?
- Is the change column against last week's sales or last week's
  prediction? The worksheet assumes sales.
- Is the roadmap grid (forecast, recommend, act) a framing you want public?
- `og:image` is relative (`assets/og.png`). It needs an absolute URL once a
  domain is chosen.

## 8. Stack

Hand-written static HTML, CSS, and JS. No build step and no dependencies.

```
index.html, privacy.html
assets/site.css      all styles
assets/site.js       nav, leader lines, tabs, contact form (~200 lines)
assets/fonts/        Atkinson Hyperlegible Next + Mono, latin, variable (OFL.txt)
assets/logo.png      copied from the repo root
assets/favicon.svg   drawn for this exploration
assets/og.png        1200×630 share image, rendered once from the sheet
```

The fonts came from `@fontsource-variable/atkinson-hyperlegible-next` and
`@fontsource-variable/atkinson-hyperlegible-mono` (latin `wght` files). To
re-render `og.png`, screenshot a 1200×630 page that uses `assets/site.css`.
