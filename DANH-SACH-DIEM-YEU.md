# Danh sách điểm yếu cần khắc phục — quan-ly-kho-local

Mốc đối chiếu: **HEAD 2.17.6 (`46ddde5`), 14/11/2026**.
Nguồn: báo cáo 2.17.1 (`fba0826`), báo cáo ngoài 14/11 (8 mục), `BAO-CAO-REVIEW.md`, và đọc lại mã tại HEAD.

Tệp này chỉ chứa **việc cần làm**. Các mục đã sửa hoặc đã chấp nhận nằm ở cuối để tránh báo lại.

**Cách dùng:** mỗi mục có "Điều kiện đóng". Chỉ đóng khi có test hồi quy đi kèm (trừ mục ghi rõ "chỉ đổi chữ").

---

## 0. Bảng ưu tiên

| ID | Ưu tiên | Việc | Vị trí | Ảnh hưởng | Công |
|---|---|---|---|---|---|
| W1 | P0 | Bán lẻ thành tiền 0 vẫn lưu, vẫn trừ tồn | `src/page.js:2338,2353,2375,2639`; `server.js:279` | Sai dữ liệu tiền/tồn | 0,5 h |
| W2 | P0 | Nhãn "Giá bán" mang nghĩa thành tiền | `src/page.js:662,676,2169,2173,2291` | Nhập sai đơn giá khi kg ≠ 1 | 0,5 h |
| W3 | P0 | 409 giả khi mất phản hồi; không idempotency | `server.js:404-408,561`; `src/page.js:4356,4372-4375` | Mất nháp vô ích, hỏi xung đột sai | 2–4 h |
| W4 | P1 | Không timeout/`AbortController` cho `fetch` | `src/page.js:4279-4288` | Treo im lặng, không tự phục hồi | 1 h |
| W5 | P1 | `tsFromId` không parse id của app | `src/page.js:1535-1540` | Mất giờ thật của dữ liệu cũ | 1 h |
| W6 | P1 | Tải/khôi phục backup báo sai và lệch trần 4 MB | `src/page.js:4529-4555,4673`; `server.js:40,508` | Tưởng đã sao lưu; file hợp lệ bị từ chối | 1 h |
| W7 | P2 | `oname` không `oid` bị client bỏ, server giữ | `src/page.js:1716`; `server.js:288-292` | Mất tên đơn khi khôi phục dữ liệu cũ | 0,5 h |
| W8 | P2 | Chuẩn hóa tên sản phẩm client ≠ server | `src/page.js:1660`; `server.js:260` | 400 oan hoặc bỏ oan vị thuốc | 1 h |
| W9 | P2 | CI không có lint; Node local ≠ Node CI | `.github/workflows/ci.yml`; `Dockerfile` | Lỗi cú pháp lọt qua review | 1 h |
| W10 | P2 | Thiếu test cho các lỗi trên | `tests/client.test.mjs`, `tests/server.test.mjs` | Tái phát sau này | 2 h |

Thứ tự đề nghị: **W1 → W2 → W3 → W10 (phần W1/W2) → W4 → W5 → W6 → W7 → W8 → W9**.

---

## P0 — Sai dữ liệu tiền và tồn

### W1. Bán lẻ thành tiền 0 vẫn lưu, vẫn trừ tồn

**Hiện tượng.** Chọn vị thuốc, nhập SL, để trống ô tiền, bấm "+" (hoặc "Bán đơn"): dòng được thêm với `amount = 0`, đơn được lưu, tồn giảm, doanh thu 0, lãi âm. Không có cảnh báo.

**Bằng chứng.**
- `src/page.js:1157` — `num('')` trả `0` (`parseFloat('')` là `NaN`).
- `src/page.js:2338` — đọc thẳng `num($('.retail-money', row).value)`, không phân biệt ô trống với số 0.
- `src/page.js:2353` — đẩy `{ kg: q, amount: kToDong(m) }` mà không kiểm `m`.
- `src/page.js:2639` — chỉ chặn `amount < 0`.
- `src/page.js:2375` — sửa dòng trong tờ ghi cũng chỉ chặn `m < 0`.
- `server.js:279` — chấp nhận `total >= 0`, nên không chặn được ở tầng cuối.
- Không có test nào cho `amount = 0` trong `tests/client.test.mjs`.

