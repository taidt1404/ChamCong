# Bulk Leave Registration (Đăng Ký Nghỉ Nhiều Ngày) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm tính năng chọn và đăng ký lịch nghỉ nhiều ngày cùng lúc (liên tiếp hoặc rời rạc) trực tiếp trên lịch tháng, hỗ trợ gỡ bỏ ngày đã chọn và tự động cập nhật cân đối công trong 1 thao tác duy nhất.

**Architecture:** Bổ sung phương thức `saveMultipleLeaves` vào `useLeaves.js`; nâng cấp `CalendarGrid` với chế độ multi-select (highlight ô + dấu tick `✓`); mở rộng `LeaveModal` để hiển thị danh sách chip ngày; tích hợp thanh tác vụ nổi `BulkActionBar` trên `App.jsx`.

**Tech Stack:** React 18, Vite, Vitest, React Testing Library, Vanilla CSS.

## Global Constraints

- Hạn mức chuẩn cố định: 4.0 ngày nghỉ mỗi tháng.
- Quy đổi ca: Sáng (`0.5`), Chiều (`0.5`), Cả ngày (`1.0`).
- Ghi đè tự động nếu ngày đã có lịch nghỉ từ trước.
- Không phá vỡ luồng đăng ký 1 ngày hiện tại (vẫn click ô để sửa/thêm đơn lẻ khi tắt chế độ chọn nhiều ngày).
- Tất cả 20 unit/integration tests hiện tại phải tiếp tục pass 100%.

---

### Task 1: Mở Rộng `useLeaves.js` với `saveMultipleLeaves` và Unit Tests

**Files:**
- Modify: `src/hooks/useLeaves.js`
- Test: `src/hooks/useLeaves.test.js`

**Interfaces:**
- Produces: `saveMultipleLeaves(dates: string[], { session: 'morning'|'afternoon'|'full', reason?: string }): void`

- [ ] **Step 1: Viết test cho `saveMultipleLeaves` trong `src/hooks/useLeaves.test.js`**

Thêm test case kiểm tra việc lưu nhiều ngày (kết hợp cả ngày mới và ngày đã có để ghi đè):

```javascript
  it('saves multiple leaves at once (creating new and updating existing)', () => {
    const { result } = renderHook(() => useLeaves());

    // Tạo sẵn 1 ngày
    act(() => {
      result.current.addLeave({
        date: '2026-10-15',
        session: 'morning',
        reason: 'Khám răng'
      });
    });

    expect(result.current.leaves.length).toBe(1);

    // Lưu hàng loạt 3 ngày (trong đó có 2026-10-15)
    act(() => {
      result.current.saveMultipleLeaves(
        ['2026-10-15', '2026-10-16', '2026-10-17'],
        { session: 'full', reason: 'Nghỉ du lịch' }
      );
    });

    expect(result.current.leaves.length).toBe(3);
    const day15 = result.current.leaves.find(l => l.date === '2026-10-15');
    expect(day15.session).toBe('full');
    expect(day15.days).toBe(1.0);
    expect(day15.reason).toBe('Nghỉ du lịch');

    const day16 = result.current.leaves.find(l => l.date === '2026-10-16');
    expect(day16.session).toBe('full');
    expect(day16.days).toBe(1.0);

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored.length).toBe(3);
  });
```

- [ ] **Step 2: Chạy test để xác nhận test mới FAIL**

Run: `npm run test`
Expected: FAIL (result.current.saveMultipleLeaves is not a function).

- [ ] **Step 3: Triển khai `saveMultipleLeaves` trong `src/hooks/useLeaves.js`**

Cập nhật `src/hooks/useLeaves.js`:
```javascript
  const saveMultipleLeaves = (dates, { session, reason = '' }) => {
    if (!Array.isArray(dates) || dates.length === 0) return;
    const days = getLeaveDays(session);
    const cleanReason = reason.trim();
    const targetDates = new Set(dates);

    setLeaves(prev => {
      const remainingTargets = new Set(targetDates);
      const updated = prev.map(r => {
        if (remainingTargets.has(r.date)) {
          remainingTargets.delete(r.date);
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

      const newRecords = Array.from(remainingTargets).map(d => ({
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${d}`,
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
Export thêm `saveMultipleLeaves` từ `useLeaves`.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npm run test`
Expected: All tests pass.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/hooks/useLeaves.js src/hooks/useLeaves.test.js
git commit -m "feat: add saveMultipleLeaves method to useLeaves hook"
```

---

### Task 2: Nâng Cấp `LeaveModal.jsx` Hỗ Trợ Chế Độ Chọn Nhiều Ngày (Bulk Mode)

**Files:**
- Modify: `src/components/LeaveModal.jsx`
- Test: `src/components/LeaveModal.test.jsx`

