# 45 Photo treatments

Round fifteen. Rex asked for a free way to get polished art, after Recraft's free plan turned out not to allow commercial use.
This page tests whether a free stock photo, treated in code, can look designed and still move well.
It is a comparison page, not a site.

## The photo
`prep.jpg`: a chef at a prep station, from Unsplash under its free licence (https://unsplash.com/photos/y-XZf_TNRms).
A test image only; the site would want photos taken at a real restaurant.

## Treatments
All three read the photo's luminance once, with a local contrast boost for the line and type treatments, and draw on canvas each frame through a camera (centre and zoom).
1. **Engraved lines.** One filled band per row, 4.5px apart, whose width follows the ink. A sweep draws it in, then the camera drifts. The edges fade to paper.
2. **Typed characters.** A 6×10px monospace grid, denser glyphs and stronger ink for darker cells. Types in row by row with one wrong glyph per cell, then a few cells resettle.
3. **Warm duotone.** Slate through a warm grey to porcelain, from the plain tones, with four frames of grain. Develops in from a slight zoom, then drifts.
4. **Scroll camera.** The engraving, pinned for 340vh, holds at three framings (wide, the shelf, the hands) and eases between them.
Animation runs only while a panel is on screen. Under reduced motion each panel is drawn once at rest.

## Checked
At 1440×900 in Chromium: each panel at rest, the scroll demo at its three stops.

## Weakness
The characters barely read as a photo at this size.
Engraved zooms go soft past about 2x because the photo is only 1600px wide.
Phone views were not reviewed.
