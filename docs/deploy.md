# Triển khai & vận hành (Mac, không Docker)

## Điều kiện
Chỉ triển khai khi có cả "duyệt triển khai" của Người duyệt lẫn "bật" của người dùng. Test chạy trên Windows/CI trước; Mac chỉ nhận mã đã xanh và đã gắn thẻ.

## Quy tắc dòng kênh triển khai
Trước khi ghi dòng, đọc kênh lấy dòng triển khai gần nhất Mac đã đánh [x] (bản hub đang chạy) làm `v<cũ>`; không ghi khoảng rộng "phòng hờ". Dòng liệt kê ĐỦ mọi hash trong `v<cũ>..v<mới>` (`git log --oneline`), không chỉ mốc cuối. Thêm commit sau khi đã ghi dòng thì sửa lại CHÍNH dòng đó, không thêm dòng "cập nhật mốc" riêng.

Mẫu dòng: `Triển khai v<mới> = <hash>; khoảng v<hub>..v<mới> = <n> commit: <hash…>; ĐIỀU KIỆN: thẻ v<mới> đã có trên origin (người dùng chỉ gắn sau CI xanh); chờ "bật".` Không ghi "chờ CI" kiểu khiến Mac phải hỏi lại.

## Các bước
- Windows (người dùng tự chạy): `git tag vX.Y.Z <hash>`, `git push origin-local local-sqlite:main`, `git push origin-local vX.Y.Z`.
- Mac (Người làm chạy, người dùng nhập `sudo`), trong `~/kho/quan-ly-kho-local`:
  1. `git rev-parse --short HEAD > ~/kho/truoc-khi-bat.txt` (đường lui);
  2. `~/kho/sao-luu.sh` (phải ra "xong", không CẢNH BÁO);
  3. `git fetch origin --tags`; kiểm thông điệp thẻ, `git rev-list --count <thẻ cũ>..<thẻ mới>` và `git log --oneline <thẻ cũ>..<thẻ mới>` phải khớp danh sách commit đã duyệt, khác thì dừng lại hỏi; rồi `git checkout --detach vX.Y.Z`;
  4. `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm ci --omit=dev`;
  5. `sudo launchctl kickstart -k system/vn.kho.server` (gặp `Input/output error` thì chờ vài giây rồi thử lại);
  6. kiểm: `healthz` ok ở `127.0.0.1:8787` và `https://192.168.2.46`; từ máy Windows `curl http://192.168.2.46:8787/healthz` PHẢI thất bại (server chỉ nghe 127.0.0.1 từ 2.38.36; LaunchDaemon và `~/kho/Caddyfile.mac` không được đặt `HOST` khác, Caddy proxy tới `127.0.0.1:8787`/`localhost:8787`) còn `https://192.168.2.46/healthz` phải ok; `package.json` đúng version; `pragma integrity_check` ok; số sản phẩm không đổi; `/` chưa đăng nhập trả 401; `~/kho/logs/server.err.log` không có lỗi mới.
- Sau đó Giám sát (Haiku) kiểm lại. Báo cáo của Người làm ≤8 dòng, kèm hash trước/sau và "đã tự kiểm 3 câu". Cập nhật mục "Hiện tại" trong `docs/handover.md`.

## Đường lui
- Mã: `git checkout --detach $(cat ~/kho/truoc-khi-bat.txt)`, `npm ci --omit=dev`, `kickstart`.
- `app.db` hỏng: `sudo launchctl bootout system/vn.kho.server`; chép bản mới nhất trong `~/kho/data/backups/` thành `app.db` (xóa `-wal`/`-shm`); `sudo launchctl bootstrap system /Library/LaunchDaemons/vn.kho.server.plist`.
- Khôi phục đầy đủ: xem `README-LOCAL.md` mục "Khôi phục từ bản sao lưu"; nên diễn tập trên thư mục thử, dùng cổng khác cổng thật.

## Mac
`pmset sleep 0`, `autorestart 1`, FileVault tắt (để hub tự lên lại sau mất điện), tường lửa bật (Caddy được phép). Node Homebrew mặc định (26) bị hỏng → luôn dùng node@22.

## Sao lưu
- Server: `data/backups/backup-<ngày>.db` (giữ 30 bản) + `truoc-ghi-de` (giữ 10 bản).
- `~/kho/sao-luu.sh` (LaunchAgent `vn.kho.saoluu`, 19:00) chép `backups`, `auth.db` (`sqlite3 .backup`), `caddy-data`, `luu-tru` sang Drive `Kho-sao-luu`, không dùng `--delete`. Cần Google Drive đang mở. Script bỏ qua `certificates/`, `last_clean.json`, `intermediate.*` (Caddy tự sinh lại); `root.*` vẫn được chép. Bản cũ: `~/kho/sao-luu.sh.bak-19-11`, `.bak-21-11`.
- Hỏng thì không có thông báo: đọc dòng cuối `~/kho/logs/sao-luu.log`. Báo `Operation not permitted` → cấp Full Disk Access cho `/bin/zsh` và `/usr/bin/rsync`.
- Tài khoản Drive này chỉ dùng cho sao lưu kho; rà lại dung lượng khi vượt ~1 GB. Mất `caddy-data` nghĩa là phải cài lại chứng chỉ trên mọi thiết bị.

## Mất thiết bị chủ
`scripts/auth-reset.mjs` (xóa `devices` + `invites`, không đụng `app.db`), rồi người dùng tự đọc mã trong log và nhập tại `/auth/setup`.
