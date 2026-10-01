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

  it('allows registering multiple leaves in bulk mode and updates balance', () => {
    render(<App />);

    // Bật chế độ chọn nhiều ngày
    const toggleMultiBtn = screen.getByText(/Chọn Nhiều Ngày/i);
    fireEvent.click(toggleMultiBtn);

    // Click chọn ngày 10 và 11
    const cell10 = screen.getByText('10').closest('.calendar-cell');
    const cell11 = screen.getByText('11').closest('.calendar-cell');
    fireEvent.click(cell10);
    fireEvent.click(cell11);

    // Thanh tác vụ hiển thị "Đã chọn: 2 ngày"
    expect(screen.getByText(/Đã chọn: 2 ngày/i)).toBeInTheDocument();

    // Bấm nút đăng ký trên thanh tác vụ
    const registerBulkBtn = screen.getByText('Đăng Ký 2 Ngày');
    fireEvent.click(registerBulkBtn);

    // Modal bulk mở ra
    expect(screen.getByText(/Đăng Ký Nghỉ Cho 2 Ngày/i)).toBeInTheDocument();

    // Chọn nghỉ Chiều (0.5c)
    fireEvent.click(screen.getByLabelText(/Buổi Chiều/i));

    // Nhập lý do
    const input = screen.getByPlaceholderText(/Nhập lý do/i);
    fireEvent.change(input, { target: { value: 'Nghỉ giải quyết việc' } });

    // Lưu
    fireEvent.click(screen.getByText(/Lưu Cho 2 Ngày/i));

    // Tổng số ngày đã đăng ký = 2 * 0.5 = 1.0 ngày, balance = 4.0 - 1.0 = +3.0 CÔNG
    expect(screen.getByText('1.0 ngày')).toBeInTheDocument();
    expect(screen.getByText('+3.0 CÔNG')).toBeInTheDocument();
  });

  it('allows adjusting monthly holiday quota and updates balance accordingly', () => {
    render(<App />);

    // Click nút chỉnh sửa ngày nghỉ lễ
    const editHolidayBtn = screen.getByLabelText(/Chỉnh sửa ngày nghỉ lễ/i);
    fireEvent.click(editHolidayBtn);

    // Modal holiday mở ra
    expect(screen.getByText(/Số Ngày Nghỉ Lễ Tháng/i)).toBeInTheDocument();

    // Chọn +2 ngày lễ
    fireEvent.click(screen.getByText('+2 Ngày Lễ (Tổng 6 ngày)'));

    // Lưu
    fireEvent.click(screen.getByText('Lưu Thiết Lập'));

    // Hạn mức tháng cập nhật thành 6.0 ngày
    expect(screen.getByText('6.0 ngày')).toBeInTheDocument();
    expect(screen.getByText(/Chuẩn 4.0 \+ 2.0 ngày lễ/i)).toBeInTheDocument();
    expect(screen.getByText('+6.0 CÔNG')).toBeInTheDocument();
  });
});

