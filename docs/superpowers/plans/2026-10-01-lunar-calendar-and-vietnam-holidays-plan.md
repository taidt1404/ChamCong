# Lunar Calendar & Vietnam Holidays Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị ngày Âm lịch (mùng 1, ngày rằm, ngày thường) và highlight các ngày lễ Việt Nam (cả lễ chính thức theo luật lao động và lễ truyền thống/kỷ niệm) trên lưới lịch chấm công, có nút bật/tắt (toggle).

**Architecture:** Tạo module thiên văn `lunarUtils.js` (chuyển đổi Dương lịch $\to$ Âm lịch Việt Nam GMT+7 theo thuật toán Hồ Ngọc Đức); tạo module `holidayData.js` chứa danh mục ngày lễ và hàm `getHoliday`; nâng cấp `CalendarGrid.jsx` hiển thị ngày âm và badge lễ; thêm toggle switch trong `App.jsx` và lưu tùy chọn vào `localStorage`.

**Tech Stack:** React 18, Vite, Vitest, React Testing Library, Vanilla CSS.

## Global Constraints

- Chuyển đổi Âm lịch chuẩn xác theo múi giờ Việt Nam (GMT+7).
- Ngày mùng 1 đầu tháng âm hiển thị `${lunarDay}/${lunarMonth}`. Ngày khác hiển thị `${lunarDay}`.
- Highlight ngày lễ phân chia 2 nhóm: `official` (Lễ chính thức: Tết DL, Tết Nguyên Đán, Giỗ Tổ 10/3, 30/4, 1/5, Quốc Khánh 2/9) và `commemorative` (Lễ truyền thống/kỷ niệm: Trung thu, 8/3, 20/10, 20/11...).
- Nút bật/tắt Lịch Âm & Ngày Lễ ghi nhớ trạng thái trong `localStorage` với key `leave_planner_show_lunar`. Mặc định: `true`.
- 100% test coverage cho các hàm tiện ích mới và kiểm thử tích hợp UI không làm hỏng tính năng đăng ký nghỉ phép hiện có.

---

### Task 1: Module Chuyển Đổi Âm Lịch `lunarUtils.js` và Unit Tests

**Files:**
- Create: `src/utils/lunarUtils.js`
- Create: `src/utils/lunarUtils.test.js`

**Interfaces:**
- Produces:
  - `convertSolarToLunar(dd: number, mm: number, yyyy: number, timeZone?: number): { lunarDay: number, lunarMonth: number, lunarYear: number, isLeap: boolean }`
  - `formatLunarDay(lunarObj: { lunarDay: number, lunarMonth: number, isLeap?: boolean }): string`

- [ ] **Step 1: Viết test cho `lunarUtils.test.js`**

```javascript
import { describe, it, expect } from 'vitest';
import { convertSolarToLunar, formatLunarDay } from './lunarUtils';

describe('lunarUtils', () => {
  it('correctly converts key lunar dates', () => {
    // Tết Giáp Thìn 2024: 10/02/2024 -> 01/01 Giáp Thìn
    const tet2024 = convertSolarToLunar(10, 2, 2024);
    expect(tet2024.lunarDay).toBe(1);
    expect(tet2024.lunarMonth).toBe(1);
    expect(tet2024.lunarYear).toBe(2024);

    // Tết Ất Tỵ 2025: 29/01/2025 -> 01/01 Ất Tỵ
    const tet2025 = convertSolarToLunar(29, 1, 2025);
    expect(tet2025.lunarDay).toBe(1);
    expect(tet2025.lunarMonth).toBe(1);

    // Tết Bính Ngọ 2026: 17/02/2026 -> 01/01 Bính Ngọ
    const tet2026 = convertSolarToLunar(17, 2, 2026);
    expect(tet2026.lunarDay).toBe(1);
    expect(tet2026.lunarMonth).toBe(1);

    // Giỗ Tổ Hùng Vương 2026 (10/03 AL) rơi vào ngày 26/04/2026 DL
    const gioTo2026 = convertSolarToLunar(26, 4, 2026);
    expect(gioTo2026.lunarDay).toBe(10);
    expect(gioTo2026.lunarMonth).toBe(3);

    // Trung Thu 2026 (15/08 AL) rơi vào ngày 25/09/2026 DL
    const trungThu2026 = convertSolarToLunar(25, 9, 2026);
    expect(trungThu2026.lunarDay).toBe(15);
    expect(trungThu2026.lunarMonth).toBe(8);
  });

  it('formats lunar day string properly', () => {
    // Ngày 1 âm hiển thị dạng 1/m
    expect(formatLunarDay({ lunarDay: 1, lunarMonth: 9 })).toBe('1/9');
    // Ngày 1 âm tháng nhuận hiển thị 1/9N
    expect(formatLunarDay({ lunarDay: 1, lunarMonth: 9, isLeap: true })).toBe('1/9N');
    // Các ngày khác chỉ hiển thị số ngày
    expect(formatLunarDay({ lunarDay: 2, lunarMonth: 9 })).toBe('2');
    expect(formatLunarDay({ lunarDay: 15, lunarMonth: 9 })).toBe('15');
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/utils/lunarUtils.test.js`
Expected: FAIL (File không tồn tại).

