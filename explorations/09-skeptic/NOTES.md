# 09 · Straight answers

Exploration for a guarded owner who has been sold software before. Two
pages: `index.html` (home) and `privacy.html`. Hand-written HTML, CSS, and
a small script; no build step.

Preview from the repo root: `python3 -m http.server 5209`, then open
http://localhost:5209/explorations/09-skeptic/

## Revision (second pass)

Review feedback: strategy, structure, and copy were right, but the look
(cream paper, near-black headlines, a white card with the sample list as
the hero, dashed outlines for "example / not built") had converged with
other explorations. Fourteen answers also made a long phone scroll.

What changed:
- **The conversation became the identity.** The page is now a table with
  two sides. Left, on a cobalt field running the full height of the page,
  is the owner. Right, on cool kitchen-steel grey, is Tooey. Every element
  belongs to one side: questions, buttons, the stop email, and the contact
  form are the owner's (cobalt); answers, the sample list, and explanations
  are Tooey's (steel and leaf green).
- **Two typefaces, one per voice.** The owner speaks in Newsreader italic,
  a spoken, human serif. Tooey answers in Archivo, semi-condensed and
  heavy for the short answers, plain width for the text. Gone: Atkinson
  Hyperlegible, cream, the near-black ink, and the dark button.
- **The hero is the first exchange.** "“Okay. What is Tooey, exactly?”" on
  the owner's side; the headline answers it on Tooey's. No product card in
  the hero.
- **Two lists face each other.** Second screen: the owner's list of
  questions (the index) on cobalt, opposite Tooey's list (the sample prep
  list), set as plain type on the steel with no card or shadow.
- **"Not built" is said, not drawn.** The dashed-outline device is gone.
  Where something isn't built, the owner asks for it and Tooey answers
  "Not yet." in the same two voices ("Does it know about the weather?"
  Not yet.). The example list is labeled the same way, in a sentence:
  "Made-up numbers, for a sample restaurant."
- **Your question stays in view.** On wide screens each question sticks at
  the top of the owner's side while you read the answer. On phones the
  turns stack as alternating cobalt and steel bands.
- **Fourteen answers became ten.** Merged: the AI question with where the
  number comes from; "will it be right" with "how accurate" (now one
  answer: "Not every day, and we haven't measured how often."); blank
  dishes into "what exactly do I get"; time with typing and POS. The
  phone page is about 8% shorter at 390 and 320 wide (each turn now adds
  a cobalt band, which costs some of the saving), and every merged fact is
  still there.

## 1. Positioning in one sentence

Tooey is a small team that works out the numbers an independent restaurant
runs on, starting with each morning's prep count. It tells you what it is,
what it isn't yet, and how to leave before it asks you for anything.

## 2. Core message, and why

"Here is exactly what you'd get, and here is every catch." A skeptic
doesn't believe a promise, but a plain admission costs us something, so
they believe it. The strongest lines are the ones that don't flatter
Tooey: "We can't promise that." "Not every day, and we haven't measured
how often." "It's early. That's the catch."