**Cách sửa.**
1. Phân biệt ô trống với số 0 tại `commitRetailRow`:

```js
var rawM = $('.retail-money', row).value;
if (String(rawM).trim() === '') {
  toast('Nhập giá bán cho dòng này', 'error');
  var mi = $('.retail-money', row); if (mi) focusNS(mi);
  return false;
}
var m = num(rawM);
```

2. Nếu nghiệp vụ cho phép bán 0 đồng (biếu/tặng), giữ số 0 nhưng bắt xác nhận:

```js
if (!(items[k].amount > 0) && !confirm('Đơn có thành tiền 0. Vẫn lưu?')) return;
```

3. Thống nhất `noteSave` (`:2375`) và `saveRetail` (`:2639`) dùng cùng luật.
4. (Tùy chọn) Server cảnh báo khi `type === 'BAN' && total === 0` để bắt dữ liệu cũ, không chặn.

**Test hồi quy.** `setRetailItems([{ pid: 'p1', kg: 1, amount: 0 }])` → `saveRetail()` không tạo giao dịch, tồn không đổi; và trường hợp ô trống không thể thêm dòng.

**Điều kiện đóng.** Có test chứng minh cả hai đường ("+" và "Bán đơn") đều không lưu 0 đồng khi chưa xác nhận.

---

### W2. Nhãn "Giá bán" mang nghĩa thành tiền

**Hiện tượng.** Ô nhập lưu **thành tiền cả dòng** (`total = amount`, `price = amount / kg`), nhưng tiêu đề và `aria-label` ghi "Giá bán". Lịch sử cùng giá trị lại ghi "Thành tiền". Với 0,1 kg, người dùng nhập giá/kg sẽ bị tính dư 10 lần.

**Bằng chứng.**
- `src/page.js:662,676` — tiêu đề cột "Giá bán".
- `src/page.js:2169,2173,2291` — `data-label`/`aria-label` "Giá bán".
- `src/page.js:2308` — ô hiển thị `fmtMoney(it.amount)` (thành tiền).
- `src/page.js:2665-2666` — `price = amount / kg`, `total = amount`.
- `src/page.js:912,946,2993,3279` — lịch sử ghi cùng giá trị là "Thành tiền".
- `CHANGELOG.md:30` — 2.17.3 đổi nhãn, "Không đổi logic tiền".

**Cách sửa.**
- **Tối thiểu (khuyến nghị ngay):** đổi 5 chỗ về "Thành tiền" cho khớp lịch sử và đúng nghĩa đang lưu.
- **Đầy đủ (sau):** đổi ô sang "Đơn giá (k/kg)", tính `amount = giá × kg`, hiển thị thêm cột thành tiền. Việc này chạm `renderNote` và `saveRetail`, cần test riêng.

**Test hồi quy.** Khẳng định tiêu đề cột tờ ghi bán lẻ chứa "Thành tiền"; nếu chọn cách đầy đủ, test `amount = price × kg` với kg = 0,1.

**Điều kiện đóng.** Nhãn ở màn hình nhập, hộp sửa dòng và lịch sử nói cùng một nghĩa.

---

### W3. 409 giả khi mất phản hồi; không có idempotency

**Hiện tượng.** PUT đã ghi xong nhưng phản hồi bị mất (mạng chập, tải lại tab). Client thử lại với `X-Base-Updated` cũ, server thấy `current > baseNum` và trả 409 "thiết bị khác đã thay đổi" — dù máy chủ đang giữ đúng dữ liệu của chính client đó. Chọn "lấy bản mới" sẽ xóa nháp vô ích.

**Bằng chứng.**
- `server.js:404-408` — mỗi lần ghi đều đóng dấu `source_updated_at = Date.now()`, kể cả khi nội dung không đổi.
- `server.js:561` — chỉ so `current > baseNum`, không có mã thao tác.
- `src/page.js:4356` — gửi `X-Base-Updated: cloudBase`.
- `src/page.js:4372-4375` — mọi 409 đều mở hộp xung đột.

**Cách sửa.**
1. **Giảm đau ngay:** khi nhận 409, nếu `num(d.updatedAt) === sent` thì coi như thành công (phản hồi cũ về muộn), không hỏi người dùng.
2. **Đầy đủ:** sinh `opId = uid('OP')` một lần cho mỗi snapshot gửi, giữ nguyên khi thử lại; server lưu `op_id` + kết quả gần nhất (bảng `ops` hoặc `app_meta`) và trả lại kết quả cũ thay vì 409.
3. Chỉ mở hộp xung đột khi `current > baseNum` **và** `opId` chưa từng thấy.

