"""Export GitHub Pages directory URLs without changing authored page markup."""
from pathlib import Path
import re,json

def export(root):
 root=Path(root)
 files=[p for p in root.glob('*.html') if p.name!='jingyizhang-design.html']
 routes={p.name:('./' if p.name=='index.html' else p.stem+'/') for p in files}
 routes['jingyizhang-design.html']='./'
 (root/'assets/clean-routes.json').write_text(json.dumps(routes,indent=2))
 router='''(()=>{
const routes=ROUTES;
const base=new URL(document.querySelector('base[data-clean-root]').href);
const clean=value=>{try{const u=new URL(value,document.baseURI);if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return null;const key=u.pathname.slice(base.pathname.length);if(!routes[key])return null;return new URL(routes[key]+u.search+u.hash,base).href}catch(e){return null}};
const rewrite=()=>document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(raw.startsWith('#')){a.href=location.pathname+location.search+raw;return}const u=clean(raw);if(u)a.href=u});
// Directory navigation must resolve against the site root, also on repository subpaths.
document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||a.target==='_blank'||a.hasAttribute('download')||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const u=new URL(a.href,document.baseURI);if(u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return;if(u.pathname===location.pathname&&u.hash)return;if(u.pathname.endsWith('/')||clean(a.href)){e.preventDefault();e.stopImmediatePropagation();location.href=clean(a.href)||u.href}},true);
const start=()=>{rewrite();new MutationObserver(rewrite).observe(document.body,{childList:true,subtree:true})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();'''.replace('ROUTES',json.dumps(routes))
 (root/'assets/clean-routing.js').write_text(router)
 for p in files:
  target=root/routes[p.name]/'index.html' if p.name!='index.html' else p
  s=p.read_text()
  if 'data-clean-redirect' in s:
   s=target.read_text()
  s=re.sub(r'<base data-clean-root[^>]*>','',s)
  s=re.sub(r'<script src="assets/clean-routing.js[^\"]*"></script>','',s)
  base='./' if p.name=='index.html' else '../'
  s=s.replace('<head>','<head><base data-clean-root href="'+base+'"><script src="assets/clean-routing.js?v=1"></script>',1)
  s=re.sub(r'assets/nav-glow\.js(?:\?v=[^\"]*)?', 'assets/nav-glow.js?v=clean1',s)
  target.parent.mkdir(exist_ok=True);target.write_text(s)
  if p.name!='index.html':p.write_text(redirect(routes[p.name]))
 (root/'jingyizhang-design.html').write_text(redirect('./'))

def redirect(url):
 return '<!doctype html><html><head><meta charset="utf-8"><meta data-clean-redirect http-equiv="refresh" content="0;url='+url+'"><script>location.replace('+json.dumps(url)+'+location.search+location.hash)</script><title>Jingyi Zhang</title></head><body><a href="'+url+'">Continue</a></body></html>'
if __name__=='__main__':export(Path(__file__).resolve().parents[1])
