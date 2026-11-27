/**
 * Quản Lý Kho — server local (Docker + SQLite)
 * ---------------------------------------------------------------
 * App một người, chỉ trong LAN. Dữ liệu là file SQLite trên ổ cứng.
 * Repo Cloudflare Worker là bản khác, không còn trong thư mục này.
 *
 *   GET  /api/state   -> { success, data } ; data.moneyUnit = "dong" (tiền là đồng nguyên)
 *   PUT  /api/state   -> ghi snapshot. Cảnh báo (không chặn) khi productId mồ côi
 *                        hoặc tồn khác nhập − bán. Tồn lệch còn nằm ở stockDrift
 *                        (id, name, stock, calc). Thiếu X-Base-Updated và không có X-Force: 428.
 *                        X-Base-Updated không phải số: 400. Base cũ: 409, trừ khi X-Force.
 *   GET  /api/backups -> danh sách file backup (không trả đường dẫn thư mục)
 *   POST /api/close-year -> chốt sổ năm âm lịch (chỉ owner; { cutoff, dryRun }), docs/chot-so.md
 *   GET  /api/close-archive[/<file>] -> danh sách / tải file lưu trữ phần đã chốt (chỉ owner)
 *   GET  /            -> HTML (src/page.js ghép index.html + style.css + app.js, CSP inline, không nonce)
 *
 * Chỉ thiết bị đã được duyệt mới vào được (auth.js, cookie qlk_dev; danh sách thiết bị
 * nằm ở data/auth.db). Thiết bị chủ đầu tiên thiết lập bằng mã in trong log, qua /auth/setup.
 *   GET  /healthz     -> 'ok' (không cần duyệt, không trả dữ liệu; dùng cho healthcheck)
 * SQLite đồng bộ (better-sqlite3), mỗi lần ghi là một transaction.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import Database from 'better-sqlite3';

import { PAGE } from './src/page.js';
import { createAuth } from './auth.js';
import { mountPwa } from './pwa.js';
import { closePlan, mergeMonths } from './close.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 8787;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'app.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(DATA_DIR, 'backups');
const BACKUP_KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS) || 30;
/* AA: trần thân PUT TÍNH SAU GIẢI NÉN (body-parser đếm byte đã inflate nên chặn bom nén); client gửi gzip (Content-Encoding) từ 2.39.0. */
const MAX_BODY = 32 * 1024 * 1024;
const MAX_INLINE = 200 * 1024;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const NAME_MAX = 200;
const QTY_MAX = 1e6;
const GRAMS_MAX = 1e9;
const THANG_MAX = 1e4;
const MONEY_MAX = 1e12;

