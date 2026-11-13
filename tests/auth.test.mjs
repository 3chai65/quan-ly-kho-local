import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import Database from 'better-sqlite3';
import { createAuth, normalizeCode, newSetupCode } from '../auth.js';

/* ---------- đồ giả req / res / app ---------- */

function mkReq(method, p, { cookie, headers, body } = {}) {
  return {
    method, path: p, body,
    headers: { host: '192.168.1.5:8787', ...(cookie ? { cookie } : {}), ...(headers || {}) }
  };
}
function mkRes() {
  const r = {
    statusCode: 200, headers: {}, body: undefined, cookies: [], redirected: null,
    status(c) { r.statusCode = c; return r; },
    set(o, v) {
      if (typeof o === 'string') r.headers[o.toLowerCase()] = v;
      else for (const k of Object.keys(o)) r.headers[k.toLowerCase()] = o[k];
      return r;
    },
    type(t) { r.headers['content-type'] = t; return r; },
    send(b) { r.body = b; return r; },
    json(o) { r.headers['content-type'] = 'application/json'; r.body = JSON.stringify(o); return r; },
    cookie(n, v, o) { r.cookies.push({ n, v, o }); return r; },
    redirect(c, u) { r.statusCode = c; r.redirected = u; return r; }
  };
  return r;
}
function runGate(auth, req) {
  let passed = false;
  const res = mkRes();
  auth.gate(req, res, () => { passed = true; });
  return { passed, res };
}
function setup(opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-auth-'));
  const lines = [];
  const sink = (...a) => lines.push(a.join(' '));
  const clock = { t: 1_800_000_000_000 };
  const auth = createAuth({
    Database, dataDir: dir, env: opts.env || {}, now: () => clock.t,
    log: { log: sink, warn: sink, error: sink }
  });
  const routes = {};
  auth.mount({
    get(p, ...h) { routes['GET ' + p] = h[h.length - 1]; },
    post(p, ...h) { routes['POST ' + p] = h[h.length - 1]; }
  }, (req, res, next) => next());
  auth.announce(8787);
  const code = (lines.join('\n').match(/([A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4})/) || [])[1];
  const cleanup = () => { auth.close(); fs.rmSync(dir, { recursive: true, force: true }); };
  return { dir, auth, routes, lines, code, clock, cleanup };
}
function postSetup(s, code, name = 'PC cửa hàng', headers) {
  const body = new URLSearchParams({ code, name }).toString();
  const res = mkRes();
  s.routes['POST /auth/setup'](mkReq('POST', '/auth/setup', { body, headers }), res);
  return res;
}

/* ---------- mã thiết lập ---------- */

