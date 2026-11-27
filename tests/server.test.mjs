/**
 * Test chạy trực tiếp server.js (bản local production) qua HTTP thật.
 *
 * File này bảo đảm server.js (bản local production) đúng khi chạy thật qua HTTP:
 * validate snapshot, conflict 409, làm tròn tiền, và tự động sao lưu.
 *
 * Cách chạy: npm test (tương đương node --test tests/server.test.mjs), trong Docker.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import vm from 'node:vm';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGE, APP, CSS, STYLE_MARK } from '../src/page.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SETUP_CODE = 'TESTCODE2026KHO';
let PORT = 0;
let BASE = '';

let child;
let dataDir;
let deviceCookie = '';

/* Cổng trống do hệ điều hành cấp (listen 0), tránh đụng cổng cứng trên máy. */
function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

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
    body: JSON.stringify({ moneyUnit: 'dong', ...state })
  });
  let body = null;
  try { body = await r.json(); } catch (e) {}
  return { status: r.status, body };
}

async function getState() {
  const r = await fetch(`${BASE}/api/state`, { headers: { Cookie: deviceCookie } });
  return (await r.json()).data;
}


/* Nạp sanitize/parseBackup thật từ src/app.js để kiểm tương thích client-server. */
function loadClientStateFns() {
  let js = APP
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

let serverErr = '';
test.before(async () => {
  PORT = await freePort();
  BASE = `http://127.0.0.1:${PORT}`;
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-test-'));
  child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(PORT), DATA_DIR: dataDir, QLK_SETUP_CODE: SETUP_CODE },
    stdio: ['ignore', 'ignore', 'pipe']
  });
  child.stderr.on('data', d => { serverErr += d.toString(); });
  await waitForServer();
  await enrollDevice();
});

const waitExit = (c) => new Promise(r => { if (c.exitCode !== null || c.signalCode) return r(); const t = setTimeout(r, 5000); c.once('exit', () => { clearTimeout(t); r(); }); });
const rmDir = (d) => fs.rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });

test.after(async () => {
  if (child) { child.kill(); await waitExit(child); }
  if (dataDir) rmDir(dataDir);
});

