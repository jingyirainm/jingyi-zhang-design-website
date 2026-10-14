# Site-wide logic fixes, applied by build.py after the Cargo export and _src/extra pages load.
# Each fix reports when its target text isn't found, so a re-export from Cargo can't fail silently.
import re as _re
_LOG = []
def _pg(pid): return D['pages'][pid]
def _sub(pid, old, new, count=1):
    c = _pg(pid)['content']
    if old not in c: _LOG.append(f'fix not applied [{pid}]: {old[:60]!r}'); return
    _pg(pid)['content'] = c.replace(old, new, count)
def _unlink_nth(pid, href, which):
    """Turn the n-th <a ... href="href" ...>…</a> (0-based, among those hrefs) into a plain <span>."""
    c = _pg(pid)['content']; ms = list(_re.finditer(r'<a ([^>]*?)href="%s"([^>]*)>' % _re.escape(href), c))
    for n in sorted(which, reverse=True):
        if n >= len(ms): _LOG.append(f'unlink miss [{pid}] {href} #{n}'); continue
        m = ms[n]; end = c.find('</a>', m.end())
        attrs = (m.group(1) + m.group(2)).replace('rel="history"', '').strip()
        c = c[:m.start()] + f'<span {attrs}>' + c[m.end():end] + '</span>' + c[end + 4:]
    _pg(pid)['content'] = c
def _relink_nth(pid, href, mapping):
    c = _pg(pid)['content']; ms = list(_re.finditer(r'href="%s"' % _re.escape(href), c))
    for n, new in sorted(mapping.items(), reverse=True):
        if n >= len(ms): _LOG.append(f'relink miss [{pid}] {href} #{n}'); continue
        m = ms[n]; c = c[:m.start()] + f'href="{new}"' + c[m.end():]
    _pg(pid)['content'] = c

# ---------- 1. Navigation ----------
NAV, MTOP, MBOT = 'L1192837497', 'P0247037352', 'B1072365829'
_sub(NAV, '<a href="project" rel="history">&#x3E; </a>', '<a href="menu" rel="history">&#x3E; </a>')   # Project (arrow + label) → the menu grid page
_sub(NAV, '<a href=""> ©</a> 2026', '© 2026')                                                        # empty link
_sub(MTOP, '>gird</a>', '>grid</a>')                                                                  # typo
_sub(MTOP, '<a href="list" rel="history"> \xa0list \xa0| about</a>',
     '<a href="list" rel="history"> \xa0list</a> \xa0| <a href="about" rel="history">about</a>')      # "about" was part of the list link
_c = _pg(MBOT)['content']                                                                             # template credit link (mariaoliveira.pt)
_pg(MBOT)['content'] = _re.sub(r'<a href="https://www\.mariaoliveira\.pt/2024">(.*?)</a>', r'\1', _c, flags=_re.S)

# ---------- 2. Work page: links, numbering ----------
WORK = 'T3057851291'
# href="cave-song" occurrences in order: 0,1 Casting · 2,3 Contract · 4,5,6 Cave Song · 7,8 Cave media · 9,10 Vibe Painting · 11,12 VIBE
# after relinking, the remaining cave-song links are: 0,1 Contract · … · last two VIBE
_relink_nth(WORK, 'cave-song', {0: 'reelshort-casting-system', 1: 'reelshort-casting-system', 9: 'vibe-painting', 10: 'vibe-painting'})
_c = _pg(WORK)['content']
# unlink rows with no case-study page yet (Contract Management, VIBE) – they pointed at Cave Song
_ms = list(_re.finditer(r"<a [^>]*href=\"cave-song\"", _c))
_unlink_nth(WORK, 'cave-song', [0, 1, len(_ms) - 2, len(_ms) - 1])
_sub(WORK, 'ReelShort Contract Management System — Production at $20,000 Scale',
     'ReelShort Contract Management System — Production at $20,000 Scale <span style="color: rgba(0, 0, 0, 0.4);">· Case study in progress</span>')
_sub(WORK, 'VIBE — Consumer Fashion AI App × Google Developer Group',
     'VIBE — Consumer Fashion AI App × Google Developer Group <span style="color: rgba(0, 0, 0, 0.4);">· Case study in progress</span>')
