# Quản Lý Kho — bản chạy local (Docker + SQLite)

Bản đang dùng: server Node trong Docker, dữ liệu là **file SQLite trên ổ cứng**.
PC và điện thoại xem cùng một kho trong mạng nhà, dùng riêng từng máy, không mở cùng lúc.
Repo Cloudflare Worker (`quan-ly-kho`) để nguyên, không nằm trong thư mục này.

## Yêu cầu
- Docker Desktop đang chạy.
- Máy tính và điện thoại **cùng một mạng WiFi**.

## Chạy
```powershell
cd "G:\quan-ly-kho-local"
docker compose up -d --build
```

Mở trên máy tính: **http://localhost:8787**

Mở trên điện thoại: **http://<IP-máy-tính>:8787**
- Xem IP máy tính: `ipconfig` → dòng `IPv4 Address` của card WiFi (dạng `192.168.x.x`).

## Dữ liệu nằm ở đâu
- File SQLite: `G:\quan-ly-kho-local\data\app.db`

## Tự động sao lưu (mỗi ngày)
- Server tự tạo **1 bản backup/ngày** vào `G:\quan-ly-kho-local\data\backups\`,
  tên `backup-YYYY-MM-DD.db`, giữ **30 bản** gần nhất (bản cũ tự xóa, chụp trước lần ghi đầu tiên trong ngày);
  đồng thời tự chụp thêm bản `backup-YYYY-MM-DD-truoc-ghi-de-HHmmssSSS.db` (giữ **10 bản**) trước mỗi lần ghi đè chủ động (`X-Force`).
- Xem danh sách backup: mở `http://localhost:8787/api/backups`.
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

## Nạp dữ liệu từ file backup JSON

Nếu có file `kho-backup-YYYY-MM-DD.json` (xuất từ bản Cloudflare cũ hoặc từ nút
"Sao lưu" trong app), nạp vào DB local như sau:

```powershell
# 1. Tách payload và gửi lên server (giữ đúng UTF-8)
$raw = Get-Content "đường-dẫn\kho-backup-2026-11-06.json" -Raw -Encoding UTF8
$obj = $raw | ConvertFrom-Json
$payload = @{ products = $obj.data.products; transactions = $obj.data.transactions; prescriptions = $obj.data.prescriptions; updatedAt = 0 } | ConvertTo-Json -Depth 20 -Compress
$bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)

$req = [System.Net.HttpWebRequest]::Create("http://localhost:8787/api/state")
$req.Method = "PUT"
$req.ContentType = "application/json; charset=utf-8"
$req.Headers.Add("X-Force", "1")     # ép ghi đè
$req.ContentLength = $bytes.Length
$s = $req.GetRequestStream(); $s.Write($bytes, 0, $bytes.Length); $s.Close()
(New-Object System.IO.StreamReader($req.GetResponse().GetResponseStream())).ReadToEnd()
```

Hoặc đơn giản hơn: mở app → **Sao lưu & khôi phục → Khôi phục từ file** trên
chính giao diện web.

File JSON không có `moneyUnit: "dong"` được coi là nghìn đồng và nhân 1000 khi nạp.
File xuất từ bản 2.6.6 trở đi có cờ đó thì giữ nguyên số đồng. Khôi phục đúng
kho đang chạy bằng cách copy `app.db` (mục sao lưu phía trên), không bằng JSON.
Bản `kho-backup-2026-11-06.json` trong `data/luu-tru/` xuất lúc 19:48, muộn hơn `backup-2026-11-06.db` (14:51), và có thêm đơn bán lẻ `TX_mw4yzqmggwli1` (Cam Thảo 0,1 kg, thành tiền 20 nghìn) mà sổ hiện tại không còn; khôi phục từ JSON này sẽ đưa đơn đó trở lại.

## Chạy test
```powershell
# Test client (trên máy, chỉ cần Node):
node --test tests/client.test.mjs

# Test server thật (cần better-sqlite3 → chạy trong container):
docker run --rm -e DATA_DIR=/tmp/qlk quan-ly-kho:latest npm test
# hoặc nếu chưa build: docker build -t quan-ly-kho:latest .  rồi chạy lệnh trên
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

## Khi server từ chối bản đang sửa

Huy hiệu “Chưa đồng bộ” hiện cạnh nút “Bỏ thay đổi chưa gửi, lấy bản máy chủ” khi máy chủ trả 400 hoặc 428. Bấm nút thì trang hỏi xác nhận, tải file `kho-nhap-bi-tu-choi-….json` trước, rồi lấy lại bản trên máy chủ. Nếu trình duyệt không tải được file, dữ liệu trên máy được giữ nguyên. File này chứa cả kho; xóa khi không cần, và không để thư mục tải của trình duyệt nằm trong repo.

## Ghi chú
- Bản này **không có đăng nhập** — chỉ nên dùng trong mạng nhà.
- Cổng đổi được trong `docker-compose.yml` (mục `ports`, ví dụ `"9000:8787"`).
- Muốn dùng ngoài WiFi sau này: cài Tailscale trên PC + điện thoại rồi mở
  `http://<tên-tailscale-PC>:8787`.
