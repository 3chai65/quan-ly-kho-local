# Quản Lý Kho — vận hành trên Mac mini

Hub chạy trên **Mac mini 192.168.2.46**: server Node 22 + SQLite (LaunchDaemon `vn.kho.server`) và Caddy HTTPS, **không Docker**. Dữ liệu là file SQLite trên ổ cứng (`~/kho/data`).
iPhone, PC và app Tauri dùng chung một kho trong mạng nhà. Nhiều thiết bị dùng cùng lúc: đồng bộ theo snapshot, bản gửi cũ bị máy chủ từ chối (409/428), không ghi đè âm thầm.
Repo Cloudflare Worker (`quan-ly-kho`) để nguyên, không nằm trong thư mục này. Docker và `G:\...\data` trên Windows là **bản lùi đóng băng từ 16/11/2026**: không ghi, không bật cùng lúc với Mac.

## Yêu cầu
- Mac mini luôn bật, không ngủ (`sudo pmset -a sleep 0`), tự khởi động lại khi mất điện (`autorestart 1`). Sau khi đổi cài đặt trong Cài đặt hệ thống (Màn hình khóa, Năng lượng), kiểm lại: `pmset -g | grep -E "^ sleep|displaysleep|autorestart"`.
- Thiết bị và Mac cùng mạng WiFi; Mac có IP cố định `192.168.2.46` (DHCP Binding trên router).
- Node 22 (`/opt/homebrew/opt/node@22/bin`); Node Homebrew mặc định (26) hỏng.
- Google Drive cho máy tính mở khi đăng nhập, để sao lưu 19:00 chạy được.

## Chạy
Dịch vụ tự lên khi Mac khởi động. Các lệnh hay dùng (Terminal trên Mac):
```bash
curl -s http://127.0.0.1:8787/healthz              # -> ok
curl -k https://192.168.2.46/healthz               # -> ok (qua Caddy)
sudo launchctl kickstart -k system/vn.kho.server   # khởi động lại server
tail -n 50 ~/kho/logs/server.err.log               # lỗi
tail -n 50 ~/kho/logs/server.out.log               # log thường (kể cả mã thiết lập)
sudo brew services restart caddy                   # khởi động lại Caddy
```
Mở app: iPhone/PC `https://192.168.2.46`. Cổng 8787 bị tường lửa chặn từ ngoài; chỉ Caddy gọi qua loopback.

Triển khai bản mới: xem `CLAUDE.md` mục "Triển khai". Cài phụ thuộc: `PATH=/opt/homebrew/opt/node@22/bin:$PATH npm ci --omit=dev`.

## Chế độ HTTPS

- Thiết bị cần cài CA nội bộ của Caddy (`caddy-root.crt`); xem mục "Cài như ứng dụng" và "Xác thực thiết bị" bên dưới.
- Cấu hình Caddy chạy thật: `~/kho/Caddyfile.mac` (chép vào `/opt/homebrew/etc/Caddyfile`), CA lưu ở `~/kho/caddy-data/caddy` (dùng lại CA cũ từ Windows). **Mất thư mục này là mất CA nội bộ, phải cài lại chứng chỉ trên mọi thiết bị**; nó có trong bản sao lưu Drive.
- Cổng 80 đóng; chỉ cổng 443 mở ra LAN; `default_sni 192.168.2.46` giữ cert khớp khi vào bằng IP. Đổi IP máy chủ = cert không khớp.
- Chỉ truy cập LAN; không dùng cho truy cập từ ngoài nhà.

## Dữ liệu nằm ở đâu
- File SQLite: `~/kho/data/app.db`; thiết bị: `~/kho/data/auth.db`. Server chạy bằng user `thangnt`, biến `DATA_DIR=/Users/thangnt/kho/data` (trong `/Library/LaunchDaemons/vn.kho.server.plist`).
- Không đụng `~/kho/data` khi server đang chạy, trừ việc đọc. Đừng copy `app.db` lúc chạy: file WAL có thể lệch; dùng bản trong `backups/`.