_sub(WORK, '<span style="color: rgba(0, 0, 0, 0.8);">Knotboard —AI-Powered SaaS for Creative Workflows</span>',
     '<a href="knotboard" rel="history" style="color: rgba(0, 0, 0, 0.8);">Knotboard —AI-Powered SaaS for Creative Workflows</a>')
# ---------- 3. Broken or empty links on case pages ----------
_sub('V1695500895', 'href="project" rel="history"', 'href="work" rel="history"', 2)   # Knotboard is a Work case study
_sub('T4133279435', 'href="visual-arts"', 'href="work"')                              # page no longer exists
_c = _pg('B2652448467')['content']; _pg('B2652448467')['content'] = _re.sub(r'<a href="">(.*?)</a>', r'\1', _c, flags=_re.S)
_sub('D0657258712', 'href="Presented at The Peripheral Experiment https://emergencystairs.org/the-peripheral-experiment/"',
     'href="https://emergencystairs.org/the-peripheral-experiment/" target="_blank"')
LIST = 'W3784380984'
_c = _pg(LIST)['content']; _n = len(_re.findall(r'href="this-morning,-this-afternoon,-summer"', _c))
_unlink_nth(LIST, 'this-morning,-this-afternoon,-summer', list(range(_n)))          # no page exists for this film

# ---------- 4. Copy ----------
_pg('G3448313462')['title'] = 'A Semiotic Study on the I Ching'
_c = _pg('G3448313462')['content']; _pg('G3448313462')['content'] = _c.replace('In the Cosmo ', 'In the Cosmos ').replace('In the Cosmo<', 'In the Cosmos<').replace('“A Semiotic Study on Iching”', '“A Semiotic Study on the I Ching”')
_c = _pg(LIST)['content']; _pg(LIST)['content'] = _c.replace('Semiotic Study on Iching', 'Semiotic Study on the I Ching')
_pg('O4158167021')['title'] = 'ReelShort Casting System'
if 'R00000YIAPP' in D['pages']: _pg('R00000YIAPP')['title'] = 'YI 易 · Daily Guidance'

# ---------- 5. Project page: list Yi next to Addendum ----------
_sub('E2638389155', '<media-item class="linked" hash="ADD01" href="addendum-studio"',
     '<media-item class="linked" hash="YI01" href="yi-iching-soundscapes" rel="history" media-style="border-radius: 1rem;"><figcaption class="caption" slot="caption"><div style="text-align: center">Product Design / Consumer App<br />YI 易 · Daily Guidance</div></figcaption></media-item>'
     '<media-item class="linked" hash="ADD01" href="addendum-studio"')

for _l in _LOG: print('  !', _l)
print('fixes applied' + (f' ({len(_LOG)} warnings)' if _LOG else ''))

# ---------- 6. I Ching page: trigram formulas contradicted the page's own breakdown ----------
_LOG.clear()
IC = 'G3448313462'
_c = _pg(IC)['content']
_c = _c.replace('Formula3_The Mountain+ The Water_山(Gen) + 兑(Dui) = 咸(Xian) = (5) +(7)', 'Formula3_The Mountain + The Rain_艮(Gen) + 兑(Dui) = 咸(Xian) = (7) + (5)')
_c = _c.replace('Formula4_The Thunder+ The River_震(Zhen) + 坎(Kan) = 解(Xie) = (6) + (8)', 'Formula4_The Thunder + The Water_震(Zhen) + 坎(Kan) = 解(Xie) = (8) + (6)')
_c = _c.replace('Formula3_The Mountain+ The Water_山(Gen) + 兑(Dui) = 咸(Xian)', 'Formula3_The Mountain + The Rain_艮(Gen) + 兑(Dui) = 咸(Xian)')
_c = _c.replace('Formula4_The Thunder+ The River_震(Zhen) + 坎(Kan) = 解(Xie)', 'Formula4_The Thunder + The Water_震(Zhen) + 坎(Kan) = 解(Xie)')
_c = _c.replace('The Eight Gua in Iching', 'The Eight Gua in the I Ching')
_pg(IC)['content'] = _c
# Casting page: an empty Cargo placeholder image
_c = _pg('O4158167021')['content']
_pg('O4158167021')['content'] = _re.sub(r'<media-item[^>]*hash="placeholder"[^>]*></media-item>', '', _c)

