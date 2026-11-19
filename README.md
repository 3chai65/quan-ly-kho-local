# Quản Lý Kho — bản chạy local

App quản lý kho dược liệu cá nhân (1 người dùng): nhập hàng, bán lẻ, đơn thuốc chén,
tồn kho, thống kê doanh thu 12 tháng. Chạy **hoàn toàn trong mạng nội bộ**, dữ liệu là
**file SQLite trên ổ cứng** — không phụ thuộc cloud. Phiên bản hiện tại: **2.30.0**.

Hub thật chạy trên **Mac mini 192.168.2.46** (Node 22 + Caddy cài trực tiếp, **không Docker**).
Windows (192.168.2.47) chỉ để phát triển; Docker/`G:\...\data` là bản lùi đóng băng từ
16/11/2026, đừng bật cùng lúc với Mac.

## Phạm vi

- Mã nguồn phát triển ở `G:\quan-ly-kho-local` (Windows). Remote `origin-local` trỏ
  https://github.com/3chai65/quan-ly-kho-local , nhánh `main`; trên Mac remote tên `origin`.
  Mac chỉ nhận mã đã gắn thẻ `vX.Y.Z` và test xanh.
- Repo `quan-ly-kho` (Cloudflare Worker + D1) giữ nguyên, không sửa, không push.
- Một người dùng, nhiều thiết bị đã duyệt cùng dùng một kho: iPhone (PWA), PC/Mac qua
  trình duyệt, app desktop Tauri. Đồng bộ theo snapshot: bản gửi cũ bị máy chủ từ chối
  (409/428), không ghi đè âm thầm. Tab đang ẩn không tự tải (`document.hidden`).
- Giao diện có hai chế độ trong cùng `src/page.js`: điện thoại, và desktop
  (`html.desktop`, bật trong app Tauri: thanh bên dọc, khung 1280x720 phóng đều,
  nút kính). Phần dành riêng cho desktop không đổi giao diện điện thoại.

## Tinh thần dự án (đặt từ đầu)

- **PageSpeed/Lighthouse cao nhất có thể**: không tài nguyên ngoài (font/CDN/analytics),
  ít request nhất có thể. SEO cố ý để thấp vì app riêng tư gửi `noindex`.
- **Gọn nhẹ và đơn giản**: ít file nhất; không framework, không build step.
- **Tiền bạc và tồn kho phải chuẩn xác**: mọi thay đổi dữ liệu đi qua luồng của chính
  app, backup tự động.
- **CSS/JS/HTML ngữ nghĩa**: nhãn/aria đúng chuẩn để A11y tốt.

## Kiến trúc

```
Mac mini 192.168.2.46 (máy chủ)                 iPhone / PC / app Tauri (cùng WiFi)
┌───────────────────────────────┐
│ Caddy (brew services, root)   │  ◄── https://192.168.2.46
│  HTTPS :443, tls internal     │
│  ↓ reverse_proxy 127.0.0.1:8787
│ Node 22 + Express + SQLite    │
│  LaunchDaemon vn.kho.server   │
│  ↓ đọc/ghi                    │
│ ~/kho/data/app.db, auth.db    │
│ ~/kho/data/backups/ (tự động) │
└───────────────────────────────┘
```

- **Server**: Node 22 + Express + better-sqlite3 (`server.js`), nghe `0.0.0.0:8787`, chạy
  bằng LaunchDaemon `vn.kho.server` (tự chạy lại, ghi log `~/kho/logs/`).
- **Caddy (HTTPS)**: reverse proxy cổng 443, chứng chỉ `tls internal`; cấu hình chạy thật
  là `~/kho/Caddyfile.mac` (ngoài repo). `Caddyfile` trong repo là bản Docker cũ, không dùng.
- **Client**: toàn bộ HTML + CSS + JS trong `src/page.js`, nhúng inline khi trả trang.
- **Dữ liệu**: `~/kho/data/app.db` (kho) và `auth.db` (thiết bị), ngoài repo.
- **Truy cập**: mọi thiết bị vào `https://192.168.2.46`; trên Mac có thêm `https://localhost`.
- **Sao lưu**: `~/kho/sao-luu.sh` (LaunchAgent `vn.kho.saoluu`, 19:00 hằng ngày) chép
  `backups`, `auth.db`, `caddy-data`, `luu-tru` sang Google Drive `Kho-sao-luu`.

