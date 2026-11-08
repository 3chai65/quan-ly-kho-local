/**
 * Đổi ngày của MỘT đơn trong bản xuất JSON của app, giữ nguyên mọi thứ khác
 * (mã, ts, số lượng, giá, tồn kho). Ghi ra file mới, không sửa file gốc.
 *
 *   node tools/doi-ngay-don.mjs <file.json> <mã-đơn> <ngày-hiện-tại> <ngày-đúng>
 *   ví dụ: node tools/doi-ngay-don.mjs kho-backup.json OD_mw77m3ci8nn9e 2026-11-07 2026-11-08
 *
 * Chỉ sửa giao dịch có oid (hoặc orderId) đúng mã đơn VÀ date đúng <ngày-hiện-tại>; đơn thuốc có id
 * trùng mã đơn và cùng ngày cũng được sửa. Từ chối nếu không có dòng nào khớp.
 * Sau đó nạp file kết quả bằng chức năng "Khôi phục" của app (app tự sao lưu trước khi ghi đè).
 */
import fs from 'node:fs';

const [file, orderId, from, to] = process.argv.slice(2);
const isDay = s => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(s || ''))) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;   // loại 2026-11-31
};
if (!file || !orderId || !isDay(from) || !isDay(to)) {
  console.error('Cách dùng: node tools/doi-ngay-don.mjs <file.json> <mã-đơn> <YYYY-MM-DD hiện tại> <YYYY-MM-DD đúng>');
  process.exit(2);
}
if (from === to) { console.error('Ngày hiện tại và ngày đúng giống nhau, không có gì để đổi.'); process.exit(2); }

const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
const data = raw && raw.data && Array.isArray(raw.data.transactions) ? raw.data : raw;
if (!Array.isArray(data.transactions)) { console.error('File không có danh sách giao dịch.'); process.exit(2); }

const changed = [];
for (const t of data.transactions) {
  if ((t.oid === orderId || t.orderId === orderId) && t.date === from) { t.date = to; changed.push({ loại: 'giao dịch', id: t.id, kiểu: t.type || '', tên: t.name || t.productId || '' }); }
}
for (const p of Array.isArray(data.prescriptions) ? data.prescriptions : []) {
  if (p.id === orderId && p.date === from) { p.date = to; changed.push({ loại: 'đơn thuốc', id: p.id, kiểu: '', tên: p.name || '' }); }
}
if (!changed.length) { console.error('Không có dòng nào khớp (mã đơn ' + orderId + ', ngày ' + from + '). Không ghi file.'); process.exit(1); }

const out = file.replace(/\.json$/i, '') + '.sua-ngay.json';
fs.writeFileSync(out, JSON.stringify(raw, null, 2) + '\n', 'utf8');
console.log('Đã đổi ' + changed.length + ' dòng từ ' + from + ' sang ' + to + '. File mới: ' + out);
console.table(changed);
