# Site redesign

Goal: replace the generic cream-and-serif look with one a restaurant owner
trusts, and cut the copy down to short, plain lines.

Direction (second pass, after an owner's-eye review): plain, sturdy, and
honest about being early. The main visual is the forecast sheet from the
original site (Tomorrow, Tuesday, a count and range per dish), rebuilt in
HTML in the new type. The owner asked for that one specifically; the app
screenshot in `static/` is not used.
No props that pretend to be something else (no taped ticket, no receipt, no
typewriter labels). The first pass (paper, ticket printer red, weekday dots,
three typefaces) was dropped as looking made-up.

Colors: white `#ffffff`, wash grey `#f3f3f0` for the problem band and the
contact section, ink `#18181a`, muted `#5d5f64`, lines `#e3e3df`. No accent
color. Buttons are ink.

Type: Libre Franklin only, self-hosted in `fonts/`. Headlines weight 800,
text 400.

Home page order: hero with the forecast sheet, the problem ("Most prep starts
with a guess"), the deal (free, setup, proof, wrong numbers, data, help),
four nightly steps, who we are, contact form.

Constraints: no invented figures, no phone number until the team gives one,
keep the FormSubmit contact form and its field names (an optional `pos` field
was added), keep the phone bottom bar and menu sheet.

Open facts only the team can give: which POS systems are supported, what free
turns into later, how much of the owner's time setup takes, reply time,
founder names or a photo.

Done when: all four pages are rebuilt, read well at desktop and phone width,
and the pull request is open.

## Steps

- [x] Fonts swapped to Libre Franklin
- [x] `styles.css` rewritten
- [x] Home page, with the forecast sheet
- [x] How it works
- [x] About
- [x] Privacy
- [x] Favicon
- [x] Desktop and phone check of every page (Chrome, 1440 and 390 wide, home also at 360 and 320)
- [x] Pull request (#6) updated
