import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { soundEngine } from '../../engine/soundEngine';
import { 
  increaseRage, 
  RAGE_EVENTS, 
  getRageProfile 
} from '../../engine/rageEngine';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Specific Harmless Date Observations
const SPECIFIC_DATE_MESSAGES = {
  '8-20': 'You are currently wasting time.', // Sept 20 (0-indexed month 8)
  '8-21': 'Tomorrow will probably be the same.',
  '8-22': 'RAGEWARE remembers.',
  '0-1': 'A new year of identical interface friction.',
  '3-1': 'Nothing special about today. Or tomorrow.',
  '6-4': 'Fictional independence day.',
  '9-31': 'All candy inspected and rejected.',
  '11-25': 'System remains operational on holidays.',
  '11-31': 'The final day of nothing accomplished.',
};

// Escalating Date Selection Commentary Pools
const MESSAGES_TIER_0 = [
  'Date selected.',
  'Date marked.',
  'Selected.',
];

const MESSAGES_TIER_1 = [
  "Yes. That's a date.",
  'Interesting choice.',
  'Congratulations.',
  'Excellent choice.',
  'That is, in fact, a date.',
  'Noted.',
  'I have absolutely no idea why you selected that.',
];

const MESSAGES_TIER_2 = [
  'You selected another date.',
  'You really like clicking dates.',
  'Still looking?',
  'Found anything yet?',
  'Perhaps tomorrow?',
  'Maybe yesterday?',
  'You seem very interested in this particular month.',
];

const MESSAGES_TIER_3 = [
  'Are you looking for something specific?',
  'You have inspected half the year.',
  'Temporal inspection ongoing.',
  "That's a lot of calendar browsing.",
  'You have visited multiple months without purpose.',
];

const MESSAGES_TIER_4 = [
  'You know this is just a calendar, right?',
  "At this point, I think you're just clicking things.",
  'You have clicked more dates than exist in this month.',
  'Have you found what you were looking for?',
  'The year remains unchanged.',
];

// Ambient idle status messages for status bar
const AMBIENT_STATUS_MESSAGES = [
  'Watching.',
  'Still here.',
  'Waiting...',
  'That was unnecessary.',
  'Interesting.',
  'Why?',
  'Processing your calendar activities.',
  'Everything is completely normal.',
  'Definitely normal.',
];

// Fictional Harmless Appointments Catalog
const FICTIONAL_APPOINTMENTS_DATA = [
  {
    title: 'URGENT MEETING',
    time: '09:00 AM',
    participants: 'You',
    agenda: 'Nothing.',
  },
  {
    title: 'Do Nothing',
    time: '10:00 AM',
    participants: 'You, Yourself',
    agenda: 'Complete inactivity strongly advised.',
  },
  {
    title: 'Think About It',
    time: '11:30 AM',
    participants: 'Internal Monologue',
    agenda: 'Re-evaluating decisions that led to opening this calendar.',
  },
  {
    title: 'RAGEWARE Maintenance',
    time: '01:00 PM',
    participants: 'System Subsystem',
    agenda: 'Polishing 3D bevels and measuring user patience.',
  },
  {
    title: 'Questionable Decision',
    time: '02:15 PM',
    participants: 'Operator',
    agenda: 'Proceeding regardless of warnings.',
  },
  {
    title: 'Clicking Practice',
    time: '03:30 PM',
    participants: 'Mouse Cursor',
    agenda: 'Clicking squares until satisfaction or exhaustion occurs.',
  },
  {
    title: 'User Patience Review',
    time: '04:00 PM',
    participants: 'Evaluation Committee',
    agenda: 'Patience index measured at critical operating levels.',
  },
  {
    title: 'Still Using RAGEWARE',
    time: '05:00 PM',
    participants: 'Subject 049',
    agenda: 'Operating system remains quietly amused.',
  },
  {
    title: 'Important Reminder',
    time: '06:00 PM',
    participants: 'Memory Buffer',
    agenda: 'Remember that you opened the calendar.',
  },
  {
    title: 'Absolutely Nothing',
    time: '07:30 PM',
    participants: 'Nobody',
    agenda: '0 items pending. 0 items completed. Peak efficiency.',
  },
  {
    title: 'Why Are You Checking This?',
    time: '09:00 PM',
    participants: 'Unknown Observer',
    agenda: 'There are no answers hidden in this calendar.',
  },
];

