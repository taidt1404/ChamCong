import React from 'react';

export default function StatsOverview({ balanceData, onEditHolidayQuota }) {
  const {
    quota,
    usedDays,
    balance,
    status,
    morningCount,
    afternoonCount,
    fullCount,
    holidayBonus = 0
  } = balanceData;

  const getStatusBadge = () => {
    if (status === 'positive') {
      return {
        label: 'DƯƠNG CÔNG',
        sub: `Dư ${balance} ngày nghỉ trong tháng`,
        badgeClass: 'badge-positive',
        valueDisplay: `+${balance.toFixed(1)} CÔNG`
      };
    }
    if (status === 'negative') {
      return {
        label: 'ÂM CÔNG',
        sub: `Vượt hạn mức ${Math.abs(balance)} ngày`,
        badgeClass: 'badge-negative',
        valueDisplay: `${balance.toFixed(1)} CÔNG`
      };
    }
    return {
      label: 'ĐỦ CÔNG',
      sub: 'Đạt đúng hạn mức',
      badgeClass: 'badge-balanced',
      valueDisplay: '0.0 CÔNG'
    };
  };

  const statusInfo = getStatusBadge();
  const percentage = Math.min(Math.round((usedDays / quota) * 100), 100);

  return (
    <div className="stats-container">
      {/* Card 1: Hạn mức */}
      <div className="stat-card">
        <div className="stat-badge-header">
          <span className="stat-label">Hạn Mức Tháng</span>
          {onEditHolidayQuota && (
            <button
              type="button"
              className="btn-edit-holiday"
              onClick={onEditHolidayQuota}
              aria-label="Chỉnh sửa ngày nghỉ lễ"
              title="Cài đặt số ngày nghỉ lễ cho tháng này"
            >
              {holidayBonus > 0 ? `+${holidayBonus} lễ` : '+ Lễ'} ✏️
            </button>
          )}
        </div>
        <div className="stat-value">{quota.toFixed(1)} ngày</div>
        <span className="stat-desc">
          {holidayBonus > 0
            ? `Chuẩn 4.0 + ${holidayBonus.toFixed(1)} ngày lễ`
            : 'Chuẩn định mức 4.0 ngày (Bấm + Lễ để thêm)'}
        </span>
      </div>

      {/* Card 2: Đã nghỉ */}
      <div className="stat-card">
        <span className="stat-label">Đã Đăng Ký Nghỉ</span>
        <div className="stat-value">{usedDays.toFixed(1)} ngày</div>
        <span className="stat-desc">
          {fullCount > 0 && `${fullCount} ngày full `}
          {(morningCount > 0 || afternoonCount > 0) && `(${morningCount + afternoonCount} ca nửa buổi)`}
          {usedDays === 0 && 'Chưa đăng ký ngày nào'}
        </span>
      </div>

      {/* Card 3: Cân đối công */}
      <div className={`stat-card stat-card-highlight ${statusInfo.badgeClass}`}>
        <div className="stat-badge-header">
          <span className="stat-label">Trạng Thái Công</span>
          <span className="status-pill">{statusInfo.label}</span>
        </div>
        <div className="stat-value highlight-value">{statusInfo.valueDisplay}</div>
        <span className="stat-desc">{statusInfo.sub}</span>
      </div>

      {/* Card 4: Thanh tiến độ sử dụng */}
      <div className="stat-card progress-card">
        <div className="progress-header">
          <span className="stat-label">Tỷ Lệ Đã Nghỉ</span>
          <span className="progress-percent">{percentage}%</span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${status === 'negative' ? 'progress-exceeded' : ''}`}
            style={{ width: `${Math.min((usedDays / quota) * 100, 100)}%` }}
          />
        </div>
        <span className="stat-desc">
          {usedDays > quota ? `Đã dùng vượt ${usedDays - quota} ngày` : `Còn lại ${balance} ngày nghỉ`}
        </span>
      </div>
    </div>
  );
}
