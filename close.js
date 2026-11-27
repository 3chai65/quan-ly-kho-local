/**
 * Chốt sổ năm âm lịch (docs/chot-so.md). Hàm thuần, không đụng DB: server.js gọi cho cả xem trước (dryRun) lẫn chạy thật; test gọi trực tiếp.
 * Bảng Tết (dương lịch, lịch Việt Nam UTC+7) — Người duyệt chốt 26/11/2026, trùng bảng trong src/page.js (test so).
 */
export const TET = ['2025-01-29', '2026-02-17', '2027-02-06', '2028-01-26', '2029-02-13', '2030-02-02', '2031-01-23', '2032-02-11', '2033-01-31', '2034-02-19', '2035-02-08', '2036-01-28', '2037-02-15', '2038-02-04', '2039-01-24', '2040-02-12', '2041-02-01', '2042-01-22', '2043-02-10', '2044-01-30', '2045-02-17'];

/* Tết mở đầu năm âm chứa ngày iso (YYYY-MM-DD). Ngoài bảng (trước Tết đầu hoặc sau Tết cuối, vì chưa biết Tết kế) → null. */
export function lunarStart(iso) {
  const s = String(iso || '');
  for (let i = TET.length - 2; i >= 0; i--) if (s >= TET[i] && s < TET[i + 1]) return TET[i];
  return null;
}

/* Mốc gỡ C = lunarStart(D): Tết của năm âm chứa ngày chốt D. D = Tết(2028) − 1 → C = Tết 2027. */

function round(n) { return Math.round(Number(n) || 0); }
/* Cùng decQty của server (dọn nhiễu nhị phân, không làm tròn số kg thật). */
export function decQty(n) {
  n = Number(n);
  if (!Number.isFinite(n) || n === 0) return 0;
  for (let p = 1; p < 15; p++) {
    const r = Number(n.toPrecision(p));
    if (Math.abs(n - r) <= Math.abs(n) * 1e-12) return r;
  }
  return Number(n.toPrecision(15));
}
/* Giờ của giao dịch theo id (cùng tsFromId ở client), để giá vốn tại mốc xếp giống lastImport/txStamp. */
export function tsFromId(id) {
  const s = String(id || '');
  let v, m = s.match(/_(\d{13})(?:_|$)/) || s.match(/(\d{13})$/);
  if (m) { v = Number(m[1]); if (v >= 1735689600000 && v < 2051222400000) return v; }
  m = s.match(/^[A-Za-z]+_([0-9a-z]{8})[0-9a-z]*$/);
  if (m) { v = parseInt(m[1], 36); if (v >= 1735689600000 && v < 2051222400000 && v <= Date.now() + 86400000) return v; }
  return 0;
}
/* Giá vốn một dòng BÁN: như txCost ở client (cost lưu sẵn, thiếu thì qty × giá nhập hiện tại). */
function txCost(t, byId) { return t.cost != null ? Number(t.cost) : Number(t.qty) * (byId.get(t.productId) ? Number(byId.get(t.productId).costPrice) : 0); }

/**
 * state: dạng validateState (transactions có `opening`). today: YYYY-MM-DD giờ VN. prevCutoff: mốc chốt trước (hoặc null). drift: stockDrift hiện tại.
 * Trả { cutoff, blocks[], removed[], opening[], months[], totals }.
 */
