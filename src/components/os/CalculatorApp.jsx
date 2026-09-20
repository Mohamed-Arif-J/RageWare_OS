import React, { useState, useRef, useEffect } from 'react';
import { soundEngine } from '../../engine/soundEngine';
import { 
  increaseRage, 
  recordSuccess, 
  RAGE_EVENTS, 
  getRageProfile 
} from '../../engine/rageEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';

/**
 * CalculatorApp — Authentic Windows 95 Calculator
 * 
 * Strict Two-Mode Operation:
 * - SAFE MODE: 100% normal arithmetic, correct results, stable buttons, zero ragebait.
 * - CHAOS MODE: Subtle progressive psychological friction based on current rage tier:
 *   1. Result Betrayal ("Calculating...", "Are you sure?")
 *   2. Button Shift (Button moves slightly on hover, resets on click)
 *   3. Button Label Swap (Temporary visual swap of +/-)
 *   4. Fake Error Dialog ("An unexpected mathematical situation has occurred.")
 *   5. Delayed Result ("Processing... 99%")
 *   6. Clear Button Betrayal (Requires second click to confirm clear)
 *   7. History Interruption ("Previous calculation unavailable.")
 *   8. Sarcastic OS Personality Integration
 * 
 * Mathematical Integrity: Results are mathematically correct and always recoverable.
 */
