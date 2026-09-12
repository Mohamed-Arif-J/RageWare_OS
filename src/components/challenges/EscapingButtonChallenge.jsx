import React, { useState, useRef } from 'react';
import { increaseRage, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';

export default function EscapingButtonChallenge({ onComplete, onStateChange }) {
  const containerRef = useRef(null);
  const [escapes, setEscapes] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 50, isPercent: true });
  const [statusMsg, setStatusMsg] = useState('HOVER OVER TARGET TO ENGAGE');
  const [isCompleted, setIsCompleted] = useState(false);
  const lastEscapeTime = useRef(0);

  const triggerEscape = () => {
    if (isCompleted) return;

    const now = Date.now();
    // Throttle escapes to prevent erratic double-fires within 250ms
    if (now - lastEscapeTime.current < 250) return;
    lastEscapeTime.current = now;

    // After 6 escapes, give the user a fair window to catch it
    if (escapes >= 6 && Math.random() > 0.4) {
      setStatusMsg('TARGET LATENCY SPIKE // CATCH IT NOW!');
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const btnWidth = 140;
    const btnHeight = 48;
    const maxX = Math.max(20, rect.width - btnWidth - 20);
    const maxY = Math.max(20, rect.height - btnHeight - 20);

    // 25% chance of a tiny bait hop (30-50px) to make the user think they almost got it
    let newX, newY;
    if (Math.random() < 0.25 && !position.isPercent) {
      const deltaX = (Math.random() - 0.5) * 80;
      const deltaY = (Math.random() - 0.5) * 80;
      newX = Math.min(maxX, Math.max(20, position.x + deltaX));
      newY = Math.min(maxY, Math.max(20, position.y + deltaY));
      setStatusMsg('ALMOST! TARGET FUMBLED');
    } else {
      newX = Math.floor(Math.random() * maxX);
      newY = Math.floor(Math.random() * maxY);
      setStatusMsg('TARGET EVADED // VELOCITY INCREASING');
    }

    setPosition({ x: newX, y: newY, isPercent: false });
    setEscapes((prev) => prev + 1);

    // Record rage event
    increaseRage(8, RAGE_EVENTS.MOVING_BUTTON_ESCAPE);
    if (onStateChange) onStateChange();
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isCompleted) return;

    setIsCompleted(true);
    setStatusMsg('TARGET CAPTURED! AUTHENTICATION GRANTED.');
    recordSuccess();
    if (onStateChange) onStateChange();

    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <div className="challenge-body" id="escaping-button-challenge">
      <div className="challenge-subhead">
        <span className="mission-tag">MISSION 01</span>
        <h2 className="mission-title">CLICK THE BUTTON</h2>
        <div className="mission-tracker">
          <span className="tracker-pill">ESCAPES: <strong id="escapes-counter">{escapes}</strong></span>
          <span className="tracker-status">{statusMsg}</span>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="interactive-arena escaping-arena"
      >
        <button
          id="escaping-target-btn"
          className={`btn-escaping-target ${isCompleted ? 'success' : ''}`}
          style={
            position.isPercent
              ? { left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }
              : { left: `${position.x}px`, top: `${position.y}px` }
          }
          onMouseEnter={triggerEscape}
          onClick={handleButtonClick}
        >
          {isCompleted ? '✓ CAPTURED' : '[ CLICK ME ]'}
        </button>
      </div>

      <div className="challenge-caption">
        * Neural guidance system recalibrates upon proximity breach.
      </div>
    </div>
  );
}
