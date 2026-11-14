# Lỗi do reviewer báo: bằng chứng, đã xử lý, không xử lý, lý do

Mốc: 14/11/2026, HEAD `206be66` (phiên bản 2.17.6; commit này chưa triển khai). Số dòng `file:dòng` lấy ở mốc `46ddde5` trừ khi ghi khác, có thể lệch về sau.

Nguồn: báo cáo ngoài 12/11 (2.15.20); báo cáo ngoài 14/11 (HEAD 2.17.1, 8 mục); báo cáo 2.17.1 (`fba0826`); soi của Auditor nội bộ; báo cáo cũ `reports-claude/` (2.8.x).

**Cách dùng:** tìm lỗi ở đây trước khi báo. Đã có kết luận thì chỉ báo lại khi có bằng chứng mới (tái hiện được) hoặc điều kiện "xét lại" đã xảy ra.

**Bối cảnh cần để đọc bằng chứng**
- Tiền lưu bằng đồng nguyên (`moneyUnit: "dong"`); ô nhập là nghìn đồng, `kToDong`/`kInput` đổi ở biên; `checkLimits('money')` nhận đồng.
- Đồng bộ theo snapshot: `X-Base-Updated` sai thì server trả 409/428, không tự ghi đè.
- Toàn bộ client nằm trong `src/page.js` (nhúng inline, không build). Server `server.js` (Express + better-sqlite3), test server/auth chỉ chạy trong Docker.
- Đơn bán lẻ chỉ 1 vị không có `oid` (chủ ý, ghi trong CHANGELOG).

---

## 1. Đã xử lý

