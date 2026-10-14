# 15-control: "In control"

## Concept
Tooey as a mixing desk with motorised faders. Each night the faders move to
positions set from the restaurant's own sales. The motor lets go the moment the
owner's hand touches a cap. Headline: "Tooey runs the numbers behind your
restaurant, and the final call stays yours."

## Motion and how it is built
- **The recall (hero, about 3 seconds, plays once on load).**
  - The "Your sales" cable hangs loose. It swings on its own weight and seats in the Prep jack.
  - The panel jolts 2px and the jack LED blinks.
  - The six LCD strips flicker on, left to right.
  - Each fader is driven up to tonight's example count by a speed-limited motor spring, with a 1px motor hum and one overshoot (Smash burger passes 41 and settles on 40).
  - Crudo never moves; its strip reads "Too new to call".
  - Cap LEDs go green, and the red "Your call" key brightens once.
- **Hands on.**
  - Every fader has mass and integer detents (Android also gets a short haptic tick per detent).
  - Grabbing a cap releases its motor: the LED turns white and an outline stays at Tooey's set point.
  - "Your call" travels down 9px and latches.
  - The plug can be pulled out. The bank goes dark and the faders motor down to zero. Drop the plug near the jack and it reseats and recalls.
  - The Slow nights knob has detents that hang, then snap.
  - Keyboard:
    - Faders and the knob are `role="slider"` and respond to the arrow keys, Page Up/Down, Home and End.
    - The plug is a button: Enter unplugs it or plugs it back in.
    - The pilot toggles are switches.
- **The dolly (desktop, 900px and up).**
  - The same desk becomes a sticky stage, and scrolling drives one camera move: pull back, travel to Shifts, drift, travel to Slow nights, then pull out to the whole desk. The honest sentence settles underneath.
  - The camera follows a Hermite spline through six keyframes, with nonzero tangents in between, so it never stops between banks. It is smoothed with an exponential follow.
  - The camera's acceleration is fed into the cable simulation, so the cable sways when the camera moves.
- **The power strip.** Three bat-handle toggles flip on left to right on first view, with a 3D rotateX and an overshoot.
- **Libraries and build.**
  - GSAP 3.15 and ScrollTrigger are vendored in `vendor/`.
  - The cable is a 28-point Verlet rope on canvas.
  - The fader physics are hand-written springs in one requestAnimationFrame loop.
  - Fader caps are positioned with container-query units, so the same markup works vertically on desktop and horizontally on phones.

## Palette and type
| Name | Hex | Role |
|---|---|---|
| Pumice | `#cac6bc` | Matte molded panel. Warm grain, no sheen. |
| Graphite | `#222326` | Ink, slots, jacks, cable. |
| Cap | `#f3f2ee` | Fader caps, knob, small keys. |
| Owner red | `#c2311e` | Only what the owner presses. |
| Backlight | `#cfe7a6` | Lit LCDs. |

Type is B612 (Regular and Bold, OFL), the face Airbus commissioned for cockpit
displays, used throughout.

## Word count
172 visible words on the home page. Nav, form labels, form states and the
footer are excluded; numbers are counted as words.

## Illustrative vs. factual
- **Factual:** the nightly POS download, Predicted and Prep a little over, blanks with a reason, five weeks of sales, about a week of setup, free during the pilot, check the counts then decide.
- **Illustrative:** the dishes and counts are engraved "Example counts". The Shifts and Slow nights banks are concepts.

## Live vs. coming
- The "Your sales" cable is plugged into Prep only. The Shifts and Slow nights jacks are empty and their LEDs are dark.
- Their LCDs are unlit glass showing faint ghost segments of what they would display. They are never lit, and no scheduler or marketing tool is shown working.
- One sentence says it: "Prep is wired in today. Shifts and slow nights are what we're building."
- Their controls turn, but nothing they drive lights up.

## Reduced motion and no JS
- **Reduced motion:** a designed still. The desk is stacked, the cable is seated, the faders sit at their counts, Prep is lit and the other banks are dark. The controls still work, but snap without springs.
- **No JS:**
  - The faders render at their values and the ghost LCDs are static SVG.
  - A still SVG cable joins the two jacks.
  - The form posts to FormSubmit's normal (non-ajax) endpoint instead.

## Weaknesses
- Desktop dolly:
  - The final pull-out shows the whole desk at about 0.45 scale, so that frame reads small.
  - The scene costs about 2.5 screen heights of scrolling before the pilot section.
- An owner who has never touched a mixing desk may not know what the faders mean. The LCD names and counts carry it, but the metaphor is a step removed from a kitchen.
- On phones, the eight Shifts faders are small touch targets (they are decorative and keyboard reachable).
- Haptics only work on Android, and there is no sound by choice.
