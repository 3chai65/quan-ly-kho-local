# Quản Lý Kho — bản local (Docker + SQLite)

Repo này là **bản chạy local** của app Quản Lý Kho: server Node (Express +
better-sqlite3) chạy trong Docker, dữ liệu là file SQLite trên ổ cứng. Xem
`README-LOCAL.md` để chạy và `CHANGELOG.md` cho lịch sử thay đổi.

## Kiến trúc
- `server.js` — Express + better-sqlite3. API `GET/PUT /api/state`. Tiền lưu bằng
  đồng nguyên, `moneyUnit: "dong"`. Backup mỗi ngày (`VACUUM INTO`) trước lần ghi
  đầu tiên trong ngày.
- `src/page.js` — toàn bộ HTML + CSS + JS client (nhúng inline). Ô nhập là nghìn
  đồng; `kToDong` / `kInput` đổi ở biên.
- Repo Worker `quan-ly-kho` (remote `origin`) để nguyên. Push bản này qua
  `origin-local`, nhánh `main`. Nhiều thiết bị cùng dùng; đồng bộ theo snapshot, `X-Base-Updated` sai thì máy chủ trả 409/428, không tự ghi đè.
- Quy ước đầy đủ: `README.md` mục Phạm vi và mục Tiền.
- `tests/client.test.mjs` — test logic client (tiền, tồn kho, đồng bộ), chạy trên máy.
- `tests/server.test.mjs` — test `server.js` thật qua HTTP, chạy trong Docker.
- `auth.js` + `data/auth.db` — thiết bị được duyệt; cookie `qlk_dev_*`; băm SHA-256; tối đa 2 thiết bị chủ.
- `Caddyfile` + dịch vụ `caddy` — HTTPS cổng 443; ứng dụng chỉ nghe `127.0.0.1:8787`.
- `tests/auth*.test.mjs` — test xác thực, chạy trong Docker.
- `tools/kiem-tra-ngay.mjs`, `tools/doi-ngay-don.mjs`, `scripts/auth-reset.mjs`.
- Phiên bản hiện tại: 2.13.2.

## Vùng nhạy cảm
Sửa xong phải chạy test: logic tiền, tồn kho, đồng bộ
(`sanitize`, `validateState`, `allocateRemedyByCost`, `pushState`/`pullState`, `checkLimits`, `auth.js`).
Sau khi sửa, phải có phá thử (mutation) chứng minh test bắt được lỗi.

## Triển khai
- Build một lần với `--label org.opencontainers.image.revision=<commit>`.
- Chạy `docker compose up -d --no-build`.
- Trước mỗi bản gắn thẻ `pre-X.Y.Z`: gắn thẻ đó vào image đang chạy.
- Cấm `docker compose down -v` (mất chứng chỉ Caddy `caddy_data`).
- Chỉ triển khai khi có cả "duyệt triển khai" và "bật".

## Dữ liệu
- Không bao giờ đụng `data/`.
- Sao lưu bằng `robocopy` (không `/MIR`) sang `E:\sao-luu-kho`, do Task Scheduler "SaoLuuKho" thực hiện.

## Quy trình Duyệt → Làm

- **Người duyệt** (phiên chat riêng của người dùng, không xem được repo): phân tích yêu cầu, lập kế hoạch,
  giao việc cho subagent `worker` (Haiku, xem `.claude/agents/worker.md`).
  Người duyệt KHÔNG tự viết code, chỉ duyệt kế hoạch và kết quả.
- Worker làm theo từng chỉ đạo; xong mỗi bước, Người duyệt kiểm tra:
  1. Worker dán diff/hunk và đầu ra test vào file .md; Người duyệt chỉ đọc những gì được dán.
  2. Chạy test: `tests/client.test.mjs` trên host; `tests/server.test.mjs` trong Docker.
  3. Đạt → duyệt tiếp bước sau; chưa đạt → viết chỉ đạo sửa lại cho worker.
- Không merge/commit khi test chưa xanh. Thay đổi liên quan tiền/tồn kho
  bắt buộc nêu rõ rủi ro trước khi ghi đè, ưu tiên dựa vào backup tự động của server.
- Nhiều thiết bị cùng dùng; đồng bộ theo snapshot, `X-Base-Updated` sai thì máy chủ trả 409/428, không tự ghi đè; không mở hai phiên ghi song song.
- Kết thúc task: Người duyệt tổng kết thay đổi + trạng thái test.

### Quy trình 3 vai

- Worker (Haiku) làm theo chỉ đạo; Người duyệt duyệt từng bước.
- Khi thay đổi chạm Vùng nhạy cảm, Auditor (Opus, `.claude/agents/auditor.md`, chỉ đọc) chạy MỘT lượt cuối trước "duyệt triển khai", chỉ nhận khoảng commit và danh sách vùng cần soi.
- Lỗi nghiêm trọng/nên sửa: Người duyệt viết chỉ đạo cho Worker sửa; Auditor chỉ duyệt lại các lỗi đã báo.
- Không chạy Auditor cho thay đổi chỉ tài liệu hay thay đổi nhỏ ngoài vùng nhạy cảm.
- Báo cáo Auditor ≤15 dòng; chi tiết ghi vào file .md do Người duyệt chỉ định.

## Tối ưu hạn mức sử dụng

- Mỗi task = một phiên/cuộc chat riêng; không nhồi cả buổi vào một phiên dài.
  Phiên dài thì chủ động `/compact` trước khi tràn context.
- Người duyệt chỉ đọc phần liên quan: dùng Grep/Glob tìm đúng chỗ, đọc diff thay vì
  đọc lại cả file; đặc biệt `src/page.js` rất lớn — tuyệt đối không đọc toàn bộ nhiều lần.
- Worker báo cáo ngắn gọn (file đổi gì, test pass/fail); không dump log dài,
  không in lại nội dung file đã sửa.
- Chia task thành các bước nhỏ, duyệt xong bước nào mới giao bước sau;
  không bắt agent chạy vòng lặp không điểm dừng.
- Việc máy móc (đổi chữ, format, rename, chạy lại build/test) luôn giao worker Haiku;
  Sonnet chỉ dùng cho phân tích, quyết định và duyệt.
- Không đọc lại file đã đọc trong cùng phiên khi không cần thiết;
  tin vào diff và báo cáo thay vì xác minh lặp lại.
- Tắt tính năng/chế độ không cần (model mạnh không cần thiết, tự động hóa dài)
  để tránh đốt quota oan.
- Báo cáo ≤15 dòng; nội dung dành cho Người duyệt đặt trong file .md nhỏ.