| Mã | Nguồn | Lỗi | Bằng chứng | Bản sửa | Ghi chú |
|---|---|---|---|---|---|
| W1 | báo cáo 2.17.1 | Bán lẻ thành tiền 0 vẫn lưu, vẫn trừ tồn | `page.js:1157` `num('')` = 0; `:2338,:2353` `commitRetailRow` không phân biệt ô trống; `:2375` `noteSave` và `:2639` `saveRetail` chỉ chặn `< 0`; `server.js:279` chấp nhận `total >= 0` | `206be66`: chặn thành tiền trống/0 (kiểm theo số đồng) ở `commitRetailRow`, `noteSave`, `saveRetail`, `saveTxEdit` (BAN lẻ); thêm `confirmBelowImport` hỏi xác nhận khi giá/kg ≤ giá nhập gần nhất | Auditor bắt thêm `saveTxEdit` (còn lưu 0) và kiểm `m>0` thay vì `kToDong(m)>0`; đã sửa. Test: client 340 (có phá thử). Server vẫn chấp nhận `total = 0` (xem mục 3) |
| W3 | báo cáo 2.17.1 | 409 giả khi PUT đã ghi nhưng phản hồi bị mất | `server.js:404-408` mỗi lần ghi đóng dấu `Date.now()`; `:561` chỉ so `current > baseNum`; `page.js:4356` gửi `X-Base-Updated: cloudBase`; `:4372-4375` mọi 409 mở hộp xung đột | `206be66`: client gửi `X-Op-Id` (giữ nguyên khi thử lại cùng nội dung, đổi khi nội dung đổi); server lưu `last_op_id`/`last_op_updated_at` trong `app_meta` cùng transaction, op trùng lần ghi gần nhất thì trả `success` + `updatedAt` cũ, không ghi lại | Client cũ không gửi header: hành vi cũ. Test: server 39, auth 45, client 340. Không làm nhánh "409 có `updatedAt` trùng của mình thì coi thành công": `sent` lấy sau `touch()` còn server dùng `Date.now()` riêng nên không bao giờ bằng. Hạn chế: xem mục 3 |
| E2 | ngoài 14/11 (mục 2) | Server không kiểm `moneyUnit` | `server.js:238-239` (trước sửa) | 2.17.4 `f5b4b5d`: 400 khi `moneyUnit` ≠ `dong` | Không có luồng thật gửi số nghìn |
| E3 | ngoài 14/11 (mục 3) | `inRange`/`isNonNegNumber` nhận boolean, chuỗi rỗng, `0x10` | `page.js:1180-1181`, `server.js:205-215` | 2.17.4 `f5b4b5d`; `thang` ở 2.17.5 `263bd02` | Cùng luật `isNumLike` hai phía; hậu quả báo cáo mô tả có chỗ sai |
| E5 | ngoài 14/11 (mục 5) | `delOrder` so `oid` bằng `===` | `page.js` `delOrder` | 2.17.4 `f5b4b5d` | `oid` luôn là chuỗi ở mọi đường; sửa cho nhất quán, không có lỗi thật |
| E8d | ngoài 14/11 (mục 8) | Chú thích `checkLimits('money')` sai | chú thích tại chỗ gọi | 2.17.4 `f5b4b5d` | Giá trị truyền vào là đồng |
| E10 | ngoài 14/11 | File rác `tests/client.test.mjs;C` | thư mục `tests/` | 2.17.4 `f5b4b5d`: xóa; `.dockerignore` thêm `tests/*;*` | |
| R1 | ngoài 12/11 (2.15.20) | Xóa đơn nhập 2 dòng cùng vị làm tồn âm; mở đơn không còn tồn tại; `saveLocal` ghi cờ chưa đồng bộ; log cổng sai | xem CHANGELOG 2.15.20 | 2.15.20 `bd47e4b`, `788f2f3`: `delOrder` cộng dồn qty NHAP theo vị trước khi kiểm tồn; `openOrder` chặn đơn không còn; `saveLocal` ghi KEY/DIRTY/BASE độc lập; log cổng sửa | Chưa ghép số BUG-01…04 của báo cáo với từng sửa (mục 4) |
| A1 | Auditor 2.15.20 | Bản sửa đầu `saveLocal` ghi BASE mới khi ghi KEY lỗi | `saveLocal` | 2.15.20 `788f2f3`: không ghi BASE khi KEY lỗi | Giữ base cũ để server trả 409, tránh đè lặng lẽ |
| A2 | Auditor 2.16.0 | CSP `default-src 'none'` chặn manifest và service worker; lỗi bị `.catch` nuốt | CSP của `/` | 2.16.0 `2627fb6`: thêm `manifest-src`, `worker-src 'self'` | Test tĩnh không bắt được; bắt bằng Edge headless |
| A3 | duyệt 2.17.0 | Logo âm dương còn là `themeBtn`, menu theme thành nút chết | `page.js` | 2.17.0 `428be32`, `9bc4150`: id `brandLogo`, bỏ menu Sáng/Tối | |
| A4 | duyệt 2.17.0 | Trang đăng nhập (`auth.js`) còn nhánh dark | `auth.js` | 2.17.0 `c3ef03a` | Máy bật dark thấy đăng nhập tối rồi vào app sáng |
| A5 | duyệt 2.17.0 | Tương phản chữ muted dưới kính header/thanh chân < 4,5 | CSS token `--glass-bar` | `428be32`, `fba0826`: alpha .95 | Đo ở điểm xấu nhất của gradient |
| A6 | Auditor 2.17.4 | Hàng Tổng (tfoot) trong `.note__pending` làm `compactFit` đo `pendH` = 40, tờ ghi gọn còn 1 dòng | `page.js` `compactFit` | 2.17.5 `880e699`: hàm `pendEntryH` không tính tfoot | Lỗi do `f9f051d` |
| A7 | Auditor 2.17.4 | `thang: true` vẫn qua ở `server.js` | `server.js` | 2.17.5 `263bd02`: dùng `isNumLike` | |
| A8 | Auditor 2.17.4 | Thiếu test thân PUT của client có `moneyUnit: 'dong'` | `tests/client.test.mjs` | 2.17.5 `880e699`: thêm test | |
| — | Auditor W1+W3 (14/11) | Ca test W3 "đổi sau khi thành công" vẫn xanh khi xóa `pendingOpSig = ''` | `page.js` ~4399 | `206be66`: sửa ca test; thêm test `noteSave`, `commitRetailRow` (0,0004), `saveTxEdit` | Phá thử từng sửa đều làm test rớt |

---

## 2. Không xử lý (có lý do và điều kiện xét lại)