**Test hồi quy.** Server: PUT cùng `X-Op-Id` hai lần → lần hai trả `success`, không 409. Client: 409 với `updatedAt === sent` → coi là thành công.

**Điều kiện đóng.** Không còn đường nào biến một lần ghi thành công thành hộp "thiết bị khác đã thay đổi".

---

## P1 — Độ tin cậy

### W4. Không timeout/`AbortController` cho `fetch`

**Hiện tượng.** Mạng treo thì lời hứa không bao giờ kết thúc; `pushing`/`refreshing` giữ nguyên, nút Lưu im lặng, người dùng không biết đang chờ hay đã hỏng.

**Bằng chứng.** `src/page.js:4279-4288` (`apiFetch` không có `signal`); cờ `4352`, `4374`, `4416`, `4468`.

**Cách sửa.** Thêm `AbortController` 15 giây trong `apiFetch`, phân biệt `AbortError` với lỗi mạng:

```js
function apiFetch(url, opts){
  var o = {}; for (var k in (opts || {})) o[k] = opts[k];
  o.cache = 'no-store';
  var ctl = new AbortController();
  o.signal = ctl.signal;
  var timer = setTimeout(function(){ ctl.abort(); }, 15000);
  var clear = function(){ clearTimeout(timer); };
  return fetch(url, o).then(function(r){ clear(); return r; },
                           function(e){ clear(); throw e; });
}
```

Giữ nguyên `.catch` hiện có để nhả `pushing`; thêm nhánh `e.name === 'AbortError'` → "Máy chủ không phản hồi sau 15 giây".

**Test hồi quy.** Gọi `apiFetch` với `fetch` giả treo → sau timeout phải reject và `pushing` trở lại `false`.

**Điều kiện đóng.** Không còn trạng thái chờ vô hạn; thông báo phân biệt timeout với mất mạng.

---

### W5. `tsFromId` không parse id của app

**Hiện tượng.** Hàm chỉ khớp đuôi toàn chữ số nên trả 0 với gần như mọi id do app tạo; giao dịch cũ thiếu `ts` mất giờ thật, rơi về `date + index`.

**Bằng chứng.** `src/page.js:1535-1540` vẫn `/(\d{10,13})$/`; `uid()` tại `:1515` tạo `prefix_<base36(ms)><5 ký tự>`; `tools/kiem-tra-ngay.mjs:35-42` đã parse đúng **cả hai** định dạng.

**Cách sửa.** Chép logic từ công cụ, không dùng regex 13 số đơn thuần:

```js
function tsFromId(id){
  var s = String(id || '');
  var m = s.match(/_(\d{13})(?:_|$)/);                  // id cũ TX_<13 số>_<random>
  if (m) { var v = Number(m[1]); if (v > 946684800000 && v < 4102444800000) return v; }
  m = s.match(/^[A-Za-z]+_([0-9a-z]{8})[0-9a-z]*$/);     // id mới: 8 ký tự base36 đầu
  if (m) { var ms = parseInt(m[1], 36); if (ms > 946684800000 && ms < 4102444800000) return ms; }
  return 0;
}
```

**Test hồi quy.** `TX_1793519408528_x` → `1793519408528`; `TX_mw77m3ci8nn9e` và `OD_mw77m3ci8nn9e` → cùng một mốc base36 hợp lệ; thêm test thứ tự `txStamp` và giá nhập tham chiếu (`lastImport`) theo ghi chú 3.1 của sổ triage.

**Điều kiện đóng.** Cả hai định dạng id đều cho mốc thời gian; có test giá vốn.

---

### W6. Tải/khôi phục backup báo sai và lệch trần 4 MB

**Hiện tượng.**
- `downloadBackup` trả `true` và ghi "Đã tải file sao lưu" kể cả khi trình duyệt chặn tải; `BAK_LAST` vẫn được đóng dấu → người dùng tưởng đã có bản sao lưu.
- Khôi phục chặn file > 4 MB ở client, nhưng server nhận thân tối đa 4 MB **sau khi nén**; bản JSON đẹp (pretty) dễ vượt trần client dù bản nén vừa trần server.

