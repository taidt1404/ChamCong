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