test('mã thiết lập: 12 ký tự từ bảng 31 ký tự, không trùng nhau', () => {
  const a = newSetupCode();
  const b = newSetupCode();
  assert.match(a, /^[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{12}$/);
  assert.notEqual(a, b);
  assert.equal(normalizeCode(' k7q2-m9xd 4twb '), 'K7Q2M9XD4TWB');
});

/* ---------- cổng mặc định từ chối ---------- */

test('chưa có cookie: /api và trang chủ đều bị chặn, không gọi next', () => {
  const s = setup();
  try {
    for (const [m, p] of [['GET', '/api/state'], ['PUT', '/api/state'], ['GET', '/api/backups'], ['GET', '/'], ['GET', '/bat-ky-dau']]) {
      const { passed, res } = runGate(s.auth, mkReq(m, p));
      assert.equal(passed, false, m + ' ' + p);
      assert.equal(res.statusCode, 401, m + ' ' + p);
    }
    const api = runGate(s.auth, mkReq('GET', '/api/state')).res;
    assert.equal(JSON.parse(api.body).code, 'device_not_approved');
    assert.equal(api.headers['cache-control'], 'no-store');
    const page = runGate(s.auth, mkReq('GET', '/')).res;
    assert.match(page.headers['content-type'], /text\/html/);
    assert.doesNotMatch(String(page.body), /%%BOOT%%|"products"|"transactions"/);
  } finally { s.cleanup(); }
});

test('đường dẫn công khai: đúng phương thức mới qua, khác hoa thường hoặc khác phương thức thì chặn', () => {
  const s = setup();
  try {
    assert.equal(runGate(s.auth, mkReq('GET', '/healthz')).passed, true);
    assert.equal(runGate(s.auth, mkReq('HEAD', '/healthz')).passed, true);
    assert.equal(runGate(s.auth, mkReq('GET', '/favicon.ico')).passed, true);
    assert.equal(runGate(s.auth, mkReq('GET', '/auth/setup')).passed, true);
    assert.equal(runGate(s.auth, mkReq('POST', '/auth/setup')).passed, true);
    assert.equal(runGate(s.auth, mkReq('POST', '/healthz')).passed, false);
    assert.equal(runGate(s.auth, mkReq('PUT', '/auth/setup')).passed, false);
    assert.equal(runGate(s.auth, mkReq('GET', '/HEALTHZ')).passed, false);
    assert.equal(runGate(s.auth, mkReq('GET', '/AUTH/SETUP')).passed, false);
    assert.equal(runGate(s.auth, mkReq('GET', '/healthz/')).passed, false);
  } finally { s.cleanup(); }
});

/* ---------- thiết lập thiết bị chủ đầu tiên ---------- */

test('mã được in trong log khi chưa có chủ', () => {
  const s = setup();
  try {
    assert.match(s.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    assert.equal(s.auth.hasOwner(), false);
  } finally { s.cleanup(); }
});

test('nhập sai mã: 400, không có cookie, vẫn chưa có chủ', () => {
  const s = setup();
  try {
    const res = postSetup(s, 'AAAA-BBBB-CCCC');
    assert.equal(res.statusCode, 400);
    assert.equal(res.cookies.length, 0);
    assert.equal(s.auth.hasOwner(), false);
    assert.doesNotMatch(String(res.body), new RegExp(s.code));
  } finally { s.cleanup(); }
});

test('nhập sai 5 lần thì khóa, kể cả khi sau đó nhập đúng; hết 15 phút thì mở lại', () => {
  const s = setup();
  try {
    for (let i = 0; i < 5; i++) assert.equal(postSetup(s, 'AAAA-BBBB-CCCC').statusCode, 400);
    const locked = postSetup(s, s.code);
    assert.equal(locked.statusCode, 429);
    assert.equal(locked.cookies.length, 0);
    assert.equal(s.auth.hasOwner(), false);
    s.clock.t += 15 * 60 * 1000 + 1;
    assert.equal(postSetup(s, s.code).statusCode, 303);
    assert.equal(s.auth.hasOwner(), true);
  } finally { s.cleanup(); }
});

test('nhập đúng mã: cookie HttpOnly + SameSite=Lax, chuyển về /, có chủ, thiết lập đóng', () => {
  const s = setup();
  try {
    const res = postSetup(s, s.code.toLowerCase().replace(/-/g, ' '), 'PC cửa hàng');
    assert.equal(res.statusCode, 303);
    assert.equal(res.redirected, '/');
    assert.equal(res.cookies.length, 1);
    const c = res.cookies[0];
    assert.equal(c.n, s.auth.cookieName);
    assert.match(c.n, /^qlk_dev_[0-9a-f]{8}$/);
    assert.equal(c.o.httpOnly, true);
    assert.equal(c.o.sameSite, 'lax');
    assert.equal(c.o.path, '/');
    assert.ok(c.o.maxAge >= 300 * 24 * 3600 * 1000);
    assert.ok(c.v.length >= 40);
    assert.equal(s.auth.hasOwner(), true);

    // thiết lập đóng vĩnh viễn: GET và POST đều 404, mã cũ không dùng lại được
    const g = mkRes();
    s.routes['GET /auth/setup'](mkReq('GET', '/auth/setup'), g);
    assert.equal(g.statusCode, 404);
    assert.equal(postSetup(s, s.code).statusCode, 404);
  } finally { s.cleanup(); }
});

test('POST thiết lập từ nguồn khác (Origin lệch Host) bị 403', () => {
  const s = setup();
  try {
    const res = postSetup(s, s.code, 'x', { origin: 'http://trang-la.example' });
    assert.equal(res.statusCode, 403);
    assert.equal(s.auth.hasOwner(), false);
    const ok = postSetup(s, s.code, 'x', { origin: 'http://192.168.1.5:8787' });
    assert.equal(ok.statusCode, 303);
  } finally { s.cleanup(); }
});

/* ---------- thiết bị đã duyệt ---------- */

function enrolled(s) {
  const res = postSetup(s, s.code);
  return s.auth.cookieName + '=' + res.cookies[0].v;
}

test('cookie hợp lệ qua cổng và có req.device là owner', () => {
  const s = setup();
  try {
    const cookie = enrolled(s);
    for (const [m, p] of [['GET', '/'], ['GET', '/api/state'], ['PUT', '/api/state'], ['GET', '/api/backups']]) {
      const req = mkReq(m, p, { cookie });
      const { passed } = runGate(s.auth, req);
      assert.equal(passed, true, m + ' ' + p);
      assert.equal(req.device.role, 'owner');
    }
  } finally { s.cleanup(); }
});

test('cookie rác, cookie quá ngắn hoặc cookie của thiết bị đã thu hồi đều bị 401', () => {
  const s = setup();
  try {
    const cookie = enrolled(s);
    assert.equal(runGate(s.auth, mkReq('GET', '/api/state', { cookie: s.auth.cookieName + '=' + 'x'.repeat(43) })).passed, false);
    assert.equal(runGate(s.auth, mkReq('GET', '/api/state', { cookie: s.auth.cookieName + '=abc' })).passed, false);
    assert.equal(runGate(s.auth, mkReq('GET', '/api/state', { cookie: 'khac=1' })).passed, false);

    const other = new Database(s.auth.file);
    other.prepare('UPDATE devices SET revoked_at = ?').run(Date.now());
    other.close();
    assert.equal(runGate(s.auth, mkReq('GET', '/api/state', { cookie })).passed, false);
  } finally { s.cleanup(); }
});

test('auth.db chỉ lưu bản băm: không có dòng nào chứa mã thật', () => {
  const s = setup();
  try {
    const res = postSetup(s, s.code);
    const token = res.cookies[0].v;
    const other = new Database(s.auth.file);
    const rows = other.prepare('SELECT * FROM devices').all();
    other.close();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].token_hash, crypto.createHash('sha256').update(token).digest('hex'));
    assert.ok(!JSON.stringify(rows).includes(token));
    assert.equal(rows[0].role, 'owner');
    // file db (và file WAL nếu có) cũng không chứa mã thật
    for (const f of fs.readdirSync(s.dir)) {
      assert.ok(!fs.readFileSync(path.join(s.dir, f)).includes(token), f);
    }
  } finally { s.cleanup(); }
});

