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
});
