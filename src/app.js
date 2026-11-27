(function(){
'use strict';

/* ================= TIỆN ÍCH ================= */
var doc = document;
function $(s, r){ return (r || doc).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
function el(tag, cls, text){
  var n = doc.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function svg(name, cls){
  var s = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', 'ico' + (cls ? ' ' + cls : ''));
  s.setAttribute('aria-hidden', 'true');
  var u = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
  u.setAttribute('href', '#i-' + name);
  s.appendChild(u);
  return s;
}
function num(v){ var n = parseFloat(v); return isFinite(n) ? n : 0; }
/* Giữ tối đa 15 chữ số có nghĩa: chỉ dọn nhiễu nhị phân của JavaScript
   (ví dụ 0.1 + 0.2 = 0.30000000000000004 → 0.3), không làm tròn số liệu thực. */
function dec(n){
  n = Number(n);
  if (!isFinite(n) || n === 0) return 0;
  /* Nếu một giá trị ngắn hơn (ít chữ số hơn) nằm trong sai số nhị phân cho phép
     thì dùng giá trị đó; nhờ vậy 6.31142000000001 → 6.31142 nhưng vẫn giữ
     nguyên các số thực có nhiều chữ số. */
  for (var p = 1; p < 15; p++) {
    var r = Number(n.toPrecision(p));
    if (Math.abs(n - r) <= Math.abs(n) * 1e-12) return r;
  }
  return Number(n.toPrecision(15));
}
/* Lưu và tính bằng đồng nguyên. Người dùng vẫn gõ và đọc theo nghìn đồng. */
var DONG_PER_K = 1000;
var NAME_MAX = 200;
var QTY_MAX = 1e6;
var GRAMS_MAX = 1e9;
var THANG_MAX = 1e4;
var MONEY_MAX = 1e12;
/* Cùng luật với isNonNegNumber ở server.js: chỉ nhận number hữu hạn hoặc chuỗi số thập phân; loại boolean, '', ' ', null, mảng, '0x10'. */
function isNumLike(v){ return typeof v === 'number' ? isFinite(v) : (typeof v === 'string' && /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(v.trim())); }
function inRange(v, min, max){ if (!isNumLike(v)) return false; var n = Number(v); return n >= min && n <= max; }

  /* Kiểm trần giới hạn, dùng đúng hằng hiện có. Trả về null (hợp lệ) hoặc chuỗi lỗi. */
  function checkLimits(kind, v){
    var n = Number(v);
    var neg = isFinite(n) && n < 0;
    switch (kind) {
      case 'q':
        if (!isNumLike(v)) return 'Số lượng không hợp lệ';
        if (neg) return 'Số lượng không được âm';
        return inRange(v, 0, QTY_MAX) ? null : 'Số lượng vượt giới hạn (' + QTY_MAX + ')';
      case 'grams':
        if (!isNumLike(v)) return 'Gram không hợp lệ';
        if (neg) return 'Gram không được âm';
        return inRange(v, 0, GRAMS_MAX) ? null : 'Gram vượt giới hạn (' + GRAMS_MAX + ')';
      case 'thang':
        if (!isNumLike(v)) return 'Số thang không hợp lệ';
        if (neg) return 'Số thang không được âm';
        if (n < 1) return 'Số thang phải lớn hơn hoặc bằng 1';
        return inRange(v, 1, THANG_MAX) ? null : 'Số thang vượt giới hạn (' + THANG_MAX + ')';
      case 'money':
        /* v là ĐỒNG (đã qua kToDong); MONEY_MAX là đồng; chỉ thông báo đổi sang nghìn đồng để hiển thị. */
        if (!isNumLike(v)) return 'Số tiền không hợp lệ';
        if (n < 0) return 'Tiền không được âm';
        return n <= MONEY_MAX ? null : 'Tiền vượt giới hạn (' + fmtNum(MONEY_MAX / DONG_PER_K) + ' nghìn đồng)';
      case 'name': return String(v || '').length <= NAME_MAX ? null : 'Tên vượt giới hạn (' + NAME_MAX + ' ký tự)';
      default: return null;
    }
  }
function isRealDateISO(s){ s = String(s || ''); return parseDateVN(s) === s; }
function money(v){ return Math.round(num(v)); }
function kToDong(k){ return Math.round(num(k) * DONG_PER_K); }
function kInput(dong){
  return String(Math.round(num(dong)) / DONG_PER_K);
}
/* Hiển thị đầy đủ chữ số, không làm tròn. Dùng dấu . phân cách nghìn, , thập phân. */
function fmtNum(n){
  var v = dec(n);
  if (v === 0) return '0';
  var neg = v < 0;
  if (neg) v = -v;
  var s = String(v);
  if (s.indexOf('e') >= 0) {
    s = v.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
    if (!s) s = '0';
  }
  var parts = s.split('.');
  var ip = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  var fp = parts[1] ? ',' + parts[1] : '';
  return (neg ? '-' : '') + ip + fp;
}
/* Quy ước hiển thị: 1 kg = 10 lạng = 1000 g  ·  1 tr = 1000 */
function fmtQty(kg){
  var n = dec(kg);
  var a = Math.abs(n);
  if (a === 0) return '0g';
  if (a >= 1) return fmtNum(n) + ' kg';
  var lang = dec(n * 10);
  if (Math.abs(lang) >= 1) return fmtNum(lang) + ' lạng';
  return fmtNum(dec(n * 1000)) + ' g';
}
/* 2.14.0 N6: gợi ý đơn vị trong ô số lượng – cùng hàm fmtQty như khi hiển thị sau lưu; không đổi value. */
function qtyHintText(v, unit){
  var n = num(v);
  if (!(n > 0)) return '';
  var kg = unit === 'g' ? n / 1000 : n;
  /* Chỉ trong gợi ý: "lạng" viết tắt "l" cho gọn; fmtQty (toàn app) giữ nguyên. */
  return '(' + (isDesk() ? fmtQty(kg) : fmtQty(kg).replace(' lạng', ' l')) + ')'; /* 2.26.0: desktop viết đủ "lạng" */
}
/* 2.14.0 S1: vùng chữ tối thiểu (px) của ô số khi gợi ý đang hiện. */
var QTY_TEXT_MIN = 56;
var QTY_LABEL_W = 45; /* 2.14.0 S2: bề rộng nhãn "SL (KG)" (px) để gợi ý trên dòng nhãn không đè nhãn. */
/* S2: vị trí gợi ý – 'hidden' chỉ khi không có giá trị hợp lệ/ô chưa hiển thị; đủ chỗ → 'inside'; hết chỗ → 'label' (dòng nhãn). */
/* M2: các dạng hiển thị của gợi ý khi hết chỗ trên dòng nhãn, từ đầy đủ đến ngắn nhất (luôn còn đơn vị). */
function qtyHintCandidates(t){
  if (!t) return [''];
  var a = String(t), b = a.replace(/^\(|\)$/g, '');
  var c = b.replace(/,\d+/, '');
  var u = b.split(' ').pop();
  var out = [a, b, c, u], seen = {}, r = [];
  for (var i = 0; i < out.length; i++) if (!seen[out[i]]) { seen[out[i]] = 1; r.push(out[i]); }
  return r;
}
function qtyHintPlacement(clientWidth, padR, hintW, want){
  if (!want || !(clientWidth > 0)) return 'hidden';
  return (clientWidth - (11 + hintW) - padR >= QTY_TEXT_MIN) ? 'inside' : 'label';
}
/* N1: làm mới gợi ý của mọi ô số đã gắn gợi ý (sau khi mã gán value rỗng). */
var QTY_HINT_SEQ = 0; /* N3: id mô tả duy nhất theo bộ đếm (không trùng giữa các ô). */
function refreshAllQtyHints(){
  var list = doc.querySelectorAll('input.qty-hinted');
  for (var i = 0; i < list.length; i++) {
    if (list[i].qtyHintRefresh) list[i].qtyHintRefresh();
  }
}
function attachQtyHint(input, unit){
  if (!input || !input.parentNode) return null;
  var host = input.parentNode;
  if (!host.classList || !host.classList.contains('qty-host')) {
    /* Bọc riêng ô số lượng: gợi ý căn đúng theo khung ô, không theo cả .field/td (có nhãn phía trên). */
    var w = doc.createElement('span');
    w.className = 'qty-host';
    host.insertBefore(w, input);
    w.appendChild(input);
    host = w;
  }
  var h = doc.createElement('span');
  h.className = 'qty-hint';
  h.setAttribute('aria-hidden', 'true');
  host.appendChild(h);
  var sr = doc.createElement('span');
  sr.className = 'sr';
  sr.id = 'qty-hintsr-' + (++QTY_HINT_SEQ);
  host.appendChild(sr);
  input.setAttribute('aria-describedby', sr.id);
  input.classList.add('qty-hinted');
  /* 2.14.0 S1: gợi ý chiếm chỗ trong ô (padding-left bằng JS, class .has-hint) khi còn ≥ QTY_TEXT_MIN px cho chữ số; 2.14.0 S2: hết chỗ thì chuyển lên dòng nhãn (mép phải), chỉ ẩn khi không có giá trị hợp lệ. */
  var fit = function(){
    input.classList.remove('has-hint');
    input.style.paddingLeft = '';
    h.className = 'qty-hint';
    host.classList.remove('qty-host--lbl');
    h.style.maxWidth = '';
    h.textContent = h._full || '';
    var cs = window.getComputedStyle(input);
    var padR = parseFloat(cs.paddingRight) || 0;
    /* M1: bề rộng khung padding (gồm padding, không gồm viền) lấy từ getBoundingClientRect – không dùng clientWidth (tùy trình duyệt/loại ô). */
    var rw = input.getBoundingClientRect ? input.getBoundingClientRect().width : 0;
    var cw = rw > 0 ? rw - (parseFloat(cs.borderLeftWidth) || 0) - (parseFloat(cs.borderRightWidth) || 0) : 0;
    var place = qtyHintPlacement(cw, padR, 0, !!h._want);
    if (place === 'hidden') { h.hidden = true; return; }
    h.hidden = false;
    var hw = h.offsetWidth;
    place = qtyHintPlacement(cw, padR, hw, true);
    if (place === 'inside') {
      input.classList.add('has-hint');
      input.style.paddingLeft = (11 + hw) + 'px';
    } else {
      var inTd = !!(input.closest && input.closest('td'));
      h.className = 'qty-hint qty-hint--label' + (inTd ? '' : ' qty-hint--above');
      if (inTd) host.classList.add('qty-host--lbl');
      /* M2: không cắt bằng "…"; thử lần lượt các dạng rút gọn nội dung, luôn giữ đơn vị. */
      var maxW = isDesk() ? 58 : Math.max(0, (host.offsetWidth || cw) - QTY_LABEL_W - 6); /* 2.20.7 desktop: ô gợi ý riêng bên trái ô số, chữ tối đa 58px */
      var cands = qtyHintCandidates(h._full || '');
      for (var ci = 0; ci < cands.length; ci++) {
        h.textContent = cands[ci];
        if (h.offsetWidth <= maxW) break;
      }
    }
  };
  var upd = function(){
    var t = qtyHintText(input.value, typeof unit === 'function' ? unit() : unit);
    h.textContent = t;
    sr.textContent = t ? 'Quy đổi ' + t : '';
    h._full = t;
    h._want = !!t;
    fit();
  };
  input.addEventListener('input', upd);
  input.addEventListener('change', upd);
  input.qtyHintRefresh = upd;
  if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') new window.ResizeObserver(fit).observe(input);
  upd();
  return h;
}
function fmtMoney(dong){
  /* Hiển thị nghìn đồng, giữ tới 3 số lẻ để thấy từng đồng (0,4 nghĩa là 400 đồng). */
  var v = num(dong) / DONG_PER_K;
  var neg = v < 0;
  if (neg) v = -v;
  var rounded = Math.round(v * DONG_PER_K) / DONG_PER_K;
  var bits = rounded.toFixed(3).replace(/\.?0+$/, '').split('.');
  var ip = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  var fp = bits[1] ? ',' + bits[1] : '';
  return (neg ? '-' : '') + (ip || '0') + fp;
}
/* 2.15.1: chỉ để hiển thị chú giải tháng – phần nguyên của nghìn đồng, CẮT bỏ phần lẻ (không làm tròn). Không đổi dữ liệu. */
function fmtMoneyInt(dong){
  var d = Math.abs(Math.round(num(dong)));
  var k = Math.floor(d / DONG_PER_K);
  return (num(dong) < 0 && k > 0 ? '-' : '') + String(k).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
/* 2.15.2: số kg chỉ trong Thống kê – chọn đơn vị theo giá trị thật rồi CẮT phần lẻ (không làm tròn). fmtQty (nơi khác) giữ nguyên. */
function fmtQtyInt(kg){
  var n = dec(kg), a = Math.abs(n);
  var t = function(v){ var r = Math.trunc(dec(v)); return r === 0 ? 0 : r; };
  if (a === 0) return '0g';
  if (a >= 1) return fmtNum(t(n)) + ' kg';
  var lang = dec(n * 10);
  if (Math.abs(lang) >= 1) return fmtNum(t(lang)) + ' lạng';
  return fmtNum(t(dec(n * 1000))) + ' g';
}
function fmtUnitPrice(k){ return fmtMoney(k) + '/kg'; }
function pad2(n){ return n < 10 ? '0' + n : '' + n; }
function todayISO(){ var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function thisYear(){ return todayISO().slice(0, 4); }
/* 2.40.0 chốt sổ (docs/chot-so.md): bảng Tết dương lịch giờ VN, trùng close.js (test so). Năm sổ âm = từ Tết gần nhất <= ngày; ngoài bảng → 01/01. */
var TET = ['2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-02', '2031-01-23', '2032-02-11', '2033-01-31', '2034-02-19', '2035-02-08', '2036-01-28', '2037-02-15', '2038-02-04', '2039-01-24', '2040-02-12', '2041-02-01', '2042-01-22', '2043-02-10', '2044-01-30', '2045-02-17'];
function lunarStart(iso){
  var s = String(iso || '');
  for (var i = TET.length - 2; i >= 0; i--) if (s >= TET[i] && s < TET[i + 1]) return TET[i];
  return null;
}
function bookStart(today){ return lunarStart(today) || String(today || '').slice(0, 4) + '-01-01'; }
function parseDateVN(s){
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    var p = s.split('-');
    if (+p[0] < 2000 || +p[0] > 2100) return '';
    var dt0 = new Date(+p[0], +p[1] - 1, +p[2]);
    return (dt0.getFullYear() === +p[0] && dt0.getMonth() === +p[1] - 1 && dt0.getDate() === +p[2]) ? s : '';
  }
  var m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!m) return '';
  var d = +m[1], mo = +m[2], y = +m[3];
  if (y < 100) y += 2000;
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return '';
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
  return y + '-' + pad2(mo) + '-' + pad2(d);
}
function dateInputVN(iso){
  var p = String(iso || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '';
}
function setDateInput(id, iso){
  var n = $('#' + id);
  if (!n) return;
  n.value = dateInputVN(iso);
}
/* I.3: chạm vào ô tháng (ô chữ chỉ đọc, ô lịch gốc trong suốt phủ cả ô) mở khung lịch; không có showPicker thì chạm gốc của trình duyệt tự mở. */
function openPicker(nat){ try { if (nat.showPicker) nat.showPicker(); } catch (e) {} }
/* AC: Bán lẻ / Thuốc chén luôn ghi ngày hôm nay (như Nhập hàng); ô ngày chỉ HIỂN THỊ hôm nay, không chọn được. */
function showToday(id){ setDateInput(id, todayISO()); }
function refreshAutoDates(){
  showToday('retailDate');
  showToday('remedyDate');
  var today = todayISO();
  if (lastStatsDay && lastStatsDay !== today) {
    renderStats();
    renderBackupInfo();
    var cb = $('#chartBox');
    if (cb && cb.open) renderChart();
  }
}
function parseMonthVN(s){
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}$/.test(s)) {
    var y0 = +s.slice(0, 4), m0 = +s.slice(5, 7);
    return (y0 >= 1900 && y0 <= 2100 && m0 >= 1 && m0 <= 12) ? s : '';
  }
  var m = s.match(/^(\d{1,2})[\/\-.](\d{4})$/);
  if (!m) return '';
  var mo = +m[1], y = +m[2];
  return (y >= 1900 && y <= 2100 && mo >= 1 && mo <= 12) ? y + '-' + pad2(mo) : '';
}
function monthInputVN(ym){
  var p = String(ym || '').split('-');
  return p.length === 2 ? p[1] + '/' + p[0] : '';
}
function getMonthInput(id){
  var n = $('#' + id);
  if (!n) return '';
  return parseMonthVN(n.value) || n.getAttribute('data-ym') || '';
}
function setMonthInput(id, ym){
  var n = $('#' + id);
  if (!n) return;
  n.value = monthInputVN(ym);
  n.setAttribute('data-ym', ym || '');
  var nat = $('#' + id + 'Native');
  if (nat) nat.value = ym || '';
}
function bindMonthInput(id, onChange){
  var n = $('#' + id), nat = $('#' + id + 'Native');
  if (!n) return;
  n.addEventListener('change', function(){
    var ym = parseMonthVN(n.value);
    if (ym) { setMonthInput(id, ym); onChange(); return; }
    if (!n.value.trim()) { setMonthInput(id, ''); onChange(); return; }
    setMonthInput(id, n.getAttribute('data-ym') || '');
    toast('Tháng không hợp lệ, dùng mm/yyyy', 'error');
  });
  if (nat) {
    var syncNat = function(){ nat.value = parseMonthVN(n.value) || ''; };
    nat.addEventListener('focus', syncNat);
    nat.addEventListener('click', function(){ syncNat(); openPicker(nat); });
    nat.addEventListener('change', function(){
      if (nat.value) { setMonthInput(id, nat.value); onChange(); }
    });
  }
}
function uid(p){ return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
/* 2.40.4: tên "Bán lẻ" dành cho đơn bán lẻ (hộp đơn coi oname "Bán lẻ" là bán lẻ, nhánh cho dữ liệu cũ); không cho đặt tên đơn thuốc chén như vậy. */
var RETAIL_NAME_MSG = 'Tên "Bán lẻ" dành cho đơn bán lẻ, hãy đặt tên khác';
function isRetailName(n){ return String(n || '').normalize('NFC').toLowerCase() === 'bán lẻ'; }
function capWords(s){
  if (!s) return '';
  return String(s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()
    .replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, function(m, sep, ch){ return sep + ch.toUpperCase(); });
}
function normSearch(s){
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
/* Khóa so tên (vị thuốc và đơn thuốc dùng chung): NFC, gọn khoảng trắng, không phân biệt hoa/thường. Cùng luật với server.js. */
function nameKey(s){ return String(s).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase(); }
function sortByName(a, b){ return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }); }
function findProduct(id){
  for (var i = 0; i < db.products.length; i++) if (String(db.products[i].id) === String(id)) return db.products[i];
  return null;
}
var txIndex = null;
function indexTx(){
  txIndex = Object.create(null);
  db.transactions.forEach(function(t, i){ txIndex[t.id] = i; });
}
function tsFromId(id){
  var s = String(id || ''), v;
  var m = s.match(/_(\d{13})(?:_|$)/) || s.match(/(\d{13})$/);
  if (m) { v = Number(m[1]); if (v >= 1735689600000 && v < 2051222400000) return v; }
  m = s.match(/^[A-Za-z]+_([0-9a-z]{8})[0-9a-z]*$/);
  if (m) { v = parseInt(m[1], 36); if (v >= 1735689600000 && v < 2051222400000 && v <= Date.now() + 86400000) return v; }
  return 0;
}
function txStamp(t){
  var ts = num(t.ts);
  if (ts > 0) return ts;
  var idTs = tsFromId(t.id);
  if (idTs) return idTs;
  var base = Date.parse(String(t.date || '') + 'T00:00:00');
  if (!isFinite(base)) base = 0;
  if (!txIndex) indexTx();
  return base + (txIndex[t.id] || 0);
}
function txHasTime(t){
  return num(t.ts) > 0 || tsFromId(t.id) > 0;
}
function lastImport(id){
  var best = null, bestStamp = -Infinity;
  db.transactions.forEach(function(t){
    if (t.type !== 'NHAP' || String(t.productId) !== String(id) || !(num(t.price) > 0)) return;
    var s = txStamp(t);
    if (!best || String(t.date) > String(best.date) || (String(t.date) === String(best.date) && s >= bestStamp)) {
      best = t; bestStamp = s;
    }
  });
  return best ? { id: best.id, price: num(best.price), date: String(best.date), ts: bestStamp, hasTime: txHasTime(best) } : null;
}
function refPrice(p){
  var l = lastImport(p.id);
  return l ? l.price : num(p.costPrice);
}
function latestImportMap(){
  var m = {}, stamps = {}, dates = {};
  db.transactions.forEach(function(t){
    if (t.type !== 'NHAP' || !(num(t.price) > 0)) return;
    var pid = String(t.productId);
    var s = txStamp(t), d = String(t.date);
    if (!(pid in m) || d > dates[pid] || (d === dates[pid] && s >= stamps[pid])) { m[pid] = num(t.price); stamps[pid] = s; dates[pid] = d; }
  });
  return m;
}
function importParen(priceDong){
  if (!(num(priceDong) > 0)) return '';
  return '(' + fmtNum(dec(num(priceDong) / 1000)) + ')';
}
function costParen(costTotal, qty){
  if (costTotal == null || !(num(qty) > 0)) return '';
  var unit = num(costTotal) / num(qty);
  if (!(unit > 0)) return '';
  return '(' + fmtNum(dec(unit / 1000)) + ')';
}

/* ================= TRẠNG THÁI ================= */
var KEY = 'kho_db_local_v1';
var DIRTY_KEY = 'kho_db_dirty_v1';
var BASE_KEY = 'kho_cloud_base_v1';
var PAGE_SIZE = 10;
/* 2.39.7 desktop: Kho tồn, Lịch sử nhập/bán, đơn đã lưu (Thuốc chén): số dòng/trang = số dòng cao --tab-h vừa khung (box, trừ thead); khung ẩn (đo 0) thì giữ số lần trước. Đổi số dòng thì tính lại trang để dòng đầu đang xem vẫn trong trang. Điện thoại: PAGE_SIZE. */
var fitPs = {};
function fitPage(kind, box, page){
  if (!isDesk()) return { ps: PAGE_SIZE, page: page };
  var rh = 0, h = box ? box.clientHeight : 0, th = h && box.querySelector('thead');
  try { rh = parseFloat(window.getComputedStyle(doc.documentElement).getPropertyValue('--tab-h')) || 0; } catch (e) {}
  if (th) h -= th.offsetHeight;
  var old = fitPs[kind] || PAGE_SIZE, ps = h > 0 && rh > 0 ? Math.max(1, Math.floor(h / rh)) : old;
  fitPs[kind] = ps;
  return { ps: ps, page: ps === old ? page : Math.floor((Math.max(1, page) - 1) * old / ps) + 1 };
}
function refitLists(){
  if (!isDesk()) return;
  renderInventory(); renderHistory('imp'); renderHistory('exp'); renderPresetList();
}
function isDesk(){ return !!(doc.documentElement && doc.documentElement.classList && doc.documentElement.classList.contains('desktop')); }
var db = { products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
var invPage = 1, impPage = 1, expPage = 1;
var LOW_STOCK_KG = 1, STOCK_EPS = 1e-9, invFilter = ''; /* 2.32.0: Kho tồn lọc 'low' (0 < tồn ≤ 1 kg) / 'out' (tồn ≤ 0, dung sai 1e-9) */
function stockKind(s){ s = num(s); return s <= STOCK_EPS ? 'out' : (s <= LOW_STOCK_KG ? 'low' : ''); }
var cloudBase = 0;
var dirty = false;
var syncErrorShown = false;
var syncDetail = '';
var lastSyncOk = 0, syncNet = false, lastFresh = 0, FRESH_MS = 15000, STALE_MS = 60000; /* 2.39.10: lastFresh = lần cuối biết chắc máy này khớp bản mới nhất trên hub (pull thấy không mới hơn / đã áp / PUT xong) */ /* 2.25.0: mốc đồng bộ thành công gần nhất; lỗi hiện tại là mất mạng */
var quotaNote = '';
var quotaWarned = false;
var conflictOpen = false;
var dirtySince = 0;
var dirtyBadgeTimer = null;
var syncRetryTimer = null;
var syncRetryDelay = 4000;
var syncRejected = false;
var authLost = false;
var pushing = false;
var DIRTY_BADGE_MS = 4000;
var SYNC_RETRY_MAX = 60000;
var toastTimer = null;
var lastStatsDay = '';

/* AD: bỏ hàm đổi đơn vị nghìn → đồng. Dữ liệu kiểu cũ (không có moneyUnit === 'dong') bị TỪ CHỐI ở mọi cửa vào (init/pull/localStorage/IndexedDB/khôi phục file): không áp, không PUT. */
var LEGACY_MONEY_MSG = 'Dữ liệu kiểu cũ (tiền theo nghìn), không dùng được với bản này.';
var legacyRejected = false;
function isLegacyMoney(d){
  return !!(d && typeof d === 'object' && d.moneyUnit !== 'dong');
}
function sanitize(d, drops){
  var o = { products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
  if (!d || typeof d !== 'object') return o;
  o.updatedAt = dec(d.updatedAt);
  if (Array.isArray(d.products)) {
    var seenPid = Object.create(null), seenPname = Object.create(null);
    d.products.forEach(function(p){
      if (!p || !p.name) return;
      var id = String(p.id || uid('PROD'));
      var name = String(p.name).trim();
      if (!name) return;
      if (name.length > NAME_MAX) {
        if (drops) drops.push('Tên vị thuốc quá dài: ' + name.slice(0, 40) + '…');
        name = name.slice(0, NAME_MAX);
      }
      if (p.stock == null || p.stock === '' || p.costPrice == null || p.costPrice === '' ||
          !inRange(p.stock, 0, QTY_MAX) || !inRange(p.costPrice, 0, MONEY_MAX)) {
        if (drops) drops.push('Vị thuốc không hợp lệ: ' + name);
        return;
      }
      var pKey = nameKey(name);
      if (seenPid[id] || seenPname[pKey]) {
        if (drops) drops.push('Vị thuốc trùng: ' + name);
        return;
      }
      seenPid[id] = true;
      seenPname[pKey] = true;
      o.products.push({
        id: id,
        name: name,
        stock: dec(p.stock),
        costPrice: money(p.costPrice)
      });
    });
  }
  if (Array.isArray(d.transactions)) {
    var seenTid = Object.create(null);
    d.transactions.forEach(function(t){
      if (!t) return;
      var id = String(t.id || uid('TX'));
      if (seenTid[id]) {
        if (drops) drops.push('Giao dịch trùng id: ' + id);
        return;
      }
      seenTid[id] = true;
      var type = t.type;
      var date = String(t.date || '');
      var productId = String(t.productId || '').trim();
      if ((type !== 'NHAP' && type !== 'BAN') || !isRealDateISO(date) || !productId ||
          t.qty == null || t.qty === '' || !inRange(t.qty, 0, QTY_MAX) || !(Number(t.qty) > 0) ||
          t.price == null || t.price === '' || !inRange(t.price, 0, MONEY_MAX) ||
          t.total == null || t.total === '' || !inRange(t.total, 0, MONEY_MAX) ||
          (t.cost != null && !inRange(t.cost, 0, MONEY_MAX)) ||
          (t.g != null && !inRange(t.g, 0, GRAMS_MAX)) ||
          (t.thang != null && !inRange(t.thang, 1, THANG_MAX)) ||
          (t.unitPrice != null && !inRange(t.unitPrice, 0, MONEY_MAX)) ||
          (t.ts != null && !isNumLike(t.ts)) ||
          (t.open != null && t.open !== true && t.open !== false) || (t.open === true && type !== 'NHAP')) {
        if (drops) drops.push('Giao dịch không hợp lệ: ' + id);
        return;
      }
      var tx = {
        id: id,
        date: date,
        type: type,
        productId: productId,
        qty: dec(t.qty),
        price: money(t.price),
        total: money(t.total),
        cost: t.cost == null ? null : money(t.cost)
      };
      var oid = t.oid != null ? String(t.oid) : (t.orderId != null ? String(t.orderId) : null);
      var oname = t.oname != null ? String(t.oname).trim() : (t.orderName != null ? String(t.orderName).trim() : null);
      if (oname && oname.length > NAME_MAX) {
        if (drops) drops.push('Tên đơn quá dài: ' + oname.slice(0, 40) + '…');
        oname = oname.slice(0, NAME_MAX);
      }
      if (oid) tx.oid = oid;
      if (oname && oname !== oid) tx.oname = oname;
      if (t.retail) tx.retail = true;
      if (t.rx) tx.rx = true;
      if (t.g != null) tx.g = dec(t.g);
      if (t.thang != null) tx.thang = Math.round(Number(t.thang));
      if (t.unitPrice != null) tx.unitPrice = money(t.unitPrice);
      if (num(t.ts) > 0) tx.ts = num(t.ts);
      if (t.open === true) tx.open = true; /* 2.40.0 dòng tồn đầu kỳ: rơi cờ thì PUT bị luật Bảo vệ chặn */
      o.transactions.push(tx);
    });
  }
  if (Array.isArray(d.prescriptions)) {
    var seenRid = Object.create(null), seenRname = Object.create(null);
    d.prescriptions.forEach(function(r){
      if (!r || !r.name || !Array.isArray(r.items)) return;
      var rid = String(r.id || uid('RX'));
      var rname = String(r.name).trim();
      if (!rname) return;
      if (rname.length > NAME_MAX) {
        if (drops) drops.push('Tên đơn thuốc quá dài: ' + rname.slice(0, 40) + '…');
        rname = rname.slice(0, NAME_MAX);
      }
      var rtotal = (r.total == null || r.total === '') ? 0 : Number(r.total);
      var rthang = (r.thang == null || r.thang === '') ? 1 : Number(r.thang);
      if (!inRange(rtotal, 0, MONEY_MAX) || !inRange(rthang, 1, THANG_MAX)) {
        if (drops) drops.push('Đơn thuốc không hợp lệ: ' + rname);
        return;
      }
      var rnameKey = nameKey(rname);
      if (seenRid[rid] || seenRname[rnameKey]) {
        if (drops) drops.push('Đơn thuốc trùng: ' + rname);
        return;
      }
      var items = [], seenItem = Object.create(null);
      r.items.forEach(function(it){
        if (!it || !it.productId) return;
        var itemPid = String(it.productId);
        if (seenItem[itemPid]) return;
        if (!inRange(it.grams, 0, GRAMS_MAX) || !(Number(it.grams) > 0)) return;
        seenItem[itemPid] = true;
        items.push({ productId: itemPid, grams: dec(it.grams) });
      });
      if (!items.length) return;
      seenRid[rid] = true;
      seenRname[rnameKey] = true;
      o.prescriptions.push({
        id: rid,
        name: rname,
        items: items,
        total: money(rtotal),
        thang: Math.max(1, Math.round(rthang)),
        updatedAt: dec(r.updatedAt)
      });
    });
  }
  /* 2.40.0: bảng tóm tắt phần đã chốt (server sở hữu, chỉ đọc); tháng hỏng thì bỏ cả bảng, không làm rơi giao dịch. */
  var cl = d.closed;
  if (cl && typeof cl === 'object' && isRealDateISO(cl.cutoff) && Array.isArray(cl.months) && cl.months.every(function(e){
    return e && /^\d{4}-(0[1-9]|1[0-2])$/.test(String(e.m)) && inRange(e.imp, 0, MONEY_MAX) && inRange(e.rev, 0, MONEY_MAX) && inRange(e.cost, 0, MONEY_MAX);
  })) {
    o.closed = { cutoff: cl.cutoff, months: cl.months.map(function(e){ return { m: String(e.m), imp: money(e.imp), rev: money(e.rev), cost: money(e.cost) }; }) };
  }
  return o;
}
function readLocal(){
  try { return parseLocalRaw(localStorage.getItem(KEY)); } catch (e) { return null; }
}
function parseLocalRaw(raw){
  try {
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (isLegacyMoney(parsed)) { legacyRejected = true; return null; }
    return sanitize(parsed);
  } catch (e) { return null; }
}
function readDirty(){
  try { return localStorage.getItem(DIRTY_KEY) === '1'; } catch (e) { return false; }
}
function readBase(){
  try {
    var v = Number(localStorage.getItem(BASE_KEY));
    return isFinite(v) && v > 0 ? v : 0;
  } catch (e) { return 0; }
}
function armDirtyBadge(){
  if (!dirty) {
    dirtySince = 0;
    if (dirtyBadgeTimer) { clearTimeout(dirtyBadgeTimer); dirtyBadgeTimer = null; }
    return;
  }
  if (!dirtySince) dirtySince = Date.now();
  if (dirtyBadgeTimer || Date.now() - dirtySince >= DIRTY_BADGE_MS) return;
  dirtyBadgeTimer = setTimeout(function(){
    dirtyBadgeTimer = null;
    renderSyncBadge();
  }, DIRTY_BADGE_MS - (Date.now() - dirtySince));
}
function renderSyncBadge(){
  armDirtyBadge();
  var el = $('#syncBadge');
  var drop = $('#syncDiscard');
  var stale = !!(dirty && dirtySince && Date.now() - dirtySince >= DIRTY_BADGE_MS);
  var show = !!(authLost || syncErrorShown || quotaNote || stale);
  if (el) {
    el.hidden = !show;
    if (!show) el.textContent = '';
    else if (authLost) {
      el.textContent = 'Thiết bị này chưa được duyệt hoặc đã bị thu hồi.' +
        (dirty ? '\nThay đổi chưa gửi vẫn được giữ trên máy này.' : '') + '\n';
      var a = doc.createElement('a');
      a.href = '/auth/join';
      a.textContent = 'Nhập mã mời để vào lại';
      el.appendChild(a);
      if (quotaNote) el.appendChild(doc.createTextNode('\n' + quotaNote));
    } else {
      var parts = ['Chưa đồng bộ'];
      if (syncDetail) parts.push(syncDetail);
      if (quotaNote) parts.push(quotaNote);
      el.textContent = parts.join('\n');
    }
  }
  if (drop) drop.hidden = !syncRejected || authLost;
  renderSyncLine();
}
/* 2.25.0: dòng trạng thái ở thanh bên desktop (#syncLine): chấm xanh khi ổn, đỏ khi lỗi. Chỉ đọc cờ có sẵn. */
function renderSyncLine(){
  var el = $('#syncLine'), m = $('#syncLineM');
  if (!el && !m) return;
  var stale = !!(dirty && dirtySince && Date.now() - dirtySince >= DIRTY_BADGE_MS);  /* cùng điều kiện huy hiệu */
  var bad = authLost || syncErrorShown || stale, d = new Date(lastSyncOk);
  var st = bad ? 'err' : lastSyncOk && Date.now() - lastFresh > STALE_MS ? 'warn' : 'ok'; /* 2.39.10: chấm vàng khi quá 60s chưa xác nhận khớp hub */
  var txt = authLost ? 'Chưa lưu được' : syncErrorShown ? (syncNet ? 'Mất kết nối — đang thử lại…' : 'Chưa lưu được') :
    stale ? 'Chưa đồng bộ' : lastSyncOk ? 'Đã đồng bộ ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) : 'Đang kết nối…';
  if (el) { el.setAttribute('data-st', st); el.textContent = txt; }
  if (m) { /* H.2: dòng đồng bộ trên thanh đầu điện thoại: chấm + HH:MM */
    m.setAttribute('data-st', st); m.setAttribute('aria-label', txt); m.title = txt;
    var t = $('.syncm__t', m); if (t) t.textContent = lastSyncOk ? pad2(d.getHours()) + ':' + pad2(d.getMinutes()) : '--:--';
  }
}
function scheduleSyncRetry(){
  if (syncRetryTimer || conflictOpen || syncRejected) return;
  var wait = syncRetryDelay;
  syncRetryTimer = setTimeout(function(){
    syncRetryTimer = null;
    if ((dirty || syncErrorShown) && !syncRejected && !conflictOpen && !pushing) {
      if (busyEditing()) scheduleSyncRetry();
      else { syncRetryDelay = Math.min(syncRetryDelay * 2, SYNC_RETRY_MAX); pushState(false); }
    }
  }, wait);
}
function noteAuthLost(){
  if (!authLost) toast('Thiết bị này chưa được duyệt hoặc đã bị thu hồi. Dữ liệu chưa gửi vẫn giữ trên máy này.', 'error');
  authLost = true;
  syncRejected = false;        // 401 không phải "dữ liệu bị từ chối": không cho bỏ nháp
  syncErrorShown = false;      // huy hiệu do authLost quản lý
  syncDetail = '';
  if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
  renderSyncBadge();
}
function noteSyncFailure(detail, retry, net){
  syncErrorShown = true;
  syncNet = !!net;
  syncDetail = detail || 'Dữ liệu trên máy này chưa lên máy chủ.';
  syncRejected = !retry;
  renderSyncBadge();
  /* 400/428 từ chối đúng dữ liệu này. Gửi lại chỉ lặp cùng một lỗi. */
  if (retry) scheduleSyncRetry();
  else if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
}
/* 2.15.0: nút "Tải lại" chỉ hiện khi chạy từ màn hình chính (iPhone không có nút tải lại). */
function isStandaloneMode(){
  try {
    if (navigator && navigator.standalone === true) return true;
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  } catch (e) { return false; }
}
function renderReloadBtn(){
  var b = $('#syncLineM'); /* H.2: dòng đồng bộ trên đầu điện thoại bấm = Tải lại, chỉ khi chạy từ màn hình chính; desktop tải lại bằng logo */
  if (!b) return;
  if (!isDesk() && isStandaloneMode()) b.setAttribute('data-action', 'reload-app'); else b.removeAttribute('data-action');
}
/* H.2: điện thoại: chuyển logo/thẻ Bán+Lợi nhuận/8 tab vào .top (nút có sẵn, giữ listener), thêm dòng đồng bộ; desktop không đổi. */
function phoneTop(){
  if (isDesk()) return;
  var top = $('.top'), btn = $('#brandBtn'), logo = $('#brandLogo'), st = $('.stats'), tabs = $('#tabs');
  if (!top || !btn || !st || !tabs || !top.insertBefore || $('#syncLineM')) return;
  var r = doc.createElement('div'), m = doc.createElement('button'), d = doc.createElement('i'), t = doc.createElement('span');
  r.className = 'top__r'; m.id = 'syncLineM'; m.type = 'button'; m.className = 'syncm'; d.className = 'syncm__d'; t.className = 'syncm__t';
  m.appendChild(d); m.appendChild(t);
  if (logo) btn.insertBefore(logo, btn.firstChild);
  btn.setAttribute('aria-label', 'Quản Lý Kho');
  r.appendChild(btn); r.appendChild(st); r.appendChild(m);
  top.insertBefore(r, top.firstChild);
  top.insertBefore(tabs, $('.top .bar'));
}
/* 2.38.20 (điện thoại): nút lưu lên hàng đầu thẻ Bán lẻ/Nhập hàng; ô tên Nhập hàng vào ô tên của dòng nhập (Bán lẻ: entryMount). */
function phoneEntry(){
  if (isDesk()) return;
  [['#retailBox', '.btn--green'], ['#nhapBox', 'button[type="submit"]']].forEach(function(c){
    var bar = $(c[0] + ' .card__bar'), b = $(c[0] + ' .note__foot ' + c[1]);
    if (!bar || !b) return;
    var foot = b.parentNode;
    bar.appendChild(b);
    if (foot && !foot.children.length) foot.hidden = true;
  });
  var ns = $('#nhapSearch'), nb = $('#nhapPendingBody tr'), td = nb && nb.children[1];
  if (ns && td && ns.parentNode.parentNode !== td) td.insertBefore(ns.parentNode, td.firstChild);
}
/* 2.27.0: phép kiểm nháp của Tải lại (cờ chưa gửi + đơn nháp trong bộ nhớ); không đăng xuất, không xóa cookie. 2.28.0: Thoát đã bỏ (Tauri đóng bằng nút hệ điều hành). */
function draftOk(verb){
  /* Chỉ hỏi khi có đơn đang soạn (chỉ nằm trong bộ nhớ, tải lại là mất). Thay đổi đã lưu trên máy (dirty) giữ nguyên và tự gửi khi có mạng, không cần hỏi. */
  var pending = (dirty && quotaNote) /* dirty mà lưu trên máy lỗi (bộ nhớ đầy): thay đổi chỉ còn trong bộ nhớ */ || (retailItems && retailItems.length) || (remedyItems && remedyItems.length) || (nhapList && nhapList.length);
  return !pending || confirm('Còn đơn đang soạn chưa lưu. ' + verb + ' sẽ mất đơn đang soạn (các thay đổi đã lưu trên máy vẫn giữ và tự gửi khi có mạng). Vẫn ' + verb.toLowerCase() + '?');
}
function reloadAppClick(){
  if (!draftOk('Tải lại')) return false;
  if (idbBusy) idbChain.then(function(){ location.reload(); }); /* AA: chờ IndexedDB ghi xong rồi mới tải lại */
  else location.reload();
  return true;
}
function discardUnsynced(){
  if (authLost) {
    toast('Thiết bị chưa được duyệt nên chưa lấy được bản máy chủ. Dữ liệu vẫn giữ trên máy này.', 'error');
    return Promise.resolve(false);
  }
  if (!confirm('Bỏ các thay đổi chưa gửi và lấy bản trên máy chủ?\n\nMột file JSON của bản nháp sẽ được tải về trước khi bỏ.')) {
    return Promise.resolve(false);
  }
  if (!downloadBackup(false, 'kho-nhap-bi-tu-choi-' + backupStamp() + '.json', true)) {
    toast('Không tải được bản nháp — đã giữ nguyên dữ liệu trên máy này', 'error');
    return Promise.resolve(false);
  }
  return pullState(true).then(function(ok){
    if (ok) {
      if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
      syncRetryDelay = DIRTY_BADGE_MS;
      dirty = false;
      dirtySince = 0;
      syncErrorShown = false;
      syncDetail = '';
      syncRejected = false;
      renderSyncBadge();
      resetDrafts();
    } else if (!authLost) {
      toast('Chưa lấy được bản máy chủ — thay đổi chưa gửi vẫn được giữ trên máy này', 'error');
    }
    return ok;
  });
}
/* AA: bản db trên máy lưu trong IndexedDB (một khóa, dạng chuỗi JSON) vì localStorage Safari ~5 MB UTF-16. Khóa nhỏ (cờ dirty/base, cài đặt) vẫn ở localStorage. IndexedDB không có/lỗi thì dùng localStorage như cũ (idbMode = false). */
var IDB_NAME = 'kho_local', IDB_STORE = 'kv', IDB_REC = 'db';
var idbMode = false, idbHandle = null, idbBusy = false, idbPending = null, idbChain = Promise.resolve();
function idbAvailable(){
  try { return typeof indexedDB === 'object' && !!indexedDB && typeof indexedDB.open === 'function'; } catch (e) { return false; }
}
function idbOpen(){
  return new Promise(function(resolve, reject){
    var done = false;
    var tm = setTimeout(function(){ if (!done) { done = true; reject(new Error('idb timeout')); } }, 3000);
    try {
      var rq = indexedDB.open(IDB_NAME, 1);
      rq.onupgradeneeded = function(){ try { rq.result.createObjectStore(IDB_STORE); } catch (e) {} };
      rq.onsuccess = function(){
        if (done) { try { rq.result.close(); } catch (e) {} return; }
        done = true; clearTimeout(tm); resolve(rq.result);
      };
      rq.onerror = function(){ if (!done) { done = true; clearTimeout(tm); reject(rq.error || new Error('idb open')); } };
    } catch (e) { done = true; clearTimeout(tm); reject(e); }
  });
}
function idbTx(mode, run){
  return new Promise(function(resolve, reject){
    var out, tx;
    try { tx = idbHandle.transaction(IDB_STORE, mode); } catch (e) { reject(e); return; }
    tx.oncomplete = function(){ resolve(out); };
    tx.onerror = function(){ reject(tx.error || new Error('idb tx')); };
    tx.onabort = function(){ reject(tx.error || new Error('idb abort')); };
    try { run(tx.objectStore(IDB_STORE), function(v){ out = v; }); } catch (e) { reject(e); }
  });
}
function idbGetRaw(){ return idbTx('readonly', function(st, set){ var r = st.get(IDB_REC); r.onsuccess = function(){ set(r.result); }; }); }
function idbPutRaw(str){ return idbTx('readwrite', function(st){ st.put(str, IDB_REC); }); }
/* Cờ "db từng nằm trong IndexedDB" (localStorage). Nếu IndexedDB hỏng/treo mà KHÔNG còn KEY localStorage thì bản trên máy không đọc được (idbLost): tuyệt đối không ghi KEY/cờ dirty (sẽ mất bản nháp chưa gửi), chỉ xem bản máy chủ. */
var IDB_FLAG = 'kho_idb_v1', idbLost = false;
function localBundleLS(){
  var b = { local: readLocal(), wasDirty: readDirty(), savedBase: readBase() };
  try { if (!b.local && localStorage.getItem(IDB_FLAG) === '1') b.idbLost = true; } catch (e) {}
  return b;
}
/* Trả null nếu không có IndexedDB (init chạy đồng bộ như cũ), ngược lại Promise<{local, wasDirty, savedBase}> (không bao giờ reject). Di trú: IDB trống mà localStorage có KEY → chép sang, đọc lại KHỚP mới xóa KEY; mọi lỗi → giữ localStorage. Cả hai cùng có → localStorage luôn thắng (KEY chỉ còn khi chưa di trú hoặc IDB từng lỗi giữa chừng, nên luôn mới hơn). */
function loadLocalBundle(){
  if (!idbAvailable()) return null;
  var lsRaw = null;
  try { lsRaw = localStorage.getItem(KEY) || null; } catch (e) {}
  return idbOpen().then(function(h){
    idbHandle = h;
    return idbGetRaw().then(function(idbRaw){
      if (typeof idbRaw !== 'string' || !idbRaw) idbRaw = null;
      var fromLS = !!lsRaw; /* KEY localStorage chỉ còn khi chưa di trú hoặc IDB từng lỗi giữa chừng: luôn mới hơn bản IDB */
      var raw = fromLS ? lsRaw : idbRaw;
      var bundle = { local: raw ? parseLocalRaw(raw) : null, wasDirty: readDirty(), savedBase: readBase() };
      if (!fromLS) { idbMode = true; try { localStorage.setItem(IDB_FLAG, '1'); } catch (e) {} return bundle; }
      return idbPutRaw(lsRaw).then(function(){ return idbGetRaw(); }).then(function(back){
        if (back === lsRaw) { var removed = false; try { localStorage.removeItem(KEY); removed = true; } catch (e) {} idbMode = removed; /* KEY còn mà idbMode=true sẽ làm bản cũ đè bản mới ở lần mở sau */ if (removed) { try { localStorage.setItem(IDB_FLAG, '1'); } catch (e) {} } } else idbMode = false;
        return bundle;
      }, function(){ idbMode = false; return bundle; });
    });
  }).catch(function(){ idbMode = false; return localBundleLS(); });
}
function saveLocalLS(str, dirtyV, baseV){
  if (idbLost) { quotaNote = 'Không đọc được bộ nhớ máy (IndexedDB): thay đổi trên máy này chưa được lưu, hãy tải lại.'; renderSyncBadge(); return; }
  var keyOk = false;
  try {
    localStorage.setItem(KEY, str);
    keyOk = true;
  } catch (e) {
    var quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
    if (quota && !quotaWarned) {
      quotaWarned = true;
      quotaNote = 'Bộ nhớ trình duyệt đầy — bản nháp trên máy này có thể không giữ được.';
      renderSyncBadge();
    }
  }
  /* KEY lỗi: giữ base cũ (khớp KEY cũ), chỉ ghi cờ dirty khi đang dirty. */
  if (keyOk || dirtyV) {
    try { localStorage.setItem(DIRTY_KEY, dirtyV ? '1' : '0'); } catch (e2) {}
  }
  if (keyOk) {
    try { localStorage.setItem(BASE_KEY, String(baseV || 0)); } catch (e3) {}
  }
  if (keyOk && quotaNote) { quotaNote = ''; quotaWarned = false; renderSyncBadge(); }
}
/* IndexedDB: chụp chuỗi + cờ NGAY (đồng bộ, nhất quán), ghi tuần tự, bản mới nhất thắng; cờ dirty/base chỉ ghi vào localStorage SAU khi IDB đã commit (giữ nguyên bất biến "base đi cùng bản đã lưu"). IDB lỗi → rớt về localStorage với đúng bản đó, không mất dữ liệu. */
function idbDrain(){
  var snap = idbPending; idbPending = null;
  if (!snap) { idbBusy = false; return Promise.resolve(); }
  if (!idbMode) { try { saveLocalLS(snap.s, snap.d, snap.b); } catch (e) {} return idbDrain(); }
  return idbPutRaw(snap.s).then(function(){
    try { localStorage.setItem(DIRTY_KEY, snap.d ? '1' : '0'); } catch (e) {}
    try { localStorage.setItem(BASE_KEY, String(snap.b || 0)); } catch (e) {}
    if (quotaNote) { quotaNote = ''; quotaWarned = false; renderSyncBadge(); }
  }, function(){
    idbMode = false;
    saveLocalLS(snap.s, snap.d, snap.b);
  }).then(idbDrain, idbDrain); /* lỗi trong callback không được làm idbBusy kẹt true */
}
function saveLocal(){
  if (idbMode) {
    idbPending = { s: JSON.stringify(db), d: dirty, b: cloudBase };
    if (!idbBusy) { idbBusy = true; idbChain = idbDrain(); }
    return;
  }
  saveLocalLS(JSON.stringify(db), dirty, cloudBase);
}
function touch(){
  db.updatedAt = Math.max(Date.now(), num(db.updatedAt) + 1); /* tăng chặt (cùng luật server): đổi trong lúc PUT treo cùng mili-giây vẫn khác sent */
  if (!dirty) dirtySince = Date.now();
  dirty = true;
  saveLocal();
}

/* ================= THÔNG BÁO ================= */
/* N2: lỗi giữ 5 giây và báo assertive; thông báo thường 2,8 giây. Khi có hộp thoại đang mở, lỗi cũng hiện trong hộp (toast dưới lớp phủ dễ bị bỏ lỡ). */
function toast(msg, kind){
  var t = $('#toast'), m = $('#toastMsg');
  if (!t || !m) return;
  var isErr = kind === 'error';
  m.textContent = msg;
  t.setAttribute('data-kind', isErr ? 'error' : 'ok');
  t.setAttribute('role', isErr ? 'alert' : 'status');
  t.setAttribute('aria-live', isErr ? 'assertive' : 'polite');
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('is-on'); }, isErr ? 5000 : 2800);
  if (isErr) { var od = $('dialog[open]'); if (od) dlgErrorBox(od).textContent = msg; }
}
function dlgErrorBox(dlg){
  var box = dlg.querySelector('.dlg__err');
  if (box) return box;
  box = doc.createElement('div');
  box.className = 'dlg__err';
  box.setAttribute('role', 'alert');
  var card = dlg.querySelector('.dlg__card') || dlg;
  var head = card.querySelector('.card__head');
  if (head && head.nextSibling) card.insertBefore(box, head.nextSibling); else card.appendChild(box);
  return box;
}
function clearDlgErr(dlg){ var box = dlg.querySelector('.dlg__err'); if (box && box.parentNode) box.parentNode.removeChild(box); }

/* N4 (2.13.0): bấm "Quản Lý Kho": chỉ thiết bị chủ (fetch /auth/devices = 200) mới vào Thiết bị; còn lại rung icon và báo chỉ-đọc. Không đổi server. */
function devicesOwner(){
  return Promise.resolve().then(function(){
    return fetch('/auth/devices', { credentials: 'same-origin', redirect: 'manual', headers: { Accept: 'text/html' } });
  }).then(function(r){ return !!(r && r.status === 200); }, function(){ return false; });
}
/* 2.28.0 desktop: viên Sao lưu | Thiết bị trong tab Sao lưu khôi phục; Thiết bị: chủ → nút mở /auth/devices; thiết bị khác → lời báo. */
var devSeq = 0;
function bakView(v){
  var bx = $('#backupBox');
  if (!bx || !$('.bakseg')) return Promise.resolve();
  var seq = ++devSeq, m = $('#devMsg'), o = $('#devOpen');
  $$('.bak-sec', bx).forEach(function(s){ s.hidden = (s.id === 'devSec') !== (v === 'dev'); });
  $$('.bakseg .btn', bx).forEach(function(b){ if (b.getAttribute('data-view') === v) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  if (v !== 'dev') return Promise.resolve();
  if (o) o.hidden = true;
  if (m) m.textContent = 'Đang kiểm tra…';
  return devicesOwner().then(function(ok){
    if (seq !== devSeq) return;
    if (m) m.textContent = ok ? 'Thiết bị này là thiết bị chủ. Danh sách thiết bị, tạo mã mời, thu hồi và đăng xuất thiết bị nằm ở trang quản lý thiết bị (có liên kết "Về kho" để quay lại).' : 'Chỉ thiết bị chủ mới quản lý được thiết bị khác.';
    if (o) o.hidden = !ok;
  });
}
/* ================= DÒNG ĐƠN HÀNG ================= */
function renumber(tbody, base){
  var n = base || 0;
  Array.prototype.forEach.call(tbody.children, function(tr){
    if (tr.getAttribute('data-empty') === '1') return;
    n++;
    var c = tr.querySelector('.c-num');
    if (c) c.textContent = String(n);
  });
}
/* 2.38.20 (điện thoại, Bán lẻ): ô tên (#retailSearch, trong .sug) nằm trong ô tên của dòng nhập trống; khi dòng bị xóa/thay thì cất lại thanh đầu thẻ (ẩn) để không bị hủy theo dòng. */
function entrySug(k){ var s = $(k === 'remedy' ? '#remedySearch' : '#retailSearch'); return s ? s.parentNode : null; }
/* 2.38.28: Thuốc chén (k = 'remedy') dùng cùng cơ chế: cất lại trong #remedyNote (ẩn trên điện thoại) trước .note__list. */
function entryPark(k){
  var b = entrySug(k);
  if (k === 'remedy') { if (isDesk()) return; var n = $('#remedyNote'), l = $('#remedyNoteList'); if (b && n && l && b.parentNode !== n) n.insertBefore(b, l); return; } /* desktop: ô tên ở thanh đầu thẻ, không cất */
  var bar = $('#retailBox .card__bar'); if (b && bar && b.parentNode !== bar) bar.appendChild(b);
}
function entryMount(k){
  if (isDesk()) return;
  var b = entrySug(k), tr = $((k === 'remedy' ? '#remedyBody' : '#retailBody') + ' tr[data-empty="1"]'), td = tr && tr.children[1];
  if (b && td && b.parentNode !== td) { td.textContent = ''; td.appendChild(b); }
}
function clearEmpty(tb){
  if (!tb) return;
  if (tb.id === 'retailBody') entryPark();
  else if (tb.id === 'remedyBody') entryPark('remedy');
  var old = tb.querySelector('tr[data-empty="1"]');
  if (old) old.remove();
}
function orderEmpty(tb, cols, text){
  if (!tb) return;
  clearEmpty(tb);
  var has = false;
  Array.prototype.forEach.call(tb.children, function(tr){
    if (tr.getAttribute('data-empty') !== '1') has = true;
  });
  if (has) return;
  var tr = el('tr');
  tr.setAttribute('data-empty', '1');
  tr.className = 'is-empty';
  var td = el('td', 'empty-cell muted small', text);
  if ((tb.id === 'remedyBody' || tb.id === 'retailBody')) { /* 2.26.1/2.29.0 desktop: dòng đang gõ trống vẫn đủ ô: "+", chữ mờ, ô Gram/SL (+ ô Tiền ở Bán lẻ) và nút + vô hiệu (chỉ để thấy chỗ) */
    var rt = tb.id === 'retailBody', qd = el('input', 'inp inp--sm inp--num'), bd = el('button', 'btn btn--icon btn--primary');
    qd.disabled = bd.disabled = true; qd.placeholder = rt ? 'SL' : 'Gram'; qd.setAttribute('aria-label', rt ? 'Số lượng (kg)' : 'Số lượng (gram)'); bd.setAttribute('aria-label', 'Thêm vào tờ ghi'); bd.appendChild(svg('plus'));
    tr.appendChild(el('td', 'c-num muted')); tr.appendChild(td);
    var tq = el('td', 'c-qty'), tdl = el('td', 'c-del');
    tq.appendChild(qd); tdl.appendChild(bd); tr.appendChild(tq);
    if (rt) { var tm = el('td', 'c-money'), md = el('input', 'inp inp--sm inp--num'); md.disabled = true; md.placeholder = isDesk() ? 'Tiền (nghìn)' : 'Giá'; md.setAttribute('aria-label', 'Giá bán'); tm.appendChild(md); tr.appendChild(tm); }
    tr.appendChild(tdl);
    tb.appendChild(tr);
    entryMount(rt ? 'retail' : 'remedy');
    return;
  }
  td.colSpan = cols;
  tr.appendChild(td);
  tb.appendChild(tr);
}
/* 2.26.0/2.29.0 desktop: dòng đang gõ (tbody pendSel, cùng bảng) là dòng thứ n+1 của tờ ghi: đủ PAGE_SIZE dòng thì sang trang mới; sau nó mới tới dòng trống (fillSel). Điện thoại: fill = null, số trang như cũ. */
/* 2.39.6 desktop: tờ ghi không phân trang (vẽ mọi dòng, dòng đang gõ luôn cuối); trang 1e9 (= "tới cuối") thành end:true để cuộn tới dòng đang gõ. Điện thoại giữ trang PAGE_SIZE dòng. */
function notePaging(pendSel, n, page, cols){
  if (isDesk()) { orderEmpty($(pendSel), cols, ''); return { pages: 1, page: 1, from: 0, to: n, end: page >= 1e9 }; }
  var pages = Math.max(1, Math.ceil(n / PAGE_SIZE));
  page = Math.max(1, Math.min(page, pages));
  return { pages: pages, page: page, from: (page - 1) * PAGE_SIZE, to: Math.min(n, page * PAGE_SIZE) };
}
/* 2.39.6 desktop: cuộn khung tờ ghi (ít nhất) để phần tử e hiện ra dưới đầu bảng ghim: dòng đang gõ khi thêm dòng / chọn vị, dòng đang sửa khi chọn trùng vị. */
function noteTo(e){
  var l = isDesk() && e && e.closest && e.closest('.note__list');
  if (!l) return;
  var r = e.getBoundingClientRect(), b = l.getBoundingClientRect(), th = l.querySelector('thead'), h = th ? th.offsetHeight : 0;
  if (r.bottom > b.bottom) l.scrollTop += r.bottom - b.bottom;
  else if (r.top < b.top + h) l.scrollTop -= b.top + h - r.top;
}
function fmtGram(g){
  var n = dec(g);
  if (Math.abs(n) >= 1000) return fmtNum(dec(n / 1000)) + ' kg';
  return fmtNum(n) + ' g';
}
var remedyItems = [];
var remedyNotePage = 1;
var remedyEditIdx = -1;
function commitRemedyRow(){
  var tb = $('#remedyBody');
  if (!tb) return true;
  var row = tb.querySelector('tr[data-pid]');
  if (!row) return true;
  var g = num($('.remedy-qty', row).value);
  var limG = checkLimits('grams', g);
  if (limG) {
    toast(limG, 'error');
    var qi = $('.remedy-qty', row);
    if (qi) focusNS(qi);
    return false;
  }
  if (g <= 0) {
    var p = findProduct(row.getAttribute('data-pid'));
    toast('Dòng "' + (p ? p.name : '?') + '" thiếu gram', 'error');
    qi = $('.remedy-qty', row);
    if (qi) focusNS(qi);
    return false;
  }
  remedyItems.push({ productId: row.getAttribute('data-pid'), grams: dec(g) });
  remedyNotePage = 1e9;
  entryPark('remedy');
  tb.textContent = '';
  orderEmpty(tb, 4, '');
  refreshAllQtyHints();
  return true;
}
/* 2.15.3: sau "+" đưa focus về ô tìm để gõ vị tiếp theo (nút + có data-keep-focus nên ô số không mất focus trước đó). */
/* 2.15.9: focus lập trình trong luồng nhập KHÔNG để iOS tự cuộn trang (preventScroll); trình duyệt cũ thì focus thường. */
function focusNS(e){
  if (!e) return;
  try { e.focus({ preventScroll: true }); } catch (x) { e.focus(); }
}
function refocusSearch(sel, key){
  var s = $(sel);
  if (!s) return;
  focusNS(s);
  closeSuggest(key);
  compactSync(true); /* 2.15.6/2.15.8: thêm dòng -> đo lại 2 dòng cuối, cuộn mượt xuống cuối (guồng); 2.15.9: không định vị lại trang */
}
function addRemedyToNote(){
  var row = $('#remedyBody tr[data-pid]');
  if (!row) return;
  var qi = $('.remedy-qty', row);
  if (num(qi.value) <= 0) { toast('Nhập số gram lớn hơn 0', 'error'); focusNS(qi); return; }
  if (!commitRemedyRow()) return;
  calcRemedy();
  refocusSearch('#remedySearch', 'remedy');
}
function remedyNoteSave(){
  var it = remedyItems[remedyEditIdx];
  if (!it) { remedyEditIdx = -1; renderRemedyNote(); return; }
  var g = num(($('#remedyNoteEditQty') || {}).value);
  if (g <= 0) { toast('Số gram phải lớn hơn 0', 'error'); return; }
  var limRn = checkLimits('grams', g);
  if (limRn) { toast(limRn, 'error'); return; }
  it.grams = dec(g);
  remedyEditIdx = -1;
  calcRemedy();
}
function renderRemedyNote(){
  var tb = $('#remedyNoteBody');
  if (!tb) return;
  /* 2.14.0: STT dòng đang nhập = số dòng tờ ghi + 1 (tuyệt đối). */
  var pendingRb = $('#remedyBody');
  if (pendingRb) renumber(pendingRb, remedyItems.length);
  var enr = !isDesk() && $('#remedyBody tr[data-empty="1"] .c-num');
  if (enr) enr.textContent = String(remedyItems.length + 1);
  var pp = notePaging('#remedyBody', remedyItems.length, remedyNotePage, 4), pages = pp.pages;
  remedyNotePage = pp.page;
  var sum = 0;
  remedyItems.forEach(function(it){ sum += num(it.grams); });
  tb.textContent = '';
  for (var i = pp.from; i < pp.to; i++) {
    var it = remedyItems[i];
    var tr = el('tr');
    var p = findProduct(it.productId);
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', p ? p.name : 'Đã xóa'));
    var tdq, tda = el('td', 'c-act');
    var wrap = el('div', 'inline-row');
    if (i === remedyEditIdx) {
      tdq = el('td', 'c-qty');
      var qi = el('input', 'inp inp--sm inp--num');
      qi.id = 'remedyNoteEditQty'; qi.type = 'number'; qi.step = 'any'; qi.min = '0'; qi.inputMode = 'decimal';
      qi.value = String(num(it.grams));
      qi.setAttribute('aria-label', 'Số lượng (gram)');
      tdq.appendChild(qi);
      attachQtyHint(qi, 'g');
      var bs = el('button', 'btn btn--icon');
      bs.type = 'button'; bs.setAttribute('data-action', 'rnote-save'); bs.setAttribute('aria-label', 'Lưu dòng');
      bs.appendChild(svg('save'));
      var bc = el('button', 'btn btn--icon btn--danger');
      bc.type = 'button'; bc.setAttribute('data-action', 'rnote-cancel'); bc.setAttribute('aria-label', 'Hủy sửa');
      bc.appendChild(svg('x'));
      wrap.appendChild(bs); wrap.appendChild(bc);
    } else {
      tdq = el('td', 'num', fmtGram(it.grams));
      wrap.appendChild(rowMenu([
        { label: 'Sửa dòng', icon: 'edit', action: 'rnote-edit', idx: i },
        { label: 'Xóa dòng', icon: 'trash', action: 'rnote-del', idx: i, danger: true }
      ], 'Thao tác với dòng ' + (i + 1)));
    }
    tr.appendChild(tdq);
    tda.appendChild(wrap);
    tr.appendChild(tda);
    tb.appendChild(tr);
  }
  var tot = $('#remedyNoteTotal');
  if (tot) tot.textContent = fmtGram(sum);
  var tf = $('#remedyNoteFoot');
  if (tf) tf.hidden = !remedyItems.length;
  var pg = $('#remedyNotePg');
  if (pg) { pg.textContent = 'Trang ' + remedyNotePage + ' / ' + pages; pg.hidden = pages <= 1; }
  var host = $('#remedyNotePager');
  if (host) {
    host.hidden = pages <= 1;
    if (!host.hidden) renderPager(host, remedyNotePage, pages, 'rnote');
  }
  if (pp.end) noteTo($('#remedyBody'));
}
function addOrderRow(kind, pid){
  var isRetail = kind === 'retail';
  var tb = $(isRetail ? '#retailBody' : '#remedyBody');
  var p = findProduct(pid);
  if (!tb || !p) return null;
  clearEmpty(tb);

  var tr = el('tr');
  tr.setAttribute('data-pid', p.id);
  tr.className = 'is-row';
  tr.appendChild(el('td', 'c-num num muted'));
  tr.appendChild(el('td', 'b', p.name));

  var tdQ = el('td', 'c-qty');
  tdQ.setAttribute('data-label', isRetail ? 'SL (kg)' : 'SL (gram)');
  var qi = el('input', 'inp inp--sm inp--num ' + (isRetail ? 'retail-qty' : 'remedy-qty'));
  qi.type = 'number'; qi.step = 'any'; qi.min = '0'; qi.inputMode = 'decimal'; qi.placeholder = isDesk() ? (isRetail ? 'SL' : 'Gram') : '0';
  qi.max = isRetail ? '1000000' : '1000000000';
  qi.setAttribute('aria-label', isRetail ? 'Số lượng (kg)' : 'Số lượng (gram)');
  tdQ.appendChild(qi);
  attachQtyHint(qi, isRetail ? 'kg' : 'g');
  tr.appendChild(tdQ);

  if (isRetail) {
    var tdM = el('td', 'c-money');
    tdM.setAttribute('data-label', 'Giá bán');
    var mi = el('input', 'inp inp--sm inp--num retail-money');
    mi.type = 'number'; mi.step = 'any'; mi.min = '0'; mi.inputMode = 'decimal'; mi.placeholder = isDesk() ? 'Tiền (nghìn)' : '0';
    mi.max = '1000000000';
    mi.setAttribute('aria-label', 'Giá bán');
    tdM.appendChild(mi);
    tr.appendChild(tdM);
  }

  var tdD = el('td', 'c-del');
  var b = el('button', 'btn btn--icon btn--primary');
  b.type = 'button';
  b.setAttribute('data-action', isRetail ? 'note-add' : 'rnote-add');
  b.setAttribute('data-keep-focus', '');
  b.setAttribute('aria-label', 'Thêm vào tờ ghi');
  b.setAttribute('title', 'Thêm vào tờ ghi');
  b.appendChild(svg('plus'));
  tdD.appendChild(b);
  tr.appendChild(tdD);

  tb.appendChild(tr);
  renumber(tb, isRetail ? retailItems.length : remedyItems.length);

  return tr;
}
function resetRetail(){
  var tb = $('#retailBody');
  if (!tb) return;
  entryPark();
  tb.textContent = '';
  orderEmpty(tb, 5, '');
  retailItems = [];
  noteEditIdx = -1;
  notePage = 1;
  var s = $('#retailSearch');
  if (s) s.value = '';
  renderNote();
  refreshAllQtyHints();
}
function resetRemedy(){
  var tb = $('#remedyBody');
  if (!tb) return;
  entryPark('remedy');
  tb.textContent = '';
  orderEmpty(tb, 4, '');
  remedyItems = [];
  remedyEditIdx = -1;
  remedyNotePage = 1;
  var s = $('#remedySearch');
  if (s) s.value = '';
  var n = $('#remedyName');
  if (n) n.value = '';
  var sel = $('#remedyPreset');
  if (sel) sel.value = '';
  var up = $('#remedyUnitPrice');
  if (up) up.value = '';
  var th = $('#remedyThang');
  if (th) th.value = '1';
  calcRemedy();
  updatePresetUI();
  refreshAllQtyHints();
}
/* Xóa mọi bản nháp đang giữ trong bộ nhớ sau khi đã lấy bản máy chủ/khôi phục. */
function resetDrafts(){
  nhapList = [];
  retailItems = [];
  remedyItems = [];
  renderNhapList();
  resetNhapInputs();
  resetRetail();
  resetRemedy();
  closeTxEdit();
  if (orderCur) closeOrder();
}
var notePage = 1;
var retailItems = [];
var noteEditIdx = -1;
function renderNote(){
  var tb = $('#retailNoteBody');
  if (!tb) return;
  /* 2.14.0: STT dòng đang nhập = số dòng tờ ghi + 1 (tuyệt đối). */
  var pendingTb = $('#retailBody');
  if (pendingTb) renumber(pendingTb, retailItems.length);
  var enc = !isDesk() && $('#retailBody tr[data-empty="1"] .c-num');
  if (enc) enc.textContent = String(retailItems.length + 1);
  var impMap = latestImportMap();
  var pp = notePaging('#retailBody', retailItems.length, notePage, 5), pages = pp.pages;
  notePage = pp.page;
  var sum = 0;
  retailItems.forEach(function(it){ sum += num(it.amount); });
  tb.textContent = '';
  for (var i = pp.from; i < pp.to; i++) {
    var it = retailItems[i];
    var tr = el('tr');
    var p = findProduct(it.pid);
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', p ? p.name : 'Đã xóa'));
    var tdq, tdm, tda = el('td', 'c-act');
    var wrap = el('div', 'inline-row');
    if (i === noteEditIdx) {
      tdq = el('td', 'c-qty');
      var qi = el('input', 'inp inp--sm inp--num');
      qi.id = 'noteEditQty'; qi.type = 'number'; qi.step = 'any'; qi.min = '0'; qi.inputMode = 'decimal';
      qi.value = String(num(it.kg));
      qi.setAttribute('aria-label', 'Số lượng (kg)');
      tdq.appendChild(qi);
      attachQtyHint(qi, 'kg');
      tdm = el('td', 'c-money');
      var mi = el('input', 'inp inp--sm inp--num');
      mi.id = 'noteEditMoney'; mi.type = 'number'; mi.step = 'any'; mi.min = '0'; mi.inputMode = 'decimal';
      mi.value = kInput(it.amount);
      mi.setAttribute('aria-label', 'Giá bán');
      tdm.appendChild(mi);
      var bs = el('button', 'btn btn--icon');
      bs.type = 'button'; bs.setAttribute('data-action', 'note-save'); bs.setAttribute('aria-label', 'Lưu dòng');
      bs.appendChild(svg('save'));
      var bc = el('button', 'btn btn--icon btn--danger');
      bc.type = 'button'; bc.setAttribute('data-action', 'note-cancel'); bc.setAttribute('aria-label', 'Hủy sửa');
      bc.appendChild(svg('x'));
      wrap.appendChild(bs); wrap.appendChild(bc);
    } else {
      tdq = el('td', 'num', fmtQty(it.kg));
      var impPrice = impMap[String(it.pid)] || (p && num(p.costPrice) > 0 ? num(p.costPrice) : 0);
      if (impPrice > 0) {
        var sp = el('span', 'muted small', ' ' + importParen(impPrice));
        sp.setAttribute('title', 'Giá nhập gần nhất (nghìn đồng/kg)');
        tdq.appendChild(sp);
      }
      tdm = el('td', 'num r', fmtMoney(it.amount));
      wrap.appendChild(rowMenu([
        { label: 'Sửa dòng', icon: 'edit', action: 'note-edit', idx: i },
        { label: 'Xóa dòng', icon: 'trash', action: 'note-del', idx: i, danger: true }
      ], 'Thao tác với dòng ' + (i + 1)));
    }
    tr.appendChild(tdq);
    tr.appendChild(tdm);
    tda.appendChild(wrap);
    tr.appendChild(tda);
    tb.appendChild(tr);
  }
  var tot = $('#retailNoteTotal');
  if (tot) tot.textContent = fmtMoney(sum);
  var tf = $('#retailNoteFoot');
  if (tf) tf.hidden = !retailItems.length;
  var pg = $('#retailNotePg');
  if (pg) { pg.textContent = 'Trang ' + notePage + ' / ' + pages; pg.hidden = pages <= 1; }
  var host = $('#retailNotePager');
  if (host) {
    host.hidden = pages <= 1;
    if (!host.hidden) renderPager(host, notePage, pages, 'note');
  }
  if (pp.end) noteTo($('#retailBody'));
}
/* Cảnh báo (cho phép tiếp tục) khi giá bán/kg <= giá nhập gần nhất; không có giá nhập thì bỏ qua. */
function confirmBelowImport(pid, q, m){
  var l = lastImport(pid);
  if (!l || !(q > 0) || kToDong(m) / q > l.price) return true;
  var p = findProduct(pid);
  return confirm('Giá bán "' + (p ? p.name : '?') + '" không cao hơn giá nhập gần nhất (' + fmtNum(l.price / DONG_PER_K) + ' nghìn đồng/kg). Vẫn lưu?');
}
function commitRetailRow(){
  var tb = $('#retailBody');
  if (!tb) return true;
  var row = tb.querySelector('tr[data-pid]');
  if (!row) return true;
  var q = num($('.retail-qty', row).value);
  var m = num($('.retail-money', row).value);
  var limRq = checkLimits('q', q) || checkLimits('money', kToDong(m));
  if (limRq) {
    toast(limRq, 'error');
    var bad = checkLimits('q', q) ? $('.retail-qty', row) : $('.retail-money', row);
    if (bad) focusNS(bad);
    return false;
  }
  if (q <= 0) {
    var p = findProduct(row.getAttribute('data-pid'));
    toast('Dòng "' + (p ? p.name : '?') + '" thiếu số lượng', 'error');
    var qi = $('.retail-qty', row);
    if (qi) focusNS(qi);
    return false;
  }
  if (!(kToDong(m) > 0)) {
    toast('Nhập thành tiền lớn hơn 0', 'error');
    var mi = $('.retail-money', row);
    if (mi) focusNS(mi);
    return false;
  }
  if (!confirmBelowImport(row.getAttribute('data-pid'), q, m)) return false;
  retailItems.push({ pid: row.getAttribute('data-pid'), kg: dec(q), amount: kToDong(m) });
  notePage = 1e9;
  tb.textContent = '';
  orderEmpty(tb, 5, '');
  refreshAllQtyHints();
  return true;
}
function addRetailToNote(){
  var row = $('#retailBody tr[data-pid]');
  if (!row) return;
  var qi = $('.retail-qty', row);
  if (num(qi.value) <= 0) { toast('Nhập số lượng lớn hơn 0', 'error'); focusNS(qi); return; }
  if (!commitRetailRow()) return;
  renderNote();
  refocusSearch('#retailSearch', 'retail');
}
function noteSave(){
  var it = retailItems[noteEditIdx];
  if (!it) { noteEditIdx = -1; renderNote(); return; }
  var q = num(($('#noteEditQty') || {}).value);
  var m = num(($('#noteEditMoney') || {}).value);
  if (q <= 0) { toast('Số lượng phải lớn hơn 0', 'error'); return; }
  if (!(kToDong(m) > 0)) { toast('Nhập thành tiền lớn hơn 0', 'error'); focusNS($('#noteEditMoney')); return; }
  var limNs = checkLimits('q', q) || checkLimits('money', kToDong(m));
  if (limNs) { toast(limNs, 'error'); return; }
  if (!confirmBelowImport(it.pid, q, m)) return;
  it.kg = dec(q);
  it.amount = kToDong(m);
  noteEditIdx = -1;
  renderNote();
}
function remedyThang(){
  var v = Math.round(num(($('#remedyThang') || {}).value));
  return v >= 1 ? v : 1;
}
function remedyGrand(){
  return kToDong(remedyThang() * num(($('#remedyUnitPrice') || {}).value));
}
/* Vốn từng vị là đồng nguyên (kg × giá nhập). Chỉ phần lãi chia đều,
   dòng cuối nhận số dư vài đồng. Trả null khi giá khách trả thấp hơn vốn. */
function balanceRemedyMoney(grand, lines){
  var list = lines || [];
  var g0 = money(grand);
  var costs = list.map(function(l){ return money(l.exactCost); });
  var totalCost = 0;
  costs.forEach(function(c){ totalCost += c; });
  if (g0 < totalCost) return null;
  var totals = allocateRemedyProfitEvenly(g0, costs.map(function(c){ return { cost: c }; }));
  return costs.map(function(c, i){ return { cost: c, total: totals[i] }; });
}
/* Hàm thuần cho đơn thuốc chén. grand là số khách trả (số nguyên).
   lines[].cost là vốn từng vị, đã là số nguyên.
   Thành tiền vị = vốn + phần lãi chia đều theo số vị.
   Dòng cuối nhận phần dư để tổng các dòng đúng bằng grand. */
function allocateRemedyProfitEvenly(grand, lines){
  var list = lines || [];
  var n = list.length;
  if (!n) return [];
  var g0 = money(grand);
  var costs = list.map(function(l){ return money(l.cost); });
  var totalCost = 0;
  costs.forEach(function(c){ totalCost += c; });
  var lai = g0 - totalCost;
  var base = Math.floor(lai / n);
  var allocated = 0;
  return costs.map(function(cost, idx){
    var share = idx === n - 1 ? (lai - allocated) : base;
    allocated += share;
    return cost + share;
  });
}
function calcRemedy(){
  calcRemedyTyping();
  renderRemedyNote();
}
/* 2.38.18: khi gõ chỉ cập nhật tổng tại chỗ, không dựng lại tờ ghi. */
function calcRemedyTyping(){
  var tot = $('#remedyTotal');
  if (tot) tot.textContent = fmtMoney(remedyGrand());
}

/* ================= ĐƠN THUỐC CÓ SẴN ================= */
function findPreset(id){
  for (var i = 0; i < db.prescriptions.length; i++) {
    if (String(db.prescriptions[i].id) === String(id)) return db.prescriptions[i];
  }
  return null;
}
function presetByName(name){
  var key = capWords(name).toLowerCase();
  if (!key) return null;
  for (var i = 0; i < db.prescriptions.length; i++) {
    if (capWords(db.prescriptions[i].name).toLowerCase() === key) return db.prescriptions[i];
  }
  return null;
}
function collectRemedyItems(){
  if (!commitRemedyRow()) return [];
  calcRemedy();
  var items = [];
  remedyItems.forEach(function(it){
    if (num(it.grams) > 0) items.push({ productId: it.productId, grams: dec(it.grams) });
  });
  return items;
}
function renderPresetOptions(){
  var sel = $('#remedyPreset');
  if (!sel) return;
  var cur = sel.value;
  sel.textContent = '';
  var o0 = el('option', null, 'Đơn mới');
  o0.value = '';
  sel.appendChild(o0);
  sortedPresets().forEach(function(r){
    var o = el('option', null, r.name);
    o.value = r.id;
    sel.appendChild(o);
  });
  if (cur && findPreset(cur)) sel.value = cur;
  else sel.value = '';
  updatePresetUI();
}
function sortedPresets(){
  return db.prescriptions.slice().sort(function(a, b){
    return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
  });
}
/* 2.20.9: nửa phải tờ ghi Thuốc chén (chỉ hiện dưới html.desktop): danh sách đơn đã lưu, cùng nguồn với #remedyPreset; bấm dòng = đổi select rồi gọi remedyPresetPick. */
var presetPage = 1;
function renderPresetList(){
  var host = $('#remedyPresetRows');
  if (!host) return;
  var sel = $('#remedyPreset');
  var cur = sel ? sel.value : '';
  var list = sortedPresets();
  var fp = fitPage('rpre', host, presetPage), ps = fp.ps;
  presetPage = fp.page;
  var pages = Math.max(1, Math.ceil(list.length / ps));
  if (presetPage > pages) presetPage = pages;
  if (presetPage < 1) presetPage = 1;
  host.textContent = '';
  for (var k = 0; k < ps; k++) {
    var i = (presetPage - 1) * ps + k, r = list[i];
    var b = el('button', 'rp-row');
    b.type = 'button';
    if (!r) { b.disabled = true; b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); host.appendChild(b); continue; }
    b.setAttribute('data-action', 'pick-preset');
    b.setAttribute('data-id', r.id);
    if (cur && String(r.id) === String(cur)) b.setAttribute('aria-current', 'true');
    var g = 0;
    (r.items || []).forEach(function(it){ g += num(it.grams); });
    b.appendChild(el('span', 'rp-row__n', String(i + 1)));
    b.appendChild(el('span', 'rp-row__name', r.name));
    b.appendChild(el('span', 'rp-row__g num', g > 0 ? fmtGram(g) : ''));
    host.appendChild(b);
  }
  renderPager($('#remedyPresetPager'), presetPage, pages, 'rpre', true);
}
function pickPresetRow(id){
  var sel = $('#remedyPreset');
  if (!sel || !findPreset(id)) return;
  sel.value = id;
  remedyPresetPick();
  presetFindClose(true);
  if (isDesk()) focusNS($('#remedySearch')); /* 2.26.0: chọn đơn xong trỏ về ô Tìm vị thuốc */
}
/* 2.26.0 desktop: ô "Tìm đơn đã lưu" (#remedyFind): khớp trọn từ/cụm từ như tìm vị thuốc (wholeWordMatch), thả xuống tối đa 5 dòng. */
var findIdx = -1;
function presetFindOpen(){
  var inp = $('#remedyFind'), list = $('#remedyFindList');
  if (!inp || !list) return;
  var q = String(inp.value || '').trim();
  var arr = q ? sortedPresets().filter(function(r){ return wholeWordMatch(r.name, q); }) : [];
  list.textContent = '';
  findIdx = -1;
  arr.forEach(function(r){
    var g = 0;
    (r.items || []).forEach(function(it){ g += num(it.grams); });
    var b = el('button', 'sug__item');
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', 'false');
    b.setAttribute('data-id', r.id);
    b.appendChild(el('span', 'sug__name', r.name));
    b.appendChild(el('span', 'sug__meta num', g > 0 ? fmtGram(g) : ''));
    b.addEventListener('mousedown', function(e){ e.preventDefault(); pickPresetRow(r.id); });
    list.appendChild(b);
  });
  list.hidden = !arr.length;
  inp.setAttribute('aria-expanded', arr.length ? 'true' : 'false');
}
function presetFindClose(clear){
  var inp = $('#remedyFind'), list = $('#remedyFindList');
  if (list) list.hidden = true;
  if (inp) { inp.setAttribute('aria-expanded', 'false'); if (clear) inp.value = ''; }
  findIdx = -1;
}
function presetFindKey(e){
  var list = $('#remedyFindList');
  if (!list) return;
  var items = $$('.sug__item', list);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (list.hidden) { presetFindOpen(); items = $$('.sug__item', list); }
    if (!items.length) return;
    findIdx = (findIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach(function(n, i){ n.setAttribute('aria-selected', i === findIdx ? 'true' : 'false'); });
    sugReveal(list, items[findIdx]);
  } else if (e.key === 'Enter') {
    if (list.hidden || !items.length) return;
    e.preventDefault();
    pickPresetRow(items[findIdx >= 0 ? findIdx : 0].getAttribute('data-id'));
  } else if (e.key === 'Escape') {
    presetFindClose(true);
  }
}
/* 2.26.0: ✕ = bỏ đơn đang mở, tờ ghi về trống (thay mục "Đơn mới"). */
function closePreset(){
  var sel = $('#remedyPreset');
  if (sel) sel.value = '';
  remedyPresetPick();
  focusNS($('#remedySearch'));
}
/* 2.28.0 desktop: nút "Đơn mới" chỉ có một tác dụng, KHÔNG hỏi: tờ ghi mới tinh (bỏ đơn đang mở, dòng đang ghi, ô tìm, thang/giá mặc định), trỏ về Tìm vị thuốc; không xóa đơn đã lưu. */
function hasVal(s){ var e = $(s); return !!(e && e.value); }
function newRemedy(){
  presetPage = 1;
  resetRemedy();
  presetFindClose(true);
  focusNS($('#remedySearch'));
}
/* 2.26.1 desktop: nút "Xóa hết" Bán lẻ/Nhập hàng: có dòng nháp hoặc chữ đang gõ thì hỏi, rồi xóa nháp (giữ ngày đang chọn) và trỏ về ô tìm vị; không có gì thì không làm gì. */
function clearDraft(kind){
  var r = kind === 'retail', n = r ? retailItems.length : nhapList.length;
  if (!n && !(r ? $('#retailBody tr[data-pid]') || hasVal('#retailSearch') : hasVal('#nhapSearch') || hasVal('#nhapQty') || hasVal('#nhapPrice'))) return;
  if (!confirm(n ? 'Xóa hết ' + n + ' dòng đang ghi và làm lại từ đầu?' : 'Xóa chữ đang gõ và làm lại từ đầu?')) return;
  if (r) resetRetail(); else { nhapList = []; renderNhapList(); resetNhapInputs(); }
  focusNS($(r ? '#retailSearch' : '#nhapSearch'));
}
function updatePresetUI(){
  var sel = $('#remedyPreset');
  var nameInp = $('#remedyName');
  var lbl = $('#remedySaveLabel');
  var del = $('#remedyDelPreset');
  var cur = sel && sel.value ? findPreset(sel.value) : null;
  var name = capWords(nameInp ? nameInp.value : '');
  var target = name ? presetByName(name) : null;
  if (lbl) {
    if (cur) lbl.textContent = 'Sửa đơn';
    else if (name) lbl.textContent = (target ? 'Tên đã dùng (' : 'Lưu đơn (') + name + ')';
    else lbl.textContent = 'Lưu đơn';
  }
  if (del) del.hidden = !cur && !isDesk(); /* 2.28.0: desktop luôn hiện Xóa đơn */
  var fb = $('#remedyFindBox'), fn = $('#remedyOpenName');
  if (fb && fb.classList) fb.classList.toggle('is-open', !!cur); /* 2.26.0 desktop: đang mở đơn thì ô phải hiện tên đơn + ✕ */
  if (fn) fn.textContent = cur ? cur.name : '';
  renderPresetList();
}
function loadPreset(id){
  var r = findPreset(id);
  var tb = $('#remedyBody');
  if (!r || !tb) return;
  entryPark('remedy');
  tb.textContent = '';
  remedyItems = [];
  var missing = 0;
  r.items.forEach(function(it){
    if (!findProduct(it.productId)) { missing++; return; }
    remedyItems.push({ productId: it.productId, grams: dec(num(it.grams)) });
  });
  if (missing) toast('Đơn cũ có ' + missing + ' vị đã bị xóa, kiểm tra lại giá', 'error');
  remedyEditIdx = -1;
  remedyNotePage = 1;
  orderEmpty(tb, 4, '');
  var nameInp = $('#remedyName');
  if (nameInp) nameInp.value = r.name;
  var thang = Math.max(1, Math.round(num(r.thang) || 1));
  var th = $('#remedyThang');
  if (th) th.value = String(thang);
  var up = $('#remedyUnitPrice');
  if (up) up.value = num(r.total) > 0 ? kInput(num(r.total) / thang) : '';
  renumber(tb);
  calcRemedy();
  updatePresetUI();
}
function onPresetChange(){
  var sel = $('#remedyPreset');
  var id = sel ? sel.value : '';
  if (id) { loadPreset(id); return; }
  var tb = $('#remedyBody');
  if (tb) {
    entryPark('remedy');
    tb.textContent = '';
    orderEmpty(tb, 4, '');
  }
  remedyItems = [];
  remedyEditIdx = -1;
  remedyNotePage = 1;
  var nameInp = $('#remedyName');
  if (nameInp) nameInp.value = '';
  var up = $('#remedyUnitPrice');
  if (up) up.value = '';
  var th = $('#remedyThang');
  if (th) th.value = '1';
  calcRemedy();
  updatePresetUI();
}
/* 2.15.17: chọn "Đơn mới" hoặc đơn đã lưu đều ẩn ô tên (không đổi tên đơn có sẵn); đơn mới: "Lưu đơn" tự mở ô tên. */
function remedyPresetPick(){
  onPresetChange();
  remedyNameShow(false);
}
function remedyNameShow(show){
  var n = $('#remedyName');
  if (n) n.hidden = !show;
}
/* 2.14.0: chưa có tên và chưa chọn đơn thì chỉ mở ô tên (không đổi logic savePreset). */
function remedySavePresetClick(){
  var sel = $('#remedyPreset');
  var n = $('#remedyName');
  if (!(sel && sel.value) && n && !capWords(n.value)) {
    /* 2.15.15: điện thoại: ô tên ở chân tờ ghi bị bàn phím che; hỏi tên bằng hộp thoại. */
    if (isDesk() || (window.matchMedia && window.matchMedia('(max-width:640px)').matches)) { /* 2.26.0: desktop cũng hỏi tên bằng hộp thoại (không đặt ô tên ở thanh đầu/chân) */
      var asked = window.prompt(isDesk() ? 'Tên đơn mới' : 'Tên đơn', '');
      if (asked == null || !capWords(asked)) return;
      n.value = asked;
    } else { remedyNameShow(true); n.focus(); return; }
  }
  savePreset();
  remedyNameShow(false);
}
function savePreset(){
  var nameInp = $('#remedyName');
  var sel = $('#remedyPreset');
  var cur = sel && sel.value ? findPreset(sel.value) : null;
  /* 2.15.17: đơn có sẵn không đổi tên được: cập nhật nội dung theo ID, giữ nguyên tên đang lưu. */
  var name = cur ? cur.name : capWords(nameInp ? nameInp.value : '');
  if (!name) {
    /* 2.15.16: điện thoại: focus ô tên làm thanh chân bị ẩn; hỏi tên bằng hộp thoại. */
    if (nameInp && window.matchMedia && window.matchMedia('(max-width:640px)').matches) {
      var askedP = window.prompt('Tên đơn', '');
      if (askedP == null || !capWords(askedP)) return;
      nameInp.value = askedP;
      name = capWords(askedP);
    } else { toast('Nhập tên đơn', 'error'); if (nameInp) nameInp.focus(); return; }
  }
  if (!cur && isRetailName(name)) { toast(RETAIL_NAME_MSG, 'error'); return; }
  if (nameInp) nameInp.value = name;
  var items = collectRemedyItems();
  if (!items.length) { toast('Chọn ít nhất 1 vị thuốc và nhập số gram', 'error'); return; }
  var thang = remedyThang();
  var grand = remedyGrand();
  var limPs = checkLimits('name', name) || checkLimits('thang', thang) || checkLimits('money', grand);
  for (var lg = 0; !limPs && lg < items.length; lg++) limPs = checkLimits('grams', items[lg].grams);
  if (limPs) { toast(limPs, 'error'); return; }
  var msg;

  if (!cur) {
    var byName = presetByName(name);
    if (byName) {
      /* Đơn mới nhưng tên trùng (không phân biệt hoa/thường, khoảng trắng): hỏi cập nhật đơn cũ, giữ tên cũ. */
      if (!confirm('Đã có đơn "' + byName.name + '". Sửa đơn này bằng nội dung đang nhập?')) return;
      cur = byName;
    }
  }

  if (cur) {
    cur.items = items;
    cur.total = money(grand);
    cur.thang = thang;
    cur.updatedAt = Date.now();
    msg = 'Đã cập nhật đơn "' + cur.name + '"';
  } else {
    cur = { id: uid('RX'), name: name, items: items, total: money(grand), thang: thang, updatedAt: Date.now() };
    db.prescriptions.push(cur);
    msg = 'Đã lưu đơn "' + name + '"';
  }
  commit(msg);
  if (sel) sel.value = cur.id; /* renderPresetOptions giữ lựa chọn này và tự gọi updatePresetUI */
  renderPresetOptions();
  if (nameInp) nameInp.value = cur.name;
  afterSaveDone();
}
function delPreset(){
  var sel = $('#remedyPreset');
  var r = sel && sel.value ? findPreset(sel.value) : null;
  if (!r) { /* 2.28.0: chưa lưu: có dòng đang ghi thì hỏi rồi làm sạch tờ ghi; không có gì thì không làm gì */
    var n = remedyItems.length;
    if (!n || !confirm('Xóa đơn đang ghi (' + n + ' dòng) và ghi lại từ đầu?')) return;
    resetRemedy(); presetFindClose(true); return;
  }
  if (!confirm('Xóa đơn "' + r.name + '"? Các giao dịch đã bán vẫn được giữ lại.')) return;
  presetPage = 1;
  db.prescriptions = db.prescriptions.filter(function(x){ return String(x.id) !== String(r.id); });
  resetRemedy();
  commit('Đã xóa đơn "' + r.name + '"');
}
/* ================= LƯU ĐƠN ================= */
function commit(msg, force){
  touch();
  txIndex = null; /* chỉ mục giao dịch dựng lại lười sau mỗi lần ghi */
  renderAll();
  if (orderCur) renderOrder();
  pushState(false, !!force);
  if (msg) toast(msg);
}
function saveRetail(){
  refreshAutoDates();
  var date = todayISO(); /* AC: luôn hôm nay */
  if (!commitRetailRow()) return;
  var items = retailItems.map(function(it){ return { pid: it.pid, kg: it.kg, amount: it.amount }; });
  if (!items.length) { toast('Chọn vị thuốc và nhập số lượng hợp lệ', 'error'); return; }
  /* Lưới an toàn ở chỗ ghi tiền/tồn: commitRetailRow/noteSave đã chặn, giữ để một đường nhập mới không ghi số xấu. */
  for (var k = 0; k < items.length; k++) {
    if (items[k].kg <= 0) { toast('Số lượng phải lớn hơn 0', 'error'); return; }
    if (!(items[k].amount > 0)) { toast('Nhập thành tiền lớn hơn 0', 'error'); return; }
  }

  var oname = 'Bán lẻ';
  var oid = items.length > 1 ? uid('OD') : null;
  var ts = Date.now();

  var need = Object.create(null);
  items.forEach(function(it){ need[it.pid] = (need[it.pid] || 0) + it.kg; });
  for (var pid in need) {
    var p = findProduct(pid);
    if (!p) { toast('Vị thuốc không còn tồn tại', 'error'); return; }
    if (need[pid] > p.stock + 1e-9) {
      toast('Tồn "' + p.name + '" không đủ (còn ' + fmtQty(p.stock) + ')', 'error');
      return;
    }
  }
  for (var rk = 0; rk < items.length; rk++) {
    var rlim = checkLimits('money', money(items[rk].amount / items[rk].kg));
    if (rlim) { toast('Đơn giá vượt giới hạn (' + fmtNum(MONEY_MAX / DONG_PER_K) + ' nghìn đồng/kg)', 'error'); return; }
  }
  items.forEach(function(it){
    var p = findProduct(it.pid);
    p.stock = dec(p.stock - it.kg);
    var tx = {
      id: uid('TX'), date: date, type: 'BAN', productId: it.pid,
      qty: dec(it.kg), price: money(it.amount / it.kg),
      total: money(it.amount), cost: money(it.kg * num(p.costPrice)), ts: ts,
      retail: true
    };
    if (oid) { tx.oid = oid; tx.oname = oname; }
    db.transactions.push(tx);
  });
  resetRetail();
  commit('Đã lưu đơn bán lẻ');
  afterSaveDone();
}
function saveRemedy(){
  refreshAutoDates();
  var date = todayISO(); /* AC: luôn hôm nay */
  if (!commitRemedyRow()) return;
  calcRemedy();
  var grand = remedyGrand();
  var items = [];
  remedyItems.forEach(function(it){
    if (it.productId && num(it.grams) > 0) items.push({ pid: it.productId, g: num(it.grams) });
  });
  if (!items.length) { toast('Chọn ít nhất 1 vị thuốc và nhập số gram', 'error'); return; }
  if (grand <= 0) { toast('Nhập giá 1 thang', 'error'); return; }

  var thang = remedyThang();
  var need = Object.create(null);
  items.forEach(function(it){ need[it.pid] = (need[it.pid] || 0) + it.g / 1000 * thang; });
  for (var pid in need) {
    var p = findProduct(pid);
    if (!p) { toast('Vị thuốc không còn tồn tại', 'error'); return; }
    if (need[pid] > p.stock + 1e-9) {
      toast('Tồn "' + p.name + '" không đủ (còn ' + fmtQty(p.stock) + ')', 'error');
      return;
    }
  }
  var lim3 = checkLimits('thang', thang) || checkLimits('money', grand);
  if (lim3) {
    toast(lim3, 'error');
    var th = $('#remedyThang'); if (th) th.focus();
    return;
  }
  var priced = items.map(function(it){
    var p = findProduct(it.pid);
    var kg = dec(it.g / 1000 * thang);
    return { it: it, p: p, kg: kg, exactCost: kg * num(p.costPrice) };
  });
  /* Vốn từng vị = kg × giá nhập, làm tròn tới đồng. Khách vẫn trả số thang × giá 1 thang. */
  var balanced = balanceRemedyMoney(grand, priced);
  if (!balanced) { toast('Giá bán thấp hơn vốn của đơn', 'error'); return; }
  for (var rk2 = 0; rk2 < priced.length; rk2++) {
    var rlim2 = checkLimits('money', money(balanced[rk2].total / priced[rk2].kg));
    if (rlim2) { toast('Đơn giá vượt giới hạn (' + fmtNum(MONEY_MAX / DONG_PER_K) + ' nghìn đồng/kg)', 'error'); return; }
  }
  var oname = capWords(($('#remedyName') || {}).value) || 'Đơn thuốc lẻ';
  if (isRetailName(oname)) { toast(RETAIL_NAME_MSG, 'error'); return; }
  var oid = uid('OD');
  var ts = Date.now();
  priced.forEach(function(row, idx){
    var it = row.it;
    var p = row.p;
    var kg = row.kg;
    p.stock = dec(p.stock - kg);
    var amount = balanced[idx].total;
    var tx = {
      id: uid('TX'), date: date, type: 'BAN', productId: it.pid,
      qty: kg, price: money(amount / kg),
      total: amount, cost: balanced[idx].cost,
      rx: true, g: dec(it.g), thang: thang, unitPrice: money(grand / thang),
      ts: ts
    };
    tx.oid = oid; tx.oname = oname;
    db.transactions.push(tx);
  });
  resetRemedy();
  commit('Đã bán đơn thuốc chén');
  afterSaveDone();
}

/* ================= THỐNG KÊ ================= */
/* 2.34.0: vốn của một giao dịch BÁN = cost nếu có (kể cả 0), không thì qty x costPrice hiện tại (0 nếu vị đã xóa); dùng chung computeStats và biểu đồ. */
function txCost(t, byId){ return t.cost != null ? num(t.cost) : num(t.qty) * (byId[t.productId] ? num(byId[t.productId].costPrice) : 0); }
function computeStats(transactions, products, today){
  var ym = String(today || '').slice(0, 7), ys = bookStart(today);
  var dExp = 0, dCogs = 0, mImp = 0, mExp = 0, mCogs = 0, yExp = 0, yCogs = 0;
  var byId = Object.create(null);
  (products || []).forEach(function(p){ byId[p.id] = p; });
  (transactions || []).forEach(function(t){
    if (!t || !t.date || t.open) return;
    var inDay = t.date === today;
    var inMon = t.date.indexOf(ym) === 0;
    var inYear = t.date >= ys && t.date <= today;
    if (!inDay && !inMon && !inYear) return;
    var v = num(t.total);
    if (t.type === 'NHAP') {
      if (inMon) mImp += v;
      return;
    }
    var c = txCost(t, byId);
    if (inDay) { dExp += v; dCogs += c; }
    if (inMon) { mExp += v; mCogs += c; }
    if (inYear) { yExp += v; yCogs += c; }
  });
  return {
    dExp: dExp, dCogs: dCogs, mImp: mImp, mExp: mExp, mCogs: mCogs,
    yExp: yExp, yCogs: yCogs,
    profitDay: dExp - dCogs, profitMonth: mExp - mCogs, profitYear: yExp - yCogs,
    stock: (products || []).reduce(function(a, p){ return a + num(p.stock); }, 0)
  };
}
function renderStats(){
  var today = todayISO();
  var s = computeStats(db.transactions, db.products, today);
  lastStatsDay = today;
  var set = function(id, v){ var n = $('#' + id); if (n) n.textContent = v; };
  var setProfit = function(id, v){
    var n = $('#' + id);
    if (!n) return;
    n.textContent = fmtMoneyInt(v);
    n.className = v < 0 ? 'txt-red' : '';
  };
  set('statImport', fmtMoneyInt(s.mImp));
  set('statExport', fmtMoneyInt(s.mExp));
  set('statExportDay', fmtMoneyInt(s.dExp));
  set('statExportYear', fmtMoneyInt(s.yExp));
  setProfit('statProfitDay', s.profitDay);
  setProfit('statProfitYear', s.profitYear);
  var pn = $('#statProfit');
  if (pn) {
    pn.textContent = fmtMoneyInt(s.profitMonth);
    pn.className = 'stat__v ' + (s.profitMonth < 0 ? 'txt-red' : '');
  }
  set('statStock', fmtQtyInt(s.stock));
  set('chartStkVal', fmtQtyInt(s.stock)); /* 2.34.0: chip Tổng tồn kho (desktop) */
}
/* ================= PHÂN TRANG ================= */
function mkPageBtn(label, target, disabled, kind, current){
  var b = el('button', 'btn btn--sm pager__num', label);
  b.type = 'button';
  if (current) b.setAttribute('aria-current', 'page');
  if (disabled) { b.disabled = true; return b; }
  b.setAttribute('data-action', 'page');
  b.setAttribute('data-kind', kind);
  b.setAttribute('data-page', String(target));
  return b;
}
function renderPager(host, page, total, kind, always){
  if (!host) return;
  host.textContent = '';
  if (total <= 1 && !always) { host.appendChild(el('span', 'muted small', 'Hiển thị tất cả')); return; }
  host.appendChild(el('span', 'muted small', 'Trang ' + page + ' / ' + total));
  var nav = el('div', 'pager');
  nav.appendChild(mkPageBtn('Trước', page - 1, page <= 1, kind));
  var start = Math.max(1, page - 2), end = Math.min(total, page + 2);
  if (start > 1) {
    nav.appendChild(mkPageBtn('1', 1, false, kind));
    if (start > 2) nav.appendChild(el('span', 'muted small', '…'));
  }
  for (var i = start; i <= end; i++) nav.appendChild(mkPageBtn(String(i), i, false, kind, i === page));
  if (end < total) {
    if (end < total - 1) nav.appendChild(el('span', 'muted small', '…'));
    nav.appendChild(mkPageBtn(String(total), total, false, kind));
  }
  nav.appendChild(mkPageBtn('Sau', page + 1, page >= total, kind));
  host.appendChild(nav);
}
/* ================= MENU THAO TÁC (···) ================= */
/* Menu thao tác nhỏ gắn vào từng dòng (sửa/xóa). Position cố định để không bị
   cắt bởi vùng cuộn ngang của bảng; tự đóng khi bấm ra ngoài/Esc/cuộn trang. */
var rowMenuCur = null;
function closeRowMenu(refocus){
  if (!rowMenuCur) return;
  rowMenuCur.list.hidden = true;
  rowMenuCur.btn.setAttribute('aria-expanded', 'false');
  var b = rowMenuCur.btn;
  rowMenuCur = null;
  if (refocus) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
}
function toggleRowMenu(btn, list){
  if (rowMenuCur && rowMenuCur.btn === btn) { closeRowMenu(); return; }
  closeRowMenu();
  list.hidden = false;
  var r = btn.getBoundingClientRect();
  var w = list.offsetWidth, h = list.offsetHeight;
  var left = r.right - w;
  if (left < 8) left = 8;
  if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
  var top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
  list.style.left = left + 'px';
  list.style.top = top + 'px';
  /* 2.20.0 desktop: thẻ có backdrop-filter làm "khối chứa" của fixed; hiệu chỉnh theo vị trí thật vừa đặt (không đổi gì khi khối chứa là cửa sổ). */
  var q = list.getBoundingClientRect ? list.getBoundingClientRect() : null;
  if (q && q.left !== undefined && (Math.abs(q.left - left) > 0.5 || Math.abs(q.top - top) > 0.5)) {
    list.style.left = (2 * left - q.left) + 'px';
    list.style.top = (2 * top - q.top) + 'px';
  }
  btn.setAttribute('aria-expanded', 'true');
  rowMenuCur = { btn: btn, list: list };
}
function rowMenu(items, label){
  var wrap = el('div', 'rowmenu');
  var b = el('button', 'btn btn--icon');
  b.type = 'button';
  b.setAttribute('aria-haspopup', 'menu');
  b.setAttribute('aria-expanded', 'false');
  b.setAttribute('aria-label', label || 'Thao tác');
  b.appendChild(svg('dots'));
  var list = el('div', 'rowmenu__list');
  list.setAttribute('role', 'menu');
  list.hidden = true;
  items.forEach(function(it){
    var ib = el('button', 'menu__item' + (it.danger ? ' menu__item--danger' : ''));
    ib.type = 'button';
    ib.setAttribute('role', 'menuitem');
    ib.setAttribute('data-action', it.action);
    if (it.id != null) ib.setAttribute('data-id', it.id);
    if (it.idx != null) ib.setAttribute('data-idx', String(it.idx));
    ib.appendChild(svg(it.icon));
    ib.appendChild(doc.createTextNode(it.label));
    ib.addEventListener('click', function(){ closeRowMenu(); });
    list.appendChild(ib);
  });
  b.addEventListener('click', function(e){ e.stopPropagation(); toggleRowMenu(b, list); });
  wrap.appendChild(b);
  wrap.appendChild(list);
  return wrap;
}
doc.addEventListener('click', function(e){
  if (!rowMenuCur) return;
  var t = e.target;
  if (t && t.closest && (t.closest('.rowmenu__list') || t.closest('.rowmenu'))) return;
  closeRowMenu();
}, true);
doc.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeRowMenu(true); });
doc.addEventListener('scroll', function(){ closeRowMenu(); }, true);
window.addEventListener('resize', function(){ closeRowMenu(); });
function emptyRow(tbody, cols, text){
  var tr = el('tr');
  tr.className = 'is-empty';
  var td = el('td', 'muted small empty-cell', text);
  td.colSpan = cols;
  tr.appendChild(td);
  tbody.appendChild(tr);
}

/* ================= TỒN KHO ================= */
function renderInventory(){
  var tbody = $('#invBody');
  if (!tbody) return;
  tbody.textContent = '';
  var kw = normSearch(($('#invSearch') || {}).value || '');
  var nk = { low: 0, out: 0 };
  db.products.forEach(function(p){ var k = stockKind(p.stock); if (k) nk[k]++; }); /* 2.32.0: số đếm trên TOÀN kho, không phụ thuộc ô tìm */
  var list = db.products.filter(function(p){ return (!kw || wholeWordMatch(p.name, kw)) && (!invFilter || stockKind(p.stock) === invFilter); }); /* 2.27.0: một luật tìm chung (trọn chữ); 2.32.0: AND với lọc Gần hết/Hết hàng */
  [['low', 'Low', 'Gần hết'], ['out', 'Out', 'Hết hàng']].forEach(function(f){
    var b = $('#inv' + f[1] + 'Btn'), n = $('#inv' + f[1] + 'N');
    if (n) n.textContent = nk[f[0]];
    if (b) { b.classList.toggle('on', invFilter === f[0]); b.setAttribute('aria-pressed', invFilter === f[0] ? 'true' : 'false'); b.setAttribute('aria-label', f[2] + ': ' + nk[f[0]] + ' vị thuốc'); }
  });
  var nr = reconcileList().length, rb = $('#invRecBtn'), rd = $('#invRecN');
  if (rd) { rd.textContent = nr; rd.hidden = !nr; }
  if (rb) { var rt = 'Đối chiếu tồn kho' + (nr ? ' (' + nr + ' lệch)' : ''); rb.title = rt; rb.setAttribute('aria-label', rt); }

  // Tổng kg đã bán theo từng vị (BAN: bán lẻ + đơn chén, đều lưu qty_kg)
  var sales = Object.create(null);
  var ys = bookStart(todayISO()); /* 2.40.0: "Đã bán" tính từ Tết năm sổ hiện tại */
  db.transactions.forEach(function(t){
    if (t && t.type === 'BAN' && String(t.date) >= ys) {
      var pid = t.productId;
      sales[pid] = (sales[pid] || 0) + num(t.qty);
    }
  });

  list.sort(function(a, b){
    return ((sales[b.id] || 0) - (sales[a.id] || 0)) || sortByName(a, b);
  });

  var count = $('#invCount');
  if (count) count.textContent = list.length + ' vị thuốc';

  if (!list.length) {
    emptyRow(tbody, 5, db.products.length ? 'Không tìm thấy vị thuốc phù hợp.' : 'Chưa có vị thuốc nào trong kho.');
    renderPager($('#invPager'), 1, 1, 'inv');
    return;
  }

  var fp = fitPage('inv', $('#invBox .tw'), invPage), ips = fp.ps;
  invPage = fp.page;
  var totalPages = Math.ceil(list.length / ips) || 1;
  if (invPage < 1) invPage = 1;
  if (invPage > totalPages) invPage = totalPages;
  var slice = list.slice((invPage - 1) * ips, invPage * ips);

  slice.forEach(function(p){
    var tr = el('tr');
    tr.className = 'is-row';
    tr.appendChild(el('td', 'b', p.name));
    var cStock = el('td', 'num', fmtQty(p.stock)); /* 2.39.8: Tồn kho – Đã bán – Giá nhập */
    cStock.setAttribute('data-label', 'Tồn kho');
    tr.appendChild(cStock);
    var cSold = el('td', 'num muted', fmtQty(sales[p.id] || 0));
    cSold.setAttribute('data-label', 'Đã bán');
    tr.appendChild(cSold);
    var cCost = el('td', 'num muted', fmtUnitPrice(p.costPrice));
    cCost.setAttribute('data-label', 'Giá nhập');
    tr.appendChild(cCost);

    var tdA = el('td', 'c-del');
    tdA.appendChild(rowMenu([
      { label: 'Sửa vị thuốc', icon: 'edit', action: 'edit-prod', id: p.id },
      { label: 'Xóa vị thuốc', icon: 'trash', action: 'del-prod', id: p.id, danger: true }
    ], 'Thao tác với ' + p.name));
    tr.appendChild(tdA);
    tbody.appendChild(tr);
  });
  renderPager($('#invPager'), invPage, totalPages, 'inv');
}

/* ================= LỊCH SỬ ================= */
/* Map id→vị thuốc dựng một lần cho cả lượt (historyData); findProduct tuyến tính chỉ còn dùng cho tra lẻ. Trùng id: giữ vị đầu tiên, y như findProduct. */
function productMap(){
  var m = new Map();
  for (var i = 0; i < db.products.length; i++) { var k = String(db.products[i].id); if (!m.has(k)) m.set(k, db.products[i]); }
  return m;
}
function txName(t, pm){
  var p = pm ? pm.get(String(t.productId)) : findProduct(t.productId);
  return p ? p.name : null;
}
function timeVN(ts){
  var d = new Date(num(ts));
  if (!isFinite(d.getTime())) return '';
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
/* ================= CHƯA ĐỌC (Lịch sử bán/nhập) ================= */
/* Máy chủ giữ danh sách (bảng unread, khóa = mã đơn hoặc id giao dịch); client chỉ hiển thị và báo "đã đọc". Lỗi mạng: giữ số cũ, việc đã đọc xếp hàng thử lại ở nhịp sau, không toast. */
var unread = { BAN: [], NHAP: [] }, unreadQ = [], unreadFly = [], unreadBusy = false; /* unreadFly: việc đã rút khỏi hàng đợi nhưng POST chưa xong; GET về bản cũ vẫn phải loại các khóa này */
function unreadK(kind){ return (kind === 'imp' || kind === 'NHAP') ? 'NHAP' : 'BAN'; }
function isUnread(kind, key){ return unread[unreadK(kind)].indexOf(String(key)) >= 0; }
function udot(kind, key){
  if (!isUnread(kind, key)) return null;
  var d = el('span', 'udot');
  d.setAttribute('role', 'img'); d.setAttribute('aria-label', 'Chưa đọc');
  return d;
}
function unreadBadgeText(n){ return n > 4 ? '5+' : String(n); }
function renderUnread(){
  [['expBox', 'BAN', 'Lịch sử bán hàng', 'exp'], ['impBox', 'NHAP', 'Lịch sử nhập hàng', 'imp']].forEach(function(p){
    var n = unread[p[1]].length, tab = $('.tab[data-tab="' + p[0] + '"]');
    if (tab) {
      var bd = $('.tab__bd', tab);
      if (!bd && n) { bd = el('span', 'tab__bd'); bd.setAttribute('aria-hidden', 'true'); tab.appendChild(bd); }
      if (bd) { bd.hidden = !n; bd.textContent = unreadBadgeText(n); }
      tab.setAttribute('aria-label', n ? p[2] + ', ' + n + ' chưa đọc' : p[2]);
    }
    var b = $('#' + p[3] + 'ReadAll');
    if (b) b.hidden = !n;
  });
}
function postUnread(job){
  return apiFetch('/api/unread/read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(job) })
    .then(function(r){ return !!(r && r.status && r.status < 500); }, function(){ return false; });
}
function flushUnread(){
  var jobs = unreadQ;
  unreadQ = [];
  unreadFly = unreadFly.concat(jobs);
  return jobs.reduce(function(p, j){
    return p.then(function(){ return postUnread(j).then(function(ok){
      unreadFly.splice(unreadFly.indexOf(j), 1);
      if (!ok) unreadQ.push(j);
    }); });
  }, Promise.resolve());
}
function markRead(kind, key){
  var K = unreadK(kind), k = String(key), i = unread[K].indexOf(k);
  if (i < 0) return;
  unread[K].splice(i, 1);
  var body = $('#' + (K === 'NHAP' ? 'imp' : 'exp') + 'Body');
  if (body && body.querySelectorAll) [].forEach.call(body.querySelectorAll('tr[data-ukey]'), function(tr){
    var d = tr.getAttribute('data-ukey') === k ? tr.querySelector('.udot') : null;
    if (d && d.parentNode) d.parentNode.removeChild(d);
  });
  renderUnread();
  unreadQ.push({ kind: K, keys: [k] });
  flushUnread();
}
function unreadAll(kind){
  var K = unreadK(kind);
  if (!unread[K].length) return;
  unread[K] = [];
  unreadQ.push({ all: K });
  renderUnread();
  renderHistory(K === 'NHAP' ? 'imp' : 'exp');
  flushUnread();
}
function refreshUnread(){
  if (unreadBusy || authLost || doc.hidden) return Promise.resolve(false);
  unreadBusy = true;
  return flushUnread().then(function(){ return apiFetch('/api/unread'); }).then(function(r){
    return r && r.status === 200 ? r.json() : null;
  }).then(function(d){
    unreadBusy = false;
    var u = d && d.success && d.data;
    if (!u) return false;
    var next = { BAN: [], NHAP: [] };
    ['BAN', 'NHAP'].forEach(function(K){
      var pend = [];
      unreadQ.concat(unreadFly).forEach(function(j){ if (j.all === K) pend = null; else if (pend && j.kind === K) pend = pend.concat(j.keys); });
      (Array.isArray(u[K]) ? u[K] : []).forEach(function(k){ if (pend && pend.indexOf(k) < 0) next[K].push(String(k)); });
    });
    var changed = next.BAN.join('|') !== unread.BAN.join('|') || next.NHAP.join('|') !== unread.NHAP.join('|');
    unread = next;
    renderUnread();
    if (changed) { renderHistory('exp'); renderHistory('imp'); }
    return true;
  }).catch(function(){ unreadBusy = false; return false; });
}
function initUnread(){
  [['expBody', 'exp'], ['impBody', 'imp']].forEach(function(p){
    var b = $('#' + p[0]);
    if (b && b.addEventListener) b.addEventListener('click', function(e){
      var tr = e.target && e.target.closest ? e.target.closest('tr[data-ukey]') : null;
      if (tr) markRead(p[1], tr.getAttribute('data-ukey'));
    });
  });
  refreshUnread();
}
function appendOrderRow(tbody, r, isImp){
  var tr = el('tr');
  tr.className = 'is-row';
  tr.appendChild(el('td', 'muted small', dateVN(r.date) + (r.hasTime ? ' ' + timeVN(r.ts) : '')));
  var tn = el('td', 'b his-ord');
  var nameBtn = el('button', 'linkbtn', r.oname);
  nameBtn.type = 'button';
  nameBtn.setAttribute('data-action', 'order-view');
  nameBtn.setAttribute('data-oid', r.oid);
  var ariaOrder = (r.oname && r.oname.indexOf('ngày') !== -1)
    ? ('Xem chi tiết ' + r.oname)
    : ('Xem chi tiết ' + r.oname + ' ngày ' + dateVN(r.date));
  nameBtn.setAttribute('aria-label', ariaOrder);
  var ud = udot(isImp ? 'imp' : 'exp', r.oid);
  if (ud) tn.appendChild(ud);
  tr.setAttribute('data-ukey', String(r.oid));
  tn.appendChild(nameBtn);
  tn.appendChild(el('span', 'muted small', ' · ' + r.n + ' vị'));
  tr.appendChild(tn);
  var cQty = el('td', 'num', fmtQty(r.qty));
  cQty.setAttribute('data-label', 'SL');
  tr.appendChild(cQty);
  var cPrice = el('td', 'num muted', '—');
  cPrice.setAttribute('data-label', 'Đơn giá');
  tr.appendChild(cPrice);
  var cTotal = el('td', 'num b ' + (isImp ? 'txt-blue' : 'txt-green'), fmtMoney(r.total));
  cTotal.setAttribute('data-label', 'Thành tiền');
  tr.appendChild(cTotal);
  var td = el('td', 'c-act');
  td.appendChild(rowMenu([
    { label: 'Xóa đơn', icon: 'trash', action: 'del-order', id: r.oid, danger: true }
  ], 'Thao tác với ' + r.oname));
  tr.appendChild(td);
  tbody.appendChild(tr);
}
var orderCur = null, orderPage = 1;
function renderOrder(){
  var items = db.transactions.filter(function(t){
    return t.oid && String(t.oid) === String(orderCur);
  });
  var tb = $('#orderBody');
  if (!items.length) { closeOrder(); return; }
  if (!tb) return;
  var first = items[0];
  var isImp = first.type === 'NHAP';
  var oname = (first.oname && first.oname !== first.oid) ? first.oname : (isImp ? ('Đơn nhập ngày ' + dateVN(first.date)) : '');
  var isRetail = !isImp && (items.some(function(t){ return t.retail; }) || oname === 'Bán lẻ');
  var preset = (!isImp && !isRetail) ? presetByName(oname) : null;
  var metaThang = 0, metaUnit = 0;
  items.forEach(function(t){
    if (num(t.thang) > 0) metaThang = num(t.thang);
    if (num(t.unitPrice) > 0) metaUnit = num(t.unitPrice);
  });
  var thang = 0;
  if (!isImp && !isRetail) {
    if (metaThang > 0) thang = Math.max(1, Math.round(metaThang));
    else if (preset) thang = Math.max(1, Math.round(num(preset.thang) || 1));
  }
  var totalMoney = 0, totalKg = 0, maxTs = 0, hasTime = false;
  items.forEach(function(t){
    totalMoney += num(t.total);
    totalKg += num(t.qty);
    var s = txStamp(t);
    if (s > maxTs) maxTs = s;
    if (txHasTime(t)) hasTime = true;
  });
  var perThang = !isImp && thang > 0;
  var unitPrice = perThang ? (metaUnit > 0 ? metaUnit : dec(totalMoney / thang)) : 0;

  var gramsPerThang = 0;
  items.forEach(function(t){
    if (perThang) gramsPerThang += num(t.g) > 0 ? num(t.g) : num(t.qty) * 1000 / thang;
  });

  var qtyHead = $('#orderQtyHead');
  if (qtyHead) qtyHead.textContent = perThang ? 'SL (gram)' : 'SL';
  var priceHead = $('#orderPriceHead');
  if (priceHead) priceHead.hidden = !isImp;
  var moneyHead = $('#orderMoneyHead');
  if (moneyHead) moneyHead.hidden = perThang;
  var footLabel = $('#orderFootLabel');
  if (footLabel) footLabel.textContent = perThang ? 'Tổng 1 thang' : 'Tổng cộng';
  var footQty = $('#orderFootQty');
  if (footQty) footQty.textContent = perThang ? fmtGram(gramsPerThang) : fmtQty(totalKg);
  var footPrice = $('#orderFootPrice');
  if (footPrice) { footPrice.hidden = !isImp; footPrice.textContent = '—'; }
  var footMoney = $('#orderFootMoney');
  if (footMoney) {
    footMoney.hidden = perThang;
    footMoney.textContent = fmtMoney(totalMoney);
  }

  var meta = $('#orderMeta');
  if (meta) {
    var parts = ['Ngày ' + dateVN(first.date) + (hasTime ? ' ' + timeVN(maxTs) : ''), items.length + ' vị'];
    if (perThang) {
      parts.push(fmtQty(gramsPerThang / 1000) + '/thang');
      if (thang > 1) parts.push('tổng ' + thang + ' thang: ' + fmtQty(totalKg));
    } else {
      parts.push(fmtQty(totalKg));
    }
    meta.textContent = parts.join(' · ');
  }
  var title = $('#orderTitle');
  if (title) title.textContent = isImp ? ('Đơn nhập ngày ' + dateVN(first.date)) : oname;
  var noteTitle = $('#orderNoteTitle');
  if (noteTitle) noteTitle.textContent = isImp ? 'Tờ ghi nhập hàng' : (perThang ? 'Tờ ghi đơn thuốc chén' : (isRetail ? 'Tờ ghi đơn bán lẻ' : 'Tờ ghi đơn'));

  var pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  if (orderPage > pages) orderPage = pages;
  if (orderPage < 1) orderPage = 1;
  var start = (orderPage - 1) * PAGE_SIZE;
  tb.textContent = '';
  items.slice(start, start + PAGE_SIZE).forEach(function(t, k){
    var i = start + k;
    var p = findProduct(t.productId);
    var tr = el('tr');
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', p ? p.name : 'Đã xóa'));
    if (perThang) {
      var g = num(t.g) > 0 ? num(t.g) : num(t.qty) * 1000 / thang;
      tr.appendChild(el('td', 'num', fmtGram(g)));
    } else {
      var cq = el('td', 'num', fmtQty(t.qty));
      if (!isImp && !t.rx) {
        var cp2 = costParen(t.cost, t.qty);
        if (cp2) {
          var sp3 = el('span', 'muted small', ' ' + cp2);
          sp3.setAttribute('title', 'Giá vốn tại thời điểm bán (nghìn đồng/kg)');
          cq.appendChild(sp3);
        }
      }
      tr.appendChild(cq);
      if (isImp) tr.appendChild(el('td', 'num r', fmtUnitPrice(t.price)));
      tr.appendChild(el('td', 'num r b ' + (isImp ? 'txt-blue' : 'txt-green'), fmtMoney(t.total)));
    }
    var tdA = el('td', 'c-act');
    tdA.appendChild(rowMenu([
      { label: 'Sửa dòng', icon: 'edit', action: 'tx-edit', id: t.id },
      { label: 'Xóa dòng', icon: 'trash', action: 'del-tx', id: t.id, danger: true }
    ], 'Thao tác với dòng ' + (i + 1)));
    tr.appendChild(tdA);
    tb.appendChild(tr);
  });
  var pg = $('#orderNotePg');
  if (pg) pg.textContent = 'Trang ' + orderPage + ' / ' + pages;
  var host = $('#orderPager');
  if (host) {
    host.hidden = pages <= 1;
    if (pages > 1) renderPager(host, orderPage, pages, 'order');
  }

  var params = $('#orderParams');
  if (params) params.hidden = !perThang;
  if (perThang) {
    var pt = $('#orderThang');
    if (pt) pt.textContent = String(thang);
    var pu = $('#orderUnitPrice');
    if (pu) pu.textContent = fmtMoney(unitPrice);
    var po = $('#orderTotal');
    if (po) po.textContent = fmtMoney(totalMoney);
  }
}
function openOrder(oid){
  if (!oid) { toast('Đơn không còn tồn tại', 'error'); return; }
  if (!db.transactions.some(function(x){ return String(x.oid) === String(oid); })) {
    toast('Đơn không còn tồn tại', 'error');
    return;
  }
  orderCur = String(oid);
  orderPage = 1;
  renderOrder();
  var d = $('#orderDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function closeOrder(){
  var d = $('#orderDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
  orderCur = null;
}
function dateVN(iso){
  var d = String(iso || '').split('-');
  return d.length === 3 ? d[2] + '/' + d[1] + '/' + d[0] : 'Không rõ ngày';
}
/* N5 (2.13.0): không còn Gần nhất/Tất cả; luôn sắp mới nhất trước; ô tìm theo tên áp cho cả hai lịch sử. */
function historyData(kind, month, q){
  var isImp = kind === 'imp';
  indexTx();
  var pm = productMap();
  var nq = normSearch(q || '');
  var list = db.transactions.filter(function(t){
    if (t.type !== (isImp ? 'NHAP' : 'BAN') || t.open) return false;
    if (isImp) return true;
    return !month || (t.date && String(t.date).indexOf(month) === 0);
  });

  var oidCount = Object.create(null);
  if (isImp) {
    list.forEach(function(t){ if (t.oid) oidCount[t.oid] = (oidCount[t.oid] || 0) + 1; });
  }

  var map = Object.create(null), rows = [];
  list.forEach(function(t){
    var groupable = !!t.oid && (isImp ? oidCount[t.oid] > 1 : !!t.oname);
    if (!groupable) {
      rows.push({
        single: true, tx: t,
        date: String(t.date || ''),
        ts: txStamp(t), hasTime: txHasTime(t),
        name: txName(t, pm), qty: num(t.qty), total: num(t.total), price: num(t.price)
      });
      return;
    }
    var g = map[t.oid];
    if (!g) {
      g = map[t.oid] = {
        group: true, oid: t.oid, oname: t.oname || '',
        date: String(t.date || ''), ts: txStamp(t), hasTime: txHasTime(t),
        qty: 0, total: 0, n: 0, items: [], name: ''
      };
      rows.push(g);
    }
    g.items.push(t);
    g.qty += num(t.qty);
    g.total += num(t.total);
    g.n++;
    var s = txStamp(t);
    if (s > g.ts) g.ts = s;
    if (txHasTime(t)) g.hasTime = true;
  });

  rows.forEach(function(r){
    if (!r.group) return;
    if (!r.oname || r.oname === r.oid) {
      r.oname = isImp ? ('Đơn nhập ngày ' + dateVN(r.date) + (r.hasTime ? ' · ' + timeVN(r.ts) : '')) : 'Đơn';
    }
    r.name = r.oname;
  });

  if (nq) {
    rows = rows.filter(function(r){
      if (r.group) {
        if (wholeWordMatch(r.name || '', nq)) return true;
        return r.items.some(function(t){ var nm = txName(t, pm); return nm && wholeWordMatch(nm, nq); });
      }
      return r.name && wholeWordMatch(r.name, nq);
    });
  }

  rows.sort(function(a, b){
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (b.ts !== a.ts) return b.ts - a.ts;
    return 0;
  });
  var top = rows.length && rows[0].date ? rows[0] : null;

  return { rows: rows, latestDate: top ? top.date : '', latestTs: top ? top.ts : -Infinity, latestHasTime: top ? top.hasTime : false };
}
function renderHistory(kind){
  var isImp = kind === 'imp';
  var tbody = $('#' + kind + 'Body');
  if (!tbody) return;
  var month = isImp ? '' : getMonthInput('expMonth');
  var sq = String(($('#' + kind + 'Search') || {}).value || '');
  var data = historyData(kind, month, sq);
  var rows = data.rows;

  var count = $('#' + kind + 'Count');
  if (count) {
    var suffix = '';
    if (data.latestDate) {
      suffix = ' · ' + (isImp ? 'nhập' : 'bán') + ' gần nhất ' + dateVN(data.latestDate) +
        (data.latestHasTime ? ' ' + timeVN(data.latestTs) : '');
    }
    count.textContent = rows.length + (isImp ? ' lần nhập' : ' giao dịch') + suffix;
  }

  tbody.textContent = '';
  if (!rows.length) {
    emptyRow(tbody, 6, isImp ? 'Không có giao dịch nhập.' : 'Không có giao dịch bán.');
    renderPager($('#' + kind + 'Pager'), 1, 1, kind);
    return;
  }

  var page = isImp ? impPage : expPage;
  var fp = fitPage(kind, $('#' + kind + 'Box .tw'), page), hps = fp.ps;
  page = fp.page;
  var totalPages = Math.ceil(rows.length / hps) || 1;
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;
  if (isImp) impPage = page; else expPage = page;
  var slice = rows.slice((page - 1) * hps, page * hps);

  slice.forEach(function(r){
    if (r.group) { appendOrderRow(tbody, r, isImp); return; }
    var t = r.tx;
    var tr = el('tr');
    tr.className = 'is-row';
    tr.appendChild(el('td', 'muted small', dateVN(t.date) + (r.hasTime ? ' ' + timeVN(r.ts) : '')));
    var name = r.name;
    var tdn = el('td', 'b', name === null ? 'Đã xóa' : name);
    var ukey = String(t.oid || t.id);
    var ud2 = udot(kind, ukey);
    if (ud2) tdn.insertBefore(ud2, tdn.firstChild);
    tr.setAttribute('data-ukey', ukey);
    tr.appendChild(tdn);
    var cQty = el('td', 'num', fmtQty(t.qty));
    cQty.setAttribute('data-label', 'SL');
    if (!isImp && !t.rx) {
      var cp = costParen(t.cost, t.qty);
      if (cp) {
        var sp2 = el('span', 'muted small', ' ' + cp);
        sp2.setAttribute('title', 'Giá vốn tại thời điểm bán (nghìn đồng/kg)');
        cQty.appendChild(sp2);
      }
    }
    tr.appendChild(cQty);
    var cPrice = el('td', 'num muted', fmtUnitPrice(t.price));
    cPrice.setAttribute('data-label', 'Đơn giá');
    tr.appendChild(cPrice);
    var cTotal = el('td', 'num b ' + (isImp ? 'txt-blue' : 'txt-green'), fmtMoney(t.total));
    cTotal.setAttribute('data-label', 'Thành tiền');
    tr.appendChild(cTotal);
    var td = el('td', 'c-act');
    td.appendChild(rowMenu([
      { label: 'Sửa giao dịch', icon: 'edit', action: 'tx-edit', id: t.id },
      { label: 'Xóa giao dịch', icon: 'trash', action: 'del-tx', id: t.id, danger: true }
    ], 'Thao tác với giao dịch ngày ' + dateVN(t.date)));
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
  renderPager($('#' + kind + 'Pager'), page, totalPages, kind);
}
/* ================= ĐỐI CHIẾU TỒN KHO ================= */
function reconcileList(){
  var inn = Object.create(null), out = Object.create(null);
  db.transactions.forEach(function(t){
    var m = t.type === 'NHAP' ? inn : out;
    m[t.productId] = (m[t.productId] || 0) + num(t.qty);
  });
  var res = [];
  db.products.forEach(function(p){
    var calc = dec((inn[p.id] || 0) - (out[p.id] || 0));
    var diff = dec(num(p.stock) - calc);
    if (Math.abs(diff) > 1e-9) res.push({ id: p.id, name: p.name, stock: num(p.stock), calc: calc, diff: diff });
  });
  res.sort(function(a, b){ return Math.abs(b.diff) - Math.abs(a.diff); });
  return res;
}
function fmtKgExact(v){ return fmtNum(v) + ' kg'; }
function renderRec(){
  var tb = $('#recBody');
  if (!tb) return;
  var list = reconcileList();
  tb.textContent = '';
  var hint = $('#recHint');
  if (hint) {
    hint.textContent = list.length
      ? list.length + ' vị thuốc có tồn khác với số tính từ lịch sử (tổng nhập trừ tổng bán). Chỉ áp dụng khi bạn chắc lịch sử đúng; nếu lịch sử có dòng nhập nhầm thì sửa dòng đó trước.'
      : 'Tồn kho của tất cả vị thuốc khớp với lịch sử nhập và bán.';
  }
  list.forEach(function(r){
    var tr = el('tr');
    tr.appendChild(el('td', 'b', r.name));
    tr.appendChild(el('td', 'num', fmtKgExact(r.stock)));
    tr.appendChild(el('td', 'num', fmtKgExact(r.calc)));
    tr.appendChild(el('td', 'num', (r.diff > 0 ? '+' : '') + fmtKgExact(r.diff)));
    var td = el('td', 'c-act');
    var b = el('button', 'btn btn--sm', 'Dùng số lịch sử');
    b.type = 'button';
    b.setAttribute('data-action', 'rec-fix');
    b.setAttribute('data-id', r.id);
    td.appendChild(b);
    tr.appendChild(td);
    tb.appendChild(tr);
  });
  var fa = $('#recFixAll');
  if (fa) fa.hidden = !list.length;
}
function openRec(){
  renderRec();
  var d = $('#recDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function closeRec(){
  var d = $('#recDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
}
function recFix(id){
  var p = findProduct(id);
  if (!p) return;
  var r = null;
  reconcileList().forEach(function(x){ if (String(x.id) === String(id)) r = x; });
  if (!r) return;
  if (r.calc < -1e-9) {
    toast('Số theo lịch sử đang âm — không thể áp dụng. Hãy sửa giao dịch nhập/bán trước.', 'error');
    return;
  }
  var limFx = checkLimits('q', Math.max(0, r.calc));
  if (limFx) { toast(limFx, 'error'); return; }
  if (!confirm('Đặt tồn "' + p.name + '" từ ' + fmtQty(p.stock) + ' về ' + fmtQty(Math.max(0, r.calc)) + '?')) return;
  p.stock = Math.max(0, r.calc);
  commit('Đã chỉnh tồn "' + p.name + '"');
  renderRec();
}
function recFixAll(){
  var list = reconcileList();
  if (!list.length) return;
  var valid = list.filter(function(r){ return r.calc >= -1e-9 && !checkLimits('q', Math.max(0, r.calc)); });
  if (!valid.length) {
    toast('Tất cả vị lệch đều có số lịch sử âm — hãy sửa giao dịch trước.', 'error');
    return;
  }
  if (!confirm('Đặt lại tồn của ' + valid.length + ' vị thuốc theo lịch sử?' +
    (valid.length < list.length ? '\n(' + (list.length - valid.length) + ' vị có số âm hoặc vượt giới hạn sẽ bỏ qua.)' : ''))) return;
  valid.forEach(function(r){
    var p = findProduct(r.id);
    if (p) p.stock = Math.max(0, r.calc);
  });
  commit('Đã chỉnh tồn ' + valid.length + ' vị thuốc');
  renderRec();
}
/* ================= BIỂU ĐỒ ================= */
var chartSel = -1, chartHover = -1, chartGeo = null, chartScrollNow = true;
/* 2.25.0: desktop luôn là một năm (số), 12 nhóm Y-01..Y-12; mặc định và mỗi lần mở tab = năm hiện tại. Bước năm kẹp 2000..2100; hàm thuần. */
var chartYr = Number(thisYear());
var chartMode = 'D', chartDy = chartYr, chartDm = parseInt(todayISO().slice(5, 7), 10); /* 2.34.0 desktop: 'Y' năm | 'M' tháng | 'D' ngày (mặc định Ngày); chartSel = cột đang GIỮ, chartHover = xem tạm */
function chartYearStep(cur, dir){ return Math.min(2100, Math.max(2000, cur + dir)); }
function chartYearGo(dir){ if (chartMode === 'D') { var s = chartMonthStep(chartDy, chartDm, dir); chartDy = s.y; chartDm = s.m; } else if (chartMode === 'M') chartYr = chartYearStep(chartYr, dir); chartSel = -1; chartHover = -1; chartScrollNow = true; renderChart(); }
/* 2.36.0 điện thoại, chế độ Ngày: canvas rộng n/12 khung (khung thấy 12 ngày, vuốt ngang); hàm thuần: bề rộng canvas và scrollLeft đưa mục idx vào giữa khung (idx < 0 → 0). */
function chartWideW(frameW, n){ return Math.round(frameW * n / 12); }
function chartScrollLeft(idx, groupW, frameW, totalW){ return idx < 0 ? 0 : Math.round(Math.max(0, Math.min(totalW - frameW, idx * groupW + groupW / 2 - frameW / 2))); }
function chartModeSet(m){
  chartMode = m; chartSel = -1; chartHover = -1; chartScrollNow = true;
  chartYr = Number(thisYear()); chartDy = chartYr; chartDm = parseInt(todayISO().slice(5, 7), 10); /* 2.36.0: đổi chế độ bằng công tắc = về kỳ hiện tại (hôm nay / tháng này / năm nay) */
  [['#chartModeY', 'Y'], ['#chartModeM', 'M'], ['#chartModeD', 'D']].forEach(function(b){ var e = $(b[0]); if (e) { e.classList.toggle('on', b[1] === m); e.setAttribute('aria-pressed', b[1] === m ? 'true' : 'false'); } });
  var k = $('#chartYrK'); if (k) k.textContent = m === 'D' ? 'Tháng' : 'Năm';
  var yb = $('.thk__y'); if (yb) yb.style.display = m === 'Y' ? 'none' : '';
  renderChart();
}
/* 2.34.0 hàm thuần: danh sách năm (từ năm có giao dịch sớm nhất tới năm lớn nhất có giao dịch, tối thiểu nowY), cột mặc định (hôm nay / tháng này / năm nay, -1 nếu kỳ đang xem không chứa), bước phím ←→ (dừng hai đầu). */
function chartYears(txs, nowY){
  var lo = nowY, hi = nowY, o = [], y;
  (txs || []).forEach(function(t){ y = parseInt(String(t && t.date || '').slice(0, 4), 10); if (y >= 2000 && y <= 2100) { if (y < lo) lo = y; if (y > hi) hi = y; } }); /* 2.37.0: cả năm sau (ngày phiếu tới 2100) để không rơi khỏi biểu đồ Năm */
  for (y = lo; y <= hi; y++) o.push(y);
  return o;
}
function chartDefIdx(mode, dy, dm, yr, years, today){
  var ty = parseInt(today.slice(0, 4), 10), tm = parseInt(today.slice(5, 7), 10);
  if (mode === 'D') return dy === ty && dm === tm ? parseInt(today.slice(8, 10), 10) - 1 : -1;
  if (mode === 'M') return yr === ty ? tm - 1 : -1;
  return years.indexOf(ty);
}
function chartKeyStep(cur, def, n, dir){ var c = cur >= 0 ? cur : def; return c < 0 ? (dir > 0 ? 0 : n - 1) : Math.min(n - 1, Math.max(0, c + dir)); }
function chartKey(dir){ var d = chartData(); chartSel = chartKeyStep(chartSel, d.def, d.n, dir); renderChart(); }
/* 2.24.0: vạch trục Y đẹp (nghìn đồng, số nguyên): bước 1/2/2,5/5 x 10^k, 4-5 vạch tính cả 0. Hàm thuần. */
function chartTicks(maxK){
  var raw = Math.max(1, maxK / 4), e = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / e;
  var step = [1, 2, 2.5, 5, 10].filter(function(v){ return m <= v && Number.isInteger(Math.round(v * e * 1e6) / 1e6); })[0] * e; /* raw >= 1 nên e >= 1 và step >= 1 */
  var n = Math.max(1, Math.ceil(maxK / step - 1e-9)), out = [];
  for (var i = 0; i <= n; i++) out.push(i * step);
  return out;
}
/* 2.33.0: theo NGÀY. Hàm thuần: số ngày của tháng m (1..12) năm y; bước tháng kẹp 01/2000..12/2100; tổng Nhập/Bán từng ngày (cộng dồn). */
function chartDaysIn(y, m){ return m === 2 ? ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28) : (m === 4 || m === 6 || m === 9 || m === 11 ? 30 : 31); }
function chartMonthStep(y, m, dir){ var k = Math.min(2100 * 12 + 11, Math.max(2000 * 12, y * 12 + m - 1 + dir)); return { y: Math.floor(k / 12), m: k % 12 + 1 }; }
function chartBuckets(txs, prods, n, idxOf){
  var byId = Object.create(null), a = [], b = [], p = [], i;
  (prods || []).forEach(function(q){ byId[q.id] = q; });
  for (i = 0; i < n; i++) { a.push(0); b.push(0); p.push(0); }
  txs.forEach(function(t){
    var i = idxOf(t.date ? String(t.date).slice(0, 10) : '');
    if (!(i >= 0 && i < n)) return;
    var v = num(t.total);
    if (t.type === 'NHAP') a[i] += v; else { b[i] += v; p[i] += v - txCost(t, byId); } /* lợi nhuận = chỉ BÁN, vốn như computeStats */
  });
  return { impK: a.map(dec), expK: b.map(dec), profK: p.map(dec), n: n };
}
function chartDayTotals(txs, y, m, prods){ var ym = y + '-' + pad2(m); return chartBuckets(txs, prods, chartDaysIn(y, m), function(k){ return k.slice(0, 7) === ym ? parseInt(k.slice(8, 10), 10) - 1 : -1; }); }
/* 2.40.0: giao dịch cho biểu đồ = bỏ dòng tồn đầu kỳ; Tháng/Năm cộng bảng tóm tắt đã chốt (mỗi tháng 2 dòng giả ngày 01, Ngày thì không vì không có số từng ngày). */
function statTxs(withClosed){
  var o = db.transactions.filter(function(t){ return !t.open; });
  if (withClosed && db.closed) db.closed.months.forEach(function(e){
    var d = e.m + '-01';
    o.push({ date: d, type: 'NHAP', total: e.imp }, { date: d, type: 'BAN', total: e.rev, cost: e.cost, qty: 0 });
  });
  return o;
}
function chartData(){
  var txs = statTxs(chartMode !== 'D'), yl = chartYears(txs, Number(thisYear())), d, lab = [], i;
  if (chartMode === 'D') d = chartDayTotals(txs, chartDy, chartDm, db.products);
  else if (chartMode === 'M') d = chartBuckets(txs, db.products, 12, function(k){ return parseInt(k.slice(0, 4), 10) === chartYr ? parseInt(k.slice(5, 7), 10) - 1 : -1; });
  else d = chartBuckets(txs, db.products, yl.length, function(k){ return parseInt(k.slice(0, 4), 10) - yl[0]; });
  for (i = 0; i < d.n; i++) lab.push(chartMode === 'Y' ? String(yl[0] + i) : pad2(i + 1));
  d.labels = lab; d.mode = chartMode; d.def = chartDefIdx(chartMode, chartDy, chartDm, chartYr, yl, todayISO());
  return d;
}
function bar(ctx, x, y, w, h, r){
  if (h <= 0.2 || w <= 0) return;
  r = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}
function renderChart(){
  var cv = $('#statsChart');
  if (!cv || !cv.offsetParent) return;
  var host = cv.parentNode;
  var wide = !isDesk() && chartMode === 'D', dd = chartData();
  if (cv.style) cv.style.width = wide && host.clientWidth ? chartWideW(host.clientWidth, dd.n) + 'px' : ''; /* 2.36.0 */
  var cssW = cv.clientWidth || host.clientWidth || 600;
  var cssH = cv.clientHeight || 300;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(cssW * dpr);
  cv.height = Math.round(cssH * dpr);
  var ctx = cv.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  var cs = getComputedStyle(doc.documentElement);

  drawChartDesk(cv, ctx, cssW, cssH, cs, dd);
  if (wide && chartScrollNow) { chartScrollNow = false; host.scrollLeft = chartScrollLeft(chartSel >= 0 ? chartSel : dd.def, cssW / dd.n, host.clientWidth, cssW); }
}
function setChartTip(mmStr, impV, expV, prfV){
  var impTxt = impV == null ? '—' : fmtMoneyInt(impV), expTxt = expV == null ? '—' : fmtMoneyInt(expV); /* null = chưa trỏ tháng nào (desktop) */
  var mEl = $('#chartMonth'), sEl = $('#chartTipSr');
  if (mEl) mEl.textContent = mmStr;
  /* 2.15.0: chú giải "[ô màu] Nhập số tiền"; số tiền nằm trong phần tử con (chip còn nhãn + ô màu). */
  var iV = $('#chartImpVal'), eV = $('#chartExpVal');
  if (iV) iV.textContent = impTxt;
  if (eV) eV.textContent = expTxt;
  var pV = $('#chartPrfVal');
  var prfTxt = prfV == null ? '—' : fmtMoneyInt(prfV);
  if (pV) { pV.textContent = prfTxt; pV.className = 'chart-chip__v' + (prfV < 0 ? ' txt-red' : ''); }
  if (sEl) sEl.textContent = (chartMode === 'D' ? 'Ngày ' : chartMode === 'Y' ? 'Năm ' : 'Tháng ') + mmStr + ' — Nhập: ' + impTxt + ' · Bán: ' + expTxt + (prfV == null ? '' : ' · Lợi nhuận: ' + prfTxt);
}
/* 2.34.0 desktop: cột đôi Nhập/Bán theo Năm/Tháng/Ngày, chỉ lưới ngang mờ (không nhãn trục Y), nhãn trục X trong viên viền tròn 21px (năm: 40px); mục hiện = rê > giữ > mặc định; hover/bấm → vạch dọc + chú thích (#chartTip). */
function chartYearBw(groupW){ return Math.max(1, Math.min(36, (groupW - 8) / 2)); } /* 2.34.1 hàm thuần: bề rộng mỗi cột trong ô năm (36, thu lại khi nhiều năm để không chồng) */
/* 2.35.0 hàm thuần: bước nhãn trục X khi ô hẹp (điện thoại): nhỏ nhất trong 1/2/3/5 mà bước*groupW >= bề rộng viên nhãn + 4 (năm 44, còn lại 25). */
function chartLabelStep(groupW, mode){ var need = mode === 'Y' ? 44 : 25, k = [1, 2, 3, 5]; for (var i = 0; i < k.length; i++) if (k[i] * groupW >= need) return k[i]; return 5; }
/* 2.35.1 hàm thuần: vị trí x nhãn trục X {chỉ số: x}. Nhãn cuối luôn có, kẹp để vòng nằm trọn canvas; nhãn nào chồng nhãn cuối thì bỏ.
   2.36.1: lề 0.5px (không 1px) và khi hiện đủ mọi nhãn (lst<=1) khoảng cách tối thiểu = min(rw+3, groupW): ô >= rw+1 nên tâm tự nhiên không bị kẹp/bỏ nhãn. */
function chartLabelPlan(n, groupW, cssW, rw, lst){
  var m = {}, i, lx = cssW - rw / 2 - .5, gap = lst <= 1 && groupW >= rw + 1 ? Math.min(rw + 3, groupW) : rw + 3;
  for (i = 0; i < n; i++) if (lst <= 1 || (i + 1) % lst === 0) m[i] = groupW * i + groupW / 2;
  m[n - 1] = Math.min(groupW * (n - 1) + groupW / 2, lx);
  for (i = 0; i < n - 1; i++) if (m[i] != null && m[i] > m[n - 1] - gap + 1e-9) delete m[i];
  return m;
}
function drawChartDesk(cv, ctx, cssW, cssH, cs, data){
  var padT = 10, padB = 32, mode = data.mode, n = data.n, i;
  var impC = cs.getPropertyValue('--chart-imp').trim() || '#44DAFE', expC = cs.getPropertyValue('--chart-exp').trim() || '#FFA33D';
  var vmax = 0, yl = $('#chartYrL'), yp = $('#chartPrev'), yn = $('#chartNext');
  if (yl) yl.textContent = mode === 'D' ? pad2(chartDm) + '/' + chartDy : chartYr;
  if (yp) yp.disabled = mode === 'D' ? chartDy * 12 + chartDm <= 24001 : chartYr <= 2000;
  if (yn) yn.disabled = mode === 'D' ? chartDy * 12 + chartDm >= 2100 * 12 + 12 : chartYr >= 2100;
  var tipEl = $('#chartTip'); if (tipEl) tipEl.setAttribute('data-m', mode);
  for (i = 0; i < n; i++) vmax = Math.max(vmax, data.impK[i], data.expK[i]);
  var ticks = chartTicks(vmax / 1000), top = ticks[ticks.length - 1] * 1000;
  var hi = chartHover >= 0 ? chartHover : chartSel >= 0 ? chartSel : data.def;
  var groupW = cssW / n, W = groupW * n; /* 2.34.1: mỗi năm một ô chia đều chiều rộng, cặp cột ở GIỮA ô */
  var H = Math.max(10, cssH - padT - padB), y0 = padT + H;
  var ph = !isDesk(), lst = ph && mode !== 'D' ? chartLabelStep(groupW, mode) : 1; /* 2.36.0: điện thoại Ngày = canvas rộng, nhãn đủ mọi ngày */
  var bw = mode === 'Y' ? chartYearBw(groupW) : groupW * (ph ? .38 : .245), gap = mode === 'Y' ? 2 : groupW * (ph ? .08 : .1);
  ticks.forEach(function(v){
    var y = Math.round(y0 - H * v * 1000 / top) + 0.5;
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssW, y); ctx.stroke();
  });
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.font = '12px -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter",system-ui,"Segoe UI",sans-serif';
  var rw = mode === 'Y' ? 40 : ph ? 21 : Math.min(21, groupW - 1), rh = 21, ly = y0 + 17, r = rh / 2;
  var lp = chartLabelPlan(n, groupW, cssW, rw, lst);
  for (i = 0; i < n; i++) {
    var cx = groupW * i + groupW / 2, on = i === hi;
    if (on) { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(Math.round(cx), padT, 1, H); }
    ctx.fillStyle = impC; bar(ctx, cx - gap / 2 - bw, y0 - H * data.impK[i] / top, bw, H * data.impK[i] / top, 3);
    ctx.fillStyle = expC; bar(ctx, cx + gap / 2, y0 - H * data.expK[i] / top, bw, H * data.expK[i] / top, 3);
    if (lp[i] == null) continue; /* điện thoại: nhãn thưa (ngày chẵn / mỗi 3,5 ngày), cột vẫn đủ */
    cx = lp[i];
    ctx.beginPath(); ctx.arc(cx - rw / 2 + r, ly, r, Math.PI / 2, Math.PI * 1.5); ctx.arc(cx + rw / 2 - r, ly, r, -Math.PI / 2, Math.PI / 2); ctx.closePath();
    if (on) { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill(); }
    ctx.strokeStyle = on ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = on ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.7)';
    ctx.fillText(data.labels[i], cx, ly);
  }
  chartGeo = { n: n, padT: padT, W: W, H: H, groupW: groupW, y0: y0, cssW: cssW, cssH: cssH, yMax: cssH };
  var none = mode === 'D' ? '--/' + pad2(chartDm) + '/' + chartDy : mode === 'M' ? '--/' + chartYr : '----';
  if (hi < 0) setChartTip(none, null, null, null);
  else setChartTip(mode === 'D' ? pad2(hi + 1) + '/' + pad2(chartDm) + '/' + chartDy : mode === 'M' ? pad2(hi + 1) + '/' + chartYr : data.labels[hi], data.impK[hi], data.expK[hi], data.profK[hi]);
}
/* Chỉ số nhóm tháng (0..11) dưới con trỏ, -1 nếu ngoài vùng vẽ. */
function chartIdxAt(e){
  var cv = $('#statsChart');
  if (!cv || !chartGeo) return -1;
  var r = cv.getBoundingClientRect();
  var g = chartGeo;
  var x = (e.clientX - r.left) * (g.cssW / (r.width || g.cssW));
  var y = (e.clientY - r.top) * (g.cssH / (r.height || g.cssH));
  if (x < 0 || x > g.W || y < g.padT || y > g.yMax) return -1;
  var i = Math.floor(x / g.groupW);
  return i < 0 ? 0 : i > g.n - 1 ? g.n - 1 : i;
}
function onChartClick(e){
  var i = chartIdxAt(e);
  if (i < 0) return;
  chartSel = i; /* bấm/chạm = giữ (cột khác để đổi); desktop và điện thoại như nhau */
  renderChart();
}
function onChartMove(e){
  if (!isDesk()) return;
  var i = e.type === 'mouseleave' ? -1 : chartIdxAt(e);
  if (i === chartHover) return;
  chartHover = i;
  renderChart();
}

/* ================= GỢI Ý TÌM NHANH ================= */
var SUG = {
  retail: { input: 'retailSearch', list: 'retailList' },
  remedy: { input: 'remedySearch', list: 'remedyList' },
  nhap:   { input: 'nhapSearch', list: 'nhapList' },
  inv:    { input: 'invSearch', list: 'invList' },
  imph:   { input: 'impSearch', list: 'impSearchList' }
};
var sugIdx = -1;

/* 2.15.9 (mọi thiết bị): gợi ý chỉ khi chữ gõ khớp TRỌN và LIÊN TIẾP một dãy từ của tên (bỏ dấu, đ=d, không phân biệt hoa/thường).
   "cam" -> Cam Thảo; "ca" -> không; "cam thao" -> Cam Thảo; "cam th" -> không. Chữ gõ rỗng -> false. Hàm thuần. */
function wholeWordMatch(name, query){
  var qw = normSearch(query).split(/\s+/).filter(Boolean);
  var nw = normSearch(name).split(/\s+/).filter(Boolean);
  if (!qw.length || qw.length > nw.length) return false;
  for (var i = 0; i + qw.length <= nw.length; i++) {
    var ok = true;
    for (var j = 0; j < qw.length; j++) if (nw[i + j] !== qw[j]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}
/* 2.27.0: mọi ô tìm tên dùng wholeWordMatch; sugWhole chỉ còn quyết định bố cục khung gợi ý (3 hàng) của Bán lẻ/Thuốc chén/Nhập hàng. */
function sugWhole(key){ return key === 'retail' || key === 'remedy' || key === 'nhap'; }
/* 2.15.9: khung gợi ý cao đúng n mục (đo mục thật) + đệm/viền của khung; <= n mục thì 0 (không giới hạn). Hàm thuần. */
var SUG_ROWS = 3;
function sugListMaxHeight(heights, n, extra){
  var h = (heights || []).filter(function(x){ return x > 0; });
  var k = n > 0 ? n : SUG_ROWS;
  if (h.length <= k) return 0;
  var sum = 0;
  for (var i = 0; i < k; i++) sum += h[i];
  return Math.ceil(sum + (extra > 0 ? extra : 0));
}
/* Cuộn mục vào tầm nhìn BÊN TRONG khung gợi ý (không cuộn bằng API cuộn-vào-khung vì iOS có thể cuộn cả trang). */
function sugReveal(list, item){
  if (!list || !item) return;
  var t = item.offsetTop, b = t + item.offsetHeight;
  if (t < list.scrollTop) list.scrollTop = t;
  else if (b > list.scrollTop + list.clientHeight) list.scrollTop = b - list.clientHeight;
}
function matchProducts(q){
  var nq = normSearch(q);
  var arr = db.products.filter(function(p){ return !nq || wholeWordMatch(p.name, q); });
  arr.sort(function(a, b){
    var sa = nq && normSearch(a.name).indexOf(nq) === 0 ? 0 : 1;
    var sb = nq && normSearch(b.name).indexOf(nq) === 0 ? 0 : 1;
    return (sa - sb) || sortByName(a, b);
  });
  return arr.slice(0, 50);
}
function closeSuggest(key){
  var cfg = SUG[key];
  if (!cfg) return;
  var list = $('#' + cfg.list), inp = $('#' + cfg.input);
  if (list) list.hidden = true;
  if (inp) inp.setAttribute('aria-expanded', 'false');
  sugIdx = -1;
}
function openSuggest(key){
  var cfg = SUG[key];
  if (!cfg) return;
  var inp = $('#' + cfg.input), list = $('#' + cfg.list);
  if (!inp || !list) return;
  var items = matchProducts(inp.value);
  var raw = String(inp.value || '').trim();
  var exact = false;
  list.textContent = '';
  sugIdx = -1;
  items.forEach(function(p){
    if (raw && capWords(p.name).toLowerCase() === capWords(raw).toLowerCase()) exact = true;
    var b = el('button', 'sug__item');
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', 'false');
    b.setAttribute('data-pid', p.id);
    b.appendChild(el('span', 'sug__name', p.name));
    var meta = 'Tồn ' + fmtQty(p.stock);
    var pr = refPrice(p);
    if (pr > 0) meta += ' · ' + fmtUnitPrice(pr);
    b.appendChild(el('span', 'sug__meta', meta));
    b.addEventListener('mousedown', function(e){ e.preventDefault(); pickSuggest(key, p.id); });
    list.appendChild(b);
  });
  if (key === 'nhap' && raw && !exact) {
    var nb = el('button', 'sug__item');
    nb.type = 'button';
    nb.setAttribute('role', 'option');
    nb.setAttribute('aria-selected', 'false');
    nb.appendChild(el('span', 'sug__name', 'Tạo mới: ' + capWords(raw)));
    nb.appendChild(el('span', 'sug__meta', 'Vị thuốc mới'));
    nb.addEventListener('mousedown', function(e){ e.preventDefault(); nhapNewProduct(raw); });
    list.appendChild(nb);
  }
  if (!list.children.length) list.appendChild(el('div', 'sug__empty', 'Không tìm thấy vị thuốc nào'));
  list.hidden = false;
  list.style.maxHeight = '';
  if (sugWhole(key) && !isDesk()) { /* desktop: CSS cố định 3 hàng x 38px */
    var hs = [];
    for (var hi = 0; hi < list.children.length; hi++) hs.push(list.children[hi].getBoundingClientRect().height);
    var mh = sugListMaxHeight(hs, SUG_ROWS, 10); /* đệm 4+4 và viền 1+1 của .sug__list */
    list.style.maxHeight = mh ? mh + 'px' : '';
    list.scrollTop = 0;
  }
  inp.setAttribute('aria-expanded', 'true');
}
function dupOrderRow(bodySel, pid){
  var found = null;
  $$(bodySel + ' tr[data-pid]').forEach(function(tr){
    if (tr.getAttribute('data-pid') === String(pid)) found = tr;
  });
  return found;
}
function pickSuggest(key, id){
  var p = findProduct(id);
  if (!p) return;
  if (key === 'retail' || key === 'remedy') {
    var isR = key === 'retail';
    var dup = dupOrderRow(isR ? '#retailBody' : '#remedyBody', p.id);
    if (!dup) {
      var arr = isR ? retailItems : remedyItems, idk = isR ? 'pid' : 'productId';
      for (var di = 0; di < arr.length; di++) {
        if (String(arr[di][idk]) !== String(p.id)) continue;
        toast('"' + p.name + '" đã có trong tờ ghi — bấm sửa để đổi ' + (isR ? 'SL' : 'gram'), 'error');
        if (isR) { noteEditIdx = di; notePage = Math.floor(di / PAGE_SIZE) + 1; renderNote(); }
        else { remedyEditIdx = di; remedyNotePage = Math.floor(di / PAGE_SIZE) + 1; renderRemedyNote(); }
        var eq2 = $(isR ? '#noteEditQty' : '#remedyNoteEditQty');
        if (eq2) { focusNS(eq2); eq2.select(); noteTo(eq2.closest('tr')); }
        var s9 = $(isR ? '#retailSearch' : '#remedySearch');
        if (s9) s9.value = '';
        closeSuggest(key);
        return;
      }
    }
    if (dup) {
      toast('"' + p.name + '" đã có trong danh sách', 'error');
      var q0 = $(isR ? '.retail-qty' : '.remedy-qty', dup);
      if (q0) { focusNS(q0); if (q0.select) q0.select(); }
      var s0 = $(isR ? '#retailSearch' : '#remedySearch');
      if (s0) s0.value = '';
      closeSuggest(key);
      return;
    }
  }
  if (key === 'retail') {
    if (!commitRetailRow()) return;
    var row = addOrderRow('retail', p.id);
    var s1 = $('#retailSearch');
    if (s1) s1.value = '';
    if (isDesk()) notePage = 1e9; /* 2.29.0/2.39.6: tờ ghi cuộn tới dòng đang gõ; vẽ xong mới trỏ vào ô SL */
    renderNote();
    if (row) focusNS($('.retail-qty', row));
  } else if (key === 'remedy') {
    if (!commitRemedyRow()) return;
    var row2 = addOrderRow('remedy', p.id);
    if (row2) focusNS($('.remedy-qty', row2));
    var s2 = $('#remedySearch');
    if (s2) s2.value = '';
    if (isDesk()) remedyNotePage = 1e9; /* 2.26.0/2.39.6: tờ ghi cuộn tới dòng đang gõ (chỉ desktop) */
    calcRemedy();
  } else if (key === 'nhap') {
    nhapPick(p);
  } else if (key === 'inv') {
    $('#invSearch').value = p.name;
    invPage = 1;
    renderInventory();
  } else if (key === 'imph') {
    s9 = $('#impSearch');
    if (s9) s9.value = p.name;
    impPage = 1;
    renderHistory('imp');
  }
  closeSuggest(key);
}
function onSuggestKey(e, key){
  var cfg = SUG[key];
  if (!cfg) return;
  var list = $('#' + cfg.list);
  if (!list) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (list.hidden) { openSuggest(key); }
    var items = $$('.sug__item', list);
    if (!items.length) return;
    sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach(function(n, i){ n.setAttribute('aria-selected', i === sugIdx ? 'true' : 'false'); });
    sugReveal(list, items[sugIdx]);
  } else if (e.key === 'Enter') {
    var items2 = $$('.sug__item', list);
    if (list.hidden || !items2.length) return;
    var pick = null;
    if (sugIdx >= 0) pick = items2[sugIdx] || null;
    if (!pick) {
      var inp = $('#' + cfg.input);
      var raw = String(inp && inp.value || '').trim();
      var prods = raw ? matchProducts(raw) : [];
      var wantId = null;
      for (var pi = 0; pi < prods.length; pi++) {
        if (normSearch(prods[pi].name) === normSearch(raw)) { wantId = String(prods[pi].id); break; }
      }
      if (wantId === null && prods.length === 1) wantId = String(prods[0].id);
      if (wantId !== null) {
        for (var bi = 0; bi < items2.length; bi++) {
          if (items2[bi] && items2[bi].getAttribute && items2[bi].getAttribute('data-pid') === wantId) { pick = items2[bi]; break; }
        }
      }
    }
    if (pick) {
      e.preventDefault();
      pick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    }
  } else if (e.key === 'Escape') {
    closeSuggest(key);
  }
}
function initSuggest(){
  Object.keys(SUG).forEach(function(key){
    var cfg = SUG[key];
    var inp = $('#' + cfg.input);
    if (!inp) return;
    inp.addEventListener('input', function(){ openSuggest(key); });
    inp.addEventListener('keydown', function(e){ onSuggestKey(e, key); });
    inp.addEventListener('blur', function(){ setTimeout(function(){ closeSuggest(key); }, 140); });
  });
}
/* ================= NHẬP HÀNG ================= */
var nhapPid = null;
function findByName(name){
  var key = capWords(name).toLowerCase();
  if (!key) return null;
  for (var i = 0; i < db.products.length; i++) {
    if (capWords(db.products[i].name).toLowerCase() === key) return db.products[i];
  }
  return null;
}
function nhapPick(p){
  nhapPid = p.id;
  var inp = $('#nhapSearch');
  if (inp) inp.value = p.name;
  var price = $('#nhapPrice');
  var l = lastImport(p.id);
  var v = l ? l.price : num(p.costPrice);
  if (price) price.value = v > 0 ? kInput(v) : '';
  var hint = $('#nhapHint');
  if (hint) {
    if (v > 0) {
      var txt = 'Giá nhập gần nhất: ' + fmtUnitPrice(v);
      if (l && l.date) {
        txt += ' (ngày ' + dateVN(l.date) + (l.hasTime ? ' ' + timeVN(l.ts) : '') + ')';
      }
      hint.textContent = txt;
      hint.hidden = false;
    } else {
      hint.hidden = true;
      hint.textContent = '';
    }
  }
  calcNhap();
  nhapShowPend();
  var q = $('#nhapQty');
  if (q) { q.focus(); if (q.select) q.select(); }
}
function nhapNewProduct(name){
  var inp = $('#nhapSearch');
  if (inp) inp.value = capWords(name);
  nhapPid = null;
  var hint = $('#nhapHint');
  if (hint) {
    hint.textContent = 'Vị thuốc mới — sẽ được tạo khi lưu.';
    hint.hidden = false;
    if (!isDesk()) toast('Vị thuốc mới — sẽ được tạo khi lưu.');
  }
  closeSuggest('nhap');
  nhapShowPend();
  var q = $('#nhapQty');
  if (q) q.focus();
}
/* 2.29.0 desktop: tờ ghi nhảy tới trang chứa dòng đang gõ trước khi trỏ vào ô SL (dòng ẩn thì không trỏ được). */
function nhapShowPend(){ if (isDesk()) { renderNhapList(); noteTo($('#nhapPendingBody')); } }
function calcNhap(){
  var q = num(($('#nhapQty') || {}).value);
  var p = num(($('#nhapPrice') || {}).value);
  var out = $('#nhapTotal');
  if (out) out.textContent = fmtMoney(kToDong(q * p));
  var pn = $('#nhapPendName');
  if (pn) { var nm = String(($('#nhapSearch') || {}).value || '').trim(); pn.textContent = nm || 'Chọn vị thuốc ở ô trên'; pn.className = nm ? 'nhap-pend__name' : 'nhap-pend__name is-muted'; var hh = $('#nhapHint'); pn.title = hh && !hh.hidden ? hh.textContent : ''; }
}
var nhapList = [];
function nhapPriceOk(p, price){
  if (!p || !(price > 0)) return true;
  var l = lastImport(p.id);
  var ref = l ? l.price : 0;
  if (!(ref > 0)) return true;
  var ratio = price / ref;
  if (ratio <= 1.5 && ratio >= 0.5) return true;
  var pct = dec((ratio - 1) * 100);
  return confirm('Giá nhập "' + p.name + '" lần này là ' + fmtUnitPrice(price) + ', chênh ' + (pct > 0 ? '+' : '') + fmtNum(pct) + '% so với lần nhập gần nhất (' + fmtUnitPrice(ref) + ').\nBạn có chắc giá này đúng không?');
}
function renderNhapList(){
  var box = $('#nhapListBox');
  var tb = $('#nhapListBody');
  if (!box || !tb) return;
  tb.textContent = '';
  box.hidden = false;
  var pendTb = $('#nhapPendingBody');
  if (pendTb) renumber(pendTb, nhapList.length);
  var sum = 0;
  var dk = isDesk();
  if (dk) { orderEmpty(pendTb, 5, ''); calcNhap(); } /* 2.29.0: chữ mờ của dòng gõ trống */
  nhapList.forEach(function(it, i){
    sum += num(it.qty) * num(it.price);
    var tr = el('tr');
    tr.className = 'is-row';
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', it.name));
    var cq = el('td', 'num', fmtQty(it.qty));
    cq.setAttribute('data-label', 'SL');
    tr.appendChild(cq);
    var cp = el('td', 'num muted r', it.price > 0 ? fmtMoney(it.price) : '—');
    cp.setAttribute('data-label', 'Giá nhập');
    tr.appendChild(cp);
    var td = el('td', 'c-act');
    td.appendChild(rowMenu([
      { label: 'Xóa dòng', icon: 'trash', action: 'del-nhap-item', idx: i, danger: true }
    ], 'Thao tác với ' + it.name));
    tr.appendChild(td);
    tb.appendChild(tr);
  });
  var tot = $('#nhapListTotal');
  if (tot) tot.textContent = fmtMoney(sum);
  var tf = $('#nhapListFoot');
  if (tf) tf.hidden = !nhapList.length;
  var cnt = $('#nhapListCount');
  if (cnt) cnt.textContent = nhapList.length ? nhapList.length + ' vị' : '';
  var lbl = $('#nhapSaveLabel');
  if (lbl) lbl.textContent = dk ? 'Lưu đơn' : nhapList.length ? 'Lưu nhập hàng (' + nhapList.length + ')' : 'Lưu nhập hàng';
  var ft = $('#nhapFootTot');
  if (ft) ft.textContent = fmtMoney(sum);
}
function resetNhapInputs(){
  nhapPid = null;
  var inp = $('#nhapSearch');
  if (inp) inp.value = '';
  ['nhapQty', 'nhapPrice'].forEach(function(id){
    var n = $('#' + id);
    if (n) n.value = '';
  });
  var hint = $('#nhapHint');
  if (hint) { hint.hidden = true; hint.textContent = ''; }
  calcNhap();
  refreshAllQtyHints();
}
function addNhapItem(){
  var inp = $('#nhapSearch');
  var name = capWords((inp || {}).value);
  var qty = num(($('#nhapQty') || {}).value);
  var price = kToDong(($('#nhapPrice') || {}).value);
  if (!name) { toast('Nhập tên vị thuốc', 'error'); if (inp) inp.focus(); return; }
  if (qty <= 0) { toast('Nhập số lượng lớn hơn 0', 'error'); var q = $('#nhapQty'); if (q) q.focus(); return; }
  if (price < 0) { toast('Giá nhập không được âm', 'error'); var pNeg = $('#nhapPrice'); if (pNeg) { pNeg.focus(); pNeg.select(); } return; }
  var limN = checkLimits('q', qty) || checkLimits('money', price) || checkLimits('name', name);
  if (limN) {
    toast(limN, 'error');
    var fN = checkLimits('q', qty) ? $('#nhapQty') : (checkLimits('money', price) ? $('#nhapPrice') : inp);
    if (fN) fN.focus();
    return;
  }
  var p = nhapPid ? findProduct(nhapPid) : findByName(name);
  if (!nhapPriceOk(p, price)) { var pi = $('#nhapPrice'); if (pi) { pi.focus(); pi.select(); } return; }
  nhapList.push({ pid: p ? p.id : null, name: p ? p.name : name, qty: dec(qty), price: price });
  resetNhapInputs();
  renderNhapList();
  noteTo($('#nhapPendingBody'));
  closeSuggest('nhap');
  if (inp) inp.focus();
}
/* N1: lỗi trần của dòng trong tờ ghi: giữ con trỏ ở ô số lượng (không có ô nào của dòng để trỏ tới). */
function nhapFocusQty(){ var q = $('#nhapQty'); if (q) q.focus(); }
function saveNhap(e){
  if (e) e.preventDefault();
  var date = todayISO();
  var entries = nhapList.slice();
  var name = capWords(($('#nhapSearch') || {}).value);
  if (name) {
    var qty = num(($('#nhapQty') || {}).value);
    var price = kToDong(($('#nhapPrice') || {}).value);
    if (price < 0) { toast('Giá nhập không được âm', 'error'); var pn = $('#nhapPrice'); if (pn) { pn.focus(); pn.select(); } return; }
    var cp = nhapPid ? findProduct(nhapPid) : findByName(name);
    if (!(qty > 0)) {
      toast('Dòng "' + name + '" thiếu số lượng', 'error');
      var q0 = $('#nhapQty'); if (q0) q0.focus();
      return;
    }
    var lim2 = checkLimits('q', qty) || checkLimits('money', price);
    if (lim2) {
      toast(lim2, 'error');
      var bad2 = checkLimits('q', qty) ? $('#nhapQty') : $('#nhapPrice'); if (bad2) { bad2.focus(); if (bad2.select) bad2.select(); }
      return;
    }
    if (!nhapPriceOk(cp, price)) { var pi2 = $('#nhapPrice'); if (pi2) { pi2.focus(); pi2.select(); } return; }
    entries.push({ pid: cp ? cp.id : null, name: name, qty: dec(qty), price: price });
  }
  if (!entries.length) { toast('Nhập tên vị thuốc', 'error'); var i0 = $('#nhapSearch'); if (i0) i0.focus(); return; }
  /* Lưới an toàn ở chỗ ghi tồn/tiền: dòng gõ dở và nhapList đã được kiểm, giữ phòng đường nhập mới. */
  for (var ei = 0; ei < entries.length; ei++) {
    if (entries[ei].qty < 0) { toast('Số lượng không được âm', 'error'); return; }
    if (entries[ei].price < 0) { toast('Giá nhập không được âm', 'error'); return; }
    var limE = checkLimits('q', entries[ei].qty) || checkLimits('money', entries[ei].price) || checkLimits('name', entries[ei].name);
    if (limE) { toast(limE, 'error'); nhapFocusQty(); return; }
  }
  /* Kiểm trần sau khi cộng dồn (theo vị, kể cả trùng trong nhapList), trước mọi ghi db. */
  var simStock = {}, limSum = null;
  for (var si = 0; si < entries.length && !limSum; si++) {
    var sp = entries[si].pid ? findProduct(entries[si].pid) : findByName(entries[si].name);
    var sk = sp ? 'id:' + sp.id : 'new:' + capWords(entries[si].name).toLowerCase();
    simStock[sk] = (sk in simStock ? simStock[sk] : (sp ? num(sp.stock) : 0)) + entries[si].qty;
    limSum = checkLimits('q', simStock[sk]) || checkLimits('money', money(entries[si].qty * entries[si].price));
  }
  if (limSum) { toast(limSum, 'error'); nhapFocusQty(); return; }

  var savedN = 0;
  var batchId = uid('IM');
  var ts = Date.now();
  entries.forEach(function(it){
    var p = it.pid ? findProduct(it.pid) : null;
    if (!p) p = findByName(it.name);
    if (!p) {
      p = { id: uid('PROD'), name: it.name, stock: 0, costPrice: money(it.price) };
      db.products.push(p);
    }
    if (it.qty > 0) {
      p.stock = dec(num(p.stock) + it.qty);
      if (it.price > 0) p.costPrice = money(it.price);
      db.transactions.push({
        id: uid('TX'), date: date, type: 'NHAP', productId: p.id,
        qty: dec(it.qty), price: money(it.price), total: money(it.qty * it.price), cost: null,
        oid: batchId, ts: ts
      });
      savedN++;
    }
  });

  if (savedN > 0) {
    impPage = 1;
    var _is = $('#impSearch'); if (_is) _is.value = '';
  }
  nhapList = [];
  resetNhapInputs();
  renderNhapList();
  commit(savedN === 0 ? 'Đã tạo vị thuốc' : savedN > 1 ? 'Đã lưu nhập ' + savedN + ' vị thuốc' : 'Đã lưu nhập hàng');
  refreshAllQtyHints();
  afterSaveDone();
}

/* ================= SẢN PHẨM ================= */
function dupName(name, excludeId){
  var key = capWords(name).toLowerCase();
  if (!key) return null;
  for (var i = 0; i < db.products.length; i++) {
    var p = db.products[i];
    if (String(p.id) === String(excludeId || '')) continue;
    if (capWords(p.name).toLowerCase() === key) return p;
  }
  return null;
}
function openEdit(id){
  var p = findProduct(id);
  if (!p) return;
  $('#editId').value = p.id;
  $('#editName').value = p.name;
  $('#editPrice').value = kInput(p.costPrice);
  var d = $('#editDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function saveEdit(){
  var id = $('#editId').value;
  var name = capWords($('#editName').value);
  var price = kToDong($('#editPrice').value);
  if (!name) { toast('Tên vị thuốc không được để trống', 'error'); return; }
  if (price < 0) { toast('Giá nhập không được âm', 'error'); var ep = $('#editPrice'); if (ep) { ep.focus(); ep.select(); } return; }
  var limEd = checkLimits('name', name) || checkLimits('money', price);
  if (limEd) { toast(limEd, 'error'); return; }
  var p = findProduct(id);
  if (!p) { toast('Không tìm thấy vị thuốc', 'error'); return; }
  var d = dupName(name, id);
  if (d) { toast('Đã có "' + d.name + '" trong kho', 'error'); return; }
  p.name = name;
  p.costPrice = price; /* price đã là đồng nguyên (kToDong) */
  closeEdit();
  commit('Đã cập nhật vị thuốc');
}
function closeEdit(){
  var d = $('#editDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
}
function delProduct(id){
  var p = findProduct(id);
  if (!p) return;
  /* AC: giao dịch/đơn thuốc chỉ lưu productId, xóa vị còn dùng sẽ làm lịch sử hiện "Đã xóa": chỉ xóa vị trống (hết tồn, không giao dịch, không nằm trong đơn thuốc). */
  var sid = String(id);
  var used = num(p.stock) > 0 || db.transactions.some(function(t){ return String(t.productId) === sid; }) ||
    (db.prescriptions || []).some(function(r){ return (r.items || []).some(function(it){ return String(it.productId) === sid; }); });
  if (used) { toast('Vị này còn tồn, đã có giao dịch hoặc nằm trong đơn thuốc, không xóa được.', 'error'); return; }
  if (!confirm('Xóa "' + p.name + '" khỏi kho?')) return;
  db.products = db.products.filter(function(x){ return String(x.id) !== String(id); });
  commit('Đã xóa vị thuốc');
}
/* Giữ nguyên số khách đã trả, ghi lại vốn và thành tiền mọi vị trong đơn. */
/* Vốn từng dòng đã lưu lúc bán là vốn lịch sử: không tính lại theo giá nhập hiện tại.
   Chỉ dòng cũ chưa có cost mới fallback về giá nhập hiện tại. */
function remedyLineCost(t){
  if (t.cost != null && isFinite(Number(t.cost))) return money(t.cost);
  var prod = findProduct(t.productId);
  return money(num(t.qty) * (prod ? num(prod.costPrice) : 0));
}
/* Vốn mới của dòng bị sửa gram: co giãn theo vốn lịch sử của chính dòng đó. */
function scaledRemedyCost(t, prevQty, prevCost){
  var nq = num(t.qty);
  if (prevCost != null && num(prevQty) > 0) { /* vốn 0 là vốn thật; chỉ prevCost null mới lấy giá nhập hiện tại */
    return money(num(prevCost) * nq / num(prevQty));
  }
  var prod = findProduct(t.productId);
  return money(nq * (prod ? num(prod.costPrice) : 0));
}
/* Chia lại tiền khách trả cho các dòng cùng đơn: dùng chung balanceRemedyMoney (một chỗ duy nhất chia lãi đều). Giữ nguyên vốn đã lưu của từng dòng,
   chỉ chia lại phần lãi đều. Trả false (không đổi gì) khi giá bán thấp hơn tổng vốn. */
function applyRemedyBalance(lines, grand){
  var bal = balanceRemedyMoney(grand, lines.map(function(t){ return { exactCost: remedyLineCost(t) }; }));
  if (!bal) return false;
  var costs = bal.map(function(b){ return b.cost; }), totals = bal.map(function(b){ return b.total; });
  var unitPrice = 0;
  lines.forEach(function(t){ if (num(t.unitPrice) > 0) unitPrice = money(t.unitPrice); });
  lines.forEach(function(t, i){
    var kg = num(t.qty);
    t.cost = costs[i];
    t.total = totals[i];
    t.price = kg > 0 ? money(totals[i] / kg) : 0;
    if (unitPrice > 0) t.unitPrice = unitPrice;
  });
  return true;
}
function remedyMates(t){
  if (!t || !t.rx || !t.oid) return [];
  return db.transactions.filter(function(x){
    return x.rx && x.oid && String(x.oid) === String(t.oid);
  });
}
/* Chỉ gọi khi lần nhập bị xóa LÀ lastImport (tính TRƯỚC khi xóa): giá vốn theo lần nhập
   có giá còn lại gần nhất theo lastImport (theo ngày, hòa thì theo ts), cùng tiêu chí với
   saveTxEdit và refPrice. Xóa lần nhập cũ hơn thì giá vốn sửa tay được giữ nguyên.
   Không còn lần nhập có giá thì giữ nguyên. */
function resetCostFromImports(p){
  if (!p) return;
  var l = lastImport(p.id);
  if (l) p.costPrice = money(l.price);
}
function delTx(id){
  var t = null, pos = -1;
  for (var i = 0; i < db.transactions.length; i++) if (db.transactions[i].id === id) { t = db.transactions[i]; pos = i; break; }
  if (!t) return;
  if (t.open) { toast(OPEN_LOCK_MSG, 'error'); return; }
  var mates = remedyMates(t).filter(function(x){ return x.id !== t.id; });
  var msg = mates.length
    ? 'Xóa vị này khỏi đơn thuốc? Tồn kho hoàn lại. Tiền khách trả giữ nguyên và chia lại cho các vị còn lại.'
    : 'Xóa giao dịch này? Tồn kho sẽ được điều chỉnh lại.';
  var p = findProduct(t.productId);
  if (p && t.type === 'NHAP' && num(p.stock) - num(t.qty) < -1e-9) {
    toast('Không thể xóa: "' + p.name + '" đã bán, tồn sẽ âm. Hãy sửa/xóa đơn bán liên quan trước.', 'error');
    return;
  }
  if (!confirm(msg)) return;
  var grand = num(t.total);
  mates.forEach(function(x){ grand += num(x.total); });
  if (p) {
    if (t.type === 'NHAP') p.stock = dec(p.stock - num(t.qty));
    else p.stock = dec(p.stock + num(t.qty));
  }
  var wasLast = false;
  if (t.type === 'NHAP') {
    var lt = lastImport(t.productId);
    wasLast = !!lt && String(lt.id) === String(t.id);
  }
  db.transactions = db.transactions.filter(function(x){ return x.id !== id; });
  if (mates.length && !applyRemedyBalance(mates, grand)) {
    db.transactions.splice(pos, 0, t);
    if (p) p.stock = dec(num(p.stock) + (t.type === 'NHAP' ? num(t.qty) : -num(t.qty)));
    toast('Giá bán thấp hơn vốn của đơn', 'error');
    return;
  }
  if (p && t.type === 'NHAP' && wasLast) resetCostFromImports(p);
  commit(mates.length ? 'Đã xóa vị và chia lại đơn thuốc' : 'Đã xóa giao dịch');
}
/* ================= SỬA GIAO DỊCH ================= */
var txEditCur = null;
function findTx(id){
  for (var i = 0; i < db.transactions.length; i++) {
    if (db.transactions[i].id === id) return db.transactions[i];
  }
  return null;
}
function delOrder(oid){
  if (!oid) return; /* oid rỗng: String(undefined) khớp mọi giao dịch không có oid */
  var items = db.transactions.filter(function(x){ return String(x.oid) === String(oid); });
  if (!items.length) return;
  var label = (items[0].oname && items[0].oname !== items[0].oid) ? items[0].oname : (items[0].type === 'NHAP'
    ? 'đơn nhập ngày ' + dateVN(items[0].date)
    : 'đơn');
  /* Kiểm tra trước toàn bộ đơn nhập: không được để tồn âm. */
  var needOut = Object.create(null);
  for (var i = 0; i < items.length; i++) {
    var t0 = items[i];
    if (t0.type !== 'NHAP') continue;
    var k0 = String(t0.productId);
    needOut[k0] = (needOut[k0] || 0) + num(t0.qty);
  }
  for (var k1 in needOut) {
    var p0 = findProduct(k1);
    if (p0 && num(p0.stock) - needOut[k1] < -1e-9) {
      toast('Không thể xóa: "' + p0.name + '" đã bán, tồn sẽ âm. Hãy sửa/xóa đơn bán liên quan trước.', 'error');
      return;
    }
  }
  if (!confirm('Xóa cả ' + label + '? Tồn kho sẽ được điều chỉnh lại.')) return;
  items.forEach(function(t){
    var p = findProduct(t.productId);
    if (!p) return;
    /* Nhập: xóa đơn phải trừ tồn lại; Bán: cộng tồn lại */
    if (t.type === 'NHAP') p.stock = dec(p.stock - num(t.qty));
    else p.stock = dec(p.stock + num(t.qty));
  });
  /* Chỉ đặt lại giá vốn cho vị có lần nhập bị xóa LÀ lastImport (tính trước khi xóa). */
  var resetPids = [];
  items.forEach(function(t){
    if (t.type !== 'NHAP') return;
    var lt = lastImport(t.productId);
    if (!lt) return;
    if (!items.some(function(x){ return x.type === 'NHAP' && String(x.id) === String(lt.id); })) return;
    if (resetPids.indexOf(String(t.productId)) < 0) resetPids.push(String(t.productId));
  });
  db.transactions = db.transactions.filter(function(x){ return String(x.oid) !== String(oid); });
  resetPids.forEach(function(pid){ resetCostFromImports(findProduct(pid)); });
  commit('Đã xóa đơn');
}
function txEditKg(t, qRaw){
  if (!t || !t.rx) return dec(qRaw);
  var thang = num(t.thang) > 0 ? num(t.thang) : 1;
  return dec(qRaw / 1000 * thang);
}
var OPEN_LOCK_MSG = 'Dòng tồn đầu kỳ (sổ đã chốt) không sửa hay xóa được';
function openTxEdit(id){
  if (db.transactions.some(function(t){ return t.id === id && t.open; })) { toast(OPEN_LOCK_MSG, 'error'); return; }
  var t = findTx(id);
  if (!t) return;
  txEditCur = t;
  var p = findProduct(t.productId);
  $('#txEditName').value = p ? p.name : 'Đã xóa';
  var isRx = !!t.rx;
  var lbl = $('#txEditQtyLbl');
  if (lbl) lbl.textContent = isRx ? 'Số gram (mỗi thang)' : 'Số lượng (kg)';
  var priceField = $('#txEditPriceField');
  if (priceField) priceField.hidden = isRx;
  $('#txEditQty').value = String(isRx ? (num(t.g) > 0 ? num(t.g) : dec(num(t.qty) * 1000 / (num(t.thang) > 0 ? num(t.thang) : 1))) : dec(t.qty));
  if ($('#txEditQty').qtyHintRefresh) $('#txEditQty').qtyHintRefresh();
  $('#txEditPrice').value = kInput(t.price);
  var meta = $('#txEditMeta');
  if (meta) meta.textContent = (t.rx ? 'Đơn thuốc chén · giá khách trả giữ nguyên' : t.type === 'NHAP' ? 'Nhập hàng' : 'Bán hàng') + ' · ngày ' +
    dateVN(t.date) + (txHasTime(t) ? ' ' + timeVN(txStamp(t)) : '');
  calcTxEdit();
  var d = $('#txDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function calcTxEdit(){
  var out = $('#txEditTotal');
  if (txEditCur && txEditCur.rx) {
    var grand = 0;
    remedyMates(txEditCur).forEach(function(x){ grand += num(x.total); });
    if (!grand) grand = num(txEditCur.total);
    if (out) out.textContent = fmtMoney(grand);
    return;
  }
  var q = num(($('#txEditQty') || {}).value);
  var p = num(($('#txEditPrice') || {}).value);
  if (out) out.textContent = fmtMoney(kToDong(txEditKg(txEditCur, q) * p));
}
function closeTxEdit(){
  var d = $('#txDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
  txEditCur = null;
}
function saveTxEdit(){
  var t = txEditCur;
  if (!t) return;
  var qRaw = num($('#txEditQty').value);
  var price = kToDong($('#txEditPrice').value);
  if (qRaw <= 0) { toast('Số lượng phải lớn hơn 0', 'error'); return; }
  var isRx = !!t.rx;
  var q = txEditKg(t, qRaw);
  var limTx = checkLimits('q', q) || checkLimits('money', price) || (!isRx && checkLimits('money', money(q * price)));
  if (limTx) {
    toast(limTx, 'error');
    var ep = $(checkLimits('q', q) ? '#txEditQty' : '#txEditPrice'); if (ep) ep.focus();
    return;
  }
  if (t.type === 'BAN' && !isRx) {
    if (!(price > 0)) { toast('Nhập thành tiền lớn hơn 0', 'error'); var epz = $('#txEditPrice'); if (epz) epz.focus(); return; }
    if (!confirmBelowImport(t.productId, 1, $('#txEditPrice').value)) return;
  }

  var p = findProduct(t.productId);
  var oldQty = num(t.qty);
  var oldCost = t.cost != null ? num(t.cost) : null; /* cost 0 là vốn thật; chỉ cost null mới lấy giá nhập hiện tại */
  var delta = dec(q - oldQty);
  if (p) {
    if (t.type === 'NHAP') {
      if (num(p.stock) + delta < -1e-9) {
        toast('Tồn "' + p.name + '" không đủ để giảm (còn ' + fmtQty(p.stock) + ')', 'error');
        return;
      }
      var limSt = checkLimits('q', num(p.stock) + delta);
      if (limSt) { toast(limSt, 'error'); return; }
      p.stock = dec(num(p.stock) + delta);
      var latest = lastImport(t.productId);
      if (price > 0 && latest && String(latest.id) === String(t.id)) p.costPrice = money(price);
    } else {
      if (num(p.stock) + 1e-9 < delta) {
        toast('Tồn "' + p.name + '" không đủ (còn ' + fmtQty(p.stock) + ')', 'error');
        return;
      }
      p.stock = dec(num(p.stock) - delta);
    }
  }
  if (isRx) {
    var lines = remedyMates(t);
    if (!lines.length) lines = [t];
    var grand = 0;
    lines.forEach(function(x){ grand += num(x.total); });
    var prevQty = t.qty;
    var prevG = t.g;
    var prevCost = t.cost;
    t.qty = dec(q);
    t.g = dec(qRaw);
    t.cost = scaledRemedyCost(t, prevQty, prevCost);
    if (!applyRemedyBalance(lines, grand)) {
      t.qty = prevQty;
      t.g = prevG;
      t.cost = prevCost;
      if (p) p.stock = dec(num(p.stock) + (t.type === 'NHAP' ? -delta : delta));
      toast('Giá bán thấp hơn vốn của đơn', 'error');
      return;
    }
    closeTxEdit();
    commit('Đã cập nhật đơn thuốc');
    return;
  }
  /* Giữ giá vốn lịch sử: nhân theo đơn giá vốn cũ của chính giao dịch,
     chỉ fallback về giá hiện tại khi giao dịch cũ không có cost. */
  var oldUnitCost = oldQty > 0 && oldCost != null ? dec(oldCost / oldQty) : (p ? num(p.costPrice) : 0);
  t.qty = dec(q);
  t.price = money(price);
  t.total = money(q * price);
  if (t.type === 'BAN') t.cost = money(q * oldUnitCost);
  closeTxEdit();
  commit('Đã cập nhật giao dịch');
}
/* ==== Đồng bộ: gọi thẳng API, cookie thiết bị do trình duyệt tự gửi ==== */
function apiFetch(url, opts){
  var o = {};
  var src = opts || {};
  for (var k in src) o[k] = src[k];
  var h = {};
  var sh = src.headers || {};
  for (var k2 in sh) h[k2] = sh[k2];
  o.headers = h;
  o.cache = 'no-store';
  var ac = new AbortController();
  o.signal = ac.signal;
  var tm = setTimeout(function(){ ac.abort(); }, 15000);
  /* Timer chạy tới khi đọc xong thân: json()/text() treo cũng bị ngắt sau 15 giây. */
  return fetch(url, o).then(function(r){
    var j = r && r.json, t = r && r.text;
    if (typeof j !== 'function' && typeof t !== 'function') { clearTimeout(tm); return r; }
    var done = function(v){ clearTimeout(tm); return v; };
    var fail = function(e){ clearTimeout(tm); throw e; };
    if (typeof j === 'function') r.json = function(){ return j.call(r).then(done, fail); };
    if (typeof t === 'function') r.text = function(){ return t.call(r).then(done, fail); };
    return r;
  }, function(e){ clearTimeout(tm); throw e; });
}
/* ================= ĐỒNG BỘ ================= */
function cloudConflict(){
  if (conflictOpen) return Promise.resolve(false);
  conflictOpen = true;
  var inMemory = !!(retailItems.length || remedyItems.length || nhapList.length || txEditCur);
  var LF = String.fromCharCode(10);
  var msg = 'Dữ liệu trên một thiết bị khác đã thay đổi sau lần bạn mở trang này.' + LF + LF +
    'OK: tải bản mới nhất về (thay đổi chưa lưu của máy này sẽ mất).' + LF +
    'Hủy: giữ bản trên máy này và ghi đè lên máy chủ.';
  if (inMemory) msg += LF + LF + 'Các dòng đang soạn trong bộ nhớ cũng sẽ bị xóa.';
  var useLatest = confirm(msg);
  if (useLatest) {
    /* 2.37.1: giữ conflictOpen tới khi pullState xong (kể cả lỗi) để poll/retry không gửi PUT thứ hai và hiện hộp lần 2. */
    if (!downloadBackup(false, 'kho-nhap-xung-dot-' + backupStamp() + '.json', true)) {
      conflictOpen = false;
      toast('Không tải được bản nháp — đã hủy tải bản máy chủ', 'error');
      return Promise.resolve(false);
    }
    return pullState(true).then(function(ok){
      conflictOpen = false;
      if (ok) {
        if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
        syncRetryDelay = DIRTY_BADGE_MS;
        dirtySince = 0;
        syncErrorShown = false;
        syncDetail = '';
        syncRejected = false;
        renderSyncBadge();
        resetDrafts();
      } else scheduleSyncRetry(); /* 2.37.2: pull lỗi (mạng) thì dirty vẫn bật: hẹn thử lại */
      return false;
    });
  }
  conflictOpen = false;
  return pushState(true, true);
}
function syncFailText(d, fallback){
  var lines = [];
  if (d && d.error) lines.push(String(d.error));
  if (d && Array.isArray(d.details)) {
    for (var i = 0; i < d.details.length && lines.length < 21; i++) lines.push(String(d.details[i]));
  }
  return lines.length ? lines.join('\n') : fallback;
}
/* Một lần mỗi phiên. Đọc stockDrift, không đọc câu warnings.
   Tối đa 3 tên, phần còn lại ghi “và N vị khác”. */
var stockWarnShown = false;
var stockWarnText = '';
function noteStockWarnings(list){
  if (stockWarnShown || !list || !list.length) return;
  var names = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i] && list[i].name) names.push(String(list[i].name));
  }
  if (!names.length) return;
  stockWarnShown = true;
  var shown = names.slice(0, 3);
  var extra = names.length - shown.length;
  stockWarnText = 'Tồn lệch so với lịch sử nhập − bán: ' + shown.join(', ');
  if (extra > 0) stockWarnText += ' và ' + extra + ' vị khác';
  stockWarnText += '.';
  toast(stockWarnText, 'error');
}
var pendingOpSig = '', pendingOpId = '';
/* AA: trần thân PUT của server là 32 MB sau giải nén (tính theo byte UTF-8, utf8Bytes); cảnh báo ở 75% = 24 MB, một lần mỗi lần vượt; xuống dưới ngưỡng thì cho cảnh báo lại. */
var MAX_STATE_BYTES = 32 * 1024 * 1024, BIG_STATE_BYTES = 24 * 1024 * 1024, bigStateWarned = false;
function warnBigState(body){
  var n = utf8Bytes(body);
  if (n <= BIG_STATE_BYTES) { bigStateWarned = false; return; }
  if (bigStateWarned) return;
  bigStateWarned = true;
  toast('Dữ liệu sắp đầy (' + (n / 1048576).toFixed(1).replace('.', ',') + ' / 32 MB): hãy sao lưu và dọn bớt giao dịch cũ', 'error');
}
/* AA: gửi nén. CompressionStream (Safari >= 16.4, WebView2) có thì nén gzip và gửi Content-Encoding: gzip (server inflate, trần 32 MB tính sau giải nén); không có thì gửi thường như cũ. Trả null (đồng bộ) nếu không nén được. */
function gzipText(text){
  if (typeof CompressionStream !== 'function' || typeof Blob !== 'function' || typeof Response !== 'function') return null;
  try {
    return new Response(new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer()
      .then(function(buf){ return new Uint8Array(buf); }, function(){ return null; });
  } catch (e) { return null; }
}
function sendStateBody(headers, body){
  var gz = gzipText(body);
  if (!gz) return apiFetch('/api/state', { method: 'PUT', headers: headers, body: body });
  return gz.then(function(buf){
    if (!buf) return apiFetch('/api/state', { method: 'PUT', headers: headers, body: body });
    headers['Content-Encoding'] = 'gzip';
    return apiFetch('/api/state', { method: 'PUT', headers: headers, body: buf });
  });
}
function pushState(manual, force){
  if (pushing || conflictOpen) return Promise.resolve(false);
  if (serverRejected && !force) {
    noteSyncFailure('Bản trên máy chủ có dòng không hợp lệ nên chưa gửi thay đổi lên (tránh xóa dữ liệu trên máy chủ). Thay đổi vẫn giữ trên máy; hãy xuất sao lưu, báo người quản trị và tải lại trang sau khi đã sửa.', false, false);
    return Promise.resolve(false);
  }
  pushing = true;
  touch();
  renderSyncBadge();
  var sent = num(db.updatedAt);
  /* opId theo nội dung (bỏ updatedAt, vì touch() đổi mỗi lần): thử lại cùng snapshot giữ nguyên. */
  /* Serialize db đúng 1 lần: phần "core" (không có updatedAt) vừa là opSig vừa là thân PUT sau khi nối updatedAt. */
  var rest = Object.assign({}, db); delete rest.updatedAt;
  var opSig = JSON.stringify(rest);
  var body = db.updatedAt === undefined ? opSig : opSig.slice(0, -1) + (opSig.length > 2 ? ',' : '') + '"updatedAt":' + JSON.stringify(db.updatedAt) + '}';
  if (opSig !== pendingOpSig) { pendingOpSig = opSig; pendingOpId = uid('OP'); }
  warnBigState(body);
  var headers = { 'Content-Type': 'application/json', 'X-Base-Updated': String(cloudBase), 'X-Op-Id': pendingOpId };
  if (force) headers['X-Force'] = '1';
  return sendStateBody(headers, body).then(function(r){
    if (!r) return { status: 0, d: null };
    return r.json().then(function(d){
      return { status: r.status || 0, d: d };
    }, function(){
      return { status: r.status || 0, d: null };
    });
  }).then(function(pack){
    var d = pack.d;
    var status = pack.status;
    if (((d && d.conflict) || status === 409) && !(d && d.closed)) { /* 2.40.0: 409 "sổ đã chốt" đi nhánh từ chối bên dưới (Ghi đè cũng bị chặn) */
      if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
      pushing = false;
      return cloudConflict();
    }
    var ok = !!(d && d.success);
    if (ok) {
      authLost = false;
      pendingOpSig = '';
      cloudBase = num(d.updatedAt) || sent;
      if (num(db.updatedAt) === sent) {
        db.updatedAt = cloudBase;
        dirty = false;
      } else {
        /* Có thay đổi mới trong lúc đang gửi: giữ dirty và gửi tiếp. */
        dirty = true;
        setTimeout(function(){ pushState(false); }, 0);
      }
      syncErrorShown = false;
      syncDetail = '';
      syncRejected = false;
      syncRetryDelay = DIRTY_BADGE_MS;
      if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
      lastSyncOk = lastFresh = Date.now();
      saveLocal();
      renderSyncBadge();
      noteStockWarnings(d && d.stockDrift);
      try { refreshUnread(); } catch (e) {} /* nền, không await, lỗi nào cũng không đổi kết quả PUT */
      if (manual) toast('Đã lưu dữ liệu');
    } else if (status === 401) {
      /* Thiết bị chưa được duyệt hoặc đã bị thu hồi: giữ nguyên nháp, không thử lại, không cho bỏ nháp. */
      noteAuthLost();
    } else {
      var rejected = status >= 400 && status < 500;
      noteSyncFailure(syncFailText(d, 'Chưa lưu được lên máy chủ — dữ liệu vẫn giữ trên máy này'), !rejected);
      if (rejected) {
        /* 2.15.16: 400/428 máy chủ từ chối đúng dữ liệu này: báo một lần ngay, không chỉ nằm trong huy hiệu. */
        var why = d && d.error ? String(d.error) : 'Máy chủ từ chối lưu';
        if (why.length > 120) why = why.slice(0, 117) + '...';
        toast('Chưa lưu được: ' + why, 'error');
      }
    }
    return ok;
  }).catch(function(e){
    noteSyncFailure(e && e.name === 'AbortError' ? 'Máy chủ không phản hồi sau 15 giây — dữ liệu vẫn giữ trên máy này.' : 'Mất kết nối — dữ liệu vẫn giữ trên máy này.', true, true);
    return false;
  }).then(function(ok){
    pushing = false;
    return ok;
  });
}
/* Z.2 (P2-6): bản máy chủ mà sanitize phải BỎ dòng (drops > 0) thì KHÔNG áp dụng, KHÔNG push: nếu áp rồi thì lần ghi sau sẽ xóa các dòng đó trên máy chủ. Giữ nguyên dữ liệu trên máy, toast cảnh báo (một lần mỗi số dòng) + console.warn. Trả { ok, state, bad }. */
var serverDropWarned = -1, serverRejected = false;
/* R1: khi bản máy chủ bị từ chối (serverRejected) thì pushState (không X-Force) KHÔNG gửi: gửi sẽ 409 lặp hoặc, nếu đè, xóa các dòng đó trên máy chủ. Thay đổi giữ trên máy; tải lại trang (init) kiểm lại. */
function checkServerData(raw, where){
  if (isLegacyMoney(raw)) {
    serverRejected = true;
    if (window.console && console.warn) console.warn('[sync] ' + where + ': ' + LEGACY_MONEY_MSG);
    toast(LEGACY_MONEY_MSG, 'error');
    return { ok: false, state: null, bad: true };
  }
  var drops = [];
  var st = sanitize(raw, drops);
  serverRejected = drops.length > 0;
  if (!drops.length) return { ok: true, state: st, bad: false };
  if (window.console && console.warn) console.warn('[sync] ' + where + ': bản máy chủ bị bỏ ' + drops.length + ' dòng, không áp dụng', drops.slice(0, 8));
  if (serverDropWarned !== drops.length) {
    serverDropWarned = drops.length;
    toast('Dữ liệu trên máy chủ có ' + drops.length + ' dòng không hợp lệ nên chưa tải về; dữ liệu trên máy được giữ nguyên. Hãy xuất sao lưu rồi báo người quản trị.', 'error');
  }
  return { ok: false, state: null, bad: true };
}
function pullState(manual){
  var wasDirty = dirty; /* 2.37.1: dirty bật SAU khi gửi GET = người dùng vừa ghi, không được đè */
  return apiFetch('/api/state?t=' + Date.now())
    .then(function(r){
      if (r && r.status === 401) { noteAuthLost(); return null; }
      return r ? r.json() : null;
    })
    .then(function(d){
      var chk = d && d.success ? checkServerData(d.data, 'pullState') : null;
      var server = chk && chk.ok ? chk.state : null;
      if (!server) {
        if (manual && !authLost && !(chk && chk.bad)) toast('Không tải được dữ liệu', 'error');
        return false;
      }
      authLost = false;
      lastSyncOk = Date.now();
      renderSyncLine();
      if (!wasDirty && dirty) return true; /* giữ db và cloudBase: PUT của bản vừa ghi gặp 409 nếu máy khác đã đổi (luồng xung đột bình thường) */
      cloudBase = num(server.updatedAt);
      /* Luôn thay db bằng bản máy chủ (cả ba chỗ gọi đều là chủ động bỏ nháp/khởi động); không bao giờ gửi PUT ở đây. */
      db = server;
      dirty = false;
      lastFresh = Date.now();
      saveLocal();
      renderAll();
      if (manual) toast('Đã tải dữ liệu mới nhất');
      return true;
    })
    .catch(function(e){ if (manual) toast(e && e.name === 'AbortError' ? 'Máy chủ không phản hồi sau 15 giây' : 'Không tải được dữ liệu', 'error'); return false; });
}
/* Tự làm mới: chỉ tải khi server có bản mới hơn và máy không có thay đổi
   chưa gửi. Không hiện toast, không render nếu dữ liệu không đổi. */
var refreshing = false;
/* Đang gõ trong ô nhập hoặc đang mở hộp thoại sửa: tạm hoãn để không
   làm mất nội dung người dùng đang nhập. Sẽ tự làm mới ở nhịp sau. */
function busyEditing(){
  var ae = doc.activeElement;
  if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(String(ae.tagName || ''))) return true;
  var dlgs = doc.querySelectorAll ? doc.querySelectorAll('dialog[open]') : null;
  if (dlgs && dlgs.length) return true;
  if (retailItems && retailItems.length) return true;
  if (remedyItems && remedyItems.length) return true;
  if (nhapList && nhapList.length) return true;
  return false;
}
/* 2.39.10: chỉ hoãn ÁP khi đang mở hộp thoại (sửa giao dịch…). Đơn đang soạn và ô đang gõ không còn chặn: renderAll không vẽ lại tờ ghi/ô nhập.
   Trước đây busyEditing() chặn cả lần TẢI → Tauri có đơn soạn dở/ô tên đang focus thì không pull hàng giờ, lưu xong mới gặp 409. */
function dialogOpen(){
  var d = doc.querySelectorAll ? doc.querySelectorAll('dialog[open]') : null;
  return !!(d && d.length) || !!txEditCur;
}
function fetchServer(where){
  return apiFetch('/api/state?t=' + Date.now())
    .then(function(r){
      if (r && r.status === 401) { noteAuthLost(); return null; }
      return r ? r.json() : null;
    })
    .then(function(d){
      var chk = d && d.success ? checkServerData(d.data, where) : null;
      return chk && chk.ok ? chk.state : null;
    });
}
/* Áp bản hub khi máy này không có thay đổi chưa gửi. Trả true nếu đã thay db. */
function takeServer(server, quiet){
  if (!server || dirty || conflictOpen) return false;
  lastSyncOk = lastFresh = Date.now();
  var newer = num(server.updatedAt) > num(cloudBase);
  if (newer) {
    cloudBase = num(server.updatedAt);
    db = server;
    dirty = false;
    saveLocal();
    renderAll();
    try { refreshAllQtyHints(); } catch (e) {} /* gợi ý "còn X" trong tờ ghi theo tồn mới */
    if (!quiet) toast('Đã cập nhật dữ liệu mới từ thiết bị khác');
  }
  renderSyncLine();
  return newer;
}
function autoRefresh(){
  renderSyncLine(); /* chấm vàng tự hiện khi quá 60s, cả khi nhịp này bị bỏ */
  if (refreshing || authLost || dirty || conflictOpen || doc.hidden) return Promise.resolve(false);
  refreshing = true;
  return fetchServer('autoRefresh')
    .then(function(server){
      refreshing = false;
      if (!server || dirty || conflictOpen) return false;
      if (dialogOpen() && num(server.updatedAt) > num(cloudBase)) return false; /* hoãn tới nhịp sau; lưu sẽ tự tải trước (freshThen) */
      return takeServer(server, false);
    })
    .catch(function(){ refreshing = false; return false; });
}
/* 2.39.10: trước khi lưu đơn/nhập: lần khớp hub cuối quá 15s thì tải bản mới nhất, áp (máy này không có thay đổi chưa gửi), rồi mới lưu.
   Lỗi mạng: vẫn lưu như cũ (dirty, gửi lại sau). Bấm lặp trong lúc chờ: bỏ qua. */
var freshing = false, FRESH_WAIT_MS = 3000;
function freshThen(fn){
  if (freshing) return Promise.resolve(false);
  if (dirty || conflictOpen || authLost || Date.now() - lastFresh <= FRESH_MS) { fn(); return Promise.resolve(true); }
  freshing = true;
  var wait = new Promise(function(r){ setTimeout(r, FRESH_WAIT_MS); }); /* hub chậm: chờ tối đa 3s rồi lưu luôn (đơn chỉ nằm trong bộ nhớ) */
  return Promise.race([fetchServer('freshThen'), wait])
    .then(function(server){ takeServer(server, true); })
    .catch(function(){}) /* lỗi mạng hoặc lỗi khi áp: vẫn lưu, không để freshing kẹt */
    .then(function(){ freshing = false; fn(); return true; });
}
function startAutoRefresh(){
  setInterval(autoRefresh, 15000);                      // định kỳ 15s
  setInterval(refreshUnread, 15000);                    // chưa đọc của Lịch sử, nhịp riêng (không chung snapshot)
  setInterval(refreshAutoDates, 60000);                 // làm mới ngày qua nửa đêm
  doc.addEventListener('visibilitychange', function(){  // quay lại tab
    if (!doc.hidden) { refreshAutoDates(); autoRefresh(); refreshUnread(); }
  });
  window.addEventListener('focus', function(){ refreshAutoDates(); autoRefresh(); refreshUnread(); }); // cửa sổ được focus
  window.addEventListener('online', function(){ autoRefresh(); refreshUnread(); }); // 2.39.10: mạng có lại
}

/* ================= SAO LƯU / KHÔI PHỤC ================= */
var BAK_LAST = 'kho_backup_last_v1';
var BAK_AUTO = 'kho_backup_auto_v1';

function backupAutoOn(){
  try { return localStorage.getItem(BAK_AUTO) !== '0'; } catch (e) { return true; }
}
function backupLastDate(){
  try { return localStorage.getItem(BAK_LAST) || ''; } catch (e) { return ''; }
}
function bakDateText(iso){
  var p = String(iso || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso || '');
}
function renderBackupInfo(){
  var last = backupLastDate();
  var n = $('#backupLast');
  if (n) n.textContent = last
    ? 'Bản sao lưu gần nhất: ' + bakDateText(last) + '.'
    : 'Chưa có bản sao lưu nào.';
  var h = $('#backupHint');
  if (h) h.textContent = !last
    ? 'Chưa sao lưu'
    : (last === todayISO() ? 'Đã gửi lệnh tải hôm nay' : 'Sao lưu ' + bakDateText(last));
}
/* 2.22.0: danh sách bản .db trên máy chủ (GET /api/backups), chỉ đọc, 10 dòng/trang. */
var bakList = null, bakPage = 1, bakErr = false, bakSeq = 0;
function bakSizeText(n){
  n = Number(n) || 0;
  return n >= 1048576 ? fmtNum(Math.round(n / 104857.6) / 10) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
}
function bakTimeText(iso){
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
function renderBakList(){
  var host = $('#bakList'), pg = $('#bakPager'), st = $('#bakStat');
  if (!host) return;
  host.textContent = '';
  var rows = bakList || [];
  var pages = Math.max(1, Math.ceil(rows.length / 10));
  if (bakPage > pages) bakPage = pages;
  if (bakPage < 1) bakPage = 1;
  if (bakErr || !rows.length) {
    var msg = (bakErr === 'auth' ? 'Không xem được danh sách bản sao lưu' : bakErr ? 'Không tải được danh sách' : (bakList ? 'Chưa có bản sao lưu trên máy chủ.' : 'Đang tải…'));
    var ep = el('p', 'hint bak-empty', msg); ep.setAttribute('role', 'none'); host.appendChild(ep);
    if (st) st.textContent = bakErr === 'auth' ? '' : msg;
    if (pg) pg.textContent = '';
    return;
  }
  var shown = rows.slice((bakPage - 1) * 10, bakPage * 10);
  shown.forEach(function(b){
    var r = el('div', 'bak-row');
    r.setAttribute('role', 'listitem');
    var nm = el('span', 'bak-row__name', b.name);
    if (String(b.name).indexOf('-truoc-ghi-de-') >= 0) nm.appendChild(el('span', 'bak-row__tag', 'trước ghi đè'));
    r.appendChild(nm);
    r.appendChild(el('span', 'bak-row__size', bakSizeText(b.size)));
    r.appendChild(el('span', 'bak-row__time', bakTimeText(b.modified)));
    host.appendChild(r);
  });
  if (pages > 1) renderPager(pg, bakPage, pages, 'bak', true); else if (pg) pg.textContent = '';
  if (st) st.textContent = (pages > 1 ? 'Trang ' + bakPage + '/' + pages + ' — ' : 'Đã tải ') + shown.length + '/' + rows.length + ' bản';
}
function loadBakList(){
  var seq = ++bakSeq, host = $('#bakList'), btn = $('#bakRefresh');
  if (host) host.classList.add('bak-busy');
  if (btn) btn.disabled = true;
  var done = function(list, auth){
    if (seq !== bakSeq) return;
    if (host) host.classList.remove('bak-busy');
    if (btn) btn.disabled = false;
    bakErr = list ? false : auth ? 'auth' : true;
    if (list) bakList = list;
    renderBakList();
  };
  return apiFetch('/api/backups').then(function(r){
    if (r && r.status === 401) { noteAuthLost(); return 'auth'; }
    return r.ok ? r.json() : null;
  }).then(function(j){
    if (j === 'auth') return done(null, true);
    done(j && j.success && Array.isArray(j.backups) ? j.backups : null);
  }, function(){ done(null); });
}
/* ================= CHỐT SỔ (2.40.0, docs/chot-so.md) ================= */
/* 2.40.1: mở nút chốt (app Mac đã hiểu open/closed, kênh 8c6f896): chỉ thiết bị chủ (server 403 với thiết bị khác) và desktop. File lưu trữ: chỉ chủ thấy. */
var CLOSE_UI = true, closePv = null;
function loadArchives(){
  var box = $('#closeBox'), list = $('#arcList'), btn = $('#closeBtn');
  if (!box || !list) return Promise.resolve();
  return apiFetch('/api/close-archive').then(function(r){ return r && r.ok ? r.json() : null; }).then(function(j){
    var a = j && j.success && Array.isArray(j.archives) ? j.archives : null;
    list.textContent = '';
    (a || []).forEach(function(f){
      var l = el('a', 'btn btn--sm', 'Tải ' + f.name);
      l.href = '/api/close-archive/' + encodeURIComponent(f.name); l.setAttribute('download', f.name);
      list.appendChild(l);
    });
    var can = !!(a && CLOSE_UI && doc.documentElement.classList.contains('desktop'));
    if (btn) btn.hidden = !can;
    var gb = $('#closeGuideBtn'); if (gb) gb.hidden = !can; /* 2.40.2: hướng dẫn cùng điều kiện với nút chốt */
    box.hidden = !(a && (a.length || can));
  }, function(){});
}
function closeCall(cutoff, dryRun, base){
  var h = { 'Content-Type': 'application/json' };
  if (base != null) h['X-Base-Updated'] = String(base);
  return apiFetch('/api/close-year', { method: 'POST', headers: h, body: JSON.stringify({ cutoff: cutoff, dryRun: dryRun }) })
    .then(function(r){ return r.json().then(function(j){ return { status: r.status, j: j }; }); });
}
function closeYearOf(c){ return String(Number(String(c).slice(0, 4)) - 1); }
function renderClosePreview(pv){
  var out = $('#closeOut');
  if (!out) return;
  out.textContent = '';
  var k = function(v){ return fmtNum(dec(num(v) / 1000)); }; /* số đúng, không cắt (khác fmtMoneyInt) */
  out.appendChild(el('p', 'hint', 'Mốc ' + dateVN(pv.cutoff) + ': gỡ ' + pv.totals.count + ' giao dịch trước mốc. Nhập ' + k(pv.totals.imp) + ' · Doanh thu ' + k(pv.totals.rev) + ' · Giá vốn ' + k(pv.totals.cost) + ' · Lợi nhuận ' + k(pv.totals.profit) + ' (nghìn đồng).'));
  var sm = pv.months.reduce(function(a, e){ return { rev: a.rev + e.rev, cost: a.cost + e.cost }; }, { rev: 0, cost: 0 });
  out.appendChild(el('p', 'hint', 'Bảng tóm tắt ' + pv.months.length + ' tháng: doanh thu ' + k(sm.rev) + ', giá vốn ' + k(sm.cost) + '.'));
  var tb = el('table', 'tbl');
  var hd = el('tr'); ['Vị thuốc', 'Tồn tại mốc', 'Giá vốn'].forEach(function(x){ hd.appendChild(el('th', null, x)); }); tb.appendChild(hd);
  pv.opening.forEach(function(o){ var tr = el('tr'); tr.appendChild(el('td', null, o.name)); tr.appendChild(el('td', 'num', fmtKgExact(o.qty))); tr.appendChild(el('td', 'num', k(o.price))); tb.appendChild(tr); });
  out.appendChild(tb);
  /* 0 giao dịch bị gỡ: một dòng "Chưa có gì để chốt" thay cho lý do chặn tương ứng của server. */
  var bad = pv.totals.count ? pv.blocks.slice() : ['Chưa có gì để chốt'].concat(pv.blocks.filter(function(b){ return !/^Không có giao dịch nào/.test(b); }));
  if (sm.rev !== pv.totals.rev || sm.cost !== pv.totals.cost) bad.push('Tổng gỡ khác bảng tóm tắt');
  pv.ok = !bad.length;
  bad.forEach(function(b){ out.appendChild(el('p', 'txt-red', b)); });
  if (pv.ok) {
    out.appendChild(el('p', 'hint', 'Nên chốt khi các máy khác không đang nhập dở. Gõ CHOT ' + closeYearOf(pv.cutoff) + ' để chốt.'));
    var inp = el('input', 'inp'); inp.id = 'closeConfirm'; inp.autocomplete = 'off';
    out.appendChild(inp);
  }
  var b = el('button', 'btn btn--danger', 'Chốt sổ'); b.type = 'button'; b.setAttribute('data-action', 'close-run');
  b.disabled = !pv.ok;
  out.appendChild(b);
}
function closePreview(){
  /* D đề xuất = Tết năm nay − 1 (ngày cuối năm âm vừa hết); C = Tết của năm âm chứa D. */
  var cur = lunarStart(todayISO());
  var d = window.prompt('Ngày chốt (YYYY-MM-DD): gỡ giao dịch trước Tết của năm âm chứa ngày này', cur ? prevDayISO(cur) : '');
  if (d == null) return Promise.resolve();
  d = String(d).trim();
  if (parseDateVN(d) !== d) { toast('Ngày không hợp lệ (YYYY-MM-DD)', 'error'); return Promise.resolve(); } /* 2.40.4: chỉ nhận ngày thật dạng ISO */
  var c = lunarStart(d);
  if (!c) { toast('Ngày ngoài bảng Tết', 'error'); return Promise.resolve(); }
  return closeCall(c, true).then(function(x){
    if (!x.j || !x.j.success) { toast((x.j && x.j.error) || 'Không xem trước được', 'error'); return; }
    closePv = x.j; renderClosePreview(x.j);
  }, function(){ toast('Không xem trước được', 'error'); });
}
function closeRun(){
  var pv = closePv, inp = $('#closeConfirm');
  if (!pv || !pv.ok) { toast('Xem trước trước khi chốt', 'error'); return Promise.resolve(); } /* xem trước bắt buộc, bị chặn thì không chạy */
  if (!inp || String(inp.value).trim() !== 'CHOT ' + closeYearOf(pv.cutoff)) { toast('Gõ đúng CHOT ' + (pv ? closeYearOf(pv.cutoff) : ''), 'error'); return Promise.resolve(); }
  if (dirty) { toast('Còn thay đổi chưa gửi lên máy chủ, chờ đồng bộ rồi xem trước lại', 'error'); return Promise.resolve(); }
  if (!confirm('Chốt sổ đến ' + dateVN(pv.cutoff) + ': gỡ ' + pv.totals.count + ' giao dịch trước mốc (có backup và file lưu trữ trên hub). Nên chốt khi các máy khác không đang nhập dở.')) return Promise.resolve();
  return closeCall(pv.cutoff, false, pv.updatedAt).then(function(x){
    closePv = null;
    var out = $('#closeOut'); if (out) out.textContent = '';
    if (!x.j || !x.j.success) { toast((x.j && x.j.error) || 'Chốt sổ lỗi', 'error'); return; }
    toast(x.j.warning ? 'Đã chốt sổ đến ' + dateVN(pv.cutoff) + '. Cảnh báo: ' + x.j.warning : 'Đã chốt sổ đến ' + dateVN(pv.cutoff), x.j.warning ? 'error' : undefined);
    return pullState(false).then(function(ok){ if (!ok) toast('Đã chốt, hãy tải lại app', 'error'); return loadArchives(); });
  }, function(){ toast('Chốt sổ lỗi, dữ liệu không đổi', 'error'); });
}
function prevDayISO(iso){ return new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) - 1)).toISOString().slice(0, 10); }
function downloadBackup(manual, filename, skipStamp){
  var url = null;
  try {
    var payload = {
      app: 'quan-ly-kho',
      version: 1,
      savedAt: new Date().toISOString(),
      data: db
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = filename || ('kho-backup-' + todayISO() + '.json');
    a.rel = 'noopener';
    doc.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
  } catch (e) {
    if (manual) toast('Không tạo được bản sao lưu', 'error');
    return false;
  }
  try { if (!skipStamp) localStorage.setItem(BAK_LAST, todayISO()); } catch (e) {}
  if (!skipStamp) renderBackupInfo();
  if (manual) toast('Đã tạo file sao lưu');
  return true;
}
function backupStamp(){
  var d = new Date();
  return todayISO() + '-' + pad2(d.getHours()) + pad2(d.getMinutes());
}
/* Tải snapshot hiện tại trước khi restore. Trả false nếu trình duyệt chặn,
   để restoreFromFile dừng lại thay vì ghi đè mù. */
function backupBeforeRestore(name){
  return downloadBackup(false, name || ('kho-backup-truoc-restore-' + backupStamp() + '.json'), true);
}
function maybeAutoBackup(){
  if (!backupAutoOn()) return false;
  if (backupLastDate() === todayISO()) return false;
  if (!db.products.length && !db.transactions.length && !db.prescriptions.length) return false;
  if (!downloadBackup(false)) return false;
  toast('Đã gửi lệnh tải bản sao lưu hôm nay, hãy kiểm tra thư mục Tải xuống');
  return true;
}
var backupParseError = '';
/* Cùng luật với validateState(server). Trả chuỗi lỗi đầu tiên hoặc ''. */
function validateBackupState(d){
  if (!d || typeof d !== 'object' || Array.isArray(d)) return 'Dữ liệu không phải object';
  var keys = ['products', 'transactions', 'prescriptions'];
  for (var ki = 0; ki < keys.length; ki++) {
    if (!Array.isArray(d[keys[ki]])) return 'Thiếu mảng ' + keys[ki];
  }
  for (var i = 0; i < d.products.length; i++) {
    var p = d.products[i], pl = 'Sản phẩm #' + (i + 1);
    if (!p || typeof p !== 'object') return pl + ': không hợp lệ';
    var pname = String(p.name || '').trim();
    if (!pname) return pl + ': thiếu tên';
    if (pname.length > NAME_MAX) return pl + ': tên quá dài (tối đa ' + NAME_MAX + ' ký tự)';
    if (p.stock == null || p.stock === '' || !inRange(p.stock, 0, QTY_MAX)) return pl + ' "' + pname + '": tồn kho phải từ 0 đến ' + QTY_MAX;
    if (p.costPrice == null || p.costPrice === '' || !inRange(p.costPrice, 0, MONEY_MAX)) return pl + ' "' + pname + '": giá nhập phải từ 0 đến ' + MONEY_MAX;
  }
  for (var j = 0; j < d.transactions.length; j++) {
    var t = d.transactions[j], tl = 'Giao dịch #' + (j + 1);
    if (!t || typeof t !== 'object') return tl + ': không hợp lệ';
    if (t.type !== 'NHAP' && t.type !== 'BAN') return tl + ': loại phải là NHAP hoặc BAN';
    if (!isRealDateISO(t.date)) return tl + ': ngày phải là ngày thật YYYY-MM-DD trong 2000-2100';
    if (!String(t.productId || '').trim()) return tl + ': thiếu productId';
    if (t.qty == null || t.qty === '' || !inRange(t.qty, 0, QTY_MAX) || !(Number(t.qty) > 0)) return tl + ': số lượng phải > 0 và <= ' + QTY_MAX;
    if (t.price == null || t.price === '' || !inRange(t.price, 0, MONEY_MAX)) return tl + ': đơn giá phải từ 0 đến ' + MONEY_MAX;
    if (t.total == null || t.total === '' || !inRange(t.total, 0, MONEY_MAX)) return tl + ': thành tiền phải từ 0 đến ' + MONEY_MAX;
    if (t.cost != null && !inRange(t.cost, 0, MONEY_MAX)) return tl + ': giá vốn phải từ 0 đến ' + MONEY_MAX;
    if (t.g != null && !inRange(t.g, 0, GRAMS_MAX)) return tl + ': grams phải từ 0 đến ' + GRAMS_MAX;
    if (t.thang != null && !inRange(t.thang, 1, THANG_MAX)) return tl + ': số thang phải từ 1 đến ' + THANG_MAX;
    if (t.unitPrice != null && !inRange(t.unitPrice, 0, MONEY_MAX)) return tl + ': giá 1 thang phải từ 0 đến ' + MONEY_MAX;
    if (t.ts != null && !isNumLike(t.ts)) return tl + ': ts không hợp lệ';
    if (t.open === true && t.type !== 'NHAP') return tl + ': dòng tồn đầu kỳ phải là NHAP';
    var oname = t.oname != null ? String(t.oname).trim() : (t.orderName != null ? String(t.orderName).trim() : '');
    if (oname && oname.length > NAME_MAX) return tl + ': tên đơn quá dài (tối đa ' + NAME_MAX + ' ký tự)';
  }
  for (var k = 0; k < d.prescriptions.length; k++) {
    var r = d.prescriptions[k], rl = 'Đơn thuốc #' + (k + 1);
    if (!r || typeof r !== 'object') return rl + ': không hợp lệ';
    var rname = String(r.name || '').trim();
    if (!rname) return rl + ': thiếu tên';
    if (rname.length > NAME_MAX) return rl + ': tên quá dài (tối đa ' + NAME_MAX + ' ký tự)';
    if (r.total == null || r.total === '' || !inRange(r.total, 0, MONEY_MAX)) return rl + ' "' + rname + '": tổng tiền phải từ 0 đến ' + MONEY_MAX;
    if (r.thang != null && !inRange(r.thang, 1, THANG_MAX)) return rl + ' "' + rname + '": số thang phải từ 1 đến ' + THANG_MAX;
    if (!Array.isArray(r.items) || !r.items.length) return rl + ' "' + rname + '": chưa có vị thuốc';
    for (var m = 0; m < r.items.length; m++) {
      var it = r.items[m], il = rl + ' dòng ' + (m + 1);
      if (!it || typeof it !== 'object') return il + ': không hợp lệ';
      if (!String(it.productId || '').trim()) return il + ': thiếu productId';
      if (!inRange(it.grams, 0, GRAMS_MAX) || !(Number(it.grams) > 0)) return il + ': số gram phải > 0 và <= ' + GRAMS_MAX;
    }
  }
  return '';
}
function parseBackup(text){
  backupParseError = '';
  var obj = JSON.parse(text);
  var d = obj && obj.data ? obj.data : obj;
  if (!d || typeof d !== 'object') { backupParseError = 'Dữ liệu không phải object'; return null; }
  /* Bắt buộc đủ 3 bảng: thiếu một bảng sẽ khiến restore xóa mất dữ liệu. */
  if (!Array.isArray(d.products) || !Array.isArray(d.transactions) || !Array.isArray(d.prescriptions)) {
    backupParseError = 'File thiếu một trong ba bảng products/transactions/prescriptions';
    return null;
  }
  if (obj.app && obj.app !== 'quan-ly-kho') { backupParseError = 'File không phải bản sao lưu của Quản Lý Kho'; return null; }
  if (obj && obj.moneyUnit === 'dong') d.moneyUnit = 'dong'; /* cho file viết tay: downloadBackup không ghi moneyUnit ở lớp ngoài */
  if (isLegacyMoney(d)) { backupParseError = LEGACY_MONEY_MSG; return null; }
  var err = validateBackupState(d);
  if (err) { backupParseError = err; return null; }
  var drops = [];
  var out = sanitize(d, drops);
  if (drops.length) out._drops = drops;
  return out;
}
/* Số BYTE UTF-8 (cùng đơn vị với MAX_BODY của server; .length đếm đơn vị UTF-16 nên đếm thiếu tiếng Việt có dấu). Không dùng Blob vì Blob là đường tải file. */
function utf8Bytes(s){ return new TextEncoder().encode(String(s)).length; }
function restoreFromFile(file){
  if (!file) return;
  if (authLost || refreshing) { toast(authLost ? 'Thiết bị chưa được duyệt: chưa thể khôi phục' : 'Đang đồng bộ, thử lại sau giây lát', 'error'); return; }
  if (file.size > 48 * 1024 * 1024) { toast('File sao lưu quá lớn', 'error'); return; }
  var fr = new FileReader();
  fr.onload = function(){
    var bak = null;
    try { bak = parseBackup(String(fr.result || '')); } catch (e) {
      backupParseError = 'File sao lưu không phải JSON hợp lệ';
    }
    if (!bak) { toast(backupParseError || 'File sao lưu không hợp lệ hoặc thiếu bảng dữ liệu', 'error'); return; }
    if (utf8Bytes(JSON.stringify(bak)) > MAX_STATE_BYTES) { toast('File sao lưu quá lớn', 'error'); return; }
    var drops = bak._drops || [];
    delete bak._drops;
    var msg = 'Khôi phục ' + bak.products.length + ' vị thuốc, ' +
      bak.transactions.length + ' giao dịch, ' +
      bak.prescriptions.length + ' đơn thuốc?\n\n' +
      'Dữ liệu hiện tại (kể cả trên máy chủ) sẽ bị thay thế hoàn toàn.';
    if (drops.length) {
      msg += '\n\nĐã bỏ ' + drops.length + ' dòng trùng:\n' + drops.slice(0, 8).join('\n');
      if (drops.length > 8) msg += '\n…';
    }
    if (!confirm(msg)) return;
    /* Trình duyệt chặn tải im lặng thì mã không biết được: tải bản hiện tại rồi bắt người dùng xác nhận đã thấy file mới ghi đè. */
    var bakName = 'kho-backup-truoc-restore-' + backupStamp() + '.json';
    if (!backupBeforeRestore(bakName)) {
      toast('Không tạo được bản sao lưu trước khi khôi phục — đã hủy thao tác', 'error');
      return;
    }
    if (!confirm('Vừa tải về bản sao lưu dữ liệu hiện tại: "' + bakName + '".\nHãy kiểm tra file đã có trong thư mục Tải xuống rồi mới bấm OK.\nChưa thấy file thì bấm Hủy: dữ liệu chưa bị thay đổi.')) return;
    db = bak;
    resetDrafts();
    /* Restore là ghi đè chủ động: bỏ qua kiểm tra conflict và ép ghi lên máy chủ. */
    commit('Đã khôi phục từ file sao lưu', true);
  };
  fr.onerror = function(){ toast('Không đọc được file', 'error'); };
  fr.readAsText(file);
}

/* ================= RENDER TỔNG ================= */
function renderAll(){
  indexTx();
  renderPresetOptions();
  renderInventory();
  renderHistory('imp');
  renderHistory('exp');
  renderStats();
  var cb = $('#chartBox');
  if (cb && cb.open) renderChart();
}

/* N1: bấm nút có data-keep-focus không làm ô nhập đang gõ mất focus (iOS ẩn bàn phím khi nút nhận focus). */
function keepFocusDown(e){ var t = e.target; if (t && t.closest && t.closest('[data-keep-focus]')) e.preventDefault(); }
doc.addEventListener('pointerdown', keepFocusDown, true);
doc.addEventListener('mousedown', keepFocusDown, true);
/* 2.14.0 N7: cuộn chuột trên ô số đang focus không được đổi số. Blur trước khi cuộn; không preventDefault (trang vẫn cuộn). */
doc.addEventListener('wheel', function(e){
  var t = e.target;
  if (t && t.tagName === 'INPUT' && t.type === 'number' && doc.activeElement === t && typeof t.blur === 'function') t.blur();
}, { passive: true, capture: true });
/* ================= SỰ KIỆN ================= */
function handleAction(btn){
  var a = btn.getAttribute('data-action');
  var id = btn.getAttribute('data-id');
  switch (a) {
    case 'nhap-add': addNhapItem(); break;
    case 'save-retail': freshThen(saveRetail); break; /* 2.39.10: tải bản hub mới nhất trước khi lưu */
    case 'save-remedy': freshThen(saveRemedy); break;
    case 'save-preset': remedySavePresetClick(); break;
    case 'del-preset': delPreset(); break;
    case 'pick-preset': pickPresetRow(id); break;
    case 'close-preset': closePreset(); break;
    case 'new-remedy': newRemedy(); break;
    case 'clear-retail': clearDraft('retail'); break;
    case 'clear-nhap': clearDraft('nhap'); break;
    case 'edit-prod': openEdit(id); break;
    case 'del-prod': delProduct(id); break;
    case 'del-nhap-item': {
      var ix = parseInt(btn.getAttribute('data-idx'), 10);
      if (ix >= 0 && ix < nhapList.length) { nhapList.splice(ix, 1); renderNhapList(); }
      break;
    }
    case 'del-tx': delTx(id); break;
    case 'del-order': delOrder(id); break;
    case 'order-view': openOrder(btn.getAttribute('data-oid')); break;
    case 'close-order': closeOrder(); break;
    case 'note-edit': {
      noteEditIdx = parseInt(btn.getAttribute('data-idx'), 10);
      renderNote();
      var eq = $('#noteEditQty');
      if (eq) { eq.focus(); eq.select(); }
      break;
    }
    case 'note-del': {
      var ni = parseInt(btn.getAttribute('data-idx'), 10);
      if (ni >= 0 && ni < retailItems.length) { retailItems.splice(ni, 1); noteEditIdx = -1; renderNote(); }
      break;
    }
    case 'rnote-add': addRemedyToNote(); break;
    case 'rnote-edit': {
      remedyEditIdx = parseInt(btn.getAttribute('data-idx'), 10);
      renderRemedyNote();
      var req = $('#remedyNoteEditQty');
      if (req) { req.focus(); req.select(); }
      break;
    }
    case 'rnote-del': {
      var rni = parseInt(btn.getAttribute('data-idx'), 10);
      if (rni >= 0 && rni < remedyItems.length) { remedyItems.splice(rni, 1); remedyEditIdx = -1; calcRemedy(); }
      break;
    }
    case 'rnote-save': remedyNoteSave(); break;
    case 'rnote-cancel': remedyEditIdx = -1; renderRemedyNote(); break;
    case 'note-add': addRetailToNote(); break;
    case 'note-save': noteSave(); break;
    case 'note-cancel': noteEditIdx = -1; renderNote(); break;
    case 'tx-edit': openTxEdit(id); break;
    case 'close-tx': closeTxEdit(); break;
    case 'save-tx': saveTxEdit(); break;
    case 'save-edit': saveEdit(); break;
    case 'sync-discard': discardUnsynced(); break;
    case 'unread-all': unreadAll(btn.getAttribute('data-kind')); break;
    case 'reload-app': reloadAppClick(); break;
    case 'brand-tap': brandTap(); break;
    case 'bak-view': bakView(btn.getAttribute('data-view')); break;
    case 'open-devices': location.href = '/auth/devices'; break;
    case 'close-edit': closeEdit(); break;
    case 'inv-low': case 'inv-out': { var fk = a.slice(4); invFilter = invFilter === fk ? '' : fk; invPage = 1; renderInventory(); break; } /* 2.32.0 */
    case 'reconcile': openRec(); break;
    case 'close-rec': closeRec(); break;
    case 'rec-fix': recFix(id); break;
    case 'rec-fix-all': recFixAll(); break;
    case 'backup-now': downloadBackup(true); break;
    case 'bak-refresh': loadBakList(); loadArchives(); break;
    case 'close-preview': closePreview(); break;
    case 'close-run': closeRun(); break;
    case 'guide-open': (function(d){ if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', ''); })($('#guideDlg')); break;
    case 'guide-close': (function(d){ if (d && d.close) d.close(); else if (d) d.removeAttribute('open'); })($('#guideDlg')); break;
    case 'open-backup-dir': {
      var T = window.__TAURI__;
      if (T && T.core) T.core.invoke('mo_thu_muc_sao_luu').catch(function(){ toast('Không mở được thư mục sao lưu'); });
      break;
    }
    case 'restore-file': {
      var ri = $('#restoreInput');
      if (ri) ri.click();
      break;
    }
    case 'page': {
      var kind = btn.getAttribute('data-kind');
      var page = parseInt(btn.getAttribute('data-page'), 10) || 1;
      if (kind === 'inv') { invPage = page; renderInventory(); }
      else if (kind === 'imp') { impPage = page; renderHistory('imp'); }
      else if (kind === 'exp') { expPage = page; renderHistory('exp'); }
      else if (kind === 'rpre') { presetPage = page; renderPresetList(); }
      else if (kind === 'rnote') { remedyNotePage = page; renderRemedyNote(); }
      else if (kind === 'note') { notePage = page; renderNote(); }
      else if (kind === 'order') { orderPage = page; renderOrder(); }
      else if (kind === 'bak') { bakPage = page; renderBakList(); }
      break;
    }
  }
}

function bindEvents(){
  doc.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('[data-action]') : null;
    if (t) handleAction(t);
  });

  var nf = $('#nhapForm');
  if (nf) nf.addEventListener('submit', function(e){ e.preventDefault(); freshThen(saveNhap); });
  /* N2: lỗi trong hộp thoại tự xóa khi hộp đóng hoặc người dùng sửa một ô trong hộp. */
  $$('dialog').forEach(function(d){
    d.addEventListener('close', function(){ clearDlgErr(d); });
    d.addEventListener('input', function(){ clearDlgErr(d); });
  });
  if (nf) nf.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' || e.defaultPrevented) return;
    if (!e.target || e.target.tagName !== 'INPUT') return;
    e.preventDefault();
    var id = e.target.id;
    if (id === 'nhapQty' && (isDesk() || !num(($('#nhapPrice') || {}).value))) { goSearch('#nhapPrice'); return; } /* 2.29.0 desktop: Enter ở SL luôn sang ô tiền (đặc tả Mac) */
    if (id === 'nhapQty' || id === 'nhapPrice') { addNhapItem(); return; }
    goSearch('#nhapSearch');
  });
  ['nhapQty', 'nhapPrice'].forEach(function(id){
    var n = $('#' + id);
    if (n) n.addEventListener('input', calcNhap);
  });
  var nsName = $('#nhapSearch');
  if (nsName) nsName.addEventListener('input', calcNhap);
  var nqHint = $('#nhapQty');
  if (nqHint) attachQtyHint(nqHint, 'kg');
  var txqHint = $('#txEditQty');
  if (txqHint) attachQtyHint(txqHint, function(){ return txEditCur && txEditCur.rx ? 'g' : 'kg'; });
  var ns = $('#nhapSearch');
  if (ns) ns.addEventListener('input', function(){
    if (nhapPid) {
      var p = findProduct(nhapPid);
      if (!p || capWords(ns.value) !== capWords(p.name)) nhapPid = null;
    }
  });

  var body = $('#retailBody');
  if (body) body.addEventListener('click', function(e){ /* 2.38.20 điện thoại: chạm tên vị đã chọn → bỏ dòng, về ô nhập tên */
    var td = e.target.closest && e.target.closest('td'), tr = td && td.parentNode;
    if (isDesk() || !tr || !tr.getAttribute('data-pid') || td !== tr.children[1]) return;
    tr.remove(); orderEmpty(body, 5, ''); renderNote();
    var s = $('#retailSearch'); if (s) focusNS(s);
  });
  var nbody = $('#retailNoteBody');
  if (nbody) nbody.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); noteSave(); }
    else if (e.key === 'Escape' && noteEditIdx >= 0) { noteEditIdx = -1; renderNote(); }
  });
  var rnbody = $('#remedyNoteBody');
  if (rnbody) rnbody.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); remedyNoteSave(); }
    else if (e.key === 'Escape' && remedyEditIdx >= 0) { remedyEditIdx = -1; renderRemedyNote(); }
  });
  var rbody = $('#remedyBody');
  if (rbody) rbody.addEventListener('click', function(e){ /* 2.38.28 điện thoại: chạm tên vị đã chọn → bỏ dòng, về ô nhập tên */
    var td = e.target.closest && e.target.closest('td'), tr = td && td.parentNode;
    if (isDesk() || !tr || !tr.getAttribute('data-pid') || td !== tr.children[1]) return;
    tr.remove(); orderEmpty(rbody, 4, ''); renderRemedyNote();
    var s = $('#remedySearch'); if (s) focusNS(s);
  });
  if (rbody) rbody.addEventListener('input', function(e){
    if (e.target.classList.contains('remedy-qty')) calcRemedyTyping();
  });
  function goSearch(sel){
    var s = $(sel);
    if (!s) return;
    s.focus();
    if (typeof s.select === 'function') s.select();
  }
  function rowEnter(host, add, qcls, mcls){
    if (!host) return;
    host.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' || e.defaultPrevented) return;
      if (!e.target || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      if (qcls && isDesk() && e.target.classList.contains(qcls)) { goSearch('.' + mcls); return; } /* 2.29.0 desktop: Enter ở SL sang ô tiền, Enter ở ô tiền mới đưa dòng vào */
      /* Enter khi đang nhập dòng: đưa thẳng vào tờ ghi (giống nhập hàng) */
      add();
    });
  }
  rowEnter(body, addRetailToNote, 'retail-qty', 'retail-money');
  rowEnter(rbody, addRemedyToNote);
  var rup = $('#remedyUnitPrice');
  if (rup) {
    rup.addEventListener('input', calcRemedyTyping);
    rup.addEventListener('keydown', function(e){
      if (e.key === 'Enter') { e.preventDefault(); goSearch('#remedySearch'); }
    });
  }
  var rth = $('#remedyThang');
  if (rth) {
    rth.addEventListener('input', calcRemedyTyping);
    rth.addEventListener('change', function(){ rth.value = String(remedyThang()); calcRemedy(); });
    rth.addEventListener('keydown', function(e){
      if (e.key === 'Enter') { e.preventDefault(); goSearch('#remedySearch'); }
    });
  }
  var rsel = $('#remedyPreset');
  if (rsel) rsel.addEventListener('change', remedyPresetPick);
  var rfind = $('#remedyFind');
  if (rfind) {
    rfind.addEventListener('input', presetFindOpen);
    rfind.addEventListener('keydown', presetFindKey);
    rfind.addEventListener('blur', function(){ setTimeout(function(){ presetFindClose(false); }, 140); });
  }
  var rname = $('#remedyName');
  if (rname) {
    rname.addEventListener('input', updatePresetUI);
    rname.addEventListener('blur', function(){ rname.value = capWords(rname.value); updatePresetUI(); });
  }

  var is = $('#invSearch');
  if (is) is.addEventListener('input', function(){ invPage = 1; renderInventory(); });

  var impS = $('#impSearch');
  if (impS) impS.addEventListener('input', function(){ impPage = 1; renderHistory('imp'); });
  var expS = $('#expSearch');
  if (expS) expS.addEventListener('input', function(){ expPage = 1; renderHistory('exp'); });
  bindMonthInput('expMonth', function(){ expPage = 1; renderHistory('exp'); });

  var ch = $('#statsChart');
  if (ch) { ch.addEventListener('click', onChartClick); ch.addEventListener('mousemove', onChartMove); ch.addEventListener('mouseleave', onChartMove); }

  var cb = $('#chartBox');
  [['#chartModeY', 'Y'], ['#chartModeM', 'M'], ['#chartModeD', 'D']].forEach(function(b){ var e = $(b[0]); if (e) e.addEventListener('click', function(){ chartModeSet(b[1]); }); });
  [['#chartPrev', -1], ['#chartNext', 1]].forEach(function(b){ var e = $(b[0]); if (e) e.addEventListener('click', function(){ chartYearGo(b[1]); }); });
  if (cb) cb.addEventListener('toggle', function(){
    if (cb.open) { chartModeSet('D'); requestAnimationFrame(renderChart); var fb = cb.querySelector('.card__body'); if (fb && isDesk()) try { fb.focus({ preventScroll: true }); } catch (e) { fb.focus(); } }
  });
  if (cb) cb.addEventListener('keydown', function(e){ if (isDesk() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); chartKey(e.key === 'ArrowLeft' ? -1 : 1); } }); /* 2.34.0 */
  var bbx = $('#backupBox');
  if (bbx) bbx.addEventListener('toggle', function(){ if (bbx.open) { loadBakList(); loadArchives(); bakView('bak'); } });
  var rbx = $('#remedyBox');
  if (rbx) rbx.addEventListener('toggle', function(){ if (rbx.open) { presetPage = 1; renderPresetList(); } }); /* 2.28.0: ĐƠN ĐÃ LƯU mở ở trang 1 khi vào tab */
  initTabs();
  initFootBars();

  var rt = null;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ if (cb && cb.open) renderChart(); }, 160);
  });
  /* 2.38.26 desktop: khung biểu đồ đổi cỡ (tab mở, cửa sổ Tauri đổi) thì vẽ lại; chỉ khi rộng/cao thật sự đổi nên không vẽ lặp. */
  var chHost = $('.chart-scroll'), chLw = 0, chLh = 0;
  if (chHost && typeof window.ResizeObserver === 'function') new window.ResizeObserver(function(){
    var w = chHost.clientWidth, h = chHost.clientHeight;
    if (w === chLw && h === chLh) return;
    chLw = w; chLh = h;
    if (isDesk() && cb && cb.open) renderChart();
  }).observe(chHost);

  var dlg = $('#editDlg');
  if (dlg) dlg.addEventListener('click', function(e){ if (e.target === dlg) closeEdit(); });
  var gdD = $('#guideDlg');
  if (gdD) gdD.addEventListener('click', function(e){ if (e.target === gdD) gdD.close(); });
  var recD = $('#recDlg');
  if (recD) recD.addEventListener('click', function(e){ if (e.target === recD) closeRec(); });
  var txd = $('#txDlg');
  if (txd) txd.addEventListener('click', function(e){ if (e.target === txd) closeTxEdit(); });
  /* Esc/cancel đóng dialog native mà không qua closeTxEdit: chỉ xóa đúng biến mà closeTxEdit dọn. */
  if (txd) txd.addEventListener('close', function(){ txEditCur = null; });
  var od = $('#orderDlg');
  if (od) od.addEventListener('click', function(e){ if (e.target === od) closeOrder(); });
  if (od) od.addEventListener('close', function(){ orderCur = null; });
  ['txEditQty', 'txEditPrice'].forEach(function(id){
    var n = $('#' + id);
    if (n) n.addEventListener('input', calcTxEdit);
  });

  var ri = $('#restoreInput');
  if (ri) ri.addEventListener('change', function(){
    var f = ri.files && ri.files[0];
    restoreFromFile(f);
    ri.value = '';
  });

  var ab = $('#autoBackup');
  if (ab) {
    ab.checked = backupAutoOn();
    ab.addEventListener('change', function(){
      try { localStorage.setItem(BAK_AUTO, ab.checked ? '1' : '0'); } catch (e) {}
      toast(ab.checked ? 'Đã bật tự sao lưu hằng ngày' : 'Đã tắt tự sao lưu hằng ngày');
      if (ab.checked) maybeAutoBackup();
    });
  }
}
/* 2.15.6: chế độ gọn khi nhập trên điện thoại (2.15.8: 2 dòng cuối). Hàm thuần: tổng cao n dòng cuối; 0 nếu số dòng <= n (không cần gọn). */
var COMPACT_ROWS = 2;
function compactListHeight(heights, n){
  var h = [];
  (heights || []).forEach(function(x){ if (x > 0) h.push(x); });
  var k = n > 0 ? n : COMPACT_ROWS;
  if (h.length <= k) return 0;
  var sum = 0;
  for (var i = h.length - k; i < h.length; i++) sum += h[i];
  return Math.ceil(sum);
}
/* Bật gọn: điện thoại và đang focus một ô nhập (INPUT, không phải ngày) trong thẻ. */
function compactWanted(o){
  return !!(o && o.mobile && o.editing);
}
var compactOffTimer = {};
/* 2.15.8 "guồng nước": smooth = true (đã gọn từ trước, vừa thêm vị bằng "+") thì cuộn MƯỢT xuống cuối; prefers-reduced-motion thì 'auto'. Lần vào gọn đầu: nhảy thẳng. */
function compactScrollEnd(list, smooth){
  var top = list.scrollHeight;
  if (smooth && typeof list.scrollTo === 'function') {
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    list.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    /* lưới an toàn: cuộn mượt có thể bị hủy khi bố cục đổi; sau 450ms chắc chắn nằm ở cuối */
    setTimeout(function(){ if (list.scrollHeight - list.clientHeight - list.scrollTop > 1) list.scrollTop = list.scrollHeight; }, 450);
  } else list.scrollTop = top;
}
/* 2.15.10: NGÂN SÁCH CHIỀU CAO. Vùng thấy thật khi bàn phím mở = visualViewport.height (đo trên iPhone 14 Pro: 357-358 CSS px, innerHeight vẫn 695), tính từ đỉnh vùng nhìn.
   Thẻ khóa cách đỉnh KB_TOP_GAP; từ đỉnh thẻ tới đáy dòng đang nhập phải <= vvH - KB_TOP_GAP - KB_BOTTOM_GAP. Hàm thuần: chỗ còn cho danh sách = vvH - gap trên - gap dưới - (đỉnh danh sách - đỉnh thẻ) - khối dòng nhập (lấy lớn hơn của đo thật và ước lượng ENTRY_BLOCK_H). */
