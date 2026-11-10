import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import { createAuth } from '../auth.js';

/* ---------- đồ giả req / res ---------- */

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

function setup() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qlk-dev-'));
  const lines = [];
  const sink = (...a) => lines.push(a.join(' '));
  const clock = { t: 1_800_000_000_000 };
  const auth = createAuth({
    Database, dataDir: dir, env: {}, now: () => clock.t,
    log: { log: sink, warn: sink, error: sink }
  });
  const routes = {};
  auth.mount({
    get(p, ...h) { routes['GET ' + p] = h[h.length - 1]; },
    post(p, ...h) { routes['POST ' + p] = h[h.length - 1]; }
  }, (req, res, next) => next());
  auth.announce(8787);
  const setupCode = (lines.join('\n').match(/([A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4})/) || [])[1];
  const cleanup = () => { auth.close(); fs.rmSync(dir, { recursive: true, force: true }); };
  return { dir, auth, routes, lines, clock, setupCode, cleanup };
}

/* Chạy một request qua cổng rồi tới handler (nếu cổng cho qua), như Express sẽ làm. */
function call(s, method, p, { cookie, form, headers } = {}) {
  const body = form ? new URLSearchParams(form).toString() : undefined;
  const req = mkReq(method, p, { cookie, headers, body });
  const res = mkRes();
  let passed = false;
  s.auth.gate(req, res, () => { passed = true; });
  if (!passed) return res;
  const h = s.routes[method + ' ' + p];
  assert.ok(h, 'không có route ' + method + ' ' + p);
  h(req, res);
  return res;
}
const cookieOf = (s, res) => s.auth.cookieName + '=' + res.cookies[0].v;
const codeIn = res => (String(res.body).match(/\b([A-Z2-9]{4}-[A-Z2-9]{4})\b/) || [])[1];

function enrollOwner(s) {
  const res = call(s, 'POST', '/auth/setup', { form: { code: s.setupCode, name: 'PC cửa hàng' } });
  assert.equal(res.statusCode, 303);
  return cookieOf(s, res);
}
function invite(s, ownerCookie, role = 'member') {
  const res = call(s, 'POST', '/auth/devices/invite', { cookie: ownerCookie, form: { role } });
  assert.equal(res.statusCode, 200);
  const code = codeIn(res);
  assert.ok(code, 'trang phải hiện mã mời');
  return code;
}
function join(s, code, name = 'Điện thoại', extra) {
  return call(s, 'POST', '/auth/join', { form: { code, name }, ...(extra || {}) });
}
function deviceIdOf(s, name) {
  const db = new Database(s.auth.file);
  const row = db.prepare('SELECT id FROM devices WHERE name = ?').get(name);
  db.close();
  return row && row.id;
}
/* Chỉ chạy qua cổng (không cần route thật): true nếu thiết bị được cho qua. */
function allowed(s, cookie, p = '/api/state', m = 'GET') {
  let passed = false;
  s.auth.gate(mkReq(m, p, { cookie }), mkRes(), () => { passed = true; });
  return passed;
}

/* ---------- mã mời và tham gia ---------- */

test('chủ tạo mã mời dạng XXXX-XXXX; auth.db chỉ lưu bản băm, không có mã thật', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    assert.match(code, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    const raw = code.replace('-', '');
    const db = new Database(s.auth.file);
    const rows = db.prepare('SELECT * FROM invites').all();
    db.close();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].role, 'member');
    assert.ok(!JSON.stringify(rows).includes(raw));
    for (const f of fs.readdirSync(s.dir)) {
      const bin = fs.readFileSync(path.join(s.dir, f));
      assert.ok(!bin.includes(raw) && !bin.includes(code), f);
    }
  } finally { s.cleanup(); }
});

test('nhập đúng mã mời: thiết bị mới có cookie, vai trò thành viên, vào được kho', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    const res = join(s, code.toLowerCase().replace('-', ' '), 'Điện thoại');
    assert.equal(res.statusCode, 303);
    assert.equal(res.redirected, '/');
    const c = res.cookies[0];
    assert.equal(c.n, s.auth.cookieName);
    assert.equal(c.o.httpOnly, true);
    assert.equal(c.o.sameSite, 'lax');
    const phone = cookieOf(s, res);
    assert.equal(allowed(s, phone, '/api/state'), true);
    assert.equal(allowed(s, phone, '/'), true);
    const db = new Database(s.auth.file);
    assert.equal(db.prepare('SELECT role FROM devices WHERE name = ?').get('Điện thoại').role, 'member');
    db.close();
  } finally { s.cleanup(); }
});

