import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { PAGE } from '../src/page.js';

/* ------------------------------------------------------------------ */
/* Nạp phần JS chạy trên trình duyệt từ src/page.js vào sandbox vm.    */
/* ------------------------------------------------------------------ */

function makeEl() {
  return {
    style: {}, dataset: {}, children: [],
    value: '', textContent: '', hidden: false, checked: false, disabled: false,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    hasAttribute() { return false; }, appendChild(child) { this.children.push(child); return child; },
    remove() {}, focus() {}, select() {}, click() {},
    addEventListener() {}, removeEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
    dispatchEvent() { return true; }, scrollIntoView() {}
  };
}

function loadClient(extra = {}) {
  const blocks = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]);
  const code = blocks.find(b => b.includes('var doc = document;'));
  if (!code) throw new Error('Không tìm thấy script chính trong src/page.js');

  let js = code
    .replace(/%%BOOT%%/g, 'null')
    .replace(/%%NEEDFETCH%%/g, 'false');

  const end = js.lastIndexOf('})();');
  if (end === -1) throw new Error('Không tìm thấy điểm kết thúc IIFE');
  js = js.slice(0, end) + `
globalThis.__test = {
  fmtMoney: fmtMoney, fmtNum: fmtNum, fmtQty: fmtQty, dec: dec, num: num,
  sanitize: sanitize, parseBackup: parseBackup, mergeCandidates: mergeCandidates,
  reconcileList: reconcileList, findProduct: findProduct, renderStats: renderStats,
  loadPreset: loadPreset, recFix: recFix, resetDrafts: resetDrafts, checkLimits: checkLimits,
  backupLastDate: backupLastDate, commitRetailRow: commitRetailRow,
  commitRemedyRow: commitRemedyRow, onSuggestKey: onSuggestKey,
  getRemedyItems: function(){ return remedyItems; },
  getRetailItems: function(){ return retailItems; },
  getNhapList: function(){ return nhapList; },
  getTxEdit: function(){ return txEditCur; },
  getOrderCur: function(){ return orderCur; }, setOrderCur: function(v){ orderCur = v; },
  getNhapPid: function(){ return nhapPid; }, setNhapPid: function(v){ nhapPid = v; },
  setTxEdit: function(v){ txEditCur = v; },
  getInvPage: function(){ return invPage; },
  setInvPage: function(v){ invPage = v; },
  renderInventory: renderInventory,
  wrapRenderInventory: function(fn){ var orig = renderInventory; renderInventory = function(){ fn(); return orig.apply(this, arguments); }; },
  setDb: function(v){ db = v; },
  getDb: function(){ return db; },
  setDirty: function(v){ dirty = !!v; },
  isDirty: function(){ return dirty; },
  setBase: function(v){ cloudBase = dec(v); },
  getBase: function(){ return cloudBase; },
  saveLocal: saveLocal, readDirty: readDirty, readBase: readBase,
  computeStats: computeStats, allocateRemedyByCost: allocateRemedyByCost,
  balanceRemedyMoney: balanceRemedyMoney, kToDong: kToDong,
  applyRemedyBalance: applyRemedyBalance, scaledRemedyCost: scaledRemedyCost, remedyLineCost: remedyLineCost,
  backupBeforeRestore: backupBeforeRestore, downloadBackup: downloadBackup,
  pushState: pushState, pullState: pullState, cloudConflict: cloudConflict,
  autoRefresh: autoRefresh, busyEditing: busyEditing,
  setRetailItems: function(v){ retailItems = v; },
  setRemedyItems: function(v){ remedyItems = v; },
  setNhapList: function(v){ nhapList = v; },
  setActiveTag: function(tag){ doc.activeElement = tag ? { tagName: tag } : null; },
  setConflictOpen: function(v){ conflictOpen = !!v; },
  setSyncErrorShown: function(v){ syncErrorShown = !!v; },
  isSyncErrorShown: function(){ return syncErrorShown; },
  getSyncDetail: function(){ return syncDetail; },
  getQuotaNote: function(){ return quotaNote; },
  hasSyncRetry: function(){ return !!syncRetryTimer; },
  getSyncRetryDelay: function(){ return syncRetryDelay; },
  isSyncRejected: function(){ return syncRejected; },
  setSyncRejected: function(v){ syncRejected = !!v; },
  setSyncDetail: function(v){ syncDetail = String(v || ''); },
  setDirtySince: function(v){ dirtySince = num(v); },
  isAuthLost: function(){ return authLost; },
  setAuthLost: function(v){ authLost = !!v; },
  renderSyncBadge: renderSyncBadge,
  discardUnsynced: discardUnsynced, restoreFromFile: restoreFromFile,
  readLocal: readLocal,
  saveNhap: saveNhap, saveRetail: saveRetail, saveRemedy: saveRemedy,
  openTxEdit: openTxEdit, saveTxEdit: saveTxEdit, delTx: delTx, mergeDo: mergeDo,
  getStockWarnText: function(){ return stockWarnText; },
  todayISO: todayISO, thisYear: thisYear,
  getDateInput: getDateInput, setDateInput: setDateInput,
  bindDateInput: bindDateInput, userPickedDate: userPickedDate,
  refreshAutoDates: refreshAutoDates, autoDateInput: autoDateInput, autoChartYear: autoChartYear,
  getLastAuto: function(id){ return lastAuto[id]; },
  setLastAuto: function(id, v){ lastAuto[id] = v; },
  getLastChartYear: function(){ return lastChartYear; },
  setLastChartYear: function(v){ lastChartYear = v; },
  setActiveId: function(id){ doc.activeElement = id ? $('#' + id) : null; },
  initDates: function(){ var t = todayISO(); setDateInput('retailDate', t); setDateInput('remedyDate', t); lastAuto.retailDate = t; lastAuto.remedyDate = t; var cy = $('#chartYear'); if (cy) cy.value = thisYear(); lastChartYear = thisYear(); },
  latestImportMap: latestImportMap, importParen: importParen, costParen: costParen,
  historyData: historyData, renderHistory: renderHistory, renderNote: renderNote,
  setImpPage: function(v){ impPage = v; }, getImpPage: function(){ return impPage; },
  setExpPage: function(v){ expPage = v; }, getExpPage: function(){ return expPage; },
  setImpAll: function(v){ impAll = !!v; }, getImpAll: function(){ return impAll; },
  setExpAll: function(v){ expAll = !!v; }, getExpAll: function(){ return expAll; },
  normSearch: normSearch,
  handleAction: handleAction, addNhapItem: addNhapItem, addRemedyToNote: addRemedyToNote, delOrder: delOrder, pickSuggest: pickSuggest,
  scheduleSyncRetry: scheduleSyncRetry, noteSave: noteSave, remedyNoteSave: remedyNoteSave,
  savePreset: savePreset, copyPreset: copyPreset, saveEdit: saveEdit,
  setNoteEditIdx: function(v){ noteEditIdx = v; }, setRemedyEditIdx: function(v){ remedyEditIdx = v; },
  getRetailItems: function(){ return retailItems; }, getRemedyItems: function(){ return remedyItems; },
  recFixAll: recFixAll, initTabs: initTabs
};
})();`;
  const store = new Map();
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
  const document = {
    readyState: 'loading',
    documentElement: makeEl(),
    body: makeEl(),
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() { return makeEl(); },
    createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, Intl, Date, Math, JSON, Number, String, Array, Object,
    parseFloat, isFinite, NaN, Infinity, Map, Set, Promise,
    setTimeout() { return 0; }, clearTimeout() {},
    localStorage, document,
    navigator: {}, location: { href: 'https://example.test/' },
    crypto: { randomUUID: () => '00000000-0000-4000-8000-' + String(Math.random()).slice(2, 14) },
    confirm: () => true, alert() {},
    addEventListener() {}, removeEventListener() {},
    innerWidth: 1024, innerHeight: 768, scrollY: 0, scrollX: 0, devicePixelRatio: 1,
    requestAnimationFrame() { return 0; }, cancelAnimationFrame() {},
    getComputedStyle() { return { getPropertyValue() { return ''; } }; },
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    Blob: class {}, FileReader: class {}, MouseEvent: class {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    ...extra
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox, { filename: 'worker-client.js' });
  return sandbox.__test;
}

const app = loadClient();

test('src/page.js giữ placeholder SSR cần thiết của trang', () => {
  assert.ok(PAGE.includes('<script>'), 'không còn nonce (CSP dùng unsafe-inline)');
  assert.ok(!PAGE.includes('nonce='), 'đã gỡ nonce');
  assert.ok(!PAGE.includes('%%NONCE%%'), 'đã gỡ placeholder nonce');
  assert.ok(PAGE.includes('window.__DB__=%%BOOT%%;'));
  assert.ok(PAGE.includes('window.__NEED_FETCH__=%%NEEDFETCH%%;'));
  assert.ok(PAGE.trimEnd().endsWith('</html>'));
});

/* ------------------------------------------------------------------ */
/* Hàm thuần: tiền, số lượng, chuẩn hoá dữ liệu                        */
/* ------------------------------------------------------------------ */

test('src/page.js giới hạn maxlength 200 cho tên vị thuốc và tên đơn', () => {
  assert.match(PAGE, /id="nhapSearch"[^>]*maxlength="200"/);
  assert.match(PAGE, /id="editName"[^>]*maxlength="200"/);
  assert.match(PAGE, /id="remedyName"[^>]*maxlength="200"/);
});

test('fmtMoney hiện nghìn đồng và giữ tới từng đồng', () => {
  assert.equal(app.fmtMoney(0), '0');
  assert.equal(app.fmtMoney(135000), '135');
  assert.equal(app.fmtMoney(13500), '13,5');
  assert.equal(app.fmtMoney(400), '0,4');
  assert.equal(app.fmtMoney(1000000), '1.000');
  assert.equal(app.fmtMoney(15088170), '15.088,17');
  assert.equal(app.fmtMoney(-2500), '-2,5');
  assert.equal(app.kToDong(13.5), 13500);
  assert.equal(app.fmtNum(0.1 + 0.2), '0,3');
});

test('fmtQty đổi kg → lạng → g', () => {
  assert.equal(app.fmtQty(0), '0g');
  assert.equal(app.fmtQty(0.2), '2 lạng');
  assert.equal(app.fmtQty(0.005), '5 g');
  assert.equal(app.fmtQty(1.5), '1,5 kg');
});

test('sanitize loại bản ghi trùng id/tên để không làm hỏng batch ghi', () => {
  const out = app.sanitize({
    products: [
      { id: 'p1', name: 'A Giao', stock: 1, costPrice: 10 },
      { id: 'p2', name: 'a giao', stock: 2, costPrice: 20 },
      { id: 'p1', name: 'Khác', stock: 3, costPrice: 30 }
    ],
    transactions: [
      { id: 't1', date: '2026-01-01', type: 'NHAP', productId: 'p1', qty: 1, price: 10, total: 10 },
      { id: 't1', date: '2026-01-02', type: 'BAN', productId: 'p1', qty: 1, price: 10, total: 10 }
    ],
    prescriptions: [
      { id: 'r1', name: 'Đơn A', items: [{ productId: 'p1', grams: 5 }, { productId: 'p1', grams: 6 }] },
      { id: 'r2', name: 'Đơn A', items: [{ productId: 'p1', grams: 7 }] },
      { id: 'r3', name: 'đơn a', items: [{ productId: 'p1', grams: 8 }] }
    ]
  });
  assert.equal(out.products.length, 1);
  assert.equal(out.products[0].id, 'p1');
  assert.equal(out.transactions.length, 1);
  /* Tên đơn trong DB phân biệt hoa/thường: "Đơn A" và "đơn a" đều được giữ. */
  assert.equal(out.prescriptions.length, 2);
  assert.equal(out.prescriptions[0].items.length, 1);
  assert.ok(out.prescriptions.some(r => r.name === 'đơn a'));
});

test('parseBackup chỉ nhận file đủ 3 bảng và số liệu hợp lệ', () => {
  const valid = {
    app: 'quan-ly-kho', version: 1,
    data: { products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 2 }], transactions: [], prescriptions: [] }
  };
  assert.ok(app.parseBackup(JSON.stringify(valid)));

  assert.equal(app.parseBackup(JSON.stringify({ data: { products: [] } })), null);
  assert.equal(app.parseBackup(JSON.stringify({ data: { products: [], transactions: [], prescriptions: [] }, app: 'khac' })), null);

  const negativeStock = structuredClone(valid);
  negativeStock.data.products[0].stock = -1;
  assert.equal(app.parseBackup(JSON.stringify(negativeStock)), null);

  const negativeMoney = structuredClone(valid);
  negativeMoney.data.transactions.push({ id: 't1', date: '2026-01-01', type: 'BAN', productId: 'p1', qty: 1, price: -1, total: -1 });
  assert.equal(app.parseBackup(JSON.stringify(negativeMoney)), null);

  const badDate = structuredClone(valid);
  badDate.data.transactions.push({ id: 't1', date: '01/01/2026', type: 'NHAP', productId: 'p1', qty: 1, price: 1, total: 1 });
  assert.equal(app.parseBackup(JSON.stringify(badDate)), null);
});

/* ------------------------------------------------------------------ */
/* Nghiệp vụ kho: đối chiếu, giá vốn, gộp đơn                          */
/* ------------------------------------------------------------------ */

test('computeStats tính đúng doanh thu và lãi ngày/tháng/năm', () => {
  const products = [
    { id: 'p1', name: 'A', stock: 10, costPrice: 100 },
    { id: 'p2', name: 'B', stock: 2, costPrice: 50 }
  ];
  const txs = [
    { id: 't1', date: '2026-03-15', type: 'BAN', productId: 'p1', qty: 2, total: 1000, cost: 300 },
    { id: 't2', date: '2026-03-02', type: 'BAN', productId: 'p2', qty: 1, total: 200 },
    { id: 't3', date: '2026-03-01', type: 'NHAP', productId: 'p1', qty: 5, total: 500 },
    { id: 't4', date: '2025-12-31', type: 'BAN', productId: 'p1', qty: 1, total: 100, cost: 40 },
    { id: 't5', date: '2026-03-15', type: 'BAN', productId: 'x', qty: 1, total: 50 }
  ];
  const s = app.computeStats(txs, products, '2026-03-15');
  assert.equal(s.dExp, 1050);      // t1 + t5
  assert.equal(s.dCogs, 300);      // t5 không có giá vốn và không có sản phẩm → 0
  assert.equal(s.mImp, 500);       // chỉ NHAP trong tháng
  assert.equal(s.mExp, 1250);
  assert.equal(s.mCogs, 350);      // 300 + 50 (fallback p2) + 0
  assert.equal(s.yExp, 1250);
  assert.equal(s.profitDay, 750);
  assert.equal(s.profitMonth, 900);
  assert.equal(s.stock, 12);

  const loss = app.computeStats(
    [{ date: '2026-03-15', type: 'BAN', productId: 'p1', qty: 1, total: 10, cost: 20 }],
    products, '2026-03-15'
  );
  assert.equal(loss.profitDay, -10);
  assert.equal(loss.profitMonth, -10);
});

test('reconcileList tính đúng chênh lệch và phát hiện tồn lịch sử âm', () => {
  app.setDb({
    products: [
      { id: 'p1', name: 'A', stock: 1, costPrice: 0 },
      { id: 'p2', name: 'B', stock: 5, costPrice: 0 }
    ],
    transactions: [
      { id: 't1', date: '2026-01-01', type: 'NHAP', productId: 'p1', qty: 10, price: 1, total: 10 },
      { id: 't2', date: '2026-01-02', type: 'BAN', productId: 'p1', qty: 18, price: 1, total: 18 },
      { id: 't3', date: '2026-01-01', type: 'NHAP', productId: 'p2', qty: 5, price: 1, total: 5 }
    ],
    prescriptions: [], updatedAt: 0
  });
  const list = app.reconcileList();
  const p1 = list.find(r => r.id === 'p1');
  assert.ok(p1);
  assert.equal(p1.calc, -8);
  assert.equal(p1.diff, 9);
  assert.equal(list.find(r => r.id === 'p2'), undefined);
});

test('mergeCandidates bỏ qua giao dịch bán lẻ, kể cả dữ liệu cũ', () => {
  app.setDb({
    products: [],
    transactions: [
      { id: 't1', date: '2026-01-01', type: 'BAN', productId: 'p1', qty: 1, price: 100, total: 100, retail: true },
      { id: 't2', date: '2026-01-01', type: 'BAN', productId: 'p2', qty: 1, price: 100, total: 100 },
      { id: 't3', date: '2026-01-02', type: 'BAN', productId: 'p3', qty: 1, price: 200, total: 200, oname: 'Bán lẻ' },
      { id: 't4', date: '2026-01-02', type: 'BAN', productId: 'p4', qty: 1, price: 200, total: 200 }
    ],
    prescriptions: [], updatedAt: 0
  });
  assert.equal(app.mergeCandidates().length, 0);
});

test('mergeCandidates vẫn gộp các dòng bán rời không có cờ retail', () => {
  app.setDb({
    products: [],
    transactions: [
      { id: 't1', date: '2026-01-01', type: 'BAN', productId: 'p1', qty: 1, price: 100, total: 100 },
      { id: 't2', date: '2026-01-01', type: 'BAN', productId: 'p2', qty: 1, price: 100, total: 100 }
    ],
    prescriptions: [], updatedAt: 0
  });
  const list = app.mergeCandidates();
  assert.equal(list.length, 1);
  assert.equal(list[0].items.length, 2);
});

test('allocateRemedyByCost: vốn cộng lãi chia đều, dòng cuối nhận phần dư', () => {
  const sale = app.allocateRemedyByCost(200, [{ cost: 1 }, { cost: 3 }, { cost: 6 }]);
  assert.deepEqual(sale, [64, 66, 70]);
  assert.equal(sale.reduce((a, b) => a + b, 0), 200);

  assert.deepEqual(app.allocateRemedyByCost(100, [{ cost: 40 }]), [100]);
  assert.deepEqual(app.allocateRemedyByCost(10, [{ cost: 4 }, { cost: 6 }]), [4, 6]);
  assert.deepEqual(app.allocateRemedyByCost(10, [{ cost: 0 }, { cost: 0 }, { cost: 0 }]), [3, 3, 4]);
  assert.deepEqual(app.allocateRemedyByCost(42.6, [{ cost: 10 }, { cost: 20 }]), [16, 27]);
});

test('balanceRemedyMoney giữ vốn từng vị theo đồng, chỉ chia phần lãi', () => {
  const tiny = app.balanceRemedyMoney(100000, [{ exactCost: 400 }, { exactCost: 400 }, { exactCost: 400 }]);
  assert.deepEqual(tiny.map(row => row.cost), [400, 400, 400]);
  assert.equal(tiny.reduce((a, b) => a + b.total, 0), 100000);

  const many = app.balanceRemedyMoney(50000, Array.from({ length: 10 }, () => ({ exactCost: 400 })));
  assert.deepEqual(many.map(row => row.cost), Array.from({ length: 10 }, () => 400));
  assert.equal(many.reduce((a, b) => a + b.total, 0), 50000);

  const even = app.balanceRemedyMoney(200000, [{ exactCost: 1000 }, { exactCost: 3000 }, { exactCost: 6000 }]);
  assert.deepEqual(even.map(row => row.cost), [1000, 3000, 6000]);
  assert.equal(even.reduce((a, b) => a + b.total, 0), 200000);
  assert.equal(even[2].total - even[2].cost, 200000 - 10000 - (even[0].total - even[0].cost) - (even[1].total - even[1].cost));

  assert.equal(app.balanceRemedyMoney(5000, [{ exactCost: 10000 }]), null);
});

test('applyRemedyBalance giữ vốn lịch sử, không tính lại theo giá nhập hiện tại', () => {
  /* Bán lúc A=100k/kg, B=200k/kg, C=50k/kg; sau đó giá nhập A tăng lên 160k/kg. */
  app.setDb({
    products: [
      { id: 'A', name: 'A', stock: 5, costPrice: 160 },
      { id: 'B', name: 'B', stock: 5, costPrice: 200 },
      { id: 'C', name: 'C', stock: 5, costPrice: 50 }
    ],
    transactions: [], prescriptions: [], updatedAt: 0
  });
  const lines = [
    { id: 'a', productId: 'A', qty: 0.04, cost: 4, total: 40, price: 1000, unitPrice: 60 },
    { id: 'b', productId: 'B', qty: 0.02, cost: 4, total: 40, price: 2000, unitPrice: 60 },
    { id: 'c', productId: 'C', qty: 0.06, cost: 3, total: 40, price: 667, unitPrice: 60 }
  ];
  /* Xóa vị C: khách vẫn trả 120, vốn A và B phải giữ 4 và 4 (không thành 6 vì giá nhập mới). */
  const rest = lines.slice(0, 2);
  assert.equal(app.applyRemedyBalance(rest, 120), true);
  assert.deepEqual(rest.map(x => x.cost), [4, 4]);
  assert.deepEqual(rest.map(x => x.total), [60, 60]);
  assert.equal(rest.reduce((a, x) => a + x.total, 0), 120);
});

