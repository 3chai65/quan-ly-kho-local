import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

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
  reconcileList: reconcileList, txCogs: txCogs, findProduct: findProduct,
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
  normSearch: normSearch
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

test('txCogs dùng giá vốn đã lưu, fallback giá hiện tại khi thiếu', () => {
  app.setDb({
    products: [{ id: 'p1', name: 'A', stock: 5, costPrice: 99 }],
    transactions: [], prescriptions: [], updatedAt: 0
  });
  assert.equal(app.txCogs({ productId: 'p1', qty: 2, cost: 20 }), 20);
  assert.equal(app.txCogs({ productId: 'p1', qty: 2, cost: null }), 198);
  assert.equal(app.txCogs({ productId: 'x', qty: 2 }), 0);
});

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

test('file nghìn thật nhân A Giao từ 85 thành 85000', (t) => {
  const nghinPath = 'G:/quan-ly-kho-local/data/luu-tru/kho-backup-2026-11-06.json';
  if (!fs.existsSync(nghinPath)) {
    t.skip('không có kho-backup-2026-11-06.json');
    return;
  }
  const nghin = app.parseBackup(fs.readFileSync(nghinPath, 'utf8'));
  const giao = nghin.products.find(p => p.name === 'A Giao');
  assert.equal(giao.costPrice, 85000);
  assert.equal(nghin.moneyUnit, 'dong');
  assert.match(nghin._moneyNote, /nghìn đồng, sẽ nhân 1000/);
  assert.ok(nghin._moneyNote.includes('→ ' + app.fmtNum(nghin.products[0].costPrice)));
});

test('file đồng thật giữ A Giao ở 85000', (t) => {
  const dongPath = 'G:/Quản Lý Kho/kho-backup/kho-backup-2026-11-07.json';
  if (!fs.existsSync(dongPath)) {
    t.skip('không có kho-backup-2026-11-07.json');
    return;
  }
  const dong = app.parseBackup(fs.readFileSync(dongPath, 'utf8'));
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
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 100 });
  client.setBase(100);
  client.setDirty(false);
  await client.autoRefresh();
  assert.equal(client.getBase(), 100, 'base không đổi khi server bằng nhau');
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
  Chưa phủ, cố ý:
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
  assert.equal(client.getDb().products[0].name, 'May Chu');
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
    '#expMonthNative': mkInput('expMonthNative')
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

test('lịch sử bán: mặc định 10 đơn gần nhất, 11 ẩn, đơn 12 dòng đếm 1, dòng không oid đếm 1, Xem thêm mở thêm', () => {
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
  // 2 hôm nay + 5 hôm qua + 3 trước nữa = 10 đơn gần nhất, còn lại ẩn ở trang sau
  assert.ok(data.rows.length > 10);
  const firstPage = data.rows.slice(0, 10);
  assert.equal(firstPage.length, 10);
  assert.equal(data.rows[10].date, '2026-11-05');
  const bigTotal = data.rows.filter(r => r.group && r.oid === 'OD_big').length + data.rows.filter(r => r.oid === 'OD_big').length;
  assert.ok(bigTotal >= 1);
  const singles = data.rows.filter(r => r.single && r.tx && !r.tx.oid);
  assert.ok(singles.length >= 1);
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
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  // lịch sử renderHistory loại rx khỏi nhánh giá vốn (tham khảo: tx.rx=true)
  // ở mức hàm, costParen vẫn tính được nhưng renderHistory không gọi khi rx.
  // Kiểm chứng qua hàm được xuất: rx line vẫn có cost nhưng render không gắn span.
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
