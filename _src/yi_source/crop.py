from PIL import Image, ImageSequence, ImageChops
import os, json
D = os.path.dirname(os.path.abspath(__file__))
names = ['Heaven','Earth','Wind','Fire','Rain','Water','Mountain','Thunder','Tai','Jiaren','Xian','Xie']
out = {}
for n in names:
    im = Image.open(f'{D}/{n}.gif')
    frames = [f.convert('L') for f in ImageSequence.Iterator(im)]
    # union bbox of non-black in the middle band (excludes title text + trigram glyph)
    acc = Image.new('L', (1200, 800), 0)
    for f in frames[::max(1, len(frames)//12)]:
        acc = ImageChops.lighter(acc, f.point(lambda v: 255 if v > 6 else 0))
    band = acc.crop((0, 110, 1200, 668))
    bb = band.getbbox()
    x0, y0, x1, y1 = bb[0], bb[1] + 110, bb[2], bb[3] + 110
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    side = max(x1 - x0, y1 - y0)
    side = min(max(side, 420), 560)
    box = (int(cx - side / 2), int(cy - side / 2), int(cx + side / 2), int(cy + side / 2))
    out[n] = {'bbox': [x0, y0, x1, y1], 'box': box}
    S = 520
    rgb = [f.convert('RGB').crop(box).resize((S, S), Image.LANCZOS) for f in ImageSequence.Iterator(Image.open(f'{D}/{n}.gif'))]
    rgb[0].save(f'{D}/sq_{n}.webp', save_all=True, append_images=rgb[1:], duration=70, loop=0, quality=72, method=4)
    rgb[len(rgb) // 2].save(f'{D}/still_{n}.jpg', quality=88)
    print(n, out[n], os.path.getsize(f'{D}/sq_{n}.webp') // 1024, 'KB')
json.dump(out, open(f'{D}/crops.json', 'w'), indent=1)
