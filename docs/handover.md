# Ghi chú bàn giao (cập nhật mỗi lần triển khai; xóa dòng đã hết đúng)

## Hiện tại
- Hub: **2.38.25** (thẻ `v2.38.25`, commit c5b50bb, 24/11/2026). Chi tiết: `CHANGELOG.md`. Trước khi triển khai, kiểm hash đường lui trong `~/kho/truoc-khi-bat.txt`.
- 2.38.2–2.38.25: điện thoại (bàn phím iOS/`--vv-top`, ô tên vào dòng nhập, viền mỏng) và desktop/Tauri tối giản (nền trong suốt, chỉ viền `--border`); bỏ kính; bảng Kho tồn/Lịch sử dòng cố định 50px.
- Mac là chuẩn giao diện/nhập liệu; app Mac SwiftUI (repo 3chai65/quan-ly-kho-mac) làm theo bản web desktop làm chuẩn; Mac chỉ dùng Safari; kính đã bỏ (2.38.22). App Mac, Tauri và PWA phải giống nhau tối đa.
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
- Kính: đã bỏ từ 2.38.22 (công tắc "Hiệu ứng kính", `html.glass`, `?glass=`, khóa `kho_glass_v2`, `--blur/--blurb/--glass-bar/--glass-dark`, `--spec/--k3*`). Desktop và điện thoại cùng phong cách tối giản: nền trong suốt, chỉ viền `var(--border)`; focus `--sel-bd`; vô hiệu mờ 50%. Không còn `backdrop-filter` nào có giá trị khác `none`. `--glass` còn là tên cũ của màu nền panel (`.card` gốc, `.stats`, `html.pt .note`).
- Khi lưu bị server từ chối (400/428), client hiện "Chưa lưu được: <lý do>" một lần và giữ nguyên tờ đơn.
- Ô nhập nằm trong `.note__foot` (fixed): không được ẩn thanh khi chính ô đó đang focus (2.38.1).
- App Mac/Tauri mở liên tục nhiều ngày: mọi giá trị "hôm nay" phải tính lại khi mở tab/focus, không chỉ lúc tải trang (2.38.3).
- Gợi ý đơn vị: "l" = lạng (chỉ trong gợi ý). Luật tìm kiếm trọn chữ dùng chung cho gợi ý tên, Kho tồn và Lịch sử.
- Quy tắc thường trực: mỗi bản có đổi giao diện desktop được triển khai thì chụp lại 8 ảnh mẫu desktop HD (1280x720) vào `kho-kenh/anh-mau-desktop/` (ghi đè), commit + push kênh, thêm 1 dòng kênh "Ảnh mẫu cập nhật theo v<x>". Lần gần nhất: v2.38.30.

## Tauri / PWA
- exe nằm ở `C:\Users\Yellows\AppData\Local\QuanLyKho\`; giao diện tải từ hub (hub lùi bản thì giao diện lùi theo). Tắt bằng nút X, không dùng `Stop-Process -Force` (mất cookie thiết bị).
- PWA Edge phải cài từ `https://192.168.2.46`.
- Nút HD/FHD (`div.szpick`) đã khôi phục từ 2.38.4, chỉ hiện khi có `__TAURI__`; Tauri 0.3.1 mở mặc định HD (không phải "bỏ từ 2.31.0").
- `4feffae` là commit của repo quan-ly-kho-mac (app SwiftUI, chỉ trên Mac); không liên quan quan-ly-kho-local, không cần hợp nhất.
- Đơn ghi qua X-Force (ghi đè khi xung đột/khôi phục) không được đánh dấu chưa đọc — chấp nhận.
