import { formatDate, getDayOfWeekName, SESSION_LABELS } from './calendarUtils';

export function generateCSVContent(records, year, month) {
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthRecords = records
    .filter(r => r.date && r.date.startsWith(monthPrefix))
    .sort((a, b) => a.date.localeCompare(b.date));

  const headers = ['STT', 'Ngày', 'Thứ', 'Ca nghỉ', 'Số công', 'Lý do/Ghi chú'];
  const rows = monthRecords.map((r, index) => [
    index + 1,
    formatDate(r.date),
    getDayOfWeekName(r.date),
    SESSION_LABELS[r.session] || r.session,
    r.days,
    `"${(r.reason || '').replace(/"/g, '""')}"`
  ]);

  const csvRows = [headers.join(','), ...rows.map(row => row.join(','))];
  return '\uFEFF' + csvRows.join('\r\n');
}

export function downloadCSV(records, year, month) {
  const content = generateCSVContent(records, year, month);
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Lich_Nghi_Thang_${month}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadJSON(records) {
  const data = JSON.stringify(records, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Sao_Luu_Lich_Nghi_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