test('applyRemedyBalance trả false và không đổi gì khi giá bán thấp hơn vốn', () => {
  app.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 0 });
  const lines = [
    { id: 'a', productId: 'X', qty: 1, cost: 30, total: 40, price: 40, unitPrice: 50 },
    { id: 'b', productId: 'Y', qty: 1, cost: 30, total: 40, price: 40, unitPrice: 50 }
  ];
  const before = JSON.stringify(lines);
  assert.equal(app.applyRemedyBalance(lines, 50), false);
  assert.equal(JSON.stringify(lines), before);
});

test('dòng chưa có cost (dữ liệu cũ) mới fallback giá nhập hiện tại', () => {
  app.setDb({
    products: [{ id: 'L', name: 'L', stock: 5, costPrice: 200 }],
    transactions: [], prescriptions: [], updatedAt: 0
  });
  assert.equal(app.remedyLineCost({ productId: 'L', qty: 0.02 }), 4);
  assert.equal(app.remedyLineCost({ productId: 'L', qty: 0.02, cost: 0 }), 0);
});

test('scaledRemedyCost co giãn theo vốn lịch sử của chính dòng, không theo giá hiện tại', () => {
  app.setDb({
    products: [{ id: 'A', name: 'A', stock: 5, costPrice: 160 }],
    transactions: [], prescriptions: [], updatedAt: 0
  });
  /* Vốn cũ 4 cho 0,04 kg → 0,06 kg phải là 6 (giá lúc bán 100k/kg), không phải 10 (giá 160k/kg). */
  assert.equal(app.scaledRemedyCost({ productId: 'A', qty: 0.06 }, 0.04, 4), 6);
  /* Không có vốn cũ thì mới dùng giá nhập hiện tại. */
  assert.equal(app.scaledRemedyCost({ productId: 'A', qty: 0.05 }, 0.04, null), 8);
});

/* ------------------------------------------------------------------ */
/* Trạng thái đồng bộ local                                            */
/* ------------------------------------------------------------------ */

test('saveLocal lưu đúng cờ dirty và mốc cloud base', () => {
  app.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  app.setDirty(false);
  app.setBase(123);
  app.saveLocal();
  assert.equal(app.readDirty(), false);
  assert.equal(app.readBase(), 123);

  app.setDirty(true);
  app.saveLocal();
  assert.equal(app.readDirty(), true);
});

test('saveLocal báo một lần khi hết quota', () => {
  const localStorage = {
    getItem() { return null; },
    setItem() {
      const e = new Error('full');
      e.name = 'QuotaExceededError';
      throw e;
    },
    removeItem() {},
    clear() {}
  };
  const client = loadClient({ localStorage });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.saveLocal();
  client.saveLocal();
  assert.match(client.getQuotaNote(), /Bộ nhớ trình duyệt đầy/);
});

test('pushState thất bại giữ đủ details và chỉ xóa lỗi khi lưu thành công', async () => {
  let mode = 'fail';
  const fetchStub = async () => ({
    json: async () => mode === 'fail'
      ? { success: false, error: 'Dữ liệu không hợp lệ', details: ['trùng tên A', 'trùng tên B'] }
      : { success: true, updatedAt: 9 }
  });
  const client = loadClient({ fetch: fetchStub });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setBase(1);
  assert.equal(await client.pushState(false, false), false);
  assert.equal(client.isSyncErrorShown(), true);
  assert.match(client.getSyncDetail(), /trùng tên A/);
  assert.match(client.getSyncDetail(), /trùng tên B/);
  assert.equal(await client.pushState(false, false), false);
  assert.equal(client.isSyncErrorShown(), true);
  mode = 'ok';
  assert.equal(await client.pushState(true, false), true);
  assert.equal(client.isSyncErrorShown(), false);
  assert.equal(client.getSyncDetail(), '');
});

test('pushState 400 và 428 hiện details, không hẹn gửi lại', async () => {
  for (const status of [400, 428]) {
    const fetchStub = async () => ({
      status,
      json: async () => ({ success: false, error: 'Từ chối ' + status, details: ['dòng A', 'dòng B'] })
    });
    const client = loadClient({
      fetch: fetchStub,
      setTimeout(fn, ms) { return ms || 1; },
      clearTimeout() {}
    });
    client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
    client.setBase(1);
    assert.equal(await client.pushState(false, false), false);
    assert.match(client.getSyncDetail(), /dòng A/);
    assert.match(client.getSyncDetail(), /dòng B/);
    assert.equal(client.hasSyncRetry(), false);
    assert.equal(client.isSyncRejected(), true);
  }
});

test('pushState 409 mở xung đột và không hẹn gửi lại', async () => {
  let confirms = 0;
  const fetchStub = async (url, opts = {}) => {
    if ((opts.method || 'GET') === 'PUT') {
      return { status: 409, json: async () => ({ success: false, conflict: true, updatedAt: 50 }) };
    }
    return {
      status: 200,
      json: async () => ({ success: true, data: { products: [], transactions: [], prescriptions: [], updatedAt: 50, moneyUnit: 'dong' } })
    };
  };
  const client = loadClient({
    fetch: fetchStub,
    confirm() { confirms++; return true; },
    setTimeout(fn, ms) { return ms || 1; },
    clearTimeout() {}
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setBase(1);
  await client.pushState(false, false);
  assert.equal(confirms, 1);
  assert.equal(client.hasSyncRetry(), false);
  assert.equal(client.isSyncRejected(), false);
});

test('nút bỏ thay đổi 4xx lấy bản máy chủ và không gửi lại bản hỏng', async () => {
  let puts = 0;
  const fetchStub = async (url, opts = {}) => {
    if ((opts.method || 'GET') === 'PUT') {
      puts++;
      return { status: 400, json: async () => ({ success: false, error: 'Dữ liệu không hợp lệ', details: ['hỏng'] }) };
    }
    return {
      status: 200,
      json: async () => ({
        success: true,
        data: { products: [{ id: 's', name: 'Server', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 9, moneyUnit: 'dong' }
      })
    };
  };
  const client = loadClient({
    fetch: fetchStub,
    confirm() { return true; },
    setTimeout() { return 1; },
    clearTimeout() {}
  });
  client.setDb({ products: [{ id: 'l', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setBase(1);
  assert.equal(await client.pushState(false, false), false);
  assert.equal(client.isSyncRejected(), true);
  assert.equal(await client.discardUnsynced(), true);
  assert.equal(client.getDb().products[0].name, 'Server');
  assert.equal(client.isDirty(), false);
  assert.equal(client.isSyncRejected(), false);
  assert.equal(puts, 1);
});

test('hủy hộp xác nhận thì giữ bản nháp', async () => {
  let gets = 0;
  const fetchStub = async () => { gets++; return { status: 200, json: async () => ({ success: true, data: { products: [], transactions: [], prescriptions: [], updatedAt: 9, moneyUnit: 'dong' } }) }; };
  const client = loadClient({ fetch: fetchStub, confirm() { return false; } });
  client.setDb({ products: [{ id: 'l', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setSyncErrorShown(true);
  assert.equal(await client.discardUnsynced(), false);
  assert.equal(client.getDb().products[0].name, 'Local');
  assert.equal(gets, 0);
});

test('sau PUT thành công lần lỗi sau bắt đầu lại ở 4 giây', async () => {
  let mode = 'err';
  const timers = [];
  const fetchStub = async () => mode === 'err'
    ? { status: 500, json: async () => ({ success: false, error: 'lỗi server' }) }
    : { status: 200, json: async () => ({ success: true, updatedAt: 4 }) };
  const client = loadClient({
    fetch: fetchStub,
    setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; },
    clearTimeout() {}
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setBase(1);
  await client.pushState(false, false);
  const first = timers.filter(t => t.ms === 4000).pop();
  assert.ok(first);
  mode = 'ok';
  first.fn();
  for (let i = 0; i < 8; i++) await new Promise(r => setImmediate(r));
  assert.equal(client.getSyncRetryDelay(), 4000);
  mode = 'err';
  timers.length = 0;
  assert.equal(await client.pushState(false, false), false);
  assert.equal(timers.some(t => t.ms === 4000), true);
  assert.equal(timers.some(t => t.ms > 4000), false);
});

test('parseBackup báo nhân 1000 khi file thiếu cờ moneyUnit', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    data: {
      products: [{ id: 'p1', name: 'A Giao', stock: 1, costPrice: 85 }],
      transactions: [],
      prescriptions: []
    }
  });
  const out = app.parseBackup(raw);
  assert.equal(out.products[0].costPrice, 85000);
  assert.match(out._moneyNote, /File này tính theo nghìn đồng, sẽ nhân 1000 khi nạp/);
  assert.ok(out._moneyNote.includes('→ ' + app.fmtNum(out.products[0].costPrice)));
});

test('parseBackup đọc moneyUnit trong data và giữ nguyên số đồng', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    data: {
      moneyUnit: 'dong',
      products: [{ id: 'p1', name: 'A Giao', stock: 1, costPrice: 85000 }],
      transactions: [],
      prescriptions: []
    }
  });
  const out = app.parseBackup(raw);
  assert.equal(out.products[0].costPrice, 85000);
  assert.match(out._moneyNote, /File này tính theo đồng, giữ nguyên/);
  assert.ok(out._moneyNote.includes('→ ' + app.fmtNum(out.products[0].costPrice)));
  assert.equal(out._moneyNote.includes('85.000.000'), false);
});

test('parseBackup tên viết thường vẫn hiện giá nhập mẫu', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    data: {
      products: [{ id: 'p1', name: 'a giao', stock: 1, costPrice: 85 }],
      transactions: [],
      prescriptions: []
    }
  });
  const out = app.parseBackup(raw);
  assert.equal(out.products[0].name, 'a giao');
  assert.equal(out.products[0].costPrice, 85000);
  assert.match(out._moneyNote, /Giá nhập “a giao”: 85 → 85\.000/);
});

test('parseBackup không có vị thuốc thì không bịa giá nhập', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    data: { moneyUnit: 'dong', products: [], transactions: [], prescriptions: [] }
  });
  const out = app.parseBackup(raw);
  assert.equal(out.products.length, 0);
  assert.match(out._moneyNote, /tính theo đồng, giữ nguyên/);
  assert.equal(out._moneyNote.includes('Giá nhập'), false);
});

/* Mẫu nhỏ thay cho file sao lưu thật: không phụ thuộc máy, không bị skip. */
const SAMPLE_GIAO = [{ id: 'PGIAO', name: 'A Giao', stock: 1, costPrice: 85 }];

test('file nghìn (không có moneyUnit) nhân A Giao từ 85 thành 85000', () => {
  const nghin = app.parseBackup(JSON.stringify({
    app: 'quan-ly-kho',
    data: { products: SAMPLE_GIAO, transactions: [], prescriptions: [] }
  }));
  const giao = nghin.products.find(p => p.name === 'A Giao');
  assert.equal(giao.costPrice, 85000);
  assert.equal(nghin.moneyUnit, 'dong');
  assert.match(nghin._moneyNote, /nghìn đồng, sẽ nhân 1000/);
  assert.ok(nghin._moneyNote.includes('→ ' + app.fmtNum(nghin.products[0].costPrice)));
});

test('file đồng (moneyUnit dong) giữ A Giao ở 85000', () => {
  const dong = app.parseBackup(JSON.stringify({
    app: 'quan-ly-kho',
    moneyUnit: 'dong',
    data: { products: [{ id: 'PGIAO', name: 'A Giao', stock: 1, costPrice: 85000 }], transactions: [], prescriptions: [] }
  }));
  const giao = dong.products.find(p => p.name === 'A Giao');
  assert.equal(giao.costPrice, 85000);
  assert.equal(dong.moneyUnit, 'dong');
  assert.match(dong._moneyNote, /tính theo đồng, giữ nguyên/);
  assert.ok(dong._moneyNote.includes('→ ' + app.fmtNum(dong.products[0].costPrice)));
  assert.equal(dong._moneyNote.includes('85.000.000'), false);
});

test('nạp file nghìn, saveLocal, đọc lại localStorage không nhân lần hai', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    data: {
      products: [{ id: 'p1', name: 'A Giao', stock: 1, costPrice: 85 }],
      transactions: [],
      prescriptions: []
    }
  });
  const out = app.parseBackup(raw);
  delete out._moneyNote;
  delete out._drops;
  assert.equal(out.products[0].costPrice, 85000);
  assert.equal(out.moneyUnit, 'dong');
  app.setDb(out);
  app.setDirty(false);
  app.saveLocal();
  const again = app.readLocal();
  assert.equal(again.products[0].costPrice, 85000);
  assert.equal(again.moneyUnit, 'dong');
  assert.equal(again._scaledFromK, undefined);
});

function readerOf(text) {
  return class {
    readAsText() {
      this.result = text;
      this.onload();
    }
  };
}

test('hủy khôi phục hoặc lỗi tải bản nháp thì không giữ _moneyNote', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    data: {
      products: [{ id: 'p1', name: 'A Giao', stock: 1, costPrice: 85 }],
      transactions: [],
      prescriptions: []
    }
  });
  const keep = { products: [{ id: 'keep', name: 'Giữ', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' };
  const cancel = loadClient({
    confirm: () => false,
    FileReader: readerOf(raw),
    Blob: class { constructor() { throw new Error('không được tải'); } }
  });
  cancel.setDb(structuredClone(keep));
  cancel.restoreFromFile({ size: raw.length });
  assert.equal(cancel.getDb().products[0].name, 'Giữ');
  assert.equal(Object.hasOwn(cancel.getDb(), '_moneyNote'), false);

  const failed = loadClient({
    confirm: () => true,
    FileReader: readerOf(raw),
    Blob: class { constructor() { throw new Error('blocked'); } }
  });
  failed.setDb(structuredClone(keep));
  failed.restoreFromFile({ size: raw.length });
  assert.equal(failed.getDb().products[0].name, 'Giữ');
  assert.equal(failed.getDb().products[0].costPrice, 1);
  assert.equal(Object.hasOwn(failed.getDb(), '_moneyNote'), false);
});

test('restoreFromFile thành công xóa nháp trong bộ nhớ (resetDrafts)', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    data: {
      products: [{ id: 'p1', name: 'A Giao', stock: 1, costPrice: 85 }],
      transactions: [],
      prescriptions: []
    }
  });
  const client = loadClient({
    confirm: () => true,
    FileReader: readerOf(raw),
    Blob: class { constructor() {} },
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) })
  });
  client.setRetailItems([{ pid: 'p1', kg: 1, amount: 1 }]);
  client.setNhapList([{ name: 'A', qty: 1, price: 1 }]);
  client.setRemedyItems([{ productId: 'p1', grams: 1 }]);
  client.setTxEdit({ id: 't1' });
  client.restoreFromFile({ size: raw.length });
  assert.equal(client.getRetailItems().length, 0);
  assert.equal(client.getNhapList().length, 0);
  assert.equal(client.getRemedyItems().length, 0);
  assert.equal(client.getTxEdit(), null);
});



test('cloudConflict OK: tải nháp trước khi thay db; tải lỗi thì hủy và giữ nguyên db', async () => {
  const order = [];
  const client = loadClient({
    Blob: class { constructor() { order.push('download'); } },
    confirm: () => true,
    fetch: async (url) => {
      order.push('fetch');
      return { status: 200, json: async () => ({ success: true, data: { products: [{ id: 'sv', name: 'Server', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 2, moneyUnit: 'dong' } }) };
    }
  });
  client.setDb({ products: [{ id: 'old', name: 'Old', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setRetailItems([{ pid: 'old', kg: 1, amount: 1 }]);
  await client.cloudConflict();
  assert.deepEqual(order, ['download', 'fetch']);
  assert.equal(client.getDb().products[0].name, 'Server');
  assert.equal(client.getRetailItems().length, 0);

  const client2 = loadClient({
    Blob: class { constructor() { throw new Error('blocked'); } },
    confirm: () => true,
    fetch: async () => { throw new Error('không được fetch'); }
  });
  client2.setDb({ products: [{ id: 'old', name: 'Old', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client2.setRetailItems([{ pid: 'old', kg: 1, amount: 1 }]);
  const r = await client2.cloudConflict();
  assert.equal(r, false);
  assert.equal(client2.getDb().products[0].name, 'Old');
  assert.equal(client2.getRetailItems().length, 1);
});
test('parseBackup ghi nhận vị thuốc trùng tên để khôi phục báo cho người dùng', () => {
  const raw = JSON.stringify({
    app: 'quan-ly-kho',
    moneyUnit: 'dong',
    data: {
      products: [
        { id: 'p1', name: 'A Giao', stock: 1, costPrice: 10 },
        { id: 'p2', name: 'a giao', stock: 2, costPrice: 20 }
      ],
      transactions: [],
      prescriptions: []
    }
  });
  const out = app.parseBackup(raw);
  assert.equal(out.products.length, 1);
  assert.equal(out._drops.length, 1);
  assert.match(out._drops[0], /A Giao|a giao/);
});

test('backupBeforeRestore lưu snapshot hiện tại với tên riêng', () => {
  let blobText = '';
  let downloadName = '';
  class CaptureBlob { constructor(parts){ blobText = String(parts[0]); } }
  const document = {
    readyState: 'loading',
    documentElement: makeEl(),
    body: makeEl(),
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() {
      const e = makeEl();
      e.click = function () { downloadName = this.download; };
      return e;
    },
    addEventListener() {}, removeEventListener() {}
  };
  const client = loadClient({ Blob: CaptureBlob, document });
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 2 }],
    transactions: [], prescriptions: [], updatedAt: 7
  });
  assert.equal(client.backupBeforeRestore(), true);
  assert.match(downloadName, /^kho-backup-truoc-restore-\d{4}-\d{2}-\d{2}-\d{4}\.json$/);
  const payload = JSON.parse(blobText);
  assert.equal(payload.data.products[0].name, 'A');
  assert.equal(payload.data.updatedAt, 7);
});

test('backupBeforeRestore trả false khi trình duyệt chặn tạo file', () => {
  class BlockedBlob { constructor(){ throw new Error('blocked'); } }
  const client = loadClient({ Blob: BlockedBlob });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 0 });
  assert.equal(client.backupBeforeRestore(), false);
});

test('pushState khi 409: chọn Lấy bản mới thì tải remote, không ép ghi đè', async () => {
  const calls = [];
  const remote = { products: [{ id: 'p1', name: 'Remote', stock: 2, costPrice: 2 }], transactions: [], prescriptions: [], updatedAt: 20 };
  const fetchStub = async (url, opts = {}) => {
    const method = opts.method || 'GET';
    calls.push({ method, headers: opts.headers || {} });
    if (method === 'PUT') {
      return { status: 200, json: async () => ({ success: false, conflict: true, updatedAt: 20 }) };
    }
    return { status: 200, json: async () => ({ success: true, data: remote }) };
  };
  const client = loadClient({ fetch: fetchStub, confirm: () => true });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10 });
  client.setBase(10);
  client.setDirty(true);
  await client.pushState(true, false);
  assert.equal(client.getDb().products[0].name, 'Remote');
  assert.equal(client.isDirty(), false);
  assert.equal(calls.filter(c => c.method === 'PUT').length, 1);
  assert.ok(!calls.some(c => c.headers['X-Force']));
});

test('pushState khi 409: chọn giữ bản máy này thì ghi đè bằng X-Force', async () => {
  const calls = [];
  const fetchStub = async (url, opts = {}) => {
    const method = opts.method || 'GET';
    calls.push({ method, headers: opts.headers || {} });
    if (method === 'PUT') {
      if (opts.headers && opts.headers['X-Force'] === '1')
        return { status: 200, json: async () => ({ success: true, updatedAt: 30 }) };
      return { status: 200, json: async () => ({ success: false, conflict: true, updatedAt: 20 }) };
    }
    throw new Error('không được gọi GET trong trường hợp này');
  };
  const client = loadClient({ fetch: fetchStub, confirm: () => false });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10 });
  client.setBase(10);
  client.setDirty(true);
  const ok = await client.pushState(true, false);
  assert.equal(ok, true);
  const puts = calls.filter(c => c.method === 'PUT');
  assert.equal(puts.length, 2);
  assert.equal(puts[1].headers['X-Force'], '1');
  assert.equal(client.getDb().products[0].name, 'Local');
  assert.equal(client.isDirty(), false);
  assert.equal(client.getBase(), 30);
});

test('pullState khi dirty không ghi đè local, đẩy bản local lên', async () => {
  const calls = [];
  const remote = { products: [{ id: 'p1', name: 'Remote', stock: 2, costPrice: 2 }], transactions: [], prescriptions: [], updatedAt: 20 };
  const fetchStub = async (url, opts = {}) => {
    const method = opts.method || 'GET';
    calls.push(method);
    if (method === 'PUT')
      return { status: 200, json: async () => ({ success: true, updatedAt: 40 }) };
    return { status: 200, json: async () => ({ success: true, data: remote }) };
  };
  const client = loadClient({ fetch: fetchStub });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10 });
  client.setBase(10);
  client.setDirty(true);
  await client.pullState(true, false);
  assert.equal(client.getDb().products[0].name, 'Local');
  assert.deepEqual(calls, ['GET', 'PUT']);
});

/* ------------------------------------------------------------------ */
/* Tự làm mới giữa các thiết bị (autoRefresh)                         */
/* ------------------------------------------------------------------ */

