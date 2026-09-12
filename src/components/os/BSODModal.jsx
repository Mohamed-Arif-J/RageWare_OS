import React, { useEffect, useState } from 'react';

/**
 * BSODModal — Classic Windows 95 Blue Screen of Death Glitch Flash
 * 
 * Spontaneously interrupts the OS with an authentic, hilarious retro blue screen.
 * Automatically recovers after 2.5 seconds or on any keypress/click.
 */
export default function BSODModal({ isOpen, onClose, onRageUpdate }) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) return;

    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onClose) onClose();
          if (onRageUpdate) onRageUpdate();
          return 0;
        }
        return prev - 1;
      });
    }, 900);

    const handleKey = () => {
      if (onClose) onClose();
      if (onRageUpdate) onRageUpdate();
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose, onRageUpdate]);

  if (!isOpen) return null;

  return (
    <div 
      className="bsod-overlay"
      onClick={() => {
        if (onClose) onClose();
        if (onRageUpdate) onRageUpdate();
      }}
    >
      <div className="bsod-container">
        <div className="bsod-header">
          <span className="bsod-badge">RAGEWARE</span>
        </div>

        <p className="bsod-lead">
          A fatal exception 0E has occurred at 0028:C003BF02 in VXD RAGEWARE(01) + 00004BF2.
          The current application will be terminated to prevent user satisfaction.
        </p>

        <div className="bsod-list">
          <p>* Excessive user patience was detected by cognitive sub-routine.</p>
          <p>* System integrity requires continuous human exasperation.</p>
          <p>* Press any key to continue... wait, that won't work.</p>
          <p>* Press CTRL+ALT+DEL to restart your frustration cycle.</p>
        </div>

        <div className="bsod-footer">
          <span className="bsod-countdown">
            Resuming adversarial operations in {countdown} seconds...
          </span>
          <span className="bsod-hint">
            [ Click anywhere to bypass cognitive check ]
          </span>
        </div>
      </div>
    </div>
  );
}
