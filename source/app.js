/* =====================================================================
 * S-Tec Proposal Production System (에스텍 제안서 제작시스템) v1.0.0 — 앱 로직
 * 흐름: RFP 분석 → 기획 → 집필 → 검토·승인 → 제작·제본(Word·PPT·PDF) → 제출
 * 견적 연동: S-Tec-Quotation-System · Workload-Based Cost and Labor Estimation Method · S-Tec short estimate
 * Program & Design by Rat Rae Choi (제작자 서명 — 하드코딩)
 * ===================================================================== */
const APP = {
  name: 'S-Tec Proposal Production System',
  ko: '에스텍 제안서 제작시스템',
  version: 'v1.0.0',
  build: '2026-11-19',
  shareUrl: 'https://sadness500-boop.github.io/S-Tec-Proposal-Production-System/',
  apkUrl: 'https://github.com/sadness500-boop/S-Tec-Proposal-Production-System/releases/download/app-latest/stpp-latest.apk',
  repo: 'https://github.com/sadness500-boop/S-Tec-Proposal-Production-System',
  maker: 'Rat Rae Choi',
  org: '에스텍 그룹',
  branch: '에스텍베스트 동부지사'
};
const K = { ink: '18224F', navy: '22348F', mute: '6B7385', line: 'E3E7EE', tint: 'F4F6FB', tintG: 'EEF7F1', red: 'C8553D', grn: '2E8B57', grn2: '3A9D6A', blu: '2B4C9B', amber: 'D98E04' };
const C = { navy: '0B1F8F', navyD: '07124F', green: '1E8B3A', greenD: '17552F', brick: 'E34234', silver: 'C9CED6', silverL: 'EEF1F5', ink: '1C2333', gray: '5B6475', white: 'FFFFFF' };
const state = { site: null, jobs: [], jobsTouched: false, emph: ['quality', 'safety', 'legal'], diff: ['platform', 'branch', 'manual', 'complaint'], secs: SECTIONS.map(s => s.id), type: 'new', plan: null, sigDataUrl: null, sigPx: 0, tab: 'all', projId: null, approval: null };

/* ---------- 유틸 ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const uniq = a => [...new Set(a.filter(Boolean))];
const pad = n => String(n).padStart(2, '0');
function kstNow() { const d = new Date(); return new Date(d.getTime() + (d.getTimezoneOffset() + 540) * 60000); }
function parseD(s) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; }
const WKK = ['일', '월', '화', '수', '목', '금', '토'];
function fmtD(d) { return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}(${WKK[d.getDay()]})` : '-'; }
function fmtDs(d) { return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : '-'; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function isoD(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function b64ToU8(b64) { const s = atob(b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
function dataUrlB64(u) { return u.split(',')[1]; }
async function download(blob, name) {
  const P = window.Capacitor && window.Capacitor.Plugins;
  if (P && P.Filesystem) {
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
      const w = await P.Filesystem.writeFile({ path: name, data: b64, directory: 'CACHE' });
      if (P.Share) await P.Share.share({ title: name, files: [w.uri], dialogTitle: '파일 저장·보내기' });
      else toast('파일을 만들었습니다: ' + name);
      return;
    } catch (e) { if (e && /cancel/i.test(String(e.message || e))) return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function toast(msg, ms = 2600) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), ms); }
function safeName(s) { return String(s || '').replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 40); }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
function lines(s) { return String(s || '').split(/\n+/).map(x => x.replace(/^[\s\-•·○◦▪■□*]+/, '').trim()).filter(Boolean); }
function grpText(groups) { return groups.map(g => (g.title ? `■ ${g.title}\n` : '') + g.lines.map(l => `- ${l}`).join('\n')).join('\n\n'); }
function parseGrp(text) {
  const out = []; let cur = null;
  String(text || '').split('\n').forEach(raw => {
    const l = raw.trim(); if (!l) return;
    if (/^■/.test(l)) { cur = { title: l.replace(/^■\s*/, ''), lines: [] }; out.push(cur); }
    else { if (!cur) { cur = { title: '', lines: [] }; out.push(cur); } cur.lines.push(l.replace(/^[-•·○◦▪*]\s*/, '')); }
  });
  return out.filter(g => g.title || g.lines.length);
}

