/* =====================================================================
 * 멀티미디어 — S-Tec Media Wall 사진·현장 영상·차트·네트워크 지도 (PPT·PDF·Word 공용 이미지)
 * Designed & Developed by Rat Rae Choi
 * ===================================================================== */
const MEDIA = { img: {}, vid: {}, crop: {} };
function mediaUrls(rel) { const a = []; if (location.protocol !== 'file:') a.push(new URL(rel, location.href).href); a.push(APP.shareUrl + rel); return a; }
function blobToDataUrl(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(b); }); }
async function fetchFirst(rel) {
  for (const u of mediaUrls(rel)) { try { const r = await fetch(u); if (r.ok) { const b = await r.blob(); if (b.size > 2000) return b; } } catch (e) { } }
  return null;
}
/* id: 'p35' = 직원 디오라마·3D 피규어 사진, 'v05' = 현장 영상 장면 */
async function loadMedia(id) {
  if (MEDIA.img[id] !== undefined) return MEDIA.img[id];
  const rel = id[0] === 'v' ? `media/scene/${id}.jpg` : `media/photo/${id}.jpg`;
  const b = await fetchFirst(rel); if (!b) return (MEDIA.img[id] = null);
  const src = await blobToDataUrl(b); const im = await loadImg(src);
  return (MEDIA.img[id] = { src, w: im.naturalWidth, h: im.naturalHeight });
}
async function loadVideo(id) {
  if (MEDIA.vid[id] !== undefined) return MEDIA.vid[id];
  const b = await fetchFirst(`media/video/${id}.mp4`); if (!b) return (MEDIA.vid[id] = null);
  return (MEDIA.vid[id] = String(await blobToDataUrl(b)).split(',')[1]);
}
function mediaIdsFor(p) {
  const ids = new Set(Object.values(MEDIA_EXTRA));
  p.jobs.forEach(j => { const m = MEDIA_MAP[j.k] || MEDIA_MAP.sec; m.fig.forEach(x => ids.add(x)); m.scene.forEach(x => ids.add(x)); });
  Object.values(MEDIA_MAP).forEach(m => ids.add(m.fig[0]));
  ['v02', 'v05', 'v07', 'v11', 'v04', 'v14', 'v16'].forEach(x => ids.add(x));
  return [...ids];
}
async function prepMedia(p, onProg) {
  const ids = mediaIdsFor(p); let n = 0;
  await Promise.all(ids.map(async id => { await loadMedia(id); onProg && onProg(++n, ids.length); }));
}
/* 사진 가져오기 — 없으면 내장 그림으로 대체 */
function M(id, fb) {
  const m = MEDIA.img[id]; if (m) return m;
  const f = fb || 'team_dio'; const d = ASSET.figDim[f] || [900, 600];
  return { src: ASSET.fig[f] || ASSET.hero, w: d[0], h: d[1] };
}
/* 상자 비율로 잘라내기(cover) — PPT·PDF·Word에서 찌그러지지 않게 */
function coverSrc(m, bw, bh, pos = 0.5) {
  const key = m.src.length + ':' + m.src.slice(-40) + ':' + (bw / bh).toFixed(3) + ':' + pos;
  if (MEDIA.crop[key]) return MEDIA.crop[key];
  const ar = bw / bh, iar = m.w / m.h; let sw = m.w, sh = m.h, sx = 0, sy = 0;
  if (iar > ar) { sw = m.h * ar; sx = (m.w - sw) * pos; } else { sh = m.w / ar; sy = (m.h - sh) * pos; }
  const W = Math.min(1600, Math.round(sw)), H = Math.round(W / ar), cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const im = MEDIA._el && MEDIA._el[m.src];
  const draw = img => { cv.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, W, H); return (MEDIA.crop[key] = cv.toDataURL('image/jpeg', 0.86)); };
  if (im) return draw(im);
  return m.src;   // 아직 디코딩 전이면 원본(비율은 Im 상자에서 contain 처리)
}
async function decodeAll() {
  MEDIA._el = MEDIA._el || {};
  const all = Object.values(MEDIA.img).filter(Boolean).map(x => x.src).concat([ASSET.hero], Object.values(ASSET.fig));
  await Promise.all(all.map(async s => { if (!MEDIA._el[s]) { try { MEDIA._el[s] = await loadImg(s); } catch (e) { } } }));
}
/* 사진을 상자에 꽉 채워 넣기 */
function Photo(x, y, w, h, id, fb, pos) { const m = typeof id === 'object' ? id : M(id, fb); return Im(x, y, w, h, coverSrc(m, w, h, pos)); }
/* 사진을 상자 안에 비율 유지해 넣기 */
function PhotoFit(x, y, w, h, id, fb) { const m = typeof id === 'object' ? id : M(id, fb); const r = Math.min(w / m.w, h / m.h), ww = m.w * r, hh = m.h * r; return Im(x + (w - ww) / 2, y + (h - hh) / 2, ww, hh, m.src); }

