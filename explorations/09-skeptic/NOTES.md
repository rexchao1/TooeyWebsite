# 09 · Straight answers

Exploration for a guarded owner who has been sold software before. Two
pages: `index.html` (home) and `privacy.html`. Hand-written HTML, CSS, and
a small script; no build step.

Preview from the repo root: `python3 -m http.server 5209`, then open
http://localhost:5209/explorations/09-skeptic/

## 1. Positioning in one sentence

Tooey is a small team that works out the numbers an independent restaurant
runs on, starting with each morning's prep count. It tells you what it is,
what it isn't yet, and how to leave before it asks you for anything.

## 2. Core message, and why

The core message is "here is exactly what you'd get, and here is every
catch." A skeptic doesn't believe a promise, but a plain admission costs us
something, so they do believe it. The site's strongest lines are the ones
that don't flatter Tooey: "We can't promise that." "Not every day." "We
haven't measured that at a live restaurant yet." "It's early. That's the
catch." Each of these makes the next answer easier to believe.

The headline names the company broadly ("works out the numbers an
independent restaurant runs on") and grounds it at once in the one thing
that exists ("starting with how much of each dish to prep"). Forecasting
does not read as the whole company, and the vision is held until the last
answer.

## 3. What the visitor understands first, and the journey

First screen: one sentence on what Tooey is, one on what arrives today (an
email each morning before prep, a count for every dish, from your own
sales), and a sample prep list labeled "Example values". In five seconds
an owner sees the actual thing they'd tape up on the line.

Then the page follows the doubts in about the order an owner has them,
grouped like a conversation across the table:

1. Who you'd be dealing with: students? still around in a year?
2. What arrives, and how far to trust it: the list, "AI thing?", inputs,
   "will it be right?", accuracy, blank dishes
3. What it takes from you: time, typing, your sales
4. The catch, and the way out: free, stopping
5. Where it goes from here: the vision, clearly marked as not built

It ends at the form, headed "Ask us what this page didn't answer." The
form is the last answer: the place for the doubt we missed.

An index of all fourteen questions sits under the section heading so the
owner who only cares about "what's the catch" can go straight there.

## 4. How it builds trust

- Short answer first, at headline size. You can scan only the big lines
  down the page and get the whole picture: "A small team of university
  students. We can't promise that. One list. Not every day. No."
- It says what it doesn't do, every time it comes up: weather, events, and
  reservations shown as dashed "not yet" chips; a missing accuracy figure
  stated outright; the price and trial length called unset.
- The exit is shown before the entrance. "How do I stop?" includes the
  stop-and-delete email already written, with a button that opens it.
- "What you'd lose if we disappeared" answers the student question with a
  fact (Tooey works from a copy; your POS is untouched) instead of a vow.
- No testimonials, logos, badges, figures, or stock photos. The only
  numbers on the site are example values, labeled as such.
- "Sending this signs you up for nothing" above the form.

## 5. Design and interaction rationale

Two voices, one rule each. The owner's questions are blue italic, in
quotes. Our answers are ink, large, upright. Blue is always "you": your
questions, and the buttons you press. That makes the Q-and-A read as a
conversation, not an FAQ. Question and answer are one heading
(screen readers hear "Who are you? A small team of university students."),
and nothing is collapsed: no accordions, no clicking to read.

Solid lines mean "exists today", dashed lines mean "an example or not
built yet". The sample list's "Example values" tag, the not-yet inputs,
the blank cells on the list, and the four future areas in the vision answer
all use the dashed line, with a small legend at the end. The honesty is
built into the drawing.

Nothing is tilted, hand-drawn, or animated in. Everything sits square on a
grid, on purpose: straight answers, straight lines. The only motion is a
short highlight on the answer you jump to from the index (a still tint
under reduced motion) and smooth scrolling (off under reduced motion).

Type: Atkinson Hyperlegible Next, with its mono for the numbers on the
list. It was drawn for the Braille Institute so letters can't be mistaken
for one another, which is the typeface version of the brief. It is OFL,
not one of the founder's rejected fonts, and not what the live site uses.
Its slashed zero is the one quirk; on a prep list it reads as a printed
count.

Color: warm paper (#f2eee6), green-black ink, one ballpoint blue
(#2445a2). Light and low-key, per the founder's notes. All text pairs pass
WCAG AA (smallest grey is 4.7:1 on the contact section's darker paper).

Small things that earn their place:
- The phone menu holds the email address as well as the links.
- "Print the answers" (shown only with JavaScript) uses a print stylesheet:
  sample list on page one, answers from page two, no nav or form. Owners
  show things to a chef or a partner on paper.
- The form keeps what you typed if sending fails, and says so.
- Without JavaScript, the phone nav shows as plain links, all content is
  there, and the form still posts to FormSubmit's normal (non-AJAX)
  endpoint.

## 6. Illustrative vs. factual

Illustrative (labeled "Example values" / "Sample restaurant"):
- Every dish name and number on the sample prep list, the day "Thursday",
  and the category names.
- The wording of the stop email (the address and the action are real).
- The vision cards' short descriptions paraphrase the brief's direction;
  each is marked "Not built".

Factual (from the brief, nothing added):
- Small team of university students; Tooey LLC; pilot; free for now; no
  price or trial length set.
- The list: Predicted, Prep (a little over Predicted, cushion size not
  stated), change from the same weekday last week, grouped by category,
  emailed each morning before prep, printable.
- Blanks for dishes under about five weeks on the menu or under about one
  sale a day; a blank is a decline, not a zero.
- Inputs: past item-level sales, day of week, time of year, holidays. Not
  weather, events, or reservations.
- Nightly POS download set up by the team; works with most systems; Square,
  Toast, and Clover exports recognized, others mapped. About five weeks of
  history; about a week of setup (what matters, how it's laid out, check
  it).
- Privacy facts, FormSubmit, who sees data, how to stop and delete.
- Accuracy not measured at a live restaurant.

Lines that go slightly past the brief's wording, for the founder to check:
- "Tooey works from a copy of your sales, so your POS and the way you prep
  stay as they are." (Inferred from "nightly download".)
- "You'd be one of the first kitchens using it." (Inferred from "pilot".)
- "If it sounds like a fit, we talk through your kitchen and your POS
  before anything is set up."
- "There's a forecasting model behind the list."

## 7. Strengths, weaknesses, open questions

Strengths
- The big answers do the selling by not selling. A skeptic can read the
  page in a minute by the large lines alone.
- The voice system (blue you, ink us) and the line system (solid today,
  dashed not yet) carry meaning, not decoration.
- The product is visible in the first screen, and the vision is visible
  but fenced off.

Weaknesses
- It is long: fourteen answers. Each is short, but the page is still a
  long scroll on a phone. The index and the parts help; cutting to ten
  (merging 06 and 07, 09 and 10) is the obvious trim if it feels heavy.
- It is quiet. There is one picture (the sample list) and three small
  diagrams. Someone wanting a showpiece hero won't find one; the bet is
  that a guarded owner trusts plainness more.
- The questions are visible, in quotes. That is a deliberate choice, and
  the founder has disliked question headlines before. The headlines here
  are the answers; the questions are the owner's lines beside them.
- `og:image` is a relative path, per the folder rules. Social previews need
  an absolute URL once there is a real domain.

Open questions for the founder
- Are you comfortable saying "We haven't measured that at a live restaurant
  yet" and "We can't promise that" this plainly? They are the heart of
  this direction.
- Is the stop email right: stop the download, delete sales and messages,
  all from one email?
- Is "one of the first kitchens using it" accurate for the pilot?
- Should the form keep the phone and POS fields? The POS question is
  useful; phone could go.

## 8. Stack

Hand-written static files, no build:

- `index.html`, `privacy.html`
- `assets/site.css`: all styles, including print
- `assets/site.js`: header rule on scroll, phone menu, print button,
  contact form (JSON to `https://formsubmit.co/ajax/tooeyteam@gmail.com`)
- `assets/fonts/`: Atkinson Hyperlegible Next (roman and italic, variable)
  and Atkinson Hyperlegible Mono, Latin subset, from fontsource, with their
  OFL licenses
- `assets/logo.png` (copied from the root), `assets/favicon.svg` (a drawn
  "t", no font dependency), `assets/og.png` (1200x630)

Page weight: about 175 KB uncompressed for the home page with all three
fonts, the logo, CSS, and JS.
