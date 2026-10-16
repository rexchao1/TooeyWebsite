"""Give the stand-in photographs a light illustrated finish.

Reads photos/raw/<name>.jpg and writes photos/<name>-2000.jpg and
photos/<name>-1100.jpg. The finish is three steps over the real photograph:
  1. simplify: a Kuwahara filter flattens texture into soft brush-like areas
     and keeps the edges;
  2. grade: a warm gradient map (ink, clay, paper) blended into the photo's
     own colours, a little less saturated;
  3. linework: thin difference-of-Gaussians lines in ink, at low strength,
     and a faint paper grain.
Commissioned artwork replaces the outputs directly; this script is only for
the stand-ins.

Run: python3 photos/finish.py   (needs Pillow, numpy and scipy)
"""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
WIDTH = 2000

# name: (simplify radius, line strength, grade mix, exposure, crop from left)
SCENES = {
    "forecast": (5, 0.5, 0.52, 0.94, 0.0),
    "prep": (5, 0.5, 0.48, 1.10, 0.26),  # the soft wall on the left goes
    "shifts": (5, 0.5, 0.48, 1.32, 0.0),
}

INK = np.array([0.20, 0.15, 0.12])
STOPS = [  # luminance -> colour
    (0.00, (0.13, 0.10, 0.09)),
    (0.30, (0.33, 0.24, 0.19)),
    (0.62, (0.70, 0.55, 0.42)),
    (1.00, (0.97, 0.93, 0.85)),
]


def lum(a):
    return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114


def kuwahara(a, r):
    pad = r + 2
    a = np.pad(a, ((pad, pad), (pad, pad), (0, 0)), mode="reflect")
    return _kuwahara(a, r)[pad:-pad, pad:-pad]


def _kuwahara(a, r):
    k = r + 1
    L = lum(a)
    mean_l = nd.uniform_filter(L, k)
    var_l = nd.uniform_filter(L * L, k) - mean_l ** 2
    means = np.stack([nd.uniform_filter(a[..., c], k) for c in range(3)], -1)
    h = r // 2 + (r % 2)
    best_var = None
    out = np.zeros_like(a)
    for dy in (-h, h):
        for dx in (-h, h):
            v = np.roll(var_l, (dy, dx), (0, 1))
            m = np.roll(means, (dy, dx), (0, 1))
            if best_var is None:
                best_var, out = v, m
            else:
                pick = v < best_var
                best_var = np.where(pick, v, best_var)
                out = np.where(pick[..., None], m, out)
    return out


def gradient_map(L):
    xs = [s[0] for s in STOPS]
    return np.stack([np.interp(L, xs, [s[1][c] for s in STOPS]) for c in range(3)], -1)


def linework(L, sigma=1.4, k=1.6, eps=0.012, phi=60.0):
    d = nd.gaussian_filter(L, sigma) - nd.gaussian_filter(L, sigma * k)
    line = np.where(d < -eps, np.tanh(phi * (-d - eps)), 0.0)
    return nd.gaussian_filter(line, 0.6)


def finish(name, radius, strength, mix, exposure, crop):
    im = Image.open(os.path.join(HERE, "raw", name + ".jpg")).convert("RGB")
    im = im.crop((round(im.width * crop), 0, im.width, im.height))
    h = round(im.height * WIDTH / im.width)
    a = np.asarray(im.resize((WIDTH, h), Image.LANCZOS), dtype=np.float64) / 255.0
    a = np.clip(a * exposure, 0, 1)

    lines = linework(lum(a))
    a = kuwahara(a, radius)
    a = nd.gaussian_filter(a, (0.7, 0.7, 0))  # soften the filter's blocks

    L = lum(a)
    grey = L[..., None]
    own = grey + (a - grey) * 0.72  # a little less saturated
    a = own * (1 - mix) + gradient_map(L) * mix

    a = a * (1 - lines[..., None] * strength) + INK * lines[..., None] * strength

    rng = np.random.default_rng(7)
    grain = nd.gaussian_filter(rng.standard_normal(L.shape), 0.8)
    a = np.clip(a * (1 + grain[..., None] * 0.035), 0, 1)

    out = Image.fromarray((a * 255).round().astype(np.uint8))
    out.save(os.path.join(HERE, name + "-2000.jpg"), quality=82, optimize=True, progressive=True)
    small = out.resize((1100, round(h * 1100 / WIDTH)), Image.LANCZOS)
    small.save(os.path.join(HERE, name + "-1100.jpg"), quality=82, optimize=True, progressive=True)
    print(name, out.size)


if __name__ == "__main__":
    for n, args in SCENES.items():
        finish(n, *args)