- [ ] **Step 3: Triển khai trong `src/utils/lunarUtils.js`**

Viết thuật toán chuyển đổi thiên văn Hồ Ngọc Đức (GMT+7) và hàm `formatLunarDay`.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/utils/lunarUtils.test.js`
Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/utils/lunarUtils.js src/utils/lunarUtils.test.js
git commit -m "feat: implement solar to Vietnamese lunar conversion utility"
```

---

### Task 2: Module Ngày Lễ Việt Nam `holidayData.js` và Unit Tests

**Files:**
- Create: `src/utils/holidayData.js`
- Create: `src/utils/holidayData.test.js`

**Interfaces:**
- Produces:
  - `getHoliday(solarDateStr: string, lunarObj: { lunarDay: number, lunarMonth: number }): { name: string, type: 'official' | 'commemorative', icon: string } | null`
  - `OFFICIAL_SOLAR_HOLIDAYS`: Record<string, { name: string, icon: string }>
  - `OFFICIAL_LUNAR_HOLIDAYS`: Record<string, { name: string, icon: string }>
  - `COMMEMORATIVE_SOLAR_HOLIDAYS`: Record<string, { name: string, icon: string }>
  - `COMMEMORATIVE_LUNAR_HOLIDAYS`: Record<string, { name: string, icon: string }>

- [ ] **Step 1: Viết test cho `holidayData.test.js`**

```javascript
import { describe, it, expect } from 'vitest';
import { getHoliday } from './holidayData';

describe('holidayData', () => {
  it('identifies official solar holidays', () => {
    const newYear = getHoliday('2026-01-01', { lunarDay: 13, lunarMonth: 11 });
    expect(newYear).toEqual({
      name: 'Tết Dương Lịch',
      type: 'official',
      icon: '🎆'
    });

    const liberationDay = getHoliday('2026-04-30', { lunarDay: 14, lunarMonth: 3 });
    expect(liberationDay).toEqual({
      name: '30/4 Giải Phóng',
      type: 'official',
      icon: '⭐'
    });

    const laborDay = getHoliday('2026-05-01', { lunarDay: 15, lunarMonth: 3 });
    expect(laborDay).toEqual({
      name: '1/5 Quốc Tế LĐ',
      type: 'official',
      icon: '👷'
    });

    const nationalDay = getHoliday('2026-09-02', { lunarDay: 22, lunarMonth: 7 });
    expect(nationalDay).toEqual({
      name: '2/9 Quốc Khánh',
      type: 'official',
      icon: '🇻🇳'
    });
  });

  it('identifies official lunar holidays (Tet & Hung Kings)', () => {
    // 10/3 AL: Giỗ Tổ Hùng Vương
    const hungKings = getHoliday('2026-04-26', { lunarDay: 10, lunarMonth: 3 });
    expect(hungKings).toEqual({
      name: 'Giỗ Tổ Hùng Vương',
      type: 'official',
      icon: '🏛️'
    });

    // Mùng 1 Tết Âm Lịch
    const lunarNewYear = getHoliday('2026-02-17', { lunarDay: 1, lunarMonth: 1 });
    expect(lunarNewYear).toEqual({
      name: 'Mùng 1 Tết Nguyên Đán',
      type: 'official',
      icon: '🧧'
    });
  });

  it('identifies commemorative holidays (Trung Thu, 20/10, etc.)', () => {
    // 20/10 Phụ Nữ VN
    const vnWomen = getHoliday('2026-10-20', { lunarDay: 10, lunarMonth: 9 });
    expect(vnWomen).toEqual({
      name: '20/10 Phụ Nữ VN',
      type: 'commemorative',
      icon: '💐'
    });

    // 15/8 AL Trung Thu
    const midAutumn = getHoliday('2026-09-25', { lunarDay: 15, lunarMonth: 8 });
    expect(midAutumn).toEqual({
      name: 'Tết Trung Thu',
      type: 'commemorative',
      icon: '🥮'
    });
  });

  it('returns null for normal days', () => {
    const regularDay = getHoliday('2026-10-14', { lunarDay: 4, lunarMonth: 9 });
    expect(regularDay).toBeNull();
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/utils/holidayData.test.js`
Expected: FAIL (File không tồn tại).

