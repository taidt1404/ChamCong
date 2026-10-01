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
