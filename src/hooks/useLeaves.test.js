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
