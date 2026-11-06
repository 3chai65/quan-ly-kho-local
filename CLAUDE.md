# Quản Lý Kho — bản local (Docker + SQLite)

Repo này là **bản chạy local** của app Quản Lý Kho: server Node (Express +
better-sqlite3) chạy trong Docker, dữ liệu là file SQLite trên ổ cứng. Xem
`README-LOCAL.md` để chạy và `CHANGELOG.md` cho lịch sử thay đổi.

## Kiến trúc
- `server.js` — Express + better-sqlite3. API `GET/PUT /api/state`. Tiền lưu bằng
  đồng nguyên, `moneyUnit: "dong"`. Backup mỗi ngày (`VACUUM INTO`) trước lần ghi
  đầu tiên trong ngày.
- `src/page.js` — toàn bộ HTML + CSS + JS client (nhúng inline). Ô nhập là nghìn
  đồng; `kToDong` / `kInput` đổi ở biên.
- Repo Worker `quan-ly-kho` (remote `origin`) để nguyên. Push bản này qua
  `origin-local`, nhánh `main`. PC và điện thoại không dùng cùng lúc.
- Quy ước đầy đủ: `README.md` mục Phạm vi và mục Tiền.
- `tests/client.test.mjs` — test logic client (tiền, tồn kho, đồng bộ), chạy trên máy.
- `tests/server.test.mjs` — test `server.js` thật qua HTTP, chạy trong Docker.

## Vùng nhạy cảm
Sửa xong phải chạy test: logic tiền, tồn kho, đồng bộ
(`sanitize`, `validateState`, `allocateRemedyByCost`, `pushState`/`pullState`).
