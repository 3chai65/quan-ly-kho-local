/**
 * Lớp bảo vệ truy cập — giai đoạn 1 và 2.
 * ---------------------------------------------------------------
 * - Mỗi thiết bị giữ một mã ngẫu nhiên trong cookie `qlk_dev_<8 hex>` (HttpOnly).
 *   Tên cookie là ngẫu nhiên theo từng bản cài (lưu trong auth.db) vì cookie không phân biệt
 *   cổng: hai server cùng địa chỉ máy (ví dụ localhost:8787 và localhost:8791) mà dùng chung
 *   một tên cookie sẽ ghi đè cookie của nhau.
 *   Server chỉ lưu BẢN BĂM SHA-256 của mã, trong file riêng data/auth.db.
 * - authGate là cổng "mặc định từ chối": chỉ vài đường dẫn công khai (xem PUBLIC),
 *   mọi thứ còn lại (kể cả trang chủ, vốn nhúng sẵn dữ liệu kho) cần thiết bị đã duyệt.
 * - Chưa có thiết bị chủ nào: server in mã thiết lập vào log; nhập mã ở /auth/setup
 *   để thiết bị đó thành chủ. Có chủ rồi thì /auth/setup đóng vĩnh viễn (404).
 * - Không dựa vào IP hay địa chỉ loopback (trong Docker, yêu cầu từ máy chủ
 *   vào container thường không còn là 127.0.0.1).
 *
 * Giai đoạn 2:
 * - Thiết bị chủ (tối đa 2) mở /auth/devices để tạo mã mời (8 ký tự, 5 phút, dùng một lần,
 *   chỉ lưu bản băm), xem danh sách thiết bị và thu hồi từng thiết bị. Thiết bị mới nhập mã
 *   ở /auth/join. Thành viên có toàn quyền dữ liệu nhưng không duyệt/thu hồi được.
 * - /auth/join có bộ đếm thử sai RIÊNG (5 lần thì khóa 15 phút); chủ có thể mở khóa,
 *   và tạo mã mời mới cũng đặt lại bộ đếm.
 *
 * Chưa có: luồng thiết bị tự gửi yêu cầu để chủ duyệt (hiện chỉ có mã mời).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const COOKIE_PREFIX = 'qlk_dev_';
const COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
const RENEW_EVERY_MS = 24 * 60 * 60 * 1000;   // gia hạn cookie (trượt) tối đa một lần mỗi ngày mỗi thiết bị
/* 31 ký tự, bỏ 0 1 I L O cho dễ đọc. 12 ký tự ≈ 59 bit. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SETUP_LEN = 12;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const SEEN_EVERY_MS = 60 * 1000;
const MAX_OWNERS = 2;
const INVITE_TTL_MS = 5 * 60 * 1000;
const INVITE_LEN = 8;
const INVITE_KEEP_MS = 24 * 60 * 60 * 1000;

/* Đường dẫn công khai (so khớp CHÍNH XÁC, phân biệt hoa thường) và phương thức được phép. */
const PUBLIC = {
  '/healthz': ['GET', 'HEAD'],
  '/favicon.ico': ['GET', 'HEAD'],
  '/robots.txt': ['GET', 'HEAD'],
  '/auth/setup': ['GET', 'POST'],
  '/auth/join': ['GET', 'POST']
};

const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

