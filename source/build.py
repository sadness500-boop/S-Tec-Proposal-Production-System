# S-Tec Proposal Production System (에스텍 제안서 제작시스템) — 한 파일 index.html 빌드
# 사용법: python3 source/build.py [출력경로]   (저장소 최상위에서 실행)
# Designed & Developed by Rat Rae Choi
import base64, json, os, sys
S = os.path.dirname(os.path.abspath(__file__)) + '/'
V = S + 'vendor/'
def rd(p): return open(p, encoding='utf-8').read()
def scr(s): return s.replace('</script', '<\\/script')
def uri(p, mime): return f'data:{mime};base64,' + base64.b64encode(open(p, 'rb').read()).decode()
asset = json.loads(rd(V + 'assets-base.json'))
asset['icon'] = uri(V + 'icon.png', 'image/png')       # 메인화면 좌측 상단 아이콘 · 앱 아이콘 (사진 2)
asset['voc'] = asset['icon']                            # 표지 로고 = 앱 아이콘
asset['hero'] = uri(V + 'hero.jpg', 'image/jpeg')       # 메인화면 디오라마 (사진 1) · 제안서 표지
asset['apps'] = {f[:-4]: uri(V + 'apps/' + f, 'image/png') for f in sorted(os.listdir(V + 'apps')) if f.endswith('.png')}
html = rd(S + 'index.html')
APPJS = '\n'.join(rd(S + f) for f in ['link.js', 'rfp.js', 'xlsest.js', 'ui.js', 'app.js', 'engine.js', 'media.js', 'deck.js', 'out.js'])
for ph, val in [('<!--LIBS-->', rd(V + 'libs.html')), ('<!--QR-->', rd(V + 'qr.html')),
                ('/*ASSETS*/', 'const ASSET=' + json.dumps(asset, ensure_ascii=False) + ';'),
                ('/*HF*/', scr(rd(S + 'hf.js'))), ('/*SITES*/', scr(rd(S + 'sites.js'))), ('/*KB*/', scr(rd(S + 'kb.js'))),
                ('/*APP*/', scr(APPJS)), ('<!--AUTHCSS-->', rd(V + 'auth-css.html')),
                ('/*SUPABASE*/', rd(V + 'supabase.js')), ('/*AUTH*/', rd(V + 'auth.js')), ('/*APPACCESS*/', scr(rd(S + 'app-access.js')))]:
    assert html.count(ph) == 1, ph
    html = html.replace(ph, val)
out = sys.argv[1] if len(sys.argv) > 1 else S + '../index.html'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8').write(html); print(out, len(html) // 1024, 'KB')
