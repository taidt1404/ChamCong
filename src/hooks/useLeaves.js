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

  const clearAllLeaves = () => {
    setLeaves([]);
  };

  return {
    leaves,
    addLeave,
    updateLeave,
    deleteLeave,
    saveMultipleLeaves,
    getLeaveByDate,
    importLeaves,
    clearAllLeaves
  };
}