/* ============================ DATABASE ============================ */

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      stock_kg REAL NOT NULL DEFAULT 0,
      cost_price_vnd REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_name_nocase
      ON products(name COLLATE NOCASE);

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('NHAP', 'BAN')),
      product_id TEXT NOT NULL,
      qty_kg REAL NOT NULL,
      price_vnd REAL NOT NULL,
      total_vnd REAL NOT NULL,
      cost_vnd REAL,
      order_id TEXT,
      order_name TEXT,
      retail INTEGER NOT NULL DEFAULT 0,
      rx INTEGER NOT NULL DEFAULT 0,
      grams REAL,
      thang INTEGER,
      unit_price_vnd REAL,
      ts INTEGER,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(order_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_product ON transactions(product_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type_ts ON transactions(type, ts);

    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      total_vnd REAL NOT NULL DEFAULT 0,
      thang INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS prescription_items (
      prescription_id TEXT NOT NULL
        REFERENCES prescriptions(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      grams REAL NOT NULL,
      PRIMARY KEY (prescription_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS unread (
      kind TEXT NOT NULL CHECK (kind IN ('BAN', 'NHAP')),
      key TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (kind, key)
    );

    CREATE TABLE IF NOT EXISTS write_log (
      updated_at INTEGER PRIMARY KEY,
      op_id TEXT
    );
  `);
}
migrate();
/* 2.40.0 chốt sổ: dòng "Tồn đầu kỳ" = NHAP có opening = 1 (ALTER ADD, không dựng lại bảng). */
if (!db.prepare('PRAGMA table_info(transactions)').all().some(c => c.name === 'opening')) {
  db.exec('ALTER TABLE transactions ADD COLUMN opening INTEGER NOT NULL DEFAULT 0');
}
function getMeta(key) {
  const row = db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key);
  return row ? row.value : null;
}
function setMeta(key, value) {
  db.prepare('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(value));
}
/* Bảng tóm tắt phần đã gỡ: server sở hữu, không nhận từ PUT. Hỏng → coi như rỗng (không chặn đọc). */
function getClosed() {
  const cutoff = getMeta('close_cutoff');
  if (!cutoff) return null;
  let months = [];
  try { const v = JSON.parse(getMeta('close_summary') || '[]'); if (Array.isArray(v)) months = v; } catch (e) { /* giữ rỗng */ }
  return { cutoff, months };
}

/* Danh sách thiết bị được duyệt nằm ở file riêng (data/auth.db), tách khỏi app.db
   để ghi snapshot hay khôi phục backup không làm đổi quyền truy cập. */
const auth = createAuth({ Database, dataDir: DATA_DIR });

/* ============================ STATE ============================ */

function decNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
/* Cùng dec() trên client: dọn nhiễu nhị phân (0.1 + 0.2), không làm tròn số kg thật.
   Tồn so với nhập − bán bằng công thức này, rồi mới xét lệch. Không so bằng ===. */
function decQty(n) {
  n = Number(n);
  if (!Number.isFinite(n) || n === 0) return 0;
  for (let p = 1; p < 15; p++) {
    const r = Number(n.toPrecision(p));
    if (Math.abs(n - r) <= Math.abs(n) * 1e-12) return r;
  }
  return Number(n.toPrecision(15));
}
function decNullable(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
/* Tiền lưu bằng đồng nguyên. API và SQLite dùng đơn vị này.
   Ô nhập trên trang vẫn là nghìn đồng; client nhân 1000 trước khi gửi. */
function money(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
function moneyNullable(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function getSourceUpdatedAt() {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'source_updated_at'").get();
  return row ? Number(row.value) || 0 : 0;
}

function readState() {
  const products = db.prepare('SELECT id, name, stock_kg AS stock, cost_price_vnd AS costPrice FROM products ORDER BY name COLLATE NOCASE').all();
  const transactions = db.prepare('SELECT id, date, type, product_id AS productId, qty_kg AS qty, price_vnd AS price, total_vnd AS total, cost_vnd AS cost, order_id AS oid, order_name AS oname, retail, rx, grams AS g, thang, unit_price_vnd AS unitPrice, ts, opening FROM transactions ORDER BY COALESCE(ts, 0) ASC, rowid ASC').all();
  const prescriptions = db.prepare('SELECT id, name, total_vnd AS total, thang, updated_at AS updatedAt FROM prescriptions ORDER BY updated_at DESC, rowid ASC').all();
  const prescriptionItems = db.prepare('SELECT prescription_id AS prescriptionId, product_id AS productId, grams FROM prescription_items ORDER BY prescription_id, rowid ASC').all();

  const itemsByPrescription = new Map();
  for (const item of prescriptionItems) {
    const list = itemsByPrescription.get(item.prescriptionId) || [];
    list.push({ productId: String(item.productId), grams: decNum(item.grams) });
    itemsByPrescription.set(item.prescriptionId, list);
  }

  const cl = getClosed();
  return {
    moneyUnit: 'dong',
    products: products.map(p => ({ id: String(p.id), name: String(p.name), stock: decNum(p.stock), costPrice: money(p.costPrice) })),
    transactions: transactions.map(t => {
      const tx = {
        id: String(t.id), date: String(t.date), type: t.type === 'NHAP' ? 'NHAP' : 'BAN',
        productId: String(t.productId), qty: decNum(t.qty), price: money(t.price), total: money(t.total),
        cost: moneyNullable(t.cost), oid: t.oid == null ? undefined : String(t.oid), oname: t.oname == null ? undefined : String(t.oname),
        retail: !!Number(t.retail), rx: !!Number(t.rx), g: decNullable(t.g), thang: decNullable(t.thang),
        unitPrice: moneyNullable(t.unitPrice), ts: decNullable(t.ts)
      };
      if (tx.cost == null) delete tx.cost;
      if (tx.oid == null) delete tx.oid;
      if (tx.oname == null || tx.oname === tx.oid) delete tx.oname;
      if (!tx.retail) delete tx.retail;
      if (!tx.rx) delete tx.rx;
      if (tx.g == null) delete tx.g;
      if (tx.thang == null) delete tx.thang;
      if (tx.unitPrice == null) delete tx.unitPrice;
      if (tx.ts == null) delete tx.ts;
      if (Number(t.opening)) tx.open = true;
      return tx;
    }),
    prescriptions: prescriptions.map(r => ({
      id: String(r.id), name: String(r.name), items: itemsByPrescription.get(r.id) || [],
      total: money(r.total), thang: Math.max(1, Math.round(decNum(r.thang)) || 1), updatedAt: decNum(r.updatedAt)
    })),
    updatedAt: getSourceUpdatedAt(),
    ...(cl ? { closed: cl } : {})
  };
}

/* Cùng luật với inRange ở src/app.js: chỉ nhận number hữu hạn hoặc chuỗi số thập phân; loại boolean, '', ' ', null, mảng, '0x10'. */
const DEC_STR_RE = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
function isNumLike(value) {
  if (typeof value === 'number') return Number.isFinite(value);
  return typeof value === 'string' && DEC_STR_RE.test(value.trim());
}
function isNonNegNumber(value, max) {
  if (!isNumLike(value)) return false;
  const n = Number(value);
  return n >= 0 && n <= max;
}
function isPositiveNumber(value, max) {
  if (!isNumLike(value)) return false;
  const n = Number(value);
  return n > 0 && n <= max;
}
/* Ngày thật, không chỉ đúng hình dạng. Dùng UTC để không phụ thuộc TZ máy chạy. */
function isRealDate(value) {
  const s = String(value || '');
  if (!DATE_RE.test(s)) return false;
  const y = +s.slice(0, 4), m = +s.slice(5, 7), d = +s.slice(8, 10);
  if (y < 2000 || y > 2100) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/* Khóa so tên (vị thuốc và đơn thuốc dùng chung; cùng luật với nameKey ở src/app.js): NFC, gọn khoảng trắng, không phân biệt hoa/thường. */
function normNameKey(name) {
  return String(name).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

function validateState(d) {
  const errors = [];
  const warnings = [];
  const stockDrift = [];
  const state = { products: [], transactions: [], prescriptions: [] };
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    return { state, errors: ['Dữ liệu không phải object'], warnings, stockDrift };
  }
  /* Tiền là đồng nguyên; thiếu cờ hoặc cờ khác 'dong' (bản cũ đơn vị nghìn) bị từ chối, không tự nhân 1000. */
  if (d.moneyUnit !== 'dong') {
    return { state, errors: ['Thiếu hoặc sai moneyUnit (phải là "dong")'], warnings, stockDrift };
  }
  const fail = msg => { if (errors.length < 20) errors.push(msg); };
  const warn = msg => { if (warnings.length < 50) warnings.push(msg); };
  for (const key of ['products', 'transactions', 'prescriptions']) {
    if (!Array.isArray(d[key])) fail('Thiếu mảng ' + key);
  }
  if (errors.length) return { state, errors, warnings, stockDrift };

  const productIds = new Set();
  const productNames = new Set();
  d.products.forEach((p, i) => {
    const label = 'Sản phẩm #' + (i + 1);
    if (!p || typeof p !== 'object') { fail(label + ': không hợp lệ'); return; }
    const name = String(p.name || '').trim();
    if (!name) { fail(label + ': thiếu tên'); return; }
    if (name.length > NAME_MAX) fail(label + ' "' + name.slice(0, 40) + '…": tên quá dài (tối đa ' + NAME_MAX + ' ký tự)');
    if (!isNonNegNumber(p.stock, QTY_MAX)) fail(label + ' "' + name + '": tồn kho phải từ 0 đến ' + QTY_MAX);
    if (!isNonNegNumber(p.costPrice, MONEY_MAX)) fail(label + ' "' + name + '": giá nhập phải từ 0 đến ' + MONEY_MAX);
    const id = String(p.id || randomId());
    const nameKey = normNameKey(name);
    if (productIds.has(id)) { fail(label + ' "' + name + '": trùng id ' + id); return; }
    if (productNames.has(nameKey)) { fail(label + ': trùng tên sản phẩm "' + name + '"'); return; }
    productIds.add(id);
    productNames.add(nameKey);
    state.products.push({ id, name, stock: decNum(p.stock), costPrice: money(p.costPrice) });
  });

  const txIds = new Set();
  const openPids = new Set();
  d.transactions.forEach((t, i) => {
    const label = 'Giao dịch #' + (i + 1);
    if (!t || typeof t !== 'object') { fail(label + ': không hợp lệ'); return; }
    if (t.type !== 'NHAP' && t.type !== 'BAN') { fail(label + ': loại phải là NHAP hoặc BAN'); return; }
    if (t.open != null && t.open !== true && t.open !== false) { fail(label + ': cờ open không hợp lệ'); return; }
    if (t.open === true && t.type !== 'NHAP') { fail(label + ': dòng tồn đầu kỳ phải là NHAP'); return; }
    if (!isRealDate(t.date)) { fail(label + ': ngày phải là ngày thật YYYY-MM-DD trong 2000-2100'); return; }
    const productId = String(t.productId || '').trim();
    if (!productId) { fail(label + ': thiếu productId'); return; }
    if (!productIds.has(productId)) warn(label + ': productId không có trong danh sách sản phẩm: ' + productId);
    if (!isPositiveNumber(t.qty, QTY_MAX)) fail(label + ': số lượng phải > 0 và <= ' + QTY_MAX);
    if (!isNonNegNumber(t.price, MONEY_MAX)) fail(label + ': đơn giá phải từ 0 đến ' + MONEY_MAX);
    if (!isNonNegNumber(t.total, MONEY_MAX)) fail(label + ': thành tiền phải từ 0 đến ' + MONEY_MAX);
    if (t.cost != null && !isNonNegNumber(t.cost, MONEY_MAX)) fail(label + ': giá vốn phải từ 0 đến ' + MONEY_MAX);
    if (t.ts != null && !isNumLike(t.ts)) fail(label + ': ts không hợp lệ');
    if (t.g != null && !isNonNegNumber(t.g, GRAMS_MAX)) fail(label + ': grams phải từ 0 đến ' + GRAMS_MAX);
    if (t.thang != null && (!isNumLike(t.thang) || Number(t.thang) < 1 || Number(t.thang) > THANG_MAX)) fail(label + ': số thang phải từ 1 đến ' + THANG_MAX);
    if (t.unitPrice != null && !isNonNegNumber(t.unitPrice, MONEY_MAX)) fail(label + ': giá 1 thang phải từ 0 đến ' + MONEY_MAX);
    const id = String(t.id || randomId());
    if (txIds.has(id)) { fail(label + ': trùng id giao dịch ' + id); return; }
    txIds.add(id);
    if (t.open === true) {
      if (openPids.has(productId)) { fail(label + ': hai dòng tồn đầu kỳ cho cùng vị ' + productId); return; }
      openPids.add(productId);
    }
    const rawOid = t.oid != null ? String(t.oid) : (t.orderId != null ? String(t.orderId) : null);
    const rawOname = t.oname != null ? String(t.oname).trim() : (t.orderName != null ? String(t.orderName).trim() : null);
    if (rawOname && rawOname.length > NAME_MAX) fail(label + ': tên đơn quá dài (tối đa ' + NAME_MAX + ' ký tự)');
    const orderId = rawOid || null;
    const orderName = (rawOname && rawOname !== rawOid) ? rawOname : null;
    state.transactions.push({
      id, date: String(t.date), type: t.type, productId,
      qty: decNum(t.qty), price: money(t.price), total: money(t.total), cost: moneyNullable(t.cost),
      orderId, orderName,
      retail: !!t.retail, rx: !!t.rx, grams: decNullable(t.g), thang: t.thang == null ? null : Math.round(Number(t.thang)),
      unitPrice: moneyNullable(t.unitPrice), ts: decNullable(t.ts), opening: t.open === true
    });
  });

  const rxIds = new Set();
  const rxNames = new Set();
  d.prescriptions.forEach((r, i) => {
    const label = 'Đơn thuốc #' + (i + 1);
    if (!r || typeof r !== 'object') { fail(label + ': không hợp lệ'); return; }
    const name = String(r.name || '').trim();
    if (!name) { fail(label + ': thiếu tên'); return; }
    if (name.length > NAME_MAX) fail(label + ' "' + name.slice(0, 40) + '…": tên quá dài (tối đa ' + NAME_MAX + ' ký tự)');
    if (!isNonNegNumber(r.total, MONEY_MAX)) fail(label + ' "' + name + '": tổng tiền phải từ 0 đến ' + MONEY_MAX);
    if (r.thang != null && (!isNumLike(r.thang) || Number(r.thang) < 1 || Number(r.thang) > THANG_MAX)) fail(label + ' "' + name + '": số thang phải từ 1 đến ' + THANG_MAX);
    if (!Array.isArray(r.items) || !r.items.length) { fail(label + ' "' + name + '": chưa có vị thuốc'); return; }
    const id = String(r.id || randomId());
    if (rxIds.has(id)) { fail(label + ' "' + name + '": trùng id ' + id); return; }
    if (rxNames.has(normNameKey(name))) { fail(label + ': trùng tên đơn thuốc "' + name + '"'); return; }
    rxIds.add(id);
    rxNames.add(normNameKey(name));
    const itemIds = new Set();
    const items = [];
    r.items.forEach((item, j) => {
      if (!item || typeof item !== 'object') { fail(label + ' dòng ' + (j + 1) + ': không hợp lệ'); return; }
      const itemPid = String(item.productId || '').trim();
      if (!itemPid) { fail(label + ' dòng ' + (j + 1) + ': thiếu productId'); return; }
      if (!productIds.has(itemPid)) warn(label + ' dòng ' + (j + 1) + ': productId không có trong danh sách sản phẩm: ' + itemPid);
      if (!isPositiveNumber(item.grams, GRAMS_MAX)) { fail(label + ' dòng ' + (j + 1) + ': số gram phải > 0 và <= ' + GRAMS_MAX); return; }
      if (itemIds.has(itemPid)) { fail(label + ' "' + name + '": vị thuốc ' + itemPid + ' bị lặp'); return; }
      itemIds.add(itemPid);
      items.push({ productId: itemPid, grams: decNum(item.grams) });
    });
    if (!items.length) { fail(label + ' "' + name + '": không có dòng hợp lệ'); return; }
    state.prescriptions.push({
      id, name, items, total: money(r.total),
      thang: Math.max(1, Math.round(decNum(r.thang)) || 1), updatedAt: decNum(r.updatedAt)
    });
  });

  if (!errors.length) warnStockDrift(state, warn, stockDrift);
  return { state, errors, warnings, stockDrift };
}

/* Cảnh báo, không chặn. Sau decQty, lệch quá 1e-9 kg (1 microgram) mới tính.
   Cùng ngưỡng 1e-9 trong README. Không bỏ qua lệch dưới 1 gram.
   0.1 + 0.2 không bị coi là lệch.
   stockDrift là dữ liệu cho client. Câu warnings chỉ để đọc log. */
function warnStockDrift(state, warn, stockDrift) {
  const inn = new Map();
  const out = new Map();
  for (const t of state.transactions) {
    const bucket = t.type === 'NHAP' ? inn : out;
    bucket.set(t.productId, (bucket.get(t.productId) || 0) + t.qty);
  }
  for (const p of state.products) {
    const calc = decQty((inn.get(p.id) || 0) - (out.get(p.id) || 0));
    const diff = decQty(p.stock - calc);
    if (Math.abs(diff) > 1e-9) {
      stockDrift.push({ id: p.id, name: p.name, stock: p.stock, calc });
      warn('"' + p.name + '": tồn ' + p.stock + ' khác nhập − bán ' + calc + ' (lệch ' + diff + ')');
    }
  }
}

function randomId() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function insertTxRows(rows, prevCreated, now) {
  const it = db.prepare('INSERT INTO transactions (id, date, type, product_id, qty_kg, price_vnd, total_vnd, cost_vnd, order_id, order_name, retail, rx, grams, thang, unit_price_vnd, ts, opening, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const t of rows) {
    it.run(t.id, t.date, t.type, t.productId, t.qty, t.price, t.total, t.cost, t.orderId, t.orderName,
      t.retail ? 1 : 0, t.rx ? 1 : 0, t.grams, t.thang, t.unitPrice, t.ts, t.opening ? 1 : 0, (prevCreated && prevCreated.get(t.id)) || now);
  }
}

/* 2.40.0 luật Bảo vệ: sau khi chốt, mọi PUT (kể cả X-Force, khôi phục từ file) không được có giao dịch trước mốc
   và phải giữ nguyên từng dòng tồn đầu kỳ (id, vị, ngày, số lượng, giá). Chưa chốt thì không nhận dòng tồn đầu kỳ. Trả câu lỗi hoặc null. */
function closedGuard(state) {
  const cutoff = getMeta('close_cutoff');
  const opens = state.transactions.filter(t => t.opening);
  if (!cutoff) return opens.length ? 'Có dòng tồn đầu kỳ nhưng sổ chưa chốt' : null;
  if (state.transactions.some(t => t.date < cutoff)) return 'Sổ đã chốt đến ' + cutoff + ': có giao dịch trước mốc, hãy Tải lại';
  const dbOpen = new Map(db.prepare('SELECT id, product_id AS productId, date, qty_kg AS qty, price_vnd AS price, total_vnd AS total FROM transactions WHERE opening = 1').all().map(r => [String(r.id), r]));
  if (opens.length !== dbOpen.size) return 'Sổ đã chốt đến ' + cutoff + ': thiếu hoặc thừa dòng tồn đầu kỳ, hãy Tải lại';
  for (const t of opens) {
    const r = dbOpen.get(t.id);
    if (!r || String(r.productId) !== t.productId || r.date !== t.date || Math.abs(decNum(r.qty) - t.qty) > 1e-9 || money(r.price) !== t.price || money(r.total) !== t.total) {
      return 'Sổ đã chốt đến ' + cutoff + ': dòng tồn đầu kỳ bị sửa, hãy Tải lại';
    }
  }
  return null;
}

/* Gọi trong transaction của writeState. */
/* Mục "chưa đọc" của Lịch sử: một đơn (order_id, nếu không có thì id giao dịch) cùng loại BAN/NHAP = 1 mục. */
const UNREAD_KEY_SQL = "COALESCE(NULLIF(order_id, ''), id)";
const UNREAD_KEY_MAX = 64, UNREAD_BATCH_MAX = 500;
function writeStateRows(state, now, force) {
  // Khóa (loại, đơn) đã có TRƯỚC khi xóa: sửa đơn cũ (thêm/xóa dòng, id dòng mới) không thành "mới".
  const prevKeys = new Set(db.prepare('SELECT DISTINCT type, ' + UNREAD_KEY_SQL + ' AS k FROM transactions').all().map(r => r.type + '|' + r.k));
  // Giữ created_at gốc của bản ghi đã tồn tại (writeState xóa sạch rồi ghi lại).
  const prevProductCreated = new Map(
    db.prepare('SELECT id, created_at FROM products').all().map(r => [r.id, r.created_at])
  );
  const prevTxCreated = new Map(
    db.prepare('SELECT id, created_at FROM transactions').all().map(r => [r.id, r.created_at])
  );

  db.prepare('DELETE FROM prescription_items').run();
  db.prepare('DELETE FROM prescriptions').run();
  db.prepare('DELETE FROM transactions').run();
  db.prepare('DELETE FROM products').run();
  db.prepare(`INSERT INTO app_meta (key, value) VALUES ('source_updated_at', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(String(now));

  const ip = db.prepare('INSERT INTO products (id, name, stock_kg, cost_price_vnd, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
  for (const p of state.products) ip.run(p.id, p.name, p.stock, p.costPrice, prevProductCreated.get(p.id) || now, now);

  insertTxRows(state.transactions, prevTxCreated, now);

  if (!force) {
    const fresh = new Map();
    for (const t of state.transactions) {
      if (t.opening) continue; /* dòng tồn đầu kỳ không phải "mới" */
      const k = t.orderId || t.id, kk = t.type + '|' + k;
      if (!prevKeys.has(kk) && k.length <= UNREAD_KEY_MAX) fresh.set(kk, [t.type, k]);
    }
    if (fresh.size <= UNREAD_BATCH_MAX) {
      const iu = db.prepare('INSERT OR IGNORE INTO unread (kind, key, created_at) VALUES (?, ?, ?)');
      for (const [kind, k] of fresh.values()) iu.run(kind, k, now);
    }
  }
  for (const kind of ['BAN', 'NHAP']) {
    db.prepare('DELETE FROM unread WHERE kind = ? AND key NOT IN (SELECT ' + UNREAD_KEY_SQL + " FROM transactions WHERE type = ?)").run(kind, kind);
  }

  const ir = db.prepare('INSERT INTO prescriptions (id, name, total_vnd, thang, updated_at) VALUES (?, ?, ?, ?, ?)');
  const ii = db.prepare('INSERT INTO prescription_items (prescription_id, product_id, grams) VALUES (?, ?, ?)');
  for (const r of state.prescriptions) {
    ir.run(r.id, r.name, r.total, r.thang, r.updatedAt || now);
    for (const item of r.items) ii.run(r.id, item.productId, item.grams);
  }
}

/* opId (tùy chọn, X-Op-Id): lưu cùng lần ghi gần nhất để PUT gửi lại (mất phản hồi) không bị 409.
   Ghi không có opId thì xóa dấu cũ. */
const OP_ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
function getLastOp() {
  const g = k => db.prepare('SELECT value FROM app_meta WHERE key = ?').get(k);
  const id = g('last_op_id'), at = g('last_op_updated_at');
  return id && at ? { id: id.value, updatedAt: Number(at.value) } : null;
}
/* 2.40.6: nhật ký mỗi lần đổi source_updated_at (op_id null = ghi không có opId, vd chốt sổ). 409 trả các op ghi SAU base
   để client nhận ra lần ghi của chính nó đã tới hub nhưng mất phản hồi (không phải máy khác ghi). Giữ 200 dòng gần nhất. */
const WRITE_LOG_KEEP = 200;
function logWrite(now, opId) {
  db.prepare('INSERT OR REPLACE INTO write_log (updated_at, op_id) VALUES (?, ?)').run(now, opId || null);
  db.prepare('DELETE FROM write_log WHERE updated_at < (SELECT MIN(updated_at) FROM (SELECT updated_at FROM write_log ORDER BY updated_at DESC LIMIT ?))').run(WRITE_LOG_KEEP);
}
/* Nhật ký phải liền mạch: lùi về bản cũ (không ghi nhật ký) rồi lên lại thì có lần ghi lọt → xóa nhật ký lúc khởi động nếu dòng cuối ≠ updatedAt hiện tại. */
{
  const last = db.prepare('SELECT MAX(updated_at) AS m FROM write_log').get().m;
  if (last != null && last !== getSourceUpdatedAt()) db.prepare('DELETE FROM write_log').run();
}
/* complete = nhật ký phủ tới base (có dòng ≤ base) VÀ dòng cuối = updatedAt hiện tại, nên ops là ĐỦ mọi lần ghi sau base. */
function opsSince(base) {
  const ops = db.prepare('SELECT op_id FROM write_log WHERE updated_at > ? ORDER BY updated_at').all(base).map(r => r.op_id);
  const complete = !!db.prepare('SELECT 1 FROM write_log WHERE updated_at <= ? LIMIT 1').get(base) &&
    db.prepare('SELECT MAX(updated_at) AS m FROM write_log').get().m === getSourceUpdatedAt();
  return { ops, complete };
}
function writeState(state, opId, force) {
  let now = 0;
  db.transaction(() => {
    /* Z.2 (P2-5): updatedAt luôn TĂNG CHẶT dù hai lần ghi cùng mili-giây hoặc đồng hồ máy lùi: nếu không, X-Base-Updated của máy A bằng updatedAt mới của máy B và `current > baseNum` bỏ lọt xung đột. */
    now = Math.max(Date.now(), getSourceUpdatedAt() + 1);
    writeStateRows(state, now, !!force);
    logWrite(now, opId);
    const up = db.prepare('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    if (opId) { up.run('last_op_id', opId); up.run('last_op_updated_at', String(now)); }
    else db.prepare("DELETE FROM app_meta WHERE key IN ('last_op_id', 'last_op_updated_at')").run();
  })();
  return now;
}

/* ============================ TỰ ĐỘNG SAO LƯU ============================ */
/*
 * Mỗi ngày tạo 1 bản backup file .db bằng SQLite VACUUM INTO (an toàn khi đang
 * ghi, không cần dừng app). Giữ 30 bản gần nhất, tự xóa bản cũ hơn.
 * Tên file: backup-YYYY-MM-DD.db
 */

function todayStamp() {
  const d = new Date();
  const p = n => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/* 2.40.4: file backup dùng được = có dữ liệu và integrity_check = ok. */
function backupGood(file) {
  try {
    if (fs.statSync(file).size === 0) return false;
    const c = new Database(file, { readonly: true, fileMustExist: true });
    try { return c.pragma('integrity_check', { simple: true }) === 'ok'; } finally { c.close(); }
  } catch (e) { return false; }
}
/* 2.40.4: VACUUM INTO ra <file>.tmp rồi đổi tên: lỗi/tắt máy giữa chừng không để lại file dở mang tên thật.
   .tmp sót từ lần trước thì xóa. keepGood: file đích có sẵn và còn tốt thì giữ (trả false); rỗng/hỏng thì xóa, tạo lại.
   VACUUM INTO tạo bản sao nhất quán, không bị ảnh hưởng bởi ghi đồng thời. Lỗi thì xóa .tmp rồi ném tiếp. */
function vacuumTo(file, keepGood) {
  const tmp = file + '.tmp';
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  if (fs.existsSync(file)) {
    if (keepGood && backupGood(file)) return false;
    console.warn('[backup] ' + (keepGood ? 'File rỗng/hỏng, tạo lại: ' : 'Tạo lại: ') + path.basename(file));
    fs.unlinkSync(file);
  }
  try {
    db.prepare('VACUUM INTO ?').run(tmp);
    fs.renameSync(tmp, file);
  } catch (err) {
    try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch (e) { /* bỏ qua */ }
    throw err;
  }
  return true;
}
let dailyChecked = ''; /* bản ngày đã kiểm tốt trong lần chạy này: không mở lại integrity_check mỗi lần ghi */
function runDailyBackup() {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, 'backup-' + todayStamp() + '.db');
    if (dailyChecked !== file || !fs.existsSync(file) || fs.statSync(file).size === 0) {
      if (vacuumTo(file, true)) console.log('[backup] Đã sao lưu: ' + file);
      dailyChecked = file;
    }
  } catch (err) {
    console.error('[backup] Lỗi sao lưu:', err && err.message ? err.message : err);
  }
  pruneBackups();
}

/* Ghi đè chủ động (X-Force: khôi phục / "giữ bản máy này") xóa sạch rồi ghi lại toàn bộ,
 * nên chụp bản trước-ghi-đè riêng (giữ 10 bản gần nhất, tách khỏi 30 bản theo ngày). */
const FORCE_BACKUP_KEEP = 10;
const FORCE_BACKUP_RE = /^backup-\d{4}-\d{2}-\d{2}-truoc-ghi-de-\d{9}\.db$/;
function snapshotBeforeForce() {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const d = new Date();
    const p = n => (n < 10 ? '0' + n : '' + n);
    const ms = d.getMilliseconds();
    const hms = p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + (ms < 10 ? '00' : ms < 100 ? '0' : '') + ms;
    const file = path.join(BACKUP_DIR, 'backup-' + todayStamp() + '-truoc-ghi-de-' + hms + '.db');
    if (vacuumTo(file, true)) console.log('[backup] Đã chụp bản trước khi ghi đè: ' + file);
  } catch (err) {
    console.error('[backup] Lỗi chụp bản trước khi ghi đè:', err && err.message ? err.message : err);
    return false;
  }
  try { // dọn bản cũ lỗi KHÔNG tính là thất bại (bản chụp đã xong)
    const olds = fs.readdirSync(BACKUP_DIR).filter(n => FORCE_BACKUP_RE.test(n)).sort();
    while (olds.length > FORCE_BACKUP_KEEP) fs.unlinkSync(path.join(BACKUP_DIR, olds.shift()));
  } catch (err) {
    console.error('[backup] Lỗi dọn bản trước-ghi-đè cũ:', err && err.message ? err.message : err);
  }
  return true;
}

function pruneBackups() {
  try {
    /* 2.40.4: .tmp sót (tắt máy giữa VACUUM INTO), kể cả bản trước-ghi-đè có tên theo mili-giây nên không bao giờ trùng lại. */
    for (const n of fs.readdirSync(BACKUP_DIR).filter(n => /^backup-.*\.db\.tmp$/.test(n))) fs.unlinkSync(path.join(BACKUP_DIR, n));
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(n => /^backup-\d{4}-\d{2}-\d{2}\.db$/.test(n))
      .sort();
    while (files.length > BACKUP_KEEP_DAYS) {
      const old = files.shift();
      fs.unlinkSync(path.join(BACKUP_DIR, old));
      console.log('[backup] Đã xóa bản cũ: ' + old);
    }
  } catch (err) {
    console.error('[backup] Lỗi dọn bản cũ:', err && err.message ? err.message : err);
  }
}

/* ============================ BOOT JSON ============================ */

function bootJson(data) {
  try {
    const s = JSON.stringify(data);
    if (s.length > MAX_INLINE) return { json: 'null', needFetch: true };
    return { json: s.replace(/</g, '\\u003c'), needFetch: false };
  } catch (e) {
    return { json: 'null', needFetch: true };
  }
}

/* ============================ HTTP ============================ */

const app = express();
app.disable('x-powered-by');

// Kiểm tra sống cho Docker healthcheck: không cần duyệt, không trả dữ liệu.
app.get('/healthz', (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    db.prepare('SELECT 1').get();
    res.type('text/plain').send('ok');
  } catch (e) {
    res.status(503).type('text/plain').send('db error');
  }
});

// Mặc định từ chối: mọi route bên dưới chỉ mở cho thiết bị đã được duyệt.
// Đặt TRƯỚC bộ đọc body để thiết bị lạ không đẩy được payload 32 MB lên.
app.use(auth.gate);
auth.mount(app, express.text({ type: '*/*', limit: '2kb' }));
app.use(express.text({ type: '*/*', limit: MAX_BODY, inflate: true }));

mountPwa(app);
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /\n');
});

app.get('/api/state', (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    res.json({ success: true, data: readState() });
  } catch (err) {
    console.error('/api/state GET', err);
    res.status(500).json({ success: false, error: 'Không đọc được dữ liệu' });
  }
});

/* Chưa đọc của Lịch sử bán/nhập: chỉ đọc/xóa bảng unread, không chạm source_updated_at (không gây 409/428). */
app.get('/api/unread', (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const data = { BAN: [], NHAP: [] };
    for (const r of db.prepare('SELECT kind, key FROM unread ORDER BY created_at, key').all()) data[r.kind].push(r.key);
    res.json({ success: true, data });
  } catch (err) {
    console.error('/api/unread GET', err);
    res.status(500).json({ success: false, error: 'Không đọc được chưa đọc' });
  }
});
app.post('/api/unread/read', (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!auth.sameOrigin(req)) return res.status(403).type('text/plain').send('Forbidden'); // cùng kiểm nguồn như các POST trong auth.js
  let b;
  try { b = JSON.parse(typeof req.body === 'string' ? req.body : ''); } catch (e) { b = null; }
  const isKind = v => v === 'BAN' || v === 'NHAP';
  const ok = b && typeof b === 'object' && !Array.isArray(b) && (
    (isKind(b.all) && b.keys === undefined) ||
    (isKind(b.kind) && b.all === undefined && Array.isArray(b.keys) && b.keys.length <= UNREAD_BATCH_MAX &&
      b.keys.every(k => typeof k === 'string' && k.length >= 1 && k.length <= UNREAD_KEY_MAX)));
  if (!ok) return res.status(400).json({ success: false, error: 'Yêu cầu không hợp lệ' });
  try {
    if (b.all) db.prepare('DELETE FROM unread WHERE kind = ?').run(b.all);
    else {
      const del = db.prepare('DELETE FROM unread WHERE kind = ? AND key = ?');
      db.transaction(() => { for (const k of b.keys) del.run(b.kind, k); })();
    }
    res.json({ success: true });
  } catch (err) {
    console.error('/api/unread POST', err);
    res.status(500).json({ success: false, error: 'Không ghi được' });
  }
});

