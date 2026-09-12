import React, { useState, useRef, useCallback, useEffect } from 'react';
import OSWindow from './OSWindow';
import DesktopIcon from './DesktopIcon';
import Taskbar from './Taskbar';
import StartMenu from './StartMenu';
import OSDialog from './OSDialog';
import VerificationDialog from './VerificationDialog';
import SessionCompleteModal from './SessionCompleteModal';
import SystemNotification from './SystemNotification';
import DesktopWallpaper from './DesktopWallpaper';
import BSODModal from './BSODModal';
import ErrorCascadeModal from './ErrorCascadeModal';
import GhostCursor from './GhostCursor';
import VirusPopupCascade from './VirusPopupCascade';
import { soundEngine } from '../../engine/soundEngine';

// Native Applications
import FileManager from './FileManager';
import Terminal from './Terminal';
import SystemMonitor from './SystemMonitor';
import SystemUpdateApp from './SystemUpdateApp';
import Settings from './Settings';
import CameraApp from './CameraApp';
import CaughtIn4KApp from './CaughtIn4KApp';
import AboutApp from './AboutApp';
import GestureDriveApp from './GestureDriveApp';
import NaaSApp from './NaaSApp';
import ShutdownDialog from './ShutdownDialog';

// Icons
import { 
  IconFolder, 
  IconTerminal, 
  IconActivity, 
  IconCpu, 
  IconSettings, 
  IconCamera, 
  IconCaughtIn4K,
  IconInfo, 
  IconStartLogo,
  IconGestureDrive,
  IconNaaS
} from './OSIcons';

import { getRageProfile, resetSession } from '../../engine/rageEngine';
import { rageBaitEngineInstance, RAGEBAIT_EVENT_TYPES, selectMinorEvent } from '../../engine/rageBaitEngine';
import { osPersonalityInstance } from '../../engine/osPersonality';
import OSPersonalityMessage from '../OSPersonalityMessage';

// App Registry with authentic Win95 window titles & dimensions
const APP_CONFIGS = {
  'file-manager': {
    title: 'Exploring - C:\\My Documents',
    icon: IconFolder,
    width: 680,
    height: 460,
    component: FileManager,
  },
  'terminal': {
    title: 'MS-DOS Prompt',
    icon: IconTerminal,
    width: 680,
    height: 420,
    component: Terminal,
  },
  'system-update': {
    title: 'RAGEWARE Setup',
    icon: IconCpu,
    width: 580,
    height: 440,
    component: SystemUpdateApp,
  },
  'system-monitor': {
    title: 'System Monitor',
    icon: IconActivity,
    width: 560,
    height: 440,
    component: SystemMonitor,
  },
  'settings': {
    title: 'Control Panel',
    icon: IconSettings,
    width: 540,
    height: 440,
    component: Settings,
  },
  'camera': {
    title: 'Optical Sensor',
    icon: IconCamera,
    width: 560,
    height: 480,
    component: CameraApp,
  },
  'caught-in-4k': {
    title: 'Caught In 4K — Internet Explorer',
    icon: IconCaughtIn4K,
    width: 800,
    height: 580,
    component: CaughtIn4KApp,
  },
  'about': {
    title: 'About RAGEWARE',
    icon: IconInfo,
    width: 480,
    height: 340,
    component: AboutApp,
  },
  'gesture-drive': {
    title: 'Gesture Drive',
    icon: IconGestureDrive,
    width: 480,
    height: 320,
    component: GestureDriveApp,
  },
  'naas': {
    title: 'Nothing as a Service™ — Internet Explorer',
    icon: IconNaaS,
    width: 780,
    height: 560,
    component: NaaSApp,
  },
};

const DESKTOP_ICONS = [
  { id: 'file-manager', name: 'My Documents', icon: IconFolder, badge: true },
  { id: 'naas', name: 'Nothing as a Service™', icon: IconNaaS },
  { id: 'camera', name: 'Optical Sensor', icon: IconCamera },
  { id: 'caught-in-4k', name: 'Caught In 4K', icon: IconCaughtIn4K, badge: true },
  { id: 'gesture-drive', name: 'Gesture Drive', icon: IconGestureDrive },
  { id: 'terminal', name: 'MS-DOS Prompt', icon: IconTerminal },
  { id: 'system-update', name: 'System Update', icon: IconCpu, badge: true },
  { id: 'system-monitor', name: 'System Monitor', icon: IconActivity },
  { id: 'settings', name: 'Control Panel', icon: IconSettings },
  { id: 'about', name: 'About RAGEWARE', icon: IconInfo },
];

