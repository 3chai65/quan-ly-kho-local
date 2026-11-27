# Chốt sổ năm (âm lịch) — thiết kế (việc AN; mã từ 2.40.0: close.js, server.js, src/page.js)
Năm sổ N = từ Tết(N) đến Tết(N+1) − 1 ngày. App giữ năm sổ hiện tại + 1 năm sổ trước. Ví dụ chốt sau Tết 2028: mốc C = Tết 2027, gỡ mọi giao dịch có `date < C`.
Ngày đề xuất: D = Tết(năm nay) − 1 (ngày cuối năm âm vừa hết). Người dùng sửa được D. C = Tết của năm âm chứa D (không lùi năm). Ví dụ D = Tết 2028 − 1 → C = Tết 2027: giữ năm sổ 2027 và 2028.
Bảng Tết (dương lịch, giờ VN UTC+7): 2025-01-29, 2026-02-17, 2027-02-06, 2028-01-26, 2029-02-13, 2030-02-02, 2031-01-23, 2032-02-11, 2033-01-31, 2034-02-19, 2035-02-08; từ 2.40.4 thêm 2036-01-28 … 2045-02-17 (đối chiếu thuật toán Hồ Ngọc Đức UTC+7: khớp). Tết 2030 = 02/02 (trăng mới 23:09 giờ VN; 03/02 là mùng 2, Người duyệt đối chiếu Báo Nghệ An, sửa 27/11/2026). Người duyệt đã chốt bảng (26/11/2026); `close.js` và `src/page.js` dùng chung, test so.

## 1. Dữ liệu: "Tồn đầu kỳ" = giao dịch NHAP có cờ `open: true` (cột mới `opening INTEGER NOT NULL DEFAULT 0`)
- Chọn cách này thay vì thêm trường trên sản phẩm: giữ đúng bất biến `tồn = Σnhập − Σbán` (stockDrift, Đối chiếu) mà không đổi công thức. Thêm cột bằng `ALTER ADD`, không phải dựng lại bảng như khi đổi CHECK loại giao dịch.
- Mỗi vị có tồn tại mốc > 0 được 1 dòng: `date = C`, `qty` = tồn tại mốc, `price` = giá vốn tại mốc, `total = 0`, `id = 'open-<C>-<productId>'`. Không có `orderId`, không vào bảng `unread`.
- `validateState`/`sanitize` giữ cờ `open`. Dòng `open` hợp lệ khi: là NHAP, ngày đúng bằng `app_meta.close_cutoff`, tối đa 1 dòng/vị.
- Client ẩn dòng `open` ở Lịch sử nhập, "Nhập trong tháng", Thống kê nhập, chấm chưa đọc; không có menu sửa/xóa (server cũng chặn, xem mục Bảo vệ). Vẫn tính vào tồn, Đối chiếu, `lastImport`/`refPrice` (giá vốn gần nhất tại mốc).
- "Đã bán" ở Kho tồn từ nay chỉ tính phần còn giữ (2 năm sổ); cần ghi rõ trên giao diện.
- BAN còn giữ: dòng có `cost` không đổi; dòng thiếu `cost` vẫn tính `qty × costPrice` hiện tại như trước. Một đơn luôn cùng ngày nên bị gỡ cả hoặc giữ cả; `allocateRemedyProfitEvenly` không bị ảnh hưởng.

## 2. Bảng tóm tắt
- Lưu ở `app_meta.close_summary` (JSON), server sở hữu, không nằm trong snapshot PUT. GET `/api/state` trả thêm `closed: { cutoff: C, months: [{ m: 'YYYY-MM', imp, rev, cost }] }` (đồng nguyên).
- Mỗi lần chốt sau cộng dồn (tháng trùng thì cộng). Server tự tính nên chỉ cần kiểm kiểu.
- Thống kê: `chartData` cộng `months` vào số tính từ giao dịch. Tháng chứa C chia đôi (một phần lưu trữ, một phần còn giữ), cộng lại đúng tổng cũ. Lợi nhuận = rev − cost.

## 3. Tồn và giá vốn tại mốc C — tính cộng dồn xuôi
- Tồn tại mốc = Σ(nhập − bán) của giao dịch có `date < C`. Giá vốn tại mốc = giá NHAP gần nhất trước C (cùng luật thứ tự với `lastImport`); không có NHAP thì lấy `costPrice`.
- Dry-run CHẶN chốt khi: còn stockDrift (sửa ở Đối chiếu trước, để tính xuôi khớp tồn hiện tại); có vị tồn tại mốc < 0 (liệt kê); hoặc `close_cutoff` hiện có ≥ C.
- Tồn tại mốc = 0 thì không tạo dòng. Sau khi chốt kiểm lại bất biến tồn; sai thì rollback.