test('autoRefresh: tải bản server mới hơn khi máy không có thay đổi', async () => {
  const remote = { products: [{ id: 'p1', name: 'Moi', stock: 9, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 500 };
  const fetchStub = async () => ({ status: 200, json: async () => ({ success: true, data: remote }) });
  const client = loadClient({ fetch: fetchStub });
  client.setDb({ products: [{ id: 'p1', name: 'Cu', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 100 });
  client.setBase(100);
  client.setDirty(false);
  await client.autoRefresh();
  assert.equal(client.getDb().products[0].name, 'Moi');
  assert.equal(client.getBase(), 500);
});

test('autoRefresh: KHÔNG ghi đè khi máy đang có thay đổi chưa gửi', async () => {
  const remote = { products: [{ id: 'p1', name: 'Moi', stock: 9, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 500 };
  const fetchStub = async () => ({ status: 200, json: async () => ({ success: true, data: remote }) });
  const client = loadClient({ fetch: fetchStub });
  client.setDb({ products: [{ id: 'p1', name: 'ChuaGui', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 100 });
  client.setBase(100);
  client.setDirty(true);
  await client.autoRefresh();
  assert.equal(client.getDb().products[0].name, 'ChuaGui', 'phải giữ bản local khi đang dirty');
});

test('autoRefresh: không render lại khi server không có gì mới', async () => {
  let renderCalls = 0;
  const remote = { products: [], transactions: [], prescriptions: [], updatedAt: 100 };
  const fetchStub = async () => ({ status: 200, json: async () => ({ success: true, data: remote }) });
  const client = loadClient({ fetch: fetchStub });
  client.wrapRenderInventory(() => { renderCalls++; });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 100 });
  client.setBase(100);
  client.setDirty(false);
  const changed = await client.autoRefresh();
  assert.equal(changed, false);
  assert.equal(renderCalls, 0, 'server không mới thì không được render lại');
  assert.equal(client.getBase(), 100, 'base không đổi khi server bằng nhau');
});

test('autoRefresh: có bản server mới thì render đúng 1 lần (đối chứng cho bộ đếm render)', async () => {
  let renderCalls = 0;
  const remote = { products: [], transactions: [], prescriptions: [], updatedAt: 200 };
  const fetchStub = async () => ({ status: 200, json: async () => ({ success: true, data: remote }) });
  const client = loadClient({ fetch: fetchStub });
  client.wrapRenderInventory(() => { renderCalls++; });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 100 });
  client.setBase(100);
  client.setDirty(false);
  const changed = await client.autoRefresh();
  assert.equal(changed, true);
  assert.equal(renderCalls, 1, 'bản mới phải render đúng 1 lần');
  assert.equal(client.getBase(), 200);
});

test('busyEditing: nhận biết ô nhập và hộp thoại đang mở', () => {
  const client = loadClient();
  client.setActiveTag(null);
  assert.equal(client.busyEditing(), false, 'không focus thì không bận');
  ['INPUT', 'TEXTAREA', 'SELECT'].forEach(tag => {
    client.setActiveTag(tag);
    assert.equal(client.busyEditing(), true, tag + ' phải coi là đang bận');
  });
  client.setActiveTag('BUTTON');
  assert.equal(client.busyEditing(), false, 'nút bấm không chặn làm mới');
});

test('autoRefresh: KHÔNG tải khi đang gõ trong ô nhập', async () => {
  let calls = 0;
  const remote = { products: [{ id: 'p1', name: 'Moi', stock: 9, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 500 };
  const fetchStub = async () => { calls++; return { status: 200, json: async () => ({ success: true, data: remote }) }; };
  const client = loadClient({ fetch: fetchStub });
  client.setDb({ products: [{ id: 'p1', name: 'DangNhap', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 100 });
  client.setBase(100);
  client.setDirty(false);
  client.setActiveTag('INPUT');
  await client.autoRefresh();
  client.setActiveTag(null);
  assert.equal(calls, 0, 'không được gọi mạng khi đang nhập');
  assert.equal(client.getDb().products[0].name, 'DangNhap', 'giữ nguyên nội dung đang nhập');
});
test('sanitize: loại bỏ oname khi trùng với oid (tránh hiển thị ID thay vì ngày nhập)', () => {
  const out = app.sanitize({
    products: [{ id: 'p1', name: 'Cam thảo', stock: 10, costPrice: 50 }],
    transactions: [
      { id: 't1', date: '2026-11-06', type: 'NHAP', productId: 'p1', qty: 5, price: 50, total: 250, oid: 'IM_123', oname: 'IM_123' },
      { id: 't2', date: '2026-11-06', type: 'BAN', productId: 'p1', qty: 1, price: 60, total: 60, oid: 'ord_456', oname: 'Bán lẻ' }
    ],
    prescriptions: []
  });
  assert.equal(out.transactions[0].oid, 'IM_123');
  assert.equal(out.transactions[0].oname, undefined, 'oname trùng oid phải bị loại bỏ');
  assert.equal(out.transactions[1].oid, 'ord_456');
  assert.equal(out.transactions[1].oname, 'Bán lẻ', 'oname thật phải được giữ');
});

test('busyEditing: tạm hoãn làm mới khi có giỏ hàng bán lẻ chưa lưu', () => {
  const client = loadClient();
  client.setActiveTag(null);
  client.setRetailItems([]);
  assert.equal(client.busyEditing(), false);
  client.setRetailItems([{ pid: 'p1', kg: 1, amount: 50 }]);
  assert.equal(client.busyEditing(), true, 'có dòng trong giỏ hàng bán lẻ phải coi là đang bận');
  client.setRetailItems([]);
  assert.equal(client.busyEditing(), false, 'sau khi xóa giỏ hàng thì không còn bận');
});

test('busyEditing: tạm hoãn làm mới khi đang soạn đơn thuốc hoặc đơn nhập', () => {
  const client = loadClient();
  client.setActiveTag(null);
  client.setRemedyItems([]);
  client.setNhapList([]);
  assert.equal(client.busyEditing(), false);
  client.setRemedyItems([{ productId: 'p1', grams: 10 }]);
  assert.equal(client.busyEditing(), true, 'đơn thuốc chén chưa lưu phải coi là đang bận');
  client.setRemedyItems([]);
  client.setNhapList([{ pid: 'p1', name: 'A', qty: 1, price: 10 }]);
  assert.equal(client.busyEditing(), true, 'tờ ghi nhập chưa lưu phải coi là đang bận');
  client.setNhapList([]);
  assert.equal(client.busyEditing(), false);
});

test('autoRefresh: không ghi đè nếu máy bắt đầu sửa trong lúc đang tải', async () => {
  const remote = { products: [{ id: 'p1', name: 'Server', stock: 9, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 500 };
  let client;
  const fetchStub = async () => {
    client.setDirty(true);
    client.getDb().products[0].name = 'VuaSua';
    return { status: 200, json: async () => ({ success: true, data: remote }) };
  };
  client = loadClient({ fetch: fetchStub });
  client.setDb({ products: [{ id: 'p1', name: 'DangXem', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 100 });
  client.setBase(100);
  client.setDirty(false);
  client.setActiveTag(null);
  await client.autoRefresh();
  assert.equal(client.getDb().products[0].name, 'VuaSua', 'bản vừa sửa trên máy phải được giữ');
  assert.equal(client.isDirty(), true);
});


/*
  Fuzz này cố ý KHÔNG dựng các mục sau (các mục này có ca test riêng trong file, tìm theo tên hàm):
  - khôi phục từ file JSON
  - màn đối soát recFix / recFixAll
  - sửa hoặc xóa vị thuốc
  - đồng bộ máy chủ và autoRefresh
  - dòng dữ liệu cũ sinh từ bản Worker
  Mỗi chuỗi bắt đầu từ kho trống. Kho thật còn dữ liệu di sản, test này không dựng lại kho đó.
  Seed: biến môi trường KHO_FUZZ_SEED, mặc định 20261107.
*/
function rng32(seed){
  let a = seed >>> 0;
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function irand(rng, n){ return Math.floor(rng() * n); }
function qtyStep(rng, min, max, step){
  const lo = Math.round(min / step);
  const hi = Math.round(max / step);
  if (hi <= lo) return lo * step;
  return (lo + irand(rng, hi - lo + 1)) * step;
}

function stockDom(){
  const els = new Map();
  const checks = [];
  function ensure(id){
    if (!els.has(id)) {
      els.set(id, {
        id, value: '', textContent: '', hidden: false, style: {},
        classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
        setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
        hasAttribute(){ return false; },
        appendChild(child){ return child; }, remove(){}, focus(){}, select(){}, click(){},
        querySelector(){ return null; }, querySelectorAll(){ return []; },
        addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; }
      });
    }
    return els.get(id);
  }
  const need = new Set(['txEditId', 'txEditName', 'txEditQty', 'txEditPrice', 'remedyUnitPrice', 'remedyThang']);
  const document = {
    readyState: 'loading',
    documentElement: ensure('html'),
    body: ensure('body'),
    activeElement: null,
    querySelector(sel){
      const m = /^#([\w-]+)$/.exec(String(sel));
      if (!m) return null;
      if (!need.has(m[1]) && !els.has(m[1])) return null;
      return ensure(m[1]);
    },
    querySelectorAll(sel){
      if (sel === '#mergeList input[type=checkbox]') return checks;
      return [];
    },
    createElement(){ return ensure('n' + els.size); },
    createElementNS(){ return ensure('n' + els.size); },
    addEventListener(){}, removeEventListener(){}
  };
  return {
    document,
    checks,
    set(id, value){ ensure(id).value = String(value); }
  };
}

test('chuỗi thao tác ngẫu nhiên giữ tồn bằng nhập trừ bán', () => {
  const SEED = Number(process.env.KHO_FUZZ_SEED || 20261107);
  const SEQUENCES = 2000;
  const dom = stockDom();
  const fuzz = loadClient({
    document: dom.document,
    confirm: () => true,
    fetch: () => Promise.resolve({
      status: 200,
      json: async () => ({ success: true, updatedAt: 1 })
    })
  });
  const rng = rng32(SEED);
  const ran = { nhap: 0, retail: 0, remedy: 0, edit: 0, delete: 0, merge: 0 };
  const blocked = { nhap: 0, retail: 0, remedy: 0, edit: 0, delete: 0, merge: 0 };
  const idle = { nhap: 0, retail: 0, remedy: 0, edit: 0, delete: 0, merge: 0 };

  function snap(){
    const db = fuzz.getDb();
    return JSON.stringify({
      p: db.products.map(p => [p.id, p.stock]),
      t: db.transactions.map(t => [t.id, t.qty, t.oid || '', t.retail ? 1 : 0])
    });
  }
  function check(log){
    const bad = fuzz.reconcileList();
    if (!bad.length) return;
    const detail = bad.map(r => r.name + ' tồn ' + r.stock + ' lịch sử ' + r.calc + ' lệch ' + r.diff).join('; ');
    assert.fail('Lệch sau ' + log.length + ' bước: ' + detail + '\n' + JSON.stringify(log));
  }
  function run(kind, op, log, fn){
    const before = snap();
    try { fn(); }
    catch (e) { assert.fail(JSON.stringify(op) + ' ném lỗi: ' + e.message + '\n' + JSON.stringify(log)); }
    if (snap() === before) idle[kind] += 1;
    else ran[kind] += 1;
    log.push(op);
    check(log);
  }

  for (let seq = 0; seq < SEQUENCES; seq++) {
    fuzz.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
    fuzz.setDirty(false);
    const log = [{ seed: SEED, seq }];
    const steps = 15 + irand(rng, 25);
    for (let step = 0; step < steps; step++) {
      const db = fuzz.getDb();
      const bag = ['nhap'];
      if (db.products.some(p => p.stock >= 0.01)) bag.push('retail', 'retail');
      if (db.products.some(p => p.stock >= 0.05)) bag.push('remedy');
      if (db.transactions.length) bag.push('edit', 'edit', 'delete');
      if (db.products.some(p => p.stock >= 0.04)) bag.push('merge');
      const kind = bag[irand(rng, bag.length)];

      if (kind === 'nhap') {
        const makeNew = db.products.length === 0 || (db.products.length < 5 && rng() < 0.45);
        let entry;
        if (makeNew) {
          entry = {
            pid: null,
            name: 'Vi ' + String.fromCharCode(65 + db.products.length),
            qty: qtyStep(rng, 0.5, 4, 0.01),
            price: (20 + irand(rng, 180)) * 1000
          };
        } else {
          const p = db.products[irand(rng, db.products.length)];
          entry = { pid: p.id, name: p.name, qty: qtyStep(rng, 0.1, 2, 0.01), price: p.costPrice || 50000 };
        }
        run('nhap', { op: 'nhap', ...entry }, log, () => { fuzz.setNhapList([entry]); fuzz.saveNhap(); });
      } else if (kind === 'retail') {
        const ps = db.products.filter(p => p.stock >= 0.01);
        const p = ps[irand(rng, ps.length)];
        const kg = qtyStep(rng, 0.01, Math.min(p.stock, 1.5), 0.01);
        const amount = Math.round(kg * (Number(p.costPrice) + 20000));
        run('retail', { op: 'retail', pid: p.id, kg, amount }, log, () => {
          fuzz.setRetailItems([{ pid: p.id, kg, amount }]);
          fuzz.saveRetail();
        });
      } else if (kind === 'remedy') {
        const ps = db.products.filter(p => p.stock >= 0.05);
        const p = ps[irand(rng, ps.length)];
        const thang = 1 + irand(rng, 10);
        const maxG = Math.floor(Math.min(p.stock, 1.2) / thang * 10000) / 10;
        if (maxG < 1) { blocked.remedy += 1; log.push({ op: 'remedy-bo-qua', ly: 'khong du ton cho so thang' }); continue; }
        const grams = qtyStep(rng, 1, maxG, 0.1);
        const kg = grams / 1000 * thang;
        const cost = kg * Number(p.costPrice || 0);
        const unitK = Math.ceil(cost / thang / 1000) + 1 + irand(rng, 40);
        run('remedy', { op: 'remedy', pid: p.id, grams, thang, unitK }, log, () => {
          dom.set('remedyThang', String(thang));
          dom.set('remedyUnitPrice', String(unitK));
          fuzz.setRemedyItems([{ productId: p.id, grams }]);
          fuzz.saveRemedy();
        });
      } else if (kind === 'edit') {
        const t = db.transactions[irand(rng, db.transactions.length)];
        const p = db.products.find(x => x.id === t.productId);
        if (!p) { blocked.edit += 1; log.push({ op: 'edit-bo-qua', ly: 'mat vi thuoc' }); continue; }
        const old = Number(t.qty);
        const stock = Number(p.stock);
        let raw;
        if (t.rx) {
          const thang = Number(t.thang) > 0 ? Number(t.thang) : 1;
          const maxG = Math.floor((old + stock) / thang * 10000) / 10;
          if (maxG < 0.5) { blocked.edit += 1; log.push({ op: 'edit-bo-qua', ly: 'khong du ton' }); continue; }
          raw = qtyStep(rng, 0.5, maxG, 0.1);
        } else if (t.type === 'BAN') {
          if (old + stock < 0.01) { blocked.edit += 1; log.push({ op: 'edit-bo-qua', ly: 'khong du ton' }); continue; }
          raw = qtyStep(rng, 0.01, old + stock, 0.01);
        } else {
          const lo = Math.max(0.01, Math.round((old - stock) * 100) / 100);
          if (old + 2 < lo) { blocked.edit += 1; log.push({ op: 'edit-bo-qua', ly: 'tranh ton am' }); continue; }
          raw = qtyStep(rng, lo, old + 2, 0.01);
        }
        const from = t.rx ? Number(t.g) : old;
        run('edit', { op: 'edit', id: t.id, type: t.type, rx: !!t.rx, thang: t.thang || 1, from, to: raw }, log, () => {
          fuzz.openTxEdit(t.id);
          dom.set('txEditQty', String(raw));
          fuzz.saveTxEdit();
        });
      } else if (kind === 'delete') {
        const ok = db.transactions.filter(t => {
          const p = db.products.find(x => x.id === t.productId);
          if (!p || t.type !== 'NHAP') return true;
          return Number(p.stock) - Number(t.qty) >= -1e-9;
        });
        if (!ok.length) { blocked.delete += 1; log.push({ op: 'delete-bo-qua', ly: 'tranh ton am' }); continue; }
        const t = ok[irand(rng, ok.length)];
        run('delete', { op: 'delete', id: t.id, type: t.type, qty: t.qty }, log, () => fuzz.delTx(t.id));
      } else {
        const ps = db.products.filter(p => p.stock >= 0.04);
        const p = ps[irand(rng, ps.length)];
        const kg1 = qtyStep(rng, 0.01, Math.min(0.5, p.stock / 2), 0.01);
        run('retail', { op: 'merge-ban-1', pid: p.id, kg: kg1 }, log, () => {
          fuzz.setRetailItems([{ pid: p.id, kg: kg1, amount: Math.round(kg1 * 100000) }]);
          fuzz.saveRetail();
          const t = fuzz.getDb().transactions.at(-1);
          if (t && t.productId === p.id && t.type === 'BAN') delete t.retail;
        });
        const left = fuzz.getDb().products.find(x => x.id === p.id);
        if (!left || left.stock < 0.01) { blocked.merge += 1; log.push({ op: 'merge-bo-qua', ly: 'khong du ton' }); continue; }
        const kg2 = qtyStep(rng, 0.01, Math.min(0.5, left.stock), 0.01);
        run('retail', { op: 'merge-ban-2', pid: p.id, kg: kg2 }, log, () => {
          fuzz.setRetailItems([{ pid: p.id, kg: kg2, amount: Math.round(kg2 * 100000) }]);
          fuzz.saveRetail();
          const t = fuzz.getDb().transactions.at(-1);
          if (t && t.productId === p.id && t.type === 'BAN') delete t.retail;
        });
        run('merge', { op: 'merge' }, log, () => {
          dom.checks.length = 0;
          for (const g of fuzz.mergeCandidates()) {
            dom.checks.push({ checked: true, getAttribute(name){ return name === 'data-key' ? g.key : null; } });
          }
          fuzz.mergeDo();
        });
      }
    }
  }

  console.log('Độ phủ seed ' + SEED);
  console.log('loại\tchạy\tchặn\tkhông đổi');
  for (const k of ['nhap', 'retail', 'remedy', 'edit', 'delete', 'merge']) {
    console.log(k + '\t' + ran[k] + '\t' + blocked[k] + '\t' + idle[k]);
  }
  for (const k of Object.keys(ran)) assert.ok(ran[k] > 0, k + ' không chạy lần nào');
  assert.ok(ran.edit > blocked.edit + idle.edit, 'sửa bị bỏ qua nhiều hơn số lần chạy');
  assert.ok(ran.merge > blocked.merge + idle.merge, 'gộp bị bỏ qua nhiều hơn số lần chạy');
  assert.ok(ran.remedy > blocked.remedy + idle.remedy, 'đơn thuốc chén bị bỏ qua nhiều hơn số lần chạy');
});

test('cảnh báo tồn đọc stockDrift, không đọc câu tiếng Việt', async () => {
  const client = loadClient({
    fetch: async () => ({
      status: 200,
      json: async () => ({
        success: true,
        updatedAt: 1,
        warnings: ['"Hồng Hoa": tồn 1.43 khác nhập − bán 1.42 (lệch 0.01)'],
        stockDrift: [{ id: 'P1', name: 'Hồng Hoa', stock: 1.43, calc: 1.42 }]
      })
    })
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  assert.equal(await client.pushState(false, false), true);
  assert.equal(client.getStockWarnText(), 'Tồn lệch so với lịch sử nhập − bán: Hồng Hoa.');
  const first = client.getStockWarnText();
  assert.equal(await client.pushState(false, false), true);
  assert.equal(client.getStockWarnText(), first);
});

test('câu warnings không có stockDrift thì không hiện toast tồn', async () => {
  const client = loadClient({
    fetch: async () => ({
      status: 200,
      json: async () => ({
        success: true,
        updatedAt: 1,
        warnings: ['"Hồng Hoa": tồn 1.43 khác nhập − bán 1.42 (lệch 0.01)']
      })
    })
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  assert.equal(await client.pushState(false, false), true);
  assert.equal(client.getStockWarnText(), '');
});

test('toast tồn lệch chỉ nêu 3 tên rồi số vị còn lại', async () => {
  const stockDrift = ['Một', 'Hai', 'Ba', 'Bốn', 'Năm'].map((name, i) => ({
    id: 'P' + i, name, stock: 2, calc: 1
  }));
  const client = loadClient({
    fetch: async () => ({
      status: 200,
      json: async () => ({ success: true, updatedAt: 1, stockDrift })
    })
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  assert.equal(await client.pushState(false, false), true);
  assert.equal(client.getStockWarnText(), 'Tồn lệch so với lịch sử nhập − bán: Một, Hai, Ba và 2 vị khác.');
});

function badgeDoc() {
  function mkBadge() {
    const el = makeEl();
    el.hidden = true; el._t = ''; el.kids = []; el.href = '';
    el.appendChild = function(k) { el.kids.push(k); return k; };
    Object.defineProperty(el, 'textContent', {
      get() { return el._t + el.kids.map(k => k.textContent).join(''); },
      set(v) { el._t = String(v); el.kids = []; }
    });
    return el;
  }
  const badge = mkBadge();
  const drop = mkBadge();
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(sel) { return sel === '#syncBadge' ? badge : sel === '#syncDiscard' ? drop : null; },
    querySelectorAll() { return []; },
    createElement() { return mkBadge(); },
    createElementNS() { return makeEl(); },
    createTextNode(s) { return { textContent: String(s) }; },
    addEventListener() {}, removeEventListener() {}
  };
  return { doc, badge, drop };
}

test('401 pushState (page.js thật): giữ dirty, authLost, không hẹn lại, ẩn nút bỏ nháp', async () => {
  const { doc, badge, drop } = badgeDoc();
  let fetches = 0;
  const client = loadClient({
    document: doc,
    setTimeout() { return 0; }, clearTimeout() {},
    fetch: async () => { fetches++; return { status: 401, json: async () => ({ success: false, error: 'Thiết bị chưa được duyệt', code: 'device_not_approved' }) }; }
  });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10, moneyUnit: 'dong' });
  client.setBase(10);
  client.setDirty(true);
  const ok = await client.pushState(true, false);
  assert.equal(ok, false);
  assert.equal(client.isDirty(), true);
  assert.equal(client.isAuthLost(), true);
  assert.equal(client.isSyncRejected(), false);
  assert.equal(client.hasSyncRetry(), false);
  assert.equal(drop.hidden, true);
  assert.equal(badge.hidden, false);
  assert.match(badge.textContent, /chưa được duyệt hoặc đã bị thu hồi/);
  assert.match(badge.textContent, /Thay đổi chưa gửi vẫn được giữ/);
  assert.equal(badge.kids[0].href, '/auth/join');
  assert.equal(fetches, 1);
});

test('401 pullState thủ công (page.js thật): không ghi đè db, không đổi dirty', async () => {
  const { doc } = badgeDoc();
  const client = loadClient({
    document: doc,
    fetch: async () => ({ status: 401, json: async () => ({ success: false, error: 'Thiết bị chưa được duyệt', code: 'device_not_approved' }) })
  });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10, moneyUnit: 'dong' });
  client.setBase(1);
  client.setDirty(true);
  const before = JSON.stringify(client.getDb());
  const ok = await client.pullState(true, true);
  assert.equal(ok, false);
  assert.equal(JSON.stringify(client.getDb()), before);
  assert.equal(client.isDirty(), true);
  assert.equal(client.isAuthLost(), true);
  assert.equal(client.isSyncRejected(), false);
});

test('401 autoRefresh (page.js thật): một lần rồi không gọi fetch nữa', async () => {
  const { doc } = badgeDoc();
  let fetches = 0;
  const client = loadClient({
    document: doc,
    fetch: async () => { fetches++; return { status: 401, json: async () => ({ success: false, error: 'Thiết bị chưa được duyệt', code: 'device_not_approved' }) }; }
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  client.setDirty(false);
  assert.equal(await client.autoRefresh(), false);
  assert.equal(client.isAuthLost(), true);
  const n = fetches;
  assert.equal(await client.autoRefresh(), false);
  assert.equal(fetches, n);
});

test('401 discard khi authLost (page.js thật): không confirm, không fetch, giữ nháp', async () => {
  const { doc } = badgeDoc();
  let confirms = 0, fetches = 0;
  const client = loadClient({
    document: doc,
    confirm() { confirms++; return true; },
    fetch: async () => { fetches++; return { status: 200, json: async () => ({ success: true, data: { products: [], transactions: [], prescriptions: [], updatedAt: 9, moneyUnit: 'dong' } }) }; }
  });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10, moneyUnit: 'dong' });
  client.setBase(10);
  client.setDirty(true);
  client.setAuthLost(true);
  assert.equal(await client.discardUnsynced(), false);
  assert.equal(confirms, 0);
  assert.equal(fetches, 0);
  assert.equal(client.isDirty(), true);
  assert.equal(client.isAuthLost(), true);
});

test('401 discard thành công (page.js thật): tải file nháp, lấy bản máy chủ, xóa cờ và huy hiệu', async () => {
  const { doc, badge, drop } = badgeDoc();
  const client = loadClient({
    document: doc,
    confirm: () => true,
    fetch: async () => ({ status: 200, json: async () => ({ success: true, data: { products: [{ id: 'p1', name: 'May chu', stock: 2, costPrice: 2 }], transactions: [], prescriptions: [], updatedAt: 900, moneyUnit: 'dong' } }) })
  });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10, moneyUnit: 'dong' });
  client.setBase(10);
  client.setDirty(true);
  client.setDirtySince(1);
  client.setSyncErrorShown(true);
  client.setSyncRejected(true);
  client.setSyncDetail('trùng tên');
  client.renderSyncBadge();
  assert.equal(drop.hidden, false);
  assert.equal(await client.discardUnsynced(), true);
  /* B15: renderAll không còn viết hoa tên trong db; tên lấy từ máy chủ giữ nguyên. */
  assert.equal(client.getDb().products[0].name, 'May chu');
  assert.equal(client.isDirty(), false);
  assert.equal(client.isSyncRejected(), false);
  assert.equal(badge.hidden, true);
  assert.equal(drop.hidden, true);
});

test('401 discard thất bại khi pullState mất mạng (page.js thật): huy hiệu, nút và nháp vẫn còn', async () => {
  const { doc, badge, drop } = badgeDoc();
  const client = loadClient({
    document: doc,
    confirm: () => true,
    fetch: async () => { throw new Error('mất mạng'); }
  });
  client.setDb({ products: [{ id: 'p1', name: 'Local', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 10, moneyUnit: 'dong' });
  client.setBase(10);
  client.setDirty(true);
  client.setDirtySince(1);
  client.setSyncErrorShown(true);
  client.setSyncRejected(true);
  client.setSyncDetail('trùng tên');
  client.renderSyncBadge();
  const before = JSON.stringify(client.getDb());
  assert.equal(await client.discardUnsynced(), false);
  assert.equal(client.isDirty(), true);
  assert.equal(client.isSyncRejected(), true);
  assert.equal(client.isSyncErrorShown(), true);
  assert.equal(JSON.stringify(client.getDb()), before);
  assert.equal(badge.hidden, false);
  assert.equal(drop.hidden, false);
  assert.equal(client.isAuthLost(), false);
});
function fakeClock(y, moIdx, d, h) {
  const RealDate = Date;
  let now = new RealDate(y, moIdx, d, h || 12, 0, 0);
  function FakeDate(...args) {
    if (args.length === 0) return new RealDate(now.getTime());
    return new RealDate(...args);
  }
  FakeDate.prototype = RealDate.prototype;
  FakeDate.now = () => now.getTime();
  FakeDate.parse = RealDate.parse.bind(RealDate);
  FakeDate.UTC = RealDate.UTC.bind(RealDate);
  FakeDate.setNow = (yy, mm, dd, hh) => { now = new RealDate(yy, mm, dd, hh == null ? 12 : hh, 0, 0); };
  return FakeDate;
}

function dateDoc() {
  function mkInput(id) {
    const attrs = {};
    const listeners = {};
    const el = {
      id, value: '', tagName: 'INPUT', checked: false, disabled: false,
      style: {}, dataset: {}, children: [],
      classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute(k, v) { attrs[k] = String(v); },
      getAttribute(k) { return k in attrs ? attrs[k] : null; },
      removeAttribute() {}, hasAttribute() { return false; },
      appendChild(c) { el.children.push(c); return c; },
      remove() {}, focus() {}, select() {}, click() {},
      addEventListener(ev, fn) { (listeners[ev] = listeners[ev] || []).push(fn); },
      removeEventListener() {},
      fire(ev) { (listeners[ev] || []).forEach(fn => fn()); },
      querySelector() { return null; }, querySelectorAll() { return []; }
    };
    return el;
  }
  const els = {
    '#retailDate': mkInput('retailDate'),
    '#retailDateNative': mkInput('retailDateNative'),
    '#remedyDate': mkInput('remedyDate'),
    '#remedyDateNative': mkInput('remedyDateNative'),
    '#chartYear': mkInput('chartYear'),
    '#impSearch': mkInput('impSearch'),
    '#impSearchList': mkInput('impSearchList'),
    '#expMonth': mkInput('expMonth'),
    '#expMonthNative': mkInput('expMonthNative'),
    '#statExportDay': makeEl()
  };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(sel) { return els[sel] || null; },
    querySelectorAll() { return []; },
    createElement() { return makeEl(); },
    createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  return { doc, els };
}

test('ngày tự động: init D, qua D+1 gọi refresh thì cả hai ô chuyển sang D+1', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-07');
  assert.equal(client.getDateInput('remedyDate'), '2026-11-07');
  FakeDate.setNow(2026, 10, 8, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-08');
  assert.equal(client.getDateInput('remedyDate'), '2026-11-08');
  assert.equal(client.getLastAuto('retailDate'), '2026-11-08');
});

test('ngày tự động: không sự kiện nào, saveRetail và saveRemedy vẫn ghi D+1', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {}, fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) }) });
  client.initDates();
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 10, costPrice: 1000 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  FakeDate.setNow(2026, 10, 8, 12);
  client.setRetailItems([{ pid: 'p1', kg: 1, amount: 2000 }]);
  client.saveRetail();
  assert.equal(client.getDb().transactions.at(-1).date, '2026-11-08');
  assert.equal(client.getDateInput('retailDate'), '2026-11-08');
});

test('ngày tự động: người dùng chọn D sau nửa đêm và D-2 trước nửa đêm đều được giữ', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.setDateInput('retailDate', '2026-11-05');
  client.setLastAuto('retailDate', null);
  FakeDate.setNow(2026, 10, 8, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-05');
  client.setDateInput('retailDate', '2026-11-07');
  client.setLastAuto('retailDate', null);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-07');
  client.setDateInput('remedyDate', '2026-11-08');
  client.setLastAuto('remedyDate', null);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('remedyDate'), '2026-11-08');
});

test('ngày tự động: ô đang focus không bị đổi', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.setActiveId('retailDate');
  assert.equal(doc.activeElement, els['#retailDate']);
  FakeDate.setNow(2026, 10, 8, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-07');
  assert.equal(client.getDateInput('remedyDate'), '2026-11-08');
});

test('todayISO đúng 00:30 giờ Việt Nam và saveNhap không đổi hành vi', () => {
  const FakeDate = fakeClock(2026, 10, 8, 0);
  FakeDate.setNow(2026, 10, 8, 0);
  const { doc } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {}, fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) }) });
  assert.equal(client.todayISO(), '2026-11-08');
  client.initDates();
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  client.setNhapList([{ pid: null, name: 'A', qty: 1, price: 1000 }]);
  client.saveNhap();
  assert.equal(client.getDb().transactions.at(-1).date, '2026-11-08');
  assert.equal(client.getDb().transactions.at(-1).type, 'NHAP');
});

test('handler ô chữ: chọn ngày cũ bằng change, sang ngày mới vẫn giữ ngày cũ', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.bindDateInput('retailDate');
  els['#retailDate'].value = '05/11/2026';
  els['#retailDate'].fire('change');
  assert.equal(client.getDateInput('retailDate'), '2026-11-05');
  assert.equal(client.getLastAuto('retailDate'), null);
  FakeDate.setNow(2026, 10, 8, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-05');
});

test('handler ô chữ: chọn đúng hôm nay, sang ngày mới thì ô theo ngày mới', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  FakeDate.setNow(2026, 10, 8, 12);
  client.bindDateInput('retailDate');
  els['#retailDate'].value = '08/11/2026';
  els['#retailDate'].fire('change');
  assert.equal(client.getDateInput('retailDate'), '2026-11-08');
  assert.equal(client.getLastAuto('retailDate'), '2026-11-08');
  FakeDate.setNow(2026, 10, 9, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-09');
});

test('handler bộ chọn gốc: chọn ngày cũ bằng nat, sang ngày mới vẫn giữ', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.bindDateInput('retailDate');
  els['#retailDateNative'].value = '2026-11-05';
  els['#retailDateNative'].fire('change');
  assert.equal(client.getDateInput('retailDate'), '2026-11-05');
  assert.equal(client.getLastAuto('retailDate'), null);
  FakeDate.setNow(2026, 10, 8, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-05');
});

test('handler bộ chọn gốc: chọn đúng hôm nay, sang ngày mới thì ô theo', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.bindDateInput('remedyDate');
  FakeDate.setNow(2026, 10, 8, 12);
  els['#remedyDateNative'].value = '2026-11-08';
  els['#remedyDateNative'].fire('change');
  assert.equal(client.getDateInput('remedyDate'), '2026-11-08');
  assert.equal(client.getLastAuto('remedyDate'), '2026-11-08');
  FakeDate.setNow(2026, 10, 9, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('remedyDate'), '2026-11-09');
});

