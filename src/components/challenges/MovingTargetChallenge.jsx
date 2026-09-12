import React, { useState, useEffect, useRef } from 'react';
import { increaseRage, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';

export default function MovingTargetChallenge({ onComplete, onStateChange }) {
  const arenaRef = useRef(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50, isPercent: true });
  const [isHitAnim, setIsHitAnim] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const moveTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const REQUIRED_HITS = 3;

  const moveTarget = () => {
    if (isCompleted || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const size = 64;
    const maxX = Math.max(10, rect.width - size - 10);
    const maxY = Math.max(10, rect.height - size - 10);

    const newX = Math.floor(Math.random() * maxX);
    const newY = Math.floor(Math.random() * maxY);

    setTargetPos({ x: newX, y: newY, isPercent: false });
  };

  useEffect(() => {
    // Relocate target periodically
    moveTimerRef.current = setInterval(moveTarget, 850);

    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isCompleted]);

  // Miss handler: user clicked the arena but missed the target
  const handleArenaClick = (e) => {
    if (isCompleted) return;
    setMisses((prev) => prev + 1);
    increaseRage(6, RAGE_EVENTS.BUTTON_MISS);
    if (onStateChange) onStateChange();
  };

  // Hit handler: user hit the target
  const handleTargetClick = (e) => {
    e.stopPropagation(); // prevent arena miss click
    if (isCompleted) return;

    const nextHits = hits + 1;
    setHits(nextHits);
    setIsHitAnim(true);
    setTimeout(() => setIsHitAnim(false), 300);

    if (nextHits >= REQUIRED_HITS) {
      setIsCompleted(true);
      if (moveTimerRef.current) clearInterval(moveTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      recordSuccess();
      if (onStateChange) onStateChange();

      setTimeout(() => {
        onComplete();
      }, 1200);
    } else {
      // Reposition instantly on hit to keep tempo
      moveTarget();
    }
  };

  return (
    <div className="challenge-body" id="moving-target-challenge">
      <div className="challenge-subhead">
        <span className="mission-tag">MISSION 03</span>
        <h2 className="mission-title">HIT THE TARGET</h2>
        <div className="mission-tracker">
          <span className="tracker-pill">HITS: <strong id="target-hits">{hits}</strong> / {REQUIRED_HITS}</span>
          <span className="tracker-pill">MISSES: <strong id="target-misses">{misses}</strong></span>
          <span className="tracker-pill mono">TIME: <strong>{timeLeft}s</strong></span>
        </div>
      </div>

      <div 
        ref={arenaRef} 
        className="interactive-arena target-arena"
        onClick={handleArenaClick}
      >
        <div className="arena-grid-lines" />

        <div
          id="active-moving-target"
          className={`moving-target-reticle ${isHitAnim ? 'hit-pulse' : ''} ${isCompleted ? 'target-neutralized' : ''}`}
          style={
            targetPos.isPercent
              ? { left: `${targetPos.x}%`, top: `${targetPos.y}%`, transform: 'translate(-50%, -50%)' }
              : { left: `${targetPos.x}px`, top: `${targetPos.y}px` }
          }
          onClick={handleTargetClick}
          title="Click to strike"
        >
          <div className="reticle-ring" />
          <div className="reticle-dot" />
          <span className="target-label mono">{isCompleted ? 'CLEAR' : 'TARGET'}</span>
        </div>

        {isCompleted && (
          <div className="target-overlay-complete mono">
            ✓ TARGETS NEUTRALIZED. PRECISION VERIFIED.
          </div>
        )}
      </div>

      <div className="challenge-caption">
        * Reticle trajectory perturbed by simulated atmospheric instability.
      </div>
    </div>
  );
}