## 4. Đơn thuốc đã lưu và đơn đang soạn không bị ảnh hưởng
Chốt chỉ DELETE/INSERT trên `transactions`; không đụng `products` (tồn đã kiểm ở mục 3) và `prescriptions`. Đơn đang soạn nằm ở bộ nhớ/IndexedDB từng máy, không ở hub. Test so `products` và `prescriptions` trước/sau: phải trùng từng byte.

## Endpoint `POST /api/close-year` (chỉ owner, desktop), nhận `{ cutoff, dryRun }` + `X-Base-Updated`
- dryRun: trả số giao dịch bị gỡ, tồn đầu kỳ và giá vốn từng vị, tổng nhập/doanh thu/lợi nhuận bị gỡ, lý do chặn. Không ghi gì.
- Chạy thật: (1) base khớp, sai → 409; (2) `VACUUM INTO backup-…-truoc-chot-<C>.db`; (3) ghi `data/luu-tru-truoc-<C>.json.tmp` (giao dịch bị gỡ + summary cũ); (4) trong `db.transaction`: xóa `date < C`, chèn dòng `open`, đặt `close_cutoff`/`close_summary`, tăng `updatedAt`, xóa last_op; (5) đổi `.tmp` → `.json`.
- Lỗi ở bước 2–4: xóa `.tmp`; DB không đổi. `GET /api/close-archive[/<file>]` (chỉ owner): tải file lưu trữ ở mục Sao lưu. Client: nút trong "Sao lưu khôi phục" → xem trước → gõ "CHOT <năm>" → `pullState`.

## Bảo vệ: máy khác không ghi đè ngược sổ đã chốt
- Mọi PUT (kể cả `X-Force` và khôi phục từ file) bị từ chối 409 "Sổ đã chốt đến <C>, hãy Tải lại" nếu có giao dịch `date < C`, hoặc thiếu/thừa/sửa dòng `open` so với DB.
- Máy có thay đổi chưa gửi nhận 409 vì base cũ, đi theo luồng 409 hiện có (giữ bản nháp, hỏi Tải lại). Đơn đang soạn giữ nguyên; giao dịch chưa gửi mất như mọi lần 409 hiện nay.

## 5. Hoàn tác
- Dừng `vn.kho.server` → đưa `backup-…-truoc-chot-<C>.db` về làm `app.db` theo quy trình khôi phục trong `docs/deploy.md` → khởi động lại → mọi máy bấm Tải lại.
- Backup mang `close_cutoff` cũ nên luật Bảo vệ tự về như trước. File `luu-tru` để lại cũng không sao.

## 6. Test và phá thử
- Server: dryRun không ghi gì; gài lỗi ở từng bước 2–4 thì DB và thư mục data không đổi; 409 khi base sai, 403 khi không phải owner; bất biến tồn = nhập − bán; doanh thu/giá vốn/nhập theo tháng trước = sau (lưu trữ + còn giữ); `products`/`prescriptions` không đổi; luật Bảo vệ chặn được cả X-Force; chốt 2 lần thì summary cộng dồn; bảng Tết đúng.
- Client: dòng `open` không hiện ở Lịch sử, Nhập tháng, chấm chưa đọc; không sửa được; Thống kê cộng summary.
- Phá thử (mỗi lỗi phải bị test bắt): `<=` thay `<`; sanitize làm rơi cờ `open`; gỡ luật Bảo vệ; quên tăng `updatedAt`; ghi file lưu trữ sau commit.
- Auditor Opus soi: endpoint, luật Bảo vệ, `validateState`/`sanitize`, Thống kê.

## 7. App Mac và thứ tự triển khai
- App Mac cần: giữ cờ `open`; ẩn dòng `open` ở Lịch sử, Nhập tháng, chưa đọc và chặn sửa/xóa; cộng `closed.months` vào Thống kê; hiểu lỗi 409 "Sổ đã chốt".
- Thứ tự: (1) hub + web có cờ `open`, luật Bảo vệ, summary, nút chốt còn ẩn; (2) cập nhật app Mac; (3) mở nút chốt.
- App Mac cũ làm rơi cờ thì PUT bị chặn: dữ liệu không hỏng, chỉ chưa ghi được tới khi cập nhật.

## 8. Khối lượng ước tính
- Server ~150 dòng (hàm thuần `closePlan(state, C)` dùng chung cho dryRun và chạy thật); client ~100 dòng; test ~250 dòng.
- Chỗ rút gọn: dùng lại `snapshotBeforeForce` (thêm tham số tên file) và luồng 409 sẵn có; không cần `writeState`.

## Điểm mở
1. Đối chiếu bảng Tết.
2. Ô "Năm" ở thanh bên tính theo năm sổ âm (đề xuất: có).
3. Có bắt mọi máy đồng bộ xong mới cho chốt không (đề xuất: không, luật Bảo vệ đủ an toàn).
4. Đổi nhãn "Đã bán" cho rõ phạm vi 2 năm sổ.
5. Dòng `open` có hiện mờ trong Lịch sử nhập không (đề xuất: ẩn).
