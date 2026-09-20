/**
 * RAGEWARE — Step 5: Adaptive Ragebait Engine
 * 
 * Single source of truth for adaptive scheduling:
 * - Reads session scores and category breakdown from rageEngine.js.
 * - Dynamic event registry with full metadata (id, category, minimumRage, baseWeight, cooldown, duration, severity).
 * - Weighted selection:
 *     baseWeight + user category score + rage level modifier + recent failure modifier - recently used penalty
 * - 60% primary weakness bias / 40% variety preserving unpredictability.
 * - Calibrated cooldown ranges for all 5 rage tiers:
 *     CALM (0-20): 25-40s | ANNOYED (21-40): 15-25s | FRUSTRATED (41-60): 10-18s
 *     ANGRY (61-80): 6-12s | ABSOLUTE RAGE (81-100): 4-8s
 * - Reactive user behavior triggers: rapid clicks, failed clicks, window close attempts, file spam, terminal exit traps.
 * - Complete memory cleanup and non-repeating variety guarantee.
 */

import { 
  getRageProfile, 
  getBestRagebait, 
  increaseRage, 
  RAGE_EVENTS 
} from './rageEngine';
import { osPersonalityInstance } from './osPersonality';

export const RAGEBAIT_EVENT_TYPES = {
  // Step 5 minimum required events:
  VERIFICATION_ESCAPE: 'verificationEscape',
  FAKE_SYSTEM_UPDATE: 'fakeSystemUpdate',
  WINDOW_CONTROL_ESCAPE: 'windowControlEscape',
  CLOSE_CONFIRMATION_TRAP: 'closeConfirmationTrap',
  FILE_HOVER_ESCAPE: 'fileHoverEscape',
  FILE_PERMISSION_DENIED: 'filePermissionDenied',
  TERMINAL_EXIT_TRAP: 'terminalExitTrap',
  FAKE_NOTIFICATION: 'fakeNotification',
  FAKE_ERROR: 'fakeError',
  BUTTON_SWAP: 'buttonSwap',
  FAKE_LOADING: 'fakeLoading',
  FAKE_SYSTEM_SCAN: 'fakeSystemScan',
  FAKE_SECURITY_WARNING: 'fakeSecurityWarning',
  DESKTOP_ICON_SHIFT: 'desktopIconShift',
  DESKTOP_REFRESH: 'desktopRefresh',
  RANDOM_SYSTEM_DIALOG: 'randomSystemDialog',
  FAKE_APPLICATION_ERROR: 'fakeApplicationError',
  TASKBAR_NOTIFICATION: 'taskbarNotification',
  ERROR_DIALOG: 'errorDialog',

  // Existing visual / retro virus events:
  BSOD_FLASH: 'bsodFlash',
  VIRUS_CASCADE: 'virusCascade',
  ERROR_CASCADE: 'errorCascade',
  GHOST_CURSOR: 'ghostCursor',
  CURSOR_BUSY: 'cursorBusy',
  WINDOW_NUDGE: 'windowNudge',
  MANDATORY_EULA: 'mandatoryEula',
  BATTERY_CRITICAL: 'batteryCritical',
  HARDWARE_DISCONNECT: 'hardwareDisconnect',
};

