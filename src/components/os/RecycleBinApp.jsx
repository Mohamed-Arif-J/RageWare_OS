import React, { useState } from 'react';
import { soundEngine } from '../../engine/soundEngine';

const INITIAL_TRASH_ITEMS = [
  { id: 'sanity', name: 'my_sanity.dll', size: '0 KB', type: 'Dynamic Link Library', deleted: '5 minutes ago', icon: '⚙️' },
  { id: 'patience', name: 'patience_backup_1998.bak', size: '1,024 KB', type: 'Corrupted Backup', deleted: '10 minutes ago', icon: '📦' },
  { id: 'thesis', name: 'final_thesis_DO_NOT_DELETE.txt', size: '14 KB', type: 'Text Document', deleted: 'Yesterday', icon: '📝' },
  { id: 'intentions', name: 'good_intentions.doc', size: '42 KB', type: 'Word Document', deleted: 'Last Tuesday', icon: '📄' },
  { id: 'warranty', name: 'keyboard_warranty.pdf', size: '2 KB', type: 'Voided Contract', deleted: 'After rage quit', icon: '🗑️' },
];

export default function RecycleBinApp({ isChaosMode = true, onClose, onRageUpdate }) {
  const [items, setItems] = useState(INITIAL_TRASH_ITEMS);
  const [selectedId, setSelectedId] = useState('sanity');
  const [confirmStep, setConfirmStep] = useState(0); // 0 = none, 1 = first prompt, 2 = second prompt, 3 = refusal note
  const [statusMsg, setStatusMsg] = useState('');

  const handleEmptyClick = () => {
    soundEngine.playExclamation();
    setConfirmStep(1);
  };

  const handleConfirmFirstYes = () => {
    soundEngine.playExclamation();
    if (isChaosMode) {
      setConfirmStep(2);
    } else {
      // Safe mode: empties cleanly
      soundEngine.playDing();
      setItems([]);
      setConfirmStep(0);
      setStatusMsg('Recycle Bin successfully emptied.');
    }
  };

  const handleConfirmSecondYes = () => {
    // Chaos Mode refusal!
    soundEngine.playError();
    setConfirmStep(3);
    if (onRageUpdate) onRageUpdate();
  };

  const handleRestoreAll = () => {
    soundEngine.playBoing();
    setStatusMsg('All discarded files restored directly into your subconscious.');
  };

  return (
    <div className="recycle-bin-shell win95-file-manager" id="app-recycle-bin">
      {/* Retro Win95 Toolbar */}
      <div className="fm-toolbar">
        <button className="win95-btn btn-sm" onClick={handleEmptyClick} disabled={items.length === 0}>
          🗑️ Empty Recycle Bin
        </button>
        <button className="win95-btn btn-sm" onClick={handleRestoreAll} disabled={items.length === 0}>
          ⟲ Restore All Items
        </button>
      </div>

      {/* Address Bar */}
      <div className="fm-address-bar sunken">
        <span className="address-label mono">Address:</span>
        <span className="address-path mono">C:\RECYCLED\Sanity_Dump</span>
      </div>

      {statusMsg && (
        <div className="recycle-bin-toast" style={{ background: '#FFFDE0', padding: '4px 8px', fontSize: '11px', borderBottom: '1px solid #999' }}>
          {statusMsg}
        </div>
      )}

      {/* Files List View */}
      <div className="fm-content-area sunken" style={{ height: '240px', overflowY: 'auto' }}>
        <div className="fm-list-header">
          <span style={{ width: '40%' }}>Name</span>
          <span style={{ width: '20%' }}>Size</span>
          <span style={{ width: '25%' }}>Type</span>
          <span style={{ width: '15%' }}>Original Path</span>
        </div>
        <div className="fm-list-body">
          {items.map((item) => (
            <div
              key={item.id}
              className={`fm-list-row ${selectedId === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedId(item.id)}
              style={{ display: 'flex', padding: '3px 6px', fontSize: '11px', cursor: 'default' }}
            >
              <span style={{ width: '40%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </span>
              <span style={{ width: '20%' }}>{item.size}</span>
              <span style={{ width: '25%' }}>{item.type}</span>
              <span style={{ width: '15%', color: '#666' }}>C:\</span>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontStyle: 'italic' }}>
              Recycle Bin is completely empty.
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="fm-statusbar">
        <span className="status-cell sunken">{items.length} object(s)</span>
        <span className="status-cell sunken">1.08 MB</span>
        <span className="status-cell sunken">Location: Local Disk (C:)</span>
      </div>

      {/* Recursive Deletion Dialog 1 */}
      {confirmStep === 1 && (
        <div className="os-dialog-backdrop">
          <div className="win95-dialog" style={{ width: '380px' }}>
            <div className="win95-dialog-titlebar">
              <span className="win95-dialog-title">Confirm File Deletion</span>
              <button className="win95-dialog-close" onClick={() => setConfirmStep(0)}>✕</button>
            </div>
            <div className="win95-dialog-body" style={{ display: 'flex', gap: '12px', padding: '12px' }}>
              <span style={{ fontSize: '30px' }}>❓</span>
              <p style={{ fontSize: '11px', lineHeight: '1.4' }}>
                Are you sure you want to permanently delete these {items.length} items?
                <br />
                Once discarded, your <strong>my_sanity.dll</strong> will be gone forever.
              </p>
            </div>
            <div className="win95-dialog-actions" style={{ padding: '0 12px 10px 12px' }}>
              <button className="win95-btn" onClick={handleConfirmFirstYes}>Yes</button>
              <button className="win95-btn" onClick={() => setConfirmStep(0)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Recursive Deletion Dialog 2 (Are you POSITIVELY sure?) */}
      {confirmStep === 2 && (
        <div className="os-dialog-backdrop">
          <div className="win95-dialog" style={{ width: '420px' }}>
            <div className="win95-dialog-titlebar win95-titlebar-critical">
              <span className="win95-dialog-title">CONFIRMATION OF SECOND THOUGHTS</span>
              <button className="win95-dialog-close" onClick={() => setConfirmStep(0)}>✕</button>
            </div>
            <div className="win95-dialog-body" style={{ display: 'flex', gap: '12px', padding: '12px' }}>
              <span style={{ fontSize: '30px' }}>⚠️</span>
              <p style={{ fontSize: '11px', lineHeight: '1.4' }}>
                Are you <strong>POSITIVELY</strong>, mathematically, and emotionally certain?
                <br />
                This action cannot be undone. You may experience regret within 3 to 5 business days.
              </p>
            </div>
            <div className="win95-dialog-actions" style={{ padding: '0 12px 10px 12px' }}>
              <button className="win95-btn" onClick={handleConfirmSecondYes}>I Am Certain</button>
              <button className="win95-btn" onClick={() => setConfirmStep(0)}>Keep Them</button>
            </div>
          </div>
        </div>
      )}

      {/* Refusal to Delete Dialog 3 */}
      {confirmStep === 3 && (
        <div className="os-dialog-backdrop">
          <div className="win95-dialog" style={{ width: '420px' }}>
            <div className="win95-dialog-titlebar">
              <span className="win95-dialog-title">Recycle Bin Subsystem Warning</span>
              <button className="win95-dialog-close" onClick={() => setConfirmStep(0)}>✕</button>
            </div>
            <div className="win95-dialog-body" style={{ display: 'flex', gap: '12px', padding: '12px' }}>
              <span style={{ fontSize: '30px' }}>🛑</span>
              <div>
                <strong>Error 0xTRASH_REFUSAL:</strong>
                <p style={{ fontSize: '11px', lineHeight: '1.4', marginTop: '4px' }}>
                  The Recycle Bin is emotionally attached to these files and refused to empty them.
                  They have been retained for your personal reflection.
                </p>
              </div>
            </div>
            <div className="win95-dialog-actions" style={{ padding: '0 12px 10px 12px' }}>
              <button className="win95-btn" onClick={() => setConfirmStep(0)}>OK, Fine</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