// 2.15.16: một dòng log khi PUT bị từ chối. Chỉ giờ, mã, lý do cố định; không ghi dữ liệu/tên/số tiền/token.
function warnReject(code, reason) {
  console.warn(new Date().toISOString() + ' PUT /api/state từ chối ' + code + ': ' + reason);
}

app.put('/api/state', (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const text = typeof req.body === 'string' ? req.body : '';
    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      warnReject(400, 'JSON không hợp lệ');
      return res.status(400).json({ success: false, error: 'JSON không hợp lệ' });
    }
    const checked = validateState(body);
    if (checked.errors.length) {
      warnReject(400, 'Dữ liệu không hợp lệ (' + checked.errors.length + ' lỗi)');
      return res.status(400).json({ success: false, error: 'Dữ liệu không hợp lệ', details: checked.errors });
    }
    const closedErr = closedGuard(checked.state);
    if (closedErr) {
      warnReject(409, 'sổ đã chốt');
      return res.status(409).json({ success: false, closed: true, cutoff: getMeta('close_cutoff'), error: closedErr });
    }
    const opHdr = req.get('X-Op-Id');
    const opId = opHdr && OP_ID_RE.test(opHdr) ? opHdr : null;
    const lastOp = opId ? getLastOp() : null;
    if (lastOp && lastOp.id === opId) {
      // PUT gửi lại sau khi mất phản hồi: đã ghi rồi, trả kết quả cũ, không ghi lại.
      return res.json({ success: true, updatedAt: lastOp.updatedAt });
    }
    const force = req.get('X-Force') === '1';
    const baseHdr = req.get('X-Base-Updated');
    if (!force && baseHdr == null) {
      warnReject(428, 'thiếu X-Base-Updated');
      return res.status(428).json({ success: false, error: 'Thiếu X-Base-Updated (hoặc gửi X-Force: 1 để chủ động ghi đè)' });
    }
    if (!force) {
      const baseNum = Number(baseHdr);
      // Header không phải số hợp lệ → coi như xung đột (an toàn) thay vì bỏ qua kiểm tra.
      if (!Number.isFinite(baseNum)) {
        warnReject(400, 'X-Base-Updated không hợp lệ');
        return res.status(400).json({ success: false, error: 'X-Base-Updated không hợp lệ' });
      }
      const current = getSourceUpdatedAt();
      if (current > baseNum) {
        const since = opsSince(baseNum);
        /* 2.40.6: chẩn đoán 409 — tên thiết bị, base gửi lên, updatedAt hiện tại, số lần ghi sau base ("+?" = nhật ký không phủ tới base), opId gửi kèm. Không ghi dữ liệu. */
        const dev = req.device && req.device.name ? String(req.device.name).replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, 40) : '?';
        warnReject(409, 'xung đột: máy chủ có bản mới hơn (thiết bị "' + dev + '", base ' + baseNum + ', hiện tại ' + current + ', ' + since.ops.length + (since.complete ? '' : '+?') + ' lần ghi sau base, op ' + (opId || '-') + ')');
        return res.status(409).json({ success: false, conflict: true, updatedAt: current, ops: since.ops, opsComplete: since.complete });
      }
    }
    // Chụp TRƯỚC khi ghi: bản của ngày = trạng thái trước lần ghi đầu tiên trong ngày.
    runDailyBackup(); // fail-open có chủ ý: chặn ghi vì backup hằng ngày lỗi = ngừng app
    if (force && !snapshotBeforeForce()) {
      console.warn(new Date().toISOString() + ' PUT /api/state X-Force bị chặn: không chụp được bản trước ghi đè');
      return res.status(500).json({ success: false, error: 'Không chụp được bản sao lưu trước khi ghi đè; chưa ghi gì' });
    }
    const updatedAt = writeState(checked.state, opId, force);
    const wire = Number(req.get('Content-Length'));
    console.log(new Date().toISOString() + ' PUT /api/state ' + Buffer.byteLength(text) + ' byte' + (req.get('Content-Encoding') && Number.isFinite(wire) ? ' (nén ' + req.get('Content-Encoding') + ' ' + wire + ' byte)' : '') + (force ? ' (X-Force)' : ''));
    const reply = { success: true, updatedAt };
    if (checked.warnings.length) reply.warnings = checked.warnings;
    if (checked.stockDrift.length) reply.stockDrift = checked.stockDrift;
    res.json(reply);
  } catch (err) {
    console.error('/api/state PUT', err);
    res.status(500).json({ success: false, error: 'Không ghi được dữ liệu' });
  }
});

