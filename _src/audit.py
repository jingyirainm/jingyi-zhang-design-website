"""Site audit: links, reachability, numbering, nav, titles, media."""
import os, re, glob, collections, html
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = sorted(os.path.basename(f) for f in glob.glob(R + '/*.html'))
pages = {f: open(os.path.join(R, f), encoding='utf-8').read() for f in files}
def main(s): i = s.find('<main'); return s[i:] if i >= 0 else s
def pins(s): i = s.find('<main'); return s[:i]
print('PAGES', len(files))
inbound = collections.Counter(); broken = []; ext = collections.defaultdict(set); selfl = []; hashl = collections.Counter()
for f, s in pages.items():
    for h in re.findall(r'href="([^"]*)"', main(s)):
        if h.startswith(('http://', 'https://', 'mailto:')): ext[h].add(f); continue
        if h in ('#', ''): hashl[f] += 1; continue
        t = h.split('#')[0].split('?')[0]
        if not t: continue
        if not os.path.exists(os.path.join(R, t)): broken.append((f, h))
        elif t.endswith('.html'): inbound[t] += 1
print('\nBROKEN internal links:'); [print(' ', f, '->', h) for f, h in broken]
print('\nEMPTY/# links in main:', dict(hashl))
print('\nEXTERNAL links:'); [print(' ', h, '<-', sorted(v)[:4]) for h, v in sorted(ext.items())]
print('\nORPHANS (no inbound from page bodies):', [f for f in files if inbound[f] == 0])
nav = pins(pages['jingyizhang-design.html'])
print('\nNAV hrefs:', re.findall(r'href="([^"]*)"', nav))
print('NAV texts:', [html.unescape(re.sub('<[^>]+>', '', x)).strip() for x in re.findall(r'<a [^>]*>(.*?)</a>', nav)])
for f in ['work.html', 'menu.html', 'project.html', 'list.html', 'jingyizhang-design.html']:
    if f not in pages: continue
    m = main(pages[f]); txt = html.unescape(re.sub(r'<[^>]+>', ' ', m))
    nums = re.findall(r'(?<![\d.])0\d\d(?![\d])', txt)
    print(f'\n{f} numbers:', nums)
    rows = re.findall(r'<a [^>]*href="([^"]+)"[^>]*>(?:\s|&nbsp;|<[^>]+>)*(0\d\d)', m)
    print(' number->href:', rows)
    print(' titles:', [re.sub(r'\s+', ' ', html.unescape(re.sub('<[^>]+>', '', x))).strip()[:90] for x in re.findall(r'<div class="cu" style="--span:[678]">(.*?)</div>', m)][:20])
print('\nTITLES:'); [print(' ', f, '|', re.search(r'<title>(.*?)</title>', s).group(1)) for f, s in pages.items()]
print('\nTYPOS:')
for w in ['gird', 'Gird', 'Cosmo ', 'teh ', 'recieve', 'seperat', '  ', 'Iching']:
    hits = [f for f, s in pages.items() if w in html.unescape(re.sub(r'<[^>]+>', ' ', main(s))) and w.strip()]
    if hits and w.strip(): print(' ', repr(w), hits[:8])
print('\nPIN gird present:', 'gird' in pins(pages['jingyizhang-design.html']))
print('\nLOCAL media missing:')
for f, s in pages.items():
    for src in re.findall(r'(?:src|data-src|poster)="([^"]+)"', s):
        if src.startswith(('http', 'data:')): continue
        if not os.path.exists(os.path.join(R, src.split('#')[0].split('?')[0])): print(' ', f, src)
print('\nEXIT/back links per case page:')
for f, s in pages.items():
    m = main(s)
    if 'Exit Page' in m:
        print(' ', f, re.findall(r'href="([^"]+)"[^>]*>(?:<b>)?&nbsp;\s*Exit', m) or re.findall(r'<a [^>]*href="([^"]+)"[^>]*>(?:(?!</a>).)*Exit Page', m, re.S)[:1])