## Tự động sao lưu (mỗi ngày)
- Server tự tạo **1 bản backup/ngày** vào `~/kho/data/backups/`, tên `backup-YYYY-MM-DD.db`, giữ **30 bản** gần nhất (chụp trước lần ghi đầu tiên trong ngày, bằng `VACUUM INTO`); thêm bản `backup-YYYY-MM-DD-truoc-ghi-de-HHmmssSSS.db` (giữ **10 bản**) trước mỗi lần ghi đè chủ động (`X-Force`).
- Xem danh sách: trong app (Sao lưu & khôi phục → Bản sao lưu trên máy chủ, chỉ xem), thư mục `backups/`, hoặc `GET /api/backups` (cần cookie thiết bị đã duyệt, trình duyệt chưa duyệt sẽ nhận 401).
- **Sao lưu ra ngoài máy**: `~/kho/sao-luu.sh` (LaunchAgent `vn.kho.saoluu`, 19:00 hằng ngày, cần phiên đăng nhập và Google Drive đang mở) chép `backups`, `auth.db` (bằng `sqlite3 .backup`), `caddy-data`, `luu-tru` sang `~/Library/CloudStorage/GoogleDrive-<tài khoản>/My Drive/Kho-sao-luu/`, bằng `rsync` không `--delete`. Log `~/kho/logs/sao-luu.log` phải kết thúc bằng "xong", không có dòng CẢNH BÁO. Chạy tay: `~/kho/sao-luu.sh`.
- **Backup thủ công:** nút "Sao lưu" trong app tải file JSON theo trình duyệt của từng thiết bị; backup thật là `app.db` trong `backups/` và bản trên Drive.

## Khôi phục từ bản sao lưu

### Các lớp sao lưu hiện có
1. **Server tự tạo** `backups/backup-<ngày>.db` và `backup-<ngày>-truoc-ghi-de-<giờ>.db`, giữ theo số file như mục trên.
2. **`sao-luu.sh` lúc 19:00** chép sang Google Drive (`Kho-sao-luu`): `backups`, `luu-tru`, `auth.db`, `caddy-data`. Tài khoản Drive này dành riêng cho sao lưu kho.
3. Drive và Mac là hai nơi khác nhau; Mac mất thì còn Drive. Drive chỉ chứa file backup, không chứa `app.db` đang chạy. Mỗi tháng nên chép thêm một bản ra USB hoặc chỗ ngoài.

### Khôi phục dữ liệu kho
Server phải dừng trước khi động vào `data/`.
```bash
sudo launchctl bootout system/vn.kho.server
cd ~/kho/data
# Chọn backup mới nhất còn hợp lệ (mới nhất ở cuối):
ls -l backups/*.db
# Cất app.db hiện tại sang tên khác (đừng bỏ bước này):
cp app.db "app.db.hong-$(date +%Y%m%d-%H%M)" 2>/dev/null
# Chép backup đã chọn thành app.db (đổi tên cho đúng), xóa WAL/SHM cũ:
cp backups/backup-2026-11-12.db app.db
rm -f app.db-wal app.db-shm
sudo launchctl bootstrap system /Library/LaunchDaemons/vn.kho.server.plist
sleep 3; curl -s http://127.0.0.1:8787/healthz       # -> ok
sqlite3 app.db "pragma integrity_check;"              # -> ok
```
- Nếu `bootstrap` báo `Input/output error`, chờ vài giây (dịch vụ cũ chưa gỡ xong) rồi thử lại.
- **Dữ liệu mới hơn bản backup sẽ mất.** Bản `truoc-ghi-de` phản ánh trạng thái TRƯỚC lần ghi đầu trong ngày. Nếu backup trong `backups/` cũng hỏng thì lấy từ Google Drive `Kho-sao-luu/backups` (cùng cách chép).

### Mất `auth.db`
Dữ liệu kho không mất (nằm ở `app.db`). `auth.db` được sao lưu sang Drive; có thể chép lại từ đó. Nếu không còn, khi chạy server tự tạo `auth.db` mới rỗng và in mã thiết lập vào `~/kho/logs/server.out.log`. Thiết lập lại thiết bị chủ rồi duyệt lại iPhone/PC theo mục "Xác thực thiết bị". Nếu `auth.db` còn nhưng mất quyền vào, đặt lại bằng `scripts/auth-reset.mjs` (xem mục "Mất thiết bị chủ / đổi máy").

