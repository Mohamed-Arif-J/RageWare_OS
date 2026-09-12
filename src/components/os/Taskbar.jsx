import React, { useState, useEffect } from 'react';
import { IconStartLogo, IconSpeaker } from './OSIcons';
import { soundEngine } from '../../engine/soundEngine';

export default function Taskbar({
  windows = [],
  activeWindowId,
  isStartMenuOpen = false,
  onToggleStartMenu,
  onTaskbarItemClick,
  rageLevel = 0,
  isChaosMode = true,
  isCameraActive = false,
  onToggleChaos,
}) {
  const [clockStr, setClockStr] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(now.getMinutes()).padStart(2, '0');
      setClockStr(`${hours}:${mins} ${ampm}`);
    };
    updateClock();
    const t = setInterval(updateClock, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <footer className="win95-taskbar" id="os-taskbar">
      {/* Start Button */}
      <div className="taskbar-left">
        <button
          id="btn-os-start"
          className={`win95-start-btn ${isStartMenuOpen ? 'sunken' : 'raised'}`}
          onClick={onToggleStartMenu}
        >
          <IconStartLogo size={16} />
          <span className="start-btn-text">Start</span>
        </button>
      </div>

      <div className="taskbar-divider" />

      {/* Center: Running Task Tabs */}
      <div className="taskbar-center">
        {windows.map((win) => {
          const isActive = win.id === activeWindowId && !win.isMinimized;
          const WinIcon = win.icon;

          return (
            <button
              key={win.id}
              id={`taskbar-item-${win.id}`}
              className={`win95-task-tab ${isActive ? 'sunken' : 'raised'} ${win.isMinimized ? 'minimized' : ''}`}
              onClick={() => onTaskbarItemClick(win.id)}
              title={win.title}
            >
              {WinIcon && <WinIcon size={16} className="task-tab-icon" />}
              <span className="task-tab-title">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* Right: System Tray */}
      <div className="taskbar-right">
        <div className="win95-tray sunken">
          {/* Chaos / Rage Toggle Switch (Option 2) */}
          <button
            id="btn-taskbar-chaos-toggle"
            className={`tray-chaos-toggle ${isChaosMode ? 'chaos-on' : 'chaos-off'}`}
            title={
              isChaosMode
                ? 'Ragebait Chaos: ACTIVE! (Click or press F8 for SAFE SHIELD to open/test apps)'
                : 'Safe Shield: ACTIVE! (Click or press F8 to unleash the chaos!)'
            }
            onClick={onToggleChaos}
          >
            <span className="tray-chaos-icon">{isChaosMode ? '🔥' : '🛡️'}</span>
            <span className="tray-chaos-text">{isChaosMode ? 'CHAOS: ON' : 'SAFE: ON'}</span>
            <span className="tray-chaos-key">(F8)</span>
          </button>

          {/* Audio Speaker Mute Toggle */}
          <button
            className="tray-speaker-btn"
            title={isMuted ? 'Sound: Muted (Click to un-mute)' : 'Sound: Enabled (Click to mute)'}
            onClick={() => {
              const muted = soundEngine.toggleMute();
              setIsMuted(muted);
              if (!muted) soundEngine.playDing();
            }}
          >
            <IconSpeaker size={14} isMuted={isMuted} />
          </button>

          {/* Subtle Optical Sensor Camera Status (Step 17) */}
          <span 
            className={`tray-cam-indicator ${isCameraActive ? 'cam-on' : 'cam-off'}`}
            title={isCameraActive ? 'Optical Sensor: ACTIVE (Observing reaction windows)' : 'Optical Sensor: OFF'}
          >
            CAM: <strong>{isCameraActive ? 'ON' : 'OFF'}</strong>
          </span>

          {/* Team AltF4 Authorship Badge */}
          <span className="tray-team-badge" title="RAGEWARE OS — Purely crafted from scratch by Team AltF4">
            BY: <strong>AltF4</strong>
          </span>

          <span className="tray-rage-indicator" title={`Current Rage Index: ${rageLevel}%`}>
            RAGE: <strong>{rageLevel}%</strong>
          </span>
          <div className="tray-clock">
            {clockStr}
          </div>
        </div>
      </div>
    </footer>
  );
}