test('handler ô chữ: để trống về hôm nay, văn bản sai giữ ngày cũ', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.bindDateInput('retailDate');
  els['#retailDate'].value = '   ';
  els['#retailDate'].fire('change');
  assert.equal(client.getDateInput('retailDate'), '2026-11-07');
  assert.equal(client.getLastAuto('retailDate'), '2026-11-07');
  els['#retailDate'].value = 'không phải ngày';
  els['#retailDate'].fire('change');
  assert.equal(client.getDateInput('retailDate'), '2026-11-07');
});

test('ô năm biểu đồ: qua hai ranh giới năm liên tiếp vẫn theo', () => {
  const FakeDate = fakeClock(2026, 11, 31, 12);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  assert.equal(els['#chartYear'].value, '2026');
  assert.equal(typeof client.getLastChartYear(), 'string');
  FakeDate.setNow(2027, 0, 1, 12);
  client.refreshAutoDates();
  assert.equal(els['#chartYear'].value, '2027');
  assert.equal(client.getLastChartYear(), '2027');
  FakeDate.setNow(2028, 0, 1, 12);
  client.refreshAutoDates();
  assert.equal(els['#chartYear'].value, '2028');
  assert.equal(client.getLastChartYear(), '2028');
});

test('ô đang mở bộ chọn gốc (Native) không bị đổi', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.setActiveId('retailDateNative');
  FakeDate.setNow(2026, 10, 8, 12);
  client.refreshAutoDates();
  assert.equal(client.getDateInput('retailDate'), '2026-11-07');
  assert.equal(client.getDateInput('remedyDate'), '2026-11-08');
});

test('giá nhập gần nhất: hai lần nhập 120 và 135 hiện (135)', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 10, costPrice: 100000 }], transactions: [
    { id: 't1', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 120000, total: 120000, ts: 1000 },
    { id: 't2', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 135000, total: 135000, ts: 2000 }
  ], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  const m = client.latestImportMap();
  assert.equal(m['p1'], 135000);
  assert.equal(client.importParen(m['p1']), '(135)');
});

test('giá nhập: chỉ có costPrice thì dùng costPrice, không có gì thì không hiện', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 42600 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  const m = client.latestImportMap();
  assert.equal(m['p1'], undefined);
  const client2 = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  client2.setDb({ products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 0 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  assert.equal(client2.latestImportMap()['p1'], undefined);
  assert.equal(client.importParen(0), '');
  assert.equal(client.importParen(42600), '(42,6)');
});

test('giá vốn lịch sử: cost chia qty theo nghìn, không có vốn thì ẩn', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  assert.equal(client.costParen(27000, 0.2), '(135)');
  assert.equal(client.costParen(undefined, 1), '');
  assert.equal(client.costParen(13500, 0), '');
});

test('lịch sử bán: mặc định trang 1 đúng 10 đơn gần nhất, đơn thứ 11 nằm sau, đơn 12 dòng gộp thành 1, dòng không oid là single', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  const mk = (n, date, ts) => ({ id: 't' + n, date, type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts, oid: 'OD_' + n, oname: 'Bán lẻ' });
  const txs = [];
  txs.push(mk(1, '2026-11-08', 5001), mk(2, '2026-11-08', 5002));
  for (let i = 3; i <= 7; i++) txs.push(mk(i, '2026-11-07', 4000 + i));
  for (let i = 8; i <= 10; i++) txs.push(mk(i, '2026-11-06', 3000 + i));
  for (let i = 11; i <= 14; i++) txs.push(mk(i, '2026-11-05', 2000 + i));
  // một đơn 12 dòng nhưng cùng oid
  txs.push(mk('big', '2026-11-04', 1000));
  for (let i = 0; i < 11; i++) txs.push({ id: 'big' + i, date: '2026-11-04', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 999, oid: 'OD_big', oname: 'Bán lẻ' });
  // một dòng không oid
  txs.push({ id: 'single', date: '2026-11-04', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 900, retail: true });
  // đơn thuốc chén (rx)
  txs.push({ id: 'rx1', date: '2026-11-04', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 901, rx: true });
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 100, costPrice: 1000 }], transactions: txs, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  const data = client.historyData('exp', null, true);
  // 17 dòng: 14 đơn OD_1..OD_14, 1 đơn gộp OD_big (12 dòng), 2 dòng không oid (single, rx1)
  assert.equal(data.rows.length, 17);
  // Trang 1 = 10 dòng mới nhất: 2 hôm nay + 5 hôm qua + 3 hôm kia
  const firstPage = data.rows.slice(0, 10).map(r => r.group ? r.oid : r.tx.id);
  // Mảng từ vm khác realm nên so bằng JSON, không dùng deepStrictEqual.
  assert.equal(JSON.stringify(firstPage), JSON.stringify(['OD_2', 'OD_1', 'OD_7', 'OD_6', 'OD_5', 'OD_4', 'OD_3', 'OD_10', 'OD_9', 'OD_8']));
  // Đơn thứ 11 (ngày 05) không nằm trong trang 1
  assert.equal(data.rows[10].oid, 'OD_14');
  assert.equal(data.rows[10].date, '2026-11-05');
  assert.equal(firstPage.includes('OD_14'), false);
  // Đơn 12 dòng cùng oid gộp thành đúng 1 dòng, n = 12
  const big = data.rows.filter(r => r.oid === 'OD_big');
  assert.equal(big.length, 1);
  assert.equal(big[0].group, true);
  assert.equal(big[0].n, 12);
  // Dòng không oid: mỗi dòng là một single, không gộp
  const singles = data.rows.filter(r => r.single).map(r => r.tx.id).sort();
  assert.equal(JSON.stringify(singles), JSON.stringify(['rx1', 'single']));
});

test('lịch sử bán: trang 1 chỉ hiện 10 dòng, bấm sang trang 2 (nút Sau) hiện 5 dòng còn lại', () => {
  const els = new Map();
  function ensure(id) {
    if (!els.has(id)) els.set(id, { id, value: '', textContent: '', hidden: false, style: {}, dataset: {}, children: [], classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } }, setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; }, appendChild(c){ els.get(id).children.push(c); return c; }, remove(){}, focus(){}, select(){}, click(){}, addEventListener(){}, removeEventListener(){}, querySelector(){ return null; }, querySelectorAll(){ return []; } });
    return els.get(id);
  }
  ensure('expBody'); ensure('expCount'); ensure('expPager');
  const body = els.get('expBody');
  body.appendChild = function(c){ body.children.push(c); return c; };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(sel) { const m = /^#([\w-]+)$/.exec(String(sel)); return m && els.has(m[1]) ? els.get(m[1]) : null; },
    querySelectorAll() { return []; },
    createElement(tag) { const e = makeEl(); e.tagName = String(tag || '').toUpperCase(); e.appendChild = function(c){ e.children.push(c); return c; }; return e; },
    createElementNS() { return makeEl(); },
    createTextNode(s) { return { textContent: String(s) }; },
    addEventListener() {}, removeEventListener() {}
  };
  const client = loadClient({ document: doc, Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  const txs = [];
  for (let i = 0; i < 15; i++) txs.push({ id: 'p' + i, date: '2026-11-08', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 5000 + i, oid: 'OD_' + i, oname: 'Bán lẻ' });
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 100, costPrice: 1000 }], transactions: txs, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.renderHistory('exp');
  assert.equal(body.children.length, 10, 'trang 1 chỉ 10 dòng');
  // Nút "Sau" (data-action=page, kind=exp, page=2) chạy: expPage = 2; renderHistory('exp')
  body.children.length = 0;
  client.setExpPage(2);
  client.renderHistory('exp');
  assert.equal(body.children.length, 5, 'trang 2 hiện 5 dòng còn lại (15 đơn - 10)');
});

