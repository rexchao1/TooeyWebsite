"""Draw the board's floor plan: one restaurant, in ink, as an architect
would. The three scenes are pinned where they happen: the counter (the
forecast), the prep station (prep) and the pass (shifts).

Board pixels match .board in styles.css; the plan is drawn larger than the
board so the camera never runs off its edge when it pulls back.
Run: python3 plan.py  > writes plan.svg
"""
import math
import os

X0, Y0, W, H = -500, -420, 3200, 2960  # the plan's extent, in board pixels
INK = "#232a2f"
out = []


def add(s):
    out.append(s)


def wall(pts, w=14):
    d = "M" + " L".join(f"{x} {y}" for x, y in pts)
    add(f'<path d="{d}" fill="none" stroke="{INK}" stroke-opacity=".34" stroke-width="{w}" stroke-linejoin="miter"/>')
    add(f'<path d="{d}" fill="none" stroke="#efece4" stroke-width="{w - 5}" stroke-linejoin="miter"/>')


def line(x1, y1, x2, y2, o=.22, w=1.6, dash=None):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{INK}" stroke-opacity="{o}" stroke-width="{w}"{da}/>')


def rect(x, y, w, h, o=.24, sw=1.6, fill="none", rx=0):
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{INK}" stroke-opacity="{o}" stroke-width="{sw}"/>')


def circle(cx, cy, r, o=.24, sw=1.6, fill="none"):
    add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{INK}" stroke-opacity="{o}" stroke-width="{sw}"/>')


def label(x, y, t, size=22, o=.42, anchor="start"):
    add(f'<text x="{x}" y="{y}" font-family="Schibsted Grotesk, sans-serif" font-size="{size}" font-weight="600" '
        f'letter-spacing="{size * .16:.1f}" fill="{INK}" fill-opacity="{o}" text-anchor="{anchor}">{t}</text>')


def table_round(cx, cy, r=46, seats=4):
    circle(cx, cy, r, .26, 1.8)
    for k in range(seats):
        a = 2 * math.pi * k / seats + math.pi / 4
        sx, sy = cx + math.cos(a) * (r + 30), cy + math.sin(a) * (r + 30)
        rect(sx - 17, sy - 17, 34, 34, .2, 1.4, rx=8)


def table_two(x, y, horiz=True):
    rect(x, y, 84, 84, .26, 1.8)
    if horiz:
        rect(x - 44, y + 25, 34, 34, .2, 1.4, rx=8)
        rect(x + 94, y + 25, 34, 34, .2, 1.4, rx=8)
    else:
        rect(x + 25, y - 44, 34, 34, .2, 1.4, rx=8)
        rect(x + 25, y + 94, 34, 34, .2, 1.4, rx=8)


