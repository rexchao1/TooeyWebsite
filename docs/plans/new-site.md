# New site

## Change of direction (2026-09-30)

Rex reviewed the draft and dropped the rewrite: no letter, and no team
names on the site. The existing pages keep their words and sections. This
pass only changes the type and the look, taken from the type review page
(`.lavish/type-samples/`, not committed). Two candidates are tried on the
real pages before one is kept:

- A: Source Serif 4, headlines bold, with Schibsted Grotesk for labels and
  buttons.
- C: Figtree throughout.

The sections below are the earlier rewrite plan. They are kept for the
facts about the product, which still bind any future copy change.

Steps for this pass:
- [x] Fonts self-hosted in `fonts/`, both candidates switchable on the real pages (`?font=c`)
- [x] Sheet and page styling brought over from the review page
- [x] Desktop and phone check of every page in both candidates
- [x] Rex picks A or C; the other and the switch are removed (A)
- [x] Pull request (#7)

Hero pass (2026-09-30), Rex's picks from four ideas:
- [x] "Free for independent restaurants. If it doesn't help, we stop." removed from the hero
- [x] Tomorrow's sheet prints in on load: feeds out top first, rows appear one by one, counts tick up (CSS plus `site.js`, off under reduced motion)
- [x] A soft glow in the wordmark's spoon tan and leaf green behind the sheet, drifting slowly
- [x] Two blank past sheets under tomorrow's: fanned left on desktop, stacked straight up at 980px and below so they stay inside the gutter
- Not taken: a night-to-morning gradient across the whole hero

Prep counter (2026-09-30). Rex found the hero too white. A look at Stripe,
Linear, Notion, Mercury, and Square (Toast blocked automation) showed none
of them float a small picture on white: the product runs near full width on
its own surface, often with a still grain. Rex approved:
- [x] Headline row on top (headline left, lead and buttons right), sheet below
- [x] The sheets sit on a wide butcher-paper tan panel with a soft light and still grain, running past the fold; it replaces the glow
- [x] Sheet grows to about 620px wide
- [x] Two-column variant behind `?hero=side`: the panel sits behind the right column and runs off the right edge
- [x] Desktop, tablet, and phone check of both
- [x] Rex picks one and the switch is removed (the prep counter)
- [x] The sheet drops Range and adds Prep, how many to make (Rex, 2026-09-30:
  the product has no range any more). Prep is the bold number; the example
  values are the prediction plus a small cushion. The "What happens each
  night" step says the same. `how.html` still shows and explains a range.

Hero words (2026-09-30). Rex dropped "Prep to the number." as meaningless
and wants the headline broad enough that Tooey can grow past prep, so it
names the company, not a feature. The lead says what exists today.
- [x] Headline: "The operations partner for independent restaurants." The
  "For independent restaurants" label above it is gone.
- [x] Lead (Rex's words): "We start with prep. Each morning before the
  kitchen opens, you get a count for every dish. No more guessing." Page
  title and share text match. Benefit lines stay unquantified (no "saves
  X%", no margins) until a partner has measured results.
- [x] The sheet says "Today", since the email arrives that morning.
- Rejected headlines: anything about forecasting or prep alone (reads as the
  whole product), "operating system", "data-driven", two-part slogans.


Hero ground (2026-09-30). Rex still found the top of the hero plain white
above the counter. Of seven ideas he left the pick to judgement:
- [x] The butcher-paper counter becomes the whole hero, from behind the
  header down past the sheet, with the grain and the light behind the sheet
- [x] The old way under the new: a pencil prep list on the back of a guest
  check, guesses crossed out ("burgers 40? 50?", "pasta, ask chef"), half
  under tomorrow's sheet. Written in on load, then the sheet prints over it.
  Pencil is Reenie Beanie (OFL, `fonts/`) until a real handwritten list can
  be scanned and traced. (Superseded below: a yellow pad scrap, not a guest
  check.)
- [x] Desktop, tablet, and phone check (1440, 900, 390, 320)
- Not taken: a dark early-morning hero, a ticket rail, a scrolling strip of
  counts, a marker swipe in the headline, stock photos.

Color and note pass (2026-09-30). Rex: the note is good but reads as part of
the product, and every color on the page is bland; keep colors low-key,
light, nothing bold or dark.
- [x] One accent for the whole site: the wordmark's leaf, muted (#3f6b50) on
  the primary buttons and link hovers. The grey band is tinted to match.
- [x] Three light hero grounds on trial behind `?look=`: sage (default),
  cream, sky. Tan is gone.
- [x] Morning window light: four soft panes drifting slowly across the hero
  (still under reduced motion)
- [x] The note becomes a torn scrap off a yellow pad: masking tape, coffee
  ring, a smudge, margin line. It lands alone in the middle first and is
  written in, then the sheet feeds out and pushes it aside.
- [x] Desktop, tablet, and phone check, including frozen mid-animation frames
- [x] Rex picks a look; the switch and the other two are removed (sage)
- [x] Commit and push to `new-site`

Heading font (2026-09-30). Rex does not like Source Serif 4 bold for the
headings; body text is not in question. Six candidates behind `?font=` on
the home page, fonts self-hosted in `fonts/`:
- newsreader (Newsreader 500), young (Young Serif), alegreya (Alegreya 600),
  schibsted (Schibsted Grotesk 600, already the UI font), hanken (Hanken
  Grotesk 600), gloock (Gloock)
- [x] Candidates in place; headings fit at 320 wide in each
- [x] Rex narrowed it to current, Newsreader, and Hanken. Dropped Young
  Serif, Alegreya, Schibsted, Gloock. Added current at 600, Literata,
  Spectral, Albert Sans, Onest, Mona Sans, with a picker bar on the page
- [x] Rex picks Literata (500, display optical size); the other fonts, the
  switch, and their files are removed. Body text stays Source Serif 4.
- [x] Desktop and phone check of every page in the pick, then commit

Crumpled note (2026-09-30). Rex: pushed aside, the note still sat beside
the sheet like a second tool, and the replacement did not read. He picked
crumpling it from four endings (bury, cross out, crumple, fade), with the
ball left on the counter.
- [x] The note lands alone on the empty counter and is written in, then
  crumples (clip-path folds and creases), turns into a paper ball that is
  tossed aside, and tomorrow's sheet prints where it was. The ball rests
  right of the sheet on desktop and on its bottom right corner below 1160px.
- [x] Ball is an inline SVG of shaded facets generated from a lit, bumpy
  surface (one-off script, not kept). Without motion, only the ball shows.
- [x] Desktop, tablet, and phone check with frozen frames; reduced motion
  not checked in a browser
- [x] Whole sequence faster again: the crumple takes 0.2s and the sheet's
  last row prints at 1.37s (first pass 2.5s). The sheet's bar reads
  "Forecast" on the left with the tooey wordmark at the right.

The deal, scroll-led (2026-09-30). Rex wants "We're new. Here's the deal."
to look more modern and move, after a reference where a numbered list sits
on the left, the item at the middle of the screen is full ink and the rest
fade, and a rounded panel on the right stays put while its picture changes
to match. Words stay as they are; only the look changes.

Layout, desktop (above 980px):
- Heading row on top: the headline left, the two short paragraphs beside or
  under it. The section goes white so the panel stands out.
- Left: the six terms as a numbered list (01 Cost ... 06 Help), term in
  Literata, line in body text, a hairline between items, generous height
  per item so scrolling moves one at a time. The active item is full ink,
  the others fade to about 35%, with a short ease between.
- Right: a rounded panel on the hero's sage with its grain and window light,
  sticky at mid-screen while the list scrolls past. One picture per term,
  cross-fading with a small rise when the active term changes.

The six pictures, built in HTML and CSS in the forecast sheet's style, no
images, nothing that claims a figure:
- Cost: a guest check for the forecast, total 0.00, stamped "Partner".
- Setup: a week strip that fills in day by day: tell us what matters,
  connect the POS, check the list. Ends on "About a week", no exact day.
- Proof: the sheet with a Sold column penciled in beside Prep, a tick per
  row, one row honestly off. Example values only, no accuracy claim.
- Wrong numbers: one row of the sheet, the printed count crossed out in
  pencil and a new one written over it (Reenie Beanie, as in the hero).
- Your data: your sales feeding your forecast; arrows toward "other
  restaurants" and "sold" end in a cross.
- Help: an email from the owner to tooeyteam@gmail.com and a reply from
  "Tooey team" after typing dots. Not a reply to the nightly email, since
  nobody reads those. No names.

Phone and tablet (980px and below): no sticky panel. Each term is full ink
with its picture under it in a smaller panel; the picture plays when it
scrolls into view.

Motion rules: the active term is picked by an IntersectionObserver on a
band at mid-screen, in `site.js`. Each picture restarts its small animation
when it becomes active. Under reduced motion nothing fades or moves and
pictures swap instantly; the lit term still dims the others, since without
that the panel has no visible link to its term. Without JavaScript the phone
layout shows at every width. Pictures are `aria-hidden`; the list carries
the meaning.

Rex said go ahead without settling the two open points, so this pass takes
six separate pictures and keeps the headline (the words were kept).

Steps:
- [x] Markup: heading row, numbered list, sticky panel with six pictures
- [x] The six pictures and their small animations
- [x] Active-term logic in `site.js`, reduced motion, no-JS fallback
- [x] Phone and tablet layout with pictures inline; the setup blocks step
  down a row each below 420px
- [x] Desktop, tablet, and phone check (1440, 900, 390, 320), with frames
  caught mid-animation. Reduced motion and no-JS not checked in a browser.
- [x] Commit and push to `new-site`

Each night, scroll-led (2026-09-30). Rex: the four nightly steps go into
the deal's scrolling layout, and the deal's terms and intro are dropped
from the home page. The heading is "What happens each night" with the "How
setup works" link beside it; the steps keep their bold line. Pictures,
example values only:
- Pull: a slip headed "Your POS / Monday" with the day's counts, stamped
  "Pulled".
- Email: "Tooey to you", unread, "Your prep list for Tuesday", with the
  Predicted and Prep columns as in the hero.
- Print: the forecast sheet with a penciled "done" column ticked down.
- [x] Section rebuilt, old steps grid and the six deal pictures' styles removed
- [x] Desktop, tablet, and phone check (1440, 900, 390, 320)
- [x] Rex dropped step 4 ("Tell us where it was off") and its email
  picture, and the line under each step: only the bold step shows.

Onboarding (2026-09-30). Rex dropped "Why we built it." It answered nothing
an owner asks just before the form. In its place, "Onboarding.": three short
steps (connect your sales, a week of setup, first list after about five
weeks of past sales) and a trial line. Rex: Tooey is not free for
independent restaurants. It is a free trial where the owner checks the
counts against what sold. "Free for independent restaurants." became "Try it
free first." on every page. No trial length is stated until Rex sets one.
The students line moved into the contact lead.
- [x] Section, contact lead, and every free claim changed
- [x] Desktop (1440) and phone (390) check of the home page

Onboarding on the counter (2026-09-30). Rex picked this over a ticket rail
and a clipboard checklist. The three steps become paper on one wide sage
panel (the hero's grain and window light), left to right: a POS slip of
five weeks of past sales stamped "Connected", the setup week strip (about a
week, no exact days), and tomorrow's sheet with a penciled "sold" column,
which shows the trial line. Pencil arrows draw between them. Each step's
words sit under its paper. The heading row carries the trial line. Phone:
the papers stack with the arrows turned down. The sequence plays once on
scroll-in; under reduced motion or without JavaScript, everything shows.
Example values only.
- [x] Markup, styles, and the play-on-view script. The sheet keeps three
  rows (no chicken sandwich) so it fits a third of the panel.
- [x] Desktop, tablet, and phone check (1440, 1100, 900, 390, 320), with a
  frame caught mid-sequence. Reduced motion and no-JS not checked in a
  browser.
- [x] Commit and push to `new-site`
- [x] Rex: the five weeks of past sales are needed at the start, so step 1
  says it; step 3 no longer does. "Square works today, others on site" is
  replaced by a nightly POS download that works with most systems (Rex,
  2026-09-30; this overrides the Square-only answer below).

How it works page (2026-09-30). Rex: make `how.html` match the home page,
stop repeating it, and explain more where it helps. It is not "free" in the
way the site says. Tooey is in a pilot and free for now as a trial (Rex's
words: "we are still in pilot phase, and it is free for now in a trial").

What is wrong with `how.html` today:
- Old look: eyebrow labels, the slogan "Set up once. A list every night.",
  plain cards instead of paper on the sage counter.
- It repeats the home page: connect the POS, the list arrives, check it
  against sales. The home page's nightly steps and onboarding already say
  all three. The "What we need / What you get" lists repeat them again.
- Out of date: a Range column (gone from the product), "after close" (the
  list arrives in the morning), "Make" instead of Prep, "open it in the
  app", and "We can also test it on your past sales" (no backtest offer).

The page's job: answer what an owner asks after reading the home page.
How is the number made, what does each column mean, what if it is wrong,
what happens to my sales, and what does it cost. Setup stays on the home
page and is not explained again here.

Rex (2026-09-30): skip "When a count looks wrong" and "Your sales stay
yours"; keep the copy short and plain, no stock phrases. The page as built:
1. Head: "How the counts are made." The lead names what goes in (past
   sales, day of the week, time of year, holidays, not weather) and that
   every count is redone each night. Under it, those four as paper on the
   sage counter: a slip of one dish's past Tuesdays, and three calendar
   tiles (day, time of year, a holiday). Example values only.
2. "Reading the list." The home page's scroll-led layout: a numbered list
   on the left, the forecast sheet sticky on the right, the column for the
   active item lit and the rest dimmed. Predicted, Prep (a little over
   Predicted, no cushion size stated), vs. last Tuesday, and a blank row
   (under five weeks on the menu or under one sold a day, left blank with
   the reason; not a zero).
3. Closing line: in a pilot, free for now. No trial length or price until
   Rex sets them. Talk to us button.

Dropped: the three steps, both lists, the Range explainer, every line in
"What is wrong" above.

The free line on every page. "Try it free first." changes everywhere to
the pilot wording: the home onboarding lead ("We're in a pilot, so Tooey is
free for now. Check our counts against what you actually sold, then
decide."), the bar at the foot of each page and the page-end lines on About
and How ("Free for now, while we're in a pilot.").

The home page's "How setup works" link beside "What happens each night"
becomes "How the counts are made", since the How page no longer covers
setup.

Not in this pass: rewriting About or Privacy beyond the free line. About
still says "every night" and "If an email is late"; noted for later.

Steps:
- [x] Rex reviews this plan (skip 4 and 5, otherwise go)
- [x] Rebuild `how.html` with the sections above, using the home page's
  styles (counter panel, sheet, scroll-led list); remove styles only the
  old How page used
- [x] Pilot wording on every page ("Free while we're in a pilot." in the
  bar and on About); home link renamed
- [x] `/unslop` on the new copy
- [x] Desktop, tablet, and phone check (1440, 900, 390, 320) of How and
  the changed lines on Home and About. Reduced motion and no-JS not
  checked in a browser.
- [x] Commit and push to `new-site` (PR #7)

Goal: a site that reads like it was written by the people who built Tooey,
for one restaurant owner, and not like a landing page template. It replaces
the direction in `site-redesign.md` (PR #6), which Rex judged generic in
wording, sections, and type.

## What is wrong with the current site

Wording
- Slogan headlines: "Prep to the number." "Set up once. A list every night."
- Startup stock phrases: "We're new. Here's the deal." "Why we built it."
  "Want to try it?"
- Clipped three-beat fragments everywhere: "Nobody types anything in." "We
  read every reply." "If it doesn't help, we stop." Every line is the same
  length and rhythm, so nothing stands out.
- The same promises repeated: "Free for independent restaurants" about five
  times per page, "one of us writes back" three times, "you still make the
  call" twice.
- Eyebrow labels over every heading ("For independent restaurants", "Week
  one", "About").
- Nothing on the site that only this team could say. No names, no kitchen,
  no moment where they saw the problem.

Sections
- The standard SaaS order: hero with a product card on the right, grey band,
  a term grid (Cost / Setup / Proof / Wrong numbers / Your data / Help),
  numbered steps 1 to 4, "why we built it" blurb, contact form.
- `how.html` and `about.html` mostly repeat the home page, then add a "What
  we need from you / What you get" two-list block.

Type
- Libre Franklin at weight 800 with tight tracking is the default look of
  a thousand startup templates, and it clashes with the rounded, warm
  `tooey` wordmark.

## Direction

One voice, written as prose. The site is a short letter from the team to an
owner, with the real nightly email as the one picture. Fewer sections, each
one saying something the owner does not already assume.

Proposed home page, top to bottom:

1. What arrives. A plain headline that says what it is, not a slogan
   (for example "Today's prep counts, in your inbox before you start"),
   and the forecast sheet, matched to what the real email contains.
2. The letter. First person, signed with real names. What the team saw in
   a specific kitchen, what the POS knew and never said, what Tooey does
   about it. This absorbs "the problem", "why we built it", and the About
   page.
3. How the numbers are made, and when they are wrong. One honest
   paragraph: nightly sales pull, a count and a range per dish, what the
   range means, what to do when it is off.
4. What it costs you. Said once, in sentences: free while we are early,
   about a week of setup, access to your POS, and feedback.
5. The contact form, with one line above it.

Pages: home and privacy. `how.html` and `about.html` fold into the home
page and redirect to its sections in `vercel.json`, unless Rex wants to
keep them.

## Copy rules

- Every sentence must be something a competitor could not paste onto their
  own site. If it could, cut it or make it specific.
- Say each fact once. "Free" appears in the terms section and near the form,
  nowhere else.
- Vary sentence length. Full sentences, not fragments stacked in threes.
- No eyebrow labels, no "Here's the deal", no "Why we built it", no
  question headlines.
- Kitchen words where an owner would use them (prep list, par, 86'd), not
  sprinkled on for flavor.
- No invented figures (AGENTS.md). No accuracy claims until measured.
- Read it aloud. Run `/unslop` on the final copy before it ships.

## Type

Pick from real side-by-side samples, set in the actual headline, letter
paragraph, and email, next to the wordmark. Candidates to sample:

- Letter: a text serif for body and headlines (Newsreader or Source Serif 4),
  a plain sans only for form labels and buttons.
- Newspaper: Schibsted Grotesk throughout, headlines at normal weight, not
  800.
- Warm sans: a humanist sans that matches the rounded wordmark (Figtree or
  Nunito Sans class), used at modest sizes.

Avoid the current AI-default picks (Fraunces, Instrument Serif, Inter,
Geist, Bricolage Grotesque). Self-host whatever is chosen in `fonts/`.
Colors stay as in `site-redesign.md` unless the chosen type calls for a
change.

## Answers from Rex (2026-09-30)

- No team names or personal story on the site.
- The real nightly email is not polished enough to be the picture. The hero
  keeps the forecast sheet the owner asked for (PR #6), with its columns
  matched to what the real email contains (template in TooeyApp, read with
  Rex's permission; nothing is imported from it).
- POS: Square works today. Others are possible, but the team has to be on
  site to set up a custom connection.
- History: about five weeks of sales before the first list.
- The email arrives early in the morning, before prep, not after close.
- Setup week: the owner tells the team what matters in their kitchen,
  chooses how the list is set up for them, and checks that it works.
- Nobody reads replies to the nightly email. Contact goes through the form
  or tooeyteam@gmail.com.
- "Range" was unclear to Rex. Say only what the email actually shows.

What the TooeyApp code says (read 2026-09-30), which overrides the
answers above where they differ until Rex says otherwise:
- There is no email yet. Delivery moved to a later checkpoint. What exists
  is a Forecast page the restaurant signs in to and prints, rebuilt each
  night around 1 to 5 am local time.
- The page is for tomorrow: "Menu item", "Predicted sales", "Change from
  <day of latest data>", grouped by category, with a total. No range, no
  weather, no pars. Items under five weeks old or selling under one a day
  are left blank with the reason: "A blank is a decline, not a zero."
- Inputs: past sales, day of week, time of year, holidays. Not weather.
- No live POS connection. Someone uploads a CSV export each day; Square,
  Toast, and Clover exports are recognised, other CSVs can be mapped.
- No accuracy measured at a live restaurant. No figure goes on the site.
- One login per restaurant; a second restaurant needs real sign-in first.

Rex's calls on those gaps (2026-09-30):
- The site promises an email early each morning. Rex says it will be built
  before any partner finishes setup. The site must not ship before it is.
- The site promises that nobody uploads anything: the team sets up an
  automatic nightly pull on site. Same condition.
- No backtest offer on the site. Evidence so far (one pizza restaurant's
  old data) puts the model only about 6% ahead of a simple naive guess, so
  a prospect's backtest could easily disappoint. Revisit after a partner
  has run it live.

Decisions (Rex left these to judgement):
- `how.html` and `about.html` go. Their URLs redirect to home sections.
- PR #6 is not merged; its design was judged generic, and shipping it now
  would put that on the live site. This work continues on `new-site`, which
  starts from PR #6's branch. PR #6 is closed as superseded when this pull
  request opens.
- The picture is the forecast sheet, not the email.

## Done when

Home and privacy are rebuilt in the chosen type and voice, old routes
redirect, every page reads well at 1440 and 390 wide (home also at 320),
copy has been through `/unslop`, and a pull request against `main` is open.

## Steps

- [x] Diagnose the current site and write this plan
- [x] Rex answers the questions above
- [x] Type comparison page with the three candidates; Rex picked A, headlines bold
- [x] Draft copy; Rex dropped the rewrite (see Change of direction)
- [ ] Build the home page
- [ ] Privacy page in the new type
- [ ] Redirects for old routes
- [ ] Desktop and phone check of every page
- [ ] Pull request (not needed: the rewrite was dropped)
