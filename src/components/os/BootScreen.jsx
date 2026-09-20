import React, { useState, useEffect, useRef } from 'react';
import { getRageProfile } from '../../engine/rageEngine';
import { soundEngine } from '../../engine/soundEngine';

/**
 * EnergyStarLogo — Retro EPA Pollution Preventer Badge
 * Characteristic fixture of 1995-1998 Award Modular BIOS screens.
 */
function EnergyStarLogo() {
  return (
    <svg className="energy-star-svg" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Yellow/Green Border */}
      <rect x="2" y="2" width="136" height="96" stroke="#00FF00" strokeWidth="2" fill="#000000" />
      <rect x="6" y="6" width="128" height="88" stroke="#00FF00" strokeWidth="0.8" />
      
      {/* Big Yellow Star */}
      <polygon 
        points="70,12 76,28 94,29 80,40 85,57 70,47 55,57 60,40 46,29 64,28" 
        fill="#FFFF00" 
        stroke="#00FF00" 
        strokeWidth="1" 
      />
      
      {/* energy text */}
      <text x="70" y="70" fill="#00FF00" fontFamily="monospace" fontSize="14" fontWeight="bold" textAnchor="middle" letterSpacing="1">
        energy
      </text>
      <text x="70" y="84" fill="#00FF00" fontFamily="monospace" fontSize="7.5" textAnchor="middle" letterSpacing="0.5">
        EPA POLLUTION PREVENTER
      </text>
    </svg>
  );
}

