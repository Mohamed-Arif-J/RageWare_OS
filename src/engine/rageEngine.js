/**
 * RAGEWARE — Core Rage Engine (Hostile OS Architecture)
 * 
 * Tracks emotional friction across all OS vectors:
 * - movingButtons
 * - fakeLoading
 * - windowManipulation
 * - fileInteraction
 * - terminalInteraction
 * - precision
 * - timing
 * - handInteraction
 * 
 * Fully independent of React UI.
 */

export const FRUSTRATION_CATEGORIES = {
  MOVING_BUTTONS: 'movingButtons',
  FAKE_LOADING: 'fakeLoading',
  WINDOW_MANIPULATION: 'windowManipulation',
  FILE_INTERACTION: 'fileInteraction',
  TERMINAL_INTERACTION: 'terminalInteraction',
  PRECISION: 'precision',
  TIMING: 'timing',
  HAND_INTERACTION: 'handInteraction',
};

export const RAGE_EVENTS = {
  // Moving Buttons / Evasion
  MOVING_BUTTON_ESCAPE: 'movingButtonEscape',
  VERIFICATION_BUTTON_ESCAPE: 'verificationButtonEscape',
  
  // Fake Loading
  FAKE_LOADING_FAILURE: 'fakeLoadingFailure',
  FAKE_UPDATE_STALL: 'fakeUpdateStall',
  
  // Window Manipulation
  WINDOW_CONTROL_ESCAPE: 'windowControlEscape',
  WINDOW_CONFIRM_TRAP: 'windowConfirmTrap',
  
  // File Interaction
  FILE_HOVER_ESCAPE: 'fileHoverEscape',
  FILE_PERMISSION_DENIED: 'filePermissionDenied',
  
  // Terminal Interaction
  TERMINAL_EXIT_TRAPPED: 'terminalExitTrapped',
  TERMINAL_SNARK: 'terminalSnark',
  
  // Precision & Timing
  BUTTON_MISS: 'buttonMiss',
  CHALLENGE_TIMEOUT: 'challengeTimeout',
  INCORRECT_ACTION: 'incorrectAction',
  
  // Cooldown / Success
  SUCCESSFUL_ACTION: 'successfulAction',

  // Step 4: Optical Visual Signals & Expression Tracking
  FACIAL_REACTION: 'facialReaction',
  RAPID_HEAD_MOVEMENT: 'rapidHeadMovement',
  STRONG_FACIAL_ACTIVITY: 'strongFacialActivity',
  FACIAL_AGITATION: 'facialAgitation',
  HEAD_SHAKE: 'headShake',

  // Mouse Ergonomics & Rage Tracking
  ERRATIC_MOUSE: 'erraticMouse',
  RAPID_CLICKING: 'rapidClicking',

  // Part 2: Calculator Events
  CALCULATOR_BUTTON_ESCAPE: 'calculatorButtonEscape',
  CALCULATOR_FAKE_ERROR: 'calculatorFakeError',
  CALCULATOR_DELAYED_RESULT: 'calculatorDelayedResult',
  CALCULATOR_INTERACTION_TRAP: 'calculatorInteractionTrap',

  // Part 3: Fake Lock Events
  FAKE_LOCK: 'fakeLock',
  LOCK_PASSWORD_TRAP: 'lockPasswordTrap',
  LOCK_BUTTON_ESCAPE: 'lockButtonEscape',
  LOCK_ACCESS_DENIED: 'lockAccessDenied',

  // Part 4: Calendar Events
  CALENDAR_NAVIGATION_TRAP: 'calendarNavigationTrap',
  CALENDAR_FAKE_APPOINTMENT: 'calendarFakeAppointment',
  CALENDAR_INTERACTION_TRAP: 'calendarInteractionTrap',
  CALENDAR_DATE_MOCK: 'calendarDateMock',
  CALENDAR_TODAY_MOCK: 'calendarTodayMock',
  CALENDAR_REPEATED_INTERACTION: 'calendarRepeatedInteraction',
  CALENDAR_STATUS_MOCK: 'calendarStatusMock',
  CALENDAR_DELAYED_NAVIGATION: 'calendarDelayedNavigation',
};