test('mã mời chỉ dùng được một lần', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    assert.equal(join(s, code).statusCode, 303);
    const again = join(s, code, 'Máy khác');
    assert.equal(again.statusCode, 400);
    assert.equal(again.cookies.length, 0);
    assert.equal(deviceIdOf(s, 'Máy khác'), undefined);
  } finally { s.cleanup(); }
});

test('mã mời hết hạn sau 5 phút', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    s.clock.t += 5 * 60 * 1000 + 1;
    const res = join(s, code);
    assert.equal(res.statusCode, 400);
    assert.equal(res.cookies.length, 0);
    // còn trong hạn thì dùng được
    const code2 = invite(s, owner);
    s.clock.t += 4 * 60 * 1000;
    assert.equal(join(s, code2).statusCode, 303);
  } finally { s.cleanup(); }
});

test('sai 5 lần thì khóa, kể cả khi sau đó nhập đúng; chủ mở khóa thì vào được', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    for (let i = 0; i < 5; i++) assert.equal(join(s, 'AAAA-BBBB').statusCode, 400);
    const locked = join(s, code);
    assert.equal(locked.statusCode, 429);
    assert.equal(locked.cookies.length, 0);
    const page = call(s, 'GET', '/auth/devices', { cookie: owner });
    assert.match(String(page.body), /Đang khóa/);
    const un = call(s, 'POST', '/auth/devices/unlock', { cookie: owner });
    assert.equal(un.statusCode, 200);
    assert.equal(join(s, code).statusCode, 303);
  } finally { s.cleanup(); }
});

test('tạo mã mời mới đặt lại bộ đếm sai; mỗi mã chỉ có tối đa 5 lần đoán', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    invite(s, owner);
    for (let i = 0; i < 5; i++) join(s, 'AAAA-BBBB');
    assert.equal(join(s, 'AAAA-BBBB').statusCode, 429);
    const code = invite(s, owner);                    // đặt lại khóa
    for (let i = 0; i < 5; i++) assert.equal(join(s, 'CCCC-DDDD').statusCode, 400);
    assert.equal(join(s, code).statusCode, 429);      // 5 lần đoán sai thì khóa lại, mã đúng cũng bị chặn
    s.clock.t += 15 * 60 * 1000 + 1;                  // hết khóa nhưng mã mời đã hết hạn từ lâu (5 phút)
    assert.equal(join(s, code).statusCode, 400);
  } finally { s.cleanup(); }
});

test('mã sai độ dài hoặc rỗng bị từ chối và tính là lần sai', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    invite(s, owner);
    assert.equal(join(s, '').statusCode, 400);
    assert.equal(join(s, 'ABC').statusCode, 400);
    assert.equal(join(s, 'A'.repeat(300)).statusCode, 400);
  } finally { s.cleanup(); }
});

/* ---------- vai trò và quyền ---------- */

test('thành viên không vào được trang quản lý, không tạo mã mời, không thu hồi, không mở khóa', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const member = cookieOf(s, join(s, invite(s, owner)));
    assert.equal(call(s, 'GET', '/auth/devices', { cookie: member }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/invite', { cookie: member, form: { role: 'member' } }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/revoke', { cookie: member, form: { id: deviceIdOf(s, 'PC cửa hàng') } }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/unlock', { cookie: member }).statusCode, 403);
    assert.equal(allowed(s, owner), true);   // chủ không bị ảnh hưởng
    const db = new Database(s.auth.file);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM invites').get().n, 1);  // chỉ mã mời của chủ
    db.close();
  } finally { s.cleanup(); }
});

