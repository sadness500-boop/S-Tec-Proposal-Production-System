/* =====================================================================
 * 견적 연동 — 3개 견적 프로그램 ↔ 제안서 제작시스템
 *   ① S-Tec-Quotation-System (용역인력 견적, stqs)
 *   ② Workload-Based Cost and Labor Estimation Method (업무량 기반 산정, wbe)
 *   ③ S-Tec short estimate (단기인력 견적, stse)
 * 연동 방식
 *   A. 각 견적 프로그램의 「📑 제안서로 보내기」 → 'stec_proposal_inbox' (이 기기 + 통합 로그인 서버)  ← 금액까지 정확
 *   B. 각 견적 프로그램이 저장한 견적 보관함(같은 주소·같은 계정 서버 동기화)을 직접 읽기     ← 인원·구성 위주
 *   C. 연동 파일(.json) 불러오기 · 직접 입력
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const LINK_KEY = 'stec_proposal_inbox';
const SRC = {
  stqs: { n: '용역인력 견적', full: 'S-Tec-Quotation-System', ic: '🧾', color: '0B1F8A', url: 'https://sadness500-boop.github.io/S-Tec-Quotation-System/', unit: '월' },
  wbe:  { n: '업무량 기반 산정', full: 'Workload-Based Cost and Labor Estimation Method', ic: '📐', color: 'E8750A', url: 'https://sadness500-boop.github.io/Workload-Based-Cost-and-Labor-Estimation-Method/', unit: '월' },
  stse: { n: '단기인력 견적', full: 'S-Tec short estimate', ic: '⏱', color: '7A2E8E', url: 'https://sadness500-boop.github.io/S-Ttec-short-estimate/', unit: '건' },
  manual: { n: '직접 입력', full: '제안서 제작시스템 직접 입력', ic: '✍', color: '475569', url: '', unit: '월' }
};
const LINK = { items: [], picked: new Set(), serverAt: null, serverMsg: '' };
const QCAT = { sec: '보안(경비)', cln: '미화', park: '주차', fac: '시설관리', spc: '특수직군', etc: '기타직군' };
const QSHIFT = k => ({ s32: '3조2교대', s42: '4조2교대', s52: '5조2교대', s22: '2조2교대', alt: '격일제', day5_8: '주5일 주간(8h)', day5_9: '주5일 주간(9h)', day6_8: '주6일 주간(8h)' }[k] || (k ? String(k) : ''));
const WBE_IND = { factory: '공장', building: '빌딩', hospital: '병원', retail: '유통', univ: '대학교', training: '연수원', power: '발전소', apt: '아파트', etc: '기타' };
const WBE_JOB = { sec: '보안', clean: '미화', park: '주차', fac: '시설', etc: '기타' };

function jparse(s) { try { return typeof s === 'string' ? JSON.parse(s) : s; } catch (e) { return null; } }
function lsJ(k) { try { return jparse(localStorage.getItem(k)); } catch (e) { return null; } }
function hashId(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
const num = v => (v == null || v === '' || isNaN(+v)) ? null : +v;

/* ---------- 표준 연동 형식으로 정리 ---------- */
function normPkg(x, origin) {
  if (!x || typeof x !== 'object') return null;
  const src = SRC[x.src] ? x.src : 'manual';
  const rows = (Array.isArray(x.rows) ? x.rows : []).map(r => ({
    job: String(r.job || ''), title: String(r.title || ''), count: num(r.count) || 0, shift: String(r.shift || ''),
    unit: num(r.unit), amount: num(r.amount), days: num(r.days), date: r.date || '', note: r.note || ''
  }));
  const p = {
    id: String(x.id || ('p' + hashId(JSON.stringify(x).slice(0, 400)))), v: 1, src, origin: origin || x.origin || 'bridge',
    at: x.at || new Date().toISOString(), title: String(x.title || x.client || '견적'), client: String(x.client || ''), site: String(x.site || ''), addr: String(x.addr || ''),
    svc: String(x.svc || ''), industry: String(x.industry || ''), mode: x.mode || '', year: x.year || '', branch: x.branch || '', grpCo: x.grpCo || '',
    period: Object.assign({ from: '', to: '', months: null }, x.period || {}),
    heads: num(x.heads) ?? rows.reduce((a, r) => a + (r.count || 0), 0),
    monthly: num(x.monthly), vat: num(x.vat), yearly: num(x.yearly), supply: num(x.supply), total: num(x.total),
    unit: x.unit || SRC[src].unit, rows, mix: x.mix || null, tasks: Array.isArray(x.tasks) ? x.tasks : [], addons: Array.isArray(x.addons) ? x.addons : [],
    plan: x.plan || '', staff: x.staff || '', hours: num(x.hours), fte: num(x.fte), notes: Array.isArray(x.notes) ? x.notes : (x.notes ? [String(x.notes)] : []),
    needAmt: !!x.needAmt, by: x.by || ''
  };
  if (p.monthly == null && p.unit === '월') p.needAmt = true;
  if (p.unit === '건' && p.total == null && p.supply == null) p.needAmt = true;
  return p;
}