The headline names the company broadly ("works out the numbers an
independent restaurant runs on") and grounds it at once in what exists
("starting with how much of each dish to prep"), so forecasting doesn't
read as the whole company.

## 3. What the visitor understands first, and the journey

First screen: the owner's question and Tooey's one-sentence answer, then
what arrives today (one email each morning before prep, a count for every
dish, from your own sales). Second screen: the ten questions opposite the
sample prep list, so the owner sees the actual thing before any answer.

Then ten exchanges, in about the order an owner has the doubts: who you
are; will you be around; what exactly do I get; is this another AI thing;
will the count be right; how much of my time; what you do with my sales;
what's the catch; how do I stop; is a prep list all it'll ever be. It ends
with the form under "Ask us what this page didn't answer." The form sits
on the owner's side: it's their turn to talk.

## 4. How it builds trust

- Short answer first, at headline size. You can scan the green lines alone
  and get the whole picture.
- It says what it doesn't do every time it comes up, in the owner's own
  words: weather, events, reservations, margins, costs, regulars,
  staffing, each answered "Not yet."
- No figures at all: "there's no accuracy figure, savings figure, or
  percentage anywhere on this site."
- The exit is shown before the entrance. "How do I stop?" includes the
  stop-and-delete email already written, on the owner's cobalt, with a
  button that opens it.
- The student question is answered with a fact (Tooey works from a copy;
  your POS is untouched), not a vow.
- "Sending this signs you up for nothing" next to the form.
- No testimonials, logos, badges, stock photos, or fake dashboards.

## 5. Design and interaction rationale

Palette, all from the conversation:
- Cobalt `#2335ac`: the owner. Fields, questions, buttons, the email you'd
  send, the form. White text on it is 9:1.
- Kitchen steel `#e7e9eb`: Tooey's side and the page chrome. Cool and
  plain, the colour of a prep counter, not paper.
- Leaf green `#123b2b`: Tooey's voice, from the wordmark's leaf. 10:1 on
  steel.
- Body text `#222c27`, secondary `#4c5751` (6:1 on steel). The only other
  colour is a pale coral for form errors on cobalt.

Type: Newsreader italic (owner) and Archivo (Tooey), both OFL, self-hosted
and cut down to the ranges used (Archivo width 75 to 100, weight 400 to
800; Newsreader italic 400 to 500). Neither is on the founder's
rejected list, and neither is what the live site uses.

Composition: on screens 900px and wider the cobalt runs from the window's
left edge to the split at 35% of the content width, the whole length of
the page. Questions sit left and stick while their answer scrolls; answers
sit right. Below 900px each turn is a full-width cobalt band followed by
a steel band, so the back-and-forth reads as rhythm.

Interaction, kept small:
- Sticky questions on wide screens.
- Jumping from the index to an answer briefly lights the answer side (a
  still highlight under reduced motion). Smooth scroll is off under
  reduced motion.
- Phone menu with the email address in it; focus moves into it and back.
- "Print the answers" (shown only with JavaScript): a print stylesheet sets
  the conversation in two plain columns, ink only, no nav or form.
- The form keeps what you typed if sending fails. Without JavaScript it
  still posts to FormSubmit's normal endpoint, the phone nav shows as plain
  links, and all content is there.

## 6. Illustrative vs. factual

Illustrative (said so on the page: "Made-up numbers, for a sample
restaurant"):
- Every dish, number, category, and the day on the sample prep list.
- The wording of the stop email (the address and the action are real).
- The owner's questions in the "Not yet" lists are phrased by us; each
  names a direction from the brief, and each is answered "Not yet."

Factual (from the brief, nothing added): small team of university
students; Tooey LLC; pilot; free for now; no price or trial length set;
Predicted, Prep (a little over Predicted, cushion not sized), change from
the same weekday last week, grouped by category, emailed each morning
before prep, printable; blanks for dishes under about five weeks on the
menu or under about one sale a day, a blank is a decline; inputs are past
item sales, day of week, time of year, holidays, not weather, events, or
reservations; nightly POS download set up by the team, most systems,
Square/Toast/Clover exports recognized, others mapped; about five weeks of
history; about a week of setup; privacy facts; accuracy not measured at a
live restaurant.

Lines that go slightly past the brief's wording, for the founder to check:
- "Tooey works from a copy of your sales, so your POS and the way you prep
  stay as they are." (Inferred from "nightly download".)
- "You'd be one of the first kitchens using it." (Inferred from "pilot".)
- "If Tooey sounds like a fit, we talk through your kitchen and your POS
  before anything is set up."
- "There's a forecasting model behind the list."

## 7. Strengths, weaknesses, open questions

Strengths
- It looks like what it is: a conversation. The two-voice system carries
  meaning, so no decoration is needed.
- The answers do the selling by not selling.
- The product is on the second screen; the vision is visible but every
  item of it is answered "Not yet."

Weaknesses
- Cobalt is loud. Half the screen is one saturated colour; some owners may
  find it a lot. A deeper navy would calm it at some cost to the
  "two people talking" read.
- On wide screens the owner's side is mostly empty colour below each
  question. That is the point (they ask, we explain), but it is a lot of
  blue for few words.
- The questions are visible, in quotes. The founder has disliked question
  headlines; here the headlines are the answers and the questions are the
  owner's side of the table, but it's still a judgment call.
- `og:image` is a relative path, per the folder rules; social previews need
  an absolute URL once there's a real domain.

Open questions for the founder
- Are you comfortable saying "Not every day, and we haven't measured how
  often" and "We can't promise that" this plainly?
- Is the stop email right: stop the download, delete sales and messages,
  all in one email?
- Is "one of the first kitchens using it" accurate for the pilot?
- Keep the phone field on the form?

## 8. Stack

Hand-written static files, no build:

- `index.html`, `privacy.html`
- `assets/site.css`: all styles, including print
- `assets/site.js`: phone menu, print button, contact form (JSON to
  `https://formsubmit.co/ajax/tooeyteam@gmail.com`, with sending, sent,
  and failed states)
- `assets/fonts/`: `archivo.woff2` (58 KB) and `newsreader-italic.woff2`
  (42 KB), Latin subsets from fontsource, cut to the axis ranges used with
  fontTools' instancer, with their OFL licenses
- `assets/logo.png` (copied from the root), `assets/favicon.svg` (cobalt
  and steel with a green "t", no font dependency), `assets/og.png`
  (1200x630)

To recut the fonts: take the fontsource variable Latin files and run
`fontTools.varLib.instancer` with `wght=(400,800), wdth=(75,100)` for
Archivo and `wght=(400,500)` for Newsreader italic, saving as woff2.