test('lịch sử nhập: tìm "cam" ra Cam Thảo không dấu, xóa ô về 10 gần nhất, gợi ý đúng', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  const txs = [
    { id: 'i1', date: '2026-11-08', type: 'NHAP', productId: 'p1', qty: 1, price: 10000, total: 10000, ts: 3000 },
    { id: 'i2', date: '2026-11-07', type: 'NHAP', productId: 'p2', qty: 1, price: 10000, total: 10000, ts: 2000 },
    { id: 'i3', date: '2026-11-06', type: 'NHAP', productId: 'p1', qty: 1, price: 11000, total: 11000, ts: 1000 },
    { id: 'g1', date: '2026-11-05', type: 'NHAP', productId: 'p1', qty: 1, price: 10000, total: 10000, ts: 500, oid: 'IM_g1' },
    { id: 'g2', date: '2026-11-05', type: 'NHAP', productId: 'p2', qty: 1, price: 10000, total: 10000, ts: 501, oid: 'IM_g1' }
  ];
  client.setDb({ products: [{ id: 'p1', name: 'Cam Thảo', stock: 10, costPrice: 10000 }, { id: 'p2', name: 'A', stock: 5, costPrice: 5000 }], transactions: txs, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  const all = client.historyData('imp', null, true);
  // 3 đơn lẻ + 1 đơn gộp (IM_g1) = 4
  assert.equal(all.rows.length, 4);
  const found = client.historyData('imp', null, false, 'cam');
  // i1 + i3 + đơn gộp IM_g1 = 3
  assert.equal(found.rows.length, 3);
  const cleared = client.historyData('imp', null, true, '');
  assert.equal(cleared.rows.length, 4);
  assert.equal(client.normSearch('Cam Thảo'), client.normSearch('cam thao'));
});

test('(a) giá vốn lịch sử không đổi khi nhập thêm giá mới, tờ mới hiện giá mới', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  const txs = [
    { id: 'n1', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 135000, total: 135000, ts: 1000 },
    { id: 'b1', date: '2026-11-02', type: 'BAN', productId: 'p1', qty: 1, price: 200000, total: 200000, cost: 135000, ts: 2000, retail: true }
  ];
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 10, costPrice: 135000 }], transactions: txs.slice(), prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  assert.equal(client.costParen(135000, 1), '(135)');
  // thêm lần nhập giá mới 150
  client.getDb().transactions.push({ id: 'n2', date: '2026-11-03', type: 'NHAP', productId: 'p1', qty: 1, price: 150000, total: 150000, ts: 3000 });
  const m = client.latestImportMap();
  assert.equal(client.importParen(m['p1']), '(150)');
  const b = client.getDb().transactions.find(t => t.id === 'b1');
  assert.equal(client.costParen(b.cost, b.qty), '(135)');
});

test('(c) dòng không vốn hoặc số lượng 0 không hiện ngoặc, không NaN/Infinity', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  for (const [c, q] of [[undefined, 1], [null, 1], [135000, 0], [135000, -1], [0, 1]]) {
    const v = client.costParen(c, q);
    assert.equal(v, '');
    assert.ok(!v.includes('NaN') && !v.includes('Infinity'));
  }
});

test('(e) phân trang: trang 3 mở rộng khi có hơn 20 đơn', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  const txs = [];
  for (let i = 0; i < 25; i++) txs.push({ id: 't' + i, date: '2026-11-08', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 5000 + i, oid: 'OD_' + i, oname: 'Bán lẻ' });
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 100, costPrice: 1000 }], transactions: txs, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  const d = client.historyData('exp', null, true);
  assert.equal(d.rows.length, 25);
  assert.equal(d.rows.slice(0, 10).length, 10);
  assert.equal(d.rows.slice(20, 30).length, 5);
  assert.equal(d.rows[10].ts, 5014);
  assert.equal(d.rows[20].ts, 5004);
});

test('(f) bindEvents chạy được khi DOM không có phần tử tháng của lịch sử nhập', () => {
  const { doc } = dateDoc();
  // dateDoc không có #impMonth, chỉ có #impSearch và #expMonth -> không lỗi
  const client = loadClient({ document: doc, Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  assert.ok(client);
  assert.equal(doc.querySelector('#impMonth'), null);
  assert.ok(doc.querySelector('#impSearch'));
});

test('(b) sửa số lượng dòng bán lẻ 1kg lên 2kg thì con số vốn vẫn là (135)', () => {
  const dom = stockDom();
  const client = loadClient({
    document: dom.document,
    Date: fakeClock(2026, 10, 8, 12),
    confirm: () => true,
    fetch: () => Promise.resolve({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) })
  });
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 10, costPrice: 135000 }], transactions: [{ id: 'b1', date: '2026-11-02', type: 'BAN', productId: 'p1', qty: 1, price: 200000, total: 200000, cost: 135000, ts: 2000, retail: true }], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  client.openTxEdit('b1');
  dom.set('txEditQty', '2');
  client.saveTxEdit();
  const t = client.getDb().transactions.find(x => x.id === 'b1');
  assert.equal(t.qty, 2);
  assert.equal(t.cost, 270000);
  assert.equal(client.costParen(t.cost, t.qty), '(135)');
});

test('(d) dòng thuộc đơn thuốc chén không hiện con số vốn', () => {
  function historyDoc() {
    const els = new Map();
    function ensure(id) {
      if (!els.has(id)) els.set(id, { id, value: '', textContent: '', hidden: false, style: {}, dataset: {}, children: [], classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } }, setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; }, appendChild(c){ els.get(id).children.push(c); return c; }, remove(){}, focus(){}, select(){}, click(){}, addEventListener(){}, removeEventListener(){}, querySelector(){ return null; }, querySelectorAll(){ return []; } });
      return els.get(id);
    }
    ensure('expBody'); ensure('expCount'); ensure('expPager');
    // ghi đè appendChild của body để bắt tr
    els.get('expBody').appendChild = function(c){ els.get('expBody').children.push(c); return c; };
    const doc = {
      readyState: 'loading', hidden: false, activeElement: null,
      documentElement: makeEl(), body: makeEl(),
      querySelector(sel) {
        const m = /^#([\w-]+)$/.exec(String(sel));
        return m && els.has(m[1]) ? els.get(m[1]) : null;
      },
      querySelectorAll(sel) {
        if (sel === '#mergeList input[type=checkbox]') return [];
        return [];
      },
      createElement(tag) {
        const e = makeEl();
        e.tagName = String(tag || '').toUpperCase();
        e.appendChild = function(c){ e.children.push(c); return c; };
        return e;
      },
      createElementNS(ns, tag) { return makeEl(); },
      createTextNode(s) { return { textContent: String(s) }; },
      addEventListener() {}, removeEventListener() {}
    };
    return { doc, els };
  }
  const { doc, els } = historyDoc();
  const client = loadClient({
    document: doc,
    Date: fakeClock(2026, 10, 8, 12),
    setTimeout() { return 0; }, clearTimeout() {},
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) })
  });
  // rx mới nhất (ts 3000) nên lên đầu, retail cũ hơn (ts 2000) xuống sau
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 100, costPrice: 1000 }],
    transactions: [
      { id: 'r1', date: '2026-11-08', type: 'BAN', productId: 'p1', qty: 1, price: 2000, total: 2000, cost: 135000, ts: 3000, rx: true },
      { id: 'b1', date: '2026-11-08', type: 'BAN', productId: 'p1', qty: 1, price: 2000, total: 2000, cost: 135000, ts: 2000, retail: true }
    ], prescriptions: [], updatedAt: 1, moneyUnit: 'dong'
  });
  client.renderHistory('exp');
  const body = els.get('expBody');
  assert.equal(body.children.length, 2);
  // hàng đầu là rx (ts mới nhất) -> qty cell không có span con
  const qtyRx = body.children[0].children[2];
  assert.equal(qtyRx.children.length, 0, 'đơn thuốc chén không hiện ngoặc vốn');
  const qtyRetail = body.children[1].children[2];
  assert.equal(qtyRetail.children.length, 1, 'bán lẻ hiện ngoặc vốn');
});
// (g) phân trang tìm kiếm đã bao trong lịch sử nhập: tìm ra 3 từ dữ liệu gộp, hai trang 10 + phần còn lại
test('(g) tìm kiếm lịch sử nhập phân trang trên toàn bộ kết quả', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  const txs = [];
  for (let i = 0; i < 15; i++) txs.push({ id: 's' + i, date: '2026-11-08', type: 'NHAP', productId: 'p1', qty: 1, price: 10000, total: 10000, ts: 5000 + i });
  client.setDb({ products: [{ id: 'p1', name: 'Cam Thảo', stock: 100, costPrice: 10000 }], transactions: txs, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  const f = client.historyData('imp', null, false, 'cam');
  assert.equal(f.rows.length, 15);
  assert.equal(f.rows.slice(0, 10).length, 10);
  assert.equal(f.rows.slice(10, 20).length, 5);
});


test('parseBackup từ chối cùng mẫu server từ chối (tên, số, ngày, grams, thang)', () => {
  const base = () => ({
    app: 'quan-ly-kho',
    data: {
      moneyUnit: 'dong',
      products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 1 }],
      transactions: [],
      prescriptions: []
    }
  });
  const cases = [];
  let c = base(); c.data.products[0].name = 'A'.repeat(201); cases.push(['tên 201', c]);
  c = base(); c.data.products[0].stock = 1e6 + 1; cases.push(['stock lớn', c]);
  c = base(); c.data.transactions.push({ id: 't1', date: '2026-01-01', type: 'NHAP', productId: 'p1', qty: 1e308, price: 1, total: 1 }); cases.push(['qty 1e308', c]);
  c = base(); c.data.transactions.push({ id: 't1', date: '2026-01-01', type: 'NHAP', productId: 'p1', qty: '1e309', price: 1, total: 1 }); cases.push(['qty 1e309', c]);
  c = base(); c.data.transactions.push({ id: 't1', date: '2026-01-01', type: 'NHAP', productId: 'p1', qty: 0, price: 1, total: 1 }); cases.push(['qty 0', c]);
  c = base(); c.data.transactions.push({ id: 't1', date: '2026-13-40', type: 'NHAP', productId: 'p1', qty: 1, price: 1, total: 1 }); cases.push(['ngày sai', c]);
  c = base(); c.data.transactions.push({ id: 't1', date: '2026-01-01', type: 'NHAP', productId: 'p1', qty: 1, price: 1, total: 1e12 + 1 }); cases.push(['total lớn', c]);
  c = base(); c.data.prescriptions.push({ id: 'r1', name: 'D', total: 1, thang: 1, items: [{ productId: 'p1', grams: 0 }] }); cases.push(['grams 0', c]);
  c = base(); c.data.prescriptions.push({ id: 'r1', name: 'D', total: 1, thang: 0, items: [{ productId: 'p1', grams: 1 }] }); cases.push(['thang 0', c]);
  cases.forEach(([label, state]) => {
    assert.equal(app.parseBackup(JSON.stringify(state)), null, label);
  });
});

test('sanitize cắt tên quá dài và loại giao dịch ngoài luật', () => {
  const out = app.sanitize({
    products: [{ id: 'p1', name: 'A'.repeat(201), stock: 1, costPrice: 1 }],
    transactions: [{ id: 't1', date: '2026-01-01', type: 'NHAP', productId: 'p1', qty: 1e308, price: 1, total: 1 }],
    prescriptions: []
  });
  assert.equal(out.products[0].name.length, 200);
  assert.equal(out.transactions.length, 0);
});

test('qua nửa đêm refreshAutoDates render lại thống kê', () => {
  const FakeDate = fakeClock(2026, 10, 7, 23);
  const { doc, els } = dateDoc();
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.initDates();
  client.setDb({
    products: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong',
    transactions: [{ id: 't1', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 0 }]
  });
  client.renderStats();
  assert.equal(els['#statExportDay'].textContent, '1');
  FakeDate.setNow(2026, 10, 8, 1);
  client.refreshAutoDates();
  assert.equal(els['#statExportDay'].textContent, '0');
});


function presetDoc() {
  const els = {
    '#remedyBody': makeEl(), '#remedyName': makeEl(), '#remedyThang': makeEl(),
    '#remedyUnitPrice': makeEl(), '#remedyPreset': makeEl(),
    '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(sel) { return els[sel] || null; },
    querySelectorAll() { return []; },
    createElement() { return makeEl(); },
    createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  return { doc, els };
}

test('loadPreset cảnh báo khi đơn cũ có vị đã bị xóa', () => {
  const { doc, els } = presetDoc();
  const client = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {} });
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 100 }],
    transactions: [], updatedAt: 0, moneyUnit: 'dong',
    prescriptions: [{ id: 'r1', name: 'D', total: 1000, thang: 1, items: [{ productId: 'p1', grams: 1 }, { productId: 'p2', grams: 2 }] }]
  });
  client.loadPreset('r1');
  assert.equal(client.getRemedyItems().length, 1);
  assert.match(els['#toastMsg'].textContent, /1 vị đã bị xóa/);
});


test('Enter exact chọn đúng vị theo data-pid, không lệch chỉ số khi DOM có mục thêm đầu', () => {
  const input = { value: 'Cam thảo' };
  const buttons = [
    { getAttribute(k) { return k === 'data-pid' ? 'other' : null; }, dispatchEvent() { this.hit = true; } },
    { getAttribute(k) { return k === 'data-pid' ? 'p1' : null; }, dispatchEvent() { this.hit = true; } },
    { getAttribute(k) { return k === 'data-pid' ? 'p2' : null; }, dispatchEvent() { this.hit = true; } }
  ];
  const list = { hidden: false, querySelectorAll(sel) { return sel === '.sug__item' ? buttons : []; } };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#nhapSearch' ? input : s === '#nhapList' ? list : null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: doc });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 1, costPrice: 1 }, { id: 'p2', name: 'Cam thảo khô', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  let prevented = 0;
  c.onSuggestKey({ key: 'Enter', preventDefault() { prevented++; } }, 'nhap');
  assert.equal(prevented, 1);
  assert.equal(buttons[1].hit, true);
  assert.equal(buttons[0].hit, undefined);
  assert.equal(buttons[2].hit, undefined);
});

test('Enter nhiều ứng viên không khớp: không chọn, không preventDefault', () => {
  const input = { value: 'Cam' };
  const buttons = [
    { getAttribute(k) { return k === 'data-pid' ? 'p1' : null; }, dispatchEvent() { this.hit = true; } },
    { getAttribute(k) { return k === 'data-pid' ? 'p2' : null; }, dispatchEvent() { this.hit = true; } }
  ];
  const list = { hidden: false, querySelectorAll(sel) { return sel === '.sug__item' ? buttons : []; } };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#nhapSearch' ? input : s === '#nhapList' ? list : null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: doc });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 1, costPrice: 1 }, { id: 'p2', name: 'Cam chua', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  let prevented = 0;
  c.onSuggestKey({ key: 'Enter', preventDefault() { prevented++; } }, 'nhap');
  assert.equal(prevented, 0);
  assert.equal(buttons.some(b => b.hit), false);
});

test('Enter đúng một ứng viên không khớp: pick nó', () => {
  const input = { value: 'Cam thảo' };
  const buttons = [
    { getAttribute(k) { return k === 'data-pid' ? 'p1' : null; }, dispatchEvent() { this.hit = true; } }
  ];
  const list = { hidden: false, querySelectorAll(sel) { return sel === '.sug__item' ? buttons : []; } };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#nhapSearch' ? input : s === '#nhapList' ? list : null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: doc });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  let prevented = 0;
  c.onSuggestKey({ key: 'Enter', preventDefault() { prevented++; } }, 'nhap');
  assert.equal(prevented, 1);
  assert.equal(buttons[0].hit, true);
});
test('recFix kẹp tồn về 0 khi số lịch sử âm rất nhỏ', () => {
  const client = loadClient({
    setTimeout() { return 0; }, clearTimeout() {},
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) })
  });
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 1e-9, costPrice: 100 }],
    transactions: [{ id: 't1', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 5e-10, price: 1, total: 1, cost: 0 }],
    prescriptions: [], updatedAt: 0, moneyUnit: 'dong'
  });
  client.recFix('p1');
  assert.equal(client.getDb().products[0].stock, 0);
});

test('resetDrafts xóa nháp bán lẻ, đơn thuốc, nhập hàng và dòng đang sửa', () => {
  const client = loadClient({ setTimeout() { return 0; }, clearTimeout() {} });
  client.setRetailItems([{ pid: 'p1', kg: 1, amount: 1 }]);
  client.setRemedyItems([{ productId: 'p1', grams: 1 }]);
  client.setNhapList([{ name: 'A', qty: 1, price: 1 }]);
  client.setTxEdit({ id: 't1' });
  client.resetDrafts();
  assert.equal(client.getRetailItems().length, 0);
  assert.equal(client.getRemedyItems().length, 0);
  assert.equal(client.getNhapList().length, 0);
  assert.equal(client.getTxEdit(), null);
});

test('backupBeforeRestore không chặn tự sao lưu ngày; cloudConflict hủy khi không tải được nháp', async () => {
  class BlockedBlob { constructor(){ throw new Error('blocked'); } }
  const client = loadClient({ Blob: BlockedBlob, confirm: () => true });
  assert.equal(client.backupBeforeRestore(), false);
  assert.equal(client.backupLastDate(), '');
  client.setRetailItems([{ pid: 'p1', kg: 1, amount: 1 }]);
  let fetches = 0;
  const c2 = loadClient({ Blob: BlockedBlob, confirm: () => true, fetch: async () => { fetches++; return { status: 200, json: async () => ({ success: true, updatedAt: 1 }) }; } });
  c2.setRetailItems([{ pid: 'p1', kg: 1, amount: 1 }]);
  assert.equal(await c2.cloudConflict(), false);
  assert.equal(fetches, 0);
});

test('pushState 409 rỗng vẫn mở xung đột, không đánh dấu từ chối vĩnh viễn', async () => {
  let puts = 0, force = '';
  const client = loadClient({
    confirm: () => false,
    setTimeout() { return 0; }, clearTimeout() {},
    fetch: async (url, opts = {}) => {
      if ((opts.method || 'GET') === 'PUT') {
        puts++;
        force = opts.headers && opts.headers['X-Force'] || '';
        if (puts === 1) return { status: 409, json: async () => { throw new Error('empty'); } };
        return { status: 200, json: async () => ({ success: true, updatedAt: 2 }) };
      }
      return { status: 200, json: async () => ({ success: true, data: { products: [], transactions: [], prescriptions: [], updatedAt: 2, moneyUnit: 'dong' } }) };
    }
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  client.setBase(1);
  await client.pushState(false, false);
  assert.equal(puts, 2);
  assert.equal(force, '1');
  assert.equal(client.isSyncRejected(), false);
});

test('saveTxEdit NHAP cũ không đổi costPrice; NHAP mới nhất thì đổi', () => {
  const dom = stockDom();
  const client = loadClient({
    document: dom.document, confirm: () => true,
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) })
  });
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }],
    transactions: [
      { id: 'old', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 100000, total: 100000, ts: 1000 },
      { id: 'new', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 }
    ], prescriptions: [], updatedAt: 1, moneyUnit: 'dong'
  });
  client.setBase(1);
  client.openTxEdit('old');
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '150');
  client.saveTxEdit();
  assert.equal(client.getDb().products[0].costPrice, 200000);
  client.openTxEdit('new');
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '250');
  client.saveTxEdit();
  assert.equal(client.getDb().products[0].costPrice, 250000);
});

test('dòng bán lẻ/đơn thuốc/nhập thiếu số lượng bị giữ lại và báo, không lưu im lặng', () => {
  function rowDoc(sel) {
    const q = { value: '0', focus() {} };
    const row = { getAttribute() { return 'p1'; }, querySelector() { return q; } };
    const tb = { textContent: 'giu', querySelector() { return row; } };
    const doc = {
      readyState: 'loading', hidden: false, activeElement: null,
      documentElement: makeEl(), body: makeEl(),
      querySelector(s) { if (s === '#retailBody' || s === '#remedyBody') return tb; return null; },
      querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
      addEventListener() {}, removeEventListener() {}
    };
    return { doc, tb };
  }
  assert.equal(loadClient({ document: rowDoc('.retail-qty').doc }).commitRetailRow(), false);
  assert.equal(loadClient({ document: rowDoc('.remedy-qty').doc }).commitRemedyRow(), false);

  const nq = { value: '0', focus() {} };
  const ndoc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#nhapSearch' ? { value: 'A' } : s === '#nhapQty' ? nq : s === '#nhapPrice' ? { value: '10' } : null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: ndoc });
  c.setDb({ products: [{ id: 'p1', name: 'A', stock: 0, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.saveNhap({ preventDefault() {} });
  assert.equal(c.getDb().transactions.length, 0);
  assert.equal(nq.value, '0');
});

test('Enter gợi ý chỉ chọn exact hoặc một ứng viên, không chọn bừa item đầu', () => {
  function suggestDoc() {
    const input = { value: 'Cam thảo' };
    const buttons = [{ getAttribute(k) { return k === 'data-pid' ? 'p1' : null; }, dispatchEvent() { this.hit = true; } }, { getAttribute(k) { return k === 'data-pid' ? 'p2' : null; }, dispatchEvent() { this.hit = true; } }];
    const list = { hidden: false, querySelectorAll(sel) { return sel === '.sug__item' ? buttons : []; } };
    const doc = {
      readyState: 'loading', hidden: false, activeElement: null,
      documentElement: makeEl(), body: makeEl(),
      querySelector(s) { return s === '#nhapSearch' ? input : s === '#nhapList' ? list : null; },
      querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
      addEventListener() {}, removeEventListener() {}
    };
    return { doc, input, buttons };
  }
  const { doc, input, buttons } = suggestDoc();
  const c = loadClient({ document: doc });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 1, costPrice: 1 }, { id: 'p2', name: 'Cam thảo khô', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  let prevented = 0;
  c.onSuggestKey({ key: 'Enter', preventDefault() { prevented++; } }, 'nhap');
  assert.equal(prevented, 1);
  assert.equal(buttons[0].hit, true);
  input.value = 'Cam';
  prevented = 0; buttons.forEach(b => delete b.hit);
  c.onSuggestKey({ key: 'Enter', preventDefault() { prevented++; } }, 'nhap');
  assert.equal(prevented, 0);
  assert.equal(buttons.some(b => b.hit), false);
});

test('recFix không đổi tồn khi người dùng hủy xác nhận', () => {
  const client = loadClient({ confirm: () => false });
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 5, costPrice: 1 }],
    transactions: [{ id: 't1', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 1, cost: 0 }],
    prescriptions: [], updatedAt: 0, moneyUnit: 'dong'
  });
  client.recFix('p1');
  assert.equal(client.getDb().products[0].stock, 5);
});

