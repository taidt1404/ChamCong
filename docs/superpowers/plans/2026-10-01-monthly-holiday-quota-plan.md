# Monthly Holiday Quota (Tùy Chỉnh Ngày Nghỉ Lễ Theo Tháng) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm khả năng cấu hình số ngày nghỉ lễ được cộng thêm cho từng tháng cụ thể (ví dụ: Chuẩn 4 ngày + 1 hoặc 2 ngày lễ = 5 hay 6 ngày), tự động nhớ theo từng tháng và cập nhật cân đối Âm/Dương công.

**Architecture:** Bổ sung tham số `holidayBonus` vào `calculateMonthlyBalance`; quản lý `monthlyQuotas` trong `useLeaves.js` lưu LocalStorage; tạo `HolidayModal.jsx` để chọn nhanh +1, +2 ngày lễ; cập nhật `StatsOverview.jsx` và tích hợp vào `App.jsx`.

**Tech Stack:** React 18, Vite, Vitest, React Testing Library, Vanilla CSS.

## Global Constraints

- Hạn mức cơ sở mặc định: 4.0 ngày/tháng.
- Hạn mức thực tế: $\text{Quota} = 4.0 + \text{holidayBonus}$.
- Cân đối công: $B = \text{Quota} - \text{Đã nghỉ}$.
- Lưu trữ riêng biệt từng tháng dạng `{"2026-04": 2, "2026-09": 1}` với key `leave_planner_monthly_quotas_v1`.
- Không làm ảnh hưởng đến các tháng khác (các tháng không chỉnh vẫn có hạn mức 4.0 ngày).

---

### Task 1: Cập Nhật `calendarUtils.js` để Hỗ Trợ `holidayBonus` và Unit Tests

**Files:**
- Modify: `src/utils/calendarUtils.js`
- Test: `src/utils/calendarUtils.test.js`

**Interfaces:**
- Produces: `calculateMonthlyBalance(records, year, month, holidayBonus = 0): { baseQuota: 4.0, holidayBonus: number, quota: number, usedDays: number, balance: number, status: string, ... }`

- [x] **Step 1: Viết test cho `calculateMonthlyBalance` với `holidayBonus` trong `src/utils/calendarUtils.test.js`**

```javascript
  it('calculates monthly balance with holiday bonus days', () => {
    const mockLeaves = [
      { id: '1', date: '2026-04-10', session: 'full', days: 1.0 },
      { id: '2', date: '2026-04-15', session: 'full', days: 1.0 },
      { id: '3', date: '2026-04-20', session: 'full', days: 1.0 },
      { id: '4', date: '2026-04-25', session: 'full', days: 1.0 }
    ];
    // Tháng 4 có thêm 2 ngày lễ (30/4 - 1/5) -> hạn mức là 4 + 2 = 6 ngày
    const result = calculateMonthlyBalance(mockLeaves, 2026, 4, 2);
    expect(result.baseQuota).toBe(4.0);
    expect(result.holidayBonus).toBe(2.0);
    expect(result.quota).toBe(6.0);
    expect(result.usedDays).toBe(4.0);
    expect(result.balance).toBe(2.0); // 6.0 - 4.0 = +2.0
    expect(result.status).toBe('positive');
  });
```

- [x] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/utils/calendarUtils.test.js`
Expected: FAIL (result.quota is 4 instead of 6).

- [x] **Step 3: Triển khai trong `src/utils/calendarUtils.js`**

Cập nhật hàm `calculateMonthlyBalance`:
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

- [x] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/utils/calendarUtils.test.js`
Expected: PASS.

- [x] **Step 5: Commit Task 1**

```bash
git add src/utils/calendarUtils.js src/utils/calendarUtils.test.js
git commit -m "feat: support holidayBonus in calculateMonthlyBalance utility"
```

---

### Task 2: Quản Lý `monthlyQuotas` trong `useLeaves.js` và Unit Tests

**Files:**
- Modify: `src/hooks/useLeaves.js`
- Test: `src/hooks/useLeaves.test.js`

**Interfaces:**
- Produces:
  - `monthlyQuotas`: Record<string, number>
  - `getMonthHolidayBonus(year, month): number`
  - `setMonthHolidayBonus(year, month, bonusDays: number): void`

