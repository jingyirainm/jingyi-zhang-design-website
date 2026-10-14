"""Builds the case-study presentation boards from the prototype screenshots."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os
R = os.path.expanduser('~/Desktop/rainmelon-site/assets/projects/yi/')
S = R + 'screens/'
BG = (236, 235, 229)

def phone(name, h):
    im = Image.open(S + name + '.png').convert('RGB')
    w = round(im.width * h / im.height)
    im = im.resize((w, h), Image.LANCZOS)
    rad = round(h * 0.066)
    bez = round(h * 0.014)
    W, H = w + bez * 2, h + bez * 2
    body = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(body)
    d.rounded_rectangle((0, 0, W - 1, H - 1), rad + bez, fill=(24, 24, 24, 255))
    m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), rad, fill=255)
    body.paste(im, (bez, bez), m)
    # dynamic island
    iw, ih = round(w * .3), round(h * .04)
    d.rounded_rectangle(((W - iw) // 2, bez + round(h * .014), (W + iw) // 2, bez + round(h * .014) + ih), ih // 2, fill=(0, 0, 0, 255))
    return body

def board(names, out, W=2880, H=1800, ph=1480, bg=BG, offsets=None):
    can = Image.new('RGB', (W, H), bg)
    ps = [phone(n, ph) for n in names]
    gap = round(W * 0.03)
    total = sum(p.width for p in ps) + gap * (len(ps) - 1)
    x = (W - total) // 2
    for i, p in enumerate(ps):
        dy = (offsets[i] if offsets else 0)
        y = (H - p.height) // 2 + dy
        sh = Image.new('RGBA', (p.width + 200, p.height + 200), (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle((100, 130, p.width + 100, p.height + 100), 120, fill=(0, 0, 0, 70))
        sh = sh.filter(ImageFilter.GaussianBlur(40))
        can.paste(sh, (x - 100, y - 100), sh)
        can.paste(p, (x, y), p)
        x += p.width + gap
    can.save(R + out, quality=90)
    print('ok', out)

board(['01_onboard_1', '04_today', '06_result', '09_compose', '11_player_xie'], 'cs_01_hero.jpg', H=1500, ph=960, offsets=[50, -50, 50, -50, 50])
board(['01_onboard_1', '02_onboard_2', '03_onboard_3'], 'cs_02_onboarding.jpg')
board(['04_today', '05_cast', '06_result'], 'cs_03_cast.jpg')
board(['07_bagua', '08_trigram', '13_player_water'], 'cs_04_eight.jpg')
board(['09_compose', '10_library', '15_mini'], 'cs_05_compose.jpg')
board(['11_player_xie', '12_player_jiaren'], 'cs_06_player.jpg', W=2400)
board(['03_onboard_3', '14_about', '07_bagua'], 'cs_07_about.jpg', H=1500, ph=1200)

# trigram strip: the eight cropped renders in a row, black
st = Image.new('RGB', (2880, 420), (0, 0, 0))
for i, n in enumerate(['Heaven', 'Earth', 'Wind', 'Fire', 'Rain', 'Water', 'Mountain', 'Thunder']):
    t = Image.open(R + f'still_{n}.jpg').resize((330, 330), Image.LANCZOS)
    st.paste(t, (40 + i * 355, 45))
st.save(R + 'cs_08_strip.jpg', quality=90); print('ok strip')
