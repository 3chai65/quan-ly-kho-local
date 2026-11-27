/**
 * Quản Lý Kho — ghép trang lúc khởi động (2.40.5): index.html (khung) + style.css + app.js (JS client).
 * Kết quả trùng từng byte với PAGE cũ (String.raw): CRLF → LF như template literal.
 */
import { readFileSync } from 'node:fs';

const doc = f => readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\r\n?/g, '\n');
export const STYLE_MARK = '/*@@tach-style@@*/\n';
export const CSS = doc('./style.css');
export const APP = doc('./app.js');
export const PAGE = doc('./index.html')
  .replace('%%STYLE%%', () => CSS.replace(STYLE_MARK, '</style>\n<style>\n'))
  .replace('%%APP%%', () => APP);
