/**
 * RAGEWARE — Step 6: OS Personality & Contextual Reactions Engine
 * 
 * Deterministic rule-based personality system that makes RAGEWARE OS feel ALIVE:
 * - Gradually escalates from standard retro OS -> subtle sarcasm -> acute awareness -> open hostility.
 * - Dynamic personality variables: awarenessLevel, sarcasmLevel, hostilityLevel.
 * - In-memory session memory for repeated actions (rapid clicks, repeated verification, repeated close, repeated file access).
 * - Primary frustration vector referencing (movingButtons, windowManipulation, fakeLoading, etc.).
 * - Contextual success and failure reaction generation.
 * - Independent cooldown scheduler calibrated by rage tier.
 * - Single source of truth integration with rageEngine.js.
 */

import { getRageProfile } from './rageEngine';

export const PERSONALITY_STAGES = {
  CALM: 'CALM',
  ANNOYED: 'ANNOYED',
  FRUSTRATED: 'FRUSTRATED',
  ANGRY: 'ANGRY',
  ABSOLUTE_RAGE: 'ABSOLUTE_RAGE',
};

export const REACTION_TYPES = {
  NOTIFICATION: 'notification',
  DIALOG_MESSAGE: 'dialogMessage',
  STATUS_MESSAGE: 'statusMessage',
  TERMINAL_MESSAGE: 'terminalMessage',
  BOOT_MESSAGE: 'bootMessage',
};

class OSPersonalityEngine {
  constructor() {
    this.listeners = new Set();
    this.lastReactionTime = 0;
    this.isChaosMode = true;

    // In-memory session tracking for contextual awareness
    this.memory = {
      rapidClickIncidents: 0,
      verifyAttempts: 0,
      windowCloseAttempts: 0,
      fileAttempts: {},
      terminalExitAttempts: 0,
      opticalReactions: 0,
      successCount: 0,
      failureCount: 0,
      recentBehaviors: [],
    };
  }

