import React, { useState } from 'react';
import Header from './components/Header';
import MonthNavigator from './components/MonthNavigator';
import StatsOverview from './components/StatsOverview';
import CalendarGrid from './components/CalendarGrid';
import LeaveModal from './components/LeaveModal';
import LeaveListTable from './components/LeaveListTable';
import BackupModal from './components/BackupModal';
import HolidayModal from './components/HolidayModal';
import { useLeaves } from './hooks/useLeaves';
import { calculateMonthlyBalance } from './utils/calendarUtils';
import { downloadCSV } from './utils/exportUtils';
import './App.css';

export default function App() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);

  const {
    leaves,
    addLeave,
    updateLeave,
    deleteLeave,
    saveMultipleLeaves,
    getMonthHolidayBonus,
    setMonthHolidayBonus,
    importLeaves,
    clearAllLeaves
  } = useLeaves();

  // Modal states
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);

  // Multi-select states
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
  };

  // Multi-select handlers
  const handleToggleMultiSelect = () => {
    setIsMultiSelectMode(prev => {
      const next = !prev;
      if (!next) setSelectedDates([]);
      return next;
    });
  };

  const handleToggleDate = dateStr => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleOpenBulkModal = () => {
    if (selectedDates.length > 0) {
      setSelectedDate(null);
      setEditingLeave(null);
      setIsModalOpen(true);
    }
  };

  const handleRemoveDateChip = dateStr => {
    setSelectedDates(prev => {
      const next = prev.filter(d => d !== dateStr);
      if (next.length === 0) {
        setIsModalOpen(false);
      }
      return next;
    });
  };

  // Leave click handlers
  const handleSelectDate = dateStr => {
    const existing = leaves.find(l => l.date === dateStr);
    setSelectedDate(dateStr);
    setEditingLeave(existing || null);
    setIsModalOpen(true);
  };

  const handleEditLeave = leave => {
    setSelectedDate(leave.date);
    setEditingLeave(leave);
    setIsModalOpen(true);
  };

  const handleSaveLeave = ({ date, dates, session, reason }) => {
    if (dates && dates.length > 0) {
      saveMultipleLeaves(dates, { session, reason });
      setSelectedDates([]);
      setIsMultiSelectMode(false);
    } else if (editingLeave) {
      updateLeave(editingLeave.id, { date, session, reason });
    } else {
      addLeave({ date, session, reason });
    }
    setIsModalOpen(false);
    setEditingLeave(null);
  };

  const handleDeleteLeave = id => {
    deleteLeave(id);
    setIsModalOpen(false);
    setEditingLeave(null);
  };

  const handleExportCSV = () => {
    downloadCSV(leaves, currentYear, currentMonth);
  };

  const currentHolidayBonus = getMonthHolidayBonus(currentYear, currentMonth);
  const balanceData = calculateMonthlyBalance(
    leaves,
    currentYear,
    currentMonth,
    currentHolidayBonus
  );

  return (
    <div className="app-container">
      <Header
        onExportCSV={handleExportCSV}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      <MonthNavigator
        year={currentYear}
        month={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      <StatsOverview
        balanceData={balanceData}
        onEditHolidayQuota={() => setIsHolidayModalOpen(true)}
      />

      {/* Multi-select Controls & Action Bar */}
      <div className="calendar-toolbar">
        <button
          type="button"
          className={`btn-toggle-multi ${isMultiSelectMode ? 'active' : ''}`}
          onClick={handleToggleMultiSelect}
        >
          <span>{isMultiSelectMode ? '☑' : '☐'}</span>
          <span>{isMultiSelectMode ? 'Đang bật: Chọn nhiều ngày' : 'Chọn nhiều ngày'}</span>
        </button>
      </div>

      {isMultiSelectMode && selectedDates.length > 0 && (
        <div className="bulk-action-bar">
          <div className="bulk-info">
            <span className="bulk-icon">🗓️</span>
            <span className="bulk-count">Đã chọn: {selectedDates.length} ngày</span>
          </div>
          <div className="bulk-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedDates([])}
            >
              Bỏ chọn
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenBulkModal}
            >
              Đăng Ký {selectedDates.length} Ngày
            </button>
          </div>
        </div>
      )}

      <CalendarGrid
        year={currentYear}
        month={currentMonth}
        leaves={leaves}
        onSelectDate={handleSelectDate}
        onEditLeave={handleEditLeave}
        isMultiSelect={isMultiSelectMode}
        selectedDates={selectedDates}
        onToggleDate={handleToggleDate}
      />

      <div className="section-table">
        <div className="section-title-bar">
          <h3 className="section-title">
            Danh Sách Chi Tiết Ngày Nghỉ Tháng {currentMonth}/{currentYear} ({balanceData.records.length} lượt)
          </h3>
        </div>
        <LeaveListTable
          records={balanceData.records}
          onEdit={handleEditLeave}
          onDelete={deleteLeave}
        />
      </div>

      <LeaveModal
        isOpen={isModalOpen}
        date={selectedDate}
        dates={selectedDates.length > 0 && isMultiSelectMode ? selectedDates : undefined}
        initialData={editingLeave}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLeave(null);
        }}
        onSave={handleSaveLeave}
        onDelete={handleDeleteLeave}
        onRemoveDate={handleRemoveDateChip}
      />

      <HolidayModal
        isOpen={isHolidayModalOpen}
        year={currentYear}
        month={currentMonth}
        currentBonus={currentHolidayBonus}
        onClose={() => setIsHolidayModalOpen(false)}
        onSave={bonusDays => {
          setMonthHolidayBonus(currentYear, currentMonth, bonusDays);
          setIsHolidayModalOpen(false);
        }}
      />

      <BackupModal
        isOpen={isBackupOpen}
        leaves={leaves}
        onClose={() => setIsBackupOpen(false)}
        onImport={importLeaves}
        onClearAll={clearAllLeaves}
      />
    </div>
  );
}
