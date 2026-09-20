import React, { useState, useRef, useEffect } from 'react';
import { increaseRage, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';
import { rageBaitEngineInstance, RAGEBAIT_EVENT_TYPES } from '../../engine/rageBaitEngine';
import { soundEngine } from '../../engine/soundEngine';
import { systemSettings } from '../../services/systemSettings';

export default function OSWindow({
  id,
  title,
  icon: IconComponent,
  initialX = 120,
  initialY = 50,
  initialWidth = 720,
  initialHeight = 480,
  minWidth = 320,
  minHeight = 200,
  zIndex = 10,
  isActive = true,
  isMinimized = false,
  rageLevel = 0,
  isChaosMode = true,
  showMenuBar = true,
  showStatusBar = true,
  statusBarText = 'Ready',
  onFocus,
  onClose,
  onMinimize,
  onRageUpdate,
  children,
}) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevBounds, setPrevBounds] = useState({ x: initialX, y: initialY, width: initialWidth, height: initialHeight });
  const [activeMenu, setActiveMenu] = useState(null);

  // Settings: Show window contents while dragging
  const [dragContents, setDragContents] = useState(() => systemSettings.get('dragContents') ?? true);
  const [dragOutline, setDragOutline] = useState(null);
  const dragOutlineRef = useRef(null);

  useEffect(() => {
    return systemSettings.subscribe((settings) => {
      setDragContents(settings.dragContents ?? true);
    });
  }, []);

  // Hostile Window Controls State
  const [closeBtnOffset, setCloseBtnOffset] = useState({ x: 0, y: 0 });
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [confirmYesOffset, setConfirmYesOffset] = useState({ x: 0, y: 0 });
  const [confirmEscapes, setConfirmEscapes] = useState(0);

  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const windowRef = useRef(null);

  const handleWindowMouseDown = () => {
    if (onFocus) onFocus(id);
    setActiveMenu(null);
  };

  const handleTitleMouseDown = (e) => {
    if (e.target.closest('.win95-ctrl-btn') || e.target.closest('.win95-confirm-box')) return;
    if (isMaximized) return;

    if (onFocus) onFocus(id);
    setActiveMenu(null);
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    document.body.classList.add('os-dragging-active');
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;

      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      const topLimit = 0;
      const bottomLimit = window.innerHeight - 60;
      const leftLimit = -size.width + 80;
      const rightLimit = window.innerWidth - 80;

      const clampedX = Math.max(leftLimit, Math.min(rightLimit, newX));
      const clampedY = Math.max(topLimit, Math.min(bottomLimit, newY));

      if (dragContents) {
        setPosition({ x: clampedX, y: clampedY });
      } else {
        setDragOutline({ x: clampedX, y: clampedY });
        dragOutlineRef.current = { x: clampedX, y: clampedY };
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.classList.remove('os-dragging-active');
        if (!dragContents && dragOutlineRef.current) {
          setPosition({ x: dragOutlineRef.current.x, y: dragOutlineRef.current.y });
          setDragOutline(null);
          dragOutlineRef.current = null;
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [size.width]);

  const toggleMaximize = (e) => {
    e?.stopPropagation();
    if (isMaximized) {
      setPosition({ x: prevBounds.x, y: prevBounds.y });
      setSize({ width: prevBounds.width, height: prevBounds.height });
      setIsMaximized(false);
    } else {
      setPrevBounds({ x: position.x, y: position.y, width: size.width, height: size.height });
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight - 32 }); // above 32px taskbar
      setIsMaximized(true);
    }
  };

  const [isReversed, setIsReversed] = useState(false);
  const [betrayalMessage, setBetrayalMessage] = useState('');

  const handleCloseBtnHover = () => {
    // Step 7: At rage > 60, dodge probability increases to 65% (otherwise 45% at rage > 20)
    const dodgeChance = rageLevel > 60 ? 0.65 : 0.45;
    if (isChaosMode && rageLevel > 20 && Math.random() < dodgeChance && closeBtnOffset.x === 0) {
      const dodgeX = Math.random() > 0.5 ? -25 : -40;
      setCloseBtnOffset({ x: dodgeX, y: 0 });
      soundEngine.playBoing();
      increaseRage(8, RAGE_EVENTS.WINDOW_CONTROL_ESCAPE);
      if (onRageUpdate) onRageUpdate();

      setTimeout(() => {
        setCloseBtnOffset({ x: 0, y: 0 });
      }, 850);
    }
  };

  const handleCloseBtnClick = (e) => {
    e.stopPropagation();
    if (isChaosMode && rageLevel > 25 && Math.random() < 0.6 && !showConfirmClose) {
      setShowConfirmClose(true);
      soundEngine.playChord(); // Classic Win95 chord when confirmation prompt pops up!
      setIsReversed(Math.random() < 0.25); // 25% chance of button betrayal
      setBetrayalMessage('');
      increaseRage(6, RAGE_EVENTS.WINDOW_CONFIRM_TRAP);
      if (onRageUpdate) onRageUpdate();
      return;
    }

    if (onClose) onClose(id);
  };

  const handleConfirmYesHover = () => {
    if (isChaosMode && confirmEscapes < 4) {
      const deltaX = (Math.random() - 0.5) * 80;
      const deltaY = (Math.random() - 0.5) * 40;
      setConfirmYesOffset({ x: deltaX, y: deltaY });
      soundEngine.playBoing();
      setConfirmEscapes((prev) => prev + 1);
      increaseRage(8, RAGE_EVENTS.WINDOW_CONFIRM_TRAP);
      if (onRageUpdate) onRageUpdate();
    }
  };

  const handleConfirmYesClick = (e) => {
    e.stopPropagation();
    if (isReversed) {
      // Button text betrayal: YES cancels
      setBetrayalMessage('ACTION CANCELLED BY SUBSYSTEM.');
      soundEngine.playExclamation();
      increaseRage(8, RAGE_EVENTS.WINDOW_CONFIRM_TRAP);
      if (onRageUpdate) onRageUpdate();
      setTimeout(() => setShowConfirmClose(false), 700);
      return;
    }
    recordSuccess();
    if (onRageUpdate) onRageUpdate();
    setShowConfirmClose(false);
    if (onClose) onClose(id);
  };

  const handleConfirmNoClick = (e) => {
    e.stopPropagation();
    if (isReversed) {
      // Button text betrayal: NO confirms close
      setBetrayalMessage('ACTION CONFIRMED. CLOSING WINDOW.');
      recordSuccess();
      if (onRageUpdate) onRageUpdate();
      setTimeout(() => {
        setShowConfirmClose(false);
        if (onClose) onClose(id);
      }, 500);
      return;
    }
    setShowConfirmClose(false);
  };

  return (
    <>
      {dragOutline && (
        <div 
          className="win95-window-drag-outline"
          style={{
            position: 'fixed',
            left: `${dragOutline.x}px`,
            top: `${dragOutline.y}px`,
            width: isMaximized ? '100vw' : `${size.width}px`,
            height: isMaximized ? 'calc(100vh - 32px)' : `${size.height}px`,
            zIndex: zIndex + 25,
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        ref={windowRef}
        id={`os-window-${id}`}
        className={`win95-window win-open ${isActive ? 'active-window' : 'inactive-window'} ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized-window' : ''} ${rageLevel > 70 ? 'rage-pulse-active' : ''}`}
        style={{
          display: isMinimized ? 'none' : 'flex',
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMaximized ? '100vw' : `${size.width}px`,
          height: isMaximized ? 'calc(100vh - 32px)' : `${size.height}px`,
          zIndex,
        }}
        onMouseDown={handleWindowMouseDown}
      >
      {/* Classic Title Bar */}
      <div 
        className={`win95-titlebar ${rageLevel > 70 && isActive ? 'titlebar-pulse' : ''}`}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={toggleMaximize}
      >
        <div className="titlebar-left">
          {IconComponent && (
            <span className="window-icon-wrap">
              <IconComponent size={16} />
            </span>
          )}
          <span className="window-title-text">{title}</span>
        </div>

        <div className="win95-titlebar-controls">
          <button 
            className="win95-ctrl-btn btn-min" 
            onClick={(e) => { 
              e.stopPropagation(); 
              // Step 7: At rage > 50, occasionally fires hostile notification
              if (isChaosMode && rageLevel > 50 && Math.random() < 0.5) {
                rageBaitEngineInstance.dispatch({
                  type: RAGEBAIT_EVENT_TYPES.FAKE_NOTIFICATION,
                  title: 'TASK SCHEDULER',
                  message: 'Minimizing windows will not reduce your measured impatience index.',
                });
              } else if (isChaosMode && rageLevel > 35 && Math.random() < 0.45) {
                rageBaitEngineInstance.dispatch({
                  type: RAGEBAIT_EVENT_TYPES.FAKE_NOTIFICATION,
                  title: 'TASK SCHEDULER',
                  message: 'Window minimized to low-priority cognitive background spooler.',
                });
              }
              if (onMinimize) onMinimize(id); 
            }}
            title="Minimize"
            id={`btn-min-${id}`}
          >
            &#9601;
          </button>
          <button 
            className="win95-ctrl-btn btn-max" 
            onClick={toggleMaximize}
            title={isMaximized ? 'Restore' : 'Maximize'}
            id={`btn-max-${id}`}
          >
            {isMaximized ? '❐' : '□'}
          </button>
          <button 
            className="win95-ctrl-btn btn-close" 
            style={{ transform: `translate(${closeBtnOffset.x}px, ${closeBtnOffset.y}px)` }}
            onMouseEnter={handleCloseBtnHover}
            onClick={handleCloseBtnClick}
            title="Close"
            id={`btn-close-${id}`}
          >
            &#10005;
          </button>
        </div>
      </div>

      {/* Classic Menu Bar */}
      {showMenuBar && (
        <div className="win95-menubar">
          {['File', 'Edit', 'View', 'Help'].map((menuName) => (
            <div key={menuName} className="win95-menu-container">
              <button 
                className={`win95-menu-item ${activeMenu === menuName ? 'menu-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === menuName ? null : menuName);
                }}
              >
                <u>{menuName[0]}</u>{menuName.slice(1)}
              </button>

              {activeMenu === menuName && (
                <div className="win95-dropdown-menu">
                  <div className="win95-dropdown-item" onClick={() => setActiveMenu(null)}>
                    {menuName === 'File' ? 'Close Window' : 'Properties'}
                  </div>
                  <div className="win95-dropdown-item" onClick={() => setActiveMenu(null)}>
                    Preferences
                  </div>
                  <div className="win95-dropdown-divider" />
                  <div className="win95-dropdown-item" onClick={() => { setActiveMenu(null); if (onClose) onClose(id); }}>
                    Exit
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Hostile Confirmation Overlay */}
      {showConfirmClose && (
        <div className="win95-confirm-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="win95-confirm-box">
            <div className="win95-titlebar active">
              <span className="window-title-text">Confirm Termination</span>
            </div>
            <div className="confirm-body">
              <p>{betrayalMessage || 'Are you sure you want to terminate this program?'}</p>
              <div className="confirm-btn-row">
                <button 
                  className="win95-btn btn-confirm-yes"
                  style={{ transform: `translate(${confirmYesOffset.x}px, ${confirmYesOffset.y}px)` }}
                  onMouseEnter={handleConfirmYesHover}
                  onClick={handleConfirmYesClick}
                >
                  Yes
                </button>
                <button 
                  className="win95-btn"
                  onClick={handleConfirmNoClick}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Window Body Client Area */}
      <div className="win95-window-body">
        {children}
      </div>

      {/* Classic Status Bar */}
      {showStatusBar && (
        <div className="win95-statusbar">
          <div className="statusbar-segment status-main">{statusBarText}</div>
          <div className="statusbar-segment status-sec">CAPS</div>
          <div className="statusbar-segment status-sec">NUM</div>
        </div>
      )}
    </div>
    </>
  );
}
