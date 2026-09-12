import React, { useEffect, useState } from 'react';

/**
 * GhostCursor — Rogue retro Windows cursor that autonomously wanders across the screen
 * Simulates an unpredictable erratic ghost input that distracts and confuses the user.
 */
export default function GhostCursor({ isActive, onComplete }) {
  const [pos, setPos] = useState({ x: 200, y: 200 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    // Start at a random location
    setPos({
      x: 150 + Math.random() * (window.innerWidth - 300),
      y: 100 + Math.random() * (window.innerHeight - 250),
    });

    // Move in erratic hops every 350ms
    const interval = setInterval(() => {
      setPos((prev) => ({
        x: Math.max(50, Math.min(window.innerWidth - 80, prev.x + (Math.random() - 0.5) * 220)),
        y: Math.max(50, Math.min(window.innerHeight - 100, prev.y + (Math.random() - 0.5) * 180)),
      }));

      if (Math.random() > 0.5) {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 140);
      }
    }, 380);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div
      className={`ghost-cursor-wrap ${isClicking ? 'clicking' : ''}`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
      }}
    >
      {/* Retro Win95 White Arrow Cursor with Black Outline */}
      <svg width="22" height="26" viewBox="0 0 16 19" fill="none">
        <path
          d="M1 1V16L5.5 12L8 18L10.5 17L8 11H13.5L1 1Z"
          fill={isClicking ? '#FF3333' : '#FFFFFF'}
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinejoin="miter"
        />
      </svg>
      <div className="ghost-cursor-tag">SYS_INPUT</div>
    </div>
  );
}
