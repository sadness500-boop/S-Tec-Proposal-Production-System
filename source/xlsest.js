/* =====================================================================
 * 엑셀·PDF 견적서 불러오기 — 사용자가 엑셀로 만든 견적서(.xlsx·.xls·.xlsm·.csv)나
 * 그 PDF 출력본에서 고객사·용역기간·월 견적금액·투입 인력·단가·원가 구성을 읽어
 * 제안서 연동 견적(normPkg 형식)으로 만듭니다. 모든 처리는 이 기기 안에서만 합니다.
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const XL_EXT = /\.(xlsx|xlsm|xls|xlsb|ods|csv)$/i;
async function xlsxLib() { if (!window.XLSX) await loadScriptOnce(libUrl('lib/xlsx/xlsx.full.min.js')); return window.XLSX; }

/* ---------- 공통 도우미 ---------- */
const xS = v => String(v ?? '').replace(/ /g, ' ').trim();
const xK = v => xS(v).replace(/\s+/g, '');
function xN(v) {
  if (typeof v === 'number' && isFinite(v)) return v;
  const s = xS(v).replace(/[₩원명,\s]/g, '').replace(/^\((.*)\)$/, '-$1');
  if (/^[+\-]?\d+(\.\d+)?$/.test(s)) return +s;
  const m = /^([+\-]?\d{1,3}(?:,\d{3})+)\s+\S/.exec(xS(v)); return m ? +m[1].replace(/,/g, '') : null;   // PDF에서 이웃 칸과 붙은 경우
}
/* 시트 = { name, rows: [[{v, x, w}]] } — 엑셀은 x=열 번호, PDF는 x=좌표 */
function gridFromAoa(name, aoa) { return { name, rows: aoa.map(r => (r || []).map((v, i) => ({ v, x: i, w: 1 })).filter(c => xS(c.v) !== '')) }; }
const rowText = r => r.map(c => xS(c.v)).join(' ');
const cx = c => c.x + (c.w || 1) / 2;
function nearest(cols, c) { let best = null, d = 1e9; cols.forEach(h => { const dd = Math.abs(cx(h) - cx(c)); if (dd < d) { d = dd; best = h; } }); return best; }

/* ---------- 파일 → 시트 ---------- */
async function sheetsFromFile(file) {
  if (XL_EXT.test(file.name)) {
    const X = await xlsxLib(), wb = X.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', cellDates: false });
    return wb.SheetNames.map(n => gridFromAoa(n, X.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '', blankrows: true })));
  }
  if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
    const pdfjs = await pdfLib(), doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: libUrl('lib/pdf/cmaps/'), cMapPacked: true }).promise;
    const out = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const pg = await doc.getPage(i), tc = await pg.getTextContent();
      const it = tc.items.filter(t => t.str && t.str.trim()).map(t => ({ s: t.str, x: t.transform[4], y: t.transform[5], w: t.width || t.str.length * 5, f: Math.abs(t.transform[3]) || 9 }));
      it.sort((a, b) => b.y - a.y || a.x - b.x);
      const lines = []; it.forEach(t => { const L = lines.find(l => Math.abs(l.y - t.y) < Math.max(2.5, t.f * 0.35)); L ? L.items.push(t) : lines.push({ y: t.y, items: [t] }); });
      const rows = lines.sort((a, b) => b.y - a.y).map(l => { const s = l.items.sort((a, b) => a.x - b.x), cells = [];
        s.forEach(t => { const c = cells[cells.length - 1]; if (c && t.x - (c.x + c.w) < t.f * 1.6) { c.v += (t.x - (c.x + c.w) > t.f * 0.2 ? ' ' : '') + t.s; c.w = t.x + t.w - c.x; } else cells.push({ v: t.s, x: t.x, w: t.w }); });
        return cells; });
      out.push({ name: 'p' + i, rows });
    }
    return out;
  }
  throw new Error('엑셀(.xlsx·.xls·.csv) 또는 PDF 견적서만 읽을 수 있습니다.');
}

/* ---------- 항목(라벨 → 값) ---------- */
function labelVal(sheets, re) {
  for (const sh of sheets) for (const r of sh.rows) for (let i = 0; i < r.length; i++) {
    const k = xK(r[i].v);
    if (re.test(k)) { const rest = r.slice(i + 1).map(c => xS(c.v)).filter(Boolean); if (rest.length) return rest.join(' '); const m = xS(r[i].v).replace(/^[^\s:：]+[\s:：]+/, ''); if (m && m !== xS(r[i].v)) return m; }
  }
  return '';
}
function allText(sheets) { return sheets.map(sh => sh.rows.map(rowText).join('\n')).join('\n'); }
function parsePeriod(t) {
  const m = /(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?\s*[~∼\-–]\s*(\d{4})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})/.exec(t || '');
  if (!m) return null; const p2 = n => String(n).padStart(2, '0');
  const mm = /\((\d+)\s*개월\)/.exec(t);
  return { from: `${m[1]}-${p2(m[2])}-${p2(m[3])}`, to: `${m[4]}-${p2(m[5])}-${p2(m[6])}`, months: mm ? +mm[1] : null };
}
function cleanClient(s) { return xS(s).replace(/(貴中|귀중|御中|귀하)\s*$/, '').replace(/\s*원가\s*분석\S*\s*(\d{4})?.*$/, '').replace(/\s*(견적서|見積書)\s*$/, '').trim(); }

