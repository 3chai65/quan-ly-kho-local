# Tổng hợp lỗi do reviewer báo: đã sửa, không sửa, lý do

Cập nhật: 14/11/2026, phiên bản 2.17.5 (HEAD b247a5a). Nguồn: báo cáo ngoài 12/11/2026 (2.15.20), báo cáo ngoài 14/11/2026 (HEAD 2.17.1, 8 mục), các lần soi của Auditor nội bộ (Opus), và các báo cáo cũ ở `reports-claude/` (2.8.x, phần lớn đã xử lý).

**Cách dùng:** trước khi báo một lỗi, tìm ở đây. Nếu đã có kết luận thì chỉ báo lại khi có BẰNG CHỨNG MỚI (tái hiện được, hoặc điều kiện "xét lại" ở mục Không sửa đã xảy ra). Mỗi dòng có tham chiếu (commit, phiên bản, file:dòng ở thời điểm ghi, số dòng có thể lệch về sau).

## 1. Bảng tổng hợp

| Mã | Nguồn | Vấn đề | Kết luận | Trạng thái | Lý do ngắn |
|---|---|---|---|---|---|
| E1 | ngoài 14/11 (mục 1) | `tsFromId` luôn trả 0 với id `uid()` | ĐÚNG | KHÔNG SỬA | Ảnh hưởng nhỏ, chạm `lastImport`/giá nhập tham chiếu (xem 3.1) |
| E2 | ngoài 14/11 (mục 2) | Server không kiểm `moneyUnit` | MỘT PHẦN | ĐÃ SỬA 2.17.4 (f5b4b5d) | Không có luồng thật gửi số nghìn; chặn bằng 400 cho chắc |
| E3 | ngoài 14/11 (mục 3) | `inRange`/`isNonNegNumber` nhận boolean, chuỗi rỗng, `0x10` | ĐÚNG (hậu quả mô tả sai một phần) | ĐÃ SỬA 2.17.4 (f5b4b5d); `thang` ở 2.17.5 (263bd02) | Cùng luật `isNumLike` hai phía |
| E4 | ngoài 14/11 (mục 4) | `allocateRemedyByCost` khi tổng khách trả < tổng vốn | ĐÚNG về hàm, không phải lỗi thật | KHÔNG SỬA | Cả hai nơi gọi đã kiểm trước (xem 3.2) |
| E5 | ngoài 14/11 (mục 5) | `delOrder` so `oid` bằng `===` | SAI về hậu quả | ĐÃ SỬA 2.17.4 (f5b4b5d) cho nhất quán | `oid` luôn là chuỗi ở mọi đường |
| E6 | ngoài 14/11 (mục 6) | `txIndex` cache có thể cũ | ĐIỂM DỄ VỠ, chưa lỗi | KHÔNG SỬA | `renderAll` luôn gọi `indexTx` (xem 3.3) |
| E7 | ngoài 14/11 (mục 7) | Đơn bán lẻ 1 vị không có `oid` | CHỦ Ý | KHÔNG SỬA | CHANGELOG ghi rõ hiển thị như dòng giao dịch thường |
| E8a | ngoài 14/11 (mục 8) | `snapshotBeforeForce` cùng mili-giây | KHÔNG XẢY RA | KHÔNG SỬA | `VACUUM INTO` chạy lâu hơn 1 ms |
| E8b | ngoài 14/11 (mục 8) | `VACUUM` chặn phản hồi | CHỦ Ý | KHÔNG SỬA | Một lần/ngày, DB ~1 MB, phải chụp trước khi ghi |
| E8c | ngoài 14/11 (mục 8) | `migrateMoneyToDong` lỗi thì dừng app | ĐÚNG và AN TOÀN | KHÔNG SỬA | Nuốt lỗi sẽ phục vụ số nghìn như số đồng |
| E8d | ngoài 14/11 (mục 8) | Chú thích `checkLimits('money')` sai | NIT | ĐÃ SỬA 2.17.4 (f5b4b5d) | Giá trị truyền vào là đồng |
| E9 | ngoài 14/11 | Gợi ý "chia nhỏ `page.js`" | KHÔNG LÀM | KHÔNG SỬA | Xem 3.4 |
| E10 | ngoài 14/11 | File rác `tests/client.test.mjs;C` | ĐÚNG | ĐÃ SỬA 2.17.4 (f5b4b5d) | Xóa; `.dockerignore` thêm `tests/*;*` |
| A1 | Auditor 2.15.20 | Bản sửa đầu `saveLocal` ghi BASE mới khi ghi KEY lỗi | ĐÚNG | ĐÃ SỬA 2.15.20 (788f2f3) | Không ghi BASE khi KEY lỗi để máy chủ trả 409, tránh đè lặng lẽ |
| A2 | Auditor 2.16.0 | CSP `default-src 'none'` chặn manifest và service worker, lỗi bị `.catch` nuốt | ĐÚNG | ĐÃ SỬA 2.16.0 (2627fb6) | Thêm `manifest-src`, `worker-src 'self'`; test tĩnh không bắt được, bắt bằng Edge |
| A3 | duyệt vòng 2 (2.17.0) | Logo âm dương còn là `themeBtn`, menu theme thành nút chết | ĐÚNG | ĐÃ SỬA 2.17.0 (428be32, 9bc4150) | Đổi id `brandLogo`, bỏ menu Sáng/Tối |
| A4 | duyệt vòng 2 (2.17.0) | Trang đăng nhập (`auth.js`) còn nhánh dark | ĐÚNG | ĐÃ SỬA 2.17.0 (c3ef03a) | Máy bật dark thấy đăng nhập tối rồi vào app sáng |
| A5 | duyệt vòng 2 (2.17.0) | Tương phản chữ muted dưới kính header/thanh chân < 4,5 | ĐÚNG | ĐÃ SỬA (428be32, fba0826) | Alpha kính `--glass-bar` .95; đo ở điểm xấu nhất của gradient |
| A6 | Auditor 2.17.4 | Hàng Tổng (tfoot) trong `.note__pending` làm `compactFit` đo `pendH`=40, tờ ghi gọn còn 1 dòng | ĐÚNG | ĐÃ SỬA 2.17.5 (880e699) | Hàm `pendEntryH` không tính tfoot; lỗi do f9f051d |
| A7 | Auditor 2.17.4 | `thang: true` vẫn qua ở `server.js` | NIT ĐÚNG | ĐÃ SỬA 2.17.5 (263bd02) | Dùng `isNumLike` như các trường khác |
| A8 | Auditor 2.17.4 | Thiếu test thân PUT của client có `moneyUnit: 'dong'` | NIT ĐÚNG | ĐÃ SỬA 2.17.5 (880e699) | Test mới |
| R1 | ngoài 12/11 (2.15.20) | Xóa đơn nhập 2 dòng cùng vị làm tồn âm; mở đơn không còn tồn tại; `saveLocal` ghi cờ chưa đồng bộ; log cổng | ĐÚNG | ĐÃ SỬA 2.15.20 (bd47e4b, 788f2f3) | Chưa ghép được số BUG-01…04 với từng sửa, xem mục 4 |
| R2 | ngoài 12/11 | BUG-05 trần ~22k giao dịch | CHƯA LÀM | KHÔNG SỬA | Hiện ~720 giao dịch; xét lại khi vượt ~10k |
| R3 | ngoài 12/11 | BUG-06 Playwright, 07 CSP/HSTS, 08 `err.message`, 09 tải backup, 10 bàn phím, 11 IP trong Caddyfile, 12 confirm/đơn vị biểu đồ | CHƯA LÀM | KHÔNG SỬA | Đánh giá không cần cho app một người dùng trong LAN (xem 3.5) |