export default function CalculatorApp({
  isChaosMode = false,
  profile,
  onRageUpdate,
  onClose,
}) {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [historyText, setHistoryText] = useState('');
  const [calculationCount, setCalculationCount] = useState(0);

  // Chaos Mode States (all disabled in Safe Mode)
  const [swappedButtons, setSwappedButtons] = useState(false);
  const [shiftingButton, setShiftingButton] = useState(null);
  const [buttonOffset, setButtonOffset] = useState({ x: 0, y: 0 });
  const [shiftAttempts, setShiftAttempts] = useState(0);
  const [isDelayedCalculating, setIsDelayedCalculating] = useState(false);
  const [delayedText, setDelayedText] = useState('');
  const [confirmClearNeeded, setConfirmClearNeeded] = useState(false);
  const [fakeErrorModal, setFakeErrorModal] = useState(null);
  const [areYouSureModal, setAreYouSureModal] = useState(null);

  const currentRage = profile?.rageScore || getRageProfile().rageScore;

  // Safe Mode Reset guarantee: whenever Safe Mode is active, clear all chaos states
  useEffect(() => {
    if (!isChaosMode) {
      setSwappedButtons(false);
      setShiftingButton(null);
      setButtonOffset({ x: 0, y: 0 });
      setIsDelayedCalculating(false);
      setDelayedText('');
      setConfirmClearNeeded(false);
      setFakeErrorModal(null);
      setAreYouSureModal(null);
    }
  }, [isChaosMode]);

  // Determine current rage tier probability for chaos triggers
  const getChaosProbability = () => {
    if (!isChaosMode) return 0;
    if (currentRage > 80) return 0.65; // Absolute Rage: frequent snark
    if (currentRage > 60) return 0.45; // Angry: obvious friction
    if (currentRage > 40) return 0.28; // Frustrated: small annoyances
    if (currentRage > 20) return 0.12; // Annoyed: rare subtle
    return 0.04; // Calm: almost completely normal
  };

  const handleDigit = (digit) => {
    soundEngine.playClick();

    // Reset button shifts upon interaction
    if (shiftingButton) {
      setShiftingButton(null);
      setButtonOffset({ x: 0, y: 0 });
      setShiftAttempts(0);
    }

    if (waitingForNext) {
      setDisplay(String(digit));
      setWaitingForNext(false);
    } else {
      setDisplay((prev) => (prev === '0' ? String(digit) : prev + digit));
    }
  };

  const handleOperator = (op) => {
    soundEngine.playClick();
    const current = parseFloat(display);

    if (operator && !waitingForNext) {
      executeMath(current, op);
    } else {
      setPrevVal(current);
      setHistoryText(`${current} ${op}`);
    }

    setOperator(op);
    setWaitingForNext(true);

    // Chaos Mode: occasionally swap '+' and '-' visual labels
    if (isChaosMode && (op === '+' || op === '-')) {
      const prob = getChaosProbability();
      if (Math.random() < prob * 0.7) {
        setSwappedButtons((prev) => !prev);
      }
    }
  };

  const executeMath = (secondOperand, nextOp = null) => {
    const first = prevVal !== null ? prevVal : parseFloat(display);
    const second = secondOperand !== undefined ? secondOperand : parseFloat(display);
    let result = 0;

    if (operator === '+') result = first + second;
    else if (operator === '-') result = first - second;
    else if (operator === '*') result = first * second;
    else if (operator === '/') {
      if (second === 0) {
        soundEngine.playCriticalStop();
        setDisplay('Cannot divide by zero');
        setWaitingForNext(true);
        setHistoryText('');
        return;
      }
      result = first / second;
    } else {
      result = second;
    }

    // Floating-point precision cleanup
    const cleanResult = Math.round(result * 100000000) / 100000000;
    const count = calculationCount + 1;
    setCalculationCount(count);

    // SAFE MODE: 100% pure instant result
    if (!isChaosMode) {
      setDisplay(String(cleanResult));
      setPrevVal(cleanResult);
      setWaitingForNext(true);
      setHistoryText(nextOp ? `${cleanResult} ${nextOp}` : '');
      return;
    }

    // CHAOS MODE: Contextual Ragebait Events
    const prob = getChaosProbability();

    // 1. Result Betrayal: "Are you sure?" prompt (Rare, high rage)
    if (currentRage > 60 && Math.random() < 0.22) {
      soundEngine.playExclamation();
      increaseRage(6, RAGE_EVENTS.CALCULATOR_INTERACTION_TRAP);
      if (onRageUpdate) onRageUpdate();

      setAreYouSureModal({
        result: cleanResult,
        nextOp,
      });
      return;
    }

    // 2. Result Betrayal / Delayed Result ("Calculating..." or "Processing... 99%")
    if (Math.random() < prob) {
      const isProgress = Math.random() < 0.4;
      const waitMessage = isProgress ? 'Processing... 99%' : 'Calculating...';
      setIsDelayedCalculating(true);
      setDelayedText(waitMessage);
      soundEngine.playBoing();

      increaseRage(4, RAGE_EVENTS.CALCULATOR_DELAYED_RESULT);
      if (onRageUpdate) onRageUpdate();

      setTimeout(() => {
        setIsDelayedCalculating(false);
        setDelayedText('');
        setDisplay(String(cleanResult));
        setPrevVal(cleanResult);
        setWaitingForNext(true);
        setHistoryText(nextOp ? `${cleanResult} ${nextOp}` : '');

        // OS Personality snark based on repeated calculations
        if (count >= 5 && count % 3 === 0) {
          if (currentRage > 60) {
            osPersonalityInstance.say("I calculated it correctly. You're welcome.");
          } else {
            osPersonalityInstance.say("You're really committed to that calculation.");
          }
        }
      }, isProgress ? 750 : 500);

      return;
    }

    // 3. Fake Error Modal (Very rare, recoverable)
    if (currentRage > 50 && Math.random() < 0.14) {
      soundEngine.playChord();
      increaseRage(8, RAGE_EVENTS.CALCULATOR_FAKE_ERROR);
      if (onRageUpdate) onRageUpdate();

      setFakeErrorModal({
        result: cleanResult,
        nextOp,
      });
      return;
    }

    // Standard correct calculation in Chaos Mode
    setDisplay(String(cleanResult));
    setPrevVal(cleanResult);
    setWaitingForNext(true);
    setHistoryText(nextOp ? `${cleanResult} ${nextOp}` : '');

    // Subtle personality comment
    if (count === 3 && currentRage > 30) {
      osPersonalityInstance.say("Again?");
    }
  };

  const handleEquals = () => {
    soundEngine.playClick();
    if (operator) {
      executeMath();
      setOperator(null);
    }
  };

  const handleClear = () => {
    soundEngine.playClick();

    // Chaos Mode: Clear Button Betrayal (Occasionally requires confirm click)
    if (isChaosMode && !confirmClearNeeded && Math.random() < getChaosProbability() * 0.8) {
      setConfirmClearNeeded(true);
      soundEngine.playBoing();
      increaseRage(4, RAGE_EVENTS.CALCULATOR_BUTTON_ESCAPE);
      if (onRageUpdate) onRageUpdate();
      return;
    }

    setConfirmClearNeeded(false);
    setDisplay('0');
    setPrevVal(null);
    setOperator(null);
    setWaitingForNext(false);
    setHistoryText('');
    setShiftingButton(null);
    setButtonOffset({ x: 0, y: 0 });
  };

  // Button Shift: Button moves slightly when user is about to click it
  const handleButtonHover = (btnKey) => {
    if (!isChaosMode) return;
    const prob = getChaosProbability();

    // Shift '5' or '=' or 'C' occasionally
    if ((btnKey === '5' || btnKey === '=' || btnKey === 'C') && Math.random() < prob * 0.6) {
      if (shiftAttempts < 2) {
        soundEngine.playPCSpeaker();
        const offsetX = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 8);
        const offsetY = (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 6);
        setShiftingButton(btnKey);
        setButtonOffset({ x: offsetX, y: offsetY });
        setShiftAttempts((prev) => prev + 1);

        increaseRage(6, RAGE_EVENTS.CALCULATOR_BUTTON_ESCAPE);
        if (onRageUpdate) onRageUpdate();
      }
    }
  };

  const confirmAreYouSure = () => {
    soundEngine.playClick();
    if (areYouSureModal) {
      const { result, nextOp } = areYouSureModal;
      setDisplay(String(result));
      setPrevVal(result);
      setWaitingForNext(true);
      setHistoryText(nextOp ? `${result} ${nextOp}` : '');
      setAreYouSureModal(null);
      recordSuccess();
      if (onRageUpdate) onRageUpdate();
    }
  };

  const dismissFakeError = () => {
    soundEngine.playClick();
    if (fakeErrorModal) {
      const { result, nextOp } = fakeErrorModal;
      setDisplay(String(result));
      setPrevVal(result);
      setWaitingForNext(true);
      setHistoryText(nextOp ? `${result} ${nextOp}` : '');
      setFakeErrorModal(null);
      recordSuccess();
      if (onRageUpdate) onRageUpdate();
    }
  };

  const getButtonStyle = (btnKey) => {
    if (shiftingButton === btnKey) {
      return {
        transform: `translate(${buttonOffset.x}px, ${buttonOffset.y}px)`,
        transition: 'transform 0.12s ease-out',
        zIndex: 5,
      };
    }
    return {};
  };

  return (
    <div className="win95-calc-shell" id="app-calculator" style={{ position: 'relative' }}>
      {/* Menu Bar */}
      <div className="calc-menubar">
        <span className="calc-menu-item"><u>E</u>dit</span>
        <span className="calc-menu-item"><u>V</u>iew</span>
        <span className="calc-menu-item"><u>H</u>elp</span>
      </div>

      {/* History Indicator */}
      <div style={{
        height: '14px',
        padding: '0 6px',
        fontSize: '10px',
        color: '#666',
        textAlign: 'right',
        fontFamily: 'Lucida Console, monospace'
      }}>
        {historyText}
      </div>

      {/* Sunken LCD Display */}
      <div className="calc-display-wrap sunken" style={{ position: 'relative' }}>
        <div className="calc-display-text mono">
          {isDelayedCalculating ? delayedText : display}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="calc-buttons-container" style={{ marginTop: '8px' }}>
        {/* Top Function Row */}
        <div className="calc-row-top">
          <button 
            className="win95-btn btn-sm calc-fn-btn" 
            onClick={() => setDisplay((prev) => prev.length > 1 ? prev.slice(0, -1) : '0')}
          >
            Backspace
          </button>
          <button 
            className="win95-btn btn-sm calc-fn-btn" 
            onClick={() => setDisplay('0')}
          >
            CE
          </button>
          <button 
            className="win95-btn btn-sm calc-fn-btn" 
            style={getButtonStyle('C')}
            onMouseEnter={() => handleButtonHover('C')}
            onClick={handleClear}
          >
            {confirmClearNeeded ? 'Clear?' : 'C'}
          </button>
        </div>

        {/* Numeric & Operator Grid */}
        <div className="calc-grid">
          {/* Row 1 */}
          <button className="win95-btn calc-num" onClick={() => handleDigit(7)}>7</button>
          <button className="win95-btn calc-num" onClick={() => handleDigit(8)}>8</button>
          <button className="win95-btn calc-num" onClick={() => handleDigit(9)}>9</button>
          <button className="win95-btn calc-op" onClick={() => handleOperator('/')}>/</button>
          <button className="win95-btn calc-op" onClick={() => setDisplay(String(Math.sqrt(parseFloat(display)) || 0))}>sqrt</button>

          {/* Row 2 */}
          <button className="win95-btn calc-num" onClick={() => handleDigit(4)}>4</button>
          <button 
            className="win95-btn calc-num" 
            style={getButtonStyle('5')}
            onMouseEnter={() => handleButtonHover('5')}
            onClick={() => handleDigit(5)}
          >
            5
          </button>
          <button className="win95-btn calc-num" onClick={() => handleDigit(6)}>6</button>
          <button className="win95-btn calc-op" onClick={() => handleOperator('*')}>*</button>
          <button className="win95-btn calc-op" onClick={() => setDisplay(String(parseFloat(display) / 100))}>%</button>

          {/* Row 3 */}
          <button className="win95-btn calc-num" onClick={() => handleDigit(1)}>1</button>
          <button className="win95-btn calc-num" onClick={() => handleDigit(2)}>2</button>
          <button className="win95-btn calc-num" onClick={() => handleDigit(3)}>3</button>
          <button className="win95-btn calc-op" onClick={() => handleOperator(swappedButtons ? '+' : '-')}>
            {swappedButtons ? '+' : '-'}
          </button>
          <button className="win95-btn calc-op" onClick={() => setDisplay(String(1 / parseFloat(display) || 0))}>1/x</button>

          {/* Row 4 */}
          <button className="win95-btn calc-num" onClick={() => handleDigit(0)}>0</button>
          <button className="win95-btn calc-num" onClick={() => setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev))}>+/-</button>
          <button className="win95-btn calc-num" onClick={() => !display.includes('.') && setDisplay((prev) => prev + '.')}>.</button>
          <button className="win95-btn calc-op" onClick={() => handleOperator(swappedButtons ? '-' : '+')}>
            {swappedButtons ? '-' : '+'}
          </button>
          <button 
            className="win95-btn calc-equals" 
            style={getButtonStyle('=')}
            onMouseEnter={() => handleButtonHover('=')}
            onClick={handleEquals}
          >
            =
          </button>
        </div>
      </div>

      {/* Fake Error Modal (Chaos Mode) */}
      {fakeErrorModal && (
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div 
            style={{
              width: '280px',
              background: '#c0c0c0',
              border: '2px outset #ffffff',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
              padding: '2px',
            }}
          >
            <div 
              style={{
                background: '#000080',
                color: '#ffffff',
                padding: '2px 4px',
                fontWeight: 'bold',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>CALCULATOR.EXE</span>
              <button 
                className="win95-ctrl-btn" 
                onClick={dismissFakeError}
                style={{ width: '14px', height: '14px', fontSize: '9px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '12px 10px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <span>An unexpected mathematical situation has occurred.</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '14px' }}>
                <button 
                  className="win95-btn default-btn" 
                  onClick={dismissFakeError}
                  style={{ minWidth: '60px' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "Are You Sure?" Result Betrayal Modal (Chaos Mode) */}
      {areYouSureModal && (
        <div 
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div 
            style={{
              width: '250px',
              background: '#c0c0c0',
              border: '2px outset #ffffff',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
              padding: '2px',
            }}
          >
            <div 
              style={{
                background: '#000080',
                color: '#ffffff',
                padding: '2px 4px',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
            >
              <span>Confirm Calculation</span>
            </div>
            <div style={{ padding: '12px 10px', fontSize: '11px', textAlign: 'center' }}>
              <p>Are you sure you want this result?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                <button 
                  className="win95-btn default-btn" 
                  onClick={confirmAreYouSure}
                  style={{ minWidth: '60px' }}
                >
                  Yes
                </button>
                <button 
                  className="win95-btn" 
                  onClick={confirmAreYouSure}
                  style={{ minWidth: '60px' }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
