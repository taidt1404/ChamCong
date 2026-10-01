import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders title, stats cards, and calendar', () => {
    render(<App />);
    expect(screen.getByText('Sổ Đăng Ký Lịch Nghỉ & Chấm Công')).toBeInTheDocument();
    expect(screen.getByText('Hạn Mức Tháng')).toBeInTheDocument();
    expect(screen.getByText('4.0 ngày')).toBeInTheDocument();
    expect(screen.getByText(/Xuất Excel/i)).toBeInTheDocument();
  });

  it('allows registering a new leave and reflects in stats', () => {
    render(<App />);

    // Click on today cell
    const todayBadge = document.querySelector('.today-badge');
    fireEvent.click(todayBadge);

    // Modal should be open
    expect(screen.getByText('Đăng Ký Lịch Nghỉ')).toBeInTheDocument();

    // Select Morning (0.5c)
    fireEvent.click(screen.getByLabelText(/Buổi Sáng/i));

    // Fill reason
    const input = screen.getByPlaceholderText(/Nhập lý do/i);
    fireEvent.change(input, { target: { value: 'Khám sức khỏe' } });

    // Save
    fireEvent.click(screen.getByText('Lưu Lịch Nghỉ'));

    // Should update used days to 0.5 and balance to +3.5 CÔNG
    expect(screen.getByText('0.5 ngày')).toBeInTheDocument();
    expect(screen.getByText('+3.5 CÔNG')).toBeInTheDocument();
  });
});
