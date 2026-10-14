# 28 side track

Concept: the restaurant is one long side elevation, drawn as an architectural section at eye level. Cut slabs and cut walls are hatched, and the rooms run left to right. On desktop a sticky stage turns vertical scroll into one sideways move. Each room takes about one screen, and the track takes six screens in all. Each room's words are set on its back wall. After the prep table the page goes back to normal vertical flow for Getting started and the form.

Ground and palette are site 21's. The building is a strip of basalt lift with page ground above the roof and below the floor slab, so the scene and the page are one surface. Type is Golos Text (OFL, self-hosted variable, latin subset). There are no libraries. `site.js` does the track, the parallax, the plays, the menu and the form.

## Rooms
1. Pavement and front door (hero, plays on load): the street lamp flickers on, windows across the street light one by one, then the sign lamp and the warm doorway come on. Scrolling swings the front door open toward you. This is scroll-scrubbed.
2. Dining room, "Fuller slow nights" (plays at centre): one guest at the start. The pendants come up and two tables fill.
3. Behind the POS, "It starts at your till" (plays at centre): the screen's item rows fill and the receipt prints. A thin line leaves the printer into the ceiling slab and runs ahead of you through the rooms to the prep sheet's clip. This is scroll-scrubbed.
4. Swing door, "The right people on" (plays at centre): the door swings and a server comes through from the kitchen. The Friday board fills with people per hour (Example).
5. Kitchen line, "Closer than a guess" (plays at centre): the week's bars rise, the flat dashed guess appears, Tooey's line draws over the bars (Example). Steam rises from the pots twice.
6. Prep table, "A count for every dish, before prep" (plays at centre): the sheet's rows appear and the counts tick up. The tub levels rise.

Depth: each room has a back layer (0.82x, or 0.6x for the far buildings) and a fore layer (1.45x: lamppost, pillar, low pendant and stool, door frame, pot rack, speed rack). Each layer is aligned at its own room's centre, so nothing drifts at rest.

On phones, under reduced motion, and without JavaScript, the rooms stack as stills in normal flow. The front door is drawn half open and the swing door mid-swing. On phones the words sit above each still and the prep sheet sits below it.

## Word count
194 visible words on home, counted by script. Nav, form and footer are left out. Words drawn in the scene and the sheet are counted.

## Critique pass (design director)
- I removed the coat on the dining room hook, because it read as a ghost. I also removed a stray foot rail stub at the bar.
- Back-layer items near a room's right edge drifted into the next room's words. I pulled them inward. I clipped the far buildings to the street so they stop showing through the dining room wall.
- The pot rack sat against the kitchen headline, so I moved it right.

## Weakness
The hero's load play is quiet: lights coming on over a dark street. It is easy to miss if you scroll at once. The illustration is also flat vector with gradient light, not painted, so it reads as a clean section drawing rather than a rich lit scene.
