/**
 * Test chạy trực tiếp server.js (bản local production) qua HTTP thật.
 *
 * worker.test.mjs chỉ kiểm tra logic client + worker.js Cloudflare cũ; file này
 * bảo đảm chính server đang vận hành cũng đúng: validate snapshot, conflict
 * 409, làm tròn tiền, và tự động sao lưu.
 *
 * Cách chạy: node --test (chạy mọi file tests trong thư mục tests).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import vm from 'node:vm';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE } from '../src/page.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8899;
const BASE = `http://127.0.0.1:${PORT}`;
const SETUP_CODE = 'TESTCODE2026KHO';

let child;
let dataDir;
let deviceCookie = '';

function waitForServer(timeoutMs = 15000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const r = await fetch(`${BASE}/healthz`);
        if (r.ok) return resolve();
      } catch (e) { /* chưa lên, thử lại */ }
      if (Date.now() - started > timeoutMs) return reject(new Error('server không khởi động kịp'));
      setTimeout(tick, 150);
    };
    tick();
  });
}

/* redirect: 'manual' giữ phản hồi 303, nếu không fetch đi theo Location và mất Set-Cookie.
   Tên cookie là qlk_dev_<hex>, lấy cặp tên=giá trị đầu tiên, không viết cứng tên. */
async function enrollDevice() {
  const r = await fetch(`${BASE}/auth/setup`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code: SETUP_CODE, name: 'May test' }).toString()
  });
  if (r.status === 404 && deviceCookie) return;
  const parts = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [];
  if (r.status !== 303 || parts.length === 0) {
    throw new Error('setup that bai status=' + r.status + ' set-cookie=' + parts.length);
  }
  const pair = String(parts[0]).split(';')[0].trim();
  if (!pair.includes('=')) throw new Error('set-cookie khong co cap ten=gia tri');
  deviceCookie = pair;
}

