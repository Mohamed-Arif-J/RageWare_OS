import React, { useState } from 'react';
import { soundEngine } from '../../engine/soundEngine';
import { 
  increaseRage, 
  recordSuccess, 
  RAGE_EVENTS, 
  getRageProfile 
} from '../../engine/rageEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';
import { systemSettings } from '../../services/systemSettings';
import { IconLock } from './OSIcons';

/**
 * LockApp — Fictional RAGEWARE Win95 Workstation Lock
 * 
 * Strict Simulation Guidelines:
 * - NOT a real OS lock. Zero Windows API calls.
 * - 100% browser sandbox simulation. Never traps the real OS or blocks browser interaction.
 * - SAFE MODE: Simple clean workstation lock simulation, unlocks immediately.
 * - CHAOS MODE: Fictional ragebait lock:
 *   - Rejects password once with fake "Access Denied: Reason: Because you clicked it."
 *   - Unlock button shifts slightly on first hover
 *   - Verifying credentials stalls briefly
 *   - Unlocks cleanly on retry with snarky personality comment.
 */
export default function LockApp({
  isChaosMode = false,
  profile,
  onRageUpdate,
  onClose,
}) {
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  const [accessDeniedModal, setAccessDeniedModal] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState('');

  const registeredOwner = systemSettings.get('registeredOwner') || 'Adversarial Cognitive Benchmark';
  const currentRage = profile?.rageScore || getRageProfile().rageScore;

  const handleLock = () => {
    soundEngine.playClick();
    setIsLocked(true);
    setPassword('');
    setAttempts(0);
    setBtnOffset({ x: 0, y: 0 });
    setUnlockMessage('');
  };

  const handleBtnHover = () => {
    if (!isChaosMode) return;
    if (attempts === 0 && (btnOffset.x === 0 && btnOffset.y === 0)) {
      soundEngine.playPCSpeaker();
      setBtnOffset({ x: 35, y: -12 });
      increaseRage(6, RAGE_EVENTS.LOCK_BUTTON_ESCAPE);
      if (onRageUpdate) onRageUpdate();
    }
  };

  const handleUnlockAttempt = (e) => {
    e?.preventDefault();
    soundEngine.playClick();
    setBtnOffset({ x: 0, y: 0 });

    // SAFE MODE: Instant clean unlock
    if (!isChaosMode) {
      soundEngine.playDing();
      setIsLocked(false);
      return;
    }

    // CHAOS MODE:
    // First attempt always triggers the fictional "Access Denied" trap
    if (attempts === 0) {
      setAttempts(1);
      soundEngine.playCriticalStop();
      increaseRage(8, RAGE_EVENTS.LOCK_PASSWORD_TRAP);
      if (onRageUpdate) onRageUpdate();
      setAccessDeniedModal(true);
      return;
    }

    // Subsequent attempt: Verifies with small stall and unlocks
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsLocked(false);
      soundEngine.playTada();
      recordSuccess();
      if (onRageUpdate) onRageUpdate();

      // Personality snark
      if (currentRage > 60) {
        osPersonalityInstance.say("Did you really think I would lock your computer?");
      } else {
        osPersonalityInstance.say("Relax. It wasn't a real lock.");
      }
    }, 1200);
  };

  const dismissAccessDenied = () => {
    soundEngine.playClick();
    setAccessDeniedModal(false);
  };

  // 1. LOCKED WORKSTATION SCREEN
  if (isLocked) {
    return (
      <div 
        className="win95-tab-sheet"
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--win-desktop)',
          padding: '16px',
          position: 'relative',
        }}
      >
        <div 
          style={{
            width: '360px',
            maxWidth: '92%',
            background: 'var(--win-surface)',
            border: '2px outset var(--win-border-light)',
            boxShadow: '3px 3px 8px rgba(0,0,0,0.4)',
            padding: '2px',
          }}
        >
          {/* Title Bar */}
          <div 
            style={{
              background: 'linear-gradient(90deg, var(--win-titlebar-active-start), var(--win-titlebar-active-end))',
              color: 'var(--win-titlebar-text)',
              padding: '3px 6px',
              fontWeight: 'bold',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconLock size={14} />
            <span>RAGEWARE SYSTEM LOCKED</span>
          </div>

          {/* Locked Content Body */}
          <div style={{ padding: '16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <IconLock size={40} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '12px' }}>USER SESSION LOCKED</div>
                <div style={{ fontSize: '10px', color: '#444' }}>
                  Workstation is in use by: <strong>{registeredOwner}</strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleUnlockAttempt}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>
                  Enter password to unlock:
                </label>
                <input
                  type="password"
                  className="win95-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="RAGEWARE"
                  autoFocus
                  style={{ width: '100%' }}
                />
              </div>

              {isVerifying ? (
                <div style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: '#000080' }}>
                  ⏳ Verifying credentials with security coprocessor...
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
                  <button
                    type="submit"
                    className="win95-btn default-btn"
                    style={{
                      transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
                      transition: 'transform 0.12s ease-out',
                      minWidth: '85px',
                    }}
                    onMouseEnter={handleBtnHover}
                  >
                    Unlock
                  </button>
                  <button
                    type="button"
                    className="win95-btn"
                    onClick={() => {
                      soundEngine.playDing();
                      setIsLocked(false);
                    }}
                  >
                    Emergency Release
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Fake Access Denied Modal (Chaos Mode Trap) */}
        {accessDeniedModal && (
          <div 
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
            }}
          >
            <div 
              style={{
                width: '300px',
                background: '#c0c0c0',
                border: '2px outset #ffffff',
                boxShadow: '3px 3px 6px rgba(0,0,0,0.5)',
                padding: '2px',
              }}
            >
              <div 
                style={{
                  background: '#800000',
                  color: '#ffffff',
                  padding: '3px 6px',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>ACCESS DENIED</span>
                <button 
                  className="win95-ctrl-btn" 
                  onClick={dismissAccessDenied}
                  style={{ width: '14px', height: '14px', fontSize: '9px', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>
              <div style={{ padding: '14px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>🛑</span>
                  <div>
                    <strong>ACCESS DENIED</strong>
                    <div style={{ marginTop: '6px', color: '#222' }}>
                      Reason: <em>Because you clicked it.</em>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <button 
                    className="win95-btn default-btn" 
                    onClick={dismissAccessDenied}
                    style={{ minWidth: '80px' }}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. UNLOCKED MANAGEMENT SCREEN
  return (
    <div className="win95-tabbed-dialog" id="app-system-lock">
      <div className="win95-tab-sheet" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <fieldset className="win95-fieldset">
          <legend>Workstation Security &amp; Lock</legend>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <IconLock size={48} />
            <div>
              <h3 style={{ fontSize: '12px', marginBottom: '4px' }}>RAGEWARE Workstation Lock Utility</h3>
              <p style={{ fontSize: '10px', color: '#555', lineHeight: '1.4' }}>
                Simulates locking the virtual operating system session. Password protection and behavioral surveillance coprocessor are currently active.
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset className="win95-fieldset">
          <legend>Session Security Credentials</legend>
          <div className="win95-form-row">
            <label style={{ width: '120px' }}>Current User:</label>
            <input
              type="text"
              className="win95-input"
              value={registeredOwner}
              readOnly
              style={{ flex: 1, backgroundColor: '#dfdfdf' }}
            />
          </div>
          <div className="win95-form-row" style={{ marginTop: '6px' }}>
            <label style={{ width: '120px' }}>Simulated Password:</label>
            <input
              type="text"
              className="win95-input"
              value="RAGEWARE (Default)"
              readOnly
              style={{ flex: 1, backgroundColor: '#dfdfdf' }}
            />
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
            Mode: <strong>{isChaosMode ? 'Adversarial Verification Protocol (Chaos)' : 'Standard Virtual Lock (Safe)'}</strong>
          </div>
        </fieldset>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <button
            className="win95-btn default-btn"
            onClick={handleLock}
            style={{ minWidth: '160px', padding: '6px 14px', fontWeight: 'bold' }}
          >
            🔒 Lock Workstation
          </button>
        </div>
      </div>

      <div className="win95-dialog-footer">
        <button className="win95-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
