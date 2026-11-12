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
- Phiên bản hiện tại: 2.15.11.

## Vùng nhạy cảm
Sửa xong phải chạy test: logic tiền, tồn kho, đồng bộ
(`sanitize`, `validateState`, `allocateRemedyByCost`, `pushState`/`pullState`, `checkLimits`, `auth.js`).
Sau khi sửa, phải có phá thử (mutation) chứng minh test bắt được lỗi.

## Triển khai
- Build một lần với `--label org.opencontainers.image.revision=<commit>` (hash commit).
- Thẻ `pre-X.Y.Z` = image đang chạy trước khi bật bản mới.
- Hệ thống chặn Claude chạy `docker tag … :latest` và `docker compose up`, nên NGƯỜI DÙNG tự chạy:
  `docker tag quan-ly-kho:X.Y.Z quan-ly-kho-local-quan-ly-kho:latest` rồi `docker compose up -d --no-build`;
  và ba lệnh git: `git tag vX.Y.Z <hash>`, `git push origin-local local-sqlite:main`, `git push origin-local vX.Y.Z`.
- Sau đó Giám sát (Haiku) kiểm tra sau triển khai.
- Chỉ triển khai khi có cả "duyệt triển khai" của Người duyệt và "bật" của người dùng.
- Cấm `docker compose down -v` (mất chứng chỉ Caddy `caddy_data`).

## Dữ liệu
- Không bao giờ đụng `data/`.
- Sao lưu bằng `robocopy` (không `/MIR`) sang `E:\sao-luu-kho`, do Task Scheduler "SaoLuuKho" thực hiện.

## Vai trò
- **Giám sát** = Haiku (`.claude/agents/giam-sat.md`, chỉ đọc): chạy test/tóm tắt, kiểm sau triển khai, so số đo với ngưỡng, rút gọn log.
- **Người làm** = Sonnet (`.claude/agents/worker.md`): sửa mã, build, viết test.
- **Người duyệt** = phiên chính, mặc định Sonnet: phân tích, lập kế hoạch, giao việc, duyệt. KHÔNG tự viết mã.
- **Opus** chỉ vào "cổng" qua `.claude/agents/auditor.md` (chỉ đọc) khi: (a) chạm logic cốt lõi (tiền, tồn kho, đồng bộ, xác thực);
  (b) Sonnet không chắc; (c) lỗi lặp lại/khó. Việc chỉ giao diện/tài liệu không cần Opus.
- Auditor chạy MỘT lượt cuối trước "duyệt triển khai", chỉ nhận khoảng commit và vùng cần soi; báo cáo ≤15 dòng; sau đó chỉ duyệt lại các lỗi đã báo.
- Worker dán diff/hunk và đầu ra test (file .md); Người duyệt chỉ đọc phần được dán. Đạt → bước sau; chưa đạt → chỉ đạo sửa lại.
- Duyệt giao diện: phải đo bằng số trên trình duyệt trước. Worker không được báo "đã sửa/đã thẳng hàng" khi chưa có số đo hoặc lập luận từ mã.
- Sau mỗi đợt chỉnh giao diện lớn, giao Người làm dọn code chết/thừa (hàm, CSS, id, icon, test cũ): chỉ xóa khi 0 tham chiếu tĩnh và động, nghi ngờ thì ghi lại, giao diện phải đo lại y nguyên.
- Không commit khi test chưa xanh. Thay đổi tiền/tồn kho phải nêu rủi ro trước khi ghi đè, dựa vào backup tự động của server; không mở hai phiên ghi song song.

## Tối ưu hạn mức sử dụng
- Chat mới cho mỗi task; chỉ mang sang kết luận/diff cần thiết (dùng "Ghi chú bàn giao" bên dưới).
- Gửi đúng ngữ cảnh: dán hàm/đoạn diff liên quan, tóm tắt yêu cầu 3–5 dòng; đặc tả dài ghi vào file .md ngoài repo rồi trỏ tới. `src/page.js` rất lớn, không đọc cả file.
- Để Haiku tóm tắt log/test dài thành vài bullet trước khi đưa Sonnet/Opus.
- Gộp các chỉnh sửa nhỏ liên quan vào một lượt Sonnet; cổng Opus như mục Vai trò.
- Worker chỉ trả đoạn đổi (patch ngắn), báo cáo ≤8 dòng; không dump log, không in lại file đã sửa.
- Không chạy lặp bộ test dài nhiều lần khi không cần.
- Mỗi giai đoạn lớn dùng worker mới khi ngữ cảnh đã dài.

