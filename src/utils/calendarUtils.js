export const SESSION_LABELS = {
  morning: 'Nghỉ Sáng (0.5c)',
  afternoon: 'Nghỉ Chiều (0.5c)',
  full: 'Nghỉ Cả Ngày (1c)'
};

export function getLeaveDays(session) {
  if (session === 'morning' || session === 'afternoon') return 0.5;
  if (session === 'full') return 1.0;
  return 0;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function getDayOfWeekName(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  return dayNames[day];
}

export function calculateMonthlyBalance(records, year, month) {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthRecords = records.filter(r => r.date && r.date.startsWith(monthPrefix));

  let usedDays = 0;
  let morningCount = 0;
  let afternoonCount = 0;
  let fullCount = 0;

  monthRecords.forEach(r => {
    const days = Number(r.days) || getLeaveDays(r.session);
    usedDays += days;
    if (r.session === 'morning') morningCount++;
    else if (r.session === 'afternoon') afternoonCount++;
    else if (r.session === 'full') fullCount++;
  });

  const quota = 4.0;
  const balance = Number((quota - usedDays).toFixed(1));

  let status = 'balanced';
  if (balance > 0) status = 'positive';
  else if (balance < 0) status = 'negative';

  return {
    quota,
    usedDays: Number(usedDays.toFixed(1)),
    balance,
    status,
    records: monthRecords,
    morningCount,
    afternoonCount,
    fullCount
  };
}

export function getDaysInMonth(year, month) {
  // month: 1 - 12
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const totalDays = lastDayOfMonth.getDate();

  // JavaScript getDay(): 0 is Sunday, 1 is Monday...
  // We want Monday as index 0, Sunday as index 6
  let firstDayIndex = firstDayOfMonth.getDay() - 1;
  if (firstDayIndex === -1) firstDayIndex = 6;

  const days = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevMonthDate = new Date(year, month - 2, dayNum);
    const y = prevMonthDate.getFullYear();
    const m = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(dayNum).padStart(2, '0');
    days.push({
      dateStr: `${y}-${m}-${d}`,
      dayNumber: dayNum,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const m = String(month).padStart(2, '0');
    const d = String(i).padStart(2, '0');
    days.push({
      dateStr: `${year}-${m}-${d}`,
      dayNumber: i,
      isCurrentMonth: true
    });
  }

  // Next month padding to complete 7-day grid
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthDate = new Date(year, month, i);
    const y = nextMonthDate.getFullYear();
    const m = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
    const d = String(i).padStart(2, '0');
    days.push({
      dateStr: `${y}-${m}-${d}`,
      dayNumber: i,
      isCurrentMonth: false
    });
  }

  return days;
}
