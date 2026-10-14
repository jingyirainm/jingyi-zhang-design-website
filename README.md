# Rainmelon Studio — static site

A standalone rebuild of `rainmelonstudio-copy1.cargo.site` (all 25 pages).

## Folder
| Path | What it is |
|---|---|
| `index.html`, `work.html`, `menu.html` (Project), `about.html`, `knotboard.html` … | One file per page |
| `assets/site.css` | Your original Cargo stylesheet + every page's own CSS, unchanged |
| `assets/base.css` | Re-creates Cargo's layout (pinned left nav, columns, galleries, mobile mode) |
| `assets/site.js` | Masonry columns, slideshows, marquees, lightbox |
| `assets/fonts/` | Font files (see below) |
| `build.py` | Regenerates every page from `_src/site_dump.json` |
| `download_media.py` | Optional: downloads all images/videos locally |
| `_src/` | Content exported from Cargo (pages, media list, CSS) |

## Preview locally
```
cd ~/Desktop/rainmelon-site
python3 -m http.server 8000
```
Open http://localhost:8000 (opening the HTML files directly also works).

## Publish
Drag the whole folder onto https://app.netlify.com/drop, or push it to a GitHub Pages / Vercel repo, then point your own domain at it.

## Images & videos
By default media is loaded from Cargo's CDN (`freight.cargo.site`), so the site keeps working as long as the Cargo site exists.
To make it fully independent:
```
python3 download_media.py
python3 build.py --local
```

## Fonts
Cargo's **Diatype** and **Arizona** are licensed for Cargo-hosted sites only, so this build maps those family names to
open fonts (Inter → Diatype, Newsreader → Arizona). If you buy licences (Dinamo / ABC Diatype, Arizona), put the `.woff2`
files in `assets/fonts/` and change the `src:` lines at the top of `assets/base.css`.

## Updating content
Either edit the HTML files directly, or edit pages on Cargo, re-export (`_src/site_dump.json`) and run `python3 build.py`.

## Yi 易 — I Ching app (007)
- Prototype: `yi-app/index.html` (add `?bare` for full-screen without the desktop frame)
- Case study: `yi-iching-soundscapes.html`, built from `_src/extra/yi_content.html` + `yi_page.css` via `python3 _src/yi_source/make_json.py && python3 build.py`
- Screens: `node ~/Desktop/_shots/shoot_yi.js` → `assets/projects/yi/screens/`; boards: `python3 _src/yi_source/compose.py`

## Mobile preview and shared responsive design
Open `mobile-preview.html` through the local preview server. It embeds the real website at 320, 390 or 430 CSS pixels and supports scrolling, navigation and page selection. Desktop and mobile share HTML, images and descriptions; no separate mobile content copy is maintained. `assets/mobile.css` contains shared mobile presentation and `assets/mobile.js` aligns the mobile navigation with desktop destinations. `build.py` includes both on generated pages and refreshes `assets/mobile-pages.js`. After content changes, refresh the preview and check the three widths; new custom layouts still need a responsive review.