**Bằng chứng.** `src/page.js:4529-4555` (`a.click()` rồi `return true`), `4673` (`file.size > 4 * 1024 * 1024`); `server.js:40` (`MAX_BODY`), `508` (`express.text ... limit`).

**Cách sửa.**
1. Đổi lời báo thành "Đã tạo file sao lưu" (không khẳng định đã lưu), hoặc chỉ đóng dấu `BAK_LAST` sau khi người dùng xác nhận.
2. Nâng trần client lên 12 MB, hoặc đo kích thước chuỗi compact trước khi so.

**Test hồi quy.** File 5 MB JSON đẹp vẫn khôi phục được; `downloadBackup` không đóng dấu khi `a.click()` ném lỗi.

**Điều kiện đóng.** Không còn thông báo sai về bản sao lưu; trần client không nhỏ hơn trần server.

---

## P2 — Nhất quán và chất lượng

### W7. `oname` không `oid` bị client bỏ, server giữ

**Hiện tượng.** Dữ liệu cũ có tên đơn nhưng thiếu mã đơn: server giữ `oname`, client `sanitize` bỏ → hiển thị khác nhau tùy đường đọc.

**Bằng chứng.** `src/page.js:1716` (`if (oid && oname && oname !== oid)`); `server.js:288-292` (giữ `oname` độc lập).

**Cách sửa.** Ở client:

```js
if (oid) tx.oid = oid;
if (oname && oname !== oid) tx.oname = oname;
```

**Test hồi quy.** `sanitize` với `{ oname: 'Đơn cũ' }` (không `oid`) → giữ `oname`; với `oname === oid` → bỏ (test hiện có vẫn phải xanh).

**Điều kiện đóng.** Client và server cho cùng kết quả với cùng đầu vào.

---

### W8. Chuẩn hóa tên sản phẩm client ≠ server

**Hiện tượng.** Client gộp khoảng trắng và NFC (`capWords(...).toLowerCase()`), server chỉ `trim().toLowerCase()`. Tên khác nhau ở khoảng trắng/NFC có thể bị client coi là trùng (bỏ oan) hoặc lọt qua client rồi bị server trả 400.

**Bằng chứng.** `src/page.js:1660`; `server.js:260`.

**Cách sửa.** Dùng chung một hàm khóa:

```js
// cả hai phía
function nameKey(s){ return String(s).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase(); }
```

**Test hồi quy.** `"Cam  Thảo"` và `"Cam Thảo"` cho cùng khóa; chuỗi NFD và NFC cho cùng khóa; server trả 400 nhất quán.

**Điều kiện đóng.** Cùng đầu vào → cùng quyết định trùng/không trùng ở hai phía.

---

### W9. CI không có lint; Node local ≠ Node CI

**Hiện tượng.** CI chỉ chạy test, không kiểm cú pháp; `better-sqlite3` không build được trên Node 26 nên test server/auth chỉ chạy trong Docker (Node 22), dễ lọt lỗi khi sửa tay.

**Bằng chứng.** `.github/workflows/ci.yml` chỉ có `test-client` và `test-server`; `Dockerfile` dùng `node:22-bookworm-slim`.

**Cách sửa.** Thêm job `lint` chạy `node --check server.js auth.js pwa.js` + một bước trích script inline từ `tests/client.test.mjs` để `new Function(...)` kiểm cú pháp; ghi rõ Node 22 trong `README-LOCAL.md` hoặc `.nvmrc`.

**Điều kiện đóng.** CI đỏ khi có lỗi cú pháp; tài liệu ghi đúng phiên bản Node.

---

### W10. Thiếu test cho các lỗi trên

**Cần thêm tối thiểu.**
1. `saveRetail` với `amount = 0` và ô trống (W1).
2. Tiêu đề/aria cột tiền của bán lẻ (W2).
3. Server: hai PUT cùng `X-Op-Id` → lần hai `success` (W3).
4. `apiFetch` timeout → reject, cờ được nhả (W4).
5. `tsFromId` cả hai định dạng (W5).
6. `sanitize` giữ `oname` khi thiếu `oid` (W7).
7. `nameKey` với khoảng trắng/NFC (W8).