// Trang chính: SSR data vào PAGE.
app.get('/', (req, res) => {
  let data;
  try {
    data = readState();
  } catch (e) {
    console.error('readState', e);
    return res.status(503).type('text/plain').send('Không đọc được dữ liệu. Vui lòng thử lại sau.');
  }
  const boot = bootJson(data);
  /* Một lượt trên template gốc. Dùng callback để `$&`, `$'`, `$`` trong dữ liệu
     không bị hiểu là mẫu thay thế. */
  const html = PAGE.replace(/%%BOOT%%|%%NEEDFETCH%%/g, m => {
    if (m === '%%BOOT%%') return boot.json;
    return boot.needFetch ? 'true' : 'false';
  });

  res.set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; manifest-src 'self'; worker-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Robots-Tag': 'noindex, nofollow'
  });
  res.send(html);
});

app.get('/api/backups', (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(n => /^backup-\d{4}-\d{2}-\d{2}(-truoc-ghi-de-\d{9}|-truoc-chot-\d{4}-\d{2}-\d{2})?\.db$/.test(n))
      .sort()
      .reverse()
      .map(n => {
        const st = fs.statSync(path.join(BACKUP_DIR, n));
        return { name: n, size: st.size, modified: st.mtime.toISOString() };
      });
    res.json({ success: true, keepDays: BACKUP_KEEP_DAYS, count: files.length, backups: files });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Không đọc được danh sách backup' });
  }
});