# ---------- 7. Work order (per Jingyi): 001 Knotboard · 002 Casting Pool · 003 Addendum · 004 Google (VIBE) · 005 I Ching (Yi) · 006 Cave Song
_c = _pg(WORK)['content']
_starts = [m.start() for m in _re.finditer(r'(?:<br />\s*)*<column-set', _c)
           if 'class="number"' in _c[m.start():_c.find('</column-set>', m.start())]]
_head, _blocks = _c[:_starts[0]], [_c[s:e] for s, e in zip(_starts, _starts[1:] + [len(_c)])]
def _find(key):
    for b in _blocks:
        if key in b[:b.find('</column-set>')]: return b
    _LOG.append(f'work row not found: {key}'); return ''
_ORDER = [('001', 'Knotboard'), ('002', 'ReelShort Casting System'), ('003', 'Addendum Studio'),
          ('004', 'VIBE — Consumer Fashion AI App'), ('005', 'Yi 易'), ('006', 'Cave Song —')]
_out = []
for _num, _key in _ORDER:
    _b = _find(_key)
    if not _b: continue
    _e = _b.find('</column-set>')
    _out.append(_re.sub(r'(?<=[\s;>\xa0])0\d\d(?=[\s&<\xa0])', _num, _b[:_e], count=1) + _b[_e:])
_pg(WORK)['content'] = _head + ''.join(_out)
# case pages: header numbers and their cross-links (source uses 006 = Addendum, 007 = Yi)
for _pid in ('R00000YIAPP', 'R0000ADDNDM'):
    if _pid in D['pages']:
        _c = _pg(_pid)['content']
        _c = _re.sub(r'(?<=[\s;>\xa0])007(?=[\s&<\xa0])', '@@Y', _c)
        _c = _re.sub(r'(?<=[\s;>\xa0])006(?=[\s&<\xa0])', '003', _c).replace('@@Y', '005')
        _c = _c.replace('Next case study — ', 'Related case study — ').replace('&nbsp; Next → &nbsp;', '&nbsp; View → &nbsp;')
        _pg(_pid)['content'] = _c
for _l in _LOG: print('  !', _l)

# ---------- 8. Addendum Studio: new cover (laptop mockup + SaaS board), see _src/addendum_cover/cover.html
if 'R0000ADDNDM' in D['pages']:
    _pg('R0000ADDNDM').setdefault('media', []).append({'hash': 'ADD00', 'name': '00_cover.jpg', 'display_name': '00_cover.jpg', 'width': 2880, 'height': 1800, 'is_video': False, 'local': 'assets/projects/addendum/00_cover.jpg'})
    for _pid, _v in D['pages'].items():
        _c = _v.get('content') or ''
        if 'hash="ADD01" href=' in _c: _v['content'] = _c.replace('hash="ADD01" href=', 'hash="ADD00" href=')
    _c = _pg('R0000ADDNDM')['content']; _i = _c.find('<media-item hash="ADD01"')
    if _i >= 0: _pg('R0000ADDNDM')['content'] = _c[:_i] + _c[_i:].replace('<media-item hash="ADD01"', '<media-item hash="ADD00"', 1)
# Addendum cover alternates between the light board (ADD00) and the isometric SaaS board (ADD0B)
if 'R0000ADDNDM' in D['pages']:
    _pg('R0000ADDNDM')['media'].append({'hash': 'ADD0B', 'name': '00_cover_board.jpg', 'display_name': '00_cover_board.jpg', 'width': 2880, 'height': 1800, 'is_video': False, 'local': 'assets/projects/addendum/00_cover_board.jpg'})
    _STY = 'border-radius: 2rem; filter: drop-shadow(0.1rem 0.1rem 0.5rem rgba(0, 0, 0, 0.25));'
    # only the isometric SaaS board (the laptop/desktop view was dropped)
    _SLIDES = f'<media-item class="linked" hash="ADD0B" href="addendum-studio" rel="history" media-style="{_STY}"></media-item>'
    _c = _pg(WORK)['content']
    _c2 = _re.sub(r'<media-item class="linked" hash="ADD00" href="addendum-studio"[^>]*></media-item>', lambda m: _SLIDES, _c, count=1)
    if _c2 == _c: _LOG.append('addendum cover slideshow not applied on Work')
    _pg(WORK)['content'] = _c2
    _c = _pg('R0000ADDNDM')['content']
    _pg('R0000ADDNDM')['content'] = _re.sub(r'(<media-item hash="ADD00"[^>]*></media-item>)', lambda m: m.group(1).replace('ADD00', 'ADD0B'), _c, count=1)
    for _l in _LOG: print('  !', _l)