async function put(state, headers = {}) {
  const r = await fetch(`${BASE}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...headers, Cookie: deviceCookie },
    body: JSON.stringify(state)
  });
  let body = null;
  try { body = await r.json(); } catch (e) {}
  return { status: r.status, body };
}

async function getState() {
  const r = await fetch(`${BASE}/api/state`, { headers: { Cookie: deviceCookie } });
  return (await r.json()).data;
}


/* Nạp sanitize/parseBackup thật từ src/page.js để kiểm tương thích client-server. */
function loadClientStateFns() {
  const blocks = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  let js = blocks.find(b => b.includes('var doc = document;'))
    .replace(/%%BOOT%%/g, 'null').replace(/%%NEEDFETCH%%/g, 'false');
  const end = js.lastIndexOf('})();');
  js = js.slice(0, end) + '\nglobalThis.__compat = { sanitize: sanitize, parseBackup: parseBackup };\n})();';
  function mk() {
    return {
      style: {}, children: [], classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
      setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
      appendChild(c) { this.children.push(c); return c; }, remove() {}, addEventListener() {},
      querySelector() { return null; }, querySelectorAll() { return []; },
      getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; }
    };
  }
  const doc = {
    readyState: 'loading', hidden: false, activeElement: null,
    documentElement: mk(), body: mk(), createElement: mk, createElementNS: mk,
    querySelector() { return null; }, querySelectorAll() { return []; },
    addEventListener() {}, removeEventListener() {}
  };
  const sandbox = {
    console, Intl, Date, Math, JSON, Number, String, Array, Object,
    parseFloat, isFinite, NaN, Infinity, Map, Set, Promise,
    setTimeout() { return 0; }, clearTimeout() {},
    localStorage: { getItem() { return null; }, setItem() {} },
    document: doc,
    window: { matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener() {} },
    fetch: async () => null, FileReader: class {}, Blob: class {},
    URL: { createObjectURL: () => '', revokeObjectURL() {} },
    confirm: () => true
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(js, sandbox);
  return sandbox.__compat;
}

function emptyState(extra = {}) {
  return { products: [], transactions: [], prescriptions: [], updatedAt: 0, ...extra };
}

test.before(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-test-'));
  child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(PORT), DATA_DIR: dataDir, QLK_SETUP_CODE: SETUP_CODE },
    stdio: 'ignore'
  });
  await waitForServer();
  await enrollDevice();
});

test.after(() => {
  if (child) child.kill();
  if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
});

test('server.js: GET /api/state trả state rỗng ban đầu', async () => {
  const data = await getState();
  assert.equal(data.products.length, 0);
  assert.equal(data.transactions.length, 0);
  assert.equal(data.prescriptions.length, 0);
});

test('server.js: PUT hợp lệ ghi rồi GET đọc lại đúng', async () => {
  const state = emptyState({
    products: [{ id: 'P1', name: 'Cam thảo', stock: 10, costPrice: 50 }],
    transactions: [{ id: 'T1', date: '2026-11-06', type: 'NHAP', productId: 'P1', qty: 10, price: 50, total: 500, ts: 1 }]
  });
  const res = await put(state, { 'X-Base-Updated': '0' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);

  const data = await getState();
  assert.equal(data.products.length, 1);
  assert.equal(data.transactions.length, 1);
  assert.equal(data.transactions[0].total, 500);
});

test('server.js: làm tròn tiền về số nguyên khi lưu', async () => {
  const state = emptyState({
    products: [{ id: 'P1', name: 'A', stock: 1, costPrice: 42.6 }],
    transactions: [{ id: 'T1', date: '2026-11-06', type: 'BAN', productId: 'P1', qty: 1, price: 42.4, total: 99.5, cost: 10.49, ts: 1 }]
  });
  const res = await put(state, { 'X-Force': '1' });
  assert.equal(res.status, 200);
  const data = await getState();
  assert.equal(data.products[0].costPrice, 43);      // 42.6 đồng -> 43 đồng
  assert.equal(data.transactions[0].price, 42);
  assert.equal(data.transactions[0].total, 100);
  assert.equal(data.transactions[0].cost, 10);
});

test('server.js: PUT dữ liệu âm bị chặn 400', async () => {
  const bad = emptyState({ products: [{ id: 'P1', name: 'X', stock: -1, costPrice: 0 }] });
  const res = await put(bad);
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(Array.isArray(res.body.details) && res.body.details.length > 0);
});

test('server.js: JSON hỏng trả 400', async () => {
  const r = await fetch(`${BASE}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: deviceCookie },
    body: '{khong phai json'
  });
  assert.equal(r.status, 400);
});

test('server.js: X-Base-Updated cũ trả 409 conflict', async () => {
  // Ghi lần 1 để có updatedAt hiện tại
  const first = await put(emptyState({
    products: [{ id: 'P1', name: 'A', stock: 1, costPrice: 1 }]
  }), { 'X-Force': '1' });
  assert.equal(first.status, 200);
  const currentUpdatedAt = first.body.updatedAt;

  // Gửi với base cũ (0) -> phải conflict
  const stale = await put(emptyState({
    products: [{ id: 'P2', name: 'B', stock: 2, costPrice: 2 }]
  }), { 'X-Base-Updated': '0' });
  assert.equal(stale.status, 409);
  assert.equal(stale.body.conflict, true);
  assert.equal(stale.body.updatedAt, currentUpdatedAt);
});

test('server.js: X-Base-Updated không phải số bị từ chối (vá lỗi NaN)', async () => {
  const res = await put(emptyState({
    products: [{ id: 'P1', name: 'A', stock: 1, costPrice: 1 }]
  }), { 'X-Base-Updated': 'abc' });
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
});

