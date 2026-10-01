import React from 'react';
import { formatDate, getDayOfWeekName } from '../utils/calendarUtils';

export default function LeaveListTable({ records, onEdit, onDelete }) {
  if (!records || records.length === 0) {
    return (
      <div className="empty-table-state">
        <p>Chưa có lịch nghỉ nào được đăng ký trong tháng này.</p>
        <span className="empty-hint">Bấm vào bất kỳ ngày nào trên lịch để đăng ký nghỉ!</span>
      </div>
    );
  }

  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="table-responsive">
      <table className="leave-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Ngày Nghỉ</th>
            <th>Thứ</th>
            <th>Ca Nghỉ</th>
            <th>Số Công</th>
            <th>Lý Do / Ghi Chú</th>
            <th className="th-actions">Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedRecords.map((r, idx) => (
            <tr key={r.id}>
              <td>{idx + 1}</td>
              <td className="font-semibold">{formatDate(r.date)}</td>
              <td>{getDayOfWeekName(r.date)}</td>
              <td>
                <span className={`table-session-tag tag-${r.session}`}>
                  {r.session === 'morning' && '🌅 Sáng (0.5c)'}
                  {r.session === 'afternoon' && '🌆 Chiều (0.5c)'}
                  {r.session === 'full' && '☀️ Cả ngày (1c)'}
                </span>
              </td>
              <td>{r.days}</td>
              <td className="td-reason">{r.reason || '—'}</td>
              <td className="td-actions">
                <button className="btn-action edit" onClick={() => onEdit(r)} title="Sửa">
                  Sửa
                </button>
                <button className="btn-action delete" onClick={() => onDelete(r.id)} title="Xóa">
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