/* ---------- 견적 내역표 (직종·인원·단가) ---------- */
function findQuoteTable(sheets) {
  for (const sh of sheets) for (let ri = 0; ri < sh.rows.length; ri++) {
    const hdr = sh.rows[ri], ks = hdr.map(c => xK(c.v));
    if (!(ks.some(k => /^직종|직종$|^직무$/.test(k)) && ks.some(k => /^인원/.test(k)))) continue;
    const col = re => hdr.filter((c, i) => re.test(ks[i]));
    const H = { job: col(/^직종|^직무$/)[0], title: col(/^직책|^직급|^구분$/)[0], place: col(/근무지|업무내용|담당업무/)[0], shift: col(/운영형태|근무형태|근무제|교대/)[0], count: col(/^인원/)[0],
      unit: col(/단가|1인|인당/), amount: col(/월합계|^금액|월금액|합계금액|^합계$/), note: col(/^비고/)[0] };
    const heads = hdr; const out = [], meta = {};
    for (let j = ri + 1; j < Math.min(sh.rows.length, ri + 60); j++) {
      const r = sh.rows[j], t = xK(rowText(r)); if (!r.length) { if (out.length) break; continue; }
      const at = h => { if (!h) return null; const hit = r.filter(c => nearest(heads, c) === h); return hit.length ? hit.map(c => c.v) : null; };
      const one = h => { const a = at(h); return a ? a.map(xS).join(' ') : ''; };
      const numAt = h => { const a = at(h); if (!a) return null; for (const v of a) { const n = xN(v); if (n != null) return n; } return null; };
      if (/^(월)?합계|^소계|^계$|^총계/.test(t) || /월합계/.test(t)) { meta.sum = numAt(H.amount[H.amount.length - 1]) ?? Math.max(...r.map(c => xN(c.v) || 0)); meta.sumPrev = H.unit.length > 1 ? numAt(H.unit[0]) : null; continue; }
      if (/부가가치세|부가세/.test(t)) { meta.vat = Math.max(...r.map(c => xN(c.v) || 0)) || null; continue; }
      if (/VAT포함|총계/.test(t)) { meta.withVat = Math.max(...r.map(c => xN(c.v) || 0)) || null; continue; }
      if (/계약기간총액|연간|총액/.test(t)) { meta.yearly = Math.max(...r.map(c => xN(c.v) || 0)) || null; continue; }
      const cnt = numAt(H.count), job = one(H.job), title = one(H.title);
      if (cnt == null || cnt <= 0 || cnt > 500 || !(job || title) || /^\d+$/.test(job + title)) { if (out.length && !/^[■□○※]/.test(t)) continue; if (out.length) break; continue; }
      const uLast = H.unit.length ? numAt(H.unit[H.unit.length - 1]) : null, uPrev = H.unit.length > 1 ? numAt(H.unit[0]) : null;
      const amt = H.amount.length ? numAt(H.amount[H.amount.length - 1]) : null;
      out.push({ job, title: [title, one(H.place)].filter(Boolean).join(' · ').replace(/^(.+) · \1/, '$1'), count: cnt, shift: one(H.shift), unit: uLast ?? (amt != null ? Math.round(amt / cnt) : null), amount: amt ?? (uLast != null ? uLast * cnt : null), prev: uPrev, note: one(H.note) });
    }
    if (out.length) { const yrs = H.unit.map(h => (/(20\d\d)/.exec(xS(h.v)) || [])[1]).filter(Boolean); return { rows: out, meta, years: yrs, sheet: sh.name }; }
  }
  return null;
}

