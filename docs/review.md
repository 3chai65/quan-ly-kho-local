# Hướng dẫn cho reviewer

## 1. Soi gì
- Nhánh `main`, thẻ mới nhất. Báo cáo ghi rõ **hash đã soi** (`git rev-parse --short HEAD`).

## 2. Chạy kiểm
`nvm use 22` → `npm ci` → rồi lần lượt:
`npm run lint`, `npm run lint:client`, `npm run test:client`, `npm test` (server), `npm run test:auth`.
Lỗi better-sqlite3: xóa `node_modules` rồi `npm ci` (không dùng `npm rebuild`).

## 3. Số liệu
- KHÔNG dùng `data/app.db` cục bộ (bản cũ, không đại diện).
- Cần số thật (kích cỡ dữ liệu, thời gian) thì ghi "cần hub đo", đừng suy từ bản cục bộ.

## 4. Bối cảnh thiết kế
- Một chủ dùng, chạy trong LAN sau Caddy HTTPS.
- Mọi giao dịch (Nhập, Bán lẻ, Thuốc chén) luôn ghi ngày hôm nay.
- Đồng bộ: `PUT /api/state` gửi toàn bộ snapshot, có `X-Base-Updated` (409/428) và `X-Op-Id`.
- Dữ liệu trên máy lưu ở IndexedDB (rớt về localStorage nếu lỗi); gửi nén gzip; trần 32 MB sau giải nén.

## 5. Đã quyết KHÔNG làm (đừng báo lại trừ khi có bằng chứng mới)
- Ghi theo delta / bỏ snapshot 15 giây (chưa cần trước vài chục nghìn giao dịch).
- Tải bản sao lưu `.db` từ giao diện.
- Khóa đăng nhập theo IP.
- CSP bỏ `unsafe-inline`.
- Rate-limit `/api/state`.
- Ẩn mục Xóa vị.
- Server kiểm ngày.
- Cache giao diện để mở khi mất mạng.
- Hộp xác nhận kiểu trình duyệt.
- Host so sánh phân biệt hoa/thường.
- Request không Origin (đã có `SameSite=Lax` + `Sec-Fetch-Site`).
- `sanitize` cắt tên dài vs server từ chối.
- `ts=0`.
- `MAX_INLINE` đếm ký tự.
- Ký tự bidi trong tên thiết bị.
- Log kích thước PUT.

## 5b. Chờ gộp bản sau
- Lỗi 500 trả `err.message` thô (`server.js` ~735): trả câu chung cho 5xx, giữ message cho 4xx. Chưa cần báo lại.

## 6. Mẫu báo cáo
- Mỗi mục xếp P1 / P2 / P3, kèm `file:dòng` và cách tái hiện.
- Mục đã có ở bản báo cáo trước thì ghi "lặp".
- Lỗi đã xử lý: tra `BAO-CAO-REVIEW.md` trước khi báo.
