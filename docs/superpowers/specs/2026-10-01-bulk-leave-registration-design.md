# Bulk Leave Registration (Đăng Ký Nghỉ Nhiều Ngày) Design Specification

**Author:** Antigravity  
**Date:** 2026-10-01  
**Status:** Approved  
**Feature:** Đăng ký lịch nghỉ nhiều ngày cùng lúc (liên tiếp hoặc rời rạc)

---

## 1. Context & Motivation

Hiện tại, người dùng khi đăng ký nghỉ nhiều ngày (ví dụ nghỉ 3 ngày liên tiếp hoặc 2 ngày cách quãng) phải nhấp vào từng ngày trên lịch và lưu từng lần riêng biệt. Điều này gây tốn thời gian và lặp lại thao tác.

Tính năng **Bulk Leave Registration** cho phép người dùng kích hoạt chế độ chọn hàng loạt trực tiếp trên giao diện lịch tháng, chọn nhiều ngày bất kỳ và lưu đồng thời với cùng 1 ca nghỉ và lý do.

---

## 2. User Experience & Workflow

### 2.1. Kích Hoạt Chế Độ Chọn Nhiều Ngày
- Cạnh điều hướng tháng (`MonthNavigator`) hoặc phía trên Lịch (`CalendarGrid`), cung cấp nút chuyển đổi:
  - Nút **"Chọn nhiều ngày"** kèm icon `☑` (hoặc biểu tượng Calendar Multi-check).
  - Trạng thái nút nổi bật khi đang kích hoạt (Active State).

### 2.2. Thao Tác Trên Lịch
- Khi chế độ chọn nhiều ngày đang BẬT:
  - Nhấp vào bất kỳ ô ngày nào: Toggle trạng thái chọn (`selectedDates`).
  - Ô ngày được chọn sẽ có:
    - Viền highlight màu xanh ngọc / tím rực rỡ (`--border-focus: #38bdf8` hoặc viền gradient).
    - Huy hiệu dấu tick `✓` ở góc trên cùng của ô ngày.
    - Nền ô hơi sáng lên để phân biệt rõ với các ngày khác.
  - Hỗ trợ cả ngày liên tiếp lẫn ngày cách quãng trong tháng hiện tại.
  - Phía trên lịch xuất hiện thanh tác vụ nổi (**BulkActionBar**):
    - Hiển thị số lượng ngày đã chọn: `"Đã chọn: X ngày"`.
    - Nút **"Đăng ký lịch nghỉ"** (Primary Button, chỉ bật khi $X > 0$).
    - Nút **"Hủy chọn"** (Ghost Button): Xóa danh sách ngày đang chọn và tắt chế độ chọn nhiều ngày.

### 2.3. Modal Đăng Ký Nhiều Ngày
- Khi nhấp **"Đăng ký lịch nghỉ"**:
  - Mở modal đăng ký:
    - **Tiêu đề:** `"Đăng Ký Nghỉ Hàng Loạt (X ngày)"`.
    - **Danh sách ngày:** Hiển thị danh sách các ngày đã chọn dưới dạng chip (VD: `15/10/2026 ✕`, `16/10/2026 ✕`, `17/10/2026 ✕`), người dùng có thể bấm `✕` để gỡ bỏ ngày nếu chọn nhầm.
    - **Chọn ca nghỉ chung:** Sáng (`0.5 công`), Chiều (`0.5 công`), Cả ngày (`1.0 công`).
    - **Lý do:** Nhập tự do hoặc bấm chọn lý do nhanh (Đi du lịch, Việc gia đình, Khám sức khỏe...).
  - Bấm **"Lưu cho X ngày"**:
    - Gọi hàm lưu đồng loạt vào `localStorage`.
    - Nếu trong danh sách có ngày đã đăng ký từ trước, tự động ghi đè/cập nhật ca nghỉ và lý do mới.
    - Tự động cập nhật bảng thống kê KPI (Số ngày nghỉ, Âm/Dương công) và bảng danh sách.
    - Đóng modal và reset chế độ chọn nhiều ngày về trạng thái bình thường.

---

## 3. Technical Architecture & Component Changes

### 3.1. Hook `useLeaves.js`
Thêm hàm `saveMultipleLeaves(dates, { session, reason })`:
```javascript
const saveMultipleLeaves = (dates, { session, reason = '' }) => {
  const days = getLeaveDays(session);
  const cleanReason = reason.trim();
  const dateSet = new Set(dates);

  setLeaves(prev => {
    // Cập nhật các ngày đã tồn tại
    const updated = prev.map(r => {
      if (dateSet.has(r.date)) {
        dateSet.delete(r.date);
        return {
          ...r,
          session,
          days,
          reason: cleanReason,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    // Thêm các ngày chưa từng đăng ký
    const newRecords = Array.from(dateSet).map(d => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: d,
      session,
      days,
      reason: cleanReason,
      createdAt: new Date().toISOString()
    }));

    return [...updated, ...newRecords];
  });
};
```

### 3.2. Component `CalendarGrid.jsx`
- Nhận thêm props:
  - `isMultiSelect`: `boolean` (chế độ chọn nhiều ngày có đang bật không)
  - `selectedDates`: `string[]` (mảng `['2026-10-15', '2026-10-16', ...]`)
  - `onToggleDate`: `(dateStr: string) => void`
- Khi `isMultiSelect === true`:
  - Click vào ô ngày sẽ gọi `onToggleDate(dateStr)`.
  - Ô ngày có thêm class `cell-multiselected` nếu nằm trong `selectedDates`.
  - Không mở modal đơn lẻ khi đang ở chế độ chọn nhiều ngày.

### 3.3. Component `BulkActionBar.jsx` (hoặc tích hợp trong Calendar view)
- Thanh công cụ hiển thị khi `isMultiSelect === true`:
  - Text badge: `Đã chọn: X ngày`
  - Nút `Đăng ký X ngày`
  - Nút `Bỏ chọn tất cả` / `Thoát`

### 3.4. Component `LeaveModal.jsx`
- Mở rộng để hỗ trợ prop `dates: string[]`:
  - Nếu truyền `dates` (mảng > 1 phần tử): Chuyển sang giao diện Bulk Mode hiển thị danh sách chip ngày và nút lưu cho X ngày.
  - Nếu truyền `date` đơn lẻ: Giữ nguyên giao diện đăng ký 1 ngày hiện tại.

---

## 4. Verification & Testing Strategy

1. **Unit Tests (`useLeaves.test.js`):**
   - Test `saveMultipleLeaves`: Đăng ký 3 ngày cùng lúc (trong đó 1 ngày đã có sẵn và 2 ngày mới) -> Xác nhận ngày cũ được cập nhật và ngày mới được thêm vào, tính đúng tổng số ngày và ghi vào `localStorage`.
2. **Component Tests (`CalendarGrid.test.jsx` & `LeaveModal.test.jsx`):**
   - Test click toggle chọn ngày trong chế độ multi-select.
   - Test hiển thị nhiều ngày và xóa chip ngày trong modal.
3. **Integration Test (`App.test.jsx`):**
   - Bật chế độ chọn nhiều ngày -> Click chọn 3 ngày trên lịch -> Mở modal -> Chọn ca Chiều (0.5c) -> Lưu -> Xác nhận tổng ngày nghỉ tăng 1.5 ngày và balance cập nhật chính xác.