**Interfaces:**
- Props `LeaveModal`:
  - `isOpen`: boolean
  - `date`: string | null (khi đăng ký 1 ngày)
  - `dates`: string[] (khi đăng ký nhiều ngày, mảng các chuỗi ngày `YYYY-MM-DD`)
  - `initialData`: LeaveRecord | null
  - `onClose`: () => void
  - `onSave`: ({ date, dates, session, reason }) => void
  - `onDelete`: (id) => void
  - `onRemoveDate`: (dateStr) => void (loại bỏ 1 ngày khỏi danh sách chọn)

- [ ] **Step 1: Viết test cho bulk mode trong `src/components/LeaveModal.test.jsx`**

Thêm test case:
```jsx
  it('renders in bulk mode with multiple dates and removes a date chip', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();
    const onRemoveDate = vi.fn();
    const dates = ['2026-10-15', '2026-10-16', '2026-10-17'];

    render(
      <LeaveModal
        isOpen={true}
        dates={dates}
        initialData={null}
        onClose={onClose}
        onSave={onSave}
        onRemoveDate={onRemoveDate}
      />
    );

    expect(screen.getByText(/Đăng Ký Nghỉ Cho 3 Ngày/i)).toBeInTheDocument();
    expect(screen.getByText('15/10/2026')).toBeInTheDocument();
    expect(screen.getByText('16/10/2026')).toBeInTheDocument();

    // Click remove date button
    const removeBtn = screen.getByLabelText('Bỏ ngày 15/10/2026');
    fireEvent.click(removeBtn);
    expect(onRemoveDate).toHaveBeenCalledWith('2026-10-15');

    // Submit
    fireEvent.click(screen.getByText(/Lưu Cho 3 Ngày/i));
    expect(onSave).toHaveBeenCalledWith({
      dates,
      session: 'full',
      reason: ''
    });
  });
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npm run test`
Expected: FAIL.

- [ ] **Step 3: Cập nhật `src/components/LeaveModal.jsx`**

Hỗ trợ `dates` prop:
- Nếu `dates && dates.length > 1`: Tiêu đề `Đăng Ký Nghỉ Cho ${dates.length} Ngày`.
- Hiển thị danh sách các ngày đã chọn dạng chip:
  `<span key={d} className="date-chip">{formatDate(d)} <button type="button" aria-label={`Bỏ ngày ${formatDate(d)}`} onClick={() => onRemoveDate?.(d)}>✕</button></span>`.
- Nút submit: `Lưu Cho ${dates.length} Ngày`.
- Khi submit: gọi `onSave({ dates, date, session, reason })`.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add src/components/LeaveModal.jsx src/components/LeaveModal.test.jsx
git commit -m "feat: enhance LeaveModal to support multi-date bulk registration"
```

---

### Task 3: Nâng Cấp `CalendarGrid.jsx` và Styling Chế Độ Chọn Nhiều Ngày

**Files:**
- Modify: `src/components/CalendarGrid.jsx`, `src/App.css`
- Test: `src/components/CalendarGrid.test.jsx`

**Interfaces:**
- Props `CalendarGrid`:
  - Thêm `isMultiSelect`: boolean
  - Thêm `selectedDates`: string[]
  - Thêm `onToggleDate`: (dateStr: string) => void

- [ ] **Step 1: Viết test cho Calendar multi-select trong `src/components/CalendarGrid.test.jsx`**

```jsx
  it('handles multi-select date clicks and highlights selected cells', () => {
    const onToggleDate = vi.fn();
    const onSelectDate = vi.fn();

    render(
      <CalendarGrid
        year={2026}
        month={10}
        leaves={[]}
        isMultiSelect={true}
        selectedDates={['2026-10-15']}
        onToggleDate={onToggleDate}
        onSelectDate={onSelectDate}
      />
    );

    const cell15 = screen.getByText('15').closest('.calendar-cell');
    expect(cell15).toHaveClass('cell-selected-multi');

    const cell16 = screen.getByText('16').closest('.calendar-cell');
    fireEvent.click(cell16);

    expect(onToggleDate).toHaveBeenCalledWith('2026-10-16');
    expect(onSelectDate).not.toHaveBeenCalled();
  });
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npm run test`
Expected: FAIL.

- [ ] **Step 3: Cập nhật `src/components/CalendarGrid.jsx` và `src/App.css`**

Trong `CalendarGrid.jsx`:
- Nhận `isMultiSelect = false`, `selectedDates = []`, `onToggleDate`.
- Trong hàm onClick của `.calendar-cell`:
  `if (isMultiSelect) { onToggleDate(dateStr); } else { onSelectDate(dateStr); }`
- Thêm class `cell-selected-multi` nếu `isMultiSelect && selectedDates.includes(dateStr)`.
- Khi ô được chọn, hiển thị badge góc trên: `<span className="multi-check-badge">✓</span>`.

Thêm CSS vào `src/App.css`:
- `.cell-selected-multi`: viền highlight `--border-focus`, nền sáng hơn, hiệu ứng shadow neon.
- `.multi-check-badge`: huy hiệu xanh ngọc nổi bật ở góc ô.
- Style cho date-chips trong modal.

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add src/components/CalendarGrid.jsx src/components/CalendarGrid.test.jsx src/App.css
git commit -m "feat: add multi-select visual highlight and toggle handlers to CalendarGrid"
```

