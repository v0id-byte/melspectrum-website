#!/usr/bin/env python3
"""MelSpectrum brand generator — the ONLY source of every brand raster/vector artifact.

  python3 generate.py            # writes svg/ masters, dist/ artifacts, manifest.json
Inputs: brand.json, this file, the two font files (frozen instances). Output provenance in manifest.json
(no commit self-reference: sourceParentCommit = repo HEAD at generation, sourceTreeDigest = hash of inputs).
Rasterizer: Google Chrome headless (exact pixels); post-processing/validation: Pillow.
"""
import base64, hashlib, json, math, os, platform, re, subprocess, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, '..', 'fonts')
INTER, NOTO = os.path.join(FONTS, 'Inter.ttf'), os.path.join(FONTS, 'NotoSansSC.ttf')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
BRAND = json.load(open(os.path.join(HERE, 'brand.json')))
C = BRAND['colors']; TEAL, TEALD, BLACK, WHITE, ASH, SILVER = C['teal'], C['tealDark'], C['black'], C['white'], C['ash'], C['silver']
VIOLET = C['somnil']['srgb']
VB = {'display': 64, 'standard': 32, 'micro': 16, 'appicon': 100}
DIST = os.path.join(HERE, 'dist'); SVGDIR = os.path.join(HERE, 'svg')

def _f(x): return ('%.3f' % x).rstrip('0').rstrip('.')
def sha(b): return hashlib.sha256(b).hexdigest()

# ---------------------------------------------------------------- geometry
def _catmull(pts, t=0.9):
    d = [f'M{_f(pts[0][0])} {_f(pts[0][1])}']
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i-1], P[i], P[i+1], P[i+2]
        c1 = (p1[0] + (p2[0]-p0[0]) * t / 3, p1[1] + (p2[1]-p0[1]) * t / 3)
        c2 = (p2[0] - (p3[0]-p1[0]) * t / 3, p2[1] - (p3[1]-p1[1]) * t / 3)
        d.append(f'C{_f(c1[0])} {_f(c1[1])} {_f(c2[0])} {_f(c2[1])} {_f(p2[0])} {_f(p2[1])}')
    return ' '.join(d)

def m_wave(x0, x1, ybase, amp, s):
    w = x1 - x0
    pts = [(x0, ybase), (x0 + w*.12, ybase), (x0 + w*.30, ybase - amp), (x0 + w*.50, ybase - amp*.35),
           (x0 + w*.70, ybase - amp), (x0 + w*.88, ybase), (x1, ybase)]
    return _catmull([(x*s, y*s) for x, y in pts])

def company(master, mid_suffix=''):
    vb = VB[master]; s = vb / 64
    if master == 'micro':
        return ('<path d="M2 7 a6 6 0 0 1 12 0 Z"/><rect x="2" y="7" width="12" height="2"/>'
                '<rect x="3" y="10.5" width="10" height="1.5"/><rect x="4.5" y="13.5" width="7" height="1"/>'), vb
    cx, cy, r = 32, (24 if master == 'appicon' else 26), 20
    dome = f'<path d="M{_f((cx-r)*s)} {_f(cy*s)} a{_f(r*s)} {_f(r*s)} 0 0 1 {_f(2*r*s)} 0 Z"/>'
    ths = [4.6, 3.4, 2.5, 1.8, 1.3]; gaps = [2.0, 2.4, 2.8, 3.2]
    if master == 'standard': ths, gaps = [4.8, 3.5, 2.5, 1.8], [2.2, 2.6, 3.0]
    y = cy; out = [dome]
    for i, t in enumerate(ths):
        dy = y + t / 2 - cy
        half = math.sqrt(max(r*r - dy*dy, 1)) if dy < r else 3
        out.append(f'<rect x="{_f((cx-half)*s)}" y="{_f(y*s)}" width="{_f(2*half*s)}" height="{_f(t*s)}"/>')
        if i < len(gaps): y += t + gaps[i]
    sw = {'display': 3.4, 'standard': 2.0, 'appicon': 5.6}[master]
    cut = f'<path d="{m_wave(cx-11, cx+11, cy-4.5, 6.5, s)}" fill="none" stroke="#000" stroke-width="{_f(sw)}" stroke-linecap="round" stroke-linejoin="round"/>'
    mid = f'ms-m-{master}{mid_suffix}'
    return f'<mask id="{mid}"><rect width="{vb}" height="{vb}" fill="#fff"/>{cut}</mask><g mask="url(#{mid})">{"".join(out)}</g>', vb

