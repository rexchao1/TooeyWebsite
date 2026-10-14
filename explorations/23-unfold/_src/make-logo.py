# One-colour porcelain wordmark from the repo's logo.png (alpha kept).
# Run from explorations/23-unfold: python3 _src/make-logo.py
from PIL import Image

src = Image.open('../../logo.png').convert('RGBA')
r, g, b = 0xF2, 0xF1, 0xEC
out = Image.new('RGBA', src.size)
px = src.load()
op = out.load()
for y in range(src.size[1]):
    for x in range(src.size[0]):
        a = px[x, y][3]
        op[x, y] = (r, g, b, a)
out.save('logo-porcelain.png', optimize=True)
print(out.size)
