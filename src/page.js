/**
 * Quản Lý Kho — HTML + CSS + JS client (nhúng inline vào server.js).
 */

export const PAGE = String.raw`<!doctype html>
<html lang="vi" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Quản Lý Kho — Sổ kho, đơn bán và doanh thu</title>
<meta name="description" content="Quản lý kho dược liệu: đơn bán lẻ, đơn thuốc chén, nhập hàng, tồn kho, lịch sử giao dịch và thống kê doanh thu 12 tháng. Đồng bộ mạng nội bộ (LAN).">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" id="themeColor" content="#eceef2">
<meta name="robots" content="noindex, nofollow">
<link id="favicon" rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Ccircle cx='256' cy='256' r='256' fill='%23fff'/%3E%3Cpath fill='%23000' d='M256 64c53 0 96 43 96 96s-43 96-96 96s-96 43-96 96s43 96 96 96c-106 0-192-86-192-192S150 64 256 64m0 448a256 256 0 1 0 0-512a256 256 0 1 0 0 512m32-352a32 32 0 1 0-64 0a32 32 0 1 0 64 0m-64 192a32 32 0 1 1 64 0a32 32 0 1 1-64 0'/%3E%3C/svg%3E">
<style>
*,*::before,*::after{box-sizing:border-box}
:root{
color-scheme:light;
--bg:#eceef2;--surface:#f6f7f9;--surface2:#eaedf2;--border:#d7dde6;--border2:#e6eaf0;
--text:#1e293b;--text2:#475569;--muted:#5b6b81;
--brand:#4f46e5;--brand-text:#4338ca;--brand-soft:#e8ebf8;
--green-soft:#e6f4ee;--green-text:#047857;
--amber:#b45309;--amber-soft:#fbf5e6;--amber-text:#b45309;
--red:#be123c;--red-soft:#f8e7ea;--red-text:#be123c;
--blue-soft:#e6eef9;--blue-text:#1d4ed8;
--purple-soft:#ece9f8;--purple-text:#6d28d9;
--r:14px;--r-sm:10px;
--sh:0 1px 2px rgba(15,23,42,.05),0 2px 8px rgba(15,23,42,.05);
--chart-imp:#5b5fd0;--chart-exp:#2f9e76;--chart-imp-ink:#ffffff;--chart-exp-ink:#0f172a;
--ring:0 0 0 3px rgba(79,70,229,.30);
}
html[data-theme=dark]{
color-scheme:dark;
--bg:#111620;--surface:#171e2b;--surface2:#1f2736;--border:#2d3850;--border2:#242e41;
--text:#cdd5e1;--text2:#aab4c4;--muted:#8f9bb0;
--brand:#5b5fd9;--brand-text:#b4bcf2;--brand-soft:#222545;
--green-soft:#0f2a24;--green-text:#7fd6ad;
--amber:#d99a2b;--amber-soft:#2e2412;--amber-text:#e6b964;
--red:#e0566f;--red-soft:#3a1a22;--red-text:#ec8294;
--blue-soft:#14233a;--blue-text:#a7c7ea;
--purple-soft:#2a2341;--purple-text:#cabff0;
--sh:0 1px 2px rgba(0,0,0,.35);
--chart-imp:#7f83e0;--chart-exp:#4fb991;--chart-imp-ink:#0b1220;--chart-exp-ink:#0b1220;
--ring:0 0 0 3px rgba(129,140,248,.35);
}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);
font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif;
padding-bottom:48px;-webkit-font-smoothing:antialiased}
[hidden]{display:none!important}
h1,h2,h3,p{margin:0}
a{color:var(--brand-text)}
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.sprite{position:absolute;width:0;height:0;overflow:hidden}
.ico{width:1.15em;height:1.15em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;vertical-align:-.18em}
.skip{position:absolute;left:-9999px;top:0;z-index:200;background:var(--surface);color:var(--text);padding:10px 16px;border-radius:0 0 10px 0}
.skip:focus{left:0}
:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
/* ---------- layout ---------- */
.wrap{max-width:1120px;margin:0 auto;padding:0 16px}
.top{position:sticky;top:0;z-index:30;background:var(--surface);border-bottom:1px solid var(--border)}
.bar{display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap;min-height:60px}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:17px;color:var(--text);text-decoration:none;letter-spacing:-.01em;background:none;border:0;padding:0;font-family:inherit;cursor:pointer}
.brand-wrap{display:flex;align-items:center;gap:8px;min-width:0}
.brand__yin{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;padding:0;border:0;border-radius:10px;background:none;color:var(--brand-text);cursor:pointer}
.brand__yin .ico{width:24px;height:24px}
.brand__yin.is-shake{animation:yinShake .4s ease-in-out}
@keyframes yinShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@media (prefers-reduced-motion:reduce){.brand__yin.is-shake{animation:none;box-shadow:0 0 0 2px var(--red-text)}}
.menu__item--sub{font-size:12px;color:var(--muted)}
.bar__actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sync-badge{max-width:min(440px,72vw);margin:0;padding:6px 10px;border-radius:12px;
border:1px solid var(--amber);background:var(--amber-soft);color:var(--amber-text);
font:inherit;font-size:12px;font-weight:700;line-height:1.35;text-align:left;white-space:pre-line;cursor:default}
.sync-discard{max-width:min(280px,70vw);white-space:normal;line-height:1.3}
.main{padding:18px 0 0}
/* ---------- buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:8px 14px;
border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--text);
font:inherit;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;
transition:background .15s,border-color .15s,color .15s}
.btn:hover{background:var(--surface2)}
.btn:active{transform:translateY(1px)}
.btn--primary{background:#4f46e5;border-color:#4f46e5;color:#fff}
.btn--primary:hover{background:#4338ca;border-color:#4338ca}
.btn--green{background:#047857;border-color:#047857;color:#fff}
.btn--green:hover{background:#065f46;border-color:#065f46}
.btn--dark{background:#334155;border-color:#334155;color:#fff}
.btn--dark:hover{background:#1e293b;border-color:#1e293b}
.btn--icon{min-width:38px;min-height:38px;padding:6px}
.btn--sm{min-height:34px;padding:5px 11px;font-size:13px}
.btn--danger{color:var(--red-text);background:transparent;border-color:transparent}
.btn--danger:hover{background:var(--red-soft)}
.btn[disabled]{opacity:.4;cursor:not-allowed}
/* ---------- menu ---------- */
.menu{position:relative}
/* 2.13.1: menu neo mép trái (nút âm dương ở bên trái header); không tràn khỏi màn hình 320–375px. */
.menu__list{position:absolute;left:0;right:auto;top:calc(100% + 6px);min-width:178px;max-width:calc(100vw - 24px);background:var(--surface);
border:1px solid var(--border);border-radius:12px;box-shadow:0 14px 34px rgba(15,23,42,.18);padding:6px;z-index:60}
.menu__item{display:flex;align-items:center;gap:9px;width:100%;padding:9px 10px;border:0;background:transparent;
color:var(--text);border-radius:8px;font:inherit;font-size:14px;cursor:pointer;text-align:left}
.menu__item:hover{background:var(--surface2)}
.menu__item[aria-checked=true]{background:var(--brand-soft);color:var(--brand-text);font-weight:700}
.menu__item[aria-checked=true]::after{content:"✓";margin-left:auto;font-weight:800}
/* ---------- row action menu (···) ---------- */
.rowmenu{position:static;display:inline-flex}
.rowmenu__list{position:fixed;z-index:120;min-width:180px;background:var(--surface);
border:1px solid var(--border);border-radius:12px;box-shadow:0 14px 34px rgba(15,23,42,.18);padding:6px}
.rowmenu__list[hidden]{display:none}
.menu__item--danger{color:var(--red-text)}
.menu__item--danger:hover{background:var(--red-soft);color:var(--red-text)}
/* ---------- cards ---------- */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden}
.card__head{display:flex;align-items:center;gap:10px;padding:13px 16px;flex-wrap:wrap}
.card__title{font-size:15px;font-weight:700;letter-spacing:-.01em}
.card__body{padding:16px}
.card__foot{padding:13px 16px;border-top:1px solid var(--border2)}
details>.card__head{cursor:pointer;list-style:none;user-select:none}
details>.card__head::-webkit-details-marker{display:none}
details[open]>.card__head{border-bottom:1px solid var(--border2)}
details>.card__head:hover{background:var(--surface2)}
.chev{transition:transform .18s;color:var(--muted)}
details[open] .chev{transform:rotate(90deg)}
/* ---------- stats ---------- */
/* 2.11.0: dải số liệu mỏng (2 nửa) và ô số trong Thống kê; không biểu tượng. */
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:12px;background:var(--surface);
border:1px solid var(--border);border-radius:var(--r-sm);box-shadow:var(--sh)}
.stats__c{padding:6px 12px;min-width:0}
.stats__c+.stats__c{border-left:1px solid var(--border2)}
.stat__k{font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);line-height:1.2}
.stat__v{font-size:16px;font-weight:800;letter-spacing:-.02em;margin-top:1px;line-height:1.2;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.stat__sub{font-size:10px;color:var(--muted);margin-top:1px;line-height:1.3}
.stat__sub b{color:var(--text2);font-weight:700;font-variant-numeric:tabular-nums}
.stat__sub span+span::before{content:"· "}
@media (max-width:600px){
.stats__c{padding:6px 10px}
.stat__sub span{display:block}
.stat__sub span+span::before{content:none}
}
</style>
<style>
/* ---------- forms ---------- */
.field{min-width:0}
.lbl{display:block;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:5px}
.inp{width:100%;min-height:42px;padding:9px 12px;border-radius:var(--r-sm);border:1px solid var(--border);
background:var(--surface);color:var(--text);font:inherit;font-size:14px}
.inp::placeholder{color:var(--muted);opacity:.85}
.inp:focus{outline:none;border-color:var(--brand);box-shadow:var(--ring)}
.inp--sm{min-height:36px;padding:6px 9px;font-size:13px;border-radius:8px}
.inp--num{text-align:right;font-variant-numeric:tabular-nums}
/* Ẩn mũi tên spin của mọi input number (desktop) — mobile vẫn nhập số qua bàn phím */
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
input[type=number]{-moz-appearance:textfield;appearance:textfield}
select.inp{cursor:pointer}
.datefield,.monthfield{position:relative}
.datefield .inp{padding-right:42px}
.monthfield .inp{padding-right:32px}
.datefield__ico,.monthfield__ico{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
.datefield__ico{width:18px;height:18px}
.monthfield__ico{width:15px;height:15px;right:9px}
.datefield__native,.monthfield__native{position:absolute;right:0;top:0;height:100%;opacity:0;border:0;padding:0;cursor:pointer}
.datefield__native{width:42px}
.monthfield__native{width:30px}
/* 2.12.0: nút + thêm vào tờ ghi (cạnh Giá nhập), vùng bấm ≥ 44×44. */
.nhap-add{width:44px;min-width:44px;min-height:44px;height:44px;padding:0}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.grid2+.grid2{margin-top:18px}
/* ---------- table ---------- */
.tw{overflow-x:auto;-webkit-overflow-scrolling:touch;position:relative}
table{width:100%;border-collapse:collapse;font-size:14px}
th{text-align:left;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);
font-weight:700;padding:6px 8px;border-bottom:1px solid var(--border);white-space:nowrap}
td{padding:5px 8px;border-bottom:1px solid var(--border2);vertical-align:middle}
tbody tr:last-child td{border-bottom:0}
tbody tr:hover{background:var(--surface2)}
.num{font-variant-numeric:tabular-nums}
.c-num{width:46px;text-align:center}
.c-del{width:46px;text-align:center}
.c-act{width:104px;text-align:center}
.c-act .inline-row{justify-content:center;gap:4px}
.c-qty{width:110px}
.c-money{width:130px}
/* 2.14.0 (giai đoạn 4, M3a): nút … Kho tồn 32px (hàng máy tính ≈43px); điện thoại 34px, vùng bấm ≥40 (::after). */
table.inv td.c-del .btn--icon,table.his td.c-act .btn--icon{width:32px;min-width:32px;height:32px;min-height:32px;padding:0}
table.ord,table.inv,table.his{min-width:0}
.muted{color:var(--muted)}
.small{font-size:12px}
.empty-cell{padding:22px 10px;text-align:center}
.b{font-weight:700}
.linkbtn{padding:0;border:0;background:transparent;color:var(--brand-text);font:inherit;font-weight:700;
text-align:left;text-decoration:underline;text-underline-offset:2px;cursor:pointer}
.linkbtn:hover{color:var(--brand)}
.txt-blue{color:var(--blue-text)}
.txt-green{color:var(--green-text)}
.txt-red{color:var(--red-text)}
.txt-brand{color:var(--brand-text)}
/* ---------- suggest ---------- */
.sug{position:relative}
.sug__list{position:absolute;z-index:40;left:0;right:0;top:calc(100% + 4px);max-height:288px;overflow:auto;
background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);
box-shadow:0 16px 36px rgba(15,23,42,.20);padding:4px}
.sug__item{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:8px 10px;
border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:14px;cursor:pointer;text-align:left}
.sug__item:hover,.sug__item[aria-selected=true]{background:var(--brand-soft)}
.sug__name{font-weight:600}
.sug__meta{font-size:12px;color:var(--muted);white-space:nowrap}
.sug__empty{padding:10px;font-size:13px;color:var(--muted)}
/* ---------- misc ---------- */
.mt-10{margin-top:10px}.mt-12{margin-top:12px}.mt-18{margin-top:18px}
.w-70{width:70px}.w-120{width:120px}
.gap-12{gap:12px}
.lbl--flat{margin:0}
.inline-row{display:flex;align-items:center;gap:6px}
.bak-actions{display:flex;flex-wrap:wrap;gap:8px}
.chk{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--text2);cursor:pointer;user-select:none}
.chk input{width:18px;height:18px;accent-color:var(--brand);cursor:pointer}
.hintbox{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
background:var(--surface2);border:1px solid var(--border2);border-radius:var(--r-sm);padding:10px 12px}
.hint{font-size:12px;color:var(--muted)}
.pager{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.pager__num{min-width:34px;justify-content:center}
.pager__num[aria-current=page]{background:var(--brand);border-color:var(--brand);color:#fff}
.foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;
margin-top:14px;padding-top:13px;border-top:1px solid var(--border2)}
.note{margin-top:12px;border:1px solid var(--border);border-radius:var(--r-sm);overflow-x:auto;overflow-y:hidden;background:var(--amber-soft);
border-left:3px solid var(--red)}
.note__head{display:flex;justify-content:space-between;gap:10px;padding:7px 12px;font-size:11px;font-weight:700;
letter-spacing:.05em;text-transform:uppercase;color:var(--amber-text);border-bottom:1px solid var(--border)}
.note table{background:transparent}
.note th{background:transparent}
.note td{height:34px;padding:4px 10px;border-bottom:1px dashed var(--border)}
/* 2.14.0 (giai đoạn 4, M6): hàng đang nhập (Bán lẻ, Thuốc chén, Nhập hàng) cao theo nội dung, không ép 34px; ô nhập block để đáy thẳng với nút +. Đặt SAU .note td (độ cụ thể cao hơn). Dòng đã thêm không đổi. */
.note .note__pending tr.is-row>td{height:auto;vertical-align:bottom}
.note .note__pending tr.is-row>td .inp{display:block}
.note tbody tr:hover{background:transparent}
.note tfoot td{height:40px;border-top:2px solid var(--border);border-bottom:0;font-weight:800}
.note .foot{margin:0;padding:8px 12px}
.note .r{text-align:right}
.chart{display:block;width:100%;height:300px;cursor:pointer}
/* 2.13.2: đầu thẻ Thống kê có số liệu; ô năm một khung; dòng dữ liệu tháng + hai ô màu (màu = màu cột). */
#chartBox>summary.chart-head{flex-wrap:wrap;row-gap:6px}
.chart-head__stats{display:flex;gap:14px;margin-left:auto;align-items:center}
.chart-head__c{display:flex;flex-direction:column;align-items:flex-end;min-width:0}
.chart-head__c>span{display:block}
.chart-head__c .stat__v{font-size:15px;margin-top:0}
.chart-year{display:flex;justify-content:flex-end}
.chart-year__box{display:inline-flex;align-items:center;gap:8px;padding:4px 10px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);cursor:text}
.chart-year__box:focus-within{box-shadow:var(--ring)}
.chart-year__k{font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted)}
.chart-year__in{width:88px;border:0;background:transparent;color:var(--text);font:inherit;font-size:14px;font-weight:700;padding:2px 0;text-align:right;font-variant-numeric:tabular-nums}
.chart-year__in:focus{outline:none}
.chart-tip{display:flex;margin-top:10px;min-height:28px;font-size:13px;color:var(--text2)}
.chart-tip__m{font-weight:700;color:var(--text);font-variant-numeric:tabular-nums}
.chart-chip{display:inline-flex;align-items:center;gap:7px;font-weight:700;font-size:13px;font-variant-numeric:tabular-nums;color:var(--text)}
.chart-chip__sw{display:inline-block;width:12px;height:12px;border-radius:3px;flex:0 0 12px}
.chart-chip--imp .chart-chip__sw{background:var(--chart-imp)}
.chart-chip--exp .chart-chip__sw{background:var(--chart-exp)}
.chart-chip__k{font-weight:600;color:var(--text2);min-width:2.2em}
/* 2.15.0: chú giải tháng – mỗi dòng "[ô màu] Nhập  số tiền"; ô năm nằm cùng hàng tiêu đề Thống kê. */
.chart-tip{flex-direction:row;flex-wrap:wrap;align-items:center;gap:4px 12px}
#chartBox>summary.chart-head .chart-year{margin-left:auto}
#chartBox>summary.chart-head .chart-head__stats{margin-left:0}
@media (max-width:600px){
#chartBox>summary.chart-head .chart-head__stats{width:100%;margin-left:0;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.chart-head__c{align-items:flex-start}
.chart-tip{gap:4px 10px}
.chart-chip{font-size:13px;gap:5px}
.chart-chip__k{min-width:0}
}
/* ---------- toast ---------- */
.toast{position:fixed;z-index:120;left:50%;bottom:22px;transform:translate(-50%,150%);
opacity:0;visibility:hidden;
display:flex;align-items:center;gap:10px;max-width:calc(100% - 32px);
padding:11px 16px;border-radius:12px;background:#111827;color:#f8fafc;font-size:14px;font-weight:500;
box-shadow:0 16px 40px rgba(0,0,0,.35);transition:transform .26s ease,opacity .26s ease;pointer-events:none}
.toast.is-on{transform:translate(-50%,0);opacity:1;visibility:visible}
.toast .ico{color:#34d399}
.toast[data-kind=error] .ico{color:#fbbf24}
.toast .toast__warn{display:none}
.toast[data-kind=error] .toast__warn{display:inline-block}
.toast[data-kind=error] .toast__ok{display:none}
/* N2 (2.13.0): điện thoại – thông báo hiện ở ĐẦU màn hình, dưới thanh header (kể cả safe-area), trượt từ trên xuống. Đặt SAU quy tắc gốc. */
@media (max-width:600px){
.toast{top:calc(env(safe-area-inset-top,0px) + 64px);bottom:auto;transform:translate(-50%,-150%)}
.toast.is-on{transform:translate(-50%,0)}
}
/* ---------- dialog ---------- */
.dlg{border:0;padding:0;background:transparent;max-width:min(440px,calc(100% - 24px));width:100%;
max-height:calc(100dvh - 24px);overflow:auto}
.dlg::backdrop{background:rgba(10,15,26,.6)}
.dlg__card{width:100%}
.dlg--wide{max-width:min(640px,calc(100% - 24px))}
.note td.num{white-space:nowrap}
.dlg__foot{display:flex;justify-content:flex-end;gap:8px}
/* N2: khung lỗi trong hộp thoại (role=alert), tạo bằng JS khi có toast lỗi lúc hộp thoại mở. */
.dlg__err{margin:0 0 12px;padding:9px 12px;border-radius:10px;border:1px solid var(--red-text);background:var(--red-soft);color:var(--red-text);font-size:14px;font-weight:600;line-height:1.4}
/* 2.14.0 (giai đoạn 1) Bán lẻ: tiêu đề là thanh (bar); summary ẩn trực quan nhưng còn tên truy cập; dòng nhập nằm trong tờ ghi. */
#retailBox>summary.sr-summary{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:-1px;padding:0;border:0}
.card__bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--border2)}
.card__bar-title{display:inline-flex;align-items:center;gap:7px;font-weight:800;font-size:15px;color:var(--text);margin-right:auto}
.card__bar-title .ico{width:20px;height:20px}
.card__bar-search{flex:1 1 220px;min-width:0;margin:0}
.card__bar-date{flex:0 0 150px;min-width:0}
.card__bar-date .inp{padding-right:34px}
#retailNote table{table-layout:fixed;width:100%}
#retailNote col.cg-num{width:36px}
#retailNote col.cg-qty{width:104px}
#retailNote col.cg-money{width:110px}
#retailNote col.cg-act{width:52px}
#retailNote .note__pending thead{display:none}
#retailNote .note__pending{margin:0}
.note__foot{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:10px 12px;border-top:1px solid var(--border2)}
.note__tot{font-size:14px;color:var(--text2)}
/* 2.14.0 N6: gợi ý đơn vị trong ô số lượng (chỉ hiển thị; không đổi giá trị). */
.qty-host{position:relative;display:block}
.qty-host>input{display:block}
.qty-hint{position:absolute;left:7px;top:50%;transform:translateY(-50%);font-size:10.5px;color:var(--muted);pointer-events:none;white-space:nowrap}
/* 2.14.0 S2: hết chỗ trong ô → gợi ý lên dòng nhãn, mép phải (định vị theo td.c-qty); ngoài bảng thì ngay trên ô. Sau quy tắc gốc. */
.qty-host.qty-host--lbl{position:static}
.qty-hint.qty-hint--label{left:auto;right:0;top:0;transform:none;line-height:12px;background:transparent;text-align:right}
.qty-hint.qty-hint--above{top:-14px}
td.c-qty{position:relative}
/* 2.14.0 S1: không còn padding-left cố định; JS đặt padding-left (class .has-hint) chỉ khi gợi ý đang hiện và còn đủ chỗ. */
.note__tot b{font-size:16px}
/* 2.14.0 (giai đoạn 2a) Thuốc chén: cùng mẫu Bán lẻ – summary ẩn, thanh tiêu đề, dòng nhập trong tờ ghi, chân một hàng. */
#remedyBox>summary.sr-summary{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:-1px;padding:0;border:0}
.card__bar-preset{flex:1 1 180px;min-width:0}
#remedyNote{overflow:visible}
#remedyNote .note__search{padding:8px 10px;border-bottom:1px dashed var(--border)}
#remedyNote .note__search .inp{width:100%}
#remedyNote table{table-layout:fixed;width:100%}
#remedyNote col.cg-num{width:36px}
#remedyNote col.cg-qty{width:84px}
#remedyNote col.cg-act{width:52px}
#remedyNote .note__pending thead{display:none}
#remedyNote .note__pending{margin:0}
.note__pending tr.is-empty{display:none}
#remedyNote .note__foot{display:block;padding:8px 10px;border-top:1px solid var(--border2)}
.note__row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;justify-content:flex-end}
.note__row+.note__row{margin-top:8px}
.note__row:first-child{justify-content:flex-start}
.note__row--aux:not(:has(.btn:not([hidden]))){display:none}
.note__row--aux{margin-top:8px}
.note__name{flex:1 1 160px;min-width:0}
.note__lbl{font-size:13px;color:var(--text2)}
/* 2.14.0 (giai đoạn 2b) Nhập hàng: thanh tiêu đề có tên + ô tìm; dòng đang nhập và tờ ghi luôn hiện; chân một hàng. */
#nhapBox>summary.sr-summary{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:-1px;padding:0;border:0}
#nhapListBox table{table-layout:fixed;width:100%}
#nhapListBox col.cg-num{width:36px}
#nhapListBox col.cg-qty{width:84px}
#nhapListBox col.cg-money{width:110px}
#nhapListBox col.cg-act{width:52px}
#nhapListBox .note__pending thead{display:none}
#nhapListBox .note__pending{margin:0}
#nhapListBox .note__foot{padding:10px 12px}
.nhap-pend__name{font-weight:600;overflow-wrap:anywhere}
.nhap-pend__name.is-muted{color:var(--muted);font-weight:400}
.nhap-pend__tot{float:right;font-size:13px}
.nhap-hint{font-size:11px;margin:4px 0 0;text-align:left}
#nhapListBox .note__pending tr.is-row>td{align-self:end}
#nhapListBox .note__pending .nhap-add{height:36px;min-height:36px;width:36px;min-width:36px;display:block;margin-left:auto}
/* 2.14.0 (giai đoạn 4, M8): máy tính – nút + dòng đang nhập (Bán lẻ, Thuốc chén, Nhập hàng) 36×36 bằng ô inp--sm. Điện thoại ghi đè 44×44 ở khối ≤600px phía sau. */
.note__pending tr.is-row .btn--icon{width:36px;min-width:36px;height:36px;min-height:36px;padding:0}
#nhapListBox .note__foot{margin-top:8px}
/* 2.14.0 (giai đoạn 3): Kho tồn, Lịch sử nhập, Lịch sử bán – thanh một hàng, không nhãn chữ; số liệu nhỏ trong thanh. */
#invBox>summary.sr-summary,#impBox>summary.sr-summary,#expBox>summary.sr-summary,#backupBox>summary.sr-summary{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:-1px;padding:0;border:0}
.card__bar-month{flex:0 0 130px;min-width:0}
.card__bar-search.is-inline{flex:1 1 220px}
.card__bar-count{font-size:12px;color:var(--muted);margin-left:auto;white-space:nowrap}
.card__bar-btn{flex:0 0 auto}
.card__bar>.inp.card__bar-search{flex:1 1 220px;min-width:0}
@media (max-width:600px){
.card__bar-month{order:2}
.card__bar-btn{order:2}
.card__bar-lbl{display:none}
/* 2.15.0: điện thoại – ô tìm nằm cùng hàng tiêu đề (giữa tên mục và ô ngày/tháng); không đủ chỗ thì ô ngày/tháng xuống hàng dưới. */
.card__bar{gap:6px}
.card__bar-search,.card__bar-search.is-inline,.card__bar>.inp.card__bar-search{order:1;flex:1 1 80px;min-width:0}
.card__bar-title{margin-right:0;flex:0 0 auto}
.card__bar-count{order:4;margin-left:0}
/* 2.14.0 (giai đoạn 4, M3c): phân trang điện thoại gọn – nút cao 36px (vùng bấm do khoảng cách), khoảng cách 4px. */
.pager{gap:4px}
.pager .btn--sm{min-height:36px}
}
#remedyNote .note__foot>.note__name{display:block;width:100%;margin:0 0 8px}
#remedyNote>.note__list>table:has(#remedyNoteBody:empty)>thead{display:none}
#remedyNote:has(#remedyBody tr[data-pid])>.note__list>table>thead{display:table-header-group}
@media (max-width:600px){
#remedyBox .card__bar-preset{order:1;flex:1 1 90px;min-width:90px}
/* 2.15.1: ô chọn đơn lấy phần chỗ thừa, không hẹp hơn chữ "Đơn mới" (61px chữ + đệm/mũi tên ≈ 87px); ô ngày xuống hàng khi không đủ chỗ (320px). */
/* 2.15.0: điện thoại – Lưu đơn | Bán đơn đúng một hàng; Xóa/Sao chép đơn hàng phụ nhỏ ở trên (chỉ hiện khi có nút). */
#remedyNote .note__row--btns{flex-wrap:nowrap;gap:6px}
#remedyNote .note__row--btns .btn{flex:1 1 0;min-width:0;min-height:44px;padding-left:8px;padding-right:8px;white-space:nowrap;overflow:hidden}
#remedyNote .note__row--btns .btn .ico{display:none}
#remedyNote .note__row--btns #remedySaveLabel{overflow:hidden;min-width:0}
#remedyNote .note__row--aux .btn{flex:1 1 0;min-height:34px}
#remedyNote .note__row--aux{margin-top:6px}
#remedyNote .note__row--aux .btn{white-space:nowrap;padding-left:8px;padding-right:8px}
#remedyNote .note__row--aux .btn .ico{display:none}
#remedyNote .note__row--btns{margin-top:3px}
/* dòng 1 của chân: [Tổng · vị]  [= tiền]; dòng 2: thang × giá (tối đa 2 dòng thay vì 3). */
#remedyNote .note__row:first-child{gap:6px 8px}
#remedyNote .note__row:first-child .note__tot{order:1}
#remedyNote .note__row:first-child #remedyQty{order:2}
#remedyNote .note__row:first-child .note__eq{order:3;margin-left:auto}
#remedyNote .note__row:first-child #remedyTotal{order:4}
#remedyNote .note__row:first-child .inline-row{order:5;flex:1 0 100%}
}
@media (max-width:600px){
.card__bar-date{order:2;flex:0 0 122px;margin-left:auto}
.card__bar-date .inp{padding-left:8px;padding-right:26px}
.card__bar-date .datefield__ico{right:6px;width:16px;height:16px}
.card__bar-month .inp{padding-left:8px}
}
@media (max-width:400px){
.card__bar-title .ico{display:none}
/* 2.15.2: ô ngày Thuốc chén – dd/mm/yyyy cỡ 16px rộng ~81px; vùng chữ = 118 - viền 2 - đệm 6 - 24 = 86px. Thanh gọn lại (đệm 10, khe 4) để tiêu đề + ô chọn đơn (>=90) + ô ngày vẫn một hàng ở 375px. */
#remedyBox .card__bar{padding-left:10px;padding-right:10px;gap:4px}
#remedyBox .card__bar-date{flex:0 0 118px}
#remedyBox .card__bar-date .inp{padding-left:6px;padding-right:24px}
/* 2.15.1: chú giải tháng cùng một hàng ở 375px kể cả số lớn. */
.chart-tip,.chart-tip__m{font-size:12px}
.chart-chip{font-size:12px;gap:4px}
}
/* ---------- responsive ---------- */
@media (max-width:900px){
.grid2{grid-template-columns:1fr}
}
@media (max-width:640px){
.wrap{padding:0 12px}
.bar{min-height:56px}
.brand{font-size:15px}
#syncBadge{flex:1 1 100%;order:99;margin:.5rem 0 0;max-width:none}
.card__body{padding:13px}
.btn{min-height:44px}
.btn--sm{min-height:38px}
.inp{min-height:44px;font-size:16px}
/* 2.15.3: chân tờ ghi (Tổng + Bán đơn) là thanh position:fixed ở đáy MÀN HÌNH (sticky chỉ dính khi đáy tờ ghi còn dưới màn hình). JS (initFootBars) đặt .foot-fixed trên #retailBox/#remedyBox
   khi thẻ đang mở trên điện thoại, và .foot-off khi tờ ghi ra khỏi vùng nhìn hoặc đang gõ/bàn phím hiện. Chừa chỗ ở đáy thẻ bằng padding = chiều cao thanh (--foot-h). z-index thấp hơn .top (30), gợi ý (40), toast/hộp thoại. */
#retailBox,#remedyBox{overflow:visible}
#retailNote{overflow:visible}
#retailBox.foot-fixed>.card__body,#remedyBox.foot-fixed>.card__body{padding-bottom:calc(var(--foot-h,72px) + 8px)}
#retailBox.foot-fixed #retailNote .note__foot,#remedyBox.foot-fixed #remedyNote .note__foot{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);border-top:1px solid var(--border);box-shadow:0 -2px 10px rgba(15,23,42,.12);padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}
#retailBox.foot-fixed.foot-off #retailNote .note__foot,#remedyBox.foot-fixed.foot-off #remedyNote .note__foot{display:none}
#remedyBox.foot-fixed #remedyNote .note__foot{padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))}
html{scroll-padding-bottom:230px}
/* 2.15.6/2.15.8: đang nhập: danh sách đã ghi gọn còn vùng cao đúng 2 dòng cuối (JS đặt max-height), cuộn được; mép trên mờ dần như guồng nước. */
.kb-compact .note__list{overflow-y:auto;-webkit-mask-image:linear-gradient(to bottom,transparent 0,black 12px);mask-image:linear-gradient(to bottom,transparent 0,black 12px)}
/* 2.15.8: JS đặt --kb-pad cố định (60% chiều cao cửa sổ) để trang đủ dài cuộn tới vị trí định vị, không theo số đo bàn phím. */
body{padding-bottom:calc(48px + var(--kb-pad,0px))}
#retailBody tr[data-pid],#remedyBody tr[data-pid]{scroll-margin-top:8px;scroll-margin-bottom:72px}
.chart{height:260px}
}
@media (max-width:600px){
.tw{overflow-x:visible}
table.ord,table.inv,table.his{display:block;min-width:0}
table.ord thead,table.inv thead,table.his thead{display:none}
table.ord tbody,table.inv tbody,table.his tbody{display:block}
table.ord tr,table.inv tr,table.his tr{display:block}
table.ord td,table.inv td,table.his td{display:block;width:auto;padding:0;border:0}
table.ord tr.is-row,table.inv tr.is-row,table.his tr.is-row{display:grid;gap:7px 10px;align-items:center;
padding:6px 2px;border-bottom:1px solid var(--border2)}
table.ord tr.is-row{grid-template-columns:24px minmax(0,1fr) minmax(0,1fr) 46px}
table.ord tr.is-row>td:nth-child(1){grid-area:1/1;text-align:left}
table.ord tr.is-row>td:nth-child(2){grid-area:1/2/2/5;min-width:0;overflow-wrap:anywhere}
table.ord tr.is-row>td:nth-child(3){grid-area:2/2}
table.ord tr.is-row>td:nth-child(4){grid-area:2/3}
table.ord tr.is-row>td:nth-child(5){grid-area:2/4;justify-self:end;align-self:end}
/* 2.12.1: nút + ở cột cuối đúng hàng 2 (thẳng hàng đáy ô nhập), vuông 44px. Đặt SAU quy tắc gốc cùng bộ chọn. */
table.ord tr.is-row>td:nth-child(5) .btn{width:44px;min-width:44px;height:44px;min-height:44px;padding:0}
/* 2.14.0 (giai đoạn 4, M7): Thuốc chén điện thoại – dòng đang nhập chỉ 4 ô (STT, tên, gram, +): gram chiếm 2 cột 1fr (2/2–3/4), nút + ở cột 46px cuối (2/4), đáy căn theo hàng, 44×44. Đặt SAU quy tắc chung table.ord. */
#remedyNote .note__pending tr.is-row>td:nth-child(3){grid-area:2/2/3/4}
#remedyNote .note__pending tr.is-row>td:nth-child(4){grid-area:2/4;justify-self:end;align-self:end}
#remedyNote .note__pending tr.is-row>td:nth-child(4) .btn{width:44px;min-width:44px;height:44px;min-height:44px;padding:0}
/* 2.14.0 (giai đoạn 4, M8): điện thoại – nút + dòng đang nhập giữ 44×44 (ghi đè quy tắc máy tính 36px ở trên). */
#nhapListBox .note__pending .nhap-add{height:44px;min-height:44px;width:44px;min-width:44px}
table.ord tr.is-row>td.c-qty::before,table.ord tr.is-row>td.c-money::before,
table.inv tr.is-row>td:nth-child(2)::before,table.inv tr.is-row>td:nth-child(3)::before,
table.inv tr.is-row>td:nth-child(4)::before,
table.his tr.is-row>td:nth-child(3)::before,table.his tr.is-row>td:nth-child(4)::before,
table.his tr.is-row>td:nth-child(5)::before{content:attr(data-label);display:block;font-size:10px;font-weight:700;
letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-bottom:3px}
/* 2.14.0 (giai đoạn 4, M3a): Kho tồn điện thoại – hàng 1 tên + nút …; hàng 2 ba số liệu một dòng có nhãn nhỏ. Ước tính ≈52px (≤60). */
table.inv tr.is-row{grid-template-columns:minmax(0,1fr) auto auto auto;column-gap:10px;row-gap:2px;padding:4px 2px}
table.inv tr.is-row>td:nth-child(1){grid-area:1/1/2/4;min-width:0;overflow-wrap:anywhere}
table.inv tr.is-row>td:nth-child(5){grid-area:1/4/3/5;justify-self:end;align-self:center}
table.inv tr.is-row>td:nth-child(2){grid-area:2/1}
table.inv tr.is-row>td:nth-child(3){grid-area:2/2}
table.inv tr.is-row>td:nth-child(4){grid-area:2/3;text-align:left}
table.inv tr.is-row>td:nth-child(2)::before,table.inv tr.is-row>td:nth-child(3)::before,table.inv tr.is-row>td:nth-child(4)::before{display:inline;margin:0 4px 0 0;font-size:10px;letter-spacing:0;text-transform:none}
table.inv tr.is-row>td.c-del .btn--icon{width:34px;min-width:34px;height:34px;min-height:34px;padding:0;position:relative}
table.inv tr.is-row>td.c-del .btn--icon::after{content:"";position:absolute;inset:-3px}
/* 2.14.0 (giai đoạn 4, M3b): Lịch sử điện thoại – hàng 1 tên + ngày + …; hàng 2 SL, đơn giá, thành tiền (không nhãn chữ). Ước tính ≈49px (≤52). */
table.his tr.is-row{grid-template-columns:minmax(0,1fr) auto auto auto;column-gap:10px;row-gap:2px;padding:4px 2px}
table.his tr.is-row>td:nth-child(2){grid-area:1/1/2/3;min-width:0;overflow-wrap:anywhere}
table.his tr.is-row>td:nth-child(1){grid-area:1/3;font-size:11px;text-align:right;white-space:nowrap}
table.his tr.is-row>td:nth-child(6){grid-area:1/4/3/5;justify-self:end;align-self:center}
table.his tr.is-row>td:nth-child(3){grid-area:2/1}
table.his tr.is-row>td:nth-child(4){grid-area:2/2}
table.his tr.is-row>td:nth-child(5){grid-area:2/3;text-align:right}
table.his tr.is-row>td:nth-child(3)::before,table.his tr.is-row>td:nth-child(4)::before,table.his tr.is-row>td:nth-child(5)::before{content:none}
table.his tr.is-row>td.c-act .btn--icon{width:34px;min-width:34px;height:34px;min-height:34px;padding:0;position:relative}
table.his tr.is-row>td.c-act .btn--icon::after{content:"";position:absolute;inset:-3px}
table.ord tr.is-empty td,table.inv tr.is-empty td,table.his tr.is-empty td{display:block;padding:18px 4px;
text-align:center;border-bottom:1px solid var(--border2)}
table.ord .inp{width:100%}
table.inv .c-del,table.his .c-act{width:auto}
.note .c-act{width:76px}
.note td,.note th{padding-left:5px;padding-right:5px}
/* 2.14.0 M4: điện thoại – ẩn hàng tiêu đề cột của tờ ghi (mỗi ô đã có nhãn riêng); máy tính giữ. */
.note>table>thead,.note>.note__list>table>thead{display:none}
.note .c-act .btn--icon{min-width:32px;width:32px;min-height:32px;height:32px}
}
@media (min-width:601px){
table.his th:nth-child(4),table.his th:nth-child(5),
table.his td:nth-child(4),table.his td:nth-child(5){text-align:right}
}
/* 2.10.0: tab. 8 <details> giữ nguyên DOM; chỉ mục đang mở hiện (toàn chiều rộng), các mục khác ẩn. */
.main>.grid2{display:contents}
.main>details.card,.main>.grid2>details.card{margin-top:0}
.main>details.card:not([open]),.main>.grid2>details.card:not([open]){display:none}
.main>details.card[open]>summary.card__head,.main>.grid2>details.card[open]>summary.card__head{cursor:default}
.main>details.card[open]>summary.card__head:hover,.main>.grid2>details.card[open]>summary.card__head:hover{background:var(--surface)}
.main>details.card>summary.card__head>.chev,.main>.grid2>details.card>summary.card__head>.chev{display:none}
.tabs{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;margin-bottom:12px}
.tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;min-width:0;min-height:44px;padding:5px 6px;
border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);color:var(--text2);font:inherit;
font-size:13px;font-weight:600;line-height:1.2;text-align:center;cursor:pointer}
.tab:hover{background:var(--surface2);color:var(--text)}
.tab:focus-visible{outline:none;box-shadow:var(--ring)}
.tab.is-active{background:var(--brand);border-color:var(--brand);color:#fff}
@media (max-width:600px){
.tabs{grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.tab{min-height:44px;padding:4px 2px;font-size:12px}
}
/* 2.15.8 (máy tính >640px): biểu tượng cạnh nhãn hai hàng (cùng icon với tiêu đề thẻ); điện thoại giữ chữ hai dòng, ẩn icon. */
.tab__ic{display:none}
@media (min-width:641px){
.tab{display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto;column-gap:6px;justify-content:center;align-content:center;justify-items:center;padding:5px 4px}
.tab__ic{display:block;grid-row:1/3;grid-column:1;align-self:center;width:16px;height:16px;vertical-align:0}
.tab__l1{grid-column:2;grid-row:1}
.tab__l2{grid-column:2;grid-row:2}
}
/* 2.14.0 S1 (máy tính): cột SL của tờ ghi và dòng đang nhập rộng 152px → ô nhập 132px, vùng chữ ≥ 56px khi có gợi ý. Đặt SAU mọi quy tắc cg-qty ở trên. */
@media (min-width:601px){
#retailNote col.cg-qty,#remedyNote col.cg-qty,#nhapListBox col.cg-qty{width:152px;min-width:152px}
}
@media (prefers-reduced-motion:reduce){
*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}
}
</style>
<script>
(function(){
  var d=document.documentElement,m='system';
  try{m=localStorage.getItem('theme_mode')||'system';}catch(e){}
  var dark=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  d.setAttribute('data-theme',dark?'dark':'light');
  window.__THEME__=m;
  window.__DB__=%%BOOT%%;
  window.__NEED_FETCH__=%%NEEDFETCH%%;
})();
</script>
</head>
<body>
<a class="skip" href="#main">Bỏ qua điều hướng</a>
<svg class="sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<symbol id="i-yin" viewBox="0 0 512 512"><circle cx="256" cy="256" r="256" fill="#fff" stroke="none"/><path fill="#000" stroke="none" d="M256 64c53 0 96 43 96 96s-43 96-96 96s-96 43-96 96s43 96 96 96c-106 0-192-86-192-192S150 64 256 64m0 448a256 256 0 1 0 0-512a256 256 0 1 0 0 512m32-352a32 32 0 1 0-64 0a32 32 0 1 0 64 0m-64 192a32 32 0 1 1 64 0a32 32 0 1 1-64 0"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/></symbol>
<symbol id="i-save" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></symbol>
<symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></symbol>
<symbol id="i-moon" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/></symbol>
<symbol id="i-chart-col" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M8 17V9M13 17V5M18 17v-4"/></symbol>
<symbol id="i-receipt" viewBox="0 0 24 24"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2z"/><path d="M9 7h6M9 11h6"/></symbol>
<symbol id="i-mortar" viewBox="0 0 24 24"><path d="M3 10h18v2a9 9 0 0 1-18 0v-2z"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></symbol>
<symbol id="i-cloud-down" viewBox="0 0 24 24"><path d="M12 13v8M8 17l4 4 4-4"/><path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 4 15.3"/></symbol>
<symbol id="i-cart" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></symbol>
<symbol id="i-cash" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
<symbol id="i-warn" viewBox="0 0 24 24"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></symbol>
<symbol id="i-edit" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></symbol>
<symbol id="i-dots" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></symbol>
<symbol id="i-chev-r" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></symbol>
<symbol id="i-swap" viewBox="0 0 24 24"><path d="M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8"/></symbol>
<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></symbol>
</svg>
<header class="top">
  <div class="wrap bar">
    <div class="brand-wrap">
      <div class="menu">
        <button class="brand__yin" type="button" id="themeBtn" data-action="theme-menu" aria-haspopup="true" aria-expanded="false" aria-controls="themeMenu" aria-label="Đổi giao diện sáng hoặc tối" title="Sáng / Tối">
          <svg class="ico" aria-hidden="true"><use href="#i-yin"/></svg>
        </button>
        <span class="sr" id="themeLabel">Theo máy</span>
        <div class="menu__list" id="themeMenu" role="menu" aria-labelledby="themeBtn" hidden>
          <button class="menu__item" type="button" role="menuitemradio" data-theme-set="light" aria-checked="false">
            <svg class="ico" aria-hidden="true"><use href="#i-sun"/></svg>Sáng
          </button>
          <button class="menu__item" type="button" role="menuitemradio" data-theme-set="dark" aria-checked="false">
            <svg class="ico" aria-hidden="true"><use href="#i-moon"/></svg>Tối
          </button>
          <button class="menu__item menu__item--sub" type="button" role="menuitemradio" data-theme-set="system" aria-checked="true">Theo máy</button>
        </div>
      </div>
      <button class="brand" type="button" id="brandBtn" data-action="brand-devices" aria-describedby="brandNote">Quản Lý Kho</button>
    </div>
    <div class="bar__actions">
      <div class="sync-badge" id="syncBadge" role="status" hidden>Chưa đồng bộ</div>
      <button class="btn btn--sm" id="reloadBtn" type="button" data-action="reload-app" aria-label="Tải lại ứng dụng" title="Tải lại" hidden>
        <svg class="ico" aria-hidden="true"><use href="#i-cloud-down"/></svg>Tải lại
      </button>
      <button class="btn btn--sm sync-discard" id="syncDiscard" type="button" data-action="sync-discard" hidden>Bỏ thay đổi chưa gửi, lấy bản máy chủ</button>
    </div>
  </div>
  <p class="sr" id="brandNote" role="status" aria-live="polite"></p>
</header>

<main id="main" class="wrap main">
  <h1 class="sr">Quản lý kho dược liệu</h1>

  <section class="stats" aria-label="Bán và lợi nhuận tháng">
    <div class="stats__c">
      <p class="stat__k">Bán trong tháng</p>
      <p class="stat__v" id="statExport">0</p>
      <p class="stat__sub"><span>Hôm nay <b id="statExportDay">0</b></span><span>Năm <b id="statExportYear">0</b></span></p>
    </div>
    <div class="stats__c">
      <p class="stat__k">Lợi nhuận tháng</p>
      <p class="stat__v" id="statProfit">0</p>
      <p class="stat__sub"><span>Hôm nay <b id="statProfitDay">0</b></span><span>Năm <b id="statProfitYear">0</b></span></p>
    </div>
  </section>

  <nav class="tabs" id="tabs" role="tablist" aria-label="Chọn mục">
    <button type="button" class="tab" role="tab" data-tab="retailBox" aria-controls="retailBox" aria-selected="false" aria-label="Bán lẻ"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-receipt"/></svg><span class="tab__l1">Bán</span><span class="tab__l2">lẻ</span></button>
    <button type="button" class="tab" role="tab" data-tab="remedyBox" aria-controls="remedyBox" aria-selected="false" aria-label="Thuốc chén"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-mortar"/></svg><span class="tab__l1">Thuốc</span><span class="tab__l2">chén</span></button>
    <button type="button" class="tab" role="tab" data-tab="nhapBox" aria-controls="nhapBox" aria-selected="false" aria-label="Nhập hàng"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-cart"/></svg><span class="tab__l1">Nhập</span><span class="tab__l2">hàng</span></button>
    <button type="button" class="tab" role="tab" data-tab="invBox" aria-controls="invBox" aria-selected="false" aria-label="Kho tồn"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-warehouse"/></svg><span class="tab__l1">Kho</span><span class="tab__l2">tồn</span></button>
    <button type="button" class="tab" role="tab" data-tab="impBox" aria-controls="impBox" aria-selected="false" aria-label="Lịch sử nhập hàng"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-cart"/></svg><span class="tab__l1">Lịch sử</span><span class="tab__l2">nhập</span></button>
    <button type="button" class="tab" role="tab" data-tab="expBox" aria-controls="expBox" aria-selected="false" aria-label="Lịch sử bán hàng"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-cash"/></svg><span class="tab__l1">Lịch sử</span><span class="tab__l2">bán</span></button>
    <button type="button" class="tab" role="tab" data-tab="chartBox" aria-controls="chartBox" aria-selected="false" aria-label="Thống kê"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-chart-col"/></svg><span class="tab__l1">Thống</span><span class="tab__l2">kê</span></button>
    <button type="button" class="tab" role="tab" data-tab="backupBox" aria-controls="backupBox" aria-selected="false" aria-label="Sao lưu &amp; khôi phục"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-save"/></svg><span class="tab__l1">Sao lưu</span><span class="tab__l2">khôi phục</span></button>
  </nav>

  <div class="grid2">
    <details class="card" id="retailBox">
      <summary class="card__head sr-summary">
        <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
        <svg class="ico txt-green" aria-hidden="true"><use href="#i-receipt"/></svg>
        <h2 class="card__title">Bán lẻ</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-green" aria-hidden="true"><use href="#i-receipt"/></svg>Bán lẻ</span>
          <div class="sug card__bar-search">
            <input class="inp" id="retailSearch" type="search" autocomplete="off" placeholder="Nhập tên" aria-label="Tìm vị thuốc để bán" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="retailList">
            <div class="sug__list" id="retailList" role="listbox" aria-label="Gợi ý vị thuốc" hidden></div>
          </div>
          <div class="datefield card__bar-date">
            <input class="inp" id="retailDate" type="text" inputmode="numeric" autocomplete="off" placeholder="dd/mm/yyyy" maxlength="10" aria-label="Ngày bán" title="Ngày ghi nhận đơn, mặc định là hôm nay">
            <svg class="ico datefield__ico" aria-hidden="true"><use href="#i-calendar"/></svg>
            <input class="datefield__native" id="retailDateNative" type="date" tabindex="-1" aria-label="Chọn ngày từ lịch">
          </div>
        </div>
        <div class="note" id="retailNote">
          <div class="note__head"><span>Tờ ghi đơn bán lẻ</span><span id="retailNotePg"></span></div>
          <div class="note__list" id="retailNoteList">
          <table>
            <caption class="sr">Tờ ghi đơn bán lẻ</caption>
            <colgroup><col class="cg-num"><col class="cg-name"><col class="cg-qty"><col class="cg-money"><col class="cg-act"></colgroup>
            <thead><tr>
              <th class="c-num" scope="col">STT</th>
              <th scope="col">Tên</th>
              <th scope="col">SL</th>
              <th scope="col" class="r">Thành tiền</th>
              <th class="c-act" scope="col"><span class="sr">Thao tác</span></th>
            </tr></thead>
            <tbody id="retailNoteBody"></tbody>
          </table>
          </div>
          <div class="tw note__pending">
            <table class="ord">
              <caption class="sr">Dòng đang nhập đơn bán lẻ</caption>
              <colgroup><col class="cg-num"><col class="cg-name"><col class="cg-qty"><col class="cg-money"><col class="cg-act"></colgroup>
              <thead><tr>
                <th class="c-num" scope="col">STT</th>
                <th scope="col">Tên</th>
                <th class="c-qty" scope="col">SL (kg)</th>
                <th class="c-money" scope="col">Thành tiền</th>
                <th class="c-del" scope="col"><span class="sr">Thêm</span></th>
              </tr></thead>
              <tbody id="retailBody"></tbody>
            </table>
          </div>
          <div class="foot" id="retailNotePager" hidden></div>
          <div class="note__foot">
            <span class="note__tot">Tổng <b class="txt-green" id="retailNoteTotal">0</b></span>
            <span class="sr" id="retailTotal">0</span>
            <button class="btn btn--green" type="button" data-action="save-retail" data-keep-focus>
              <svg class="ico" aria-hidden="true"><use href="#i-save"/></svg>Bán đơn
            </button>
          </div>
        </div>
      </div>
    </details>

    <details class="card" id="remedyBox">
      <summary class="card__head sr-summary">
        <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
        <svg class="ico txt-brand" aria-hidden="true"><use href="#i-mortar"/></svg>
        <h2 class="card__title">Thuốc chén</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-brand" aria-hidden="true"><use href="#i-mortar"/></svg>Thuốc chén</span>
          <select class="inp card__bar-preset" id="remedyPreset" aria-label="Đơn có sẵn">
            <option value="">Đơn mới</option>
          </select>
          <div class="datefield card__bar-date">
            <input class="inp" id="remedyDate" type="text" inputmode="numeric" autocomplete="off" placeholder="dd/mm/yyyy" maxlength="10" aria-label="Ngày bán" title="Ngày ghi nhận đơn, mặc định là hôm nay">
            <svg class="ico datefield__ico" aria-hidden="true"><use href="#i-calendar"/></svg>
            <input class="datefield__native" id="remedyDateNative" type="date" tabindex="-1" aria-label="Chọn ngày từ lịch">
          </div>
        </div>
        <div class="note" id="remedyNote">
          <div class="note__head"><span>Tờ ghi đơn thuốc chén</span><span id="remedyNotePg"></span></div>
          <div class="sug note__search">
            <input class="inp" id="remedySearch" type="search" autocomplete="off" placeholder="Nhập tên" aria-label="Tìm vị thuốc cho đơn thuốc chén" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="remedyList">
            <div class="sug__list" id="remedyList" role="listbox" aria-label="Gợi ý vị thuốc" hidden></div>
          </div>
          <div class="note__list" id="remedyNoteList">
          <table>
            <caption class="sr">Tờ ghi đơn thuốc chén</caption>
            <colgroup><col class="cg-num"><col class="cg-name"><col class="cg-qty"><col class="cg-act"></colgroup>
            <thead><tr>
              <th class="c-num" scope="col">STT</th>
              <th scope="col">Tên</th>
              <th scope="col">SL (gram)</th>
              <th class="c-act" scope="col"><span class="sr">Thao tác</span></th>
            </tr></thead>
            <tbody id="remedyNoteBody"></tbody>
          </table>
          </div>
          <div class="tw note__pending">
            <table class="ord">
              <caption class="sr">Dòng đang nhập vị thuốc cho đơn thuốc chén</caption>
              <colgroup><col class="cg-num"><col class="cg-name"><col class="cg-qty"><col class="cg-act"></colgroup>
              <thead><tr>
                <th class="c-num" scope="col">STT</th>
                <th scope="col">Tên</th>
                <th class="c-qty" scope="col">SL (gram)</th>
                <th class="c-del" scope="col"><span class="sr">Thêm vào tờ ghi</span></th>
              </tr></thead>
              <tbody id="remedyBody"></tbody>
            </table>
          </div>
          <div class="foot" id="remedyNotePager" hidden></div>
          <div class="note__foot">
            <div class="note__row">
              <span class="note__tot">Tổng <b class="txt-brand" id="remedyNoteTotal">0 g</b></span>
              <span class="hint" id="remedyQty">0 vị · 0 g</span>
              <span class="inline-row">
                <input class="inp inp--sm inp--num w-70" id="remedyThang" type="number" step="1" min="1" max="10000" inputmode="numeric" value="1" aria-label="Số thang">
                <span class="note__lbl" aria-hidden="true">thang ×</span>
                <input class="inp inp--sm inp--num w-120" id="remedyUnitPrice" type="number" step="any" min="0" max="1000000000" inputmode="decimal" placeholder="0" aria-label="Giá 1 thang" title="Giá 1 thang">
              </span>
              <span class="b txt-brand note__eq" aria-hidden="true">=</span>
              <span class="b txt-brand num" id="remedyTotal" aria-live="polite">0</span>
            </div>
            <input class="inp inp--sm note__name" id="remedyName" type="text" autocomplete="off" placeholder="Tên đơn mới" aria-label="Tên đơn mới" maxlength="200" hidden>
            <div class="note__row note__row--aux">
              <button class="btn btn--sm btn--danger" type="button" data-action="del-preset" id="remedyDelPreset" hidden>
                <svg class="ico" aria-hidden="true"><use href="#i-trash"/></svg>Xóa đơn
              </button>
              <button class="btn btn--sm" type="button" data-action="copy-preset" id="remedyCopyPreset" hidden>
                <svg class="ico" aria-hidden="true"><use href="#i-swap"/></svg>Sao chép đơn
              </button>
            </div>
            <div class="note__row note__row--btns">
              <button class="btn btn--sm" type="button" data-action="save-preset" id="remedySavePreset">
                <svg class="ico" aria-hidden="true"><use href="#i-save"/></svg><span id="remedySaveLabel">Lưu đơn</span>
              </button>
              <button class="btn btn--primary" type="button" data-action="save-remedy" data-keep-focus>
                <svg class="ico" aria-hidden="true"><use href="#i-cash"/></svg>Bán đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    </details>
  </div>
  <details class="card mt-18" id="nhapBox">
    <summary class="card__head sr-summary">
      <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
      <svg class="ico txt-blue" aria-hidden="true"><use href="#i-cart"/></svg>
      <h2 class="card__title">Nhập hàng</h2>
    </summary>
    <form class="card__body" id="nhapForm" novalidate>
      <div class="card__bar">
        <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-blue" aria-hidden="true"><use href="#i-cart"/></svg>Nhập hàng</span>
        <div class="sug card__bar-search">
          <input class="inp" id="nhapSearch" type="text" autocomplete="off" placeholder="Nhập tên" aria-label="Tìm vị thuốc để nhập" maxlength="200" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="nhapList">
          <div class="sug__list" id="nhapList" role="listbox" aria-label="Gợi ý vị thuốc" hidden></div>
        </div>
      </div>
      <div class="note" id="nhapListBox">
        <div class="note__head"><span>Tờ ghi nhập hàng</span><span id="nhapListCount"></span></div>
        <table>
          <caption class="sr">Danh sách vị thuốc chờ nhập</caption>
          <colgroup><col class="cg-num"><col class="cg-name"><col class="cg-qty"><col class="cg-money"><col class="cg-act"></colgroup>
          <thead><tr>
            <th class="c-num" scope="col">STT</th>
            <th scope="col">Tên</th>
            <th class="c-qty" scope="col">SL (kg)</th>
            <th class="c-money r" scope="col">Giá nhập</th>
            <th class="c-act" scope="col"><span class="sr">Thao tác</span></th>
          </tr></thead>
          <tbody id="nhapListBody"></tbody>
        </table>
        <div class="tw note__pending">
          <table class="ord">
            <caption class="sr">Dòng đang nhập hàng</caption>
            <colgroup><col class="cg-num"><col class="cg-name"><col class="cg-qty"><col class="cg-money"><col class="cg-act"></colgroup>
            <thead><tr>
              <th class="c-num" scope="col">STT</th>
              <th scope="col">Tên</th>
              <th class="c-qty" scope="col">SL (kg)</th>
              <th class="c-money" scope="col">Giá nhập (k/kg)</th>
              <th class="c-del" scope="col"><span class="sr">Thêm vào tờ ghi</span></th>
            </tr></thead>
            <tbody id="nhapPendingBody"><tr class="is-row">
              <td class="c-num num muted"></td>
              <td><span id="nhapPendName" class="nhap-pend__name is-muted">Chọn vị thuốc ở ô trên</span> <span class="note__tot nhap-pend__tot">Thành tiền <b class="txt-blue num" id="nhapTotal">0</b></span><p class="hint nhap-hint" id="nhapHint" hidden></p></td>
              <td class="c-qty" data-label="SL (kg)"><input class="inp inp--sm inp--num" id="nhapQty" type="number" step="any" min="0" max="1000000" inputmode="decimal" placeholder="0" aria-label="Số lượng (kg)"></td>
              <td class="c-money" data-label="Giá nhập (k/kg)"><input class="inp inp--sm inp--num" id="nhapPrice" type="number" step="any" min="0" max="1000000000" inputmode="decimal" placeholder="0" aria-label="Giá nhập (k/kg)"></td>
              <td class="c-del"><button type="button" class="btn btn--primary nhap-add" data-action="nhap-add" data-keep-focus aria-label="Thêm vào tờ ghi" title="Thêm vào tờ ghi"><svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></button></td>
            </tr></tbody>
          </table>
        </div>
        <div class="note__foot">
          <span class="note__tot">Tổng <b class="txt-blue" id="nhapListTotal">0</b></span>
          <button class="btn btn--dark" type="submit" data-keep-focus>
            <svg class="ico" aria-hidden="true"><use href="#i-save"/></svg><span id="nhapSaveLabel">Lưu nhập hàng</span>
          </button>
        </div>
      </div>
    </form>
  </details>
  <div class="grid2 mt-18">
    <details class="card" id="chartBox">
      <summary class="card__head chart-head">
        <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
        <svg class="ico txt-brand" aria-hidden="true"><use href="#i-chart-col"/></svg>
        <h2 class="card__title">Thống kê</h2>
        <div class="chart-year">
          <label class="chart-year__box">
            <span class="chart-year__k">Năm</span>
            <input class="chart-year__in" id="chartYear" type="number" min="2000" max="2100" step="1" aria-label="Năm">
          </label>
        </div>
        <span class="chart-head__stats">
          <span class="chart-head__c"><span class="stat__k">Nhập trong tháng</span><span class="stat__v" id="statImport">0</span></span>
          <span class="chart-head__c"><span class="stat__k">Tổng tồn kho</span><span class="stat__v" id="statStock">0g</span></span>
        </span>
      </summary>
      <div class="card__body">
        <canvas class="chart" id="statsChart" role="img" aria-label="Biểu đồ cột so sánh tổng nhập và tổng bán theo từng tháng"></canvas>
        <div class="chart-tip" id="chartTip" aria-live="polite">
          <span class="chart-tip__m" id="chartMonth" aria-hidden="true">--/----</span>
          <span class="chart-chip chart-chip--imp" id="chartImpChip" aria-hidden="true"><i class="chart-chip__sw"></i><span class="chart-chip__k">Nhập</span><b class="chart-chip__v" id="chartImpVal">0</b></span>
          <span class="chart-chip chart-chip--exp" id="chartExpChip" aria-hidden="true"><i class="chart-chip__sw"></i><span class="chart-chip__k">Bán</span><b class="chart-chip__v" id="chartExpVal">0</b></span>
          <span class="sr" id="chartTipSr"></span>
        </div>
      </div>
    </details>

    <details class="card" id="invBox">
      <summary class="card__head sr-summary">
        <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
        <svg class="ico txt-brand" aria-hidden="true"><use href="#i-warehouse"/></svg>
        <h2 class="card__title">Kho tồn</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-brand" aria-hidden="true"><use href="#i-warehouse"/></svg>Kho tồn</span>
          <div class="sug card__bar-search">
            <input class="inp" id="invSearch" type="search" autocomplete="off" placeholder="Nhập tên" aria-label="Tìm vị thuốc để lọc kho" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="invList">
            <div class="sug__list" id="invList" role="listbox" aria-label="Gợi ý vị thuốc" hidden></div>
          </div>
          <button class="btn btn--sm card__bar-btn" type="button" data-action="reconcile" aria-label="Đối chiếu tồn kho" title="Đối chiếu tồn kho">
            <svg class="ico" aria-hidden="true"><use href="#i-swap"/></svg><span class="card__bar-lbl">Đối chiếu tồn kho</span>
          </button>
          <span class="hint card__bar-count" id="invCount"></span>
        </div>
        <div class="tw">
          <table class="inv">
            <caption class="sr">Tồn kho hiện tại</caption>
            <thead><tr>
              <th scope="col">Tên</th>
              <th scope="col">Đã bán</th>
              <th scope="col">Tồn kho</th>
              <th scope="col">Giá nhập</th>
              <th scope="col" class="c-del"><span class="sr">Thao tác</span></th>
            </tr></thead>
            <tbody id="invBody"></tbody>
          </table>
        </div>
        <div class="foot" id="invPager"></div>
      </div>
    </details>
  </div>

  <div class="grid2 mt-18">
    <details class="card" id="impBox">
      <summary class="card__head sr-summary">
        <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
        <svg class="ico txt-blue" aria-hidden="true"><use href="#i-cart"/></svg>
        <h2 class="card__title">Lịch sử nhập hàng</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-blue" aria-hidden="true"><use href="#i-cart"/></svg>Lịch sử nhập</span>
          <div class="sug card__bar-search is-inline">
            <input class="inp inp--sm" id="impSearch" type="text" autocomplete="off" placeholder="Nhập tên" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="impSearchList" aria-label="Tìm tên vị thuốc trong lịch sử nhập">
            <div class="sug__list" id="impSearchList" role="listbox" aria-label="Gợi ý vị thuốc" hidden></div>
          </div>
          <span class="hint card__bar-count" id="impCount"></span>
        </div>
        <div class="tw">
          <table class="his">
            <caption class="sr">Lịch sử nhập hàng</caption>
            <thead><tr>
              <th scope="col">Ngày</th>
              <th scope="col">Vị thuốc</th>
              <th scope="col">SL</th>
              <th scope="col">Đơn giá</th>
              <th scope="col">Thành tiền</th>
              <th scope="col" class="c-act"><span class="sr">Thao tác</span></th>
            </tr></thead>
            <tbody id="impBody"></tbody>
          </table>
        </div>
        <div class="foot" id="impPager"></div>
      </div>
    </details>

    <details class="card" id="expBox">
      <summary class="card__head sr-summary">
        <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
        <svg class="ico txt-green" aria-hidden="true"><use href="#i-cash"/></svg>
        <h2 class="card__title">Lịch sử bán hàng</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-green" aria-hidden="true"><use href="#i-cash"/></svg>Lịch sử bán</span>
          <div class="monthfield card__bar-month">
            <input class="inp inp--sm" id="expMonth" type="text" inputmode="numeric" autocomplete="off" placeholder="mm/yyyy" maxlength="7" aria-label="Lọc theo tháng (mm/yyyy)">
            <svg class="ico monthfield__ico" aria-hidden="true"><use href="#i-calendar"/></svg>
            <input class="monthfield__native" id="expMonthNative" type="month" tabindex="-1" aria-label="Chọn tháng từ lịch">
          </div>
          <input class="inp inp--sm card__bar-search" id="expSearch" type="text" autocomplete="off" placeholder="Nhập tên" maxlength="200" aria-label="Tìm theo tên vị thuốc">
          <span class="hint card__bar-count" id="expCount"></span>
        </div>
        <div class="tw">
          <table class="his">
            <caption class="sr">Lịch sử bán hàng</caption>
            <thead><tr>
              <th scope="col">Ngày</th>
              <th scope="col">Vị thuốc</th>
              <th scope="col">SL</th>
              <th scope="col">Đơn giá</th>
              <th scope="col">Thành tiền</th>
              <th scope="col" class="c-act"><span class="sr">Thao tác</span></th>
            </tr></thead>
            <tbody id="expBody"></tbody>
          </table>
        </div>
        <div class="foot" id="expPager"></div>
      </div>
    </details>
  </div>

  <details class="card mt-18" id="backupBox">
    <summary class="card__head sr-summary">
      <svg class="ico chev" aria-hidden="true"><use href="#i-chev-r"/></svg>
      <svg class="ico txt-brand" aria-hidden="true"><use href="#i-save"/></svg>
      <h2 class="card__title">Sao lưu &amp; khôi phục</h2>
    </summary>
    <div class="card__bar">
      <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-brand" aria-hidden="true"><use href="#i-save"/></svg>Sao lưu &amp; khôi phục</span>
      <span class="hint card__bar-count" id="backupHint">Chưa sao lưu</span>
    </div>
    <div class="card__body">
      <div class="bak-actions mt-12">
        <button class="btn btn--primary" type="button" data-action="backup-now">
          <svg class="ico" aria-hidden="true"><use href="#i-save"/></svg>Sao lưu ngay
        </button>
        <button class="btn" type="button" data-action="restore-file">
          <svg class="ico" aria-hidden="true"><use href="#i-cloud-down"/></svg>Khôi phục từ file
        </button>
        <input type="file" id="restoreInput" accept=".json,application/json" hidden>
      </div>
      <label class="chk mt-12" for="autoBackup">
        <input type="checkbox" id="autoBackup" checked>
        <span>Tự sao lưu mỗi ngày khi mở trang</span>
      </label>
      <p class="hint mt-10" id="backupLast">Chưa có bản sao lưu nào.</p>
    </div>
  </details>
</main>

<dialog class="dlg" id="editDlg" aria-labelledby="editTitle">
  <div class="card dlg__card">
    <div class="card__head">
      <svg class="ico txt-brand" aria-hidden="true"><use href="#i-edit"/></svg>
      <h2 class="card__title" id="editTitle">Chỉnh sửa vị thuốc</h2>
    </div>
    <div class="card__body">
      <input type="hidden" id="editId">
      <div class="field">
        <label class="lbl" for="editName">Tên vị thuốc</label>
        <input class="inp" id="editName" type="text" autocomplete="off" maxlength="200" required>
      </div>
      <div class="field mt-12">
        <label class="lbl" for="editPrice">Giá nhập (k/kg)</label>
        <input class="inp inp--num" id="editPrice" type="number" step="any" min="0" max="1000000000" inputmode="decimal">
      </div>
    </div>
    <div class="card__foot dlg__foot">
      <button class="btn" type="button" data-action="close-edit">Hủy</button>
      <button class="btn btn--primary" type="button" data-action="save-edit">Lưu thay đổi</button>
    </div>
  </div>
</dialog>

<dialog class="dlg dlg--wide" id="recDlg" aria-labelledby="recTitle">
  <div class="card dlg__card">
    <div class="card__head">
      <svg class="ico txt-brand" aria-hidden="true"><use href="#i-swap"/></svg>
      <h2 class="card__title" id="recTitle">Đối chiếu tồn kho với lịch sử</h2>
    </div>
    <div class="card__body">
      <p class="hint" id="recHint"></p>
      <div class="tw mt-12">
        <table>
          <caption class="sr">Các vị thuốc có tồn lệch với lịch sử</caption>
          <thead><tr>
            <th scope="col">Vị thuốc</th>
            <th scope="col">Tồn hiện tại</th>
            <th scope="col">Theo lịch sử</th>
            <th scope="col">Chênh</th>
            <th class="c-act" scope="col"><span class="sr">Thao tác</span></th>
          </tr></thead>
          <tbody id="recBody"></tbody>
        </table>
      </div>
    </div>
    <div class="card__foot dlg__foot">
      <button class="btn" type="button" data-action="close-rec">Đóng</button>
      <button class="btn btn--primary" type="button" data-action="rec-fix-all" id="recFixAll">Áp dụng tất cả</button>
    </div>
  </div>
</dialog>

<dialog class="dlg" id="txDlg" aria-labelledby="txEditTitle">
  <div class="card dlg__card">
    <div class="card__head">
      <svg class="ico txt-brand" aria-hidden="true"><use href="#i-edit"/></svg>
      <h2 class="card__title" id="txEditTitle">Sửa giao dịch</h2>
    </div>
    <div class="card__body">
      <input type="hidden" id="txEditId">
      <div class="field">
        <label class="lbl" for="txEditName">Vị thuốc</label>
        <input class="inp" id="txEditName" type="text" readonly>
      </div>
      <p class="hint mt-10" id="txEditMeta"></p>
      <div class="grid2 mt-12 gap-12">
        <div class="field">
          <label class="lbl" for="txEditQty" id="txEditQtyLbl">Số lượng (kg)</label>
          <input class="inp inp--num" id="txEditQty" type="number" step="any" min="0" inputmode="decimal">
        </div>
        <div class="field" id="txEditPriceField">
          <label class="lbl" for="txEditPrice">Đơn giá (k/kg)</label>
          <input class="inp inp--num" id="txEditPrice" type="number" step="any" min="0" max="1000000000" inputmode="decimal">
        </div>
      </div>
      <div class="hintbox mt-12">
        <span class="lbl lbl--flat">Thành tiền</span>
        <span class="b txt-brand num" id="txEditTotal">0</span>
      </div>
    </div>
    <div class="card__foot dlg__foot">
      <button class="btn" type="button" data-action="close-tx">Hủy</button>
      <button class="btn btn--primary" type="button" data-action="save-tx">Lưu thay đổi</button>
    </div>
  </div>
</dialog>

<dialog class="dlg dlg--wide" id="orderDlg" aria-labelledby="orderTitle">
  <div class="card dlg__card">
    <div class="card__head">
      <svg class="ico txt-green" aria-hidden="true"><use href="#i-receipt"/></svg>
      <h2 class="card__title" id="orderTitle">Chi tiết đơn</h2>
    </div>
    <div class="card__body">
      <p class="hint" id="orderMeta"></p>
      <div class="note mt-12" id="orderNote">
        <div class="note__head"><span id="orderNoteTitle">Tờ ghi đơn</span><span id="orderNotePg"></span></div>
        <table>
          <caption class="sr">Các vị thuốc trong đơn</caption>
          <thead><tr>
            <th class="c-num" scope="col">STT</th>
            <th scope="col">Tên</th>
            <th scope="col" id="orderQtyHead">SL</th>
            <th class="r" scope="col" id="orderPriceHead" hidden>Đơn giá</th>
            <th class="r" scope="col" id="orderMoneyHead" hidden>Thành tiền</th>
            <th class="c-act" scope="col"><span class="sr">Thao tác</span></th>
          </tr></thead>
          <tbody id="orderBody"></tbody>
          <tfoot><tr>
            <td colspan="2" id="orderFootLabel">Tổng cộng</td>
            <td class="num txt-green" id="orderFootQty">0</td>
            <td class="num txt-green r" id="orderFootPrice" hidden></td>
            <td class="num txt-green r" id="orderFootMoney" hidden>0</td>
            <td class="c-act"></td>
          </tr></tfoot>
        </table>
        <div class="foot" id="orderPager" hidden></div>
      </div>
      <div class="hintbox mt-12" id="orderParams" hidden>
        <div class="inline-row">
          <span class="lbl lbl--flat">Số thang</span>
          <span class="b num" id="orderThang">—</span>
        </div>
        <span class="b txt-brand" aria-hidden="true">×</span>
        <div class="inline-row">
          <span class="lbl lbl--flat">Giá 1 thang</span>
          <span class="b num" id="orderUnitPrice">—</span>
        </div>
        <span class="b txt-brand" aria-hidden="true">=</span>
        <div class="inline-row">
          <span class="lbl lbl--flat">Thành tiền</span>
          <span class="b txt-brand num" id="orderTotal">0</span>
        </div>
      </div>
    </div>
    <div class="card__foot dlg__foot">
      <button class="btn" type="button" data-action="close-order">Đóng</button>
    </div>
  </div>
</dialog>

<div class="toast" id="toast" role="status" aria-live="polite">
  <svg class="ico toast__ok" aria-hidden="true"><use href="#i-check"/></svg>
  <svg class="ico toast__warn" aria-hidden="true"><use href="#i-warn"/></svg>
  <span id="toastMsg">Đã lưu</span>
</div>
<script>
(function(){
'use strict';

/* ================= TIỆN ÍCH ================= */
var doc = document;
function $(s, r){ return (r || doc).querySelector(s); }
function $$(s, r){ return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
function el(tag, cls, text){
  var n = doc.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
function svg(name, cls){
  var s = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('class', 'ico' + (cls ? ' ' + cls : ''));
  s.setAttribute('aria-hidden', 'true');
  var u = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
  u.setAttribute('href', '#i-' + name);
  s.appendChild(u);
  return s;
}
var NF0 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
var NF1 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
var NF2 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 });
function num(v){ var n = parseFloat(v); return isFinite(n) ? n : 0; }
/* Giữ tối đa 15 chữ số có nghĩa: chỉ dọn nhiễu nhị phân của JavaScript
   (ví dụ 0.1 + 0.2 = 0.30000000000000004 → 0.3), không làm tròn số liệu thực. */
function dec(n){
  n = Number(n);
  if (!isFinite(n) || n === 0) return 0;
  /* Nếu một giá trị ngắn hơn (ít chữ số hơn) nằm trong sai số nhị phân cho phép
     thì dùng giá trị đó; nhờ vậy 6.31142000000001 → 6.31142 nhưng vẫn giữ
     nguyên các số thực có nhiều chữ số. */
  for (var p = 1; p < 15; p++) {
    var r = Number(n.toPrecision(p));
    if (Math.abs(n - r) <= Math.abs(n) * 1e-12) return r;
  }
  return Number(n.toPrecision(15));
}
/* Lưu và tính bằng đồng nguyên. Người dùng vẫn gõ và đọc theo nghìn đồng. */
var DONG_PER_K = 1000;
var NAME_MAX = 200;
var QTY_MAX = 1e6;
var GRAMS_MAX = 1e9;
var THANG_MAX = 1e4;
var MONEY_MAX = 1e12;
function inRange(v, min, max){ var n = Number(v); return isFinite(n) && n >= min && n <= max; }

  /* Kiểm trần giới hạn, dùng đúng hằng hiện có. Trả về null (hợp lệ) hoặc chuỗi lỗi. */
  function checkLimits(kind, v){
    var n = Number(v);
    var neg = isFinite(n) && n < 0;
    switch (kind) {
      case 'q':
        if (neg) return 'Số lượng không được âm';
        return inRange(v, 0, QTY_MAX) ? null : 'Số lượng vượt giới hạn (' + QTY_MAX + ')';
      case 'grams':
        if (neg) return 'Gram không được âm';
        return inRange(v, 0, GRAMS_MAX) ? null : 'Gram vượt giới hạn (' + GRAMS_MAX + ')';
      case 'thang':
        if (neg) return 'Số thang không được âm';
        return inRange(v, 1, THANG_MAX) ? null : 'Số thang vượt giới hạn (' + THANG_MAX + ')';
      case 'money':
        /* Ô nhập là nghìn đồng; MONEY_MAX là đồng, đổi sang nghìn để hiển thị. */
        if (!isFinite(n)) return 'Số tiền không hợp lệ';
        if (n < 0) return 'Tiền không được âm';
        return n <= MONEY_MAX ? null : 'Tiền vượt giới hạn (' + fmtNum(MONEY_MAX / DONG_PER_K) + ' nghìn đồng)';
      case 'name': return String(v || '').length <= NAME_MAX ? null : 'Tên vượt giới hạn (' + NAME_MAX + ' ký tự)';
      default: return null;
    }
  }
function isRealDateISO(s){ s = String(s || ''); return parseDateVN(s) === s; }
function money(v){ return Math.round(num(v)); }
function kToDong(k){ return Math.round(num(k) * DONG_PER_K); }
function kInput(dong){
  var k = num(dong) / DONG_PER_K;
  if (!isFinite(k)) return '0';
  return String(Math.round(k * DONG_PER_K) / DONG_PER_K);
}
/* Hiển thị đầy đủ chữ số, không làm tròn. Dùng dấu . phân cách nghìn, , thập phân. */
function fmtNum(n){
  var v = dec(n);
  if (v === 0) return '0';
  var neg = v < 0;
  if (neg) v = -v;
  var s = String(v);
  if (s.indexOf('e') >= 0) {
    s = v.toFixed(20).replace(/0+$/, '').replace(/\.$/, '');
    if (!s) s = '0';
  }
  var parts = s.split('.');
  var ip = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  var fp = parts[1] ? ',' + parts[1] : '';
  return (neg ? '-' : '') + ip + fp;
}
/* Quy ước hiển thị: 1 kg = 10 lạng = 1000 g  ·  1 tr = 1000 */
function fmtQty(kg){
  var n = dec(kg);
  var a = Math.abs(n);
  if (a === 0) return '0g';
  if (a >= 1) return fmtNum(n) + ' kg';
  var lang = dec(n * 10);
  if (Math.abs(lang) >= 1) return fmtNum(lang) + ' lạng';
  return fmtNum(dec(n * 1000)) + ' g';
}
/* 2.14.0 N6: gợi ý đơn vị trong ô số lượng – cùng hàm fmtQty như khi hiển thị sau lưu; không đổi value. */
function qtyHintText(v, unit){
  var n = num(v);
  if (!isFinite(n) || !(n > 0)) return '';
  var kg = unit === 'g' ? n / 1000 : n;
  /* Chỉ trong gợi ý: "lạng" viết tắt "l" cho gọn; fmtQty (toàn app) giữ nguyên. */
  return '(' + fmtQty(kg).replace(' lạng', ' l') + ')';
}
/* 2.14.0 S1: vùng chữ tối thiểu (px) của ô số khi gợi ý đang hiện. */
var QTY_TEXT_MIN = 56;
var QTY_LABEL_W = 45; /* 2.14.0 S2: bề rộng nhãn "SL (KG)" (px) để gợi ý trên dòng nhãn không đè nhãn. */
/* S2: vị trí gợi ý – 'hidden' chỉ khi không có giá trị hợp lệ/ô chưa hiển thị; đủ chỗ → 'inside'; hết chỗ → 'label' (dòng nhãn). */
/* M2: các dạng hiển thị của gợi ý khi hết chỗ trên dòng nhãn, từ đầy đủ đến ngắn nhất (luôn còn đơn vị). */
function qtyHintCandidates(t){
  if (!t) return [''];
  var a = String(t), b = a.replace(/^\(|\)$/g, '');
  var c = b.replace(/,\d+/, '');
  var u = b.split(' ').pop();
  var out = [a, b, c, u], seen = {}, r = [];
  for (var i = 0; i < out.length; i++) if (!seen[out[i]]) { seen[out[i]] = 1; r.push(out[i]); }
  return r;
}
function qtyHintPlacement(clientWidth, padR, hintW, want){
  if (!want || !(clientWidth > 0)) return 'hidden';
  return (clientWidth - (11 + hintW) - padR >= QTY_TEXT_MIN) ? 'inside' : 'label';
}
/* N1: làm mới gợi ý của mọi ô số đã gắn gợi ý (sau khi mã gán value rỗng). */
var QTY_HINT_SEQ = 0; /* N3: id mô tả duy nhất theo bộ đếm (không trùng giữa các ô). */
function refreshAllQtyHints(){
  var list = doc.querySelectorAll('input.qty-hinted');
  for (var i = 0; i < list.length; i++) {
    if (list[i].qtyHintRefresh) list[i].qtyHintRefresh();
  }
}
function attachQtyHint(input, unit){
  if (!input || !input.parentNode) return null;
  var host = input.parentNode;
  if (!host.classList || !host.classList.contains('qty-host')) {
    /* Bọc riêng ô số lượng: gợi ý căn đúng theo khung ô, không theo cả .field/td (có nhãn phía trên). */
    var w = doc.createElement('span');
    w.className = 'qty-host';
    host.insertBefore(w, input);
    w.appendChild(input);
    host = w;
  }
  var h = doc.createElement('span');
  h.className = 'qty-hint';
  h.setAttribute('aria-hidden', 'true');
  host.appendChild(h);
  var sr = doc.createElement('span');
  sr.className = 'sr';
  sr.id = 'qty-hintsr-' + (++QTY_HINT_SEQ);
  host.appendChild(sr);
  input.setAttribute('aria-describedby', sr.id);
  input.classList.add('qty-hinted');
  /* 2.14.0 S1: gợi ý chiếm chỗ trong ô (padding-left bằng JS, class .has-hint) khi còn ≥ QTY_TEXT_MIN px cho chữ số; 2.14.0 S2: hết chỗ thì chuyển lên dòng nhãn (mép phải), chỉ ẩn khi không có giá trị hợp lệ. */
  var fit = function(){
    input.classList.remove('has-hint');
    input.style.paddingLeft = '';
    h.className = 'qty-hint';
    host.classList.remove('qty-host--lbl');
    h.style.maxWidth = '';
    h.textContent = h._full || '';
    var cs = window.getComputedStyle(input);
    var padR = parseFloat(cs.paddingRight) || 0;
    /* M1: bề rộng khung padding (gồm padding, không gồm viền) lấy từ getBoundingClientRect – không dùng clientWidth (tùy trình duyệt/loại ô). */
    var rw = input.getBoundingClientRect ? input.getBoundingClientRect().width : 0;
    var cw = rw > 0 ? rw - (parseFloat(cs.borderLeftWidth) || 0) - (parseFloat(cs.borderRightWidth) || 0) : 0;
    var place = qtyHintPlacement(cw, padR, 0, !!h._want);
    if (place === 'hidden') { h.hidden = true; return; }
    h.hidden = false;
    var hw = h.offsetWidth;
    place = qtyHintPlacement(cw, padR, hw, true);
    if (place === 'inside') {
      input.classList.add('has-hint');
      input.style.paddingLeft = (11 + hw) + 'px';
    } else {
      var inTd = !!(input.closest && input.closest('td'));
      h.className = 'qty-hint qty-hint--label' + (inTd ? '' : ' qty-hint--above');
      if (inTd) host.classList.add('qty-host--lbl');
      /* M2: không cắt bằng "…"; thử lần lượt các dạng rút gọn nội dung, luôn giữ đơn vị. */
      var maxW = Math.max(0, (host.offsetWidth || cw) - QTY_LABEL_W - 6);
      var cands = qtyHintCandidates(h._full || '');
      for (var ci = 0; ci < cands.length; ci++) {
        h.textContent = cands[ci];
        if (h.offsetWidth <= maxW) break;
      }
    }
  };
  var upd = function(){
    var t = qtyHintText(input.value, typeof unit === 'function' ? unit() : unit);
    h.textContent = t;
    sr.textContent = t ? 'Quy đổi ' + t : '';
    h._full = t;
    h._want = !!t;
    fit();
  };
  input.addEventListener('input', upd);
  input.addEventListener('change', upd);
  input.qtyHintRefresh = upd;
  if (typeof window !== 'undefined' && typeof window.ResizeObserver === 'function') new window.ResizeObserver(fit).observe(input);
  upd();
  return h;
}
function fmtMoney(dong){
  /* Hiển thị nghìn đồng, giữ tới 3 số lẻ để thấy từng đồng (0,4 nghĩa là 400 đồng). */
  var v = num(dong) / DONG_PER_K;
  if (!isFinite(v)) v = 0;
  var neg = v < 0;
  if (neg) v = -v;
  var rounded = Math.round(v * DONG_PER_K) / DONG_PER_K;
  var bits = rounded.toFixed(3).replace(/\.?0+$/, '').split('.');
  var ip = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  var fp = bits[1] ? ',' + bits[1] : '';
  return (neg ? '-' : '') + (ip || '0') + fp;
}
/* 2.15.1: chỉ để hiển thị chú giải tháng – phần nguyên của nghìn đồng, CẮT bỏ phần lẻ (không làm tròn). Không đổi dữ liệu. */
function fmtMoneyInt(dong){
  var d = Math.abs(Math.round(num(dong)));
  if (!isFinite(d)) d = 0;
  var k = Math.floor(d / DONG_PER_K);
  return (num(dong) < 0 && k > 0 ? '-' : '') + String(k).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
/* 2.15.2: số kg chỉ trong Thống kê – chọn đơn vị theo giá trị thật rồi CẮT phần lẻ (không làm tròn). fmtQty (nơi khác) giữ nguyên. */
function fmtQtyInt(kg){
  var n = dec(kg), a = Math.abs(n);
  var t = function(v){ var r = Math.trunc(dec(v)); return r === 0 ? 0 : r; };
  if (a === 0) return '0g';
  if (a >= 1) return fmtNum(t(n)) + ' kg';
  var lang = dec(n * 10);
  if (Math.abs(lang) >= 1) return fmtNum(t(lang)) + ' lạng';
  return fmtNum(t(dec(n * 1000))) + ' g';
}
function fmtUnitPrice(k){ return fmtMoney(k) + '/kg'; }
function pad2(n){ return n < 10 ? '0' + n : '' + n; }
function todayISO(){ var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function thisYear(){ return todayISO().slice(0, 4); }
function parseDateVN(s){
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    var p = s.split('-');
    if (+p[0] < 2000 || +p[0] > 2100) return '';
    var dt0 = new Date(+p[0], +p[1] - 1, +p[2]);
    return (dt0.getFullYear() === +p[0] && dt0.getMonth() === +p[1] - 1 && dt0.getDate() === +p[2]) ? s : '';
  }
  var m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
  if (!m) return '';
  var d = +m[1], mo = +m[2], y = +m[3];
  if (y < 100) y += 2000;
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return '';
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
  return y + '-' + pad2(mo) + '-' + pad2(d);
}
function dateInputVN(iso){
  var p = String(iso || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : '';
}
function getDateInput(id){
  var n = $('#' + id);
  if (!n) return '';
  return parseDateVN(n.value) || n.getAttribute('data-iso') || '';
}
function setDateInput(id, iso){
  var n = $('#' + id);
  if (!n) return;
  n.value = dateInputVN(iso);
  n.setAttribute('data-iso', iso || '');
  var nat = $('#' + id + 'Native');
  if (nat) nat.value = iso || '';
}
function userPickedDate(id, iso){
  setDateInput(id, iso);
  lastAuto[id] = (iso === todayISO()) ? iso : null;   // chọn hôm nay = vẫn theo hôm nay
}
function bindDateInput(id){
  var n = $('#' + id), nat = $('#' + id + 'Native');
  if (!n) return;
  n.addEventListener('change', function(){
    if (!n.value.trim()) { var t0 = todayISO(); setDateInput(id, t0); lastAuto[id] = t0; return; }
    var iso = parseDateVN(n.value);
    if (iso) { userPickedDate(id, iso); return; }
    var prev = n.getAttribute('data-iso') || '';
    n.value = dateInputVN(prev);
    toast(prev ? 'Ngày không hợp lệ, giữ nguyên ngày cũ' : 'Ngày không hợp lệ, dùng hôm nay', 'error');
    if (!prev) { var t1 = todayISO(); setDateInput(id, t1); lastAuto[id] = t1; }
  });
  if (nat) {
    var syncNat = function(){ nat.value = parseDateVN(n.value) || todayISO(); };
    nat.addEventListener('focus', syncNat);
    nat.addEventListener('click', syncNat);
    nat.addEventListener('change', function(){ if (nat.value) { userPickedDate(id, nat.value); } });
  }
}
function autoDateInput(id){
  var t = todayISO();
  var cur = getDateInput(id);
  if (cur && cur !== (lastAuto[id] || '')) return;
  if (cur === t) { lastAuto[id] = t; return; }
  var n = $('#' + id);
  if (n && doc.activeElement && (doc.activeElement === n || (doc.activeElement.id && (doc.activeElement.id === id || doc.activeElement.id === id + 'Native')))) return;
  setDateInput(id, t);
  lastAuto[id] = t;
}
function autoChartYear(){
  var t = String(thisYear());
  var n = $('#chartYear');
  if (!n) return;
  var cur = String(n.value || '').trim();
  if (cur && cur !== (lastChartYear || '')) return;
  if (cur === t) { lastChartYear = t; return; }
  if (doc.activeElement && (doc.activeElement === n || (doc.activeElement.id && doc.activeElement.id === 'chartYear'))) return;
  chartSel = -1;
  n.value = t;
  lastChartYear = t;
}
function refreshAutoDates(){
  autoDateInput('retailDate');
  autoDateInput('remedyDate');
  autoChartYear();
  var today = todayISO();
  if (lastStatsDay && lastStatsDay !== today) {
    renderStats();
    renderBackupInfo();
    var cb = $('#chartBox');
    if (cb && cb.open) renderChart();
  }
}
function parseMonthVN(s){
  s = String(s || '').trim();
  if (/^\d{4}-\d{2}$/.test(s)) {
    var y0 = +s.slice(0, 4), m0 = +s.slice(5, 7);
    return (y0 >= 1900 && y0 <= 2100 && m0 >= 1 && m0 <= 12) ? s : '';
  }
  var m = s.match(/^(\d{1,2})[\/\-.](\d{4})$/);
  if (!m) return '';
  var mo = +m[1], y = +m[2];
  return (y >= 1900 && y <= 2100 && mo >= 1 && mo <= 12) ? y + '-' + pad2(mo) : '';
}
function monthInputVN(ym){
  var p = String(ym || '').split('-');
  return p.length === 2 ? p[1] + '/' + p[0] : '';
}
function getMonthInput(id){
  var n = $('#' + id);
  if (!n) return '';
  return parseMonthVN(n.value) || n.getAttribute('data-ym') || '';
}
function setMonthInput(id, ym){
  var n = $('#' + id);
  if (!n) return;
  n.value = monthInputVN(ym);
  n.setAttribute('data-ym', ym || '');
  var nat = $('#' + id + 'Native');
  if (nat) nat.value = ym || '';
}
function bindMonthInput(id, onChange){
  var n = $('#' + id), nat = $('#' + id + 'Native');
  if (!n) return;
  n.addEventListener('change', function(){
    var ym = parseMonthVN(n.value);
    if (ym) { setMonthInput(id, ym); onChange(); return; }
    if (!n.value.trim()) { setMonthInput(id, ''); onChange(); return; }
    setMonthInput(id, n.getAttribute('data-ym') || '');
    toast('Tháng không hợp lệ, dùng mm/yyyy', 'error');
  });
  if (nat) {
    var syncNat = function(){ nat.value = parseMonthVN(n.value) || ''; };
    nat.addEventListener('focus', syncNat);
    nat.addEventListener('click', syncNat);
    nat.addEventListener('change', function(){
      if (nat.value) { setMonthInput(id, nat.value); onChange(); }
    });
  }
}
function uid(p){ return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function capWords(s){
  if (!s) return '';
  return String(s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()
    .replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, function(m, sep, ch){ return sep + ch.toUpperCase(); });
}
function normSearch(s){
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
function sortByName(a, b){ return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }); }
function findProduct(id){
  for (var i = 0; i < db.products.length; i++) if (String(db.products[i].id) === String(id)) return db.products[i];
  return null;
}
var txIndex = null;
function indexTx(){
  txIndex = {};
  db.transactions.forEach(function(t, i){ txIndex[t.id] = i; });
}
function tsFromId(id){
  var m = String(id || '').match(/(\d{10,13})$/);
  if (!m) return 0;
  var v = Number(m[1]);
  return (v > 946684800000 && v < 4102444800000) ? v : 0;
}
function txStamp(t){
  var ts = num(t.ts);
  if (ts > 0) return ts;
  var idTs = tsFromId(t.id);
  if (idTs) return idTs;
  var base = Date.parse(String(t.date || '') + 'T00:00:00');
  if (!isFinite(base)) base = 0;
  if (!txIndex) indexTx();
  return base + (txIndex[t.id] || 0);
}
function txHasTime(t){
  return num(t.ts) > 0 || tsFromId(t.id) > 0;
}
function lastImport(id){
  var best = null, bestStamp = -Infinity;
  db.transactions.forEach(function(t){
    if (t.type !== 'NHAP' || String(t.productId) !== String(id) || !(num(t.price) > 0)) return;
    var s = txStamp(t);
    if (!best || String(t.date) > String(best.date) || (String(t.date) === String(best.date) && s >= bestStamp)) {
      best = t; bestStamp = s;
    }
  });
  return best ? { id: best.id, price: num(best.price), date: String(best.date), ts: bestStamp, hasTime: txHasTime(best) } : null;
}
function refPrice(p){
  var l = lastImport(p.id);
  return l ? l.price : num(p.costPrice);
}
function latestImportMap(){
  var m = {}, stamps = {};
  db.transactions.forEach(function(t){
    if (t.type !== 'NHAP' || !(num(t.price) > 0)) return;
    var pid = String(t.productId);
    var s = txStamp(t);
    if (!(pid in m) || s >= stamps[pid]) { m[pid] = num(t.price); stamps[pid] = s; }
  });
  return m;
}
function importParen(priceDong){
  if (!(num(priceDong) > 0)) return '';
  return '(' + fmtNum(dec(num(priceDong) / 1000)) + ')';
}
function costParen(costTotal, qty){
  if (costTotal == null || !(num(qty) > 0)) return '';
  var unit = num(costTotal) / num(qty);
  if (!(unit > 0)) return '';
  return '(' + fmtNum(dec(unit / 1000)) + ')';
}

/* ================= TRẠNG THÁI ================= */
var KEY = 'kho_db_local_v1';
var DIRTY_KEY = 'kho_db_dirty_v1';
var BASE_KEY = 'kho_cloud_base_v1';
var PAGE_SIZE = 10;
var db = { products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
var invPage = 1, impPage = 1, expPage = 1;
var cloudBase = 0;
var dirty = false;
var syncErrorShown = false;
var syncDetail = '';
var quotaNote = '';
var quotaWarned = false;
var conflictOpen = false;
var dirtySince = 0;
var dirtyBadgeTimer = null;
var syncRetryTimer = null;
var syncRetryDelay = 4000;
var syncRejected = false;
var authLost = false;
var pushing = false;
var DIRTY_BADGE_MS = 4000;
var SYNC_RETRY_MAX = 60000;
var toastTimer = null;
var lastAuto = {};
var lastChartYear = '';
var lastStatsDay = '';

function willScaleMoney(d){
  return !!(d && d.moneyUnit !== 'dong');
}
function scaleLegacyMoney(d){
  if (!willScaleMoney(d)) return d;
  function up(n){ return Math.round(num(n) * DONG_PER_K); }
  if (Array.isArray(d.products)) d.products.forEach(function(p){
    if (p) p.costPrice = up(p.costPrice);
  });
  if (Array.isArray(d.transactions)) d.transactions.forEach(function(t){
    if (!t) return;
    t.price = up(t.price);
    t.total = up(t.total);
    if (t.cost != null && t.cost !== '') t.cost = up(t.cost);
    if (t.unitPrice != null && t.unitPrice !== '') t.unitPrice = up(t.unitPrice);
  });
  if (Array.isArray(d.prescriptions)) d.prescriptions.forEach(function(r){
    if (r) r.total = up(r.total);
  });
  d.moneyUnit = 'dong';
  return d;
}
function sanitize(d, drops){
  var o = { products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
  if (!d || typeof d !== 'object') return o;
  o.updatedAt = dec(d.updatedAt);
  if (Array.isArray(d.products)) {
    var seenPid = Object.create(null), seenPname = Object.create(null);
    d.products.forEach(function(p){
      if (!p || !p.name) return;
      var id = String(p.id || uid('PROD'));
      var name = String(p.name).trim();
      if (!name) return;
      if (name.length > NAME_MAX) {
        if (drops) drops.push('Tên vị thuốc quá dài: ' + name.slice(0, 40) + '…');
        name = name.slice(0, NAME_MAX);
      }
      if (p.stock == null || p.stock === '' || p.costPrice == null || p.costPrice === '' ||
          !inRange(p.stock, 0, QTY_MAX) || !inRange(p.costPrice, 0, MONEY_MAX)) {
        if (drops) drops.push('Vị thuốc không hợp lệ: ' + name);
        return;
      }
      var nameKey = capWords(name).toLowerCase();
      if (seenPid[id] || seenPname[nameKey]) {
        if (drops) drops.push('Vị thuốc trùng: ' + name);
        return;
      }
      seenPid[id] = true;
      seenPname[nameKey] = true;
      o.products.push({
        id: id,
        name: name,
        stock: dec(p.stock),
        costPrice: money(p.costPrice)
      });
    });
  }
  if (Array.isArray(d.transactions)) {
    var seenTid = Object.create(null);
    d.transactions.forEach(function(t){
      if (!t) return;
      var id = String(t.id || uid('TX'));
      if (seenTid[id]) {
        if (drops) drops.push('Giao dịch trùng id: ' + id);
        return;
      }
      seenTid[id] = true;
      var type = t.type;
      var date = String(t.date || '');
      var productId = String(t.productId || '').trim();
      if ((type !== 'NHAP' && type !== 'BAN') || !isRealDateISO(date) || !productId ||
          t.qty == null || t.qty === '' || !inRange(t.qty, 0, QTY_MAX) || !(Number(t.qty) > 0) ||
          t.price == null || t.price === '' || !inRange(t.price, 0, MONEY_MAX) ||
          t.total == null || t.total === '' || !inRange(t.total, 0, MONEY_MAX) ||
          (t.cost != null && !inRange(t.cost, 0, MONEY_MAX)) ||
          (t.g != null && !inRange(t.g, 0, GRAMS_MAX)) ||
          (t.thang != null && !inRange(t.thang, 1, THANG_MAX)) ||
          (t.unitPrice != null && !inRange(t.unitPrice, 0, MONEY_MAX)) ||
          (t.ts != null && !isFinite(Number(t.ts)))) {
        if (drops) drops.push('Giao dịch không hợp lệ: ' + id);
        return;
      }
      var tx = {
        id: id,
        date: date,
        type: type,
        productId: productId,
        qty: dec(t.qty),
        price: money(t.price),
        total: money(t.total),
        cost: t.cost == null ? null : money(t.cost)
      };
      var oid = t.oid != null ? String(t.oid) : (t.orderId != null ? String(t.orderId) : null);
      var oname = t.oname != null ? String(t.oname).trim() : (t.orderName != null ? String(t.orderName).trim() : null);
      if (oname && oname.length > NAME_MAX) {
        if (drops) drops.push('Tên đơn quá dài: ' + oname.slice(0, 40) + '…');
        oname = oname.slice(0, NAME_MAX);
      }
      if (oid && oname && oname !== oid) { tx.oid = oid; tx.oname = oname; }
      else if (oid) tx.oid = oid;
      if (t.retail) tx.retail = true;
      if (t.rx) tx.rx = true;
      if (t.g != null) tx.g = dec(t.g);
      if (t.thang != null) tx.thang = dec(t.thang);
      if (t.unitPrice != null) tx.unitPrice = money(t.unitPrice);
      if (num(t.ts) > 0) tx.ts = num(t.ts);
      o.transactions.push(tx);
    });
  }
  if (Array.isArray(d.prescriptions)) {
    var seenRid = Object.create(null), seenRname = Object.create(null);
    d.prescriptions.forEach(function(r){
      if (!r || !r.name || !Array.isArray(r.items)) return;
      var rid = String(r.id || uid('RX'));
      var rname = String(r.name).trim();
      if (!rname) return;
      if (rname.length > NAME_MAX) {
        if (drops) drops.push('Tên đơn thuốc quá dài: ' + rname.slice(0, 40) + '…');
        rname = rname.slice(0, NAME_MAX);
      }
      var rtotal = (r.total == null || r.total === '') ? 0 : Number(r.total);
      var rthang = (r.thang == null || r.thang === '') ? 1 : Number(r.thang);
      if (!inRange(rtotal, 0, MONEY_MAX) || !inRange(rthang, 1, THANG_MAX)) {
        if (drops) drops.push('Đơn thuốc không hợp lệ: ' + rname);
        return;
      }
      var rnameKey = rname;
      if (seenRid[rid] || seenRname[rnameKey]) {
        if (drops) drops.push('Đơn thuốc trùng: ' + rname);
        return;
      }
      var items = [], seenItem = Object.create(null);
      r.items.forEach(function(it){
        if (!it || !it.productId) return;
        var itemPid = String(it.productId);
        if (seenItem[itemPid]) return;
        if (!inRange(it.grams, 0, GRAMS_MAX) || !(Number(it.grams) > 0)) return;
        seenItem[itemPid] = true;
        items.push({ productId: itemPid, grams: dec(it.grams) });
      });
      if (!items.length) return;
      seenRid[rid] = true;
      seenRname[rnameKey] = true;
      o.prescriptions.push({
        id: rid,
        name: rname,
        items: items,
        total: money(rtotal),
        thang: Math.max(1, Math.round(rthang)),
        updatedAt: dec(r.updatedAt)
      });
    });
  }
  return o;
}
function readLocal(){
  try {
    var raw = localStorage.getItem(KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    var legacy = !parsed || willScaleMoney(parsed);
    var out = sanitize(scaleLegacyMoney(parsed));
    if (legacy) out._scaledFromK = true;
    return out;
  } catch (e) { return null; }
}
function readDirty(){
  try { return localStorage.getItem(DIRTY_KEY) === '1'; } catch (e) { return false; }
}
function readBase(){
  try {
    var v = Number(localStorage.getItem(BASE_KEY));
    return isFinite(v) && v > 0 ? v : 0;
  } catch (e) { return 0; }
}
function armDirtyBadge(){
  if (!dirty) {
    dirtySince = 0;
    if (dirtyBadgeTimer) { clearTimeout(dirtyBadgeTimer); dirtyBadgeTimer = null; }
    return;
  }
  if (!dirtySince) dirtySince = Date.now();
  if (dirtyBadgeTimer || Date.now() - dirtySince >= DIRTY_BADGE_MS) return;
  dirtyBadgeTimer = setTimeout(function(){
    dirtyBadgeTimer = null;
    renderSyncBadge();
  }, DIRTY_BADGE_MS - (Date.now() - dirtySince));
}
function renderSyncBadge(){
  armDirtyBadge();
  var el = $('#syncBadge');
  var drop = $('#syncDiscard');
  var stale = !!(dirty && dirtySince && Date.now() - dirtySince >= DIRTY_BADGE_MS);
  var show = !!(authLost || syncErrorShown || quotaNote || stale);
  if (el) {
    el.hidden = !show;
    if (!show) el.textContent = '';
    else if (authLost) {
      el.textContent = 'Thiết bị này chưa được duyệt hoặc đã bị thu hồi.' +
        (dirty ? '\nThay đổi chưa gửi vẫn được giữ trên máy này.' : '') + '\n';
      var a = doc.createElement('a');
      a.href = '/auth/join';
      a.textContent = 'Nhập mã mời để vào lại';
      el.appendChild(a);
      if (quotaNote) el.appendChild(doc.createTextNode('\n' + quotaNote));
    } else {
      var parts = ['Chưa đồng bộ'];
      if (syncDetail) parts.push(syncDetail);
      if (quotaNote) parts.push(quotaNote);
      el.textContent = parts.join('\n');
    }
  }
  if (drop) drop.hidden = !syncRejected || authLost;
}
function scheduleSyncRetry(){
  if (syncRetryTimer || conflictOpen || syncRejected) return;
  var wait = syncRetryDelay;
  syncRetryTimer = setTimeout(function(){
    syncRetryTimer = null;
    syncRetryDelay = Math.min(syncRetryDelay * 2, SYNC_RETRY_MAX);
    if ((dirty || syncErrorShown) && !syncRejected && !conflictOpen && !pushing) {
      if (busyEditing()) scheduleSyncRetry();
      else pushState(false);
    }
  }, wait);
}
function noteAuthLost(){
  if (!authLost) toast('Thiết bị này chưa được duyệt hoặc đã bị thu hồi. Dữ liệu chưa gửi vẫn giữ trên máy này.', 'error');
  authLost = true;
  syncRejected = false;        // 401 không phải "dữ liệu bị từ chối": không cho bỏ nháp
  syncErrorShown = false;      // huy hiệu do authLost quản lý
  syncDetail = '';
  if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
  renderSyncBadge();
}
function noteSyncFailure(detail, retry){
  syncErrorShown = true;
  syncDetail = detail || 'Dữ liệu trên máy này chưa lên máy chủ.';
  syncRejected = !retry;
  renderSyncBadge();
  /* 400/428 từ chối đúng dữ liệu này. Gửi lại chỉ lặp cùng một lỗi. */
  if (retry) scheduleSyncRetry();
  else if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
}
/* 2.15.0: nút "Tải lại" chỉ hiện khi chạy từ màn hình chính (iPhone không có nút tải lại). */
function isStandaloneMode(){
  try {
    if (navigator && navigator.standalone === true) return true;
    return !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  } catch (e) { return false; }
}
function renderReloadBtn(){
  var b = $('#reloadBtn');
  if (b) b.hidden = !isStandaloneMode();
}
function reloadAppClick(){
  var pending = dirty || (retailItems && retailItems.length) || (remedyItems && remedyItems.length) || (nhapList && nhapList.length);
  if (pending && !confirm('Còn thay đổi hoặc đơn nháp chưa lưu. Tải lại sẽ mất đơn nháp chưa lưu.\n\nVẫn tải lại?')) return false;
  location.reload();
  return true;
}
function discardUnsynced(){
  if (authLost) {
    toast('Thiết bị chưa được duyệt nên chưa lấy được bản máy chủ. Dữ liệu vẫn giữ trên máy này.', 'error');
    return Promise.resolve(false);
  }
  if (!confirm('Bỏ các thay đổi chưa gửi và lấy bản trên máy chủ?\n\nMột file JSON của bản nháp sẽ được tải về trước khi bỏ.')) {
    return Promise.resolve(false);
  }
  if (!downloadBackup(false, 'kho-nhap-bi-tu-choi-' + backupStamp() + '.json', true)) {
    toast('Không tải được bản nháp — đã giữ nguyên dữ liệu trên máy này', 'error');
    return Promise.resolve(false);
  }
  return pullState(true, true).then(function(ok){
    if (ok) {
      if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
      syncRetryDelay = DIRTY_BADGE_MS;
      dirty = false;
      dirtySince = 0;
      syncErrorShown = false;
      syncDetail = '';
      syncRejected = false;
      renderSyncBadge();
      resetDrafts();
    } else if (!authLost) {
      toast('Chưa lấy được bản máy chủ — thay đổi chưa gửi vẫn được giữ trên máy này', 'error');
    }
    return ok;
  });
}
function saveLocal(){
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
    localStorage.setItem(DIRTY_KEY, dirty ? '1' : '0');
    localStorage.setItem(BASE_KEY, String(cloudBase || 0));
    if (quotaNote) { quotaNote = ''; quotaWarned = false; renderSyncBadge(); }
  } catch (e) {
    var quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
    if (quota && !quotaWarned) {
      quotaWarned = true;
      quotaNote = 'Bộ nhớ trình duyệt đầy — bản nháp trên máy này có thể không giữ được.';
      renderSyncBadge();
    }
  }
}
function touch(){
  db.updatedAt = Date.now();
  if (!dirty) dirtySince = Date.now();
  dirty = true;
  saveLocal();
}

/* ================= THÔNG BÁO ================= */
/* N2: lỗi giữ 5 giây và báo assertive; thông báo thường 2,8 giây. Khi có hộp thoại đang mở, lỗi cũng hiện trong hộp (toast dưới lớp phủ dễ bị bỏ lỡ). */
function toast(msg, kind){
  var t = $('#toast'), m = $('#toastMsg');
  if (!t || !m) return;
  var isErr = kind === 'error';
  m.textContent = msg;
  t.setAttribute('data-kind', isErr ? 'error' : 'ok');
  t.setAttribute('role', isErr ? 'alert' : 'status');
  t.setAttribute('aria-live', isErr ? 'assertive' : 'polite');
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.classList.remove('is-on'); }, isErr ? 5000 : 2800);
  if (isErr) { var od = $('dialog[open]'); if (od) dlgErrorBox(od).textContent = msg; }
}
function dlgErrorBox(dlg){
  var box = dlg.querySelector('.dlg__err');
  if (box) return box;
  box = doc.createElement('div');
  box.className = 'dlg__err';
  box.setAttribute('role', 'alert');
  var card = dlg.querySelector('.dlg__card') || dlg;
  var head = card.querySelector('.card__head');
  if (head && head.nextSibling) card.insertBefore(box, head.nextSibling); else card.appendChild(box);
  return box;
}
function clearDlgErr(dlg){ var box = dlg.querySelector('.dlg__err'); if (box && box.parentNode) box.parentNode.removeChild(box); }

/* ================= GIAO DIỆN SÁNG/TỐI ================= */
var YIN = 'M256 64c53 0 96 43 96 96s-43 96-96 96s-96 43-96 96s43 96 96 96c-106 0-192-86-192-192S150 64 256 64m0 448a256 256 0 1 0 0-512a256 256 0 1 0 0 512m32-352a32 32 0 1 0-64 0a32 32 0 1 0 64 0m-64 192a32 32 0 1 1 64 0a32 32 0 1 1-64 0';
function setFavicon(){
  var link = $('#favicon');
  if (!link) return;
  var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><circle cx="256" cy="256" r="256" fill="#fff"/><path fill="#000" d="' + YIN + '"/></svg>';
  link.href = 'data:image/svg+xml,' + encodeURIComponent(s);
}
function applyTheme(mode){
  var dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  window.__THEME__ = mode;
  doc.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  try { localStorage.setItem('theme_mode', mode); } catch (e) {}
  var lbl = $('#themeLabel');
  if (lbl) lbl.textContent = mode === 'dark' ? 'Tối' : mode === 'light' ? 'Sáng' : 'Theo máy';
  $$('#themeMenu [data-theme-set]').forEach(function(b){
    b.setAttribute('aria-checked', b.getAttribute('data-theme-set') === mode ? 'true' : 'false');
  });
  var meta = $('#themeColor');
  if (meta) meta.setAttribute('content', dark ? '#111620' : '#eceef2');
  setFavicon();
  if ($('#chartBox') && $('#chartBox').open) renderChart();
}
/* N4 (2.13.0): bấm "Quản Lý Kho": chỉ thiết bị chủ (fetch /auth/devices = 200) mới vào Thiết bị; còn lại rung icon và báo chỉ-đọc. Không đổi server. */
var brandBusy = false;
function denyDevices(){
  var yin = $('#themeBtn');
  if (yin) { yin.classList.remove('is-shake'); void yin.offsetWidth; yin.classList.add('is-shake'); }
  var note = $('#brandNote');
  if (note) note.textContent = 'Chỉ thiết bị chủ quản lý được thiết bị.';
}
function brandDevicesClick(){
  if (brandBusy) return Promise.resolve();
  brandBusy = true;
  return Promise.resolve().then(function(){
    return fetch('/auth/devices', { credentials: 'same-origin', redirect: 'manual', headers: { Accept: 'text/html' } });
  }).then(function(r){
    if (r && r.status === 200) location.href = '/auth/devices';
    else denyDevices();
  }, denyDevices).then(function(){ brandBusy = false; });
}
function closeThemeMenu(){
  var m = $('#themeMenu'), b = $('#themeBtn');
  if (m) m.hidden = true;
  if (b) b.setAttribute('aria-expanded', 'false');
}
/* ================= DÒNG ĐƠN HÀNG ================= */
function renumber(tbody, base){
  var n = base || 0;
  Array.prototype.forEach.call(tbody.children, function(tr){
    if (tr.getAttribute('data-empty') === '1') return;
    n++;
    var c = tr.querySelector('.c-num');
    if (c) c.textContent = String(n);
  });
}
function clearEmpty(tb){
  if (!tb) return;
  var old = tb.querySelector('tr[data-empty="1"]');
  if (old) old.remove();
}
function orderEmpty(tb, cols, text){
  if (!tb) return;
  clearEmpty(tb);
  var has = false;
  Array.prototype.forEach.call(tb.children, function(tr){
    if (tr.getAttribute('data-empty') !== '1') has = true;
  });
  if (has) return;
  var tr = el('tr');
  tr.setAttribute('data-empty', '1');
  tr.className = 'is-empty';
  var td = el('td', 'empty-cell muted small', text);
  td.colSpan = cols;
  tr.appendChild(td);
  tb.appendChild(tr);
}
function fmtGram(g){
  var n = dec(g);
  if (Math.abs(n) >= 1000) return fmtNum(dec(n / 1000)) + ' kg';
  return fmtNum(n) + ' g';
}
var remedyItems = [];
var remedyNotePage = 1;
var remedyEditIdx = -1;
function commitRemedyRow(){
  var tb = $('#remedyBody');
  if (!tb) return true;
  var row = tb.querySelector('tr[data-pid]');
  if (!row) return true;
  var g = num($('.remedy-qty', row).value);
  var limG = checkLimits('grams', g);
  if (limG) {
    toast(limG, 'error');
    var qi = $('.remedy-qty', row);
    if (qi) qi.focus();
    return false;
  }
  if (g <= 0) {
    var p = findProduct(row.getAttribute('data-pid'));
    toast('Dòng "' + (p ? p.name : '?') + '" thiếu gram', 'error');
    qi = $('.remedy-qty', row);
    if (qi) qi.focus();
    return false;
  }
  remedyItems.push({ productId: row.getAttribute('data-pid'), grams: dec(g) });
  remedyNotePage = 1e9;
  tb.textContent = '';
  orderEmpty(tb, 4, '');
  refreshAllQtyHints();
  return true;
}
/* 2.15.3: sau "+" đưa focus về ô tìm để gõ vị tiếp theo (nút + có data-keep-focus nên ô số không mất focus trước đó). */
function refocusSearch(sel, key){
  var s = $(sel);
  if (!s) return;
  s.focus();
  closeSuggest(key);
  updateFootBars();
  compactSync(true); /* 2.15.6/2.15.8: thêm dòng -> đo lại 2 dòng cuối, cuộn mượt xuống cuối (guồng) */
  kbSchedule(s); /* 2.15.8: định vị lại trang ở các mốc trễ kể cả khi không có focusin mới */
}
function addRemedyToNote(){
  var row = $('#remedyBody tr[data-pid]');
  if (!row) return;
  var qi = $('.remedy-qty', row);
  if (num(qi.value) <= 0) { toast('Nhập số gram lớn hơn 0', 'error'); qi.focus(); return; }
  if (!commitRemedyRow()) return;
  calcRemedy();
  refocusSearch('#remedySearch', 'remedy');
}
function remedyNoteSave(){
  var it = remedyItems[remedyEditIdx];
  if (!it) { remedyEditIdx = -1; renderRemedyNote(); return; }
  var g = num(($('#remedyNoteEditQty') || {}).value);
  if (g <= 0) { toast('Số gram phải lớn hơn 0', 'error'); return; }
  var limRn = checkLimits('grams', g);
  if (limRn) { toast(limRn, 'error'); return; }
  it.grams = dec(g);
  remedyEditIdx = -1;
  calcRemedy();
}
function renderRemedyNote(){
  var tb = $('#remedyNoteBody');
  if (!tb) return;
  /* 2.14.0: STT dòng đang nhập = số dòng tờ ghi + 1 (tuyệt đối). */
  var pendingRb = $('#remedyBody');
  if (pendingRb) renumber(pendingRb, remedyItems.length);
  var pages = Math.max(1, Math.ceil(remedyItems.length / PAGE_SIZE));
  if (remedyNotePage > pages) remedyNotePage = pages;
  if (remedyNotePage < 1) remedyNotePage = 1;
  var sum = 0;
  remedyItems.forEach(function(it){ sum += num(it.grams); });
  tb.textContent = '';
  for (var k = 0; k < PAGE_SIZE; k++) {
    var i = (remedyNotePage - 1) * PAGE_SIZE + k;
    var it = remedyItems[i];
    var tr = el('tr');
    /* 2.14.0: không vẽ dòng trống của tờ ghi, chỉ dòng thật. */
    if (!it) continue;
    var p = findProduct(it.productId);
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', p ? p.name : 'Đã xóa'));
    var tdq, tda = el('td', 'c-act');
    var wrap = el('div', 'inline-row');
    if (i === remedyEditIdx) {
      tdq = el('td', 'c-qty');
      var qi = el('input', 'inp inp--sm inp--num');
      qi.id = 'remedyNoteEditQty'; qi.type = 'number'; qi.step = 'any'; qi.min = '0'; qi.inputMode = 'decimal';
      qi.value = String(num(it.grams));
      qi.setAttribute('aria-label', 'Số lượng (gram)');
      tdq.appendChild(qi);
      attachQtyHint(qi, 'g');
      var bs = el('button', 'btn btn--icon');
      bs.type = 'button'; bs.setAttribute('data-action', 'rnote-save'); bs.setAttribute('aria-label', 'Lưu dòng');
      bs.appendChild(svg('save'));
      var bc = el('button', 'btn btn--icon btn--danger');
      bc.type = 'button'; bc.setAttribute('data-action', 'rnote-cancel'); bc.setAttribute('aria-label', 'Hủy sửa');
      bc.appendChild(svg('x'));
      wrap.appendChild(bs); wrap.appendChild(bc);
    } else {
      tdq = el('td', 'num', fmtGram(it.grams));
      wrap.appendChild(rowMenu([
        { label: 'Sửa dòng', icon: 'edit', action: 'rnote-edit', idx: i },
        { label: 'Xóa dòng', icon: 'trash', action: 'rnote-del', idx: i, danger: true }
      ], 'Thao tác với dòng ' + (i + 1)));
    }
    tr.appendChild(tdq);
    tda.appendChild(wrap);
    tr.appendChild(tda);
    tb.appendChild(tr);
  }
  var tot = $('#remedyNoteTotal');
  if (tot) tot.textContent = fmtGram(sum);
  var pg = $('#remedyNotePg');
  if (pg) pg.textContent = 'Trang ' + remedyNotePage + ' / ' + pages;
  var host = $('#remedyNotePager');
  if (host) {
    host.hidden = pages <= 1;
    if (pages > 1) renderPager(host, remedyNotePage, pages, 'rnote');
  }
}
function addOrderRow(kind, pid){
  var isRetail = kind === 'retail';
  var tb = $(isRetail ? '#retailBody' : '#remedyBody');
  var p = findProduct(pid);
  if (!tb || !p) return null;
  clearEmpty(tb);

  var tr = el('tr');
  tr.setAttribute('data-pid', p.id);
  tr.className = 'is-row';
  tr.appendChild(el('td', 'c-num num muted'));
  tr.appendChild(el('td', 'b', p.name));

  var tdQ = el('td', 'c-qty');
  tdQ.setAttribute('data-label', isRetail ? 'SL (kg)' : 'SL (gram)');
  var qi = el('input', 'inp inp--sm inp--num ' + (isRetail ? 'retail-qty' : 'remedy-qty'));
  qi.type = 'number'; qi.step = 'any'; qi.min = '0'; qi.inputMode = 'decimal'; qi.placeholder = '0';
  qi.max = isRetail ? '1000000' : '1000000000';
  qi.setAttribute('aria-label', isRetail ? 'Số lượng (kg)' : 'Số lượng (gram)');
  tdQ.appendChild(qi);
  attachQtyHint(qi, isRetail ? 'kg' : 'g');
  tr.appendChild(tdQ);

  if (isRetail) {
    var tdM = el('td', 'c-money');
    tdM.setAttribute('data-label', 'Thành tiền');
    var mi = el('input', 'inp inp--sm inp--num retail-money');
    mi.type = 'number'; mi.step = 'any'; mi.min = '0'; mi.inputMode = 'decimal'; mi.placeholder = '0';
    mi.max = '1000000000';
    mi.setAttribute('aria-label', 'Thành tiền');
    tdM.appendChild(mi);
    tr.appendChild(tdM);
  }

  var tdD = el('td', 'c-del');
  var b;
  if (isRetail) {
    b = el('button', 'btn btn--icon btn--primary');
    b.type = 'button';
    b.setAttribute('data-action', 'note-add');
    b.setAttribute('data-keep-focus', '');
    b.setAttribute('aria-label', 'Thêm vào tờ ghi');
    b.setAttribute('title', 'Thêm vào tờ ghi');
    b.appendChild(svg('plus'));
  } else {
    b = el('button', 'btn btn--icon btn--primary');
    b.type = 'button';
    b.setAttribute('data-action', 'rnote-add');
    b.setAttribute('data-keep-focus', '');
    b.setAttribute('aria-label', 'Thêm vào tờ ghi');
    b.setAttribute('title', 'Thêm vào tờ ghi');
    b.appendChild(svg('plus'));
  }
  tdD.appendChild(b);
  tr.appendChild(tdD);

  tb.appendChild(tr);
  renumber(tb, isRetail ? retailItems.length : remedyItems.length);

  return tr;
}
function resetRetail(){
  var tb = $('#retailBody');
  if (!tb) return;
  tb.textContent = '';
  orderEmpty(tb, 5, '');
  retailItems = [];
  noteEditIdx = -1;
  notePage = 1;
  var s = $('#retailSearch');
  if (s) s.value = '';
  calcRetail();
  refreshAllQtyHints();
}
function resetRemedy(){
  var tb = $('#remedyBody');
  if (!tb) return;
  tb.textContent = '';
  orderEmpty(tb, 4, '');
  remedyItems = [];
  remedyEditIdx = -1;
  remedyNotePage = 1;
  var s = $('#remedySearch');
  if (s) s.value = '';
  var n = $('#remedyName');
  if (n) n.value = '';
  var sel = $('#remedyPreset');
  if (sel) sel.value = '';
  var up = $('#remedyUnitPrice');
  if (up) up.value = '';
  var th = $('#remedyThang');
  if (th) th.value = '1';
  calcRemedy();
  updatePresetUI();
  refreshAllQtyHints();
}
/* Xóa mọi bản nháp đang giữ trong bộ nhớ sau khi đã lấy bản máy chủ/khôi phục. */
function resetDrafts(){
  nhapList = [];
  retailItems = [];
  remedyItems = [];
  renderNhapList();
  resetNhapInputs();
  resetRetail();
  resetRemedy();
  closeTxEdit();
  if (orderCur) closeOrder();
}
var notePage = 1;
var retailItems = [];
var noteEditIdx = -1;
function renderNote(){
  var tb = $('#retailNoteBody');
  if (!tb) return;
  /* 2.14.0: STT dòng đang nhập = số dòng tờ ghi + 1 (tuyệt đối). */
  var pendingTb = $('#retailBody');
  if (pendingTb) renumber(pendingTb, retailItems.length);
  var impMap = latestImportMap();
  var pages = Math.max(1, Math.ceil(retailItems.length / PAGE_SIZE));
  if (notePage > pages) notePage = pages;
  if (notePage < 1) notePage = 1;
  var sum = 0;
  retailItems.forEach(function(it){ sum += num(it.amount); });
  tb.textContent = '';
  for (var k = 0; k < PAGE_SIZE; k++) {
    var i = (notePage - 1) * PAGE_SIZE + k;
    var it = retailItems[i];
    var tr = el('tr');
    /* 2.14.0 (giai đoạn 1): không vẽ dòng trống của tờ ghi, chỉ dòng thật. */
    if (!it) continue;
    var p = findProduct(it.pid);
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', p ? p.name : 'Đã xóa'));
    var tdq, tdm, tda = el('td', 'c-act');
    var wrap = el('div', 'inline-row');
    if (i === noteEditIdx) {
      tdq = el('td', 'c-qty');
      var qi = el('input', 'inp inp--sm inp--num');
      qi.id = 'noteEditQty'; qi.type = 'number'; qi.step = 'any'; qi.min = '0'; qi.inputMode = 'decimal';
      qi.value = String(num(it.kg));
      qi.setAttribute('aria-label', 'Số lượng (kg)');
      tdq.appendChild(qi);
      attachQtyHint(qi, 'kg');
      tdm = el('td', 'c-money');
      var mi = el('input', 'inp inp--sm inp--num');
      mi.id = 'noteEditMoney'; mi.type = 'number'; mi.step = 'any'; mi.min = '0'; mi.inputMode = 'decimal';
      mi.value = kInput(it.amount);
      mi.setAttribute('aria-label', 'Thành tiền');
      tdm.appendChild(mi);
      var bs = el('button', 'btn btn--icon');
      bs.type = 'button'; bs.setAttribute('data-action', 'note-save'); bs.setAttribute('aria-label', 'Lưu dòng');
      bs.appendChild(svg('save'));
      var bc = el('button', 'btn btn--icon btn--danger');
      bc.type = 'button'; bc.setAttribute('data-action', 'note-cancel'); bc.setAttribute('aria-label', 'Hủy sửa');
      bc.appendChild(svg('x'));
      wrap.appendChild(bs); wrap.appendChild(bc);
    } else {
      tdq = el('td', 'num', fmtQty(it.kg));
      var impPrice = impMap[String(it.pid)] || (p && num(p.costPrice) > 0 ? num(p.costPrice) : 0);
      if (impPrice > 0) {
        var sp = el('span', 'muted small', ' ' + importParen(impPrice));
        sp.setAttribute('title', 'Giá nhập gần nhất (nghìn đồng/kg)');
        tdq.appendChild(sp);
      }
      tdm = el('td', 'num r', fmtMoney(it.amount));
      wrap.appendChild(rowMenu([
        { label: 'Sửa dòng', icon: 'edit', action: 'note-edit', idx: i },
        { label: 'Xóa dòng', icon: 'trash', action: 'note-del', idx: i, danger: true }
      ], 'Thao tác với dòng ' + (i + 1)));
    }
    tr.appendChild(tdq);
    tr.appendChild(tdm);
    tda.appendChild(wrap);
    tr.appendChild(tda);
    tb.appendChild(tr);
  }
  var tot = $('#retailNoteTotal');
  if (tot) tot.textContent = fmtMoney(sum);
  var pg = $('#retailNotePg');
  if (pg) pg.textContent = 'Trang ' + notePage + ' / ' + pages;
  var host = $('#retailNotePager');
  if (host) {
    host.hidden = pages <= 1;
    if (pages > 1) renderPager(host, notePage, pages, 'note');
  }
}
function commitRetailRow(){
  var tb = $('#retailBody');
  if (!tb) return true;
  var row = tb.querySelector('tr[data-pid]');
  if (!row) return true;
  var q = num($('.retail-qty', row).value);
  var m = num($('.retail-money', row).value);
  var limRq = checkLimits('q', q) || checkLimits('money', kToDong(m));
  if (limRq) {
    toast(limRq, 'error');
    var bad = checkLimits('q', q) ? $('.retail-qty', row) : $('.retail-money', row);
    if (bad) bad.focus();
    return false;
  }
  if (q <= 0) {
    var p = findProduct(row.getAttribute('data-pid'));
    toast('Dòng "' + (p ? p.name : '?') + '" thiếu số lượng', 'error');
    var qi = $('.retail-qty', row);
    if (qi) qi.focus();
    return false;
  }
  if (m < 0) {
    toast('Thành tiền không được âm', 'error');
    var mi = $('.retail-money', row);
    if (mi) { mi.focus(); if (mi.select) mi.select(); }
    return false;
  }
  retailItems.push({ pid: row.getAttribute('data-pid'), kg: dec(q), amount: kToDong(m) });
  notePage = 1e9;
  tb.textContent = '';
  orderEmpty(tb, 5, '');
  refreshAllQtyHints();
  return true;
}
function addRetailToNote(){
  var row = $('#retailBody tr[data-pid]');
  if (!row) return;
  var qi = $('.retail-qty', row);
  if (num(qi.value) <= 0) { toast('Nhập số lượng lớn hơn 0', 'error'); qi.focus(); return; }
  if (!commitRetailRow()) return;
  calcRetail();
  refocusSearch('#retailSearch', 'retail');
}
function noteSave(){
  var it = retailItems[noteEditIdx];
  if (!it) { noteEditIdx = -1; renderNote(); return; }
  var q = num(($('#noteEditQty') || {}).value);
  var m = num(($('#noteEditMoney') || {}).value);
  if (q <= 0) { toast('Số lượng phải lớn hơn 0', 'error'); return; }
  if (m < 0) { toast('Thành tiền không được âm', 'error'); return; }
  var limNs = checkLimits('q', q) || checkLimits('money', kToDong(m));
  if (limNs) { toast(limNs, 'error'); return; }
  it.kg = dec(q);
  it.amount = kToDong(m);
  noteEditIdx = -1;
  calcRetail();
}
function calcRetail(){
  var total = 0;
  retailItems.forEach(function(it){ total += num(it.amount); });
  $$('#retailBody .retail-money').forEach(function(i){ total += kToDong(i.value); });
  var out = $('#retailTotal');
  if (out) out.textContent = fmtMoney(total);
  renderNote();
}
function remedyThang(){
  var v = Math.round(num(($('#remedyThang') || {}).value));
  return v >= 1 ? v : 1;
}
function remedyGrand(){
  return kToDong(remedyThang() * num(($('#remedyUnitPrice') || {}).value));
}
/* Vốn từng vị là đồng nguyên (kg × giá nhập). Chỉ phần lãi chia đều,
   dòng cuối nhận số dư vài đồng. Trả null khi giá khách trả thấp hơn vốn. */
function balanceRemedyMoney(grand, lines){
  var list = lines || [];
  var g0 = money(grand);
  var costs = list.map(function(l){ return money(l.exactCost); });
  var totalCost = 0;
  costs.forEach(function(c){ totalCost += c; });
  if (g0 < totalCost) return null;
  var totals = allocateRemedyByCost(g0, costs.map(function(c){ return { cost: c }; }));
  return costs.map(function(c, i){ return { cost: c, total: totals[i] }; });
}
/* Hàm thuần cho đơn thuốc chén. grand là số khách trả (số nguyên).
   lines[].cost là vốn từng vị, đã là số nguyên.
   Thành tiền vị = vốn + phần lãi chia đều theo số vị.
   Dòng cuối nhận phần dư để tổng các dòng đúng bằng grand. */
function allocateRemedyByCost(grand, lines){
  var list = lines || [];
  var n = list.length;
  if (!n) return [];
  var g0 = money(grand);
  var costs = list.map(function(l){ return money(l.cost); });
  var totalCost = 0;
  costs.forEach(function(c){ totalCost += c; });
  var lai = g0 - totalCost;
  var base = Math.floor(lai / n);
  var allocated = 0;
  return costs.map(function(cost, idx){
    var share = idx === n - 1 ? (lai - allocated) : base;
    allocated += share;
    return cost + share;
  });
}
function calcRemedy(){
  var grand = remedyGrand();
  var items = 0, grams = 0;
  remedyItems.forEach(function(it){
    if (num(it.grams) > 0) { items++; grams += num(it.grams); }
  });
  $$('#remedyBody tr[data-pid]').forEach(function(tr){
    var g = num($('.remedy-qty', tr).value);
    if (g > 0) { items++; grams += g; }
  });
  var out = $('#remedyQty');
  var th = remedyThang();
  if (out) out.textContent = items + ' vị · ' + (grams > 0 ? fmtQty(grams / 1000) : '0 g') + '/thang'
    + (th > 1 && grams > 0 ? ' · tổng ' + th + ' thang: ' + fmtQty(grams * th / 1000) : '');
  var tot = $('#remedyTotal');
  if (tot) tot.textContent = fmtMoney(grand);
  renderRemedyNote();
}

/* ================= ĐƠN THUỐC CÓ SẴN ================= */
function findPreset(id){
  for (var i = 0; i < db.prescriptions.length; i++) {
    if (String(db.prescriptions[i].id) === String(id)) return db.prescriptions[i];
  }
  return null;
}
function presetByName(name){
  var key = capWords(name).toLowerCase();
  if (!key) return null;
  for (var i = 0; i < db.prescriptions.length; i++) {
    if (capWords(db.prescriptions[i].name).toLowerCase() === key) return db.prescriptions[i];
  }
  return null;
}
function collectRemedyItems(){
  if (!commitRemedyRow()) return [];
  calcRemedy();
  var items = [];
  remedyItems.forEach(function(it){
    if (num(it.grams) > 0) items.push({ productId: it.productId, grams: dec(it.grams) });
  });
  return items;
}
function renderPresetOptions(){
  var sel = $('#remedyPreset');
  if (!sel) return;
  var cur = sel.value;
  sel.textContent = '';
  var o0 = el('option', null, 'Đơn mới');
  o0.value = '';
  sel.appendChild(o0);
  db.prescriptions.slice().sort(function(a, b){
    return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
  }).forEach(function(r){
    var o = el('option', null, r.name);
    o.value = r.id;
    sel.appendChild(o);
  });
  if (cur && findPreset(cur)) sel.value = cur;
  else sel.value = '';
  updatePresetUI();
}
function updatePresetUI(){
  var sel = $('#remedyPreset');
  var nameInp = $('#remedyName');
  var lbl = $('#remedySaveLabel');
  var del = $('#remedyDelPreset');
  var copy = $('#remedyCopyPreset');
  var cur = sel && sel.value ? findPreset(sel.value) : null;
  var name = capWords(nameInp ? nameInp.value : '');
  var target = name ? presetByName(name) : cur;
  if (lbl) {
    if (name) {
      if (cur && (!target || String(target.id) === String(cur.id))) lbl.textContent = 'Cập nhật đơn (' + name + ')';
      else if (target) lbl.textContent = 'Tên đã dùng (' + name + ')';
      else lbl.textContent = 'Lưu đơn (' + name + ')';
    }
    else lbl.textContent = 'Lưu đơn';
  }
  if (del) del.hidden = !cur;
  if (copy) copy.hidden = !cur;
}
function loadPreset(id){
  var r = findPreset(id);
  var tb = $('#remedyBody');
  if (!r || !tb) return;
  tb.textContent = '';
  remedyItems = [];
  var missing = 0;
  r.items.forEach(function(it){
    if (!findProduct(it.productId)) { missing++; return; }
    remedyItems.push({ productId: it.productId, grams: dec(num(it.grams)) });
  });
  if (missing) toast('Đơn cũ có ' + missing + ' vị đã bị xóa, kiểm tra lại giá', 'error');
  remedyEditIdx = -1;
  remedyNotePage = 1;
  orderEmpty(tb, 4, '');
  var nameInp = $('#remedyName');
  if (nameInp) nameInp.value = r.name;
  var thang = Math.max(1, Math.round(num(r.thang) || 1));
  var th = $('#remedyThang');
  if (th) th.value = String(thang);
  var up = $('#remedyUnitPrice');
  if (up) up.value = num(r.total) > 0 ? kInput(num(r.total) / thang) : '';
  renumber(tb);
  calcRemedy();
  updatePresetUI();
}
function onPresetChange(){
  var sel = $('#remedyPreset');
  var id = sel ? sel.value : '';
  if (id) { loadPreset(id); return; }
  var tb = $('#remedyBody');
  if (tb) {
    tb.textContent = '';
    orderEmpty(tb, 4, '');
  }
  remedyItems = [];
  remedyEditIdx = -1;
  remedyNotePage = 1;
  var nameInp = $('#remedyName');
  if (nameInp) nameInp.value = '';
  var up = $('#remedyUnitPrice');
  if (up) up.value = '';
  var th = $('#remedyThang');
  if (th) th.value = '1';
  calcRemedy();
  updatePresetUI();
}
/* 2.15.5: chọn "Đơn mới" (value rỗng) hoặc đơn đã lưu; ô tên chỉ hiện khi đang chọn đơn đã lưu (đơn mới: "Lưu đơn" tự mở ô tên). */
function remedyPresetPick(){
  var sel = $('#remedyPreset');
  onPresetChange();
  remedyNameShow(!!(sel && sel.value));
}
function remedyNameShow(show){
  var n = $('#remedyName');
  if (n) n.hidden = !show;
}
/* 2.14.0: chưa có tên và chưa chọn đơn thì chỉ mở ô tên (không đổi logic savePreset). */
function remedySavePresetClick(){
  var sel = $('#remedyPreset');
  var n = $('#remedyName');
  if (!(sel && sel.value) && n && !capWords(n.value)) { remedyNameShow(true); n.focus(); return; }
  savePreset();
  remedyNameShow(!!(sel && sel.value));
}
function savePreset(){
  var nameInp = $('#remedyName');
  var name = capWords(nameInp ? nameInp.value : '');
  if (!name) { toast('Nhập tên đơn', 'error'); if (nameInp) nameInp.focus(); return; }
  if (nameInp) nameInp.value = name;
  var items = collectRemedyItems();
  if (!items.length) { toast('Chọn ít nhất 1 vị thuốc và nhập số gram', 'error'); return; }
  var thang = remedyThang();
  var grand = remedyGrand();
  var limPs = checkLimits('name', name) || checkLimits('thang', thang) || checkLimits('money', grand);
  for (var lg = 0; !limPs && lg < items.length; lg++) limPs = checkLimits('grams', items[lg].grams);
  if (limPs) { toast(limPs, 'error'); return; }
  var sel = $('#remedyPreset');
  var selected = sel && sel.value ? findPreset(sel.value) : null;
  var byName = presetByName(name);
  var cur = selected;
  var msg;

  if (cur) {
    /* Đang sửa một đơn có sẵn: cập nhật theo ID, không dò theo tên. */
    if (byName && String(byName.id) !== String(cur.id)) {
      toast('Tên "' + name + '" đã dùng cho đơn khác', 'error');
      if (nameInp) { nameInp.focus(); if (nameInp.select) nameInp.select(); }
      return;
    }
    if (capWords(cur.name).toLowerCase() !== name.toLowerCase()) {
      var rename = confirm('Đổi tên đơn "' + cur.name + '" thành "' + name + '"?\n\n'
        + 'OK: đổi tên đơn đang chọn.\nHủy: lưu thành đơn mới (giữ lại đơn cũ).');
      if (!rename) cur = null;
    }
  } else if (byName) {
    /* Không chọn đơn nào nhưng tên đã tồn tại: xác nhận ghi đè. */
    if (!confirm('Đơn "' + name + '" đã có. Cập nhật đơn này bằng nội dung đang nhập?')) return;
    cur = byName;
  }

  if (cur) {
    cur.name = name;
    cur.items = items;
    cur.total = dec(grand);
    cur.thang = thang;
    cur.updatedAt = Date.now();
    msg = 'Đã cập nhật đơn "' + name + '"';
  } else {
    cur = { id: uid('RX'), name: name, items: items, total: dec(grand), thang: thang, updatedAt: Date.now() };
    db.prescriptions.push(cur);
    msg = 'Đã lưu đơn "' + name + '"';
  }
  commit(msg);
  if (sel) sel.value = cur.id;
  renderPresetOptions();
  if (sel) sel.value = cur.id;
  updatePresetUI();
}
function delPreset(){
  var sel = $('#remedyPreset');
  var r = sel && sel.value ? findPreset(sel.value) : null;
  if (!r) return;
  if (!confirm('Xóa đơn "' + r.name + '"? Các giao dịch đã bán vẫn được giữ lại.')) return;
  db.prescriptions = db.prescriptions.filter(function(x){ return String(x.id) !== String(r.id); });
  resetRemedy();
  commit('Đã xóa đơn "' + r.name + '"');
}
function copyPreset(){
  var sel = $('#remedyPreset');
  var r = sel && sel.value ? findPreset(sel.value) : null;
  if (!r) { toast('Chọn đơn có sẵn để sao chép', 'error'); return; }
  var items = collectRemedyItems();
  if (!items.length) { toast('Đơn chưa có vị thuốc nào', 'error'); return; }
  var name = window.prompt('Tên đơn mới:', r.name + ' (bản sao)');
  if (name === null) return;
  name = capWords(name);
  if (!name) { toast('Nhập tên đơn', 'error'); return; }
  var limCp = checkLimits('name', name) || checkLimits('thang', remedyThang()) || checkLimits('money', remedyGrand());
  for (var lc = 0; !limCp && lc < items.length; lc++) limCp = checkLimits('grams', items[lc].grams);
  if (limCp) { toast(limCp, 'error'); return; }
  if (presetByName(name)) { toast('Đã có đơn "' + name + '"', 'error'); return; }
  var copy = {
    id: uid('RX'),
    name: name,
    items: items,
    total: dec(remedyGrand()),
    thang: remedyThang(),
    updatedAt: Date.now()
  };
  db.prescriptions.push(copy);
  commit('Đã sao chép đơn "' + r.name + '" thành "' + name + '"');
  var s = $('#remedyPreset');
  if (s) s.value = copy.id;
  loadPreset(copy.id);
}

/* ================= LƯU ĐƠN ================= */
function commit(msg, force){
  touch();
  renderAll();
  if (orderCur) renderOrder();
  pushState(false, !!force);
  if (msg) toast(msg);
}
function saveRetail(){
  refreshAutoDates();
  var date = getDateInput('retailDate') || todayISO();
  if (!commitRetailRow()) return;
  var items = retailItems.map(function(it){ return { pid: it.pid, kg: it.kg, amount: it.amount }; });
  if (!items.length) { toast('Chọn vị thuốc và nhập số lượng hợp lệ', 'error'); return; }
  for (var k = 0; k < items.length; k++) {
    if (items[k].kg <= 0) { toast('Số lượng phải lớn hơn 0', 'error'); return; }
    if (items[k].amount < 0) { toast('Thành tiền không được âm', 'error'); return; }
  }

  var oname = 'Bán lẻ';
  var oid = items.length > 1 ? uid('OD') : null;
  var ts = Date.now();

  var need = {};
  items.forEach(function(it){ need[it.pid] = (need[it.pid] || 0) + it.kg; });
  for (var pid in need) {
    var p = findProduct(pid);
    if (!p) { toast('Vị thuốc không còn tồn tại', 'error'); return; }
    if (need[pid] > p.stock + 1e-9) {
      toast('Tồn "' + p.name + '" không đủ (còn ' + fmtQty(p.stock) + ')', 'error');
      return;
    }
  }
  for (var rk = 0; rk < items.length; rk++) {
    var rlim = checkLimits('money', items[rk].kg > 0 ? money(items[rk].amount / items[rk].kg) : 0);
    if (rlim) { toast('Đơn giá vượt giới hạn (' + fmtNum(MONEY_MAX / DONG_PER_K) + ' nghìn đồng/kg)', 'error'); return; }
  }
  items.forEach(function(it){
    var p = findProduct(it.pid);
    p.stock = dec(p.stock - it.kg);
    var tx = {
      id: uid('TX'), date: date, type: 'BAN', productId: it.pid,
      qty: dec(it.kg), price: it.kg > 0 ? money(it.amount / it.kg) : 0,
      total: money(it.amount), cost: money(it.kg * num(p.costPrice)), ts: ts,
      retail: true
    };
    if (oid) { tx.oid = oid; tx.oname = oname; }
    db.transactions.push(tx);
  });
  resetRetail();
  commit('Đã lưu đơn bán lẻ');
}
function saveRemedy(){
  refreshAutoDates();
  var date = getDateInput('remedyDate') || todayISO();
  if (!commitRemedyRow()) return;
  calcRemedy();
  var grand = remedyGrand();
  var items = [];
  remedyItems.forEach(function(it){
    if (it.productId && num(it.grams) > 0) items.push({ pid: it.productId, g: num(it.grams) });
  });
  if (!items.length) { toast('Chọn ít nhất 1 vị thuốc và nhập số gram', 'error'); return; }
  if (grand <= 0) { toast('Nhập giá 1 thang', 'error'); return; }

  var thang = remedyThang();
  var need = {};
  items.forEach(function(it){ need[it.pid] = (need[it.pid] || 0) + it.g / 1000 * thang; });
  for (var pid in need) {
    var p = findProduct(pid);
    if (!p) { toast('Vị thuốc không còn tồn tại', 'error'); return; }
    if (need[pid] > p.stock + 1e-9) {
      toast('Tồn "' + p.name + '" không đủ (còn ' + fmtQty(p.stock) + ')', 'error');
      return;
    }
  }
  var lim3 = checkLimits('thang', thang) || checkLimits('money', grand);
  if (lim3) {
    toast(lim3, 'error');
    var th = $('#remedyThang'); if (th) th.focus();
    return;
  }
  var priced = items.map(function(it){
    var p = findProduct(it.pid);
    var kg = dec(it.g / 1000 * thang);
    return { it: it, p: p, kg: kg, exactCost: kg * num(p.costPrice) };
  });
  /* Vốn từng vị = kg × giá nhập, làm tròn tới đồng. Khách vẫn trả số thang × giá 1 thang. */
  var balanced = balanceRemedyMoney(grand, priced);
  if (!balanced) { toast('Giá bán thấp hơn vốn của đơn', 'error'); return; }
  for (var rk2 = 0; rk2 < priced.length; rk2++) {
    var rlim2 = checkLimits('money', priced[rk2].kg > 0 ? money(balanced[rk2].total / priced[rk2].kg) : 0);
    if (rlim2) { toast('Đơn giá vượt giới hạn (' + fmtNum(MONEY_MAX / DONG_PER_K) + ' nghìn đồng/kg)', 'error'); return; }
  }
  var oname = capWords(($('#remedyName') || {}).value) || 'Đơn thuốc lẻ';
  var oid = uid('OD');
  var ts = Date.now();
  priced.forEach(function(row, idx){
    var it = row.it;
    var p = row.p;
    var kg = row.kg;
    p.stock = dec(p.stock - kg);
    var amount = balanced[idx].total;
    var tx = {
      id: uid('TX'), date: date, type: 'BAN', productId: it.pid,
      qty: kg, price: kg > 0 ? money(amount / kg) : 0,
      total: amount, cost: balanced[idx].cost,
      rx: true, g: dec(it.g), thang: thang, unitPrice: thang > 0 ? money(grand / thang) : 0,
      ts: ts
    };
    if (oid) { tx.oid = oid; tx.oname = oname; }
    db.transactions.push(tx);
  });
  resetRemedy();
  commit('Đã bán đơn thuốc chén');
}

/* ================= THỐNG KÊ ================= */
function computeStats(transactions, products, today){
  var ym = String(today || '').slice(0, 7), yr = String(today || '').slice(0, 4);
  var dExp = 0, dCogs = 0, mImp = 0, mExp = 0, mCogs = 0, yExp = 0, yCogs = 0;
  var byId = {};
  (products || []).forEach(function(p){ byId[p.id] = p; });
  (transactions || []).forEach(function(t){
    if (!t || !t.date) return;
    var inDay = t.date === today;
    var inMon = t.date.indexOf(ym) === 0;
    var inYear = t.date.indexOf(yr) === 0;
    if (!inDay && !inMon && !inYear) return;
    var v = num(t.total);
    if (t.type === 'NHAP') {
      if (inMon) mImp += v;
      return;
    }
    var c = t.cost != null
      ? num(t.cost)
      : num(t.qty) * (byId[t.productId] ? num(byId[t.productId].costPrice) : 0);
    if (inDay) { dExp += v; dCogs += c; }
    if (inMon) { mExp += v; mCogs += c; }
    if (inYear) { yExp += v; yCogs += c; }
  });
  return {
    dExp: dExp, dCogs: dCogs, mImp: mImp, mExp: mExp, mCogs: mCogs,
    yExp: yExp, yCogs: yCogs,
    profitDay: dExp - dCogs, profitMonth: mExp - mCogs, profitYear: yExp - yCogs,
    stock: (products || []).reduce(function(a, p){ return a + num(p.stock); }, 0)
  };
}
function renderStats(){
  var today = todayISO();
  var s = computeStats(db.transactions, db.products, today);
  lastStatsDay = today;
  var set = function(id, v){ var n = $('#' + id); if (n) n.textContent = v; };
  var setProfit = function(id, v){
    var n = $('#' + id);
    if (!n) return;
    n.textContent = fmtMoneyInt(v);
    n.className = v < 0 ? 'txt-red' : '';
  };
  set('statImport', fmtMoneyInt(s.mImp));
  set('statExport', fmtMoneyInt(s.mExp));
  set('statExportDay', fmtMoneyInt(s.dExp));
  set('statExportYear', fmtMoneyInt(s.yExp));
  setProfit('statProfitDay', s.profitDay);
  setProfit('statProfitYear', s.profitYear);
  var pn = $('#statProfit');
  if (pn) {
    pn.textContent = fmtMoneyInt(s.profitMonth);
    pn.className = 'stat__v ' + (s.profitMonth < 0 ? 'txt-red' : '');
  }
  set('statStock', fmtQtyInt(s.stock));
}
/* ================= PHÂN TRANG ================= */
function mkPageBtn(label, target, disabled, kind, current){
  var b = el('button', 'btn btn--sm pager__num', label);
  b.type = 'button';
  if (current) b.setAttribute('aria-current', 'page');
  if (disabled) { b.disabled = true; return b; }
  b.setAttribute('data-action', 'page');
  b.setAttribute('data-kind', kind);
  b.setAttribute('data-page', String(target));
  return b;
}
function renderPager(host, page, total, kind){
  if (!host) return;
  host.textContent = '';
  if (total <= 1) { host.appendChild(el('span', 'muted small', 'Hiển thị tất cả')); return; }
  host.appendChild(el('span', 'muted small', 'Trang ' + page + ' / ' + total));
  var nav = el('div', 'pager');
  nav.appendChild(mkPageBtn('Trước', page - 1, page <= 1, kind));
  var start = Math.max(1, page - 2), end = Math.min(total, page + 2);
  if (start > 1) {
    nav.appendChild(mkPageBtn('1', 1, false, kind));
    if (start > 2) nav.appendChild(el('span', 'muted small', '…'));
  }
  for (var i = start; i <= end; i++) nav.appendChild(mkPageBtn(String(i), i, false, kind, i === page));
  if (end < total) {
    if (end < total - 1) nav.appendChild(el('span', 'muted small', '…'));
    nav.appendChild(mkPageBtn(String(total), total, false, kind));
  }
  nav.appendChild(mkPageBtn('Sau', page + 1, page >= total, kind));
  host.appendChild(nav);
}
/* ================= MENU THAO TÁC (···) ================= */
/* Menu thao tác nhỏ gắn vào từng dòng (sửa/xóa). Position cố định để không bị
   cắt bởi vùng cuộn ngang của bảng; tự đóng khi bấm ra ngoài/Esc/cuộn trang. */
var rowMenuCur = null;
function closeRowMenu(refocus){
  if (!rowMenuCur) return;
  rowMenuCur.list.hidden = true;
  rowMenuCur.btn.setAttribute('aria-expanded', 'false');
  var b = rowMenuCur.btn;
  rowMenuCur = null;
  if (refocus) { try { b.focus({ preventScroll: true }); } catch (e) { b.focus(); } }
}
function toggleRowMenu(btn, list){
  if (rowMenuCur && rowMenuCur.btn === btn) { closeRowMenu(); return; }
  closeRowMenu();
  list.hidden = false;
  var r = btn.getBoundingClientRect();
  var w = list.offsetWidth, h = list.offsetHeight;
  var left = r.right - w;
  if (left < 8) left = 8;
  if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
  var top = r.bottom + 6;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
  list.style.left = left + 'px';
  list.style.top = top + 'px';
  btn.setAttribute('aria-expanded', 'true');
  rowMenuCur = { btn: btn, list: list };
}
function rowMenu(items, label){
  var wrap = el('div', 'rowmenu');
  var b = el('button', 'btn btn--icon');
  b.type = 'button';
  b.setAttribute('aria-haspopup', 'menu');
  b.setAttribute('aria-expanded', 'false');
  b.setAttribute('aria-label', label || 'Thao tác');
  b.appendChild(svg('dots'));
  var list = el('div', 'rowmenu__list');
  list.setAttribute('role', 'menu');
  list.hidden = true;
  items.forEach(function(it){
    var ib = el('button', 'menu__item' + (it.danger ? ' menu__item--danger' : ''));
    ib.type = 'button';
    ib.setAttribute('role', 'menuitem');
    ib.setAttribute('data-action', it.action);
    if (it.id != null) ib.setAttribute('data-id', it.id);
    if (it.idx != null) ib.setAttribute('data-idx', String(it.idx));
    ib.appendChild(svg(it.icon));
    ib.appendChild(doc.createTextNode(it.label));
    ib.addEventListener('click', closeRowMenu);
    list.appendChild(ib);
  });
  b.addEventListener('click', function(e){ e.stopPropagation(); toggleRowMenu(b, list); });
  wrap.appendChild(b);
  wrap.appendChild(list);
  return wrap;
}
doc.addEventListener('click', function(e){
  if (!rowMenuCur) return;
  var t = e.target;
  if (t && t.closest && (t.closest('.rowmenu__list') || t.closest('.rowmenu'))) return;
  closeRowMenu();
}, true);
doc.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeRowMenu(true); });
doc.addEventListener('scroll', closeRowMenu, true);
window.addEventListener('resize', closeRowMenu);
function emptyRow(tbody, cols, text){
  var tr = el('tr');
  tr.className = 'is-empty';
  var td = el('td', 'muted small empty-cell', text);
  td.colSpan = cols;
  tr.appendChild(td);
  tbody.appendChild(tr);
}

/* ================= TỒN KHO ================= */
function renderInventory(){
  var tbody = $('#invBody');
  if (!tbody) return;
  tbody.textContent = '';
  var kw = normSearch(($('#invSearch') || {}).value || '');
  var list = db.products.filter(function(p){ return !kw || normSearch(p.name).indexOf(kw) >= 0; });

  // Tổng kg đã bán theo từng vị (BAN: bán lẻ + đơn chén, đều lưu qty_kg)
  var sales = {};
  db.transactions.forEach(function(t){
    if (t && t.type === 'BAN') {
      var pid = t.productId;
      sales[pid] = (sales[pid] || 0) + num(t.qty);
    }
  });

  list.sort(function(a, b){
    return ((sales[b.id] || 0) - (sales[a.id] || 0)) || sortByName(a, b);
  });

  var count = $('#invCount');
  if (count) count.textContent = list.length + ' vị thuốc';

  if (!list.length) {
    emptyRow(tbody, 5, db.products.length ? 'Không tìm thấy vị thuốc phù hợp.' : 'Chưa có vị thuốc nào trong kho.');
    renderPager($('#invPager'), 1, 1, 'inv');
    return;
  }

  var totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  if (invPage < 1) invPage = 1;
  if (invPage > totalPages) invPage = totalPages;
  var slice = list.slice((invPage - 1) * PAGE_SIZE, invPage * PAGE_SIZE);

  slice.forEach(function(p){
    var tr = el('tr');
    tr.className = 'is-row';
    tr.appendChild(el('td', 'b', p.name));
    var cSold = el('td', 'num muted', fmtQty(sales[p.id] || 0));
    cSold.setAttribute('data-label', 'Đã bán');
    tr.appendChild(cSold);
    var cStock = el('td', 'num', fmtQty(p.stock));
    cStock.setAttribute('data-label', 'Tồn kho');
    tr.appendChild(cStock);
    var cCost = el('td', 'num muted', fmtUnitPrice(p.costPrice));
    cCost.setAttribute('data-label', 'Giá nhập');
    tr.appendChild(cCost);

    var tdA = el('td', 'c-del');
    tdA.appendChild(rowMenu([
      { label: 'Sửa vị thuốc', icon: 'edit', action: 'edit-prod', id: p.id },
      { label: 'Xóa vị thuốc', icon: 'trash', action: 'del-prod', id: p.id, danger: true }
    ], 'Thao tác với ' + p.name));
    tr.appendChild(tdA);
    tbody.appendChild(tr);
  });
  renderPager($('#invPager'), invPage, totalPages, 'inv');
}

/* ================= LỊCH SỬ ================= */
function txName(t){
  var p = findProduct(t.productId);
  return p ? p.name : null;
}
function timeVN(ts){
  var d = new Date(num(ts));
  if (!isFinite(d.getTime())) return '';
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
function appendOrderRow(tbody, r, isImp){
  var tr = el('tr');
  tr.className = 'is-row';
  tr.appendChild(el('td', 'muted small', dateVN(r.date) + (r.hasTime ? ' ' + timeVN(r.ts) : '')));
  var tn = el('td', 'b');
  var nameBtn = el('button', 'linkbtn', r.oname);
  nameBtn.type = 'button';
  nameBtn.setAttribute('data-action', 'order-view');
  nameBtn.setAttribute('data-oid', r.oid);
  var ariaOrder = (r.oname && r.oname.indexOf('ngày') !== -1)
    ? ('Xem chi tiết ' + r.oname)
    : ('Xem chi tiết ' + r.oname + ' ngày ' + dateVN(r.date));
  nameBtn.setAttribute('aria-label', ariaOrder);
  tn.appendChild(nameBtn);
  tn.appendChild(el('span', 'muted small', ' · ' + r.n + ' vị'));
  tr.appendChild(tn);
  var cQty = el('td', 'num', fmtQty(r.qty));
  cQty.setAttribute('data-label', 'SL');
  tr.appendChild(cQty);
  var cPrice = el('td', 'num muted', '—');
  cPrice.setAttribute('data-label', 'Đơn giá');
  tr.appendChild(cPrice);
  var cTotal = el('td', 'num b ' + (isImp ? 'txt-blue' : 'txt-green'), fmtMoney(r.total));
  cTotal.setAttribute('data-label', 'Thành tiền');
  tr.appendChild(cTotal);
  var td = el('td', 'c-act');
  td.appendChild(rowMenu([
    { label: 'Xóa đơn', icon: 'trash', action: 'del-order', id: r.oid, danger: true }
  ], 'Thao tác với ' + r.oname));
  tr.appendChild(td);
  tbody.appendChild(tr);
}
var orderCur = null, orderPage = 1;
function renderOrder(){
  var items = db.transactions.filter(function(t){
    return t.oid && String(t.oid) === String(orderCur);
  });
  var tb = $('#orderBody');
  if (!items.length) { closeOrder(); return; }
  if (!tb) return;
  var first = items[0];
  var isImp = first.type === 'NHAP';
  var oname = (first.oname && first.oname !== first.oid) ? first.oname : (isImp ? ('Đơn nhập ngày ' + dateVN(first.date)) : '');
  var isRetail = !isImp && (items.some(function(t){ return t.retail; }) || oname === 'Bán lẻ');
  var preset = (!isImp && !isRetail) ? presetByName(oname) : null;
  var metaThang = 0, metaUnit = 0;
  items.forEach(function(t){
    if (num(t.thang) > 0) metaThang = num(t.thang);
    if (num(t.unitPrice) > 0) metaUnit = num(t.unitPrice);
  });
  var thang = 0;
  if (!isImp && !isRetail) {
    if (metaThang > 0) thang = Math.max(1, Math.round(metaThang));
    else if (preset) thang = Math.max(1, Math.round(num(preset.thang) || 1));
  }
  var totalMoney = 0, totalKg = 0, maxTs = 0, hasTime = false;
  items.forEach(function(t){
    totalMoney += num(t.total);
    totalKg += num(t.qty);
    var s = txStamp(t);
    if (s > maxTs) maxTs = s;
    if (txHasTime(t)) hasTime = true;
  });
  var perThang = !isImp && thang > 0;
  var unitPrice = perThang ? (metaUnit > 0 ? metaUnit : dec(totalMoney / thang)) : 0;

  var gramsPerThang = 0;
  items.forEach(function(t){
    if (perThang) gramsPerThang += num(t.g) > 0 ? num(t.g) : num(t.qty) * 1000 / thang;
  });

  var qtyHead = $('#orderQtyHead');
  if (qtyHead) qtyHead.textContent = perThang ? 'SL (gram)' : 'SL';
  var priceHead = $('#orderPriceHead');
  if (priceHead) priceHead.hidden = !isImp;
  var moneyHead = $('#orderMoneyHead');
  if (moneyHead) moneyHead.hidden = perThang;
  var footLabel = $('#orderFootLabel');
  if (footLabel) footLabel.textContent = perThang ? 'Tổng 1 thang' : 'Tổng cộng';
  var footQty = $('#orderFootQty');
  if (footQty) footQty.textContent = perThang ? fmtGram(gramsPerThang) : fmtQty(totalKg);
  var footPrice = $('#orderFootPrice');
  if (footPrice) { footPrice.hidden = !isImp; footPrice.textContent = '—'; }
  var footMoney = $('#orderFootMoney');
  if (footMoney) {
    footMoney.hidden = perThang;
    footMoney.textContent = fmtMoney(totalMoney);
  }

  var meta = $('#orderMeta');
  if (meta) {
    var parts = ['Ngày ' + dateVN(first.date) + (hasTime ? ' ' + timeVN(maxTs) : ''), items.length + ' vị'];
    if (perThang) {
      parts.push(fmtQty(gramsPerThang / 1000) + '/thang');
      if (thang > 1) parts.push('tổng ' + thang + ' thang: ' + fmtQty(totalKg));
    } else {
      parts.push(fmtQty(totalKg));
    }
    meta.textContent = parts.join(' · ');
  }
  var title = $('#orderTitle');
  if (title) title.textContent = isImp ? ('Đơn nhập ngày ' + dateVN(first.date)) : oname;
  var noteTitle = $('#orderNoteTitle');
  if (noteTitle) noteTitle.textContent = isImp ? 'Tờ ghi nhập hàng' : (perThang ? 'Tờ ghi đơn thuốc chén' : (isRetail ? 'Tờ ghi đơn bán lẻ' : 'Tờ ghi đơn'));

  var pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  if (orderPage > pages) orderPage = pages;
  if (orderPage < 1) orderPage = 1;
  var start = (orderPage - 1) * PAGE_SIZE;
  tb.textContent = '';
  items.slice(start, start + PAGE_SIZE).forEach(function(t, k){
    var i = start + k;
    var p = findProduct(t.productId);
    var tr = el('tr');
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', p ? p.name : 'Đã xóa'));
    if (perThang) {
      var g = num(t.g) > 0 ? num(t.g) : num(t.qty) * 1000 / thang;
      tr.appendChild(el('td', 'num', fmtGram(g)));
    } else {
      var cq = el('td', 'num', fmtQty(t.qty));
      if (!isImp && !t.rx) {
        var cp2 = costParen(t.cost, t.qty);
        if (cp2) {
          var sp3 = el('span', 'muted small', ' ' + cp2);
          sp3.setAttribute('title', 'Giá vốn tại thời điểm bán (nghìn đồng/kg)');
          cq.appendChild(sp3);
        }
      }
      tr.appendChild(cq);
      if (isImp) tr.appendChild(el('td', 'num r', fmtUnitPrice(t.price)));
      tr.appendChild(el('td', 'num r b ' + (isImp ? 'txt-blue' : 'txt-green'), fmtMoney(t.total)));
    }
    var tdA = el('td', 'c-act');
    tdA.appendChild(rowMenu([
      { label: 'Sửa dòng', icon: 'edit', action: 'tx-edit', id: t.id },
      { label: 'Xóa dòng', icon: 'trash', action: 'del-tx', id: t.id, danger: true }
    ], 'Thao tác với dòng ' + (i + 1)));
    tr.appendChild(tdA);
    tb.appendChild(tr);
  });
  var pg = $('#orderNotePg');
  if (pg) pg.textContent = 'Trang ' + orderPage + ' / ' + pages;
  var host = $('#orderPager');
  if (host) {
    host.hidden = pages <= 1;
    if (pages > 1) renderPager(host, orderPage, pages, 'order');
  }

  var params = $('#orderParams');
  if (params) params.hidden = !perThang;
  if (perThang) {
    var pt = $('#orderThang');
    if (pt) pt.textContent = String(thang);
    var pu = $('#orderUnitPrice');
    if (pu) pu.textContent = fmtMoney(unitPrice);
    var po = $('#orderTotal');
    if (po) po.textContent = fmtMoney(totalMoney);
  }
}
function openOrder(oid){
  orderCur = String(oid);
  orderPage = 1;
  renderOrder();
  var d = $('#orderDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function closeOrder(){
  var d = $('#orderDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
  orderCur = null;
}
function dateVN(iso){
  var d = String(iso || '').split('-');
  return d.length === 3 ? d[2] + '/' + d[1] + '/' + d[0] : 'Không rõ ngày';
}
/* N5 (2.13.0): không còn Gần nhất/Tất cả; luôn sắp mới nhất trước; ô tìm theo tên áp cho cả hai lịch sử. */
function historyData(kind, month, q){
  var isImp = kind === 'imp';
  indexTx();
  var nq = normSearch(q || '');
  var list = db.transactions.filter(function(t){
    if (t.type !== (isImp ? 'NHAP' : 'BAN')) return false;
    if (isImp) return true;
    return !month || (t.date && String(t.date).indexOf(month) === 0);
  });

  var oidCount = {};
  if (isImp) {
    list.forEach(function(t){ if (t.oid) oidCount[t.oid] = (oidCount[t.oid] || 0) + 1; });
  }

  var map = {}, rows = [];
  list.forEach(function(t){
    var groupable = !!t.oid && (isImp ? oidCount[t.oid] > 1 : !!t.oname);
    if (!groupable) {
      rows.push({
        single: true, tx: t,
        date: String(t.date || ''),
        ts: txStamp(t), hasTime: txHasTime(t),
        name: txName(t), qty: num(t.qty), total: num(t.total), price: num(t.price)
      });
      return;
    }
    var g = map[t.oid];
    if (!g) {
      g = map[t.oid] = {
        group: true, oid: t.oid, oname: t.oname || '',
        date: String(t.date || ''), ts: txStamp(t), hasTime: txHasTime(t),
        qty: 0, total: 0, n: 0, items: [], name: ''
      };
      rows.push(g);
    }
    g.items.push(t);
    g.qty += num(t.qty);
    g.total += num(t.total);
    g.n++;
    var s = txStamp(t);
    if (s > g.ts) g.ts = s;
    if (txHasTime(t)) g.hasTime = true;
  });

  rows.forEach(function(r){
    if (!r.group) return;
    if (!r.oname || r.oname === r.oid) {
      r.oname = isImp ? ('Đơn nhập ngày ' + dateVN(r.date) + (r.hasTime ? ' · ' + timeVN(r.ts) : '')) : 'Đơn';
    }
    r.name = r.oname;
  });

  if (nq) {
    rows = rows.filter(function(r){
      if (r.group) {
        if (normSearch(r.name || '').indexOf(nq) >= 0) return true;
        return r.items.some(function(t){ var nm = txName(t); return nm && normSearch(nm).indexOf(nq) >= 0; });
      }
      return r.name && normSearch(r.name).indexOf(nq) >= 0;
    });
  }

  var latestDate = '', latestTs = -Infinity, latestHasTime = false;
  rows.forEach(function(r){
    if (!r.date) return;
    if (r.date > latestDate || (r.date === latestDate && r.ts > latestTs)) {
      latestDate = r.date;
      latestTs = r.ts;
      latestHasTime = r.hasTime;
    }
  });

  rows.sort(function(a, b){
    if (b.ts !== a.ts) return b.ts - a.ts;
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return 0;
  });

  return { rows: rows, latestDate: latestDate, latestTs: latestTs, latestHasTime: latestHasTime };
}
function renderHistory(kind){
  var isImp = kind === 'imp';
  var tbody = $('#' + kind + 'Body');
  if (!tbody) return;
  var month = isImp ? '' : getMonthInput('expMonth');
  var sq = String(($('#' + kind + 'Search') || {}).value || '');
  var data = historyData(kind, month, sq);
  var rows = data.rows;

  var count = $('#' + kind + 'Count');
  if (count) {
    var suffix = '';
    if (data.latestDate) {
      suffix = ' · ' + (isImp ? 'nhập' : 'bán') + ' gần nhất ' + dateVN(data.latestDate) +
        (data.latestHasTime ? ' ' + timeVN(data.latestTs) : '');
    }
    count.textContent = rows.length + (isImp ? ' lần nhập' : ' giao dịch') + suffix;
  }

  tbody.textContent = '';
  if (!rows.length) {
    emptyRow(tbody, 6, isImp ? 'Không có giao dịch nhập.' : 'Không có giao dịch bán.');
    renderPager($('#' + kind + 'Pager'), 1, 1, kind);
    return;
  }

  var page = isImp ? impPage : expPage;
  var totalPages = Math.ceil(rows.length / PAGE_SIZE) || 1;
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;
  if (isImp) impPage = page; else expPage = page;
  var slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  slice.forEach(function(r){
    if (r.group) { appendOrderRow(tbody, r, isImp); return; }
    var t = r.tx;
    var tr = el('tr');
    tr.className = 'is-row';
    tr.appendChild(el('td', 'muted small', dateVN(t.date) + (r.hasTime ? ' ' + timeVN(r.ts) : '')));
    var name = r.name;
    tr.appendChild(el('td', 'b', name === null ? 'Đã xóa' : name));
    var cQty = el('td', 'num', fmtQty(t.qty));
    cQty.setAttribute('data-label', 'SL');
    if (!isImp && !t.rx) {
      var cp = costParen(t.cost, t.qty);
      if (cp) {
        var sp2 = el('span', 'muted small', ' ' + cp);
        sp2.setAttribute('title', 'Giá vốn tại thời điểm bán (nghìn đồng/kg)');
        cQty.appendChild(sp2);
      }
    }
    tr.appendChild(cQty);
    var cPrice = el('td', 'num muted', fmtUnitPrice(t.price));
    cPrice.setAttribute('data-label', 'Đơn giá');
    tr.appendChild(cPrice);
    var cTotal = el('td', 'num b ' + (isImp ? 'txt-blue' : 'txt-green'), fmtMoney(t.total));
    cTotal.setAttribute('data-label', 'Thành tiền');
    tr.appendChild(cTotal);
    var td = el('td', 'c-act');
    td.appendChild(rowMenu([
      { label: 'Sửa giao dịch', icon: 'edit', action: 'tx-edit', id: t.id },
      { label: 'Xóa giao dịch', icon: 'trash', action: 'del-tx', id: t.id, danger: true }
    ], 'Thao tác với giao dịch ngày ' + dateVN(t.date)));
    tr.appendChild(td);
    tbody.appendChild(tr);
  });
  renderPager($('#' + kind + 'Pager'), page, totalPages, kind);
}
/* ================= ĐỐI CHIẾU TỒN KHO ================= */
function reconcileList(){
  var inn = {}, out = {};
  db.transactions.forEach(function(t){
    var m = t.type === 'NHAP' ? inn : out;
    m[t.productId] = (m[t.productId] || 0) + num(t.qty);
  });
  var res = [];
  db.products.forEach(function(p){
    var calc = dec((inn[p.id] || 0) - (out[p.id] || 0));
    var diff = dec(num(p.stock) - calc);
    if (Math.abs(diff) > 1e-9) res.push({ id: p.id, name: p.name, stock: num(p.stock), calc: calc, diff: diff });
  });
  res.sort(function(a, b){ return Math.abs(b.diff) - Math.abs(a.diff); });
  return res;
}
function fmtKgExact(v){ return fmtNum(v) + ' kg'; }
function renderRec(){
  var tb = $('#recBody');
  if (!tb) return;
  var list = reconcileList();
  tb.textContent = '';
  var hint = $('#recHint');
  if (hint) {
    hint.textContent = list.length
      ? list.length + ' vị thuốc có tồn khác với số tính từ lịch sử (tổng nhập trừ tổng bán). Chỉ áp dụng khi bạn chắc lịch sử đúng; nếu lịch sử có dòng nhập nhầm thì sửa dòng đó trước.'
      : 'Tồn kho của tất cả vị thuốc khớp với lịch sử nhập và bán.';
  }
  list.forEach(function(r){
    var tr = el('tr');
    tr.appendChild(el('td', 'b', r.name));
    tr.appendChild(el('td', 'num', fmtKgExact(r.stock)));
    tr.appendChild(el('td', 'num', fmtKgExact(r.calc)));
    tr.appendChild(el('td', 'num', (r.diff > 0 ? '+' : '') + fmtKgExact(r.diff)));
    var td = el('td', 'c-act');
    var b = el('button', 'btn btn--sm', 'Dùng số lịch sử');
    b.type = 'button';
    b.setAttribute('data-action', 'rec-fix');
    b.setAttribute('data-id', r.id);
    td.appendChild(b);
    tr.appendChild(td);
    tb.appendChild(tr);
  });
  var fa = $('#recFixAll');
  if (fa) fa.hidden = !list.length;
}
function openRec(){
  renderRec();
  var d = $('#recDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function closeRec(){
  var d = $('#recDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
}
function recFix(id){
  var p = findProduct(id);
  if (!p) return;
  var r = null;
  reconcileList().forEach(function(x){ if (String(x.id) === String(id)) r = x; });
  if (!r) return;
  if (r.calc < -1e-9) {
    toast('Số theo lịch sử đang âm — không thể áp dụng. Hãy sửa giao dịch nhập/bán trước.', 'error');
    return;
  }
  var limFx = checkLimits('q', Math.max(0, r.calc));
  if (limFx) { toast(limFx, 'error'); return; }
  if (!confirm('Đặt tồn "' + p.name + '" từ ' + fmtQty(p.stock) + ' về ' + fmtQty(Math.max(0, r.calc)) + '?')) return;
  p.stock = Math.max(0, r.calc);
  commit('Đã chỉnh tồn "' + p.name + '"');
  renderRec();
}
function recFixAll(){
  var list = reconcileList();
  if (!list.length) return;
  var valid = list.filter(function(r){ return r.calc >= -1e-9 && !checkLimits('q', Math.max(0, r.calc)); });
  if (!valid.length) {
    toast('Tất cả vị lệch đều có số lịch sử âm — hãy sửa giao dịch trước.', 'error');
    return;
  }
  if (!confirm('Đặt lại tồn của ' + valid.length + ' vị thuốc theo lịch sử?' +
    (valid.length < list.length ? '\n(' + (list.length - valid.length) + ' vị có số âm hoặc vượt giới hạn sẽ bỏ qua.)' : ''))) return;
  valid.forEach(function(r){
    var p = findProduct(r.id);
    if (p) p.stock = Math.max(0, r.calc);
  });
  commit('Đã chỉnh tồn ' + valid.length + ' vị thuốc');
  renderRec();
}
/* ================= BIỂU ĐỒ ================= */
var chartSel = -1, chartGeo = null;
function chartData(){
  var year = ($('#chartYear') || {}).value || thisYear();
  var imp = [], exp = [], impK = [], expK = [];
  for (var m = 1; m <= 12; m++) {
    var ym = year + '-' + pad2(m);
    var a = 0, b = 0, ak = 0, bk = 0;
    db.transactions.forEach(function(t){
      if (!t.date || t.date.indexOf(ym) !== 0) return;
      var v = num(t.total);
      if (t.type === 'NHAP') { a += v / 1000000; ak += v; }
      else { b += v / 1000000; bk += v; }
    });
    imp.push(dec(a)); exp.push(dec(b));
    impK.push(dec(ak)); expK.push(dec(bk));
  }
  return { imp: imp, exp: exp, impK: impK, expK: expK, year: year };
}
/* 2.13.2: tháng mặc định. Năm hiện tại → tháng hiện tại; năm khác → tháng cuối có dữ liệu; không có → 12 (index 11). */
function chartDefaultMonth(year, nowYear, nowMonth0, hasData){
  if (String(year) === String(nowYear)) return nowMonth0;
  for (var m = 11; m >= 0; m--) if (hasData[m]) return m;
  return 11;
}
function niceMax(v){
  if (v <= 0) return 1;
  var e = Math.pow(10, Math.floor(Math.log10(v)));
  var m = v / e;
  var n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return n * e;
}
function axisLabel(v){
  if (v >= 1000) return NF1.format(v / 1000) + ' tỷ';
  if (v >= 10) return NF0.format(v);
  if (v >= 1) return NF1.format(v);
  return v === 0 ? '0' : NF2.format(v);
}
function bar(ctx, x, y, w, h, r){
  if (h <= 0.2 || w <= 0) return;
  r = Math.min(r, w / 2, h);
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();
}
function renderChart(){
  var cv = $('#statsChart');
  if (!cv || !cv.offsetParent) return;
  var host = cv.parentNode;
  var cssW = cv.clientWidth || host.clientWidth || 600;
  var cssH = cv.clientHeight || 300;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(cssW * dpr);
  cv.height = Math.round(cssH * dpr);
  var ctx = cv.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  var cs = getComputedStyle(doc.documentElement);
  var colText = cs.getPropertyValue('--muted').trim() || '#5b6b81';
  var colGrid = cs.getPropertyValue('--border').trim() || '#e3e8ef';

  var data = chartData();
  var max = 0;
  data.imp.forEach(function(v){ if (v > max) max = v; });
  data.exp.forEach(function(v){ if (v > max) max = v; });
  max = niceMax(max);
  var hasData = [];
  for (var hm = 0; hm < 12; hm++) hasData.push(data.impK[hm] + data.expK[hm] > 0);
  var shown = chartSel >= 0 && chartSel < 12 ? chartSel : chartDefaultMonth(data.year, thisYear(), parseInt(todayISO().slice(5, 7), 10) - 1, hasData);

  var padL = 44, padR = 8, padT = 12, padB = 26;
  var W = Math.max(10, cssW - padL - padR);
  var H = Math.max(10, cssH - padT - padB);
  var groupW = W / 12;
  var bw = Math.max(3, Math.min(16, groupW / 3));
  var y0 = padT + H;

  ctx.font = '11px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
  ctx.textBaseline = 'middle';

  for (var g = 0; g <= 4; g++) {
    var val = max * g / 4;
    var y = Math.round(y0 - H * g / 4) + 0.5;
    ctx.strokeStyle = colGrid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + W, y);
    ctx.stroke();
    ctx.fillStyle = colText;
    ctx.textAlign = 'right';
    ctx.fillText(axisLabel(val), padL - 7, y);
  }

  for (var i = 0; i < 12; i++) {
    var cx = padL + groupW * i + groupW / 2;
    if (i === shown) {
      ctx.fillStyle = 'rgba(99,102,241,.14)';
      ctx.fillRect(padL + groupW * i, padT, groupW, H);
    }
    ctx.fillStyle = cs.getPropertyValue('--chart-imp').trim() || '#6366f1';
    bar(ctx, cx - bw - 1, y0 - H * data.imp[i] / max, bw, H * data.imp[i] / max, 3);
    ctx.fillStyle = cs.getPropertyValue('--chart-exp').trim() || '#10b981';
    bar(ctx, cx + 1, y0 - H * data.exp[i] / max, bw, H * data.exp[i] / max, 3);
    ctx.fillStyle = colText;
    ctx.textAlign = 'center';
    ctx.fillText('T' + (i + 1), cx, y0 + 13);
  }

  chartGeo = { padL: padL, padT: padT, W: W, H: H, groupW: groupW, y0: y0, cssW: cssW, cssH: cssH };
  var mmStr = pad2(shown + 1) + '/' + data.year;
  var impTxt = fmtMoneyInt(data.impK[shown]), expTxt = fmtMoneyInt(data.expK[shown]);
  var mEl = $('#chartMonth'), iEl = $('#chartImpChip'), eEl = $('#chartExpChip'), sEl = $('#chartTipSr');
  if (mEl) mEl.textContent = mmStr;
  /* 2.15.0: chú giải "[ô màu] Nhập số tiền"; số tiền nằm trong phần tử con (chip còn nhãn + ô màu). */
  var iV = $('#chartImpVal') || iEl, eV = $('#chartExpVal') || eEl;
  if (iV) iV.textContent = impTxt;
  if (eV) eV.textContent = expTxt;
  if (sEl) sEl.textContent = 'Tháng ' + mmStr + ' — Nhập: ' + impTxt + ' · Bán: ' + expTxt;
}
function onChartClick(e){
  var cv = $('#statsChart');
  if (!cv || !chartGeo) return;
  var r = cv.getBoundingClientRect();
  var g = chartGeo;
  var x = (e.clientX - r.left) * (g.cssW / (r.width || g.cssW));
  var y = (e.clientY - r.top) * (g.cssH / (r.height || g.cssH));
  if (x < g.padL || x > g.padL + g.W || y < g.padT || y > g.y0 + 14) return;
  var i = Math.floor((x - g.padL) / g.groupW);
  if (i < 0) i = 0; else if (i > 11) i = 11;
  chartSel = chartSel === i ? -1 : i;
  renderChart();
}

/* ================= GỢI Ý TÌM NHANH ================= */
var SUG = {
  retail: { input: 'retailSearch', list: 'retailList' },
  remedy: { input: 'remedySearch', list: 'remedyList' },
  nhap:   { input: 'nhapSearch', list: 'nhapList' },
  inv:    { input: 'invSearch', list: 'invList' },
  imph:   { input: 'impSearch', list: 'impSearchList' }
};
var sugIdx = -1;

function matchProducts(q){
  var nq = normSearch(q);
  var arr = db.products.filter(function(p){ return !nq || normSearch(p.name).indexOf(nq) >= 0; });
  arr.sort(function(a, b){
    var sa = nq && normSearch(a.name).indexOf(nq) === 0 ? 0 : 1;
    var sb = nq && normSearch(b.name).indexOf(nq) === 0 ? 0 : 1;
    return (sa - sb) || sortByName(a, b);
  });
  return arr.slice(0, 50);
}
function closeSuggest(key){
  var cfg = SUG[key];
  if (!cfg) return;
  var list = $('#' + cfg.list), inp = $('#' + cfg.input);
  if (list) list.hidden = true;
  if (inp) inp.setAttribute('aria-expanded', 'false');
  sugIdx = -1;
}
function openSuggest(key){
  var cfg = SUG[key];
  if (!cfg) return;
  var inp = $('#' + cfg.input), list = $('#' + cfg.list);
  if (!inp || !list) return;
  var items = matchProducts(inp.value);
  var raw = String(inp.value || '').trim();
  var exact = false;
  list.textContent = '';
  sugIdx = -1;
  items.forEach(function(p){
    if (raw && capWords(p.name).toLowerCase() === capWords(raw).toLowerCase()) exact = true;
    var b = el('button', 'sug__item');
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', 'false');
    b.setAttribute('data-pid', p.id);
    b.appendChild(el('span', 'sug__name', p.name));
    var meta = 'Tồn ' + fmtQty(p.stock);
    var pr = refPrice(p);
    if (pr > 0) meta += ' · ' + fmtUnitPrice(pr);
    b.appendChild(el('span', 'sug__meta', meta));
    b.addEventListener('mousedown', function(e){ e.preventDefault(); pickSuggest(key, p.id); });
    list.appendChild(b);
  });
  if (key === 'nhap' && raw && !exact) {
    var nb = el('button', 'sug__item');
    nb.type = 'button';
    nb.setAttribute('role', 'option');
    nb.setAttribute('aria-selected', 'false');
    nb.appendChild(el('span', 'sug__name', 'Tạo mới: ' + capWords(raw)));
    nb.appendChild(el('span', 'sug__meta', 'Vị thuốc mới'));
    nb.addEventListener('mousedown', function(e){ e.preventDefault(); nhapNewProduct(raw); });
    list.appendChild(nb);
  }
  if (!list.children.length) list.appendChild(el('div', 'sug__empty', 'Không tìm thấy vị thuốc nào'));
  list.hidden = false;
  inp.setAttribute('aria-expanded', 'true');
}
function dupOrderRow(bodySel, pid){
  var found = null;
  $$(bodySel + ' tr[data-pid]').forEach(function(tr){
    if (tr.getAttribute('data-pid') === String(pid)) found = tr;
  });
  return found;
}
function pickSuggest(key, id){
  var p = findProduct(id);
  if (!p) return;
  if (key === 'retail' || key === 'remedy') {
    var isR = key === 'retail';
    var dup = dupOrderRow(isR ? '#retailBody' : '#remedyBody', p.id);
    if (isR && !dup) {
      for (var di = 0; di < retailItems.length; di++) {
        if (String(retailItems[di].pid) !== String(p.id)) continue;
        toast('"' + p.name + '" đã có trong tờ ghi — bấm sửa để đổi SL', 'error');
        noteEditIdx = di;
        notePage = Math.floor(di / PAGE_SIZE) + 1;
        renderNote();
        var eq2 = $('#noteEditQty');
        if (eq2) { eq2.focus(); eq2.select(); }
        var s9 = $('#retailSearch');
        if (s9) s9.value = '';
        closeSuggest(key);
        return;
      }
    }
    if (!isR && !dup) {
      for (var dj = 0; dj < remedyItems.length; dj++) {
        if (String(remedyItems[dj].productId) !== String(p.id)) continue;
        toast('"' + p.name + '" đã có trong tờ ghi — bấm sửa để đổi gram', 'error');
        remedyEditIdx = dj;
        remedyNotePage = Math.floor(dj / PAGE_SIZE) + 1;
        renderRemedyNote();
        var eq3 = $('#remedyNoteEditQty');
        if (eq3) { eq3.focus(); eq3.select(); }
        var s8 = $('#remedySearch');
        if (s8) s8.value = '';
        closeSuggest(key);
        return;
      }
    }
    if (dup) {
      toast('"' + p.name + '" đã có trong danh sách', 'error');
      var q0 = $(isR ? '.retail-qty' : '.remedy-qty', dup);
      if (q0) { q0.focus(); if (q0.select) q0.select(); }
      var s0 = $(isR ? '#retailSearch' : '#remedySearch');
      if (s0) s0.value = '';
      closeSuggest(key);
      return;
    }
  }
  if (key === 'retail') {
    if (!commitRetailRow()) return;
    var row = addOrderRow('retail', p.id);
    if (row) $('.retail-qty', row).focus();
    var s1 = $('#retailSearch');
    if (s1) s1.value = '';
    calcRetail();
  } else if (key === 'remedy') {
    if (!commitRemedyRow()) return;
    var row2 = addOrderRow('remedy', p.id);
    if (row2) $('.remedy-qty', row2).focus();
    var s2 = $('#remedySearch');
    if (s2) s2.value = '';
    calcRemedy();
  } else if (key === 'nhap') {
    nhapPick(p);
  } else if (key === 'inv') {
    $('#invSearch').value = p.name;
    invPage = 1;
    renderInventory();
  } else if (key === 'imph') {
    s9 = $('#impSearch');
    if (s9) s9.value = p.name;
    impPage = 1;
    renderHistory('imp');
  }
  closeSuggest(key);
}
function onSuggestKey(e, key){
  var cfg = SUG[key];
  if (!cfg) return;
  var list = $('#' + cfg.list);
  if (!list) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (list.hidden) { openSuggest(key); }
    var items = $$('.sug__item', list);
    if (!items.length) return;
    sugIdx = (sugIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach(function(n, i){ n.setAttribute('aria-selected', i === sugIdx ? 'true' : 'false'); });
    items[sugIdx].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    var items2 = $$('.sug__item', list);
    if (list.hidden || !items2.length) return;
    var pick = null;
    if (sugIdx >= 0) pick = items2[sugIdx] || null;
    if (!pick) {
      var inp = $('#' + cfg.input);
      var raw = String(inp && inp.value || '').trim();
      var prods = raw ? matchProducts(raw) : [];
      var wantId = null;
      for (var pi = 0; pi < prods.length; pi++) {
        if (normSearch(prods[pi].name) === normSearch(raw)) { wantId = String(prods[pi].id); break; }
      }
      if (wantId === null && prods.length === 1) wantId = String(prods[0].id);
      if (wantId !== null) {
        for (var bi = 0; bi < items2.length; bi++) {
          if (items2[bi] && items2[bi].getAttribute && items2[bi].getAttribute('data-pid') === wantId) { pick = items2[bi]; break; }
        }
      }
    }
    if (pick) {
      e.preventDefault();
      pick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    }
  } else if (e.key === 'Escape') {
    closeSuggest(key);
  }
}
function initSuggest(){
  Object.keys(SUG).forEach(function(key){
    var cfg = SUG[key];
    var inp = $('#' + cfg.input);
    if (!inp) return;
    inp.addEventListener('input', function(){ openSuggest(key); });
    inp.addEventListener('keydown', function(e){ onSuggestKey(e, key); });
    inp.addEventListener('blur', function(){ setTimeout(function(){ closeSuggest(key); }, 140); });
  });
}
/* ================= NHẬP HÀNG ================= */
var nhapPid = null;
function findByName(name){
  var key = capWords(name).toLowerCase();
  if (!key) return null;
  for (var i = 0; i < db.products.length; i++) {
    if (capWords(db.products[i].name).toLowerCase() === key) return db.products[i];
  }
  return null;
}
function nhapPick(p){
  nhapPid = p.id;
  var inp = $('#nhapSearch');
  if (inp) inp.value = p.name;
  var price = $('#nhapPrice');
  var l = lastImport(p.id);
  var v = l ? l.price : num(p.costPrice);
  if (price) price.value = v > 0 ? kInput(v) : '';
  var hint = $('#nhapHint');
  if (hint) {
    if (v > 0) {
      var txt = 'Giá nhập gần nhất: ' + fmtUnitPrice(v);
      if (l && l.date) {
        txt += ' (ngày ' + dateVN(l.date) + (l.hasTime ? ' ' + timeVN(l.ts) : '') + ')';
      }
      hint.textContent = txt;
      hint.hidden = false;
    } else {
      hint.hidden = true;
      hint.textContent = '';
    }
  }
  calcNhap();
  var q = $('#nhapQty');
  if (q) { q.focus(); if (q.select) q.select(); }
}
function nhapNewProduct(name){
  var inp = $('#nhapSearch');
  if (inp) inp.value = capWords(name);
  nhapPid = null;
  var hint = $('#nhapHint');
  if (hint) {
    hint.textContent = 'Vị thuốc mới — sẽ được tạo khi lưu.';
    hint.hidden = false;
  }
  closeSuggest('nhap');
  var q = $('#nhapQty');
  if (q) q.focus();
}
function calcNhap(){
  var q = num(($('#nhapQty') || {}).value);
  var p = num(($('#nhapPrice') || {}).value);
  var out = $('#nhapTotal');
  if (out) out.textContent = fmtMoney(kToDong(q * p));
  var pn = $('#nhapPendName');
  if (pn) { var nm = String(($('#nhapSearch') || {}).value || '').trim(); pn.textContent = nm || 'Chọn vị thuốc ở ô trên'; pn.className = nm ? 'nhap-pend__name' : 'nhap-pend__name is-muted'; }
}
var nhapList = [];
function nhapPriceOk(p, price){
  if (!p || !(price > 0)) return true;
  var l = lastImport(p.id);
  var ref = l ? l.price : 0;
  if (!(ref > 0)) return true;
  var ratio = price / ref;
  if (ratio <= 1.5 && ratio >= 0.5) return true;
  var pct = dec((ratio - 1) * 100);
  return confirm('Giá nhập "' + p.name + '" lần này là ' + fmtUnitPrice(price) + ', chênh ' + (pct > 0 ? '+' : '') + fmtNum(pct) + '% so với lần nhập gần nhất (' + fmtUnitPrice(ref) + ').\nBạn có chắc giá này đúng không?');
}
function renderNhapList(){
  var box = $('#nhapListBox');
  var tb = $('#nhapListBody');
  if (!box || !tb) return;
  tb.textContent = '';
  box.hidden = false;
  var pendTb = $('#nhapPendingBody');
  if (pendTb) renumber(pendTb, nhapList.length);
  var sum = 0;
  nhapList.forEach(function(it, i){
    sum += num(it.qty) * num(it.price);
    var tr = el('tr');
    tr.className = 'is-row';
    tr.appendChild(el('td', 'c-num num muted', String(i + 1)));
    tr.appendChild(el('td', 'b', it.name));
    var cq = el('td', 'num', fmtQty(it.qty));
    cq.setAttribute('data-label', 'SL');
    tr.appendChild(cq);
    var cp = el('td', 'num muted r', it.price > 0 ? fmtMoney(it.price) : '—');
    cp.setAttribute('data-label', 'Giá nhập');
    tr.appendChild(cp);
    var td = el('td', 'c-act');
    td.appendChild(rowMenu([
      { label: 'Xóa dòng', icon: 'trash', action: 'del-nhap-item', idx: i, danger: true }
    ], 'Thao tác với ' + it.name));
    tr.appendChild(td);
    tb.appendChild(tr);
  });
  var tot = $('#nhapListTotal');
  if (tot) tot.textContent = fmtMoney(sum);
  var cnt = $('#nhapListCount');
  if (cnt) cnt.textContent = nhapList.length ? nhapList.length + ' vị' : '';
  var lbl = $('#nhapSaveLabel');
  if (lbl) lbl.textContent = nhapList.length ? 'Lưu nhập hàng (' + nhapList.length + ')' : 'Lưu nhập hàng';
}
function resetNhapInputs(){
  nhapPid = null;
  var inp = $('#nhapSearch');
  if (inp) inp.value = '';
  ['nhapQty', 'nhapPrice'].forEach(function(id){
    var n = $('#' + id);
    if (n) n.value = '';
  });
  var hint = $('#nhapHint');
  if (hint) { hint.hidden = true; hint.textContent = ''; }
  calcNhap();
  refreshAllQtyHints();
}
function addNhapItem(){
  var inp = $('#nhapSearch');
  var name = capWords((inp || {}).value);
  var qty = num(($('#nhapQty') || {}).value);
  var price = kToDong(($('#nhapPrice') || {}).value);
  if (!name) { toast('Nhập tên vị thuốc', 'error'); if (inp) inp.focus(); return; }
  if (qty <= 0) { toast('Nhập số lượng lớn hơn 0', 'error'); var q = $('#nhapQty'); if (q) q.focus(); return; }
  if (price < 0) { toast('Giá nhập không được âm', 'error'); var pNeg = $('#nhapPrice'); if (pNeg) { pNeg.focus(); pNeg.select(); } return; }
  var limN = checkLimits('q', qty) || checkLimits('money', price) || checkLimits('name', name);
  if (limN) {
    toast(limN, 'error');
    var fN = checkLimits('q', qty) ? $('#nhapQty') : (checkLimits('money', price) ? $('#nhapPrice') : inp);
    if (fN) fN.focus();
    return;
  }
  var p = nhapPid ? findProduct(nhapPid) : findByName(name);
  if (!nhapPriceOk(p, price)) { var pi = $('#nhapPrice'); if (pi) { pi.focus(); pi.select(); } return; }
  nhapList.push({ pid: p ? p.id : null, name: p ? p.name : name, qty: dec(qty), price: price });
  resetNhapInputs();
  renderNhapList();
  closeSuggest('nhap');
  if (inp) inp.focus();
}
/* N1: lỗi trần của dòng trong tờ ghi: giữ con trỏ ở ô số lượng (không có ô nào của dòng để trỏ tới). */
function nhapFocusQty(){ var q = $('#nhapQty'); if (q) q.focus(); }
function saveNhap(e){
  if (e) e.preventDefault();
  var date = todayISO();
  var entries = nhapList.slice();
  var name = capWords(($('#nhapSearch') || {}).value);
  if (name) {
    var qty = num(($('#nhapQty') || {}).value);
    var price = kToDong(($('#nhapPrice') || {}).value);
    if (price < 0) { toast('Giá nhập không được âm', 'error'); var pn = $('#nhapPrice'); if (pn) { pn.focus(); pn.select(); } return; }
    var cp = nhapPid ? findProduct(nhapPid) : findByName(name);
    if (!(qty > 0)) {
      toast('Dòng "' + name + '" thiếu số lượng', 'error');
      var q0 = $('#nhapQty'); if (q0) q0.focus();
      return;
    }
    var lim2 = checkLimits('q', qty) || checkLimits('money', price);
    if (lim2) {
      toast(lim2, 'error');
      var bad2 = checkLimits('q', qty) ? $('#nhapQty') : $('#nhapPrice'); if (bad2) { bad2.focus(); if (bad2.select) bad2.select(); }
      return;
    }
    if (!nhapPriceOk(cp, price)) { var pi2 = $('#nhapPrice'); if (pi2) { pi2.focus(); pi2.select(); } return; }
    entries.push({ pid: cp ? cp.id : null, name: name, qty: dec(qty), price: price });
  }
  if (!entries.length) { toast('Nhập tên vị thuốc', 'error'); var i0 = $('#nhapSearch'); if (i0) i0.focus(); return; }
  for (var ei = 0; ei < entries.length; ei++) {
    if (entries[ei].qty < 0) { toast('Số lượng không được âm', 'error'); return; }
    if (entries[ei].price < 0) { toast('Giá nhập không được âm', 'error'); return; }
    var limE = checkLimits('q', entries[ei].qty) || checkLimits('money', entries[ei].price) || checkLimits('name', entries[ei].name);
    if (limE) { toast(limE, 'error'); nhapFocusQty(); return; }
  }
  /* Kiểm trần sau khi cộng dồn (theo vị, kể cả trùng trong nhapList), trước mọi ghi db. */
  var simStock = {}, limSum = null;
  for (var si = 0; si < entries.length && !limSum; si++) {
    var sp = entries[si].pid ? findProduct(entries[si].pid) : findByName(entries[si].name);
    var sk = sp ? 'id:' + sp.id : 'new:' + capWords(entries[si].name).toLowerCase();
    simStock[sk] = (sk in simStock ? simStock[sk] : (sp ? num(sp.stock) : 0)) + entries[si].qty;
    limSum = checkLimits('q', simStock[sk]) || checkLimits('money', money(entries[si].qty * entries[si].price));
  }
  if (limSum) { toast(limSum, 'error'); nhapFocusQty(); return; }

  var savedN = 0;
  var batchId = uid('IM');
  var ts = Date.now();
  entries.forEach(function(it){
    var p = it.pid ? findProduct(it.pid) : null;
    if (!p) p = findByName(it.name);
    if (!p) {
      p = { id: uid('PROD'), name: it.name, stock: 0, costPrice: money(it.price) };
      db.products.push(p);
    }
    if (it.qty > 0) {
      p.stock = dec(num(p.stock) + it.qty);
      if (it.price > 0) p.costPrice = money(it.price);
      db.transactions.push({
        id: uid('TX'), date: date, type: 'NHAP', productId: p.id,
        qty: dec(it.qty), price: money(it.price), total: money(it.qty * it.price), cost: null,
        oid: batchId, ts: ts
      });
      savedN++;
    }
  });

  if (savedN > 0) {
    impPage = 1;
    var _is = $('#impSearch'); if (_is) _is.value = '';
  }
  nhapList = [];
  resetNhapInputs();
  renderNhapList();
  commit(savedN === 0 ? 'Đã tạo vị thuốc' : savedN > 1 ? 'Đã lưu nhập ' + savedN + ' vị thuốc' : 'Đã lưu nhập hàng');
  refreshAllQtyHints();
}

/* ================= SẢN PHẨM ================= */
function dupName(name, excludeId){
  var key = capWords(name).toLowerCase();
  if (!key) return null;
  for (var i = 0; i < db.products.length; i++) {
    var p = db.products[i];
    if (String(p.id) === String(excludeId || '')) continue;
    if (capWords(p.name).toLowerCase() === key) return p;
  }
  return null;
}
function openEdit(id){
  var p = findProduct(id);
  if (!p) return;
  $('#editId').value = p.id;
  $('#editName').value = p.name;
  $('#editPrice').value = kInput(p.costPrice);
  var d = $('#editDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function saveEdit(){
  var id = $('#editId').value;
  var name = capWords($('#editName').value);
  var price = kToDong($('#editPrice').value);
  if (!name) { toast('Tên vị thuốc không được để trống', 'error'); return; }
  if (price < 0) { toast('Giá nhập không được âm', 'error'); var ep = $('#editPrice'); if (ep) { ep.focus(); ep.select(); } return; }
  var limEd = checkLimits('name', name) || checkLimits('money', price);
  if (limEd) { toast(limEd, 'error'); return; }
  var p = findProduct(id);
  if (!p) { toast('Không tìm thấy vị thuốc', 'error'); return; }
  var d = dupName(name, id);
  if (d) { toast('Đã có "' + d.name + '" trong kho', 'error'); return; }
  p.name = name;
  p.costPrice = money(price);
  closeEdit();
  commit('Đã cập nhật vị thuốc');
}
function closeEdit(){
  var d = $('#editDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
}
function delProduct(id){
  var p = findProduct(id);
  if (!p) return;
  if (!confirm('Xóa "' + p.name + '" khỏi kho? Lịch sử giao dịch vẫn được giữ lại.')) return;
  db.products = db.products.filter(function(x){ return String(x.id) !== String(id); });
  commit('Đã xóa vị thuốc');
}
/* Giữ nguyên số khách đã trả, ghi lại vốn và thành tiền mọi vị trong đơn. */
/* Vốn từng dòng đã lưu lúc bán là vốn lịch sử: không tính lại theo giá nhập hiện tại.
   Chỉ dòng cũ chưa có cost mới fallback về giá nhập hiện tại. */
function remedyLineCost(t){
  if (t.cost != null && isFinite(Number(t.cost))) return money(t.cost);
  var prod = findProduct(t.productId);
  return money(num(t.qty) * (prod ? num(prod.costPrice) : 0));
}
/* Vốn mới của dòng bị sửa gram: co giãn theo vốn lịch sử của chính dòng đó. */
function scaledRemedyCost(t, prevQty, prevCost){
  var nq = num(t.qty);
  if (prevCost != null && num(prevCost) > 0 && num(prevQty) > 0) {
    return money(num(prevCost) * nq / num(prevQty));
  }
  var prod = findProduct(t.productId);
  return money(nq * (prod ? num(prod.costPrice) : 0));
}
/* Chia lại tiền khách trả cho các dòng cùng đơn. Giữ nguyên vốn đã lưu của từng dòng,
   chỉ chia lại phần lãi đều. Trả false (không đổi gì) khi giá bán thấp hơn tổng vốn. */
function applyRemedyBalance(lines, grand){
  var costs = lines.map(function(t){ return remedyLineCost(t); });
  var totalCost = 0;
  costs.forEach(function(c){ totalCost += c; });
  var g0 = money(grand);
  if (g0 < totalCost) return false;
  var totals = allocateRemedyByCost(g0, costs.map(function(c){ return { cost: c }; }));
  var unitPrice = 0;
  lines.forEach(function(t){ if (num(t.unitPrice) > 0) unitPrice = money(t.unitPrice); });
  lines.forEach(function(t, i){
    var kg = num(t.qty);
    t.cost = costs[i];
    t.total = totals[i];
    t.price = kg > 0 ? money(totals[i] / kg) : 0;
    if (unitPrice > 0) t.unitPrice = unitPrice;
  });
  return true;
}
function remedyMates(t){
  if (!t || !t.rx || !t.oid) return [];
  return db.transactions.filter(function(x){
    return x.rx && x.oid && String(x.oid) === String(t.oid);
  });
}
/* Chỉ gọi khi lần nhập bị xóa LÀ lastImport (tính TRƯỚC khi xóa): giá vốn theo lần nhập
   có giá còn lại gần nhất theo lastImport (theo ngày, hòa thì theo ts), cùng tiêu chí với
   saveTxEdit và refPrice. Xóa lần nhập cũ hơn thì giá vốn sửa tay được giữ nguyên.
   Không còn lần nhập có giá thì giữ nguyên. */
function resetCostFromImports(p){
  if (!p) return;
  var l = lastImport(p.id);
  if (l) p.costPrice = money(l.price);
}
function delTx(id){
  var t = null, pos = -1;
  for (var i = 0; i < db.transactions.length; i++) if (db.transactions[i].id === id) { t = db.transactions[i]; pos = i; break; }
  if (!t) return;
  var mates = remedyMates(t).filter(function(x){ return x.id !== t.id; });
  var msg = mates.length
    ? 'Xóa vị này khỏi đơn thuốc? Tồn kho hoàn lại. Tiền khách trả giữ nguyên và chia lại cho các vị còn lại.'
    : 'Xóa giao dịch này? Tồn kho sẽ được điều chỉnh lại.';
  var p = findProduct(t.productId);
  if (p && t.type === 'NHAP' && num(p.stock) - num(t.qty) < -1e-9) {
    toast('Không thể xóa: "' + p.name + '" đã bán, tồn sẽ âm. Hãy sửa/xóa đơn bán liên quan trước.', 'error');
    return;
  }
  if (!confirm(msg)) return;
  var grand = num(t.total);
  mates.forEach(function(x){ grand += num(x.total); });
  if (p) {
    if (t.type === 'NHAP') p.stock = dec(p.stock - num(t.qty));
    else p.stock = dec(p.stock + num(t.qty));
  }
  var wasLast = false;
  if (t.type === 'NHAP') {
    var lt = lastImport(t.productId);
    wasLast = !!lt && String(lt.id) === String(t.id);
  }
  db.transactions = db.transactions.filter(function(x){ return x.id !== id; });
  if (mates.length && !applyRemedyBalance(mates, grand)) {
    db.transactions.splice(pos, 0, t);
    if (p) p.stock = dec(num(p.stock) - num(t.qty));
    toast('Giá bán thấp hơn vốn của đơn', 'error');
    return;
  }
  if (p && t.type === 'NHAP' && wasLast) resetCostFromImports(p);
  commit(mates.length ? 'Đã xóa vị và chia lại đơn thuốc' : 'Đã xóa giao dịch');
}
/* ================= SỬA GIAO DỊCH ================= */
var txEditCur = null;
function findTx(id){
  for (var i = 0; i < db.transactions.length; i++) {
    if (db.transactions[i].id === id) return db.transactions[i];
  }
  return null;
}
function delOrder(oid){
  var items = db.transactions.filter(function(x){ return x.oid === oid; });
  if (!items.length) return;
  var label = (items[0].oname && items[0].oname !== items[0].oid) ? items[0].oname : (items[0].type === 'NHAP'
    ? 'đơn nhập ngày ' + dateVN(items[0].date)
    : 'đơn');
  if (!confirm('Xóa cả ' + label + '? Tồn kho sẽ được điều chỉnh lại.')) return;
  /* Kiểm tra trước toàn bộ đơn nhập: không được để tồn âm. */
  for (var i = 0; i < items.length; i++) {
    var t0 = items[i];
    if (t0.type !== 'NHAP') continue;
    var p0 = findProduct(t0.productId);
    if (p0 && num(p0.stock) - num(t0.qty) < -1e-9) {
      toast('Không thể xóa: "' + p0.name + '" đã bán, tồn sẽ âm. Hãy sửa/xóa đơn bán liên quan trước.', 'error');
      return;
    }
  }
  items.forEach(function(t){
    var p = findProduct(t.productId);
    if (!p) return;
    /* Nhập: xóa đơn phải trừ tồn lại; Bán: cộng tồn lại */
    if (t.type === 'NHAP') p.stock = dec(p.stock - num(t.qty));
    else p.stock = dec(p.stock + num(t.qty));
  });
  /* Chỉ đặt lại giá vốn cho vị có lần nhập bị xóa LÀ lastImport (tính trước khi xóa). */
  var resetPids = [];
  items.forEach(function(t){
    if (t.type !== 'NHAP') return;
    var lt = lastImport(t.productId);
    if (!lt) return;
    if (!items.some(function(x){ return x.type === 'NHAP' && String(x.id) === String(lt.id); })) return;
    if (resetPids.indexOf(String(t.productId)) < 0) resetPids.push(String(t.productId));
  });
  db.transactions = db.transactions.filter(function(x){ return x.oid !== oid; });
  resetPids.forEach(function(pid){ resetCostFromImports(findProduct(pid)); });
  commit('Đã xóa đơn');
}
function txEditKg(t, qRaw){
  if (!t || !t.rx) return dec(qRaw);
  var thang = num(t.thang) > 0 ? num(t.thang) : 1;
  return dec(qRaw / 1000 * thang);
}
function openTxEdit(id){
  var t = findTx(id);
  if (!t) return;
  txEditCur = t;
  var p = findProduct(t.productId);
  $('#txEditId').value = t.id;
  $('#txEditName').value = p ? p.name : 'Đã xóa';
  var isRx = !!t.rx;
  var lbl = $('#txEditQtyLbl');
  if (lbl) lbl.textContent = isRx ? 'Số gram (mỗi thang)' : 'Số lượng (kg)';
  var priceField = $('#txEditPriceField');
  if (priceField) priceField.hidden = isRx;
  $('#txEditQty').value = String(isRx ? num(t.g) : dec(t.qty));
  if ($('#txEditQty').qtyHintRefresh) $('#txEditQty').qtyHintRefresh();
  $('#txEditPrice').value = kInput(t.price);
  var meta = $('#txEditMeta');
  if (meta) meta.textContent = (t.rx ? 'Đơn thuốc chén · giá khách trả giữ nguyên' : t.type === 'NHAP' ? 'Nhập hàng' : 'Bán hàng') + ' · ngày ' +
    dateVN(t.date) + (txHasTime(t) ? ' ' + timeVN(txStamp(t)) : '');
  calcTxEdit();
  var d = $('#txDlg');
  if (d && d.showModal) d.showModal(); else if (d) d.setAttribute('open', '');
}
function calcTxEdit(){
  var out = $('#txEditTotal');
  if (txEditCur && txEditCur.rx) {
    var grand = 0;
    remedyMates(txEditCur).forEach(function(x){ grand += num(x.total); });
    if (!grand) grand = num(txEditCur.total);
    if (out) out.textContent = fmtMoney(grand);
    return;
  }
  var q = num(($('#txEditQty') || {}).value);
  var p = num(($('#txEditPrice') || {}).value);
  if (out) out.textContent = fmtMoney(kToDong(txEditKg(txEditCur, q) * p));
}
function closeTxEdit(){
  var d = $('#txDlg');
  if (d && d.close) d.close(); else if (d) d.removeAttribute('open');
  txEditCur = null;
}
function saveTxEdit(){
  var t = txEditCur;
  if (!t) return;
  var qRaw = num($('#txEditQty').value);
  var price = kToDong($('#txEditPrice').value);
  if (qRaw <= 0) { toast('Số lượng phải lớn hơn 0', 'error'); return; }
  var isRx = !!t.rx;
  var q = txEditKg(t, qRaw);
  var limTx = checkLimits('q', q) || checkLimits('money', price) || (!isRx && checkLimits('money', money(q * price)));
  if (limTx) {
    toast(limTx, 'error');
    var ep = $('#txEditPrice'); if (ep) ep.focus();
    return;
  }
  if (!isRx && price < 0) { toast('Đơn giá không được âm', 'error'); ep = $('#txEditPrice'); if (ep) { ep.focus(); ep.select(); } return; }

  var p = findProduct(t.productId);
  var oldQty = num(t.qty);
  var oldCost = num(t.cost);
  var delta = dec(q - oldQty);
  if (p) {
    if (t.type === 'NHAP') {
      if (num(p.stock) + delta < -1e-9) {
        toast('Tồn "' + p.name + '" không đủ để giảm (còn ' + fmtQty(p.stock) + ')', 'error');
        return;
      }
      var limSt = checkLimits('q', num(p.stock) + delta);
      if (limSt) { toast(limSt, 'error'); return; }
      p.stock = dec(num(p.stock) + delta);
      var latest = lastImport(t.productId);
      if (price > 0 && latest && String(latest.id) === String(t.id)) p.costPrice = money(price);
    } else {
      if (num(p.stock) + 1e-9 < delta) {
        toast('Tồn "' + p.name + '" không đủ (còn ' + fmtQty(p.stock) + ')', 'error');
        return;
      }
      p.stock = dec(num(p.stock) - delta);
    }
  }
  if (isRx) {
    var lines = remedyMates(t);
    if (!lines.length) lines = [t];
    var grand = 0;
    lines.forEach(function(x){ grand += num(x.total); });
    var prevQty = t.qty;
    var prevG = t.g;
    var prevCost = t.cost;
    t.qty = dec(q);
    t.g = dec(qRaw);
    t.cost = scaledRemedyCost(t, prevQty, prevCost);
    if (!applyRemedyBalance(lines, grand)) {
      t.qty = prevQty;
      t.g = prevG;
      t.cost = prevCost;
      if (p) p.stock = dec(num(p.stock) + delta);
      toast('Giá bán thấp hơn vốn của đơn', 'error');
      return;
    }
    closeTxEdit();
    commit('Đã cập nhật đơn thuốc');
    return;
  }
  /* Giữ giá vốn lịch sử: nhân theo đơn giá vốn cũ của chính giao dịch,
     chỉ fallback về giá hiện tại khi giao dịch cũ không có cost. */
  var oldUnitCost = oldQty > 0 && oldCost > 0 ? dec(oldCost / oldQty) : (p ? num(p.costPrice) : 0);
  t.qty = dec(q);
  t.price = money(price);
  t.total = money(q * price);
  if (t.type === 'BAN') t.cost = money(q * oldUnitCost);
  closeTxEdit();
  commit('Đã cập nhật giao dịch');
}
/* ==== Đồng bộ: gọi thẳng API, cookie thiết bị do trình duyệt tự gửi ==== */
function apiFetch(url, opts){
  var o = {};
  var src = opts || {};
  for (var k in src) o[k] = src[k];
  var h = {};
  var sh = src.headers || {};
  for (var k2 in sh) h[k2] = sh[k2];
  o.headers = h;
  o.cache = 'no-store';
  return fetch(url, o);
}
/* ================= ĐỒNG BỘ ================= */
function cloudConflict(){
  if (conflictOpen) return Promise.resolve(false);
  conflictOpen = true;
  var inMemory = !!(retailItems.length || remedyItems.length || nhapList.length || txEditCur);
  var LF = String.fromCharCode(10);
  var msg = 'Dữ liệu trên một thiết bị khác đã thay đổi sau lần bạn mở trang này.' + LF + LF +
    'OK: tải bản mới nhất về (thay đổi chưa lưu của máy này sẽ mất).' + LF +
    'Hủy: giữ bản trên máy này và ghi đè lên máy chủ.';
  if (inMemory) msg += LF + LF + 'Các dòng đang soạn trong bộ nhớ cũng sẽ bị xóa.';
  var useLatest = confirm(msg);
  conflictOpen = false;
  if (useLatest) {
    if (!downloadBackup(false, 'kho-nhap-xung-dot-' + backupStamp() + '.json', true)) {
      toast('Không tải được bản nháp — đã hủy tải bản máy chủ', 'error');
      return Promise.resolve(false);
    }
    return pullState(true, true).then(function(ok){
      if (ok) {
        if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
        syncRetryDelay = DIRTY_BADGE_MS;
        dirtySince = 0;
        syncErrorShown = false;
        syncDetail = '';
        syncRejected = false;
        renderSyncBadge();
        resetDrafts();
      }
      return false;
    });
  }
  return pushState(true, true);
}
function syncFailText(d, fallback){
  var lines = [];
  if (d && d.error) lines.push(String(d.error));
  if (d && Array.isArray(d.details)) {
    for (var i = 0; i < d.details.length && lines.length < 21; i++) lines.push(String(d.details[i]));
  }
  return lines.length ? lines.join('\n') : fallback;
}
/* Một lần mỗi phiên. Đọc stockDrift, không đọc câu warnings.
   Tối đa 3 tên, phần còn lại ghi “và N vị khác”. */
var stockWarnShown = false;
var stockWarnText = '';
function noteStockWarnings(list){
  if (stockWarnShown || !list || !list.length) return;
  var names = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i] && list[i].name) names.push(String(list[i].name));
  }
  if (!names.length) return;
  stockWarnShown = true;
  var shown = names.slice(0, 3);
  var extra = names.length - shown.length;
  stockWarnText = 'Tồn lệch so với lịch sử nhập − bán: ' + shown.join(', ');
  if (extra > 0) stockWarnText += ' và ' + extra + ' vị khác';
  stockWarnText += '.';
  toast(stockWarnText, 'error');
}
function pushState(manual, force){
  if (pushing) return Promise.resolve(false);
  pushing = true;
  touch();
  renderSyncBadge();
  var sent = num(db.updatedAt);
  var headers = { 'Content-Type': 'application/json', 'X-Base-Updated': String(cloudBase) };
  if (force) headers['X-Force'] = '1';
  return apiFetch('/api/state', {
    method: 'PUT',
    headers: headers,
    body: JSON.stringify(db)
  }).then(function(r){
    if (!r) return { status: 0, d: null };
    return r.json().then(function(d){
      return { status: r.status || 0, d: d };
    }, function(){
      return { status: r.status || 0, d: null };
    });
  }).then(function(pack){
    var d = pack.d;
    var status = pack.status;
    if ((d && d.conflict) || status === 409) {
      if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
      pushing = false;
      return cloudConflict();
    }
    var ok = !!(d && d.success);
    if (ok) {
      authLost = false;
      cloudBase = num(d.updatedAt) || sent;
      if (num(db.updatedAt) === sent) {
        db.updatedAt = cloudBase;
        dirty = false;
      } else {
        /* Có thay đổi mới trong lúc đang gửi: giữ dirty và gửi tiếp. */
        dirty = true;
        setTimeout(function(){ pushState(false); }, 0);
      }
      syncErrorShown = false;
      syncDetail = '';
      syncRejected = false;
      syncRetryDelay = DIRTY_BADGE_MS;
      if (syncRetryTimer) { clearTimeout(syncRetryTimer); syncRetryTimer = null; }
      saveLocal();
      renderSyncBadge();
      noteStockWarnings(d && d.stockDrift);
      if (manual) toast('Đã lưu dữ liệu');
    } else if (status === 401) {
      /* Thiết bị chưa được duyệt hoặc đã bị thu hồi: giữ nguyên nháp, không thử lại, không cho bỏ nháp. */
      noteAuthLost();
    } else {
      var rejected = status >= 400 && status < 500;
      noteSyncFailure(syncFailText(d, 'Chưa lưu được lên máy chủ — dữ liệu vẫn giữ trên máy này'), !rejected);
    }
    return ok;
  }).catch(function(){
    noteSyncFailure('Mất kết nối — dữ liệu vẫn giữ trên máy này.', true);
    return false;
  }).then(function(ok){
    pushing = false;
    return ok;
  });
}
function pullState(manual, forceLatest){
  return apiFetch('/api/state?t=' + Date.now())
    .then(function(r){
      if (r && r.status === 401) { noteAuthLost(); return null; }
      return r ? r.json() : null;
    })
    .then(function(d){
      var server = d && d.success ? sanitize(d.data) : null;
      if (!server) {
        if (manual && !authLost) toast('Không tải được dữ liệu', 'error');
        return false;
      }
      authLost = false;
      cloudBase = num(server.updatedAt);
      /* Chỉ ưu tiên server khi máy này không có thay đổi chưa gửi.
         Nếu đang dirty, đẩy bản local lên trước; server sẽ trả 409 nếu
         thiết bị khác đã sửa, và người dùng quyết định. */
      if (forceLatest || !dirty) {
        db = server;
        dirty = false;
        saveLocal();
        renderAll();
        if (manual) toast('Đã tải dữ liệu mới nhất');
        return true;
      }
      pushState(false);
      if (manual) toast('Dữ liệu trên máy chưa gửi — đang lưu lên máy chủ');
      return true;
    })
    .catch(function(){ if (manual) toast('Không tải được dữ liệu', 'error'); return false; });
}
/* Tự làm mới: chỉ tải khi server có bản mới hơn và máy không có thay đổi
   chưa gửi. Không hiện toast, không render nếu dữ liệu không đổi. */
var refreshing = false;
/* Đang gõ trong ô nhập hoặc đang mở hộp thoại sửa: tạm hoãn để không
   làm mất nội dung người dùng đang nhập. Sẽ tự làm mới ở nhịp sau. */
function busyEditing(){
  var ae = doc.activeElement;
  if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(String(ae.tagName || ''))) return true;
  var dlgs = doc.querySelectorAll ? doc.querySelectorAll('dialog[open]') : null;
  if (dlgs && dlgs.length) return true;
  if (retailItems && retailItems.length) return true;
  if (remedyItems && remedyItems.length) return true;
  if (nhapList && nhapList.length) return true;
  return false;
}
function autoRefresh(){
  if (refreshing || authLost || dirty || conflictOpen || doc.hidden || busyEditing()) return Promise.resolve(false);
  refreshing = true;
  return apiFetch('/api/state?t=' + Date.now())
    .then(function(r){
      if (r && r.status === 401) { noteAuthLost(); return null; }
      return r ? r.json() : null;
    })
    .then(function(d){
      refreshing = false;
      /* Trong lúc chờ máy chủ, người dùng có thể bắt đầu sửa hoặc mở giỏ hàng.
         Không ghi đè bản đang làm. */
      if (dirty || conflictOpen || busyEditing()) return false;
      var server = d && d.success ? sanitize(d.data) : null;
      if (!server) return false;
      if (num(server.updatedAt) > num(cloudBase)) {
        cloudBase = num(server.updatedAt);
        db = server;
        dirty = false;
        saveLocal();
        renderAll();
        if (orderCur) renderOrder();
        toast('Đã cập nhật dữ liệu mới từ thiết bị khác');
        return true;
      }
      return false;
    })
    .catch(function(){ refreshing = false; return false; });
}
function startAutoRefresh(){
  setInterval(autoRefresh, 15000);                      // định kỳ 15s
  setInterval(refreshAutoDates, 60000);                 // làm mới ngày qua nửa đêm
  doc.addEventListener('visibilitychange', function(){  // quay lại tab
    if (!doc.hidden) { refreshAutoDates(); autoRefresh(); }
  });
  window.addEventListener('focus', function(){ refreshAutoDates(); autoRefresh(); }); // cửa sổ được focus
}

/* ================= SAO LƯU / KHÔI PHỤC ================= */
var BAK_LAST = 'kho_backup_last_v1';
var BAK_AUTO = 'kho_backup_auto_v1';

function backupAutoOn(){
  try { return localStorage.getItem(BAK_AUTO) !== '0'; } catch (e) { return true; }
}
function backupLastDate(){
  try { return localStorage.getItem(BAK_LAST) || ''; } catch (e) { return ''; }
}
function bakDateText(iso){
  var p = String(iso || '').split('-');
  return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso || '');
}
function renderBackupInfo(){
  var last = backupLastDate();
  var n = $('#backupLast');
  if (n) n.textContent = last
    ? 'Bản sao lưu gần nhất: ' + bakDateText(last) + '.'
    : 'Chưa có bản sao lưu nào.';
  var h = $('#backupHint');
  if (h) h.textContent = !last
    ? 'Chưa sao lưu'
    : (last === todayISO() ? 'Đã sao lưu hôm nay' : 'Sao lưu ' + bakDateText(last));
}
function downloadBackup(manual, filename, skipStamp){
  var url = null;
  try {
    var payload = {
      app: 'quan-ly-kho',
      version: 1,
      savedAt: new Date().toISOString(),
      data: db
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    url = URL.createObjectURL(blob);
    var a = el('a');
    a.href = url;
    a.download = filename || ('kho-backup-' + todayISO() + '.json');
    a.rel = 'noopener';
    doc.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 5000);
  } catch (e) {
    if (manual) toast('Không tạo được bản sao lưu', 'error');
    return false;
  }
  try { if (!skipStamp) localStorage.setItem(BAK_LAST, todayISO()); } catch (e) {}
  if (!skipStamp) renderBackupInfo();
  if (manual) toast('Đã tải file sao lưu về máy');
  return true;
}
function backupStamp(){
  var d = new Date();
  return todayISO() + '-' + pad2(d.getHours()) + pad2(d.getMinutes());
}
/* Tải snapshot hiện tại trước khi restore. Trả false nếu trình duyệt chặn,
   để restoreFromFile dừng lại thay vì ghi đè mù. */
function backupBeforeRestore(){
  return downloadBackup(false, 'kho-backup-truoc-restore-' + backupStamp() + '.json', true);
}
function maybeAutoBackup(){
  if (!backupAutoOn()) return false;
  if (backupLastDate() === todayISO()) return false;
  if (!db.products.length && !db.transactions.length && !db.prescriptions.length) return false;
  if (!downloadBackup(false)) return false;
  toast('Đã tự sao lưu dữ liệu hôm nay');
  return true;
}
function moneyRestoreNote(scale, sample, afterCost){
  var line = scale
    ? 'File này tính theo nghìn đồng, sẽ nhân 1000 khi nạp.'
    : 'File này tính theo đồng, giữ nguyên.';
  if (sample) {
    line += '\nGiá nhập “' + sample.name + '”: ' + fmtNum(sample.cost) + ' → ' + fmtNum(afterCost) + '.';
  }
  return line;
}
var backupParseError = '';
/* Cùng luật với validateState(server). Trả chuỗi lỗi đầu tiên hoặc ''. */
function validateBackupState(d){
  if (!d || typeof d !== 'object' || Array.isArray(d)) return 'Dữ liệu không phải object';
  var keys = ['products', 'transactions', 'prescriptions'];
  for (var ki = 0; ki < keys.length; ki++) {
    if (!Array.isArray(d[keys[ki]])) return 'Thiếu mảng ' + keys[ki];
  }
  for (var i = 0; i < d.products.length; i++) {
    var p = d.products[i], pl = 'Sản phẩm #' + (i + 1);
    if (!p || typeof p !== 'object') return pl + ': không hợp lệ';
    var pname = String(p.name || '').trim();
    if (!pname) return pl + ': thiếu tên';
    if (pname.length > NAME_MAX) return pl + ': tên quá dài (tối đa ' + NAME_MAX + ' ký tự)';
    if (p.stock == null || p.stock === '' || !inRange(p.stock, 0, QTY_MAX)) return pl + ' "' + pname + '": tồn kho phải từ 0 đến ' + QTY_MAX;
    if (p.costPrice == null || p.costPrice === '' || !inRange(p.costPrice, 0, MONEY_MAX)) return pl + ' "' + pname + '": giá nhập phải từ 0 đến ' + MONEY_MAX;
  }
  for (var j = 0; j < d.transactions.length; j++) {
    var t = d.transactions[j], tl = 'Giao dịch #' + (j + 1);
    if (!t || typeof t !== 'object') return tl + ': không hợp lệ';
    if (t.type !== 'NHAP' && t.type !== 'BAN') return tl + ': loại phải là NHAP hoặc BAN';
    if (!isRealDateISO(t.date)) return tl + ': ngày phải là ngày thật YYYY-MM-DD trong 2000-2100';
    if (!String(t.productId || '').trim()) return tl + ': thiếu productId';
    if (t.qty == null || t.qty === '' || !inRange(t.qty, 0, QTY_MAX) || !(Number(t.qty) > 0)) return tl + ': số lượng phải > 0 và <= ' + QTY_MAX;
    if (t.price == null || t.price === '' || !inRange(t.price, 0, MONEY_MAX)) return tl + ': đơn giá phải từ 0 đến ' + MONEY_MAX;
    if (t.total == null || t.total === '' || !inRange(t.total, 0, MONEY_MAX)) return tl + ': thành tiền phải từ 0 đến ' + MONEY_MAX;
    if (t.cost != null && !inRange(t.cost, 0, MONEY_MAX)) return tl + ': giá vốn phải từ 0 đến ' + MONEY_MAX;
    if (t.g != null && !inRange(t.g, 0, GRAMS_MAX)) return tl + ': grams phải từ 0 đến ' + GRAMS_MAX;
    if (t.thang != null && !inRange(t.thang, 1, THANG_MAX)) return tl + ': số thang phải từ 1 đến ' + THANG_MAX;
    if (t.unitPrice != null && !inRange(t.unitPrice, 0, MONEY_MAX)) return tl + ': giá 1 thang phải từ 0 đến ' + MONEY_MAX;
    if (t.ts != null && !isFinite(Number(t.ts))) return tl + ': ts không hợp lệ';
    var oname = t.oname != null ? String(t.oname).trim() : (t.orderName != null ? String(t.orderName).trim() : '');
    if (oname && oname.length > NAME_MAX) return tl + ': tên đơn quá dài (tối đa ' + NAME_MAX + ' ký tự)';
  }
  for (var k = 0; k < d.prescriptions.length; k++) {
    var r = d.prescriptions[k], rl = 'Đơn thuốc #' + (k + 1);
    if (!r || typeof r !== 'object') return rl + ': không hợp lệ';
    var rname = String(r.name || '').trim();
    if (!rname) return rl + ': thiếu tên';
    if (rname.length > NAME_MAX) return rl + ': tên quá dài (tối đa ' + NAME_MAX + ' ký tự)';
    if (r.total == null || r.total === '' || !inRange(r.total, 0, MONEY_MAX)) return rl + ' "' + rname + '": tổng tiền phải từ 0 đến ' + MONEY_MAX;
    if (r.thang != null && !inRange(r.thang, 1, THANG_MAX)) return rl + ' "' + rname + '": số thang phải từ 1 đến ' + THANG_MAX;
    if (!Array.isArray(r.items) || !r.items.length) return rl + ' "' + rname + '": chưa có vị thuốc';
    for (var m = 0; m < r.items.length; m++) {
      var it = r.items[m], il = rl + ' dòng ' + (m + 1);
      if (!it || typeof it !== 'object') return il + ': không hợp lệ';
      if (!String(it.productId || '').trim()) return il + ': thiếu productId';
      if (!inRange(it.grams, 0, GRAMS_MAX) || !(Number(it.grams) > 0)) return il + ': số gram phải > 0 và <= ' + GRAMS_MAX;
    }
  }
  return '';
}
function parseBackup(text){
  backupParseError = '';
  var obj = JSON.parse(text);
  var d = obj && obj.data ? obj.data : obj;
  if (!d || typeof d !== 'object') { backupParseError = 'Dữ liệu không phải object'; return null; }
  /* Bắt buộc đủ 3 bảng: thiếu một bảng sẽ khiến restore xóa mất dữ liệu. */
  if (!Array.isArray(d.products) || !Array.isArray(d.transactions) || !Array.isArray(d.prescriptions)) {
    backupParseError = 'File thiếu một trong ba bảng products/transactions/prescriptions';
    return null;
  }
  if (obj.app && obj.app !== 'quan-ly-kho') { backupParseError = 'File không phải bản sao lưu của Quản Lý Kho'; return null; }
  if (obj && obj.moneyUnit === 'dong') d.moneyUnit = 'dong';
  var scale = willScaleMoney(d);
  var sample = null;
  for (var s = 0; s < d.products.length; s++) {
    var sp = d.products[s];
    if (sp && sp.name) { sample = { name: String(sp.name), cost: num(sp.costPrice) }; break; }
  }
  var scaled = scaleLegacyMoney(d);
  var err = validateBackupState(scaled);
  if (err) { backupParseError = err; return null; }
  var drops = [];
  var out = sanitize(scaled, drops);
  if (drops.length) out._drops = drops;
  var afterCost = null;
  if (sample) {
    for (var k = 0; k < out.products.length; k++) {
      if (out.products[k] && out.products[k].name === sample.name) {
        afterCost = out.products[k].costPrice;
        break;
      }
    }
  }
  out._moneyNote = moneyRestoreNote(scale, afterCost == null ? null : sample, afterCost);
  return out;
}
function restoreFromFile(file){
  if (!file) return;
  if (file.size > 4 * 1024 * 1024) { toast('File sao lưu quá lớn', 'error'); return; }
  var fr = new FileReader();
  fr.onload = function(){
    var bak = null;
    try { bak = parseBackup(String(fr.result || '')); } catch (e) {
      backupParseError = 'File sao lưu không phải JSON hợp lệ';
    }
    if (!bak) { toast(backupParseError || 'File sao lưu không hợp lệ hoặc thiếu bảng dữ liệu', 'error'); return; }
    var drops = bak._drops || [];
    var moneyNote = bak._moneyNote || '';
    delete bak._drops;
    delete bak._moneyNote;
    var msg = 'Khôi phục ' + bak.products.length + ' vị thuốc, ' +
      bak.transactions.length + ' giao dịch, ' +
      bak.prescriptions.length + ' đơn thuốc?\n\n' +
      'Dữ liệu hiện tại (kể cả trên máy chủ) sẽ bị thay thế hoàn toàn.';
    if (moneyNote) msg += '\n\n' + moneyNote;
    if (drops.length) {
      msg += '\n\nĐã bỏ ' + drops.length + ' dòng trùng:\n' + drops.slice(0, 8).join('\n');
      if (drops.length > 8) msg += '\n…';
    }
    if (!confirm(msg)) return;
    /* Luôn lưu snapshot hiện tại trước khi ghi đè; nếu không tải được thì hủy. */
    if (!backupBeforeRestore()) {
      toast('Không tạo được bản sao lưu trước khi khôi phục — đã hủy thao tác', 'error');
      return;
    }
    db = bak;
    resetDrafts();
    /* Restore là ghi đè chủ động: bỏ qua kiểm tra conflict và ép ghi lên máy chủ. */
    commit('Đã khôi phục từ file sao lưu (đã lưu bản trước đó)', true);
  };
  fr.onerror = function(){ toast('Không đọc được file', 'error'); };
  fr.readAsText(file);
}

/* ================= RENDER TỔNG ================= */
function renderAll(){
  indexTx();
  renderPresetOptions();
  renderInventory();
  renderHistory('imp');
  renderHistory('exp');
  renderStats();
  var cb = $('#chartBox');
  if (cb && cb.open) renderChart();
}

/* N1: bấm nút có data-keep-focus không làm ô nhập đang gõ mất focus (iOS ẩn bàn phím khi nút nhận focus). */
function keepFocusDown(e){ var t = e.target; if (t && t.closest && t.closest('[data-keep-focus]')) e.preventDefault(); }
doc.addEventListener('pointerdown', keepFocusDown, true);
doc.addEventListener('mousedown', keepFocusDown, true);
/* 2.14.0 N7: cuộn chuột trên ô số đang focus không được đổi số. Blur trước khi cuộn; không preventDefault (trang vẫn cuộn). */
doc.addEventListener('wheel', function(e){
  var t = e.target;
  if (t && t.tagName === 'INPUT' && t.type === 'number' && doc.activeElement === t && typeof t.blur === 'function') t.blur();
}, { passive: true, capture: true });
/* ================= SỰ KIỆN ================= */
function handleAction(btn){
  var a = btn.getAttribute('data-action');
  var id = btn.getAttribute('data-id');
  switch (a) {
    case 'theme-menu': {
      var menu = $('#themeMenu');
      var open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      break;
    }
    case 'nhap-add': addNhapItem(); break;
    case 'save-retail': saveRetail(); break;
    case 'save-remedy': saveRemedy(); break;
    case 'save-preset': remedySavePresetClick(); break;
    case 'del-preset': delPreset(); break;
    case 'copy-preset': copyPreset(); break;
    case 'edit-prod': openEdit(id); break;
    case 'del-prod': delProduct(id); break;
    case 'del-nhap-item': {
      var ix = parseInt(btn.getAttribute('data-idx'), 10);
      if (ix >= 0 && ix < nhapList.length) { nhapList.splice(ix, 1); renderNhapList(); }
      break;
    }
    case 'del-tx': delTx(id); break;
    case 'del-order': delOrder(id); break;
    case 'order-view': openOrder(btn.getAttribute('data-oid')); break;
    case 'close-order': closeOrder(); break;
    case 'note-edit': {
      noteEditIdx = parseInt(btn.getAttribute('data-idx'), 10);
      renderNote();
      var eq = $('#noteEditQty');
      if (eq) { eq.focus(); eq.select(); }
      break;
    }
    case 'note-del': {
      var ni = parseInt(btn.getAttribute('data-idx'), 10);
      if (ni >= 0 && ni < retailItems.length) { retailItems.splice(ni, 1); noteEditIdx = -1; calcRetail(); }
      break;
    }
    case 'rnote-add': addRemedyToNote(); break;
    case 'rnote-edit': {
      remedyEditIdx = parseInt(btn.getAttribute('data-idx'), 10);
      renderRemedyNote();
      var req = $('#remedyNoteEditQty');
      if (req) { req.focus(); req.select(); }
      break;
    }
    case 'rnote-del': {
      var rni = parseInt(btn.getAttribute('data-idx'), 10);
      if (rni >= 0 && rni < remedyItems.length) { remedyItems.splice(rni, 1); remedyEditIdx = -1; calcRemedy(); }
      break;
    }
    case 'rnote-save': remedyNoteSave(); break;
    case 'rnote-cancel': remedyEditIdx = -1; renderRemedyNote(); break;
    case 'note-add': addRetailToNote(); break;
    case 'note-save': noteSave(); break;
    case 'note-cancel': noteEditIdx = -1; renderNote(); break;
    case 'tx-edit': openTxEdit(id); break;
    case 'close-tx': closeTxEdit(); break;
    case 'save-tx': saveTxEdit(); break;
    case 'save-edit': saveEdit(); break;
    case 'sync-discard': discardUnsynced(); break;
    case 'reload-app': reloadAppClick(); break;
    case 'brand-devices': brandDevicesClick(); break;
    case 'close-edit': closeEdit(); break;
    case 'reconcile': openRec(); break;
    case 'close-rec': closeRec(); break;
    case 'rec-fix': recFix(id); break;
    case 'rec-fix-all': recFixAll(); break;
    case 'backup-now': downloadBackup(true); break;
    case 'restore-file': {
      var ri = $('#restoreInput');
      if (ri) ri.click();
      break;
    }
    case 'page': {
      var kind = btn.getAttribute('data-kind');
      var page = parseInt(btn.getAttribute('data-page'), 10) || 1;
      if (kind === 'inv') { invPage = page; renderInventory(); }
      else if (kind === 'imp') { impPage = page; renderHistory('imp'); }
      else if (kind === 'exp') { expPage = page; renderHistory('exp'); }
      else if (kind === 'rnote') { remedyNotePage = page; renderRemedyNote(); }
      else if (kind === 'note') { notePage = page; renderNote(); }
      else if (kind === 'order') { orderPage = page; renderOrder(); }
      break;
    }
  }
}

function bindEvents(){
  doc.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('[data-action]') : null;
    if (t) handleAction(t);
    if (!e.target.closest || !e.target.closest('.menu')) closeThemeMenu();
  });

  $$('#themeMenu [data-theme-set]').forEach(function(b){
    b.addEventListener('click', function(){
      applyTheme(b.getAttribute('data-theme-set'));
      closeThemeMenu();
    });
  });
  /* 2.13.1: Esc đóng menu chế độ và đưa focus về nút âm dương. */
  doc.addEventListener('keydown', function(e){
    var tm = $('#themeMenu');
    if (e.key !== 'Escape' || !tm || tm.hidden) return;
    closeThemeMenu();
    var yb = $('#themeBtn'); if (yb) yb.focus();
  });

  var nf = $('#nhapForm');
  if (nf) nf.addEventListener('submit', saveNhap);
  /* N2: lỗi trong hộp thoại tự xóa khi hộp đóng hoặc người dùng sửa một ô trong hộp. */
  $$('dialog').forEach(function(d){
    d.addEventListener('close', function(){ clearDlgErr(d); });
    d.addEventListener('input', function(){ clearDlgErr(d); });
  });
  if (nf) nf.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' || e.defaultPrevented) return;
    if (!e.target || e.target.tagName !== 'INPUT') return;
    e.preventDefault();
    var id = e.target.id;
    if (id === 'nhapQty' && !num(($('#nhapPrice') || {}).value)) { goSearch('#nhapPrice'); return; }
    if (id === 'nhapQty' || id === 'nhapPrice') { addNhapItem(); return; }
    goSearch('#nhapSearch');
  });
  ['nhapQty', 'nhapPrice'].forEach(function(id){
    var n = $('#' + id);
    if (n) n.addEventListener('input', calcNhap);
  });
  var nsName = $('#nhapSearch');
  if (nsName) nsName.addEventListener('input', calcNhap);
  var nqHint = $('#nhapQty');
  if (nqHint) attachQtyHint(nqHint, 'kg');
  var txqHint = $('#txEditQty');
  if (txqHint) attachQtyHint(txqHint, function(){ return txEditCur && txEditCur.rx ? 'g' : 'kg'; });
  var ns = $('#nhapSearch');
  if (ns) ns.addEventListener('input', function(){
    if (nhapPid) {
      var p = findProduct(nhapPid);
      if (!p || capWords(ns.value) !== capWords(p.name)) nhapPid = null;
    }
  });

  var body = $('#retailBody');
  if (body) body.addEventListener('input', function(e){
    if (e.target.classList.contains('retail-money') || e.target.classList.contains('retail-qty')) calcRetail();
  });
  var nbody = $('#retailNoteBody');
  if (nbody) nbody.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); noteSave(); }
    else if (e.key === 'Escape' && noteEditIdx >= 0) { noteEditIdx = -1; renderNote(); }
  });
  var rnbody = $('#remedyNoteBody');
  if (rnbody) rnbody.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') { e.preventDefault(); remedyNoteSave(); }
    else if (e.key === 'Escape' && remedyEditIdx >= 0) { remedyEditIdx = -1; renderRemedyNote(); }
  });
  var rbody = $('#remedyBody');
  if (rbody) rbody.addEventListener('input', function(e){
    if (e.target.classList.contains('remedy-qty')) calcRemedy();
  });
  function goSearch(sel){
    var s = $(sel);
    if (!s) return;
    s.focus();
    if (typeof s.select === 'function') s.select();
  }
  function rowEnter(host, add){
    if (!host) return;
    host.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' || e.defaultPrevented) return;
      if (!e.target || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      /* Enter khi đang nhập dòng: đưa thẳng vào tờ ghi (giống nhập hàng) */
      add();
    });
  }
  rowEnter(body, addRetailToNote);
  rowEnter(rbody, addRemedyToNote);
  var rup = $('#remedyUnitPrice');
  if (rup) {
    rup.addEventListener('input', calcRemedy);
    rup.addEventListener('keydown', function(e){
      if (e.key === 'Enter') { e.preventDefault(); goSearch('#remedySearch'); }
    });
  }
  var rth = $('#remedyThang');
  if (rth) {
    rth.addEventListener('input', calcRemedy);
    rth.addEventListener('change', function(){ rth.value = String(remedyThang()); calcRemedy(); });
    rth.addEventListener('keydown', function(e){
      if (e.key === 'Enter') { e.preventDefault(); goSearch('#remedySearch'); }
    });
  }
  var rsel = $('#remedyPreset');
  if (rsel) rsel.addEventListener('change', remedyPresetPick);
  var rname = $('#remedyName');
  if (rname) {
    rname.addEventListener('input', updatePresetUI);
    rname.addEventListener('blur', function(){ rname.value = capWords(rname.value); updatePresetUI(); });
  }

  var is = $('#invSearch');
  if (is) is.addEventListener('input', function(){ invPage = 1; renderInventory(); });

  bindDateInput('retailDate');
  bindDateInput('remedyDate');
  var impS = $('#impSearch');
  if (impS) impS.addEventListener('input', function(){ impPage = 1; renderHistory('imp'); });
  var expS = $('#expSearch');
  if (expS) expS.addEventListener('input', function(){ expPage = 1; renderHistory('exp'); });
  bindMonthInput('expMonth', function(){ expPage = 1; renderHistory('exp'); });

  var cy = $('#chartYear');
  if (cy) cy.addEventListener('change', function(){ lastChartYear = (String(cy.value).trim() === String(thisYear())) ? String(thisYear()) : null; chartSel = -1; renderChart(); });
  var ch = $('#statsChart');
  if (ch) ch.addEventListener('click', onChartClick);

  var cb = $('#chartBox');
  if (cb) cb.addEventListener('toggle', function(){
    if (cb.open) requestAnimationFrame(renderChart);
  });
  initTabs();
  initFootBars();

  var rt = null;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ if (cb && cb.open) renderChart(); }, 160);
  });

  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  var onMq = function(){
    var m = window.__THEME__ || 'system';
    if (m === 'system') applyTheme('system');
  };
  if (mq.addEventListener) mq.addEventListener('change', onMq);

  var dlg = $('#editDlg');
  if (dlg) dlg.addEventListener('click', function(e){ if (e.target === dlg) closeEdit(); });
  var recD = $('#recDlg');
  if (recD) recD.addEventListener('click', function(e){ if (e.target === recD) closeRec(); });
  var txd = $('#txDlg');
  if (txd) txd.addEventListener('click', function(e){ if (e.target === txd) closeTxEdit(); });
  /* Esc/cancel đóng dialog native mà không qua closeTxEdit: chỉ xóa đúng biến mà closeTxEdit dọn. */
  if (txd) txd.addEventListener('close', function(){ txEditCur = null; });
  var od = $('#orderDlg');
  if (od) od.addEventListener('click', function(e){ if (e.target === od) closeOrder(); });
  if (od) od.addEventListener('close', function(){ orderCur = null; });
  ['txEditQty', 'txEditPrice'].forEach(function(id){
    var n = $('#' + id);
    if (n) n.addEventListener('input', calcTxEdit);
  });

  var ri = $('#restoreInput');
  if (ri) ri.addEventListener('change', function(){
    var f = ri.files && ri.files[0];
    restoreFromFile(f);
    ri.value = '';
  });

  var ab = $('#autoBackup');
  if (ab) {
    ab.checked = backupAutoOn();
    ab.addEventListener('change', function(){
      try { localStorage.setItem(BAK_AUTO, ab.checked ? '1' : '0'); } catch (e) {}
      toast(ab.checked ? 'Đã bật tự sao lưu hằng ngày' : 'Đã tắt tự sao lưu hằng ngày');
      if (ab.checked) maybeAutoBackup();
    });
  }
}

/* ================= THANH CHÂN TỜ GHI (điện thoại) ================= */
/* Quyết định hiện thanh: chỉ điện thoại, thẻ đang mở, tờ ghi còn trong vùng nhìn (không cuộn đi hẳn), không đang gõ ô nhập/chọn và bàn phím không hiện. */
function footBarShow(o){
  return !!(o && o.mobile && o.open && !o.editing && !o.keyboard && o.height > 0 && o.top < o.vh - 60 && o.bottom > 100);
}
var footBarSched = false;
function updateFootBars(){
  var mobile = !!(window.matchMedia && window.matchMedia('(max-width:640px)').matches);
  var vv = window.visualViewport;
  var vh = window.innerHeight || 0;
  var keyboard = !!(vv && vv.height && vv.height < vh - 120);
  var ae = doc.activeElement;
  [['retailBox', 'retailNote'], ['remedyBox', 'remedyNote']].forEach(function(p){
    var box = $('#' + p[0]), note = $('#' + p[1]);
    if (!box || !note) return;
    var open = !!box.open;
    var fixedOn = mobile && open;
    if (!box.classList || !box.classList.toggle) return;
    box.classList.toggle('foot-fixed', fixedOn);
    if (!fixedOn) { box.classList.remove('foot-off'); return; }
    var r = note.getBoundingClientRect ? note.getBoundingClientRect() : { height: 0, top: 0, bottom: 0 };
    var editing = !!(ae && box.contains(ae) && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT' || ae.tagName === 'TEXTAREA'));
    var show = footBarShow({ mobile: mobile, open: open, editing: editing, keyboard: keyboard, height: r.height, top: r.top, bottom: r.bottom, vh: vh });
    box.classList.toggle('foot-off', !show);
    var foot = note.querySelector ? note.querySelector('.note__foot') : null;
    if (show && foot && foot.offsetHeight) box.style.setProperty('--foot-h', foot.offsetHeight + 'px');
  });
}
function scheduleFootBars(){
  if (footBarSched) return;
  footBarSched = true;
  setTimeout(function(){ footBarSched = false; updateFootBars(); }, 30);
}
/* 2.15.6: chế độ gọn khi nhập trên điện thoại (2.15.8: 2 dòng cuối). Hàm thuần: tổng cao n dòng cuối; 0 nếu số dòng <= n (không cần gọn). */
var COMPACT_ROWS = 2;
function compactListHeight(heights, n){
  var h = [];
  (heights || []).forEach(function(x){ if (x > 0) h.push(x); });
  var k = n > 0 ? n : COMPACT_ROWS;
  if (h.length <= k) return 0;
  var sum = 0;
  for (var i = h.length - k; i < h.length; i++) sum += h[i];
  return Math.ceil(sum);
}
/* Bật gọn: điện thoại và đang focus một ô nhập (INPUT, không phải ngày) trong thẻ. */
function compactWanted(o){
  return !!(o && o.mobile && o.editing);
}
var compactOffTimer = {};
/* 2.15.8 "guồng nước": smooth = true (đã gọn từ trước, vừa thêm vị bằng "+") thì cuộn MƯỢT xuống cuối; prefers-reduced-motion thì 'auto'. Lần vào gọn đầu: nhảy thẳng. */
function compactScrollEnd(list, smooth){
  var top = list.scrollHeight;
  if (smooth && typeof list.scrollTo === 'function') {
    var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    list.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    /* lưới an toàn: cuộn mượt có thể bị hủy khi bố cục đổi; sau 450ms chắc chắn nằm ở cuối */
    setTimeout(function(){ if (list.scrollHeight - list.clientHeight - list.scrollTop > 1) list.scrollTop = list.scrollHeight; }, 450);
  } else list.scrollTop = top;
}
function compactApply(box, list, on, smooth){
  if (!box || !list) return;
  var was = !!(box.classList && box.classList.contains('kb-compact'));
  if (!on) { box.classList.remove('kb-compact'); list.style.maxHeight = ''; return; }
  var tb = list.querySelector('tbody');
  var hs = [];
  if (tb) { var rs = tb.children || []; for (var i = 0; i < rs.length; i++) hs.push(rs[i].getBoundingClientRect().height); }
  var h = compactListHeight(hs, COMPACT_ROWS);
  box.classList.add('kb-compact');
  list.style.maxHeight = h ? h + 'px' : '';
  compactScrollEnd(list, !!smooth && was);
}
/* Đồng bộ chế độ gọn theo ô đang focus. force = đo lại và cuộn cuối (sau "+"). Tắt trễ 250ms để chuyển ô SL -> Thành tiền -> + không nhấp nháy. */
function compactSync(force){
  var mobile = kbMobile();
  var ae = doc.activeElement;
  [['retailBox', 'retailNoteList'], ['remedyBox', 'remedyNoteList']].forEach(function(p){
    var box = $('#' + p[0]), list = $('#' + p[1]);
    if (!box || !list || !box.classList) return;
    var editing = !!(ae && ae.tagName === 'INPUT' && ae.type !== 'date' && box.contains && box.contains(ae));
    var want = compactWanted({ mobile: mobile, editing: editing });
    if (want) {
      if (compactOffTimer[p[0]]) { clearTimeout(compactOffTimer[p[0]]); compactOffTimer[p[0]] = 0; }
      if (force || !box.classList.contains('kb-compact')) compactApply(box, list, true, force);
    } else if (box.classList.contains('kb-compact') && !compactOffTimer[p[0]]) {
      compactOffTimer[p[0]] = setTimeout(function(){
        compactOffTimer[p[0]] = 0;
        var a2 = doc.activeElement;
        if (a2 && a2.tagName === 'INPUT' && a2.type !== 'date' && box.contains && box.contains(a2)) return;
        compactApply(box, list, false);
      }, 250);
    }
  });
}
/* 2.15.8: ĐỊNH VỊ TRANG XÁC ĐỊNH khi nhập trên điện thoại (không phụ thuộc số đo bàn phím của iOS, vốn không đáng tin).
   Cuộn sao cho thanh tiêu đề thẻ (.card__bar của Bán lẻ/Thuốc chén) nằm ngay dưới thanh .top (hoặc đỉnh vùng thấy vvTop nếu iOS đã pan) + PLACE_GAP.
   Khi đó .top + thanh thẻ + đầu tờ ghi + 2 dòng gọn + dòng đang nhập ~ 400px < vùng thấy trên bàn phím (~459px).
   Hàm thuần: trả độ cuộn (px, dương = cuộn xuống); sai số < 2px thì 0. barBottom không đo được: mặc định 60. */
var PLACE_GAP = 8;
function placeScrollDelta(cardTop, barBottom, vvTop, rowTop, rowBottom, visBottom){
  var vt = vvTop > 0 ? vvTop : 0;
  var tb = barBottom > 0 ? barBottom : 60;
  var minTop = Math.max(tb, vt) + PLACE_GAP;
  var d = cardTop - minTop;
  /* dòng đang nhập (nếu có) phải nằm trên visBottom (đỉnh thanh phụ bàn phím): cuộn thêm, nhưng đỉnh dòng không được lên quá minTop */
  if (rowBottom > 0 && visBottom > 0 && rowBottom - d > visBottom) d = Math.max(d, Math.min(rowBottom - visBottom, rowTop - minTop));
  return Math.abs(d) < 2 ? 0 : Math.round(d);
}
/* Đáy vùng an toàn của dòng đang nhập: đỉnh bàn phím trừ KB_BAR (thanh Prev/Next/Done ~57px + lề). Có vv báo bàn phím thì dùng; chưa báo thì giả định bàn phím cao ~46% màn hình. */
var KB_BAR = 80;
function kbVisBottom(innerH, vvTop, vvH){
  if (!(innerH > 0)) return 0;
  var kb = vvH > 0 && vvH < innerH - 80;
  return (kb ? (vvTop > 0 ? vvTop : 0) + vvH : Math.round(innerH * 0.54)) - KB_BAR;
}
/* Chỗ trống cuối trang cố định (không theo vv) để trang đủ dài cuộn tới vị trí trên: 60% chiều cao cửa sổ. */
function kbPadFixed(innerH){ return innerH > 0 ? Math.round(innerH * 0.6) : 0; }
var kbTimers = [], kbGen = 0, kbMovedAt = 0, kbDebug = false, kbReason = 'init';
function kbClear(){ kbGen++; kbTimers.forEach(clearTimeout); kbTimers = []; }
/* Chỉ khi người dùng VUỐT/cuộn (touchmove, wheel): hủy các lần định vị đang chờ và không ép lại khi vv resize trong 800ms.
   Chạm (tap) KHÔNG dừng; focusin/"+" mới luôn được định vị lại. */
function kbUserStop(){ kbClear(); kbMovedAt = Date.now(); }
function kbMobile(){ return !!(window.matchMedia && window.matchMedia('(max-width:640px)').matches); }
/* Thẻ chứa ô nhập (INPUT không phải ngày) trong Bán lẻ/Thuốc chén; ngoài ra null. */
function kbBoxOf(t){
  if (!t || !t.closest || t.tagName !== 'INPUT' || t.type === 'date') return null;
  return t.closest('#retailBox, #remedyBox');
}
/* Dòng gỡ lỗi (?kbdebug=1): hiện ngay khi mở trang; đặt theo visualViewport vì fixed của iOS bám layout viewport (có thể trôi ra ngoài màn hình khi bàn phím hiện). */
function kbDbg(why){
  if (why) kbReason = why;
  if (!kbDebug || !doc.body) return;
  var b = $('#kbDbg');
  if (!b) { b = doc.createElement('div'); b.id = 'kbDbg'; b.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;background:#111;color:#0f0;font:10px monospace;padding:2px 4px;white-space:nowrap;pointer-events:none;max-width:100vw;overflow:hidden'; doc.body.appendChild(b); }
  var vv = window.visualViewport, ih = window.innerHeight || 0;
  var rb = $('#retailBox'), mb = $('#remedyBox');
  var cp = !!((rb && rb.classList && rb.classList.contains('kb-compact')) || (mb && mb.classList && mb.classList.contains('kb-compact')));
  b.style.transform = vv ? 'translate(' + Math.round(vv.offsetLeft || 0) + 'px,' + Math.round(vv.offsetTop || 0) + 'px)' : '';
  b.textContent = 'vvH ' + Math.round(vv && vv.height ? vv.height : 0) + ' vvTop ' + Math.round(vv ? (vv.offsetTop || 0) : 0) + ' ih ' + ih + ' y ' + Math.round(window.scrollY || 0) + ' compact ' + (cp ? 1 : 0) + ' | ' + kbReason;
}
function kbPlaceNow(t){
  var box = kbBoxOf(t);
  if (!box) { kbDbg('thoat: khong-o-nhap-trong-the'); return; }
  if (doc.activeElement !== t) { kbDbg('thoat: o-khong-con-focus'); return; }
  if (!kbMobile()) { kbDbg('thoat: may-tinh'); return; }
  var bar = box.querySelector ? box.querySelector('.card__bar') : null;
  if (!bar) { kbDbg('thoat: khong-co-thanh-the'); return; }
  var ih = window.innerHeight || 0, vv = window.visualViewport;
  var root = doc.documentElement;
  if (root && root.style && root.style.setProperty) root.style.setProperty('--kb-pad', kbPadFixed(ih) + 'px');
  var top = $('.top');
  var tr = t.closest('tr[data-pid]'), rr = tr && tr.getBoundingClientRect ? tr.getBoundingClientRect() : null;
  var d = placeScrollDelta(bar.getBoundingClientRect().top, top && top.getBoundingClientRect ? top.getBoundingClientRect().bottom : 60, vv ? (vv.offsetTop || 0) : 0,
    rr ? rr.top : 0, rr ? rr.bottom : 0, kbVisBottom(ih, vv ? (vv.offsetTop || 0) : 0, vv ? vv.height : 0));
  if (d) window.scrollBy(0, d);
  kbDbg(d ? 'cuon ' + d : 'da-dung-cho');
}
/* focusin / sau "+": định vị ngay và lại ở 100/300/600/1000ms vì bố cục đổi trễ (bàn phím, chế độ gọn). Chỉ vuốt tay mới hủy; lần mới luôn chạy. */
function kbSchedule(t){
  kbClear();
  kbMovedAt = 0;
  if (!kbBoxOf(t)) { kbDbg('thoat: khong-o-nhap-trong-the'); return; }
  var g = kbGen;
  kbPlaceNow(t);
  [100, 300, 600, 1000].forEach(function(ms){ kbTimers.push(setTimeout(function(){ if (g === kbGen) kbPlaceNow(t); }, ms)); });
}
function kbRelease(){
  setTimeout(function(){
    if (kbBoxOf(doc.activeElement)) return;
    kbClear();
    var root = doc.documentElement;
    if (root && root.style && root.style.setProperty) root.style.setProperty('--kb-pad', '0px');
  }, 400);
}
/* Chỉ visualViewport 'resize' (bàn phím hiện/đổi) mới định vị lại; không nghe 'scroll' để không kéo ngược khi người dùng vuốt. */
function onVvChange(){ scheduleFootBars(); kbDbg(); if (Date.now() - kbMovedAt < 800) return; var a = doc.activeElement; if (kbBoxOf(a)) kbPlaceNow(a); }
function initFootBars(){
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('scroll', scheduleFootBars, { passive: true });
    window.addEventListener('resize', scheduleFootBars);
  }
  if (window.visualViewport && window.visualViewport.addEventListener) {
    window.visualViewport.addEventListener('resize', onVvChange);
  }
  try { kbDebug = /[?&]kbdebug=1/.test((window.location && window.location.search) || ''); } catch (e) {}
  if (kbDebug) {
    kbDbg('mo-trang');
    if (window.visualViewport && window.visualViewport.addEventListener) window.visualViewport.addEventListener('scroll', function(){ kbDbg(); });
    if (typeof window.addEventListener === 'function') window.addEventListener('scroll', function(){ kbDbg(); }, { passive: true });
  }
  ['touchmove', 'wheel'].forEach(function(n){ doc.addEventListener(n, kbUserStop, { passive: true }); });
  doc.addEventListener('focusin', function(e){ scheduleFootBars(); compactSync(false); kbSchedule(e && e.target); });
  doc.addEventListener('focusout', function(){ scheduleFootBars(); kbRelease(); setTimeout(compactSync, 0); });
  ['retailBox', 'remedyBox'].forEach(function(id){
    var b = $('#' + id);
    if (b && b.addEventListener) b.addEventListener('toggle', scheduleFootBars);
    var n = $(id === 'retailBox' ? '#retailNote' : '#remedyNote');
    if (n && typeof window.ResizeObserver === 'function') new window.ResizeObserver(scheduleFootBars).observe(n);
  });
  var tabs = $('#tabs');
  if (tabs) tabs.addEventListener('click', scheduleFootBars);
  updateFootBars();
}
/* ================= KHỞI ĐỘNG ================= */
/* 2.10.0: tab 8 mục. Chỉ đổi open/aria-selected/class và localStorage 'qlk_tab'; không đụng dữ liệu. */
function initTabs(){
  var nav = $('#tabs');
  if (!nav) return;
  var btns = nav.querySelectorAll('.tab');
  var ids = [];
  var boxes = [];
  for (var i = 0; i < btns.length; i++) {
    var id0 = btns[i].getAttribute('data-tab');
    ids.push(id0);
    var bx0 = doc.getElementById(id0);
    if (bx0) boxes.push(bx0);
  }
  var activate = function(id){
    for (var j = 0; j < boxes.length; j++) {
      if (boxes[j].id !== id && boxes[j].open) boxes[j].open = false;
    }
    for (var m = 0; m < btns.length; m++) {
      var on = btns[m].getAttribute('data-tab') === id;
      btns[m].classList.toggle('is-active', on);
      btns[m].setAttribute('aria-selected', on ? 'true' : 'false');
    }
    try { localStorage.setItem('qlk_tab', id); } catch (e) {}
  };
  boxes.forEach(function(bx){
    bx.addEventListener('toggle', function(){ if (bx.open) activate(bx.id); });
    var s = bx.querySelector(':scope > summary');
    if (s) s.addEventListener('click', function(e){ e.preventDefault(); });
  });
  nav.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.tab') : null;
    if (!b || !nav.contains(b)) return;
    var bx1 = doc.getElementById(b.getAttribute('data-tab'));
    if (!bx1) return;
    bx1.open = true;
    activate(bx1.id);
  });
  var saved = null;
  try { saved = localStorage.getItem('qlk_tab'); } catch (e) {}
  var start = ids.indexOf(saved) >= 0 ? saved : 'retailBox';
  var sb = doc.getElementById(start);
  if (sb) { sb.open = true; activate(start); }
}

function init(){
  var remote = window.__DB__ ? sanitize(window.__DB__) : null;
  var local = readLocal();
  var wasDirty = readDirty();
  var savedBase = readBase();

  var scaledFromK = !!(local && local._scaledFromK);
  if (local) delete local._scaledFromK;
  /* Bản local cũ còn đơn vị nghìn. Server đã migrate sang đồng thì bỏ
     bản đó, kẻo đẩy số đã làm tròn đè lên số lẻ gốc vừa nhân 1000. */
  var dropLegacy = !!(local && wasDirty && scaledFromK && remote && remote.moneyUnit === 'dong');
  if (local && wasDirty && !dropLegacy) {
    /* Có thay đổi chưa gửi: giữ bản local và đẩy lên máy chủ. */
    db = local;
    cloudBase = savedBase;
    dirty = true;
    dirtySince = Date.now();
  } else if (remote) {
    db = remote;
    cloudBase = num(remote.updatedAt) || savedBase;
    dirty = false;
    saveLocal();
  } else if (local) {
    db = local;
    cloudBase = savedBase || num(local.updatedAt);
    dirty = false;
  } else {
    db = { products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
    cloudBase = 0;
    dirty = false;
  }

  var m = window.__THEME__ || 'system';
  applyTheme(m);

  var t = todayISO();
  setDateInput('retailDate', t);
  setDateInput('remedyDate', t);
  lastAuto.retailDate = t;
  lastAuto.remedyDate = t;
  var cy = $('#chartYear');
  if (cy) cy.value = thisYear();
  lastChartYear = String(thisYear());

  bindEvents();
  initSuggest();
  resetRetail();
  resetRemedy();
  renderAll();
  renderBackupInfo();
  renderSyncBadge();
  renderReloadBtn();
  if (dropLegacy) toast('Đã bỏ thay đổi chưa gửi (nâng cấp dữ liệu)');

  if (dirty) {
    /* Đẩy bản local chưa gửi lên trước; server trả 409 nếu máy khác đã sửa. */
    pushState(false);
  } else if (window.__NEED_FETCH__ || !remote) {
    pullState(false, true);
  }
  startAutoRefresh();

  var firstUse = function(){
    doc.removeEventListener('pointerdown', firstUse);
    doc.removeEventListener('keydown', firstUse);
    setTimeout(maybeAutoBackup, 400);
  };
  doc.addEventListener('pointerdown', firstUse);
  doc.addEventListener('keydown', firstUse);
}

if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
else init();

})();
</script>
</body>
</html>`;