test('mergeDo hủy xác nhận cuối thì không gộp', () => {
  const checks = [{ checked: true, getAttribute() { return '2026-11-07|1'; } }];
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector() { return null; }, querySelectorAll(sel) { return sel === '#mergeList input[type=checkbox]' ? checks : []; },
    createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, addEventListener() {}, removeEventListener() {}
  };
  const client = loadClient({ document: doc, confirm: () => false });
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 2, costPrice: 1 }],
    transactions: [
      { id: 'a', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 1, cost: 0 },
      { id: 'b', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 1, cost: 0 }
    ], prescriptions: [], updatedAt: 0, moneyUnit: 'dong'
  });
  client.mergeDo();
  assert.ok(client.getDb().transactions.every(t => !t.oid));
});

test('sanitize giữ id/tên constructor, toString, __proto__', () => {
  const client = loadClient();
  const out = client.sanitize({
    products: [
      { id: 'constructor', name: 'Constructor', stock: 1, costPrice: 1 },
      { id: 'p2', name: '__proto__', stock: 1, costPrice: 1 },
      { id: 'p3', name: 'Bình thường', stock: 1, costPrice: 1 }
    ],
    transactions: [{ id: 'toString', date: '2026-11-10', type: 'NHAP', productId: 'p3', qty: 1, price: 1, total: 1 }],
    prescriptions: []
  });
  assert.equal(out.products.length, 3);
  assert.equal(out.transactions.length, 1);
});

test('invPage âm được kẹp về 1 khi render', () => {
  const body = makeEl();
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#invBody' ? body : null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    createTextNode(s) { return { textContent: String(s) }; },
    addEventListener() {}, removeEventListener() {}
  };
  const client = loadClient({ document: doc });
  client.setDb({ products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  client.setInvPage(-5);
  client.renderInventory();
  assert.equal(client.getInvPage(), 1);
});

test('Enter chỉ có mục Tạo mới (không vị nào khớp): không chọn, preventDefault=0', () => {
  const input = { value: 'Rất không có vị' };
  const buttons = [
    { getAttribute(k) { return k === 'data-pid' ? null : null; }, dispatchEvent() { this.hit = true; } }
  ];
  const list = { hidden: false, querySelectorAll(sel) { return sel === '.sug__item' ? buttons : []; } };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#nhapSearch' ? input : s === '#nhapList' ? list : null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: doc });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  let prevented = 0;
  c.onSuggestKey({ key: 'Enter', preventDefault() { prevented++; } }, 'nhap');
  assert.equal(prevented, 0);
  assert.equal(buttons[0].hit, undefined);
});

test('Enter vị khớp chính xác không có trong gợi ý hiển thị: không chọn', () => {
  const input = { value: 'Cam thảo' };
  const buttons = [
    { getAttribute(k) { return k === 'data-pid' ? 'p999' : null; }, dispatchEvent() { this.hit = true; } }
  ];
  const list = { hidden: false, querySelectorAll(sel) { return sel === '.sug__item' ? buttons : []; } };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#nhapSearch' ? input : s === '#nhapList' ? list : null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: doc });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  let prevented = 0;
  c.onSuggestKey({ key: 'Enter', preventDefault() { prevented++; } }, 'nhap');
  assert.equal(prevented, 0);
  assert.equal(buttons[0].hit, undefined);
});


function limitDoc(els) {
  return {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return els[s] || null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
}
function limitStock() {
  const dom = stockDom();
  dom.set('toast', ''); dom.set('toastMsg', '');
  return dom;
}
function limitClient(dom, products, transactions = []) {
  const c = loadClient({
    document: dom.document, confirm: () => true,
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) })
  });
  c.setDb({ products, transactions, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  c.setBase(1);
  return c;
}
const toastText = dom => dom.document.querySelector('#toastMsg').textContent;

test('checkLimits: commitRetailRow trả false khi kg vượt trần', () => {
  const row = {
    getAttribute() { return 'p1'; },
    querySelector(sel) {
      if (sel === '.retail-qty') return { value: '10000000', focus() {}, select() {} };
      if (sel === '.retail-money') return { value: '11', focus() {}, select() {} };
      return { value: '0', focus() {}, select() {} };
    }
  };
  const tb = { textContent: 'giu', querySelector() { return row; } };
  const els = { '#retailBody': tb, '#toast': makeEl(), '#toastMsg': makeEl() };
  const c = loadClient({ document: limitDoc(els) });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  const before = JSON.stringify(c.getDb());
  assert.equal(c.commitRetailRow(), false);
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.getRetailItems().length, 0);
  assert.equal(c.isDirty(), false);
  assert.match(els['#toastMsg'].textContent, /Số lượng vượt giới hạn/);
});

test('checkLimits: commitRemedyRow trả false khi gram vượt trần', () => {
  const row = {
    getAttribute() { return 'p1'; },
    querySelector(sel) {
      if (sel === '.remedy-qty') return { value: '2000000000', focus() {}, select() {} };
      return { value: '0', focus() {}, select() {} };
    }
  };
  const tb = { textContent: 'giu', querySelector() { return row; } };
  const els = { '#remedyBody': tb, '#toast': makeEl(), '#toastMsg': makeEl() };
  const c = loadClient({ document: limitDoc(els) });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  const before = JSON.stringify(c.getDb());
  assert.equal(c.commitRemedyRow(), false);
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.getRemedyItems().length, 0);
  assert.equal(c.isDirty(), false);
  assert.match(els['#toastMsg'].textContent, /Gram vượt giới hạn/);
});

test('checkLimits: saveNhap trả false khi nhập lượng vượt trần', () => {
  const nq = { value: '10000000', focus() {}, select() {} };
  const np = { value: '14', focus() {}, select() {} };
  const els = {
    '#nhapSearch': { value: 'Cam' }, '#nhapQty': nq, '#nhapPrice': np,
    '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const c = loadClient({ document: limitDoc(els) });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  const before = JSON.stringify(c.getDb());
  c.saveNhap({ preventDefault() {} });
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(els['#toastMsg'].textContent, /Số lượng vượt giới hạn/);
});

test('checkLimits: saveRemedy thang 10001 bị từ chối: db không đổi, không dirty, có toast', () => {
  const dom = limitStock();
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1000000, costPrice: 1 }]);
  dom.set('remedyThang', '10001'); dom.set('remedyUnitPrice', '1000');
  c.setRemedyItems([{ productId: 'p1', grams: 1000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveRemedy();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số thang vượt giới hạn/);
});

test('checkLimits: saveRemedy vốn sau nhân vượt trần (1 thang × giá 1e13 đồng) bị từ chối', () => {
  const dom = limitStock();
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1000000, costPrice: 1 }]);
  dom.set('remedyThang', '1'); dom.set('remedyUnitPrice', '10000000000');
  c.setRemedyItems([{ productId: 'p1', grams: 1000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveRemedy();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tiền vượt giới hạn/);
});

test('checkLimits: saveRemedy sát trần (1e6 kg, 1e12 đồng) vẫn lưu được', () => {
  const dom = limitStock();
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1000000, costPrice: 1 }]);
  dom.set('remedyThang', '1'); dom.set('remedyUnitPrice', '1000000000');
  c.setRemedyItems([{ productId: 'p1', grams: 1000000000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveRemedy();
  assert.notEqual(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), true);
  assert.doesNotMatch(toastText(dom), /vượt giới hạn/);
});

test('checkLimits: saveTxEdit qty 1e7 bị từ chối: db không đổi, không dirty, có toast', () => {
  const dom = limitStock();
  const tx = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }], [tx]);
  c.openTxEdit('n1');
  dom.set('txEditQty', '10000000'); dom.set('txEditPrice', '200');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số lượng vượt giới hạn/);
});

test('checkLimits: saveTxEdit giá 1e13 đồng bị từ chối: db không đổi, không dirty, có toast', () => {
  const dom = limitStock();
  const tx = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }], [tx]);
  c.openTxEdit('n1');
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '10000000000');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tiền vượt giới hạn/);
});

test('checkLimits: saveTxEdit đơn thuốc sau nhân vượt trần (1e6 g × 1e4 thang = 1e7 kg) bị từ chối', () => {
  const dom = limitStock();
  const tx = { id: 'r1', date: '2026-11-02', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, ts: 2000, rx: true, thang: 10000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 1 }], [tx]);
  c.openTxEdit('r1');
  dom.set('txEditQty', '1000000'); dom.set('txEditPrice', '1');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số lượng vượt giới hạn/);
});

test('checkLimits: saveTxEdit sát trần (tồn 1e6 kg, thành tiền 1e12 đồng) vẫn lưu được', () => {
  const dom = limitStock();
  const tx = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 1, costPrice: 200000 }], [tx]);
  c.openTxEdit('n1');
  /* Tồn sau sửa = 1 + (1e6 - 1) = 1e6 (đúng trần); thành tiền = 1e6 kg × 1e6 đồng = 1e12 (đúng trần). */
  dom.set('txEditQty', '1000000'); dom.set('txEditPrice', '1000');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.notEqual(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), true);
  assert.doesNotMatch(toastText(dom), /vượt giới hạn/);
});

test('checkLimits: q/gram/thang/money ngoài trần bị từ chối; trần hợp lệ', () => {
  const c = loadClient({ setTimeout() { return 0; }, clearTimeout() {} });
  assert.equal(c.checkLimits('q', 1e6), null);
  assert.ok(c.checkLimits('q', 1e6 + 1));
  assert.equal(c.checkLimits('grams', 1e9), null);
  assert.ok(c.checkLimits('grams', 1e9 + 1));
  assert.equal(c.checkLimits('thang', 1), null);
  assert.equal(c.checkLimits('thang', 10000), null);
  assert.ok(c.checkLimits('thang', 10001));
  assert.equal(c.checkLimits('money', 1e12), null);
  assert.ok(c.checkLimits('money', 1e12 + 1));
  assert.equal(c.checkLimits('name', 'A'.repeat(200)), null);
  assert.ok(c.checkLimits('name', 'A'.repeat(201)));
});

test('max ô nhập tĩnh khớp hằng: nhapQty 1e6, giá và đơn giá 1e9 (nghìn đ), remedyThang 1e4', () => {
  const tagOf = id => {
    const m = PAGE.match(new RegExp('<input[^>]*id="' + id + '"[^>]*>'));
    assert.ok(m, 'không thấy ô ' + id);
    return m[0];
  };
  assert.match(tagOf('nhapQty'), /\smax="1000000"/);
  assert.match(tagOf('nhapPrice'), /\smax="1000000000"/);
  assert.match(tagOf('txEditPrice'), /\smax="1000000000"/);
  assert.match(tagOf('remedyUnitPrice'), /\smax="1000000000"/);
  assert.match(tagOf('remedyThang'), /\smax="10000"/);
});

test('max ô động: qty bán lẻ 1e6 kg, gram đơn thuốc 1e9, tiền dòng bán lẻ 1e9 nghìn đ', () => {
  assert.match(PAGE, /qi\.max = isRetail \? '1000000' : '1000000000';/);
  assert.match(PAGE, /mi\.max = '1000000000';/);
});

test('2.9.0 nhãn thẻ mới đúng theo hộp; id và data-action không đổi so với 2.8.4', () => {
  const titleOf = box => {
    const i = PAGE.indexOf('id="' + box + '"');
    assert.ok(i >= 0, 'thiếu id ' + box);
    const j = PAGE.indexOf('</h2>', i);
    const m = PAGE.slice(i, j).match(/<h2 class="card__title">([^<]*)$/);
    return m ? m[1] : null;
  };
  assert.equal(titleOf('retailBox'), 'Bán lẻ');
  assert.equal(titleOf('remedyBox'), 'Thuốc chén');
  assert.equal(titleOf('nhapBox'), 'Nhập hàng');
  assert.equal(titleOf('invBox'), 'Kho tồn');
  assert.equal(titleOf('chartBox'), 'Thống kê');
  assert.equal(titleOf('impBox'), 'Lịch sử nhập hàng');
  assert.equal(titleOf('expBox'), 'Lịch sử bán hàng');
  assert.equal(titleOf('backupBox'), 'Sao lưu &amp; khôi phục');
  assert.doesNotMatch(PAGE, /1\. Đơn bán lẻ|2\. Đơn thuốc chén|3\. Nhập hàng|Thống kê nhập &amp; bán|Danh sách tồn kho/);
  assert.equal(PAGE.match(/data-action="/g).length - PAGE.split('data-action="nhap-add"').length + 1, 25, 'data-action cũ đã đổi (nhap-add thêm ở 2.12.0 không tính)');
  assert.equal(PAGE.match(/ id="/g).length, 159); // 165 - 7 symbol không dùng (vòng 17 nhóm C); 2.10.0 thêm id="tabs"
});

/* 2.9.1 "khối @media 901px: .main align-items:start" đã BỎ ở 2.10.0 (lưới 2 cột thay bằng tab). */
test('2.10.0 (thay ca 2.9.1 đã bỏ) không còn lưới 2 cột: không @media 901px, .grid2 bọc ngoài là display:contents, thẻ không grid-area', () => {
  assert.ok(!PAGE.includes('@media (min-width:901px)'), 'còn khối 901px của 2.9.x');
  assert.match(PAGE, /\.main>\.grid2\{display:contents\}/);
  assert.match(PAGE, /\.main>details\.card:not\(\[open\]\),\.main>\.grid2>details\.card:not\(\[open\]\)\{display:none\}/);
  assert.doesNotMatch(PAGE, /\.main\{[^}]*grid-template-columns/);
  for (const id of ['retailBox', 'remedyBox', 'nhapBox', 'invBox', 'impBox', 'expBox', 'chartBox', 'backupBox']) {
    assert.doesNotMatch(PAGE, new RegExp('#' + id + '\\{grid-area'));
  }
  assert.equal(PAGE.match(/class="stat__sub"/g).length, 2, 'mất dòng phụ "Hôm nay · Năm" của thẻ số');
});

/* ===== Vòng 16, nhóm A (kiểm trần đủ đường lưu, hẹn gửi lại, giá vốn, gợi ý, huy hiệu) ===== */
const A_DB = (products, transactions = [], prescriptions = []) => ({ products, transactions, prescriptions, updatedAt: 1, moneyUnit: 'dong' });

test('A1 addNhapItem: qty 1e7 không được đẩy vào nhapList; db không đổi; không dirty; có toast', () => {
  const dom = limitStock();
  dom.set('nhapSearch', 'Cam'); dom.set('nhapQty', '10000000'); dom.set('nhapPrice', '14');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }]);
  const before = JSON.stringify(c.getDb());
  c.addNhapItem();
  assert.equal(c.getNhapList().length, 0);
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số lượng vượt giới hạn/);
});

test('A1 saveNhap: nhapList có dòng vượt trần bị chặn cả lô, dòng hợp lệ đứng trước không được ghi', () => {
  const dom = limitStock();
  dom.set('nhapSearch', '');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }]);
  c.setNhapList([{ pid: null, name: 'Ca', qty: 5, price: 14000 }, { pid: null, name: 'Ca2', qty: 10000000, price: 14000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveNhap();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số lượng vượt giới hạn/);
});

test('A1 saveNhap: tên dòng trong nhapList > 200 ký tự bị chặn (vòng kiểm lại), db không đổi', () => {
  const dom = limitStock();
  dom.set('nhapSearch', '');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }]);
  c.setNhapList([{ pid: null, name: 'A'.repeat(201), qty: 1, price: 14000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveNhap();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tên vượt giới hạn/);
});

test('A3 saveNhap: hai dòng cùng vị (khác hoa/thường) cộng dồn vượt QTY_MAX bị chặn trước khi ghi', () => {
  const dom = limitStock();
  dom.set('nhapSearch', '');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 0, costPrice: 1 }]);
  c.setNhapList([{ pid: 'p1', name: 'Cam', qty: 600000, price: 14000 }, { pid: null, name: 'cam', qty: 600000, price: 14000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveNhap();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số lượng vượt giới hạn/);
});

test('A3 saveNhap: thành tiền qty×price vượt MONEY_MAX bị chặn trước khi ghi', () => {
  const dom = limitStock();
  dom.set('nhapSearch', '');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 0, costPrice: 1 }]);
  c.setNhapList([{ pid: null, name: 'Cam', qty: 1000000, price: 2000000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveNhap();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tiền vượt giới hạn/);
});

test('A2 noteSave: thành tiền vượt trần bị chặn, dòng tờ ghi không đổi', () => {
  const dom = limitStock();
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }]);
  c.setRetailItems([{ pid: 'p1', kg: 1, amount: 1000 }]);
  c.setNoteEditIdx(0);
  dom.set('noteEditQty', '1'); dom.set('noteEditMoney', '2000000000');
  const before = JSON.stringify(c.getRetailItems());
  c.noteSave();
  assert.equal(JSON.stringify(c.getRetailItems()), before);
  assert.match(toastText(dom), /Tiền vượt giới hạn/);
});

test('A2 remedyNoteSave: gram vượt GRAMS_MAX bị chặn, dòng đơn thuốc không đổi', () => {
  const dom = limitStock();
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }]);
  c.setRemedyItems([{ productId: 'p1', grams: 10 }]);
  c.setRemedyEditIdx(0);
  dom.set('remedyNoteEditQty', '2000000000');
  const before = JSON.stringify(c.getRemedyItems());
  c.remedyNoteSave();
  assert.equal(JSON.stringify(c.getRemedyItems()), before);
  assert.match(toastText(dom), /Gram vượt giới hạn/);
});

test('A2 savePreset: tên 201 ký tự bị chặn, không ghi đơn', () => {
  const dom = limitStock();
  dom.set('remedyName', 'A'.repeat(201)); dom.set('remedyThang', '1'); dom.set('remedyUnitPrice', '1');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }]);
  c.setRemedyItems([{ productId: 'p1', grams: 10 }]);
  const before = JSON.stringify(c.getDb());
  c.savePreset();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tên vượt giới hạn/);
});

test('A2 savePreset: gram một vị vượt GRAMS_MAX bị chặn, không ghi đơn', () => {
  const dom = limitStock();
  dom.set('remedyName', 'Đơn A'); dom.set('remedyThang', '1'); dom.set('remedyUnitPrice', '1');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }]);
  c.setRemedyItems([{ productId: 'p1', grams: 2000000000 }]);
  const before = JSON.stringify(c.getDb());
  c.savePreset();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Gram vượt giới hạn/);
});

test('A2 copyPreset: tên bản sao từ prompt 201 ký tự bị chặn, không thêm đơn', () => {
  const dom = limitStock();
  dom.set('remedyPreset', 'RX1'); dom.set('remedyThang', '1'); dom.set('remedyUnitPrice', '1');
  const prescriptions = [{ id: 'RX1', name: 'Cũ', items: [{ productId: 'p1', grams: 10 }], total: 1, thang: 1, updatedAt: 1 }];
  const c = loadClient({ document: dom.document, confirm: () => true, prompt: () => 'B'.repeat(201),
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) }) });
  c.setDb(A_DB([{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }], [], prescriptions));
  c.setBase(1);
  c.setRemedyItems([{ productId: 'p1', grams: 10 }]);
  const before = JSON.stringify(c.getDb());
  c.copyPreset();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tên vượt giới hạn/);
});

test('A2 saveEdit: giá vượt trần (2e9 nghìn = 2e12 đồng) bị chặn, db không đổi', () => {
  const dom = limitStock();
  dom.set('editId', 'p1'); dom.set('editName', 'Cam'); dom.set('editPrice', '2000000000');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }]);
  const before = JSON.stringify(c.getDb());
  c.saveEdit();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tiền vượt giới hạn/);
});

test('A3 saveTxEdit: tồn sau tăng vượt QTY_MAX bị chặn, db không đổi', () => {
  const dom = limitStock();
  const tx = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }], [tx]);
  c.openTxEdit('n1');
  dom.set('txEditQty', '1000000'); dom.set('txEditPrice', '1');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số lượng vượt giới hạn/);
});

test('A3 saveTxEdit: thành tiền qty×price vượt MONEY_MAX bị chặn, db không đổi', () => {
  const dom = limitStock();
  const tx = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 1, costPrice: 200000 }], [tx]);
  c.openTxEdit('n1');
  dom.set('txEditQty', '1000000'); dom.set('txEditPrice', '2000000');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Tiền vượt giới hạn/);
});

test('A3 recFix: số lịch sử vượt QTY_MAX bị chặn, tồn không đổi', () => {
  const dom = limitStock();
  const txs = [
    { id: 'n1', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1000000, price: 1000, total: 1000000000, ts: 1000 },
    { id: 'n2', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1000000, price: 1000, total: 1000000000, ts: 2000 }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 0, costPrice: 1000 }], txs);
  const before = JSON.stringify(c.getDb());
  c.recFix('p1');
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Số lượng vượt giới hạn/);
});