export default function Desktop({ onReturnLanding, onReboot, onShutdown, bootMode = 'normal' }) {
  const [profile, setProfile] = useState(() => getRageProfile());
  const [selectedIconId, setSelectedIconId] = useState(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isShutdownDialogOpen, setIsShutdownDialogOpen] = useState(false);
  const [dialogState, setDialogState] = useState({ isOpen: false, title: '', message: '', type: 'warning' });
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isConclusionOpen, setIsConclusionOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isDesktopRefreshing, setIsDesktopRefreshing] = useState(false);
  const [isCursorBusy, setIsCursorBusy] = useState(false);
  const [isBSODOpen, setIsBSODOpen] = useState(false);
  const [isCascadeOpen, setIsCascadeOpen] = useState(false);
  const [isVirusCascadeOpen, setIsVirusCascadeOpen] = useState(false);
  const [isGhostCursorActive, setIsGhostCursorActive] = useState(false);

  // Step 6: OS Personality Message Modal
  const [personalityDialog, setPersonalityDialog] = useState(null);

  // Chaos On/Off System: Honors bootMode selection from Boot Menu
  const [isChaosMode, setIsChaosMode] = useState(() => bootMode !== 'safe');
  const isChaosRef = useRef(bootMode !== 'safe');

  // Icon jitter on hover at higher rage
  const [iconJitters, setIconJitters] = useState({});
  // Track pending jitter timeouts so they can be cancelled on safe mode
  const jitterTimeoutsRef = useRef([]);

  const zIndexCounter = useRef(100);
  // Count of major ragebait events fired — used for periodic weakness reveal
  const majorEventCountRef = useRef(0);
  // Micro-event scheduler timer ref
  const microTimerRef = useRef(null);
  // Separate recent-ids list for the micro-event scheduler
  const microRecentIdsRef = useRef([]);

  // Default pre-opened windows: File Manager and System Update (or Terminal if DOS mode)
  const [windows, setWindows] = useState(() => {
    const fm = APP_CONFIGS['file-manager'];
    const su = APP_CONFIGS['system-update'];
    const term = APP_CONFIGS['terminal'];

    if (bootMode === 'dos') {
      return [
        {
          id: 'win-terminal',
          appId: 'terminal',
          title: term.title,
          icon: term.icon,
          x: 70,
          y: 25,
          width: 640,
          height: 420,
          zIndex: 105,
          isMinimized: false,
        },
      ];
    }

    return [
      {
        id: 'win-file-manager',
        appId: 'file-manager',
        title: fm.title,
        icon: fm.icon,
        x: 104,
        y: 24,
        width: 560,
        height: 380,
        zIndex: 101,
        isMinimized: false,
      },
      {
        id: 'win-system-update',
        appId: 'system-update',
        title: su.title,
        icon: su.icon,
        x: Math.max(120, window.innerWidth - 560 - 40),
        y: 44,
        width: 540,
        height: 400,
        zIndex: 102,
        isMinimized: false,
      },
      {
        id: 'win-camera',
        appId: 'camera',
        title: APP_CONFIGS['camera'].title,
        icon: APP_CONFIGS['camera'].icon,
        x: 180,
        y: 60,
        width: 560,
        height: 480,
        zIndex: 100,
        isMinimized: true, // Auto-boot in background as minimized!
      },
    ];
  });

  const [activeWindowId, setActiveWindowId] = useState('win-system-update');
  const activeWindowIdRef = useRef(activeWindowId);
  useEffect(() => {
    activeWindowIdRef.current = activeWindowId;
  }, [activeWindowId]);

  const syncProfile = useCallback(() => {
    const updated = getRageProfile();
    setProfile(updated);

    // Final session conclusion threshold: rageScore >= 81 AND meaningfulInteractions >= 10
    if (updated.isSessionComplete) {
      setTimeout(() => {
        setIsConclusionOpen(true);
      }, 700);
    }
  }, []);

  // Toggle Chaos Mode (Option 2)
  const toggleChaosMode = useCallback((forcedState = null) => {
    setIsChaosMode((prev) => {
      const next = forcedState !== null ? forcedState : !prev;
      isChaosRef.current = next; // keep ref in sync for async callbacks
      rageBaitEngineInstance.setChaosMode(next);
      osPersonalityInstance.setChaosMode(next);
      if (next) {
        // Unleash the crazy chaos!
        soundEngine.playExclamation();
        rageBaitEngineInstance.start(true);
        setCurrentNotification({
          title: '🔥 RAGE CHAOS: ACTIVATED',
          message: 'Continuous dynamic loop restored! The OS is hostile again.',
        });
        // Immediately fire the iconic virus cascade popup so the user sees the popup cascade right away!
        setTimeout(() => {
          if (!isChaosRef.current) return;
          rageBaitEngineInstance.triggerManual(RAGEBAIT_EVENT_TYPES.VIRUS_CASCADE);
        }, 1200);
      } else {
        // Safe Shield: Kill ALL pending jitter timeouts immediately
        jitterTimeoutsRef.current.forEach(clearTimeout);
        jitterTimeoutsRef.current = [];
        // Cancel micro-event scheduler
        if (microTimerRef.current) {
          clearTimeout(microTimerRef.current);
          microTimerRef.current = null;
        }
        // Instant peace for opening and testing custom meme projects
        soundEngine.playDing();
        rageBaitEngineInstance.stop();
        setIsVirusCascadeOpen(false);
        setIsCascadeOpen(false);
        setIsBSODOpen(false);
        setIsVerificationOpen(false);
        setPersonalityDialog(null);
        setDialogState({ isOpen: false, title: '', message: '', type: 'warning' });
        setIsGhostCursorActive(false);
        setIsCursorBusy(false);
        setIsDesktopRefreshing(false);
        setIconJitters({});  // clear all icon jitters immediately
        setCurrentNotification({
          title: '🛡️ SAFE SHIELD: ENGAGED',
          message: 'Safe Mode active! All popups, evasion, and traps are stopped.',
        });
      }
      return next;
    });
  }, []);

  // Keyboard shortcut F8 to toggle Chaos Mode at any time
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F8') {
        e.preventDefault();
        toggleChaosMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleChaosMode]);

  // Play authentic Windows 95 startup chime ONCE when booted into the desktop
  useEffect(() => {
    soundEngine.playStartup();
  }, []);

  // Continuous Dynamic Ragebait Loop Lifecycle (Option 2: starts active, toggleable)
  useEffect(() => {
    // Start continuous dynamic loop for the full chaotic experience!
    rageBaitEngineInstance.setChaosMode(true);
    rageBaitEngineInstance.start(true);

    // In Chaos Mode, trigger the iconic Virus Cascade popup early (after 2.8s) so the user gets the classic chaos!
    const bootVirusTimer = setTimeout(() => {
      if (!isChaosRef.current) return;
      rageBaitEngineInstance.triggerManual(RAGEBAIT_EVENT_TYPES.VIRUS_CASCADE);
    }, 2800);

    const unsubscribe = rageBaitEngineInstance.subscribe((event) => {
      if (!event) return;
      // Use ref for real-time check — avoids stale closure bug
      if (!isChaosRef.current) return; // 100% blocked in Safe Mode!

      if (
        event.type === RAGEBAIT_EVENT_TYPES.NOTIFICATION ||
        event.type === RAGEBAIT_EVENT_TYPES.FAKE_NOTIFICATION ||
        event.type === RAGEBAIT_EVENT_TYPES.TASKBAR_NOTIFICATION
      ) {
        setCurrentNotification({
          title: event.title || 'RAGEWARE SYSTEM',
          message: event.message || 'System operation benchmark recorded.',
        });
        soundEngine.playDing();
      } else if (
        event.type === RAGEBAIT_EVENT_TYPES.ERROR_DIALOG ||
        event.type === RAGEBAIT_EVENT_TYPES.FAKE_ERROR ||
        event.type === RAGEBAIT_EVENT_TYPES.FAKE_APPLICATION_ERROR ||
        event.type === RAGEBAIT_EVENT_TYPES.FAKE_SECURITY_WARNING ||
        event.type === RAGEBAIT_EVENT_TYPES.RANDOM_SYSTEM_DIALOG ||
        event.type === RAGEBAIT_EVENT_TYPES.CLOSE_CONFIRMATION_TRAP ||
        event.type === RAGEBAIT_EVENT_TYPES.FILE_PERMISSION_DENIED ||
        event.type === RAGEBAIT_EVENT_TYPES.TERMINAL_EXIT_TRAP
      ) {
        const severity = (event.typeSeverity || event.type || 'warning').toLowerCase();
        setDialogState({
          isOpen: true,
          title: event.title || 'RAGEWARE SYSTEM ALERT',
          message: event.message || 'An unexpected operational discrepancy occurred.',
          type: event.typeSeverity || event.type || 'warning',
        });
        if (severity.includes('error') || severity.includes('stop')) {
          soundEngine.playCriticalStop();
        } else if (severity.includes('warn') || severity.includes('trap')) {
          soundEngine.playChord();
        } else {
          soundEngine.playExclamation();
        }
        syncProfile();
        // Step 7: Personality-event synchronization — react after major dialog events
        // Small delay so personality notification arrives AFTER the dialog, not simultaneously
        setTimeout(() => {
          if (!isChaosRef.current) return;
          const syncReaction = osPersonalityInstance.getEventSyncReaction('windowManipulation');
          if (syncReaction) osPersonalityInstance.dispatch(syncReaction);
        }, 2800);
      } else if (event.type === RAGEBAIT_EVENT_TYPES.FILE_HOVER_ESCAPE) {
        // Step 7: handle FILE_HOVER_ESCAPE dispatched by the scheduler (audit bug #5 fix)
        setCurrentNotification({
          title: 'FILESYSTEM BEHAVIOR',
          message: 'File access trajectory logged. Evasion protocol active.',
        });
        soundEngine.playBoing();
      } else if (event.type === RAGEBAIT_EVENT_TYPES.FAKE_SYSTEM_UPDATE) {
        // Open system-update app WITHOUT a click sound (programmatic, not user-triggered)
        openAppSilently('system-update');
        soundEngine.playChord();
        syncProfile();
        // Step 7: Personality sync — fake update is a fakeLoading major event
        setTimeout(() => {
          if (!isChaosRef.current) return;
          const syncReaction = osPersonalityInstance.getEventSyncReaction('fakeLoading');
          if (syncReaction) osPersonalityInstance.dispatch(syncReaction);
        }, 3500);
        // Every 4th major event, try a weakness reveal
        majorEventCountRef.current += 1;
        if (majorEventCountRef.current % 4 === 0) {
          setTimeout(() => {
            if (!isChaosRef.current) return;
            const reveal = osPersonalityInstance.getWeaknessReveal();
            if (reveal) osPersonalityInstance.dispatch(reveal);
          }, 5500);
        }
      } else if (event.type === RAGEBAIT_EVENT_TYPES.DESKTOP_REFRESH) {
        setIsDesktopRefreshing(true);
        setTimeout(() => {
          if (!isChaosRef.current) return;
          setIsDesktopRefreshing(false);
          setCurrentNotification({
            title: 'RAGEWARE COMPOSITOR',
            message: 'Desktop refresh cycle complete. Cache stabilized.',
          });
          soundEngine.playDing();
        }, 220);
      } else if (
        event.type === RAGEBAIT_EVENT_TYPES.DESKTOP_ICON_SHIFT ||
        event.type === RAGEBAIT_EVENT_TYPES.ICON_SHIFT
      ) {
        const newJitters = {};
        DESKTOP_ICONS.forEach((ico) => {
          newJitters[ico.id] = {
            x: (Math.random() - 0.5) * (event.delta || 22),
            y: (Math.random() - 0.5) * (event.delta || 22),
          };
        });
        setIconJitters(newJitters);
        // Track this timeout so safe mode can cancel it
        const jt = setTimeout(() => {
          if (!isChaosRef.current) return;
          setIconJitters({});
        }, 850);
        jitterTimeoutsRef.current.push(jt);
      } else if (event.type === RAGEBAIT_EVENT_TYPES.BUTTON_SWAP) {
        setCurrentNotification({
          title: 'INTERFACE DRIVER',
          message: 'Control polarities temporarily inverted for recalibration.',
        });
        soundEngine.playDing();
      } else if (event.type === RAGEBAIT_EVENT_TYPES.VERIFICATION_ESCAPE) {
        setIsVerificationOpen(true);
        soundEngine.playExclamation();
        // Step 7: Personality sync — verification is a movingButtons major event
        majorEventCountRef.current += 1;
        setTimeout(() => {
          if (!isChaosRef.current) return;
          const syncReaction = osPersonalityInstance.getEventSyncReaction('movingButtons');
          if (syncReaction) osPersonalityInstance.dispatch(syncReaction);
        }, 2200);
        if (majorEventCountRef.current % 4 === 0) {
          setTimeout(() => {
            if (!isChaosRef.current) return;
            const reveal = osPersonalityInstance.getWeaknessReveal();
            if (reveal) osPersonalityInstance.dispatch(reveal);
          }, 5000);
        }
      } else if (
        event.type === RAGEBAIT_EVENT_TYPES.BSOD_FLASH
      ) {
        setIsBSODOpen(true);
        soundEngine.playCriticalStop();
        syncProfile();
        // Step 7: Personality sync — BSOD is a major fakeLoading event
        setTimeout(() => {
          if (!isChaosRef.current) return;
          const syncReaction = osPersonalityInstance.getEventSyncReaction('fakeLoading');
          if (syncReaction) osPersonalityInstance.dispatch(syncReaction);
        }, 3200);
      } else if (event.type === RAGEBAIT_EVENT_TYPES.ERROR_CASCADE) {
        setIsCascadeOpen(true);
        soundEngine.playChord();
        syncProfile();
        setTimeout(() => {
          if (!isChaosRef.current) return;
          const syncReaction = osPersonalityInstance.getEventSyncReaction('windowManipulation');
          if (syncReaction) osPersonalityInstance.dispatch(syncReaction);
        }, 3000);
      } else if (event.type === RAGEBAIT_EVENT_TYPES.VIRUS_CASCADE) {
        setIsVirusCascadeOpen(true);
        soundEngine.playVirusStorm();
        syncProfile();
        setTimeout(() => {
          if (!isChaosRef.current) return;
          const syncReaction = osPersonalityInstance.getEventSyncReaction('windowManipulation');
          if (syncReaction) osPersonalityInstance.dispatch(syncReaction);
        }, 4000);
      } else if (event.type === RAGEBAIT_EVENT_TYPES.GHOST_CURSOR) {
        setIsGhostCursorActive(true);
      } else if (
        event.type === RAGEBAIT_EVENT_TYPES.CURSOR_BUSY ||
        event.type === RAGEBAIT_EVENT_TYPES.FAKE_LOADING
      ) {
        setIsCursorBusy(true);
        setTimeout(() => {
          if (!isChaosRef.current) return;
          setIsCursorBusy(false);
        }, event.duration || 1400);
      } else if (
        event.type === RAGEBAIT_EVENT_TYPES.WINDOW_NUDGE ||
        event.type === RAGEBAIT_EVENT_TYPES.WINDOW_CONTROL_ESCAPE
      ) {
        setWindows((prev) =>
          prev.map((w) => {
            if (w.id === activeWindowIdRef.current && !w.isMinimized) {
              const nx = Math.max(20, Math.min(window.innerWidth - w.width - 20, w.x + (event.deltaX || 25)));
              const ny = Math.max(20, Math.min(window.innerHeight - w.height - 40, w.y + (event.deltaY || 20)));
              return { ...w, x: nx, y: ny };
            }
            return w;
          })
        );
      }
    });

    return () => {
      clearTimeout(bootVirusTimer);
      unsubscribe();
      rageBaitEngineInstance.stop();
    };
  }, [syncProfile]);

  // Step 6: OS Personality Message Subscription
  // Sounds ONLY play when a visible UI element is actually shown
  useEffect(() => {
    const unsub = osPersonalityInstance.subscribe((reaction) => {
      if (!reaction) return;
      // CRITICAL: never show personality messages or sounds in safe mode
      if (!isChaosRef.current) return;
      if (reaction.type === 'dialogMessage' || reaction.severity === 'high') {
        // High-severity: show dialog window + play chord
        setPersonalityDialog(reaction);
        soundEngine.playChord(); // chord plays because a dialog window IS appearing
      } else {
        // Low-severity: show notification toast + play ding
        const notifText = reaction.text || reaction.message;
        if (notifText) {
          setCurrentNotification({
            title: reaction.title || 'RAGEWARE OBSERVATION',
            message: notifText,
          });
          soundEngine.playDing(); // ding plays because a notification toast IS appearing
        }
        // If there's no visible text content, play NO sound
      }
    });

    return () => unsub();
  }, []);

  // Step 6: Periodic Contextual Weakness Reveal Loop (Step 7: replaced getWeaknessObservation with getWeaknessReveal)
  useEffect(() => {
    if (!isChaosMode) return;
    const interval = setInterval(() => {
      if (!isChaosRef.current) return;
      // Every ~15-30s, try to send a weakness reveal notification
      const reveal = osPersonalityInstance.getWeaknessReveal();
      if (reveal) {
        osPersonalityInstance.dispatch(reveal);
      }
    }, 18000 + Math.random() * 12000);

    return () => clearInterval(interval);
  }, [isChaosMode]);

  // Step 7: Micro-event scheduler — fires minor/ambient events more frequently than major events
  // This keeps the OS feeling alive without stacking disruptive popups
  useEffect(() => {
    if (!isChaosMode) {
      if (microTimerRef.current) clearTimeout(microTimerRef.current);
      microTimerRef.current = null;
      return;
    }

    const scheduleMicro = () => {
      if (!isChaosRef.current) return;
      const profile = getRageProfile();

      // Micro-event fires every 8-20s depending on rage (not in chaos mode fast loop,
      // just a secondary softer layer)
      let minMs = 12000;
      let maxMs = 22000;
      if (profile.rageScore > 60) { minMs = 6000; maxMs = 12000; }
      else if (profile.rageScore > 40) { minMs = 8000; maxMs = 16000; }
      else if (profile.rageScore > 20) { minMs = 10000; maxMs = 18000; }

      const delay = Math.round(minMs + Math.random() * (maxMs - minMs));

      microTimerRef.current = setTimeout(() => {
        if (!isChaosRef.current) return;
        try {
          const eventDef = selectMinorEvent(microRecentIdsRef.current);
          const payload = eventDef.execute(getRageProfile());
          // Track for variety
          microRecentIdsRef.current.push(eventDef.id);
          if (microRecentIdsRef.current.length > 4) microRecentIdsRef.current.shift();
          // Dispatch through main engine (handles all cases incl. safe mode check)
          rageBaitEngineInstance.dispatch(payload);
        } catch (_) {
          // Swallow errors in micro scheduler
        }
        scheduleMicro(); // schedule next micro-event
      }, delay);
    };

    // Start micro-scheduler with a longer initial delay so it doesn't clash with startup
    microTimerRef.current = setTimeout(scheduleMicro, 8000);

    return () => {
      if (microTimerRef.current) clearTimeout(microTimerRef.current);
      microTimerRef.current = null;
    };
  }, [isChaosMode]);

  // Desktop Icon Hover: Evasive when Chaos Mode is ON; 100% stable when Safe Shield is ON!
  const handleIconHover = (iconId) => {
    // Gesture Drive behaves like a legitimate utility and is never sabotaged
    if (iconId === 'gesture-drive') return;

    // Always use ref here — state may lag behind ref in rapid toggles
    if (isChaosRef.current && (profile.rageScore > 40 || Math.random() < 0.4)) {
      soundEngine.playBoing();
      const offsetX = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 14);
      const offsetY = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 10);
      setIconJitters((prev) => ({ ...prev, [iconId]: { x: offsetX, y: offsetY } }));
      const jt = setTimeout(() => {
        if (!isChaosRef.current) return; // don't restore if safe mode kicked in
        setIconJitters((prev) => ({ ...prev, [iconId]: { x: 0, y: 0 } }));
      }, 500);
      jitterTimeoutsRef.current.push(jt);
    }
  };

  // Desktop Icon Click: record in behavior tracker for rapid-click detection
  const handleIconClick = (iconId) => {
    setSelectedIconId(iconId);
    // Wire the behavior tracker's click recording — fixes critical audit bug #1
    if (isChaosRef.current && rageBaitEngineInstance.tracker) {
      rageBaitEngineInstance.tracker.recordClick(false);
    }
  };

  const focusWindow = (winId) => {
    // No click sound here — focusWindow is called programmatically too (taskbar, openApp)
    // Callers that are user-triggered will play their own sound
    zIndexCounter.current += 1;
    setActiveWindowId(winId);
    setWindows((prev) =>
      prev.map((w) =>
        w.id === winId
          ? { ...w, zIndex: zIndexCounter.current, isMinimized: false }
          : w
      )
    );
  };

  const closeWindow = (winId) => {
    // Simple, short classic window close sound
    soundEngine.playWindowClose();

    if (isChaosMode && rageBaitEngineInstance.tracker) {
      rageBaitEngineInstance.tracker.recordWindowCloseAttempt();
    }
    setWindows((prev) => {
      const filtered = prev.filter((w) => w.id !== winId);
      if (activeWindowIdRef.current === winId) {
        const remaining = filtered.filter((w) => !w.isMinimized);
        setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
      return filtered;
    });
  };

  const minimizeWindow = (winId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === winId) {
      const remaining = windows.filter((w) => w.id !== winId && !w.isMinimized);
      setActiveWindowId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  };

  // Silent (programmatic) open — used by ragebait engine so it doesn't play click on its own
  const openAppSilently = useCallback((appId) => {
    const config = APP_CONFIGS[appId];
    if (!config) return;

    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      // Just bring to front silently
      zIndexCounter.current += 1;
      setActiveWindowId(existing.id);
      setWindows((prev) =>
        prev.map((w) =>
          w.id === existing.id
            ? { ...w, zIndex: zIndexCounter.current, isMinimized: false }
            : w
        )
      );
      return;
    }

    zIndexCounter.current += 1;
    const offset = (windows.length * 28) % 160;
    const posX = Math.max(40, Math.min(window.innerWidth - config.width - 40, 70 + offset));
    const posY = Math.max(30, Math.min(window.innerHeight - config.height - 70, 40 + offset));

    const newWin = {
      id: `win-${appId}-${Date.now()}`,
      appId,
      title: config.title,
      icon: config.icon,
      x: posX,
      y: posY,
      width: config.width,
      height: config.height,
      zIndex: zIndexCounter.current,
      isMinimized: false,
    };

    setWindows((prev) => [...prev, newWin]);
    setActiveWindowId(newWin.id);
    // NO sound — this is programmatic, not user-triggered
  }, [windows]);

  const openApp = (appId) => {
    const config = APP_CONFIGS[appId];
    if (!config) return;

    // Clear any full-screen blocking modals so newly opened apps appear immediately in the foreground!
    setIsVirusCascadeOpen(false);
    setIsCascadeOpen(false);
    setIsBSODOpen(false);
    setIsVerificationOpen(false);

    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      focusWindow(existing.id);
      return;
    }

    zIndexCounter.current += 1;
    const offset = (windows.length * 28) % 160;
    const posX = Math.max(40, Math.min(window.innerWidth - config.width - 40, 70 + offset));
    const posY = Math.max(30, Math.min(window.innerHeight - config.height - 70, 40 + offset));

    const newWin = {
      id: `win-${appId}-${Date.now()}`,
      appId,
      title: config.title,
      icon: config.icon,
      x: posX,
      y: posY,
      width: config.width,
      height: config.height,
      zIndex: zIndexCounter.current,
      isMinimized: false,
    };

    setWindows((prev) => [...prev, newWin]);
    setActiveWindowId(newWin.id);
    // Simple, short classic window open sound
    soundEngine.playWindowOpen();
  };

  const handleTaskbarItemClick = (winId) => {
    const win = windows.find((w) => w.id === winId);
    if (!win) return;

    if (win.isMinimized) {
      // Restoring a minimized window — play click
      soundEngine.playClick();
      focusWindow(winId);
    } else if (activeWindowId === winId) {
      // Minimizing active window — silent
      minimizeWindow(winId);
    } else {
      // Switching focus — silent (no extra click noise)
      focusWindow(winId);
    }
  };

  const handleDesktopClick = () => {
    // Silent — clicking empty desktop should not produce sound
    setSelectedIconId(null);
    setIsStartMenuOpen(false);
  };

  const handleSystemAction = (action) => {
    if (action === 'restart') {
      if (onShutdown) {
        onShutdown('restart');
      } else if (onReboot) {
        onReboot();
      }
    } else if (action === 'shutdown') {
      setIsShutdownDialogOpen(true);
    } else if (action === 'verify') {
      setIsVerificationOpen(true);
    } else if (action === 'landing') {
      if (onReturnLanding) onReturnLanding();
    }
  };

  const handleShutdownConfirm = (selectedAction) => {
    setIsShutdownDialogOpen(false);
    if (onShutdown) {
      onShutdown(selectedAction);
    } else if (selectedAction === 'restart') {
      if (onReboot) onReboot();
    } else if (onReturnLanding) {
      onReturnLanding();
    }
  };

  const handleRunAgain = () => {
    resetSession();
    setIsConclusionOpen(false);
    syncProfile();
  };

  return (
    <div 
      className={`os-desktop-root ${isCursorBusy ? 'cursor-busy' : ''}`} 
      id="os-desktop-root" 
      onClick={handleDesktopClick}
      onMouseDown={() => {
        if (rageBaitEngineInstance.tracker) {
          rageBaitEngineInstance.tracker.recordClick(false);
        }
      }}
    >
      {/* High-Contrast Windows 95 Homage Desktop Wallpaper */}
      <DesktopWallpaper />

      {/* Desktop Application Icons Grid */}
      <div className={`desktop-icons-area ${isDesktopRefreshing ? 'refreshing' : ''}`}>
        {DESKTOP_ICONS.map((iconDef) => {
          const jitter = iconJitters[iconDef.id] || { x: 0, y: 0 };
          return (
            <div 
              key={iconDef.id}
              style={{
                transform: `translate(${jitter.x}px, ${jitter.y}px)`,
                transition: 'transform 0.12s ease-out',
              }}
              onMouseEnter={() => handleIconHover(iconDef.id)}
            >
              <DesktopIcon
                id={iconDef.id}
                name={iconDef.name}
                icon={iconDef.icon}
                badge={iconDef.badge}
                isSelected={selectedIconId === iconDef.id}
                onSelect={(id) => {
                  setSelectedIconId(id);
                  if (rageBaitEngineInstance.tracker) rageBaitEngineInstance.tracker.recordClick(false);
                }}
                onOpen={(id) => {
                  openApp(id);
                  if (rageBaitEngineInstance.tracker) rageBaitEngineInstance.tracker.recordClick(false);
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Window Manager Layer */}
      <div className="desktop-windows-layer">
        {windows.map((win) => {
          const config = APP_CONFIGS[win.appId];
          if (!config) return null;
          const AppComponent = config.component;

          return (
            <OSWindow
              key={win.id}
              id={win.id}
              title={win.title}
              icon={win.icon}
              initialX={win.x}
              initialY={win.y}
              initialWidth={win.width}
              initialHeight={win.height}
              zIndex={win.zIndex}
              isActive={win.id === activeWindowId}
              isMinimized={win.isMinimized}
              rageLevel={profile.rageScore}
              isChaosMode={isChaosMode}
              onFocus={focusWindow}
              onClose={closeWindow}
              onMinimize={minimizeWindow}
              onRageUpdate={syncProfile}
            >
              <AppComponent 
                onRageUpdate={syncProfile}
                openWindowsCount={windows.length}
                autoStart={true}
                isChaosMode={isChaosMode}
                onClose={() => closeWindow(win.id)}
                profile={profile}
              />
            </OSWindow>
          );
        })}
      </div>

      {/* Start Menu Popup */}
      <StartMenu
        isOpen={isStartMenuOpen}
        onLaunchApp={openApp}
        onSystemAction={handleSystemAction}
        onClose={() => setIsStartMenuOpen(false)}
      />

      {/* Bottom Taskbar */}
      <Taskbar
        windows={windows}
        activeWindowId={activeWindowId}
        isStartMenuOpen={isStartMenuOpen}
        onToggleStartMenu={(e) => {
          e.stopPropagation();
          setIsStartMenuOpen(!isStartMenuOpen);
        }}
        onTaskbarItemClick={handleTaskbarItemClick}
        rageLevel={profile.rageScore}
        isChaosMode={isChaosMode}
        isCameraActive={Boolean(profile.isCameraActive)}
        onToggleChaos={() => toggleChaosMode()}
      />

      {/* Spontaneous System Verification Modal (Escaping Button) */}
      <VerificationDialog
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onRageUpdate={syncProfile}
      />

      {/* System Tray Notification Toast Balloon */}
      <SystemNotification
        notification={currentNotification}
        onClose={() => setCurrentNotification(null)}
      />

      {/* Final Session Conclusion Screen */}
      <SessionCompleteModal
        isOpen={isConclusionOpen}
        profile={profile}
        onReturnToDesktop={() => setIsConclusionOpen(false)}
        onRunAgain={handleRunAgain}
      />

      {/* Authentic Windows 95 Shut Down Confirmation Dialog */}
      <ShutdownDialog
        isOpen={isShutdownDialogOpen}
        onConfirm={handleShutdownConfirm}
        onCancel={() => setIsShutdownDialogOpen(false)}
      />

      {/* Generic / Fake System Dialogs */}
      <OSDialog
        isOpen={dialogState.isOpen}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmLabel="OK"
        onConfirm={() => setDialogState({ isOpen: false, title: '', message: '' })}
      />

      {/* Blue Screen of Death Glitch Flash */}
      <BSODModal
        isOpen={isBSODOpen}
        onClose={() => setIsBSODOpen(false)}
        onRageUpdate={syncProfile}
      />

      {/* Cascading Overlapping Error Windows */}
      <ErrorCascadeModal
        isOpen={isCascadeOpen}
        onClose={() => setIsCascadeOpen(false)}
        onRageUpdate={syncProfile}
      />

      {/* Meme Virus Multiplied Popup Cascade (Error 404: Please contact God) */}
      <VirusPopupCascade
        isOpen={isVirusCascadeOpen}
        onClose={() => setIsVirusCascadeOpen(false)}
        onRageUpdate={syncProfile}
      />

      {/* Rogue Wandering Ghost Cursor */}
      <GhostCursor
        isActive={isGhostCursorActive}
        onComplete={() => setIsGhostCursorActive(false)}
      />

      {/* Step 6: Authentic Retro OS Personality Message Window */}
      <OSPersonalityMessage
        message={personalityDialog}
        onClose={() => setPersonalityDialog(null)}
      />

      {/* Safe Mode Watermark Tags in 4 corners if Safe Mode is active */}
      {!isChaosMode && (
        <div className="safe-mode-watermarks" aria-hidden="true">
          <div className="safe-mode-corner top-left">Safe Mode</div>
          <div className="safe-mode-corner top-right">Safe Mode</div>
          <div className="safe-mode-corner bottom-left">Safe Mode</div>
          <div className="safe-mode-corner bottom-right">Safe Mode</div>
        </div>
      )}
    </div>
  );
}