## 2. Đã sửa (tóm tắt theo phiên bản)

- 2.15.20 (bd47e4b, 788f2f3): `delOrder` cộng dồn số lượng NHẬP theo vị trước khi kiểm tồn âm; `openOrder` chặn đơn không còn; `saveLocal` ghi KEY/DIRTY/BASE độc lập, khi ghi KEY lỗi thì KHÔNG ghi BASE (giữ base cũ để máy chủ trả 409); dòng log cổng nói đúng (0.0.0.0 trong container, compose chỉ mở 127.0.0.1). Bài học: bản sửa đầu của worker bị Auditor bắt (A1).
- 2.15.21 (604904f và các commit cùng đợt): các mục CL-A1 đến CL-A5 của CHANGELOG 2.15.21 (hẹn gửi lại không giãn khi bận, `delOrder` kiểm trước hỏi sau, focus `saveTxEdit`, "mới nhất" theo ngày rồi giờ ghi, cùng cách tính giá vốn `lastImport`) và dọn mã chết.
- 2.16.0 (2627fb6): CSP của `/` thêm `manifest-src` và `worker-src 'self'`.
- 2.17.0 đến 2.17.1: một theme sáng, logo `brandLogo`, trang đăng nhập chỉ sáng, kính nhẹ, nền gradient ấm, alpha header/thanh chân .95 (9bc4150, d9b9132, 428be32, c3ef03a, fba0826).
- 2.17.2 đến 2.17.3: Thuốc chén gọn chân, hàng Tổng thành tfoot, nhãn "Sửa đơn", "Giá bán"/"Giá nhập" (de7577e, c9b12fc).
- 2.17.4 (f9f051d, f5b4b5d): `moneyUnit` bắt buộc là `dong` (400, không tự nhân 1000); `isNumLike` hai phía; `delOrder` so chuỗi; chú thích `checkLimits`; xóa thư mục rác; tfoot dưới dòng nhập, cột tên rộng hơn trên điện thoại.
- 2.17.5 (880e699, 263bd02): `pendEntryH` (tờ ghi gọn đủ 2 dòng, avail 216 ở vvH 357, bằng c9b12fc); `thang` dùng `isNumLike`; test thân PUT có `moneyUnit`.