var ENTRY_BLOCK_H = 104, KB_BOTTOM_GAP = 8;
function compactAvail(vvH, listTopRel, pendH){
  if (!(vvH > 0)) return NaN;
  /* 2.15.18: chỉ chừa chỗ khi dòng đang nhập THẬT SỰ có (pendH > 0). Sau "+" hoặc khi đang gõ tên chưa chọn vị, dòng nhập trống (cao 0): chừa 104px ở đó làm tờ ghi chỉ còn 1 dòng. */
  return vvH - KB_TOP_GAP - KB_BOTTOM_GAP - (listTopRel > 0 ? listTopRel : 0) - (pendH > 0 ? Math.max(pendH, ENTRY_BLOCK_H) : 0);
}
/* Hàm thuần: max-height (px) của danh sách gọn; 0 = không giới hạn. Giảm dần từ n dòng xuống 1 cho vừa avail; 1 dòng vẫn không vừa thì cắt đúng avail (>=1). avail không xác định (NaN) = chỉ n dòng. */
function compactFitHeight(hs, n, avail, natural){
  if (avail !== avail) return compactListHeight(hs, n);
  var cnt = 0;
  (hs || []).forEach(function(x){ if (x > 0) cnt++; });
  var k = Math.min(n > 0 ? n : COMPACT_ROWS, cnt);
  for (; k >= 1; k--) {
    var h = compactListHeight(hs, k); /* 0 khi chỉ có <= k dòng: hiện đủ */
    var sum = h;
    if (!h) { sum = natural > 0 ? natural : 0; if (!(sum > 0)) (hs || []).forEach(function(x){ if (x > 0) sum += x; }); } /* không giới hạn: cao tự nhiên của danh sách (gồm tiêu đề bảng) */
    if (sum <= avail) return h;
  }
  return Math.max(1, Math.floor(avail));
}
/* Chiều cao phần dòng nhập thật của .note__pending: không tính hàng Tổng (tfoot) nằm cùng bảng (2.17.5), nếu không dòng nhập trống bị coi là có dòng và compactAvail trừ ENTRY_BLOCK_H. */
function pendEntryH(pend){
  if (!pend || !pend.getBoundingClientRect) return 0;
  var h = pend.getBoundingClientRect().height;
  var tf = pend.querySelector ? pend.querySelector('tfoot') : null;
  if (tf && tf.getBoundingClientRect) h -= tf.getBoundingClientRect().height;
  return h > 0 ? h : 0;
}
/* Đặt max-height danh sách gọn theo ngân sách; trả true nếu đổi. */
function compactFit(box, list){
  var tb = list.querySelector('tbody');
  var hs = [];
  if (tb) { var rs = tb.children || []; for (var i = 0; i < rs.length; i++) hs.push(rs[i].getBoundingClientRect().height); }
  var avail = NaN;
  if (box.getBoundingClientRect && list.getBoundingClientRect) {
    var vv = window.visualViewport, vvH = (vv && vv.height) || window.innerHeight || 0;
    var pend = box.querySelector ? box.querySelector('.note__pending') : null;
    var pr = pendEntryH(pend);
    avail = compactAvail(vvH, list.getBoundingClientRect().top - box.getBoundingClientRect().top, pr);
  }
  var h = compactFitHeight(hs, COMPACT_ROWS, avail, list.scrollHeight);
  var m = h ? h + 'px' : '';
  var changed = list.style.maxHeight !== m;
  list.style.maxHeight = m;
  return changed;
}
function compactRefit(){
  [['retailBox', 'retailNoteList'], ['remedyBox', 'remedyNoteList']].forEach(function(p){
    var box = $('#' + p[0]), list = $('#' + p[1]);
    if (box && list && box.classList && box.classList.contains('kb-compact') && compactFit(box, list)) list.scrollTop = list.scrollHeight;
  });
}
function compactApply(box, list, on, smooth){
  if (!box || !list) return;
  var was = !!(box.classList && box.classList.contains('kb-compact'));
  if (!on) { box.classList.remove('kb-compact'); list.style.maxHeight = ''; return; }
  box.classList.add('kb-compact');
  compactFit(box, list);
  compactScrollEnd(list, !!smooth && was);
}
/* Đồng bộ chế độ gọn theo ô đang focus. force = đo lại và cuộn cuối (sau "+"). Tắt trễ 250ms để chuyển ô SL -> Thành tiền -> + không nhấp nháy. */
function compactSync(force){
  var mobile = kbMobile();
  var ae = doc.activeElement;
  [['retailBox', 'retailNoteList'], ['remedyBox', 'remedyNoteList']].forEach(function(p){
    var box = $('#' + p[0]), list = $('#' + p[1]);
    if (!box || !list || !box.classList) return;
    var editing = !!(ae && ae.tagName === 'INPUT' && ae.type !== 'date' && box.contains && box.contains(ae));
    var want = compactWanted({ mobile: mobile, editing: editing });
    if (want) {
      if (compactOffTimer[p[0]]) { clearTimeout(compactOffTimer[p[0]]); compactOffTimer[p[0]] = 0; }
      if (force || !box.classList.contains('kb-compact')) compactApply(box, list, true, force);
      else if (compactFit(box, list)) list.scrollTop = list.scrollHeight;
    } else if (box.classList.contains('kb-compact') && !compactOffTimer[p[0]]) {
      compactOffTimer[p[0]] = setTimeout(function(){
        compactOffTimer[p[0]] = 0;
        var a2 = doc.activeElement;
        if (a2 && a2.tagName === 'INPUT' && a2.type !== 'date' && box.contains && box.contains(a2)) return;
        compactApply(box, list, false);
      }, 250);
    }
  });
}
/* 2.38.11: bỏ khóa cuộn trang (body fixed + ẩn .top) của 2.15.10: không còn thanh chân fixed nên không cần; Bán lẻ/Thuốc chén cư xử như Nhập hàng (thanh đầu sticky nền đặc, iOS tự cuộn ô đang gõ vào tầm nhìn). */
var KB_TOP_GAP = 8; /* khoảng đệm (px) compactAvail chừa quanh vùng nhìn khi bàn phím mở */
function kbMobile(){ return !!(window.matchMedia && window.matchMedia('(max-width:640px)').matches); }
function kbVvTop(){ var vv = window.visualViewport; return vv ? (vv.offsetTop || 0) : 0; }
/* Sau lưu thành công (điện thoại): đóng bàn phím và về đầu trang để thấy thanh đầu + tờ ghi mới. */
function afterSaveDone(){
  if (!kbMobile()) return;
  var a = doc.activeElement;
  if (a && a !== doc.body && a.blur) a.blur();
  if (window.scrollTo) window.scrollTo(0, 0);
}
var kbDebug = false, kbReason = 'init';
/* Dòng gỡ lỗi (?kbdebug=1), gắn vào <html> (không bị body fixed/top âm kéo đi), bám visualViewport. */
function kbDbg(why){
  if (why) kbReason = why;
  var root = doc.documentElement;
  if (!kbDebug || !root) return;
  var d = $('#kbDbg');
  if (!d) { d = doc.createElement('div'); d.id = 'kbDbg'; d.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;background:#111;color:#0f0;font:10px monospace;padding:2px 4px;white-space:pre;pointer-events:none;max-width:100vw;overflow:hidden'; root.appendChild(d); }
  var vv = window.visualViewport, ih = window.innerHeight || 0;
  var rb = $('#retailBox'), mb = $('#remedyBox');
  var cp = !!((rb && rb.classList && rb.classList.contains('kb-compact')) || (mb && mb.classList && mb.classList.contains('kb-compact')));
  d.style.transform = vv ? 'translate(' + Math.round(vv.offsetLeft || 0) + 'px,' + Math.round(vv.offsetTop || 0) + 'px)' : '';
  d.textContent = 'vvH ' + Math.round(vv && vv.height ? vv.height : 0) + ' vvTop ' + Math.round(vv ? (vv.offsetTop || 0) : 0) + ' ih ' + ih + ' compact ' + (cp ? 1 : 0) + ' vv-top ' + kbVvPin + ' y ' + Math.round(window.pageYOffset || 0) + ' | ' + kbReason + '\n' + kbEvs.join('  ');
}
/* visualViewport đổi (bàn phím hiện/đổi, iOS pan): đo lại danh sách gọn. */
/* 2.38.19: khi bàn phím mở (vvH < ih − 120) iOS dịch khung nhìn offsetTop px trong layout viewport; .top sticky bám layout nên trượt khỏi màn hình → dịch .top đúng offsetTop. Hàm thuần: px (0 khi bàn phím đóng). */
function vvTopPx(vvH, ih, offsetTop){
  if (!(vvH > 0) || !(ih > 0) || !(vvH < ih - 120) || !(offsetTop > 0)) return 0;
  return Math.round(offsetTop);
}
var kbVvPin = 0;
function kbVvApply(){
  var vv = window.visualViewport, r = doc.documentElement;
  kbVvPin = kbMobile() && vv ? vvTopPx(vv.height, window.innerHeight, vv.offsetTop) : 0;
  if (r && r.style && r.style.setProperty) r.style.setProperty('--vv-top', kbVvPin + 'px');
}
/* 2.39.9: điện thoại – chiều cao thanh trên (--top-h) để tiêu đề cột Kho tồn ghim ngay dưới nó. */
function topHWatch(){
  var t = $('.top'), r = doc.documentElement;
  if (!t || isDesk() || typeof window.ResizeObserver !== 'function') return;
  var set = function(){ r.style.setProperty('--top-h', t.offsetHeight + 'px'); };
  set(); new window.ResizeObserver(set).observe(t); /* gọi sau phoneTop (thanh trên đã đủ nội dung) */
}
function onVvChange(){ kbVvApply(); compactRefit(); kbEvRec('vv'); kbDbg(); }
var kbEvs = [], kbEvAt = 0, kbVvPrev = 0, kbTouchAt = 0;
function kbTouch(){ kbEvRec('pointerdown'); kbDbg(); }
/* Gỡ lỗi (?kbdebug=1): ghi 3 sự kiện vv/chạm/focus gần nhất để biết iOS pan do đâu. */
function kbEvRec(src){
  if (!kbDebug) return;
  var now = Date.now(), t = Math.round(kbVvTop());
  if (src === 'pointerdown') kbTouchAt = now;
  if (src === 'vv' && t === kbVvPrev) return;
  kbEvs.push('vvTop ' + kbVvPrev + '→' + t + ' (+' + (kbEvAt ? now - kbEvAt : 0) + 'ms, ' + src + (src === 'input' ? ', y ' + Math.round(window.pageYOffset || 0) : '') + ')');
  if (kbEvs.length > 3) kbEvs.shift();
  kbVvPrev = t; kbEvAt = now;
}
/* nay chỉ lo chế độ gọn khi nhập + gỡ lỗi; tên cũ giữ vì nhiều test dùng */
/* Bật gỡ lỗi bàn phím (?kbdebug=1 hoặc chạm logo 5 lần ≤ 2 s; chỉ trong phiên, không lưu). Ghi thêm sự kiện input (kèm cuộn y) để biết trang nhảy lúc gõ. */
function kbDebugOn(why){
  if (kbDebug) return;
  kbDebug = true;
  doc.addEventListener('touchstart', kbTouch, { passive: true, capture: true });
  kbDbg(why);
  doc.addEventListener('focusin', function(){ kbEvRec(kbTouchAt && Date.now() - kbTouchAt < 800 ? 'focusin' : 'next'); kbDbg(); });
  doc.addEventListener('input', function(){ kbEvRec('input'); kbDbg(); }, true);
  if (typeof window.addEventListener === 'function') window.addEventListener('scroll', function(){ kbDbg(); }, { passive: true });
}
/* Chạm logo: dãy thời điểm chạm → true khi đủ 5 lần trong 2 s (rồi xoá dãy). Hàm thuần. */
function logoTapsHit(taps, now){
  taps.push(now);
  while (taps.length && now - taps[0] > 2000) taps.shift();
  if (taps.length >= 5) { taps.length = 0; return true; }
  return false;
}
var logoTaps = [];
function brandTap(){ if (logoTapsHit(logoTaps, Date.now())) kbDebugOn('5-cham-logo'); }
function initFootBars(){
  if (window.visualViewport && window.visualViewport.addEventListener) {
    window.visualViewport.addEventListener('resize', onVvChange);
    window.visualViewport.addEventListener('scroll', onVvChange);
  }
  try { if (/[?&]kbdebug=1/.test((window.location && window.location.search) || '')) kbDebugOn('mo-trang'); } catch (e) {}
  doc.addEventListener('focusin', function(){ compactSync(false); });
  doc.addEventListener('focusout', function(){ setTimeout(compactSync, 0); });
}
/* ================= KHỞI ĐỘNG ================= */
/* 2.10.0: tab 8 mục. Chỉ đổi open/aria-selected/class; không đụng dữ liệu. 2.39.7: không nhớ tab (bỏ 'qlk_tab'). */
/* 2.38.16 N.4: vuốt trái/phải đổi tab (điện thoại). Hàm thuần: m = { dx, dy, dt (ms), x0 (chỗ bắt đầu), vw (rộng màn hình), ok (không bị chặn) } -> +1 tab kế (vuốt trái), -1 tab trước (vuốt phải), 0 không phải vuốt đổi tab. */
function swipeDir(m){
  if (!m || !m.ok) return 0;
  if (!(m.x0 > 16) || !(m.x0 < m.vw - 16)) return 0;
  if (Math.abs(m.dx) < 60 || Math.abs(m.dy) >= Math.abs(m.dx) / 2 || !(m.dt < 600)) return 0;
  return m.dx < 0 ? 1 : -1;
}
/* Chặn: ngoài điện thoại, bắt đầu trong ô nhập/gợi ý, bàn phím đang mở (đang focus ô nhập hoặc vùng nhìn thấp hơn màn hình), hộp thoại mở, gợi ý mở, hoặc trong vùng cuộn ngang. */
function swipeBlocked(t){
  if (!kbMobile() || isDesk()) return true;
  var ae = doc.activeElement;
  if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.type !== 'checkbox' && ae.type !== 'file') return true;
  var vv = window.visualViewport;
  if (vv && vv.height && vv.height < (window.innerHeight || 0) * 0.85) return true;
  if (doc.querySelector('dialog[open]') || doc.querySelector('.sug__list:not([hidden])')) return true;
  for (var e = t; e && e !== doc.body && e.nodeType === 1; e = e.parentNode) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName) || e.isContentEditable) return true;
    if (e.scrollWidth > e.clientWidth + 1 && /(auto|scroll)/.test(window.getComputedStyle(e).overflowX)) return true;
  }
  return false;
}
function initSwipeTabs(go){
  var st = null;
  doc.addEventListener('touchstart', function(e){
    var t = e.touches && e.touches.length === 1 ? e.touches[0] : null;
    st = t ? { x: t.clientX, y: t.clientY, at: Date.now(), blocked: swipeBlocked(e.target) } : null;
  }, { passive: true });
  doc.addEventListener('touchcancel', function(){ st = null; }, { passive: true });
  doc.addEventListener('touchend', function(e){
    var s0 = st, t = e.changedTouches && e.changedTouches[0];
    st = null;
    if (!s0 || !t) return;
    var dir = swipeDir({ dx: t.clientX - s0.x, dy: t.clientY - s0.y, dt: Date.now() - s0.at, x0: s0.x, vw: window.innerWidth || 0, ok: !s0.blocked });
    if (dir) go(dir);
  }, { passive: true });
}
function initTabs(){
  var nav = $('#tabs');
  if (!nav) return;
  var btns = nav.querySelectorAll('.tab');
  var ids = [];
  var boxes = [];
  for (var i = 0; i < btns.length; i++) {
    var id0 = btns[i].getAttribute('data-tab');
    ids.push(id0);
    var bx0 = doc.getElementById(id0);
    if (bx0) boxes.push(bx0);
  }
  var activate = function(id){
    refreshAutoDates();
    for (var j = 0; j < boxes.length; j++) {
      if (boxes[j].id !== id && boxes[j].open) boxes[j].open = false;
    }
    for (var m = 0; m < btns.length; m++) {
      var on = btns[m].getAttribute('data-tab') === id;
      btns[m].classList.toggle('is-active', on);
      btns[m].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    refitLists(); /* 2.39.7: khung vừa hiện mới đo được số dòng/trang */
  };
  boxes.forEach(function(bx){
    bx.addEventListener('toggle', function(){ if (bx.open) activate(bx.id); });
    var s = bx.querySelector(':scope > summary');
    if (s) s.addEventListener('click', function(e){ e.preventDefault(); });
  });
  nav.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.tab') : null;
    if (!b || !nav.contains(b)) return;
    var bx1 = doc.getElementById(b.getAttribute('data-tab'));
    if (!bx1) return;
    bx1.open = true;
    activate(bx1.id);
  });
  initSwipeTabs(function(dir){ /* dir +1 = tab kế, -1 = tab trước; dừng ở 2 đầu; cùng đường với bấm icon */
    var cur = -1;
    for (var q = 0; q < btns.length; q++) if (btns[q].classList.contains('is-active')) cur = q;
    var nx = cur + dir;
    if (cur < 0 || nx < 0 || nx >= ids.length) return;
    var bx2 = doc.getElementById(ids[nx]);
    if (bx2) { bx2.open = true; activate(bx2.id); }
  });
  var rft = 0;
  if (window.addEventListener) window.addEventListener('resize', function(){ clearTimeout(rft); rft = setTimeout(refitLists, 100); }); /* 2.39.7: đổi HD/FHD, cỡ cửa sổ */
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refitLists); /* phông nạp xong có thể đổi chiều cao thanh đầu: đo lại */
  var sb = doc.getElementById('retailBox'); /* 2.39.7: mọi nền tảng, mọi lần tải đều vào Bán lẻ (thay 2.10.0 nhớ tab, 2.36.0 app vào Thống kê) */
  if (sb) { sb.open = true; activate('retailBox'); }
}