| Mã | Nguồn | Lỗi báo | Bằng chứng / tái hiện | Lý do không xử lý | Xét lại khi |
|---|---|---|---|---|---|
| W2 | báo cáo 2.17.1 | Nhãn "Giá bán" nhưng ô lưu thành tiền cả dòng | Nhãn: `page.js:662,676,2169,2173,2291`; ô hiển thị `fmtMoney(it.amount)` `:2308`; `price = amount / kg`, `total = amount` `:2665-2666`; lịch sử ghi "Thành tiền" `:912,946,2993,3279` | Quyết định của người dùng 14/11: chỉ là lỗi câu chữ, bỏ qua | Có nhập nhầm giá/kg thành thành tiền gây sai dữ liệu |
| E4 | ngoài 14/11 (mục 4) | `allocateRemedyByCost` khi tổng khách trả < tổng vốn | Tái hiện: 999 chia vốn [300,300,400] ra [299,299,401] | Hàm đúng như mô tả nhưng cả hai nơi gọi đã chặn trước: `balanceRemedyMoney` (`page.js` ~2396-2403, `if (g0 < totalCost) return null`) và `applyRemedyBalance` (~4058-4064, `if (g0 < totalCost) return false`) | Thêm nơi gọi thứ ba |
| E6 | ngoài 14/11 (mục 6) | `txIndex` cache có thể cũ | `renderAll` luôn gọi `indexTx`; chỉ dùng cho bản ghi thiếu `ts` | Chưa có đường nào bỏ qua `renderAll` | Thêm đường sửa giao dịch bỏ qua `renderAll` |
| E7 | ngoài 14/11 (mục 7) | Đơn bán lẻ 1 vị không có `oid` | CHANGELOG | Chủ ý: hiển thị như dòng giao dịch thường | — |
| E8a | ngoài 14/11 (mục 8) | `snapshotBeforeForce` trùng tên file cùng mili-giây | `server.js` | `VACUUM INTO` chạy lâu hơn 1 ms nên không trùng | Thấy trùng tên file thật |
| E8b | ngoài 14/11 (mục 8) | `VACUUM` chặn phản hồi | `runDailyBackup` | Một lần/ngày, DB ~1 MB, phải chụp trước khi ghi | DB lớn hơn nhiều hoặc backup > vài giây |
| E8c | ngoài 14/11 (mục 8) | `migrateMoneyToDong` lỗi thì app dừng | `server.js` | Hành vi cố ý: nuốt lỗi sẽ phục vụ số nghìn như số đồng | — |
| E9 | ngoài 14/11 | Chia nhỏ `page.js` | Test client tách script inline theo mẫu `var doc = document;`; CSP `script-src 'unsafe-inline'`; SSR `%%BOOT%%` | Repo không có build step; chia nhỏ phải đổi cách nhúng, CSP và test | Có build step |
| R2 | ngoài 12/11 (BUG-05) | Trần ~22k giao dịch / 4 MB | Hiện 163 vị, 723 giao dịch, 17 đơn | Còn cách xa trần | Vượt ~10k giao dịch |
| R3 | ngoài 12/11 (BUG-06…12) | Playwright; CSP/HSTS thêm; bỏ `err.message`; tải backup; bàn phím; IP trong `Caddyfile`; confirm/đơn vị biểu đồ | — | Chưa gây sai dữ liệu; app chạy trong LAN, một người dùng | App ra ngoài LAN hoặc nhiều người dùng. Tải backup: xem W6 mục 3 |
| — | CLAUDE.md | Không có điều chỉnh tồn kho vật lý | — | Giới hạn thiết kế; đối soát qua `reconcileList` | — |
| — | CLAUDE.md | `O(T×P)` khi tìm sản phẩm; poll 15 giây | — | Chưa đáng kể ở ~720 giao dịch | > 10k giao dịch |

---

## 3. Chưa xử lý (đã ghi nhận, chờ làm)

