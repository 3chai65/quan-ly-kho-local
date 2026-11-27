/** Kiểm cú pháp JS client src/app.js (không phụ thuộc gói ngoài). Chạy: node tools/kiem-cu-phap.mjs [file.js] */
import { readFileSync } from 'node:fs';

const file = process.argv[2] || new URL('../src/app.js', import.meta.url);
const code = readFileSync(file, 'utf8');
if (!process.argv[2]) {
  const { PAGE } = await import('../src/page.js');
  if (PAGE.includes('\uFFFD')) { console.error('src/index.html/style.css/app.js chứa ký tự thay thế U+FFFD (byte UTF-8 hỏng)'); process.exit(1); }
}
try { new Function(code); console.log('Cú pháp client OK'); }
catch (e) { console.error('Lỗi cú pháp client: ' + e.message); process.exit(1); }
