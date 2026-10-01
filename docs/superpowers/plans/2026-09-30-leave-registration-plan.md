# Leave Registration System (Đăng Ký Lịch Nghỉ & Chấm Công) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng ứng dụng web bằng React (Vite) quản lý lịch nghỉ cá nhân, tự động tính toán số ngày nghỉ và chênh lệch âm/dương công hàng tháng dựa trên hạn mức chuẩn 4 ngày/tháng, lưu trữ LocalStorage và hỗ trợ xuất file Excel/JSON.

**Architecture:** Sử dụng kiến trúc React SPA với Vite, tách biệt logic nghiệp vụ (custom hook `useLeaves.js`, tiện ích lịch `calendarUtils.js`, tiện ích xuất file `exportUtils.js`) và các component giao diện (Lịch tháng, Thẻ KPI, Modal đăng ký/chỉnh sửa, Bảng danh sách).

**Tech Stack:** React 18+, Vite, Vitest, React Testing Library, Vanilla CSS với CSS Variables & Glassmorphism.

## Global Constraints

- Hạn mức chuẩn cố định: 4.0 ngày nghỉ mỗi tháng.
- Quy đổi ca: Sáng (`morning`) = 0.5 ngày; Chiều (`afternoon`) = 0.5 ngày; Cả ngày (`full`) = 1.0 ngày.
- Cân đối công: $B = 4.0 - \text{Tổng ngày nghỉ}$. $B > 0 \rightarrow$ Dương công; $B < 0 \rightarrow$ Âm công; $B = 0 \rightarrow$ Đủ công.
- Lưu trữ qua LocalStorage với key `leave_planner_records_v1`.
- Xuất CSV UTF-8 có chèn BOM `\uFEFF` để Excel hiển thị tiếng Việt không bị lỗi font.
- Môi trường Windows PowerShell: sử dụng dấu `;` khi nối lệnh thay vì `&&`.

---

### Task 1: Khởi tạo Project Vite React và Môi trường Test (Vitest)

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/test/setup.js`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: Môi trường chạy Vite + Vitest sẵn sàng cho kiểm thử và phát triển.

- [x] **Step 1: Tạo file cấu hình `package.json` với React, Vite, Vitest**

```json
{
  "name": "leave-registration-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@vitejs/plugin-react": "^4.2.1",
    "jsdom": "^24.0.0",
    "vite": "^5.2.0",
    "vitest": "^1.4.0"
  }
}
```

- [x] **Step 2: Tạo `vite.config.js` hỗ trợ test và react**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js'
  }
});
```

- [x] **Step 3: Tạo `src/test/setup.js`**

```javascript
import '@testing-library/jest-dom';
```

- [x] **Step 4: Cài đặt dependencies và tạo cấu trúc cơ bản (`index.html`, `src/main.jsx`, `src/App.jsx`)**

Chạy lệnh cài đặt:
```powershell
npm install
```

Tạo file `index.html`:
```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sổ Đăng Ký Lịch Nghỉ & Chấm Công</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

Tạo `src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Tạo `src/App.jsx` sơ khởi:
```jsx
import React from 'react';

export default function App() {
  return (
    <div className="app-container">
      <h1>Sổ Đăng Ký Lịch Nghỉ</h1>
    </div>
  );
}
```

- [x] **Step 5: Viết test cho `App.test.jsx` và chạy kiểm tra**

Tạo `src/App.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App Smoke Test', () => {
  it('renders application title', () => {
    render(<App />);
    expect(screen.getByText('Sổ Đăng Ký Lịch Nghỉ')).toBeInTheDocument();
  });
});
```

Chạy test:
```powershell
npm run test
```
Expected: 1 passed.

- [x] **Step 6: Commit code Task 1**

```powershell
git add package.json package-lock.json vite.config.js index.html src/
git commit -m "chore: setup vite react vitest testing environment"
```

---

### Task 2: Xây Dựng và Kiểm Thử Các Tiện Ích (`calendarUtils.js` & `exportUtils.js`)

**Files:**
- Create: `src/utils/calendarUtils.js`, `src/utils/exportUtils.js`
- Test: `src/utils/calendarUtils.test.js`, `src/utils/exportUtils.test.js`

**Interfaces:**
- Produces:
  - `getDaysInMonth(year, month)`: trả về mảng các ngày của tháng kèm padding trước/sau cho lưới 7 ngày (T2 -> CN).
  - `formatDate(dateStr, format)`: định dạng ngày hiển thị (VD: "15/10/2026", "Thứ Năm").
  - `getLeaveDays(session)`: `'morning' -> 0.5`, `'afternoon' -> 0.5`, `'full' -> 1.0`.
  - `calculateMonthlyBalance(records, year, month)`: `{ quota: 4, usedDays: number, balance: number, status: 'positive'|'negative'|'balanced', morningCount: number, afternoonCount: number, fullCount: number }`.
  - `exportLeavesToCSV(records, year, month)`: tạo và tải file CSV UTF-8 kèm BOM.
  - `exportLeavesToJSON(records)`: tải file JSON sao lưu.

- [x] **Step 1: Viết test cho `calendarUtils.test.js`**

