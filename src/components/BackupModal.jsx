import React, { useState } from 'react';
import { downloadJSON } from '../utils/exportUtils';

export default function BackupModal({ isOpen, leaves, onClose, onImport, onClearAll }) {
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target.result);
        const count = onImport(parsed);
        setImportStatus(`Đã nạp thành công ${count} bản ghi!`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err) {
        setImportStatus('Lỗi: File JSON không hợp lệ!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card backup-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Sao Lưu & Khôi Phục Dữ Liệu</h3>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="backup-sections">
          <div className="backup-card">
            <h4>Xuất file dữ liệu dự phòng (JSON)</h4>
            <p>Tải toàn bộ lịch sử ngày nghỉ về máy tính để bảo quản hoặc chuyển thiết bị.</p>
            <button className="btn btn-primary" onClick={() => downloadJSON(leaves)}>
              Tải File Sao Lưu (.json)
            </button>
          </div>

          <div className="backup-card">
            <h4>Nạp file dự phòng (Restore)</h4>
            <p>Khôi phục lại lịch nghỉ từ file .json đã sao lưu trước đó.</p>
            <input
              type="file"
              accept=".json"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="btn btn-secondary upload-btn">
              Chọn File JSON
            </label>
            {importStatus && <p className="import-status">{importStatus}</p>}
          </div>

          <div className="backup-card danger-zone">
            <h4>Xóa toàn bộ dữ liệu</h4>
            <p>Đặt lại toàn bộ lịch nghỉ về trạng thái ban đầu. Hãy cẩn thận!</p>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch nghỉ không?')) {
                  onClearAll();
                  onClose();
                }
              }}
            >
              Xóa Hết Dữ Liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
