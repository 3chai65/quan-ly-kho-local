/* PWA: manifest, icon (PNG thật trong src/icons, đọc một lần lúc khởi động) và service worker.
   Không chứa dữ liệu kho. Service worker KHÔNG cache gì (chỉ passthrough): trang "/" và /api/* luôn lấy mới từ máy chủ. */
import fs from 'node:fs';

export const MANIFEST = JSON.stringify({
  name: 'Quản Lý Kho', short_name: 'Kho', start_url: '/', scope: '/', display: 'standalone',
  background_color: '#142844', theme_color: '#142844',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
    { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
});

/* Không cache, không respondWith: mọi yêu cầu đi thẳng ra mạng (ít rủi ro nhất, không bao giờ phục vụ bản cũ). */
export const SW_JS = "self.addEventListener('install',()=>self.skipWaiting());\n" +
  "self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n" +
  "self.addEventListener('fetch',()=>{});\n";

export function mountPwa(app) {
  const ICONS = { '/icon-192.png': ['icon-192.png', 'image/png'], '/icon-512.png': ['icon-512.png', 'image/png'], '/apple-touch-icon.png': ['apple-touch-icon.png', 'image/png'],
    '/icon-maskable-192.png': ['icon-maskable-192.png', 'image/png'], '/icon-maskable-512.png': ['icon-maskable-512.png', 'image/png'],
    '/favicon.ico': ['favicon.ico', 'image/x-icon'], '/favicon.svg': ['favicon.svg', 'image/svg+xml'] };
  for (const [p, [file, type]] of Object.entries(ICONS)) {
    const buf = fs.readFileSync(new URL('./src/icons/' + file, import.meta.url));
    app.get(p, (req, res) => { res.set('Cache-Control', 'public, max-age=86400'); res.type(type).send(buf); });
  }
  /* 2.21.0: font Inter (OFL) cho máy không có SF Pro; nằm sau cổng xác thực (cookie đi kèm yêu cầu font cùng nguồn). */
  const FONT = fs.readFileSync(new URL('./src/inter-vi.woff2', import.meta.url));
  app.get('/inter.woff2', (req, res) => { res.set('Cache-Control', 'public, max-age=31536000, immutable'); res.type('font/woff2').send(FONT); });
  app.get('/manifest.webmanifest', (req, res) => {
    res.set('Cache-Control', 'no-cache'); res.type('application/manifest+json').send(MANIFEST);
  });
  app.get('/sw.js', (req, res) => {
    res.set({ 'Cache-Control': 'no-cache', 'Service-Worker-Allowed': '/' }); res.type('text/javascript').send(SW_JS);
  });
}