test('chưa có cookie thì /auth/devices và các thao tác quản lý đều 401', () => {
  const s = setup();
  try {
    enrollOwner(s);
    for (const [m, p] of [['GET', '/auth/devices'], ['POST', '/auth/devices/invite'], ['POST', '/auth/devices/revoke'], ['POST', '/auth/devices/unlock']]) {
      assert.equal(call(s, m, p, { form: { role: 'owner', id: 'x' } }).statusCode, 401, m + ' ' + p);
    }
    const locked = call(s, 'GET', '/');
    assert.match(String(locked.body), /href="\/auth\/join"/);
  } finally { s.cleanup(); }
});

test('thu hồi thành viên có hiệu lực ngay ở request kế tiếp', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const member = cookieOf(s, join(s, invite(s, owner), 'Điện thoại'));
    assert.equal(allowed(s, member), true);
    const res = call(s, 'POST', '/auth/devices/revoke', { cookie: owner, form: { id: deviceIdOf(s, 'Điện thoại') } });
    assert.equal(res.statusCode, 200);
    assert.match(String(res.body), /Đã thu hồi/);
    const after = call(s, 'GET', '/api/state', { cookie: member });
    assert.equal(after.statusCode, 401);
    assert.equal(JSON.parse(after.body).code, 'device_not_approved');
    assert.equal(allowed(s, owner), true);
    assert.doesNotMatch(String(call(s, 'GET', '/auth/devices', { cookie: owner }).body), /Điện thoại/);
  } finally { s.cleanup(); }
});

test('không thể tự thu hồi chính thiết bị đang dùng', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    // gửi kèm confirm=yes để lớp "cần xác nhận khi thu hồi chủ" không che lớp "không tự thu hồi"
    const res = call(s, 'POST', '/auth/devices/revoke', { cookie: owner, form: { id: deviceIdOf(s, 'PC cửa hàng'), confirm: 'yes' } });
    assert.equal(res.statusCode, 400);
    assert.match(String(res.body), /chính thiết bị đang dùng/);
    assert.equal(allowed(s, owner), true);
    assert.equal(s.auth.hasOwner(), true);
  } finally { s.cleanup(); }
});

test('thu hồi thiết bị chủ khác cần xác nhận; sau đó thiết bị đó bị 401 và chủ còn lại vẫn dùng được', () => {
  const s = setup();
  try {
    const pc = enrollOwner(s);
    const phone = cookieOf(s, join(s, invite(s, pc, 'owner'), 'Điện thoại chủ'));
    const id = deviceIdOf(s, 'Điện thoại chủ');
    const noConfirm = call(s, 'POST', '/auth/devices/revoke', { cookie: pc, form: { id } });
    assert.equal(noConfirm.statusCode, 400);
    assert.equal(allowed(s, phone), true);
    const ok = call(s, 'POST', '/auth/devices/revoke', { cookie: pc, form: { id, confirm: 'yes' } });
    assert.equal(ok.statusCode, 200);
    assert.equal(allowed(s, phone), false);
    assert.equal(allowed(s, pc), true);
  } finally { s.cleanup(); }
});

test('tối đa 2 thiết bị chủ: mời chủ thứ ba bị từ chối, và mã mời chủ dư không dùng được', () => {
  const s = setup();
  try {
    const pc = enrollOwner(s);
    const c1 = invite(s, pc, 'owner');
    const c2 = invite(s, pc, 'owner');                       // tạo được vì mới có 1 chủ
    assert.equal(join(s, c1, 'Chủ 2').statusCode, 303);       // đủ 2 chủ
    const over = join(s, c2, 'Chủ 3');                        // kiểm tra lại lúc dùng
    assert.equal(over.statusCode, 400);
    assert.equal(over.cookies.length, 0);
    assert.equal(deviceIdOf(s, 'Chủ 3'), undefined);
    const refuse = call(s, 'POST', '/auth/devices/invite', { cookie: pc, form: { role: 'owner' } });
    assert.equal(refuse.statusCode, 400);
    assert.doesNotMatch(String(call(s, 'GET', '/auth/devices', { cookie: pc }).body), /value="owner"/);
  } finally { s.cleanup(); }
});

/* ---------- an toàn ---------- */

