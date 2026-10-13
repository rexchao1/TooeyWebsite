# 02 · Overnight

Preview: serve the repo root (`python3 -m http.server 5212 --bind 127.0.0.1`)
and open `/explorations/02-time-back/`. Pages: `index.html`, `privacy.html`.
Hand-written HTML, CSS, and JS. No libraries and no build step.

## Concept

The home page plays one night at the restaurant as a long-exposure photograph.
Each of the day's sales is a point of light. Overnight the lights trace star
trails. At dawn the circular trails unroll into the dotted leaders of
tomorrow's prep list, and the page lands in morning light, where the pilot
form is.

## Signature motion (`night.js`)

A single 2D canvas on a sticky stage inside a 600vh section. Each frame is a
pure function of scroll progress `p`, eased toward the real scroll position,
so scrubbing works exactly in both directions. A clock runs from 10:58 pm to
5:41 am as you scroll.

1. **Load.** Amber ticks fill in along the horizon from left to right, and the
   clock runs from 11:00 am to 10:58 pm. The ticks form the day's sales by
   hour: a lunch hill and a bigger dinner hill. The shape is illustrative.
2. **Rise, p 0.03–0.25.** The ticks lift as sparks and cool from amber to
   starlight. Each spark is paired with its star by rank of x, so the field
   rises nearly straight up and in order, instead of scattering like confetti.
3. **Trails, to p 0.60.** Every star sweeps the same angle around a pole off
   the top of the screen, like a real long exposure. Seven bands of rings are
   the seven dishes. Faint field stars fill the rest of the sky.
4. **Dawn, p 0.59–0.85.** The sky gradient moves through blue hour to sunrise.
   Each arc straightens: its curvature eases to zero while its length and
   midpoint move onto its dish's row. The trails of one band merge into a
   line, and the line breaks into dots, one dot per plate (or per two or three
   plates on narrow screens). The "Lamb neck" band scatters and fades, and its
   row reads "too new to call". Names fade in and counts tick up.
5. **Morning, p 0.87–1.** The caption appears, the stage unpins, and the form
   follows on the same first-light ground.

Lines are batched into Path2D buckets by color, alpha, and width, so a frame
costs a few dozen stroke calls, not one per star. Device pixel ratio is capped at 2.

**Reduced motion:** one still frame of the trails at about 3 am sits behind
the headline, with a shade on the side the text is on. Below it, a CSS dawn
band leads to the finished list, which uses CSS dot leaders.

**No JS:** the same layout over a plain night gradient. All copy and the list
are real HTML, with no JavaScript needed to read them.

The header hides while the night plays and comes back at dawn. It shows
whenever it holds keyboard focus.

## Palette

| Name | Hex | Use |
|---|---|---|
| Last seating | `#1B2147` | Night ground, morning ink |
| Small hours | `#10163A` | Deepest sky |
| Pass light | `#F0B35E` | The day's sales, nothing else |
| Starlight | `#D7DEF5` | Trails, night text and button |
| Blue hour | `#5D6FAE` | Dawn gradient, focus rings |
| First light | `#E8EEF4` | The morning ground: a cool pale sky, not cream |

`#F4C7A1` (sunrise) appears only inside the dawn gradient.

## Type

Funnel Display for the headline, captions, clock, and counts; Funnel Sans for
body text, the list, and the form. Both are OFL (`fonts/OFL-funnel.txt`), Latin
subset, variable weight, and self-hosted (about 35 KB total). Figures are
tabular by default, so the clock and the counts don't jitter. No serif, no
monospace, no all caps.

## Word count

115 words of visible copy on the home page, excluding nav, form labels, and
footer. The count includes the headline, lead, CTA, two captions, the list
(dish names and numbers), the pilot heading, and its paragraph.

## Illustrative vs. factual

- **Illustrative:** the shape of the sales band, the number of stars, the
  dishes, and the counts, which are labeled "(example)". "One dot per plate"
  is a visual device only. The times 10:58 pm and 5:41 am are an example
  night.
- **Factual:**
  - Tooey reads the day's sales overnight.
  - It works out how many of each dish to make.
  - The list arrives by email before prep.
  - Dishes too new get a blank and a reason.
  - The pilot is free.
  - Setup is a nightly POS download, using about five weeks of past sales,
    and takes about a week.
  - The owner checks the counts against what sold, then decides.
  - The privacy facts.
- **Not claimed:** no figures, inputs beyond sales, logos, or testimonials.

## Weaknesses

- The rise phase (around 11:30 pm) is the busiest-looking stretch. It reads
  as sparks, but a still frame from it is noisier than the rest.
- The page asks for about five screens of scrolling before the form. The CTAs
  jump there with smooth scrolling (a one-second time-lapse of the night), but
  an owner who only scrolls has to commit to the night.
- On phones the dots merge two or three plates each, so the "one dot per
  plate" idea only holds on wide screens.
- The final list is set wide but small on very large screens. It's legible,
  but quieter than the hero.