## 3. Không sửa (kèm lý do và điều kiện xét lại)

3.1 `tsFromId` (E1): đúng và tái hiện được (200k id `uid()` đều ra 0), nhưng `ts` có từ 1.4.0 (4/11/2026); chỉ bản ghi cũ hơn thiếu giờ, server trả theo rowid nên thứ tự gần đúng. Không sửa vì ưu tiên thấp và chạm `lastImport`/giá nhập tham chiếu (hai lần nhập cùng ngày thiếu `ts` có thể đổi giá tham chiếu). Xét lại khi có sai thứ tự thật; nếu sửa phải theo luật ở `tools/kiem-tra-ngay.mjs` (dòng 35-42) kèm test giá vốn.

3.2 `allocateRemedyByCost` (E4): hàm đúng như mô tả (tái hiện: 999 chia cho vốn [300,300,400] ra [299,299,401], tức dòng cuối nhận phần âm), nhưng cả hai nơi gọi đã kiểm trước khi gọi (số dòng ở HEAD 2.17.5, đã mở mã xác nhận): `balanceRemedyMoney` (`page.js` ~2396-2403) có `if (g0 < totalCost) return null;` ngay trước lời gọi ở ~2403, và `applyRemedyBalance` (~4058-4064) có `if (g0 < totalCost) return false;` ngay trước lời gọi ở ~4064. Không phải lỗi thật. Xét lại nếu thêm nơi gọi thứ ba.

3.3 `txIndex` (E6): `renderAll` luôn gọi `indexTx`, chỉ dùng cho bản ghi thiếu `ts`. Dễ vỡ nếu ai thêm đường sửa giao dịch bỏ qua `renderAll`; hiện không có lỗi. Xét lại khi thêm đường đó.

3.4 Chia nhỏ `page.js` (E9): test client tách script inline theo mẫu `var doc = document;`, CSP (`script-src 'unsafe-inline'`) và SSR `%%BOOT%%` gắn vào cách nhúng; lợi ít cho app một người dùng; repo theo nguyên tắc không build step.

3.5 Báo cáo ngoài 12/11 chưa làm (R2, R3): trần ~22k giao dịch (hiện ~720), Playwright, CSP/HSTS thêm, bỏ `err.message`, tải backup, bàn phím, IP trong `Caddyfile` (mạng riêng LAN), confirm/đơn vị biểu đồ. Lý do: không có lỗi thật ảnh hưởng dữ liệu; xét lại nếu app ra ngoài LAN hoặc có nhiều người dùng.

3.6 Chủ ý (E7, E8a, E8b, E8c): xem bảng mục 1. Riêng E8c: app dừng khi `migrateMoneyToDong` lỗi là hành vi đúng, đừng đổi thành bỏ qua lỗi.

3.7 Điểm số "9 đến 9,5/10" trong báo cáo ngoài là cảm tính; mục 2 phóng đại, mục 3 và 5 sai hậu quả (đã đối chiếu mã).

## 4. Đã biết, chưa sửa (từ CLAUDE.md, ghi chú bàn giao)

