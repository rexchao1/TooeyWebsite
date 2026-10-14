# 16, chain reaction

## Concept
In a restaurant nothing happens alone. The page is one kitchen marble run.
A ball of the day's sales drops out of a receipt printer and sets off the
back of house in order: the prep tubs fill, cooks stand up on the line, and
a bell rings that seats Monday's tables. The home page plays as one shot.
The camera rides the ball during the run, then follows the run's
consequences as you scroll: Prep, then Shifts, then Monday, and finally
pulls back to show the whole machine.

## Motion and how it's built
Inline SVG, vendored GSAP 3.15 (core, ScrollTrigger, MotionPathPlugin). No
build step.
- **The run (signature):** the ball's path is computed from the surfaces'
  geometry for the ball's radius. Each surface is a separate MotionPath
  segment with its own gravity ease, and the ball spins by the distance it
  rolls. Along the way: the receipt prints (steps), the ladle tips under the
  ball and swings back (elastic), each tub fills as the ball passes over its
  lid (the third, gnocchi, stays empty: too new), the card track flexes,
  cooks hinge up like a pop-up book, the ball hits the backboard, rolls down
  the ramp, and rings the bell. The first table then pops up.
  - Friday: about 7s, a big ball, high fills, three cooks.
  - **Tuesday:** a small ball. Low fills, one cook, and the bell still rings.
- **Camera:** the SVG viewBox is the camera.
  - During the run it follows the ball. Desktop tracks vertically; phones
    track both axes.
  - Scrolling blends through framings for Prep, Shifts and Monday, easing
    back slightly as it travels, then pulls back to the whole machine. Each
    chapter's ScrollTrigger feeds one smoothed camera value, so the shots
    never fight.
- **Close-ups (scrubbed):**
  - Prep: two chips fly from the tubs into the morning email, and the counts
    tick up. On phones the email is HTML in the text.
  - Shifts: a card clock stands up beside the line and runs to the evening.
  - Monday: two more tables of guests pop up.
- **Form:** on success the card bell rings once.
- **Reduced motion and no JS:** the finished machine, still, with
  everything popped, the rings showing and the ball at the bell. The
  Friday/Tuesday buttons switch between the two finished states.

## Palette
| Name | Hex | Use |
|---|---|---|
| Pistachio | #d4dfb2 | the ground |
| Aubergine | #33183a | text and painted parts; the join section's ground |
| Radish | #c2304f | the ball and primary buttons |
| Blush | #f2b6c2 | tub contents and prep counts |
| Card | #fcfcf7 | the white-card parts only |
| Fold | #a3b386 | score lines; olive-tinted card shadows |

## Type
- **Caprasimo:** headlines and the machine's painted labels.
- **Libre Franklin (variable):** everything else.
- Both are OFL, self-hosted, and come from @fontsource.

## Words
The home page has **170 visible words**. That excludes nav, form labels and
footer, and includes the SVG labels and the example email. Counted by
script at 1440 wide.

## Illustrative vs. factual
- **Illustrative:** the machine, and the email's numbers (labelled
  "Example: Saturday").
- **Factual, from the brief:** nightly POS sales, the morning email, the
  count to expect and a little over to prep, blanks with a reason, about a
  week of setup, about five weeks of past sales, most POS systems, the owner
  checks the counts against what sold, free pilot.
- **Never claimed:** no figures, statistics, logos or testimonials, and no
  weather or event inputs.

## Live vs. coming
- **Material:** what works today is painted flat in aubergine, radish and
  blush (printer, chute, ladle, tubs, the email, and the join section).
  Shifts and growth are folded white card that casts a soft shadow, like an
  architect's model.
- **One sentence** stays under the machine at all times: "Painted parts work
  today; white card is what we're building."
- **Tense:** both coming sections say "We're building". There are no badges
  and no dates.

## Critique passes
1. **Design director:**
   - The ball was small in a portrait machine on a landscape stage, which
     led to the ball-following camera.
   - The "rush" hill read as a blob. It became a card clock.
   - The rail posts made the tubs look like a shed. Removed (the accessory I
     took off).
   - The look was flat and diagrammatic. Card parts now cast shadows and
     painted parts don't, which sharpens the material contrast.
   - The join section blended in. It's now painted aubergine to close the
     page.
2. **Busy owner:**
   - The headline, lead and button read in one glance.
   - Painted labels name each stage.
   - Example numbers are labelled.
   - Join says what it takes and what it costs.

## Weaknesses
- The run is long: about 7s on Friday and about 8s on Tuesday. Someone who
  reads the headline and scrolls straight away misses part of it, and the
  camera then switches to the scroll shots.
- On phones the sticky stage takes 60% of the screen, so chapter text
  passes through a narrow band.
- On desktop, the left column is empty between chapters while the camera
  travels.
- Caprasimo leans retro-diner, which some may find kitsch.