---

### Task 4: Tích Hợp Toàn Bộ Vào `App.jsx` Kèm `BulkActionBar` và Integration Tests

**Files:**
- Modify: `src/App.jsx`, `src/App.css`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: Trải nghiệm hoàn chỉnh bật/tắt chế độ chọn nhiều ngày, thanh nổi `BulkActionBar` khi chọn ngày, lưu đồng thời nhiều ngày và tự động cập nhật toàn bộ hệ thống.

- [ ] **Step 1: Viết test cho Bulk Registration Flow trong `src/App.test.jsx`**

```jsx
  it('allows registering multiple leaves in bulk mode and updates balance', () => {
    render(<App />);

    // Bật chế độ chọn nhiều ngày
    const toggleMultiBtn = screen.getByText(/Chọn Nhiều Ngày/i);
    fireEvent.click(toggleMultiBtn);

    // Click chọn ngày 10 và 11
    const cell10 = screen.getByText('10').closest('.calendar-cell');
    const cell11 = screen.getByText('11').closest('.calendar-cell');
    fireEvent.click(cell10);
    fireEvent.click(cell11);

    // Thanh tác vụ hiển thị "Đã chọn: 2 ngày"
    expect(screen.getByText(/Đã chọn: 2 ngày/i)).toBeInTheDocument();

    // Bấm nút đăng ký trên thanh tác vụ
    const registerBulkBtn = screen.getByText('Đăng Ký 2 Ngày');
    fireEvent.click(registerBulkBtn);

    // Modal bulk mở ra
    expect(screen.getByText(/Đăng Ký Nghỉ Cho 2 Ngày/i)).toBeInTheDocument();

    // Chọn nghỉ Chiều (0.5c)
    fireEvent.click(screen.getByLabelText(/Buổi Chiều/i));

    // Nhập lý do
    const input = screen.getByPlaceholderText(/Nhập lý do/i);
    fireEvent.change(input, { target: { value: 'Nghỉ giải quyết việc' } });

    // Lưu
    fireEvent.click(screen.getByText(/Lưu Cho 2 Ngày/i));

    // Tổng số ngày đã đăng ký = 2 * 0.5 = 1.0 ngày
    expect(screen.getByText('1.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('+3.0 CÔNG')).toBeInTheDocument();
  });
```

- [ ] **Step 2: Cập nhật `src/App.jsx` và `src/App.css`**

Trong `src/App.jsx`:
- Thêm state:
  - `isMultiSelectMode`: boolean (mặc định `false`)
  - `selectedDates`: string[] (mặc định `[]`)
- Toggle button: Thêm nút `"Chọn nhiều ngày"` vào cạnh `MonthNavigator` hoặc ngay trên Calendar.
- Thêm thanh `BulkActionBar` hiển thị khi `isMultiSelectMode && selectedDates.length > 0`:
  - `<span>Đã chọn: {selectedDates.length} ngày</span>`
  - `<button className="btn btn-primary" onClick={handleOpenBulkModal}>Đăng Ký {selectedDates.length} Ngày</button>`
  - `<button className="btn btn-ghost" onClick={() => setSelectedDates([])}>Bỏ chọn</button>`
- Xử lý `handleSaveLeave`:
  - Nếu có `dates && dates.length > 0`: gọi `saveMultipleLeaves(dates, { session, reason })`, reset `selectedDates` và `isMultiSelectMode`.
  - Nếu chỉ có `date`: gọi `addLeave` / `updateLeave` như cũ.
- Xử lý `handleRemoveDateFromModal(dateStr)`: bỏ ngày đó khỏi `selectedDates`.

- [ ] **Step 3: Chạy toàn bộ test suite**

Run: `npm run test`
Expected: All tests pass (bao gồm 20 tests cũ và các tests mới).

- [ ] **Step 4: Chạy kiểm tra build**

Run: `npm run build`
Expected: Build production thành công 100%.

- [ ] **Step 5: Commit Task 4**

```bash
git add src/App.jsx src/App.css src/App.test.jsx
git commit -m "feat: complete bulk leave registration feature and integration tests"
```

- [ ] **Step 6: Đẩy cập nhật lên GitHub**

```bash
git push origin main
```
