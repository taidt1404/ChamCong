import React, { useState, useEffect } from 'react';

const PRESET_OPTIONS = [
  { value: 0, label: 'Chuẩn (+0 ngày)' },
  { value: 1, label: '+1 Ngày Lễ (Tổng 5 ngày)' },
  { value: 2, label: '+2 Ngày Lễ (Tổng 6 ngày)' },
  { value: 3, label: '+3 Ngày Lễ (Tổng 7 ngày)' }
];

export default function HolidayModal({
  isOpen,
  year,
  month,
  currentBonus = 0,
  onClose,
  onSave
}) {
  const [bonus, setBonus] = useState(currentBonus);

  useEffect(() => {
    setBonus(currentBonus);
  }, [currentBonus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();
    onSave(Number(bonus) || 0);
  };

  const totalDays = Number((4.0 + (Number(bonus) || 0)).toFixed(1));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card holiday-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Số Ngày Nghỉ Lễ Tháng {month}/{year}</h3>
            <p className="modal-date">
              Cộng thêm ngày nghỉ lễ hưởng lương vào hạn mức tháng
            </p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Chọn số ngày nghỉ lễ được cộng thêm:</label>
            <div className="holiday-preset-options">
              {PRESET_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  className={`chip-btn holiday-chip ${Number(bonus) === opt.value ? 'active' : ''}`}
                  onClick={() => setBonus(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hoặc nhập số ngày tùy chỉnh:</label>
            <input
              type="number"
              min="0"
              max="15"
              step="0.5"
              className="form-input"
              value={bonus}
              onChange={e => setBonus(e.target.value)}
              placeholder="Ví dụ: 1.5, 2, 3..."
            />
          </div>

          <div className="holiday-preview-box">
            <span className="preview-label">Hạn mức tháng {month}/{year}:</span>
            <span className="preview-total">{totalDays} ngày</span>
            <span className="preview-desc">
              (Chuẩn 4.0 + {Number(bonus) || 0} ngày lễ)
            </span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Lưu Thiết Lập
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