// Event to category & default weight mapping
const EVENT_CONFIG = {
  [RAGE_EVENTS.MOVING_BUTTON_ESCAPE]: { category: FRUSTRATION_CATEGORIES.MOVING_BUTTONS, delta: 10 },
  [RAGE_EVENTS.VERIFICATION_BUTTON_ESCAPE]: { category: FRUSTRATION_CATEGORIES.MOVING_BUTTONS, delta: 10 },
  [RAGE_EVENTS.FAKE_LOADING_FAILURE]: { category: FRUSTRATION_CATEGORIES.FAKE_LOADING, delta: 14 },
  [RAGE_EVENTS.FAKE_UPDATE_STALL]: { category: FRUSTRATION_CATEGORIES.FAKE_LOADING, delta: 12 },
  [RAGE_EVENTS.WINDOW_CONTROL_ESCAPE]: { category: FRUSTRATION_CATEGORIES.WINDOW_MANIPULATION, delta: 10 },
  [RAGE_EVENTS.WINDOW_CONFIRM_TRAP]: { category: FRUSTRATION_CATEGORIES.WINDOW_MANIPULATION, delta: 12 },
  [RAGE_EVENTS.FILE_HOVER_ESCAPE]: { category: FRUSTRATION_CATEGORIES.FILE_INTERACTION, delta: 8 },
  [RAGE_EVENTS.FILE_PERMISSION_DENIED]: { category: FRUSTRATION_CATEGORIES.FILE_INTERACTION, delta: 12 },
  [RAGE_EVENTS.TERMINAL_EXIT_TRAPPED]: { category: FRUSTRATION_CATEGORIES.TERMINAL_INTERACTION, delta: 12 },
  [RAGE_EVENTS.TERMINAL_SNARK]: { category: FRUSTRATION_CATEGORIES.TERMINAL_INTERACTION, delta: 6 },
  [RAGE_EVENTS.BUTTON_MISS]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 8 },
  [RAGE_EVENTS.CHALLENGE_TIMEOUT]: { category: FRUSTRATION_CATEGORIES.TIMING, delta: 12 },
  [RAGE_EVENTS.INCORRECT_ACTION]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 10 },
  [RAGE_EVENTS.SUCCESSFUL_ACTION]: { category: null, delta: -6 },
  // Optical adjustments
  [RAGE_EVENTS.FACIAL_REACTION]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 7 },
  [RAGE_EVENTS.RAPID_HEAD_MOVEMENT]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 5 },
  [RAGE_EVENTS.STRONG_FACIAL_ACTIVITY]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 6 },
  [RAGE_EVENTS.FACIAL_AGITATION]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 4 },
  [RAGE_EVENTS.HEAD_SHAKE]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 5 },

  // Mouse adjustments
  [RAGE_EVENTS.ERRATIC_MOUSE]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 6 },
  [RAGE_EVENTS.RAPID_CLICKING]: { category: FRUSTRATION_CATEGORIES.MOVING_BUTTONS, delta: 8 },

  // Calculator Events
  [RAGE_EVENTS.CALCULATOR_BUTTON_ESCAPE]: { category: FRUSTRATION_CATEGORIES.MOVING_BUTTONS, delta: 6 },
  [RAGE_EVENTS.CALCULATOR_FAKE_ERROR]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 8 },
  [RAGE_EVENTS.CALCULATOR_DELAYED_RESULT]: { category: FRUSTRATION_CATEGORIES.FAKE_LOADING, delta: 6 },
  [RAGE_EVENTS.CALCULATOR_INTERACTION_TRAP]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 6 },

  // Lock Events
  [RAGE_EVENTS.FAKE_LOCK]: { category: FRUSTRATION_CATEGORIES.TIMING, delta: 6 },
  [RAGE_EVENTS.LOCK_PASSWORD_TRAP]: { category: FRUSTRATION_CATEGORIES.WINDOW_MANIPULATION, delta: 8 },
  [RAGE_EVENTS.LOCK_BUTTON_ESCAPE]: { category: FRUSTRATION_CATEGORIES.MOVING_BUTTONS, delta: 6 },
  [RAGE_EVENTS.LOCK_ACCESS_DENIED]: { category: FRUSTRATION_CATEGORIES.FILE_INTERACTION, delta: 8 },

  // Calendar Events (Small, calibrated friction contributions)
  [RAGE_EVENTS.CALENDAR_NAVIGATION_TRAP]: { category: FRUSTRATION_CATEGORIES.TIMING, delta: 3 },
  [RAGE_EVENTS.CALENDAR_FAKE_APPOINTMENT]: { category: FRUSTRATION_CATEGORIES.FILE_INTERACTION, delta: 2 },
  [RAGE_EVENTS.CALENDAR_INTERACTION_TRAP]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 2 },
  [RAGE_EVENTS.CALENDAR_DATE_MOCK]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 1 },
  [RAGE_EVENTS.CALENDAR_TODAY_MOCK]: { category: FRUSTRATION_CATEGORIES.TIMING, delta: 1 },
  [RAGE_EVENTS.CALENDAR_REPEATED_INTERACTION]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 1 },
  [RAGE_EVENTS.CALENDAR_STATUS_MOCK]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 1 },
  [RAGE_EVENTS.CALENDAR_DELAYED_NAVIGATION]: { category: FRUSTRATION_CATEGORIES.TIMING, delta: 2 },
};

