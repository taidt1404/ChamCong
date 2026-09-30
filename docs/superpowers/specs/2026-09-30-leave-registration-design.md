# Thiết Kế Chi Tiết: Ứng Dụng Đăng Ký Lịch Nghỉ & Chấm Công Cá Nhân (ReactJS)

- **Ngày tạo:** 2026-09-30
- **Trạng thái:** Đã duyệt bởi người dùng
- **Mục tiêu:** Xây dựng ứng dụng web bằng React (Vite) quản lý lịch nghỉ cá nhân, tự động tính toán số ngày nghỉ và chênh lệch âm/dương công hàng tháng dựa trên hạn mức chuẩn 4 ngày/tháng.

---

## 1. Yêu Cầu Nghiệp Vụ & Quy Tắc Tính Công

### 1.1. Hạn mức và Quy đổi ca nghỉ
- **Hạn mức chuẩn mỗi tháng:** Cố định `4.0` ngày nghỉ mỗi tháng (tính độc lập theo từng tháng, không cộng dồn sang tháng sau).
- **Các ca nghỉ hợp lệ:**
  - **Nghỉ Sáng (`morning`):** Quy đổi `0.5` ngày công.
  - **Nghỉ Chiều (`afternoon`):** Quy đổi `0.5` ngày công.
  - **Nghỉ Cả ngày (`full`):** Quy đổi `1.0` ngày công.
- **Ghi chú/Lý do:** Tùy chọn nhập lý do cho từng lần nghỉ (ví dụ: *Việc gia đình, Khám sức khỏe, Đi du lịch...*).

### 1.2. Công thức tính công tháng
Cho tháng đang chọn với tập các bản ghi nghỉ $R$:
$$\text{Tổng ngày nghỉ } (T) = \sum_{r \in R} r.days$$
$$\text{Chênh lệch công } (B) = 4.0 - T$$

- **Dương công ($B > 0$):** Nghỉ chưa hết 4 ngày tiêu chuẩn (Ví dụ: Nghỉ 2.5 ngày $\rightarrow$ Dương 1.5 công). Hiển thị màu xanh lá tươi sáng.
- **Âm công ($B < 0$):** Nghỉ vượt quá 4 ngày tiêu chuẩn (Ví dụ: Nghỉ 5 ngày $\rightarrow$ Âm 1.0 công). Hiển thị màu cam/đỏ cảnh báo.
- **Đủ công ($B = 0$):** Nghỉ đúng 4 ngày tiêu chuẩn $\rightarrow$ 0 công chênh lệch. Hiển thị màu xanh dương trung tính.

---

## 2. Kiến Trúc Dữ Liệu & Lưu Trữ

### 2.1. Cấu trúc bản ghi (`LeaveRecord`)
```typescript
interface LeaveRecord {
  id: string;               // Unique string (timestamp hoặc uuid)
  date: string;             // Định dạng chuẩn YYYY-MM-DD (VD: "2026-10-15")
  session: 'morning' | 'afternoon' | 'full'; 
  days: number;             // 0.5 (sáng/chiều) hoặc 1.0 (cả ngày)
  reason: string;           // Lý do nghỉ
  createdAt: string;        // ISO timestamp
}
```

### 2.2. Cơ chế lưu trữ (`localStorage`)
- Key lưu trữ: `leave_planner_records_v1`.
- Dữ liệu dạng mảng JSON các `LeaveRecord`.
- Tự động nạp khi tải ứng dụng, cập nhật ngay khi Thêm / Sửa / Xóa.
- Cung cấp tính năng Sao lưu (Export JSON) và Khôi phục (Import JSON).

---

## 3. Kiến Trúc Giao Diện & Trải Nghiệm Người Dùng (UI/UX)

### 3.1. Các Khối Chức Năng Chính
1. **Header & Thanh Công Cụ:**
   - Logo / Tên ứng dụng: **Sổ Đăng Ký Lịch Nghỉ & Chấm Công**.
   - Bộ chọn tháng: `< Tháng trước`, `Tháng hiển thị (MM/YYYY)`, `Tháng sau >`, nút `Hôm nay`.
   - Nút `Xuất Excel (CSV)` và nút `Sao lưu / Nhập dữ liệu JSON`.
