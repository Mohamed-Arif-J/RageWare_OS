import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../engine/soundEngine';

export default function ShutdownScreen({ type = 'shutdown', onRestart, onReturnLanding }) {
  // Stages: 'waiting' -> 'safe'
  const [stage, setStage] = useState('waiting');
  const [isCrtOff, setIsCrtOff] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [countdown, setCountdown] = useState(12);
  const [isCountdownPaused, setIsCountdownPaused] = useState(false);

  useEffect(() => {
    // Play authentic descending Windows 95 shutdown chime
    soundEngine.playShutdown();

    // Trigger authentic mechanical disk spin-down audio after chime starts
    const spinTimer = setTimeout(() => {
      soundEngine.playDiskSpinDown();
    }, 1400);

    const waitTimer = setTimeout(() => {
      if (type === 'restart') {
        if (onRestart) onRestart('normal');
      } else if (type === 'dos') {
        if (onRestart) onRestart('dos');
      } else {
        setStage('safe');
      }
    }, 3200);

    return () => {
      clearTimeout(spinTimer);
      clearTimeout(waitTimer);
    };
  }, [type, onRestart]);

  // Auto-redirect countdown on 'safe' screen (unless paused or CRT is powered off)
  useEffect(() => {
    if (stage !== 'safe' || isCrtOff || isCountdownPaused) return;

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
  }, [stage, isCrtOff, isCountdownPaused, onReturnLanding]);

  const handleRestartClick = () => {
    soundEngine.playCrtDegauss();
    if (onRestart) onRestart('normal');
  };

  const handleLandingClick = () => {
    soundEngine.playClick();
    if (onReturnLanding) onReturnLanding();
  };

  const handlePowerOffCrt = () => {
    soundEngine.playCrtOff();
    setIsCollapsing(true);
    setTimeout(() => {
      setIsCollapsing(false);
      setIsCrtOff(true);
    }, 450);
  };

  const handlePowerOnCrt = () => {
    soundEngine.playCrtDegauss();
    setIsCrtOff(false);
  };

  return (
    <div className="os-shutdown-screen-root" id="shutdown-screen">
      {/* Ambient CRT Scanline & Glass Curved Vignette Overlay */}
      <div className="shutdown-crt-overlay" />
      <div className="shutdown-crt-curvature-vignette" />

      {/* When CRT is powered off: Authentic Dark Cathode Tube Standby View */}
      {isCrtOff ? (
        <div className="crt-offline-standby-screen mono">
          <div className="crt-chassis-bezel">
            <div className="crt-screen-reflection" />
            <div className="crt-power-cluster">
              <div className="crt-standby-led-group">
                <span className="crt-power-led red" />
                <span className="crt-led-label">MONITOR STANDBY (NO SIGNAL)</span>
              </div>

              <div className="crt-standby-message">
                ════════════════════════════════════════<br />
                CRT CATHODE TUBE POWERED OFF<br />
                AC POWER: CONNECTED &bull; 120V 60Hz<br />
                ════════════════════════════════════════
              </div>

              <div className="crt-standby-actions">
                <button 
                  id="btn-crt-power-on"
                  className="btn-crt-tactile-power mono"
                  onClick={handlePowerOnCrt}
                >
                  <span className="power-icon">⏻</span> POWER ON CRT MONITOR
                </button>
                <div className="crt-standby-sub-buttons">
                  <button 
                    id="btn-crt-reboot-now"
                    className="btn-shutdown-amber mono"
                    onClick={handleRestartClick}
                  >
                    [ ⟳ REBOOT COMPUTER ]
                  </button>
                  <button 
                    id="btn-crt-return-landing"
                    className="btn-shutdown-amber mono"
                    onClick={handleLandingClick}
                  >
                    [ ◄ RETURN TO LAUNCHPAD ]
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`shutdown-active-viewport ${isCollapsing ? 'crt-beam-collapsing' : ''}`}>
          {/* STAGE 1: "Please wait while your computer shuts down." */}
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

                {/* Retro animated progress dots, hourglass & HDD LED */}
                <div className="shutdown-progress-indicator">
                  <span className="shutdown-hourglass">⌛</span>
                  <div className="shutdown-dots-strip">
                    <span className="dot d1" />
                    <span className="dot d2" />
                    <span className="dot d3" />
                    <span className="dot d4" />
                    <span className="dot d5" />
                  </div>
                  <div className="shutdown-hdd-activity mono">
                    <span className="hdd-led blink" /> HDD ACTIVE
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: "It's now safe to turn off your computer." */}
          {stage === 'safe' && (
            <div className="shutdown-safe-container">
              <div className="shutdown-safe-inner">
                {/* The Legendary Orange / Amber Phosphor Text */}
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
                    id="btn-shutdown-poweroff"
                    className="btn-shutdown-amber poweroff-prominent mono"
                    onClick={handlePowerOffCrt}
                    title="Simulate CRT Monitor Beam Collapse"
                  >
                    <span className="btn-icon">⏻</span> [ POWER OFF CRT MONITOR ]
                  </button>
                  <button 
                    id="btn-shutdown-reboot"
                    className="btn-shutdown-amber mono"
                    onClick={handleRestartClick}
                  >
                    [ ⟳ REBOOT COMPUTER ]
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
                  Returning to Launchpad automatically in <strong>{countdown}s</strong> &bull;{' '}
                  <button 
                    className="btn-pause-countdown mono"
                    onClick={() => setIsCountdownPaused((p) => !p)}
                  >
                    [{isCountdownPaused ? 'RESUME AUTO-EXIT' : 'PAUSE AUTO-EXIT'}]
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
