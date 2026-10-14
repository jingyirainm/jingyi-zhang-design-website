#!/usr/bin/env python3
"""Static rebuild of rainmelonstudio-copy1.cargo.site.

Reads _src/site_dump.json (pages + media + site CSS exported from the Cargo site)
and writes a fully static site: one HTML file per page + assets/site.css + assets/site.js.

Cargo's own markup (column-set, gallery-*, media-item ...) is kept as custom elements so the
original site stylesheet and per-page CSS still apply; assets/base.css re-implements the layout
behaviour and assets/site.js re-implements galleries, slideshows, marquees and the lightbox.

Usage:  python3 build.py            (media hot-linked from Cargo's CDN)
        python3 build.py --local    (use files downloaded by download_media.py into assets/media/)
"""
import json, re, os, sys, html, unicodedata
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.abspath(__file__))
LOCAL = '--local' in sys.argv
D = json.load(open(os.path.join(ROOT, '_src', 'site_dump.json'), encoding='utf-8'))
PAGES = {k: v for k, v in D['pages'].items() if v.get('page_type') == 'page'}
# ---- EXTRA PAGES (hand-authored, e.g. Addendum Studio) ----
import glob as _glob
for _f in sorted(_glob.glob(os.path.join(ROOT, '_src', 'extra', '*.json'))):
    _x = json.load(open(_f, encoding='utf-8'))
    for _p in _x.get('pages', []):
        D['pages'][_p['id']] = _p
    for _pt in _x.get('patches', []):
        _pg = D['pages'].get(_pt['page'])
        if not _pg: continue
        if _pt['mode'] == 'append': _pg['content'] = (_pg.get('content') or '') + _pt['html']
        elif _pt['mode'] == 'after_first' and _pt['marker'] in _pg['content']:
            _pg['content'] = _pg['content'].replace(_pt['marker'], _pt['marker'] + _pt['html'], 1)
exec(open(os.path.join(ROOT, '_src', 'fixes.py'), encoding='utf-8').read())
PAGES = {k: v for k, v in D['pages'].items() if v.get('page_type') == 'page'}
SITE_CSS = D['css']['stylesheet']

# ---- global text size (1.0 = original Cargo sizes) ----
TEXT_SCALE = 0.85
def scale_fonts(css):
    if not css or TEXT_SCALE == 1: return css
    return re.sub(r'(font-size:\s*)([\d.]+)(rem|px)\b',
                  lambda m: f"{m.group(1)}{round(float(m.group(2)) * TEXT_SCALE, 4)}{m.group(3)}", css)
SITE_CSS = scale_fonts(SITE_CSS)
for _p in PAGES.values():
    _p['local_css'] = scale_fonts(_p.get('local_css'))
    _p['content'] = scale_fonts(_p.get('content'))
FAVICON = D['site'].get('favicon_url') or ''

HOME_ID = 'Z2116887359'                       # "Homepage — Desktop" is the site's index
PIN_IDS = {'L1192837497': 'pin-left', 'P0247037352': 'pin-mtop', 'B1072365829': 'pin-mbottom'}
NAV_ONLY = set(PIN_IDS)                         # rendered inside every page, not as standalone files

# ---------- media index ----------
MEDIA = {}
for v in D['pages'].values():
    for m in v.get('media') or []:
        MEDIA[m['hash']] = m
        if m.get('poster'): MEDIA.setdefault(m['poster']['hash'], m['poster'])

def media_url(m, w=2000):
    if m.get('local'): return m['local']
    name = m['name']
    if LOCAL:
        return f"assets/media/{m['hash']}_{name}"
    if m.get('is_video'):
        return f"https://freight.cargo.site/m/{m['hash']}/{name}"
    if name.lower().endswith('.gif'):
        return f"https://freight.cargo.site/t/original/i/{m['hash']}/{name}"
    return f"https://freight.cargo.site/w/{w}/q/85/i/{m['hash']}/{name}"

# ---------- url mapping ----------
def slug(s):
    s = unicodedata.normalize('NFKD', s).replace('—', '-').replace('–', '-')
    s = re.sub(r'[^A-Za-z0-9]+', '-', s).strip('-').lower()
    return s or 'page'

