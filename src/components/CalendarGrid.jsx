import React from 'react';
import { getDaysInMonth } from '../utils/calendarUtils';

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function CalendarGrid({ year, month, leaves, onSelectDate, onEditLeave }) {
  const days = getDaysInMonth(year, month);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-weekdays">
        {WEEKDAYS.map(day => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {days.map((dayItem, idx) => {
          const { dateStr, dayNumber, isCurrentMonth } = dayItem;
          const isToday = dateStr === todayStr;
          const dayLeaves = leaves.filter(l => l.date === dateStr);

          return (
            <div
              key={`${dateStr}-${idx}`}
              className={`calendar-cell ${!isCurrentMonth ? 'cell-other-month' : ''} ${
                isToday ? 'cell-today' : ''
              }`}
              onClick={() => onSelectDate(dateStr)}
            >
              <div className="cell-header">
                <span className={`day-number ${isToday ? 'day-number-today' : ''}`}>
                  {dayNumber}
                </span>
                {isToday && <span className="today-badge">Hôm nay</span>}
              </div>

              <div className="cell-content">
                {dayLeaves.map(leave => (
                  <div
                    key={leave.id}
                    className={`leave-badge badge-session-${leave.session}`}
                    onClick={e => {
                      e.stopPropagation();
                      onEditLeave(leave);
                    }}
                    title={`${leave.reason ? `${leave.reason} - ` : ''}Bấm để sửa/xóa`}
                  >
                    <span className="badge-icon">
                      {leave.session === 'morning' && '🌅'}
                      {leave.session === 'afternoon' && '🌆'}
                      {leave.session === 'full' && '☀️'}
                    </span>
                    <span className="badge-text">
                      {leave.session === 'morning' && 'Sáng 0.5c'}
                      {leave.session === 'afternoon' && 'Chiều 0.5c'}
                      {leave.session === 'full' && 'Cả ngày 1c'}
                    </span>
                    {leave.reason && <span className="badge-reason">• {leave.reason}</span>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
