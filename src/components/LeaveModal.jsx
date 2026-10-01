import React, { useState, useEffect } from 'react';
import { formatDate, getDayOfWeekName } from '../utils/calendarUtils';

const QUICK_REASONS = ['Việc gia đình', 'Khám sức khỏe', 'Đi du lịch', 'Việc cá nhân', 'Nghỉ ngơi'];

export default function LeaveModal({ isOpen, date, initialData, onClose, onSave, onDelete }) {
  const [session, setSession] = useState('full');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (initialData) {
      setSession(initialData.session || 'full');
      setReason(initialData.reason || '');
    } else {
      setSession('full');
      setReason('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();
    onSave({
      date,
      session,
      reason
    });
  };

  const isEditing = Boolean(initialData);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{isEditing ? 'Chỉnh Sửa Lịch Nghỉ' : 'Đăng Ký Lịch Nghỉ'}</h3>
            <p className="modal-date">
              {getDayOfWeekName(date)}, {formatDate(date)}
            </p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn ca nghỉ:</label>
            <div className="session-options">
              <label className={`session-card ${session === 'morning' ? 'active morning' : ''}`}>
                <input
                  type="radio"
                  name="session"
                  value="morning"
                  checked={session === 'morning'}
                  onChange={() => setSession('morning')}
                />
                <span className="session-icon">🌅</span>
                <span className="session-name">Buổi Sáng</span>
                <span className="session-value">0.5 công</span>
              </label>

              <label className={`session-card ${session === 'afternoon' ? 'active afternoon' : ''}`}>
                <input
                  type="radio"
                  name="session"
                  value="afternoon"
                  checked={session === 'afternoon'}
                  onChange={() => setSession('afternoon')}
                />
                <span className="session-icon">🌆</span>
                <span className="session-name">Buổi Chiều</span>
                <span className="session-value">0.5 công</span>
              </label>

              <label className={`session-card ${session === 'full' ? 'active full' : ''}`}>
                <input
                  type="radio"
                  name="session"
                  value="full"
                  checked={session === 'full'}
                  onChange={() => setSession('full')}
                />
                <span className="session-icon">☀️</span>
                <span className="session-name">Cả Ngày</span>
                <span className="session-value">1.0 công</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lý do / Ghi chú:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập lý do (VD: Đi khám bệnh, đám cưới...)"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
            <div className="quick-reasons">
              {QUICK_REASONS.map(qr => (
                <button
                  type="button"
                  key={qr}
                  className="chip-btn"
                  onClick={() => setReason(qr)}
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            {isEditing && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(initialData.id)}
              >
                Xóa Lịch Này
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Cập Nhật' : 'Lưu Lịch Nghỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
