# 03 Sandbox: the menu that breathes with the week

## Concept
A sample bistro's menu is set in its own weight. Each dish name gets wider
and heavier the more of it will likely sell, so the list works as a bar
chart made of the dish names. The visitor drags a roll of kitchen day-dot
stickers through a sample fortnight and watches the menu: thin on Monday,
swollen on Saturday, bursting on Mother's Day. Two dishes stay hollow and
never move. Those are the honest blanks, each with its reason.

## Signature motion and how it is built
- **Intro (about 1.6 s):**
  - The day-dot roll is pulled from Monday to Friday.
  - The names inflate from hairline-condensed on staggered elastic tweens, top row first, while the counts roll up from zero like odometers.
  - Friday's sticker pops into place beside the day name.
  - At 2.6 s the roll tugs toward Saturday and springs back, so the visitor can see it moves.
- **Drag:** GSAP Draggable and InertiaPlugin (3.13, vendored), dragged from the roll or from anywhere on the menu.
  - A flick coasts and snaps to a day.
  - The roll's fractional position drives each row through its own damped spring. Stiffness falls down the list, so a change runs down the menu as a wave with a little overshoot.
  - Each row interpolates likely sales between days and maps them to Anybody's `wdth` (50–150) and `wght` (100–900) axes.
  - Counts are two-wheel odometers whose tens digit carries over correctly.
- **Fit:** the type is fitted to the screen.
  - On desktop the whole list fits in the viewport beside the headline.
  - On narrow screens the width axis is scaled down so the widest day still fits, and weight carries most of the change.
- **Keyboard:** the roll is a `role="slider"`. The arrow keys, PageUp/PageDown (a week) and Home/End work.
- **Tap a dish:** opens likely-to-sell, make, and the change against the same weekday last week. It updates live as the day changes.
- **Reduced motion:** no intro, nudge, springs or inertia. The page opens on Friday's full list with its blanks, and the roll still changes days instantly.
- **No JavaScript:** Friday's list is plain HTML with the same widths and weights inline, and the roll is hidden.

## Palette and type
- **Pink butcher paper** #EDBFA9 is the ground: the paper a kitchen wraps meat in. It has a faint fibre grain.
- **Char** #3A1A12 is the text. **Char-2** #6E3A2C is quieter text and the hollow outlines (5.48:1).
- **Wax** #F6DACB is used for fields. **Tape** #FBF1EC is the backing of the sticker roll.
- **Day dots** are only on the roll and the day marker: Mon #2F6FD0, Tue #F2C230, Wed #D8343B, Thu #7A5230, Fri #2E9E5B, Sat #F07E26, Sun #262626.
- **Type:** Anybody (OFL), a single variable family. Its width axis is the data. No serif and no monospace.

## Words
- 126 words of visible home copy, excluding nav, form labels and footer.
- The tap detail adds about 11 words.
- The privacy page is short.

## What is illustrative and what is factual
- **Illustrative:** the bistro, its dishes, every count, the cushion (about 10%), the "three weeks on the menu" age, and the Mother's Day bump. The caption says this is a sample bistro with made-up numbers.
- **Factual, and behaving like the real product:**
  - Predicted vs Make, with Make a little over.
  - The change vs the same weekday last week.
  - Grouping by category.
  - Blanks with reasons for dishes that are too new or too slow.
  - Inputs: past sales, weekday, season and holidays.
  - The list arrives by email before prep and is printable.
  - A free pilot, about a week to connect the POS, and the owner checks the counts against what sold.
- No figures, logos, testimonials, weather or events.

## Weaknesses
- At 1024 and on phones the width axis is scaled down to fit, so the swell is mostly weight there and less dramatic than on a wide screen.
- On phones the sticky roll covers the desserts until the visitor scrolls.
- The tap detail has no visible hint, so only curious visitors find it.
- Below the hero the page is deliberately quiet. Someone who never touches the roll sees only the Friday state and the intro.
- The day-dot colours follow one common US rotation scheme. Some kitchens use a different one.
