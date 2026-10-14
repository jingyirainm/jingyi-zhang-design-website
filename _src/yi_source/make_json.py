"""Assembles _src/extra/yi.json (page + Work entry) from yi_content.html and yi_page.css."""
import json, os
from PIL import Image
ROOT = os.path.expanduser('~/Desktop/rainmelon-site/')
EX = ROOT + '_src/extra/'
SEC = ('<span class="project-title" style="color: rgba(157, 52, 52, 0.85); display: inline-block; border-width: 0.1rem; '
       'border-color: rgba(0, 0, 0, 0.85); border-style: solid; border-radius: 1rem; filter: drop-shadow(0.5rem 0.5rem 0.5rem rgba(0, 0, 0, 0.25)); '
       'background: #000000;"><span style="color: rgb(255, 255, 255);"><b>&nbsp;&nbsp; {} &nbsp;&nbsp;</b></span></span><br />\n<br />')
content = open(EX + 'yi_content.html', encoding='utf-8').read()
import re
content = re.sub(r'@@SEC (.+?)@@', lambda m: SEC.format(m.group(1)), content)
files = {'YI01': 'cs_01_hero.jpg', 'YI02': 'cs_02_onboarding.jpg', 'YI03': 'cs_03_cast.jpg', 'YI04': 'cs_04_eight.jpg',
         'YI05': 'cs_05_compose.jpg', 'YI06': 'cs_06_player.jpg', 'YI07': 'cs_07_about.jpg', 'YI08': 'cs_08_strip.jpg'}
media = []
for h, f in files.items():
    w, hh = Image.open(ROOT + 'assets/projects/yi/' + f).size
    media.append({'hash': h, 'name': f, 'display_name': f, 'width': w, 'height': hh, 'is_video': False, 'local': 'assets/projects/yi/' + f})
page = {'id': 'R00000YIAPP', 'title': 'YI 易 — Daily Guidance', 'purl': 'yi-iching-soundscapes', 'page_type': 'page',
        'content': content, 'head': '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@400;500;600&display=swap">\n<link rel="stylesheet" href="assets/projects/yi/yx.css">', 'scripts': ['assets/projects/yi/yi-case.js'], 'local_css': open(EX + 'yi_page.css', encoding='utf-8').read(), 'media': media}
B = 'color: rgb(255, 255, 255); display: inline-block; border-width: 0.1rem; border-color: rgba(0, 0, 0, 0.85); border-style: solid; border-radius: 1rem; background: rgb(0, 0, 0);'
work = ('<br />\n<br />\n<column-set gutter="1" mobile-stack="false"><column-unit slot="0" span="1"><div style="text-align: left"><b>'
        f'<a class="number" href="yi-iching-soundscapes" rel="history" style="{B}">&nbsp; 007 &nbsp;</a></b></div></column-unit>'
        '<column-unit slot="1" span="7"><a href="yi-iching-soundscapes" rel="history">YI 易 — I Ching-Inspired Daily Guidance</a></column-unit>'
        '<column-unit slot="2" span="4"><div style="text-align: right"><a class="wenshi" href="yi-iching-soundscapes" rel="history" style="color: rgba(0, 0, 0, 0.8); display: inline-block; border-width: 0.1rem; border-color: rgba(0, 0, 0, 0.47); border-style: solid; border-radius: 1rem;">&nbsp; &nbsp;Product Design / Mobile App&nbsp;&nbsp;</a></div></column-unit></column-set><br />\n'
        '<media-item class="linked" hash="YI01" href="yi-iching-soundscapes" rel="history" media-style="border-radius: 2rem; filter: drop-shadow(0.1rem 0.1rem 0.5rem rgba(0, 0, 0, 0.25));"></media-item><br />\n'
        'Designed a divination app inspired by the I Ching, combining tarot- and astrology-style daily guidance, mood check-ins, and personalized hexagram readings to support self-reflection, emotional well-being, and personal growth.<br />\n<br />\n<br />')
ADD_NEXT = '<hr /><br />\n<column-set mobile-gutter="0rem" mobile-stack="false"><column-unit slot="0" span="2"><div style="text-align: left"><a class="number" href="yi-iching-soundscapes" rel="history" style="color: rgb(255, 255, 255); display: inline-block; border-width: 0.1rem; border-color: rgba(0, 0, 0, 0.85); border-style: solid; border-radius: 1rem; background: rgb(0, 0, 0);"><b>&nbsp;&nbsp; 007 &nbsp;</b></a></div></column-unit><column-unit slot="1" span="8"><div style="text-align: center"><a href="yi-iching-soundscapes" rel="history">Next case study — Yi 易: I Ching Soundscapes, from Installation to App</a></div></column-unit><column-unit slot="2" span="2"><div style="text-align: right"><a class="number" href="yi-iching-soundscapes" rel="history" style="color: rgb(255, 255, 255); display: inline-block; border-width: 0.1rem; border-color: rgba(0, 0, 0, 0.85); border-style: solid; border-radius: 1rem; background: rgb(0, 0, 0);"><b>&nbsp; Next → &nbsp;</b></a></div></column-unit></column-set><br />\n<media-item class="linked" hash="YI01" href="yi-iching-soundscapes" rel="history" media-style="border-radius: 2rem; filter: drop-shadow(0.1rem 0.1rem 0.5rem rgba(0, 0, 0, 0.25));"></media-item><br />\n<br />'
json.dump({'pages': [page], 'patches': [{'page': 'T3057851291', 'mode': 'append', 'html': work}, {'page': 'R0000ADDNDM', 'mode': 'append', 'html': ADD_NEXT}]},
          open(EX + 'yi.json', 'w', encoding='utf-8'), ensure_ascii=False)
print('ok', len(content))
