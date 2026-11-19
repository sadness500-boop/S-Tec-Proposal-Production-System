/* =====================================================================
 * 출력 엔진 — Word(docx + stec-header-footer 머리글·바닥글) · 슬라이드 모델(PPT·PDF 동시 렌더)
 * Legal Response System · Complaint 대응 프로그램과 같은 엔진 (제안서 제작시스템용)
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const W_FONT = { ascii: '맑은 고딕', eastAsia: '맑은 고딕', hAnsi: '맑은 고딕', cs: '맑은 고딕' };
const CW = 9638; // A4 본문폭(twips)
function R(text, o = {}) { return new docx.TextRun({ text, font: W_FONT, size: o.size || 20, bold: o.bold, color: o.color || C.ink, italics: o.it, underline: o.u ? {} : undefined }); }
function P(children, o = {}) {
  return new docx.Paragraph({ children: Array.isArray(children) ? children : [children], alignment: o.align, spacing: { before: o.before ?? 0, after: o.after ?? 60, line: o.line || 288 },
    indent: o.indent, keepNext: o.keepNext, border: o.border, shading: o.shading });
}
function HLINK(text, url, o = {}) { try { return new docx.ExternalHyperlink({ link: url, children: [R(text, { size: o.size || 16, color: '1F4FBF', u: true })] }); } catch (e) { return R(text, { size: o.size || 16, color: '1F4FBF' }); } }
function noB() { const n = { style: docx.BorderStyle.NONE, size: 0, color: 'FFFFFF' }; return { top: n, bottom: n, left: n, right: n }; }
function bAll(color = 'B8C0CC', size = 4) { const b = { style: docx.BorderStyle.SINGLE, size, color }; return { top: b, bottom: b, left: b, right: b }; }
function cell(paras, o = {}) {
  return new docx.TableCell({ children: paras, width: { size: o.w, type: docx.WidthType.DXA }, columnSpan: o.span, verticalAlign: o.va || docx.VerticalAlign.CENTER,
    shading: o.fill ? { fill: o.fill, type: docx.ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, borders: o.borders || bAll() });
}
function table(rows, widths, o = {}) {
  return new docx.Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: docx.WidthType.DXA }, columnWidths: widths, rows: rows.map((r, i) => new docx.TableRow({ cantSplit: true, tableHeader: o.header && i === 0, children: r })) });
}
function H1(t) {
  return P([R(t, { size: 26, bold: true, color: C.navy })], { before: 280, after: 120, keepNext: true,
    border: { left: { style: docx.BorderStyle.SINGLE, size: 36, color: C.green, space: 8 }, bottom: { style: docx.BorderStyle.SINGLE, size: 6, color: 'B8C0CC', space: 3 } } });
}
function H2(t) { return P([R('▶ ', { size: 21, bold: true, color: C.green }), R(t, { size: 21, bold: true, color: C.greenD })], { before: 160, after: 60, keepNext: true }); }
function bullets(groups, o = {}) {
  const out = [];
  groups.forEach(g => {
    if (g.title) out.push(P([R('■ ', { size: 20, color: C.navy, bold: true }), R(g.title, { size: 20, bold: true, color: C.navy })], { before: 80, after: 40, keepNext: true }));
    g.lines.forEach(l => out.push(P([R(o.mark || '○ ', { size: 20, color: C.green }), R(l, { size: 20 })], { indent: { left: 400, hanging: 260 }, after: 40 })));
  });
  return out;
}
function imgPara(src, wIn, caption, dims) {
  const d = dims || [16, 9], h = wIn * d[1] / d[0];
  const out = [new docx.Paragraph({ alignment: docx.AlignmentType.CENTER, spacing: { before: 80, after: 30 }, keepNext: !!caption,
    children: [new docx.ImageRun({ type: 'jpg', data: b64ToU8(dataUrlB64(src)), transformation: { width: Math.round(wIn * 96), height: Math.round(h * 96) } })] })];
  if (caption) out.push(P([R(caption, { size: 16, color: C.gray, it: true })], { align: docx.AlignmentType.CENTER, after: 100 }));
  return out;
}
function boxPara(paras, fill = 'F2F7F3', color = C.green) {
  const b = { style: docx.BorderStyle.SINGLE, size: 12, color };
  return table([[cell(paras, { w: CW, fill, borders: { top: b, bottom: b, left: b, right: b } })]], [CW]);
}
function th(t, w) { return cell([P([R(t, { bold: true, color: C.white, size: 19 })], { align: docx.AlignmentType.CENTER, after: 0 })], { w, fill: C.navy }); }
function td(t, w, o = {}) { const ls = String(t).split('\n'); return cell(ls.map(x => P([R(x, { size: o.size || 19, bold: o.bold, color: o.color })], { align: o.align, after: 0 })), { w, fill: o.fill, va: o.va }); }

async function ooxmlPack(zip, mime, pptx) {
  const out = new JSZip(), names = Object.keys(zip.files).filter(n => !zip.files[n].dir);
  names.sort((a, b) => (a === '[Content_Types].xml' ? -1 : b === '[Content_Types].xml' ? 1 : a.startsWith('_rels/') ? -1 : b.startsWith('_rels/') ? 1 : 0));
  for (const n of names) {
    if (pptx && /^ppt\/slides\/slide\d+\.xml$/.test(n)) {
      let x = await zip.file(n).async('string'), id = 0; const vids = [];
      x = x.replace(/<p:cNvPr id="\d+"([^>]*)>(<a:hlinkClick r:id="" action="ppaction:\/\/media"\/>)?/g, (m, rest, media) => { id++; if (media) vids.push(id); return `<p:cNvPr id="${id}"${rest}>${media || ''}`; });
      if (vids.length && !x.includes('<p:timing>')) {
        let t = 2; const nodes = vids.map(v => `<p:video><p:cMediaNode vol="80000"><p:cTn id="${t++}" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${v}"/></p:tgtEl></p:cMediaNode></p:video>`).join('');
        const tm = `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>${nodes}</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
        x = x.replace(/(<\/p:clrMapOvr>|<\/p:cSld>)(?![\s\S]*<\/p:clrMapOvr>)/, '$1' + tm);
      }
      out.file(n, x, { createFolders: false });
    } else out.file(n, await zip.file(n).async('uint8array'), { createFolders: false });
  }
  return await out.generateAsync({ type: 'blob', mimeType: mime, compression: 'DEFLATE' });
}
/* 붙임: 고객사 접수 원문(공문·메일·카톡·사진) — 📎 불러오기로 올린 파일 */
async function packDocx(ch, title) {
  const doc = new docx.Document({
    creator: APP.maker, title, description: `${APP.name} ${APP.version}`,
    styles: { default: { document: { run: { font: W_FONT, size: 20 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1850, bottom: 1831, left: 1134, right: 1134, header: 1020, footer: 973 } } }, children: ch }]
  });
  const blob = await docx.Packer.toBlob(doc);
  return await applyHeaderFooter(blob);
}