- Sao lưu tự động có thể đè lên thông báo đang hiện (G17).
- Ba đường ghi có thể bị máy chủ từ chối số liệu ngoài thực tế: `saveRetail` không kiểm `cost`; xóa/giảm đơn bán làm tồn vượt trần; sửa gram đơn thuốc chén làm đơn giá vượt trần.
- `applyRemedyBalance`/`allocateRemedyByCost` chưa kiểm trần đơn giá khi kg rất nhỏ.
- Gợi ý đơn vị trong ô số lượng dùng "l" cho lạng (chỉ ở gợi ý); phần còn lại ghi "lạng".
- Không xóa tờ đơn khi lưu thất bại ("Chưa lưu được"); đổi luồng đồng bộ rủi ro hơn, chờ gặp lỗi thật.
- `nameKey` ở client (~dòng 1760), vòng kiểm trong `saveNhap` (~4019), ca test A1 chưa kiểm `fetch` được gọi (hoãn từ 2.15.21).
- `auth.db` KHÔNG được sao lưu (mất thì thiết lập lại thiết bị, dữ liệu kho không mất); không có thông báo khi sao lưu hỏng.
- PWA: icon chưa ai xem trên iPhone; `fetch` handler rỗng trong `sw.js` giữ nguyên (cảnh báo no-op của Chrome chưa đo); FPS cuộn bảng chưa đo trên iPhone thật (Edge có GPU đo ~200 callback/s, là trần của máy).
- Báo cáo ngoài 12/11: ghép số BUG-01 đến BUG-04 với từng sửa ở 2.15.20 chưa được ghi rõ trong tài liệu (chỉ có CHANGELOG 2.15.20 và commit bd47e4b, 788f2f3); BUG-05 đến BUG-12 nằm ở mục 3.5.
- Mục "Dockerfile còn công cụ build và chạy bằng root" trong ghi chú bàn giao cũ đã xử lý ở 2.15.14 (09c2198: hai giai đoạn, `USER node`), không còn áp dụng.
- Báo cáo cũ ở `reports-claude/` (2.8.x): các mục A đến J đã xử lý; mục còn lại về `mergeDo`, `latestOnly` thuộc chức năng đã bỏ ở 2.15.0 nên không còn áp dụng.

## 5. Quy ước thiết kế chủ ý hay bị hiểu nhầm

- Tiền lưu bằng ĐỒNG nguyên (`moneyUnit: "dong"`); ô nhập là NGHÌN đồng, `kToDong`/`kInput` đổi ở biên. `checkLimits('money')` nhận đồng.
- Đồng bộ theo snapshot: `X-Base-Updated` sai thì máy chủ trả 409/428, KHÔNG tự ghi đè; client hiện hộp "Lấy bản mới nhất" hoặc "Giữ bản máy này". Không mở hai phiên ghi song song.
- Đơn bán lẻ chỉ có 1 vị không có `oid`, hiển thị như dòng giao dịch thường; đơn thuốc chén tính 1 đơn.
- Backup ngày dùng `VACUUM INTO` đồng bộ, chụp trước lần ghi đầu tiên trong ngày; `snapshotBeforeForce` chụp trước khi ép ghi đè.
- Server không tự sửa số liệu sai: từ chối bằng 400 và client hiện "Chưa lưu được: lý do".
- `data/` không bao giờ bị đụng bởi công cụ phát triển; `auth.db` không nằm trong sao lưu.
- Mọi thứ client nằm trong một file `src/page.js` nhúng inline, không build step; tài nguyên ngoài bị CSP chặn.
- Một theme sáng duy nhất (từ 2.17.0), không công tắc dark.
- Tổng tiền là hàng cuối bảng (tfoot) ở Bán lẻ, Nhập hàng, Thuốc chén, thẳng cột tiền; chân cố định trên điện thoại chỉ còn nút.

## 6. Cách thêm mục mới

Thêm một dòng vào bảng mục 1 (mã mới, nguồn, vấn đề, kết luận ĐÚNG/SAI/MỘT PHẦN/CHỦ Ý, trạng thái ĐÃ SỬA vX.Y.Z kèm hash hoặc KHÔNG SỬA, lý do một dòng); nếu KHÔNG SỬA thì thêm đoạn ở mục 3 có điều kiện xét lại; nếu chưa sửa nhưng biết thì thêm gạch đầu dòng ở mục 4. Kiểm hash bằng `git log` trước khi ghi; không dán mã dài, không ghi dữ liệu thật hay đường dẫn ngoài repo.
