import React, { useState } from 'react';
import { IconCpu } from './OSIcons';
import { soundEngine } from '../../engine/soundEngine';

export default function ShutdownDialog({ isOpen = false, onConfirm, onCancel }) {
  const [selectedAction, setSelectedAction] = useState('shutdown'); // 'shutdown' | 'restart' | 'dos'

  if (!isOpen) return null;

  const handleConfirm = () => {
    soundEngine.playClick();
    if (onConfirm) onConfirm(selectedAction);
  };

  const handleCancel = () => {
    soundEngine.playClick();
    if (onCancel) onCancel();
  };

  const handleHelp = () => {
    soundEngine.playExclamation();
    alert('RAGEWARE OS HELP:\n\nHelp is currently unavailable.\nThe operating system has graciously decided to let you shut down.\nDo not look a gift horse in the mouth.');
  };

  return (
    <div className="os-dialog-backdrop" onClick={handleCancel}>
      <div 
        className="win95-window win95-shutdown-dialog" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="shutdown-dialog-title"
      >
        {/* Titlebar */}
        <div className="win95-titlebar active">
          <div className="titlebar-left">
            <span className="window-icon-wrap">
              <IconCpu size={16} />
            </span>
            <span className="window-title-text" id="shutdown-dialog-title">
              Shut Down RAGEWARE
            </span>
          </div>
          <div className="win95-titlebar-controls">
            <button 
              className="win95-ctrl-btn btn-close" 
              onClick={handleCancel}
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="win95-shutdown-body">
          <div className="shutdown-graphic-col">
            <div className="shutdown-computer-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                {/* Vintage CRT Monitor with power indicator */}
                <rect x="6" y="6" width="36" height="28" rx="2" fill="#D4D0C8" stroke="#000" strokeWidth="2" />
                <rect x="10" y="10" width="28" height="20" fill="#000080" />
                <polygon points="14,14 20,20 14,26" fill="#00FFFF" />
                <rect x="18" y="34" width="12" height="5" fill="#808080" stroke="#000" strokeWidth="1.5" />
                <polygon points="12,39 36,39 40,43 8,43" fill="#C0C0C0" stroke="#000" strokeWidth="2" />
                {/* Power switch indicator */}
                <circle cx="34" cy="31" r="2" fill="#FF3333" />
              </svg>
            </div>
          </div>

          <div className="shutdown-options-col">
            <div className="shutdown-prompt-label">
              What do you want the computer to do?
            </div>

            <div className="shutdown-radio-group">
              <label className="shutdown-radio-row">
                <input 
                  type="radio" 
                  name="shutdown-action" 
                  value="shutdown"
                  checked={selectedAction === 'shutdown'}
                  onChange={() => setSelectedAction('shutdown')}
                />
                <span className="radio-text">
                  <u>S</u>hut down the computer?
                </span>
              </label>

              <label className="shutdown-radio-row">
                <input 
                  type="radio" 
                  name="shutdown-action" 
                  value="restart"
                  checked={selectedAction === 'restart'}
                  onChange={() => setSelectedAction('restart')}
                />
                <span className="radio-text">
                  <u>R</u>estart the computer?
                </span>
              </label>

              <label className="shutdown-radio-row">
                <input 
                  type="radio" 
                  name="shutdown-action" 
                  value="dos"
                  checked={selectedAction === 'dos'}
                  onChange={() => setSelectedAction('dos')}
                />
                <span className="radio-text">
                  Restart computer in <u>M</u>S-DOS mode?
                </span>
              </label>
            </div>

            <div className="shutdown-warning-note mono">
              * Active patience score and interaction telemetry will be finalized and safely archived.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="win95-dialog-footer shutdown-footer">
          <button 
            id="btn-shutdown-confirm"
            className="win95-btn default-btn"
            onClick={handleConfirm}
            autoFocus
          >
            Yes
          </button>
          <button 
            id="btn-shutdown-cancel"
            className="win95-btn"
            onClick={handleCancel}
          >
            No
          </button>
          <button 
            id="btn-shutdown-help"
            className="win95-btn"
            onClick={handleHelp}
          >
            Help
          </button>
        </div>
      </div>
    </div>
  );
}
