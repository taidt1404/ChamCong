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

    const cell15 = screen
      .getAllByText('15')
      .find(el => el.classList.contains('day-number'))
      .closest('.calendar-cell');
    expect(cell15).toHaveClass('cell-selected-multi');

    const cell16 = screen
      .getAllByText('16')
      .find(el => el.classList.contains('day-number'))
      .closest('.calendar-cell');
    fireEvent.click(cell16);

    expect(onToggleDate).toHaveBeenCalledWith('2026-10-16');
    expect(onSelectDate).not.toHaveBeenCalled();
  });

  it('renders lunar dates and holiday badges when showLunar is true', () => {
    render(
      <CalendarGrid
        year={2026}
        month={10}
        leaves={[]}
        showLunar={true}
        onSelectDate={vi.fn()}
        onEditLeave={vi.fn()}
      />
    );

    // Ngày 20/10/2026 có ngày lễ 20/10 Phụ Nữ VN
    expect(screen.getByText(/20\/10 Phụ Nữ VN/i)).toBeInTheDocument();

    // Có ít nhất 1 phần tử có class lunar-day
    const lunarElements = document.querySelectorAll('.lunar-day');
    expect(lunarElements.length).toBeGreaterThan(0);
  });

  it('hides lunar dates and holiday badges when showLunar is false', () => {
    render(
      <CalendarGrid
        year={2026}
        month={10}
        leaves={[]}
        showLunar={false}
        onSelectDate={vi.fn()}
        onEditLeave={vi.fn()}
      />
    );

    expect(screen.queryByText(/20\/10 Phụ Nữ VN/i)).not.toBeInTheDocument();
    const lunarElements = document.querySelectorAll('.lunar-day');
    expect(lunarElements.length).toBe(0);
  });
});