- [x] **Step 1: Viết test cho `setMonthHolidayBonus` trong `src/hooks/useLeaves.test.js`**

```javascript
  it('saves and retrieves monthly holiday bonus days per month', () => {
    const { result } = renderHook(() => useLeaves());

    expect(result.current.getMonthHolidayBonus(2026, 4)).toBe(0);

    act(() => {
      result.current.setMonthHolidayBonus(2026, 4, 2);
    });

    expect(result.current.getMonthHolidayBonus(2026, 4)).toBe(2);
    expect(result.current.getMonthHolidayBonus(2026, 5)).toBe(0); // Tháng khác vẫn là 0

    const stored = JSON.parse(localStorage.getItem('leave_planner_monthly_quotas_v1'));
    expect(stored['2026-04']).toBe(2);
  });
```

- [x] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/hooks/useLeaves.test.js`
Expected: FAIL (result.current.setMonthHolidayBonus is not a function).

- [x] **Step 3: Triển khai trong `src/hooks/useLeaves.js`**

Thêm `QUOTAS_STORAGE_KEY = 'leave_planner_monthly_quotas_v1'` và hàm:
- `monthlyQuotas` state khởi tạo từ `localStorage`.
- `getMonthHolidayBonus(year, month)`: trả về `monthlyQuotas[`${year}-${String(month).padStart(2, '0')}`] || 0`.
- `setMonthHolidayBonus(year, month, bonusDays)`: cập nhật `monthlyQuotas`.

- [x] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/hooks/useLeaves.test.js`
Expected: PASS.

- [x] **Step 5: Commit Task 2**

```bash
git add src/hooks/useLeaves.js src/hooks/useLeaves.test.js
git commit -m "feat: add monthly holiday quotas management to useLeaves hook"
```

---

### Task 3: Tạo Component `HolidayModal.jsx` và Unit Tests

**Files:**
- Create: `src/components/HolidayModal.jsx`
- Create: `src/components/HolidayModal.test.jsx`

**Interfaces:**
- Props `HolidayModal`:
  - `isOpen`: boolean
  - `year`: number
  - `month`: number
  - `currentBonus`: number
  - `onClose`: () => void
  - `onSave`: (bonusDays: number) => void

- [x] **Step 1: Viết test cho `HolidayModal.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HolidayModal from './HolidayModal';

describe('HolidayModal component', () => {
  it('renders and selects quick holiday bonus chip', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <HolidayModal
        isOpen={true}
        year={2026}
        month={4}
        currentBonus={0}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText(/Ngày Nghỉ Lễ Tháng 4\/2026/i)).toBeInTheDocument();
    
    // Click chip +2 ngày
    fireEvent.click(screen.getByText('+2 Ngày Lễ (Tổng 6 ngày)'));

    // Save
    fireEvent.click(screen.getByText('Lưu Thiết Lập'));
    expect(onSave).toHaveBeenCalledWith(2);
  });
});
```

- [x] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/components/HolidayModal.test.jsx`
Expected: FAIL.

- [x] **Step 3: Triển khai `src/components/HolidayModal.jsx`**

Modal cho phép chọn nhanh:
- `+0 Ngày (Chuẩn 4 ngày)`
- `+1 Ngày Lễ (Tổng 5 ngày)`
- `+2 Ngày Lễ (Tổng 6 ngày)`
- `+3 Ngày Lễ (Tổng 7 ngày)`
- Hoặc nhập số lẻ tùy chọn vào ô input.
- Nút "Lưu Thiết Lập" và "Hủy".

- [x] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/components/HolidayModal.test.jsx`
Expected: PASS.

- [x] **Step 5: Commit Task 3**

```bash
git add src/components/HolidayModal.jsx src/components/HolidayModal.test.jsx
git commit -m "feat: create HolidayModal component with quick preset chips"
```

---

### Task 4: Nâng Cấp `StatsOverview.jsx` Hiển Thị Nút Chỉnh Sửa Ngày Lễ

**Files:**
- Modify: `src/components/StatsOverview.jsx`
- Modify: `src/components/StatsOverview.test.jsx`

**Interfaces:**
- Props `StatsOverview`:
  - Thêm `onEditHolidayQuota`: () => void

