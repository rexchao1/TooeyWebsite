# 29 follow the order

Concept: follow one order through the restaurant. A guest check, taken at table six, travels down the page as you scroll. It turns over into the POS ticket, folds into a point of light overnight, draws a line that becomes the short rib row on the next morning's prep sheet, and ends clipped on the ticket rail at service. The object is sharp and lit. Each room is an SVG drawn on the basalt ground, blurred and faded at its top and bottom, so the rooms run into one another and into the page. There are no frames.

Type: Gloock (display, self-hosted, OFL) and Onest (body, variable, OFL). The palette is site 21's. Material colours inside the scenes are muted: oak, steel, bottle glass, and a green awning.

No libraries. The traveler is cloned in `site.js` from the per-room stills, so each form has one source in the markup. Its path runs between the still positions and is scrubbed by scroll. Under reduced motion, without JavaScript, and below 901px, the stills show in normal flow, one per room.

## Rooms
- Door (plays on load, about 2.3s): the door leaves open, light spills on the pavement, and the blank check settles into the doorway light. Scrolling scales the street up through the door (scrubbed).
- Table: the pendant lamps come up and the candle flickers. The check is written ("6", "2 short rib", tick) on arrival.
- POS: the check turns over into the printed ticket (scrubbed). The screen tiles wake and the printer LED blinks (plays).
- Overnight: the ticket folds into a point of light (scrubbed). 42 points, the day's sales, gather into the shape of a week (plays, about 3.3s).
- Kitchen: the light stretches into a line, and the sheet opens around the short rib row (scrubbed). The other rows print, their counts run up, and "guess 40" is written and struck through (plays). Morning light rakes in.
- Service: the sheet moves up onto the rail (scrubbed). The clip lands, "sold 24" is pencilled in, the crew steps in, and the dining room fills on a slow Tuesday (plays).
- After the journey, the pilot terms and the form. The door from the hero sits open again behind "Talk to us".

## Words
Visible words on the home page: 200 with reduced motion, where every still shows. With motion on there are 186, since one traveler replaces the stills. Nav, form labels and footer are not counted.

## Critique pass (anti-cliché director, "no video on a website")
- Hard rectangles gave the scenes away as panels. The facade, the booth and the back-bar shelves now fade in from the text side, and the room masks were tightened so the gaps between rooms are shorter.
- The night room's chairs read as picture frames. They were redrawn as chairs upturned on the tables, legs up.
- The service text sat on the brightest band, the pass. The pass, rail and heat lamps were lifted above the text.
- The spark's glow banded into rings. A smoother radial falloff replaced the box-shadow stack.
- The ending was a plain form, so the open door returns behind it.

## Weakness
The traveler is the one sharp thing, so mid-transit it can pass over the edge of a text column for a moment. The overnight "week" of dots also reads a little like a chart rather than a room.