/* ---------- B. 견적 보관함 직접 읽기 (금액은 견적 프로그램에서 「제안서로 보내기」로 확정) ---------- */
function rawFromQuote(st, name, at) {
  if (!st || !st.meta || !Array.isArray(st.roles)) return null;
  const m = st.meta;
  return normPkg({ id: 'raw-stqs-' + hashId((name || m.client) + '|' + m.year), src: 'stqs', at: at || '', title: name || `${m.client || '이름없음'} · ${m.year || ''}`,
    client: m.client, addr: m.addr, svc: m.svc, year: m.year, mode: m.mode, branch: m.branch, grpCo: m.grpCo,
    period: { from: m.from, to: m.to, months: null },
    rows: st.roles.map(r => ({ job: QCAT[r.cat] || r.cat || '', title: (r.rank || r.title || '') + (r.detail ? ` (${r.detail})` : ''), count: +r.count || 0, shift: QSHIFT(r.shift), unit: null, amount: null })),
    addons: [].concat((st.vehicles || []).map(v => ({ k: '차량', n: v.name || v.type || '업무차량', q: v.qty || 1 })), (st.equips || []).map(e => ({ k: '장비', n: e.name || '장비', q: e.qty || 1 })), (st.others || []).map(o => ({ k: '기타', n: o.name || '부대비용', q: o.qty || 1 }))),
    needAmt: true, notes: ['견적 보관함에서 읽은 자료입니다. 금액은 용역인력 견적에서 「📑 제안서로 보내기」를 누르면 함께 연동됩니다.'] }, 'raw');
}
function rawFromShort(it) {
  const P = it && (it.p || it); if (!P || !Array.isArray(P.lines)) return null;
  const tot = num(it.total);
  return normPkg({ id: 'raw-stse-' + hashId((P.name || '') + '|' + (P.date || '')), src: 'stse', at: it.at || '', title: P.name || '단기인력 견적', client: P.client, site: P.site,
    period: { from: P.date || '', to: '', months: null }, unit: '건',
    rows: P.lines.map(L => ({ job: L.ind || '', title: L.role || '', count: +L.heads || 0, shift: [L.start, L.end].filter(Boolean).join('~'), days: +L.days || null, date: L.date || '', unit: null, amount: null })),
    total: tot, supply: tot != null ? Math.round(tot / 1.1) : null, vat: tot != null ? tot - Math.round(tot / 1.1) : null,
    needAmt: tot == null, notes: ['단기인력 견적 보관함에서 읽은 자료입니다(합계는 보관 당시 금액).'] }, 'raw');
}
function rawFromWbe(S, at) {
  if (!S || !S.est) return [];
  return Object.entries(S.est).map(([k, E]) => {
    const [ind, job] = k.split('|'); if (!E || !Array.isArray(E.tree)) return null;
    const q = E.quote || {}, p = E.params || {};
    const heads = num(q.n) || (p.plan === 'contract' ? num(p.cFull) : null) || num(p.cFull) || 0;
    return normPkg({ id: 'raw-wbe-' + hashId(k + '|' + (S.site || '')), src: 'wbe', at: at || '', title: `${S.site || '업무량 기반 산정'} · ${WBE_IND[ind] || ind} ${WBE_JOB[job] || job}`,
      client: S.site || '', industry: WBE_IND[ind] || ind,
      rows: [{ job: WBE_JOB[job] || job, title: `${WBE_JOB[job] || job} 인력`, count: heads, shift: '', unit: null, amount: q.amount ? +q.amount : null }],
      monthly: q.amount ? +q.amount : null, tasks: E.tree.map(n => ({ name: n.name, share: null, cost: null, hours: null })),
      needAmt: !q.amount, notes: ['업무량 기반 산정 자료에서 업무 분류(대분류)를 읽었습니다. 업무별 시간·비용은 산정 프로그램에서 「📑 제안서로 보내기」를 누르면 연동됩니다.'] }, 'raw');
  }).filter(Boolean);
}
function rawAll(get) {
  const out = [];
  const qs = get('stec_quotes'); if (Array.isArray(qs)) qs.forEach(q => { const p = rawFromQuote(q.state, q.name, q.at); if (p) out.push(p); });
  const qd = get('stec_quote_draft'); if (qd && qd.meta && qd.meta.client) { const p = rawFromQuote(qd, `작성 중 · ${qd.meta.client}`, ''); if (p) { p.id = 'raw-stqs-draft'; out.push(p); } }
  const ss = get('stse_saved'); if (Array.isArray(ss)) ss.forEach(it => { const p = rawFromShort(it); if (p) out.push(p); });
  const sp = get('stse_project'); if (sp && sp.lines && sp.lines.length) { const p = rawFromShort({ p: sp }); if (p) { p.id = 'raw-stse-cur'; p.title = '작성 중 · ' + p.title; out.push(p); } }
  let w = get('wbe-estimator-v16'); if (w && w.raw) w = jparse(w.raw); out.push(...rawFromWbe(w));
  return out;
}

