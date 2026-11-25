# Quản Lý Kho — bản local (Node 22 + Express + better-sqlite3, hub trên Mac mini)
Quy ước tiền/tồn: `README.md` (mục Phạm vi, Logic cốt lõi). Vận hành: `README-LOCAL.md`. Lịch sử: `CHANGELOG.md`.
Lỗi reviewer đã xử lý: `BAO-CAO-REVIEW.md` — tra trước khi báo/sửa lỗi tương tự.

## Đọc thêm khi cần
- Triển khai, đường lui, vận hành Mac, sao lưu, khôi phục → BẮT BUỘC đọc `docs/deploy.md` trước.
- Đầu mỗi task mới, việc giao diện, Tauri/PWA → đọc `docs/handover.md`.
- Trạng thái máy bên kia: đọc kênh theo đường dẫn trong ~/.claude/CLAUDE.md của máy này.
- Reviewer (soi repo, mẫu báo cáo, các việc đã quyết không làm) → `docs/review.md`.

## Môi trường
- Hub: Mac mini M1 `192.168.2.46`, LaunchDaemon `vn.kho.server` (8787) + Caddy (443), không Docker. Mã `~/kho/quan-ly-kho-local` (detached ở thẻ `vX.Y.Z`), dữ liệu `~/kho/data`, log `~/kho/logs/`. Node trên Mac: `PATH=/opt/homebrew/opt/node@22/bin:$PATH`.
- Windows `192.168.2.47` chỉ để phát triển: `G:\quan-ly-kho-local`, Tauri `G:\quan-ly-kho-tauri`. Push `origin-local` (Windows) / `origin` (Mac), nhánh `main`; repo Worker `quan-ly-kho` không push.
- Người dùng chủ yếu: iPhone PWA qua `https://192.168.2.46` và app Tauri trên Windows.

## Kiến trúc
- `server.js`: `GET/PUT /api/state`, `GET /api/backups`, `GET /healthz`. Tiền = đồng nguyên (`moneyUnit:"dong"`). Đồng bộ theo snapshot: `X-Base-Updated` sai → 409/428, không tự ghi đè. Backup `VACUUM INTO` hằng ngày + `truoc-ghi-de` trước mỗi `X-Force`.
- `src/page.js`: toàn bộ client inline (điện thoại + `html.desktop`). Ô nhập = nghìn đồng, đổi ở biên bằng `kToDong`/`kInput`. File rất lớn: không đọc cả file.
- `auth.js` + `auth.db`: duyệt thiết bị, cookie `qlk_dev_*`, tối đa 2 thiết bị chủ. `pwa.js`: manifest, icon, font, sw passthrough (đường công khai trong PUBLIC).
- Chuẩn giao diện desktop = `page.js` `html.desktop` (Tauri). App Mac SwiftUI (repo 3chai65/quan-ly-kho-mac, chỉ build trên Mac) đi theo chuẩn này; mọi thay đổi giao diện làm trên web trước.
- Mac chỉ dùng Safari; "Hiệu ứng kính" đã bỏ từ 2.38.22.

## Test
Trên máy Windows (Node 22 qua nvm), trước mỗi commit chạy đủ: `npm run lint`, `npm run test:client`, `npm test` (server), `npm run test:auth`. Lỗi better-sqlite3 → xóa node_modules + `npm ci` (không `npm rebuild`). Không chạy trên hub. Sau mỗi lần push, kiểm tab Actions.
Commit: `<version>: <tóm tắt không dấu>` cho bản có version; `docs: …` cho tài liệu; không amend commit đã push.

## Vùng nhạy cảm — sửa xong phải chạy test + phá thử (mutation) chứng minh test bắt được lỗi
`sanitize`, `validateState`, `allocateRemedyProfitEvenly`, `pushState`/`pullState`, `checkLimits`, `auth.js`.

## Vai trò
- Giám sát = Haiku (`.claude/agents/giam-sat.md`, chỉ đọc): chạy test, tóm tắt log, kiểm sau triển khai.
- Người làm = Sonnet (`.claude/agents/worker.md`): sửa mã/test. Trước khi thêm mã/CSS/id/test phải tự hỏi: cần thật không? đã có sẵn chưa (Grep)? rút được thành một dòng không? Báo cáo bằng file .md < 15 dòng (đường dẫn trong ~/.claude/CLAUDE.md của từng máy), dòng KÊNH cuối, chỉ patch ngắn, kèm dòng "đã tự kiểm 3 câu: …".
- Người làm chỉ làm và báo cáo cho Người duyệt (file báo cáo + dòng KÊNH). Không giải thích, đề xuất hay hướng dẫn trực tiếp cho người dùng trong chat; chat chỉ gồm đường dẫn file báo cáo và dòng KÊNH. Câu hỏi hay việc người dùng phải tự làm (git tag, sudo, thử iPhone) ghi trong báo cáo; Người duyệt sẽ diễn giải lại. Ngoại lệ: phiên triển khai trên Mac vẫn hỏi "bật" và nhập sudo trực tiếp.
- Người duyệt = phiên chính (Sonnet): lập kế hoạch, giao việc, duyệt; không tự viết mã; chỉ đọc phần được dán.
- Opus = `.claude/agents/auditor.md` (chỉ đọc), khi chạm tiền/tồn/đồng bộ/xác thực, khi Sonnet không chắc, hoặc khi lỗi lặp lại. Một lượt trước "duyệt triển khai", báo cáo ≤15 dòng.

## Không được
- Đụng `~/kho/data`, `~/kho/Caddyfile.mac`, `~/kho/caddy-data`; `git clean -fdx`; sửa `Caddyfile` trong repo; chạy `auth-reset` khi không được yêu cầu.
- Bật Docker kho trên Windows (bản lùi đóng băng từ 16/11/2026) cùng lúc với Mac.
- Commit khi test chưa xanh; mở hai phiên ghi song song; đổi tiền/tồn mà không nêu rủi ro trước.
- Báo giao diện "đã sửa/thẳng hàng" khi chưa có số đo trên trình duyệt hoặc lập luận từ mã.
- Viết test phụ thuộc lịch sử git (CI clone nông).
- Tin test tĩnh cho CSP/manifest/SW hay bàn phím iOS: phải thử trên trình duyệt/iPhone thật (`?kbdebug=1`).
- Để `saveLocal` vẫn ghi BASE mới khi ghi KEY lỗi (phải giữ base cũ để server trả 409).
- Dán mã thiết lập thiết bị (nằm trong `server.out.log`) vào chat hay báo cáo.

## Hạn mức
Mỗi task một chat/worker mới; dán đúng hàm/diff, yêu cầu 3–5 dòng; để Haiku tóm log trước; gộp các sửa nhỏ; không chạy lặp bộ test dài. Sau mỗi đợt giao diện lớn: dọn code chết (chỉ xóa khi 0 tham chiếu tĩnh lẫn động, rồi đo lại).