def lamp(cx, cy, r=320, o=.32):
    add(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#pool)" opacity="{o}"/>')


def hatch_region(x, y, w, h, step=22, o=.08):
    for k in range(-h, w, step):
        x1, y1 = x + max(k, 0), y + max(-k, 0)
        x2, y2 = x + min(k + h, w), y + min(h, w - k)
        line(x1, y1, x2, y2, o, 1.2)


add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{X0} {Y0} {W} {H}" width="{W}" height="{H}">')
add('<defs><radialGradient id="pool"><stop offset="0" stop-color="#f1c886" stop-opacity=".9"/>'
    '<stop offset=".55" stop-color="#f1d2a0" stop-opacity=".35"/><stop offset="1" stop-color="#f1d2a0" stop-opacity="0"/></radialGradient></defs>')

# warm light pools where the lamps hang, under everything
for cx, cy, r in [(520, 300, 520), (1700, 980, 520), (640, 1700, 560), (-140, 1180, 380), (2350, 1950, 420), (1180, 2250, 380)]:
    lamp(cx, cy, r)

# a faint construction grid, an architect's
for gx in range(X0 - X0 % 160, X0 + W, 160):
    line(gx, Y0, gx, Y0 + H, .045, 1)
for gy in range(Y0 - Y0 % 160, Y0 + H, 160):
    line(X0, gy, X0 + W, gy, .045, 1)

# the outer walls; the street front along the left with its windows
wall([(-360, -260), (2560, -260), (2560, 2620), (-360, 2620), (-360, -260)], 22)
for wy in (120, 560, 1000, 1440, 1880):
    line(-371, wy, -371, wy + 280, .5, 3)
    line(-349, wy, -349, wy + 280, .5, 3)
# the front door
add(f'<path d="M -360 2280 A 150 150 0 0 1 -210 2430" fill="none" stroke="{INK}" stroke-opacity=".28" stroke-width="1.6"/>')
line(-360, 2280, -210, 2280, .28, 1.6)

# the kitchen: the right side of the house, behind a wall with the pass
wall([(1180, -260), (1180, 520)])
wall([(1180, 760), (1180, 1260), (2560, 1260)])
wall([(1180, 1500), (1180, 1260)], 14)
hatch_region(2160, -240, 380, 420, 26, .07)
label(2350, 210, "WALK-IN", 20, .38, "middle")
rect(1300, 1080, 1100, 120, .26, 1.8)          # the line: range and fryers
for k in range(8):
    circle(1360 + k * 130, 1140, 34, .22, 1.4)
label(1850, 1235, "THE LINE", 20, .36, "middle")
rect(1300, -150, 520, 110, .24, 1.6)           # dish
label(1560, -170, "DISH", 20, .34, "middle")
label(2380, 1235, "KITCHEN", 26, .46, "end")

# the pass: the opening in the kitchen wall, with its shelf and heat lamps
rect(1150, 1300, 60, 520, .3, 1.8, fill="rgba(35,42,47,.03)")
for k in range(4):
    circle(1180, 1360 + k * 130, 12, .3, 1.4)
label(1240, 1860, "THE PASS", 20, .4)

# the counter and its stools (top left); the bar back along the wall
add(f'<path d="M 40 -120 L 980 -120 L 980 600" fill="none" stroke="{INK}" stroke-opacity=".3" stroke-width="44" stroke-linejoin="round"/>')
add(f'<path d="M 40 -120 L 980 -120 L 980 600" fill="none" stroke="#efece4" stroke-width="38" stroke-linejoin="round"/>')
for k in range(7):
    circle(100 + k * 130, -40, 22, .26, 1.6)
for k in range(4):
    circle(1060, 0 + k * 150, 22, .26, 1.6)
label(60, -170, "COUNTER", 22, .44)

# the dining room: tables in rows across the left and the bottom
for cx in (-120, 160):
    for cy in (820, 1100, 1380):
        table_two(cx - 42, cy - 42)
for cx, cy in [(520, 1000), (820, 1240), (2000, 1500), (2300, 1760), (1760, 2050), (2150, 2350), (1450, 2380)]:
    table_round(cx, cy, 50, 4)
for x in (-200, 60, 320, 580, 840, 1100):
    table_two(x, 2440, True)
add(f'<path d="M -330 2520 L 1260 2520" stroke="{INK}" stroke-opacity=".26" stroke-width="40"/>')
add(f'<path d="M -330 2520 L 1260 2520" stroke="#efece4" stroke-width="34"/>')
label(-300, 760, "DINING ROOM", 26, .46)
label(2380, 1440, "DINING ROOM", 26, .46, "end")
label(-300, 2380, "BANQUETTE", 20, .34)

# dimension lines along the top, like a drawing set
line(-360, -340, 2560, -340, .26, 1.4)
for x in (-360, 1180, 2560):
    line(x, -356, x, -324, .3, 1.4)
label(410, -360, "11.6 M", 18, .34, "middle")
label(1870, -360, "10.4 M", 18, .34, "middle")

# a scale bar and a north arrow in the corner
line(2180, 2730, 2500, 2730, .4, 3)
for k in range(5):
    line(2180 + k * 80, 2716, 2180 + k * 80, 2744, .4, 2)
label(2180, 2700, "0", 16, .4)
label(2500, 2700, "4 M", 16, .4, "end")
add(f'<path d="M 2050 2770 L 2080 2690 L 2110 2770 L 2080 2750 Z" fill="{INK}" fill-opacity=".34"/>')
label(2080, 2680, "N", 18, .42, "middle")
label(-340, 2740, "GROUND FLOOR · 1:50", 18, .38)

add("</svg>")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plan.svg"), "w").write("\n".join(out))
print("plan.svg", W, H)
