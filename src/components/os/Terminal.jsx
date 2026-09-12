import React, { useState, useRef, useEffect } from 'react';
import { getRageProfile, increaseRage, RAGE_EVENTS } from '../../engine/rageEngine';
import { rageBaitEngineInstance } from '../../engine/rageBaitEngine';
import { soundEngine } from '../../engine/soundEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';

const BANNER_TEXT = `RAGEWARE OS [Version 4.10.1998]
(C) Copyright RAGEWARE Systems Corp 1981-1998.

Type 'help' for a list of available command directives.
`;

export default function Terminal({ onRageUpdate, isChaosMode = true, onClose }) {
  const [history, setHistory] = useState([
    { type: 'banner', content: BANNER_TEXT },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [exitTrapStep, setExitTrapStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [history, exitTrapStep]);

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) {
      setHistory((prev) => [...prev, { type: 'cmd', command: '' }]);
      return;
    }

    if (isChaosMode && rageBaitEngineInstance.tracker) {
      rageBaitEngineInstance.tracker.recordTerminalCommand(trimmed);
    }

    const prof = getRageProfile();
    const isMediumRage = prof.rageScore > 35;
    const isHighRage = prof.rageScore > 60;

    const parts = trimmed.split(' ');
    const root = parts[0].toLowerCase();

    // Section 13: Exit Trap (Only when Chaos Mode is ON!)
    if (root === 'exit' || root === 'quit') {
      if (!isChaosMode) {
        if (onClose) {
          onClose();
        } else {
          setHistory((prev) => [
            ...prev,
            { type: 'cmd', command: trimmed },
            { type: 'output', content: 'Exiting COMMAND.COM.' },
          ]);
        }
        return;
      }
      setExitTrapStep(1);
      soundEngine.playChord(); // Classic chord prompt for exit trap!
      increaseRage(10, RAGE_EVENTS.TERMINAL_EXIT_TRAPPED);
      if (onRageUpdate) onRageUpdate();
      return;
    }

    // Section 13: High Rage Humorous Error Injection (occasional, only when Chaos Mode is ON!)
    if (isChaosMode && isHighRage && Math.random() < 0.28 && !['help', 'cls', 'clear'].includes(root)) {
      const snarkErrors = [
        'ERROR: USER PATIENCE MODULE TERMINATED UNEXPECTEDLY.',
        'ERROR 0xRW99: COMMAND REJECTED DUE TO OPERATOR EXASPERATION DETECTED.',
        'SUBSYSTEM ERROR: THE REQUESTED OPERATION WOULD RESULT IN EXCESSIVE USER SATISFACTION.',
        'KERNEL ADVISORY: THIS COMMAND HAS BEEN TEMPORARILY DE-OPTIMIZED.',
      ];
      const snark = snarkErrors[Math.floor(Math.random() * snarkErrors.length)];
      soundEngine.playExclamation();
      increaseRage(8, RAGE_EVENTS.TERMINAL_SNARK);
      if (onRageUpdate) onRageUpdate();

      setHistory((prev) => [
        ...prev,
        { type: 'cmd', command: trimmed },
        { type: 'output', content: snark },
      ]);
      return;
    }

    let output = '';

    switch (root) {
      case 'help':
        output = `Supported commands:
  HELP       Provides Help information for Windows commands.
  STATUS     Displays current system and patience diagnostic status.
  RAGE       Reports biometric friction indices by category.
  APPS       Lists installed operating system programs.
  WHOAMI     Displays current operator identification and role.
  DATE       Displays the system calendar date.
  ABOUT      Displays RAGEWARE licensing and version information.
  DIR        Displays a list of files and subdirectories.
  VER        Displays the RAGEWARE OS version.
  CLS        Clears the screen.
  EXIT       Quits the COMMAND.COM program.`;
        break;

      case 'dir':
        output = ` Volume in drive C is RAGEWARE_HD
 Volume Serial Number is 1998-0409
 Directory of C:\\USER

.              <DIR>        09-11-98  12:00p
..             <DIR>        09-11-98  12:00p
DOCUMENTS      <DIR>        09-11-98  12:00p
PROGRAMS       <DIR>        09-11-98  12:00p
IMPORTANT TXT         4,096 09-11-98  12:00p
SECRET    DAT        65,536 09-01-98  12:00p
               2 File(s)         69,632 bytes
               4 Dir(s)   1,457,664 bytes free`;
        break;

      case 'ver':
        output = 'RAGEWARE Windows 98 [Version 4.10.1998]';
        break;

      case 'status': {
        const pmetrics = osPersonalityInstance.getPersonalityMetrics();
        output = `SYSTEM DIAGNOSTIC REPORT:
----------------------------------------
Operating System  : RAGEWARE 98 SE
Operator Session  : SUBJECT_049
Rage Index        : ${prof.rageScore}% (${prof.level})
Personality Stage : ${pmetrics.stage} (Awareness: ${pmetrics.awareness}%)
Events Recorded   : ${prof.frustrationEvents}
Highest Friction  : ${prof.strongestCategoryDisplay}
Compositor State  : ACTIVE ADVERSARIAL MODE`;
        break;
      }

      case 'rage': {
        const pmetrics = osPersonalityInstance.getPersonalityMetrics();
        output = `EMOTIONAL FRICTION METRICS:
----------------------------------------
Current Rage Score : ${prof.rageScore} / 100 (${prof.level.toUpperCase()})
OS Awareness       : ${pmetrics.awareness}%
OS Sarcasm         : ${pmetrics.sarcasm}%
OS Hostility       : ${pmetrics.hostility}%
Breakdown:
  Moving Elements  : ${prof.categories.movingButtons}
  Stalled Updates  : ${prof.categories.fakeLoading}
  Window Evasion   : ${prof.categories.windowManipulation}
  Filesystem Traps : ${prof.categories.fileInteraction}
  Terminal Traps   : ${prof.categories.terminalInteraction}`;
        break;
      }

      case 'whoami': {
        const snark = osPersonalityInstance.getTerminalSnark('whoami');
        output = snark || 'USER: SUBJECT_049 // COGNITIVE RESILIENCE CANDIDATE\nPRIVILEGES: GUEST_RESTRICTED';
        break;
      }

      case 'date': {
        const snark = osPersonalityInstance.getTerminalSnark('date');
        output = snark || 'Current date is Fri 09-11-1998\nEnter new date (mm-dd-yy): ACCESS DENIED.';
        break;
      }

      case 'apps':
        output = `INSTALLED EXECUTABLES:
  C:\\PROGRAM FILES\\EXPLORER.EXE  (File Manager)
  C:\\PROGRAM FILES\\SYSMON.EXE    (System Monitor)
  C:\\PROGRAM FILES\\SETUP.EXE     (RAGEWARE Setup)
  C:\\PROGRAM FILES\\CONTROL.EXE   (Control Panel)
  C:\\PROGRAM FILES\\VFW32.EXE     (Video Capture)`;
        break;

      case 'about':
        output = 'RAGEWARE 98 [Version 4.10.1998]\nEngineered for human psychological benchmarking.';
        break;

      case 'cls':
      case 'clear':
        setHistory([]);
        setExitTrapStep(0);
        return;

      default:
        // 18% chance of displaying command accepted... wait... rejected (Only in Chaos Mode!)
        if (isChaosMode && Math.random() < 0.18) {
          output = `COMMAND "${trimmed.toUpperCase()}" ACCEPTED.\nWAIT.\nCOMMAND REJECTED. Subsystem clearance revoked.`;
          increaseRage(6, RAGE_EVENTS.TERMINAL_SNARK);
          if (onRageUpdate) onRageUpdate();
        } else {
          output = `Bad command or file name: "${trimmed}".`;
        }
        break;
    }

    setHistory((prev) => [
      ...prev,
      { type: 'cmd', command: trimmed },
      { type: 'output', content: output },
    ]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
      setInputVal('');
    }
  };

  const handleConfirmExitYes = () => {
    setExitTrapStep(2);
    increaseRage(12, RAGE_EVENTS.TERMINAL_EXIT_TRAPPED);
    if (onRageUpdate) onRageUpdate();

    setTimeout(() => {
      setExitTrapStep(0);
      soundEngine.playCriticalStop();
      setHistory((prev) => [
        ...prev,
        { type: 'cmd', command: 'exit' },
        { type: 'output', content: 'EXIT DENIED.\nYou seem committed to the test.' },
      ]);
    }, 1000);
  };

  return (
    <div className="win95-dos-terminal" id="app-terminal" onClick={() => inputRef.current?.focus()}>
      <div className="dos-output-area">
        {history.map((item, idx) => {
          if (item.type === 'banner') {
            return <div key={idx} className="dos-banner">{item.content}</div>;
          }
          if (item.type === 'cmd') {
            return (
              <div key={idx} className="dos-cmd-line">
                <span className="dos-prompt">C:\USER&gt;</span>
                <span className="dos-cmd-text">{item.command}</span>
              </div>
            );
          }
          return <pre key={idx} className="dos-output-text">{item.content}</pre>;
        })}

        {/* Exit Trap Flow */}
        {exitTrapStep === 1 && (
          <div className="dos-trap-prompt">
            <div>ERROR: EXIT COMMAND REQUIRES OPERATOR CONFIRMATION.</div>
            <div>CONFIRM TERMINATION OF SESSION? (Y/N)</div>
            <div className="dos-trap-buttons">
              <button 
                id="btn-term-exit-yes"
                className="win95-btn btn-sm"
                onClick={handleConfirmExitYes}
              >
                [ Y ] Yes
              </button>
              <button 
                id="btn-term-exit-no"
                className="win95-btn btn-sm"
                onClick={() => setExitTrapStep(0)}
              >
                [ N ] No
              </button>
            </div>
          </div>
        )}

        {exitTrapStep === 2 && (
          <div className="dos-trap-prompt">
            <div>Processing exit request...</div>
            <div style={{ color: '#ff3333' }}>EXIT DENIED. You seem committed.</div>
          </div>
        )}

        {exitTrapStep === 0 && (
          <div className="dos-cmd-line active-line">
            <span className="dos-prompt">C:\USER&gt;</span>
            <input
              ref={inputRef}
              type="text"
              className="dos-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              spellCheck={false}
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