def _arm(cx, cy, th, r0, L, curve, s):
    x0, y0 = cx + r0*math.cos(th), cy + r0*math.sin(th); x1, y1 = cx + (r0+L)*math.cos(th), cy + (r0+L)*math.sin(th)
    mx, my = cx + (r0 + L*.55)*math.cos(th), cy + (r0 + L*.55)*math.sin(th)
    k = curve * L * .5; tx, ty = -math.sin(th), math.cos(th)
    return f'M{_f(x0*s)} {_f(y0*s)} Q{_f((mx+tx*k)*s)} {_f((my+ty*k)*s)} {_f(x1*s)} {_f(y1*s)}'

def pianotuner(master, **_):
    vb = VB[master]; s = vb / 64
    curve = {'display': .38, 'standard': .34, 'micro': .26, 'appicon': .38}[master]
    L = {'display': 23, 'standard': 23, 'micro': 22, 'appicon': 23}[master]
    w = {'display': 4.4, 'standard': 2.6, 'micro': 2.0, 'appicon': 7.4}[master]
    r0 = {'display': 6.5, 'standard': 6.5, 'micro': 5.5, 'appicon': 6.5}[master]
    arms = ''.join(f'<path d="{_arm(32, 32, -math.pi/2 + 2*math.pi*i/7, r0, L, curve, s)}"/>' for i in range(7))
    return f'<g fill="none" stroke="currentColor" stroke-width="{_f(w)}" stroke-linecap="round">{arms}</g>', vb

def somnil(master, **_):
    vb = VB[master]; s = vb / 64
    if master == 'micro': return '<path d="M9 2 a6 6 0 1 0 5 9 a4.5 4.5 0 0 1 -5 -9 Z"/>', vb
    R, r, cx, cy = 20, 15.5, 32, 32
    d = (f'M{_f(cx*s)} {_f((cy-R)*s)} a{_f(R*s)} {_f(R*s)} 0 1 0 0.01 0 Z M{_f((cx+7)*s)} {_f((cy-r-2)*s)} a{_f(r*s)} {_f(r*s)} 0 1 0 0.01 0 Z')
    return f'<path fill-rule="evenodd" d="{d}"/>', vb

MARKS = {'company': company, 'pianotuner': pianotuner, 'somnil': somnil}
ACC = {'company': TEAL, 'pianotuner': TEAL, 'somnil': VIOLET}
ACCD = {'company': TEALD, 'pianotuner': TEALD, 'somnil': VIOLET}
COVER = {'company': .56, 'pianotuner': .56, 'somnil': .50}

def svg(product, master, color='currentColor', size=None, mid_suffix=''):
    frag, vb = MARKS[product](master, mid_suffix=mid_suffix)
    sz = f' width="{size}" height="{size}"' if size else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb} {vb}"{sz}><g fill="{color}" color="{color}">{frag}</g></svg>'

def favicon_svg(product):
    """External favicon: fixed brand colour with prefers-color-scheme (an external SVG never inherits page currentColor)."""
    frag, vb = MARKS[product]('standard', mid_suffix='-fav')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb} {vb}"><style>.m{{fill:{ACC[product]};color:{ACC[product]}}}'
            f'@media(prefers-color-scheme:dark){{.m{{fill:{ACCD[product]};color:{ACCD[product]}}}}}</style><g class="m">{frag}</g></svg>')

def icon(product, bg, fg, size=1024, transparent=False):
    frag, vb = MARKS[product]('appicon', mid_suffix='-ic')
    sc = size * COVER[product] / vb; off = (size - vb*sc) / 2
    bgrect = '' if transparent else f'<rect width="{size}" height="{size}" fill="{bg}"/>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">{bgrect}'
            f'<g transform="translate({_f(off)} {_f(off)}) scale({_f(sc)})" fill="{fg}" color="{fg}">{frag}</g></svg>')