/* ============================ CHỐT SỔ (2.40.0) ============================ */
const ARCHIVE_RE = /^luu-tru-truoc-\d{4}-\d{2}-\d{2}\.json$/;
function isOwner(req) { return !!(req.device && req.device.role === 'owner'); }
function todayLocal() {
  /* QLK_CLOSE_TODAY: chỉ để test/thử chốt trên bản sao dữ liệu (giả "hôm nay"). */
  if (/^\d{4}-\d{2}-\d{2}$/.test(process.env.QLK_CLOSE_TODAY || '')) return process.env.QLK_CLOSE_TODAY;
  const d = new Date(), p = n => (n < 10 ? '0' : '') + n;
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
/* Chỉ để test gài lỗi từng bước (biến môi trường, không có trong vận hành). */
function closeFailAt(step) { if (process.env.QLK_CLOSE_FAIL === String(step)) throw new Error('gài lỗi bước ' + step); }

app.post('/api/close-year', (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!auth.sameOrigin(req)) return res.status(403).json({ success: false, error: 'Forbidden' });
  if (!isOwner(req)) return res.status(403).json({ success: false, error: 'Chỉ thiết bị chủ được chốt sổ' });
  let b;
  try { b = JSON.parse(typeof req.body === 'string' ? req.body : ''); } catch (e) { b = null; }
  if (!b || typeof b !== 'object' || typeof b.cutoff !== 'string') return res.status(400).json({ success: false, error: 'Yêu cầu không hợp lệ' });
  try {
    const checked = validateState(readState());
    if (checked.errors.length) return res.status(500).json({ success: false, error: 'Dữ liệu hiện tại không hợp lệ, không chốt' });
    const closed = getClosed();
    const plan = closePlan(checked.state, b.cutoff, todayLocal(), closed ? closed.cutoff : null, checked.stockDrift);
    const preview = {
      cutoff: plan.cutoff, blocks: plan.blocks, totals: plan.totals, months: plan.months,
      opening: plan.opening.map(o => ({ productId: o.productId, name: o.name, qty: o.qty, price: o.price }))
    };
    if (b.dryRun === true) return res.json({ success: true, dryRun: true, ...preview, updatedAt: getSourceUpdatedAt() });
    const base = Number(req.get('X-Base-Updated'));
    if (!Number.isFinite(base) || getSourceUpdatedAt() !== base) return res.status(409).json({ success: false, conflict: true, error: 'Dữ liệu đã đổi, hãy xem trước lại' });
    if (plan.blocks.length) return res.status(422).json({ success: false, error: plan.blocks.join('; '), ...preview });
    const tag = 'truoc-chot-' + plan.cutoff;
    const bak = path.join(BACKUP_DIR, 'backup-' + todayStamp() + '-' + tag + '.db');
    const arc = path.join(DATA_DIR, 'luu-tru-truoc-' + plan.cutoff + '.json');
    const tmp = arc + '.tmp';
    let now = 0, committed = false;
    try {
      closeFailAt(2);
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      vacuumTo(bak, false); /* luôn chụp mới ngay trước khi chốt */
      closeFailAt(3);
      fs.writeFileSync(tmp, JSON.stringify({ moneyUnit: 'dong', cutoff: plan.cutoff, createdAt: new Date().toISOString(),
        transactions: plan.removed, products: checked.state.products, closedBefore: closed, months: plan.months }));
      db.transaction(() => {
        db.prepare('DELETE FROM transactions WHERE date < ?').run(plan.cutoff);
        now = Math.max(Date.now(), getSourceUpdatedAt() + 1);
        insertTxRows(plan.opening, null, now);
        setMeta('close_cutoff', plan.cutoff);
        setMeta('close_summary', JSON.stringify(mergeMonths(closed ? closed.months : [], plan.months)));
        setMeta('source_updated_at', now);
        logWrite(now, null);
        db.prepare("DELETE FROM app_meta WHERE key IN ('last_op_id', 'last_op_updated_at')").run();
        db.prepare("DELETE FROM unread WHERE kind = 'NHAP' AND key NOT IN (SELECT " + UNREAD_KEY_SQL + " FROM transactions WHERE type = 'NHAP')").run();
        db.prepare("DELETE FROM unread WHERE kind = 'BAN' AND key NOT IN (SELECT " + UNREAD_KEY_SQL + " FROM transactions WHERE type = 'BAN')").run();
        /* Bất biến: tồn vẫn = nhập − bán sau khi thay. Sai → ném lỗi, transaction tự rollback. */
        const after = validateState(readState());
        if (after.errors.length || after.stockDrift.length > checked.stockDrift.length) throw new Error('bất biến tồn sai sau khi chốt');
        closeFailAt(4);
      })();
      committed = true;
      closeFailAt(5);
      fs.renameSync(tmp, arc);
    } catch (err) {
      if (committed) {
        /* DB đã chốt: giữ .tmp (vẫn là bản lưu trữ đầy đủ), báo thành công kèm cảnh báo, không nói "không đổi". */
        console.error('[chốt sổ] Đã chốt nhưng không đổi tên được file lưu trữ, còn ' + path.basename(tmp) + ':', err && err.message ? err.message : err);
        return res.json({ success: true, updatedAt: now, archive: null, warning: 'Đã chốt nhưng file lưu trữ còn tên ' + path.basename(tmp) + ' trên hub', ...preview });
      }
      try { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); } catch (e) { /* bỏ qua */ }
      console.error('[chốt sổ] Lỗi, không đổi gì:', err && err.message ? err.message : err);
      return res.status(500).json({ success: false, error: 'Chốt sổ lỗi, dữ liệu không đổi' });
    }
    console.log(new Date().toISOString() + ' [chốt sổ] Đã chốt đến ' + plan.cutoff + ': gỡ ' + plan.totals.count + ' giao dịch, ' + plan.opening.length + ' dòng tồn đầu kỳ; backup ' + path.basename(bak) + ', lưu trữ ' + path.basename(arc));
    res.json({ success: true, updatedAt: now, archive: path.basename(arc), ...preview });
  } catch (err) {
    console.error('/api/close-year', err);
    res.status(500).json({ success: false, error: 'Chốt sổ lỗi, dữ liệu không đổi' });
  }
});