# ---------- 9. Yi cover on Work: the five-phone board runs live (yi-app/board.html) instead of a still
_LIVE = ('<div class="yi-live-cover" style="position: relative; aspect-ratio: 1730 / 900; border-radius: 2rem; overflow: hidden; '
         'filter: drop-shadow(0.1rem 0.1rem 0.5rem rgba(0, 0, 0, 0.25)); background: #f3f3f3;">'
         '<iframe src="yi-app/board.html" title="Yi — five screens running" loading="lazy" tabindex="-1" '
         'style="position: absolute; inset: 0; width: 100%; height: 100%; border: 0; pointer-events: none;"></iframe>'
         '<a href="yi-iching-soundscapes" rel="history" aria-label="Open the Yi case study" style="position: absolute; inset: 0;"></a></div>')
_c = _pg(WORK)['content']
_c2 = _re.sub(r'<media-item class="linked" hash="YI01" href="yi-iching-soundscapes"[^>]*></media-item>', lambda m: _LIVE, _c, count=1)
if _c2 == _c: print('  ! Yi live cover not applied')
_pg(WORK)['content'] = _c2

# ---------- 10. (removed: the Vibe Painting GIF is now uploaded on Cargo itself)

# ---------- 11. Inline styles with border-style but no border-width: Cargo renders them borderless,
# browsers default to a 3px black "medium" border (the stray black frames on Knotboard etc.)
def _fix_border(m):
    st = m.group(1)
    if 'border-style' in st and 'border-width' not in st and not _re.search(r'border\s*:', st):
        st = st.rstrip().rstrip(';') + '; border-width: 0;'
    return f'style="{st}"'
_n = 0
for _pid, _v in D['pages'].items():
    _c = _v.get('content') or ''
    if 'border-style' not in _c: continue
    _c2 = _re.sub(r'style="([^"]*)"', _fix_border, _c)
    if _c2 != _c: _n += 1; _v['content'] = _c2
print(f'  border-width fix on {_n} pages')

# ---------- 12. Case-study mode on the Work case studies: full page, guide bar, reveals, Back, Next on
for _pid in ('V1695500895', 'O4158167021', 'R0000ADDNDM', 'R00000YIAPP', 'I0266811399'):
    if _pid not in D['pages']: continue
    _v = D['pages'][_pid]
    if 'assets/case.css' not in (_v.get('head') or ''):
        _v['head'] = (_v.get('head') or '') + '\n<link rel="stylesheet" href="assets/case.css">'
    _v['scripts'] = list(_v.get('scripts') or []) + ['assets/case.js']
# Cave Song still carried its old Work number
_c = _pg('I0266811399')['content']
_pg('I0266811399')['content'] = _re.sub(r'(class="number"[^>]*>(?:<[^>]+>|\s|&nbsp;|\xa0)*)003', r'\g<1>006', _c, count=1)

# ---------- 13. Work case studies: no "Exit Page" buttons (Back lives in the guide bar) and no
# "Related case study" blocks (Next on replaces them)
for _pid in ('V1695500895', 'O4158167021', 'R0000ADDNDM', 'R00000YIAPP', 'I0266811399'):
    if _pid not in D['pages']: continue
    _c = _pg(_pid)['content']; _before = len(_c)
    _c = _re.sub(r'<a [^>]*>(?:(?!</a>).)*?Exit\s*Page(?:(?!</a>).)*?</a>', '', _c, flags=_re.S)
    _c = _re.sub(r'<hr />\s*<br />\s*<column-set(?:(?!</column-set>).)*?(?:Related|Next) case study.*?</column-set>\s*<br />\s*<media-item[^>]*></media-item>(?:\s*<br />)*', '', _c, flags=_re.S)
    _pg(_pid)['content'] = _c