test('POST từ nguồn khác (Origin lệch Host) bị 403, kể cả khi đã có cookie chủ', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    const bad = { origin: 'http://trang-la.example' };
    assert.equal(join(s, code, 'x', { headers: bad }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/invite', { cookie: owner, form: { role: 'member' }, headers: bad }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/revoke', { cookie: owner, form: { id: 'x' }, headers: bad }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/unlock', { cookie: owner, headers: bad }).statusCode, 403);
    // mã mời vẫn còn nguyên vì request giả bị chặn trước khi tiêu thụ
    assert.equal(join(s, code, 'Điện thoại', { headers: { origin: 'http://192.168.1.5:8787' } }).statusCode, 303);
  } finally { s.cleanup(); }
});

test('tên thiết bị được làm sạch và escape, không chèn được HTML vào trang quản lý', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    join(s, invite(s, owner), '<script>alert(1)</script>"x');
    const page = String(call(s, 'GET', '/auth/devices', { cookie: owner }).body);
    assert.doesNotMatch(page, /<script>alert/);
    assert.match(page, /scriptalert\(1\)\/scriptx/);
    const db = new Database(s.auth.file);
    const names = db.prepare('SELECT name FROM devices').all().map(r => r.name);
    db.close();
    assert.ok(names.every(n => !/[<>&"']/.test(n)));
  } finally { s.cleanup(); }
});

test('trang quản lý hiện thiết bị này, vai trò, và không bao giờ hiện lại mã mời đã tạo', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    join(s, code, 'Điện thoại');
    const page = String(call(s, 'GET', '/auth/devices', { cookie: owner }).body);
    assert.match(page, /PC cửa hàng/);
    assert.match(page, /thiết bị này/);
    assert.match(page, /Thành viên/);
    assert.ok(!page.includes(code));
    assert.equal((call(s, 'GET', '/auth/devices', { cookie: owner }).headers['cache-control']), 'no-store');
  } finally { s.cleanup(); }
});

test('/auth/join: chưa có chủ thì chuyển sang thiết lập; thiết bị đã duyệt thì về trang chủ; công khai đúng phương thức', () => {
  const s = setup();
  try {
    const g1 = call(s, 'GET', '/auth/join');
    assert.equal(g1.statusCode, 303);
    assert.equal(g1.redirected, '/auth/setup');
    const owner = enrollOwner(s);
    const g2 = call(s, 'GET', '/auth/join');
    assert.equal(g2.statusCode, 200);
    assert.match(String(g2.body), /Thêm thiết bị/);
    const g3 = call(s, 'GET', '/auth/join', { cookie: owner });
    assert.equal(g3.statusCode, 303);
    assert.equal(g3.redirected, '/');
    assert.equal(call(s, 'PUT', '/auth/join').statusCode, 401);
    assert.equal(call(s, 'GET', '/AUTH/JOIN').statusCode, 401);
  } finally { s.cleanup(); }
});

test('khởi động lại: thành viên vẫn hợp lệ, mã mời chưa dùng vẫn còn hiệu lực trong hạn', () => {
  const s = setup();
  const owner = enrollOwner(s);
  const member = cookieOf(s, join(s, invite(s, owner), 'Điện thoại'));
  const pending = invite(s, owner);
  s.auth.close();
  const sink = () => {};
  const again = createAuth({ Database, dataDir: s.dir, env: {}, now: () => s.clock.t, log: { log: sink, warn: sink, error: sink } });
  const routes = {};
  again.mount({ get(p, ...h) { routes['GET ' + p] = h[h.length - 1]; }, post(p, ...h) { routes['POST ' + p] = h[h.length - 1]; } }, (rq, rs, nx) => nx());
  try {
    const s2 = { auth: again, routes, clock: s.clock };
    assert.equal(allowed(s2, member), true);
    assert.equal(join(s2, pending, 'Máy 3').statusCode, 303);
  } finally { again.close(); fs.rmSync(s.dir, { recursive: true, force: true }); }
});

test('escape HTML ở lớp hiển thị: tên thiết bị có ký tự nguy hiểm trong DB vẫn không thành thẻ', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const db = new Database(s.auth.file);
    db.prepare("INSERT INTO devices (id, token_hash, role, name, created_at, last_seen_at) VALUES (?, ?, 'member', ?, ?, ?)")
      .run('aaaaaaaaaaaa', 'h'.repeat(64), '<img src=x onerror=alert(1)>', s.clock.t, s.clock.t);
    db.close();
    const page = String(call(s, 'GET', '/auth/devices', { cookie: owner }).body);
    assert.doesNotMatch(page, /<img src=x/);
    assert.match(page, /&lt;img src=x onerror=alert\(1\)&gt;/);
  } finally { s.cleanup(); }
});