/* stec-header-footer 스킬(apply_header_footer.py)과 동일한 주입 로직 — JS 이식판 */
async function applyHeaderFooter(blob) {
  const zip = await JSZip.loadAsync(blob);
  const EMU_PER_PX = 2520000 / 1860; // 원본 서명 1860px = 2520000 EMU
  const cx = Math.round(state.sigPx * EMU_PER_PX);
  let ftr = HF_FOOTER_XML.replace(/cx="2520000"/g, `cx="${cx}"`);
  zip.file('word/stecHeader.xml', HF_HEADER_XML);
  zip.file('word/stecFooter.xml', ftr);
  zip.file('word/media/stec-header-thebestchoice.png', b64ToU8(dataUrlB64(ASSET.headerTbc)));
  zip.file('word/media/stec-footer-signature.png', b64ToU8(dataUrlB64(state.sigDataUrl)));
  const rel = (id, t) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${t}"/></Relationships>`;
  zip.file('word/_rels/stecHeader.xml.rels', rel('rId1', 'media/stec-header-thebestchoice.png'));
  zip.file('word/_rels/stecFooter.xml.rels', rel('rId2', 'media/stec-footer-signature.png'));
  let ct = await zip.file('[Content_Types].xml').async('string');
  if (!/Extension="png"/i.test(ct)) ct = ct.replace(/(<Types[^>]*>)/, '$1<Default Extension="png" ContentType="image/png"/>');
  [['stecHeader.xml', 'header'], ['stecFooter.xml', 'footer']].forEach(([pt, k]) => { const ov = `<Override PartName="/word/${pt}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.${k}+xml"/>`; if (!ct.includes(ov)) ct = ct.replace('</Types>', ov + '</Types>'); });
  zip.file('[Content_Types].xml', ct);
  let rl = await zip.file('word/_rels/document.xml.rels').async('string');
  rl = rl.replace('</Relationships>', '<Relationship Id="rIdStecHdr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="stecHeader.xml"/><Relationship Id="rIdStecFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="stecFooter.xml"/></Relationships>');
  zip.file('word/_rels/document.xml.rels', rl);
  let d = await zip.file('word/document.xml').async('string');
  const refs = ['default', 'first', 'even'].map(t => `<w:headerReference w:type="${t}" r:id="rIdStecHdr"/><w:footerReference w:type="${t}" r:id="rIdStecFtr"/>`).join('');
  d = d.replace(/<w:sectPr[^>]*>[\s\S]*?<\/w:sectPr>|<w:sectPr[^>]*\/>/g, s => {
    s = s.replace(/<w:(header|footer)Reference[^>]*\/>/g, '');
    if (/\/>$/.test(s) && !/<\/w:sectPr>/.test(s)) s = s.replace(/\/>$/, '>') + '</w:sectPr>';
    return s.replace(/(<w:sectPr[^>]*>)/, '$1' + refs);
  });
  if (!/xmlns:r=/.test(d.slice(0, 2000))) d = d.replace('<w:document ', '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ');
  zip.file('word/document.xml', d);
  return await ooxmlPack(zip, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
}

/* ===== 슬라이드 모델 — 하나의 모델을 PPT(pptxgenjs)와 PDF(html2canvas)로 동시 렌더 · 13.333 × 7.5 in (16:9), 96 px/in ===== */
const SW = 13.333, SH = 7.5, DPI = 96, PT = 96 / 72;
const SFONT = "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR','Noto Sans CJK KR',sans-serif";
const MCTX = document.createElement('canvas').getContext('2d');
function wrapCount(text, px, maxW, bold) {
  MCTX.font = `${bold ? '700 ' : '400 '}${px}px ${SFONT}`;
  let n = 0;
  String(text).split('\n').forEach(seg => {
    const words = seg.split(/(\s+)/); let line = ''; n++;
    words.forEach(w => {
      const t = line + w;
      if (MCTX.measureText(t).width <= maxW || !line.trim()) {
        if (MCTX.measureText(t).width > maxW) { // 긴 단어 글자 단위 분할
          let cur = line; for (const ch of w) { if (MCTX.measureText(cur + ch).width > maxW && cur) { n++; cur = ch; } else cur += ch; } line = cur;
        } else line = t;
      } else { n++; line = w.trimStart(); }
    });
  });
  return n;
}
/* paras: [{text,bold,color,size(배수),indent(in)}] */
function fit(paras, w, h, maxPt, minPt = 9, lh = 1.22, gapPt = 3) {
  for (let pt = maxPt; pt >= minPt; pt -= 0.5) {
    let H = 0;
    paras.forEach((p, i) => { const s = pt * (p.size || 1); const n = wrapCount(p.text, s * PT, (w - (p.indent || 0)) * DPI * 0.93, p.bold); H += n * s * PT * lh + (i < paras.length - 1 ? (p.gap ?? gapPt) * PT : 0); });
    if (H <= h * DPI * 0.97) return { pt, ok: true };
  }
  return { pt: minPt, ok: false };
}
function T(x, y, w, h, paras, o = {}) {
  if (typeof paras === 'string') paras = [{ text: paras }];
  const r = o.pt ? { pt: o.pt, ok: true } : fit(paras, w, h, o.max || 16, o.min || 9, o.lh || 1.22, o.gap ?? 3);
  return { t: 'text', x, y, w, h, paras, pt: r.pt, ok: r.ok, color: o.color || C.ink, bold: o.bold, align: o.align || 'left', valign: o.valign || 'top', lh: o.lh || 1.22, gap: o.gap ?? 3, font: o.font };
}
const Rc = (x, y, w, h, fill, o = {}) => ({ t: 'shape', k: o.k || 'rect', x, y, w, h, fill, line: o.line, lw: o.lw, alpha: o.alpha });
const Im = (x, y, w, h, src) => ({ t: 'img', x, y, w, h, src });

function gradient(w, h, stops, dir = 'h') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  const gr = dir === 'h' ? g.createLinearGradient(0, 0, w, 0) : dir === 'd' ? g.createLinearGradient(0, 0, w, h) : g.createLinearGradient(0, 0, 0, h);
  stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); return cv.toDataURL('image/png');
}
let GRADS = null;
function grads() {
  if (GRADS) return GRADS;
  GRADS = {
    navy: gradient(640, 360, [[0, '#0E2AA8'], [0.55, '#0B1F8F'], [1, '#050C3E']], 'd'),
    silver: gradient(400, 40, [[0, '#F7F8FA'], [0.5, '#E3E7EC'], [1, '#C9CED6']], 'h'),
    silverV: gradient(40, 400, [[0, '#FFFFFF'], [0.6, '#F1F3F6'], [1, '#DDE2E8']], 'v'),
    green: gradient(400, 40, [[0, '#2BA24A'], [1, '#17552F']], 'h'),
    fade: gradient(600, 20, [[0, 'rgba(30,139,58,1)'], [1, 'rgba(30,139,58,0)']], 'h'),
    fadeN: gradient(600, 20, [[0, 'rgba(11,31,143,1)'], [1, 'rgba(11,31,143,0)']], 'h')
  };
  return GRADS;
}

