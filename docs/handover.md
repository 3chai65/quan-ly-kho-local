# Ghi chú bàn giao (cập nhật mỗi lần triển khai; xóa dòng đã hết đúng)

## Hiện tại
- Windows và Mac: **2.37.2** (thẻ `v2.37.2`, commit ea0f28e, triển khai 21/11/2026). Chi tiết: `CHANGELOG.md`. Trước khi triển khai, kiểm hash đường lui trong `~/kho/truoc-khi-bat.txt`.
- Mac là chuẩn giao diện/nhập liệu; app Mac native, Tauri và PWA phải giống nhau tối đa.
- Test (2.37.2): client 477 ca, server 45, auth 45.
- `migrateMoneyToDong` (server.js) và `truoc-lam-tron-*.json` có chú thích `XÓA SAU 06/12/2026`: xóa khi bản backup cũ nhất còn đơn vị nghìn đã bị xóa (cần chủ đồng ý).

## Chưa thử / chưa làm có chủ ý
- `window.confirm/prompt` (xác nhận, tên đơn) và nút Thoát chưa thử trên Tauri/iPhone thật.
- Chưa làm: Hoàn tác khôi phục, server làm chứng cho sao lưu, ngày phiếu nhập lùi (P2.4), quản lý thiết bị ngay trong app desktop (dùng trang `/auth/devices`).
- Sao lưu tự động phía trình duyệt có thể bị chặn tải mà không báo; có thể đè lên thông báo đang hiện (G17).
- Chưa đo FPS khi có hơn 164 sản phẩm hoặc khi bật Chế độ nguồn điện thấp.

## Lỗ hổng kiểm trần đã biết
`saveRetail` không kiểm `cost`; xóa/giảm đơn bán có thể làm tồn vượt trần; sửa gram đơn thuốc chén có thể làm đơn giá vượt trần; `applyRemedyBalance`/`allocateRemedyByCost` chưa kiểm trần đơn giá khi kg rất nhỏ.

## Giao diện
- Xem thử: sinh trang tĩnh từ `src/page.js` (placeholder như `server.js`, dữ liệu mẫu tự bịa), mở bằng `.claude/launch.json` (cổng 8899), đo bằng `getBoundingClientRect` ở 320/375/800/1300px.
- Kính: từ 2.23.0 mặc định giao diện phẳng mờ, công tắc "Hiệu ứng kính" tắt; `?glass=0` tắt hết. Giữ 4 `backdrop-filter` có chủ ý (FPS iPhone 14 Pro không khác biệt đáng kể).
- Khi lưu bị server từ chối (400/428), client hiện "Chưa lưu được: <lý do>" một lần và giữ nguyên tờ đơn.
- Gợi ý đơn vị: "l" = lạng (chỉ trong gợi ý). Luật tìm kiếm trọn chữ dùng chung cho gợi ý tên, Kho tồn và Lịch sử.

## Tauri / PWA
- exe nằm ở `C:\Users\Yellows\AppData\Local\QuanLyKho\`; giao diện tải từ hub (hub lùi bản thì giao diện lùi theo). Tắt bằng nút X, không dùng `Stop-Process -Force` (mất cookie thiết bị).
- PWA Edge phải cài từ `https://192.168.2.46`.
