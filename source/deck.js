/* =====================================================================
 * 제안 발표자료(PPT·PDF) v2.0 — 레퍼런스 제안서 수준의 세부 구성
 * PART 1 에스텍 소개 · PART 2 현황 분석 · PART 3 운영 제안 · PART 4 가격 제안 · PART 5 약속
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const PARTS = [
  { n: 1, t: '에스텍 소개', en: 'Company', scene: 'v13', items: ['회사 개요·핵심 지표', '연혁', '사업 영역·운영 네트워크', '핵심 역량·경쟁력 비교'] },
  { n: 2, t: '현황 분석', en: 'Analysis', scene: 'v07', items: ['2026 환경 트렌드', '현장 이해·포지셔닝', '리스크 진단·개선 방향', '요구사항 대응'] },
  { n: 3, t: '운영 제안', en: 'Operation Plan', scene: 'v05', items: ['운영 전략·에스텍 특화서비스', '조직·인력·POST 운영', '업무 수행·교육·안전', '품질·스마트 운영·개시 계획'] },
  { n: 4, t: '가격 제안', en: 'Price', scene: 'v17', items: ['제안 금액', '견적 산출 근거', '업무별 비용', '가격 조건'] },
  { n: 5, t: '에스텍의 약속', en: 'Promise', scene: 'v16', items: ['기대효과', '고객 약속(SLA)', '맺음말'] }
];
const NV = '0B1F8A', NVD = '071463', GR = '1B7A34', GR2 = '22A04A', OR = 'E8750A', INK = '0F1530', MU = '4A5372', LN = 'E4E8F1', SOFT = 'F4F6FB';

/* ---------- 공통 프레임 ---------- */
function frameX(p, part, title, sub, no) {
  const E = [];
  E.push(Rc(0, 0, SW, SH, C.white));
  E.push(Rc(0, 0, SW, 0.06, NV)); E.push(Rc(0, 0, 2.2, 0.06, GR));
  if (part) { E.push(Rc(0.6, 0.34, 0.08, 0.36, GR)); E.push(T(0.78, 0.3, 6, 0.24, `PART ${part.n}  ·  ${part.t.toUpperCase()}`, { pt: 9.5, bold: true, color: GR })); }
  E.push(T(0.78, part ? 0.52 : 0.36, 10, 0.6, [{ text: title, bold: true }], { max: 25, min: 17, color: INK, valign: 'middle' }));
  if (sub) E.push(T(0.78, part ? 1.1 : 0.96, 10.4, 0.3, sub, { pt: 11, color: MU }));
  E.push(Im(SW - 1.85, 0.36, 1.3, 1.3 * 340 / 900, ASSET.logo));
  E.push(Rc(0.6, SH - 0.42, SW - 1.2, 0.01, LN));
  E.push(T(0.6, SH - 0.38, 8, 0.28, `${CO.group} · ${p.f.client} ${p.pt.title}`, { pt: 8.5, color: '9AA2B5', valign: 'middle' }));
  E.push(T(SW - 1.6, SH - 0.38, 1.0, 0.28, String(no).padStart(2, '0'), { pt: 10, bold: true, color: NV, align: 'right', valign: 'middle' }));
  return E;
}
function box(x, y, w, h, fill = SOFT, line) { return Rc(x, y, w, h, fill, { line }); }
function chip(x, y, w, text, col = NV, o = {}) { return [Rc(x, y, w, o.h || 0.32, col, { k: o.k || 'rect' }), T(x, y, w, o.h || 0.32, text, { pt: o.pt || 10, bold: true, color: C.white, align: 'center', valign: 'middle' })]; }
function card(E, x, y, w, h, head, body, o = {}) {
  E.push(Rc(x, y, w, h, o.fill || C.white, { line: o.line || LN })); E.push(Rc(x, y, w, 0.06, o.col || NV));
  let yy = y + 0.16;
  if (o.ic) { E.push(T(x + 0.18, yy, 0.6, 0.5, o.ic, { pt: o.icPt || 20 })); }
  E.push(T(x + (o.ic ? 0.78 : 0.18), yy, w - (o.ic ? 0.96 : 0.36), 0.5, [{ text: head, bold: true }], { max: o.hPt || 14, min: 9.5, color: o.hcol || INK, valign: 'middle' }));
  E.push(T(x + 0.18, yy + 0.58, w - 0.36, h - 0.86, typeof body === 'string' ? [{ text: body }] : body, { max: o.bPt || 11.5, min: 7.5, color: o.bcol || '3A4366', lh: 1.3 }));
}
function bulletsT(groups, max = 15) { return listParas(groups); }
function divider(p, part, no) {
  const E = [], sc = M(part.scene, 'team_dio');
  E.push(Rc(0, 0, SW, SH, NVD));
  E.push(Photo(0, 0, SW, SH, sc));
  E.push(Im(0, 0, SW, SH, veil('h', 0.94, 0.12)));
  E.push(T(0.9, 1.5, 6, 0.5, `PART ${part.n}`, { pt: 20, bold: true, color: '9FE3B0' }));
  E.push(T(0.9, 2.05, 7.5, 1.0, [{ text: part.t, bold: true }], { pt: 44, color: C.white }));
  E.push(T(0.9, 3.05, 6, 0.4, part.en, { pt: 16, color: 'B9C3EC' }));
  E.push(Rc(0.9, 3.6, 0.9, 0.05, GR2));
  part.items.forEach((t, i) => E.push(T(0.9, 3.85 + i * 0.42, 6.5, 0.38, `${String(i + 1).padStart(2, '0')}   ${t}`, { pt: 14, color: 'E6EAF8' })));
  E.push(T(SW - 1.5, SH - 0.5, 1, 0.3, String(no).padStart(2, '0'), { pt: 10, bold: true, color: 'B9C3EC', align: 'right' }));
  return E;
}
function staffBy(p) { const m = {}; p.staff.forEach(r => { const k = r.job || '기타'; m[k] = (m[k] || 0) + (+r.count || 0); }); return m; }
function shiftPattern(text) {
  const t = String(text || '');
  if (/4조\s*2교대/.test(t)) return { n: '4조 2교대', teams: 4, cyc: ['주', '주', '야', '야', '비', '비', '휴', '휴'] };
  if (/3조\s*2교대/.test(t)) return { n: '3조 2교대', teams: 3, cyc: ['주', '야', '비'] };
  if (/격일/.test(t)) return { n: '격일제(24시간 교대)', teams: 2, cyc: ['근', '비'] };
  if (/2조\s*2교대/.test(t)) return { n: '2조 2교대', teams: 2, cyc: ['주', '야'] };
  return null;
}

