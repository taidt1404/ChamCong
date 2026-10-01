# Lunar Calendar & Vietnam Holidays Display Design Specification

## 1. Overview
Tính năng hiển thị **Lịch Âm (Âm Lịch Việt Nam)** và **Highlight Ngày Lễ Việt Nam** trực tiếp trên lưới lịch tháng của ứng dụng Chấm Công & Quản Lý Nghỉ Phép.

Mục tiêu:
- Giúp người dùng nắm bắt ngày âm lịch (mùng 1, ngày rằm, các dịp lễ truyền thống) cùng ngày dương lịch khi lên lịch nghỉ phép.
- Làm nổi bật các ngày Lễ chính thức của Việt Nam (nghỉ hưởng lương theo Luật Lao động) và các ngày kỷ niệm/truyền thống phổ biến.
- Cung cấp nút chuyển đổi bật/tắt (Toggle) hiển thị Âm lịch & Ngày lễ để giao diện linh hoạt.

## 2. Technical Architecture & Algorithms

### 2.1 Thuật toán chuyển đổi Âm lịch (`src/utils/lunarUtils.js`)
Sử dụng thuật toán thiên văn chuyển đổi Dương lịch sang Âm lịch chuẩn Việt Nam (Múi giờ GMT+7 / kinh độ 105° Đông của GS. Hồ Ngọc Đức).
- Hàm chính: `convertSolarToLunar(day, month, year, timeZone = 7)`
- Trả về: `{ lunarDay: number, lunarMonth: number, lunarYear: number, isLeap: boolean }`
- Định dạng hiển thị:
  - Nếu `lunarDay === 1`: hiển thị `${lunarDay}/${lunarMonth}` (hoặc `${lunarDay}/${lunarMonth}N` nếu tháng nhuận).
  - Các ngày còn lại: hiển thị `${lunarDay}`.
  - Cờ đánh dấu `isFirstDay = lunarDay === 1`, `isFullMoon = lunarDay === 15`.

### 2.2 Danh mục ngày Lễ Việt Nam (`src/utils/holidayData.js`)

Phân loại ngày lễ thành 2 nhóm:

#### A. Ngày Lễ Chính Thức (Nghỉ theo Luật Lao động) (`type: 'official'`):
1. **Dương lịch**:
   - `01-01`: Tết Dương lịch
   - `30-04`: Ngày Giải phóng miền Nam
   - `01-05`: Ngày Quốc tế Lao động
   - `02-09`: Quốc khánh
   - `01-09` hoặc `03-09`: Ngày nghỉ kề cận dịp Quốc khánh
2. **Âm lịch**:
   - `10-03` (AL): Giỗ Tổ Hùng Vương
   - `29-12` hoặc `30-12` (AL): Đêm Giao Thừa (Tết Nguyên Đán)
   - `01-01`, `02-01`, `03-01`, `04-01`, `05-01` (AL): Tết Nguyên Đán (Mùng 1 đến Mùng 5)

#### B. Ngày Lễ Truyền Thống / Kỷ Niệm (`type: 'commemorative'`):
1. **Âm lịch**:
   - `15-01` (AL): Rằm tháng Giêng (Tết Nguyên Tiêu)
   - `03-03` (AL): Tết Hàn Thực
   - `15-04` (AL): Lễ Phật Đản
   - `05-05` (AL): Tết Đoan Ngọ (Giết sâu bọ)
   - `15-07` (AL): Lễ Vu Lan (Báo hiếu / Rằm tháng 7)
   - `15-08` (AL): Tết Trung Thu
   - `23-12` (AL): Tiễn Ông Công Ông Táo
2. **Dương lịch**:
   - `14-02`: Valentine (Lễ tình nhân)
   - `27-02`: Ngày Thầy thuốc Việt Nam
   - `08-03`: Quốc tế Phụ nữ
   - `01-06`: Quốc tế Thiếu nhi
   - `28-06`: Ngày Gia đình Việt Nam
   - `27-07`: Ngày Thương binh Liệt sĩ
   - `20-10`: Ngày Phụ nữ Việt Nam
   - `20-11`: Ngày Nhà giáo Việt Nam
   - `22-12`: Ngày Quân đội Nhân dân Việt Nam
   - `25-12`: Lễ Giáng sinh (Noel)

