"""Yi: beige → white, gold accent → glowing white. Also adds next-project links between Yi and Addendum."""
import os, json
H = os.path.expanduser('~/Desktop/rainmelon-site/')
O = os.path.expanduser('~/Library/Application Support/Claude/local-agent-mode-sessions/d9ba83ee-1cc7-4704-8060-4fde9daf6162/74f1b920-68d8-4816-b65d-9cc065c758b4/2d3bd865/outputs/yi/site/')
GT = 'text-shadow:0 0 6px rgba(255,255,255,.85),0 0 16px rgba(255,255,255,.45)'
GB = 'box-shadow:0 0 6px rgba(255,255,255,.9),0 0 14px rgba(255,255,255,.5)'

def edit(path, pairs, generic=True):
    s = open(path, encoding='utf-8').read()
    for a, b in pairs:
        if a in s: s = s.replace(a, b)
        else: print('  (not found)', os.path.basename(path), a[:50])
    if generic:
        s = s.replace('#e9c27a', '#fff').replace('#E9C27A', '#FFFFFF').replace('rgba(233,194,122,', 'rgba(255,255,255,').replace('#fff3d6', '#fff')
    open(path, 'w', encoding='utf-8').write(s); print('ok', os.path.basename(path))

COPY = [
    ('one accent, gold, reserved for changing lines', 'one accent, a white glow, reserved for changing lines'),
    ('shown in gold', 'shown glowing'),
    ('which the reading shows in gold', 'which the reading shows glowing'),
    ('with its changing line in gold', 'with its changing line glowing'),
    ('The gold line is its changing line', 'The glowing line is its changing line'),
    ('Gold appears only on changing lines', 'The glow appears only on changing lines'),
    ('marked in gold', 'marked with a glow'),
]

APP = [
    ('background:#ecebe5;', 'background:#ffffff;'),
    ('.gl i.ch{color:#e9c27a}', '.gl i.ch{color:#fff}.gl i.ch::before,.gl i.ch::after{' + GB + '}'),
    ('.cl.ch .bar::before,.cl.ch .bar::after{background:#e9c27a}', '.cl.ch .bar::before,.cl.ch .bar::after{background:#fff;' + GB + '}'),
    ('border-radius:50%;background:#e9c27a}', 'border-radius:50%;background:#fff;' + GB + '}'),
    ('.ctrl .sm.on{color:#e9c27a}', '.ctrl .sm.on{color:#fff;filter:drop-shadow(0 0 4px rgba(255,255,255,.8))}'),
    ('style="color:#e9c27a"', 'style="color:#fff;' + GT + '"'),
]
for p in [H + 'yi-app/index.html', O + 'app.html']: edit(p, APP)

edit(H + 'assets/projects/yi/yx.css', [
    ('.yx-ph.light { background: #d6d2c8;', '.yx-ph.light { background: #f1f1f1;'), ('#bdb8ad', '#d9d9d9'),
    ('.yx-chips .g { border-color: rgba(233,194,122,.5); color: #e9c27a; }', '.yx-chips .g { border-color: rgba(255,255,255,.7); color: #fff; ' + GT.replace(':', ': ', 1) + '; box-shadow: 0 0 .8rem rgba(255,255,255,.2), inset 0 0 .6rem rgba(255,255,255,.12); }'),
    ('border-radius: 50%; background: #e9c27a; animation: yxping', 'border-radius: 50%; background: #fff; ' + GB.replace(':', ': ', 1) + '; animation: yxping'),
    ('.yx-panel.paper { background: #e4e1d8; color: #16140f; }', '.yx-panel.paper { background: #ffffff; color: #000; box-shadow: inset 0 0 0 0.1rem rgba(0,0,0,.1); }'),
    ('background: #e4e1d8; color: #16140f; border-radius: 2rem;', 'background: #ffffff; color: #000; box-shadow: inset 0 0 0 0.1rem rgba(0,0,0,.1); border-radius: 2rem;'),
    ('.yx-beyond figcaption { font-size: .72rem; color: #6b665b; }', '.yx-beyond figcaption { font-size: .72rem; color: rgba(0,0,0,.5); }'),
    ('color: #4c483f; max-width: 18rem;', 'color: rgba(0,0,0,.65); max-width: 18rem;'),
    ('color: #16140f; margin-bottom: .5rem;', 'color: #000; margin-bottom: .5rem;'),
    ('.yx-icon .g i.c::before { background: #e9c27a;', '.yx-icon .g i.c::before { background: #fff; box-shadow: 0 0 calc(var(--s) * .04) rgba(255,255,255,.9);'),
    ('box-shadow: 0 0 calc(var(--s) * .06) rgba(233,194,122,.9); } }', 'box-shadow: 0 0 calc(var(--s) * .05) #fff, 0 0 calc(var(--s) * .14) rgba(255,255,255,.7); } }'),
])
edit(H + '_src/extra/yi_page.css', [
    ('background: #ecebe5; border-radius: 2rem;', 'background: #ffffff; border-radius: 2rem;'),
    ('font-size: .75rem; color: #e9c27a; margin-top: .15rem; }', 'font-size: .75rem; color: #fff; ' + GT.replace(':', ': ', 1) + '; margin-top: .15rem; }'),
])
TOK_OLD = '<div style="background:#e9c27a;color:#000"><b>Change</b>#E9C27A</div>'
TOK_NEW = '<div style="background:#000;color:#fff;box-shadow:inset 0 0 1.4rem rgba(255,255,255,.35)"><b style="text-shadow:0 0 .4rem rgba(255,255,255,.9)">Change · glow</b>#FFFFFF</div>'
edit(H + '_src/extra/yi_content.html', COPY + [(TOK_OLD, TOK_NEW)])

