import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import MonthNavigator from './MonthNavigator';

describe('MonthNavigator component', () => {
  it('renders current selected month and year', () => {
    const handlePrev = vi.fn();
    const handleNext = vi.fn();
    const handleToday = vi.fn();

    render(
      <MonthNavigator
        year={2026}
        month={10}
        onPrevMonth={handlePrev}
        onNextMonth={handleNext}
        onToday={handleToday}
      />
    );

    expect(screen.getByText('Tháng 10 / 2026')).toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Tháng trước'));
    expect(handlePrev).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Tháng sau'));
    expect(handleNext).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Hôm nay'));
    expect(handleToday).toHaveBeenCalledTimes(1);
  });
});