/* ---------- Origin / Referrer-Policy ---------- */

test('mọi trang của auth gửi Referrer-Policy: same-origin (không dùng no-referrer, vì sẽ khiến trình duyệt gửi Origin: null)', () => {
  const s = setup();
  try {
    const setupPage = call(s, 'GET', '/auth/setup');
    assert.equal(setupPage.headers['referrer-policy'], 'same-origin');
    assert.equal(call(s, 'GET', '/').headers['referrer-policy'], 'same-origin');   // trang khóa
    const owner = enrollOwner(s);
    assert.equal(call(s, 'GET', '/auth/join').statusCode, 200);                      // đã có chủ, chưa có cookie
    assert.equal(call(s, 'GET', '/auth/join').headers['referrer-policy'], 'same-origin');
    assert.equal(call(s, 'GET', '/auth/devices', { cookie: owner }).headers['referrer-policy'], 'same-origin');
  } finally { s.cleanup(); }
});

test('Origin: null bị từ chối ở thiết lập, tham gia và mọi thao tác quản lý (không để lọt nguồn lạ)', () => {
  const s = setup();
  try {
    const bad = { origin: 'null' };
    assert.equal(call(s, 'POST', '/auth/setup', { form: { code: s.setupCode, name: 'x' }, headers: bad }).statusCode, 403);
    assert.equal(s.auth.hasOwner(), false);
    const owner = enrollOwner(s);
    const code = invite(s, owner);
    assert.equal(join(s, code, 'x', { headers: bad }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/invite', { cookie: owner, form: { role: 'member' }, headers: bad }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/revoke', { cookie: owner, form: { id: 'x' }, headers: bad }).statusCode, 403);
    assert.equal(call(s, 'POST', '/auth/devices/unlock', { cookie: owner, headers: bad }).statusCode, 403);
    assert.equal(join(s, code, 'Điện thoại').statusCode, 303);   // mã mời chưa bị tiêu thụ bởi request bị chặn
  } finally { s.cleanup(); }
});

test('Origin trùng Host (trình duyệt thật gửi khi policy same-origin) được chấp nhận, kể cả localhost và IP', () => {
  const s = setup();
  try {
    const ok = call(s, 'POST', '/auth/setup', { form: { code: s.setupCode, name: 'PC' }, headers: { host: 'localhost:8791', origin: 'http://localhost:8791' } });
    assert.equal(ok.statusCode, 303);
  } finally { s.cleanup(); }
});

test('giao diện: nút Thu hồi có kiểu nguy hiểm; liên kết có màu đọc được ở chế độ tối', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    join(s, invite(s, owner), 'Điện thoại');
    const page = String(call(s, 'GET', '/auth/devices', { cookie: owner }).body);
    assert.match(page, /<button type="submit" class="danger">Thu hồi<\/button>/);
    assert.match(page, /prefers-color-scheme:dark\)\{[\s\S]*?a\{color:#8ab4ff\}/);
    assert.doesNotMatch(page, /<button type="submit" class="danger">Tạo mã mời/);
  } finally { s.cleanup(); }
});

/* ---------- 2.8.1: cờ Secure, Sec-Fetch-Site, gia hạn cookie ---------- */

test('cookie đặt lúc thiết lập và tham gia có cờ Secure khi đi qua HTTPS, không có khi HTTP', () => {
  for (const [headers, expected] of [[{ 'x-forwarded-proto': 'https' }, true], [{}, false], [{ 'x-forwarded-proto': 'http' }, false]]) {
    const s = setup();
    try {
      const res = call(s, 'POST', '/auth/setup', { form: { code: s.setupCode, name: 'PC' }, headers });
      assert.equal(res.statusCode, 303);
      assert.equal(res.cookies[0].o.secure, expected, JSON.stringify(headers));
      assert.equal(res.cookies[0].o.httpOnly, true);
      const owner = cookieOf(s, res);
      const code = invite(s, owner);
      const j = join(s, code, 'Điện thoại', { headers });
      assert.equal(j.cookies[0].o.secure, expected, 'join ' + JSON.stringify(headers));
    } finally { s.cleanup(); }
  }
});