function init(boot){
  var rchk = window.__DB__ ? checkServerData(window.__DB__, 'init') : null; /* Z.2: dữ liệu nhúng sẵn cũng không được áp nếu sanitize phải bỏ dòng */
  var remote = rchk && rchk.ok ? rchk.state : null;
  boot = boot || localBundleLS();
  idbLost = !!boot.idbLost;
  var local = boot.local;
  var wasDirty = boot.wasDirty;
  var savedBase = boot.savedBase;

  if (local && wasDirty) {
    /* Có thay đổi chưa gửi: giữ bản local và đẩy lên máy chủ. */
    db = local;
    cloudBase = savedBase;
    dirty = true;
    dirtySince = Date.now();
  } else if (remote) {
    db = remote;
    cloudBase = num(remote.updatedAt) || savedBase;
    dirty = false;
    lastSyncOk = lastFresh = Date.now();
    saveLocal();
  } else if (local) {
    db = local;
    cloudBase = savedBase || num(local.updatedAt);
    dirty = false;
  } else {
    db = { products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
    cloudBase = 0;
    dirty = false;
  }

  showToday('retailDate');
  showToday('remedyDate');

  bindEvents();
  initSuggest();
  resetRetail();
  resetRemedy();
  renderAll();
  if (isDesk()) renderNhapList();
  renderBackupInfo();
  phoneTop();
  phoneEntry();
  topHWatch();
  renderSyncBadge();
  renderReloadBtn();
  if (legacyRejected) { legacyRejected = false; toast(LEGACY_MONEY_MSG, 'error'); }

  if (dirty) {
    /* Đẩy bản local chưa gửi lên trước; server trả 409 nếu máy khác đã sửa. */
    pushState(false);
  } else if (window.__NEED_FETCH__ || !remote) {
    pullState(false);
  }
  initUnread();
  startAutoRefresh();

  var firstUse = function(e){
    if (e && e.target && e.target.closest && e.target.closest('[data-action=restore-file]')) return; /* cử chỉ đầu là nút khôi phục: không tự tải, giữ listener */
    doc.removeEventListener('click', firstUse);
    doc.removeEventListener('keydown', firstUse);
    maybeAutoBackup(); /* chạy ngay trong cử chỉ người dùng: tải qua setTimeout dễ bị trình duyệt chặn */
  };
  doc.addEventListener('click', firstUse);
  doc.addEventListener('keydown', firstUse);
}

try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function(){}); } catch (e) {}

/* AA: nạp bản db trên máy (IndexedDB, bất đồng bộ) TRƯỚC init: init (render, pull, push, autoRefresh) chỉ chạy sau khi db đã nạp xong. Không có IndexedDB thì init đồng bộ như cũ. */
var bootP = loadLocalBundle();
function startApp(){
  if (!bootP) { init(); return; }
  bootP.then(init, function(){ init(); });
}
if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', startApp);
else startApp();

})();
