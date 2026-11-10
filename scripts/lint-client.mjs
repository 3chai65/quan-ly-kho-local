/**
 * Lint phần JS client nhúng trong PAGE. Không chặn phát hành: chỉ in số cảnh báo.
 * Chạy: node scripts/lint-client.mjs
 */
import { Linter } from 'eslint';
import { PAGE } from '../src/page.js';

const blocks = [...PAGE.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
let code = blocks.find(b => b.includes('var doc = document;'));
if (!code) {
  console.error('Không tìm thấy script client trong PAGE.');
  process.exit(1);
}
code = code.replace(/%%BOOT%%/g, 'null').replace(/%%NEEDFETCH%%/g, 'false');

const browserGlobals = {
  window: 'readonly', document: 'readonly', console: 'readonly', localStorage: 'readonly',
  fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', URL: 'readonly',
  Blob: 'readonly', FileReader: 'readonly', Intl: 'readonly', confirm: 'readonly',
  alert: 'readonly', MouseEvent: 'readonly', requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly', getComputedStyle: 'readonly', navigator: 'readonly',
  location: 'readonly', addEventListener: 'readonly', removeEventListener: 'readonly',
  innerWidth: 'readonly', innerHeight: 'readonly', scrollX: 'readonly', scrollY: 'readonly',
  devicePixelRatio: 'readonly', matchMedia: 'readonly', crypto: 'readonly',
  setInterval: 'readonly', clearInterval: 'readonly'
};
const linter = new Linter();
const messages = linter.verify(code, {
  languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: browserGlobals },
  rules: {
    'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', vars: 'all' }],
    'no-undef': 'warn',
    'no-dupe-keys': 'warn'
  }
});
console.log('Cảnh báo lint client: ' + messages.length);
for (const m of messages.slice(0, 20)) console.log(`  ${m.line}:${m.column} ${m.ruleId} ${m.message}`);
process.exit(0);
