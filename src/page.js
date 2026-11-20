/**
 * Quản Lý Kho — HTML + CSS + JS client (nhúng inline vào server.js).
 */

export const PAGE = String.raw`<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Quản Lý Kho — Sổ kho, đơn bán và doanh thu</title>
<meta name="description" content="Quản lý kho dược liệu: đơn bán lẻ, đơn thuốc chén, nhập hàng, tồn kho, lịch sử giao dịch và thống kê doanh thu 12 tháng. Đồng bộ mạng nội bộ (LAN).">
<meta name="color-scheme" content="light">
<meta name="theme-color" content="#142844">
<meta name="robots" content="noindex, nofollow">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Kho">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link id="favicon" rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
*,*::before,*::after{box-sizing:border-box}
:root{
color-scheme:light;
--bg:#e3dad5;--surface:#f6f2ef;--surface2:#e9e2de;--border:#d8ccc7;--border2:#e4dad6;
--text:#1e293b;--text2:#475569;--muted:#5b6b81;
--brand:#4f46e5;--brand-text:#4338ca;--brand-soft:#e8ebf8;
--green-text:#047857;--tab-ico:#047857;
--amber:#b45309;--amber-soft:#fbf5e6;--amber-text:#b45309;
--red:#be123c;--red-soft:#f8e7ea;--red-text:#be123c;
--blue-text:#1d4ed8;
--r:14px;--r-sm:10px;
--sh:inset 0 1px 0 rgba(255,255,255,.7),0 1px 2px rgba(15,23,42,.06),0 4px 10px rgba(15,23,42,.06),0 14px 28px rgba(15,23,42,.05);
--glass:var(--surface);--glass-bar:var(--surface);--glass-dark:#111827;--blur:none;--blurb:none;
--chart-imp:#5b5fd0;--chart-exp:#2f9e76;
--ring:0 0 0 3px rgba(79,70,229,.30);
}
html{-webkit-text-size-adjust:100%}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(40% 40% at 82% 16%,rgba(217,152,171,.48),transparent),radial-gradient(45% 45% at 10% 88%,rgba(126,167,138,.43),transparent),radial-gradient(38% 38% at 45% 42%,rgba(220,200,149,.48),transparent),radial-gradient(40% 40% at 88% 85%,rgba(140,178,174,.39),transparent),radial-gradient(32% 32% at 8% 14%,rgba(219,165,180,.35),transparent),radial-gradient(36% 30% at 55% 95%,rgba(164,194,171,.35),transparent),linear-gradient(135deg,#e6d8d1,#d3ddd4)}
@font-face{font-family:"Inter";font-style:normal;font-weight:400 700;font-display:swap;src:url(/inter.woff2) format("woff2")}
body{margin:0;background:var(--bg);color:var(--text);
font:15px/1.55 -apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Inter",system-ui,"Segoe UI",sans-serif;
padding-bottom:48px;-webkit-font-smoothing:antialiased}
button,input,select,textarea{font-family:inherit}
[hidden]{display:none!important}
h1,h2,p{margin:0}
a{color:var(--brand-text)}
.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.sprite{position:absolute;width:0;height:0;overflow:hidden}
.ico{width:1.15em;height:1.15em;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;flex:none;vertical-align:-.18em}
.skip{position:absolute;left:-9999px;top:0;z-index:200;background:var(--surface);color:var(--text);padding:10px 16px;border-radius:0 0 10px 0}
.skip:focus{left:0}
:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
/* ---------- layout ---------- */
.wrap{max-width:1120px;margin:0 auto;padding:0 16px}
.top{position:sticky;top:0;z-index:30;background:var(--glass-bar);-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);border-bottom:1px solid var(--border)}
.bar{display:flex;align-items:center;gap:10px;justify-content:space-between;flex-wrap:wrap;min-height:60px}
.brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:17px;color:var(--text);text-decoration:none;letter-spacing:-.01em;background:none;border:0;padding:0;font-family:inherit;cursor:pointer}
.brand-wrap{display:flex;align-items:center;gap:8px;min-width:0}
.brand__yin{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;padding:0;border:0;border-radius:10px;background:none;color:var(--brand-text)}
.brand__yin .ico{width:24px;height:24px}
.brand__yin.is-shake{animation:yinShake .4s ease-in-out}
@keyframes yinShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
@media (prefers-reduced-motion:reduce){.brand__yin.is-shake{animation:none;box-shadow:0 0 0 2px var(--red-text)}}
.bar__actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.sync-badge{max-width:min(440px,72vw);margin:0;padding:6px 10px;border-radius:12px;
border:1px solid var(--amber);background:var(--amber-soft);color:var(--amber-text);
font:inherit;font-size:12px;font-weight:700;line-height:1.35;text-align:left;white-space:pre-line;cursor:default}
.sync-discard{max-width:min(280px,70vw);white-space:normal;line-height:1.3}
.main{padding:18px 0 0}
/* ---------- buttons ---------- */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:8px 14px;
border-radius:var(--r-sm);border:1px solid var(--border);background:var(--surface);color:var(--text);
font:inherit;font-size:14px;font-weight:600;cursor:pointer;text-decoration:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.65),0 1px 2px rgba(15,23,42,.07);
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
.btn--danger{color:var(--red-text);background:transparent;border-color:transparent;box-shadow:none}
.btn--danger:hover{background:var(--red-soft)}
.btn[disabled]{opacity:.4;cursor:not-allowed}
/* ---------- menu ---------- */
.menu__item{display:flex;align-items:center;gap:9px;width:100%;padding:9px 10px;border:0;background:transparent;
color:var(--text);border-radius:8px;font:inherit;font-size:14px;cursor:pointer;text-align:left}
.menu__item:hover{background:var(--surface2)}
/* ---------- row action menu (···) ---------- */
.rowmenu{position:static;display:inline-flex}
.rowmenu__list{position:fixed;z-index:120;min-width:180px;background:var(--surface);
border:1px solid var(--border);border-radius:12px;box-shadow:0 14px 34px rgba(15,23,42,.18);padding:6px}
.menu__item--danger{color:var(--red-text)}
.menu__item--danger:hover{background:var(--red-soft);color:var(--red-text)}
/* ---------- cards ---------- */
.card{background:var(--glass);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden}
.card__head{display:flex;align-items:center;gap:10px;padding:13px 16px;flex-wrap:wrap}
.card__title{font-size:15px;font-weight:700;letter-spacing:-.01em}
.card__body{padding:16px}
.card__foot{padding:13px 16px;border-top:1px solid var(--border2)}
details>.card__head{cursor:pointer;list-style:none;user-select:none}
details>.card__head::-webkit-details-marker{display:none}
details[open]>.card__head{border-bottom:1px solid var(--border2)}
details>.card__head:hover{background:var(--surface2)}
/* ---------- stats ---------- */
/* 2.11.0: dải số liệu mỏng (2 nửa) và ô số trong Thống kê; không biểu tượng. */
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin-bottom:12px;background:var(--glass);
border:1px solid var(--border);border-radius:var(--r-sm);box-shadow:var(--sh)}
.thk{display:none}
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
.sug__name{font-weight:600;flex:1 1 auto;min-width:0;overflow:hidden;white-space:nowrap}
.sug__meta{font-size:12px;color:var(--muted);white-space:nowrap;flex:none}
/* 2.17.8: điện thoại – khung gợi ý rộng bằng cả thanh thẻ, mỗi vị 1 dòng cao ~40px */
@media (max-width:600px){.sug{position:static}.card__bar{position:relative}.sug__list{top:calc(100% + 2px)}.sug__item{padding:9px 10px;gap:8px}}
.sug__empty{padding:10px;font-size:13px;color:var(--muted)}
/* ---------- misc ---------- */
.mt-10{margin-top:10px}.mt-12{margin-top:12px}.mt-18{margin-top:18px}
.w-70{width:70px}.w-120{width:120px}
.gap-12{gap:12px}
.lbl--flat{margin:0}
.inline-row{display:flex;align-items:center;gap:6px}
.bak-actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
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
.chart-chip--prf,.chart-chip--stk{display:none}
/* 2.15.0: chú giải tháng – mỗi dòng "[ô màu] Nhập  số tiền"; ô năm nằm cùng hàng tiêu đề Thống kê. */
.chart-tip{flex-direction:row;flex-wrap:wrap;align-items:center;gap:4px 12px}
#chartBox>summary.chart-head .chart-year{margin-left:auto}
#chartBox>summary.chart-head .chart-head__stats{margin-left:0}
@media (max-width:600px){
#chartBox>summary.chart-head .chart-head__stats{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.chart-head__c{align-items:flex-start}
.chart-tip{gap:4px 10px}
.chart-chip{gap:5px}
.chart-chip__k{min-width:0}
}
/* ---------- toast ---------- */
.toast{position:fixed;z-index:120;left:50%;bottom:22px;transform:translate(-50%,150%);
opacity:0;visibility:hidden;
display:flex;align-items:center;gap:10px;max-width:calc(100% - 32px);
padding:11px 16px;border-radius:12px;background:var(--glass-dark);-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);color:#f8fafc;font-size:14px;font-weight:500;
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
}
/* ---------- dialog ---------- */
.dlg{border:0;padding:0;background:transparent;max-width:min(440px,calc(100% - 24px));width:100%;
max-height:calc(100dvh - 24px);overflow:auto}
.dlg::backdrop{background:rgba(10,15,26,.5);-webkit-backdrop-filter:var(--blurb);backdrop-filter:var(--blurb)}
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
.note__foot{display:flex;align-items:center;gap:10px;justify-content:flex-end;padding:10px 12px;border-top:1px solid var(--border2)}
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
#remedyPresetBox,#remedyFindBox{display:none}
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
.nhap-pend__name{font-weight:600;overflow-wrap:anywhere}
.nhap-pend__name.is-muted{color:var(--muted);font-weight:400}
.nhap-pend__tot{float:right;font-size:13px}
.nhap-hint{font-size:11px;margin:4px 0 0;text-align:left}
.nhap-foot__tot{display:none}
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
/* 2.32.0: Kho tồn – viên lọc Gần hết/Hết hàng (chữ ≥601px, icon + số đếm ≤600px), nút Đối chiếu chỉ icon + chấm số lệch. Bật/tắt qua --nb/--kb của luật nút kính. */
#invBox .inv-chip{flex:none;min-height:30px;padding:0 12px;gap:6px;font-size:13px;white-space:nowrap;--nb:rgba(255,255,255,.08);--kb:rgba(255,255,255,.12)}
#invBox .inv-chip.on{font-weight:700;--nb:rgba(255,255,255,.22);--kb:rgba(255,255,255,.4)}
#invBox .inv-chip .ico{display:none}
.inv-chip__n{color:var(--muted)}
/* 2.33.0: công tắc Tháng|Ngày của Thống kê (ngoài khối desktop để khỏi vượt trần 20736 B; .thk chỉ hiện ở desktop) */
html.desktop .thk__r{display:flex;align-items:center;gap:12px}
html.desktop .thk__m{display:inline-flex;height:26px;border-radius:999px;background:rgba(255,255,255,.08);padding:2px;box-sizing:border-box}
html.desktop .thk__m button{border:0;border-radius:999px;background:none;color:var(--muted);font:inherit;font-size:13px;font-weight:600;padding:0 12px;cursor:pointer}
html.desktop .thk__m button.on{background:rgba(255,255,255,.18);color:var(--text)}
html.desktop #chartTip[data-m=D] .chart-tip__m{min-width:84px}
/* 2.34.0: chip Lợi nhuận / Tổng tồn kho chỉ ở desktop; vùng Thống kê nhận focus (←→) không viền */
html.desktop #chartTip .chart-chip--prf,html.desktop #chartTip .chart-chip--stk{display:inline-flex}
html.desktop #chartTip .chart-chip--stk{margin-left:auto}
.chart-chip--prf .chart-chip__sw{background:#4ade80}
.chart-chip--stk .chart-chip__sw{background:#a78bfa}
/* 2.35.0: Thống kê điện thoại dùng chung công tắc Năm|Tháng|Ngày, biểu đồ cột đôi và 4 chip với desktop (ngoài khối cap desktop) */
html:not(.desktop) .thk{display:block}
html:not(.desktop) .thk__h{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
html:not(.desktop) .thk__t{margin:0;font-size:14px;font-weight:700}
html:not(.desktop) .thk__r{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
html:not(.desktop) .thk__m{display:inline-flex;height:36px;box-sizing:border-box;padding:2px;border-radius:999px;background:var(--surface2)}
html:not(.desktop) .thk__m button{border:0;border-radius:999px;background:none;color:var(--muted);font:inherit;font-size:14px;font-weight:600;padding:0 16px;min-height:32px}
html:not(.desktop) .thk__m button.on{background:var(--surface);color:var(--text);box-shadow:var(--sh)}
html:not(.desktop) .thk__y{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)}
html:not(.desktop) .thk__y .btn{min-width:40px;height:36px;padding:0;font-size:18px;line-height:1}
html:not(.desktop) .thk__y b{min-width:60px;text-align:center;font-size:15px;color:var(--text);font-variant-numeric:tabular-nums}
html:not(.desktop) .chart-year{display:none}
html:not(.desktop) .chart-chip--prf,html:not(.desktop) .chart-chip--stk{display:inline-flex}
html:not(.desktop) #statsChart{touch-action:pan-y}
#chartBox .card__body:focus{outline:none}
#invBox .card__bar-btn{position:relative}
.inv-dot{position:absolute;top:-5px;right:-5px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;border-radius:8px;background:#ef4444;color:#fff;font-size:11px;font-weight:700;line-height:16px;text-align:center}
.inv-dot[hidden]{display:none}
@media (min-width:601px){
#invBox .card__bar-btn{width:30px;min-width:30px;height:30px;min-height:30px;padding:0}
#invBox :is(.card__bar-title,.card__bar-count){order:-1;margin:0}
#invBox .card__bar-count{margin-right:auto;font-size:13px}
#invBox .card__bar-count::before{content:"· "}
}
.card__bar>.inp.card__bar-search{flex:1 1 220px;min-width:0}
@media (max-width:600px){
.card__bar-month{order:2}
.card__bar-btn{order:2}
.card__bar-lbl,.inv-chip__l{display:none}
#invBox .inv-chip{order:2;min-height:38px;padding:0 9px;gap:4px}
#invBox .inv-chip .ico{display:inline-block}
.inv-chip__n{font-size:11px}
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
#remedyNote .note__row--btns{flex-wrap:nowrap;gap:6px}
html:not(.desktop) #remedyNote>.note__list>table:has(#remedyNoteBody:empty)>thead{display:none}
#remedyNote:has(#remedyBody tr[data-pid])>.note__list>table>thead{display:table-header-group}
@media (max-width:600px){
#remedyBox .card__bar-preset{order:1;flex:1 1 90px;min-width:90px}
/* 2.15.1: ô chọn đơn lấy phần chỗ thừa, không hẹp hơn chữ "Đơn mới" (61px chữ + đệm/mũi tên ≈ 87px); ô ngày xuống hàng khi không đủ chỗ (320px). */
/* 2.17.2: Xóa đơn | Lưu/Sửa đơn | Bán đơn đúng một hàng (mọi cỡ màn hình). */
#remedyNote .note__row--btns .btn{flex:1 1 0;min-width:0;min-height:44px;padding-left:8px;padding-right:8px;white-space:nowrap;overflow:hidden}
#remedyNote .note__row--btns .btn .ico{display:none}
#remedyNote .note__row--btns #remedySaveLabel{overflow:hidden;min-width:0}
#remedyNote .note__row--btns{margin-top:3px}
#remedyNote .note__row:first-child{gap:6px 8px}
#remedyNote .note__row:first-child #remedyTotal{margin-left:auto}
}
@media (max-width:360px){#remedyNote #remedyThang{width:60px}#remedyNote #remedyUnitPrice{width:100px}}
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
#retailBox.foot-fixed #retailNote .note__foot,#remedyBox.foot-fixed #remedyNote .note__foot{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--glass-bar);-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);border-top:1px solid var(--border);box-shadow:inset 0 1px 0 rgba(255,255,255,.7),0 -2px 10px rgba(15,23,42,.12);padding-bottom:calc(10px + env(safe-area-inset-bottom,0px))}
#retailBox.foot-fixed.foot-off #retailNote .note__foot,#remedyBox.foot-fixed.foot-off #remedyNote .note__foot{display:none}
#remedyBox.foot-fixed #remedyNote .note__foot{padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))}
html{scroll-padding-bottom:230px}
/* 2.15.6/2.15.8: đang nhập: danh sách đã ghi gọn còn vùng cao đúng 2 dòng cuối (JS đặt max-height), cuộn được; mép trên mờ dần như guồng nước. */
.kb-compact .note__list{overflow-y:auto;-webkit-mask-image:linear-gradient(to bottom,transparent 0,black 12px);mask-image:linear-gradient(to bottom,transparent 0,black 12px)}
/* 2.15.10: khi nhập trên điện thoại JS khóa cuộn trang (body fixed, top âm); .kb-lock chặn neo cuộn/cuộn dội của iOS. */
html.kb-lock,body.kb-lock{overflow-anchor:none;overscroll-behavior:none;transition:none!important}
/* 2.15.11: .top sticky vẫn bám đỉnh vùng nhìn khi body fixed top âm (vvTop=0) và che đỉnh thẻ: ẩn khi khóa (visibility giữ nguyên bố cục). */
html.kb-lock .top{visibility:hidden}
#retailBody tr[data-pid],#remedyBody tr[data-pid]{scroll-margin-top:8px;scroll-margin-bottom:72px}
/* 2.15.18: khi gọn, tiêu đề cột trong danh sách (hiện khi có dòng nhập, +29px) bị ẩn: chiều cao danh sách không nhảy khi chọn vị, dòng cuối không lệch khỏi đáy. */
#remedyBox.kb-compact #remedyNote:has(#remedyBody tr[data-pid])>.note__list>table>thead,#remedyBox.kb-compact #remedyNote>.note__list>table>thead{display:none}
.chart{height:260px}
}
@media (max-width:600px){
.tw{overflow-x:visible}
table.ord,table.inv,table.his{display:block}
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
/* 2.15.18: dòng nhập thẳng cột với dòng đã ghi: cột STT rộng 26 + đệm 5 + khoảng 10 = tên bắt đầu ở 41px (như td 36px + đệm 5), STT căn giữa như .c-num. */
#retailNote .note__pending tr.is-row,#remedyNote .note__pending tr.is-row{grid-template-columns:26px minmax(0,1fr) minmax(0,1fr) 46px;padding:6px 5px}
#retailNote .note__pending tr.is-row>td:nth-child(1),#remedyNote .note__pending tr.is-row>td:nth-child(1){text-align:center}
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
.tabs{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px;margin-bottom:12px}
.tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;min-width:0;min-height:44px;padding:5px 6px;
border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface);color:var(--text2);font:inherit;
font-size:13px;font-weight:600;line-height:1.2;text-align:center;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.65),0 1px 2px rgba(15,23,42,.07)}
.tab:hover{background:var(--surface2);color:var(--text)}
.tab:focus-visible{outline:none;box-shadow:var(--ring)}
.tab.is-active{background:var(--brand);border-color:var(--brand);color:#fff}
@media (max-width:600px){
.tabs{grid-template-columns:repeat(4,minmax(0,1fr))}
.tab{padding:4px 2px;font-size:12px}
}
/* 2.15.8 (máy tính >640px): biểu tượng cạnh nhãn hai hàng (cùng icon với tiêu đề thẻ); điện thoại giữ chữ hai dòng, ẩn icon. */
.tab__ic{display:none}
/* 2.15.13: mọi icon tab cùng một màu xanh lá (--tab-ico, = màu icon Bán lẻ); tab đang chọn (nền tím) đặt icon xanh trên chip --brand-soft để vẫn nổi bật. */
.tab__ic{color:var(--tab-ico);border-radius:4px}
.tab.is-active .tab__ic{background:var(--brand-soft);box-shadow:0 0 0 3px var(--brand-soft)}
@media (min-width:641px){
.tab{display:grid;grid-template-columns:auto auto;grid-template-rows:auto auto;column-gap:6px;align-content:center;justify-items:center;padding:5px 4px}
.tab__ic{display:block;grid-row:1/3;grid-column:1;align-self:center;width:16px;height:16px;vertical-align:0}
.tab__l1{grid-column:2;grid-row:1}
.tab__l2{grid-column:2;grid-row:2}
}
/* 2.14.0 S1 (máy tính): cột SL của tờ ghi và dòng đang nhập rộng 152px → ô nhập 132px, vùng chữ ≥ 56px khi có gợi ý. Đặt SAU mọi quy tắc cg-qty ở trên. */
@media (min-width:601px){
#retailNote col.cg-qty,#remedyNote col.cg-qty,#nhapListBox col.cg-qty{width:152px;min-width:152px}
}
@media (max-width:600px){
#retailNote col.cg-qty,#retailNote col.cg-money{width:84px}
#nhapListBox col.cg-qty{width:64px}
#nhapListBox col.cg-money{width:84px}
/* Hàng Tổng nằm trong bảng dòng nhập (table.ord là block trên điện thoại): dựng lại lưới cùng độ rộng cột với bảng tờ ghi để số tổng thẳng cột tiền. */
.note__pending tfoot{display:block}
.note__pending tfoot tr{display:grid}
.note__pending tfoot td{display:block;padding:4px 5px;border-top:2px solid var(--border)}
#retailNote .note__pending tfoot tr{grid-template-columns:36px minmax(0,1fr) 84px 84px 52px}
#nhapListBox .note__pending tfoot tr{grid-template-columns:36px minmax(0,1fr) 64px 84px 52px}
#remedyNote .note__pending tfoot tr{grid-template-columns:36px minmax(0,1fr) 84px 52px}
}
@media (max-width:400px){
#retailNote col.cg-num,#nhapListBox col.cg-num{width:28px}
#retailNote col.cg-qty{width:70px}
#nhapListBox col.cg-qty{width:56px}
#retailNote col.cg-money,#nhapListBox col.cg-money{width:72px}
#retailNote col.cg-act,#nhapListBox col.cg-act{width:46px}
#retailNote .note__pending tfoot tr{grid-template-columns:28px minmax(0,1fr) 70px 72px 46px}
#nhapListBox .note__pending tfoot tr{grid-template-columns:28px minmax(0,1fr) 56px 72px 46px}
}
html.glass{--glass:rgba(246,242,239,.90);--glass-bar:rgba(246,242,239,.95);--glass-dark:rgba(17,24,39,.84);--blur:saturate(1.3) blur(14px);--blurb:blur(6px)}
@media (prefers-reduced-transparency:reduce){html.glass{--glass:var(--surface);--glass-bar:var(--surface);--glass-dark:#111827;--blur:none;--blurb:none}}
.bak-sec{margin-top:12px;padding:10px 12px;border:1px solid var(--kb,var(--border));border-radius:14px;background:var(--spec,none) top/100% 55% no-repeat,var(--pnl,rgba(255,255,255,.2));box-shadow:var(--k3d,none)}
.bak-sec:first-child{margin-top:0}
.bak-sec__t{margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.bak-sec__bar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.bak-sec__bar .bak-sec__t{margin:0}
.bak-dir{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px}
.bak-dir[hidden]{display:none}
.bak-dir__p{flex:1;min-width:0;word-break:break-all}
.bak-restore{color:var(--red-text)}
.bak-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:2px 14px;align-items:center;padding:2px 0;border-bottom:1px solid var(--border);font-size:13px;line-height:1.3}
.bak-row__name{font-weight:700;word-break:break-all}
.bak-row__size,.bak-row__time{text-align:right;color:var(--muted);white-space:nowrap}
.bak-busy{opacity:.5}
.bak-row__tag{margin-left:6px;padding:0 6px;border:1px solid var(--border);border-radius:8px;font-size:11px;font-weight:600;color:var(--muted);white-space:nowrap}
.bak-note{margin:6px 0 0}
.bak-pg:empty{display:none}
.bak-pg{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-top:8px}
@media (max-width:480px){.bak-row{grid-template-columns:auto minmax(0,1fr)}.bak-row__name{grid-column:1/-1}.bak-row__size{text-align:left}}
/* 2.23.0 chế độ desktop */
html.desktop,html.desktop body{background:transparent}
html.desktop{--sw:160px;--g:16px;overflow:hidden}
html.desktop body{display:grid;grid-template-columns:var(--sw) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);gap:var(--g);width:100%;height:100vh;margin:0;box-sizing:border-box;overflow:hidden;padding:10px var(--g) var(--g)}
html.desktop.tauri body{padding-top:34px}
html.desktop body::after{content:"";grid-area:1/1/3/2;border:1px solid rgba(255,255,255,.10);border-radius:24px;background:var(--glass);-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);z-index:-1}
html.desktop .top{position:static;grid-area:1/1;background:none;border:0;box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none}
html.desktop .top .wrap{padding:0 10px}
html.desktop .brand{font-size:13px;font-weight:700;min-height:28px}
html.desktop .top .bar{flex-direction:column;align-items:stretch;justify-content:flex-start;gap:8px;min-height:0;padding-top:10px}
html.desktop .main{display:contents}
html.desktop .stats{display:none}
html.desktop .tabs{grid-area:1/1/3/2;display:flex;flex-direction:column;gap:6px;margin:52px 10px 0;align-self:start}
html.desktop .tab{position:relative;display:block;min-height:30px;padding:6px 10px 6px 34px;border-radius:999px;border:1px solid;color:var(--text);font-size:12.5px;font-weight:700;line-height:16px;text-align:left}
html.desktop .tab__ic{position:absolute;left:10px;top:50%;margin-top:-9px;width:18px;height:18px;color:var(--text);stroke-width:1.5}
html.desktop .tab__l1::after{content:" "}
html.desktop .tab__l2{display:inline-block}
html.desktop .tab.is-active .tab__ic{background:none;box-shadow:none}
html.desktop #tb{height:24px}
html.desktop #tb span{line-height:24px}
html.desktop #tb button{width:36px}
html.desktop .main details.card{grid-area:1/2/3/3;min-height:0;min-width:0;margin:0;overflow:hidden}
html.desktop .main details:is(#retailBox,#remedyBox,#nhapBox,#backupBox){border-color:transparent;background:none;border-radius:0;-webkit-backdrop-filter:none;backdrop-filter:none}
html.desktop .card:not(.dlg__card){border-radius:20px;border:1px solid rgba(255,255,255,.10);background:var(--glass);-webkit-backdrop-filter:var(--blur);backdrop-filter:var(--blur);box-shadow:var(--k3d)}
html.desktop .card__body{padding:0}
html.desktop .dlg__card .card__body{padding:0 16px 16px}
html.desktop .card__bar{position:static;background:none;padding:12px 16px;border-bottom:0}
html.desktop :is(#retailBox,#remedyBox,#nhapBox) .card__bar{padding:0 0 12px}
html.desktop .card__bar .inp{height:32px;min-height:32px;padding-top:3px;padding-bottom:3px}
html.desktop .card__bar-title{font-size:15px;font-weight:700;white-space:nowrap}
html:is(.desktop,.pt) :is(.tab,.card__bar .inp,.note .inp,.chart-year__box),html:is(.desktop,.pt) .btn:not(.btn--primary,.btn--green,.btn--dark,.btn--danger,[aria-current]){border-color:var(--kb);background-color:var(--nb);box-shadow:var(--k3d);transition:background-color .12s,border-color .12s}
html:is(.desktop,.pt) .tab{--nb:rgba(255,255,255,.05);--kb:rgba(255,255,255,.09)}
html.desktop .tab:hover{background-color:rgba(255,255,255,.13);border-color:rgba(255,255,255,.22)}
html.desktop .btn:not(.btn--primary,.btn--green,.btn--dark,.btn--danger,[aria-current]):hover{background-color:rgba(255,255,255,.17);border-color:rgba(255,255,255,.25)}
html:is(.desktop,.pt) .tab.is-active{color:var(--sel-fg);border-color:var(--sel-bd);background-color:var(--sel-bg)}
html:is(.desktop,.pt) :is(.btn--green,.btn--primary,.btn--dark){color:#fff;font-weight:600;border-color:transparent;background-color:rgba(64,128,242,.5)}
html:is(.desktop,.pt) :is(.btn--green,.btn--primary,.btn--dark):hover{background-color:rgba(64,128,242,.6)}
html:is(.desktop,.pt) .btn--danger{background-color:var(--nb);border-color:var(--kb)}
html:is(.desktop,.pt) .pager__num[aria-current]{color:#fff;font-weight:600;border-color:transparent;background-color:rgba(255,255,255,.22)}
html.desktop :is(input,select).inp,html.desktop .btn{border-radius:999px}
html.desktop table.inv td.c-del .btn--icon,html.desktop table.his td.c-act .btn--icon{min-height:24px;height:24px}
html.desktop :is(.pager,#remedyNote .note__row--btns){gap:2px;padding:2px;border:1px solid;border-color:var(--kb);border-radius:999px;background-color:var(--nb);box-shadow:var(--k3d)}
html.desktop .pager{display:inline-flex}
html.desktop #remedyNote .note__row--btns .btn{min-height:26px}
html.desktop :is(.pager .btn,#remedyNote .note__row--btns .btn):not(.btn--primary,[aria-pressed=true],[aria-current]){border-color:transparent;background:none;box-shadow:none;transform:none}
html.desktop :is(.pager .btn,#remedyNote .note__row--btns .btn):not(.btn--primary,[aria-pressed=true],[aria-current],:disabled):hover{background:var(--hv)}
html.desktop :is(.pager,#remedyNote .note__row--btns) :is([aria-pressed=true],[aria-current],.btn--primary){box-shadow:var(--k3t)}
html:is(.desktop,.pt)[data-bg=navy],html:is(.desktop,.pt) .bgd[data-bg=navy]{--bt:linear-gradient(135deg,#0A1433,#12265C);--muted:rgba(255,255,255,.58);--red-text:#FF7676}
html:is(.desktop,.pt)[data-bg=prism],html:is(.desktop,.pt) .bgd[data-bg=prism]{--bt:linear-gradient(135deg,#291457,#0D4D73);--muted:rgba(255,255,255,.72);--red-text:#FFB9B9}
html:is(.desktop,.pt)[data-bg=cyan],html:is(.desktop,.pt) .bgd[data-bg=cyan]{--bt:linear-gradient(135deg,#052E3D,#08667A);--muted:rgba(255,255,255,.87);--red-text:#FFE0E0}
html:is(.desktop,.pt)[data-bg=emerald],html:is(.desktop,.pt) .bgd[data-bg=emerald]{--bt:linear-gradient(135deg,#05291F,#0A5C42);--muted:rgba(255,255,255,.77);--red-text:#FFC7C7}
html:is(.desktop,.pt)[data-bg=gold],html:is(.desktop,.pt) .bgd[data-bg=gold]{--bt:linear-gradient(135deg,#381F05,#6B420A);--muted:rgba(255,255,255,.73);--red-text:#FFBFBF}
html:is(.desktop,.pt)[data-bg=rose],html:is(.desktop,.pt) .bgd[data-bg=rose]{--bt:linear-gradient(135deg,#3D0D1F,#701A3D);--muted:rgba(255,255,255,.64);--red-text:#FF9A9A}
html:is(.desktop,.pt)[data-bg=graphite],html:is(.desktop,.pt) .bgd[data-bg=graphite]{--bt:linear-gradient(135deg,#141417,#2E2E33);--muted:rgba(255,255,255,.58);--red-text:#FF8484}
html:is(.desktop,.pt)[data-bg]{color-scheme:dark;--text:#f8fafc;--text2:rgba(255,255,255,.85);--brand:#34d399;--brand-soft:rgba(52,211,153,.18);--red-text:#FF7373;--surface:#141c3c;--surface2:#1b264f;--border:rgba(255,255,255,.14);--border2:rgba(255,255,255,.07);--vien:rgba(255,255,255,.14);--glass:rgba(255,255,255,.07);--pnl:rgba(255,255,255,.07);--chart-hi:rgba(255,255,255,.08);--glass-bar:rgba(255,255,255,.07);--ring:0 0 0 2px rgba(255,255,255,.35);--kb:rgba(255,255,255,.10);--spec:none;--k3d:none;--k3h:none;--k3t:none;--k3a:none;--chart-imp:#44DAFE;--chart-exp:#FFA33D;--nb:rgba(255,255,255,.07);--hv:rgba(255,255,255,.13);--sel-bg:rgba(255,255,255,.14);--sel-hv:rgba(255,255,255,.2);--sel-bd:rgba(255,255,255,.32);--sel-fg:#f8fafc}
html.desktop[data-bg]{--text2:var(--text);--brand-text:var(--text);--green-text:var(--text);--blue-text:var(--text)}
html.desktop .linkbtn{text-decoration-color:rgba(255,255,255,.3)}
html.desktop .linkbtn:hover{color:var(--text)}
html.glass:is(.desktop,.pt)[data-bg]{--blur:saturate(1.6) blur(18px);--blurb:blur(6px);--spec:linear-gradient(120deg,rgba(255,255,255,.07),rgba(255,255,255,0) 35%);--k3d:inset 1px 1px 0 rgba(255,255,255,.14),inset 0 -4px 8px rgba(0,0,0,.12),0 1px 1px rgba(0,0,0,.2),0 3px 8px rgba(0,0,0,.14);--k3t:inset 1px 1px 0 rgba(255,255,255,.16),0 1px 1px rgba(0,0,0,.2)}
html:is(.desktop,.pt)[data-bg] body::before{background:var(--bt)}
html:is(.desktop,.pt)[data-bg] *{scrollbar-color:rgba(255,255,255,.3) transparent}
html:is(.desktop,.pt)[data-bg] .dlg__card .note{background:rgba(255,255,255,.04)}
html:is(.desktop,.pt)[data-bg] .inp,html:is(.desktop,.pt)[data-bg] .chart-year__box{background-color:rgba(255,255,255,.10);border-color:rgba(255,255,255,.14)}
html:is(.desktop,.pt)[data-bg] .inp:focus{background-color:rgba(255,255,255,.14);border-color:rgba(255,255,255,.35);box-shadow:none}
html:is(.desktop,.pt)[data-bg] tbody tr:hover{background:rgba(255,255,255,.07)}
html:is(.desktop,.pt) select option,html:is(.desktop,.pt) select optgroup{background:var(--surface);color:var(--text)}
html:is(.desktop,.pt) .toast{background:rgba(20,28,60,.92);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:none}
html:is(.desktop,.pt) .dlg__card{background:var(--bt);border:1px solid rgba(255,255,255,.14)}
html:is(.desktop,.pt) .card table:not(.ord){background:none}
html.desktop .note{margin:0;border:1px solid rgba(255,255,255,.10);border-radius:18px;background:var(--glass)}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox){overflow:clip}
html.desktop .note__head{height:32px;align-items:center;padding:0 14px;background:none;color:var(--muted);font-size:10px;font-weight:600;letter-spacing:.08em;border-bottom:1px solid var(--border)}
html.desktop .note td{height:25px;padding:1px 10px;font-size:13px;border-bottom:1px solid var(--border)}
html.desktop .note tfoot td{border-top:1px solid var(--border);border-bottom:0}
html.desktop .note .c-act .inline-row{justify-content:flex-start}
html.desktop .note__pending tfoot td{border-top:0}
html.desktop .note th{height:28px;padding:0 10px;color:var(--muted);font-size:10px;font-weight:600;letter-spacing:.06em;border-bottom:1px solid var(--border)}
html.desktop .btn{min-height:30px;padding:3px 14px;font-size:13px}
html.desktop .btn--icon{min-width:32px;padding:3px}
html.desktop .pager .btn{min-height:24px;min-width:24px;padding:1px 9px}
html.desktop input.inp.inp--num{width:80px;max-width:100%;height:28px;min-height:28px;padding:2px 8px;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}
html.desktop input.inp.inp--num::placeholder{font-weight:400}
html.desktop td.c-money .inp--num{margin-left:auto}
html.desktop .note .inp{height:28px;min-height:28px;padding-top:2px;padding-bottom:2px;font-size:13px}
html.desktop .note td .btn--icon{min-height:22px;height:22px;width:22px;min-width:22px}
html.desktop .note .foot{margin:0;padding:3px 12px;border-top:1px solid var(--border);justify-content:flex-end}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox) .note__foot{display:flex;align-items:center;gap:10px;padding:4px 12px;background:none;border-top:1px solid var(--border)}
html.desktop .note__foot>.btn{margin-left:auto;height:30px}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox) col.cg-num{width:38px}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox) col.cg-name{width:auto}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox) col.cg-qty{width:120px;min-width:120px}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox) col.cg-money{width:110px}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox) col.cg-act{width:34px}
html.desktop .note :is(td,th):is(.c-num,.c-qty,.c-money,.c-act,.c-del){width:auto}
html.desktop .note :is(td,th):is(.c-act,.c-del){text-align:left;padding:0 10px 0 2px}
html.desktop .pend .nhap-add{display:inline-flex;width:22px;min-width:22px;height:22px;min-height:22px;padding:0}
html.desktop td .qty-hint.qty-hint--label{left:auto;right:96px;top:50%;transform:translateY(-50%);width:max-content;max-width:72px;box-sizing:border-box;padding:1px 5px;border:1px solid var(--kb);border-radius:999px;background:rgba(255,255,255,.10);color:var(--muted);font-size:11px;line-height:16px;text-align:center}
html.desktop .note__row{flex-wrap:nowrap;justify-content:flex-start}
html.desktop .note__row--btns{margin:0 0 0 auto}
html.desktop .sug__list{scrollbar-width:none;background:#141c3c;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:0;max-height:116px;scroll-snap-type:y mandatory}
html.desktop .sug__item{height:38px;scroll-snap-align:start}
html.desktop :is(.sug__meta,table.his .muted:not(.num)){font-size:13px}
html.desktop .sug__list::-webkit-scrollbar{display:none}
html.desktop #chartBox>summary{display:none}
html.desktop #chartBox .card__body{position:relative;padding:16px}
html.desktop .thk{display:block}
html.desktop .thk__h{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;height:32px}
html.desktop .thk__y{display:flex;align-items:center;gap:8px}
html.desktop .thk__y .btn{width:44px;min-width:44px;height:30px;min-height:30px;padding:0;font-size:18px;line-height:1}
html.desktop .thk__y span{font-size:13px;color:var(--muted)}
html.desktop .thk__y b{min-width:44px;text-align:center;font-size:15px;font-variant-numeric:tabular-nums}
html.desktop .thk__t{margin:0;font-size:15px;line-height:1.2;font-weight:700}
html.desktop #chartTip{align-items:center;gap:12px;height:24px;min-height:0;margin:0 0 12px;font-size:13px;white-space:nowrap}
html.desktop #chartTip .chart-tip__m{min-width:56px}
html.desktop #chartTip .chart-chip{gap:6px;padding:3px 10px;line-height:18px;border-radius:999px;background:rgba(255,255,255,.08);font-size:13px}
html.desktop #chartTip .chart-chip__sw{width:9px;height:9px;flex-basis:9px;border-radius:50%}
html.desktop #chartTip .chart-chip__k{min-width:0;font-weight:400;color:var(--muted)}
html.desktop .chart{flex:1;min-height:0;height:auto}
html.desktop .main details:not(#backupBox)[open]{display:flex;flex-direction:column}
html.desktop .main details:not(#backupBox)[open]::details-content{display:flex;flex-direction:column;flex:1;min-height:0}
html.desktop :is(#retailBox,#remedyBox,#nhapBox,#chartBox,#invBox,#impBox,#expBox)>.card__body{flex:1;min-height:0;display:flex;flex-direction:column}
html.desktop :is(#invBox,#impBox,#expBox) .tw{flex:1;min-height:0;overflow:hidden}
html.desktop table:is(.inv,.his){height:100%}
html.desktop table:is(.inv,.his) td{height:26px;padding:1px 8px;white-space:nowrap}
html.desktop :is(.inv td:first-child,.his td:nth-child(2)){width:100%;max-width:0;overflow:hidden;text-overflow:ellipsis}
html.desktop #expBox .card__bar-search{flex-basis:80px}
html.desktop table:is(.inv,.his) th{height:30px;padding:0 8px;text-transform:none;letter-spacing:0;font-size:13px;font-weight:400;color:var(--muted)}
html.desktop :is(#invPager,#impPager,#expPager){flex:none;margin:0;padding:8px 16px;border-top:0}
html.desktop :is(#retailNote,#remedyNote,#nhapListBox){flex:1;min-height:0;display:flex;flex-direction:column}
html.desktop :is(#retailNote,#remedyNote) .note__list{flex:1;min-height:0}
html.desktop :is(#retailNote,#remedyNote) .note__list>table,html.desktop #nhapListBox>table{height:100%}
html.desktop #nhapListBox>table{flex:1}
html.desktop #remedyBox>.card__body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr)}
html.desktop #remedyBox .card__bar{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
html.desktop :is(.rbl,.rbr){display:flex;align-items:center;gap:8px;min-width:0}
html.desktop #remedyPreset{display:none}
html.desktop #remedyFindBox{position:relative;display:flex;flex:1 1 0;min-width:0;align-items:center}
html.desktop #remedyFind{width:100%;padding-left:30px}
html.desktop #remedyFindBox>.ico{position:absolute;left:10px;width:14px;height:14px;opacity:.5;pointer-events:none}
html.desktop #remedyOpen{display:none;flex:1;min-width:0;align-items:center;height:32px;padding:0 4px 0 14px;border:1px solid var(--kb);border-radius:999px;background-color:var(--nb);font-size:13px;font-weight:700}
html.desktop #remedyOpenName{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
html.desktop #remedyClose{width:24px;min-width:24px;height:24px;min-height:24px;padding:0}
html.desktop #remedyFindBox.is-open>:is(.ico,#remedyFind,#remedyFindList){display:none}
html.desktop #remedyFindBox.is-open>#remedyOpen{display:flex}
html.desktop #remedyFindList{top:38px;max-height:182px}
html.desktop #remedyFindList .sug__item{height:36px}
html.desktop #remedyList{top:30px;right:auto;width:380px}
html.desktop .pend .empty-cell{text-align:left}
html.desktop .pend .empty-cell::after{content:"Tên vị thuốc"}
html.desktop #retailBody .empty-cell::after{content:"Chọn vị thuốc ở ô trên"}
html.desktop .pend .c-num{font-size:0}
html.desktop .pend .c-num::before{content:"+";font-size:13px}
html.desktop .pend input.inp.inp--num{height:22px;min-height:22px;padding:2px 5px;margin-left:auto}
html.desktop #remedyBody input.inp.inp--num{width:52px}
html.desktop .pend td .qty-hint--label{padding:0;border:0;background:none}
html.desktop #remedyBody .qty-hint--label{right:64px}
html.desktop :is(#retailBody,#remedyBody,#nhapPendingBody) .inp{background:none;border-color:transparent;box-shadow:none}
html.desktop :is(.nhap-pend__tot,.nhap-hint){display:none}
html.desktop .nhap-foot__tot{display:block;font-size:15px;color:var(--muted)}
html.desktop .nhap-foot__tot b{font-weight:400}
html.desktop .note__foot>.nhap-foot__tot+.btn .ico{display:none}
html.desktop .pend .c-money input:placeholder-shown{padding-inline:0;font-size:13px}
html.desktop .bx{height:32px;white-space:nowrap}
html.desktop .btn.bx--o{border-color:rgba(255,255,255,.14);background-color:rgba(255,255,255,.10)}
html.desktop #remedyNoteFoot td{height:38px;background:#ffffff0f}
html.desktop .pend button{padding:0}
html.desktop #remedyNote{margin-right:6px}
html.desktop #remedyPresetBox{display:flex;flex-direction:column;min-height:0;margin-left:6px;overflow:clip}
html.desktop #remedyPresetBox .rp-rows{flex:1;min-height:0;display:flex;flex-direction:column}
html.desktop #remedyNote .note__foot{flex-wrap:wrap;gap:6px;padding:4px 8px}
html.desktop #remedyNote #remedyThang{width:44px}
html.desktop #remedyNote #remedyUnitPrice{width:58px}
html.desktop #remedyNote :is(.note__lbl,.note__row--btns .btn){white-space:nowrap}
html.desktop #remedyNote .note__row--btns .btn{padding:3px 8px}
html.desktop #remedyNote .note__row--btns .btn .ico{display:none}
html.desktop .rp-row{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;width:100%;flex:1 1 0;min-height:0;padding:0 10px;border:0;border-bottom:1px solid var(--border);background:none;color:var(--text);font:inherit;font-size:13px;text-align:left;cursor:pointer}
html.desktop .rp-row:disabled{cursor:default}
html.desktop .rp-row:not(:disabled):hover{background:var(--hv)}
html.desktop .rp-row[aria-current]{background:var(--sel-bg);font-weight:800}
html.desktop .rp-row__name{overflow:hidden;white-space:nowrap}
html:is(.desktop,.pt) .btn.bak-restore{border-color:rgba(255,120,120,.5)}
html.desktop #backupBox{align-self:start}
html.desktop .bak-sec{padding:16px;border-radius:18px}
html.desktop.tauri .bak-sec{padding:12px 16px}
html.desktop.tauri .bak-row{padding:0}
html:is(.desktop,.pt) .bgd{position:relative;display:block;width:22px;height:22px;padding:0;border:0;background:none;font-size:0;cursor:pointer}
html:is(.desktop,.pt) .bgd::before{content:"";position:absolute;inset:0;box-sizing:border-box;border:1px solid rgba(255,255,255,.18);border-radius:50%;background:var(--bt)}
html:is(.desktop,.pt) .bgd[aria-pressed=true]::before{border:2px solid rgba(255,255,255,.95)}
html.desktop .bgdots{display:none;position:absolute;right:0;bottom:calc(100% + 6px);z-index:5;width:106px;flex-wrap:wrap;gap:6px;padding:8px;border:1px solid var(--vien);border-radius:14px;background:var(--surface)}
html.desktop .bgdots.is-open{display:flex}
html:is(.desktop,.pt) .glsw{display:flex;align-items:center;gap:8px;padding:0;border:0;background:none;color:var(--text);font:inherit;font-size:11px;cursor:pointer}
html:is(.desktop,.pt) .glsw::after{content:"";width:34px;height:18px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:radial-gradient(circle at 9px 50%,rgba(255,255,255,.95) 6px,transparent 7px) no-repeat,rgba(255,255,255,.10)}
html:is(.desktop,.pt) .glsw[aria-checked=true]::after{background:radial-gradient(circle at 25px 50%,rgba(255,255,255,.95) 6px,transparent 7px) no-repeat,rgba(64,128,242,.5)}
html.desktop .sbf{grid-area:2/1;align-self:end;display:flex;flex-direction:column;gap:8px;margin:0 10px 10px}
html.desktop .sbr{position:relative;display:flex;align-items:center;gap:6px}
html.desktop .sbp{width:28px;height:28px;padding:3px;border:0;background:none;color:var(--text);cursor:pointer}
html.desktop .sbp .ico{width:22px;height:22px}
html.desktop .sbs{flex:1;min-width:0;overflow:hidden;white-space:nowrap;display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted)}
html.desktop .sbs::before{content:"";flex:none;width:7px;height:7px;border-radius:50%;background:#34C759}
html.desktop .sbs[data-st=err]::before{background:#FF5F57}
html.desktop .brand__yin{cursor:pointer}
@media (prefers-reduced-motion:reduce){
*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important}
}
/* 2.20.13 điện thoại (html.pt: màn cảm ứng, hoặc ?pt=1; ?pt=0 tắt): CHỈ lớp nền/thẻ dùng chung token html[data-bg] của desktop; không đổi cỡ/bố cục. 2.23.0: phẳng, không kính */
html.pt[data-bg]{--bg:#0A1433;--brand-text:var(--text);--green-text:var(--text);--blue-text:var(--text);--sh:none;--r:20px}
html.pt .note{background:var(--glass);border-color:var(--kb)}
html.pt .note__head{color:var(--muted)}
html.pt .bgdots{display:flex;flex-wrap:wrap;align-items:center;gap:4px;padding:0;margin-top:14px}
html.pt .bgdots::before{content:"Nền";flex:0 0 100%;margin-bottom:4px;font-size:11px;color:var(--muted)}
</style>
<script>
(function(){
  try { var q = location.search || '';
    if (/[?&]glass=1/.test(q)) localStorage.setItem('kho_glass_v2', '1'); else if (/[?&]glass=0/.test(q)) localStorage.setItem('kho_glass_v2', '0');
    if (localStorage.getItem('kho_glass_v2') === '1') document.documentElement.classList.add('glass'); /* 2.23.0: kính mặc định TẮT; khóa mới để giá trị cũ không ghi đè */
    if (/[?&]desktop=0/.test(q)) localStorage.setItem('desktop', '0'); else if (/[?&]desktop=1/.test(q)) localStorage.setItem('desktop', '1');
    var dk = localStorage.getItem('desktop'); /* 2.20.12: PWA Edge trên PC (standalone, >=900px, chuột) tự bật; '0' = đã tắt */
    if (dk === '1' || (dk !== '0' && matchMedia('(display-mode: standalone)').matches && matchMedia('(pointer:fine)').matches && innerWidth >= 900)) document.documentElement.classList.add('desktop');
    if (window.__TAURI__ && document.documentElement.classList.contains('desktop')) document.documentElement.classList.add('tauri'); /* 2.23.1: chừa lề trên cho thanh tiêu đề của app */
    if (!document.documentElement.classList.contains('desktop') && !/[?&]pt=0/.test(q) && (/[?&]pt=1/.test(q) || matchMedia('(pointer:coarse)').matches)) { document.documentElement.classList.add('pt'); var tc = document.querySelector('meta[name=theme-color]'); if (tc) tc.setAttribute('content', '#142844'); } /* 2.20.13: điện thoại dùng chung lớp màu/nền với desktop */
  } catch (e) {}
  var R = document.documentElement, D = R.classList.contains('desktop');
  if (D || R.classList.contains('pt')) {
    /* 2.31.0: MỘT cỡ, bố cục co giãn theo cửa sổ (bỏ khung 1280x720 phóng đều và HD/FHD); 7 nền nhớ bằng localStorage 'desktopBg' */
    var BGS = ['navy', 'prism', 'cyan', 'emerald', 'gold', 'rose', 'graphite'], NM = ['Navy', 'Prism', 'Cyan', 'Emerald', 'Amber', 'Rose', 'Graphite'], cur = 'navy';
    try { cur = localStorage.getItem('desktopBg') || 'navy'; } catch (e) {}
    if (BGS.indexOf(cur) < 0) cur = 'navy';
    R.setAttribute('data-bg', cur);
    document.addEventListener('DOMContentLoaded', function(){
      var w = document.createElement('div'); w.className = 'bgdots'; w.setAttribute('role', 'group'); w.setAttribute('aria-label', 'Màu nền');
      BGS.forEach(function(k, i){
        var b = document.createElement('button'); b.type = 'button'; b.className = 'bgd'; b.setAttribute('data-bg', k); b.title = b.ariaLabel = b.textContent = NM[i];
        b.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
        b.onclick = function(){ cur = k; R.setAttribute('data-bg', k); try { localStorage.setItem('desktopBg', k); } catch (e) {} try { dispatchEvent(new Event('resize')); } catch (e) {} /* vẽ lại biểu đồ theo màu mới */
          [].forEach.call(w.children, function(c){ c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); }); w.classList.remove('is-open'); };
        w.appendChild(b);
      });
      var gl = document.createElement('button'); gl.type = 'button'; gl.className = 'glsw'; gl.setAttribute('role', 'switch'); gl.textContent = 'Hiệu ứng kính'; /* 2.23.0 */
      gl.setAttribute('aria-checked', R.classList.contains('glass') ? 'true' : 'false');
      gl.onclick = function(){ var on = !R.classList.contains('glass'); R.classList.toggle('glass', on); gl.setAttribute('aria-checked', on ? 'true' : 'false'); try { localStorage.setItem('kho_glass_v2', on ? '1' : '0'); } catch (e) {} };
      if (!D) { var bb = document.querySelector('#backupBox .card__body'); if (bb) bb.appendChild(w), bb.appendChild(gl); return; } /* điện thoại: bộ chọn nền ở cuối tab Sao lưu, không dựng phần desktop */
      /* 2.25.0: chân thanh bên = nền, dòng đồng bộ (#syncLine, chữ do renderSyncLine), công tắc kính. 2.28.0: bỏ nút Tải lại/Thoát; bấm logo hoặc chữ "Quản Lý Kho" = Tải lại (reloadAppClick, có hỏi nháp). */
      var sbf = document.createElement('div'), sy = document.createElement('div');
      sbf.className = 'sbf'; sy.className = 'sbs'; sy.id = 'syncLine'; sy.setAttribute('role', 'status'); sy.textContent = 'Đang kết nối…';
      /* 2.31.0: bỏ hàng 7 chấm; một nút bảng màu cùng dòng với dòng đồng bộ, bấm mở bảng 7 chấm, chọn xong đóng */
      var sr = document.createElement('div'), pb = document.createElement('button'); sr.className = 'sbr'; pb.type = 'button'; pb.className = 'sbp'; pb.title = 'Màu nền'; pb.setAttribute('aria-label', 'Màu nền'); pb.setAttribute('aria-expanded', 'false'); pb.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-palette"/></svg>';
      pb.onclick = function(e){ e.stopPropagation(); pb.setAttribute('aria-expanded', w.classList.toggle('is-open') ? 'true' : 'false'); };
      document.addEventListener('click', function(){ w.classList.remove('is-open'); pb.setAttribute('aria-expanded', 'false'); });
      [sy, pb, w].forEach(function(n){ sr.appendChild(n); }); [sr, gl].forEach(function(n){ sbf.appendChild(n); }); document.body.appendChild(sbf);
      ['brandBtn', 'brandLogo'].forEach(function(i){ var n = document.getElementById(i); if (n) n.setAttribute('data-action', 'reload-app'), n.title = 'Tải lại'; });
      /* 2.28.0: tab Sao lưu khôi phục: viên Sao lưu | Thiết bị (bakView) + thẻ Thiết bị (chỉ dẫn tới trang /auth/devices, không viết lại giao diện) */
      var kb = document.getElementById('backupBox'), kbar = kb && kb.querySelector('.card__bar'), kbody = kb && kb.querySelector('.card__body');
      if (kbar && kbody) {
        var sg = document.createElement('div'), ds = document.createElement('section');
        sg.className = 'pager bakseg'; sg.setAttribute('role', 'group'); sg.setAttribute('aria-label', 'Phần hiển thị');
        [['bak', 'Sao lưu'], ['dev', 'Thiết bị']].forEach(function(p){ var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn--sm'; b.textContent = p[1]; b.setAttribute('data-action', 'bak-view'); b.setAttribute('data-view', p[0]); if (p[0] === 'bak') b.setAttribute('aria-current', 'true'); sg.appendChild(b); });
        var dm = document.createElement('p'), dv = document.createElement('button');
        dm.className = 'hint'; dm.id = 'devMsg'; dm.setAttribute('role', 'status');
        dv.type = 'button'; dv.className = 'btn mt-10'; dv.id = 'devOpen'; dv.hidden = true; dv.textContent = 'Mở quản lý thiết bị'; dv.setAttribute('data-action', 'open-devices');
        ds.className = 'bak-sec'; ds.id = 'devSec'; ds.hidden = true; ds.appendChild(dm); ds.appendChild(dv);
        kbody.appendChild(ds); kbar.appendChild(sg);
      }
      var th = document.querySelector('.thk'), ct = document.getElementById('chartTip'); if (th && ct) th.appendChild(ct); /* 2.25.0: dòng tháng + chip Nhập/Bán nằm dưới hàng 4 số */
      var obd = document.querySelector('[data-action="open-backup-dir"]'); if (obd && window.__TAURI__) obd.hidden = false, obd.parentNode.hidden = false; /* 2.20.11; 2.22.0: ngoài Tauri ẩn cả dòng thư mục */
      ['.top', '.top .bar'].forEach(function(q){ var e = document.querySelector(q); if (e) e.setAttribute('data-tauri-drag-region', ''); }); /* vùng trống quanh logo kéo được cửa sổ (nút con không kéo) */
      /* 2.26.1: nút viên ở thanh đầu (chỉ desktop, tạo bằng JS nên điện thoại không có): Đơn mới (Thuốc chén; 2.31.0 nút + tròn), Xóa hết (Bán lẻ trái nút ngày, Nhập hàng cuối hàng) */
      var bx = function(act, ico, txt){ var b = document.createElement('button'); b.type = 'button'; b.className = 'btn bx'; b.setAttribute('data-action', act); b.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-' + ico + '"/></svg>' + txt; return b; };
      if (D) [['retailSearch', 'Nhập tên'], ['nhapSearch', 'Nhập tên'], ['nhapQty', 'SL'], ['nhapPrice', 'Giá (nghìn)']].forEach(function(p){ var n = document.getElementById(p[0]); if (n) n.placeholder = p[1]; }); /* 2.30.4 desktop theo Mac; aria-label giữ nguyên */
      var rbar = document.querySelector('#retailBox .card__bar'), nbar = document.querySelector('#nhapBox .card__bar');
      if (rbar) rbar.insertBefore(bx('clear-retail', 'trash', 'Xóa hết'), rbar.querySelector('.card__bar-date'));
      if (nbar) nbar.appendChild(bx('clear-nhap', 'trash', 'Xóa hết'));
      var rs = document.getElementById('remedySearch'), rb = document.querySelector('#remedyBox .card__bar'), rp = document.getElementById('remedyPreset'); /* 2.20.6: ô nhập tên Thuốc chén lên thanh đầu như Bán lẻ/Nhập hàng (chỉ dời nút, giữ id) */
      if (rs && rb && rp) { /* 2.26.0: nửa trái = tiêu đề + Tìm vị thuốc; nửa phải = Tìm đơn đã lưu + ngày; dòng đang gõ và dòng trống nằm cùng bảng tờ ghi (thứ tự: dòng ghi, dòng gõ, dòng trống) */
        var bl = document.createElement('div'), br = document.createElement('div');
        rs = rs.parentNode; rs.className = 'sug card__bar-search'; bl.className = 'rbl'; br.className = 'rbr';
        bl.appendChild(rb.querySelector('.card__bar-title')); bl.appendChild(rs); br.appendChild(document.getElementById('remedyFindBox')); br.appendChild(rb.querySelector('.card__bar-date'));
        var nw = bx('new-remedy', 'plus', ''); nw.className += ' btn--icon bx--o'; nw.title = 'Đơn mới'; nw.setAttribute('aria-label', 'Đơn mới'); bl.appendChild(nw); /* 2.31.0: nút + tròn bên phải ô Nhập tên (thay nút "Đơn mới") */ rb.insertBefore(bl, rp); rb.appendChild(br);
      }
      /* 2.26.0/2.29.0: dòng đang gõ và dòng trống nằm cùng bảng tờ ghi (thứ tự: dòng ghi, dòng gõ, dòng trống) cho Thuốc chén, Bán lẻ, Nhập hàng */
      [['remedyNoteBody', 'remedyBody', 'remedyFill'], ['retailNoteBody', 'retailBody', 'retailFill'], ['nhapListBody', 'nhapPendingBody', 'nhapFill']].forEach(function(a){
        var nb = document.getElementById(a[0]), pb = document.getElementById(a[1]), fl = document.createElement('tbody');
        if (nb && pb) { fl.id = a[2]; nb.parentNode.insertBefore(pb, nb.nextSibling); nb.parentNode.insertBefore(fl, pb.nextSibling); }
      });
    });
  }
  window.__DB__=%%BOOT%%;
  window.__NEED_FETCH__=%%NEEDFETCH%%;
})();
</script>
</head>
<body>
<a class="skip" href="#main">Bỏ qua điều hướng</a>
<svg class="sprite" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
<symbol id="i-yin" viewBox="0 0 1024 1024"><path fill="currentColor" stroke="none" d="M483.6 900.2L483.6 538.2L483.2 537.3L97.8 316.5L97.2 316.4L96.8 316.8L96.2 319.2L95.1 324.8L94.1 333.2L93.6 343.2L93.6 377.8L93.6 669.2L94.1 685.2L95.1 695.2L96.2 701.8L97.6 708.8L99.8 716.2L102.1 722.8L105.1 729.2L108.2 734.8L112.6 741.2L119.2 749.0L127.8 756.9L139.2 765.4L153.8 774.4L457.8 947.9L479.2 959.8L483.2 961.3L483.6 960.8ZM929.4 561.8L929.4 342.8L928.8 332.2L927.9 324.2L926.3 316.8L925.8 316.4L925.2 316.5L539.9 537.2L539.5 538.2L539.5 716.2L539.5 960.8L539.6 961.2L540.2 961.3L542.8 960.4L546.8 958.4L566.2 947.4L870.2 773.9L880.8 767.4L890.2 760.9L898.2 754.4L903.8 749.1L908.2 744.0L912.3 738.8L916.4 732.2L919.4 726.2L922.3 719.2L924.3 712.8L926.3 704.8L927.8 695.8L928.8 686.2L929.4 674.2ZM371.3 122.2L439.8 83.1L446.2 79.6L459.2 73.7L468.8 70.1L475.2 68.1L484.8 65.6L493.2 64.0L501.8 63.0L511.8 62.6L521.8 63.1L530.2 64.1L540.8 66.1L552.8 69.5L561.2 72.6L569.8 76.1L577.8 80.0L586.2 84.6L877.2 251.1L888.8 258.2L895.2 263.1L898.8 266.4L899.2 267.2L869.7 284.2L747.2 354.4L745.2 355.5L744.2 355.4L354.2 133.4L353.3 132.8L353.8 132.2ZM321.2 379.8L124.2 267.6L123.8 267.2L123.9 266.8L126.8 264.1L131.8 260.2L139.2 255.1L297.8 164.6L488.3 273.8L686.8 387.6L687.2 388.2L686.2 388.9L511.8 487.9L510.2 487.3Z"/></symbol>
<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
<symbol id="i-trash" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6M14 11v6"/></symbol>
<symbol id="i-save" viewBox="0 0 24 24"><path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/></symbol>
<symbol id="i-warehouse" viewBox="0 0 24 24"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></symbol>
<symbol id="i-chart-col" viewBox="0 0 24 24"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9M13 17V5M8 17v-3"/></symbol>
<symbol id="i-receipt" viewBox="0 0 24 24"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></symbol>
<symbol id="i-mortar" viewBox="0 0 24 24"><path d="M18 11h-4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4"/><path d="M6 7v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/><rect width="16" height="5" x="4" y="2" rx="1"/></symbol>
<symbol id="i-cloud-down" viewBox="0 0 24 24"><path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/></symbol>
<symbol id="i-cart" viewBox="0 0 24 24"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/></symbol>
<symbol id="i-cash" viewBox="0 0 24 24"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></symbol>
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol>
<symbol id="i-x" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
<symbol id="i-warn" viewBox="0 0 24 24"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/></symbol>
<symbol id="i-ban" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></symbol>
<symbol id="i-edit"viewBox="0 0 24 24"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></symbol>
<symbol id="i-dots" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></symbol>
<symbol id="i-swap" viewBox="0 0 24 24"><path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/></symbol>
<symbol id="i-calendar" viewBox="0 0 24 24"><path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></symbol>
<symbol id="i-inbox" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></symbol>
<symbol id="i-outbox" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/></symbol>
<symbol id="i-palette" viewBox="0 0 24 24"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></symbol>
<symbol id="i-drive" viewBox="0 0 24 24"><path d="M22 12H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/><path d="M6 16h.01M10 16h.01"/></symbol>
<symbol id="i-folder" viewBox="0 0 24 24"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></symbol>
<symbol id="i-refresh" viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M8 16H3v5"/></symbol>
</svg>
<header class="top">
  <div class="wrap bar">
    <div class="brand-wrap">
      <span class="brand__yin" id="brandLogo" aria-hidden="true"><svg class="ico" aria-hidden="true"><use href="#i-yin"/></svg></span>
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
  <p class="sr" id="brandNote" role="status"></p>
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
    <button type="button" class="tab" role="tab" data-tab="impBox" aria-controls="impBox" aria-selected="false" aria-label="Lịch sử nhập hàng"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-inbox"/></svg><span class="tab__l1">Lịch sử</span><span class="tab__l2">nhập</span></button>
    <button type="button" class="tab" role="tab" data-tab="expBox" aria-controls="expBox" aria-selected="false" aria-label="Lịch sử bán hàng"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-outbox"/></svg><span class="tab__l1">Lịch sử</span><span class="tab__l2">bán</span></button>
    <button type="button" class="tab" role="tab" data-tab="chartBox" aria-controls="chartBox" aria-selected="false" aria-label="Thống kê"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-chart-col"/></svg><span class="tab__l1">Thống</span><span class="tab__l2">kê</span></button>
    <button type="button" class="tab" role="tab" data-tab="backupBox" aria-controls="backupBox" aria-selected="false" aria-label="Sao lưu &amp; khôi phục"><svg class="ico tab__ic" aria-hidden="true"><use href="#i-drive"/></svg><span class="tab__l1">Sao lưu</span><span class="tab__l2">khôi phục</span></button>
  </nav>

  <div class="grid2">
    <details class="card" id="retailBox">
      <summary class="card__head sr-summary">
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
              <th scope="col">SL (kg)</th>
              <th scope="col" class="r">Giá bán</th>
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
                <th class="c-money" scope="col">Giá bán</th>
                <th class="c-del" scope="col"><span class="sr">Thêm</span></th>
              </tr></thead>
              <tbody id="retailBody" class="pend"></tbody>
              <tfoot id="retailNoteFoot" hidden><tr><td></td><td class="b">Tổng</td><td></td><td class="num b r txt-green" id="retailNoteTotal">0</td><td></td></tr></tfoot>
            </table>
          </div>
          <div class="foot" id="retailNotePager" hidden></div>
          <div class="note__foot">
            <button class="btn btn--green" type="button" data-action="save-retail" data-keep-focus>
              <svg class="ico" aria-hidden="true"><use href="#i-save"/></svg>Bán đơn
            </button>
          </div>
        </div>
      </div>
    </details>

    <details class="card" id="remedyBox">
      <summary class="card__head sr-summary">
        <svg class="ico txt-brand" aria-hidden="true"><use href="#i-mortar"/></svg>
        <h2 class="card__title">Thuốc chén</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-brand" aria-hidden="true"><use href="#i-mortar"/></svg>Thuốc chén</span>
          <select class="inp card__bar-preset" id="remedyPreset" aria-label="Đơn có sẵn">
            <option value="">Đơn mới</option>
          </select>
          <div id="remedyFindBox">
            <svg class="ico" aria-hidden="true"><use href="#i-search"/></svg>
            <input class="inp" id="remedyFind" type="search" autocomplete="off" placeholder="Tìm đơn đã lưu" aria-label="Tìm đơn đã lưu" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="remedyFindList">
            <div class="sug__list" id="remedyFindList" role="listbox" aria-label="Đơn đã lưu" hidden></div>
            <div id="remedyOpen"><span id="remedyOpenName"></span><button class="btn btn--icon" type="button" id="remedyClose" data-action="close-preset" aria-label="Bỏ đơn đang mở" title="Bỏ đơn đang mở"><svg class="ico" aria-hidden="true"><use href="#i-x"/></svg></button></div>
          </div>
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
              <tbody id="remedyBody" class="pend"></tbody>
              <tfoot id="remedyNoteFoot" hidden><tr><td></td><td class="b">1 thang</td><td class="num b txt-brand" id="remedyNoteTotal">0 g</td><td></td></tr></tfoot>
            </table>
          </div>
          <div class="foot" id="remedyNotePager" hidden></div>
          <div class="note__foot">
            <div class="note__row">
              <span class="inline-row">
                <input class="inp inp--sm inp--num w-70" id="remedyThang" type="number" step="1" min="1" max="10000" inputmode="numeric" value="1" aria-label="Số thang">
                <span class="note__lbl" aria-hidden="true">thang ×</span>
                <input class="inp inp--sm inp--num w-120" id="remedyUnitPrice" type="number" step="any" min="0" max="1000000000" inputmode="decimal" placeholder="0" aria-label="Giá 1 thang" title="Giá 1 thang">
              </span>
              <span class="b txt-brand note__eq" aria-hidden="true">=</span>
              <span class="b txt-brand num" id="remedyTotal" aria-live="polite">0</span>
            </div>
            <input class="inp inp--sm note__name" id="remedyName" type="text" autocomplete="off" placeholder="Tên đơn mới" aria-label="Tên đơn mới" maxlength="200" hidden>
            <div class="note__row note__row--btns">
              <button class="btn btn--sm btn--danger" type="button" data-action="del-preset" id="remedyDelPreset" hidden>
                <svg class="ico" aria-hidden="true"><use href="#i-trash"/></svg>Xóa đơn
              </button>
              <button class="btn btn--sm" type="button" data-action="save-preset" id="remedySavePreset">
                <svg class="ico" aria-hidden="true"><use href="#i-save"/></svg><span id="remedySaveLabel">Lưu đơn</span>
              </button>
              <button class="btn btn--primary" type="button" data-action="save-remedy" data-keep-focus>
                <svg class="ico" aria-hidden="true"><use href="#i-cash"/></svg>Bán đơn
              </button>
            </div>
          </div>
        </div>
        <div class="note" id="remedyPresetBox">
          <div class="note__head"><span>Đơn đã lưu</span></div>
          <div class="rp-rows" id="remedyPresetRows"></div>
          <div class="foot" id="remedyPresetPager"></div>
        </div>
      </div>
    </details>
  </div>
  <details class="card mt-18" id="nhapBox">
    <summary class="card__head sr-summary">
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
            <tbody id="nhapPendingBody" class="pend"><tr class="is-row">
              <td class="c-num num muted"></td>
              <td><span id="nhapPendName" class="nhap-pend__name is-muted">Chọn vị thuốc ở ô trên</span> <span class="note__tot nhap-pend__tot">Giá nhập <b class="txt-blue num" id="nhapTotal">0</b></span><p class="hint nhap-hint" id="nhapHint" hidden></p></td>
              <td class="c-qty" data-label="SL (kg)"><input class="inp inp--sm inp--num" id="nhapQty" type="number" step="any" min="0" max="1000000" inputmode="decimal" placeholder="0" aria-label="Số lượng (kg)"></td>
              <td class="c-money" data-label="Giá nhập (k/kg)"><input class="inp inp--sm inp--num" id="nhapPrice" type="number" step="any" min="0" max="1000000000" inputmode="decimal" placeholder="0" aria-label="Giá nhập (k/kg)"></td>
              <td class="c-del"><button type="button" class="btn btn--primary nhap-add" data-action="nhap-add" data-keep-focus aria-label="Thêm vào tờ ghi" title="Thêm vào tờ ghi"><svg class="ico" aria-hidden="true"><use href="#i-plus"/></svg></button></td>
            </tr></tbody>
            <tfoot id="nhapListFoot" hidden><tr><td></td><td class="b">Tổng</td><td></td><td class="num b r txt-blue" id="nhapListTotal">0</td><td></td></tr></tfoot>
          </table>
        </div>
        <div class="foot" id="nhapListPager" hidden></div>
        <div class="note__foot">
          <span class="nhap-foot__tot">Tổng tiền nhập (nghìn): <b id="nhapFootTot">0</b></span>
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
      <div class="card__body" tabindex="-1">
        <div class="thk"><div class="thk__h"><h3 class="thk__t">Thống kê (nghìn đồng)</h3><div class="thk__r"><div class="thk__m" role="group" aria-label="Xem theo"><button type="button" id="chartModeY" aria-pressed="false">Năm</button><button type="button" id="chartModeM" aria-pressed="false">Tháng</button><button type="button" id="chartModeD" class="on" aria-pressed="true">Ngày</button></div><div class="thk__y"><button type="button" class="btn btn--icon" id="chartPrev" aria-label="Năm trước">‹</button><span id="chartYrK">Tháng</span><b id="chartYrL" aria-live="polite"></b><button type="button" class="btn btn--icon" id="chartNext" aria-label="Năm sau" disabled>›</button></div></div></div></div>
        <canvas class="chart" id="statsChart" role="img" aria-label="Biểu đồ cột so sánh tổng nhập và tổng bán theo từng tháng"></canvas>
        <div class="chart-tip" id="chartTip" aria-live="polite">
          <span class="chart-tip__m" id="chartMonth" aria-hidden="true">--/----</span>
          <span class="chart-chip chart-chip--imp" id="chartImpChip" aria-hidden="true"><i class="chart-chip__sw"></i><span class="chart-chip__k">Nhập</span><b class="chart-chip__v" id="chartImpVal">0</b></span>
          <span class="chart-chip chart-chip--exp" id="chartExpChip" aria-hidden="true"><i class="chart-chip__sw"></i><span class="chart-chip__k">Bán</span><b class="chart-chip__v" id="chartExpVal">0</b></span>
          <span class="chart-chip chart-chip--prf" id="chartPrfChip" aria-hidden="true"><i class="chart-chip__sw"></i><span class="chart-chip__k">Lợi nhuận</span><b class="chart-chip__v" id="chartPrfVal">0</b></span>
          <span class="chart-chip chart-chip--stk" id="chartStkChip" aria-hidden="true"><i class="chart-chip__sw"></i><span class="chart-chip__k">Tổng tồn kho</span><b class="chart-chip__v" id="chartStkVal">0g</b></span>
          <span class="sr" id="chartTipSr"></span>
        </div>
      </div>
    </details>

    <details class="card" id="invBox">
      <summary class="card__head sr-summary">
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
          <button class="btn btn--sm inv-chip" id="invLowBtn" type="button" data-action="inv-low" aria-pressed="false" aria-label="Gần hết" title="Gần hết (còn từ 0 đến 1 kg)"><svg class="ico" aria-hidden="true"><use href="#i-warn"/></svg><span class="inv-chip__l">Gần hết</span><span class="inv-chip__n" id="invLowN">0</span></button>
          <button class="btn btn--sm inv-chip" id="invOutBtn" type="button" data-action="inv-out" aria-pressed="false" aria-label="Hết hàng" title="Hết hàng (tồn 0 hoặc âm)"><svg class="ico" aria-hidden="true"><use href="#i-ban"/></svg><span class="inv-chip__l">Hết hàng</span><span class="inv-chip__n" id="invOutN">0</span></button>
          <button class="btn btn--sm card__bar-btn" id="invRecBtn" type="button" data-action="reconcile" aria-label="Đối chiếu tồn kho" title="Đối chiếu tồn kho">
            <svg class="ico" aria-hidden="true"><use href="#i-swap"/></svg><span class="inv-dot" id="invRecN" hidden></span>
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
        <svg class="ico txt-blue" aria-hidden="true"><use href="#i-inbox"/></svg>
        <h2 class="card__title">Lịch sử nhập hàng</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-blue" aria-hidden="true"><use href="#i-inbox"/></svg>Lịch sử nhập</span>
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
        <svg class="ico txt-green" aria-hidden="true"><use href="#i-outbox"/></svg>
        <h2 class="card__title">Lịch sử bán hàng</h2>
      </summary>
      <div class="card__body">
        <div class="card__bar">
          <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-green" aria-hidden="true"><use href="#i-outbox"/></svg>Lịch sử bán</span>
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
      <svg class="ico txt-brand" aria-hidden="true"><use href="#i-drive"/></svg>
      <h2 class="card__title">Sao lưu &amp; khôi phục</h2>
    </summary>
    <div class="card__bar">
      <span class="card__bar-title" aria-hidden="true"><svg class="ico txt-brand" aria-hidden="true"><use href="#i-drive"/></svg>Sao lưu &amp; khôi phục</span>
      <span class="hint card__bar-count" id="backupHint">Chưa sao lưu</span>
    </div>
    <div class="card__body">
      <section class="bak-sec">
        <h3 class="bak-sec__t">File sao lưu trên máy này</h3>
        <div class="bak-dir" hidden>
          <svg class="ico" aria-hidden="true"><use href="#i-folder"/></svg><span class="bak-dir__p">Thư mục sao lưu: data\luu-tru</span>
          <button class="btn" type="button" data-action="open-backup-dir" hidden>Mở thư mục</button>
        </div>
        <p class="hint" id="backupLast">Chưa có bản sao lưu nào.</p>
        <div class="bak-actions mt-10">
          <button class="btn btn--primary" type="button" data-action="backup-now">
            <svg class="ico" aria-hidden="true"><use href="#i-save"/></svg>Sao lưu ngay
          </button>
          <button class="btn bak-restore" type="button" data-action="restore-file">
            <svg class="ico" aria-hidden="true"><use href="#i-cloud-down"/></svg>Khôi phục từ file…
          </button>
          <input type="file" id="restoreInput" accept=".json,application/json" hidden>
          <span class="hint">Khôi phục thay thế toàn bộ dữ liệu, kể cả trên máy chủ.</span>
        </div>
        <label class="chk mt-10" for="autoBackup">
          <input type="checkbox" id="autoBackup" checked>
          <span>Tự sao lưu mỗi ngày khi mở trang</span>
        </label>
      </section>
      <section class="bak-sec">
        <div class="bak-sec__bar">
          <h3 class="bak-sec__t">Bản sao lưu trên máy chủ</h3>
          <button class="btn btn--icon" type="button" id="bakRefresh" data-action="bak-refresh" aria-label="Làm mới danh sách" title="Làm mới"><svg class="ico" aria-hidden="true"><use href="#i-refresh"/></svg></button>
        </div>
        <div id="bakList" role="list"><p class="hint bak-empty" role="none">Đang tải…</p></div><p class="sr" id="bakStat" role="status"></p>
        <div class="bak-pg" id="bakPager"></div>
        <p class="hint bak-note">Chỉ xem. Khôi phục: dừng máy chủ, chép đè data/app.db, xóa app.db-wal và app.db-shm nếu có, rồi khởi động lại (xem README).</p>
      </section>
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
/* Cùng luật với isNonNegNumber ở server.js: chỉ nhận number hữu hạn hoặc chuỗi số thập phân; loại boolean, '', ' ', null, mảng, '0x10'. */
function isNumLike(v){ return typeof v === 'number' ? isFinite(v) : (typeof v === 'string' && /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(v.trim())); }
function inRange(v, min, max){ if (!isNumLike(v)) return false; var n = Number(v); return n >= min && n <= max; }

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
        /* v là ĐỒNG (đã qua kToDong); MONEY_MAX là đồng; chỉ thông báo đổi sang nghìn đồng để hiển thị. */
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
  return '(' + (isDesk() ? fmtQty(kg) : fmtQty(kg).replace(' lạng', ' l')) + ')'; /* 2.26.0: desktop viết đủ "lạng" */
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
      var maxW = isDesk() ? 58 : Math.max(0, (host.offsetWidth || cw) - QTY_LABEL_W - 6); /* 2.20.7 desktop: ô gợi ý riêng bên trái ô số, chữ tối đa 58px */
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
  var s = String(id || ''), v;
  var m = s.match(/_(\d{13})(?:_|$)/) || s.match(/(\d{13})$/);
  if (m) { v = Number(m[1]); if (v >= 1735689600000 && v < 2051222400000) return v; }
  m = s.match(/^[A-Za-z]+_([0-9a-z]{8})[0-9a-z]*$/);
  if (m) { v = parseInt(m[1], 36); if (v >= 1735689600000 && v < 2051222400000 && v <= Date.now() + 86400000) return v; }
  return 0;
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
  var m = {}, stamps = {}, dates = {};
  db.transactions.forEach(function(t){
    if (t.type !== 'NHAP' || !(num(t.price) > 0)) return;
    var pid = String(t.productId);
    var s = txStamp(t), d = String(t.date);
    if (!(pid in m) || d > dates[pid] || (d === dates[pid] && s >= stamps[pid])) { m[pid] = num(t.price); stamps[pid] = s; dates[pid] = d; }
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
/* 2.20.0: chỉ html.desktop: tờ ghi luôn đủ PAGE_SIZE hàng (hàng trống có đường kẻ) và thanh phân trang luôn hiện; nhập hàng cũng phân trang. */
function isDesk(){ return !!(doc.documentElement && doc.documentElement.classList && doc.documentElement.classList.contains('desktop')); }
function blankRow(tb){
  var tr = el('tr', 'note__blank'), td = el('td', '', ' ');
  td.colSpan = (tb.parentNode && tb.parentNode.querySelectorAll ? tb.parentNode.querySelectorAll('thead th').length : 0) || 1;
  tr.appendChild(td);
  return tr;
}
var db = { products: [], transactions: [], prescriptions: [], updatedAt: 0, moneyUnit: 'dong' };
var invPage = 1, impPage = 1, expPage = 1;
var LOW_STOCK_KG = 1, STOCK_EPS = 1e-9, invFilter = ''; /* 2.32.0: Kho tồn lọc 'low' (0 < tồn ≤ 1 kg) / 'out' (tồn ≤ 0, dung sai 1e-9) */
function stockKind(s){ s = num(s); return s <= STOCK_EPS ? 'out' : (s <= LOW_STOCK_KG ? 'low' : ''); }
var cloudBase = 0;
var dirty = false;
var syncErrorShown = false;
var syncDetail = '';
var lastSyncOk = 0, syncNet = false; /* 2.25.0: mốc đồng bộ thành công gần nhất; lỗi hiện tại là mất mạng */
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
      var nameKey = name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
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
      if (oid) tx.oid = oid;
      if (oname && oname !== oid) tx.oname = oname;
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
  renderSyncLine();
}
/* 2.25.0: dòng trạng thái ở thanh bên desktop (#syncLine): chấm xanh khi ổn, đỏ khi lỗi. Chỉ đọc cờ có sẵn. */
function renderSyncLine(){
  var el = $('#syncLine');
  if (!el) return;
  var stale = !!(dirty && dirtySince && Date.now() - dirtySince >= DIRTY_BADGE_MS);  /* cùng điều kiện huy hiệu */
  var bad = authLost || syncErrorShown || stale, d = new Date(lastSyncOk);
  el.setAttribute('data-st', bad ? 'err' : 'ok');
  el.textContent = authLost ? 'Chưa lưu được' : syncErrorShown ? (syncNet ? 'Mất kết nối — đang thử lại…' : 'Chưa lưu được') :
    stale ? 'Chưa đồng bộ' : lastSyncOk ? 'Đã đồng bộ ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) : 'Đang kết nối…';
}
function scheduleSyncRetry(){
  if (syncRetryTimer || conflictOpen || syncRejected) return;
  var wait = syncRetryDelay;
  syncRetryTimer = setTimeout(function(){
    syncRetryTimer = null;
    if ((dirty || syncErrorShown) && !syncRejected && !conflictOpen && !pushing) {
      if (busyEditing()) scheduleSyncRetry();
      else { syncRetryDelay = Math.min(syncRetryDelay * 2, SYNC_RETRY_MAX); pushState(false); }
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
function noteSyncFailure(detail, retry, net){
  syncErrorShown = true;
  syncNet = !!net;
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
  if (b) b.hidden = isDesk() || !isStandaloneMode(); /* 2.28.0: desktop tải lại bằng logo */
}
/* 2.27.0: phép kiểm nháp của Tải lại (cờ chưa gửi + đơn nháp trong bộ nhớ); không đăng xuất, không xóa cookie. 2.28.0: Thoát đã bỏ (Tauri đóng bằng nút hệ điều hành). */
function draftOk(verb){
  var pending = dirty || (retailItems && retailItems.length) || (remedyItems && remedyItems.length) || (nhapList && nhapList.length);
  return !pending || confirm('Còn đơn nháp chưa lưu. ' + verb + ' sẽ mất đơn nháp chưa lưu. Vẫn ' + verb.toLowerCase() + '?');
}
function reloadAppClick(){
  if (!draftOk('Tải lại')) return false;
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
  var keyOk = false;
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
    keyOk = true;
  } catch (e) {
    var quota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
    if (quota && !quotaWarned) {
      quotaWarned = true;
      quotaNote = 'Bộ nhớ trình duyệt đầy — bản nháp trên máy này có thể không giữ được.';
      renderSyncBadge();
    }
  }
  /* KEY lỗi: giữ base cũ (khớp KEY cũ), chỉ ghi cờ dirty khi đang dirty. */
  if (keyOk || dirty) {
    try { localStorage.setItem(DIRTY_KEY, dirty ? '1' : '0'); } catch (e2) {}
  }
  if (keyOk) {
    try { localStorage.setItem(BASE_KEY, String(cloudBase || 0)); } catch (e3) {}
  }
  if (keyOk && quotaNote) { quotaNote = ''; quotaWarned = false; renderSyncBadge(); }
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

/* N4 (2.13.0): bấm "Quản Lý Kho": chỉ thiết bị chủ (fetch /auth/devices = 200) mới vào Thiết bị; còn lại rung icon và báo chỉ-đọc. Không đổi server. */
var brandBusy = false;
function denyDevices(){
  var yin = $('#brandLogo');
  if (yin) { yin.classList.remove('is-shake'); void yin.offsetWidth; yin.classList.add('is-shake'); }
  var note = $('#brandNote');
  if (note) note.textContent = 'Chỉ thiết bị chủ quản lý được thiết bị.';
  toast('Chỉ thiết bị chủ quản lý được thiết bị.', 'error'); /* 2.27.0 */
}
function devicesOwner(){
  return Promise.resolve().then(function(){
    return fetch('/auth/devices', { credentials: 'same-origin', redirect: 'manual', headers: { Accept: 'text/html' } });
  }).then(function(r){ return !!(r && r.status === 200); }, function(){ return false; });
}
/* 2.28.0: desktop không còn dùng brand-devices (bấm logo = Tải lại); chỉ điện thoại còn vào Thiết bị bằng chữ "Quản Lý Kho". */
function brandDevicesClick(){
  if (brandBusy) return Promise.resolve();
  brandBusy = true;
  return devicesOwner().then(function(ok){
    if (ok) location.href = '/auth/devices';
    else denyDevices();
  }).then(function(){ brandBusy = false; });
}
/* 2.28.0 desktop: viên Sao lưu | Thiết bị trong tab Sao lưu khôi phục; Thiết bị: chủ → nút mở /auth/devices; thiết bị khác → lời báo. */
var devSeq = 0;
function bakView(v){
  var bx = $('#backupBox');
  if (!bx || !$('.bakseg')) return Promise.resolve();
  var seq = ++devSeq, m = $('#devMsg'), o = $('#devOpen');
  $$('.bak-sec', bx).forEach(function(s){ s.hidden = (s.id === 'devSec') !== (v === 'dev'); });
  $$('.bakseg .btn', bx).forEach(function(b){ if (b.getAttribute('data-view') === v) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  if (v !== 'dev') return Promise.resolve();
  if (o) o.hidden = true;
  if (m) m.textContent = 'Đang kiểm tra…';
  return devicesOwner().then(function(ok){
    if (seq !== devSeq) return;
    if (m) m.textContent = ok ? 'Thiết bị này là thiết bị chủ. Danh sách thiết bị, tạo mã mời, thu hồi và đăng xuất thiết bị nằm ở trang quản lý thiết bị (có liên kết "Về kho" để quay lại).' : 'Chỉ thiết bị chủ mới quản lý được thiết bị khác.';
    if (o) o.hidden = !ok;
  });
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
  if ((tb.id === 'remedyBody' || tb.id === 'retailBody') && isDesk()) { /* 2.26.1/2.29.0 desktop: dòng đang gõ trống vẫn đủ ô: "+", chữ mờ, ô Gram/SL (+ ô Tiền ở Bán lẻ) và nút + vô hiệu (chỉ để thấy chỗ) */
    var rt = tb.id === 'retailBody', qd = el('input', 'inp inp--sm inp--num'), bd = el('button', 'btn btn--icon btn--primary');
    qd.disabled = bd.disabled = true; qd.placeholder = rt ? 'SL' : 'Gram'; qd.setAttribute('aria-label', rt ? 'Số lượng (kg)' : 'Số lượng (gram)'); bd.setAttribute('aria-label', 'Thêm vào tờ ghi'); bd.appendChild(svg('plus'));
    tr.appendChild(el('td', 'c-num muted')); tr.appendChild(td);
    var tq = el('td', 'c-qty'), tdl = el('td', 'c-del');
    tq.appendChild(qd); tdl.appendChild(bd); tr.appendChild(tq);
    if (rt) { var tm = el('td', 'c-money'), md = el('input', 'inp inp--sm inp--num'); md.disabled = true; md.placeholder = 'Tiền (nghìn)'; md.setAttribute('aria-label', 'Giá bán'); tm.appendChild(md); tr.appendChild(tm); }
    tr.appendChild(tdl);
    tb.appendChild(tr);
    return;
  }
  td.colSpan = cols;
  tr.appendChild(td);
  tb.appendChild(tr);
}
/* 2.26.0/2.29.0 desktop: dòng đang gõ (tbody pendSel, cùng bảng) là dòng thứ n+1 của tờ ghi: đủ PAGE_SIZE dòng thì sang trang mới; sau nó mới tới dòng trống (fillSel). Điện thoại: fill = null, số trang như cũ. */
function pendPaging(pendSel, fillSel, n, page, cols){
  var pb = $(pendSel), fill = isDesk() && pb ? $(fillSel) : null;
  var pages = Math.max(1, Math.ceil((n + (fill ? 1 : 0)) / PAGE_SIZE));
  page = Math.max(1, Math.min(page, pages));
  var here = !!fill && Math.floor(n / PAGE_SIZE) + 1 === page;
  if (fill) { fill.textContent = ''; orderEmpty(pb, cols, ''); pb.hidden = !here; }
  return { fill: fill, pages: pages, page: page, here: here };
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
    if (qi) focusNS(qi);
    return false;
  }
  if (g <= 0) {
    var p = findProduct(row.getAttribute('data-pid'));
    toast('Dòng "' + (p ? p.name : '?') + '" thiếu gram', 'error');
    qi = $('.remedy-qty', row);
    if (qi) focusNS(qi);
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
/* 2.15.9: focus lập trình trong luồng nhập KHÔNG để iOS tự cuộn trang (preventScroll); trình duyệt cũ thì focus thường. */
function focusNS(e){
  if (!e) return;
  try { e.focus({ preventScroll: true }); } catch (x) { e.focus(); }
}
function refocusSearch(sel, key){
  var s = $(sel);
  if (!s) return;
  focusNS(s);
  closeSuggest(key);
  updateFootBars();
  compactSync(true); /* 2.15.6/2.15.8: thêm dòng -> đo lại 2 dòng cuối, cuộn mượt xuống cuối (guồng); 2.15.9: không định vị lại trang */
}
function addRemedyToNote(){
  var row = $('#remedyBody tr[data-pid]');
  if (!row) return;
  var qi = $('.remedy-qty', row);
  if (num(qi.value) <= 0) { toast('Nhập số gram lớn hơn 0', 'error'); focusNS(qi); return; }
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
  /* 2.26.0 desktop: dòng đang gõ (#remedyBody, cùng bảng) là dòng thứ n+1: đủ 10 dòng thì sang trang mới; sau nó mới tới dòng trống (#remedyFill). */
  var pp = pendPaging('#remedyBody', '#remedyFill', remedyItems.length, remedyNotePage, 4), fill = pp.fill, pages = pp.pages, pendHere = pp.here;
  remedyNotePage = pp.page;
  var sum = 0;
  remedyItems.forEach(function(it){ sum += num(it.grams); });
  tb.textContent = '';
  for (var k = 0; k < PAGE_SIZE; k++) {
    var i = (remedyNotePage - 1) * PAGE_SIZE + k;
    var it = remedyItems[i];
    var tr = el('tr');
    /* 2.14.0: không vẽ dòng trống của tờ ghi, chỉ dòng thật (desktop 2.20.0: có hàng trống đủ PAGE_SIZE). */
    if (!it) { if (isDesk() && !(pendHere && i === remedyItems.length)) (fill || tb).appendChild(blankRow(tb)); continue; }
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
  var tf = $('#remedyNoteFoot');
  if (tf) tf.hidden = !remedyItems.length;
  var pg = $('#remedyNotePg');
  if (pg) pg.textContent = 'Trang ' + remedyNotePage + ' / ' + pages;
  var host = $('#remedyNotePager');
  if (host) {
    host.hidden = pages <= 1 && !isDesk();
    if (!host.hidden) renderPager(host, remedyNotePage, pages, 'rnote', isDesk());
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
  qi.type = 'number'; qi.step = 'any'; qi.min = '0'; qi.inputMode = 'decimal'; qi.placeholder = isDesk() ? (isRetail ? 'SL' : 'Gram') : '0';
  qi.max = isRetail ? '1000000' : '1000000000';
  qi.setAttribute('aria-label', isRetail ? 'Số lượng (kg)' : 'Số lượng (gram)');
  tdQ.appendChild(qi);
  attachQtyHint(qi, isRetail ? 'kg' : 'g');
  tr.appendChild(tdQ);

  if (isRetail) {
    var tdM = el('td', 'c-money');
    tdM.setAttribute('data-label', 'Giá bán');
    var mi = el('input', 'inp inp--sm inp--num retail-money');
    mi.type = 'number'; mi.step = 'any'; mi.min = '0'; mi.inputMode = 'decimal'; mi.placeholder = isDesk() ? 'Tiền (nghìn)' : '0';
    mi.max = '1000000000';
    mi.setAttribute('aria-label', 'Giá bán');
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
  nhapList = []; nhapNotePage = 1;
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
  var pp = pendPaging('#retailBody', '#retailFill', retailItems.length, notePage, 5), fill = pp.fill, pages = pp.pages, pendHere = pp.here;
  notePage = pp.page;
  var sum = 0;
  retailItems.forEach(function(it){ sum += num(it.amount); });
  tb.textContent = '';
  for (var k = 0; k < PAGE_SIZE; k++) {
    var i = (notePage - 1) * PAGE_SIZE + k;
    var it = retailItems[i];
    var tr = el('tr');
    /* 2.14.0 (giai đoạn 1): không vẽ dòng trống của tờ ghi, chỉ dòng thật (desktop 2.20.0: có hàng trống đủ PAGE_SIZE; 2.29.0: dòng đang gõ chiếm một hàng). */
    if (!it) { if (isDesk() && !(pendHere && i === retailItems.length)) (fill || tb).appendChild(blankRow(tb)); continue; }
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
      mi.setAttribute('aria-label', 'Giá bán');
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
  var tf = $('#retailNoteFoot');
  if (tf) tf.hidden = !retailItems.length;
  var pg = $('#retailNotePg');
  if (pg) pg.textContent = 'Trang ' + notePage + ' / ' + pages;
  var host = $('#retailNotePager');
  if (host) {
    host.hidden = pages <= 1 && !isDesk();
    if (!host.hidden) renderPager(host, notePage, pages, 'note', isDesk());
  }
}
/* Cảnh báo (cho phép tiếp tục) khi giá bán/kg <= giá nhập gần nhất; không có giá nhập thì bỏ qua. */
function confirmBelowImport(pid, q, m){
  var l = lastImport(pid);
  if (!l || !(q > 0) || kToDong(m) / q > l.price) return true;
  var p = findProduct(pid);
  return confirm('Giá bán "' + (p ? p.name : '?') + '" không cao hơn giá nhập gần nhất (' + fmtNum(l.price / DONG_PER_K) + ' nghìn đồng/kg). Vẫn lưu?');
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
    if (bad) focusNS(bad);
    return false;
  }
  if (q <= 0) {
    var p = findProduct(row.getAttribute('data-pid'));
    toast('Dòng "' + (p ? p.name : '?') + '" thiếu số lượng', 'error');
    var qi = $('.retail-qty', row);
    if (qi) focusNS(qi);
    return false;
  }
  if (!(kToDong(m) > 0)) {
    toast('Nhập thành tiền lớn hơn 0', 'error');
    var mi = $('.retail-money', row);
    if (mi) focusNS(mi);
    return false;
  }
  if (!confirmBelowImport(row.getAttribute('data-pid'), q, m)) return false;
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
  if (num(qi.value) <= 0) { toast('Nhập số lượng lớn hơn 0', 'error'); focusNS(qi); return; }
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
  if (!(kToDong(m) > 0)) { toast('Nhập thành tiền lớn hơn 0', 'error'); focusNS($('#noteEditMoney')); return; }
  var limNs = checkLimits('q', q) || checkLimits('money', kToDong(m));
  if (limNs) { toast(limNs, 'error'); return; }
  if (!confirmBelowImport(it.pid, q, m)) return;
  it.kg = dec(q);
  it.amount = kToDong(m);
  noteEditIdx = -1;
  calcRetail();
}
function calcRetail(){
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
  sortedPresets().forEach(function(r){
    var o = el('option', null, r.name);
    o.value = r.id;
    sel.appendChild(o);
  });
  if (cur && findPreset(cur)) sel.value = cur;
  else sel.value = '';
  updatePresetUI();
}
function sortedPresets(){
  return db.prescriptions.slice().sort(function(a, b){
    return a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' });
  });
}
/* 2.20.9: nửa phải tờ ghi Thuốc chén (chỉ hiện dưới html.desktop): danh sách đơn đã lưu, cùng nguồn với #remedyPreset; bấm dòng = đổi select rồi gọi remedyPresetPick. */
var presetPage = 1;
function renderPresetList(){
  var host = $('#remedyPresetRows');
  if (!host) return;
  var sel = $('#remedyPreset');
  var cur = sel ? sel.value : '';
  var list = sortedPresets();
  var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  if (presetPage > pages) presetPage = pages;
  if (presetPage < 1) presetPage = 1;
  host.textContent = '';
  for (var k = 0; k < PAGE_SIZE; k++) {
    var i = (presetPage - 1) * PAGE_SIZE + k, r = list[i];
    var b = el('button', 'rp-row');
    b.type = 'button';
    if (!r) { b.disabled = true; b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); host.appendChild(b); continue; }
    b.setAttribute('data-action', 'pick-preset');
    b.setAttribute('data-id', r.id);
    if (cur && String(r.id) === String(cur)) b.setAttribute('aria-current', 'true');
    var g = 0;
    (r.items || []).forEach(function(it){ g += num(it.grams); });
    b.appendChild(el('span', 'rp-row__n', String(i + 1)));
    b.appendChild(el('span', 'rp-row__name', r.name));
    b.appendChild(el('span', 'rp-row__g num', g > 0 ? fmtGram(g) : ''));
    host.appendChild(b);
  }
  renderPager($('#remedyPresetPager'), presetPage, pages, 'rpre', true);
}
function pickPresetRow(id){
  var sel = $('#remedyPreset');
  if (!sel || !findPreset(id)) return;
  sel.value = id;
  remedyPresetPick();
  presetFindClose(true);
  if (isDesk()) focusNS($('#remedySearch')); /* 2.26.0: chọn đơn xong trỏ về ô Tìm vị thuốc */
}
/* 2.26.0 desktop: ô "Tìm đơn đã lưu" (#remedyFind): khớp trọn từ/cụm từ như tìm vị thuốc (wholeWordMatch), thả xuống tối đa 5 dòng. */
var findIdx = -1;
function presetFindOpen(){
  var inp = $('#remedyFind'), list = $('#remedyFindList');
  if (!inp || !list) return;
  var q = String(inp.value || '').trim();
  var arr = q ? sortedPresets().filter(function(r){ return wholeWordMatch(r.name, q); }) : [];
  list.textContent = '';
  findIdx = -1;
  arr.forEach(function(r){
    var g = 0;
    (r.items || []).forEach(function(it){ g += num(it.grams); });
    var b = el('button', 'sug__item');
    b.type = 'button';
    b.setAttribute('role', 'option');
    b.setAttribute('aria-selected', 'false');
    b.setAttribute('data-id', r.id);
    b.appendChild(el('span', 'sug__name', r.name));
    b.appendChild(el('span', 'sug__meta num', g > 0 ? fmtGram(g) : ''));
    b.addEventListener('mousedown', function(e){ e.preventDefault(); pickPresetRow(r.id); });
    list.appendChild(b);
  });
  list.hidden = !arr.length;
  inp.setAttribute('aria-expanded', arr.length ? 'true' : 'false');
}
function presetFindClose(clear){
  var inp = $('#remedyFind'), list = $('#remedyFindList');
  if (list) list.hidden = true;
  if (inp) { inp.setAttribute('aria-expanded', 'false'); if (clear) inp.value = ''; }
  findIdx = -1;
}
function presetFindKey(e){
  var list = $('#remedyFindList');
  if (!list) return;
  var items = $$('.sug__item', list);
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    if (list.hidden) { presetFindOpen(); items = $$('.sug__item', list); }
    if (!items.length) return;
    findIdx = (findIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items.forEach(function(n, i){ n.setAttribute('aria-selected', i === findIdx ? 'true' : 'false'); });
    sugReveal(list, items[findIdx]);
  } else if (e.key === 'Enter') {
    if (list.hidden || !items.length) return;
    e.preventDefault();
    pickPresetRow(items[findIdx >= 0 ? findIdx : 0].getAttribute('data-id'));
  } else if (e.key === 'Escape') {
    presetFindClose(true);
  }
}
/* 2.26.0: ✕ = bỏ đơn đang mở, tờ ghi về trống (thay mục "Đơn mới"). */
function closePreset(){
  var sel = $('#remedyPreset');
  if (sel) sel.value = '';
  remedyPresetPick();
  focusNS($('#remedySearch'));
}
/* 2.28.0 desktop: nút "Đơn mới" chỉ có một tác dụng, KHÔNG hỏi: tờ ghi mới tinh (bỏ đơn đang mở, dòng đang ghi, ô tìm, thang/giá mặc định), trỏ về Tìm vị thuốc; không xóa đơn đã lưu. */
function hasVal(s){ var e = $(s); return !!(e && e.value); }
function newRemedy(){
  presetPage = 1;
  resetRemedy();
  presetFindClose(true);
  focusNS($('#remedySearch'));
}
/* 2.26.1 desktop: nút "Xóa hết" Bán lẻ/Nhập hàng: có dòng nháp hoặc chữ đang gõ thì hỏi, rồi xóa nháp (giữ ngày đang chọn) và trỏ về ô tìm vị; không có gì thì không làm gì. */
function clearDraft(kind){
  var r = kind === 'retail', n = r ? retailItems.length : nhapList.length;
  if (!n && !(r ? $('#retailBody tr[data-pid]') || hasVal('#retailSearch') : hasVal('#nhapSearch') || hasVal('#nhapQty') || hasVal('#nhapPrice'))) return;
  if (!confirm(n ? 'Xóa hết ' + n + ' dòng đang ghi và làm lại từ đầu?' : 'Xóa chữ đang gõ và làm lại từ đầu?')) return;
  if (r) resetRetail(); else { nhapList = []; nhapNotePage = 1; renderNhapList(); resetNhapInputs(); }
  focusNS($(r ? '#retailSearch' : '#nhapSearch'));
}
function updatePresetUI(){
  var sel = $('#remedyPreset');
  var nameInp = $('#remedyName');
  var lbl = $('#remedySaveLabel');
  var del = $('#remedyDelPreset');
  var cur = sel && sel.value ? findPreset(sel.value) : null;
  var name = capWords(nameInp ? nameInp.value : '');
  var target = name ? presetByName(name) : null;
  if (lbl) {
    if (cur) lbl.textContent = 'Sửa đơn';
    else if (name) lbl.textContent = (target ? 'Tên đã dùng (' : 'Lưu đơn (') + name + ')';
    else lbl.textContent = 'Lưu đơn';
  }
  if (del) del.hidden = !cur && !isDesk(); /* 2.28.0: desktop luôn hiện Xóa đơn */
  var fb = $('#remedyFindBox'), fn = $('#remedyOpenName');
  if (fb && fb.classList) fb.classList.toggle('is-open', !!cur); /* 2.26.0 desktop: đang mở đơn thì ô phải hiện tên đơn + ✕ */
  if (fn) fn.textContent = cur ? cur.name : '';
  renderPresetList();
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
/* 2.15.17: chọn "Đơn mới" hoặc đơn đã lưu đều ẩn ô tên (không đổi tên đơn có sẵn); đơn mới: "Lưu đơn" tự mở ô tên. */
function remedyPresetPick(){
  onPresetChange();
  remedyNameShow(false);
}
function remedyNameShow(show){
  var n = $('#remedyName');
  if (n) n.hidden = !show;
}
/* 2.14.0: chưa có tên và chưa chọn đơn thì chỉ mở ô tên (không đổi logic savePreset). */
function remedySavePresetClick(){
  var sel = $('#remedyPreset');
  var n = $('#remedyName');
  if (!(sel && sel.value) && n && !capWords(n.value)) {
    /* 2.15.15: điện thoại: ô tên nằm trong thanh chân fixed, focus làm thanh bị ẩn (foot-off) nên không thấy gì; hỏi tên bằng hộp thoại. */
    if (isDesk() || (window.matchMedia && window.matchMedia('(max-width:640px)').matches)) { /* 2.26.0: desktop cũng hỏi tên bằng hộp thoại (không đặt ô tên ở thanh đầu/chân) */
      var asked = window.prompt(isDesk() ? 'Tên đơn mới' : 'Tên đơn', '');
      if (asked == null || !capWords(asked)) return;
      n.value = asked;
    } else { remedyNameShow(true); n.focus(); return; }
  }
  savePreset();
  remedyNameShow(false);
}
function savePreset(){
  var nameInp = $('#remedyName');
  var sel = $('#remedyPreset');
  var cur = sel && sel.value ? findPreset(sel.value) : null;
  /* 2.15.17: đơn có sẵn không đổi tên được: cập nhật nội dung theo ID, giữ nguyên tên đang lưu. */
  var name = cur ? cur.name : capWords(nameInp ? nameInp.value : '');
  if (!name) {
    /* 2.15.16: điện thoại: focus ô tên làm thanh chân bị ẩn; hỏi tên bằng hộp thoại. */
    if (nameInp && window.matchMedia && window.matchMedia('(max-width:640px)').matches) {
      var askedP = window.prompt('Tên đơn', '');
      if (askedP == null || !capWords(askedP)) return;
      nameInp.value = askedP;
      name = capWords(askedP);
    } else { toast('Nhập tên đơn', 'error'); if (nameInp) nameInp.focus(); return; }
  }
  if (nameInp) nameInp.value = name;
  var items = collectRemedyItems();
  if (!items.length) { toast('Chọn ít nhất 1 vị thuốc và nhập số gram', 'error'); return; }
  var thang = remedyThang();
  var grand = remedyGrand();
  var limPs = checkLimits('name', name) || checkLimits('thang', thang) || checkLimits('money', grand);
  for (var lg = 0; !limPs && lg < items.length; lg++) limPs = checkLimits('grams', items[lg].grams);
  if (limPs) { toast(limPs, 'error'); return; }
  var msg;

  if (!cur) {
    var byName = presetByName(name);
    if (byName) {
      /* Đơn mới nhưng tên trùng (không phân biệt hoa/thường, khoảng trắng): hỏi cập nhật đơn cũ, giữ tên cũ. */
      if (!confirm('Đã có đơn "' + byName.name + '". Sửa đơn này bằng nội dung đang nhập?')) return;
      cur = byName;
    }
  }

  if (cur) {
    cur.items = items;
    cur.total = dec(grand);
    cur.thang = thang;
    cur.updatedAt = Date.now();
    msg = 'Đã cập nhật đơn "' + cur.name + '"';
  } else {
    cur = { id: uid('RX'), name: name, items: items, total: dec(grand), thang: thang, updatedAt: Date.now() };
    db.prescriptions.push(cur);
    msg = 'Đã lưu đơn "' + name + '"';
  }
  commit(msg);
  if (sel) sel.value = cur.id;
  renderPresetOptions();
  if (sel) sel.value = cur.id;
  if (nameInp) nameInp.value = cur.name;
  updatePresetUI();
}
function delPreset(){
  var sel = $('#remedyPreset');
  var r = sel && sel.value ? findPreset(sel.value) : null;
  if (!r) { /* 2.28.0: chưa lưu: có dòng đang ghi thì hỏi rồi làm sạch tờ ghi; không có gì thì không làm gì */
    var n = remedyItems.length;
    if (!n || !confirm('Xóa đơn đang ghi (' + n + ' dòng) và ghi lại từ đầu?')) return;
    resetRemedy(); presetFindClose(true); return;
  }
  if (!confirm('Xóa đơn "' + r.name + '"? Các giao dịch đã bán vẫn được giữ lại.')) return;
  presetPage = 1;
  db.prescriptions = db.prescriptions.filter(function(x){ return String(x.id) !== String(r.id); });
  resetRemedy();
  commit('Đã xóa đơn "' + r.name + '"');
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
    if (!(items[k].amount > 0)) { toast('Nhập thành tiền lớn hơn 0', 'error'); return; }
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
    var rlim = checkLimits('money', money(items[rk].amount / items[rk].kg));
    if (rlim) { toast('Đơn giá vượt giới hạn (' + fmtNum(MONEY_MAX / DONG_PER_K) + ' nghìn đồng/kg)', 'error'); return; }
  }
  items.forEach(function(it){
    var p = findProduct(it.pid);
    p.stock = dec(p.stock - it.kg);
    var tx = {
      id: uid('TX'), date: date, type: 'BAN', productId: it.pid,
      qty: dec(it.kg), price: money(it.amount / it.kg),
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
      rx: true, g: dec(it.g), thang: thang, unitPrice: money(grand / thang),
      ts: ts
    };
    tx.oid = oid; tx.oname = oname;
    db.transactions.push(tx);
  });
  resetRemedy();
  commit('Đã bán đơn thuốc chén');
}

/* ================= THỐNG KÊ ================= */
/* 2.34.0: vốn của một giao dịch BÁN = cost nếu có (kể cả 0), không thì qty x costPrice hiện tại (0 nếu vị đã xóa); dùng chung computeStats và biểu đồ. */
function txCost(t, byId){ return t.cost != null ? num(t.cost) : num(t.qty) * (byId[t.productId] ? num(byId[t.productId].costPrice) : 0); }
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
    var c = txCost(t, byId);
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
  set('chartStkVal', fmtQtyInt(s.stock)); /* 2.34.0: chip Tổng tồn kho (desktop) */
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
function renderPager(host, page, total, kind, always){
  if (!host) return;
  host.textContent = '';
  if (total <= 1 && !always) { host.appendChild(el('span', 'muted small', 'Hiển thị tất cả')); return; }
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
  /* 2.20.0 desktop: thẻ có backdrop-filter làm "khối chứa" của fixed; hiệu chỉnh theo vị trí thật vừa đặt (không đổi gì khi khối chứa là cửa sổ). */
  var q = list.getBoundingClientRect ? list.getBoundingClientRect() : null;
  if (q && q.left !== undefined && (Math.abs(q.left - left) > 0.5 || Math.abs(q.top - top) > 0.5)) {
    list.style.left = (2 * left - q.left) + 'px';
    list.style.top = (2 * top - q.top) + 'px';
  }
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
    ib.addEventListener('click', function(){ closeRowMenu(); });
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
doc.addEventListener('scroll', function(){ closeRowMenu(); }, true);
window.addEventListener('resize', function(){ closeRowMenu(); });
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
  var nk = { low: 0, out: 0 };
  db.products.forEach(function(p){ var k = stockKind(p.stock); if (k) nk[k]++; }); /* 2.32.0: số đếm trên TOÀN kho, không phụ thuộc ô tìm */
  var list = db.products.filter(function(p){ return (!kw || wholeWordMatch(p.name, kw)) && (!invFilter || stockKind(p.stock) === invFilter); }); /* 2.27.0: một luật tìm chung (trọn chữ); 2.32.0: AND với lọc Gần hết/Hết hàng */
  [['low', 'Low', 'Gần hết'], ['out', 'Out', 'Hết hàng']].forEach(function(f){
    var b = $('#inv' + f[1] + 'Btn'), n = $('#inv' + f[1] + 'N');
    if (n) n.textContent = nk[f[0]];
    if (b) { b.classList.toggle('on', invFilter === f[0]); b.setAttribute('aria-pressed', invFilter === f[0] ? 'true' : 'false'); b.setAttribute('aria-label', f[2] + ': ' + nk[f[0]] + ' vị thuốc'); }
  });
  var nr = reconcileList().length, rb = $('#invRecBtn'), rd = $('#invRecN');
  if (rd) { rd.textContent = nr; rd.hidden = !nr; }
  if (rb) { var rt = 'Đối chiếu tồn kho' + (nr ? ' (' + nr + ' lệch)' : ''); rb.title = rt; rb.setAttribute('aria-label', rt); }

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
  if (isDesk()) for (var bk = slice.length; bk < PAGE_SIZE; bk++) tbody.appendChild(blankRow(tbody)); /* 2.31.0: đủ PAGE_SIZE dòng, dòng trống có vạch kẻ */
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
  if (!db.transactions.some(function(x){ return String(x.oid) === String(oid); })) {
    toast('Đơn không còn tồn tại', 'error');
    return;
  }
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
        if (wholeWordMatch(r.name || '', nq)) return true;
        return r.items.some(function(t){ var nm = txName(t); return nm && wholeWordMatch(nm, nq); });
      }
      return r.name && wholeWordMatch(r.name, nq);
    });
  }

  rows.sort(function(a, b){
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (b.ts !== a.ts) return b.ts - a.ts;
    return 0;
  });
  var top = rows.length && rows[0].date ? rows[0] : null;

  return { rows: rows, latestDate: top ? top.date : '', latestTs: top ? top.ts : -Infinity, latestHasTime: top ? top.hasTime : false };
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
  if (isDesk()) for (var bk = slice.length; bk < PAGE_SIZE; bk++) tbody.appendChild(blankRow(tbody));
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
var chartSel = -1, chartHover = -1, chartGeo = null;
/* 2.25.0: desktop luôn là một năm (số), 12 nhóm Y-01..Y-12; mặc định và mỗi lần mở tab = năm hiện tại. Bước năm kẹp 2000..2100; hàm thuần. */
var chartYr = Number(thisYear());
var chartMode = 'D', chartDy = chartYr, chartDm = parseInt(todayISO().slice(5, 7), 10); /* 2.34.0 desktop: 'Y' năm | 'M' tháng | 'D' ngày (mặc định Ngày); chartSel = cột đang GIỮ, chartHover = xem tạm */
function chartYearStep(cur, dir){ return Math.min(2100, Math.max(2000, cur + dir)); }
function chartYearGo(dir){ if (chartMode === 'D') { var s = chartMonthStep(chartDy, chartDm, dir); chartDy = s.y; chartDm = s.m; } else if (chartMode === 'M') chartYr = chartYearStep(chartYr, dir); chartSel = -1; chartHover = -1; renderChart(); }
function chartModeSet(m){
  chartMode = m; chartSel = -1; chartHover = -1;
  [['#chartModeY', 'Y'], ['#chartModeM', 'M'], ['#chartModeD', 'D']].forEach(function(b){ var e = $(b[0]); if (e) { e.classList.toggle('on', b[1] === m); e.setAttribute('aria-pressed', b[1] === m ? 'true' : 'false'); } });
  var k = $('#chartYrK'); if (k) k.textContent = m === 'D' ? 'Tháng' : 'Năm';
  var yb = $('.thk__y'); if (yb) yb.style.display = m === 'Y' ? 'none' : '';
  renderChart();
}
/* 2.34.0 hàm thuần: danh sách năm (từ năm có giao dịch sớm nhất tới nowY), cột mặc định (hôm nay / tháng này / năm nay, -1 nếu kỳ đang xem không chứa), bước phím ←→ (dừng hai đầu). */
function chartYears(txs, nowY){
  var lo = nowY, o = [], y;
  (txs || []).forEach(function(t){ y = parseInt(String(t && t.date || '').slice(0, 4), 10); if (y >= 2000 && y < lo) lo = y; });
  for (y = lo; y <= nowY; y++) o.push(y);
  return o;
}
function chartDefIdx(mode, dy, dm, yr, years, today){
  var ty = parseInt(today.slice(0, 4), 10), tm = parseInt(today.slice(5, 7), 10);
  if (mode === 'D') return dy === ty && dm === tm ? parseInt(today.slice(8, 10), 10) - 1 : -1;
  if (mode === 'M') return yr === ty ? tm - 1 : -1;
  return years.indexOf(ty);
}
function chartKeyStep(cur, def, n, dir){ var c = cur >= 0 ? cur : def; return c < 0 ? (dir > 0 ? 0 : n - 1) : Math.min(n - 1, Math.max(0, c + dir)); }
function chartKey(dir){ var d = chartData(); if (!d.desk) return; chartSel = chartKeyStep(chartSel, d.def, d.n, dir); renderChart(); }
/* 2.24.0: vạch trục Y đẹp (nghìn đồng, số nguyên): bước 1/2/2,5/5 x 10^k, 4-5 vạch tính cả 0. Hàm thuần. */
function chartTicks(maxK){
  var raw = Math.max(1, maxK / 4), e = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / e;
  var step = Math.max(1, [1, 2, 2.5, 5, 10].filter(function(v){ return m <= v && Number.isInteger(Math.round(v * e * 1e6) / 1e6); })[0] * e);
  var n = Math.max(1, Math.ceil(maxK / step - 1e-9)), out = [];
  for (var i = 0; i <= n; i++) out.push(i * step);
  return out;
}
/* 2.33.0: theo NGÀY. Hàm thuần: số ngày của tháng m (1..12) năm y; bước tháng kẹp 01/2000..12/2100; tổng Nhập/Bán từng ngày (cộng dồn). */
function chartDaysIn(y, m){ return m === 2 ? ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28) : (m === 4 || m === 6 || m === 9 || m === 11 ? 30 : 31); }
function chartMonthStep(y, m, dir){ var k = Math.min(2100 * 12 + 11, Math.max(2000 * 12, y * 12 + m - 1 + dir)); return { y: Math.floor(k / 12), m: k % 12 + 1 }; }
function chartBuckets(txs, prods, n, idxOf){
  var byId = {}, a = [], b = [], p = [], i;
  (prods || []).forEach(function(q){ byId[q.id] = q; });
  for (i = 0; i < n; i++) { a.push(0); b.push(0); p.push(0); }
  txs.forEach(function(t){
    var i = idxOf(t.date ? String(t.date).slice(0, 10) : '');
    if (!(i >= 0 && i < n)) return;
    var v = num(t.total);
    if (t.type === 'NHAP') a[i] += v; else { b[i] += v; p[i] += v - txCost(t, byId); } /* lợi nhuận = chỉ BÁN, vốn như computeStats */
  });
  return { impK: a.map(dec), expK: b.map(dec), profK: p.map(dec), n: n };
}
function chartDayTotals(txs, y, m, prods){ var ym = y + '-' + pad2(m); return chartBuckets(txs, prods, chartDaysIn(y, m), function(k){ return k.slice(0, 7) === ym ? parseInt(k.slice(8, 10), 10) - 1 : -1; }); }
function chartData(){
  var txs = db.transactions, yl = chartYears(txs, Number(thisYear())), d, lab = [], i;
  if (chartMode === 'D') d = chartDayTotals(txs, chartDy, chartDm, db.products);
  else if (chartMode === 'M') d = chartBuckets(txs, db.products, 12, function(k){ return parseInt(k.slice(0, 4), 10) === chartYr ? parseInt(k.slice(5, 7), 10) - 1 : -1; });
  else d = chartBuckets(txs, db.products, yl.length, function(k){ return parseInt(k.slice(0, 4), 10) - yl[0]; });
  for (i = 0; i < d.n; i++) lab.push(chartMode === 'Y' ? String(yl[0] + i) : pad2(i + 1));
  d.labels = lab; d.desk = true; d.mode = chartMode; d.def = chartDefIdx(chartMode, chartDy, chartDm, chartYr, yl, todayISO());
  return d;
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

  drawChartDesk(cv, ctx, cssW, cssH, cs, chartData());
}
function setChartTip(mmStr, impV, expV, prfV){
  var impTxt = impV == null ? '—' : fmtMoneyInt(impV), expTxt = expV == null ? '—' : fmtMoneyInt(expV); /* null = chưa trỏ tháng nào (desktop) */
  var mEl = $('#chartMonth'), sEl = $('#chartTipSr');
  if (mEl) mEl.textContent = mmStr;
  /* 2.15.0: chú giải "[ô màu] Nhập số tiền"; số tiền nằm trong phần tử con (chip còn nhãn + ô màu). */
  var iV = $('#chartImpVal'), eV = $('#chartExpVal');
  if (iV) iV.textContent = impTxt;
  if (eV) eV.textContent = expTxt;
  var pV = $('#chartPrfVal');
  var prfTxt = prfV == null ? '—' : fmtMoneyInt(prfV);
  if (pV) { pV.textContent = prfTxt; pV.className = 'chart-chip__v' + (prfV < 0 ? ' txt-red' : ''); }
  if (sEl) sEl.textContent = (chartMode === 'D' ? 'Ngày ' : chartMode === 'Y' ? 'Năm ' : 'Tháng ') + mmStr + ' — Nhập: ' + impTxt + ' · Bán: ' + expTxt + (prfV == null ? '' : ' · Lợi nhuận: ' + prfTxt);
}
/* 2.34.0 desktop: cột đôi Nhập/Bán theo Năm/Tháng/Ngày, chỉ lưới ngang mờ (không nhãn trục Y), nhãn trục X trong viên viền tròn 21px (năm: 40px); mục hiện = rê > giữ > mặc định; hover/bấm → vạch dọc + chú thích (#chartTip). */
function chartYearBw(groupW){ return Math.max(1, Math.min(36, (groupW - 8) / 2)); } /* 2.34.1 hàm thuần: bề rộng mỗi cột trong ô năm (36, thu lại khi nhiều năm để không chồng) */
/* 2.35.0 hàm thuần: bước nhãn trục X khi ô hẹp (điện thoại): nhỏ nhất trong 1/2/3/5 mà bước*groupW >= bề rộng viên nhãn + 4 (năm 44, còn lại 25). */
function chartLabelStep(groupW, mode){ var need = mode === 'Y' ? 44 : 25, k = [1, 2, 3, 5]; for (var i = 0; i < k.length; i++) if (k[i] * groupW >= need) return k[i]; return 5; }
/* 2.35.1 hàm thuần: vị trí x nhãn trục X {chỉ số: x}. Nhãn cuối luôn có, kẹp để vòng nằm trọn canvas (lề 1px); nhãn thưa nào chồng nhãn cuối thì bỏ. */
function chartLabelPlan(n, groupW, cssW, rw, lst){
  var m = {}, i, lx = cssW - rw / 2 - 1;
  for (i = 0; i < n; i++) if (lst <= 1 || (i + 1) % lst === 0) m[i] = groupW * i + groupW / 2;
  m[n - 1] = Math.min(groupW * (n - 1) + groupW / 2, lx);
  for (i = 0; i < n - 1; i++) if (m[i] != null && m[i] > m[n - 1] - rw - 3) delete m[i];
  return m;
}
function drawChartDesk(cv, ctx, cssW, cssH, cs, data){
  var padT = 10, padB = 32, mode = data.mode, n = data.n, i;
  var impC = cs.getPropertyValue('--chart-imp').trim() || '#44DAFE', expC = cs.getPropertyValue('--chart-exp').trim() || '#FFA33D';
  var vmax = 0, yl = $('#chartYrL'), yp = $('#chartPrev'), yn = $('#chartNext');
  if (yl) yl.textContent = mode === 'D' ? pad2(chartDm) + '/' + chartDy : chartYr;
  if (yp) yp.disabled = mode === 'D' ? chartDy * 12 + chartDm <= 24001 : chartYr <= 2000;
  if (yn) yn.disabled = mode === 'D' ? chartDy * 12 + chartDm >= 2100 * 12 + 12 : chartYr >= 2100;
  var tipEl = $('#chartTip'); if (tipEl) tipEl.setAttribute('data-m', mode);
  for (i = 0; i < n; i++) vmax = Math.max(vmax, data.impK[i], data.expK[i]);
  var ticks = chartTicks(vmax / 1000), top = ticks[ticks.length - 1] * 1000;
  var hi = chartHover >= 0 ? chartHover : chartSel >= 0 ? chartSel : data.def;
  var groupW = cssW / n, W = groupW * n; /* 2.34.1: mỗi năm một ô chia đều chiều rộng, cặp cột ở GIỮA ô */
  var H = Math.max(10, cssH - padT - padB), y0 = padT + H;
  var ph = !isDesk(), lst = ph ? chartLabelStep(groupW, mode) : 1;
  var bw = mode === 'Y' ? chartYearBw(groupW) : groupW * (ph ? .38 : .245), gap = mode === 'Y' ? 2 : groupW * (ph ? .08 : .1);
  ticks.forEach(function(v){
    var y = Math.round(y0 - H * v * 1000 / top) + 0.5;
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(cssW, y); ctx.stroke();
  });
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.font = '12px -apple-system,BlinkMacSystemFont,"SF Pro Text","Inter",system-ui,"Segoe UI",sans-serif';
  var rw = mode === 'Y' ? 40 : ph ? 21 : Math.min(21, groupW - 1), rh = 21, ly = y0 + 17, r = rh / 2;
  var lp = chartLabelPlan(n, groupW, cssW, rw, lst);
  for (i = 0; i < n; i++) {
    var cx = groupW * i + groupW / 2, on = i === hi;
    if (on) { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(Math.round(cx), padT, 1, H); }
    ctx.fillStyle = impC; bar(ctx, cx - gap / 2 - bw, y0 - H * data.impK[i] / top, bw, H * data.impK[i] / top, 3);
    ctx.fillStyle = expC; bar(ctx, cx + gap / 2, y0 - H * data.expK[i] / top, bw, H * data.expK[i] / top, 3);
    if (lp[i] == null) continue; /* điện thoại: nhãn thưa (ngày chẵn / mỗi 3,5 ngày), cột vẫn đủ */
    cx = lp[i];
    ctx.beginPath(); ctx.arc(cx - rw / 2 + r, ly, r, Math.PI / 2, Math.PI * 1.5); ctx.arc(cx + rw / 2 - r, ly, r, -Math.PI / 2, Math.PI / 2); ctx.closePath();
    if (on) { ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fill(); }
    ctx.strokeStyle = on ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.25)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = on ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.7)';
    ctx.fillText(data.labels[i], cx, ly);
  }
  chartGeo = { n: n, padL: 0, padT: padT, W: W, H: H, groupW: groupW, y0: y0, cssW: cssW, cssH: cssH, yMax: cssH };
  var none = mode === 'D' ? '--/' + pad2(chartDm) + '/' + chartDy : mode === 'M' ? '--/' + chartYr : '----';
  if (hi < 0) setChartTip(none, null, null, null);
  else setChartTip(mode === 'D' ? pad2(hi + 1) + '/' + pad2(chartDm) + '/' + chartDy : mode === 'M' ? pad2(hi + 1) + '/' + chartYr : data.labels[hi], data.impK[hi], data.expK[hi], data.profK[hi]);
}
/* Chỉ số nhóm tháng (0..11) dưới con trỏ, -1 nếu ngoài vùng vẽ. */
function chartIdxAt(e){
  var cv = $('#statsChart');
  if (!cv || !chartGeo) return -1;
  var r = cv.getBoundingClientRect();
  var g = chartGeo;
  var x = (e.clientX - r.left) * (g.cssW / (r.width || g.cssW));
  var y = (e.clientY - r.top) * (g.cssH / (r.height || g.cssH));
  if (x < g.padL || x > g.padL + g.W || y < g.padT || y > (g.yMax || g.y0 + 14)) return -1;
  var i = Math.floor((x - g.padL) / g.groupW);
  return i < 0 ? 0 : i > (g.n || 12) - 1 ? (g.n || 12) - 1 : i;
}
function onChartClick(e){
  var i = chartIdxAt(e);
  if (i < 0) return;
  chartSel = i; /* bấm/chạm = giữ (cột khác để đổi); desktop và điện thoại như nhau */
  renderChart();
}
function onChartMove(e){
  if (!isDesk()) return;
  var i = e.type === 'mouseleave' ? -1 : chartIdxAt(e);
  if (i === chartHover) return;
  chartHover = i;
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

/* 2.15.9 (mọi thiết bị): gợi ý chỉ khi chữ gõ khớp TRỌN và LIÊN TIẾP một dãy từ của tên (bỏ dấu, đ=d, không phân biệt hoa/thường).
   "cam" -> Cam Thảo; "ca" -> không; "cam thao" -> Cam Thảo; "cam th" -> không. Chữ gõ rỗng -> false. Hàm thuần. */
function wholeWordMatch(name, query){
  var qw = normSearch(query).split(/\s+/).filter(Boolean);
  var nw = normSearch(name).split(/\s+/).filter(Boolean);
  if (!qw.length || qw.length > nw.length) return false;
  for (var i = 0; i + qw.length <= nw.length; i++) {
    var ok = true;
    for (var j = 0; j < qw.length; j++) if (nw[i + j] !== qw[j]) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}
/* 2.27.0: mọi ô tìm tên dùng wholeWordMatch; sugWhole chỉ còn quyết định bố cục khung gợi ý (3 hàng) của Bán lẻ/Thuốc chén/Nhập hàng. */
function sugWhole(key){ return key === 'retail' || key === 'remedy' || key === 'nhap'; }
/* 2.15.9: khung gợi ý cao đúng n mục (đo mục thật) + đệm/viền của khung; <= n mục thì 0 (không giới hạn). Hàm thuần. */
var SUG_ROWS = 3;
function sugListMaxHeight(heights, n, extra){
  var h = (heights || []).filter(function(x){ return x > 0; });
  var k = n > 0 ? n : SUG_ROWS;
  if (h.length <= k) return 0;
  var sum = 0;
  for (var i = 0; i < k; i++) sum += h[i];
  return Math.ceil(sum + (extra > 0 ? extra : 0));
}
/* Cuộn mục vào tầm nhìn BÊN TRONG khung gợi ý (không cuộn bằng API cuộn-vào-khung vì iOS có thể cuộn cả trang). */
function sugReveal(list, item){
  if (!list || !item) return;
  var t = item.offsetTop, b = t + item.offsetHeight;
  if (t < list.scrollTop) list.scrollTop = t;
  else if (b > list.scrollTop + list.clientHeight) list.scrollTop = b - list.clientHeight;
}
function matchProducts(q){
  var nq = normSearch(q);
  var arr = db.products.filter(function(p){ return !nq || wholeWordMatch(p.name, q); });
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
  list.style.maxHeight = '';
  if (sugWhole(key) && !isDesk()) { /* desktop: CSS cố định 3 hàng x 38px */
    var hs = [];
    for (var hi = 0; hi < list.children.length; hi++) hs.push(list.children[hi].getBoundingClientRect().height);
    var mh = sugListMaxHeight(hs, SUG_ROWS, 10); /* đệm 4+4 và viền 1+1 của .sug__list */
    list.style.maxHeight = mh ? mh + 'px' : '';
    list.scrollTop = 0;
  }
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
        if (eq2) { focusNS(eq2); eq2.select(); }
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
        if (eq3) { focusNS(eq3); eq3.select(); }
        var s8 = $('#remedySearch');
        if (s8) s8.value = '';
        closeSuggest(key);
        return;
      }
    }
    if (dup) {
      toast('"' + p.name + '" đã có trong danh sách', 'error');
      var q0 = $(isR ? '.retail-qty' : '.remedy-qty', dup);
      if (q0) { focusNS(q0); if (q0.select) q0.select(); }
      var s0 = $(isR ? '#retailSearch' : '#remedySearch');
      if (s0) s0.value = '';
      closeSuggest(key);
      return;
    }
  }
  if (key === 'retail') {
    if (!commitRetailRow()) return;
    var row = addOrderRow('retail', p.id);
    var s1 = $('#retailSearch');
    if (s1) s1.value = '';
    if (isDesk()) notePage = 1e9; /* 2.29.0: tờ ghi nhảy tới trang chứa dòng đang gõ; vẽ xong mới trỏ vào ô SL */
    calcRetail();
    if (row) focusNS($('.retail-qty', row));
  } else if (key === 'remedy') {
    if (!commitRemedyRow()) return;
    var row2 = addOrderRow('remedy', p.id);
    if (row2) focusNS($('.remedy-qty', row2));
    var s2 = $('#remedySearch');
    if (s2) s2.value = '';
    if (isDesk()) remedyNotePage = 1e9; /* 2.26.0: tờ ghi nhảy tới trang chứa dòng đang gõ (chỉ desktop) */
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
    sugReveal(list, items[sugIdx]);
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
  nhapShowPend();
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
  nhapShowPend();
  var q = $('#nhapQty');
  if (q) q.focus();
}
/* 2.29.0 desktop: tờ ghi nhảy tới trang chứa dòng đang gõ trước khi trỏ vào ô SL (dòng ẩn thì không trỏ được). */
function nhapShowPend(){ if (isDesk()) { nhapNotePage = 1e9; renderNhapList(); } }
function calcNhap(){
  var q = num(($('#nhapQty') || {}).value);
  var p = num(($('#nhapPrice') || {}).value);
  var out = $('#nhapTotal');
  if (out) out.textContent = fmtMoney(kToDong(q * p));
  var pn = $('#nhapPendName');
  if (pn) { var nm = String(($('#nhapSearch') || {}).value || '').trim(); pn.textContent = nm || 'Chọn vị thuốc ở ô trên'; pn.className = nm ? 'nhap-pend__name' : 'nhap-pend__name is-muted'; var hh = $('#nhapHint'); pn.title = hh && !hh.hidden ? hh.textContent : ''; }
}
var nhapList = [];
var nhapNotePage = 1;
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
  var dk = isDesk(), pp = pendPaging('#nhapPendingBody', '#nhapFill', nhapList.length, nhapNotePage, 5), npages = dk ? pp.pages : 1, fill = pp.fill, pendHere = pp.here;
  nhapNotePage = dk ? pp.page : 1;
  if (dk) calcNhap(); /* 2.29.0: chữ mờ của dòng gõ trống */
  nhapList.forEach(function(it, i){
    sum += num(it.qty) * num(it.price);
    if (dk && (i < (nhapNotePage - 1) * PAGE_SIZE || i >= nhapNotePage * PAGE_SIZE)) return;
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
  if (dk) {
    for (var bk = Math.min(PAGE_SIZE, nhapList.length - (nhapNotePage - 1) * PAGE_SIZE) + (pendHere ? 1 : 0); bk < PAGE_SIZE; bk++) (fill || tb).appendChild(blankRow(tb));
    var nh = $('#nhapListPager');
    if (nh) { nh.hidden = false; renderPager(nh, nhapNotePage, npages, 'nnote', true); }
  }
  var tot = $('#nhapListTotal');
  if (tot) tot.textContent = fmtMoney(sum);
  var tf = $('#nhapListFoot');
  if (tf) tf.hidden = !nhapList.length;
  var cnt = $('#nhapListCount');
  if (cnt) cnt.textContent = nhapList.length ? nhapList.length + ' vị' : '';
  var lbl = $('#nhapSaveLabel');
  if (lbl) lbl.textContent = dk ? 'Lưu đơn' : nhapList.length ? 'Lưu nhập hàng (' + nhapList.length + ')' : 'Lưu nhập hàng';
  var ft = $('#nhapFootTot');
  if (ft) ft.textContent = fmtMoney(sum);
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
  nhapNotePage = 1e9;
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
  nhapList = []; nhapNotePage = 1;
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
    if (p) p.stock = dec(num(p.stock) + (t.type === 'NHAP' ? num(t.qty) : -num(t.qty)));
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
  var items = db.transactions.filter(function(x){ return String(x.oid) === String(oid); });
  if (!items.length) return;
  var label = (items[0].oname && items[0].oname !== items[0].oid) ? items[0].oname : (items[0].type === 'NHAP'
    ? 'đơn nhập ngày ' + dateVN(items[0].date)
    : 'đơn');
  /* Kiểm tra trước toàn bộ đơn nhập: không được để tồn âm. */
  var needOut = {};
  for (var i = 0; i < items.length; i++) {
    var t0 = items[i];
    if (t0.type !== 'NHAP') continue;
    var k0 = String(t0.productId);
    needOut[k0] = (needOut[k0] || 0) + num(t0.qty);
  }
  for (var k1 in needOut) {
    var p0 = findProduct(k1);
    if (p0 && num(p0.stock) - needOut[k1] < -1e-9) {
      toast('Không thể xóa: "' + p0.name + '" đã bán, tồn sẽ âm. Hãy sửa/xóa đơn bán liên quan trước.', 'error');
      return;
    }
  }
  if (!confirm('Xóa cả ' + label + '? Tồn kho sẽ được điều chỉnh lại.')) return;
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
  db.transactions = db.transactions.filter(function(x){ return String(x.oid) !== String(oid); });
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
  $('#txEditName').value = p ? p.name : 'Đã xóa';
  var isRx = !!t.rx;
  var lbl = $('#txEditQtyLbl');
  if (lbl) lbl.textContent = isRx ? 'Số gram (mỗi thang)' : 'Số lượng (kg)';
  var priceField = $('#txEditPriceField');
  if (priceField) priceField.hidden = isRx;
  $('#txEditQty').value = String(isRx ? (num(t.g) > 0 ? num(t.g) : dec(num(t.qty) * 1000 / (num(t.thang) > 0 ? num(t.thang) : 1))) : dec(t.qty));
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
    var ep = $(checkLimits('q', q) ? '#txEditQty' : '#txEditPrice'); if (ep) ep.focus();
    return;
  }
  if (t.type === 'BAN' && !isRx) {
    if (!(price > 0)) { toast('Nhập thành tiền lớn hơn 0', 'error'); var epz = $('#txEditPrice'); if (epz) epz.focus(); return; }
    if (!confirmBelowImport(t.productId, 1, $('#txEditPrice').value)) return;
  }

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
      if (p) p.stock = dec(num(p.stock) + (t.type === 'NHAP' ? -delta : delta));
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
  var ac = new AbortController();
  o.signal = ac.signal;
  var tm = setTimeout(function(){ ac.abort(); }, 15000);
  /* Timer chạy tới khi đọc xong thân: json()/text() treo cũng bị ngắt sau 15 giây. */
  return fetch(url, o).then(function(r){
    var j = r && r.json, t = r && r.text;
    if (typeof j !== 'function' && typeof t !== 'function') { clearTimeout(tm); return r; }
    var done = function(v){ clearTimeout(tm); return v; };
    var fail = function(e){ clearTimeout(tm); throw e; };
    if (typeof j === 'function') r.json = function(){ return j.call(r).then(done, fail); };
    if (typeof t === 'function') r.text = function(){ return t.call(r).then(done, fail); };
    return r;
  }, function(e){ clearTimeout(tm); throw e; });
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
var pendingOpSig = '', pendingOpId = '';
function pushState(manual, force){
  if (pushing) return Promise.resolve(false);
  pushing = true;
  touch();
  renderSyncBadge();
  var sent = num(db.updatedAt);
  /* opId theo nội dung (bỏ updatedAt, vì touch() đổi mỗi lần): thử lại cùng snapshot giữ nguyên. */
  var opSig = JSON.stringify(Object.assign({}, db, { updatedAt: 0 }));
  if (opSig !== pendingOpSig) { pendingOpSig = opSig; pendingOpId = uid('OP'); }
  var headers = { 'Content-Type': 'application/json', 'X-Base-Updated': String(cloudBase), 'X-Op-Id': pendingOpId };
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
      pendingOpSig = '';
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
      lastSyncOk = Date.now();
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
      if (rejected) {
        /* 2.15.16: 400/428 máy chủ từ chối đúng dữ liệu này: báo một lần ngay, không chỉ nằm trong huy hiệu. */
        var why = d && d.error ? String(d.error) : 'Máy chủ từ chối lưu';
        if (why.length > 120) why = why.slice(0, 117) + '...';
        toast('Chưa lưu được: ' + why, 'error');
      }
    }
    return ok;
  }).catch(function(e){
    noteSyncFailure(e && e.name === 'AbortError' ? 'Máy chủ không phản hồi sau 15 giây — dữ liệu vẫn giữ trên máy này.' : 'Mất kết nối — dữ liệu vẫn giữ trên máy này.', true, true);
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
      lastSyncOk = Date.now();
      renderSyncLine();
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
    .catch(function(e){ if (manual) toast(e && e.name === 'AbortError' ? 'Máy chủ không phản hồi sau 15 giây' : 'Không tải được dữ liệu', 'error'); return false; });
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
      lastSyncOk = Date.now();
      renderSyncLine();
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
    : (last === todayISO() ? 'Đã gửi lệnh tải hôm nay' : 'Sao lưu ' + bakDateText(last));
}
/* 2.22.0: danh sách bản .db trên máy chủ (GET /api/backups), chỉ đọc, 10 dòng/trang. */
var bakList = null, bakPage = 1, bakErr = false, bakSeq = 0;
function bakSizeText(n){
  n = Number(n) || 0;
  return n >= 1048576 ? fmtNum(Math.round(n / 104857.6) / 10) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
}
function bakTimeText(iso){
  var d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
function renderBakList(){
  var host = $('#bakList'), pg = $('#bakPager'), st = $('#bakStat');
  if (!host) return;
  host.textContent = '';
  var rows = bakList || [];
  var pages = Math.max(1, Math.ceil(rows.length / 10));
  if (bakPage > pages) bakPage = pages;
  if (bakPage < 1) bakPage = 1;
  if (bakErr || !rows.length) {
    var msg = (bakErr === 'auth' ? 'Không xem được danh sách bản sao lưu' : bakErr ? 'Không tải được danh sách' : (bakList ? 'Chưa có bản sao lưu trên máy chủ.' : 'Đang tải…'));
    var ep = el('p', 'hint bak-empty', msg); ep.setAttribute('role', 'none'); host.appendChild(ep);
    if (st) st.textContent = bakErr === 'auth' ? '' : msg;
    if (pg) pg.textContent = '';
    return;
  }
  var shown = rows.slice((bakPage - 1) * 10, bakPage * 10);
  shown.forEach(function(b){
    var r = el('div', 'bak-row');
    r.setAttribute('role', 'listitem');
    var nm = el('span', 'bak-row__name', b.name);
    if (String(b.name).indexOf('-truoc-ghi-de-') >= 0) nm.appendChild(el('span', 'bak-row__tag', 'trước ghi đè'));
    r.appendChild(nm);
    r.appendChild(el('span', 'bak-row__size', bakSizeText(b.size)));
    r.appendChild(el('span', 'bak-row__time', bakTimeText(b.modified)));
    host.appendChild(r);
  });
  if (pages > 1) renderPager(pg, bakPage, pages, 'bak', true); else if (pg) pg.textContent = '';
  if (st) st.textContent = (pages > 1 ? 'Trang ' + bakPage + '/' + pages + ' — ' : 'Đã tải ') + shown.length + '/' + rows.length + ' bản';
}
function loadBakList(){
  var seq = ++bakSeq, host = $('#bakList'), btn = $('#bakRefresh');
  if (host) host.classList.add('bak-busy');
  if (btn) btn.disabled = true;
  var done = function(list, auth){
    if (seq !== bakSeq) return;
    if (host) host.classList.remove('bak-busy');
    if (btn) btn.disabled = false;
    bakErr = list ? false : auth ? 'auth' : true;
    if (list) bakList = list;
    renderBakList();
  };
  return apiFetch('/api/backups').then(function(r){
    if (r && r.status === 401) { noteAuthLost(); return 'auth'; }
    return r.ok ? r.json() : null;
  }).then(function(j){
    if (j === 'auth') return done(null, true);
    done(j && j.success && Array.isArray(j.backups) ? j.backups : null);
  }, function(){ done(null); });
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
  if (manual) toast('Đã tạo file sao lưu');
  return true;
}
function backupStamp(){
  var d = new Date();
  return todayISO() + '-' + pad2(d.getHours()) + pad2(d.getMinutes());
}
/* Tải snapshot hiện tại trước khi restore. Trả false nếu trình duyệt chặn,
   để restoreFromFile dừng lại thay vì ghi đè mù. */
function backupBeforeRestore(name){
  return downloadBackup(false, name || ('kho-backup-truoc-restore-' + backupStamp() + '.json'), true);
}
function maybeAutoBackup(){
  if (!backupAutoOn()) return false;
  if (backupLastDate() === todayISO()) return false;
  if (!db.products.length && !db.transactions.length && !db.prescriptions.length) return false;
  if (!downloadBackup(false)) return false;
  toast('Đã gửi lệnh tải bản sao lưu hôm nay, hãy kiểm tra thư mục Tải xuống');
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
  if (authLost || refreshing) { toast(authLost ? 'Thiết bị chưa được duyệt: chưa thể khôi phục' : 'Đang đồng bộ, thử lại sau giây lát', 'error'); return; }
  if (file.size > 12 * 1024 * 1024) { toast('File sao lưu quá lớn', 'error'); return; }
  var fr = new FileReader();
  fr.onload = function(){
    var bak = null;
    try { bak = parseBackup(String(fr.result || '')); } catch (e) {
      backupParseError = 'File sao lưu không phải JSON hợp lệ';
    }
    if (!bak) { toast(backupParseError || 'File sao lưu không hợp lệ hoặc thiếu bảng dữ liệu', 'error'); return; }
    if (JSON.stringify(bak).length > 4 * 1024 * 1024) { toast('File sao lưu quá lớn', 'error'); return; }
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
    /* Trình duyệt chặn tải im lặng thì mã không biết được: tải bản hiện tại rồi bắt người dùng xác nhận đã thấy file mới ghi đè. */
    var bakName = 'kho-backup-truoc-restore-' + backupStamp() + '.json';
    if (!backupBeforeRestore(bakName)) {
      toast('Không tạo được bản sao lưu trước khi khôi phục — đã hủy thao tác', 'error');
      return;
    }
    if (!confirm('Vừa tải về bản sao lưu dữ liệu hiện tại: "' + bakName + '".\nHãy kiểm tra file đã có trong thư mục Tải xuống rồi mới bấm OK.\nChưa thấy file thì bấm Hủy: dữ liệu chưa bị thay đổi.')) return;
    db = bak;
    resetDrafts();
    /* Restore là ghi đè chủ động: bỏ qua kiểm tra conflict và ép ghi lên máy chủ. */
    commit('Đã khôi phục từ file sao lưu', true);
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
    case 'nhap-add': addNhapItem(); break;
    case 'save-retail': saveRetail(); break;
    case 'save-remedy': saveRemedy(); break;
    case 'save-preset': remedySavePresetClick(); break;
    case 'del-preset': delPreset(); break;
    case 'pick-preset': pickPresetRow(id); break;
    case 'close-preset': closePreset(); break;
    case 'new-remedy': newRemedy(); break;
    case 'clear-retail': clearDraft('retail'); break;
    case 'clear-nhap': clearDraft('nhap'); break;
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
    case 'bak-view': bakView(btn.getAttribute('data-view')); break;
    case 'open-devices': location.href = '/auth/devices'; break;
    case 'close-edit': closeEdit(); break;
    case 'inv-low': case 'inv-out': { var fk = a.slice(4); invFilter = invFilter === fk ? '' : fk; invPage = 1; renderInventory(); break; } /* 2.32.0 */
    case 'reconcile': openRec(); break;
    case 'close-rec': closeRec(); break;
    case 'rec-fix': recFix(id); break;
    case 'rec-fix-all': recFixAll(); break;
    case 'backup-now': downloadBackup(true); break;
    case 'bak-refresh': loadBakList(); break;
    case 'open-backup-dir': {
      var T = window.__TAURI__;
      if (T && T.core) T.core.invoke('mo_thu_muc_sao_luu').catch(function(){ toast('Không mở được thư mục sao lưu'); });
      break;
    }
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
      else if (kind === 'rpre') { presetPage = page; renderPresetList(); }
      else if (kind === 'rnote') { remedyNotePage = page; renderRemedyNote(); }
      else if (kind === 'note') { notePage = page; renderNote(); }
      else if (kind === 'nnote') { nhapNotePage = page; renderNhapList(); }
      else if (kind === 'order') { orderPage = page; renderOrder(); }
      else if (kind === 'bak') { bakPage = page; renderBakList(); }
      break;
    }
  }
}

function bindEvents(){
  doc.addEventListener('click', function(e){
    var t = e.target.closest ? e.target.closest('[data-action]') : null;
    if (t) handleAction(t);
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
    if (id === 'nhapQty' && (isDesk() || !num(($('#nhapPrice') || {}).value))) { goSearch('#nhapPrice'); return; } /* 2.29.0 desktop: Enter ở SL luôn sang ô tiền (đặc tả Mac) */
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
  function rowEnter(host, add, qcls, mcls){
    if (!host) return;
    host.addEventListener('keydown', function(e){
      if (e.key !== 'Enter' || e.defaultPrevented) return;
      if (!e.target || e.target.tagName !== 'INPUT') return;
      e.preventDefault();
      if (qcls && isDesk() && e.target.classList.contains(qcls)) { goSearch('.' + mcls); return; } /* 2.29.0 desktop: Enter ở SL sang ô tiền, Enter ở ô tiền mới đưa dòng vào */
      /* Enter khi đang nhập dòng: đưa thẳng vào tờ ghi (giống nhập hàng) */
      add();
    });
  }
  rowEnter(body, addRetailToNote, 'retail-qty', 'retail-money');
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
  var rfind = $('#remedyFind');
  if (rfind) {
    rfind.addEventListener('input', presetFindOpen);
    rfind.addEventListener('keydown', presetFindKey);
    rfind.addEventListener('blur', function(){ setTimeout(function(){ presetFindClose(false); }, 140); });
  }
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
  if (ch) { ch.addEventListener('click', onChartClick); ch.addEventListener('mousemove', onChartMove); ch.addEventListener('mouseleave', onChartMove); }

  var cb = $('#chartBox');
  [['#chartModeY', 'Y'], ['#chartModeM', 'M'], ['#chartModeD', 'D']].forEach(function(b){ var e = $(b[0]); if (e) e.addEventListener('click', function(){ chartModeSet(b[1]); }); });
  [['#chartPrev', -1], ['#chartNext', 1]].forEach(function(b){ var e = $(b[0]); if (e) e.addEventListener('click', function(){ chartYearGo(b[1]); }); });
  if (cb) cb.addEventListener('toggle', function(){
    if (cb.open) { chartYr = Number(thisYear()); chartDy = chartYr; chartDm = parseInt(todayISO().slice(5, 7), 10); chartModeSet('D'); requestAnimationFrame(renderChart); var fb = cb.querySelector('.card__body'); if (fb && isDesk()) try { fb.focus({ preventScroll: true }); } catch (e) { fb.focus(); } }
  });
  if (cb) cb.addEventListener('keydown', function(e){ if (isDesk() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); chartKey(e.key === 'ArrowLeft' ? -1 : 1); } }); /* 2.34.0 */
  var bbx = $('#backupBox');
  if (bbx) bbx.addEventListener('toggle', function(){ if (bbx.open) { loadBakList(); bakView('bak'); } });
  var rbx = $('#remedyBox');
  if (rbx) rbx.addEventListener('toggle', function(){ if (rbx.open) { presetPage = 1; renderPresetList(); } }); /* 2.28.0: ĐƠN ĐÃ LƯU mở ở trang 1 khi vào tab */
  initTabs();
  initFootBars();

  var rt = null;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ if (cb && cb.open) renderChart(); }, 160);
  });

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
/* 2.15.10: NGÂN SÁCH CHIỀU CAO. Vùng thấy thật khi bàn phím mở = visualViewport.height (đo trên iPhone 14 Pro: 357-358 CSS px, innerHeight vẫn 695), tính từ đỉnh vùng nhìn.
   Thẻ khóa cách đỉnh KB_TOP_GAP; từ đỉnh thẻ tới đáy dòng đang nhập phải <= vvH - KB_TOP_GAP - KB_BOTTOM_GAP. Hàm thuần: chỗ còn cho danh sách = vvH - gap trên - gap dưới - (đỉnh danh sách - đỉnh thẻ) - khối dòng nhập (lấy lớn hơn của đo thật và ước lượng ENTRY_BLOCK_H). */
var ENTRY_BLOCK_H = 104, KB_BOTTOM_GAP = 8;
function compactAvail(vvH, listTopRel, pendH){
  if (!(vvH > 0)) return NaN;
  /* 2.15.18: chỉ chừa chỗ khi dòng đang nhập THẬT SỰ có (pendH > 0). Sau "+" hoặc khi đang gõ tên chưa chọn vị, dòng nhập trống (cao 0): chừa 104px ở đó làm tờ ghi chỉ còn 1 dòng. */
  return vvH - KB_TOP_GAP - KB_BOTTOM_GAP - (listTopRel > 0 ? listTopRel : 0) - (pendH > 0 ? Math.max(pendH, ENTRY_BLOCK_H) : 0);
}
/* Hàm thuần: max-height (px) của danh sách gọn; 0 = không giới hạn. Giảm dần từ n dòng xuống 1 cho vừa avail; 1 dòng vẫn không vừa thì cắt đúng avail (>=1). avail không xác định (NaN) = chỉ n dòng. */
function compactFitHeight(hs, n, avail, natural){
  if (avail !== avail) return compactListHeight(hs, n);
  var cnt = 0;
  (hs || []).forEach(function(x){ if (x > 0) cnt++; });
  var k = Math.min(n > 0 ? n : COMPACT_ROWS, cnt);
  for (; k >= 1; k--) {
    var h = compactListHeight(hs, k); /* 0 khi chỉ có <= k dòng: hiện đủ */
    var sum = h;
    if (!h) { sum = natural > 0 ? natural : 0; if (!(sum > 0)) (hs || []).forEach(function(x){ if (x > 0) sum += x; }); } /* không giới hạn: cao tự nhiên của danh sách (gồm tiêu đề bảng) */
    if (sum <= avail) return h;
  }
  return Math.max(1, Math.floor(avail));
}
/* Chiều cao phần dòng nhập thật của .note__pending: không tính hàng Tổng (tfoot) nằm cùng bảng (2.17.5), nếu không dòng nhập trống bị coi là có dòng và compactAvail trừ ENTRY_BLOCK_H. */
function pendEntryH(pend){
  if (!pend || !pend.getBoundingClientRect) return 0;
  var h = pend.getBoundingClientRect().height;
  var tf = pend.querySelector ? pend.querySelector('tfoot') : null;
  if (tf && tf.getBoundingClientRect) h -= tf.getBoundingClientRect().height;
  return h > 0 ? h : 0;
}
/* Đặt max-height danh sách gọn theo ngân sách; trả true nếu đổi. */
function compactFit(box, list){
  var tb = list.querySelector('tbody');
  var hs = [];
  if (tb) { var rs = tb.children || []; for (var i = 0; i < rs.length; i++) hs.push(rs[i].getBoundingClientRect().height); }
  var avail = NaN;
  if (box.getBoundingClientRect && list.getBoundingClientRect) {
    var vv = window.visualViewport, vvH = (vv && vv.height) || window.innerHeight || 0;
    var pend = box.querySelector ? box.querySelector('.note__pending') : null;
    var pr = pendEntryH(pend);
    avail = compactAvail(vvH, list.getBoundingClientRect().top - box.getBoundingClientRect().top, pr);
  }
  var h = compactFitHeight(hs, COMPACT_ROWS, avail, list.scrollHeight);
  var m = h ? h + 'px' : '';
  var changed = list.style.maxHeight !== m;
  list.style.maxHeight = m;
  return changed;
}
function compactRefit(){
  [['retailBox', 'retailNoteList'], ['remedyBox', 'remedyNoteList']].forEach(function(p){
    var box = $('#' + p[0]), list = $('#' + p[1]);
    if (box && list && box.classList && box.classList.contains('kb-compact') && compactFit(box, list)) list.scrollTop = list.scrollHeight;
  });
}
function compactApply(box, list, on, smooth){
  if (!box || !list) return;
  var was = !!(box.classList && box.classList.contains('kb-compact'));
  if (!on) { box.classList.remove('kb-compact'); list.style.maxHeight = ''; kbUnlock('tat-gon'); return; }
  box.classList.add('kb-compact');
  compactFit(box, list);
  compactScrollEnd(list, !!smooth && was);
  kbLock(box);
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
      else { kbLock(box); if (compactFit(box, list)) list.scrollTop = list.scrollHeight; } /* đã gọn nhưng khóa bị gỡ (xoay/đổi cỡ) mà vẫn đang nhập: khóa lại */
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
/* 2.15.10: KHÓA CUỘN TRANG khi nhập trên điện thoại (thay mọi định vị bằng scrollTo/scrollBy của 2.15.8-2.15.9).
   Lần đầu vào chế độ gọn: nhớ scrollY, đặt body position:fixed với top âm sao cho đỉnh thẻ cách đỉnh vùng nhìn KB_TOP_GAP px; vị trí hiển thị là hằng số, không còn gì để iOS cuộn.
   Gỡ khóa (idempotent) ở mọi đường thoát: khi tắt gọn, blur ngoài thẻ (lưới 400ms), đóng thẻ, pagehide, ẩn tab, đổi chiều/cỡ, về >640px. Chỉ kbUnlock được gọi window.scrollTo. */
var KB_TOP_GAP = 8;
/* Hàm thuần: top (px, <= vvTop) của body khi khóa; absTop = đỉnh thẻ so với đỉnh trang; vvTop = offsetTop của visualViewport (iOS pan) bù vào để thẻ vẫn cách đỉnh vùng THẤY 8px. */
function kbLockTop(absTop, vvTop){
  var vt = vvTop > 0 ? vvTop : 0;
  var a = absTop > KB_TOP_GAP ? absTop - KB_TOP_GAP : 0;
  return Math.round(vt - a) || 0;
}
/* kbLastY: scrollY mới nhất TRƯỚC khi focus (cập nhật khi cuộn/chạm lúc chưa khóa). Cần vì trình duyệt có thể tự cuộn khi focus ô nhập (đo thật: 150 -> 190) trước khi khóa chạy; gỡ khóa phải về vị trí trước khi nhập. */
var kbLastY = -1;
function kbTrackY(){ if (!kbLockBox) kbLastY = window.pageYOffset || window.scrollY || 0; }
var kbLockBox = null, kbSavedY = 0, kbLockAbs = 0, kbLockW = 0, kbDebug = false, kbReason = 'init';
function kbMobile(){ return !!(window.matchMedia && window.matchMedia('(max-width:640px)').matches); }
function kbVvTop(){ var vv = window.visualViewport; return vv ? (vv.offsetTop || 0) : 0; }
/* Thẻ chứa ô nhập (INPUT không phải ngày) trong Bán lẻ/Thuốc chén; ngoài ra null. */
function kbBoxOf(t){
  if (!t || !t.closest || t.tagName !== 'INPUT' || t.type === 'date') return null;
  return t.closest('#retailBox, #remedyBox');
}
function kbLockApply(){
  var b = doc.body;
  if (kbLockBox && b && b.style) b.style.top = kbLockTop(kbLockAbs, kbVvTop()) + 'px';
}
function kbLock(box){
  var b = doc.body, r = doc.documentElement;
  if (kbLockBox || !box || !b || !b.style || !box.getBoundingClientRect) return;
  var y = window.pageYOffset || window.scrollY || 0;
  kbSavedY = kbLastY >= 0 ? kbLastY : y;
  kbLockAbs = box.getBoundingClientRect().top + y;
  kbLockW = window.innerWidth || 0;
  kbLockBox = box;
  kbLockApply();
  b.style.position = 'fixed'; b.style.left = '0'; b.style.right = '0'; b.style.width = '100%';
  if (b.classList) b.classList.add('kb-lock');
  if (r && r.classList) r.classList.add('kb-lock');
  kbDbg('khoa');
}
function kbUnlock(why){
  var b = doc.body, r = doc.documentElement;
  var was = !!kbLockBox;
  kbLockBox = null;
  if (b && b.style) { b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = ''; b.style.width = ''; }
  if (b && b.classList) b.classList.remove('kb-lock');
  if (r && r.classList) r.classList.remove('kb-lock');
  if (was) window.scrollTo(0, kbSavedY);
  kbDbg(why ? 'go: ' + why : 'go');
}
/* Dòng gỡ lỗi (?kbdebug=1), gắn vào <html> (không bị body fixed/top âm kéo đi), bám visualViewport. */
function kbDbg(why){
  if (why) kbReason = why;
  var root = doc.documentElement;
  if (!kbDebug || !root) return;
  var d = $('#kbDbg');
  if (!d) { d = doc.createElement('div'); d.id = 'kbDbg'; d.style.cssText = 'position:fixed;top:0;left:0;z-index:99999;background:#111;color:#0f0;font:10px monospace;padding:2px 4px;white-space:pre;pointer-events:none;max-width:100vw;overflow:hidden'; root.appendChild(d); }
  var vv = window.visualViewport, ih = window.innerHeight || 0;
  var rb = $('#retailBox'), mb = $('#remedyBox');
  var cp = !!((rb && rb.classList && rb.classList.contains('kb-compact')) || (mb && mb.classList && mb.classList.contains('kb-compact')));
  d.style.transform = vv ? 'translate(' + Math.round(vv.offsetLeft || 0) + 'px,' + Math.round(vv.offsetTop || 0) + 'px)' : '';
  d.textContent = 'savedY ' + Math.round(kbSavedY) + ' top ' + (kbLockBox ? (doc.body && doc.body.style ? doc.body.style.top : '') : '-') + ' vvH ' + Math.round(vv && vv.height ? vv.height : 0) + ' vvTop ' + Math.round(vv ? (vv.offsetTop || 0) : 0) + ' ih ' + ih + ' compact ' + (cp ? 1 : 0) + ' lock ' + (kbLockBox ? 1 : 0) + ' | ' + kbReason + '\n' + kbEvs.join('  ') + ' | preventScroll-chạm: ' + (kbPS ? 'có' : 'không');
}
/* Lưới an toàn: sau blur 400ms mà không còn ô nhập trong thẻ thì gỡ khóa. */
function kbRelease(){
  setTimeout(function(){ if (!kbBoxOf(doc.activeElement)) kbUnlock('blur'); }, 400);
}
/* visualViewport đổi (bàn phím hiện/đổi, iOS pan): chỉ bù lại top theo vvTop; không cuộn. */
function onVvChange(){ scheduleFootBars(); kbLockApply(); compactRefit(); kbEvRec('vv'); kbDbg(); }
/* 2.15.11: chạm vào ô nhập KHÁC trong thẻ đang khóa: chặn hành vi mặc định (iOS tự căn giữa ô vừa focus = pan visualViewport) rồi focus preventScroll.
   Nút Trước/Sau của thanh phụ iOS không chặn được; khi đó vẫn bù top đồng bộ trong sự kiện vv (không rAF, không transition). Ô đang focus: chạm như thường (đặt con trỏ). */
var kbPS = false, kbEvs = [], kbEvAt = 0, kbVvPrev = 0, kbTouchAt = 0;
function kbTouch(e){
  var t = e && e.target, box = kbBoxOf(t);
  kbEvRec('pointerdown');
  kbPS = false;
  /* 2.17.8: PWA iPhone (standalone) không bật bàn phím khi focus từ touchstart: để iOS xử lý chạm/focus mặc định. */
  if (!isStandaloneMode() && kbLockBox && box === kbLockBox && t !== doc.activeElement && e.cancelable !== false && e.preventDefault) {
    e.preventDefault();
    kbPS = true;
    focusNS(t);
  }
  kbDbg();
}
/* Gỡ lỗi (?kbdebug=1): ghi 3 sự kiện vv/chạm/focus gần nhất để biết iOS pan do đâu. */
function kbEvRec(src){
  if (!kbDebug) return;
  var now = Date.now(), t = Math.round(kbVvTop());
  if (src === 'pointerdown') kbTouchAt = now;
  if (src === 'vv' && t === kbVvPrev) return;
  kbEvs.push('vvTop ' + kbVvPrev + '→' + t + ' (+' + (kbEvAt ? now - kbEvAt : 0) + 'ms, ' + src + ')');
  if (kbEvs.length > 3) kbEvs.shift();
  kbVvPrev = t; kbEvAt = now;
}
/* Đổi chiều/cỡ: gỡ khóa nếu rộng đổi hoặc về >640px (bàn phím Android đổi cao thì giữ). */
function kbOnResize(){
  if (kbLockBox && (!kbMobile() || (window.innerWidth || 0) !== kbLockW)) kbUnlock('resize');
}
function initFootBars(){
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('scroll', scheduleFootBars, { passive: true });
    window.addEventListener('scroll', kbTrackY, { passive: true });
    window.addEventListener('resize', scheduleFootBars);
    window.addEventListener('resize', kbOnResize);
    window.addEventListener('orientationchange', function(){ kbUnlock('xoay'); });
    window.addEventListener('pagehide', function(){ kbUnlock('pagehide'); });
  }
  ['touchstart', 'mousedown'].forEach(function(n){ doc.addEventListener(n, kbTrackY, { passive: true, capture: true }); });
  doc.addEventListener('touchstart', kbTouch, { passive: false, capture: true });
  kbTrackY();
  doc.addEventListener('visibilitychange', function(){ if (doc.visibilityState === 'hidden') kbUnlock('an-tab'); });
  if (window.visualViewport && window.visualViewport.addEventListener) {
    window.visualViewport.addEventListener('resize', onVvChange);
    window.visualViewport.addEventListener('scroll', onVvChange);
  }
  try { kbDebug = /[?&]kbdebug=1/.test((window.location && window.location.search) || '') || localStorage.getItem('kbdebug') === '1'; } catch (e) {}
  /* 2.17.8: PWA không có thanh địa chỉ: chạm 5 lần logo trong 3 giây để bật/tắt kbdebug (cờ localStorage). */
  var logo = $('#brandLogo'), logoN = 0, logoT = 0;
  if (logo) logo.addEventListener('click', function(){
    var n = Date.now(); if (!logoN || n - logoT > 3000) { logoN = 0; logoT = n; }
    if (++logoN < 5) return;
    logoN = 0;
    try { if (localStorage.getItem('kbdebug') === '1') localStorage.removeItem('kbdebug'); else localStorage.setItem('kbdebug', '1'); window.location.reload(); } catch (e) {}
  });
  if (kbDebug) {
    kbDbg('mo-trang');
    doc.addEventListener('focusin', function(){ kbEvRec(kbTouchAt && Date.now() - kbTouchAt < 800 ? 'focusin' : 'next'); kbDbg(); });
    if (typeof window.addEventListener === 'function') window.addEventListener('scroll', function(){ kbDbg(); }, { passive: true });
  }
  doc.addEventListener('focusin', function(){ scheduleFootBars(); compactSync(false); });
  doc.addEventListener('focusout', function(){ scheduleFootBars(); kbRelease(); setTimeout(compactSync, 0); });
  ['retailBox', 'remedyBox'].forEach(function(id){
    var b = $('#' + id);
    if (b && b.addEventListener) b.addEventListener('toggle', function(){ scheduleFootBars(); kbUnlock('dong-the'); });
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
    lastSyncOk = Date.now();
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
  if (isDesk()) renderNhapList();
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

  var firstUse = function(e){
    if (e && e.target && e.target.closest && e.target.closest('[data-action=restore-file]')) return; /* cử chỉ đầu là nút khôi phục: không tự tải, giữ listener */
    doc.removeEventListener('click', firstUse);
    doc.removeEventListener('keydown', firstUse);
    maybeAutoBackup(); /* chạy ngay trong cử chỉ người dùng: tải qua setTimeout dễ bị trình duyệt chặn */
  };
  doc.addEventListener('click', firstUse);
  doc.addEventListener('keydown', firstUse);
}

try { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function(){}); } catch (e) {}

if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
else init();

})();
</script>
</body>
</html>`;