const createInitialCategories = () => ({
  movingButtons: 0,
  fakeLoading: 0,
  windowManipulation: 0,
  fileInteraction: 0,
  terminalInteraction: 0,
  precision: 0,
  timing: 0,
  handInteraction: 0,
});

const createInitialSessionState = () => ({
  rageScore: 0, // Clean 0 baseline for authentic trust
  calmScore: 100,
  frustrationEvents: 0,
  successfulChallenges: 0,
  failedChallenges: 0,
  totalAttempts: 0,
  meaningfulInteractions: 0,
  challengeHistory: [],
  categories: createInitialCategories(),
});

// Active in-memory session state
let session = createInitialSessionState();
let isSafeMode = false;

export function setSafeMode(enabled) {
  isSafeMode = Boolean(enabled);
  if (isSafeMode) {
    session.rageScore = 0;
    session.calmScore = maxTolerableRage;
    activeReactionWindow = null;
  }
}

export function isEngineSafeMode() {
  return isSafeMode;
}

// Configurable Calibration Parameters (modifiable via Control Panel)
let maxTolerableRage = 100;
let emotionalDecayRate = -0.5; // pts / sec
let frustrationMultiplier = 1.25;

export function setMaxTolerableRage(max) {
  maxTolerableRage = Math.max(20, Math.min(300, Number(max) || 100));
}

export function getMaxTolerableRage() {
  return maxTolerableRage;
}

export function setEmotionalDecayRate(rate) {
  emotionalDecayRate = Number(rate) || 0;
}

export function getEmotionalDecayRate() {
  return emotionalDecayRate;
}

export function setFrustrationMultiplier(mult) {
  frustrationMultiplier = Math.max(0.5, Math.min(5.0, Number(mult) || 1.0));
}

export function getFrustrationMultiplier() {
  return frustrationMultiplier;
}

// Background emotional decay heartbeat
if (typeof window !== 'undefined' && !window.__rageware_decay_started) {
  window.__rageware_decay_started = true;
  setInterval(() => {
    if (emotionalDecayRate !== 0 && session.rageScore > 0) {
      const change = emotionalDecayRate * 2;
      session.rageScore = clamp(session.rageScore + change, 0, maxTolerableRage);
      session.calmScore = Math.max(0, maxTolerableRage - session.rageScore);
    }
  }, 2000);
}

/**
 * Ensures value is a valid clamped number between min and max.
 */
function clamp(val, min = 0, max = maxTolerableRage) {
  if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
    return min;
  }
  return Math.min(max, Math.max(min, Math.round(val)));
}

/**
 * Returns rage level label and score.
 * 0–20: CALM
 * 21–40: ANNOYED
 * 41–60: FRUSTRATED
 * 61–80: ANGRY
 * 81–100: ABSOLUTE RAGE
 */
export function getRageLevel(scoreOverride) {
  const score = scoreOverride !== undefined ? clamp(scoreOverride) : session.rageScore;
  let level = 'CALM';

  if (score > 80) {
    level = 'ABSOLUTE RAGE';
  } else if (score > 60) {
    level = 'ANGRY';
  } else if (score > 40) {
    level = 'FRUSTRATED';
  } else if (score > 20) {
    level = 'ANNOYED';
  }

  return {
    level,
    score,
  };
}

/**
 * Determines which category frustrates the user the most.
 */