/* ---------- 바닥글 서명: 실행일 날짜를 필기체로 다시 그림 ---------- */
async function buildSignature(date) {
  const ff = new FontFace('DancingSig', `url(data:font/woff2;base64,${ASSET.dancing})`);
  try { await ff.load(); document.fonts.add(ff); } catch (e) { }
  const base = await loadImg(ASSET.sigBase);
  const M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const txt = `${M[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  const S = 4, cv = document.createElement('canvas'), ctx = cv.getContext('2d');
  ctx.font = `${72 * S}px DancingSig`;
  const tw = ctx.measureText(txt).width / S;
  const W = Math.ceil(1389 + tw + 24), H = 210;
  cv.width = W * S; cv.height = H * S;
  ctx.drawImage(base, 0, 0, base.width * S, base.height * S);
  ctx.font = `${72 * S}px DancingSig`; ctx.fillStyle = '#8A1C34'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(txt, 1389 * S, 138 * S);
  const out = document.createElement('canvas'); out.width = W; out.height = H;
  const o = out.getContext('2d'); o.imageSmoothingQuality = 'high'; o.drawImage(cv, 0, 0, W, H);
  state.sigDataUrl = out.toDataURL('image/png'); state.sigPx = W;
}

/* =====================================================================
 * 1) 화면 — 기획 입력
 * ===================================================================== */
function renderIndSelect() { $('#f_ind').innerHTML = '<option value="">업종 선택</option>' + Object.entries(INDUSTRIES).map(([k, v]) => `<option value="${k}">${v.ic} ${v.n}</option>`).join(''); }
function renderJobChips() {
  $('#jobChips').innerHTML = Object.entries(JOBS).map(([k, v]) => `<button type="button" class="pick ${state.jobs.includes(k) ? 'on' : ''}" data-j="${k}">${v.ic} ${v.n}</button>`).join('');
}
function renderTypeSeg() { $('#typeSeg').innerHTML = Object.entries(PTYPES).map(([k, v]) => `<button type="button" data-t="${k}" aria-pressed="${state.type === k}">${v.ic} ${v.n}</button>`).join(''); }
function setType(t) { state.type = t; renderTypeSeg(); }
function renderEmph() { $('#emphChips').innerHTML = Object.entries(EMPH).map(([k, v]) => `<button type="button" class="pick ${state.emph.includes(k) ? 'on' : ''}" data-e="${k}" title="${esc(v.line)}">${v.ic} ${v.n}</button>`).join(''); }
function renderDiff() { $('#diffChips').innerHTML = Object.entries(DIFF).map(([k, v]) => `<button type="button" class="pick ${state.diff.includes(k) ? 'on' : ''}" data-d="${k}" title="${esc(v.lines[0])}">${v.ic} ${v.n}</button>`).join(''); }
function renderSecChecks() { $('#secChecks').innerHTML = SECTIONS.map(s => `<label class="sck"><input type="checkbox" data-s="${s.id}" ${state.secs.includes(s.id) ? 'checked' : ''}><span>${s.ic} ${s.n}</span></label>`).join(''); }

/* =====================================================================
 * 2) 견적 연동 패널
 * ===================================================================== */
function srcBadge(p) { const s = SRC[p.src]; return `<span class="sb" style="--c:#${s.color}">${s.ic} ${esc(s.n)}</span>`; }
function pkgAmt(p) {
  if (p.unit === '건') { const sup = p.supply ?? (p.total != null ? Math.round(p.total / 1.1) : null); return sup != null ? `${won(sup)}원 <small>(건·VAT 별도)</small>` : '<em class="need">금액 연동 필요</em>'; }
  return p.monthly != null ? `월 ${won(p.monthly)}원 <small>(VAT 별도)</small>` : '<em class="need">금액 연동 필요</em>';
}
function renderLinks() {
  const tabs = [['all', '전체'], ['stqs', SRC.stqs.ic + ' 용역인력'], ['wbe', SRC.wbe.ic + ' 업무량'], ['stse', SRC.stse.ic + ' 단기'], ['manual', '✍ 직접·파일']];
  const cnt = k => k === 'all' ? LINK.items.length : LINK.items.filter(p => k === 'manual' ? (p.src === 'manual' || p.origin === 'file') : p.src === k).length;
  $('#linkTabs').innerHTML = tabs.map(([k, n]) => `<button type="button" data-tab="${k}" aria-pressed="${state.tab === k}">${n}<i>${cnt(k)}</i></button>`).join('');
  const list = LINK.items.filter(p => state.tab === 'all' || (state.tab === 'manual' ? (p.src === 'manual' || p.origin === 'file') : p.src === state.tab));
  $('#linkList').innerHTML = list.length ? list.map(p => `<li class="lk ${LINK.picked.has(p.id) ? 'on' : ''}" data-id="${esc(p.id)}">
      <input type="checkbox" ${LINK.picked.has(p.id) ? 'checked' : ''} aria-label="제안서에 넣기">
      <div class="lb">${srcBadge(p)}${p.origin === 'raw' ? '<span class="sb raw">보관함</span>' : p.origin === 'file' ? '<span class="sb raw">파일</span>' : p.origin === 'manual' ? '' : '<span class="sb ok">연동</span>'}
        <b>${esc(p.title)}</b><small>${esc(p.client || '')}${p.heads ? ` · ${p.heads}명` : ''}${p.rows.length ? ` · ${p.rows.length}개 직책` : ''}${p.at ? ` · ${esc(String(p.at).slice(0, 10))}` : ''}</small><span class="amt">${pkgAmt(p)}</span></div>
      <button type="button" class="lx" data-x="${esc(p.id)}" title="목록에서 빼기">✕</button></li>`).join('')
    : `<li class="empty">${state.tab === 'all' ? '연동된 견적이 없습니다.<br>아래 견적 프로그램에서 견적을 만든 뒤 <b>「📑 제안서로 보내기」</b>를 누르거나, 직접 입력하세요.' : '이 프로그램에서 보낸 견적이 없습니다.'}</li>`;
  $('#linkMsg').textContent = LINK.serverMsg || '';
  const m = moneyOf(pickedPkgs());
  $('#linkSum').innerHTML = LINK.picked.size ? `<b>선택 ${LINK.picked.size}건</b> · 인원 ${m.heads}명 · ${m.monthly ? `월 ${won(m.monthly)}원` : ''}${m.once ? ` · 단기 ${won(m.once)}원` : ''}${m.need ? ' · <em class="need">금액 확인 필요</em>' : ''}` : '제안서에 넣을 견적을 체크하세요 (여러 건 합산 가능)';
  $('#statLink').textContent = LINK.items.length; updStepper();
}
async function refreshLinks(server) { $('#linkMsg').textContent = '불러오는 중…'; await loadLinks(server); renderLinks(); }
function applyPkgToForm(p) {
  if (p.client && !$('#f_client').value) $('#f_client').value = p.client;
  if (p.addr && !$('#f_addr').value) $('#f_addr').value = p.addr;
  if (p.period && p.period.from && !$('#f_from').value) { $('#f_from').value = p.period.from; if (p.period.to) $('#f_to').value = p.period.to; }
  if (p.src === 'wbe' && !$('#f_type').dataset.touched) setType('wbe');
  if (p.src === 'stse' && !$('#f_type').dataset.touched) setType('short');
  if (p.mode === 'renew' && !$('#f_type').dataset.touched) setType('renew');
  if (!state.jobsTouched) {
    const js = uniq(p.rows.map(r => Object.entries(JOBS).find(([k, v]) => v.kw.some(w => (r.job + r.title).includes(w)))).filter(Boolean).map(x => x[0]));
    if (js.length) { state.jobs = uniq(state.jobs.concat(js)); renderJobChips(); }
  }
  if (p.industry && !$('#f_ind').dataset.touched) { const f = Object.entries(INDUSTRIES).find(([k, v]) => v.kw.some(w => p.industry.includes(w)) || v.n.includes(p.industry)); if (f) $('#f_ind').value = f[0]; }
  if (p.client && !state.site) { const st = SITES.find(s => s.name.replace(/\s|주식회사|\(주\)|㈜/g, '') === p.client.replace(/\s|주식회사|\(주\)|㈜/g, '')); if (st) selectSite(st, true); else renderSiteInfo(); }
}
function openManualEst(edit) {
  const p = edit || { title: '', client: $('#f_client').value, rows: [{ job: '보안', title: '요원', count: 1, shift: '3조2교대', unit: null, amount: null }], monthly: null };
  const rowHtml = (r, i) => `<tr data-i="${i}"><td><input data-k="job" value="${esc(r.job)}" list="jobDl"></td><td><input data-k="title" value="${esc(r.title)}"></td><td><input data-k="count" type="number" min="0" value="${r.count ?? ''}"></td><td><input data-k="shift" value="${esc(r.shift)}"></td><td><input data-k="unit" type="number" min="0" value="${r.unit ?? ''}" placeholder="1인 월 단가"></td><td><button type="button" class="btn sm" data-del="${i}">✕</button></td></tr>`;
  openModal(`<h2>✍ 견적 직접 입력</h2><div class="sub">견적 프로그램 없이 제안서를 만들 때 사용합니다. 1인 월 단가를 넣으면 월 금액이 자동 합산됩니다(VAT 별도).</div>
    <div class="grid2"><div class="field"><label>견적 이름</label><input id="meTitle" value="${esc(p.title)}" placeholder="예: ○○공장 보안·미화 2027"></div><div class="field"><label>고객사</label><input id="meClient" value="${esc(p.client)}"></div></div>
    <datalist id="jobDl">${Object.values(JOBS).map(j => `<option value="${j.short}">`).join('')}</datalist>
    <div class="tblw"><table class="me"><thead><tr><th>직종</th><th>직책</th><th>인원</th><th>근무형태</th><th>1인 월 단가(원)</th><th></th></tr></thead><tbody id="meRows">${p.rows.map(rowHtml).join('')}</tbody></table></div>
    <button type="button" class="btn sm" id="meAdd">＋ 행 추가</button>
    <div class="grid2" style="margin-top:10px"><div class="field"><label>월 도급비 합계 (비우면 단가×인원 합계)</label><input id="meMonthly" type="number" value="${p.monthly ?? ''}"></div><div class="field"><label>계약 개월 수</label><input id="meMonths" type="number" value="${(p.period && p.period.months) || 12}"></div></div>
    <div class="mrow"><button class="btn" id="mClose">취소</button><button class="btn pri" id="meOk">저장하고 선택</button></div>`, md => {
    const rows = () => [...md.querySelectorAll('#meRows tr')].map(tr => { const o = {}; tr.querySelectorAll('[data-k]').forEach(i => o[i.dataset.k] = i.value); o.count = +o.count || 0; o.unit = o.unit ? +o.unit : null; o.amount = o.unit != null ? o.unit * o.count : null; return o; });
    md.querySelector('#meAdd').onclick = () => { const tb = md.querySelector('#meRows'); tb.insertAdjacentHTML('beforeend', rowHtml({ job: '', title: '', count: 1, shift: '' }, tb.children.length)); };
    md.querySelector('#meRows').onclick = e => { const b = e.target.closest('[data-del]'); if (b) b.closest('tr').remove(); };
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#meOk').onclick = () => {
      const rs = rows().filter(r => r.job || r.title || r.count); const sum = rs.reduce((a, r) => a + (r.amount || 0), 0);
      const mm = md.querySelector('#meMonthly').value, months = +md.querySelector('#meMonths').value || 12;
      const monthly = mm ? +mm : (sum || null);
      const pkg = saveManual({ id: (edit && edit.id) || 'm-' + Date.now(), title: md.querySelector('#meTitle').value.trim() || '직접 입력 견적', client: md.querySelector('#meClient').value.trim(), rows: rs, monthly, vat: monthly != null ? Math.round(monthly * 0.1) : null, yearly: monthly != null ? monthly * months : null, period: { months } });
      closeModal(); LINK.picked.add(pkg.id); refreshLinks(false).then(() => applyPkgToForm(pkg)); toast('직접 입력 견적을 저장했습니다');
    };
  }, true);
}
function openSrcMenu() {
  openModal(`<h2>견적 프로그램 열기</h2><div class="sub">견적을 만든 뒤 각 프로그램 화면 아래쪽의 <b>「📑 제안서로 보내기」</b>를 누르면 이 목록에 들어옵니다. (같은 계정으로 로그인하면 다른 기기에서 보낸 견적도 들어옵니다)</div>
    <div class="srcs">${['stqs', 'wbe', 'stse'].map(k => `<a class="srcbtn" href="${SRC[k].url}?stpp=1" target="_blank" rel="noopener" style="--c:#${SRC[k].color}"><span class="ic">${SRC[k].ic}</span><span><b>${esc(SRC[k].n)}</b><small>${esc(SRC[k].full)}</small></span><i>↗</i></a>`).join('')}</div>
    <div class="mrow"><button class="btn pri" id="mClose">닫기</button></div>`, md => { md.querySelector('#mClose').onclick = closeModal; });
}

/* =====================================================================
 * 3) RFP 분석 결과
 * ===================================================================== */
function runRfp(auto) {
  const t = $('#f_rfp').value.trim(); if (!t) { if (!auto) toast('RFP·과업지시서 내용을 붙여넣거나 파일을 올려 주세요.'); renderRfp(null); return; }
  const r = analyzeRFP(t); renderRfp(r);
  if (auto) applyRfp(r, true);
  toast(`요구사항 ${r.rows.length}건을 찾았습니다${r.ind ? ' · 업종 ' + INDUSTRIES[r.ind].n : ''}.`);
}
function renderRfp(r) {
  const box = $('#rfpRes'); if (!r) { box.innerHTML = ''; return; }
  const cats = {}; r.rows.forEach(x => cats[x.cat] = (cats[x.cat] || 0) + 1);
  box.innerHTML = `<div class="rfp-h"><b>요구사항 ${r.rows.length}건</b>${Object.entries(cats).map(([k, n]) => `<span class="tg">${esc(k)} ${n}</span>`).join('')}</div>
    <div class="rfp-hint">${[r.title ? `사업명: <b>${esc(r.title)}</b>` : '', r.client ? `발주처: <b>${esc(r.client)}</b>` : '', r.ind ? `업종 추정: <b>${INDUSTRIES[r.ind].ic} ${INDUSTRIES[r.ind].n}</b>` : '', r.jobs.length ? `직종: <b>${r.jobs.map(j => JOBS[j].short).join('·')}</b>` : '', r.period ? `기간: <b>${r.period.from} ~ ${r.period.to}</b>` : '', r.heads.length ? `인원: <b>${r.heads.map(h => h.job + ' ' + h.count + '명').join(', ')}</b>` : '', r.budget ? `예산: <b>${won(r.budget)}원</b>` : ''].filter(Boolean).join(' · ') || '추정 정보 없음'}
    <button type="button" class="btn sm" id="rfpApply">↧ 기획에 반영</button></div>
    <ol class="rfp-list">${r.rows.slice(0, 12).map(x => `<li><span class="tg">${esc(x.cat)}</span>${esc(x.req)}</li>`).join('')}${r.rows.length > 12 ? `<li class="more">… 외 ${r.rows.length - 12}건 (제안서 「현황 분석 및 요구사항」 대응표에 모두 들어갑니다)</li>` : ''}</ol>`;
  $('#rfpApply').onclick = () => applyRfp(r, false);
  updStepper();
}
function applyRfp(r, quiet) {
  if (r.title && !$('#f_title').value) $('#f_title').value = r.title;
  if (r.client && !$('#f_client').value) { $('#f_client').value = r.client; renderSiteInfo(); }
  if (r.ind && !$('#f_ind').dataset.touched) $('#f_ind').value = r.ind;
  if (r.jobs.length && !state.jobsTouched) { state.jobs = r.jobs; renderJobChips(); }
  if (r.period && !$('#f_from').value) { $('#f_from').value = r.period.from; $('#f_to').value = r.period.to; }
  if (!$('#f_type').dataset.touched) setType('bid');
  if (!quiet) toast('RFP 분석 결과를 기획 항목에 반영했습니다.');
}

/* =====================================================================
 * 4) 제안서 초안 집필 — 섹션 구성
 * ===================================================================== */
function readForm() {
  const v = id => ($('#' + id).value || '').trim();
  return { title: v('f_title'), client: v('f_client'), site: v('f_site'), addr: v('f_addr'), ind: v('f_ind'), from: v('f_from'), to: v('f_to'), to_: v('f_recv'),
    dept: v('f_dept'), author: v('f_author'), date: v('f_date'), rfp: v('f_rfp'), extra: v('f_extra'), mode: (document.querySelector('input[name=mode]:checked') || {}).value || 'client' };
}
function jobRowsFromSite(st) {
  const r = []; if (!st) return r;
  if (st.sec) r.push({ job: '보안', title: '보안요원', count: st.sec, shift: st.shift || '' });
  if (st.cln) r.push({ job: '미화', title: '미화원', count: st.cln, shift: '' });
  if (st.etc) r.push({ job: '기타', title: (st.work || '').replace(/보안|미화|\//g, '') || '기타', count: st.etc, shift: '' });
  return r;
}
function buildPlan() {
  const f = readForm();
  if (!f.client) { toast('고객사명을 입력하거나 ② 사업장 목록에서 고르세요.'); $('#f_client').focus(); return null; }
  if (!state.jobs.length) { toast('제안 직종을 하나 이상 고르세요.'); $('#jobChips').scrollIntoView({ behavior: 'smooth', block: 'center' }); return null; }
  const ind = INDUSTRIES[f.ind] || null, jobs = state.jobs.map(k => Object.assign({ k }, JOBS[k])), pt = PTYPES[state.type];
  const est = pickedPkgs(), money = moneyOf(est), made = kstNow();
  const from = parseD(f.from), to = parseD(f.to);
  const months = from && to ? monthsBetween(f.from, f.to) : (money.months || 12);
  const rfp = f.rfp ? analyzeRFP(f.rfp) : null;
  let staff = money.rows.length ? money.rows : (state.site ? jobRowsFromSite(state.site).map(r => Object.assign({ src: 'site' }, r)) : []);
  if (!staff.length && rfp && rfp.heads.length) staff = rfp.heads.map(h => ({ job: h.job, title: h.job, count: h.count, shift: '', src: 'rfp' }));
  const heads = staff.reduce((a, r) => a + (+r.count || 0), 0);
  const jobN = jobs.map(j => j.short).join('·');
  const title = f.title || `${f.client} ${jobN} ${pt.title}`;
  const docNo = `STPP-${String(made.getFullYear()).slice(2)}${pad(made.getMonth() + 1)}${pad(made.getDate())}-${pad(made.getHours())}${pad(made.getMinutes())}`;
  const p = { f, ind, indK: f.ind, jobs, pt, type: state.type, est, money, months, rfp, staff, heads, title, docNo, made, site: state.site, emph: state.emph.slice(), diff: state.diff.slice(), secOn: {}, sec: {} };
  SECTIONS.forEach(s => p.secOn[s.id] = state.secs.includes(s.id));
  const S = p.sec, site = state.site, sub = f.site ? ` ${f.site}` : '';
  const sumLaw = uniq(jobs.flatMap(j => j.laws).concat(['minw', 'dispatch'], f.ind === 'apt' ? ['apt'] : [], f.ind === 'public' ? ['pubsvc'] : []));
  p.laws = sumLaw;

  /* s01 제안 개요 */
  S.s01 = [
    { title: '제안 배경', lines: [`${f.client}${sub}${ind ? `는 ${ind.n} 현장으로` : '의'} ${jobN} 용역 운영에 대한 안정성과 품질, 법규 준수가 동시에 요구됩니다.`, pt.lead]
      .concat(site ? [`당사는 ${site.since ? site.since + '부터 ' : ''}본 사업장을 운영해 온 경험(현재 ${site.total}명 운영)을 바탕으로 현장 이해도가 높습니다.`] : [])
      .concat(f.extra ? lines(f.extra) : []) },
    { title: '제안 목적', lines: ['결원·근무 공백 없는 안정적인 인력 운영과 서비스 품질 향상', '관계 법령 준수와 안전보건 확보로 고객사 법적 리스크 최소화', '법정 원가에 근거한 투명하고 합리적인 가격 제시'] },
    { title: '제안 범위', lines: [`대상: ${f.client}${sub}${f.addr ? ` (${f.addr})` : ''}`, `직종: ${jobs.map(j => j.n).join(', ')}`, `계약기간: ${f.from ? `${f.from} ~ ${f.to || ''} (${months}개월)` : `${months}개월(협의)`}`]
      .concat(heads ? [`운영 인원: 총 ${heads}명`] : []) }
  ];
  /* s02 회사 소개 */
  const totStaff = SITES.reduce((a, s) => a + (s.total || 0), 0);
  const brCnt = BRANCHES.map(b => `${b.key} ${SITES.filter(s => s.br === b.key).length}곳`).join(' · ');
  S.s02 = [
    { title: '회사 개요', lines: CO.intro.slice() },
    { title: '운영 현황 (사업장 현황 지도 기준)', lines: [`운영 사업장 ${SITES.length}곳 · 현장 인력 ${totStaff.toLocaleString('ko-KR')}명`, `지사별 운영: ${brCnt}`, `${INDUSTRIES.mfg.n}·${INDUSTRIES.apt.n}·${INDUSTRIES.univ.n}·${INDUSTRIES.special.n} 등 다양한 산업 운영 경험`] }
  ].concat(lines(CO.achievements).length ? [{ title: '주요 실적', lines: lines(CO.achievements) }] : [])
    .concat(lines(CO.certs).length ? [{ title: '인증·면허', lines: lines(CO.certs) }] : [])
    .concat([{ title: '핵심 역량', lines: ['지사 중심 현장 밀착 관리와 그룹 차원의 교육·법무·품질 지원', '직종×산업 표준 매뉴얼과 통합관리 플랫폼 기반의 표준 운영', '법정 원가를 지키는 투명한 원가 산정과 근로조건 준수'] }]);
  /* s03 현황 분석 */
  S.s03 = [{ title: `${f.client} 현장 이해`, lines: (ind ? ind.view : ['고객사 현장 특성과 운영 요구사항을 사전 실사로 확인해 반영합니다.']).slice() }]
    .concat(site ? [{ title: '현재 운영 현황', lines: [`계약 업종 ${site.work || '-'} · 근무형태 ${site.shift || '-'} · 운영 인원 ${site.total}명(보안 ${site.sec} · 미화 ${site.cln} · 기타 ${site.etc})`, `관할: ${site.br}지사 — 정기 방문·불시 점검으로 직접 관리`] }] : [])
    .concat([{ title: '주요 리스크와 대응 방향', lines: (ind ? ind.risk : ['근무 공백', '안전사고', '고객 민원']).map(x => `${x} → 예방·즉시 대응 체계로 관리`) }])
    .concat(rfp && rfp.rows.length ? [{ title: `제안요청 핵심 요구사항 (${rfp.rows.length}건 중 주요)`, lines: rfp.rows.slice(0, 8).map(x => `[${x.cat}] ${x.req}`) }] : []);
  /* s04 운영 전략 */
  S.s04 = [
    { title: '운영 기본 방향', lines: ['도급 원칙: 현장대리인(소장·반장)을 통한 업무 지시 — 고객사 직접 지휘·명령 배제', '법규 준수: 경비업법·근로기준법·산업안전보건법 등 관계 법령 준수', '품질 수치화: 점검표·KPI·월간 보고로 서비스 수준을 관리', '현장 밀착: 관할 지사의 정기 방문·불시 점검·결원 대체'] },
    { title: '평가 강조점 대응', lines: p.emph.map(k => `${EMPH[k].n}: ${EMPH[k].line}`) },
    { title: '차별화 포인트', lines: p.diff.flatMap(k => [`${DIFF[k].n} — ${DIFF[k].lines[0]}`]) }
  ];
  /* s05 인력 운영 계획 */
  S.s05 = [
    { title: '편성 원칙', lines: [est.length ? '연동 견적(직종·직책·근무형태)을 기준으로 인원을 편성합니다' : '현장 실사와 요구사항을 기준으로 인원을 편성합니다', '근무형태별 법정 근로시간·휴게시간을 준수하는 교대 편성', '결원 발생 시 지사 예비 인력으로 24시간 이내 대체 투입'] },
    { title: '직종별 편성', lines: staff.length ? staff.map(r => `${r.job}${r.title && r.title !== r.job ? ' ' + r.title : ''} ${r.count}명${r.shift ? ' · ' + r.shift : ''}${r.days ? ` · ${r.days}일` : ''}`) : jobs.map(j => `${j.n}: 현장 실사 후 인원 확정`) },
    { title: '현장 조직·보고 체계', lines: ['현장 책임자(소장·반장) → 지사 담당 → 지사장 보고 체계', '고객사 요청사항은 현장 책임자가 접수해 근무자에게 지시(불법파견 방지)', '근무 교대 시 인수인계 일지 작성, 주요 사항은 당일 보고'] }
  ];
  /* s06 업무 수행 */
  S.s06 = jobs.map(j => ({ title: `${j.n} 업무 수행`, lines: j.scope.concat(ind && ind.focus && ind.focus[j.k] ? ind.focus[j.k].map(x => `[${ind.n}] ${x}`) : []).concat(j.run.slice(0, 2)) }));
  /* s07 교육·훈련 */
  S.s07 = [
    { title: '법정 교육', lines: uniq(jobs.flatMap(j => j.edu)) },
    { title: '자체 교육', lines: ['신규 배치 전 현장 OJT(근무지침·비상연락망·시설 숙지)', '월 1회 현장 특별 직무교육 및 작업 전 TBM', '연 1회 이상 비상 대응 훈련(화재·대피·침입) — 고객사 합동'] },
    { title: '교육 관리', lines: ['교육 이수 기록·서명부 보관, 고객사 요청 시 즉시 제출', '교육 결과를 월간 운영 보고서에 포함'] }
  ];
  /* s08 안전·법규 */
  S.s08 = [
    { title: '안전보건 관리', lines: ['작업 전 TBM·정기 위험성평가로 위험요인 사전 제거', '보호구 지급·착용 점검 및 안전 수칙 게시', '사고 발생 시 즉시 보고(최초 보고 5분 이내) → 원인 분석 → 재발방지 대책'] },
    { title: '적용 법령 (국가법령정보센터 기준)', lines: sumLaw.map(id => `${LAWS[id].law} ${LAWS[id].art}(${LAWS[id].t}) — ${LAWS[id].s}`) },
    { title: '근로조건 준수', lines: ['최저임금(감시·단속직 포함 100%)·4대보험·퇴직급여를 원가에 정확히 반영', '근로계약서 서면 교부, 법정 근로시간·휴게시간 준수', '고객사 갑질·폭언으로부터 근무자 보호 — 고충 처리 채널 운영'] }
  ];
  /* s09 품질·Complaint */
  const kpi = uniq(jobs.flatMap(j => j.kpi).concat(ind ? ind.kpi : [])).slice(0, 8);
  S.s09 = [
    { title: '품질관리', lines: ['월간 운영 보고서 제출(근태·교육·점검·민원 처리 현황)', '분기 품질평가와 개선 과제 관리', '지사 정기 방문·불시 점검 결과 공유'] },
    { title: '핵심 성과지표(KPI)', lines: kpi },
    { title: 'Complaint 대응 절차', lines: ['D+0 접수 즉시 1차 조치·경위 보고', 'D+1~3 원인 분석·관련자 면담·조치', 'D+7 이내 재발방지 대책 서면 회신', '중대 사안은 지사장 직접 방문·대책 보고'] }
  ];
  /* s10 스마트 운영관리 */
  S.s10 = [
    { title: '에스텍 통합관리 시스템', lines: PLATFORM.map(x => `${x.ko}(${x.n}) — ${x.d}`) },
    { title: '고객사 제공 내용', lines: ['월간 근태·교육·민원 처리 현황 보고', '현장 점검 기록·사진 공유', 'Complaint 처리 결과·재발방지 대책 문서 회신'] },
    { title: '정보 보안', lines: ['하나의 계정 통합 로그인 · 프로그램별 권한 · 기기 승인 · 접속기록 관리', '근무자·고객사 개인정보 최소 수집 및 접근 통제'] }
  ];
  /* s11 개시·인수인계 */
  const d0 = from || addDays(made, 30);
  p.timeline = [
    { d: 'D-30', date: fmtDs(addDays(d0, -30)), t: '계약 체결·인력 선발', a: '계약 체결, 인력 선발·면접, 고용승계 대상자 면담' },
    { d: 'D-14', date: fmtDs(addDays(d0, -14)), t: '교육·자격 확인', a: '법정 교육 이수 확인, 현장 OJT 계획, 장비·피복 준비' },
    { d: 'D-7', date: fmtDs(addDays(d0, -7)), t: '현장 인수인계', a: '업무·시설·비품·비상연락망 인수인계, 근무 편성표 확정' },
    { d: 'D-Day', date: fmtDs(d0), t: '운영 개시', a: '운영 개시, 지사 담당 현장 상주 지원' },
    { d: 'D+30', date: fmtDs(addDays(d0, 30)), t: '안정화 점검', a: '운영 안정화 점검, 첫 월간 운영 보고서 제출' }
  ];
  S.s11 = [
    { title: '운영 개시 일정', lines: p.timeline.map(t => `${t.d} (${t.date}) ${t.t} — ${t.a}`) },
    { title: state.type === 'renew' ? '운영 연속성' : '고용승계·인수인계', lines: state.type === 'renew' ? ['현 근무 인력 유지로 운영 공백 없이 계약 연속', '계약 갱신에 맞춘 근로계약 갱신·근로조건 변경 사항 안내'] : ['기존 근무자 고용승계 원칙(본인 희망 시) — 근로조건 저하 없이 전환', '승계 근로자 면담·근로계약 체결·교육 일정 수립', '인수인계 체크리스트로 업무 누락 방지'] }
  ];
  /* s12 가격 */
  const pl = [];
  if (money.monthly) pl.push(`월 도급비(공급가액) ${won(money.monthly)}원 · 부가세 ${won(money.vat)}원 · 월 합계 ${won(money.monthly + money.vat)}원`);
  if (money.monthly) pl.push(`계약기간 ${months}개월 총액(공급가액) ${won(money.monthly * months)}원 — 일금 ${korWon(money.monthly * months)}원정(VAT 별도)`);
  if (money.once) pl.push(`단기·행사 인력 ${won(money.once)}원 · 부가세 ${won(money.onceVat)}원 · 합계 ${won(money.once + money.onceVat)}원`);
  if (!pl.length) pl.push('견적 금액이 연동되지 않았습니다 — 견적 프로그램에서 「📑 제안서로 보내기」 후 다시 생성하세요');
  const METHOD = { stqs: '직종별 기본급·제수당·상여·퇴직급여·4대보험(법정 요율) + 부대비용 + 일반관리비·이윤', wbe: '업무를 대·중·소·세부로 나눠 업무별 기본시간·빈도로 인력 산출 → 업무별 비용 배분', stse: '((근무시간×시급)+각종 수당)×4대보험×관리손익(5% 이상) + 장비·장구 대여비', manual: '직종별 1인 월 단가 × 인원' };
  S.s12 = [
    { title: '제안 금액', lines: pl },
    { title: '산출 근거 (연동 견적)', lines: est.length ? est.map(e => `${SRC[e.src].n}「${e.title}」: ${e.unit === '건' ? won(e.supply ?? (e.total != null ? Math.round(e.total / 1.1) : null)) + '원(건)' : '월 ' + won(e.monthly) + '원'} — ${METHOD[e.src]}`) : ['견적 프로그램(용역인력 견적·업무량 기반 산정·단기인력 견적) 산출내역서 기준'] },
    { title: '가격 조건', lines: ['부가가치세 별도', '최저임금·4대보험 요율 등 법정 기준 변경 시 계약 단가 조정 협의', '견적 유효기간: 제출일로부터 1개월', '부대비용(차량·장비)은 인당 배분 또는 별도 청구 중 협의'] }
  ];
  if (money.need) S.s12[0].lines.push('※ 일부 견적은 금액이 연동되지 않았습니다(인원 구성만 반영).');
  /* s13 기대효과 */
  const eff = { price: '법정 원가 기반 투명한 가격으로 예산 예측 가능성 향상', quality: '수치로 관리되는 서비스 품질과 지속적인 개선', stable: '고용승계·근로조건 준수로 이직률 감소와 업무 연속성 확보', safety: '안전보건관리체계로 사고 예방과 중대재해 리스크 감소', legal: '불법파견·근로기준 위반 등 법적 리스크 최소화', tech: '통합관리 플랫폼으로 현장 현황의 실시간 파악', esg: '지역 고용·근로자 보호로 ESG 경영에 기여', response: 'Complaint 신속 처리로 고객사 만족도 향상' };
  S.s13 = [
    { title: '기대효과', lines: p.emph.map(k => eff[k]).concat(['당사 운영 노하우를 통한 관리 부담 경감']) },
    { title: '맺음말', lines: [`${CO.group}은 ${f.client}의 신뢰받는 파트너로서 약속한 운영 수준을 반드시 지키겠습니다.`, '현장의 작은 변화까지 먼저 살피고, 문제가 생기면 가장 먼저 책임지는 회사가 되겠습니다.', CO.slogan || 'The Best Choice, S-Tec'] }
  ];
  p.text = {}; SECTIONS.forEach(s => p.text[s.id] = grpText(S[s.id]));
  p.approval = state.approval || newApproval();
  return p;
}
function newApproval() { return { status: 'draft', writer: UI.manager ? [UI.manager.title, UI.manager.name].filter(Boolean).join(' ') : '', reviewer: '', approver: '', checks: {}, log: [] }; }

/* ---------- 편집기 ---------- */
function renderEditor(p) {
  const ed = $('#editor');
  ed.innerHTML = `<div class="ed-head"><span class="doc-t">${esc(p.title)}</span><span class="badge" style="--c:#${STATUS[p.approval.status].c}">${STATUS[p.approval.status].n}</span></div>
    <p class="ed-tip">■ 제목 / - 한 줄씩 형식으로 고칠 수 있습니다. 끄면 출력에서 빠집니다. 표(인력·법령·일정·가격)는 연동 자료로 자동 작성됩니다.</p>
    ${SECTIONS.map(s => `<details class="ed ${p.secOn[s.id] ? '' : 'off'}" ${s.id === 's01' ? 'open' : ''}><summary><label class="sw" onclick="event.stopPropagation()"><input type="checkbox" data-on="${s.id}" ${p.secOn[s.id] ? 'checked' : ''}></label><b>${s.ic} ${esc(s.n)}</b><small>${parseGrp(p.text[s.id]).reduce((a, g) => a + g.lines.length, 0)}줄</small></summary>
      <textarea data-sec="${s.id}" rows="${Math.min(16, Math.max(5, p.text[s.id].split('\n').length + 1))}">${esc(p.text[s.id])}</textarea></details>`).join('')}`;
  ed.querySelectorAll('[data-on]').forEach(c => c.onchange = () => { p.secOn[c.dataset.on] = c.checked; c.closest('details').classList.toggle('off', !c.checked); });
  ed.querySelectorAll('textarea[data-sec]').forEach(t => t.oninput = () => { p.text[t.dataset.sec] = t.value; });
  $('#outPanel').classList.add('ready'); renderApproval(); updStepper();
}
function syncEditor() { const p = state.plan; if (!p) return null; document.querySelectorAll('#editor textarea[data-sec]').forEach(t => p.text[t.dataset.sec] = t.value); return p; }
const G = (p, id) => parseGrp(p.text[id]);

/* ---------- 검토·승인 ---------- */
function renderApproval() {
  const p = state.plan, box = $('#approval'); if (!p) { box.innerHTML = '<p class="hint">초안을 집필하면 검토·승인 단계가 열립니다.</p>'; return; }
  const a = p.approval, done = CHECKS.filter(([k]) => a.checks[k]).length;
  box.innerHTML = `<div class="ap-flow">${Object.entries(STATUS).map(([k, v], i) => `<button type="button" data-st="${k}" class="${a.status === k ? 'on' : ''}" style="--c:#${v.c}">${i + 1}. ${v.n}</button>`).join('<i>›</i>')}</div>
    <div class="grid3"><label class="f"><span>작성</span><input id="apW" value="${esc(a.writer)}"></label><label class="f"><span>검토</span><input id="apR" value="${esc(a.reviewer)}" placeholder="예: 영업팀장 ○○○"></label><label class="f"><span>승인</span><input id="apA" value="${esc(a.approver)}" placeholder="예: 지사장 ○○○"></label></div>
    <div class="ap-chk">${CHECKS.map(([k, t]) => `<label><input type="checkbox" data-ck="${k}" ${a.checks[k] ? 'checked' : ''}> ${esc(t)}</label>`).join('')}</div>
    <div class="ap-bar"><i style="width:${Math.round(done / CHECKS.length * 100)}%"></i></div><small class="hint">검토 항목 ${done}/${CHECKS.length} · ${a.status === 'approved' || a.status === 'submitted' ? '승인되어 대외 제출용 출력이 가능합니다' : '대외 제출용은 「승인」 후 출력을 권장합니다'}</small>
    ${a.log.length ? `<ul class="ap-log">${a.log.slice(-4).reverse().map(l => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}`;
  box.querySelectorAll('[data-st]').forEach(b => b.onclick = () => {
    const k = b.dataset.st;
    if ((k === 'approved' || k === 'submitted') && CHECKS.some(([c]) => !a.checks[c])) return toast('검토 체크리스트를 모두 확인해야 승인할 수 있습니다.');
    a.status = k; a.log.push(`${fmtD(kstNow())} ${STATUS[k].n}${k === 'approved' && a.approver ? ' · ' + a.approver : ''}`); state.approval = a; renderEditor(state.plan); saveProject(true);
  });
  [['apW', 'writer'], ['apR', 'reviewer'], ['apA', 'approver']].forEach(([id, k]) => box.querySelector('#' + id).oninput = e => a[k] = e.target.value);
  box.querySelectorAll('[data-ck]').forEach(c => c.onchange = () => { a.checks[c.dataset.ck] = c.checked; renderApproval(); });
}

/* ---------- 진행 단계 표시 ---------- */
function updStepper() {
  const p = state.plan, rfpDone = !!($('#f_rfp') && $('#f_rfp').value.trim()), plan = !!($('#f_client') && $('#f_client').value) && state.jobs.length > 0;
  const st = p ? p.approval.status : '';
  const done = [rfpDone || LINK.picked.size > 0, plan, !!p, st === 'approved' || st === 'submitted', !!(p && p.printed), st === 'submitted'];
  const cur = done.indexOf(false);
  document.querySelectorAll('#stepper .stp').forEach((b, i) => { b.classList.toggle('done', done[i]); b.classList.toggle('cur', i === cur); });
}
