#!/usr/bin/env python3
"""Writes index.html for the walk-in exploration.

The restaurant is drawn as flat planes in a 1600 x 1000 box, all sharing one
vanishing point (VP). Each plane has a depth (data-z) and the camera stop it
was drawn for (data-cam). site.js moves the camera; this script only draws.

Run: python3 build.py
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
VP = (1000.0, 520.0)

# Camera stops (x, y in px at unit distance; z in depth units). Keep in sync with site.js.
STOPS = [(0, 0, 0), (0, 0, 1), (-141.4, 7, 1.55), (0, 0, 2.1), (16.4, -20.7, 2.664)]


def n(v):
    s = f'{v:.1f}'
    return s[:-2] if s.endswith('.0') else s


def pts(*ps):
    return ' '.join(f'{n(x)},{n(y)}' for x, y in ps)


def along(p, m):
    """Point p (drawn on a back wall) pushed m times further from the VP."""
    return (VP[0] + (p[0] - VP[0]) * m, VP[1] + (p[1] - VP[1]) * m)


def ray_x(p, x):
    t = (x - VP[0]) / (p[0] - VP[0])
    return (x, VP[1] + t * (p[1] - VP[1]))


def ray_y(p, y):
    t = (y - VP[1]) / (p[1] - VP[1])
    return (VP[0] + t * (p[0] - VP[0]), y)


def plane(z, cam, inner, cls='', html='', attrs=''):
    zi = int(round(1000 - z * 100))
    return (f'<div class="plane {cls}" data-z="{z}" data-cam="{cam}" style="z-index:{zi}"{attrs}>'
            f'<svg viewBox="0 0 1600 1000" focusable="false">{inner}</svg>{html}</div>\n')


def box(x, y, w, h):
    """CSS position of a rectangle in the 1600 x 1000 box."""
    return f'left:{x/16:.4f}%;top:{y/10:.4f}%;width:{w/16:.4f}%;height:{h/10:.4f}%'


# --------------------------------------------------------------------------
# Shared paint
# --------------------------------------------------------------------------
DEFS = '''
<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>
<linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" x2u="0">
  <stop offset="0" stop-color="#1c2024"/><stop offset=".5" stop-color="#262a2c"/><stop offset=".8" stop-color="#36332f"/><stop offset="1" stop-color="#433930"/>
</linearGradient>
<radialGradient id="g-glow"><stop offset="0" stop-color="#f1d2a0" stop-opacity=".95"/><stop offset=".22" stop-color="#f1d2a0" stop-opacity=".5"/><stop offset=".55" stop-color="#f1d2a0" stop-opacity=".14"/><stop offset="1" stop-color="#f1d2a0" stop-opacity="0"/></radialGradient>
<radialGradient id="g-wash"><stop offset="0" stop-color="#f1d2a0" stop-opacity=".5"/><stop offset=".6" stop-color="#f1d2a0" stop-opacity=".12"/><stop offset="1" stop-color="#f1d2a0" stop-opacity="0"/></radialGradient>
<radialGradient id="g-cool"><stop offset="0" stop-color="#e8ecea" stop-opacity=".55"/><stop offset=".5" stop-color="#e8ecea" stop-opacity=".12"/><stop offset="1" stop-color="#e8ecea" stop-opacity="0"/></radialGradient>
<radialGradient id="g-shade"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset=".6" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="g-pane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5ddb2"/><stop offset=".45" stop-color="#e2b47c"/><stop offset="1" stop-color="#9c6c45"/></linearGradient>
<linearGradient id="g-dim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c2a28"/><stop offset="1" stop-color="#211f1d"/></linearGradient>
<linearGradient id="g-curtain" x1="0" y1="0" x2="1" y2="0" spreadMethod="repeat" gradientUnits="userSpaceOnUse" x2u="0"><stop offset="0" stop-color="#ead8b6"/><stop offset=".5" stop-color="#d9bf93"/><stop offset="1" stop-color="#ead8b6"/></linearGradient>
<linearGradient id="g-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d2a0" stop-opacity=".32"/><stop offset="1" stop-color="#f1d2a0" stop-opacity="0"/></linearGradient>
<linearGradient id="g-steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d605f"/><stop offset=".3" stop-color="#a3a6a4"/><stop offset=".46" stop-color="#d6d8d4"/><stop offset=".62" stop-color="#8b8e8c"/><stop offset="1" stop-color="#4f5251"/></linearGradient>
<linearGradient id="g-steel-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9cbc7"/><stop offset=".35" stop-color="#8d908e"/><stop offset="1" stop-color="#4a4d4c"/></linearGradient>
<linearGradient id="g-steel-top" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9a9d9a"/><stop offset=".4" stop-color="#e2e3df"/><stop offset=".7" stop-color="#b6b9b5"/><stop offset="1" stop-color="#8a8d8a"/></linearGradient>
<linearGradient id="g-iron" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#151514"/><stop offset=".35" stop-color="#4a4844"/><stop offset=".5" stop-color="#2a2927"/><stop offset="1" stop-color="#131312"/></linearGradient>
<linearGradient id="g-oak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5a3e"/><stop offset="1" stop-color="#4c3525"/></linearGradient>
<linearGradient id="g-oak-h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a3324"/><stop offset=".5" stop-color="#6d4f37"/><stop offset="1" stop-color="#46301f"/></linearGradient>
<linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse" x2u="0"><stop offset="0" stop-color="#3f2e22"/><stop offset="1" stop-color="#1f1712"/></linearGradient>
<linearGradient id="g-ceil" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2c2622"/><stop offset="1" stop-color="#191614"/></linearGradient>
<linearGradient id="g-wall-l" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#4b4037"/><stop offset=".6" stop-color="#352d27"/><stop offset="1" stop-color="#241f1b"/></linearGradient>
<linearGradient id="g-wall-r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4b4037"/><stop offset=".6" stop-color="#352d27"/><stop offset="1" stop-color="#241f1b"/></linearGradient>
<linearGradient id="g-wain-l" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#3f2d20"/><stop offset="1" stop-color="#1e1611"/></linearGradient>
<linearGradient id="g-wain-r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3f2d20"/><stop offset="1" stop-color="#1e1611"/></linearGradient>
<linearGradient id="g-tile-l" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#5f5a53"/><stop offset=".5" stop-color="#433f3a"/><stop offset="1" stop-color="#282624"/></linearGradient>
<linearGradient id="g-tile-r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5f5a53"/><stop offset=".5" stop-color="#433f3a"/><stop offset="1" stop-color="#282624"/></linearGradient>
<linearGradient id="g-kfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c3a31"/><stop offset="1" stop-color="#211915"/></linearGradient>
<linearGradient id="g-jacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece5d6"/><stop offset=".5" stop-color="#c3bcb0"/><stop offset="1" stop-color="#7d786f"/></linearGradient>
<linearGradient id="g-heat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1c58a" stop-opacity=".42"/><stop offset="1" stop-color="#f1d2a0" stop-opacity="0"/></linearGradient>
<linearGradient id="g-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f3ee"/><stop offset="1" stop-color="#e4e1d9"/></linearGradient>
<linearGradient id="g-board" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6a4e37"/><stop offset="1" stop-color="#3f2d20"/></linearGradient>
<linearGradient id="g-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b343a"/><stop offset="1" stop-color="#1f262b"/></linearGradient>
<linearGradient id="g-printer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4b4c"/><stop offset=".3" stop-color="#2d2e2f"/><stop offset="1" stop-color="#1b1c1d"/></linearGradient>
<linearGradient id="g-top-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="g-awning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f3a32"/><stop offset="1" stop-color="#465a4b"/></linearGradient>
<linearGradient id="g-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a6158"/><stop offset="1" stop-color="#433c35"/></linearGradient>
<pattern id="p-brick" width="48" height="26" patternUnits="userSpaceOnUse">
  <rect width="48" height="26" fill="#33251e"/>
  <rect x="1" y="1" width="46" height="11" fill="#523629"/><rect x="-23" y="14" width="46" height="11" fill="#4a3025"/><rect x="25" y="14" width="46" height="11" fill="#57392b"/>
  <rect x="1" y="1" width="46" height="2" fill="#6a4a3a" opacity=".5"/>
</pattern>
<pattern id="p-brick2" width="48" height="26" patternUnits="userSpaceOnUse">
  <rect width="48" height="26" fill="#241b17"/>
  <rect x="1" y="1" width="46" height="11" fill="#3a2a22"/><rect x="-23" y="14" width="46" height="11" fill="#34261f"/><rect x="25" y="14" width="46" height="11" fill="#3e2c23"/>
</pattern>
<pattern id="p-tile" width="28" height="14" patternUnits="userSpaceOnUse">
  <rect width="28" height="14" fill="#3a3733"/>
  <rect x=".8" y=".8" width="26.4" height="5.6" rx="1" fill="#6c675f"/><rect x="-13.2" y="7.8" width="26.4" height="5.6" rx="1" fill="#67625a"/><rect x="14.8" y="7.8" width="26.4" height="5.6" rx="1" fill="#706b63"/>
  <rect x=".8" y=".8" width="26.4" height="1.2" fill="#8d877d" opacity=".55"/>
</pattern>
<pattern id="p-tile-xl" width="240" height="120" patternUnits="userSpaceOnUse">
  <rect width="240" height="120" fill="#2e2c29"/>
  <rect x="6" y="6" width="228" height="48" rx="8" fill="#56524c"/><rect x="-114" y="66" width="228" height="48" rx="8" fill="#524e48"/><rect x="126" y="66" width="228" height="48" rx="8" fill="#5a564f"/>
</pattern>
<pattern id="p-plaster" width="160" height="160" patternUnits="userSpaceOnUse">
  <rect width="160" height="160" fill="#4a3f36"/>
</pattern>
<filter id="f-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="f-blur3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
<clipPath id="c-slot"><rect x="1200" y="-200" width="400" height="790"/></clipPath>
</defs></svg>
'''.replace(' x2u="0"', '')

# userSpaceOnUse gradients need coordinates; patch the ones that use it.
DEFS = DEFS.replace('<linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">',
                    '<linearGradient id="g-sky" x1="0" y1="-500" x2="0" y2="700" gradientUnits="userSpaceOnUse">')
DEFS = DEFS.replace('<linearGradient id="g-curtain" x1="0" y1="0" x2="1" y2="0" spreadMethod="repeat" gradientUnits="userSpaceOnUse">',
                    '<linearGradient id="g-curtain" x1="0" y1="0" x2="14" y2="0" spreadMethod="repeat" gradientUnits="userSpaceOnUse">')
DEFS = DEFS.replace('<linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">',
                    '<linearGradient id="g-floor" x1="0" y1="600" x2="0" y2="1100" gradientUnits="userSpaceOnUse">')


# --------------------------------------------------------------------------
# Room 0: the street at dusk (camera stop 0)
# --------------------------------------------------------------------------
def street():
    out = []
    # Sky and the far end of the street.
    sky = ['<rect x="-1000" y="-800" width="3600" height="1110" fill="url(#g-sky)"/>']
    # distant rooftops beyond the side street
    sky.append('<path d="M-1000 262 L-760 262 L-760 236 L-600 236 L-600 250 L-420 250 L-420 222 L-330 222 L-330 244 L-120 244 L-120 258 L120 258 L120 246 L330 246 L330 262 L600 262 L600 300 L-1000 300 Z" fill="#24231f"/>')
    for x, y in [(-560, 246), (-380, 232), (-260, 254), (60, 270), (250, 256)]:
        sky.append(f'<rect class="on" style="--d:1.2s" x="{x}" y="{y}" width="7" height="9" fill="#f1d2a0" opacity=".45"/>')
    sky.append('<ellipse cx="300" cy="300" rx="900" ry="90" fill="url(#g-wash)" opacity=".14"/>')

    f = []
    f.append(''.join(sky))
    # street, curb, sidewalk
    f.append('<rect x="-1000" y="640" width="3600" height="1200" fill="#22211f"/>')
    f.append('<rect x="-1000" y="662" width="3600" height="80" fill="#3a3733"/>')
    for x in range(-1000, 2640, 84):
        a = (x, 662)
        b = ray_y(a, 742) if x != 1000 else (1000, 742)
        f.append(f'<line x1="{n(a[0])}" y1="662" x2="{n(b[0])}" y2="742" stroke="#2c2a27" stroke-width="2"/>')
    f.append('<line x1="-1000" y1="698" x2="2600" y2="698" stroke="#2f2d2a" stroke-width="1.5"/>')
    f.append('<rect x="-1000" y="742" width="3600" height="14" fill="#4c4842"/><rect x="-1000" y="742" width="3600" height="2" fill="#625d55"/>')
    f.append('<rect x="-1000" y="756" width="3600" height="12" fill="#151413" opacity=".7"/>')
    # wet street reflections of the lit front
    f.append('<g class="on" style="--d:1.6s">'
             '<ellipse cx="780" cy="840" rx="120" ry="90" fill="url(#g-wash)" opacity=".45"/>'
             '<ellipse cx="1250" cy="840" rx="150" ry="90" fill="url(#g-wash)" opacity=".45"/>'
             '<ellipse cx="1000" cy="850" rx="90" ry="110" fill="url(#g-wash)" opacity=".6"/>'
             '</g>')
    # neighbour on the left: low, plain, dark
    f.append('<rect x="-1000" y="296" width="1600" height="366" fill="url(#p-brick2)"/>')
    f.append('<rect x="-1000" y="296" width="1600" height="366" fill="#1f1d1b" opacity=".72"/>')
    f.append('<rect x="-1000" y="286" width="1600" height="14" fill="#3a3632"/><rect x="-1000" y="286" width="1600" height="2" fill="#57514a"/>')
    f.append('<rect x="-1000" y="300" width="1600" height="80" fill="url(#g-top-dark)" opacity=".6"/>')
    f.append('<ellipse cx="560" cy="470" rx="160" ry="220" fill="url(#g-wash)" opacity=".12" class="on" style="--d:1s"/>')
    f.append('<rect x="566" y="300" width="9" height="362" fill="#1f1d1b"/><rect x="568" y="300" width="2" height="362" fill="#3d3a36"/>')
    f.append('<rect x="-1000" y="640" width="1600" height="22" fill="#211f1d"/>')
    # building to the right of the restaurant
    f.append('<rect x="1480" y="40" width="1120" height="622" fill="url(#p-brick2)"/>')
    f.append('<rect x="1480" y="40" width="1120" height="622" fill="url(#g-top-dark)" opacity=".6"/>')
    for x in (1560, 1740, 1920):
        f.append(f'<rect x="{x}" y="150" width="96" height="120" fill="#1b1d1f"/><rect x="{x}" y="270" width="96" height="8" fill="#463f38"/>')
        f.append(f'<rect x="{x}" y="420" width="96" height="200" fill="#1c1c1c"/>')
    # the restaurant: brick with the door cut out
    f.append('<path fill-rule="evenodd" d="M600 90 H1480 V662 H600 Z M920 466 V662 H1080 V466 Z" fill="url(#p-brick)"/>')
    f.append('<path fill-rule="evenodd" d="M600 90 H1480 V662 H600 Z M920 466 V662 H1080 V466 Z" fill="url(#g-top-dark)" opacity=".7"/>')
    # cornices
    f.append('<rect x="588" y="64" width="904" height="30" fill="url(#g-stone)"/><rect x="588" y="64" width="904" height="3" fill="#867b6e"/>')
    for x in range(600, 1480, 22):
        f.append(f'<rect x="{x}" y="94" width="12" height="9" fill="#3f3832"/>')
    f.append('<rect x="596" y="318" width="888" height="18" fill="url(#g-stone)"/><rect x="596" y="318" width="888" height="2" fill="#867b6e"/>')
    # upper windows, one lived-in
    for i, x in enumerate((664, 852, 1088, 1276)):
        f.append(f'<rect x="{x - 6}" y="146" width="132" height="136" fill="#2b231e"/>')
        f.append(f'<rect x="{x}" y="152" width="120" height="122" fill="#1b1e21"/>')
        f.append(f'<path d="M{x} 152 L{x + 60} 152 L{x} 222 Z" fill="#fff" opacity=".05"/>')
        if i == 3:
            f.append(f'<g class="on" style="--d:1.9s"><rect x="{x}" y="152" width="120" height="122" fill="url(#g-pane)" opacity=".75"/>'
                     f'<rect x="{x + 70}" y="152" width="50" height="122" fill="#d6b88a" opacity=".85"/></g>')
        f.append(f'<rect x="{x + 57}" y="152" width="6" height="122" fill="#2b231e"/><rect x="{x}" y="210" width="120" height="6" fill="#2b231e"/>')
        f.append(f'<rect x="{x - 10}" y="282" width="140" height="10" fill="url(#g-stone)"/>')
    # pilasters
    for x in (600, 1448):
        f.append(f'<rect x="{x}" y="336" width="32" height="326" fill="url(#g-stone)"/><rect x="{x}" y="336" width="3" height="326" fill="#7d7266" opacity=".7"/>')
    # sign board with a bowl, three gooseneck lamps
    f.append('<rect x="700" y="340" width="680" height="50" rx="3" fill="#24211e"/>')
    f.append('<rect x="706" y="346" width="668" height="38" rx="2" fill="none" stroke="#8d7756" stroke-width="1.5" opacity=".8"/>')
    f.append('<g fill="none" stroke="#cdb994" stroke-width="2.4" stroke-linecap="round">'
             '<path d="M1018 362 H1062 Q1060 378 1040 378 Q1020 378 1018 362 Z"/>'
             '<path d="M1032 356 q-3 -4 0 -8 M1042 356 q-3 -4 0 -8 M1052 356 q-3 -4 0 -8"/></g>')
    for x in (790, 1040, 1290):
        f.append(f'<path d="M{x} 316 V300 Q{x} 292 {x + 12} 292 Q{x + 26} 292 {x + 26} 306" fill="none" stroke="#151413" stroke-width="3"/>')
        f.append(f'<path d="M{x + 16} 306 H{x + 36} L{x + 32} 316 H{x + 20} Z" fill="#1d1c1a"/>')
        f.append(f'<g class="on flick" style="--d:{0.35 + (x - 790) / 1700:.2f}s">'
                 f'<path d="M{x + 20} 316 H{x + 32} L{x + 80} 390 H{x - 28} Z" fill="url(#g-cone)" opacity=".9"/>'
                 f'<ellipse cx="{x + 26}" cy="318" rx="16" ry="5" fill="#f6e2bd"/>'
                 f'<ellipse cx="{x + 26}" cy="364" rx="70" ry="26" fill="url(#g-wash)" opacity=".7"/></g>')
    # ground floor windows
    for (x0, x1, d) in ((660, 900, 0.9), (1100, 1400, 1.2)):
        w = x1 - x0
        f.append(f'<rect x="{x0 - 10}" y="460" width="{w + 20}" height="196" fill="#2b2019"/>')
        f.append(f'<rect x="{x0}" y="470" width="{w}" height="172" fill="url(#g-dim)"/>')
        f.append(f'<rect x="{x0}" y="560" width="{w}" height="82" fill="#4a4238"/>')
        f.append(f'<g class="on" style="--d:{d}s">'
                 f'<rect x="{x0}" y="470" width="{w}" height="172" fill="url(#g-pane)"/>'
                 # pendant bulbs and heads inside, above the curtain
                 f'<g fill="#3b2a1e">'
                 f'<path d="M{x0 + w * .3 - 14} 506 Q{x0 + w * .3} 488 {x0 + w * .3 + 14} 506 Z"/>'
                 f'<path d="M{x0 + w * .72 - 14} 500 Q{x0 + w * .72} 482 {x0 + w * .72 + 14} 500 Z"/></g>'
                 f'<circle cx="{x0 + w * .3}" cy="510" r="5" fill="#fff6e0"/><circle cx="{x0 + w * .72}" cy="504" r="5" fill="#fff6e0"/>'
                 f'<g fill="#6b4a32" opacity=".55">'
                 f'<path d="M{x0 + w * .2 - 20} 562 Q{x0 + w * .2 - 19} 550 {x0 + w * .2 - 8} 549 A10 10 0 1 1 {x0 + w * .2 + 8} 549 Q{x0 + w * .2 + 19} 550 {x0 + w * .2 + 20} 562 Z"/>'
                 f'<path d="M{x0 + w * .64 - 22} 562 Q{x0 + w * .64 - 21} 548 {x0 + w * .64 - 9} 547 A11 11 0 1 1 {x0 + w * .64 + 9} 547 Q{x0 + w * .64 + 21} 548 {x0 + w * .64 + 22} 562 Z"/></g>'
                 f'<rect x="{x0}" y="560" width="{w}" height="82" fill="url(#g-curtain)" opacity=".95"/>'
                 f'</g>')
        f.append(f'<rect x="{x0}" y="557" width="{w}" height="3" fill="#a88d5e"/>')
        f.append(f'<rect x="{x0 + w / 2 - 3}" y="470" width="6" height="172" fill="#2b2019"/>')
        f.append(f'<path d="M{x0} 470 L{x0 + w * .4} 470 L{x0} 600 Z" fill="#fff" opacity=".05"/>')
        f.append(f'<rect x="{x0 - 14}" y="642" width="{w + 28}" height="12" fill="url(#g-stone)"/>')
    # awning
    aw = ['<path d="M630 394 H1450 L1468 444 H612 Z" fill="url(#g-awning)"/>']
    for i in range(21):
        x = 630 + i * 40
        aw.append(f'<path d="M{x} 394 H{x + 20} L{x + 20 + 0.9 * (x - 1000) / 22:.1f} 444 H{x + 0.9 * (x - 1000) / 22:.1f} Z" fill="#53695a" opacity=".55"/>')
    sc = ''.join(f'Q{612 + i * 40.2 + 20.1:.1f} 466 {612 + (i + 1) * 40.2:.1f} 444 ' for i in range(21))
    aw.append(f'<path d="M612 444 {sc} Z" fill="#3c4d40"/>')
    aw.append('<rect x="612" y="442" width="856" height="3" fill="#6a8170" opacity=".6"/>')
    f.append(''.join(aw))
    f.append('<rect x="600" y="458" width="880" height="30" fill="url(#g-top-dark)" opacity=".8"/>')
    # door frame, threshold, glow through
    f.append('<rect x="908" y="454" width="184" height="12" fill="#2b2019"/><rect x="908" y="454" width="12" height="208" fill="#2b2019"/><rect x="1080" y="454" width="12" height="208" fill="#2b2019"/>')
    f.append('<rect x="900" y="660" width="200" height="8" fill="#5a534b"/>')
    # planters
    for x in (868, 1132):
        f.append(f'<rect x="{x - 20}" y="618" width="40" height="44" fill="#2f2b27"/><rect x="{x - 20}" y="618" width="40" height="3" fill="#4d4740"/>')
        f.append(f'<ellipse cx="{x}" cy="606" rx="26" ry="22" fill="#2f3a2e"/><ellipse cx="{x - 6}" cy="598" rx="14" ry="10" fill="#3b4a39"/>')
    # light spilling onto the pavement
    f.append('<g class="on" style="--d:1.5s">'
             '<path d="M920 662 H1080 L1180 742 H820 Z" fill="#f1d2a0" opacity=".16"/>'
             '<ellipse cx="1000" cy="700" rx="200" ry="40" fill="url(#g-wash)"/>'
             '<path d="M660 654 H900 L940 742 H600 Z" fill="#f1d2a0" opacity=".07"/>'
             '<path d="M1100 654 H1400 L1470 742 H1060 Z" fill="#f1d2a0" opacity=".07"/>'
             '</g>')
    html = ('<div class="door" style="' + box(920, 466, 160, 196) + ';--persp:24cqw">'
            '<div class="leaf leaf-l">' + leaf_front('l') + '</div>'
            '<div class="leaf leaf-r">' + leaf_front('r') + '</div></div>')
    out.append(plane(0.7, 0, ''.join(f), cls='wall', html=html, attrs=' data-split="1000" data-open="0.16,0.42" data-part="0.4,0.64"'))

    # street lamp, close by on the right
    lp = []
    # the near pavement we stand on
    lp.append('<rect x="-1000" y="884" width="3600" height="900" fill="#34312d"/>')
    lp.append('<rect x="-1000" y="874" width="3600" height="14" fill="#4f4a43"/><rect x="-1000" y="874" width="3600" height="2" fill="#6a645b"/>')
    for x in range(-1000, 2600, 230):
        e = ray_y((x, 888), 1200) if x != 1000 else (1000, 1200)
        lp.append(f'<line x1="{x}" y1="888" x2="{n(e[0])}" y2="1200" stroke="#27251f" stroke-width="2.5"/>')
    lp.append('<ellipse cx="1440" cy="900" rx="420" ry="60" fill="url(#g-wash)" opacity=".3" class="on" style="--d:.05s"/>')
    lp.append('<ellipse cx="1540" cy="1000" rx="90" ry="14" fill="url(#g-shade)"/>')
    lp.append('<path d="M1520 1010 L1526 930 L1532 330 L1548 330 L1554 930 L1560 1010 Z" fill="url(#g-iron)"/>')
    lp.append('<rect x="1512" y="900" width="56" height="18" rx="4" fill="url(#g-iron)"/>')
    lp.append('<path d="M1540 330 V230 Q1540 180 1490 180 H1440" fill="none" stroke="#1a1918" stroke-width="10"/>')
    lp.append('<path d="M1412 180 H1468 L1460 206 L1464 260 H1416 L1420 206 Z" fill="#181716"/>')
    lp.append('<g class="on" style="--d:.05s"><ellipse cx="1440" cy="290" rx="230" ry="200" fill="url(#g-glow)" opacity=".55"/>'
              '<rect x="1424" y="208" width="32" height="50" fill="#f8e6c4"/>'
              '<path d="M1542 330 V930" stroke="#f1d2a0" stroke-width="2" opacity=".35"/></g>')
    lp.append('<path d="M1416 260 H1464" stroke="#2a2826" stroke-width="4"/>')
    out.append(plane(0.3, 0, ''.join(lp)))
    return ''.join(out)


def leaf_front(side):
    # one leaf of the front door; the glass is left clear so the dining room shows through
    handle_x = 66 if side == 'l' else 10
    return ('<svg viewBox="0 0 80 196" preserveAspectRatio="none" focusable="false">'
            '<path fill-rule="evenodd" d="M0 0 H80 V196 H0 Z M11 12 V140 H69 V12 Z" fill="url(#g-oak)"/>'
            '<rect x="11" y="12" width="58" height="128" fill="#f1d2a0" opacity=".1"/>'
            '<path d="M11 12 L44 12 L11 70 Z" fill="#fff" opacity=".08"/>'
            '<rect x="0" y="0" width="80" height="196" fill="none" stroke="#2b2019" stroke-width="2"/>'
            '<rect x="8" y="152" width="64" height="34" fill="#9b8a6c" opacity=".55"/>'
            f'<rect x="{handle_x}" y="74" width="4" height="52" rx="2" fill="#c9ad7c"/>'
            '</svg>')


# --------------------------------------------------------------------------
# Room 1: the dining room (camera stop 1)
# --------------------------------------------------------------------------
def dining():
    out = []
    LT, RT, LB, RB = (721, 408), (1279, 408), (721, 619), (1279, 619)
    L_top, L_bot = ray_x(LT, -1000), ray_x(LB, -1000)
    R_top, R_bot = ray_x(RT, 2600), ray_x(RB, 2600)
    b = []
    b.append('<rect x="-1000" y="500" width="3600" height="1300" fill="url(#g-floor)"/>')
    for i in range(31):
        x0 = 721 + i * 558 / 30
        e = ray_y((x0, 619), 1800) if abs(x0 - 1000) > 0.5 else (1000, 1800)
        b.append(f'<line x1="{n(x0)}" y1="619" x2="{n(e[0])}" y2="1800" stroke="#1c140e" stroke-width="1.4" opacity=".7"/>')
    for m in (1.12, 1.3, 1.55, 1.95, 2.6, 3.8):
        y = 520 + 99 * m
        b.append(f'<line x1="-1000" y1="{n(y)}" x2="2600" y2="{n(y)}" stroke="#1c140e" stroke-width="{0.8 * m:.1f}" opacity=".35" stroke-dasharray="{60 * m:.0f} {140 * m:.0f}"/>')
    b.append('<g class="on" style="--d:0s"><ellipse cx="1150" cy="690" rx="300" ry="60" fill="url(#g-wash)" opacity=".5"/>'
             '<ellipse cx="830" cy="660" rx="200" ry="34" fill="url(#g-wash)" opacity=".4"/></g>')
    # ceiling and beams
    b.append(f'<polygon points="{pts(LT, RT, R_top, (2600, -800), (-1000, -800), L_top)}" fill="url(#g-ceil)"/>')
    for d in (0.66, 0.55, 0.44, 0.33, 0.22):
        m = 0.75 / d
        y = 520 - 112 * m
        xl, xr = 1000 - 279 * m, 1000 + 279 * m
        t = 7 * m
        b.append(f'<rect x="{n(xl)}" y="{n(y)}" width="{n(xr - xl)}" height="{n(t)}" fill="#2d2119"/>'
                 f'<rect x="{n(xl)}" y="{n(y + t)}" width="{n(xr - xl)}" height="{n(1.2 * m)}" fill="#4a3727" opacity=".7"/>')
    # side walls
    b.append(f'<polygon points="{pts(LT, L_top, L_bot, LB)}" fill="url(#g-wall-l)"/>')
    b.append(f'<polygon points="{pts(RT, R_top, R_bot, RB)}" fill="url(#g-wall-r)"/>')
    wl, wr = ray_x((721, 557), -1000), ray_x((1279, 557), 2600)
    b.append(f'<polygon points="{pts((721, 557), wl, L_bot, LB)}" fill="url(#g-wain-l)"/>')
    b.append(f'<polygon points="{pts((1279, 557), wr, R_bot, RB)}" fill="url(#g-wain-r)"/>')
    b.append(f'<line x1="721" y1="557" x2="{n(wl[0])}" y2="{n(wl[1])}" stroke="#6b4f39" stroke-width="3"/>')
    b.append(f'<line x1="1279" y1="557" x2="{n(wr[0])}" y2="{n(wr[1])}" stroke="#6b4f39" stroke-width="3"/>')
    # sconces on the side walls
    for side in (-1, 1):
        for m, dl in ((1.35, 0.15), (1.9, 0.3), (2.9, 0.45)):
            if side < 0 and m > 2:
                continue
            px, py = along((1000 + side * 279, 474), m)
            b.append(f'<g class="on" style="--d:{dl}s"><ellipse cx="{n(px)}" cy="{n(py)}" rx="{n(70 * m)}" ry="{n(90 * m)}" fill="url(#g-wash)" opacity=".55"/></g>')
            b.append(f'<rect x="{n(px - 3 * m)}" y="{n(py - 4 * m)}" width="{n(6 * m)}" height="{n(14 * m)}" fill="#8f7550"/>'
                     f'<path d="M{n(px - 9 * m)} {n(py - 8 * m)} H{n(px + 9 * m)} L{n(px + 6 * m)} {n(py - 18 * m)} H{n(px - 6 * m)} Z" fill="#e7d3ad"/>')
    # back wall with the kitchen door cut out
    b.append('<path fill-rule="evenodd" d="M721 408 H1279 V619 H721 Z M966 489 V619 H1034 V489 Z" fill="#4e4238"/>')
    b.append('<rect x="721" y="408" width="558" height="60" fill="url(#g-top-dark)" opacity=".6"/>')
    b.append('<path d="M721 557 H966 V619 H721 Z M1034 557 H1279 V619 H1034 Z" fill="#3e2c20"/>')
    b.append('<path d="M721 557 H966 M1034 557 H1279" stroke="#6b4f39" stroke-width="2.5"/>')
    b.append('<g class="on" style="--d:0s"><ellipse cx="1000" cy="470" rx="300" ry="90" fill="url(#g-wash)" opacity=".45"/></g>')
    # door frame and a clock above it
    b.append('<path d="M958 619 V481 H1042 V619 H1034 V489 H966 V619 Z" fill="#2b2019"/>')
    b.append('<circle cx="1000" cy="446" r="15" fill="#e8e1d3"/><circle cx="1000" cy="446" r="15" fill="none" stroke="#2b2019" stroke-width="2.5"/>'
             '<path d="M1000 446 V436 M1000 446 L1007 450" stroke="#2b2019" stroke-width="1.8" stroke-linecap="round"/>')
    # glass shelf on the left
    b.append('<rect x="742" y="472" width="196" height="4" fill="#6b4f39"/>')
    for i in range(12):
        x = 750 + i * 15.5
        b.append(f'<path d="M{n(x)} 457 h8 q0 7 -4 8 v6 h3 v1 h-7 v-1 h3 v-6 q-4 -1 -4 -8 Z" fill="#cfd3cf" fill-opacity=".14" stroke="#d9dcd7" stroke-opacity=".55" stroke-width=".6"/>'
                 f'<path d="M{n(x + 1.4)} 458 q0 4 1.2 5.5" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width=".7"/>')
    # wine shelf on the right
    b.append('<rect x="1084" y="438" width="172" height="112" fill="#2a2019"/>')
    cols = ['#2c3a2c', '#3d2a24', '#1f2a22', '#4a3a26']
    for r, y in enumerate((464, 492, 520, 548)):
        b.append(f'<rect x="1084" y="{y}" width="172" height="3" fill="#5a4330"/>')
        for i in range(14):
            x = 1090 + i * 11.6
            b.append(f'<rect x="{n(x)}" y="{y - 22}" width="7" height="22" rx="2" fill="{cols[(i + r) % 4]}"/>'
                     f'<rect x="{n(x + 1.5)}" y="{y - 20}" width="1.2" height="14" fill="#c9c6b2" opacity=".35"/>')
    # still view only: the kitchen glow through the door
    b.append('<rect class="still-only" x="966" y="489" width="68" height="130" fill="#8e8a80"/>')
    html = ('<div class="door door-swing" style="' + box(966, 489, 68, 130) + ';--persp:9cqw">'
            '<div class="leaf leaf-s">' + leaf_swing() + '</div></div>')
    out.append(plane(1.75, 1, ''.join(b), cls='wall', html=html, attrs=' data-split="1000" data-open="1.56,1.64" data-part="1.63,1.72"'))

    # far pendants
    p = []
    for x, dl in ((1150, 0), (860, 0)):
        p.append(pendant(x, 425, 28, dl))
    out.append(plane(1.55, 1, ''.join(p)))

    # tables in the middle of the room
    t = []
    t.append(table(720, 685, 1.0, lamp_delay=0.25, diners=[(-52, 0.6)]))
    t.append(table(1160, 685, 1.0, lamp_delay=None, diners=[(-52, None), (52, 1.7)]))
    t.append(table(1330, 685, 1.0, lamp_delay=0.9, diners=[(-52, 1.2), (52, 1.4)]))
    out.append(plane(1.45, 1, ''.join(t), cls='fade'))

    out.append(plane(1.3, 1, pendant(1300, 362, 48, 0), cls='fade'))

    fr = []
    # banquette on the left
    fr.append('<ellipse cx="-200" cy="1000" rx="800" ry="60" fill="url(#g-shade)"/>')
    fr.append('<linearGradient id="g-booth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b2f28"/><stop offset=".5" stop-color="#33201b"/><stop offset="1" stop-color="#1e1411"/></linearGradient>')
    fr.append('<path d="M-1000 650 H322 Q392 650 398 716 V1300 H-1000 Z" fill="url(#g-booth)"/>')
    for x in range(-40, 340, 64):
        fr.append(f'<path d="M{x} 668 V1300" stroke="#1c120e" stroke-width="3" opacity=".7"/><path d="M{x + 3} 668 V1300" stroke="#7a5244" stroke-width="1.4" opacity=".35"/>')
    fr.append('<path d="M-1000 652 H322 Q392 652 398 716" fill="none" stroke="#7d5446" stroke-width="5" opacity=".8"/>')
    fr.append('<path d="M-1000 662 H320 Q382 664 390 716" fill="none" stroke="#1a100c" stroke-width="3" opacity=".6"/>')
    fr.append('<ellipse cx="300" cy="700" rx="260" ry="80" fill="url(#g-wash)" opacity=".25"/>')
    fr.append(table(1530, 891, 2.25, lamp_delay=None, diners=[], big=True))
    out.append(plane(1.2, 1, ''.join(fr), cls='fade'))
    return ''.join(out)


def leaf_swing():
    return ('<svg viewBox="0 0 68 130" preserveAspectRatio="none" focusable="false">'
            '<path fill-rule="evenodd" d="M0 0 H68 V130 H0 Z M34 24 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0 Z" fill="url(#g-steel)"/>'
            '<circle cx="34" cy="24" r="13" fill="none" stroke="#2a2a29" stroke-width="2.5"/>'
            '<circle cx="34" cy="24" r="13" fill="#e8ecea" opacity=".12"/>'
            '<rect x="4" y="96" width="60" height="30" fill="#6d706e"/>'
            '<rect x="0" y="0" width="68" height="130" fill="none" stroke="#2a2a29" stroke-width="2"/>'
            '</svg>')


def pendant(x, y, r, delay):
    return (f'<line x1="{x}" y1="-900" x2="{x}" y2="{y - r * .6:.1f}" stroke="#141210" stroke-width="{max(1.5, r / 18):.1f}"/>'
            f'<g class="on" style="--d:{delay}s">'
            f'<path d="M{x - r * 1.6:.1f} {y + r * .55:.1f} L{x + r * 1.6:.1f} {y + r * .55:.1f} L{x + r * 4:.1f} {y + r * 7:.1f} L{x - r * 4:.1f} {y + r * 7:.1f} Z" fill="url(#g-cone)" opacity=".5"/>'
            f'<ellipse cx="{x}" cy="{y + r * .6:.1f}" rx="{r * 3.2:.1f}" ry="{r * 3:.1f}" fill="url(#g-glow)" opacity=".75"/></g>'
            f'<path d="M{x - r} {y + r * .55:.1f} Q{x - r} {y - r * .5:.1f} {x} {y - r * .55:.1f} Q{x + r} {y - r * .5:.1f} {x + r} {y + r * .55:.1f} Z" fill="#cfc6b6"/>'
            f'<path d="M{x - r} {y + r * .55:.1f} Q{x - r} {y - r * .5:.1f} {x} {y - r * .55:.1f} Q{x - r * .4:.1f} {y - r * .2:.1f} {x - r * .55:.1f} {y + r * .55:.1f} Z" fill="#eee7da" opacity=".7"/>'
            f'<ellipse cx="{x}" cy="{y + r * .55:.1f}" rx="{r}" ry="{r * .14:.1f}" fill="#fbe7c0"/>')


def table(cx, floor, k, lamp_delay=None, diners=(), big=False):
    """A two-top on an oak pedestal; k scales it (1 = in the middle of the room)."""
    s = k
    top = floor - 85 * s
    g = []
    g.append(f'<ellipse cx="{cx}" cy="{floor}" rx="{70 * s:.1f}" ry="{7 * s:.1f}" fill="url(#g-shade)"/>')
    # chairs
    for side in (-1, 1):
        x = cx + side * 52 * s
        g.append(f'<path d="M{x - 12 * s:.1f} {floor:.1f} V{floor - 44 * s:.1f} H{x + 12 * s:.1f} V{floor:.1f}" fill="none" stroke="#24180f" stroke-width="{3 * s:.1f}"/>')
        bx = x + side * 11 * s
        g.append(f'<path d="M{bx:.1f} {floor - 44 * s:.1f} V{floor - 100 * s:.1f} Q{bx:.1f} {floor - 116 * s:.1f} {bx - side * 10 * s:.1f} {floor - 116 * s:.1f}" fill="none" stroke="#24180f" stroke-width="{3.2 * s:.1f}"/>')
    # diners
    for dx, dl in diners:
        x = cx + dx * s
        cls = f' class="on" style="--d:{dl}s"' if dl is not None else ''
        sd = -1 if dx > 0 else 1  # side facing the table
        hy = floor - 127 * s
        g.append(f'<g{cls}><path d="M{x - 17 * s:.1f} {top + 2 * s:.1f} L{x - 16 * s:.1f} {floor - 102 * s:.1f} Q{x - 15 * s:.1f} {floor - 113 * s:.1f} {x - 5 * s:.1f} {floor - 115 * s:.1f} '
                 f'L{x + 5 * s:.1f} {floor - 115 * s:.1f} Q{x + 15 * s:.1f} {floor - 113 * s:.1f} {x + 16 * s:.1f} {floor - 102 * s:.1f} L{x + 17 * s:.1f} {top + 2 * s:.1f} Z" fill="#221c18"/>'
                 f'<rect x="{x - 3.5 * s:.1f}" y="{hy + 6 * s:.1f}" width="{7 * s:.1f}" height="{8 * s:.1f}" fill="#221c18"/>'
                 f'<ellipse cx="{x + sd * 1.5 * s:.1f}" cy="{hy:.1f}" rx="{9.5 * s:.1f}" ry="{10.5 * s:.1f}" fill="#221c18"/>'
                 f'<path d="M{x + sd * 16 * s:.1f} {top:.1f} L{x + sd * 15.5 * s:.1f} {floor - 103 * s:.1f} Q{x + sd * 14 * s:.1f} {floor - 113 * s:.1f} {x + sd * 4 * s:.1f} {floor - 115 * s:.1f}" fill="none" stroke="#f1d2a0" stroke-width="{1.3 * s:.1f}" opacity=".45"/>'
                 f'<path d="M{x + sd * 9 * s:.1f} {hy - 5 * s:.1f} Q{x + sd * 12 * s:.1f} {hy + 2 * s:.1f} {x + sd * 7 * s:.1f} {hy + 9 * s:.1f}" fill="none" stroke="#f1d2a0" stroke-width="{1.2 * s:.1f}" opacity=".45"/></g>')
    # pedestal and top
    g.append(f'<rect x="{cx - 3 * s:.1f}" y="{top:.1f}" width="{6 * s:.1f}" height="{85 * s:.1f}" fill="#24180f"/>')
    g.append(f'<ellipse cx="{cx}" cy="{floor - 1:.1f}" rx="{20 * s:.1f}" ry="{3 * s:.1f}" fill="#24180f"/>')
    w = 40 * s
    g.append(f'<rect x="{cx - w:.1f}" y="{top - 12 * s:.1f}" width="{2 * w:.1f}" height="{7 * s:.1f}" fill="#7a5a3f"/>')
    g.append(f'<rect x="{cx - w:.1f}" y="{top - 5 * s:.1f}" width="{2 * w:.1f}" height="{6 * s:.1f}" fill="#46301f"/>')
    # plates and a glass
    g.append(f'<ellipse cx="{cx - 18 * s:.1f}" cy="{top - 10 * s:.1f}" rx="{10 * s:.1f}" ry="{2.4 * s:.1f}" fill="#e9e6df"/>')
    g.append(f'<ellipse cx="{cx + 6 * s:.1f}" cy="{top - 9.5 * s:.1f}" rx="{9 * s:.1f}" ry="{2.2 * s:.1f}" fill="#dedad1"/>')
    g.append(f'<path d="M{cx - 2 * s:.1f} {top - 26 * s:.1f} h{6 * s:.1f} q0 {7 * s:.1f} -{3 * s:.1f} {8 * s:.1f} v{5 * s:.1f} h-{0.1 * s:.1f} Z" fill="#d7dcd8" opacity=".6"/>')
    # lamp
    lx = cx + 24 * s
    lamp = (f'<rect x="{lx - 1.2 * s:.1f}" y="{top - 30 * s:.1f}" width="{2.4 * s:.1f}" height="{18 * s:.1f}" fill="#a98d5f"/>'
            f'<path d="M{lx - 9 * s:.1f} {top - 28 * s:.1f} H{lx + 9 * s:.1f} L{lx + 5 * s:.1f} {top - 38 * s:.1f} H{lx - 5 * s:.1f} Z" fill="#d9c7a3"/>')
    glow = (f'<ellipse cx="{lx:.1f}" cy="{top - 24 * s:.1f}" rx="{58 * s:.1f}" ry="{50 * s:.1f}" fill="url(#g-glow)"/>'
            f'<ellipse cx="{cx:.1f}" cy="{top - 9 * s:.1f}" rx="{36 * s:.1f}" ry="{3 * s:.1f}" fill="#f1d2a0" opacity=".45"/>')
    if lamp_delay is None:
        g.append(glow + lamp)
    else:
        g.append(f'<g class="on" style="--d:{lamp_delay}s">{glow}</g>{lamp}')
    return ''.join(g)


# --------------------------------------------------------------------------
# Room 2: behind the counter, at the POS (camera stop 2)
# --------------------------------------------------------------------------
def counter():
    c = []
    # still view only: the wall behind the station
    c.append('<g class="still-only"><rect x="-1000" y="-800" width="3600" height="1500" fill="#463b32"/>'
             '<rect x="-1000" y="-800" width="3600" height="900" fill="url(#g-top-dark)"/>'
             '<rect x="770" y="285" width="680" height="14" fill="#6b4f39"/>'
             '<ellipse cx="1050" cy="450" rx="600" ry="260" fill="url(#g-wash)" opacity=".5"/></g>')
    # light from the pendant above
    c.append('<ellipse cx="1080" cy="600" rx="520" ry="160" fill="url(#g-wash)" opacity=".5"/>')
    # counter: top surface, nosing, cabinet
    c.append('<polygon points="770,618 1530,618 1572,652 728,652" fill="url(#g-oak-h)"/>')
    c.append('<polygon points="770,618 1530,618 1540,626 760,626" fill="#9a7653" opacity=".45"/>')
    c.append('<rect x="722" y="652" width="856" height="20" fill="#523827"/><rect x="722" y="652" width="856" height="3" fill="#8f6c4c"/>')
    c.append('<rect x="736" y="672" width="828" height="500" fill="#33241a"/>')
    for x in (750, 1030, 1310):
        c.append(f'<rect x="{x}" y="696" width="240" height="250" fill="#2b1e15"/><rect x="{x}" y="696" width="240" height="3" fill="#000" opacity=".3"/>')
    c.append('<rect x="736" y="672" width="828" height="40" fill="url(#g-top-dark)" opacity=".6"/>')
    # terminal: stand, housing, screen
    c.append('<ellipse cx="1050" cy="642" rx="70" ry="10" fill="url(#g-shade)"/>')
    c.append('<ellipse cx="1050" cy="636" rx="46" ry="8" fill="#1b1c1d"/><rect x="1038" y="560" width="24" height="76" fill="#262728"/><rect x="1041" y="560" width="4" height="76" fill="#5b5d5e"/>')
    c.append('<ellipse cx="1050" cy="628" rx="230" ry="26" fill="url(#g-cool)" opacity=".5"/>')
    c.append('<rect x="876" y="392" width="348" height="204" rx="14" fill="#141516"/>')
    c.append('<rect x="890" y="406" width="320" height="176" rx="4" fill="url(#g-screen)"/>')
    c.append('<rect x="890" y="406" width="320" height="22" fill="#33404a"/>')
    c.append('<rect x="902" y="414" width="40" height="6" rx="3" fill="#dcd9d2" opacity=".45"/>')
    for r in range(3):
        for col in range(3):
            x, y = 902 + col * 66, 438 + r * 46
            hi = (r == 1 and col == 1)
            c.append(f'<rect class="{"key-hi" if hi else ""}" x="{x}" y="{y}" width="58" height="38" rx="5" fill="{"#f1d2a0" if hi else "#dcd9d2"}" opacity="{".55" if hi else ".12"}"/>')
            c.append(f'<rect x="{x + 8}" y="{y + 26}" width="{22 + (r * 7 + col * 5) % 18}" height="4" rx="2" fill="#dcd9d2" opacity=".4"/>')
    c.append('<rect x="1110" y="438" width="88" height="130" rx="4" fill="#28313a"/>')
    for i, w in enumerate((52, 40, 60, 34, 46, 28)):
        c.append(f'<rect x="1118" y="{450 + i * 16}" width="{w}" height="4" rx="2" fill="#dcd9d2" opacity=".38"/><rect x="1186" y="{450 + i * 16}" width="6" height="4" rx="2" fill="#dcd9d2" opacity=".38"/>')
    c.append('<rect x="1118" y="552" width="74" height="8" rx="3" fill="#f1d2a0" opacity=".7"/>')
    c.append('<path d="M890 406 L1010 406 L890 520 Z" fill="#fff" opacity=".045"/>')
    # card reader
    c.append('<rect x="1238" y="598" width="40" height="44" rx="6" fill="#1d1e1f"/><rect x="1244" y="604" width="28" height="12" rx="2" fill="#2f3b41"/>')
    for i in range(6):
        c.append(f'<circle cx="{1248 + (i % 3) * 10}" cy="{624 + (i // 3) * 8}" r="2.2" fill="#55595b"/>')
    # receipt printer and the day's sales feeding out of it
    c.append('<ellipse cx="1370" cy="650" rx="100" ry="10" fill="url(#g-shade)"/>')
    c.append('<g clip-path="url(#c-slot)"><g class="slip">'
             '<path d="M1322 600 L1318 360 Q1316 336 1340 330 L1410 324 Q1418 344 1414 362 L1410 600 Z" fill="url(#g-paper)"/>'
             '<path d="M1340 330 L1410 324 Q1418 344 1414 362 Q1400 344 1340 330 Z" fill="#cfccc4"/>')
    y = 372
    widths = [(40, 10), (30, 14), (46, 8), (36, 12), (28, 10), (42, 16), (34, 8), (38, 12), (30, 10), (44, 14)]
    c.append('<rect x="1334" y="352" width="34" height="5" rx="1" fill="#3d4246"/>')
    for i, (a, bw) in enumerate(widths):
        c.append(f'<rect x="1332" y="{y + i * 21}" width="{a}" height="4" rx="1" fill="#6f7377"/><rect x="{1400 - bw}" y="{y + i * 21}" width="{bw}" height="4" rx="1" fill="#3d4246"/>')
    c.append('</g></g>')
    c.append('<rect x="1290" y="580" width="160" height="68" rx="10" fill="url(#g-printer)"/>')
    c.append('<rect x="1290" y="580" width="160" height="16" rx="8" fill="#4d4e4f"/>')
    c.append('<rect x="1306" y="595" width="128" height="5" rx="2" fill="#0c0c0c"/>')
    c.append('<circle class="led" cx="1432" cy="628" r="3.5" fill="#f1d2a0"/>')
    return plane(1.7, 2, ''.join(c))


# --------------------------------------------------------------------------
# Room 3: the kitchen (camera stop 3)
# --------------------------------------------------------------------------
def kitchen():
    out = []
    LT, RT, LB, RB = (750, 420), (1250, 420), (750, 634), (1250, 634)
    L_top, L_bot = ray_x(LT, -1000), ray_x(LB, -1000)
    R_top, R_bot = ray_x(RT, 2600), ray_x(RB, 2600)
    k = []
    k.append('<rect x="-1000" y="560" width="3600" height="1300" fill="url(#g-kfloor)"/>')
    for i in range(25):
        x0 = 750 + i * 500 / 24
        e = ray_y((x0, 634), 1800) if abs(x0 - 1000) > 0.5 else (1000, 1800)
        k.append(f'<line x1="{n(x0)}" y1="634" x2="{n(e[0])}" y2="1800" stroke="#2a1f1a" stroke-width="1.6"/>')
    dd = 0.65
    while dd > 0.06:
        m = 0.65 / dd
        y = 520 + 114 * m
        k.append(f'<line x1="-1000" y1="{n(y)}" x2="2600" y2="{n(y)}" stroke="#2a1f1a" stroke-width="{1.2 * m:.1f}"/>')
        dd -= 0.032
    k.append(f'<polygon points="{pts(LT, RT, R_top, (2600, -800), (-1000, -800), L_top)}" fill="#2a2a28"/>')
    for x0 in (880, 1120):
        a, b = along((x0, 420), 1.15), along((x0, 420), 3.2)
        w0, w1 = 4 * 1.15, 4 * 3.2
        k.append(f'<polygon points="{pts((a[0] - w0, a[1]), (a[0] + w0, a[1]), (b[0] + w1, b[1]), (b[0] - w1, b[1]))}" fill="#eef0ec" opacity=".42"/>')
        k.append(f'<ellipse cx="{n((a[0] + b[0]) / 2)}" cy="{n((a[1] + b[1]) / 2 + 40)}" rx="340" ry="160" fill="url(#g-cool)" opacity=".5"/>')
    k.append(f'<polygon points="{pts(LT, L_top, L_bot, LB)}" fill="url(#g-tile-l)"/>')
    k.append(f'<polygon points="{pts(RT, R_top, R_bot, RB)}" fill="url(#g-tile-r)"/>')
    for i in range(17):
        y0 = 420 + i * 214 / 16
        for p, xe in (((750, y0), -1000), ((1250, y0), 2600)):
            e = ray_x(p, xe)
            k.append(f'<line x1="{n(p[0])}" y1="{n(y0)}" x2="{n(e[0])}" y2="{n(e[1])}" stroke="#2f2e2b" stroke-width="1.1" opacity=".75"/>')
    dd = 0.65
    while dd > 0.08:
        m = 0.65 / dd
        for side in (-1, 1):
            x = 1000 + side * 250 * m
            k.append(f'<line x1="{n(x)}" y1="{n(520 - 100 * m)}" x2="{n(x)}" y2="{n(520 + 114 * m)}" stroke="#2f2e2b" stroke-width="{0.9 * m:.1f}" opacity=".6"/>')
        dd -= 0.028
    # back wall
    k.append('<rect x="750" y="420" width="500" height="214" fill="url(#p-tile)"/>')
    k.append('<rect x="750" y="420" width="500" height="214" fill="url(#g-top-dark)" opacity=".5"/>')
    k.append('<rect x="750" y="420" width="500" height="214" fill="#1f1c19" opacity=".25"/>')
    k.append('<ellipse cx="1000" cy="520" rx="300" ry="110" fill="url(#g-cool)" opacity=".25"/>')
    k.append('<ellipse cx="1045" cy="486" rx="70" ry="52" fill="url(#g-wash)" opacity=".55"/>')
    # walk-in door
    k.append('<rect x="764" y="466" width="102" height="168" fill="#3a3c3c"/><rect x="770" y="472" width="90" height="162" fill="url(#g-steel)"/>')
    k.append('<rect x="840" y="530" width="14" height="30" rx="3" fill="#2b2c2c"/><rect x="842" y="532" width="4" height="26" fill="#9a9d9a"/>')
    # shelf with containers
    k.append('<rect x="884" y="438" width="350" height="6" fill="url(#g-steel-top)"/>')
    for x in (892, 1226):
        k.append(f'<path d="M{x} 444 v14 l10 -14 Z" fill="#6b6e6c"/>')
    for i in range(7):
        x = 896 + i * 17
        k.append(f'<rect x="{x}" y="420" width="14" height="18" rx="1.5" fill="#d6d4cd" opacity=".6"/><rect x="{x - 1}" y="418" width="16" height="3" fill="#b9b7b0"/>')
    for i in range(4):
        k.append(f'<rect x="1030" y="{430 - i * 5}" width="62" height="4" fill="url(#g-steel)"/>')
    k.append('<rect x="1170" y="406" width="44" height="32" fill="url(#g-steel)"/><rect x="1166" y="404" width="52" height="4" fill="#bfc1bd"/>')
    # prep table
    k.append('<rect x="884" y="552" width="352" height="14" fill="#6b6e6c"/>')
    k.append('<rect x="880" y="566" width="360" height="9" fill="url(#g-steel-top)"/>')
    k.append('<rect x="886" y="575" width="5" height="59" fill="#5f6261"/><rect x="1229" y="575" width="5" height="59" fill="#5f6261"/><rect x="884" y="610" width="352" height="4" fill="#6f7270"/>')
    k.append('<rect x="900" y="596" width="70" height="14" fill="#c8c5bd" opacity=".55"/><rect x="1120" y="594" width="90" height="16" fill="#c8c5bd" opacity=".45"/>')
    k.append('<polygon points="952,566 1036,566 1040,560 956,560" fill="#8a6748"/><polygon points="964,561 1010,561 1012,559 966,559" fill="#e6e8e4"/>')
    k.append('<rect x="1056" y="556" width="56" height="10" fill="url(#g-steel)"/><ellipse cx="1084" cy="556" rx="24" ry="4" fill="#61704f"/>')
    for x in (1130, 1144, 1158, 1138, 1152):
        k.append(f'<circle cx="{x}" cy="{561 if x in (1130, 1144, 1158) else 554}" r="6" fill="#b4975c"/>')
    k.append('<ellipse cx="1060" cy="575" rx="190" ry="10" fill="#000" opacity=".25"/>')
    out.append(plane(2.75, 3, ''.join(k)))

    c = []
    # hood and the back of the line
    c.append('<rect x="1140" y="250" width="1460" height="80" fill="url(#g-steel-v)"/>')
    c.append('<rect x="1140" y="330" width="1460" height="14" fill="#262727"/>')
    c.append('<rect x="1140" y="344" width="1460" height="350" fill="#2b2c2c"/>')
    c.append('<rect x="1140" y="344" width="1460" height="60" fill="url(#g-top-dark)" opacity=".7"/>')
    for x in range(1180, 2600, 120):
        c.append(f'<rect x="{x}" y="334" width="14" height="5" fill="#f1d2a0" opacity=".75"/>')
    for x in range(1190, 2600, 92):
        c.append(f'<ellipse cx="{x}" cy="566" rx="22" ry="5" fill="#9fb3bf" opacity=".4"/><ellipse cx="{x}" cy="563" rx="13" ry="7" fill="#f1c58a" opacity=".55"/>')
    for i, (x, late) in enumerate(((1215, None), (1330, None), (1445, 1.5), (1560, 2.2))):
        c.append(cook(x, late))
    out.append(plane(2.56, 3, ''.join(c)))

    ln = []
    ln.append('<rect x="1130" y="404" width="6" height="184" fill="#7b7e7c"/><rect x="2400" y="404" width="6" height="184" fill="#7b7e7c"/>')
    ln.append('<rect x="1120" y="396" width="1480" height="10" fill="url(#g-steel-top)"/>')
    ln.append('<rect x="1170" y="406" width="560" height="8" fill="#2f2f2e"/>')
    ln.append('<g class="on" style="--d:.1s">'
              '<rect x="1176" y="409" width="548" height="4" fill="#ffd9a3"/>'
              '<polygon points="1170,414 1730,414 1820,600 1100,600" fill="url(#g-heat)"/>'
              '<ellipse cx="1450" cy="590" rx="340" ry="30" fill="url(#g-wash)" opacity=".6"/></g>')
    # tickets on the rail
    ln.append('<rect x="1128" y="372" width="1480" height="6" fill="url(#g-steel-top)"/>')
    for i in range(8):
        x = 1150 + i * 62
        rot = (-2.5, 1.5, -1, 2, -2, 1, -1.5, 2.5)[i]
        tk = (f'<g transform="rotate({rot} {x + 20} 376)"><rect x="{x}" y="376" width="40" height="54" fill="#f0eee7"/>'
              f'<rect x="{x + 6}" y="384" width="22" height="3" fill="#5d6064"/>'
              f'<rect x="{x + 6}" y="394" width="28" height="2" fill="#8d8f92"/><rect x="{x + 6}" y="401" width="18" height="2" fill="#8d8f92"/>'
              f'<rect x="{x + 6}" y="408" width="24" height="2" fill="#8d8f92"/><rect x="{x + 6}" y="415" width="14" height="2" fill="#8d8f92"/></g>')
        if i < 2:
            ln.append(tk)
        else:
            ln.append(f'<g class="tk" style="--d:{0.35 + (i - 2) * 0.32:.2f}s">{tk}</g>')
    # the pass
    for x in (1270, 1420, 1570):
        ln.append(f'<ellipse cx="{x}" cy="590" rx="30" ry="7" fill="#ebe8e1"/><ellipse cx="{x}" cy="589" rx="21" ry="4.5" fill="#d9d5cc"/>'
                  f'<path d="M{x - 12} 588 Q{x - 4} 576 {x + 10} 586 Z" fill="#6b4a33"/><circle cx="{x + 6}" cy="583" r="3.5" fill="#6f7d58"/>')
    ln.append('<polygon points="1124,592 2600,592 2600,606 1110,606" fill="url(#g-steel-top)"/>')
    ln.append('<rect x="1110" y="606" width="1490" height="118" fill="url(#g-steel-v)"/>')
    for x in range(1150, 2600, 70):
        ln.append(f'<rect x="{x}" y="610" width="2" height="110" fill="#d6d8d4" opacity=".14"/>')
    ln.append('<rect x="1110" y="724" width="1490" height="12" fill="#151515"/>')
    ln.append('<ellipse cx="1500" cy="740" rx="600" ry="20" fill="url(#g-shade)"/>')
    out.append(plane(2.47, 3, ''.join(ln), cls='fade'))

    fr = []
    fr.append('<rect x="1240" y="104" width="1400" height="14" fill="#232322"/><rect x="1240" y="104" width="1400" height="3" fill="#7a7c7a"/>')
    for x, kind in ((1340, 'ladle'), (1470, 'pan'), (1610, 'whisk'), (1760, 'ladle')):
        fr.append(f'<path d="M{x} 118 v8" stroke="#2a2a29" stroke-width="4"/>')
        if kind == 'ladle':
            fr.append(f'<rect x="{x - 3}" y="124" width="6" height="190" rx="3" fill="url(#g-steel)"/><path d="M{x - 34} 312 Q{x - 34} 350 {x} 352 Q{x + 34} 350 {x + 34} 312 Z" fill="url(#g-steel)"/>')
        elif kind == 'pan':
            fr.append(f'<rect x="{x - 4}" y="124" width="8" height="100" rx="4" fill="#3b3c3c"/><circle cx="{x}" cy="300" r="56" fill="url(#g-steel)"/><circle cx="{x}" cy="300" r="44" fill="#4f5251"/><circle cx="{x - 14}" cy="286" r="14" fill="#fff" opacity=".08"/>')
        else:
            fr.append(f'<rect x="{x - 4}" y="124" width="8" height="110" rx="4" fill="url(#g-steel)"/>')
            for dx in (-22, -11, 0, 11, 22):
                fr.append(f'<path d="M{x} 230 Q{x + dx * 1.6} 290 {x + dx * .2} 330" fill="none" stroke="#a7aaa7" stroke-width="2.5"/>')
    fr.append('<ellipse cx="200" cy="1500" rx="700" ry="60" fill="url(#g-shade)"/>')
    for x in (-300, 640):
        fr.append(f'<rect x="{x}" y="920" width="18" height="620" fill="url(#g-steel)"/>')
    fr.append('<rect x="-1000" y="1230" width="1700" height="12" fill="url(#g-steel-top)"/>')
    for i in range(4):
        fr.append(f'<rect x="{-120 + i * 6}" y="{1214 - i * 10}" width="420" height="8" fill="url(#g-steel)"/>')
    fr.append('<polygon points="-1000,872 630,872 700,902 -1000,902" fill="url(#g-steel-top)"/>')
    fr.append('<rect x="-1000" y="902" width="1700" height="22" fill="#5a5d5c"/><rect x="-1000" y="902" width="1700" height="3" fill="#c9cbc7" opacity=".5"/>')
    fr.append('<rect x="80" y="846" width="160" height="28" fill="#8a6748"/><polygon points="80,846 240,846 232,836 88,836" fill="#a07b58"/>')
    out.append(plane(2.25, 3, ''.join(fr), cls='fade'))
    return ''.join(out)


def cook(x, late):
    cls = f' class="late" style="--d:{late}s"' if late else ''
    return (f'<g{cls}>'
            f'<ellipse cx="{x}" cy="690" rx="44" ry="6" fill="#000" opacity=".3"/>'
            f'<path d="M{x - 30} 700 L{x - 28} 534 Q{x - 26} 514 {x} 512 Q{x + 26} 514 {x + 28} 534 L{x + 30} 700 Z" fill="url(#g-jacket)"/>'
            f'<path d="M{x - 6} 516 L{x} 540 L{x + 6} 516" fill="none" stroke="#9d978c" stroke-width="2"/>'
            f'<circle cx="{x}" cy="496" r="13" fill="#1d1b1a"/>'
            f'<path d="M{x - 14} 492 Q{x - 14} 476 {x} 476 Q{x + 14} 476 {x + 14} 492 Z" fill="#e6e1d6"/>'
            f'<path d="M{x - 26} 530 Q{x} 518 {x + 26} 530" fill="none" stroke="#f1d2a0" stroke-width="2" opacity=".35"/>'
            f'</g>')


# --------------------------------------------------------------------------
# Room 4: the prep sheet (camera stop 4)
# --------------------------------------------------------------------------
ROWS = [('Short rib', 40, 26, 24), ('Risotto', 20, 31, 29), ('Burrata', 25, 18, 17), ('Roast chicken', 30, 22, 21)]


def sheet():
    s = []
    s.append('<g class="still-only"><rect x="-1000" y="-800" width="3600" height="2600" fill="url(#p-tile-xl)"/>'
             '<rect x="-1000" y="-800" width="3600" height="2600" fill="#1f1d1b" opacity=".45"/>'
             '<ellipse cx="1150" cy="420" rx="700" ry="420" fill="url(#g-wash)" opacity=".35"/></g>')
    s.append('<path d="M935 196 H1405 V738 H935 Z" fill="#000" opacity=".45" filter="url(#f-soft)" transform="translate(14 18)"/>')
    s.append('<rect x="905" y="168" width="490" height="550" rx="16" fill="url(#g-board)"/>')
    s.append('<rect x="905" y="168" width="490" height="550" rx="16" fill="none" stroke="#8a6a4c" stroke-width="2" opacity=".6"/>')
    s.append('<rect x="925" y="190" width="450" height="510" fill="url(#g-paper)"/>')
    s.append('<rect x="925" y="190" width="450" height="510" fill="url(#g-wash)" opacity=".18"/>')
    s.append('<rect x="925" y="690" width="450" height="10" fill="#000" opacity=".06"/>')
    # clip
    s.append('<rect x="1078" y="150" width="144" height="50" rx="9" fill="url(#g-steel)"/><rect x="1078" y="150" width="144" height="8" rx="4" fill="#e1e2de" opacity=".6"/>')
    s.append('<rect x="1112" y="128" width="76" height="26" rx="10" fill="none" stroke="#8b8e8c" stroke-width="6"/>')
    s.append('<circle cx="1094" cy="180" r="4" fill="#4f5251"/><circle cx="1206" cy="180" r="4" fill="#4f5251"/>')
    # contents
    t = []
    t.append('<text x="955" y="262" class="sh-title">Tuesday</text>')
    t.append('<text x="1347" y="258" class="sh-note" text-anchor="end">Example</text>')
    t.append('<rect x="955" y="282" width="392" height="2" fill="#232a2f"/>')
    t.append('<text x="1182" y="320" class="sh-head" text-anchor="middle">Guess</text>')
    t.append('<text x="1268" y="320" class="sh-head" text-anchor="middle">Prep</text>')
    t.append('<text x="1346" y="320" class="sh-head" text-anchor="middle">Sold</text>')
    for i, (dish, g, p, sold) in enumerate(ROWS):
        y = 382 + i * 76
        if i:
            t.append(f'<rect x="955" y="{y - 44}" width="392" height="1" fill="#cfccc4"/>')
        t.append(f'<text x="955" y="{y}" class="sh-dish">{dish}</text>')
        t.append(f'<text x="1182" y="{y}" class="sh-pencil" text-anchor="middle" transform="rotate(-3 1182 {y})">{g}</text>')
        t.append(f'<path class="strike" style="--d:{1.2 + i * .22:.2f}s" d="M1160 {y - 9} Q1183 {y - 14} 1206 {y - 11}" pathLength="1"/>')
        t.append(f'<text x="1268" y="{y + 2}" class="sh-prep" text-anchor="middle" data-count="{p}" style="--d:{0.2 + i * .25:.2f}s">{p}</text>')
        t.append(f'<text x="1346" y="{y}" class="sh-pencil sh-sold" text-anchor="middle" style="--d:{2.1 + i * .3:.2f}s" transform="rotate(-2 1346 {y})">{sold}</text>')
    s.append('<g class="sheet-ink">' + ''.join(t) + '</g>')
    return plane(2.72, 4, ''.join(s))


# --------------------------------------------------------------------------
# Page
# --------------------------------------------------------------------------
def copy(stop, inner, cls=''):
    return f'<div class="copy {cls}" data-stop="{stop}"><div class="copy-in">{inner}</div></div>\n'


def page():
    rooms = []
    rooms.append(
        '<section class="room room-0" id="outside" aria-labelledby="h-outside">'
        '<div class="scene" aria-hidden="true">' + street() + '</div>' +
        copy(0, '<h1 id="h-outside">Your restaurant makes more, and you manage&nbsp;less.</h1>'
                '<p class="lead">Tooey runs the back end, worked out from your restaurant\'s own sales.</p>'
                '<p class="acts"><a class="btn" href="#talk">Join the free pilot</a><a class="in" href="#dining">Step inside</a></p>', 'copy-hero') +
        '</section>\n')
    rooms.append(
        '<section class="room room-1" id="dining" aria-labelledby="h-dining">'
        '<div class="scene" aria-hidden="true">' + dining() + '</div>' +
        copy(1, '<h2 id="h-dining">Fuller slow nights, and regulars who come&nbsp;back.</h2>'
                '<p>Tooey spots the quiet nights ahead, in time to fill&nbsp;them.</p>') +
        '</section>\n')
    rooms.append(
        '<section class="room room-2" id="counter" aria-labelledby="h-counter">'
        '<div class="scene" aria-hidden="true">' + counter() + '</div>' +
        copy(2, '<h2 id="h-counter">It starts with what you already&nbsp;sell.</h2>'
                '<p>Each night Tooey reads your sales by dish, with the day of the week, time of year and&nbsp;holidays.</p>') +
        '</section>\n')
    rooms.append(
        '<section class="room room-3" id="kitchen" aria-labelledby="h-kitchen">'
        '<div class="scene" aria-hidden="true">' + kitchen() + '</div>' +
        copy(3, '<h2 id="h-kitchen">The right people on, at the right&nbsp;time.</h2>'
                '<p>Shifts matched to how busy the night will be: a full line for the rush, fewer cooks when&nbsp;quiet.</p>') +
        '</section>\n')
    sheet_sr = ''.join(f'<li>{d}: guess {g}, prep {p}, sold {s}</li>' for d, g, p, s in ROWS)
    rooms.append(
        '<section class="room room-4" id="prep" aria-labelledby="h-prep">'
        '<div class="scene" aria-hidden="true">' + sheet() + '</div>' +
        copy(4, '<h2 id="h-prep">A count for every dish, before&nbsp;prep.</h2>'
                '<p>Every morning, how much of each dish to make: a little over what should sell. Closer than a&nbsp;guess.</p>'
                f'<ul class="sr">{sheet_sr}</ul>') +
        '</section>\n')

    tpl = open(os.path.join(HERE, 'page.tpl.html'), encoding='utf-8').read()
    html = tpl.replace('<!--DEFS-->', DEFS).replace('<!--ROOMS-->', ''.join(rooms))
    with open(os.path.join(HERE, '..', 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(html)
    print('wrote index.html', len(html))


if __name__ == '__main__':
    page()
