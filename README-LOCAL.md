# Quản Lý Kho — bản chạy local (Docker + SQLite)

Bản đang dùng: server Node trong Docker, dữ liệu là **file SQLite trên ổ cứng**.
PC và điện thoại dùng chung một kho trong mạng nhà. Nhiều thiết bị có thể dùng cùng lúc: đồng bộ theo snapshot, bản gửi cũ bị máy chủ từ chối (409/428), không ghi đè âm thầm.
Repo Cloudflare Worker (`quan-ly-kho`) để nguyên, không nằm trong thư mục này.

## Yêu cầu
- Docker Desktop đang chạy.
- Máy tính và điện thoại **cùng một mạng WiFi**.

## Chạy
```powershell
cd "G:\quan-ly-kho-local"
docker compose up -d --build
```

Mở trên máy tính: **https://localhost** (hoặc dự phòng `http://localhost:8787`)

Mở trên điện thoại/Mac: **https://<IP-máy-tính>**
- Xem IP máy tính: `ipconfig` → dòng `IPv4 Address` của card WiFi. Cổng 443 mở ra LAN; cổng 8787 chỉ lắng nghe `127.0.0.1` trên PC.

## Chế độ HTTPS

- Sau khi bật HTTPS (`docker compose up`), thiết bị cần cài CA nội bộ của Caddy (`caddy-root.crt`). Sổ cài ở mục “Xác thực thiết bị” bên dưới và có hướng dẫn chi tiết riêng.
- **Không chạy `docker compose down -v`** — sẽ xóa volume `caddy_data` và mất CA nội bộ. Dùng `docker compose down` (không `-v`) khi cần.
- Cổng 80 đóng; chỉ cổng 443 mở ra LAN; `default_sni` đảm bảo cert khớp khi vào bằng IP.
- Chỉ truy cập LAN; không dùng cho truy cập từ ngoài nhà. IP phải cố định (DHCP reservation).

## Dữ liệu nằm ở đâu
- File SQLite: `G:\quan-ly-kho-local\data\app.db`
- Từ 2.15.14 container chạy bằng user `node` (uid 1000), nên `data/` phải ghi được bởi uid 1000. Nếu `data/` đang thuộc root, chạy một lần: `docker run --rm -v "G:\quan-ly-kho-local\data:/data" alpine chown -R 1000:1000 /data`. Chạy trong PowerShell/cmd, KHÔNG dùng Git Bash (đổi đường dẫn `/data`). File cũ do root tạo (644) thì user node không ghi được nên NÊN chạy; Docker Desktop với file tạo từ Windows (777) có thể không cần, chạy vẫn vô hại.

