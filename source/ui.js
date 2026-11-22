/* =====================================================================
 * S-Tec Proposal Production System — 상단 기능 · 사업장 선정 · 회사 정보
 * (통합관리 시스템 8개 프로그램과 같은 상단 기능: 담당 카드 · 다운로드 QR · 친구추천 · 내 계정 · 주간/야간/시스템)
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const UI_KEY = 'stec_pp_ui';
let UI = { theme: 'system', manager: null, br: '' };
try { UI = Object.assign(UI, JSON.parse(localStorage.getItem(UI_KEY) || '{}')); } catch (e) { }
function saveUI() { try { localStorage.setItem(UI_KEY, JSON.stringify(UI)); } catch (e) { } }   // 로그인 시 여러 기기 동기화(auth 모듈이 감쌈)

/* ---------- 회사 정보 (제안서 「회사 소개」) ---------- */
const CO_KEY = 'stec_pp_company';
let CO = Object.assign({}, COMPANY_DEFAULT);
try { CO = Object.assign(CO, JSON.parse(localStorage.getItem(CO_KEY) || '{}')); } catch (e) { }
if (/NICE평가정보|국민연금 가입/.test(CO.metrics || '')) { CO.metrics = COMPANY_DEFAULT.metrics; CO.metricsNote = COMPANY_DEFAULT.metricsNote; }   // v2.1 — 실적은 연결재무제표 기준으로 교체
function saveCompany(c) { try { localStorage.setItem(CO_KEY, JSON.stringify(c)); } catch (e) { } }   // 로그인 시 동기화

/* ---------- 테마: 주간 / 야간 / 시스템 ---------- */
const MQ = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme(t) {
  if (!['light', 'dark', 'system'].includes(t)) t = 'system';
  const dark = t === 'dark' || (t === 'system' && MQ && MQ.matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.body.classList.toggle('dark', dark);
  UI.theme = t; saveUI();
  document.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)));
}
if (MQ && MQ.addEventListener) MQ.addEventListener('change', () => { if (UI.theme === 'system') applyTheme('system'); });

/* ---------- 모달 ---------- */
function closeModal() { document.querySelectorAll('.modal-bg').forEach(n => n.remove()); }
function openModal(html, bind, wide) {
  closeModal(); const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true">${html}<div class="m-sign">Designed &amp; Developed by Rat Rae Choi</div></div>`;
  bg.addEventListener('click', e => { if (e.target === bg) closeModal(); }); bg.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.body.appendChild(bg); const md = bg.querySelector('.modal'); bind && bind(md);
}
function copyText(t, ok) {
  const done = () => toast(ok || '복사했습니다');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
  function fallback() { const x = document.createElement('textarea'); x.value = t; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('복사하지 못했습니다'); } x.remove(); }
}