export function closePlan(state, cutoff, today, prevCutoff, drift) {
  const blocks = [];
  const C = String(cutoff || '');
  if (!TET.includes(C)) blocks.push('Mốc ' + C + ' không phải ngày Tết trong bảng');
  const curStart = lunarStart(today);
  const prevStart = curStart ? lunarStart(prevDay(curStart)) : null;
  if (!curStart || !prevStart) blocks.push('Ngày hôm nay ngoài bảng Tết, chưa chốt được');
  else if (C > prevStart) blocks.push('Phải giữ năm sổ hiện tại và năm sổ trước: mốc muộn nhất là ' + prevStart);
  if (prevCutoff && C <= prevCutoff) blocks.push('Đã chốt đến ' + prevCutoff + ' rồi');
  if (drift && drift.length) blocks.push(drift.length + ' vị có tồn khác nhập − bán: sửa ở Đối chiếu trước');

  const byId = new Map(state.products.map(p => [p.id, p]));
  const removed = state.transactions.filter(t => t.date < C);

  /* Tồn tại mốc (cộng dồn xuôi) và giá vốn tại mốc (NHAP gần nhất có giá > 0 trước C; thứ tự ngày rồi ts rồi vị trí). */
  const qty = new Map(), last = new Map();
  removed.forEach((t, i) => {
    qty.set(t.productId, (qty.get(t.productId) || 0) + (t.type === 'NHAP' ? Number(t.qty) : -Number(t.qty)));
    if (t.type === 'NHAP' && Number(t.price) > 0) {
      const k = [t.date, Number(t.ts) > 0 ? Number(t.ts) : tsFromId(t.id), i], o = last.get(t.productId);
      if (!o || k[0] > o.k[0] || (k[0] === o.k[0] && (k[1] > o.k[1] || (k[1] === o.k[1] && k[2] > o.k[2])))) last.set(t.productId, { k, price: Number(t.price) });
    }
  });
  const opening = [], negative = [];
  for (const [pid, q0] of qty) {
    const q = decQty(q0);
    if (q < -1e-9) { negative.push((byId.get(pid) || { name: pid }).name + ' (' + q + ' kg)'); continue; }
    if (q <= 1e-9) continue;
    const p = byId.get(pid);
    const price = last.has(pid) ? round(last.get(pid).price) : round(p ? p.costPrice : 0);
    opening.push({ id: 'open-' + C + '-' + pid, date: C, type: 'NHAP', productId: pid, qty: q, price, total: 0, cost: null,
      orderId: null, orderName: null, retail: false, rx: false, grams: null, thang: null, unitPrice: null, ts: null, opening: true,
      name: p ? p.name : pid });
  }
  if (negative.length) blocks.push('Tồn tại mốc âm: ' + negative.slice(0, 10).join(', ') + (negative.length > 10 ? '…' : ''));

  /* Bảng tóm tắt theo tháng dương lịch của phần bị gỡ (dòng tồn đầu kỳ cũ có total 0 nên không tính vào nhập). */
  const mm = new Map();
  let rev = 0, cost = 0, imp = 0;
  for (const t of removed) {
    if (t.opening) continue;
    const m = t.date.slice(0, 7), e = mm.get(m) || { m, imp: 0, rev: 0, cost: 0 };
    if (t.type === 'NHAP') { e.imp += Number(t.total); imp += Number(t.total); }
    else { const c = txCost(t, byId); e.rev += Number(t.total); e.cost += c; rev += Number(t.total); cost += c; }
    mm.set(m, e);
  }
  const months = [...mm.values()].map(e => ({ m: e.m, imp: round(e.imp), rev: round(e.rev), cost: round(e.cost) })).sort((a, b) => a.m < b.m ? -1 : 1);
  const sum = k => months.reduce((a, e) => a + e[k], 0);
  /* Tổng gỡ phải = tổng bảng tóm tắt; lệch từ 1 đồng (do làm tròn từng tháng) thì chặn. */
  if (Math.abs(sum('rev') - round(rev)) >= 1 || Math.abs(sum('cost') - round(cost)) >= 1 || Math.abs(sum('imp') - round(imp)) >= 1) blocks.push('Tổng gỡ khác bảng tóm tắt (lệch làm tròn), không chốt');
  if (!removed.length) blocks.push('Không có giao dịch nào trước mốc ' + C);
  return { cutoff: C, blocks, removed, opening, months, totals: { count: removed.length, imp: round(imp), rev: round(rev), cost: round(cost), profit: round(rev) - round(cost) } };
}

/* Gộp bảng tóm tắt cũ với mới (tháng trùng thì cộng). */
export function mergeMonths(oldMonths, newMonths) {
  const m = new Map();
  for (const e of [...(oldMonths || []), ...(newMonths || [])]) {
    const o = m.get(e.m) || { m: e.m, imp: 0, rev: 0, cost: 0 };
    o.imp += e.imp; o.rev += e.rev; o.cost += e.cost;
    m.set(e.m, o);
  }
  return [...m.values()].sort((a, b) => a.m < b.m ? -1 : 1);
}

function prevDay(iso) {
  const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) - 1));
  return d.toISOString().slice(0, 10);
}
