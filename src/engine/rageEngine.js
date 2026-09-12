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

  // Step 4: Optical Visual Signals (Contextual to failure reaction windows only)
  FACIAL_REACTION: 'facialReaction',
  RAPID_HEAD_MOVEMENT: 'rapidHeadMovement',
  STRONG_FACIAL_ACTIVITY: 'strongFacialActivity',
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
  // Subtle optical adjustments (+2 to +3)
  [RAGE_EVENTS.FACIAL_REACTION]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 2 },
  [RAGE_EVENTS.RAPID_HEAD_MOVEMENT]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 2 },
  [RAGE_EVENTS.STRONG_FACIAL_ACTIVITY]: { category: FRUSTRATION_CATEGORIES.PRECISION, delta: 3 },
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
  rageScore: 12, // subtle starting baseline for realistic feel
  calmScore: 88,
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

/**
 * Ensures value is a valid clamped number between min and max.
 */
function clamp(val, min = 0, max = 100) {
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

/**
 * Process visual signals in the context of an active ragebait reaction window.
 * STRICT RULE: Avoid false rage. Never increases rage merely because camera is on or face is visible.
 * Only triggers if an active reaction window exists following a failure AND visual activity spikes above baseline!
 */
export function processOpticalSignals(telemetry, baseline) {
  if (!telemetry || !isCameraActive) return null;

  const reactionWindow = getActiveReactionWindow();
  if (!reactionWindow || reactionWindow.triggered) return null;

  const baseActivity = (baseline && typeof baseline.avgActivity === 'number') ? baseline.avgActivity : 0.12;
  const currentActivity = telemetry.facialActivity || 0;
  const isHeadFast = telemetry.headMovement === 'high';
  const isMouthActive = telemetry.mouthOpen && currentActivity > 0.35;

  // Detect significant increase over baseline
  if (currentActivity > baseActivity + 0.32 || isHeadFast || isMouthActive) {
    reactionWindow.triggered = true;
    const bonus = (isHeadFast && currentActivity > baseActivity + 0.4) ? 3 : 2;
    const result = increaseRage(bonus, RAGE_EVENTS.FACIAL_REACTION);

    session.challengeHistory.push({
      type: RAGE_EVENTS.FACIAL_REACTION,
      success: false,
      rageChange: result.delta,
      timestamp: Date.now(),
      detail: `Optical reaction detected (+${result.delta} rage): activity ${(currentActivity * 100).toFixed(0)}% vs baseline ${(baseActivity * 100).toFixed(0)}%`,
    });

    return {
      triggered: true,
      delta: result.delta,
      newScore: result.newScore,
    };
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
  };
}

/**
 * Checks if the session has reached the final threshold:
 * Requires rageScore >= 81 AND at least 10 meaningful interactions.
 */
export function isSessionComplete() {
  return session.rageScore >= 81 && session.meaningfulInteractions >= 10;
}

/**
 * Increases rage by a given amount and associates it with a reason or category.
 */
export function increaseRage(amount = 10, reason = 'manual') {
  const safeAmount = Math.max(0, typeof amount === 'number' && !Number.isNaN(amount) ? amount : 10);
  const oldScore = session.rageScore;
  session.rageScore = clamp(session.rageScore + safeAmount, 0, 100);
  session.calmScore = 100 - session.rageScore;
  session.frustrationEvents += 1;
  session.meaningfulInteractions += 1;

  // Resolve category if reason matches a known event or category key
  const eventDef = EVENT_CONFIG[reason];
  const targetCategory = eventDef ? eventDef.category : (session.categories[reason] !== undefined ? reason : null);
  if (targetCategory && session.categories[targetCategory] !== undefined) {
    session.categories[targetCategory] += safeAmount;
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
  session.rageScore = clamp(session.rageScore - safeAmount, 0, 100);
  session.calmScore = 100 - session.rageScore;

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

  // Step 4: Open 2.6s optical reaction window to observe user's immediate visual reaction
  if (isCameraActive) {
    startOpticalReactionWindow(reason, 2600);
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
  return getRageProfile();
}