- [ ] **Step 3: Triển khai trong `src/utils/holidayData.js`**

Khai báo các bộ từ điển ngày lễ và hàm `getHoliday`.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/utils/holidayData.test.js`
Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/utils/holidayData.js src/utils/holidayData.test.js
git commit -m "feat: define Vietnam holidays dataset and lookup function"
```

---

### Task 3: Cập Nhật `CalendarGrid.jsx` và CSS Hiển Thị Lịch Âm & Badge Lễ

**Files:**
- Modify: `src/components/CalendarGrid.jsx`
- Modify: `src/components/CalendarGrid.test.jsx`
- Modify: `src/App.css`

**Interfaces:**
- Props `CalendarGrid`:
  - Thêm prop `showLunar?: boolean` (mặc định: `true`)

- [ ] **Step 1: Viết test cho `CalendarGrid.test.jsx`**

Bổ sung test case kiểm tra:
1. Khi `showLunar=true`, hiển thị số ngày âm (ví dụ `15` hoặc `1/9`) và badge ngày lễ nếu có.
2. Khi `showLunar=false`, không hiển thị class `lunar-day` hoặc badge ngày lễ.

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/components/CalendarGrid.test.jsx`
Expected: FAIL.

- [ ] **Step 3: Cập nhật `CalendarGrid.jsx` & `App.css`**

- Import `convertSolarToLunar`, `formatLunarDay` từ `../utils/lunarUtils` và `getHoliday` từ `../utils/holidayData`.
- Tính `lunarDate` và `holiday` cho từng ô lịch.
- Render thẻ `<span className={`lunar-day ${isFirstOrFullMoon ? 'lunar-highlight' : ''}`}>{lunarDisplay}</span>`.
- Render `<div className={`holiday-badge holiday-${holiday.type}`}>...</div>` phía trên ca nghỉ phép.
- Thêm styling bắt mắt trong `src/App.css` (đỏ cờ cho `official`, tím pastel cho `commemorative`, vàng rằm cho mùng 1/rằm).

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/components/CalendarGrid.test.jsx`
Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/components/CalendarGrid.jsx src/components/CalendarGrid.test.jsx src/App.css
git commit -m "feat: render lunar date and holiday badges in CalendarGrid"
```

---

### Task 4: Nút Chuyển Đổi Bật/Tắt (Toggle) trong `App.jsx`, Lưu LocalStorage & Integration Tests

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

**Interfaces:**
- `showLunar` state lưu trong `localStorage` với key `leave_planner_show_lunar`.
- Button toggle nằm ở thanh công cụ: `🌙 Lịch Âm & Ngày Lễ`.

- [ ] **Step 1: Viết test integration trong `src/App.test.jsx`**

```jsx
  it('toggles lunar calendar and holiday badges on and off', () => {
    render(<App />);

    // Kiểm tra toggle switch tồn tại
    const toggleBtn = screen.getByRole('button', { name: /Lịch Âm & Ngày Lễ/i });
    expect(toggleBtn).toBeInTheDocument();

    // Click để tắt
    fireEvent.click(toggleBtn);
    // Badge âm lịch không còn xuất hiện hoặc toggle chuyển sang trạng thái tắt
    expect(localStorage.getItem('leave_planner_show_lunar')).toBe('false');

    // Click bật lại
    fireEvent.click(toggleBtn);
    expect(localStorage.getItem('leave_planner_show_lunar')).toBe('true');
  });
```

- [ ] **Step 2: Triển khai trong `src/App.jsx`**

- Khởi tạo `showLunar` từ `localStorage.getItem('leave_planner_show_lunar') !== 'false'`.
- Nút toggle trong header / toolbar.
- Truyền `showLunar` vào `<CalendarGrid />`.

- [ ] **Step 3: Chạy toàn bộ test suite**

Run: `npm run test`
Expected: Tất cả các bài test (30+ tests) đều PASS.

- [ ] **Step 4: Kiểm tra build sản phẩm**

Run: `npm run build`
Expected: Build Vite thành công.

- [ ] **Step 5: Commit Task 4 và đẩy lên GitHub**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: complete lunar calendar and Vietnam holidays display with toggle control"
git push origin main
```
