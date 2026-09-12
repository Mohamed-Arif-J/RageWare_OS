import React, { useEffect, useState, useRef } from 'react';
import { IconWarning, IconError } from './OSIcons';

const VIRUS_TEMPLATES = [
  {
    title: 'VIRUS INFECTION DETECTED',
    mainText: 'WARNING: Trojan.Rage.95',
    subText: '133,742 uninvited cognitive anomalies found.',
    theme: 'trojan',
  },
  {
    title: 'VIRUS INFECTION DETECTED',
    mainText: 'Error 404',
    subText: 'Please contact God.',
    theme: 'god404',
  },
  {
    title: 'VIRUS INFECTION DETECTED',
    mainText: 'Catastrophic Failure',
    subText: 'User patience dropped below absolute zero.',
    theme: 'failure',
  },
  {
    title: 'SECURITY ALERT: VIRUS DETECTED',
    mainText: 'DO NOT CLOSE THIS WINDOW',
    subText: 'Closing this window will duplicate it exponentially.',
    theme: 'mitosis',
  },
  {
    title: 'CONGRATULATIONS ! ! !',
    mainText: 'YOU ARE THE 1,000,000th VISITOR!',
    subText: 'Click OK to claim your free emotional damage.',
    theme: 'winner',
  },
];

/**
 * VirusPopupCascade — Iconic Retro Windows Multiplied Cascade / Virus Storm
 * Inspired by classic Windows cascading crash trails and meme popups ("Error 404: Please contact God").
 */