export function getBestRagebait() {
  const cats = session.categories;
  let highestCategory = 'movingButtons';
  let highestScore = -1;

  for (const [catKey, catValue] of Object.entries(cats)) {
    if (catValue > highestScore) {
      highestScore = catValue;
      highestCategory = catKey;
    }
  }

  return highestScore > 0 ? highestCategory : 'movingButtons';
}

/**
 * Formats a friendly category name.
 */
export function getCategoryDisplayName(catKey) {
  const map = {
    movingButtons: 'MOVING INTERFACE ELEMENTS',
    fakeLoading: 'STALLED SYSTEM UPDATES',
    windowManipulation: 'EVASIVE WINDOW CONTROLS',
    fileInteraction: 'UNCOOPERATIVE FILESYSTEM',
    terminalInteraction: 'HOSTILE TERMINAL COMMANDS',
    precision: 'PRECISION FRICTION',
    timing: 'TIMING CONSTRAINTS',
    handInteraction: 'BIOMETRIC MISALIGNMENT',
  };
  return map[catKey] || catKey.toUpperCase();
}

// Step 4: Optical Camera Tracking & Reaction Window State
let isCameraActive = false;
let activeReactionWindow = null;

export function setCameraStatus(isActive) {
  isCameraActive = Boolean(isActive);
}

export function isOpticalTrackingActive() {
  return isCameraActive;
}

export function startOpticalReactionWindow(triggerReason = 'ragebait_failure', durationMs = 2600) {
  activeReactionWindow = {
    expiresAt: Date.now() + durationMs,
    triggerReason,
    triggered: false,
  };
}

export function getActiveReactionWindow() {
  if (!activeReactionWindow) return null;
  if (Date.now() > activeReactionWindow.expiresAt) {
    activeReactionWindow = null;
    return null;
  }
  return activeReactionWindow;
}

let lastDiagnostic = {
  lastRageSource: 'initialization',
  lastRageAmount: 0,
  lastOpticalModifier: 0,
  lastBehaviorModifier: 0,
  recentEvent: 'System booted',
};

export function getDiagnostics() {
  const isWindowActive = Boolean(activeReactionWindow && !activeReactionWindow.triggered && Date.now() <= activeReactionWindow.expiresAt);
  return {
    currentRage: session.rageScore,
    rageLevel: getRageLevel().level,
    isSafeMode,
    lastRageSource: lastDiagnostic.lastRageSource,
    lastRageAmount: lastDiagnostic.lastRageAmount,
    lastOpticalModifier: lastDiagnostic.lastOpticalModifier,
    lastBehaviorModifier: lastDiagnostic.lastBehaviorModifier,
    recentEvent: lastDiagnostic.recentEvent,
    reactionWindow: isWindowActive ? 'ACTIVE' : 'INACTIVE',
    cameraActive: isCameraActive,
  };
}

if (typeof window !== 'undefined') {
  window.__RAGEWARE_DIAGNOSTICS__ = getDiagnostics;
}

let lastContinuousOpticalCheck = 0;

/**
 * Process visual signals in the context of optical tracking and reaction windows.
 * - In Safe Mode: 0 rage.
 * - Reaction Window: detects furrowed brow, head shake, or high agitation during post-event windows.
 * - Continuous: detects spontaneous furrowed brows / agitation (adds rage) or smiles (relieves rage).
 */