test('khởi động lại: cookie của chủ vẫn hợp lệ, thiết lập vẫn đóng, không in mã mới', () => {
  const s = setup();
  const cookie = enrolled(s);
  s.auth.close();
  const lines = [];
  const sink = (...a) => lines.push(a.join(' '));
  const again = createAuth({ Database, dataDir: s.dir, env: {}, now: () => s.clock.t, log: { log: sink, warn: sink, error: sink } });
  try {
    again.announce(8787);
    assert.equal(again.hasOwner(), true);
    assert.equal(runGate(again, mkReq('GET', '/api/state', { cookie })).passed, true);
    assert.doesNotMatch(lines.join('\n'), /[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}/);
  } finally { again.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

/* ---------- QLK_SETUP_CODE ---------- */

test('QLK_SETUP_CODE đủ dài được dùng (bỏ dấu, không phân biệt hoa thường) và không in ra log', () => {
  const s = setup({ env: { QLK_SETUP_CODE: 'test-code-2026-kho' } });
  try {
    assert.equal(s.code, undefined);
    assert.doesNotMatch(s.lines.join('\n'), /testcode2026kho/i);
    assert.equal(postSetup(s, 'TESTCODE2026KHO').statusCode, 303);
  } finally { s.cleanup(); }
});

test('QLK_SETUP_CODE quá ngắn bị bỏ qua, tạo mã ngẫu nhiên', () => {
  const s = setup({ env: { QLK_SETUP_CODE: 'ngan' } });
  try {
    assert.match(s.code, /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    assert.match(s.lines.join('\n'), /ngắn hơn/);
    assert.equal(postSetup(s, 'ngan').statusCode, 400);
  } finally { s.cleanup(); }
});

/* ---------- tên cookie riêng theo bản cài ---------- */

test('hai bản cài có tên cookie khác nhau; cookie của bản này không mở được bản kia', () => {
  const a = setup();
  const b = setup();
  try {
    assert.notEqual(a.auth.cookieName, b.auth.cookieName);
    const cookieA = enrolled(a);
    // trình duyệt gửi cookie của A tới B: tên không khớp nên B coi như chưa có cookie
    assert.equal(runGate(b.auth, mkReq('GET', '/api/state', { cookie: cookieA })).passed, false);
    // dù kẻ tấn công gắn mã của A vào đúng tên cookie của B thì B vẫn từ chối (mã không có trong auth.db của B)
    const spoof = b.auth.cookieName + '=' + cookieA.split('=')[1];
    assert.equal(runGate(b.auth, mkReq('GET', '/api/state', { cookie: spoof })).passed, false);
  } finally { a.cleanup(); b.cleanup(); }
});

test('tên cookie giữ nguyên sau khi khởi động lại và sau khi xóa hết thiết bị', () => {
  const s = setup();
  const name = s.auth.cookieName;
  enrolled(s);
  const other = new Database(s.auth.file);
  other.prepare('DELETE FROM devices').run(); // giống scripts/auth-reset.mjs
  other.close();
  s.auth.close();
  const again = createAuth({ Database, dataDir: s.dir, env: {}, now: () => s.clock.t, log: { log() {}, warn() {}, error() {} } });
  try {
    assert.equal(again.cookieName, name);
    assert.equal(again.hasOwner(), false);
  } finally { again.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

test('2.16.0 PWA: manifest/sw/icon công khai chỉ GET/HEAD; đường khác vẫn bị chặn', () => {
  const s = setup();
  try {
    for (const p of ['/manifest.webmanifest', '/sw.js', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png']) {
      assert.equal(runGate(s.auth, mkReq('GET', p)).passed, true, p);
      assert.equal(runGate(s.auth, mkReq('HEAD', p)).passed, true, p);
      assert.equal(runGate(s.auth, mkReq('POST', p)).passed, false, p + ' POST');
      assert.equal(runGate(s.auth, mkReq('PUT', p)).passed, false, p + ' PUT');
    }
    for (const p of ['/', '/api/state', '/sw.js/x', '/manifest.webmanifest/', '/SW.JS', '/icon-192.png.bak']) {
      assert.equal(runGate(s.auth, mkReq('GET', p)).passed, false, p);
    }
  } finally { s.cleanup(); }
});