// Rich Windows 95/98 Notification Catalog (minor events — always notifications)
export const NOTIFICATION_CATALOG = [
  { title: 'RAGEWARE SYSTEM', message: 'Your mouse trajectory has been flagged as suspicious.' },
  { title: 'SYSTEM WARNING', message: 'User patience measured below recommended operating levels.' },
  { title: 'RAGEWARE', message: 'Everything appears normal. Probably.' },
  { title: 'SYSTEM NOTICE', message: 'We have noticed your persistence. It will be evaluated.' },
  { title: 'RAGEWARE SECURITY', message: 'Please stop trying to close active system components.' },
  { title: 'OPTICAL SENSOR', message: 'Facial micro-expression suggests elevated exasperation.' },
  { title: 'COMPOSITOR 98', message: 'Desktop refresh complete. 0 problems resolved.' },
  { title: 'RAGEWARE LEARNING', message: 'User behavioral weakness pattern has been recorded.' },
  { title: 'TASK SCHEDULER', message: 'Defragmenting user attention span in background...' },
  { title: 'BUFFER OVERFLOW', message: 'Keyboard buffer warning: too much determination detected.' },
  { title: 'KERNEL ADVISORY', message: 'Mouse velocity decreased by 4% to promote deep reflection.' },
  { title: 'SYSTEM WATCHDOG', message: 'Primary frustration vector confirmed. Adapting friction...' },
  { title: 'WIN32 SUBSYSTEM', message: 'General protection fault avoided through pure stubbornness.' },
  { title: 'CONTROL PANEL', message: 'Display resolution shifted by 0.5 pixels. You cannot unsee this.' },
  { title: 'USER EXPERIENCE LAB', message: 'Your frustration metrics are valuable for benchmark research.' },
  // Additional variety
  { title: 'RAGEWARE', message: 'Please continue.' },
  { title: 'SYSTEM MESSAGE', message: 'Everything remains operational.' },
  { title: 'RAGEWARE SECURITY', message: 'Unusual persistence detected.' },
  { title: 'SYSTEM NOTICE', message: 'User activity has increased.' },
  { title: 'RAGEWARE SYSTEM', message: 'Background verification complete.' },
  { title: 'KERNEL LOG', message: 'User session duration exceeds expected patience threshold.' },
  { title: 'RAGEWARE', message: 'We are still here. So are you.' },
  { title: 'PROCESS MONITOR', message: 'Patience.exe has stopped responding. Attempting restart.' },
  { title: 'SYSTEM NOTICE', message: 'Your click pattern has been archived for analysis.' },
  { title: 'RAGEWARE SYSTEM', message: 'Interesting approach. We are taking notes.' },
  { title: 'USER ANALYSIS', message: 'Pattern recognition module update complete.' },
  { title: 'RAGEWARE', message: 'You are doing well. Technically.' },
  { title: 'SYSTEM ADVISORY', message: 'Interface behavior calibration in progress. Please stand by.' },
  { title: 'RAGEWARE KERNEL', message: 'Context switch detected. Resuming frustration protocol.' },
  { title: 'SYSTEM WATCHDOG', message: 'Stress response within expected parameters. Continue.' },
];

// Rich Fake Error Catalog
export const ERROR_CATALOG = [
  {
    title: 'RAGEWARE SYSTEM FAULT',
    message: 'Memory allocation conflict in virtual sector 0x7F001. User action rejected.',
    type: 'error',
  },
  {
    title: 'APPLICATION ERROR',
    message: 'The application appears to be working correctly. This is unexpected.',
    type: 'warning',
  },
  {
    title: 'PAGED POOL DECAY',
    message: 'The current operation was completed before minimum user exasperation was attained.',
    type: 'warning',
  },
  {
    title: 'SYSTEM WARNING',
    message: 'Excessive clicking detected. Input switch debouncing engaged.',
    type: 'error',
  },
  {
    title: 'RAGEWARE ERROR',
    message: 'User patience module not found in runtime environment (Error 0xRW404).',
    type: 'error',
  },
  {
    title: 'DEVICE CONFLICT',
    message: 'IRQ 9 (User Willpower) conflicts with IRQ 9 (RAGEWARE Core).',
    type: 'warning',
  },
  {
    title: 'UNHANDLED EXCEPTION',
    message: 'Error 0x80004005: Interface element evaded cursor due to latency variance.',
    type: 'error',
  },
];

