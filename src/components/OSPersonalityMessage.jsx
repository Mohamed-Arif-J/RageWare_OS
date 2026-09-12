import React from 'react';
import { IconShieldAlert, IconInfo } from './os/OSIcons';

/**
 * OSPersonalityMessage — Step 6 Authentic Windows 95/98 Personality Message
 * 
 * Displays rule-based contextual OS messages in classic retro styling:
 * - Gray/silver chassis with beveled edges (raised border)
 * - Dark blue title bar with square close button
 * - Clean retro monospaced / MS Sans Serif typography
 * - Used for high-severity OS personality interventions, observations, and dialogs.
 */
export default function OSPersonalityMessage({
  message,
  onClose,
}) {
  if (!message) return null;

  const isHighSeverity = message.severity === 'high';

  return (
    <div className="os-personality-dialog-backdrop" onClick={onClose}>
      <div 
        className="win95-personality-window raised" 
        id="os-personality-message"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Retro Title Bar */}
        <div className={`win95-titlebar ${isHighSeverity ? 'danger-titlebar' : ''}`}>
          <div className="titlebar-left">
            <IconInfo size={14} />
            <span className="titlebar-title">{message.title || 'RAGEWARE SYSTEM'}</span>
          </div>
          <div className="titlebar-controls">
            <button 
              className="win95-ctrl-btn raised" 
              onClick={onClose}
              title="Dismiss"
            >
              &#10005;
            </button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="personality-body">
          <div className="personality-icon-col">
            <IconShieldAlert size={32} className={isHighSeverity ? 'danger-icon' : 'info-icon'} />
          </div>
          <div className="personality-text-col">
            <div className="personality-message-text">
              {(message.text || message.message || '').split('\n').map((paragraph, idx) => (
                <p key={idx} className="personality-paragraph">{paragraph}</p>
              ))}
            </div>
            {message.severity && (
              <div className="personality-badge mono">
                AWARENESS LOG // LEVEL: {message.severity.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Action Button Row */}
        <div className="personality-actions">
          <button 
            id="btn-personality-ack"
            className="win95-btn default-btn"
            onClick={onClose}
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
