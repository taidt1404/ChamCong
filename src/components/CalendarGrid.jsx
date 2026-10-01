import React from 'react';
import { getDaysInMonth } from '../utils/calendarUtils';
import { convertSolarToLunar, formatLunarDay } from '../utils/lunarUtils';
import { getHoliday } from '../utils/holidayData';

const WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

export default function CalendarGrid({
  year,
  month,
  leaves,
  onSelectDate,
  onEditLeave,
  isMultiSelect = false,
  selectedDates = [],
  onToggleDate,
  showLunar = true
}) {
  const days = getDaysInMonth(year, month);
  const todayStr = new Date().toISOString().slice(0, 10);

  const handleCellClick = dateStr => {
    if (isMultiSelect) {
      onToggleDate?.(dateStr);
    } else {
      onSelectDate(dateStr);
    }
  };

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
          const isSelectedMulti = isMultiSelect && selectedDates.includes(dateStr);
          const dayLeaves = leaves.filter(l => l.date === dateStr);

          // Tính toán Âm lịch & Ngày lễ
          let lunarObj = null;
          let lunarDisplay = '';
          let isLunarSpecial = false;
          let holiday = null;

          if (showLunar) {
            const [y, m, d] = dateStr.split('-').map(Number);
            lunarObj = convertSolarToLunar(d, m, y);
            lunarDisplay = formatLunarDay(lunarObj);
            isLunarSpecial = lunarObj.lunarDay === 1 || lunarObj.lunarDay === 15;
            holiday = getHoliday(dateStr, lunarObj);
          }

          return (
            <div
              key={`${dateStr}-${idx}`}
              className={`calendar-cell ${!isCurrentMonth ? 'cell-other-month' : ''} ${
                isToday ? 'cell-today' : ''
              } ${isSelectedMulti ? 'cell-selected-multi' : ''} ${
                holiday && holiday.type === 'official' ? 'cell-holiday-official' : ''
              }`}
              onClick={() => handleCellClick(dateStr)}
            >
              <div className="cell-header">
                <div className="day-number-wrapper">
                  <span className={`day-number ${isToday ? 'day-number-today' : ''}`}>
                    {dayNumber}
                  </span>
                  {showLunar && lunarDisplay && (
                    <span
                      className={`lunar-day ${isLunarSpecial ? 'lunar-highlight' : ''}`}
                      title={`Âm lịch: ngày ${lunarObj.lunarDay} tháng ${lunarObj.lunarMonth}${
                        lunarObj.isLeap ? ' (nhuận)' : ''
                      }`}
                    >
                      {lunarDisplay}
                    </span>
                  )}
                </div>
                <div className="cell-badges">
                  {isToday && <span className="today-badge">Hôm nay</span>}
                  {isSelectedMulti && <span className="multi-check-badge">✓</span>}
                </div>
              </div>

              <div className="cell-content">
                {showLunar && holiday && (
                  <div
                    className={`holiday-badge holiday-${holiday.type}`}
                    title={holiday.name}
                  >
                    <span className="holiday-icon">{holiday.icon}</span>
                    <span className="holiday-name">{holiday.name}</span>
                  </div>
                )}

                {dayLeaves.map(leave => (
                  <div
                    key={leave.id}
                    className={`leave-badge badge-session-${leave.session}`}
                    onClick={e => {
                      if (!isMultiSelect) {
                        e.stopPropagation();
                        onEditLeave(leave);
                      }
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
