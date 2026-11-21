# Quản Lý Kho — bản local (Node + SQLite, chạy trên Mac mini)

Repo này là **bản chạy local** của app Quản Lý Kho: server Node 22 (Express +
better-sqlite3), dữ liệu là file SQLite trên ổ cứng. Xem `README.md` (tổng quan, quy ước tiền/tồn kho),
`README-LOCAL.md` (vận hành) và `CHANGELOG.md` (lịch sử thay đổi).

## Vị trí chạy (cập nhật 19/11/2026)
- Hub chạy trên **Mac mini M1** `192.168.2.46`: Node 22 (LaunchDaemon `vn.kho.server`, cổng 8787) + Caddy (HTTPS 443, `~/kho/Caddyfile.mac`), **không Docker**.
  Mã `~/kho/quan-ly-kho-local` (git, remote `origin`, đứng ở thẻ `vX.Y.Z`), dữ liệu `~/kho/data` (`app.db`, `auth.db`, `backups/`, `luu-tru/`), log `~/kho/logs/`.
- Sao lưu 19:00 hằng ngày: `~/kho/sao-luu.sh` (LaunchAgent `vn.kho.saoluu`) chép sang Google Drive `Kho-sao-luu` (cần Drive mở khi đăng nhập). Log phải kết thúc "xong", không CẢNH BÁO.
- Windows (`192.168.2.47`) chỉ để phát triển: mã `G:\quan-ly-kho-local`, app Tauri `G:\quan-ly-kho-tauri`, app Rust+GPUI `G:\quan-ly-kho-gpui`. Docker kho và `G:\...\data` + volume `caddy_data` là **bản lùi đóng băng từ 16/11/2026**: đừng sửa, đừng bật cùng lúc với Mac.
- Mac: `pmset sleep 0`, `autorestart 1`, FileVault tắt (để hub tự lên sau khi mất điện), tường lửa bật (Caddy được phép). Node Homebrew mặc định (26) hỏng: mọi lệnh `npm`/`node` dùng `PATH=/opt/homebrew/opt/node@22/bin:$PATH`.
- Thiết bị: iPhone (PWA) qua `https://192.168.2.46`; app Tauri trên Windows tải giao diện từ hub (`html.desktop`); PC chủ cũ dùng `https://localhost` đã không còn tới được hub.

Kính: người dùng chốt 16/11/2026 giữ 4 phần tử `backdrop-filter` (header, thanh chân, toast, nền hộp thoại), vượt mốc ≤ 2 của báo cáo kính có chủ ý; cờ `?glass=0` tắt hết. Đo FPS iPhone 14 Pro (Safari, tab Lịch sử): mặc định 58, `?glass=0` 57, không khác biệt đáng kể. Từ 2.23.0 giao diện mặc định phẳng mờ, công tắc "Hiệu ứng kính" mặc định tắt.

## Kiến trúc
- `server.js` — Express + better-sqlite3, nghe `0.0.0.0:8787`. API `GET/PUT /api/state`, `GET /api/backups`, `GET /healthz`. Tiền lưu bằng đồng nguyên, `moneyUnit: "dong"`. Backup mỗi ngày (`VACUUM INTO`) trước lần ghi đầu tiên trong ngày, và bản `truoc-ghi-de` trước mỗi `X-Force`.
- `src/page.js` — toàn bộ HTML + CSS + JS client (nhúng inline), cả điện thoại lẫn desktop (`html.desktop`: app Tauri, hoặc PWA standalone rộng ≥ 900). Ô nhập là nghìn đồng; `kToDong` / `kInput` đổi ở biên.
- Push qua remote `origin` (trên Mac) / `origin-local` (trên Windows), nhánh `main`; repo Worker `quan-ly-kho` để nguyên, không push. Nhiều thiết bị cùng dùng; đồng bộ theo snapshot, `X-Base-Updated` sai thì máy chủ trả 409/428, không tự ghi đè.
- Quy ước đầy đủ: `README.md` mục Phạm vi và mục Logic cốt lõi.
- `auth.js` + `data/auth.db` — thiết bị được duyệt; cookie `qlk_dev_*`; băm SHA-256; tối đa 2 thiết bị chủ. `auth.db` được `sao-luu.sh` sao lưu (bằng `sqlite3 .backup`). Mã thiết lập in ra stdout, vào `~/kho/logs/server.out.log`; coi là bí mật.
- `pwa.js` — manifest, icon PNG (`src/icons/`), font `src/inter-vi.woff2`, sw.js passthrough (không cache); các đường này công khai GET/HEAD trong PUBLIC của `auth.js`; CSP của "/" có manifest-src/worker-src 'self'.
- Test: `tests/client.test.mjs` (client, chạy trên máy), `tests/server.test.mjs` và `tests/auth*.test.mjs` (cần better-sqlite3, Node 22; CI chạy trong Docker). `npm run lint` kiểm cú pháp. Chạy test trên Windows/CI, không chạy trên hub.
- Công cụ: `tools/kiem-tra-ngay.mjs`, `tools/doi-ngay-don.mjs`, `tools/kiem-cu-phap.mjs`, `scripts/lint-client.mjs`, `scripts/auth-reset.mjs`.
- Docker (`Dockerfile`, `docker-compose.yml`, `Caddyfile`) chỉ còn là bản lùi và để CI chạy test server; hub thật không dùng.
- Phiên bản hiện tại: 2.38.0. `BAO-CAO-REVIEW.md` — lỗi reviewer đã báo, đã sửa/không sửa và lý do; tra trước khi báo hoặc sửa lỗi tương tự.
- App desktop Rust+GPUI (`G:\quan-ly-kho-gpui`) dùng chung schema SQLite, chỉ-đọc trên bản chép của `app.db`; không đụng `data/` từ app đó khi chưa có duyệt. Chuẩn đối chiếu giao diện desktop là app GPUI thật, không phải ảnh mô phỏng.