/* ---------- 불러오기: 이 기기 + 서버 ---------- */
function readInboxLocal() { const a = lsJ(LINK_KEY); return Array.isArray(a) ? a : []; }
function mergeItems(list) {
  const map = new Map();
  list.filter(Boolean).forEach(p => { const o = map.get(p.id); if (!o || String(p.at) > String(o.at) || (o.origin === 'raw' && p.origin !== 'raw')) map.set(p.id, p); });
  // 같은 견적이 「보내기」 자료로 있으면 보관함 원자료(raw)는 숨김
  const sent = [...map.values()].filter(p => p.origin !== 'raw').map(p => p.src + '|' + (p.client || p.title));
  return [...map.values()].filter(p => p.origin !== 'raw' || !sent.includes(p.src + '|' + (p.client || p.title)))
    .sort((a, b) => (a.origin === 'raw') - (b.origin === 'raw') || String(b.at).localeCompare(String(a.at)));
}
async function loadLinks(withServer) {
  const local = readInboxLocal().map(x => normPkg(x, 'bridge'));
  const files = (lsJ('stec_pp_files') || []).map(x => normPkg(x, x.origin || 'file'));
  let raw = rawAll(lsJ), server = [];
  if (withServer) {
    const A = window.STPP_AUTH;
    if (A && A.client && A.profile) {
      try {
        const { data, error } = await A.client.rpc('sync_pull');
        if (error) throw error;
        const cloud = {}; (data || []).forEach(r => cloud[r.k] = r.v);
        if (Array.isArray(cloud[LINK_KEY])) server = cloud[LINK_KEY].map(x => normPkg(x, 'bridge'));
        raw = raw.concat(rawAll(k => jparse(cloud[k])));
        LINK.serverAt = new Date(); LINK.serverMsg = `서버 동기화 ${pad(LINK.serverAt.getHours())}:${pad(LINK.serverAt.getMinutes())}`;
      } catch (e) { LINK.serverMsg = '서버 읽기 실패 — 이 기기 자료만 표시'; }
    } else LINK.serverMsg = '로그인하면 다른 기기에서 보낸 견적도 함께 보입니다';
  }
  const hidden = new Set(lsJ('stec_pp_hidden') || []);
  LINK.items = mergeItems(local.concat(server, files, raw)).filter(p => !hidden.has(p.id));
  [...LINK.picked].forEach(id => { if (!LINK.items.find(p => p.id === id)) LINK.picked.delete(id); });
  return LINK.items;
}
function pickedPkgs() { return LINK.items.filter(p => LINK.picked.has(p.id)); }

