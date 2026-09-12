import React, { useState, useEffect } from 'react';
import { soundEngine } from '../../engine/soundEngine';

export default function ShutdownScreen({ type = 'shutdown', onRestart, onReturnLanding }) {
  // Stages: 'waiting' -> 'safe'
  const [stage, setStage] = useState('waiting');
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    // Play authentic descending Windows 95 shutdown chime
    soundEngine.playShutdown();

    const waitTimer = setTimeout(() => {
      if (type === 'restart') {
        if (onRestart) onRestart('normal');
      } else if (type === 'dos') {
        if (onRestart) onRestart('dos');
      } else {
        setStage('safe');
      }
    }, 2800);

    return () => clearTimeout(waitTimer);
  }, [type, onRestart]);

  // Auto-redirect countdown on 'safe' screen
  useEffect(() => {
    if (stage !== 'safe') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onReturnLanding) onReturnLanding();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [stage, onReturnLanding]);

  const handleRestartClick = () => {
    soundEngine.playClick();
    if (onRestart) onRestart('normal');
  };

  const handleLandingClick = () => {
    soundEngine.playClick();
    if (onReturnLanding) onReturnLanding();
  };

  return (
    <div className="os-shutdown-screen-root" id="shutdown-screen">
      {/* Ambient CRT Scanline Overlay */}
      <div className="shutdown-crt-overlay" />

      {stage === 'waiting' && (
        <div className="shutdown-waiting-container">
          {/* Classic Win95 Clouds & Logo */}
          <div className="shutdown-logo-wrapper">
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
              <defs>
                <filter id="sdShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="3" dy="4" stdDeviation="0" floodColor="#002222" floodOpacity="0.8" />
                </filter>
              </defs>
              {/* Retro 4-color wave flag */}
              <g filter="url(#sdShadow)">
                <polygon points="12,18 48,8 48,42 12,52" fill="#E60000" stroke="#000" strokeWidth="1.5" />
                <polygon points="56,6 92,16 92,50 56,40" fill="#00A82D" stroke="#000" strokeWidth="1.5" />
                <polygon points="12,58 48,48 48,82 12,92" fill="#0066CC" stroke="#000" strokeWidth="1.5" />
                <polygon points="56,46 92,56 92,90 56,80" fill="#FFB300" stroke="#000" strokeWidth="1.5" />
              </g>
            </svg>
            <div className="shutdown-brand-title">
              RAGEWARE<span className="brand-sub">98</span>
            </div>
            <div className="shutdown-brand-team mono">
              MADE BY TEAM AltF4
            </div>
          </div>

          {/* Prompt text */}
          <div className="shutdown-message-box">
            <div className="shutdown-msg-text">
              {type === 'restart' || type === 'dos'
                ? 'Please wait while your computer restarts.'
                : 'Please wait while your computer shuts down.'}
            </div>

            {/* Retro animated progress dots / hourglass */}
            <div className="shutdown-progress-indicator">
              <span className="shutdown-hourglass">⌛</span>
              <div className="shutdown-dots-strip">
                <span className="dot d1" />
                <span className="dot d2" />
                <span className="dot d3" />
                <span className="dot d4" />
                <span className="dot d5" />
              </div>
            </div>
          </div>
        </div>
      )}

      {stage === 'safe' && (
        <div className="shutdown-safe-container">
          <div className="shutdown-safe-inner">
            {/* The Legendary Orange / Amber Text */}
            <h1 className="shutdown-safe-text">
              It's now safe to turn off your computer.
            </h1>

            <div className="shutdown-safe-sub mono">
              RAGEWARE 98 COGNITIVE BENCHMARK COMPLETED &bull; ALL TELEMETRY SAFELY PARKED
            </div>

            <div className="shutdown-safe-team mono">
              DEVELOPED FROM SCRATCH BY TEAM <strong>AltF4</strong>
            </div>

            {/* Interactive Terminal Controls */}
            <div className="shutdown-safe-actions">
              <button 
                id="btn-shutdown-reboot"
                className="btn-shutdown-amber mono"
                onClick={handleRestartClick}
              >
                [ ⟳ POWER ON / REBOOT ]
              </button>
              <button 
                id="btn-shutdown-landing"
                className="btn-shutdown-amber mono"
                onClick={handleLandingClick}
              >
                [ ◄ RETURN TO LAUNCHPAD ]
              </button>
            </div>

            <div className="shutdown-safe-countdown mono">
              Returning to Launchpad automatically in <strong>{countdown}s</strong>...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
