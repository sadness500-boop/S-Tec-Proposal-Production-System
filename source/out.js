/* =====================================================================
 * 제안서 출력 — Word 제안서 · PPT 발표자료 · PDF / 제출 이력 · 시작
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const docTitle = p => p.title;
async function fetchVideo() { return null; }
async function toPng(u) { return u; }
const ROMAN = ['', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ', 'ⅩⅢ', 'ⅩⅣ'];
const imgType = src => /^data:image\/png/.test(src) ? 'png' : 'jpg';
function imgRun(src, w, h) { return new docx.ImageRun({ type: imgType(src), data: b64ToU8(dataUrlB64(src)), transformation: { width: Math.round(w), height: Math.round(h) } }); }
const AL = () => docx.AlignmentType;
const fileBase = p => `${String(p.made.getFullYear()).slice(2)}${pad(p.made.getMonth() + 1)}${pad(p.made.getDate())}_${safeName(p.f.client)}_제안서${p.f.mode === 'client' ? '' : '(내부검토)'}`;
const staffTotal = p => p.staff.reduce((a, r) => a + (+r.count || 0), 0);

/* =====================================================================
 * Word 제안서
 * ===================================================================== */
function kvTable(rows) {
  const w = [1700, 3119, 1700, 3119];
  return table(rows.map(r => r[2] == null
    ? [td(r[0], w[0], { fill: 'E8F5EC', bold: true, align: AL().CENTER, color: C.greenD }), cell([P([R(String(r[1] ?? '-'), { size: 19 })], { after: 0 })], { w: w[1] + w[2] + w[3], span: 3 })]
    : [td(r[0], w[0], { fill: 'E8F5EC', bold: true, align: AL().CENTER, color: C.greenD }), td(r[1] ?? '-', w[1]), td(r[2], w[2], { fill: 'E8F5EC', bold: true, align: AL().CENTER, color: C.greenD }), td(r[3] ?? '-', w[3])]), w);
}
function gridTable(head, rows, widths, o = {}) {
  return table([head.map((h, i) => th(h, widths[i]))].concat(rows.map((r, ri) => r.map((c, i) => td(c ?? '-', widths[i], { size: o.size || 18, align: (o.center || []).includes(i) ? AL().CENTER : (o.right || []).includes(i) ? AL().RIGHT : undefined, bold: (o.bold || []).includes(i), fill: o.zebra && ri % 2 ? 'F6F8FB' : undefined })))), widths, { header: true });
}
function secParas(groups) { return bullets(groups); }
function priceRows(p) {
  return p.est.map(e => [SRC[e.src].n, e.title, e.heads ? e.heads + '명' : '-', e.unit === '건' ? '건' : '월', e.unit === '건' ? won(e.supply ?? (e.total != null ? Math.round(e.total / 1.1) : null)) : won(e.monthly), e.unit === '건' ? won(e.vat) : won(e.vat ?? (e.monthly != null ? Math.round(e.monthly * 0.1) : null))]);
}
async function makeDocx(p) {
  const f = p.f, isClient = f.mode === 'client', ch = [], on = id => p.secOn[id];
  let n = 1; const S = t => H1(`${ROMAN[n++]}. ${t}`);
  /* 표지 */
  ch.push(P([R(isClient ? '' : '내부 검토용 · 대외비', { size: 18, bold: true, color: C.brick })], { align: AL().RIGHT, after: 200 }));
  ch.push(P([imgRun(ASSET.icon, 96, 96)], { align: AL().CENTER, before: 300, after: 160 }));
  ch.push(P([R(p.pt.n.toUpperCase(), { size: 20, bold: true, color: C.green })], { align: AL().CENTER, after: 80 }));
  ch.push(P([R(p.title, { size: 44, bold: true, color: C.navy })], { align: AL().CENTER, after: 120 }));
  ch.push(P([R(`${f.client}${f.site ? ' · ' + f.site : ''}`, { size: 26, color: C.ink })], { align: AL().CENTER, after: 280 }));
  ch.push(P([imgRun(ASSET.hero, 600, 600 * 1792 / 2400)], { align: AL().CENTER, after: 280 }));
  ch.push(P([R(fmtD(parseD(f.date) || p.made), { size: 22, color: C.gray })], { align: AL().CENTER, after: 60 }));
  ch.push(P([R(`${CO.group} · ${CO.branch || CO.name}`, { size: 26, bold: true, color: C.ink })], { align: AL().CENTER, after: 40 }));
  ch.push(P([R(`${f.to_ ? '수신: ' + f.to_ + '   ' : ''}문서번호 ${p.docNo}`, { size: 17, color: C.gray })], { align: AL().CENTER, after: 0 }));
  ch.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
  /* 목차 */
  ch.push(P([R('목   차', { size: 32, bold: true, color: C.navy })], { align: AL().CENTER, after: 240, border: { bottom: { style: docx.BorderStyle.DOUBLE, size: 6, color: C.navy, space: 6 } } }));
  let k = 1; SECTIONS.filter(s => on(s.id)).forEach(s => ch.push(P([R(`${ROMAN[k++]}.  `, { size: 22, bold: true, color: C.green }), R(s.n, { size: 22, color: C.ink })], { indent: { left: 1200 }, after: 90 })));
  if (p.est.length) ch.push(P([R('붙임.  ', { size: 22, bold: true, color: C.green }), R('연동 견적 상세', { size: 22 })], { indent: { left: 1200 }, after: 90 }));
  if (!isClient) ch.push(P([R('별첨.  ', { size: 22, bold: true, color: C.brick }), R('검토·승인 기록 (내부용)', { size: 22 })], { indent: { left: 1200 }, after: 90 }));
  ch.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
  /* 요약 */
  const m = p.money;
  ch.push(boxPara([P([R('□ 제안 요약', { size: 22, bold: true, color: C.greenD })], { after: 80 })].concat([
    `제안명: ${p.title}`, `대상: ${f.client}${f.site ? ' · ' + f.site : ''}${p.ind ? ` (${p.ind.n})` : ''}`, `직종: ${p.jobs.map(j => j.n).join(', ')} · 운영 인원 ${p.heads || '-'}명`,
    m.monthly ? `제안 금액: 월 ${won(m.monthly)}원 (VAT 별도) · ${p.months}개월 ${won(m.monthly * p.months)}원` : m.once ? `제안 금액: ${won(m.once)}원 (VAT 별도)` : '제안 금액: 견적 연동 후 기재',
    `핵심: ${p.emph.map(x => EMPH[x].n).join(' · ')}`
  ].map(l => P([R('· ', { bold: true, color: C.green }), R(l, { size: 20 })], { indent: { left: 240, hanging: 200 }, after: 30 })))));
  for (const s of SECTIONS) {
    if (!on(s.id)) continue;
    ch.push(S(s.n));
    const g = G(p, s.id);
    if (s.id === 's01') {
      ch.push(kvTable([['제안명', p.title, null], ['고객사', f.client, '현장', f.site || '-'], ['업종', p.ind ? p.ind.n : '-', '제안 유형', p.pt.n], ['직종', p.jobs.map(j => j.n).join(', '), '운영 인원', p.heads ? p.heads + '명' : '-'],
        ['계약기간', f.from ? `${f.from} ~ ${f.to}` : `${p.months}개월`, '제출일', fmtD(parseD(f.date) || p.made)], ['제출', `${CO.branch || CO.name} · ${f.author || ''}`, '수신', f.to_ || '-']]));
      ch.push(P([R('')], { after: 60 }));
    }
    if (s.id === 's02') {
      const tot = SITES.reduce((a, x) => a + (x.total || 0), 0);
      ch.push(table([[cell([P([R(String(SITES.length), { size: 40, bold: true, color: C.navy })], { align: AL().CENTER, after: 0 }), P([R('운영 사업장(곳)', { size: 17, color: C.gray })], { align: AL().CENTER, after: 0 })], { w: 3212, fill: 'F4F6FB' }),
        cell([P([R(tot.toLocaleString('ko-KR'), { size: 40, bold: true, color: C.green })], { align: AL().CENTER, after: 0 }), P([R('현장 인력(명)', { size: 17, color: C.gray })], { align: AL().CENTER, after: 0 })], { w: 3213, fill: 'F2F7F3' }),
        cell([P([R(String(BRANCHES.length), { size: 40, bold: true, color: C.navy })], { align: AL().CENTER, after: 0 }), P([R('관할 지사', { size: 17, color: C.gray })], { align: AL().CENTER, after: 0 })], { w: 3213, fill: 'F4F6FB' })]], [3212, 3213, 3213]));
      ch.push(P([R('※ 에스텍베스트 사업장 현황 지도(S-Tec Business Site Overview) 등록 기준', { size: 15, color: C.gray, it: true })], { align: AL().RIGHT, after: 80 }));
    }
    ch.push(...secParas(g));
    if (s.id === 's03' && p.rfp && p.rfp.rows.length) {
      ch.push(H2(`제안요청 요구사항 대응표 (${p.rfp.rows.length}건)`));
      ch.push(gridTable(['No', '구분', '요구사항', '대응 방안', '반영'], p.rfp.rows.map((x, i) => [String(i + 1), x.cat, x.req, `${SECTIONS.find(s2 => s2.id === x.sec).ic} ${x.how}`, x.st]), [500, 1100, 3700, 3538, 800], { size: 16, center: [0, 1, 4] }));
    }
    if (s.id === 's05' && p.staff.length) {
      ch.push(H2('직종별 편성표'));
      ch.push(gridTable(['직종', '직책', '인원', '근무형태', '근거'], p.staff.map(r => [r.job, r.title || '-', `${r.count}명`, r.shift || '-', r.src === 'site' ? '현행 운영' : r.src === 'rfp' ? 'RFP' : SRC[r.src] ? SRC[r.src].n : '-']).concat([['합계', '', `${staffTotal(p)}명`, '', '']]), [1800, 2400, 1100, 2538, 1800], { center: [2], zebra: true }));
    }
    if (s.id === 's08') {
      ch.push(H2('관계 법령 요약'));
      ch.push(table([[th('법령', 2300), th('조항', 1500), th('주요 내용', 5838)]].concat(p.laws.map(id => { const x = LAWS[id]; return [cell([P([R(x.law, { size: 18, bold: true, color: C.navy })], { after: 10 }), P([HLINK('원문 보기 ↗', lawUrl(x))], { after: 0 })], { w: 2300 }), td(`${x.art}\n${x.t}`, 1500, { size: 16, align: AL().CENTER }), td(x.s, 5838, { size: 17 })]; })), [2300, 1500, 5838], { header: true }));
    }
    if (s.id === 's10') {
      ch.push(H2('에스텍 통합관리 시스템 구성'));
      ch.push(table([[th('', 900), th('프로그램', 3200), th('기능', 5538)]].concat(PLATFORM.map(x => [cell([P([imgRun(ASSET.apps[x.code] || ASSET.icon, 34, 34)], { align: AL().CENTER, after: 0 })], { w: 900 }), td(`${x.ko}\n${x.n}`, 3200, { size: 17, bold: true }), td(x.d, 5538, { size: 17 })])), [900, 3200, 5538], { header: true }));
    }
    if (s.id === 's11') {
      ch.push(H2('운영 개시 일정표'));
      const tc = [C.navy, C.navy, C.green, C.brick, C.greenD];
      ch.push(table([[th('단계', 1100), th('일자', 1500), th('구분', 2000), th('주요 내용', 5038)]].concat(p.timeline.map((t, i) => [td(t.d, 1100, { bold: true, align: AL().CENTER, color: C.white, fill: tc[i] }), td(t.date, 1500, { align: AL().CENTER }), td(t.t, 2000, { bold: true }), td(t.a, 5038)])), [1100, 1500, 2000, 5038], { header: true }));
    }
    if (s.id === 's12') {
      if (p.est.length) {
        ch.push(H2('견적 요약표 (VAT 별도)'));
        ch.push(gridTable(['산출 프로그램', '견적', '인원', '단위', '공급가액(원)', '부가세(원)'], priceRows(p).concat(m.monthly || m.once ? [['합계', '', `${m.heads}명`, '', won((m.monthly || 0) + (m.once || 0)), won((m.vat || 0) + (m.onceVat || 0))]] : []), [1700, 2938, 900, 700, 1800, 1600], { center: [2, 3], right: [4, 5] }));
      }
      const wb = p.est.find(e => e.src === 'wbe' && e.tasks.some(t => t.cost != null));
      if (wb) {
        ch.push(H2(`업무별 비용 배분 — ${wb.title}`));
        ch.push(gridTable(['업무(대분류)', '월 업무시간', '비중', '월 비용(원)'], wb.tasks.map(t => [t.name, t.hours != null ? t.hours.toFixed(1) + 'h' : '-', t.share != null ? (t.share * 100).toFixed(1) + '%' : '-', won(t.cost)]), [4038, 1800, 1500, 2300], { center: [1, 2], right: [3] }));
      }
      if (!isClient && m.monthly) {
        const mix = p.est.filter(e => e.mix).reduce((a, e) => { Object.entries(e.mix).forEach(([k2, v]) => a[k2] = (a[k2] || 0) + (+v || 0)); return a; }, {});
        if (Object.keys(mix).length) { ch.push(H2('원가 구성 (내부용)')); ch.push(gridTable(['인건비', '경비', '부대비용', '일반관리비·이윤'], [[won(mix.labor), won(mix.expense), won(mix.addon), won(mix.marg)]], [2409, 2410, 2409, 2410], { right: [0, 1, 2, 3] })); }
      }
    }
  }
  /* 붙임: 연동 견적 상세 */
  if (p.est.length) {
    ch.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
    ch.push(H1('붙임. 연동 견적 상세'));
    p.est.forEach((e, i) => {
      ch.push(H2(`${i + 1}. ${SRC[e.src].n} — ${e.title}`));
      ch.push(P([R(`${e.client || f.client}${e.period && e.period.from ? ` · ${e.period.from} ~ ${e.period.to || ''}` : ''}${e.at ? ` · 연동 ${String(e.at).slice(0, 10)}` : ''} · ${e.origin === 'raw' ? '견적 보관함' : e.origin === 'manual' ? '직접 입력' : e.origin === 'file' ? '연동 파일' : '「제안서로 보내기」 연동'}`, { size: 17, color: C.gray })], { after: 60 }));
      if (e.rows.length) ch.push(gridTable(['직종', '직책', '인원', '근무형태', '1인 단가', '금액'], e.rows.map(r => [r.job, r.title || '-', r.count + '명', r.shift || (r.date ? r.date : '-'), won(r.unit), won(r.amount)]), [1300, 2400, 900, 2338, 1300, 1400], { center: [2], right: [4, 5], size: 17 }));
      if (e.staff) ch.push(P([R(`편성: ${e.staff}${e.plan ? ` (${e.plan})` : ''}`, { size: 18 })], { before: 60, after: 30 }));
      if (e.addons.length) ch.push(P([R('부대비용: ' + e.addons.map(a => `${a.n}${a.q > 1 ? ' ×' + a.q : ''}`).join(', '), { size: 18 })], { before: 60, after: 30 }));
      e.notes.forEach(t => ch.push(P([R('※ ' + t, { size: 16, color: C.gray, it: true })], { after: 20 })));
    });
  }
  /* 별첨: 검토·승인 (내부용) */
  if (!isClient) {
    const a = p.approval;
    ch.push(new docx.Paragraph({ children: [new docx.PageBreak()] }));
    ch.push(H1('별첨. 검토·승인 기록 (내부용)'));
    ch.push(table([[th('구분', 1600), th('작성', 2679), th('검토', 2679), th('승인', 2680)], [td('성명', 1600, { align: AL().CENTER, bold: true, fill: C.silverL }), td(a.writer || '', 2679, { align: AL().CENTER }), td(a.reviewer || '', 2679, { align: AL().CENTER }), td(a.approver || '', 2680, { align: AL().CENTER })],
      [td('서명', 1600, { align: AL().CENTER, bold: true, fill: C.silverL }), td('\n\n', 2679), td('\n\n', 2679), td('\n\n', 2680)]], [1600, 2679, 2679, 2680]));
    ch.push(P([R(`진행 상태: ${STATUS[a.status].n}`, { size: 20, bold: true, color: STATUS[a.status].c })], { before: 120, after: 60 }));
    ch.push(...CHECKS.map(([kk, t]) => P([R(a.checks[kk] ? '☑ ' : '☐ ', { size: 21, color: a.checks[kk] ? C.green : C.brick }), R(t, { size: 19 })], { indent: { left: 300 }, after: 30 })));
    a.log.forEach(l => ch.push(P([R('· ' + l, { size: 17, color: C.gray })], { indent: { left: 300 }, after: 10 })));
  }
  ch.push(P([R('- 끝 -', { size: 20, bold: true })], { align: AL().CENTER, before: 240, after: 120 }));
  ch.push(P([R(`※ 법령 요약은 국가법령정보센터(law.go.kr) 기준 실무 참고용입니다. 회사 수치·실적은 내부 자료 기준이며, 견적 금액은 연동 견적 프로그램 산출 결과입니다.  |  ${APP.name} ${APP.version}`, { size: 15, color: '8A93A3' })], { align: AL().CENTER }));
  return await packDocx(ch, p.title);
}

