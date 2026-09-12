import React from 'react';
import { IconShieldAlert } from './OSIcons';

export default function OSDialog({
  isOpen = false,
  title = 'SYSTEM MESSAGE',
  message = 'Something went slightly wrong.',
  type = 'warning', // 'warning' | 'error' | 'info'
  confirmLabel = '[ OK ]',
  cancelLabel,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="os-dialog-backdrop" onClick={onCancel || onConfirm}>
      <div className="os-dialog-box" onClick={(e) => e.stopPropagation()}>
        {/* Title Bar */}
        <div className="os-dialog-titlebar">
          <span className="os-dialog-title mono">{title}</span>
          <button className="dialog-close-btn" onClick={onCancel || onConfirm}>&times;</button>
        </div>

        {/* Content */}
        <div className="os-dialog-content">
          <div className={`os-dialog-icon ${type}`}>
            <IconShieldAlert size={32} />
          </div>
          <div className="os-dialog-msg mono">
            {message}
          </div>
        </div>

        {/* Buttons */}
        <div className="os-dialog-actions">
          {cancelLabel && (
            <button 
              className="btn-dialog-secondary mono"
              onClick={onCancel}
              id="dialog-btn-cancel"
            >
              {cancelLabel}
            </button>
          )}
          <button 
            className="btn-dialog-primary mono"
            onClick={onConfirm}
            id="dialog-btn-confirm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
