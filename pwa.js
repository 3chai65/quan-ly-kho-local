/* PWA 2.16.0: manifest, icon PNG (sinh bằng mã, không file nhị phân) và service worker.
   Không chứa dữ liệu kho. Service worker KHÔNG cache gì (chỉ passthrough): trang "/" và /api/* luôn lấy mới từ máy chủ. */
import zlib from 'node:zlib';

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/* Nền xanh tràn viền (dùng được cho maskable), hình hộp trắng nằm trong vùng an toàn 60% giữa. */
export function makeIcon(size) {
  const bg = [46, 125, 91], fg = [255, 255, 255];
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const a = Math.round(size * 0.3), b = Math.round(size * 0.7);
  const lid = Math.round(size * 0.44), gap = Math.round(size * 0.02);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    for (let x = 0; x < size; x++) {
      const inBox = x >= a && x < b && y >= a && y < b;
      const isStripe = y >= lid - gap && y < lid + gap;
      const c = inBox && !isStripe ? fg : bg;
      const o = row + 1 + x * 4;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2]; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

export const MANIFEST = JSON.stringify({
  name: 'Quản Lý Kho', short_name: 'Kho', start_url: '/', scope: '/', display: 'standalone',
  background_color: '#eceef2', theme_color: '#eceef2',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
});

/* Không cache, không respondWith: mọi yêu cầu đi thẳng ra mạng (ít rủi ro nhất, không bao giờ phục vụ bản cũ). */
export const SW_JS = "self.addEventListener('install',()=>self.skipWaiting());\n" +
  "self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));\n" +
  "self.addEventListener('fetch',()=>{});\n";

export function mountPwa(app) {
  const icons = { '/icon-192.png': makeIcon(192), '/icon-512.png': makeIcon(512), '/apple-touch-icon.png': makeIcon(180) };
  for (const p of Object.keys(icons)) {
    app.get(p, (req, res) => { res.set('Cache-Control', 'public, max-age=86400'); res.type('image/png').send(icons[p]); });
  }
  app.get('/manifest.webmanifest', (req, res) => {
    res.set('Cache-Control', 'no-cache'); res.type('application/manifest+json').send(MANIFEST);
  });
  app.get('/sw.js', (req, res) => {
    res.set({ 'Cache-Control': 'no-cache', 'Service-Worker-Allowed': '/' }); res.type('text/javascript').send(SW_JS);
  });
}