# ---------- 14. Work list: "Open case study" pill on project covers
_pg(WORK)['scripts'] = list(_pg(WORK).get('scripts') or []) + ['assets/work.js']

# ---------- 15. Index: keep the card gallery (synced from Cargo); phones get the same cards; add the
# "Selected work" interaction (assets/index-cards.js)
if 'Z2116887359' in D['pages']:
    _pg('Z2116887359')['scripts'] = list(_pg('Z2116887359').get('scripts') or []) + ['assets/index-cards.js']
    if 'X2292480083' in D['pages']:
        _pg('X2292480083')['content'] = _pg('Z2116887359')['content']
        _pg('X2292480083')['media'] = list(_pg('Z2116887359').get('media') or []) + list(_pg('X2292480083').get('media') or [])

# ---------- 16. Side-nav bio: new positioning line + current role
_sub(NAV, 'I’m a Product Designer based in NYC, graduating from Columbia University School of the Arts.\xa0<br />\n<br />\nI believe in minimal, effective design — seeing beneath the surface, then letting<br />\n\xa0only what matters remain.<br />',
     'An AI-native designer with a strong sense of product thinking, aesthetics, and creativity. I turn complex ideas into systems and bring them to life through design and code.<br />\n<br />\n'
     'Recently at <a href="https://www.reelshort.com/" target="_blank" rel="noopener">@ReelShort</a>.<br />')

# §17 Project (menu) page: category filter bar
for _pid, _v in D['pages'].items():
    if _v.get('purl') == 'menu':
        _v['scripts'] = list(_v.get('scripts') or []) + ['assets/menu-filter.js']

# §18 Knotboard intro: drop the black logo intro at the start (trimmed copies in assets/projects/knotboard/)
for _v in D['pages'].values():
    for _m in _v.get('media') or []:
        if _m.get('name') == 'Knotboard_Intro_v3.mp4':
            _m['local'] = 'assets/projects/knotboard/knotboard_intro.mp4'
            _m['poster'] = {'hash': 'KBPOSTER', 'name': 'knotboard_intro_poster.jpg', 'local': 'assets/projects/knotboard/knotboard_intro_poster.jpg', 'width': 1600, 'height': 1066, 'is_video': False}
        elif _m.get('name') == 'Knotboard_Intro_v3.gif':
            # Work page: play the sharp 1600px MP4 instead of the soft 800px GIF
            _m['local'] = 'assets/projects/knotboard/knotboard_intro.mp4'
            _m['is_video'] = True
            _m['width'], _m['height'] = 1600, 1066
            _m['poster'] = {'hash': 'KBPOSTER', 'name': 'knotboard_intro_poster.jpg', 'local': 'assets/projects/knotboard/knotboard_intro_poster.jpg', 'width': 1600, 'height': 1066, 'is_video': False}

# §19 Knotboard case study hero: drop the black logo frame (Group-20), open straight on the app screen
_c = _pg('V1695500895')['content']
_c2 = _re.sub(r'<gallery-slideshow[^>]*>\s*<media-item class="" hash="L3155306630494466494494698438142"[^>]*></media-item>\s*(<media-item class="linked" hash="N3155307075559060760885050277374"[^>]*></media-item>)\s*</gallery-slideshow>', r'\1', _c, count=1)
if _c2 == _c: print('  ! knotboard hero not changed')
_pg('V1695500895')['content'] = _c2

# §20 About page — modern layout (markup in _src/about.html, styles in assets/about.css, behaviour in assets/about.js)
_pg('B2652448467')['content'] = open(os.path.join(ROOT, '_src', 'about.html'), encoding='utf-8').read()
_pg('B2652448467')['scripts'] = list(_pg('B2652448467').get('scripts') or []) + ['assets/about.js']