export default function CalendarApp({
  isChaosMode = false,
  profile,
  onRageUpdate,
  onClose,
}) {
  const today = useMemo(() => new Date(), []);
  
  // Navigation & Selection State (Accurate JS Date math)
  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [selectedDate, setSelectedDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  // Active Menu Bar state
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('month'); // 'month' | 'day'
  const [showAboutModal, setShowAboutModal] = useState(false);

  // Status & Personality Feedback
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [dateObservation, setDateObservation] = useState('You selected a date.');

  // Appointment Details Modal State
  const [selectedAppointmentModal, setSelectedAppointmentModal] = useState(null);

  // In-App Ragebait Modals & States (like Calculator & Paint)
  const [areYouSureModal, setAreYouSureModal] = useState(null); // { day, month, year }
  const [fakeSyncModal, setFakeSyncModal] = useState(null); // { progress: number, text: string }
  const [fakeErrorModal, setFakeErrorModal] = useState(null); // { title: string, message: string }
  const [shiftingCell, setShiftingCell] = useState(null); // day number
  const [shiftOffset, setShiftOffset] = useState({ x: 0, y: 0 });

  // Application-Local Chaos Tracking
  const [localInteractions, setLocalInteractions] = useState(0);
  const localInteractionsRef = useRef(0);
  const calendarChaosActiveRef = useRef(true);

  // Easter Egg tracking: consecutive clicks on identical date
  const sameDateTrackerRef = useRef({ key: '', count: 0 });

  // Navigation traps and cooldowns
  const navTrapCooldownRef = useRef(false);
  const rapidNavRef = useRef({ count: 0, lastTime: 0 });
  const trapTimerRef = useRef(null);
  const statusTimerRef = useRef(null);
  const ambientTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const lastInteractionTimeRef = useRef(Date.now());
  const lastMsgIdxRef = useRef(-1);

  const globalRage = profile?.rageScore ?? getRageProfile().rageScore;

  // --- Strict Application-Local Chaos Lifecycle ---
  // Mount: activates local chaos inside Calendar only
  // Unmount: immediately cancels all timers, cleans up event listeners, zero leaking to OS
  useEffect(() => {
    calendarChaosActiveRef.current = true;
    localInteractionsRef.current = 0;
    setLocalInteractions(0);

    // Ambient status timer (subtly updates bottom status bar every 7-12s when idle)
    const scheduleNextAmbient = () => {
      const delay = Math.floor(Math.random() * 5000) + 7000;
      ambientTimerRef.current = setTimeout(() => {
        if (!calendarChaosActiveRef.current) return;
        // Only set ambient message if user hasn't clicked anything in the last 4.5s
        if (Date.now() - lastInteractionTimeRef.current >= 4500) {
          const idx = Math.floor(Math.random() * AMBIENT_STATUS_MESSAGES.length);
          setStatusMessage(AMBIENT_STATUS_MESSAGES[idx]);
        }
        scheduleNextAmbient();
      }, delay);
    };

    scheduleNextAmbient();

    return () => {
      calendarChaosActiveRef.current = false;
      if (trapTimerRef.current) clearTimeout(trapTimerRef.current);
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Increment local interaction counter and timestamp
  const registerInteraction = useCallback(() => {
    lastInteractionTimeRef.current = Date.now();
    localInteractionsRef.current += 1;
    setLocalInteractions(localInteractionsRef.current);
  }, []);

  // Pick non-repeating message from array
  const pickMessage = useCallback((pool) => {
    if (!pool || pool.length === 0) return 'Date selected.';
    let nextIdx = Math.floor(Math.random() * pool.length);
    if (nextIdx === lastMsgIdxRef.current && pool.length > 1) {
      nextIdx = (nextIdx + 1) % pool.length;
    }
    lastMsgIdxRef.current = nextIdx;
    return pool[nextIdx];
  }, []);

  // --- Calendar Mathematics (100% Accurate) ---
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  const daysInPrevMonth = useMemo(() => {
    return new Date(viewYear, viewMonth, 0).getDate();
  }, [viewYear, viewMonth]);

  const daysRemainingInSelectedMonth = useMemo(() => {
    const totalDays = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    return totalDays - selectedDate.getDate();
  }, [selectedDate]);

  // Deterministic local fictional appointments for selected date
  const appointmentsForSelectedDate = useMemo(() => {
    const dateKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash * 31 + dateKey.charCodeAt(i)) % 10000;
    }

    const app1Idx = hash % FICTIONAL_APPOINTMENTS_DATA.length;
    const app2Idx = (hash + 4) % FICTIONAL_APPOINTMENTS_DATA.length;

    // Show 1 to 2 fictional appointments
    if (hash % 3 === 0) {
      return [FICTIONAL_APPOINTMENTS_DATA[app1Idx], FICTIONAL_APPOINTMENTS_DATA[app2Idx]];
    }
    return [FICTIONAL_APPOINTMENTS_DATA[app1Idx]];
  }, [selectedDate]);

  // --- In-App Ragebait: Trigger Fake Temporal Sync Spinner ---
  const triggerFakeSync = (targetDay, callback) => {
    soundEngine.playKeyboardClick?.() || soundEngine.playClick();
    setFakeSyncModal({ progress: 15, text: 'Synchronizing Temporal Index...' });
    
    let cur = 15;
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    syncIntervalRef.current = setInterval(() => {
      cur += Math.floor(Math.random() * 20) + 10;
      if (cur >= 99 && cur < 100) {
        setFakeSyncModal({ progress: 99, text: 'Stalling at 99% for verification...' });
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = setTimeout(() => {
          setFakeSyncModal({ progress: 100, text: 'Synchronization complete.' });
          soundEngine.playDing();
          setTimeout(() => {
            setFakeSyncModal(null);
            callback();
          }, 300);
        }, 500);
      } else if (cur < 99) {
        setFakeSyncModal({ progress: cur, text: `Synchronizing: ${cur}%` });
      }
    }, 120);

    increaseRage(2, RAGE_EVENTS.CALENDAR_INTERACTION_TRAP);
    if (onRageUpdate) onRageUpdate();
  };

  // --- Date Selection with Easter Egg & In-App Ragebait ---
  const performActualDateSelect = (day) => {
    const newDate = new Date(viewYear, viewMonth, day);
    const dateKey = `${viewYear}-${viewMonth}-${day}`;
    setSelectedDate(newDate);

    // Reset button shift
    setShiftingCell(null);
    setShiftOffset({ x: 0, y: 0 });

    // Easter Egg: Consecutive clicks on the exact same date
    const tracker = sameDateTrackerRef.current;
    if (tracker.key === dateKey) {
      tracker.count += 1;
    } else {
      tracker.key = dateKey;
      tracker.count = 1;
    }

    if (tracker.count === 5) {
      setStatusMessage('Yes.');
      setDateObservation('Yes.');
      increaseRage(1, RAGE_EVENTS.CALENDAR_REPEATED_INTERACTION);
      if (onRageUpdate) onRageUpdate();
      return;
    } else if (tracker.count === 6) {
      setStatusMessage('I noticed.');
      setDateObservation('I noticed.');
      increaseRage(1, RAGE_EVENTS.CALENDAR_REPEATED_INTERACTION);
      if (onRageUpdate) onRageUpdate();
      return;
    } else if (tracker.count === 7) {
      soundEngine.playExclamation?.() || soundEngine.playDing();
      setStatusMessage('STOP.');
      setDateObservation('STOP.');
      increaseRage(2, RAGE_EVENTS.CALENDAR_INTERACTION_TRAP);
      if (onRageUpdate) onRageUpdate();
      return;
    } else if (tracker.count >= 8) {
      setStatusMessage('Okay. You win.');
      setDateObservation('Okay. You win.');
      tracker.count = 0;
      return;
    }

    // High global rage special session state (never changes computer date)
    if (isChaosMode && globalRage > 75 && Math.random() < 0.4) {
      const msg = 'RAGEWARE REMEMBERS THIS DAY.';
      setStatusMessage(msg);
      setDateObservation(msg);
      return;
    }

    // Specific date Easter eggs
    const specificKey = `${newDate.getMonth()}-${newDate.getDate()}`;
    if (SPECIFIC_DATE_MESSAGES[specificKey] && Math.random() < 0.8) {
      const msg = SPECIFIC_DATE_MESSAGES[specificKey];
      setStatusMessage(msg);
      setDateObservation(msg);
      return;
    }

    // Escalating sarcasm based on local interactions & global rage tier
    const count = localInteractionsRef.current;
    let pool = MESSAGES_TIER_0;

    if (count >= 19 || (isChaosMode && globalRage > 70)) {
      pool = MESSAGES_TIER_4;
    } else if (count >= 13 || (isChaosMode && globalRage > 50)) {
      pool = MESSAGES_TIER_3;
    } else if (count >= 8 || (isChaosMode && globalRage > 30)) {
      pool = MESSAGES_TIER_2;
    } else if (count >= 4) {
      pool = MESSAGES_TIER_1;
    }

    const chosenMsg = pickMessage(pool);
    setStatusMessage(chosenMsg);
    setDateObservation(chosenMsg);

    // Occasional small mock event (+1 rage)
    if (count >= 6 && Math.random() < 0.18) {
      increaseRage(1, RAGE_EVENTS.CALENDAR_DATE_MOCK);
      if (onRageUpdate) onRageUpdate();
    }
  };

  const handleSelectDate = (day) => {
    soundEngine.playClick();
    registerInteraction();

    // In-App Ragebait: "Confirm Date Selection" Dialog (~14% chance after 5 interactions)
    if (isChaosMode && localInteractionsRef.current >= 5 && Math.random() < 0.14 && !areYouSureModal && !fakeSyncModal) {
      soundEngine.playChord?.() || soundEngine.playClick();
      setAreYouSureModal({ day, month: viewMonth, year: viewYear });
      increaseRage(1, RAGE_EVENTS.CALENDAR_INTERACTION_TRAP);
      if (onRageUpdate) onRageUpdate();
      return;
    }

    // In-App Ragebait: Fake Temporal Sync Spinner (~10% chance after 7 interactions)
    if (isChaosMode && localInteractionsRef.current >= 7 && Math.random() < 0.11 && !fakeSyncModal && !areYouSureModal) {
      triggerFakeSync(day, () => performActualDateSelect(day));
      return;
    }

    // In-App Ragebait: Fake Calendar General Protection Fault (~6% chance at high interactions)
    if (isChaosMode && localInteractionsRef.current >= 11 && Math.random() < 0.08 && !fakeErrorModal) {
      soundEngine.playCriticalStop?.() || soundEngine.playChord();
      setFakeErrorModal({
        title: 'Calendar 95 - Temporal Exception',
        message: `General Protection Fault in CALENDAR.EXE at 0x0028:C0011E36.\nSelected date (${MONTH_NAMES[viewMonth]} ${day}) exceeded local reality threshold.`
      });
      increaseRage(2, RAGE_EVENTS.CALENDAR_INTERACTION_TRAP);
      if (onRageUpdate) onRageUpdate();
      return;
    }

    performActualDateSelect(day);
  };

  // In-App Ragebait: Cell Hover Evasion / Jitter (like Calculator button shift!)
  const handleCellMouseEnter = (day) => {
    if (!isChaosMode) return;
    if (localInteractionsRef.current >= 6 && shiftingCell === null && Math.random() < 0.18) {
      const offsetX = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 8) + 6);
      const offsetY = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 4);
      setShiftingCell(day);
      setShiftOffset({ x: offsetX, y: offsetY });
      soundEngine.playBoing?.() || soundEngine.playClick();
      increaseRage(1, RAGE_EVENTS.CALENDAR_INTERACTION_TRAP);
      if (onRageUpdate) onRageUpdate();

      setTimeout(() => {
        setShiftingCell(null);
        setShiftOffset({ x: 0, y: 0 });
      }, 700);
    }
  };

  // --- Month Navigation Trolling ---
  const handlePrevMonth = () => {
    soundEngine.playClick();
    registerInteraction();

    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }

    checkRapidNavigation();
  };

  const handleNextMonth = () => {
    soundEngine.playClick();
    registerInteraction();

    const now = Date.now();
    const rapid = rapidNavRef.current;
    const isRapid = (now - rapid.lastTime < 1300);
    rapid.count = isRapid ? rapid.count + 1 : 1;
    rapid.lastTime = now;

    // Rapid clicking trolling
    if (rapid.count >= 4) {
      setStatusMessage('Please calm down.');
      setDateObservation('Calm down.');
      rapid.count = 0;
      // Step forward normally
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
      return;
    }

    // Rare navigation trap:
    // Only at 5+ local interactions, with cooldown, ~18% chance
    const trapProbability = isChaosMode ? 0.22 : 0.14;
    if (
      localInteractionsRef.current >= 5 &&
      !navTrapCooldownRef.current &&
      Math.random() < trapProbability
    ) {
      navTrapCooldownRef.current = true;
      const targetMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const targetYear = viewMonth === 11 ? viewYear + 1 : viewYear;

      setViewMonth(targetMonth);
      setViewYear(targetYear);

      // Snap back after 380ms
      trapTimerRef.current = setTimeout(() => {
        if (!calendarChaosActiveRef.current) return;
        setViewMonth(viewMonth);
        setViewYear(viewYear);
        soundEngine.playDing();

        const phrases = [
          'Navigation corrected.',
          "That wasn't the month you wanted.",
          "Let's try that again.",
        ];
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        setStatusMessage(phrase);
        setDateObservation(phrase);

        increaseRage(2, RAGE_EVENTS.CALENDAR_NAVIGATION_TRAP);
        if (onRageUpdate) onRageUpdate();

        // Release cooldown after 8s so user can easily reach desired month
        cooldownTimerRef.current = setTimeout(() => {
          navTrapCooldownRef.current = false;
        }, 8000);
      }, 380);

      return;
    }

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const checkRapidNavigation = () => {
    const count = localInteractionsRef.current;
    if (count === 8) {
      setStatusMessage("You've checked quite a few dates.");
    } else if (count === 15) {
      setStatusMessage('You have inspected half the year.');
    }
  };

  // --- Today Button Trolling ---
  const handleTodayClick = () => {
    soundEngine.playClick();
    registerInteraction();

    const now = new Date();
    const wasAlreadyToday = (
      viewYear === now.getFullYear() &&
      viewMonth === now.getMonth() &&
      selectedDate.getDate() === now.getDate() &&
      selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear()
    );

    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    const newSelected = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setSelectedDate(newSelected);

    // Trolling if clicked while already on today or after multiple interactions
    const trollChance = isChaosMode ? 0.6 : 0.35;
    if (wasAlreadyToday || (localInteractionsRef.current >= 4 && Math.random() < trollChance)) {
      const todayPhrases = [
        'You were already here.',
        'Yes. Today.',
        'Congratulations, you found today.',
        'Today has been successfully located.',
      ];
      if (localInteractionsRef.current >= 12 || (profile?.rageScore || 0) > 40) {
        todayPhrases.push('You could have looked at the taskbar.');
      }
      const phrase = todayPhrases[Math.floor(Math.random() * todayPhrases.length)];
      setStatusMessage(phrase);
      setDateObservation(phrase);
      increaseRage(1, RAGE_EVENTS.CALENDAR_TODAY_MOCK);
      if (onRageUpdate) onRageUpdate();
    } else {
      setStatusMessage('Today selected.');
      setDateObservation('Current date selected.');
    }
  };

  // --- Appointment Trolling Modal Click ---
  const handleAppointmentClick = (appointment) => {
    soundEngine.playChord?.() || soundEngine.playClick();
    registerInteraction();
    setSelectedAppointmentModal({
      title: appointment.title,
      time: appointment.time,
      participants: appointment.participants,
      agenda: appointment.agenda,
    });
    increaseRage(1, RAGE_EVENTS.CALENDAR_FAKE_APPOINTMENT);
    if (onRageUpdate) onRageUpdate();
  };

  const handleAppClick = () => {
    if (activeMenu) setActiveMenu(null);
  };

  // Build grid of 42 cells (6 rows x 7 cols)
  const calendarCells = useMemo(() => {
    const cells = [];
    
    // Days from previous month for leading blanks
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrev: true,
      });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = (
        today.getFullYear() === viewYear &&
        today.getMonth() === viewMonth &&
        today.getDate() === d
      );
      const isSelected = (
        selectedDate.getFullYear() === viewYear &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getDate() === d
      );

      cells.push({
        day: d,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    // Trailing days from next month to complete rows
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({
        day: d,
        isCurrentMonth: false,
        isNext: true,
      });
    }

    return cells;
  }, [viewYear, viewMonth, daysInMonth, firstDayOfWeek, daysInPrevMonth, today, selectedDate]);

  return (
    <div 
      className="win95-calendar-app" 
      onClick={handleAppClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--win-surface, #c0c0c0)',
        fontFamily: 'var(--font-win95, "Tahoma", sans-serif)',
        fontSize: '11px',
        color: '#000000',
        userSelect: 'none',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Classic Windows 95 Menu Bar */}
      <div 
        className="calendar-menu-bar"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--win-border-shadow, #808080)',
          padding: '2px 4px',
          background: 'var(--win-surface, #c0c0c0)',
          gap: '4px',
          position: 'relative',
          zIndex: 50,
        }}
      >
        {/* File Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className={`win95-menu-item ${activeMenu === 'file' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
            style={{
              background: activeMenu === 'file' ? '#000080' : 'transparent',
              color: activeMenu === 'file' ? '#ffffff' : '#000000',
              border: 'none',
              padding: '2px 6px',
              fontSize: '11px',
              cursor: 'default',
            }}
          >
            <u>F</u>ile
          </button>
          {activeMenu === 'file' && (
            <div 
              className="win95-dropdown-menu raised"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#c0c0c0',
                border: '2px outset #ffffff',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                minWidth: '120px',
                padding: '2px',
                zIndex: 100,
              }}
            >
              <div 
                className="menu-row"
                onClick={() => {
                  soundEngine.playClick();
                  if (onClose) onClose();
                }}
                style={{ padding: '3px 12px', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
              >
                E<u>x</u>it
              </div>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className={`win95-menu-item ${activeMenu === 'view' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'view' ? null : 'view');
            }}
            style={{
              background: activeMenu === 'view' ? '#000080' : 'transparent',
              color: activeMenu === 'view' ? '#ffffff' : '#000000',
              border: 'none',
              padding: '2px 6px',
              fontSize: '11px',
              cursor: 'default',
            }}
          >
            <u>V</u>iew
          </button>
          {activeMenu === 'view' && (
            <div 
              className="win95-dropdown-menu raised"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#c0c0c0',
                border: '2px outset #ffffff',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                minWidth: '140px',
                padding: '2px',
                zIndex: 100,
              }}
            >
              <div 
                className="menu-row"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveViewMode('month');
                  setActiveMenu(null);
                }}
                style={{ padding: '3px 12px', cursor: 'pointer', fontWeight: activeViewMode === 'month' ? 'bold' : 'normal' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
              >
                {activeViewMode === 'month' ? '✓ ' : '   '}<u>M</u>onth View
              </div>
              <div 
                className="menu-row"
                onClick={() => {
                  soundEngine.playClick();
                  setActiveViewMode('day');
                  setActiveMenu(null);
                }}
                style={{ padding: '3px 12px', cursor: 'pointer', fontWeight: activeViewMode === 'day' ? 'bold' : 'normal' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
              >
                {activeViewMode === 'day' ? '✓ ' : '   '}<u>D</u>ay Notes View
              </div>
            </div>
          )}
        </div>

        {/* Show Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className={`win95-menu-item ${activeMenu === 'show' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'show' ? null : 'show');
            }}
            style={{
              background: activeMenu === 'show' ? '#000080' : 'transparent',
              color: activeMenu === 'show' ? '#ffffff' : '#000000',
              border: 'none',
              padding: '2px 6px',
              fontSize: '11px',
              cursor: 'default',
            }}
          >
            <u>S</u>how
          </button>
          {activeMenu === 'show' && (
            <div 
              className="win95-dropdown-menu raised"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#c0c0c0',
                border: '2px outset #ffffff',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                minWidth: '140px',
                padding: '2px',
                zIndex: 100,
              }}
            >
              <div 
                className="menu-row"
                onClick={() => {
                  handleTodayClick();
                  setActiveMenu(null);
                }}
                style={{ padding: '3px 12px', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
              >
                <u>T</u>oday
              </div>
              <div 
                className="menu-row"
                onClick={() => {
                  handlePrevMonth();
                  setActiveMenu(null);
                }}
                style={{ padding: '3px 12px', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
              >
                <u>P</u>revious Month
              </div>
              <div 
                className="menu-row"
                onClick={() => {
                  handleNextMonth();
                  setActiveMenu(null);
                }}
                style={{ padding: '3px 12px', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
              >
                <u>N</u>ext Month
              </div>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div style={{ position: 'relative' }}>
          <button
            className={`win95-menu-item ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'help' ? null : 'help');
            }}
            style={{
              background: activeMenu === 'help' ? '#000080' : 'transparent',
              color: activeMenu === 'help' ? '#ffffff' : '#000000',
              border: 'none',
              padding: '2px 6px',
              fontSize: '11px',
              cursor: 'default',
            }}
          >
            <u>H</u>elp
          </button>
          {activeMenu === 'help' && (
            <div 
              className="win95-dropdown-menu raised"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: '#c0c0c0',
                border: '2px outset #ffffff',
                boxShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                minWidth: '130px',
                padding: '2px',
                zIndex: 100,
              }}
            >
              <div 
                className="menu-row"
                onClick={() => {
                  soundEngine.playClick();
                  setShowAboutModal(true);
                  setActiveMenu(null);
                }}
                style={{ padding: '3px 12px', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000080'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}
              >
                <u>A</u>bout Calendar
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Classic Navigation Toolbar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 8px',
          background: 'var(--win-surface, #c0c0c0)',
          borderBottom: '1px solid var(--win-border-shadow, #808080)',
        }}
      >
        {/* Previous Month & Next Month Buttons */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button 
            className="win95-btn" 
            onClick={handlePrevMonth}
            title="Previous Month"
            style={{ minWidth: '26px', height: '22px', padding: '0 4px', fontWeight: 'bold' }}
          >
            &lt;
          </button>
          <button 
            className="win95-btn" 
            onClick={handleNextMonth}
            title="Next Month"
            style={{ minWidth: '26px', height: '22px', padding: '0 4px', fontWeight: 'bold' }}
          >
            &gt;
          </button>
        </div>

        {/* Current Month & Year Display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px', letterSpacing: '0.5px' }}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
        </div>

        {/* Today Button */}
        <button 
          className="win95-btn"
          onClick={handleTodayClick}
          style={{ minWidth: '55px', height: '22px' }}
        >
          Today
        </button>
      </div>

      {/* Main Content Area */}
      <div 
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          padding: '6px',
          gap: '6px',
          background: 'var(--win-surface, #c0c0c0)',
        }}
      >
        {/* Left: The Month Calendar Grid */}
        <div 
          className="sunken-panel"
          style={{
            flex: activeViewMode === 'month' ? '1.2' : '1',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Weekday Headers */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              background: 'var(--win-surface, #c0c0c0)',
              borderBottom: '1px solid var(--win-border-shadow, #808080)',
              textAlign: 'center',
              fontWeight: 'bold',
              padding: '3px 0',
              fontSize: '10px',
            }}
          >
            {WEEKDAY_NAMES.map((name, i) => (
              <div 
                key={name}
                style={{
                  color: i === 0 || i === 6 ? '#c00000' : '#000000',
                }}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Date Cells Grid (6 rows x 7 cols) */}
          <div 
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gridTemplateRows: 'repeat(6, 1fr)',
              gap: '1px',
              background: '#e0e0e0',
              padding: '1px',
            }}
          >
            {calendarCells.map((cell, idx) => {
              const isCellToday = cell.isToday;
              const isCellSelected = cell.isSelected;
              const isDimmed = !cell.isCurrentMonth;
              const isShifting = shiftingCell === cell.day && cell.isCurrentMonth;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (cell.isCurrentMonth) {
                      handleSelectDate(cell.day);
                    } else if (cell.isPrev) {
                      handlePrevMonth();
                    } else if (cell.isNext) {
                      handleNextMonth();
                    }
                  }}
                  onMouseEnter={() => {
                    if (cell.isCurrentMonth) handleCellMouseEnter(cell.day);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCellSelected 
                      ? 'var(--win-selection-bg, #000080)' 
                      : '#ffffff',
                    color: isCellSelected 
                      ? 'var(--win-selection-text, #ffffff)' 
                      : isDimmed 
                        ? '#808080' 
                        : '#000000',
                    cursor: 'pointer',
                    fontWeight: isCellToday || isCellSelected ? 'bold' : 'normal',
                    border: isCellToday && !isCellSelected
                      ? '1px solid #c00000' 
                      : '1px solid transparent',
                    position: 'relative',
                    transition: isShifting ? 'transform 0.08s ease-out' : 'background 0.05s',
                    transform: isShifting ? `translate(${shiftOffset.x}px, ${shiftOffset.y}px)` : 'none',
                    zIndex: isShifting ? 10 : 1,
                  }}
                  title={cell.isCurrentMonth ? `${MONTH_NAMES[viewMonth]} ${cell.day}, ${viewYear}` : ''}
                >
                  <span style={{ fontSize: '11px' }}>{cell.day}</span>
                  {/* Subtle appointment marker */}
                  {cell.isCurrentMonth && (cell.day % 4 === 1 || cell.day % 5 === 2) && (
                    <span 
                      style={{ 
                        position: 'absolute', 
                        bottom: '2px', 
                        width: '3px', 
                        height: '3px', 
                        background: isCellSelected ? '#ffffff' : '#000080',
                        display: 'block' 
                      }} 
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Date Details, Appointments & Sarcastic Information */}
        <div 
          style={{
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            minWidth: '180px',
          }}
        >
          {/* Selected Date Information Box */}
          <div 
            className="win95-fieldset"
            style={{
              padding: '6px 8px',
              margin: 0,
              background: 'var(--win-surface, #c0c0c0)',
              fontSize: '11px',
            }}
          >
            <legend style={{ padding: '0 4px', fontWeight: 'bold' }}>Date Info</legend>
            <div style={{ lineHeight: '1.4' }}>
              <div><strong>Selected:</strong> {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}</div>
              <div><strong>Day:</strong> {FULL_WEEKDAY_NAMES[selectedDate.getDay()]}</div>
              <div><strong>Days Remaining:</strong> {daysRemainingInSelectedMonth}</div>
              <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #808080', color: '#000080', fontStyle: 'italic', minHeight: '26px' }}>
                &ldquo;{dateObservation}&rdquo;
              </div>
            </div>
          </div>

          {/* Appointments / Schedule Box with Interactive Details */}
          <div 
            className="sunken-panel"
            style={{
              flex: 1,
              background: '#ffffff',
              padding: '4px',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            <div 
              style={{
                fontWeight: 'bold',
                fontSize: '10px',
                borderBottom: '1px solid #c0c0c0',
                paddingBottom: '2px',
                marginBottom: '4px',
                color: '#555555',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Schedule for {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()].slice(0, 3)}:</span>
              <span style={{ fontSize: '9px', color: '#888' }}>(Click to view)</span>
            </div>

            {appointmentsForSelectedDate.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {appointmentsForSelectedDate.map((app, i) => (
                  <div 
                    key={i}
                    onClick={() => handleAppointmentClick(app)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f4f4f4',
                      padding: '3px 6px',
                      border: '1px solid #d4d0c8',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#e8e8e8'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#f4f4f4'; }}
                    title="Click to view appointment details"
                  >
                    <span style={{ color: '#000080', fontWeight: 'bold', fontSize: '10px' }}>{app.time}</span>
                    <span style={{ fontSize: '11px', textDecoration: 'underline' }}>{app.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                style={{
                  color: '#808080',
                  fontStyle: 'italic',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '10px',
                }}
              >
                No appointments scheduled.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Classic Windows 95 Multi-Segment Status Bar */}
      <div 
        className="calendar-status-bar"
        style={{
          display: 'flex',
          gap: '2px',
          padding: '2px',
          background: 'var(--win-surface, #c0c0c0)',
          borderTop: '1px solid var(--win-border-light, #ffffff)',
          fontSize: '11px',
          height: '24px',
        }}
      >
        {/* Left status segment */}
        <div 
          className="sunken-panel"
          style={{
            flex: 1,
            padding: '2px 6px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {statusMessage}
        </div>

        {/* Middle interaction count / status segment */}
        <div 
          className="sunken-panel"
          style={{
            width: '80px',
            padding: '2px 6px',
            textAlign: 'center',
            fontSize: '10px',
            color: '#444444',
          }}
        >
          {localInteractions > 0 ? `REV_${localInteractions}` : 'READY'}
        </div>

        {/* Right date/time segment */}
        <div 
          className="sunken-panel"
          style={{
            minWidth: '100px',
            padding: '2px 6px',
            textAlign: 'center',
          }}
        >
          {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* In-App Ragebait: "Confirm Date Selection" Modal */}
      {areYouSureModal && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
          }}
          onClick={() => setAreYouSureModal(null)}
        >
          <div 
            className="raised"
            style={{
              width: '320px',
              background: 'var(--win-surface, #c0c0c0)',
              border: '2px outset #ffffff',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              padding: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{
                background: 'var(--win-titlebar-active-start, #000080)',
                color: '#ffffff',
                padding: '2px 4px',
                fontWeight: 'bold',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Confirm Date Selection</span>
              <button 
                className="win95-ctrl-btn"
                onClick={() => setAreYouSureModal(null)}
                style={{
                  background: '#c0c0c0',
                  border: '1px outset #ffffff',
                  fontSize: '9px',
                  width: '14px',
                  height: '14px',
                  lineHeight: '12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '14px 12px', fontSize: '11px' }}>
              <p style={{ marginBottom: '10px' }}>
                Are you sure you want to select <strong>{MONTH_NAMES[areYouSureModal.month]} {areYouSureModal.day}, {areYouSureModal.year}</strong>?
              </p>
              <p style={{ color: '#555555', fontSize: '10px', marginBottom: '14px' }}>
                Proceeding to this date may cause irreversible temporal consequences.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  className="win95-btn default-btn"
                  onClick={() => {
                    const day = areYouSureModal.day;
                    setAreYouSureModal(null);
                    performActualDateSelect(day);
                  }}
                  style={{ minWidth: '65px' }}
                >
                  Yes
                </button>
                <button 
                  className="win95-btn"
                  onClick={() => {
                    const day = areYouSureModal.day;
                    setAreYouSureModal(null);
                    performActualDateSelect(day);
                  }}
                  style={{ minWidth: '85px' }}
                >
                  Absolutely
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Ragebait: Fake Temporal Synchronization Progress Modal */}
      {fakeSyncModal && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 350,
          }}
        >
          <div 
            className="raised"
            style={{
              width: '320px',
              background: 'var(--win-surface, #c0c0c0)',
              border: '2px outset #ffffff',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              padding: '2px',
            }}
          >
            <div 
              style={{
                background: 'var(--win-titlebar-active-start, #000080)',
                color: '#ffffff',
                padding: '2px 4px',
                fontWeight: 'bold',
                fontSize: '11px',
              }}
            >
              <span>Calendar 95 — Temporal Sync</span>
            </div>
            <div style={{ padding: '14px 12px', fontSize: '11px' }}>
              <div style={{ marginBottom: '8px' }}>{fakeSyncModal.text}</div>
              {/* Progress Bar Container */}
              <div 
                className="sunken-panel"
                style={{
                  height: '18px',
                  background: '#ffffff',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div 
                  style={{
                    height: '100%',
                    width: `${fakeSyncModal.progress}%`,
                    background: '#000080',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '10px', color: '#555555' }}>
                {fakeSyncModal.progress}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Ragebait: Fake Calendar Exception Dialog */}
      {fakeErrorModal && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
          }}
          onClick={() => setFakeErrorModal(null)}
        >
          <div 
            className="raised"
            style={{
              width: '360px',
              background: 'var(--win-surface, #c0c0c0)',
              border: '2px outset #ffffff',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.5)',
              padding: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{
                background: 'var(--win-titlebar-active-start, #000080)',
                color: '#ffffff',
                padding: '2px 4px',
                fontWeight: 'bold',
                fontSize: '11px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{fakeErrorModal.title}</span>
              <button 
                className="win95-ctrl-btn"
                onClick={() => setFakeErrorModal(null)}
                style={{
                  background: '#c0c0c0',
                  border: '1px outset #ffffff',
                  fontSize: '9px',
                  width: '14px',
                  height: '14px',
                  lineHeight: '12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '14px 12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px' }}>⚠️</div>
              <div style={{ flex: 1, fontSize: '11px', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                {fakeErrorModal.message}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '0 12px 10px 12px' }}>
              <button 
                className="win95-btn default-btn"
                onClick={() => setFakeErrorModal(null)}
                style={{ minWidth: '65px' }}
              >
                Ignore
              </button>
              <button 
                className="win95-btn"
                onClick={() => setFakeErrorModal(null)}
                style={{ minWidth: '65px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointmentModal && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 250,
          }}
          onClick={() => setSelectedAppointmentModal(null)}
        >
          <div 
            className="raised"
            style={{
              width: '320px',
              background: 'var(--win-surface, #c0c0c0)',
              border: '2px outset #ffffff',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.5)',
              padding: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{
                background: 'var(--win-titlebar-active-start, #000080)',
                color: '#ffffff',
                padding: '2px 4px',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Appointment Details</span>
              <button 
                className="win95-ctrl-btn"
                onClick={() => setSelectedAppointmentModal(null)}
                style={{
                  background: '#c0c0c0',
                  border: '1px outset #ffffff',
                  fontSize: '9px',
                  width: '14px',
                  height: '14px',
                  lineHeight: '12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '12px 14px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ borderBottom: '1px solid #808080', paddingBottom: '6px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#000080' }}>
                  {selectedAppointmentModal.title}
                </div>
                <div style={{ color: '#555555', marginTop: '2px' }}>
                  Time: <strong>{selectedAppointmentModal.time}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Participants:</strong> {selectedAppointmentModal.participants}</div>
                <div><strong>Agenda:</strong> {selectedAppointmentModal.agenda}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button 
                  className="win95-btn default-btn"
                  onClick={() => setSelectedAppointmentModal(null)}
                  style={{ minWidth: '65px' }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setShowAboutModal(false)}
        >
          <div 
            className="raised"
            style={{
              width: '280px',
              background: 'var(--win-surface, #c0c0c0)',
              border: '2px outset #ffffff',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.5)',
              padding: '2px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              style={{
                background: 'var(--win-titlebar-active-start, #000080)',
                color: '#ffffff',
                padding: '2px 4px',
                fontWeight: 'bold',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>About Calendar</span>
              <button 
                className="win95-ctrl-btn"
                onClick={() => setShowAboutModal(false)}
                style={{
                  background: '#c0c0c0',
                  border: '1px outset #ffffff',
                  fontSize: '9px',
                  width: '14px',
                  height: '14px',
                  lineHeight: '12px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '12px', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>RAGEWARE Calendar</p>
              <p style={{ fontSize: '10px', color: '#404040', marginBottom: '8px' }}>Version 4.0 (Build 950)</p>
              <p style={{ fontSize: '10px', color: '#555555', marginBottom: '12px' }}>
                Windows 95 Utility Edition.<br />
                All calendar mathematics are accurate. Your schedule remains questionable.
              </p>
              <button 
                className="win95-btn default-btn"
                onClick={() => setShowAboutModal(false)}
                style={{ minWidth: '60px' }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