test('2.40.5 src/page.js ghép index.html + style.css + app.js: đủ khối, không sót chỗ đánh dấu', () => {
  assert.equal(CSS.split(STYLE_MARK).length, 2, 'style.css có đúng một dấu tách khối style');
  assert.ok(PAGE.includes('<script>\n' + APP + '</script>'), 'app.js nằm nguyên văn trong trang');
  assert.ok(!/%%STYLE%%|%%APP%%|@@tach-style@@/.test(PAGE), 'không sót chỗ đánh dấu');
  assert.equal(PAGE.split('<style>').length, 3);
  assert.equal(PAGE.split('<script>').length, 3);
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

test('server.js: W3 X-Op-Id trùng lần ghi gần nhất trả lại success, không ghi lại, không 409', async () => {
  const st = emptyState({ products: [{ id: 'OPA', name: 'OpA', stock: 1, costPrice: 1 }] });
  const first = await put(st, { 'X-Force': '1', 'X-Op-Id': 'OP_test1' });
  assert.equal(first.status, 200);
  const base = first.body.updatedAt;
  const again = await put(st, { 'X-Base-Updated': '0', 'X-Op-Id': 'OP_test1' });
  assert.equal(again.status, 200);
  assert.equal(again.body.success, true);
  assert.equal(again.body.updatedAt, base);
  assert.equal((await getState()).updatedAt, base);
  // op khác với base cũ vẫn 409
  const other = await put(st, { 'X-Base-Updated': '0', 'X-Op-Id': 'OP_test2' });
  assert.equal(other.status, 409);
  // không gửi X-Op-Id: hành vi cũ
  assert.equal((await put(st, { 'X-Base-Updated': '0' })).status, 409);
  // op sai định dạng bị bỏ qua
  assert.equal((await put(st, { 'X-Base-Updated': '0', 'X-Op-Id': 'OP test!' })).status, 409);
  // ghi khác chen vào thì op cũ không còn được coi là đã ghi
  const w = await put(emptyState({ products: [{ id: 'OPB', name: 'OpB', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  assert.equal(w.status, 200);
  assert.equal((await put(st, { 'X-Base-Updated': '0', 'X-Op-Id': 'OP_test1' })).status, 409);
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
  assert.ok(!html.includes('%%BOOT%%'));
  assert.ok(!html.includes('%%NEEDFETCH%%'));
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
    products: Array.from({ length: 560000 }, (_, i) => ({
      id: 'P' + i,
      name: 'Thuoc ' + i,
      stock: 1,
      costPrice: 10
    }))
  });
  const bodyStr = JSON.stringify(largeState);
  // Ca này chỉ có nghĩa khi thân thật sự vượt MAX_BODY (32 MB); không có điều kiện bao quanh.
  assert.ok(Buffer.byteLength(bodyStr) > 32 * 1024 * 1024, 'thân phải lớn hơn 32 MB, hiện ' + Buffer.byteLength(bodyStr));
  const r = await fetch(`${BASE}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: deviceCookie },
    body: bodyStr
  });
  assert.equal(r.status, 413);
  const json = await r.json();
  assert.equal(json.success, false);
  assert.equal(json.error, 'Payload too large');
});

test('server.js: thiếu X-Base-Updated (và không X-Force) bị từ chối 428, dữ liệu không đổi', async () => {
  await put(emptyState({ products: [{ id: 'H1', name: 'GiuNguyen', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  const res = await put(emptyState({ products: [{ id: 'H2', name: 'GhiMu', stock: 1, costPrice: 1 }] }));
  assert.equal(res.status, 428);
  assert.equal(res.body.success, false);
  const data = await getState();
  assert.deepEqual(data.products.map(p => p.id), ['H1']);
});

test('W7/W8: khóa tên khớp client (khoảng trắng, NFC → 400); oname thiếu oid được giữ', async () => {
  await put(emptyState({ products: [{ id: 'W0', name: 'Goc', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  const hdr = { 'X-Base-Updated': String((await getState()).updatedAt) };
  const mkP = (a, b) => emptyState({ products: [{ id: 'W1', name: a, stock: 1, costPrice: 1 }, { id: 'W2', name: b, stock: 1, costPrice: 1 }] });
  const sp = await put(mkP('Cam  Thảo', 'cam thảo'), hdr);
  assert.equal(sp.status, 400);
  const nfc = await put(mkP('Thảo', 'Thảo'), hdr);
  assert.equal(nfc.status, 400);
  const ok = await put(emptyState({
    products: [{ id: 'W1', name: 'A', stock: 5, costPrice: 1 }],
    transactions: [{ id: 'TW', date: '2026-11-06', type: 'BAN', productId: 'W1', qty: 1, price: 1, total: 1, ts: 1, oname: 'Bán lẻ' }]
  }), hdr);
  assert.equal(ok.status, 200);
  assert.equal((await getState()).transactions[0].oname, 'Bán lẻ');
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

  // 2.38.32: tên đơn thuốc so theo cùng khóa chuẩn hóa với tên vị thuốc (hoa/thường, khoảng trắng, NFC)
  const dupRxNorm = await put(emptyState({
    products: [{ id: 'D1', name: 'A', stock: 1, costPrice: 1 }],
    prescriptions: [
      { id: 'R1', name: 'Bát Vị', items: [{ productId: 'D1', grams: 5 }], total: 10, thang: 1 },
      { id: 'R2', name: '  bát   vị ', items: [{ productId: 'D1', grams: 5 }], total: 10, thang: 1 }
    ]
  }), hdr);
  assert.equal(dupRxNorm.status, 400);
  assert.ok(dupRxNorm.body.details.some(m => m.includes('trùng tên đơn thuốc')));

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

test('server.js: X-Force mà không chụp được bản trước-ghi-đè → 500, không ghi gì', async () => {
  await put(emptyState({ products: [{ id: 'NOSNAP0', name: 'GiuNguyen', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  const before = (await getState()).updatedAt;
  const bd = path.join(dataDir, 'backups');
  const aside = bd + '-aside';
  fs.renameSync(bd, aside);
  fs.writeFileSync(bd, 'x'); // một FILE chắn đúng chỗ thư mục backup → mkdir/VACUUM lỗi
  try {
    const r = await put(emptyState({ products: [{ id: 'NOSNAP1', name: 'KhongDuocGhi', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
    assert.equal(r.status, 500);
    assert.equal(r.body.success, false);
    const after = await getState();
    assert.equal(after.updatedAt, before, 'updatedAt giữ nguyên');
    assert.ok(after.products.some(p => p.id === 'NOSNAP0') && !after.products.some(p => p.id === 'NOSNAP1'));
  } finally {
    fs.rmSync(bd, { force: true });
    fs.renameSync(aside, bd);
  }
  const snapNames = () => new Set(fs.readdirSync(bd).filter(n => /-truoc-ghi-de-\d{9}\.db$/.test(n)));
  const snapBefore = snapNames();
  const ok = await put(emptyState({ products: [{ id: 'NOSNAP2', name: 'GhiDuoc', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  assert.equal(ok.status, 200);
  assert.ok([...snapNames()].some(n => !snapBefore.has(n)), 'PUT X-Force thành công chụp một file truoc-ghi-de mới (server giữ tối đa 10)');
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

test('server.js: /inter.woff2 cần cookie thiết bị; đường lên thư mục cha không lộ mã nguồn', async () => {
  const ok = await fetch(`${BASE}/inter.woff2`, { headers: { Cookie: deviceCookie } });
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get('content-type'), /font\/woff2/);
  assert.ok((await ok.arrayBuffer()).byteLength > 40000);
  assert.equal((await fetch(`${BASE}/inter.woff2`)).status, 401);
  for (const u of ['/inter.woff2/../server.js', '/%2e%2e/server.js']) {
    for (const h of [{ Cookie: deviceCookie }, {}]) {
      const r = await fetch(`${BASE}${u}`, { headers: h });
      assert.ok([401, 404].includes(r.status), u + ' status=' + r.status);
      assert.ok(!(await r.text()).includes('better-sqlite3'));
    }
  }
});

test('server.js: icon PWA công khai không cookie (GET/HEAD 200, đúng Content-Type); /api/state vẫn 401', async () => {
  const want = { '/icon-192.png': 'image/png', '/icon-512.png': 'image/png', '/apple-touch-icon.png': 'image/png',
    '/icon-maskable-192.png': 'image/png', '/icon-maskable-512.png': 'image/png',
    '/favicon.ico': 'image/x-icon', '/favicon.svg': 'image/svg+xml' };
  for (const [p, ct] of Object.entries(want)) {
    for (const method of ['GET', 'HEAD']) {
      const r = await fetch(`${BASE}${p}`, { method });
      assert.equal(r.status, 200, method + ' ' + p);
      assert.match(r.headers.get('content-type'), new RegExp(ct.replace('+', '\\+')), p);
    }
  }
  assert.equal((await fetch(`${BASE}/api/state`)).status, 401);
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

/* AD: bỏ migrateMoneyToDong; chốt chặn: DB có dữ liệu mà money_unit khác 'dong' (bản sao lưu cũ theo nghìn) → server KHÔNG khởi động; DB trống → ghi nhãn 'dong' và chạy. */
async function runServerOnce(dir, waitHealth) {
  const port = await freePort();
  let out = '';
  const c = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: String(port), DATA_DIR: dir, QLK_SETUP_CODE: 'TESTCODE2026KHO' }, stdio: ['ignore', 'pipe', 'pipe'] });
  c.stdout.on('data', d => { out += d; }); c.stderr.on('data', d => { out += d; });
  const started = Date.now(); let healthy = false;
  while (Date.now() - started < 15000) {
    if (c.exitCode !== null) break;
    if (waitHealth) { try { if ((await fetch(`http://127.0.0.1:${port}/healthz`)).ok) { healthy = true; break; } } catch (e) {} }
    await new Promise(r => setTimeout(r, 150));
  }
  if (!waitHealth) await waitExit(c);
  const code = c.exitCode;
  if (c.exitCode === null) { c.kill(); await waitExit(c); }
  return { code, healthy, out };
}
test('server.js: AD DB kiểu cũ (có dữ liệu, không money_unit = dong) → từ chối khởi động; DB trống khởi động và ghi nhãn dong', async () => {
  const { default: Database } = await import('better-sqlite3');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-money-'));
  try {
    const first = await runServerOnce(dir, true);
    assert.equal(first.healthy, true, 'DB trống khởi động được');
    let d = new Database(path.join(dir, 'app.db'));
    assert.equal(d.prepare("SELECT value FROM app_meta WHERE key = 'money_unit'").get().value, 'dong');
    d.prepare('INSERT INTO products (id, name, stock_kg, cost_price_vnd, created_at, updated_at) VALUES (?,?,?,?,?,?)').run('P1', 'A', 1, 85, 1, 1);
    d.close();
    const ok = await runServerOnce(dir, true);
    assert.equal(ok.healthy, true, 'có dữ liệu + money_unit=dong khởi động bình thường');
    d = new Database(path.join(dir, 'app.db'));
    d.prepare("DELETE FROM app_meta WHERE key = 'money_unit'").run();
    d.close();
    const old = await runServerOnce(dir, false);
    assert.equal(old.code, 1, 'DB kiểu cũ có dữ liệu bị từ chối');
    assert.match(old.out, /Dữ liệu kiểu cũ \(tiền theo nghìn\), không dùng được với bản này/);
    d = new Database(path.join(dir, 'app.db'));
    assert.equal(d.prepare('SELECT cost_price_vnd FROM products WHERE id = ?').get('P1').cost_price_vnd, 85, 'không nhân 1000 lặng lẽ');
    d.prepare("INSERT INTO app_meta(key, value) VALUES('money_unit', 'k')").run();
    d.close();
    const k = await runServerOnce(dir, false);
    assert.equal(k.code, 1, 'money_unit khác dong cũng bị từ chối');
  } finally { rmDir(dir); }
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

test('server.js: PUT bị từ chối (400/428/409) ghi một dòng log, không lộ dữ liệu', async () => {
  const SECRET = 'TenBiMatXyz987';
  const start = serverErr.length;
  const base = await put(emptyState({ products: [{ id: 'L1', name: 'A', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  assert.equal(base.status, 200);
  assert.equal((await put(emptyState({ products: [{ id: 'L2', name: SECRET, stock: -5, costPrice: 777777 }] }), { 'X-Base-Updated': String(base.body.updatedAt) })).status, 400);
  assert.equal((await put(emptyState({ products: [{ id: 'L3', name: SECRET, stock: 1, costPrice: 1 }] }))).status, 428);
  assert.equal((await put(emptyState({ products: [{ id: 'L4', name: SECRET, stock: 1, costPrice: 1 }] }), { 'X-Base-Updated': '0' })).status, 409);
  await new Promise(r => setTimeout(r, 300));
  const log = serverErr.slice(start);
  const lines = log.split(/\r?\n/).filter(l => l.includes('PUT /api/state từ chối'));
  assert.equal(lines.length, 3, log);
  for (const code of ['400', '428', '409']) assert.ok(lines.some(l => l.includes(' ' + code + ':')), 'thiếu dòng ' + code);
  assert.match(lines[0], /^\d{4}-\d\d-\d\dT/);
  assert.ok(!log.includes(SECRET) && !log.includes('777777') && !log.includes('qlk_dev'), 'log lộ dữ liệu');
});

test('server.js: log từ chối có dòng cho 400 "JSON không hợp lệ" và 400 "X-Base-Updated không hợp lệ"; PUT 200 không ghi dòng từ chối', async () => {
  const SECRET = 'RoiRacBiMat654';
  const start = serverErr.length;
  const rejectLines = () => serverErr.slice(start).split(/\r?\n/).filter(l => l.includes('PUT /api/state từ chối'));
  const bad = await fetch(`${BASE}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Base-Updated': '1', Cookie: deviceCookie },
    body: '{"products":[{"name":"' + SECRET + '"'
  });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error, 'JSON không hợp lệ');
  const nan = await put(emptyState({ products: [{ id: 'N1', name: SECRET, stock: 1, costPrice: 1 }] }), { 'X-Base-Updated': 'abc' });
  assert.equal(nan.status, 400);
  assert.equal(nan.body.error, 'X-Base-Updated không hợp lệ');
  await new Promise(r => setTimeout(r, 300));
  let lines = rejectLines();
  assert.equal(lines.length, 2, serverErr.slice(start));
  assert.ok(lines.some(l => l.includes(' 400: JSON không hợp lệ')), 'thiếu dòng log JSON không hợp lệ');
  assert.ok(lines.some(l => l.includes(' 400: X-Base-Updated không hợp lệ')), 'thiếu dòng log X-Base-Updated không hợp lệ');
  assert.ok(lines.every(l => /^\d{4}-\d\d-\d\dT/.test(l)));
  // PUT thành công (X-Force và có X-Base-Updated đúng) không thêm dòng từ chối nào
  const ok1 = await put(emptyState({ products: [{ id: 'N2', name: 'A', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  assert.equal(ok1.status, 200);
  const ok2 = await put(emptyState({ products: [{ id: 'N3', name: 'A', stock: 1, costPrice: 1 }] }), { 'X-Base-Updated': String(ok1.body.updatedAt) });
  assert.equal(ok2.status, 200);
  await new Promise(r => setTimeout(r, 300));
  lines = rejectLines();
  assert.equal(lines.length, 2, 'PUT 200 không được ghi dòng từ chối: ' + serverErr.slice(start));
  assert.ok(!serverErr.slice(start).includes(SECRET), 'log lộ dữ liệu');
});

test('2.16.0 PWA: manifest/icon/sw công khai đúng Content-Type, không chứa dữ liệu; "/" và /api/state vẫn bị chặn', async () => {
  const m = await fetch(`${BASE}/manifest.webmanifest`);
  assert.equal(m.status, 200);
  assert.match(m.headers.get('content-type'), /^application\/manifest\+json/);
  const mj = JSON.parse(await m.text());
  assert.equal(mj.display, 'standalone');
  assert.equal(mj.start_url, '/');
  assert.ok(mj.icons.some(i => i.sizes === '192x192') && mj.icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable'));
  for (const [p, n] of [['/icon-192.png', 192], ['/icon-512.png', 512], ['/apple-touch-icon.png', 180]]) {
    const r = await fetch(`${BASE}${p}`);
    assert.equal(r.status, 200, p);
    assert.equal(r.headers.get('content-type'), 'image/png');
    const b = Buffer.from(await r.arrayBuffer());
    assert.equal(b.subarray(1, 4).toString(), 'PNG');
    assert.equal(b.readUInt32BE(16), n);
  }
  const sw = await fetch(`${BASE}/sw.js`);
  assert.equal(sw.status, 200);
  assert.match(sw.headers.get('content-type'), /javascript/);
  assert.equal(sw.headers.get('cache-control'), 'no-cache');
  assert.equal(sw.headers.get('service-worker-allowed'), '/');
  const swText = await sw.text();
  assert.ok(!/\/api|caches\.|respondWith/.test(swText), 'sw.js không cache và không đụng /api');
  assert.equal((await fetch(`${BASE}/`)).status === 200, false);
  assert.equal((await fetch(`${BASE}/api/state`)).status, 401);
  assert.equal((await fetch(`${BASE}/manifest.webmanifest`, { method: 'POST', body: 'x' })).status === 200, false);
});

test('2.16.0 PWA: CSP của "/" cho phép manifest và service worker cùng gốc', async () => {
  const csp = (await fetch(`${BASE}/`, { headers: { Cookie: deviceCookie } })).headers.get('content-security-policy');
  assert.ok(csp.includes("manifest-src 'self'"), csp);
  assert.ok(csp.includes("worker-src 'self'"), csp);
});

/* 2.17.4: moneyUnit bắt buộc là 'dong'; số phải là number hữu hạn hoặc chuỗi số thập phân (cùng luật với client). */
test('2.17.4 PUT thiếu moneyUnit hoặc moneyUnit sai → 400 và KHÔNG ghi đè DB; cờ đúng → 200', async () => {
  const ok = await put(emptyState({ products: [{ id: 'MU1', name: 'Mu Mot', stock: 1, costPrice: 1 }] }), { 'X-Force': '1' });
  assert.equal(ok.status, 200);
  const before = JSON.stringify(await getState());
  for (const unit of [undefined, 'nghin', 'k', 1, null]) {
    const r = await put(emptyState({ moneyUnit: unit, products: [{ id: 'MU2', name: 'Mu Hai', stock: 5, costPrice: 5 }] }), { 'X-Force': '1' });
    assert.equal(r.status, 400, 'moneyUnit=' + String(unit));
  }
  assert.equal(JSON.stringify(await getState()), before, '400 không được đổi dữ liệu');
});

test('2.17.4 isNonNegNumber/isPositiveNumber: boolean, chuỗi rỗng, khoảng trắng, null, mảng, 0x10 bị từ chối; số và chuỗi số thập phân được nhận', async () => {
  const bad = [true, false, '', ' ', null, [], [5], '0x10', 'abc', {}];
  for (const v of bad) {
    const r1 = await put(emptyState({ products: [{ id: 'NB1', name: 'So Mot', stock: v, costPrice: 1 }] }), { 'X-Force': '1' });
    assert.equal(r1.status, 400, 'stock=' + JSON.stringify(v));
    const r2 = await put(emptyState({ products: [{ id: 'NB2', name: 'So Hai', stock: 1, costPrice: 1 }], transactions: [{ id: 'NT', date: '2026-11-06', type: 'NHAP', productId: 'NB2', qty: v, price: 1, total: 1 }] }), { 'X-Force': '1' });
    assert.equal(r2.status, 400, 'qty=' + JSON.stringify(v));
  }
  for (const v of [5, '5', '5.5', 0, ' 7 ']) {
    const r = await put(emptyState({ products: [{ id: 'NG1', name: 'So Ba', stock: v, costPrice: 1 }] }), { 'X-Force': '1' });
    assert.equal(r.status, 200, 'stock hợp lệ=' + JSON.stringify(v));
  }
});

test('2.17.5 thang của giao dịch và đơn thuốc dùng cùng luật số: true, chuỗi rỗng, 0x10 → 400; 2 và "2" → 200', async () => {
  const prod = [{ id: 'TH1', name: 'Thang Mot', stock: 10, costPrice: 1 }];
  for (const v of [true, '', ' ', '0x10', [], 'abc']) {
    const r1 = await put(emptyState({ products: prod, transactions: [{ id: 'THT', date: '2026-11-06', type: 'NHAP', productId: 'TH1', qty: 1, price: 1, total: 1, thang: v }] }), { 'X-Force': '1' });
    assert.equal(r1.status, 400, 'tx.thang=' + JSON.stringify(v));
    const r2 = await put(emptyState({ products: prod, prescriptions: [{ id: 'THR', name: 'Don Thang', total: 1, thang: v, items: [{ productId: 'TH1', grams: 1 }] }] }), { 'X-Force': '1' });
    assert.equal(r2.status, 400, 'rx.thang=' + JSON.stringify(v));
  }
  for (const v of [2, '2']) {
    const r1 = await put(emptyState({ products: prod, transactions: [{ id: 'THT', date: '2026-11-06', type: 'NHAP', productId: 'TH1', qty: 1, price: 1, total: 1, thang: v }] }), { 'X-Force': '1' });
    assert.equal(r1.status, 200, 'tx.thang hợp lệ=' + JSON.stringify(v));
    const r2 = await put(emptyState({ products: prod, prescriptions: [{ id: 'THR', name: 'Don Thang', total: 1, thang: v, items: [{ productId: 'TH1', grams: 1 }] }] }), { 'X-Force': '1' });
    assert.equal(r2.status, 200, 'rx.thang hợp lệ=' + JSON.stringify(v));
  }
});

test('2.21.1 đường không có thật: 404 JSON kèm header bảo mật (không HTML mặc định Express)', async () => {
  const r = await fetch(`${BASE}/khong-co-duong-nay`, { headers: { Cookie: deviceCookie } });
  assert.equal(r.status, 404);
  assert.match(r.headers.get('content-type') || '', /application\/json/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.match(r.headers.get('content-security-policy') || '', /default-src 'none'/);
  assert.equal((await r.json()).success, false);
});

test('2.36.2 giao dịch: ts true/\'\'/[] → 400 (cùng isNumLike); thang lẻ được làm tròn như đơn thuốc (1.5 → 2, 1.4 → 1)', async () => {
  const prod = [{ id: 'TS1', name: 'Ts Mot', stock: 10, costPrice: 1 }];
  const tx = extra => ({ id: 'TST', date: '2026-11-06', type: 'NHAP', productId: 'TS1', qty: 1, price: 1, total: 1, ...extra });
  for (const v of [true, '', ' ', [], '0x10']) {
    const r = await put(emptyState({ products: prod, transactions: [tx({ ts: v })] }), { 'X-Force': '1' });
    assert.equal(r.status, 400, 'tx.ts=' + JSON.stringify(v));
  }
  for (const [v, want] of [[1.5, 2], [1.4, 1], ['2.6', 3], [3, 3]]) {
    const r = await put(emptyState({ products: prod, transactions: [tx({ ts: 5, thang: v })] }), { 'X-Force': '1' });
    assert.equal(r.status, 200, 'tx.thang=' + v);
    const st = await getState();
    assert.equal(st.transactions.find(t => t.id === 'TST').thang, want, 'thang ' + v + ' → ' + want);
  }
});

/* ===== Chưa đọc của Lịch sử (bảng unread) ===== */
const uTx = (id, type, extra = {}) => ({ id, date: '2026-11-06', type, productId: 'P1', qty: 1, price: 1, total: 1, ts: 1, ...extra });
const uState = (txs) => emptyState({ products: [{ id: 'P1', name: 'Cam thảo', stock: 0, costPrice: 1 }], transactions: txs });
async function getUnread() {
  const r = await fetch(`${BASE}/api/unread`, { headers: { Cookie: deviceCookie } });
  return (await r.json()).data;
}
async function postRead(body, raw, extraHeaders = {}) {
  const r = await fetch(`${BASE}/api/unread/read`, { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: deviceCookie, ...extraHeaders }, body: raw ?? JSON.stringify(body) });
  return r.status;
}
async function resetUnread() {
  assert.equal((await put(uState([]), { 'X-Force': '1' })).status, 200);
  await postRead({ all: 'BAN' }); await postRead({ all: 'NHAP' });
}
const baseOf = async () => String((await getState()).updatedAt);

test('unread: khóa mới → có; khóa cũ giữ nguyên; đơn nhiều dòng = 1 mục; BAN/NHAP tách loại', async () => {
  await resetUnread();
  assert.equal((await put(uState([uTx('A1', 'BAN', { orderId: 'O1' }), uTx('A2', 'BAN', { orderId: 'O1' }), uTx('N1', 'NHAP')]), { 'X-Base-Updated': await baseOf() })).status, 200);
  assert.deepEqual(await getUnread(), { BAN: ['O1'], NHAP: ['N1'] });
  await postRead({ all: 'BAN' }); await postRead({ all: 'NHAP' });
  assert.equal((await put(uState([uTx('A1', 'BAN', { orderId: 'O1' }), uTx('A2', 'BAN', { orderId: 'O1' }), uTx('N1', 'NHAP'), uTx('B1', 'BAN')]), { 'X-Base-Updated': await baseOf() })).status, 200);
  assert.deepEqual(await getUnread(), { BAN: ['B1'], NHAP: [] }, 'chỉ khóa mới B1');
});

test('unread: sửa đơn cũ (thêm dòng id mới cùng order_id, đã đọc) không thành chưa đọc lại', async () => {
  await resetUnread();
  await put(uState([uTx('A1', 'BAN', { orderId: 'O1' })]), { 'X-Base-Updated': await baseOf() });
  await postRead({ kind: 'BAN', keys: ['O1'] });
  assert.deepEqual(await getUnread(), { BAN: [], NHAP: [] });
  await put(uState([uTx('A1', 'BAN', { orderId: 'O1' }), uTx('A9', 'BAN', { orderId: 'O1' })]), { 'X-Base-Updated': await baseOf() });
  assert.deepEqual(await getUnread(), { BAN: [], NHAP: [] }, 'thêm dòng cùng order_id không đánh dấu lại');
  await put(uState([uTx('A10', 'BAN', { orderId: 'O1' })]), { 'X-Base-Updated': await baseOf() });
  assert.deepEqual(await getUnread(), { BAN: [], NHAP: [] }, 'đổi hết id dòng vẫn cùng khóa');
});

test('unread: xóa đơn thì dọn; X-Force không đánh dấu; >500 khóa mới không đánh dấu cái nào; đúng 500 thì có', async () => {
  await resetUnread();
  await put(uState([uTx('A1', 'BAN')]), { 'X-Base-Updated': await baseOf() });
  assert.deepEqual((await getUnread()).BAN, ['A1']);
  await put(uState([]), { 'X-Base-Updated': await baseOf() });
  assert.deepEqual((await getUnread()).BAN, [], 'xóa đơn → dọn');
  await put(uState([uTx('F1', 'BAN')]), { 'X-Force': '1' });
  assert.deepEqual((await getUnread()).BAN, [], 'X-Force không đánh dấu');
  await put(uState([]), { 'X-Force': '1' });
  const many = Array.from({ length: 501 }, (_, i) => uTx('M' + i, 'NHAP'));
  await put(uState(many), { 'X-Base-Updated': await baseOf() });
  assert.deepEqual((await getUnread()).NHAP, [], '>500 không đánh dấu');
  await put(uState([]), { 'X-Force': '1' });
  const ok = Array.from({ length: 500 }, (_, i) => uTx('K' + i, 'NHAP'));
  await put(uState(ok), { 'X-Base-Updated': await baseOf() });
  assert.equal((await getUnread()).NHAP.length, 500, 'đúng 500 khóa mới thì đánh dấu');
});

test('unread: POST read idempotent, sai dạng 400, không đổi updatedAt, chưa đăng nhập bị chặn', async () => {
  await resetUnread();
  await put(uState([uTx('A1', 'BAN'), uTx('A2', 'BAN')]), { 'X-Base-Updated': await baseOf() });
  const up = await baseOf();
  assert.equal(await postRead({ kind: 'BAN', keys: ['A1'] }), 200);
  assert.equal(await postRead({ kind: 'BAN', keys: ['A1'] }), 200, 'lặp lại vẫn 200');
  assert.deepEqual((await getUnread()).BAN, ['A2']);
  assert.equal(await baseOf(), up, 'POST không đổi updatedAt');
  assert.equal((await put(uState([uTx('A1', 'BAN'), uTx('A2', 'BAN')]), { 'X-Base-Updated': up })).status, 200, 'base cũ vẫn dùng được, không 409');
  assert.equal(await postRead({ all: 'BAN' }), 200); assert.equal(await postRead({ all: 'BAN' }), 200);
  assert.deepEqual((await getUnread()).BAN, []);
  for (const bad of [{ all: 'X' }, { kind: 'BAN' }, { kind: 'BAN', keys: [1] }, { kind: 'BAN', keys: ['x'.repeat(65)] }, { kind: 'BAN', keys: Array(501).fill('a') }, { all: 'BAN', kind: 'BAN', keys: [] }, [], 'x']) {
    assert.equal(await postRead(bad), 400, JSON.stringify(bad).slice(0, 40));
  }
  assert.equal(await postRead(null, '{hỏng'), 400);
  assert.equal((await fetch(`${BASE}/api/unread`)).status, 401, 'GET chưa đăng nhập');
  assert.equal((await fetch(`${BASE}/api/unread/read`, { method: 'POST', body: '{"all":"BAN"}' })).status, 401, 'POST chưa đăng nhập');
});

test('unread: DB cũ chưa có bảng unread → migrate tạo bảng rỗng, lịch sử cũ không chưa đọc', async () => {
  const { default: Database } = await import('better-sqlite3');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-unread-old-'));
  const port = await freePort();
  const old = new Database(path.join(dir, 'app.db'));
  old.exec(`CREATE TABLE products (id TEXT PRIMARY KEY, name TEXT NOT NULL, stock_kg REAL NOT NULL DEFAULT 0, cost_price_vnd REAL NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
    CREATE TABLE transactions (id TEXT PRIMARY KEY, date TEXT NOT NULL, type TEXT NOT NULL CHECK (type IN ('NHAP','BAN')), product_id TEXT NOT NULL, qty_kg REAL NOT NULL, price_vnd REAL NOT NULL, total_vnd REAL NOT NULL, cost_vnd REAL, order_id TEXT, order_name TEXT, retail INTEGER NOT NULL DEFAULT 0, rx INTEGER NOT NULL DEFAULT 0, grams REAL, thang INTEGER, unit_price_vnd REAL, ts INTEGER, created_at INTEGER NOT NULL);
    INSERT INTO transactions (id,date,type,product_id,qty_kg,price_vnd,total_vnd,created_at) VALUES ('OLD','2026-01-01','BAN','P1',1,1,1,1);
    CREATE TABLE app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL); INSERT INTO app_meta VALUES ('money_unit','dong');`);
  old.close();
  const c2 = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: String(port), DATA_DIR: dir, QLK_SETUP_CODE: SETUP_CODE }, stdio: 'ignore' });
  try {
    const b2 = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) { try { if ((await fetch(b2 + '/healthz')).ok) break; } catch (e) {} await new Promise(r => setTimeout(r, 150)); }
    const s = await fetch(`${b2}/auth/setup`, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: SETUP_CODE, name: 'May cu' }).toString() });
    const cookie = String(s.headers.getSetCookie()[0]).split(';')[0];
    const r = await fetch(`${b2}/api/unread`, { headers: { Cookie: cookie } });
    assert.deepEqual((await r.json()).data, { BAN: [], NHAP: [] });
  } finally { c2.kill(); await waitExit(c2); rmDir(dir); }
});

test('unread: POST khác nguồn bị 403 và dữ liệu không đổi; cùng nguồn hoặc không Origin vẫn 200', async () => {
  await resetUnread();
  await put(uState([uTx('A1', 'BAN')]), { 'X-Base-Updated': await baseOf() });
  assert.equal(await postRead({ all: 'BAN' }, undefined, { 'Sec-Fetch-Site': 'cross-site', Origin: 'https://evil.example' }), 403);
  assert.equal(await postRead({ all: 'BAN' }, undefined, { Origin: 'https://evil.example' }), 403, 'Origin lạ không kèm Sec-Fetch-Site');
  assert.equal(await postRead({ all: 'BAN' }, undefined, { Origin: 'null' }), 403, 'Origin: null');
  assert.deepEqual((await getUnread()).BAN, ['A1'], 'bị chặn thì không xóa gì');
  assert.equal(await postRead({ kind: 'BAN', keys: ['A1'] }, undefined, { 'Sec-Fetch-Site': 'same-origin', Origin: BASE }), 200, 'cùng nguồn');
  assert.deepEqual((await getUnread()).BAN, []);
  assert.equal(await postRead({ all: 'BAN' }), 200, 'không Origin (client cùng nguồn, curl)');
});

test('unread: khóa dài hơn 64 ký tự không được đánh dấu và PUT vẫn 200', async () => {
  await resetUnread();
  const long = 'L'.repeat(65), ok = 'O'.repeat(64);
  assert.equal((await put(uState([uTx(long, 'BAN'), uTx(ok, 'BAN')]), { 'X-Base-Updated': await baseOf() })).status, 200);
  assert.deepEqual((await getUnread()).BAN, [ok]);
});

/* Z.2 P2-5: updatedAt tăng CHẶT dù nhiều lần ghi liên tiếp (cùng mili-giây). */
test('server.js: Z.2 PUT liên tiếp liền nhau cho updatedAt tăng chặt (không bao giờ trùng lần trước)', async () => {
  let prev = (await put(emptyState(), { 'X-Force': '1' })).body.updatedAt;
  assert.ok(Number.isFinite(prev));
  for (let i = 0; i < 15; i++) {
    const r = await put(emptyState(), { 'X-Base-Updated': String(prev) });
    assert.equal(r.status, 200);
    assert.ok(r.body.updatedAt > prev, 'lần ' + i + ': ' + r.body.updatedAt + ' phải > ' + prev);
    prev = r.body.updatedAt;
  }
});

/* Z.2 P2-4: server chỉ nghe 127.0.0.1 mặc định; Docker đặt HOST=0.0.0.0. */
test('server.js: Z.2 nghe HOST (mặc định 127.0.0.1, không cứng 0.0.0.0)', () => {
  const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.ok(src.includes("process.env.HOST || '127.0.0.1'"));
  assert.ok(!/app\.listen\(PORT, '0\.0\.0\.0'/.test(src), 'không cứng 0.0.0.0');
});

/* Z.2 R2: tất định — đồng hồ máy "lùi" so với source_updated_at đã lưu (đặt trước vào tương lai): updatedAt phải = trước + 1, không phải Date.now(). */
test('server.js: Z.2 R2 updatedAt = max(now, trước+1): source_updated_at ở tương lai thì lần ghi sau đúng trước+1', async () => {
  const { default: Database } = await import('better-sqlite3');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-clock-'));
  const port = await freePort();
  const start = async () => {
    const c = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: String(port), DATA_DIR: dir, QLK_SETUP_CODE: SETUP_CODE }, stdio: 'ignore' });
    const b = `http://127.0.0.1:${port}`;
    for (let i = 0; i < 100; i++) { try { if ((await fetch(b + '/healthz')).ok) break; } catch (e) {} await new Promise(r => setTimeout(r, 150)); }
    return { c, b };
  };
  let s1 = await start();
  const future = Date.now() + 3600 * 1000;
  try {
    s1.c.kill(); await waitExit(s1.c);
    const dbf = new Database(path.join(dir, 'app.db'));
    dbf.prepare("INSERT INTO app_meta (key, value) VALUES ('source_updated_at', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(String(future));
    dbf.close();
    s1 = await start();
    const setup = await fetch(`${s1.b}/auth/setup`, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: SETUP_CODE, name: 'May dong ho' }).toString() });
    const cookie = String(setup.headers.getSetCookie()[0]).split(';')[0];
    const r = await fetch(`${s1.b}/api/state`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Base-Updated': String(future), Cookie: cookie }, body: JSON.stringify({ moneyUnit: 'dong', products: [], transactions: [], prescriptions: [], updatedAt: 0 }) });
    const body = await r.json();
    assert.equal(r.status, 200, JSON.stringify(body));
    assert.equal(body.updatedAt, future + 1);
  } finally { s1.c.kill(); await waitExit(s1.c); rmDir(dir); }
});

/* AA: server nhận Content-Encoding: gzip; trần 32 MB tính SAU giải nén; gzip hỏng 400; thân thường vẫn chạy. */
async function putRaw(bodyBuf, headers = {}) {
  const r = await fetch(`${BASE}/api/state`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: deviceCookie, ...headers }, body: bodyBuf });
  let body = null; try { body = await r.json(); } catch (e) {}
  return { status: r.status, body };
}
test('server.js: AA body gzip được chấp nhận, dữ liệu giống hệt gửi thường', async () => {
  const zlib = await import('node:zlib');
  const state = emptyState({ products: [{ id: 'GZ1', name: 'Nén gzip thuốc', stock: 3, costPrice: 77 }] });
  const raw = Buffer.from(JSON.stringify({ moneyUnit: 'dong', ...state }), 'utf8');
  const res = await putRaw(zlib.gzipSync(raw), { 'Content-Encoding': 'gzip', 'X-Force': '1' });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const got = await getState();
  assert.equal(got.products.find(p => p.id === 'GZ1').name, 'Nén gzip thuốc');
  const plain = await putRaw(raw, { 'X-Base-Updated': String(res.body.updatedAt) });
  assert.equal(plain.status, 200, 'thân thường vẫn chạy');
});

test('server.js: AA bom nén: gzip nhỏ nhưng > 32 MB sau giải nén bị 413; gzip hỏng bị 400', async () => {
  const zlib = await import('node:zlib');
  const bomb = zlib.gzipSync(Buffer.alloc(40 * 1024 * 1024, 0x20));
  assert.ok(bomb.length < 200 * 1024, 'dữ kiện: bản nén rất nhỏ (' + bomb.length + ')');
  const r1 = await putRaw(bomb, { 'Content-Encoding': 'gzip', 'X-Force': '1' });
  assert.equal(r1.status, 413);
  const bad = Buffer.from('không phải gzip'.repeat(5));
  const r2 = await putRaw(bad, { 'Content-Encoding': 'gzip', 'X-Force': '1' });
  assert.equal(r2.status, 400);
  assert.equal(r2.body.success, false);
  assert.match(r2.body.error, /gzip hỏng/, 'giải nén lỗi nói đúng nguyên nhân');
  const js = await putRaw(Buffer.from('{không phải json'), { 'X-Force': '1' });
  assert.equal(js.status, 400); assert.doesNotMatch(js.body.error, /gzip/, 'JSON hỏng không nhắc gzip');
  const br = await putRaw(Buffer.from('x'), { 'Content-Encoding': 'br', 'X-Force': '1' });
  assert.equal(br.status, 415, 'Content-Encoding lạ → 415');
});

/* ============================ 2.40.0 CHỐT SỔ (docs/chot-so.md) ============================ */
/* Server riêng (DATA_DIR riêng) để chốt không đụng các test khác. env: QLK_CLOSE_TODAY giả "hôm nay", QLK_CLOSE_FAIL gài lỗi bước. */
async function closeServer(env = {}, dir = null) {
  const d = dir || fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-close-'));
  const port = await freePort();
  const c = spawn(process.execPath, ['server.js'], { cwd: root, env: { ...process.env, PORT: String(port), DATA_DIR: d, QLK_SETUP_CODE: SETUP_CODE, ...env }, stdio: 'ignore' });
  const b = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 100; i++) { try { if ((await fetch(b + '/healthz')).ok) break; } catch (e) {} await new Promise(r => setTimeout(r, 150)); }
  let cookie = '';
  const setup = await fetch(`${b}/auth/setup`, { method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code: SETUP_CODE, name: 'Chu' }).toString() });
  if (setup.status === 303) cookie = String(setup.headers.getSetCookie()[0]).split(';')[0];
  const call = async (method, url, body, headers = {}, ck) => {
    const r = await fetch(b + url, { method, headers: { 'Content-Type': 'application/json', Cookie: ck || cookie, ...headers }, body: body == null ? undefined : JSON.stringify(body) });
    const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch (e) {}
    return { status: r.status, body: json, text, headers: r.headers };
  };
  const get = async () => (await call('GET', '/api/state')).body.data;
  const stop = async () => { c.kill(); await waitExit(c); };
  return { b, dir: d, call, get, stop, cookie: () => cookie, setCookie: v => { cookie = v; } };
}
function closeFixture() {
  const T = (id, date, type, productId, qty, price, total, cost = null) => ({ id, date, type, productId, qty, price, total, cost });
  return emptyState({
    products: [{ id: 'A', name: 'Hoàng kỳ', stock: 10, costPrice: 120 }, { id: 'B', name: 'Bạch truật', stock: 0, costPrice: 50 }],
    prescriptions: [{ id: 'RX1', name: 'Bài 1', total: 5000, thang: 1, items: [{ productId: 'A', grams: 10 }] }],
    transactions: [
      T('t1', '2024-11-01', 'NHAP', 'B', 4, 50, 200), T('t2', '2024-11-02', 'BAN', 'B', 4, 100, 400, 200),
      T('t3', '2024-12-10', 'NHAP', 'A', 10, 100, 1000), T('t4', '2024-12-20', 'BAN', 'A', 3, 200, 600, 300),
      T('t4c', '2025-01-29', 'NHAP', 'A', 1, 110, 110), /* đúng ngày mốc: phải được giữ */
      T('t5', '2025-03-01', 'NHAP', 'A', 5, 120, 600), T('t6', '2025-03-05', 'BAN', 'A', 2, 250, 500, 240),
      T('t7', '2026-03-01', 'BAN', 'A', 1, 300, 300, 120)
    ]
  });
}
/* Thống kê theo tháng như client: giao dịch còn lại (bỏ dòng tồn đầu kỳ) + bảng tóm tắt đã chốt. */
function statMonths(st) {
  const m = {};
  const add = (k, f, v) => { m[k] = m[k] || { imp: 0, rev: 0, cost: 0 }; m[k][f] += v; };
  for (const t of st.transactions) {
    if (t.open) continue;
    if (t.type === 'NHAP') add(t.date.slice(0, 7), 'imp', t.total); else { add(t.date.slice(0, 7), 'rev', t.total); add(t.date.slice(0, 7), 'cost', t.cost); }
  }
  for (const e of (st.closed ? st.closed.months : [])) { add(e.m, 'imp', e.imp); add(e.m, 'rev', e.rev); add(e.m, 'cost', e.cost); }
  return JSON.stringify(Object.keys(m).sort().map(k => [k, m[k]]));
}
const stockOf = st => JSON.stringify(st.products.map(p => [p.id, p.stock]));
const putState = (s, st, base) => s.call('PUT', '/api/state', { moneyUnit: 'dong', ...st }, base === 'force' ? { 'X-Force': '1' } : { 'X-Base-Updated': String(base) });

test('2.40.0 chốt sổ: bảng Tết và mốc C = Tết của năm âm chứa D (D = Tết 2028 − 1 → C = Tết 2027)', async () => {
  const { TET, lunarStart } = await import('../close.js');
  const { mergeMonths } = await import('../close.js');
  assert.deepEqual(mergeMonths([{ m: '2025-01', imp: 1, rev: 2, cost: 3 }], [{ m: '2025-01', imp: 10, rev: 20, cost: 30 }, { m: '2024-12', imp: 5, rev: 0, cost: 0 }]),
    [{ m: '2024-12', imp: 5, rev: 0, cost: 0 }, { m: '2025-01', imp: 11, rev: 22, cost: 33 }], 'tháng trùng (C giữa tháng) thì cộng');
  /* Giá vốn tại mốc: cùng ngày thì xếp theo ts, thiếu ts lấy giờ trong id (như txStamp/lastImport ở client). */
  const { closePlan } = await import('../close.js');
  const pl = closePlan({ products: [{ id: 'A', name: 'A', stock: 2, costPrice: 1 }], transactions: [
    { id: 'TX_1737000000000', date: '2025-01-10', type: 'NHAP', productId: 'A', qty: 1, price: 200, total: 200 },
    { id: 'x', date: '2025-01-10', type: 'NHAP', productId: 'A', qty: 1, price: 100, total: 100, ts: 1736000000000 }
  ] }, '2025-01-29', '2027-03-01', null, []);
  assert.equal(pl.opening[0].price, 200);
  assert.deepEqual(TET, ['2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-02', '2031-01-23', '2032-02-11', '2033-01-31', '2034-02-19', '2035-02-08', '2036-01-28', '2037-02-15', '2038-02-04', '2039-01-24', '2040-02-12', '2041-02-01', '2042-01-22', '2043-02-10', '2044-01-30', '2045-02-17']);
  assert.equal(lunarStart('2028-01-25'), '2027-02-06');
  assert.equal(lunarStart('2028-01-26'), '2028-01-26');
  assert.equal(lunarStart('2026-11-26'), '2026-02-17');
  assert.equal(lunarStart('2030-02-02'), '2030-02-02', 'Tết 2030 theo giờ VN (UTC+7), không phải 03/02');
  assert.equal(lunarStart('2030-02-01'), '2029-02-13');
  assert.equal(lunarStart('2025-01-28'), null, 'trước Tết đầu bảng');
  assert.equal(lunarStart('2035-02-08'), '2035-02-08', '2.40.4: bảng tới 2045');
  assert.equal(lunarStart('2045-02-16'), '2044-01-30');
  assert.equal(lunarStart('2045-02-17'), null, 'từ Tết cuối bảng: chưa biết Tết kế');
});

test('2.40.0 chốt sổ: quyền, xem trước, 409 base, gài lỗi từng bước, chốt thật, luật Bảo vệ, chốt lần 2 cộng dồn', async () => {
  const s = await closeServer({ QLK_CLOSE_TODAY: '2027-03-01' });
  const crypto = await import('node:crypto');
  const { default: Database } = await import('better-sqlite3');
  try {
    /* Chưa chốt: dòng open bị từ chối; open sai loại / trùng vị → 400. */
    const fx = closeFixture();
    const bad1 = await putState(s, { ...fx, transactions: [...fx.transactions, { id: 'o', date: '2025-01-29', type: 'NHAP', productId: 'A', qty: 1, price: 1, total: 0, open: true }] }, 'force');
    assert.equal(bad1.status, 409, JSON.stringify(bad1.body)); assert.equal(bad1.body.closed, true);
    const bad2 = await putState(s, { ...fx, transactions: fx.transactions.map(t => t.id === 't2' ? { ...t, open: true } : t) }, 'force');
    assert.equal(bad2.status, 400);
    /* Còn lệch tồn (stockDrift) thì chặn chốt. */
    const drift = await putState(s, { ...fx, products: fx.products.map(p => p.id === 'A' ? { ...p, stock: 99 } : p) }, 'force');
    assert.equal(drift.status, 200);
    assert.match((await s.call('POST', '/api/close-year', { cutoff: '2025-01-29', dryRun: true })).body.blocks.join(), /Đối chiếu/);
    const ok = await putState(s, fx, 'force');
    assert.equal(ok.status, 200, JSON.stringify(ok.body));
    const before = await s.get();

    /* Quyền: thành viên 403, khác nguồn 403. */
    const tok = 'member-token-' + Date.now();
    const adb = new Database(path.join(s.dir, 'auth.db'));
    adb.prepare("INSERT INTO devices (id, token_hash, role, name, created_at, last_seen_at) VALUES ('mmmmmmmmmmmm', ?, 'member', 'May tv', ?, ?)").run(crypto.createHash('sha256').update(tok).digest('hex'), Date.now(), Date.now());
    adb.close();
    const memberCk = s.cookie().split('=')[0] + '=' + tok;
    assert.equal((await s.call('GET', '/api/state', null, {}, memberCk)).status, 200, 'cookie thành viên hợp lệ');
    assert.equal((await s.call('POST', '/api/close-year', { cutoff: '2025-01-29', dryRun: true }, {}, memberCk)).status, 403);
    assert.equal((await s.call('GET', '/api/close-archive', null, {}, memberCk)).status, 403);
    assert.equal((await s.call('POST', '/api/close-year', { cutoff: '2025-01-29', dryRun: true }, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);

    /* Xem trước: không ghi; đủ số liệu; tổng = bảng tóm tắt. */
    const dry = await s.call('POST', '/api/close-year', { cutoff: '2025-01-29', dryRun: true });
    assert.equal(dry.status, 200, dry.text);
    assert.deepEqual(dry.body.blocks, []);
    assert.equal(dry.body.totals.count, 4);
    assert.deepEqual(dry.body.opening, [{ productId: 'A', name: 'Hoàng kỳ', qty: 7, price: 100 }]);
    assert.equal(dry.body.totals.rev, 1000); assert.equal(dry.body.totals.cost, 500); assert.equal(dry.body.totals.imp, 1200);
    assert.equal(dry.body.months.reduce((a, e) => a + e.rev, 0), dry.body.totals.rev);
    assert.equal((await s.get()).updatedAt, before.updatedAt, 'dryRun không ghi');
    /* Chặn: mốc không phải Tết, mốc muộn hơn năm sổ trước. */
    assert.ok((await s.call('POST', '/api/close-year', { cutoff: '2026-11-01', dryRun: true })).body.blocks.length > 0);
    assert.match((await s.call('POST', '/api/close-year', { cutoff: '2027-02-06', dryRun: true })).body.blocks.join(), /mốc muộn nhất là 2026-02-17/);
    const blocked = await s.call('POST', '/api/close-year', { cutoff: '2027-02-06' }, { 'X-Base-Updated': String(before.updatedAt) });
    assert.equal(blocked.status, 422);
    /* 409 khi base cũ hoặc thiếu. */
    assert.equal((await s.call('POST', '/api/close-year', { cutoff: '2025-01-29' }, { 'X-Base-Updated': '1' })).status, 409);
    assert.equal((await s.call('POST', '/api/close-year', { cutoff: '2025-01-29' })).status, 409);
    assert.equal((await s.get()).updatedAt, before.updatedAt);
  } finally { await s.stop(); }

  /* Gài lỗi từng bước (backup, ghi file lưu trữ, cuối transaction): 500, dữ liệu không đổi, không còn .tmp/lưu trữ. */
  const dir = s.dir;
  for (const step of ['2', '3', '4']) {
    const f = await closeServer({ QLK_CLOSE_TODAY: '2027-03-01', QLK_CLOSE_FAIL: step }, dir);
    f.setCookie(s.cookie());
    try {
      const b0 = await f.get();
      const r = await f.call('POST', '/api/close-year', { cutoff: '2025-01-29' }, { 'X-Base-Updated': String(b0.updatedAt) });
      assert.equal(r.status, 500, 'bước ' + step);
      const a0 = await f.get();
      assert.equal(a0.updatedAt, b0.updatedAt, 'bước ' + step);
      assert.equal(a0.transactions.length, 8); assert.equal(a0.closed, undefined);
      assert.deepEqual(fs.readdirSync(dir).filter(n => /^luu-tru/.test(n)), [], 'bước ' + step + ' không để lại file lưu trữ/.tmp');
    } finally { await f.stop(); }
  }

  /* Lỗi SAU khi transaction đã commit (đổi tên file lưu trữ): báo thành công kèm cảnh báo, giữ .tmp, không nói "không đổi". Chạy trên bản sao thư mục. */
  const dir5 = dir + '-b5';
  fs.cpSync(dir, dir5, { recursive: true });
  const f5 = await closeServer({ QLK_CLOSE_TODAY: '2027-03-01', QLK_CLOSE_FAIL: '5' }, dir5);
  f5.setCookie(s.cookie());
  try {
    const b5 = await f5.get();
    const r5 = await f5.call('POST', '/api/close-year', { cutoff: '2025-01-29' }, { 'X-Base-Updated': String(b5.updatedAt) });
    assert.equal(r5.status, 200, r5.text); assert.match(r5.body.warning, /\.tmp/);
    assert.equal((await f5.get()).closed.cutoff, '2025-01-29');
    assert.ok(fs.existsSync(path.join(dir5, 'luu-tru-truoc-2025-01-29.json.tmp')));
  } finally { await f5.stop(); rmDir(dir5); }

  const t = await closeServer({ QLK_CLOSE_TODAY: '2027-03-01' }, dir);
  t.setCookie(s.cookie());
  try {
    const before = await t.get();
    const r = await t.call('POST', '/api/close-year', { cutoff: '2025-01-29' }, { 'X-Base-Updated': String(before.updatedAt) });
    assert.equal(r.status, 200, r.text);
    const after = await t.get();
    assert.ok(after.updatedAt > before.updatedAt);
    assert.ok(after.transactions.every(x => x.date >= '2025-01-29'));
    const open = after.transactions.filter(x => x.open);
    assert.equal(open.length, 1);
    assert.deepEqual([open[0].productId, open[0].date, open[0].qty, open[0].price, open[0].total, open[0].type], ['A', '2025-01-29', 7, 100, 0, 'NHAP']);
    assert.deepEqual(after.closed.months.map(e => e.m), ['2024-11', '2024-12']);
    const drops = [], cs = loadClientStateFns().sanitize(after, drops);
    assert.deepEqual(drops, [], 'client sanitize nhận bản sau chốt, không rơi dòng');
    assert.equal(cs.transactions.filter(x => x.open).length, 1); assert.equal(cs.closed.cutoff, '2025-01-29');
    assert.equal(stockOf(after), stockOf(before), 'tồn từng vị không đổi');
    assert.equal(statMonths(after), statMonths(before), 'Thống kê tháng không đổi');
    assert.deepEqual(after.products, before.products);
    assert.deepEqual(after.prescriptions, before.prescriptions);
    /* File lưu trữ + backup truoc-chot; tải về chỉ owner; tên lạ 404. */
    const list = await t.call('GET', '/api/close-archive');
    assert.deepEqual(list.body.archives.map(a => a.name), ['luu-tru-truoc-2025-01-29.json']);
    const dl = await t.call('GET', '/api/close-archive/luu-tru-truoc-2025-01-29.json');
    assert.equal(dl.status, 200); assert.match(dl.headers.get('content-disposition'), /attachment/);
    assert.equal(dl.body.transactions.length, 4);
    assert.equal((await t.call('GET', '/api/close-archive/..%2Fapp.db')).status, 404);
    const bk = await t.call('GET', '/api/backups');
    assert.ok(bk.body.backups.some(x => /-truoc-chot-2025-01-29\.db$/.test(x.name)));

    /* Bảo vệ (cả X-Force): giao dịch trước mốc, thiếu/sửa dòng open → 409 closed; bản đúng vẫn ghi. */
    const old = { ...after, transactions: [...after.transactions, { id: 'cu', date: '2024-12-31', type: 'BAN', productId: 'A', qty: 0.5, price: 1, total: 1, cost: 1 }] };
    for (const [name, st] of [
      ['trước mốc', old],
      ['thiếu open', { ...after, transactions: after.transactions.filter(x => !x.open) }],
      ['sửa qty open', { ...after, transactions: after.transactions.map(x => x.open ? { ...x, qty: 8 } : x) }],
      ['sửa giá open', { ...after, transactions: after.transactions.map(x => x.open ? { ...x, price: 99 } : x) }],
      ['bỏ cờ open', { ...after, transactions: after.transactions.map(x => x.open ? { ...x, open: false } : x) }]
    ]) {
      const g = await putState(t, st, 'force');
      assert.equal(g.status, 409, name); assert.equal(g.body.closed, true, name); assert.equal(g.body.cutoff, '2025-01-29');
    }
    assert.equal((await t.get()).updatedAt, after.updatedAt, 'Bảo vệ không ghi gì');
    const good = await putState(t, after, after.updatedAt);
    assert.equal(good.status, 200, JSON.stringify(good.body));

    /* Chốt lần 2: cộng dồn bảng tóm tắt, dòng open cũ bị gỡ, dòng mới = tồn tại mốc mới. */
    const b2 = await t.get();
    assert.match((await t.call('POST', '/api/close-year', { cutoff: '2025-01-29', dryRun: true })).body.blocks.join(), /Đã chốt đến 2025-01-29/);
    const r2 = await t.call('POST', '/api/close-year', { cutoff: '2026-02-17' }, { 'X-Base-Updated': String(b2.updatedAt) });
    assert.equal(r2.status, 200, r2.text);
    assert.equal(r2.body.totals.imp, 710, 'dòng open cũ không tính vào nhập');
    const a2 = await t.get();
    const o2 = a2.transactions.filter(x => x.open);
    assert.deepEqual(o2.map(x => [x.productId, x.date, x.qty, x.price]), [['A', '2026-02-17', 11, 120]]);
    assert.equal(a2.closed.cutoff, '2026-02-17');
    assert.deepEqual(a2.closed.months.map(e => e.m), ['2024-11', '2024-12', '2025-01', '2025-03']);
    assert.equal(stockOf(a2), stockOf(before));
    assert.equal(statMonths(a2), statMonths(before), 'Thống kê không đổi qua 2 lần chốt');
  } finally { await t.stop(); rmDir(dir); }
});

/* 2.40.4 P2-1: backup qua .tmp rồi đổi tên; file đích rỗng/hỏng thì tạo lại; .tmp sót thì xóa. */
test('2.40.4 backup: file ngày hỏng/rỗng có sẵn được tạo lại, .tmp sót bị xóa, không để lại .tmp', async () => {
  const { default: Database } = await import('better-sqlite3');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-bak-'));
  const bd = path.join(dir, 'backups');
  fs.mkdirSync(bd);
  const d = new Date(), p = n => (n < 10 ? '0' : '') + n;
  const daily = path.join(bd, 'backup-' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + '.db');
  fs.writeFileSync(daily, 'không phải sqlite, file hỏng');
  fs.writeFileSync(daily + '.tmp', 'rác lần trước');
  const oldForceTmp = path.join(bd, 'backup-2026-01-01-truoc-ghi-de-101010101.db.tmp');
  fs.writeFileSync(oldForceTmp, 'rác bản trước-ghi-đè dở');
  const good = f => { if (!fs.existsSync(f) || fs.statSync(f).size === 0) return false; const c = new Database(f, { readonly: true }); try { return c.pragma('integrity_check', { simple: true }) === 'ok'; } finally { c.close(); } };
  const s = await closeServer({}, dir);
  try {
    assert.ok(good(daily), 'lúc khởi động: .tmp sót bị xóa trước, file hỏng được tạo lại');
    assert.ok(!fs.existsSync(oldForceTmp), '.tmp sót của bản trước-ghi-đè cũng bị dọn');
    const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
    assert.deepEqual(src.match(/VACUUM INTO \?'\)\.run\([^)]*\)/g), ["VACUUM INTO ?').run(tmp)"], 'mọi VACUUM INTO đi qua vacuumTo (.tmp rồi rename)');
    let r = await putState(s, emptyState({ products: [{ id: 'BK1', name: 'Sao lưu', stock: 0, costPrice: 1 }] }), 'force');
    assert.equal(r.status, 200);
    assert.ok(good(daily), 'file hỏng được tạo lại thành backup tốt');
    assert.ok(!fs.readdirSync(bd).some(n => n.endsWith('.tmp')), 'không còn .tmp');
    fs.writeFileSync(daily, ''); /* rỗng sau khi đã kiểm trong lần chạy này */
    r = await putState(s, emptyState({ products: [{ id: 'BK2', name: 'Sao lưu 2', stock: 0, costPrice: 1 }] }), r.body.updatedAt);
    assert.equal(r.status, 200);
    assert.ok(good(daily), 'file rỗng được tạo lại');
    const forced = fs.readdirSync(bd).filter(n => /-truoc-ghi-de-\d{9}\.db$/.test(n));
    assert.ok(forced.length >= 1 && forced.every(n => good(path.join(bd, n))), 'bản trước-ghi-đè tốt');
    assert.ok(!fs.readdirSync(bd).some(n => n.endsWith('.tmp')));
  } finally { await s.stop(); rmDir(dir); }
});

test('2.40.4 P3-5: middleware lỗi: 5xx trả "Lỗi máy chủ" (không lộ err.message), 4xx giữ message', async () => {
  const r = await fetch(`${BASE}/api/state`, { method: 'PUT', headers: { 'Content-Type': 'application/json; charset=klingon', Cookie: deviceCookie, 'X-Force': '1' }, body: '{}' });
  const b = await r.json();
  assert.equal(r.status, 415); assert.match(b.error, /klingon/i, '4xx giữ message của lỗi');
  const src = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  assert.match(src, /error: st >= 500 \? 'Lỗi máy chủ' : \(err\.message \|\| 'Yêu cầu không hợp lệ'\)/);
  assert.doesNotMatch(src, /error: err\.message \|\| 'Lỗi server'/);
});
