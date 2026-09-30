import React from 'react';

export default function Header({ onExportCSV, onOpenBackup }) {
  return (
    <header className="app-header">
      <div className="brand-group">
        <div className="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div>
          <h1 className="brand-title">Sổ Đăng Ký Lịch Nghỉ & Chấm Công</h1>
          <p className="brand-subtitle">Chuẩn 4 ngày nghỉ/tháng • Tự động tính Âm / Dương công</p>
        </div>
      </div>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onExportCSV} title="Xuất báo cáo Excel tháng này">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Xuất Excel (.csv)
        </button>
        <button className="btn btn-secondary" onClick={onOpenBackup} title="Sao lưu / Phục hồi dữ liệu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Sao lưu / Nạp dữ liệu
        </button>
      </div>
    </header>
  );
}