# ---------------------------------------------------------------- wordmarks (fontTools, frozen instances)
_fc = {}
def font(which):
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
    if which in _fc: return _fc[which]
    if which.startswith('inter'):
        w = int(which.split('-')[1]); f = instancer.instantiateVariableFont(TTFont(INTER), {'opsz': 32, 'wght': w}, inplace=False)
    else:
        f = instancer.instantiateVariableFont(TTFont(NOTO), {'wght': 400}, inplace=False)
    _fc[which] = f; return f

def text_paths(text, which, size, x, y, tracking):
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    f = font(which); gs = f.getGlyphSet(); cmap = f.getBestCmap(); sc = size / f['head'].unitsPerEm
    kern = {}
    try:
        for lookup in f['GPOS'].table.LookupList.Lookup:
            for st in lookup.SubTable:
                if getattr(st, 'Format', None) == 1 and hasattr(st, 'PairSet'):
                    for first, ps in zip(st.Coverage.glyphs, st.PairSet):
                        for pvr in ps.PairValueRecord:
                            v = getattr(pvr.Value1, 'XAdvance', 0) if pvr.Value1 else 0
                            if v: kern[(first, pvr.SecondGlyph)] = v
    except Exception: pass
    names = [cmap[ord(c)] for c in text]; out = []; px = x
    for i, g in enumerate(names):
        p = SVGPathPen(gs); gs[g].draw(TransformPen(p, (sc, 0, 0, -sc, px, y))); d = p.getCommands()
        if d: out.append(d)
        adv = f['hmtx'][g][0] * sc
        if i + 1 < len(names): adv += kern.get((g, names[i+1]), 0) * sc
        px += adv + tracking * size
    return out, px - x

def word(product, color, size, x, y):
    spec = {'company': [('Mel', 'inter-300'), ('Spectrum', 'inter-500')], 'pianotuner': [('Piano', 'inter-300'), ('Tuner', 'inter-500')], 'somnil': [('Somnil', 'inter-400')]}[product]
    paths = []; px = x
    for txt, wf in spec:
        ps, adv = text_paths(txt, wf, size, px, y, -0.02); paths += ps; px += adv
    return f'<g fill="{color}">' + ''.join(f'<path d="{d}"/>' for d in paths) + '</g>', px - x

def lockup(product, color, sub_color, bilingual=True):
    H, base, ms, gap, size = 56, 40, 44, 14, 36
    frag, vb = MARKS[product]('standard', mid_suffix='-lk')
    parts = [f'<g fill="{color}" color="{color}" transform="translate(0 {(H-ms)/2}) scale({_f(ms/vb)})">{frag}</g>']
    x = ms + gap; w, adv = word(product, color, size, x, base); parts.append(w); x += adv
    if product == 'company' and bilingual:
        x += 14; zp, zadv = text_paths('融谱智能', 'noto', size * .66, x, base - 1, .04)
        parts.append(f'<g fill="{sub_color}">' + ''.join(f'<path d="{d}"/>' for d in zp) + '</g>'); x += zadv
    W = x + 2
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_f(W)} {H}" width="{_f(W)}" height="{H}">' + ''.join(parts) + '</svg>'

def text_svg(text, which, color, size, tracking=0.0):
    ps, adv = text_paths(text, which, size, 0, size * .95, tracking); W, H = adv + 2, size * 1.3
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {_f(W)} {_f(H)}" width="{_f(W)}" height="{_f(H)}"><g fill="{color}">' + ''.join(f'<path d="{d}"/>' for d in ps) + '</g></svg>'

# ---------------------------------------------------------------- raster
def uri(s): return 'data:image/svg+xml;base64,' + base64.b64encode(s.encode()).decode()

