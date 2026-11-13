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
- `Caddyfile` + dịch vụ `caddy` — HTTPS cổng 443; ứng dụng nghe `0.0.0.0` trong container, docker-compose chỉ mở cổng ra `127.0.0.1:8787` (chạy `npm start` trực tiếp thì mở ra LAN, không dùng cách đó).
- `tests/auth*.test.mjs` — test xác thực, chạy trong Docker.
- `tools/kiem-tra-ngay.mjs`, `tools/doi-ngay-don.mjs`, `scripts/auth-reset.mjs`.
- `pwa.js` — manifest, icon PNG sinh bằng mã, sw.js passthrough (không cache); các đường này công khai GET/HEAD trong PUBLIC của `auth.js`; CSP của "/" có manifest-src/worker-src 'self'.
- Phiên bản hiện tại: 2.16.0.

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
- Đã diễn tập khôi phục 12/11/2026 (chép backup thành app.db trong thư mục thử, chạy image, healthz 200, integrity_check ok): hướng dẫn ở `README-LOCAL.md` mục "Khôi phục từ bản sao lưu". Phát hiện: `E:` (đĩa WD) và `G:` (NVMe) khác đĩa nhưng cùng máy; `auth.db` KHÔNG được sao lưu (mất thì thiết lập lại thiết bị, dữ liệu kho không mất). ĐÃ XỬ LÝ 12/11/2026 (người dùng tự cấu hình, giám sát kiểm 6/6 đạt): SaoLuuKho chạy HẰNG NGÀY 19:00 (đổi từ 21:00 ngày 12/11/2026, giám sát/đọc lại lịch đã khớp), LogonType Interactive; `E:\sao-luu-kho\sao-luu.cmd` có 4 lệnh robocopy (2 từ `G:\...\data\backups`, `\luu-tru` sang `E:`, 2 từ `E:` sang Google Drive `J:\My Drive\Kho-sao-luu\backups` và `\luu-tru`, đường dẫn có ngoặc kép, không `/MIR`); sang Drive 17 + 13 file, 0 lỗi. Cần Google Drive cho máy tính đang chạy và ổ `J:` có mặt. Đã diễn tập khôi phục từ bản trên Drive (`J:`) 12/11/2026: SHA256 khớp `E:`, image 2.15.19 lên được, healthz 200, integrity_check ok, money_unit dong (163 sản phẩm, 660 giao dịch, 14 đơn thuốc, 322 vị); lưu ý file lấy từ ổ `J:` cục bộ của Drive (0,01 giây), chưa chứng minh bản trên đám mây tải về được từ máy khác. Đã kiểm trên web drive.google.com (12/11/2026): thư mục `Kho-sao-luu/backups` có đủ file. Tài khoản Google Drive này DÀNH RIÊNG cho sao lưu kho (người dùng xác nhận 12/11/2026, 15 GB; ~1 MB/ngày, không dọn tự động; các file có sẵn trong `My Drive` như FBReader/Google AI Studio/violentmonkey không phải của sao lưu, không đụng): không đề nghị thêm thứ khác vào tài khoản này; rà dung lượng khi `Kho-sao-luu` vượt ~1 GB (khi đó thêm quy tắc giữ N ngày). Tác vụ tự chạy bù khi lỡ giờ (StartWhenAvailable bật), Google Drive tự mở cùng Windows (HKCU Run), nếu Drive chưa sẵn thì bước sang Drive lỗi nhưng `E:` đã xong, lần sau chép bù (`/XO`). Không có thông báo khi sao lưu hỏng (có thể thêm file `trang-thai.txt` ghi OK/LỖI vào `sao-luu.cmd` nếu cần). Người dùng tự giữ: xác thực hai bước, mật khẩu riêng, không chia sẻ thư mục, không đăng nhập máy lạ.

