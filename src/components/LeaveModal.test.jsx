import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LeaveModal from './LeaveModal';

describe('LeaveModal component', () => {
  it('renders in create mode and submits new leave', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <LeaveModal
        isOpen={true}
        date="2026-10-15"
        initialData={null}
        onClose={onClose}
        onSave={onSave}
      />
    );

    expect(screen.getByText(/Đăng Ký Lịch Nghỉ/i)).toBeInTheDocument();
    expect(screen.getByText(/15\/10\/2026/)).toBeInTheDocument();

    // Select buổi chiều
    fireEvent.click(screen.getByLabelText(/Buổi Chiều/i));

    // Type reason
    const reasonInput = screen.getByPlaceholderText(/Nhập lý do/i);
    fireEvent.change(reasonInput, { target: { value: 'Đi việc cá nhân' } });

    // Submit
    fireEvent.click(screen.getByText('Lưu Lịch Nghỉ'));

    expect(onSave).toHaveBeenCalledWith({
      date: '2026-10-15',
      session: 'afternoon',
      reason: 'Đi việc cá nhân'
    });
  });

  it('renders in edit mode and allows delete', () => {
    const onSave = vi.fn();
    const onDelete = vi.fn();
    const onClose = vi.fn();
    const existing = {
      id: 'rec_1',
      date: '2026-10-15',
      session: 'full',
      reason: 'Khám sức khỏe'
    };

    render(
      <LeaveModal
        isOpen={true}
        date="2026-10-15"
        initialData={existing}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText(/Chỉnh Sửa Lịch Nghỉ/i)).toBeInTheDocument();
    const deleteBtn = screen.getByText('Xóa Lịch Này');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('rec_1');
  });
});
