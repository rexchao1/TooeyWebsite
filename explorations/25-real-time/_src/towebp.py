# Converts rendered PNG stills to WebP for the page.
# Usage: python3 towebp.py <pngDir> <outDir>
import sys, os
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
for f in sorted(os.listdir(src)):
    if not f.endswith('.png'):
        continue
    im = Image.open(os.path.join(src, f)).convert('RGB')
    dst = os.path.join(out, f[:-4] + '.webp')
    im.save(dst, 'WEBP', quality=80, method=6)
    print(dst, os.path.getsize(dst) // 1024, 'KB')