  setChaosMode(enabled) {
    this.isChaosMode = Boolean(enabled);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  dispatch(reaction) {
    if (!reaction || !this.isChaosMode) return;
    this.lastReactionTime = Date.now();

    for (const listener of this.listeners) {
      try {
        listener(reaction);
      } catch (err) {
        console.error('OSPersonality listener error:', err);
      }
    }
  }

  // Derive gameplay personality variables from current rage profile
  getPersonalityMetrics() {
    const profile = getRageProfile();
    const rage = profile.rageScore;

    let stage = PERSONALITY_STAGES.CALM;
    let awareness = 0;
    let sarcasm = 0;
    let hostility = 0;

    if (rage >= 81) {
      stage = PERSONALITY_STAGES.ABSOLUTE_RAGE;
      awareness = 100;
      sarcasm = 85;
      hostility = 90;
    } else if (rage >= 61) {
      stage = PERSONALITY_STAGES.ANGRY;
      awareness = 70;
      sarcasm = 60;
      hostility = 55;
    } else if (rage >= 41) {
      stage = PERSONALITY_STAGES.FRUSTRATED;
      awareness = 45;
      sarcasm = 35;
      hostility = 25;
    } else if (rage >= 21) {
      stage = PERSONALITY_STAGES.ANNOYED;
      awareness = 20;
      sarcasm = 15;
      hostility = 5;
    }

    return {
      stage,
      awareness,
      sarcasm,
      hostility,
      rageScore: rage,
      rageLevel: profile.level,
      recentBehaviors: this.getRecentBehaviorsList(profile),
      primaryWeakness: profile.strongestCategoryDisplay || 'MOVING INTERFACE ELEMENTS',
      primaryCategoryKey: profile.strongestCategory,
    };
  }

  getRecentBehaviorsList(profile) {
    const list = [];
    if (this.memory.rapidClickIncidents > 0) list.push('Rapid clicking detected');
    if (this.memory.verifyAttempts >= 2) list.push('Repeated verification attempts');
    if (this.memory.windowCloseAttempts >= 2) list.push('Repeated window close attempts');
    if (this.memory.terminalExitAttempts >= 1) list.push('Session exit command trapped');
    if (this.memory.opticalReactions >= 1) list.push('Optical reaction window triggered');
    if (profile.failedChallenges >= 3) list.push(`High friction: ${profile.strongestCategoryDisplay}`);

    if (list.length === 0) {
      list.push('Baseline user monitoring active');
      list.push('Awaiting behavioral indicators');
    }
    return list.slice(-4);
  }

  getCooldownMs(stage) {
    switch (stage) {
      case PERSONALITY_STAGES.ABSOLUTE_RAGE:
        return Math.floor(4000 + Math.random() * 6000); // 4-10s
      case PERSONALITY_STAGES.ANGRY:
        return Math.floor(6000 + Math.random() * 9000); // 6-15s
      case PERSONALITY_STAGES.FRUSTRATED:
        return Math.floor(10000 + Math.random() * 10000); // 10-20s
      case PERSONALITY_STAGES.ANNOYED:
        return Math.floor(15000 + Math.random() * 15000); // 15-30s
      case PERSONALITY_STAGES.CALM:
      default:
        return Math.floor(20000 + Math.random() * 20000); // 20-40s
    }
  }

  canReactNow(forced = false) {
    if (forced) return true;
    const now = Date.now();
    const metrics = this.getPersonalityMetrics();
    const cooldown = this.getCooldownMs(metrics.stage);
    return now - this.lastReactionTime >= cooldown;
  }

  // Record user interactions
  recordAction(actionType, detail = '') {
    const now = Date.now();

    if (actionType === 'rapid_click') {
      this.memory.rapidClickIncidents += 1;
      if (this.canReactNow()) {
        const reaction = this.getRapidClickReaction(this.memory.rapidClickIncidents);
        if (reaction) this.dispatch(reaction);
      }
    } else if (actionType === 'verification_escape') {
      this.memory.verifyAttempts += 1;
      if (this.canReactNow()) {
        const reaction = this.getVerificationReaction(this.memory.verifyAttempts);
        if (reaction) this.dispatch(reaction);
      }
    } else if (actionType === 'window_close_attempt') {
      this.memory.windowCloseAttempts += 1;
      if (this.canReactNow()) {
        const reaction = this.getWindowCloseReaction(this.memory.windowCloseAttempts);
        if (reaction) this.dispatch(reaction);
      }
    } else if (actionType === 'file_access') {
      const id = detail || 'unknown';
      this.memory.fileAttempts[id] = (this.memory.fileAttempts[id] || 0) + 1;
      if (this.memory.fileAttempts[id] >= 2 && this.canReactNow()) {
        const reaction = this.getFileAccessReaction(this.memory.fileAttempts[id]);
        if (reaction) this.dispatch(reaction);
      }
    } else if (actionType === 'terminal_exit') {
      this.memory.terminalExitAttempts += 1;
      if (this.canReactNow()) {
        const reaction = this.getTerminalExitReaction(this.memory.terminalExitAttempts);
        if (reaction) this.dispatch(reaction);
      }
    } else if (actionType === 'optical_reaction') {
      this.memory.opticalReactions += 1;
      if (this.canReactNow()) {
        this.dispatch({
          text: 'OPTICAL SENSOR: Reaction detected. Interesting.',
          title: 'OPTICAL TELEMETRY',
          type: REACTION_TYPES.NOTIFICATION,
          severity: 'medium',
          duration: 3500,
        });
      }
    }
  }

  getRapidClickReaction(count) {
    const metrics = this.getPersonalityMetrics();
    let text = 'Excessive clicking detected.';
    if (count >= 3 || metrics.stage === PERSONALITY_STAGES.ABSOLUTE_RAGE) {
      text = 'You are clicking with considerable confidence.';
    } else if (count >= 2 || metrics.stage === PERSONALITY_STAGES.ANGRY) {
      text = 'Clicking faster will not improve the situation.';
    }

    return {
      text,
      title: 'RAGEWARE OBSERVATION',
      type: REACTION_TYPES.NOTIFICATION,
      severity: 'medium',
      duration: 3800,
    };
  }

  getVerificationReaction(count) {
    let text = `Verification attempt #${count}.`;
    if (count >= 4) {
      text = 'You seem unusually committed to verification.';
    } else if (count >= 2) {
      text = 'You really want that button, don\'t you?';
    }

    return {
      text,
      title: 'SECURITY SUBSYSTEM',
      type: REACTION_TYPES.NOTIFICATION,
      severity: 'medium',
      duration: 3600,
    };
  }

  getWindowCloseReaction(count) {
    const metrics = this.getPersonalityMetrics();
    let text = 'WINDOW TERMINATION REQUEST DETECTED.';
    if (metrics.stage === PERSONALITY_STAGES.ABSOLUTE_RAGE || count >= 4) {
      text = 'RAGEWARE has noticed your escape attempts.';
    } else if (metrics.stage === PERSONALITY_STAGES.ANGRY || count >= 2) {
      text = 'You keep trying to leave.';
    } else if (metrics.stage === PERSONALITY_STAGES.FRUSTRATED) {
      text = 'We noticed you trying to close this window.';
    }

    return {
      text,
      title: 'COMPOSITOR ADVISORY',
      type: REACTION_TYPES.NOTIFICATION,
      severity: 'medium',
      duration: 3800,
    };
  }

  getFileAccessReaction(count) {
    let text = 'You have opened this file before.';
    if (count >= 3) {
      text = 'Still looking for something?';
    }
    return {
      text,
      title: 'FILESYSTEM OBSERVER',
      type: REACTION_TYPES.NOTIFICATION,
      severity: 'low',
      duration: 3400,
    };
  }

  getTerminalExitReaction(count) {
    const metrics = this.getPersonalityMetrics();
    let text = 'EXIT REQUEST RECEIVED.';
    if (metrics.stage === PERSONALITY_STAGES.ABSOLUTE_RAGE || count >= 3) {
      text = 'Leaving appears to be your current objective.';
    } else if (count >= 2) {
      text = 'You seem very determined to leave.';
    }

    return {
      text,
      title: 'COMMAND.COM',
      type: REACTION_TYPES.NOTIFICATION,
      severity: 'medium',
      duration: 3500,
    };
  }

  // Contextual reaction when user succeeds
  getSuccessReaction() {
    this.memory.successCount += 1;
    if (!this.canReactNow()) return null;

    const metrics = this.getPersonalityMetrics();
    let text = 'ACTION COMPLETED.';
    let severity = 'low';

    switch (metrics.stage) {
      case PERSONALITY_STAGES.ABSOLUTE_RAGE:
        text = 'SUCCESS DETECTED.\nWe are mildly disappointed.';
        severity = 'high';
        break;
      case PERSONALITY_STAGES.ANGRY:
        text = 'Unexpected.\nYou succeeded.';
        severity = 'medium';
        break;
      case PERSONALITY_STAGES.FRUSTRATED:
        text = 'You actually got that one.';
        severity = 'low';
        break;
      case PERSONALITY_STAGES.ANNOYED:
        text = 'Well done.';
        severity = 'low';
        break;
      case PERSONALITY_STAGES.CALM:
      default:
        text = 'ACTION COMPLETED.';
        severity = 'low';
        break;
    }

    return {
      text,
      title: 'RAGEWARE EVALUATION',
      type: REACTION_TYPES.NOTIFICATION,
      severity,
      duration: 3200,
    };
  }

  // Contextual reaction when an interaction fails
  getFailureReaction(categoryKey) {
    this.memory.failureCount += 1;
    if (!this.canReactNow()) return null;

    const metrics = this.getPersonalityMetrics();
    let text = 'Action failed. Please try again.';
    let severity = 'medium';

    switch (metrics.stage) {
      case PERSONALITY_STAGES.ABSOLUTE_RAGE:
        if (metrics.primaryCategoryKey === categoryKey) {
          text = `PRIMARY FRUSTRATION VECTOR CONFIRMED:\n${metrics.primaryWeakness.toUpperCase()}`;
        } else {
          text = 'FAILURE PATTERN CONFIRMED.\nWE ARE LEARNING.';
        }
        severity = 'high';
        break;

      case PERSONALITY_STAGES.ANGRY:
        if (categoryKey === 'movingButtons') {
          text = 'That button was not supposed to be that difficult.';
        } else if (categoryKey === 'windowManipulation') {
          text = 'You keep doing that.';
        } else {
          text = 'You have now failed this interaction several times.';
        }
        severity = 'high';
        break;

      case PERSONALITY_STAGES.FRUSTRATED:
        if (categoryKey === 'movingButtons') {
          text = 'You are getting closer.\nTechnically.';
        } else if (categoryKey === 'fakeLoading') {
          text = 'Waiting appears to frustrate you.';
        } else {
          text = 'Another failed attempt recorded.';
        }
        severity = 'medium';
        break;

      case PERSONALITY_STAGES.ANNOYED:
        text = 'That didn\'t work.\nInteresting approach.';
        severity = 'low';
        break;

      case PERSONALITY_STAGES.CALM:
      default:
        text = 'Action failed.\nPlease try again.';
        severity = 'low';
        break;
    }

    return {
      text,
      title: 'RAGEWARE SYSTEM',
      type: REACTION_TYPES.NOTIFICATION,
      severity,
      duration: 3800,
    };
  }

  // Occasional weakness acknowledgment
  getWeaknessObservation() {
    const metrics = this.getPersonalityMetrics();
    if (metrics.stage === PERSONALITY_STAGES.CALM || metrics.stage === PERSONALITY_STAGES.ANNOYED) {
      return null;
    }

    let text = '';
    switch (metrics.primaryCategoryKey) {
      case 'movingButtons':
        text = metrics.stage === PERSONALITY_STAGES.ABSOLUTE_RAGE
          ? 'PRIMARY FRUSTRATION VECTOR: MOVING BUTTONS.'
          : 'You appear to dislike moving interface elements.';
        break;
      case 'windowManipulation':
        text = 'You seem unusually interested in closing windows.';
        break;
      case 'fakeLoading':
        text = 'Waiting appears to frustrate you.';
        break;
      case 'fileInteraction':
        text = 'Files appear to cause you unnecessary friction.';
        break;
      case 'terminalInteraction':
        text = 'Command directives seem challenging today.';
        break;
      default:
        text = 'User behavioral pattern identified.';
        break;
    }

    return {
      text,
      title: 'BEHAVIORAL PROFILER',
      type: REACTION_TYPES.NOTIFICATION,
      severity: metrics.stage === PERSONALITY_STAGES.ABSOLUTE_RAGE ? 'high' : 'medium',
      duration: 4000,
    };
  }

  // Terminal command snark generator
  getTerminalSnark(cmd) {
    const metrics = this.getPersonalityMetrics();
    const root = (cmd || '').trim().toLowerCase();

    if (metrics.stage === PERSONALITY_STAGES.CALM) return null;

    if (root === 'whoami') {
      if (metrics.stage === PERSONALITY_STAGES.ABSOLUTE_RAGE || metrics.stage === PERSONALITY_STAGES.ANGRY) {
        return 'USER\nUnfortunately.';
      }
      return 'USER: SUBJECT_049 // COGNITIVE RESILIENCE CANDIDATE';
    }

    if (root === 'rage') {
      return `Current rage level: ${metrics.rageLevel.toUpperCase()} (${metrics.rageScore}%)\nAwareness: ${metrics.awareness}%\nSarcasm: ${metrics.sarcasm}%\nHostility: ${metrics.hostility}%`;
    }

    if (root === 'status') {
      return `SYSTEM STATUS: OPERATIONAL\nOPERATOR COMPLIANCE: ${100 - metrics.rageScore}%\nOBSERVER STATUS: ${metrics.stage}`;
    }

    if (root === 'date') {
      if (metrics.stage === PERSONALITY_STAGES.ABSOLUTE_RAGE) {
        return 'Current time is of no consequence.\nThe benchmark continues.';
      }
    }

    return null;
  }

  /**
   * Progressive primary weakness reveal — Step 7.
   * Called periodically by Desktop.jsx based on event count.
   * Returns null at CALM, hints at ANNOYED+, reveals at ABSOLUTE_RAGE.
   */
  getWeaknessReveal() {
    if (!this.canReactNow()) return null;
    const metrics = this.getPersonalityMetrics();
    const stage = metrics.stage;
    const categoryKey = metrics.primaryCategoryKey;

    // Don't reveal until ANNOYED stage
    if (stage === PERSONALITY_STAGES.CALM) return null;

    const categoryLabels = {
      movingButtons: 'moving interface elements',
      fakeLoading: 'system delay sequences',
      windowManipulation: 'window management',
      fileInteraction: 'file system navigation',
      terminalInteraction: 'terminal interactions',
      precision: 'precision input tasks',
      timing: 'timing-based challenges',
    };
    const categoryDisplay = categoryLabels[categoryKey] || 'interface interactions';

    let text;
    let severity;

    if (stage === PERSONALITY_STAGES.ABSOLUTE_RAGE) {
      text = `PRIMARY FRUSTRATION VECTOR IDENTIFIED.\nCategory: ${(metrics.primaryWeakness || categoryDisplay).toUpperCase()}\nAdaptive friction profile updated.`;
      severity = 'high';
    } else if (stage === PERSONALITY_STAGES.ANGRY) {
      text = `That appears to be a pattern.\nYour responses to ${categoryDisplay} have been noted.`;
      severity = 'medium';
    } else if (stage === PERSONALITY_STAGES.FRUSTRATED) {
      text = `You seem to struggle with that.\nWe find this interesting.`;
      severity = 'medium';
    } else {
      // ANNOYED
      text = 'Interesting.';
      severity = 'low';
    }

    return {
      text,
      title: 'USER ANALYSIS',
      type: REACTION_TYPES.NOTIFICATION,
      severity,
      duration: severity === 'high' ? 5000 : 3500,
    };
  }

  /**
   * Personality reaction synchronized with a specific ragebait event outcome.
   * Called by Desktop.jsx subscriber after a major event fires.
   * eventType: one of RAGEBAIT_EVENT_TYPES values
   * outcome: 'fired' | 'dismissed' | 'completed'
   */
  getEventSyncReaction(eventCategory) {
    if (!this.canReactNow()) return null;
    const metrics = this.getPersonalityMetrics();
    const stage = metrics.stage;

    // Only react meaningfully at ANNOYED stage+
    if (stage === PERSONALITY_STAGES.CALM) return null;

    const reactions = {
      fakeLoading: [
        'Another update failure recorded.',
        'The update process is very patient. Unlike some.',
        'Update cycle archived. No improvement detected.',
      ],
      movingButtons: [
        'Interface element evasion logged.',
        'Your cursor precision is being evaluated.',
        'The button was quite determined to avoid you.',
      ],
      windowManipulation: [
        'Window behavior anomaly recorded.',
        'That window has opinions.',
        'Close attempts tracked and archived.',
      ],
      fileInteraction: [
        'Filesystem access event logged.',
        'That file remains classified.',
        'File access patterns are being analyzed.',
      ],
      terminalInteraction: [
        'Command session behavior recorded.',
        'Persistence noted. Terminal is watching.',
        'Exit command intercepted. Session continues.',
      ],
      precision: [
        'Input precision metrics updated.',
        'System security acknowledged your attempt.',
        'Verification behavior archived.',
      ],
    };

    const options = reactions[eventCategory] || ['Event recorded.', 'Observation logged.'];
    const text = options[Math.floor(Math.random() * options.length)];

    return {
      text,
      title: 'RAGEWARE OBSERVATION',
      type: REACTION_TYPES.NOTIFICATION,
      severity: stage === PERSONALITY_STAGES.ABSOLUTE_RAGE ? 'medium' : 'low',
      duration: 3000,
    };
  }
}

export const osPersonalityInstance = new OSPersonalityEngine();
