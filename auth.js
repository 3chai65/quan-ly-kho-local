/**
 * Lớp bảo vệ truy cập — giai đoạn 1.
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
 * Giai đoạn sau (chưa có ở đây): mã mời, xin duyệt, danh sách và thu hồi thiết bị.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const COOKIE_PREFIX = 'qlk_dev_';
const COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
/* 31 ký tự, bỏ 0 1 I L O cho dễ đọc. 12 ký tự ≈ 59 bit. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SETUP_LEN = 12;
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const SEEN_EVERY_MS = 60 * 1000;

/* Đường dẫn công khai (so khớp CHÍNH XÁC, phân biệt hoa thường) và phương thức được phép. */
const PUBLIC = {
  '/healthz': ['GET', 'HEAD'],
  '/favicon.ico': ['GET', 'HEAD'],
  '/robots.txt': ['GET', 'HEAD'],
  '/auth/setup': ['GET', 'POST']
};

const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

export function normalizeCode(s) {
  return String(s == null ? '' : s).toUpperCase().replace(/[\s-]/g, '');
}
export function newSetupCode() {
  let out = '';
  for (let i = 0; i < SETUP_LEN; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}
function formatCode(c) {
  return c.match(/.{1,4}/g).join('-');
}
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
export function getCookie(req, name) {
  const header = (req.headers && req.headers.cookie) || '';
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return '';
}
function cleanName(n) {
  const s = String(n == null ? '' : n).replace(/[\u0000-\u001f<>&"']/g, '').trim().slice(0, 60);
  return s || 'Thiết bị chủ';
}

/* ----------------------------- trang HTML tĩnh ----------------------------- */

const CSS = 'body{font:16px/1.5 system-ui,sans-serif;max-width:30rem;margin:12vh auto;padding:0 1rem;color:#222}' +
  'h1{font-size:1.3rem}input,button{font:inherit;padding:.6rem;width:100%;box-sizing:border-box;margin:.3rem 0}' +
  'button{cursor:pointer}.err{color:#b00020}code{background:#8882;padding:0 .3rem;border-radius:3px}' +
  '@media(prefers-color-scheme:dark){body{background:#111;color:#eee}input{background:#222;color:#eee;border:1px solid #555}.err{color:#ff8a80}}';

function sendHtml(res, status, title, body) {
  res.status(status).set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow'
  }).send('<!doctype html><html lang="vi"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + title + '</title><style>' + CSS + '</style></head><body>' + body + '</body></html>');
}
function lockedPage(res, ownerExists) {
  if (ownerExists) {
    sendHtml(res, 401, 'Quản Lý Kho', '<h1>Thiết bị này chưa được duyệt</h1>' +
      '<p>Hãy nhờ một thiết bị chủ cho phép thiết bị này truy cập kho.</p>');
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

  const hasOwner = () => Number(qOwners.get().n) > 0;

  let setupCode = null;
  let codeAnnounced = false;
  let fails = 0;
  let lockedUntil = 0;

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
    qInsert.run(id, sha256(token), role, cleanName(name), t, t);
    return { id, token };
  }

  function sameOrigin(req) {
    const origin = req.headers && req.headers.origin;
    if (!origin) return true; // form cùng nguồn trên trình duyệt cũ có thể không gửi Origin
    try { return new URL(origin).host === (req.headers.host || ''); } catch (e) { return false; }
  }

  /* Cổng mặc định từ chối: đặt ĐẦU TIÊN, trước bộ đọc body và mọi route. */
  function gate(req, res, next) {
    const allowed = PUBLIC[req.path];
    if (allowed && allowed.includes(req.method)) return next();

    const tok = getCookie(req, cookieName);
    if (tok && tok.length >= 20 && tok.length <= 200) {
      const row = qByHash.get(sha256(tok));
      if (row) {
        const t = now();
        if (!row.last_seen_at || t - Number(row.last_seen_at) > SEEN_EVERY_MS) qSeen.run(t, row.id);
        req.device = { id: row.id, role: row.role, name: row.name };
        return next();
      }
    }
    res.set({ 'Cache-Control': 'no-store' });
    if (String(req.path).startsWith('/api/')) {
      return res.status(401).json({ success: false, error: 'Thiết bị chưa được duyệt', code: 'device_not_approved' });
    }
    return lockedPage(res, hasOwner());
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
      res.cookie(cookieName, dev.token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE_MS });
      return res.redirect(303, '/');
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