/* ---------- 차트 (캔버스 → PNG) ---------- */
const CH_FONT = "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo','Noto Sans KR','Noto Sans CJK KR',sans-serif";
const PAL = ['#0B1F8A', '#1E8B3A', '#2A44D4', '#22A04A', '#E8750A', '#7A2E8E', '#0E7C86', '#C0392B', '#64748B'];
function chartCanvas(w, h) { const S = 2, c = document.createElement('canvas'); c.width = w * S; c.height = h * S; const g = c.getContext('2d'); g.scale(S, S); return [c, g]; }
function barChart(labels, values, o = {}) {
  const W = o.w || 900, H = o.h || 460, [c, g] = chartCanvas(W, H), padL = 70, padB = 70, padT = 40, padR = 20;
  const max = Math.max(1, ...values) * 1.15, bw = (W - padL - padR) / labels.length;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#E3E7EE'; g.lineWidth = 1; g.font = `13px ${CH_FONT}`; g.fillStyle = '#6B7385'; g.textAlign = 'right';
  for (let i = 0; i <= 4; i++) { const y = padT + (H - padT - padB) * (1 - i / 4); g.beginPath(); g.moveTo(padL, y); g.lineTo(W - padR, y); g.stroke(); g.fillText((o.fmt || (v => Math.round(v).toLocaleString()))(max * i / 4), padL - 8, y + 4); }
  values.forEach((v, i) => {
    const x = padL + i * bw + bw * 0.18, bh = (H - padT - padB) * v / max, y = H - padB - bh, ww = bw * 0.64;
    const gr = g.createLinearGradient(0, y, 0, H - padB); const col = (o.colors && o.colors[i]) || PAL[i % 2]; gr.addColorStop(0, col); gr.addColorStop(1, col + 'B0');
    g.fillStyle = gr; g.beginPath(); g.roundRect ? g.roundRect(x, y, ww, bh, [6, 6, 0, 0]) : g.rect(x, y, ww, bh); g.fill();
    g.fillStyle = '#18224F'; g.textAlign = 'center'; g.font = `bold 15px ${CH_FONT}`; g.fillText((o.vfmt || (v => Math.round(v).toLocaleString()))(v), x + ww / 2, y - 8);
    g.font = `14px ${CH_FONT}`; g.fillStyle = '#3A4366'; String(labels[i]).split('\n').forEach((t, k) => g.fillText(t, x + ww / 2, H - padB + 22 + k * 17));
  });
  return { src: c.toDataURL('image/png'), w: W, h: H };
}
function donut(items, o = {}) {
  const W = o.w || 520, H = o.h || 420, [c, g] = chartCanvas(W, H), cx = o.legend === false ? W / 2 : H / 2 + 10, cy = H / 2, R = H / 2 - 24, r = R * 0.6;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  const tot = items.reduce((a, x) => a + x.value, 0) || 1; let a0 = -Math.PI / 2;
  items.forEach((x, i) => { const a1 = a0 + 2 * Math.PI * x.value / tot; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a1); g.closePath(); g.fillStyle = x.color || PAL[i % PAL.length]; g.fill(); a0 = a1; });
  g.beginPath(); g.arc(cx, cy, r, 0, 2 * Math.PI); g.fillStyle = '#fff'; g.fill();
  g.textAlign = 'center'; g.fillStyle = '#18224F'; g.font = `bold 30px ${CH_FONT}`; g.fillText(o.center || String(tot), cx, cy + 6);
  if (o.sub) { g.font = `14px ${CH_FONT}`; g.fillStyle = '#6B7385'; g.fillText(o.sub, cx, cy + 28); }
  if (o.legend !== false) items.forEach((x, i) => { const y = 40 + i * 30, lx = cx + R + 30; g.fillStyle = x.color || PAL[i % PAL.length]; g.fillRect(lx, y - 12, 16, 16); g.fillStyle = '#18224F'; g.textAlign = 'left'; g.font = `15px ${CH_FONT}`; g.fillText(`${x.label}  ${(x.value / tot * 100).toFixed(1)}%`, lx + 24, y + 2); });
  return { src: c.toDataURL('image/png'), w: W, h: H };
}
/* 운영 네트워크 분포도 — 사업장 좌표(사업장 현황 지도 기준) + 지사 + 제안 대상 */
function networkMap(focus, o = {}) {
  const W = o.w || 900, H = o.h || 720, [c, g] = chartCanvas(W, H);
  const pts = SITES.filter(s => s.lat), lat = pts.map(s => s.lat).concat(BRANCHES.map(b => b.lat)), lng = pts.map(s => s.lng).concat(BRANCHES.map(b => b.lng));
  if (focus && focus.lat) { lat.push(focus.lat); lng.push(focus.lng); }
  const la0 = Math.min(...lat) - 0.25, la1 = Math.max(...lat) + 0.25, lo0 = Math.min(...lng) - 0.3, lo1 = Math.max(...lng) + 0.3;
  const sc = Math.min((W - 60) / ((lo1 - lo0) * 0.82), (H - 60) / (la1 - la0)), ox = (W - (lo1 - lo0) * 0.82 * sc) / 2, oy = (H - (la1 - la0) * sc) / 2;
  const X = l => ox + (l - lo0) * 0.82 * sc, Y = l => oy + (la1 - l) * sc;
  const bg = g.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#EEF3FB'); bg.addColorStop(1, '#E4EEF6'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(11,31,138,.06)'; for (let x = 0; x < W; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  const BC = { 동부: '#1E8B3A', 서부: '#0B1F8F', 남부: '#C2410C', 중부: '#6D28D9' };
  pts.forEach(s => { const b = BRANCHES.find(x => x.key === s.br); if (b) { g.strokeStyle = (BC[s.br] || '#333') + '30'; g.beginPath(); g.moveTo(X(b.lng), Y(b.lat)); g.lineTo(X(s.lng), Y(s.lat)); g.stroke(); } });
  pts.forEach(s => { g.beginPath(); g.arc(X(s.lng), Y(s.lat), 4.5, 0, 7); g.fillStyle = BC[s.br] || '#333'; g.globalAlpha = .75; g.fill(); g.globalAlpha = 1; });
  BRANCHES.forEach(b => { const x = X(b.lng), y = Y(b.lat); g.beginPath(); g.arc(x, y, 13, 0, 7); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 4; g.strokeStyle = BC[b.key]; g.stroke();
    g.font = `bold 17px ${CH_FONT}`; g.fillStyle = '#0F1530'; g.textAlign = 'left'; g.fillText(b.name, x + 18, y + 6); });
  if (focus && focus.lat) { const x = X(focus.lng), y = Y(focus.lat); g.beginPath(); g.arc(x, y, 22, 0, 7); g.fillStyle = 'rgba(232,117,10,.25)'; g.fill(); g.beginPath(); g.arc(x, y, 9, 0, 7); g.fillStyle = '#E8750A'; g.fill();
    g.font = `bold 18px ${CH_FONT}`; g.fillStyle = '#B45309'; g.textAlign = 'right'; g.fillText(focus.name, x - 16, y - 14); }
  g.font = `13px ${CH_FONT}`; g.fillStyle = '#6B7385'; g.textAlign = 'left'; g.fillText(`● 운영 사업장 ${pts.length}곳 · ○ 지사 ${BRANCHES.length}곳 — 사업장 현황 지도 좌표 기준`, 16, H - 14);
  return { src: c.toDataURL('image/png'), w: W, h: H };
}
function kmBetween(a, b) { const R = 6371, d = x => x * Math.PI / 180, dl = d(b.lat - a.lat), dn = d(b.lng - a.lng); const h = Math.sin(dl / 2) ** 2 + Math.cos(d(a.lat)) * Math.cos(d(b.lat)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); }
function nearBranch(st) { if (!st || !st.lat) return null; return BRANCHES.map(b => ({ b, km: kmBetween(st, b) })).sort((x, y) => x.km - y.km)[0]; }
function nearSites(st, n = 5) { if (!st || !st.lat) return []; return SITES.filter(s => s.lat && s.id !== st.id).map(s => ({ s, km: kmBetween(st, s) })).sort((a, b) => a.km - b.km).slice(0, n); }
/* 반투명 그라데이션 덮개 */
function veil(dir = 'h', a0 = 0.92, a1 = 0.15, col = '7,18,79') { return gradient(800, 450, [[0, `rgba(${col},${a0})`], [1, `rgba(${col},${a1})`]], dir); }