app.get('/api/close-archive', (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!isOwner(req)) return res.status(403).json({ success: false, error: 'Chỉ thiết bị chủ' });
  try {
    const files = fs.readdirSync(DATA_DIR).filter(n => ARCHIVE_RE.test(n)).sort().reverse()
      .map(n => ({ name: n, size: fs.statSync(path.join(DATA_DIR, n)).size }));
    res.json({ success: true, archives: files });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Không đọc được danh sách lưu trữ' });
  }
});
app.get('/api/close-archive/:name', (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!isOwner(req)) return res.status(403).json({ success: false, error: 'Chỉ thiết bị chủ' });
  const n = String(req.params.name || '');
  if (!ARCHIVE_RE.test(n) || !fs.existsSync(path.join(DATA_DIR, n))) return res.status(404).json({ success: false, error: 'Not found' });
  res.set('Content-Disposition', 'attachment; filename="' + n + '"');
  res.type('application/json').send(fs.readFileSync(path.join(DATA_DIR, n)));
});

// Đường không có thật: 404 JSON kèm header bảo mật (thay HTML mặc định của Express).
app.use((req, res) => {
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'" });
  res.status(404).json({ success: false, error: 'Not found' });
});

// Middleware xử lý lỗi tập trung: trả JSON thay vì HTML lỗi mặc định của Express.
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ success: false, error: 'Payload too large' });
  }
  if (err.type === 'encoding.unsupported') return res.status(415).json({ success: false, error: 'Content-Encoding không được hỗ trợ' });
  if (err.status === 400 || err.statusCode === 400) return res.status(400).json({ success: false, error: /^Z_/.test(String(err.code || '')) ? 'Thân yêu cầu gzip hỏng, không giải nén được' : 'Thân yêu cầu không hợp lệ' });
  console.error('[server error]', err && err.stack ? err.stack : err);
  const st = Number(err.status || err.statusCode) || 500;
  /* 2.40.4: 5xx không lộ err.message ra client (chi tiết đã ghi log ở trên); 4xx giữ message. */
  res.status(st).json({ success: false, error: st >= 500 ? 'Lỗi máy chủ' : (err.message || 'Yêu cầu không hợp lệ') });
});