/* ---------- QR (qrcode-generator, 내장) ---------- */
function makeQR(el, text, size) {
  el.innerHTML = '';
  try {
    const q = qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(), cell = Math.max(2, Math.floor(size / (n + 4)));
    const img = new Image(); img.alt = 'QR'; img.src = q.createDataURL(cell, cell * 2); img.style.width = size + 'px'; img.style.height = size + 'px'; img.style.imageRendering = 'pixelated';
    el.appendChild(img);
  } catch (e) { el.innerHTML = '<b style="color:#0b1757">QR</b>'; }
}
const shareUrl = () => APP.shareUrl;
function urlBox(id, v) { return `<div class="urlbox"><input id="${id}" readonly value="${esc(v || shareUrl())}" aria-label="주소"><button class="btn" data-copy="${id}">주소 복사</button></div>`; }
function bindCopies(md) { md.querySelectorAll('[data-copy]').forEach(b => b.onclick = () => copyText(md.querySelector('#' + b.dataset.copy).value, '복사했습니다')); }
function openQR() {
  let mode = 'web';
  const draw = md => {
    const url = mode === 'web' ? shareUrl() : APP.apkUrl;
    makeQR(md.querySelector('#qrBig'), url, 240); md.querySelector('#qrUrl').value = url;
    md.querySelectorAll('[data-qm]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.qm === mode)));
    md.querySelector('#qrTip').innerHTML = mode === 'web' ? '북마크: PC는 Ctrl+D · 휴대폰은 브라우저 메뉴 → 홈 화면에 추가' : '안드로이드 앱(APK) 설치 파일입니다. 내려받은 뒤 「출처를 알 수 없는 앱 설치」를 허용하고 설치하세요. Play 프로텍트 경고가 뜨면 「무시하고 설치」를 누릅니다.';
  };
  openModal(`<h2>다운로드 QR</h2><div class="sub">휴대폰 카메라로 찍으면 바로 열립니다.</div>
    <div class="subtabs" role="group" aria-label="QR 종류"><button data-qm="web" aria-pressed="true">웹 버전 (사이트 주소)</button><button data-qm="apk" aria-pressed="false">안드로이드 앱 (APK)</button></div>
    <div class="qrbig" id="qrBig"></div>${urlBox('qrUrl')}<p class="hint" id="qrTip"></p>
    <div class="mrow"><button class="btn pri" id="mClose">닫기</button></div>`, md => {
    bindCopies(md); md.querySelector('#mClose').onclick = closeModal;
    md.querySelectorAll('[data-qm]').forEach(b => b.onclick = () => { mode = b.dataset.qm; draw(md); }); draw(md);
  });
}
function openRef() {
  const mg = UI.manager || {};
  const msg = `[에스텍 그룹] S-Tec Proposal Production System(에스텍 제안서 제작시스템) ${APP.version}\n용역인력 견적·업무량 기반 산정·단기인력 견적과 연동해 업종·산업별 제안서(Word)와 발표자료(PPT·PDF)를 만들어 주는 프로그램입니다.\n${shareUrl()}${mg.name ? `\n추천: ${mg.name}${mg.title ? ' ' + mg.title : ''}${mg.org ? ' (' + mg.org + ')' : ''}` : ''}`;
  openModal(`<h2>친구 추천</h2><div class="sub">QR을 보여주거나 주소·추천 메시지를 복사해 카카오톡·문자로 보내세요.</div>
    <div class="qrbig" id="refQr"></div>${urlBox('refUrl')}
    <div class="field"><label for="refMsg">추천 메시지</label><textarea id="refMsg" rows="5">${esc(msg)}</textarea></div>
    <div class="mrow"><button class="btn" data-copy="refMsg">메시지 복사</button><button class="btn pri" id="mClose">닫기</button></div>`, md => {
    makeQR(md.querySelector('#refQr'), shareUrl(), 220); bindCopies(md); md.querySelector('#mClose').onclick = closeModal;
  });
}

/* ---------- 제안 담당 (지정되어야 프로그램 구동) ---------- */
function readPhoto(file, cb) {
  const rd = new FileReader();
  rd.onload = () => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const z = 128; c.width = c.height = z; const g = c.getContext('2d'); const mm = Math.min(img.width, img.height); g.drawImage(img, (img.width - mm) / 2, (img.height - mm) / 2, mm, mm, 0, 0, z, z); cb(c.toDataURL('image/jpeg', .85)); }; img.onerror = () => toast('사진을 읽을 수 없습니다. JPG나 PNG를 선택하세요'); img.src = rd.result; };
  rd.readAsDataURL(file);
}
function mgrFormHtml() {
  const m = UI.manager || { name: '', title: '', org: APP.branch, phone: '', email: '', photo: '', br: '' };
  return `<div class="avatar-edit"><div class="av" id="mgAv">${m.photo ? `<img src="${m.photo}" alt="">` : esc((m.name || '담')[0])}</div>
    <div><label class="btn sm" for="mgFile">사진 선택</label><input type="file" id="mgFile" accept="image/*" hidden> <button class="btn sm" id="mgNoPh" type="button">사진 빼기</button></div></div>
    <div class="grid2"><div class="field"><label for="mgName">성명 (필수)</label><input id="mgName" value="${esc(m.name)}" autocomplete="name"></div>
    <div class="field"><label for="mgTitle">직책</label><input id="mgTitle" value="${esc(m.title)}" placeholder="예: 지사장, 영업팀장"></div></div>
    <div class="grid2"><div class="field"><label for="mgBr">담당 지사 (사업장 목록을 이 지사로 시작)</label><select id="mgBr"><option value="">회사 전체</option>${BRANCHES.map(b => `<option value="${b.key}" ${b.key === m.br ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</select></div>
    <div class="field"><label for="mgOrg">소속</label><input id="mgOrg" value="${esc(m.org)}"></div></div>
    <div class="grid2"><div class="field"><label for="mgPhone">연락처</label><input id="mgPhone" value="${esc(m.phone)}" inputmode="tel"></div>
    <div class="field"><label for="mgMail">이메일</label><input id="mgMail" value="${esc(m.email || '')}" inputmode="email"></div></div>
    <div class="err" id="mgErr"></div>`;
}
function bindMgrForm(root, done) {
  let photo = (UI.manager && UI.manager.photo) || '';
  root.querySelector('#mgFile').onchange = ev => { const f = ev.target.files[0]; if (f) readPhoto(f, d => { photo = d; root.querySelector('#mgAv').innerHTML = `<img src="${d}" alt="">`; }); };
  root.querySelector('#mgNoPh').onclick = () => { photo = ''; root.querySelector('#mgAv').textContent = (root.querySelector('#mgName').value || '담')[0]; };
  return () => {
    const name = root.querySelector('#mgName').value.trim();
    if (!name) { root.querySelector('#mgErr').textContent = '제안 담당 성명을 입력해야 프로그램이 시작됩니다.'; root.querySelector('#mgName').focus(); return false; }
    UI.manager = { name, title: root.querySelector('#mgTitle').value.trim(), br: root.querySelector('#mgBr').value, org: root.querySelector('#mgOrg').value.trim(), phone: root.querySelector('#mgPhone').value.trim(), email: root.querySelector('#mgMail').value.trim(), photo, since: (UI.manager && UI.manager.since) || fmtD(kstNow()) };
    UI.br = UI.manager.br; saveUI(); applyManager(); renderHeader(); renderSites(); done && done(); return true;
  };
}
function openMgr() {
  openModal(`<h2>제안 담당 지정</h2><div class="sub">제안 담당이 지정되어 있어야 프로그램이 구동됩니다. 제안서 표지·연락처에 들어갑니다.</div>${mgrFormHtml()}
    <div class="mrow"><span id="mgCf"></span>${UI.manager ? '<button class="btn warn" id="mgOff">담당 해제</button>' : ''}<button class="btn" id="mClose">취소</button><button class="btn pri" id="mgOk">저장</button></div>`, md => {
    const commit = bindMgrForm(md, () => { closeModal(); toast('제안 담당을 저장했습니다'); });
    md.querySelector('#mgOk').onclick = commit; md.querySelector('#mClose').onclick = closeModal;
    const off = md.querySelector('#mgOff');
    if (off) off.onclick = () => {
      md.querySelector('#mgCf').innerHTML = `<span class="confirm">해제하면 프로그램이 잠깁니다. <button class="btn sm warn" id="mgY">해제</button></span>`;
      md.querySelector('#mgY').onclick = () => { UI.manager = null; saveUI(); closeModal(); renderHeader(); showGate(); };
    };
  });
}
function applyManager() {
  const m = UI.manager; if (!m) return;
  const a = $('#f_author'), d = $('#f_dept');
  if (a && !a.dataset.touched) a.value = [m.title, m.name].filter(Boolean).join(' ');
  if (d && !d.dataset.touched && m.org) d.value = m.org;
}
function renderHeader() {
  const m = UI.manager;
  $('#mgrPh').innerHTML = m && m.photo ? `<img src="${m.photo}" alt="">` : `<b class="ini">${esc(m ? m.name[0] : '?')}</b>`;
  $('#mgrName').innerHTML = m ? `<em>${esc(m.name)}</em> ${esc(m.title || '')}` : '미지정';
  $('#mgrOrg').textContent = m ? ((m.br ? m.br + '지사 · ' : '전체 · ') + (m.org || '')) : '눌러서 지정';
  makeQR($('#qrMini'), shareUrl(), 40);
  const hi = $('#heroHi'); if (hi) hi.textContent = m ? `${m.name}${m.title ? ' ' + m.title : ''}님, 안녕하세요` : '안녕하세요';
}
function showGate() {
  const gt = $('#mgrGate');
  if (UI.manager) { gt.classList.add('hidden'); document.body.classList.remove('gate-locked'); return; }
  gt.classList.remove('hidden'); document.body.classList.add('gate-locked');
  $('#gateForm').innerHTML = mgrFormHtml() + '<button class="btn pri" id="gateGo" style="width:100%;padding:11px;font-size:15px">제안 담당 지정하고 시작</button>';
  const commit = bindMgrForm($('#gateForm'), () => { showGate(); toast('에스텍 제안서 제작시스템을 시작합니다'); });
  $('#gateGo').onclick = commit;
  $('#mgName').addEventListener('keydown', e => { if (e.key === 'Enter') commit(); });
}

/* ---------- 회사 정보 편집 ---------- */
function openCompany() {
  const c = CO;
  openModal(`<h2>🏢 회사 정보 (제안서 「회사 소개」)</h2><div class="sub">제안서에 들어가는 회사 소개입니다. <b>매출·임직원 수·실적 등 수치는 내부 자료로 확인한 값만</b> 넣으세요. 비워 둔 칸은 출력하지 않습니다.</div>
    <div class="grid2"><div class="field"><label>그룹명</label><input id="coGroup" value="${esc(c.group)}"></div><div class="field"><label>회사명</label><input id="coName" value="${esc(c.name)}"></div></div>
    <div class="grid2"><div class="field"><label>제출 조직(지사)</label><input id="coBranch" value="${esc(c.branch)}"></div><div class="field"><label>모회사</label><input id="coParent" value="${esc(c.parent)}"></div></div>
    <div class="grid2"><div class="field"><label>대표자</label><input id="coCeo" value="${esc(c.ceo)}"></div><div class="field"><label>대표 전화</label><input id="coTel" value="${esc(c.tel)}"></div></div>
    <div class="field"><label>주소</label><input id="coAddr" value="${esc(c.addr)}"></div>
    <div class="grid2"><div class="field"><label>홈페이지</label><input id="coWeb" value="${esc(c.web)}"></div><div class="field"><label>슬로건</label><input id="coSlogan" value="${esc(c.slogan)}"></div></div>
    <div class="field"><label>회사 소개 (줄마다 한 문장)</label><textarea id="coIntro" rows="4">${esc(c.intro.join('\n'))}</textarea></div>
    <div class="field"><label>주요 실적 (줄마다 한 건 · 예: 2025 ○○공장 보안·미화 통합 수주)</label><textarea id="coAch" rows="3">${esc(c.achievements)}</textarea></div>
    <div class="field"><label>인증·면허 (줄마다 한 건 · 예: 경비업 허가(시설경비·신변보호))</label><textarea id="coCert" rows="3">${esc(c.certs)}</textarea></div>
    <div class="field"><label>연혁 (줄마다 한 건 · 앞에 연도를 쓰면 연표에 표시 · 예: 1999.01 ㈜에스텍시스템 설립)</label><textarea id="coHist" rows="4">${esc(c.history || '')}</textarea></div>
    <div class="field"><label>핵심 지표 (줄마다 「값|단위|설명」 · 예: 9,672|명|임직원 (국민연금 가입, 2026.09)) — 출처·기준일을 함께 적으세요</label><textarea id="coMet" rows="4">${esc(c.metrics || '')}</textarea></div>
    <div class="field"><label>지표 출처 (슬라이드 하단 표기)</label><input id="coMetN" value="${esc(c.metricsNote || '')}"></div>
    <div class="mrow"><button class="btn" id="coReset">기본값으로</button><button class="btn" id="mClose">취소</button><button class="btn pri" id="coOk">저장</button></div>`, md => {
    md.querySelector('#mClose').onclick = closeModal;
    md.querySelector('#coReset').onclick = () => { CO = Object.assign({}, COMPANY_DEFAULT); saveCompany(CO); closeModal(); toast('기본값으로 되돌렸습니다'); };
    md.querySelector('#coOk').onclick = () => {
      const v = id => md.querySelector('#' + id).value.trim();
      CO = Object.assign({}, CO, { group: v('coGroup'), name: v('coName'), branch: v('coBranch'), parent: v('coParent'), ceo: v('coCeo'), tel: v('coTel'), addr: v('coAddr'), web: v('coWeb'), slogan: v('coSlogan'),
        intro: v('coIntro').split('\n').map(x => x.trim()).filter(Boolean), achievements: v('coAch'), certs: v('coCert'), history: v('coHist'), metrics: v('coMet'), metricsNote: v('coMetN'), updated: fmtD(kstNow()) });
      saveCompany(CO); closeModal(); toast('회사 정보를 저장했습니다');
    };
  }, true);
}

/* =====================================================================
 * ② 고객사·사업장 — 에스텍 그룹 사업장 목록 또는 신규 영업 고객사 직접 입력
 * ===================================================================== */
function siteMatches(st, q) { return !q || (st.name + ' ' + st.addr + ' ' + st.work + ' ' + st.type + ' ' + (st.mgr || '')).toLowerCase().includes(q); }
function renderSites() {
  const q = ($('#sq').value || '').trim().toLowerCase(), br = UI.br || '';
  document.querySelectorAll('#brChips button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.br || '') === br)));
  const allow = (window.APP_ACCESS && APP_ACCESS.branches && APP_ACCESS.branches.length) ? APP_ACCESS.branches : null;
  const list = SITES.filter(st => (!allow || allow.includes(st.br)) && (!br || st.br === br) && siteMatches(st, q));
  $('#siteCnt').textContent = `${list.length}곳 · ${list.reduce((a, s) => a + (s.total || 0), 0)}명`;
  $('#siteList').innerHTML = list.length ? list.slice(0, 200).map(st => `<li class="st ${state.site && state.site.id === st.id ? 'on' : ''}" data-id="${st.id}">
      <span class="brb b-${st.br}">${st.br}</span><span class="nm">${esc(st.name)}<small>${esc(st.addr)}</small></span>
      <span class="wk">${esc(st.work)}<b>${st.total}명</b></span></li>`).join('') : '<li class="empty">검색 결과가 없습니다. 신규 영업 고객사는 [직접 입력]을 쓰세요.</li>';
}
function industryOfSite(st) {
  const t = (st.type || '') + ' ' + st.name + ' ' + (st.addr || '');
  const map = [['공장', 'mfg'], ['병원', 'hosp'], ['대학', 'univ'], ['학교', 'univ'], ['아파트', 'apt'], ['영사관', 'special'], ['물류', 'logi'], ['빌딩', 'office'], ['오피스', 'office'], ['관공서', 'public'], ['공공', 'public'], ['호텔', 'hotel'], ['연수원', 'hotel'], ['건설', 'build'], ['발전', 'energy'], ['항만', 'energy'], ['마트', 'retail'], ['백화점', 'retail']];
  const f = map.find(([k]) => t.includes(k)); return f ? f[1] : '';
}
function jobsOfSite(st) {
  const w = st.work || '', out = [];
  if (/보안|경비/.test(w) || st.sec) out.push('sec'); if (/미화/.test(w) || st.cln) out.push('cln');
  if (/주차/.test(w)) out.push('prk'); if (/시설/.test(w)) out.push('fac'); if (/안내/.test(w)) out.push('info'); if (/조리/.test(w)) out.push('cook'); if (/소독|방역/.test(w)) out.push('san'); if (/경호/.test(w)) out.push('grd');
  return [...new Set(out)];
}
function selectSite(st, silent) {
  state.site = st;
  $('#f_client').value = st.name; $('#f_addr').value = st.addr || '';
  const ind = industryOfSite(st); if (ind && !$('#f_ind').dataset.touched) $('#f_ind').value = ind;
  const js = jobsOfSite(st); if (js.length && !state.jobsTouched) { state.jobs = js; renderJobChips(); }
  if (!$('#f_type').dataset.touched) setType('renew');
  renderSiteInfo(); renderSites(); updStepper();
  if (!silent) toast(`고객사: ${st.name} (${st.br}지사 운영 중 · 재계약 제안으로 설정)`);
}
function manualSite() {
  state.site = null; renderSiteInfo(); renderSites();
  $('#f_client').value = ''; $('#f_client').focus(); if (!$('#f_type').dataset.touched) setType('new'); toast('신규 영업 고객사명을 직접 입력하세요.');
}
function renderSiteInfo() {
  const st = state.site, box = $('#siteInfo');
  if (!st) {
    box.className = 'siteinfo empty';
    box.innerHTML = `<b>② 고객사·사업장</b><span>${$('#f_client').value ? '신규 고객사: <em>' + esc($('#f_client').value) + '</em> (사업장 목록 정보 없이 작성)' : '운영 중인 사업장이면 목록에서 고르고, 신규 영업이면 고객사명을 직접 입력하세요.'}</span>`;
    return;
  }
  box.className = 'siteinfo';
  box.innerHTML = `<div class="si-h"><span class="brb b-${st.br}">${st.br}지사</span><b>${esc(st.name)}</b><button class="btn sm" id="siClear" type="button">변경</button></div>
    <div class="si-g">
      <span><i>주소</i>${esc(st.addr || '-')}</span>
      <span><i>계약일</i>${esc(st.since || '-')}</span><span><i>유형</i>${esc(st.type || '-')}</span>
      <span><i>계약 업종</i>${esc(st.work || '-')}</span><span><i>근무형태</i>${esc(st.shift || '-')}</span>
      <span><i>운영 인원</i>총 <b>${st.total}</b>명 (보안 ${st.sec} · 미화 ${st.cln} · 기타 ${st.etc})</span>
    </div>`;
  $('#siClear').onclick = () => { $('#siteCard').scrollIntoView({ behavior: 'smooth' }); $('#sq').focus(); };
}

function uiInit() {
  $('#appIcon').src = ASSET.icon; $('#gateLogo').src = ASSET.icon; $('#heroImg').src = ASSET.heroAnim || ASSET.hero;
  $('#ver').textContent = APP.version;
  const chips = () => { const allow = (window.APP_ACCESS && APP_ACCESS.branches && APP_ACCESS.branches.length) ? APP_ACCESS.branches : null;
    $('#brChips').innerHTML = `<button data-br="">${allow ? '담당 전체' : '전체'}</button>` + BRANCHES.filter(b => !allow || allow.includes(b.key)).map(b => `<button data-br="${b.key}">${b.key}</button>`).join('');
    if (allow && UI.br && !allow.includes(UI.br)) UI.br = ''; };
  chips();
  window.addEventListener('app-access', () => { chips(); renderSites(); });
  $('#brChips').onclick = e => { const b = e.target.closest('button'); if (!b) return; UI.br = b.dataset.br; saveUI(); renderSites(); };
  $('#sq').addEventListener('input', renderSites);
  $('#siteList').onclick = e => { const li = e.target.closest('li.st'); if (li) selectSite(SITES.find(x => x.id === +li.dataset.id)); };
  $('#siteManual').onclick = manualSite;
  $('#f_client').addEventListener('input', () => { if (state.site && $('#f_client').value !== state.site.name) { state.site = null; renderSites(); } renderSiteInfo(); });
  ['f_author', 'f_dept', 'f_ind'].forEach(id => $('#' + id).addEventListener('input', e => e.target.dataset.touched = '1'));
  $('#mgrCard').onclick = openMgr; $('#qrCard').onclick = openQR; $('#refCard').onclick = openRef; $('#btnCompany').onclick = openCompany;
  document.querySelectorAll('[data-theme-set]').forEach(b => b.onclick = () => applyTheme(b.dataset.themeSet));
  applyTheme(UI.theme); renderHeader(); renderSites(); renderSiteInfo(); applyManager(); showGate(); initRfp();
}
