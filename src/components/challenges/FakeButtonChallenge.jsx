import React, { useState } from 'react';
import { recordFailure, recordSuccess, RAGE_EVENTS } from '../../engine/rageEngine';

const BUTTON_OPTIONS = [
  { id: 'accept', label: '[ ACCEPT ]' },
  { id: 'continue', label: '[ CONTINUE ]' },
  { id: 'confirm', label: '[ CONFIRM ]' },
  { id: 'proceed', label: '[ PROCEED ]' },
  { id: 'execute', label: '[ EXECUTE ]' },
  { id: 'authenticate', label: '[ AUTHENTICATE ]' },
];

const SNARKY_FEEDBACK = [
  'Wrong.',
  'Nice try.',
  'Why?',
  'Not that one.',
  'Almost.',
  'You were close.',
  'Error 403: Affirmation Denied.',
  'Semantic mismatch.',
];

export default function FakeButtonChallenge({ onComplete, onStateChange }) {
  // Fix correct button to index 2 initially ('[ CONFIRM ]')
  const [correctIndex, setCorrectIndex] = useState(2);
  const [feedback, setFeedback] = useState('ANALYZE BUTTON MORPHOLOGY BEFORE SELECTION');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shakeId, setShakeId] = useState(null);

  const handleButtonClick = (index, buttonObj) => {
    if (isSuccess) return;

    if (index === correctIndex) {
      setIsSuccess(true);
      setFeedback('CORRECT AFFIRMATION ACCEPTED! PROTOCOL UNLOCKED.');
      recordSuccess();
      if (onStateChange) onStateChange();

      setTimeout(() => {
        onComplete();
      }, 1300);
    } else {
      const nextFailures = failedAttempts + 1;
      setFailedAttempts(nextFailures);

      // Select random snarky feedback
      const randomMsg = SNARKY_FEEDBACK[Math.floor(Math.random() * SNARKY_FEEDBACK.length)];
      setFeedback(`${randomMsg} (${buttonObj.label} failed)`);

      // Trigger button shake animation
      setShakeId(buttonObj.id);
      setTimeout(() => setShakeId(null), 400);

      // Record failure in rage engine
      recordFailure(RAGE_EVENTS.INCORRECT_ACTION);
      if (onStateChange) onStateChange();

      // If user has failed 4 times, hint or reshuffle to prevent deadlocks
      if (nextFailures % 4 === 0) {
        const newTarget = (correctIndex + 1) % BUTTON_OPTIONS.length;
        setCorrectIndex(newTarget);
        setFeedback('SYSTEM ROTATED TARGET KEY // RECALCULATE');
      }
    }
  };

  return (
    <div className="challenge-body" id="fake-buttons-challenge">
      <div className="challenge-subhead">
        <span className="mission-tag">MISSION 04</span>
        <h2 className="mission-title">SELECT THE CORRECT BUTTON</h2>
        <div className="mission-tracker">
          <span className="tracker-pill">ATTEMPTS: <strong id="fake-btn-attempts">{failedAttempts}</strong></span>
          <span className={`tracker-status ${isSuccess ? 'success' : 'error'}`}>
            {feedback}
          </span>
        </div>
      </div>

      <div className="interactive-arena fake-buttons-arena">
        <div className="fake-buttons-matrix">
          {BUTTON_OPTIONS.map((btn, index) => {
            const isTarget = isSuccess && index === correctIndex;
            const isShaking = shakeId === btn.id;

            return (
              <button
                key={btn.id}
                id={`fake-btn-${btn.id}`}
                className={`btn-fake-option ${isTarget ? 'option-success' : ''} ${isShaking ? 'option-shake' : ''}`}
                onClick={() => handleButtonClick(index, btn)}
              >
                {isTarget ? '✓ VERIFIED' : btn.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="challenge-caption">
        * Semantic buttons utilize identical design tokens to suppress clarity.
      </div>
    </div>
  );
}