test('server.js: X-Force ghi đè dù base cũ', async () => {
  await put(emptyState({ products: [{ id: 'P1', name: 'A', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  const res = await put(emptyState({
    products: [{ id: 'P2', name: 'B', stock: 2, costPrice: 2 }]
  }), { 'X-Base-Updated': '0', 'X-Force': '1' });
  assert.equal(res.status, 200);
  const data = await getState();
  assert.equal(data.products[0].id, 'P2');
});

test('server.js: tự động tạo backup sau khi ghi dữ liệu', async () => {
  await put(emptyState({
    products: [{ id: 'P1', name: 'A', stock: 1, costPrice: 1 }],
    transactions: [{ id: 'T1', date: '2026-11-06', type: 'BAN', productId: 'P1', qty: 1, price: 1, total: 1, ts: 1 }]
  }), { 'X-Force': '1' });

  const backupDir = path.join(dataDir, 'backups');
  assert.ok(fs.existsSync(backupDir), 'thư mục backups phải tồn tại');
  const files = fs.readdirSync(backupDir).filter(n => /^backup-\d{4}-\d{2}-\d{2}\.db$/.test(n));
  assert.ok(files.length >= 1, 'phải có ít nhất 1 file backup');

  const r = await fetch(`${BASE}/api/backups`, { headers: { Cookie: deviceCookie } });
  const body = await r.json();
  assert.equal(body.success, true);
  assert.ok(body.count >= 1);
});

test('server.js: giữ created_at gốc khi ghi lại (không đặt lại)', async () => {
  // Ghi lần 1
  await put(emptyState({
    products: [{ id: 'KEEP1', name: 'GiuNgay', stock: 1, costPrice: 1 }],
    transactions: [{ id: 'KTX1', date: '2026-11-06', type: 'NHAP', productId: 'KEEP1', qty: 1, price: 1, total: 1, ts: 1 }]
  }), { 'X-Force': '1' });

  const DB = (await import('better-sqlite3')).default;
  const dbPath = path.join(dataDir, 'app.db');
  const readCreated = () => {
    const conn = new DB(dbPath, { readonly: true });
    const p = conn.prepare('SELECT created_at FROM products WHERE id = ?').get('KEEP1');
    const t = conn.prepare('SELECT created_at FROM transactions WHERE id = ?').get('KTX1');
    conn.close();
    return { p: p && p.created_at, t: t && t.created_at };
  };

  const first = readCreated();
  assert.ok(first.p > 0 && first.t > 0, 'phải có created_at sau lần ghi đầu');

  // Đợi để mốc thời gian khác, rồi ghi lại cùng id
  await new Promise(r => setTimeout(r, 30));
  await put(emptyState({
    products: [{ id: 'KEEP1', name: 'GiuNgay', stock: 5, costPrice: 2 }],
    transactions: [{ id: 'KTX1', date: '2026-11-06', type: 'NHAP', productId: 'KEEP1', qty: 5, price: 2, total: 10, ts: 1 }]
  }), { 'X-Force': '1' });

  const second = readCreated();
  assert.equal(second.p, first.p, 'created_at của product phải giữ nguyên');
  assert.equal(second.t, first.t, 'created_at của transaction phải giữ nguyên');
});

test('server.js: trang GET / dựng HTML, hết placeholder', async () => {
  const r = await fetch(`${BASE}/`, { headers: { Cookie: deviceCookie } });
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.ok(!html.includes('%%NONCE%%'));
  assert.ok(!html.includes('%%BOOT%%'));
  assert.ok(!html.includes('%%NEEDFETCH%%'));
  assert.ok(!html.includes('/logout'), 'nút đăng xuất phải đã bị gỡ');
});
test('server.js: orderName không fallback thành oid; tự dọn oname === oid khi đọc', async () => {
  await put(emptyState({
    products: [{ id: 'P1', name: 'A', stock: 10, costPrice: 1 }],
    transactions: [
      { id: 'T_IMP1', date: '2026-11-06', type: 'NHAP', productId: 'P1', qty: 10, price: 1, total: 10, oid: 'IM_001', ts: 1 },
      { id: 'T_BAN1', date: '2026-11-06', type: 'BAN', productId: 'P1', qty: 1, price: 2, total: 2, oid: 'ORD_001', oname: 'Bán lẻ', ts: 2 }
    ]
  }), { 'X-Force': '1' });

  const data = await getState();
  const imp = data.transactions.find(t => t.id === 'T_IMP1');
  const ban = data.transactions.find(t => t.id === 'T_BAN1');

  assert.equal(imp.oid, 'IM_001');
  assert.equal(imp.oname, undefined, 'đơn nhập không có oname thì không được fallback thành oid');
  assert.equal(ban.oid, 'ORD_001');
  assert.equal(ban.oname, 'Bán lẻ');

  const DB = (await import('better-sqlite3')).default;
  const dbPath = path.join(dataDir, 'app.db');
  const conn = new DB(dbPath);
  conn.prepare("UPDATE transactions SET order_name = 'IM_001' WHERE id = 'T_IMP1'").run();
  conn.close();

  const refreshed = await getState();
  const impRefreshed = refreshed.transactions.find(t => t.id === 'T_IMP1');
  assert.equal(impRefreshed.oname, undefined, 'readState phải tự dọn bỏ oname khi trùng với oid');
});

test('server.js: tiền lẻ còn trong DB được đọc thành số nguyên', async () => {
  await put(emptyState({
    products: [{ id: 'PLEG', name: 'TienLe', stock: 1, costPrice: 10 }],
    transactions: [{ id: 'TLEG', date: '2026-11-06', type: 'BAN', productId: 'PLEG', qty: 1, price: 10, total: 10, cost: 4, unitPrice: 8, ts: 1 }],
    prescriptions: [{ id: 'RLEG', name: 'Don le', items: [{ productId: 'PLEG', grams: 5 }], total: 8, thang: 1 }]
  }), { 'X-Force': '1' });

  const DB = (await import('better-sqlite3')).default;
  const conn = new DB(path.join(dataDir, 'app.db'));
  conn.prepare('UPDATE products SET cost_price_vnd = 42.6 WHERE id = ?').run('PLEG');
  conn.prepare('UPDATE transactions SET price_vnd = 42.4, total_vnd = 99.5, cost_vnd = 10.49, unit_price_vnd = 8.5 WHERE id = ?').run('TLEG');
  conn.prepare('UPDATE prescriptions SET total_vnd = 12.6 WHERE id = ?').run('RLEG');
  conn.close();

  const data = await getState();
  const p = data.products.find(x => x.id === 'PLEG');
  const t = data.transactions.find(x => x.id === 'TLEG');
  const r = data.prescriptions.find(x => x.id === 'RLEG');
  assert.equal(p.costPrice, 43);
  assert.equal(t.price, 42);
  assert.equal(t.total, 100);
  assert.equal(t.cost, 10);
  assert.equal(t.unitPrice, 9);
  assert.equal(r.total, 13);
});

test('server.js: payload quá lớn trả JSON 413', async () => {
  const largeState = emptyState({
    products: Array.from({ length: 60000 }, (_, i) => ({
      id: 'P' + i,
      name: 'Thuoc ' + i,
      stock: 1,
      costPrice: 10
    }))
  });
  const bodyStr = JSON.stringify(largeState);
  if (bodyStr.length > 4 * 1024 * 1024) {
    const r = await fetch(`${BASE}/api/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: deviceCookie },
      body: bodyStr
    });
    assert.equal(r.status, 413);
    const json = await r.json();
    assert.equal(json.success, false);
    assert.equal(json.error, 'Payload too large');
  }
});

test('server.js: thiếu X-Base-Updated (và không X-Force) bị từ chối 428, dữ liệu không đổi', async () => {
  await put(emptyState({ products: [{ id: 'H1', name: 'GiuNguyen', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  const res = await put(emptyState({ products: [{ id: 'H2', name: 'GhiMu', stock: 1, costPrice: 1 }] }));
  assert.equal(res.status, 428);
  assert.equal(res.body.success, false);
  const data = await getState();
  assert.deepEqual(data.products.map(p => p.id), ['H1']);
});

test('server.js: trùng tên/id bị 400 thay vì âm thầm bỏ dòng, dữ liệu cũ còn nguyên', async () => {
  await put(emptyState({ products: [{ id: 'D0', name: 'Goc', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  const base = (await getState()).updatedAt;
  const hdr = { 'X-Base-Updated': String(base) };

  const dupName = await put(emptyState({
    products: [{ id: 'D1', name: 'Cam Thảo', stock: 1, costPrice: 1 }, { id: 'D2', name: 'cam thảo', stock: 2, costPrice: 1 }]
  }), hdr);
  assert.equal(dupName.status, 400);
  assert.ok(dupName.body.details.some(m => m.includes('trùng tên')));

  const dupTx = await put(emptyState({
    products: [{ id: 'D1', name: 'A', stock: 1, costPrice: 1 }],
    transactions: [
      { id: 'TD', date: '2026-11-06', type: 'BAN', productId: 'D1', qty: 1, price: 1, total: 1, ts: 1 },
      { id: 'TD', date: '2026-11-06', type: 'BAN', productId: 'D1', qty: 2, price: 1, total: 2, ts: 2 }
    ]
  }), hdr);
  assert.equal(dupTx.status, 400);
  assert.ok(dupTx.body.details.some(m => m.includes('trùng id giao dịch')));

  const dupRx = await put(emptyState({
    products: [{ id: 'D1', name: 'A', stock: 1, costPrice: 1 }],
    prescriptions: [
      { id: 'R1', name: 'Bai 1', items: [{ productId: 'D1', grams: 5 }], total: 10, thang: 1 },
      { id: 'R2', name: 'Bai 1', items: [{ productId: 'D1', grams: 5 }], total: 10, thang: 1 }
    ]
  }), hdr);
  assert.equal(dupRx.status, 400);

  const data = await getState();
  assert.deepEqual(data.products.map(p => p.id), ['D0'], 'bị từ chối thì dữ liệu cũ phải còn nguyên');
});

test('server.js: có oname mà thiếu oid thì không mượn tên làm mã đơn', async () => {
  await put(emptyState({
    products: [{ id: 'O1', name: 'A', stock: 5, costPrice: 1 }],
    transactions: [
      { id: 'TO1', date: '2026-11-06', type: 'BAN', productId: 'O1', qty: 1, price: 2, total: 2, oname: 'Đơn thuốc lẻ', ts: 1 },
      { id: 'TO2', date: '2026-11-07', type: 'BAN', productId: 'O1', qty: 1, price: 2, total: 2, oname: 'Đơn thuốc lẻ', ts: 2 }
    ]
  }), { 'X-Force': '1' });
  const data = await getState();
  for (const id of ['TO1', 'TO2']) {
    const tx = data.transactions.find(x => x.id === id);
    assert.equal(tx.oid, undefined, 'hai đơn khác ngày không được gộp chung theo tên');
  }
});

test('server.js: ghi đè chủ động (X-Force) chụp bản trước-ghi-đè chứa dữ liệu cũ', async () => {
  await put(emptyState({ products: [{ id: 'SNAPA', name: 'TruocA', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  await put(emptyState({ products: [{ id: 'SNAPB', name: 'SauB', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });

  const backupDir = path.join(dataDir, 'backups');
  const forced = fs.readdirSync(backupDir).filter(n => /-truoc-ghi-de-\d{9}\.db$/.test(n));
  assert.ok(forced.length >= 1, 'phải có bản trước-ghi-đè');

  const DB = (await import('better-sqlite3')).default;
  const holdsOldOnly = forced.some(n => {
    const conn = new DB(path.join(backupDir, n), { readonly: true });
    const a = conn.prepare('SELECT id FROM products WHERE id = ?').get('SNAPA');
    const b = conn.prepare('SELECT id FROM products WHERE id = ?').get('SNAPB');
    conn.close();
    return !!a && !b;
  });
  assert.ok(holdsOldOnly, 'có bản chụp chứa dữ liệu trước lần ghi đè thứ hai');

  const list = await (await fetch(`${BASE}/api/backups`, { headers: { Cookie: deviceCookie } })).json();
  assert.ok(list.backups.some(b => /truoc-ghi-de/.test(b.name)), '/api/backups phải liệt kê cả bản trước-ghi-đè');
});

test('server.js: bản backup ngày chụp trạng thái TRƯỚC lần ghi đầu tiên trong ngày', async () => {
  await put(emptyState({ products: [{ id: 'DAYOLD', name: 'CuTrongNgay', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  const backupDir = path.join(dataDir, 'backups');
  for (const n of fs.readdirSync(backupDir)) {
    if (/^backup-\d{4}-\d{2}-\d{2}\.db$/.test(n)) fs.unlinkSync(path.join(backupDir, n));
  }
  const base = (await getState()).updatedAt;
  const res = await put(emptyState({ products: [{ id: 'DAYNEW', name: 'MoiTrongNgay', stock: 1, costPrice: 1 }] }), { 'X-Base-Updated': String(base) });
  assert.equal(res.status, 200);

  const daily = fs.readdirSync(backupDir).filter(n => /^backup-\d{4}-\d{2}-\d{2}\.db$/.test(n));
  assert.equal(daily.length, 1, 'phải có bản backup ngày vừa tạo lại');
  const DB = (await import('better-sqlite3')).default;
  const conn = new DB(path.join(backupDir, daily[0]), { readonly: true });
  const oldRow = conn.prepare('SELECT id FROM products WHERE id = ?').get('DAYOLD');
  const newRow = conn.prepare('SELECT id FROM products WHERE id = ?').get('DAYNEW');
  conn.close();
  assert.ok(oldRow, 'bản backup ngày phải chứa dữ liệu trước khi ghi');
  assert.ok(!newRow, 'bản backup ngày không được chứa lần ghi đầu tiên');
});

test('server.js: tồn khớp nhập trừ bán thì không cảnh báo, kể cả 0.1 + 0.2', async () => {
  const state = emptyState({
    products: [{ id: 'P1', name: 'Khớp', stock: 0.1 + 0.2, costPrice: 1 }],
    transactions: [
      { id: 'N1', date: '2026-11-07', type: 'NHAP', productId: 'P1', qty: 0.1, price: 1, total: 1, ts: 1 },
      { id: 'N2', date: '2026-11-07', type: 'NHAP', productId: 'P1', qty: 0.2, price: 1, total: 1, ts: 2 }
    ]
  });
  const res = await put(state, { 'X-Force': '1' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  const warnings = res.body.warnings || [];
  assert.equal(warnings.some(w => String(w).includes('tồn')), false);
  assert.equal(res.body.stockDrift, undefined);
});

test('server.js: tồn khác nhập trừ bán thì cảnh báo nhưng vẫn ghi', async () => {
  const state = emptyState({
    products: [{ id: 'P1', name: 'Lệch', stock: 1.43, costPrice: 1 }],
    transactions: [
      { id: 'N1', date: '2026-11-07', type: 'NHAP', productId: 'P1', qty: 1.42, price: 1, total: 1, ts: 1 }
    ]
  });
  const res = await put(state, { 'X-Force': '1' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  const warnings = res.body.warnings || [];
  assert.equal(warnings.some(w => w.includes('Lệch') && w.includes('1.43') && w.includes('1.42')), true);
  assert.deepEqual(res.body.stockDrift, [{ id: 'P1', name: 'Lệch', stock: 1.43, calc: 1.42 }]);
  const data = await getState();
  assert.equal(data.products[0].name, 'Lệch');
  assert.equal(data.products[0].stock, 1.43);
});

test('server.js: tồn thấp hơn lịch sử thì cảnh báo nhưng vẫn ghi', async () => {
  const state = emptyState({
    products: [{ id: 'P1', name: 'Thấp', stock: 1, costPrice: 1 }],
    transactions: [
      { id: 'N1', date: '2026-11-07', type: 'NHAP', productId: 'P1', qty: 2, price: 1, total: 1, ts: 1 }
    ]
  });
  const res = await put(state, { 'X-Force': '1' });
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  const warnings = res.body.warnings || [];
  assert.equal(warnings.some(w => w.includes('Thấp') && w.includes('lệch -1')), true);
  assert.deepEqual(res.body.stockDrift, [{ id: 'P1', name: 'Thấp', stock: 1, calc: 2 }]);
  const data = await getState();
  assert.equal(data.products[0].stock, 1);
});

test('server.js: tồn lớn hơn 0 mà chưa có giao dịch thì cảnh báo, tồn 0 thì không', async () => {
  const state = emptyState({
    products: [
      { id: 'P1', name: 'Tồn đầu', stock: 1, costPrice: 1 },
      { id: 'P0', name: 'Trống', stock: 0, costPrice: 1 }
    ]
  });
  const res = await put(state, { 'X-Force': '1' });
  assert.equal(res.status, 200);
  const warnings = res.body.warnings || [];
  assert.equal(warnings.some(w => w.includes('Tồn đầu')), true);
  assert.equal(warnings.some(w => w.includes('Trống')), false);
  assert.deepEqual(res.body.stockDrift, [{ id: 'P1', name: 'Tồn đầu', stock: 1, calc: 0 }]);
});

test('server.js: chỉ giữ 10 bản trước-ghi-đè gần nhất', async () => {
  for (let i = 0; i < 13; i++) {
    await put(emptyState({ products: [{ id: 'PR' + i, name: 'Prune ' + i, stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  }
  const backupDir = path.join(dataDir, 'backups');
  const forced = fs.readdirSync(backupDir).filter(n => /-truoc-ghi-de-\d{9}\.db$/.test(n));
  assert.equal(forced.length, 10);
});

test('server.js: không cookie thì /api/state là 401, /healthz vẫn ok', async () => {
  const health = await fetch(`${BASE}/healthz`);
  assert.equal(health.status, 200);
  assert.equal((await health.text()).trim(), 'ok');
  const r = await fetch(`${BASE}/api/state`);
  assert.equal(r.status, 401);
  const body = await r.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'device_not_approved');
});

test('server.js: placeholder SSR thay một lượt, giữ nguyên ký tự đặc biệt', async () => {
  const name = "%%NEEDFETCH%% %%BOOT%% $& $' $` </script>";
  const r = await put(emptyState({
    products: [{ id: 'P_SPECIAL', name, stock: 0, costPrice: 0 }]
  }), { 'X-Force': '1' });
  assert.equal(r.status, 200);
  const page = await fetch(`${BASE}/`, { headers: { Cookie: deviceCookie } });
  const html = await page.text();
  const m = html.match(/window\.__DB__=(.*?);\s*window\.__NEED_FETCH__/s);
  assert.ok(m, 'phải tìm thấy boot JSON');
  const boot = JSON.parse(m[1]);
  assert.equal(boot.products[0].name, name);
  assert.equal(m[1].includes('$&'), true);
});

test('server.js: tên quá 200 ký tự bị 400, tên đúng 200 được nhận', async () => {
  const tooLong = await put(emptyState({
    products: [{ id: 'P1', name: 'A'.repeat(201), stock: 0, costPrice: 0 }]
  }), { 'X-Force': '1' });
  assert.equal(tooLong.status, 400);
  assert.match(tooLong.body.details.join(' '), /tên quá dài/);

  const oneMb = await put(emptyState({
    products: [{ id: 'P1', name: 'A'.repeat(1024 * 1024), stock: 0, costPrice: 0 }]
  }), { 'X-Force': '1' });
  assert.equal(oneMb.status, 400);

  const ok = await put(emptyState({
    products: [{ id: 'P1', name: 'A'.repeat(200), stock: 0, costPrice: 0 }]
  }), { 'X-Force': '1' });
  assert.equal(ok.status, 200);
});

test('server.js: số lượng cực lớn, Infinity và vượt trần bị 400', async () => {
  const base = () => emptyState({
    products: [{ id: 'P1', name: 'A', stock: 1, costPrice: 1 }],
    transactions: [{ id: 'T1', date: '2026-11-06', type: 'NHAP', productId: 'P1', qty: 1, price: 1, total: 1 }]
  });
  const badQty = (qty) => {
    const s = base();
    s.transactions[0].qty = qty;
    return put(s, { 'X-Force': '1' });
  };
  assert.equal((await badQty(1e308)).status, 400);
  assert.equal((await badQty('1e309')).status, 400);
  assert.equal((await badQty(1e6 + 1)).status, 400);
  const zero = base(); zero.transactions[0].qty = 0;
  assert.equal((await put(zero, { 'X-Force': '1' })).status, 400);

  const bigStock = base(); bigStock.products[0].stock = 1e6 + 1;
  assert.equal((await put(bigStock, { 'X-Force': '1' })).status, 400);
  const bigMoney = base(); bigMoney.transactions[0].total = 1e12 + 1;
  assert.equal((await put(bigMoney, { 'X-Force': '1' })).status, 400);
  const bigThang = base(); bigThang.transactions[0].thang = 1e4 + 1;
  assert.equal((await put(bigThang, { 'X-Force': '1' })).status, 400);
  const bigGrams = base(); bigGrams.transactions[0].g = 1e9 + 1;
  assert.equal((await put(bigGrams, { 'X-Force': '1' })).status, 400);
});

test('server.js: ngày không có thật hoặc ngoài 2000-2100 bị 400', async () => {
  const s = emptyState({
    products: [{ id: 'P1', name: 'A', stock: 0, costPrice: 0 }],
    transactions: [{ id: 'T1', date: '2026-13-40', type: 'NHAP', productId: 'P1', qty: 1, price: 1, total: 1 }]
  });
  assert.equal((await put(s, { 'X-Force': '1' })).status, 400);
  const old = structuredClone(s);
  old.transactions[0].date = '1999-12-31';
  assert.equal((await put(old, { 'X-Force': '1' })).status, 400);
});

test('server.js: file migration hỏng không chặn khởi động', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-bad-json-'));
  const port = 8898;
  fs.writeFileSync(path.join(dir, 'truoc-lam-tron-2026-11-06-1047.json'), '{bad');
  const child2 = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port), DATA_DIR: dir, QLK_SETUP_CODE: 'TESTCODE2026KHO' },
    stdio: 'ignore'
  });
  try {
    const started = Date.now();
    let ok = false;
    while (Date.now() - started < 15000) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/healthz`);
        if (r.ok) { ok = true; break; }
      } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 150));
    }
    assert.equal(ok, true, 'server phải khởi động dù file migration hỏng');
  } finally {
    child2.kill();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});


test('client sanitize/parseBackup tương thích server: mẫu biên không bị 400', async () => {
  const client = loadClientStateFns();
  const base = () => ({
    products: [{ id: 'P1', name: 'A', stock: 0, costPrice: 0 }],
    transactions: [], prescriptions: []
  });
  const samples = [];
  let s = base(); s.products[0].name = 'A'.repeat(1024 * 1024); samples.push(['tên 1MB', s]);
  s = base(); s.transactions.push({ id: 'T1', date: '2026-11-06', type: 'NHAP', productId: 'P1', qty: 1e308, price: 1, total: 1 }); samples.push(['qty 1e308', s]);
  s = base(); s.transactions.push({ id: 'T1', date: '2026-11-06', type: 'NHAP', productId: 'P1', qty: '1e309', price: 1, total: 1 }); samples.push(['qty 1e309', s]);
  s = base(); s.transactions.push({ id: 'T1', date: '2026-13-40', type: 'NHAP', productId: 'P1', qty: 1, price: 1, total: 1 }); samples.push(['ngày 2026-13-40', s]);
  s = base(); s.transactions.push({ id: 'T1', date: '2026-11-06', type: 'NHAP', productId: 'P1', qty: 0, price: 1, total: 1 }); samples.push(['qty 0', s]);
  s = base(); s.prescriptions.push({ id: 'R1', name: 'D', total: 1, thang: 1, items: [{ productId: 'P1', grams: 0 }] }); samples.push(['grams 0', s]);
  s = base(); s.prescriptions.push({ id: 'R1', name: 'D', total: 1, thang: 0, items: [{ productId: 'P1', grams: 1 }] }); samples.push(['thang 0', s]);
  for (const [label, state] of samples) {
    const bak = client.parseBackup(JSON.stringify({ app: 'quan-ly-kho', data: { ...state, moneyUnit: 'dong' } }));
    assert.equal(bak, null, 'parseBackup phải hủy: ' + label);
    const out = client.sanitize(state);
    const r = await put(out, { 'X-Force': '1' });
    assert.notEqual(r.status, 400, 'sanitize đầu ra bị server từ chối: ' + label);
  }
});
