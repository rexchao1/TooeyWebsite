# 04 Glass box, round two: "Nothing hidden"

**Concept.** Every count Tooey sends is built from plates you already sold, and you can watch it being built. When there aren't enough plates to build a count, the line stays blank.

**Signature motion.** A scroll-pinned calendar on canvas, where each dot is one plate of one dish sold, over six weeks (example data).
- **On load:** the days fill in one after another, like last night's POS download arriving.
- **On scroll:** each of the four inputs is picked out: past sales, the Tuesday column (same weekday), the dates (time of year), and a ring around Labor Day (holidays). Then all of them light together under "Nothing else goes in."
- **The count:** 38 plates drop from past days into tomorrow's empty tray, under gravity with a small settle. A Doto numeral counts each one as it lands. Three yolk plates fall in on top, and Prep reads 41.
- **The blank:** the dish switches to one that is nine days old. The camera leans in, each day's newest plate wanders into the tray, fails to settle, and goes home, leaving a hole where it was. Instead of a number, an empty line draws itself.

**How it's built**
- Plain canvas 2D, with no libraries.
- Every frame is a pure function of scroll progress, so scrubbing backwards is exact. Progress is smoothed with an exponential follow.
- `story.js` holds the data, the layout and the drawing. `form.js` holds the form.

**Palette**
- Blue roll #2340C8 (the ground)
- Plate #FBFCFF (ink, and every plate)
- Glove #B4C4FF (quiet ink, dimmed plates)
- Yolk #FFC93C (only the cushion plates and focus rings)
- Ticket #0F1E66 (the pilot section)

The privacy page reverses the colors: Plate ground with Blue roll ink.

**Type**
- **Doto** (OFL), a dot-matrix face, set with round dots. It is used only for counts, so the numerals are made of plates like the canvas.
- **Host Grotesk** (OFL) for all other text.
- Both are self-hosted. The whole folder is about 70 KB.

**Word count (home, excluding nav, form labels and footer)**
- HTML: 127 words.
- Canvas labels add about 15 more: the weekday letters, Labor Day, Tomorrow, Sep, Oct, the second dish name and the Predicted label in the blank beat.
- Total is about 142. The date numerals in the calendar are not counted.

**Illustrative vs. factual**
- **Example only:** every number on the stage (the daily sales, 38, 41, the nine-day dish), plus the dishes and dates. They are labeled "Example."
- **Not a description of the model:** which plates drop into the tray, and from where, is a picture of "made from your sales," not of how the forecast is calculated.
- **Factual:** the four inputs and "nothing else", Predicted and Prep a little over Predicted, the blank for a dish that is too new, the nightly POS read and morning email, the pilot (free, about a week of setup, about five weeks of history, works with most POS), checking the counts against what sold, and the privacy terms.

**Reduced motion.** Nothing is pinned. Two designed stills sit beside the full text:
- the finished Margherita calendar: the Tuesdays, dates and Labor Day ring, and a tray of 38 + 3
- the nine-day dish, cropped to its few weeks, with an empty tray

**Without JS.** The full text and the form read in order. The form posts to FormSubmit directly.

**Weaknesses**
- **Small screens:** on a 320×568 phone the hero calendar is small until the hero text leaves.
- **Phone zoom:** the camera can barely zoom on phones because width limits it.
- **Ending:** the last beat ("you check every count…") has no visual of its own and holds on the blank tray.
- **Wordmark:** this is set in type. The real logo would need a reversed version for the blue.
