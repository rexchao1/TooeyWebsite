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
- [ ] Rex picks A or C; the other and the switch are removed
- [ ] Pull request


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
- [ ] Type comparison page with the three candidates; Rex picks one (page built in `.lavish/type-samples/`, waiting on Rex)
- [ ] Draft copy from Rex's material; Rex reviews wording before any layout (draft in `new-site-copy.md`, on the same review page, waiting on Rex)
- [ ] Build the home page
- [ ] Privacy page in the new type
- [ ] Redirects for old routes
- [ ] Desktop and phone check of every page
- [ ] Pull request
