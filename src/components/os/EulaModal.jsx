import React, { useState, useRef, useEffect } from 'react';
import { soundEngine } from '../../engine/soundEngine';

const EULA_SECTIONS = [
  "1. GRANT OF RESTRICTED TOLERANCE: RAGEWARE OS grants you a non-exclusive, revocable, and deeply questionable license to experience interface friction.",
  "2. OWNERSHIP OF INPUT PERIPHERALS: By continuing, you acknowledge that your physical mouse pointer, optical sensor, and click latency belong to RAGEWARE.",
  "3. WAIVER OF CALMNESS: The user agrees to surrender all expectations of intuitive user experience, predictable button behavior, and linear progress indicators.",
  "4. SPEED-READING PROHIBITION: Speed-reading or attempting to bypass this document using mouse wheel flicking violates Section 14-B of the Subconscious Friction Accord.",
  "5. TELEMETRY OF DESPAIR: The system continuously records keyboard bottom-out force, cursor oscillation frequency, and involuntary vocal exasperations.",
  "6. ARBITRARY MODAL GENERATION: The operating system reserves the right to present modal dialogs at moments of maximum cognitive vulnerability.",
  "7. DISMISSAL CLAUSE: Clicking 'Cancel' shall not cancel any process, but may instead generate an additional confirmation inquiring why you gave up.",
  "8. BACKSPACE PROTOCOL: The backspace key is considered advisory and may introduce random punctuation to stimulate typing versatility.",
  "9. FILE LOSS INDEMNIFICATION: Files moved to the desktop may undergo spontaneous quantum relocation to unrelated folders.",
  "10. OPTICAL SENSOR SURVEILLANCE: Facial micro-expressions depicting annoyance, eye-rolling, or forehead wrinkles will be archived for scientific study.",
  "11. CPU CYCLE CONFISCATION: 30% of system clock cycles will be devoted to rendering artificial hourglasses and backwards progress bars.",
  "12. SOUL TRANSFER COMPLIANCE: In jurisdictions where digital soul transfer is legally permissible, you hereby assign 49% equity in your patience.",
  "13. AUDITORY GASLIGHTING: The operating system may emit faint hardware disconnection chimes to instill peripheral doubt.",
  "14. TERMINAL BEHAVIOR: Any attempt to execute 'exit' in the MS-DOS Prompt requires written permission from an administrator who does not exist.",
  "15. RECYCLE BIN JURISDICTION: Files deposited in the Recycle Bin may decide to stay there indefinitely or multiply upon inspection.",
  "16. BUTTON EVASION WARRANTY: No warranty is provided that buttons will remain under the cursor at the precise millisecond of actuation.",
  "17. INERTIAL MOUSE DRIFT: In cases of elevated agitation, the mouse pointer may mimic the kinematic properties of ice or damp butter.",
  "18. CLOUD VOID INTEGRATION: Documents saved to cloud directories may route directly to Nothing as a Service™ (NaaS).",
  "19. SHUTDOWN OBSTRUCTION: The Shutdown dialog reserves the right to ask if you are truly ready to leave this simulated 1998 paradise.",
  "20. NON-REFUNDABLE SANITY: No tokens of lost composure shall be reimbursed under any circumstances.",
];

export default function EulaModal({ isOpen, onClose, onRageUpdate }) {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef(null);
  const lastScrollTopRef = useRef(0);
  const lastScrollTimeRef = useRef(Date.now());
  const openTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isOpen) {
      soundEngine.playExclamation();
      openTimeRef.current = Date.now();
      setHasReachedBottom(false);
      setViolationMessage('');
      setScrollProgress(0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScroll = (e) => {
    const target = e.target;
    const now = Date.now();
    const dt = Math.max(1, now - lastScrollTimeRef.current);
    const dy = Math.abs(target.scrollTop - lastScrollTopRef.current);
    const velocity = dy / dt; // pixels per millisecond

    const progress = Math.min(
      100,
      Math.round(
        (target.scrollTop / Math.max(1, target.scrollHeight - target.clientHeight)) * 100
      )
    );
    setScrollProgress(progress);

    // Speed-Reading Violation Check
    // If scrolled faster than 3.5 px/ms or jumped to bottom within 2.5 seconds of opening
    if (velocity > 3.8 || (progress > 85 && now - openTimeRef.current < 2600)) {
      soundEngine.playError();
      target.scrollTop = 0;
      setViolationMessage(
        '⚠️ SPEED-READING VIOLATION: Telemetry indicates human eyes cannot read clause 12 at this velocity. Document reset to top.'
      );
      setHasReachedBottom(false);
      if (onRageUpdate) onRageUpdate('speedReadingViolation', 8);
      return;
    }

    lastScrollTopRef.current = target.scrollTop;
    lastScrollTimeRef.current = now;

    // Check if genuinely near bottom
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 25) {
      if (!hasReachedBottom) {
        soundEngine.playDing();
        setHasReachedBottom(true);
        setViolationMessage('');
      }
    }
  };

  const handleAccept = () => {
    if (!hasReachedBottom) return;
    soundEngine.playTada();
    if (onRageUpdate) onRageUpdate('eulaAccepted', -10); // Reward calm persistence!
    if (onClose) onClose();
  };

  return (
    <div className="os-dialog-backdrop eula-backdrop">
      <div className="win95-dialog eula-modal-window">
        {/* Title Bar */}
        <div className="win95-dialog-titlebar">
          <div className="win95-dialog-titlebar-text">
            <span>📜</span> RAGEWARE License Agreement & Soul Transfer Policy
          </div>
          <button
            className="win95-dialog-close"
            onClick={() => {
              soundEngine.playCriticalStop();
              alert('You cannot close the license agreement without agreeing to it.');
            }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="win95-dialog-body eula-body">
          <div className="eula-header-note">
            Please read the following 400 clauses carefully before operating RAGEWARE OS.
            <br />
            <strong>You must scroll to the very bottom to accept.</strong>
          </div>

          {violationMessage && (
            <div className="eula-violation-banner">
              {violationMessage}
            </div>
          )}

          {/* Sunken Scroll Box */}
          <div
            ref={scrollContainerRef}
            className="eula-scroll-box sunken"
            onScroll={handleScroll}
          >
            <div className="eula-scroll-content mono">
              <h4 style={{ textAlign: 'center', marginBottom: '12px' }}>
                END USER LICENSE AGREEMENT (EULA) — REVISION 98.4
              </h4>

              {Array.from({ length: 20 }).map((_, loopIdx) => (
                <div key={loopIdx} className="eula-loop-section">
                  {EULA_SECTIONS.map((sec, idx) => (
                    <p key={idx} className="eula-clause">
                      <strong>Section {loopIdx * 20 + idx + 1}.</strong> {sec}
                    </p>
                  ))}
                </div>
              ))}

              <div className="eula-end-marker">
                *** END OF CLAUSES — YOU ARE NOW LEGALLY BOUND FOR 99 YEARS ***
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="eula-progress-strip">
            <span className="mono">Progress: {scrollProgress}% read</span>
            <div className="eula-mini-track sunken">
              <div className="eula-mini-bar" style={{ width: `${scrollProgress}%` }} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="win95-dialog-actions eula-actions">
            <button
              className={`win95-btn ${hasReachedBottom ? 'eula-btn-ready' : 'disabled'}`}
              disabled={!hasReachedBottom}
              onClick={handleAccept}
            >
              ✓ I Agree & Relinquish All Rights
            </button>
            <button
              className="win95-btn"
              onClick={() => {
                soundEngine.playExclamation();
                alert('Declining will immediately forfeit your desktop session.');
              }}
            >
              I Disagree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