### Diễn tập an toàn (không đụng `~/kho/data` thật)
Chép backup vào thư mục thử, chạy ở cổng khác (18789), `DATA_DIR` trỏ thư mục thử:
```bash
mkdir -p /tmp/thu-kho && cp ~/kho/data/backups/backup-2026-11-12.db /tmp/thu-kho/app.db
cd ~/kho/quan-ly-kho-local
DATA_DIR=/tmp/thu-kho PORT=18789 PATH=/opt/homebrew/opt/node@22/bin:$PATH node server.js &
sleep 3; curl -s http://127.0.0.1:18789/healthz        # phải ra ok
kill %1; rm -rf /tmp/thu-kho
```

## Nạp dữ liệu từ file backup JSON

Nếu có file `kho-backup-YYYY-MM-DD.json` (xuất từ bản Cloudflare cũ hoặc từ nút
"Sao lưu" trong app), nạp vào DB local như sau:

Cách dùng: mở app → **Sao lưu & khôi phục → Khôi phục từ file** trên chính giao
diện web. Không gửi `PUT /api/state` bằng script tay: `/api/*` cần cookie của thiết
bị đã duyệt (script không có cookie sẽ nhận 401).

File JSON không có `moneyUnit: "dong"` được coi là nghìn đồng và nhân 1000 khi nạp.
File xuất từ bản 2.6.6 trở đi có cờ đó thì giữ nguyên số đồng. Khôi phục đúng
kho đang chạy bằng cách copy `app.db` (mục sao lưu phía trên), không bằng JSON.
Bản `kho-backup-2026-11-06.json` trong `data/luu-tru/` xuất lúc 19:48, muộn hơn `backup-2026-11-06.db` (14:51), và có thêm đơn bán lẻ `TX_mw4yzqmggwli1` (Cam Thảo 0,1 kg, thành tiền 20 nghìn) mà sổ hiện tại không còn; khôi phục từ JSON này sẽ đưa đơn đó trở lại.

## Chạy test
Chạy trên Windows hoặc CI, không chạy trên hub Mac.
```powershell
# Node 22 (`.nvmrc`); không dùng Node 24+/26 (better-sqlite3 11.x không build). Windows: dùng Node 22 (`nvm use 22`); nếu better-sqlite3 lỗi thì xóa `node_modules` + `npm ci` (không dùng `npm rebuild`).
npm run lint                         # kiểm cú pháp
node --test tests/client.test.mjs    # test client
npm test                             # test server (cần better-sqlite3)
npm run test:auth                    # test xác thực
```
CI (`.github/workflows/ci.yml`) chạy test server/auth trong Docker vì better-sqlite3 cần build native; `DATA_DIR` đặt thư mục tạm để không chạm dữ liệu thật.

## Dừng / khởi động lại
```bash
sudo launchctl bootout system/vn.kho.server                                    # dừng server (giữ dữ liệu)
sudo launchctl bootstrap system /Library/LaunchDaemons/vn.kho.server.plist     # chạy lại
sudo launchctl kickstart -k system/vn.kho.server                               # khởi động lại nhanh
tail -f ~/kho/logs/server.err.log                                              # xem log
```

## Bản nghìn đồng đã cất riêng

`data/luu-tru/` không nằm trong vòng xóa 30 bản của `data/backups/`:

- `truoc-doi-don-vi.db` — `app.db` trước khi đổi sang đồng (giá còn là nghìn).
- `truoc-lam-tron-2026-11-06-1047.json` — số lẻ gốc của giao dịch.
- `kho-backup-2026-11-06.json` — bản JSON nghìn đồng xuất lúc 19:48 ngày 6/11. Có thêm đơn bán lẻ `TX_mw4yzqmggwli1` (Cam Thảo 0,1 kg, thành tiền 20 nghìn) mà sổ hiện tại không còn. Khôi phục từ file này sẽ đưa đơn đó trở lại.

