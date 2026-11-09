# Quản Lý Kho — bản chạy local

App quản lý kho dược liệu cá nhân (1 người dùng): nhập hàng, bán lẻ, đơn thuốc chén,
tồn kho, thống kê doanh thu 12 tháng. Bản này chạy **hoàn toàn trong mạng nội bộ**,
dữ liệu là **file SQLite trên ổ cứng** — không phụ thuộc cloud.

## Phạm vi

- Bản đang dùng là thư mục `G:\quan-ly-kho-local`. Remote `origin-local` trỏ
  https://github.com/3chai65/quan-ly-kho-local , nhánh `main`.
- Repo `quan-ly-kho` (Cloudflare Worker + D1, remote git tên `origin`) giữ nguyên
  từ lúc chuyển sang Docker. Không sửa code ở đó và không push sang remote đó.
- Một người dùng. PC và điện thoại dùng riêng, không mở cùng lúc. Tab đang ẩn
  không tự tải (`document.hidden`). Khi quay lại máy, trang lấy bản server nếu
  `updatedAt` mới hơn.

## Tinh thần dự án (đặt từ đầu)

- **PageSpeed/Lighthouse cao nhất có thể**: không tài nguyên ngoài (font/CDN/analytics),
  ít request nhất có thể. SEO cố ý để thấp vì app riêng tư gửi `noindex`.
- **Gọn nhẹ và đơn giản**: ít file nhất; không framework, không build step.
- **Tiền bạc và tồn kho phải chuẩn xác**: mọi thay đổi dữ liệu đi qua luồng của chính
  app, backup tự động.
- **CSS/JS/HTML ngữ nghĩa**: nhãn/aria đúng chuẩn để A11y tốt.

## Kiến trúc

```
Máy tính (máy chủ)                          Điện thoại / PC khác (cùng WiFi)
┌──────────────────────────────┐
│ Docker Desktop               │
│  └─ container "quan-ly-kho"  │  ◄── http://<IP-máy-tính>:8787
│      Node + Express + SQLite │
│      ↓ đọc/ghi               │
│  data/app.db (file SQLite)   │
│  data/backups/ (tự động)     │
└──────────────────────────────┘
```

- **Server**: Node + Express + better-sqlite3, chạy trong Docker (`server.js`).
- **Client**: toàn bộ HTML + CSS + JS nằm trong `src/page.js`, nhúng inline khi trả trang.
- **Dữ liệu**: file SQLite `data/app.db` trên ổ cứng PC.
- **Truy cập**: PC qua `localhost`, thiết bị khác qua IP máy tính trong cùng WiFi.

## Cấu trúc

| File/Thư mục | Vai trò |
|---|---|
| `server.js` | Server: API `/api/state`, đọc/ghi SQLite, lắp trang, tự động backup |
| `src/page.js` | `PAGE`: toàn bộ HTML + CSS + JS client (nhúng inline) |
| `tests/client.test.mjs` | Test logic client (tiền, tồn kho, đồng bộ) — chạy trên host |
| `tests/server.test.mjs` | Test `server.js` thật qua HTTP — chạy trong Docker |
| `Dockerfile`, `docker-compose.yml` | Đóng gói và chạy server |
| `data/` | Dữ liệu SQLite + backup — **không commit** (gitignore) |
| `README-LOCAL.md` | Hướng dẫn vận hành chi tiết (chạy, backup, khôi phục) |
| `CHANGELOG.md` | Lịch sử thay đổi (Keep a Changelog + SemVer) |

## Chạy

```powershell
cd "G:\quan-ly-kho-local"
docker compose up -d --build
```

- **PC**: mở `http://localhost:8787`
- **Điện thoại**: mở `http://<IP-máy-tính>:8787` (cùng WiFi). Xem IP: `ipconfig`.

Docker Desktop tự khởi động cùng Windows; container có `restart: unless-stopped` nên
tự chạy lại. Không cần chạy lệnh gì sau khi bật máy.

Xem `README-LOCAL.md` để biết chi tiết (backup, khôi phục, nạp dữ liệu, đổi cổng).

## Chạy test

```powershell
node --test tests/client.test.mjs                 # test client (trên máy)
docker run --rm -e DATA_DIR=/tmp/qlk quan-ly-kho:latest npm test   # test server (trong Docker)
```

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
| `GET /` | Trang app đầy đủ (SSR dữ liệu vào HTML) |
| `GET /api/state` | State JSON, kèm `moneyUnit: "dong"` |
| `PUT /api/state` | Ghi snapshot (cần `X-Base-Updated`, xem mục 4) |
| `GET /api/backups` | Liệt kê các bản backup `.db` hiện có |

## Backup & khôi phục

- **Tự động**: server tạo 1 bản `data/backups/backup-YYYY-MM-DD.db` mỗi ngày (giữ 30 bản) chụp trước lần ghi đầu tiên trong ngày; và chụp snapshot riêng `backup-YYYY-MM-DD-truoc-ghi-de-*.db` (giữ 10 bản) trước mỗi lần ghi đè chủ động (`X-Force`).
- **Khôi phục**: dừng container, copy file backup đè lên `app.db`, khởi động lại
  (xem `README-LOCAL.md`).
- **Trong app**: nút "Sao lưu" tải file JSON theo trình duyệt của từng thiết bị.
  File xuất từ bản 2.6.6 có `moneyUnit: "dong"` trong dữ liệu. File cũ không có
  cờ này bị hiểu là nghìn đồng và nhân 1000 lúc khôi phục. Muốn đúng từng đồng
  của kho đang chạy thì copy file `app.db`, không đi đường JSON.
- **Ngoài ổ `G:`**: `README-LOCAL.md` chép `data\backups` và `data\luu-tru` sang
  `E:\sao-luu-kho` bằng `robocopy` không `/MIR`. `E:` là HDD khác SSD chứa `G:`.
  JSON nghìn đồng ngày 6/11 có thêm một đơn bán lẻ không còn trong sổ hiện tại;
  chi tiết nằm ở mục khôi phục của `README-LOCAL.md`.

## Quy ước làm việc

- `data/` là source of truth; mọi thay đổi đọc/ghi qua `/api/state`.
- Danh sách tồn kho mặc định sắp xếp theo **bán chạy nhất** (tổng kg đã bán, `BAN`).
  Cột: **Tên – Đã bán – Tồn kho – Giá nhập**.
- Sửa logic tiền/tồn kho = vùng nhạy cảm nhất — **chạy test trước khi commit**.
- Mỗi thay đổi đáng kể → ghi vào `CHANGELOG.md`.
- **Không** đưa thông tin cá nhân hay secret vào repo.