# §21 Left navigation: no portrait photo, smaller name logo (-30%), narrower sidebar (-20%)
_c = _pg(NAV)['content']
_c2 = _re.sub(r'<media-item[^>]*hash="T3155300602375204367318873603582"[^>]*>\s*</media-item>', '', _c, count=1)
if _c2 == _c: print('  ! nav photo not removed')
_c3 = _re.sub(r'(hash="N3157472892728211835193290718718"[^>]*?)scale="94%"', r'\1scale="71.8%"', _c2, count=1)
if _c3 == _c2: print('  ! nav logo not resized')
_pg(NAV)['content'] = _c3
_pg(NAV)['local_css'] = _pg(NAV)['local_css'].replace('max-width: 24%;', 'max-width: 19.2%;')

# §22 Left navigation: the intro sits one blank line below "About" (no longer docked to the bottom)
_c = _pg(NAV)['content']
_c2 = _re.sub(r'(?:<br\s*/?>\s*){2,}(?=An AI-native designer)', '<br />\n', _c, count=1)
if _c2 == _c: print('  ! nav intro spacing not changed')
_pg(NAV)['content'] = _c2

# §23 Site icon: soft green (#8ACE00) glow instead of the old Cargo favicon
D['site']['favicon_url'] = 'assets/favicon-32.png'
for _v in D['pages'].values():
    _h = _v.get('head') or ''
    if 'apple-touch-icon' not in _h:
        _v['head'] = _h + '\n<link rel="icon" type="image/png" sizes="16x16" href="assets/favicon-16.png">\n<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">'

# §24 Project pages: no "Exit Page" / "Exit ×" buttons (the side bar is the way back)
_n = 0
for _pid, _v in D['pages'].items():
    _c = _v.get('content') or ''
    if 'Exit' not in _c: continue
    def _drop(m):
        _t = html.unescape(_re.sub(r'<[^>]+>', '', m.group(1))).replace('\xa0', ' ').strip()
        return '' if _re.fullmatch(r'Exit(?: Page)?\s*×?', _t, _re.I) else m.group(0)
    _c2 = _re.sub(r'<a\b[^>]*>(.*?)</a>', _drop, _c, flags=_re.S)
    _c2 = _re.sub(r'<div style="text-align: (?:right|left)">\s*</div>', '', _c2)
    if _c2 != _c: _n += 1; _v['content'] = _c2
print(f'  exit buttons removed on {_n} pages')

# §25 Project page: "play" style grid (two columns, hover titles, expand view) — assets/play.js, after menu-filter.js
for _pid, _v in D['pages'].items():
    if _v.get('purl') == 'menu' and 'assets/play.js' not in (_v.get('scripts') or []):
        _v['scripts'] = list(_v.get('scripts') or []) + ['assets/play.js']

# §26 New project introductions (text in _src/intros.json) on the Vibe Painting, Somniloquy and Jackery pages
_IN = json.load(open(os.path.join(ROOT, '_src', 'intros.json'), encoding='utf-8'))
def _intro(purl, start, end, key):
    for _v in D['pages'].values():
        if _v.get('purl') != purl: continue
        _c = _v['content']; i = _c.find(start); j = _c.find(end, i)
        if i < 0 or j < 0: print('  ! intro not found:', purl); return
        _v['content'] = _c[:i] + html.escape(_IN[key]['intro'], quote=False) + _c[j + len(end):]
_intro('vibe-painting', 'Vibe Painting is an AI-driven interactive visual system', 'real-time generative imagery.', 'vibe painting')
_intro('somniloquy', 'Somniloquy unfolds as a poetic dialogue', 'beyond the performance itself.', 'somniloquy')
_intro('jackery-home-power-3600', 'A commercial project for the launch of the Jackery', 'cinematic domestic environment.', 'jackery home power 3600 / 5000 launch video')
# the Project page reads the same text (hover + expanded view)
with open(os.path.join(ROOT, 'assets', 'intros.js'), 'w', encoding='utf-8') as _f:
    _f.write('/* generated from _src/intros.json by build.py */\nwindow.rsIntros=' + json.dumps(_IN, ensure_ascii=False) + ';\n')