## Tự động sao lưu (mỗi ngày)
- Server tự tạo **1 bản backup/ngày** vào `G:\quan-ly-kho-local\data\backups\`,
  tên `backup-YYYY-MM-DD.db`, giữ **30 bản** gần nhất (bản cũ tự xóa, chụp trước lần ghi đầu tiên trong ngày);
  đồng thời tự chụp thêm bản `backup-YYYY-MM-DD-truoc-ghi-de-HHmmssSSS.db` (giữ **10 bản**) trước mỗi lần ghi đè chủ động (`X-Force`).
- Xem danh sách backup: trong app, mục "Sao lưu & khôi phục". Các đường `/api/*` cần cookie của thiết bị đã duyệt; mở thẳng `http://localhost:8787/api/backups` từ trình duyệt chưa duyệt sẽ bị 401.
- **Khôi phục nhanh:** dừng container, copy file backup đè lên `app.db`, khởi động lại:
  ```powershell
  cd "G:\quan-ly-kho-local"
  docker compose stop
  Copy-Item "data\backups\backup-2026-11-06.db" "data\app.db" -Force
  Remove-Item "data\app.db-wal","data\app.db-shm" -ErrorAction SilentlyContinue
  docker compose start
  ```
- **Backup thủ công:** nút "Sao lưu" trong app tải file JSON theo trình duyệt
  của từng thiết bị; cách copy `app.db`/`backups` trên mới là backup thật trên PC.

## Khôi phục từ bản sao lưu

Đã diễn tập thật 12/11/2026: chép một backup thành `app.db` trong thư mục thử, chạy image 2.15.19 → `/healthz` 200, `integrity_check` ok, `money_unit` là `dong`.

### Các lớp sao lưu hiện có
1. **Server tự tạo** `data\backups\backup-<ngày>.db` (`VACUUM INTO`, chụp trước lần ghi đầu tiên trong ngày) và `backup-<ngày>-truoc-ghi-de-<giờ>.db` (trước mỗi lần ghi đè chủ động); giữ 30 ngày/bản như mục trên.
2. **Task Scheduler "SaoLuuKho"** chạy `E:\sao-luu-kho\sao-luu.cmd`: `robocopy` `data\backups` và `data\luu-tru` sang `E:\sao-luu-kho` với cờ `/E /XO /R:2 /W:5`, KHÔNG dùng `/MIR`. Chạy hằng ngày lúc 19:00 (từ 12/11/2026), chỉ khi đã đăng nhập Windows (LogonType Interactive).
3. `E:` là đĩa khác `G:` nhưng cùng máy: mất máy là mất cả hai. Vì vậy cũng trong `sao-luu.cmd`, hai lệnh `robocopy` cuối chép `E:\sao-luu-kho\backups` và `luu-tru` sang Google Drive tại `J:\My Drive\Kho-sao-luu\` (dùng `/E /XO`, không `/MIR`, đường dẫn có ngoặc kép vì có khoảng trắng). Cần Google Drive cho máy tính đang chạy và ổ `J:` có mặt; nếu `J:` vắng thì bước Drive lỗi nhưng bản ở `E:` đã xong. Đã kiểm 12/11/2026: 17 file backup và 13 file lưu trữ sang Drive, 0 lỗi, khớp với `E:`.
4. `E:` KHÔNG chứa `app.db`/`auth.db` đang chạy; chỉ có các file backup.

### Khôi phục dữ liệu kho
Chạy từng lệnh trong PowerShell. Container phải dừng trước khi động vào `data\`.
```powershell
cd "G:\quan-ly-kho-local"
docker compose stop
# Chọn file backup mới nhất còn hợp lệ (xem danh sách, mới nhất ở cuối):
Get-ChildItem data\backups\*.db | Sort-Object LastWriteTime | Select-Object Name,Length,LastWriteTime
# Nếu app.db hiện tại còn, cất sang tên khác trước (đừng bỏ bước này):
Copy-Item "data\app.db" "data\app.db.hong-$(Get-Date -Format yyyyMMdd-HHmm)" -ErrorAction SilentlyContinue
# Chép backup đã chọn thành app.db (đổi tên file cho đúng):
Copy-Item "data\backups\backup-2026-11-12.db" "data\app.db" -Force
# Xóa WAL/SHM cũ (chỉ khi container đã dừng):
Remove-Item "data\app.db-wal","data\app.db-shm" -ErrorAction SilentlyContinue
```
- Nếu `data\` bị đổi chủ sai, chạy lệnh `chown` ở mục "Dữ liệu nằm ở đâu".
- Bật lại: `docker compose start`. Kiểm: mở `https://localhost/healthz` phải ra 200, rồi mở app xem số liệu. Kiểm tra trước khi dùng (chưa chạy nguyên văn): `curl.exe -k -s -o NUL -w "%{http_code}" https://localhost/healthz`.
- **Dữ liệu mới hơn bản backup sẽ mất.** Bản `truoc-ghi-de` phản ánh trạng thái TRƯỚC lần ghi đầu trong ngày, nên cũng không chứa thay đổi hôm đó. Nếu backup trên `G:` hỏng thì lấy từ `E:\sao-luu-kho\backups` (cùng cách chép).

### Mất `auth.db`
Dữ liệu kho không mất (nằm ở `app.db`). Khi chạy, server tự tạo `auth.db` mới rỗng và in mã thiết lập vào log: `docker logs quan-ly-kho --tail 50` (không dán mã ra ngoài). Thiết lập lại thiết bị chủ trên PC rồi duyệt lại iPhone/PC theo mục "Xác thực thiết bị" (tối đa 2 thiết bị chủ). Nếu `auth.db` còn nhưng mất quyền vào, đặt lại bằng `docker compose exec quan-ly-kho node scripts/auth-reset.mjs` rồi `docker compose restart quan-ly-kho` (xem phía dưới).

### Diễn tập an toàn (không đụng `data\` thật)
Chép backup vào thư mục thử ngoài `data\`, đặt tên `app.db`, chạy ở cổng khác cổng thật (18789, chỉ `127.0.0.1`):
```powershell
New-Item -ItemType Directory C:\Temp\thu-kho -Force
Copy-Item "G:\quan-ly-kho-local\data\backups\backup-2026-11-12.db" "C:\Temp\thu-kho\app.db"
docker run --name thu-kho --rm -d -p 127.0.0.1:18789:8787 -e DATA_DIR=/data -v "C:\Temp\thu-kho:/data" quan-ly-kho:2.15.19
```
Kiểm tra trước khi dùng (chưa chạy nguyên văn): `curl.exe -s -o NUL -w "%{http_code}" http://127.0.0.1:18789/healthz` phải ra 200. Dừng và dọn: `docker rm -f thu-kho`, rồi xóa `C:\Temp\thu-kho`. Thay `2.15.19` bằng phiên bản đang chạy.

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
```powershell
# Test client (trên máy, chỉ cần Node):
node --test tests/client.test.mjs

# Test server thật và test xác thực (cần better-sqlite3 → chạy trong container).
# Dùng tên service của compose, không ghi cứng tên image; DATA_DIR tạm để không chạm /data:
docker compose run --rm --no-deps -e DATA_DIR=/tmp/qlk quan-ly-kho npm test
docker compose run --rm --no-deps -e DATA_DIR=/tmp/qlk quan-ly-kho npm run test:auth
```

## Dừng / khởi động lại
```powershell
docker compose stop      # dừng (giữ dữ liệu)
docker compose start     # chạy lại
docker compose down      # dừng và xoá container (dữ liệu vẫn còn trong ./data)
docker compose logs -f   # xem log
```

## Bản nghìn đồng đã cất riêng

`data/luu-tru/` không nằm trong vòng xóa 30 bản của `data/backups/`:

- `truoc-doi-don-vi.db` — `app.db` trước khi đổi sang đồng (giá còn là nghìn).
- `truoc-lam-tron-2026-11-06-1047.json` — số lẻ gốc của giao dịch.
- `kho-backup-2026-11-06.json` — bản JSON nghìn đồng xuất lúc 19:48 ngày 6/11. Có thêm đơn bán lẻ `TX_mw4yzqmggwli1` (Cam Thảo 0,1 kg, thành tiền 20 nghìn) mà sổ hiện tại không còn. Khôi phục từ file này sẽ đưa đơn đó trở lại.

File `.db` này chỉ tự thành đồng khi `server.js` còn `migrateMoneyToDong()`: copy đè lên `data/app.db` (xóa `app.db-wal` và `app.db-shm`), khởi động server khi `app_meta` chưa có `money_unit = dong`. Giao dịch có trong file JSON được nhân từ số lẻ; giá nhập và tổng đơn nhân 1000 từ số nghìn đang lưu. Sau này nếu xóa hàm đó khỏi `server.js`, phải tự nhân 1000 các cột `price_vnd`, `total_vnd`, `cost_vnd`, `unit_price_vnd`, `cost_price_vnd`, `prescriptions.total_vnd`, rồi ghi `money_unit = dong`.

Nguồn `data\backups` và `data\luu-tru` nằm cùng ổ với `app.db`. Đừng copy `app.db` lúc server đang chạy: file WAL có thể lệch với file chính. Chỉ chép hai thư mục dưới đây (bản `VACUUM INTO` đã khép). Không dùng `/MIR`, vì cờ đó xóa ở đích những bản nguồn đã prune. `E:` là HDD khác SSD của `G:`, nhưng vẫn trong cùng một máy:

```powershell
robocopy G:\quan-ly-kho-local\data\backups E:\sao-luu-kho\backups /E /XO
robocopy G:\quan-ly-kho-local\data\luu-tru E:\sao-luu-kho\luu-tru /E /XO
```

Chạy lại hai lệnh mỗi tuần, hoặc sau một đợt nhập nhiều hàng. Vài tháng mở thử một file `.db` trong `E:\sao-luu-kho\backups`. Mỗi tháng chép cả `E:\sao-luu-kho` ra USB hoặc chỗ ngoài máy, vì mất máy vẫn mất cả hai ổ.

**Không bao giờ chạy `docker compose down -v` trong thư mục kho thật** — nó xóa volume `caddy_data`, mất CA nội bộ, phải cài lại trên cả 3 thiết bị.

`data/auth.db` không nằm trong hai lệnh trên và không sao lưu file này. Server ghi `last_seen_at` khi có thiết bị mở app; chép SQLite đang ở chế độ WAL dễ ra bản lệch. Mất danh sách thiết bị thì đặt lại, vài phút là ghép lại được:

```powershell
docker compose exec quan-ly-kho node scripts/auth-reset.mjs
docker compose restart quan-ly-kho
docker compose logs
```

Lệnh chỉ xóa bảng thiết bị và toàn bộ mã mời chưa dùng (bảng `invites`), không đụng `app.db`. Tên cookie `qlk_dev_…` giữ nguyên. Mã thiết lập mới nằm trong log.

## Cài như ứng dụng

Từ 2.16.0 có thể cài app lên màn hình chính (chạy toàn màn hình, không cache dữ liệu kho). Cần tin cậy chứng chỉ `caddy-root.crt` trước.

- iPhone: cài hồ sơ `caddy-root.crt`, rồi bật tin cậy tại Cài đặt > Cài đặt chung > Giới thiệu > Cài đặt tin cậy chứng chỉ. Mở Safari > Chia sẻ > Thêm vào MH chính.
- Windows/Mac: Edge hoặc Chrome > menu > Cài đặt ứng dụng (Install app).

## Xác thực thiết bị

Từ 2.8.0, chỉ thiết bị đã được duyệt mới vào được kho. Thiết bị lạ trong cùng mạng chỉ thấy trang "chưa được duyệt".

### Thiết lập thiết bị chủ đầu tiên
1. Xem mã thiết lập trong log: `docker logs quan-ly-kho --tail 50` (dòng `[auth] Mã thiết lập thiết bị chủ: XXXX-XXXX-XXXX`).
2. Trên PC, mở `https://localhost/auth/setup` (dự phòng `http://localhost:8787/auth/setup`), nhập mã, đặt tên thiết bị. Dùng trình duyệt thường.
3. Coi mã thiết lập là bí mật cho tới khi dùng: ai tới được cổng 8787 và biết mã đều thành thiết bị chủ được. Sau khi có chủ, `/auth/setup` trả 404 vĩnh viễn.
4. Có thể đặt mã cố định bằng biến môi trường `QLK_SETUP_CODE` (tối thiểu 12 ký tự); mã này không in ra log.

### Thêm thiết bị (điện thoại, máy khác)
1. Trên thiết bị chủ, mở `/auth/devices` (nút "Thiết bị" ở đầu trang), chọn vai trò, bấm "Tạo mã mời". Mã hiện một lần, hiệu lực 5 phút, dùng một lần.
2. Trên thiết bị mới, mở `https://<IP-máy-tính>/auth/join`, nhập mã và tên thiết bị. Cổng 8787 chỉ nghe `127.0.0.1`, nên thiết bị khác không vào được qua 8787.
3. Thiết bị chủ: tối đa 2, duyệt và thu hồi được thiết bị khác. Thành viên: xem và sửa kho, không quản lý thiết bị.
4. Nhập sai mã 5 lần thì khóa 15 phút. Thiết bị chủ tạo mã mời mới hoặc bấm "Mở khóa" trên `/auth/devices` để mở lại ngay.

### Thu hồi
- Trên `/auth/devices`, bấm "Thu hồi" ở thiết bị cần bỏ; có hiệu lực ngay ở yêu cầu kế tiếp của thiết bị đó. Không tự thu hồi chính thiết bị đang dùng. Thu hồi thiết bị chủ khác cần tick ô xác nhận.
- Thiết bị bị thu hồi giữ nguyên thay đổi chưa gửi trên máy nó, và thấy liên kết "Nhập mã mời để vào lại". Dữ liệu đã tải về máy đó trước đây không xóa từ xa được.

### Lưu ý khi dùng
- **Mỗi thiết bị dùng một địa chỉ cố định.** Cookie gắn với tên máy: `localhost`, `127.0.0.1` và `192.168.x.x` được coi là ba nơi khác nhau. PC nên luôn dùng `localhost`.
- **Không dùng tab riêng tư** của trình duyệt cho thiết bị thật: đóng tab là mất cookie và mất nháp chưa gửi.
- **Địa chỉ HTTPS** (từ khi dùng Caddy): PC dùng `https://localhost`; Mac/iPhone dùng `https://192.168.2.46`. Máy khác không vào được `http://192.168.2.46:8787`; chỉ PC dùng `http://localhost:8787` làm đường dự phòng khi Caddy hỏng. Muốn xóa volume Caddy khi cần thay CA thì dùng `docker compose down`, **không dùng `-v`**.
- `data/auth.db` không nằm trong bản sao lưu (`robocopy` chỉ chép `backups` và `luu-tru`). Mất file này thì thiết lập lại (xem bên dưới), không mất dữ liệu kho.

### Mất thiết bị chủ / đổi máy: đặt lại
```
docker exec quan-ly-kho node scripts/auth-reset.mjs
docker restart quan-ly-kho
docker logs quan-ly-kho --tail 50
```
Lệnh đầu xóa danh sách thiết bị và cả mã mời chưa dùng (không đụng `app.db`). Sau khi khởi động lại, log in mã thiết lập mới; thiết lập lại thiết bị chủ như trên.

### Xử lý sự cố
- Trang hiện `Forbidden` khi bấm Xác nhận hoặc Tham gia: mở lại trang bằng đúng một địa chỉ (không đổi giữa `localhost` và IP giữa chừng) rồi thử lại.
- Thiết bị đang dùng bình thường bỗng báo "chưa được duyệt": thiết bị đã bị thu hồi, hoặc cookie bị xóa. Dùng liên kết "Nhập mã mời để vào lại".

## Khi server từ chối bản đang sửa

Huy hiệu “Chưa đồng bộ” hiện cạnh nút “Bỏ thay đổi chưa gửi, lấy bản máy chủ” khi máy chủ trả 400 hoặc 428. Bấm nút thì trang hỏi xác nhận, tải file `kho-nhap-bi-tu-choi-….json` trước, rồi lấy lại bản trên máy chủ. Nếu trình duyệt không tải được file, dữ liệu trên máy được giữ nguyên. File này chứa cả kho; xóa khi không cần, và không để thư mục tải của trình duyệt nằm trong repo.

## Ghi chú
- Từ 2.8.0 có **xác thực thiết bị** (xem mục “Xác thực thiết bị” ở trên); vẫn chỉ nên dùng trong mạng nhà.
- Khi dùng Caddy HTTPS: **không bao giờ chạy `docker compose down -v`** trong thư mục kho thật, vì lệnh này xóa volume `caddy_data` chứa CA nội bộ; mất CA là phải cài lại trên cả 3 thiết bị. Dùng `docker compose down` (không `-v`) khi cần.
- Không đổi cổng `127.0.0.1:8787` thành mở ra LAN (ví dụ `"9000:8787"`): làm vậy đưa HTTP không qua Caddy ra mạng, bỏ qua HTTPS.
- Muốn dùng ngoài WiFi: cài Tailscale trên PC + điện thoại, mở `https://<tên-tailscale-PC>`; nhớ bật cổng 443 trong tường lửa và thêm subnet Tailscale vào quy tắc Caddy. Hiện tại chỉ LAN; cổng 8787 chỉ lắng nghe `127.0.0.1` (dự phòng PC).