- [x] **Step 1: Viết test cho nút chỉnh sửa ngày lễ trong `src/components/StatsOverview.test.jsx`**

```jsx
  it('renders holiday bonus info and triggers edit holiday callback', () => {
    const onEditHolidayQuota = vi.fn();
    const data = {
      baseQuota: 4.0,
      holidayBonus: 2.0,
      quota: 6.0,
      usedDays: 3.0,
      balance: 3.0,
      status: 'positive',
      morningCount: 0,
      afternoonCount: 0,
      fullCount: 3
    };

    render(<StatsOverview balanceData={data} onEditHolidayQuota={onEditHolidayQuota} />);
    expect(screen.getByText('6.0 ngày')).toBeInTheDocument();
    expect(screen.getByText(/Chuẩn 4.0 \+ 2.0 ngày lễ/i)).toBeInTheDocument();

    const editBtn = screen.getByLabelText(/Chỉnh sửa ngày nghỉ lễ/i);
    fireEvent.click(editBtn);
    expect(onEditHolidayQuota).toHaveBeenCalledTimes(1);
  });
```

- [x] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/components/StatsOverview.test.jsx`
Expected: FAIL.

- [x] **Step 3: Cập nhật `src/components/StatsOverview.jsx`**

- Hiển thị nút chỉnh sửa trên thẻ Hạn Mức Tháng.
- Hiển thị badge: `✨ Chuẩn 4.0 + ${holidayBonus.toFixed(1)} ngày lễ` nếu `holidayBonus > 0`.

- [x] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/components/StatsOverview.test.jsx`
Expected: PASS.

- [x] **Step 5: Commit Task 4**

```bash
git add src/components/StatsOverview.jsx src/components/StatsOverview.test.jsx
git commit -m "feat: add holiday bonus display and edit trigger to StatsOverview"
```

---

### Task 5: Ghép Nối Vào `App.jsx`, Tích Hợp Toàn Diện và Đẩy Lên GitHub

**Files:**
- Modify: `src/App.jsx`, `src/App.css`
- Test: `src/App.test.jsx`

- [x] **Step 1: Viết test integration cho holiday quota trong `src/App.test.jsx`**

```jsx
  it('allows adjusting monthly holiday quota and updates balance accordingly', () => {
    render(<App />);

    // Click nút chỉnh sửa ngày nghỉ lễ
    const editHolidayBtn = screen.getByLabelText(/Chỉnh sửa ngày nghỉ lễ/i);
    fireEvent.click(editHolidayBtn);

    // Modal holiday mở ra
    expect(screen.getByText(/Số Ngày Nghỉ Lễ/i)).toBeInTheDocument();

    // Chọn +2 ngày lễ
    fireEvent.click(screen.getByText('+2 Ngày Lễ (Tổng 6 ngày)'));

    // Lưu
    fireEvent.click(screen.getByText('Lưu Thiết Lập'));

    // Hạn mức tháng cập nhật thành 6.0 ngày
    expect(screen.getByText('6.0 ngày')).toBeInTheDocument();
    expect(screen.getByText(/Chuẩn 4.0 \+ 2.0 ngày lễ/i)).toBeInTheDocument();
    expect(screen.getByText('+6.0 CÔNG')).toBeInTheDocument();
  });
```

- [x] **Step 2: Cập nhật `src/App.jsx` và `src/App.css`**

- Lấy `holidayBonus = getMonthHolidayBonus(currentYear, currentMonth)`.
- Truyền `holidayBonus` vào `calculateMonthlyBalance(leaves, currentYear, currentMonth, holidayBonus)`.
- State `isHolidayModalOpen`, mở modal khi click vào thẻ hạn mức.
- Thêm style cho thẻ hạn mức có nút sửa, badge ngày lễ.

- [x] **Step 3: Chạy toàn bộ test suite**

Run: `npm run test`
Expected: All tests pass.

- [x] **Step 4: Chạy build kiểm tra**

Run: `npm run build`
Expected: Build thành công.

- [x] **Step 5: Commit Task 5 và đẩy lên GitHub**

```bash
git add src/App.jsx src/App.css src/App.test.jsx
git commit -m "feat: complete monthly holiday quota configuration feature"
git push origin main
```