## Chế độ HTTPS

- Thiết bị phải có CA nội bộ của Caddy (`caddy-root.crt`); cách cài ở `README-LOCAL.md`.
  Mac dùng lại CA cũ lưu ở `~/kho/caddy-data/caddy` (có trong bản sao lưu): **mất thư mục
  này là phải cài lại CA trên mọi thiết bị**.
- Cổng 80 đóng; chỉ cổng 443 ra LAN; `default_sni` giữ cert khớp khi vào bằng IP.
- Tường lửa macOS bật: Caddy được phép, `node` bị chặn từ ngoài (chỉ Caddy gọi qua loopback).
- IP máy chủ phải cố định (DHCP Binding trên router). Đổi IP = cert không khớp, phải cài lại.
- Chỉ dùng trong LAN, không mở ra Internet.

## Cấu trúc

| File/Thư mục | Vai trò |
|---|---|
| `server.js` | Server: API `/api/state`, đọc/ghi SQLite, lắp trang, tự động backup |
| `src/page.js` | `PAGE`: toàn bộ HTML + CSS + JS client (nhúng inline), cả điện thoại lẫn desktop |
| `auth.js` | Xác thực thiết bị (cookie, mã mời, tối đa 2 thiết bị chủ) |
| `pwa.js`, `src/icons/` | Manifest, icon, service worker passthrough (cài như ứng dụng) |
| `tests/client.test.mjs` | Test logic client (tiền, tồn kho, đồng bộ) |
| `tests/server.test.mjs` | Test `server.js` thật qua HTTP |
| `tests/auth*.test.mjs` | Test xác thực thiết bị |
| `scripts/auth-reset.mjs` | Đặt lại danh sách thiết bị (xóa `devices`, `invites`, không đụng `app.db`) |
| `scripts/lint-client.mjs`, `tools/kiem-cu-phap.mjs` | Lint client / kiểm cú pháp |
| `tools/kiem-tra-ngay.mjs`, `tools/doi-ngay-don.mjs` | Công cụ kiểm/đổi ngày đơn |
| `Dockerfile`, `docker-compose.yml`, `Caddyfile` | **Bản Docker cũ, đóng băng**; CI vẫn dùng Dockerfile để chạy test server |
| `.github/workflows/ci.yml`, `.nvmrc` | CI (Node 22) |
| `README-LOCAL.md` | Hướng dẫn vận hành chi tiết (một phần còn mô tả Docker cũ) |
| `CHANGELOG.md` | Lịch sử thay đổi (Keep a Changelog + SemVer) |
| `BAO-CAO-REVIEW.md` | Lỗi reviewer đã báo: đã sửa/không sửa và lý do |

Ngoài repo, trên Mac: `~/kho/data/` (dữ liệu, **không đụng**), `~/kho/Caddyfile.mac`,
`~/kho/sao-luu.sh`, `~/kho/logs/`, `~/kho/truoc-khi-bat.txt` (hash đường lui).

## Chạy

Server chạy sẵn bằng LaunchDaemon, tự lên lại sau khi Mac khởi động; không cần chạy tay.

```bash
curl -s http://127.0.0.1:8787/healthz            # -> ok
curl -k https://192.168.2.46/healthz             # -> ok (qua Caddy)
sudo launchctl kickstart -k system/vn.kho.server # khởi động lại server
```

- Dùng **Node 22** (`/opt/homebrew/opt/node@22/bin`); Node 24+/26 không build được
  better-sqlite3. Cài phụ thuộc: `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm ci --omit=dev`.
- Chạy thử ngoài dịch vụ: `DATA_DIR=<thư mục tạm> npm start` (đừng trỏ vào `~/kho/data`).
- Máy Mac cần: không ngủ (`pmset sleep 0`), tự khởi động lại khi mất điện (`autorestart 1`),
  Google Drive mở khi đăng nhập để sao lưu 19:00 chạy được.

**Triển khai bản mới** (chỉ khi có duyệt): trên Windows gắn thẻ `vX.Y.Z` và push; trên Mac
lưu hash hiện tại vào `~/kho/truoc-khi-bat.txt`, chạy `~/kho/sao-luu.sh`,
`git fetch origin --tags && git checkout --detach vX.Y.Z`, `npm ci --omit=dev`,
`sudo launchctl kickstart -k system/vn.kho.server`, rồi kiểm `healthz`,
`pragma integrity_check`, `/` chưa đăng nhập trả 401. Hỏng thì checkout lại hash đường lui.

