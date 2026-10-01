import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import StatsOverview from './StatsOverview';

describe('StatsOverview component', () => {
  it('renders positive balance (dương công) correctly', () => {
    const data = {
      quota: 4.0,
      usedDays: 2.5,
      balance: 1.5,
      status: 'positive',
      morningCount: 1,
      afternoonCount: 0,
      fullCount: 2
    };

    render(<StatsOverview balanceData={data} />);
    expect(screen.getByText('4.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('2.5 ngày')).toBeInTheDocument();
    expect(screen.getByText('+1.5 CÔNG')).toBeInTheDocument();
    expect(screen.getByText(/Dương công/i)).toBeInTheDocument();
  });

  it('renders negative balance (âm công) correctly', () => {
    const data = {
      quota: 4.0,
      usedDays: 5.0,
      balance: -1.0,
      status: 'negative',
      morningCount: 0,
      afternoonCount: 0,
      fullCount: 5
    };

    render(<StatsOverview balanceData={data} />);
    expect(screen.getByText('5.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('-1.0 CÔNG')).toBeInTheDocument();
    expect(screen.getByText(/Âm công/i)).toBeInTheDocument();
  });

  it('renders holiday bonus info and triggers edit holiday callback', () => {
    const onEditHolidayQuota = vi.fn();
    const data = {
      baseQuota: 4.0,
      holidayBonus: 2.0,
      quota: 6.0,
      usedDays: 3.0,
      balance: 3.0,
      status: 'positive',
      morningCount: 0,
      afternoonCount: 0,
      fullCount: 3
    };

    render(<StatsOverview balanceData={data} onEditHolidayQuota={onEditHolidayQuota} />);
    expect(screen.getByText('6.0 ngày')).toBeInTheDocument();
    expect(screen.getByText(/Chuẩn 4.0 \+ 2.0 ngày lễ/i)).toBeInTheDocument();

    const editBtn = screen.getByLabelText(/Chỉnh sửa ngày nghỉ lễ/i);
    fireEvent.click(editBtn);
    expect(onEditHolidayQuota).toHaveBeenCalledTimes(1);
  });
});