```javascript
import { describe, it, expect } from 'vitest';
import { getDaysInMonth, getLeaveDays, calculateMonthlyBalance, formatDate } from './calendarUtils';

describe('calendarUtils', () => {
  it('converts session to correct work days', () => {
    expect(getLeaveDays('morning')).toBe(0.5);
    expect(getLeaveDays('afternoon')).toBe(0.5);
    expect(getLeaveDays('full')).toBe(1.0);
  });

  it('calculates monthly balance correctly when leave is less than 4 (dương công)', () => {
    const mockLeaves = [
      { id: '1', date: '2026-10-05', session: 'morning', days: 0.5 },
      { id: '2', date: '2026-10-12', session: 'full', days: 1.0 }
    ];
    const result = calculateMonthlyBalance(mockLeaves, 2026, 10);
    expect(result.quota).toBe(4);
    expect(result.usedDays).toBe(1.5);
    expect(result.balance).toBe(2.5); // 4 - 1.5 = +2.5
    expect(result.status).toBe('positive');
  });

  it('calculates monthly balance correctly when leave exceeds 4 (âm công)', () => {
    const mockLeaves = [
      { id: '1', date: '2026-10-01', session: 'full', days: 1.0 },
      { id: '2', date: '2026-10-08', session: 'full', days: 1.0 },
      { id: '3', date: '2026-10-15', session: 'full', days: 1.0 },
      { id: '4', date: '2026-10-22', session: 'full', days: 1.0 },
      { id: '5', date: '2026-10-29', session: 'morning', days: 0.5 }
    ];
    const result = calculateMonthlyBalance(mockLeaves, 2026, 10);
    expect(result.usedDays).toBe(4.5);
    expect(result.balance).toBe(-0.5); // 4 - 4.5 = -0.5
    expect(result.status).toBe('negative');
  });

  it('calculates balanced status when leave equals 4 (đủ công)', () => {
    const mockLeaves = [
      { id: '1', date: '2026-10-01', session: 'full', days: 1.0 },
      { id: '2', date: '2026-10-08', session: 'full', days: 1.0 },
      { id: '3', date: '2026-10-15', session: 'full', days: 1.0 },
      { id: '4', date: '2026-10-22', session: 'full', days: 1.0 }
    ];
    const result = calculateMonthlyBalance(mockLeaves, 2026, 10);
    expect(result.usedDays).toBe(4.0);
    expect(result.balance).toBe(0);
    expect(result.status).toBe('balanced');
  });

  it('generates correct calendar grid dates for October 2026 starting from Monday', () => {
    const grid = getDaysInMonth(2026, 10);
    expect(grid.length % 7).toBe(0);
    const oct1 = grid.find(d => d.dateStr === '2026-10-01');
    expect(oct1).toBeDefined();
    expect(oct1.isCurrentMonth).toBe(true);
  });
});
```

- [x] **Step 2: Chạy test để xác nhận FAIL**

```powershell
npm run test
```
Expected: FAIL (Cannot find module './calendarUtils').

- [x] **Step 3: Viết mã nguồn cho `src/utils/calendarUtils.js`**

```javascript
export const SESSION_LABELS = {
  morning: 'Nghỉ Sáng (0.5c)',
  afternoon: 'Nghỉ Chiều (0.5c)',
  full: 'Nghỉ Cả Ngày (1c)'
};

export function getLeaveDays(session) {
  if (session === 'morning' || session === 'afternoon') return 0.5;
  if (session === 'full') return 1.0;
  return 0;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function getDayOfWeekName(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return dayNames[day];
}

export function calculateMonthlyBalance(records, year, month) {
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

  const quota = 4.0;
  const balance = Number((quota - usedDays).toFixed(1));

  let status = 'balanced';
  if (balance > 0) status = 'positive';
  else if (balance < 0) status = 'negative';

  return {
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

export function getDaysInMonth(year, month) {
  // month: 1 - 12
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const totalDays = lastDayOfMonth.getDate();

  // JavaScript getDay(): 0 is Sunday, 1 is Monday...
  // We want Monday as index 0, Sunday as index 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const days = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 2, dayNum);
    const y = prevMonthDate.getFullYear();
    const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    days.push({
      dateStr: `${y}-${m}-${d}`,
      dayNumber: dayNum,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const m = String(month).padStart(2, '0');
    const d = String(i).padStart(2, '0');
    days.push({
      dateStr: `${year}-${m}-${d}`,
      dayNumber: i,
      isCurrentMonth: true
    });
  }

  // Next month padding to complete 7-day grid
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(year, month, i);
    const y = nextMonthDate.getFullYear();
    const m = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(i).padStart(2, '0');
    days.push({
      dateStr: `${y}-${m}-${d}`,
      dayNumber: i,
      isCurrentMonth: false
    });
  }

  return days;
}
```

- [x] **Step 4: Chạy lại test `calendarUtils.test.js` để xác nhận PASS**

```powershell
npm run test
```
Expected: PASS.

- [x] **Step 5: Viết test và mã nguồn cho `exportUtils.js`**

Tạo `src/utils/exportUtils.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { generateCSVContent } from './exportUtils';

describe('exportUtils', () => {
  it('generates UTF-8 CSV content with BOM and correct Vietnamese headers', () => {
    const mockRecords = [
      { id: '1', date: '2026-10-05', session: 'morning', days: 0.5, reason: 'Khám bác sĩ' }
    ];
    const csv = generateCSVContent(mockRecords, 2026, 10);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Ngày nghỉ');
    expect(csv).toContain('Ca nghỉ');
    expect(csv).toContain('Khám bác sĩ');
  });
});
```

Tạo `src/utils/exportUtils.js`:
```javascript
import { formatDate, getDayOfWeekName, SESSION_LABELS } from './calendarUtils';

export function generateCSVContent(records, year, month) {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthRecords = records
    .filter(r => r.date && r.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));

  const headers = ['STT', 'Ngày', 'Thứ', 'Ca nghỉ', 'Số công', 'Lý do/Ghi chú'];
  const rows = monthRecords.map((r, index) => [
    index + 1,
    formatDate(r.date),
    getDayOfWeekName(r.date),
    SESSION_LABELS[r.session] || r.session,
    r.days,
    `"${(r.reason || '').replace(/"/g, '""')}"`
  ]);

  const csvRows = [headers.join(','), ...rows.map(row => row.join(','))];
  return '\uFEFF' + csvRows.join('\r\n');
}

