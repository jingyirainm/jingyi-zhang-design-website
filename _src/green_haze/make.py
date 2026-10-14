"""Misty green mountain haze (#8ACE00) on white — no icons, no text. Writes 2964x1964 PNG + JPG."""
import numpy as np, os
from PIL import Image, ImageFilter
D = os.path.dirname(os.path.abspath(__file__))
W, H = 2964, 1964
rng = np.random.default_rng(7)
G = np.array([138, 206, 0], float) / 255.0          # #8ACE00
x = np.linspace(0, 1, W)

def ridge(base, amp, seeds):
    y = np.full(W, base)
    for f, a, ph in seeds:
        y += amp * a * np.sin(2 * np.pi * (f * x + ph))
    return y

# far -> near: (ridge base, amplitude, strength, blur px)
layers = [(0.50, 0.10, 0.24, 80), (0.60, 0.11, 0.40, 62), (0.71, 0.10, 0.64, 48), (0.84, 0.08, 0.95, 40)]
alpha = np.zeros((H, W))
yy = np.arange(H)[:, None] / H
for base, amp, strength, blur in layers:
    seeds = [(rng.uniform(.6, 1.4), 1.0, rng.uniform()), (rng.uniform(2, 3.2), .45, rng.uniform()), (rng.uniform(5, 7), .18, rng.uniform())]
    top = ridge(base, amp, seeds)[None, :]
    body = np.clip((yy - top) / 0.22, 0, 1) ** 0.8
    m = Image.fromarray((body * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(blur))
    alpha = np.maximum(alpha, np.asarray(m, float) / 255 * strength)

cx, cy = .52, 1.02
r = np.sqrt(((np.arange(W)[None, :] / W - cx) * 1.25) ** 2 + (np.arange(H)[:, None] / H - cy) ** 2)
glow = np.clip(1 - r / .62, 0, 1) ** 1.6 * .55
alpha = np.clip(alpha * .85 + glow * (1 - alpha * .5), 0, 1)
fog = np.asarray(Image.fromarray((rng.random((H // 16, W // 16)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(60)), float) / 255
alpha = np.clip(alpha * (0.82 + 0.25 * (fog - .5)), 0, 1)
alpha = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(24))
a = np.asarray(alpha, float)[..., None] / 255
img = (1 - a) * 1.0 + a * G
img += (rng.random((H, W, 1)) - .5) * 0.018
out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
out.save(os.path.join(D, 'green_haze.png'))
out.save(os.path.join(D, 'green_haze.jpg'), quality=94)
out.resize((1482, 982), Image.LANCZOS).save('/Users/jingyizhang/Downloads/_g.png')
print('ok')