export function normalizeCode(s) {
  return String(s == null ? '' : s).toUpperCase().replace(/[\s-]/g, '');
}
function randomCode(len) {
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}
export function newSetupCode() {
  return randomCode(SETUP_LEN);
}
function formatCode(c) {
  return c.match(/.{1,4}/g).join('-');
}
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function getCookie(req, name) {
  const header = (req.headers && req.headers.cookie) || '';
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}
function cleanName(n, fallback) {
  const s = String(n == null ? '' : n).replace(/[\u0000-\u001f<>&"']/g, '').trim().slice(0, 60);
  return s || fallback || 'Thiết bị';
}
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);
function ago(ms) {
  if (!(ms >= 0)) return 'chưa rõ';
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return m + ' phút trước';
  const h = Math.floor(m / 60);
  if (h < 24) return h + ' giờ trước';
  return Math.floor(h / 24) + ' ngày trước';
}

/* ----------------------------- trang HTML tĩnh ----------------------------- */

const CSS = 'body{font:16px/1.5 system-ui,sans-serif;max-width:30rem;margin:12vh auto;padding:0 1rem;color:#222}' +
  'h1{font-size:1.3rem}input,button{font:inherit;padding:.6rem;width:100%;box-sizing:border-box;margin:.3rem 0}' +
  'button{cursor:pointer;background:#2563eb;color:#fff;border:0;border-radius:8px}button.danger{background:#b3261e}' +
  'a{color:#0b57d0}.err{color:#b00020}.ok{color:#1b7f3b}code{background:#8882;padding:0 .3rem;border-radius:3px}' +
  'body.wide{max-width:44rem;margin-top:6vh}select{font:inherit;padding:.6rem;width:100%;box-sizing:border-box;margin:.3rem 0}' +
  '.dev{border:1px solid #8886;border-radius:8px;padding:.6rem .8rem;margin:.5rem 0}.dev form{margin-top:.4rem}' +
  '.tag{font-size:.8rem;background:#8883;border-radius:4px;padding:0 .4rem}.box{border:2px solid #1b7f3b;border-radius:8px;padding:.4rem .9rem;margin:.8rem 0}' +
  '.code{font:700 1.6rem/1.4 ui-monospace,Consolas,monospace;letter-spacing:.1em}small{opacity:.75}' +
  '@media(prefers-color-scheme:dark){body{background:#111;color:#eee}a{color:#8ab4ff}input,select{background:#222;color:#eee;border:1px solid #555}button.danger{background:#d93025}.err{color:#ff8a80}.ok{color:#7ee2a0}}';

function sendHtml(res, status, title, body, opts) {
  res.status(status).set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    /* KHÔNG dùng 'no-referrer': theo đặc tả Fetch, với chính sách đó trình duyệt gửi `Origin: null`
       cho form POST cùng nguồn, và sameOrigin() sẽ từ chối chính người dùng thật. 'same-origin' vẫn
       không lộ referrer ra ngoài nhưng giữ Origin thật cho request cùng nguồn. */
    'Referrer-Policy': 'same-origin',
    'X-Robots-Tag': 'noindex, nofollow'
  }).send('<!doctype html><html lang="vi"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + title + '</title><style>' + CSS + '</style></head><body' + (opts && opts.wide ? ' class="wide"' : '') + '>' + body + '</body></html>');
}
function lockedPage(res, ownerExists) {
  if (ownerExists) {
    sendHtml(res, 401, 'Quản Lý Kho', '<h1>Thiết bị này chưa được duyệt</h1>' +
      '<p>Hãy nhờ một thiết bị chủ tạo mã mời, rồi <a href="/auth/join">nhập mã mời</a> trên thiết bị này.</p>');
  } else {
    sendHtml(res, 401, 'Quản Lý Kho', '<h1>Chưa thiết lập thiết bị chủ</h1>' +
      '<p><a href="/auth/setup">Thiết lập thiết bị chủ</a> bằng mã trong nhật ký máy chủ.</p>');
  }
}
function setupPage(res, status, errorText) {
  sendHtml(res, status, 'Thiết lập thiết bị chủ',
    '<h1>Thiết lập thiết bị chủ</h1>' +
    '<p>Nhập mã thiết lập (xem bằng <code>docker compose logs</code>) để thiết bị này trở thành thiết bị chủ.</p>' +
    (errorText ? '<p class="err">' + errorText + '</p>' : '') +
    '<form method="post" action="/auth/setup" autocomplete="off">' +
    '<input name="code" placeholder="XXXX-XXXX-XXXX" required autocapitalize="characters" spellcheck="false">' +
    '<input name="name" placeholder="Tên thiết bị (ví dụ: PC cửa hàng)" maxlength="60">' +
    '<button type="submit">Xác nhận</button></form>');
}
function joinPage(res, status, errorText) {
  sendHtml(res, status, 'Thêm thiết bị',
    '<h1>Thêm thiết bị này vào kho</h1>' +
    '<p>Nhập mã mời do thiết bị chủ tạo (hiệu lực 5 phút, dùng một lần).</p>' +
    (errorText ? '<p class="err">' + esc(errorText) + '</p>' : '') +
    '<form method="post" action="/auth/join" autocomplete="off">' +
    '<input name="code" placeholder="XXXX-XXXX" required autocapitalize="characters" spellcheck="false">' +
    '<input name="name" placeholder="Tên thiết bị (ví dụ: Điện thoại)" maxlength="60">' +
    '<button type="submit">Tham gia</button></form>');
}
function forbiddenText(res) {
  res.status(403).set({ 'Cache-Control': 'no-store' }).type('text/plain').send('Forbidden');
}
function notFound(res) {
  res.status(404).set({ 'Cache-Control': 'no-store' }).type('text/plain').send('Not found');
}