/* 공통 프레임: 상단 제목바 + 하단 바 */
/* ---------- 현장 사진·영상 (★ Project Resources) ---------- */
function figName(kind, key) { const alt = { grd: 'sec', spc: 'fac', san: 'fac' }; return ASSET.fig[kind + '_' + key] ? kind + '_' + key : kind + '_' + (alt[key] || 'sec'); }
function figBox(name, x, y, maxW, maxH, align) {
  const d = ASSET.figDim[name] || [600, 760]; const r = Math.min(maxW / d[0], maxH / d[1]); const w = d[0] * r, h = d[1] * r;
  return Im(align === 'left' ? x : x + (maxW - w) / 2, y + (maxH - h) / 2, w, h, ASSET.fig[name]);
}
function frame(title, sub, no, p, foot) {
  const E = [];
  E.push(Rc(0, 0, SW, SH, C.white));
  E.push(Rc(0, 0, 0.12, SH, K.ink));                       // 좌측 얇은 세로 띠
  E.push(Rc(0.12, 0, 0.05, SH, C.green));
  [0, 1, 2].forEach(i => E.push(Rc(0.62 - i * 0.05, 0.42 + i * 0.13, 0.42 + i * 0.04, 0.08, i === 1 ? K.grn2 : C.green, { k: 'para' })));
  E.push(T(1.3, 0.3, 9.4, 0.6, [{ text: title, bold: true }], { pt: 24, color: K.ink, valign: 'middle' }));
  if (sub) E.push(T(1.3, 0.86, 9.6, 0.3, sub, { pt: 11.5, color: K.mute }));
  E.push(Im(SW - 1.95, 0.36, 1.45, 1.45 * 340 / 900, ASSET.logo));
  E.push(Rc(0.6, 1.3, 1.1, 0.04, C.green));
  E.push(Rc(1.7, 1.315, SW - 2.2, 0.012, K.line));
  // 하단: 가는 선 + 회색 문구 + 쪽번호
  E.push(Rc(0.6, SH - 0.48, SW - 1.1, 0.012, K.line));
  E.push(T(0.6, SH - 0.44, 8.5, 0.32, foot || `${APP.org} · ${p.f.client} ${docTitle(p)}`, { pt: 9.5, color: '8A93A3', valign: 'middle' }));
  E.push(Rc(SW - 0.95, SH - 0.36, 0.1, 0.1, C.green));
  E.push(T(SW - 0.82, SH - 0.44, 0.4, 0.32, String(no).padStart(2, '0'), { pt: 11, color: K.ink, bold: true, valign: 'middle' }));
  return E;
}
/* 세련된 표지(공통) */
function closingSlide(o) {
  const e = [];
  e.push(Rc(0, 0, SW, SH, C.white));
  e.push(Rc(0, SH - 1.15, SW, 1.15, 'F3F5F8'));
  e.push(Rc(0, 0, 0.12, SH, K.ink)); e.push(Rc(0.12, 0, 0.05, SH, C.green));
  e.push(Im(0.75, 0.55, 1.75, 1.75 * 340 / 900, ASSET.logo));
  e.push(figBox(o.fig || 'team', SW / 2 - 2.6, 0.75, 5.2, 3.3));
  e.push(T(1, 4.15, SW - 2, 0.6, [{ text: 'The Best Choice, S-Tec', bold: true }], { pt: 28, color: K.ink, align: 'center' }));
  e.push(T(1, 4.75, SW - 2, 0.42, o.tag, { pt: 13.5, color: K.mute, align: 'center' }));
  e.push(Rc(SW / 2 - 0.6, 5.3, 1.2, 0.04, C.green));
  e.push(T(1, 5.4, SW - 2, 0.36, o.org, { pt: 11, color: K.mute, align: 'center' }));
  e.push(Im(0.85, SH - 0.88, 1.5, 1.5 * 53 / 127, ASSET.sanitec));
  e.push(sigEl(SW - 4.25, SH - 0.7, 0.4));
  return e;
}
function sigEl(x, y, h) { return Im(x, y, h * state.sigPx / 210, h, state.sigDataUrl); }
function listParas(groups, o = {}) {
  const out = [];
  groups.forEach((g, gi) => {
    if (g.title) out.push({ text: g.title, bold: true, color: o.hcolor || C.navy, gap: 2 });
    g.lines.forEach((l, i) => out.push({ text: `•  ${l}`, indent: 0, color: C.ink, gap: (i === g.lines.length - 1 && gi < groups.length - 1) ? 7 : 3 }));
  });
  return out;
}
/* 문단을 여러 장으로 분할 */
function paginate(paras, w, h, minPt = 12) {
  const pages = []; let cur = [];
  paras.forEach(p => { const test = cur.concat([p]); if (cur.length && !fit(test, w, h, minPt, minPt).ok) { pages.push(cur); cur = p.bold ? [p] : [p]; } else cur = test; });
  if (cur.length) pages.push(cur);
  return pages;
}

