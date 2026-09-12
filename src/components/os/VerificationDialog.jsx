import React, { useState, useRef } from 'react';
import { increaseRage, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';
import { IconShieldAlert } from './OSIcons';
import { soundEngine } from '../../engine/soundEngine';

const BUTTON_LABELS = ['VERIFY NOW', 'VERIFY', 'CONTINUE', 'CONFIRM', 'OK', 'YES', 'CLICK ME'];

export default function VerificationDialog({ isOpen = false, onClose, onRageUpdate }) {
  const [escapes, setEscapes] = useState(0);
  const [btnPos, setBtnPos] = useState({ x: 50, y: 50, isPercent: true });
  const [buttonLabel, setButtonLabel] = useState('VERIFY NOW');
  const [statusMsg, setStatusMsg] = useState('System verification required.');
  const [isSuccess, setIsSuccess] = useState(false);
  const arenaRef = useRef(null);
  const lastEscapeTime = useRef(0);

  if (!isOpen) return null;

  const performHop = (currentEscapes) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const btnW = 120;
    const btnH = 34;
    const maxX = Math.max(10, rect.width - btnW - 10);
    const maxY = Math.max(10, rect.height - btnH - 10);

    // Section 9: button moves 30–80px
    const stepX = (Math.random() > 0.5 ? 1 : -1) * (30 + Math.floor(Math.random() * 50));
    const stepY = (Math.random() > 0.5 ? 1 : -1) * (20 + Math.floor(Math.random() * 40));

    setBtnPos((prev) => {
      const currentX = prev.isPercent ? (rect.width * prev.x) / 100 : prev.x;
      const currentY = prev.isPercent ? (rect.height * prev.y) / 100 : prev.y;
      const targetX = Math.max(10, Math.min(maxX, currentX + stepX));
      const targetY = Math.max(10, Math.min(maxY, currentY + stepY));
      return { x: targetX, y: targetY, isPercent: false };
    });

    soundEngine.playBoing(); // Evasive button hop!

    const nextLabel = BUTTON_LABELS[Math.floor(Math.random() * BUTTON_LABELS.length)];
    setButtonLabel(nextLabel);
  };

  const triggerEscape = () => {
    if (isSuccess) return;

    const now = Date.now();
    if (now - lastEscapeTime.current < 180) return;
    lastEscapeTime.current = now;

    // Eventually allow the user to click it (after 4 escapes, 40% chance of stability)
    if (escapes >= 4 && Math.random() < 0.45) {
      setStatusMsg('VERIFY SYSTEM: PLEASE CLICK NOW');
      return;
    }

    performHop(escapes);

    // Section 9: Sometimes moves -> moves again -> changes text
    if (Math.random() < 0.35) {
      setTimeout(() => {
        performHop(escapes + 1);
      }, 130);
    }

    setEscapes((prev) => prev + 1);
    setStatusMsg(`System verification required. [Attempt ${escapes + 1}]`);

    increaseRage(8, RAGE_EVENTS.VERIFICATION_BUTTON_ESCAPE);
    if (onRageUpdate) onRageUpdate();
  };

  const handleVerifyClick = (e) => {
    e.stopPropagation();
    if (isSuccess) return;

    setIsSuccess(true);
    setStatusMsg('System verification confirmed.');
    soundEngine.playDing();
    recordSuccess();
    if (onRageUpdate) onRageUpdate();

    setTimeout(() => {
      if (onClose) onClose();
    }, 850);
  };

  return (
    <div className="os-dialog-backdrop">
      <div className="verification-dialog-box" onClick={(e) => e.stopPropagation()}>
        {/* Title Bar */}
        <div className="os-dialog-titlebar">
          <span className="os-dialog-title mono">RAGEWARE SECURITY</span>
          <button className="dialog-close-btn" onClick={onClose}>&times;</button>
        </div>

        {/* Content */}
        <div className="verification-dialog-content">
          <div className="verification-icon-banner">
            <IconShieldAlert size={36} className="danger" />
            <div>
              <h4 className="verification-title mono">System verification required.</h4>
              <p className="verification-desc">
                An active identity confirmation check is required to maintain operating system integrity.
              </p>
            </div>
          </div>

          <div className="verification-status-pill mono">
            <span>{statusMsg}</span>
            <span>EVASIONS: <strong>{escapes}</strong></span>
          </div>

          {/* Interactive Bounded Arena */}
          <div ref={arenaRef} className="verification-arena">
            <button
              id="btn-verify-now"
              className={`btn-verify-action mono ${isSuccess ? 'success' : ''}`}
              style={
                btnPos.isPercent
                  ? { left: `${btnPos.x}%`, top: `${btnPos.y}%`, transform: 'translate(-50%, -50%)' }
                  : { left: `${btnPos.x}px`, top: `${btnPos.y}px` }
              }
              onMouseEnter={triggerEscape}
              onClick={handleVerifyClick}
            >
              {isSuccess ? '✓ VERIFIED' : `[ ${buttonLabel} ]`}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="verification-footer mono">
          <span>RAGEWARE KERNEL SECURITY</span>
          <span>PATIENCE SENSOR: OBSERVING</span>
        </div>
      </div>
    </div>
  );
}