/* ----------------------------- module chính ----------------------------- */

/**
 * @param {object} o
 * @param {Function} o.Database  constructor kiểu better-sqlite3
 * @param {string}   o.dataDir   thư mục chứa auth.db
 * @param {object}  [o.env]      mặc định process.env (QLK_SETUP_CODE: mã cố định, >= 12 ký tự)
 * @param {object}  [o.log]      mặc định console
 * @param {Function}[o.now]      mặc định Date.now (để test)
 */
export function createAuth({ Database, dataDir, env = process.env, log = console, now = Date.now }) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, 'auth.db');
  const adb = new Database(file);
  adb.pragma('journal_mode = WAL');
  adb.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      token_hash TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_seen_at INTEGER,
      revoked_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS auth_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS invites (
      id TEXT PRIMARY KEY,
      code_hash TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at INTEGER
    );
  `);

  /* Tên cookie riêng của bản cài này. Giữ nguyên khi đặt lại danh sách thiết bị. */
  let cookieName;
  {
    const row = adb.prepare("SELECT value FROM auth_meta WHERE key = 'cookie_name'").get();
    if (row && /^qlk_dev_[0-9a-f]{8}$/.test(String(row.value))) {
      cookieName = String(row.value);
    } else {
      cookieName = COOKIE_PREFIX + crypto.randomBytes(4).toString('hex');
      adb.prepare("INSERT INTO auth_meta (key, value) VALUES ('cookie_name', ?) " +
        "ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(cookieName);
    }
  }

  const qOwners = adb.prepare("SELECT COUNT(*) AS n FROM devices WHERE role = 'owner' AND revoked_at IS NULL");
  const qByHash = adb.prepare('SELECT id, role, name, last_seen_at FROM devices WHERE token_hash = ? AND revoked_at IS NULL');
  const qInsert = adb.prepare('INSERT INTO devices (id, token_hash, role, name, created_at, last_seen_at) VALUES (?, ?, ?, ?, ?, ?)');
  const qSeen = adb.prepare('UPDATE devices SET last_seen_at = ? WHERE id = ?');
  const qDevList = adb.prepare("SELECT id, role, name, created_at, last_seen_at FROM devices WHERE revoked_at IS NULL ORDER BY (role = 'owner') DESC, created_at");
  const qDevGet = adb.prepare('SELECT id, role, name FROM devices WHERE id = ? AND revoked_at IS NULL');
  const qRevoke = adb.prepare('UPDATE devices SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL');
  const qInvInsert = adb.prepare('INSERT INTO invites (id, code_hash, role, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)');
  const qInvByHash = adb.prepare('SELECT id, role FROM invites WHERE code_hash = ? AND used_at IS NULL AND expires_at > ?');
  const qInvUse = adb.prepare('UPDATE invites SET used_at = ? WHERE id = ? AND used_at IS NULL');
  const qInvActive = adb.prepare('SELECT id, role, expires_at FROM invites WHERE used_at IS NULL AND expires_at > ? ORDER BY created_at DESC');
  const qInvPurge = adb.prepare('DELETE FROM invites WHERE expires_at < ?');

  const activeOwners = () => Number(qOwners.get().n);
  const hasOwner = () => activeOwners() > 0;

  let setupCode = null;
  let codeAnnounced = false;
  let fails = 0;
  let lockedUntil = 0;
  let joinFails = 0;
  let joinLockedUntil = 0;

  /* Trả về mã thiết lập đang hiệu lực, hoặc null nếu đã có thiết bị chủ. */
  function ensureSetupCode() {
    if (hasOwner()) { setupCode = null; return null; }
    if (!setupCode) {
      const fromEnv = normalizeCode(env && env.QLK_SETUP_CODE);
      if (fromEnv && fromEnv.length >= SETUP_LEN) {
        setupCode = fromEnv;
        if (!codeAnnounced) log.log('[auth] Dùng mã thiết lập trong biến QLK_SETUP_CODE.');
      } else {
        if (fromEnv) log.warn('[auth] QLK_SETUP_CODE ngắn hơn ' + SETUP_LEN + ' ký tự, bỏ qua và tạo mã ngẫu nhiên.');
        setupCode = newSetupCode();
        if (!codeAnnounced) log.log('[auth] Mã thiết lập thiết bị chủ: ' + formatCode(setupCode));
      }
      codeAnnounced = true;
    }
    return setupCode;
  }

  function tryCode(code) {
    const t = now();
    if (t < lockedUntil) return 'locked';
    const expected = ensureSetupCode();
    if (!expected) return 'closed';
    if (safeEqual(normalizeCode(code), expected)) { fails = 0; return 'ok'; }
    fails += 1;
    log.warn('[auth] Mã thiết lập sai (lần ' + fails + '/' + MAX_FAILS + ').');
    if (fails >= MAX_FAILS) { lockedUntil = t + LOCK_MS; fails = 0; log.warn('[auth] Khóa thiết lập 15 phút.'); }
    return 'bad';
  }

  function createDevice(role, name) {
    const token = crypto.randomBytes(32).toString('base64url');
    const id = crypto.randomBytes(6).toString('hex');
    const t = now();
    qInsert.run(id, sha256(token), role, cleanName(name, role === 'owner' ? 'Thiết bị chủ' : 'Thiết bị'), t, t);
    return { id, token };
  }

  /* Request tới qua HTTPS (trực tiếp hoặc sau proxy như Caddy). Chỉ dùng để đặt cờ Secure cho cookie:
     kẻ giả X-Forwarded-Proto chỉ làm cookie của chính họ có thêm cờ Secure, không gây hại. */
  function isHttps(req) {
    if (req.secure === true) return true;
    const xf = String((req.headers && req.headers['x-forwarded-proto']) || '').split(',')[0].trim().toLowerCase();
    return xf === 'https';
  }
  function cookieOptions(req) {
    return { httpOnly: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE_MS, secure: isHttps(req) };
  }

  function sameOrigin(req) {
    // Trình duyệt hiện đại luôn gửi Sec-Fetch-Site; cross-site và same-site (khác cổng) đều bị chặn.
    const site = req.headers && req.headers['sec-fetch-site'];
    if (site && site !== 'same-origin' && site !== 'none') return false;
    const origin = req.headers && req.headers.origin;
    if (!origin) return true; // curl và trình duyệt rất cũ không gửi Origin; cookie SameSite=Lax vẫn bảo vệ các thao tác cần đăng nhập
    // Cố ý KHÔNG chấp nhận Origin: null (iframe sandbox, chuyển hướng chéo nguồn, file://): đó là cách các trang lạ giả request.
    try { return new URL(origin).host === (req.headers.host || ''); } catch (e) { return false; }
  }

  /* Trả về thiết bị đã duyệt ứng với cookie của request, hoặc null. */
  function authenticate(req) {
    const tok = getCookie(req, cookieName);
    if (!tok || tok.length < 20 || tok.length > 200) return null;
    const row = qByHash.get(sha256(tok));
    if (!row) return null;
    const t = now();
    if (!row.last_seen_at || t - Number(row.last_seen_at) > SEEN_EVERY_MS) qSeen.run(t, row.id);
    return { id: row.id, role: row.role, name: row.name };
  }

  function deny(req, res) {
    res.set({ 'Cache-Control': 'no-store' });
    if (String(req.path).startsWith('/api/')) {
      return res.status(401).json({ success: false, error: 'Thiết bị chưa được duyệt', code: 'device_not_approved' });
    }
    return lockedPage(res, hasOwner());
  }

  /* Cổng mặc định từ chối: đặt ĐẦU TIÊN, trước bộ đọc body và mọi route. */
  function gate(req, res, next) {
    const allowed = PUBLIC[req.path];
    if (allowed && allowed.includes(req.method)) return next();
    const dev = authenticate(req);
    if (dev) { req.device = dev; renewCookie(req, res, dev); return next(); }
    return deny(req, res);
  }

  /* Cookie sống 365 ngày KỂ TỪ LẦN DÙNG GẦN NHẤT (không phải từ lúc tham gia), và được cấp lại
     với cờ Secure ngay khi thiết bị bắt đầu dùng HTTPS. Mỗi thiết bị tối đa một lần mỗi ngày. */
  const renewedAt = new Map();
  function renewCookie(req, res, dev) {
    const t = now();
    if (t - (renewedAt.get(dev.id) || 0) < RENEW_EVERY_MS) return;
    renewedAt.set(dev.id, t);
    if (typeof res.cookie === 'function') res.cookie(cookieName, getCookie(req, cookieName), cookieOptions(req));
  }

  function formOf(req) {
    try { return new URLSearchParams(typeof req.body === 'string' ? req.body : ''); } catch (e) { return new URLSearchParams(''); }
  }

  /* ---- trang quản lý thiết bị (chỉ thiết bị chủ) ---- */

  function renderDevices(req, res, status, o) {
    o = o || {};
    const t = now();
    const devs = qDevList.all();
    const owners = devs.filter(d => d.role === 'owner').length;
    const invs = qInvActive.all(t);
    let h = '<h1>Thiết bị được duyệt</h1>';
    if (o.notice) h += '<p class="' + (o.error ? 'err' : 'ok') + '">' + esc(o.notice) + '</p>';
    if (o.newInvite) {
      h += '<div class="box"><p>Mã mời ' + (o.newInvite.role === 'owner' ? '(thiết bị chủ)' : '(thành viên)') +
        ' — chỉ hiện một lần, còn hiệu lực ' + Math.round(INVITE_TTL_MS / 60000) + ' phút:</p>' +
        '<p class="code">' + esc(o.newInvite.code) + '</p>' +
        '<p>Trên thiết bị mới, mở <code>/auth/join</code> và nhập mã này.</p></div>';
    }
    for (const d of devs) {
      const self = d.id === req.device.id;
      h += '<div class="dev"><div><strong>' + esc(d.name) + '</strong> <span class="tag">' +
        (d.role === 'owner' ? 'Chủ' : 'Thành viên') + '</span>' +
        (self ? ' <span class="tag">thiết bị này</span>' : '') +
        '<br><small>Lần cuối: ' + esc(ago(t - Number(d.last_seen_at || d.created_at))) + '</small></div>';
      if (!self) {
        h += '<form method="post" action="/auth/devices/revoke"><input type="hidden" name="id" value="' + esc(d.id) + '">' +
          (d.role === 'owner' ? '<label><input type="checkbox" name="confirm" value="yes" required style="width:auto"> Tôi hiểu đây là thiết bị chủ</label>' : '') +
          '<button type="submit" class="danger">Thu hồi</button></form>';
      }
      h += '</div>';
    }
    h += '<h2>Mời thiết bị mới</h2><form method="post" action="/auth/devices/invite"><select name="role">' +
      '<option value="member">Thành viên (xem và sửa kho)</option>' +
      (owners < MAX_OWNERS ? '<option value="owner">Thiết bị chủ (duyệt được thiết bị khác)</option>' : '') +
      '</select><button type="submit">Tạo mã mời</button></form>';
    if (invs.length) {
      h += '<p><small>Mã mời chưa dùng: ' + invs.map(i => (i.role === 'owner' ? 'chủ' : 'thành viên') +
        ' (còn ' + Math.max(1, Math.ceil((Number(i.expires_at) - t) / 60000)) + ' phút)').join(', ') + '</small></p>';
    }
    if (t < joinLockedUntil) {
      h += '<p class="err">Đang khóa nhập mã mời do nhập sai nhiều lần (còn ' + Math.ceil((joinLockedUntil - t) / 60000) + ' phút).</p>' +
        '<form method="post" action="/auth/devices/unlock"><button type="submit">Mở khóa nhập mã mời</button></form>';
    }
    h += '<p><a href="/">Về kho</a></p>';
    sendHtml(res, status, 'Thiết bị được duyệt', h, { wide: true });
  }

  function ownerOnly(req, res) {
    if (!req.device) { deny(req, res); return false; }
    if (req.device.role !== 'owner') {
      sendHtml(res, 403, 'Quản Lý Kho', '<h1>Không đủ quyền</h1>' +
        '<p>Chỉ thiết bị chủ mới quản lý được thiết bị khác.</p><p><a href="/">Về kho</a></p>');
      return false;
    }
    return true;
  }

  /* Đăng ký /auth/setup. textParser: express.text({ type: '*\/*', limit: '2kb' }). */
  function mount(app, textParser) {
    app.get('/auth/setup', (req, res) => {
      if (!ensureSetupCode()) return notFound(res);
      return setupPage(res, 200, '');
    });
    app.post('/auth/setup', textParser, (req, res) => {
      if (!ensureSetupCode()) return notFound(res);
      if (!sameOrigin(req)) return res.status(403).type('text/plain').send('Forbidden');
      let params;
      try { params = new URLSearchParams(typeof req.body === 'string' ? req.body : ''); } catch (e) { params = new URLSearchParams(''); }
      const verdict = tryCode(params.get('code'));
      if (verdict === 'locked') return setupPage(res, 429, 'Nhập sai quá nhiều lần. Đợi 15 phút hoặc khởi động lại máy chủ.');
      if (verdict === 'closed') return notFound(res);
      if (verdict !== 'ok') return setupPage(res, 400, 'Mã không đúng.');
      const dev = createDevice('owner', params.get('name'));
      setupCode = null;
      log.log('[auth] Đã thiết lập thiết bị chủ (id ' + dev.id + ').');
      res.cookie(cookieName, dev.token, cookieOptions(req));
      return res.redirect(303, '/');
    });

    /* ---- giai đoạn 2 ---- */

    app.get('/auth/join', (req, res) => {
      if (authenticate(req)) return res.redirect(303, '/');
      if (!hasOwner()) return res.redirect(303, '/auth/setup');
      return joinPage(res, 200, '');
    });
    app.post('/auth/join', textParser, (req, res) => {
      if (authenticate(req)) return res.redirect(303, '/');
      if (!hasOwner()) return res.redirect(303, '/auth/setup');
      if (!sameOrigin(req)) return forbiddenText(res);
      const t = now();
      if (t < joinLockedUntil) return joinPage(res, 429, 'Nhập sai quá nhiều lần. Nhờ thiết bị chủ mở khóa, hoặc đợi 15 phút.');
      const p = formOf(req);
      const code = normalizeCode(p.get('code'));
      const inv = code.length === INVITE_LEN ? qInvByHash.get(sha256(code), t) : undefined;
      if (!inv) {
        joinFails += 1;
        log.warn('[auth] Mã mời sai hoặc hết hạn (lần ' + joinFails + '/' + MAX_FAILS + ').');
        if (joinFails >= MAX_FAILS) { joinLockedUntil = t + LOCK_MS; joinFails = 0; log.warn('[auth] Khóa nhập mã mời 15 phút.'); }
        return joinPage(res, 400, 'Mã không đúng hoặc đã hết hạn.');
      }
      if (inv.role === 'owner' && activeOwners() >= MAX_OWNERS) {
        return joinPage(res, 400, 'Đã đủ ' + MAX_OWNERS + ' thiết bị chủ. Hãy thu hồi một thiết bị chủ trước.');
      }
      if (Number(qInvUse.run(t, inv.id).changes) !== 1) return joinPage(res, 400, 'Mã không đúng hoặc đã hết hạn.');
      const dev = createDevice(inv.role, p.get('name'));
      joinFails = 0;
      log.log('[auth] Thiết bị mới tham gia (id ' + dev.id + ', vai trò ' + inv.role + ').');
      res.cookie(cookieName, dev.token, cookieOptions(req));
      return res.redirect(303, '/');
    });

    app.get('/auth/devices', (req, res) => {
      if (!ownerOnly(req, res)) return;
      return renderDevices(req, res, 200);
    });
    app.post('/auth/devices/invite', textParser, (req, res) => {
      if (!ownerOnly(req, res)) return;
      if (!sameOrigin(req)) return forbiddenText(res);
      const role = formOf(req).get('role') === 'owner' ? 'owner' : 'member';
      if (role === 'owner' && activeOwners() >= MAX_OWNERS) {
        return renderDevices(req, res, 400, { error: true, notice: 'Đã đủ ' + MAX_OWNERS + ' thiết bị chủ.' });
      }
      const t = now();
      const code = randomCode(INVITE_LEN);
      qInvPurge.run(t - INVITE_KEEP_MS);
      qInvInsert.run(crypto.randomBytes(6).toString('hex'), sha256(code), role, req.device.id, t, t + INVITE_TTL_MS);
      joinFails = 0;
      joinLockedUntil = 0;
      log.log('[auth] Thiết bị ' + req.device.id + ' tạo mã mời (' + role + ').');
      return renderDevices(req, res, 200, { newInvite: { code: formatCode(code), role } });
    });
    app.post('/auth/devices/revoke', textParser, (req, res) => {
      if (!ownerOnly(req, res)) return;
      if (!sameOrigin(req)) return forbiddenText(res);
      const p = formOf(req);
      const target = qDevGet.get(String(p.get('id') || ''));
      if (!target) return renderDevices(req, res, 404, { error: true, notice: 'Không tìm thấy thiết bị.' });
      if (target.id === req.device.id) {
        return renderDevices(req, res, 400, { error: true, notice: 'Không thể thu hồi chính thiết bị đang dùng.' });
      }
      if (target.role === 'owner' && p.get('confirm') !== 'yes') {
        return renderDevices(req, res, 400, { error: true, notice: 'Cần xác nhận khi thu hồi thiết bị chủ.' });
      }
      qRevoke.run(now(), target.id);
      log.log('[auth] Thiết bị ' + req.device.id + ' thu hồi thiết bị ' + target.id + ' (' + target.role + ').');
      return renderDevices(req, res, 200, { notice: 'Đã thu hồi "' + target.name + '".' });
    });
    app.post('/auth/devices/unlock', textParser, (req, res) => {
      if (!ownerOnly(req, res)) return;
      if (!sameOrigin(req)) return forbiddenText(res);
      joinFails = 0;
      joinLockedUntil = 0;
      log.log('[auth] Thiết bị ' + req.device.id + ' mở khóa nhập mã mời.');
      return renderDevices(req, res, 200, { notice: 'Đã mở khóa nhập mã mời.' });
    });
  }

  function announce(port) {
    if (hasOwner()) { log.log('[auth] Chỉ thiết bị đã được duyệt mới truy cập được.'); return; }
    ensureSetupCode();
    log.log('[auth] Chưa có thiết bị chủ. Mở http://<IP-máy-tính>:' + port + '/auth/setup trên thiết bị đầu tiên và nhập mã ở trên.');
  }

  function close() {
    try { adb.close(); } catch (e) { /* đã đóng */ }
  }

  return { gate, mount, announce, close, hasOwner, file, cookieName };
}