## Chạy test

```bash
node --test tests/client.test.mjs         # test client
npm test                                  # test server (cần better-sqlite3, Node 22)
npm run test:auth                         # test xác thực
npm run lint                              # kiểm cú pháp
```

Test server/auth dùng `DATA_DIR` tạm, không chạm dữ liệu thật; CI chạy chúng trong Docker.
Chỉ chạy test trên Windows/CI, **không** chạy trên Mac hub.

## Logic cốt lõi — KHÔNG được phá vỡ khi sửa

1. **Tồn kho** (`products.stock_kg`, đơn vị kg, kiểu REAL): `NHAP` cộng, `BAN` trừ;
   bán/xuất phải kiểm tra đủ hàng trước (sai số cho phép `1e-9`). App có màn
   **đối soát tồn kho**: so `stock_kg` với tổng từ `transactions`, cho phép sửa về `calc`.
2. **Tiền lưu bằng đồng nguyên**, người dùng vẫn gõ và đọc theo **nghìn đồng**.
   Cột SQLite `price_vnd`, `total_vnd`, `cost_vnd`, `cost_price_vnd`, `unit_price_vnd`
   là đồng. `GET /api/state` kèm `moneyUnit: "dong"`.
   - Ô nhập nhận nghìn (`kInput` đổ ra ô, `kToDong` đổi lúc lưu: gõ `135` thành `135000`).
   - `fmtMoney` hiện nghìn, tối đa 3 số lẻ: `400` đồng → `0,4`, `13500` → `13,5`, `135000` → `135`.
   - `money()` làm tròn tới đồng gần nhất, cả client lẫn `validateState` trên server.
   - Vốn một vị đơn thuốc = làm tròn `kg × giá nhập` tới đồng. Lãi chia đều, dòng cuối
     nhận số dư. Giá một thang và tổng các dòng có thể lệch vài đồng.
   - JSON hoặc localStorage **không** có `moneyUnit: "dong"` là bản nghìn cũ.
     Client nhân 1000 một lần (`scaleLegacyMoney`) rồi mới `sanitize`. Bản đã có cờ
     thì giữ nguyên, không nhân lần hai.
   - Migrate trên server chạy một lần khi `app_meta.money_unit` chưa phải `dong`.
     Giao dịch có trong `data/truoc-lam-tron-2026-11-06-1047.json` lấy số lẻ gốc
     rồi nhân 1000. Giao dịch không có trong file đó chỉ nhân 1000 từ số nghìn
     nguyên đã lưu. Không nhân bản SQLite đã làm tròn nếu còn file số lẻ.
3. **Số kg**: dùng `dec()` để khử sai số dấu phẩy động nhị phân; hiển thị 1 kg = 10 lạng = 1000 g.
4. **Đồng bộ**: `PUT /api/state` ghi snapshot toàn bộ trong 1 transaction SQLite.
   Client gửi `X-Base-Updated: <updatedAt>`; server so với `app_meta.source_updated_at`,
   nếu bản trên server mới hơn → **409 conflict** (client hiện dialog "Lấy bản mới nhất" /
   "Giữ bản máy này", hoặc gửi `X-Force: 1` để ép ghi đè). Header `X-Base-Updated` thiếu (và không có `X-Force: 1`) → **428**; không hợp lệ → **400**. Server kiểm tra snapshot trước khi ghi (tồn/tiền không âm, ngày
   `YYYY-MM-DD`, đủ 3 bảng, không trùng khoá) và trả **400** kèm chi tiết; JSON hỏng cũng
   trả **400**. Server **cảnh báo** (không chặn) khi giao dịch/dòng đơn trỏ tới `productId`
   không tồn tại.
   - Huy hiệu “Chưa đồng bộ” hiện khi lưu lỗi, bộ nhớ trình duyệt đầy, hoặc bản nháp bẩn từ 4 giây. Lưu thành công nhanh thì không nháy.
   - **400** và **428** không gửi lại. Nút “Bỏ thay đổi chưa gửi, lấy bản máy chủ” hỏi xác nhận, tải `kho-nhap-bi-tu-choi-….json` trước, rồi lấy bản máy chủ. Tải thất bại thì giữ dữ liệu trên máy.
   - Mất mạng và **5xx** thử lại sau 4 giây, rồi 8, 16, tối đa 60. `PUT` thành công đưa bước chờ về 4 giây.
   - **409** chỉ mở hộp thoại xung đột, không tự gửi lại.