test('Sec-Fetch-Site: cross-site và same-site bị 403; same-origin, none hoặc thiếu thì qua', () => {
  const s = setup();
  try {
    for (const site of ['cross-site', 'same-site']) {
      assert.equal(call(s, 'POST', '/auth/setup', { form: { code: s.setupCode, name: 'x' }, headers: { 'sec-fetch-site': site } }).statusCode, 403, site);
    }
    assert.equal(s.auth.hasOwner(), false);
    const ok = call(s, 'POST', '/auth/setup', { form: { code: s.setupCode, name: 'PC' }, headers: { 'sec-fetch-site': 'same-origin' } });
    assert.equal(ok.statusCode, 303);
    const owner = cookieOf(s, ok);
    for (const site of ['cross-site', 'same-site']) {
      assert.equal(call(s, 'POST', '/auth/devices/invite', { cookie: owner, form: { role: 'member' }, headers: { 'sec-fetch-site': site } }).statusCode, 403, site);
      assert.equal(call(s, 'POST', '/auth/devices/unlock', { cookie: owner, headers: { 'sec-fetch-site': site } }).statusCode, 403, site);
    }
    assert.equal(call(s, 'POST', '/auth/devices/invite', { cookie: owner, form: { role: 'member' }, headers: { 'sec-fetch-site': 'none' } }).statusCode, 200);
    assert.equal(call(s, 'POST', '/auth/devices/invite', { cookie: owner, form: { role: 'member' } }).statusCode, 200);
  } finally { s.cleanup(); }
});

test('gia hạn cookie trượt: cấp lại cùng mã tối đa một lần mỗi ngày; cờ Secure theo từng request', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    const token = owner.split('=')[1];
    const r1 = call(s, 'GET', '/auth/devices', { cookie: owner });
    assert.equal(r1.cookies.length, 1);
    assert.equal(r1.cookies[0].v, token);
    assert.equal(r1.cookies[0].o.maxAge, 365 * 24 * 3600 * 1000);
    assert.equal(r1.cookies[0].o.secure, false);
    assert.equal(call(s, 'GET', '/auth/devices', { cookie: owner }).cookies.length, 0);     // trong ngày: không cấp lại
    s.clock.t += 24 * 3600 * 1000 + 1;
    const r3 = call(s, 'GET', '/auth/devices', { cookie: owner, headers: { 'x-forwarded-proto': 'https' } });
    assert.equal(r3.cookies.length, 1);
    assert.equal(r3.cookies[0].o.secure, true);                                              // nâng cấp lên Secure khi dùng HTTPS
    assert.equal(call(s, 'GET', '/auth/devices', { cookie: owner }).cookies.length, 0);
  } finally { s.cleanup(); }
});

test('không cấp lại cookie cho yêu cầu chưa duyệt hoặc đường dẫn công khai', () => {
  const s = setup();
  try {
    enrollOwner(s);
    assert.equal(call(s, 'GET', '/api/state').cookies.length, 0);
    const pub = mkRes();
    let passed = false;
    s.auth.gate(mkReq('GET', '/healthz'), pub, () => { passed = true; });   // công khai: qua cổng, không cấp cookie
    assert.equal(passed, true);
    assert.equal(pub.cookies.length, 0);
    assert.equal(call(s, 'GET', '/', { cookie: s.auth.cookieName + '=' + 'x'.repeat(43) }).cookies.length, 0);
  } finally { s.cleanup(); }
});


test('auth-reset xóa cả thiết bị và mã mời', () => {
  const s = setup();
  try {
    const owner = enrollOwner(s);
    invite(s, owner);
    const r = spawnSync(process.execPath, [path.resolve('scripts/auth-reset.mjs')], {
      env: { ...process.env, DATA_DIR: s.dir },
      encoding: 'utf8'
    });
    assert.equal(r.status, 0, r.stderr);
    const db = new Database(s.auth.file);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM devices').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM invites').get().n, 0);
    db.close();
  } finally { s.cleanup(); }
});
