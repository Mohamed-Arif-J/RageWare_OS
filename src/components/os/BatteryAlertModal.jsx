import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../../engine/soundEngine';

export default function BatteryAlertModal({ isOpen, onClose, onRageUpdate, onReboot, onShutdown }) {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isPluggedIn, setIsPluggedIn] = useState(false);
  const [isPowerOutage, setIsPowerOutage] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(10);
      setIsPluggedIn(false);
      setIsPowerOutage(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    soundEngine.playBatteryAlarm();

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleBatteryDied();
          return 0;
        }
        soundEngine.playBatteryAlarm();
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  const handleBatteryDied = () => {
    soundEngine.playCriticalStop();
    setIsPowerOutage(true);
    if (onRageUpdate) onRageUpdate('batteryBlackout', 8);
  };

  const handlePlugIn = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundEngine.playHardwareConnect();
    setIsPluggedIn(true);
    setIsPowerOutage(false);
    if (onRageUpdate) onRageUpdate('batteryPlugged', -6);

    setTimeout(() => {
      if (onClose) onClose();
    }, 1200);
  };

  const handleRebootClick = () => {
    soundEngine.playClick();
    if (onClose) onClose();
    if (onReboot) onReboot('safe');
  };

  const handleShutdownClick = () => {
    soundEngine.playClick();
    if (onClose) onClose();
    if (onShutdown) onShutdown('shutdown');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Dimmed CRT battery-saver screen overlay */}
      <div className={`battery-dim-overlay ${isPowerOutage ? 'power-outage-dark' : ''}`} />

      {/* THEATRICAL POWER FAILURE SCREEN (When countdown reaches 0) */}
      {isPowerOutage ? (
        <div className="os-dialog-backdrop power-outage-backdrop">
          <div className="win95-dialog power-outage-dialog">
            <div className="win95-dialog-titlebar win95-titlebar-critical">
              <span className="win95-dialog-title">
                ⚡ CRITICAL POWER FAILURE: BATTERY AT 0.0V
              </span>
            </div>
            <div className="win95-dialog-body power-outage-body">
              <div className="power-outage-icon-wrap">
                <span className="power-outage-icon">🪫</span>
              </div>
              <div className="power-outage-text">
                <h3 style={{ color: '#CC0000', marginBottom: '8px', fontSize: '14px' }}>
                  ATX Motherboard Capacitors Fully Discharged
                </h3>
                <p style={{ fontSize: '11px', lineHeight: '1.5', color: '#222' }}>
                  Desktop operations cannot continue without external alternating current (AC).
                  All background processes and cognitive trackers have entered emergency dormancy.
                </p>
                <div className="power-outage-hint mono" style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
                  STATUS: WAITING_FOR_AC_VOLTAGE | ERROR_CODE: 0x0000DEAD
                </div>
              </div>
            </div>
            <div className="win95-dialog-actions power-outage-actions">
              <button
                className="win95-btn battery-btn-primary"
                onClick={handlePlugIn}
              >
                🔌 Plug In Virtual AC Adapter &amp; Revive
              </button>
              <button
                className="win95-btn"
                onClick={handleRebootClick}
              >
                ⟳ Reboot to Safe Mode
              </button>
              <button
                className="win95-btn"
                onClick={handleShutdownClick}
              >
                ✕ Shut Down PC
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD 1% COUNTDOWN WARNING DIALOG */
        <div className="os-dialog-backdrop battery-alert-backdrop">
          <div className="win95-dialog battery-alert-dialog">
            {/* Title Bar */}
            <div className="win95-dialog-titlebar win95-titlebar-critical">
              <span className="win95-dialog-title">
                ⚠️ CRITICAL BATTERY HAZARD (1% REMAINING)
              </span>
              <button className="win95-dialog-close" onClick={handlePlugIn}>
                ✕
              </button>
            </div>

            {/* Dialog Body */}
            <div className="win95-dialog-body battery-dialog-body">
              <div className="battery-icon-animated">
                <span style={{ fontSize: '36px' }}>🪫</span>
              </div>

              <div className="battery-dialog-text">
                {isPluggedIn ? (
                  <div className="battery-success-text">
                    <strong style={{ color: '#008000', fontSize: '13px' }}>
                      ⚡ Virtual Power Cord Connected!
                    </strong>
                    <p style={{ marginTop: '4px', fontSize: '11px' }}>
                      Motherboard capacitors recharged to 100%. Display brightness restored.
                    </p>
                  </div>
                ) : (
                  <>
                    <strong>System Power Source: ATX Desktop Motherboard Battery</strong>
                    <p style={{ marginTop: '6px', fontSize: '11px', lineHeight: '1.4' }}>
                      Main battery power is at <strong style={{ color: '#CC0000' }}>1%</strong>.
                      All desktop operations will terminate in{' '}
                      <strong className="battery-countdown-num">{secondsLeft}</strong> seconds
                      unless external AC voltage is applied immediately.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Progress bar representing draining 1% */}
            <div className="battery-meter-container sunken">
              <div
                className="battery-meter-fill"
                style={{
                  width: isPluggedIn ? '100%' : `${Math.max(4, (secondsLeft / 10) * 100)}%`,
                  backgroundColor: isPluggedIn ? '#00AA00' : '#FF0000',
                }}
              />
            </div>

            {/* Actions */}
            <div className="win95-dialog-actions battery-dialog-actions">
              <button
                className="win95-btn battery-btn-primary"
                onClick={handlePlugIn}
                disabled={isPluggedIn}
              >
                🔌 Plug In Virtual AC Adapter
              </button>
              <button
                className="win95-btn"
                onClick={() => {
                  soundEngine.playExclamation();
                  alert('Praying did not increase battery percentage.');
                }}
                disabled={isPluggedIn}
              >
                Ignore &amp; Pray
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
