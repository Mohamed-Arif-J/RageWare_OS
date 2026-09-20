/**
 * RAGEWARE OS — Global Mouse Behavior Tracker Service
 * 
 * Provides high-precision tracking of user input ergonomics:
 * - Velocity & Acceleration (px/ms)
 * - Direction reversal count & Erratic Mouse Shaking
 * - Global Click Rate & Rapid Rage Clicking
 * - Distance Traveled & Inactivity detection
 * - Direct telemetry feeding to RageEngine & System Diagnostics
 */

import { increaseRage, RAGE_EVENTS, isEngineSafeMode } from '../engine/rageEngine';
import { osPersonalityInstance } from '../engine/osPersonality';

class MouseTracker {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.lastMoveTime = Date.now();
    this.speed = 0; // px/ms
    this.smoothSpeed = 0;

    // Movement history buffer for shake detection
    this.moveHistory = []; // { x, y, dx, dy, time, speed }
    this.isShaking = false;
    this.shakeScore = 0; // 0 - 100%
    this.lastShakeTime = 0;
    this.shakeCooldownUntil = 0;

    // Click tracking buffer
    this.clickHistory = []; // timestamps
    this.totalClicks = 0;
    this.totalDistance = 0;
    this.clickCooldownUntil = 0;

    this.listeners = new Set();
    this.isInitialized = false;

    // Bound handlers
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    window.addEventListener('mousedown', this.handleMouseDown, { passive: true });

    // Background decay loop for speed and shake score
    this.decayInterval = setInterval(() => {
      const now = Date.now();
      if (now - this.lastMoveTime > 120) {
        this.speed = 0;
        this.smoothSpeed = Math.max(0, this.smoothSpeed * 0.7);
      }
      if (now > this.lastShakeTime + 600) {
        this.isShaking = false;
        this.shakeScore = Math.max(0, this.shakeScore - 15);
      }
    }, 150);
  }

  destroy() {
    if (!this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = false;

    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mousedown', this.handleMouseDown);
    if (this.decayInterval) clearInterval(this.decayInterval);
  }

  handleMouseMove(e) {
    const now = Date.now();
    const dt = Math.max(1, now - this.lastMoveTime);
    const dx = e.clientX - this.x;
    const dy = e.clientY - this.y;
    const dist = Math.hypot(dx, dy);

    this.lastX = this.x;
    this.lastY = this.y;
    this.x = e.clientX;
    this.y = e.clientY;
    this.lastMoveTime = now;
    this.totalDistance += dist;

    // Instantaneous speed (px / ms)
    const instantSpeed = dist / dt;
    this.speed = Math.round(instantSpeed * 100) / 100;
    this.smoothSpeed = Math.round((this.smoothSpeed * 0.7 + instantSpeed * 0.3) * 100) / 100;

    // Add to movement history
    this.moveHistory.push({ dx, dy, time: now, speed: instantSpeed });
    if (this.moveHistory.length > 25) this.moveHistory.shift();

    // Erratic mouse shaking detection:
    // Count rapid sign changes in dx and dy within last 420ms at speed > 0.55 px/ms
    const recentMoves = this.moveHistory.filter((m) => now - m.time <= 420 && Math.abs(m.dx) > 6);
    let reversals = 0;
    for (let i = 1; i < recentMoves.length; i++) {
      if (Math.sign(recentMoves[i].dx) !== Math.sign(recentMoves[i - 1].dx)) {
        reversals++;
      }
    }

    if (reversals >= 4 && this.smoothSpeed > 0.55) {
      this.isShaking = true;
      this.lastShakeTime = now;
      this.shakeScore = Math.min(100, Math.round(reversals * 15 + this.smoothSpeed * 20));

      // Trigger Rage Engine event if not in cooldown and not Safe Mode
      if (!isEngineSafeMode() && now > this.shakeCooldownUntil) {
        this.shakeCooldownUntil = now + 4000; // 4s cooldown
        increaseRage(6, RAGE_EVENTS.ERRATIC_MOUSE);
        osPersonalityInstance.recordAction('mouse_shake');
        this.notify('shake', { reversals, speed: this.smoothSpeed, shakeScore: this.shakeScore });
      }
    }
  }

  handleMouseDown() {
    const now = Date.now();
    this.totalClicks += 1;
    this.clickHistory.push(now);

    // Keep only last 3 seconds of clicks
    this.clickHistory = this.clickHistory.filter((t) => now - t <= 3000);

    // Rapid clicking / Rage clicking: >= 4 clicks within 900ms
    const burstClicks = this.clickHistory.filter((t) => now - t <= 900);
    if (burstClicks.length >= 4) {
      if (!isEngineSafeMode() && now > this.clickCooldownUntil) {
        this.clickCooldownUntil = now + 3500; // 3.5s cooldown
        increaseRage(8, RAGE_EVENTS.RAPID_CLICKING);
        osPersonalityInstance.recordAction('rapid_click');
        this.notify('rapid_click', { count: burstClicks.length });
      }
    }
  }

  getTelemetry() {
    const now = Date.now();
    const recentClicks = this.clickHistory.filter((t) => now - t <= 1000).length;
    return {
      x: this.x,
      y: this.y,
      speed: this.speed,
      smoothSpeed: this.smoothSpeed,
      isShaking: this.isShaking,
      shakeScore: this.shakeScore,
      clickRate: recentClicks, // clicks / sec
      totalClicks: this.totalClicks,
      totalDistance: Math.round(this.totalDistance),
      lastShakeTime: this.lastShakeTime,
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(type, data) {
    for (const listener of this.listeners) {
      try {
        listener(type, data);
      } catch (e) {
        console.error('mouseTracker listener error:', e);
      }
    }
  }
}

export const mouseTracker = new MouseTracker();