## Vai trò
- **Giám sát** = Haiku (`.claude/agents/giam-sat.md`, chỉ đọc): chạy test/tóm tắt, kiểm sau triển khai, so số đo với ngưỡng, rút gọn log.
- **Người làm** = Sonnet (`.claude/agents/worker.md`): sửa mã, build, viết test. Trước khi viết hay thêm mã/CSS/id/test phải tự hỏi: (1) có thật sự cần thiết không? (2) đã tồn tại sẵn trong dự án chưa (Grep, dùng lại)? (3) rút gọn thành một dòng được không? Báo cáo ghi 1 dòng "đã tự kiểm 3 câu: …"; Người duyệt trả lại diff thêm khối mới mà không đạt 3 câu.
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
- Đang chạy: 2.16.0, commit 2627fb6, image `quan-ly-kho:2.16.0` (id 223d52b8…), Giám sát sau triển khai 5/5 đạt (13/11/2026). Đường lui: `quan-ly-kho:pre-2.16.0` = 2.15.21 (id 07fade33…, commit 8f391c5).
- 2.16.0: PWA. Đã xác nhận cài được trên Windows Edge (13/11/2026, "App installed", cửa sổ riêng); iPhone người dùng vẫn dùng biểu tượng cũ, chưa thử Thêm vào MH chính bản mới; Mac chưa thử. Bài học: CSP default-src 'none' chặn manifest/SW và lỗi bị .catch nuốt, test tĩnh không bắt được; Auditor bắt bằng Edge headless. Icon chưa ai xem trên iPhone; fetch handler rỗng trong sw.js giữ nguyên (cảnh báo no-op của Chrome chưa đo). Việc nhỏ chờ: thêm `*.out` vào .gitignore.
- Trước đó đang chạy: 2.15.21, commit 8f391c5, image `quan-ly-kho:2.15.21` (id 07fade33…), Giám sát sau triển khai 5/5 đạt (13/11/2026). Đường lui: `quan-ly-kho:pre-2.15.21` = 2.15.20 (id ab6f0e8e…, commit 788f2f3).
- 2.15.21: A1–A5 (hẹn gửi lại không giãn khi bận, delOrder kiểm trước hỏi sau, focus saveTxEdit, A4/A5 đổi "mới nhất" theo ngày rồi giờ ghi, cùng cách tính giá vốn `lastImport`) + dọn mã chết (xem CHANGELOG). Việc hoãn: vòng 19 (cho-worker-19), B9, B11 phần còn lại, `nameKey` ở client (~dòng 1760), dọn vòng kiểm trong saveNhap (~4019–4020), ca test A1 chưa kiểm fetch được gọi.
- Trước đó đang chạy: 2.15.20, commit 788f2f3, image `quan-ly-kho:2.15.20` (id ab6f0e8e…). Giám sát sau triển khai 7/7 đạt (12/11/2026). Đường lui: `quan-ly-kho:pre-2.15.20` = 2.15.19 (id 8ba802fb…, commit 045cb44); `pre-2.15.19` = 2.15.18 (id 6cd4178e…, commit 845be1e).
- 2.15.20 (sửa từ báo cáo review ngoài 12/11/2026, đã đối chiếu mã): `delOrder` cộng dồn qty NHAP theo vị trước khi kiểm tồn âm (đơn nhập 2 dòng cùng vị làm tồn âm); `openOrder` chặn đơn không còn; `saveLocal` ghi KEY/DIRTY/BASE độc lập nhưng khi ghi KEY lỗi thì KHÔNG ghi BASE (giữ base cũ để máy chủ trả 409, tránh đè lặng lẽ) và chỉ ghi DIRTY='1' khi dirty; dòng log cổng cho đúng. Bài học: bản sửa đầu của worker ghi BASE mới khi KEY lỗi, Auditor bắt được. Báo cáo ngoài còn mục chưa làm (đánh giá không cần): BUG-05 trần ~22k giao dịch (hiện 660), 06 Playwright, 07 CSP/HSTS, 08 err.message, 09 tải backup, 10 bàn phím, 11 Caddyfile IP, 12 confirm/đơn vị biểu đồ. Trước đó: `quan-ly-kho:pre-2.15.19` = 2.15.18 (id 6cd4178e…, commit 845be1e); `pre-2.15.18` = 2.15.17 (id 344fc595…, commit 3951ea7); `pre-2.15.17` = 2.15.16 (id 7b1d3f86…, commit 4348495); `pre-2.15.16` = 2.15.15 (id 6c2b04c1…, commit d22d096).
- 2.15.19 (không đổi hành vi): dọn code chết đợt 2.15.12–2.15.18 (chỉ 3 mục nhỏ; rà 0 hàm/CSS/id/icon mồ côi; đo giao diện trước/sau 0 khác biệt) + thêm test (log từ chối 400 JSON/header, 200 không log; 5xx/mạng không toast; Hủy tên trùng). Đã nghi nhưng giữ: `class="cg-name"` trên 6 `<col>`, `html{scroll-padding-bottom:230px}`, `tr[data-pid]{scroll-margin-*}`, selector thead `#remedyNote` chồng nhau, khai báo CSS trùng bộ chọn (`.chart-tip`, `.tab__ic`, `.note__row--aux/--btns`). Chưa làm: không xóa tờ đơn khi lưu thất bại (chờ gặp "Chưa lưu được" thật).
- 2.15.17 (ĐÃ XÁC NHẬN trên iPhone 12/11/2026): bỏ "Sao chép đơn" và khả năng đổi tên đơn thuốc chén (chọn đơn có sẵn: không có ô tên, còn 3 nút Xóa đơn / Cập nhật đơn / Bán đơn; Cập nhật giữ tên cũ). Lưu đơn mới trùng tên (không phân biệt hoa/thường, khoảng trắng) → hộp xác nhận `Đã có đơn "<tên>". Cập nhật đơn này bằng nội dung đang nhập?`. Cách người dùng dùng chính: Đơn mới → gõ hết đơn → Lưu đơn (nếu muốn dùng lại), không thì để tên mặc định. Ca "tên trùng đơn khác khi đã chọn đơn" không còn tồn tại.
- 2.15.18 (ĐÃ XÁC NHẬN trên iPhone 12/11/2026: mọi thứ ổn; số đo ban đầu chỉ mô phỏng Edge): tờ ghi gọn luôn chừa chỗ 2 dòng sau "+" khi dòng nhập trống (compactAvail không trừ ENTRY_BLOCK_H khi pendH=0); ẩn thead trong chế độ gọn; dòng nhập thẳng cột STT/tên với dòng ghi. Cần thử trên iPhone: sau "+" con trỏ ở ô tên thấy 2 dòng; khi ô SL focus có thể co xuống 1 dòng (chưa biết vvH thật khi focus ô tên so với ô SL: nếu vẫn sai, lấy số bằng ?kbdebug=1). Phá thử CSS chưa có (chỉ test chuỗi tĩnh).
- 2.15.16: (a) khi máy chủ từ chối PUT /api/state (400/428) client hiện toast "Chưa lưu được: <lý do>" một lần; server ghi `console.warn` một dòng (giờ, mã, lý do cố định, không dữ liệu/tên/tiền/cookie). 401/409/5xx/mất mạng không đổi. Chưa làm: không xóa tờ đơn khi lưu thất bại (đổi luồng đồng bộ, rủi ro hơn). (b) iPhone: ô tên đơn trống khi cập nhật đơn có sẵn cũng hỏi bằng `prompt`. Auditor đã duyệt. Chưa sửa (nit): nhánh "tên trùng đơn khác" trong `savePreset` (~dòng 2672) vẫn `nameInp.focus()` trên điện thoại nên ẩn thanh chân; test còn thiếu: log 400 JSON hỏng/400 header sai, 5xx và lỗi mạng không toast, Hủy ở confirm đổi tên. CHANGELOG/README-LOCAL đã sửa hướng dẫn chown (PowerShell).
- 2.15.15: iPhone, "Lưu đơn" thuốc chén khi chưa có tên hỏi tên bằng `prompt` (ô `#remedyName` nằm trong thanh chân fixed, focus vào làm thanh bị ẩn nên trước đó không lưu được). ĐÃ XÁC NHẬN trên iPhone (12/11/2026). Còn hiếm: chọn đơn có sẵn, xóa trống ô tên rồi Lưu vẫn có thể bị ẩn thanh (chưa sửa). Bài học: ô nhập đặt trong thanh `fixed` không được focus trực tiếp trên iPhone.
- 2.15.14: Dockerfile hai giai đoạn (image cuối không có python3/make/g++), chạy bằng `USER node` (uid 1000). `data/` đã `chown -R 1000:1000` một lần (12/11/2026); nếu khôi phục data/ từ backup robocopy mà file thuộc root thì chạy lại lệnh chown (PowerShell, container dừng). Đường lui: `quan-ly-kho:pre-2.15.14` = 2.15.13 (id 55cc1714…, root vẫn ghi được file uid 1000). Tài liệu còn 2 chỗ nhỏ cần sửa đợt sau: CHANGELOG.md:12 và README-LOCAL.md:31 (ghi lệnh chown chạy trong PowerShell; Windows có thể không bắt buộc, vẫn nên chạy). Chưa thử đăng nhập trên iPhone sau khi bật.
- 2.15.12 (dọn code chết CSS) + 2.15.13 (icon tab PC cùng một màu xanh lá `--tab-ico`, tab chọn có chip nền `--brand-soft`) triển khai chung; chưa xem trên màn hình thật, nếu tab chọn ở giao diện sáng chưa đủ nổi (tương phản 4,61) thì đậm hơn.
- Trước nữa: `quan-ly-kho:pre-2.15.13` = 2.15.11 (id 985a8974…, commit 441b992); trước nữa `pre-2.15.11` = 2.15.10 (id 67037c9e…, commit ab59982); `pre-2.15.10` = 2.15.9 (id 43ec6f62…).
- 2.15.11: khi khóa trang, `.top` bị ẩn (visibility); chạm sang ô khác trong thẻ khóa dùng `touchstart` preventDefault + focus preventScroll (người dùng luôn chạm thẳng vào ô, không dùng mũi tên Prev/Next). ĐÃ XÁC NHẬN trên iPhone 14 Pro (12/11/2026): bàn phím vẫn bật, vvTop giữ 0→0 ở mọi sự kiện, khung đứng yên khi nhập tên/SL/thành tiền, thanh thẻ không bị che. Nếu sau này iOS không bật bàn phím từ touchstart thì đổi sang touchend.
- Gợi ý tên (2.15.9): chỉ hiện khi gõ trọn một từ của tên (không phân biệt hoa/dấu/đ), mọi thiết bị, khung tối đa 3 mục cuộn trong; ô lọc Kho tồn/Lịch sử giữ luật cũ. Focus lập trình dùng preventScroll.
- Giao diện điện thoại (2.15.3–2.15.10): chân tờ ghi là thanh `fixed` ở đáy, ẩn khi gõ; khi nhập, trang bị KHÓA (body fixed, đỉnh thẻ cách mép trên 8px; chỉ `kbUnlock` gọi `window.scrollTo`); tờ ghi gọn 2 vị mới nhất (cuộn mượt kiểu guồng), tự co theo `visualViewport.height`. Số đo thật iPhone 14 Pro: khi bàn phím hiện vvH ≈ 357 (innerHeight 695), thanh phụ Prev/Next và viên địa chỉ Safari nằm DƯỚI đáy vv. Mở với `?kbdebug=1` có dòng chữ gỡ lỗi (vvH, vvTop, savedY, lock, lý do). Bàn phím iOS không mô phỏng được, chỉ thử trên iPhone thật; chưa xác nhận 2.15.10 trên máy thật.
- Tab PC có icon cùng màu icon thẻ (2.15.8, 2.15.10). Đã dọn code chết (2.15.7); lặp lại sau mỗi đợt chỉnh giao diện lớn.
- 2.15.x chưa thử trên iPhone thật: sticky chân tờ ghi + bàn phím, vùng an toàn, nút "Tải lại" (chỉ hiện khi chạy từ màn hình chính), bo góc đáy tờ ghi, gợi ý có đè chân không. Đã bỏ chức năng "Gộp đơn thuốc lẻ cũ".
- CI GitHub (`.github/workflows/ci.yml`: test-client chạy `node --test tests/client.test.mjs`, test-server build image rồi chạy `npm test` và `npm run test:auth`): đỏ liên tục từ #34 (commit fddd039) tới #68 vì test "2.10.0 id thẻ và data-action không đổi so với 1023b40" gọi `git show 1023b40:src/page.js`, mà `actions/checkout` mặc định clone nông (không có commit đó). Đã sửa 12/11/2026 (commit 50103ab: thiếu commit/object → dùng danh sách chốt sẵn); CI #69 xanh. Bài học: test không được phụ thuộc lịch sử git của kho; khi thêm test mới, mô phỏng clone nông (`git clone --depth 1`, container node:22 có git) hoặc kiểm CI sau khi push; sau mỗi lần push nên xem tab Actions có xanh không (bản triển khai chạy từ image local, không bị CI ảnh hưởng).
- Nhánh làm việc `local-sqlite` = `origin-local/main`.
- Chờ/biết chưa sửa: sao lưu tự động đè lên thông báo đang hiện (G17); Dockerfile còn công cụ build và chạy bằng root.
- Ba đường ghi máy chủ có thể từ chối số liệu ngoài thực tế: `saveRetail` không kiểm `cost`; xóa/giảm đơn bán làm tồn vượt trần; sửa gram đơn thuốc chén làm đơn giá vượt trần.
- `applyRemedyBalance`/`allocateRemedyByCost` chưa kiểm trần đơn giá khi kg rất nhỏ.
- Gợi ý đơn vị trong ô số lượng dùng "l" cho lạng (chỉ ở gợi ý); phần còn lại của app vẫn ghi "lạng".
- Xem thử giao diện: sinh trang tĩnh từ `src/page.js` (placeholder như `server.js`, dữ liệu mẫu tự bịa, không dùng dữ liệu thật),
  mở bằng `.claude/launch.json` (node phục vụ file, cổng 8899) trong trình duyệt của ứng dụng, đo bằng JavaScript (`getBoundingClientRect`) ở 320/375/800/1300px, tối và sáng.
- Người dùng dùng chủ yếu iPhone qua https://192.168.2.46; PC chủ qua https://localhost.