## Vùng nhạy cảm
Sửa xong phải chạy test: logic tiền, tồn kho, đồng bộ
(`sanitize`, `validateState`, `allocateRemedyByCost`, `pushState`/`pullState`, `checkLimits`, `auth.js`).
Sau khi sửa, phải có phá thử (mutation) chứng minh test bắt được lỗi.

## Triển khai (Mac, không Docker)
Chỉ triển khai khi có cả "duyệt triển khai" của Người duyệt và "bật" của người dùng. Test chạy trên Windows/CI trước; Mac chỉ nhận mã đã xanh và đã gắn thẻ.
- Windows: `git tag vX.Y.Z <hash>`, `git push origin-local local-sqlite:main`, `git push origin-local vX.Y.Z` (người dùng tự chạy).
- Mac (Người làm; người dùng nhập `sudo`), trong `~/kho/quan-ly-kho-local`:
  1. `git rev-parse --short HEAD > ~/kho/truoc-khi-bat.txt` (đường lui);
  2. `~/kho/sao-luu.sh` (phải ra "xong", không CẢNH BÁO);
  3. `git fetch origin --tags`, kiểm thông điệp thẻ và số commit `git rev-list --count <thẻ cũ>..<thẻ mới>` phải khớp danh sách commit đã được Người duyệt duyệt (một đợt có thể gồm nhiều commit; đối chiếu `git log --oneline <thẻ cũ>..<thẻ mới>`), khác thì dừng và hỏi; rồi `git checkout --detach vX.Y.Z`;
  4. `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm ci --omit=dev`;
  5. `sudo launchctl kickstart -k system/vn.kho.server` (lỗi `Input/output error` thì chờ vài giây rồi thử lại);
  6. kiểm: `healthz` ok ở `127.0.0.1:8787` và `https://192.168.2.46`, `package.json` đúng version, `pragma integrity_check` ok, số sản phẩm không đổi, `/` chưa đăng nhập trả 401, `~/kho/logs/server.err.log` không lỗi mới.
- Đường lui: `git checkout --detach $(cat ~/kho/truoc-khi-bat.txt)`, `npm ci --omit=dev`, `kickstart`. `app.db` hỏng: `sudo launchctl bootout system/vn.kho.server`, chép bản mới nhất ở `~/kho/data/backups/` thành `app.db` (xóa `-wal`/`-shm`), `sudo launchctl bootstrap system /Library/LaunchDaemons/vn.kho.server.plist`.
- Cấm: chạy Docker kho trên Windows cùng lúc; sửa `Caddyfile` trong repo; `rm -rf ~/kho/data`; `git clean -fdx` trong repo; chạy `auth-reset` khi không được yêu cầu.
- Sau triển khai Giám sát (Haiku) kiểm lại. Báo cáo của Người làm ≤ 8 dòng, kèm hash trước/sau và "đã tự kiểm 3 câu".