test('A3 recFixAll: vị vượt trần bị bỏ qua, vị hợp lệ vẫn áp dụng', () => {
  const dom = limitStock();
  const txs = [
    { id: 'n1', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1000000, price: 1000, total: 1000000000, ts: 1000 },
    { id: 'n2', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1000000, price: 1000, total: 1000000000, ts: 2000 },
    { id: 'n3', date: '2026-11-02', type: 'NHAP', productId: 'p2', qty: 5, price: 1000, total: 5000, ts: 3000 }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 0, costPrice: 1000 }, { id: 'p2', name: 'Nghệ', stock: 0, costPrice: 1000 }], txs);
  c.recFixAll();
  const db = c.getDb();
  assert.equal(db.products[0].stock, 0, 'vị vượt trần không được đặt tồn');
  assert.equal(db.products[1].stock, 5, 'vị hợp lệ vẫn được áp dụng');
});

test('A3 saveRetail: đơn giá amount/kg vượt MONEY_MAX bị chặn trước khi trừ tồn', () => {
  const dom = limitStock();
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }]);
  c.setRetailItems([{ pid: 'p1', kg: 0.001, amount: 1000000000000 }]);
  const before = JSON.stringify(c.getDb());
  c.saveRetail();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Đơn giá vượt giới hạn \(1\.000\.000\.000 nghìn đồng\/kg\)/);
});

test('A3 saveRemedy: đơn giá sau chia kg vượt MONEY_MAX bị chặn trước khi trừ tồn', () => {
  const dom = limitStock();
  dom.set('remedyThang', '1'); dom.set('remedyUnitPrice', '1000000000');
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }]);
  c.setRemedyItems([{ productId: 'p1', grams: 1 }]);
  const before = JSON.stringify(c.getDb());
  c.saveRemedy();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Đơn giá vượt giới hạn \(1\.000\.000\.000 nghìn đồng\/kg\)/);
});

test('A4 scheduleSyncRetry: đang ở ô nhập thì hẹn lại bằng timer mới, không pushState; hết bận thì đẩy được', async () => {
  const dom = limitStock();
  const timers = []; let fetches = 0;
  const c = loadClient({
    document: dom.document,
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout() {},
    fetch: async () => { fetches++; return { status: 200, json: async () => ({ success: true, updatedAt: 1 }) }; }
  });
  c.setDb(A_DB([{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }]));
  c.setBase(1); c.setDirty(true);
  dom.document.activeElement = { tagName: 'INPUT' };
  c.scheduleSyncRetry();
  assert.equal(timers.length, 1);
  timers[0]();
  assert.equal(timers.length, 2, 'đang ở ô nhập phải hẹn lại bằng timer mới');
  assert.equal(c.hasSyncRetry(), true);
  assert.equal(fetches, 0, 'đang bận thì không pushState');
  assert.equal(c.isDirty(), true);
  dom.document.activeElement = null;
  timers[1]();
  await new Promise(r => setImmediate(r));
  assert.ok(fetches >= 1, 'hết bận thì phải đẩy được');
});

test('A5 delTx: xóa NHAP mới nhất → costPrice về giá lần nhập còn lại (theo ngày)', () => {
  const dom = limitStock();
  const txs = [
    { id: 'n_old', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 150000, total: 150000, ts: 1000 },
    { id: 'n_new', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }], txs);
  c.delTx('n_new');
  const p = c.getDb().products[0];
  assert.equal(p.stock, 1);
  assert.equal(p.costPrice, 150000);
  assert.equal(c.isDirty(), true);
});

test('A5 delTx: lần có NGÀY mới hơn nhưng ts cũ hơn thắng (theo lastImport, không theo ts)', () => {
  const dom = limitStock();
  const txs = [
    { id: 'n_a', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 150000, total: 150000, ts: 3000 },
    { id: 'n_b', date: '2026-11-03', type: 'NHAP', productId: 'p1', qty: 1, price: 170000, total: 170000, ts: 1000 },
    { id: 'n_del', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 3, costPrice: 999 }], txs);
  /* n_b (11-03, ts 1000) là lastImport: xóa nó thì lần còn lại mới nhất theo NGÀY là n_del (11-02, ts 2000) */
  c.delTx('n_b');
  assert.equal(c.getDb().products[0].costPrice, 200000, 'ngày 11-02 mới hơn 11-01 phải thắng dù ts cũ hơn (n_a ts 3000)');
});

test('A5 delOrder: xóa đơn nhập mới nhất → costPrice theo lần nhập còn lại', () => {
  const dom = limitStock();
  const txs = [
    { id: 'n_old', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 150000, total: 150000, ts: 1000, oid: 'IM_OLD' },
    { id: 'n_new', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000, oid: 'IM_NEW' }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }], txs);
  c.delOrder('IM_NEW');
  assert.equal(c.getDb().products[0].costPrice, 150000);
});

test('A5 delTx: không còn lần nhập có giá thì costPrice giữ nguyên', () => {
  const dom = limitStock();
  const txs = [{ id: 'n_new', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 }];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 1, costPrice: 777 }], txs);
  c.delTx('n_new');
  assert.equal(c.getDb().products[0].costPrice, 777);
});

test('A5 delTx: xóa NHAP cũ (không phải lastImport) thì costPrice sửa tay giữ nguyên', () => {
  const dom = limitStock();
  const txs = [
    { id: 'n_old', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 150000, total: 150000, ts: 1000 },
    { id: 'n_new', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 300000 }], txs);
  c.delTx('n_old');
  assert.equal(c.getDb().products[0].costPrice, 300000);
});

test('A5 delOrder: đơn nhập cũ không chứa lastImport thì costPrice giữ nguyên', () => {
  const dom = limitStock();
  const txs = [
    { id: 'n_old', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 1, price: 150000, total: 150000, ts: 1000, oid: 'IM_OLD' },
    { id: 'n_new', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000, oid: 'IM_NEW' }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 300000 }], txs);
  c.delOrder('IM_OLD');
  assert.equal(c.getDb().products[0].costPrice, 300000);
});

test('A5 delTx: xóa không thành công (tồn âm) thì db và costPrice không đổi', () => {
  const dom = limitStock();
  const txs = [{ id: 'n_new', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 }];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 0, costPrice: 999 }], txs);
  const before = JSON.stringify(c.getDb());
  c.delTx('n_new');
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(c.isDirty(), false);
  assert.match(toastText(dom), /Không thể xóa/);
});

function remedyPickDoc(dom, appended, gramsValue) {
  const row = {
    getAttribute() { return 'p1'; },
    querySelector(s) { return s === '.remedy-qty' ? { value: gramsValue, focus() {}, select() {} } : null; },
    querySelectorAll() { return []; }, remove() {}
  };
  const tbody = makeEl();
  tbody.querySelector = s => (s === 'tr[data-pid]' ? row : null);
  tbody.appendChild = c => { appended.push(c); return c; };
  const doc = dom.document;
  const base = doc.querySelector;
  doc.querySelector = s => (s === '#remedyBody' ? tbody : base(s));
  doc.querySelectorAll = s => (s === '#remedyBody tr[data-pid]' ? [row] : []);
  return row;
}
test('A6 pickSuggest remedy: dòng đang gõ thiếu gram thì không thêm dòng vị khác', () => {
  const dom = limitStock();
  const appended = [];
  remedyPickDoc(dom, appended, '0');
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 5, costPrice: 1 }, { id: 'p2', name: 'B', stock: 5, costPrice: 1 }]);
  c.pickSuggest('remedy', 'p2');
  assert.equal(appended.length, 0, 'không được thêm dòng B khi dòng A chưa commit');
  assert.equal(c.getRemedyItems().length, 0);
  assert.equal(c.isDirty(), false);
});
test('A6 pickSuggest remedy: dòng đang gõ vượt GRAMS_MAX thì không thêm dòng vị khác', () => {
  const dom = limitStock();
  const appended = [];
  remedyPickDoc(dom, appended, '2000000000');
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 5, costPrice: 1 }, { id: 'p2', name: 'B', stock: 5, costPrice: 1 }]);
  c.pickSuggest('remedy', 'p2');
  assert.equal(appended.length, 0);
  assert.match(toastText(dom), /Gram vượt giới hạn/);
});