/* ---------- 원가분석표 (직책별 열 · 12. 계) ---------- */
function findCostSheets(sheets) {
  const res = [];
  for (const sh of sheets) {
    const R = sh.rows, find = re => R.findIndex(r => r.length && re.test(xK(r[0].v) + '|' + xK(rowText(r.slice(0, 2)))));
    const iN = R.findIndex(r => r.length && /^인원/.test(xK(r[0].v)) && r.some(c => /\d+\s*명/.test(xS(c.v))));
    const iT = R.findIndex(r => r.length && /^12\.?.*계|^(합계|총계)\(?VAT/.test(xK(rowText(r.slice(0, 2)))));
    if (iN < 0 || iT < 0) continue;
    const nCells = R[iN].filter(c => /\d+\s*명/.test(xS(c.v)));
    const iH = R.slice(0, iN).map((r, i) => [r, i]).filter(([r]) => r.some(c => /^구분/.test(xK(c.v)))).map(x => x[1]).pop() ?? Math.max(0, iN - 2);
    const valAt = (ri, ref) => { if (ri < 0) return null; const r = R[ri]; let best = null, d = 1e9; r.forEach(c => { const n = xN(c.v); if (n == null) return; const dd = Math.abs(cx(c) - cx(ref)); if (dd < d) { d = dd; best = n; } }); return d <= (sh.name.startsWith('p') ? 40 : 0.6) ? best : null; };
    const cols = nCells.map(c => ({ c, count: +(/(\d+)\s*명/.exec(xS(c.v))[1]), title: R.slice(iH, iN).map(r => r.filter(h => Math.abs(cx(h) - cx(c)) <= (sh.name.startsWith('p') ? 30 : 0.6) && !/^구분|^항목/.test(xK(h.v))).map(h => xS(h.v)).join(' ')).filter(Boolean).join(' ').trim() }));
    const units = cols.map(o => valAt(iT, o.c));
    if (units.some(u => u == null)) continue;
    const pdfMode = sh.name.startsWith('p'), xs = nCells.map(cx).sort((a, b) => a - b), posMax = xs[xs.length - 1], gap = xs.length > 1 ? (posMax - xs[0]) / (xs.length - 1) : (pdfMode ? 70 : 1);
    const rightOf = ri => { if (ri < 0) return null; const c = R[ri].filter(c => xN(c.v) != null && cx(c) > posMax + (pdfMode ? gap * 0.55 : 0.4)).sort((a, b) => a.x - b.x)[0]; return c ? xN(c.v) : null; };
    let total = rightOf(iT);
    if (total == null) total = Math.max(...R[iT].map(c => xN(c.v)).filter(n => n != null));
    const perHead = Math.abs(cols.reduce((a, o, i) => a + o.count * units[i], 0) - total) < Math.max(1000, total * 0.002);
    const tval = re => { const i = find(re); if (i < 0) return null; const v = rightOf(i); if (v != null) return v; const nums = R[i].map(c => xN(c.v)).filter(n => n != null); return nums[nums.length - 1]; };
    const mix = { labor: (tval(/^4\.?.*인건비|인건비계/) || 0) + (tval(/^5\.?.*복리후생|복리후생비계/) || 0), expense: tval(/^7\.?.*제비용|제비용계|^경비계/) || 0, addon: 0, marg: (tval(/^9\.?.*일반관리비|일반관리비/) || 0) + (tval(/^11\.?.*이익|이윤|기업이윤/) || 0) };
    const title = R.slice(0, iH).map(rowText).find(t => /원가|분석|산출/.test(t)) || sh.name;
    res.push({ sheet: sh.name, title: xS(title), total, rows: cols.map((o, i) => ({ job: '', title: o.title, count: o.count, shift: (/\d조\d교대|주간|야간|격일|상주/.exec(o.title) || [''])[0], unit: perHead ? units[i] : Math.round(units[i] / o.count), amount: perHead ? units[i] * o.count : units[i] })), mix: (mix.labor + mix.expense + mix.marg) > 0 ? mix : null });
  }
  return res;
}

/* ---------- 엑셀 견적서 → 연동 견적 ---------- */
function estimateFromSheets(sheets, fileName) {
  const txt = allText(sheets);
  const csTitle = (/^(.+?)\s*원가\s*분석/m.exec(txt) || [])[1] || '';
  const client = cleanClient(labelVal(sheets, /^수신|^고객사$|^발주처$|^업체명$/)) || cleanClient((/^(.+?)\s*(貴中|귀중)/m.exec(txt) || [])[1] || '') || cleanClient(csTitle) || xS(fileName).replace(/\.[^.]+$/, '').replace(/^[\d_\-\s]+/, '').replace(/_/g, ' ');
  const svc = labelVal(sheets, /^용역명$|^사업명$|^용역내용$|^건명$/);
  const per = parsePeriod(labelVal(sheets, /^용역기간$|^계약기간$/)) || parsePeriod(txt);
  const addr = labelVal(sheets, /^사업장$|^현장주소$|^근무장소$|^주소$/).replace(/\s*(허가|등록).*$/, '');
  const amtLine = labelVal(sheets, /^견적금액/);
  const moM = /월\s*([\d,]{5,})\s*원/.exec(amtLine) || /견적금액[^\n]*?월\s*([\d,]{5,})\s*원/.exec(txt) || /₩\s*([\d,]{5,})/.exec(txt);
  const q = findQuoteTable(sheets), cs = findCostSheets(sheets);
  let monthly = moM ? +moM[1].replace(/,/g, '') : null;
  if (q && q.meta.sum) monthly = monthly || q.meta.sum;
  /* 원가분석표: 견적 금액과 같은 표를 본안으로, 나머지는 대안으로 */
  let main = null;
  if (cs.length) main = cs.find(c => monthly && Math.abs(c.total - monthly) < 1000) || cs.filter(c => !/증원|대안|변경|감원|추가/.test(c.title + c.sheet)).sort((a, b) => ((/(20\d\d)/.exec(b.title + b.sheet) || [0, 0])[1]) - ((/(20\d\d)/.exec(a.title + a.sheet) || [0, 0])[1]))[0] || cs[0];
  let rows = q ? q.rows : main ? main.rows : [];
  if (!rows.length) throw new Error('견적서에서 「직종·인원·단가」 표나 원가분석표(인원 · 12. 계)를 찾지 못했습니다.');
  if (!q && main) monthly = monthly || main.total;
  if (q && main) { /* 견적표 직책명이 비어 있으면 원가분석표 이름으로 보충 */ rows.forEach((r, i) => { if (!r.shift && main.rows[i]) r.shift = main.rows[i].shift; }); }
  monthly = monthly || rows.reduce((a, r) => a + (r.amount || 0), 0) || null;
  const heads = rows.reduce((a, r) => a + (r.count || 0), 0);
  const months = per && per.months ? per.months : 12;
  const year = (per && per.from ? per.from.slice(0, 4) : '') || ((/(20\d\d)\s*년\s*(용역|견적|도급)/.exec(txt) || [])[1]) || (q && q.years.length ? q.years[q.years.length - 1] : '');
  const notes = [];
  const prevLine = labelVal(sheets, /^전년대비/); if (prevLine) notes.push('전년 대비: ' + prevLine);
  else if (q && q.meta.sumPrev && monthly) notes.push(`전년 대비: 월 ${won(q.meta.sumPrev)}원 → 월 ${won(monthly)}원 (${monthly >= q.meta.sumPrev ? '▲' : '▼'} ${(Math.abs(monthly / q.meta.sumPrev - 1) * 100).toFixed(1)}%)`);
  const yOf = c => +((/(20\d\d)/.exec(c.title + ' ' + c.sheet) || [])[1] || 0), my = main ? yOf(main) : 0;
  cs.filter(c => c !== main).forEach(c => notes.push(`${my && yOf(c) && yOf(c) < my ? '전년 산출' : '대안 산출'} — ${c.title.replace(/\s+/g, ' ')}: 월 ${won(c.total)}원 · ${c.rows.reduce((a, r) => a + r.count, 0)}명`));
  txt.split('\n').map(l => l.trim()).filter(l => /^[○◦•]\s*/.test(l) && /:|：/.test(l)).slice(0, 8).forEach(l => notes.push('견적 조건 ' + l.replace(/^[○◦•]\s*/, '')));
  notes.push(`엑셀 견적서 「${fileName}」에서 읽음${q ? ` (견적표: ${q.sheet})` : ''}${main ? ` · 원가분석: ${main.sheet}` : ''}`);
  const vat = (q && q.meta.vat) || (monthly ? Math.round(monthly * 0.1) : null);
  return normPkg({ id: 'x-' + hashId(fileName + '|' + client + '|' + monthly + '|' + heads), src: 'stqs', origin: 'excel', at: new Date().toISOString(),
    title: `${client || '고객사'}${svc ? ' · ' + svc : ''}${year ? ` (${year})` : ''}`, client, addr, svc, year,
    period: per || { from: '', to: '', months: null }, heads, monthly, vat, yearly: (q && q.meta.yearly) || (monthly ? monthly * months : null),
    rows: rows.map(r => ({ job: r.job || (/(보안|경비|미화|청소|시설|주차|안내|조리|방역|소독|경호)/.exec(r.title) || [''])[0], title: r.title, count: r.count, shift: r.shift, unit: r.unit, amount: r.amount, note: [r.note, r.prev ? `전년 ${won(r.prev)}원` : ''].filter(Boolean).join(' · ') })),
    mix: main ? main.mix : null, notes, by: 'excel' }, 'excel');
}
async function importEstimateFile(file) {
  const sheets = await sheetsFromFile(file);
  const p = estimateFromSheets(sheets, file.name); p.origin = 'excel';
  const cur = (lsJ('stec_pp_files') || []).filter(x => x.id !== p.id); cur.unshift(p); saveFiles(cur);
  return p;
}