2. **Thanh Thống Kê KPI (Metric Cards):**
   - **Thẻ Hạn mức:** 4.0 ngày / tháng.
   - **Thẻ Đã nghỉ:** Tổng số ngày nghỉ thực tế (kèm chi tiết: số ca sáng, chiều, cả ngày).
   - **Thẻ Cân đối công:** Hiển thị nổi bật trạng thái Dương công / Âm công / Đủ công kèm badge màu tương ứng.
   - **Thanh Tiến độ (Progress Bar):** Thể hiện trực quan tỷ lệ % ngày nghỉ đã sử dụng so với 4 ngày chuẩn.
3. **Lịch Tháng Tương Tác (Calendar Grid):**
   - Lưới 7 cột (Thứ Hai đến Chủ Nhật).
   - Ô ngày hôm nay có viền highlight phát sáng.
   - Ô có lịch nghỉ hiển thị badge màu nổi bật:
     - 🌅 Sáng (0.5c) - Cam hổ phách
     - 🌆 Chiều (0.5c) - Xanh tím hoàng hôn
     - ☀️ Cả ngày (1.0c) - Đỏ san hô
   - Nhấp vào ô ngày bất kỳ để mở Modal Đăng ký (nếu chưa có) hoặc Modal Chỉnh sửa / Xóa (nếu đã có).
4. **Modal Đăng Ký / Chỉnh Sửa Lịch Nghỉ:**
   - Hiển thị ngày đã chọn (có thể chọn lại ngày nếu muốn).
   - Radio cards lớn chọn ca: Sáng (0.5), Chiều (0.5), Cả ngày (1.0).
   - Input nhập lý do kèm chip gợi ý nhanh (Việc gia đình, Khám bác sĩ, Đi du lịch, Việc riêng).
   - Nút: `Lưu lịch nghỉ`, `Xóa lịch nghỉ` (chế độ sửa), `Hủy`.
5. **Bảng Danh Sách Chi Tiết Lịch Nghỉ Tháng:**
   - Liệt kê theo thứ tự ngày tăng dần các ngày nghỉ trong tháng.
   - Các cột: Ngày | Thứ | Ca nghỉ | Số công | Lý do | Thao tác (Sửa / Xóa).

---

## 4. Cấu Trúc Kỹ Thuật & Thư Mục

```text
Off/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── App.css
    ├── components/
    │   ├── Header.jsx           # Tiêu đề & thanh công cụ
    │   ├── MonthNavigator.jsx   # Điều hướng tháng/năm
    │   ├── StatsOverview.jsx    # Thống kê KPI hạn mức, đã nghỉ, âm/dương công
    │   ├── CalendarGrid.jsx     # Lịch tháng tương tác
    │   ├── LeaveModal.jsx       # Modal đăng ký / chỉnh sửa
    │   ├── LeaveListTable.jsx   # Bảng danh sách chi tiết
    │   └── BackupModal.jsx      # Modal sao lưu và khôi phục dữ liệu
    ├── hooks/
    │   └── useLeaves.js         # Custom Hook quản lý state và LocalStorage
    └── utils/
        ├── calendarUtils.js     # Tiện ích tính lịch tháng, thứ trong tuần
        └── exportUtils.js       # Tiện ích xuất CSV (UTF-8 BOM chống lỗi font tiếng Việt)
```

---

## 5. Xử Lý Ngoại Lệ & Kỹ Thuật Đặc Thù
1. **Xuất CSV Tiếng Việt:** Bắt buộc chèn UTF-8 BOM (`\uFEFF`) ở đầu nội dung file CSV để Microsoft Excel hiển thị tiếng Việt có dấu chuẩn 100%.
2. **Xử lý ngày trùng lặp:** Nếu người dùng nhấp vào ngày đã đăng ký ca, form sẽ tự động nạp dữ liệu cũ để người dùng chỉnh sửa hoặc hủy ca nghỉ dễ dàng.
3. **Dữ liệu an toàn:** Validate kiểu dữ liệu khi import JSON, tránh trường hợp file hỏng làm crash ứng dụng.