async function makePptx(p, slidesIn, titleIn) {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; pptx.author = APP.maker; pptx.company = APP.org; pptx.title = titleIn || docTitle(p);
  const SHP = { rect: pptx.ShapeType.rect, para: pptx.ShapeType.parallelogram, chevron: pptx.ShapeType.chevron, homePlate: pptx.ShapeType.homePlate, ellipse: pptx.ShapeType.ellipse };
  const slides = slidesIn || buildSlides(p);
  const vids = {}, covers = {};
  for (const el of slides.flat()) if (el.t === 'video' && !(el.key in vids)) { vids[el.key] = await fetchVideo(el.key); covers[el.key] = await toPng(el.src); }
  slides.forEach(els => {
    const s = pptx.addSlide();
    els.forEach(e => {
      if (e.t === 'img') s.addImage({ data: e.src, x: e.x, y: e.y, w: e.w, h: e.h });
      else if (e.t === 'video') {
        if (vids[e.key]) s.addMedia({ type: 'video', data: 'video/mp4;base64,' + vids[e.key], cover: covers[e.key], x: e.x, y: e.y, w: e.w, h: e.h, extn: 'mp4' });
        else { s.addImage({ data: e.src, x: e.x, y: e.y, w: e.w, h: e.h }); s.addText('영상은 웹 주소·앱에서 만들면 PPT에 함께 들어갑니다', { x: e.x, y: e.y + e.h - 0.45, w: e.w, h: 0.4, fontSize: 11, color: 'FFFFFF', fill: { color: '000000', transparency: 45 }, align: 'center', fontFace: '맑은 고딕' }); }
      }
      else if (e.t === 'shape') s.addShape(SHP[e.k], { x: e.x, y: e.y, w: e.w, h: e.h, fill: { color: e.fill }, line: e.line ? { color: e.line, width: e.lw || 0.75 } : { type: 'none' } });
      else if (e.t === 'text') {
        const runs = e.paras.map((q, i) => ({ text: q.text, options: { bold: q.bold ?? e.bold, color: q.color || e.color, fontSize: +(e.pt * (q.size || 1)).toFixed(1), breakLine: i < e.paras.length - 1, paraSpaceAfter: i < e.paras.length - 1 ? (q.gap ?? e.gap) : 0 } }));
        s.addText(runs, { x: e.x, y: e.y, w: e.w, h: e.h, fontFace: '맑은 고딕', fontSize: e.pt, color: e.color, align: e.align, valign: e.valign, margin: 0, lineSpacingMultiple: e.lh, wrap: true, fit: 'none' });
      }
    });
  });
  return await ooxmlPack(await JSZip.loadAsync(await pptx.write({ outputType: 'blob' })), 'application/vnd.openxmlformats-officedocument.presentationml.presentation', true);
}