## Ghi chú bàn giao (cập nhật mỗi lần triển khai)
- Đang chạy: 2.15.11, commit 441b992, image `quan-ly-kho:2.15.11` (id 985a8974…).
- Đường lui: `quan-ly-kho:pre-2.15.11` = 2.15.10 (id 67037c9e…, commit ab59982); trước nữa `pre-2.15.10` = 2.15.9 (id 43ec6f62…).
- 2.15.11: khi khóa trang, `.top` bị ẩn (visibility); chạm sang ô khác trong thẻ khóa dùng `touchstart` preventDefault + focus preventScroll (người dùng luôn chạm thẳng vào ô, không dùng mũi tên Prev/Next). Nếu iOS không bật bàn phím từ touchstart thì đổi sang touchend. Chưa xác nhận trên iPhone thật.
- Gợi ý tên (2.15.9): chỉ hiện khi gõ trọn một từ của tên (không phân biệt hoa/dấu/đ), mọi thiết bị, khung tối đa 3 mục cuộn trong; ô lọc Kho tồn/Lịch sử giữ luật cũ. Focus lập trình dùng preventScroll.
- Giao diện điện thoại (2.15.3–2.15.10): chân tờ ghi là thanh `fixed` ở đáy, ẩn khi gõ; khi nhập, trang bị KHÓA (body fixed, đỉnh thẻ cách mép trên 8px; chỉ `kbUnlock` gọi `window.scrollTo`); tờ ghi gọn 2 vị mới nhất (cuộn mượt kiểu guồng), tự co theo `visualViewport.height`. Số đo thật iPhone 14 Pro: khi bàn phím hiện vvH ≈ 357 (innerHeight 695), thanh phụ Prev/Next và viên địa chỉ Safari nằm DƯỚI đáy vv. Mở với `?kbdebug=1` có dòng chữ gỡ lỗi (vvH, vvTop, savedY, lock, lý do). Bàn phím iOS không mô phỏng được, chỉ thử trên iPhone thật; chưa xác nhận 2.15.10 trên máy thật.
- Tab PC có icon cùng màu icon thẻ (2.15.8, 2.15.10). Đã dọn code chết (2.15.7); lặp lại sau mỗi đợt chỉnh giao diện lớn.
- 2.15.x chưa thử trên iPhone thật: sticky chân tờ ghi + bàn phím, vùng an toàn, nút "Tải lại" (chỉ hiện khi chạy từ màn hình chính), bo góc đáy tờ ghi, gợi ý có đè chân không. Đã bỏ chức năng "Gộp đơn thuốc lẻ cũ".
- Nhánh làm việc `local-sqlite` = `origin-local/main`.
- Chờ/biết chưa sửa: sao lưu tự động đè lên thông báo đang hiện (G17); Dockerfile còn công cụ build và chạy bằng root.
- Ba đường ghi máy chủ có thể từ chối số liệu ngoài thực tế: `saveRetail` không kiểm `cost`; xóa/giảm đơn bán làm tồn vượt trần; sửa gram đơn thuốc chén làm đơn giá vượt trần.
- `applyRemedyBalance`/`allocateRemedyByCost` chưa kiểm trần đơn giá khi kg rất nhỏ.
- Gợi ý đơn vị trong ô số lượng dùng "l" cho lạng (chỉ ở gợi ý); phần còn lại của app vẫn ghi "lạng".
- Xem thử giao diện: sinh trang tĩnh từ `src/page.js` (placeholder như `server.js`, dữ liệu mẫu tự bịa, không dùng dữ liệu thật),
  mở bằng `.claude/launch.json` (node phục vụ file, cổng 8899) trong trình duyệt của ứng dụng, đo bằng JavaScript (`getBoundingClientRect`) ở 320/375/800/1300px, tối và sáng.
- Người dùng dùng chủ yếu iPhone qua https://192.168.2.46; PC chủ qua https://localhost.