| Mã | Nguồn | Lỗi | Bằng chứng | Ghi chú |
|---|---|---|---|---|
| W4 | báo cáo 2.17.1 | `fetch` không có timeout/`AbortController`; mạng treo thì `pushing`/`refreshing` giữ nguyên | `page.js:4279-4288` (`apiFetch` không có `signal`); cờ `:4352,:4374,:4416,:4468` | Đề xuất timeout 15 giây, phân biệt `AbortError` |
| W5 = E1 | báo cáo 2.17.1; ngoài 14/11 (mục 1) | `tsFromId` trả 0 với hầu hết id `uid()`; giao dịch cũ thiếu `ts` rơi về `date + index` | `page.js:1535-1540` regex `/(\d{10,13})$/`; `uid()` `:1515` tạo `prefix_<base36(ms)><5 ký tự>`; tái hiện: 200k id `uid()` đều ra 0; `tools/kiem-tra-ngay.mjs:35-42` parse đúng cả hai định dạng | `ts` có từ 1.4.0 (4/11/2026), chỉ bản ghi cũ hơn bị ảnh hưởng. Sửa chạm `lastImport`/giá nhập tham chiếu (hai lần nhập cùng ngày thiếu `ts` có thể đổi giá tham chiếu), cần test giá vốn |
| W6 | báo cáo 2.17.1; ngoài 12/11 (BUG-09) | (a) `downloadBackup` trả `true` và báo "Đã tải" kể cả khi trình duyệt chặn tải, `BAK_LAST` vẫn đóng dấu; (b) client chặn file > 4 MB nhưng server nhận tối đa 4 MB sau nén | `page.js:4529-4555`, `:4673` (`file.size > 4 * 1024 * 1024`); `server.js:40` (`MAX_BODY`), `:508` | |
| W7 | báo cáo 2.17.1 | `oname` không có `oid`: client `sanitize` bỏ, server giữ | `page.js:1716` (`if (oid && oname && oname !== oid)`); `server.js:288-292` | Hiển thị khác nhau tùy đường đọc |
| W8 | báo cáo 2.17.1 | Chuẩn hóa tên sản phẩm khác nhau: client gộp khoảng trắng + NFC, server chỉ `trim().toLowerCase()` | `page.js:1660`; `server.js:260` | Có thể bỏ oan vị ở client hoặc server trả 400. Liên quan `nameKey` ở client (~dòng 1760) |
| W9 | báo cáo 2.17.1 | CI không có lint; Node local (26) ≠ Node CI/Docker (22); `better-sqlite3` không build trên Node 26 | `.github/workflows/ci.yml` chỉ có `test-client`, `test-server`; `Dockerfile` dùng `node:22-bookworm-slim` | |
| W10 | báo cáo 2.17.1 | Thiếu test cho W4–W8 | `tests/client.test.mjs`, `tests/server.test.mjs` | Test cho W1 và W3 đã có |
| W1b | tự ghi nhận | Server vẫn chấp nhận giao dịch BAN có `total = 0` (dữ liệu cũ, client khác) | `server.js:279` (`total >= 0`) | Chỉ chặn ở client; có thể thêm cảnh báo ở server |
| W3b | Auditor W1+W3 | (a) Tải lại tab giữa lúc gửi thì mất `opId`, 409 giả vẫn có thể xảy ra; (b) phản hồi cho PUT trùng op không kèm `warnings`/`stockDrift` của phản hồi gốc; (c) PUT trùng op trả 200 kể cả khi thiếu `X-Base-Updated` | `server.js` nhánh op trùng ~dòng 562-565 | (b), (c) vô hại theo Auditor |
| G17 | CLAUDE.md | Sao lưu tự động có thể đè lên thông báo đang hiện | — | |
| — | CLAUDE.md | `saveRetail` không kiểm `cost`; xóa/giảm đơn bán làm tồn vượt trần; sửa gram đơn thuốc chén làm đơn giá vượt trần: server có thể từ chối số liệu ngoài thực tế | — | |
| — | CLAUDE.md | `applyRemedyBalance`/`allocateRemedyByCost` chưa kiểm trần đơn giá khi kg rất nhỏ | — | |
| — | CLAUDE.md | Không xóa tờ đơn khi lưu thất bại ("Chưa lưu được") | — | Đổi luồng đồng bộ, rủi ro hơn; chờ gặp lỗi thật |
| — | CLAUDE.md | Gợi ý đơn vị trong ô số lượng dùng "l" cho lạng | — | Chỉ ở gợi ý |
| — | CLAUDE.md | Vòng kiểm trong `saveNhap` (~4019); ca test A1 chưa kiểm `fetch` được gọi | — | Hoãn từ 2.15.21 |
| — | CLAUDE.md | `auth.db` không được sao lưu; không có thông báo khi sao lưu hỏng | — | Mất `auth.db` thì thiết lập lại thiết bị, dữ liệu kho không mất |
| — | CLAUDE.md | PWA: icon chưa xem trên iPhone; `fetch` handler rỗng trong `sw.js`; FPS cuộn bảng chưa đo trên iPhone | — | |
| R1b | ngoài 12/11 | Chưa ghép BUG-01…04 với từng sửa ở 2.15.20 | CHANGELOG 2.15.20; `bd47e4b`, `788f2f3` | Chỉ thiếu bảng đối chiếu |

---

## 4. Cách thêm mục mới

Thêm một dòng vào bảng phù hợp: mã, nguồn, lỗi, bằng chứng `file:dòng` hoặc cách tái hiện, trạng thái (kèm phiên bản và hash nếu đã sửa), lý do nếu không xử lý kèm điều kiện xét lại. Kiểm hash bằng `git log` trước khi ghi. Không dán mã dài, không ghi dữ liệu thật hay đường dẫn ngoài repo.