let CUR_PART = null;
function buildSlides(p) {
  CUR_PART = null;
  const f = p.f, S = [], m = p.money, on = id => p.secOn[id], N = () => S.length + 1, push = (e, fig) => { if (fig) e.fig = fig; S.push(e); return e; };
  const P = n => PARTS[n - 1], mg = UI.manager || {};
  const jobMain = p.jobs[0], MM = MEDIA_MAP[jobMain.k] || MEDIA_MAP.sec;

  /* 01 표지 */
  { const E = [];
    E.push(Rc(0, 0, SW, SH, C.white));
    E.push(Photo(5.6, 0, SW - 5.6, SH, { src: ASSET.hero, w: 1280, h: 720 }, null, 0.45));
    E.push(Im(5.6, 0, 2.6, SH, gradient(400, 20, [[0, 'rgba(255,255,255,1)'], [1, 'rgba(255,255,255,0)']], 'h')));
    E.push(Rc(0, 0, 0.14, SH, NV)); E.push(Rc(0.14, 0, 0.06, SH, GR));
    E.push(Im(0.8, 0.6, 1.25, 1.25, ASSET.icon));
    E.push(T(0.8, 2.1, 5.2, 0.35, `${CO.group}  ·  ${p.pt.n}`, { pt: 12, bold: true, color: GR }));
    E.push(T(0.8, 2.5, 5.4, 1.7, [{ text: p.title, bold: true }], { max: 34, min: 20, color: INK, lh: 1.12 }));
    E.push(Rc(0.8, 4.35, 0.8, 0.05, GR));
    E.push(T(0.8, 4.5, 5.2, 0.9, [{ text: `${f.client}${f.site ? ' · ' + f.site : ''}`, bold: true, color: '2C3554' }, { text: `${p.jobs.map(j => j.n).join(' · ')}${p.ind ? '   |   ' + p.ind.n : ''}`, size: 0.82, color: MU }], { max: 16, min: 10, gap: 4 }));
    E.push(T(0.8, 5.65, 5.2, 0.5, [{ text: `${fmtD(parseD(f.date) || p.made)}`, bold: true, color: INK }, { text: `${CO.branch || CO.name}${f.author ? '  ' + f.author : ''}${mg.phone ? '  ·  ' + mg.phone : ''}`, size: 0.85, color: MU }], { pt: 11.5, gap: 2 }));
    if (f.mode !== 'client') { E.push(...chip(0.8, 6.45, 1.6, '내부 검토용', C.brick)); }
    E.push(sigEl(SW - 4.3, SH - 0.6, 0.38));
    push(E); }
  /* 02 오프닝 메시지 */
  { const E = [], sc = M((MEDIA_MAP[jobMain.k] || MEDIA_MAP.sec).scene[0]);
    E.push(Rc(0, 0, SW, SH, '05070F')); E.push(Photo(0, 0, SW, SH, sc)); E.push(Im(0, 0, SW, SH, veil('v', 0.15, 0.92, '5,7,15')));
    E.push(T(1, 4.25, SW - 2, 0.7, [{ text: '우리는 수많은 위험 속에서 살고 있습니다', bold: true }], { pt: 30, color: C.white, align: 'center' }));
    E.push(T(1, 5.0, SW - 2, 0.9, [{ text: `안전·청결·편의 — 고객이 의식하지 못하는 일상을 지키는 일.`, color: 'D6DCF0' }, { text: `${CO.group}이 ${f.client}의 일상을 책임지겠습니다.`, color: '9FE3B0', bold: true }], { pt: 16, align: 'center', gap: 4 }));
    push(E); }
  /* 03 인사말 */
  { const E = frameX(p, null, '인사말', 'Greeting', N()), mgp = M(MEDIA_EXTRA.mgr, 'mgr');
    E.push(Rc(0.6, 1.55, 3.6, 4.9, SOFT)); E.push(PhotoFit(0.7, 1.65, 3.4, 4.2, mgp));
    E.push(T(0.6, 5.95, 3.6, 0.45, [{ text: `${mg.title || ''} ${mg.name || f.author || ''}`.trim() || CO.branch, bold: true }], { pt: 13, color: INK, align: 'center' }));
    const g0 = G(p, 's00');
    E.push(T(4.6, 1.6, 8.1, 4.6, g0.flatMap(g => g.lines).map((t, i) => ({ text: t, gap: 7, bold: i === 0, color: i === 0 ? NV : '2C3554' })), { max: 15, min: 10.5, lh: 1.45 }));
    E.push(sigEl(SW - 4.6, 6.3, 0.42));
    push(E, 's00'); }
  /* 04 목차 */
  { const E = frameX(p, null, 'Contents', '목차', N());
    E.push(Photo(0.6, 1.55, 4.3, 5.0, M(MEDIA_EXTRA.diorama, 'team_dio')));
    PARTS.forEach((pt, i) => { const y = 1.6 + i * 0.98; E.push(T(5.3, y, 1.2, 0.8, `0${pt.n}`, { pt: 34, bold: true, color: i % 2 ? GR : NV }));
      E.push(T(6.55, y + 0.05, 6, 0.4, [{ text: pt.t, bold: true }], { pt: 17, color: INK })); E.push(T(6.55, y + 0.45, 6.2, 0.35, pt.items.join('  ·  '), { pt: 10.5, color: MU })); E.push(Rc(6.55, y + 0.86, 6.1, 0.01, LN)); });
    push(E); }
  /* 05 제안 요약 */
  { const E = frameX(p, null, '제안 요약', `${f.client} · ${p.pt.n}`, N());
    const cards = [['🏢', '대상', `${f.client}${f.site ? '\n' + f.site : ''}`, p.ind ? p.ind.n : ''], ['👥', '직종·인원', p.jobs.map(j => j.short).join('·'), p.heads ? `총 ${p.heads}명` : '실사 후 확정'], ['📅', '계약기간', f.from ? `${f.from}\n~ ${f.to}` : `${p.months}개월`, f.from ? `${p.months}개월` : '협의'], ['💰', '제안 금액', m.monthly ? `월 ${won(m.monthly)}원` : m.once ? `${won(m.once)}원` : '견적 연동 후', 'VAT 별도']];
    cards.forEach((c, i) => { const x = 0.6 + i * 3.08; E.push(Rc(x, 1.6, 2.92, 2.1, i % 2 ? 'EEF7F1' : SOFT)); E.push(T(x + 0.2, 1.72, 0.6, 0.5, c[0], { pt: 22 }));
      E.push(T(x + 0.85, 1.78, 1.9, 0.35, c[1], { pt: 12, bold: true, color: i % 2 ? GR : NV })); E.push(T(x + 0.2, 2.35, 2.55, 0.9, c[2], { max: 17, min: 10, bold: true, color: INK })); E.push(T(x + 0.2, 3.25, 2.55, 0.35, c[3], { pt: 10.5, color: MU })); });
    E.push(T(0.6, 3.95, 6, 0.4, '핵심 제안 Point', { pt: 14, bold: true, color: INK }));
    const pts = p.emph.slice(0, 4).map(k => [EMPH[k].ic, EMPH[k].n, EMPH[k].line]);
    pts.forEach((c, i) => card(E, 0.6 + i * 3.08, 4.45, 2.92, 2.2, c[1], c[2], { ic: c[0], col: i % 2 ? GR : NV, hPt: 12.5, bPt: 10.5 }));
    push(E, 's01'); }
  if (on('s01')) { const E = frameX(p, null, '제안 개요', '배경 · 목적 · 범위', N()), g = G(p, 's01');
    E.push(T(0.6, 1.6, 7.6, 5.0, listParas(g), { max: 14, min: 9.5 }));
    E.push(Photo(8.6, 1.6, 4.1, 2.4, M(MM.scene[0]))); E.push(Photo(8.6, 4.15, 2.0, 2.4, M(MM.fig[0]))); E.push(Photo(10.7, 4.15, 2.0, 2.4, M(MEDIA_EXTRA.team, 'team')));
    push(E, 's01'); }

  /* ===== PART 1 ===== */
  if (on('s02')) {
    push(divider(p, P(1), N()));
    /* 회사 개요 · 핵심 지표 */
    { const E = frameX(p, P(1), `${CO.group} 개요`, '고객의 신뢰가 만들어온 성장, 안심과 품질로 보답하겠습니다', N());
      const met = lines(CO.metrics).map(l => l.split('|')).filter(x => x.length >= 2).slice(0, 4);
      const tot = SITES.reduce((a, s) => a + (s.total || 0), 0);
      const all = met.concat([[String(SITES.length), '곳', '에스텍베스트 운영 사업장'], [tot.toLocaleString('ko-KR'), '명', '에스텍베스트 현장 인력']]).slice(0, 6);
      all.forEach((x, i) => { const c = i % 3, r = Math.floor(i / 3), X = 0.6 + c * 2.75, Y = 1.6 + r * 1.75;
        E.push(Rc(X, Y, 2.6, 1.6, r ? 'EEF7F1' : SOFT)); E.push(T(X + 0.15, Y + 0.15, 2.3, 0.75, [{ text: x[0], bold: true }], { max: 30, min: 16, color: r ? GR : NV })); E.push(T(X + 0.15, Y + 0.85, 2.3, 0.3, x[1], { pt: 11.5, bold: true, color: INK })); E.push(T(X + 0.15, Y + 1.15, 2.35, 0.4, x[2] || '', { max: 9.5, min: 7, color: MU })); });
      E.push(T(0.6, 5.2, 8.0, 1.4, CO.intro.map(t => ({ text: '•  ' + t })), { max: 12, min: 8.5, color: '2C3554' }));
      if (CO.metricsNote) E.push(T(0.6, 6.62, 8.2, 0.28, '※ ' + CO.metricsNote, { pt: 9, color: MU }));
      E.push(Photo(9.0, 1.6, 3.7, 3.35, M(MEDIA_EXTRA.hq, 'hq'))); E.push(Photo(9.0, 5.05, 3.7, 1.55, M(MEDIA_EXTRA.cube, 'hq')));
      push(E, 's02'); }
    /* 연혁 */
    { const hs = lines(CO.history); if (hs.length) { const E = frameX(p, P(1), '연혁 — 성장의 발자취', 'History', N());
      E.push(Rc(0.9, 3.55, SW - 1.8, 0.06, NV));
      hs.slice(0, 6).forEach((h, i) => { const n = Math.min(6, hs.length), X = 0.9 + i * ((SW - 1.8) / n), w = (SW - 1.8) / n - 0.15, mt = /^(\d{4}(?:\.\d{1,2})?)\s*(.*)$/.exec(h), yr = mt ? mt[1] : '', tx = mt ? mt[2] : h;
        E.push(Rc(X + 0.05, 3.42, 0.32, 0.32, i % 2 ? GR : NV, { k: 'ellipse' }));
        if (i % 2 === 0) { E.push(T(X, 1.75, w, 0.5, yr || `STEP ${String(i + 1).padStart(2, '0')}`, { pt: yr ? 20 : 15, bold: true, color: NV })); E.push(T(X, 2.25, w, 1.1, tx, { max: 12, min: 8.5, color: '2C3554' })); }
        else { E.push(T(X, 3.95, w, 0.5, yr || `STEP ${String(i + 1).padStart(2, '0')}`, { pt: yr ? 20 : 15, bold: true, color: GR })); E.push(T(X, 4.45, w, 1.2, tx, { max: 12, min: 8.5, color: '2C3554' })); } });
      E.push(Photo(0.6, 5.75, 12.1, 0.8, M('v02'), null, 0.45));
      push(E, 's02'); } }
    /* 사업 영역 */
    { const E = frameX(p, P(1), '사업 영역 — 산업 전 분야 인력 운영', '경비·보안 · 미화 · 주차 · 시설 · 안내 · 조리 · 방역 · 경호 · 특수직군', N());
      const ks = Object.keys(JOBS);
      ks.forEach((k, i) => { const j = JOBS[k], c = i % 5, r = Math.floor(i / 5), X = 0.6 + c * 2.44, Y = 1.55 + r * 2.55, mm = MEDIA_MAP[k] || MEDIA_MAP.sec, act = p.jobs.some(x => x.k === k);
        E.push(Rc(X, Y, 2.32, 2.4, act ? 'EEF7F1' : SOFT, { line: act ? '9FD3AE' : null })); E.push(PhotoFit(X + 0.1, Y + 0.08, 2.12, 1.6, M(mm.fig[0])));
        E.push(T(X + 0.1, Y + 1.72, 2.12, 0.32, `${j.ic} ${j.n}`, { pt: 12, bold: true, color: act ? GR : INK, align: 'center' })); E.push(T(X + 0.1, Y + 2.02, 2.12, 0.34, j.scope[0], { max: 8.5, min: 6.5, color: MU, align: 'center' })); });
      E.push(T(10.4, 4.25, 2.3, 1.4, [{ text: '이번 제안 직종', bold: true, color: GR }, { text: p.jobs.map(j => j.n).join(', '), color: INK }], { max: 12, min: 9 }));
      push(E); }
    /* 운영 네트워크 */
    { const E = frameX(p, P(1), '운영 네트워크 — 현장 가까이 있는 지사', '에스텍베스트 사업장·지사 분포 (사업장 현황 지도 기준)', N());
      const fc = p.site && p.site.lat ? { lat: p.site.lat, lng: p.site.lng, name: p.site.name } : null, mp = networkMap(fc, { w: 900, h: 720 });
      E.push(Rc(0.6, 1.55, 6.3, 5.04, SOFT)); E.push(Im(0.65, 1.6, 6.2, 4.94, mp.src));
      const bc = BRANCHES.map(b => SITES.filter(s => s.br === b.key).length), ch = barChart(BRANCHES.map(b => b.name), bc, { w: 760, h: 380, colors: ['#1E8B3A', '#0B1F8F', '#C2410C', '#6D28D9'], vfmt: v => v + '곳' });
      E.push(T(7.2, 1.55, 5.5, 0.35, '지사별 운영 사업장', { pt: 13, bold: true, color: INK })); E.push(Im(7.2, 1.9, 5.5, 2.75, ch.src));
      const nb = nearBranch(p.site), ns = nearSites(p.site, 4);
      E.push(Rc(7.2, 4.8, 5.5, 1.8, 'EEF7F1')); E.push(T(7.4, 4.9, 5.1, 1.6, nb ? [{ text: `📍 ${p.site.name} — 관할 ${nb.b.name} ${nb.km.toFixed(1)}km`, bold: true, color: GR }, { text: `차량 약 ${Math.max(10, Math.round(nb.km / 40 * 60))}분 거리 · 인근 운영 사업장 ${ns.length}곳`, color: INK }, ...ns.map(x => ({ text: `•  ${x.s.name} (${x.km.toFixed(1)}km · ${x.s.total}명)`, size: 0.85, color: '3A4366' }))]
        : [{ text: '지사 중심의 현장 밀착 관리', bold: true, color: GR }, { text: '관할 지사가 정기 방문·불시 점검을 하고, 인근 사업장 인력으로 결원·비상 상황에 신속히 대응합니다.', color: INK }, { text: '신규 현장은 계약 후 가장 가까운 지사가 전담합니다.', size: 0.9, color: MU }], { max: 12.5, min: 8, gap: 3 }));
      push(E, 's02'); }
    /* 운영 현황 차트 */
    { const E = frameX(p, P(1), '운영 현황 — 숫자로 보는 에스텍베스트', '사업장 유형 · 직종별 인력 구성', N());
      const typ = {}; SITES.forEach(s => typ[s.type || '기타'] = (typ[s.type || '기타'] || 0) + 1);
      const ty = Object.entries(typ).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v], i) => ({ label: k, value: v, color: PAL[i] }));
      const sec = SITES.reduce((a, s) => a + (s.sec || 0), 0), cln = SITES.reduce((a, s) => a + (s.cln || 0), 0), etc = SITES.reduce((a, s) => a + (s.etc || 0), 0);
      const d1 = donut(ty, { center: SITES.length + '곳', sub: '사업장 유형', w: 620, h: 400 }), d2 = donut([{ label: '보안', value: sec, color: '#0B1F8A' }, { label: '미화', value: cln, color: '#1E8B3A' }, { label: '기타 직종', value: etc, color: '#E8750A' }], { center: (sec + cln + etc).toLocaleString() + '명', sub: '직종별 인력', w: 620, h: 400 });
      E.push(Rc(0.6, 1.6, 5.95, 4.2, SOFT)); E.push(Im(0.7, 1.75, 5.75, 3.7, d1.src)); E.push(Rc(6.75, 1.6, 5.95, 4.2, SOFT)); E.push(Im(6.85, 1.75, 5.75, 3.7, d2.src));
      E.push(T(0.6, 5.95, 12.1, 0.6, '공장·공동주택·빌딩·학교·병원·외국공관 등 다양한 현장을 동시에 운영하며 축적한 노하우를 이번 제안에 그대로 적용합니다.', { pt: 12, color: '2C3554' }));
      push(E, 's02'); }
    /* 핵심 역량 */
    { const E = frameX(p, P(1), '에스텍 핵심 역량', 'Why S-Tec', N()), g = G(p, 's02');
      const caps = [['🏢', '그룹 역량', '에스텍시스템 그룹의 교육·법무·품질 지원과 전국 운영 노하우'], ['📍', '현장 밀착 관리', '지사 정기 방문·불시 점검, 인근 사업장 연계 대체 투입'], ['📚', '표준 매뉴얼', '통합매뉴얼 → 직종별 7권 → 직종×산업 84종 → 현장 근무지침'], ['🧭', '통합관리 플랫폼', '근태·현장 지도·견적·Complaint·매뉴얼·법률 대응을 하나의 계정으로'], ['⚖', '법규 준수 체계', '경비업법·근로기준법·파견법 준수, 법률 대응 시스템 운영'], ['🤝', '사람 중심 경영', '평생직장 개념의 인사 운영, 고용승계·근로조건 보호']];
      caps.forEach((c, i) => card(E, 0.6 + (i % 3) * 4.08, 1.6 + Math.floor(i / 3) * 2.5, 3.92, 2.35, c[1], c[2], { ic: c[0], col: i % 2 ? GR : NV }));
      push(E, 's02'); }
    /* 경쟁력 비교 */
    CUR_PART = P(1); tableSlide(S, p, '에스텍 경쟁력 비교', '에스텍 vs 일반 용역사', ['구분', '에스텍', '일반 용역사'], COMPARE, [1.6, 5.4, 4.2], { per: 7, bold: [0, 1] });
    /* 스마트 플랫폼 */
    { const E = frameX(p, P(1), '에스텍 통합관리 시스템', '하나의 계정으로 운영되는 9개 프로그램 — 현장 데이터를 고객사와 공유합니다', N());
      PLATFORM.forEach((x, i) => { const c = i % 3, r = Math.floor(i / 3), X = 0.6 + c * 4.08, Y = 1.6 + r * 1.68;
        E.push(Rc(X, Y, 3.92, 1.52, x.code === 'stpp' ? 'EEF7F1' : SOFT, { line: x.code === 'stpp' ? '9FD3AE' : null })); E.push(Im(X + 0.15, Y + 0.22, 1.05, 1.05, ASSET.apps[x.code] || ASSET.icon));
        E.push(T(X + 1.35, Y + 0.16, 2.45, 0.4, x.ko, { pt: 13, bold: true, color: INK })); E.push(T(X + 1.35, Y + 0.52, 2.45, 0.28, x.n, { max: 8.5, min: 6.5, color: GR, bold: true })); E.push(T(X + 1.35, Y + 0.8, 2.45, 0.66, x.d, { max: 10, min: 7.5, color: MU })); });
      push(E, 's10'); }
  }

  /* ===== PART 2 ===== */
  if (on('s03')) {
    push(divider(p, P(2), N()));
    /* 트렌드 */
    { const E = frameX(p, P(2), '2026 용역 운영 환경 변화', '법·제도·인력·기술 — 고객사가 마주한 7가지 변화', N());
      TRENDS.forEach((t, i) => { const c = i % 4, r = Math.floor(i / 4), X = 0.6 + c * 3.06, Y = 1.55 + r * 2.55, w = 2.92;
        card(E, X, Y, w, 2.42, t.t, t.d, { ic: t.ic, col: [NV, GR, OR, '7A2E8E', '0E7C86', '2A44D4', '1B7A34'][i], hPt: 12, bPt: 9.5 }); });
      E.push(Rc(9.78, 4.1, 2.92, 2.42, NVD)); E.push(T(9.95, 4.25, 2.6, 2.1, [{ text: '에스텍의 해답', bold: true, color: '9FE3B0' }, { text: '법규 준수 체계 + 안전보건관리체계 + 업무량 기반 편성 + 통합관리 플랫폼으로 변화에 먼저 대응합니다.', color: C.white }], { max: 13, min: 9, gap: 5 }));
      push(E, 's03'); }
    /* 현장 이해 */
    { const E = frameX(p, P(2), `${f.client} 현장 이해`, p.ind ? `${p.ind.ic} ${p.ind.n} 현장 특성` : '현장 특성', N()), g = G(p, 's03');
      E.push(Photo(0.6, 1.55, 5.0, 3.0, M(MM.scene[0]))); E.push(Rc(0.6, 4.65, 5.0, 1.95, SOFT));
      E.push(T(0.75, 4.75, 4.7, 1.8, p.site ? [{ text: p.site.name, bold: true, color: NV }, { text: `${p.site.addr || ''}`, size: 0.85, color: MU }, { text: `계약 업종 ${p.site.work || '-'} · ${p.site.shift || '-'} · 운영 ${p.site.total}명`, color: INK }, { text: `계약일 ${p.site.since || '-'} · 관할 ${p.site.br}지사`, size: 0.9, color: GR }] : [{ text: f.client, bold: true, color: NV }, { text: f.addr || '주소 확인 예정', size: 0.85, color: MU }, { text: `${p.ind ? p.ind.n : ''} · ${p.jobs.map(j => j.short).join('·')}`, color: INK }], { max: 13, min: 8.5, gap: 3 }));
      E.push(T(5.9, 1.55, 6.8, 5.05, listParas(g.filter(x => !/요구사항/.test(x.title))), { max: 14, min: 9 }));
      push(E, 's03'); }
    /* 포지셔닝 */
    { const E = frameX(p, P(2), '현장 운영 특성 분석 [Positioning]', '관리 복잡도 × 현장 규모 — 맞춤 운영 전략 도출', N());
      const X0 = 0.9, Y0 = 1.6, W = 7.0, H = 4.9; E.push(Rc(X0, Y0, W, H, 'FAFBFD', { line: LN })); E.push(Rc(X0 + W / 2, Y0, 0.02, H, 'C9CED6')); E.push(Rc(X0, Y0 + H / 2, W, 0.02, 'C9CED6'));
      [['이해관계 조정형', 0, 0, '7A2E8E'], ['고도 통제형', 1, 0, 'C0392B'], ['단순 통제형', 0, 1, '0E7C86'], ['규칙·시스템형', 1, 1, NV]].forEach(([t, c, r, col]) => E.push(T(X0 + c * W / 2 + 0.15, Y0 + r * H / 2 + 0.12, W / 2 - 0.3, 0.35, t, { pt: 12, bold: true, color: col, align: c ? 'right' : 'left' })));
      E.push(T(X0, Y0 + H + 0.05, W, 0.3, '← 소규모·밀폐형          현장 규모          대규모·개방형 →', { pt: 10, color: MU, align: 'center' }));
      E.push(T(X0 - 0.35, Y0, 0.3, H, '관리 복잡도', { pt: 10, color: MU, valign: 'middle' }));
      const heads = p.heads || (p.site && p.site.total) || 10, cx = Math.min(0.92, 0.25 + heads / 80), cy = { hosp: 0.18, special: 0.15, apt: 0.25, public: 0.3, mfg: 0.4, office: 0.45, univ: 0.35, retail: 0.3, logi: 0.55, energy: 0.2, hotel: 0.4, build: 0.5 }[p.indK] ?? 0.45;
      const others = [['오피스', 0.6, 0.6], ['물류센터', 0.55, 0.7], ['병원', 0.75, 0.2], ['공동주택', 0.8, 0.3], ['공장', 0.65, 0.45], ['외국공관', 0.2, 0.15]];
      others.forEach(o => { E.push(Rc(X0 + o[1] * W - 0.55, Y0 + o[2] * H - 0.17, 1.1, 0.34, 'E9EDF5', { k: 'ellipse' })); E.push(T(X0 + o[1] * W - 0.55, Y0 + o[2] * H - 0.17, 1.1, 0.34, o[0], { pt: 9, color: MU, align: 'center', valign: 'middle' })); });
      E.push(Rc(X0 + cx * W - 0.95, Y0 + cy * H - 0.25, 1.9, 0.5, OR, { k: 'ellipse' })); E.push(T(X0 + cx * W - 0.95, Y0 + cy * H - 0.25, 1.9, 0.5, f.client.slice(0, 12), { pt: 11, bold: true, color: C.white, align: 'center', valign: 'middle' }));
      const strat = cy < 0.35 ? ['고객 요구 수준 높음 → 숙련 관리자 배치', '의사소통 채널 일원화(현장소장 단일 창구)', '정기 보고·대면 회의 정례화'] : ['표준 절차·시스템 중심 운영', '데이터 기반 인력 탄력 배치', '점검표·KPI로 품질 수치화'];
      E.push(Rc(8.3, 1.6, 4.4, 4.9, NVD)); E.push(T(8.5, 1.75, 4.0, 4.6, [{ text: '분석 결과', bold: true, color: '9FE3B0' }, { text: `${f.client}는 ${cy < 0.35 ? '관리 복잡도가 높은' : '표준화·시스템 운영이 효과적인'} 현장입니다.`, color: C.white, bold: true }, ...strat.map(t => ({ text: '•  ' + t, color: 'D6DCF0' })), { text: `운영 인원 ${heads}명 기준`, size: 0.8, color: 'B9C3EC' }], { max: 14, min: 9.5, gap: 6 }));
      push(E, 's03'); }
    /* 리스크 진단 */
    { const rk = (p.ind ? p.ind.risk : ['근무 공백', '안전사고', '고객 민원']).concat(['근무지 이탈·근무시간 미준수', '결원·이직 증가', '법규 위반(업무 범위·근로조건)']);
      const fix = { '근무지 이탈·근무시간 미준수': '전자순찰·근태관리 시스템으로 실시간 확인, 3대 중대 위반 특별교육', '결원·이직 증가': '지사 예비 인력 풀·24시간 대체 투입, 근로조건 준수로 이직 예방', '법규 위반(업무 범위·근로조건)': '업무 범위 계약서 명시, 근로기준·최저임금 100% 준수 점검' };
      const rows = rk.slice(0, 7).map((r, i) => [i < 3 ? '현장 특성' : '운영 공통', r, fix[r] || `예방 점검 + 즉시 대응 체계 + 재발방지 교육`]);
      CUR_PART = P(2); tableSlide(S, p, '현장 운영 진단 — 예상 문제점 & 개선 방안', '진단 범위: 조직 관리체계 · 근무형태·인력운영 · 서비스 품질', ['구분', '예상 문제점(리스크)', '에스텍 개선 방안'], rows, [1.4, 4.2, 6.5], { per: 7, bold: [0], center: [0] }); }
    if (p.rfp && p.rfp.rows.length) { CUR_PART = P(2); tableSlide(S, p, '제안요청 요구사항 대응표', `RFP·과업지시서 ${p.rfp.rows.length}건 — 전 항목 대응`, ['No', '구분', '요구사항', '에스텍 대응'], p.rfp.rows.map((x, i) => [i + 1, x.cat, x.req, x.how]), [0.6, 1.4, 5.4, 4.6], { per: 7, center: [0, 1] }); }
  }

  /* ===== PART 3 ===== */
  push(divider(p, P(3), N()));
  /* 비전 하우스 */
  if (on('s04')) { const E = frameX(p, P(3), '운영 비전 · 전략', 'Vision & Strategy', N());
    E.push(Rc(2.0, 1.55, 9.3, 0.75, NV, { k: 'homePlate' })); E.push(T(2.2, 1.55, 8.9, 0.75, `“${f.client}의 안전과 품질, 에스텍이 끝까지 책임집니다”`, { pt: 17, bold: true, color: C.white, align: 'center', valign: 'middle' }));
    const pil = [['안전', '무재해·무사고 현장', '🛡'], ['품질', '수치로 관리되는 서비스', '⭐'], ['신뢰', '투명한 원가·보고', '🤝'], ['혁신', '데이터·시스템 운영', '📱']];
    pil.forEach((x, i) => { const X = 1.4 + i * 2.7; E.push(Rc(X, 2.5, 2.45, 2.7, i % 2 ? 'EEF7F1' : SOFT, { line: LN })); E.push(T(X, 2.6, 2.45, 0.6, x[2], { pt: 26, align: 'center' })); E.push(T(X, 3.25, 2.45, 0.5, x[0], { pt: 20, bold: true, color: i % 2 ? GR : NV, align: 'center' })); E.push(T(X + 0.15, 3.85, 2.15, 1.2, x[1], { pt: 11.5, color: '3A4366', align: 'center' })); });
    E.push(Rc(1.4, 5.35, 10.55, 0.55, GR)); E.push(T(1.4, 5.35, 10.55, 0.55, '기반: 법규 준수 · 안전보건관리체계 · 표준 매뉴얼 · 지사 현장 밀착 관리', { pt: 13, bold: true, color: C.white, align: 'center', valign: 'middle' }));
    E.push(T(1.4, 6.0, 10.55, 0.55, p.emph.map(k => EMPH[k].n).join('  ·  ') + ' — 평가 강조점 집중 대응', { pt: 11, color: MU, align: 'center' }));
    push(E, 's04'); }
  /* 특화서비스 */
  { const sp = SPECIALS.common.concat(SPECIALS[p.indK] || []).concat(p.diff.map(k => [DIFF[k].n, DIFF[k].lines.join(' ')]));
    const pick = [], seen = new Set(); sp.forEach(x => { if (!seen.has(x[0])) { seen.add(x[0]); pick.push(x); } });
    for (let i = 0; i < pick.length; i += 4) { const E = frameX(p, P(3), `에스텍 특화서비스 ${i ? '(' + (i / 4 + 1) + ')' : ''}`, `${f.client} 맞춤 차별화 서비스`, N());
      pick.slice(i, i + 4).forEach((x, k) => { const X = 0.6 + (k % 2) * 6.1, Y = 1.55 + Math.floor(k / 2) * 2.55, idx = i + k + 1, ph = k % 2 ? M(['v07', 'v11', 'v14', 'v04'][idx % 4]) : M(((MEDIA_MAP[p.jobs[idx % p.jobs.length].k] || MM).scene[0]));
        E.push(Rc(X, Y, 5.95, 2.4, C.white, { line: LN })); E.push(Photo(X, Y, 2.3, 2.4, ph)); E.push(...chip(X + 2.45, Y + 0.15, 1.15, `특화 1.${idx}`, k % 2 ? GR : NV, { pt: 10 }));
        E.push(T(X + 2.45, Y + 0.55, 3.35, 0.5, [{ text: x[0], bold: true }], { max: 14, min: 10, color: INK })); E.push(T(X + 2.45, Y + 1.05, 3.35, 1.25, x[1], { max: 11, min: 7.5, color: '3A4366', lh: 1.3 })); });
      push(E, 's04'); } }
  /* 조직도 */
  if (on('s05')) { const E = frameX(p, P(3), '운영 조직 및 보고 체계', '본사 · 지사 · 현장 3단계 관리 — 고객사 요청은 현장 책임자 단일 창구', N());
    const node = (x, y, w, t, s, col) => { E.push(Rc(x, y, w, 0.72, col)); E.push(T(x, y + 0.04, w, 0.4, t, { pt: 12, bold: true, color: C.white, align: 'center' })); if (s) E.push(T(x, y + 0.38, w, 0.3, s, { max: 9.5, min: 7, color: 'D6DCF0', align: 'center' })); };
    node(5.4, 1.55, 2.5, `${CO.group} 본사`, '교육·법무·품질·인사 지원', NVD); E.push(Rc(6.64, 2.27, 0.03, 0.35, 'B0B8CC'));
    node(5.4, 2.62, 2.5, CO.branch || '관할 지사', `지사장${mg.name && /지사장/.test(mg.title || '') ? ' ' + mg.name : ''} · 정기·불시 점검`, NV); E.push(Rc(6.64, 3.34, 0.03, 0.35, 'B0B8CC'));
    node(5.4, 3.69, 2.5, '현장 책임자(소장)', '고객사 단일 창구', GR);
    E.push(Rc(1.3, 4.41, 10.75, 0.03, 'B0B8CC')); E.push(Rc(6.64, 4.41, 0.03, 0.0, 'B0B8CC'));
    const js = p.jobs.slice(0, 5), w = Math.min(2.3, 10.7 / js.length - 0.2), by = staffBy(p);
    js.forEach((j, i) => { const X = 1.2 + i * (10.9 / js.length) + (10.9 / js.length - w) / 2; E.push(Rc(X + w / 2 - 0.015, 4.41, 0.03, 0.3, 'B0B8CC'));
      E.push(Rc(X, 4.71, w, 1.75, SOFT, { line: LN })); E.push(PhotoFit(X + 0.05, 4.76, 0.95, 1.2, M((MEDIA_MAP[j.k] || MM).fig[0])));
      const cnt = Object.entries(by).filter(([k]) => j.kw.some(w2 => k.includes(w2)) || k.includes(j.short)).reduce((a, x) => a + x[1], 0);
      E.push(T(X + 1.0, 4.8, w - 1.05, 0.8, [{ text: j.n, bold: true, color: INK }, { text: cnt ? `${cnt}명` : '편성 예정', color: GR, bold: true }], { max: 12, min: 8, gap: 2 }));
      E.push(T(X + 0.08, 6.0, w - 0.16, 0.42, '팀장·조장 → 요원', { max: 9, min: 7, color: MU, align: 'center' })); });
    E.push(Rc(0.6, 1.55, 4.3, 2.65, 'EEF7F1')); E.push(T(0.75, 1.65, 4.0, 2.5, [{ text: '보고 체계', bold: true, color: GR }, { text: '•  일일: 근무일지·특이사항(현장→지사)', color: INK }, { text: '•  주간: 운영 현황 대면 보고(고객사)', color: INK }, { text: '•  월간: 운영 보고서(근태·교육·민원)', color: INK }, { text: '•  분기: 품질평가·개선 과제 회의', color: INK }, { text: '•  비상: 5분 이내 최초 보고', color: C.brick, bold: true }], { max: 12, min: 8.5, gap: 3 }));
    E.push(Rc(8.4, 1.55, 4.3, 2.65, SOFT)); E.push(T(8.55, 1.65, 4.0, 2.5, [{ text: '도급 운영 원칙', bold: true, color: NV }, { text: '•  업무 지시는 현장 책임자를 거쳐 전달', color: INK }, { text: '•  고객사의 직접 지휘·명령 배제(불법파견 방지)', color: INK }, { text: '•  업무 범위 계약서·근무지침 명시', color: INK }, { text: '•  변경 요청은 서면 협의 후 반영', color: INK }], { max: 12, min: 8.5, gap: 3 }));
    push(E, 's05'); }
  /* 인력 편성 */
  if (on('s05') && p.staff.length) {
    { const E = frameX(p, P(3), '인력 운영 계획', `총 ${staffTotal(p)}명 — 직종·직책·근무형태별 편성`, N()), by = staffBy(p), ks = Object.keys(by);
      const ch = barChart(ks.map(k => k.replace(/\(.*\)/, '')), ks.map(k => by[k]), { w: 700, h: 520, vfmt: v => v + '명', colors: ks.map((_, i) => PAL[i % PAL.length]) });
      E.push(Rc(0.6, 1.55, 4.9, 5.0, SOFT)); E.push(T(0.75, 1.62, 4.6, 0.35, '직종별 인원', { pt: 12, bold: true, color: INK })); E.push(Im(0.7, 2.0, 4.7, 3.5, ch.src));
      E.push(T(0.75, 5.6, 4.6, 0.85, [{ text: `총 ${staffTotal(p)}명`, bold: true, color: NV }, { text: '결원 시 지사 예비 인력 24시간 내 대체', size: 0.75, color: MU }], { pt: 18 }));
      const rows = p.staff.slice(0, 10), y0 = 1.55, X0 = 5.8, W = 6.9, cw = [1.4, 2.0, 0.9, 2.6];
      E.push(Rc(X0, y0, W, 0.42, NV)); ['직종', '직책', '인원', '근무형태'].forEach((h, j) => E.push(T(X0 + cw.slice(0, j).reduce((a, b) => a + b, 0) + 0.08, y0, cw[j] - 0.16, 0.42, h, { pt: 11, bold: true, color: C.white, valign: 'middle', align: j === 2 ? 'center' : 'left' })));
      const rh = Math.min(0.46, 4.3 / rows.length);
      rows.forEach((r, i) => { const y = y0 + 0.42 + i * rh; if (i % 2) E.push(Rc(X0, y, W, rh, 'F6F8FB')); [r.job, r.title || '-', r.count + '명', r.shift || '-'].forEach((c, j) => E.push(T(X0 + cw.slice(0, j).reduce((a, b) => a + b, 0) + 0.08, y, cw[j] - 0.16, rh, String(c), { max: 11.5, min: 8, color: INK, valign: 'middle', bold: j === 0, align: j === 2 ? 'center' : 'left' }))); });
      push(E, 's05'); }
    /* POST 배치 개념도 */
    { const E = frameX(p, P(3), 'POST 배치 개념도', `${p.ind ? p.ind.n : '현장'} 표준 근무 거점 — 현장 실사 후 확정`, N()), posts = (POSTS[p.indK] || POSTS.office).slice(0, 7);
      E.push(Rc(0.6, 1.55, 8.0, 5.0, 'EEF3F8', { line: LN })); E.push(Rc(3.0, 2.85, 3.2, 2.3, 'D6DEEA')); E.push(T(3.0, 2.85, 3.2, 2.3, [{ text: f.client.slice(0, 14), bold: true }, { text: p.ind ? p.ind.n : '', size: 0.75 }], { pt: 14, color: '5A6480', align: 'center', valign: 'middle' }));
      const pos = [[0.9, 1.75], [6.3, 1.75], [6.3, 5.55], [0.9, 5.55], [3.6, 1.75], [6.5, 3.7], [0.75, 3.7]];
      posts.forEach((t, i) => { const [x, y] = pos[i]; E.push(Rc(x, y, 2.0, 0.78, i === 0 ? OR : i % 2 ? NV : GR)); E.push(T(x + 0.05, y, 1.9, 0.78, [{ text: `P${i + 1}`, bold: true }, { text: t, size: 0.8 }], { max: 11, min: 7, color: C.white, align: 'center', valign: 'middle', gap: 1 })); });
      E.push(Rc(1.0, 5.05, 1.6, 0.04, OR)); E.push(T(1.0, 5.08, 2.0, 0.3, '순찰 동선 →', { pt: 9, color: OR, bold: true }));
      E.push(T(8.9, 1.55, 3.8, 5.0, [{ text: 'POST 운영 원칙', bold: true, color: NV }, ...posts.map((t, i) => ({ text: `P${i + 1}  ${t}`, color: INK, size: 0.92 })), { text: '근무 공백 없는 교대 · 피크 시간 탄력 배치 · 2시간 단위 전자순찰', color: GR, bold: true, size: 0.9 }], { max: 13, min: 8.5, gap: 4 }));
      push(E, 's05'); }
    /* 교대 근무표 */
    { const sp = p.staff.map(r => shiftPattern(r.shift)).find(Boolean);
      if (sp) { const E = frameX(p, P(3), `근무 편성표 — ${sp.n}`, '14일 순환 예시 · 법정 휴게시간 부여 · 근무 공백 없는 교대', N()), days = 14, X0 = 1.9, cw = (SW - X0 - 0.6) / days;
        for (let d = 0; d < days; d++) { E.push(Rc(X0 + d * cw, 1.6, cw - 0.04, 0.45, d % 7 >= 5 ? 'FBE9E7' : SOFT)); E.push(T(X0 + d * cw, 1.6, cw - 0.04, 0.45, `${d + 1}일`, { pt: 10, bold: true, color: INK, align: 'center', valign: 'middle' })); }
        const col = { 주: NV, 야: '2C3554', 비: 'C9CED6', 휴: 'E3E7EE', 근: GR };
        for (let t = 0; t < sp.teams; t++) { const y = 2.15 + t * 0.62; E.push(T(0.6, y, 1.25, 0.52, `${String.fromCharCode(65 + t)}조`, { pt: 13, bold: true, color: INK, valign: 'middle' }));
          for (let d = 0; d < days; d++) { const s = sp.cyc[(d + t * Math.max(1, Math.round(sp.cyc.length / sp.teams))) % sp.cyc.length]; E.push(Rc(X0 + d * cw, y, cw - 0.04, 0.52, col[s] || SOFT)); E.push(T(X0 + d * cw, y, cw - 0.04, 0.52, s, { pt: 12, bold: true, color: /비|휴/.test(s) ? '5A6480' : C.white, align: 'center', valign: 'middle' })); } }
        const yb = 2.3 + sp.teams * 0.62;
        E.push(T(0.6, yb, 12.1, 2.0, [{ text: '편성 기준', bold: true, color: GR }, { text: '•  주(주간)·야(야간)·비(비번)·휴(휴무) — 실제 근무시간·인원은 연동 견적의 근무형태 기준', color: INK }, { text: '•  감시·단속적 근로 승인 여부, 휴게시간(4시간당 30분 이상) 부여 계획을 근무지침에 명시', color: INK }, { text: '•  야간 근무자 특수건강진단 대상 관리, 연속 야간 근무 제한', color: INK }, { text: '•  대체근무·연차 사용은 근태관리 시스템으로 자동 집계해 월간 보고', color: INK }], { max: 13, min: 9, gap: 4 }));
        push(E, 's05'); } }
  }
  /* 시간대 집중업무 */
  { const tf = TIMEFOCUS[p.indK] || TIMEFOCUS.default;
    CUR_PART = P(3); tableSlide(S, p, '데이터 기반 시간대별 집중 운영', '시간대·이용자 특성 분석 → POST 탄력 배치', ['시간대', '구분', '집중 업무'], tf, [2.2, 2.2, 7.7], { per: 7, bold: [0], center: [0, 1] }); }
  /* 직종별 업무 수행 + 일과 + 영상 */
  if (on('s06')) p.jobs.forEach(j => {
    const mm = MEDIA_MAP[j.k] || MM, g = G(p, 's06').filter(x => x.title.includes(j.n));
    { const E = frameX(p, P(3), `${j.n} 업무 수행 방안`, `${j.ic} 업무 범위 · 운영 방법 · ${p.ind ? p.ind.n + ' 특화' : '현장 특화'}`, N());
      E.push(Photo(0.6, 1.55, 3.6, 5.0, M(mm.fig[0]), null, 0.4));
      E.push(T(4.5, 1.55, 8.2, 5.0, listParas(g.length ? g : [{ title: '업무 범위', lines: j.scope }, { title: '운영 방법', lines: j.run }]), { max: 13.5, min: 8.5 }));
      push(E, 's06'); }
    { const E = frameX(p, P(3), `${j.n} 하루 일과 (Standard Routine)`, '근무 표준화 — 언제, 무엇을, 어떻게', N()), rt = ROUTINE[j.k] || ROUTINE.spc;
      E.push(Rc(0.6, 3.15, SW - 1.2, 0.05, 'C9CED6'));
      rt.forEach((r, i) => { const X = 0.6 + i * ((SW - 1.2) / rt.length), w = (SW - 1.2) / rt.length - 0.12;
        E.push(Rc(X, 1.6, w, 1.35, i % 2 ? 'EEF7F1' : SOFT)); E.push(T(X + 0.1, 1.68, w - 0.2, 0.36, String(i + 1).padStart(2, '0'), { pt: 18, bold: true, color: i % 2 ? GR : NV })); E.push(T(X + 0.1, 2.1, w - 0.2, 0.8, r[0], { max: 13, min: 9, bold: true, color: INK }));
        E.push(Rc(X + w / 2 - 0.12, 3.05, 0.24, 0.24, i % 2 ? GR : NV, { k: 'ellipse' }));
        E.push(T(X + 0.05, 3.45, w - 0.1, 1.3, r[1], { max: 11.5, min: 8, color: '3A4366' })); });
      E.push(Photo(0.6, 4.95, 4.0, 1.6, M(mm.scene[0]))); E.push(Photo(4.75, 4.95, 4.0, 1.6, M(mm.scene[1] || 'v07'))); E.push(Rc(8.9, 4.95, 3.8, 1.6, NVD));
      E.push(T(9.05, 5.05, 3.5, 1.4, [{ text: '근무 기록·점검', bold: true, color: '9FE3B0' }, { text: `${j.kpi.slice(0, 2).join(' · ')}`, color: C.white }], { max: 12, min: 8.5, gap: 3 }));
      push(E); }
    { const v = mm.video, E = frameX(p, P(3), `현장 근무 영상 — ${j.n}`, `▶ ${VIDEO_TITLE[v] || '현장 근무'} · PPT에서 바로 재생 (PDF는 대표 장면)`, N());
      E.push(Rc(0.6, 1.55, 8.2, 4.62, '0F1530')); E.push(Object.assign(Photo(0.65, 1.6, 8.1, 4.52, M(v)), { t: 'video', key: v }));
      E.push(Rc(9.1, 1.55, 3.6, 5.0, SOFT)); E.push(PhotoFit(9.2, 1.65, 3.4, 2.4, M(mm.fig[1] || mm.fig[0])));
      E.push(T(9.25, 4.15, 3.3, 2.3, [{ text: '영상으로 보는 근무 기준', bold: true, color: GR }, ...j.run.slice(0, 3).map(t => ({ text: '•  ' + t, size: 0.9, color: INK }))], { max: 12, min: 8, gap: 3 }));
      push(E); }
  });
  /* 교육 */
  if (on('s07')) {
    { const E = frameX(p, P(3), '교육·훈련 체계', '법정 교육 + 현장 특별교육 + 비상 훈련 — 이수 기록 100% 관리', N()), g = G(p, 's07');
      E.push(T(0.6, 1.55, 6.6, 5.0, listParas(g), { max: 13, min: 8.5 }));
      E.push(Photo(7.5, 1.55, 5.2, 2.4, M('v13'))); E.push(Photo(7.5, 4.1, 2.55, 2.45, M(MEDIA_EXTRA.team, 'team'))); E.push(Photo(10.15, 4.1, 2.55, 2.45, M(MM.fig[2] || MM.fig[0])));
      push(E, 's07'); }
    { const E = frameX(p, P(3), '연간 교육 계획', 'Annual Training Calendar', N()), X0 = 3.5, cw = (SW - X0 - 0.6) / 12;
      for (let mo = 1; mo <= 12; mo++) { E.push(Rc(X0 + (mo - 1) * cw, 1.55, cw - 0.04, 0.42, NV)); E.push(T(X0 + (mo - 1) * cw, 1.55, cw - 0.04, 0.42, mo + '월', { pt: 10.5, bold: true, color: C.white, align: 'center', valign: 'middle' })); }
      EDU_CAL.forEach((r, i) => { const y = 2.05 + i * 0.56; E.push(Rc(0.6, y, 2.85, 0.5, i % 2 ? 'F6F8FB' : SOFT)); E.push(T(0.7, y, 2.7, 0.5, r[0], { max: 11.5, min: 8, bold: true, color: INK, valign: 'middle' }));
        for (let mo = 1; mo <= 12; mo++) { const onm = r[1].includes(mo); E.push(Rc(X0 + (mo - 1) * cw, y, cw - 0.04, 0.5, onm ? (i % 2 ? GR : '2A44D4') : 'F3F5F8')); if (onm) E.push(T(X0 + (mo - 1) * cw, y, cw - 0.04, 0.5, '●', { pt: 10, color: C.white, align: 'center', valign: 'middle' })); } });
      E.push(T(0.6, 2.15 + EDU_CAL.length * 0.56, 12.1, 0.5, EDU_CAL.map(r => `${r[0]}: ${r[2]}`).slice(0, 3).join('   |   '), { max: 9.5, min: 7, color: MU }));
      push(E, 's07'); }
  }
  /* 안전보건·비상 대응 */
  if (on('s08')) {
    { const E = frameX(p, P(3), '안전보건 관리체계', '중대재해처벌법 대응 — Plan · Do · Check · Act', N());
      const pd = [['Plan', '위험성평가·안전보건 계획', NV], ['Do', 'TBM·보호구·안전교육', GR], ['Check', '현장 점검·불시 점검', OR], ['Act', '개선·재발방지·보고', '7A2E8E']];
      const cx = 3.4, cy = 4.0; pd.forEach((x, i) => { const ang = -Math.PI / 2 + i * Math.PI / 2, X = cx + Math.cos(ang) * 1.65 - 0.95, Y = cy + Math.sin(ang) * 1.65 - 0.55;
        E.push(Rc(X, Y, 1.9, 1.1, x[2], { k: 'ellipse' })); E.push(T(X, Y + 0.08, 1.9, 0.95, [{ text: x[0], bold: true }, { text: x[1], size: 0.62 }], { pt: 16, color: C.white, align: 'center', valign: 'middle', gap: 1 })); });
      E.push(Rc(cx - 0.75, cy - 0.3, 1.5, 0.6, C.white, { line: LN, k: 'ellipse' })); E.push(T(cx - 0.75, cy - 0.3, 1.5, 0.6, '무재해', { pt: 13, bold: true, color: INK, align: 'center', valign: 'middle' }));
      const g = G(p, 's08').filter(x => !/적용 법령/.test(x.title));
      E.push(T(6.9, 1.55, 5.8, 5.0, listParas(g), { max: 13, min: 8.5 }));
      push(E, 's08'); }
    CUR_PART = P(3); tableSlide(S, p, '비상 상황별 대응 체계', '초기 대응 → 보고 → 후속 조치 — 5분 이내 최초 보고', ['상황', '초기 대응', '보고', '후속 조치'], EMERGENCY, [1.7, 3.6, 3.0, 3.8], { per: 7, bold: [0] });
    CUR_PART = P(3); tableSlide(S, p, '관계 법령 준수', '국가법령정보센터(law.go.kr) 기준', ['법령', '조항', '주요 내용'], p.laws.map(id => [LAWS[id].law, `${LAWS[id].art} ${LAWS[id].t}`, LAWS[id].s]), [2.6, 2.4, 7], { per: 7, bold: [0] });
  }
  /* 품질 KPI · Complaint */
  if (on('s09')) {
    { const E = frameX(p, P(3), '품질관리 KPI 대시보드', '측정하지 않으면 관리할 수 없습니다 — 월간 보고로 공유', N()), kp = uniq(p.jobs.flatMap(j => j.kpi).concat(p.ind ? p.ind.kpi : [])).slice(0, 8);
      kp.forEach((t, i) => { const c = i % 4, r = Math.floor(i / 4), X = 0.6 + c * 3.06, Y = 1.55 + r * 1.75, mt = /(\d+%|\d+분|\d+건|0건|100%)/.exec(t);
        E.push(Rc(X, Y, 2.92, 1.6, r ? 'EEF7F1' : SOFT)); E.push(T(X + 0.15, Y + 0.1, 2.6, 0.7, [{ text: mt ? mt[1] : '▲', bold: true }], { max: 26, min: 14, color: r ? GR : NV })); E.push(T(X + 0.15, Y + 0.85, 2.65, 0.7, t, { max: 11, min: 7.5, color: INK })); });
      const rp = [['일일', '근무일지 · 특이사항'], ['주간', '운영 현황 대면 보고'], ['월간', '운영 보고서(근태·교육·민원)'], ['분기', '품질평가 · 개선 과제']];
      rp.forEach((x, i) => { const X = 0.6 + i * 3.06; E.push(Rc(X, 5.25, 2.92, 1.3, NVD, { k: i < 3 ? 'homePlate' : 'rect' })); E.push(T(X + 0.2, 5.3, 2.4, 1.2, [{ text: x[0], bold: true, color: '9FE3B0' }, { text: x[1], color: C.white, size: 0.8 }], { pt: 15, valign: 'middle', gap: 2 })); });
      push(E, 's09'); }
    { const E = frameX(p, P(3), 'Complaint 대응 프로세스', 'S-Tec Complaint Response System — 대·중·소 분류 · 표준 대응 · 재발방지', N());
      const st = [['D+0', '접수·1차 조치', '접수 즉시 현장 조치\n경위 1차 보고'], ['D+1~3', '원인 분석', '관련자 면담\n사실 확인·조치'], ['D+7', '재발방지 회신', '대책 서면 회신\n근무자 재교육'], ['상시', '사후관리', '월간 보고 반영\n재발 여부 점검']];
      st.forEach((x, i) => { const X = 0.6 + i * 3.08; E.push(Rc(X, 1.65, 2.98, 0.75, i % 2 ? GR : NV, { k: 'homePlate' })); E.push(T(X + 0.2, 1.65, 2.5, 0.75, `${x[0]}  ${x[1]}`, { pt: 14, bold: true, color: C.white, valign: 'middle' })); E.push(Rc(X, 2.55, 2.85, 1.45, SOFT)); E.push(T(X + 0.18, 2.65, 2.5, 1.3, x[2], { max: 13, min: 9, color: INK })); });
      ['v19', 'v21', 'v27'].forEach((v, i) => E.push(Photo(0.6 + i * 2.75, 4.25, 2.6, 2.3, M(v))));
      E.push(Rc(8.95, 4.25, 3.75, 2.3, 'FDF1EF')); E.push(T(9.1, 4.35, 3.45, 2.1, [{ text: '3대 중대 위반 무관용', bold: true, color: C.brick }, { text: '근무지 이탈 · 근무시간 미준수 · 지시 불이행', color: INK, bold: true }, { text: '실제 Complaint 사례 영상으로 재교육하고, 재발 시 인사 조치 기준을 사전 고지합니다.', size: 0.85, color: '3A4366' }], { max: 13, min: 8.5, gap: 4 }));
      push(E, 's09'); }
  }
  /* 스마트 운영 */
  if (on('s10')) { const E = frameX(p, P(3), '스마트 운영관리 — 고객사 리포트', '현장 데이터를 실시간으로, 보고서는 자동으로', N()), g = G(p, 's10');
    E.push(Rc(0.6, 1.55, 6.6, 5.0, '0F1530')); E.push(Photo(0.7, 1.65, 6.4, 3.0, M(MEDIA_EXTRA.control)));
    [['근태', '실시간'], ['순찰', '전자기록'], ['민원', 'D+0'], ['교육', '이수 100%']].forEach((x, i) => { const X = 0.8 + i * 1.6; E.push(Rc(X, 4.8, 1.45, 1.6, '1C2550')); E.push(T(X, 4.9, 1.45, 1.4, [{ text: x[1], bold: true, color: '9FE3B0' }, { text: x[0], color: C.white, size: 0.7 }], { pt: 16, align: 'center', valign: 'middle', gap: 3 })); });
    E.push(T(7.5, 1.55, 5.2, 5.0, listParas(g.filter(x => !/통합관리 시스템/.test(x.title)).concat([{ title: '주요 프로그램', lines: PLATFORM.slice(0, 6).map(x => `${x.ko} — ${x.d}`) }])), { max: 12.5, min: 8 }));
    push(E, 's10'); }
  /* 운영 개시 · 인수인계 */
  if (on('s11')) { const E = frameX(p, P(3), '운영 개시 · 인수인계 계획', `운영 개시일 ${p.timeline[3].date} 기준 — 공백 없는 전환`, N()), tl = p.timeline;
    const X0 = 3.6, W = SW - X0 - 0.6, d0 = -30, d1 = 30, xx = d => X0 + (d - d0) / (d1 - d0) * W, dd = [-30, -14, -7, 0, 30];
    [-30, -21, -14, -7, 0, 10, 20, 30].forEach(d => { E.push(Rc(xx(d), 1.6, 0.01, 4.1, 'E3E7EE')); E.push(T(xx(d) - 0.4, 1.55, 0.8, 0.3, d === 0 ? 'D-Day' : (d < 0 ? 'D' + d : 'D+' + d), { pt: 9, bold: true, color: d === 0 ? C.brick : MU, align: 'center' })); });
    const bars = [['인력 선발·면접·고용승계 면담', -30, -14, NV], ['법정 교육·자격 확인·OJT', -14, -7, '2A44D4'], ['장비·피복·시스템 준비', -14, -3, '0E7C86'], ['현장 인수인계(업무·시설·비품)', -7, -1, GR], ['운영 개시·지사 상주 지원', 0, 7, C.brick], ['안정화 점검·첫 월간 보고', 7, 30, '7A2E8E']];
    bars.forEach((b, i) => { const y = 2.0 + i * 0.6; E.push(T(0.6, y, 2.9, 0.48, b[0], { max: 11, min: 8, color: INK, bold: true, valign: 'middle' })); E.push(Rc(xx(b[1]), y + 0.06, Math.max(0.2, xx(b[2]) - xx(b[1])), 0.38, b[3])); });
    E.push(T(0.6, 5.85, 12.1, 0.7, tl.map(t => `${t.d} ${t.date} ${t.t}`).join('   →   '), { max: 11, min: 8, color: GR, bold: true }));
    push(E, 's11'); }

  /* ===== PART 4 가격 ===== */
  if (on('s12')) {
    push(divider(p, P(4), N()));
    { const E = frameX(p, P(4), '제안 금액', '연동 견적 기준 · 부가가치세 별도', N());
      const big = m.monthly ? [['월 도급비', won(m.monthly) + '원', '공급가액'], ['월 합계(VAT 포함)', won(m.monthly + m.vat) + '원', `부가세 ${won(m.vat)}원`], [`${p.months}개월 총액`, won(m.monthly * p.months) + '원', `일금 ${korWon(m.monthly * p.months)}원정`]] : m.once ? [['단기 인력', won(m.once) + '원', '공급가액'], ['합계(VAT 포함)', won(m.once + m.onceVat) + '원', `부가세 ${won(m.onceVat)}원`], ['투입 인원', m.heads + '명', '연동 견적 기준']] : [['제안 금액', '견적 연동 후 기재', '「📑 제안서로 보내기」'], ['운영 인원', (p.heads || '-') + '명', ''], ['계약기간', p.months + '개월', '']];
      big.forEach((b, i) => { const X = 0.6 + i * 4.08; E.push(Rc(X, 1.55, 3.92, 1.9, i ? SOFT : NV)); E.push(T(X + 0.22, 1.68, 3.5, 0.4, b[0], { pt: 13, bold: true, color: i ? NV : 'C9D1F0' })); E.push(T(X + 0.22, 2.1, 3.5, 0.8, b[1], { max: 28, min: 14, bold: true, color: i ? INK : C.white })); E.push(T(X + 0.22, 2.92, 3.5, 0.4, b[2], { max: 10.5, min: 7, color: i ? MU : 'C9D1F0' })); });
      if (p.est.length) { const rows = priceRows(p), ch = barChart(p.est.map(e => SRC[e.src].n + '\n' + e.title.slice(0, 10)), p.est.map(e => e.unit === '건' ? (e.supply || 0) : (e.monthly || 0)), { w: 760, h: 420, vfmt: v => (v / 10000).toFixed(0) + '만', fmt: v => (v / 10000).toFixed(0) + '만', colors: p.est.map(e => '#' + SRC[e.src].color) });
        E.push(Rc(0.6, 3.65, 5.8, 2.95, SOFT)); E.push(Im(0.7, 3.72, 5.6, 2.8, ch.src));
        const y0 = 3.65; E.push(Rc(6.6, y0, 6.1, 0.4, NV)); ['산출 프로그램 · 견적', '인원', '공급가액(원)'].forEach((h, j) => E.push(T([6.7, 10.0, 10.8][j], y0, [3.2, 0.8, 1.8][j], 0.4, h, { pt: 10.5, bold: true, color: C.white, valign: 'middle', align: j ? 'right' : 'left' })));
        rows.slice(0, 5).forEach((r, i) => { const y = y0 + 0.4 + i * 0.5; if (i % 2) E.push(Rc(6.6, y, 6.1, 0.5, 'F6F8FB')); [`${r[0]} · ${r[1]}`, r[2], r[4]].forEach((c, j) => E.push(T([6.7, 10.0, 10.8][j], y, [3.2, 0.8, 1.8][j], 0.5, String(c), { max: 10.5, min: 7.5, color: INK, valign: 'middle', align: j ? 'right' : 'left', bold: j === 2 }))); }); }
      push(E, 's12'); }
    const mixE = p.est.filter(e => e.mix); if (mixE.length) { const mx = mixE.reduce((a, e) => { Object.entries(e.mix).forEach(([k, v]) => a[k] = (a[k] || 0) + (+v || 0)); return a; }, {}), tot = Object.values(mx).reduce((a, b) => a + b, 0);
      if (tot > 0) { const E = frameX(p, P(4), '원가 구성 — 투명한 산출', '법정 원가(인건비·4대보험·퇴직급여) 우선 반영', N());
        const d = donut([{ label: '인건비', value: mx.labor || 0, color: '#0B1F8A' }, { label: '경비', value: mx.expense || 0, color: '#1E8B3A' }, { label: '부대비용', value: mx.addon || 0, color: '#E8750A' }, { label: '일반관리비·이윤', value: mx.marg || 0, color: '#64748B' }].filter(x => x.value > 0), { center: Math.round((mx.labor || 0) / tot * 100) + '%', sub: '인건비 비중', w: 760, h: 440 });
        E.push(Rc(0.6, 1.55, 7.0, 4.6, SOFT)); E.push(Im(0.7, 1.7, 6.8, 3.95, d.src));
        E.push(T(7.9, 1.55, 4.8, 4.6, [{ text: '가격 산출 원칙', bold: true, color: NV }, { text: '•  최저임금(2026년 10,320원 · 2027년 10,700원)·4대보험 법정 요율 적용', color: INK }, { text: '•  연장·야간·휴일 가산, 연차·퇴직급여 원가 반영', color: INK }, { text: '•  일반관리비·이윤은 합리적 수준으로 최소화', color: INK }, { text: '•  산출내역서 공개 — 항목별 검증 가능', color: GR, bold: true }], { max: 13, min: 9, gap: 5 }));
        push(E, 's12'); } }
    const wb = p.est.find(e => e.src === 'wbe' && e.tasks.some(t => t.cost != null));
    if (wb) { const E = frameX(p, P(4), '업무별 비용 배분 — 업무량 기반 산정', `${wb.title} · 월 업무량 ${wb.hours || '-'}시간 · ${wb.staff || ''}`, N());
      const ch = barChart(wb.tasks.map(t => t.name.slice(0, 7)), wb.tasks.map(t => t.cost || 0), { w: 1100, h: 460, vfmt: v => (v / 10000).toFixed(0) + '만', fmt: v => (v / 10000).toFixed(0) + '만', colors: wb.tasks.map((_, i) => PAL[i % PAL.length]) });
      E.push(Rc(0.6, 1.55, 12.1, 3.55, SOFT)); E.push(Im(0.8, 1.6, 11.7, 3.45, ch.src));
      E.push(T(0.6, 5.25, 12.1, 1.3, [{ text: '「인당 단가」가 아닌 「업무 단가」', bold: true, color: GR }, { text: wb.tasks.map(t => `${t.name} ${t.share != null ? (t.share * 100).toFixed(1) + '%' : ''}`).join('  ·  '), color: INK, size: 0.85 }, { text: '업무를 추가·축소하면 비용이 업무량에 비례해 조정되어 예산 협의가 명확해집니다.', color: MU, size: 0.85 }], { max: 13, min: 8.5, gap: 4 }));
      push(E, 's12'); }
    CUR_PART = P(4); listSlides(S, p, '가격 산출 근거 · 조건', '⑫ 가격 제안', G(p, 's12').slice(1));
  }

  /* ===== PART 5 ===== */
  push(divider(p, P(5), N()));
  { const E = frameX(p, P(5), '기대효과', 'Before → After', N()), eff = G(p, 's13').find(x => x.title === '기대효과');
    const before = ['결원·근무 공백 발생', '수기 기록·사후 보고', '사안 발생 후 대응', '인당 단가 위주 견적'], after = ['24시간 내 대체 투입·공백 0', '전자기록·월간 데이터 보고', '예방 중심·5분 보고 체계', '업무량·법정 원가 기반 투명 견적'];
    E.push(Rc(0.6, 1.55, 5.2, 0.5, '8A93A3')); E.push(T(0.6, 1.55, 5.2, 0.5, 'BEFORE', { pt: 14, bold: true, color: C.white, align: 'center', valign: 'middle' })); E.push(Rc(7.5, 1.55, 5.2, 0.5, GR)); E.push(T(7.5, 1.55, 5.2, 0.5, 'AFTER · with S-Tec', { pt: 14, bold: true, color: C.white, align: 'center', valign: 'middle' }));
    before.forEach((t, i) => { const y = 2.2 + i * 0.75; E.push(Rc(0.6, y, 5.2, 0.62, 'F3F5F8')); E.push(T(0.8, y, 4.9, 0.62, t, { pt: 13, color: '5A6480', valign: 'middle' })); E.push(T(6.0, y, 1.3, 0.62, '➜', { pt: 22, color: GR, align: 'center', valign: 'middle' })); E.push(Rc(7.5, y, 5.2, 0.62, 'EEF7F1')); E.push(T(7.7, y, 4.9, 0.62, after[i], { pt: 13, bold: true, color: INK, valign: 'middle' })); });
    if (eff) E.push(T(0.6, 5.3, 12.1, 1.3, eff.lines.map(t => ({ text: '✔  ' + t })), { max: 12, min: 8.5, color: '2C3554' }));
    push(E, 's13'); }
  { const E = frameX(p, P(5), '에스텍의 약속 (SLA)', '말이 아닌 숫자로 약속합니다', N());
    PROMISES.forEach((x, i) => { const c = i % 3, r = Math.floor(i / 3), X = 0.6 + c * 4.08, Y = 1.55 + r * 2.5;
      E.push(Rc(X, Y, 3.92, 2.35, r ? 'EEF7F1' : SOFT)); E.push(T(X + 0.2, Y + 0.12, 3.5, 0.85, [{ text: x[0], bold: true }], { max: 34, min: 18, color: r ? GR : NV })); E.push(T(X + 0.2, Y + 0.98, 3.5, 0.4, x[1], { pt: 14, bold: true, color: INK })); E.push(T(X + 0.2, Y + 1.4, 3.55, 0.9, x[2], { max: 10.5, min: 7.5, color: '3A4366' })); });
    push(E, 's13'); }
  { const E = [], sc = M(MEDIA_EXTRA.team, 'team');
    E.push(Rc(0, 0, SW, SH, C.white)); E.push(Photo(0, 0, SW, 4.9, M('v16'), null, 0.4)); E.push(Im(0, 0, SW, 4.9, veil('v', 0.1, 0.85, '7,18,79')));
    const cl = G(p, 's13').find(x => x.title === '맺음말');
    E.push(T(0.8, 2.6, SW - 1.6, 0.9, [{ text: cl ? cl.lines[0] : 'The Best Choice, S-Tec', bold: true }], { max: 26, min: 16, color: C.white, align: 'center' }));
    E.push(T(0.8, 3.55, SW - 1.6, 0.8, (cl ? cl.lines.slice(1, 2) : []).map(t => ({ text: t })), { max: 15, min: 10, color: 'D6DCF0', align: 'center' }));
    E.push(T(0.8, 5.05, SW - 1.6, 0.6, [{ text: 'The Best Choice, S-Tec', bold: true }], { pt: 26, color: INK, align: 'center' }));
    E.push(Rc(SW / 2 - 0.6, 5.7, 1.2, 0.05, GR));
    E.push(T(0.8, 5.85, SW - 1.6, 0.4, `${CO.group} · ${CO.branch || CO.name}${mg.name ? `  |  ${mg.name}${mg.title ? ' ' + mg.title : ''}${mg.phone ? ' · ' + mg.phone : ''}${mg.email ? ' · ' + mg.email : ''}` : ''}`, { pt: 11, color: MU, align: 'center' }));
    E.push(Im(0.7, SH - 0.75, 1.3, 1.3 * 340 / 900, ASSET.logo)); E.push(sigEl(SW - 4.3, SH - 0.62, 0.38));
    push(E); }
  return videoize(S);
}
