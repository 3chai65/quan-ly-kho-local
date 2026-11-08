/* Thử logic của page-401-snippets.js với đồ giả (stub) cho các hàm phụ trợ của page.js.
   Đây là bằng chứng cho LOGIC của các đoạn thay thế, chưa phải test của page.js thật:
   sau khi dán vào page.js, hãy chuyển các ca này sang bộ test client (loadClient) của repo. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SNIPPETS = fs.readFileSync(path.join(here, '..', 'page-401-snippets.js'), 'utf8');

const PRELUDE = `
var DIRTY_BADGE_MS = 4000;
var dirty = false, dirtySince = 0, syncErrorShown = false, syncDetail = '', quotaNote = '';
var syncRejected = false, syncRetryTimer = null, syncRetryDelay = 4000, pushing = false, refreshing = false;
var conflictOpen = false, cloudBase = 100, orderCur = null;
var db = { products: [{ name: 'Ban dau' }], transactions: [], prescriptions: [], updatedAt: 100 };
var calls = { toast: [], saveLocal: 0, renderAll: 0, confirm: 0, download: 0, fetch: [], retry: 0, cloudConflict: 0 };
function armDirtyBadge(){}
function touch(){}
function num(x){ return Number(x) || 0; }
function sanitize(x){ return JSON.parse(JSON.stringify(x)); }
function saveLocal(){ calls.saveLocal++; }
function renderAll(){ calls.renderAll++; }
function renderOrder(){}
function busyEditing(){ return false; }
function noteStockWarnings(){}
function syncFailText(d, fb){ return (d && d.error) || fb; }
function cloudConflict(){ calls.cloudConflict++; return Promise.resolve(false); }
function scheduleSyncRetry(){ calls.retry++; syncRetryTimer = 1; }
function toast(m, t){ calls.toast.push([m, t || '']); }
function backupStamp(){ return 'T'; }
var __confirm = true, __download = true;
function confirm(){ calls.confirm++; return __confirm; }
function downloadBackup(){ calls.download++; return __download; }
function noteSyncFailure(detail, retry){
  syncErrorShown = true;
  syncDetail = detail || 'Dữ liệu trên máy này chưa lên máy chủ.';
  syncRejected = !retry;
  renderSyncBadge();
  if (retry) scheduleSyncRetry();
  else if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
}
`;

class El {
  constructor() { this.hidden = true; this._t = ''; this.kids = []; this.href = ''; }
  set textContent(v) { this._t = String(v); this.kids = []; }
  get textContent() { return this._t + this.kids.map(k => k.textContent).join(''); }
  appendChild(k) { this.kids.push(k); }
}

function mk() {
  const badge = new El();
  const drop = new El();
  const ctx = {
    console, Promise, JSON, Date, setTimeout, clearTimeout,
    $: sel => (sel === '#syncBadge' ? badge : sel === '#syncDiscard' ? drop : null),
    doc: { hidden: false, createElement: () => new El(), createTextNode: s => ({ textContent: s }) }
  };
  vm.createContext(ctx);
  vm.runInContext(PRELUDE + '\n' + SNIPPETS, ctx);
  // phản hồi giả
  ctx.__res = (status, body) => ({ status, ok: status >= 200 && status < 300, json: () => Promise.resolve(body) });
  ctx.__fetchWith = fn => { ctx.apiFetch = function (url, opt) { ctx.calls.fetch.push([url, opt && opt.method || 'GET']); return fn(url, opt); }; };
  return { ctx, badge, drop };
}
const NOT_APPROVED = { success: false, error: 'Thiết bị chưa được duyệt', code: 'device_not_approved' };

test('401 khi lưu: giữ nháp, không cho bỏ nháp, không thử lại, huy hiệu báo rõ và có liên kết /auth/join', async () => {
  const { ctx, badge, drop } = mk();
  ctx.dirty = true; ctx.dirtySince = Date.now();
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(401, NOT_APPROVED)));
  const ok = await ctx.pushState(true);
  assert.equal(ok, false);
  assert.equal(ctx.dirty, true, 'nháp phải còn');
  assert.equal(ctx.authLost, true);
  assert.equal(ctx.syncRejected, false);
  assert.equal(ctx.calls.retry, 0, 'không hẹn gửi lại');
  assert.equal(ctx.syncRetryTimer, null);
  assert.equal(drop.hidden, true, 'nút bỏ nháp phải ẩn');
  assert.equal(badge.hidden, false);
  assert.match(badge.textContent, /chưa được duyệt hoặc đã bị thu hồi/);
  assert.match(badge.textContent, /Thay đổi chưa gửi vẫn được giữ/);
  assert.equal(badge.kids[0].href, '/auth/join');
  assert.equal(ctx.calls.toast.filter(t => /chưa được duyệt/.test(t[0])).length, 1);
});

test('401 lặp lại: chỉ báo toast một lần', async () => {
  const { ctx } = mk();
  ctx.dirty = true;
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(401, NOT_APPROVED)));
  await ctx.pushState(false);
  await ctx.pushState(false);
  assert.equal(ctx.calls.toast.filter(t => /chưa được duyệt/.test(t[0])).length, 1);
});

test('hồi quy: 400 vẫn là "dữ liệu bị từ chối" (hiện nút bỏ nháp, không thử lại); 500 và mất mạng thì thử lại', async () => {
  let m = mk();
  m.ctx.dirty = true;
  m.ctx.__fetchWith(() => Promise.resolve(m.ctx.__res(400, { success: false, error: 'trùng tên' })));
  await m.ctx.pushState(false);
  assert.equal(m.ctx.authLost, false);
  assert.equal(m.ctx.syncRejected, true);
  assert.equal(m.drop.hidden, false);
  assert.equal(m.ctx.calls.retry, 0);

  m = mk(); m.ctx.dirty = true;
  m.ctx.__fetchWith(() => Promise.resolve(m.ctx.__res(500, { success: false })));
  await m.ctx.pushState(false);
  assert.equal(m.ctx.authLost, false);
  assert.equal(m.ctx.calls.retry, 1);
  assert.equal(m.drop.hidden, true);

  m = mk(); m.ctx.dirty = true;
  m.ctx.__fetchWith(() => Promise.resolve(null));
  await m.ctx.pushState(false);
  assert.equal(m.ctx.calls.retry, 1);
  assert.equal(m.ctx.authLost, false);
});

test('409 vẫn đi đường xung đột như cũ', async () => {
  const { ctx } = mk();
  ctx.dirty = true;
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(409, { success: false, conflict: true })));
  await ctx.pushState(false);
  assert.equal(ctx.calls.cloudConflict, 1);
  assert.equal(ctx.authLost, false);
});

test('lưu thành công xóa trạng thái authLost', async () => {
  const { ctx, badge } = mk();
  ctx.dirty = true;
  ctx.authLost = true;
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(200, { success: true, updatedAt: 200 })));
  assert.equal(await ctx.pushState(true), true);
  assert.equal(ctx.authLost, false);
  assert.equal(ctx.dirty, false);
  assert.equal(badge.hidden, true);
});

test('401 khi tải tay: không ghi đè db, không saveLocal, báo thiết bị chưa được duyệt (không báo "Không tải được")', async () => {
  const { ctx } = mk();
  ctx.dirty = true;
  const before = JSON.stringify(ctx.db);
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(401, NOT_APPROVED)));
  const ok = await ctx.pullState(true, true);
  assert.equal(ok, false);
  assert.equal(JSON.stringify(ctx.db), before);
  assert.equal(ctx.calls.saveLocal, 0);
  assert.equal(ctx.dirty, true);
  assert.equal(ctx.authLost, true);
  assert.equal(ctx.calls.toast.some(t => t[0] === 'Không tải được dữ liệu'), false);
});

test('autoRefresh: 401 đặt authLost một lần; sau đó không gọi mạng nữa', async () => {
  const { ctx } = mk();
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(401, NOT_APPROVED)));
  assert.equal(await ctx.autoRefresh(), false);
  assert.equal(ctx.authLost, true);
  const n = ctx.calls.fetch.length;
  assert.equal(await ctx.autoRefresh(), false);
  assert.equal(ctx.calls.fetch.length, n, 'không gọi thêm khi đang authLost');
  assert.equal(ctx.refreshing, false);
});

test('autoRefresh bình thường vẫn hoạt động (hồi quy)', async () => {
  const { ctx } = mk();
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(200, { success: true, data: { products: [{ name: 'Moi' }], transactions: [], prescriptions: [], updatedAt: 500 } })));
  assert.equal(await ctx.autoRefresh(), true);
  assert.equal(ctx.cloudBase, 500);
  assert.equal(ctx.db.products[0].name, 'Moi');
  assert.equal(ctx.calls.toast.some(t => /thiết bị khác/.test(t[0])), true);
});

test('bỏ nháp khi đang authLost: không hỏi confirm, không tải file, giữ nguyên nháp', async () => {
  const { ctx } = mk();
  ctx.dirty = true; ctx.authLost = true;
  assert.equal(await ctx.discardUnsynced(), false);
  assert.equal(ctx.calls.confirm, 0);
  assert.equal(ctx.calls.download, 0);
  assert.equal(ctx.dirty, true);
});

test('bỏ nháp thành công: tải file nháp, lấy bản máy chủ, xóa cờ và huy hiệu', async () => {
  const { ctx, badge, drop } = mk();
  ctx.dirty = true; ctx.dirtySince = 1; ctx.syncErrorShown = true; ctx.syncRejected = true; ctx.syncDetail = 'trùng tên';
  ctx.renderSyncBadge();
  assert.equal(drop.hidden, false);
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(200, { success: true, data: { products: [{ name: 'May chu' }], transactions: [], prescriptions: [], updatedAt: 900 } })));
  assert.equal(await ctx.discardUnsynced(), true);
  assert.equal(ctx.calls.confirm, 1);
  assert.equal(ctx.calls.download, 1);
  assert.equal(ctx.db.products[0].name, 'May chu');
  assert.equal(ctx.dirty, false);
  assert.equal(ctx.syncRejected, false);
  assert.equal(badge.hidden, true);
  assert.equal(drop.hidden, true);
});

test('bỏ nháp mà lấy bản máy chủ THẤT BẠI: huy hiệu, nút và nháp đều còn (không báo xong giả)', async () => {
  for (const mode of ['mất mạng', 'lỗi 500']) {
    const { ctx, badge, drop } = mk();
    ctx.dirty = true; ctx.dirtySince = 1; ctx.syncErrorShown = true; ctx.syncRejected = true; ctx.syncDetail = 'trùng tên';
    ctx.renderSyncBadge();
    const before = JSON.stringify(ctx.db);
    ctx.__fetchWith(() => Promise.resolve(mode === 'mất mạng' ? null : ctx.__res(500, { success: false })));
    assert.equal(await ctx.discardUnsynced(), false, mode);
    assert.equal(ctx.dirty, true, mode + ': nháp phải còn');
    assert.equal(ctx.syncRejected, true, mode);
    assert.equal(ctx.syncErrorShown, true, mode);
    assert.equal(badge.hidden, false, mode + ': huy hiệu phải còn');
    assert.equal(drop.hidden, false, mode + ': nút phải còn để thử lại');
    assert.equal(JSON.stringify(ctx.db), before, mode);
    assert.equal(ctx.calls.toast.some(t => /giữ trên máy này/.test(t[0])), true, mode);
  }
});

test('bỏ nháp mà máy chủ trả 401 giữa chừng: báo authLost, nháp còn, nút ẩn', async () => {
  const { ctx, badge, drop } = mk();
  ctx.dirty = true; ctx.dirtySince = 1; ctx.syncErrorShown = true; ctx.syncRejected = true;
  ctx.__fetchWith(() => Promise.resolve(ctx.__res(401, NOT_APPROVED)));
  assert.equal(await ctx.discardUnsynced(), false);
  assert.equal(ctx.authLost, true);
  assert.equal(ctx.dirty, true);
  assert.equal(drop.hidden, true);
  assert.match(badge.textContent, /chưa được duyệt/);
});

test('hủy hộp xác nhận hoặc không tải được file nháp thì không đụng gì', async () => {
  let m = mk();
  m.ctx.dirty = true; m.ctx.syncRejected = true; m.ctx.__confirm = false;
  assert.equal(await m.ctx.discardUnsynced(), false);
  assert.equal(m.ctx.calls.download, 0);
  assert.equal(m.ctx.calls.fetch.length, 0);

  m = mk();
  m.ctx.dirty = true; m.ctx.syncRejected = true; m.ctx.__download = false;
  assert.equal(await m.ctx.discardUnsynced(), false);
  assert.equal(m.ctx.calls.fetch.length, 0);
  assert.equal(m.ctx.dirty, true);
});

test('huy hiệu bình thường (không authLost) giữ định dạng cũ', () => {
  const { ctx, badge, drop } = mk();
  ctx.syncErrorShown = true; ctx.syncDetail = 'Mất kết nối'; ctx.quotaNote = 'Bộ nhớ đầy';
  ctx.renderSyncBadge();
  assert.equal(badge.hidden, false);
  assert.equal(badge.textContent, 'Chưa đồng bộ\nMất kết nối\nBộ nhớ đầy');
  assert.equal(drop.hidden, true);
});

test('lớp phòng thủ thứ hai: dù syncRejected còn bật, authLost vẫn ẩn nút bỏ nháp', () => {
  const { ctx, drop } = mk();
  ctx.syncRejected = true;
  ctx.authLost = true;
  ctx.renderSyncBadge();
  assert.equal(drop.hidden, true);
});