for _v in D['pages'].values():
    if _v.get('purl') == 'menu':
        _sc = [x for x in (_v.get('scripts') or []) if x != 'assets/intros.js']
        _i = _sc.index('assets/play.js') if 'assets/play.js' in _sc else len(_sc)
        _v['scripts'] = _sc[:_i] + ['assets/intros.js'] + _sc[_i:]

# §27 "← Back" pill on every project detail page (not on the main pages or the Work case studies)
_MAIN = {'menu', 'about', 'list', 'work', 'index'}
_CASE = {'V1695500895', 'O4158167021', 'R0000ADDNDM', 'R00000YIAPP', 'I0266811399'}
for _pid, _v in D['pages'].items():
    _p = (_v.get('purl') or '')
    if _pid in _CASE or _p in _MAIN or _p.startswith('homepage') or _p.startswith('image-nav'): continue
    if _pid in (NAV, MTOP, MBOT) or _v.get('pin') or _v.get('overlay'): continue
    if 'assets/back.js' not in (_v.get('scripts') or []):
        _v['scripts'] = list(_v.get('scripts') or []) + ['assets/back.js']

# §27 Project detail pages: "← Back" control at the top (assets/back.js); case studies keep their own guide bar
_NOBACK = {'menu', 'about', 'list', 'work', 'homepage-—-desktop-1', 'image-nav-—-mobile', 'pages', 'project'}
for _pid, _v in D['pages'].items():
    if not _v.get('purl') or _v.get('purl') in _NOBACK or _v.get('pin'): continue
    if 'assets/case.css' in (_v.get('head') or ''): continue
    if 'assets/back.js' not in (_v.get('scripts') or []):
        _v['scripts'] = list(_v.get('scripts') or []) + ['assets/back.js']

# §28 Addendum Studio → "ReelShort Addendum Studio", new subtitle + description everywhere
_ADD_SUB = 'Payroll &amp; Legal Compliance System for ReelShort'
_ADD_DESC = 'Designed and built an automated payroll documentation tool for ReelShort, simplifying contract preparation, payment paperwork, and compliance workflows for production teams.'
for _pid, _v in D['pages'].items():
    _c = _v.get('content') or ''
    if 'Addendum Studio' not in _c and 'rules engine that turns crew deal memos' not in _c: continue
    _c = _re.sub(r'Addendum Studio\s*[—:]\s*Crew Payment Rules Engine(?: for ReelShort)?', 'ReelShort Addendum Studio — ' + _ADD_SUB, _c)
    _c = _c.replace('Addendum Studio @ ReelShort', 'ReelShort Addendum Studio')
    _c = _re.sub(r'Designed and built a rules engine that turns crew deal memos and timecards into signed payment addenda[^<]*', _ADD_DESC, _c)
    _c = _re.sub(r'(?<!ReelShort )Addendum Studio', 'ReelShort Addendum Studio', _c)
    _v['content'] = _c
    if _v.get('title') == 'Addendum Studio': _v['title'] = 'ReelShort Addendum Studio'

# §29 One source for project info (_src/projects_meta.json): Role / Medium / other facts
#      → assets/meta.js for the Project page, and a header (title + info bar) on each project page
_META = json.load(open(os.path.join(ROOT, '_src', 'projects_meta.json'), encoding='utf-8'))
with open(os.path.join(ROOT, 'assets', 'meta.js'), 'w', encoding='utf-8') as _f:
    _f.write('/* generated from _src/projects_meta.json by build.py */\nwindow.rsMeta=' + json.dumps(_META, ensure_ascii=False) + ';\n')
for _v in D['pages'].values():
    if _v.get('purl') == 'menu':
        _sc = [x for x in (_v.get('scripts') or []) if x != 'assets/meta.js']
        _i = _sc.index('assets/play.js') if 'assets/play.js' in _sc else len(_sc)
        _v['scripts'] = _sc[:_i] + ['assets/meta.js'] + _sc[_i:]
