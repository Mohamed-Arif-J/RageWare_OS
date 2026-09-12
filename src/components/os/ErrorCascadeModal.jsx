import React, { useEffect, useState } from 'react';
import { IconError, IconWarning } from './OSIcons';

const CASCADE_MESSAGES = [
  { title: 'CRITICAL WARNING', message: 'Mouse movement was registered without permission.', type: 'warning' },
  { title: 'SYSTEM HALT NOTICE', message: 'General user intent conflict in module COGNITIVE.DLL.', type: 'error' },
  { title: 'FATAL EXCEPTION', message: 'System detected excessive calm. Commencing irritation protocol.', type: 'error' },
  { title: 'RESOURCE LEAK', message: 'User patience buffer depleted to 14%.', type: 'warning' },
  { title: 'DEVICE FAULT', message: 'Interface element avoided cursor due to quantum latency.', type: 'error' },
];

/**
 * ErrorCascadeModal — Staggered cascade of 2-3 overlapping retro error dialogs
 */
export default function ErrorCascadeModal({ isOpen, onClose, onRageUpdate }) {
  const [activeDialogs, setActiveDialogs] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setActiveDialogs([]);
      return;
    }

    // Pick 3 messages
    const shuffled = [...CASCADE_MESSAGES].sort(() => 0.5 - Math.random());
    const initialDialogs = [
      { id: 1, ...shuffled[0], x: 180 + Math.random() * 80, y: 120 + Math.random() * 40 },
    ];
    setActiveDialogs(initialDialogs);

    // Spawn 2nd dialog after 220ms
    const t1 = setTimeout(() => {
      setActiveDialogs((prev) => [
        ...prev,
        { id: 2, ...shuffled[1], x: prev[0].x + 45, y: prev[0].y + 45 },
      ]);
    }, 240);

    // Spawn 3rd dialog after 480ms
    const t2 = setTimeout(() => {
      setActiveDialogs((prev) => [
        ...prev,
        { id: 3, ...shuffled[2], x: prev[prev.length - 1].x + 45, y: prev[prev.length - 1].y + 45 },
      ]);
    }, 480);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen]);

  const dismissOne = (id) => {
    if (onRageUpdate) onRageUpdate();
    setActiveDialogs((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (next.length === 0 && onClose) {
        onClose();
      }
      return next;
    });
  };

  if (!isOpen || activeDialogs.length === 0) return null;

  return (
    <div className="cascade-errors-layer" pointerEvents="auto">
      {activeDialogs.map((d, index) => (
        <div
          key={d.id}
          className="win95-window-frame cascade-error-dialog"
          style={{
            position: 'absolute',
            left: `${d.x}px`,
            top: `${d.y}px`,
            zIndex: 1000 + index,
            width: '340px',
          }}
        >
          <div className="win95-titlebar active">
            <div className="win95-title-content">
              {d.type === 'error' ? <IconError size={14} /> : <IconWarning size={14} />}
              <span className="win95-title-text">{d.title}</span>
            </div>
            <div className="win95-control-box">
              <button 
                className="win95-ctrl-btn" 
                onClick={() => dismissOne(d.id)}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="win95-content cascade-body">
            <div className="cascade-content-row">
              {d.type === 'error' ? <IconError size={32} /> : <IconWarning size={32} />}
              <p className="cascade-msg">{d.message}</p>
            </div>
            <div className="cascade-actions">
              <button
                className="win95-btn raised cascade-ok"
                onClick={() => dismissOne(d.id)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
