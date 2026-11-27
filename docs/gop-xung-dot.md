# Tự gộp khi 409 (việc AT, bước 1 — thiết kế, chưa sửa mã)
Hiện tại: client chỉ nhớ `cloudBase` (số updatedAt), 409 → `cloudConflict()` hỏi OK = bỏ thay đổi máy này / Hủy = `pushState(true, true)` X-Force đè cả khối. App Mac làm y hệt (kênh 24/11, 8843d1a).
Mục tiêu: 409 → tải H (hub), gộp L (máy này) lên H theo diff L−B, gửi với base mới. Không đổi API server.

## 1. Base và diff
- B = bản hub đã áp/đã được nhận gần nhất. Lưu IndexedDB khóa riêng `base` (chuỗi JSON đã sanitize, cùng lúc với KEY/BASE_KEY trong `saveLocal`). Cập nhật khi: pullState áp bản hub; PUT thành công (B = snapshot vừa gửi, vì hub nhận đúng bản đó).
- Không có B (IDB lỗi, rớt về localStorage, bản cũ chưa có B): KHÔNG gộp → hộp cũ nhưng bỏ nút đè (chỉ: tải file nháp + lấy bản hub).
- Diff theo id: giao dịch thêm/xóa/sửa (so JSON đã chuẩn hóa, bỏ ts thứ tự); đơn thuốc thêm/sửa/xóa (cả items); sản phẩm thêm/xóa/sửa name, costPrice. stock KHÔNG diff như trường thường.

## 2. Tồn kho
- M.stock[p] = H.stock[p] + (L.stock[p] − B.stock[p]) (vị mới ở L: lấy L.stock), rồi `dec()`.
- Chứng minh: gọi lệch(X) = stock − (Σnhập − Σbán) theo vị. Khi hai bên sửa tập giao dịch rời nhau thì Σ(M) = Σ(H) + Σ(L) − Σ(B), nên lệch(M) = lệch(H) + lệch(L) − lệch(B). B, H, L đều khớp (lệch 0) ⇒ M khớp. Chỉnh tồn tay/đối soát cũng là một delta nên cộng dồn đúng.
- Ví dụ: B.A = 10; iPhone bán 2 (L.A = 8); Tauri nhập 5 (H.A = 15) ⇒ M.A = 15 + (8 − 10) = 13 = 10 + 5 − 2.
- M.stock < 0 (hai bên cùng bán quá tồn) ⇒ ca đụng (hub từ chối tồn âm).

## 3. Ca đụng nhau (gộp được thì gộp, không được mới hỏi)
- Gộp được: chỉ một bên đổi; hai bên đổi ra cùng giá trị; hai bên thêm (id có thời gian + ngẫu nhiên, không trùng).
- costPrice hai bên cùng đổi: lấy giá của dòng NHAP mới nhất (ts) trong M; không có dòng nhập nào ⇒ hỏi.
- Đụng (phải hỏi): cùng giao dịch/đơn thuốc/tên vị sửa khác nhau; một bên xóa, bên kia sửa; L có giao dịch cho vị H đã xóa; trùng tên vị/đơn thuốc sau gộp (nameKey); tồn âm. Giao dịch gom theo đơn (oid/oname) khi hiển thị.
- Hộp hỏi liệt kê đúng các dòng đụng (tên vị/đơn, ngày, SL, tiền, hai giá trị); mỗi dòng chọn "Máy này" hoặc "Máy chủ" (mặc định Máy chủ); luôn tải file nháp trước. Không còn nút đè cả khối.
- Sổ đã chốt: thay đổi của L vào giao dịch trước mốc ⇒ bỏ, báo (closedGuard vẫn chặn nếu lọt).

## 4. Luật hub giữ nguyên
- validateState, closedGuard, X-Op-Id: M là snapshot mới ⇒ opSig mới ⇒ opId mới. PUT trước "mất phản hồi" vẫn được khử trùng nhờ lastOp kiểm trước base.
- Kiểm M bằng `sanitize` (drops = 0) + `checkLimits` trước khi gửi; lỗi ⇒ không gửi, báo như 400.
- 409 lại (máy khác vừa ghi): lặp tối đa 3 lần (tải H mới, gộp từ L/B cũ), quá thì huy hiệu lỗi + hẹn thử lại, không đè.
- X-Force chỉ còn ở "Khôi phục từ file" (đè có chủ đích, đã có bản truoc-ghi-de): cờ `replaceIntent` khi khôi phục; 409 lúc đó hỏi đè riêng, không gộp.

## 5. Đơn đang soạn
retailItems / remedyItems / nhapList không nằm trong db ⇒ không đổi; chỉ render lại số tồn/gợi ý. Hộp sửa giao dịch đang mở (txEditCur) mà dòng đã bị H xóa ⇒ lưu báo "dòng không còn", không tạo lại.

## 6. App Mac
Có: Mac ghi lạc quan như web và nhận 409 (hiện cũng có Hủy = đè). Phải làm cùng thuật toán, cùng luật đụng; dùng chung bộ ca kiểm (JSON B/H/L → M) để hai bên cho kết quả trùng.

## 7. Test và phá thử
Hàm thuần `mergeState(B, H, L) → {state, conflicts}` (không DOM), test client theo bảng ca: hai máy cùng bán/nhập/xóa/sửa tên/sửa giá; iPhone bán A khi Tauri nhập A ⇒ tồn = Σ; xóa vs sửa; trùng tên; tồn âm; sau chốt; 409 lặp 3 lần; không có B. Test server: 2 PUT nối tiếp qua gộp ⇒ stockDrift rỗng. Phá thử: bỏ delta tồn (lấy L.stock), bỏ phát hiện xóa-vs-sửa, bỏ giới hạn 3 lần ⇒ test phải đỏ.

## Điểm mở cho Người duyệt
a) B làm gấp đôi dung lượng IDB (~2× state) — chấp nhận? b) Mặc định chọn "Máy chủ" cho dòng đụng? c) Không có B thì bỏ hẳn nút đè (có thể kẹt nếu pull lỗi mãi)? d) costPrice theo NHAP mới nhất có đúng ý? e) Làm Mac cùng đợt hay sau web?