# showcase artifact page
edit(O + 'yi.html', COPY + [
    ('--gold:#E9C27A;--stone:#E4E1D8;--stoneInk:#16140f;', '--gold:#FFFFFF;--stone:#FFFFFF;--stoneInk:#000000;'),
    ('.ph.light{background:#d6d2c8;', '.ph.light{background:#f1f1f1;'), ('#bdb8ad', '#d9d9d9'),
    ('color:#6b665b', 'color:rgba(0,0,0,.5)'), ('color:#4c483f', 'color:rgba(0,0,0,.65)'),
    ('.chip.g{border-color:rgba(233,194,122,.45);color:var(--gold)}', '.chip.g{border-color:rgba(255,255,255,.7);color:#fff;' + GT + ';box-shadow:0 0 14px rgba(255,255,255,.2),inset 0 0 10px rgba(255,255,255,.12)}'),
    ('.kwg button.sc b{color:var(--gold)}', '.kwg button.sc b{color:#fff;' + GT + '}'),
    ('.coins .ch2 .ln::before,.coins .ch2 .ln::after{background:var(--gold)}', '.coins .ch2 .ln::before,.coins .ch2 .ln::after{background:#fff;' + GB + '}'),
    ('font-size:12px;color:var(--gold);margin-top:2px}', 'font-size:12px;color:#fff;' + GT + ';margin-top:2px}'),
    ('.icon .g i.c::before{background:var(--gold);', '.icon .g i.c::before{background:#fff;box-shadow:0 0 calc(var(--s)*.04) rgba(255,255,255,.9);'),
    ('<div style="background:#E9C27A;color:#000;border-color:#E9C27A"><b>Change</b>#E9C27A</div>', '<div style="background:#000;color:#fff;box-shadow:inset 0 0 22px rgba(255,255,255,.35)"><b style="text-shadow:0 0 6px rgba(255,255,255,.9)">Change · glow</b>#FFFFFF</div>'),
    ('.beyond{display:grid;grid-template-columns:auto auto minmax(0,1fr);', '.beyond{box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);display:grid;grid-template-columns:auto auto minmax(0,1fr);'),
])

# next-project links (Yi ⇄ Addendum)
PILL = 'color: rgb(255, 255, 255); display: inline-block; border-width: 0.1rem; border-color: rgba(0, 0, 0, 0.85); border-style: solid; border-radius: 1rem; background: rgb(0, 0, 0);'
def nxt(num, href, label, hash_):
    return ('<hr /><br />\n<column-set mobile-gutter="0rem" mobile-stack="false"><column-unit slot="0" span="2"><div style="text-align: left">'
            f'<a class="number" href="{href}" rel="history" style="{PILL}"><b>&nbsp;&nbsp; {num} &nbsp;</b></a></div></column-unit>'
            f'<column-unit slot="1" span="8"><div style="text-align: center"><a href="{href}" rel="history">Next case study — {label}</a></div></column-unit>'
            f'<column-unit slot="2" span="2"><div style="text-align: right"><a class="number" href="{href}" rel="history" style="{PILL}"><b>&nbsp; Next → &nbsp;</b></a></div></column-unit></column-set><br />\n'
            f'<media-item class="linked" hash="{hash_}" href="{href}" rel="history" media-style="border-radius: 2rem; filter: drop-shadow(0.1rem 0.1rem 0.5rem rgba(0, 0, 0, 0.25));"></media-item><br />\n<br />')
c = open(H + '_src/extra/yi_content.html', encoding='utf-8').read()
if 'Next case study' not in c:
    c = c.rstrip() + '\n' + nxt('006', 'addendum-studio', 'Addendum Studio: Crew Payment Rules Engine for ReelShort', 'ADD01') + '\n'
    open(H + '_src/extra/yi_content.html', 'w', encoding='utf-8').write(c); print('ok yi next link')
mj = H + '_src/yi_source/make_json.py'; m = open(mj, encoding='utf-8').read()
if 'R0000ADDNDM' not in m:
    m = m.replace("'patches': [{'page': 'T3057851291', 'mode': 'append', 'html': work}]",
                  "'patches': [{'page': 'T3057851291', 'mode': 'append', 'html': work}, {'page': 'R0000ADDNDM', 'mode': 'append', 'html': ADD_NEXT}]")
    m = m.replace("json.dump({'pages'", "ADD_NEXT = " + repr(nxt('007', 'yi-iching-soundscapes', 'Yi 易: I Ching Soundscapes, from Installation to App', 'YI01')) + "\njson.dump({'pages'")
    open(mj, 'w', encoding='utf-8').write(m); print('ok addendum next link')