export function processOpticalSignals(telemetry, baseline) {
  if (!telemetry || !isCameraActive || isSafeMode) return null;

  const now = Date.now();
  const reactionWindow = getActiveReactionWindow();

  // 1. Contextual Reaction Window (Immediate response after adversarial event)
  if (reactionWindow && !reactionWindow.triggered) {
    const isAnnoyedFace = telemetry.primaryExpression === 'FURROWED BROW (ANNOYED)' || (telemetry.eyebrowTension || 0) > 0.40;
    const isHeadShaking = Boolean(telemetry.isHeadShaking);
    const isHighActivity = (telemetry.facialActivity || 0) > (baseline?.avgActivity || 0.12) + 0.16;
    const isAgitated = (telemetry.agitationScore || 0) > 55;

    if (isAnnoyedFace || isHeadShaking || isHighActivity || isAgitated) {
      reactionWindow.triggered = true;
      const bonus = isAnnoyedFace ? 7 : isHeadShaking ? 6 : 5;
      const result = increaseRage(bonus, RAGE_EVENTS.FACIAL_REACTION);

      lastDiagnostic.lastOpticalModifier = bonus;
      lastDiagnostic.recentEvent = `Optical reaction (+${bonus} rage): ${telemetry.primaryExpression || 'Reaction'} during ${reactionWindow.triggerReason}`;

      session.challengeHistory.push({
        type: RAGE_EVENTS.FACIAL_REACTION,
        success: false,
        rageChange: result.delta,
        timestamp: now,
        detail: `Contextual optical reaction (+${result.delta} rage): ${telemetry.primaryExpression}, agitation ${telemetry.agitationScore}%`,
      });

      return {
        triggered: true,
        reason: 'reaction_window',
        expression: telemetry.primaryExpression,
        delta: result.delta,
        newScore: result.newScore,
      };
    }
  }

  // 2. Continuous Tracking (Spontaneous facial frustration / smile calm)
  if (now - lastContinuousOpticalCheck > 5000) {
    lastContinuousOpticalCheck = now;

    // A) Frustration / Annoyance detection: Furrowed brows, sustained agitation >= 60%
    if ((telemetry.agitationScore || 0) >= 60 || telemetry.primaryExpression === 'FURROWED BROW (ANNOYED)' || telemetry.isHeadShaking) {
      const delta = 4;
      const result = increaseRage(delta, RAGE_EVENTS.FACIAL_AGITATION);
      lastDiagnostic.lastOpticalModifier = delta;
      lastDiagnostic.recentEvent = `Optical telemetry: ${telemetry.primaryExpression} detected (+${delta} rage)`;

      return {
        triggered: true,
        reason: 'continuous_agitation',
        expression: telemetry.primaryExpression,
        delta: result.delta,
        newScore: result.newScore,
      };
    }

    // B) Positive expression / Smile detection: Calms user down slightly
    if ((telemetry.smileApproximation || 0) > 0.55 && session.rageScore > 5) {
      const calmDelta = -3;
      session.rageScore = Math.max(0, session.rageScore + calmDelta);
      session.calmScore = Math.min(maxTolerableRage, maxTolerableRage - session.rageScore);
      lastDiagnostic.recentEvent = `Optical telemetry: Smile detected (${calmDelta} rage)`;

      return {
        triggered: true,
        reason: 'smile_recovery',
        expression: 'SMILING',
        delta: calmDelta,
        newScore: session.rageScore,
      };
    }
  }

  return null;
}

/**
 * Returns a comprehensive summary of the current session state.
 */
export function getRageProfile() {
  return {
    rageScore: session.rageScore,
    calmScore: session.calmScore,
    maxRage: maxTolerableRage,
    decayRate: emotionalDecayRate,
    multiplier: frustrationMultiplier,
    level: getRageLevel().level,
    totalAttempts: session.totalAttempts,
    successfulChallenges: session.successfulChallenges,
    failedChallenges: session.failedChallenges,
    meaningfulInteractions: session.meaningfulInteractions,
    frustrationEvents: session.frustrationEvents,
    strongestCategory: getBestRagebait(),
    strongestCategoryDisplay: getCategoryDisplayName(getBestRagebait()),
    categories: { ...session.categories },
    challengeHistory: [...session.challengeHistory],
    isSessionComplete: isSessionComplete(),
    isCameraActive: isOpticalTrackingActive(),
    isSafeMode,
  };
}

/**
 * Checks if the session has reached the final threshold:
 * Requires rageScore >= 81 AND at least 10 meaningful interactions.
 */
export function isSessionComplete() {
  return session.rageScore >= (maxTolerableRage * 0.81) && session.meaningfulInteractions >= 10;
}

/**
 * Increases rage by a given amount and associates it with a reason or category.
 */
