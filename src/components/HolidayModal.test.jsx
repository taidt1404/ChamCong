import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import HolidayModal from './HolidayModal';

describe('HolidayModal component', () => {
  it('renders and selects quick holiday bonus chip', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <HolidayModal
        isOpen={true}
        year={2026}
        month={4}
        currentBonus={0}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText(/Ngày Nghỉ Lễ Tháng 4\/2026/i)).toBeInTheDocument();
    
    // Click chip +2 ngày
    fireEvent.click(screen.getByText('+2 Ngày Lễ (Tổng 6 ngày)'));

    // Save
    fireEvent.click(screen.getByText('Lưu Thiết Lập'));
    expect(onSave).toHaveBeenCalledWith(2);
  });
});