export function downloadCSV(records, year, month) {
  const content = generateCSVContent(records, year, month);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Lich_Nghi_Thang_${month}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(records) {
  const data = JSON.stringify(records, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Sao_Luu_Lich_Nghi_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

- [x] **Step 6: Chạy test và Commit Task 2**

```powershell
npm run test
git add src/utils/
git commit -m "feat: add calendar and export utilities with unit tests"
```

---

### Task 3: Quản Lý Trạng Thái Dữ Liệu (`useLeaves.js` Custom Hook)

**Files:**
- Create: `src/hooks/useLeaves.js`
- Test: `src/hooks/useLeaves.test.js`

**Interfaces:**
- Produces `useLeaves()`:
  - `leaves`: Mảng tất cả `LeaveRecord`.
  - `addLeave({ date, session, reason })`: Thêm lịch nghỉ mới.
  - `updateLeave(id, { date, session, reason })`: Chỉnh sửa lịch nghỉ.
  - `deleteLeave(id)`: Xóa lịch nghỉ.
  - `getLeaveByDate(dateStr)`: Lấy các bản ghi của ngày đó.
  - `importLeaves(importedArray)`: Nạp dữ liệu từ file sao lưu JSON.
  - `clearAllLeaves()`: Xóa toàn bộ dữ liệu.

- [x] **Step 1: Viết test cho `useLeaves.test.js`**

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLeaves, STORAGE_KEY } from './useLeaves';

describe('useLeaves hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty leaves or localStorage data', () => {
    const { result } = renderHook(() => useLeaves());
    expect(result.current.leaves).toEqual([]);
  });

  it('adds a leave record and persists to localStorage', () => {
    const { result } = renderHook(() => useLeaves());

    act(() => {
      result.current.addLeave({
        date: '2026-10-05',
        session: 'morning',
        reason: 'Khám răng'
      });
    });

    expect(result.current.leaves.length).toBe(1);
    expect(result.current.leaves[0].days).toBe(0.5);
    expect(result.current.leaves[0].reason).toBe('Khám răng');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.length).toBe(1);
    expect(stored[0].date).toBe('2026-10-05');
  });

  it('updates an existing leave record', () => {
    const { result } = renderHook(() => useLeaves());

    let recordId;
    act(() => {
      const rec = result.current.addLeave({
        date: '2026-10-05',
        session: 'morning',
        reason: 'Khám răng'
      });
      recordId = rec.id;
    });

    act(() => {
      result.current.updateLeave(recordId, {
        date: '2026-10-05',
        session: 'full',
        reason: 'Nghỉ cả ngày khám bệnh'
      });
    });

    const updated = result.current.leaves.find(l => l.id === recordId);
    expect(updated.session).toBe('full');
    expect(updated.days).toBe(1.0);
    expect(updated.reason).toBe('Nghỉ cả ngày khám bệnh');
  });

  it('deletes a leave record', () => {
    const { result } = renderHook(() => useLeaves());

    let recordId;
    act(() => {
      const rec = result.current.addLeave({
        date: '2026-10-05',
        session: 'afternoon',
        reason: 'Đi việc riêng'
      });
      recordId = rec.id;
    });

    expect(result.current.leaves.length).toBe(1);

    act(() => {
      result.current.deleteLeave(recordId);
    });

    expect(result.current.leaves.length).toBe(0);
  });
});
```

- [x] **Step 2: Viết mã nguồn cho `src/hooks/useLeaves.js`**

```javascript
import { useState, useEffect } from 'react';
import { getLeaveDays } from '../utils/calendarUtils';

export const STORAGE_KEY = 'leave_planner_records_v1';

export function useLeaves() {
  const [leaves, setLeaves] = useState(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (e) {
      console.error('Failed to load leaves from localStorage', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leaves));
    } catch (e) {
      console.error('Failed to persist leaves to localStorage', e);
    }
  }, [leaves]);

  const addLeave = ({ date, session, reason = '' }) => {
    const newRecord = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date,
      session,
      days: getLeaveDays(session),
      reason: reason.trim(),
      createdAt: new Date().toISOString()
    };
    setLeaves(prev => [...prev, newRecord]);
    return newRecord;
  };

  const updateLeave = (id, { date, session, reason = '' }) => {
    setLeaves(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              date,
              session,
              days: getLeaveDays(session),
              reason: reason.trim(),
              updatedAt: new Date().toISOString()
            }
          : r
      )
    );
  };

  const deleteLeave = id => {
    setLeaves(prev => prev.filter(r => r.id !== id));
  };

  const getLeaveByDate = dateStr => {
    return leaves.filter(r => r.date === dateStr);
  };

  const importLeaves = importedArray => {
    if (!Array.isArray(importedArray)) {
      throw new Error('Dữ liệu không đúng định dạng mảng');
    }
    const validated = importedArray.filter(
      r => r && typeof r.date === 'string' && ['morning', 'afternoon', 'full'].includes(r.session)
    ).map(r => ({
      ...r,
      id: r.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      days: getLeaveDays(r.session)
    }));

    setLeaves(validated);
    return validated.length;
  };

  const clearAllLeaves = () => {
    setLeaves([]);
  };

  return {
    leaves,
    addLeave,
    updateLeave,
    deleteLeave,
    getLeaveByDate,
    importLeaves,
    clearAllLeaves
  };
}
```

- [x] **Step 3: Chạy test kiểm thử cho `useLeaves`**

```powershell
npm run test
```
Expected: PASS.

- [x] **Step 4: Commit Task 3**

```powershell
git add src/hooks/
git commit -m "feat: add useLeaves custom hook with localStorage sync"
```

---

### Task 4: Xây Dựng Hệ Thống Design CSS & Component Header, MonthNavigator

**Files:**
- Create: `src/index.css`, `src/App.css`, `src/components/Header.jsx`, `src/components/MonthNavigator.jsx`
- Test: `src/components/MonthNavigator.test.jsx`

**Interfaces:**
- Produces:
  - Hệ thống Design System màu sắc (Dark/Light Slate hiện đại, Neon accents, Glassmorphism, Micro-animations).
  - `Header`: Tiêu đề + Action buttons (Xuất CSV, Sao lưu JSON).
  - `MonthNavigator`: Điều hướng `< Tháng trước`, `Tháng MM/YYYY`, `Tháng sau >`, nút `Hôm nay`.

- [x] **Step 1: Viết test cho `MonthNavigator.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MonthNavigator from './MonthNavigator';

describe('MonthNavigator component', () => {
  it('renders current selected month and year', () => {
    const handlePrev = vi.fn();
    const handleNext = vi.fn();
    const handleToday = vi.fn();

    render(
      <MonthNavigator
        year={2026}
        month={10}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        onToday={handleToday}
      />
    );

    expect(screen.getByText('Tháng 10 / 2026')).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Tháng trước'));
    expect(handlePrev).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Tháng sau'));
    expect(handleNext).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Hôm nay'));
    expect(handleToday).toHaveBeenCalledTimes(1);
  });
});
```

- [x] **Step 2: Viết `src/index.css` với Theme hiện đại cao cấp**

```css
:root {
  --font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  --bg-primary: #0f172a;
  --bg-surface: #1e293b;
  --bg-surface-hover: #334155;
  --bg-card: rgba(30, 41, 59, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
  --border-focus: #38bdf8;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --color-morning: #f59e0b;
  --color-morning-bg: rgba(245, 158, 11, 0.15);
  --color-afternoon: #8b5cf6;
  --color-afternoon-bg: rgba(139, 92, 246, 0.15);
  --color-full: #ef4444;
  --color-full-bg: rgba(239, 68, 68, 0.15);

  --color-positive: #10b981;
  --color-positive-bg: rgba(16, 185, 129, 0.15);
  --color-negative: #f43f5e;
  --color-negative-bg: rgba(244, 63, 94, 0.15);
  --color-balanced: #0ea5e9;
  --color-balanced-bg: rgba(14, 165, 233, 0.15);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  --shadow-glow: 0 0 25px rgba(56, 189, 248, 0.15);
  --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  background-image: 
    radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.08) 0px, transparent 50%);
  background-attachment: fixed;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  transition: var(--transition);
}