def chrome(html, w, h, out, transparent=True):
    p = out + '.html'; open(p, 'w').write(html)
    args = [CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', f'--window-size={w},{h}', f'--screenshot={out}', 'file://' + p]
    if transparent: args.insert(-1, '--default-background-color=00000000')
    subprocess.run(args, capture_output=True, check=True); os.remove(p)

def raster_svg(svgtxt, size, out, transparent=True):
    chrome(f'<html><body style="margin:0;background:transparent"><img src="{uri(svgtxt)}" width="{size}" height="{size}"></body></html>', size, size, out, transparent)

def og_html(product):
    W, H = 1200, 630
    if product == 'company':
        mk = svg('company', 'display', TEALD); bg = BLACK
        title = f'<div style="display:flex;align-items:flex-end;gap:26px"><img src="{uri(text_svg("Mel","inter-300","#FAFAFA",84))}" height="110" style="margin-right:-30px"><img src="{uri(text_svg("Spectrum","inter-500","#FAFAFA",84))}" height="110"><img src="{uri(text_svg("融谱智能科技","noto",SILVER,44,.04))}" height="58" style="margin-bottom:12px"></div>'
        tag, en = text_svg('让机器听懂声音', 'noto', '#FAFAFA', 40, .02), text_svg('Teach machines to listen', 'inter-400', ASH, 30)
    else:
        mk = svg('somnil', 'display', VIOLET); bg = '#0B0F1A'
        title = f'<div style="display:flex;align-items:flex-end;gap:26px"><img src="{uri(text_svg("Somnil","inter-400","#FAFAFA",84))}" height="110"><img src="{uri(text_svg("睡眠环境预防干预","noto",SILVER,44,.04))}" height="58" style="margin-bottom:12px"></div>'
        tag, en = text_svg('在你意识到之前，一切已经调好', 'noto', '#FAFAFA', 40, .02), text_svg('Preventive sleep environment', 'inter-400', ASH, 30)
    return (f'<html><body style="margin:0"><div style="width:{W}px;height:{H}px;background:{bg};position:relative;box-sizing:border-box;padding:70px 90px">'
            f'<img src="{uri(mk)}" width="150" height="150" style="position:absolute;right:110px;top:100px"><div style="margin-top:40px">{title}</div>'
            f'<div style="position:absolute;left:90px;bottom:90px"><img src="{uri(tag)}" height="52"><div style="height:14px"></div><img src="{uri(en)}" height="40"></div>'
            f'<div style="position:absolute;left:90px;right:90px;bottom:200px;border-top:1px dashed #414141"></div></div></body></html>')

# ---------------------------------------------------------------- validation
def validate(path, kind):
    im = Image.open(path); w, h = im.size; info = {'size': [w, h], 'mode': im.mode}
    if kind == 'ios-default':
        assert (w, h) == (1024, 1024); im = im.convert('RGBA'); a = im.getchannel('A').getextrema(); assert a == (255, 255), f'default icon must be opaque: {a}'
        Image.open(path).convert('RGB').save(path); info['mode'] = 'RGB'
    elif kind == 'ios-dark':
        assert (w, h) == (1024, 1024); a = im.convert('RGBA').getchannel('A').getextrema(); assert a[0] < 255, 'dark icon needs transparency'
        assert im.convert('RGBA').getpixel((2, 2))[3] == 0, 'dark icon background must be transparent'
    elif kind == 'ios-tinted':
        assert (w, h) == (1024, 1024); px = im.convert('RGBA'); 
        mx = 0
        for x in range(0, 1024, 7):
            for y in range(0, 1024, 7):
                r, g, b, a = px.getpixel((x, y))
                if a: mx = max(mx, abs(r-g), abs(g-b), abs(r-b))
        assert mx <= 1, f'tinted icon must be grayscale (max channel diff {mx})'
    elif kind == 'opaque':
        a = im.convert('RGBA').getchannel('A').getextrema(); assert a == (255, 255), f'{path} must be opaque'
        Image.open(path).convert('RGB').save(path); info['mode'] = 'RGB'
    return info

# ---------------------------------------------------------------- main
def main():
    os.makedirs(DIST, exist_ok=True); os.makedirs(SVGDIR, exist_ok=True)
    arts = []
    def add(path, master, role, target, kind=None, source=None):
        b = open(path, 'rb').read(); info = validate(path, kind) if kind and path.endswith('.png') else {}
        e = {'path': os.path.relpath(path, HERE), 'sha256': sha(b), 'bytes': len(b), 'artworkMaster': master, 'role': role, 'target': target}
        e.update(info)
        if source: e['source'] = source
        arts.append(e); return e
    # 1. SVG masters (currentColor) + lockups
    for p in MARKS:
        for m in VB:
            fp = os.path.join(SVGDIR, f'{p}-{m}.svg'); open(fp, 'w').write(svg(p, m)); add(fp, m, 'master', 'canonical')
        fp = os.path.join(SVGDIR, f'{p}-mono-black.svg'); open(fp, 'w').write(svg(p, 'display', BLACK)); add(fp, 'display', 'master-mono', 'canonical')
        fp = os.path.join(SVGDIR, f'{p}-mono-white.svg'); open(fp, 'w').write(svg(p, 'display', WHITE)); add(fp, 'display', 'master-mono', 'canonical')
        for nm, col, sub in (('light', BLACK, ASH), ('dark', WHITE, SILVER)):
            fp = os.path.join(SVGDIR, f'lockup-{p}-{nm}.svg'); open(fp, 'w').write(lockup(p, col, sub)); add(fp, 'standard', 'lockup', 'canonical')
    fp = os.path.join(SVGDIR, 'lockup-company-en-light.svg'); open(fp, 'w').write(lockup('company', BLACK, ASH, bilingual=False)); add(fp, 'standard', 'lockup', 'canonical')
    # 2. iOS app icon (three appearances) — appicon master, T1 treatment
    d = os.path.join(DIST, 'ios'); os.makedirs(d, exist_ok=True)
    raster_svg(icon('pianotuner', TEAL, WHITE), 1024, f'{d}/appicon-default-1024.png', transparent=False); add(f'{d}/appicon-default-1024.png', 'appicon', 'canonical', 'pianotuner-app:Assets.xcassets/AppIcon.appiconset/icon_1024.png', 'ios-default')
    raster_svg(icon('pianotuner', '', TEALD, transparent=True), 1024, f'{d}/appicon-dark-1024.png'); add(f'{d}/appicon-dark-1024.png', 'appicon', 'canonical', 'pianotuner-app:Assets.xcassets/AppIcon.appiconset/icon_1024 1.png', 'ios-dark')
    raster_svg(icon('pianotuner', '', '#E6E6E6', transparent=True), 1024, f'{d}/appicon-tinted-1024.png'); add(f'{d}/appicon-tinted-1024.png', 'appicon', 'canonical', 'pianotuner-app:Assets.xcassets/AppIcon.appiconset/icon_1024 2.png', 'ios-tinted')
    # 3. pianotuner.top
    d = os.path.join(DIST, 'pianotuner-site'); os.makedirs(d, exist_ok=True)
    open(f'{d}/favicon-brand-202609.svg', 'w').write(favicon_svg('pianotuner')); add(f'{d}/favicon-brand-202609.svg', 'standard', 'canonical', 'pianotuner-site:app/public/favicon-brand-202609.svg')
    open(f'{d}/favicon.svg', 'w').write(favicon_svg('pianotuner')); add(f'{d}/favicon.svg', 'standard', 'compatibility-alias', 'pianotuner-site:app/public/favicon.svg', source='favicon-brand-202609.svg')
    raster_svg(icon('pianotuner', TEAL, WHITE, 180), 180, f'{d}/apple-touch-icon-202609.png', transparent=False); add(f'{d}/apple-touch-icon-202609.png', 'appicon', 'canonical', 'pianotuner-site:app/public/apple-touch-icon-202609.png', 'opaque')
    # 4. melspectrum.com
    d = os.path.join(DIST, 'melspectrum-website'); os.makedirs(d, exist_ok=True)
    open(f'{d}/favicon-brand-202609.svg', 'w').write(favicon_svg('company')); add(f'{d}/favicon-brand-202609.svg', 'standard', 'canonical', 'melspectrum-website:app/public/images/favicon-brand-202609.svg')
    raster_svg(svg('company', 'standard', TEAL), 32, f'{d}/favicon-32-202609.png'); add(f'{d}/favicon-32-202609.png', 'standard', 'canonical', 'melspectrum-website:app/public/images/favicon-32-202609.png')
    raster_svg(svg('company', 'micro', TEAL), 16, f'{d}/favicon-16-202609.png'); add(f'{d}/favicon-16-202609.png', 'micro', 'canonical', 'melspectrum-website:app/public/images/favicon-16-202609.png')
    raster_svg(icon('company', BLACK, TEALD, 180), 180, f'{d}/apple-touch-icon-202609.png', transparent=False); add(f'{d}/apple-touch-icon-202609.png', 'appicon', 'canonical', 'melspectrum-website:app/public/images/apple-touch-icon-202609.png', 'opaque')
    raster_svg(icon('company', BLACK, TEALD, 512), 512, f'{d}/logo-202609.png', transparent=False); add(f'{d}/logo-202609.png', 'appicon', 'canonical', 'melspectrum-website:app/public/images/logo-202609.png (JSON-LD Organization.logo)', 'opaque')
    chrome(og_html('company'), 1200, 630, f'{d}/og-brand-202609.png', transparent=False); add(f'{d}/og-brand-202609.png', 'display', 'canonical', 'melspectrum-website:app/public/images/og-brand-202609.png', 'opaque')
    # 5. somnil.top
    d = os.path.join(DIST, 'somnil-website'); os.makedirs(d, exist_ok=True)
    open(f'{d}/favicon-brand-202609.svg', 'w').write(favicon_svg('somnil')); add(f'{d}/favicon-brand-202609.svg', 'standard', 'canonical', 'somnil-website:favicon-brand-202609.svg')
    raster_svg(icon('somnil', VIOLET, WHITE, 180), 180, f'{d}/apple-touch-icon-202609.png', transparent=False); add(f'{d}/apple-touch-icon-202609.png', 'appicon', 'canonical', 'somnil-website:apple-touch-icon-202609.png', 'opaque')
    chrome(og_html('somnil'), 1200, 630, f'{d}/og-brand-202609.png', transparent=False); add(f'{d}/og-brand-202609.png', 'display', 'canonical', 'somnil-website:og-brand-202609.png', 'opaque')
    # 6. release package extras (favicon rasters at common sizes, for the Desktop package)
    d = os.path.join(DIST, 'package'); os.makedirs(d, exist_ok=True)
    for p in MARKS:
        for sz, m in ((16, 'micro'), (32, 'standard'), (64, 'display'), (512, 'display')):
            raster_svg(svg(p, m, ACC[p]), sz, f'{d}/{p}-{sz}.png'); add(f'{d}/{p}-{sz}.png', m, 'package', 'release-package')
    # 7. inline nav SVG snippets (currentColor) for the React/HTML sites
    d = os.path.join(DIST, 'inline'); os.makedirs(d, exist_ok=True)
    for p in MARKS:
        frag, vb = MARKS[p]('standard', mid_suffix='-nav')
        open(f'{d}/{p}-nav.svg', 'w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb} {vb}" width="20" height="20" aria-hidden="true" focusable="false"><g fill="currentColor" color="currentColor">{frag}</g></svg>')
        add(f'{d}/{p}-nav.svg', 'standard', 'inline-snippet', 'nav (inline, currentColor, aria-hidden)')
    # ---- manifest
    inputs = {'brand.json': sha(open(os.path.join(HERE, 'brand.json'), 'rb').read()), 'generate.py': sha(open(__file__, 'rb').read()),
              'fonts/Inter.ttf': sha(open(INTER, 'rb').read()), 'fonts/NotoSansSC.ttf': sha(open(NOTO, 'rb').read())}
    for fn in sorted(os.listdir(SVGDIR)): inputs[f'svg/{fn}'] = sha(open(os.path.join(SVGDIR, fn), 'rb').read())
    instances = BRAND['wordmark']
    digest = sha(json.dumps({'inputs': inputs, 'instances': instances}, sort_keys=True).encode())
    try: parent = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=HERE, capture_output=True, text=True).stdout.strip()
    except Exception: parent = None
    chrome_v = subprocess.run([CHROME, '--version'], capture_output=True, text=True).stdout.strip()
    import PIL, fontTools
    manifest = {'brandVersion': BRAND['brandVersion'], 'generatedAt': __import__('datetime').datetime.now().isoformat(timespec='seconds'),
                'sourceParentCommit': parent, 'sourceTreeDigest': digest,
                'generator': {'chrome': chrome_v, 'python': platform.python_version(), 'pillow': PIL.__version__, 'fonttools': fontTools.version, 'os': platform.platform()},
                'fontInstances': instances, 'inputHashes': inputs, 'artifacts': arts}
    json.dump(manifest, open(os.path.join(HERE, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
    print(f'{len(arts)} artifacts, digest {digest[:12]}, parent {parent and parent[:8]}')

if __name__ == '__main__':
    main()