**Vị trí.** `tests/client.test.mjs` (mục 1, 2, 4–7), `tests/server.test.mjs` (mục 3, 7). Hiện có 333 test client, 38 server, 17 auth.

**Điều kiện đóng.** Mỗi mục W1–W8 có ít nhất một test thất bại trước khi sửa và xanh sau khi sửa.

---

## 3. Không đưa vào phạm vi sửa (đã chấp nhận)

Các mục sau đã có kết luận trong `BAO-CAO-REVIEW.md`; chỉ mở lại khi có bằng chứng mới hoặc điều kiện "xét lại" xảy ra.

| Mục | Lý do |
|---|---|
| Trần ~22k giao dịch / 4 MB (R2) | Hiện 163 vị, 723 giao dịch, 17 đơn; xét lại khi > 10k giao dịch |
| IP trong `Caddyfile` (R3) | Mạng LAN một người dùng |
| Tải backup không kiểm được file đã lưu (R3) | Đã xử lý một phần ở W6 |
| CSP/HSTS thêm, bỏ `err.message`, Playwright, bàn phím, confirm biểu đồ (R3) | Không cần cho mô hình hiện tại |
| `VACUUM INTO` đồng bộ mỗi ngày (E8b) | Một lần/ngày, DB ~1 MB, phải chụp trước khi ghi |
| `migrateMoneyToDong` lỗi thì dừng app (E8c) | Đúng: nuốt lỗi sẽ phục vụ số nghìn như số đồng |
| Đơn bán lẻ 1 vị không `oid` (E7) | Chủ ý, đã ghi CHANGELOG |
| Không điều chỉnh tồn kho vật lý | Giới hạn thiết kế; đối soát qua `reconcileList` |
| `O(T×P)` khi tìm sản phẩm, poll 15 giây | Chưa đáng kể ở ~720 giao dịch |
| Chia nhỏ `page.js` (E9) | Script inline + CSP + SSR; lợi ít, rủi ro cao |

---

## 4. Đã sửa — không làm lại

| Mã | Nội dung | Bản sửa |
|---|---|---|
| E2 | Server không kiểm `moneyUnit` | 2.17.4, `server.js:238-239` |
| E3 | Luật số nhận boolean/rỗng/`0x10` | 2.17.4, `page.js:1180-1181`, `server.js:205-215` |
| E5 | `delOrder` so `oid` bằng `===` | 2.17.4 |
| E8d | Chú thích `checkLimits('money')` sai | 2.17.4 |
| A1–A8 | `saveLocal`, CSP manifest, theme, `pendEntryH`, `thang`, test PUT | 2.15.20–2.17.5 |
| R1 | Xóa đơn nhập 2 dòng cùng vị, `openOrder`, log cổng | 2.15.20 |

---

## 5. Kiểm tra sau khi sửa

```bash
# client (chạy trên host)
node --test --test-timeout=120000 tests/client.test.mjs

# server + auth (cần image, vì better-sqlite3 không build trên Node 26)
docker build -t quan-ly-kho-local:ci .
docker run --rm -e DATA_DIR=/tmp/qlk-ci quan-ly-kho-local:ci npm test
docker run --rm -e DATA_DIR=/tmp/qlk-ci quan-ly-kho-local:ci npm run test:auth
```

**Định nghĩa "xong" cho cả đợt:** ba lệnh trên xanh; mỗi mục W1–W8 có test hồi quy; không đổi định dạng dữ liệu lưu (trừ khi có migration + test).

---

## 6. Ghi chú về nguồn

Hai báo cáo bổ khuyết nhau, không thay thế nhau:

- **Báo cáo ngoài 14/11** bắt đúng lỗi validation phía server (`moneyUnit`, luật số) — trong đó `moneyUnit` là lỗi thật mức trung bình đã được vá ở 2.17.4.
- **Báo cáo 2.17.1 (8,1/10)** bắt lỗi luồng nghiệp vụ và UX (0 đồng, nhãn tiền, timeout, 409 giả).
- Không báo cáo nào một mình đủ để kết luận "9–9,5/10": báo cáo ngoài bỏ sót W1–W4, còn báo cáo 8,1 bỏ sót E2/E3.

Khi thêm mục mới, theo quy ước của `BAO-CAO-REVIEW.md`: thêm dòng vào bảng mục 1, kèm mã, bằng chứng `file:dòng`, trạng thái và điều kiện xét lại.
