# Monthly Holiday Quota (Tùy Chỉnh Ngày Nghỉ Lễ Theo Tháng) Design Specification

**Author:** Antigravity  
**Date:** 2026-10-01  
**Status:** Approved  
**Feature:** Cho phép cấu hình số ngày nghỉ lễ cộng thêm vào hạn mức tháng riêng biệt từng tháng.

---

## 1. Context & Motivation

Theo quy định lao động và lịch nghỉ lễ hàng năm, một số tháng có các dịp lễ lớn (như Giỗ Tổ Hùng Vương, 30/4 - 1/5, Quốc khánh 2/9, Tết Dương lịch, Tết Nguyên Đán...) giúp người lao động được nghỉ thêm 1 - 2 ngày hoặc nhiều hơn mà vẫn hưởng lương đầy đủ.

Trước đây, hệ thống cố định hạn mức 4.0 ngày/tháng cho mọi tháng. Tính năng này cho phép người dùng tùy chỉnh số ngày nghỉ lễ cộng thêm cho từng tháng cụ thể mà không làm ảnh hưởng đến các tháng khác.

---

## 2. User Experience & Workflow

### 2.1. Thẻ "Hạn Mức Tháng" trên `StatsOverview`
- Hiển thị giá trị hạn mức thực tế của tháng đang xem:
  $$\text{Hạn mức} = 4.0 + \text{holidayBonus}$$
  (Ví dụ: `4.0 ngày`, `5.0 ngày`, `6.0 ngày`...).
- Có nút điều chỉnh nhanh: **`"+ Lễ"`** hoặc biểu tượng cài đặt/chỉnh sửa trên thẻ.
- Dòng mô tả phụ linh hoạt:
  - Nếu `holidayBonus > 0`: Hiển thị `✨ Chuẩn 4.0 + ${holidayBonus} ngày lễ`.
  - Nếu `holidayBonus === 0`: Hiển thị `Chuẩn định mức 4.0 ngày (Bấm + Lễ để thêm)`.

### 2.2. Modal / Popover Điều Chỉnh Ngày Nghỉ Lễ
- Nhấp vào nút điều chỉnh sẽ mở popover hoặc modal nhỏ:
  - Tiêu đề: **"Số Ngày Nghỉ Lễ Tháng MM/YYYY"**
  - Gợi ý chọn nhanh (Quick chips):
    - `0 ngày (Chuẩn 4 ngày)`
    - `+1 ngày (Tổng 5 ngày)`
    - `+2 ngày (Tổng 6 ngày)`
    - `+3 ngày (Tổng 7 ngày)`
    - Ô nhập số tùy ý (ví dụ `0.5`, `1.5`, `2.5`...) nếu nghỉ nửa ngày lễ.
  - Nút **"Lưu Thiết Lập"** và nút **"Hủy"**.
- Khi lưu:
  - Dữ liệu được lưu trữ riêng theo tháng (key `YYYY-MM`).
  - Toàn bộ các chỉ số của tháng đang xem cập nhật ngay:
    - Hạn mức tháng mới.
    - Cân đối công: $B = \text{Hạn mức mới} - \text{Đã nghỉ}$.
    - Trạng thái Âm/Dương/Đủ công và thanh % tiến độ.
  - Khi người dùng chuyển sang tháng khác: Tháng khác vẫn giữ nguyên hạn mức của tháng đó (mặc định 4.0 nếu chưa từng chỉnh).

---

## 3. Technical Architecture & Data Storage

### 3.1. Tiện ích `calendarUtils.js`
Cập nhật `calculateMonthlyBalance(records, year, month, holidayBonus = 0)`:
```javascript
export function calculateMonthlyBalance(records, year, month, holidayBonus = 0) {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthRecords = records.filter(r => r.date && r.date.startsWith(monthPrefix));

  let usedDays = 0;
  let morningCount = 0;
  let afternoonCount = 0;
  let fullCount = 0;

  monthRecords.forEach(r => {
    const days = Number(r.days) || getLeaveDays(r.session);
    usedDays += days;
    if (r.session === 'morning') morningCount++;
    else if (r.session === 'afternoon') afternoonCount++;
    else if (r.session === 'full') fullCount++;
  });

  const bonus = Math.max(0, Number(holidayBonus) || 0);
  const quota = Number((4.0 + bonus).toFixed(1));
  const balance = Number((quota - usedDays).toFixed(1));

  let status = 'balanced';
  if (balance > 0) status = 'positive';
  else if (balance < 0) status = 'negative';

  return {
    baseQuota: 4.0,
    holidayBonus: bonus,
    quota,
    usedDays: Number(usedDays.toFixed(1)),
    balance,
    status,
    records: monthRecords,
    morningCount,
    afternoonCount,
    fullCount
  };
}
```

### 3.2. Hook `useLeaves.js`
- Quản lý state `monthlyQuotas`:
  - Khởi tạo từ `localStorage` key `leave_planner_monthly_quotas_v1`.
  - Hàm `setMonthHolidayBonus(year, month, bonusDays)`:
    - Cập nhật key `${year}-${String(month).padStart(2, '0')}` trong `monthlyQuotas`.
    - Đồng bộ vào `localStorage`.
  - Hàm `getMonthHolidayBonus(year, month)`:
    - Trả về số ngày lễ cộng thêm (mặc định 0 nếu chưa cài đặt).

### 3.3. Component `StatsOverview.jsx`
- Nhận thêm props:
  - `onEditHolidayQuota`: `() => void`
- Hiển thị badge / nút `+ Lễ` hoặc `✏️ Sửa` cạnh giá trị Hạn mức.
- Hiển thị phân tách rõ: `Chuẩn 4.0 + X ngày lễ`.

### 3.4. Component mới `HolidayModal.jsx` (hoặc tích hợp popup)
- Modal cho phép chọn nhanh các mức +0, +1, +2, +3 hoặc nhập số ngày lễ của tháng đó.

---

## 4. Testing Strategy

1. **Unit Tests (`calendarUtils.test.js`):**
   - Test `calculateMonthlyBalance` với `holidayBonus = 2` -> `quota = 6.0`, tính đúng `balance` và trạng thái `positive`/`negative`/`balanced`.
2. **Unit Tests (`useLeaves.test.js`):**
   - Test `setMonthHolidayBonus` lưu trữ theo từng tháng và ghi nhớ vào `localStorage`.
3. **Component Tests (`StatsOverview.test.jsx`):**
   - Test hiển thị đúng `6.0 ngày` kèm `+ 2.0 ngày lễ` và tương tác bấm nút chỉnh sửa.
4. **Integration Tests (`App.test.jsx`):**
   - Chỉnh thêm 2 ngày lễ cho tháng 10 -> Hạn mức từ 4.0 thành 6.0 ngày, balance tăng thêm 2.0 công.
