import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import LeaveListTable from './LeaveListTable';

describe('LeaveListTable component', () => {
  it('renders records and edit/delete actions', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const records = [
      { id: '1', date: '2026-10-05', session: 'morning', days: 0.5, reason: 'Khám răng' }
    ];

    render(<LeaveListTable records={records} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText('05/10/2026')).toBeInTheDocument();
    expect(screen.getByText('Khám răng')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Sửa'));
    expect(onEdit).toHaveBeenCalledWith(records[0]);

    fireEvent.click(screen.getByText('Xóa'));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('renders empty state when no records', () => {
    render(<LeaveListTable records={[]} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/Chưa có lịch nghỉ nào được đăng ký trong tháng này/i)).toBeInTheDocument();
  });
});