/* ---------- 합산 ---------- */
function moneyOf(pkgs) {
  const m = { monthly: 0, vat: 0, yearly: 0, once: 0, onceVat: 0, heads: 0, months: 12, need: false, rows: [] };
  pkgs.forEach(p => {
    m.heads += p.heads || 0;
    if (p.unit === '건') { const sup = p.supply ?? (p.total != null ? Math.round(p.total / 1.1) : null); if (sup == null) m.need = true; else { m.once += sup; m.onceVat += p.vat ?? Math.round(sup * 0.1); } }
    else {
      if (p.monthly == null) m.need = true; else { m.monthly += p.monthly; m.vat += p.vat ?? Math.round(p.monthly * 0.1); }
      const months = p.period && p.period.months ? +p.period.months : monthsBetween(p.period && p.period.from, p.period && p.period.to);
      if (p.yearly != null) m.yearly += p.yearly; else if (p.monthly != null) m.yearly += p.monthly * months;
      m.months = months;
    }
    p.rows.forEach(r => m.rows.push(Object.assign({ src: p.src, pkg: p.title }, r)));
  });
  return m;
}
function monthsBetween(a, b) {
  if (!a || !b) return 12; const A = new Date(a), B = new Date(b); if (isNaN(A) || isNaN(B)) return 12;
  return Math.max(1, (B.getFullYear() - A.getFullYear()) * 12 + (B.getMonth() - A.getMonth()) + (B.getDate() >= A.getDate() - 1 ? 1 : 0));
}
const won = v => v == null ? '-' : Math.round(v).toLocaleString('ko-KR');
function korWon(n) {
  n = Math.floor(n || 0); if (!n) return '영';
  const d = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'], u = ['', '십', '백', '천'], b = ['', '만', '억', '조']; let s = '', bi = 0;
  while (n > 0) { const part = n % 10000; n = Math.floor(n / 10000); if (part) { let p = '', x = part, ui = 0; while (x > 0) { const dg = x % 10; if (dg) p = d[dg] + u[ui] + p; x = Math.floor(x / 10); ui++; } s = p + b[bi] + s; } bi++; }
  return s;
}

/* ---------- C. 파일 · 직접 입력 ---------- */
function saveFiles(list) { try { localStorage.setItem('stec_pp_files', JSON.stringify(list.slice(0, 40))); } catch (e) { } }
async function importLinkFile(file) {
  const t = await file.text(); const j = jparse(t);
  if (!j) throw new Error('연동 파일(JSON)을 읽을 수 없습니다.');
  let arr = Array.isArray(j) ? j : j.packages || j.items || [j];
  // 견적 프로그램 JSON 백업(원자료)도 받음
  arr = arr.flatMap(x => x && x.src ? [normPkg(x, 'file')] : x && x.meta && x.roles ? [rawFromQuote(x, file.name, '')] : x && x.lines ? [rawFromShort({ p: x })] : x && x.est ? rawFromWbe(x) : []).filter(Boolean);
  if (!arr.length) throw new Error('견적 연동 자료를 찾지 못했습니다.');
  arr.forEach(p => { p.origin = 'file'; p.id = 'f-' + hashId(p.id + file.name); });
  const cur = (lsJ('stec_pp_files') || []).filter(x => !arr.find(a => a.id === x.id));
  saveFiles(arr.concat(cur)); return arr;
}
function exportLinkFile(pkgs) {
  const blob = new Blob([JSON.stringify({ format: 'stec.proposal.link', v: 1, at: new Date().toISOString(), packages: pkgs }, null, 1)], { type: 'application/json' });
  return blob;
}
function saveManual(p) {
  p = normPkg(Object.assign({ src: 'manual', origin: 'manual', at: new Date().toISOString() }, p), 'manual');
  const cur = (lsJ('stec_pp_files') || []).filter(x => x.id !== p.id); cur.unshift(Object.assign(p, { origin: 'manual' })); saveFiles(cur); return p;
}
function removeLocalPkg(id) {
  try { const h = lsJ('stec_pp_hidden') || []; if (!h.includes(id)) h.push(id); localStorage.setItem('stec_pp_hidden', JSON.stringify(h.slice(-300))); } catch (e) { }
  saveFiles((lsJ('stec_pp_files') || []).filter(x => x.id !== id));
  try { const a = readInboxLocal().filter(x => x.id !== id); localStorage.setItem(LINK_KEY, JSON.stringify(a)); } catch (e) { }
}
