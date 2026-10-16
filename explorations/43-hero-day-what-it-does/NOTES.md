# 43 one day at the restaurant, telling what Tooey does

Site 42 revised to the founder's notes on it.
The "What Tooey does" section is gone: its three notes now live inside the hero's day.
Everything else outside the hero is 42's.

Changed:
- `hero.js`: a slower timeline, a new camera path, the forecast on the till's screen, two servers, faces where heads turn toward us, and the driver for the notes, the rail and the header.
- `styles.css`: the `.work` section is removed; new blocks for the notes, the rail and the header over the scene.
- `index.html`: the `.work` section is replaced by `.day-notes` inside the hero; the lead's three key words are wrapped in `.kw`; a light wordmark for the header over the scene.
- `logo-light.png`: the wordmark recoloured to porcelain, the spoon kept.
- `site.js`: a comment only.

No words changed.
The three notes keep their wording from 42's section.

## What the founder asked for, and what 43 does
- **Slower.** The day takes 540vh of scroll on a desktop (42: 190vh) and 400svh on a phone.
  What is shown eases toward the scroll with a 0.14 s time constant (42: 0.11 s).
- **The hero text disappears on scroll.** The headline, the rest of the lead and the button fade and lift away over the first 3% of the day.
- **A clever, smooth way to say "this is what Tooey does".** The lead already names the three: forecast, prep and shifts.
  As the visitor starts to scroll, those three words underline in lamp amber.
  The rest of the words fade, and the three fly up and become a rail under the header: "What Tooey does: forecast, prep, shifts".
  The handoff is pixel-exact: the rail's words are measured over the lead's words and start there.
  The rail is the section's heading for the rest of the day.
  The word whose note is up is lit and underlined, and the line to the next word fills as the day moves toward it.
- **Organized, in thirds, alternating.** Each note sits in one third of the screen, at the same height and in the same type every time:
  - Forecast on the left;
  - Prep on the right;
  - Shifts on the left.

  The camera's centre moves right while a note is on the left and left while the note is on the right, so the subject is never under the words.
- **Forecast made sense.** In 42 it would have come up as night turned to morning.
  Now the camera comes close to the till at night.
  The screen shows tonight's sales by the hour, then draws tomorrow's beside them in amber, bar by bar.
  Only then does the receipt print and fly back to the kitchen, and only after the Forecast note has gone does night turn to morning.
  The chart has shapes and two labels ("Tonight", "Tomorrow"), and no figures.
- **Prep with the prep sheet on the fridge.** The Prep note comes up as the sheet lands on the fridge's side and the door opens.
  The camera now stands back and to the left, so the sheet, the shelves and the open door are all in the frame and the note sits on the door's flat white.
  In the bright morning the note turns to ink on a pale shade.
- **A server, and Shifts at the end.** I chose to let the server serve the food and end the day on a full room, rather than cut at the counter.
  A server in a charcoal shirt and waist apron walks in from the left, takes the plate from the pass, turns, and carries it on her hand to the table by the pass.
  She leans in and sets it down in front of the guest who was waiting with no plate, who turns to it.
  Her legs walk: each foot swings through and lifts as it passes, the knees bend, and she bobs a little.
  A second server takes an order at the back left.
  The Shifts note comes up as she crosses the room with the plate, and holds to the end of the day.
- **The nav bar blends in.** While the scene is under it, the header has no paper and no rules.
  The wordmark and the links turn porcelain, and a soft shade at the top of the scene keeps them and the rail legible at every light.
  The scene now runs up under the header.
  Past the hero, the header is paper again.
- **Polish.**
  - A face shows where a head turns toward us, so a profile no longer reads as a ball of hair.
  - The headline's tape blips stop once the day starts.
  - "What it does" in the nav goes to the forecast, inside the day.

## How the timeline works
42's beats (the receipt, the fridge, the sear, the plate) keep their own clock.
43 maps its progress onto that clock through a monotone curve, so the forecast gets its time at the start and the server gets the end, and nothing ever runs backward.
The camera, the chart, the servers and the notes run on 43's progress directly.

## Without motion
No pin and no animation.
The still is the server taking the plate from the pass.
Under it, "What Tooey does" and the three notes sit as a plain row of three, as in 42's section.

## Checked
- Desktop at 1440×900 and 1280×800, by progress and with a live wheel scroll: about 58 fps, no console errors.
- Phone at 390×844, by progress.
- Reduced motion at desktop and phone width.
- The privacy page.

## Known weak spots
- Up close, the people still look illustrated; the server's face is a plain skin shape.
- The receipt's flight crosses the dark room quickly between Forecast and Prep.
- On a phone there is a stretch of empty paper between the Prep and Shifts notes, while the steak sears.