### 2.3 Tra cứu ngày lễ (`getHoliday(solarDateStr, lunarDateObj)`)
- Hàm `getHoliday(solarDateStr, lunarDateObj)` kiểm tra xem ngày đó có trùng với ngày lễ Dương lịch hay Âm lịch không.
- Trả về đối tượng `{ name: string, type: 'official' | 'commemorative', icon: string }` hoặc `null`.

## 3. UI/UX Design

### 3.1 Trong mỗi ô lịch (`CalendarGrid.jsx`):
- **Góc trên bên trái**:
  - Số ngày Dương lịch lớn: ví dụ `12`
  - Kế bên là số ngày Âm lịch nhỏ: ví dụ `2` hoặc `1/9` (nếu ngày 1 âm).
  - Style Âm lịch: font size 0.75rem, opacity 0.75; nếu mùng 1 hoặc rằm (15) thì tô màu vàng trăng rằm (`#f59e0b` hoặc `#fbbf24`).
- **Badge Ngày Lễ**:
  - Nằm ngay dưới phần tiêu đề ô ngày hoặc phía trên các ca nghỉ phép.
  - **Lễ chính thức (`type: 'official'`)**:
    - Nền đỏ rực rỡ gradient nhẹ: `linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.15))`.
    - Viền: `border: 1px solid rgba(239, 68, 68, 0.45)`.
    - Chữ vàng kim / đỏ tươi: kèm icon cờ/hoa (ví dụ: `🇻🇳 2/9 Quốc khánh`, `🧧 Tết Nguyên Đán`).
  - **Lễ kỷ niệm (`type: 'commemorative'`)**:
    - Nền tím pastel hoặc cyan dịu mắt: `rgba(99, 102, 241, 0.15)`.
    - Viền: `border: 1px solid rgba(99, 102, 241, 0.3)`.
    - Chữ: font nhỏ xinh xắn kèm icon (ví dụ: `🥮 Trung thu`, `💐 20/10`).

### 3.2 Tùy chọn Bật/Tắt (Toggle Controls):
- Thêm switch / checkbox tiện ích ở thanh công cụ phía trên lịch:
  - `🌙 Lịch Âm & Ngày Lễ` (checkbox switch, mặc định: `true`).
  - Khi tắt: ô lịch quay về giao diện số ngày dương lịch tối giản.

## 4. Testing Strategy
- Unit tests cho `lunarUtils.js`:
  - Chuyển đổi chính xác các mốc ngày quan trọng (Tết Giáp Thìn 2024, Ất Tỵ 2025, Bính Ngọ 2026).
  - Kiểm tra các ngày đầu tháng (mùng 1 âm) và ngày rằm (15 âm).
  - Kiểm tra tháng nhuận nếu có.
- Unit tests cho `holidayData.js`:
  - Xác định đúng ngày lễ Dương lịch (1/1, 30/4, 1/5, 2/9, 20/10...).
  - Xác định đúng ngày lễ Âm lịch (Giỗ tổ 10/3, Tết Nguyên đán 1/1 - 5/1 AL, Trung thu 15/8 AL...).
  - Phân loại chuẩn `official` vs `commemorative`.
- Component tests cho `CalendarGrid.jsx` & `App.jsx`:
  - Kiểm tra hiển thị ngày âm và badge lễ.
  - Kiểm tra toggle bật/tắt hiển thị lịch âm.

## 5. Backward Compatibility & Performance
- Hoàn toàn độc lập, không làm thay đổi cấu trúc dữ liệu nghỉ phép hiện tại (`leaves` array).
- Không ảnh hưởng đến tính năng đăng ký hàng loạt hay tính hạn mức ngày lễ tháng đã làm trước đó.
- Thuật toán chuyển đổi âm lịch cực nhanh (dưới 1ms cho cả tháng 42 ô lịch), không gây giật lag.
