import os, subprocess
D = os.path.dirname(os.path.abspath(__file__))
A = '../../assets/projects/addendum/'
BASE = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Inter;src:url(../../assets/fonts/inter-var.woff2) format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}body{width:1440px;height:900px;overflow:hidden;font-family:Inter,sans-serif}
.cv{position:relative;width:1440px;height:900px;overflow:hidden}
.lap{position:absolute;z-index:3}
.lid{position:relative;background:#141517;border-radius:22px 22px 6px 6px;padding:14px 14px 22px;box-shadow:0 0 0 1.5px #3a3b3f inset}
.lid .scr{border-radius:6px;overflow:hidden;aspect-ratio:16/10;background:#fff}.lid .scr img{width:100%;height:100%;object-fit:cover;object-position:top left;display:block}
.base{position:relative;height:18px;margin:0 -64px;background:linear-gradient(#e2e4e8,#b9bcc3 60%,#8f939b);border-radius:2px 2px 18px 18px}
.base::before{content:'';position:absolute;left:50%;top:0;transform:translateX(-50%);width:150px;height:7px;background:#a3a7af;border-radius:0 0 8px 8px}
.card{position:absolute;background:#fff;border-radius:14px;overflow:hidden}
.card img{width:100%;display:block}
</style></head><body><div class="cv">%s</div></body></html>"""

LAP = lambda img: f'<div class="lid"><div class="scr"><img src="{A}{img}"></div></div><div class="base"></div>'

V = {
# A · dark studio: centered laptop, one document and the KPI strip — the quiet option
'cover_a_dark': f"""<style>.cv{{background:radial-gradient(70% 80% at 50% 45%,#232428 0%,#0c0c0d 60%,#050505 100%)}}
.lap{{left:250px;top:120px;width:940px;filter:drop-shadow(0 60px 80px rgba(0,0,0,.6))}}
.doc{{left:1080px;top:250px;width:300px;transform:rotate(6deg);z-index:2;box-shadow:0 40px 80px -20px rgba(0,0,0,.7);border-radius:6px;height:470px}}
.kpi{{left:150px;top:640px;width:500px;height:78px;padding:10px 12px;z-index:4;box-shadow:0 30px 60px -20px rgba(0,0,0,.7)}}
.kpi div{{width:100%;height:100%;background:url({A}02_stats.png) left center/1080px auto no-repeat}}
.floor{{position:absolute;left:0;right:0;bottom:0;height:200px;background:linear-gradient(transparent,rgba(255,255,255,.03))}}</style>
<div class="floor"></div><div class="card doc"><img src="{A}10_document_texas.png"></div>
<div class="lap">{LAP('01_workspace.png')}</div><div class="card kpi"><div></div></div>""",

# B · isometric SaaS board: every surface laid out on a tilted plane
'cover_b_board': f"""<style>.cv{{background:linear-gradient(160deg,#f6f7f9,#e4e7ec)}}
.plane{{position:absolute;left:50%;top:50%;width:1500px;height:1000px;margin:-500px 0 0 -750px;transform:rotateX(52deg) rotateZ(-34deg);transform-style:preserve-3d}}
.plane .card{{box-shadow:-30px 40px 60px -10px rgba(30,40,60,.28),0 0 0 1px rgba(0,0,0,.05)}}
.w1{{left:120px;top:120px;width:860px}} .w2{{left:1010px;top:120px;width:250px}} .w3{{left:1010px;top:660px;width:430px}}
.w4{{left:120px;top:700px;width:420px}} .w5{{left:570px;top:700px;width:410px}}
.w1{{transform:translateZ(40px)}} .w2{{transform:translateZ(90px)}} .w3{{transform:translateZ(20px)}} .w5{{transform:translateZ(60px)}}</style>
<div class="plane">
<div class="card w1"><img src="{A}01_workspace.png"></div>
<div class="card w2"><img src="{A}04_queue.png"></div>
<div class="card w3"><img src="{A}02_stats.png" style="width:900px;max-width:none"></div>
<div class="card w4"><img src="{A}03_projects_menu.png"></div>
<div class="card w5"><img src="{A}11_document_ca.png" style="height:300px;object-fit:cover;object-position:top"></div>
</div>""",

# C · brand red: ReelShort red field, laptop + document, small wordmark
'cover_c_red': f"""<style>.cv{{background:radial-gradient(80% 90% at 30% 40%,#f04a5f 0%,#d61f3c 45%,#9e0f27 100%)}}
.lap{{left:110px;top:170px;width:900px;filter:drop-shadow(0 50px 70px rgba(70,0,10,.55))}}
.doc{{left:1040px;top:150px;width:340px;height:560px;transform:rotate(4deg);z-index:2;box-shadow:0 40px 80px -20px rgba(70,0,10,.6);border-radius:6px}}
.mark{{position:absolute;left:110px;top:70px;color:#fff;font-size:22px;font-weight:600;letter-spacing:-.01em;display:flex;gap:12px;align-items:center}}
.mark img{{width:38px;height:38px;border-radius:10px;box-shadow:0 0 0 2px rgba(255,255,255,.4)}}
.mark span{{font-weight:400;opacity:.75;font-size:15px}}</style>
<div class="mark"><img src="reelshort-icon.png">Addendum Studio <span>· crew payment rules engine</span></div>
<div class="card doc"><img src="{A}10_document_texas.png"></div>
<div class="lap">{LAP('01_workspace.png')}</div>""",
}
CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
for k, body in V.items():
    p = os.path.join(D, k + '.html'); open(p, 'w').write(BASE.replace('%s', body))
    subprocess.run([CH, '--headless=new', '--hide-scrollbars', '--force-device-scale-factor=2', '--window-size=1440,900',
                    '--virtual-time-budget=4000', '--allow-file-access-from-files', f'--screenshot={D}/{k}.png', 'file://' + p],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print('ok', k)
