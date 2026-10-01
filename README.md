# Sổ Đăng Ký Lịch Nghỉ & Chấm Công (ChamCong)

Ứng dụng web hiện đại giúp cá nhân quản lý lịch nghỉ, tự động theo dõi và cân đối hạn mức chuẩn 4 ngày/tháng, tính toán chênh lệch Âm / Dương công và xuất báo cáo Excel UTF-8.

---

## 🌟 Tính Năng Nổi Bật

- **Chuẩn định mức 4.0 ngày nghỉ/tháng:**
  - Quy đổi linh hoạt: Nghỉ sáng (0.5c), Nghỉ chiều (0.5c), Nghỉ cả ngày (1.0c).
  - Tự động tính chênh lệch công: $B = 4.0 - \text{Đã nghỉ}$.
  - Nhận diện tức thì: **Dương công** (thừa ngày nghỉ), **Âm công** (vượt hạn mức), **Đủ công**.
- **Lịch tháng trực quan & tương tác:**
  - Lưới 7 ngày (T2 - CN) hiển thị badge ca nghỉ sinh động kèm biểu tượng và lý do.
  - Đánh dấu ngày hiện tại ("Hôm nay").
  - Chuyển tháng mượt mà, hỗ trợ quay nhanh về tháng hiện tại.
- **Thống kê KPI thời gian thực:**
  - Thẻ định mức, số ngày đã đăng ký, trạng thái công hiển thị trực quan theo mã màu.
  - Thanh tiến độ hiển thị phần trăm sử dụng hạn mức.
- **Quản lý lịch nghỉ thuận tiện:**
  - Modal đăng ký/chỉnh sửa nhanh chóng kèm gợi ý lý do thường gặp (Khám bệnh, việc gia đình, du lịch...).
  - Bảng danh sách chi tiết các lượt nghỉ trong tháng kèm chức năng sửa/xóa.
- **Xuất báo cáo & Sao lưu an toàn:**
  - Xuất file Excel (.csv) hỗ trợ tiếng Việt có dấu chuẩn UTF-8 (kèm BOM `\uFEFF`).
  - Sao lưu toàn bộ dữ liệu ra file JSON độc lập và khôi phục (restore) khi cần.
  - Dữ liệu được lưu trữ tự động trên máy người dùng qua `LocalStorage`.
- **Giao diện Slate Glassmorphism cao cấp:**
  - Thiết kế hiện đại, vi tương tác micro-animations, tương thích đa thiết bị (Responsive).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend:** React 18, Vite
- **Styling:** Vanilla CSS với CSS Variables & Glassmorphism
- **Testing:** Vitest, React Testing Library, JSDOM (20/20 test cases pass 100%)
- **Hosting:** Sẵn sàng deploy lên Vercel (`vercel.json`)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Cài đặt thư viện:
```bash
npm install
```

### 2. Chạy môi trường phát triển:
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173/`

### 3. Chạy kiểm thử:
```bash
npm run test
```

### 4. Đóng gói bản Production:
```bash
npm run build
```

---

## 🌐 Triển Khai Lên Vercel

Dự án đã có sẵn file `vercel.json` tối ưu cho React SPA:
1. Kết nối repository này trên [Vercel](https://vercel.com).
2. Vercel sẽ tự nhận diện Vite và deploy tự động sau mỗi lần push code!
