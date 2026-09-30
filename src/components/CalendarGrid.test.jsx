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

    const leaveBadge = screen.getByText(/Sáng 0.5c/i);
    expect(leaveBadge).toBeInTheDocument();

    fireEvent.click(leaveBadge);
    expect(onEditLeave).toHaveBeenCalledWith(leaves[0]);
  });
});