input, textarea, select {
  font-family: inherit;
  color: inherit;
}
```

- [x] **Step 3: Viết `src/components/Header.jsx` và `src/components/MonthNavigator.jsx`**

Tạo `src/components/Header.jsx`:
```jsx
import React from 'react';

export default function Header({ onExportCSV, onOpenBackup }) {
  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div>
          <h1 className="brand-title">Sổ Đăng Ký Lịch Nghỉ & Chấm Công</h1>
          <p className="brand-subtitle">Chuẩn 4 ngày nghỉ/tháng • Tự động tính Âm / Dương công</p>
        </div>
      </div>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onExportCSV} title="Xuất báo cáo Excel tháng này">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Xuất Excel (.csv)
        </button>
        <button className="btn btn-secondary" onClick={onOpenBackup} title="Sao lưu / Phục hồi dữ liệu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Sao lưu / Nạp dữ liệu
        </button>
      </div>
    </header>
  );
}
```

Tạo `src/components/MonthNavigator.jsx`:
```jsx
import React from 'react';

export default function MonthNavigator({ year, month, onPrevMonth, onNextMonth, onToday }) {
  return (
    <div className="month-navigator">
      <div className="nav-controls">
        <button className="btn-icon" onClick={onPrevMonth} aria-label="Tháng trước" title="Tháng trước">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2 className="current-month-display">
          Tháng {month} / {year}
        </h2>
        <button className="btn-icon" onClick={onNextMonth} aria-label="Tháng sau" title="Tháng sau">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      <button className="btn btn-sm btn-ghost" onClick={onToday}>
        Hôm nay
      </button>
    </div>
  );
}
```

- [x] **Step 4: Chạy test và Commit Task 4**

```powershell
npm run test
git add src/index.css src/components/Header.jsx src/components/MonthNavigator.jsx src/components/MonthNavigator.test.jsx
git commit -m "feat: add design tokens, Header, and MonthNavigator components"
```

---

### Task 5: Xây Dựng Component Thống Kê KPI (StatsOverview) và Lịch Tháng (CalendarGrid)

**Files:**
- Create: `src/components/StatsOverview.jsx`, `src/components/CalendarGrid.jsx`
- Test: `src/components/StatsOverview.test.jsx`, `src/components/CalendarGrid.test.jsx`

**Interfaces:**
- Produces:
  - `StatsOverview({ balanceData })`: Thẻ Hạn mức, Đã nghỉ, Trạng thái Âm/Dương công và thanh % tiến độ.
  - `CalendarGrid({ year, month, leaves, onSelectDate, onEditLeave })`: Lưới 7 ngày tương tác, gắn badge ca nghỉ (Sáng, Chiều, Cả ngày) và ngày hôm nay.

- [x] **Step 1: Viết test cho `StatsOverview.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import StatsOverview from './StatsOverview';