_STRIP = {   # old title / subtitle / scope blocks, per page
    'vibe-painting': [r'<column-set[^>]*>(?:(?!</column-set>).)*?Next Project.*?</column-set>',
                      r'<i><b><span style="--font-scale: 1\.4;">“Vibe Painting” \(2026\)</span></b><br />\s*</i>',
                      r'<div style="text-align: left"><i></i></div><i><span class="wenshi"><i>Interaction Design\s+/ Creative\s+Technology<br />\s*<br />\s*</i></span></i>'],
    'somniloquy': [r'<h2[^>]*>\s*<br />\s*Somniloquy<br />\s*</h2>',
                   r'<span style="color: rgba\(6, 0, 0, 0\.85\);"><column-set(?:(?!</column-set>).)*?SCOPE.*?</column-set></span>'],
    'jackery-home-power-3600': [r'<b><span style="--font-scale: 1\.4;">Jackery Home Power 3600 Plus Launch Campaign Video</span></b><i><br />\s*</i>',
                                r'\s*Production Design / Art\s+Direction<br />'],
    'mind-space': [r'<b><span style="--font-scale: 1\.4;">Mindspace</span></b><i><br />\s*</i>'],
    'a-meditation-practice': [r'<i><b><span style="--font-scale: 1\.4;">“A Meditation Practice” \(2026\)</span></b><br />\s*</i><div style="text-align: left"><i><span class="y"><i>Music\s+Video</i></span></i></div>'],
    'nyfw26-post-realm': [r'<b><span style="--font-scale: 1\.4;">New York Fashion Week 26 Post Realm Runway</span></b><i><br />\s*<span class="y"><i>Fashion Photography<br /></i></span></i>'],
    'knitted-nature': [r'<br />\s*Knitted Nature<br />\s*<br />'],
}
def _metahead(title, m):
    _e = lambda s: html.escape(s, quote=False)
    items = [('Role', m.get('role')), ('Medium', m.get('medium'))] + [tuple(x) for x in m.get('other', [])]
    dl = ''.join(f'<div><dt>{_e(k)}</dt><dd>{_e(v)}</dd></div>' for k, v in items if v)
    return f'<div class="pj-head"><h1 class="pj-title">{_e(title)}</h1><dl class="pj-meta">{dl}</dl></div>'
for _title, _m in _META.items():
    _purl = _m.get('page')
    if not _purl: continue
    _v = next((v for v in D['pages'].values() if v.get('purl') == _purl), None)
    if not _v: print('  ! meta page not found:', _purl); continue
    _c = _v.get('content') or ''
    for _rx in _STRIP.get(_purl, []):
        _c2 = _re.sub(_rx, '', _c, count=1, flags=_re.S)
        if _c2 == _c: print('  ! strip miss', _purl, _rx[:40])
        _c = _c2
    _c = _re.sub(r'<b>ROLE</b>.*?(?=<b>INTRODUCTION</b>)', '', _c, count=1, flags=_re.S)   # old ROLE list
    _c = _re.sub(r'^(?:\s|<br\s*/?>)+', '', _c)
    _v['content'] = _metahead(_title, _m) + _c
    _v['title'] = _title
    if 'assets/projmeta.css' not in (_v.get('head') or ''):
        _v['head'] = (_v.get('head') or '') + '\n<link rel="stylesheet" href="assets/projmeta.css">'
    if 'assets/back.js' not in (_v.get('scripts') or []):
        _v['scripts'] = list(_v.get('scripts') or []) + ['assets/back.js']
    if 'assets/projmeta.js' not in (_v.get('scripts') or []):
        _v['scripts'] = list(_v.get('scripts') or []) + ['assets/projmeta.js']

# §30 Yi repositioned as a consumer daily-guidance app (runs last so earlier lookups still match)
for _pid, _v in D['pages'].items():
    _cc = _v.get('content') or ''
    _cc = _cc.replace('Yi 易 — I Ching Soundscapes, from Installation to Mobile App', 'YI 易 — I Ching-Inspired Daily Guidance App')
    _cc = _cc.replace('Designed a divination app inspired by the I Ching, combining tarot- and astrology-style daily guidance, mood check-ins, and personalized hexagram readings to support self-reflection, emotional well-being, and personal growth.',
                      'Designed a divination app inspired by the I Ching, combining tarot- and astrology-style daily guidance, mood check-ins, and personalized hexagram readings to support self-reflection, emotional well-being, and personal growth.')
    _v['content'] = _cc