Từ 2.39.3 server KHÔNG còn hàm đổi đơn vị: các bản nghìn đồng ở trên chỉ để lưu trữ, KHÔNG khôi phục được vào bản này (server từ chối khởi động nếu `app.db` có dữ liệu mà `app_meta.money_unit` chưa là `dong`; client từ chối file/dữ liệu không có `moneyUnit: "dong"`). Muốn dùng lại thì phải tự đổi sang đồng ngoài ứng dụng (nhân 1000 các cột `price_vnd`, `total_vnd`, `cost_vnd`, `unit_price_vnd`, `cost_price_vnd`, `prescriptions.total_vnd`, rồi ghi `money_unit = dong`).

`~/kho/data/luu-tru/` và `backups/` nằm cùng ổ với `app.db`; `sao-luu.sh` chép chúng sang Google Drive mỗi ngày (không mirror, không xóa ở đích). Vài tháng mở thử một file `.db` trong `Kho-sao-luu/backups` bằng `sqlite3 <file> "pragma integrity_check;"`.

**Không làm mất `~/kho/caddy-data`** — chứa CA nội bộ; mất là phải cài lại chứng chỉ trên mọi thiết bị.

`auth.db` được `sao-luu.sh` sao lưu (bằng `sqlite3 .backup`, an toàn khi server đang chạy). Mất danh sách thiết bị thì đặt lại, vài phút là ghép lại được:

```bash
cd ~/kho/quan-ly-kho-local
DATA_DIR=$HOME/kho/data PATH=/opt/homebrew/opt/node@22/bin:$PATH node scripts/auth-reset.mjs
sudo launchctl kickstart -k system/vn.kho.server
grep "Mã thiết lập" ~/kho/logs/server.out.log | tail -1    # mã nằm ở đây; không dán ra ngoài
```

Lệnh chỉ xóa bảng thiết bị và toàn bộ mã mời chưa dùng (bảng `invites`), không đụng `app.db`. Tên cookie `qlk_dev_…` giữ nguyên.

## Cài như ứng dụng

Từ 2.16.0 có thể cài app lên màn hình chính (chạy toàn màn hình, không cache dữ liệu kho). Cần tin cậy chứng chỉ `caddy-root.crt` trước.

- iPhone: cài hồ sơ `caddy-root.crt`, rồi bật tin cậy tại Cài đặt > Cài đặt chung > Giới thiệu > Cài đặt tin cậy chứng chỉ. Mở Safari > Chia sẻ > Thêm vào MH chính.
- Windows/Mac: Edge hoặc Chrome > menu > Cài đặt ứng dụng (Install app).

## Xác thực thiết bị

Từ 2.8.0, chỉ thiết bị đã được duyệt mới vào được kho. Thiết bị lạ trong cùng mạng chỉ thấy trang "chưa được duyệt".

### Thiết lập thiết bị chủ đầu tiên
1. Xem mã thiết lập trong log: `grep "Mã thiết lập" ~/kho/logs/server.out.log | tail -1` (dòng `[auth] Mã thiết lập thiết bị chủ: XXXX-XXXX-XXXX`).
2. Trên thiết bị muốn làm chủ số 1 (khuyến nghị iPhone), mở `https://192.168.2.46/auth/setup`, nhập mã, đặt tên thiết bị. Dùng trình duyệt thường.
3. Coi mã thiết lập là bí mật cho tới khi dùng: ai vào được `/auth/setup` trong LAN và biết mã đều thành thiết bị chủ. Sau khi có chủ, `/auth/setup` trả 404 vĩnh viễn.
4. Có thể đặt mã cố định bằng biến môi trường `QLK_SETUP_CODE` (tối thiểu 12 ký tự); mã này không in ra log.

### Thêm thiết bị (điện thoại, máy khác)
1. Trên thiết bị chủ, mở `/auth/devices` (nút "Thiết bị" ở đầu trang), chọn vai trò, bấm "Tạo mã mời". Mã hiện một lần, hiệu lực 5 phút, dùng một lần.
2. Trên thiết bị mới, mở `https://192.168.2.46/auth/join`, nhập mã và tên thiết bị. Chỉ dùng cổng 443 (HTTPS); cổng 8787 bị tường lửa chặn.
3. Thiết bị chủ: tối đa 2, duyệt và thu hồi được thiết bị khác. Thành viên: xem và sửa kho, không quản lý thiết bị.
4. Nhập sai mã 5 lần thì khóa 15 phút. Thiết bị chủ tạo mã mời mới hoặc bấm "Mở khóa" trên `/auth/devices` để mở lại ngay.