describe('StatsOverview component', () => {
  it('renders positive balance (dương công) correctly', () => {
    const data = {
      quota: 4.0,
      usedDays: 2.5,
      balance: 1.5,
      status: 'positive',
      morningCount: 1,
      afternoonCount: 0,
      fullCount: 2
    };

    render(<StatsOverview balanceData={data} />);
    expect(screen.getByText('4.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('2.5 ngày')).toBeInTheDocument();
    expect(screen.getByText('+1.5 CÔNG')).toBeInTheDocument();
    expect(screen.getByText(/Dương công/i)).toBeInTheDocument();
  });

  it('renders negative balance (âm công) correctly', () => {
    const data = {
      quota: 4.0,
      usedDays: 5.0,
      balance: -1.0,
      status: 'negative',
      morningCount: 0,
      afternoonCount: 0,
      fullCount: 5
    };

    render(<StatsOverview balanceData={data} />);
    expect(screen.getByText('5.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('-1.0 CÔNG')).toBeInTheDocument();
    expect(screen.getByText(/Âm công/i)).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Viết mã nguồn cho `src/components/StatsOverview.jsx`**

```jsx
import React from 'react';

export default function StatsOverview({ balanceData }) {
  const { quota, usedDays, balance, status, morningCount, afternoonCount, fullCount } = balanceData;

  const getStatusBadge = () => {
    if (status === 'positive') {
      return {
        label: 'DƯƠNG CÔNG',
        sub: `Dư ${balance} ngày nghỉ trong tháng`,
        badgeClass: 'badge-positive',
        valueDisplay: `+${balance} CÔNG`
      };
    }
    if (status === 'negative') {
      return {
        label: 'ÂM CÔNG',
        sub: `Vượt hạn mức ${Math.abs(balance)} ngày`,
        badgeClass: 'badge-negative',
        valueDisplay: `${balance} CÔNG`
      };
    }
    return {
      label: 'ĐỦ CÔNG',
      sub: 'Đạt đúng hạn mức 4.0 ngày',
      badgeClass: 'badge-balanced',
      valueDisplay: '0.0 CÔNG'
    };
  };

  const statusInfo = getStatusBadge();
  const percentage = Math.min(Math.round((usedDays / quota) * 100), 100);

  return (
    <div className="stats-container">
      {/* Card 1: Hạn mức */}
      <div className="stat-card">
        <span className="stat-label">Hạn Mức Tháng</span>
        <div className="stat-value">{quota.toFixed(1)} ngày</div>
        <span className="stat-desc">Tiêu chuẩn định mức cố định</span>
      </div>

      {/* Card 2: Đã nghỉ */}
      <div className="stat-card">
        <span className="stat-label">Đã Đăng Ký Nghỉ</span>
        <div className="stat-value">{usedDays.toFixed(1)} ngày</div>
        <span className="stat-desc">
          {fullCount > 0 && `${fullCount} ngày full `}
          {(morningCount > 0 || afternoonCount > 0) && `(${morningCount + afternoonCount} ca nửa buổi)`}
          {usedDays === 0 && 'Chưa đăng ký ngày nào'}
        </span>
      </div>

      {/* Card 3: Cân đối công */}
      <div className={`stat-card stat-card-highlight ${statusInfo.badgeClass}`}>
        <div className="stat-badge-header">
          <span className="stat-label">Trạng Thái Công</span>
          <span className="status-pill">{statusInfo.label}</span>
        </div>
        <div className="stat-value highlight-value">{statusInfo.valueDisplay}</div>
        <span className="stat-desc">{statusInfo.sub}</span>
      </div>

      {/* Card 4: Thanh tiến độ sử dụng */}
      <div className="stat-card progress-card">
        <div className="progress-header">
          <span className="stat-label">Tỷ Lệ Đã Nghỉ</span>
          <span className="progress-percent">{percentage}%</span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${status === 'negative' ? 'progress-exceeded' : ''}`}
            style={{ width: `${Math.min((usedDays / quota) * 100, 100)}%` }}
          />
        </div>
        <span className="stat-desc">
          {usedDays > quota ? `Đã dùng vượt ${usedDays - quota} ngày` : `Còn lại ${balance} ngày nghỉ`}
        </span>
      </div>
    </div>
  );
}
```

- [x] **Step 3: Viết test cho `CalendarGrid.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CalendarGrid from './CalendarGrid';

describe('CalendarGrid component', () => {
  it('renders days and handles date click', () => {
    const onSelectDate = vi.fn();
    const onEditLeave = vi.fn();
    const leaves = [
      { id: 'l1', date: '2026-10-15', session: 'morning', days: 0.5, reason: 'Nghỉ sáng' }
    ];

    render(
      <CalendarGrid
        year={2026}
        month={10}
        leaves={leaves}
        onSelectDate={onSelectDate}
        onEditLeave={onEditLeave}
      />
    );

    expect(screen.getByText('Thứ 2')).toBeInTheDocument();
    expect(screen.getByText('Chủ Nhật')).toBeInTheDocument();

    const leaveBadge = screen.getByText(/Nghỉ Sáng/i);
    expect(leaveBadge).toBeInTheDocument();

    fireEvent.click(leaveBadge);
    expect(onEditLeave).toHaveBeenCalledWith(leaves[0]);
  });
});
```

- [x] **Step 4: Viết mã nguồn cho `src/components/CalendarGrid.jsx`**

```jsx
import React from 'react';
import { getDaysInMonth } from '../utils/calendarUtils';

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function CalendarGrid({ year, month, leaves, onSelectDate, onEditLeave }) {
  const days = getDaysInMonth(year, month);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-weekdays">
        {WEEKDAYS.map(day => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((dayItem, idx) => {
          const { dateStr, dayNumber, isCurrentMonth } = dayItem;
          const isToday = dateStr === todayStr;
          const dayLeaves = leaves.filter(l => l.date === dateStr);

          return (
            <div
              key={`${dateStr}-${idx}`}
              className={`calendar-cell ${!isCurrentMonth ? 'cell-other-month' : ''} ${
                isToday ? 'cell-today' : ''
              }`}
              onClick={() => onSelectDate(dateStr)}
            >
              <div className="cell-header">
                <span className={`day-number ${isToday ? 'day-number-today' : ''}`}>
                  {dayNumber}
                </span>
                {isToday && <span className="today-badge">Hôm nay</span>}
              </div>

              <div className="cell-content">
                {dayLeaves.map(leave => (
                  <div
                    key={leave.id}
                    className={`leave-badge badge-session-${leave.session}`}
                    onClick={e => {
                      e.stopPropagation();
                      onEditLeave(leave);
                    }}
                    title={`${leave.reason ? `${leave.reason} - ` : ''}Bấm để sửa/xóa`}
                  >
                    <span className="badge-icon">
                      {leave.session === 'morning' && '🌅'}
                      {leave.session === 'afternoon' && '🌆'}
                      {leave.session === 'full' && '☀️'}
                    </span>
                    <span className="badge-text">
                      {leave.session === 'morning' && 'Sáng 0.5c'}
                      {leave.session === 'afternoon' && 'Chiều 0.5c'}
                      {leave.session === 'full' && 'Cả ngày 1c'}
                    </span>
                    {leave.reason && <span className="badge-reason">• {leave.reason}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [x] **Step 5: Chạy test và Commit Task 5**

```powershell
npm run test
git add src/components/StatsOverview.jsx src/components/StatsOverview.test.jsx src/components/CalendarGrid.jsx src/components/CalendarGrid.test.jsx
git commit -m "feat: add StatsOverview and CalendarGrid components"
```

---

### Task 6: Xây Dựng LeaveModal (Thêm/Sửa/Xóa) và LeaveListTable (Bảng Chi Tiết)

**Files:**
- Create: `src/components/LeaveModal.jsx`, `src/components/LeaveListTable.jsx`
- Test: `src/components/LeaveModal.test.jsx`, `src/components/LeaveListTable.test.jsx`

**Interfaces:**
- Produces:
  - `LeaveModal({ isOpen, initialData, date, onClose, onSave, onDelete })`: Modal chọn ca Sáng/Chiều/Cả ngày, nhập lý do, nút Lưu/Xóa.
  - `LeaveListTable({ records, onEdit, onDelete })`: Bảng danh sách chi tiết các ngày nghỉ trong tháng.

- [x] **Step 1: Viết test cho `LeaveModal.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LeaveModal from './LeaveModal';

describe('LeaveModal component', () => {
  it('renders in create mode and submits new leave', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <LeaveModal
        isOpen={true}
        date="2026-10-15"
        initialData={null}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText(/Đăng Ký Lịch Nghỉ/i)).toBeInTheDocument();
    expect(screen.getByText('15/10/2026')).toBeInTheDocument();

    // Select buổi chiều
    fireEvent.click(screen.getByLabelText(/Buổi Chiều/i));

    // Type reason
    const reasonInput = screen.getByPlaceholderText(/Nhập lý do/i);
    fireEvent.change(reasonInput, { target: { value: 'Đi việc cá nhân' } });

    // Submit
    fireEvent.click(screen.getByText('Lưu Lịch Nghỉ'));

    expect(onSave).toHaveBeenCalledWith({
      date: '2026-10-15',
      session: 'afternoon',
      reason: 'Đi việc cá nhân'
    });
  });

  it('renders in edit mode and allows delete', () => {
    const onSave = vi.fn();
    const onDelete = vi.fn();
    const onClose = vi.fn();
    const existing = {
      id: 'rec_1',
      date: '2026-10-15',
      session: 'full',
      reason: 'Khám sức khỏe'
    };

    render(
      <LeaveModal
        isOpen={true}
        date="2026-10-15"
        initialData={existing}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/Chỉnh Sửa Lịch Nghỉ/i)).toBeInTheDocument();
    const deleteBtn = screen.getByText('Xóa Lịch Này');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('rec_1');
  });
});
```

- [x] **Step 2: Viết mã nguồn cho `src/components/LeaveModal.jsx`**

```jsx
import React, { useState, useEffect } from 'react';
import { formatDate, getDayOfWeekName } from '../utils/calendarUtils';

const QUICK_REASONS = ['Việc gia đình', 'Khám sức khỏe', 'Đi du lịch', 'Việc cá nhân', 'Nghỉ ngơi'];

export default function LeaveModal({ isOpen, date, initialData, onClose, onSave, onDelete }) {
  const [session, setSession] = useState('full');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (initialData) {
      setSession(initialData.session || 'full');
      setReason(initialData.reason || '');
    } else {
      setSession('full');
      setReason('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      date,
      session,
      reason
    });
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{isEditing ? 'Chỉnh Sửa Lịch Nghỉ' : 'Đăng Ký Lịch Nghỉ'}</h3>
            <p className="modal-date">
              {getDayOfWeekName(date)}, {formatDate(date)}
            </p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn ca nghỉ:</label>
            <div className="session-options">
              <label className={`session-card ${session === 'morning' ? 'active morning' : ''}`}>
                <input
                  type="radio"
                  name="session"
                  value="morning"
                  checked={session === 'morning'}
                  onChange={() => setSession('morning')}
                />
                <span className="session-icon">🌅</span>
                <span className="session-name">Buổi Sáng</span>
                <span className="session-value">0.5 công</span>
              </label>

              <label className={`session-card ${session === 'afternoon' ? 'active afternoon' : ''}`}>
                <input
                  type="radio"
                  name="session"
                  value="afternoon"
                  checked={session === 'afternoon'}
                  onChange={() => setSession('afternoon')}
                />
                <span className="session-icon">🌆</span>
                <span className="session-name">Buổi Chiều</span>
                <span className="session-value">0.5 công</span>
              </label>

              <label className={`session-card ${session === 'full' ? 'active full' : ''}`}>
                <input
                  type="radio"
                  name="session"
                  value="full"
                  checked={session === 'full'}
                  onChange={() => setSession('full')}
                />
                <span className="session-icon">☀️</span>
                <span className="session-name">Cả Ngày</span>
                <span className="session-value">1.0 công</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lý do / Ghi chú:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập lý do (VD: Đi khám bệnh, đám cưới...)"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <div className="quick-reasons">
              {QUICK_REASONS.map(qr => (
                <button
                  type="button"
                  key={qr}
                  className="chip-btn"
                  onClick={() => setReason(qr)}
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            {isEditing && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(initialData.id)}
              >
                Xóa Lịch Này
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Cập Nhật' : 'Lưu Lịch Nghỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [x] **Step 3: Viết `src/components/LeaveListTable.jsx` và test**

Tạo `src/components/LeaveListTable.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LeaveListTable from './LeaveListTable';

describe('LeaveListTable component', () => {
  it('renders records and edit/delete actions', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const records = [
      { id: '1', date: '2026-10-05', session: 'morning', days: 0.5, reason: 'Khám răng' }
    ];

    render(<LeaveListTable records={records} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('05/10/2026')).toBeInTheDocument();
    expect(screen.getByText('Khám răng')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Sửa'));
    expect(onEdit).toHaveBeenCalledWith(records[0]);

    fireEvent.click(screen.getByText('Xóa'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('renders empty state when no records', () => {
    render(<LeaveListTable records={[]} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/Chưa có lịch nghỉ nào được đăng ký trong tháng này/i)).toBeInTheDocument();
  });
});
```

Tạo `src/components/LeaveListTable.jsx`:
```jsx
import React from 'react';
import { formatDate, getDayOfWeekName, SESSION_LABELS } from '../utils/calendarUtils';

export default function LeaveListTable({ records, onEdit, onDelete }) {
  if (!records || records.length === 0) {
    return (
      <div className="empty-table-state">
        <p>Chưa có lịch nghỉ nào được đăng ký trong tháng này.</p>
        <span className="empty-hint">Bấm vào bất kỳ ngày nào trên lịch để đăng ký nghỉ!</span>
      </div>
    );
  }

  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="table-responsive">
      <table className="leave-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ngày Nghỉ</th>
            <th>Thứ</th>
            <th>Ca Nghỉ</th>
            <th>Số Công</th>
            <th>Lý Do / Ghi Chú</th>
            <th className="th-actions">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((r, idx) => (
            <tr key={r.id}>
              <td>{idx + 1}</td>
              <td className="font-semibold">{formatDate(r.date)}</td>
              <td>{getDayOfWeekName(r.date)}</td>
              <td>
                <span className={`table-session-tag tag-${r.session}`}>
                  {r.session === 'morning' && '🌅 Sáng (0.5c)'}
                  {r.session === 'afternoon' && '🌆 Chiều (0.5c)'}
                  {r.session === 'full' && '☀️ Cả ngày (1c)'}
                </span>
              </td>
              <td>{r.days}</td>
              <td className="td-reason">{r.reason || '—'}</td>
              <td className="td-actions">
                <button className="btn-action edit" onClick={() => onEdit(r)} title="Sửa">
                  Sửa
                </button>
                <button className="btn-action delete" onClick={() => onDelete(r.id)} title="Xóa">
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [x] **Step 4: Chạy test và Commit Task 6**

```powershell
npm run test
git add src/components/LeaveModal.jsx src/components/LeaveModal.test.jsx src/components/LeaveListTable.jsx src/components/LeaveListTable.test.jsx
git commit -m "feat: add LeaveModal and LeaveListTable components"
```

---

### Task 7: BackupModal, Hoàn Thiện Style `App.css`, Ghép Nối Toàn Bộ App và Kiểm Thử Toàn Diện

**Files:**
- Create: `src/components/BackupModal.jsx`
- Modify: `src/App.css`, `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: Ứng dụng hoàn chỉnh, đầy đủ tính năng: Đăng ký lịch nghỉ, Chấm công chuẩn 4 ngày, Âm/Dương công tức thì, Đổi tháng, Xuất CSV tiếng Việt chuẩn, Sao lưu/Khôi phục JSON.

- [x] **Step 1: Viết `src/components/BackupModal.jsx`**

```jsx
import React, { useState } from 'react';
import { downloadJSON } from '../utils/exportUtils';

export default function BackupModal({ isOpen, leaves, onClose, onImport, onClearAll }) {
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result);
        const count = onImport(parsed);
        setImportStatus(`Đã nạp thành công ${count} bản ghi!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err) {
        setImportStatus('Lỗi: File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card backup-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Sao Lưu & Khôi Phục Dữ Liệu</h3>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="backup-sections">
          <div className="backup-card">
            <h4>Xuất file dữ liệu dự phòng (JSON)</h4>
            <p>Tải toàn bộ lịch sử ngày nghỉ về máy tính để bảo quản hoặc chuyển thiết bị.</p>
            <button className="btn btn-primary" onClick={() => downloadJSON(leaves)}>
              Tải File Sao Lưu (.json)
            </button>
          </div>

          <div className="backup-card">
            <h4>Nạp file dự phòng (Restore)</h4>
            <p>Khôi phục lại lịch nghỉ từ file .json đã sao lưu trước đó.</p>
            <input
              type="file"
              accept=".json"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="btn btn-secondary upload-btn">
              Chọn File JSON
            </label>
            {importStatus && <p className="import-status">{importStatus}</p>}
          </div>

          <div className="backup-card danger-zone">
            <h4>Xóa toàn bộ dữ liệu</h4>
            <p>Đặt lại toàn bộ lịch nghỉ về trạng thái ban đầu. Hãy cẩn thận!</p>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch nghỉ không?')) {
                  onClearAll();
                  onClose();
                }
              }}
            >
              Xóa Hết Dữ Liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [x] **Step 2: Viết hoàn chỉnh `src/App.css` (Giao diện cao cấp, Glassmorphism, Responsive)**

```css
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

/* Header */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #f8fafc, #cbd5e1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-primary {
  background: linear-gradient(135deg, #0284c7, #0369a1);
  color: #fff;
  box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}
.btn-primary:hover {
  background: linear-gradient(135deg, #0369a1, #075985);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.btn-secondary:hover {
  background: var(--bg-surface-hover);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-surface);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.4);
}
.btn-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

.btn-icon {
  background: var(--bg-surface);
  color: var(--text-primary);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}
.btn-icon:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-focus);
}

/* Month Navigator */
.month-navigator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: var(--bg-card);
  padding: 12px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
}

.nav-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-month-display {
  font-size: 1.25rem;
  font-weight: 700;
  min-width: 170px;
  text-align: center;
}

/* Stats Cards */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 18px 20px;
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.stat-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

/* Highlighted Stat Card */
.stat-card-highlight.badge-positive {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.03));
  border-color: rgba(16, 185, 129, 0.4);
}
.stat-card-highlight.badge-positive .highlight-value {
  color: var(--color-positive);
}

.stat-card-highlight.badge-negative {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(244, 63, 94, 0.03));
  border-color: rgba(244, 63, 94, 0.4);
}
.stat-card-highlight.badge-negative .highlight-value {
  color: var(--color-negative);
}

.stat-card-highlight.badge-balanced {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(14, 165, 233, 0.03));
  border-color: rgba(14, 165, 233, 0.4);
}
.stat-card-highlight.badge-balanced .highlight-value {
  color: var(--color-balanced);
}

.stat-badge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-pill {
  font-size: 0.6875rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

/* Progress card */
.progress-card .progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.progress-percent {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-secondary);
}
.progress-track {
  width: 100%;
  height: 8px;
  background: var(--bg-surface);
  border-radius: 999px;
  overflow: hidden;
  margin: 12px 0 8px;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8);
  border-radius: 999px;
  transition: width 0.4s ease;
}
.progress-fill.progress-exceeded {
  background: linear-gradient(90deg, #fb923c, #f43f5e);
}

/* Calendar */
.calendar-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 16px;
  backdrop-filter: blur(12px);
  margin-bottom: 32px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 8px;
}

.weekday-header {
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  padding: 8px 0;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-cell {
  min-height: 105px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 8px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: var(--transition);
}

.calendar-cell:hover {
  border-color: rgba(56, 189, 248, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.cell-other-month {
  opacity: 0.35;
}

.cell-today {
  border-color: #38bdf8;
  box-shadow: inset 0 0 10px rgba(56, 189, 248, 0.15);
}

.cell-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.day-number-today {
  color: #38bdf8;
  font-weight: 800;
}

.today-badge {
  font-size: 0.625rem;
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.leave-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  transition: var(--transition);
}

.leave-badge:hover {
  filter: brightness(1.15);
}

.badge-session-morning {
  background: var(--color-morning-bg);
  color: var(--color-morning);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-session-afternoon {
  background: var(--color-afternoon-bg);
  color: var(--color-afternoon);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.badge-session-full {
  background: var(--color-full-bg);
  color: var(--color-full);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-reason {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Section Table */
.section-table {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
  backdrop-filter: blur(12px);
}

.section-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 700;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

.leave-table th {
  padding: 12px 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
}

.leave-table td {
  padding: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.table-session-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tag-morning {
  background: var(--color-morning-bg);
  color: var(--color-morning);
}
.tag-afternoon {
  background: var(--color-afternoon-bg);
  color: var(--color-afternoon);
}
.tag-full {
  background: var(--color-full-bg);
  color: var(--color-full);
}

.td-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
}
.btn-action.edit {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}
.btn-action.edit:hover {
  background: rgba(56, 189, 248, 0.25);
}
.btn-action.delete {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
.btn-action.delete:hover {
  background: rgba(239, 68, 68, 0.25);
}

.empty-table-state {
  text-align: center;
  padding: 36px 20px;
  color: var(--text-secondary);
}
.empty-hint {
  display: block;
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 6px;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  padding: 24px;
  box-shadow: var(--shadow-card);
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-date {
  font-size: 0.875rem;
  color: #38bdf8;
  margin-top: 2px;
}

.btn-close {
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.25rem;
  padding: 4px;
}
.btn-close:hover {
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--text-secondary);
}

.session-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.session-card {
  border: 2px solid var(--border-color);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: var(--transition);
  text-align: center;
}

.session-card input {
  display: none;
}

.session-icon {
  font-size: 1.5rem;
  margin-bottom: 6px;
}

.session-name {
  font-size: 0.8125rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.session-value {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.session-card.active.morning {
  border-color: var(--color-morning);
  background: var(--color-morning-bg);
}

.session-card.active.afternoon {
  border-color: var(--color-afternoon);
  background: var(--color-afternoon-bg);
}

.session-card.active.full {
  border-color: var(--color-full);
  background: var(--color-full-bg);
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  margin-bottom: 10px;
}
.form-input:focus {
  border-color: var(--border-focus);
  outline: none;
}

.quick-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip-btn {
  background: var(--bg-surface-hover);
  color: var(--text-secondary);
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 999px;
}
.chip-btn:hover {
  color: var(--text-primary);
  background: #475569;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
}

/* Backup Modal Specifics */
.backup-modal-card {
  max-width: 520px;
}
.backup-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.backup-card {
  background: var(--bg-surface);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.backup-card h4 {
  font-size: 0.9375rem;
  margin-bottom: 4px;
}
.backup-card p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
.backup-card.danger-zone {
  border-color: rgba(239, 68, 68, 0.3);
}
.import-status {
  font-size: 0.8125rem;
  color: #38bdf8;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .app-container {
    padding: 16px 12px;
  }
  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  .calendar-cell {
    min-height: 80px;
    padding: 4px;
  }
  .leave-badge {
    padding: 2px 4px;
    font-size: 0.6875rem;
  }
  .badge-reason {
    display: none;
  }
}
```

- [x] **Step 3: Viết hoàn thiện `src/App.jsx` kết nối toàn bộ luồng**

```jsx
import React, { useState } from 'react';
import Header from './components/Header';
import MonthNavigator from './components/MonthNavigator';
import StatsOverview from './components/StatsOverview';
import CalendarGrid from './components/CalendarGrid';
import LeaveModal from './components/LeaveModal';
import LeaveListTable from './components/LeaveListTable';
import BackupModal from './components/BackupModal';
import { useLeaves } from './hooks/useLeaves';
import { calculateMonthlyBalance } from './utils/calendarUtils';
import { downloadCSV } from './utils/exportUtils';
import './App.css';

export default function App() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  const {
    leaves,
    addLeave,
    updateLeave,
    deleteLeave,
    importLeaves,
    clearAllLeaves
  } = useLeaves();

  // Modal states
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  // Leave click handlers
  const handleSelectDate = dateStr => {
    const existing = leaves.find(l => l.date === dateStr);
    setSelectedDate(dateStr);
    setEditingLeave(existing || null);
    setIsModalOpen(true);
  };

  const handleEditLeave = leave => {
    setSelectedDate(leave.date);
    setEditingLeave(leave);
    setIsModalOpen(true);
  };

  const handleSaveLeave = ({ date, session, reason }) => {
    if (editingLeave) {
      updateLeave(editingLeave.id, { date, session, reason });
    } else {
      addLeave({ date, session, reason });
    }
    setIsModalOpen(false);
    setEditingLeave(null);
  };

  const handleDeleteLeave = id => {
    deleteLeave(id);
    setIsModalOpen(false);
    setEditingLeave(null);
  };

  const handleExportCSV = () => {
    downloadCSV(leaves, currentYear, currentMonth);
  };

  const balanceData = calculateMonthlyBalance(leaves, currentYear, currentMonth);

  return (
    <div className="app-container">
      <Header
        onExportCSV={handleExportCSV}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      <MonthNavigator
        year={currentYear}
        month={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      <StatsOverview balanceData={balanceData} />

      <CalendarGrid
        year={currentYear}
        month={currentMonth}
        leaves={leaves}
        onSelectDate={handleSelectDate}
        onEditLeave={handleEditLeave}
      />

      <div className="section-table">
        <div className="section-title-bar">
          <h3 className="section-title">
            Danh Sách Chi Tiết Ngày Nghỉ Tháng {currentMonth}/{currentYear} ({balanceData.records.length} lượt)
          </h3>
        </div>
        <LeaveListTable
          records={balanceData.records}
          onEdit={handleEditLeave}
          onDelete={deleteLeave}
        />
      </div>

      <LeaveModal
        isOpen={isModalOpen}
        date={selectedDate}
        initialData={editingLeave}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLeave(null);
        }}
        onSave={handleSaveLeave}
        onDelete={handleDeleteLeave}
      />

      <BackupModal
        isOpen={isBackupOpen}
        leaves={leaves}
        onClose={() => setIsBackupOpen(false)}
        onImport={importLeaves}
        onClearAll={clearAllLeaves}
      />
    </div>
  );
}
```

- [x] **Step 4: Cập nhật `src/App.test.jsx` kiểm thử toàn diện integration**

```jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders title, stats cards, and calendar', () => {
    render(<App />);
    expect(screen.getByText('Sổ Đăng Ký Lịch Nghỉ & Chấm Công')).toBeInTheDocument();
    expect(screen.getByText('Hạn Mức Tháng')).toBeInTheDocument();
    expect(screen.getByText('4.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('Xuất Excel (.csv)')).toBeInTheDocument();
  });

  it('allows registering a new leave and reflects in stats', () => {
    render(<App />);

    // Click on today cell
    const todayBadge = screen.getByText('Hôm nay');
    fireEvent.click(todayBadge);

    // Modal should be open
    expect(screen.getByText('Đăng Ký Lịch Nghỉ')).toBeInTheDocument();

    // Select Morning (0.5c)
    fireEvent.click(screen.getByLabelText(/Buổi Sáng/i));

    // Fill reason
    const input = screen.getByPlaceholderText(/Nhập lý do/i);
    fireEvent.change(input, { target: { value: 'Khám sức khỏe' } });

    // Save
    fireEvent.click(screen.getByText('Lưu Lịch Nghỉ'));

    // Should update used days to 0.5 and balance to +3.5 CÔNG
    expect(screen.getByText('0.5 ngày')).toBeInTheDocument();
    expect(screen.getByText('+3.5 CÔNG')).toBeInTheDocument();
  });
});
```

- [x] **Step 5: Chạy toàn bộ test suite và build kiểm tra**

```powershell
npm run test
npm run build
```
Expected: All tests pass, build succeeds with zero errors.

- [x] **Step 6: Commit Task 7**

```powershell
git add src/App.jsx src/App.css src/App.test.jsx src/components/BackupModal.jsx
git commit -m "feat: complete application assembly, styling, backup modal, and full integration tests"
```