export default function BootScreen({ onBootComplete }) {
  // Stages: 'bios' -> 'menu' -> 'dosload' -> 'step' -> 'specs' -> 'splash'
  const [stage, setStage] = useState('bios');
  const [selectedOption, setSelectedOption] = useState(1);
  const [countdown, setCountdown] = useState(7);
  const [memoryKB, setMemoryKB] = useState(16384);
  const [isMemoryDone, setIsMemoryDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [pendingBootMode, setPendingBootMode] = useState('normal');

  const profile = getRageProfile();
  const timerRef = useRef(null);

  // Fast counting memory test on BIOS stage with CRT degauss sound
  useEffect(() => {
    if (stage === 'bios') {
      soundEngine.init();
      // Play high voltage CRT degauss coil surge at boot start!
      soundEngine.playCrtDegauss();

      const memInterval = setInterval(() => {
        setMemoryKB((prev) => {
          if (prev >= 131072) {
            clearInterval(memInterval);
            setIsMemoryDone(true);
            soundEngine.playBiosBeep(); // Classic Motherboard POST Beep!
            return 131072;
          }
          // Motherboard RAM check tick sound
          soundEngine.playMemoryTick();
          return prev + 16384;
        });
      }, 75);

      // Auto-transition to Startup Menu after 2.8 seconds
      const biosTimeout = setTimeout(() => {
        setStage('menu');
      }, 2800);

      return () => {
        clearInterval(memInterval);
        clearTimeout(biosTimeout);
      };
    }
  }, [stage]);

  // Countdown timer on the Startup Menu stage
  useEffect(() => {
    if (stage === 'menu') {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleExecuteOption(selectedOption);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [stage, selectedOption]);

  // Keyboard navigation across all boot stages
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (stage === 'bios') {
        if (e.key === 'F8' || e.key === 'Enter' || e.key === ' ') {
          soundEngine.playKeyClick();
          setStage('menu');
        } else if (e.key === 'Escape') {
          handleImmediateBoot('normal');
        } else if (e.key === 'Delete') {
          soundEngine.playKeyClick();
          setStage('specs');
        }
      } else if (stage === 'menu') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          soundEngine.playKeyClick();
          setSelectedOption((prev) => (prev > 1 ? prev - 1 : 5));
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          soundEngine.playKeyClick();
          setSelectedOption((prev) => (prev < 5 ? prev + 1 : 1));
        } else if (e.key >= '1' && e.key <= '5') {
          soundEngine.playKeyClick();
          setSelectedOption(parseInt(e.key, 10));
        } else if (e.key === 'Enter') {
          handleExecuteOption(selectedOption);
        } else if (e.key === 'Escape') {
          handleImmediateBoot('normal');
        }
      } else if (stage === 'step') {
        if (e.key.toLowerCase() === 'y' || e.key === 'Enter') {
          soundEngine.playKeyClick();
          handleAdvanceStep();
        } else if (e.key.toLowerCase() === 'n' || e.key === 'Escape') {
          soundEngine.playKeyClick();
          handleAdvanceStep();
        }
      } else if (stage === 'specs') {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          soundEngine.playKeyClick();
          setStage('menu');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, selectedOption, stepIndex]);

  const handleExecuteOption = (optionNum) => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundEngine.playKeyClick();

    if (optionNum === 1) {
      // Normal Mode -> Show MS-DOS driver stream -> splash
      triggerDosLoadingStream('normal');
    } else if (optionNum === 2) {
      // Safe Mode -> Show MS-DOS driver stream -> splash
      triggerDosLoadingStream('safe');
    } else if (optionNum === 3) {
      // Step-by-Step Confirmation
      setStepIndex(0);
      setStage('step');
    } else if (optionNum === 4) {
      // Command Prompt Only (DOS)
      triggerDosLoadingStream('dos');
    } else if (optionNum === 5) {
      // View System Specs
      setStage('specs');
    }
  };

  const triggerDosLoadingStream = (mode) => {
    setPendingBootMode(mode);
    setStage('dosload');
    setTimeout(() => {
      triggerSplashTransition(mode);
    }, 1400);
  };

  const triggerSplashTransition = (mode) => {
    setStage('splash');
    setTimeout(() => {
      soundEngine.playStartup();
      onBootComplete(mode);
    }, 1800);
  };

  const handleImmediateBoot = (mode = 'normal') => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundEngine.playStartup();
    onBootComplete(mode);
  };

  const STEP_PROMPTS = [
    'Create a startup log file (C:\\BOOTLOG.TXT)? [Enter=Y]',
    'Process system startup file (CONFIG.SYS)? [Y]',
    'DEVICE=C:\\SYSTEM\\HIMEM.SYS [Y]',
    'DEVICE=C:\\SYSTEM\\TEAM_AltF4_RAGE_ENGINE.SYS [Y]',
    'DEVICE=C:\\SYSTEM\\OPTICAL_SENSOR_DRIVER.SYS [Y]',
    'DEVICE=C:\\SYSTEM\\NOBROWSE_VIRTUAL_SOCK.SYS [Y]',
    'DEVICE=C:\\SYSTEM\\CAUGHT_IN_4K_SURVEILLANCE.SYS [Y]',
    'DEVICE=C:\\SYSTEM\\RAGEWARE_MAIL_P2P.SYS [Y]',
    'Process startup commands (AUTOEXEC.BAT)? [Y]',
    'WIN.COM /VER:4.10.1998 [Starting RAGEWARE GUI...]',
  ];

  const handleAdvanceStep = () => {
    if (stepIndex < STEP_PROMPTS.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      triggerSplashTransition('normal');
    }
  };

  // Descriptive text for each menu option
  const getOptionDescription = (opt) => {
    switch (opt) {
      case 1:
        return 'Standard cognitive resilience benchmark. Full procedural ragebait antagonism, evasive controls, deceptive dialogs, and tolerance tracking active.';
      case 2:
        return 'Safe Mode overrides all behavioral hostility. Safe Shield active (0% friction). Evasive buttons and disruptive popups disabled for evaluation.';
      case 3:
        return 'Prompts user line-by-line before initializing each kernel subsystem (HIMEM.SYS, RAGE_CORE.SYS, SOUND_SYNTH.SYS, OPTICAL_VISION, NOBROWSE, CAUGHT_4K).';
      case 4:
        return 'Boots directly into the MS-DOS 7.1 command interpreter shell with diagnostic utilities and exit traps.';
      case 5:
        return 'Displays Award Modular BIOS hardware bus architecture, IRQ allocation table, and Team AltF4 project authorship specifications.';
      default:
        return '';
    }
  };

  return (
    <div className="os-boot-screen crt-warmup-anim" id="os-boot-screen">
      {/* STAGE 1: Classic Award Modular BIOS POST Screen */}
      {stage === 'bios' && (
        <div className="bios-post-container mono">
          <div className="bios-top-row">
            <div className="bios-header-text">
              <div className="bios-brand-title">Award Modular BIOS v4.51PG, An Energy Star Ally</div>
              <div className="bios-copyright">Copyright (C) 1984-98, Award Software, Inc.</div>
              <div className="bios-team-notice">RAGEWARE 98 SYSTEM CORE // ENGINEERED FROM SCRATCH BY TEAM AltF4</div>
            </div>
            <div className="bios-energy-star">
              <EnergyStarLogo />
            </div>
          </div>

          <div className="bios-specs-stream">
            <div className="bios-line">
              Main Processor   : <strong>Pentium(R) II CPU at 450MHz</strong> (L2 Cache: 512KB, Friction Multiplier: 100%)
            </div>
            <div className="bios-line">
              Memory Testing   : <strong>{memoryKB}K</strong> {isMemoryDone ? 'OK' : '...'}
            </div>
            <div className="bios-line">
              Floppy Drive A   : 1.44MB 3.5-inch Drive (Ready)
            </div>
            <div className="bios-line">
              Primary Master   : WDC AC34300L (4300MB Ultra DMA/33, Mode 4)
            </div>
            <div className="bios-line">
              Primary Slave    : ATAPI CD-ROM 32X MAX (Mode 4)
            </div>
            <div className="bios-line">
              Secondary Master : NOBROWSE™ VIRTUAL SOCKET v1.0 (Live Cloud Bridge)
            </div>
            <div className="bios-line">
              Secondary Slave  : CAUGHT_IN_4K OPTICAL FEED (WASM Active)
            </div>
            <div className="bios-line">
              Sound Subsystem  : Web Audio Sound Blaster 16 AWE32 DSP v4.13
            </div>
            <div className="bios-line">
              Display Subsystem: S3 Trio64V+ PCI 2MB VRAM (SVGA 800x600 60Hz)
            </div>
            {profile.rageScore >= 40 && (
              <div className="bios-line warning">
                Advisory Cache   : User Volatility Profile Loaded (Rage Index: {profile.rageScore}%)
              </div>
            )}
          </div>

          <div className="bios-footer-banner">
            <span>Press <strong>F8</strong> for Startup Menu &bull; <strong>DEL</strong> for Setup &bull; <strong>ESC</strong> for Quick Boot</span>
            <button className="bios-skip-btn" onClick={() => setStage('menu')}>[ ENTER STARTUP MENU ]</button>
          </div>
        </div>
      )}

      {/* STAGE 2: Interactive Windows 98 Startup Menu */}
      {stage === 'menu' && (
        <div className="startup-menu-container mono">
          <div className="startup-menu-header">
            <div className="startup-title">Microsoft Windows 98 Startup Menu</div>
            <div className="startup-subtitle">TEAM AltF4 RESEARCH &amp; EVALUATION EDITION</div>
            <div className="startup-rule" />
          </div>

          <div className="startup-menu-options">
            {[
              { num: 1, label: '1. Normal Mode (Recommended - Full Antagonistic Chaos)' },
              { num: 2, label: '2. Safe Mode (Safe Shield Active - 0% Friction)' },
              { num: 3, label: '3. Step-by-Step Confirmation (Interactive Module Prompts)' },
              { num: 4, label: '4. Command Prompt Only (MS-DOS 7.1 Real-Mode)' },
              { num: 5, label: '5. View System Architecture & Authorship (Team AltF4)' },
            ].map((opt) => {
              const isSelected = selectedOption === opt.num;
              return (
                <div
                  key={opt.num}
                  className={`startup-menu-row ${isSelected ? 'highlighted' : ''}`}
                  onClick={() => {
                    soundEngine.playKeyClick();
                    setSelectedOption(opt.num);
                  }}
                  onDoubleClick={() => handleExecuteOption(opt.num)}
                >
                  <span className="row-pointer">{isSelected ? '►' : ' '}</span>
                  <span className="row-label">{opt.label}</span>
                </div>
              );
            })}
          </div>

          <div className="startup-choice-bar">
            <span>Enter a choice: <strong>{selectedOption}</strong><span className="blink-cursor">_</span></span>
            <span className="startup-countdown-text">Time remaining: <strong>0{countdown}</strong></span>
          </div>

          {/* Dynamic Descriptive Help Box */}
          <div className="startup-help-box">
            <div className="help-box-header">OPTION DESCRIPTION:</div>
            <div className="help-box-body">{getOptionDescription(selectedOption)}</div>
          </div>

          {/* Bottom Action Controls */}
          <div className="startup-menu-actions">
            <button 
              id="btn-boot-selected-mode"
              className="startup-action-btn primary"
              onClick={() => handleExecuteOption(selectedOption)}
            >
              [ ENTER &bull; BOOT SELECTED MODE ]
            </button>
            <button 
              className="startup-action-btn"
              onClick={() => handleImmediateBoot('normal')}
            >
              [ ESC &bull; FAST-FORWARD TO DESKTOP ]
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2.5: MS-DOS 7.1 Driver Load Stream */}
      {stage === 'dosload' && (
        <div className="startup-menu-container mono" style={{ gap: '6px' }}>
          <div className="startup-title" style={{ color: '#00ffff' }}>Starting Windows 98...</div>
          <div className="startup-rule" style={{ marginBottom: '10px' }} />
          <div style={{ color: '#c0c0c0', fontSize: '13px', lineHeight: '1.6' }}>
            <div>HIMEM: DOS XMS Driver, Version 3.95 (131,072K Extended Memory OK)</div>
            <div>DEVICEHIGH=C:\SYSTEM\TEAM_AltF4_RAGE_CORE.SYS [ACTIVE]</div>
            <div>DEVICEHIGH=C:\SYSTEM\NOBROWSE_VIRTUAL_SOCK.SYS [ONLINE]</div>
            <div>DEVICEHIGH=C:\SYSTEM\CAUGHT_IN_4K_SURVEILLANCE.SYS [READY]</div>
            <div>DEVICEHIGH=C:\SYSTEM\RAGEWARE_MAIL_P2P.SYS [PORT: 8000]</div>
            <div>SET BLASTER=A220 I5 D1 H5 P330 T6 [AWE32 SYNTH ACTIVE]</div>
            <div style={{ color: '#ffff55', marginTop: '6px' }}>C:\WINDOWS&gt; WIN /VER:4.10.1998</div>
          </div>
        </div>
      )}

      {/* STAGE 3: Step-by-Step Confirmation Mode */}
      {stage === 'step' && (
        <div className="startup-menu-container mono">
          <div className="startup-menu-header">
            <div className="startup-title">Windows 98 Step-by-Step Confirmation</div>
            <div className="startup-subtitle">Press [Y] or [Enter] to confirm each module, [N] to bypass.</div>
            <div className="startup-rule" />
          </div>

          <div className="step-prompts-stream">
            {STEP_PROMPTS.slice(0, stepIndex + 1).map((prompt, idx) => (
              <div key={idx} className="step-prompt-line">
                <span className="step-bullet">&gt;</span> {prompt}
                {idx < stepIndex && <span className="step-confirmed"> [OK]</span>}
              </div>
            ))}
          </div>

          <div className="startup-menu-actions" style={{ marginTop: '2rem' }}>
            <button className="startup-action-btn primary" onClick={handleAdvanceStep}>
              [ PRESS Y / ENTER TO CONFIRM STEP ]
            </button>
            <button className="startup-action-btn" onClick={() => triggerSplashTransition('normal')}>
              [ BOOT DESKTOP NOW ]
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: Award BIOS System Configuration Summary Table */}
      {stage === 'specs' && (
        <div className="startup-menu-container mono">
          <div className="startup-menu-header">
            <div className="startup-title">Award Modular BIOS — System Configuration</div>
            <div className="startup-subtitle">ALL CODE &amp; ARCHITECTURE CRAFTED 100% FROM SCRATCH BY TEAM AltF4</div>
            <div className="startup-rule" />
          </div>

          <div className="specs-table-box">
            <table className="bios-specs-table">
              <tbody>
                <tr>
                  <td>Processor</td>
                  <td>Pentium(R) II 450MHz MMX</td>
                  <td>Base Memory</td>
                  <td>640 KB</td>
                </tr>
                <tr>
                  <td>Co-Processor</td>
                  <td>Installed (Internal FPU)</td>
                  <td>Extended Memory</td>
                  <td>130,432 KB</td>
                </tr>
                <tr>
                  <td>Diskette Drive A:</td>
                  <td>1.44MB 3.5-inch</td>
                  <td>Primary Master</td>
                  <td>4300 MB LBA Mode</td>
                </tr>
                <tr>
                  <td>Display Type</td>
                  <td>SVGA 800x600 16-Bit</td>
                  <td>Primary Slave</td>
                  <td>32X ATAPI CD-ROM</td>
                </tr>
                <tr>
                  <td>Secondary Master</td>
                  <td>NOBROWSE™ (Vercel Bridge)</td>
                  <td>Secondary Slave</td>
                  <td>CAUGHT_IN_4K (AI Vision)</td>
                </tr>
                <tr>
                  <td>Authorship Core</td>
                  <td><strong>TEAM AltF4</strong></td>
                  <td>Architecture Origin</td>
                  <td><strong>100% Scratch-Built React 19</strong></td>
                </tr>
              </tbody>
            </table>

            <div className="pci-irq-strip">
              <div>PCI / ISA DEVICE INTERRUPT (IRQ) ROUTING TABLE:</div>
              <div>Bus: 0 &bull; Dev: 7 &bull; Func: 0 &bull; Vendor: AltF4_ENG &bull; Device: Cognitive Friction Co-Processor &bull; IRQ: 11</div>
              <div>Bus: 0 &bull; Dev: 11 &bull; Func: 0 &bull; Vendor: SoundBlaster &bull; Device: WebAudio AWE32 Multi-Synth &bull; IRQ: 5 (DMA: 1, 5)</div>
              <div>Bus: 0 &bull; Dev: 14 &bull; Func: 0 &bull; Vendor: GestureBridge &bull; Device: rageware-gesture-drive:// IPC &bull; IRQ: 10</div>
              <div>Bus: 0 &bull; Dev: 18 &bull; Func: 0 &bull; Vendor: MediaPipe &bull; Device: Local WASM Face Mesh Sensor &bull; IRQ: 12</div>
            </div>
          </div>

          <div className="startup-menu-actions" style={{ marginTop: '1.5rem' }}>
            <button className="startup-action-btn primary" onClick={() => setStage('menu')}>
              [ RETURN TO STARTUP MENU ]
            </button>
          </div>
        </div>
      )}

      {/* STAGE 5: Authentic Windows 98 Boot Splash with Animated Marquee */}
      {stage === 'splash' && (
        <div 
          className="windows-boot-splash" 
          onClick={() => handleImmediateBoot('normal')}
          title="Click to fast-forward into Desktop"
        >
          <div className="splash-centerpiece">
            {/* Classic 4-color Windows Flying Flag Homage */}
            <div className="splash-flag-icon">
              <svg width="68" height="52" viewBox="0 0 68 52" fill="none">
                <polygon points="4,12 30,5 30,25 4,32" fill="#E60000" />
                <polygon points="36,4 62,11 62,31 36,24" fill="#00A82D" />
                <polygon points="4,36 30,29 30,49 4,56" fill="#0066CC" />
                <polygon points="36,28 62,35 62,55 36,48" fill="#FFB300" />
              </svg>
            </div>

            {/* Windows 98 / RAGEWARE Homage Emblem */}
            <div className="splash-logo-title">
              <span className="splash-brand">RAGEWARE</span>
              <span className="splash-ver">98</span>
            </div>
            <div className="splash-sub-text mono">
              STARTING RAGEWARE 98 &bull; CRAFTED BY TEAM AltF4
            </div>

            {/* Authentic Animated Progress Marquee (Sliding 3 blue blocks) */}
            <div className="splash-marquee-shell">
              <div className="splash-marquee-track">
                <div className="splash-marquee-blocks">
                  <span className="marquee-block" />
                  <span className="marquee-block" />
                  <span className="marquee-block" />
                </div>
              </div>
            </div>

            <div className="splash-copyright mono">
              [C] 1998-2026 TEAM AltF4 &bull; ALL SUBSYSTEMS ENGINEERED FROM SCRATCH
            </div>
            <div className="splash-skip-tip mono">
              Click anywhere to fast-forward
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
