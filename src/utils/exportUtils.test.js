import { describe, it, expect } from 'vitest';
import { generateCSVContent } from './exportUtils';

describe('exportUtils', () => {
  it('generates UTF-8 CSV content with BOM and correct Vietnamese headers', () => {
    const mockRecords = [
      { id: '1', date: '2026-10-05', session: 'morning', days: 0.5, reason: 'Khám bác sĩ' }
    ];
    const csv = generateCSVContent(mockRecords, 2026, 10);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Ngày');
    expect(csv).toContain('Ca nghỉ');
    expect(csv).toContain('Khám bác sĩ');
  });
});
