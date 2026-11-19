import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
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
  footBarShow: (typeof footBarShow === 'function' ? footBarShow : null), kbLockTop: (typeof kbLockTop === 'function' ? kbLockTop : null), kbLock: (typeof kbLock === 'function' ? kbLock : null), kbUnlock: (typeof kbUnlock === 'function' ? kbUnlock : null), kbRelease: (typeof kbRelease === 'function' ? kbRelease : null), compactAvail: (typeof compactAvail === 'function' ? compactAvail : null), compactFitHeight: (typeof compactFitHeight === 'function' ? compactFitHeight : null), compactListHeight: (typeof compactListHeight === 'function' ? compactListHeight : null), compactWanted: (typeof compactWanted === 'function' ? compactWanted : null), compactSync: (typeof compactSync === 'function' ? compactSync : null), wholeWordMatch: (typeof wholeWordMatch === 'function' ? wholeWordMatch : null), sugWhole: (typeof sugWhole === 'function' ? sugWhole : null), sugListMaxHeight: (typeof sugListMaxHeight === 'function' ? sugListMaxHeight : null), sugReveal: (typeof sugReveal === 'function' ? sugReveal : null), matchProducts: (typeof matchProducts === 'function' ? matchProducts : null), focusNS: (typeof focusNS === 'function' ? focusNS : null), initFootBars: (typeof initFootBars === 'function' ? initFootBars : null), refocusSearch: (typeof refocusSearch === 'function' ? refocusSearch : null), onVvChange: (typeof onVvChange === 'function' ? onVvChange : null), addRetailToNote: (typeof addRetailToNote === 'function' ? addRetailToNote : null), updateFootBars: (typeof updateFootBars === 'function' ? updateFootBars : null),
  fmtQtyInt: (typeof fmtQtyInt === 'function' ? fmtQtyInt : null), fmtKgExact: (typeof fmtKgExact === 'function' ? fmtKgExact : null), kInput: (typeof kInput === 'function' ? kInput : null), fmtUnitPrice: (typeof fmtUnitPrice === 'function' ? fmtUnitPrice : null),
  fmtMoneyInt: (typeof fmtMoneyInt === 'function' ? fmtMoneyInt : null), fmtMoney: (typeof fmtMoney === 'function' ? fmtMoney : null), fmtNum: (typeof fmtNum === 'function' ? fmtNum : null), fmtQty: (typeof fmtQty === 'function' ? fmtQty : null), dec: (typeof dec === 'function' ? dec : null), num: (typeof num === 'function' ? num : null),
  pendEntryH: (typeof pendEntryH === 'function' ? pendEntryH : null), sanitize: (typeof sanitize === 'function' ? sanitize : null), parseBackup: (typeof parseBackup === 'function' ? parseBackup : null),
  reconcileList: (typeof reconcileList === 'function' ? reconcileList : null), findProduct: (typeof findProduct === 'function' ? findProduct : null), renderStats: (typeof renderStats === 'function' ? renderStats : null),
  loadPreset: (typeof loadPreset === 'function' ? loadPreset : null), remedyPresetPick: typeof remedyPresetPick === 'function' ? remedyPresetPick : null, recFix: (typeof recFix === 'function' ? recFix : null), resetDrafts: (typeof resetDrafts === 'function' ? resetDrafts : null), checkLimits: (typeof checkLimits === 'function' ? checkLimits : null),
  backupLastDate: (typeof backupLastDate === 'function' ? backupLastDate : null), commitRetailRow: (typeof commitRetailRow === 'function' ? commitRetailRow : null),
  commitRemedyRow: (typeof commitRemedyRow === 'function' ? commitRemedyRow : null), onSuggestKey: (typeof onSuggestKey === 'function' ? onSuggestKey : null),
  getRemedyItems: function(){ return remedyItems; },
  presetFindOpen: presetFindOpen, presetFindKey: presetFindKey, closePreset: closePreset, pickPresetRow: pickPresetRow, renderRemedyNote: renderRemedyNote, getRemedyNotePage: function(){ return remedyNotePage; }, setRemedyNotePage: function(v){ remedyNotePage = v; },
  getRetailItems: function(){ return retailItems; },
  getNotePage: function(){ return notePage; }, setNotePage: function(v){ notePage = v; },
  getNhapList: function(){ return nhapList; },
  renderNhapList: renderNhapList, getNhapNotePage: function(){ return nhapNotePage; }, setNhapNotePage: function(v){ nhapNotePage = v; }, bindEvents: bindEvents, orderEmpty: orderEmpty, addOrderRow: addOrderRow, calcNhap: calcNhap, nhapPick: nhapPick,
  getTxEdit: function(){ return txEditCur; },
  getOrderCur: function(){ return orderCur; }, setOrderCur: function(v){ orderCur = v; },
  getNhapPid: function(){ return nhapPid; }, setNhapPid: function(v){ nhapPid = v; },
  setTxEdit: function(v){ txEditCur = v; },
  getInvPage: function(){ return invPage; },
  setInvPage: function(v){ invPage = v; },
  renderPresetOptions: (typeof renderPresetOptions === 'function' ? renderPresetOptions : null),
  renderInventory: (typeof renderInventory === 'function' ? renderInventory : null),
  wrapRenderInventory: function(fn){ var orig = renderInventory; renderInventory = function(){ fn(); return orig.apply(this, arguments); }; },
  setDb: function(v){ db = v; },
  getDb: function(){ return db; },
  setDirty: function(v){ dirty = !!v; }, isPushing: function(){ return pushing; }, apiFetch: (typeof apiFetch === 'function' ? apiFetch : null),
  isDirty: function(){ return dirty; }, tsFromId: tsFromId, txStamp: txStamp, lastImport: lastImport, uid: uid,
  setBase: function(v){ cloudBase = dec(v); },
  getBase: function(){ return cloudBase; },
  saveLocal: (typeof saveLocal === 'function' ? saveLocal : null), readDirty: (typeof readDirty === 'function' ? readDirty : null), readBase: (typeof readBase === 'function' ? readBase : null),
  computeStats: (typeof computeStats === 'function' ? computeStats : null), allocateRemedyByCost: (typeof allocateRemedyByCost === 'function' ? allocateRemedyByCost : null),
  balanceRemedyMoney: (typeof balanceRemedyMoney === 'function' ? balanceRemedyMoney : null), kToDong: (typeof kToDong === 'function' ? kToDong : null),
  applyRemedyBalance: (typeof applyRemedyBalance === 'function' ? applyRemedyBalance : null), scaledRemedyCost: (typeof scaledRemedyCost === 'function' ? scaledRemedyCost : null), remedyLineCost: (typeof remedyLineCost === 'function' ? remedyLineCost : null),
  backupBeforeRestore: (typeof backupBeforeRestore === 'function' ? backupBeforeRestore : null), downloadBackup: (typeof downloadBackup === 'function' ? downloadBackup : null),
  pushState: (typeof pushState === 'function' ? pushState : null), pullState: (typeof pullState === 'function' ? pullState : null), cloudConflict: (typeof cloudConflict === 'function' ? cloudConflict : null),
  autoRefresh: (typeof autoRefresh === 'function' ? autoRefresh : null), busyEditing: (typeof busyEditing === 'function' ? busyEditing : null),
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
  setAuthLost: function(v){ authLost = !!v; }, setRefreshing: function(v){ refreshing = !!v; },
  renderSyncBadge: (typeof renderSyncBadge === 'function' ? renderSyncBadge : null),
  discardUnsynced: (typeof discardUnsynced === 'function' ? discardUnsynced : null), restoreFromFile: (typeof restoreFromFile === 'function' ? restoreFromFile : null),
  readLocal: (typeof readLocal === 'function' ? readLocal : null),
  saveNhap: (typeof saveNhap === 'function' ? saveNhap : null), saveRetail: (typeof saveRetail === 'function' ? saveRetail : null), saveRemedy: (typeof saveRemedy === 'function' ? saveRemedy : null),
  openTxEdit: (typeof openTxEdit === 'function' ? openTxEdit : null), saveTxEdit: (typeof saveTxEdit === 'function' ? saveTxEdit : null), delTx: (typeof delTx === 'function' ? delTx : null),
  rowMenu: (typeof rowMenu === 'function' ? rowMenu : null), closeRowMenu: (typeof closeRowMenu === 'function' ? closeRowMenu : null),
  getStockWarnText: function(){ return stockWarnText; },
  todayISO: (typeof todayISO === 'function' ? todayISO : null), thisYear: (typeof thisYear === 'function' ? thisYear : null),
  getDateInput: (typeof getDateInput === 'function' ? getDateInput : null), setDateInput: (typeof setDateInput === 'function' ? setDateInput : null),
  bindDateInput: (typeof bindDateInput === 'function' ? bindDateInput : null), userPickedDate: (typeof userPickedDate === 'function' ? userPickedDate : null),
  refreshAutoDates: (typeof refreshAutoDates === 'function' ? refreshAutoDates : null), autoDateInput: (typeof autoDateInput === 'function' ? autoDateInput : null), autoChartYear: (typeof autoChartYear === 'function' ? autoChartYear : null),
  getLastAuto: function(id){ return lastAuto[id]; },
  setLastAuto: function(id, v){ lastAuto[id] = v; },
  getLastChartYear: function(){ return lastChartYear; },
  setLastChartYear: function(v){ lastChartYear = v; },
  setActiveId: function(id){ doc.activeElement = id ? $('#' + id) : null; },
  initDates: function(){ var t = todayISO(); setDateInput('retailDate', t); setDateInput('remedyDate', t); lastAuto.retailDate = t; lastAuto.remedyDate = t; var cy = $('#chartYear'); if (cy) cy.value = thisYear(); lastChartYear = thisYear(); },
  latestImportMap: (typeof latestImportMap === 'function' ? latestImportMap : null), importParen: (typeof importParen === 'function' ? importParen : null), costParen: (typeof costParen === 'function' ? costParen : null),
  historyData: (typeof historyData === 'function' ? historyData : null), renderHistory: (typeof renderHistory === 'function' ? renderHistory : null), renderNote: (typeof renderNote === 'function' ? renderNote : null), qtyHintCandidates: (typeof qtyHintCandidates === 'function' ? qtyHintCandidates : null), qtyHintPlacement: (typeof qtyHintPlacement === 'function' ? qtyHintPlacement : null), qtyHintText: (typeof qtyHintText === 'function' ? qtyHintText : null), attachQtyHint: (typeof attachQtyHint === 'function' ? attachQtyHint : null), refreshAllQtyHints: (typeof refreshAllQtyHints === 'function' ? refreshAllQtyHints : null),
  setImpPage: function(v){ impPage = v; }, getImpPage: function(){ return impPage; },
  setExpPage: function(v){ expPage = v; }, getExpPage: function(){ return expPage; },
  normSearch: (typeof normSearch === 'function' ? normSearch : null),
  handleAction: (typeof handleAction === 'function' ? handleAction : null), toast: (typeof toast === 'function' ? toast : null), brandDevicesClick: (typeof brandDevicesClick === 'function' ? brandDevicesClick : null), renderNote: (typeof renderNote === 'function' ? renderNote : null), chartDefaultMonth: (typeof chartDefaultMonth === 'function' ? chartDefaultMonth : null), renderChart: (typeof renderChart === 'function' ? renderChart : null), onChartClick: (typeof onChartClick === 'function' ? onChartClick : null), getChartSel: function(){ return chartSel; }, chartMonths: (typeof chartMonths === 'function' ? chartMonths : null), chartTicks: (typeof chartTicks === 'function' ? chartTicks : null), chartYearStep: (typeof chartYearStep === 'function' ? chartYearStep : null), chartYearGo: (typeof chartYearGo === 'function' ? chartYearGo : null), getChartYr: function(){ return chartYr; }, noteSyncFailure: (typeof noteSyncFailure === 'function' ? noteSyncFailure : null), renderSyncLine: (typeof renderSyncLine === 'function' ? renderSyncLine : null), setLastSyncOk: function(v){ lastSyncOk = v; }, setChartYr: function(v){ chartYr = v; }, chartData: (typeof chartData === 'function' ? chartData : null), onChartMove: (typeof onChartMove === 'function' ? onChartMove : null), setChartSel: function(v){ chartSel = v; }, addNhapItem: (typeof addNhapItem === 'function' ? addNhapItem : null), addRemedyToNote: (typeof addRemedyToNote === 'function' ? addRemedyToNote : null), delOrder: (typeof delOrder === 'function' ? delOrder : null), openOrder: (typeof openOrder === 'function' ? openOrder : null), pickSuggest: (typeof pickSuggest === 'function' ? pickSuggest : null),
  scheduleSyncRetry: (typeof scheduleSyncRetry === 'function' ? scheduleSyncRetry : null), noteSave: (typeof noteSave === 'function' ? noteSave : null), remedyNoteSave: (typeof remedyNoteSave === 'function' ? remedyNoteSave : null),
  savePreset: (typeof savePreset === 'function' ? savePreset : null), saveEdit: (typeof saveEdit === 'function' ? saveEdit : null), remedyPresetPick: (typeof remedyPresetPick === 'function' ? remedyPresetPick : null), remedySavePresetClick: (typeof remedySavePresetClick === 'function' ? remedySavePresetClick : null), remedyNameShow: (typeof remedyNameShow === 'function' ? remedyNameShow : null),
  setNoteEditIdx: function(v){ noteEditIdx = v; }, setRemedyEditIdx: function(v){ remedyEditIdx = v; },
  getRetailItems: function(){ return retailItems; }, getRemedyItems: function(){ return remedyItems; },
  isStandaloneMode: (typeof isStandaloneMode === 'function' ? isStandaloneMode : null), renderReloadBtn: (typeof renderReloadBtn === 'function' ? renderReloadBtn : null), reloadAppClick: (typeof reloadAppClick === 'function' ? reloadAppClick : null), bakView: (typeof bakView === 'function' ? bakView : null), getRemedyNotePage: function(){ return remedyNotePage; }, setRemedyNotePage: function(v){ remedyNotePage = v; }, getPresetPage: function(){ return presetPage; }, setPresetPage: function(v){ presetPage = v; },
  loadBakList: (typeof loadBakList === 'function' ? loadBakList : null), bakSizeText: (typeof bakSizeText === 'function' ? bakSizeText : null),
  recFixAll: (typeof recFixAll === 'function' ? recFixAll : null), initTabs: (typeof initTabs === 'function' ? initTabs : null)
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
    parseFloat, isFinite, NaN, Infinity, Map, Set, Promise, AbortController,
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
  };
  Object.defineProperties(sandbox, Object.getOwnPropertyDescriptors(extra));
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

test('2.15.16 pushState 400/428 toast lỗi đúng một lần với d.error rút gọn; 401/409 không toast kiểu này', async () => {
  const run = async (status, error) => {
    const { doc } = toastDoc(false);
    let writes = [];
    const mEl = doc.querySelector('#toastMsg');
    Object.defineProperty(mEl, 'textContent', { get() { return writes[writes.length - 1] || ''; }, set(v) { writes.push(v); } });
    const client = loadClient({
      document: doc,
      fetch: async () => ({ status, json: async () => ({ success: false, error }) }),
      setTimeout() { return 0; }, clearTimeout() {}
    });
    client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
    client.setBase(1);
    await client.pushState(false, false);
    return writes;
  };
  for (const status of [400, 428]) {
    const w = await run(status, 'Lý do ' + status);
    assert.equal(w.length, 1);
    assert.match(w[0], /Chưa lưu được: Lý do /);
    assert.ok(w[0].includes('Lý do ' + status));
  }
  const long = await run(400, 'x'.repeat(500));
  assert.equal(long.length, 1);
  assert.ok(long[0].length < 160);
  assert.equal((await run(401, 'Thiết bị chưa được duyệt')).filter(t => /Chưa lưu được:/.test(t)).length, 0);
  assert.equal((await run(409, 'x')).filter(t => /Chưa lưu được:/.test(t)).length, 0);
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

test('W3 pushState gửi X-Op-Id, giữ nguyên khi thử lại cùng snapshot, đổi sau khi thành công và khi nội dung đổi', async () => {
  const ops = [];
  let n = 0;
  const fetchStub = async (url, opts = {}) => {
    if ((opts.method || 'GET') === 'PUT') {
      ops.push(opts.headers['X-Op-Id']);
      n++;
      if (n === 1) return { status: 500, json: async () => ({ success: false }) };
      return { status: 200, json: async () => ({ success: true, updatedAt: 100 + n }) };
    }
    return { status: 200, json: async () => ({ success: true, data: { products: [], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' } }) };
  };
  const client = loadClient({ fetch: fetchStub, setTimeout(fn, ms) { return ms || 1; }, clearTimeout() {} });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setBase(1);
  await client.pushState(false, false);   // 500
  await client.pushState(false, false);   // thử lại, thành công
  assert.match(ops[0], /^OP_[A-Za-z0-9_-]+$/);
  assert.equal(ops[0], ops[1]);
  await client.pushState(false, false);   // CÙNG nội dung sau thành công: opId mới
  assert.notEqual(ops[2], ops[1]);
  client.setDb({ products: [{ id: 'X', name: 'x', stock: 2, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1 });
  await client.pushState(false, false);
  assert.notEqual(ops[3], ops[2]);
});

function hangFetch(log) {
  return (url, opts = {}) => {
    log.push({ method: opts.method || 'GET', op: opts.headers && opts.headers['X-Op-Id'], signal: opts.signal });
    return new Promise((res, rej) => {
      opts.signal.addEventListener('abort', () => { const e = new Error('aborted'); e.name = 'AbortError'; rej(e); });
    });
  };
}

test('W4 apiFetch: mạng treo thì sau 15 s bị AbortError; PUT timeout nhả pushing, giữ dirty, gửi lại cùng X-Op-Id', async () => {
  const timers = [];
  const log = [];
  const client = loadClient({
    fetch: hangFetch(log),
    setTimeout(fn, ms) { timers.push({ fn, ms, cleared: false }); return timers.length - 1; },
    clearTimeout(id) { if (timers[id]) timers[id].cleared = true; }
  });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setBase(1);
  client.setDirty(true);
  const p = client.pushState(false, false);
  assert.equal(client.isPushing(), true);
  const t = timers.find(x => x.ms === 15000);
  assert.ok(t, 'phải đặt timer 15000 ms');
  t.fn();
  assert.equal(await p, false);
  assert.equal(client.isPushing(), false);
  assert.equal(client.isDirty(), true);
  assert.match(client.getSyncDetail(), /15 giây/);
  const p2 = client.pushState(false, false);
  timers.filter(x => x.ms === 15000 && !x.cleared && x !== t).forEach(x => x.fn());
  await p2;
  assert.equal(log.length, 2);
  assert.equal(log[0].op, log[1].op);
});

test('W4 apiFetch: phản hồi nhanh thì không abort và timer bị xóa; hết giờ thì reject AbortError', async () => {
  const timers = [];
  const ok = loadClient({
    fetch: async () => ({ status: 200, json: async () => ({}) }),
    setTimeout(fn, ms) { timers.push({ fn, ms, cleared: false }); return timers.length - 1; },
    clearTimeout(id) { if (timers[id]) timers[id].cleared = true; }
  });
  const r = await ok.apiFetch('/x');
  assert.equal(r.status, 200);
  assert.equal(timers[0].ms, 15000);
  assert.equal(timers[0].cleared, false, 'chưa đọc thân thì timer còn chạy');
  await r.json();
  assert.equal(timers[0].cleared, true);
  const t2 = [];
  const hang = loadClient({
    fetch: hangFetch([]),
    setTimeout(fn, ms) { t2.push(fn); return 0; },
    clearTimeout() {}
  });
  const q = hang.apiFetch('/x');
  t2[0]();
  await assert.rejects(q, e => e.name === 'AbortError');
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
  assert.equal(timers.some(t => t.ms > 4000 && t.ms !== 15000), false);
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
test('W7: sanitize giữ oname khi thiếu oid', () => {
  const out = app.sanitize({
    products: [{ id: 'p1', name: 'Cam thảo', stock: 10, costPrice: 50 }],
    transactions: [{ id: 't1', date: '2026-11-06', type: 'BAN', productId: 'p1', qty: 1, price: 60, total: 60, oname: 'Bán lẻ' }],
    prescriptions: []
  });
  assert.equal(out.transactions[0].oname, 'Bán lẻ');
  assert.equal(out.transactions[0].oid, undefined);
});
test('W8: khóa tên sản phẩm gộp khoảng trắng và NFC (trùng bị loại)', () => {
  const mk = (a, b) => app.sanitize({
    products: [{ id: 'p1', name: a, stock: 1, costPrice: 1 }, { id: 'p2', name: b, stock: 1, costPrice: 1 }],
    transactions: [], prescriptions: []
  }).products.length;
  assert.equal(mk('Cam  Thảo', 'Cam Thảo'), 1);
  assert.equal(mk('Thảo', 'Thảo'), 1);
  assert.equal(mk('Cam Thảo', 'Cam Thao'), 2);
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
  const need = new Set(['txEditName', 'txEditQty', 'txEditPrice', 'remedyUnitPrice', 'remedyThang']);
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

test('chuỗi thao tác ngẫu nhiên giữ tồn bằng nhập trừ bán', (t) => {
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
  const ran = { nhap: 0, retail: 0, remedy: 0, edit: 0, delete: 0 };
  const blocked = { nhap: 0, retail: 0, remedy: 0, edit: 0, delete: 0 };
  const idle = { nhap: 0, retail: 0, remedy: 0, edit: 0, delete: 0 };

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
      }
    }
  }

  /* 2.13.0: không console.log trong test – stdout xen với kênh báo cáo của node --test gây lỗi "Unable to deserialize" (ngẫu nhiên). Dùng t.diagnostic. */
  t.diagnostic('Độ phủ seed ' + SEED);
  t.diagnostic('loại\tchạy\tchặn\tkhông đổi');
  for (const k of ['nhap', 'retail', 'remedy', 'edit', 'delete']) {
    t.diagnostic(k + '\t' + ran[k] + '\t' + blocked[k] + '\t' + idle[k]);
  }
  for (const k of Object.keys(ran)) assert.ok(ran[k] > 0, k + ' không chạy lần nào');
  assert.ok(ran.edit > blocked.edit + idle.edit, 'sửa bị bỏ qua nhiều hơn số lần chạy');
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
  const data = client.historyData('exp', null);
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
  const all = client.historyData('imp', null);
  // 3 đơn lẻ + 1 đơn gộp (IM_g1) = 4
  assert.equal(all.rows.length, 4);
  const found = client.historyData('imp', null, 'cam');
  // i1 + i3 + đơn gộp IM_g1 = 3
  assert.equal(found.rows.length, 3);
  const cleared = client.historyData('imp', null, '');
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
  const d = client.historyData('exp', null);
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
  const f = client.historyData('imp', null, 'cam');
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

test('2.21.2 saveTxEdit: dòng NHAP có rx, hoàn tác khi giá thấp hơn vốn trả tồn đúng chiều', () => {
  const dom = limitStock();
  const tx = { id: 'r1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 100, total: 100, cost: 5000, ts: 2000, rx: true, thang: 1, g: 1000, oid: 'R1' };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 10, costPrice: 1 }], [tx]);
  c.openTxEdit('r1');
  dom.set('txEditQty', '2000');
  c.saveTxEdit();
  assert.match(toastText(dom), /Giá bán thấp hơn vốn/);
  assert.equal(c.getDb().products[0].stock, 10);
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
  assert.equal(PAGE.match(/data-action="/g).length - [...NEW_213, ...NEW_214, ...NEW_215, ...NEW_226].reduce((n, a) => n + PAGE.split('data-action="' + a + '"').length - 1, 0), 15, 'data-action cũ đã đổi (nhap-add, brand-devices thêm; 4 nút Gần nhất/Tất cả đã bỏ ở 2.13.0)');
  const ids = [...PAGE.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'id trùng nhau: ' + ids.filter((x, k) => ids.indexOf(x) !== k));
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

test('F13 recDlg: bấm ra nền thì đóng đúng như nút Đóng; bấm vào nội dung thì không đóng', () => {
  const { doc, els, rec } = recDoc(['recDlg']);
  let closedRec = 0;
  els['#recDlg'].close = () => { closedRec++; };
  loadClient({ document: doc, fetch: async () => { throw new Error('offline'); }, setInterval() { return 0; }, clearInterval() {} });
  const inner = {};
  const fire2 = (id, target) => (rec[id]?.click || []).forEach(fn => fn({ target }));
  fire2('recDlg', inner);
  assert.equal(closedRec, 0);
  fire2('recDlg', els['#recDlg']);
  assert.equal(closedRec, 1);
});

test('F14 bỏ class không dùng .stack, .hide-sm và thuộc tính data-sug', () => {
  assert.doesNotMatch(PAGE, /\.stack\{|\.hide-sm\{|data-sug=/);
});

/* ===== 2.10.0: tab 8 mục (giao diện). Chỉ kiểm HTML/CSS/điều hướng; không chạm logic tiền/tồn/đồng bộ. ===== */
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const TAB_IDS = ['retailBox', 'remedyBox', 'nhapBox', 'invBox', 'impBox', 'expBox', 'chartBox', 'backupBox'];
const TAB_ORDER_DOM = ['retailBox', 'remedyBox', 'nhapBox', 'chartBox', 'invBox', 'impBox', 'expBox', 'backupBox'];
const TAB_LABELS = ['Bán lẻ', 'Thuốc chén', 'Nhập hàng', 'Kho tồn', 'Lịch sử nhập', 'Lịch sử bán', 'Thống kê', 'Sao lưu khôi phục'];
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
  const labels = btns.map(b => [...b.matchAll(/<span[^>]*>([^<]*)<\/span>/g)].map(m => m[1]).join(' ').replace(/&amp;/g, '&'));
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
    const want = TAB_ARIA[id] || TAB_LABELS[TAB_IDS.indexOf(id)];
    assert.equal(a && a[1].replace(/&amp;/g, '&'), want, id + ' aria-label');

  }
});

/* 2.10.1: quy tắc điện thoại phải đứng SAU quy tắc gốc cùng bộ chọn, nếu không quy tắc gốc ghi đè (cùng độ ưu tiên). */
test('2.10.1 thứ tự CSS: quy tắc gốc .tabs/.tab/.tab__ic/.stat đứng TRƯỚC khối điện thoại cùng bộ chọn', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  // .tabs: gốc (8 cột) trước khối 600px (4 cột)
  assert.ok(at('.tabs{display:grid') < at('repeat(4,minmax(0,1fr))'), '.tabs gốc phải đứng trước quy tắc 4 cột điện thoại');
  // .tab: gốc (display:flex) trước khối 600px (11px)
  assert.ok(at('.tab{display:flex') < at('.tab{padding:4px 2px;font-size:12px}'), '.tab gốc phải đứng trước quy tắc điện thoại');

  // quy tắc điện thoại của tab phải nằm trong @media (max-width:600px)
  const m = PAGE.lastIndexOf('@media (max-width:600px)', at('repeat(4,minmax(0,1fr))'));
  assert.ok(m >= 0 && PAGE.indexOf('@media', m + 1) > at('repeat(4,minmax(0,1fr))'), 'repeat(4) phải nằm trong @media (max-width:600px)');
});

/* 2.12.1 (bản căn nút +): nút cột cuối điện thoại đứng hàng 2, align-self:end; không còn grid-area 1/4/3/5. */
test('2.12.1 căn nút + điện thoại: table.ord đặt nút ở 2/4, align-self:end, trong @media (max-width:600px), sau quy tắc gốc', () => {
  assert.doesNotMatch(PAGE, /table\.ord tr\.is-row>td:nth-child\(5\)\{grid-area:1\/4\/3\/5/, 'còn 1/4/3/5 ở table.ord');
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  const base = at('table.ord tr.is-row,table.inv tr.is-row,table.his tr.is-row{display:grid');
  const ro = at('table.ord tr.is-row>td:nth-child(5){grid-area:2/4;justify-self:end;align-self:end}');
  assert.ok(base < ro, 'quy tắc nút phải sau quy tắc gốc');
  assert.equal(PAGE.lastIndexOf('@media', ro), PAGE.lastIndexOf('@media (max-width:600px)', ro), 'table.ord phải trong @media (max-width:600px)');
  assert.match(PAGE, /table\.ord tr\.is-row>td:nth-child\(5\) \.btn\{width:44px;min-width:44px;height:44px;min-height:44px/, 'nút phải vuông 44px');
  assert.match(PAGE, /table\.ord tr\.is-row>td:nth-child\(2\)\{grid-area:1\/2\/2\/5;/, 'tên hàng 1 phải rộng hết hàng (1/2/2/5)');
});

/* 2.12.1: điện thoại (≤600px) – ô Vị thuốc cả hàng; hàng dưới Số lượng | Giá nhập | nút +; đặt SAU quy tắc gốc và khối 640px. */
test('2.14.0 Nhập hàng: ô tên nằm trong thanh card__bar; không còn class nhap-row (quy tắc CSS đã bỏ ở 2.15.7)', () => {
  assert.doesNotMatch(PAGE, /nhap-row/, 'không còn class nhap-row');
  /* 2.14.0 (giai đoạn 2b): ô tên nằm trong thanh card__bar của Nhập hàng, không còn nhãn chữ phía trên. */
  assert.match(PAGE, /<div class="sug card__bar-search">\s*<input class="inp" id="nhapSearch"/, 'ô tên phải nằm trong thanh card__bar');
});

/* 2.13.0 (N5): lịch sử luôn mới nhất trước; bỏ Gần nhất/Tất cả; Lịch sử bán có ô tìm tên (expSearch) như Lịch sử nhập. */
test('2.13.0 N5: không còn 4 nút latest/clear, không còn impAll/expAll/latestOnly, historyData không có nhánh sắp theo tên', () => {
  for (const a of ['latest-imp', 'clear-imp', 'latest-exp', 'clear-exp']) assert.equal(PAGE.split('data-action="' + a + '"').length - 1, 0, a + ' còn trong PAGE');
  assert.doesNotMatch(PAGE, /impAll|expAll|latestOnly/);
  assert.doesNotMatch(PAGE, /function historyData[\s\S]*?\nfunction renderHistory[\s\S]*?localeCompare/, 'historyData còn sắp theo tên');
});

test('2.13.0 N5 lịch sử luôn mới nhất trước, kể cả sau khi gõ tìm rồi xóa ô tìm', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  client.setDb({
    products: [{ id: 'p1', name: 'Đảng sâm', stock: 9, costPrice: 1000 }, { id: 'p2', name: 'Cam thảo', stock: 9, costPrice: 1000 }],
    transactions: [
      { id: 'e1', date: '2026-11-02', type: 'BAN', productId: 'p2', qty: 1, price: 1000, total: 1000, cost: 500, ts: 100 },
      { id: 'e2', date: '2026-11-03', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 200 },
      { id: 'e3', date: '2026-11-04', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 300 }
    ],
    prescriptions: [], updatedAt: 1, moneyUnit: 'dong'
  });
  const tsOf = d => d.rows.map(r => r.tx ? r.tx.ts : r.ts);
  assert.equal(tsOf(client.historyData('exp', null, '')).join(','), '300,200,100');
  client.historyData('exp', null, 'dang sam');
  assert.equal(tsOf(client.historyData('exp', null, '')).join(','), '300,200,100', 'sau khi gõ rồi xóa ô tìm vẫn mới nhất trước');
});

test('2.13.0 N5 tìm tên ở Lịch sử bán: "dang sam" khớp "Đảng sâm" (không dấu, không hoa thường), lọc đúng và không giới hạn 10 đơn', () => {
  const client = loadClient({ Date: fakeClock(2026, 10, 8, 12), setTimeout() { return 0; }, clearTimeout() {} });
  const txs = [];
  for (let i = 0; i < 14; i++) txs.push({ id: 'd' + i, date: '2026-11-05', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 1000, cost: 500, ts: 1000 + i });
  for (let i = 0; i < 3; i++) txs.push({ id: 'c' + i, date: '2026-11-06', type: 'BAN', productId: 'p2', qty: 1, price: 1000, total: 1000, cost: 500, ts: 2000 + i });
  client.setDb({ products: [{ id: 'p1', name: 'Đảng sâm', stock: 9, costPrice: 1000 }, { id: 'p2', name: 'Cam thảo', stock: 9, costPrice: 1000 }], transactions: txs, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  const f = client.historyData('exp', null, 'DANG sam');
  assert.equal(f.rows.length, 14, 'phải lấy đủ 14 đơn khớp, không chỉ 10');
  assert.ok(f.rows.every(r => (r.name || '') === 'Đảng sâm'), 'chỉ đơn Đảng sâm');
  const none = client.historyData('exp', null, 'khong co');
  assert.equal(none.rows.length, 0);
  assert.equal(client.historyData('exp', null, '').rows.length, 17, 'xóa ô tìm trả về đủ mọi đơn');
  const html = PAGE.match(/<input class="inp inp--sm[^"]*" id="expSearch"[^>]*>/);
  assert.ok(html, 'thiếu ô expSearch');
  assert.match(PAGE, /expS\.addEventListener\('input', function\(\)\{ expPage = 1; renderHistory\('exp'\); \}\);/, 'gõ phải đặt trang 1');
});

/* 2.13.1: menu chế độ neo mép trái nút âm dương (không tràn 320–375px); tick cho lựa chọn; toast lỗi có biểu tượng cảnh báo; Esc đóng menu. */
test('2.13.1 toast lỗi dùng biểu tượng cảnh báo; thông báo thường vẫn dấu ✓', () => {
  assert.match(PAGE, /<symbol id="i-warn"/);
  assert.match(PAGE, /<svg class="ico toast__warn" aria-hidden="true"><use href="#i-warn"\/><\/svg>/);
  assert.match(PAGE, /<svg class="ico toast__ok" aria-hidden="true"><use href="#i-check"\/><\/svg>/);
  assert.match(PAGE, /\.toast\[data-kind=error\] \.toast__warn\{display:inline-block\}/);
  assert.match(PAGE, /\.toast\[data-kind=error\] \.toast__ok\{display:none\}/);
});

/* 2.13.2: Thống kê – số liệu ở đầu thẻ; ô năm một khung; dòng dữ liệu hai ô màu; tháng mặc định; bấm lại về mặc định. */
test('2.13.2 Thống kê: không còn .stats--chart, chú giải .legend hay dòng "Bấm vào cột"', () => {
  assert.doesNotMatch(PAGE, /stats--chart/);
  assert.doesNotMatch(PAGE, /Bấm vào cột/);
  assert.doesNotMatch(PAGE, /class="legend"/);
  assert.doesNotMatch(PAGE, /\.legend\{/);
});

test('2.13.2 statImport/statStock nằm trong summary đầu thẻ #chartBox (id giữ nguyên); summary không còn chữ "Năm"', () => {
  for (const id of ['statImport', 'statStock']) assert.equal(PAGE.split('id="' + id + '"').length - 1, 1, id + ' phải đúng một lần');
  const c0 = PAGE.indexOf('<details class="card" id="chartBox"');
  const sum = PAGE.slice(c0, PAGE.indexOf('</summary>', c0));
  assert.ok(sum.includes('id="statImport"') && sum.includes('id="statStock"'), 'thiếu số liệu trong summary');
  assert.match(sum, /Nhập trong tháng/);
  assert.match(sum, /Tổng tồn kho/);
  assert.doesNotMatch(sum, /class="hint">Năm</);
});

test('2.13.2 ô năm: #chartYear có aria-label "Năm" và nằm trong khung .chart-year__box cùng chữ "Năm"', () => {
  assert.match(PAGE, /<label class="chart-year__box">\s*<span class="chart-year__k">Năm<\/span>\s*<input class="chart-year__in" id="chartYear"[^>]*aria-label="Năm"/);
});

test('2.13.2 hai ô màu dùng đúng biến màu của cột và chữ tương phản token; canvas cũng đọc cùng biến', () => {
  assert.match(PAGE, /\.chart-chip--imp \.chart-chip__sw\{background:var\(--chart-imp\)\}/);
  assert.match(PAGE, /\.chart-chip--exp \.chart-chip__sw\{background:var\(--chart-exp\)\}/);
  assert.match(PAGE, /<span class="chart-chip chart-chip--imp" id="chartImpChip"/);
  assert.match(PAGE, /<span class="chart-chip chart-chip--exp" id="chartExpChip"/);
  assert.match(PAGE, /getPropertyValue\('--chart-imp'\)/);
  assert.match(PAGE, /getPropertyValue\('--chart-exp'\)/);
});

test('2.13.2 tháng mặc định (hàm thuần): năm hiện tại → tháng hiện tại; năm khác có dữ liệu tháng 3 và 7 → 7; không dữ liệu → 12', () => {
  const none = Array(12).fill(false);
  assert.equal(loadClient().chartDefaultMonth(2026, 2026, 10, none), 10, 'năm hiện tại → tháng hiện tại');
  const h = Array(12).fill(false); h[2] = true; h[6] = true;
  assert.equal(loadClient().chartDefaultMonth(2025, 2026, 10, h), 6, 'năm khác → tháng cuối có dữ liệu (tháng 7)');
  assert.equal(loadClient().chartDefaultMonth(2025, 2026, 10, none), 11, 'năm khác không dữ liệu → tháng 12');
});

test('2.13.2 dòng dữ liệu: mặc định tháng 7 (năm khác); bấm cột → tháng đó; bấm lại → về mặc định; ô màu và sr khớp', () => {
  const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : () => ({ width: 0 })), set: (t, k, v) => { t[k] = v; return true; } });
  const mk = () => ({ value: '', textContent: '', attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] || null; }, classList: { add() {}, remove() {}, contains() { return false; } }, focus() {}, select() {} });
  const cv = { offsetParent: {}, clientWidth: 300, clientHeight: 200, parentNode: { clientWidth: 300 }, width: 0, height: 0, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 200 }) };
  const els = { '#statsChart': cv, '#chartYear': Object.assign(mk(), { value: '2025' }), '#chartMonth': mk(), '#chartImpChip': mk(), '#chartExpChip': mk(), '#chartImpVal': mk(), '#chartExpVal': mk(), '#chartTipSr': mk() };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return els[s] || null; }, querySelectorAll() { return []; },
    createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, addEventListener() {}, removeEventListener() {}
  };
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({
    products: [{ id: 'p1', name: 'A', stock: 9, costPrice: 1 }], prescriptions: [], updatedAt: 0, moneyUnit: 'dong',
    transactions: [
      { id: 'a', date: '2025-03-10', type: 'NHAP', productId: 'p1', qty: 1, price: 1000, total: 3000000 },
      { id: 'b', date: '2025-07-05', type: 'BAN', productId: 'p1', qty: 1, price: 1000, total: 7000000, cost: 1000 }
    ]
  });
  c.renderChart();
  assert.equal(els['#chartMonth'].textContent, '07/2025', 'mặc định: tháng 7 (tháng cuối có dữ liệu của năm khác)');
  assert.equal(els['#chartExpVal'].textContent, c.fmtMoneyInt(7000000));
  const cx = i => 44 + ((300 - 44 - 8) / 12) * (i + 0.5);
  const click = i => c.onChartClick({ clientX: cx(i), clientY: 100 });
  click(2);
  assert.equal(els['#chartMonth'].textContent, '03/2025', 'bấm cột tháng 3 → hiện tháng 3');
  assert.equal(els['#chartImpVal'].textContent, c.fmtMoneyInt(3000000));
  assert.equal(els['#chartExpVal'].textContent, c.fmtMoneyInt(0));
  assert.match(els['#chartTipSr'].textContent, /^Tháng 03\/2025 — Nhập: /);
  click(2);
  assert.equal(els['#chartMonth'].textContent, '07/2025', 'bấm lại cột đang chọn → về tháng mặc định');
  assert.equal(c.getChartSel(), -1);
});

test('2.13.2 CSS: quy tắc điện thoại của đầu thẻ và dòng dữ liệu đặt SAU quy tắc gốc cùng bộ chọn', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  assert.ok(at('.chart-head__stats{display:flex') < at('#chartBox>summary.chart-head .chart-head__stats{width:100%'), 'đầu thẻ điện thoại phải sau gốc');
  assert.ok(at('.chart-tip{display:flex') < at('.chart-tip{gap:4px 10px}'), 'dòng dữ liệu điện thoại phải sau gốc');
  assert.ok(at('.chart-chip{display:inline-flex') < at('.chart-chip{gap:5px}'), 'chip điện thoại phải sau gốc');
});

/* 2.14.0 (1): bỏ chú thích và chữ đơn vị tĩnh; id và hook dữ liệu còn nguyên. */
test('2.14.0 (1) bỏ chú thích/chữ đơn vị tĩnh; các id dữ liệu vẫn có đúng một lần', () => {
  for (const t of ['kg · k', 'Gram · k', 'Ô “Ngày bán” dùng', 'nhấn <b>Enter</b>', 'Gõ tên mới để tạo vị thuốc', 'Nhập số lượng, giá rồi bấm', 'Đối chiếu tồn hiện tại', 'Bản sao lưu là file JSON', 'Nếu trình duyệt chặn tải']) {
    assert.ok(!PAGE.includes(t), 'còn chú thích: ' + t);
  }
  for (const id of ['retailBody', 'remedyBody', 'retailNote', 'nhapQty', 'nhapPrice', 'nhapListBox', 'invCount', 'impCount', 'expCount', 'backupLast', 'backupHint']) {
    assert.equal(PAGE.split('id="' + id + '"').length - 1, 1, id + ' phải đúng một lần');
  }
});

/* 2.14.0 (2): hàng bảng gọn (td 5/8 px, th 6/8 px; hàng điện thoại 6/2 px); quy tắc điện thoại đặt SAU quy tắc gốc. */
test('2.14.0 (2) hàng bảng gọn và quy tắc hàng điện thoại đặt sau quy tắc gốc', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  const base = at('td{padding:5px 8px;border-bottom:1px solid var(--border2)');
  assert.ok(at('font-weight:700;padding:6px 8px;border-bottom:1px solid var(--border);white-space:nowrap}') < base + 1000, 'th gọn');
  const phone = at('padding:6px 2px;border-bottom:1px solid var(--border2)}');
  assert.ok(base < phone, 'hàng điện thoại phải đứng sau td gốc');
  assert.doesNotMatch(PAGE, /padding:11px 2px;border-bottom:1px solid var\(--border2\)\}/);
  assert.doesNotMatch(PAGE, /td\{padding:8px 10px;/);
});

/* 2.14.0 A/B: cùng kịch bản lưu đơn bán lẻ trên 2.13.2 (golden) và bản mới; kết quả JSON db + thông báo phải giống hệt. */
function abRetailScenario() {
  const mEl = makeEl();
  const doc = trackDoc({ '#toast': makeEl(), '#toastMsg': mEl });
  const c = loadClient({ document: doc, Date: fakeClock(2026, 10, 11, 12), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({
    products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }, { id: 'p2', name: 'Đảng sâm', stock: 50, costPrice: 5000 }],
    transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong'
  });
  c.setBase(1);
  const out = [];
  const snap = label => { out.push({ label: label, toast: mEl.textContent, db: c.getDb().transactions.map(t => [t.productId, t.type, t.qty, t.total]) }); };
  c.setRetailItems([{ pid: 'p1', kg: 2.5, amount: 250000 }, { pid: 'p2', kg: 0.01, amount: 1000 }]);
  c.saveRetail(); snap('S1 hai dòng, giá trị biên 0.01');
  c.setRetailItems([]);
  c.saveRetail(); snap('S2 tờ ghi rỗng');
  c.setRetailItems([{ pid: 'p1', kg: 1e7, amount: 1 }]);
  c.saveRetail(); snap('S3 vượt tồn kho, dừng ở kiểm tồn');
  c.setRetailItems([{ pid: 'p1', kg: 500, amount: 1 }]);
  c.saveRetail(); snap('S4 vượt tồn kho');
  return JSON.stringify(out);
}
const AB_RETAIL_GOLDEN = "[{\"label\":\"S1 hai dòng, giá trị biên 0.01\",\"toast\":\"Đã lưu đơn bán lẻ\",\"db\":[[\"p1\",\"BAN\",2.5,250000],[\"p2\",\"BAN\",0.01,1000]]},{\"label\":\"S2 tờ ghi rỗng\",\"toast\":\"Chọn vị thuốc và nhập số lượng hợp lệ\",\"db\":[[\"p1\",\"BAN\",2.5,250000],[\"p2\",\"BAN\",0.01,1000]]},{\"label\":\"S3 vượt tồn kho, dừng ở kiểm tồn\",\"toast\":\"Tồn \\\"Cam thảo\\\" không đủ (còn 97,5 kg)\",\"db\":[[\"p1\",\"BAN\",2.5,250000],[\"p2\",\"BAN\",0.01,1000]]},{\"label\":\"S4 vượt tồn kho\",\"toast\":\"Tồn \\\"Cam thảo\\\" không đủ (còn 97,5 kg)\",\"db\":[[\"p1\",\"BAN\",2.5,250000],[\"p2\",\"BAN\",0.01,1000]]}]";
test('2.14.0 A/B in golden (chỉ khi KHO_AB_PRINT=1)', (t) => {
  if (process.env.KHO_AB_PRINT) t.diagnostic('ABJSON ' + abRetailScenario());
});
test('2.14.0 A/B bán lẻ: kết quả lưu đơn giống hệt golden 2.13.2 (db và thông báo, 4 kịch bản)', () => {
  assert.equal(abRetailScenario(), AB_RETAIL_GOLDEN);
});

/* 2.14.0 A/B Thuốc chén: cùng kịch bản lưu đơn thuốc chén trên 2.13.2 (golden) và bản mới; db, tồn và thông báo phải giống hệt. */
function abRemedyScenario() {
  const mEl = makeEl();
  const els = { '#toast': makeEl(), '#toastMsg': mEl, '#remedyThang': makeEl(), '#remedyUnitPrice': makeEl(), '#remedyName': makeEl(), '#remedyBody': makeEl(), '#remedyPreset': makeEl() };
  const doc = trackDoc(els);
  const c = loadClient({ document: doc, Date: fakeClock(2026, 10, 11, 12), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({
    products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }, { id: 'p2', name: 'Đảng sâm', stock: 50, costPrice: 5000 }, { id: 'p3', name: 'Bạch truật', stock: 2, costPrice: 300 }],
    transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong'
  });
  c.setBase(1);
  const out = [];
  const set = (thang, unit, name) => { els['#remedyThang'].value = thang; els['#remedyUnitPrice'].value = unit; els['#remedyName'].value = name || ''; };
  const snap = label => { out.push({ label: label, toast: mEl.textContent, stock: c.getDb().products.map(p => [p.id, p.stock]), db: c.getDb().transactions.map(t => [t.productId, t.type, t.qty, t.total, t.g || null, t.thang || null]), rx: c.getDb().prescriptions.map(r => [r.name, r.thang, r.total, r.items.map(i => [i.productId, i.grams])]) }); };
  c.setRemedyItems([{ productId: 'p1', grams: 150 }, { productId: 'p2', grams: 30 }]);
  set('3', '120', 'Đơn A'); c.saveRemedy(); snap('S1 nhiều vị, thang 3, tên đơn');
  c.setRemedyItems([{ productId: 'p1', grams: 1 }]);
  set('1', '0.01', ''); c.saveRemedy(); snap('S2 giá biên 0.01 nghìn');
  c.setRemedyItems([{ productId: 'p1', grams: 1e10 }]);
  set('1', '100', ''); c.saveRemedy(); snap('S3 gram rất lớn, dừng ở kiểm tồn (không tới checkLimits)');
  c.setRemedyItems([{ productId: 'p1', grams: 1 }]);
  set('1', '1000000000', ''); c.saveRemedy(); snap('S4 đơn giá vượt trần tiền');
  c.setRemedyItems([{ productId: 'p3', grams: 3000 }]);
  set('1', '100', ''); c.saveRemedy(); snap('S5 tồn không đủ');
  c.setRemedyItems([{ productId: 'p2', grams: 1000 }]);
  set('1', '0.001', ''); c.saveRemedy(); snap('S6 giá bán thấp hơn vốn');
  c.setRemedyItems([]);
  set('1', '100', ''); c.saveRemedy(); snap('S7 đơn rỗng');
  c.setRemedyItems([{ productId: 'p1', grams: 50 }, { productId: 'p2', grams: 20 }]);
  set('2', '100', 'Đơn A'); c.savePreset(); snap('S8 savePreset tên mới, nhiều vị, thang 2');
  c.setRemedyItems([{ productId: 'p1', grams: 10 }]);
  els['#remedyPreset'].value = ''; set('1', '100', ''); c.savePreset(); snap('S9 savePreset không tên');
  return JSON.stringify(out);
}
test('2.14.0 A/B in golden remedy/nhap (chỉ khi KHO_AB_PRINT=1)', (t) => {
  if (process.env.KHO_AB_PRINT) t.diagnostic('ABJSON_REMEDY ' + abRemedyScenario());
});
const AB_REMEDY_GOLDEN = "[{\"label\":\"S1 nhiều vị, thang 3, tên đơn\",\"toast\":\"Đã bán đơn thuốc chén\",\"stock\":[[\"p1\",99.55],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3]],\"rx\":[]},{\"label\":\"S2 giá biên 0.01 nghìn\",\"toast\":\"Đã bán đơn thuốc chén\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[]},{\"label\":\"S3 gram rất lớn, dừng ở kiểm tồn (không tới checkLimits)\",\"toast\":\"Tồn \\\"Cam thảo\\\" không đủ (còn 99,549 kg)\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[]},{\"label\":\"S4 đơn giá vượt trần tiền\",\"toast\":\"Đơn giá vượt giới hạn (1.000.000.000 nghìn đồng/kg)\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[]},{\"label\":\"S5 tồn không đủ\",\"toast\":\"Tồn \\\"Bạch truật\\\" không đủ (còn 2 kg)\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[]},{\"label\":\"S6 giá bán thấp hơn vốn\",\"toast\":\"Giá bán thấp hơn vốn của đơn\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[]},{\"label\":\"S7 đơn rỗng\",\"toast\":\"Chọn ít nhất 1 vị thuốc và nhập số gram\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[]},{\"label\":\"S8 savePreset tên mới, nhiều vị, thang 2\",\"toast\":\"Đã lưu đơn \\\"Đơn A\\\"\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[[\"Đơn A\",2,200000,[[\"p1\",50],[\"p2\",20]]]]},{\"label\":\"S9 savePreset không tên\",\"toast\":\"Nhập tên đơn\",\"stock\":[[\"p1\",99.549],[\"p2\",49.91],[\"p3\",2]],\"db\":[[\"p1\",\"BAN\",0.45,180000,150,3],[\"p2\",\"BAN\",0.09,180000,30,3],[\"p1\",\"BAN\",0.001,10,1,1]],\"rx\":[[\"Đơn A\",2,200000,[[\"p1\",50],[\"p2\",20]]]]}]";
test('2.14.0 A/B Thuốc chén: kết quả lưu đơn giống hệt golden 2.13.2 (db, tồn, đơn đã lưu và thông báo, 9 kịch bản)', () => {
  assert.equal(abRemedyScenario(), AB_REMEDY_GOLDEN);
});

/* 2.14.0 A/B Nhập hàng: cùng kịch bản lưu nhập trên 2.13.2 (golden) và bản mới; db (theo tên vị) và thông báo phải giống hệt. */
function abNhapScenario() {
  const mEl = makeEl();
  const els = { '#toast': makeEl(), '#toastMsg': mEl, '#nhapSearch': makeEl(), '#nhapQty': makeEl(), '#nhapPrice': makeEl() };
  const doc = trackDoc(els);
  const c = loadClient({ document: doc, Date: fakeClock(2026, 10, 11, 12), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({
    products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }, { id: 'p2', name: 'Đảng sâm', stock: 50, costPrice: 5000 }, { id: 'p3', name: 'Bạch truật', stock: 2, costPrice: 300 }],
    transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong'
  });
  c.setBase(1);
  const out = [];
  const nameOf = id => { const p = c.getDb().products.find(x => x.id === id); return p ? p.name : null; };
  const snap = label => { out.push({ label: label, toast: mEl.textContent, stock: c.getDb().products.map(p => [p.name, p.stock, p.costPrice]), db: c.getDb().transactions.map(t => [nameOf(t.productId), t.type, t.qty, t.price, t.total]) }); };
  const clearLine = () => { els['#nhapSearch'].value = ''; els['#nhapQty'].value = ''; els['#nhapPrice'].value = ''; c.setNhapPid(null); };
  c.setNhapList([{ pid: 'p1', name: 'Cam thảo', qty: 2.5, price: 120000 }, { pid: 'p1', name: 'Cam thảo', qty: 1, price: 130000 }]);
  clearLine(); c.saveNhap(); snap('S1 nhiều dòng cùng vị');
  c.setNhapList([{ pid: 'p1', name: 'Cam thảo', qty: 1e7, price: 1000 }]);
  clearLine(); c.saveNhap(); snap('S2 vượt trần số lượng');
  c.setNhapList([{ pid: 'p1', name: 'Cam thảo', qty: 600000, price: 1000 }, { pid: 'p1', name: 'Cam thảo', qty: 600000, price: 1000 }]);
  clearLine(); c.saveNhap(); snap('S3 tồn cộng dồn vượt trần');
  c.setNhapList([{ pid: null, name: 'Thạch cao', qty: 3, price: 50000 }]);
  clearLine(); c.saveNhap(); snap('S4 vị mới (Tạo mới)');
  c.setNhapList([{ pid: 'p2', name: 'Đảng sâm', qty: 1, price: 0 }]);
  clearLine(); c.saveNhap(); snap('S5 giá 0');
  c.setNhapList([{ pid: 'p2', name: 'Đảng sâm', qty: 1, price: 5000 }]);
  els['#nhapSearch'].value = 'Bạch truật'; els['#nhapQty'].value = '2'; els['#nhapPrice'].value = '3'; c.setNhapPid('p3');
  c.saveNhap(); snap('S6 dòng đang nhập cộng với tờ ghi');
  c.setNhapList([]);
  clearLine(); c.saveNhap(); snap('S7 rỗng');
  c.setNhapList([{ pid: 'p1', name: 'Cam thảo', qty: 1, price: -5 }]);
  clearLine(); c.saveNhap(); snap('S8 giá âm');
  return JSON.stringify(out);
}
test('2.14.0 A/B in golden nhập (chỉ khi KHO_AB_PRINT=1)', (t) => {
  if (process.env.KHO_AB_PRINT) t.diagnostic('ABJSON_NHAP ' + abNhapScenario());
});
const AB_NHAP_GOLDEN = "[{\"label\":\"S1 nhiều dòng cùng vị\",\"toast\":\"Đã lưu nhập 2 vị thuốc\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",50,5000],[\"Bạch truật\",2,300]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000]]},{\"label\":\"S2 vượt trần số lượng\",\"toast\":\"Số lượng vượt giới hạn (1000000)\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",50,5000],[\"Bạch truật\",2,300]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000]]},{\"label\":\"S3 tồn cộng dồn vượt trần\",\"toast\":\"Số lượng vượt giới hạn (1000000)\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",50,5000],[\"Bạch truật\",2,300]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000]]},{\"label\":\"S4 vị mới (Tạo mới)\",\"toast\":\"Đã lưu nhập hàng\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",50,5000],[\"Bạch truật\",2,300],[\"Thạch cao\",3,50000]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000],[\"Thạch cao\",\"NHAP\",3,50000,150000]]},{\"label\":\"S5 giá 0\",\"toast\":\"Đã lưu nhập hàng\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",51,5000],[\"Bạch truật\",2,300],[\"Thạch cao\",3,50000]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000],[\"Thạch cao\",\"NHAP\",3,50000,150000],[\"Đảng sâm\",\"NHAP\",1,0,0]]},{\"label\":\"S6 dòng đang nhập cộng với tờ ghi\",\"toast\":\"Đã lưu nhập 2 vị thuốc\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",52,5000],[\"Bạch truật\",4,3000],[\"Thạch cao\",3,50000]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000],[\"Thạch cao\",\"NHAP\",3,50000,150000],[\"Đảng sâm\",\"NHAP\",1,0,0],[\"Đảng sâm\",\"NHAP\",1,5000,5000],[\"Bạch truật\",\"NHAP\",2,3000,6000]]},{\"label\":\"S7 rỗng\",\"toast\":\"Nhập tên vị thuốc\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",52,5000],[\"Bạch truật\",4,3000],[\"Thạch cao\",3,50000]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000],[\"Thạch cao\",\"NHAP\",3,50000,150000],[\"Đảng sâm\",\"NHAP\",1,0,0],[\"Đảng sâm\",\"NHAP\",1,5000,5000],[\"Bạch truật\",\"NHAP\",2,3000,6000]]},{\"label\":\"S8 giá âm\",\"toast\":\"Giá nhập không được âm\",\"stock\":[[\"Cam thảo\",103.5,130000],[\"Đảng sâm\",52,5000],[\"Bạch truật\",4,3000],[\"Thạch cao\",3,50000]],\"db\":[[\"Cam thảo\",\"NHAP\",2.5,120000,300000],[\"Cam thảo\",\"NHAP\",1,130000,130000],[\"Thạch cao\",\"NHAP\",3,50000,150000],[\"Đảng sâm\",\"NHAP\",1,0,0],[\"Đảng sâm\",\"NHAP\",1,5000,5000],[\"Bạch truật\",\"NHAP\",2,3000,6000]]}]";
test('2.14.0 A/B Nhập hàng: kết quả lưu nhập giống hệt golden 2.13.2 (db theo tên, tồn và thông báo, 8 kịch bản)', () => {
  assert.equal(abNhapScenario(), AB_NHAP_GOLDEN);
});

/* 2.14.0 giai đoạn 1 – Bán lẻ: thanh tiêu đề (tên + tìm vị + ngày + bấm "+" trong tờ ghi); bảng nhập nằm trong tờ ghi; không dòng trống. */
test('2.14.0 Bán lẻ: thanh tiêu đề có retailSearch và retailDate; summary ẩn trực quan; không nhãn chữ "Chọn vị thuốc"', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  assert.ok(at('<div class="card__bar">') < at('id="retailSearch"'), 'ô tìm phải nằm trong thanh');
  assert.ok(at('id="retailSearch"') < at('id="retailDate"') && at('id="retailDate"') < at('id="retailNote"'), 'ô ngày phải trong thanh, trước tờ ghi');
  assert.match(PAGE, /<summary class="card__head sr-summary">\s*<svg class="ico txt-green"[\s\S]*?<h2 class="card__title">Bán lẻ<\/h2>\s*<\/summary>/);
  const rb0 = PAGE.indexOf('id="retailBox"'), rb1 = PAGE.indexOf('id="remedyBox"');
  assert.doesNotMatch(PAGE.slice(rb0, rb1), /Chọn vị thuốc<\/label>/);
  assert.doesNotMatch(PAGE, /class="lbl" for="retailDate"/);
});

test('2.14.0 Bán lẻ: bảng nhập (retailBody) nằm trong tờ ghi, sau danh sách dòng; chân tờ ghi có một nút Bán đơn (save-retail)', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  assert.ok(at('id="retailNote"') < at('id="retailBody"') && at('id="retailBody"') < at('id="retailNotePager"'), 'retailBody phải nằm trong tờ ghi');
  assert.ok(at('id="retailNoteBody"') < at('id="retailBody"'), 'dòng đang nhập đứng sau danh sách dòng đã thêm');
  assert.equal(PAGE.split('data-action="save-retail"').length - 1, 1);
  assert.match(PAGE, /<tfoot id="retailNoteFoot" hidden><tr><td><\/td><td class="b">Tổng<\/td><td><\/td><td class="num b r txt-green" id="retailNoteTotal">[\s\S]*?<div class="note__foot">\s*<button[^>]*data-action="save-retail"[\s\S]*?Bán đơn\s*<\/button>/);
  assert.doesNotMatch(PAGE.slice(PAGE.indexOf('<div class="note__foot">'), PAGE.indexOf('id="remedyBox"')), /Tổng/, '2.17.3: chân Bán lẻ chỉ còn nút');
  assert.match(PAGE, /<th scope="col" class="r">Giá bán<\/th>/);
  assert.doesNotMatch(PAGE.slice(PAGE.indexOf('id="retailBox"'), PAGE.indexOf('id="remedyBox"')), /Thành tiền/, '2.17.3: Bán lẻ đổi Thành tiền -> Giá bán');
});

test('2.14.0 Bán lẻ: renderNote không vẽ dòng trống (chỉ dòng thật)', () => {
  const mkTb = () => ({ textContent: '', children: [], appendChild(c) { this.children.push(c); return c; } });
  const tb = mkTb();
  const els = { '#retailNoteBody': tb, '#retailNotePg': makeEl(), '#retailNotePager': makeEl(), '#retailNote': makeEl() };
  const doc = trackDoc(els);
  doc.createTextNode = () => makeEl();
  const c = loadClient({ document: doc, Date: fakeClock(2026, 10, 11, 12), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  c.setRetailItems([{ pid: 'p1', kg: 2, amount: 2000 }]);
  c.renderNote();
  assert.equal(tb.children.length, 1, 'tờ ghi 1 dòng thật phải có đúng 1 dòng, không có dòng trống');
});

/* 2.14.0 (sửa giai đoạn 1): STT dòng đang nhập = số dòng tờ ghi + 1; hai bảng Bán lẻ dùng chung colgroup và độ rộng cột. */
test('2.14.0 Bán lẻ: STT dòng đang nhập = số dòng tờ ghi + 1 (đã có 1 dòng → 2)', () => {
  const cell = { textContent: '' };
  const pendingRow = { getAttribute() { return null; }, querySelector(sel) { return sel === '.c-num' ? cell : null; } };
  const pendingTb = { children: [pendingRow], textContent: '' };
  const noteTb = { textContent: '', children: [], appendChild(c) { this.children.push(c); return c; } };
  const els = { '#retailNoteBody': noteTb, '#retailBody': pendingTb, '#retailNotePg': makeEl(), '#retailNotePager': makeEl(), '#retailNote': makeEl() };
  const doc = trackDoc(els);
  doc.createTextNode = () => makeEl();
  const c = loadClient({ document: doc, Date: fakeClock(2026, 10, 11, 12), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  c.setRetailItems([{ pid: 'p1', kg: 2, amount: 2000 }]);
  c.renderNote();
  assert.equal(cell.textContent, '2', 'STT dòng đang nhập phải là 2 khi tờ ghi có 1 dòng');
  c.setRetailItems([]);
  c.renderNote();
  assert.equal(cell.textContent, '1', 'tờ ghi rỗng → dòng đang nhập là 1');
});

test('2.14.0 Bán lẻ: hai bảng (tờ ghi và dòng đang nhập) dùng chung colgroup 5 cột và độ rộng cột (col.cg-*)', () => {
  const rb0 = PAGE.indexOf('id="retailBox"'), rb1 = PAGE.indexOf('id="remedyBox"');
  const block = PAGE.slice(rb0, rb1);
  assert.equal(block.split('<colgroup>').length - 1, 2, 'phải có 2 colgroup trong thẻ Bán lẻ');
  assert.equal(block.split('class="cg-num"').length - 1, 2);
  for (const k of ['cg-num', 'cg-qty', 'cg-money', 'cg-act']) assert.match(PAGE, new RegExp('#retailNote col\\.' + k + '\\{width:\\d+px\\}'), k);
});

/* 2.14.0 N6: gợi ý đơn vị trong ô số lượng (lạng/kg/g) theo đúng fmtQty; chỉ hiển thị, không đổi giá trị. */
test('2.14.0 N6 hàm gợi ý: 0.2→(2 lạng), 0.25→(2,5 lạng), 2→(2 kg), 1.5→(1,5 kg); gram 200→(2 lạng), 1500→(1,5 kg); rỗng/0/âm/không hợp lệ → ""', () => {
  const c = loadClient();
  assert.equal(c.qtyHintText('0.2', 'kg'), '(2 l)');
  assert.equal(c.qtyHintText('0.25', 'kg'), '(2,5 l)');
  assert.equal(c.qtyHintText('2', 'kg'), '(2 kg)');
  assert.equal(c.qtyHintText('1.5', 'kg'), '(1,5 kg)');
  assert.equal(c.qtyHintText('200', 'g'), '(2 l)');
  assert.equal(c.qtyHintText('1500', 'g'), '(1,5 kg)');
  // 0,05 kg: fmtQty chuyển sang gram dưới 0,1 kg → "(50 g)" (theo đúng quy ước hiển thị, không tự đặt quy ước riêng)
  assert.equal(c.qtyHintText('0.05', 'kg'), '(50 g)');
  for (const v of ['', '0', 'abc', '-1']) assert.equal(c.qtyHintText(v, 'kg'), '', 'phải rỗng: ' + JSON.stringify(v));
});

test('2.14.0 N6 gắn gợi ý: .qty-hint đổi theo input và chỉ nhắc (không đổi value); ẩn khi trống; có aria-describedby', () => {
  const doc = trackDoc({});
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  let wrap = null;
  const host = { classList: { add() {}, contains() { return false; } }, insertBefore(w) { wrap = w; return w; } };
  const input = { id: 'retailQty', value: '0.2', parentNode: host, attrs: {}, l: {},
    classList: { add() {}, remove() {} }, style: {}, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, f) { this.l[ev] = f; } };
  c.attachQtyHint(input, 'kg');
  assert.ok(wrap, 'ô phải được bọc trong khung .qty-host riêng');
  assert.equal(wrap.children[0], input, 'ô nằm trong khung bọc');
  const h = wrap.children[1];
  assert.equal(h.textContent, '(2 l)');
  assert.equal(input.attrs['aria-describedby'], wrap.children[2].id, 'phải có mô tả cho trình đọc màn hình');
  input.value = '2'; input.l.input();
  assert.equal(h.textContent, '(2 kg)', 'đổi theo sự kiện input');
  assert.equal(input.value, '2', 'không được đổi giá trị ô');
  input.value = ''; input.l.input();
  assert.equal(h.hidden, true, 'ô trống → ẩn gợi ý');
  assert.equal(input.value, '', 'giá trị ô vẫn trống');
});

test('2.14.0 N6 gắn trên dòng đang nhập Bán lẻ, Thuốc chén, nhapQty, txEditQty, noteEditQty (qua DOM có .qty-host)', () => {
  assert.doesNotMatch(PAGE, /input\.qty-hinted\{padding-left:50px\}/, 'S1: không còn padding-left cố định cho ô số có gợi ý');
  assert.match(PAGE, /input\.classList\.add\('has-hint'\);/, 'S1: padding chỉ thêm khi gợi ý đang hiện (class .has-hint)');
  assert.match(PAGE, /attachQtyHint\(qi, isRetail \? 'kg' : 'g'\);/);
  assert.match(PAGE, /if \(nqHint\) attachQtyHint\(nqHint, 'kg'\);/);
  assert.match(PAGE, /attachQtyHint\(txqHint, function\(\)\{ return txEditCur && txEditCur\.rx \? 'g' : 'kg'; \}\);/);
  assert.match(PAGE, /attachQtyHint\(qi, 'g'\);/, 'sửa dòng thuốc chén (gram)');
  assert.match(PAGE, /attachQtyHint\(qi, 'kg'\);/, 'sửa dòng bán lẻ (kg)');
  assert.match(PAGE, /\$\('#txEditQty'\)\.qtyHintRefresh\(\)/, 'mở hộp thoại sửa phải cập nhật gợi ý');
});

test('2.14.0 N6 CSS: gợi ý căn giữa theo khung ô (không theo .field/td có nhãn), không top âm cố định', () => {
  assert.match(PAGE, /\.qty-host\{position:relative;display:block\}/);
  assert.match(PAGE, /\.qty-hint\{position:absolute;left:7px;top:50%;transform:translateY\(-50%\)/);
  assert.doesNotMatch(PAGE, /\.qty-hint\{[^}]*top:-/);
});

/* 2.14.0 giai đoạn 2a – Thuốc chén (bản cập nhật): thanh = [tên][chọn đơn][ngày]; tìm vị ở đầu tờ ghi; tên đơn ẩn ở chân; chân gọn 2 hàng. */
test('2.14.0 Thuốc chén: thanh chỉ có tên mục, #remedyPreset và #remedyDate; không chữ "ĐƠN CÓ SẴN"/"NGÀY BÁN" hiển thị', () => {
  const bar = PAGE.match(/<div class="card__bar">[\s\S]*?<div class="note" id="remedyNote">/);
  assert.ok(bar, 'thiếu thanh card__bar của Thuốc chén');
  assert.match(bar[0], /id="remedyPreset"/);
  assert.match(bar[0], /id="remedyDate"/);
  assert.match(bar[0], /aria-label="Đơn có sẵn"/);
  assert.match(bar[0], /aria-label="Ngày bán"/);
  assert.doesNotMatch(bar[0], /id="remedySearch"|id="remedyName"/, 'thanh không được chứa tìm vị hay tên đơn');
  assert.doesNotMatch(PAGE, />\s*ĐƠN CÓ SẴN\s*</);
  assert.doesNotMatch(PAGE, />\s*NGÀY BÁN\s*</);
});

test('2.14.0 Thuốc chén: #remedySearch nằm trong khung tờ ghi .note, trước các dòng; không nhãn chữ; không chú thích dài', () => {
  const note = PAGE.slice(PAGE.indexOf('id="remedyNote"'), PAGE.indexOf('id="nhapBox"'));
  const iSearch = note.indexOf('id="remedySearch"'), iBody = note.indexOf('id="remedyBody"');
  assert.ok(iSearch > 0 && iSearch < iBody, 'ô tìm vị phải là dòng đầu, trước dòng nhập');
  assert.match(note, /placeholder="Nhập tên"/);
  const box = PAGE.slice(PAGE.indexOf('id="remedyBox"'), PAGE.indexOf('id="nhapBox"'));
  assert.doesNotMatch(box, /<label[^>]*for="remedy(Search|Date|Preset|Name)"/, 'còn nhãn chữ phía trên ô');
  assert.doesNotMatch(box, /Chọn vị thuốc|Gõ tên vị thuốc|hintbox/);
assert.match(box, /<option value="">Đơn mới<\/option>/);
  assert.doesNotMatch(box, /__new__|Tạo đơn mới/, '2.15.5: bỏ lựa chọn Tạo đơn mới');
});

test('2.14.0 Thuốc chén: chân tờ ghi ba hàng (note__row: tổng, phụ, nút); tên đơn ẩn mặc định; Lưu đơn, Bán đơn (2.15.5 bỏ Lưu tên mới); id/data-action giữ nguyên', () => {
  const note = PAGE.slice(PAGE.indexOf('id="remedyNote"'), PAGE.indexOf('id="nhapBox"'));
  const foot = note.slice(note.indexOf('class="note__foot"'));
  assert.equal((foot.match(/class="note__row/g) || []).length, 2, 'chân phải đúng 2 hàng (thang × giá = tiền; nút)');
  assert.ok(foot.indexOf('id="remedyName"') < foot.indexOf('note__row--btns'), 'ô tên nằm trên hàng nút');
  assert.match(foot, /<input[^>]*id="remedyName"[^>]*\shidden[^>]*>/, 'ô tên đơn phải ẩn mặc định');
  assert.doesNotMatch(PAGE, /remedyNewName|preset-newname|__new__|nm-full|nm-short|Lưu tên mới/, '2.15.5: không còn nút/action/option cũ');
  assert.match(foot, /data-action="save-preset"/);
  assert.match(foot, /data-action="save-remedy"/);
  for (const id of ['remedyThang', 'remedyUnitPrice', 'remedyTotal', 'remedySavePreset', 'remedySaveLabel', 'remedyDelPreset']) assert.match(foot, new RegExp('id="' + id + '"'), 'chân thiếu ' + id);
  assert.equal((PAGE.match(/id="remedyPreset"/g) || []).length, 1);
  assert.equal((PAGE.match(/id="remedySearch"/g) || []).length, 1);
  assert.equal((PAGE.match(/id="remedyName"/g) || []).length, 1);
  assert.match(PAGE, /#remedyNote \.note__pending thead\{display:none\}/);
  assert.match(PAGE, /\.note__pending tr\.is-empty\{display:none\}/);
  assert.match(PAGE, /renumber\(tb, isRetail \? retailItems\.length : remedyItems\.length\);/);
  assert.match(PAGE, /renumber\(pendingRb, remedyItems\.length\);/);
  assert.ok(PAGE.includes('if (!it) { if (isDesk() && !(pendHere && i === remedyItems.length)) (fill || tb).appendChild(blankRow(tb)); continue; }\n    var p = findProduct(it.productId);'));
});

test('2.15.5 Thuốc chén hành vi: chọn "Đơn mới" (value rỗng) xóa tờ ghi như cũ, ô tên ẩn, không lưu', () => {
  const focusN = { n: 0 };
  const els = {
    '#remedyPreset': makeEl(), '#remedySearch': makeEl(), '#remedyName': makeEl(), '#remedyBody': makeEl(),
    '#remedyThang': makeEl(), '#remedyUnitPrice': makeEl(), '#toast': makeEl(), '#toastMsg': makeEl()
  };
  els['#remedyPreset'].value = '';
  const doc = trackDoc(els);
  els['#remedySearch'].focus = function () { focusN.n++; };
  els['#remedyName'].hidden = false;
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], prescriptions: [{ id: 'RX1', name: 'Đơn cũ', items: [], total: 0, thang: 1 }], updatedAt: 1, moneyUnit: 'dong' });
  c.setBase(1);
  c.setRemedyItems([{ productId: 'p1', grams: 5 }]);
  const rxBefore = JSON.stringify(c.getDb().prescriptions);
  c.remedyPresetPick();
  assert.equal(els['#remedyPreset'].value, '', 'select phải trả về ""');
  assert.equal(c.getRemedyItems().length, 0, 'đi đường đơn mới: tờ ghi được đặt lại như "— Đơn mới —"');
  assert.equal(els['#remedyName'].hidden, true, 'chọn đơn khác/đơn mới thì ô tên ẩn');
  assert.equal(JSON.stringify(c.getDb().prescriptions), rxBefore, 'không được lưu hay sửa đơn');
});

test('2.15.5 Thuốc chén hành vi: "Lưu đơn" khi chưa có tên và chưa chọn đơn thì mở ô tên, không lưu', () => {
  const els = {
    '#remedyPreset': makeEl(), '#remedyName': makeEl(), '#remedyBody': makeEl(), '#remedyThang': makeEl(), '#remedyUnitPrice': makeEl(),
    '#remedySearch': makeEl(), '#toast': makeEl(), '#toastMsg': makeEl()
  };
  els['#remedyName'].hidden = true;
  const doc = trackDoc(els);
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  c.setBase(1);
  c.remedySavePresetClick();
  assert.equal(els['#remedyName'].hidden, false, 'Lưu đơn khi chưa có tên phải hiện ô tên');
  assert.equal(c.getDb().prescriptions.length, 0, 'chưa có tên thì không lưu đơn');
  els['#remedyName'].value = 'Đơn B';
  c.remedySavePresetClick();
  assert.equal(c.getDb().prescriptions.length, 0, 'tờ ghi rỗng: savePreset báo lỗi, không lưu');
});

test('2.15.15 Lưu đơn thuốc chén: điện thoại hỏi tên bằng prompt (Hủy/rỗng không lưu, có tên lưu đúng một đơn); PC không gọi prompt', () => {
  function run(mobile, answer) {
    const els = {
      '#remedyPreset': makeEl(), '#remedyName': makeEl(), '#remedyBody': makeEl(), '#remedyThang': makeEl(), '#remedyUnitPrice': makeEl(),
      '#remedySearch': makeEl(), '#toast': makeEl(), '#toastMsg': makeEl()
    };
    els['#remedyPreset'].value = ''; els['#remedyName'].hidden = true; els['#remedyThang'].value = '1'; els['#remedyUnitPrice'].value = '1';
    const calls = { n: 0 };
    const c = loadClient({ document: trackDoc(els), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH,
      matchMedia: () => ({ matches: mobile }), prompt: () => { calls.n++; return answer; }, confirm: () => true });
    c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
    c.setBase(1);
    c.setRemedyItems([{ productId: 'p1', grams: 5 }]);
    c.remedySavePresetClick();
    return { c, calls, els };
  }
  let r = run(true, null);
  assert.equal(r.calls.n, 1); assert.equal(r.c.getDb().prescriptions.length, 0, 'Hủy: không lưu');
  r = run(true, '   ');
  assert.equal(r.c.getDb().prescriptions.length, 0, 'rỗng: không lưu');
  r = run(true, 'đơn an thần');
  assert.equal(r.calls.n, 1);
  assert.equal(r.c.getDb().prescriptions.length, 1, 'có tên: lưu đúng một đơn');
  assert.equal(r.c.getDb().prescriptions[0].name, 'Đơn An Thần');
  r = run(false, 'X');
  assert.equal(r.calls.n, 0, 'PC không gọi prompt');
  assert.equal(r.els['#remedyName'].hidden, false);
  assert.equal(r.c.getDb().prescriptions.length, 0);
});

function runSave(o) {
  const els = {
    '#remedyPreset': makeEl(), '#remedyName': makeEl(), '#remedyBody': makeEl(), '#remedyThang': makeEl(), '#remedyUnitPrice': makeEl(),
    '#remedySearch': makeEl(), '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const st = { prompts: 0, def: null, confirms: [], focus: 0 };
  els['#remedyPreset'].value = o.sel || ''; els['#remedyName'].value = o.name || ''; els['#remedyThang'].value = '1'; els['#remedyUnitPrice'].value = '1';
  const doc = trackDoc(els);
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH,
    matchMedia: () => ({ matches: !!o.mobile }), prompt: (m, d) => { st.prompts++; st.def = d; return o.answer === undefined ? null : o.answer; },
    confirm: m => { st.confirms.push(m); return o.ok !== false; } });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], updatedAt: 1, moneyUnit: 'dong',
    prescriptions: [{ id: 'RX1', name: o.rxName || 'Đơn Cũ', items: [{ productId: 'p1', grams: 1 }], total: 1, thang: 1 }].concat(o.existing || []) });
  c.setBase(1);
  c.setRemedyItems([{ productId: 'p1', grams: 5 }]);
  c.savePreset();
  st.focus = doc.activeElement === els['#remedyName'] ? 1 : 0;
  return { c, st, els, rx: c.getDb().prescriptions };
}
test('2.15.17 savePreset: chọn đơn có sẵn thì cập nhật theo ID, giữ nguyên tên cũ dù ô tên trống hay có chữ khác; không prompt/confirm', () => {
  for (const mobile of [true, false]) for (const name of ['', 'Đơn Z', 'đơn khác']) {
    const r = runSave({ sel: 'RX1', name, mobile, existing: [{ id: 'RX2', name: 'Đơn Khác', items: [], total: 0, thang: 1 }] });
    assert.equal(r.st.prompts, 0); assert.equal(r.st.confirms.length, 0); assert.equal(r.st.focus, 0);
    assert.equal(r.rx.length, 2, 'không tạo đơn mới');
    assert.equal(r.rx[0].id, 'RX1'); assert.equal(r.rx[0].name, 'Đơn Cũ', 'giữ tên cũ');
    assert.equal(r.rx[0].items[0].grams, 5, 'nội dung được cập nhật');
    assert.equal(r.rx[1].items.length, 0, 'đơn khác không đổi');
  }
});
test('2.15.17 savePreset: đơn mới (chưa chọn) trùng tên không phân biệt hoa/thường/khoảng trắng → confirm nêu tên đang lưu; OK ghi đè đúng ID, giữ tên cũ; Hủy không đổi', () => {
  for (const typed of ['đơn cũ', 'ĐƠN CŨ', '  đƠn   cŨ  ', 'Đơn Cũ']) {
    let r = runSave({ name: typed, ok: true });
    assert.equal(r.st.confirms.length, 1);
    assert.equal(r.st.confirms[0], 'Đã có đơn "Đơn Cũ". Sửa đơn này bằng nội dung đang nhập?');
    assert.equal(r.rx.length, 1, 'không tạo đơn thứ hai trùng tên');
    assert.equal(r.rx[0].id, 'RX1'); assert.equal(r.rx[0].name, 'Đơn Cũ'); assert.equal(r.rx[0].items[0].grams, 5);
    r = runSave({ name: typed, ok: false });
    assert.equal(r.st.confirms.length, 1);
    assert.equal(r.rx.length, 1); assert.equal(r.rx[0].items[0].grams, 1, 'Hủy: không đổi gì'); assert.equal(r.rx[0].name, 'Đơn Cũ');
  }
  const lg = runSave({ rxName: 'đơn  cŨ ', name: 'ĐƠN CŨ', ok: true });
  assert.equal(lg.st.confirms[0], 'Đã có đơn "đơn  cŨ ". Sửa đơn này bằng nội dung đang nhập?', 'hiện tên đang lưu trong máy');
  assert.equal(lg.rx.length, 1); assert.equal(lg.rx[0].name, 'đơn  cŨ ', 'giữ tên cũ nguyên văn'); assert.equal(lg.rx[0].items[0].grams, 5);
  const r = runSave({ name: 'đơn mới hẳn' });
  assert.equal(r.st.confirms.length, 0); assert.equal(r.rx.length, 2); assert.equal(r.rx[1].name, 'Đơn Mới Hẳn');
});
test('2.15.17 savePreset: đơn mới, ô tên trống: điện thoại hỏi bằng prompt (không focus); PC báo lỗi và focus ô tên', () => {
  let r = runSave({ mobile: true, answer: null });
  assert.equal(r.st.prompts, 1); assert.equal(r.st.def, ''); assert.equal(r.st.focus, 0); assert.equal(r.rx.length, 1);
  r = runSave({ mobile: true, answer: '  ' });
  assert.equal(r.rx.length, 1);
  r = runSave({ mobile: true, answer: 'đơn B' });
  assert.equal(r.rx.length, 2); assert.equal(r.rx[1].name, 'Đơn B');
  r = runSave({ mobile: false, answer: 'X' });
  assert.equal(r.st.prompts, 0); assert.equal(r.st.focus, 1); assert.equal(r.rx.length, 1);
});
test('2.15.17 cấu trúc: không còn Sao chép đơn/đổi tên đơn trong mã', () => {
  assert.doesNotMatch(PAGE, /copyPreset|copy-preset|remedyCopyPreset|Sao chép đơn|Đổi tên đơn|đã dùng cho đơn khác/);
});

/* 2.14.0 giai đoạn 2b – Nhập hàng: cùng mẫu Thuốc chén/Bán lẻ; tờ ghi và dòng nhập luôn hiện; chân một hàng; không khung Thành tiền riêng. */
test('2.14.0 Nhập hàng: thanh có nhapSearch, không nhãn chữ; summary ẩn trực quan; tờ ghi nhapListBox luôn hiện (không hidden)', () => {
  const box = PAGE.slice(PAGE.indexOf('id="nhapBox"'), PAGE.indexOf('<div class="grid2 mt-18">'));
  const bar = box.match(/<div class="card__bar">[\s\S]*?<\/div>\s*<\/div>\s*<div class="note" id="nhapListBox">/);
  assert.ok(bar, 'thiếu thanh card__bar của Nhập hàng');
  assert.match(bar[0], /id="nhapSearch"/);
  assert.match(box, /<summary class="card__head sr-summary">/);
  assert.doesNotMatch(box, /<label[^>]*for="nhap(Search|Qty|Price)"/, 'còn nhãn chữ phía trên ô');
  assert.doesNotMatch(box, /class="hintbox/, 'còn khung Thành tiền riêng');
  assert.match(box, /<div class="note" id="nhapListBox">/, 'tờ ghi không được có thuộc tính hidden');
  assert.match(PAGE, /box\.hidden = false;/, 'renderNhapList phải luôn hiện tờ ghi');
});

test('2.14.0 Nhập hàng: dòng đang nhập (nhapQty, nhapPrice, nhap-add) nằm trong tờ ghi; chân note__foot một hàng có nhapListTotal và Lưu nhập hàng', () => {
  const note = PAGE.slice(PAGE.indexOf('id="nhapListBox"'), PAGE.indexOf('<div class="grid2 mt-18">'));
  const iPend = note.indexOf('class="tw note__pending"'), iFoot = note.indexOf('class="note__foot"');
  assert.ok(iPend > 0 && iFoot > iPend, 'dòng nhập phải nằm trong tờ ghi, trước chân');
  const pend = note.slice(iPend, iFoot);
  for (const id of ['nhapQty', 'nhapPrice', 'nhapTotal', 'nhapPendingBody']) assert.match(pend, new RegExp('id="' + id + '"'), 'dòng nhập thiếu ' + id);
  assert.match(pend, /data-action="nhap-add"/);
  const foot = note.slice(iFoot);
  assert.match(note, /<tfoot id="nhapListFoot" hidden>[\s\S]*?id="nhapListTotal"/, '2.17.3: Tổng là hàng cuối bảng');
  assert.doesNotMatch(foot.replace(/<span class="nhap-foot__tot">[\s\S]*?<\/span>/, ''), /Tổng/, '2.17.3: chân Nhập hàng chỉ còn nút (2.30.3: thêm dòng tổng riêng cho desktop)');
  assert.doesNotMatch(PAGE, /nhap-pend__tot">Thành tiền/);
  assert.match(foot, /<button class="btn btn--dark" type="submit"[^>]*>[\s\S]*?id="nhapSaveLabel"/);
  assert.equal((PAGE.match(/id="nhapTotal"/g) || []).length, 1);
  assert.match(PAGE, /renumber\(pendTb, nhapList\.length\);/);
});

/* 2.14.0 (T1–T3, Nhập hàng điện thoại): bố cục gọn theo ảnh duyệt. */
test('2.14.0 Thuốc chén điện thoại: ô chọn đơn rộng cả hàng 2 của thanh; nút chân ≥44px; tiêu đề cột ẩn khi tờ ghi rỗng', () => {
  assert.match(PAGE, /@media \(max-width:600px\)\{\n#remedyBox \.card__bar-preset\{order:1;flex:1 1 90px;min-width:90px\}/);
  assert.match(PAGE, /#remedyNote \.note__row--btns\{flex-wrap:nowrap;gap:6px\}/);
  assert.match(PAGE, /#remedyNote>\.note__list>table:has\(#remedyNoteBody:empty\)>thead\{display:none\}/);
  assert.match(PAGE, /#remedyNote:has\(#remedyBody tr\[data-pid\]\)>\.note__list>table>thead\{display:table-header-group\}/);
});

test('2.14.0 Nhập hàng điện thoại: dòng đang nhập là một dòng lưới (is-row) có nhãn SL/Giá; thành tiền và gợi ý giá nằm trong khung; không còn "Tương đương"', () => {
  const pend = PAGE.slice(PAGE.indexOf('id="nhapPendingBody"'), PAGE.indexOf('</tr>', PAGE.indexOf('id="nhapPendingBody"')));
  assert.match(pend, /<tr class="is-row">/);
  assert.match(pend, /data-label="SL \(kg\)"/);
  assert.match(pend, /data-label="Giá nhập \(k\/kg\)"/);
  assert.match(pend, /id="nhapPendName"/);
  assert.match(pend, /id="nhapTotal"/);
  const rowStart = PAGE.indexOf('<tr class="is-row">', PAGE.indexOf('id="nhapPendingBody"'));
  const rowEnd = PAGE.indexOf('</tr>', rowStart);
  const iHint = PAGE.indexOf('id="nhapHint"');
  assert.ok(iHint > rowStart && iHint < rowEnd, '#nhapHint phải là hậu duệ của tr.is-row (dòng đang nhập), không tràn ra ngoài');
  assert.match(PAGE, /#nhapListBox \.note__pending \.nhap-add\{height:36px;min-height:36px;width:36px;min-width:36px;display:block;margin-left:auto\}/, 'nút + máy tính 36px bằng ô inp--sm, là khối (M8)');
  assert.doesNotMatch(PAGE, /Tương đương/);
  assert.match(PAGE, /\.nhap-pend__tot\{float:right/);
});

/* 2.14.0 N7: cuộn chuột không đổi số trong ô số; ô số không mũi tên. */
test('2.14.0 N7 wheel: ô số đang focus bị blur khi cuộn, value giữ nguyên; ô không focus hoặc không phải number thì không blur; listener passive ở document', () => {
  const base = trackDoc({});
  const reg = [];
  base.addEventListener = (ev, f, opt) => { reg.push({ ev: ev, f: f, opt: opt }); };
  loadClient({ document: base, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  const w = reg.filter(x => x.ev === 'wheel');
  assert.equal(w.length, 1, 'phải đăng ký đúng một listener wheel ở document');
  assert.equal(w[0].opt && w[0].opt.passive, true, 'listener wheel phải passive');
  const mk = (type, focused) => {
    const el = { tagName: 'INPUT', type: type, value: '5', blurs: 0,
      blur() { if (base.activeElement === this) { base.activeElement = null; this.blurs++; } },
      focus() { base.activeElement = this; } };
    if (focused) el.focus();
    return el;
  };
  const fire = el => w[0].f({ target: el, deltaY: 1 });
  const num = mk('number', true); fire(num);
  assert.equal(num.blurs, 1, 'ô số đang focus phải bị blur');
  assert.equal(num.value, '5', 'không được đổi giá trị');
  const notFocused = mk('number', false); fire(notFocused);
  assert.equal(notFocused.blurs, 0, 'ô không focus không bị blur');
  const txt = mk('text', true); fire(txt);
  assert.equal(txt.blurs, 0, 'ô không phải number không bị blur');
});

test('2.14.0 N7 CSS: ẩn hai mũi tên tăng/giảm của input[type=number] (webkit và moz)', () => {
  assert.match(PAGE, /input\[type=number\]::-webkit-outer-spin-button,\ninput\[type=number\]::-webkit-inner-spin-button\{-webkit-appearance:none;margin:0\}/);
  assert.match(PAGE, /input\[type=number\]\{-moz-appearance:textfield;appearance:textfield\}/);
  assert.match(PAGE, /inputmode="decimal"/, 'bàn phím số trên điện thoại giữ nguyên');
});

/* 2.14.0 giai đoạn 3: Kho tồn, Lịch sử nhập, Lịch sử bán – thanh một hàng; không nhãn chữ; số liệu trong thanh. */
test('2.14.0 Kho/Nhập/Bán: thanh card__bar có tên mục, ô tìm/lọc, số liệu; summary ẩn trực quan; không nhãn chữ phía trên ô', () => {
  for (const box of ['invBox', 'impBox', 'expBox']) {
    const i = PAGE.indexOf('id="' + box + '"');
    const seg = PAGE.slice(i, PAGE.indexOf('<div class="tw">', i));
    assert.match(seg, /<summary class="card__head sr-summary">/, box + ': summary phải ẩn trực quan');
    assert.match(seg, /<div class="card__bar">/, box + ': thiếu thanh card__bar');
    assert.doesNotMatch(seg, /<label class="lbl"/, box + ': còn nhãn chữ phía trên ô');
    assert.doesNotMatch(seg, /Đối chiếu tồn hiện tại/, box + ': còn chú thích dài');
  }
  const inv = PAGE.slice(PAGE.indexOf('id="invBox"'), PAGE.indexOf('<div class="tw">', PAGE.indexOf('id="invBox"')));
  assert.match(inv, /data-action="reconcile"/);
  assert.match(inv, /id="invCount"/);
  for (const id of ['invSearch', 'impSearch', 'expMonth', 'expSearch', 'invCount', 'impCount', 'expCount', 'invList', 'impSearchList']) {
    assert.equal((PAGE.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1, 'id ' + id + ' phải đúng 1 lần');
  }
});

test('2.14.0 Kho/Nhập/Bán điện thoại: nút Đối chiếu chỉ biểu tượng; ô tìm lịch sử nhập xuống hàng 2 cả hàng; số liệu Lịch sử nhập ở hàng 1 cùng tên', () => {
  assert.match(PAGE, /@media \(max-width:600px\)\{[\s\S]*?\.card__bar-lbl\{display:none\}/);
  assert.match(PAGE, /\.card__bar-search\.is-inline,\.card__bar>\.inp\.card__bar-search\{order:1;flex:1 1 80px;min-width:0\}/, 'ô tìm cùng hàng tiêu đề (2.15.0)');
  assert.match(PAGE, /\.card__bar-count\{order:4;margin-left:0\}/, 'số liệu xuống hàng cuối nếu hết chỗ');
  
  assert.match(PAGE, /aria-label="Đối chiếu tồn kho" title="Đối chiếu tồn kho"/);
});

/* 2.13.0 (N4): header – icon âm dương là nút đổi giao diện; "Quản Lý Kho" là nút vào Thiết bị (chỉ thiết bị chủ). */
test('2.13.0 N4 header: không còn liên kết Thiết bị/Hệ thống; brand là button brand-devices; icon âm dương là span trang trí (2.17.0: không còn menu sáng/tối)', () => {
  const head = PAGE.match(/<header class="top">[\s\S]*?<\/header>/)[0];
  assert.doesNotMatch(head, /href="\/auth\/devices"/, 'còn liên kết /auth/devices trong header');
  assert.doesNotMatch(head, /<a class="brand"/, 'brand vẫn là thẻ a');
  assert.doesNotMatch(head, />\s*Thiết bị\s*</, 'còn nút chữ Thiết bị');
  assert.doesNotMatch(head, /Hệ thống/, 'còn chữ Hệ thống trong header');
  assert.match(head, /<button class="brand" type="button" id="brandBtn" data-action="brand-devices"[^>]*>Quản Lý Kho<\/button>/);
  assert.match(head, /<span class="brand__yin" id="brandLogo" aria-hidden="true">/);
  assert.doesNotMatch(head, /data-theme-set|theme-menu/, '2.17.0: chỉ một theme sáng, không còn menu giao diện');
});

test('2.13.0 N4 CSS: keyframes rung và nhánh prefers-reduced-motion cho icon; tiêu đề là nút không viền', () => {
  assert.match(PAGE, /@keyframes yinShake\{/);
  assert.match(PAGE, /\.brand__yin\.is-shake\{animation:yinShake/);
  assert.match(PAGE, /@media \(prefers-reduced-motion:reduce\)\{\.brand__yin\.is-shake\{animation:none/);
  assert.match(PAGE, /\.brand\{[^}]*background:none;border:0;padding:0/);
});

test('2.13.0 N4 brandDevicesClick: fetch 200 → vào /auth/devices; 403, lỗi mạng → không đi, rung icon và báo chỉ-đọc; chặn bấm lặp', async () => {
  const yinClasses = new Set();
  const yin = { classList: { add: c => yinClasses.add(c), remove: c => yinClasses.delete(c), contains: c => yinClasses.has(c) }, offsetWidth: 0 };
  const note = { textContent: '' };
  const els = { '#brandLogo': yin, '#brandNote': note, '#toast': makeEl(), '#toastMsg': makeEl() };
  const mkDoc = () => ({
    readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return els[s] || null; }, querySelectorAll() { return []; },
    createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, addEventListener() {}, removeEventListener() {}
  });
  const run = async (status, throws) => {
    const loc = { href: 'https://example.test/' };
    const calls = [];
    const fetchStub = async (url, opts) => { calls.push([url, opts]); if (throws) throw new Error('mạng'); return { status }; };
    const c = loadClient({ document: mkDoc(), location: loc, fetch: fetchStub, setTimeout() { return 0; }, clearTimeout() {} });
    await c.brandDevicesClick();
    return { loc, calls, c };
  };
  yinClasses.clear(); note.textContent = '';
  const ok = await run(200, false);
  assert.equal(ok.loc.href, '/auth/devices', 'thiết bị chủ phải vào /auth/devices');
  assert.equal(ok.calls[0][0], '/auth/devices');
  assert.equal(ok.calls[0][1].redirect, 'manual');
  assert.equal(ok.calls[0][1].credentials, 'same-origin');

  for (const [status, throws] of [[403, false], [401, false], [0, true]]) {
    yinClasses.clear(); note.textContent = '';
    const r = await run(status, throws);
    assert.equal(r.loc.href, 'https://example.test/', 'thành viên không được điều hướng (status ' + status + ')');
    assert.ok(yinClasses.has('is-shake'), 'icon phải rung (status ' + status + ')');
    assert.equal(note.textContent, 'Chỉ thiết bị chủ quản lý được thiết bị.');
  }

  yinClasses.clear();
  const loc2 = { href: 'https://example.test/' };
  let n = 0;
  const slow = () => new Promise(res => setTimeout(() => res({ status: 403 }), 0));
  const c2 = loadClient({ document: mkDoc(), location: loc2, fetch: async () => { n++; return slow(); }, setTimeout() { return 0; }, clearTimeout() {} });
  const p1 = c2.brandDevicesClick(), p2 = c2.brandDevicesClick();
  await Promise.all([p1, p2]);
  assert.equal(n, 1, 'bấm lặp trong lúc kiểm không được gửi thêm yêu cầu');
});

/* 2.13.0 (N2): thông báo phải thấy được: lỗi 5 giây + assertive; trong hộp thoại đang mở thì có khung lỗi; phone: toast ở đầu màn hình. */
function toastDoc(openDialog) {
  const classes = new Set();
  const tEl = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] || null; }, classList: { add: c => classes.add(c), remove: c => classes.delete(c) }, textContent: '' };
  const mEl = makeEl();
  const card = { children: [], head: { nextSibling: null }, querySelector(s) { return s === '.card__head' ? this.head : null; }, appendChild(c) { this.children.push(c); }, insertBefore(c) { this.children.push(c); } };
  const dlg = { card, box: null, querySelector(s) { return s === '.dlg__card' ? card : s === '.dlg__err' ? this.box : null; } };
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#toast' ? tEl : s === '#toastMsg' ? mEl : s === 'dialog[open]' ? (openDialog ? dlg : null) : null; },
    querySelectorAll() { return []; }, createElement() { return { attrs: {}, className: '', textContent: '', setAttribute(k, v) { this.attrs[k] = v; } }; },
    createElementNS() { return makeEl(); }, addEventListener() {}, removeEventListener() {}
  };
  return { doc, tEl, card, dlg };
}

test('2.13.0 N2 toast: lỗi giữ 5 giây và role=alert/assertive; thông báo thường 2,8 giây và role=status/polite', () => {
  const timers = [];
  const { doc, tEl } = toastDoc(false);
  const c = loadClient({ document: doc, setTimeout(fn, ms) { timers.push(ms); return 1; }, clearTimeout() {} });
  c.toast('Lỗi thử', 'error');
  assert.equal(timers.at(-1), 5000, 'lỗi phải giữ 5000 ms');
  assert.equal(tEl.attrs.role, 'alert');
  assert.equal(tEl.attrs['aria-live'], 'assertive');
  c.toast('Đã lưu', 'ok');
  assert.equal(timers.at(-1), 2800, 'thông báo thường giữ 2800 ms');
  assert.equal(tEl.attrs.role, 'status');
  assert.equal(tEl.attrs['aria-live'], 'polite');
});

test('2.13.0 N2 toast lỗi khi hộp thoại đang mở: có khung lỗi role=alert trong hộp; không có hộp mở thì không tạo khung', () => {
  const t1 = toastDoc(true);
  const c1 = loadClient({ document: t1.doc, setTimeout() { return 1; }, clearTimeout() {} });
  c1.toast('Số lượng quá lớn', 'error');
  assert.equal(t1.card.children.length, 1, 'phải có khung lỗi trong hộp');
  assert.equal(t1.card.children[0].attrs.role, 'alert');
  assert.equal(t1.card.children[0].textContent, 'Số lượng quá lớn');
  const t2 = toastDoc(false);
  const c2 = loadClient({ document: t2.doc, setTimeout() { return 1; }, clearTimeout() {} });
  c2.toast('Số lượng quá lớn', 'error');
  assert.equal(t2.card.children.length, 0, 'không có hộp mở thì không tạo khung');
});

test('2.13.0 N2 CSS: điện thoại (≤600px) đặt .toast ở đầu màn hình (top + safe-area), sau quy tắc gốc; khung lỗi có dlg__err', () => {
  const at = s => { const i = PAGE.indexOf(s); assert.ok(i >= 0, 'thiếu: ' + s); return i; };
  const base = at('.toast{position:fixed');
  const m = at('.toast{top:calc(env(safe-area-inset-top,0px) + 64px)');
  assert.ok(base < m, 'quy tắc điện thoại .toast phải sau quy tắc gốc');
  assert.equal(PAGE.lastIndexOf('@media', m), PAGE.lastIndexOf('@media (max-width:600px)', m), '.toast điện thoại phải trong @media (max-width:600px)');
  assert.match(PAGE, /\.dlg__err\{/);
  assert.match(PAGE, /d\.addEventListener\('close', function\(\)\{ clearDlgErr\(d\); \}\);/, 'khung lỗi phải xóa khi đóng hộp');
});

/* 2.13.0 (N1): sau lỗi trần, con trỏ ở ĐÚNG ô sai và ô đó không bị blur. DOM giả theo dõi activeElement và số lần blur. */
function trackDoc(ids) {
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return ids[s] || null; }, querySelectorAll() { return []; },
    createElement() { return makeEl(); }, createElementNS() { return makeEl(); },
    addEventListener() {}, removeEventListener() {},
    track(el) {
      el.blurs = 0;
      el.focus = function () { if (doc.activeElement && doc.activeElement !== this) doc.activeElement.blur(); doc.activeElement = this; };
      el.blur = function () { if (doc.activeElement === this) { doc.activeElement = null; this.blurs++; } };
      el.select = function () {};
      return el;
    }
  };
  for (const k of Object.keys(ids)) doc.track(ids[k]);
  return doc;
}
const N1_FAKE_FETCH = async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) });

test('2.13.0 N1 addNhapItem: số lượng vượt trần giữ con trỏ ở #nhapQty, không blur', () => {
  const ids = { '#nhapSearch': { value: 'Cam thảo' }, '#nhapQty': { value: '10000000' }, '#nhapPrice': { value: '10' }, '#toast': makeEl(), '#toastMsg': makeEl() };
  const doc = trackDoc(ids);
  doc.activeElement = ids['#nhapQty'];
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 0, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.setBase(1);
  c.addNhapItem();
  assert.equal(doc.activeElement, ids['#nhapQty'], 'con trỏ phải ở ô số lượng');
  assert.equal(ids['#nhapQty'].blurs, 0, 'ô số lượng không được bị blur');
});

test('2.13.0 N1 saveNhap (Lưu nhập hàng): số lượng vượt trần giữ con trỏ ở #nhapQty (không nhảy sang giá)', () => {
  const ids = { '#nhapSearch': { value: 'Cam thảo' }, '#nhapQty': { value: '10000000' }, '#nhapPrice': { value: '10' }, '#toast': makeEl(), '#toastMsg': makeEl() };
  const doc = trackDoc(ids);
  doc.activeElement = ids['#nhapQty'];
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 0, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.setBase(1);
  c.saveNhap();
  assert.equal(doc.activeElement, ids['#nhapQty'], 'con trỏ phải ở ô số lượng');
  assert.equal(ids['#nhapQty'].blurs, 0);
  assert.equal(c.getDb().transactions.length, 0, 'không ghi db khi vượt trần');
});

test('2.13.0 N1 saveNhap với tờ ghi có dòng vượt trần: con trỏ về #nhapQty, không về #nhapSearch', () => {
  const ids = { '#nhapSearch': { value: '' }, '#nhapQty': { value: '' }, '#nhapPrice': { value: '' }, '#toast': makeEl(), '#toastMsg': makeEl() };
  const doc = trackDoc(ids);
  doc.activeElement = ids['#nhapPrice'];
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 0, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.setBase(1);
  c.setNhapList([{ pid: 'p1', name: 'Cam thảo', qty: 10000000, price: 10000 }]);
  c.saveNhap();
  assert.equal(doc.activeElement, ids['#nhapQty'], 'con trỏ phải về ô số lượng');
  assert.equal(ids['#nhapSearch'].blurs, 0, 'không được nhảy sang ô tên vị thuốc');
});

test('2.13.0 N1 commitRetailRow: thành tiền vượt trần giữ con trỏ ở ô thành tiền', () => {
  const qEl = { value: '1' }, mEl = { value: '99999999999' };
  const row = { getAttribute() { return 'p1'; }, querySelector(sel) { return sel === '.retail-qty' ? qEl : sel === '.retail-money' ? mEl : { value: '0' }; } };
  const ids = { '#retailBody': { querySelector() { return row; } }, '#toast': makeEl(), '#toastMsg': makeEl() };
  const doc = trackDoc(ids);
  doc.track(qEl); doc.track(mEl);
  doc.activeElement = mEl;
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  assert.equal(c.commitRetailRow(), false);
  assert.equal(doc.activeElement, mEl, 'con trỏ phải ở ô thành tiền');
  assert.equal(mEl.blurs, 0);
});

test('2.13.0 N1 nút + / Lưu nhập / Lưu bán lẻ / Lưu thuốc chén có data-keep-focus; JS chặn mousedown và pointerdown trên nút đó', () => {
  for (const sel of ['data-action="nhap-add"', 'data-action="save-retail"', 'data-action="save-remedy"']) {
    const tag = PAGE.match(new RegExp('<button[^>]*' + sel + '[^>]*>'))[0];
    assert.match(tag, /data-keep-focus/, sel + ' thiếu data-keep-focus');
  }
  const submit = PAGE.match(/<button class="btn btn--dark" type="submit"[^>]*>/)[0];
  assert.match(submit, /data-keep-focus/, 'nút Lưu nhập hàng thiếu data-keep-focus');
  assert.match(PAGE, /doc\.addEventListener\('pointerdown', keepFocusDown, true\);/);
  assert.match(PAGE, /doc\.addEventListener\('mousedown', keepFocusDown, true\);/);
  assert.match(PAGE, /function keepFocusDown\(e\)\{[^}]*closest\('\[data-keep-focus\]'\)[^}]*preventDefault/);
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

/* 2.12.0 (B): nhãn tab hai hàng (tab__l1/tab__l2), không biểu tượng, cỡ chữ 13px máy tính / 12px điện thoại. */
test('2.12.0 nhãn tab: mỗi nút đúng 2 span tab__l1/tab__l2 không rỗng; không biểu tượng trong nav; cỡ chữ đúng', () => {
  const nav = PAGE.match(/<nav class="tabs"[\s\S]*?<\/nav>/)[0];
  const btns = [...nav.matchAll(/<button [^>]*>[\s\S]*?<\/button>/g)].map(m => m[0]);
  assert.equal(btns.length, 8);
  for (const b of btns) {
    const l1 = b.match(/<span class="tab__l1">([^<]+)<\/span>/), l2 = b.match(/<span class="tab__l2">([^<]+)<\/span>/);
    assert.ok(l1 && l2 && l1[1].trim() && l2[1].trim(), 'mỗi nút phải có đúng hai hàng không rỗng: ' + b.slice(0, 80));
    assert.equal(b.split('<span').length - 1, 2, 'đúng 2 span (icon là svg, không phải span)');
  }
  assert.match(PAGE, /\.tab\{display:flex;flex-direction:column;[^}]*min-height:44px/);
  assert.match(PAGE, /\.tab\{padding:4px 2px;font-size:12px\}/);
  assert.match(PAGE, /font-size:13px;font-weight:600;line-height:1\.2;text-align:center;cursor:pointer[;}]/);
});

/* 2.12.0 (C): giảm chói – token màu đổi ở cả :root và html[data-theme=dark]; không nền #fff; tương phản đạt AA. */
const C_TOKENS = ['--bg', '--surface', '--surface2', '--text', '--text2', '--muted', '--brand', '--brand-text', '--brand-soft',
  '--green-text', '--amber-soft', '--amber-text', '--red-soft', '--red-text', '--blue-text', '--chart-imp', '--chart-exp'];
function tokenBlocks() {
  const r0 = PAGE.indexOf(':root{');
  assert.ok(r0 >= 0, 'thiếu :root');
  return { root: PAGE.slice(r0, PAGE.indexOf('}', r0)) };
}
function tokenVal(block, name) {
  const m = block.match(new RegExp('(?:^|[;{\\s])' + name + ':(#[0-9a-fA-F]{3,6})'));
  assert.ok(m, 'thiếu token ' + name + ' trong khối');
  return m[1];
}
function lumC(h) {
  h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratioC(a, b) { const x = lumC(a), y = lumC(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

test('2.12.0 token giảm chói có ở :root (2.17.0: một theme sáng); không còn --surface:#fff', () => {
  const { root } = tokenBlocks();
  for (const t of C_TOKENS) tokenVal(root, t);
  assert.doesNotMatch(PAGE, /data-theme=dark|prefers-color-scheme/, '2.17.0: không còn nhánh tối');
  assert.doesNotMatch(PAGE, /--surface:#fff[;}]/, '--surface vẫn là #fff');
  assert.doesNotMatch(PAGE, /background:#fff(fff)?[;}"]/, 'còn nền #fff cứng');
});

test('2.12.0 không có màu cứng #fff/#000 ngoài danh sách cho phép (chữ trên nút màu, nét icon)', () => {
  for (const m of PAGE.matchAll(/#fff(?![0-9a-fA-F])/gi)) {
    const pre = PAGE.slice(Math.max(0, m.index - 8), m.index);
    assert.ok(/color:$|fill="$/.test(pre), '#fff không được dùng làm nền: …' + PAGE.slice(m.index - 30, m.index + 6));
  }
  for (const m of PAGE.matchAll(/#000(?![0-9a-fA-F])/g)) {
    assert.ok(/fill="$/.test(PAGE.slice(Math.max(0, m.index - 8), m.index)), '#000 chỉ cho nét icon');
  }
});

test('2.12.0 tương phản WCAG AA: chữ ≥ 4.5:1, chữ trắng trên nút màu ≥ 4.5:1 (cả hai chế độ)', () => {
  const { root } = tokenBlocks();
  const pairs = [['--text', '--surface'], ['--text2', '--surface'], ['--muted', '--surface'], ['--brand-text', '--brand-soft'],
    ['--brand-text', '--surface'], ['--green-text', '--surface'], ['--amber-text', '--amber-soft'], ['--red-text', '--red-soft'],
    ['--blue-text', '--surface']];
  for (const [blockName, block] of [['root', root]]) {
    for (const [a, b] of pairs) {
      const r = ratioC(tokenVal(block, a), tokenVal(block, b));
      assert.ok(r >= 4.5, blockName + ' ' + a + ' / ' + b + ' = ' + r.toFixed(2));
    }
    assert.ok(ratioC('#ffffff', tokenVal(block, '--brand')) >= 4.5, blockName + ' chữ trắng / --brand');
  }
  assert.ok(ratioC('#ffffff', '#4f46e5') >= 4.5, 'chữ trắng trên nút primary');
});

/* 2.12.0 (D): nút lưu đơn Bán lẻ đổi chữ thành "Bán đơn"; Thuốc chén giữ nguyên nút "Lưu đơn" (preset). */
test('2.12.0 nút Bán lẻ data-action=save-retail có chữ "Bán đơn"; không còn "Lưu đơn" ở nút đó', () => {
  const btn = PAGE.match(/<button[^>]*data-action="save-retail"[^>]*>[\s\S]*?<\/button>/)[0];
  assert.match(btn, /<\/svg>Bán đơn\s*<\/button>/);
  assert.doesNotMatch(btn, /Lưu đơn/);
  assert.equal(PAGE.split('data-action="save-retail"').length - 1, 1);
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
  const sumAt = chart.indexOf('<summary'), sumEnd = chart.indexOf('</summary>');
  assert.ok(sumAt >= 0 && sumEnd > sumAt, 'thiếu summary của #chartBox');
  assert.ok(chart.slice(sumAt, sumEnd).includes('id="statImport"') && chart.slice(sumAt, sumEnd).includes('id="statStock"'), 'số liệu phải nằm trong summary (2.13.2)');
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
/* 2.12.0 thêm nhap-add; 2.13.0 thêm brand-devices (không tính khi so với danh sách 1023b40). */
const NEW_213 = ['nhap-add', 'brand-devices'];
/* 2.14.0 thêm preset-newname; 2.15.5 bỏ lại. */
const NEW_214 = [];
/* 2.15.0: nút Tải lại (chỉ ở màn hình chính). */
const NEW_215 = ['reload-app', 'open-backup-dir', 'bak-refresh'];
const NEW_226 = ['close-preset']; // 2.26.0: nút ✕ bỏ đơn đang mở (desktop)
/* 2.13.0 (N5) bỏ 4 nút Gần nhất/Tất cả: latest-imp, clear-imp, latest-exp, clear-exp. */
const REMOVED_213 = ['latest-imp', 'clear-imp', 'latest-exp', 'clear-exp', 'merge-old', 'merge-do', 'close-merge', 'theme-menu'];
const OLD_DATA_ACTIONS = ['backup-now', 'clear-exp', 'clear-imp', 'close-edit', 'close-merge', 'close-order', 'close-rec', 'close-tx',
  'del-preset', 'latest-exp', 'latest-imp', 'merge-do', 'merge-do', 'merge-old', 'rec-fix-all', 'reconcile',
  'restore-file', 'save-edit', 'save-preset', 'save-remedy', 'save-retail', 'save-tx', 'sync-discard', 'theme-menu'];
/* Trên host có đủ lịch sử git: đối chiếu thêm với 1023b40; trong image (không có git) và
   clone nông trên CI (không có commit 1023b40) chỉ dùng danh sách chốt sẵn. */
function oldPageFromGit() {
  try {
    return execFileSync('git', ['-C', REPO_ROOT, 'show', '1023b40:src/page.js'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    if (e && e.code === 'ENOENT') return null;
    const err = String((e && e.stderr) || '');
    if (e && (e.status === 128 || /bad object|invalid object name|unknown revision|exists on disk, but not in/i.test(err))) return null;
    throw e;
  }
}

test('2.10.0 id thẻ và data-action không đổi so với 1023b40; thứ tự DOM 8 thẻ giữ nguyên', () => {
  const old = oldPageFromGit();
  const actions = s => [...s.matchAll(/data-action="([^"]*)"/g)].map(m => m[1]).filter(a => !NEW_213.includes(a) && !NEW_214.includes(a) && !NEW_215.includes(a) && !NEW_226.includes(a) && !REMOVED_213.includes(a)).sort();
  assert.deepEqual(actions(PAGE), OLD_DATA_ACTIONS.filter(a => !REMOVED_213.includes(a)), 'data-action đã đổi so với 1023b40');
  if (old !== null) assert.deepEqual(actions(PAGE), actions(old).filter(a => a !== 'copy-preset'), 'data-action đã đổi (git 1023b40)');
  assert.equal(PAGE.split('data-action="nhap-add"').length - 1, 1, 'nhap-add đúng một lần (2.12.0)');
  const ids = s => new Set([...s.matchAll(/ id="([^"]*)"/g)].map(m => m[1]));
  const newIds = ids(PAGE);
  for (const id of TAB_ORDER_DOM) assert.ok(newIds.has(id), 'thiếu id thẻ ' + id);
  if (old !== null) for (const id of ids(old)) if (id !== 'invSort' && !/^merge/.test(id) && id !== 'i-monitor' && id !== 'i-chart-line' && id !== 'remedyCopyPreset' && id !== 'i-chev-r' && id !== 'txEditId' && id !== 'retailTotal' && !/^theme(Btn|Menu|Label|Color)$/.test(id) && id !== 'i-sun' && id !== 'i-moon' && id !== 'remedyQty') assert.ok(newIds.has(id), 'mất id ' + id); // 2.15.0: invSort chủ ý bỏ; 2.15.7: 2 symbol icon không dùng bỏ
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

/* 2.14.0 (giai đoạn 4, M3a): Kho tồn điện thoại – hàng 1 tên + nút …, hàng 2 số liệu một dòng (nhãn nội tuyến); nút … 32px máy tính, 34px điện thoại có vùng bấm qua ::after. */
test('2.14.0 M3a Kho tồn điện thoại: lưới 4 cột (tên + nút … ở hàng 1, ba số liệu ở hàng 2), nhãn nội tuyến, không còn lưới 3 cột cũ', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /table\.inv tr\.is-row\{grid-template-columns:minmax\(0,1fr\) auto auto auto;column-gap:10px;row-gap:2px;padding:4px 2px\}/);
  assert.doesNotMatch(css, /table\.inv tr\.is-row\{grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) auto\}/);
  assert.match(css, /table\.inv tr\.is-row>td:nth-child\(5\)\{grid-area:1\/4\/3\/5;justify-self:end;align-self:center\}/);
  assert.match(css, /table\.inv tr\.is-row>td:nth-child\(2\)::before,table\.inv tr\.is-row>td:nth-child\(3\)::before,table\.inv tr\.is-row>td:nth-child\(4\)::before\{display:inline;/);
  assert.match(css, /table\.inv td\.c-del \.btn--icon,table\.his td\.c-act \.btn--icon\{width:32px;min-width:32px;height:32px;min-height:32px;padding:0\}/, 'máy tính: nút … 32px (gộp cho Kho và Lịch sử)');
  assert.match(css, /table\.inv tr\.is-row>td\.c-del \.btn--icon::after\{content:"";position:absolute;inset:-3px\}/, 'điện thoại: vùng bấm 40px qua ::after');
});

/* 2.14.0 (giai đoạn 4, M3b): Lịch sử nhập/bán điện thoại – hàng 1 tên + ngày + …, hàng 2 SL/đơn giá/thành tiền (không nhãn chữ); nút … 32px máy tính, 34px điện thoại. */
test('2.14.0 M3b Lịch sử điện thoại: lưới 4 cột (tên và ngày ở hàng 1, SL/đơn giá/thành tiền ở hàng 2), không nhãn chữ; nút … 32px máy tính', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /table\.his tr\.is-row\{grid-template-columns:minmax\(0,1fr\) auto auto auto;column-gap:10px;row-gap:2px;padding:4px 2px\}/);
  assert.doesNotMatch(css, /table\.his tr\.is-row\{grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\) auto\}/);
  assert.match(css, /table\.his tr\.is-row>td:nth-child\(6\)\{grid-area:1\/4\/3\/5;justify-self:end;align-self:center\}/);
  assert.match(css, /table\.his tr\.is-row>td:nth-child\(3\)::before,table\.his tr\.is-row>td:nth-child\(4\)::before,table\.his tr\.is-row>td:nth-child\(5\)::before\{content:none\}/);
  assert.match(css, /table\.inv td\.c-del \.btn--icon,table\.his td\.c-act \.btn--icon\{width:32px;min-width:32px;height:32px;min-height:32px;padding:0\}/, 'máy tính: nút … 32px cho cả hai Lịch sử');
  assert.match(css, /table\.his tr\.is-row>td\.c-act \.btn--icon::after\{content:"";position:absolute;inset:-3px\}/);
});

/* 2.14.0 (giai đoạn 4, M3c): phân trang điện thoại – nút cao 36px, khoảng cách 4px (trong khối 600px). */
test('2.14.0 M3c phân trang điện thoại: .pager .btn--sm cao 36px và gap 4px trong khối 600px', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  const m = css.match(/@media \(max-width:600px\)\{[\s\S]*?\.pager \.btn--sm\{min-height:36px\}/);
  assert.ok(m, 'thiếu .pager .btn--sm{min-height:36px} trong khối 600px');
  assert.match(css, /@media \(max-width:600px\)\{[\s\S]*?\.pager\{gap:4px\}/);
});

/* 2.14.0 (giai đoạn 4, M5): Sao lưu – tiêu đề là .card__bar (icon + tên + hint #backupHint); summary ẩn trực quan giữ h2 để tab/test không đổi. */
test('2.14.0 M5 Sao lưu: summary sr-summary giữ h2; .card__bar có tiêu đề và #backupHint; CSS ẩn summary của #backupBox', () => {
  const i = PAGE.indexOf('id="backupBox"');
  const j = PAGE.indexOf('<div class="card__body">', i);
  const head = PAGE.slice(i, j);
  assert.match(head, /<summary class="card__head sr-summary">/);
  assert.match(head, /<h2 class="card__title">Sao lưu &amp; khôi phục<\/h2>/);
  assert.match(head, /<div class="card__bar">[\s\S]*card__bar-title[\s\S]*id="backupHint"/);
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /#backupBox>summary\.sr-summary,?[^{]*\{position:absolute;/);
  assert.match(css, /#invBox>summary\.sr-summary,#impBox>summary\.sr-summary,#expBox>summary\.sr-summary,#backupBox>summary\.sr-summary\{/);
});

/* 2.14.0 (giai đoạn 4, M6): hàng đang nhập (Bán lẻ, Thuốc chén, Nhập hàng) không bị ép 34px; quy tắc height:auto đứng SAU .note td{height:34px} (so vị trí trong chuỗi CSS). */
test('2.14.0 M6 hàng đang nhập: td của .note__pending tr.is-row có height:auto SAU .note td{height:34px}; dòng đã thêm vẫn 34px', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  const base = css.indexOf('.note td{height:34px;');
  const pend = css.indexOf('.note .note__pending tr.is-row>td{height:auto');
  assert.ok(base >= 0, 'thiếu .note td{height:34px}');
  assert.ok(pend > base, 'quy tắc height:auto của hàng đang nhập phải đứng sau .note td{height:34px}');
  assert.match(css, /\.note .note__pending tr\.is-row>td \.inp\{display:block\}/, 'ô nhập trong hàng đang nhập là block');
});

/* 2.14.0 (giai đoạn 4, M7): Thuốc chén điện thoại – dòng đang nhập 4 ô: gram 2/2–3/4, nút + 2/4 căn đáy, 44×44 (trong khối 600px, đặt sau quy tắc chung). */
test('2.14.0 M7 Thuốc chén điện thoại: gram chiếm 2/2–3/4, nút + ở 2/4 căn đáy 44×44 (sau quy tắc chung table.ord)', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  const gen = css.indexOf('table.ord tr.is-row>td:nth-child(4){grid-area:2/3}');
  const g = css.indexOf('#remedyNote .note__pending tr.is-row>td:nth-child(3){grid-area:2/2/3/4}');
  const b = css.indexOf('#remedyNote .note__pending tr.is-row>td:nth-child(4){grid-area:2/4;justify-self:end;align-self:end}');
  const btn = css.indexOf('#remedyNote .note__pending tr.is-row>td:nth-child(4) .btn{width:44px;min-width:44px;height:44px;min-height:44px;padding:0}');
  assert.ok(g >= 0, 'thiếu quy tắc gram 2/2–3/4');
  assert.ok(b >= 0, 'thiếu quy tắc nút + 2/4 căn đáy');
  assert.ok(btn >= 0, 'thiếu quy tắc nút + 44×44');
  assert.ok(g > gen && b > gen && btn > gen, 'quy tắc Thuốc chén phải đứng sau quy tắc chung table.ord');
});

/* 2.14.0 (giai đoạn 4, M8): nút + dòng đang nhập máy tính 36px (bằng ô inp--sm); điện thoại 44px đặt SAU khối ≤600px. */
test('2.14.0 M8 nút + dòng đang nhập: máy tính 36×36 (nhap-add và .note__pending .btn--icon) đứng TRƯỚC khối ≤600px; điện thoại 44×44 đứng SAU', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  const dNhap = css.indexOf('#nhapListBox .note__pending .nhap-add{height:36px;min-height:36px;width:36px;min-width:36px;display:block;margin-left:auto}');
  const dIcon = css.indexOf('.note__pending tr.is-row .btn--icon{width:36px;min-width:36px;height:36px;min-height:36px;padding:0}');
  const mNhap = css.indexOf('#nhapListBox .note__pending .nhap-add{height:44px;min-height:44px;width:44px;min-width:44px}');
  const m7 = css.indexOf('#remedyNote .note__pending tr.is-row>td:nth-child(3){grid-area:2/2/3/4}');
  assert.ok(dNhap >= 0, 'thiếu nhap-add 36px máy tính');
  assert.ok(dIcon >= 0, 'thiếu .btn--icon 36px máy tính trong dòng đang nhập');
  assert.ok(mNhap >= 0, 'thiếu nhap-add 44px điện thoại');
  assert.ok(mNhap > m7 && m7 > dIcon, 'quy tắc điện thoại 44px phải nằm trong khối ≤600px, đứng SAU quy tắc máy tính');
});

/* 2.14.0 S1: ô số không có padding-left cố định; gợi ý chỉ chiếm chỗ khi đang hiện và đủ chỗ; cột SL máy tính 152px (ô 132px) đặt sau mọi quy tắc cg-qty. */
test('2.14.0 S1 gợi ý không chiếm chỗ cố định: JS đặt .has-hint khi đủ QTY_TEXT_MIN=56px; ô chưa hiển thị (clientWidth 0) thì ẩn gợi ý, không padding', () => {
  assert.doesNotMatch(PAGE, /padding-left:50px/, 'không còn padding-left:50px cố định');
  assert.match(PAGE, /var QTY_TEXT_MIN = 56;/);
  assert.ok(PAGE.includes("clientWidth - (11 + hintW) - padR >= QTY_TEXT_MIN"));
  const doc = trackDoc({});
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  let wrap = null;
  const host = { classList: { add() {}, contains() { return false; } }, insertBefore(w) { wrap = w; return w; } };
  const input = { id: 'retailQty', value: '0.2', parentNode: host, attrs: {}, l: {}, clientWidth: 0, style: {},
    classList: { add() {}, remove() {} }, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, f) { this.l[ev] = f; } };
  c.attachQtyHint(input, 'kg');
  const h = wrap.children[1];
  assert.equal(h.hidden, true, 'ô chưa hiển thị → gợi ý ẩn (đợi ResizeObserver)');
  assert.equal(input.style.paddingLeft, '', 'không có padding-left khi gợi ý ẩn');
});

test('2.14.0 S1 CSS: cột SL máy tính 152px (ô 132px) trong @media (min-width:601px), đặt SAU mọi quy tắc cg-qty', () => {
  const css = PAGE.replace(/\/\*[\s\S]*?\*\//g, '');
  const m = css.match(/@media \(min-width:601px\)\{\s*#retailNote col\.cg-qty,#remedyNote col\.cg-qty,#nhapListBox col\.cg-qty\{width:152px;min-width:152px\}/);
  assert.ok(m, 'thiếu quy tắc cột SL 152px cho máy tính');
  const at = css.indexOf(m[0]);
  for (const base of ['#remedyNote col.cg-qty{width:84px}', '#nhapListBox col.cg-qty{width:84px}', '#retailNote col.cg-qty{width:104px}']) {
    assert.ok(at > css.indexOf(base), 'quy tắc 152px phải đứng sau ' + base);
  }
});

/* 2.14.0 N1: mã gán value rỗng cho ô số có gợi ý phải làm mới gợi ý (không còn "(12,5 kg)" trên ô trống). */
test('2.14.0 N1 runtime: refreshAllQtyHints làm mới gợi ý; ô bị xóa bằng mã → gợi ý rỗng và ẩn', () => {
  const doc = trackDoc({});
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  let wrap = null;
  const host = { classList: { add() {}, contains() { return false; } }, insertBefore(w) { wrap = w; return w; } };
  const input = { id: 'nhapQty', value: '0.5', parentNode: host, attrs: {}, l: {}, clientWidth: 0, style: {},
    classList: { add() {}, remove() {} }, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, f) { this.l[ev] = f; } };
  c.attachQtyHint(input, 'kg');
  const h = wrap.children[1];
  assert.equal(h.textContent, '(5 l)', 'trước khi xóa: có gợi ý');
  input.value = '';
  doc.querySelectorAll = () => [input];
  c.refreshAllQtyHints();
  assert.equal(h.textContent, '', 'ô trống → gợi ý rỗng');
  assert.equal(h.hidden, true, 'ô trống → gợi ý ẩn');
});

test('2.14.0 N1 cấu trúc: resetRetail, resetRemedy, resetNhapInputs, saveNhap, commitRetailRow, commitRemedyRow đều gọi refreshAllQtyHints()', () => {
  const body = name => {
    const i = PAGE.indexOf('\nfunction ' + name + '(');
    assert.ok(i >= 0, 'thiếu hàm ' + name);
    const j = PAGE.indexOf('\n}\n', i);
    return PAGE.slice(i, j);
  };
  for (const n of ['resetRetail', 'resetRemedy', 'resetNhapInputs', 'saveNhap', 'commitRetailRow', 'commitRemedyRow']) {
    assert.match(body(n), /\n {2}refreshAllQtyHints\(\);/, n + ' phải làm mới gợi ý sau khi xóa ô');
  }
});

/* 2.14.0 N3: mỗi ô gợi ý có id mô tả duy nhất (không trùng khi có nhiều dòng đang nhập). */
test('2.14.0 N3 id mô tả gợi ý duy nhất: hai ô không id tạo hai id khác nhau; aria-describedby khớp id', () => {
  const doc = trackDoc({});
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  const mk = () => {
    const rec = { wrap: null };
    const host = { classList: { add() {}, contains() { return false; } }, insertBefore(w) { rec.wrap = w; return w; } };
    const input = { id: '', value: '0.2', parentNode: host, attrs: {}, l: {}, clientWidth: 0, style: {},
      classList: { add() {}, remove() {} }, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, f) { this.l[ev] = f; } };
    c.attachQtyHint(input, 'kg');
    return { input, sr: rec.wrap.children[2] };
  };
  const a = mk(), b = mk();
  assert.notEqual(a.sr.id, b.sr.id, 'hai ô không được trùng id mô tả');
  assert.equal(a.input.attrs['aria-describedby'], a.sr.id);
  assert.equal(b.input.attrs['aria-describedby'], b.sr.id);
});

test('2.14.0 N2 runtime: chọn đơn có sẵn → ô tên ẩn (2.15.17), vẫn điền tên đơn; chọn Đơn mới → ô tên ẩn', () => {
  const mEl = makeEl();
  const els = { '#toast': makeEl(), '#toastMsg': mEl, '#remedyThang': makeEl(), '#remedyUnitPrice': makeEl(), '#remedyName': makeEl(), '#remedyBody': makeEl(), '#remedyPreset': makeEl(), '#remedyNote': makeEl() };
  const doc = trackDoc(els);
  const c = loadClient({ document: doc, Date: fakeClock(2026, 10, 11, 12), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [],
    prescriptions: [{ id: 'RX1', name: 'Đơn A', items: [{ productId: 'p1', grams: 50 }], total: 50000, thang: 1, updatedAt: 1 }], updatedAt: 1, moneyUnit: 'dong' });
  c.setBase(1);
  els['#remedyPreset'].value = 'RX1';
  c.remedyPresetPick();
  assert.equal(els['#remedyName'].hidden, true, '2.15.17: đã chọn đơn → ô tên vẫn ẩn (không đổi tên)');
  assert.equal(els['#remedyName'].value, 'Đơn A', 'ô tên điền sẵn tên đơn');
  els['#remedyPreset'].value = '';
  c.remedyPresetPick();
  assert.equal(els['#remedyName'].hidden, true, 'Đơn mới → ô tên ẩn mặc định');
});

test('2.15.5 cấu trúc: remedyPresetPick luôn ẩn ô tên (2.15.17); không còn remedyNewName', () => {
  const body = name => {
    const i = PAGE.indexOf('\nfunction ' + name + '(');
    const j = PAGE.indexOf('\n}\n', i);
    return PAGE.slice(i, j);
  };
  assert.equal(PAGE.includes('function remedyNewName'), false);
  assert.match(body('remedyPresetPick'), /remedyNameShow\(false\);/);
});

/* 2.14.0 S1 lint: ResizeObserver truy cập qua window (không biến tự do); khi không có window thì bỏ qua. */
test('2.14.0 S1 lint: gợi ý theo dõi kích thước qua window.ResizeObserver có kiểm typeof', () => {
  assert.match(PAGE, /typeof window !== 'undefined' && typeof window\.ResizeObserver === 'function'\) new window\.ResizeObserver\(fit\)\.observe\(input\);/);
});

/* 2.14.0 S2: hết chỗ trong ô thì gợi ý chuyển lên dòng nhãn, không ẩn. */
test('2.14.0 S2 gợi ý hết chỗ: ô 107px + "(2 lạng)" → vị trí "label" (không "hidden"); đủ chỗ → "inside"; không giá trị/ô chưa hiện → "hidden"', () => {
  const c = loadClient({ document: trackDoc({}), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  assert.equal(c.qtyHintPlacement(107 - 18, 0, 50, true), 'label', 'S2 ô hẹp 107px phải chuyển lên dòng nhãn');
  assert.equal(c.qtyHintPlacement(107, 9, 70, true), 'label');
  assert.equal(c.qtyHintPlacement(132, 9, 50, true), 'inside');
  assert.equal(c.qtyHintPlacement(225, 9, 70, true), 'inside');
  assert.equal(c.qtyHintPlacement(107, 9, 50, false), 'hidden');
  assert.equal(c.qtyHintPlacement(0, 9, 50, true), 'hidden');
});

test('2.14.0 S2 cấu trúc: fit có nhánh chuyển lên dòng nhãn (qty-hint--label), không còn nhánh ẩn vì hết chỗ; CSS sau quy tắc gốc', () => {
  const i = PAGE.indexOf('var fit = function(){');
  const fitSrc = PAGE.slice(i, PAGE.indexOf('var upd = function(){', i));
  assert.match(fitSrc, /qty-hint qty-hint--label/, 'S2 nhánh dòng nhãn');
  assert.doesNotMatch(fitSrc, /else \{\s*h\.hidden = true;/, 'S2 không còn ẩn-vì-hết-chỗ');
  assert.match(fitSrc, /place === 'hidden'/);
  const a = PAGE.indexOf('.qty-hint{position:absolute'), b = PAGE.indexOf('.qty-hint.qty-hint--label{');
  assert.ok(a > 0 && b > a, 'quy tắc label sau quy tắc gốc');
  assert.match(PAGE, /\.qty-hint\.qty-hint--label\{left:auto;right:0;top:0;/);
  assert.match(PAGE, /td\.c-qty\{position:relative\}/);
});

/* 2.14.0 M1: bề rộng ô đo bằng getBoundingClientRect (không dùng clientWidth: Edge/Chrome không gồm padding). */
test('2.14.0 M1 ô 132px (clientWidth 112 vì trừ padding) + gợi ý 50px → "inside" (padding-left 61px), không rơi vào dòng nhãn', () => {
  const doc = trackDoc({});
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  let wrap = null;
  const host = { classList: { add() {}, contains() { return false; } }, insertBefore(w) { wrap = w; return w; } };
  const input = { id: 'x', value: '1.25', parentNode: host, attrs: {}, l: {}, clientWidth: 112, style: {},
    getBoundingClientRect() { return { width: 132 }; },
    classList: { add() {}, remove() {} }, setAttribute(k, v) { this.attrs[k] = v; }, addEventListener(ev, f) { this.l[ev] = f; } };
  c.attachQtyHint(input, 'kg');
  const h = wrap.children[1];
  Object.defineProperty(h, 'offsetWidth', { value: 50, configurable: true });
  input.qtyHintRefresh();
  assert.equal(input.style.paddingLeft, '61px', 'M1 đủ chỗ trong ô 132px → inside');
  assert.doesNotMatch(String(h.className), /--label/);
  const i = PAGE.indexOf('var fit = function(){');
  assert.doesNotMatch(PAGE.slice(i, PAGE.indexOf('var upd = function(){', i)), /input\.clientWidth/, 'M1 fit không dùng clientWidth');
});

test('2.14.0 M2 rút gọn nội dung (không cắt "…"): luôn còn đơn vị', () => {
  const c = loadClient({ document: trackDoc({}), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  assert.equal(JSON.stringify(c.qtyHintCandidates('(1.234,5 kg)')), JSON.stringify(['(1.234,5 kg)', '1.234,5 kg', '1.234 kg', 'kg']));
  assert.equal(JSON.stringify(c.qtyHintCandidates('(2 l)')), JSON.stringify(['(2 l)', '2 l', 'l']));
  assert.equal(JSON.stringify(c.qtyHintCandidates('(50 g)')), JSON.stringify(['(50 g)', '50 g', 'g']));
  assert.doesNotMatch(PAGE.replace(/.sug__name{[^}]*}/, '').replace(/#remedyOpenName{[^}]*}/, ''), /text-overflow:ellipsis/, 'M2 không còn ellipsis cho gợi ý đơn vị (chỉ .sug__name của khung gợi ý tên được cắt "…")');
  assert.match(PAGE, /.sug__name{[^}]*white-space:nowrap[^}]*}/, '2.17.8 gợi ý tên mỗi vị 1 dòng');
});

test('2.14.0 M4 điện thoại ẩn tiêu đề cột tờ ghi (.note>table>thead) trong khối ≤600px', () => {
  const k = PAGE.indexOf('.note>.note__list>table>thead{display:none}');
  assert.ok(k > 0);
  const m = PAGE.lastIndexOf('@media (max-width:600px){', k);
  const e = PAGE.indexOf('\n}\n', m);
  assert.ok(m > 0 && k < e, 'quy tắc nằm trong khối ≤600px');
});

test('2.14.0 gợi ý viết tắt "l": không còn chữ "lạng" trong gợi ý; fmtQty toàn app vẫn "lạng"', () => {
  const c = loadClient({ document: trackDoc({}), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  assert.equal(c.qtyHintText('0.2', 'kg'), '(2 l)');
  assert.equal(c.qtyHintText('150', 'g'), '(1,5 l)');
  assert.equal(c.qtyHintText('2', 'kg'), '(2 kg)');
  assert.equal(c.qtyHintText('0.05', 'kg'), '(50 g)');
  for (const v of ['0.2', '0.25', '150']) assert.doesNotMatch(c.qtyHintText(v, v === '150' ? 'g' : 'kg'), /lạng/);
  assert.ok(typeof c.fmtQty === 'function' ? c.fmtQty(0.2) === '2 lạng' : /return fmtNum\(lang\) \+ ' lạng'/.test(PAGE), 'fmtQty vẫn ghi lạng');
});

test('2.15.0 nút Tải lại: chỉ hiện ở màn hình chính; có nháp/dirty thì hỏi trước, không thì tải lại ngay', () => {
  const mk = (extra) => {
    const btn = { hidden: true };
    const doc = { readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
      querySelector(s) { return s === '#reloadBtn' ? btn : null; }, querySelectorAll() { return []; },
      createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, addEventListener() {}, removeEventListener() {} };
    return { btn, doc, c: loadClient({ document: doc, ...extra }) };
  };
  /* trình duyệt thường: ẩn */
  let r = mk({ navigator: {}, matchMedia: () => ({ matches: false, addEventListener() {} }) });
  r.c.renderReloadBtn();
  assert.equal(r.btn.hidden, true, 'trình duyệt thường phải ẩn');
  /* iOS navigator.standalone */
  r = mk({ navigator: { standalone: true } });
  r.c.renderReloadBtn();
  assert.equal(r.btn.hidden, false, 'navigator.standalone phải hiện');
  /* display-mode: standalone */
  r = mk({ navigator: {}, matchMedia: (q) => ({ matches: q.includes('display-mode: standalone'), addEventListener() {} }) });
  r.c.renderReloadBtn();
  assert.equal(r.btn.hidden, false, 'display-mode standalone phải hiện');
  /* bấm: sạch → tải lại không hỏi */
  let reloads = 0, confirms = 0, answer = true;
  r = mk({ location: { href: 'x', reload() { reloads++; } }, confirm() { confirms++; return answer; } });
  r.c.setDirty(false); r.c.setRetailItems([]); r.c.setRemedyItems([]); r.c.setNhapList([]);
  r.c.reloadAppClick();
  assert.equal(reloads, 1); assert.equal(confirms, 0, 'không nháp thì không hỏi');
  /* dirty / nháp: hỏi; từ chối thì không tải lại */
  answer = false;
  r.c.setDirty(true);
  r.c.reloadAppClick();
  assert.equal(confirms, 1); assert.equal(reloads, 1, 'từ chối thì không tải lại');
  r.c.setDirty(false); r.c.setRetailItems([{ id: 1 }]);
  r.c.reloadAppClick();
  assert.equal(confirms, 2); assert.equal(reloads, 1);
  r.c.setRetailItems([]); r.c.setNhapList([{ id: 1 }]);
  r.c.reloadAppClick();
  assert.equal(confirms, 3); assert.equal(reloads, 1);
  answer = true;
  r.c.reloadAppClick();
  assert.equal(confirms, 4); assert.equal(reloads, 2, 'đồng ý thì tải lại');
  /* CSS + markup */
  assert.match(PAGE, /id="reloadBtn"[^>]*data-action="reload-app"[^>]*aria-label="Tải lại ứng dụng"[^>]*hidden/);
  assert.ok(PAGE.includes("case 'reload-app': reloadAppClick()"));
  assert.ok(PAGE.includes('#retailBox.foot-fixed #retailNote .note__foot,#remedyBox.foot-fixed #remedyNote .note__foot{position:fixed;left:0;right:0;bottom:0;'), '2.15.3: thanh fixed ở đáy màn hình');
  assert.ok(PAGE.includes('env(safe-area-inset-bottom'));
});

/* 2.15.0 giao diện thanh tiêu đề: ô tìm cùng hàng tiêu đề, chữ rút gọn, bỏ ô sắp xếp kho, ô năm trong tiêu đề Thống kê, chú giải "[ô màu] Nhập số tiền", chân Thuốc chén gọn. */
test('2.15.0 placeholder rút gọn "Nhập tên" cho mọi ô tìm vị thuốc; aria-label đầy đủ còn nguyên', () => {
  assert.doesNotMatch(PAGE, /placeholder="(Nhập tên vị thuốc…|Tìm vị thuốc…)"/);
  for (const id of ['retailSearch', 'remedySearch', 'nhapSearch', 'invSearch', 'impSearch', 'expSearch']) {
    const m = PAGE.match(new RegExp('<input[^>]*id="' + id + '"[^>]*>'));
    assert.ok(m, 'thiếu ' + id);
    assert.match(m[0], /placeholder="Nhập tên"/, id + ' chưa rút gọn');
    assert.match(m[0], /aria-label="[^"]{8,}"/, id + ' mất aria-label');
  }
});

test('2.15.5 Thuốc chén: chỉ còn option "Đơn mới" (value rỗng) + đơn đã lưu; không còn __new__', () => {
  const opts = [];
  const sel = makeEl();
  sel.appendChild = o => { opts.push(o); return o; };
  const doc = { readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#remedyPreset' ? sel : null; }, querySelectorAll() { return []; },
    createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, createTextNode(t) { return { textContent: String(t) }; },
    addEventListener() {}, removeEventListener() {} };
  const c = loadClient({ document: doc });
  c.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.renderPresetOptions();
  assert.deepEqual(opts.map(o => [o.value, o.textContent]), [['', 'Đơn mới']]);
});

test('2.15.0 Kho tồn: không còn ô #invSort; thiếu ô thì vẫn sắp theo bán chạy nhất (rồi theo tên)', () => {
  assert.doesNotMatch(PAGE, /id="invSort"|Bán chạy nhất \(nhiều/);
  const body = makeEl();
  const doc = { readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
    querySelector(s) { return s === '#invBody' ? body : null; }, querySelectorAll() { return []; },
    createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, createTextNode(t) { return { textContent: String(t) }; },
    addEventListener() {}, removeEventListener() {} };
  const c = loadClient({ document: doc });
  c.setDb({
    products: [{ id: 'a', name: 'Atiso', stock: 9, costPrice: 1 }, { id: 'b', name: 'Bạch chỉ', stock: 5, costPrice: 1 }, { id: 'c', name: 'Cam thảo', stock: 7, costPrice: 1 }],
    transactions: [
      { id: 't1', date: '2026-01-01', type: 'BAN', productId: 'c', qty: 3, price: 1, total: 3 },
      { id: 't2', date: '2026-01-01', type: 'BAN', productId: 'b', qty: 1, price: 1, total: 1 }
    ], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.renderInventory();
  assert.deepEqual(body.children.map(tr => tr.children[0].textContent), ['Cam thảo', 'Bạch chỉ', 'Atiso']);
});

test('2.15.0 Thống kê: #chartYear nằm trong summary tiêu đề; chú giải tháng "[ô màu] Nhập số tiền" rồi "[ô màu] Bán số tiền"', () => {
  const sum = PAGE.match(/<summary class="card__head chart-head">[\s\S]*?<\/summary>/)[0];
  assert.match(sum, /id="chartYear"/);
  assert.ok(sum.indexOf('Thống kê') < sum.indexOf('id="chartYear"'));
  const after = PAGE.slice(PAGE.indexOf('</summary>', PAGE.indexOf('id="chartBox"')));
  assert.doesNotMatch(after.slice(0, after.indexOf('id="statsChart"')), /id="chartYear"/);
  assert.match(PAGE, /id="chartImpChip"[^>]*><i class="chart-chip__sw"><\/i><span class="chart-chip__k">Nhập<\/span><b class="chart-chip__v" id="chartImpVal">/);
  assert.match(PAGE, /id="chartExpChip"[^>]*><i class="chart-chip__sw"><\/i><span class="chart-chip__k">Bán<\/span><b class="chart-chip__v" id="chartExpVal">/);
  assert.ok(PAGE.indexOf('id="chartImpChip"') < PAGE.indexOf('id="chartExpChip"'));
});

test('2.15.0 thanh tiêu đề điện thoại: ô tìm/ô chọn đơn không chiếm cả hàng riêng (flex 100%)', () => {
  assert.doesNotMatch(PAGE, /\.card__bar-search\{order:3;flex:1 0 100%\}/);
  assert.doesNotMatch(PAGE, /#remedyBox \.card__bar-preset\{order:3;flex:1 0 100%\}/);
  assert.match(PAGE, /\.card__bar>\.inp\.card__bar-search\{order:1;flex:1 1 80px;min-width:0\}/);
  assert.match(PAGE, /#remedyBox \.card__bar-preset\{order:1;flex:1 1 90px;min-width:90px\}/);
});

test('2.15.0 chân Thuốc chén: Lưu đơn | Bán đơn một hàng không xuống dòng; Xóa đơn ở hàng phụ riêng; id/action/aria-label giữ', () => {
  assert.match(PAGE, /#remedyNote \.note__row--btns\{flex-wrap:nowrap;gap:6px\}/);
  const foot = PAGE.slice(PAGE.indexOf('<div class="note__row note__row--btns">'), PAGE.indexOf('id="nhapBox"'));
  assert.doesNotMatch(PAGE, /note__row--aux/, '2.17.2: không còn hàng phụ');
  const btns = foot;
  assert.match(btns, /^[\s\S]*?<button[^>]*data-action="del-preset" id="remedyDelPreset" hidden>[\s\S]*?data-action="save-preset"[\s\S]*?data-action="save-remedy"/, '3 nút cùng một hàng: Xóa đơn, Lưu/Sửa đơn, Bán đơn');
  assert.doesNotMatch(PAGE, /Cập nhật đơn \(/, '2.17.2: nhãn Sửa đơn không kèm tên');
  assert.match(PAGE, /lbl\.textContent = 'Sửa đơn';/);
  assert.doesNotMatch(PAGE.slice(PAGE.indexOf('<div class="note__foot">', PAGE.indexOf('id="remedyNote"')), PAGE.indexOf('id="nhapBox"')), /Tổng <b|id="remedyQty"/, '2.17.2: chân không còn dòng Tổng g / số vị');
  assert.match(PAGE, /<tfoot id="remedyNoteFoot" hidden><tr><td><\/td><td class="b">1 thang<\/td>[\s\S]*?id="remedyNoteTotal"/, '2.17.2: hàng tổng cuối bảng ghi');
  assert.match(btns, /data-action="save-preset" id="remedySavePreset"/);
  assert.match(btns, /data-action="save-remedy"/);
});

/* 2.15.0 (Removed): bỏ hẳn chức năng Gộp đơn thuốc lẻ cũ; dữ liệu cũ có oid/oname vẫn được đọc và hiển thị. */
test('2.15.0 Gộp đơn thuốc lẻ cũ đã bỏ: không còn #mergeBtn/#mergeDlg/merge-old/merge-do/close-merge và không còn hàm gộp', () => {
  assert.doesNotMatch(PAGE, /id="merge|data-action="(merge-old|merge-do|close-merge)"|mergeDo|openMerge|mergeCandidates|updateMergeBtn|closeMerge/);
  const c = loadClient({ document: { readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(), querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, addEventListener() {}, removeEventListener() {} } });
  assert.equal(c.mergeDo, undefined);
});

test('2.15.0 dữ liệu cũ có oid/oname (đã gộp trước đây) vẫn qua sanitize và gom nhóm hiển thị với đúng tên đơn', () => {
  const raw = { products: [{ id: 'p1', name: 'A', stock: 5, costPrice: 1 }], prescriptions: [], updatedAt: 0, moneyUnit: 'dong',
    transactions: [
      { id: 'a', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 100, total: 100, cost: 1, oid: 'OD1', oname: 'Đơn thuốc lẻ' },
      { id: 'b', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 100, total: 100, cost: 1, oid: 'OD1', oname: 'Đơn thuốc lẻ' }
    ] };
  const out = app.sanitize(raw);
  assert.ok(out.transactions.every(t => t.oid === 'OD1' && t.oname === 'Đơn thuốc lẻ'), 'sanitize làm mất oid/oname');
  app.setDb(out);
  const rows = app.historyData('exp', null).rows;
  const g = rows.filter(r => r.group);
  assert.equal(g.length, 1, 'hai dòng cùng oid phải gom một đơn');
  assert.equal(g[0].oname, 'Đơn thuốc lẻ');
});

/* 2.15.1: ràng buộc CSS (số đo thật ở trình duyệt nằm trong báo cáo; ở đây giữ quy tắc). */
test('2.15.1 Thuốc chén điện thoại: ô chọn đơn không hẹp hơn chữ "Đơn mới" (min-width >= 90px), ô ngày 118px (đủ dd/mm/yyyy 16px) ở <=400px', () => {
  const m = PAGE.match(/#remedyBox \.card__bar-preset\{order:1;flex:1 1 (\d+)px;min-width:(\d+)px\}/);
  assert.ok(m, 'thiếu quy tắc ô chọn đơn điện thoại');
  assert.ok(Number(m[2]) >= 90, 'min-width ô chọn đơn phải >= 90px');
  assert.ok(Number(m[1]) >= Number(m[2]), 'flex-basis không nhỏ hơn min-width');
  assert.match(PAGE, /@media \(max-width:400px\)\{[^@]*#remedyBox \.card__bar-date\{flex:0 0 118px\}/);
});

test('2.15.1 chú giải tháng cùng một hàng: chart-tip là hàng (row, wrap), không còn cột; chip <=12px ở <=400px', () => {
  assert.match(PAGE, /\.chart-tip\{flex-direction:row;flex-wrap:wrap;align-items:center;gap:4px 12px\}/);
  assert.ok(!/\.chart-tip\{flex-direction:column/.test(PAGE), 'không còn xếp cột');
  assert.match(PAGE, /@media \(max-width:400px\)\{[^@]*\.chart-chip\{font-size:12px;gap:4px\}/);
});

test('2.15.1 fmtMoneyInt (chú giải tháng): cắt phần lẻ nghìn, không làm tròn; fmtMoney nơi khác vẫn giữ số lẻ', () => {
  assert.equal(app.fmtMoneyInt(123456789), '123.456');
  assert.equal(app.fmtMoneyInt(123456999), '123.456', 'cắt, không làm tròn lên');
  assert.equal(app.fmtMoneyInt(400), '0');
  assert.equal(app.fmtMoneyInt(999), '0');
  assert.equal(app.fmtMoneyInt(1000), '1');
  assert.equal(app.fmtMoneyInt(0), '0');
  assert.equal(app.fmtMoneyInt(-1500), '-1');
  assert.equal(app.fmtMoneyInt(-400), '0', 'không hiện -0');
  assert.equal(app.fmtMoneyInt(1234567000), '1.234.567');
  assert.equal(app.fmtMoney(123456789), '123.456,789', 'fmtMoney không đổi');
  assert.equal(app.fmtMoney(400), '0,4');
});

/* 2.15.2: cắt phần lẻ CHỈ trong Thống kê; mục khác giữ cách hiển thị cũ. */
test('2.15.2 ngoài Thống kê: fmtMoney/fmtQty/fmtUnitPrice vẫn hiện số lẻ như 2.15.1', () => {
  assert.equal(app.fmtMoney(400), '0,4');
  assert.equal(app.fmtMoney(123456789), '123.456,789');
  assert.equal(app.fmtMoney(15088170), '15.088,17');
  assert.equal(app.fmtMoney(-2500), '-2,5');
  assert.equal(app.fmtQty(1.5), '1,5 kg');
  assert.equal(app.fmtQty(0.25), '2,5 lạng');
  assert.equal(app.fmtQty(0.005), '5 g');
  assert.equal(app.fmtUnitPrice(42600), '42,6/kg');
});

test('2.15.2 fmtQtyInt (Thống kê): chọn đơn vị theo giá trị thật rồi cắt lẻ, không làm tròn, không -0', () => {
  assert.equal(app.fmtQtyInt(0), '0g');
  assert.equal(app.fmtQtyInt(1.5), '1 kg');
  assert.equal(app.fmtQtyInt(97.999), '97 kg');
  assert.equal(app.fmtQtyInt(123456.789), '123.456 kg');
  assert.equal(app.fmtQtyInt(0.3), '3 lạng');
  assert.equal(app.fmtQtyInt(0.25), '2 lạng');
  assert.equal(app.fmtQtyInt(0.0045), '4 g');
  assert.equal(app.fmtQtyInt(0.0004), '0 g');
  assert.equal(app.fmtQtyInt(-1.5), '-1 kg');
  assert.ok(!app.fmtQtyInt(-0.0004).includes('-'), 'không hiện -0');
});

test('2.15.2 renderStats: mọi số tiền và tồn kg trong Thống kê hiện số tròn; dữ liệu và tính toán không đổi', () => {
  const els = {};
  const mk = () => ({ textContent: '', className: '', hidden: false });
  for (const id of ['statImport', 'statExport', 'statExportDay', 'statExportYear', 'statProfit', 'statProfitDay', 'statProfitYear', 'statStock']) els['#' + id] = mk();
  const doc = { readyState: 'loading', querySelector(s) { return els[s] || null; }, querySelectorAll() { return []; }, getElementById() { return null; }, createElement() { return mk(); }, addEventListener() {}, body: mk(), documentElement: mk() };
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {} });
  const d = new Date();
  const iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  c.setDb({
    products: [{ id: 'p1', name: 'A', stock: 5.7, costPrice: 1000 }], prescriptions: [], updatedAt: 1, moneyUnit: 'dong',
    transactions: [
      { id: 'a', date: iso, type: 'NHAP', productId: 'p1', qty: 1, price: 123456789, total: 123456789 },
      { id: 'b', date: iso, type: 'BAN', productId: 'p1', qty: 1, price: 987654321, total: 987654321, cost: 400 }
    ]
  });
  c.renderStats();
  assert.equal(els['#statImport'].textContent, '123.456');
  assert.equal(els['#statExport'].textContent, '987.654');
  assert.equal(els['#statExportDay'].textContent, '987.654');
  assert.equal(els['#statExportYear'].textContent, '987.654');
  assert.ok(!/,/.test(els['#statProfit'].textContent + els['#statProfitDay'].textContent + els['#statProfitYear'].textContent + els['#statStock'].textContent), 'không còn dấu phẩy');
  assert.equal(els['#statStock'].textContent, '5 kg');
  assert.equal(c.fmtMoney(123456789), '123.456,789');
  assert.equal(c.kInput(123456789), '123456.789');
  assert.equal(c.kToDong(c.kInput(400)), 400);
  assert.equal(c.fmtKgExact(97.549), '97,549 kg', 'đối soát giữ số đầy đủ');
});

test('2.15.2 nguồn: chỉ renderStats và chú giải biểu đồ dùng hàm cắt; ô nhập/đối soát/xuất JSON không dùng', () => {
  const rs = PAGE.slice(PAGE.indexOf('function renderStats(){'), PAGE.indexOf('/* ================= PHÂN TRANG'));
  assert.ok(!/fmtMoney\(|fmtQty\(/.test(rs), 'renderStats không dùng hàm hiển thị đầy đủ');
  assert.ok(/fmtMoneyInt\(/.test(rs) && /fmtQtyInt\(/.test(rs));
  const rest = PAGE.replace(rs, '');
  const calls = (rest.match(/fmt(MoneyInt|QtyInt)\(/g) || []).length;
  assert.equal(calls, 2 + 2, 'ngoài renderStats: 2 định nghĩa + 2 lần ở chú giải biểu đồ (impTxt/expTxt)');
  assert.ok(!/\.value = [^;\n]*(fmtMoneyInt|fmtQtyInt|fmtMoney|fmtQty)\(/.test(PAGE), 'không đổ chuỗi hiển thị vào ô nhập');
  assert.ok(!/JSON\.stringify\([^)]*(fmtMoneyInt|fmtQtyInt)/.test(PAGE), 'xuất JSON không dùng hàm cắt');
  assert.ok(PAGE.includes("fmtKgExact(v){ return fmtNum(v) + ' kg'; }"), 'đối soát giữ đủ');
});

test('2.15.2 ô ngày Thuốc chén điện thoại: rộng 118px, đệm 6/24px (đủ dd/mm/yyyy cỡ 16px), thanh gọn đệm 10 khe 4', () => {
  assert.match(PAGE, /#remedyBox \.card__bar\{padding-left:10px;padding-right:10px;gap:4px\}/);
  assert.match(PAGE, /#remedyBox \.card__bar-date\{flex:0 0 118px\}/);
  assert.match(PAGE, /#remedyBox \.card__bar-date \.inp\{padding-left:6px;padding-right:24px\}/);
  assert.match(PAGE, /\.card__bar-date \.datefield__ico\{right:6px;width:16px;height:16px\}/);
});

/* 2.15.3: thanh chân tờ ghi fixed ở đáy màn hình; ẩn khi gõ/bàn phím/cuộn đi; focus về ô tìm sau "+". */
test('2.15.3 footBarShow: chỉ hiện khi điện thoại, thẻ mở, tờ ghi còn trong vùng nhìn, không gõ, không bàn phím', () => {
  const base = { mobile: true, open: true, editing: false, keyboard: false, height: 300, top: 100, bottom: 400, vh: 852 };
  assert.equal(app.footBarShow(base), true, 'tờ ghi ngắn vẫn hiện (thanh ở đáy màn hình)');
  assert.equal(app.footBarShow({ ...base, top: -2000, bottom: -50 }), false, 'cuộn đi hẳn lên trên thì ẩn');
  assert.equal(app.footBarShow({ ...base, top: 840, bottom: 1500 }), false, 'tờ ghi mới lấp ló ở đáy thì ẩn');
  assert.equal(app.footBarShow({ ...base, mobile: false }), false, 'máy tính không đổi');
  assert.equal(app.footBarShow({ ...base, open: false }), false);
  assert.equal(app.footBarShow({ ...base, editing: true }), false, 'đang focus ô nhập thì ẩn');
  assert.equal(app.footBarShow({ ...base, keyboard: true }), false, 'bàn phím hiện thì ẩn');
  assert.equal(app.footBarShow({ ...base, height: 0 }), false);
  assert.equal(app.footBarShow(null), false);
});

test('2.15.3 sau "+" focus quay về ô tìm (Thuốc chén và Bán lẻ); lỗi (thiếu số) thì ở ô số', () => {
  for (const kind of ['remedy', 'retail']) {
    let focused = '';
    const cls = kind === 'remedy' ? '.remedy-qty' : '.retail-qty';
    const qi = { value: '500', focus() { focused = 'qty'; }, select() {} };
    const mi = { value: '10', focus() { focused = 'money'; }, select() {} };
    const row = { getAttribute() { return 'p1'; }, querySelector(sel) { return sel === cls ? qi : (sel === '.retail-money' ? mi : null); } };
    const tb = { textContent: 'giu', querySelector(s) { return /data-pid/.test(s) ? row : null; }, appendChild() {}, children: [] };
    const els = {
      ['#' + kind + 'Body']: tb, ['#' + kind + 'Body tr[data-pid]']: row,
      ['#' + kind + 'Search']: { value: '', focus() { focused = 'search'; }, select() {}, setAttribute() {} },
      '#toast': makeEl(), '#toastMsg': makeEl()
    };
    const c = loadClient({ document: limitDoc(els) });
    c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1000, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
    (kind === 'remedy' ? c.addRemedyToNote : c.addRetailToNote)();
    assert.equal(focused, 'search', kind + ': focus phải về ô tìm sau "+"');
    qi.value = '0'; focused = '';
    (kind === 'remedy' ? c.addRemedyToNote : c.addRetailToNote)();
    assert.equal(focused, 'qty', kind + ': thiếu số thì ở ô số');
  }
});

test('2.15.3 nút "+" của dòng đang nhập có data-keep-focus (không làm ô số mất focus/bàn phím trước khi xử lý); CSS thanh fixed', () => {
  assert.ok(/data-action', 'note-add'\);\s+b\.setAttribute\('data-keep-focus', ''\)/.test(PAGE), 'nút + Bán lẻ có data-keep-focus');
  assert.ok(/data-action', 'rnote-add'\);\s+b\.setAttribute\('data-keep-focus', ''\)/.test(PAGE), 'nút + Thuốc chén có data-keep-focus');
  assert.ok(!/note__foot,#remedyNote \.note__foot\{position:sticky/.test(PAGE), 'không còn sticky');
  assert.ok(PAGE.includes('.foot-fixed.foot-off #retailNote .note__foot'), 'có quy tắc ẩn khi foot-off');
  assert.match(PAGE, /foot-fixed>\.card__body[^}]*padding-bottom:calc\(var\(--foot-h,72px\) \+ 8px\)/);
  assert.ok(PAGE.includes('bottom:0;z-index:20'), 'z-index thấp hơn .top, gợi ý');
  assert.ok(PAGE.includes('bottom:0;z-index:20'), 'z-index thấp hơn .top, gợi ý');
});

test('2.15.3 updateFootBars: thẻ mở trên điện thoại gắn foot-fixed; focus ô nhập trong thẻ thì thêm foot-off; blur thì bỏ; máy tính không gắn', () => {
  const mkBox = () => { const cl = new Set(); return { open: true, cl, classList: { toggle(n, on) { on ? cl.add(n) : cl.delete(n); }, remove(n) { cl.delete(n); }, add(n) { cl.add(n); } }, contains(x) { return x === this.input; }, style: { setProperty() {} }, input: null }; };
  const box = mkBox(), note = { getBoundingClientRect: () => ({ height: 300, top: 100, bottom: 400 }), querySelector: () => ({ offsetHeight: 70 }) };
  const els = { '#retailBox': box, '#retailNote': note };
  const doc = limitDoc(els);
  const input = { tagName: 'INPUT' }; box.input = input;
  const c = loadClient({ document: doc, matchMedia: () => ({ matches: true }), innerHeight: 852 });
  c.updateFootBars();
  assert.ok(box.cl.has('foot-fixed') && !box.cl.has('foot-off'), 'hiện thanh khi chưa gõ');
  doc.activeElement = input; c.updateFootBars();
  assert.ok(box.cl.has('foot-off'), 'focus ô nhập thì ẩn thanh');
  doc.activeElement = null; c.updateFootBars();
  assert.ok(!box.cl.has('foot-off'), 'blur thì hiện lại');
  const c2 = loadClient({ document: doc, matchMedia: () => ({ matches: false }), innerHeight: 852 });
  c2.updateFootBars();
  assert.ok(!box.cl.has('foot-fixed'), 'máy tính không gắn foot-fixed');
});

/* ===== 2.15.6 chế độ gọn khi nhập (điện thoại) ===== */
test('2.15.6 compactListHeight: tổng cao đúng 3 dòng cuối; <=3 dòng thì 0; bỏ dòng cao 0', () => {
  assert.equal(app.compactListHeight([50, 60, 70, 80, 90, 100], 3), 270);
  assert.equal(app.compactListHeight([50, 60, 70], 3), 0);
  assert.equal(app.compactListHeight([], 3), 0);
  assert.equal(app.compactListHeight([50, 0, 60, 70, 80, 90], 3), 240, 'dòng ẩn (cao 0) không tính');
  assert.equal(app.compactListHeight([40, 40, 40, 40, 40], 2), 80, 'đổi n');
  assert.equal(app.compactListHeight([40.2, 40, 40, 40.1], 3), Math.ceil(120.1));
  assert.equal(app.compactListHeight([10, 20, 30, 40]), 70, 'mặc định 2 dòng (COMPACT_ROWS)');
});
test('2.15.6 compactWanted: chỉ điện thoại và đang nhập', () => {
  assert.equal(app.compactWanted({ mobile: true, editing: true }), true);
  assert.equal(app.compactWanted({ mobile: true, editing: false }), false);
  assert.equal(app.compactWanted({ mobile: false, editing: true }), false);
  assert.equal(app.compactWanted(null), false);
});

function compactRig(nRows) {
  const timers = [];
  const cls = new Set();
  const heights = Array.from({ length: nRows }, (_, i) => 50 + i * 10);
  const rows = heights.map(h => ({ getBoundingClientRect() { return { height: h }; } }));
  const tb = { children: rows };
  const list = { style: { maxHeight: '' }, scrollTop: 0, scrollHeight: 999, querySelector: s => (s === 'tbody' ? tb : null) };
  const inBox = new Set();
  const box = { classList: { add: c => cls.add(c), remove: c => cls.delete(c), contains: c => cls.has(c) }, contains: e => inBox.has(e) };
  const dom = { '#retailBox': box, '#retailNoteList': list };
  const doc = limitDoc(dom); doc.documentElement = { style: { setProperty() {} } };
  const c = loadClient({ document: doc, matchMedia: () => ({ matches: true }), innerHeight: 852,
    setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length; }, clearTimeout(id) { if (timers[id - 1]) timers[id - 1].dead = true; } });
  const inp = { tagName: 'INPUT', type: 'text' }; inBox.add(inp);
  const date = { tagName: 'INPUT', type: 'date' }; inBox.add(date);
  return { c, doc, box, list, cls, timers, inp, date, heights };
}
test('2.15.6 gọn bật khi đang nhập trong thẻ: max-height = 2 dòng cuối, cuộn xuống cuối; ô ngày không bật', () => {
  const k = compactRig(9);
  k.doc.activeElement = k.date; k.c.compactSync(false);
  assert.equal(k.cls.has('kb-compact'), false, 'ô ngày không bật gọn');
  k.doc.activeElement = k.inp; k.c.compactSync(false);
  assert.equal(k.cls.has('kb-compact'), true);
  const h = k.heights.slice(-2).reduce((a, b) => a + b, 0);
  assert.equal(k.list.style.maxHeight, h + 'px');
  assert.equal(k.list.scrollTop, 999, 'cuộn tới cuối');
});
test('2.15.6 gọn tắt trễ 250ms khi blur; chuyển ô trong thẻ (focus lại) thì giữ; ít dòng thì không giới hạn', () => {
  const k = compactRig(9);
  k.doc.activeElement = k.inp; k.c.compactSync(false);
  k.doc.activeElement = null; k.c.compactSync(false);
  assert.equal(k.cls.has('kb-compact'), true, 'chưa tắt ngay');
  assert.equal(k.timers.at(-1).ms, 250);
  k.doc.activeElement = k.inp; k.c.compactSync(false);
  k.timers.forEach(t => { if (!t.dead) t.fn(); });
  assert.equal(k.cls.has('kb-compact'), true, 'focus lại trong thẻ: giữ gọn');
  k.doc.activeElement = null; k.c.compactSync(false);
  k.timers.forEach(t => { if (!t.dead) t.fn(); });
  assert.equal(k.cls.has('kb-compact'), false, 'blur hẳn: bỏ gọn');
  assert.equal(k.list.style.maxHeight, '', 'hiện đủ dòng');
  const few = compactRig(2);
  few.doc.activeElement = few.inp; few.c.compactSync(false);
  assert.equal(few.list.style.maxHeight, '', 'chỉ 2 dòng: không giới hạn');
});
test('2.15.6 thêm dòng bằng "+" (compactSync(true)) đo lại và cuộn cuối', () => {
  const k = compactRig(9);
  k.doc.activeElement = k.inp; k.c.compactSync(false);
  k.list.scrollTop = 0;
  k.c.compactSync(true);
  assert.equal(k.list.scrollTop, 999);
  assert.ok(/refocusSearch[\s\S]{0,400}compactSync\(true\)/.test(PAGE), 'refocusSearch phải gọi compactSync(true)');
  assert.match(PAGE, /var COMPACT_ROWS = 2;/);
});

/* ===== 2.15.10 khóa cuộn trang khi nhập (body fixed) ===== */
function lockRig(opts = {}) {
  const timers = [], docL = {}, winL = {}, vvL = {}, boxL = {}, mm = { v: true };
  const st = { abs: opts.abs ?? 700, y: opts.y ?? 500, to: [], focusArgs: [] };
  const vv = { height: 695, offsetTop: opts.vvTop || 0, offsetLeft: 0, addEventListener(t, fn) { (vvL[t] ||= []).push(fn); } };
  const mkCls = () => { const s = new Set(); return { s, add: c => s.add(c), remove: c => s.delete(c), contains: c => s.has(c), toggle() {} }; };
  const rows = [50, 60, 70, 80, 90, 100].map(h => ({ getBoundingClientRect() { return { height: h }; } }));
  const list = { style: { maxHeight: '' }, scrollTop: 0, scrollHeight: 999, querySelector: s => (s === 'tbody' ? { children: rows } : null), getBoundingClientRect() { return { top: st.abs - st.y + 101 }; } };
  const inBox = new Set(), bcls = mkCls();
  const box = { id: 'retailBox', classList: bcls, contains: e => inBox.has(e), getBoundingClientRect() { return { top: st.abs - st.y }; }, querySelector: sel => (sel === '.note__pending' && opts.pend > 0 ? { getBoundingClientRect() { return { height: opts.pend }; } } : null), addEventListener(t, fn) { (boxL[t] ||= []).push(fn); } };
  const input = { tagName: 'INPUT', type: 'text', closest: () => box, focus(o) { st.focusArgs.push(o); }, select() {}, setAttribute() {}, value: '' };
  inBox.add(input);
  const logoL = {}, logo = { addEventListener(t, fn) { (logoL[t] ||= []).push(fn); } };
  const els = { '#retailBox': box, '#retailNoteList': list, '#retailSearch': input, '#brandLogo': logo };
  const doc = limitDoc(els); doc.activeElement = input; doc.visibilityState = 'visible';
  doc.body = { style: {}, classList: mkCls(), children: [], appendChild() {} };
  doc.documentElement = { style: {}, classList: mkCls(), children: [], appendChild(ch) { this.children.push(ch); return ch; } };
  doc.addEventListener = (t, fn, o) => { (docL[t] ||= []).push({ fn, o }); };
  const c = loadClient({ ...(opts.nav ? { navigator: opts.nav } : {}), ...(opts.ls ? { localStorage: opts.ls } : {}), document: doc, innerHeight: 695, innerWidth: 393, get pageYOffset() { return st.y; }, visualViewport: vv,
    matchMedia: (q) => ({ matches: /display-mode/.test(q) ? !!opts.standalone : mm.v }), addEventListener(t, fn) { (winL[t] ||= []).push(fn); },
    scrollTo(x, y) { st.to.push(y); st.y = y; }, location: { search: opts.search || '', reload() { st.reloads = (st.reloads || 0) + 1; } },
    setTimeout(fn, ms) { timers.push({ fn, ms, dead: false }); return timers.length; }, clearTimeout(id) { if (timers[id - 1]) timers[id - 1].dead = true; } });
  const fire = () => { const t = timers.splice(0); t.forEach(x => { if (!x.dead) x.fn(); }); };
  const lock = () => { doc.activeElement = input; c.compactSync(false); };
  return { c, doc, box, list, input, st, vv, vvL, winL, boxL, docL, mm, timers, fire, lock, body: doc.body, html: doc.documentElement, els, bcls, logoL };
}

test('2.15.10 kbLockTop: top âm = vvTop - (đỉnh thẻ - 8); thẻ gần đỉnh trang thì 0; vvTop âm bỏ qua; không trả -0', () => {
  assert.equal(app.kbLockTop(700, 0), -692);
  assert.equal(app.kbLockTop(8, 0), 0);
  assert.equal(app.kbLockTop(5, 0), 0);
  assert.ok(Object.is(app.kbLockTop(8.4, 0), 0), 'không -0');
  assert.equal(app.kbLockTop(700, 120), 120 - 692, 'iOS pan 120: bù để thẻ vẫn cách đỉnh vùng THẤY 8px');
  assert.equal(app.kbLockTop(700, -5), -692);
  assert.equal(app.kbLockTop(700.6, 0), -693);
});

test('2.15.10 vào gọn lần đầu: body fixed, top = -(đỉnh thẻ tuyệt đối - 8), class kb-lock; các bước sau (SL, thành tiền, +) KHÔNG đổi top dù bố cục đổi', () => {
  const k = lockRig();
  k.lock();
  const b = k.body.style;
  assert.equal(b.position, 'fixed'); assert.equal(b.top, '-692px');
  assert.equal(b.left, '0'); assert.equal(b.right, '0'); assert.equal(b.width, '100%');
  assert.ok(k.body.classList.s.has('kb-lock') && k.html.classList.s.has('kb-lock'));
  for (let i = 0; i < 5; i++) { k.st.abs += 37; k.lock(); k.c.compactSync(true); k.c.kbLock(k.box); }
  assert.equal(b.top, '-692px', 'top bất biến qua mọi bước');
  assert.equal(k.st.to.length, 0, 'không cuộn trang trong luồng nhập');
  k.c.kbUnlock();
  assert.deepEqual(k.st.to, [500], 'gỡ: về đúng savedY lúc vào (gọi lặp không ghi đè)');
});

test('2.15.10 ngân sách chiều cao: compactAvail/compactFitHeight thuần (vv.height thật 357, không 459/379)', () => {
  assert.equal(app.compactAvail(357, 101, 0), 357 - 16 - 101, '2.15.18: dòng nhập trống (sau "+", đang gõ tên): KHÔNG chừa 104, tờ ghi giữ đủ 2 dòng');
  assert.ok(app.compactAvail(357, 101, 0) >= 2 * 41, '2.15.18: ví dụ iPhone: chỗ còn >= 2 dòng 41px khi ô tìm đang focus');
  assert.equal(app.compactAvail(357, 101, 60), 357 - 16 - 101 - 104, 'dòng nhập có thật nhưng thấp hơn 104: lấy ước lượng 104');
  assert.equal(app.compactAvail(357, 101, 130), 357 - 16 - 101 - 130, 'đo thật lớn hơn ước lượng: dùng đo thật');
  assert.ok(Number.isNaN(app.compactAvail(0, 101, 0)), 'vv không rõ: NaN');
  assert.equal(app.compactFitHeight([60, 70, 80, 90], 2, 200), 170, 'đủ chỗ: 2 dòng');
  assert.equal(app.compactFitHeight([60, 70, 80, 90], 2, 150), 90, 'không đủ 2: giảm còn 1 dòng');
  assert.equal(app.compactFitHeight([60, 70, 80, 90], 2, 80.7), 80, '1 dòng vẫn không vừa: cắt đúng chỗ còn');
  assert.equal(app.compactFitHeight([60, 70], 2, 200), 0, 'ít dòng và vừa: không giới hạn');
  assert.equal(app.compactFitHeight([60, 70], 2, 100), 70, 'ít dòng nhưng không vừa: còn 1 dòng');
  assert.equal(app.compactFitHeight([60, 70, 80, 90], 2, NaN), 170, 'avail không rõ: n dòng như cũ');
  assert.equal(app.compactFitHeight([40], 2, 50, 70), 50, 'ít dòng: cao tự nhiên 70 (gồm tiêu đề bảng) không vừa 50: cắt đúng chỗ còn');
  assert.equal(app.compactFitHeight([40], 2, 80, 70), 0, 'cao tự nhiên 70 vừa 80: không giới hạn');
});
test('2.15.10 compactFit theo vv thật: bàn phím mở (vv 357) rút danh sách còn 1 dòng, dòng nhập không vượt đáy vv - 8; vv resize đo lại', () => {
  const k = lockRig({ pend: 104 }); k.c.initFootBars();
  k.lock();
  assert.equal(k.list.style.maxHeight, '190px', 'chưa bàn phím (vv 695): 2 dòng cuối 90+100');
  k.vv.height = 357; k.vvL.resize.forEach(fn => fn());
  assert.equal(k.list.style.maxHeight, '100px', 'vv 357: avail 136 < 190 nên còn 1 dòng');
  assert.ok(8 + 101 + 100 + 104 <= 357 - 8, 'đáy dòng nhập <= vv.height - 8');
  k.vv.height = 695; k.vvL.resize.forEach(fn => fn());
  assert.equal(k.list.style.maxHeight, '190px', 'bàn phím hạ: lại 2 dòng');
  assert.equal(k.st.to.length, 0);
});

test('2.15.18 sau "+" / đang gõ tên (dòng nhập trống, cao 0): vv 357 vẫn giữ đủ 2 dòng; dòng nhập xuất hiện (104) thì rút còn 1; "+" xong lại 2', () => {
  const k = lockRig(); k.c.initFootBars();
  k.lock();
  k.vv.height = 357; k.vvL.resize.forEach(fn => fn());
  assert.equal(k.list.style.maxHeight, '190px', 'dòng nhập trống: 2 dòng cuối (90+100) vừa 357-16-101=240');
  const k2 = lockRig({ pend: 104 }); k2.c.initFootBars(); k2.lock();
  k2.vv.height = 357; k2.vvL.resize.forEach(fn => fn());
  assert.equal(k2.list.style.maxHeight, '100px', 'có dòng nhập 104: còn 1 dòng');
});

test('2.15.18 CSS: dòng nhập thẳng cột dòng ghi (cột STT 26 + đệm 5 + gap 10 = 41, STT giữa); khi gọn ẩn thead trong danh sách', () => {
  assert.ok(PAGE.includes('#retailNote .note__pending tr.is-row,#remedyNote .note__pending tr.is-row{grid-template-columns:26px minmax(0,1fr) minmax(0,1fr) 46px;padding:6px 5px}'));
  assert.ok(PAGE.includes('#remedyNote .note__pending tr.is-row>td:nth-child(1){text-align:center}'));
  assert.ok(/#remedyBox\.kb-compact #remedyNote:has\(#remedyBody tr\[data-pid\]\)>\.note__list>table>thead[^{]*\{display:none\}/.test(PAGE));
});

test('2.15.10 savedY là vị trí TRƯỚC focus: trình duyệt tự cuộn khi focus (500 -> 540) thì gỡ khóa vẫn về 500; scroll lúc khóa không ghi đè', () => {
  const k = lockRig(); k.c.initFootBars();
  k.st.y = 300; k.winL.scroll.forEach(fn => fn());
  k.st.y = 340; /* focus tự cuộn, sự kiện scroll chưa tới */
  k.lock();
  k.st.y = 0; k.winL.scroll.forEach(fn => fn()); k.docL.touchstart.forEach(l => l.fn()); /* đang khóa: scrollY=0 không được ghi */
  k.c.kbUnlock();
  assert.deepEqual(k.st.to, [300]);
  const m = lockRig(); m.c.initFootBars();
  m.st.y = 520; m.docL.touchstart.forEach(l => l.fn()); m.st.y = 560; m.lock(); m.c.kbUnlock();
  assert.deepEqual(m.st.to, [520], 'touchstart ghi mốc trước khi focus');
  const tr = n => (m.docL[n] || []).filter(l => l.fn.name === 'kbTrackY');
  assert.ok(tr('touchstart').length === 1 && tr('mousedown').length === 1 && [...tr('touchstart'), ...tr('mousedown')].every(l => l.o.passive === true && l.o.capture === true), 'passive + capture');
});

test('2.15.10 kbUnlock idempotent: sạch style/class, scrollTo đúng một lần; chưa khóa thì không cuộn; khóa lại được', () => {
  const k = lockRig();
  k.c.kbUnlock(); assert.equal(k.st.to.length, 0, 'chưa khóa: không scrollTo');
  k.lock();
  k.c.kbUnlock(); k.c.kbUnlock(); k.c.kbUnlock();
  assert.deepEqual(k.st.to, [500]);
  for (const p of ['position', 'top', 'left', 'right', 'width']) assert.equal(k.body.style[p], '', p + ' rỗng');
  assert.ok(!k.body.classList.s.has('kb-lock') && !k.html.classList.s.has('kb-lock'));
  k.lock(); assert.equal(k.body.style.position, 'fixed');
});

test('2.15.10 đường thoát: blur 250ms, lưới 400ms, đóng thẻ, pagehide, ẩn tab, xoay, về >640px đều gỡ khóa; resize cùng cỡ giữ khóa', () => {
  const unlockedBy = (name, act) => {
    const k = lockRig(); k.c.initFootBars(); k.lock();
    assert.equal(k.body.style.position, 'fixed', name + ': đã khóa');
    act(k);
    assert.equal(k.body.style.position, '', name + ': gỡ khóa');
    assert.deepEqual(k.st.to, [500], name + ': về savedY');
  };
  unlockedBy('blur', k => { k.doc.activeElement = null; k.c.compactSync(false); assert.ok(k.timers.some(t => t.ms === 250)); k.fire(); });
  unlockedBy('luoi400', k => { k.doc.activeElement = null; k.c.kbRelease(); assert.ok(k.timers.some(t => t.ms === 400)); k.fire(); });
  unlockedBy('dong-the', k => k.boxL.toggle.forEach(fn => fn()));
  unlockedBy('pagehide', k => k.winL.pagehide.forEach(fn => fn()));
  unlockedBy('an-tab', k => { k.doc.visibilityState = 'hidden'; k.docL.visibilitychange.forEach(l => l.fn()); });
  unlockedBy('xoay', k => k.winL.orientationchange.forEach(fn => fn()));
  unlockedBy('>640', k => { k.mm.v = false; k.winL.resize.forEach(fn => fn()); });
  const k = lockRig(); k.c.initFootBars(); k.lock();
  k.winL.resize.forEach(fn => fn());
  assert.equal(k.body.style.position, 'fixed', 'resize cùng cỡ (bàn phím Android) giữ khóa');
  k.doc.activeElement = k.input; k.c.kbRelease(); k.fire();
  assert.equal(k.body.style.position, 'fixed', 'còn ô nhập trong thẻ: lưới 400ms không gỡ');
});

test('2.15.10 khóa lại khi đã gọn nhưng khóa bị gỡ mà vẫn đang nhập (xoay màn hình)', () => {
  const k = lockRig(); k.c.initFootBars(); k.lock();
  k.winL.orientationchange.forEach(fn => fn());
  assert.equal(k.body.style.position, '');
  k.lock();
  assert.equal(k.body.style.position, 'fixed');
});

test('2.15.10 iOS pan: bù top theo visualViewport.offsetTop (khi vào và khi vv scroll/resize), không cuộn', () => {
  const k = lockRig({ vvTop: 120 }); k.c.initFootBars(); k.lock();
  assert.equal(k.body.style.top, (120 - 692) + 'px');
  k.vv.offsetTop = 0; k.vvL.scroll.forEach(fn => fn());
  assert.equal(k.body.style.top, '-692px');
  k.vv.offsetTop = 40; k.vvL.resize.forEach(fn => fn());
  assert.equal(k.body.style.top, (40 - 692) + 'px');
  assert.equal(k.st.to.length, 0);
  k.c.kbUnlock(); k.vv.offsetTop = 300; k.vvL.scroll.forEach(fn => fn());
  assert.equal(k.body.style.top, '', 'đã gỡ: vv đổi không đặt lại top');
});

test('2.15.10 sau "+" (refocusSearch): preventScroll, top bất biến, không cuộn trang', () => {
  const k = lockRig(); k.lock();
  k.st.abs += 50;
  k.c.refocusSearch('#retailSearch', 'retail');
  assert.ok(k.st.focusArgs.length >= 1 && k.st.focusArgs.every(a => a && a.preventScroll === true), 'focus preventScroll');
  assert.equal(k.body.style.top, '-692px');
  assert.equal(k.st.to.length, 0);
});

test('2.15.10 nguồn: không scrollBy/scrollIntoView; window.scrollTo chỉ trong kbUnlock; không mã định vị cũ; preventScroll còn', () => {
  const fnBody = (name) => { const i = PAGE.indexOf('function ' + name + '('); assert.ok(i >= 0, name); const j = PAGE.indexOf('\nfunction ', i + 10); return PAGE.slice(i, j); };
  assert.ok(!/scrollBy\(|scrollIntoView/.test(PAGE), 'không scrollBy/scrollIntoView');
  assert.equal([...PAGE.matchAll(/window\.scrollTo\(/g)].length, 1, 'đúng một window.scrollTo');
  assert.match(fnBody('kbUnlock'), /window\.scrollTo\(0, kbSavedY\)/);
  assert.ok(!/(^|[^.\w])scrollTo\(/.test(PAGE), 'không scrollTo trần');
  assert.ok(!/placeScrollDelta|kbSafeDelta|kbPadFixed|kbVisBottom|kbPlaceNow|kbOnFocus|kbUserStop|kbPlacedBox|kbSafeUsed|ENTRY_ROW_H|PLACE_GAP|KB_BAR|--kb-pad|kbMovedAt|kbSchedule|keepVisibleDelta|kbUserAt|searchScrollDelta|kbPadPx|keepPendingVisible/.test(PAGE), 'không còn mã định vị cũ');
  assert.match(PAGE, /doc\.addEventListener\('focusin', function\(\)\{ scheduleFootBars\(\); compactSync\(false\); \}\);/);
  for (const n of ['commitRetailRow', 'commitRemedyRow', 'addRetailToNote', 'addRemedyToNote', 'refocusSearch', 'pickSuggest']) {
    assert.ok(!/\.focus\(\)/.test(fnBody(n)), n + ' không được gọi .focus() trần');
  }
  assert.match(fnBody('focusNS'), /e\.focus\(\{ preventScroll: true \}\)/);
  assert.match(fnBody('refocusSearch'), /focusNS\(s\)/);
  assert.ok(!/kbLock|kbUnlock|scrollTo/.test(fnBody('refocusSearch')), 'refocusSearch không đụng khóa/cuộn');
  assert.match(PAGE, /body\{margin:0;[^}]*padding-bottom:48px;/);
  assert.match(PAGE, /html\.kb-lock,body\.kb-lock\{overflow-anchor:none;overscroll-behavior:none;transition:none!important\}/);
  const lk = fnBody('kbLock');
  assert.match(lk, /kbSavedY = kbLastY >= 0 \? kbLastY : y;/); assert.match(lk, /if \(kbLockBox \|\| /, 'idempotent');
  assert.match(fnBody('compactApply'), /kbUnlock\('tat-gon'\)/);
  assert.match(PAGE, /addEventListener\('pagehide'/); assert.match(PAGE, /addEventListener\('orientationchange'/);
  assert.match(PAGE, /visibilitychange/); assert.match(PAGE, /kbUnlock\('dong-the'\)/);
});

test('2.15.10 focusNS: truyền preventScroll; trình duyệt cũ ném lỗi thì focus thường', () => {
  const calls = [];
  app.focusNS({ focus(o) { calls.push(o); } });
  assert.equal(calls.length, 1); assert.equal(calls[0].preventScroll, true);
  let plain = 0;
  app.focusNS({ focus(o) { if (o) throw new Error('old'); plain++; } });
  assert.equal(plain, 1);
  app.focusNS(null);
});

test('2.15.10 ?kbdebug=1: dòng gỡ lỗi gắn vào <html>, có savedY/top/vvH/vvTop/ih/compact/lock và lý do; không bật thì không tạo DOM', () => {
  const k = lockRig({ search: '?kbdebug=1' });
  const made = [];
  k.doc.createElement = () => { const e = makeEl(); made.push(e); return e; };
  const q = k.doc.querySelector; k.doc.querySelector = (s) => (s === '#kbDbg' ? made[0] || null : q(s));
  k.c.initFootBars();
  assert.equal(made.length, 1); assert.equal(k.html.children[0], made[0], 'trong <html>');
  assert.equal(k.body.children.length, 0);
  assert.match(made[0].textContent, /savedY 0 top - vvH 695 vvTop 0 ih 695 compact 0 lock 0 \| mo-trang/);
  k.lock();
  assert.match(made[0].textContent, /savedY 500 top -692px vvH 695 vvTop 0 ih 695 compact 1 lock 1 \| khoa/);
  assert.match(made[0].style.cssText, /position:fixed/);
  k.c.kbUnlock('blur');
  assert.match(made[0].textContent, /lock 0 \| go: blur/);
  const off = lockRig(); off.c.initFootBars();
  assert.equal(off.html.children.length, 0, 'không bật thì không tạo');
});

/* ===== 2.15.11 .top ẩn khi khóa; chặn pan iOS khi chạm ô; không hoạt ảnh bù; gỡ lỗi 3 sự kiện ===== */
function touchRig(k) {
  const other = { tagName: 'INPUT', type: 'text', closest: () => k.box, focus(o) { k.st.focusArgs.push(o); }, select() {}, setAttribute() {}, value: '' };
  const mk = (t) => { const e = { target: t, cancelable: true, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } }; return e; };
  return { other, mk };
}
test('2.15.11 CSS: .top ẩn bằng visibility khi html.kb-lock (không display:none), body/kb-lock không transition', () => {
  assert.match(PAGE, /html\.kb-lock \.top\{visibility:hidden\}/);
  assert.ok(!/html\.kb-lock \.top\{[^}]*display:none/.test(PAGE), 'giữ layout');
  const rule = PAGE.match(/html\.kb-lock,body\.kb-lock\{[^}]*\}/)[0];
  assert.match(rule, /transition:none!important/);
  assert.ok(!/(^|\n)(html|body)\{[^}]*transition/.test(PAGE), 'html/body không transition');
});
test('2.15.11 touchstart vào ô KHÁC trong thẻ đang khóa: preventDefault + focus({preventScroll:true}); ô đang focus/ngoài thẻ/chưa khóa: không chặn', () => {
  const k = lockRig(); k.c.initFootBars(); k.lock();
  const { other, mk } = touchRig(k);
  const handlers = k.docL.touchstart.filter(l => l.fn.name === 'kbTouch');
  assert.equal(handlers.length, 1); assert.ok(handlers[0].o.passive === false && handlers[0].o.capture === true);
  const fire = (e) => handlers[0].fn(e);
  k.st.focusArgs.length = 0;
  const e1 = mk(other); fire(e1);
  assert.equal(e1.defaultPrevented, true);
  assert.ok(k.st.focusArgs.length === 1 && k.st.focusArgs[0].preventScroll === true);
  const e2 = mk(k.input); fire(e2); assert.equal(e2.defaultPrevented, false, 'ô đang focus: để đặt con trỏ');
  const outside = { tagName: 'INPUT', type: 'text', closest: () => null };
  const e3 = mk(outside); fire(e3); assert.equal(e3.defaultPrevented, false, 'ngoài thẻ');
  const e4 = mk(other); e4.cancelable = false; fire(e4); assert.equal(e4.defaultPrevented, false, 'không hủy được thì thôi');
  fire(undefined);
  const u = lockRig(); u.c.initFootBars();
  const { other: o2, mk: mk2 } = touchRig(u);
  const e5 = mk2(o2); u.docL.touchstart.filter(l => l.fn.name === 'kbTouch')[0].fn(e5);
  assert.equal(e5.defaultPrevented, false, 'chưa khóa: không chặn');
});
test('2.15.11 bù vvTop đồng bộ trong sự kiện vv: thẻ cách đỉnh vùng THẤY luôn 8px ở mọi bước, không dùng rAF/setTimeout', () => {
  const k = lockRig(); k.c.initFootBars(); k.lock();
  for (const v of [0, 40, 134, 134, 0, 200, 0]) {
    k.vv.offsetTop = v; k.vvL.scroll.forEach(fn => fn());
    const rectTop = (k.st.abs - k.st.y) + parseFloat(k.body.style.top) + k.st.y; /* thẻ trong layout viewport sau khi top body đổi */
    assert.equal(rectTop - v, 8, 'vvTop ' + v);
  }
  const fb = (n) => { const i = PAGE.indexOf('function ' + n + '('); return PAGE.slice(i, PAGE.indexOf('\nfunction ', i + 10)); };
  assert.ok(!/requestAnimationFrame|setTimeout/.test(fb('onVvChange') + fb('kbLockApply') + fb('kbTouch')), 'bù đồng bộ');
});
test('2.15.11 ?kbdebug=1: dòng 2 ghi 3 sự kiện vv gần nhất (nguồn pointerdown/focusin/next/vv) và cờ preventScroll-chạm', () => {
  const k = lockRig({ search: '?kbdebug=1' });
  const made = [];
  k.doc.createElement = () => { const e = makeEl(); made.push(e); return e; };
  const q = k.doc.querySelector; k.doc.querySelector = (s) => (s === '#kbDbg' ? made[0] || null : q(s));
  k.c.initFootBars(); k.lock();
  const line2 = () => made[0].textContent.split('\n')[1];
  assert.match(line2(), /preventScroll-chạm: không/);
  const { other, mk } = touchRig(k);
  k.docL.touchstart.filter(l => l.fn.name === 'kbTouch')[0].fn(mk(other));
  assert.match(line2(), /pointerdown\)/); assert.match(line2(), /preventScroll-chạm: có/);
  k.docL.focusin.map(l => l.fn).forEach(fn => fn());
  assert.match(line2(), /focusin\)/);
  k.vv.offsetTop = 134; k.vvL.scroll.forEach(fn => fn());
  assert.match(line2(), /vvTop 0→134 \(\+\d+ms, vv\)/);
  for (let i = 0; i < 3; i++) { k.vv.offsetTop = 10 * (i + 1); k.vvL.scroll.forEach(fn => fn()); }
  assert.equal(line2().split('  ').length, 3, 'chỉ giữ 3 sự kiện');
  const n = lockRig({ search: '?kbdebug=1' }); const nm = [];
  n.doc.createElement = () => { const e = makeEl(); nm.push(e); return e; };
  const nq = n.doc.querySelector; n.doc.querySelector = (s) => (s === '#kbDbg' ? nm[0] || null : nq(s));
  n.c.initFootBars(); n.docL.focusin.map(l => l.fn).forEach(fn => fn());
  assert.match(nm[0].textContent.split('\n')[1], /next\)/, 'focus không do chạm = Trước/Sau');
});
test('2.15.11 không bật kbdebug: chạm/vv không tạo DOM hay ghi sự kiện', () => {
  const k = lockRig(); k.c.initFootBars(); k.lock();
  const { other, mk } = touchRig(k);
  k.docL.touchstart.filter(l => l.fn.name === 'kbTouch')[0].fn(mk(other));
  k.vv.offsetTop = 50; k.vvL.scroll.forEach(fn => fn());
  assert.equal(k.html.children.length, 0);
});
test('2.17.8 standalone (matchMedia hoặc navigator.standalone): touchstart sang ô khác KHÔNG preventDefault/focus; Safari giữ nguyên', () => {
  for (const o of [{ standalone: true }, { nav: { standalone: true } }, { standalone: false }]) {
    const k = lockRig(o); k.c.initFootBars(); k.lock();
    const { other, mk } = touchRig(k); k.st.focusArgs.length = 0;
    const e = mk(other); k.docL.touchstart.filter(l => l.fn.name === 'kbTouch')[0].fn(e);
    const sa = !!(o.standalone || o.nav);
    assert.equal(e.defaultPrevented, !sa, JSON.stringify(o));
    assert.equal(k.st.focusArgs.length, sa ? 0 : 1);
  }
});
test('2.17.8 kbdebug đọc từ localStorage; chạm 5 lần logo trong 3 giây đảo cờ và tải lại', () => {
  const store = new Map(), ls = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const off = lockRig({ ls }); off.c.initFootBars(); assert.equal(off.html.children.length, 0, 'chưa có cờ: không gỡ lỗi');
  const real = Date.now; let now = 1e12; Date.now = () => now;
  try {
    const k = lockRig({ ls }); k.c.initFootBars();
    const click = k.logoL.click[0];
    for (let i = 0; i < 4; i++) { click(); now += 500; }
    assert.equal(store.get('kbdebug'), undefined); assert.equal(k.st.reloads || 0, 0, '4 chạm chưa đủ');
    click(); assert.equal(store.get('kbdebug'), '1'); assert.equal(k.st.reloads, 1);
    const on = lockRig({ ls }); on.c.initFootBars(); assert.ok(on.html.children.length > 0, 'cờ localStorage bật dòng gỡ lỗi');
    const c2 = on.logoL.click[0];
    for (let i = 0; i < 5; i++) { c2(); now += 4000; } assert.equal(store.get('kbdebug'), '1', 'chạm cách >3 giây không đủ 5');
    for (let i = 0; i < 5; i++) { c2(); now += 100; } assert.equal(store.has('kbdebug'), false, 'đủ 5 chạm: xóa cờ'); assert.equal(on.st.reloads, 1);
    const bad = { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() {} };
    const b = lockRig({ ls: bad }); b.c.initFootBars(); for (let i = 0; i < 5; i++) b.logoL.click[0]();
  } finally { Date.now = real; }
});

/* ===== 2.15.9 gợi ý tên: gõ trọn một từ (mọi thiết bị), khung tối đa 3 mục ===== */
test('2.15.9 wholeWordMatch: bốn ví dụ người dùng + tiền tố không hiện', () => {
  const w = app.wholeWordMatch;
  assert.equal(w('Cam Thảo', 'cam'), true);
  assert.equal(w('Đỗ Trọng', 'do'), true);
  assert.equal(w('Ích Trí Nhân', 'tri'), true, 'từ giữa');
  assert.equal(w('Kê Huyết Đằng', 'dang'), true, 'từ cuối');
  assert.equal(w('Cam Thảo', 'ca'), false, 'ca chưa trọn từ');
  assert.equal(w('Đỗ Trọng', 'd'), false);
  assert.equal(w('Ích Trí Nhân', 'tr'), false);
});
test('2.15.9 wholeWordMatch: dấu/đ/hoa-thường, nhiều từ liên tiếp, rỗng, thứ tự', () => {
  const w = app.wholeWordMatch;
  assert.equal(w('Cam Thảo', 'CAM THAO'), true);
  assert.equal(w('Cam Thảo', 'cam thao'), true);
  assert.equal(w('Cam Thảo', 'cam th'), false, 'th chưa trọn từ');
  assert.equal(w('Cam Thảo', 'thao cam'), false, 'sai thứ tự');
  assert.equal(w('Kê Huyết Đằng', 'huyet dang'), true, 'liên tiếp giữa-cuối');
  assert.equal(w('Kê Huyết Đằng', 'ke dang'), false, 'không liên tiếp');
  assert.equal(w('Đỗ Trọng', 'ĐỖ'), true, 'Đ hoa + dấu');
  assert.equal(w('Đỗ Trọng', 'đo'), true);
  assert.equal(w('Cam Thảo', ''), false);
  assert.equal(w('Cam Thảo', '   '), false);
  assert.equal(w('Cam', 'cam thao'), false, 'chữ gõ dài hơn tên');
  assert.equal(w('Cam  Thảo', 'cam'), true, 'nhiều khoảng trắng');
});
test('2.15.9 hộp gợi ý Bán lẻ/Thuốc chén/Nhập hàng dùng luật trọn từ ở MỌI cỡ màn hình; ô lọc Kho tồn/Lịch sử đổi sang cùng luật từ 2.27.0', () => {
  for (const mobile of [true, false]) {
    const c = loadClient({ matchMedia: () => ({ matches: mobile }) });
    c.setDb({ products: [{ id: '1', name: 'Cam Thảo' }, { id: '2', name: 'Đỗ Trọng' }, { id: '3', name: 'Ích Trí Nhân' }, { id: '4', name: 'Kê Huyết Đằng' }, { id: '5', name: 'Camphor' }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
    for (const key of ['retail', 'remedy', 'nhap']) {
      assert.equal(c.sugWhole(key), true, key + ' mobile=' + mobile);
      const ids = (q) => c.matchProducts(q, c.sugWhole(key)).map(p => p.id);
      assert.deepEqual(ids('cam'), ['1'], 'cam -> Cam Thảo (không Camphor)');
      assert.deepEqual(ids('do'), ['2']);
      assert.deepEqual(ids('tri'), ['3']);
      assert.deepEqual(ids('dang'), ['4']);
      assert.deepEqual(ids('ca'), [], 'ca không hiện');
      assert.equal(ids('').length, 5, 'rỗng: như cũ');
    }
    for (const key of ['inv', 'imph']) {
      assert.equal(c.sugWhole(key), false, 'sugWhole chỉ còn quyết định bố cục (2.27.0)');
      assert.deepEqual(c.matchProducts('ca', c.sugWhole(key)).map(p => p.id), [], '2.27.0: gợi ý Kho tồn/Lịch sử cũng trọn chữ');
    }
  }
  assert.ok(!/function sugWhole\(key\)\{[^}]*kbMobile/.test(PAGE), 'sugWhole không phụ thuộc cỡ màn hình');
});
test('2.15.9 sugListMaxHeight: cao đúng 3 mục + đệm; <=3 mục thì không giới hạn; áp dụng mọi cỡ màn hình', () => {
  assert.equal(app.sugListMaxHeight([37, 37, 37, 37, 37], 3, 10), 121);
  assert.equal(app.sugListMaxHeight([37.5, 37.5, 40, 50], 3, 10), 125);
  assert.equal(app.sugListMaxHeight([37, 37, 37], 3, 10), 0);
  assert.equal(app.sugListMaxHeight([], 3, 10), 0);
  assert.equal(app.sugListMaxHeight([0, 40, 40, 40, 40], 3, 0), 120, 'bỏ chiều cao 0');
  const body = PAGE.slice(PAGE.indexOf('function openSuggest('), PAGE.indexOf('function dupOrderRow'));
  assert.match(body, /sugListMaxHeight\(hs, SUG_ROWS, 10\)/);
  assert.match(body, /if \(sugWhole\(key\)( && !isDesk\(\))?\)/);
  assert.match(body, /list\.style\.maxHeight = mh \? mh \+ 'px' : '';/, 'áp max-height 3 mục vào khung');
  assert.ok(!/kbMobile/.test(body), 'không riêng điện thoại');
  assert.match(PAGE, /var SUG_ROWS = 3;/);
});
test('2.15.9 sugReveal cuộn mục vào tầm nhìn trong khung gợi ý', () => {
  const list = { scrollTop: 0, clientHeight: 111 };
  app.sugReveal(list, { offsetTop: 148, offsetHeight: 37 });
  assert.equal(list.scrollTop, 74, 'mục dưới: đáy khớp');
  app.sugReveal(list, { offsetTop: 0, offsetHeight: 37 });
  assert.equal(list.scrollTop, 0, 'mục trên: đỉnh khớp');
  app.sugReveal(list, { offsetTop: 10, offsetHeight: 37 });
  assert.equal(list.scrollTop, 0, 'đã trong tầm nhìn');
});

function smoothRig(reduce) {
  const k = compactRig(9);
  const calls = [];
  k.list.scrollTo = (o) => { calls.push(o); };
  const c = loadClient({ document: k.doc, matchMedia: (q) => ({ matches: /reduced-motion/.test(q) ? !!reduce : true }), innerHeight: 852,
    setTimeout() { return 0; }, clearTimeout() {} });
  return { k, c, calls };
}
test('2.15.8 guồng nước: vào gọn lần đầu nhảy thẳng; "+" khi đã gọn cuộn mượt xuống cuối; reduced-motion thì auto', () => {
  const { k, c, calls } = smoothRig(false);
  k.doc.activeElement = k.inp; c.compactSync(false);
  assert.equal(calls.length, 0, 'lần đầu không animation');
  assert.equal(k.list.scrollTop, 999);
  c.compactSync(true);
  assert.equal(calls.length, 1); assert.equal(calls[0].top, 999); assert.equal(calls[0].behavior, 'smooth');
  const r = smoothRig(true);
  r.k.doc.activeElement = r.k.inp; r.c.compactSync(false); r.c.compactSync(true);
  assert.equal(r.calls.length, 1); assert.equal(r.calls[0].behavior, 'auto', 'prefers-reduced-motion: auto');
  assert.ok(PAGE.includes('list.scrollTop = list.scrollHeight; }, 450);'), 'lưới an toàn 450ms');
});
test('2.15.8 CSS: mặt nạ mờ mép trên chỉ khi .kb-compact', () => {
  assert.match(PAGE, /\.kb-compact \.note__list\{overflow-y:auto;-webkit-mask-image:linear-gradient\(to bottom,transparent 0,black 12px\);mask-image:linear-gradient\(to bottom,transparent 0,black 12px\)\}/);
});

test('2.15.8 tab máy tính có icon: 8 nút mỗi nút 1 svg aria-hidden trỏ tới symbol có thật, cùng icon tiêu đề thẻ; điện thoại ẩn icon; id/data-tab giữ nguyên', () => {
  const nav = PAGE.match(/<nav class="tabs"[\s\S]*?<\/nav>/)[0];
  const btns = [...nav.matchAll(/<button [^>]*>[\s\S]*?<\/button>/g)].map(m => m[0]);
  assert.equal(btns.length, 8);
  const want = { retailBox: 'receipt', remedyBox: 'mortar', nhapBox: 'cart', invBox: 'warehouse', impBox: 'inbox', expBox: 'outbox', chartBox: 'chart-col', backupBox: 'drive' };
  for (const b of btns) {
    const id = b.match(/data-tab="(\w+)"/)[1];
    assert.equal((b.match(/<svg /g) || []).length, 1, id + ': đúng 1 icon');
    /* 2.15.13: mọi icon tab cùng một class/biến màu (không còn txt-*) */
    assert.match(b, /<svg class="ico tab__ic" aria-hidden="true"><use href="#i-([\w-]+)"\/><\/svg>/, id + ': icon tab không mang class màu riêng');
    const sym = b.match(/<use href="#(i-[\w-]+)"/)[1];
    assert.equal(sym, 'i-' + want[id], id + ': icon theo tiêu đề thẻ');
    assert.ok(PAGE.includes('<symbol id="' + sym + '"'), id + ': symbol ' + sym + ' phải tồn tại');
    assert.match(b, /role="tab"/); assert.match(b, /aria-selected="false"/);
  }
  assert.match(PAGE, /\.tab__ic\{color:var\(--tab-ico\);/, 'mọi icon tab dùng một biến màu --tab-ico');
  assert.equal((PAGE.match(/--tab-ico:#/g) || []).length, 1, '--tab-ico khai báo đúng 1 lần (2.17.0: một theme sáng)');
  assert.equal(PAGE.match(/--tab-ico:(#\w+)/)[1], PAGE.match(/:root\{[\s\S]*?--green-text:(#\w+)/)[1], 'sáng: --tab-ico = màu icon Bán lẻ');
  assert.match(PAGE, /\.tab\.is-active \.tab__ic\{background:var\(--brand-soft\);box-shadow:0 0 0 3px var\(--brand-soft\)\}/, 'tab đang chọn: icon xanh trên chip --brand-soft');
  assert.match(PAGE, /\.tab__ic\{display:none\}[\s\S]*?@media \(min-width:641px\)\{[\s\S]*?\.tab__ic\{display:block/, 'icon ẩn mặc định (<=640px), chỉ hiện từ 641px');
});

test('2.15.19 pushState 5xx và lỗi mạng KHÔNG hiện toast "Chưa lưu được:" (chỉ huy hiệu); trả false, không phải "bị từ chối"', async () => {
  const run = async (kind) => {
    const { doc } = toastDoc(false);
    const writes = [];
    const mEl = doc.querySelector('#toastMsg');
    Object.defineProperty(mEl, 'textContent', { get() { return writes[writes.length - 1] || ''; }, set(v) { writes.push(v); } });
    const fetchStub = kind === 'net'
      ? async () => { throw new TypeError('Failed to fetch'); }
      : async () => ({ status: kind, json: async () => ({ success: false, error: 'Lỗi máy chủ ' + kind }) });
    const client = loadClient({ document: doc, fetch: fetchStub, setTimeout() { return 0; }, clearTimeout() {} });
    client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
    client.setBase(1);
    const ok = await client.pushState(false, false);
    return { ok, writes, rejected: client.isSyncRejected(), failShown: client.isSyncErrorShown() };
  };
  for (const kind of [500, 502, 503, 'net']) {
    const r = await run(kind);
    assert.equal(r.ok, false, String(kind));
    assert.equal(r.writes.filter(t => /Chưa lưu được:/.test(t)).length, 0, 'không toast kiểu từ chối cho ' + kind);
    assert.equal(r.rejected, false, 'không phải bị máy chủ từ chối: ' + kind);
  }
  // đối chứng: 400 vẫn toast đúng một lần
  const r400 = await run(400);
  assert.equal(r400.writes.filter(t => /Chưa lưu được:/.test(t)).length, 1);
});
test('2.15.19 savePreset: đơn mới trùng tên (khác hoa/thường), bấm Hủy ở confirm → không đổi gì: không đơn thứ hai, không commit/toast, không dirty, không chọn đơn, tên và nội dung đơn cũ nguyên', () => {
  for (const typed of ['đơn cũ', 'ĐƠN CŨ', '  đƠn   cŨ  ']) {
    const r = runSave({ name: typed, ok: false });
    assert.equal(r.st.confirms.length, 1);
    assert.equal(r.rx.length, 1, 'không tạo đơn thứ hai');
    assert.equal(r.rx[0].id, 'RX1'); assert.equal(r.rx[0].name, 'Đơn Cũ'); assert.equal(r.rx[0].items[0].grams, 1);
    assert.equal(r.rx[0].updatedAt, undefined, 'đơn cũ không bị đóng dấu cập nhật');
    assert.equal(r.c.getDb().updatedAt, 1, 'không commit');
    assert.equal(r.c.isDirty(), false, 'không đánh dấu chưa lưu');
    assert.equal(r.els['#remedyPreset'].value, '', 'không tự chọn đơn');
    assert.ok(!r.els['#toastMsg'].textContent, 'không toast');
  }
});

/* ------------------------------------------------------------------ */
/* 2.15.20: BUG-01 delOrder cộng dồn, BUG-02 openOrder, BUG-03 saveLocal */
/* ------------------------------------------------------------------ */

test('2.15.20 delOrder: đơn NHAP hai dòng cùng sản phẩm cộng dồn khi kiểm tồn âm', () => {
  const mk = stock => {
    const dom = limitStock();
    const txs = [
      { id: 'n1', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 8, price: 1000, total: 8000, ts: 1, oid: 'IM1' },
      { id: 'n2', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 8, price: 1000, total: 8000, ts: 2, oid: 'IM1' }
    ];
    return limitClient(dom, [{ id: 'p1', name: 'A', stock, costPrice: 1000 }], txs);
  };
  const a = mk(10);
  a.delOrder('IM1');
  assert.equal(a.getDb().products[0].stock, 10, 'tồn 10 < 16: không được xóa');
  assert.equal(a.getDb().transactions.length, 2, 'đơn vẫn còn');
  const b = mk(16);
  b.delOrder('IM1');
  assert.equal(b.getDb().products[0].stock, 0);
  assert.equal(b.getDb().transactions.length, 0);
});

test('2.15.20 openOrder: oid không còn giao dịch thì không mở hộp, không đổi orderCur', () => {
  const dom = limitStock();
  dom.set('orderDlg', '');
  let opened = 0;
  const d = dom.document.querySelector('#orderDlg');
  d.showModal = () => { opened++; };
  const c = limitClient(dom, [], [{ id: 'n1', type: 'NHAP', productId: 'p1', qty: 1, oid: 'IM1', ts: 1, date: '2026-11-01' }]);
  c.setOrderCur(null);
  c.openOrder('KHONG_CO');
  assert.equal(opened, 0);
  assert.equal(c.getOrderCur(), null);
  assert.match(toastText(dom), /Đơn không còn tồn tại/);
});

function saveLocalRun(failKey, dirty){
  const writes = [];
  const localStorage = {
    getItem() { return null; },
    setItem(k, v) {
      if (failKey && writes.length === 0 && !writes.failed) { writes.failed = true; const e = new Error('full'); e.name = 'QuotaExceededError'; throw e; }
      writes.push([k, String(v)]);
    },
    removeItem() {}, clear() {}
  };
  const client = loadClient({ localStorage });
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setDirty(dirty);
  client.setBase(77);
  client.saveLocal();
  return { writes, client };
}

test('2.15.20 saveLocal: KEY lỗi + dirty → DIRTY=1, KHÔNG ghi BASE (giữ base cũ)', () => {
  const { writes, client } = saveLocalRun(true, true);
  assert.equal(writes.length, 1, 'chỉ ghi DIRTY_KEY');
  assert.equal(writes[0][1], '1');
  assert.ok(!writes.some(w => w[1] === '77'), 'không được ghi base mới');
  assert.match(client.getQuotaNote(), /Bộ nhớ trình duyệt đầy/);
});

test('2.15.20 saveLocal: KEY lỗi + dirty=false → không ghi DIRTY/BASE', () => {
  const { writes } = saveLocalRun(true, false);
  assert.equal(writes.length, 0);
});

test('2.15.20 saveLocal: KEY ok → ghi cả DIRTY và BASE', () => {
  const { writes } = saveLocalRun(false, true);
  assert.equal(writes.length, 3);
  assert.equal(writes[1][1], '1');
  assert.equal(writes[2][1], '77');
});

/* ===== 2.15.21 (vòng 18, nhóm A) ===== */
test('2.15.21 A1 scheduleSyncRetry: đang bận nhập thì KHÔNG nhân đôi bước chờ; gửi thật mới nhân đôi', async () => {
  const dom = limitStock();
  const timers = [];
  const c = loadClient({
    document: dom.document,
    setTimeout: (fn) => { timers.push(fn); return timers.length; }, clearTimeout() {},
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) })
  });
  c.setDb(A_DB([{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }]));
  c.setBase(1); c.setDirty(true);
  const d0 = c.getSyncRetryDelay();
  dom.document.activeElement = { tagName: 'INPUT' };
  c.scheduleSyncRetry();
  timers[0]();
  assert.equal(c.getSyncRetryDelay(), d0, 'bận nhập: chưa thử gửi nên không giãn');
  dom.document.activeElement = null;
  timers[1]();
  assert.equal(c.getSyncRetryDelay(), d0 * 2, 'gửi thật: nhân đôi');
});

test('2.15.21 A2 delOrder: đơn nhập làm tồn âm báo lỗi trước, KHÔNG hỏi confirm; hợp lệ thì hỏi 1 lần', () => {
  const dom = limitStock();
  let asked = 0;
  const c = loadClient({ document: dom.document, confirm: () => { asked++; return false; },
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) }) });
  const nhap = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 5, price: 1000, total: 5000, ts: 2000, oid: 'OD1' };
  c.setDb(A_DB([{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1000 }], [nhap]));
  c.setBase(1);
  c.delOrder('OD1');
  assert.equal(asked, 0, 'tồn âm: không hỏi');
  assert.match(toastText(dom), /Không thể xóa/);
  c.getDb().products[0].stock = 5;
  c.delOrder('OD1');
  assert.equal(asked, 1, 'hợp lệ: hỏi đúng 1 lần');
});

test('2.15.21 A3 saveTxEdit: lỗi số lượng focus ô SL, lỗi giá focus ô giá', () => {
  const dom = limitStock();
  const tx = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }], [tx]);
  c.openTxEdit('n1');
  const q = dom.document.querySelector('#txEditQty'), p = dom.document.querySelector('#txEditPrice');
  let f = '';
  q.focus = () => { f = 'qty'; }; p.focus = () => { f = 'price'; };
  dom.set('txEditQty', '10000000'); dom.set('txEditPrice', '200');
  c.saveTxEdit();
  assert.equal(f, 'qty');
  f = '';
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '10000000000');
  c.saveTxEdit();
  assert.equal(f, 'price');
});

test('2.15.21 A4 historyData: đơn ghi lùi ngày xếp theo ngày; "gần nhất" = hàng đầu bảng', () => {
  const c = loadClient({ Date: fakeClock(2026, 10, 13, 12), setTimeout() { return 0; }, clearTimeout() {} });
  c.setDb(A_DB([{ id: 'p1', name: 'A', stock: 5, costPrice: 1 }], [
    { id: 'x', date: '2026-11-10', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 1, ts: 2000 },
    { id: 'y', date: '2026-11-11', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 1, ts: 1000 }
  ]));
  const d = c.historyData('exp', null);
  assert.equal(d.rows[0].tx.id, 'y');
  assert.equal(d.rows[1].tx.id, 'x');
  assert.equal(d.latestDate, '2026-11-11');
  assert.equal(d.latestTs, 1000);
});

test('2.15.21 A5 latestImportMap: nhập ghi lùi ngày không thắng nhập ngày mới hơn (khớp lastImport)', () => {
  const c = loadClient({ Date: fakeClock(2026, 10, 13, 12), setTimeout() { return 0; }, clearTimeout() {} });
  c.setDb(A_DB([{ id: 'p1', name: 'A', stock: 5, costPrice: 1 }], [
    { id: 'a', date: '2026-11-10', type: 'NHAP', productId: 'p1', qty: 1, price: 120000, total: 120000, ts: 2000 },
    { id: 'b', date: '2026-11-11', type: 'NHAP', productId: 'p1', qty: 1, price: 135000, total: 135000, ts: 1000 }
  ]));
  assert.equal(c.latestImportMap()['p1'], 135000);
});

/* ===== 2.15.21 B8: hai khối kiểm âm đã xóa (checkLimits chặn trước) ===== */
test('2.15.21 B8 commitRetailRow: thành tiền âm bị chặn, thông báo "Tiền không được âm", con trỏ ở ô thành tiền', () => {
  const qEl = { value: '1' }, mEl = { value: '-5' };
  const row = { getAttribute() { return 'p1'; }, querySelector(sel) { return sel === '.retail-qty' ? qEl : sel === '.retail-money' ? mEl : { value: '0' }; } };
  const ids = { '#retailBody': { querySelector() { return row; } }, '#toast': makeEl(), '#toastMsg': makeEl() };
  const doc = trackDoc(ids);
  doc.track(qEl); doc.track(mEl);
  doc.activeElement = mEl;
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  assert.equal(c.commitRetailRow(), false);
  assert.equal(ids['#toastMsg'].textContent, 'Tiền không được âm');
  assert.equal(c.getRetailItems().length, 0);
  assert.equal(doc.activeElement, mEl);
});

test('2.15.21 B8 saveTxEdit: đơn giá âm bị chặn, "Tiền không được âm", db không đổi, con trỏ ở ô giá', () => {
  const dom = limitStock();
  const tx = { id: 'n1', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000, ts: 2000 };
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 200000 }], [tx]);
  c.openTxEdit('n1');
  let f = '';
  dom.document.querySelector('#txEditPrice').focus = () => { f = 'price'; };
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '-5');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(toastText(dom), 'Tiền không được âm');
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.equal(f, 'price');
});

/* ===== 2.16.0 PWA ===== */
test('2.16.0 PWA: head có manifest/apple-touch-icon/meta; đăng ký sw.js bọc try/catch và chỉ khi có serviceWorker', async () => {
  const { PAGE } = await import('../src/page.js');
  assert.match(PAGE, /<link rel="manifest" href="\/manifest\.webmanifest">/);
  assert.match(PAGE, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png">/);
  assert.match(PAGE, /<meta name="apple-mobile-web-app-capable" content="yes">/);
  assert.match(PAGE, /name="apple-mobile-web-app-title"/);
  assert.match(PAGE, /name="apple-mobile-web-app-status-bar-style"/);
  assert.match(PAGE, /try \{ if \('serviceWorker' in navigator\) navigator\.serviceWorker\.register\('\/sw\.js'\)/);
});
test('2.16.0 PWA: manifest JSON hợp lệ; sw.js không cache, không nhắc /api; icon là PNG đúng cỡ', async () => {
  const { MANIFEST, SW_JS, mountPwa } = await import('../pwa.js');
  const m = JSON.parse(MANIFEST);
  assert.equal(m.name, 'Quản Lý Kho'); assert.equal(m.short_name, 'Kho'); assert.equal(m.scope, '/');
  assert.equal(m.background_color, '#142844');
  assert.ok(!/\/api|caches\.|respondWith/.test(SW_JS));
  const routes = {};
  mountPwa({ get(p, h) { routes[p] = h; } });
  const want = { '/icon-192.png': 192, '/icon-512.png': 512, '/apple-touch-icon.png': 180, '/icon-maskable-192.png': 192, '/icon-maskable-512.png': 512 };
  for (const [p, n] of Object.entries(want)) {
    const out = {}; const res = { set(h) { out.h = h; return res; }, type(x) { out.type = x; return res; }, send(b) { out.body = b; } };
    routes[p]({}, res);
    assert.equal(out.type, 'image/png', p); assert.equal(out.h, 'Cache-Control');
    assert.equal(out.body.subarray(1, 4).toString(), 'PNG', p);
    assert.equal(out.body.readUInt32BE(16), n, p + ' rộng'); assert.equal(out.body.readUInt32BE(20), n, p + ' cao');
  }
  for (const p of ['/favicon.ico', '/favicon.svg']) assert.ok(routes[p], p);
  for (const n of [192, 512]) {
    assert.ok(m.icons.some(i => i.src === '/icon-' + n + '.png' && i.purpose === 'any' && i.sizes === n + 'x' + n), 'any ' + n);
    assert.ok(m.icons.some(i => i.src === '/icon-maskable-' + n + '.png' && i.purpose === 'maskable'), 'maskable ' + n);
  }
  assert.match(PAGE, /<link id="favicon" rel="icon" type="image\/svg\+xml" href="\/favicon\.svg">/);
});

/* 2.17.4: inRange cùng luật với isNonNegNumber ở server.js (chỉ number hữu hạn hoặc chuỗi số thập phân). */
test('2.17.4 inRange qua checkLimits/sanitize: boolean, chuỗi rỗng, khoảng trắng, null, mảng, 0x10 bị từ chối; số và chuỗi số được nhận', () => {
  const c = loadClient({ setTimeout() { return 0; }, clearTimeout() {} });
  for (const v of [true, false, '', ' ', null, [], [5], '0x10', 'abc', NaN, Infinity]) {
    assert.ok(c.checkLimits('q', v), 'phải từ chối ' + JSON.stringify(v));
    const out = c.sanitize({ products: [{ id: 'p1', name: 'A', stock: v, costPrice: 1 }], transactions: [], prescriptions: [], moneyUnit: 'dong' });
    assert.equal(out.products.length, 0, 'sanitize phải bỏ stock=' + JSON.stringify(v));
  }
  for (const v of [0, 5, '5', '5.5', ' 7 ', 1e6]) {
    assert.equal(c.checkLimits('q', v), null, 'phải nhận ' + JSON.stringify(v));
    const out = c.sanitize({ products: [{ id: 'p1', name: 'A', stock: v, costPrice: 1 }], transactions: [], prescriptions: [], moneyUnit: 'dong' });
    assert.equal(out.products.length, 1, 'sanitize phải giữ stock=' + JSON.stringify(v));
  }
});

/* 2.17.5: hàng Tổng (tfoot) nằm trong .note__pending không được làm dòng nhập trống bị coi là có dòng (compactAvail trừ ENTRY_BLOCK_H). */
test('2.17.5 pendEntryH: chỉ có tfoot (dòng nhập trống) = 0; có dòng nhập thì trừ đúng chiều cao tfoot', () => {
  const c = loadClient({ setTimeout() { return 0; }, clearTimeout() {} });
  const mkPend = (total, tfootH) => ({ getBoundingClientRect: () => ({ height: total }), querySelector: sel => (sel === 'tfoot' && tfootH != null ? { getBoundingClientRect: () => ({ height: tfootH }) } : null) });
  assert.equal(c.pendEntryH(mkPend(40, 40)), 0, 'chỉ tfoot -> 0');
  assert.equal(c.pendEntryH(mkPend(0, 0)), 0, 'tfoot ẩn, dòng nhập ẩn');
  assert.equal(c.pendEntryH(mkPend(100, 40)), 60, 'dòng nhập 60 + tfoot 40');
  assert.equal(c.pendEntryH(mkPend(60, null)), 60, 'không có tfoot');
  assert.equal(c.pendEntryH(null), 0);
});

/* 2.17.5: server từ chối thiếu moneyUnit, nên thân PUT của client phải luôn mang moneyUnit: 'dong'. */
test('2.17.5 pushState: thân PUT có moneyUnit "dong"', async () => {
  let sentBody = null;
  const fetchStub = async (url, opts) => { sentBody = opts && opts.body; return { json: async () => ({ success: true, updatedAt: 9 }) }; };
  const client = loadClient({ fetch: fetchStub });
  client.setDb(client.sanitize({ products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1 }));
  client.setBase(1);
  assert.equal(await client.pushState(false, false), true);
  assert.equal(JSON.parse(sentBody).moneyUnit, 'dong');
});

/* W1: bán lẻ thành tiền trống/0 bị chặn; giá bán <= giá nhập gần nhất thì hỏi confirm */
function w1Client(qty, money, confirmFn, withImport = true) {
  const mk = v => ({ value: v, focus() {}, select() {} });
  const row = { getAttribute() { return 'p1'; }, querySelector(sel) { return sel === '.retail-qty' ? mk(qty) : sel === '.retail-money' ? mk(money) : mk('0'); } };
  const tb = { textContent: 'giu', children: [], querySelector(s) { return s === 'tr[data-pid]' ? row : null; }, appendChild() {} };
  const els = { '#retailBody': tb, '#toast': makeEl(), '#toastMsg': makeEl() };
  const c = loadClient({ document: limitDoc(els), confirm: confirmFn,
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) }) });
  const transactions = withImport ? [{ id: 'T1', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 5, price: 100000, total: 500000 }] : [];
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 100000 }], transactions, prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  c.setBase(1);
  return c;
}
test('W1 saveRetail: amount=0 không tạo giao dịch, tồn không đổi', () => {
  const dom = limitStock();
  const c = limitClient(dom, [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 1 }]);
  c.setRetailItems([{ pid: 'p1', kg: 1, amount: 0 }]);
  const before = JSON.stringify(c.getDb());
  c.saveRetail();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.match(toastText(dom), /thành tiền lớn hơn 0/);
});
test('W1 commitRetailRow: ô tiền trống hoặc 0 không thêm dòng', () => {
  for (const v of ['', '0']) {
    const c = w1Client('1', v, () => true);
    assert.equal(c.commitRetailRow(), false);
    assert.equal(c.getRetailItems().length, 0);
  }
});
test('W1 commitRetailRow: giá bán <= giá nhập gần nhất thì hỏi confirm', () => {
  let asked = 0;
  let c = w1Client('1', '100', () => { asked++; return false; });
  assert.equal(c.commitRetailRow(), false);
  assert.equal(asked, 1);
  assert.equal(c.getRetailItems().length, 0);
  asked = 0;
  c = w1Client('1', '100', () => { asked++; return true; });
  assert.equal(c.commitRetailRow(), true);
  assert.equal(asked, 1);
  assert.equal(c.getRetailItems().length, 1);
  asked = 0;
  c = w1Client('1', '101', () => { asked++; return false; });
  assert.equal(c.commitRetailRow(), true);
  assert.equal(asked, 0);
  c = w1Client('1', '50', () => { asked++; return false; }, false);
  assert.equal(c.commitRetailRow(), true);
  assert.equal(asked, 0);
});

/* W1b: noteSave / commitRetailRow / saveTxEdit(BAN) chặn thành tiền 0 và hỏi khi giá <= giá nhập */
function w1bClient(dom, confirmFn, tx = []) {
  const c = loadClient({ document: dom.document, confirm: confirmFn,
    fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 1 }) }) });
  const imp = { id: 'T1', date: '2026-11-01', type: 'NHAP', productId: 'p1', qty: 5, price: 100000, total: 500000, ts: 1 };
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 5, costPrice: 100000 }], transactions: [imp].concat(tx), prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  c.setBase(1);
  return c;
}
test('W1b noteSave: thành tiền 0 hoặc 0.0004 bị chặn; giá <= nhập hỏi confirm', () => {
  for (const v of ['0', '0.0004']) {
    const dom = limitStock();
    const c = w1bClient(dom, () => true);
    c.setRetailItems([{ pid: 'p1', kg: 1, amount: 150000 }]);
    c.setNoteEditIdx(0);
    dom.set('noteEditQty', '1'); dom.set('noteEditMoney', v);
    c.noteSave();
    assert.equal(c.getRetailItems()[0].amount, 150000);
    assert.match(toastText(dom), /thành tiền lớn hơn 0/);
  }
  let asked = 0;
  let dom = limitStock();
  let c = w1bClient(dom, () => { asked++; return false; });
  c.setRetailItems([{ pid: 'p1', kg: 1, amount: 150000 }]);
  c.setNoteEditIdx(0);
  dom.set('noteEditQty', '1'); dom.set('noteEditMoney', '100');
  c.noteSave();
  assert.equal(asked, 1);
  assert.equal(c.getRetailItems()[0].amount, 150000);
  dom = limitStock();
  c = w1bClient(dom, () => { asked++; return true; });
  c.setRetailItems([{ pid: 'p1', kg: 1, amount: 150000 }]);
  c.setNoteEditIdx(0);
  dom.set('noteEditQty', '1'); dom.set('noteEditMoney', '100');
  c.noteSave();
  assert.equal(c.getRetailItems()[0].amount, 100000);
});
test('W1b commitRetailRow: ô tiền 0.0004 (ra 0 đồng) bị chặn', () => {
  const c = w1Client('1', '0.0004', () => true);
  assert.equal(c.commitRetailRow(), false);
  assert.equal(c.getRetailItems().length, 0);
});
test('W1b saveTxEdit BAN lẻ: giá 0 bị chặn; giá <= nhập hỏi confirm; NHAP giá 0 vẫn lưu', () => {
  const ban = { id: 'b1', date: '2026-11-02', type: 'BAN', productId: 'p1', qty: 1, price: 150000, total: 150000, cost: 100000, ts: 2 };
  let dom = limitStock();
  let c = w1bClient(dom, () => true, [ban]);
  c.openTxEdit('b1');
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '0');
  const before = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(JSON.stringify(c.getDb()), before);
  assert.match(toastText(dom), /thành tiền lớn hơn 0/);
  let asked = 0;
  dom = limitStock();
  c = w1bClient(dom, () => { asked++; return false; }, [ban]);
  c.openTxEdit('b1');
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '100');
  const b2 = JSON.stringify(c.getDb());
  c.saveTxEdit();
  assert.equal(asked, 1);
  assert.equal(JSON.stringify(c.getDb()), b2);
  dom = limitStock();
  c = w1bClient(dom, () => true, [ban]);
  c.openTxEdit('b1');
  dom.set('txEditQty', '1'); dom.set('txEditPrice', '120');
  c.saveTxEdit();
  assert.equal(c.getDb().transactions.find(t => t.id === 'b1').price, 120000);
  dom = limitStock();
  c = w1bClient(dom, () => true);
  c.openTxEdit('T1');
  dom.set('txEditQty', '5'); dom.set('txEditPrice', '0');
  c.saveTxEdit();
  assert.equal(c.getDb().transactions.find(t => t.id === 'T1').price, 0);
});

test('W5 tsFromId: id cũ 13 số, id uid() base36, id rác', () => {
  const c = limitClient(limitStock(), []);
  assert.equal(c.tsFromId('TX_1793519408528_x'), 1793519408528);
  const ms = parseInt('mw77m3ci', 36);
  assert.ok(ms > 946684800000 && ms < 4102444800000);
  assert.equal(c.tsFromId('TX_mw77m3ci8nn9e'), ms);
  assert.equal(c.tsFromId('OD_mw77m3ci8nn9e'), ms);
  const t0 = Date.now(), id = c.uid('TX');
  assert.ok(Math.abs(c.tsFromId(id) - t0) < 5000, 'id sinh bằng uid thật phải ra mốc gần Date.now()');
  ['', null, 'abc', 'TX_zzz', 'TX_00000000x', 'n_a', 'TX_12345'].forEach(x => assert.equal(c.tsFromId(x), 0, String(x)));
});

test('W5 txStamp/lastImport: hai giao dịch cùng ngày thiếu ts xếp theo mốc từ id', () => {
  const dom = limitStock();
  const a = 'NH_' + (1790000000000).toString(36) + 'aaaaa', b = 'NH_' + (1790000100000).toString(36) + 'bbbbb';
  /* b nằm TRƯỚC a trong mảng: nếu chỉ theo date+index thì a thắng; theo id thì b mới hơn */
  const txs = [
    { id: b, date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 200000, total: 200000 },
    { id: a, date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 1, price: 150000, total: 150000 }
  ];
  const c = limitClient(dom, [{ id: 'p1', name: 'A', stock: 2, costPrice: 1 }], txs);
  assert.equal(c.txStamp(txs[0]), 1790000100000);
  assert.ok(c.txStamp(txs[0]) > c.txStamp(txs[1]));
  const l = c.lastImport('p1');
  assert.equal(l.id, b);
  assert.equal(l.price, 200000);
  assert.equal(l.hasTime, true);
});

test('W6 downloadBackup: click ném lỗi thì không đóng dấu, trả false; thành công thì đóng dấu + lời báo mới', () => {
  const mk = (clickFn) => {
    const toastEl = makeEl(), msgEl = makeEl();
    const localStorage = { m: new Map(), getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }, setItem(k, v) { this.m.set(k, String(v)); }, removeItem() {} };
    const document = {
      readyState: 'loading', documentElement: makeEl(), body: makeEl(),
      querySelector(s) { return s === '#toast' ? toastEl : s === '#toastMsg' ? msgEl : null; },
      querySelectorAll() { return []; },
      createElement() { const e = makeEl(); e.click = clickFn; return e; },
      addEventListener() {}, removeEventListener() {}
    };
    const c = loadClient({ Blob: class {}, document, localStorage });
    c.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
    return { c, msgEl, localStorage };
  };
  const bad = mk(() => { throw new Error('blocked'); });
  assert.equal(bad.c.downloadBackup(true), false);
  assert.equal(bad.localStorage.m.size, 0);
  assert.equal(bad.msgEl.textContent, 'Không tạo được bản sao lưu');
  const ok = mk(() => {});
  assert.equal(ok.c.downloadBackup(true), true);
  assert.equal(ok.localStorage.m.size, 1);
  assert.equal(ok.msgEl.textContent, 'Đã tạo file sao lưu');
});

test('W6 restoreFromFile: 5 MB không bị từ chối ở client, > 12 MB bị từ chối', () => {
  const run = (size) => {
    let reads = 0;
    const c = loadClient({ FileReader: class { readAsText() { reads++; } } });
    c.restoreFromFile({ size });
    return reads;
  };
  assert.equal(run(5 * 1024 * 1024), 1);
  assert.equal(run(12 * 1024 * 1024), 1);
  assert.equal(run(12 * 1024 * 1024 + 1), 0);
});

test('W4b: header nhanh nhưng json() treo thì sau 15 s bị AbortError, pushing/GET nhả', async () => {
  const mk = (timers) => {
    const hangBody = (opts) => ({ status: 200, json: () => new Promise((res, rej) => {
      opts.signal.addEventListener('abort', () => { const e = new Error('aborted'); e.name = 'AbortError'; rej(e); });
    }) });
    return loadClient({
      fetch: async (url, opts = {}) => hangBody(opts),
      setTimeout(fn, ms) { timers.push({ fn, ms }); return timers.length - 1; },
      clearTimeout(id) { if (timers[id]) timers[id].cleared = true; }
    });
  };
  const timers = [];
  const client = mk(timers);
  client.setDb({ products: [], transactions: [], prescriptions: [], updatedAt: 1 });
  client.setBase(1);
  client.setDirty(true);
  const p = client.pushState(false, false);
  await new Promise(r => setImmediate(r));
  const t = timers.find(x => x.ms === 15000);
  assert.ok(t && !t.cleared, 'timer phải còn chạy khi thân chưa đọc xong');
  assert.equal(client.isPushing(), true);
  t.fn();
  assert.equal(await p, false);
  assert.equal(client.isPushing(), false);
  const t2 = [];
  const c2 = mk(t2);
  const g = c2.pullState(false, false);
  await new Promise(r => setImmediate(r));
  assert.ok(t2[0] && !t2[0].cleared);
  t2[0].fn();
  assert.equal(await g, false);
});

test('W5b tsFromId: khoảng 2025-2035 cả hai nhánh, id 13 số không gạch dưới', () => {
  const c = limitClient(limitStock(), []);
  assert.equal(c.tsFromId('OD_hoadon01'), 0);
  assert.equal(c.tsFromId('TX_nguyenvan'), 0);
  assert.equal(c.tsFromId('TX1731500000000'), 0);
  assert.equal(c.tsFromId('TX1793519408528'), 1793519408528);
  assert.equal(c.tsFromId('1793519408528'), 1793519408528);
  assert.equal(c.tsFromId('TX_1000000000000_x'), 0);
  assert.equal(c.tsFromId('TX_' + parseInt('00000001', 36).toString(36).padStart(8, '0') + 'x'), 0);
});

test('W6b restoreFromFile: JSON gọn > 4 MB bị từ chối trước xác nhận; thụt lề 5 MB nhưng gọn < 4 MB vẫn qua', () => {
  const mkData = (n, pad) => ({ products: Array.from({ length: n }, (_, i) => ({ id: 'P' + i, name: 'Vi ' + i + ' ' + pad, stock: 1, costPrice: 1000 })), transactions: [], prescriptions: [], moneyUnit: 'dong' });
  const run = (text) => {
    let asked = 0;
    class FR { readAsText() { this.result = text; this.onload(); } }
    const c = loadClient({ FileReader: FR, confirm: () => { asked++; return false; } });
    c.restoreFromFile({ size: text.length });
    return asked;
  };
  const big = mkData(30000, 'x'.repeat(120));
  assert.ok(JSON.stringify(big).length > 4 * 1024 * 1024);
  assert.equal(run(JSON.stringify(big)), 0);
  const small = mkData(3000, 'x');
  const txt = JSON.stringify(small, null, 8);
  assert.ok(txt.length > 400 * 1024 && JSON.stringify(small).length < 4 * 1024 * 1024);
  assert.equal(run(txt), 1);
});

test('2.23.0 kính mặc định tắt ở CSS gốc: --blur:none, chỉ html.glass bật; JS đọc kho_glass_v2', () => {
  // 2.23.0: kính mặc định TẮT. --blur chỉ khác none dưới html.glass; mọi backdrop-filter đều đọc từ biến.
  assert.ok(/--blur:none;--blurb:none;/.test(PAGE.slice(0, PAGE.indexOf('</style>'))) && /html\.glass\{[^}]*--blur:saturate\(1\.3\) blur\(14px\)/.test(PAGE));
  for (const m of PAGE.matchAll(/backdrop-filter:([^;}]*)/g)) assert.ok(/^(var\(--blurb?\)|none)$/.test(m[1].trim()), 'backdrop-filter chỉ đọc biến hoặc none: ' + m[1]);
  assert.ok(!/blur\(\d/.test(PAGE.replace(/--blurb?:[^;}]*/g, '')), 'không blur() cứng ngoài hai biến');
  assert.ok(PAGE.includes("/[?&]glass=1/") && PAGE.includes("'kho_glass_v2'") && PAGE.includes("classList.add('glass')") && !PAGE.includes('noglass'));
});

test('2.20.0 chế độ html.desktop: CSS chỉ dưới html.desktop, ≤8 KB, ≤6 backdrop, bảng/hộp thoại đục; JS nhớ ?desktop=1/0', () => {
  const a = PAGE.indexOf('/* 2.23.0 chế độ desktop'), b = PAGE.indexOf('@media (prefers-reduced-motion:reduce){\n*,*::before', a);
  assert.ok(a > 0 && b > a);
  const block = PAGE.slice(a, b).split('html:is(.desktop,.pt)').join('html.desktop'); // 2.20.13: selector dùng chung desktop + điện thoại
  const rules = block.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => l.trim());
  assert.ok(rules.length >= 7 && rules.every(l => l.startsWith('html.desktop') || l.startsWith('html.glass:is(.desktop,.pt)')), 'mọi quy tắc phải bắt đầu bằng html.desktop (hoặc html.glass)');
  assert.ok(Buffer.byteLength(block) <= 20480, 'CSS desktop ≤ 20 KB');
  assert.ok(!/feDisplacementMap/.test(PAGE));
  assert.ok(block.includes('html.desktop .dlg__card{background:var(--bt);border:1px solid rgba(255,255,255,.14)}') && block.includes('html.desktop .card table:not(.ord){background:none}'), 'hộp thoại đục, bảng cùng độ trong với thẻ');
  assert.ok(block.includes('.card:not(.dlg__card)') && block.split(String.fromCharCode(10)).filter(x => x.includes('.note') && !x.includes(' .btn')).every(x => (x.startsWith('html.desktop .note') || x.startsWith('html.desktop :is(#retailNote') || x.startsWith('html.desktop :is(.card__bar') || x.startsWith('html.desktop[data-bg]') || x.startsWith('html.desktop .dlg__card') || x.startsWith('html.desktop :is(.pager') || x.startsWith('html.desktop #remedyNote .note'))) && block.split('\n').filter(l => l.includes('.btn')).every(l => l.includes('.pager') || l.includes('.card__bar') || l.includes('.note__foot') || l.includes('.btn--primary') || l.startsWith('html.desktop .btn') || l.includes('.btn{') || l.includes('.btn--icon') || l.includes('.note td .btn--icon') || l.includes('.bgd') || l.includes('.note__row--btns') || l.startsWith('html.desktop[data-bg=navy]')));
  // 2.19.0: màu nhấn xanh lá (phân trang, nút chính, focus) và nút Bán đơn dính đáy khung
  assert.ok(block.includes('html.desktop :is(#retailNote,#remedyNote,#nhapListBox){overflow:clip}') && !block.includes('position:sticky'));
  assert.ok(/\[\?&\]desktop=0\/\.test\(q\)\) localStorage\.setItem\('desktop', '0'\)/.test(PAGE));
  assert.ok(/\[\?&\]desktop=1\/\.test\(q\)\) localStorage\.setItem\('desktop', '1'\)/.test(PAGE));
  assert.ok(PAGE.includes("dk === '1' || (dk !== '0'"));
  // vòng 2: kính trong hơn (.50-.58), tab chọn xanh lá thay indigo, --muted đậm để giữ tương phản >= 4,5
  assert.ok(block.includes('--glass:rgba(255,255,255,.07)') && block.includes('--kb:rgba(255,255,255,.10)') && block.includes('--spec:none;--k3d:none'), '2.23.0: thẻ trắng .07, viền .10, không bóng/vệt sáng');
  assert.ok(block.includes('--muted:rgba(255,255,255,.58)') && block.includes('--red-text:#FF7373'));
  assert.ok(block.includes('--sel-fg:#f8fafc') && !block.includes('#4f46e5'), 'tab chọn: nền .14 viền .32, chữ sáng');
});

test('2.20.0 vòng 3 kính liquid glass: thẻ số (2.20.0 đơn sắc), bo 22px, viền rim, nút/ô tìm kiếm dạng viên, chỉ dưới html.desktop', () => {
  const block = deskBlock();
  // 2.20.0: 4 ô lớn đơn sắc (đã bỏ nhuộm tông riêng, xem ca riêng bên dưới)
  assert.ok(!block.includes('--tint'));
  assert.ok(block.includes('html.desktop .stats{display:none}') && !block.includes('.stats4'), '2.30.0: không còn dải 4 ô');
  assert.ok(block.includes('border-radius:20px') && block.includes('html.desktop :is(input,select).inp,html.desktop .btn{border-radius:999px}'));
  assert.ok(!block.split(String.fromCharCode(10)).some(l => l.includes('.stats') && l.includes('backdrop-filter')));
  // bố cục khung cố định: thanh bên (tabs) + hàng thẻ số + vùng nội dung cuộn trong, không thêm DOM
  assert.ok(block.includes('width:100%;height:100vh;margin:0') && block.includes('html.desktop .main{display:contents}') && block.includes('html.desktop .tabs{grid-area:1/1/3/2;display:flex;flex-direction:column') && block.includes('html.desktop .main details.card{grid-area:1/2/3/3') && block.includes('overflow:hidden'));
  assert.ok(block.includes('html.desktop .note td{height:25px;padding:1px 10px;font-size:13px;border-bottom:1px solid'));
});

test('2.30.2 Thống kê desktop: 4 ô số (hôm nay, tháng, năm, nhập+tồn), mỗi ô hai số, không còn .stats4, chỉ hiển thị lại số computeStats', () => {
  assert.ok(!PAGE.includes('stats4') && !/\.s4\b|class="s4/.test(PAGE), 'đã xóa .stats4/.s4');
  assert.ok(PAGE.includes('.thk{display:none}') && !PAGE.includes('szpick'));
  const KEYS = ['tkExpDay', 'tkProfitDay', 'tkExpMonth', 'tkProfitMonth', 'tkExpYear', 'tkProfitYear', 'tkImp', 'tkStock'];
  const thk = PAGE.slice(PAGE.indexOf('class="thk__n"'), PAGE.indexOf('class="thk__n"') + 2000);
  assert.equal((thk.slice(0, 1900).match(/class="thk__g"/g) || []).length, 4, 'bốn ô thk__g, mỗi ô hai số');
  const order = [...thk.matchAll(/data-s4="(\w+)"/g)].map(m => m[1]).slice(0, 8);
  assert.deepEqual(order, KEYS, 'thứ tự tám số');
  const labels = [...thk.matchAll(/<i>([^<]*)<\/i>/g)].map(m => m[1]).slice(0, 8);
  assert.deepEqual(labels, ['Bán hôm nay', 'Lợi nhuận hôm nay', 'Bán trong tháng', 'Lợi nhuận tháng', 'Bán trong năm', 'Lợi nhuận năm', 'Nhập trong tháng', 'Tổng tồn kho']);
  const FakeDate = fakeClock(2026, 10, 7, 12);
  const { doc, els } = dateDoc();
  for (const id of STAT_IDS) els['#' + id] = { id, textContent: '', className: '' };
  for (const k of KEYS) els['[data-s4="' + k + '"]'] = { textContent: '', className: '' };
  const client = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {} });
  client.setDb({
    products: [{ id: 'p1', name: 'A', stock: 1.5, costPrice: 100000 }, { id: 'p2', name: 'B', stock: 2, costPrice: 50000 }], prescriptions: [], updatedAt: 1, moneyUnit: 'dong',
    transactions: [
      { id: 't1', date: '2026-11-07', type: 'BAN', productId: 'p1', qty: 1, price: 300000, total: 300000, cost: 100000 },
      { id: 't3', date: '2026-11-03', type: 'BAN', productId: 'p2', qty: 1, price: 90000, total: 90000, cost: 50000 },
      { id: 't2', date: '2026-03-01', type: 'BAN', productId: 'p2', qty: 1, price: 80000, total: 80000, cost: 50000 },
      { id: 't4', date: '2026-11-02', type: 'NHAP', productId: 'p1', qty: 3, price: 70000, total: 210000 },
      { id: 't5', date: '2026-10-02', type: 'NHAP', productId: 'p1', qty: 3, price: 70000, total: 999000 }
    ]
  });
  client.renderStats();
  const t = k => els['[data-s4="' + k + '"]'].textContent;
  // tính tay (nghìn đồng): bán tháng 300+90=390; hôm nay 300; năm 470; lợi nhuận tháng 390-150=240, hôm nay 200, năm 470-200=270; nhập tháng 210
  assert.equal(t('tkImp'), '210');
  assert.equal(t('tkExpMonth'), '390');
  assert.equal(t('tkProfitMonth'), '240');
  assert.equal(t('tkExpDay'), '300');
  assert.equal(t('tkProfitDay'), '200');
  assert.equal(t('tkExpYear'), '470');
  assert.equal(t('tkProfitYear'), '270');
  assert.equal(t('tkStock'), '3 kg');
  assert.equal(t('tkImp'), els['#statImport'].textContent);
  assert.equal(t('tkExpMonth'), els['#statExport'].textContent);
  assert.equal(t('tkProfitMonth'), els['#statProfit'].textContent);
  assert.equal(t('tkProfitDay'), els['#statProfitDay'].textContent);
  assert.equal(t('tkProfitYear'), els['#statProfitYear'].textContent);
});

/* ===== 2.20.0 ===== */
function headScript() {
  const blocks = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  return blocks.find(b => b.includes('__NEED_FETCH__') && b.includes("'desktop'"));
}
function runHead({ desktop = true, iw = 1920, ih = 1080, ls = {}, sw = 3840, sh = 2160, dpr = 1, tauri = true, els = {} } = {}) {
  const props = {}, attrs = {}, resize = [];
  const cls = new Set(); const R = { classList: { contains: k => (desktop && k === 'desktop') || cls.has(k), add(k) { if (k === 'glass' || k === 'tauri') cls.add(k); }, toggle(k, on) { if (on) cls.add(k); else cls.delete(k); } }, style: { setProperty(k, v) { props[k] = v; } }, setAttribute(k, v) { attrs[k] = v; } };
  const mk = () => { const s = new Set(); return { children: [], style: {}, classList: { add: k => s.add(k), remove: k => s.delete(k), contains: k => s.has(k), toggle: k => (s.has(k) ? (s.delete(k), false) : (s.add(k), true)) }, setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; }, appendChild(c) { this.children.push(c); return c; } }; };
  let ready = null;
  const wrapEl = { nextSibling: null, parentNode: null }; const bar = { children: [wrapEl], insertBefore(n, ref) { if (ref) this.children.splice(this.children.indexOf(ref), 0, n); else this.children.push(n); } }; wrapEl.parentNode = bar;
  const document = { documentElement: R, getElementById: (i) => els[i] || null, createElement: mk, body: mk(), querySelector: q => (q === '.top .brand-wrap' ? wrapEl : q === '.szpick' ? bar.children.find(c => c.className === 'szpick') || null : null), addEventListener(e, f) { if (e === 'DOMContentLoaded') ready = f; } };
  const store = { ...ls };
  const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  const win = tauri ? { __TAURI__: {} } : {};
  const ctx = { document, localStorage, location: { search: '?desktop=1' }, window: win, screen: { availWidth: sw, availHeight: sh }, devicePixelRatio: dpr, innerWidth: iw, innerHeight: ih, addEventListener(e, f) { if (e === 'resize') resize.push(f); } };
  vm.runInNewContext(headScript().replace(/%%BOOT%%/g, 'null').replace(/%%NEEDFETCH%%/g, 'false'), ctx);
  if (ready) ready();
  return { props, attrs, store, win, resize, ctx, body: document.body, bar, cls };
}
function deskBlock() {
  const a = PAGE.indexOf('/* 2.23.0 chế độ desktop'), b = PAGE.indexOf('@media (prefers-reduced-motion:reduce){', a);
  return PAGE.slice(a, b).split('html:is(.desktop,.pt)').join('html.desktop'); // 2.20.13: selector dùng chung desktop + điện thoại
}

test('2.31.0 một cỡ, bố cục co giãn: không zoom/--z/--vw/--vh/__dz, thân = 100% x 100vh, lề 10 trên + 16 ngang/dưới, thanh bên 160', () => {
  const block = deskBlock();
  assert.ok(block.includes('html.desktop{--sw:160px;--g:16px;overflow:hidden}') && block.includes('width:100%;height:100vh;margin:0;box-sizing:border-box;overflow:hidden;padding:10px var(--g) var(--g)}'));
  assert.ok(!/__dz|--vw|--vh|--z\b|zoom:|\.zoom/.test(PAGE) && !/\bzoom\b/.test(PAGE.replace('không zoom', '')), 'không còn zoom/--z/--vw/--vh/__dz');
  const r = runHead({ iw: 920, ih: 578 });
  assert.deepEqual(Object.keys(r.props), [], 'JS không đặt biến cỡ');
  assert.equal(r.resize.length, 0, 'không nghe resize để phóng khung');
});

test('2.23.1 html.tauri chỉ khi desktop + __TAURI__; lề trên 34px (tránh nút thanh tiêu đề) chỉ dưới html.desktop.tauri', () => {
  assert.ok(runHead({ tauri: true }).cls.has('tauri'));
  assert.ok(!runHead({ tauri: false }).cls.has('tauri'), 'PWA không có __TAURI__');
  assert.ok(!runHead({ desktop: false, tauri: true }).cls.has('tauri'), 'không desktop thì không tauri');
  assert.ok(deskBlock().includes('\nhtml.desktop.tauri body{padding-top:34px}\n') && deskBlock().includes('html.desktop.tauri .bak-sec{padding:12px 16px}\nhtml.desktop.tauri .bak-row{padding:0}'), 'Sao lưu có dòng thư mục vẫn vừa 704px');
});

test('2.31.0 menu dòng: vị trí theo cửa sổ (không chia zoom), tự hiệu chỉnh theo vị trí thật', () => {
  assert.ok(PAGE.includes('var r = btn.getBoundingClientRect();') && PAGE.includes('var left = r.right - w;') && PAGE.includes('window.innerHeight - 8') && PAGE.includes('list.style.left = (2 * left - q.left)') && !PAGE.includes('__dz'));
});

test('2.20.10 7 nền tối (navy mặc định + prism/cyan/emerald/gold/rose/graphite): mỗi nền có --bt + chấm --dc; bấm lưu desktopBg; giá trị lạ (kể cả nền cũ) về navy', () => {
  const block = deskBlock();
  const ks = ['navy', 'prism', 'cyan', 'emerald', 'gold', 'rose', 'graphite'];
  for (const k of ks) assert.ok(block.includes('html.desktop[data-bg=' + k + '],html.desktop .bgd[data-bg=' + k + ']{--bt:linear-gradient(135deg,#'), k);
  for (const k of ['gpui', 'hong', 'dao', 'vang', 'duong', 'tim']) assert.ok(!block.includes('data-bg=' + k) && !PAGE.includes("'" + k + "'"), 'đã xóa nền cũ ' + k);
  assert.ok(block.includes('background:var(--bt)}'));
  let r = runHead();
  assert.equal(r.attrs['data-bg'], 'navy', 'nền mặc định navy');
  const wrap = r.body.children[0].children[0].children[2]; /* 2.31.0: .sbf > .sbr > bảng chấm nền (mở bằng nút bảng màu) */
  assert.deepEqual(wrap.children.map(c => c['data-bg']), ks);
  assert.deepEqual(wrap.children.map(c => c.textContent), ['Navy', 'Prism', 'Cyan', 'Emerald', 'Amber', 'Rose', 'Graphite']);
  assert.equal(wrap.children[0]['aria-pressed'], 'true', 'chấm navy được đánh dấu khi mặc định');
  wrap.children[2].onclick();
  assert.equal(r.attrs['data-bg'], 'cyan');
  assert.equal(r.store.desktopBg, 'cyan');
  assert.equal(wrap.children[2]['aria-pressed'], 'true');
  assert.equal(wrap.children[0]['aria-pressed'], 'false');
  r = runHead({ ls: { desktopBg: 'rose' } });
  assert.equal(r.attrs['data-bg'], 'rose');
  assert.equal(r.body.children[0].children[0].children[2].children[5]['aria-pressed'], 'true');
  assert.equal(runHead({ ls: { desktopBg: 'xyz' } }).attrs['data-bg'], 'navy');
  assert.equal(runHead({ ls: { desktopBg: 'gpui' } }).attrs['data-bg'], 'navy', 'nền đã xóa → navy');
  assert.equal(runHead({ desktop: false }).body.children.length, 0, 'không desktop: không dựng chấm màu');
});

test('2.30.0 thẻ nội dung desktop chiếm cả hai hàng lưới, không còn ô số riêng', () => {
  const block = deskBlock();
  assert.ok(!/--tint|\.s4/.test(block));
  assert.ok(block.includes('html.desktop .main details.card{grid-area:1/2/3/3;'), 'thẻ chiếm hàng 1-2');
  assert.equal((PAGE.match(/class="s4"/g) || []).length, 0);
});

test('2.20.1 tờ ghi đồng bộ kính: không nền kem/amber, không viền trái đỏ, chữ tiêu đề không nâu; ba tờ ghi cùng một kiểu', () => {
  const block = deskBlock();
  const lines = block.split('\n').filter(l => /\.note/.test(l));
  assert.ok(lines.length >= 8);
  assert.ok(!/amber|--red(?!-text)|#b45309|f5e6|fbf5e6/i.test(block), 'không dùng màu amber/đỏ trong khối desktop');
  assert.ok(block.includes('html.desktop .note{margin:0;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:var(--glass)}'));
  assert.ok(block.includes('html.desktop .note__head{height:32px;') && block.includes('font-size:10px;font-weight:600;letter-spacing:.08em'));
  assert.ok(block.includes('html.desktop :is(#retailNote,#remedyNote,#nhapListBox) .note__foot{display:flex'), 'chân gọn một hàng, không nền riêng');
  assert.ok(block.includes('html.desktop .note__row{flex-wrap:nowrap'));
  assert.ok(!block.includes('#remedyNote .note__search'), '2.20.6: ô tên Thuốc chén đã lên thanh đầu');
});

test('2.20.1 không cuộn: thẻ overflow:hidden, không overflow:auto/scroll trong desktop; ngoại lệ duy nhất là khung gợi ý (ẩn thanh cuộn)', () => {
  const block = deskBlock();
  assert.ok(block.includes('html.desktop .main details.card{grid-area:1/2/3/3;min-height:0;min-width:0;margin:0;overflow:hidden}'));
  assert.ok(!/overflow(-[xy])?:\s*(auto|scroll)/.test(block));
  assert.ok(block.includes('html.desktop .sug__list{scrollbar-width:none') && block.includes('html.desktop .sug__list::-webkit-scrollbar{display:none}'));
  assert.ok(block.includes('html.desktop[data-bg] *{scrollbar-color:rgba(255,255,255,.3) transparent}'));
  assert.ok(/SUG_ROWS\s*=\s*3/.test(PAGE), 'khung gợi ý vẫn 3 dòng');
  assert.ok(block.includes('box-sizing:border-box;overflow:hidden;padding:10px var(--g) var(--g)}'), 'lề: trên 10, ngang/dưới 16 (2.31.0)');
  assert.ok(block.includes('html.desktop #tb{height:24px}') && block.includes('html.desktop #tb button{width:36px}'));
  assert.ok(block.includes('margin:52px 10px 0') && block.includes('grid-area:1/1/3/2') && block.includes('padding-top:10px}'));
});

test('2.20.1 tab Thống kê: ẩn hai khối nhập/tồn bằng CSS (DOM còn), ô năm kính, cột Nhập đổi màu bằng biến CSS', () => {
  const block = deskBlock();
  assert.ok(block.includes('html.desktop #chartBox>summary{display:none}'), '2.24.0: desktop ẩn cả summary (tiêu đề/năm/Nhập/Tồn), thẻ có tiêu đề riêng .thk');
  assert.ok(PAGE.includes('id="statImport"') && PAGE.includes('id="statStock"'), 'DOM giữ cho iPhone/PWA');
  assert.ok(!PAGE.slice(0, PAGE.indexOf('/* 2.23.0 chế độ desktop')).includes('#chartBox>summary{display:none}'), 'không ẩn ngoài desktop');
  assert.ok(!block.includes('html.desktop .chart-year__box'), '2.31.0: ô năm nằm trong summary ẩn, bỏ luật chết');
  assert.ok(block.includes('--chart-imp:#44DAFE;--chart-exp:#FFA33D') && PAGE.includes("cs.getPropertyValue('--chart-imp')"));
  assert.ok(block.includes('html.desktop .chart{flex:1;min-height:0;height:auto}'));
});

test('2.20.1 mọi trạng thái (thường/hover/focus/mở) cùng họ kính trắng trong, không be/đục: tiêu đề thẻ, ô năm, ô nhập, hàng bảng, nút viên', () => {
  const block = deskBlock();
  assert.ok(block.includes('html.desktop[data-bg] .inp,html.desktop[data-bg] .chart-year__box{background-color:rgba(255,255,255,.10);border-color:rgba(255,255,255,.14)}') && block.includes('html.desktop[data-bg] .inp:focus{background-color:rgba(255,255,255,.14);border-color:rgba(255,255,255,.35)'), 'ô nhập .10/.14, focus viền .35 không xanh');
  assert.ok(block.includes('html.desktop[data-bg] tbody tr:hover{background:rgba(255,255,255,.07)}'));
  assert.ok(block.includes('html.desktop .tab:hover{background-color:rgba(255,255,255,.13);border-color:rgba(255,255,255,.22)}') && block.includes('transition:background-color .12s,border-color .12s'), 'hover nút danh sách sáng lên, 120ms');
  assert.ok(!/var\(--surface2\)|#f6f2ef|#e9e2de/.test(block), 'không màu be trong khối desktop');
  assert.ok(PAGE.includes('.main>details.card[open]>summary.card__head:hover,.main>.grid2>details.card[open]>summary.card__head:hover{background:var(--surface)}'));
});

test('2.23.0 viên phẳng mờ: nút/ô số/tab cùng token, bóng đổ chỉ khi bật kính, hover chỉ đổi màu, không blur cứng', () => {
  const block = deskBlock();
  assert.ok(block.includes('--spec:none;--k3d:none;--k3h:none;--k3t:none;--k3a:none'), 'mặc định không bóng/vệt sáng');
  assert.ok(PAGE.includes('html.glass:is(.desktop,.pt)[data-bg]{--blur:saturate(1.6) blur(18px)'), 'kính chỉ bật dưới html.glass');
  for (const m of block.matchAll(/transition:([^;}]*)/g)) assert.ok(/^(background-color|border-color) \.12s(,(background-color|border-color) \.12s)*$/.test(m[1].trim()), 'transition chỉ màu: ' + m[1]);
  assert.ok(!/(^|[^-])filter:s*blur|feGaussian/.test(block));
  assert.ok(block.includes('html.desktop .bgd[aria-pressed=true]::before{border:2px solid rgba(255,255,255,.95)}') && block.includes('.bgd{position:relative;display:block;width:22px;height:22px'), 'chấm nền 22px, chọn = viền trắng 2px');
  assert.ok(block.includes('html.desktop .card:not(.dlg__card){border-radius:20px;border:1px solid rgba(255,255,255,.10);background:var(--glass)'), 'thẻ bo 20, viền .10');
});

test('2.20.2 biểu đồ: bỏ dải nền tháng hiện tại ở desktop bằng biến --chart-hi (trong suốt); ngoài desktop giữ màu cũ', () => {
  const block = deskBlock();
  assert.ok(block.includes('--chart-hi:rgba(255,255,255,.08)'));
  assert.ok(PAGE.includes("ctx.fillStyle = cs.getPropertyValue('--chart-hi').trim() || 'rgba(99,102,241,.14)';"));
  assert.ok(!PAGE.slice(0, PAGE.indexOf('/* 2.23.0 chế độ desktop')).includes('--chart-hi'), 'không đặt --chart-hi ngoài desktop');
});

test('2.20.2 khung phủ kín viewport: thẻ lấp đầy chiều cao (cả 3 danh sách), Sao lưu co theo nội dung; vùng kéo cửa sổ quanh logo', () => {
  const block = deskBlock();
  assert.ok(block.includes('html.desktop .main details:not(#backupBox)[open]::details-content{display:flex;flex-direction:column;flex:1;min-height:0}'));
  assert.ok(block.includes('html.desktop :is(#retailBox,#remedyBox,#nhapBox,#chartBox,#invBox,#impBox,#expBox)>.card__body{flex:1;min-height:0;display:flex;flex-direction:column}'));
  assert.ok(block.includes('html.desktop :is(#retailNote,#remedyNote) .note__list>table,html.desktop #nhapListBox>table{height:100%}'));
  assert.ok(block.includes('html.desktop #backupBox{align-self:start}'));
  assert.ok(PAGE.includes("['.top', '.top .bar'].forEach(function(q){ var e = document.querySelector(q); if (e) e.setAttribute('data-tauri-drag-region', ''); });"));
});

test('2.31.0 không còn HD/FHD: không viên cỡ cửa sổ, không mã đổi cỡ, không dựng gì dưới logo (Tauri hay không)', () => {
  for (const tauri of [true, false]) {
    const r = runHead({ iw: 920, ih: 578, tauri });
    assert.equal(r.bar.children.length, 1, 'chỉ còn khối logo, không viên cỡ (tauri=' + tauri + ')');
  }
  assert.ok(!/szpick|'HD'|'FHD'|Cỡ cửa sổ|setSize|unmaximize|PhysicalSize/.test(PAGE), 'không còn mã/markup/CSS HD-FHD trong trang');
  assert.ok(!/HD 1280|1920/.test(fs.existsSync('G:/quan-ly-kho-tauri/src-tauri/src/main.rs') ? fs.readFileSync('G:/quan-ly-kho-tauri/src-tauri/src/main.rs', 'utf8') : ''), 'app Tauri không còn khóa 16:9/HD/FHD (bỏ qua nếu không có repo app)');
});

test('2.20.0 titlebar.js (app Tauri) luôn chèn trong Tauri, không cần html.desktop; có 3 nút (bỏ qua nếu không có repo app)', t => {
  const f = 'G:/quan-ly-kho-tauri/src-tauri/titlebar.js';
  if (!fs.existsSync(f)) return t.skip('không có repo app Tauri');
  const js = fs.readFileSync(f, 'utf8');
  assert.ok(!/classList\.contains\('desktop'\)/.test(js), 'không được phụ thuộc html.desktop');
  assert.ok(js.includes('data-a="min"') && js.includes('data-a="max"') && js.includes('data-a="close"'));
  assert.ok(js.includes("'body{padding-top:32px}") && !js.includes('html.desktop body{padding-top'));
});

function deskNoteClient(desktop, n) {
  const tb = { set textContent(v) { this.children.length = 0; }, get textContent() { return ''; }, children: [], appendChild(c) { this.children.push(c); return c; } };
  const tot = makeEl(), pager = makeEl(), pg = makeEl();
  const els = { '#retailNoteBody': tb, '#retailNotePg': pg, '#retailNotePager': pager, '#retailNote': makeEl(), '#retailNoteTotal': tot, '#retailNoteFoot': makeEl() };
  const doc = trackDoc(els);
  doc.createTextNode = () => makeEl();
  doc.documentElement.classList = { contains: k => desktop && k === 'desktop', add() {}, remove() {}, toggle() {} };
  const c = loadClient({ document: doc, Date: fakeClock(2026, 10, 11, 12), setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 1000, costPrice: 1000 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  c.setRetailItems(Array.from({ length: n }, (_, i) => ({ pid: 'p1', kg: 1, amount: 1000 * (i + 1) })));
  const isBlank = r => String(r.className).includes('note__blank');
  return {
    c, tb, tot, pager, pg,
    page(p) { c.setNotePage(p); c.renderNote(); },
    stt: () => tb.children.filter(r => !isBlank(r)).map(r => r.children[0].textContent),
    rows: () => tb.children.length,
    blanks: () => tb.children.filter(isBlank).length
  };
}

test('2.20.0 tờ ghi desktop: 25 dòng → 3 trang 10/10/5 (+5 hàng trống), STT liên tục, tổng tiền = không phân trang', () => {
  const d = deskNoteClient(true, 25), n = deskNoteClient(false, 25);
  const seen = [];
  for (const [p, real] of [[1, 10], [2, 10], [3, 5]]) {
    d.page(p);
    assert.equal(d.rows(), 10, 'trang ' + p + ' luôn đủ 10 hàng');
    assert.equal(d.stt().length, real);
    assert.equal(d.blanks(), 10 - real);
    assert.equal(d.pg.textContent, 'Trang ' + p + ' / 3');
    seen.push(...d.stt());
  }
  assert.deepEqual(seen, Array.from({ length: 25 }, (_, i) => String(i + 1)), 'thứ tự dòng không đổi');
  n.page(3);
  assert.equal(d.tot.textContent, n.tot.textContent);
  assert.equal(n.tot.textContent, d.c.fmtMoney ? d.c.fmtMoney(1000 * (25 * 26 / 2)) : n.tot.textContent);
  assert.equal(n.rows(), 5, 'không desktop: không hàng trống');
  assert.equal(d.pager.hidden, false);
});

test('2.20.0 tờ ghi desktop: dòng thứ 11 lật sang trang 2; xóa còn 10 dòng thì lùi về trang 1; phân trang luôn hiện khi desktop', () => {
  const d = deskNoteClient(true, 11);
  d.page(1e9);
  assert.equal(d.c.getNotePage(), 2, 'trang chứa dòng mới nhất');
  assert.equal(d.stt()[0], '11');
  d.c.setRetailItems(d.c.getRetailItems().slice(0, 10));
  d.c.renderNote();
  assert.equal(d.c.getNotePage(), 1, 'trang cuối rỗng thì lùi');
  assert.equal(d.stt().length, 10);
  const one = deskNoteClient(true, 3); one.page(1);
  assert.equal(one.pager.hidden, false);
  assert.equal(one.pager.children[0].textContent, 'Trang 1 / 1');
  const off = deskNoteClient(false, 3); off.page(1);
  assert.equal(off.pager.hidden, true, 'iPhone/PWA: 1 trang thì ẩn như cũ');
  assert.ok(/notePage = 1e9;\s*tb\.textContent = '';/.test(PAGE), 'thêm dòng đặt trang cuối');
});

test('2.20.4 desktop: mọi khung gợi ý/lọc cao đúng 3 hàng x 38px, guồng, không nửa dòng; điện thoại giữ cách đo cũ', () => {
  const block = deskBlock();
  const m = /html\.desktop \.sug__list\{([^}]*)\}/.exec(block), r = /html\.desktop \.sug__item\{([^}]*)\}/.exec(block);
  assert.ok(m && r, 'có luật khung và hàng gợi ý');
  const hh = +/(?:^|;)height:(\d+)px/.exec(r[1])[1], border = 2;
  assert.equal(+/max-height:(\d+)px/.exec(m[1])[1], 3 * hh + border, 'cao khung = 3 hàng + viền, đệm 0');
  assert.ok(/padding:0/.test(m[1]) && /scroll-snap-type:y mandatory/.test(m[1]) && /scroll-snap-align:start/.test(r[1]));
  assert.ok(/if \(sugWhole\(key\) && !isDesk\(\)\)/.test(PAGE), 'desktop không để JS đo ghi đè chiều cao');
  assert.ok(/sugListMaxHeight\(hs, SUG_ROWS, 10\)/.test(PAGE), 'điện thoại giữ nguyên');
  assert.ok(!PAGE.slice(0, PAGE.indexOf('/* 2.23.0 chế độ desktop')).includes('scroll-snap-type'), 'snap chỉ trong desktop');
});

test('2.20.5 tờ ghi desktop: nút/ô nhỏ, cột gần nhau, đường kẻ một kiểu, kính như danh mục, nút chính xanh lá chung', () => {
  const block = deskBlock();
  const px = (re) => +re.exec(block)[1];
  // (1) kích thước: nút <= 30, "..." 22, "+" 28, ô nhập 28, phân trang 26
  assert.ok(px(/html\.desktop \.btn\{min-height:(\d+)px/) <= 30 && px(/html\.desktop \.pager \.btn\{min-height:(\d+)px/) === 24);
  assert.ok(px(/html\.desktop \.note td \.btn--icon\{min-height:(\d+)px/) === 22 && px(/\.pend \.nhap-add\{display:inline-flex;width:(\d+)px/) === 22);
  assert.ok(px(/html\.desktop \.note \.inp\{height:(\d+)px/) === 28);
  // (5) cột: STT 40, tên 290, SL 110, giá 100, cột thao tác auto (hấp thụ phần còn lại, nút sát trái)
  assert.equal(px(/col\.cg-num\{width:(\d+)px/), 38); assert.ok(block.includes('col.cg-name{width:auto}'));
  assert.equal(px(/col\.cg-qty\{width:(\d+)px;min-width:120px/), 120); assert.equal(px(/col\.cg-money\{width:(\d+)px/), 110);
  assert.ok(block.includes('col.cg-act{width:34px}') && block.includes('.c-act,.c-del){text-align:left;padding:0 10px 0 2px}'));
  // (2) đường kẻ: mọi đường ngang 1px solid var(--border); không còn 2px/dashed trong khối desktop
  assert.ok(!/border-(top|bottom):(?:[2-9]px|1px dashed)/.test(block));
  assert.ok(block.includes('html.desktop .note tfoot td{border-top:1px solid var(--border);border-bottom:0}') && block.includes('html.desktop .note__pending tfoot td{border-top:0}'));
  // (3) tờ ghi là kính (trắng .2 + vệt sáng + --kb + --k3d), bảng trong suốt
  assert.ok(/html\.desktop \.note\{margin:0;border:1px solid rgba\(255,255,255,\.10\);border-radius:18px;background:var\(--glass\)\}/.test(block));
  // (4) nút chính (green/primary/dark/trang hiện tại) cùng một kiểu kính nhuộm xanh lá, mọi .btn/ô nhập dùng --kb/--spec/--k3d
  assert.ok(block.includes('html.desktop :is(.btn--green,.btn--primary,.btn--dark){color:#fff;font-weight:600;border-color:transparent;background-color:rgba(64,128,242,.5)}') && block.includes(':hover{background-color:rgba(64,128,242,.6)}'), '2.23.0: nút chính xanh .50 / hover .60');
  assert.ok(block.includes('html.desktop :is(.tab,.card__bar .inp,.note .inp,.chart-year__box),html.desktop .btn:not('));
  assert.ok(!PAGE.slice(0, PAGE.indexOf('/* 2.23.0 chế độ desktop')).includes('col.cg-name{width:290px}'), 'chỉ trong desktop');
});

test('2.20.6 desktop: ô số ngắn 80px cao 28 căn phải trong cột; ô tên Thuốc chén lên thanh đầu (chỉ desktop, giữ id)', () => {
  const block = deskBlock();
  const m = /html\.desktop input\.inp\.inp--num\{width:(\d+)px;max-width:100%;height:(\d+)px;min-height:\2px;padding:2px 8px;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums\}/.exec(block);
  assert.ok(m && +m[1] === 80 && +m[2] === 28, 'mọi ô số 80x28');
  assert.ok(block.includes('html.desktop td.c-money .inp--num{margin-left:auto}') && !block.includes('.chart-year__in'), '2.31.0: ô năm nằm trong summary ẩn, bỏ luật chết');
  // thanh đầu Thuốc chén: tiêu đề, ô nhập tên, chọn đơn, ngày; dời ở JS desktop, không đổi HTML gốc (điện thoại)
  assert.ok(/<span class="card__bar-title"[^>]*>[\s\S]{0,200}?Thuốc chén<\/span>\s*<select class="inp card__bar-preset" id="remedyPreset"/.test(PAGE), 'HTML gốc giữ nguyên thứ tự (iPhone)');
  assert.ok(PAGE.includes("rs = rs.parentNode; rs.className = 'sug card__bar-search'; bl.className = 'rbl'") && PAGE.includes('rb.insertBefore(bl, rp); rb.appendChild(br);') && /if \(rs && rb && rp\)/.test(PAGE));
  const head = PAGE.slice(PAGE.indexOf("document.addEventListener('DOMContentLoaded', function(){\n      var w = document.createElement('div'); w.className = 'bgdots'"));
  assert.ok(head.indexOf("getElementById('remedySearch')") > 0 && head.indexOf("getElementById('remedySearch')") > head.indexOf('if (!D) {'), 'dời nằm sau nhánh thoát của điện thoại (chỉ desktop)');
});

test('2.20.7 desktop: viên kính chung (HD/FHD, phân trang, Lưu đơn+Bán đơn), kính mỏng hơn, icon tab một màu nét đều', () => {
  const block = deskBlock();
  // viên chung: một khối bo tròn hoàn toàn, viền 1px --kb, nút con phẳng, nút chọn dùng bóng mỏng --k3t
  const pill = /html\.desktop :is\(\.pager,#remedyNote \.note__row--btns\)\{([^}]*)\}/.exec(block);
  assert.ok(pill && /border:1px solid;border-color:var\(--kb\)/.test(pill[1]) && pill[1].includes('border-radius:999px') && pill[1].includes('box-shadow:var(--k3d)'), 'viên chung 1px, bo 999px');
  assert.ok(block.includes('html.desktop :is(.pager .btn,#remedyNote .note__row--btns .btn):not(.btn--primary,[aria-pressed=true],[aria-current]){border-color:transparent;background:none;box-shadow:none;transform:none}'), 'nút trong viên phẳng');
  assert.ok(block.includes('[aria-current],.btn--primary){box-shadow:var(--k3t)}'));
  // mỏng hơn: bóng đáy nhỏ hơn bản 2.20.2 (0 14px 30px -> 0 8px 18px), viền tối .16, bóng viên <= 1px
  // icon tab: một màu trung tính, nét 1,75 cho cả 8, mục chọn theo màu chữ chọn
  assert.ok(block.includes('html.desktop .tab__ic{position:absolute;left:10px;top:50%;margin-top:-9px;width:18px;height:18px;color:var(--text);stroke-width:1.5}'), '2.31.0: icon 18, đệm trái 10');
  assert.ok(!PAGE.slice(0, PAGE.indexOf('/* 2.23.0 chế độ desktop')).includes('--k3t'), 'chỉ trong desktop');
});

test('2.20.7 desktop: "+" chung một lớp 28x28 tròn cả 3 tờ ghi; ô gợi ý đơn vị riêng bên trái ô SL; số to đậm; nền navy token sáng', () => {
  const block = deskBlock();
  // "+" của Bán lẻ/Thuốc chén (.btn--icon) và Nhập hàng (.nhap-add) cùng một luật: tròn 28x28, padding 0, flex căn giữa
  assert.ok(block.includes('html.desktop .pend .nhap-add{display:inline-flex;width:22px;min-width:22px;height:22px;min-height:22px;padding:0}')); // 2.29.0: dòng gõ nằm trong bảng tờ ghi (.pend), "+" 22 như nút ⋯
  assert.ok(/class="btn btn--primary nhap-add"|nhap-add/.test(PAGE));
  // ô gợi ý đơn vị: vùng dành sẵn 86px bên trái ô SL (cột SL 176 = 86 + 80 + 10), chip tuyệt đối trong vùng đó, không chồng ô số
  assert.ok(block.includes('html.desktop td .qty-hint.qty-hint--label{left:auto;right:96px;top:50%;transform:translateY(-50%);width:max-content;max-width:72px'));
  assert.ok(/var maxW = isDesk\(\) \? 58 : Math\.max\(0, \(host\.offsetWidth \|\| cw\) - QTY_LABEL_W - 6\);/.test(PAGE), 'điện thoại giữ cách tính cũ');
  // nền navy: token chữ sáng, kính trắng ~.07-.12, không thêm backdrop-filter, màu mẫu thanh Safari #142844
  const nv = /html\.desktop\[data-bg]{([^}]*)\}/.exec(block);
  assert.ok(nv && /--text:#f8fafc/.test(nv[1]) && /--glass:rgba\(255,255,255,\.07\)/.test(nv[1]) && nv[1].includes('color-scheme:dark'), 'token sáng');
  assert.ok(block.includes('html.desktop[data-bg=navy],html.desktop .bgd[data-bg=navy]{--bt:linear-gradient(135deg,#0A1433,#12265C)'));
  assert.ok(!/backdrop-filter/.test(nv[1]));
});

test('2.20.8 desktop: mặc định navy; nút không còn xanh lục, mục chọn = kính sáng hơn + viền sáng + chữ đậm; select/option theo bảng màu', () => {
  const block = deskBlock();
  // mặc định navy khi chưa lưu, đặt ngay trong head
  assert.ok(/cur = 'navy';/.test(PAGE) && PAGE.includes("localStorage.getItem('desktopBg') || 'navy'"));
  // không còn rgba xanh lục (52,211,153 / 4,120,87 / 5,120,85 / 16,150,110) trong các luật nút/mục chọn ngoài token
  const btnRules = block.split('\n').filter(l => /\.tab|\.btn|\.szpick|\.pager/.test(l));
  assert.ok(btnRules.length > 5 && !btnRules.some(l => /52,211,153|4,120,87|5,120,85|16,150,110|#065f46|#047857|#ecfdf5|#a7f3d0/.test(l)), 'luật nút không có màu xanh lục');
  // mục chọn: nền sáng hơn nút thường, viền sáng hơn, chữ đậm
  const nv = /--hv:rgba\(255,255,255,\.(\d+)\);--sel-bg:rgba\(255,255,255,\.(\d+)\)/.exec(block);
  assert.ok(nv && +nv[2] > +nv[1], 'mục chọn sáng hơn mức di chuột');
  assert.ok(/\.tab\.is-active\{color:var\(--sel-fg\);border-color:var\(--sel-bd\);background-color:var\(--sel-bg\)\}/.test(block) && block.includes('font-size:12.5px;font-weight:700'), 'tab chữ 12,5 đậm, mục chọn giữ đậm');
  // select: option có nền/chữ theo token (không để popup trắng + chữ sáng); navy color-scheme dark
  assert.ok(block.includes('html.desktop select option,html.desktop select optgroup{background:var(--surface);color:var(--text)}'));
  assert.ok(/html\.desktop\[data-bg]{color-scheme:dark;/.test(block));
});

test('2.20.8 desktop: số liệu/icon một màu chữ chung (không xanh lục/xanh dương), hộp thoại có lề trong', () => {
  const block = deskBlock();
  // token màu số/icon đi theo màu chữ chính; navy không ghi đè lại thành xanh
  assert.ok(PAGE.includes('--brand-text:var(--text);--green-text:var(--text);--blue-text:var(--text)'));
  const nv = /html\.desktop\[data-bg]{([^}]*)\}/.exec(block)[1];
  assert.ok(!/--brand-text|--green-text|--blue-text/.test(nv), 'navy không đặt lại màu xanh cho số');
  // nút đỏ/số âm giữ nghĩa cảnh báo (--red-text không bị đổi)
  assert.ok(/--red-text:#FF7373/.test(nv) && !block.includes('--red-text:var(--text)'));
  // hộp thoại: thân có lề 16px, tờ ghi trong hộp thoại không thụt thêm → dòng phụ, tờ ghi, tham số cùng lề
  assert.ok(block.includes('html.desktop .dlg__card .card__body{padding:0 16px 16px}') && block.includes('html.desktop .note{margin:0;'), '.note margin 0 chung (cả trong hộp thoại)');
  assert.ok(!PAGE.slice(0, PAGE.indexOf('/* 2.23.0 chế độ desktop')).includes('padding:0 16px 16px'));
});

test('2.20.9 desktop: Thuốc chén có nửa phải danh sách đơn đã lưu (ẩn ngoài desktop, hook từ updatePresetUI, bấm dòng qua remedyPresetPick)', () => {
  assert.ok(PAGE.includes('id="remedyPresetBox"') && PAGE.includes('id="remedyPresetRows"') && PAGE.includes('id="remedyPresetPager"'));
  assert.ok(PAGE.includes('#remedyPresetBox,#remedyFindBox{display:none}') && PAGE.includes('html.desktop #remedyPresetBox{display:flex'));
  assert.match(PAGE, /function updatePresetUI\(\)\{[\s\S]*?renderPresetList\(\);\n\}/);
  assert.match(PAGE, /function pickPresetRow\(id\)\{[\s\S]*?remedyPresetPick\(\)/);
  assert.ok(PAGE.includes("case 'pick-preset': pickPresetRow(id)") && PAGE.includes("kind === 'rpre'"));
  assert.ok(PAGE.includes('id="remedyPreset"'), 'select giữ nguyên');
});

test('2.20.11 nút Mở thư mục sao lưu: ẩn mặc định, chỉ hiện khi có __TAURI__, gọi mo_thu_muc_sao_luu', () => {
  assert.match(PAGE, /data-action="open-backup-dir" hidden/);
  assert.ok(PAGE.includes("case 'open-backup-dir'") && PAGE.includes("invoke('mo_thu_muc_sao_luu')"));
  assert.ok(PAGE.includes("[data-action=\"open-backup-dir\"]'); if (obd && window.__TAURI__) obd.hidden = false"));
});

function bakEnv(fetchImpl) {
  const els = new Map();
  for (const id of ['bakList', 'bakPager', 'bakStat', 'bakRefresh']) { const e = makeEl(); e.appendChild = function(c){ e.children.push(c); return c; }; els.set(id, e); }
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null, documentElement: makeEl(), body: makeEl(),
    querySelector(sel) { const m = /^#([\w-]+)$/.exec(String(sel)); return m && els.has(m[1]) ? els.get(m[1]) : null; },
    querySelectorAll() { return []; },
    createElement(tag) { const e = makeEl(); e.attrs = {}; e.setAttribute = (k, v) => { e.attrs[k] = v; }; e.tagName = String(tag || '').toUpperCase(); e.appendChild = function(c){ e.children.push(c); return c; }; return e; },
    createElementNS() { return makeEl(); }, createTextNode(s) { return { textContent: String(s) }; },
    addEventListener() {}, removeEventListener() {}
  };
  return { els, client: loadClient({ document: doc, fetch: fetchImpl }) };
}
const bakFiles = n => Array.from({ length: n }, (_, i) => ({ name: 'backup-2026-11-' + String(30 - i).padStart(2, '0') + '.db', size: 524288 + i * 1000, modified: '2026-11-17T12:30:00.000Z' }));
const bakOk = list => async () => ({ ok: true, status: 200, json: async () => ({ success: true, keepDays: 30, count: list.length, backups: list }) });

test('2.22.0 Sao lưu: danh sách máy chủ 10 dòng/trang, phân trang, kích thước KB/MB', async () => {
  const { els, client } = bakEnv(bakOk(bakFiles(23)));
  await client.loadBakList();
  assert.equal(els.get('bakList').children.length, 10, 'trang 1 đủ 10 dòng');
  assert.equal(els.get('bakList').children[0].children[0].textContent, 'backup-2026-11-30.db');
  assert.match(els.get('bakPager').children[0].textContent, /Trang 1 \/ 3/);
  assert.equal(client.bakSizeText(2048), '2 KB');
  assert.equal(client.bakSizeText(5.5 * 1048576), '5,5 MB');
});

test('2.22.0 Sao lưu: lỗi tải (401/mạng) chỉ hiện một dòng báo, trống thì báo chưa có', async () => {
  let t = bakEnv(async () => ({ ok: false, status: 401, json: async () => ({}) }));
  await t.client.loadBakList();
  assert.equal(t.els.get('bakList').children.length, 1);
  assert.match(t.els.get('bakList').children[0].textContent, /^Không xem được danh sách bản sao lưu/);
  assert.equal(t.client.isAuthLost(), true, '401 phải gọi noteAuthLost');
  t = bakEnv(async () => ({ ok: false, status: 500, json: async () => ({}) }));
  await t.client.loadBakList();
  assert.equal(t.els.get('bakList').children[0].textContent, 'Không tải được danh sách');
  assert.equal(t.client.isAuthLost(), false, '5xx không phải mất duyệt');
  t = bakEnv(async () => { throw new Error('mạng'); });
  await t.client.loadBakList();
  assert.equal(t.els.get('bakList').children[0].textContent, 'Không tải được danh sách');
  t = bakEnv(bakOk([]));
  await t.client.loadBakList();
  assert.equal(t.els.get('bakList').children[0].textContent, 'Chưa có bản sao lưu trên máy chủ.');
});

test('2.22.3 Sao lưu: nhãn trước ghi đè, ẩn pager 1 trang, role list/listitem, ghi chú chỉ xem', async () => {
  const list = [{ name: 'backup-2026-11-17-truoc-ghi-de-123045678.db', size: 2048, modified: '2026-11-17T12:30:00.000Z' }, { name: 'backup-2026-11-17.db', size: 2048, modified: '2026-11-17T12:30:00.000Z' }];
  const { els, client } = bakEnv(bakOk(list));
  await client.loadBakList();
  const rows = els.get('bakList').children;
  assert.equal(rows[0].children[0].children.length, 1, 'có nhãn');
  assert.equal(rows[0].children[0].children[0].className, 'bak-row__tag');
  assert.equal(rows[1].children[0].children.length, 0, 'tên thường không nhãn');
  assert.equal(els.get('bakPager').children.length, 0, 'một trang: không pager');
  assert.ok(PAGE.includes('id="bakList" role="list">') && !PAGE.includes('id="bakList" role="list" aria-live'), 'aria-live không nằm trên list');
  assert.ok(PAGE.includes('id="bakStat" role="status"></p>') && !PAGE.includes('id="bakStat" role="status" aria-live'));
  assert.ok(PAGE.includes('Chỉ xem. Khôi phục: dừng máy chủ, chép đè data/app.db, xóa app.db-wal và app.db-shm nếu có, rồi khởi động lại (xem README).'));
  assert.equal(rows[0].attrs.role, 'listitem');
});

test('2.22.4 Sao lưu: dòng trạng thái role=none, bakStat báo số bản, lỗi vào bakStat', async () => {
  let t = bakEnv(bakOk(bakFiles(23)));
  await t.client.loadBakList();
  assert.equal(t.els.get('bakStat').textContent, 'Trang 1/3 — 10/23 bản');
  t = bakEnv(async () => { throw new Error('x'); });
  await t.client.loadBakList();
  assert.equal(t.els.get('bakStat').textContent, 'Không tải được danh sách');
  assert.equal(t.els.get('bakList').children[0].attrs.role, 'none');
});

test('2.22.4 Sao lưu: nút làm mới khóa khi tải, mở lại khi xong; hai request chồng nhau theo request sau', async () => {
  const ctl = [];
  const { els, client } = bakEnv(() => new Promise(res => ctl.push(res)));
  const btn = els.get('bakRefresh'), host = els.get('bakList');
  const cls = new Set(); host.classList = { add: c => cls.add(c), remove: c => cls.delete(c), contains: c => cls.has(c), toggle() {} };
  const mk = l => ({ ok: true, status: 200, json: async () => ({ success: true, backups: l }) });
  const p1 = client.loadBakList();
  assert.equal(btn.disabled, true); assert.ok(cls.has('bak-busy'));
  const p2 = client.loadBakList();
  ctl[1](mk(bakFiles(2))); await p2;
  assert.equal(btn.disabled, false); assert.equal(host.children.length, 2, 'danh sách theo request 2');
  ctl[0](mk(bakFiles(5))); await p1;
  assert.equal(host.children.length, 2, 'request 1 chậm không đè');
  assert.equal(btn.disabled, false); assert.ok(!cls.has('bak-busy'));
});

test('2.22.5 Sao lưu: 401 không đặt câu trùng toast vào bakStat; đổi trang cập nhật bakStat', async () => {
  let t = bakEnv(async () => ({ ok: false, status: 401, json: async () => ({}) }));
  await t.client.loadBakList();
  assert.equal(t.els.get('bakStat').textContent, '');
  assert.equal(t.els.get('bakList').children[0].textContent, 'Không xem được danh sách bản sao lưu');
  assert.ok(PAGE.includes("kind === 'bak') { bakPage = page; renderBakList(); }"), 'đổi trang gọi renderBakList (cập nhật bakStat)');
  t = bakEnv(bakOk(bakFiles(4)));
  await t.client.loadBakList();
  assert.equal(t.els.get('bakStat').textContent, 'Đã tải 4/4 bản');
});

test('2.22.0 Sao lưu: dòng thư mục ẩn mặc định, chỉ hiện trong Tauri; không có nút Chọn thư mục', () => {
  assert.match(PAGE, /<div class="bak-dir" hidden>/);
  assert.ok(PAGE.includes('if (obd && window.__TAURI__) obd.hidden = false, obd.parentNode.hidden = false;'));
  assert.ok(!PAGE.includes('Chọn thư mục'));
  assert.match(PAGE, /\.bak-dir\[hidden\]\{display:none\}/);
});

test('2.20.12 PWA standalone tự bật desktop (rộng >= 900, vừa 920); desktop=0 nhớ tắt', () => {
  assert.ok(PAGE.includes("setItem('desktop', '0')"));
  assert.ok(PAGE.includes("dk !== '0' && matchMedia('(display-mode: standalone)').matches && matchMedia('(pointer:fine)').matches && innerWidth >= 900"));
});

test('2.20.13 điện thoại html.pt: dùng chung token data-bg, chỉ màu/kính (không radius/size/backdrop mới), bộ chọn nền ở tab Sao lưu, manifest navy', () => {
  const a = PAGE.indexOf('/* 2.20.13 điện thoại'), b = PAGE.indexOf('</style>', a);
  const ph = PAGE.slice(a, b).replace(/html\.pt \.bgdots[^\n]*\n/g, ''); // 2.31.0: hai luật .bgdots của điện thoại (giá trị cũ) dời về lớp này vì desktop dùng bảng chấm riêng
  assert.ok(a > 0 && ph.includes('html.pt[data-bg]{--bg:#0A1433;--brand-text:var(--text)'));
  assert.ok(!/backdrop-filter|border-radius|font-size|font-weight|min-height|padding:|width:/.test(ph.replace(/\/\*[\s\S]*?\*\//g, '').replace('padding:0','')), 'lớp điện thoại không đổi hình dạng/kích cỡ');
  assert.ok(PAGE.includes('html:is(.desktop,.pt)[data-bg]{color-scheme:dark;') && PAGE.includes("classList.add('pt')") && PAGE.includes("document.querySelector('#backupBox .card__body')"));
  assert.ok(/\[\?&\]pt=0/.test(PAGE) && PAGE.includes('(pointer:coarse)'));
});

test('2.23.0 nền tối: chữ phụ (--muted) và chữ đỏ (--red-text) của MỖI theme đạt tương phản >= 4,5 trên c1/c2 trần và c1/c2 + 7% trắng', () => {
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  const L = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
  const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mixW = (c, t) => c.map(v => v * (1 - t) + 255 * t);
  const cr = (x, y) => (Math.max(L(x), L(y)) + .05) / (Math.min(L(x), L(y)) + .05);
  const rules = [...PAGE.matchAll(/\.bgd\[data-bg=(\w+)\]\{--bt:linear-gradient\(135deg,(#[0-9a-f]{6}),(#[0-9a-f]{6})\);--muted:rgba\(255,255,255,(\.\d+)\);--red-text:(#[0-9a-f]{6})\}/gi)];
  assert.equal(rules.length, 7, 'đủ 7 theme, mỗi theme có --muted và --red-text riêng');
  for (const [, k, c1, c2, al, red] of rules) for (const c of [hx(c1), hx(c2)]) for (const t of [0, .07]) {
    const bg = mixW(c, t);
    assert.ok(cr(hx(red), bg) >= 4.5, k + ' đỏ ' + cr(hx(red), bg).toFixed(2));
    assert.ok(cr(mixW(bg, +al), bg) >= 4.5, k + ' chữ phụ ' + cr(mixW(bg, +al), bg).toFixed(2));
  }
});

test('2.21.0 font: SF trước, Inter dự phòng nhúng woff2 nhỏ cùng nguồn; icon mới có symbol, stroke 1.75', () => {
  assert.match(PAGE, /font:15px\/1\.55 -apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Inter",system-ui,"Segoe UI",sans-serif/);
  assert.match(PAGE, /@font-face\{font-family:"Inter";[^}]*font-display:swap;src:url\(\/inter\.woff2\) format\("woff2"\)\}/);
  const f = fs.readFileSync(new URL('../src/inter-vi.woff2', import.meta.url));
  assert.equal(f.subarray(0, 4).toString(), 'wOF2');
  assert.ok(f.length < 60000, 'font nhỏ hơn 60KB: ' + f.length);
  assert.match(PAGE, /\.ico\{[^}]*stroke-width:1\.75/);
  for (const id of ['i-inbox', 'i-outbox', 'i-drive']) assert.ok(PAGE.includes('<symbol id="' + id + '"'), id);
});

/* ===== 2.21.1: soi ngoài 18/11 ===== */
function bakDoc(handlers, downloads) {
  const d = limitDoc({});
  d.addEventListener = (t, f) => { (handlers[t] = handlers[t] || []).push(f); };
  d.removeEventListener = (t, f) => { handlers[t] = (handlers[t] || []).filter(x => x !== f); };
  d.createElement = () => { const e = makeEl(); e.click = function () { if (this.download) downloads.push(this.download); }; return e; };
  d.createTextNode = (t) => ({ textContent: t });
  return d;
}

test('2.21.1 P1.1 restore: tải bản hiện tại, hỏi lại có thấy file; Hủy ở hỏi lần hai thì không ghi đè', () => {
  const raw = JSON.stringify({ app: 'quan-ly-kho', data: { products: [{ id: 'p1', name: 'Mới', stock: 1, costPrice: 85 }], transactions: [], prescriptions: [] } });
  const keep = { products: [{ id: 'keep', name: 'Giữ', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' };
  const run = (answers) => {
    const downloads = [], msgs = [];
    const c = loadClient({ document: bakDoc({}, downloads), Blob: class {}, FileReader: readerOf(raw), confirm: (m) => { msgs.push(m); return answers.shift(); },
      fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 2 }) }) });
    c.setDb(structuredClone(keep));
    c.restoreFromFile({ size: raw.length });
    return { c, downloads, msgs };
  };
  const no = run([true, false]);
  assert.equal(no.downloads.length, 1);
  assert.match(no.downloads[0], /^kho-backup-truoc-restore-/);
  assert.equal(no.msgs.length, 2);
  assert.ok(no.msgs[1].includes(no.downloads[0]), 'hỏi lần hai phải nêu đúng tên file vừa tải');
  assert.equal(no.c.getDb().products[0].name, 'Giữ');
  const yes = run([true, true]);
  assert.equal(yes.c.getDb().products[0].name, 'Mới');
});

test('2.21.1 P1.1 tự sao lưu ngày: chạy ngay trong cú bấm (không setTimeout), lời báo là "đã gửi lệnh tải"', () => {
  const handlers = {}, downloads = [], timers = [];
  const toastEl = makeEl(), msgEl = makeEl();
  const doc = bakDoc(handlers, downloads);
  doc.readyState = 'complete';
  doc.querySelector = (s) => s === '#toast' ? toastEl : s === '#toastMsg' ? msgEl : null;
  const store = new Map();
  const localStorage = { getItem: (k) => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem() {} };
  const c = loadClient({ document: doc, Blob: class {}, localStorage, setTimeout: (f) => { timers.push(f); return 0; }, setInterval() { return 0; }, clearInterval() {},
    fetch: async () => { throw new Error('offline'); } });
  c.getDb().products.push({ id: 'p1', name: 'A', stock: 1, costPrice: 1 });
  assert.equal(downloads.length, 0);
  assert.ok(handlers.click && handlers.click.length, 'firstUse nghe click (cử chỉ kích hoạt tải)');
  handlers.click[handlers.click.length - 1]({});
  assert.equal(downloads.length, 1, 'tải ngay trong cú bấm');
  assert.match(msgEl.textContent, /gửi lệnh tải/);
});

test('2.21.1 P2.2 delTx hoàn tác dòng NHAP (đơn có mates không cân được): tồn cộng lại đúng, không trừ hai lần', () => {
  const els = { '#toast': makeEl(), '#toastMsg': makeEl() };
  const c = loadClient({ document: limitDoc(els), confirm: () => true });
  const line = (id, type) => ({ id, date: '2026-11-08', type, productId: 'p1', qty: 1, price: 10, total: 10, cost: 100, oid: 'R1', oname: 'Đơn', rx: true, ts: 1 });
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 10, costPrice: 1 }], transactions: [line('n1', 'NHAP'), line('b1', 'BAN'), line('b2', 'BAN')], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' });
  c.delTx('n1');
  assert.equal(c.getDb().products[0].stock, 10);
  assert.deepEqual(c.getDb().transactions.map(t => t.id), ['n1', 'b1', 'b2']);
});

test('2.21.1 P2.1 menu dòng: scroll/resize (nhận Event) không refocus nút; Esc thì có', () => {
  const handlers = {}, winH = {}, els = [];
  const doc = bakDoc(handlers, []);
  doc.createElement = () => {
    const e = makeEl(); e.focused = 0; e.on = {};
    e.focus = () => { e.focused++; };
    e.addEventListener = (t, f) => { e.on[t] = f; };
    els.push(e); return e;
  };
  const c = loadClient({ document: doc, addEventListener: (t, f) => { winH[t] = f; }, innerWidth: 1000, innerHeight: 800 });
  const wrap = c.rowMenu([{ action: 'del-tx', id: 'x', icon: 'x', label: 'Xóa' }]);
  const b = wrap.children[0];
  b.on.click({ stopPropagation() {} });
  handlers.scroll[0]({ type: 'scroll' });
  assert.equal(b.focused, 0, 'scroll không được refocus');
  b.on.click({ stopPropagation() {} });
  winH.resize({ type: 'resize' });
  assert.equal(b.focused, 0, 'resize không được refocus');
  b.on.click({ stopPropagation() {} });
  handlers.keydown[0]({ key: 'Escape' });
  assert.equal(b.focused, 1, 'Esc trả focus về nút');
});

test('2.21.1 P2.3 openTxEdit dòng thuốc chén cũ thiếu g: hiện gram quy đổi qty*1000/thang, không phải 0', () => {
  const els = { '#txEditName': makeEl(), '#txEditQty': makeEl(), '#txEditPrice': makeEl(), '#txEditQtyLbl': makeEl(), '#txEditPriceField': makeEl(), '#txEditMeta': makeEl(), '#txEditTotal': makeEl(), '#txDlg': makeEl() };
  const c = loadClient({ document: limitDoc(els) });
  const base = { date: '2026-11-08', type: 'BAN', productId: 'p1', price: 10, total: 10, oid: 'R1', oname: 'Đơn', rx: true, ts: 1 };
  c.setDb({ products: [{ id: 'p1', name: 'Cam', stock: 10, costPrice: 1 }], prescriptions: [], updatedAt: 0, moneyUnit: 'dong',
    transactions: [{ ...base, id: 'old', qty: 0.03, thang: 3 }, { ...base, id: 'new', qty: 0.03, thang: 3, g: 10 }] });
  c.openTxEdit('old');
  assert.equal(els['#txEditQty'].value, '10');
  c.openTxEdit('new');
  assert.equal(els['#txEditQty'].value, '10');
});

test('2.21.5 restoreFromFile: authLost hoặc đang refreshing thì chặn, không confirm, không tải, không đổi dữ liệu', () => {
  const raw = JSON.stringify({ app: 'quan-ly-kho', data: { products: [{ id: 'p1', name: 'Mới', stock: 1, costPrice: 85 }], transactions: [], prescriptions: [] } });
  const keep = { products: [{ id: 'keep', name: 'Giữ', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' };
  for (const set of ['setAuthLost', 'setRefreshing']) {
    const downloads = [], msgEl = makeEl(); let asked = 0;
    const doc = bakDoc({}, downloads);
    doc.querySelector = (q) => q === '#toast' ? makeEl() : q === '#toastMsg' ? msgEl : null;
    const c = loadClient({ document: doc, Blob: class {}, FileReader: readerOf(raw), confirm: () => { asked++; return true; },
      fetch: async () => ({ status: 200, json: async () => ({ success: true, updatedAt: 2 }) }) });
    c.setDb(structuredClone(keep));
    c[set](true);
    c.restoreFromFile({ size: raw.length });
    assert.equal(asked, 0, set);
    assert.equal(downloads.length, 0, set);
    assert.equal(c.getDb().products[0].name, 'Giữ', set);
    assert.ok(msgEl.textContent, set + ' phải có toast lý do');
  }
});

test('2.21.5 firstUse: cử chỉ đầu là nút khôi phục thì KHÔNG tự sao lưu và giữ listener; cử chỉ khác thì có', () => {
  const handlers = {}, downloads = [];
  const doc = bakDoc(handlers, downloads);
  doc.readyState = 'complete';
  const store = new Map();
  const localStorage = { getItem: (k) => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem() {} };
  const c = loadClient({ document: doc, Blob: class {}, localStorage, setTimeout: () => 0, setInterval() { return 0; }, clearInterval() {}, fetch: async () => { throw new Error('offline'); } });
  c.getDb().products.push({ id: 'p1', name: 'A', stock: 1, costPrice: 1 });
  const fire = (target) => handlers.click[handlers.click.length - 1]({ target });
  fire({ closest: (q) => q === '[data-action=restore-file]' ? {} : null });
  assert.equal(downloads.length, 0, 'bấm nút khôi phục không được tự tải');
  assert.ok(handlers.click.length, 'listener còn');
  fire({ closest: () => null });
  assert.equal(downloads.length, 1);
});

test('2.21.5 tài liệu *.md không chứa ký tự điều khiển (vd \b, \a do gõ \ trong đường dẫn)', () => {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === 'node_modules' || e.name === '.git') continue; const q = d + '/' + e.name; if (e.isDirectory()) walk(q); else if (e.name.endsWith('.md')) files.push(q); } };
  walk(root);
  for (const f of files) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/, f);
});

test('2.22.2 kính một token --pnl: thẻ/4 ô/tab/Sao lưu cùng độ sáng tờ ghi trên nền tối; button/input kế thừa font', () => {
  const css = PAGE;
  const dark = css.split('\n').filter(l => l.startsWith('html:is(.desktop,.pt)[data-bg]'));
  const root = dark.filter(l => l.startsWith('html:is(.desktop,.pt)[data-bg]{')).join(' ');
  assert.ok(/--glass:rgba\(255,255,255,\.07\);--pnl:rgba\(255,255,255,\.07\)/.test(root), 'thẻ và --pnl cùng .07');
  assert.ok(/\.bak-sec\{[^}]*var\(--pnl,/.test(css), 'bak-sec dùng token');
  assert.ok(css.includes('button,input,select,textarea{font-family:inherit}'), 'ô nhập/nút kế thừa font');
});

test('2.23.0 công tắc Hiệu ứng kính: mặc định TẮT, khóa kho_glass_v2 (khóa/giá trị cũ không bật), bấm bật/tắt lưu lại', () => {
  let r = runHead();
  assert.ok(!r.cls.has('glass') && !('kho_glass_v2' in r.store), 'mặc định tắt, chưa ghi khóa');
  const sw = r.body.children[0].children.find(c => c.className === 'glsw');
  assert.ok(sw && sw.role === 'switch' && sw['aria-checked'] === 'false' && sw.textContent === 'Hiệu ứng kính');
  sw.onclick();
  assert.ok(r.cls.has('glass') && r.store.kho_glass_v2 === '1' && sw['aria-checked'] === 'true');
  sw.onclick();
  assert.ok(!r.cls.has('glass') && r.store.kho_glass_v2 === '0' && sw['aria-checked'] === 'false');
  assert.ok(runHead({ ls: { kho_glass_v2: '1' } }).cls.has('glass'), 'đã bật thì nhớ');
  for (const old of [{ glass: '1' }, { kho_glass: '1' }, { kho_glass_v2: '0' }, { kho_glass_v2: 'true' }]) assert.ok(!runHead({ ls: old }).cls.has('glass'), JSON.stringify(old));
  const head = PAGE.slice(0, PAGE.indexOf('</style>'));
  assert.ok(head.includes(':root{') && /--blur:none;--blurb:none;/.test(head));
});

test('2.24.0 chartTicks: vạch đẹp 4-5 vạch, số nguyên, đỉnh >= giá trị lớn nhất', () => {
  const c = loadClient();
  assert.deepEqual(Array.from(c.chartTicks(5600)), [0, 2000, 4000, 6000]);
  assert.deepEqual(Array.from(c.chartTicks(2000)), [0, 500, 1000, 1500, 2000]);
  assert.deepEqual(Array.from(c.chartTicks(0)), [0, 1]);
  assert.deepEqual(Array.from(c.chartTicks(8340)), [0, 2500, 5000, 7500, 10000]);
  for (const v of [1, 7, 99, 1234, 87654, 4100000, 9e9]) {
    const t = c.chartTicks(v);
    assert.ok(t.length >= 2 && t.length <= 5, 'số vạch ' + v + ': ' + t.length);
    assert.ok(t[t.length - 1] >= v && t.every(Number.isInteger), 'đỉnh/nguyên ' + v);
  }
});

function deskChart(today, txs, hoverX) {
  const calls = [];
  const ctx = new Proxy({}, { get: (t, k) => (k in t ? t[k] : (...a) => { calls.push([k, a, t.fillStyle]); return { width: 0 }; }), set: (t, k, v) => { t[k] = v; return true; } });
  const mk = () => ({ value: '', textContent: '', style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k] || null; }, classList: { add() {}, remove() {}, contains() { return false; } }, focus() {}, select() {} });
  const cv = { offsetParent: {}, offsetLeft: 0, offsetTop: 0, clientWidth: 970, clientHeight: 400, parentNode: { clientWidth: 970 }, width: 0, height: 0, getContext: () => ctx, getBoundingClientRect: () => ({ left: 0, top: 0, width: 970, height: 400 }) };
  const els = { '#syncLine': mk(), '#statsChart': cv, '#chartYear': mk(), '#chartMonth': mk(), '#chartImpChip': mk(), '#chartExpChip': mk(), '#chartImpVal': mk(), '#chartExpVal': mk(), '#chartTipSr': mk(), '#chartTip': mk(), '#chartYrL': mk(), '#chartPrev': mk(), '#chartNext': mk() };
  const FakeDate = fakeClock(...today);
  const R = makeEl(); R.classList = { contains: k => k === 'desktop', add() {}, remove() {}, toggle() {} };
  const doc = { readyState: 'loading', hidden: false, activeElement: null, documentElement: R, body: makeEl(), querySelector(s) { return els[s] || null; }, querySelectorAll() { return []; }, createElement() { return makeEl(); }, createElementNS() { return makeEl(); }, addEventListener() {}, removeEventListener() {} };
  const c = loadClient({ document: doc, Date: FakeDate, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH, getComputedStyle: () => ({ getPropertyValue: k => (k === '--chart-imp' ? '#44DAFE' : k === '--chart-exp' ? '#FFA33D' : '') }) });
  c.setDb({ products: [{ id: 'p1', name: 'A', stock: 9, costPrice: 1 }], prescriptions: [], updatedAt: 0, moneyUnit: 'dong', transactions: txs });
  c.renderChart();
  if (hoverX != null) { c.onChartMove({ type: 'mousemove', clientX: hoverX, clientY: 100 }); }
  return { c, calls, els };
}
const DESK_TX = [
  { id: 'a', date: '2025-12-03', type: 'NHAP', productId: 'p1', qty: 1, price: 1, total: 4000000 },
  { id: 'b', date: '2025-12-20', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 1500000, cost: 1000000 },
  { id: 'c', date: '2025-11-30', type: 'NHAP', productId: 'p1', qty: 1, price: 1, total: 9000000 },
  { id: 'd', date: '2026-11-18', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 2300000, cost: 1500000 },
  { id: 'e', date: '2026-12-01', type: 'BAN', productId: 'p1', qty: 1, price: 1, total: 7000000, cost: 1 }
];

test('2.25.0 chartMonths(Y) = Y-01..Y-12; chartYearStep kẹp 2000..2100', () => {
  const c = loadClient(), m = c.chartMonths(2025);
  assert.equal(m.length, 12); assert.equal(m[0], '2025-01'); assert.equal(m[11], '2025-12');
  const st = c.chartYearStep;
  assert.equal(st(2026, -1), 2025); assert.equal(st(2026, 1), 2027);
  assert.equal(st(2000, -1), 2000, 'chặn ở 2000'); assert.equal(st(2100, 1), 2100, 'chặn ở 2100');
});

test('2.25.0 desktop: mặc định = năm hiện tại, 12 nhóm 01..12, trục Y phải số đầy đủ, màu cột, không chú giải đáy, giao dịch năm khác không lẫn', () => {
  const { c, calls, els } = deskChart([2026, 10, 18, 12], DESK_TX);
  assert.equal(c.getChartYr(), 2026); assert.equal(typeof c.getChartYr(), 'number');
  const d = c.chartData();
  assert.equal(d.yms[0], '2026-01'); assert.equal(d.yms[11], '2026-12');
  assert.equal(d.expK[10], 2300000); assert.equal(d.expK[11], 7000000);
  assert.equal(d.impK.reduce((x, y) => x + y, 0), 0, 'NHAP 2025 không lẫn vào 2026');
  assert.equal(d.expK.reduce((x, y) => x + y, 0), 9300000, 'BAN 2025 không lẫn');
  const texts = calls.filter(x => x[0] === 'fillText').map(x => x[1][0]);
  assert.deepEqual(Array.from(texts.filter(t => /^\d\d$/.test(t))), ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']);
  assert.ok(!texts.some(t => /^\d\d-\d\d$/.test(t)), 'không còn nhãn yy-MM');
  assert.deepEqual(Array.from(texts.filter(t => t === '0' || /^\d\.\d{3}$/.test(t))), ['0', '2.000', '4.000', '6.000', '8.000']);
  assert.ok(!texts.some(t => /tỷ|triệu|Nhập|Bán/.test(t)), 'không viết tắt, không chú giải ở đáy biểu đồ');
  assert.equal(calls.filter(x => x[0] === 'quadraticCurveTo').length, 4, 'chỉ 2 cột có dữ liệu, mỗi cột 2 góc trên');
  assert.equal(els['#chartYrL'].textContent, 2026);
  c.setChartYr(2025); c.renderChart();
  const barFills = new Set(calls.filter(x => x[0] === 'fill').map(x => x[2]));
  assert.ok(barFills.has('#44DAFE') && barFills.has('#FFA33D'), 'Nhập cyan, Bán cam');
});

test('2.25.0 chip dưới hàng 4 số: chưa trỏ = --/---- và —; trỏ tháng = MM/yyyy + số; rời chuột về trống; có vạch dọc .25; bấm = ghim', () => {
  const r0 = deskChart([2026, 10, 18, 12], DESK_TX);
  assert.equal(r0.els['#chartMonth'].textContent, '--/----'); assert.equal(r0.els['#chartImpVal'].textContent, '—'); assert.equal(r0.els['#chartExpVal'].textContent, '—');
  assert.ok(!r0.calls.some(x => x[0] === 'fillRect' && x[2] === 'rgba(255,255,255,.25)'), 'chưa trỏ: không vạch');
  const { c, calls, els } = deskChart([2026, 10, 18, 12], DESK_TX, 830);
  assert.equal(els['#chartMonth'].textContent, '11/2026');
  assert.equal(els['#chartImpVal'].textContent, c.fmtMoneyInt(0)); assert.equal(els['#chartExpVal'].textContent, c.fmtMoneyInt(2300000));
  assert.ok(calls.some(x => x[0] === 'fillRect' && x[2] === 'rgba(255,255,255,.25)'), 'có vạch dọc');
  c.onChartMove({ type: 'mouseleave' });
  assert.equal(els['#chartMonth'].textContent, '--/----'); assert.equal(els['#chartImpVal'].textContent, '—'); assert.equal(els['#chartExpVal'].textContent, '—');
  c.setChartYr(2025); c.onChartMove({ type: 'mousemove', clientX: 910, clientY: 100 });
  assert.equal(els['#chartMonth'].textContent, '12/2025');
  assert.equal(els['#chartImpVal'].textContent, c.fmtMoneyInt(4000000)); assert.equal(els['#chartExpVal'].textContent, c.fmtMoneyInt(1500000));
  c.onChartClick({ clientX: 910, clientY: 100 });
  c.onChartMove({ type: 'mouseleave' });
  assert.equal(els['#chartMonth'].textContent, '12/2025', 'đã ghim thì rời chuột vẫn giữ');
  c.onChartClick({ clientX: 910, clientY: 100 });
  assert.equal(els['#chartMonth'].textContent, '--/----', 'bấm lần nữa bỏ ghim');
});

test('2.25.0 bộ chọn năm: nhãn là số, ‹ vô hiệu ở 2000, › vô hiệu ở 2100, đổi năm đổi dữ liệu; mở lại tab về năm hiện tại', () => {
  const { c, els } = deskChart([2026, 10, 18, 12], DESK_TX);
  assert.equal(els['#chartPrev'].disabled, false); assert.equal(els['#chartNext'].disabled, false);
  c.chartYearGo(-1);
  assert.equal(c.getChartYr(), 2025); assert.equal(els['#chartYrL'].textContent, 2025);
  const d = c.chartData(); assert.equal(d.impK[11], 4000000); assert.equal(d.impK[10], 9000000); assert.equal(d.expK[11], 1500000);
  c.setChartYr(2001); c.chartYearGo(-1); assert.equal(els['#chartPrev'].disabled, true, 'vô hiệu ở 2000');
  c.chartYearGo(-1); assert.equal(c.getChartYr(), 2000);
  c.setChartYr(2099); c.chartYearGo(1); assert.equal(els['#chartNext'].disabled, true, 'vô hiệu ở 2100');
  c.chartYearGo(1); assert.equal(c.getChartYr(), 2100);
  const empty = c.chartData(); assert.equal(empty.impK.concat(empty.expK).reduce((x, y) => x + y, 0), 0, 'năm trống vẫn 12 nhóm');
  assert.ok(/if \(cb\.open\) \{ chartYr = Number\(thisYear\(\)\);/.test(PAGE), 'mở tab Thống kê về năm hiện tại');
  assert.ok(/id="chartPrev" aria-label="Năm trước"/.test(PAGE) && /id="chartNext" aria-label="Năm sau"/.test(PAGE));
  assert.ok(!PAGE.includes('12 tháng gần nhất') && !/chartYr = null/.test(PAGE), 'đã bỏ chế độ 12 tháng gần nhất');
});

test('2.25.0 dòng đồng bộ thanh bên (#syncLine): ổn có giờ, mất mạng, bị từ chối; chấm đỏ khi lỗi, xanh khi ổn', () => {
  const { c, els } = deskChart([2026, 10, 18, 12], []);
  const L = els['#syncLine'];
  c.renderSyncLine(); assert.equal(L.textContent, 'Đang kết nối…'); assert.equal(L.attrs['data-st'], 'ok');
  c.setLastSyncOk(new Date(2026, 10, 18, 9, 5).getTime()); c.renderSyncLine();
  assert.equal(L.textContent, 'Đã đồng bộ 09:05'); assert.equal(L.attrs['data-st'], 'ok');
  c.noteSyncFailure('x', true, true);
  assert.equal(L.textContent, 'Mất kết nối — đang thử lại…'); assert.equal(L.attrs['data-st'], 'err');
  c.noteSyncFailure('x', false);
  assert.equal(L.textContent, 'Chưa lưu được'); assert.equal(L.attrs['data-st'], 'err');
  c.noteSyncFailure('x', true);
  assert.equal(L.textContent, 'Chưa lưu được', '5xx không phải mất mạng');
  c.setSyncErrorShown(false); c.renderSyncLine();
  assert.equal(L.textContent, 'Đã đồng bộ 09:05'); assert.equal(L.attrs['data-st'], 'ok');
  assert.ok(/\.sbs\[data-st=err\]::before\{[^}]*background:#FF5F57\}/.test(PAGE) && /\.sbs::before\{[^}]*width:7px;height:7px/.test(PAGE));
});

test('2.25.1 #syncLine: dirty quá hạn không lỗi → Chưa đồng bộ; hết dirty → Đã đồng bộ; syncNet ưu tiên hơn', () => {
  const { c, els } = deskChart([2026, 10, 18, 12], []);
  const L = els['#syncLine'];
  c.setLastSyncOk(new Date(2026, 10, 18, 9, 5).getTime());
  c.setDirty(true); c.setDirtySince(1); c.renderSyncLine();
  assert.equal(L.textContent, 'Chưa đồng bộ'); assert.equal(L.attrs['data-st'], 'err');
  c.noteSyncFailure('x', true, true);
  assert.equal(L.textContent, 'Mất kết nối — đang thử lại…');
  c.setSyncErrorShown(false); c.setDirty(false); c.setDirtySince(0); c.renderSyncLine();
  assert.equal(L.textContent, 'Đã đồng bộ 09:05'); assert.equal(L.attrs['data-st'], 'ok');
});

test('2.28.0 thanh bên: chân chỉ còn Nền + dòng đồng bộ + công tắc kính (không Tải lại/Thoát); logo và chữ Quản Lý Kho = reload-app, title "Tải lại"; điện thoại không dựng gì', () => {
  const mk = () => ({ children: [], style: {}, setAttribute(k, v) { this[k] = v; }, getAttribute(k) { return this[k]; }, appendChild(c) { this.children.push(c); return c; } });
  const els = { brandBtn: mk(), brandLogo: mk() };
  const out = runHead({ tauri: true, els }), box = out.body.children[0];
  assert.deepEqual(box.children.map(x => x.className), ['sbr', 'glsw'], 'chân: hàng (đồng bộ + nút bảng màu), công tắc kính');
  assert.deepEqual(box.children[0].children.map(x => x.className), ['sbs', 'btn btn--icon sbp', 'bgdots'], '2.31.0: dòng đồng bộ, nút bảng màu ở phải, bảng 7 chấm');
  assert.ok(box.children[0].children.some(x => x.id === 'syncLine'));
  assert.ok(!box.children.some(x => x.className === 'bgdots'), '2.31.0: không còn hàng 7 chấm/chữ Nền ở chân');
  assert.ok(!box.children.some(x => x.className === 'sbb'), 'không còn hàng nút Tải lại/Thoát');
  for (const k of ['brandBtn', 'brandLogo']) { assert.equal(els[k]['data-action'], 'reload-app', k); assert.equal(els[k].title, 'Tải lại', k); }
  assert.ok(!PAGE.includes("'exit-app'") && !PAGE.includes('exitAppClick') && !PAGE.includes("textContent = 'Thoát'"), 'không còn Thoát/exit-app');
  const els2 = { brandBtn: mk(), brandLogo: mk() };
  assert.equal(runHead({ desktop: false, els: els2 }).body.children.length, 0, 'iPhone/pt: không dựng chân thanh bên');
  assert.equal(els2.brandBtn['data-action'], undefined, 'điện thoại giữ brand-devices');
  assert.ok(deskBlock().includes('html.desktop .brand{font-size:13px;font-weight:700;min-height:28px}') && deskBlock().includes('html.desktop .brand__yin{cursor:pointer}'), 'brand cao >= 28, con trỏ tay');
});

/* ===== 2.26.0 Thuốc chén desktop: ô "Tìm đơn đã lưu", ✕ bỏ đơn, dòng đang gõ trong tờ ghi ===== */
function findKit(presets, extra = {}) {
  const attrs = (e) => { e.attrs = {}; e.setAttribute = (k, v) => { e.attrs[k] = String(v); }; e.getAttribute = (k) => (k in e.attrs ? e.attrs[k] : null); return e; };
  const list = attrs(makeEl()); list.querySelectorAll = () => list.children; list.hidden = true;
  Object.defineProperty(list, 'textContent', { get() { return ''; }, set() { list.children.length = 0; } });
  const els = {
    '#remedyFind': attrs(makeEl()), '#remedyFindList': list, '#remedyPreset': makeEl(), '#remedySearch': makeEl(), '#remedyName': makeEl(), '#remedyBody': makeEl(),
    '#remedyThang': makeEl(), '#remedyUnitPrice': makeEl(), '#remedyFindBox': makeEl(), '#remedyOpenName': makeEl(), '#remedyDelPreset': makeEl(), '#toast': makeEl(), '#toastMsg': makeEl()
  };
  const doc = trackDoc(els);
  doc.documentElement.classList.contains = (k) => k === 'desktop';
  doc.createElement = () => attrs(makeEl());
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH, ...extra });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], prescriptions: presets, updatedAt: 1, moneyUnit: 'dong' });
  c.setBase(1);
  const names = () => list.children.map(x => x.children[0].textContent);
  const type = (v) => { els['#remedyFind'].value = v; c.presetFindOpen(); };
  return { c, els, doc, list, names, type };
}
const FIND_RX = [
  { id: 'RX1', name: 'Nguyễn Thị Nga - Đơn Ông Phi', items: [{ productId: 'p1', grams: 46 }], total: 300000, thang: 3 },
  { id: 'RX2', name: 'Bạn Nga', items: [{ productId: 'p1', grams: 45 }], total: 100000, thang: 1 },
  { id: 'RX3', name: 'Đỗ Lan', items: [], total: 0, thang: 1 },
  { id: 'RX4', name: 'Anh Hùng', items: [{ productId: 'p1', grams: 47 }], total: 200000, thang: 2 }
];

test('2.26.0 Tìm đơn đã lưu: khớp trọn từ/cụm từ, không dấu/có dấu/đ; "nga" ra 2 đơn, "ng" không ra và không thả xuống', () => {
  const k = findKit(FIND_RX);
  k.type('nga');
  assert.deepEqual(k.names(), ['Bạn Nga', 'Nguyễn Thị Nga - Đơn Ông Phi'], 'sắp theo tên');
  assert.equal(k.list.hidden, false);
  assert.equal(k.list.children[0].children[1].textContent, '45 g', 'tổng gram mờ bên phải');
  k.type('ng');
  assert.equal(k.list.children.length, 0);
  assert.equal(k.list.hidden, true, 'không có kết quả thì không thả xuống');
  k.type('do lan'); assert.deepEqual(k.names(), ['Đỗ Lan'], 'đ = d, cụm từ');
  k.type('ĐỖ'); assert.deepEqual(k.names(), ['Đỗ Lan']);
  k.type('thi nga'); assert.deepEqual(k.names(), ['Nguyễn Thị Nga - Đơn Ông Phi'], 'cụm từ liên tiếp');
  k.type('  '); assert.equal(k.list.hidden, true, 'ô trống thì đóng');
});

test('2.26.0 Tìm đơn đã lưu: ↑/↓ xoay vòng, Enter chọn dòng sáng (chưa sáng = dòng đầu), chọn xong nạp đơn, xóa ô tìm, trỏ về Tìm vị thuốc; Esc xóa ô', () => {
  const k = findKit(FIND_RX);
  const key = (name) => { let prevented = false; k.c.presetFindKey({ key: name, preventDefault() { prevented = true; } }); return prevented; };
  const sel = () => k.list.children.findIndex(x => x.attrs['aria-selected'] === 'true');
  k.type('nga');
  key('ArrowDown'); assert.equal(sel(), 0);
  key('ArrowDown'); assert.equal(sel(), 1);
  key('ArrowDown'); assert.equal(sel(), 0, 'xoay vòng xuống');
  key('ArrowUp'); assert.equal(sel(), 1, 'xoay vòng lên');
  key('Escape');
  assert.equal(k.els['#remedyFind'].value, '', 'Esc xóa ô');
  assert.equal(k.list.hidden, true);
  k.type('nga');
  assert.equal(key('Enter'), true);
  assert.equal(k.els['#remedyPreset'].value, 'RX2', 'chưa có dòng sáng: chọn dòng đầu (Bạn Nga)');
  assert.equal(k.els['#remedyThang'].value, '1');
  assert.equal(k.els['#remedyFind'].value, '', 'xóa ô tìm sau khi chọn');
  assert.equal(k.list.hidden, true);
  assert.equal(k.doc.activeElement, k.els['#remedySearch'], 'trỏ về ô Tìm vị thuốc');
  assert.equal(k.c.getRemedyItems().length, 1);
  k.type('nga'); key('ArrowDown'); key('ArrowDown'); key('Enter');
  assert.equal(k.els['#remedyPreset'].value, 'RX1', 'dòng thứ 2 đang sáng');
  assert.equal(k.els['#remedyThang'].value, '3');
  assert.equal(k.els['#remedyOpenName'].textContent, 'Nguyễn Thị Nga - Đơn Ông Phi', 'ô phải hiện tên đơn đang mở');
  k.type('zzz');
  assert.equal(key('Enter'), false, 'không có kết quả: Enter không làm gì');
  assert.equal(k.els['#remedyPreset'].value, 'RX1');
});

test('2.26.0 ✕ bỏ đơn đang mở: tờ ghi về trống, giá/thang về mặc định, trỏ về Tìm vị thuốc; không đụng danh sách đơn đã lưu', () => {
  const k = findKit(FIND_RX);
  k.c.pickPresetRow('RX1');
  assert.equal(k.c.getRemedyItems().length, 1);
  const before = JSON.stringify(k.c.getDb().prescriptions);
  k.doc.activeElement = null;
  k.c.closePreset();
  assert.equal(k.els['#remedyPreset'].value, '');
  assert.equal(k.c.getRemedyItems().length, 0);
  assert.equal(k.els['#remedyThang'].value, '1');
  assert.equal(k.els['#remedyUnitPrice'].value, '');
  assert.equal(k.els['#remedyOpenName'].textContent, '');
  assert.equal(k.doc.activeElement, k.els['#remedySearch']);
  assert.equal(JSON.stringify(k.c.getDb().prescriptions), before, 'không xóa/sửa đơn đã lưu');
});

test('2.26.0 tờ ghi desktop: dòng đang gõ là dòng n+1, đủ 10 dòng thì sang trang mới; thứ tự dòng ghi, dòng gõ, dòng trống; điện thoại không đổi', () => {
  const mk = (desk) => {
    const tb = makeEl(), fill = makeEl(), pend = makeEl(), pg = makeEl();
    const els = { '#remedyNoteBody': tb, '#remedyFill': fill, '#remedyBody': pend, '#remedyNotePg': pg };
    const doc = trackDoc(els);
    doc.documentElement.classList.contains = (k) => desk && k === 'desktop';
    doc.createTextNode = () => makeEl();
    for (const e of [tb, fill]) Object.defineProperty(e, 'textContent', { get() { return ''; }, set() { e.children.length = 0; } });
    const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
    c.setDb({ products: [{ id: 'p1', name: 'A', stock: 1, costPrice: 1 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
    return { c, tb, fill, pend, pg };
  };
  const rows = (n) => Array.from({ length: n }, () => ({ productId: 'p1', grams: 5 }));
  const d = mk(true);
  d.c.setRemedyItems(rows(3));
  d.c.setRemedyNotePage(1);
  d.c.renderRemedyNote();
  assert.equal(d.tb.children.length, 3, 'dòng ghi');
  assert.equal(d.fill.children.length, 6, '10 - 3 dòng ghi - 1 dòng đang gõ');
  assert.equal(d.pend.hidden, false, 'dòng đang gõ hiện ở trang chứa nó');
  assert.equal(d.pg.textContent, 'Trang 1 / 1');
  d.c.setRemedyItems(rows(10));
  d.c.setRemedyNotePage(1);
  d.c.renderRemedyNote();
  assert.equal(d.pg.textContent, 'Trang 1 / 2', 'đủ 10 dòng: dòng đang gõ sang trang 2');
  assert.equal(d.tb.children.length, 10);
  assert.equal(d.fill.children.length, 0);
  assert.equal(d.pend.hidden, true, 'trang 1 không chứa dòng đang gõ');
  d.c.setRemedyNotePage(1e9);
  d.c.renderRemedyNote();
  assert.equal(d.pg.textContent, 'Trang 2 / 2', 'nhảy tới trang chứa dòng đang gõ');
  assert.equal(d.tb.children.length, 0);
  assert.equal(d.fill.children.length, 9, 'trang 2: dòng đang gõ + 9 dòng trống');
  assert.equal(d.pend.hidden, false);
  const m = mk(false);
  m.c.setRemedyItems(rows(10));
  m.c.setRemedyNotePage(1);
  m.c.renderRemedyNote();
  assert.equal(m.pg.textContent, 'Trang 1 / 1', 'điện thoại/PWA hẹp: số trang như cũ');
  assert.equal(m.fill.children.length, 0);
  assert.equal(m.pend.hidden, false);
});

test('2.26.0 gợi ý số lượng: desktop viết "lạng", điện thoại giữ "l"; placeholder Gram chỉ desktop', () => {
  const mk = (desk) => { const doc = trackDoc({}); doc.documentElement.classList.contains = (k) => desk && k === 'desktop'; return loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH }); };
  assert.equal(mk(true).qtyHintText('450', 'g'), '(4,5 lạng)');
  assert.equal(mk(false).qtyHintText('450', 'g'), '(4,5 l)');
  assert.ok(PAGE.includes("qi.placeholder = isDesk() ? (isRetail ? 'SL' : 'Gram') : '0'"));
});

test('2.26.0 cấu trúc: hàng A chỉ 2 ô + ngày ở desktop, #remedyPreset ẩn (không xóa) và còn cho điện thoại; ô tìm đơn ẩn ngoài desktop; không ô tên ở thanh đầu', () => {
  const bar = PAGE.match(/<div class="card__bar">[\s\S]*?<div class="note" id="remedyNote">/)[0];
  assert.match(bar, /id="remedyPreset"/);
  assert.match(bar, /id="remedyFind"[^>]*placeholder="Tìm đơn đã lưu"/);
  assert.doesNotMatch(bar, /id="remedyName"|id="remedySearch"/, 'ô tên đơn không đặt ở thanh đầu');
  assert.ok(PAGE.includes('#remedyPresetBox,#remedyFindBox{display:none}'), 'ngoài desktop ô tìm đơn ẩn');
  const block = PAGE.slice(PAGE.indexOf('/* 2.23.0 chế độ desktop'));
  assert.ok(block.includes('html.desktop #remedyPreset{display:none}') && block.includes('html.desktop #remedyFindBox{position:relative;display:flex'));
  assert.ok(block.includes('html.desktop #remedyBox .card__bar{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}'), 'hai nửa bằng nhau');
  assert.ok(block.includes('html.desktop #remedyFindList{top:38px;max-height:182px}') && block.includes('html.desktop #remedyFindList .sug__item{height:36px}'), 'thả xuống lệch 38, 5 dòng x 36');
  assert.ok(block.includes('html.desktop #remedyList{top:30px;right:auto;width:380px}'), 'gợi ý vị thuốc lệch 30, rộng 380');
  assert.ok(block.includes('html.desktop #remedyBody input.inp.inp--num{width:52px}'), 'ô Gram rộng 52');
  assert.ok(block.includes('html.desktop #remedyNote #remedyThang{width:44px}') && block.includes('html.desktop #remedyNote #remedyUnitPrice{width:58px}'), 'chân tờ ghi: ô thang 44, ô giá 58');
  assert.match(PAGE, /html:not\(\.desktop\) #remedyNote>\.note__list>table:has\(#remedyNoteBody:empty\)>thead\{display:none\}/, 'luật ẩn thead khi rỗng chỉ cho điện thoại');
  assert.ok(!PAGE.includes("rs.placeholder =") && PAGE.includes('placeholder="Nhập tên" aria-label="Tìm vị thuốc cho đơn thuốc chén"'), 'Thuốc chén: ô tìm tên là Nhập tên, JS không đổi chữ');
  assert.ok(PAGE.includes("window.prompt(isDesk() ? 'Tên đơn mới' : 'Tên đơn', '')") && PAGE.includes('if (isDesk() || (window.matchMedia'), 'Lưu đơn chưa có tên: desktop hỏi bằng hộp thoại, không mở ô tên');
});

/* ===== 2.26.1 Thuốc chén desktop: nút "Đơn mới", dòng đang gõ đủ ô, ⋯ trong thẻ; Bán lẻ/Nhập hàng: nút "Xóa hết" ===== */
const act = (name) => ({ getAttribute: (k) => (k === 'data-action' ? name : null) });
function confirmSpy(ans) { const log = []; return { log, fn: (m) => { log.push(m); return ans; } }; }

test('2.26.1 Đơn mới: đang mở đơn có sẵn thì về tờ ghi trống ngay, không hỏi', () => {
  const sp = confirmSpy(false);
  const k = findKit(FIND_RX, { confirm: sp.fn });
  k.c.pickPresetRow('RX1');
  assert.equal(k.c.getRemedyItems().length, 1);
  k.doc.activeElement = null;
  k.c.handleAction(act('new-remedy'));
  assert.deepEqual(sp.log, [], 'không hỏi');
  assert.equal(k.els['#remedyPreset'].value, '');
  assert.equal(k.c.getRemedyItems().length, 0);
  assert.equal(k.doc.activeElement, k.els['#remedySearch']);
});

test('2.28.0 Đơn mới: một tác dụng, KHÔNG hỏi: bỏ dòng đang ghi/ô tìm/ô tìm đơn, thang/giá về mặc định, trang đơn đã lưu về 1, trỏ về Tìm vị thuốc; không xóa đơn đã lưu', () => {
  const sp = confirmSpy(false);
  const rows = [{ productId: 'p1', grams: 5 }, { productId: 'p1', grams: 7 }];
  const b = findKit(FIND_RX, { confirm: sp.fn });
  b.c.setRemedyItems(rows.slice()); b.c.setPresetPage(3);
  b.els['#remedySearch'].value = 'cam'; b.els['#remedyThang'].value = '4'; b.els['#remedyUnitPrice'].value = '90'; b.els['#remedyFind'].value = 'ab';
  b.doc.activeElement = null;
  b.c.handleAction(act('new-remedy'));
  assert.deepEqual(sp.log, [], 'không hỏi xác nhận');
  assert.equal(b.c.getRemedyItems().length, 0);
  assert.equal(b.els['#remedySearch'].value, ''); assert.equal(b.els['#remedyThang'].value, '1'); assert.equal(b.els['#remedyUnitPrice'].value, ''); assert.equal(b.els['#remedyFind'].value, '');
  assert.equal(b.c.getPresetPage(), 1);
  assert.equal(b.doc.activeElement, b.els['#remedySearch']);
  assert.equal(b.c.getDb().prescriptions.length, 4, 'không xóa đơn đã lưu');
});

test('2.26.1 Đơn mới: không có gì để bỏ thì không hỏi, chỉ đưa trỏ về Tìm vị thuốc', () => {
  const sp = confirmSpy(true);
  const k = findKit(FIND_RX, { confirm: sp.fn });
  k.els['#remedyThang'].value = '1';
  k.c.handleAction(act('new-remedy'));
  assert.deepEqual(sp.log, []);
  assert.equal(k.doc.activeElement, k.els['#remedySearch']);
  assert.equal(k.c.getDb().prescriptions.length, 4, 'không đụng đơn đã lưu');
});

test('2.28.0 Xóa đơn luôn hiện ở desktop (điện thoại chỉ khi mở đơn có sẵn); 3 nhánh: đơn đã lưu hỏi rồi xóa; chưa lưu có dòng hỏi "Xóa đơn đang ghi (N dòng)..." rồi sạch; trống không làm gì', () => {
  const rows = [{ productId: 'p1', grams: 5 }, { productId: 'p1', grams: 7 }];
  const d = findKit(FIND_RX); d.c.remedyPresetPick(); assert.equal(d.els['#remedyDelPreset'].hidden, false, 'desktop: hiện dù chưa mở đơn');
  const ph = findKit(FIND_RX); ph.doc.documentElement.classList.contains = () => false; ph.c.remedyPresetPick(); assert.equal(ph.els['#remedyDelPreset'].hidden, true, 'điện thoại: ẩn khi chưa mở đơn');
  const sp = confirmSpy(true); const a = findKit(FIND_RX, { confirm: sp.fn });
  a.c.pickPresetRow('RX2'); a.c.setPresetPage(2);
  a.c.handleAction(act('del-preset'));
  assert.deepEqual(sp.log, ['Xóa đơn "Bạn Nga"? Các giao dịch đã bán vẫn được giữ lại.']);
  assert.deepEqual(a.c.getDb().prescriptions.map(x => x.id), ['RX1', 'RX3', 'RX4']); assert.equal(a.c.getPresetPage(), 1, 'sau xóa về trang 1');
  const no = confirmSpy(false), yes = confirmSpy(true);
  const b = findKit(FIND_RX, { confirm: no.fn }); b.c.setRemedyItems(rows.slice()); b.c.handleAction(act('del-preset'));
  assert.deepEqual(no.log, ['Xóa đơn đang ghi (2 dòng) và ghi lại từ đầu?']); assert.equal(b.c.getRemedyItems().length, 2, 'Hủy giữ nguyên');
  const c2 = findKit(FIND_RX, { confirm: yes.fn }); c2.c.setRemedyItems(rows.slice()); c2.c.handleAction(act('del-preset'));
  assert.equal(c2.c.getRemedyItems().length, 0, 'đồng ý: sạch'); assert.equal(c2.c.getDb().prescriptions.length, 4, 'không đụng đơn đã lưu');
  const e = findKit(FIND_RX, { confirm: yes.fn }); e.c.handleAction(act('del-preset')); assert.equal(yes.log.length, 1, 'không có gì: không hỏi (log cũ vẫn 1 từ ca trên)');
});

test('2.28.0 nạp đơn 12 dòng về TRANG 1 (2 trang), không nhảy trang cuối; ĐƠN ĐÃ LƯU mở ở trang 1 khi vào tab Thuốc chén', () => {
  const big = { id: 'RX9', name: 'Đơn Dài', items: Array.from({ length: 12 }, (_, i) => ({ productId: 'p1', grams: 10 + i })), total: 100000, thang: 1 };
  const k = findKit([big, ...FIND_RX]);
  k.c.setRemedyNotePage(1e9);
  k.c.pickPresetRow('RX9');
  assert.equal(k.c.getRemedyItems().length, 12);
  assert.equal(k.c.getRemedyNotePage(), 1, 'trang 1 / 2');
  assert.ok(PAGE.includes("rbx.addEventListener('toggle', function(){ if (rbx.open) { presetPage = 1; renderPresetList(); } })"), 'vào tab: danh sách đơn về trang 1');
});

test('2.28.0 viên Sao lưu | Thiết bị: chủ (fetch 200) → nút mở /auth/devices; thiết bị khác → lời báo; chờ → "Đang kiểm tra…"; Sao lưu = mặc định; điện thoại (không có viên) không làm gì', async () => {
  const mkb = (v) => { const b = makeEl(); b.attrs = { 'data-view': v }; b.setAttribute = (k, x) => { b.attrs[k] = String(x); }; b.getAttribute = (k) => (k in b.attrs ? b.attrs[k] : null); b.removeAttribute = (k) => { delete b.attrs[k]; }; return b; };
  const bb = [mkb('bak'), mkb('dev')], s1 = makeEl(), s2 = makeEl(), sd = makeEl(); sd.id = 'devSec';
  const bx = makeEl(); bx.querySelectorAll = (q) => (q === '.bakseg .btn' ? bb : [s1, s2, sd]);
  const msg = makeEl(), open = makeEl(), ids = { '#backupBox': bx, '.bakseg': makeEl(), '#devMsg': msg, '#devOpen': open };
  const run = (fetch) => loadClient({ document: trackDoc(ids), fetch, setTimeout() { return 0; }, clearTimeout() {} });
  let c = run(() => Promise.resolve({ status: 200 }));
  const p = c.bakView('dev');
  assert.equal(msg.textContent, 'Đang kiểm tra…'); assert.equal(open.hidden, true); assert.equal(sd.hidden, false); assert.equal(s1.hidden, true, 'ẩn phần Sao lưu');
  assert.equal(bb[1].attrs['aria-current'], 'true'); assert.equal(bb[0].attrs['aria-current'], undefined);
  await p; assert.equal(open.hidden, false, 'chủ: có nút mở quản lý'); assert.match(msg.textContent, /thiết bị chủ/);
  c = run(() => Promise.resolve({ status: 403 }));
  await c.bakView('dev'); assert.equal(msg.textContent, 'Chỉ thiết bị chủ mới quản lý được thiết bị khác.'); assert.equal(open.hidden, true);
  c = run(() => Promise.reject(new Error('mạng')));
  await c.bakView('dev'); assert.equal(open.hidden, true, 'lỗi mạng: không phải chủ');
  await c.bakView('bak'); assert.equal(s1.hidden, false); assert.equal(sd.hidden, true); assert.equal(bb[0].attrs['aria-current'], 'true');
  const ph = loadClient({ document: trackDoc({ '#backupBox': bx }), fetch: () => { throw new Error('không gọi'); } });
  await ph.bakView('dev');
  assert.ok(PAGE.includes("case 'open-devices': location.href = '/auth/devices'") && PAGE.includes("if (bbx.open) { loadBakList(); bakView('bak'); }"), 'nút mở trang thiết bị; mỗi lần vào tab = Sao lưu');
});

test('2.26.1 dòng đang gõ trống ở desktop có đủ 4 ô: "+", chữ mờ, ô Gram và nút + (vô hiệu); điện thoại vẫn một ô gộp', () => {
  const mk = (desk) => { const k = findKit(FIND_RX); k.doc.documentElement.classList.contains = (c) => desk && c === 'desktop'; k.els['#remedyBody'].id = 'remedyBody'; k.c.resetDrafts(); return k.els['#remedyBody'].children[0]; };
  const d = mk(true);
  assert.equal(d.children.length, 4);
  const inp = d.children[2].children[0], btn = d.children[3].children[0];
  assert.equal(inp.disabled, true); assert.equal(inp.placeholder, 'Gram');
  assert.equal(btn.disabled, true); assert.equal(btn.attrs['data-action'], undefined, 'nút vô hiệu không có data-action');
  const m = mk(false);
  assert.equal(m.children.length, 1); assert.equal(m.children[0].colSpan, 4);
});

function drKit(extra) {
  const attrs = (e) => { e.attrs = {}; e.setAttribute = (k, v) => { e.attrs[k] = String(v); }; e.getAttribute = (k) => (k in e.attrs ? e.attrs[k] : null); return e; };
  const els = { '#retailSearch': makeEl(), '#retailDate': makeEl(), '#retailBody': makeEl(), '#nhapSearch': makeEl(), '#nhapQty': makeEl(), '#nhapPrice': makeEl(), '#toast': makeEl(), '#toastMsg': makeEl() };
  const doc = trackDoc(els); doc.createElement = () => attrs(makeEl());
  els['#retailDate'].value = '05/11/2026';
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH, ...extra });
  c.setDb({ products: [{ id: 'p1', name: 'Cam thảo', stock: 100, costPrice: 1000 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  return { els, doc, c };
}

test('2.26.1 Xóa hết (Bán lẻ): có dòng nháp thì hỏi "Xóa hết N dòng đang ghi và làm lại từ đầu?"; Hủy giữ nguyên; đồng ý xóa nháp, GIỮ ngày, trỏ về ô tìm vị', () => {
  const no = confirmSpy(false), yes = confirmSpy(true);
  const rows = [{ productId: 'p1', qty: 1, money: 2 }, { productId: 'p1', qty: 2, money: 3 }, { productId: 'p1', qty: 3, money: 4 }];
  const a = drKit({ confirm: no.fn });
  a.c.setRetailItems(rows.slice());
  a.c.handleAction(act('clear-retail'));
  assert.deepEqual(no.log, ['Xóa hết 3 dòng đang ghi và làm lại từ đầu?']);
  assert.equal(a.c.getRetailItems().length, 3);
  const b = drKit({ confirm: yes.fn });
  b.c.setRetailItems(rows.slice()); b.els['#retailSearch'].value = 'ca';
  b.c.handleAction(act('clear-retail'));
  assert.equal(b.c.getRetailItems().length, 0);
  assert.equal(b.els['#retailSearch'].value, '');
  assert.equal(b.els['#retailDate'].value, '05/11/2026', 'giữ ngày đang chọn');
  assert.equal(b.doc.activeElement, b.els['#retailSearch']);
});

test('2.26.1 Xóa hết: không có gì thì không hỏi, không làm gì; chỉ có chữ đang gõ (0 dòng) thì hỏi bản không đếm dòng; Nhập hàng cùng cách', () => {
  const sp = confirmSpy(true);
  const k = drKit({ confirm: sp.fn });
  k.c.handleAction(act('clear-retail')); k.c.handleAction(act('clear-nhap'));
  assert.deepEqual(sp.log, []); assert.equal(k.doc.activeElement, null, 'không làm gì cả, kể cả con trỏ');
  k.els['#retailSearch'].value = 'cam';
  k.c.handleAction(act('clear-retail'));
  assert.deepEqual(sp.log, ['Xóa chữ đang gõ và làm lại từ đầu?']);
  assert.equal(k.els['#retailSearch'].value, '');
  k.els['#nhapQty'].value = '5';
  k.c.setNhapList([{ name: 'A', qty: 1, price: 1 }, { name: 'B', qty: 2, price: 1 }]);
  k.c.handleAction(act('clear-nhap'));
  assert.equal(sp.log[1], 'Xóa hết 2 dòng đang ghi và làm lại từ đầu?');
  assert.equal(k.c.getNhapList().length, 0); assert.equal(k.els['#nhapQty'].value, '');
  assert.equal(k.doc.activeElement, k.els['#nhapSearch']);
});

test('2.26.1 cấu trúc: nút Đơn mới/Xóa hết chỉ do JS desktop tạo (điện thoại không có trong DOM/CSS); ⋯ và + nằm trong thẻ (cột thao tác 34, đệm phải 10); ô Gram không bị cắt chữ', () => {
  assert.ok(PAGE.includes("bx('new-remedy', 'plus', '')") && PAGE.includes("bx('clear-retail', 'trash', 'Xóa hết')") && PAGE.includes("bx('clear-nhap', 'trash', 'Xóa hết')"));
  assert.ok(!PAGE.includes('data-action="new-remedy"') && !PAGE.includes('data-action="clear-retail"') && !PAGE.includes('data-action="clear-nhap"'), 'không có nút trong HTML tĩnh');
  assert.equal(PAGE.split('.bx{').length - 1, 1, 'CSS .bx chỉ một chỗ');
  const block = deskBlock();
  assert.ok(block.includes('html.desktop .bx{height:32px;white-space:nowrap}'), 'nút viên cao 32');
  assert.ok(block.includes('html.desktop .note td .btn--icon{min-height:22px;height:22px;width:22px;min-width:22px}'), '⋯ 22 tròn, không còn 32 tràn mép');
  assert.ok(2 + 22 + 10 <= 34 && 10 >= 8, 'cột 34 = đệm trái 2 + nút 22 + đệm phải 10: nút cách mép thẻ >= 8');
  assert.ok(block.includes('html.desktop .pend input.inp.inp--num{height:22px;min-height:22px;padding:2px 5px;margin-left:auto}') && block.includes('#remedyBody input.inp.inp--num{width:52px}'), 'Gram rộng 52, đệm 5 để chữ Gram không cụt');
  assert.ok(!block.includes('#remedyBody .empty-cell::before'), 'dấu + dòng trống do ô STT, không đặt hai lần');
});

/* ===== 2.27.0 một luật tìm chung (trọn chữ) + Tải lại/Thoát hỏi nháp ===== */
const LAW_NAMES = ['Cam Thảo', 'Hoàng Cầm', 'Cam Thảo Chích', 'Kỳ chế', 'Hoàng Kỳ', 'Kỷ Tử', 'Đảng Sâm'];
const LAW_CASES = [['cam', ['Cam Thảo', 'Cam Thảo Chích', 'Hoàng Cầm']], ['ky', ['Hoàng Kỳ', 'Kỳ chế', 'Kỷ Tử']], ['ca', []], ['dang', ['Đảng Sâm']], ['', LAW_NAMES.slice().sort()], ['  CAM thao ', ['Cam Thảo', 'Cam Thảo Chích']]];
const lawDb = () => ({
  products: LAW_NAMES.map((name, i) => ({ id: 'p' + i, name, stock: 10, costPrice: 1000 })),
  transactions: [
    { id: 'b1', date: '2026-11-08', type: 'BAN', productId: 'p3', qty: 1, price: 2000, total: 2000, ts: 3000 },
    { id: 'g1', date: '2026-11-05', type: 'BAN', productId: 'p0', qty: 1, price: 2000, total: 2000, ts: 500, oid: 'O1', oname: 'Đơn Ông Phi' },
    { id: 'g2', date: '2026-11-05', type: 'BAN', productId: 'p6', qty: 1, price: 2000, total: 2000, ts: 501, oid: 'O1', oname: 'Đơn Ông Phi' },
    { id: 'n1', date: '2026-11-08', type: 'NHAP', productId: 'p4', qty: 1, price: 1000, total: 1000, ts: 3000 },
    { id: 'n2', date: '2026-11-05', type: 'NHAP', productId: 'p0', qty: 1, price: 1000, total: 1000, ts: 500, oid: 'IM1' },
    { id: 'n3', date: '2026-11-05', type: 'NHAP', productId: 'p5', qty: 1, price: 1000, total: 1000, ts: 501, oid: 'IM1' }
  ], prescriptions: [], updatedAt: 1, moneyUnit: 'dong'
});
test('2.27.0 Kho tồn: ô lọc #invSearch trọn chữ (cam/ky/ca/dang)', () => {
  const inv = makeEl(), cnt = makeEl(), body = makeEl();
  const doc = trackDoc({ '#invSearch': inv, '#invCount': cnt, '#invBody': body });
  doc.createTextNode = () => makeEl();
  const c = loadClient({ document: doc });
  c.setDb(lawDb());
  for (const [q, want] of LAW_CASES) {
    inv.value = q; c.renderInventory();
    assert.equal(cnt.textContent, want.length + ' vị thuốc', 'invSearch "' + q + '"');
  }
});
test('2.27.0 Lịch sử nhập/bán: trọn chữ theo tên vị VÀ tên đơn; hàng gộp khớp qua vị trong đơn', () => {
  const c = loadClient();
  c.setDb(lawDb());
  const n = (kind, q) => c.historyData(kind, null, q).rows.length;
  assert.equal(n('imp', 'cam'), 1, 'nhập: cam -> chỉ hàng gộp IM1 (có Cam Thảo)');
  assert.equal(n('imp', 'ca'), 0, 'nhập: ca không ra');
  assert.equal(n('imp', 'ky'), 2, 'nhập: ky -> Hoàng Kỳ + gộp (Kỷ Tử)');
  assert.equal(n('imp', ''), 2);
  assert.equal(n('exp', 'cam'), 1, 'bán: cam -> đơn gộp qua vị Cam Thảo');
  assert.equal(n('exp', 'ca'), 0, 'bán: ca không ra');
  assert.equal(n('exp', 'dang'), 1, 'bán: dang -> đơn gộp qua vị Đảng Sâm');
  assert.equal(n('exp', 'ky'), 1, 'bán: ky -> Kỳ chế lẻ');
  assert.equal(n('exp', 'ong phi'), 1, 'bán: tên đơn "Đơn Ông Phi" cụm từ');
  assert.equal(n('exp', 'ch'), 0, 'bán lẻ: "ch" chưa trọn chữ của Kỳ chế');
  assert.equal(n('imp', 'oa'), 0, 'nhập lẻ: "oa" chưa trọn chữ của Hoàng Kỳ');
  assert.equal(n('exp', 'on'), 0, 'bán: "on" chưa trọn chữ');
});
test('2.27.0 ô tìm vị thuốc cùng bộ ví dụ', () => {
  const c = loadClient();
  c.setDb(lawDb());
  for (const [q, want] of LAW_CASES) assert.deepEqual(c.matchProducts(q).map(p => p.name).sort(), want, 'matchProducts "' + q + '"');
});
test('2.28.0 Tải lại: hỏi đúng chữ khi có nháp, không hỏi khi sạch; đồng ý thì tải lại (không đăng xuất)', () => {
  const msgs = []; let reloads = 0, ans = false;
  const c = loadClient({ confirm(m) { msgs.push(m); return ans; }, location: { href: 'x', reload() { reloads++; } } });
  c.setDirty(false); c.setRetailItems([]); c.setRemedyItems([]); c.setNhapList([]);
  c.reloadAppClick(); assert.equal(reloads, 1); assert.equal(msgs.length, 0, 'sạch: không hỏi');
  c.setRemedyItems([{ id: 1 }]);
  c.reloadAppClick(); assert.equal(msgs.pop(), 'Còn đơn nháp chưa lưu. Tải lại sẽ mất đơn nháp chưa lưu. Vẫn tải lại?'); assert.equal(reloads, 1, 'từ chối: không tải lại');
  ans = true; c.reloadAppClick(); assert.equal(reloads, 2, 'đồng ý: tải lại');
  const sb0 = PAGE.indexOf('var sbf = document.createElement'); assert.ok(sb0 > 0);
  assert.doesNotMatch(PAGE.slice(sb0, sb0 + 1200), /logout|đăng xuất|cookie/i, 'thanh bên không có đường đăng xuất/xóa cookie');
});
test('2.27.0 brand: không phải chủ thì toast "Chỉ thiết bị chủ quản lý được thiết bị."', async () => {
  const msg = makeEl();
  const doc = trackDoc({ '#toast': makeEl(), '#toastMsg': msg });
  const c = loadClient({ document: doc, fetch: () => Promise.resolve({ status: 403 }), setTimeout() { return 0; }, clearTimeout() {} });
  await c.brandDevicesClick();
  assert.equal(msg.textContent, 'Chỉ thiết bị chủ quản lý được thiết bị.');
});

/* ---------- 2.29.0: Bán lẻ + Nhập hàng desktop giống app Mac (dòng đang gõ = dòng n+1, ô phẳng, Enter đổi ô) ---------- */
function deskKit29(desk, els) {
  els['#toast'] = els['#toast'] || makeEl(); els['#toastMsg'] = els['#toastMsg'] || makeEl();
  const doc = trackDoc(els);
  doc.documentElement.classList.contains = (k) => desk && k === 'desktop';
  doc.createTextNode = () => makeEl();
  const c = loadClient({ document: doc, setTimeout() { return 0; }, clearTimeout() {}, fetch: N1_FAKE_FETCH });
  c.setDb({ products: [{ id: 'p1', name: 'A', stock: 1000, costPrice: 1000, updatedAt: 1 }], transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
  return { c, doc, els };
}
const clearKids29 = (e) => { Object.defineProperty(e, 'textContent', { get() { return ''; }, set() { e.children.length = 0; } }); return e; };
const listen29 = (e) => { e.ls = {}; e.addEventListener = (t, f) => { (e.ls[t] = e.ls[t] || []).push(f); }; return e; };
const key29 = (host, target) => { let pd = false; for (const f of host.ls.keydown) f({ key: 'Enter', defaultPrevented: false, target, preventDefault() { pd = true; } }); return pd; };

test('2.29.0 Bán lẻ desktop: dòng đang gõ là dòng n+1 (ngay sau dòng ghi cuối, trước dòng trống), đủ 10 dòng sang trang mới; điện thoại không đổi', () => {
  const mk = (desk) => {
    const tb = clearKids29(makeEl()), fill = clearKids29(makeEl()), pend = makeEl(), pg = makeEl();
    pend.id = 'retailBody';
    return { ...deskKit29(desk, { '#retailNoteBody': tb, '#retailFill': fill, '#retailBody': pend, '#retailNotePg': pg, '#retailNotePager': makeEl() }), tb, fill, pend, pg };
  };
  const rows = (n) => Array.from({ length: n }, () => ({ pid: 'p0', kg: 1, amount: 1000 }));
  const d = mk(true);
  d.c.setRetailItems(rows(3)); d.c.setNotePage(1); d.c.renderNote();
  assert.equal(d.tb.children.length, 3, 'dòng ghi');
  assert.equal(d.fill.children.length, 6, '10 - 3 dòng ghi - 1 dòng đang gõ');
  assert.equal(d.pend.hidden, false);
  assert.equal(d.pg.textContent, 'Trang 1 / 1');
  d.c.setRetailItems(rows(10)); d.c.setNotePage(1); d.c.renderNote();
  assert.equal(d.pg.textContent, 'Trang 1 / 2', 'đủ 10 dòng: dòng đang gõ sang trang 2');
  assert.equal(d.fill.children.length, 0); assert.equal(d.pend.hidden, true);
  d.c.setNotePage(1e9); d.c.renderNote();
  assert.equal(d.pg.textContent, 'Trang 2 / 2'); assert.equal(d.tb.children.length, 0);
  assert.equal(d.fill.children.length, 9, 'trang 2: dòng đang gõ + 9 dòng trống'); assert.equal(d.pend.hidden, false);
  const m = mk(false);
  m.c.setRetailItems(rows(10)); m.c.setNotePage(1); m.c.renderNote();
  assert.equal(m.pg.textContent, 'Trang 1 / 1', 'điện thoại: số trang như cũ'); assert.equal(m.fill.children.length, 0); assert.equal(m.pend.hidden, false);
});

test('2.29.0 Bán lẻ desktop: dòng gõ trống đủ 5 ô, ô tiền chữ mờ "Tiền (nghìn)" không số 0, ô SL "SL"; điện thoại một ô trống như cũ', () => {
  const pend = makeEl(); pend.id = 'retailBody';
  const d = deskKit29(true, { '#retailBody': pend });
  d.c.orderEmpty(pend, 5, '');
  const tr = pend.children[0];
  assert.equal(tr.children.length, 5, 'STT, tên, SL, tiền, nút +');
  const qi = tr.children[2].children[0], mi = tr.children[3].children[0];
  assert.equal(mi.placeholder, 'Tiền (nghìn)'); assert.equal(mi.value, ''); assert.equal(mi.disabled, true);
  assert.equal(qi.placeholder, 'SL'); assert.equal(tr.children[4].children[0].disabled, true);
  const p2 = makeEl(); p2.id = 'retailBody';
  const m = deskKit29(false, { '#retailBody': p2 });
  m.c.orderEmpty(p2, 5, '');
  assert.equal(p2.children[0].children.length, 1, 'điện thoại: một ô trống như cũ');
  assert.ok(PAGE.includes("mi.placeholder = isDesk() ? 'Tiền (nghìn)' : '0'"));
});

test('2.29.0 Nhập hàng desktop: dòng gõ là dòng n+1, tự nhảy trang; chọn vị thuốc nhảy tới trang chứa dòng gõ; điện thoại không đổi', () => {
  const mk = (desk) => {
    const tb = clearKids29(makeEl()), fill = clearKids29(makeEl()), pend = makeEl(), pager = clearKids29(makeEl()), box = makeEl();
    pend.children.push(makeEl()); // dòng nhập tĩnh trong HTML
    const k = deskKit29(desk, { '#nhapListBox': box, '#nhapListBody': tb, '#nhapFill': fill, '#nhapPendingBody': pend, '#nhapListPager': pager });
    return { ...k, tb, fill, pend, pager };
  };
  const rows = (n) => Array.from({ length: n }, () => ({ pid: 'p0', name: 'X', qty: 1, price: 1000 }));
  const d = mk(true);
  d.c.setNhapList(rows(3)); d.c.setNhapNotePage(1); d.c.renderNhapList();
  assert.equal(d.tb.children.length, 3); assert.equal(d.fill.children.length, 6); assert.equal(d.pend.hidden, false);
  assert.equal(d.pager.children[0].textContent, 'Trang 1 / 1');
  d.c.setNhapList(rows(10)); d.c.setNhapNotePage(1); d.c.renderNhapList();
  assert.equal(d.pager.children[0].textContent, 'Trang 1 / 2'); assert.equal(d.fill.children.length, 0); assert.equal(d.pend.hidden, true);
  d.c.nhapPick({ id: 'p1', name: 'A', costPrice: 0 });
  assert.equal(d.c.getNhapNotePage(), 2, 'chọn vị: nhảy tới trang chứa dòng gõ');
  assert.equal(d.pend.hidden, false); assert.equal(d.fill.children.length, 9);
  const m = mk(false);
  m.c.setNhapList(rows(10)); m.c.setNhapNotePage(1); m.c.renderNhapList();
  assert.equal(m.fill.children.length, 0); assert.equal(m.pend.hidden, false); assert.equal(m.c.getNhapNotePage(), 1);
});

test('2.29.0 Nhập hàng Enter: desktop SL -> ô tiền (không thêm), ô tiền -> thêm dòng + trỏ ô tìm; dòng sai báo lỗi trỏ ở ô lỗi; điện thoại giữ cũ (Enter ở SL có giá thì thêm)', () => {
  const mk = (desk) => {
    const form = listen29(makeEl()), q = makeEl(), p = makeEl(), s = makeEl();
    q.tagName = p.tagName = 'INPUT'; q.id = 'nhapQty'; p.id = 'nhapPrice';
    s.value = 'A'; q.value = '2'; p.value = '5';
    const k = deskKit29(desk, { '#nhapForm': form, '#nhapQty': q, '#nhapPrice': p, '#nhapSearch': s });
    k.c.bindEvents();
    return { ...k, form, q, p, s };
  };
  const d = mk(true);
  assert.equal(key29(d.form, d.q), true);
  assert.equal(d.doc.activeElement, d.p, 'SL -> ô tiền'); assert.equal(d.c.getNhapList().length, 0, 'chưa thêm');
  key29(d.form, d.p);
  assert.equal(d.c.getNhapList().length, 1, 'Enter ở ô tiền thêm dòng'); assert.equal(d.doc.activeElement, d.s, 'trỏ về ô tìm vị');
  d.q.value = ''; d.s.value = 'A'; d.p.value = '5'; d.doc.activeElement = d.p;
  key29(d.form, d.p);
  assert.equal(d.c.getNhapList().length, 1, 'dòng sai không thêm'); assert.equal(d.doc.activeElement, d.q, 'trỏ ở ô SL (ô lỗi), không nhảy sang ô tìm');
  assert.equal(d.els['#toastMsg'].textContent, 'Nhập số lượng lớn hơn 0');
  const m = mk(false);
  key29(m.form, m.q);
  assert.equal(m.c.getNhapList().length, 1, 'điện thoại: Enter ở SL (đã có giá) thêm luôn');
});

test('2.29.0 Bán lẻ Enter: desktop SL -> ô tiền; ô tiền trống báo lỗi, trỏ ở ô tiền, không thêm; đủ thì thêm; điện thoại Enter ở SL vẫn thử thêm', () => {
  const mk = (desk) => {
    const body = listen29(makeEl()), qe = makeEl(), me = makeEl();
    qe.tagName = me.tagName = 'INPUT'; qe.value = '3'; me.value = '';
    qe.classList = { contains: (c) => c === 'retail-qty', add() {}, remove() {}, toggle() {} };
    me.classList = { contains: (c) => c === 'retail-money', add() {}, remove() {}, toggle() {} };
    const row = { getAttribute() { return 'p1'; }, querySelector(sel) { return sel === '.retail-qty' ? qe : sel === '.retail-money' ? me : null; } };
    body.id = 'retailBody'; body.querySelector = (sel) => sel === 'tr[data-pid]' ? row : null;
    const k = deskKit29(desk, { '#retailBody': body, '#retailBody tr[data-pid]': row, '.retail-money': me, '.retail-qty': qe });
    k.c.bindEvents();
    return { ...k, body, qe, me };
  };
  const d = mk(true);
  key29(d.body, d.qe);
  assert.equal(d.doc.activeElement, d.me, 'SL -> ô tiền'); assert.equal(d.c.getRetailItems().length, 0); assert.equal(d.els['#toastMsg'].textContent, '');
  key29(d.body, d.me);
  assert.equal(d.c.getRetailItems().length, 0, 'tiền trống: không thêm'); assert.equal(d.doc.activeElement, d.me, 'trỏ ở ô tiền');
  assert.equal(d.els['#toastMsg'].textContent, 'Nhập thành tiền lớn hơn 0');
  d.me.value = '500'; key29(d.body, d.me);
  assert.equal(d.c.getRetailItems().length, 1); assert.equal(d.c.getRetailItems()[0].amount, 500000);
  const m = mk(false);
  key29(m.body, m.qe);
  assert.equal(m.els['#toastMsg'].textContent, 'Nhập thành tiền lớn hơn 0', 'điện thoại: Enter ở SL vẫn thử thêm dòng (như cũ)');
});

test('2.29.0 Bán lẻ desktop: chọn vị khi đang xem trang khác nhảy tới trang chứa dòng gõ', () => {
  const tb = clearKids29(makeEl()), fill = clearKids29(makeEl()), pend = clearKids29(makeEl());
  pend.id = 'retailBody';
  const d = deskKit29(true, { '#retailNoteBody': tb, '#retailFill': fill, '#retailBody': pend, '#retailNotePg': makeEl(), '#retailNotePager': makeEl() });
  d.c.setRetailItems(Array.from({ length: 10 }, () => ({ pid: 'p0', kg: 1, amount: 1000 })));
  d.c.setNotePage(1);
  d.c.pickSuggest('retail', 'p1');
  assert.equal(d.c.getNotePage(), 2, 'nhảy tới trang 2');
});

test('2.29.0 cấu trúc: 3 tờ ghi gộp dòng gõ + dòng trống vào bảng tờ ghi; tiêu đề SL (kg)/Giá bán; ô phẳng không viền, gợi ý đổi nằm trái ô SL không đè', () => {
  assert.ok(PAGE.includes("[['remedyNoteBody', 'remedyBody', 'remedyFill'], ['retailNoteBody', 'retailBody', 'retailFill'], ['nhapListBody', 'nhapPendingBody', 'nhapFill']]"));
  assert.match(PAGE, /<th scope="col">SL \(kg\)<\/th>\s*<th scope="col" class="r">Giá bán<\/th>/);
  for (const id of ['retailBody', 'remedyBody', 'nhapPendingBody']) assert.ok(PAGE.includes('<tbody id="' + id + '" class="pend">'), id + ' có class pend');
  const b = deskBlock();
  assert.ok(b.includes('html.desktop :is(#retailBody,#remedyBody,#nhapPendingBody) .inp{background:none;border-color:transparent;box-shadow:none}'), 'ô phẳng không viền');
  assert.ok(b.includes('html.desktop .pend input.inp.inp--num{height:22px;min-height:22px;padding:2px 5px;margin-left:auto}'), 'ô SL căn phải trong cột: chip gợi ý (right:96px) nằm trái ô');
  assert.ok(b.includes('html.desktop .pend td .qty-hint--label{padding:0;border:0;background:none}'), 'gợi ý đổi là chữ mờ, không viên');
  assert.ok(b.includes('html.desktop .pend .c-num::before{content:"+";font-size:13px}') && b.includes('html.desktop .pend .empty-cell::after{content:"Tên vị thuốc"}'));
  assert.ok(b.includes('html.desktop .pend .c-money input::placeholder{font-size:12px}'), '"Tiền (nghìn)" vừa ô');
  assert.ok(Buffer.byteLength(b) <= 20480);
});

test('2.30.3 Nhập hàng desktop: nút "Lưu đơn", dòng "Tổng tiền nhập (nghìn)" theo tổng các dòng; "Giá nhập gần nhất" ẩn ở desktop nhưng còn ở title; điện thoại giữ nhãn cũ', () => {
  const mk = (desk) => {
    const lbl = makeEl(), ft = makeEl(), pn = makeEl(), hint = makeEl(), tot = makeEl();
    const k = deskKit29(desk, { '#nhapListBox': makeEl(), '#nhapListBody': makeEl(), '#nhapSaveLabel': lbl, '#nhapFootTot': ft, '#nhapPendName': pn, '#nhapHint': hint, '#nhapSearch': { value: 'A' }, '#nhapTotal': tot });
    return { ...k, lbl, ft, pn, hint };
  };
  const rows = [{ pid: 'p0', name: 'X', qty: 2, price: 5000 }, { pid: 'p1', name: 'Y', qty: 1.5, price: 100000 }];
  const d = mk(true);
  d.c.setNhapList(rows); d.c.renderNhapList();
  assert.equal(d.lbl.textContent, 'Lưu đơn');
  assert.equal(d.ft.textContent, '160'); // 2*5 + 1,5*100 = 160 nghìn
  d.c.setNhapList([]); d.c.renderNhapList();
  assert.equal(d.ft.textContent, '0'); assert.equal(d.lbl.textContent, 'Lưu đơn');
  d.hint.textContent = 'Giá nhập gần nhất: 85/kg'; d.hint.hidden = false; d.c.calcNhap();
  assert.equal(d.pn.title, 'Giá nhập gần nhất: 85/kg');
  d.hint.hidden = true; d.c.calcNhap(); assert.equal(d.pn.title, '');
  const m = mk(false);
  m.c.setNhapList(rows); m.c.renderNhapList();
  assert.equal(m.lbl.textContent, 'Lưu nhập hàng (2)', 'điện thoại: nhãn cũ');
  assert.equal(m.ft.textContent, '160');
  const css = PAGE;
  assert.ok(css.includes('.nhap-foot__tot{display:none}'), 'điện thoại ẩn dòng tổng chân');
  assert.ok(css.includes('html.desktop .nhap-hint{display:none}'), 'desktop ẩn chữ giá nhập gần nhất');
  assert.ok(css.includes('html.desktop .nhap-foot__tot{display:block;'), 'desktop hiện tổng chân');
  assert.ok(!css.includes('html.desktop .nhap-hint:not([hidden])'));
});

test('2.30.4 desktop theo Mac: tên mờ dòng gõ Nhập hàng/Bán lẻ "Chọn vị thuốc ở ô trên" (Thuốc chén giữ "Tên vị thuốc"); placeholder desktop Nhập tên/SL/Giá (nghìn); điện thoại giữ nguyên', () => {
  for (const desk of [true, false]) {
    const pn = makeEl();
    const k = deskKit29(desk, { '#nhapPendName': pn, '#nhapSearch': { value: '' }, '#nhapTotal': makeEl(), '#nhapHint': makeEl() });
    k.c.calcNhap();
    assert.equal(pn.textContent, 'Chọn vị thuốc ở ô trên', 'desk=' + desk);
  }
  assert.ok(PAGE.includes('html.desktop #retailBody .empty-cell::after{content:"Chọn vị thuốc ở ô trên"}'), 'Bán lẻ desktop');
  assert.ok(PAGE.includes('html.desktop .pend .empty-cell::after{content:"Tên vị thuốc"}'), 'Thuốc chén giữ chữ cũ');
  assert.ok(PAGE.includes("if (D) [['retailSearch', 'Nhập tên'], ['nhapSearch', 'Nhập tên'], ['nhapQty', 'SL'], ['nhapPrice', 'Giá (nghìn)']]"), 'placeholder chỉ khi desktop');
  assert.ok(PAGE.includes('id="nhapSearch" type="text" autocomplete="off" placeholder="Nhập tên"') && PAGE.includes('id="nhapQty" type="number" step="any" min="0" max="1000000" inputmode="decimal" placeholder="0"'), 'điện thoại giữ placeholder HTML');
});

test('2.30.4b desktop: ô tìm tên Nhập hàng/Bán lẻ "Nhập tên"; dòng gõ không cao hơn dòng dữ liệu (c-del không đệm dọc); dòng gõ Thuốc chén phẳng như Bán lẻ/Nhập hàng', () => {
  assert.ok(!PAGE.includes("['retailSearch', 'Tìm vị thuốc']") && !PAGE.includes("['nhapSearch', 'Tìm vị thuốc']"), 'không còn Tìm vị thuốc ở Nhập hàng/Bán lẻ');
  assert.ok(PAGE.includes('html.desktop .note :is(td,th):is(.c-act,.c-del){text-align:left;padding:0 10px 0 2px}'), 'ô nút cuối không đệm dọc (dòng gõ = dòng dữ liệu)');
  assert.ok(PAGE.includes('html.desktop :is(#retailBody,#remedyBody,#nhapPendingBody) .inp{background:none;border-color:transparent;box-shadow:none}'), 'dòng gõ Thuốc chén phẳng');
});

test('2.30.4c desktop: 4 ô tìm tên (Bán lẻ, Nhập hàng, Kho tồn, Thuốc chén) đều "Nhập tên", không JS nào đổi thành Tìm vị thuốc; Tìm đơn đã lưu giữ nguyên', () => {
  ['retailSearch', 'nhapSearch', 'invSearch', 'remedySearch'].forEach((id) => {
    assert.match(PAGE, new RegExp('id="' + id + '"[^>]*placeholder="Nhập tên"'), id + ' là Nhập tên');
  });
  assert.ok(!PAGE.includes("placeholder = 'Tìm vị thuốc'") && !/rs\.placeholder/.test(PAGE), 'không gán Tìm vị thuốc');
  assert.ok(PAGE.includes('id="remedyFind" type="search" autocomplete="off" placeholder="Tìm đơn đã lưu"'), 'Tìm đơn đã lưu giữ nguyên');
});

test('2.30.5 desktop chỉ hai tông chữ (--text, --muted) + đỏ: không xanh/tím, text2 = chính, liên kết đậm + gạch chân mờ không đổi màu khi rê', () => {
  const b = deskBlock();
  assert.ok(b.includes('html.desktop[data-bg]{--text2:var(--text);--brand-text:var(--text);--green-text:var(--text);--blue-text:var(--text)}'), 'token xanh/tím/text2 về chữ chính');
  const colors = [...b.matchAll(/[^-\w]color:([^;}]+)/g)].map(m => m[1]);
  assert.ok(colors.length > 0 && colors.every(c => ['var(--text)', 'var(--muted)', 'var(--sel-fg)', '#fff'].includes(c)), 'màu chữ desktop chỉ chính/phụ/chữ trên nút: ' + colors.join());
  assert.ok(!/#e2e8f0|--blue-text:#|--brand-text:#/.test(b), 'không còn màu lẻ/xanh/tím/mờ thứ ba');
  assert.ok(b.includes('html.desktop .linkbtn{text-decoration-color:rgba(255,255,255,.3)}') && b.includes('html.desktop .linkbtn:hover{color:var(--text)}'));
  assert.match(PAGE, /\.linkbtn\{[^}]*font-weight:700;[^}]*text-decoration:underline/, 'liên kết đậm + gạch chân');
});

/* ===== 2.31.0 thu gọn khung desktop theo app Mac ===== */
test('2.31.0 thanh bên 160: nút tab cao tối thiểu 30 (nhãn dài xuống 2 dòng, không cắt …), chữ 12,5 đậm, icon 18 cách chữ 6, đệm ngang 10; bỏ hàng Nền, nút bảng màu cùng dòng đồng bộ', () => {
  const b = deskBlock();
  assert.ok(b.includes('html.desktop{--sw:160px;') && b.includes('margin:52px 10px 0'), 'thanh bên rộng 160, đệm trong 10');
  const tab = /html\.desktop \.tab\{([^}]*)\}/.exec(b)[1];
  assert.ok(tab.includes('min-height:30px') && tab.includes('padding:6px 10px 6px 34px') && tab.includes('font-size:12.5px;font-weight:700') && tab.includes('display:block') && !/white-space:nowrap|text-overflow|overflow:hidden|height:\d+px;min-height/.test(tab), 'không height cố định, không nowrap/ellipsis (34 = đệm 10 + icon 18 + cách 6)');
  assert.ok(b.includes('html.desktop .tab__ic{position:absolute;left:10px;') && b.includes('width:18px;height:18px'));
  assert.ok(b.includes('html.desktop .tab__l2{display:inline-block}'), '"khôi phục" xuống dòng cả cụm');
  assert.ok(b.includes('html.desktop .sbr{position:relative;display:flex;') && b.includes('html.desktop .sbp .ico{width:22px;height:22px}') && b.includes('html.desktop .bgdots{display:none;') && b.includes('html.desktop .bgdots.is-open{display:flex}'));
  assert.ok(!/html[^{]*\.bgdots::before/.test(b), 'desktop không còn chữ "Nền"');
  assert.ok(PAGE.includes('<symbol id="i-palette"'));
  // JS: bấm nút mở/đóng bảng; chọn chấm xong đóng + lưu như cũ
  const out = runHead({ tauri: true }), sr = out.body.children[0].children[0], [sy, pb, w] = sr.children;
  assert.equal(sy.id, 'syncLine'); assert.equal(pb.getAttribute('aria-label'), 'Màu nền'); assert.equal(pb.title, 'Màu nền');
  pb.onclick({ stopPropagation() {} });
  assert.ok(w.classList.contains('is-open') && pb['aria-expanded'] === 'true', 'bấm nút: mở');
  w.children[3].onclick();
  assert.ok(!w.classList.contains('is-open') && out.store.desktopBg === 'emerald' && out.attrs['data-bg'] === 'emerald', 'chọn xong: đóng, vẫn lưu desktopBg');
});

test('2.31.0 Kho tồn / Lịch sử nhập / Lịch sử bán desktop: 10 dòng chia đều hết chiều cao thẻ (>= 26, dòng trống có vạch kẻ), phân trang ghim đáy, không cuộn, tiêu đề cột chữ thường màu phụ', () => {
  const b = deskBlock();
  assert.ok(b.includes('html.desktop :is(#invBox,#impBox,#expBox) .tw{flex:1;min-height:0;overflow:hidden}') && b.includes('html.desktop table:is(.inv,.his){height:100%}'), 'bảng cao hết phần còn lại, thẻ flex cột');
  assert.ok(b.includes('html.desktop table:is(.inv,.his) td{height:26px;padding:1px 8px}'), 'dòng tối thiểu 26');
  const th = /html\.desktop table:is\(\.inv,\.his\) th\{([^}]*)\}/.exec(b)[1];
  assert.ok(th.includes('text-transform:none') && th.includes('font-size:13px') && th.includes('color:var(--muted)') && !/uppercase/.test(th), 'tiêu đề chữ thường, cỡ thân, màu phụ');
  assert.ok(/\.note th\{[^}]*letter-spacing:\.06em/.test(b) && /th\{text-align:left;font-size:11px;letter-spacing:\.05em;text-transform:uppercase/.test(PAGE), 'tờ ghi giữ IN HOA');
  assert.ok(b.includes('html.desktop :is(#invPager,#impPager,#expPager){flex:none;'), 'phân trang ghim đáy thẻ');
  // JS: desktop độn đủ PAGE_SIZE dòng (dòng trống có class note__blank), điện thoại không độn
  for (const [desk, want] of [[true, 10], [false, 4]]) {
    const body = clearKids29(makeEl()), els = { '#invBody': body, '#invPager': makeEl() };
    const d = deskKit29(desk, els);
    d.c.setDb({ products: ['A', 'B', 'C', 'D'].map((n, i) => ({ id: 'p' + i, name: n, stock: 1, costPrice: 1000 })), transactions: [], prescriptions: [], updatedAt: 1, moneyUnit: 'dong' });
    d.c.renderInventory();
    assert.equal(body.children.length, want, (desk ? 'desktop' : 'điện thoại') + ': số dòng');
    assert.equal(body.children.filter(r => r.className === 'note__blank').length, desk ? 6 : 0);
  }
});

test('2.31.0 Thống kê desktop: 4 ô số xếp 2x2 (hàng trên hôm nay | tháng; hàng dưới năm | nhập+tồn), hai ô mỗi hàng chia đều ngang, biểu đồ nhận phần cao còn lại', () => {
  const b = deskBlock();
  assert.ok(b.includes('html.desktop .thk__n{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}'), 'lưới 2 cột bằng nhau');
  const thk = PAGE.slice(PAGE.indexOf('class="thk__n"'), PAGE.indexOf('class="thk__n"') + 2000);
  const groups = thk.slice(0, 1900).split('class="thk__g"').slice(1, 5).map(g => [...g.matchAll(/<i>([^<]*)<\/i>/g)].slice(0, 2).map(m => m[1]));
  assert.equal(groups.length, 4, 'đúng 4 ô');
  assert.deepEqual(groups, [['Bán hôm nay', 'Lợi nhuận hôm nay'], ['Bán trong tháng', 'Lợi nhuận tháng'], ['Bán trong năm', 'Lợi nhuận năm'], ['Nhập trong tháng', 'Tổng tồn kho']], 'thứ tự ô: 2 hàng x 2 cột');
  assert.ok(b.includes('html.desktop .chart{flex:1;min-height:0;height:auto}'));
});

test('2.31.0 Thuốc chén: nút "Đơn mới" thay bằng nút + tròn 32 bên phải ô Nhập tên (cùng nền/viền ô viên), đúng data-action new-remedy; ô ngày luôn 1 dòng', () => {
  assert.ok(!PAGE.includes("bx('new-remedy', 'plus', 'Đơn mới')"), 'không còn nút chữ Đơn mới');
  assert.ok(PAGE.includes("var nw = bx('new-remedy', 'plus', ''); nw.className += ' btn--icon bx--o'; nw.title = 'Đơn mới'; nw.setAttribute('aria-label', 'Đơn mới'); bl.appendChild(nw);"), 'nút + nằm trong nửa trái, sau ô Nhập tên');
  assert.ok(!/br\.appendChild\(nw\)/.test(PAGE));
  const b = deskBlock();
  assert.ok(b.includes('html.desktop .btn.bx--o{border-color:rgba(255,255,255,.14);background-color:rgba(255,255,255,.10)}'), 'nền .10, viền .14 như ô viên');
  assert.ok(b.includes('html.desktop .btn--icon{min-width:32px;padding:3px}') && b.includes('html.desktop .bx{height:32px;white-space:nowrap}'), '32x32 + bo 999 = tròn');
  assert.ok(b.includes('html.desktop :is(input,select).inp,html.desktop .btn{border-radius:999px}'));
  assert.ok(/html:is\(\.desktop,\.pt\)\[data-bg\] \.inp,[^{]*\{background-color:rgba\(255,255,255,\.10\);border-color:rgba\(255,255,255,\.14\)\}/.test(PAGE), 'ô viên .10/.14');
  assert.ok(PAGE.includes("rb.insertBefore(bl, rp); rb.appendChild(br);") && PAGE.includes("br.appendChild(document.getElementById('remedyFindBox')); br.appendChild(rb.querySelector('.card__bar-date'));"), 'hàng: Thuốc chén | Nhập tên | + | Tìm đơn đã lưu | ngày');
  assert.ok(b.includes('html.desktop .card__bar-title{font-size:15px;font-weight:700;white-space:nowrap}'), 'tiêu đề không gãy dòng');
});