export function increaseRage(amount = 10, reason = 'manual') {
  // SAFE MODE: Genuine safety guarantee. Normal interaction, clicking, moving mouse never increases rage!
  if (isSafeMode && !reason.includes('test') && reason !== 'manual') {
    return {
      delta: 0,
      newScore: session.rageScore,
      level: getRageLevel().level,
    };
  }

  const isDirect =
    reason === 'manual' ||
    reason.includes('test') ||
    reason.includes('control_panel') ||
    reason === RAGE_EVENTS.FACIAL_REACTION ||
    reason === RAGE_EVENTS.FACIAL_AGITATION ||
    reason === RAGE_EVENTS.HEAD_SHAKE ||
    reason === RAGE_EVENTS.ERRATIC_MOUSE ||
    reason === RAGE_EVENTS.RAPID_CLICKING;
  const effectiveAmount = isDirect ? amount : Math.round(amount * frustrationMultiplier);
  const safeAmount = Math.max(0, typeof effectiveAmount === 'number' && !Number.isNaN(effectiveAmount) ? effectiveAmount : 10);
  const oldScore = session.rageScore;
  session.rageScore = clamp(session.rageScore + safeAmount, 0, maxTolerableRage);
  session.calmScore = Math.max(0, maxTolerableRage - session.rageScore);
  session.frustrationEvents += 1;
  session.meaningfulInteractions += 1;

  // Resolve category if reason matches a known event or category key
  const eventDef = EVENT_CONFIG[reason];
  const targetCategory = eventDef ? eventDef.category : (session.categories[reason] !== undefined ? reason : null);
  if (targetCategory && session.categories[targetCategory] !== undefined) {
    session.categories[targetCategory] += safeAmount;
  }

  // Update diagnostic tracking
  lastDiagnostic.lastRageSource = reason;
  lastDiagnostic.lastRageAmount = session.rageScore - oldScore;
  lastDiagnostic.recentEvent = getCategoryDisplayName(targetCategory || reason);

  // If this was an adversarial failure/escape event, open a 2.5s optical reaction window!
  const isSelfOptical =
    reason === RAGE_EVENTS.FACIAL_REACTION ||
    reason === RAGE_EVENTS.FACIAL_AGITATION ||
    reason === RAGE_EVENTS.HEAD_SHAKE;
  if (isCameraActive && !isSafeMode && !isSelfOptical && reason !== 'manual' && !reason.includes('test')) {
    startOpticalReactionWindow(reason, 2500);
  }

  return {
    delta: session.rageScore - oldScore,
    newScore: session.rageScore,
    level: getRageLevel().level,
  };
}

/**
 * Decreases rage by a given amount.
 */
export function decreaseRage(amount = 5, reason = 'cooldown') {
  const safeAmount = Math.max(0, typeof amount === 'number' && !Number.isNaN(amount) ? amount : 5);
  const oldScore = session.rageScore;
  session.rageScore = clamp(session.rageScore - safeAmount, 0, maxTolerableRage);
  session.calmScore = Math.max(0, maxTolerableRage - session.rageScore);

  return {
    delta: session.rageScore - oldScore,
    newScore: session.rageScore,
    level: getRageLevel().level,
  };
}

/**
 * Records an adversarial event failure / trigger.
 */
export function recordFailure(reason = RAGE_EVENTS.INCORRECT_ACTION) {
  session.totalAttempts += 1;
  session.failedChallenges += 1;

  // Open 2.5s optical reaction window to observe user's immediate visual reaction
  if (isCameraActive && !isSafeMode) {
    startOpticalReactionWindow(reason, 2500);
  }

  const eventConfig = EVENT_CONFIG[reason] || { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 10 };
  const rageDelta = eventConfig.delta;

  const result = increaseRage(rageDelta, reason);

  session.challengeHistory.push({
    type: reason,
    success: false,
    rageChange: result.delta,
    timestamp: Date.now(),
  });

  return getRageProfile();
}

/**
 * Records a successful user action / overcome challenge.
 */
export function recordSuccess(type = RAGE_EVENTS.SUCCESSFUL_ACTION) {
  session.totalAttempts += 1;
  session.successfulChallenges += 1;
  session.meaningfulInteractions += 1;

  const rageDelta = 5;
  const result = decreaseRage(rageDelta, type);

  session.challengeHistory.push({
    type,
    success: true,
    rageChange: result.delta,
    timestamp: Date.now(),
  });

  return getRageProfile();
}

/**
 * Completely resets the session state.
 */
export function resetSession() {
  session = createInitialSessionState();
  if (isSafeMode) {
    session.rageScore = 0;
    session.calmScore = maxTolerableRage;
  }
  activeReactionWindow = null;
  lastDiagnostic = {
    lastRageSource: 'reset',
    lastRageAmount: 0,
    lastOpticalModifier: 0,
    lastBehaviorModifier: 0,
    recentEvent: 'Session reset',
  };
  return getRageProfile();
}
