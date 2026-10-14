#!/usr/bin/env python3
"""After uploading images/ADD01_... ADD12_... to the new Cargo page, run:
    python3 fill_hashes.py https://YOURSITE.cargo.site addendum-studio
It reads the page's media from the live site and writes 1_FINAL_page_code.html with real Cargo hashes."""
import sys, re, json, urllib.request, urllib.parse, os
site, purl = sys.argv[1].rstrip('/'), (sys.argv[2] if len(sys.argv) > 2 else 'addendum-studio')
h = urllib.request.urlopen(urllib.request.Request(site + '/' + urllib.parse.quote(purl), headers={'User-Agent': 'Mozilla/5.0'})).read().decode()
m = re.search(r'__PRELOADED_STATE__\s*=\s*', h); st = json.JSONDecoder().raw_decode(h[m.end():])[0]
media = {}
for p in st['pages'].get('byId', st['pages']).values():
    for x in p.get('media') or []: media[x['name']] = x['hash']
here = os.path.dirname(os.path.abspath(__file__))
code = open(os.path.join(here, '1_paste_into_page_CodeView.html')).read()
missing = []
for key, fname in json.load(open(os.path.join(here, 'image_map.json'))).items():
    real = media.get(fname) or next((v for k, v in media.items() if k.startswith(key + '_')), None)
    if real: code = code.replace(f'hash="{key}"', f'hash="{real}"')
    else: missing.append(fname)
open(os.path.join(here, '1_FINAL_page_code.html'), 'w').write(code)
print('written 1_FINAL_page_code.html' + (f' — not found on page: {missing}' if missing else ' — all 12 images matched'))