### Thu hồi
- Trên `/auth/devices`, bấm "Thu hồi" ở thiết bị cần bỏ; có hiệu lực ngay ở yêu cầu kế tiếp của thiết bị đó. Không tự thu hồi chính thiết bị đang dùng. Thu hồi thiết bị chủ khác cần tick ô xác nhận.
- Thiết bị bị thu hồi giữ nguyên thay đổi chưa gửi trên máy nó, và thấy liên kết "Nhập mã mời để vào lại". Dữ liệu đã tải về máy đó trước đây không xóa từ xa được.

### Lưu ý khi dùng
- **Mỗi thiết bị dùng một địa chỉ cố định: `https://192.168.2.46`.** Cookie gắn với tên máy: `localhost`, `127.0.0.1` và `192.168.x.x` là ba nơi khác nhau. Thiết bị từng đăng nhập bằng `https://localhost` (bản Docker cũ trên Windows) không còn tới được hub, phải nhập lại bằng mã mời.
- **Không dùng tab riêng tư** của trình duyệt cho thiết bị thật: đóng tab là mất cookie và mất nháp chưa gửi.
- **Địa chỉ HTTPS:** mọi thiết bị dùng `https://192.168.2.46` (cổng 443 qua Caddy). Không có đường HTTP dự phòng từ thiết bị khác; trên chính Mac, `http://127.0.0.1:8787` dùng khi Caddy hỏng.
- `auth.db` được sao lưu sang Drive hằng ngày. Mất file này thì thiết lập lại (xem bên dưới), không mất dữ liệu kho.

### Mất thiết bị chủ / đổi máy: đặt lại
```bash
cd ~/kho/quan-ly-kho-local
DATA_DIR=$HOME/kho/data PATH=/opt/homebrew/opt/node@22/bin:$PATH node scripts/auth-reset.mjs
sudo launchctl kickstart -k system/vn.kho.server
grep "Mã thiết lập" ~/kho/logs/server.out.log | tail -1
```
Lệnh đầu xóa danh sách thiết bị và cả mã mời chưa dùng (không đụng `app.db`). Sau khi khởi động lại, log in mã thiết lập mới; thiết lập lại thiết bị chủ như trên. Chỉ chạy khi thật sự cần: mọi thiết bị khác bị đăng xuất, phải nhập lại bằng mã mời.

### Xử lý sự cố
- Trang hiện `Forbidden` khi bấm Xác nhận hoặc Tham gia: mở lại trang bằng đúng một địa chỉ (không đổi giữa `localhost` và IP giữa chừng) rồi thử lại.
- Thiết bị đang dùng bình thường bỗng báo "chưa được duyệt": thiết bị đã bị thu hồi, hoặc cookie bị xóa. Dùng liên kết "Nhập mã mời để vào lại".

## Khi server từ chối bản đang sửa

Huy hiệu “Chưa đồng bộ” hiện cạnh nút “Bỏ thay đổi chưa gửi, lấy bản máy chủ” khi máy chủ trả 400 hoặc 428. Bấm nút thì trang hỏi xác nhận, tải file `kho-nhap-bi-tu-choi-….json` trước, rồi lấy lại bản trên máy chủ. Nếu trình duyệt không tải được file, dữ liệu trên máy được giữ nguyên. File này chứa cả kho; xóa khi không cần, và không để thư mục tải của trình duyệt nằm trong repo.

## Ghi chú
- Chỉ dùng trong mạng nhà; có **xác thực thiết bị** (mục trên).
- **Không bao giờ làm mất `~/kho/caddy-data`** và không chạy Docker kho trên Windows cùng lúc với Mac.
- Không mở cổng `8787` ra LAN (bỏ qua HTTPS): tường lửa macOS đang chặn `node` từ ngoài, giữ nguyên.
- Muốn dùng ngoài WiFi: cài Tailscale trên Mac và điện thoại, mở `https://<tên-tailscale-Mac>`; cần thêm tên/IP đó vào Caddyfile và cài lại chứng chỉ. Hiện tại chỉ LAN.
