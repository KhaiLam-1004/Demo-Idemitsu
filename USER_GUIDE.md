# Idemitsu Loyalty · Demo Walkthrough

Demo wireframe + hi-fi của hệ thống Loyalty cho Idemitsu — gồm **4 role**: Admin, NPP, Repair Shop, Sales.

## 1. Truy cập

- **Hub:** mở `index.html` ở root → 4 thẻ role.
- Hoặc đi thẳng:

| Role | Path | Loại UI |
|------|------|---------|
| Admin       | `admin/`  | CMS desktop |
| NPP         | `npp/`    | CMS desktop + Zalo Mini App view |
| Repair Shop | `shop/`   | Zalo Mini App (mobile) |
| Sales       | `sales/`  | Zalo Mini App (mobile) |

Mỗi role có **picker màn hình nổi** ở góc phải dưới (pill "Screens") để nhảy nhanh giữa các bước.

## 2. Tour 5 phút (luồng demo chính)

> Mở **2 tab song song** để thấy đồng bộ real-time giữa Admin ↔ Shop/NPP.

### Tab 1 — Admin cấu hình điểm
1. Vào `admin/` → menu trái **Cấu hình tích điểm**.
2. Bấm **Sửa** một dòng (vd. Zepro 0W-20) → đổi Điểm Repair Shop / NPP → **Lưu**.
3. Bấm **+ Thêm sản phẩm** → tạo SKU mới (vd. `khai-01`, shop +16, NPP +8) → **Lưu**.
4. Banner vàng **"Có thay đổi chưa được lưu"** xuất hiện → bấm **Lưu cấu hình** → banner xanh xác nhận đã đẩy sang Shop & NPP.
5. Bấm **Lịch sử thay đổi** (badge đỏ đếm số lần) để xem nhật ký edits.

### Tab 2 — Shop quét QR
1. Vào `shop/` → mở **Quét QR** (icon ở bottom nav).
2. Thấy danh sách chip SKU **tự động cập nhật** theo Admin (kể cả `khai-01` vừa thêm).
3. Chọn SKU → bấm **Mô phỏng · OK** → màn thành công hiển thị `+{điểm shop}` đúng theo cấu hình Admin.
4. Quay lại Trang chủ → balance shop tăng đúng số điểm.

### Tab 3 — NPP quét QR
1. Vào `npp/` → mở **Loyalty (web view) → Quét QR · camera**.
2. Cùng chip SKU picker đồng bộ từ Admin.
3. **Mô phỏng · Quét OK** → balance NPP tăng (toast cross-award hiện trên dashboard).

## 3. Các luồng phụ đáng xem

**Admin** (`admin/`)
- Quản lý NPP: tạo đơn lẻ / import Excel
- Cấu hình ZNS: template tin Zalo gửi shop
- Cấu hình tích điểm: edit inline + history (đã làm ở trên)

**NPP** (`npp/`)
- Whitelist Shop: thêm/import shop được phép tích điểm
- Loyalty web view: điểm + quét QR + lịch sử
- Check-in của Sale: nhật ký Sale ghé NPP

**Repair Shop** (`shop/`)
- Trang chủ Hi-Fi: banner Got It loyalty + tier vàng + quét nhanh
- Danh mục quà: catalog 6 sản phẩm thật (iPhone, iMac, Samsung, Lock & Lock, Xiaomi, Baseus) + 3 voucher
- Đổi quà: chi tiết → form giao nhận → success → Quà của tôi (filter Voucher / Quà vật lý)

**Sales** (`sales/`)
- Cửa hàng được phân: list + chi tiết shop (lịch sử chăm sóc, Loyalty)
- Check-in tại NPP: ảnh + GPS đối chiếu

## 4. Phím tắt & lưu ý

- **Toggle Mode** ở góc trên các role: chuyển **Hi-fi ↔ Wireframe** để xem bản polish hay khung xám.
- Demo dùng `localStorage` (key `idemitsu-loyalty-demo-v1`, `idemitsu-points-config-v1`) → mở incognito để reset.
- Mọi mock data persist trong tab — bấm reset trong panel "Loyalty" (góc dưới) khi cần baseline lại.
- Yêu cầu mở qua **HTTP server** (vd. VS Code Live Server), không mở file:// vì BroadcastChannel cần origin.

## 5. Repo & deploy

- Repo: [github.com/KhaiLam-1004/Demo-Idemitsu](https://github.com/KhaiLam-1004/Demo-Idemitsu)
- Static site — push lên `main` là auto-deploy (GitHub Pages nếu đã bật).
