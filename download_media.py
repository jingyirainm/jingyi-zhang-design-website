#!/usr/bin/env python3
"""Download every image/video the site uses into assets/media/, so the site no longer depends on Cargo.
Then run:  python3 build.py --local
Images are fetched at 2000px wide (GIFs and videos at original size)."""
import json, os, re, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(ROOT, '_src', 'site_dump.json'), encoding='utf-8'))
used = set()
for p in D['pages'].values():
    used.update(re.findall(r'hash="([^"]+)"', p.get('content') or ''))
media = {}
for p in D['pages'].values():
    for m in p.get('media') or []:
        media[m['hash']] = m
        if m.get('poster'): media[m['poster']['hash']] = m['poster']; used.add(m['poster']['hash']) if m['hash'] in used else None

out = os.path.join(ROOT, 'assets', 'media'); os.makedirs(out, exist_ok=True)
total = 0
for h in sorted(used):
    m = media.get(h)
    if not m: continue
    name = m['name']; dest = os.path.join(out, f"{h}_{name}")
    if os.path.exists(dest): continue
    if m.get('is_video'): url = f"https://freight.cargo.site/m/{h}/{name}"
    elif name.lower().endswith('.gif'): url = f"https://freight.cargo.site/t/original/i/{h}/{name}"
    else: url = f"https://freight.cargo.site/w/2000/q/85/i/{h}/{name}"
    try:
        data = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read()
        open(dest, 'wb').write(data); total += len(data)
        print(f"ok  {len(data)/1e6:6.1f} MB  {name}")
    except Exception as e:
        print('ERR', name, e)
print(f"done — {total/1e6:.0f} MB downloaded into assets/media/")