/* AD: bỏ hàm đổi đơn vị nghìn → đồng. Chốt chặn thay thế: DB có dữ liệu mà app_meta.money_unit khác 'dong' (bản sao lưu cũ tính theo nghìn) thì KHÔNG khởi động, để tiền không bị hiểu nhỏ đi 1000 lần. DB trống thì ghi nhãn 'dong'. */
function assertMoneyUnit() {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'money_unit'").get();
  if (row && row.value === 'dong') return;
  const n = ['products', 'transactions', 'prescriptions'].reduce((a, t) => a + db.prepare('SELECT COUNT(*) AS c FROM ' + t).get().c, 0);
  if (n > 0) {
    console.error('[money] Dữ liệu kiểu cũ (tiền theo nghìn), không dùng được với bản này. Không khởi động.');
    process.exit(1);
  }
  db.prepare("INSERT INTO app_meta(key, value) VALUES('money_unit', 'dong') ON CONFLICT(key) DO UPDATE SET value = excluded.value").run();
}

assertMoneyUnit();

/* Z.2 (P2-4): mặc định chỉ nghe 127.0.0.1 (Caddy trên cùng máy làm TLS); trong container Docker đặt HOST=0.0.0.0. */
const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
  console.log('Quản Lý Kho (local) đang chạy:');
  console.log('  PC    : https://localhost (dự phòng http://localhost:' + PORT + ')');
  console.log('  Khác  : https://<IP-máy-tính> (ứng dụng nghe ' + HOST + ':' + PORT + '; mã thiết lập nằm trong log máy chủ, vd logs/server.out.log)');
  console.log('  DB    : ' + DB_FILE);
  console.log('  Backup: ' + BACKUP_DIR + ' (giữ ' + BACKUP_KEEP_DAYS + ' bản)');
  auth.announce(PORT);

  // Sao lưu ngay khi khởi động (nếu hôm nay chưa có), rồi kiểm tra mỗi giờ
  // để kịp chụp khi app chạy qua nửa đêm.
  runDailyBackup();
  setInterval(() => runDailyBackup(), 60 * 60 * 1000);
});

// Đóng sạch khi container dừng (docker stop gửi SIGTERM): ngừng nhận request
// mới, đóng DB để checkpoint WAL, rồi thoát.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log('[shutdown] Nhận ' + signal + ', đang đóng...');
  server.close(() => {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
      db.close();
    } catch (e) { /* đã đóng */ }
    auth.close();
    console.log('[shutdown] Đã đóng sạch.');
    process.exit(0);
  });
  // Nếu còn request treo, thoát cưỡng bức sau 10s.
  setTimeout(() => {
    try {
      db.pragma('wal_checkpoint(TRUNCATE)');
      db.close();
    } catch (e) { /* đã đóng hoặc đang đóng */ }
    auth.close();
    process.exit(0);
  }, 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