/* ---------- PDF 렌더 (같은 슬라이드 모델 → HTML → 이미지 → PDF) ---------- */
function slideDom(els) {
  const d = document.createElement('div'); d.className = 'slide';
  els.forEach(e => {
    const n = document.createElement('div'); n.style.cssText = `position:absolute;left:${e.x * DPI}px;top:${e.y * DPI}px;width:${e.w * DPI}px;height:${e.h * DPI}px;`;
    if (e.t === 'img' || e.t === 'video') { const im = document.createElement('img'); im.src = e.src; im.style.cssText = 'width:100%;height:100%;display:block;object-fit:cover'; n.appendChild(im);
      if (e.t === 'video') { const pl = document.createElement('div'); pl.style.cssText = 'position:absolute;left:50%;top:50%;width:92px;height:92px;margin:-46px 0 0 -46px;border-radius:50%;background:rgba(15,21,48,.72);box-shadow:0 0 0 4px rgba(255,255,255,.85)'; pl.innerHTML = '<div style="position:absolute;left:36px;top:26px;width:0;height:0;border-left:30px solid #fff;border-top:20px solid transparent;border-bottom:20px solid transparent"></div>'; n.appendChild(pl); } }
    else if (e.t === 'shape') {
      n.style.background = '#' + e.fill; if (e.line) n.style.boxShadow = `inset 0 0 0 1px #${e.line}`;
      const o = Math.min(e.w, e.h) * DPI, W = e.w * DPI;
      if (e.k === 'para') n.style.clipPath = `polygon(${o * 0.25}px 0,100% 0,${W - o * 0.25}px 100%,0 100%)`;
      if (e.k === 'chevron') n.style.clipPath = `polygon(0 0,${W - o * 0.5}px 0,100% 50%,${W - o * 0.5}px 100%,0 100%,${o * 0.5}px 50%)`;
      if (e.k === 'homePlate') n.style.clipPath = `polygon(0 0,${W - o * 0.5}px 0,100% 50%,${W - o * 0.5}px 100%,0 100%)`;
      if (e.k === 'ellipse') n.style.borderRadius = '50%';
    } else {
      n.style.display = 'flex'; n.style.flexDirection = 'column'; n.style.justifyContent = { top: 'flex-start', middle: 'center', bottom: 'flex-end' }[e.valign];
      n.style.textAlign = e.align; n.style.fontFamily = SFONT; n.style.wordBreak = 'keep-all'; n.style.overflowWrap = 'anywhere';
      e.paras.forEach((q, i) => {
        const pdv = document.createElement('div'); pdv.textContent = q.text;
        pdv.style.cssText = `font-size:${e.pt * (q.size || 1) * PT}px;line-height:${e.lh};color:#${q.color || e.color};font-weight:${(q.bold ?? e.bold) ? 700 : 400};margin-bottom:${i < e.paras.length - 1 ? (q.gap ?? e.gap) * PT : 0}px;white-space:pre-wrap`;
        n.appendChild(pdv);
      });
    }
    d.appendChild(n);
  });
  return d;
}
async function makePdf(p, onProgress, slidesIn, titleIn) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: [SW, SH], compress: true });
  const host = $('#render'); host.innerHTML = '';
  const slides = slidesIn || buildSlides(p);
  for (let i = 0; i < slides.length; i++) {
    onProgress && onProgress(i + 1, slides.length);
    const d = slideDom(slides[i]); host.innerHTML = ''; host.appendChild(d);
    await Promise.all([...d.querySelectorAll('img')].map(im => im.decode ? im.decode().catch(() => { }) : null));
    const cv = await html2canvas(d, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true });
    if (i) pdf.addPage([SW, SH], 'landscape');
    pdf.addImage(cv.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, SW, SH);
  }
  host.innerHTML = '';
  pdf.setProperties({ title: titleIn || docTitle(p), author: APP.maker, creator: `${APP.name} ${APP.version}` });
  return pdf.output('blob');
}
