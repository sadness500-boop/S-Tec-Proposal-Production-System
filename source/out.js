/* =====================================================================
 * 제안서 출력 — Word 제안서 · PPT 발표자료 · PDF / 제출 이력 · 시작
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const docTitle = p => p.title;
async function fetchVideo(k) { return await loadVideo(k); }
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
const SEC_PART = { s02: 1, s03: 2, s04: 3, s05: 3, s06: 3, s07: 3, s08: 3, s09: 3, s10: 3, s11: 3, s12: 4, s13: 5 };
async function slideJpeg(els, scale = 1.25) {
  const host = $('#render'); host.innerHTML = ''; const d = slideDom(els); host.appendChild(d);
  await Promise.all([...d.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => { }) : null));
  const cv = await html2canvas(d, { scale, backgroundColor: '#ffffff', logging: false, useCORS: true }); host.innerHTML = '';
  return cv.toDataURL('image/jpeg', 0.86);
}
function figPara(src, caption, wIn = 6.65) {
  const out = [new docx.Paragraph({ alignment: AL().CENTER, spacing: { before: 100, after: 40 }, keepNext: true, children: [imgRun(src, wIn * 96, wIn * 96 * 7.5 / 13.333)] })];
  if (caption) out.push(P([R(caption, { size: 16, color: C.gray, it: true })], { align: AL().CENTER, after: 140 }));
  return out;
}
/* 영상 썸네일(재생 단추 그림) — 누르면 웹에서 영상 재생 */
function playThumb(m, wIn, hIn) {
  const W = Math.round(wIn * 150), H = Math.round(hIn * 150), cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const im = MEDIA._el && MEDIA._el[m.src]; g.fillStyle = '#0F1530'; g.fillRect(0, 0, W, H);
  if (im) { const iw = im.naturalWidth, ih = im.naturalHeight, s = Math.max(W / iw, H / ih); g.drawImage(im, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s); }
  const R = Math.min(W, H) * 0.16; g.fillStyle = 'rgba(15,21,48,.72)'; g.beginPath(); g.arc(W / 2, H / 2, R, 0, 7); g.fill(); g.lineWidth = R * 0.12; g.strokeStyle = 'rgba(255,255,255,.9)'; g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(W / 2 - R * 0.32, H / 2 - R * 0.48); g.lineTo(W / 2 + R * 0.52, H / 2); g.lineTo(W / 2 - R * 0.32, H / 2 + R * 0.48); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, H - H * 0.14, W, H * 0.14); g.fillStyle = '#fff'; g.font = `700 ${Math.round(H * 0.07)}px ${SFONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('▶ 누르면 영상 재생', W / 2, H - H * 0.07);
  return cv.toDataURL('image/jpeg', 0.88);
}
function videoPara(key, wIn, hIn, caption) {
  const m = M(key), img = imgRun(playThumb(m, wIn, hIn), wIn * 96, hIn * 96);
  let link; try { link = new docx.ExternalHyperlink({ link: videoUrl(key), children: [img] }); } catch (e) { link = img; }
  const out = [new docx.Paragraph({ alignment: AL().CENTER, spacing: { before: 60, after: 20 }, keepNext: true, children: [link] })];
  out.push(P([R(`▶ ${caption || VIDEO_TITLE[key] || '현장 영상'}  `, { size: 16, bold: true, color: C.navy }), HLINK('영상 보기 ↗', videoUrl(key))], { align: AL().CENTER, after: 100 }));
  return out;
}
function photoPara(m, wIn, hIn) { return new docx.Paragraph({ alignment: AL().CENTER, spacing: { before: 60, after: 60 }, children: [imgRun(coverSrc(m, wIn, hIn), wIn * 96, hIn * 96)] }); }
async function makeDocx(p, onProg) {
  const f = p.f, isClient = f.mode === 'client', ch = [], on = id => p.secOn[id], mg = UI.manager || {};
  const slides = buildSlides(p), figs = {};
  const pick = slides.filter(e => e.fig && !['s00', 's01'].includes(e.fig));
  const figV = {};
  for (let i = 0; i < pick.length; i++) { onProg && onProg(i + 1, pick.length); const e = pick[i]; (figs[e.fig] = figs[e.fig] || []).push(await slideJpeg(e)); (figV[e.fig] = figV[e.fig] || []).push([...new Set(e.filter(x => x.t === 'video').map(x => x.key))]); }
  const tt = e => (e.find(x => x.t === 'text' && x.pt >= 17 && x.paras && x.paras[0] && x.paras[0].bold) || { paras: [{ text: '' }] }).paras[0].text;
  const figTitle = {}; pick.forEach(e => (figTitle[e.fig] = figTitle[e.fig] || []).push(tt(e)));
  let n = 1, figNo = 1; const S = t => H1(`${ROMAN[n++]}. ${t}`);
  const BR = () => new docx.Paragraph({ children: [new docx.PageBreak()] });
  /* 표지 */
  ch.push(P([R(isClient ? '' : '내부 검토용 · 대외비', { size: 18, bold: true, color: C.brick })], { align: AL().RIGHT, after: 120 }));
  ch.push(new docx.Paragraph({ alignment: AL().CENTER, spacing: { after: 200 }, children: [imgRun(coverSrc({ src: ASSET.hero, w: 1280, h: 720 }, 6.7, 3.9), 6.7 * 96, 3.9 * 96)] }));
  ch.push(P([R(`${CO.group}  ·  ${p.pt.n}`, { size: 22, bold: true, color: C.green })], { align: AL().CENTER, after: 80 }));
  ch.push(P([R(p.title, { size: 46, bold: true, color: C.navy })], { align: AL().CENTER, after: 120 }));
  ch.push(P([R(`${f.client}${f.site ? ' · ' + f.site : ''}`, { size: 28, color: C.ink })], { align: AL().CENTER, after: 60 }));
  ch.push(P([R(`${p.jobs.map(j => j.n).join(' · ')}${p.ind ? '  |  ' + p.ind.n : ''}`, { size: 20, color: C.gray })], { align: AL().CENTER, after: 360 }));
  ch.push(P([imgRun(ASSET.icon, 72, 72)], { align: AL().CENTER, after: 80 }));
  ch.push(P([R(fmtD(parseD(f.date) || p.made), { size: 22, color: C.gray })], { align: AL().CENTER, after: 40 }));
  ch.push(P([R(`${CO.branch || CO.name}${mg.title ? ' ' + mg.title : ''}${mg.name ? ' ' + mg.name : ''}`, { size: 24, bold: true, color: C.ink })], { align: AL().CENTER, after: 40 }));
  ch.push(P([R(`${f.to_ ? '수신: ' + f.to_ + '   ·   ' : ''}문서번호 ${p.docNo}`, { size: 17, color: C.gray })], { align: AL().CENTER, after: 0 }));
  ch.push(BR());
  /* 인사말 */
  if (on('s00')) {
    ch.push(P([R('인 사 말', { size: 34, bold: true, color: C.navy })], { align: AL().CENTER, after: 240, border: { bottom: { style: docx.BorderStyle.DOUBLE, size: 6, color: C.navy, space: 6 } } }));
    const ls = G(p, 's00').flatMap(g => g.lines);
    ls.forEach((l, i) => ch.push(P([R(l, { size: i === 0 ? 24 : 22, bold: i === 0 || i === ls.length - 1, color: i === 0 ? C.navy : C.ink })], { align: i === ls.length - 1 ? AL().RIGHT : undefined, after: 160, line: 360, indent: i && i < ls.length - 1 ? { firstLine: 300 } : undefined })));
    ch.push(new docx.Paragraph({ alignment: AL().RIGHT, children: [imgRun(state.sigDataUrl, 300, 300 * 210 / state.sigPx)] }));
    ch.push(BR());
  }
  /* 목차 */
  ch.push(P([R('목   차', { size: 34, bold: true, color: C.navy })], { align: AL().CENTER, after: 240, border: { bottom: { style: docx.BorderStyle.DOUBLE, size: 6, color: C.navy, space: 6 } } }));
  let k = 1, lastP = 0;
  SECTIONS.filter(s => on(s.id) && s.id !== 's00').forEach(s => { const pt = SEC_PART[s.id]; if (pt && pt !== lastP) { lastP = pt; const P0 = PARTS[pt - 1]; ch.push(P([R(`PART ${pt}.  ${P0.t}`, { size: 22, bold: true, color: C.green })], { indent: { left: 700 }, before: 120, after: 60 })); }
    ch.push(P([R(`${ROMAN[k++]}.  `, { size: 21, bold: true, color: C.navy }), R(s.n, { size: 21, color: C.ink })], { indent: { left: 1200 }, after: 70 })); });
  if (p.est.length) ch.push(P([R('붙임.  ', { size: 21, bold: true, color: C.green }), R('연동 견적 상세', { size: 21 })], { indent: { left: 1200 }, before: 100, after: 70 }));
  if (!isClient) ch.push(P([R('별첨.  ', { size: 21, bold: true, color: C.brick }), R('검토·승인 기록 (내부용)', { size: 21 })], { indent: { left: 1200 }, after: 70 }));
  ch.push(BR());
  /* 제안 요약 */
  const m = p.money;
  ch.push(P([R('제안 요약', { size: 30, bold: true, color: C.navy })], { after: 160 }));
  ch.push(table([[
    cell([P([R('제안 금액', { size: 18, color: C.white })], { align: AL().CENTER, after: 0 }), P([R(m.monthly ? `월 ${won(m.monthly)}원` : m.once ? `${won(m.once)}원` : '견적 연동 후', { size: 30, bold: true, color: C.white })], { align: AL().CENTER, after: 0 }), P([R('VAT 별도', { size: 16, color: 'C9D1F0' })], { align: AL().CENTER, after: 0 })], { w: 3212, fill: C.navy }),
    cell([P([R('운영 인원', { size: 18, color: C.gray })], { align: AL().CENTER, after: 0 }), P([R(p.heads ? `${p.heads}명` : '실사 후 확정', { size: 30, bold: true, color: C.green })], { align: AL().CENTER, after: 0 }), P([R(p.jobs.map(j => j.short).join('·'), { size: 16, color: C.gray })], { align: AL().CENTER, after: 0 })], { w: 3213, fill: 'EEF7F1' }),
    cell([P([R('계약기간', { size: 18, color: C.gray })], { align: AL().CENTER, after: 0 }), P([R(`${p.months}개월`, { size: 30, bold: true, color: C.navy })], { align: AL().CENTER, after: 0 }), P([R(f.from ? `${f.from} ~ ${f.to}` : '협의', { size: 16, color: C.gray })], { align: AL().CENTER, after: 0 })], { w: 3213, fill: 'F4F6FB' })]], [3212, 3213, 3213]));
  ch.push(P([R('')], { after: 80 }));
  ch.push(boxPara([P([R('□ 핵심 제안', { size: 22, bold: true, color: C.greenD })], { after: 80 })].concat(p.emph.map(x => P([R(`${EMPH[x].ic} ${EMPH[x].n}: `, { bold: true, color: C.navy }), R(EMPH[x].line, { size: 20 })], { indent: { left: 240, hanging: 200 }, after: 40 })))));
  ch.push(P([R('')], { after: 60 }));
  ch.push(photoPara(M((MEDIA_MAP[p.jobs[0].k] || MEDIA_MAP.sec).scene[0]), 6.65, 2.6));
  lastP = 0;
  for (const s of SECTIONS) {
    if (!on(s.id) || s.id === 's00') continue;
    const pt = SEC_PART[s.id];
    if (pt && pt !== lastP) { lastP = pt; const P0 = PARTS[pt - 1];
      ch.push(BR());
      ch.push(new docx.Paragraph({ alignment: AL().CENTER, spacing: { before: 200, after: 200 }, children: [imgRun(coverSrc(M(P0.scene, 'team_dio'), 6.65, 4.2), 6.65 * 96, 4.2 * 96)] }));
      ch.push(P([R(`PART ${pt}`, { size: 28, bold: true, color: C.green })], { align: AL().CENTER, after: 40 }));
      ch.push(P([R(P0.t, { size: 52, bold: true, color: C.navy })], { align: AL().CENTER, after: 60 }));
      ch.push(P([R(P0.en, { size: 22, color: C.gray, it: true })], { align: AL().CENTER, after: 200 }));
      P0.items.forEach((t, i) => ch.push(P([R(`${String(i + 1).padStart(2, '0')}  `, { size: 22, bold: true, color: C.green }), R(t, { size: 22 })], { align: AL().CENTER, after: 50 })));
      ch.push(BR()); }
    ch.push(S(s.n));
    const g = G(p, s.id);
    if (s.id === 's01') { ch.push(kvTable([['제안명', p.title, null], ['고객사', f.client, '현장', f.site || '-'], ['업종', p.ind ? p.ind.n : '-', '제안 유형', p.pt.n], ['직종', p.jobs.map(j => j.n).join(', '), '운영 인원', p.heads ? p.heads + '명' : '-'],
      ['계약기간', f.from ? `${f.from} ~ ${f.to}` : `${p.months}개월`, '제출일', fmtD(parseD(f.date) || p.made)], ['제출', `${CO.branch || CO.name} · ${f.author || ''}`, '수신', f.to_ || '-']])); ch.push(P([R('')], { after: 60 })); }
    /* 직종별 사진 + 업무 */
    if (s.id === 's06') {
      p.jobs.forEach(j => { const mm = MEDIA_MAP[j.k] || MEDIA_MAP.sec, gg = g.filter(x => x.title.includes(j.n));
        ch.push(H2(`${j.ic} ${j.n}`));
        ch.push(table([[cell([photoPara(M(mm.fig[0]), 1.7, 2.3)], { w: 2200, borders: noB() }), cell(videoPara(mm.video || mm.scene[0], 3.9, 2.19, `${VIDEO_TITLE[mm.video] || '현장 근무 영상'}`), { w: 7438, borders: noB() })]], [2200, 7438]));
        ch.push(...bullets(gg));
        const rt = ROUTINE[j.k] || ROUTINE.spc;
        ch.push(gridTable(['순서', '일과', '세부 내용'], rt.map((r, i) => [String(i + 1), r[0], r[1]]), [800, 2600, 6238], { center: [0], bold: [1], size: 17 }));
        ch.push(P([R('')], { after: 60 })); });
    } else ch.push(...secParas(g));
    if (s.id === 's03' && p.rfp && p.rfp.rows.length) {
      ch.push(H2(`제안요청 요구사항 대응표 (${p.rfp.rows.length}건)`));
      ch.push(gridTable(['No', '구분', '요구사항', '에스텍 대응 방안', '반영'], p.rfp.rows.map((x, i) => [String(i + 1), x.cat, x.req, `${SECTIONS.find(s2 => s2.id === x.sec).ic} ${x.how}`, x.st]), [500, 1100, 3700, 3538, 800], { size: 16, center: [0, 1, 4] }));
    }
    if (s.id === 's03') { ch.push(H2('예상 문제점 및 개선 방안')); const rk = (p.ind ? p.ind.risk : []).concat(['근무지 이탈·근무시간 미준수', '결원·이직', '법규 위반(업무 범위·근로조건)']); ch.push(gridTable(['예상 문제점(리스크)', '에스텍 개선 방안'], rk.map(r => [r, '예방 점검 + 즉시 대응 체계 + 재발방지 교육 — 월간 보고로 이행 확인']), [3600, 6038], { size: 17 })); }
    if (s.id === 's05' && p.staff.length) {
      ch.push(H2('직종별 편성표'));
      ch.push(gridTable(['직종', '직책', '인원', '근무형태', '근거'], p.staff.map(r => [r.job, r.title || '-', `${r.count}명`, r.shift || '-', r.src === 'site' ? '현행 운영' : r.src === 'rfp' ? 'RFP' : SRC[r.src] ? SRC[r.src].n : '-']).concat([['합계', '', `${staffTotal(p)}명`, '', '']]), [1800, 2400, 1100, 2538, 1800], { center: [2], zebra: true }));
    }
    if (s.id === 's07') { ch.push(H2('연간 교육 계획표')); ch.push(table([[th('교육', 2238)].concat([...Array(12)].map((_, i) => th(`${i + 1}`, 600)))].concat(EDU_CAL.map(r => [td(r[0], 2238, { size: 16, bold: true })].concat([...Array(12)].map((_, i) => td(r[1].includes(i + 1) ? '●' : '', 600, { align: AL().CENTER, color: C.green, fill: r[1].includes(i + 1) ? 'EEF7F1' : undefined }))))), [2238].concat(Array(12).fill(600)), { header: true })); }
    if (s.id === 's08') {
      ch.push(H2('비상 상황별 대응 체계'));
      ch.push(gridTable(['상황', '초기 대응', '보고', '후속 조치'], EMERGENCY, [1500, 3000, 2338, 2800], { size: 16, bold: [0] }));
      ch.push(H2('관계 법령 요약'));
      ch.push(table([[th('법령', 2300), th('조항', 1500), th('주요 내용', 5838)]].concat(p.laws.map(id => { const x = LAWS[id]; return [cell([P([R(x.law, { size: 18, bold: true, color: C.navy })], { after: 10 }), P([HLINK('원문 보기 ↗', lawUrl(x))], { after: 0 })], { w: 2300 }), td(`${x.art}\n${x.t}`, 1500, { size: 16, align: AL().CENTER }), td(x.s, 5838, { size: 17 })]; })), [2300, 1500, 5838], { header: true }));
    }
    if (s.id === 's09') { ch.push(H2('고객 약속(SLA)')); ch.push(gridTable(['약속', '항목', '내용'], PROMISES, [1300, 2200, 6138], { center: [0], bold: [0, 1] })); }
    if (s.id === 's10') { ch.push(H2('에스텍 통합관리 시스템 구성'));
      ch.push(table([[th('', 900), th('프로그램', 3200), th('기능', 5538)]].concat(PLATFORM.map(x => [cell([P([imgRun(ASSET.apps[x.code] || ASSET.icon, 34, 34)], { align: AL().CENTER, after: 0 })], { w: 900 }), td(`${x.ko}\n${x.n}`, 3200, { size: 17, bold: true }), td(x.d, 5538, { size: 17 })])), [900, 3200, 5538], { header: true })); }
    if (s.id === 's11') { ch.push(H2('운영 개시 일정표')); const tc = [C.navy, C.navy, C.green, C.brick, C.greenD];
      ch.push(table([[th('단계', 1100), th('일자', 1500), th('구분', 2000), th('주요 내용', 5038)]].concat(p.timeline.map((t, i) => [td(t.d, 1100, { bold: true, align: AL().CENTER, color: C.white, fill: tc[i] }), td(t.date, 1500, { align: AL().CENTER }), td(t.t, 2000, { bold: true }), td(t.a, 5038)])), [1100, 1500, 2000, 5038], { header: true })); }
    if (s.id === 's12') {
      if (p.est.length) { ch.push(H2('견적 요약표 (VAT 별도)'));
        ch.push(gridTable(['산출 프로그램', '견적', '인원', '단위', '공급가액(원)', '부가세(원)'], priceRows(p).concat(m.monthly || m.once ? [['합계', '', `${m.heads}명`, '', won((m.monthly || 0) + (m.once || 0)), won((m.vat || 0) + (m.onceVat || 0))]] : []), [1700, 2938, 900, 700, 1800, 1600], { center: [2, 3], right: [4, 5] })); }
      const wb = p.est.find(e => e.src === 'wbe' && e.tasks.some(t => t.cost != null));
      if (wb) { ch.push(H2(`업무별 비용 배분 — ${wb.title}`)); ch.push(gridTable(['업무(대분류)', '월 업무시간', '비중', '월 비용(원)'], wb.tasks.map(t => [t.name, t.hours != null ? t.hours.toFixed(1) + 'h' : '-', t.share != null ? (t.share * 100).toFixed(1) + '%' : '-', won(t.cost)]), [4038, 1800, 1500, 2300], { center: [1, 2], right: [3] })); }
    }
    /* 도해(슬라이드 이미지) */
    (figs[s.id] || []).slice(0, 4).forEach((src, i) => { ch.push(...figPara(src, `[그림 ${figNo++}] ${(figTitle[s.id] || [])[i] || s.n}`));
      const vk = ((figV[s.id] || [])[i] || []); if (vk.length) ch.push(P([R('▶ 그림 속 영상: ', { size: 16, bold: true, color: C.navy })].concat(vk.flatMap((k, j) => [HLINK(`${VIDEO_TITLE[k] || k} ↗`, videoUrl(k)), R(j < vk.length - 1 ? '  ·  ' : '', { size: 16 })])), { align: AL().CENTER, after: 120 })); });
  }
  /* 붙임: 연동 견적 상세 */
  if (p.est.length) {
    ch.push(BR()); ch.push(H1('붙임. 연동 견적 상세'));
    p.est.forEach((e, i) => {
      ch.push(H2(`${i + 1}. ${SRC[e.src].n} — ${e.title}`));
      ch.push(P([R(`${e.client || f.client}${e.period && e.period.from ? ` · ${e.period.from} ~ ${e.period.to || ''}` : ''}${e.at ? ` · 연동 ${String(e.at).slice(0, 10)}` : ''} · ${e.origin === 'raw' ? '견적 보관함' : e.origin === 'manual' ? '직접 입력' : e.origin === 'file' ? '연동 파일' : e.origin === 'excel' ? '엑셀 견적서' : '「제안서로 보내기」 연동'}`, { size: 17, color: C.gray })], { after: 60 }));
      if (e.rows.length) ch.push(gridTable(['직종', '직책', '인원', '근무형태', '1인 단가', '금액'], e.rows.map(r => [r.job, r.title || '-', r.count + '명', r.shift || (r.date ? r.date : '-'), won(r.unit), won(r.amount)]), [1300, 2400, 900, 2338, 1300, 1400], { center: [2], right: [4, 5], size: 17 }));
      if (e.staff) ch.push(P([R(`편성: ${e.staff}${e.plan ? ` (${e.plan})` : ''}`, { size: 18 })], { before: 60, after: 30 }));
      if (e.addons.length) ch.push(P([R('부대비용: ' + e.addons.map(a => `${a.n}${a.q > 1 ? ' ×' + a.q : ''}`).join(', '), { size: 18 })], { before: 60, after: 30 }));
      e.notes.forEach(t => ch.push(P([R('※ ' + t, { size: 16, color: C.gray, it: true })], { after: 20 })));
    });
  }
  if (!isClient) {
    const a = p.approval;
    ch.push(BR()); ch.push(H1('별첨. 검토·승인 기록 (내부용)'));
    ch.push(table([[th('구분', 1600), th('작성', 2679), th('검토', 2679), th('승인', 2680)], [td('성명', 1600, { align: AL().CENTER, bold: true, fill: C.silverL }), td(a.writer || '', 2679, { align: AL().CENTER }), td(a.reviewer || '', 2679, { align: AL().CENTER }), td(a.approver || '', 2680, { align: AL().CENTER })],
      [td('서명', 1600, { align: AL().CENTER, bold: true, fill: C.silverL }), td('\n\n', 2679), td('\n\n', 2679), td('\n\n', 2680)]], [1600, 2679, 2679, 2680]));
    ch.push(P([R(`진행 상태: ${STATUS[a.status].n}`, { size: 20, bold: true, color: STATUS[a.status].c })], { before: 120, after: 60 }));
    ch.push(...CHECKS.map(([kk, t]) => P([R(a.checks[kk] ? '☑ ' : '☐ ', { size: 21, color: a.checks[kk] ? C.green : C.brick }), R(t, { size: 19 })], { indent: { left: 300 }, after: 30 })));
    a.log.forEach(l => ch.push(P([R('· ' + l, { size: 17, color: C.gray })], { indent: { left: 300 }, after: 10 })));
  }
  ch.push(P([R('- 끝 -', { size: 20, bold: true })], { align: AL().CENTER, before: 240, after: 120 }));
  ch.push(P([R(`※ 법령 요약은 국가법령정보센터(law.go.kr) 기준 실무 참고용입니다. 회사 수치·실적은 내부 자료로 확인 후 사용하십시오. 사진·영상: S-Tec Media Wall  |  ${APP.name} ${APP.version} · Designed & Developed by Rat Rae Choi`, { size: 15, color: '8A93A3' })], { align: AL().CENTER }));
  return await packDocx(ch, p.title);
}

/* ===== 웹 발표본(HTML) — 영상이 실제로 재생되는 발표 파일 (브라우저로 열기 · 인터넷 없이도 재생) ===== */
async function makeHtmlDeck(p, onProg) {
  const slides = buildSlides(p), pool = [], idx = new Map(), keyOf = s => { if (!idx.has(s)) { idx.set(s, pool.length); pool.push(s); } return idx.get(s); };
  const keys = [...new Set(slides.flat().filter(e => e.t === 'video').map(e => e.key))], vids = {};
  for (let i = 0; i < keys.length; i++) { onProg && onProg(`영상 담는 중… ${i + 1}/${keys.length}`); const b = await loadVideo(keys[i]); if (b) vids[keys[i]] = b; }
  const html = slides.map((els, i) => {
    const d = slideDom(els);
    [...d.children].forEach((n, j) => { const e = els[j]; if (!e) return;
      if (e.t === 'video' && vids[e.key]) { n.innerHTML = `<video data-v="${e.key}" data-p="${keyOf(e.src)}" playsinline preload="none" controls></video>`; }
      else n.querySelectorAll('img').forEach(im => { im.setAttribute('data-i', keyOf(im.getAttribute('src'))); im.removeAttribute('src'); }); });
    return `<section class="sl" data-n="${i + 1}">${d.innerHTML}</section>`;
  }).join('\n');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const doc = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.title)} — 발표</title><meta name="generator" content="${esc(APP.name)} ${APP.version} · Designed &amp; Developed by Rat Rae Choi">
<style>html,body{margin:0;height:100%;background:#0b0f1e;overflow:hidden;font-family:${SFONT.replace(/"/g, "'")}}
#stage{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform-origin:0 0}
.sl{position:absolute;inset:0;width:1280px;height:720px;overflow:hidden;background:#fff;display:none}.sl.on{display:block}
.sl video{width:100%;height:100%;object-fit:cover;display:block;background:#000}
#bar{position:fixed;left:0;right:0;bottom:0;display:flex;gap:10px;align-items:center;justify-content:center;padding:8px;color:#cfd6ee;font-size:13px;background:linear-gradient(transparent,rgba(0,0,0,.65));opacity:0;transition:.3s}
body:hover #bar{opacity:1}#bar button{background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:8px;padding:6px 12px;font:inherit;cursor:pointer}
#grid{position:fixed;inset:0;background:#0b0f1e;overflow:auto;display:none;padding:20px;box-sizing:border-box}#grid.on{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}
#grid div{cursor:pointer;color:#cfd6ee;font-size:12px}#grid canvas,#grid img{width:100%;border-radius:6px;display:block;background:#fff}
#cr{position:fixed;right:10px;top:8px;color:rgba(255,255,255,.35);font-size:11px}</style></head><body>
<div id="stage">${html}</div>
<div id="bar"><button id="pv">◀ 이전</button><span id="pg"></span><button id="nx">다음 ▶</button><button id="gd">▦ 전체 보기</button><button id="fs">⛶ 전체 화면</button><span>← → · Space · F · G</span></div>
<div id="grid"></div><div id="cr">${esc(CO.group)} · Designed &amp; Developed by Rat Rae Choi</div>
<script>const IMG=${JSON.stringify(pool)};const VID=${JSON.stringify(vids)};
const S=[...document.querySelectorAll('.sl')],st=document.getElementById('stage');let cur=0;const vurl={};
function vsrc(k){if(!vurl[k]){const b=atob(VID[k]),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);vurl[k]=URL.createObjectURL(new Blob([u],{type:'video/mp4'}));}return vurl[k];}
function load(s){if(!s||s.dataset.l)return;s.dataset.l=1;s.querySelectorAll('img[data-i]').forEach(im=>im.src=IMG[+im.dataset.i]);s.querySelectorAll('video').forEach(v=>{v.poster=IMG[+v.dataset.p];v.src=vsrc(v.dataset.v);});}
function fit(){const k=Math.min(innerWidth/1280,innerHeight/720);st.style.transform='scale('+k+') translate(-50%,-50%)';st.style.transformOrigin='0 0';st.style.left='50%';st.style.top='50%';st.style.transform='translate(-50%,-50%) scale('+k+')';st.style.transformOrigin='center';}
function go(i){i=Math.max(0,Math.min(S.length-1,i));S[cur].classList.remove('on');S[cur].querySelectorAll('video').forEach(v=>v.pause());cur=i;const s=S[cur];load(s);load(S[cur+1]);s.classList.add('on');document.getElementById('pg').textContent=(cur+1)+' / '+S.length;
s.querySelectorAll('video').forEach(v=>{v.muted=false;const pr=v.play();if(pr)pr.catch(()=>{v.muted=true;v.play().catch(()=>{});});});history.replaceState(null,'','#'+(cur+1));}
addEventListener('keydown',e=>{if(['ArrowRight','PageDown',' ','Enter'].includes(e.key)){e.preventDefault();go(cur+1);}else if(['ArrowLeft','PageUp','Backspace'].includes(e.key)){e.preventDefault();go(cur-1);}else if(e.key==='Home')go(0);else if(e.key==='End')go(S.length-1);else if(/^[fF]$/.test(e.key))fsT();else if(/^[gG]$/.test(e.key))grid();else if(e.key==='Escape')document.getElementById('grid').classList.remove('on');});
st.addEventListener('click',e=>{if(e.target.tagName==='VIDEO')return;go(cur+(e.clientX>innerWidth/3?1:-1));});
function fsT(){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{});}
function grid(){const g=document.getElementById('grid');if(g.classList.toggle('on')&&!g.dataset.b){g.dataset.b=1;S.forEach((s,i)=>{const d=document.createElement('div');const firstImg=s.querySelector('img[data-i]');d.innerHTML='<b>'+(i+1)+'</b> '+((s.querySelector('div div div')||{}).textContent||'').slice(0,30);d.onclick=()=>{g.classList.remove('on');go(i);};g.appendChild(d);});}}
document.getElementById('pv').onclick=()=>go(cur-1);document.getElementById('nx').onclick=()=>go(cur+1);document.getElementById('gd').onclick=grid;document.getElementById('fs').onclick=fsT;
addEventListener('resize',fit);fit();go(Math.max(0,(+location.hash.slice(1)||1)-1));</script></body></html>`;
  return new Blob([doc], { type: 'text/html' });
}
function listSlides(S, p, title, sub, groups, opt = {}) {
  const w = opt.fig ? 8.9 : 12.1, pages = paginate(listParas(groups), w, 4.75, 12.5);
  pages.forEach((pg, i) => {
    const o = frameX(p, opt.part || CUR_PART, title + (pages.length > 1 ? ` (${i + 1}/${pages.length})` : ''), sub, S.length + 1);
    o.push(T(0.6, 1.55, w, 5.0, pg, { max: 15, min: 10 }));
    if (opt.fig) { o.push(Rc(9.75, 1.6, 3.0, 4.95, 'F7F8FA', { line: K.line })); o.push(figBox(opt.fig, 9.85, 1.75, 2.8, 4.1)); if (opt.cap) o.push(T(9.75, 5.95, 3.0, 0.4, opt.cap, { pt: 10.5, color: K.mute, align: 'center' })); }
    S.push(o);
  });
}
function tableSlide(S, p, title, sub, head, rows, widths, opt = {}) {
  const per = opt.per || 9;
  for (let i = 0; i < Math.max(1, rows.length); i += per) {
    const part = rows.slice(i, i + per), o = frameX(p, opt.part || CUR_PART, title + (rows.length > per ? ` (${i / per + 1}/${Math.ceil(rows.length / per)})` : ''), sub, S.length + 1);
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
    busy(true, '사진·영상 준비 중…'); await prepMedia(p, (i, n) => busy(true, `사진·영상 준비 중… ${i}/${n}`)); await decodeAll();
    if (kind === 'docx' || kind === 'all') { busy(true, 'Word 제안서 만드는 중…'); await download(await makeDocx(p, (i, n) => busy(true, `Word 도해 만드는 중… ${i}/${n}`)), base + '.docx'); }
    if (kind === 'pptx' || kind === 'all') { busy(true, 'PPT 발표자료 만드는 중…'); await download(await makePptx(p, null, p.title), base + '_발표.pptx'); }
    if (kind === 'html' || kind === 'all') { busy(true, '웹 발표본 만드는 중…'); await download(await makeHtmlDeck(p, m => busy(true, m)), base + '_발표(영상재생).html'); }
    if (kind === 'pdf' || kind === 'all') { await download(await makePdf(p, (i, n) => busy(true, `PDF 변환 중… ${i}/${n}`), null, p.title), base + '_발표.pdf'); }
    p.printed = true; p.approval.log.push(`${fmtD(kstNow())} 출력(${{ docx: 'Word', pptx: 'PPT', pdf: 'PDF', html: '웹 발표본', all: 'Word·PPT·PDF·웹 발표본' }[kind]})`); saveProject(true); renderApproval(); updStepper();
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
  $('#btnLinkXl').onclick = () => $('#xlFile').click();
  const takeXl = async files => { let ok = 0, last = null; busy(true, '견적서 읽는 중…');
    try { for (const fl of files) { try { const p = await importEstimateFile(fl); LINK.picked.add(p.id); last = p; ok++; } catch (er) { toast(`「${fl.name}」 — ${er.message}`, 6000); } }
      if (ok) { state.tab = 'manual'; await refreshLinks(false); applyPkgToForm(last); toast(`견적서 ${ok}건을 불러왔습니다 — 월 ${won(last.monthly)}원 · ${last.heads}명${last.mix ? ' · 원가 구성 포함' : ''}`, 4500); } } finally { busy(false); } };
  $('#xlFile').onchange = e => { const fs = [...e.target.files]; e.target.value = ''; if (fs.length) takeXl(fs); };
  const lc = $('#linkCard'); ['dragover', 'dragenter'].forEach(ev => lc.addEventListener(ev, e => { if ([...(e.dataTransfer.items || [])].some(i => i.kind === 'file')) { e.preventDefault(); lc.classList.add('drag'); } }));
  ['dragleave', 'drop'].forEach(ev => lc.addEventListener(ev, () => lc.classList.remove('drag')));
  lc.addEventListener('drop', e => { const fs = [...(e.dataTransfer.files || [])]; if (!fs.length) return; e.preventDefault(); const js = fs.filter(f => /\.json$/i.test(f.name)), xs = fs.filter(f => !/\.json$/i.test(f.name));
    if (js.length) { const dt = new DataTransfer(); dt.items.add(js[0]); $('#linkFile').files = dt.files; $('#linkFile').onchange({ target: $('#linkFile') }); } if (xs.length) takeXl(xs); });
  $('#btnLinkExport').onclick = () => { const ps = pickedPkgs(); if (!ps.length) return toast('내보낼 견적을 체크하세요.'); download(exportLinkFile(ps), `견적연동_${safeName($('#f_client').value || 'export')}.json`); };
  $('#btnRfp').onclick = () => runRfp(false);
  $('#btnRfpClear').onclick = () => { $('#f_rfp').value = ''; RFP.att = []; renderRfpFiles(); renderRfp(null); updStepper(); };
  $('#btnGen').onclick = () => { const p = buildPlan(); if (!p) return; if (state.plan && state.plan.approval) p.approval = state.plan.approval; state.plan = p; renderEditor(p); saveProject(true); toast('제안서 초안을 집필했습니다. 내용을 검토·수정한 뒤 승인·출력하세요.'); $('#outPanel').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  $('#btnSave').onclick = () => { syncEditor(); saveProject(false); };
  $('#btnNew').onclick = $('#heroNew').onclick = newProposal;
  $('#heroLink').onclick = () => $('#linkCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#btnDocx').onclick = () => run('docx'); $('#btnPptx').onclick = () => run('pptx'); $('#btnPdf').onclick = () => run('pdf'); $('#btnHtml').onclick = () => run('html'); $('#btnAll').onclick = () => run('all');
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
