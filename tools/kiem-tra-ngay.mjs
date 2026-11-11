/**
 * Liệt kê bản ghi có ngày ghi (date) khác ngày tạo thật (giờ Việt Nam).
 * Dùng để tìm các đơn bị ghi sai ngày khi tab để mở qua nửa đêm.
 *
 *   node tools/kiem-tra-ngay.mjs <file-sao-luu.json>
 *
 * Thời điểm tạo lấy từ trường ts; nếu thiếu thì suy ra từ mã (id):
 *   - TX_1793519408528_...  : 13 chữ số thập phân sau dấu gạch dưới = mili-giây
 *   - OD_mw77m3ci8nn9e, TX_mvyqgzfv4idsb : 8 ký tự đầu (hệ 36) = mili-giây
 * Kiểm tra cả giao dịch lẫn đơn thuốc. Chỉ đọc, không sửa gì.
 * Lưu ý: bản ghi cố ý chọn ngày cũ (ghi bù) cũng sẽ hiện ra; hãy tự xem từng dòng.
 */
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Cách dùng: node tools/kiem-tra-ngay.mjs <file.json>'); process.exit(2); }

const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const data = raw && raw.data && Array.isArray(raw.data.transactions) ? raw.data : raw;
const VN_OFFSET_MS = 7 * 3600 * 1000;
const MIN_MS = Date.UTC(2025, 0, 1);
const MAX_MS = Date.UTC(2035, 0, 1);
const inRange = ms => Number.isFinite(ms) && ms >= MIN_MS && ms <= MAX_MS;

function fromTs(ts) {
  if (typeof ts === 'number' && inRange(ts)) return ts;
  if (typeof ts === 'string' && ts.trim()) {
    const n = Number(ts);
    if (inRange(n)) return n;
    const t = Date.parse(ts);
    if (inRange(t)) return t;
  }
  return null;
}
function fromId(id) {
  const s = String(id || '');
  let m = s.match(/_(\d{13})(?:_|$)/);
  if (m && inRange(Number(m[1]))) return Number(m[1]);
  m = s.match(/^[A-Za-z]+_([0-9a-z]{8})[0-9a-z]*$/);
  if (m) { const ms = parseInt(m[1], 36); if (inRange(ms)) return ms; }
  return null;
}
const vnDay = ms => new Date(ms + VN_OFFSET_MS).toISOString().slice(0, 10);
const vnTime = ms => new Date(ms + VN_OFFSET_MS).toISOString().slice(11, 16);

const bad = [];
let total = 0, viaTs = 0, viaId = 0, unknown = 0;
function scan(kind, rows) {
  for (const t of Array.isArray(rows) ? rows : []) {
    if (!t) continue;
    // Ngày ghi: ưu tiên date; thiếu date thì dùng ngày của updatedAt (nếu có).
    let ghi = (typeof t.date === 'string' && t.date) ? t.date : null;
    if (!ghi && t.updatedAt != null && Number.isFinite(Number(t.updatedAt))) ghi = vnDay(Number(t.updatedAt));
    if (!ghi) { total++; unknown++; console.log(`không xác định được: ${kind} id=${t.id} (thiếu date)`); continue; }
    total++;
    let ms = fromTs(t.ts), src = 'ts';
    if (ms == null) { ms = fromTs(t.updatedAt); if (ms != null) src = 'ts'; }
    if (ms == null) { ms = fromId(t.id); src = 'id'; }
    if (ms == null) { unknown++; continue; }
    if (src === 'ts') viaTs++; else viaId++;
    const real = vnDay(ms);
    if (real !== ghi) {
      bad.push({
        loại: kind, đơn: t.oid || t.orderId || t.oname || t.orderName || '', id: t.id, kiểu: t.type || '',
        tên: t.name || t.productId || '', ghiNgày: ghi, tạoLúc: real + ' ' + vnTime(ms), nguồn: src
      });
    }
  }
}
scan('giao dịch', data.transactions);

console.log('Tổng bản ghi: ' + total + ' | xác định thời điểm tạo bằng ts: ' + viaTs + ', bằng id: ' + viaId +
  ' | không xác định được: ' + unknown + ' | lệch ngày: ' + bad.length);
if (bad.length) console.table(bad);
