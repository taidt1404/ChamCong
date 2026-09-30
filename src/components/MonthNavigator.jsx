import React from 'react';

export default function MonthNavigator({ year, month, onPrevMonth, onNextMonth, onToday }) {
  return (
    <div className="month-navigator">
      <div className="nav-controls">
        <button className="btn-icon" onClick={onPrevMonth} aria-label="Tháng trước" title="Tháng trước">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2 className="current-month-display">
          Tháng {month} / {year}
        </h2>
        <button className="btn-icon" onClick={onNextMonth} aria-label="Tháng sau" title="Tháng sau">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      <button className="btn btn-sm btn-ghost" onClick={onToday}>
        Hôm nay
      </button>
    </div>
  );
}