## Dữ liệu
- Không bao giờ đụng `~/kho/data`, `~/kho/Caddyfile.mac`, `~/kho/caddy-data` (mất CA nội bộ là phải cài lại chứng chỉ trên mọi thiết bị).
- Sao lưu: server tự tạo `data/backups/backup-<ngày>.db` (30 bản) + `truoc-ghi-de` (10 bản); `sao-luu.sh` 19:00 chép `backups`, `auth.db`, `caddy-data`, `luu-tru` sang Drive, không dùng `--delete`. Tài khoản Google Drive này DÀNH RIÊNG cho sao lưu kho; không thêm thứ khác vào; rà dung lượng khi `Kho-sao-luu` vượt ~1 GB.
- Không có thông báo khi sao lưu hỏng: đọc dòng cuối `~/kho/logs/sao-luu.log`. Từ 20/11/2026 `sao-luu.sh` bỏ qua `certificates/` và `last_clean.json` của `caddy-data` (cert lá Caddy tự sinh lại), nên cảnh báo cert thuộc root không còn; CA gốc `pki/authorities/local/` vẫn được chép đủ; từ 21/11/2026 cũng bỏ `intermediate.*` trong `pki/authorities/local/` (Caddy gia hạn bằng quyền root, tự sinh lại từ root; `root.*` vẫn được chép); bản gốc script `~/kho/sao-luu.sh.bak-21-11`. Bản cũ của script: `~/kho/sao-luu.sh.bak-19-11`. Nếu LaunchAgent sao lưu báo `Operation not permitted` thì cần Full Disk Access cho `/bin/zsh` và `/usr/bin/rsync`.
- Khôi phục: xem `README-LOCAL.md` mục "Khôi phục từ bản sao lưu". Nên diễn tập trên thư mục thử, cổng khác cổng thật.
- `auth.js`/`scripts/auth-reset.mjs`: mất thiết bị chủ thì đặt lại (xóa `devices` + `invites`, không đụng `app.db`), rồi người dùng tự đọc mã thiết lập trong log và nhập tại `/auth/setup`. Không dán mã vào báo cáo hay chat.
- Người dùng tự giữ: xác thực hai bước Google, mật khẩu riêng, không chia sẻ thư mục, không đăng nhập máy lạ.

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
- **Hiện tại:** bản Windows và Mac đều là **2.37.2** (thẻ `v2.37.2`, commit ea0f28e, triển khai 21/11/2026); thẻ đã push. Trọng điểm: Mac là chuẩn giao diện/nhập liệu; app Mac native + Tauri + PWA phải giống nhau tối đa. Chi tiết từng bản nằm trong `CHANGELOG.md`; kiểm lại hash đường lui trong `~/kho/truoc-khi-bat.txt` trước khi triển khai.
  `migrateMoneyToDong` (server.js) và file `truoc-lam-tron-*.json` có chú thích `XÓA SAU 06/12/2026`: xóa khi bản backup cũ nhất còn đơn vị nghìn đã bị xóa (cần chủ đồng ý).
- Đo giao diện: test hiện tại (2.37.2): client 477 ca (Windows), server 45, auth 45 (trong Docker); xác nhận/tên đơn vẫn dùng `window.confirm/prompt`, chưa thử trong Tauri thật; nút Thoát chưa thử trên iPhone/Tauri thật.
- Chưa làm có chủ ý: Hoàn tác khôi phục, server làm chứng sao lưu, ngày phiếu nhập lùi (P2.4), danh sách thiết bị/Thu hồi/Tạo mã mời ngay trong app desktop (dùng trang `/auth/devices` có sẵn). Sao lưu tự động có thể bị trình duyệt chặn tải im lặng (không phát hiện được).
- App Tauri: exe cài ở `C:\Users\Yellows\AppData\Local\QuanLyKho\`; PWA Edge phải cài từ `https://192.168.2.46`. Tắt app Tauri bằng nút X, không `Stop-Process -Force` (mất cookie thiết bị). Bản exe cũ vẫn dùng được vì giao diện lấy từ hub; hub lùi bản thì giao diện lùi theo.
- Bài học còn hiệu lực:
  - Bàn phím iOS không mô phỏng được, chỉ thử trên iPhone thật; ô nhập đặt trong thanh `fixed` không được focus trực tiếp. Khi gỡ lỗi mở `?kbdebug=1`.
  - CSP `default-src 'none'` từng chặn manifest/SW mà lỗi bị `.catch` nuốt; test tĩnh không bắt được, phải thử trình duyệt thật.
  - Test không được phụ thuộc lịch sử git của repo (CI clone nông); kiểm tab Actions sau mỗi lần push.
  - `saveLocal` khi ghi KEY lỗi thì KHÔNG ghi BASE mới (giữ base cũ để máy chủ trả 409, tránh đè lặng lẽ).
  - Sao lưu 19:00 cần Google Drive đang mở; cảnh báo cert `caddy-data` đã hết từ 20/11/2026 (script bỏ qua `certificates/`).
  - Server từ chối 400/428 thì client hiện "Chưa lưu được: <lý do>" một lần; chưa xóa tờ đơn khi lưu thất bại.
  - Ba đường ghi máy chủ có thể từ chối số liệu ngoài thực tế: `saveRetail` không kiểm `cost`; xóa/giảm đơn bán làm tồn vượt trần; sửa gram đơn thuốc chén làm đơn giá vượt trần. `applyRemedyBalance`/`allocateRemedyByCost` chưa kiểm trần đơn giá khi kg rất nhỏ.
  - Gợi ý đơn vị trong ô số lượng dùng "l" cho lạng (chỉ ở gợi ý). Luật tìm kiếm trọn chữ dùng chung cho gợi ý tên, Kho tồn và Lịch sử (từ 2.27.0).
  - Chưa chạm: sao lưu tự động đè lên thông báo đang hiện (G17); chưa đo FPS với dữ liệu lớn hơn 164 sản phẩm và khi bật Chế độ nguồn điện thấp.
- Xem thử giao diện: sinh trang tĩnh từ `src/page.js` (placeholder như `server.js`, dữ liệu mẫu tự bịa, không dùng dữ liệu thật), mở bằng `.claude/launch.json` (node phục vụ file, cổng 8899) trong trình duyệt của ứng dụng, đo bằng JavaScript (`getBoundingClientRect`) ở 320/375/800/1300px.
- Người dùng dùng chủ yếu iPhone qua `https://192.168.2.46`, và app Tauri trên Windows.