test('A7 cloudConflict chọn tải bản máy chủ: dirty tắt, cờ lỗi đồng bộ và hẹn lại được dọn', async () => {
  const timers = [];
  const c = loadClient({
    Blob: class { constructor() {} }, confirm: () => true,
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout() {},
    fetch: async () => ({ status: 200, json: async () => ({ success: true, data: { products: [{ id: 'sv', name: 'Server', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 2, moneyUnit: 'dong' } }) })
  });
  c.setDb(A_DB([{ id: 'old', name: 'Old', stock: 1, costPrice: 1 }]));
  c.setBase(1); c.setDirty(true); c.setSyncErrorShown(true);
  c.scheduleSyncRetry();
  assert.equal(c.hasSyncRetry(), true, 'phải có timer hẹn lại trước khi tải bản máy chủ');
  await c.cloudConflict();
  assert.equal(c.isDirty(), false);
  assert.equal(c.isSyncErrorShown(), false, 'huy hiệu lỗi phải được dọn sau khi tải bản máy chủ');
  assert.equal(c.hasSyncRetry(), false, 'timer hẹn lại phải bị xóa');
});

test('A8 addNhapItem: giá vượt trần thì con trỏ về #nhapPrice, không về #nhapQty', () => {
  let focused = '';
  const els = {
    '#nhapSearch': { value: 'Cam', focus() { focused = 'nhapSearch'; }, select() {} },
    '#nhapQty': { value: '10', focus() { focused = 'nhapQty'; }, select() {} },
    '#nhapPrice': { value: '2000000000', focus() { focused = 'nhapPrice'; }, select() {} },
    '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const c = loadClient({ document: limitDoc(els) });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.addNhapItem();
  assert.equal(focused, 'nhapPrice');
  assert.match(els['#toastMsg'].textContent, /Tiền vượt giới hạn/);
});

/* ------------------------------------------------------------------ */
/* Vòng 16, nhóm B (B8–B15)                                           */
/* ------------------------------------------------------------------ */

/* DOM ghi lại listener: rec[id][sự kiện] = [hàm, ...] */
function recDoc(ids) {
  const els = {}, rec = {};
  for (const id of ids) {
    const e = makeEl();
    e.addEventListener = (type, fn) => { ((rec[id] ||= {})[type] ||= []).push(fn); };
    els['#' + id] = e;
  }
  const doc = limitDoc(els);
  doc.readyState = 'complete'; /* page.js chỉ gọi init (và bindEvents) khi không còn 'loading' */
  return { doc, els, rec };
}
const fire = (rec, id, type) => (rec[id]?.[type] || []).forEach(fn => fn({}));

test('B8 saveNhap: giá vượt trần thì con trỏ về #nhapPrice (trước đây pi2 luôn undefined)', () => {
  let focused = '';
  const els = {
    '#nhapSearch': { value: 'Cam' },
    '#nhapQty': { value: '10', focus() {}, select() {} },
    '#nhapPrice': { value: '2000000000', focus() { focused = 'nhapPrice'; }, select() {} },
    '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const c = loadClient({ document: limitDoc(els) });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  const before = JSON.stringify(c.getDb());
  c.saveNhap({ preventDefault() {} });
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(focused, 'nhapPrice');
  assert.match(els['#toastMsg'].textContent, /Tiền vượt giới hạn/);
});

test('B9 addRemedyToNote: gram vượt trần thì không thêm dòng và con trỏ ở ô gram, không nhảy sang ô tìm', () => {
  let focused = '';
  const qi = { value: '1000000001', focus() { focused = 'qty'; }, select() {} };
  const row = { getAttribute() { return 'p1'; }, querySelector(sel) { return sel === '.remedy-qty' ? qi : null; } };
  const tb = { textContent: 'giu', querySelector() { return row; } };
  const els = {
    '#remedyBody': tb, '#remedyBody tr[data-pid]': row,
    '#remedySearch': { value: '', focus() { focused = 'search'; }, select() {} },
    '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const c = loadClient({ document: limitDoc(els) });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.addRemedyToNote();
  assert.equal(c.getRemedyItems().length, 0);
  assert.equal(focused, 'qty');
  assert.match(els['#toastMsg'].textContent, /Gram vượt giới hạn/);
});

test('B11 checkLimits: số âm có chữ riêng; trần tiền hiện theo nghìn đồng có dấu chấm', () => {
  const c = loadClient({});
  assert.equal(c.checkLimits('money', -1), 'Tiền không được âm');
  assert.equal(c.checkLimits('q', -0.5), 'Số lượng không được âm');
  assert.equal(c.checkLimits('grams', -1), 'Gram không được âm');
  assert.equal(c.checkLimits('thang', -1), 'Số thang không được âm');
  assert.equal(c.checkLimits('money', NaN), 'Số tiền không hợp lệ');
  assert.equal(c.checkLimits('money', 0), null);
  assert.equal(c.checkLimits('money', 1e12), null);
  assert.equal(c.checkLimits('money', 1e12 + 1), 'Tiền vượt giới hạn (1.000.000.000 nghìn đồng)');
});

test('B12 Esc đóng hộp thoại (sự kiện close): xóa txEditCur và orderCur', () => {
  const { doc, rec } = recDoc(['txDlg', 'orderDlg']);
  const c = loadClient({ document: doc, fetch: async () => { throw new Error('offline'); }, setInterval() { return 0; }, clearInterval() {} });
  c.setTxEdit({ id: 'T1' });
  c.setOrderCur('OD_1');
  fire(rec, 'txDlg', 'close');
  fire(rec, 'orderDlg', 'close');
  assert.equal(c.getTxEdit(), null);
  assert.equal(c.getOrderCur(), null);
});

test('B13 delTx: NHẬP làm tồn âm thì báo lỗi TRƯỚC khi hỏi xác nhận, db không đổi', () => {
  let asked = 0;
  const els = { '#toast': makeEl(), '#toastMsg': makeEl() };
  const c = loadClient({ document: limitDoc(els), confirm: () => { asked++; return true; } });
  c.setDb({
    products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }],
    transactions: [{ id: 'n1', date: '2026-11-08', type: 'NHAP', productId: 'p1', qty: 5, price: 1000, total: 5000, ts: 1 }],
    prescriptions: [], updatedAt: 0, moneyUnit: 'dong'
  });
  const before = JSON.stringify(c.getDb());
  c.delTx('n1');
  assert.equal(asked, 0);
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.match(els['#toastMsg'].textContent, /Không thể xóa/);
});

test('B13 delTx: hoàn tác khi giá bán thấp hơn vốn đơn thuốc giữ đúng vị trí giao dịch và tồn', () => {
  const els = { '#toast': makeEl(), '#toastMsg': makeEl() };
  const c = loadClient({ document: limitDoc(els), confirm: () => true });
  const line = (id, cost) => ({ id, date: '2026-11-08', type: 'BAN', productId: 'p1', qty: 1, price: 10, total: 10, cost, oid: 'R1', oname: 'Đơn thuốc', rx: true, ts: 1 });
  const txs = [
    { id: 'a', date: '2026-11-08', type: 'NHAP', productId: 'p1', qty: 1, price: 1, total: 1, ts: 0 },
    line('t1', 100), line('t2', 100),
    { id: 'z', date: '2026-11-08', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 9, oname: 'Bán lẻ' }
  ];
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 10, costPrice: 1 }], transactions: txs, prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  const idsBefore = JSON.stringify(c.getDb().transactions.map(t => t.id));
  c.delTx('t1');
  assert.equal(JSON.stringify(c.getDb().transactions.map(t => t.id)), idsBefore);
  assert.equal(c.getDb().products[0].stock, 10);
  assert.match(els['#toastMsg'].textContent, /Giá bán thấp hơn vốn/);
});

test('B14 db mặc định có moneyUnit "dong": sao lưu từ db mặc định khôi phục không nhân 1000', () => {
  /* readyState complete để init chạy; không có local và không có remote nên db đi qua nhánh mặc định (4784). */
  const doc = limitDoc({});
  doc.readyState = 'complete';
  const c = loadClient({ document: doc, fetch: async () => { throw new Error('offline'); }, setInterval() { return 0; }, clearInterval() {} });
  const d = c.getDb();
  assert.equal(d.moneyUnit, 'dong');
  d.products.push({ id: 'p1', name: 'A', stock: 1, costPrice: 85 });
  const parsed = c.parseBackup(JSON.stringify({ app: 'quan-ly-kho', version: 1, data: d }));
  assert.equal(parsed.products[0].costPrice, 85);
});

test('B14 db khai báo ban đầu (trước init) có moneyUnit "dong"', () => {
  /* readyState loading: init không chạy, db vẫn là khai báo mặc định ở đầu page.js. */
  const c = loadClient({});
  assert.equal(c.getDb().moneyUnit, 'dong');
});

test('B15 autoRefresh không viết hoa tên sản phẩm trong db (renderAll không còn chuẩn hóa)', async () => {
  const remote = { products: [{ id: 'p1', name: 'cam thảo', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 500 };
  const c = loadClient({ fetch: async () => ({ status: 200, json: async () => ({ success: true, data: remote }) }) });
  c.setDb({ products: [{ id: 'p1', name: 'Cu', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 100, moneyUnit: 'dong' });
  c.setBase(100);
  c.setDirty(false);
  assert.equal(await c.autoRefresh(), true);
  assert.equal(c.getDb().products[0].name, 'cam thảo');
  assert.equal(c.isDirty(), false);
});

test('B15 liên kết tên: gõ "Cam Thảo" vẫn giữ nhapPid khi tên đã lưu là "cam thảo"', () => {
  const { doc, els, rec } = recDoc(['nhapSearch']);
  els['#nhapSearch'].value = 'Cam Thảo';
  const c = loadClient({ document: doc, fetch: async () => { throw new Error('offline'); }, setInterval() { return 0; }, clearInterval() {} });
  c.setDb({ products: [{ id: 'p1', name: 'cam thảo', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.setNhapPid('p1');
  fire(rec, 'nhapSearch', 'input');
  assert.equal(c.getNhapPid(), 'p1');
});

test('F8 #syncBadge là <div role="status">, không còn <button> bọc liên kết', () => {
  assert.match(PAGE, /<div class="sync-badge" id="syncBadge" role="status" hidden>/);
  assert.doesNotMatch(PAGE, /<button[^>]*id="syncBadge"/);
});

test('F13 recDlg, mergeDlg: bấm ra nền thì đóng đúng như nút Đóng; bấm vào nội dung thì không đóng', () => {
  const { doc, els, rec } = recDoc(['recDlg', 'mergeDlg']);
  let closedRec = 0, closedMerge = 0;
  els['#recDlg'].close = () => { closedRec++; };
  els['#mergeDlg'].close = () => { closedMerge++; };
  loadClient({ document: doc, fetch: async () => { throw new Error('offline'); }, setInterval() { return 0; }, clearInterval() {} });
  const inner = {};
  const fire2 = (id, target) => (rec[id]?.click || []).forEach(fn => fn({ target }));
  fire2('recDlg', inner); fire2('mergeDlg', inner);
  assert.equal(closedRec, 0);
  assert.equal(closedMerge, 0);
  fire2('recDlg', els['#recDlg']); fire2('mergeDlg', els['#mergeDlg']);
  assert.equal(closedRec, 1);
  assert.equal(closedMerge, 1);
});

test('F14 bỏ class không dùng .stack, .hide-sm và thuộc tính data-sug', () => {
  assert.doesNotMatch(PAGE, /\.stack\{|\.hide-sm\{|data-sug=/);
});

/* ===== 2.10.0: tab 8 mục (giao diện). Chỉ kiểm HTML/CSS/điều hướng; không chạm logic tiền/tồn/đồng bộ. ===== */
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const TAB_IDS = ['retailBox', 'remedyBox', 'nhapBox', 'invBox', 'impBox', 'expBox', 'chartBox', 'backupBox'];
const TAB_ORDER_DOM = ['retailBox', 'remedyBox', 'nhapBox', 'chartBox', 'invBox', 'impBox', 'expBox', 'backupBox'];
const TAB_LABELS = ['Bán lẻ', 'Thuốc chén', 'Nhập hàng', 'Kho tồn', 'L.s nhập', 'L.s bán', 'Thống kê', 'Sao lưu'];
const TAB_ARIA = { impBox: 'Lịch sử nhập hàng', expBox: 'Lịch sử bán hàng', backupBox: 'Sao lưu & khôi phục' };

test('2.10.0 nav tab: sau thẻ số, trước các thẻ; 8 nút đúng thứ tự, data-tab và aria-controls trỏ tới thẻ tồn tại, nhãn đúng', () => {
  const navAt = PAGE.indexOf('<nav class="tabs"');
  assert.ok(navAt > PAGE.indexOf('</section>'), 'nav phải nằm sau thẻ số');
  assert.ok(navAt < PAGE.indexOf('id="retailBox"'), 'nav phải nằm trước các thẻ');
  const nav = PAGE.match(/<nav class="tabs"[\s\S]*?<\/nav>/)[0];
  const btns = [...nav.matchAll(/<button [^>]*>[\s\S]*?<\/button>/g)].map(m => m[0]);
  assert.equal(btns.length, 8, 'phải có đúng 8 nút');
  const tabs = btns.map(b => b.match(/data-tab="([^"]+)"/)[1]);
  assert.deepEqual(tabs, TAB_IDS);
  for (const b of btns) {
    assert.match(b, /^<button type="button" class="tab" role="tab" /);
    const id = b.match(/data-tab="([^"]+)"/)[1];
    assert.match(b, new RegExp('aria-controls="' + id + '"'));
    assert.match(PAGE, new RegExp('<details class="card[^"]*" id="' + id + '"'));
  }
  const labels = btns.map(b => [...b.matchAll(/<span[^>]*>([^<]*)<\/span>/g)].map(m => m[1]).join('').replace(/&amp;/g, '&'));
  assert.deepEqual(labels, TAB_LABELS);
});

test('2.10.1 nav tab: một nhãn duy nhất (không còn tab__full/tab__short); ba nút có aria-label đầy đủ; data-tab không đổi', () => {
  const nav = PAGE.match(/<nav class="tabs"[\s\S]*?<\/nav>/)[0];
  assert.doesNotMatch(PAGE, /tab__full|tab__short/);
  const btns = [...nav.matchAll(/<button [^>]*>[\s\S]*?<\/button>/g)].map(m => m[0]);
  assert.equal(btns.length, 8);
  assert.deepEqual(btns.map(b => b.match(/data-tab="([^"]+)"/)[1]), TAB_IDS);
  for (const b of btns) {
    const id = b.match(/data-tab="([^"]+)"/)[1];
    const a = b.match(/aria-label="([^"]+)"/);
    if (TAB_ARIA[id]) assert.equal(a && a[1].replace(/&amp;/g, '&'), TAB_ARIA[id], id + ' aria-label');
    else assert.equal(a, null, id + ' không được có aria-label');
  }
});

/* 2.10.1: quy tắc điện thoại phải đứng SAU quy tắc gốc cùng bộ chọn, nếu không quy tắc gốc ghi đè (cùng độ ưu tiên). */
test('2.10.1 thứ tự CSS: quy tắc gốc .tabs/.tab/.tab__ic/.stat đứng TRƯỚC khối điện thoại cùng bộ chọn', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  // .tabs: gốc (8 cột) trước khối 600px (4 cột)
  assert.ok(at('.tabs{display:grid') < at('repeat(4,minmax(0,1fr))'), '.tabs gốc phải đứng trước quy tắc 4 cột điện thoại');
  // .tab: gốc (display:flex) trước khối 600px (11px)
  assert.ok(at('.tab{display:flex') < at('.tab{min-height:38px;padding:4px;font-size:11px}'), '.tab gốc phải đứng trước quy tắc điện thoại');
  // .tab__ic: gốc (width:16px) trước khối 600px (ẩn)
  assert.ok(at('.tab__ic{width:16px') < at('.tab__ic{display:none}'), '.tab__ic gốc phải đứng trước quy tắc ẩn điện thoại');
  // quy tắc điện thoại của tab phải nằm trong @media (max-width:600px)
  const m = PAGE.lastIndexOf('@media (max-width:600px)', at('repeat(4,minmax(0,1fr))'));
  assert.ok(m >= 0 && PAGE.indexOf('@media', m + 1) > at('repeat(4,minmax(0,1fr))'), 'repeat(4) phải nằm trong @media (max-width:600px)');
});

/* 2.12.0 (A): nút + ở Nhập hàng bấm CHÍNH addNhapItem (cùng đường với Enter). */
test('2.12.0 nút + nhập hàng: đúng một nút data-action=nhap-add; bấm thêm đúng một dòng, db không đổi, không dirty; 1e7 không thêm và có toast; 2 dòng rồi saveNhap lưu cả 2', () => {
  assert.equal(PAGE.split('data-action="nhap-add"').length - 1, 1, 'phải đúng một nút nhap-add');
  const els = {
    '#nhapSearch': Object.assign(makeEl(), { value: 'Cam thảo' }),
    '#nhapQty': Object.assign(makeEl(), { value: '2' }),
    '#nhapPrice': Object.assign(makeEl(), { value: '10' }),
    '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return els[s] || null; },
    querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) }) });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 0, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.setBase(1);
  c.setDirty(false);
  const before = JSON.stringify(c.getDb());
  const btn = { getAttribute(k) { return k === 'data-action' ? 'nhap-add' : null; } };
  c.handleAction(btn);
  assert.equal(c.getNhapList().length, 1, 'bấm + phải thêm đúng một dòng');
  assert.equal(JSON.stringify(c.getDb()), before, 'db không đổi khi thêm vào tờ ghi');
  assert.equal(c.isDirty(), false, 'không bật dirty');
  els['#nhapSearch'].value = 'Cam thảo'; els['#nhapQty'].value = '10000000'; els['#nhapPrice'].value = '10';
  els['#toastMsg'].textContent = '';
  c.handleAction(btn);
  assert.equal(c.getNhapList().length, 1, 'số lượng 1e7 không được thêm dòng');
  assert.ok(els['#toastMsg'].textContent.length > 0, 'số lượng 1e7 phải có toast');
  els['#nhapSearch'].value = 'Cam thảo'; els['#nhapQty'].value = '3'; els['#nhapPrice'].value = '10';
  c.handleAction(btn);
  assert.equal(c.getNhapList().length, 2, 'thêm liên tiếp phải có 2 dòng');
  c.saveNhap();
  assert.equal(c.getDb().transactions.filter(t => t.type === 'NHAP').length, 2, 'saveNhap phải lưu cả 2 dòng');
});

/* 2.11.0: dải số liệu mỏng (Bán/Lợi nhuận) trên cùng; Nhập/Tồn kho chuyển vào Thống kê. Chỉ giao diện. */
const STAT_IDS = ['statImport', 'statExport', 'statExportDay', 'statExportYear', 'statProfit', 'statProfitDay', 'statProfitYear', 'statStock'];

test('2.11.0 số liệu: mỗi id đúng một lần; Bán/Lợi nhuận trong dải trên cùng; Nhập/Tồn kho trong #chartBox (đầu thân thẻ)', () => {
  for (const id of STAT_IDS) assert.equal(PAGE.split('id="' + id + '"').length - 1, 1, id + ' phải đúng một lần');
  const s0 = PAGE.indexOf('<section class="stats" aria-label="Bán và lợi nhuận tháng">');
  assert.ok(s0 > 0, 'thiếu dải số liệu');
  const dai = PAGE.slice(s0, PAGE.indexOf('</section>', s0));
  for (const id of ['statExport', 'statExportDay', 'statExportYear', 'statProfit', 'statProfitDay', 'statProfitYear']) {
    assert.ok(dai.includes('id="' + id + '"'), id + ' phải nằm trong dải trên cùng');
  }
  const c0 = PAGE.indexOf('<details class="card" id="chartBox"');
  assert.ok(c0 > 0, 'thiếu #chartBox');
  const c1 = PAGE.indexOf('<details class="card" id="', c0 + 10);
  const chart = PAGE.slice(c0, c1 > 0 ? c1 : undefined);
  for (const id of ['statImport', 'statStock']) {
    assert.ok(chart.includes('id="' + id + '"'), id + ' phải nằm trong #chartBox');
    assert.ok(!dai.includes('id="' + id + '"'), id + ' không được nằm trong dải');
  }
  assert.ok(chart.indexOf('id="statImport"') < chart.indexOf('class="row mb-12"'), 'ô nhập phải đứng trên hàng chú thích/năm');
  assert.ok(chart.indexOf('id="statStock"') < chart.indexOf('class="row mb-12"'), 'ô tồn kho phải đứng trên hàng chú thích/năm');
});

test('2.11.0 renderStats vẫn gán đủ 8 id số liệu (không đổi hành vi)', () => {
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  for (const id of STAT_IDS) els['#' + id] = { id, textContent: '', className: '' };
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.setDb({
    products: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong',
    transactions: [
      { id: 't1', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 0 },
      { id: 't2', date: '2026-11-06', type: 'NHAP', productId: 'p1', qty: 2, price: 500, total: 1000 }
    ]
  });
  client.renderStats();
  for (const id of STAT_IDS) assert.notEqual(els['#' + id].textContent, '', id + ' không được gán');
});

test('2.11.0 thứ tự CSS: quy tắc điện thoại đứng SAU quy tắc gốc cùng bộ chọn; không còn .stat__ic/.ic-*/.stat cũ', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  assert.ok(at('.stats__c{padding:6px 12px') < at('.stats__c{padding:6px 10px}'), '.stats__c gốc phải đứng trước khối điện thoại');
  assert.ok(at('.stat__sub{font-size:10px') < at('.stat__sub span{display:block}'), '.stat__sub gốc phải đứng trước khối điện thoại');
  assert.ok(at('.stat__sub span+span::before{content:"· "}') < at('.stat__sub span+span::before{content:none}'), 'separator gốc phải đứng trước khối điện thoại');
  assert.doesNotMatch(PAGE, /\.stat__ic|\.ic-(blue|green|amber|purple)\b|class="stat"/);
});

/* Danh sách data-action của 1023b40 (2.9.2), chốt sẵn vì image Docker không có git. */
const OLD_DATA_ACTIONS = ['backup-now', 'clear-exp', 'clear-imp', 'close-edit', 'close-merge', 'close-order', 'close-rec', 'close-tx',
  'copy-preset', 'del-preset', 'latest-exp', 'latest-imp', 'merge-do', 'merge-do', 'merge-old', 'rec-fix-all', 'reconcile',
  'restore-file', 'save-edit', 'save-preset', 'save-remedy', 'save-retail', 'save-tx', 'sync-discard', 'theme-menu'];
/* Trên host có git: đối chiếu thêm với 1023b40; trong image (không có git) chỉ dùng danh sách chốt sẵn. */
function oldPageFromGit() {
  try {
    return execFileSync('git', ['-C', REPO_ROOT, 'show', '1023b40:src/page.js'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    if (e && e.code === 'ENOENT') return null;
    throw e;
  }
}

test('2.10.0 id thẻ và data-action không đổi so với 1023b40; thứ tự DOM 8 thẻ giữ nguyên', () => {
  const old = oldPageFromGit();
  const actions = s => [...s.matchAll(/data-action="([^"]*)"/g)].map(m => m[1]).filter(a => a !== 'nhap-add').sort();
  assert.deepEqual(actions(PAGE), OLD_DATA_ACTIONS, 'data-action đã đổi so với 1023b40');
  if (old !== null) assert.deepEqual(actions(PAGE), actions(old), 'data-action đã đổi (git 1023b40)');
  assert.equal(PAGE.split('data-action="nhap-add"').length - 1, 1, 'nhap-add đúng một lần (2.12.0)');
  const ids = s => new Set([...s.matchAll(/ id="([^"]*)"/g)].map(m => m[1]));
  const newIds = ids(PAGE);
  for (const id of TAB_ORDER_DOM) assert.ok(newIds.has(id), 'thiếu id thẻ ' + id);
  if (old !== null) for (const id of ids(old)) assert.ok(newIds.has(id), 'mất id ' + id);
  const cardOrder = s => [...s.matchAll(/<details class="card[^"]*" id="([^"]+)"/g)].map(m => m[1]);
  if (old !== null) assert.deepEqual(cardOrder(old), TAB_ORDER_DOM, 'thứ tự thẻ cũ không như kỳ vọng');
  assert.deepEqual(cardOrder(PAGE), TAB_ORDER_DOM, 'thứ tự DOM 8 thẻ đã đổi');
});

/* Fake DOM tối thiểu cho initTabs: details có setter open phát 'toggle' khi đổi; summary có listener click. */
class FakeEl {
  constructor(id) {
    this.id = id || ''; this.attrs = {}; this.classes = new Set(); this.listeners = {};
    this._open = false; this.tabs = []; this.summary = null; this.isTab = false; this.style = {};
  }
  addEventListener(t, f) { (this.listeners[t] ||= []).push(f); }
  dispatch(t, ev) { (this.listeners[t] || []).forEach(f => f.call(this, ev)); }
  getAttribute(n) { return Object.prototype.hasOwnProperty.call(this.attrs, n) ? this.attrs[n] : null; }
  setAttribute(n, v) { this.attrs[n] = String(v); }
  hasAttribute(n) { return Object.prototype.hasOwnProperty.call(this.attrs, n); }
  removeAttribute(n) { delete this.attrs[n]; }
  get classList() {
    const s = this.classes;
    return {
      add(c) { s.add(c); }, remove(c) { s.delete(c); },
      toggle(c, on) { if (on) s.add(c); else s.delete(c); },
      contains(c) { return s.has(c); }
    };
  }
  get open() { return this._open; }
  set open(v) { v = !!v; if (v !== this._open) { this._open = v; this.dispatch('toggle', {}); } }
  querySelector(sel) { return sel === ':scope > summary' ? this.summary : null; }
  querySelectorAll(sel) { return sel === '.tab' ? this.tabs : []; }
  contains(x) { return this.tabs.includes(x); }
  closest(sel) { return sel === '.tab' && this.isTab ? this : null; }
  focus() {}
}

function makeTabEnv(saved) {
  const boxes = TAB_IDS.map(id => { const b = new FakeEl(id); b.summary = new FakeEl(); return b; });
  const byId = Object.fromEntries(boxes.map(b => [b.id, b]));
  const nav = new FakeEl('tabs');
  nav.tabs = TAB_IDS.map(id => { const t = new FakeEl(); t.isTab = true; t.attrs['data-tab'] = id; t.attrs['aria-selected'] = 'false'; return t; });
  const store = new Map();
  if (saved !== null) store.set('qlk_tab', saved);
  const LS = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => { store.set(k, String(v)); }, removeItem: k => { store.delete(k); } };
  const doc = {
    readyState: 'loading', documentElement: new FakeEl(), body: new FakeEl(),
    querySelector: s => (s === '#tabs' ? nav : null),
    querySelectorAll: () => [],
    getElementById: id => byId[id] || null,
    createElement: () => new FakeEl(), createElementNS: () => new FakeEl(),
    addEventListener() {}, removeEventListener() {}
  };
  const tabBtn = id => nav.tabs.find(t => t.attrs['data-tab'] === id);
  return {
    doc, nav, byId, store, LS,
    clickTab: id => nav.dispatch('click', { target: tabBtn(id) }),
    clickSummary: box => {
      const ev = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      box.summary.dispatch('click', ev);
      if (!ev.defaultPrevented) box.open = !box.open; /* hành vi mặc định của <summary> */
    },
    openIds: () => boxes.filter(b => b.open).map(b => b.id),
    selectedIds: () => nav.tabs.filter(t => t.getAttribute('aria-selected') === 'true').map(t => t.attrs['data-tab']),
    activeIds: () => nav.tabs.filter(t => t.classList.contains('is-active')).map(t => t.attrs['data-tab'])
  };
}

test('2.10.0 mặc định mở Bán lẻ: đúng một thẻ mở, nút đang chọn có aria-selected và is-active', () => {
  const env = makeTabEnv(null);
  const c = loadClient({ document: env.doc, localStorage: env.LS });
  c.initTabs();
  assert.deepEqual(env.openIds(), ['retailBox']);
  assert.deepEqual(env.selectedIds(), ['retailBox']);
  assert.deepEqual(env.activeIds(), ['retailBox']);
});

test('2.10.0 qlk_tab lưu mục gần nhất được khôi phục; giá trị lạ thì về Bán lẻ', () => {
  const envOk = makeTabEnv('expBox');
  loadClient({ document: envOk.doc, localStorage: envOk.LS }).initTabs();
  assert.deepEqual(envOk.openIds(), ['expBox']);
  assert.deepEqual(envOk.selectedIds(), ['expBox']);
  const envBad = makeTabEnv('khong-co-muc-nay');
  loadClient({ document: envBad.doc, localStorage: envBad.LS }).initTabs();
  assert.deepEqual(envBad.openIds(), ['retailBox']);
  assert.deepEqual(envBad.selectedIds(), ['retailBox']);
});

test('2.10.0 chọn tab → đúng một <details> mở, nút cập nhật và lưu qlk_tab', () => {
  const env = makeTabEnv(null);
  loadClient({ document: env.doc, localStorage: env.LS }).initTabs();
  env.clickTab('impBox');
  assert.deepEqual(env.openIds(), ['impBox']);
  assert.deepEqual(env.selectedIds(), ['impBox']);
  assert.deepEqual(env.activeIds(), ['impBox']);
  assert.equal(env.store.get('qlk_tab'), 'impBox');
  env.clickTab('chartBox');
  assert.deepEqual(env.openIds(), ['chartBox']);
});

test('2.10.0 mở một details bằng mã → các mục khác đóng và nút cập nhật theo', () => {
  const env = makeTabEnv(null);
  loadClient({ document: env.doc, localStorage: env.LS }).initTabs();
  env.byId.expBox.open = true;
  assert.deepEqual(env.openIds(), ['expBox']);
  assert.deepEqual(env.selectedIds(), ['expBox']);
  assert.deepEqual(env.activeIds(), ['expBox']);
});

test('2.10.0 bấm summary của thẻ đang mở không đóng thẻ (preventDefault)', () => {
  const env = makeTabEnv(null);
  loadClient({ document: env.doc, localStorage: env.LS }).initTabs();
  env.clickSummary(env.byId.retailBox);
  assert.deepEqual(env.openIds(), ['retailBox']);
  env.clickTab('retailBox');
  assert.deepEqual(env.openIds(), ['retailBox'], 'bấm lại nút đang chọn không được đóng mục');
  assert.deepEqual(env.selectedIds(), ['retailBox']);
});

test('2.10.0 chuyển tab không đổi db và không bật dirty', () => {
  const env = makeTabEnv(null);
  const c = loadClient({ document: env.doc, localStorage: env.LS });
  const dbObj = { products: [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
  c.setDb(dbObj);
  c.setDirty(false);
  c.initTabs();
  for (const id of ['nhapBox', 'expBox', 'remedyBox', 'backupBox', 'retailBox']) env.clickTab(id);
  assert.equal(c.getDb(), dbObj, 'db bị thay thế');
  assert.equal(JSON.stringify(c.getDb()), JSON.stringify(dbObj), 'db bị đổi nội dung');
  assert.equal(c.isDirty(), false, 'chuyển tab làm bật dirty');
});

/* Đường đi cha của từng thẻ trong <main>: 'main>details' (con trực tiếp) hoặc 'main>.grid2>details' (con của .grid2 là con trực tiếp của main). */
function cardParentPaths() {
  const start = PAGE.indexOf('<main id="main"');
  const end = PAGE.indexOf('</main>', start);
  assert.ok(start >= 0 && end > start, 'thiếu <main id="main">');
  const body = PAGE.slice(start, end);
  const VOID = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'col', 'source', 'area', 'wbr', 'embed', 'param', 'track', 'use']);
  const stack = [];
  const paths = {};
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  let m;
  while ((m = re.exec(body))) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3];
    if (closing) {
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].tag === tag) { stack.length = k; break; }
      }
      continue;
    }
    if (m[4] === '/' || VOID.has(tag)) continue;
    const idm = attrs.match(/ id="([^"]+)"/);
    const clm = attrs.match(/class="([^"]*)"/);
    const cls = clm ? clm[1] : '';
    if (tag === 'details' && idm) {
      const parent = stack[stack.length - 1];
      const grand = stack[stack.length - 2];
      let path = 'other';
      if (parent && parent.tag === 'main') path = 'main>details';
      else if (parent && parent.tag === 'div' && parent.cls.split(/\s+/).includes('grid2') && grand && grand.tag === 'main') path = 'main>.grid2>details';
      paths[idm[1]] = path;
    }
    stack.push({ tag, cls });
  }
  return paths;
}

test('2.10.0 mỗi thẻ có quy tắc ẩn đúng với đường đi cha của nó (con trực tiếp .main, hoặc con của .grid2 là con trực tiếp .main)', () => {
  const paths = cardParentPaths();
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  const hiddenSel = [];
  for (const m of css.matchAll(/([^{}]+)\{display:none\}/g)) {
    for (const s of m[1].split(',')) hiddenSel.push(s.trim());
  }
  for (const id of TAB_IDS) {
    const p = paths[id];
    assert.ok(p === 'main>details' || p === 'main>.grid2>details', id + ' nằm ngoài cấu trúc tab (đường đi: ' + p + ')');
    const want = p === 'main>details' ? '.main>details.card:not([open])' : '.main>.grid2>details.card:not([open])';
    assert.ok(hiddenSel.includes(want), id + ' thiếu quy tắc ẩn ' + want);
  }
});

test('2.10.0 summary của thẻ đang mở trong chế độ tab không đổi nền khi rê chuột; .grid2 lồng trong thẻ không bị display:contents', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.main>\.grid2>details\.card\[open\]>summary\.card__head:hover\{[^}]*background:var\(--surface\)[^}]*\}/);
  assert.match(css, /\.main>\.grid2\{display:contents\}/);
  assert.doesNotMatch(css, /(^|[},\s])\.grid2\{display:contents\}/, '.grid2 không được có display:contents ngoài .main>.grid2');
});
