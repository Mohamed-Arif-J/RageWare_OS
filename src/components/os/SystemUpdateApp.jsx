import React, { useState, useEffect, useRef } from 'react';
import { recordFailure, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';
import { IconCpu, IconError, IconWarning } from './OSIcons';
import { soundEngine } from '../../engine/soundEngine';

export default function SystemUpdateApp({ onRageUpdate, isChaosMode = true }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'stalled' | 'failed' | 'complete'
  const [attempts, setAttempts] = useState(1);
  const [retryPos, setRetryPos] = useState({ x: 0, y: 0 });
  const [statusMsg, setStatusMsg] = useState('Copying files: C:\\RAGEWARE\\SYSTEM\\KERNEL32.DLL');
  const timerRef = useRef(null);

  const FILE_LIST = [
    'Copying: C:\\RAGEWARE\\SYSTEM\\KERNEL32.DLL',
    'Updating: C:\\RAGEWARE\\DRIVERS\\VGA_COGNITIVE.DRV',
    'Extracting: C:\\RAGEWARE\\INF\\HOSTILITY_V2.INF',
    'Writing: C:\\RAGEWARE\\SYSTEM\\USER32_EVASIVE.DLL',
    'Registering COM Object: CLSID_{7C3AED-RAGE-98}...',
    'Configuring registry: HKEY_LOCAL_MACHINE\\Software\\Rageware',
    'Checking digital signature and patience coefficient...',
    'Writing checksum to sector 0x7FFE0000 (FINALIZING)...',
  ];

  const startUpdate = (isRetry = false) => {
    setProgress(0);
    setPhase('loading');
    setStatusMsg(isRetry ? 'Retrying installation: verifying sector 0x00...' : FILE_LIST[0]);

    let current = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      let increment = 1;
      if (current < 45) increment = Math.floor(Math.random() * 6) + 3;
      else if (current < 85) increment = Math.floor(Math.random() * 4) + 1;
      else if (current < 98) increment = 1;

      current = Math.min(99, current + increment);
      setProgress(current);

      const fileIdx = Math.min(FILE_LIST.length - 1, Math.floor((current / 100) * FILE_LIST.length));
      setStatusMsg(FILE_LIST[fileIdx]);

      if (current === 99) {
        clearInterval(timerRef.current);
        setPhase('stalled');
        setStatusMsg('Setup is updating system configuration (Please wait)...');

        const willSucceed = !isChaosMode || (isRetry && (attempts >= 2 || Math.random() < 0.5));

        setTimeout(() => {
          if (willSucceed) {
            setProgress(100);
            setPhase('complete');
            setStatusMsg('Setup has successfully updated your computer.');
            soundEngine.playDing();
            recordSuccess();
            if (onRageUpdate) onRageUpdate();
          } else {
            setPhase('failed');
            setStatusMsg('Error 0x80040154: Data error (cyclic redundancy check).');
            soundEngine.playCriticalStop(); // Classic Win95 Critical Stop for update failure!
            recordFailure(RAGE_EVENTS.FAKE_UPDATE_STALL);
            if (onRageUpdate) onRageUpdate();
          }
        }, isChaosMode ? 2800 : 700);
      }
    }, 110);
  };

  useEffect(() => {
    startUpdate(false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRetryHover = () => {
    if (isChaosMode && Math.random() < 0.5) {
      const offsetX = (Math.random() - 0.5) * 160;
      const offsetY = (Math.random() - 0.5) * 70;
      setRetryPos({ x: offsetX, y: offsetY });
      soundEngine.playBoing(); // Evasive button boing!
    }
  };

  const handleRetryClick = () => {
    setAttempts((prev) => prev + 1);
    setRetryPos({ x: 0, y: 0 });
    startUpdate(true);
  };

  // Build classic Win95 segmented progress blocks (each block is 10px wide with 2px gap)
  const totalBlocks = 24;
  const filledBlocks = Math.round((progress / 100) * totalBlocks);

  return (
    <div className="win95-wizard-shell" id="app-system-update">
      {/* Wizard Header Banner */}
      <div className="wizard-top-banner">
        <div className="wizard-top-text">
          <div className="wizard-title">RAGEWARE 98 Setup</div>
          <div className="wizard-subtitle">
            {phase === 'failed'
              ? 'Setup was interrupted by an unexpected error.'
              : phase === 'complete'
              ? 'Update complete.'
              : 'Installing critical system components and drivers.'}
          </div>
        </div>
        <div className="wizard-top-icon">
          {phase === 'failed' ? (
            <IconError size={32} />
          ) : phase === 'stalled' ? (
            <IconWarning size={32} />
          ) : (
            <IconCpu size={32} />
          )}
        </div>
      </div>

      <div className="win95-groove-line" />

      {/* Wizard Body */}
      <div className="wizard-body">
        <p className="wizard-desc">
          Setup is currently installing components required for optimal emotional response and window coordination.
        </p>

        {/* Progress Display */}
        <div className="wizard-progress-section">
          <div className="wizard-progress-header">
            <span>Progress: {progress}%</span>
            <span>Attempt #{attempts}</span>
          </div>

          {/* Classic Win95 Segmented Progress Bar */}
          <div className="win95-progressbar-track">
            {Array.from({ length: totalBlocks }).map((_, i) => (
              <div
                key={i}
                className={`win95-progressbar-block ${i < filledBlocks ? 'filled' : ''} ${
                  phase === 'failed' ? 'failed' : ''
                }`}
              />
            ))}
          </div>

          {/* Sunken Status Text Box */}
          <div className="win95-sunken-field status-readout">
            <span className={phase === 'failed' ? 'text-danger' : ''}>{statusMsg}</span>
          </div>
        </div>

        {/* Error Notification Box */}
        {phase === 'failed' && (
          <div className="win95-error-callout">
            <IconError size={24} />
            <div className="error-callout-text">
              <strong>Installation Halted:</strong>
              <div>
                The installation program encountered an unrecoverable checksum fault while applying patch
                RW-049. User action is required to re-attempt recovery.
              </div>
            </div>
          </div>
        )}

        {phase === 'complete' && (
          <div className="win95-success-callout">
            <strong>System Update Completed:</strong> All virtual drivers and cognitive tracking libraries have been registered.
          </div>
        )}
      </div>

      <div className="win95-groove-line" />

      {/* Wizard Footer with Classic Command Buttons */}
      <div className="wizard-footer">
        <div className="wizard-footer-note">
          {phase === 'stalled' && <span className="text-warning">● Writing to registry... do not cancel.</span>}
        </div>
        <div className="wizard-btn-row">
          {phase === 'failed' ? (
            <button
              id="btn-retry-update"
              className="win95-btn default-btn"
              style={{
                transform: `translate(${retryPos.x}px, ${retryPos.y}px)`,
                transition: 'transform 0.1s ease-out',
                position: 'relative',
              }}
              onMouseEnter={handleRetryHover}
              onClick={handleRetryClick}
            >
              Retry
            </button>
          ) : (
            <button className="win95-btn" disabled>
              &lt; Back
            </button>
          )}

          <button
            className="win95-btn"
            disabled={phase !== 'complete'}
            onClick={() => {
              /* Close or finish */
            }}
          >
            {phase === 'complete' ? 'Finish' : 'Next &gt;'}
          </button>

          <button
            className="win95-btn"
            onClick={() => {
              alert('Setup cannot be cancelled while modifying low-level cognitive drivers.');
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
