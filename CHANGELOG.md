# Changelog

Mọi thay đổi đáng chú ý của dự án **Quản Lý Kho** được ghi lại trong file này.

Định dạng dựa trên [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/) và
tuân theo [Semantic Versioning](https://semver.org/lang/vi/).

## [2.38.7] - 2026-11-23

### Sửa
- Điện thoại: thanh đầu cố định nền đặc (logo | Bán tháng | Lợi nhuận tháng | chấm + giờ đồng bộ; hàng 2 là 8 tab chỉ icon); chân tờ ghi Bán lẻ/Thuốc chén nằm trong luồng, không còn thanh fixed. Desktop không đổi. `scroll-padding-top:110px` chừa thanh đầu; `scroll-padding-bottom:230px` giữ (cho bàn phím, thanh fixed cũ vốn ẩn khi gõ).
- Logo là nút vào Thiết bị (chữ "Quản Lý Kho" ẩn); dòng đồng bộ bấm = Tải lại khi chạy từ màn hình chính.
- `?kbdebug=1` là cách duy nhất bật gỡ lỗi bàn phím.

### Đã xóa
- Mã: `footBarShow`, `updateFootBars`, `scheduleFootBars`, CSS `foot-fixed`/`foot-off`/`--foot-h`, nút `#reloadBtn`, chạm 5 lần logo bật kbdebug (và cờ localStorage `kbdebug`).
- Test: "2.15.3 footBarShow…", "2.15.3 updateFootBars…", "2.17.8 kbdebug đọc từ localStorage…" (thay bằng "H.2 kbdebug chỉ bật bằng ?kbdebug=1…"); bỏ các assert CSS thanh fixed trong ca "2.15.3 nút +…" và "2.15.0 …".
- Chưa thử iPhone thật. Ở 320px mỗi tab ~40px (<44) chấp nhận.

## [2.38.6] - 2026-11-23

### Sửa
- Desktop: thẻ Bán/Lợi nhuận tháng chữ lớn, thoáng hơn (nhãn 12px, số 22px, dòng phụ 13px, `--sth` 184→216). Nhãn 12px (không 13px) vì ô chỉ rộng ~138px, "BÁN TRONG THÁNG" 13px sát tràn. Chế độ gọn (`max-height:640px`) giữ nguyên.
- Điện thoại không đổi. Chưa thử Tauri thật.

## [2.38.5] - 2026-11-23

### Sửa
- Desktop: Bán lẻ/Thuốc chén/Nhập hàng cùng cấu trúc Kho tồn (card là khung, tiêu đề nằm trong khung, `.note` phẳng; Thuốc chén 1 khung có vạch ngăn).
- Thanh bên `--sw` 160→180 để "Sao lưu khôi phục" vừa 1 dòng; thẻ thống kê `--sth` 145→184 thoáng hơn (chế độ gọn giữ nguyên).
- Điện thoại không đổi (so 320/375px: 30 phần tử × 17 thuộc tính, 0 lệch). Chưa thử Tauri thật.

## [2.38.4] - 2026-11-23

### Thêm
- Nút HD/FHD (1280x720 / 1920x1080, `LogicalSize`, kẹp 16:9 theo màn hình) ở chân thanh bên, chỉ trong Tauri. Cửa sổ khóa kéo cạnh: bỏ phóng to, mở khóa, đặt cỡ, luôn khóa lại; mọi lỗi (thiếu quyền, API không có) bị nuốt êm.
- Chưa thử Tauri thật.

## [2.38.3] - 2026-11-23

### Sửa
- Desktop: thẻ thống kê trong thanh bên cao cố định (`--sth`); cửa sổ thấp (<= 640px) thu gọn để đủ 8 tab + chân không cuộn (cuộn chỉ khi < 480px).
- Desktop: `.note` trong main (cả Thuốc chén trái) cùng `backdrop-filter`, thay danh sách 3 id của 2.38.2 (thiếu `#remedyNote`).
- Ngày mặc định/đặt lại về hôm nay (autoDate/resetDateToday). Chưa thử Tauri/Mac thật.

## [2.38.2] - 2026-11-23

### Sửa
- Desktop: danh sách tab cuộn khi cửa sổ thấp, chân thanh bên không bị đè (thanh cuộn mảnh, chừa 8px).
- Desktop: Bán lẻ/Thuốc chén/Nhập hàng dùng cùng `backdrop-filter` với Kho tồn khi bật kính (desktop thêm 3 phần tử `backdrop-filter`, chỉ `html.desktop`; điện thoại vẫn 4 như đã chốt 16/11). Chưa thử Tauri thật.

## [2.38.1] - 2026-11-23

### Sửa
- Điện thoại: ô nhập nằm trong chính thanh chân tờ ghi (Thang, Đơn giá) không còn làm `footBarShow` ẩn thanh (iOS đóng bàn phím khi thanh biến mất). Đã thử iPhone thật 23/11.

## [2.38.0] - 2026-11-21

### Thêm
- Desktop (Mac, Tauri, PWA rộng): thẻ "Bán trong tháng" và "Lợi nhuận tháng" hiện trong thanh bên, dưới logo, trên tab Bán lẻ; xếp dọc 2 ô (Hôm nay / Năm mỗi dòng một hàng). Dùng chính thẻ `.stats` và `renderStats` của điện thoại, chỉ đổi CSS (bỏ `html.desktop .stats{display:none}`); không đổi logic tiền.

## [2.37.2] - 2026-11-21

### Sửa
- Hộp xung đột: chọn OK nhưng `pullState` lỗi (mạng) thì `dirty` vẫn bật và nay có hẹn thử lại (`scheduleSyncRetry`), không còn im lặng.

## [2.37.1] - 2026-11-21

### Sửa
- Hộp xung đột: chọn OK thì `conflictOpen` giữ tới khi `pullState` xong (cả khi lỗi) và `pushState` thoát sớm khi đang xử lý xung đột; poll/retry chen vào không còn gửi PUT thứ hai hay hiện hộp lần 2 (đã tái hiện bằng test).
- `pullState`: nếu `dirty` bật sau lúc gửi GET (vd. GET khởi động đang chờ mà người dùng vừa ghi) thì không thay `db`, giữ `cloudBase`; PUT của bản vừa ghi đi theo luồng xung đột bình thường (đã tái hiện bằng test).
- `scaledRemedyCost`: vốn 0 là vốn thật (bỏ `num(prevCost) > 0`), chỉ vốn trống mới lấy giá nhập hiện tại.
- Test: thay ký tự backspace thật bằng `\b` ở hai regex.

### Khác
- Chú thích `XÓA SAU 06/12/2026` đầu `migrateMoneyToDong` (chưa xóa). Rà class CSS không dùng: 0/201.

## [2.37.0] - 2026-11-21

### Sửa
- `pullState` luôn thay dữ liệu bằng bản máy chủ và không bao giờ gửi PUT (bỏ tham số `forceLatest` và nhánh dirty có thể ghi đè lặng lẽ vì `cloudBase` đã bị đẩy lên trước).
- Sửa giao dịch BÁN: vốn 0 là vốn thật (`cost != null`), sửa SL không còn gán lại vốn theo giá nhập hiện tại; chỉ cost trống mới lấy giá nhập hiện tại.
- Biểu đồ Năm: giao dịch có ngày sau năm hiện tại (tới 2100) có cột năm của nó, không còn rơi khỏi biểu đồ.

### Dọn (không đổi hành vi)
- Xóa cụm ô Năm cũ (`#chartYear`, `autoChartYear`, `lastChartYear`, CSS `.chart-year*`): ô đã bị ẩn và không điều khiển biểu đồ.
- `page.js`: bỏ nhánh không chạy (`renderOrder` trong `autoRefresh`, `kg > 0 ?` ở `saveRemedy`, `isFinite` sau `num()`, `d.desk`, dự phòng `padL/yMax/n` của `chartGeo`), `calcRetail` thay bằng `renderNote`, gộp khối nút "+" của `addOrderRow` và hai vòng kiểm trùng của `pickSuggest`, bỏ gán trùng ở `savePreset` và lúc mở tab Thống kê, `money(grand)` thống nhất.
- Giữ có chủ ý (thêm chú thích): kiểm kg/qty/giá ở `saveRetail`/`saveNhap` là lưới an toàn; `moneyUnit` lớp ngoài của `parseBackup` dành cho file viết tay.

## [2.36.2] - 2026-11-21

### Sửa
- `ts` của giao dịch: server và client sanitize/validate dùng `isNumLike` (trước đây `true`, `''`, `[]` lọt qua vì `Number()` ra 0/1).
- `thang` của giao dịch: số lẻ được `Math.round` (như đơn thuốc) ở cả server và client sanitize, không lưu 1.5 vào cột INTEGER.
- Trang thiết lập và log khởi động: bỏ câu nhắc `docker compose logs`, chỉ tới log máy chủ (`logs/server.out.log`).
- `auth.js`: thu hồi thiết bị xóa luôn mục gia hạn cookie trong bộ nhớ.

### Dọn
- `server.js`: bỏ `'use strict'` thừa, bỏ `state.updatedAt` không dùng, `!force` thay `baseHdr != null && !force`, `writeStateTx` thành hàm thường trong transaction của `writeState`, bỏ bốn hàm `insert*` (prepare tại chỗ).
- `auth.js`: dùng lại `forbiddenText` và `formOf` ở `/auth/setup`.
- `src/page.js`: `kInput` rút gọn (`Math.round(đồng) / 1000`, kết quả y nguyên); bỏ id `chartScroll` không ai gọi. Giữ `orderNote` (test 2.10.0 cố định id cũ), các id `*Native` (gọi động `'#' + id + 'Native'`) và id chip (test bắt).
- Thêm test server và client cho `ts`, `thang`, `kInput`.

## [2.36.1] - 2026-11-20

### Sửa
- Thống kê desktop, chế độ Ngày: nhãn trục X hiện đủ 01..N đúng tâm cột (trước đây khi ô ngày hẹp ~22px, nhãn cuối bị kẹp 0,5px làm mất nhãn 29 và lệch nhãn 30); lề kẹp 1px thành 0,5px và khoảng tối thiểu = min(rw+3, ô).

## [2.36.0] - 2026-11-20

### Thêm
- Mở app (Tauri/desktop, PWA standalone kể cả iPhone) là vào tab Thống kê, chỉ lúc khởi động; trình duyệt thường vẫn nhớ tab cũ.
- Thống kê iPhone, chế độ Ngày: hiện đủ mọi ngày của tháng, khung thấy 12 ngày, vuốt ngang xem tiếp (canvas rộng n/12 khung trong `#chartScroll`); tự cuộn đưa hôm nay vào giữa khung khi mở/đổi tháng. Tháng/Năm vẫn vừa khung.

### Đổi
- Công tắc Năm|Tháng|Ngày luôn đưa về kỳ hiện tại (hôm nay / tháng này / năm nay) và chọn sẵn mục hiện tại; ‹ › chỉ đổi kỳ trong chế độ đang xem.

## [2.35.1] - 2026-11-20

### Sửa
- Thống kê điện thoại: nhãn cuối trục X (vd `30`) không còn bị cắt ở mép phải canvas; nhãn cuối luôn hiện, nhãn thưa chồng nó thì bỏ (hàm thuần `chartLabelPlan`).

## [2.35.0] - 2026-11-20

### Thêm
- Thống kê trên điện thoại (PWA/iPhone) dùng chung chức năng với desktop: công tắc Năm | Tháng | Ngày (cao 36px, mặc định Ngày, chọn sẵn hôm nay), bộ đổi kỳ ‹ ›, biểu đồ cột đôi Nhập/Bán, chip Nhập / Bán / Lợi nhuận / Tổng tồn kho (xuống dòng, không tràn ngang). Chạm cột để giữ, chạm cột khác để đổi; biểu đồ `touch-action: pan-y` nên vẫn cuộn dọc. Nhãn trục X thưa khi ô hẹp (`chartLabelStep`: ngày chẵn/mỗi 3-5 ngày), cột vẫn đủ.

### Đổi
- Bỏ đường vẽ biểu đồ tháng cũ của điện thoại (`chartDefaultMonth`, `niceMax`, `axisLabel`); ô "Năm" trong tiêu đề thẻ điện thoại bị ẩn. Desktop và máy chủ không đổi.

## [2.34.1] - 2026-11-20

### Sửa
- Thống kê desktop chế độ Năm giống app Mac: mỗi năm một ô chia đều chiều rộng, cặp cột Nhập/Bán 36px ở giữa ô (nhiều năm thu lại, không chồng); hàng tiêu đề cao cố định 32px nên không nhảy khi đổi Năm/Tháng/Ngày.

## [2.34.0] - 2026-11-20
- Thong ke desktop theo ban chuan Mac moi: bo han 4 o so 2x2 va nhan truc Y (chi giu luoi ngang mo). Bo chon 3 nut Nam | Thang | Ngay (mac dinh Ngay); doi ky: Ngay `< Thang MM/yyyy >`, Thang `< Nam yyyy >` (2000-2100), Nam khong co mui ten. Hang chu thich: nhan ky (dd/MM/yyyy | MM/yyyy | yyyy), Nhap cyan, Ban cam, Loi nhuan xanh la (tong total - von cac giao dich BAN trong cot; von dung chung `txCost` voi `computeStats`), chip Tong ton kho tim sat phai. Cot doi; che do Nam tu nam som nhat co giao dich den nam nay (cap 36px). Nhan truc X trong vien tron 21px (nam: 40px). Re chuot = xem tam, bam = giu, mac dinh chon hom nay/thang nay/nam nay, phim trai/phai di chuyen (dung hai dau), tu focus khi mo tab. Dien thoai khong doi. Quy tac CSS moi dat ngoai khoi desktop (tran 20736). Xoa chartMonths, 4 o so (thk__n, data-s4, tk*). Test + pha thu (ghi de, tinh ca NHAP, sai von, quay vong phim, nam som nhat).

## [2.33.0] - 2026-11-20
- Thong ke desktop: cong tac Thang | Ngay (vien lien cao 26, chu 13) ngay trai bo chon ky. Che do Ngay: bo chon `< Thang MM/YYYY >` (qua ranh gioi nam), moi ngay cua thang mot cap cot Nhap/Ban (28-31 cot, ngay trong = 0; Nhap = tong total NHAP, Ban = tong total BAN, khong tru von; cong don theo 10 ky tu dau cua date), nhan 01..31 (chat thi chi ngay chan), chu thich DD/MM/YYYY hoac --/MM/YYYY. Doi che do/ky bo cot chon. Khong doi 4 o so, du lieu, server; dien thoai khong doi. CSS cong tac nam ngoai khoi desktop (tran 20736 B). Test ca 28/29/30/31 ngay, cong don, tach nhap/ban, thang khac, ranh gioi nam + pha thu.

## [2.32.0] - 2026-11-20
- Kho ton: hai loc bat/tat "Gan het" (0 < ton <= 1 kg) va "Het hang" (ton <= 0, dung sai 1e-9), moi nut co so dem tren toan kho, chi mot loc mot luc, AND voi o Nhap ten, doi loc/tim ve trang 1. Desktop: `Kho ton · n vi thuoc ... [Nhap ten] [Gan het N] [Het hang M] [doi chieu]`; nut Doi chieu chi con icon 30x30 + cham so lech do. Dien thoai: ca 3 nut la icon (kem so dem). Chi loc hien thi, khong doi server/du lieu; test ca bien + pha thu.

## [2.31.1] - 2026-11-19
- Desktop: dong danh sach (Kho ton, Lich su nhap, Lich su ban) luon 1 dong (nowrap, cot ten chiem phan con lai va cat "..."); nut bang mau thanh ben = icon tron 22 (vung bam 28, khong vien/nen); Lich su ban: dong "n giao dich" cung hang tieu de. Chu khong thu nho; dien thoai khong doi; tran CSS desktop test 20480 -> 20736.

## [2.31.0] - 2026-11-19
- 2.31.0b: co chu desktop khong nho hon Mac (px CSS = pt Mac, khong zoom/scale/vw): nang ngay gio + "· n vi" Lich su, goi y, placeholder o tien, chip Thong ke len 13; chu lon hon Mac giu nguyen; test chuan co chu + pha thu 7 cho.
- Desktop theo app Mac, MOT co 920x606 (Tauri 920x602 gom thanh tieu de 24; PWA >=900 van tu bat desktop; dien thoai/pt giu nguyen, do 24/24 bo cuc 320/375/800 khong doi): bo khung ve 1280x720 phong deu (zoom/--z/--vw/--vh/__dz) va nut HD/FHD, bo cuc co gian that theo cua so (phong to: gian theo). Chu giu nguyen co. Le noi dung tren 10, ngang/duoi 16. Thanh ben rong 160 dem 10; nut tab cao toi thieu 30 (nhan dai xuong 2 dong, Sao luu khoi phuc 2 dong), chu 12,5 dam, icon 18 cach chu 6; bo hang 7 cham Nen, thay bang MOT nut bang mau (icon palette 22) cung dong voi dong dong bo, bam mo bang 7 cham, chon xong dong (khoa desktopBg giu nguyen). Kho ton/Lich su nhap/Lich su ban: 10 dong/trang chia deu het chieu cao the (>=26, o 920x578 ~ 39-42), dong trong cuoi trang van co vach ke, phan trang ghim day, tieu de cot chu thuong mau phu (to ghi giu IN HOA). Thong ke: 4 o so xep 2x2. Thuoc chen: bo nut Don moi, them nut + tron 32 ben phai o Nhap ten (action new-remedy cu). Tauri: cua so 920x602, min 880x560, bo khoa 16:9, bo HD/FHD o khay va quyen set-size/unmaximize. Don CSS cu (luat chet chart-year, trung dlg note); CSS desktop 20479/20480 byte.

## [2.30.5] - 2026-11-19
- Desktop (dien thoai/PWA hep giu nguyen): chi hai tong chu (--text chinh, --muted phu theo tung nen) + do cho so am. Bo xanh/tim: cot Thanh tien Lich su nhap, "Tong" Nhap hang, lien ket (ten don) ve chu chinh; lien ket dam + gach chan rgba(255,255,255,.3), khong doi mau khi re; --text2 (.85) ve chinh; icon tab #e2e8f0 ve --text. --muted giu tung nen (0.58-0.87) vi 55-60% khong dat tuong phan 4,5 tren Prism/Cyan/Emerald/Amber/Rose. Test 2.30.5 + sua test 2.20.7 (icon tab). So do: D:Softdo-2.30.5.md

## [2.30.4] - 2026-11-19
- Desktop theo app Mac (dien thoai giu nguyen): Nhap hang o tim ten "Tim vi thuoc", o SL "SL", o gia "Gia (nghin)"; Ban le o tim ten "Tim vi thuoc"; chu mo dong dang go Nhap hang/Ban le "Chon vi thuoc o o tren" (Thuoc chen giu "Ten vi thuoc"). aria-label giu nguyen. Nut "Luu don"/"Ban don" da xanh (rgba(64,128,242,.5)) tu 2.23.0, khong sua.
- Test them 1 ca + pha thu.
- 2.30.4c: Thuoc chen desktop o tim ten cung "Nhap ten" (bo dong gan "Tim vi thuoc"); 4 o tim ten desktop dong nhat; "Tim don da luu" giu nguyen.
- 2.30.4b (sua theo ban bao cao Mac): o tim ten Nhap hang/Ban le desktop la "Nhap ten" (sua loi "Tim vi thuoc"); dong dang go cao dung bang dong du lieu (c-act/c-del padding doc 0, 10 hang deu nhau <=0,5px o 1280x720 va 1920x1080); Thuoc chen dong go phang (o Gram khong vien/nen, dung lai quy tac Ban le/Nhap hang).

## [2.30.3] - 2026-11-19
- Desktop, tab Nhap hang theo app Mac: chan to ghi co chu mo "Tong tien nhap (nghin): N" (tong cac dong da them, cung ham fmtMoney voi hang Tong) ben trai, nut "Luu don" (khong icon) ben phai, mot hang; dong dang go khong con chu "Gia nhap gan nhat" (van dien san o gia, thong tin chuyen vao title o ten). Do 1280x720 va 1920x1080: chan 1 hang, khong tran, tong/nut khong de phan trang; o gia can phai sat nut +. Dien thoai (320/375/800) khong doi (so do tung phan tu trung HEAD), logic luu/tien khong doi.
- Test client 441 pass; test moi + 5 pha thu bi bat.

## [2.30.2] - 2026-11-19
- Desktop, tab Thong ke: 8 so gom thanh 4 o (moi o hai so, vien manh, nen trang .06, bo 14): Ban/Loi nhuan hom nay | Ban/Loi nhuan trong thang | Ban/Loi nhuan trong nam | Nhap trong thang + Tong ton kho (theo yeu cau nguoi dung). Do 1280x720: 4 o rong 202/204/190/197, het o x=1109 (hang rong 968 den x=1247), cao 51, khong tran; bieu do 513 cao. Dien thoai, logic tinh khong doi.
- Test client 439 chay + 1 skip pass; kiem thu tu khoa/nhan va 4 o thk__g.

## [2.30.1] - 2026-11-19
- Desktop, tab Thong ke: them lai Ban trong thang va Loi nhuan thang (theo yeu cau nguoi dung), hang so thanh tam so: Nhap trong thang, Ban trong thang, Loi nhuan thang, Ban hom nay, Loi nhuan hom nay, Ban trong nam, Loi nhuan nam, Tong ton kho. Do 1280x720: hang rong 968, het o x=1041, mot dong, khong tran, cao 33. Dien thoai va logic tinh (computeStats) khong doi; so am van do (s4 co co neg).
- Test client 439 chay, 438 pass, 1 skip; pha thu (doi nguon tkExpMonth sang dExp) bi test bat.

## [2.30.0] - 2026-11-19
- Desktop (html.desktop) bo hang 4 o so tren dau: xoa section .stats4 va CSS .stats4/.s4; the noi dung details.card chiem ca hai hang luoi (grid-area:1/2/3/3, cao 670px o 1280x720).
- Tab Thong ke (desktop): hang so duoi tieu de gom Nhap trong thang, Ban hom nay, Loi nhuan hom nay, Ban trong nam, Loi nhuan nam, Tong ton kho (data-s4 tkImp/tkStock them moi, van chi hien lai so computeStats). Luu y: o desktop khong con hien Ban trong thang va Loi nhuan thang (dien thoai van co).
- Do: nut cua so (#tb, y 0-24) cach nhom nut nam ‹ 2026 › (y 51-81) 27px, khong de; 8 tab khong tran; 320/375/800 giong HEAD. Khong doi du lieu/tien/ton kho; app Tauri khong can sua.

## [2.29.0] - 2026-11-19
- Ban le + Nhap hang theo app Mac, chi desktop (html.desktop); dien thoai giu nguyen (do 320/375/800/1300: 0 khac biet toa do, chi doi chu tieu de an "SL" -> "SL (kg)" o Ban le).
- Dong dang go = dong thu n+1 ngay duoi hang tieu de cot (dong ghi, dong go, dong trong cung mot bang; du 10 dong thi sang trang moi; chon vi/ghi xong to ghi tu nhay trang chua dong go). Dung lai cach Thuoc chen (ham chung pendPaging; script dau trang gop 3 to ghi).
- Dong go: "+" mo o cot STT, ten vi dam, goi y doi "(111 kg)" la chu mo nho BEN TRAI o SL (khong de), o SL/Tien phang khong vien (khong khung rieng), o tien chu mo "Tien (nghin)" (khong hien so 0), nut tron "+" 22px; tieu de cot "SL (KG)", "GIA BAN"/"GIA NHAP"; Nhap hang an o "Gia nhap N" cong don, goi y gia nhap gan nhat nam cung dong.
- Ban phim (desktop): chon vi -> o SL; Enter o SL -> o tien; Enter o tien hoac bam "+" -> dua dong vao, tro ve o tim vi/ten; dong sai bao loi nhu cu, tro o o loi. Dien thoai khong doi (Enter o SL van thu them dong).
- Khong doi du lieu, tien, ton kho, luat luu/ban/kiem. CSS desktop 20447/20480 byte (gom .pend dung chung cho 3 to ghi, rut gon chu thich).

## [2.28.0] - 2026-11-18
- Doi chieu dac ta app Mac (3), chi desktop (html.desktop); dien thoai giu nguyen (do lai 16 phan tu Thuoc chen o 390/800/1300: giong het truoc/sau).
- Don moi (Thuoc chen): chi mot tac dung, KHONG hoi xac nhan: to ghi moi tinh (bo don dang mo, dong dang ghi, o tim don, so thang/gia ve mac dinh), tro ve "Tim vi thuoc"; khong xoa don da luu.
- Xoa don luon hien o desktop (Xoa don | Luu don/Sua don | Ban don): don da luu hoi roi xoa; chua luu co dong thi hoi "Xoa don dang ghi (N dong) va ghi lai tu dau?" roi sach to ghi; trong thi khong lam gi. Chan to ghi van mot hang o 1280 (do 43px cao, 3 nut vua).
- Trang 1: nap don nhieu dong ve trang 1 (da dung, them test don 12 dong); danh sach DON DA LUU ve trang 1 khi vao tab, sau Don moi, sau xoa don.
- Thanh ben: bam logo hoac chu "Quan Ly Kho" = Tai lai (co hoi khi con don nhap, khong dang xuat), title "Tai lai", con tro tay; bo nut Tai lai va Thoat o chan (chan chi con Nen, dong dong bo, cong tac kinh); bo exitAppClick/exit-app; nut Tai lai tren thanh dau an o desktop. Dien thoai van bam chu "Quan Ly Kho" vao Thiet bi (brandDevicesClick giu cho dien thoai).
- Tab Sao luu khoi phuc (desktop): vien "Sao luu | Thiet bi" ben phai thanh dau; mac dinh Sao luu moi lan vao tab; Thiet bi: thiet bi chu (fetch /auth/devices 200) thay the "Mo quan ly thiet bi" dan toi /auth/devices; thiet bi khac thay "Chi thiet bi chu moi quan ly duoc thiet bi khac."; dang cho thay "Dang kiem tra...". Chua lam: danh sach thiet bi, Thu hoi, Tao ma moi, Dang xuat thiet bi ngay trong app (dung trang /auth/devices co san).
- CSS desktop 20375 byte (<= tran 20480). Khong doi du lieu/tien/ton kho, server.js, auth.js.

## [2.27.0] - 2026-11-18
- Mot luat tim chung (dong bo 3 app): moi o tim ten (Kho ton, Lich su nhap/ban gom ten vi VA ten don, hang gop khop khi ten don hoac bat ky vi nao trong don khop, goi y vi thuoc, tim don da luu) chi khop TRON mot chu hoac cum chu lien nhau (khong phan biet hoa/thuong, co/khong dau, d = d); chua tron chu thi khong hien; o trong = hien tat ca. Truoc day Kho ton/Lich su khop mot phan (indexOf) - ghi chu "giu luat cu" cua 2.15.9 het hieu luc. Ap dung ca dien thoai (luat du lieu).
- Thanh ben desktop: "Tai lai" va "Thoat" (chi Tauri) hoi "Con don nhap chua luu. Tai lai/Thoat se mat don nhap chua luu. Van tai lai/thoat?" khi con don nhap (dung chung mot ham kiem); Thoat chi dong cua so, khong dang xuat, khong xoa cookie. Bam "Quan Ly Kho" khi khong phai thiet bi chu: them toast "Chi thiet bi chu quan ly duoc thiet bi." (nut/fetch /auth/devices co tu 2.13.0, trang do co lien ket "Ve kho").
- Khong doi du lieu/tien/ton kho, server.js, auth.js.

## [2.26.1] - 2026-11-18
- Thuoc chen desktop: nut vien "+ Don moi" (cao 32, luon hien, giua o Tim don va nut ngay): dang mo don co san = ve to ghi trong ngay (nhu X); dang ghi do thi hoi "Bo N dong dang ghi va lam don moi?" (confirm cua trinh duyet: OK/Huy), dong y thi xoa dong, o tim, thang/gia ve mac dinh; luon tro ve o "Tim vi thuoc".
- Ban le va Nhap hang desktop: nut vien "Xoa het" (Ban le ben trai nut ngay, Nhap hang cuoi hang): co dong nhap hoac chu dang go thi hoi "Xoa het N dong dang ghi va lam lai tu dau?", dong y thi xoa nhap (GIU ngay dang chon) va tro ve o tim vi; khong co gi thi khong lam gi. Nut tao bang JS desktop nen dien thoai khong co.
- Sua loi hien thi: nut ... cua dong du lieu to ghi bi cat o mep phai (nay 22x22, cach mep the 11); dong dang go cua Thuoc chen luon co o Gram va nut + (mo, vo hieu khi chua chon vi); chu "Gram" khong con bi cut.
- Khong doi du lieu/tien/ton kho/luat luu-ban. Hop "Ten don moi" van la window.prompt (hop tu ve can them khoi HTML/JS > 30 dong).

## [2.26.0] - 2026-11-18
- Thuoc chen (chi html.desktop; iPhone/PWA hep giu nguyen): hang A chia doi 50/50 cao 32: trai = Thuoc chen + o "Tim vi thuoc", phai = o "Tim don da luu" + nut ngay; an select #remedyPreset (con trong DOM cho dien thoai), khong con "Don moi".
- O "Tim don da luu": khop tron tu/cum tu (wholeWordMatch), tha xuong toi da 5 dong x 36, ↑/↓ xoay vong, Enter chon dong sang (chua sang = dong dau), Esc xoa o; chon xong nap don, xoa o tim, tro ve "Tim vi thuoc". Dang mo don: o phai hien ten don + nut ✕ (bo don, to ghi ve trong).
- To ghi: dong dang go la dong thu n+1 trong 10 dong (du 10 dong thi sang trang moi, to ghi tu nhay toi trang do), dong "+ Ten vi thuoc" khi chua chon vi, o Gram rong 52 (placeholder Gram), goi y "(x lang)" viet day du, tong 1 thang cao 38; chan to ghi 1 hang (o thang 44, o gia 58), hep thi xuong 2 hang. Luu don chua co ten: desktop hoi bang hop thoai "Tên đơn mới".
- Khong doi du lieu/tien/ton kho/luat luu-ban; them data-action close-preset.

## [2.25.1] - 2026-11-18
- Dong trang thai thanh ben (#syncLine): co thay doi chua gui qua han (cung dieu kien huy hieu) thi hien "Chua dong bo" cham do, khong con "Da dong bo" sai.

## [2.25.0] - 2026-11-18

### Thay đổi
- Thống kê (desktop) giống app Mac mới nhất: mặc định và mỗi lần mở tab = năm hiện tại, 12 nhóm tháng; bỏ chế độ "12 tháng gần nhất"; bộ chọn ‹ Năm 2026 › kẹp 2000..2100; nhãn trục X 01..12; bỏ tooltip nổi và chú giải đáy, thay bằng dòng dưới hàng 4 số (--/----, chip Nhập/Bán —; rê/bấm tháng hiện MM/yyyy + số, kèm vạch dọc).
- Thanh bên desktop: dòng trạng thái đồng bộ (đọc cờ có sẵn: Đã đồng bộ HH:MM / Mất kết nối / Chưa lưu được), nút Tải lại và Thoát (Thoát chỉ trong app Tauri). iPhone không đổi.

## [2.24.1] - 2026-11-18

### Thêm
- Tab Thống kê (desktop): nút ‹ nhãn › đổi năm của biểu đồ (mặc định "12 tháng gần nhất"; Năm Y = tháng 01..12; chặn ở 2000; › từ năm hiện tại về mặc định; mỗi lần mở tab về mặc định). 4 số phía trên không đổi. iPhone giữ nguyên.

## [2.24.0] - 2026-11-18

### Thay đổi
- Tab Thống kê (chế độ desktop): một thẻ phẳng mờ có tiêu đề "Thống kê (nghìn đồng)", hàng 4 số (Bán/Lợi nhuận hôm nay, Bán/Lợi nhuận năm, dùng lại computeStats), biểu đồ cột đôi 12 tháng gần nhất (nhãn yy-MM), trục Y bên phải số đầy đủ, chú giải dưới trục X, hover/bấm ra vạch dọc + tooltip. Bỏ ở desktop: ô năm, dải Nhập/Tồn trong tiêu đề thẻ. iPhone/PWA thường giữ nguyên. Màu cột Nhập #44DAFE, Bán #FFA33D (biến --chart-imp/--chart-exp, cả iPhone).

## [2.23.2] - 2026-11-18

### Sửa
- Máy chủ: PUT /api/state với X-Force mà không chụp được bản trước-ghi-đè thì trả 500 và KHÔNG ghi (trước đây vẫn ghi đè); sao lưu hằng ngày vẫn fail-open. Thêm test.
- Tài liệu: khung cảnh báo hub Mac ở README.md/README-LOCAL.md, mốc kiểm BAO-CAO-REVIEW.md, ghi chú bản Docker cũ trong CLAUDE.md.
- CI: thêm bước `npm run lint:client` (continue-on-error, chỉ cảnh báo) sau `npm run lint`.
- CI: job lint chạy `npm ci --ignore-scripts` trước `lint:client` (trước đó thiếu eslint nên bước lỗi âm thầm).

## [2.23.1] - 2026-11-18

### Sửa
- App Tauri (desktop): khung nội dung không còn đè 3 nút thu nhỏ/phóng to/đóng. Có `window.__TAURI__` thì thêm `html.tauri`, lề trên khung 34px (PWA giữ 16px); tab Sao lưu co khít để vừa khung khi có dòng thư mục. Đo ở 1280x720 và 1920x1080: không tràn, tờ ghi 10 dòng.

## [2.23.0] - 2026-11-18
- Giao diện "phẳng mờ, KHÔNG kính" của app Mac native cho `html.desktop` (Tauri + PWA desktop) và `html.pt` (iPhone, giữ bố cục): nền gradient 135 độ theo 7 theme (Navy mặc định, Prism, Cyan, Emerald, Amber khóa `gold`, Rose, Graphite); thẻ trắng .07 viền .10 bo 20 (thanh bên 24, tờ ghi/thẻ Sao lưu 18); thanh bên 230 rộng; 4 ô số bằng cao (26/600, nhãn 10); nút danh sách 34px hover sáng lên 120ms; ô nhập viên 32px focus viền .35; nút chính xanh .50/.60; cột tờ ghi 38/tên/120/110/34; 7 chấm nền một hàng 22px; toast, hộp gợi ý, hộp thoại nền đặc; biểu đồ Nhập cyan, Bán cam.
- Kính MẶC ĐỊNH TẮT toàn app: `--blur:none` ở :root, chỉ `html.glass` bật lại; công tắc "Hiệu ứng kính" ở thanh bên (tab Sao lưu trên điện thoại), khóa mới `kho_glass_v2` ('1' = bật; giá trị cũ không bật); `?glass=1`/`?glass=0` đặt khóa. Bỏ `html.noglass` và `?glass=0` cũ (thành mặc định).
- Chữ phụ và chữ đỏ có độ đậm riêng theo theme để giữ tương phản >= 4,5 (bảng nền tối thuần .58 trắng và #FF7373 của đặc tả không đạt trên Prism/Cyan/Emerald/Amber/Rose; Navy dùng #FF7676).
- Không đổi luật nghiệp vụ, server.js, auth.js, API; mọi id/data-action giữ nguyên.
- Chưa làm (đợt sau): thẻ quản lý thiết bị, dòng trạng thái đồng bộ ở thanh bên, nút "Chọn thư mục…", banner chỉ đọc; nút "Tải lại"/"Thoát" cạnh công tắc kính; dòng phụ ô số tự thu nhỏ; bộ chọn năm ‹ › ở Thống kê.

## [2.22.5] - 2026-11-18
- Danh sách bản .db: 401 không đặt thêm câu trùng toast (`#bakStat` rỗng, danh sách ghi "Không xem được danh sách bản sao lưu"), `#bakStat` bỏ `aria-live` thừa (giữ `role="status"`), nhiều trang ghi "Trang p/n — a/b bản".

## [2.22.4] - 2026-11-18
- Danh sách bản .db: ghi chú khôi phục đúng quy trình WAL (xóa app.db-wal/-shm), dòng trạng thái `role="none"` + một dòng `aria-live` riêng (`#bakStat`), pager rỗng không chiếm lề; test nút làm mới (treo/chồng request).

## [2.22.3] - 2026-11-18
- Danh sách bản .db: 401 báo "Thiết bị chưa được duyệt" (gọi noteAuthLost), nhãn "trước ghi đè", ẩn phân trang khi 1 trang, nút làm mới khóa + danh sách mờ khi tải, role list/listitem + aria-live, ghi chú "Chỉ xem".

## [2.22.2] - 2026-11-18
- Độ sáng kính đồng nhất theo token `--pnl` (thẻ, 4 ô số, tab, khung Sao lưu = độ sáng tờ ghi trên nền tối) và `font-family:inherit` cho button/input/select/textarea (nút chọn nền hết rơi về Arial).

## [2.22.1] - 2026-11-18
- Sửa test: bỏ byte NUL thô trong regex, quét *.md đệ quy; dọn tiến trình/thư mục thử ổn định trên Windows; `engines.node` ">=22 <25". Không đổi hành vi app.

## [2.22.0] - 2026-11-18

- Tab Sao lưu giống app Mac: thẻ "File sao lưu trên máy này" (dòng thư mục + Mở thư mục chỉ trong Tauri, khôi phục đỏ nhẹ) và thẻ "Bản sao lưu trên máy chủ" (GET /api/backups, 10 dòng/trang, làm mới, chỉ đọc).

## [2.21.5] - 2026-11-18

- Sao lưu/khôi phục: chữ bớt khẳng định ("Đã gửi lệnh tải hôm nay"); nút khôi phục không kích hoạt tự sao lưu; chặn khôi phục khi mất xác thực/đang đồng bộ; sửa ký tự điều khiển trong tài liệu (+ test quét *.md); README-LOCAL "giữ N bản".

## [2.21.4] - 2026-11-18
- Xóa route /favicon.ico 204 đã chết trong server.js; thêm test HTTP icon PWA công khai (GET/HEAD 200, Content-Type) và /api/state vẫn 401.

## [2.21.3] - 2026-11-18
- Icon mới (hộp trắng nền navy): PNG thật trong src/icons (192/512/maskable/180, favicon.ico/svg) thay icon sinh bằng mã; logo trong app là hộp trắng; PUBLIC thêm 3 đường icon.

## [2.21.2] - 2026-11-18
- saveTxEdit: hoàn tác khi giá thấp hơn vốn trả tồn đúng chiều cho dòng NHAP có cờ rx (cùng lỗi delTx 2.21.1); thêm test /inter.woff2.

## [2.21.1] - 2026-11-18

- Sao lưu/khôi phục: khôi phục tải bản hiện tại rồi hỏi lại "đã thấy file chưa" trước khi ghi đè (trình duyệt chặn tải thì mã không biết được); tự sao lưu ngày chạy ngay trong cú bấm (bỏ `setTimeout`), lời báo "đã gửi lệnh tải". Hoàn tác `delTx` đơn NHAP cộng tồn lại đúng; menu dòng không còn giật focus khi cuộn; sửa dòng thuốc chén cũ thiếu `g` hiện gram quy đổi; máy chủ trả 404 JSON kèm header bảo mật; log/README ghi "bản" thay "ngày"; `theme-color` navy; xóa file rác `120`, `36`.

## [2.21.0] - 2026-11-18

- Font: ưu tiên SF Pro của hệ điều hành, dự phòng Inter (OFL, subset Latin/Việt, 44 KB, phục vụ `/inter.woff2` sau cổng xác thực); icon: bộ Lucide (ISC) thay sprite cũ, thêm `i-inbox`/`i-outbox`/`i-drive` cho Lịch sử nhập/bán và Sao lưu; không đổi bố cục.

## [2.20.14] - 2026-11-18

### Sửa
- Nền tối (data-bg): `--red-text` #fca5a5 → #fecaca, tương phản số âm/chữ đỏ trên điểm sáng nhất gradient + 14% trắng từ 3,90–4,79 (Cyan 3,99, Emerald 4,19) lên ≥ 5,12.

## [2.20.13] - 2026-11-17

### Thêm
- iPhone/PWA (màn cảm ứng, hoặc `?pt=1`): dùng lớp màu/kính của desktop (nền navy + 6 nền, chữ sáng, nút/tab kính, bộ chọn nền cuối tab Sao lưu); không đổi bố cục, không thêm backdrop-filter; manifest màu navy.

## [2.20.12] - 2026-11-17

### Thêm
- PWA Edge trên PC (standalone, chuột, rộng >= 900px) tự bật giao diện desktop; `?desktop=0` tắt và nhớ; viên HD/FHD chỉ có trong Tauri.

## [2.20.11] - 2026-11-17

### Thêm
- Tab Sao lưu: nút "Mở thư mục" mở thư mục datauu-tru trong Explorer; trong app Tauri file kho-backup-*.json tải về được lưu vào đó (không ghi đè, trùng tên thì thêm (2)) (chỉ hiện trong app Tauri).

## [2.20.10] - 2026-11-17

### Đổi (chỉ html.desktop)
- Bộ chọn nền còn 7 nền tối có nhãn (Navy mặc định, Prism, Cyan, Emerald, Amber, Rose, Graphite); xóa 8 nền cũ, nền đã lưu không còn thì về Navy.

## [2.20.9] - 2026-11-17

### Thêm (chỉ html.desktop)
- Thuốc chén: tờ ghi chia đôi, nửa phải là danh sách đơn đã lưu (10 dòng/trang, bấm dòng để chọn đơn).

## [2.20.8] - 2026-11-16

### Sửa (chỉ html.desktop)
- Nền mặc định là navy (đã lưu lựa chọn khác thì giữ); chấm navy là chấm thứ 9.
- Nút không còn xanh lục: mục chọn/nút chính = kính sáng hơn + viền sáng + chữ đậm (token --sel-*), nút thường dịu hơn (--nb, --hv).
- Số liệu (SL, giá, thành tiền, tổng) và icon cùng một màu chữ chính (--brand-text/--green-text/--blue-text = --text); số âm đỏ giữ nguyên.
- Danh sách thả xuống của ô chọn có nền/chữ theo bảng màu (navy không còn nền trắng chữ sáng).
- Hộp thoại: lề trong 16px, dòng phụ/tờ ghi/tham số cùng lề tiêu đề.

## [2.20.7] - 2026-11-16

### Sửa (chỉ html.desktop)
- Viên kính chung: HD/FHD, phân trang, Lưu đơn + Bán đơn (Thuốc chén); kính mỏng hơn (viền tối .16, bóng đáy 0 8px 18px, thêm --k3t); icon tab một màu #334155 nét 1,75.
- Nút "+" Nhập hàng (.nhap-add) lỗi méo/lệch: nay cùng luật tròn 28x28 với Bán lẻ/Thuốc chén.
- Số trong ô nhập số to đậm (15px/700, tabular-nums), ô vẫn 80x28.
- Gợi ý đơn vị SL thành ô riêng bên trái ô số (cột SL 176, Tên 270), không chồng ô nhập; chỉ đổi giao diện/vị trí.
- Nền thứ 9 navy (mẫu thanh Safari #142844) với token chữ sáng.

## [2.20.6] - 2026-11-16

### Sửa (chỉ html.desktop)
- Mọi ô số ngắn (SL/giá dòng nhập Bán lẻ, Thuốc chén, Nhập hàng; số thang, giá thang; hộp thoại sửa giá/số lượng) rộng 80px cao 28px căn phải; ô năm Thống kê 64px; ô giá cột Giá căn phải thẳng cột.
- Thanh đầu Thuốc chén: tiêu đề, ô nhập tên, chọn đơn, ngày (ô nhập tên dời lên bằng JS desktop, giữ id và luồng gợi ý; HTML gốc và điện thoại không đổi).

## [2.20.5] - 2026-11-16

### Sửa (chỉ html.desktop; gộp cả 2.20.4 chưa phát hành: khung gợi ý 3 hàng x 38px)
- Tờ ghi gọn: nút 30px, phân trang 26px, "..." 32x22, "+" 28px, ô nhập 28px; cột STT 40 / Tên 290 / SL 110 / Giá 100, cột thao tác auto, nút sát trái; mọi đường ngang 1px cùng màu (bỏ viền 2px trước Tổng, bỏ chồng viền).
- Tờ ghi là kính (trắng .2, vệt sáng, --kb, --k3d), bảng trong suốt; mọi .btn và ô nhập/chọn/năm cùng họ kính 3D, bo 999px; nút chính (green/primary/dark, trang hiện tại) cùng kính nhuộm xanh lá. Không thêm backdrop-filter.

## [2.20.4] - 2026-11-16

### Sửa (chỉ html.desktop)
- Khung gợi ý/lọc tên (Bán lẻ, Thuốc chén, Nhập hàng, Kho tồn, Lịch sử nhập/bán) cao đúng 3 hàng x 38px + viền 2px = 116px, đệm 0, cuộn guồng (scroll-snap), không nửa dòng. Nguyên nhân: JS đo hàng bằng getBoundingClientRect bị nhân zoom (z khác 1 làm khung quá cao); Kho tồn/Lịch sử không có giới hạn 3 hàng. Desktop bỏ đo JS, dùng CSS; điện thoại/PWA không đổi.

## [2.20.3] - 2026-11-16

Không đổi dữ liệu/logic tiền; chỉ `html.desktop`. Đi kèm `"shadow": false` ở `tauri.conf.json` (repo app Tauri) để hết viền xám 9px native quanh cửa sổ.

- Ba nút Thu nhỏ/Phóng to/Đóng không còn đè lên ô "Tổng tồn kho": thanh tiêu đề nổi 24px, nút 36px; hàng 4 ô bắt đầu cách mép trên 26px (đo ở 1280x720, 1600x900, 1920x1080: 0 phần tử giao nhau).

## [2.20.2] - 2026-11-16

Không đổi định dạng dữ liệu, không đổi logic tiền. Chỉ thay đổi khi `html.desktop`; PWA/iPhone/Safari không đổi (trừ màu dải biểu đồ đọc từ biến CSS, mặc định giữ màu cũ).

- Kính 3D bằng CSS thuần (bám `glass.rs`): viền 4 cạnh sáng trên-trái (trắng .9) / tối dưới-phải (mực .24), highlight inset, quầng sáng trong, bóng trong đáy, specular chéo 120 độ, bóng rơi 3 tầng; hover nổi (translateY -1px, sáng hơn), nhấn lõm; mục chọn là kính nhuộm xanh lá nhạt, chữ xanh lá đậm. Áp cho viên danh mục, HD/FHD, 4 ô lớn, nút phân trang/thanh thẻ/chân tờ ghi, chấm màu nền; thẻ nội dung nhẹ hơn. Không thêm backdrop-filter, transition chỉ transform/box-shadow/background-color.
- Thống kê: bỏ dải nền tháng hiện tại (biến `--chart-hi` trong suốt ở desktop); biểu đồ giãn đầy chiều cao thẻ.
- Thanh tiêu đề tự vẽ nổi lên trên cùng (28px, nút 40px), nội dung cách mép trên 14px; vùng trống quanh logo kéo được cửa sổ.
- Khung phủ kín viewport (`--vw`/`--vh` = cỡ cửa sổ / zoom) nên không còn dải hở khi tỉ lệ cửa sổ lệch 16:9.
- Bán lẻ, Thuốc chén, Nhập hàng, Thống kê lấp đầy chiều cao thẻ (hàng bảng giãn đều); Sao lưu co theo nội dung.

## [2.20.1] - 2026-11-16

Không đổi định dạng dữ liệu, không đổi logic tiền. Chỉ thay đổi khi `html.desktop` (app Tauri); PWA/iPhone/Safari không đổi.

- Khớp app GPUI thật: bốn ô lớn Nhập/Bán/Lợi nhuận/Tồn kho (nhãn HOA, số lớn, bỏ "nghìn đ", hàng phụ "Hôm nay/Năm" ở Bán và Lợi nhuận, dùng lại `computeStats`), cùng một kiểu kính trong viền mảnh trung tính.
- Thanh bên như GPUI: logo, hai viên HD/FHD (Tauri: `setSize` vật lý, kẹp theo vùng làm việc, thêm quyền `allow-set-size`/`allow-unmaximize`), nút danh mục là viên viền mảnh; mục chọn chữ và viền xanh lá, không tô đặc.
- Nền mặc định kiểu GPUI (gradient hồng nhạt đến xanh lá nhạt) là chấm đầu; thêm 7 màu cũ thành 8 chấm.
- Tờ ghi (Bán lẻ, Thuốc chén, Nhập hàng) đồng bộ kính, bỏ nền kem/viền đỏ/chữ nâu; chân gọn một hàng; hover/focus của tiêu đề thẻ, ô năm, ô nhập, hàng bảng, nút cùng họ kính (độ trong thân thẻ giữ .50).
- Không cuộn: thẻ `overflow:hidden`, nội dung vừa khung 1280x720/1920x1080 (ngoại lệ duy nhất: khung gợi ý tên 3 dòng, ẩn thanh cuộn); nội dung bắt đầu dưới thanh tiêu đề tự vẽ.
- Thống kê: ẩn khối Nhập/Tồn ở đầu thẻ (CSS, DOM còn), ô năm kính, biểu đồ cao vừa khung, cột Nhập xanh dương dịu (biến `--chart-imp`).
- Tauri: thanh tiêu đề trong suốt, bỏ chữ tiêu đề.

## [2.20.0] - 2026-11-16

Không đổi định dạng dữ liệu. Chỉ thay đổi khi `html.desktop` (app Tauri); PWA/iPhone/Safari không đổi (trừ hiệu chỉnh vị trí menu dòng vô hại khi z=1).

- Khung vẽ cố định 1280x720 phóng đều: `html.desktop{zoom:var(--z)}`, `--z = min(innerWidth/1280, innerHeight/720)` cập nhật khi resize; kích thước cố định (`--sw`, `--g`, 720px thay `100vh`/`clamp(vw)`), nên 1280x720, 1600x900, 1920x1080 cho cùng bố cục. Menu dòng (`toggleRowMenu`) và `rw` ô SL chia cho `window.__dz`; menu dòng còn tự hiệu chỉnh vì thẻ có backdrop-filter làm khối chứa của `fixed` (lệch cũ cả khi z=1).
- 7 màu nền (sương trắng, hồng, đào, vàng kem, xanh lá, xanh dương, tím) bằng 7 chấm cuối thanh bên (JS dựng, `localStorage.desktopBg`, `html[data-bg]` đổi `--bt` của `body::before`). Pixel thật: tương phản thấp nhất toàn bộ 7 màu x nền sáng/tối = 5,48 (chữ trắng trên xanh); ô số 5,57.
- 4 ô lớn đơn sắc: bỏ tông hồng/ngọc/kem/xanh, nền kính trắng như tab, icon và số xanh lá (số âm vẫn đỏ).
- Tờ ghi (bán lẻ, thuốc chén, nhập hàng) desktop: mỗi trang đúng `PAGE_SIZE`=10 hàng (hàng trống có đường kẻ), thanh phân trang luôn hiện (Trước/Sau/số trang); nhập hàng được phân trang (trước đây không). Dòng mới thêm tự lật tới trang cuối; xóa làm trang cuối rỗng thì lùi trang. Thứ tự, tổng tiền, dữ liệu không đổi. Hàng cao 27px (nút icon 24px) để 10 hàng + phân trang + Bán đơn vừa thẻ ở Bán lẻ/Nhập hàng; Thuốc chén vẫn cuộn trong thẻ (nút Bán đơn dính đáy).
- Rủi ro: tờ ghi desktop hàng thấp hơn trước (34 → 27px); phóng không chẵn (zoom 1,25) có chênh dưới 1px do làm tròn; cửa sổ phóng to không còn 16:9 thì khung căn giữa ngang và cắt phần thừa dọc (dùng min của hai tỉ lệ).
- Phía app Tauri (repo riêng): thanh tiêu đề luôn chèn trong Tauri, khóa 16:9 ở sự kiện Resized, tray "HD 1280×720"/"Full HD 1920×1080".

## [2.19.0] - 2026-11-16

Không đổi định dạng dữ liệu. Chỉ thay đổi khi `html.desktop` (app Tauri); PWA/iPhone không đổi vì `section.stats4` ẩn mặc định (`.stats4{display:none}`).

- Chế độ desktop v2: bố cục thanh bên kiểu app GPUI (logo + tab dọc bên trái, khung cố định 1280x720 đến 1920x1080, thẻ đang mở cuộn trong khung, thanh `.card__bar` dính trên), thẻ nhuộm màu bo 22px, đường kẻ hàng ở tờ ghi, tab/nút/ô tìm kiếm dạng viên.
- 4 ô lớn: lợi nhuận hôm nay/tháng/năm và tổng tồn. Chỉ hiển thị lại số `computeStats` đã tính, qua `fmtMoneyInt`/`fmtQtyInt` (không logic tiền mới).
- Màu nhấn desktop đổi từ tím sang xanh lá `#047857` (tab chọn, phân trang, nút chính, viền focus, liên kết), chữ trắng trên nền này 5,48.
- Nút "Bán đơn" ở tờ ghi dính đáy khung (`html.desktop .note{overflow:clip}` + `.note__foot{position:sticky}`), vẫn thấy khi tờ ghi dài.
- Số đo (Edge headless, nền mô phỏng acrylic đen và trắng, 1280x720 và 1920x1080, 6 tab): 24/24 ca không tràn trang; tương phản pixel thấp nhất 5,48 (chữ trắng trên xanh), chữ phụ 5,66, tab 7,65, ô số 7,01; frame time cuộn Lịch sử 5,0 ms (đo vòng trước).
- Chưa làm được bằng CSS thuần: icon tìm kiếm cạnh logo, phân trang dính đáy khung, nút Bán đơn giữ nguyên vị trí cũ trong tờ ghi (chỉ dính đáy).
- Rủi ro hiển thị tiền: `fmtMoneyInt` cắt phần lẻ nghìn đồng như dải số cũ, nên ô lớn có thể lệch dưới 1 nghìn đồng so với số lẻ thật.

## [2.18.0] - 2026-11-16

Không đổi định dạng dữ liệu.

- Chế độ desktop `html.desktop`: bật bằng `?desktop=1`, nhớ bằng localStorage, `?desktop=0` tắt; chỉ dành cho app Tauri trên Windows 10 (acrylic). Mọi CSS nằm dưới `html.desktop` nên PWA/iPhone/Safari không đổi.
- Độ đục .50/.52, tab chọn xanh #047857; 4 phần tử `backdrop-filter`; vùng số, bảng, hộp thoại nền đục.
- Số đo: frame time cuộn Lịch sử mean 5,0 ms khi bật và tắt như nhau; tương phản tối thiểu ≥ 4,5 (theo `bao-cao-kinh-desktop.md`).

## [2.17.9] - 2026-11-16

Không đổi định dạng dữ liệu. Gộp cả nội dung 2.17.8 (chưa từng triển khai riêng).

- Cờ `?glass=0`: trả giao diện nền đục, tắt blur (header, thanh chân, toast, nền hộp thoại); `prefers-reduced-transparency`/`@supports` đã có từ trước.
- Số đo: iPhone 14 Pro, Safari Web Inspector, bản mặc định FPS phần lớn 52–60 (rAF trần 60), 2 giây tụt 49/46, không chuỗi <45. Sau triển khai đã đo so với `?glass=0` (tab Lịch sử, 3+3 lần xen kẽ): TB 58 so 57 fps, 39 so 42 khung chậm, chênh 0,7 fps, ĐẠT; chưa đo Chế độ nguồn điện thấp / dữ liệu lớn.
- 4 phần tử `backdrop-filter` là chủ ý của người dùng (vượt mốc ≤2).

## [2.17.8] - 2026-11-16

Không đổi định dạng dữ liệu.

- Gợi ý tên trên điện thoại rộng bằng thanh thẻ, mỗi vị 1 dòng.
- PWA iPhone: không dùng preventDefault/touchstart khi chạy standalone (sửa lỗi không hiện bàn phím khi sửa ô trong thẻ khóa); Safari giữ nguyên.
- Bật kbdebug trong PWA bằng chạm 5 lần logo (cờ localStorage `kbdebug`).

## [2.17.7] - 2026-11-14

Không đổi định dạng dữ liệu.

- W1: chặn bán lẻ thành tiền 0 (nút +, Bán đơn, sửa dòng, sửa giao dịch); cảnh báo khi giá/kg ≤ giá nhập gần nhất.
- W3: header `X-Op-Id` chống 409 giả khi mất phản hồi; server lưu `last_op_id`/`last_op_updated_at` trong `app_meta` (không migration); client cũ không gửi vẫn chạy.
- W4: fetch có timeout 15 giây.
- W5: `tsFromId` đọc id của app (giá nhập tham chiếu cùng ngày thiếu giờ ghi có thể đổi).
- W6: lời báo sao lưu là "Đã tạo file sao lưu"; trần khôi phục 12 MB kèm kiểm JSON gọn ≤ 4 MB.
- W7: client giữ `oname` khi thiếu `oid`.
- W8: khóa tên sản phẩm chung hai phía (dữ liệu cũ trùng khác khoảng trắng/NFC sẽ bị 400).
- W9: CI thêm job lint; thêm `.nvmrc`.

## [2.17.6] - 2026-11-14

- Thuốc chén: hàng tổng gram cuối tờ ghi chỉ còn nhãn `1 thang` và số gram (ví dụ `1 thang  147 g`); bỏ chữ "Tổng", "x vị", "x thang: xx kg". Bỏ id `remedyQty`, mã tính chữ đó trong `calcRemedy` và CSS `.hint` của tfoot. Không đổi logic tiền.

## [2.17.5] - 2026-11-14

### Fixed
- Điện thoại (chế độ gọn khi nhập, Bán lẻ và Thuốc chén): hàng Tổng nằm trong bảng dòng nhập từ 2.17.4 làm dòng nhập trống bị đo cao 40px, nên ngân sách chiều cao trừ thêm 104px và tờ ghi gọn chỉ còn 1 dòng thay vì 2; `compactFit` nay đo chiều cao dòng nhập không kể tfoot (`pendEntryH`).
- Server: `thang` của giao dịch/đơn thuốc dùng cùng `isNumLike` như các trường số khác (trước đó `thang: true` vẫn qua); thêm test thân PUT của client luôn có `moneyUnit: 'dong'`.

## [2.17.4] - 2026-11-14

### Fixed
- Hàng "Tổng" (Bán lẻ, Nhập hàng, Thuốc chén) nằm dưới dòng nhập, thẳng cột tiền (đo sai số 0 px ở 320/375/800/1300); điện thoại: cột tên rộng hơn (trước đây bị bẻ từng chữ vì SL/Giá chiếm hết chỗ).
- Máy chủ từ chối PUT /api/state thiếu hoặc sai `moneyUnit` (phải là "dong") bằng 400, không ghi đè, không tự nhân 1000: tránh ghi nhầm dữ liệu đơn vị nghìn cũ thành đồng. Client luôn gửi cờ này nên luồng thường không đổi.
- Luật số chặt hơn, dùng chung client (`inRange`) và server (`isNonNegNumber`/`isPositiveNumber`): chỉ nhận number hữu hạn hoặc chuỗi số thập phân; boolean, chuỗi rỗng/khoảng trắng, null, mảng, "0x10" bị loại (trước đây Number() cho phép true = 1, [] = 0). Đối chiếu bản sao lưu mới nhất: 163 sản phẩm / 723 giao dịch / 17 đơn thuốc không mất bản ghi nào.
- `delOrder` so `oid` dạng chuỗi như các chỗ khác; sửa chú thích `checkLimits('money')` (giá trị là đồng); `.dockerignore` loại `tests/*;*` (thư mục rác do Docker tạo trên Windows).

## [2.17.3] - 2026-11-14

### Changed
- Bán lẻ và Nhập hàng: "Tổng" chuyển thành hàng cuối bảng ghi (tfoot), số tổng cùng mép phải với số tiền các dòng (đo sai số 0 px ở 320/375/800/1300); chân chỉ còn nút Bán đơn / Lưu nhập hàng căn phải (chân cố định trên điện thoại thấp hơn).
- Bán lẻ: nhãn "Thành tiền" đổi thành "Giá bán" (tiêu đề cột, aria-label ô nhập); Nhập hàng: nhãn "Thành tiền" ở dòng nhập đổi thành "Giá nhập". Không đổi logic tiền.

## [2.17.2] - 2026-11-14

### Changed
- Thuốc chén: chân màn hình chỉ còn `[số thang] thang × [giá] = tiền` và 3 nút một dòng (Xóa đơn, Sửa đơn, Bán đơn); nhãn "Cập nhật đơn (tên)" đổi thành "Sửa đơn" (hộp xác nhận cũng ghi "Sửa đơn này"). "Tổng 1 thang" (g), số vị và tổng N thang (kg) chuyển thành hàng cuối của tờ ghi; bỏ "lạng/thang". Không đổi logic tiền.

## [2.17.1] - 2026-11-14

### Changed
- Phông nền theo app desktop: xám-kem ấm dịu, hồng phấn góc trên, quầng kem vàng giữa, xanh sage góc dưới (radial-gradient chồng trên `body::before`); token nền/bề mặt chuyển sang tông ấm, kính thẻ .90, header/thanh chân .95 (chữ muted >= 4,5). Chỉ CSS.

## [2.17.0] - 2026-11-14

### Changed
- Chỉ còn một giao diện sáng: bỏ nhánh tối và menu Sáng/Tối/Theo máy (icon âm dương giờ chỉ là biểu tượng, vẫn rung khi không phải thiết bị chủ), `color-scheme: light`.
- "Liquid glass nhẹ" chỉ bằng CSS: nền gradient nhẹ (`body::before`), thẻ/dải số liệu nền bán trong + bóng nhiều tầng, tab/nút có viền sáng; `backdrop-filter` chỉ ở header, thanh chân tờ ghi, toast, nền hộp thoại; lưới lui `@supports not` và `prefers-reduced-motion`/`prefers-reduced-transparency`.

## [2.16.0] - 2026-11-13

### Added
- PWA: `/manifest.webmanifest`, icon 192/512/180 (sinh bằng mã trong `pwa.js`), `/sw.js` (không cache gì, chỉ passthrough), các thẻ `apple-mobile-web-app-*`. Các đường này công khai chỉ GET/HEAD (`PUBLIC` trong `auth.js`), không chứa dữ liệu kho; `/` và `/api/*` vẫn cần thiết bị đã duyệt.

## [2.15.21] - 2026-11-13

### Fixed
- A1 hẹn gửi lại: chỉ nhân đôi bước chờ khi thật sự gửi; đang ở ô nhập thì giữ nguyên.
- A2 `delOrder`: kiểm "tồn sẽ âm" trước, rồi mới hỏi xác nhận (giống `delTx`).
- A3 `saveTxEdit`: lỗi số lượng đưa con trỏ về ô số lượng (trước đây luôn về ô đơn giá).
- A4/A5 tiêu chí "mới nhất" là ngày rồi giờ ghi, cùng cách tính giá vốn `lastImport`: bảng lịch sử xếp theo ngày trước, dòng "bán/nhập gần nhất" là hàng đầu bảng, giá trong ngoặc ở tờ bán lẻ (`latestImportMap`) khớp giá vốn. Ví dụ: nhập A ngày 10/11 ghi lúc 12/11 giá 120; nhập B ngày 11/11 ghi lúc 11/11 giá 135. Trước: ngoặc (120), vốn 135, bảng A trên B; sau: ngoặc (135), bảng B trên A, "gần nhất" 11/11.

### Removed (không đổi hành vi; mỗi mục 0 tham chiếu theo `git grep -n` trong src, tests, server.js, tools)
- `setFavicon` + `YIN` (ảnh đã nằm ở `<link id="favicon">`, giống hệt).
- Mũi tên `.chev` (8 svg, symbol `i-chev-r`, CSS): luôn `display:none`.
- `#txEditId` (chỉ ghi), `#retailTotal` ẩn (chỉ ghi) và tổng thừa trong `calcRetail` (vẫn gọi `renderNote`), `iEl/eEl` trong chú giải biểu đồ.
- Hai khối kiểm số âm không bao giờ tới (`commitRetailRow`, `saveTxEdit`): `checkLimits` chặn trước, thông báo "Tiền không được âm".
- `kg > 0 ?`, `thang > 0 ?`, `if (oid)` chết trong `saveRetail`/`saveRemedy`; 3 khai báo CSS thừa (`.grid2+.grid2`, `.rowmenu__list[hidden]`, padding trùng của `#nhapListBox .note__foot`); biến `nameKey` ở đơn thuốc trong `server.js`.

### Không làm (giữ có chủ ý)
- `.note__row--aux{margin-top:8px}` (ở máy tính hàng "Xóa đơn" không có quy tắc khác, ghi đè 6px chỉ trong @media 600px).
- Các kiểm số âm đứng trước `checkLimits` (có thông báo/con trỏ riêng), `refreshAllQtyHints()` cuối `saveNhap` (một test cấu trúc đòi), nhánh `!name` của `savePreset` (test gọi thẳng), `kInput/fmtMoney/fmtMoneyInt/qtyHintText`, nhánh else của `init`, CSS `table.ord` min-width/`details>.card__head:hover`/`mt-18`, `try` quanh `JSON.stringify`, `DELETE FROM prescription_items` và `state.updatedAt` ở `server.js` (vùng ghi dữ liệu, lợi nhỏ), bộ gỡ lỗi `?kbdebug=1`, `GET /api/backups`, 4 chỉ mục `transactions`, `migrateMoneyToDong`.

## [2.15.20] - 2026-11-12

### Fixed
- Xóa đơn nhập: cộng dồn số lượng theo sản phẩm khi kiểm tồn không âm (đơn có nhiều dòng cùng sản phẩm).
- Mở đơn không còn tồn tại: báo lỗi thay vì mở hộp trống.
- Lưu nháp cục bộ: ghi cờ chưa đồng bộ và mốc cloud độc lập; hết bộ nhớ không làm mất cờ chưa đồng bộ.
- Dòng log khởi động nói đúng: ứng dụng nghe 0.0.0.0 trong container, compose chỉ mở 127.0.0.1.

## [2.15.19] - 2026-11-12

### Changed
- Dọn code chết sau đợt chỉnh giao diện 2.15.12–2.15.18 (một biến cục bộ, một bộ chọn CSS thừa, một assert test trùng); giao diện đo lại y nguyên, không đổi hành vi.

### Added
- Test: log từ chối cho 400 "JSON không hợp lệ" và 400 "X-Base-Updated không hợp lệ", PUT 200 không ghi dòng từ chối; pushState 5xx/lỗi mạng không toast "Chưa lưu được:"; Hủy ở confirm tên đơn trùng không đổi gì.

## [2.15.18] - 2026-11-12

### Fixed
- iPhone, Thuốc chén/Bán lẻ, tờ ghi gọn: sau "+" (ô tìm tên đang focus, dòng nhập trống) vẫn thấy đủ 2 vị mới nhất; trước đây ngân sách luôn chừa 104px cho dòng nhập dù chưa có nên chỉ còn 1 dòng. Có dòng nhập thật thì chừa như cũ.
- Khi gọn, tiêu đề cột trong danh sách (hiện khi có dòng nhập) được ẩn: không nhảy +29px khi chọn vị, dòng cuối không bị cắt lệch.
- Điện thoại: dòng đang nhập thẳng cột với dòng đã ghi (STT giữa cột, tên cùng lề).

## [2.15.17] - 2026-11-12

### Removed
- Thuốc chén: bỏ nút "Sao chép đơn" và khả năng đổi tên đơn đã lưu (chọn đơn thì ô tên ẩn; "Cập nhật đơn" chỉ đổi nội dung theo ID, giữ tên cũ). Dữ liệu đơn đã lưu không đổi.

### Changed
- Lưu đơn mới trùng tên đơn đã có (không phân biệt hoa/thường, khoảng trắng thừa): hỏi `Đã có đơn "<tên đang lưu>". Cập nhật đơn này bằng nội dung đang nhập?`; OK cập nhật đơn cũ, Hủy không đổi gì.

## [2.15.16] - 2026-11-12

### Added
- Lưu bị máy chủ từ chối (400/428): hiện thông báo lỗi nêu lý do (một lần mỗi lần thất bại). Máy chủ ghi một dòng log (giờ, mã, lý do ngắn; không ghi dữ liệu) khi từ chối PUT /api/state.

### Fixed
- iPhone: cập nhật đơn thuốc chén đã chọn mà ô tên bị xóa trống nay hỏi tên bằng hộp thoại (điền sẵn tên cũ; Hủy/rỗng: không đổi gì).

## [2.15.15] - 2026-11-12

### Fixed
- iPhone: "Lưu đơn" (Thuốc chén, Đơn mới, chưa có tên) không phản hồi vì ô tên nằm trong thanh chân bị ẩn khi focus. Nay hỏi tên bằng hộp thoại (Hủy/rỗng: không lưu); PC giữ luồng cũ.

## [2.15.14] - 2026-11-12

### Changed
- Dockerfile hai giai đoạn: image cuối bỏ python3/make/g++ (759MB xuống ~351MB) và chạy bằng `USER node`. Không đổi mã app.
- LƯU Ý nâng cấp: `data/` hiện thuộc root, phải chạy một lần trước khi bật: `docker run --rm -v "<đường dẫn tuyệt đối>/data:/data" alpine chown -R 1000:1000 /data` (hoặc `chown -R 1000:1000 data` trên Linux). Chạy trong PowerShell/cmd, KHÔNG dùng Git Bash (đổi đường dẫn `/data`). File cũ do root tạo (644) thì user node không ghi được nên NÊN chạy; Docker Desktop với file tạo từ Windows (777) có thể không cần, chạy vẫn vô hại.
- Đường lui: image cũ chạy root nên ghi được file thuộc uid 1000.

## [2.15.13] - 2026-11-12

### Changed
- Máy tính (>640px): cả 8 icon tab dùng cùng một màu xanh lá (biến `--tab-ico`, bằng màu icon Bán lẻ, sáng `#047857`, tối `#7fd6ad`); tab đang chọn đặt icon xanh trên chip nền --brand-soft bo góc để vẫn nổi bật trên nền tím. Không đổi hình icon, chữ tab, icon tiêu đề thẻ; điện thoại vẫn ẩn icon.

## [2.15.12] - 2026-11-12

### Removed
- Dọn mã chết sau loạt 2.15.8–2.15.11, không đổi hành vi: 6 biến màu CSS không còn nơi dùng (`--green-soft`, `--blue-soft`, `--purple-soft`, `--purple-text`, `--chart-imp-ink`, `--chart-exp-ink`) ở cả hai chế độ sáng/tối; khai báo trùng giá trị trong khối media (`.toast.is-on`, `body{padding-bottom}`, `min-height`/`gap` của `.tab`/`.tabs`, `margin-left`/`font-size` của biểu đồ, `justify-content` của `.tab` ≥641px, `min-width` của bảng đơn/kho/lịch sử).

### Changed
- Test: bỏ khóa `remedyNewName` khỏi bộ nạp, gộp hai ca kiểm "không còn mã cũ" thành một; bộ kiểm tương phản dùng nền `--surface` cho chữ xanh lá/xanh dương; chuỗi CSS được ghim đổi theo các dòng đã gọn. JS: kiểm tra tới được 247 hàm, không có hàm hay biến chết.

## [2.15.11] - 2026-11-12

### Fixed
- Điện thoại: khi trang bị khóa lúc nhập, thanh `Quản Lý Kho` (sticky) không còn che đỉnh thanh thẻ/ô tìm (`html.kb-lock .top{visibility:hidden}`, giữ nguyên bố cục); sửa che ở lần chạm đầu và khi chọn SL.
- Chạm vào ô nhập khác trong thẻ đang khóa: chặn hành vi mặc định (iOS tự căn giữa ô = pan visualViewport làm tờ ghi bị kéo lên rồi về) và focus bằng `preventScroll`. Nút Trước/Sau của thanh phụ iOS không chặn được; khi đó vẫn bù `top` đồng bộ trong sự kiện visualViewport (không rAF, không transition).
- `?kbdebug=1`: thêm dòng 2 ghi 3 sự kiện vvTop gần nhất (nguồn pointerdown/focusin/next/vv) và cờ preventScroll-chạm.

## [2.15.10] - 2026-11-12

### Fixed
- Điện thoại, nhập Bán lẻ/Thuốc chén: trang ĐỨNG YÊN TUYỆT ĐỐI khi nhập. Lần đầu vào chế độ gọn của thẻ, trang bị KHÓA CUỘN (body `position:fixed`, `top` âm) sao cho đỉnh thẻ cách đỉnh vùng nhìn 8px; vị trí hiển thị là hằng số ở mọi bước (gõ tên, chọn gợi ý, SL, thành tiền, "+"), thanh thẻ/ô tìm luôn thấy, iOS không còn gì để tự cuộn. Gỡ khóa (idempotent, mọi đường thoát: tắt gọn, blur 400ms, đóng thẻ, pagehide, ẩn tab, xoay/đổi cỡ, về >640px) thì trang về đúng vị trí trước khi nhập (ghi nhận trước lúc trình duyệt tự cuộn khi focus). iOS pan visualViewport thì top khóa được bù theo `visualViewport.offsetTop`. Bỏ toàn bộ định vị bằng scrollTo/scrollBy (placeScrollDelta, lưới an toàn, --kb-pad, chỗ trống cuối trang); `focus({preventScroll:true})` giữ nguyên.
- Ngân sách chiều cao theo `visualViewport.height` thật (iPhone 14 Pro: ~357px khi bàn phím mở, innerHeight vẫn 695): danh sách gọn tự giảm từ 2 xuống 1 dòng (hoặc cắt vừa) để dòng đang nhập (SL, Thành tiền, +) không vượt đáy vùng nhìn trừ 8px; tính lại khi bàn phím hiện/ẩn.
- `?kbdebug=1`: dòng gỡ lỗi gắn vào `<html>`, thêm savedY, top khóa, lock 0/1.

### Changed
- Máy tính: icon trên 8 tab mang cùng class màu (txt-green/brand/blue) với icon tiêu đề thẻ tương ứng; tab đang chọn (nền brand) dùng icon trắng như chữ tab (tương phản 6.3 sáng, 5.1 tối).

## [2.15.9] - 2026-11-12

### Fixed
- Điện thoại, nhập Bán lẻ/Thuốc chén: màn hình không còn di chuyển liên tục khi chọn tên, nhập số, bấm "+". Trang được định vị ĐÚNG MỘT LẦN khi vào chế độ gọn của thẻ (đã tính chỗ dòng đang nhập sắp hiện); các focus lập trình trong luồng nhập (chọn gợi ý, sau "+", dòng trùng, báo lỗi) dùng `preventScroll` nên iOS không tự cuộn. Bỏ các mốc định vị lặp 100/300/600/1000ms, định vị lại sau "+" và sau visualViewport resize; chỉ còn lưới an toàn cuộn tối đa một lần khi ô đang nhập bị che hẳn. Gợi ý dùng cuộn trong khung thay cho `scrollIntoView` (không kéo cả trang).

### Changed
- Hộp gợi ý tên (Bán lẻ, Thuốc chén, Nhập hàng) áp dụng cho MỌI thiết bị (điện thoại và máy tính): chỉ hiện vị khi chữ gõ khớp TRỌN và LIÊN TIẾP một dãy từ của tên (không phân biệt hoa/thường, dấu, đ=d). "cam" -> Cam Thảo; "tri" -> Ích Trí Nhân; "dang" -> Kê Huyết Đằng; "ca" hoặc "cam th" không hiện. Ô lọc Kho tồn/Lịch sử giữ nguyên luật cũ (chứa chuỗi).
- Khung gợi ý cao tối đa 3 mục (đo theo chiều cao mục thật), các mục còn lại cuộn trong khung; áp dụng mọi cỡ màn hình.

## [2.15.8] - 2026-11-12

### Fixed
- Điện thoại, nhập Bán lẻ/Thuốc chén: trang không còn tự cuộn theo số đo bàn phím (iOS báo không đáng tin). Mỗi lần focus ô nhập, sau "+" và ở các mốc 100/300/600/1000ms, trang được ĐỊNH VỊ xác định: đỉnh thanh thẻ nằm ngay dưới thanh trên + 8px; nếu dòng đang nhập vẫn thấp hơn (đỉnh bàn phím - 80px) thì cuộn thêm, đỉnh dòng không lên quá thanh trên. Chạm (tap) không còn chặn định vị; chỉ vuốt/cuộn tay (touchmove, wheel) mới hủy. Chỗ trống cuối trang cố định 60% chiều cao cửa sổ. Bỏ mã cũ (keepVisibleDelta, searchScrollDelta, kbPadPx, kbUserAt).
- `?kbdebug=1`: dòng gỡ lỗi hiện ngay khi mở trang (vvH, vvTop, ih, y, compact, lý do thoát sớm gần nhất) và bám visualViewport nên không trôi khỏi màn hình khi bàn phím hiện.

### Changed
- Chế độ gọn hiển thị 2 dòng cuối (trước là 3). "Guồng nước": bấm "+" khi đang gọn thì danh sách cuộn mượt xuống cuối (prefers-reduced-motion: tức thì; lưới an toàn 450ms), mép trên mờ dần 12px; lần vào gọn đầu nhảy thẳng.
- Máy tính (>640px): mỗi tab có icon cạnh nhãn hai hàng, cùng icon với tiêu đề thẻ (receipt, mortar, cart, warehouse, cart, cash, chart-col, save); điện thoại (<=640px) giữ nguyên, ẩn icon.

## [2.15.7] - 2026-11-12

### Removed
- Dọn mã chết sau loạt 2.15.x, không đổi hành vi: CSS không còn phần tử nào khớp (`.spacer`, `.row`, `.nhap-row`, `.mb-12`, `.w-full`, `.total`, `.total__v`, `.foot--retail`, `.foot--rec`, `table.ord--r`, `.stats+.grid2`); 2 symbol icon không dùng (`i-monitor`, `i-chart-line`); ô sắp xếp Kho tồn đã bỏ nên bỏ luôn `#invSort` trong mã (nhánh sắp xếp không thể tới, listener).

### Changed
- CSS: gộp khai báo `.chart-tip` bị ghi đè (cùng giá trị) và bỏ `.chart-year__box{cursor:text}` lặp. Test: bỏ các ca ràng buộc quy tắc CSS đã xóa; số ` id="` trong trang 168 -> 166 (2 symbol).

## [2.15.6] - 2026-11-12

### Giao diện điện thoại
- Bán lẻ và Thuốc chén: khi đang nhập (bàn phím hiện), danh sách đã ghi gọn còn vùng cao đúng 3 dòng cuối (cuộn được, tự cuộn cuối khi thêm dòng bằng "+") để dòng đang nhập nằm cao trên bàn phím; rời ô nhập thì trả lại hiện đủ dòng (trễ 250ms để chuyển ô không nhấp nháy). Bọc bảng tờ ghi trong `.note__list`.

## [2.15.5] - 2026-11-12

### Sửa
- Giao diện điện thoại, bàn phím số: không còn kéo trang ngược lại khi người dùng cuộn (bỏ ép cuộn theo visualViewport `scroll`; chạm/cuộn/lăn chuột hủy mọi ép cuộn đang chờ).
- Dòng đang nhập chừa 96px dưới đáy vùng thấy (trước 64px) để không bị thanh Prev/Next/Done của iOS che.
- Sau "+": cuộn tới ô "Nhập tên" (dưới thanh tiêu đề dính) ở các mốc 0/100/300/600/1000ms, không phụ thuộc bàn phím đang hiện.
- Chế độ gỡ lỗi `?kbdebug=1`: hiện một dòng số đo (vv.height, offsetTop, innerHeight, rect, delta) ở góc trên.
- Thuốc chén: bỏ lựa chọn "Tạo đơn mới" trong ô chọn đơn (còn "Đơn mới" + đơn đã lưu) và bỏ nút "Lưu tên mới" (thừa: "Lưu đơn" tự mở ô tên; "Sao chép đơn" đã có).

## [2.15.4] - 2026-11-12

### Giao diện điện thoại

- Dòng đang nhập (và ô tìm) của Bán lẻ/Thuốc chén luôn được đưa lên phía trên bàn phím: tính theo visualViewport (offsetTop + chiều cao), chừa 64 px cho thanh Prev/Next/Done, tính ngay rồi lại ở 100/300/600/1000 ms và mỗi lần visualViewport resize/scroll; chỉ cuộn khi dòng thật sự bị che. Khi bàn phím hiện, trang chừa thêm chỗ cuối (--kb-pad) để cuộn tới được dòng ở cuối trang.

## [2.15.3] - 2026-11-12

### Giao diện điện thoại (Bán lẻ, Thuốc chén)

- Thanh Tổng + Bán đơn nay là thanh cố định ở đáy màn hình (không còn sticky theo tờ ghi); chỉ hiện khi thẻ đang mở và tờ ghi còn trong vùng nhìn, chừa chỗ để dòng cuối không bị che; tự ẩn khi đang gõ/chọn trong thẻ hoặc bàn phím hiện và hiện lại khi bỏ focus.
- Ô SL của dòng đang nhập được cuộn vào giữa vùng nhìn thấy phía trên bàn phím (cả ô SL và nút +).
- Nút + của dòng đang nhập có data-keep-focus (như các nút khác) để sau khi bấm + focus quay về ô "Nhập tên".

## [2.15.2] - 2026-11-12

### Giao diện

- Thống kê (dải Bán/Lợi nhuận tháng, Nhập trong tháng, Tổng tồn kho, chú giải tháng): tiền hiện phần nguyên của nghìn đồng, tồn kg cắt phần lẻ (cắt, không làm tròn). Các mục khác, ô nhập, đối soát tồn, xuất JSON và mọi phép tính giữ nguyên số đầy đủ.
- Thuốc chén (điện thoại ≤400 px): ô ngày rộng 118 px, đệm gọn, hiện đủ dd/mm/yyyy cỡ 16 px; thanh tiêu đề đệm 10 px, khe 4 px; ô chọn đơn tối thiểu 90 px.

## [2.15.1] - 2026-11-11

### Giao diện điện thoại

- Thuốc chén: ô chọn đơn không hẹp hơn chữ "Đơn mới" (min-width 92 px); ô ngày 108 px ở màn hình ≤400 px để ba phần vừa một hàng ở 375/393 px (320 px: ô ngày xuống hàng).
- Thống kê: chú giải tháng (tháng – Nhập – Bán) gom một hàng; số tiền chỉ hiện phần nguyên của nghìn đồng (cắt, không làm tròn; hàm hiển thị riêng, fmtMoney giữ nguyên ở nơi khác).

## [2.15.0] - 2026-11-11

### Giao diện điện thoại

- Bán lẻ và Thuốc chén (màn hình tối đa 640 px): chân tờ ghi (Tổng, Bán đơn; Thuốc chén thêm thang, giá, nút lưu đơn) dính đáy màn hình, có chừa vùng an toàn (safe-area), nằm dưới thanh trên, gợi ý, thông báo và hộp thoại. Máy tính giữ nguyên.
- Nút "Tải lại" trên thanh trên, chỉ hiện khi chạy từ màn hình chính (iPhone không có nút tải lại). Còn thay đổi chưa gửi hoặc đơn nháp thì hỏi xác nhận trước khi tải lại.
- Thêm viewport-fit=cover để vùng an toàn có giá trị trên iPhone.
- Thanh tiêu đề các mục: ô tìm vị thuốc (và ô chọn đơn của Thuốc chén) nằm cùng hàng tiêu đề, giữa tên mục và ô ngày/tháng; placeholder rút gọn "Nhập tên" (aria-label giữ đầy đủ); hết chỗ ở 320 px thì ô ngày/tháng xuống hàng dưới.
- Thuốc chén: nhãn "— Đơn mới —" thành "Đơn mới" (value vẫn rỗng). Kho tồn: bỏ ô sắp xếp (mặc định bán chạy nhất, rồi theo tên). Thống kê: ô năm lên hàng tiêu đề; chú giải tháng thành "[ô màu] Nhập số tiền" / "[ô màu] Bán số tiền".
- Chân đơn thuốc chén trên điện thoại: Lưu đơn | Tên mới | Bán đơn đúng một hàng, Xóa/Sao chép đơn ở hàng phụ riêng (chỉ hiện khi có nút), dòng tổng gọn còn 2 dòng; chiều cao chân dính ở 320 px giảm 221 xuống 139 px.

### Removed

- Chức năng "Gộp đơn thuốc lẻ cũ" (nút trong Lịch sử bán, hộp thoại, hàm gộp, CSS). Giao dịch cũ đã có oid/oname vẫn được đọc và hiển thị như trước; sanitize, validateState và máy chủ không đổi.

## [2.14.0] - 2026-11-11

### Giao diện thu gọn từng mục

- Bảy mục (Bán lẻ, Thuốc chén, Nhập hàng, Kho tồn, Lịch sử nhập, Lịch sử bán, Sao lưu) có thanh tiêu đề: tên mục, ô tìm/lọc và số liệu ở một hàng; điện thoại xuống hai hàng (tên + số liệu, rồi ô tìm rộng cả hàng).
- Bỏ chú thích tĩnh và chữ đơn vị ở tiêu đề (kg · k, Gram · k, các hướng dẫn Enter, Ngày bán, Đối chiếu, Sao lưu).
- Hàng bảng gọn: ô 5/8 px, tiêu đề 6/8 px; điện thoại 6/2 px.
- Kho tồn và Lịch sử điện thoại: hàng 1 là tên và nút “…”, hàng 2 là số liệu một dòng. Kho tồn có nhãn nhỏ; Lịch sử không nhãn chữ. Nút “…” 32 px trên máy tính, 34 px trên điện thoại (vùng bấm 40 px).
- Điện thoại: nút “Gộp đơn cũ” (nhãn rút gọn, aria-label và title vẫn đủ); phân trang nút 36 px; Sao lưu có thanh tiêu đề.

### Tờ ghi và dòng đang nhập

- Bán lẻ, Thuốc chén, Nhập hàng: dòng đang nhập nằm trong tờ ghi; không còn dòng trống; chân tờ ghi một hàng (Tổng và nút lưu).
- Thuốc chén: “Tạo đơn mới” nằm trong danh sách; tên đơn ẩn, mở bằng “Lưu tên mới”; ô tìm vị là dòng đầu tờ ghi. “Lưu đơn” là đơn mẫu, cần tên.
- Thuốc chén: “Bán đơn” mặc định tên đơn “Đơn thuốc lẻ”. Bán lẻ: “Bán đơn” ghi đơn tên “Bán lẻ”.
- Nhập hàng: gợi ý giá nằm trong dòng đang nhập; bỏ khung Thành tiền riêng và chữ “Tương đương”.

### Gợi ý đơn vị và ô số

- Gợi ý đơn vị (lạng/kg/g) nằm trong ô số lượng, theo cách hiển thị số lượng hiện có; chỉ hiển thị, không đổi giá trị; có cho ô sửa giao dịch và ô sửa dòng tờ ghi.
- Cuộn chuột khi đang focus ô số không đổi số: ô đang focus bị blur trước khi cuộn, trang vẫn cuộn; hai mũi tên tăng/giảm ẩn.

### Sửa lỗi

- Ô số có gợi ý đơn vị không còn padding cố định 50 px: vùng chữ luôn ≥ 56 px khi gợi ý hiện; gợi ý chuyển lên dòng nhãn khi hết chỗ; cột SL máy tính rộng 152 px (S1).
- Gợi ý đơn vị làm mới sau mọi lần xóa ô số bằng mã (Nhập, Bán lẻ, Thuốc chén, lưu nhập, dòng tờ ghi); không còn “(12,5 kg)” trên ô trống (N1).
- Đổi tên đơn thuốc chén có sẵn được khôi phục: chọn đơn thì hiện ô tên; “Lưu đơn” đổi tên có xác nhận như 2.13.2; “Lưu tên mới” khi đang chọn đơn = sao chép (N2).
- Id mô tả gợi ý của các ô số không còn trùng (N3).
- Gợi ý đơn vị viết tắt "lạng" thành "l" (ví dụ "(2 l)"); kg, g giữ nguyên; chỗ khác trong app vẫn ghi "lạng".
- Gợi ý đơn vị khi ô hẹp (điện thoại, Bán lẻ/Nhập hàng) chuyển lên dòng nhãn, mép phải, thay vì ẩn (S2).
- Nút “+” Nhập hàng cao 44 px bằng ô nhập và thẳng đáy (trước đó 36 px, lệch đáy).
- Lịch sử nhập điện thoại: ô tìm bị co còn vài chục px; nay rộng cả hàng.
- STT dòng đang nhập = số dòng tờ ghi + 1; hai bảng Bán lẻ dùng chung độ rộng cột.

### Biết, chưa sửa

- Bố cục điện thoại mới kiểm bằng CSS và test tự động; chưa đo trên trình duyệt thật ở 375 px và 1300 px.
- Lịch sử điện thoại bỏ nhãn chữ SL, Đơn giá, Thành tiền (thứ tự cột giữ nguyên).
- Sao lưu còn hai dòng trạng thái gần nghĩa (“Chưa sao lưu” và “Chưa có bản sao lưu nào.”), chưa gộp.
- Thống kê giữ bố cục 2.13.2, không đổi.

## [2.13.2] - 2026-11-11

- Thống kê: “Nhập trong tháng” và “Tổng tồn kho” lên đầu thẻ; ô năm một khung; bỏ chú giải và gợi ý cũ; dòng tháng với hai ô màu; mặc định tháng hiện tại (năm khác: tháng cuối có dữ liệu).

## [2.13.0] - 2026-11-11

### Giao diện

- Header: icon âm dương mở menu Sáng / Tối / Theo máy; “Quản Lý Kho” là nút vào Thiết bị (chỉ thiết bị chủ; thành viên thấy icon rung và thông báo chỉ đọc).
- Nhập hàng: khi vượt trần, con trỏ giữ ở đúng ô sai (số lượng, giá, thành tiền); nút + và Lưu không làm bàn phím đóng.
- Thông báo lỗi giữ 5 giây và được đọc ngay (assertive); trên điện thoại hiện ở đầu màn hình; lỗi cũng hiện trong hộp thoại đang mở.
- Gộp giao dịch: không đơn nào được tick sẵn.
- Lịch sử nhập và bán luôn mới nhất trước; bỏ nút Gần nhất/Tất cả; Lịch sử bán có ô tìm tên vị thuốc.
- Điện thoại: nút + và ô Vị thuốc thẳng hàng, ô tên rộng hết hàng; nút + vuông 44 px.
- Giảm chói và nhãn tab hai hàng (gộp từ 2.12.x).
- Test: thời gian chờ 120 giây cho các bộ test; treo thì rớt có tên ca.
- Menu Sáng/Tối neo mép trái và có dấu tick; toast lỗi dùng biểu tượng cảnh báo; Esc đóng menu.
- Test: bỏ console.log trong bộ test ngẫu nhiên (gây lỗi chạy ngẫu nhiên "Unable to deserialize").

### Biết, chưa sửa

- Chưa có mục nào.

## [2.12.0] - 2026-11-11

### Giao diện

- Nhập hàng: thêm nút “+” cạnh Giá nhập (bấm = Enter), cỡ vùng bấm 44 px.
- Nhãn 8 nút tab thành hai hàng chữ (Bán/lẻ, Lịch sử/nhập…), không biểu tượng.
- Dải số liệu mỏng trên cùng: “Bán trong tháng” và “Lợi nhuận tháng” chia 2 nửa; “Nhập trong tháng” và “Tổng tồn kho” chuyển vào thẻ Thống kê.
- Giảm chói cả sáng và tối: nền, thẻ, chữ và màu nhấn bớt bão hòa; chữ vẫn đạt tương phản AA.
- Nút lưu đơn Bán lẻ đổi chữ thành “Bán đơn”.
- Sửa: quy tắc điện thoại của hàng nút và tab được áp dụng đúng (thứ tự CSS).
- Điện thoại: ô Vị thuốc có cả hàng riêng, Số lượng | Giá nhập | + ở hàng dưới; test có --test-timeout=120000 để treo rớt có tên ca.

### Biết, chưa sửa

- Lưu nhập hàng: khi số lượng vượt trần, con trỏ nhảy sang ô giá.
- Thông báo (toast) bị bàn phím ảo che trên iPhone.

## [2.10.0] - 2026-11-11

### Giao diện

- Thẻ số (Nhập trong tháng, Bán trong tháng, Lợi nhuận tháng, Tổng tồn kho) gọn hơn: padding, cỡ chữ và biểu tượng nhỏ hơn; vẫn giữ dòng phụ “Hôm nay · Năm”. Máy tính 4 thẻ một hàng, điện thoại 2×2.
- Tám mục (Bán lẻ, Thuốc chén, Nhập hàng, Kho tồn, Lịch sử nhập hàng, Lịch sử bán hàng, Thống kê, Sao lưu & khôi phục) thành một hàng nút; bấm nút thì mục đó hiện toàn chiều rộng, các mục khác ẩn. Điện thoại xếp 4 cột × 2 hàng.
- Nhớ mục đã chọn gần nhất (localStorage `qlk_tab`); mặc định mở Bán lẻ. Chuyển mục không xóa dữ liệu đang soạn.
- Bỏ lưới 2 cột của 2.9.0 và 2.9.1.

### Biết, chưa sửa

- Lưu nhập hàng: khi số lượng vượt trần, con trỏ nhảy sang ô giá.
- Thông báo (toast) bị bàn phím ảo che trên iPhone.

### Test

- Ca tab trong `tests/client.test.mjs`: 8 nút đúng thứ tự, id thẻ và `data-action` không đổi so với 2.9.2, chọn/mở/đóng mục, bấm summary, `qlk_tab` lạ, chuyển tab không đổi `db` và không bật dirty.

### Tài liệu

- CLAUDE.md ghi phiên bản 2.10.0.

## [2.9.2] - 2026-11-11

### Sửa lỗi

- Trần tiền và tồn: kiểm đủ mọi đường lưu và kiểm lại sau mỗi phép cộng/nhân (nhóm A1–A7).
- Hẹn gửi lại không bị đứt khi người dùng đang gõ ở ô nhập.
- Giá vốn sau khi xóa đúng lần nhập mới nhất quay về giá của lần nhập còn lại (theo ngày nhập, hòa thì theo thời điểm ghi); xóa lần nhập cũ thì giữ nguyên giá vốn đã sửa tay.
- Đơn thuốc chén không mất dòng khi chọn gợi ý thuốc.
- Huy hiệu “Chưa đồng bộ” hết kẹt sau khi xử lý xung đột 409.

### Lỗi nhỏ

- B8: focus về ô giá sau khi chạm trần.
- B9: không nhảy sang ô tìm kiếm khi số gram vượt giới hạn.
- B11: thông báo số âm và trần tiền hiển thị theo nghìn đồng.
- B12: Esc xóa trạng thái của hộp thoại.
- B13: kiểm tồn trước khi xác nhận; hoàn tác đúng vị trí.
- B14: `moneyUnit` mặc định đúng.
- B15: `renderAll` không chuẩn hóa lại tên.

### Giao diện

- Huy hiệu đồng bộ là `div role="status"`.
- Hộp thoại `mergeDlg` và `recDlg` đóng khi bấm ra nền.
- Bỏ CSS `.stack`, `.hide-sm` và `data-sug` không còn dùng.

### Thay đổi

- Chuỗi log khởi động (`auth.announce`, `server.js`) chỉ đúng địa chỉ: PC dùng `https://localhost`, thiết bị khác dùng `https://<IP-máy-tính>/auth/setup` hoặc `/auth/join`.
- Thêm script `test:auth` và bước CI chạy test xác thực trong container.

### Test

- Test server gửi body 413 thật khi vượt 4 MB; không còn ca `skip` nào; các assert được viết lại để không xanh giả.
- Ca test cho từng mục nhóm A và B, có phá thử cho các mục chính.

### Dọn mã

- Bỏ 7 symbol không dùng (không đổi hành vi).
- `tools/kiem-tra-ngay.mjs`: bỏ scan đơn thuốc, vì đơn thuốc không có ts/date riêng nên so sánh luôn trùng.

### Tài liệu

- README và README-LOCAL: nhiều thiết bị cùng dùng; địa chỉ `/auth/join` qua HTTPS; bỏ ví dụ PowerShell `PUT /api/state`; lệnh test dùng tên service compose; bảng API thêm `/healthz` và `/auth/*`.
- CLAUDE.md ghi phiên bản 2.9.2.

### Biết, chưa sửa

- Đơn giá khi sửa đơn thuốc chén (`applyRemedyBalance`) chưa kiểm trần khi kg rất nhỏ.
- Còn 3 đường có thể bị máy chủ từ chối (400) với số liệu ngoài thực tế: (1) lưu đơn bán lẻ không kiểm `cost` (kg × giá vốn); (2) xóa hoặc giảm đơn bán làm tồn vượt giới hạn; (3) sửa gram đơn thuốc chén làm đơn giá vượt giới hạn. Đều có từ 2.9.1.
- B10: phép đoán tick sẵn ở hộp gộp.
- F9: toast hiện dưới hộp thoại.
- F10: nút “Thiết bị” hiện cho thành viên.
- F12: nhãn “Gần nhất” / “Tất cả”.
- G17: sao lưu tự động có thể đè lên toast.
- Dockerfile còn công cụ build (`python3 make g++`) và chạy bằng root.
- Các nhánh thừa trong `saveNhap` và `saveRemedy` được giữ nguyên.

## [2.9.1] - 2026-11-11

### Sửa

- Bố cục máy tính: mở một thẻ không còn kéo dài thẻ cạnh nó (`.main` dùng `align-items:start`).

## [2.9.0] - 2026-11-11

### Thay đổi

- Bố cục máy tính (trên 900px): thẻ xếp thành hai cột. Hàng 2: Bán lẻ | Thuốc chén; hàng 3: Nhập hàng | Kho tồn; hàng 4: Lịch sử nhập | Lịch sử bán; hàng 5: Thống kê | Sao lưu & khôi phục. Thẻ số vẫn ở trên.
- Điện thoại và tablet (900px trở xuống): một cột theo thứ tự cũ.
- Nhãn thẻ: bỏ số đầu tên; "Đơn bán lẻ" → "Bán lẻ", "Đơn thuốc chén" → "Thuốc chén", "Thống kê nhập & bán 12 tháng" → "Thống kê", "Danh sách tồn kho" → "Kho tồn".
- Không đổi id, data-action, dữ liệu, lưu trữ, đồng bộ và API.

## [2.8.4] - 2026-11-11

### Thêm

- `checkLimits(kind, v)` kiểm trần ngay tại chỗ nhập (số lượng, gram, thang, tiền, tên) trước khi đụng `db`. Sai thì báo lỗi, giữ nguyên tờ ghi, không `commit`, không đặt `dirty`. Áp cho `commitRetailRow`, `commitRemedyRow`, `saveNhap`, `saveRemedy`, `saveTxEdit`; vốn sau nhân (thang × giá, đơn thuốc) cũng được kiểm.
- Thuộc tính `max` trên ô số lượng, giá, đơn giá, thang, gram và tiền dòng bán lẻ, khớp các hằng `QTY_MAX`, `GRAMS_MAX`, `THANG_MAX`, `MONEY_MAX`.

### Biết, chưa sửa

- saveNhap không focus ô giá khi vượt trần (biến `pi2` dùng trước khi khai báo).

## [2.8.3] - 2026-11-10

### Sửa

- Thêm `resetDrafts()` xóa nháp bộ nhớ sau khi chọn bản máy chủ, bỏ nháp hoặc khôi phục thành công.
- Hộp xung đột tải file nháp trước khi lấy bản máy chủ; không tải được thì hủy. `backupBeforeRestore` không chặn tự sao lưu ngày.
- `pushState` coi HTTP 409 là xung đột dù thân rỗng/không đọc được; 400 vẫn cho bỏ nháp.
- Sửa NHAP cũ không cập nhật `costPrice`; chỉ dòng nhập mới nhất mới đổi.
- Dòng bán lẻ/đơn thuốc/nhập thiếu số lượng bị giữ lại và báo, không lưu im lặng.
- Enter gợi ý chỉ chọn khớp chính xác hoặc một ứng viên duy nhất.
- `recFix` hỏi xác nhận; `mergeDo` xác nhận cuối; `sanitize` dùng object không prototype.
- `renderInventory` kẹp `invPage >= 1`.
- Xóa `suppressSug` (chỉ gán, không đọc); thêm `scripts/lint-client.mjs`, cảnh báo hiện 0.

### Không sửa

- #7 (lệch ≤ thang/2 đồng, đã cảnh báo), #19 (trùng #2; đã có backup trước ghi đè), #20 (chỉ nhãn), #22 (bị `dirty` chặn, hiếm).

## [2.8.2] - 2026-11-10

### Sửa

- SSR: thay `%%BOOT%%`/`%%NEEDFETCH%%` một lượt bằng callback; dữ liệu chứa `$&`, `$'`, `` $` ``, `%%BOOT%%`, `%%NEEDFETCH%%` không còn làm hỏng boot JSON.
- Giới hạn tên tự do (`NAME_MAX = 200`) cho vị thuốc, đơn thuốc, tên đơn/ca bán; server trả 400, input UI có `maxlength`, `sanitize` cắt cùng luật.
- Mọi số phải hữu hạn và có trần: `qty/stock <= 1e6`, `grams <= 1e9`, `thang <= 1e4`, tiền `<= 1e12`. Chuỗi `"1e309"` bị 400, không còn âm thầm thành 0.
- `parseBackup` kiểm cùng luật `validateState` trước khi thay dữ liệu; báo lỗi đầu tiên và hủy khôi phục.
- Ngày phải là ngày thật trong 2000-01-01..2100-12-31 ở cả server và client.
- Qua nửa đêm, `refreshAutoDates` render lại thống kê, thông tin sao lưu và biểu đồ đang mở.
- `auth-reset.mjs` xóa cả `devices` lẫn `invites`.
- `recFix` kẹp tồn về `>= 0`.
- File migration `truoc-lam-tron-*.json` hỏng chỉ log và fallback, không chặn khởi động.
- `loadPreset` cảnh báo khi đơn cũ có vị đã bị xóa.

### Đổi

- Xóa code chết: `txCogs()`, `case 'del-row'`, tham số/nhánh `force` của `runDailyBackup`, nhánh `p.date` trong `tools/doi-ngay-don.mjs`.
- Thêm `*.crt` vào `.gitignore`.

### Không sửa (giữ thiết kế)

- Không kiểm tra `total = qty × price`: đơn thuốc chén và đơn bán lẻ có phân bổ tiền, chặn sẽ báo sai. `stockDrift` vẫn chỉ so tồn.
- Không từ chối request thiếu cả `Origin` lẫn `Sec-Fetch-Site`: trình duyệt luôn gửi ít nhất một trong hai cho POST; trường hợp còn lại là công cụ không phải trình duyệt (curl), đã cần cookie hợp lệ, không có CSRF.

## [2.8.1] - 2026-11-10

### Bảo mật

- Cookie thiết bị được cấp lại tối đa một lần mỗi ngày mỗi thiết bị, tính từ lần dùng gần nhất (trước đây cố định 365 ngày từ lúc tham gia, thiết bị dùng hằng ngày vẫn bị khóa im lặng vào ngày thứ 366). Cookie được tự nâng lên `Secure` khi thiết bị bắt đầu dùng HTTPS.
- Cookie mang cờ `Secure` khi request tới qua HTTPS (trực tiếp hoặc sau proxy như Caddy, nhận diện qua `req.secure` hoặc `X-Forwarded-Proto: https`).
- Yêu cầu POST bị từ chối khi `Sec-Fetch-Site` khác `same-origin` hoặc `none` (bao gồm `same-site` khác cổng).

### Đổi

- Xóa hàm `thisMonth()` không còn được gọi trong `src/page.js`.

## [2.8.0] - 2026-11-09

### Thêm

- Xác thực thiết bị: chỉ thiết bị đã được duyệt mới truy cập được kho (trang chủ và `/api/*`). Thiết bị chủ đầu tiên thiết lập bằng mã in trong log (`/auth/setup`); tối đa 2 thiết bị chủ.
- Mã mời (8 ký tự, hiệu lực 5 phút, dùng một lần) để thêm thiết bị mới qua `/auth/join`. Trang `/auth/devices` cho thiết bị chủ tạo mã mời, xem danh sách thiết bị và thu hồi từng thiết bị. Thiết bị "thành viên" xem và sửa kho nhưng không quản lý được thiết bị khác.
- `/healthz` (không cần duyệt, không trả dữ liệu) cho healthcheck của Docker.
- Client xử lý lỗi 401: huy hiệu "Thiết bị này chưa được duyệt hoặc đã bị thu hồi" kèm liên kết nhập mã mời; giữ nguyên thay đổi chưa gửi và không cho bỏ nháp.
- Nút "Thiết bị" trên thanh đầu trang dẫn tới `/auth/devices`.
- `scripts/auth-reset.mjs` đặt lại danh sách thiết bị (khi mất cả hai thiết bị chủ hoặc đổi máy).

### Đổi

- Healthcheck của compose gọi `/healthz` thay vì `/api/state`.
- "Bỏ thay đổi chưa gửi" chỉ xóa cờ nháp và huy hiệu sau khi lấy được bản máy chủ; nếu thất bại thì giữ nguyên nháp.
- Danh sách thiết bị nằm trong `data/auth.db` (file riêng), không bị ghi đè khi lưu hay khôi phục `app.db`.

### Bảo mật

- Cookie `qlk_dev_<8 ký tự hex>`: HttpOnly, SameSite=Lax; tên ngẫu nhiên theo từng bản cài. Máy chủ chỉ lưu bản băm SHA-256 của mã thiết bị và mã mời.
- Giới hạn thử sai: sai 5 lần thì khóa 15 phút (thiết lập và nhập mã mời có bộ đếm riêng); thiết bị chủ có thể mở khóa.
- Trang auth gửi `Referrer-Policy: same-origin`, từ chối request có `Origin` lạ hoặc `Origin: null`.
- **Chưa có HTTPS:** cookie đi qua HTTP trong mạng nội bộ nên người nghe được lưu lượng cùng mạng có thể lấy cookie. Nên tách mạng khách (Wi-Fi khách) khỏi mạng đặt kho.

### Lưu ý nâng cấp

- Sau khi bật, mọi tab đang mở bằng bản cũ phải tải lại (Ctrl+F5). Trước đó, đồng bộ hết thay đổi chưa gửi trên các thiết bị.

## [2.7.1] - 2026-11-09

### Sửa lỗi hiển thị

- Dòng đơn thuốc chén (có cờ `rx`) không hiện con số vốn trong ngoặc ở lịch sử bán và tờ ghi, chỉ dòng bán lẻ mới hiện.

## [2.7.0] - 2026-11-08

### Thêm

- Tờ bán lẻ: ô số lượng hiện thêm giá nhập gần nhất trong ngoặc (nghìn đồng/kg, ví dụ `(135)`). Lịch sử bán lẻ hiện giá vốn tại thời điểm bán trong ngoặc (tổng vốn ÷ số lượng), dòng không có vốn thì ẩn.
- Lịch sử bán và nhập: mặc định chỉ hiện 10 đơn gần nhất (một đơn là nhóm theo `oid`, dòng lẻ không `oid` tính 1, đơn thuốc chén tính 1), sắp mới nhất trước, có phân trang “Xem thêm”.
- Lịch sử nhập: bỏ lọc tháng, thay bằng một ô tìm kiếm tên vị thuốc không phân biệt hoa thường/dấu, có gợi ý; xóa ô về 10 mục gần nhất, tìm thì lọc toàn bộ lịch sử theo trang.

## [2.6.11] - 2026-11-08

### Sửa ngày bán bị cũ qua nửa đêm

- Ô ngày bán lẻ và ngày đơn thuốc chén tự làm mới sang ngày mới khi tab qua nửa đêm (qua `visibilitychange`, `focus` và hẹn 60 giây), ô năm biểu đồ cũng vậy. Ô đang được gõ thì không bị đè, ô người dùng cố ý chọn ngày cũ thì giữ nguyên.
- `saveRetail` và `saveRemedy` làm mới ngày một lần nữa trước khi đọc ô ngày, phòng khi hẹn giờ bị trình duyệt làm chậm. Nhập hàng vốn đã dùng ngày mới mỗi lần nên không đổi.

## [2.6.10] - 2026-11-07

### Cảnh báo khi tồn khác nhập trừ bán

- `PUT /api/state` vẫn ghi bình thường. Nếu tồn một vị khác tổng nhập trừ tổng bán, phản hồi thêm `stockDrift` (`id`, `name`, `stock`, `calc`) và câu trong `warnings`. Không chặn lưu.
- So sau `dec()` của client. Ngưỡng là 1e-9 kg (1 microgram), cùng quy ước trong README. `0.1 + 0.2` không bị báo. Tồn lớn hơn 0 mà chưa có giao dịch thì có cảnh báo.
- Trang đọc `stockDrift`, hiện tối đa 3 tên rồi “và N vị khác”, một lần mỗi phiên. Màn đối chiếu vẫn là chỗ xem chi tiết.

## [2.6.9] - 2026-11-07

### Hộp xác nhận khôi phục nói đơn vị tiền

- File thiếu `moneyUnit` báo sẽ nhân 1000. File đã có `moneyUnit: "dong"` báo giữ nguyên.
- Dòng giá nhập lấy vị thuốc đầu tiên và so `costPrice` thật sau khi nạp, ví dụ 85 → 85.000.
- Cùng một điều kiện `willScaleMoney` cho lúc nạp và lúc đọc lại bản đã lưu, nên tải lại trang không nhân lần hai.
- Hủy khôi phục, hoặc không tải được bản nháp trước khi ghi đè, thì không giữ ghi chú đơn vị trên dữ liệu.

## [2.6.8] - 2026-11-07

### Báo lỗi lưu, không gửi lại khi server từ chối, và có lối thoát

- Huy hiệu “Chưa đồng bộ” hiện khi lưu lỗi, bộ nhớ trình duyệt đầy, hoặc bản nháp chưa gửi được từ 4 giây. Một lần lưu thành công nhanh không làm huy hiệu nháy.
- **400** và **428** không được gửi lại. Huy hiệu kèm chi tiết lỗi và nút “Bỏ thay đổi chưa gửi, lấy bản máy chủ”.
- Nút đó hỏi xác nhận, tải JSON bản nháp (`kho-nhap-bi-tu-choi-….json`) trước, rồi mới lấy bản trên máy chủ. Không tải được file thì giữ nguyên dữ liệu trên máy. File này không ghi đè ngày sao lưu hằng ngày, và bị `.gitignore` chặn.
- Mất mạng và **5xx** thử lại sau 4 giây, rồi 8, 16, tối đa 60. Một lần `PUT` thành công đưa bước chờ về 4 giây.
- **409** mở hộp thoại xung đột, không tự gửi lại.
- `README-LOCAL.md` ghi đơn bán lẻ thừa trong `kho-backup-2026-11-06.json` (`TX_mw4yzqmggwli1`, Cam Thảo 0,1 kg, 20 nghìn) và lệnh `robocopy` không `/MIR` sang ổ khác.

## [2.6.7] - 2026-11-06

### Dọn mô tả lệch và code không còn đường vào

- README mô tả đúng đơn vị tiền: lưu đồng, hiển thị nghìn tối đa 3 số lẻ, cờ `moneyUnit`.
- Gỡ nút hoàn tác chuẩn hoá cũ (`migUndo`) và `fmtInt` vì không còn chỗ nào ghi hoặc gọi.
- `GET /api/backups` không trả đường dẫn thư mục. Container có healthcheck, vẫn chạy bằng user mặc định của image.
- Nếu trình duyệt còn bản chưa gửi theo đơn vị nghìn trong lúc server đã là đồng, trang bỏ bản đó và báo một lần.

## [2.6.6] - 2026-11-06

### Lưu tiền bằng đồng nguyên, hiển thị vẫn là nghìn

- Cột `price_vnd`, `total_vnd`, `cost_vnd`, `cost_price_vnd` từ nay là **đồng**.
  Ô nhập và số trên trang vẫn là nghìn đồng, có tới 3 số lẻ để thấy từng đồng
  (400 đồng hiện `0,4`).
- Vốn từng vị đơn thuốc là `kg × giá nhập`, làm tròn tới đồng. Không còn chia
  vốn thành các số nguyên nghìn nên không còn dòng vốn 0 khi vị chỉ tốn vài trăm đồng.
  Phần lãi vẫn chia đều, dòng cuối nhận số dư.
- Migrate một lần từ file `data/truoc-lam-tron-2026-11-06-1047.json` cho các giao dịch
  còn số lẻ gốc. Giao dịch phát sinh sau lần làm tròn chỉ nhân 1000. Cờ
  `money_unit=dong` chặn nhân lần hai.

## [2.6.5] - 2026-11-06

### Giữ vốn lịch sử đơn thuốc, không để mất dữ liệu âm thầm

- **Sửa gram hoặc xóa một vị** trong đơn thuốc chén không còn tính lại vốn cả đơn theo
  giá nhập hiện tại. Mỗi dòng giữ vốn đã lưu lúc bán; dòng bị sửa gram co giãn theo vốn
  cũ của chính nó; chỉ phần lãi được chia lại đều. Trước đây giá nhập tăng rồi sửa một
  dòng làm vốn và lãi của đơn (và của tháng cũ) đổi theo.
- **Server trả 400 khi trùng khóa** (trùng id/tên sản phẩm, trùng id giao dịch, trùng
  tên/id đơn thuốc, vị lặp trong đơn) thay vì âm thầm bỏ dòng rồi ghi đè mất dữ liệu.
- **Thiếu `X-Base-Updated` trả 428** (trừ khi gửi `X-Force: 1`), thay vì ghi đè không kiểm
  tra xung đột. App luôn gửi header này nên không ảnh hưởng thao tác thường ngày.
- **`orderId` không mượn từ tên đơn**: dòng có `oname` mà thiếu `oid` không còn bị gộp
  thành một đơn theo tên.
- **Backup**: bản ngày nay chụp **trước** lần ghi đầu tiên trong ngày (trước đây chụp sau,
  nên chứa luôn lần ghi đó). Mỗi lần ghi đè chủ động (`X-Force`: khôi phục, "giữ bản máy
  này") chụp thêm `backup-YYYY-MM-DD-truoc-ghi-de-HHmmssSSS.db`, giữ 10 bản gần nhất;
  `/api/backups` liệt kê cả các bản này.
- Thêm 4 test client (31/31) và 6 test server (20/20).

## [2.6.4] - 2026-11-06

### Vốn đơn thuốc làm tròn một lần, sửa dòng giữ giá khách trả

- **Vốn cả đơn** là một lần làm tròn của tổng giá nhập × kg, rồi chia số nguyên
  xuống từng vị. Mười vị 0,4 nghìn không còn bị ghi vốn 0 và làm lãi thống kê
  cao hơn thật.
- **Sửa gram** một vị trong đơn thuốc giữ nguyên số khách đã trả, tính lại vốn
  và chia lại lãi cho cả đơn. Ô đơn giá/kg không còn hiện, vì số đó không phải
  giá khách trả.
- **Xóa một vị** khỏi đơn thuốc hoàn tồn vị đó, giữ tiền khách trả và chia lại
  cho các vị còn lại. Xóa vị cuối cùng thì xóa cả dòng tiền của đơn.

## [2.6.3] - 2026-11-06

### Chia tiền đơn thuốc chén theo vốn và lãi

- **Chỉ đơn thuốc chén**, lúc bấm Bán đơn. Đơn bán lẻ vẫn để người dùng gõ thành
  tiền từng dòng. Đơn đã bán không bị viết lại.
- Khách vẫn trả **số thang × giá 1 thang**. Mỗi vị nhận vốn của chính nó
  (giá nhập trên tồn kho × kg đã bán, kg = gram / 1000 × số thang) cộng một phần
  lãi chia đều theo số vị. Dòng cuối nhận phần dư để tổng các dòng khớp đúng
  thành tiền.
- Nếu giá bán thấp hơn tổng vốn, đơn không được lưu.

## [2.6.2] - 2026-11-06

### Tiền nguyên và không làm mới đè lên bản đang soạn

- **Sửa giá nhập lưu số nguyên**: ô sửa vị thuốc trước đây ghi `costPrice` bằng
  `dec()` (có thể còn phần thập phân trên máy này) trong khi máy chủ làm tròn.
  Hai thiết bị nhìn hai số khác nhau. Nay dùng `money()`.
- **Đọc tiền từ SQLite luôn là số nguyên**: `price`, `total`, `cost`, `unitPrice`,
  `costPrice` và tổng đơn thuốc được làm tròn khi đọc, kể cả dữ liệu cũ còn số lẻ.
- **Tự làm mới không đè đơn đang soạn**: ngoài giỏ bán lẻ, còn tạm hoãn khi tờ ghi
  đơn thuốc chén hoặc đơn nhập còn dòng chưa lưu. Nếu người dùng bắt đầu sửa trong
  lúc bản mới đang tải về, bản trên máy được giữ.
- **Đóng sạch khi request treo**: nhánh timeout 10 giây của SIGTERM/SIGINT cũng
  checkpoint WAL trước khi thoát.
- Thêm 2 test client (26/26) và 1 test server (14/14).

## [2.6.1] - 2026-11-06

### Tinh chỉnh dữ liệu đơn nhập & hoàn thiện môi trường local

- **Vá lỗi tên đơn nhập hiển thị ID**: đơn nhập hàng không có tên riêng trước đây bị
  gán `orderName = orderId` khi lưu vào server, dẫn đến giao diện hiển thị mã ID thô
  (ví dụ: `IM_...`) thay vì tên thân thiện `Đơn nhập ngày DD/MM/YYYY`. Server nay lưu
  `orderName = null` cho đơn nhập và tự động loại bỏ `oname === oid` khi đọc lại state;
  client cũng chuẩn hóa bỏ `oname` trùng `oid` và xử lý hiển thị chuẩn xác ở mọi nơi
  (lịch sử nhập, xem chi tiết đơn, hộp thoại xác nhận xóa đơn).
- **Tạm hoãn tự làm mới khi đang lên đơn bán lẻ**: `busyEditing` nay kiểm tra thêm
  `retailItems` (giỏ hàng bán lẻ chưa lưu), đảm bảo dữ liệu mới từ thiết bị khác không
  làm xáo trộn quá trình soạn đơn của người dùng.
- **Đóng sạch triệt để (WAL checkpoint TRUNCATE)**: trước khi đóng SQLite khi nhận
  SIGTERM/SIGINT, server thực hiện checkpoint WAL triệt để (`wal_checkpoint(TRUNCATE)`),
  giúp toàn bộ log được ghi gọn gàng vào file `app.db` chính trên ổ cứng.
- **Xử lý lỗi Express tập trung (JSON)**: thêm middleware bắt lỗi payload quá lớn (413)
  và các lỗi server để luôn trả JSON nhất quán thay vì trang HTML lỗi mặc định của Express.
- **Chuẩn hóa nhãn local**: gỡ bỏ toàn bộ từ khóa "Cloud" còn sót lại trên giao diện và
  thông báo, thay bằng "máy chủ" / "mạng nội bộ (LAN)".
- **Docker**: copy toàn bộ thư mục `tests/` vào image (`COPY tests ./tests`), giúp chạy
  được cả `npm test` (server) và `npm run test:client` (client) trực tiếp bên trong container.
- Thêm 2 test client mới (24/24) và 2 test server mới (13/13).

## [2.6.0] - 2026-11-06

### Tự làm mới giữa PC và điện thoại

- **Tự động đồng bộ khi dùng chung LAN**: thiết bị đang mở tự kiểm tra bản mới
  mỗi 15 giây, khi quay lại tab hoặc khi cửa sổ được focus. Nếu máy chủ có bản
  mới hơn, app tải lại và hiện thông báo — không cần reload thủ công.
- **Không ghi đè khi đang làm việc**: tạm hoãn làm mới khi máy có thay đổi chưa
  gửi (`dirty`), khi đang gõ trong ô nhập, hoặc khi đang mở hộp thoại sửa.
- Thêm 5 test client cho cơ chế làm mới (client test 22/22).

## [2.5.0] - 2026-11-06

### Ổn định dữ liệu & vòng đời server

- **Giữ `created_at` gốc**: `writeState` (xóa sạch rồi ghi lại) nay đọc `created_at`
  hiện có của `products`/`transactions` và giữ nguyên thay vì đặt lại thành thời
  điểm ghi. Bản ghi mới vẫn nhận `now`.
- **Đóng sạch khi dừng (SIGTERM/SIGINT)**: handler ngừng nhận request, đóng DB
  (checkpoint WAL) rồi thoát; có timeout 10s phòng request treo. `docker stop`
  không còn cắt đột ngột.
- Thêm test `created_at` giữ nguyên (server test 11/11).

## [2.4.0] - 2026-11-06

### Dọn dẹp repo (theo đánh giá review)

- **Xóa `wrangler.toml`** — chứa `database_id` và KV id thật, không còn dùng.
- **Xóa file legacy Cloudflare**: `worker.js`, `migrations/`, `scripts/backup-to-sql.mjs`.
- **Đổi tên** `tests/worker.test.mjs` → `tests/client.test.mjs` (chỉ còn test client;
  các test Cloudflare đã có `tests/server.test.mjs` tương đương).
- **Gỡ placeholder `%%NONCE%%`** khỏi `page.js` và `server.js` (CSP dùng `unsafe-inline`).
- **`package-lock.json`** được commit; `Dockerfile` dùng `npm ci` để build tái lập.
- **`package.json`**: version → `2.3.0`, thêm `engines.node >= 22`.
- **`docker-compose.yml`**: thêm `TZ=Asia/Ho_Chi_Minh` (tên backup đúng ngày VN).
- **`README.md`** viết lại cho bản local (bỏ hướng dẫn Cloudflare/D1/Time Travel).
- **`.gitignore`**: bỏ `.wrangler/`, `.dev.vars`.

## [2.3.0] - 2026-11-06

### Kiểm thử & sửa lỗi P0 (theo đánh giá review)

- **Test chạy trực tiếp `server.js`**: thêm `tests/server.test.mjs` (10 test) khởi
  động server thật và kiểm tra qua HTTP — validate, conflict 409, làm tròn tiền,
  tự động backup. Trước đây chỉ có test cho `worker.js` (bản Cloudflare cũ), nên
  file đang chạy production không được test.
- **Vá lỗi `X-Base-Updated` không phải số**: header `NaN` trước đây bị bỏ qua
  kiểm tra conflict (ghi đè mù); nay trả **400**.
- **Gỡ nút "Đăng xuất" chết**: `/logout` không còn tồn tại ở bản local (bỏ đăng
  nhập), nút này trỏ tới 404.
- **Docker**: COPY `tests/server.test.mjs` vào image; thêm `npm test` (server)
  và `npm run test:client` (client).
- **CI**: tách 2 job — test client trên host, test server bên trong container.

## [2.2.1] - 2026-11-06

### Bỏ cấu hình Claude Code cho code-review-graph

- Gỡ `.mcp.json`, `.claude/` và pre-commit hook do code-review-graph cài — không
  dùng với Claude Code. Giữ `CLAUDE.md` làm tài liệu kiến trúc.
- Vẫn có thể dùng CLI `code-review-graph` thủ công khi cần (`build`, `update`,
  `query`, `impact`, `architecture`).

## [2.2.0] - 2026-11-06

### Tích hợp code-review-graph (MCP)

- Cấu hình `code-review-graph` cho Claude Code để index repo này: `.mcp.json`,
  `.claude/settings.json` (hooks cập nhật graph), `.claude/skills/`.
- Thêm `CLAUDE.md` mô tả kiến trúc và hướng dẫn AI dùng graph khi đọc/sửa code.
- `.mcp.json` và `.claude/` (chứa đường dẫn tuyệt đối theo máy) được gitignore;
  graph DB `.code-review-graph/` cũng không commit.

## [2.1.1] - 2026-11-06

### CI — bỏ workflow deploy Cloudflare

- Thay `.github/workflows/deploy.yml` (deploy lên Cloudflare Workers, không còn
  dùng và luôn thất bại) bằng `.github/workflows/ci.yml`: chạy test và build
  thử Docker image trên mỗi push/PR.

## [2.1.0] - 2026-11-06

### Tự động sao lưu mỗi ngày

- Server tự tạo **1 bản backup file `.db` mỗi ngày** bằng SQLite `VACUUM INTO`
  (nhất quán, không cần dừng app).
- Lưu vào `data/backups/backup-YYYY-MM-DD.db` (trên ổ cứng PC), **giữ 30 bản**
  gần nhất, tự xóa bản cũ hơn.
- Chạy khi khởi động, sau mỗi lần ghi dữ liệu, và kiểm tra mỗi giờ (kịp chụp khi
  app chạy qua nửa đêm).
- Thêm API `GET /api/backups` liệt kê các bản backup hiện có.
- Cấu hình qua biến môi trường: `BACKUP_DIR`, `BACKUP_KEEP_DAYS`.

## [2.0.1] - 2026-11-06

### Thay đổi hiển thị & lưu trữ tiền — làm tròn về số nguyên

- **Tiền (đơn vị nghìn VND) luôn là số nguyên.** `fmtMoney` làm tròn (`Math.round`)
  và hiển thị không còn phần thập phân; bỏ dấu `,` (ví dụ `42,5` → `43`,
  `1.234,56` → `1.235`).
- **Làm tròn cả giá trị lưu**, không chỉ hiển thị: `price`, `total`, `cost`,
  `unitPrice` (giao dịch), `costPrice` (sản phẩm), `total` (đơn thuốc) đều được
  làm tròn ở cả client (`sanitize`) và server (`validateState`).
- **Chia tiền đơn thuốc** (`allocateRemedyAmounts`) giờ chia thành số nguyên;
  dòng cuối nhận phần dư nên tổng các dòng luôn khớp đúng số thang × giá 1 thang.
- Số lượng/khối lượng (`qty`, `stock`, `grams`, `g`, `thang`) **không** bị làm
  tròn — vẫn giữ phần thập phân vì là kg/gram.
- Đã làm tròn lại toàn bộ dữ liệu hiện có (273/463 giao dịch có tiền lẻ → 0).

## [2.0.0] - 2026-11-06

### Kiến trúc — chuyển sang chạy local (Docker + SQLite)

- **Bỏ Cloudflare Worker + D1**, thay bằng server Node (`server.js`) dùng
  **Express + better-sqlite3** chạy trong Docker; dữ liệu là **file SQLite thật
  trên ổ cứng** (`data/app.db`), dễ copy để backup.
- Giữ **nguyên hợp đồng API** `GET/PUT /api/state` (kể cả `X-Base-Updated`,
  `X-Force`, 409 conflict) và **toàn bộ logic tiền/tồn kho** trong `src/page.js`.
- PC và điện thoại trong cùng mạng WiFi truy cập chung một nguồn dữ liệu qua
  `http://<IP-máy-tính>:8787`; không cần internet.
- Thêm `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `package.json`.
- Cổng mặc định 8787, volume `./data:/data`.

### Bỏ đăng nhập

- Gỡ xác thực `APP_TOKEN` / cookie `qlk_token` / trang `/login` — bản local chỉ
  chạy trong mạng nội bộ. `authFetch` (kiểm tra Bearer + redirect 401) trong
  `src/page.js` được thay bằng `apiFetch` gọi thẳng API.

### Ghi chú

- `worker.js`, `wrangler.toml` và bộ test cũ được **giữ lại làm tham chiếu**;
  27 test hiện có vẫn chạy và pass.
- Hướng dẫn chạy cho người dùng nằm trong `README-LOCAL.md`.

## [1.14.2] - 2026-11-05

### Khôi phục & an toàn dữ liệu

- **Backup trước khi restore**: app tự tải `kho-backup-truoc-restore-YYYY-MM-DD-HHmm.json`
  (snapshot ngay trước khi ghi đè). Nếu trình duyệt chặn tải, restore bị huỷ thay vì mù quáng.
- README bổ sung runbook **D1 Time Travel** (kiểm tra `version: production`, lấy bookmark hiện
  tại/theo timestamp, khôi phục ghi đè, undo bằng bookmark trước đó) và hướng dẫn `d1 export`
  cho backup dài hạn.

### Sửa lỗi server & validate

- `PUT /api/state` với **JSON hỏng trả 400** (`JSON không hợp lệ`) thay vì 500.
- Server **cảnh báo** (không chặn) khi `transactions.productId` hoặc `prescription_items.productId`
  trỏ tới sản phẩm không có trong `products`; tổng số warning bị giới hạn 50 dòng.

### Refactor & test

- Tách `computeStats()` và `allocateRemedyAmounts()` thành hàm thuần, dùng chung cho UI và test.
  Tổng dòng khi chia tiền đơn thuốc vẫn bằng đúng `grand`; dòng cuối nhận phần dư.
- Test tăng từ 18 lên **27 pass**: stats/lãi ngày-tháng-năm, chia tiền lẻ, backup trước restore,
  luồng 409 (Lấy bản mới / Giữ bản máy này + `X-Force`), `pullState` khi dirty,
  JSON hỏng → 400, cảnh báo `productId` mồ côi.

## [1.14.1] - 2026-11-05

### Refactor

- Tách khối `PAGE` (~3.978 dòng: HTML + CSS + toàn bộ JS client) từ `worker.js` sang
  `src/page.js` dưới dạng `export const PAGE = String.raw\`...\``. `worker.js` còn ~530 dòng,
  chỉ giữ router/API, xác thực, đồng bộ D1 và lắp trang.
- `worker.js` import `PAGE` từ `src/page.js`; Wrangler tự bundle ESM nên **không phát sinh
  bước build mới**, không cần `package.json`/`npm install`.
- Giữ nguyên 100% nội dung HTML/CSS/JS client, placeholder `%%NONCE%%` / `%%BOOT%%` /
  `%%NEEDFETCH%%`, SSR và CSP.
- Test đọc `PAGE` từ `src/page.js`; thêm test xác nhận placeholder và việc `GET /` lắp trang,
  thay nonce/SSR đúng. Tổng test: **18 pass**.

## [1.14.0] - 2026-11-05

### Sửa lỗi dữ liệu (P0)

- **Xóa đơn nhập không còn làm tồn âm**: `delTx()` / `delOrder()` kiểm tra hàng đã bán trước
  khi trừ tồn; màn **Đối chiếu tồn kho** từ chối áp dụng số âm và bỏ qua các dòng lịch sử âm.
- **Sửa giao dịch bán giữ nguyên giá vốn lịch sử** (dùng đơn giá vốn cũ của chính giao dịch,
  chỉ fallback giá hiện tại khi thiếu `cost`) và **cập nhật lại `unitPrice`** cho mọi dòng
  cùng đơn thuốc để `Số thang × Giá 1 thang = Thành tiền` luôn đúng.
- **Chặn tiền/số lượng âm** ở bán lẻ, ghi chú bán lẻ, nhập hàng, sửa giá nhập và sửa giao dịch.
- **Mọi giao dịch bán lẻ đều có cờ `retail`** (kể cả đơn 1 vị); `mergeCandidates()` loại cả
  `retail` và tên cũ "Bán lẻ" nên không gộp nhầm đơn bán lẻ.
- **Lưu đơn thuốc theo ID đang chọn**, không dò theo tên: đổi tên không ghi đè đơn khác;
  trùng tên bị chặn; đổi tên có xác nhận (đổi tên hay lưu thành đơn mới).
- **Restore an toàn hơn**: file phải đủ `products` / `transactions` / `prescriptions`, kiểm tra
  ngày và số liệu; restore luôn **ép ghi đè Cloud** thay vì có thể mất bản vừa khôi phục.
- **Chia tiền đơn thuốc theo gram**: dòng cuối nhận phần dư để tổng khớp tuyệt đối; giá 1 thang
  được đọc sau khi thêm dòng đang nhập (không còn dùng giá trị cũ).

### Đồng bộ & API

- Thay so sánh `Date.now()` của client với timestamp server bằng **cờ `dirty` + `cloudBase`**
  lưu trong localStorage; thay đổi chưa gửi được giữ khi tải lại và tự đẩy lên Cloud.
  Khi không lưu được (mất mạng/400), app báo một lần "dữ liệu vẫn giữ trên máy này".
- Chống mất thay đổi khi có thao tác mới trong lúc request `PUT` đang chạy (giữ `dirty`, gửi tiếp).
- `readState()` đọc giao dịch và dòng đơn theo **`rowid`** để giữ đúng thứ tự dòng sau khi tải lại.
- Server **validate snapshot trước khi ghi**: đủ 3 bảng, tồn/tiền/qty không âm, ngày
  `YYYY-MM-DD`, số thang/gram hợp lệ; tự loại bản ghi trùng id/tên và trả `400` kèm chi tiết.
- Client `sanitize()` cũng loại trùng id/tên để lần lưu sau không làm hỏng `db.batch()`.

### Công cụ & tài liệu

- `scripts/backup-to-sql.mjs`: `cost: null` giữ `NULL` thay vì ghi thành `0`.
- Thêm `tests/worker.test.mjs` (Node built-in test runner) cho tiền, chuẩn hoá, đối chiếu tồn,
  gộp đơn, restore, validate API, conflict và script backup.
- README cập nhật quy ước tiền (nghìn VND), hiển thị đúng giá trị, dirty/cloudBase, restore ép
  ghi đè và mục tiêu Lighthouse (SEO cố ý `noindex`).

## [1.13.1] - 2026-11-05

### Docs

- README thêm mục **Tinh thần dự án (đặt từ đầu)**: PageSpeed/Lighthouse ở mức cao nhất
  (A11y / Best-Practices / SEO = 100), không tài nguyên ngoài, ít request, ngữ nghĩa
  HTML/ARIA, dữ liệu tiền/tồn kho qua luồng app, backup thường xuyên. Làm sổ tay chung
  cho người và cho AI khi sửa code sau này.

## [1.13.0] - 2026-11-05

### Bỏ tính năng Sổ Thu Chi

- Gỡ hoàn toàn mục **4. Sổ Thu Chi** khỏi app (phiên bản trước dùng để ghi thu/chi viết
  tay): form ghi thu/chi, nút Thu/Chi, danh mục, tổng thu/chi/số dư, lịch sử thu/chi
  tháng này, khuôn (CSS), bộ đếm trong sao lưu và mã đồng bộ `/api/state`.
- Dữ liệu không còn dùng tới: bảng `ledger` **trống (0 dòng)** → xóa hẳn bảng bằng
  `migrations/0002_drop_ledger.sql`. Người dùng chuyển sang ứng dụng khác cho việc thu chi.
- Backup/khôi phục không còn chứa `ledger`; script `scripts/backup-to-sql.mjs` cũng bỏ
  phần import/ledger. Các thống kê (nhập/bán/lợi nhuận/tồn kho) không phụ thuộc sổ thu chi
  nên giữ nguyên.
- Mục còn lại tự đánh số lại gọn: 1. Đơn bán lẻ · 2. Đơn thuốc chén · 3. Nhập hàng.

## [1.12.0] - 2026-11-05

### Thay đổi

- **Danh sách tồn kho bỏ cột "Trị giá"**; thứ tự cột hiện là **Tên – Đã bán – Tồn kho – Giá nhập**
  (đúng yêu cầu); cột **Đã bán** hiển thị tổng kg đã bán của vị đó (cùng nguồn với mục
  sắp xếp "Bán chạy nhất"). Bỏ luôn 2 lựa chọn sắp xếp theo trị giá trong dropdown.

### Dữ liệu

- Sửa giao dịch nhập **Thăng Ma** (01/11/2026) bị gõ nhầm **40 kg → 4 kg** qua chức năng
  "Sửa giao dịch" của app (giá giữ 240k/kg, thành tiền 9.600 → 960): tồn kho, lịch sử,
  thống kê tháng tự đồng bộ; verify bằng D1 (`stock=4`) và màn **Đối chiếu tồn kho**
  (Thăng Ma không còn lệch).
- Xóa giao dịch **nhập kép Tri Mẫu** (31/10/2026): chỉ nhập 1 lần nhưng ghi 2 dòng
  2,5 kg (@ 17k và @ 170k) — xóa dòng @ 17k (42,5k), giữ dòng @ 170k (425k); sau đó
  chỉnh tồn theo lịch sử trong màn Đối chiếu → **Tri Mẫu tồn = 2,44 kg, khớp thực tế**.
  Đối chiếu hiện còn 4 vị lệch nhỏ (Đại Táo +0,03; Hồng Hoa +0,01; Sinh Địa +0,01;
  Xuyên Khung Thái +0,01) — **chưa tự sửa**, chờ quyết định của chủ shop.

## [1.11.0] - 2026-11-05

### Thêm mới

- **Danh sách tồn kho sắp xếp mặc định theo "Bán chạy nhất"**: tổng kg đã bán (mọi giao
  dịch `BAN` — bán lẻ lẫn đơn chén, đều lưu `qty_kg`) giảm dần; hòa nhau → theo tên A→Z.
  Lựa chọn mới nằm trên dropdown `#invSort`, các cách sắp xếp cũ giữ nguyên.
  Chỉ đổi thứ tự hiển thị, không đụng dữ liệu.
- Ý tưởng cảnh báo "tồn còn 10%" đã **bỏ** (chiều đo mơ hồ, dễ gây rối).

## [1.10.0] - 2026-11-05

### Thay đổi

- **Phiên đăng nhập không tự hết hạn**: cookie `qlk_token` sống ~10 năm, chỉ kết thúc khi
  bấm **Đăng xuất** (xóa cookie tại `/logout`). Không còn giới hạn 30 ngày.
- **Chống dò mật khẩu**: nhập sai quá **10 lần trong 10 phút** (đếm theo IP, lưu trong
  KV, TTL 10 phút) → tạm khóa đăng nhập, trả 429. Đăng nhập đúng → bộ đếm được xóa.
  Cần thiết vì mã truy cập là mật khẩu ngắn.
- Độ trễ sau mỗi lần nhập sai tăng lên 800ms (trước là 400ms).
- Mã truy cập hiện tại đặt qua `wrangler secret put APP_TOKEN` (nêu rõ nếu đổi mã thì mọi
  cookie/Bearer cũ vô hiệu).

## [1.9.0] - 2026-11-05

### Bảo mật

- **Trang login 1 ô mật khẩu**: `/` chưa đăng nhập chỉ trả về trang login (~2 KB, HTML thuần,
  không JS, **không chứa bất kỳ dữ liệu nào**). Trước bản này, toàn bộ dữ liệu (sản phẩm,
  tồn, giá vốn, giao dịch) bị nhúng thẳng trong HTML qua `window.__DB__` — ai mở `/` cũng
  đọc được toàn bộ, token API không chặn được việc này.
- Đăng nhập đúng → cookie `qlk_token` (`HttpOnly; SameSite=Strict; Max-Age=30 ngày`), app
  dùng đầy đủ như trước, không cần nhập lại cho tới khi hết hạn/xóa cookie.
- API `/api/*` chấp nhận cookie (trình duyệt tự gửi) hoặc `Authorization: Bearer <APP_TOKEN>`
  (tương thích bản 1.8.0). Sai mã → 401 + trễ 400ms.
- Nút **Đăng xuất** trên header (`GET /logout` xóa cookie → về `/login`).
- Worker so sánh mã sau khi `trim()` ở cả Bearer lẫn cookie.

### Sửa lỗi

- Một số trình duyệt/máy yếu không render được vùng app → thấy trang trắng. Trang login
  mới không dùng JS nên hiển thị được trên mọi trình duyệt; app được phục vụ như cũ sau khi đăng nhập.

## [1.8.0] - 2026-11-05

### Thêm mới

- **Mã truy cập (token) cho mọi API `/api/*`**: Worker kiểm tra header `Authorization: Bearer
  <APP_TOKEN>` trước khi xử lý; thiếu/sai → 401. Trang HTML (`/`) vẫn mở được nhưng không
  chứa dữ liệu — dữ liệu chỉ trả về khi có token.
- Token lưu trong `localStorage` của trình duyệt, nhập 1 lần mỗi máy; app gửi kèm header
  tự động cho cả `GET` (pullState) và `PUT` (pushState).
- Secret `APP_TOKEN` đặt qua `npx wrangler secret put APP_TOKEN`, không nằm trong git;
  Worker so sánh token sau khi `trim()`.
- Repo GitHub chuyển sang **private**; README viết lại tối giản (bỏ URL, database_id, KV id,
  thông tin cá nhân) và ghi rõ các quy tắc logic cốt lõi (tiền REAL chỉ cắt lẻ khi hiển
  thị, tồn kho kg/REAL + check 1e-9, conflict 409 qua `X-Base-Updated`).
- `preview_urls = false` trong `wrangler.toml`.

### Bảo mật

- Trước bản này: ai có link đều đọc/ghi/xóa được toàn bộ dữ liệu. Từ 1.8.0, link không
  còn đủ — cần token. Backup JSON vẫn bắt buộc vì PUT `/api/state` ghi đè toàn bộ snapshot.

## [1.7.0] - 2026-11-04

### Thay đổi phá vỡ

- **Dữ liệu chính chuyển từ Cloudflare KV sang Cloudflare D1**: app đọc/ghi `products`,
  `transactions`, `prescriptions`, `prescription_items`, `ledger` trực tiếp trong D1.
- **Không còn nút “Lưu Cloud” / “Tải Cloud”**: mỗi lần mở trang app tải dữ liệu mới nhất từ
  máy chủ; các thao tác ghi sẽ tự lưu vào D1.
- **Bỏ đồng bộ qua KV và localStorage làm nguồn chính**: localStorage chỉ còn là cache tạm,
  dữ liệu chính nằm trong D1.
- **Di chuyển dữ liệu hiện tại sang D1**: import từ bản KV mới nhất (142 sản phẩm,
  432 giao dịch, 6 đơn thuốc chén).
- App vẫn public, chưa có lớp đăng nhập; ai có link đều dùng được.

### Kỹ thuật

- Thêm D1 database `quan-ly-kho` với schema migration `migrations/0001_init.sql`.
- Thêm `scripts/backup-to-sql.mjs` để import backup JSON vào D1.
- Worker đọc/ghi D1 qua `/api/state`; `/sync` cũ đã bị thay thế.
- Ghi dữ liệu dùng D1 batch, xóa/chèn lại toàn bộ snapshot trong một lần gọi.
- Giữ KV binding trong cấu hình để có thể rollback nếu cần, nhưng app không còn dùng KV.

## [1.6.0] - 2026-11-04

### Thay đổi phá vỡ

- **Bỏ hoàn toàn đăng nhập của ứng dụng**: mọi người có link đều xem và thao tác được app,
  không còn mật khẩu `APP_PASSWORD`, cookie `qlk_session`, trang `/login`, nút **Thoát**
  và cơ chế khóa tạm theo IP.
- **`/sync` không còn yêu cầu xác thực**: dữ liệu có thể bị xem, ghi đè hoặc thay đổi bởi
  bất kỳ ai có link. Mọi người dùng nên chủ động backup JSON thường xuyên.
- Không nên dùng bản này để lưu dữ liệu cần riêng tư.

## [1.5.1] - 2026-11-04

### Thêm mới

- **Sửa từng dòng ngay trong hộp Chi tiết đơn** (cả đơn nhập lẫn đơn bán, kể cả đơn
  thuốc chén): mỗi dòng có menu `···` → **Sửa dòng** / **Xóa dòng**.
  - Đơn lẻ/bán lẻ/nhập: sửa *SL (kg)* + *Đơn giá*, tổng tiền tự tính lại.
  - Đơn thuốc chén: sửa *Số gram (mỗi thang)* — nhãn và ô thật hiển thị theo gram,
    không phải kg.
  - Tồn kho, thống kê doanh thu/lợi nhuận và lịch sử tự điều chỉnh như thao tác
    sửa/xóa giao dịch lẻ; đơn xóa hết dòng sẽ tự đóng.
- Hộp *Chi tiết đơn* luôn hiển thị đúng: sửa/xóa từ lịch sử cũng tự làm mới hộp nếu
  đang mở.

### Sửa lỗi

- Đơn gộp trước đây không có nút sửa/xóa từng dòng — chỉ xóa cả đơn (phải xóa rồi
  nhập lại). Giờ sửa được ngay tại hộp chi tiết.

## [1.5.0] - 2026-11-04

### Thêm mới

- **Sổ Thu Chi** (mục *4. Sổ Thu Chi*, ngay sau *3. Nhập hàng*): ghi nhanh thu/chi bằng
  loạt nút `[Thu] [Chi]` → nhập số tiền → chọn danh mục → **Ghi**. Bảng lịch sử tháng
  hiện tại (đi theo bộ màu xanh/đỏ) với **tổng kết Thu tháng / Chi tháng / Số dư**; mỗi
  dòng có menu `···` để xóa. Dữ liệu lưu vào `db.ledger` nên **tự động đồng bộ Cloud**,
  có trong bản sao lưu khôi phục cả khi đặt lại. Danh mục Thu: Bán hàng, Bán lẻ, Thu nợ,
  Khác · Danh mục Chi: Nhập hàng, Tiền nhà, Lương, Điện nước, Vận chuyển, Khác.

### Thay đổi

- **"Gần nhất" trong Lịch sử nhập & bán hàng giờ hiện cả ngày** thay vì chỉ các giao
  dịch trong cùng phút gần nhất (trước đây bán xong là các đơn cũ bị ẩn, dễ hiểu lầm là
  mất đơn). Bấm **Tất cả** hoặc lọc theo tháng vẫn xem được toàn bộ.

## [1.4.8] - 2026-11-04

### Thay đổi

- **Cột thao tác (sửa/xóa) chuyển thành menu `···`** trong toàn bộ các bảng có nút
  thao tác theo dòng: *Tồn kho*, *Lịch sử nhập hàng & bán hàng* (giao dịch lẻ và đơn
  gộp), *Tờ ghi nhập hàng* (danh sách chờ nhập), *Tờ ghi bán lẻ* và *Tờ ghi đơn thuốc
  chén*. Menu dùng `position: fixed` nên không bị cắt bởi vùng cuộn ngang của bảng,
  tự căn theo nút `···` (căn phải, tự lật lên trên khi gần đáy màn hình); đóng khi
  bấm ra ngoài, nhấn **Esc**, cuộn trang hoặc đổi kích thước cửa sổ. Mỗi mục xóa tô
  màu đỏ; điều hướng bàn phím và ARIA (`aria-haspopup="menu"`, `role=menu/menuitem`).
  Hành vi sửa/xóa giữ nguyên.
- **Ẩn dấu mũi tên (spinner) của mọi ô nhập `type="number"`** trên desktop
  (Chrome/Edge/Firefox); trên mobile vẫn nhập số qua bàn phím như cũ.

## [1.4.7] - 2026-11-04

### Thay đổi

- **Giá 1 thang nằm ngay trong tờ ghi đơn thuốc chén**: ô nhập *Giá 1 thang* được dời
  vào cuối dòng *Tổng 1 thang* (bên phải số gram, dạng số trơn không có chữ `k`), ví dụ
  `Tổng 1 thang · 415 g · [140]`.
- **Khung tính tiền gọn lại**: phía dưới chỉ còn `Số thang [10] = Thành tiền 1.400`;
  bỏ cụm `× Giá 1 thang` vì giá đã nhập ngay trên tờ ghi. Thành tiền vẫn là
  *Số thang × Giá 1 thang* và cập nhật ngay khi thay đổi.

## [1.4.6] - 2026-11-04

### Thay đổi

- **Nhấn Enter là đưa vị thuốc vào tờ ghi** (mục *1. Đơn bán lẻ* và *2. Đơn thuốc chén*):
  khi đang nhập dòng (ô *SL (kg)* / *Thành tiền*, hoặc ô *Số gram*), nhấn **Enter** sẽ
  đưa thẳng vị thuốc vào tờ ghi bên dưới (giống nút `+`), tờ ghi tự cập nhật và focus
  quay về ô tìm vị thuốc để nhập tiếp. Trước đây Enter chỉ đưa focus về ô chọn vị thuốc,
  vị thuốc chỉ hiện vào tờ ghi khi bạn chọn vị thuốc tiếp theo. Nếu SL/gram = 0 hoặc
  trống, app báo và focus lại ô cần nhập, không thêm dòng rác. Thêm dòng hint nhắc nhấn
  Enter ở cả hai mục.

## [1.4.5] - 2026-11-04

### Sửa lỗi

- **Xóa đơn nhập gộp**: nút thùng rác ở dòng *Đơn nhập ngày …* trong *Lịch sử nhập hàng*
  trước đây **cộng thêm** số lượng vào tồn kho của từng vị thuốc (đúng với đơn bán), làm
  tồn kho tăng ảo sau khi xóa. Nay xóa đơn nhập sẽ **trừ** lại số lượng đã nhập, xóa đơn
  bán vẫn cộng lại tồn như cũ (giống xóa từng dòng giao dịch lẻ).
- Logic giá giữ nguyên theo đúng sổ sách: mỗi giao dịch lưu đơn giá tại thời điểm
  nhập/bán; giá vốn đơn bán tính theo giá vốn lúc bán ra.

## [1.4.4] - 2026-11-04

### Sửa lỗi

- **Căn cột tiền trong tờ ghi**: ô *Đơn giá* và *Thành tiền* của từng dòng trong hộp chi
  tiết đơn nhập và trong *Tờ ghi nhập hàng* (danh sách chờ nhập) giờ căn phải, thẳng cột
  với tiêu đề và dòng *Tổng cộng / Tổng tiền* ở cuối bảng (trước đây các ô này căn trái
  nên tiền bị lệch cột so với tiêu đề và số tổng).
- **Lịch sử nhập & bán hàng**: cột *Đơn giá* và *Thành tiền* (cả tiêu đề lẫn số liệu)
  căn phải trên màn hình rộng để các cột tiền thẳng hàng; trên điện thoại giữ nguyên
  dạng thẻ như cũ.

## [1.4.3] - 2026-11-04

### Thay đổi

- **Nhãn tiền**: bỏ `(k)` trong tiêu đề cột và tổng tiền, đồng bộ hiển thị.

## [1.4.2] - 2026-11-04

### Thay đổi

- **Đơn vị tiền**: bỏ hàng nghìn, hiển thị theo nghìn VND (ví dụ `69.457`).

## [1.4.1] - 2026-11-04

### Thay đổi

- **Đơn vị tiền**: bỏ đơn vị `tr` (triệu) và `k` (nghìn); hiển thị tiền đầy đủ bằng VND,
  làm tròn đến hàng nghìn, phân cách nghìn bằng dấu `.` (ví dụ `69.457.000`).

## [1.4.0] - 2026-11-04

Bản cập nhật đồng bộ cách hiển thị lịch sử nhập hàng với lịch sử bán hàng, chuẩn hoá
định dạng ngày kiểu Việt Nam và hiển thị số liệu chính xác, không làm tròn.

### Thay đổi

- **Lịch sử nhập hàng dạng bảng**: bỏ giao diện chọn "lần nhập" và tờ ghi riêng; lịch
  sử nhập hàng giờ là bảng giống lịch sử bán hàng (*Ngày · Vị thuốc · SL · Đơn giá ·
  Thành tiền · Thao tác*). Nút *Gần nhất* lọc theo ngày **và giờ:phút**, không chỉ ngày.
- **Đơn nhập nhiều vị thuốc**: lần nhập có từ 2 vị trở lên hiện thành một dòng đơn có
  tên *Đơn nhập ngày dd/mm/yyyy · HH:MM*; bấm vào tên để mở hộp chi tiết như đơn bán.
  Lần nhập chỉ có 1 vị vẫn hiện thành dòng bình thường.
- **Ngày kiểu Việt Nam**: mọi ô chọn ngày/tháng và mọi chỗ hiển thị ngày đều dùng
  `dd/mm/yyyy` hoặc `mm/yyyy`; bấm biểu tượng lịch vẫn mở bộ chọn ngày gốc.
- **Hiển thị số chính xác**: bỏ làm tròn 2 chữ số thập phân; số lượng, đơn giá và thành
  tiền hiển thị đầy đủ chữ số (chỉ dọn nhiễu nhị phân của JavaScript), phân cách nghìn
  bằng dấu `.` và phần thập phân bằng dấu `,`.
- **Lưu thời điểm giao dịch**: mỗi giao dịch mới lưu thêm `ts` (miligiây); dữ liệu cũ
  được suy ra thời điểm từ mã giao dịch để sắp xếp và lọc "Gần nhất" chính xác.

### Sửa lỗi

- Đơn nhập nhiều vị không còn bị tách rời trong lịch sử; xóa cả đơn sẽ điều chỉnh lại
  tồn kho cho tất cả vị thuốc trong đơn.
- Hộp chi tiết đơn nhập hiển thị đúng các cột *SL · Đơn giá · Thành tiền*.

## [1.3.0] - 2026-11-03

Bản cập nhật bảo mật: ứng dụng yêu cầu đăng nhập bằng mật khẩu.

### Thêm mới

- **Đăng nhập bằng mật khẩu**: khi chưa đăng nhập chỉ thấy trang nhập mật khẩu; không
  xem được trang chính, không đọc hay ghi được dữ liệu qua `/sync`. Đăng nhập một lần
  được ghi nhớ 30 ngày trên từng thiết bị.
- **Nút Thoát** ở thanh trên cùng để đăng xuất.
- **Chặn dò mật khẩu**: sai quá 5 lần từ cùng một địa chỉ IP sẽ bị khóa 15 phút.
- Khi phiên đăng nhập hết hạn lúc đang dùng, app báo và tải lại về trang đăng nhập.

### Thay đổi

- Mật khẩu đặt bằng secret `APP_PASSWORD` trên Cloudflare (không nằm trong mã nguồn
  hay trên GitHub). Chưa đặt secret thì ứng dụng bị khóa và hiện hướng dẫn đặt mật khẩu.
- Đổi `APP_PASSWORD` sẽ làm mọi thiết bị đang đăng nhập phải đăng nhập lại.
- Bỏ CORS `*` của API; `robots.txt` chặn toàn bộ; trang gửi `X-Robots-Tag: noindex`.

### Kỹ thuật

- Phiên đăng nhập là cookie `qlk_session` (`HttpOnly`, `SameSite=Strict`, `Secure`) ký
  HMAC-SHA256 từ mật khẩu; so sánh mật khẩu và chữ ký theo thời gian không đổi.
- `POST /login`, `POST /logout` kiểm tra `Origin` cùng nguồn. Đếm số lần sai lưu trong
  KV với khóa `rl:<ip>` (tự xóa sau 15 phút).
- `GET/POST /sync` trả `401` khi chưa đăng nhập.

## [1.2.0] - 2026-11-03

Bản cập nhật tập trung vào độ chính xác của dữ liệu (đối chiếu tồn kho, cảnh báo
giá nhập, chống ghi đè Cloud) và đưa lịch sử nhập hàng, đơn thuốc chén về dạng "tờ ghi".

### Thêm mới

- **Tờ ghi đơn thuốc chén**: ô nhập chỉ còn một dòng (tên vị thuốc, số gram); bấm
  nút `+` để đưa dòng vào tờ ghi. Tờ ghi có các cột *STT · Tên · SL (gram)*, nút
  sửa/xóa từng dòng, 10 dòng mỗi trang, dòng cuối *Tổng 1 thang*. Chọn trùng vị
  thuốc đã có trong tờ ghi sẽ báo và mở sẵn ô sửa gram. Chọn *Đơn có sẵn* sẽ nạp
  toàn bộ vị thuốc vào tờ ghi; dòng đang nhập dở vẫn được tính khi lưu hoặc bán đơn.
- **Lịch sử nhập hàng theo từng lần nhập**: chọn một lần nhập (ngày, số vị, tổng tiền)
  để xem dưới dạng tờ ghi *STT · Tên · SL · Giá/kg* kèm nút sửa/xóa từng dòng, dòng
  *Tổng tiền* của lần nhập đó và phân trang 10 dòng. Có nút *Xóa cả lần nhập*
  (tự điều chỉnh lại tồn kho). Bỏ cột ngày vì ngày đã nằm ở tiêu đề tờ ghi.
- **Cảnh báo giá nhập chênh nhiều**: khi giá nhập mới lệch hơn 50% so với lần nhập
  gần nhất của vị thuốc đó (cao hơn 1,5 lần hoặc thấp hơn một nửa), app hiện hộp
  xác nhận trước khi thêm vào danh sách hoặc lưu nhập. Vị thuốc mới hoặc chưa từng
  nhập thì không cảnh báo.
- **Đối chiếu tồn kho**: nút *Đối chiếu tồn kho* ở mục *Danh sách tồn kho* liệt kê
  các vị thuốc có tồn khác với (tổng nhập − tổng bán) trong lịch sử, kèm nút
  *Dùng số lịch sử* cho từng dòng và *Áp dụng tất cả*.
- **Chống ghi đè Cloud khi dùng nhiều thiết bị**: nếu Cloud đã được lưu từ thiết bị
  khác sau lần bạn mở trang, app hỏi tải bản Cloud về hay giữ bản trên máy và ghi
  đè, thay vì ghi đè âm thầm.
- **Gộp đơn thuốc lẻ cũ**: nút *Gộp đơn thuốc lẻ cũ* ở *Lịch sử bán hàng* (chỉ hiện khi
  có đơn cần gộp) liệt kê các nhóm dòng bán chưa có tên đơn, cùng ngày và cùng đơn
  giá/kg để chọn gộp thành một đơn *Đơn thuốc lẻ*. Nhóm có đơn giá lẻ do chia đều
  được tick sẵn; nhóm đơn giá tròn (có thể là bán lẻ) không tick sẵn.

### Thay đổi

- **Đơn thuốc chén không đặt tên** khi bán sẽ được lưu thành một đơn tên
  *Đơn thuốc lẻ* (trước đây hiện rời từng vị trong lịch sử bán hàng). Ô *Tên đơn* có
  gợi ý "Để trống sẽ ghi là Đơn thuốc lẻ".
- **Mỗi lần bấm Lưu nhập hàng** được lưu thành một lần nhập riêng (có mã `oid`). Các
  lần nhập cũ chưa có mã được gom theo ngày.
- Tờ ghi gọn hơn trên điện thoại (cột thao tác hẹp hơn, số liệu không xuống dòng).

### Sửa lỗi

- Số gram lẻ trong tờ ghi đơn thuốc chén không còn bị làm tròn theo kg
  (ví dụ 15 g từng hiện thành 20 g); nay hiển thị đúng số gram đã nhập.

### Kỹ thuật

- `sanitize()` giữ lại `oid` của giao dịch nhập hàng (`NHAP`), không cần `oname`.
- Endpoint `POST /sync` nhận header `X-Base-Updated` (thời điểm cập nhật Cloud mà máy
  đã biết) và `X-Force`; nếu Cloud mới hơn trả `409 {"conflict": true}`. Client cũ
  không gửi header vẫn ghi bình thường.
- Thêm các hàm `impBatches`, `renderImpNote`, `renderRemedyNote`, `nhapPriceOk`,
  `reconcileList`, `mergeCandidates` và biến `cloudBase`.

## [1.1.0] - 2026-11-03

Bản cập nhật tập trung vào trải nghiệm nhập liệu nhanh và cách hiển thị đơn hàng
gọn gàng theo dạng "tờ ghi".

### Thêm mới

- **Sao chép đơn có sẵn**: nút *Sao chép đơn* xuất hiện khi đang chọn một đơn
  trong mục *Đơn có sẵn*. Bấm nút sẽ hỏi tên đơn mới (mặc định
  `"<tên đơn> (bản sao)"`), sao chép đúng nội dung đang hiển thị trên màn hình
  (kể cả phần vừa sửa nhưng chưa lưu), lưu thành đơn mới và tự chọn đơn đó.
  Có kiểm tra trùng tên và báo lỗi khi đơn chưa có vị thuốc.
- **Hộp thoại Chi tiết đơn** trong *Lịch sử bán hàng*: bấm vào tên đơn để xem
  danh sách vị thuốc của đơn đó, giống cách xem đơn có sẵn ở mục *Đơn thuốc chén*.
- **Đơn bán lẻ nhiều vị**: đơn bán lẻ có hơn 1 vị khi lưu sẽ được gom thành một
  đơn tên *Bán lẻ* (kèm số vị) trong lịch sử bán hàng; bấm vào tên xem được chi tiết.
  Đơn chỉ có 1 vị vẫn hiển thị như một dòng giao dịch bình thường.
- **Tờ ghi nhập hàng**: danh sách chờ nhập có các cột *STT · Tên · SL · Giá nhập*,
  dòng *Tổng tiền* và nút xóa từng dòng.
- **Phân trang** cho chi tiết đơn (10 dòng/trang) với nút *Trước / số trang / Sau*.

### Thay đổi

- **Chi tiết đơn thuốc chén** hiển thị gọn theo dạng tờ ghi:
  - Bảng chỉ còn *STT · Tên · SL (gram)*, 10 dòng mỗi trang.
  - Dòng cuối: *Tổng 1 thang* kèm tổng số gram của một thang.
  - Khối thông số: **Số thang × Giá 1 thang = Thành tiền**.
- **Mục Nhập hàng**:
  - Bỏ ô *Ngày* (khi lưu tự dùng ngày hôm nay).
  - Ba ô *Vị thuốc · Số lượng (kg) · Giá nhập (k/kg)* nằm trên một hàng ngang,
    kể cả trên điện thoại.
  - Nhấn **Enter** sau khi nhập số lượng/giá sẽ thêm dòng vào tờ ghi, xóa trắng ô
    nhập và quay về ô *Vị thuốc*; danh sách gợi ý không tự bung ra.
  - Chọn gợi ý xong tự chuyển focus sang ô *Số lượng*.
- **Ô chọn vị thuốc** (Đơn bán lẻ, Đơn thuốc chén, Nhập hàng, Tìm tồn kho): không
  còn tự hiện toàn bộ danh sách khi bấm/focus; chỉ hiện gợi ý khi bắt đầu gõ chữ.
- **Placeholder** các ô chọn vị thuốc đổi thành *"Nhập tên vị thuốc..."*
  (ô lọc tồn kho: *"Nhập tên vị thuốc để lọc..."*).

### Sửa lỗi

- Cột *Đơn giá* trong chi tiết đơn thuốc chén hiển thị sai đơn vị (k/kg trong khi
  SL là lạng/g). Đã bỏ cột này và thay bằng khối thông số thang/giá chính xác.
- Giao dịch đơn thuốc chén trước đây không lưu thông tin thang/giá nên không thể
  hiển thị lại chính xác; nay mỗi giao dịch lưu thêm `rx`, `g`, `thang`, `unitPrice`.
- Đơn cũ thiếu metadata vẫn xem được đúng nhờ fallback theo đơn có sẵn cùng tên
  (`presetByName`), giá 1 thang suy ra từ tổng tiền thực tế chia số thang.

### Kỹ thuật

- `sanitize()` giữ lại các trường `retail`, `rx`, `g`, `thang`, `unitPrice`
  khi đọc/ghi dữ liệu và đồng bộ Cloud.
- Bổ sung CSS `.nhap-row`, `.linkbtn`; dùng lại kiểu `.note` cho các tờ ghi.
- Không phát sinh lỗi console khi render và thao tác trên trình duyệt.

## [1.0.0] - 2026-11-03

Phiên bản đầu tiên.

### Tính năng

- Quản lý kho dược liệu: danh mục vị thuốc, tồn kho, giá nhập gần nhất.
- Nhập hàng, bán lẻ, đơn thuốc chén (đơn có sẵn) và lịch sử bán hàng.
- Biểu đồ nhập/bán theo tháng, thống kê doanh thu và giá vốn.
- Sao lưu/khôi phục dữ liệu, đồng bộ lên Cloud (KV).
- Giao diện SSR tối ưu PageSpeed: CSS nhúng, SVG sprite, không phụ thuộc CDN.
