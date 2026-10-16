# 48 Thread

Round eighteen. Rex found 47 not coherent enough: five unrelated photographs crossfading, no camera.
He asked for three pictures, one per step, on one board, with the camera following a string from Forecast to Prep to Shifts while the words stay put.
He also asked for a look closer to cinematic illustrated realism: real restaurants, warm light, a light illustrated finish, no doodles, no obvious whiteboard.
48 is 47 with the same words. Everything not listed here is 47's: see `../47-night-to-morning/NOTES.md`.

## What changed
1. **One board, not a reel.** "What Tooey does" is a single large board in the section's paper, with a faint dot grid so the eye feels the camera move.
   Three scenes sit on it, each a photograph printed with a thin mat, and a card from the console pinned over one corner:
   - Forecast: an owner at the counter, reading the day on a tablet; the forecast card (expected sales and covers, "Built from")
   - Prep: a cook at the station; the printed prep sheet
   - Shifts: the team together at the pass before service; Busy hours (Rex is still working on shifts)
2. **A thread from pin to pin.** A thin terracotta thread runs from the forecast card's pin to the prep sheet's pin to the busy hours' pin, hanging and bowing a little like a real one.
3. **A camera that follows it.** Pinned, the camera rests on each scene. Between two, it follows the thread from one pin to the next, pulls back a little on the way so the thread and the next scene come into view, then settles in on the next one.
   The thread draws itself just ahead of the camera. The camera is one translate and scale on the board, worked out from where the scenes and pins actually are, so moving a scene in CSS moves the shot with it.
4. **The words stay put.** The three steps on the right do not move; the one in view comes up and the others fade, as in 47.
5. **What plays on arrival.** The cards stay pinned up all along; what is on them plays when the camera arrives: the forecast figures count up, the prep sheet's lines are ticked off, the busy hours fill in.
6. **An illustrated finish, in code.** `photos/finish.py` takes each photograph and simplifies it into soft brush-like areas (a Kuwahara filter), grades it warm (ink, clay, paper), and adds thin ink lines and a faint grain. It keeps the real room and the real people and makes the three look like one set.
7. **Unpinned** (reduced motion, short or narrow screens), the whole board shows at once with the thread drawn and every card finished.

## The photographs
Free Unsplash stand-ins under the Unsplash licence. The originals are in `photos/raw/`; the finished files are `photos/<name>-2000.jpg` and `-1100.jpg` (about 1MB for all six).

| File | Unsplash photo |
|---|---|
| `forecast` | https://unsplash.com/photos/X_bbCAYzlTs |
| `prep` | https://unsplash.com/photos/y-XZf_TNRms (45's and 47's photo, cropped) |
| `shifts` | https://unsplash.com/photos/VUd9yv41hh0 |

Real artwork drops straight in under the same file names.
The best end state is illustration commissioned from photographs of one real restaurant; until then the finish is code over stock.

## Checked
At 1440×900 in Chromium: each of the three resting places after its card played; the camera at 0.3, 0.5 and 0.7 of the way from Forecast to Prep, and half way from Prep to Shifts.
Reduced motion at 1440: the whole board, thread drawn, cards finished.
Phone was not checked, at Rex's word.

## Weakness
The finish is a filter: up close it can read as one, and it cannot make three restaurants into one.
The forecast photograph is a café counter in daylight; the other two are restaurant kitchens.
Shifts still shows Busy hours.
