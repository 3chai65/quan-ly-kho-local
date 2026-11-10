/**
 * Đặt lại danh sách thiết bị (khi mất cả hai thiết bị chủ, đổi máy, xóa dữ liệu trình duyệt).
 * Chạy trong container:  docker compose exec <tên-dịch-vụ> node scripts/auth-reset.mjs
 * Rồi khởi động lại:     docker compose restart <tên-dịch-vụ>
 * Server sẽ in mã thiết lập mới trong log. Không đụng đến app.db (dữ liệu kho).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(here, '..', 'data');
const file = path.join(dataDir, 'auth.db');

if (!fs.existsSync(file)) {
  console.log('Chưa có ' + file + ', không có gì để đặt lại.');
  process.exit(0);
}
const db = new Database(file);
const n = db.prepare('DELETE FROM devices').run().changes;
const inv = db.prepare('DELETE FROM invites').run().changes;
db.close();
console.log('Đã xóa ' + n + ' thiết bị và ' + inv + ' mã mời trong ' + file + '.');
console.log('Khởi động lại máy chủ để lấy mã thiết lập mới (xem bằng: docker compose logs).');