/* =====================================================================
 * 슬라이드 (PPT·PDF 공용)
 * ===================================================================== */
function coverSlide(p) {
  const c = [], f = p.f;
  c.push(Rc(0, 0, SW, SH, C.white));
  c.push(Im(6.35, 0, SW - 6.35, (SW - 6.35) * 1792 / 2400, ASSET.hero));
  c.push(Rc(6.35, (SW - 6.35) * 1792 / 2400, SW - 6.35, SH - (SW - 6.35) * 1792 / 2400, 'F3F5F8'));
  c.push(Rc(0, 0, 0.12, SH, K.ink)); c.push(Rc(0.12, 0, 0.05, SH, C.green));
  c.push(Im(0.85, 0.6, 1.35, 1.35, ASSET.icon));
  c.push(Rc(0.85, 2.3, 0.5, 0.05, C.green));
  c.push(T(0.85, 2.45, 5.3, 0.4, `${APP.org}  ·  ${p.pt.n}`, { pt: 13, color: C.green, bold: true }));
  c.push(T(0.85, 2.85, 5.3, 1.6, [{ text: p.title, bold: true }], { max: 34, min: 20, color: K.ink, lh: 1.15 }));
  c.push(T(0.85, 4.55, 5.3, 0.9, [{ text: `${f.client}${f.site ? ' · ' + f.site : ''}`, bold: true, color: '3A4366' }, { text: `${p.jobs.map(j => j.n).join(' · ')}${p.ind ? '  |  ' + p.ind.n : ''}`, size: 0.8, color: K.mute }], { max: 16, min: 10.5, gap: 4 }));
  c.push(Rc(0.85, 5.6, 5.0, 0.012, K.line));
  c.push(T(0.85, 5.7, 5.4, 0.4, `${fmtD(parseD(f.date) || p.made)}   |   ${CO.branch || CO.name}${f.author ? ' ' + f.author : ''}`, { pt: 10.5, color: K.mute }));
  if (f.mode !== 'client') { c.push(Rc(0.85, 6.25, 1.9, 0.36, C.brick, { k: 'para' })); c.push(T(0.85, 6.25, 1.9, 0.36, '내부 검토용', { pt: 10.5, bold: true, color: C.white, align: 'center', valign: 'middle' })); }
  c.push(sigEl(SW - 4.25, SH - 0.62, 0.4));
  return c;
}
function listSlides(S, p, title, sub, groups, opt = {}) {
  const w = opt.fig ? 8.9 : 12.1, pages = paginate(listParas(groups), w, 4.75, 12.5);
  pages.forEach((pg, i) => {
    const o = frame(title + (pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''), sub, S.length + 1, p);
    o.push(T(0.6, 1.6, w, 4.95, pg, { max: 16, min: 11 }));
    if (opt.fig) { o.push(Rc(9.75, 1.6, 3.0, 4.95, 'F7F8FA', { line: K.line })); o.push(figBox(opt.fig, 9.85, 1.75, 2.8, 4.1)); if (opt.cap) o.push(T(9.75, 5.95, 3.0, 0.4, opt.cap, { pt: 10.5, color: K.mute, align: 'center' })); }
    S.push(o);
  });
}
function tableSlide(S, p, title, sub, head, rows, widths, opt = {}) {
  const per = opt.per || 9;
  for (let i = 0; i < Math.max(1, rows.length); i += per) {
    const part = rows.slice(i, i + per), o = frame(title + (rows.length > per ? ` (${i / per + 1}/${Math.ceil(rows.length / per)})` : ''), sub, S.length + 1, p);
    const X0 = 0.6, W = 12.1, tot = widths.reduce((a, b) => a + b, 0), xs = []; let x = X0; widths.forEach(wd => { xs.push(x); x += W * wd / tot; });
    const rh = Math.min(0.52, 4.6 / Math.max(1, part.length)), y0 = 1.6;
    o.push(Rc(X0, y0, W, 0.44, C.navy));
    head.forEach((h, j) => o.push(T(xs[j] + 0.08, y0, W * widths[j] / tot - 0.16, 0.44, h, { pt: 11.5, bold: true, color: C.white, valign: 'middle', align: (opt.center || []).includes(j) ? 'center' : 'left' })));
    part.forEach((r, ri) => {
      const y = y0 + 0.44 + ri * rh; if (ri % 2) o.push(Rc(X0, y, W, rh, 'F6F8FB'));
      o.push(Rc(X0, y + rh - 0.01, W, 0.01, K.line));
      r.forEach((c, j) => o.push(T(xs[j] + 0.08, y + 0.03, W * widths[j] / tot - 0.16, rh - 0.06, String(c ?? '-'), { max: 12, min: 8, color: (opt.bold || []).includes(j) ? C.navy : C.ink, bold: (opt.bold || []).includes(j), valign: 'middle', align: (opt.center || []).includes(j) ? 'center' : (opt.right || []).includes(j) ? 'right' : 'left' })));
    });
    if (opt.foot) o.push(T(X0, 6.55, W, 0.35, opt.foot, { pt: 10, color: K.mute }));
    S.push(o);
  }
}
function buildSlides(p) {
  const f = p.f, S = [], on = id => p.secOn[id], m = p.money;
  S.push(coverSlide(p));
  /* 목차 */
  { const o = frame('목차', 'Contents', 2, p), secs = SECTIONS.filter(s => on(s.id)), half = Math.ceil(secs.length / 2);
    secs.forEach((s, i) => { const col = i < half ? 0 : 1, row = col ? i - half : i, x = 0.9 + col * 6.2, y = 1.75 + row * 0.66;
      o.push(Rc(x, y, 0.62, 0.48, i % 2 ? C.green : C.navy, { k: 'para' })); o.push(T(x, y, 0.62, 0.48, String(i + 1).padStart(2, '0'), { pt: 13, bold: true, color: C.white, align: 'center', valign: 'middle' }));
      o.push(T(x + 0.8, y, 5.0, 0.48, s.n, { pt: 15, bold: true, color: K.ink, valign: 'middle' })); o.push(Rc(x + 0.8, y + 0.53, 4.9, 0.01, K.line)); });
    S.push(o); }
  /* 제안 요약 */
  { const o = frame('제안 요약', `${f.client} · ${p.pt.n}`, S.length + 1, p);
    const cards = [['대상', `${f.client}${f.site ? '\n' + f.site : ''}`, p.ind ? p.ind.n : ''], ['직종·인원', p.jobs.map(j => j.short).join('·'), p.heads ? `총 ${p.heads}명` : '현장 실사 후 확정'],
      ['계약기간', f.from ? `${f.from}\n~ ${f.to}` : `${p.months}개월`, f.from ? `${p.months}개월` : '협의'], ['제안 금액', m.monthly ? `월 ${won(m.monthly)}원` : m.once ? `${won(m.once)}원` : '견적 연동 후', 'VAT 별도']];
    cards.forEach((c, i) => { const x = 0.6 + i * 3.08; o.push(Rc(x, 1.65, 2.9, 2.2, i % 2 ? 'F2F7F3' : 'F4F6FB', { line: K.line })); o.push(Rc(x, 1.65, 2.9, 0.07, i % 2 ? C.green : C.navy));
      o.push(T(x + 0.2, 1.85, 2.5, 0.35, c[0], { pt: 12, bold: true, color: i % 2 ? C.greenD : C.navy })); o.push(T(x + 0.2, 2.25, 2.5, 1.0, c[1], { max: 18, min: 11, bold: true, color: K.ink })); o.push(T(x + 0.2, 3.3, 2.5, 0.4, c[2], { pt: 11, color: K.mute })); });
    o.push(T(0.6, 4.1, 12.1, 0.4, '핵심 제안', { pt: 14, bold: true, color: C.greenD }));
    p.emph.slice(0, 4).forEach((k, i) => { const x = 0.6 + i * 3.08; o.push(Rc(x, 4.55, 2.9, 1.95, C.white, { line: K.line })); o.push(T(x + 0.15, 4.65, 2.6, 0.4, `${EMPH[k].ic} ${EMPH[k].n}`, { pt: 12.5, bold: true, color: K.ink })); o.push(T(x + 0.15, 5.1, 2.6, 1.3, EMPH[k].line, { max: 11.5, min: 8.5, color: K.mute })); });
    S.push(o); }
  for (const s of SECTIONS) {
    if (!on(s.id)) continue;
    const g = G(p, s.id), sub = `${s.ic} ${s.n}`;
    if (s.id === 's02') {
      const o = frame('회사 소개', CO.group + ' · ' + CO.name, S.length + 1, p), tot = SITES.reduce((a, x) => a + (x.total || 0), 0);
      [[String(SITES.length), '운영 사업장(곳)', C.navy], [tot.toLocaleString('ko-KR'), '현장 인력(명)', C.green], [String(BRANCHES.length), '관할 지사', C.navy]].forEach((x, i) => { const y = 1.65 + i * 1.62; o.push(Rc(9.4, y, 3.35, 1.45, i % 2 ? 'F2F7F3' : 'F4F6FB', { line: K.line })); o.push(T(9.5, y + 0.12, 3.15, 0.8, x[0], { pt: 34, bold: true, color: x[2], align: 'center' })); o.push(T(9.5, y + 0.92, 3.15, 0.4, x[1], { pt: 12, color: K.mute, align: 'center' })); });
      o.push(T(9.4, 6.5, 3.35, 0.3, '사업장 현황 지도 기준', { pt: 9, color: K.mute, align: 'center' }));
      o.push(T(0.6, 1.6, 8.5, 4.95, listParas(g), { max: 15, min: 9.5 }));
      S.push(o); continue;
    }
    if (s.id === 's05' && p.staff.length) { listSlides(S, p, s.n, sub, g.slice(0, 1).concat(g.slice(2))); tableSlide(S, p, '직종별 편성표', sub, ['직종', '직책', '인원', '근무형태'], p.staff.map(r => [r.job, r.title || '-', r.count + '명', r.shift || '-']).concat([['합계', '', staffTotal(p) + '명', '']]), [2, 3, 1.2, 3], { center: [2], bold: [0] }); continue; }
    if (s.id === 's06') { p.jobs.forEach(j => { const gg = g.filter(x => x.title.includes(j.n)); listSlides(S, p, `${j.n} 업무 수행 방안`, sub, gg.length ? gg : g, { fig: figName('dio', j.fig), cap: `${j.n} 현장` }); }); continue; }
    if (s.id === 's08') { listSlides(S, p, s.n, sub, g.filter(x => !/적용 법령/.test(x.title)), { fig: figName('cute', 'sec'), cap: '무재해·법규 준수' }); tableSlide(S, p, '관계 법령', sub + ' · 국가법령정보센터 기준', ['법령', '조항', '주요 내용'], p.laws.map(id => [LAWS[id].law, `${LAWS[id].art} ${LAWS[id].t}`, LAWS[id].s]), [2.6, 2.4, 7], { per: 7, bold: [0] }); continue; }
    if (s.id === 's09') {
      listSlides(S, p, s.n, sub, g.filter(x => !/Complaint/.test(x.title)));
      const o = frame('Complaint 대응 절차', sub, S.length + 1, p), st = [['D+0', '접수·1차 조치', '접수 즉시 현장 조치\n경위 1차 보고'], ['D+1~3', '원인 분석', '관련자 면담\n사실 확인·조치'], ['D+7', '재발방지 회신', '대책 서면 회신\n근무자 재교육'], ['상시', '사후관리', '월간 보고 반영\n재발 여부 점검']];
      st.forEach((x, i) => { const X = 0.6 + i * 3.08; o.push(Rc(X, 1.9, 2.95, 0.7, i % 2 ? C.green : C.navy, { k: 'homePlate' })); o.push(T(X + 0.15, 1.9, 2.5, 0.7, `${x[0]}  ${x[1]}`, { pt: 13.5, bold: true, color: C.white, valign: 'middle' })); o.push(Rc(X, 2.75, 2.85, 1.8, 'F7F8FA', { line: K.line })); o.push(T(X + 0.15, 2.9, 2.55, 1.5, x[2], { max: 14, min: 10, color: K.ink })); });
      o.push(T(0.6, 4.85, 12.1, 1.5, [{ text: '고객사 Complaint 대응 프로그램(S-Tec Complaint Response System)으로 대·중·소 분류·대응방안·개선 보고서를 표준 양식으로 작성해 회신합니다.', color: K.mute }], { max: 13, min: 10 }));
      S.push(o); continue;
    }
    if (s.id === 's10') {
      const o = frame('스마트 운영관리 체계', '에스텍 통합관리 시스템 · 하나의 계정으로 9개 프로그램', S.length + 1, p);
      PLATFORM.forEach((x, i) => { const col = i % 3, row = Math.floor(i / 3), X = 0.6 + col * 4.08, Y = 1.6 + row * 1.6;
        o.push(Rc(X, Y, 3.9, 1.45, x.code === 'stpp' ? 'EEF7F1' : 'F7F8FA', { line: x.code === 'stpp' ? '9FD3AE' : K.line })); o.push(Im(X + 0.15, Y + 0.2, 0.95, 0.95, ASSET.apps[x.code] || ASSET.icon));
        o.push(T(X + 1.25, Y + 0.15, 2.55, 0.42, x.ko, { pt: 13, bold: true, color: K.ink })); o.push(T(X + 1.25, Y + 0.55, 2.55, 0.8, x.d, { max: 10.5, min: 8, color: K.mute })); });
      S.push(o); continue;
    }
    if (s.id === 's11') {
      const o = frame('운영 개시·인수인계 일정', sub, S.length + 1, p);
      p.timeline.forEach((t, i) => { const X = 0.6 + i * 2.45; o.push(Rc(X, 1.75, 2.38, 0.8, [C.navy, C.navy, C.green, C.brick, C.greenD][i], { k: 'chevron' })); o.push(T(X + 0.35, 1.75, 1.8, 0.8, [{ text: t.d, bold: true }, { text: t.date, size: 0.75 }], { pt: 13, color: C.white, align: 'center', valign: 'middle', gap: 1 }));
        o.push(T(X + 0.1, 2.75, 2.2, 0.45, t.t, { pt: 13, bold: true, color: K.ink, align: 'center' })); o.push(T(X + 0.1, 3.2, 2.2, 1.6, t.a, { max: 11.5, min: 9, color: K.mute, align: 'center' })); });
      const g2 = g.filter(x => !/일정/.test(x.title)); o.push(Rc(0.6, 5.0, 12.1, 1.5, 'F7F8FA', { line: K.line })); o.push(T(0.8, 5.1, 11.7, 1.3, listParas(g2), { max: 13, min: 9 }));
      S.push(o); continue;
    }
    if (s.id === 's12') {
      const o = frame('가격 제안', '연동 견적 기준 · VAT 별도', S.length + 1, p);
      const big = m.monthly ? [['월 도급비', won(m.monthly) + '원', '공급가액(VAT 별도)'], ['부가세 포함 월 합계', won(m.monthly + m.vat) + '원', `부가세 ${won(m.vat)}원`], [`${p.months}개월 총액`, won(m.monthly * p.months) + '원', '공급가액(VAT 별도)']] : m.once ? [['단기 인력', won(m.once) + '원', '공급가액(VAT 별도)'], ['부가세 포함', won(m.once + m.onceVat) + '원', `부가세 ${won(m.onceVat)}원`], ['투입 인원', m.heads + '명', '연동 견적 기준']] : [['제안 금액', '견적 연동 후 기재', '견적 프로그램 「제안서로 보내기」'], ['운영 인원', (p.heads || '-') + '명', ''], ['계약기간', p.months + '개월', '']];
      big.forEach((b, i) => { const X = 0.6 + i * 4.08; o.push(Rc(X, 1.6, 3.9, 1.75, i === 0 ? C.navy : 'F4F6FB', { line: i ? K.line : null })); o.push(T(X + 0.2, 1.72, 3.5, 0.4, b[0], { pt: 12.5, bold: true, color: i ? C.navy : 'C9D1F0' })); o.push(T(X + 0.2, 2.12, 3.5, 0.75, b[1], { max: 26, min: 14, bold: true, color: i ? K.ink : C.white })); o.push(T(X + 0.2, 2.88, 3.5, 0.35, b[2], { pt: 10.5, color: i ? K.mute : 'C9D1F0' })); });
      if (p.est.length) {
        const rows = priceRows(p).slice(0, 5); const y0 = 3.6;
        o.push(Rc(0.6, y0, 12.1, 0.4, C.navy)); ['산출 프로그램', '견적', '인원', '공급가액(원)'].forEach((h, j) => o.push(T([0.7, 3.4, 8.3, 9.7][j], y0, [2.6, 4.8, 1.3, 2.9][j], 0.4, h, { pt: 11, bold: true, color: C.white, valign: 'middle', align: j > 1 ? 'right' : 'left' })));
        rows.forEach((r, i) => { const y = y0 + 0.4 + i * 0.42; if (i % 2) o.push(Rc(0.6, y, 12.1, 0.42, 'F6F8FB')); [r[0], r[1], r[2], r[4]].forEach((c, j) => o.push(T([0.7, 3.4, 8.3, 9.7][j], y, [2.6, 4.8, 1.3, 2.9][j], 0.42, String(c), { max: 11.5, min: 8.5, color: K.ink, valign: 'middle', align: j > 1 ? 'right' : 'left', bold: j === 3 }))); });
      } else o.push(T(0.6, 3.7, 12.1, 2.6, listParas(g.slice(1)), { max: 14, min: 10 }));
      S.push(o);
      const wb = p.est.find(e => e.src === 'wbe' && e.tasks.some(t => t.cost != null));
      if (wb) tableSlide(S, p, '업무별 비용 배분', `업무량 기반 산정 · ${wb.title}`, ['업무(대분류)', '월 업무시간', '비중', '월 비용(원)'], wb.tasks.map(t => [t.name, t.hours != null ? t.hours.toFixed(1) + 'h' : '-', t.share != null ? (t.share * 100).toFixed(1) + '%' : '-', won(t.cost)]), [5, 2, 1.5, 2.5], { center: [1, 2], right: [3], bold: [0] });
      listSlides(S, p, '가격 산출 근거·조건', sub, g.slice(1));
      continue;
    }
    if (s.id === 's03' && p.rfp && p.rfp.rows.length) { listSlides(S, p, s.n, sub, g.filter(x => !/요구사항/.test(x.title)), { fig: figName('dio', p.jobs[0].fig), cap: p.ind ? p.ind.n : '' }); tableSlide(S, p, '요구사항 대응표', `RFP·과업지시서 ${p.rfp.rows.length}건`, ['No', '구분', '요구사항', '대응'], p.rfp.rows.map((x, i) => [i + 1, x.cat, x.req, SECTIONS.find(s2 => s2.id === x.sec).ic + ' ' + x.how]), [0.6, 1.4, 5.5, 4.5], { per: 7, center: [0, 1] }); continue; }
    if (s.id === 's13') { listSlides(S, p, s.n, sub, g.filter(x => x.title !== '맺음말')); continue; }
    const figs = { s01: figName('dio', p.jobs[0].fig), s04: 'mgr', s07: figName('cute', p.jobs[0].fig === 'cln' ? 'cln' : 'sec'), s03: figName('dio', p.jobs[0].fig) };
    listSlides(S, p, s.n, sub, g, figs[s.id] && ASSET.fig[figs[s.id]] ? { fig: figs[s.id] } : {});
  }
  S.push(closingSlide({ fig: 'team_dio', tag: G(p, 's13').find(x => x.title === '맺음말') ? G(p, 's13').find(x => x.title === '맺음말').lines[0] : `${f.client}의 신뢰받는 파트너, 에스텍`, org: `${CO.group} · ${CO.branch || CO.name}${UI.manager ? `  |  ${UI.manager.name}${UI.manager.title ? ' ' + UI.manager.title : ''}${UI.manager.phone ? ' · ' + UI.manager.phone : ''}` : ''}` }));
  return S;
}