5. **Xác thực thiết bị** (từ 2.8.0): chỉ thiết bị đã được duyệt mới vào kho; xem mục “Xác thực thiết bị” trong `README-LOCAL.md`.

## API

| Endpoint | Mô tả |
|---|---|
| `GET /` | Trang app đầy đủ (SSR dữ liệu vào HTML); chưa đăng nhập trả 401 |
| `GET /api/state` | State JSON, kèm `moneyUnit: "dong"` |
| `PUT /api/state` | Ghi snapshot (cần `X-Base-Updated`, xem mục 4) |
| `GET /api/backups` | Liệt kê các bản backup `.db` hiện có |
| `GET /healthz` | `ok`, không cần duyệt, không trả dữ liệu |
| `GET/POST /auth/setup` | Thiết lập thiết bị chủ đầu tiên bằng mã in ở stdout (`~/kho/logs/server.out.log`); 404 sau khi đã có chủ |
| `GET/POST /auth/join` | Thiết bị mới nhập mã mời |
| `GET /auth/devices` | Quản lý thiết bị (trang HTML, chỉ thiết bị chủ) |
| `POST /auth/devices/invite` | Tạo mã mời (thiết bị chủ) |
| `POST /auth/devices/revoke` | Thu hồi thiết bị |
| `POST /auth/devices/unlock` | Mở khóa nhập mã mời sau khi nhập sai nhiều lần |
| `GET /manifest.webmanifest`, `/sw.js`, icon | PWA, công khai GET/HEAD |

Mọi `/api/*` cần cookie thiết bị đã duyệt; thiếu cookie trả 401.

## Backup & khôi phục

- **Tự động trong server**: 1 bản `~/kho/data/backups/backup-YYYY-MM-DD.db` mỗi ngày (giữ 30 bản),
  chụp trước lần ghi đầu tiên trong ngày; và `backup-YYYY-MM-DD-truoc-ghi-de-*.db` (giữ 10 bản)
  trước mỗi lần ghi đè chủ động (`X-Force`).
- **Ra ngoài máy**: `~/kho/sao-luu.sh` (19:00) chép `backups`, `auth.db` (bằng `sqlite3 .backup`),
  `caddy-data`, `luu-tru` sang Google Drive `Kho-sao-luu`; log `~/kho/logs/sao-luu.log`
  phải kết thúc bằng "xong" và không có dòng CẢNH BÁO. Không dùng `--delete`/mirror.
- **Khôi phục `app.db`**: dừng server (`sudo launchctl bootout system/vn.kho.server`), cất
  `app.db` hiện tại sang tên khác, chép bản backup mới nhất còn hợp lệ thành `app.db`, xóa
  `app.db-wal`/`-shm` cũ, bật lại (`sudo launchctl bootstrap system /Library/LaunchDaemons/vn.kho.server.plist`),
  kiểm `integrity_check`. Mất `auth.db`: dữ liệu kho không mất, chỉ phải thiết lập lại thiết bị
  (`scripts/auth-reset.mjs`, rồi vào `/auth/setup`).
- **Trong app**: nút "Sao lưu" tải file JSON theo trình duyệt của từng thiết bị.
  File xuất từ bản 2.6.6 có `moneyUnit: "dong"`. File cũ không có cờ này bị hiểu là nghìn đồng
  và nhân 1000 lúc khôi phục. Muốn đúng từng đồng của kho đang chạy thì copy `app.db`, không đi đường JSON.
- **Bản lùi Windows**: dữ liệu Docker cũ ở `G:\...\data` đóng băng từ 16/11/2026,
  không ghi, không bật song song với Mac.

## Quy ước làm việc

- `data/` là source of truth; mọi thay đổi đọc/ghi qua `/api/state`.
- Danh sách tồn kho mặc định sắp xếp theo **bán chạy nhất** (tổng kg đã bán, `BAN`).
  Cột: **Tên – Đã bán – Tồn kho – Giá nhập**.
- Sửa logic tiền/tồn kho = vùng nhạy cảm nhất — **chạy test trước khi commit**.
- Mỗi thay đổi đáng kể → ghi vào `CHANGELOG.md`.
- **Không** đưa thông tin cá nhân hay secret vào repo.
