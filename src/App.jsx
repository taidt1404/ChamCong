import React, { useState } from 'react';
import Header from './components/Header';
import MonthNavigator from './components/MonthNavigator';
import StatsOverview from './components/StatsOverview';
import CalendarGrid from './components/CalendarGrid';
import LeaveModal from './components/LeaveModal';
import LeaveListTable from './components/LeaveListTable';
import BackupModal from './components/BackupModal';
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
    importLeaves,
    clearAllLeaves
  } = useLeaves();

  // Modal states
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

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

  const handleSaveLeave = ({ date, session, reason }) => {
    if (editingLeave) {
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

  const balanceData = calculateMonthlyBalance(leaves, currentYear, currentMonth);

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

      <StatsOverview balanceData={balanceData} />

      <CalendarGrid
        year={currentYear}
        month={currentMonth}
        leaves={leaves}
        onSelectDate={handleSelectDate}
        onEditLeave={handleEditLeave}
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
        initialData={editingLeave}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLeave(null);
        }}
        onSave={handleSaveLeave}
        onDelete={handleDeleteLeave}
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