PURL2FILE = {}
for pid, p in PAGES.items():
    if pid in NAV_ONLY: continue
    PURL2FILE[p['purl']] = 'jingyizhang-design.html' if pid == HOME_ID else slug(p['purl']) + '.html'
    PURL2FILE[p['purl']] = {'aigc-conceptual.html': 'selection-1.html', 'soft-form-1.html': 'soft-form.html', 'jackery-home-power-3600.html': 'jackery-brand-campaign.html', 'mind-space.html': 'mindspace.html', 'index.html': 'jingyizhang-design.html', 'a-semiotic-study-on-iching.html': 'a-semiotic-study-on-the-i-ching.html', 'aigc-fashion.html': 'selection-2.html', 'aigc-product.html': 'selection-3.html', 'addendum-studio.html': 'reelshort-addendum-studio.html', 'nyfw26-post-realm.html': 'new-york-fashion-week-fw26.html', 'yi-iching-soundscapes.html': 'yi-daily-guidance.html', 'soft-form-2.html': 'soft-form-ceramics.html'}.get(PURL2FILE[p['purl']], PURL2FILE[p['purl']])
PURL2FILE['homepage-—-desktop'] = 'jingyizhang-design.html'
PURL2FILE[''] = 'jingyizhang-design.html'

def map_href(h):
    if h is None: return None
    h = h.strip()
    if not h: return '#'
    if re.match(r'^(https?:|mailto:|tel:|#)', h): return h
    key = h.strip('/')
    if key in PURL2FILE: return PURL2FILE[key]
    if os.path.exists(os.path.join(ROOT, h.split('#')[0].split('?')[0])): return h   # real file (e.g. yi-app/jingyizhang-design.html)
    print('  ! unknown link target:', h); return '#'

# ---------- tiny DOM ----------
VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'wbr'}
class Node:
    def __init__(s, tag, attrs=None, parent=None):
        s.tag, s.attrs, s.children, s.parent = tag, dict(attrs or {}), [], parent

class Parser(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=False)
        s.root = Node('#root'); s.cur = s.root
    def handle_starttag(s, tag, attrs):
        n = Node(tag, attrs, s.cur); s.cur.children.append(n)
        if tag not in VOID: s.cur = n
    def handle_startendtag(s, tag, attrs):
        s.cur.children.append(Node(tag, attrs, s.cur))
    def handle_endtag(s, tag):
        n = s.cur
        while n is not s.root and n.tag != tag: n = n.parent
        if n is not s.root: s.cur = n.parent
    def handle_data(s, data): s.cur.children.append(data)
    def handle_entityref(s, name): s.cur.children.append(f'&{name};')
    def handle_charref(s, name): s.cur.children.append(f'&#{name};')

def parse(src):
    p = Parser(); p.feed(src); p.close(); return p.root

def attrs_str(a):
    out = []
    for k, v in a.items():
        if v is None: out.append(k)
        else: out.append(f'{k}="{html.escape(str(v), quote=True)}"')
    return (' ' + ' '.join(out)) if out else ''

def rem_or(v, default):
    """Cargo gutters: '1' -> 1rem, '6rem 5rem' -> row col."""
    if not v: return default
    parts = []
    for x in v.split():
        parts.append(x + 'rem' if re.fullmatch(r'[\d.]+', x) else x)
    return ' '.join(parts)

