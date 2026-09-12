import React, { useState, useEffect, useRef } from 'react';
import { recordFailure, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';
import { generateAsciiRageBar } from '../../utils';

export default function FakeLoadingChallenge({ onComplete, onStateChange }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'stalled' | 'failed' | 'complete'
  const [attemptCount, setAttemptCount] = useState(1);
  const [statusText, setStatusText] = useState('FETCHING PATCH PACKETS...');
  const timerRef = useRef(null);

  const startLoading = (isRetry = false) => {
    setProgress(0);
    setPhase('loading');
    setStatusText(isRetry ? 'RETRYING BUFFER SYNCHRONIZATION...' : 'INITIALIZING CRITICAL UPDATE...');

    let current = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      // Accelerate initially, then slow down as it approaches 99%
      let increment = 1;
      if (current < 50) increment = Math.floor(Math.random() * 8) + 4;
      else if (current < 85) increment = Math.floor(Math.random() * 4) + 2;
      else if (current < 98) increment = 1;

      current = Math.min(99, current + increment);
      setProgress(current);

      if (current === 99) {
        clearInterval(timerRef.current);
        setPhase('stalled');
        setStatusText('FINALIZING CHECKSUM (DO NOT DISCONNECT)...');

        // Check if this attempt should succeed (e.g. on attempt >= 2, 60% chance to finish)
        const willSucceed = isRetry && (attemptCount >= 2 || Math.random() < 0.6);

        setTimeout(() => {
          if (willSucceed) {
            setProgress(100);
            setPhase('complete');
            setStatusText('UPDATE VERIFIED. PATCH APPLIED SUCCESSFULLY.');
            recordSuccess();
            if (onStateChange) onStateChange();

            setTimeout(() => {
              onComplete();
            }, 1400);
          } else {
            setPhase('failed');
            setStatusText('FATAL ERROR: BUFFER TIMEOUT AT CHECKSUM 0x99FF4');
            recordFailure(RAGE_EVENTS.FAKE_LOADING_FAILURE);
            if (onStateChange) onStateChange();
          }
        }, 2600); // Stall at 99% for 2.6 seconds
      }
    }, 120);
  };

  useEffect(() => {
    startLoading(false);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleRetry = () => {
    setAttemptCount((prev) => prev + 1);
    startLoading(true);
  };

  const asciiTrack = generateAsciiRageBar(progress, 20);

  return (
    <div className="challenge-body" id="fake-loading-challenge">
      <div className="challenge-subhead">
        <span className="mission-tag">MISSION 02</span>
        <h2 className="mission-title">SYSTEM UPDATE</h2>
        <div className="mission-tracker">
          <span className="tracker-pill">ATTEMPT: <strong>{attemptCount}</strong></span>
          <span className={`tracker-status ${phase === 'failed' ? 'error' : phase === 'complete' ? 'success' : ''}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="interactive-arena loading-arena">
        <div className="loading-container">
          <div className="loading-label-row">
            <span className="loading-title mono">
              {phase === 'failed' ? 'PROCESS FAILED.' : phase === 'complete' ? 'INSTALLATION COMPLETE' : 'INSTALLING...'}
            </span>
            <span className={`loading-percent mono ${phase === 'stalled' ? 'blink-warning' : ''}`}>
              {progress}%
            </span>
          </div>

          <div className="loading-bar-shell">
            <div 
              className={`loading-bar-gauge ${phase === 'failed' ? 'gauge-failed' : phase === 'complete' ? 'gauge-complete' : ''}`}
              style={{ width: `${progress}%` }}
            />
            <div className="loading-bar-ascii mono">
              {asciiTrack} {progress}%
            </div>
          </div>

          {phase === 'stalled' && (
            <div className="stalled-warning mono">
              ⚠ SYNCHRONIZING SECURE KEY... PLEASE STAND BY
            </div>
          )}

          {phase === 'failed' && (
            <div className="failure-box">
              <div className="failure-msg mono">
                [!] EXCEPTION IN MODULE: IO_ERR_STALL_AT_99
              </div>
              <button 
                id="btn-retry-loading"
                className="btn-retry"
                onClick={handleRetry}
              >
                [ RETRY UPDATE ]
              </button>
            </div>
          )}

          {phase === 'complete' && (
            <div className="complete-msg mono">
              ✓ SYSTEM STABILIZED. PROCEEDING TO NEXT VECTOR...
            </div>
          )}
        </div>
      </div>

      <div className="challenge-caption">
        * Bandwidth throttled dynamically to match emotional variance.
      </div>
    </div>
  );
}
