/** Kiểm cú pháp script client nhúng trong PAGE (không phụ thuộc gói ngoài). Chạy: node tools/kiem-cu-phap.mjs [file.js] */
import { readFileSync } from 'node:fs';

let code;
if (process.argv[2]) {
  code = readFileSync(process.argv[2], 'utf8');
} else {
  const { PAGE } = await import('../src/page.js');
  const blocks = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  code = blocks.find(b => b.includes('var doc = document;'));
  if (!code) { console.error('Không tìm thấy script chính trong src/page.js'); process.exit(1); }
  code = code.replace(/%%BOOT%%/g, 'null').replace(/%%NEEDFETCH%%/g, 'false');
}
try { new Function(code); console.log('Cú pháp client OK'); }
catch (e) { console.error('Lỗi cú pháp client: ' + e.message); process.exit(1); }
