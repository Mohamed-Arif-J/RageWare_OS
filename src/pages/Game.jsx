import React, { useState, useEffect } from 'react';
import RageMeter from '../components/RageMeter';
import ChallengePanel from '../components/ChallengePanel';
import CameraPanel from '../components/CameraPanel';

// Challenges
import EscapingButtonChallenge from '../components/challenges/EscapingButtonChallenge';
import FakeLoadingChallenge from '../components/challenges/FakeLoadingChallenge';
import MovingTargetChallenge from '../components/challenges/MovingTargetChallenge';
import FakeButtonChallenge from '../components/challenges/FakeButtonChallenge';

// Engines & Utils
import { 
  getRageProfile, 
  increaseRage, 
  recordFailure, 
  recordSuccess, 
  resetSession, 
  RAGE_EVENTS 
} from '../engine/rageEngine';
import { 
  CHALLENGE_REGISTRY, 
  getTotalChallenges, 
  getNextChallengeIndex 
} from '../engine/challengeEngine';
import { formatScore, formatTime } from '../utils';

export default function Game() {
  const [profile, setProfile] = useState(() => getRageProfile());
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [allComplete, setAllComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const syncProfile = () => {
    setProfile(getRageProfile());
  };

  const handleChallengeComplete = () => {
    const nextIdx = getNextChallengeIndex(currentChallengeIdx);
    syncProfile();

    if (nextIdx === -1) {
      setAllComplete(true);
    } else {
      setCurrentChallengeIdx(nextIdx);
    }
  };

  const handleResetAll = () => {
    resetSession();
    setCurrentChallengeIdx(0);
    setAllComplete(false);
    setElapsedSeconds(0);
    syncProfile();
  };

  const totalChallenges = getTotalChallenges();
  const currentChallengeMeta = CHALLENGE_REGISTRY[currentChallengeIdx] || CHALLENGE_REGISTRY[0];

  const renderActiveChallenge = () => {
    if (allComplete) {
      return (
        <div className="all-complete-banner" id="all-complete-view">
          <div className="mission-tag">BENCHMARK COMPLETE</div>
          <h2 className="all-complete-title">PATIENCE THRESHOLD EXHAUSTED</h2>
          <p className="all-complete-desc">
            You endured all four psychological friction vectors. Your highest vulnerability vector was <strong>{profile.strongestCategory}</strong> with a final biometric rage level of <strong>{profile.level} ({profile.rageScore}%)</strong>.
          </p>
          <button 
            id="btn-restart-benchmark"
            className="btn-primary" 
            style={{ marginTop: '1rem' }}
            onClick={handleResetAll}
          >
            RESTART PATIENCE TEST &orarr;
          </button>
        </div>
      );
    }

    switch (currentChallengeIdx) {
      case 0:
        return (
          <EscapingButtonChallenge 
            key="ch-0"
            onComplete={handleChallengeComplete}
            onStateChange={syncProfile}
          />
        );
      case 1:
        return (
          <FakeLoadingChallenge 
            key="ch-1"
            onComplete={handleChallengeComplete}
            onStateChange={syncProfile}
          />
        );
      case 2:
        return (
          <MovingTargetChallenge 
            key="ch-2"
            onComplete={handleChallengeComplete}
            onStateChange={syncProfile}
          />
        );
      case 3:
        return (
          <FakeButtonChallenge 
            key="ch-3"
            onComplete={handleChallengeComplete}
            onStateChange={syncProfile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="game-page" id="game-view">
      {/* Telemetry / Status Bar */}
      <div className="game-stats-bar">
        <div className="stat-item">
          <span className="stat-title">SCORE</span>
          <span className="stat-val cyan" id="stat-score">{formatScore(profile.successfulChallenges * 50)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-title">ATTEMPTS</span>
          <span className="stat-val" id="stat-attempts">{profile.totalAttempts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-title">SESSION TIME</span>
          <span className="stat-val mono" id="stat-time">{formatTime(elapsedSeconds)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-title">CHALLENGE</span>
          <span className="stat-val accent" id="stat-challenge-num">
            {allComplete ? 'COMPLETE' : `0${currentChallengeIdx + 1} / 0${totalChallenges}`}
          </span>
        </div>
      </div>

      {/* Main Grid: Challenge & Rage on Left, Hardware Telemetry on Right */}
      <div className="game-grid">
        <div className="game-main-col">
          {/* Biometric Rage Meter */}
          <RageMeter 
            rageLevel={profile.rageScore} 
            status={profile.level} 
          />

          {/* Current Challenge Container */}
          <ChallengePanel 
            challengeIndex={currentChallengeIdx}
            totalChallenges={totalChallenges}
            missionNumber={currentChallengeMeta.missionNumber}
          >
            {renderActiveChallenge()}
          </ChallengePanel>
        </div>

        <div className="game-side-col">
          {/* Hardware & Vision Tracking Telemetry */}
          <CameraPanel />
        </div>
      </div>

      {/* Developer / Debug Controls (Step 2 & 3 Verification Harness) */}
      <div className="debug-panel" id="rage-engine-debug">
        <div className="debug-header">
          <span className="debug-title">// RAGE ENGINE & CHALLENGE HARNESS</span>
          <span className="debug-badge">STEP 3 ACTIVE</span>
        </div>

        <div className="debug-metrics-grid">
          <div className="debug-stat-box">
            <div className="debug-stat-label">RAGE SCORE</div>
            <div className="debug-stat-val cyan" id="debug-val-rage-score">{profile.rageScore} / 100</div>
          </div>
          <div className="debug-stat-box">
            <div className="debug-stat-label">RAGE LEVEL</div>
            <div className="debug-stat-val accent" id="debug-val-rage-level">{profile.level}</div>
          </div>
          <div className="debug-stat-box">
            <div className="debug-stat-label">ATTEMPTS</div>
            <div className="debug-stat-val" id="debug-val-attempts">{profile.totalAttempts}</div>
          </div>
          <div className="debug-stat-box">
            <div className="debug-stat-label">SUCCESSFUL</div>
            <div className="debug-stat-val success" id="debug-val-successful">{profile.successfulChallenges}</div>
          </div>
          <div className="debug-stat-box">
            <div className="debug-stat-label">FAILED</div>
            <div className="debug-stat-val danger" id="debug-val-failed">{profile.failedChallenges}</div>
          </div>
          <div className="debug-stat-box">
            <div className="debug-stat-label">STRONGEST RAGEBAIT</div>
            <div className="debug-stat-val mono" id="debug-val-strongest">{profile.strongestCategory}</div>
          </div>
        </div>

        <div className="debug-buttons-row">
          <button 
            id="debug-btn-add10"
            className="btn-debug amber" 
            onClick={() => { increaseRage(10, 'manual'); syncProfile(); }}
          >
            +10 RAGE
          </button>
          <button 
            id="debug-btn-add20"
            className="btn-debug amber" 
            onClick={() => { increaseRage(20, 'manual'); syncProfile(); }}
          >
            +20 RAGE
          </button>
          <button 
            id="debug-btn-skip-next"
            className="btn-debug" 
            onClick={handleChallengeComplete}
          >
            SKIP TO NEXT MISSION &rarr;
          </button>
          <button 
            id="debug-btn-record-failure"
            className="btn-debug danger" 
            onClick={() => { recordFailure(RAGE_EVENTS.INCORRECT_ACTION); syncProfile(); }}
          >
            RECORD FAILURE
          </button>
          <button 
            id="debug-btn-record-success"
            className="btn-debug success" 
            onClick={() => { recordSuccess(); syncProfile(); }}
          >
            RECORD SUCCESS
          </button>
          <button 
            id="debug-btn-reset"
            className="btn-debug" 
            onClick={handleResetAll}
          >
            RESET SESSION
          </button>
        </div>
      </div>
    </div>
  );
}
