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
 *   GET  /            -> HTML (src/page.js, CSP inline, không nonce)
 *
 * Chỉ thiết bị đã được duyệt mới vào được (auth.js, cookie qlk_dev; danh sách thiết bị
 * nằm ở data/auth.db). Thiết bị chủ đầu tiên thiết lập bằng mã in trong log, qua /auth/setup.
 *   GET  /healthz     -> 'ok' (không cần duyệt, không trả dữ liệu; dùng cho healthcheck)
 * SQLite đồng bộ (better-sqlite3), mỗi lần ghi là một transaction.
 */

'use strict';

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import Database from 'better-sqlite3';

import { PAGE } from './src/page.js';
import { createAuth } from './auth.js';
import { mountPwa } from './pwa.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT) || 8787;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'app.db');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(DATA_DIR, 'backups');
const BACKUP_KEEP_DAYS = Number(process.env.BACKUP_KEEP_DAYS) || 30;
const MAX_BODY = 4 * 1024 * 1024;
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
  `);
}
migrate();

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
  const transactions = db.prepare('SELECT id, date, type, product_id AS productId, qty_kg AS qty, price_vnd AS price, total_vnd AS total, cost_vnd AS cost, order_id AS oid, order_name AS oname, retail, rx, grams AS g, thang, unit_price_vnd AS unitPrice, ts FROM transactions ORDER BY COALESCE(ts, 0) ASC, rowid ASC').all();
  const prescriptions = db.prepare('SELECT id, name, total_vnd AS total, thang, updated_at AS updatedAt FROM prescriptions ORDER BY updated_at DESC, rowid ASC').all();
  const prescriptionItems = db.prepare('SELECT prescription_id AS prescriptionId, product_id AS productId, grams FROM prescription_items ORDER BY prescription_id, rowid ASC').all();

  const itemsByPrescription = new Map();
  for (const item of prescriptionItems) {
    const list = itemsByPrescription.get(item.prescriptionId) || [];
    list.push({ productId: String(item.productId), grams: decNum(item.grams) });
    itemsByPrescription.set(item.prescriptionId, list);
  }

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
      return tx;
    }),
    prescriptions: prescriptions.map(r => ({
      id: String(r.id), name: String(r.name), items: itemsByPrescription.get(r.id) || [],
      total: money(r.total), thang: Math.max(1, Math.round(decNum(r.thang)) || 1), updatedAt: decNum(r.updatedAt)
    })),
    updatedAt: getSourceUpdatedAt()
  };
}

function isNonNegNumber(value, max) {
  if (value == null || value === '') return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= max;
}
function isPositiveNumber(value, max) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= max;
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

function validateState(d) {
  const errors = [];
  const warnings = [];
  const stockDrift = [];
  const state = { products: [], transactions: [], prescriptions: [], updatedAt: 0 };
  if (!d || typeof d !== 'object' || Array.isArray(d)) {
    return { state, errors: ['Dữ liệu không phải object'], warnings, stockDrift };
  }
  const fail = msg => { if (errors.length < 20) errors.push(msg); };
  const warn = msg => { if (warnings.length < 50) warnings.push(msg); };
  for (const key of ['products', 'transactions', 'prescriptions']) {
    if (!Array.isArray(d[key])) fail('Thiếu mảng ' + key);
  }
  if (errors.length) return { state, errors, warnings, stockDrift };
  state.updatedAt = decNum(d.updatedAt);

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
    const nameKey = name.toLowerCase();
    if (productIds.has(id)) { fail(label + ' "' + name + '": trùng id ' + id); return; }
    if (productNames.has(nameKey)) { fail(label + ': trùng tên sản phẩm "' + name + '"'); return; }
    productIds.add(id);
    productNames.add(nameKey);
    state.products.push({ id, name, stock: decNum(p.stock), costPrice: money(p.costPrice) });
  });

  const txIds = new Set();
  d.transactions.forEach((t, i) => {
    const label = 'Giao dịch #' + (i + 1);
    if (!t || typeof t !== 'object') { fail(label + ': không hợp lệ'); return; }
    if (t.type !== 'NHAP' && t.type !== 'BAN') { fail(label + ': loại phải là NHAP hoặc BAN'); return; }
    if (!isRealDate(t.date)) { fail(label + ': ngày phải là ngày thật YYYY-MM-DD trong 2000-2100'); return; }
    const productId = String(t.productId || '').trim();
    if (!productId) { fail(label + ': thiếu productId'); return; }
    if (!productIds.has(productId)) warn(label + ': productId không có trong danh sách sản phẩm: ' + productId);
    if (!isPositiveNumber(t.qty, QTY_MAX)) fail(label + ': số lượng phải > 0 và <= ' + QTY_MAX);
    if (!isNonNegNumber(t.price, MONEY_MAX)) fail(label + ': đơn giá phải từ 0 đến ' + MONEY_MAX);
    if (!isNonNegNumber(t.total, MONEY_MAX)) fail(label + ': thành tiền phải từ 0 đến ' + MONEY_MAX);
    if (t.cost != null && !isNonNegNumber(t.cost, MONEY_MAX)) fail(label + ': giá vốn phải từ 0 đến ' + MONEY_MAX);
    if (t.ts != null && !Number.isFinite(Number(t.ts))) fail(label + ': ts không hợp lệ');
    if (t.g != null && !isNonNegNumber(t.g, GRAMS_MAX)) fail(label + ': grams phải từ 0 đến ' + GRAMS_MAX);
    if (t.thang != null && (!Number.isFinite(Number(t.thang)) || Number(t.thang) < 1 || Number(t.thang) > THANG_MAX)) fail(label + ': số thang phải từ 1 đến ' + THANG_MAX);
    if (t.unitPrice != null && !isNonNegNumber(t.unitPrice, MONEY_MAX)) fail(label + ': giá 1 thang phải từ 0 đến ' + MONEY_MAX);
    const id = String(t.id || randomId());
    if (txIds.has(id)) { fail(label + ': trùng id giao dịch ' + id); return; }
    txIds.add(id);
    const rawOid = t.oid != null ? String(t.oid) : (t.orderId != null ? String(t.orderId) : null);
    const rawOname = t.oname != null ? String(t.oname).trim() : (t.orderName != null ? String(t.orderName).trim() : null);
    if (rawOname && rawOname.length > NAME_MAX) fail(label + ': tên đơn quá dài (tối đa ' + NAME_MAX + ' ký tự)');
    const orderId = rawOid || null;
    const orderName = (rawOname && rawOname !== rawOid) ? rawOname : null;
    state.transactions.push({
      id, date: String(t.date), type: t.type, productId,
      qty: decNum(t.qty), price: money(t.price), total: money(t.total), cost: moneyNullable(t.cost),
      orderId, orderName,
      retail: !!t.retail, rx: !!t.rx, grams: decNullable(t.g), thang: decNullable(t.thang),
      unitPrice: moneyNullable(t.unitPrice), ts: decNullable(t.ts)
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
    if (r.thang != null && (!Number.isFinite(Number(r.thang)) || Number(r.thang) < 1 || Number(r.thang) > THANG_MAX)) fail(label + ' "' + name + '": số thang phải từ 1 đến ' + THANG_MAX);
    if (!Array.isArray(r.items) || !r.items.length) { fail(label + ' "' + name + '": chưa có vị thuốc'); return; }
    const id = String(r.id || randomId());
    if (rxIds.has(id)) { fail(label + ' "' + name + '": trùng id ' + id); return; }
    if (rxNames.has(name)) { fail(label + ': trùng tên đơn thuốc "' + name + '"'); return; }
    rxIds.add(id);
    rxNames.add(name);
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

const insertProduct = () => db.prepare('INSERT INTO products (id, name, stock_kg, cost_price_vnd, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
const insertTx = () => db.prepare('INSERT INTO transactions (id, date, type, product_id, qty_kg, price_vnd, total_vnd, cost_vnd, order_id, order_name, retail, rx, grams, thang, unit_price_vnd, ts, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
const insertRx = () => db.prepare('INSERT INTO prescriptions (id, name, total_vnd, thang, updated_at) VALUES (?, ?, ?, ?, ?)');
const insertRxItem = () => db.prepare('INSERT INTO prescription_items (prescription_id, product_id, grams) VALUES (?, ?, ?)');

const writeStateTx = db.transaction((state, now) => {
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

  const ip = insertProduct();
  for (const p of state.products) ip.run(p.id, p.name, p.stock, p.costPrice, prevProductCreated.get(p.id) || now, now);

  const it = insertTx();
  for (const t of state.transactions) {
    it.run(t.id, t.date, t.type, t.productId, t.qty, t.price, t.total, t.cost, t.orderId, t.orderName,
      t.retail ? 1 : 0, t.rx ? 1 : 0, t.grams, t.thang, t.unitPrice, t.ts, prevTxCreated.get(t.id) || now);
  }

  const ir = insertRx();
  const ii = insertRxItem();
  for (const r of state.prescriptions) {
    ir.run(r.id, r.name, r.total, r.thang, r.updatedAt || now);
    for (const item of r.items) ii.run(r.id, item.productId, item.grams);
  }
});

function writeState(state) {
  const now = Date.now();
  writeStateTx(state, now);
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

function runDailyBackup() {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, 'backup-' + todayStamp() + '.db');
    if (!fs.existsSync(file)) {
      // VACUUM INTO tạo bản sao nhất quán, không bị ảnh hưởng bởi ghi đồng thời.
      db.prepare('VACUUM INTO ?').run(file);
      console.log('[backup] Đã sao lưu: ' + file);
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
    if (!fs.existsSync(file)) {
      db.prepare('VACUUM INTO ?').run(file);
      console.log('[backup] Đã chụp bản trước khi ghi đè: ' + file);
    }
    const olds = fs.readdirSync(BACKUP_DIR).filter(n => FORCE_BACKUP_RE.test(n)).sort();
    while (olds.length > FORCE_BACKUP_KEEP) fs.unlinkSync(path.join(BACKUP_DIR, olds.shift()));
  } catch (err) {
    console.error('[backup] Lỗi chụp bản trước khi ghi đè:', err && err.message ? err.message : err);
  }
}

function pruneBackups() {
  try {
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
// Đặt TRƯỚC bộ đọc body để thiết bị lạ không đẩy được payload 4 MB lên.
app.use(auth.gate);
auth.mount(app, express.text({ type: '*/*', limit: '2kb' }));
app.use(express.text({ type: '*/*', limit: MAX_BODY }));

mountPwa(app);
app.get('/favicon.ico', (req, res) => res.status(204).end());
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
    const force = req.get('X-Force') === '1';
    const baseHdr = req.get('X-Base-Updated');
    if (!force && baseHdr == null) {
      warnReject(428, 'thiếu X-Base-Updated');
      return res.status(428).json({ success: false, error: 'Thiếu X-Base-Updated (hoặc gửi X-Force: 1 để chủ động ghi đè)' });
    }
    if (baseHdr != null && !force) {
      const baseNum = Number(baseHdr);
      // Header không phải số hợp lệ → coi như xung đột (an toàn) thay vì bỏ qua kiểm tra.
      if (!Number.isFinite(baseNum)) {
        warnReject(400, 'X-Base-Updated không hợp lệ');
        return res.status(400).json({ success: false, error: 'X-Base-Updated không hợp lệ' });
      }
      const current = getSourceUpdatedAt();
      if (current > baseNum) {
        warnReject(409, 'xung đột: máy chủ có bản mới hơn');
        return res.status(409).json({ success: false, conflict: true, updatedAt: current });
      }
    }
    // Chụp TRƯỚC khi ghi: bản của ngày = trạng thái trước lần ghi đầu tiên trong ngày.
    runDailyBackup();
    if (force) snapshotBeforeForce();
    const updatedAt = writeState(checked.state);
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
    'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
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
      .filter(n => /^backup-\d{4}-\d{2}-\d{2}(-truoc-ghi-de-\d{9})?\.db$/.test(n))
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

// Middleware xử lý lỗi tập trung: trả JSON thay vì HTML lỗi mặc định của Express.
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ success: false, error: 'Payload too large' });
  }
  console.error('[server error]', err && err.message ? err.message : err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Lỗi server' });
});

/* Một lần: nghìn đồng đã làm tròn trong DB → đồng nguyên.
   Dòng còn trong file truoc-lam-tron lấy số lẻ gốc rồi nhân 1000.
   Dòng phát sinh sau lần làm tròn chỉ còn số nguyên nghìn, nhân 1000 là đúng đơn vị đã nhập. */
function dongFromK(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 1000) : 0;
}
function loadFractionalTransactions() {
  const file = path.join(DATA_DIR, 'truoc-lam-tron-2026-11-06-1047.json');
  if (!fs.existsSync(file)) return null;
  try {
    let text = fs.readFileSync(file, 'utf8');
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const obj = JSON.parse(text);
    const data = obj && obj.data ? obj.data : obj;
    const map = new Map();
    for (const t of (data && data.transactions) || []) {
      if (t && t.id != null) map.set(String(t.id), t);
    }
    return map;
  } catch (err) {
    /* File một lần có thể hỏng/thiếu; fallback nhân 1000 từ số đã lưu,
       không để app kẹt vòng khởi động. */
    console.error('[money] File số lẻ ' + file + ' lỗi, bỏ qua: ' + (err && err.message ? err.message : err));
    return null;
  }
}
function migrateMoneyToDong() {
  const row = db.prepare("SELECT value FROM app_meta WHERE key = 'money_unit'").get();
  if (row && row.value === 'dong') return;
  const frac = loadFractionalTransactions();
  const txRows = db.prepare('SELECT id, price_vnd, total_vnd, cost_vnd, unit_price_vnd FROM transactions').all();
  const updateTx = db.prepare('UPDATE transactions SET price_vnd = ?, total_vnd = ?, cost_vnd = ?, unit_price_vnd = ? WHERE id = ?');
  let fromFile = 0;
  const run = db.transaction(() => {
    for (const t of txRows) {
      const old = frac && frac.get(String(t.id));
      if (old) {
        fromFile++;
        updateTx.run(
          dongFromK(old.price),
          dongFromK(old.total),
          old.cost == null || old.cost === '' ? null : dongFromK(old.cost),
          old.unitPrice == null || old.unitPrice === '' ? null : dongFromK(old.unitPrice),
          t.id
        );
      } else {
        updateTx.run(
          dongFromK(t.price_vnd),
          dongFromK(t.total_vnd),
          t.cost_vnd == null ? null : dongFromK(t.cost_vnd),
          t.unit_price_vnd == null ? null : dongFromK(t.unit_price_vnd),
          t.id
        );
      }
    }
    db.prepare('UPDATE products SET cost_price_vnd = ROUND(cost_price_vnd * 1000)').run();
    db.prepare('UPDATE prescriptions SET total_vnd = ROUND(total_vnd * 1000)').run();
    db.prepare("INSERT INTO app_meta(key, value) VALUES('money_unit', 'dong') ON CONFLICT(key) DO UPDATE SET value = excluded.value").run();
  });
  run();
  console.log('[money] Đã lưu đồng nguyên. ' + fromFile + ' giao dịch lấy từ file còn số lẻ, ' + (txRows.length - fromFile) + ' giao dịch nhân từ số đã làm tròn.');
}

migrateMoneyToDong();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('Quản Lý Kho (local) đang chạy:');
  console.log('  PC    : https://localhost (dự phòng http://localhost:' + PORT + ')');
  console.log('  Khác  : https://<IP-máy-tính> (ứng dụng nghe 0.0.0.0 trong container; docker-compose chỉ mở cổng ' + PORT + ' ở 127.0.0.1)');
  console.log('  DB    : ' + DB_FILE);
  console.log('  Backup: ' + BACKUP_DIR + ' (giữ ' + BACKUP_KEEP_DAYS + ' ngày)');
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