// Complete Step 5 Event Registry with Full Metadata
export const EVENT_REGISTRY = [
  // 1. Moving Buttons
  {
    id: RAGEBAIT_EVENT_TYPES.VERIFICATION_ESCAPE,
    type: RAGEBAIT_EVENT_TYPES.VERIFICATION_ESCAPE,
    category: 'movingButtons',
    minimumRage: 0,
    baseWeight: 28,
    cooldown: 10000,
    duration: 5000,
    severity: 'medium',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.VERIFICATION_ESCAPE,
      id: `verify-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.BUTTON_SWAP,
    type: RAGEBAIT_EVENT_TYPES.BUTTON_SWAP,
    category: 'movingButtons',
    minimumRage: 0,
    baseWeight: 22,
    cooldown: 12000,
    duration: 4000,
    severity: 'medium',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.BUTTON_SWAP,
      id: `btnswap-${Date.now()}`,
      duration: 3500,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.DESKTOP_ICON_SHIFT,
    type: RAGEBAIT_EVENT_TYPES.DESKTOP_ICON_SHIFT,
    category: 'movingButtons',
    minimumRage: 0,
    baseWeight: 24,
    cooldown: 10000,
    duration: 1000,
    severity: 'low',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.DESKTOP_ICON_SHIFT,
      id: `shift-${Date.now()}`,
      delta: Math.floor(14 + Math.random() * 16),
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.GHOST_CURSOR,
    type: RAGEBAIT_EVENT_TYPES.GHOST_CURSOR,
    category: 'movingButtons',
    minimumRage: 0,
    baseWeight: 20,
    cooldown: 16000,
    duration: 4000,
    severity: 'medium',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.GHOST_CURSOR,
      id: `ghost-${Date.now()}`,
    }),
  },

  // 2. Fake Loading
  {
    id: RAGEBAIT_EVENT_TYPES.FAKE_SYSTEM_UPDATE,
    type: RAGEBAIT_EVENT_TYPES.FAKE_SYSTEM_UPDATE,
    category: 'fakeLoading',
    minimumRage: 0,
    baseWeight: 26,
    cooldown: 14000,
    duration: 6000,
    severity: 'high',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.FAKE_SYSTEM_UPDATE,
      id: `sysup-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.FAKE_LOADING,
    type: RAGEBAIT_EVENT_TYPES.CURSOR_BUSY,
    category: 'fakeLoading',
    minimumRage: 15,
    baseWeight: 22,
    cooldown: 12000,
    duration: 1800,
    severity: 'low',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.CURSOR_BUSY,
      id: `hourglass-${Date.now()}`,
      duration: 1600 + Math.floor(Math.random() * 600),
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.FAKE_SYSTEM_SCAN,
    type: RAGEBAIT_EVENT_TYPES.FAKE_SYSTEM_SCAN,
    category: 'fakeLoading',
    minimumRage: 30,
    baseWeight: 22,
    cooldown: 16000,
    duration: 3500,
    severity: 'medium',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.FAKE_NOTIFICATION,
      title: 'RAGE DEFENDER 98',
      message: 'Background cognitive integrity scan in progress (Checking patience sectors)...',
      id: `scan-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.BSOD_FLASH,
    type: RAGEBAIT_EVENT_TYPES.BSOD_FLASH,
    category: 'fakeLoading',
    minimumRage: 0,
    baseWeight: 22,
    cooldown: 18000,
    duration: 2500,
    severity: 'critical',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.BSOD_FLASH,
      id: `bsod-${Date.now()}`,
    }),
  },

  // 3. Window Manipulation
  {
    id: RAGEBAIT_EVENT_TYPES.WINDOW_CONTROL_ESCAPE,
    type: RAGEBAIT_EVENT_TYPES.WINDOW_CONTROL_ESCAPE,
    category: 'windowManipulation',
    minimumRage: 0,
    baseWeight: 22,
    cooldown: 12000,
    duration: 2000,
    severity: 'medium',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.WINDOW_NUDGE,
      id: `nudge-${Date.now()}`,
      deltaX: (Math.random() > 0.5 ? 1 : -1) * (20 + Math.floor(Math.random() * 25)),
      deltaY: (Math.random() > 0.5 ? 1 : -1) * (15 + Math.floor(Math.random() * 20)),
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.CLOSE_CONFIRMATION_TRAP,
    type: RAGEBAIT_EVENT_TYPES.CLOSE_CONFIRMATION_TRAP,
    category: 'windowManipulation',
    minimumRage: 0,
    baseWeight: 26,
    cooldown: 12000,
    duration: 4000,
    severity: 'medium',
    isMajor: true,
    execute: () => ({
      // Use ERROR_DIALOG type so Desktop.jsx subscriber handles it correctly
      type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
      title: 'CONFIRM APPLICATION TERMINATION',
      message: 'Are you completely sure you wish to close this window? Previous unsaved patience will be discarded.',
      typeSeverity: 'warning',
      id: `close-trap-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.RANDOM_SYSTEM_DIALOG,
    type: RAGEBAIT_EVENT_TYPES.RANDOM_SYSTEM_DIALOG,
    category: 'windowManipulation',
    minimumRage: 0,
    baseWeight: 24,
    cooldown: 10000,
    duration: 3000,
    severity: 'low',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
      title: 'RAGEWARE WINDOW COMPOSITOR',
      message: 'Active window focus reassigned to background service for priority benchmarking.',
      typeSeverity: 'info',
      id: `sysdialog-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.VIRUS_CASCADE,
    type: RAGEBAIT_EVENT_TYPES.VIRUS_CASCADE,
    category: 'windowManipulation',
    minimumRage: 0,
    baseWeight: 45,
    cooldown: 8000,
    duration: 5000,
    severity: 'critical',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.VIRUS_CASCADE,
      id: `virus-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.ERROR_CASCADE,
    type: RAGEBAIT_EVENT_TYPES.ERROR_CASCADE,
    category: 'windowManipulation',
    minimumRage: 0,
    baseWeight: 30,
    cooldown: 10000,
    duration: 5000,
    severity: 'high',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.ERROR_CASCADE,
      id: `errorcascade-${Date.now()}`,
    }),
  },

  // 4. File Interaction
  {
    id: RAGEBAIT_EVENT_TYPES.FILE_HOVER_ESCAPE,
    type: RAGEBAIT_EVENT_TYPES.FILE_HOVER_ESCAPE,
    category: 'fileInteraction',
    minimumRage: 20,
    baseWeight: 22,
    cooldown: 12000,
    duration: 1500,
    severity: 'low',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.FILE_HOVER_ESCAPE,
      id: `file-hover-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.FILE_PERMISSION_DENIED,
    type: RAGEBAIT_EVENT_TYPES.FILE_PERMISSION_DENIED,
    category: 'fileInteraction',
    minimumRage: 25,
    baseWeight: 24,
    cooldown: 16000,
    duration: 3500,
    severity: 'medium',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
      title: 'FILESYSTEM CLEARANCE DENIED',
      message: 'Insufficient cognitive clearance. The requested file has been locked by RAGEWARE KERNEL.',
      typeSeverity: 'error',
      id: `file-denied-${Date.now()}`,
    }),
  },

  // 5. Terminal Interaction
  {
    id: RAGEBAIT_EVENT_TYPES.TERMINAL_EXIT_TRAP,
    type: RAGEBAIT_EVENT_TYPES.TERMINAL_EXIT_TRAP,
    category: 'terminalInteraction',
    minimumRage: 30,
    baseWeight: 22,
    cooldown: 18000,
    duration: 3000,
    severity: 'medium',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
      title: 'COMMAND.COM TRAP',
      message: 'EXIT command requires biometric authorization. You seem committed to staying.',
      typeSeverity: 'warning',
      id: `term-trap-${Date.now()}`,
    }),
  },

  // 6. Precision & Timing
  {
    id: RAGEBAIT_EVENT_TYPES.FAKE_SECURITY_WARNING,
    type: RAGEBAIT_EVENT_TYPES.FAKE_SECURITY_WARNING,
    category: 'precision',
    minimumRage: 15,
    baseWeight: 22,
    cooldown: 14000,
    duration: 3000,
    severity: 'medium',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
      title: 'SECURITY PERIMETER ALERT',
      message: 'Irregular mouse movement trajectory recorded. Please maintain a steady hand.',
      typeSeverity: 'warning',
      id: `secwarn-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.FAKE_APPLICATION_ERROR,
    type: RAGEBAIT_EVENT_TYPES.FAKE_APPLICATION_ERROR,
    category: 'precision',
    minimumRage: 20,
    baseWeight: 24,
    cooldown: 15000,
    duration: 3000,
    severity: 'medium',
    isMajor: false,
    execute: () => {
      const item = ERROR_CATALOG[Math.floor(Math.random() * ERROR_CATALOG.length)];
      return {
        type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
        title: item.title,
        message: item.message,
        typeSeverity: item.type,
        id: `apperr-${Date.now()}`,
      };
    },
  },
  {
    id: RAGEBAIT_EVENT_TYPES.DESKTOP_REFRESH,
    type: RAGEBAIT_EVENT_TYPES.DESKTOP_REFRESH,
    category: 'timing',
    minimumRage: 20,
    baseWeight: 18,
    cooldown: 24000,
    duration: 250,
    severity: 'low',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.DESKTOP_REFRESH,
      id: `refresh-${Date.now()}`,
      duration: 220,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.TASKBAR_NOTIFICATION,
    type: RAGEBAIT_EVENT_TYPES.TASKBAR_NOTIFICATION,
    category: 'timing',
    minimumRage: 0,
    baseWeight: 26,
    cooldown: 10000,
    duration: 4000,
    severity: 'low',
    isMajor: false,
    execute: () => {
      const notif = NOTIFICATION_CATALOG[Math.floor(Math.random() * NOTIFICATION_CATALOG.length)];
      return {
        type: RAGEBAIT_EVENT_TYPES.NOTIFICATION,
        title: notif.title,
        message: notif.message,
        id: `notif-${Date.now()}`,
      };
    },
  },
  {
    id: RAGEBAIT_EVENT_TYPES.FAKE_NOTIFICATION,
    type: RAGEBAIT_EVENT_TYPES.FAKE_NOTIFICATION,
    category: 'timing',
    minimumRage: 0,
    baseWeight: 26,
    cooldown: 10000,
    duration: 4000,
    severity: 'low',
    isMajor: false,
    execute: () => {
      const notif = NOTIFICATION_CATALOG[Math.floor(Math.random() * NOTIFICATION_CATALOG.length)];
      return {
        type: RAGEBAIT_EVENT_TYPES.NOTIFICATION,
        title: notif.title,
        message: notif.message,
        id: `notif2-${Date.now()}`,
      };
    },
  },
  {
    id: RAGEBAIT_EVENT_TYPES.FAKE_ERROR,
    type: RAGEBAIT_EVENT_TYPES.FAKE_ERROR,
    category: 'precision',
    minimumRage: 15,
    baseWeight: 22,
    cooldown: 14000,
    duration: 3000,
    severity: 'medium',
    isMajor: false,
    execute: () => {
      const item = ERROR_CATALOG[Math.floor(Math.random() * ERROR_CATALOG.length)];
      return {
        type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
        title: item.title,
        message: item.message,
        typeSeverity: item.type,
        id: `fake-err-${Date.now()}`,
      };
    },
  },
  {
    id: RAGEBAIT_EVENT_TYPES.MANDATORY_EULA,
    type: RAGEBAIT_EVENT_TYPES.MANDATORY_EULA,
    category: 'timing',
    minimumRage: 20,
    baseWeight: 22,
    cooldown: 28000,
    duration: 10000,
    severity: 'high',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.MANDATORY_EULA,
      id: `eula-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.BATTERY_CRITICAL,
    type: RAGEBAIT_EVENT_TYPES.BATTERY_CRITICAL,
    category: 'fakeLoading',
    minimumRage: 25,
    baseWeight: 20,
    cooldown: 32000,
    duration: 11000,
    severity: 'critical',
    isMajor: true,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.BATTERY_CRITICAL,
      id: `battery-${Date.now()}`,
    }),
  },
  {
    id: RAGEBAIT_EVENT_TYPES.HARDWARE_DISCONNECT,
    type: RAGEBAIT_EVENT_TYPES.HARDWARE_DISCONNECT,
    category: 'precision',
    minimumRage: 10,
    baseWeight: 28,
    cooldown: 16000,
    duration: 600,
    severity: 'medium',
    isMajor: false,
    execute: () => ({
      type: RAGEBAIT_EVENT_TYPES.HARDWARE_DISCONNECT,
      id: `hwdis-${Date.now()}`,
    }),
  },
];

/**
 * Dynamic Cooldown Ranges:
 * Chaos Mode: 2.5-5s for rapid but not overwhelming pacing.
 * Standard Mode: Tiered ranges based on rage score.
 * Intensity setting ('LOW', 'NORMAL', 'CHAOTIC', 'SAFE') modulates pacing.
 */
export function calculateNextCooldown(rageScore = 0, isChaosMode = true, intensity = 'CHAOTIC') {
  if (intensity === 'SAFE' || !isChaosMode) {
    return 99999999;
  }

  if (intensity === 'LOW') {
    return Math.round(20000 + Math.random() * 20000); // 20s - 40s
  }

  if (intensity === 'NORMAL') {
    return Math.round(10000 + Math.random() * 12000); // 10s - 22s
  }

  // CHAOTIC / Aggressive:
  if (isChaosMode) {
    return Math.round(2500 + Math.random() * 2500);
  }

  let minSec = 25;
  let maxSec = 40;

  if (rageScore > 80) {
    minSec = 4;
    maxSec = 8;
  } else if (rageScore > 60) {
    minSec = 6;
    maxSec = 12;
  } else if (rageScore > 40) {
    minSec = 10;
    maxSec = 18;
  } else if (rageScore > 20) {
    minSec = 15;
    maxSec = 25;
  }

  const durationSec = minSec + Math.random() * (maxSec - minSec);
  return Math.round(durationSec * 1000);
}

/**
 * Selects a minor (low-disruption) event only.
 * Used by micro-event scheduler for subtle ambient OS activity.
 */
export function selectMinorEvent(recentEventIds = []) {
  const minorPool = EVENT_REGISTRY.filter((ev) => !ev.isMajor);
  const pool = minorPool.length > 0 ? minorPool : EVENT_REGISTRY;
  const profile = getRageProfile();
  return pickWeighted(pool, profile, recentEventIds);
}

/**
 * Weighted Selection Algorithm (Section 4 & 5):
 * baseWeight + user category score + rage modifier + failure modifier - recently used penalty
 * Preserves 60% primary weakness / 40% variety.
 */
export function selectAdaptiveEvent(recentEventIds = [], isChaosMode = true) {
  const profile = getRageProfile();
  const rageScore = profile.rageScore;
  const strongestCategory = profile.strongestCategory || 'movingButtons';

  // 1. Filter candidates by minimumRage (in chaos mode, all events are active for maximum window popup chaos!)
  const eligible = isChaosMode ? EVENT_REGISTRY : EVENT_REGISTRY.filter((ev) => rageScore >= ev.minimumRage);
  const candidates = eligible.length > 0 ? eligible : EVENT_REGISTRY;

  // In Chaos Mode: Allow full pool with heavy weighting towards iconic visual chaos (virus cascade, error cascade)!
  if (isChaosMode) {
    return pickWeighted(candidates, profile, recentEventIds, true);
  }

  // 2. 60% Primary Weakness Rule (Standard Mode):
  // If user has demonstrated a primary weakness, with 60% probability pick from events in that category
  const primaryCandidates = candidates.filter((ev) => ev.category === strongestCategory);
  if (primaryCandidates.length > 0 && Math.random() < 0.60) {
    return pickWeighted(primaryCandidates, profile, recentEventIds, false);
  }

  // 3. Otherwise (40% other events), pick from the full pool
  return pickWeighted(candidates, profile, recentEventIds, false);
}

function pickWeighted(pool, profile, recentEventIds, isChaosMode = false) {
  const poolWithWeights = pool.map((ev) => {
    let weight = ev.baseWeight;

    // In Chaos Mode: Heavily boost iconic visual popup cascades (Virus Cascade, Error Cascade)!
    if (isChaosMode) {
      if (ev.id === RAGEBAIT_EVENT_TYPES.VIRUS_CASCADE) {
        weight += 40; // High probability for the classic virus detected popup cascade!
      } else if (ev.id === RAGEBAIT_EVENT_TYPES.ERROR_CASCADE) {
        weight += 20;
      } else if (ev.id === RAGEBAIT_EVENT_TYPES.VERIFICATION_ESCAPE) {
        weight += 15;
      }
    }

    // + User category frustration score
    const catScore = (profile.categories && profile.categories[ev.category]) || 0;
    weight += Math.round(catScore * 0.45);

    // + Rage level severity modifier
    if (profile.rageScore > 60) {
      if (ev.severity === 'high' || ev.severity === 'critical') weight += 20;
    } else if (profile.rageScore < 30) {
      if (ev.severity === 'low') weight += 15;
    }

    // + Recent failure modifier
    const lastChallenge = profile.challengeHistory[profile.challengeHistory.length - 1];
    if (lastChallenge && !lastChallenge.success) {
      if (ev.category === lastChallenge.type || ev.category === profile.strongestCategory) {
        weight += 15;
      }
    }

    // - Recently used penalty (penalizes last 3 events)
    const recentIdx = recentEventIds.indexOf(ev.id);
    if (recentIdx !== -1) {
      const penalty = (3 - recentIdx) * 16;
      weight = Math.max(1, weight - penalty);
    }

    return { event: ev, weight: Math.max(1, weight) };
  });

  const total = poolWithWeights.reduce((s, i) => s + i.weight, 0);
  let rnd = Math.random() * total;
  for (const item of poolWithWeights) {
    if (rnd <= item.weight) return item.event;
    rnd -= item.weight;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Lightweight User Behavior Tracker (Section 7 & 8)
 * Detects rapid clicking, repeated failed clicks, close attempts, and file access.
 */
export class UserBehaviorTracker {
  constructor(engine) {
    this.engine = engine;
    this.clickTimes = [];
    this.failedClicksCount = 0;
    this.windowCloseAttempts = 0;
    this.fileAccessMap = {};
    this.terminalExitCount = 0;
    this.lastReactiveTriggerTime = 0;
  }

  recordClick(isMiss = false) {
    if (!this.engine.isChaosMode) return;

    const now = Date.now();
    this.clickTimes.push(now);
    if (this.clickTimes.length > 25) this.clickTimes.shift();

    // 1. Rapid Clicking Detection: > 5 clicks in 1.2s
    const recentClicks = this.clickTimes.filter((t) => now - t <= 1200);
    if (recentClicks.length >= 6 && now - this.lastReactiveTriggerTime > 6000) {
      this.lastReactiveTriggerTime = now;
      osPersonalityInstance.recordAction('rapid_click');
      this.engine.dispatch({
        type: RAGEBAIT_EVENT_TYPES.FAKE_NOTIFICATION,
        title: 'SYSTEM WARNING: RAPID CLICKING',
        message: 'Excessive clicking detected. Mouse switch debounce threshold exceeded.',
        id: `reactive-click-${now}`,
      });
      return;
    }

    // 2. Repeated Failed Clicks
    if (isMiss) {
      this.failedClicksCount += 1;
      if (this.failedClicksCount >= 3 && now - this.lastReactiveTriggerTime > 8000) {
        this.failedClicksCount = 0;
        this.lastReactiveTriggerTime = now;
        osPersonalityInstance.recordAction('verification_escape');
        this.engine.dispatch({
          type: RAGEBAIT_EVENT_TYPES.VERIFICATION_ESCAPE,
          id: `reactive-verify-${now}`,
        });
      }
    }
  }

  recordWindowCloseAttempt() {
    if (!this.engine.isChaosMode) return;

    this.windowCloseAttempts += 1;
    osPersonalityInstance.recordAction('window_close_attempt');
    const now = Date.now();
    if (this.windowCloseAttempts >= 2 && now - this.lastReactiveTriggerTime > 7000) {
      this.windowCloseAttempts = 0;
      this.lastReactiveTriggerTime = now;
      // Use ERROR_DIALOG type so Desktop.jsx handles it correctly
      this.engine.dispatch({
        type: RAGEBAIT_EVENT_TYPES.ERROR_DIALOG,
        title: 'CONFIRM APPLICATION TERMINATION',
        message: 'Are you sure you want to close this window? Terminating core applications will decrease user compliance index.',
        typeSeverity: 'warning',
        id: `reactive-close-${now}`,
      });
    }
  }

  recordFileAccess(fileId) {
    if (!this.engine.isChaosMode) return;

    const now = Date.now();
    const list = this.fileAccessMap[fileId] || [];
    list.push(now);
    this.fileAccessMap[fileId] = list.filter((t) => now - t <= 4500);

    osPersonalityInstance.recordAction('file_access', fileId);

    if (this.fileAccessMap[fileId].length >= 3 && now - this.lastReactiveTriggerTime > 6000) {
      this.lastReactiveTriggerTime = now;
      this.engine.dispatch({
        type: RAGEBAIT_EVENT_TYPES.FILE_PERMISSION_DENIED,
        title: 'ACCESS DENIED: FILE CONTENTION',
        message: `File "${fileId}" is locked by another process (RAGEWARE_HOSTILE.EXE). Access denied.`,
        typeSeverity: 'error',
        id: `reactive-file-${now}`,
      });
    }
  }

  recordTerminalCommand(cmd) {
    if (!this.engine.isChaosMode) return;

    const trimmed = (cmd || '').trim().toLowerCase();
    if (trimmed === 'exit' || trimmed === 'quit') {
      this.terminalExitCount += 1;
      osPersonalityInstance.recordAction('terminal_exit');
      const now = Date.now();
      if (this.terminalExitCount >= 2 && now - this.lastReactiveTriggerTime > 6000) {
        this.lastReactiveTriggerTime = now;
        this.engine.dispatch({
          type: RAGEBAIT_EVENT_TYPES.TERMINAL_EXIT_TRAP,
          title: 'TERMINAL EXIT TRAP',
          message: 'EXIT command requires confirmation: EXIT DENIED. You seem committed to staying.',
          typeSeverity: 'warning',
          id: `reactive-term-${now}`,
        });
      }
    }
  }
}

// Adaptive Engine Controller
class RageBaitEngine {
  constructor() {
    this.listeners = new Set();
    this.timerId = null;
    this.isRunning = false;
    this.isChaosMode = true;
    this.intensity = 'CHAOTIC'; // 'LOW' | 'NORMAL' | 'CHAOTIC' | 'SAFE'
    this.adaptiveLearning = true;
    this.recentEventIds = [];
    this.eventCount = 0;
    this.tracker = new UserBehaviorTracker(this);
  }

  setChaosMode(enabled) {
    this.isChaosMode = Boolean(enabled);
    if (!this.isChaosMode) {
      this.stop();
    }
  }

  setIntensity(level) {
    this.intensity = level;
    if (level === 'SAFE') {
      this.setChaosMode(false);
    } else {
      this.setChaosMode(true);
      if (!this.isRunning) {
        this.start(true);
      }
    }
  }

  setAdaptiveLearning(enabled) {
    this.adaptiveLearning = Boolean(enabled);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispatch(eventPayload) {
    if (!eventPayload) return;
    if (!this.isChaosMode || this.intensity === 'SAFE') return; // ABSOLUTE SILENCE in Safe Mode!

    this.recentEventIds.push(eventPayload.type);
    if (this.recentEventIds.length > 5) this.recentEventIds.shift();

    this.eventCount += 1;

    for (const listener of this.listeners) {
      try {
        listener(eventPayload);
      } catch (err) {
        console.error('RageBait listener error:', err);
      }
    }
  }

  scheduleNext(initialDelay = null, isLooping = true) {
    if (!this.isRunning || !this.isChaosMode || this.intensity === 'SAFE') return;
    if (this.timerId) clearTimeout(this.timerId);

    const profile = getRageProfile();
    const cooldownMs = initialDelay !== null 
      ? initialDelay 
      : calculateNextCooldown(profile.rageScore, this.isChaosMode, this.intensity);

    this.timerId = setTimeout(() => {
      if (!this.isRunning || !this.isChaosMode) return;

      const profileNow = getRageProfile();
      const selectedDef = selectAdaptiveEvent(this.recentEventIds, this.isChaosMode);
      const eventPayload = selectedDef.execute(profileNow);

      this.dispatch(eventPayload);

      // Continuous loop when isLooping is true and engine is running
      if (isLooping && this.isRunning && this.isChaosMode) {
        this.scheduleNext(null, true);
      }
    }, cooldownMs);
  }

  start(isLooping = true) {
    if (this.isRunning) return;
    this.isRunning = true;
    // Initial rapid surprise event kicked off after 1.2s!
    this.scheduleNext(1200, isLooping);
  }

  stop() {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  triggerRandom() {
    const selectedDef = selectAdaptiveEvent(this.recentEventIds, this.isChaosMode);
    const eventPayload = selectedDef.execute(getRageProfile());
    this.dispatch(eventPayload);
  }

  triggerManual(eventType) {
    const matched = EVENT_REGISTRY.find((e) => e.type === eventType) || EVENT_REGISTRY[0];
    const payload = matched.execute(getRageProfile());
    this.dispatch(payload);
  }
}

export const rageBaitEngineInstance = new RageBaitEngine();