# ---------- render ----------
def render(n, ctx):
    if isinstance(n, str): return n
    if n.tag == '#root': return ''.join(render(c, ctx) for c in n.children)
    t, a = n.tag, dict(n.attrs)
    inner = lambda: ''.join(render(c, ctx) for c in n.children)

    if t == 'a':
        if 'href' in a: a['href'] = map_href(a['href'])
        a.pop('rel', None)
        if a.get('href', '').startswith('http'): a.setdefault('target', '_blank'); a['rel'] = 'noopener'
        if a.get('href') == ctx.get('file'): a['class'] = (a.get('class', '') + ' active').strip()
        return f'<a{attrs_str(a)}>{inner()}</a>'

    if t == 'media-item':
        return render_media(n, a, ctx)

    if t == 'column-set':
        units = [c for c in n.children if isinstance(c, Node) and c.tag == 'column-unit']
        cls = 'cs' + ('' if a.get('mobile-stack') == 'false' else ' mstack')
        style = f"--gap:{rem_or(a.get('gutter'), '2rem')};--mgap:{rem_or(a.get('mobile-gutter'), '1rem')}"
        default_span = max(1, 12 // max(1, len(units)))
        body = ''
        for u in units:
            span = u.attrs.get('span') or default_span
            body += f'<div class="cu" style="--span:{span}">{"".join(render(c, ctx) for c in u.children)}</div>'
        return f'<column-set class="{cls}" style="{style}">{body}</column-set>'

    if t == 'gallery-columnized':
        style = f"--gap:{rem_or(a.get('gutter'), '1rem')};--mgap:{rem_or(a.get('mobile-gutter'), '1rem')}"
        return (f'<gallery-columnized data-cols="{a.get("columns", "3")}" data-mcols="{a.get("mobile-columns", "1")}" '
                f'style="{style}">{inner()}</gallery-columnized>')

    if t == 'gallery-grid':
        va = {'center': 'center', 'bottom': 'end'}.get(a.get('vertical-align'), 'start')
        style = (f"--cols:{a.get('columns', '3')};--gap:{rem_or(a.get('gutter'), '1rem')};"
                 f"--mgap:{rem_or(a.get('mobile-gutter'), '1rem')};--va:{va}")
        return f'<gallery-grid style="{style}">{inner()}</gallery-grid>'

    if t == 'gallery-slideshow':
        auto = a.get('autoplay', 'true') != 'false'
        data = (f' data-autoplay="{str(auto).lower()}" data-delay="{a.get("autoplay-delay", "3")}"'
                f' data-speed="{a.get("transition-speed", "0.8")}" data-nav="{a.get("navigation", "cursor-zones")}"'
                f' data-va="{a.get("vertical-align", "middle")}"')
        return f'<gallery-slideshow{data}>{inner()}</gallery-slideshow>'

    if t == 'gallery-freeform':
        return f'<gallery-freeform>{inner()}</gallery-freeform>'

    if t == 'marquee-set':
        return (f'<marquee-set data-speed="{a.get("speed", "-10")}"><div class="mq-track">'
                f'<div class="mq-copy">{inner()}</div><div class="mq-copy" aria-hidden="true">{inner()}</div>'
                f'</div></marquee-set>')
    if t == 'marquee-inner':
        return f'<marquee-inner>{inner()}</marquee-inner>'

    if t == 'text-icon':
        return '<span class="text-icon" aria-hidden="true">◐</span>'

    if t == 'span' and 'uses' in a: a.pop('uses')
    if t in VOID: return f'<{t}{attrs_str(a)}>'
    return f'<{t}{attrs_str(a)}>{inner()}</{t}>'

def render_media(n, a, ctx):
    m = MEDIA.get(a.get('hash'))
    caption = ''.join(render(c, ctx) for c in n.children if isinstance(c, Node) and c.tag == 'figcaption')
    if not m:
        return f'<media-item class="missing">{caption}</media-item>'
    w, h = m.get('width') or 1, m.get('height') or 1
    mstyle = a.get('media-style', '')
    cls = (a.get('class') or '').strip()
    if a.get('disable-zoom') == 'true': cls = cls.replace('zoomable', '').strip()
    outer = []
    scale = a.get('scale')
    if scale and scale not in ('100', '100%'):
        outer.append(f"--scale:{scale if scale.endswith('%') else scale + '%'}")
    if a.get('freeform-x') is not None:
        outer.append(f"--fx:{a['freeform-x']}%;--fy:{a.get('freeform-y', '0')}%;--fs:{a.get('freeform-scale', '50')}%;z-index:{a.get('freeform-z', '1')}")
    span = a.get('columnized-span') or a.get('grid-span')
    if m.get('is_url'):  # Vimeo / YouTube links: embed a player instead of a (broken) <img>
        u = m.get('url') or ''
        vm = re.search(r'vimeo\.com/(?:video/|videos/)?(\d+)', u)
        yt = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([\w-]{6,})', u)
        if vm: src = f'https://player.vimeo.com/video/{vm.group(1)}?dnt=1&title=0&byline=0&portrait=0'
        elif yt: src = f'https://www.youtube-nocookie.com/embed/{yt.group(1)}?rel=0'
        else:
            return f'<media-item class="embed-link"><a href="{html.escape(u)}" target="_blank" rel="noopener">{html.escape(m.get("display_name") or u)} ↗</a>{caption}</media-item>'
        title = html.escape(m.get('display_name') or 'Video')
        el = (f'<div class="embed-frame" style="position:relative;aspect-ratio:16/9;overflow:hidden;background:#000;{html.escape(mstyle)}">'
              f'<iframe src="{html.escape(src)}" title="{title}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen '
              f'style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>')
        cls = cls.replace('zoomable', '').strip()
        sp = f' data-span="{span}"' if span else ''
        return (f'<media-item class="{cls}" style="{";".join(outer)}"{sp}>'
                f'<div class="mi-frame">{el}</div>{caption}</media-item>')
    if m.get('is_video'):
        poster = media_url(m['poster']) if m.get('poster') else ''
        auto = a.get('autoplay') == 'true' or a.get('browser-default') != 'true'
        flags = ' autoplay muted loop playsinline' if auto else ' controls playsinline preload="metadata"'
        if a.get('browser-default') == 'true': flags += ' controls'
        pattr = ' poster="' + poster + '"' if poster else ''
        el = (f'<video class="media" src="{media_url(m)}"{flags} width="{w}" height="{h}"'
              f'{pattr} style="{html.escape(mstyle)}"></video>')
        full = media_url(m)
    else:
        el = (f'<img class="media" src="{media_url(m, 1600)}" alt="{html.escape(os.path.splitext(m.get("display_name") or "")[0])}" '
              f'width="{w}" height="{h}" loading="lazy" decoding="async" style="{html.escape(mstyle)}">')
        full = media_url(m, 3000)
    href = map_href(a.get('href')) if a.get('href') else None
    if href:
        el = f'<a class="mi-link" href="{href}">{el}</a>'
    data = f' data-full="{full}" data-video="{str(bool(m.get("is_video"))).lower()}"' if 'zoomable' in cls else ''
    sp = f' data-span="{span}"' if span else ''
    return (f'<media-item class="{cls}" style="{";".join(outer)}"{data}{sp}>'
            f'<div class="mi-frame">{el}</div>{caption}</media-item>')

def render_page(pid, ctx, extra_cls=''):
    p = PAGES[pid]
    src = p.get('content') or ''
    if pid == 'P0247037352':  # mobile top nav: Cargo pads it with runs of spaces; flex layout replaces them
        src = re.sub(r'(?:\s|&nbsp;|\u00a0){2,}', ' ', src)
    body = render(parse(src), ctx)
    return (f'<div class="page {extra_cls}" id="{pid}"><div class="page-layout"><div class="page-content">'
            f'<bodycopy>{body}</bodycopy></div></div></div>')

def local_css(pid):
    return PAGES[pid].get('local_css') or ''

# ---------- write ----------
os.makedirs(os.path.join(ROOT, 'assets'), exist_ok=True)
with open(os.path.join(ROOT, 'assets', 'site.css'), 'w', encoding='utf-8') as f:
    f.write('/* Original Cargo site stylesheet + every page\'s local CSS (unchanged) */\n')
    f.write(SITE_CSS + '\n\n')
    for pid in PAGES: f.write(f'/* --- {PAGES[pid]["title"]} --- */\n{local_css(pid)}\n\n')

MOBILE_HOME_ID = 'X2292480083'   # "Image Nav — Mobile" is what Cargo shows as the home page on phones
NAV_ONLY.add(MOBILE_HOME_ID)
def main_html(pid, ctx):
    if pid == HOME_ID and MOBILE_HOME_ID in PAGES:
        return (f'<div class="desk-only">{render_page(pid, ctx)}</div>'
                f'<div class="mob-only">{render_page(MOBILE_HOME_ID, ctx)}</div>')
    return render_page(pid, ctx)

def write_page(pid):
    p = PAGES[pid]; file = PURL2FILE[p['purl']]
    ctx = {'file': file}
    title = 'Rainmelon Studio' if pid == HOME_ID else f'{p["title"]} — Rainmelon Studio'
    pins = ''.join(f'<div class="pin {cls}">{render_page(nid, ctx, "pinned")}</div>' for nid, cls in PIN_IDS.items() if nid in PAGES)
    doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="Rainmelon Studio — Jingyi Zhang, product designer and visual artist based in New York.">
<link rel="icon" href="{FAVICON}">
<link rel="stylesheet" href="assets/base.css">
<link rel="stylesheet" href="assets/site.css">
<link rel="stylesheet" href="assets/theme.css">
<link rel="stylesheet" href="assets/dissolve.css?v=20261014c">
<script src="assets/theme.js"></script>
<script src="assets/cursor.js"></script>
<script src="assets/social.js" defer></script>
<script src="assets/nav-glow.js" defer></script>
<script src="assets/dissolve.js?v=20261014c" defer></script>
{p.get("head", "")}
<link rel="stylesheet" href="assets/type-scale.css">
<link rel="stylesheet" href="assets/mobile.css?v=20261014c">
</head>
<body class="page-{slug(p['purl'])}">
{pins}
<main class="main">{main_html(pid, ctx)}</main>
<div class="lightbox" hidden><button class="lb-close" aria-label="Close">×</button><div class="lb-stage"></div></div>
<script src="assets/site.js"></script>
<script src="assets/mobile.js?v=20261014c"></script>
{"".join(chr(60) + "script src=" + chr(34) + x + chr(34) + chr(62) + chr(60) + "/script" + chr(62) for x in p.get("scripts", []))}
</body>
</html>
'''
    with open(os.path.join(ROOT, file), 'w', encoding='utf-8') as f: f.write(doc)
    return file

written = [write_page(pid) for pid in PAGES if pid not in NAV_ONLY]
print('pages:', len(written)); print('\n'.join(sorted(written)))
missing = sorted({h for p in PAGES.values() for h in re.findall(r'hash="([^"]+)"', p.get('content') or '') if h not in MEDIA})
print('missing media:', len(missing))

# type scale (all font sizes x 0.9)
exec(open(os.path.join(ROOT, '_src', 'type_scale.py')).read().replace("if __name__ == '__main__':", 'if True:'), {'__file__': os.path.join(ROOT, '_src', 'type_scale.py')})

# page data for soft navigation (works when the site is opened as local files, where fetch is blocked)
import json as _json
os.makedirs(os.path.join(ROOT, 'assets', 'pages'), exist_ok=True)
for _f in written:
    _s = open(os.path.join(ROOT, _f), encoding='utf-8').read()
    if 'class="pin pin-left"' not in _s or 'assets/case.css' in _s: continue
    _m = re.search(r'<main class="main">.*?</main>', _s, re.S); _t = re.search(r'<title>(.*?)</title>', _s, re.S); _b = re.search(r'<body class="([^"]*)"', _s)
    _sc = [x for x in re.findall(r'<script src="([^"]+)"></script>', _s[_s.find('</main>'):]) if not x.endswith('site.js')]
    _d = {'main': _m.group(0), 'title': html.unescape(_t.group(1)), 'body': _b.group(1), 'scripts': _sc}
    with open(os.path.join(ROOT, 'assets', 'pages', _f[:-5] + '.js'), 'w', encoding='utf-8') as _o:
        _o.write('(window.rsPages=window.rsPages||{})[' + _json.dumps(_f) + ']=' + _json.dumps(_d, ensure_ascii=False) + ';')

# Keep the live mobile preview page picker in sync with every built page.
_mobile_pages = []
for _path in sorted(_glob.glob(os.path.join(ROOT, '*.html'))):
    if os.path.basename(_path) == 'mobile-preview.html': continue
    _source = open(_path, encoding='utf-8').read()
    _title = re.search(r'<title>(.*?)</title>', _source, re.S)
    if _title: _mobile_pages.append({'file': os.path.basename(_path), 'title': _title.group(1).replace(' — Rainmelon Studio', '').replace('Rainmelon Studio', 'Index')})
with open(os.path.join(ROOT, 'assets', 'mobile-pages.js'), 'w', encoding='utf-8') as _out:
    _out.write('window.rsMobilePages=' + json.dumps(_mobile_pages, ensure_ascii=False) + ';\n')

# Keep the conventional server entry point available.
with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as _entry:
    _entry.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=jingyizhang-design.html"><title>Rainmelon Studio</title></head><body><a href="jingyizhang-design.html">Rainmelon Studio</a></body></html>')