/* =====================================================================
 * 실행 · 제출 이력
 * ===================================================================== */
function busy(on, msg) { $('#busy').classList.toggle('on', on); if (msg) $('#busyMsg').textContent = msg; }
async function run(kind) {
  const p = syncEditor(); if (!p) return toast('먼저 [제안서 초안 집필]을 누르세요.');
  p.f.mode = (document.querySelector('input[name=mode]:checked') || {}).value || 'client';
  if (p.f.mode === 'client' && !['approved', 'submitted'].includes(p.approval.status)) toast('※ 아직 승인 전입니다 — 대외 제출 전 「검토·승인」을 마치세요.', 3500);
  try {
    const base = fileBase(p);
    if (kind === 'docx' || kind === 'all') { busy(true, 'Word 제안서 만드는 중…'); await download(await makeDocx(p), base + '.docx'); }
    if (kind === 'pptx' || kind === 'all') { busy(true, 'PPT 발표자료 만드는 중…'); await download(await makePptx(p, null, p.title), base + '_발표.pptx'); }
    if (kind === 'pdf' || kind === 'all') { await download(await makePdf(p, (i, n) => busy(true, `PDF 변환 중… ${i}/${n}`), null, p.title), base + '_발표.pdf'); }
    p.printed = true; p.approval.log.push(`${fmtD(kstNow())} 출력(${{ docx: 'Word', pptx: 'PPT', pdf: 'PDF', all: 'Word·PPT·PDF' }[kind]})`); saveProject(true); renderApproval(); updStepper();
    toast('출력 완료 — 다운로드 폴더를 확인하세요.');
  } catch (e) { console.error(e); toast('생성 오류: ' + e.message, 5000); }
  finally { busy(false); }
}
const PJ_KEY = 'stec_pp_projects';
function storeProjects(h) { try { localStorage.setItem(PJ_KEY, JSON.stringify(h)); } catch (e) { toast('저장 공간이 부족합니다. 오래된 기록을 지우세요.'); } }   // 로그인 시 서버 동기화(auth 모듈이 감쌈)
function readProjects() { try { return JSON.parse(localStorage.getItem(PJ_KEY) || '[]'); } catch (e) { return []; } }
function formSnapshot() {
  const o = {}; ['f_title', 'f_client', 'f_site', 'f_addr', 'f_ind', 'f_from', 'f_to', 'f_recv', 'f_dept', 'f_author', 'f_date', 'f_rfp', 'f_extra'].forEach(id => o[id] = $('#' + id).value);
  return { form: o, jobs: state.jobs, type: state.type, emph: state.emph, diff: state.diff, secs: state.secs, siteId: state.site ? state.site.id : null, picked: [...LINK.picked], pkgs: pickedPkgs(), mode: (document.querySelector('input[name=mode]:checked') || {}).value };
}
function saveProject(quiet) {
  const p = state.plan; if (!p) return;
  const h = readProjects(); const id = state.projId || ('pj' + Date.now()); state.projId = id;
  const rec = { id, at: fmtD(kstNow()), title: p.title, client: p.f.client, status: p.approval.status, amount: p.money.monthly || p.money.once || null, snap: formSnapshot(), text: p.text, secOn: p.secOn, approval: p.approval };
  const i = h.findIndex(x => x.id === id); if (i >= 0) h.splice(i, 1); h.unshift(rec); storeProjects(h.slice(0, 30)); renderProjects();
  if (!quiet) toast('제안서를 저장했습니다.');
}
function renderProjects() {
  const h = readProjects(); $('#statProj').textContent = h.length;
  $('#projList').innerHTML = h.length ? h.map((x, i) => `<li data-i="${i}"><span class="badge" style="--c:#${(STATUS[x.status] || STATUS.draft).c}">${(STATUS[x.status] || STATUS.draft).n}</span><div class="hb"><b>${esc(x.title)}</b><span>${esc(x.client)}${x.amount ? ' · ' + won(x.amount) + '원' : ''}</span></div><em>${esc(x.at)}</em><button class="hdel" data-del="${i}" title="삭제">🗑</button></li>`).join('') : '<li class="empty">저장된 제안서가 없습니다.</li>';
}
function loadProject(i) {
  const x = readProjects()[i]; if (!x) return; const s = x.snap;
  Object.entries(s.form).forEach(([id, v]) => { if ($('#' + id)) $('#' + id).value = v || ''; });
  state.jobs = s.jobs || []; state.type = s.type || 'new'; state.emph = s.emph || []; state.diff = s.diff || []; state.secs = s.secs || SECTIONS.map(z => z.id); state.jobsTouched = true;
  if (s.mode) { const r = document.querySelector(`input[name=mode][value=${s.mode}]`); if (r) r.checked = true; }
  state.site = s.siteId ? SITES.find(z => z.id === s.siteId) || null : null;
  (s.pkgs || []).forEach(pk => { if (!LINK.items.find(z => z.id === pk.id)) LINK.items.push(normPkg(pk, pk.origin)); });
  LINK.picked = new Set(s.picked || []);
  renderJobChips(); renderTypeSeg(); renderEmph(); renderDiff(); renderSecChecks(); renderSiteInfo(); renderSites(); renderLinks();
  state.projId = x.id; state.approval = x.approval;
  const p = buildPlan(); if (!p) return; Object.assign(p.text, x.text || {}); Object.assign(p.secOn, x.secOn || {}); p.approval = x.approval || p.approval;
  state.plan = p; renderEditor(p); toast('제안서를 불러왔습니다.');
  $('#outPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function confirmDel(msg, ok) {
  openModal(`<h2>삭제</h2><div class="sub">${esc(msg)}<br>삭제하면 되살릴 수 없습니다.</div><div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="dOk" style="background:#C62828">삭제</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal; md.querySelector('#dOk').onclick = () => { closeModal(); ok(); };
  });
}
function newProposal() {
  ['f_title', 'f_client', 'f_site', 'f_addr', 'f_from', 'f_to', 'f_recv', 'f_rfp', 'f_extra'].forEach(id => $('#' + id).value = '');
  ['f_ind', 'f_type'].forEach(id => delete $('#' + id).dataset.touched); $('#f_ind').value = '';
  state.site = null; state.jobs = []; state.jobsTouched = false; state.type = 'new'; state.plan = null; state.projId = null; state.approval = null; LINK.picked.clear(); RFP.att = []; renderRfpFiles();
  renderJobChips(); renderTypeSeg(); renderSiteInfo(); renderSites(); renderLinks(); renderRfp(null);
  $('#editor').innerHTML = $('#editorEmpty').innerHTML; $('#outPanel').classList.remove('ready'); renderApproval(); updStepper();
  $('#work').scrollIntoView({ behavior: 'smooth' });
}

/* =====================================================================
 * 시작
 * ===================================================================== */
async function init() {
  const t = kstNow(); $('#f_date').value = isoD(t); $('#f_dept').value = APP.branch;
  renderIndSelect(); renderJobChips(); renderTypeSeg(); renderEmph(); renderDiff(); renderSecChecks();
  uiInit();
  $('#statInd').textContent = `${Object.keys(INDUSTRIES).length}·${Object.keys(JOBS).length}`;
  $('#jobChips').onclick = e => { const b = e.target.closest('[data-j]'); if (!b) return; state.jobsTouched = true; const k = b.dataset.j; state.jobs = state.jobs.includes(k) ? state.jobs.filter(x => x !== k) : state.jobs.concat(k); renderJobChips(); updStepper(); };
  $('#typeSeg').onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; $('#f_type').dataset.touched = '1'; setType(b.dataset.t); };
  $('#emphChips').onclick = e => { const b = e.target.closest('[data-e]'); if (!b) return; const k = b.dataset.e; state.emph = state.emph.includes(k) ? state.emph.filter(x => x !== k) : state.emph.concat(k); renderEmph(); };
  $('#diffChips').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; const k = b.dataset.d; state.diff = state.diff.includes(k) ? state.diff.filter(x => x !== k) : state.diff.concat(k); renderDiff(); };
  $('#secChecks').onchange = e => { const c = e.target.closest('[data-s]'); if (!c) return; state.secs = c.checked ? uniq(state.secs.concat(c.dataset.s)) : state.secs.filter(x => x !== c.dataset.s); };
  $('#linkTabs').onclick = e => { const b = e.target.closest('[data-tab]'); if (b) { state.tab = b.dataset.tab; renderLinks(); } };
  $('#linkList').onclick = e => {
    const x = e.target.closest('[data-x]'); if (x) { e.stopPropagation(); const id = x.dataset.x; confirmDel('이 견적을 목록에서 뺄까요? (견적 프로그램의 원본은 그대로 남습니다)', () => { removeLocalPkg(id); LINK.picked.delete(id); refreshLinks(false); }); return; }
    const li = e.target.closest('li.lk'); if (!li) return; const id = li.dataset.id;
    if (LINK.picked.has(id)) LINK.picked.delete(id); else { LINK.picked.add(id); applyPkgToForm(LINK.items.find(p => p.id === id)); }
    renderLinks();
  };
  $('#btnLinkRefresh').onclick = () => refreshLinks(true).then(() => toast('견적 목록을 새로 불러왔습니다.'));
  $('#btnLinkOpen').onclick = openSrcMenu;
  $('#btnLinkManual').onclick = () => openManualEst();
  $('#btnLinkFile').onclick = () => $('#linkFile').click();
  $('#linkFile').onchange = async e => { const fl = e.target.files[0]; e.target.value = ''; if (!fl) return; try { const arr = await importLinkFile(fl); arr.forEach(p => LINK.picked.add(p.id)); await refreshLinks(false); applyPkgToForm(arr[0]); toast(`연동 파일에서 견적 ${arr.length}건을 불러왔습니다.`); } catch (er) { toast(er.message, 5000); } };
  $('#btnLinkExport').onclick = () => { const ps = pickedPkgs(); if (!ps.length) return toast('내보낼 견적을 체크하세요.'); download(exportLinkFile(ps), `견적연동_${safeName($('#f_client').value || 'export')}.json`); };
  $('#btnRfp').onclick = () => runRfp(false);
  $('#btnRfpClear').onclick = () => { $('#f_rfp').value = ''; RFP.att = []; renderRfpFiles(); renderRfp(null); updStepper(); };
  $('#btnGen').onclick = () => { const p = buildPlan(); if (!p) return; if (state.plan && state.plan.approval) p.approval = state.plan.approval; state.plan = p; renderEditor(p); saveProject(true); toast('제안서 초안을 집필했습니다. 내용을 검토·수정한 뒤 승인·출력하세요.'); $('#outPanel').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  $('#btnSave').onclick = () => { syncEditor(); saveProject(false); };
  $('#btnNew').onclick = $('#heroNew').onclick = newProposal;
  $('#heroLink').onclick = () => $('#linkCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#btnDocx').onclick = () => run('docx'); $('#btnPptx').onclick = () => run('pptx'); $('#btnPdf').onclick = () => run('pdf'); $('#btnAll').onclick = () => run('all');
  $('#projList').onclick = e => { const d = e.target.closest('[data-del]'); if (d) { const i = +d.dataset.del, h = readProjects(); confirmDel(`「${h[i] ? h[i].title : ''}」을(를) 삭제할까요?`, () => { const hh = readProjects(); hh.splice(i, 1); storeProjects(hh); renderProjects(); }); return; } const li = e.target.closest('li[data-i]'); if (li) loadProject(+li.dataset.i); };
  document.querySelectorAll('#stepper .stp').forEach(b => b.onclick = () => { const t2 = $(b.dataset.go); if (t2) t2.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  ['f_client', 'f_rfp'].forEach(id => $('#' + id).addEventListener('input', updStepper));
  renderProjects(); renderApproval();
  await refreshLinks(false);
  if (/[?&]from=/.test(location.search) || location.hash === '#link') $('#linkCard').scrollIntoView({ block: 'start' });
  window.addEventListener('focus', () => refreshLinks(false));        // 견적 프로그램에서 보내고 돌아오면 자동 갱신
  window.addEventListener('storage', e => { if (e.key === LINK_KEY) refreshLinks(false); });
  setTimeout(() => { if (window.STPP_AUTH && STPP_AUTH.profile) refreshLinks(true); }, 2500);
  await buildSignature(kstNow());
  $('#sigImg').src = state.sigDataUrl;
}
window.addEventListener('DOMContentLoaded', init);