export default function VirusPopupCascade({ isOpen, onClose, onRageUpdate }) {
  const [popups, setPopups] = useState([]);
  const [activeTheme, setActiveTheme] = useState(VIRUS_TEMPLATES[0]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleanStatus, setCleanStatus] = useState('');
  const popupIdRef = useRef(1);

  useEffect(() => {
    if (!isOpen) {
      setPopups([]);
      setIsCleaning(false);
      return;
    }

    // Pick a random virus theme for this cascade wave
    const template = VIRUS_TEMPLATES[Math.floor(Math.random() * VIRUS_TEMPLATES.length)];
    setActiveTheme(template);

    // Initial window starting position (center-left)
    const startX = Math.max(40, window.innerWidth * 0.18);
    const startY = Math.max(30, window.innerHeight * 0.12);

    const initialPopups = [];
    const totalWindows = 14; // Creates the massive diagonal staircase trail

    for (let i = 0; i < totalWindows; i++) {
      initialPopups.push({
        id: popupIdRef.current++,
        x: startX + i * 28,
        y: startY + i * 24,
        zIndex: 5000 + i,
        title: template.title,
        mainText: template.mainText,
        subText: template.subText,
        isFront: i === totalWindows - 1,
      });
    }

    // Spawn them with rapid staggered timing for that authentic malware cascading cascade wave effect
    setPopups([]);
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < initialPopups.length) {
        const nextPopup = initialPopups[currentIndex];
        setPopups((prev) => [...prev, nextPopup]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 45); // 45ms rapid cascade fire

    return () => clearInterval(interval);
  }, [isOpen]);

  // Closing a window has a 40% chance of triggering popup mitosis (spawning 2 more!)
  const closeWindow = (id) => {
    if (onRageUpdate) onRageUpdate();

    setPopups((prev) => {
      const target = prev.find((p) => p.id === id);
      const remaining = prev.filter((p) => p.id !== id);

      if (target && Math.random() < 0.45 && remaining.length < 24) {
        // Spawn 2 offspring popups slightly jittered!
        const offspring1 = {
          id: popupIdRef.current++,
          x: Math.max(20, target.x + 35),
          y: Math.max(20, target.y + 35),
          zIndex: 6000 + popupIdRef.current,
          title: 'POPUP MULTIPLICATION',
          mainText: 'Error 404: Mitosised',
          subText: 'Closing windows produces more windows.',
          isFront: true,
        };
        const offspring2 = {
          id: popupIdRef.current++,
          x: Math.max(20, target.x - 35),
          y: Math.max(20, target.y - 35),
          zIndex: 6001 + popupIdRef.current,
          title: 'VIRUS REPLICATION',
          mainText: activeTheme.mainText,
          subText: 'Resistance is computationally futile.',
          isFront: true,
        };
        return [...remaining, offspring1, offspring2];
      }

      if (remaining.length === 0 && onClose) {
        onClose();
      }
      return remaining;
    });
  };

  // Fake Antivirus cleaner that stalls at 99% and mocks the user
  const handleStartClean = () => {
    setIsCleaning(true);
    setCleanProgress(0);
    setCleanStatus('Scanning system sectors for rage signatures...');

    let p = 0;
    const cleanTimer = setInterval(() => {
      p += Math.floor(8 + Math.random() * 12);
      if (p >= 99) {
        p = 99;
        clearInterval(cleanTimer);
        setCleanProgress(99);
        setCleanStatus('ERROR 0xDEADBEEF: Virus is now the System Administrator.');
        if (onRageUpdate) onRageUpdate();
      } else {
        setCleanProgress(p);
      }
    }, 180);
  };

  const handleDismissAll = () => {
    setPopups([]);
    if (onClose) onClose();
    if (onRageUpdate) onRageUpdate();
  };

  if (!isOpen || popups.length === 0) return null;

  return (
    <div className="virus-cascade-overlay" pointerEvents="none">
      {/* CASCADING MEME WINDOWS */}
      {popups.map((win) => (
        <div
          key={win.id}
          className="win95-window-frame virus-cascade-window"
          style={{
            position: 'absolute',
            left: `${win.x}px`,
            top: `${win.y}px`,
            zIndex: win.zIndex,
            width: '420px',
            pointerEvents: 'auto',
          }}
        >
          {/* Authentic Win95 Titlebar */}
          <div className="win95-titlebar active virus-titlebar">
            <div className="win95-title-content">
              <IconWarning size={14} />
              <span className="win95-title-text">{win.title}</span>
            </div>
            <div className="win95-control-box">
              <button
                className="win95-ctrl-btn"
                onClick={() => closeWindow(win.id)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Authentic Meme Body ("Error 404: Please contact God") */}
          <div className="virus-window-body">
            <div className="virus-content-inner">
              <div className="virus-big-headline">{win.mainText}</div>
              <div className="virus-sub-italic">{win.subText}</div>
            </div>

            <div className="virus-window-actions">
              <button
                className="win95-btn raised virus-action-btn"
                onClick={() => closeWindow(win.id)}
              >
                OK
              </button>
              <button
                className="win95-btn raised virus-action-btn"
                onClick={() => closeWindow(win.id)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* FLOATING RETRO CONTROL DOCK (Clean Virus / Panic Button) */}
      <div className="virus-control-dock" style={{ pointerEvents: 'auto' }}>
        <div className="virus-dock-title">
          <IconError size={16} />
          <span>MALWARE ALERT: Active Cascade Infection</span>
        </div>
        
        {isCleaning ? (
          <div className="virus-clean-box">
            <div className="clean-status-text">{cleanStatus}</div>
            <div className="win95-progress-track">
              <div 
                className="win95-progress-fill" 
                style={{ width: `${cleanProgress}%`, background: cleanProgress === 99 ? '#C00000' : '#000080' }}
              />
            </div>
            {cleanProgress === 99 && (
              <button className="win95-btn raised panic-btn" onClick={handleDismissAll}>
                TERMINATE ALL PROCESSES [FORCE KILL]
              </button>
            )}
          </div>
        ) : (
          <div className="virus-dock-buttons">
            <button className="win95-btn raised antivirus-btn" onClick={handleStartClean}>
              RUN ANTIVIRUS CLEANER
            </button>
            <button className="win95-btn raised panic-btn" onClick={handleDismissAll}>
              DISMISS ALL POPUPS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
